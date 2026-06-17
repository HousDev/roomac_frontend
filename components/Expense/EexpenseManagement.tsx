import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  getExpenses,
  getExpenseStats,
  createExpense,
  updateExpense,
  deleteExpense,
  addExpensePayment,
  getExpensePayments,
  getBankNames,
} from "@/lib/expenseApi";
import { getAllStaff } from "@/lib/staffApi";
import { listProperties } from "@/lib/propertyApi";
import { consumeMasters, getMasterItemsByTab, getMasterValues } from "@/lib/masterApi";
import { getPurchases } from "@/lib/materialPurchaseApi";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { useAuth } from "@/context/authContext";
import { getSubcategoriesByCategory } from "@/lib/categorySubcategoryMapApi";
/* ─── tiny helpers ─────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 });
// Update the fmtDate helper function at the top
const fmtDate = (d: string) => {
  if (!d) return "—";
  
  // If the date is in YYYY-MM-DD format, display it directly without conversion
  if (d.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = d.split('-');
    // Create date in local timezone to prevent shifting
    return `${parseInt(day)} ${new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString("en-IN", {
      month: "short"
    })} ${year}`;
  }
  
  // Handle ISO string - extract just the date part
  if (d.includes('T')) {
    const datePart = d.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${parseInt(day)} ${new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString("en-IN", {
      month: "short"
    })} ${year}`;
  }
  
  // Fallback for other formats
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const fmtDateTime = (d: string) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const catColors: Record<string, { bg: string; text: string; dot: string }> = {
  Maintenance: { bg: "#FFF3E0", text: "#C05600", dot: "#FF6D00" },
  Utilities: { bg: "#E3F2FD", text: "#0D47A1", dot: "#1E88E5" },
  Groceries: { bg: "#E8F5E9", text: "#1B5E20", dot: "#43A047" },
  Salary: { bg: "#F3E5F5", text: "#4A148C", dot: "#8E24AA" },
  Internet: { bg: "#E0F7FA", text: "#006064", dot: "#00ACC1" },
  Furniture: { bg: "#FFF8E1", text: "#E65100", dot: "#FFB300" },
  Cleaning: { bg: "#FCE4EC", text: "#880E4F", dot: "#E91E63" },
  Security: { bg: "#E8EAF6", text: "#1A237E", dot: "#3F51B5" },
  Other: { bg: "#ECEFF1", text: "#37474F", dot: "#78909C" },
};
const getCatColor = (cat: string) => catColors[cat] || catColors.Other;

const newItem = () => ({
  id: Date.now() + Math.random(),
  name: "",
  category: "Groceries",
  qty: "" as any,
  price: "" as any,
  total_amount: 0,
});

const blankForm = () => ({
  property_id: "",
  property_name: "",
  category_id: "",
  category_name: "",
  sub_category_id: "",     
  sub_category_name: "",
  total_amount: "",
  vendor_name: "",
  payment_mode: null,
  expense_date: new Date().toISOString().split("T")[0],
  added_by_name: "",
  notes: "",
  items: [{
    id: Date.now() + Math.random(),
    name: "",
    category: "",
    qty: "",
    price: "",
    total_amount: 0,
  }],
});
/* ─── SearchableDropdown ───────────────────────────────────────────────────── */
function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  labelKey = "name",
  valueKey = "id",
  error,
}: {
  options: any[];
  value: string;
  onChange: (val: string, option: any) => void;
  placeholder: string;
  labelKey?: string;
  valueKey?: string;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => String(o[valueKey]) === String(value));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(
    () =>
      options.filter((o) =>
        String(o[labelKey]).toLowerCase().includes(search.toLowerCase())
      ),
    [options, search, labelKey]
  );

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setSearch("");
        }}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: `1.5px solid ${error ? "#FC8181" : "#E2E8F4"}`,
          borderRadius: 10,
          fontSize: 13,
          color: selected ? "#1A2B6D" : "#B0BAC9",
          background: error ? "#FFF5F5" : "#F8FAFF",
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selected ? selected[labelKey] : placeholder}
        </span>
        <svg
          width="12"
          height="12"
          fill="none"
          stroke="#8892A4"
          strokeWidth="2"
          viewBox="0 0 24 24"
          style={{ flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1.5px solid #E2E8F4",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 9999,
            maxHeight: 240,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{ padding: "8px 10px", borderBottom: "1px solid #F0F3FA" }}
          >
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              style={{
                width: "100%",
                padding: "7px 10px",
                border: "1.5px solid #E2E8F4",
                borderRadius: 8,
                fontSize: 12,
                outline: "none",
                background: "#F8FAFF",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "12px",
                  textAlign: "center",
                  fontSize: 12,
                  color: "#B0BAC9",
                }}
              >
                No results
              </div>
            ) : (
              filtered.map((o) => (
                <div
                  key={o[valueKey]}
                  onClick={() => {
                    onChange(String(o[valueKey]), o);
                    setOpen(false);
                  }}
                  style={{
                    padding: "9px 14px",
                    fontSize: 13,
                    cursor: "pointer",
                    background:
                      String(o[valueKey]) === String(value)
                        ? "#EEF1FB"
                        : "transparent",
                    color: "#374151",
                    fontWeight:
                      String(o[valueKey]) === String(value) ? 600 : 400,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F8FAFF")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      String(o[valueKey]) === String(value)
                        ? "#EEF1FB"
                        : "transparent")
                  }
                >
                  {o[labelKey]}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Receipt Thumbnail Component ────────────────────────────────────────── */
const ReceiptThumbnail = ({
  url,
  filename,
  onClick,
}: {
  url: string;
  filename?: string;
  onClick: () => void;
}) => {
  const [error, setError] = useState(false);
  const isPdf =
    filename?.toLowerCase().endsWith(".pdf") ||
    url?.toLowerCase().includes(".pdf");

  return (
    <div
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        overflow: "hidden",
        border: "1px solid #E2E8F4",
        cursor: "pointer",
        background: "#F8FAFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3B5BDB")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E2E8F4")}
    >
      {!error && !isPdf ? (
        <img
          src={url}
          alt="receipt"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setError(true)}
        />
      ) : isPdf ? (
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="#E53E3E"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="#8892A4"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="2" y="2" width="20" height="20" rx="2.18" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      )}
    </div>
  );
};

/* ─── Main Component ────────────────────────────────────────────────────────── */
export default function ExpensesManagement() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Master data
  const [properties, setProperties] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);

  // Stats
  const [stats, setStats] = useState<any>({});

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [viewItem, setViewItem] = useState<any | null>(null);

  // Form
  const [form, setForm] = useState(blankForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<Record<string, any>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const isInitializingEdit = useRef(false);

const [vendors, setVendors] = useState<any[]>([]);
  // Filters

const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
const [filterMonth, setFilterMonth] = useState("");
const [filterFromDate, setFilterFromDate] = useState("");
const [ignoreDateFilters, setIgnoreDateFilters] = useState(false);
const [filterToDate, setFilterToDate] = useState("");
const [filterSubCat, setFilterSubCat] = useState("All");
const [filterVendor, setFilterVendor] = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterProp, setFilterProp] = useState("All");
  const [filterPaymentMode, setFilterPaymentMode] = useState("All");
  const [colSearch, setColSearch] = useState({
  property: "", category: "", vendor: "", status: "", addedBy: "", amount: "", paidBy: "", expenseDate: ""
});
const [bulkSelected, setBulkSelected] = useState<Set<number>>(new Set());
const [selectAll, setSelectAll] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  // Add with other state declarations
const [bankNames, setBankNames] = useState<Array<{ id: number; name: string }>>([]);

const [showCustomBankInput, setShowCustomBankInput] = useState(false);
const [subCategories, setSubCategories] = useState<any[]>([]);
const [dynamicSubCategories, setDynamicSubCategories] = useState<any[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState<number | "All">(10);
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    expense: any | null;
  }>({
    open: false,
    expense: null,
  });
    // Add these states for payment history
  const [paymentTransactions, setPaymentTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Auth
  const { can, user } = useAuth();

  /* ── Load master data once ─────────────────────────────────────────────── */
  const loadMasterData = useCallback(async () => {
    try {
      const propRes = await listProperties({ is_active: true });
      const propList =
        propRes?.data?.data ||
        propRes?.data ||
        (propRes as any)?.results ||
        [];
      setProperties(
        (Array.isArray(propList) ? propList : Object.values(propList)).map(
          (p: any) => ({ id: String(p.id), name: p.name })
        )
      );
    } catch {}

    // Vendors from masters
try {
  const tabRes = await getMasterItemsByTab("Common");
  const tabList = Array.isArray(tabRes.data) ? tabRes.data : [];
  console.log("TAB ITEMS:", tabList.map((i:any) => i.name)); // ADD THIS

  const vendorItem = tabList.find(
    (i: any) => i.name?.toLowerCase().replace(/\s+/g, "") === "vendors"
  );
  if (vendorItem) {
    const valRes = await getMasterValues(vendorItem.id);
    const vals = Array.isArray(valRes.data) ? valRes.data : [];
    setVendors(
      vals.filter((v: any) => v.isactive === 1)
        .map((v: any) => ({ id: String(v.id), name: v.name || "" }))
    );
  }
} catch {}

// Payment Methods from masters
try {
  const tabRes = await getMasterItemsByTab("Common");
  const tabList = Array.isArray(tabRes.data) ? tabRes.data : [];
  const paymentMethodItem = tabList.find(
    (i: any) => i.name?.toLowerCase().replace(/\s+/g, "") === "paymentmethod"
  );
  if (paymentMethodItem) {
    const valRes = await getMasterValues(paymentMethodItem.id);
    const vals = Array.isArray(valRes.data) ? valRes.data : [];
    setPaymentMethods(
      vals.filter((v: any) => v.isactive === 1)
        .map((v: any) => ({ id: String(v.id), name: v.name || v.value || "" }))
    );
    console.log("✅ Payment Methods loaded:", paymentMethods);
  }
} catch (err) {
  console.error("Failed to load payment methods:", err);
}

   try {
  const { getAllMappings } = await import("@/lib/categorySubcategoryMapApi");
  const res = await getAllMappings();
  const mappings = res?.data || [];
  
  // Get unique categories from mappings
  const uniqueCategories = Object.values(
    mappings.reduce((acc: Record<string, any>, m: any) => {
      if (!acc[m.category_id]) {
        acc[m.category_id] = {
          id: m.category_id,
          name: m.category_name,
        };
      }
      return acc;
    }, {})
  );
  
  setCategories(uniqueCategories as any[]);
  console.log("✅ Categories from mapping:", uniqueCategories);
  setSubCategories(mappings.map((m: any) => ({
    id: m.subcategory_id,
    name: m.subcategory_name,
    category_id: m.category_id,
    category_name: m.category_name
  })));

} catch (err) {
  console.error("Failed to load categories from mapping:", err);
}

    try {
      const purRes = await getPurchases();
      const all: string[] = [];
      (purRes.data || []).forEach((purchase: any) => {
        let items: any[] = [];
        if (purchase.purchase_items?.length) items = purchase.purchase_items;
        else if (purchase.items) {
          try {
            items =
              typeof purchase.items === "string"
                ? JSON.parse(purchase.items)
                : purchase.items;
          } catch {}
        }
        items.forEach((i: any) => {
          if (i.item_name) all.push(i.item_name);
        });
      });
      setPurchasedItems([...new Set(all)]);
    } catch {}
  }, []);

useEffect(() => {
  if (!form.category_name) {
    setDynamicSubCategories([]);
    return;
  }
  const fetchSubs = async () => {
    try {
      const res = await getSubcategoriesByCategory(form.category_name);
      console.log("✅ API response:", res);
      const subs = (res?.data || []).map((s: any) => ({
        id: String(s.subcategory_id),
        name: s.subcategory_name,
      }));
      console.log("📋 Mapped subcategories:", subs);
      setDynamicSubCategories(subs);
    } catch (err) {
      console.error("❌ Subcategory fetch error:", err);
    }
  };
  fetchSubs();
}, [form.category_name]);


// Fetch bank names from masters
useEffect(() => {
  const fetchBankNames = async () => {
    try {
      const response = await consumeMasters({ tab: "Common", type: "Bank Names" });
      if (response?.success && response.data) {
        const banks = response.data.map((item: any) => ({
          id: item.value_id || item.id,
          name: item.value_name || item.name || item.value
        }));
        setBankNames(banks);
        console.log("Bank names loaded:", banks);
      }
    } catch (error) {
      console.error("Error fetching bank names:", error);
    }
  };
  fetchBankNames();
}, []);


  /* ── Load expenses ─────────────────────────────────────────────────────── */
const loadExpenses = useCallback(async () => {
  setLoading(true);
  try {
    const [data, statsData] = await Promise.all([
      getExpenses(),
      getExpenseStats(),
    ]);
    setExpenses(data);
    setStats(statsData);
    console.log("Expenses reloaded:", data.length, "expenses"); // Debug log
  } catch (err: any) {
    toast.error(err.message || "Failed to load expenses");
  } finally {
    setLoading(false);
  }
}, []);
  // Add this function after loadExpenses
  const fetchPaymentTransactions = useCallback(async (expenseId: number) => {
    setLoadingTransactions(true);
    try {
      const response = await getExpensePayments(expenseId);
      setPaymentTransactions(response.data || []);
      console.log("Payment transactions loaded:", response.data);
    } catch (error) {
      console.error("Error fetching payment transactions:", error);
      setPaymentTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    loadMasterData();
    loadExpenses();
  }, []);

  // Set added_by_name from logged-in user
  useEffect(() => {
    if (user?.name && !form.added_by_name) {
      setForm((prev) => ({ ...prev, added_by_name: user.name }));
    }
  }, [user]);

  const openPaymentModal = (expense: any) => {
    setPaymentModal({ open: true, expense });
  };

  const closePaymentModal = () => {
    setPaymentModal({ open: false, expense: null });
  };

  /* ── Filtered list ─────────────────────────────────────────────────────── */
 const filtered = useMemo(() => expenses.filter((e) => {
  if (filterCat !== "All" && e.category_name !== filterCat) return false;
  if (filterSubCat !== "All" && e.sub_category_name !== filterSubCat) return false;
  if (filterStatus !== "All" && e.status !== filterStatus) return false;
  if (filterProp !== "All" && e.property_name !== filterProp) return false;
  if (filterVendor !== "All" && e.vendor_name !== filterVendor) return false;
  
  // ✅ Date filters – only apply if ignoreDateFilters is false
  if (!ignoreDateFilters) {
    if (filterMonth && !e.expense_date?.startsWith(filterMonth)) return false;
if (filterFromDate || filterToDate) {
  const rawDate = e.expense_date || "";
  const expDate = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
  if (filterFromDate && expDate < filterFromDate) return false;
  if (filterToDate && expDate > filterToDate) return false;
}
  }
  if (colSearch.property && !e.property_name?.toLowerCase().includes(colSearch.property.toLowerCase())) return false;
if (colSearch.category && !e.category_name?.toLowerCase().includes(colSearch.category.toLowerCase())) return false;
if (colSearch.vendor && !e.vendor_name?.toLowerCase().includes(colSearch.vendor.toLowerCase())) return false;
if (colSearch.status && !e.status?.toLowerCase().includes(colSearch.status.toLowerCase())) return false;
if (colSearch.addedBy && !e.added_by_name?.toLowerCase().includes(colSearch.addedBy.toLowerCase())) return false;
if (colSearch.amount && !String(e.total_amount || e.amount || "").includes(colSearch.amount)) return false;
if (colSearch.paidBy && !e.payment_mode?.toLowerCase().includes(colSearch.paidBy.toLowerCase())) return false;
if (colSearch.expenseDate) {
  const raw = e.expense_date || "";
  const formatted = fmtDate(raw).toLowerCase();
  const query = colSearch.expenseDate.toLowerCase();
  if (!raw.includes(query) && !formatted.includes(query)) return false;
}  if (search && ![e.category_name, e.vendor_name, e.added_by_name]
    .some((v) => v?.toLowerCase().includes(search.toLowerCase()))) return false;
  return true;
}), [expenses, filterCat, filterSubCat, filterStatus, filterProp, filterVendor, filterMonth, filterFromDate, filterToDate, search, ignoreDateFilters, colSearch]);



const paginatedItems = useMemo(() => {
  if (itemsPerPage === "All") return filtered;
  const start = (currentPage - 1) * (itemsPerPage as number);
  return filtered.slice(start, start + (itemsPerPage as number));
}, [filtered, currentPage, itemsPerPage]);

const totalPages = useMemo(() => {
  if (itemsPerPage === "All") return 1;
  return Math.ceil(filtered.length / (itemsPerPage as number));
}, [filtered, itemsPerPage]);


useEffect(() => {
  setCurrentPage(1);
}, [filterCat, filterSubCat, filterStatus, filterProp, filterVendor, filterMonth, filterFromDate, filterToDate, search, ignoreDateFilters, colSearch]);
  /* ── Items helpers ─────────────────────────────────────────────────────── */
  const setItems = (items: any[]) => setForm((f) => ({ ...f, items }));
  const addItem = () => {
    const newItemObj = {
      id: Date.now() + Math.random(),
      name: "",
      category: form.category_name || "",
      qty: "",
      price: "",
      total_amount: 0,
    };
    setItems([...form.items, newItemObj]);
  };
  const removeItem = (id: any) => {
    if (form.items.length > 1) setItems(form.items.filter((i: any) => i.id !== id));
  };
  const updateItem = (id: any, key: string, val: any) => {
    setItems(
      form.items.map((item: any) => {
        if (item.id === id) {
          const updatedItem = { ...item, [key]: val };
          
          if (key === 'qty' || key === 'price') {
            const qty = key === 'qty' ? Number(val) : Number(item.qty);
            const price = key === 'price' ? Number(val) : Number(item.price);
            updatedItem.total_amount = (qty || 0) * (price || 0);
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  /* ── Open / close modals ───────────────────────────────────────────────── */
  function openAdd() {
    const blank = blankForm();
    setForm({
      ...blank,
      added_by_name: user?.name || "",
    });
    setEditId(null);
    setErrors({});
    setReceiptFile(null);
    setReceiptPreview("");
setPaymentDetails({
    showOtherBank: false,
    showOtherBankCheque: false,
    showOtherGateway: false
  });
      setShowModal(true);
  }

function openEdit(exp: any) {
  const initialItems = exp.items?.length
    ? exp.items.map((i: any) => ({
        id: i.id || Math.random(),
        name: i.name || i.item_name,
        category: i.category || i.category_name || "",
        sub_category: i.sub_category || i.sub_category_name || "",
        qty: i.qty || i.quantity || "",
        price: i.price || i.unit_price || "",
        total_amount: i.total_amount || ((Number(i.qty) || 0) * (Number(i.price) || 0)),
      }))
    : [{
        id: Date.now() + Math.random(),
        name: "",
        category: exp.category_name || "Groceries",
        sub_category: exp.sub_category_name || "",
        qty: "",
        price: "",
        total_amount: 0,
      }];
    
  // FIX: Handle date correctly - extract just YYYY-MM-DD
  let expenseDate = exp.expense_date;
  if (expenseDate) {
    // If it's an ISO string, extract just the date part
    if (expenseDate.includes('T')) {
      expenseDate = expenseDate.split('T')[0];
    }
    // Ensure it's in YYYY-MM-DD format
    if (expenseDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Already in correct format, use as is
      expenseDate = expenseDate;
    } else {
      // Try to parse and format
      const date = new Date(expenseDate);
      expenseDate = date.toISOString().split('T')[0];
    }
  }
  
const matchedCategory = categories.find((c: any) => c.name === exp.category_name);
const resolvedCategoryId = matchedCategory 
  ? String(matchedCategory.id) 
  : (parseInt(exp.category_id) ? String(exp.category_id) : "");
isInitializingEdit.current = true; // useEffect ko ek baar skip karo
setForm({
    property_id: String(exp.property_id),
    property_name: exp.property_name,
    category_id: resolvedCategoryId,
    category_name: exp.category_name,
    total_amount: exp.total_amount || exp.amount || "",
    vendor_name: exp.vendor_name || "",
    payment_mode: exp.payment_mode || null,
    expense_date: expenseDate || "",
    added_by_name: exp.added_by_name,
    notes: exp.notes || "",
    items: initialItems,
    sub_category_id: String(exp.sub_category_id || ""),
    sub_category_name: exp.sub_category_name || "",
  });
  
  // Set payment details from database columns
  if (exp.payment_mode === 'Cheque') {
    setPaymentDetails({
      chequeNo: exp.cheque_no || '',
      bankName: exp.cheque_bank || '',
    });
  } else if (exp.payment_mode === 'UPI') {
    setPaymentDetails({
      upiId: exp.upi_id || '',
    });
  } else if (exp.payment_mode === 'Bank Transfer') {
    setPaymentDetails({
      bankName: exp.bank_name || '',
      referenceNo: exp.transaction_id || '',
    });
  } else if (exp.payment_mode === 'Card') {
    setPaymentDetails({
      cardRef: exp.card_ref || '',
    });
  } else if (exp.payment_mode === 'Online Payment Gateway') {
    setPaymentDetails({
      transactionId: exp.transaction_id || '',
      gatewayName: exp.bank_name || '',
    });
  } else if (exp.payment_mode === 'Wallet') {
    setPaymentDetails({
      walletRef: exp.transaction_id || '',
      walletName: exp.bank_name || '',
    });
  } else {
    setPaymentDetails({});
  }
  
  setEditId(exp.id);
  setErrors({});
  setReceiptFile(null);
  setReceiptPreview(exp.receipt_name || "");
  // Pehle subcategories fetch karo, phir modal open karo
  if (exp.category_name) {
    getSubcategoriesByCategory(exp.category_name)
      .then((res: any) => {
        const subs = (res?.data || []).map((s: any) => ({
          id: String(s.subcategory_id),
          name: s.subcategory_name,
        }));
        setDynamicSubCategories(subs);
      })
      .catch(() => setDynamicSubCategories([]));
  } else {
    setDynamicSubCategories([]);
  }
  setShowModal(true);
}

  function validate() {
  const e: Record<string, string> = {};
  if (!form.property_id) e.property_id = "Required";
  if (!form.category_id) e.category_id = "Required";
  if (!form.expense_date) e.expense_date = "Required";
  // if (!form.added_by_name?.trim()) e.added_by_name = "Required";
  if (form.items.filter((i: any) => i.name).length === 0) e.items = "At least one item required";
  return e;
}

async function save() {
  const e = validate();
  if (Object.keys(e).length) {
    setErrors(e);
    return;
  }
  setSubmitting(true);
  try {
    const validItems = form.items.filter((i: any) => i.name);
    const updatedItems = validItems.map((item: any) => ({
      ...item,
      total_amount: (Number(item.qty) || 0) * (Number(item.price) || 0),
    }));
    
    const itemsTotal = updatedItems.reduce((sum, i) => sum + i.total_amount, 0);
    const expenseTotalAmount = itemsTotal;
    const paymentAmount = form.total_amount ? Number(form.total_amount) : 0;
    
    // Prepare payment details
    let cheque_no = null, cheque_bank = null, transaction_id = null, upi_id = null, card_ref = null, bank_name = null;
    
    if (form.payment_mode === 'Cheque') {
      cheque_no = paymentDetails.chequeNo || null;
      cheque_bank = paymentDetails.bankName || null;
    } else if (form.payment_mode === 'UPI') {
      upi_id = paymentDetails.upiId || null;
    } else if (form.payment_mode === 'Bank Transfer') {
      bank_name = paymentDetails.bankName || null;
      transaction_id = paymentDetails.referenceNo || null;
    } else if (form.payment_mode === 'Card') {
      card_ref = paymentDetails.cardRef || null;
    } else if (form.payment_mode === 'Online Payment Gateway') {
      transaction_id = paymentDetails.transactionId || null;
      bank_name = paymentDetails.gatewayName || null;
    } else if (form.payment_mode === 'Wallet') {
      transaction_id = paymentDetails.walletRef || null;
      bank_name = paymentDetails.walletName || null;
    }
    
    // FIX: Use the date as is from the input without any conversion
    // The date picker returns YYYY-MM-DD format, which is what we want to store
    let expenseDate = form.expense_date;
    // If it's in YYYY-MM-DD format, keep it as is
    // Don't do any timezone conversion
    if (expenseDate && expenseDate.includes('T')) {
      expenseDate = expenseDate.split('T')[0];
    }
    
    const firstItemWithSub = updatedItems.find((i: any) => i.sub_category);
const subCatName = firstItemWithSub?.sub_category || null;
const subCatObj = subCatName ? dynamicSubCategories.find((s: any) => s.name === subCatName) : null;

const payload = {
  property_id: form.property_id,
  property_name: form.property_name,
  category_id: form.category_id,
  category_name: form.category_name,
  sub_category_id: subCatObj?.id || null,
  sub_category_name: subCatName,
      total_amount: expenseTotalAmount,
      total_paid: 0,
      balance: expenseTotalAmount,
      status: 'Unpaid',
      vendor_name: form.vendor_name,
      payment_mode: null,
      expense_date: expenseDate, // Use the date as is
      added_by_name: form.added_by_name,
      notes: form.notes,
      items: updatedItems,
      cheque_no,
      cheque_bank,
      transaction_id,
      upi_id,
      card_ref,
      bank_name,
    };
    
    console.log("Creating expense with payload:", payload);

    if (editId) {
      await updateExpense(editId, payload, receiptFile);
      toast.success("Expense updated");
    } else {
      const response = await createExpense(payload, receiptFile);
      toast.success("Expense created");
      
      if (form.payment_mode && paymentAmount > 0) {
        try {
          let paymentTransactionData: any = {
            paid_amount: paymentAmount,
            payment_mode: form.payment_mode,
            transaction_date: expenseDate,
            reference_no: transaction_id || cheque_no || null,
            notes: `Initial payment of ${fmt(paymentAmount)} towards total bill of ${fmt(expenseTotalAmount)}`,
            created_by: user?.name,
          };
          
          if (transaction_id) {
            paymentTransactionData.transaction_id = transaction_id;
          }
          if (bank_name) {
            paymentTransactionData.bank_name = bank_name;
          }
          
          await addExpensePayment(response.data.id, paymentTransactionData);
          console.log("Payment transaction created for expense:", response.data.id);
        } catch (paymentError) {
          console.error("Failed to create payment transaction:", paymentError);
          toast.warning("Expense created but payment recording failed");
        }
      }
    }
    
    setShowModal(false);
    await loadExpenses();
  } catch (err: any) {
    console.error("Save error:", err);
    toast.error(err.message || "Failed to save");
  } finally {
    setSubmitting(false);
  }
}

  /* ── Delete ────────────────────────────────────────────────────────────── */
  async function handleDelete(id: number, desc: string) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete expense "${desc}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: `rgba(0,0,0,0.4)`,
      width: '400px',
      padding: '1.5rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-lg font-bold text-gray-800',
        htmlContainer: 'text-sm text-gray-600 my-2',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
        cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
        actions: 'flex justify-center gap-2 mt-4'
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteExpense(id);
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Expense has been deleted successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        width: '350px',
        padding: '1rem',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-base font-bold text-green-600',
          htmlContainer: 'text-xs text-gray-600'
        }
      });
      
      toast.success("Expense deleted");
      await loadExpenses();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  }

  /* ── File handler ──────────────────────────────────────────────────────── */
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(file.name);
    }
  }

  // Auto-sync category from Basic Info to first purchase item
// Auto-sync category from Basic Info to all items + reset sub_category
//   useEffect(() => {
//   if (form.category_name && form.items.length > 0) {
//     setItems(
//       form.items.map((item: any) => ({
//         ...item,
//         category: form.category_name,
//         // Edit mode mein sub_category reset mat karo — sirf category change hone par reset
//         sub_category: editId ? (item.sub_category || "") : "",
//       }))
//     );
//   }
// }, [form.category_name]);


useEffect(() => {
  if (isInitializingEdit.current) {
    isInitializingEdit.current = false;
    return;
  }
  if (form.category_name && form.items.length > 0) {
    const updatedItems = form.items.map((item: any) => ({
      ...item,
      category: form.category_name,
      sub_category: "",   // ✅ clear subcategory when category changes
    }));
    setItems(updatedItems);
  }
}, [form.category_name]);


const processPayment = async () => {
  if (!paymentModal.expense) return;
  
  const paid_amount = parseFloat((document.getElementById('paymentAmount') as HTMLInputElement)?.value || "0");
  const payment_mode = (document.getElementById('paymentMode') as HTMLSelectElement)?.value;
  const transaction_date = (document.getElementById('transactionDate') as HTMLInputElement)?.value;
  const payment_notes = (document.getElementById('paymentNotes') as HTMLTextAreaElement)?.value;
  
  let reference_no = '';
  let paymentData: any = {
    paid_amount,
    payment_mode,
    transaction_date,
    notes: payment_notes,
    created_by: user?.name,
  };
  
  // Capture payment details based on payment mode
  if (payment_mode === 'UPI') {
    const upiId = (document.getElementById('upiId') as HTMLInputElement)?.value;
    paymentData.upi_id = upiId;
    paymentData.reference_no = upiId;
    paymentData.notes = payment_notes + (upiId ? `\nUPI ID: ${upiId}` : '');
  } else if (payment_mode === 'Bank Transfer') {
    let bankName = (document.getElementById('bankName') as HTMLSelectElement)?.value;
    const bankNameOther = (document.getElementById('bankNameOther') as HTMLInputElement)?.value;
    const transactionRef = (document.getElementById('transactionRef') as HTMLInputElement)?.value;
    
    // If "Other" is selected and other bank name is provided, use that
    if (bankName === 'Other' && bankNameOther) {
        bankName = bankNameOther;
    }
    
    paymentData.bank_name = bankName;
    paymentData.transaction_id = transactionRef;
    paymentData.reference_no = transactionRef;
    paymentData.notes = payment_notes + (bankName ? `\nBank: ${bankName}` : '') + (transactionRef ? `\nTransaction ID: ${transactionRef}` : '');
} else if (payment_mode === 'Cheque') {
    const chequeNo = (document.getElementById('chequeNo') as HTMLInputElement)?.value;
    let chequeBank = (document.getElementById('chequeBank') as HTMLSelectElement)?.value;
    const chequeBankOther = (document.getElementById('chequeBankOther') as HTMLInputElement)?.value;
    
    // If "Other" is selected and other bank name is provided, use that
    if (chequeBank === 'Other' && chequeBankOther) {
        chequeBank = chequeBankOther;
    }
    
    paymentData.cheque_no = chequeNo;
    paymentData.cheque_bank = chequeBank;
    paymentData.reference_no = chequeNo;
    paymentData.notes = payment_notes + (chequeNo ? `\nCheque: ${chequeNo}` : '') + (chequeBank ? `\nBank: ${chequeBank}` : '');
} else if (payment_mode === 'Card') {
    const cardRef = (document.getElementById('cardRef') as HTMLInputElement)?.value;
    paymentData.card_ref = cardRef;
    paymentData.reference_no = cardRef;
    paymentData.notes = payment_notes + (cardRef ? `\nCard: ${cardRef}` : '');
  } else if (payment_mode === 'Online Payment Gateway') {
    const transactionId = (document.getElementById('transactionId') as HTMLInputElement)?.value;
    const gatewayName = (document.getElementById('gatewayName') as HTMLInputElement)?.value;
    paymentData.transaction_id = transactionId;
    paymentData.bank_name = gatewayName;
    paymentData.reference_no = transactionId;
    paymentData.notes = payment_notes + (gatewayName ? `\nGateway: ${gatewayName}` : '') + (transactionId ? `\nTransaction ID: ${transactionId}` : '');
  } else if (payment_mode === 'Wallet') {
    const walletRef = (document.getElementById('walletRef') as HTMLInputElement)?.value;
    const walletName = (document.getElementById('walletName') as HTMLInputElement)?.value;
    paymentData.transaction_id = walletRef;
    paymentData.bank_name = walletName;
    paymentData.reference_no = walletRef;
    paymentData.notes = payment_notes + (walletName ? `\nWallet: ${walletName}` : '') + (walletRef ? `\nTransaction ID: ${walletRef}` : '');
  } else if (payment_mode === 'Cash') {
    const cashReceivedBy = (document.getElementById('cashReceivedBy') as HTMLInputElement)?.value;
    paymentData.reference_no = cashReceivedBy;
    paymentData.notes = payment_notes + (cashReceivedBy ? `\nCash received by: ${cashReceivedBy}` : '');
  }
  
  console.log("Sending payment data:", paymentData);
  
  if (!paid_amount || paid_amount <= 0) {
    toast.error("Please enter a valid amount");
    return;
  }
  
  if (!payment_mode) {
    toast.error("Please select a payment mode");
    return;
  }
  
  if (paid_amount > paymentModal.expense.balance) {
    toast.error(`Amount cannot exceed balance of ${fmt(paymentModal.expense.balance)}`);
    return;
  }
  
  setSubmitting(true);
  try {
    const result = await addExpensePayment(paymentModal.expense.id, paymentData);
    
    toast.success(`Payment of ${fmt(paid_amount)} recorded successfully`);
    closePaymentModal();
    await loadExpenses();
    
  } catch (err: any) {
    console.error("Payment error:", err);
    toast.error(err.message || "Failed to process payment");
  } finally {
    setSubmitting(false);
  }
};

// Update the conditional fields effect for payment modal
// Update the conditional fields effect for payment modal
useEffect(() => {
  if (!paymentModal.open) return;
  
  const paymentModeSelect = document.getElementById('paymentMode') as HTMLSelectElement;
  const container = document.getElementById('paymentConditionalFields');
  
  const updateConditionalFields = () => {
    if (!container) return;
    const mode = paymentModeSelect?.value;
    
    let html = '';
    if (mode === 'UPI') {
      html = `
        <div style="margin-bottom: 10px;">
          <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">UPI ID</label>
          <input id="upiId" type="text" placeholder="example@upi" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px; outline: none;" />
        </div>
      `;
} else if (mode === 'Bank Transfer') {
  // Get bank names for dropdown
  const bankOptions = bankNames.map(bank => `<option value="${bank.name}">${bank.name}</option>`).join('');
  html = `
    <div style="margin-bottom: 10px;">
      <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Bank Name</label>
      <select id="bankName" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px; background: #fff; cursor: pointer;">
        <option value="">Select Bank</option>
        ${bankOptions}
        <option value="Other">Other (Specify)</option>
      </select>
      <input id="bankNameOther" type="text" placeholder="Enter other bank name" style="display: none; width: 100%; margin-top: 8px; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
    </div>
    <div style="margin-bottom: 10px;">
      <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Transaction ID / Reference</label>
      <input id="transactionRef" type="text" placeholder="Transaction reference" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
    </div>
    <script>
      setTimeout(function() {
        const bankSelect = document.getElementById('bankName');
        const bankOther = document.getElementById('bankNameOther');
        if (bankSelect && bankOther) {
          bankSelect.addEventListener('change', function() {
            if (this.value === 'Other') {
              bankOther.style.display = 'block';
            } else {
              bankOther.style.display = 'none';
            }
          });
        }
      }, 100);
    <\/script>
  `;
} else if (mode === 'Cheque') {
  // Get bank names for dropdown
  const bankOptions = bankNames.map(bank => `<option value="${bank.name}">${bank.name}</option>`).join('');
  html = `
    <div style="margin-bottom: 10px;">
      <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Cheque Number</label>
      <input id="chequeNo" type="text" placeholder="Cheque number" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
    </div>
    <div style="margin-bottom: 10px;">
      <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Bank Name</label>
      <select id="chequeBank" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px; background: #fff; cursor: pointer;">
        <option value="">Select Bank</option>
        ${bankOptions}
        <option value="Other">Other (Specify)</option>
      </select>
      <input id="chequeBankOther" type="text" placeholder="Enter other bank name" style="display: none; width: 100%; margin-top: 8px; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
    </div>
    <script>
      setTimeout(function() {
        const chequeSelect = document.getElementById('chequeBank');
        const chequeOther = document.getElementById('chequeBankOther');
        if (chequeSelect && chequeOther) {
          chequeSelect.addEventListener('change', function() {
            if (this.value === 'Other') {
              chequeOther.style.display = 'block';
            } else {
              chequeOther.style.display = 'none';
            }
          });
        }
      }, 100);
    <\/script>
  `;
} else if (mode === 'Card') {
      html = `
        <div style="margin-bottom: 10px;">
          <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Card Reference / Last 4 digits</label>
          <input id="cardRef" type="text" placeholder="Last 4 digits" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
        </div>
      `;
    } else if (mode === 'Online Payment Gateway') {
      html = `
        <div style="margin-bottom: 10px;">
          <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Transaction ID</label>
          <input id="transactionId" type="text" placeholder="Gateway transaction ID" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
        </div>
        <div style="margin-bottom: 10px;">
          <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Payment Gateway Name</label>
          <input id="gatewayName" type="text" placeholder="e.g., Razorpay, Stripe" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
        </div>
      `;
    } else if (mode === 'Wallet') {
      html = `
        <div style="margin-bottom: 10px;">
          <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Wallet Reference / Transaction ID</label>
          <input id="walletRef" type="text" placeholder="Wallet transaction ID" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
        </div>
      `;
    }
    
    container.innerHTML = html;
  };
  
  if (paymentModeSelect) {
    paymentModeSelect.addEventListener('change', updateConditionalFields);
    updateConditionalFields();
    
    return () => {
      paymentModeSelect.removeEventListener('change', updateConditionalFields);
    };
  }
}, [paymentModal.open]);

  const totalAmount = form.items.reduce((sum, i) => sum + ((Number(i.qty) || 0) * (Number(i.price) || 0)), 0);
  const computedStats = {
    total_amount: expenses.reduce((sum, e) => sum + (Number(e.total_amount) || Number(e.amount) || 0), 0),
    paid_amount: expenses.reduce((sum, e) => sum + (Number(e.total_paid) || 0), 0),
    pending_amount: expenses.reduce((sum, e) => sum + (Number(e.balance) || 0), 0),
    total_count: expenses.length,
    paid_count: expenses.filter(e => e.status === 'Paid').length,
    pending_count: expenses.filter(e => e.status === 'Pending').length,
    partial_count: expenses.filter(e => e.status === 'Partial').length,
  };

  const inp = (err?: string) => ({
    width: "100%",
    padding: "10px 12px",
    border: `1.5px solid ${err ? "#FC8181" : "#E2E8F4"}`,
    borderRadius: 10,
    fontSize: 13,
    color: "#1A2B6D",
    background: err ? "#FFF5F5" : "#F8FAFF",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  });

  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
      {children}
      {required && <span style={{ color: "#E53E3E", marginLeft: 2 }}>*</span>}
    </label>
  );

  const ErrMsg = ({ msg }: { msg?: string }) =>
    msg ? <div style={{ fontSize: 11, color: "#E53E3E", marginTop: 3 }}>{msg}</div> : null;

  const SectionHead = ({ n, title, sub }: { n: string; title: string; sub?: string }) => (
    <div style={{ fontSize: 12, fontWeight: 700, color: "#3B5BDB", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 22, height: 22, background: "linear-gradient(135deg,#1A2B6D,#3B5BDB)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800, flexShrink: 0 }}>
        {n}
      </span>
      {title}
      {sub && <span style={{ fontSize: 10.5, color: "#8892A4", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{sub}</span>}
    </div>
  );

  const catOptions = categories.map((c) => c.name);

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F4F6FB" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* STICKY HEADER + COMPACT STATS */}
      <div style={{ position: "sticky", top: 16, zIndex: 10, background: "#F4F6FB" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #E8ECF4", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8}}>
           <button onClick={() => setFilterPanelOpen(true)}
    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #E8ECF4", borderRadius: 9, background: "#F8FAFF", fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer", whiteSpace: "nowrap" }}>
    <svg width="14" height="14" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/>
    </svg>
    Filters
    {(filterCat !== "All" || filterStatus !== "All" || filterProp !== "All" || filterMonth !== "" || filterFromDate !== "" || filterToDate !== "") && (
      <span style={{ background: "#3B5BDB", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>!</span>
    )}
  </button>
          {can("create_expenses") && (
            <button onClick={openAdd} style={{ background: "linear-gradient(135deg,#1A2B6D,#3B5BDB)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 3px 10px rgba(59,91,219,0.3)", whiteSpace: "nowrap" }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Expense
            </button>
            
          )}
          
        </div>
        
        {/* Compact stat cards */}
        <div className="exp-stat-grid" style={{ padding: "4px 3px 0", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {[
            { label: "Total Expenses", val: fmt(computedStats.total_amount || 0), sub: `${stats.total_count || expenses.length} records`, icon: "💰", c: "#1A2B6D", ibg: "#EEF1FB" },
            { label: "Total Paid", val: fmt(computedStats.paid_amount || 0), sub: `${stats.paid_count || 0} paid`, icon: "✅", c: "#1B7A4E", ibg: "#E8F5F0" },
            { label: "Pending Balance", val: fmt(computedStats.pending_amount || 0), sub: `${stats.pending_count || 0} pending`, icon: "⏳", c: "#B45309", ibg: "#FFF8EC" },
            { label: "Partial Payments", val: fmt(computedStats.partial_count || 0), sub: `${stats.partial_count || 0} expenses`, icon: "⟳", c: "#6B21A8", ibg: "#F5F0FF" },
          ].map((c, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: "1px solid #E8ECF4", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9, color: "#8892A4", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.label}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: c.c, lineHeight: 1.2 }}>{c.val}</div>
                <div style={{ fontSize: 9, color: "#B0BAC9", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.sub}</div>
              </div>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: c.ibg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{c.icon}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "4px 0px" }}>
        {/* TABLE CARD */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8ECF4", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          {/* Filters bar */}
       {/* Filters bar */}
{bulkSelected.size > 0 && (
  <div
    style={{
      padding: "12px 14px",
      borderBottom: "1px solid #F0F3FA",
    }}
  >
    <div
      style={{
        display: "grid",
        gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "1fr 1fr",
        gap: 12,
        alignItems: "center",
      }}
    >
      {/* Search Bar - commented */}

      {/* Bulk Action Area - always shown when this block renders */}
      <div
        style={{
          width: "100%",
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px",
          background: "#EEF1FB",
          border: "1px solid #E2E8F4",
          borderRadius: 10,
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 700, color: "#1A2B6D", fontSize: "clamp(12px, 4vw, 14px)" }}>
          {bulkSelected.size} selected
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => {
              setBulkSelected(new Set());
              setSelectAll(false);
            }}
            style={{ fontSize: "clamp(11px, 3.5vw, 12px)", color: "#8892A4", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", whiteSpace: "nowrap" }}
          >
            Clear
          </button>
          <button
            onClick={async () => {
  const result = await Swal.fire({
    title: 'Delete Selected?',
    text: `You are about to delete ${bulkSelected.size} expense(s). This cannot be undone!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete all!',
    cancelButtonText: 'Cancel',
    background: '#fff',
    width: '400px',
    padding: '1.5rem',
    customClass: {
      popup: 'rounded-xl shadow-2xl',
      confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
      cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
      actions: 'flex justify-center gap-2 mt-4'
    },
    buttonsStyling: false,
  });
  if (!result.isConfirmed) return;
  try {
    await Promise.all([...bulkSelected].map(id => deleteExpense(id)));
    toast.success(`${bulkSelected.size} expenses deleted`);
    setBulkSelected(new Set());
    setSelectAll(false);
    await loadExpenses();
  } catch (err: any) {
    toast.error(err.message || "Bulk delete failed");
  }
}}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 7, fontSize: "clamp(11px, 3.5vw, 12px)", fontWeight: 700, color: "#DC2626", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            <svg width="11" height="11" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4h6v2" />
            </svg>
            Delete {bulkSelected.size}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

  {/* <div
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <svg
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
        width="15"
        height="15"
        fill="none"
        stroke="#8892A4"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search expenses..."
        style={{
          width: "100%",
          height: 44,
          padding: "0 14px 0 38px",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          fontSize: 13,
          background: "#F8FAFC",
          outline: "none",
          color: "#334155",
        }}
      />
    </div> */}


          {/* Table */}
<div
  className={`overflow-y-auto ${
    filtered.length > 0
      ? bulkSelected.size > 0
        ? "max-h-[240px] sm:max-h-[380px]"
        : "max-h-[310px] sm:max-h-[450px]"
      : ""
  }`}
>      {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "#8892A4", fontSize: 14 }}>Loading expenses…</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900, tableLayout: "fixed" }} >
               <thead className="sticky top-0 z-10">
  <tr style={{ background: "#F8FAFF" }}>
    <th style={{ padding: "8px", width: 36, borderBottom: "1.5px solid #E2E8F0" }}>
      <input type="checkbox" checked={selectAll}
        onChange={(e) => {
          setSelectAll(e.target.checked);
          setBulkSelected(e.target.checked ? new Set(filtered.map(x => x.id)) : new Set());
        }}
        style={{ width: 14, height: 14, cursor: "pointer" }} />
    </th>
    <th style={{ padding: "4px 8px", width: "12%", borderBottom: "1.5px solid #E2E8F0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Property</div>
      <input value={colSearch.property} onChange={e => setColSearch(p => ({ ...p, property: e.target.value }))}
        placeholder="Search…" style={{ width: "100%", padding: "4px 6px", border: "1px solid #E2E8F4", borderRadius: 5, fontSize: 10, outline: "none", background: "#fff" }} />
    </th>
    <th style={{ padding: "4px 8px", width: "10%", borderBottom: "1.5px solid #E2E8F0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Category</div>
      <input value={colSearch.category} onChange={e => setColSearch(p => ({ ...p, category: e.target.value }))}
        placeholder="Search…" style={{ width: "100%", padding: "4px 6px", border: "1px solid #E2E8F4", borderRadius: 5, fontSize: 10, outline: "none", background: "#fff" }} />
    </th>
    <th style={{ padding: "4px 8px", width: "10%", borderBottom: "1.5px solid #E2E8F0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Vendor</div>
      <input value={colSearch.vendor} onChange={e => setColSearch(p => ({ ...p, vendor: e.target.value }))}
        placeholder="Search…" style={{ width: "100%", padding: "4px 6px", border: "1px solid #E2E8F4", borderRadius: 5, fontSize: 10, outline: "none", background: "#fff" }} />
    </th>
  <th style={{ padding: "4px 8px", width: "8%", borderBottom: "1.5px solid #E2E8F0" }}>
  <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Amount</div>
  <input value={colSearch.amount} onChange={e => setColSearch(p => ({ ...p, amount: e.target.value }))}
    placeholder="Search…" style={{ width: "100%", padding: "4px 6px", border: "1px solid #E2E8F4", borderRadius: 5, fontSize: 10, outline: "none", background: "#fff" }} />
</th>
<th style={{ padding: "4px 8px", width: "10%", borderBottom: "1.5px solid #E2E8F0" }}>
  <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Paid By</div>
  <input value={colSearch.paidBy} onChange={e => setColSearch(p => ({ ...p, paidBy: e.target.value }))}
    placeholder="Search…" style={{ width: "100%", padding: "4px 6px", border: "1px solid #E2E8F4", borderRadius: 5, fontSize: 10, outline: "none", background: "#fff" }} />
</th>
<th style={{ padding: "8px", width: "6%", borderBottom: "1.5px solid #E2E8F0" }}>
  <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>Receipt</div>
</th>
<th style={{ padding: "4px 8px", width: "8%", borderBottom: "1.5px solid #E2E8F0" }}>
  <div className="whitespace-nowrap" style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Expenses Date</div>
  <input
  value={colSearch.expenseDate}
  onChange={e =>
    setColSearch(p => ({
      ...p,
      expenseDate: e.target.value,
    }))
  }
  placeholder="29 May 2026"
  style={{
    width: "100%",
    padding: "4px 6px",
    border: "1px solid #E2E8F4",
    borderRadius: 5,
    fontSize: 10,
    outline: "none",
    background: "#fff",
  }}
/>
</th>
    <th style={{ padding: "4px 8px", width: "8%", borderBottom: "1.5px solid #E2E8F0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Status</div>
      <input value={colSearch.status} onChange={e => setColSearch(p => ({ ...p, status: e.target.value }))}
        placeholder="Search…" style={{ width: "100%", padding: "4px 6px", border: "1px solid #E2E8F4", borderRadius: 5, fontSize: 10, outline: "none", background: "#fff" }} />
    </th>
    <th style={{ padding: "4px 8px", width: "8%", borderBottom: "1.5px solid #E2E8F0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Added By</div>
      <input value={colSearch.addedBy} onChange={e => setColSearch(p => ({ ...p, addedBy: e.target.value }))}
        placeholder="Search…" style={{ width: "100%", padding: "4px 6px", border: "1px solid #E2E8F4", borderRadius: 5, fontSize: 10, outline: "none", background: "#fff" }} />
    </th>
    {["Created", "Actions"].map(h => (
      <th key={h} style={{ padding: "8px", borderBottom: "1.5px solid #E2E8F0", width: "10%" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
      </th>
    ))}
  </tr>
</thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={11} style={{ padding: 48, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>No expenses found</td></tr>
                  ) : (
                    paginatedItems.map((exp) => {
                      const cc = getCatColor(exp.category_name);
                      return (
                        <tr key={exp.id} style={{ borderBottom: "1px solid #F1F5F9", transition: "background 0.12s ease" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          <td style={{ padding: "10px 8px", textAlign: "center", width: 36 }}>
  <input type="checkbox"
    checked={bulkSelected.has(exp.id)}
    onChange={(e) => {
      setBulkSelected(prev => {
        const next = new Set(prev);
        e.target.checked ? next.add(exp.id) : next.delete(exp.id);
        return next;
      });
    }}
    style={{ width: 14, height: 14, cursor: "pointer" }} />
</td>
                          <td style={{ padding: "10px 8px", fontSize: 12, fontWeight: 600, color: "#0F172A" }}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", flexShrink: 0 }} />{exp.property_name || "—"}</span></td>
                          <td style={{ padding: "10px 8px" }}>{exp.category_name ? <span style={{ background: cc.bg, color: cc.text, padding: "3px 8px", borderRadius: 12, fontSize: 10, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: cc.dot }} />{exp.category_name}</span> : "—"}</td>
                          <td style={{ padding: "10px 8px", fontSize: 12, color: "#334155" }}>{exp.vendor_name || "—"}</td>
                          <td style={{ padding: "10px 8px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{fmt(exp.total_amount || exp.amount || 0)}</td>
                          {/* Replace the Paid By column in the table with this */}
<td style={{ padding: "10px 8px", fontSize: 12, color: "#475569" }}>
  {exp.payment_mode ? (
    <div>
      <div>{exp.payment_mode}</div>
      {/* Show transaction ID/reference for Online Payment Gateway */}
      {exp.payment_mode === 'Online Payment Gateway' && exp.transaction_id && (
        <div className="text-[10px] text-gray-500" style={{ fontSize: 9, color: "#64748B", marginTop: 2 }}>
          Txn: {exp.transaction_id}
        </div>
      )}
      {exp.payment_mode === 'Cheque' && exp.cheque_no && (
        <div className="text-[10px] text-gray-500" style={{ fontSize: 9, color: "#64748B", marginTop: 2 }}>
          Chq: {exp.cheque_no}
        </div>
      )}
      {exp.payment_mode === 'UPI' && exp.upi_id && (
        <div className="text-[10px] text-gray-500" style={{ fontSize: 9, color: "#64748B", marginTop: 2 }}>
          UPI: {exp.upi_id}
        </div>
      )}
      {exp.payment_mode === 'Bank Transfer' && exp.transaction_id && (
        <div className="text-[10px] text-gray-500" style={{ fontSize: 9, color: "#64748B", marginTop: 2 }}>
          Txn: {exp.transaction_id}
        </div>
      )}
    </div>
  ) : (
    <span style={{ color: "#CBD5E1", fontSize: 11 }}>—</span>
  )}
</td>
                          <td style={{ padding: "10px 8px" }}>{exp.receipt_url ? <ReceiptThumbnail url={exp.receipt_url} filename={exp.receipt_name} onClick={() => setViewItem(exp)} /> : <span style={{ color: "#CBD5E1", fontSize: 11 }}>—</span>}</td>
<td style={{ padding: "10px 8px", fontSize: 11, color: "#64748B" }}>
  <div>{fmtDate(exp.expense_date)}</div>
</td>                          
<td style={{ padding: "10px 8px" }}>
  <span
    style={{
      background: exp.status === "Paid" 
        ? "#DCFCE7" 
        : exp.status === "Partial" 
        ? "#FEF3C7" 
        : "#FEF2F2",
      color: exp.status === "Paid" 
        ? "#166534" 
        : exp.status === "Partial" 
        ? "#92400E" 
        : "#991B1B",
      padding: "3px 8px",
      borderRadius: 12,
      fontSize: 10,
      fontWeight: 600,
      whiteSpace: "nowrap",
      display: "inline-block",
    }}
  >
    {exp.status === "Paid" 
      ? " Paid" 
      : exp.status === "Partial" 
      ? " Partial" 
      : " Unpaid"}
  </span>
</td>
<td style={{ padding: "10px 8px", fontSize: 11, color: "#475569" }}>{exp.added_by_name || "—"}</td>
<td style={{ padding: "10px 8px", fontSize: 10, color: "#94A3B8" }}>
  <div>{new Date(exp.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
  <div style={{ fontSize: 9, color: "#B0BAC9", marginTop: 2 }}>{new Date(exp.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
</td>                        
 <td style={{ padding: "10px 8px", width: "10%", minWidth: "140px" }}>
  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "nowrap" }}>
    {/* View Button */}
<button onClick={() => {
      setViewItem(exp);
      fetchPaymentTransactions(exp.id);  
    }}    
    title="View" style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E2E8F0", background: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="12" height="12" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
    
    {/* PAY BUTTON - Show for expenses with balance > 0 (Partial or Unpaid) */}
    {(exp.balance > 0 || exp.total_paid < exp.total_amount) && (
      <button
        onClick={() => openPaymentModal(exp)}
        title="Make Payment"
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          border: "1px solid #DCFCE7",
          background: "#DCFCE7",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#BBF7D0")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#DCFCE7")}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 3H18M6 8H18M6 13H15M11 3V8M11 13L17 21" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 3L17 3" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    )}
    
    {/* Edit Button */}
    {can('edit_expenses') && (
      <button onClick={() => openEdit(exp)} title="Edit" style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E2E8F0", background: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="12" height="12" fill="none" stroke="#64748B" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    )}
    
    {/* Delete Button */}
    {can('delete_expenses') && (
      <button onClick={() => handleDelete(exp.id, exp.vendor_name || exp.category_name)} title="Delete" style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #FEE2E2", background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="11" height="11" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
        </svg>
      </button>
    )}
  </div>
</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Table footer */}
         <div style={{ padding: "12px 14px", background: "#F8FAFF", borderTop: "1px solid #F0F3FA", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
  {/* Left: Items per page selector */}
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span style={{ fontSize: 11, color: "#8892A4" }}>Show</span>
    <select
      value={itemsPerPage}
      onChange={(e) => {
        const val = e.target.value;
        setItemsPerPage(val === "All" ? "All" : Number(val));
        setCurrentPage(1);
      }}
      style={{
        padding: "4px 8px",
        border: "1px solid #E2E8F0",
        borderRadius: 6,
        fontSize: 11,
        background: "#fff",
        outline: "none",
        cursor: "pointer",
      }}
    >
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
      <option value="All">All</option>
    </select>
    <span style={{ fontSize: 11, color: "#8892A4" }}>entries</span>
  </div>

  {/* Center: Page numbers + Prev/Next */}
  {itemsPerPage !== "All" && totalPages > 1 && (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <button
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        style={{
          padding: "4px 8px",
          border: "1px solid #E2E8F0",
          borderRadius: 6,
          background: "#fff",
          fontSize: 11,
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          opacity: currentPage === 1 ? 0.5 : 1,
        }}
      >
        Previous
      </button>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        let pageNum = i + 1;
        if (totalPages > 5) {
          if (currentPage <= 3) pageNum = i + 1;
          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
          else pageNum = currentPage - 2 + i;
        }
        return (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            style={{
              padding: "4px 8px",
              border: "1px solid #E2E8F0",
              borderRadius: 6,
              background: currentPage === pageNum ? "#3B5BDB" : "#fff",
              color: currentPage === pageNum ? "#fff" : "#374151",
              fontWeight: currentPage === pageNum ? 700 : 400,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {pageNum}
          </button>
        );
      })}
      <button
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        style={{
          padding: "4px 8px",
          border: "1px solid #E2E8F0",
          borderRadius: 6,
          background: "#fff",
          fontSize: 11,
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          opacity: currentPage === totalPages ? 0.5 : 1,
        }}
      >
        Next
      </button>
    </div>
  )}

  {/* Right: Summary + Totals */}
  <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
    <span style={{ fontSize: 11, color: "#8892A4" }}>
      Showing <span style={{ fontWeight: 600, color: "#1A2B6D" }}>{paginatedItems.length}</span> of{" "}
      <span style={{ fontWeight: 600, color: "#1A2B6D" }}>{filtered.length}</span>
    </span>
    <span style={{ fontSize: 12, color: "#1B7A4E", fontWeight: 700 }}>
      Paid: {fmt(paginatedItems.filter((e) => e.status === "Paid").reduce((s: number, e: any) => s + Number(e.total_paid || 0), 0))}
    </span>
    <span style={{ fontSize: 12, color: "#B45309", fontWeight: 700 }}>
      Balance: {fmt(paginatedItems.reduce((s: number, e: any) => s + Number(e.balance || 0), 0))}
    </span>
    <span style={{ fontSize: 13, color: "#1A2B6D", fontWeight: 800 }}>
      Total: {fmt(paginatedItems.reduce((s: number, e: any) => s + Number(e.total_amount || e.amount || 0), 0))}
    </span>
  </div>
</div>
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
     {showModal && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(5px)", padding: 12 }}>
    <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 620, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
      {/* Modal header – compact */}
      <div style={{ padding: "12px 18px 8px", borderBottom: "1px solid #F0F3FA", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1A2B6D" }}>{editId ? " Edit Expense" : " Add Expense"}</div>
          <div style={{ fontSize: 10, color: "#8892A4", marginTop: 2 }}><span style={{ color: "#E53E3E" }}>*</span> required</div>
        </div>
        <button onClick={() => setShowModal(false)} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #E8ECF4", background: "#F8FAFF", cursor: "pointer", fontSize: 16, color: "#8892A4" }}>×</button>
      </div>

      <div style={{ padding: "14px 18px" }}>
        {/* SECTION 1 – Basic Info (compact grid) */}
        <div style={{ marginBottom: 16 }}>
          <SectionHead n="1" title="Basic Information" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <Label required>Property</Label>
              <SearchableDropdown options={properties} value={form.property_id} onChange={(val, opt) => setForm((f) => ({ ...f, property_id: val, property_name: opt.name }))} placeholder="Select property" error={errors.property_id} />
              <ErrMsg msg={errors.property_id} />
            </div>
            <div>
              <Label required>Category</Label>
              <SearchableDropdown
                options={categories}
                value={form.category_id}
                onChange={(val, opt) => {
                  console.log("🟢 Category selected – id:", val, "name:", opt.name);
                  setForm((f) => ({ ...f, category_id: val, category_name: opt.name }));
                }}
                placeholder="Select category"
                error={errors.category_id}
              />
              <ErrMsg msg={errors.category_id} />
            </div>
          </div>
         
        </div>

        {/* SECTION 2 – Purchase Items (compact table) */}
        <div style={{ marginBottom: 16 }}>
          <SectionHead n="2" title="Purchase Items" sub="(items from bill)" />
          <div style={{ background: "#F8FAFF", borderRadius: 12, border: "1px solid #E2E8F4", overflow: "hidden" }}>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <div style={{ minWidth: 520 }}>
                {/* Header – compact */}
                <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 120px 80px 90px 35px", padding: "6px 10px", background: "linear-gradient(90deg,#EEF1FB,#F0F4FF)", borderBottom: "1px solid #E2E8F4", gap: 6, fontSize: 9, fontWeight: 700, color: "#3B5BDB" }}>
                  {["#", "Item Name", "Sub Category", "Qty", "Unit Price", ""].map(h => <div key={h}>{h}</div>)}
                </div>
                {/* Items rows – compact */}
                {form.items.map((item: any, idx: number) => (
                  <div key={item.id} style={{ display: "grid", gridTemplateColumns: "30px 1fr 120px 80px 90px 35px", padding: "5px 10px", gap: 6, borderBottom: idx < form.items.length - 1 ? "1px solid #F0F3FA" : "none", alignItems: "center", background: idx % 2 === 1 ? "#FAFBFF" : "#fff" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#3B5BDB", textAlign: "center" }}>{idx + 1}</div>
                    <div style={{ position: "relative" }}>
                      <input type="text" value={item.name || ""} onChange={(e) => updateItem(item.id, "name", e.target.value)} placeholder="Item name" list={`items-list-${item.id}`} style={{ ...inp(), fontSize: 11, padding: "5px 8px", borderRadius: 6 }} />
                      <datalist id={`items-list-${item.id}`}>{purchasedItems.map(pi => <option key={pi} value={pi} />)}</datalist>
                    </div>
                   <select value={item.sub_category || ""} onChange={(e) => updateItem(item.id, "sub_category", e.target.value)} style={{ ...inp(), fontSize: 11, padding: "5px 6px", borderRadius: 6 }}>
                      <option value="">Select Sub Cat</option>
                      {/* Show current value as option if not yet in loaded list */}
                      {item.sub_category && !dynamicSubCategories.find(s => s.name === item.sub_category) && (
                        <option value={item.sub_category}>{item.sub_category}</option>
                      )}
                      {dynamicSubCategories.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                    <input type="number" value={item.qty || ""} onChange={(e) => updateItem(item.id, "qty", e.target.value)} placeholder="Qty" style={{ ...inp(), fontSize: 11, padding: "5px 6px", borderRadius: 6, textAlign: "center" }} />
                    <input type="number" value={item.price || ""} onChange={(e) => updateItem(item.id, "price", e.target.value)} placeholder="Price" style={{ ...inp(), fontSize: 11, padding: "5px 6px", borderRadius: 6 }} />
 <button
              onClick={() => removeItem(item.id)}
              disabled={form.items.length <= 1}
              style={{ width: 26, height: 26, borderRadius: 7, border: "1.5px solid #FFE4E4", background: "#FFF5F5", cursor: form.items.length > 1 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", opacity: form.items.length > 1 ? 1 : 0.3, flexShrink: 0 }}
            >
              <svg width="11" height="11" fill="none" stroke="#E53E3E" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
            </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Footer – compact */}
            <div style={{ padding: "8px 12px", borderTop: "1px solid #E2E8F4", background: "#EEF1FB", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, overflowX: "auto" }}>
              <button onClick={addItem} style={{ display: "flex", alignItems: "center", gap: 4, background: "#fff", border: "1px solid #3B5BDB", borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#3B5BDB", cursor: "pointer", whiteSpace: "nowrap" }}>+ Add Item</button>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", padding: "3px 10px", borderRadius: 6, border: "1px solid #E2E8F4" }}>
                <svg width="12" height="12" fill="none" stroke="#3B5BDB" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <div><span style={{ fontSize: 8, color: "#8892A4" }}>EXPENSE DATE</span>
                <input type="date" value={form.expense_date} onChange={(e) => setForm(f => ({ ...f, expense_date: e.target.value }))} style={{ border: "none", background: "transparent", fontSize: 11, fontWeight: 600, color: "#1A2B6D", outline: "none", padding: 0, fontFamily: "inherit", cursor: "pointer" }} /></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "linear-gradient(135deg, #1A2B6D, #3B5BDB)", padding: "4px 12px", borderRadius: 6, whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 9, color: "#fff", opacity: 0.9 }}>Items Total:</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{fmt(totalAmount)}</span>
              </div>
            </div>
          </div>
          {errors.items && <ErrMsg msg={errors.items} />}
        </div>

        {/* SECTION 3 – Payment Details (compact grid) */}
        <div style={{ marginBottom: 2 }}>
          <SectionHead n="3" title="Payment Details" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            <div>
              <Label>Total Amount (₹)</Label>
              <input type="number" value={form.total_amount !== undefined && form.total_amount !== null && form.total_amount !== '' ? form.total_amount : ''} onChange={(e) => setForm(f => ({ ...f, total_amount: e.target.value === '' ? '' : e.target.value }))} placeholder="Enter total" style={inp()} />
              {totalAmount > 0 && Number(form.total_amount) !== totalAmount && form.total_amount !== '' && <div style={{ fontSize: 9, color: "#8892A4", marginTop: 2 }}>Items: {fmt(totalAmount)} • override</div>}
            </div>
           <div>
  <Label>Paid Through</Label>
  <select value={form.payment_mode || ""} onChange={(e) => { setForm(f => ({ ...f, payment_mode: e.target.value })); setPaymentDetails({}); setShowCustomBankInput(false); }} style={inp()}>
    <option value="">Select Payment Method</option>
    {paymentMethods.map((method) => (
      <option key={method.id} value={method.name}>
        {method.name}
      </option>
    ))}
  </select>
</div>
            <div>
  <Label>Vendor Name</Label>
  <SearchableDropdown
    options={vendors}
    value={form.vendor_name || ""}
    onChange={(val, opt) => setForm(f => ({ ...f, vendor_name: opt.name }))}
    placeholder="Select vendor"
    valueKey="name"          // ✅ ADD THIS
  />
</div>
            {/* Added By – kept commented as original */}
            {/* <div><Label required>Added By</Label><input value={form.added_by_name} onChange={(e) => setForm(f => ({ ...f, added_by_name: e.target.value }))} placeholder="Your name" style={inp(errors.added_by_name)} /><ErrMsg msg={errors.added_by_name} /></div> */}

            {/* Conditional fields – unchanged, just compact spacing */}
            {form.payment_mode === 'UPI' && <div><Label>UPI ID</Label><input type="text" placeholder="example@upi" value={paymentDetails.upiId || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })} style={inp()} /></div>}
            {form.payment_mode === 'Bank Transfer' && (
              <>
                <div><Label>Bank Name</Label>
                  <select value={paymentDetails.bankName || ''} onChange={(e) => { const v = e.target.value; if (v === 'Other') setPaymentDetails({ ...paymentDetails, bankName: '', showOtherBank: true }); else setPaymentDetails({ ...paymentDetails, bankName: v, showOtherBank: false }); }} style={inp()}>
                    <option value="">Select Bank</option>{bankNames.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}<option value="Other">Other</option>
                  </select>
                  {paymentDetails.showOtherBank && <input type="text" placeholder="Other bank name" value={paymentDetails.otherBankName || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value, otherBankName: e.target.value })} style={{ ...inp(), marginTop: 6 }} />}
                </div>
                <div><Label>Transaction ID</Label><input type="text" placeholder="Reference" value={paymentDetails.referenceNo || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, referenceNo: e.target.value })} style={inp()} /></div>
              </>
            )}
            {form.payment_mode === 'Cheque' && (
              <>
                <div><Label>Cheque No.</Label><input type="text" placeholder="Cheque number" value={paymentDetails.chequeNo || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, chequeNo: e.target.value })} style={inp()} /></div>
                <div><Label>Bank Name</Label>
                  <select value={paymentDetails.bankName || ''} onChange={(e) => { const v = e.target.value; if (v === 'Other') setPaymentDetails({ ...paymentDetails, bankName: '', showOtherBankCheque: true }); else setPaymentDetails({ ...paymentDetails, bankName: v, showOtherBankCheque: false }); }} style={inp()}>
                    <option value="">Select Bank</option>{bankNames.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}<option value="Other">Other</option>
                  </select>
                  {paymentDetails.showOtherBankCheque && <input type="text" placeholder="Other bank" value={paymentDetails.otherBankName || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value, otherBankName: e.target.value })} style={{ ...inp(), marginTop: 6 }} />}
                </div>
              </>
            )}
            {form.payment_mode === 'Card' && <div><Label>Card Ref / Last 4</Label><input type="text" placeholder="Last 4 digits" value={paymentDetails.cardRef || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, cardRef: e.target.value })} style={inp()} /></div>}
            {form.payment_mode === 'Online Payment Gateway' && (
              <>
                <div><Label>Transaction ID</Label><input type="text" placeholder="Gateway txn ID" value={paymentDetails.transactionId || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionId: e.target.value })} style={inp()} /></div>
                <div><Label>Gateway Name</Label>
                  <select value={paymentDetails.gatewayName || ''} onChange={(e) => { const v = e.target.value; if (v === 'Other') setPaymentDetails({ ...paymentDetails, gatewayName: '', showOtherGateway: true }); else setPaymentDetails({ ...paymentDetails, gatewayName: v, showOtherGateway: false }); }} style={inp()}>
                    <option value="">Select</option><option value="Razorpay">Razorpay</option><option value="Stripe">Stripe</option><option value="PayPal">PayPal</option><option value="Other">Other</option>
                  </select>
                  {paymentDetails.showOtherGateway && <input type="text" placeholder="Other gateway" value={paymentDetails.otherGatewayName || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, gatewayName: e.target.value, otherGatewayName: e.target.value })} style={{ ...inp(), marginTop: 6 }} />}
                </div>
              </>
            )}
            {form.payment_mode === 'Wallet' && <div><Label>Wallet Reference</Label><input type="text" placeholder="Wallet txn ID" value={paymentDetails.walletRef || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, walletRef: e.target.value })} style={inp()} /></div>}

            {/* Receipt Upload – compact */}
            <div>
              <Label>Receipt</Label>
              <div onClick={() => fileRef.current?.click()} style={{ border: "1.5px dashed #3B5BDB", borderRadius: 8, padding: "6px 10px", background: receiptPreview ? "#EEF1FB" : "#F8FAFF", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, height: 36 }}>
                <svg width="12" height="12" fill="none" stroke={receiptPreview ? "#3B5BDB" : "#B0BAC9"} strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                <span style={{ fontSize: 11, color: receiptPreview ? "#3B5BDB" : "#B0BAC9", fontWeight: receiptPreview ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{receiptPreview || "Upload"}</span>
                {receiptPreview && <button onClick={(e) => { e.stopPropagation(); setReceiptFile(null); setReceiptPreview(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>×</button>}
                <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} style={{ display: "none" }} />
              </div>
            </div>

            {/* Notes – full width but compact */}
            <div style={{ gridColumn: "1/-1" }}>
              <Label>Notes</Label>
              <textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes…" rows={1} style={{ ...inp(), resize: "vertical", minHeight: 50, fontFamily: "inherit" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal footer – compact */}
      <div style={{ padding: "10px 18px 14px", borderTop: "1px solid #F0F3FA", display: "flex", gap: 10 }}>
        <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "8px", border: "1px solid #E8ECF4", borderRadius: 9, background: "#F8FAFF", fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Cancel</button>
        <button onClick={save} disabled={submitting} style={{ flex: 2, padding: "8px", border: "none", borderRadius: 9, background: submitting ? "#B0BAC9" : "linear-gradient(135deg,#1A2B6D,#3B5BDB)", fontSize: 12, fontWeight: 700, color: "#fff", cursor: submitting ? "not-allowed" : "pointer" }}>{submitting ? "Saving…" : editId ? "✓ Update" : "✓ Save"}</button>
      </div>
    </div>
  </div>
)}

      {viewItem && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(5px)",
      padding: 12,
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        width: "100%",
        maxWidth: 680,
        maxHeight: "92vh",
        overflowY: "auto",
        boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px 12px",
          borderBottom: "1px solid #F0F3FA",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          zIndex: 5,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 800, color: "#1A2B6D" }}>
          📄 Expense Details
        </div>
          <button
          onClick={() => {
            setViewItem(null);
            setPaymentTransactions([]);  // ADD THIS LINE
          }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: "1.5px solid #E8ECF4",
            background: "#F8FAFF",
            cursor: "pointer",
            fontSize: 18,
            color: "#8892A4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: "18px 20px", flex: 1, overflowY: "auto" }}>
        {/* Info grid */}
        <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 14,
    marginBottom: 18,
  }}
  className="view-info-grid"
>
          {/* Property */}
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#8892A4",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 3,
              }}
            >
              Property
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#374151",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#3B5BDB",
                  flexShrink: 0,
                }}
              />
              {viewItem.property_name}
            </div>
          </div>

          {/* Category */}
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#8892A4",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 3,
              }}
            >
              Category
            </div>
            {(() => {
              const cc = getCatColor(viewItem.category_name);
              return (
                <span
                  style={{
                    background: cc.bg,
                    color: cc.text,
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: cc.dot,
                    }}
                  />
                  {viewItem.category_name}
                </span>
              );
            })()}
          </div>

          {/* Vendor */}
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#8892A4",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 3,
              }}
            >
              Vendor
            </div>
            <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
              {viewItem.vendor_name || "—"}
            </div>
          </div>

          {/* Total Amount - FIXED: Use total_amount instead of amount */}
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#8892A4",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 3,
              }}
            >
              Total Amount
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1A2B6D" }}>
              {fmt(viewItem.total_amount || viewItem.amount || 0)}
            </div>
          </div>

          {/* Paid Amount - ADD THIS */}
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#8892A4",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 3,
              }}
            >
              Paid
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1B7A4E" }}>
              {fmt(viewItem.total_paid || 0)}
            </div>
          </div>

          {/* Balance Amount - ADD THIS */}
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#8892A4",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 3,
              }}
            >
              Balance
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#B45309" }}>
              {fmt(viewItem.balance || 0)}
            </div>
          </div>


          {/* Status - FIXED: Show Partial status too */}
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#8892A4",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 3,
              }}
            >
              Status
            </div>
            <span
              style={{
                background: viewItem.status === "Paid" 
                  ? "#DCFCE7" 
                  : viewItem.status === "Partial" 
                  ? "#FEF3C7" 
                  : "#FEF2F2",
                color: viewItem.status === "Paid" 
                  ? "#166534" 
                  : viewItem.status === "Partial" 
                  ? "#92400E" 
                  : "#991B1B",
                padding: "3px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              {viewItem.status === "Paid" 
                ? "✓ Paid" 
                : viewItem.status === "Partial" 
                ? "⟳ Partial" 
                : "⏳ Unpaid"}
            </span>
          </div>

          {/* Expense Date */}
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#8892A4",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 3,
              }}
            >
              Expense Date
            </div>
            <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
              {fmtDate(viewItem.expense_date)}
            </div>
          </div>

          {/* Added By */}
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#8892A4",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 3,
              }}
            >
              Added By
            </div>
            <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
              {viewItem.added_by_name}
            </div>
          </div>

          {/* Created At */}
          {/* <div>
            <div
              style={{
                fontSize: 10,
                color: "#8892A4",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 3,
              }}
            >
              Created At
            </div>
            <div style={{ fontSize: 12, color: "#B0BAC9", fontWeight: 400 }}>
              {fmtDateTime(viewItem.created_at)}
            </div>
          </div> */}

          {/* Notes */}
          {viewItem.notes && (
            <div style={{ gridColumn: "1/-1" }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#8892A4",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 3,
                }}
              >
                Notes
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#374151",
                  fontWeight: 400,
                  background: "#F8FAFF",
                  borderRadius: 8,
                  padding: "8px 12px",
                  border: "1px solid #E8ECF4",
                }}
              >
                {viewItem.notes}
              </div>
            </div>
          )}

          {/* Receipt — Full preview */}
          {viewItem.receipt_url && (
            <div style={{ gridColumn: "1/-1" }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#8892A4",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 8,
                }}
              >
                Receipt Preview
              </div>
              {viewItem.receipt_name?.toLowerCase().endsWith(".pdf") ? (
                <div
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1.5px solid #E2E8F4",
                    marginBottom: 10,
                    background: "#F8FAFF",
                  }}
                >
                  <iframe
                    src={viewItem.receipt_url}
                    title="Receipt PDF"
                    style={{
                      width: "100%",
                      height: 340,
                      border: "none",
                      display: "block",
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1.5px solid #E2E8F4",
                    marginBottom: 10,
                    background: "#F8FAFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 200,
                  }}
                >
                  <img
                    src={viewItem.receipt_url}
                    alt="Receipt"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 320,
                      objectFit: "contain",
                      display: "block",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  background: "#F8FAFF",
                  border: "1.5px solid #E2E8F4",
                  borderRadius: 10,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    background: "#EEF1FB",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {viewItem.receipt_name?.toLowerCase().endsWith(".pdf") ? (
                    <svg
                      width="17"
                      height="17"
                      fill="none"
                      stroke="#3B5BDB"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                    </svg>
                  ) : (
                    <svg
                      width="17"
                      height="17"
                      fill="none"
                      stroke="#3B5BDB"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21,15 16,10 5,21" />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1A2B6D",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {viewItem.receipt_name || "Receipt file"}
                  </div>
                  <div style={{ fontSize: 10, color: "#8892A4", marginTop: 1 }}>
                    {viewItem.receipt_name?.toLowerCase().endsWith(".pdf")
                      ? "PDF Document"
                      : "Image file"}
                  </div>
                </div>
                <a
                  href={viewItem.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: "linear-gradient(135deg,#1A2B6D,#3B5BDB)",
                    color: "#fff",
                    padding: "6px 13px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15,3 21,3 21,9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Open
                </a>
              </div>
            </div>
          )}
        </div>
        
         {/* Items table */}
        {viewItem.items?.filter((i: any) => i.name || i.item_name).length > 0 && (
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#3B5BDB",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  background: "linear-gradient(135deg,#1A2B6D,#3B5BDB)",
                  borderRadius: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                }}
              >
                ✦
              </span>
              Purchase Items (
              {viewItem.items.filter((i: any) => i.name || i.item_name).length})
            </div>
            <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #E8ECF4" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 360 }}>
                <thead>
                  <tr style={{ background: "#F8FAFF" }}>
                    {["Item Name", "Category", "Qty", "Price", "Amount"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#8892A4",
                          borderBottom: "1px solid #F0F3FA",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewItem.items
                    .filter((i: any) => i.name || i.item_name)
                    .map((it: any, idx: number) => {
                      const itCc = getCatColor(it.category || it.category_name || "");
                      return (
                        <tr
                          key={idx}
                          style={{ borderBottom: "1px solid #F5F7FC" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#FAFBFF")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1A2B6D" }}>
                            {it.name || it.item_name}
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            {it.category || it.category_name ? (
                              <span
                                style={{
                                  background: itCc.bg,
                                  color: itCc.text,
                                  padding: "2px 8px",
                                  borderRadius: 20,
                                  fontSize: 10,
                                  fontWeight: 600,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <span
                                  style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    background: itCc.dot,
                                  }}
                                />
                                {it.category || it.category_name}
                              </span>
                            ) : (
                              <span style={{ color: "#CBD5E1" }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: "8px 12px", color: "#374151" }}>
                            {it.qty || it.quantity || "—"}
                          </td>
                          <td style={{ padding: "8px 12px", color: "#374151" }}>
                            {fmt(it.price || it.unit_price || 0)}
                          </td>
                          <td style={{ padding: "8px 12px", fontWeight: 700, color: "#1A2B6D" }}>
                            {fmt(
                              Number(it.qty || it.quantity || 0) *
                                Number(it.price || it.unit_price || 0)
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  <tr style={{ background: "#EEF1FB" }}>
                    <td
                      colSpan={4}
                      style={{
                        padding: "8px 12px",
                        fontWeight: 700,
                        color: "#1A2B6D",
                        textAlign: "right",
                        fontSize: 12,
                      }}
                    >
                      Total:
                    </td>
                    <td style={{ padding: "8px 12px", fontWeight: 800, color: "#1A2B6D", fontSize: 13 }}>
                      {fmt(
                        viewItem.items
                          .filter((i: any) => i.name || i.item_name)
                          .reduce(
                            (s: number, i: any) =>
                              s +
                              Number(i.qty || i.quantity || 0) *
                                Number(i.price || i.unit_price || 0),
                            0
                          )
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAYMENT HISTORY SECTION - ADD THIS AFTER INFO GRID AND BEFORE ITEMS TABLE */}
        {paymentTransactions.length > 0 && (
          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#3B5BDB",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  background: "linear-gradient(135deg,#1A2B6D,#3B5BDB)",
                  borderRadius: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                }}
              >
                💰
              </span>
              Payment History ({paymentTransactions.length} transactions)
            </div>
            <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #E8ECF4" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 500 }}>
                <thead>
                  <tr style={{ background: "#F8FAFF" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#8892A4", borderBottom: "1px solid #F0F3FA" }}> Transaction Date</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#8892A4", borderBottom: "1px solid #F0F3FA" }}>Amount</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#8892A4", borderBottom: "1px solid #F0F3FA" }}>Payment Mode</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#8892A4", borderBottom: "1px solid #F0F3FA" }}>Reference / Details</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#8892A4", borderBottom: "1px solid #F0F3FA" }}>Notes</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#8892A4", borderBottom: "1px solid #F0F3FA" }}>Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentTransactions.map((transaction, idx) => {
                    const getPaymentIcon = (mode: string) => {
                      if (mode === 'Cheque') return '📝';
                      if (mode === 'UPI') return '📱';
                      if (mode === 'Bank Transfer') return '🏦';
                      if (mode === 'Card') return '💳';
                      if (mode === 'Online Payment Gateway') return '🌐';
                      if (mode === 'Wallet') return '👛';
                      return '💵';
                    };
                    
                    return (
                      <tr
                        key={transaction.id || idx}
                        style={{ borderBottom: "1px solid #F5F7FC" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFBFF")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "8px 12px", fontSize: 11, color: "#475569" }}>
                          {fmtDate(transaction.transaction_date?.split('T')[0] || transaction.created_at?.split('T')[0])}
                        </td>
                        <td style={{ padding: "8px 12px", fontWeight: 700, color: "#1B7A4E" }}>
                          {fmt(transaction.paid_amount)}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: 11 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {getPaymentIcon(transaction.payment_mode)} {transaction.payment_mode}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: 10, color: "#64748B" }}>
                          {transaction.reference_no && <div>Ref: {transaction.reference_no}</div>}
                          {transaction.transaction_id && transaction.payment_mode !== 'Bank Transfer' && <div>Txn: {transaction.transaction_id}</div>}
                          {transaction.cheque_no && <div>Chq: {transaction.cheque_no}</div>}
                          {transaction.upi_id && <div>UPI: {transaction.upi_id}</div>}
                          {transaction.card_ref && <div>Card: {transaction.card_ref}</div>}
                        </td>
                       <td style={{ padding: "8px 12px", fontSize: 10, color: "#64748B", maxWidth: 200 }}>
  {transaction.notes || '—'}
</td>
                        <td style={{ padding: "8px 12px", fontSize: 10, color: "#64748B" }}>
                          {transaction.created_by || '—'}
                        </td>
                      </tr>
                    );
                  })}
                 <tr style={{ background: "#EEF1FB", borderTop: "1px solid #E2E8F4" }}>
  <td colSpan={2} style={{ padding: "8px 12px", fontWeight: 700, color: "#1A2B6D", textAlign: "left" }}>
    Total Paid: <span style={{ fontWeight: 800, color: "#1B7A4E", fontSize: 13, marginLeft: 5 }}>{fmt(paymentTransactions.reduce((sum, t) => sum + (parseFloat(t.paid_amount) || 0), 0))}</span>
  </td>
  <td colSpan={4} style={{ padding: "8px 12px", fontWeight: 700, color: "#1A2B6D", textAlign: "right" }}>
    Pending Balance: <span style={{ fontWeight: 800, color: "#B45309", fontSize: 13, marginLeft: 5 }}>{fmt((viewItem?.total_amount || 0) - paymentTransactions.reduce((sum, t) => sum + (parseFloat(t.paid_amount) || 0), 0))}</span>
  </td>
</tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
       
      </div>
    </div>
  </div>
)}

      {/* COMPACT PAYMENT MODAL */}
      {paymentModal.open && paymentModal.expense && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(3px)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            {/* Compact Header */}
            <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, #1A2B6D, #2D4A8A)", color: "#fff", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>💰 Make Payment</h3>
                  <p style={{ fontSize: 11, opacity: 0.85, margin: "4px 0 0 0" }}>{paymentModal.expense.vendor_name || paymentModal.expense.category_name}</p>
                </div>
                <button onClick={closePaymentModal} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", cursor: "pointer", fontSize: 16, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
            </div>

            {/* Scrollable Content - Compact */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              {/* Balance Summary - Compact */}
              <div style={{ background: "#F8FAFF", borderRadius: 10, padding: "12px", marginBottom: 16, border: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#64748B" }}>Total Bill:</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1A2B6D" }}>{fmt(paymentModal.expense.total_amount)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#64748B" }}>Already Paid:</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1B7A4E" }}>{fmt(paymentModal.expense.total_paid)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Balance Due:</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#B45309" }}>{fmt(paymentModal.expense.balance)}</span>
                </div>
              </div>

              {/* Payment Amount */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 5, color: "#374151" }}>Payment Amount <span style={{ color: "#E53E3E" }}>*</span></label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#1A2B6D", fontWeight: 600, fontSize: 12 }}>₹</span>
                  <input id="paymentAmount" type="text" placeholder="0.00" style={{ width: "100%", padding: "8px 12px 8px 28px", border: "1.5px solid #E2E8F4", borderRadius: 8, fontSize: 13, outline: "none" }} />
                </div>
              </div>

              {/* Payment Mode */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 5, color: "#374151" }}>Payment Mode <span style={{ color: "#E53E3E" }}>*</span></label>
                <select id="paymentMode" style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #E2E8F4", borderRadius: 8, fontSize: 12, background: "#fff", cursor: "pointer" }}>
  <option value="">Select Mode</option>
  <option value="Cash">💵 Cash</option>
  <option value="Bank Transfer">🏦 Bank Transfer</option>
  <option value="UPI">📱 UPI</option>
  <option value="Cheque">📝 Cheque</option>
  <option value="Card">💳 Card</option>
  <option value="Online Payment Gateway">🌐 Online Payment Gateway</option>
  <option value="Wallet">👛 Wallet</option>
</select>
              </div>

              {/* Conditional Fields Container */}
              <div id="paymentConditionalFields" style={{ marginBottom: 14 }}></div>

              {/* Payment Date */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 5, color: "#374151" }}>Payment Date</label>
                <input id="transactionDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #E2E8F4", borderRadius: 8, fontSize: 12, outline: "none" }} />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 5, color: "#374151" }}>Notes <span style={{ fontSize: 9, color: "#94A3B8" }}>(Optional)</span></label>
                <textarea id="paymentNotes" rows={2} placeholder="Add payment notes..." style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #E2E8F4", borderRadius: 8, fontSize: 12, resize: "vertical", fontFamily: "inherit", outline: "none" }} />
              </div>
            </div>

            {/* Compact Footer */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid #F0F3FA", background: "#fff", display: "flex", gap: 10, flexShrink: 0 }}>
              <button onClick={closePaymentModal} style={{ flex: 1, padding: "8px", border: "1px solid #E2E8F0", borderRadius: 8, background: "#F8FAFF", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Cancel</button>
              <button onClick={processPayment} disabled={submitting} style={{ flex: 2, padding: "8px", border: "none", borderRadius: 8, background: submitting ? "#B0BAC9" : "linear-gradient(135deg, #1A2B6D, #2D4A8A)", fontSize: 12, fontWeight: 700, color: "#fff", cursor: submitting ? "not-allowed" : "pointer" }}>{submitting ? "Processing..." : "Confirm Payment"}</button>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT SIDE FILTER PANEL */}
{filterPanelOpen && (
  <>
    <div onClick={() => setFilterPanelOpen(false)}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 998 }} />
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 320, background: "#fff", zIndex: 999, boxShadow: "-4px 0 20px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}>
      
      {/* Header */}
      <div style={{ padding: "18px 20px", borderBottom: "1px solid #F0F3FA", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg,#1A2B6D,#3B5BDB)" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}> Advanced Filters</span>
        <button onClick={() => setFilterPanelOpen(false)}
          style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", cursor: "pointer", fontSize: 16, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      </div>

      {/* Scrollable filters */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        
        {/* Month */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Month</label>
          <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #E8ECF4", borderRadius: 8, fontSize: 12, outline: "none" }} />
        </div>

        {/* Date Range */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Date Range</label>
          <input type="date" value={filterFromDate} onChange={(e) => setFilterFromDate(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #E8ECF4", borderRadius: 8, fontSize: 12, marginBottom: 6, outline: "none" }} placeholder="From" />
          <input type="date" value={filterToDate} onChange={(e) => setFilterToDate(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #E8ECF4", borderRadius: 8, fontSize: 12, outline: "none" }} placeholder="To" />
        </div>

{/* Ignore Date Filters Checkbox */}
<div style={{ marginBottom: 16 }}>
  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
    <input
      type="checkbox"
      checked={ignoreDateFilters}
      onChange={(e) => setIgnoreDateFilters(e.target.checked)}
      style={{ width: 16, height: 16, cursor: "pointer" }}
    />
    <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>
      Ignore Date Filters
    </span>
  </label>
  <div style={{ fontSize: 9, color: "#8892A4", marginTop: 4, marginLeft: 24 }}>
    Month and date range will be ignored
  </div>
</div>
        {/* Property */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Property</label>
          <select value={filterProp} onChange={(e) => setFilterProp(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #E8ECF4", borderRadius: 8, fontSize: 12, background: "#fff", outline: "none" }}>
            <option value="All">All Properties</option>
            {[...new Set(expenses.map((e) => e.property_name))].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

       {/* Category Filter */}
<div style={{ marginBottom: 16 }}>
  <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Category</label>
  <select 
    value={filterCat} 
    onChange={(e) => { 
      setFilterCat(e.target.value); 
      setFilterSubCat("All"); // Reset subcategory when category changes
    }}
    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E8ECF4", borderRadius: 8, fontSize: 12, background: "#fff", outline: "none" }}
  >
    <option value="All">All Categories</option>
    {categories.map((c) => (
      <option key={c.id} value={c.name}>{c.name}</option>
    ))}
  </select>
</div>

{/* Sub Category Filter - Dynamic based on selected category */}
<div style={{ marginBottom: 16 }}>
  <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Sub Category</label>
  <select 
    value={filterSubCat} 
    onChange={(e) => setFilterSubCat(e.target.value)}
    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E8ECF4", borderRadius: 8, fontSize: 12, background: "#fff", outline: "none" }}
    disabled={filterCat === "All"}
  >
    <option value="All">All Sub Categories</option>
    {filterCat !== "All" && (() => {
      // Get subcategories for selected category from your existing mapping
      const subs = subCategories.filter(s => s.category_name === filterCat);
      return subs.map((s) => (
        <option key={s.id} value={s.name}>{s.name}</option>
      ));
    })()}
  </select>
</div>

        {/* Vendor */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Vendor</label>
          <select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #E8ECF4", borderRadius: 8, fontSize: 12, background: "#fff", outline: "none" }}>
            <option value="All">All Vendors</option>
            {[...new Set(expenses.map((e) => e.vendor_name).filter(Boolean))].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #E8ECF4", borderRadius: 8, fontSize: 12, background: "#fff", outline: "none" }}>
            <option value="All">All Statuses</option>
            <option value="Paid">✓ Paid</option>
            <option value="Partial">⟳ Partial</option>
            <option value="Pending">⏳ Pending</option>
          </select>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 20px", borderTop: "1px solid #F0F3FA", display: "flex", gap: 10 }}>
        <button onClick={() => {
          setFilterCat("All"); setFilterSubCat("All"); setFilterStatus("All");
          setFilterProp("All"); setFilterVendor("All");
          setFilterMonth(""); setFilterFromDate(""); setFilterToDate("");setIgnoreDateFilters(false);
        }} style={{ flex: 1, padding: "8px", border: "1px solid #E8ECF4", borderRadius: 8, background: "#F8FAFF", fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
          Reset
        </button>
        <button onClick={() => setFilterPanelOpen(false)}
          style={{ flex: 2, padding: "8px", border: "none", borderRadius: 8, background: "linear-gradient(135deg,#1A2B6D,#3B5BDB)", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
          Apply Filters
        </button>
      </div>
    </div>
  </>
)}

      {/* Responsive CSS */}
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #F0F3FA; }
        ::-webkit-scrollbar-thumb { background: #C5CEE0; border-radius: 10px; }

        @media (max-width: 480px) {
          .exp-stat-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
      <style>{`
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #F0F3FA; }
  ::-webkit-scrollbar-thumb { background: #C5CEE0; border-radius: 10px; }

  @media (max-width: 480px) {
    .exp-stat-grid { grid-template-columns: repeat(2,1fr) !important; }
    .view-info-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
`}</style>
    </div>
  );
}