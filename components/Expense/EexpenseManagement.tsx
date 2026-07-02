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
   bulkImportExpenses,
} from "@/lib/expenseApi";
import { getAllStaff } from "@/lib/staffApi";
import { listProperties } from "@/lib/propertyApi";
import { consumeMasters, getMasterItemsByTab, getMasterValues } from "@/lib/masterApi";
import { getPurchases } from "@/lib/materialPurchaseApi";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { getSettings, getSettingValue } from "@/lib/settingsApi";
import { useAuth } from "@/context/authContext";
import { getSubcategoriesByCategory } from "@/lib/categorySubcategoryMapApi";
import { AlertCircle, Building2, Calendar, CheckCircle, Clock, CreditCard, Edit, Edit2, Eye, FileText, Filter, IndianRupeeIcon, Package, Pencil, Plus, Printer, Repeat, Trash2, Upload, Wallet, X } from "lucide-react";
import * as XLSX from "xlsx";
import { Download, Upload as UploadIcon } from "lucide-react";
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
  paid_now: "", 
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
        width: 20,
        height: 20,
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
          width="10"
          height="10"
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
          width="10"
          height="10"
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
const dateInputRef = useRef<HTMLInputElement>(null);
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
  property: "", category: "", vendor: "", status: "", addedBy: "", amount: "", paidBy: "", expenseDate: "",item: "",          
  subCategory: "",
});
const [bulkSelected, setBulkSelected] = useState<Set<number>>(new Set());
const [selectAll, setSelectAll] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  // Add with other state declarations
const [bankNames, setBankNames] = useState<Array<{ id: number; name: string }>>([]);
const [siteSettings, setSiteSettings] = useState({
  siteName: "ROOMAC", logo: "", phone: "", email: "", address: "",
});
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

  const [showImportModal, setShowImportModal] = useState(false);
const [importFile, setImportFile] = useState<File | null>(null);
const [importPreview, setImportPreview] = useState<any[]>([]);
const [importing, setImporting] = useState(false);
const importFileRef = useRef<HTMLInputElement>(null);
    // Add these states for payment history
  const [paymentTransactions, setPaymentTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
// Receipt Preview Modal state
const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);
const [receiptExpense, setReceiptExpense] = useState<any>(null);
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

useEffect(() => {
  const fetchSiteSettings = async () => {
    try {
      const settings = await getSettings();
      setSiteSettings({
        siteName: getSettingValue(settings, "site_name", "ROOMAC"),
        logo: getSettingValue(settings, "logo_header", ""),
        phone: getSettingValue(settings, "contact_phone", ""),
        email: getSettingValue(settings, "contact_email", ""),
        address: getSettingValue(settings, "contact_address", ""),
      });
    } catch (err) {
      console.error("Failed to load site settings:", err);
    }
  };
  fetchSiteSettings();
}, []);
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

  /* ── Print expense as a proper receipt ───────────────────────────────────── */
  // const printExpense = (exp: any) => {
  //   if (!exp) return;

  //   const totalPaid = paymentTransactions.length
  //     ? paymentTransactions.reduce((s, t) => s + (parseFloat(t.paid_amount) || 0), 0)
  //     : Number(exp.total_paid || 0);
  //   const totalAmt = Number(exp.total_amount || exp.amount || 0);
  //   const balanceAmt = totalAmt - totalPaid;

  //   const validItems = (exp.items || []).filter(
  //     (i: any) => i.name || i.item_name || i.sub_category || i.sub_category_name
  //   );

  //   const itemsRows = validItems
  //     .map(
  //       (i: any, idx: number) => `
  //       <tr>
  //         <td class="num">${idx + 1}</td>
  //         <td>${i.name || i.item_name || "—"}</td>
  //         <td>${i.sub_category || i.sub_category_name || "—"}</td>
  //         <td class="num">${i.qty || i.quantity || "—"}</td>
  //         <td class="num">${fmt(i.price || i.unit_price || 0)}</td>
  //         <td class="num">${fmt(Number(i.qty || i.quantity || 0) * Number(i.price || i.unit_price || 0))}</td>
  //       </tr>`
  //     )
  //     .join("");

  //   const paymentRows = (paymentTransactions || [])
  //     .map(
  //       (t: any) => `
  //       <tr>
  //         <td>${fmtDate(t.transaction_date?.split("T")[0] || t.created_at?.split("T")[0])}</td>
  //         <td>${t.payment_mode || "—"}</td>
  //         <td>${t.reference_no || t.transaction_id || t.cheque_no || t.upi_id || t.card_ref || "—"}</td>
  //         <td class="num">${fmt(t.paid_amount)}</td>
  //       </tr>`
  //     )
  //     .join("");

  //   const statusColor =
  //     exp.status === "Paid" ? "#16a34a" : exp.status === "Partial" ? "#d97706" : "#dc2626";
  //   const statusBg =
  //     exp.status === "Paid" ? "#dcfce7" : exp.status === "Partial" ? "#fef3c7" : "#fee2e2";
  //   const statusLabel = exp.status === "Paid" ? "PAID" : exp.status === "Partial" ? "PARTIAL" : "UNPAID";

  //   const isPdf = exp.receipt_name?.toLowerCase().endsWith(".pdf");
  //   const receiptHtml = exp.receipt_url
  //     ? isPdf
  //       ? `<div class="section-title">Attached Receipt</div><iframe src="${exp.receipt_url}" class="receipt-frame"></iframe>`
  //       : `<div class="section-title">Attached Receipt</div><img class="receipt-img" src="${exp.receipt_url}" />`
  //     : "";

  //   const win = window.open("", "_blank", "width=820,height=1000");
  //   if (!win) return;

  //   win.document.write(`
  //     <html>
  //       <head>
  //         <title>Receipt - ${exp.vendor_name || exp.category_name || "Expense"}</title>
  //         <style>
  //           * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, Helvetica, sans-serif; }
  //           body { background: #F4F6FB; padding: 24px; color: #1A2B6D; }
  //           .sheet {
  //             max-width: 720px;
  //             margin: 0 auto;
  //             background: #fff;
  //             border-radius: 14px;
  //             overflow: hidden;
  //             box-shadow: 0 4px 24px rgba(26,43,109,0.08);
  //             border: 1px solid #E2E8F4;
  //           }
  //           .head {
  //             background: linear-gradient(135deg, #0A1F5C, #1E4ED8);
  //             color: #fff;
  //             padding: 22px 28px;
  //             display: flex;
  //             justify-content: space-between;
  //             align-items: flex-start;
  //           }
  //           .head .brand { display: flex; align-items: center; gap: 10px; }
  //           .head .brand img { height: 36px; max-width: 120px; object-fit: contain; background: #fff; border-radius: 6px; padding: 3px; }
  //           .head .brand-name { font-size: 19px; font-weight: 800; letter-spacing: 0.3px; }
  //           .head .brand-sub { font-size: 10px; color: #BFD0FF; margin-top: 2px; }
  //           .head .receipt-tag { text-align: right; }
  //           .head .receipt-tag .label { font-size: 11px; letter-spacing: 1.5px; color: #BFD0FF; text-transform: uppercase; }
  //           .head .receipt-tag .num { font-size: 15px; font-weight: 700; margin-top: 2px; }

  //           .meta-bar {
  //             display: flex;
  //             justify-content: space-between;
  //             padding: 14px 28px;
  //             background: #F8FAFF;
  //             border-bottom: 1px solid #E2E8F4;
  //             font-size: 11px;
  //             color: #5A6480;
  //           }
  //           .meta-bar div span { display:block; font-weight: 700; color: #1A2B6D; font-size: 12.5px; margin-top:2px; }

  //           .body-pad { padding: 22px 28px; }

  //           .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
  //           .field .label { font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.6px; color: #8892A4; font-weight: 700; }
  //           .field .value { font-size: 13px; font-weight: 600; margin-top: 3px; color: #1A2B6D; }

  //           .status-chip {
  //             display: inline-block;
  //             padding: 3px 10px;
  //             border-radius: 20px;
  //             font-size: 11px;
  //             font-weight: 800;
  //             letter-spacing: 0.5px;
  //             color: ${statusColor};
  //             background: ${statusBg};
  //           }

  //           .section-title {
  //             font-size: 11.5px;
  //             font-weight: 800;
  //             text-transform: uppercase;
  //             letter-spacing: 0.6px;
  //             color: #3B5BDB;
  //             margin: 22px 0 10px;
  //             padding-bottom: 6px;
  //             border-bottom: 2px solid #E2E8F4;
  //           }

  //           table { width: 100%; border-collapse: collapse; }
  //           thead th {
  //             background: #F0F3FF;
  //             color: #3B5BDB;
  //             font-size: 10px;
  //             text-transform: uppercase;
  //             letter-spacing: 0.4px;
  //             text-align: left;
  //             padding: 8px 8px;
  //             font-weight: 700;
  //           }
  //           tbody td {
  //             padding: 7px 8px;
  //             font-size: 12px;
  //             border-bottom: 1px solid #EFF2FA;
  //             color: #374151;
  //           }
  //           td.num, th.num { text-align: right; }
  //           td:first-child.num { text-align: center; }

  //           .totals {
  //             margin-top: 14px;
  //             margin-left: auto;
  //             width: 280px;
  //           }
  //           .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12.5px; }
  //           .totals .row.label-muted { color: #8892A4; }
  //           .totals .row.grand {
  //             border-top: 2px solid #1A2B6D;
  //             margin-top: 4px;
  //             padding-top: 10px;
  //             font-size: 15px;
  //             font-weight: 800;
  //             color: #1A2B6D;
  //           }
  //           .totals .row.paid { color: #16a34a; font-weight: 700; }
  //           .totals .row.balance { color: #d97706; font-weight: 700; }

  //           .notes-box {
  //             background: #F8FAFF;
  //             border: 1px solid #E2E8F4;
  //             border-radius: 8px;
  //             padding: 10px 12px;
  //             font-size: 12px;
  //             color: #374151;
  //             margin-top: 6px;
  //           }

  //           .receipt-img { max-width: 100%; max-height: 380px; margin-top: 8px; border: 1px solid #E2E8F4; border-radius: 8px; display: block; }
  //           .receipt-frame { width: 100%; height: 380px; border: 1px solid #E2E8F4; border-radius: 8px; margin-top: 8px; }

  //           .foot {
  //             padding: 16px 28px 24px;
  //             text-align: center;
  //             font-size: 10.5px;
  //             color: #9AA3B5;
  //             border-top: 1px dashed #E2E8F4;
  //             margin-top: 10px;
  //           }
  //           .foot .thanks { font-size: 12px; font-weight: 700; color: #3B5BDB; margin-bottom: 4px; }

  //           @media print {
  //             body { background: #fff; padding: 0; }
  //             .sheet { box-shadow: none; border: none; border-radius: 0; max-width: 100%; }
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="sheet">
  //           <div class="head">
  //             <div class="brand">
  //               ${siteSettings.logo ? `<img src="${siteSettings.logo}" />` : ""}
  //               <div>
  //                 <div class="brand-name">${siteSettings.siteName}</div>
  //                 <div class="brand-sub">${siteSettings.address || ""}</div>
  //               </div>
  //             </div>
  //             <div class="receipt-tag">
  //               <div class="label">Expense Receipt</div>
  //               <div class="num">#${String(exp.id).padStart(5, "0")}</div>
  //             </div>
  //           </div>

  //           <div class="meta-bar">
  //             <div>Expense Date<span>${fmtDate(exp.expense_date)}</span></div>
  //             <div>Property<span>${exp.property_name || "—"}</span></div>
  //             <div style="text-align:right;">Status<span><span class="status-chip">${statusLabel}</span></span></div>
  //           </div>

  //           <div class="body-pad">
  //             <div class="grid3">
  //               <div class="field"><div class="label">Category</div><div class="value">${exp.category_name || "—"}</div></div>
  //               <div class="field"><div class="label">Sub Category</div><div class="value">${exp.sub_category_name || "—"}</div></div>
  //               <div class="field"><div class="label">Vendor</div><div class="value">${exp.vendor_name || "—"}</div></div>
  //               <div class="field"><div class="label">Added By</div><div class="value">${exp.added_by_name || "—"}</div></div>
  //               <div class="field"><div class="label">Payment Mode</div><div class="value">${exp.payment_mode || "—"}</div></div>
  //               <div class="field"><div class="label">Reference</div><div class="value">${exp.transaction_id || exp.cheque_no || exp.upi_id || exp.card_ref || "—"}</div></div>
  //             </div>

  //             ${itemsRows ? `
  //             <div class="section-title">Purchase Items</div>
  //             <table>
  //               <thead><tr><th class="num">#</th><th>Item</th><th>Sub Category</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Amount</th></tr></thead>
  //               <tbody>${itemsRows}</tbody>
  //             </table>` : ""}

  //             ${paymentRows ? `
  //             <div class="section-title">Payment History</div>
  //             <table>
  //               <thead><tr><th>Date</th><th>Mode</th><th>Reference</th><th class="num">Amount</th></tr></thead>
  //               <tbody>${paymentRows}</tbody>
  //             </table>` : ""}

  //             <div class="totals">
  //               <div class="row grand"><span>Total Amount</span><span>${fmt(totalAmt)}</span></div>
  //               <div class="row paid"><span>Paid</span><span>${fmt(totalPaid)}</span></div>
  //               <div class="row balance"><span>Balance Due</span><span>${fmt(balanceAmt)}</span></div>
  //             </div>

  //             ${exp.notes ? `
  //             <div class="section-title">Notes</div>
  //             <div class="notes-box">${exp.notes}</div>` : ""}

  //             ${receiptHtml}
  //           </div>

  //           <div class="foot">
  //             <div class="thanks">Thank you</div>
  //             ${siteSettings.email || siteSettings.phone ? `${siteSettings.email || ""} ${siteSettings.email && siteSettings.phone ? "•" : ""} ${siteSettings.phone || ""}` : ""}
  //             <div style="margin-top:4px;">Generated on ${new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
  //           </div>
  //         </div>
  //       </body>
  //     </html>
  //   `);
  //   win.document.close();
  //   win.focus();
  //   setTimeout(() => win.print(), 500);
  // };


// Open receipt preview modal instead of new window
const openReceiptPreview = (exp: any) => {
  if (!exp) return;
  setReceiptExpense(exp);
  setIsReceiptPreviewOpen(true);
  fetchPaymentTransactions(exp.id); // load payment history for the modal
};
  
const handleDownloadTemplate = () => {
  const headers = [
    "Property", "Items", "Qty", "UnitPrice",
    "Category", "SubCategory", "Vendor",
    "Amount", "PaymentMode", "Date", "AddedBy"
  ];
  const rows = [
    // Scenario 1: Single item — Groceries
   [
  "Roomac Co-Living", "Rice", "5", "60",
  "Groceries", "Food", "",          
  300, "Cash", "2026-06-20", "Kamlesh Shah"
],
// Row 2
[
  "Roomac Co-Living", "Rice,Dal,Oil", "5,2,1", "60,90,180",
  "Groceries", "Food", "Devanand",   
  660, "UPI", "2026-06-20", "Kamlesh Shah"
],
    // Scenario 3: Property Rent
    [
      "Roomac Co-Living", "June Rent", "1", "25000",
      "Property Rent", "Monthly Rent", "",
      25000, "Bank Transfer", "2026-06-01", "Kamlesh Shah"
    ],
    // Scenario 4: Maintenance — multiple items
    [
      "Roomac Co-Living", "Pipe Repair,Labour Charges", "1,1", "800,500",
      "Maintenance", "Plumbing", "Raju Plumber",
      1300, "Cash", "2026-06-10", "Kamlesh Shah"
    ],
  
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = headers.map(() => ({ wch: 22 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expenses Template");
  XLSX.writeFile(wb, "expenses_import_template.xlsx");
};
  
const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setImportFile(file);

  const reader = new FileReader();
  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target?.result as ArrayBuffer);
    const wb = XLSX.read(data, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

  const cleaned = rows
  .filter((r) => r.Property || r.Category)
  .map((r) => ({
    property_name: String(r.Property || "").trim(),
    items: (() => {
      const names = String(r.Items || "").split(",").map((s: string) => s.trim()).filter(Boolean);
      const qtys = String(r.Qty || "").split(",").map((s: string) => s.trim());
      const prices = String(r.UnitPrice || "").split(",").map((s: string) => s.trim());
      return names.map((name: string, idx: number) => ({
        name,
        qty: Number(qtys[idx]) || 1,
        price: Number(prices[idx]) || 0,
        total_amount: (Number(qtys[idx]) || 1) * (Number(prices[idx]) || 0),
      }));
    })(),
    category_name: String(r.Category || "").trim(),
    sub_category_name: String(r.SubCategory || "").trim(),
    vendor_name: String(r.Vendor || "").trim(),
    amount: Number(r.Amount) || 0,
    payment_mode: String(r.PaymentMode || "").trim(),
    expense_date: r.Date
      ? (typeof r.Date === "number"
          ? XLSX.SSF.format("yyyy-mm-dd", r.Date)
          : String(r.Date).trim())
      : "",
    added_by_name: String(r.AddedBy || "").trim(),
    // notes — REMOVED
  }));
    setImportPreview(cleaned);
  };
  reader.readAsArrayBuffer(file);
};

const handleImportSave = async () => {
  if (importPreview.length === 0) return;
  setImporting(true);
  try {
    const result = await bulkImportExpenses(importPreview);
    const created = result.data?.created || 0;
    const skipped = result.data?.skipped || [];
    
    if (created > 0) {
      toast.success(`✅ ${created} expenses imported successfully`);
    }
    
    if (skipped.length > 0) {
      // Skipped rows ka reason dikhao
      const reasons = skipped.map((s: any) => s.reason).filter(Boolean);
      const uniqueReasons = [...new Set(reasons)];
      toast.error(
        `⚠️ ${skipped.length} rows skipped:\n${uniqueReasons.join('\n')}`,
        { duration: 6000 }
      );
      console.log("Skipped rows:", skipped);
    }
    
    setShowImportModal(false);
    setImportPreview([]);
    setImportFile(null);
    await loadExpenses();
  } catch (err: any) {
    toast.error(err.message || "Import failed");
  } finally {
    setImporting(false);
  }
};


const handleExportAll = () => {
  const rows = expenses.map((e) => ({
    Property: e.property_name,
    Category: e.category_name,
    SubCategory: e.sub_category_name,
    Vendor: e.vendor_name,
    Amount: e.total_amount,
    Paid: e.total_paid,
    Balance: e.balance,
    PaymentMode: e.payment_mode,
    Date: e.expense_date,
    Status: e.status,
    Notes: e.notes,
    AddedBy: e.added_by_name,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expenses");
  XLSX.writeFile(wb, `expenses_export_${new Date().toISOString().split("T")[0]}.xlsx`);
};
  /* ── Filtered list ─────────────────────────────────────────────────────── */
 const filtered = useMemo(() => expenses.filter((e) => {
  if (filterCat !== "All" && e.category_name !== filterCat) return false;
  if (filterSubCat !== "All" && e.sub_category_name !== filterSubCat) return false;
  if (filterStatus !== "All" && e.status !== filterStatus) return false;
  if (filterProp !== "All" && e.property_name !== filterProp) return false;
  if (filterVendor !== "All" && e.vendor_name !== filterVendor) return false;
if (colSearch.item && !e.items?.some((i: any) =>
  (i.name || i.item_name)?.toLowerCase().includes(colSearch.item.toLowerCase())
)) return false;
if (colSearch.subCategory && !e.sub_category_name?.toLowerCase().includes(colSearch.subCategory.toLowerCase())) return false;
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
      name: i.name || i.item_name || "",
      category: i.category || i.category_name || "",
      sub_category: i.sub_category || i.sub_category_name || "",
      qty: String(i.qty || i.quantity || ""),
      price: String(i.price || i.unit_price || ""),
      total_amount: Number(i.total_amount) || ((Number(i.qty || i.quantity) || 0) * (Number(i.price || i.unit_price) || 0)),
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

        // ✅ Ab items mein sub_category correctly set karo subs aane ke baad
        setForm((prev: any) => ({
          ...prev,
          items: prev.items.map((item: any) => {
            const matchedSub = subs.find(
              (s: any) => s.name === (item.sub_category || item.sub_category_name || "")
            );
            return {
              ...item,
              sub_category: matchedSub ? matchedSub.name : (item.sub_category || ""),
            };
          }),
        }));

        setShowModal(true); // ← modal tab open karo jab subs aa jayein
      })
      .catch(() => {
        setDynamicSubCategories([]);
        setShowModal(true);
      });
  } else {
    setDynamicSubCategories([]);
    setShowModal(true);
  }
}

  function validate() {
  const e: Record<string, string> = {};
  if (!form.property_id) e.property_id = "Required";
  if (!form.category_id) e.category_id = "Required";
  if (!form.expense_date) e.expense_date = "Required";
  // if (!form.added_by_name?.trim()) e.added_by_name = "Required";
  // if (form.items.filter((i: any) => i.name).length === 0) e.items = "At least one item required";
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
    const validItems = form.items.filter(
      (i: any) => i.name?.trim() || i.sub_category || i.qty || i.price
    );
    const updatedItems = validItems.map((item: any) => ({
      ...item,
      total_amount: (Number(item.qty) || 0) * (Number(item.price) || 0),
    }));
    
   const itemsTotal = updatedItems.reduce((sum, i) => sum + i.total_amount, 0);
const expenseTotalAmount =
  itemsTotal > 0
    ? itemsTotal
    : (form.total_amount !== "" && form.total_amount !== null && form.total_amount !== undefined
        ? Number(form.total_amount)
        : 0);
const paymentAmount = form.paid_now ? Number(form.paid_now) : 0;
    
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

useEffect(() => {
  if (isInitializingEdit.current) {
    return;
  }
  const computedTotal = form.items.reduce(
    (sum, i) => sum + ((Number(i.qty) || 0) * (Number(i.price) || 0)),
    0
  );
  if (computedTotal > 0) {
    setForm((f) => ({ ...f, total_amount: String(computedTotal) }));
  }
}, [form.items]);

useEffect(() => {
  if (isInitializingEdit.current) {
    const id = setTimeout(() => { isInitializingEdit.current = false; }, 0);
    return () => clearTimeout(id);
  }
}, [form.property_id]);

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

// ── Bulk delete handler ──────────────────────────────────────────────
const handleBulkDelete = async () => {
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
      actions: 'flex justify-center gap-2 mt-4',
    },
    buttonsStyling: false,
  });
  if (!result.isConfirmed) return;

  try {
    await Promise.all([...bulkSelected].map((id) => deleteExpense(id)));
    toast.success(`${bulkSelected.size} expenses deleted`);
    setBulkSelected(new Set());
    setSelectAll(false);
    await loadExpenses();
  } catch (err: any) {
    toast.error(err.message || 'Bulk delete failed');
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

    // Helper: wrap a field in a grid item, optionally spanning full width
    const fieldWrapper = (content: string, spanFull = false) => {
      return `<div style="${spanFull ? 'grid-column: span 2;' : ''}">${content}</div>`;
    };

    let html = '';

    if (mode === 'UPI') {
      html = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          ${fieldWrapper(`
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">UPI ID</label>
            <input id="upiId" type="text" placeholder="example@upi" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px; outline: none;" />
          `, true)}
        </div>
      `;
    } else if (mode === 'Bank Transfer') {
      const bankOptions = bankNames.map(bank => `<option value="${bank.name}">${bank.name}</option>`).join('');
      html = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          ${fieldWrapper(`
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Bank Name</label>
            <select id="bankName" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px; background: #fff; cursor: pointer;">
              <option value="">Select Bank</option>
              ${bankOptions}
              <option value="Other">Other (Specify)</option>
            </select>
            <input id="bankNameOther" type="text" placeholder="Enter other bank name" style="display: none; width: 100%; margin-top: 8px; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
          `)}
          ${fieldWrapper(`
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Transaction ID / Reference</label>
            <input id="transactionRef" type="text" placeholder="Transaction reference" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
          `)}
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
      const bankOptions = bankNames.map(bank => `<option value="${bank.name}">${bank.name}</option>`).join('');
      html = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          ${fieldWrapper(`
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Cheque Number</label>
            <input id="chequeNo" type="text" placeholder="Cheque number" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
          `)}
          ${fieldWrapper(`
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Bank Name</label>
            <select id="chequeBank" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px; background: #fff; cursor: pointer;">
              <option value="">Select Bank</option>
              ${bankOptions}
              <option value="Other">Other (Specify)</option>
            </select>
            <input id="chequeBankOther" type="text" placeholder="Enter other bank name" style="display: none; width: 100%; margin-top: 8px; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
          `)}
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
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          ${fieldWrapper(`
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Card Reference / Last 4 digits</label>
            <input id="cardRef" type="text" placeholder="Last 4 digits" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
          `, true)}
        </div>
      `;
    } else if (mode === 'Online Payment Gateway') {
      html = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          ${fieldWrapper(`
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Transaction ID</label>
            <input id="transactionId" type="text" placeholder="Gateway transaction ID" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
          `)}
          ${fieldWrapper(`
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Payment Gateway Name</label>
            <input id="gatewayName" type="text" placeholder="e.g., Razorpay, Stripe" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
          `)}
        </div>
      `;
    } else if (mode === 'Wallet') {
      html = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          ${fieldWrapper(`
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Wallet Reference / Transaction ID</label>
            <input id="walletRef" type="text" placeholder="Wallet transaction ID" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
          `, true)}
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
}, [paymentModal.open, bankNames]);

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
    <div >

      {/* STICKY HEADER + COMPACT STATS */}
      <div
  className="-mt-6 sm:-mt-4"
  style={{
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "#F4F6FB",
  }}
>
  {/* Stats + Action Buttons Row */}
  <div className="px-2 py-2">
    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3">

      {/* LEFT - Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 flex-1">
        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border-0 p-2 sm:p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Wallet className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600" />
            <p className="text-[9px] sm:text-[10px] text-blue-700 font-semibold">
              Total Expenses
            </p>
          </div>
          <p className="text-xs sm:text-sm font-bold text-blue-800">
            {fmt(computedStats.total_amount || 0)}
          </p>
          <p className="text-[8px] text-blue-600 mt-0.5">
            {stats.total_count || expenses.length} records
          </p>
        </div>

        {/* Total Paid */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border-0 p-2 sm:p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
            <p className="text-[9px] sm:text-[10px] text-green-700 font-semibold">
              Total Paid
            </p>
          </div>
          <p className="text-xs sm:text-sm font-bold text-green-800">
            {fmt(computedStats.paid_amount || 0)}
          </p>
          <p className="text-[8px] text-green-600 mt-0.5">
            {stats.paid_count || 0} paid
          </p>
        </div>

        {/* Pending Balance */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border-0 p-2 sm:p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-600" />
            <p className="text-[9px] sm:text-[10px] text-orange-700 font-semibold">
              Pending Balance
            </p>
          </div>
          <p className="text-xs sm:text-sm font-bold text-orange-800">
            {fmt(computedStats.pending_amount || 0)}
          </p>
          <p className="text-[8px] text-orange-600 mt-0.5">
            {stats.pending_count || 0} pending
          </p>
        </div>

        {/* Partial Payments */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border-0 p-2 sm:p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Repeat className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600" />
            <p className="text-[9px] sm:text-[10px] text-purple-700 font-semibold">
              Partial Payments
            </p>
          </div>
          <p className="text-xs sm:text-sm font-bold text-purple-800">
            {(computedStats.partial_count || 0)}
          </p>
          <p className="text-[8px] text-purple-600 mt-0.5">
            {stats.partial_count || 0} expenses
          </p>
        </div>
      </div>

      {/* RIGHT - Action Buttons */}
     <div className="flex items-center justify-end gap-2 shrink-0 sm:mt-11">
  {/* Add Expense - First on mobile */}
  {can("create_expenses") && (
    <button
      onClick={openAdd}
      className="order-1 sm:order-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#1A2B6D] to-[#3B5BDB] text-white text-xs font-semibold shadow-sm whitespace-nowrap"
    >
      <Plus size={14} />
      Add Expense
    </button>
  )}

  {/* Filter - Second on mobile */}
  <button
    onClick={() => setFilterPanelOpen(true)}
    className="order-2 sm:order-1 flex items-center justify-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white text-xs font-semibold shadow-sm whitespace-nowrap"
  >
    <Filter size={14} />
    <span className="hidden sm:inline">Filters</span>

    {(filterCat !== "All" ||
      filterStatus !== "All" ||
      filterProp !== "All" ||
      filterMonth !== "" ||
      filterFromDate !== "" ||
      filterToDate !== "") && (
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white text-[#2563EB] text-[9px] font-bold">
        !
      </span>
    )}
  </button>

  {/* Export - Third on mobile */}
  <button
    onClick={handleExportAll}
    className="order-3 flex items-center justify-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white text-xs font-semibold shadow-sm whitespace-nowrap hover:bg-slate-50"
  >
    <Download size={14} />
    <span className="hidden sm:inline">Export</span>
  </button>

  {/* Import - Fourth on mobile */}
  {can("create_expenses") && (
    <button
      onClick={() => setShowImportModal(true)}
      className="order-4 flex items-center justify-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white text-xs font-semibold shadow-sm whitespace-nowrap hover:bg-slate-50"
    >
      <UploadIcon size={14} />
      <span className="hidden sm:inline">Import</span>
    </button>
  )}
</div>
    </div>
  </div>

  {/* Bulk Selection Bar - BELOW STATS */}
  {bulkSelected.size > 0 && (
    <div className="px-3 pb-2">
      <div className="flex items-center justify-between gap-3 border border-[#E2E8F4] rounded-xl px-3 py-2 min-h-[44px]">
        <span className="font-bold text-[#1A2B6D] text-sm whitespace-nowrap">
          {bulkSelected.size} selected
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setBulkSelected(new Set());
              setSelectAll(false);
            }}
            className="text-xs text-[#8892A4] hover:text-gray-600 px-2 py-1"
          >
            Clear
          </button>

          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg text-xs font-bold text-[#DC2626] hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete {bulkSelected.size}
          </button>
        </div>
      </div>
    </div>
  )}
</div>

<div style={{ padding: "4px 0px" }}>
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
    <div className="flex flex-col h-[310px] sm:h-[490px]">

      {/* Single overflow container — both scroll directions */}
      <div className="overflow-auto flex-1 min-h-0">
        <table
          className="border-collapse text-[11px] font-sans"
          style={{ tableLayout: "fixed", minWidth: "1200px", width: "100%" }}
        >
          <colgroup>
            <col style={{ width: "36px" }} />    {/* Checkbox */}
            <col style={{ width: "70px" }} />    {/* Actions */}
            <col style={{ width: "130px" }} />   {/* Property */}
            <col style={{ width: "90px" }} />    {/* Item */}
            <col style={{ width: "90px" }} />    {/* Category */}
            <col style={{ width: "80px" }} />    {/* Sub Cat */}
            <col style={{ width: "80px" }} />    {/* Vendor */}
            <col style={{ width: "70px" }} />    {/* Amount */}
            <col style={{ width: "90px" }} />    {/* Paid By */}
            <col style={{ width: "30px" }} />    {/* Receipt */}
            <col style={{ width: "50px" }} />    {/* Exp Date */}
            <col style={{ width: "40px" }} />    {/* Status */}
            <col style={{ width: "85px" }} />    {/* Added By */}
            <col style={{ width: "90px" }} />   {/* Created */}
          </colgroup>

          {/* ── STICKY THEAD ── */}
          <thead className="sticky top-0 z-10">
            {/* Title Row */}
            <tr className="bg-gray-200 border-b border-gray-300">
              {/* Checkbox – sticky left */}
              <th
                className="px-1.5 py-1.5 text-center border-r border-gray-300 bg-gray-200"
              >
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => {
                    setSelectAll(e.target.checked);
                    setBulkSelected(e.target.checked ? new Set(filtered.map((x) => x.id)) : new Set());
                  }}
                  className="w-3.5 h-3.5 cursor-pointer"
                />
              </th>
              {/* Actions – sticky left */}
              <th
                className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200"
              >
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Actions</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Property</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Item</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Category</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Sub Category</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Vendor</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Amount</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Paid By</span>
              </th>
              <th className="px-1.5 py-1.5 text-center border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide flex flex-wrap">Rcpt</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide whitespace-nowrap">Exp Date</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Status</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Added By</span>
              </th>
              <th className="px-1.5 py-1.5 text-left bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Created</span>
              </th>
            </tr>

            {/* Search Row */}
            <tr className="bg-white border-b border-gray-300">
              {/* Checkbox – sticky */}
              <td
                className="p-1 border-r border-gray-200 bg-white"
              />
              {/* Actions – sticky */}
              <td
                className="p-1 border-r border-gray-200 bg-white"
              />
              <td className="p-1 border-r border-gray-200">
                <input value={colSearch.property} onChange={(e) => setColSearch((p) => ({ ...p, property: e.target.value }))} placeholder="Search…" className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0" />
              </td>
              <td className="p-1 border-r border-gray-200">
                <input value={colSearch.item || ""} onChange={(e) => setColSearch((p) => ({ ...p, item: e.target.value }))} placeholder="Search…" className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0" />
              </td>
              <td className="p-1 border-r border-gray-200">
                <input value={colSearch.category} onChange={(e) => setColSearch((p) => ({ ...p, category: e.target.value }))} placeholder="Search…" className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0" />
              </td>
              <td className="p-1 border-r border-gray-200">
                <input value={colSearch.subCategory || ""} onChange={(e) => setColSearch((p) => ({ ...p, subCategory: e.target.value }))} placeholder="Search…" className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0" />
              </td>
              <td className="p-1 border-r border-gray-200">
                <input value={colSearch.vendor} onChange={(e) => setColSearch((p) => ({ ...p, vendor: e.target.value }))} placeholder="Search…" className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0" />
              </td>
              <td className="p-1 border-r border-gray-200">
                <input value={colSearch.amount} onChange={(e) => setColSearch((p) => ({ ...p, amount: e.target.value }))} placeholder="Search…" className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0" />
              </td>
              <td className="p-1 border-r border-gray-200">
                <input value={colSearch.paidBy} onChange={(e) => setColSearch((p) => ({ ...p, paidBy: e.target.value }))} placeholder="Search…" className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0" />
              </td>
              {/* Receipt – empty */}
              <td className="p-1 border-r border-gray-200" />
              <td className="p-1 border-r border-gray-200">
                <input value={colSearch.expenseDate} onChange={(e) => setColSearch((p) => ({ ...p, expenseDate: e.target.value }))} placeholder="29 May" className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0" />
              </td>
              <td className="p-1 border-r border-gray-200">
                <input value={colSearch.status} onChange={(e) => setColSearch((p) => ({ ...p, status: e.target.value }))} placeholder="Search…" className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0" />
              </td>
              <td className="p-1 border-r border-gray-200">
                <input value={colSearch.addedBy} onChange={(e) => setColSearch((p) => ({ ...p, addedBy: e.target.value }))} placeholder="Search…" className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0" />
              </td>
              {/* Created – empty */}
              <td className="p-1" />
            </tr>
          </thead>

          {/* ── TBODY ── */}
          <tbody>
            {loading ? (
              <tr><td colSpan={14} className="py-16 text-center text-slate-500 text-xs">Loading expenses…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={14} className="py-12 text-center text-slate-500 text-xs">No expenses found</td></tr>
            ) : (
              paginatedItems.map((exp) => {
                const cc = getCatColor(exp.category_name);
                const firstItem = exp.items?.find((i: any) => i.name || i.item_name);
                const validItemCount = exp.items?.filter((i: any) => i.name || i.item_name).length || 0;
                return (
                  <tr
                    key={exp.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Checkbox – sticky */}
                    <td
                      className="px-1.5 py-1.5 text-center border-r border-slate-100 bg-white hover:bg-slate-50/80"
                    >
                      <input
                        type="checkbox"
                        checked={bulkSelected.has(exp.id)}
                        onChange={(e) => {
                          setBulkSelected((prev) => {
                            const next = new Set(prev);
                            e.target.checked ? next.add(exp.id) : next.delete(exp.id);
                            return next;
                          });
                        }}
                        className="w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>

                    {/* Actions – sticky */}
                   <td className="px-1 py-1.5 border-r border-slate-100 bg-white hover:bg-slate-50/80">
  <div className="flex items-center gap-[1px] flex-nowrap">
    <button
      onClick={() => {
        setViewItem(exp);
        fetchPaymentTransactions(exp.id);
      }}
      title="View"
      className="w-6 h-6 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center transition-colors"
    >
      <Eye size={12} />
    </button>

    {(exp.balance > 0 || exp.total_paid < exp.total_amount) && (
      <button
        onClick={() => openPaymentModal(exp)}
        title="Make Payment"
        className="w-6 h-6 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-colors"
      >
        <IndianRupeeIcon size={12} />
      </button>
    )}

    {can("edit_expenses") && (
      <button
        onClick={() => openEdit(exp)}
        title="Edit"
        className="w-6 h-6 rounded-lg text-green-600 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
      >
        <Edit size={12} />
      </button>
    )}

    {can("delete_expenses") && (
      <button
        onClick={() =>
          handleDelete(exp.id, exp.vendor_name || exp.category_name)
        }
        title="Delete"
        className="w-6 h-6 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors"
      >
        <Trash2 size={12} />
      </button>
    )}
  </div>
</td>

                    {/* Property */}
                    <td className="px-1.5 py-1.5 text-[11px] font-medium text-slate-800 border-r border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="truncate">{exp.property_name || '—'}</span>
                      </span>
                    </td>

                    {/* Item */}
                    <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-100">
  {firstItem ? (
    <div className="flex items-center gap-1 min-w-0">
      <span className="font-medium text-slate-700 truncate">
        {firstItem.name || firstItem.item_name}
      </span>

      {validItemCount > 1 && (
        <span className="text-[9px] text-slate-400 whitespace-nowrap">
          +{validItemCount - 1} more
        </span>
      )}
    </div>
  ) : (
    <span className="text-slate-400">—</span>
  )}
</td>
                    {/* Category */}
                    <td className="px-1.5 py-1.5 border-r border-slate-100">
                      {exp.category_name ? (
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                          style={{ background: cc.bg, color: cc.text }}
                        >
                          <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: cc.dot }} />
                          <span className="truncate">{exp.category_name}</span>
                        </span>
                      ) : <span className="text-slate-400">—</span>}
                    </td>

                    {/* Sub Category */}
                    <td className="px-1.5 py-1.5 text-[10px] text-slate-500 border-r border-slate-100">
                      {exp.sub_category_name ? (
                        <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-slate-100 text-slate-600 truncate max-w-full">
                          {exp.sub_category_name}
                        </span>
                      ) : <span className="text-slate-400">—</span>}
                    </td>

                    {/* Vendor */}
                    <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-100 truncate">
                      {exp.vendor_name || '—'}
                    </td>

                    {/* Amount */}
                    <td className="px-1.5 py-1.5 text-[11px] font-bold text-slate-700 border-r border-slate-100 whitespace-nowrap">
                      {fmt(exp.total_amount || exp.amount || 0)}
                    </td>

                    {/* Paid By */}
                    <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-100 truncate">
                      {exp.payment_mode ? (
                        <span>
                          {exp.payment_mode}
                          {exp.payment_mode === 'UPI' && exp.upi_id && <span className="text-[9px] text-slate-400 ml-0.5">(UPI:{exp.upi_id})</span>}
                          {exp.payment_mode === 'Cheque' && exp.cheque_no && <span className="text-[9px] text-slate-400 ml-0.5">(Chq:{exp.cheque_no})</span>}
                          {(exp.payment_mode === 'Bank Transfer' || exp.payment_mode === 'Online Payment Gateway') && exp.transaction_id && <span className="text-[9px] text-slate-400 ml-0.5">(Txn:{exp.transaction_id})</span>}
                        </span>
                      ) : <span className="text-slate-400 text-[10px]">—</span>}
                    </td>

                    {/* Receipt */}
                    <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
                      {exp.receipt_url ? (
                        <ReceiptThumbnail url={exp.receipt_url} filename={exp.receipt_name} onClick={() => setViewItem(exp)} />
                      ) : <span className="text-slate-400 text-[10px]">—</span>}
                    </td>

                    {/* Expense Date */}
                    <td className="px-1.5 py-1.5 text-[10px] text-slate-500 border-r border-slate-100 whitespace-nowrap">
                      {fmtDate(exp.expense_date)}
                    </td>

                    {/* Status */}
                    <td className="px-1.5 py-1.5 border-r border-slate-100">
                      <span
                        className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold whitespace-nowrap"
                        style={{
                          background: exp.status === 'Paid' ? '#DCFCE7' : exp.status === 'Partial' ? '#FEF3C7' : '#FEF2F2',
                          color: exp.status === 'Paid' ? '#166534' : exp.status === 'Partial' ? '#92400E' : '#991B1B',
                        }}
                      >
                        {exp.status === 'Paid' ? 'Paid' : exp.status === 'Partial' ? 'Partial' : 'Unpaid'}
                      </span>
                    </td>

                    {/* Added By */}
                    <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-100 truncate">
                      {exp.added_by_name || '—'}
                    </td>

                    {/* Created */}
                    <td className="px-1.5 py-1.5 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <span>{new Date(exp.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[9px]">{new Date(exp.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* ── FOOTER ── */}
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200 rounded-b-lg">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => { const val = e.target.value; setItemsPerPage(val === 'All' ? 'All' : Number(val)); setCurrentPage(1); }}
          className="px-2 py-1 border border-gray-300 rounded text-[11px] bg-white outline-none cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value="All">All</option>
        </select>
        <span>entries</span>
        <span className="ml-2">Showing {paginatedItems.length} of {filtered.length} entries</span>
      </div>

      {itemsPerPage !== 'All' && totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-7 px-2 text-xs border border-gray-300 rounded bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50">Previous</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum = i + 1;
            if (totalPages > 5) {
              if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
            }
            return (
              <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`h-7 w-7 text-xs border rounded ${currentPage === pageNum ? 'bg-blue-600 border-blue-600 text-white font-bold' : 'bg-white border-gray-300 text-slate-700 hover:bg-slate-50'}`}>{pageNum}</button>
            );
          })}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-7 px-2 text-xs border border-gray-300 rounded bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50">Next</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-[11px] whitespace-nowrap">
<span className="text-emerald-600 font-bold">Paid: {fmt(paginatedItems.reduce((s, e) => s + Number(e.total_paid || 0), 0))}</span>        <span className="text-amber-600 font-bold">Balance: {fmt(paginatedItems.reduce((s, e) => s + Number(e.balance || 0), 0))}</span>
        <span className="text-slate-700 font-bold">Total: {fmt(paginatedItems.reduce((s, e) => s + Number(e.total_amount || e.amount || 0), 0))}</span>
      </div>
    </div>
  </div>
</div>
{showModal && (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm">
    <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">

      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-bold leading-tight text-white">
            {editId ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {editId ? "Edit Expense" : "Add Expense"}
          </h2>
          <p className="text-[10px] leading-tight text-blue-100">
            <span className="text-rose-300">*</span> required
          </p>
        </div>
        <button
          onClick={() => setShowModal(false)}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          <X className="h-3.5 w-3.5 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">

        {/* SECTION 1 — Basic Information */}
        <div className="mb-2 rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
          <div className="mb-1.5 flex items-center gap-1 border-b border-slate-50 pb-1">
            <Building2 className="h-3 w-3 flex-shrink-0 text-blue-500" />
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-600">Basic Information</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Property<span className="ml-0.5 text-rose-400">*</span>
              </label>
              <div className="[&_button]:!h-8 [&_input]:!h-8 [&_*]:!rounded-md [&_*]:!text-[10px]">
                <SearchableDropdown
                  options={properties}
                  value={form.property_id}
                  onChange={(val, opt) => setForm((f) => ({ ...f, property_id: val, property_name: opt.name }))}
                  placeholder="Select property"
                  error={errors.property_id}
                />
              </div>
              {errors.property_id && (
                <p className="mt-0.5 flex items-center gap-0.5 text-[9px] text-red-500">
                  <AlertCircle className="h-2.5 w-2.5" />{errors.property_id}
                </p>
              )}
            </div>
            <div>
              <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Category<span className="ml-0.5 text-rose-400">*</span>
              </label>
              <div className="[&_button]:!h-8 [&_input]:!h-8 [&_*]:!rounded-md [&_*]:!text-[10px]">
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
              </div>
              {errors.category_id && (
                <p className="mt-0.5 flex items-center gap-0.5 text-[9px] text-red-500">
                  <AlertCircle className="h-2.5 w-2.5" />{errors.category_id}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2 — Purchase Items */}
        <div className="mb-2">
          <div className="mb-1.5 flex items-center gap-1 border-b border-slate-50 pb-1">
            <Package className="h-3 w-3 flex-shrink-0 text-blue-500" />
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-600">Purchase Items</span>
            <span className="text-[9px] text-slate-400">(items from bill)</span>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
                {/* Table header */}
                <div className="grid grid-cols-[30px_1fr_120px_80px_90px_35px] gap-1.5 border-b border-slate-100 bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-600">
                  <div>#</div>
                  <div>Item Name</div>
                  <div>Sub Category</div>
                  <div>Qty</div>
                  <div>Unit Price</div>
                  <div></div>
                </div>

                {/* Item rows */}
                {form.items.map((item: any, idx: number) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-[30px_1fr_120px_80px_90px_35px] items-center gap-1.5 px-2 py-1 ${
                      idx < form.items.length - 1 ? "border-b border-slate-50" : ""
                    } ${idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"}`}
                  >
                    <div className="text-center text-[10px] font-semibold text-blue-600">{idx + 1}</div>

                    <div className="relative">
                      <input
                        type="text"
                        value={item.name || ""}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        placeholder="Item name"
                        list={`items-list-${item.id}`}
                        className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      <datalist id={`items-list-${item.id}`}>
                        {purchasedItems.map((pi) => (
                          <option key={pi} value={pi} />
                        ))}
                      </datalist>
                    </div>

                    <select
                      value={item.sub_category || ""}
                      onChange={(e) => updateItem(item.id, "sub_category", e.target.value)}
                      className="h-8 rounded-md border border-slate-200 bg-slate-50 px-1.5 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      <option value="">Select Sub Cat</option>
                      {item.sub_category && !dynamicSubCategories.find((s) => s.name === item.sub_category) && (
                        <option value={item.sub_category}>{item.sub_category}</option>
                      )}
                      {dynamicSubCategories.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      value={item.qty || ""}
                      onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                      placeholder="Qty"
                      className="h-8 rounded-md border border-slate-200 bg-slate-50 px-1.5 text-center text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />

                    <input
                      type="number"
                      value={item.price || ""}
                      onChange={(e) => updateItem(item.id, "price", e.target.value)}
                      placeholder="Price"
                      className="h-8 rounded-md border border-slate-200 bg-slate-50 px-1.5 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />

                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={form.items.length <= 1}
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-red-100 bg-red-50 ${
                        form.items.length > 1 ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-30"
                      }`}
                    >
                      <Trash2 className="h-2.5 w-2.5 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Items footer — single line, no wrap */}
            <div className="flex flex-nowrap items-center justify-between gap-1.5 overflow-x-auto border-t border-slate-100 bg-slate-50 px-2 py-1.5">
              <button
                onClick={addItem}
                className="flex-shrink-0 whitespace-nowrap rounded-md border border-blue-600 bg-white px-2 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-50"
              >
                + Add Item
              </button>

              <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1">
  <Calendar
    className="h-3.5 w-3.5 text-blue-600 cursor-pointer"
    onClick={() => {
      dateInputRef.current?.showPicker?.();
      dateInputRef.current?.focus();
    }}
  />

  <span className="text-[8px] uppercase tracking-wide text-slate-400">
    Expense Date
  </span>

  <input
    ref={dateInputRef}
    type="date"
    value={form.expense_date}
    onChange={(e) =>
      setForm((f) => ({ ...f, expense_date: e.target.value }))
    }
    className="
      border-none bg-transparent p-0
      text-[11px] font-semibold text-[#0A1F5C]
      outline-none
      [&::-webkit-calendar-picker-indicator]:hidden
      [&::-webkit-inner-spin-button]:hidden
    "
  />
</div>

              <div className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-blue-700 px-2.5 py-1">
                <span className="text-[9px] text-white/90">Items Total:</span>
                <span className="text-[12px] font-extrabold text-white">{fmt(totalAmount)}</span>
              </div>
            </div>
          </div>
          {errors.items && (
            <p className="mt-0.5 flex items-center gap-0.5 text-[9px] text-red-500">
              <AlertCircle className="h-2.5 w-2.5" />{errors.items}
            </p>
          )}
        </div>

        {/* SECTION 3 — Payment Details */}
        <div className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
          <div className="mb-1.5 flex items-center gap-1 border-b border-slate-50 pb-1">
            <Wallet className="h-3 w-3 flex-shrink-0 text-blue-500" />
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-600">Payment Details</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Total Amount (₹)
              </label>
              <input
                type="number"
                value={form.total_amount !== undefined && form.total_amount !== null && form.total_amount !== "" ? form.total_amount : ""}
                onChange={(e) => setForm((f) => ({ ...f, total_amount: e.target.value === "" ? "" : e.target.value }))}
                placeholder="Enter total"
                className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
             {totalAmount > 0 && Number(form.total_amount) !== totalAmount && form.total_amount !== "" && (
  <div className="mt-0.5 text-[9px] text-slate-400">Items: {fmt(totalAmount)} • override</div>
)}
            </div>
            <div>
  <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">
    Amount Paid Now (₹)
  </label>
  <input
    type="number"
    value={form.paid_now ?? ""}
    onChange={(e) => setForm((f) => ({ ...f, paid_now: e.target.value }))}
    placeholder="0 (leave blank if unpaid)"
    className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
  />
  {/* <div className="mt-0.5 text-[9px] text-slate-400">Only fill this if you're recording a payment right now</div> */}
</div>

            <div>
              <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Paid Through
              </label>
              <select
                value={form.payment_mode || ""}
                onChange={(e) => {
                  setForm((f) => ({ ...f, payment_mode: e.target.value }));
                  setPaymentDetails({});
                  setShowCustomBankInput(false);
                }}
                className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Select Payment Method</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.name}>{method.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Vendor Name
              </label>
              <div className="[&_button]:!h-8 [&_input]:!h-8 [&_*]:!rounded-md [&_*]:!text-[10px]">
                <SearchableDropdown
                  options={vendors}
                  value={form.vendor_name || ""}
                  onChange={(val, opt) => setForm((f) => ({ ...f, vendor_name: opt.name }))}
                  placeholder="Select vendor"
                  valueKey="name"
                />
              </div>
            </div>

            {form.payment_mode === "UPI" && (
              <div>
                <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">UPI ID</label>
                <input
                  type="text"
                  placeholder="example@upi"
                  value={paymentDetails.upiId || ""}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                  className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            )}

            {form.payment_mode === "Bank Transfer" && (
              <>
                <div>
                  <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">Bank Name</label>
                  <select
                    value={paymentDetails.bankName || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "Other") setPaymentDetails({ ...paymentDetails, bankName: "", showOtherBank: true });
                      else setPaymentDetails({ ...paymentDetails, bankName: v, showOtherBank: false });
                    }}
                    className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="">Select Bank</option>
                    {bankNames.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  {paymentDetails.showOtherBank && (
                    <input
                      type="text"
                      placeholder="Other bank name"
                      value={paymentDetails.otherBankName || ""}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value, otherBankName: e.target.value })}
                      className="mt-1.5 h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  )}
                </div>
                <div>
                  <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">Transaction ID</label>
                  <input
                    type="text"
                    placeholder="Reference"
                    value={paymentDetails.referenceNo || ""}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, referenceNo: e.target.value })}
                    className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </>
            )}

            {form.payment_mode === "Cheque" && (
              <>
                <div>
                  <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">Cheque No.</label>
                  <input
                    type="text"
                    placeholder="Cheque number"
                    value={paymentDetails.chequeNo || ""}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, chequeNo: e.target.value })}
                    className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">Bank Name</label>
                  <select
                    value={paymentDetails.bankName || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "Other") setPaymentDetails({ ...paymentDetails, bankName: "", showOtherBankCheque: true });
                      else setPaymentDetails({ ...paymentDetails, bankName: v, showOtherBankCheque: false });
                    }}
                    className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="">Select Bank</option>
                    {bankNames.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  {paymentDetails.showOtherBankCheque && (
                    <input
                      type="text"
                      placeholder="Other bank"
                      value={paymentDetails.otherBankName || ""}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value, otherBankName: e.target.value })}
                      className="mt-1.5 h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  )}
                </div>
              </>
            )}

            {form.payment_mode === "Card" && (
              <div>
                <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">Card Ref / Last 4</label>
                <input
                  type="text"
                  placeholder="Last 4 digits"
                  value={paymentDetails.cardRef || ""}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, cardRef: e.target.value })}
                  className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            )}

            {form.payment_mode === "Online Payment Gateway" && (
              <>
                <div>
                  <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">Transaction ID</label>
                  <input
                    type="text"
                    placeholder="Gateway txn ID"
                    value={paymentDetails.transactionId || ""}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionId: e.target.value })}
                    className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">Gateway Name</label>
                  <select
                    value={paymentDetails.gatewayName || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "Other") setPaymentDetails({ ...paymentDetails, gatewayName: "", showOtherGateway: true });
                      else setPaymentDetails({ ...paymentDetails, gatewayName: v, showOtherGateway: false });
                    }}
                    className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="">Select</option>
                    <option value="Razorpay">Razorpay</option>
                    <option value="Stripe">Stripe</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Other">Other</option>
                  </select>
                  {paymentDetails.showOtherGateway && (
                    <input
                      type="text"
                      placeholder="Other gateway"
                      value={paymentDetails.otherGatewayName || ""}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, gatewayName: e.target.value, otherGatewayName: e.target.value })}
                      className="mt-1.5 h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  )}
                </div>
              </>
            )}

            {form.payment_mode === "Wallet" && (
              <div>
                <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">Wallet Reference</label>
                <input
                  type="text"
                  placeholder="Wallet txn ID"
                  value={paymentDetails.walletRef || ""}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, walletRef: e.target.value })}
                  className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            )}

            {/* Receipt Upload */}
            <div>
              <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">Receipt</label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md border-[1.5px] border-dashed px-2 ${
                  receiptPreview ? "border-blue-600 bg-blue-50" : "border-blue-300 bg-slate-50"
                }`}
              >
                <Upload className={`h-3 w-3 flex-shrink-0 ${receiptPreview ? "text-blue-600" : "text-slate-400"}`} />
                <span
                  className={`flex-1 truncate text-[10px] ${
                    receiptPreview ? "font-semibold text-blue-600" : "text-slate-400"
                  }`}
                >
                  {receiptPreview || "Upload"}
                </span>
                {receiptPreview && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReceiptFile(null);
                      setReceiptPreview("");
                    }}
                    className="flex-shrink-0 text-slate-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
              </div>
            </div>

            {/* Notes — full width on all screens */}
            <div className="col-span-2">
              <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Additional notes…"
                rows={2}
                className="w-full resize-y rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-shrink-0 gap-2 border-t border-slate-100 px-3 py-2">
        <button
          onClick={() => setShowModal(false)}
          className="h-8 flex-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={submitting}
          className={`h-8 flex-[2] rounded-lg text-[11px] font-bold text-white ${
            submitting
              ? "cursor-not-allowed bg-slate-300"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90"
          }`}
        >
          {submitting ? "Saving…" : editId ? " Update" : " Save"}
        </button>
      </div>
    </div>
  </div>
)}

  {viewItem && (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm">
    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">

      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-bold leading-tight text-white">
            <Eye className="h-3.5 w-3.5" />
            Expense Details
          </h2>
          <p className="text-[10px] leading-tight text-blue-100">
            {viewItem.property_name} • {fmtDate(viewItem.expense_date)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
onClick={() => openReceiptPreview(viewItem)}
            title="Print"
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
          >
            <Printer className="h-3.5 w-3.5 text-white" />
          </button>
          <button
            onClick={() => { setViewItem(null); setPaymentTransactions([]); }}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
          >
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">

        {/* SECTION 1 — Overview */}
        <div className="mb-2 rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
          <div className="mb-1.5 flex items-center gap-1 border-b border-slate-50 pb-1">
            <Building2 className="h-3 w-3 flex-shrink-0 text-blue-500" />
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-600">Overview</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Property</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                {viewItem.property_name}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Category</div>
              {(() => {
                const cc = getCatColor(viewItem.category_name);
                return (
                  <span className="mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: cc.bg, color: cc.text }}>
                    <span className="h-1 w-1 rounded-full" style={{ background: cc.dot }} />
                    {viewItem.category_name}
                  </span>
                );
              })()}
            </div>
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Sub Category</div>
              <div className="mt-0.5 text-[11px] font-medium text-slate-700">{viewItem.sub_category_name || "—"}</div>
            </div>
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Vendor</div>
              <div className="mt-0.5 text-[11px] font-medium text-slate-700">{viewItem.vendor_name || "—"}</div>
            </div>
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Added By</div>
              <div className="mt-0.5 text-[11px] font-medium text-slate-700">{viewItem.added_by_name || "—"}</div>
            </div>
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Status</div>
              <span
                className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: viewItem.status === "Paid" ? "#DCFCE7" : viewItem.status === "Partial" ? "#FEF3C7" : "#FEF2F2",
                  color: viewItem.status === "Paid" ? "#166534" : viewItem.status === "Partial" ? "#92400E" : "#991B1B",
                }}
              >
                {viewItem.status === "Paid" ? "✓ Paid" : viewItem.status === "Partial" ? "⟳ Partial" : "⏳ Unpaid"}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2 — Amount Summary */}
        <div className="mb-2 rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
          <div className="mb-1.5 flex items-center gap-1 border-b border-slate-50 pb-1">
            <Wallet className="h-3 w-3 flex-shrink-0 text-blue-500" />
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-600">Amount Summary</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md bg-blue-50 p-2">
              <div className="text-[9px] font-semibold uppercase tracking-wide text-blue-600">Total</div>
              <div className="mt-0.5 text-[14px] font-extrabold text-blue-800">{fmt(viewItem.total_amount || viewItem.amount || 0)}</div>
            </div>
            <div className="rounded-md bg-emerald-50 p-2">
              <div className="text-[9px] font-semibold uppercase tracking-wide text-emerald-600">Paid</div>
              <div className="mt-0.5 text-[14px] font-extrabold text-emerald-700">{fmt(viewItem.total_paid || 0)}</div>
            </div>
            <div className="rounded-md bg-amber-50 p-2">
              <div className="text-[9px] font-semibold uppercase tracking-wide text-amber-600">Balance</div>
              <div className="mt-0.5 text-[14px] font-extrabold text-amber-700">{fmt(viewItem.balance || 0)}</div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {viewItem.notes && (
          <div className="mb-2 rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
            <div className="mb-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">Notes</div>
            <div className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700">{viewItem.notes}</div>
          </div>
        )}

        {/* Receipt */}
        {viewItem.receipt_url && (
          <div className="mb-2 rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
            <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">Receipt</div>
            {viewItem.receipt_name?.toLowerCase().endsWith(".pdf") ? (
              <iframe src={viewItem.receipt_url} title="Receipt PDF" className="mb-2 h-72 w-full rounded-md border border-slate-200" />
            ) : (
              <div className="mb-2 flex min-h-[160px] items-center justify-center rounded-md border border-slate-200 bg-slate-50">
                <img
                  src={viewItem.receipt_url}
                  alt="Receipt"
                  className="max-h-72 max-w-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
            <div className="flex gap-2">
              <a
                href={viewItem.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 px-2.5 py-1 text-[10px] font-semibold text-white"
              >
                Open Receipt
              </a>
              <button
onClick={() => openReceiptPreview(viewItem)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Printer className="h-3 w-3" /> Print Receipt
              </button>
            </div>
          </div>
        )}

        {/* Items table */}
        {viewItem.items?.filter((i: any) => i.name || i.item_name || i.sub_category || i.sub_category_name).length > 0 && (
          <div className="mb-2">
            <div className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-blue-600">
              <Package className="h-3 w-3" />
              Purchase Items ({viewItem.items.filter((i: any) => i.name || i.item_name || i.sub_category || i.sub_category_name).length})
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full min-w-[420px] border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-50">
                    {["Item Name", "Sub Category", "Qty", "Price", "Amount"].map((h) => (
                      <th key={h} className="whitespace-nowrap border-b border-slate-100 px-2 py-1.5 text-left text-[9px] font-bold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewItem.items
                    .filter((i: any) => i.name || i.item_name || i.sub_category || i.sub_category_name)
                    .map((it: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/60">
                        <td className="px-2 py-1.5 font-semibold text-slate-700">{it.name || it.item_name || "—"}</td>
                        <td className="px-2 py-1.5 text-slate-500">{it.sub_category || it.sub_category_name || "—"}</td>
                        <td className="px-2 py-1.5 text-slate-600">{it.qty || it.quantity || "—"}</td>
                        <td className="px-2 py-1.5 text-slate-600">{fmt(it.price || it.unit_price || 0)}</td>
                        <td className="px-2 py-1.5 font-bold text-slate-700">
                          {fmt(Number(it.qty || it.quantity || 0) * Number(it.price || it.unit_price || 0))}
                        </td>
                      </tr>
                    ))}
                  <tr className="bg-blue-50">
                    <td colSpan={4} className="px-2 py-1.5 text-right text-[11px] font-bold text-blue-800">Total:</td>
                    <td className="px-2 py-1.5 text-[12px] font-extrabold text-blue-800">
                      {fmt(
                        viewItem.items
                          .filter((i: any) => i.name || i.item_name || i.sub_category || i.sub_category_name)
                          .reduce((s: number, i: any) => s + Number(i.qty || i.quantity || 0) * Number(i.price || i.unit_price || 0), 0)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment History */}
        {paymentTransactions.length > 0 && (
          <div className="mb-2">
            <div className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-blue-600">
              <CreditCard className="h-3 w-3" />
              Payment History ({paymentTransactions.length})
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full min-w-[480px] border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-50">
                    {["Date", "Amount", "Mode", "Reference", "Notes", "By"].map((h) => (
                      <th key={h} className="whitespace-nowrap border-b border-slate-100 px-2 py-1.5 text-left text-[9px] font-bold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paymentTransactions.map((t, idx) => (
                    <tr key={t.id || idx} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-2 py-1.5 text-slate-600">{fmtDate(t.transaction_date?.split("T")[0] || t.created_at?.split("T")[0])}</td>
                      <td className="px-2 py-1.5 font-bold text-emerald-700">{fmt(t.paid_amount)}</td>
                      <td className="px-2 py-1.5 text-slate-600">{t.payment_mode}</td>
                      <td className="px-2 py-1.5 text-slate-500">{t.reference_no || t.transaction_id || t.cheque_no || t.upi_id || t.card_ref || "—"}</td>
                      <td className="max-w-[160px] truncate px-2 py-1.5 text-slate-500">{t.notes || "—"}</td>
                      <td className="px-2 py-1.5 text-slate-500">{t.created_by || "—"}</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50">
                    <td colSpan={2} className="px-2 py-1.5 font-bold text-emerald-700">
                      Total: {fmt(paymentTransactions.reduce((s, t) => s + (parseFloat(t.paid_amount) || 0), 0))}
                    </td>
                    <td colSpan={4} className="px-2 py-1.5 text-right font-bold text-amber-700">
                      Pending: {fmt((viewItem?.total_amount || 0) - paymentTransactions.reduce((s, t) => s + (parseFloat(t.paid_amount) || 0), 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-shrink-0 gap-2 border-t border-slate-100 px-3 py-2">
        <button
onClick={() => openReceiptPreview(viewItem)}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
        >
          <Printer className="h-3.5 w-3.5" /> Print
        </button>
        <button
          onClick={() => { setViewItem(null); setPaymentTransactions([]); }}
          className="h-8 flex-[2] rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-[11px] font-bold text-white hover:opacity-90"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


{/* ── EXPENSE RECEIPT PREVIEW MODAL ── */}
{isReceiptPreviewOpen && receiptExpense && (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm">
    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-bold leading-tight text-white">
            <FileText className="h-3.5 w-3.5" />
            Expense Receipt
          </h2>
          <p className="text-[10px] leading-tight text-blue-100">
            Receipt #{String(receiptExpense.id).padStart(5, '0')} • {receiptExpense.vendor_name || receiptExpense.category_name}
          </p>
        </div>
        <button
          onClick={() => setIsReceiptPreviewOpen(false)}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          <X className="h-3.5 w-3.5 text-white" />
        </button>
      </div>

      {/* Scrollable Receipt Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
       <div id="receipt-print-area" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden">
  
  {/* ─── WATERMARK: full site name, diagonal (bottom-left to top-right) ─── */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
  <span
    className="font-black leading-none whitespace-nowrap"
    style={{
      fontSize: "min(10vw, 56px)",
      letterSpacing: "0.02em",
      color: "rgba(100, 116, 139, 0.09)",
      transform: "rotate(-30deg)",
    }}
  >
    {siteSettings.siteName?.split(" ")[0]}
  </span>
</div>

  {/* ─── HEADER: Logo left · Site Name center · Receipt No. (format: REC-0067-2606) ─── */}
  <div className="flex items-center border-b border-slate-200 pb-3 mb-3 relative z-10">
    <div className="w-28 flex-shrink-0">
      {siteSettings.logo && (
        <img
          src={siteSettings.logo}
          alt={siteSettings.siteName}
          className="h-20 w-auto object-contain"
          onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
        />
      )}
    </div>
   <div className="flex-1 text-center">
  <h2 className="text-lg font-bold text-slate-800">
    {siteSettings.siteName}
  </h2>

  <p className="text-sm font-semibold text-slate-700">
    Expense Receipt
  </p>
</div>
    <div className="w-28 text-right text-[10px] text-slate-400">
      <div>
        <span className="block font-semibold text-slate-600">Receipt No.</span>
    <span className="text-[10px]">
  REC-{String(receiptExpense.id).padStart(4, '0')}-
  {(() => {
    const date = receiptExpense.expense_date
      ? new Date(receiptExpense.expense_date)
      : new Date();

    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${mm}${yyyy}`;
  })()}
</span>
      </div>
    </div>
  </div>

  {/* ─── META BAR: Expense Date · Property · Status ─── */}
  <div className="flex justify-between border-b border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-500 mb-3 relative z-10">
    <div>
      <span className="uppercase text-[9px] font-semibold">Expense Date</span>
      <span className="block font-bold text-slate-800">{fmtDate(receiptExpense.expense_date)}</span>
    </div>
    <div>
      <span className="uppercase text-[9px] font-semibold">Property</span>
      <span className="block font-bold text-slate-800">{receiptExpense.property_name || '—'}</span>
    </div>
    <div className="text-right">
      <span className="uppercase text-[9px] font-semibold">Status</span>
      <span className="block">
        <span
          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{
            background: receiptExpense.status === 'Paid' ? '#DCFCE7' : receiptExpense.status === 'Partial' ? '#FEF3C7' : '#FEF2F2',
            color: receiptExpense.status === 'Paid' ? '#166534' : receiptExpense.status === 'Partial' ? '#92400E' : '#991B1B',
          }}
        >
          {receiptExpense.status === 'Paid' ? 'PAID' : receiptExpense.status === 'Partial' ? 'PARTIAL' : 'UNPAID'}
        </span>
      </span>
    </div>
  </div>

  {/* ─── DETAILS GRID (Category, Sub Category, Vendor, Added By, Payment Mode, Reference) ─── */}
  <div className="grid grid-cols-3 gap-x-4 gap-y-1 mb-3 text-xs relative z-10">
    <div><span className="uppercase text-[9px] text-slate-400 font-semibold">Category</span><div className="font-medium text-slate-800">{receiptExpense.category_name || '—'}</div></div>
    <div><span className="uppercase text-[9px] text-slate-400 font-semibold">Sub Category</span><div className="font-medium text-slate-800">{receiptExpense.sub_category_name || '—'}</div></div>
    <div><span className="uppercase text-[9px] text-slate-400 font-semibold">Vendor</span><div className="font-medium text-slate-800">{receiptExpense.vendor_name || '—'}</div></div>
    <div><span className="uppercase text-[9px] text-slate-400 font-semibold">Added By</span><div className="font-medium text-slate-800">{receiptExpense.added_by_name || '—'}</div></div>
    <div><span className="uppercase text-[9px] text-slate-400 font-semibold">Payment Mode</span><div className="font-medium text-slate-800">{receiptExpense.payment_mode || '—'}</div></div>
    <div><span className="uppercase text-[9px] text-slate-400 font-semibold">Reference</span><div className="font-medium text-slate-800">{receiptExpense.transaction_id || receiptExpense.cheque_no || receiptExpense.upi_id || receiptExpense.card_ref || '—'}</div></div>
  </div>

  {/* ─── PURCHASE ITEMS TABLE ─── */}
{receiptExpense.items?.some((i: any) => i.name || i.item_name || i.sub_category || i.sub_category_name || i.qty || i.quantity || i.price || i.unit_price || i.total_amount) && (
  <div className="mb-3 relative z-10">
    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Purchase Items</p>
    <table className="w-full border-collapse border border-slate-300 text-xs">
      <thead>
        <tr className="bg-slate-100">
          <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">#</th>
          <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Item</th>
          <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Category</th>
          <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Sub Category</th>
          <th className="border border-slate-300 px-2 py-1 text-right font-semibold text-slate-600">Qty</th>
          <th className="border border-slate-300 px-2 py-1 text-right font-semibold text-slate-600">Price</th>
          <th className="border border-slate-300 px-2 py-1 text-right font-semibold text-slate-600">Amount</th>
        </tr>
      </thead>
      <tbody>
        {receiptExpense.items
          .filter((i: any) => i.name || i.item_name || i.sub_category || i.sub_category_name || i.qty || i.quantity || i.price || i.unit_price || i.total_amount)
          .map((item: any, idx: number) => (
            <tr key={idx} className="hover:bg-slate-50">
              <td className="border border-slate-300 px-2 py-1 text-center text-slate-500">{idx + 1}</td>
              <td className="border border-slate-300 px-2 py-1 font-medium text-slate-700">
                {item.name || item.item_name || item.sub_category || item.sub_category_name || '—'}
              </td>
              <td className="border border-slate-300 px-2 py-1 text-slate-600">
                {receiptExpense.category_name || '—'}
              </td>
              <td className="border border-slate-300 px-2 py-1 text-slate-500">
                {item.sub_category || item.sub_category_name || '—'}
              </td>
              <td className="border border-slate-300 px-2 py-1 text-right text-slate-600">
                {item.qty || item.quantity || '—'}
              </td>
              <td className="border border-slate-300 px-2 py-1 text-right text-slate-600">
                ₹{Number(item.price || item.unit_price || 0).toLocaleString()}
              </td>
              <td className="border border-slate-300 px-2 py-1 text-right font-medium text-slate-700">
                ₹{(Number(item.qty || item.quantity || 0) * Number(item.price || item.unit_price || 0)).toLocaleString()}
              </td>
            </tr>
          ))}
      </tbody>
      <tfoot>
        <tr className="bg-blue-50 font-bold">
          <td colSpan={6} className="border border-slate-300 px-2 py-1 text-right text-blue-700">Total</td>
          <td className="border border-slate-300 px-2 py-1 text-right text-blue-700">
            ₹{receiptExpense.items
              .filter((i: any) => i.name || i.item_name || i.sub_category || i.sub_category_name || i.qty || i.quantity || i.price || i.unit_price || i.total_amount)
              .reduce((sum: number, i: any) => sum + (Number(i.qty || i.quantity || 0) * Number(i.price || i.unit_price || 0)), 0)
              .toLocaleString()}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
)}

  {/* ─── PAYMENT HISTORY TABLE ─── */}
  {paymentTransactions.length > 0 && (
    <div className="mb-3 relative z-10">
      <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Payment History</p>
      <table className="w-full border-collapse border border-slate-300 text-xs">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600"> Payment Date</th>
            <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Mode</th>
            <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Transaction Id</th>
            <th className="border border-slate-300 px-2 py-1 text-right font-semibold text-slate-600">Amount</th>
          </tr>
        </thead>
        <tbody>
          {paymentTransactions.map((t, idx) => (
            <tr key={t.id || idx} className="hover:bg-slate-50">
              <td className="border border-slate-300 px-2 py-1 text-slate-600">{fmtDate(t.transaction_date?.split('T')[0] || t.created_at?.split('T')[0])}</td>
              <td className="border border-slate-300 px-2 py-1 text-slate-600">{t.payment_mode}</td>
<td className="border border-slate-300 px-2 py-1 text-slate-500 text-[10px]">
  {(() => {
    const mode = t.payment_mode;
    if (mode === 'UPI' && t.upi_id) return `UPI: ${t.upi_id}`;
    if (mode === 'Cheque') {
      const parts = [];
      if (t.cheque_no) parts.push(`Chq: ${t.cheque_no}`);
      if (t.cheque_bank) parts.push(`Bank: ${t.cheque_bank}`);
      return parts.join(' | ') || t.reference_no || '—';
    }
    if (mode === 'Bank Transfer') {
      const parts = [];
      if (t.bank_name) parts.push(`Bank: ${t.bank_name}`);
      if (t.transaction_id) parts.push(`Txn: ${t.transaction_id}`);
      return parts.join(' | ') || t.reference_no || '—';
    }
    if (mode === 'Card' && t.card_ref) return `Card: ${t.card_ref}`;
    if (mode === 'Online Payment Gateway') {
      const parts = [];
      if (t.bank_name) parts.push(`Gateway: ${t.bank_name}`);
      if (t.transaction_id) parts.push(`Txn: ${t.transaction_id}`);
      return parts.join(' | ') || t.reference_no || '—';
    }
    if (mode === 'Wallet') {
      const parts = [];
      if (t.bank_name) parts.push(`Wallet: ${t.bank_name}`);
      if (t.transaction_id) parts.push(`Ref: ${t.transaction_id}`);
      return parts.join(' | ') || t.reference_no || '—';
    }
    return t.reference_no || '—';
  })()}
</td>              <td className="border border-slate-300 px-2 py-1 text-right font-medium text-emerald-700">₹{Number(t.paid_amount).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-emerald-50 font-bold">
            <td colSpan={3} className="border border-slate-300 px-2 py-1 text-right text-emerald-700">Total Paid</td>
            <td className="border border-slate-300 px-2 py-1 text-right text-emerald-700">
              ₹{paymentTransactions.reduce((s, t) => s + Number(t.paid_amount), 0).toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )}

  {/* ─── TOTALS BLOCK (right‑aligned) ─── */}
  <div className="mt-3 flex justify-end relative z-10">
    <div className="w-64">
      <div className="flex justify-between py-1 text-sm">
        <span className="text-slate-600">Total Amount</span>
        <span className="font-bold text-slate-800">₹{Number(receiptExpense.total_amount || receiptExpense.amount).toLocaleString()}</span>
      </div>
      <div className="flex justify-between py-1 text-sm">
        <span className="text-slate-600">Paid</span>
        <span className="font-bold text-emerald-700">₹{Number(receiptExpense.total_paid || 0).toLocaleString()}</span>
      </div>
      <div className="flex justify-between py-1 text-sm border-t-2 border-slate-300 mt-1 pt-1">
        <span className="font-bold text-slate-700">Balance Due</span>
        <span className="font-bold text-amber-700">₹{Number(receiptExpense.balance || 0).toLocaleString()}</span>
      </div>
    </div>
  </div>

  {/* ─── NOTES ─── */}
  {receiptExpense.notes && (
    <div className="bg-yellow-50 p-2 rounded-lg mt-3 relative z-10">
      <p className="text-[10px] font-medium text-yellow-700 mb-0.5">Notes</p>
      <p className="text-sm text-yellow-800">{receiptExpense.notes}</p>
    </div>
  )}

  {/* ─── ATTACHED RECEIPT ─── */}
  {receiptExpense.receipt_url && (
    <div className="mt-3 relative z-10">
      <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Attached Receipt</p>
      {receiptExpense.receipt_name?.toLowerCase().endsWith('.pdf') ? (
        <iframe src={receiptExpense.receipt_url} className="w-full h-64 rounded-md border border-slate-200" />
      ) : (
        <img src={receiptExpense.receipt_url} alt="Receipt" className="max-h-72 max-w-full rounded-md border border-slate-200" />
      )}
    </div>
  )}

  {/* ─── FOOTER (with "Powered by") ─── */}
 <div className="text-center text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-200 relative z-10 receipt-footer">
  <p>
    {siteSettings.phone && `Tel: ${siteSettings.phone}`}
    {siteSettings.phone && siteSettings.email && '  |  '}
    {siteSettings.email && `Email: ${siteSettings.email}`}
  </p>
  <p className="mt-0.5">
    Powered by {siteSettings.siteName}
  </p>
  <p className="mt-0.5">
    Generated on {new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
  </p>
</div>
</div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-shrink-0 gap-2 border-t border-slate-100 px-3 py-2">
        <button
          onClick={() => setIsReceiptPreviewOpen(false)}
          className="h-8 flex-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
        >
          Close
        </button>
        <button
          onClick={() => {
            // Print the receipt content from the print area
            const content = document.getElementById('receipt-print-area');
            if (!content) return;
            const win = window.open('', '_blank', 'width=800,height=900');
            if (!win) return;
            // Copy the content's HTML and add minimal styling
            win.document.write(`
              <html>
                <head><title>Expense Receipt</title>
                  <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #fff; }
                    #receipt-print-area { max-width: 720px; margin: 0 auto; }
                    
                    ${Array.from(document.styleSheets).reduce((acc, sheet) => {
                      try {
                        const rules = sheet.cssRules || sheet.rules;
                        if (rules) {
                          for (let rule of rules) acc += rule.cssText;
                        }
                      } catch(e) {}
                      return acc;
                    }, '')}
                  </style>
                </head>
                <body>
                  ${content.outerHTML}
                </body>
              </html>
            `);
            win.document.close();
            win.focus();
            win.print();
          }}
          className="h-8 flex-[2] rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-[11px] font-bold text-white hover:opacity-90 flex items-center justify-center gap-1"
        >
          <Printer className="h-3.5 w-3.5" /> Print Receipt
        </button>
      </div>
    </div>
  </div>
)}

      {/* COMPACT PAYMENT MODAL */}
    {/* COMPACT PAYMENT MODAL */}
{paymentModal.open && paymentModal.expense && (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm">
    <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">

      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-bold leading-tight text-white">
            <IndianRupeeIcon className="h-3.5 w-3.5" />
            Make Payment
          </h2>
          <p className="text-[10px] leading-tight text-blue-100">
            {paymentModal.expense.vendor_name || paymentModal.expense.category_name}
          </p>
        </div>
        <button
          onClick={closePaymentModal}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          <X className="h-3.5 w-3.5 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">

        {/* Balance Summary - calculated balance */}
        <div className="mb-2 rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md bg-blue-50 p-2">
              <div className="text-[9px] font-semibold uppercase tracking-wide text-blue-600">Total</div>
              <div className="mt-0.5 text-[12px] font-extrabold text-blue-800">
                {fmt(paymentModal.expense.total_amount)}
              </div>
            </div>
            <div className="rounded-md bg-emerald-50 p-2">
              <div className="text-[9px] font-semibold uppercase tracking-wide text-emerald-600">Paid</div>
              <div className="mt-0.5 text-[12px] font-extrabold text-emerald-700">
                {fmt(paymentModal.expense.total_paid)}
              </div>
            </div>
            <div className="rounded-md bg-amber-50 p-2">
              <div className="text-[9px] font-semibold uppercase tracking-wide text-amber-600">Balance</div>
              <div className="mt-0.5 text-[12px] font-extrabold text-amber-700">
                {fmt((paymentModal.expense.total_amount || 0) - (paymentModal.expense.total_paid || 0))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
          <div className="mb-1.5 flex items-center gap-1 border-b border-slate-50 pb-1">
            <Wallet className="h-3 w-3 flex-shrink-0 text-blue-500" />
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-600">Payment Details</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Payment Amount - left column */}
            <div>
              <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Payment Amount<span className="ml-0.5 text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-blue-700">₹</span>
                <input
                  id="paymentAmount"
                  type="text"
                  placeholder="0.00"
                  className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-5 pr-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Payment Date - right column */}
            <div>
              <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">Payment Date</label>
              <input
                id="transactionDate"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Payment Mode - spans both columns */}
            <div className="col-span-2">
              <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Payment Mode<span className="ml-0.5 text-rose-400">*</span>
              </label>
              <select
                id="paymentMode"
                className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Select Mode</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Card</option>
                <option value="Online Payment Gateway">Online Payment Gateway</option>
                <option value="Wallet">Wallet</option>
              </select>
            </div>

            {/* Conditional Fields Container - spans both columns */}
            <div id="paymentConditionalFields" className="col-span-2" />

            {/* Notes - spans both columns */}
            <div className="col-span-2">
              <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Notes <span className="text-[8px] normal-case text-slate-400">(optional)</span>
              </label>
              <textarea
                id="paymentNotes"
                rows={2}
                placeholder="Add payment notes…"
                className="w-full resize-y rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-shrink-0 gap-2 border-t border-slate-100 px-3 py-2">
        <button
          onClick={closePaymentModal}
          className="h-8 flex-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          onClick={processPayment}
          disabled={submitting}
          className={`h-8 flex-[2] rounded-lg text-[11px] font-bold text-white ${
            submitting ? "cursor-not-allowed bg-slate-300" : "bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90"
          }`}
        >
          {submitting ? "Processing…" : "Confirm Payment"}
        </button>
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

{showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-blue-600 to-cyan-500">
              <h2 className="text-sm font-bold text-white"> Import Expenses</h2>
              <button onClick={() => { setShowImportModal(false); setImportPreview([]); setImportFile(null); }} className="text-white/70 hover:text-white text-lg">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-700 mb-2">Step 1: Download Template</p>
                <p className="text-xs text-blue-600 mb-2">
  Columns: Property, Items (comma separated), Qty (comma separated), UnitPrice (comma separated), Category, SubCategory, Vendor, Amount, PaymentMode, Date (YYYY-MM-DD), AddedBy.
</p>
                <button onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50">
                  <Download size={12} /> Download Template
                </button>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Step 2: Upload Filled Excel</p>
                <div
                  onClick={() => importFileRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    importFile ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <UploadIcon size={20} className={`mx-auto mb-2 ${importFile ? "text-blue-500" : "text-gray-400"}`} />
                  <p className="text-xs font-medium text-gray-600">
                    {importFile ? importFile.name : "Click to upload Excel file"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">.xlsx or .xls files only</p>
                  <input ref={importFileRef} type="file" accept=".xlsx,.xls" onChange={handleImportFileChange} className="hidden" />
                </div>
              </div>
              {importPreview.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Step 3: Preview ({importPreview.length} expenses found)</p>
                  <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead className="sticky top-0 bg-gray-50">
                        <tr className="border-b">
<th className="text-left p-2 font-semibold text-gray-600">Property</th>
<th className="text-left p-2 font-semibold text-gray-600">Items (Qty × Price)</th> {/* ← CHANGE */}
<th className="text-left p-2 font-semibold text-gray-600">Category</th>
<th className="text-left p-2 font-semibold text-gray-600">Vendor</th>
<th className="text-left p-2 font-semibold text-gray-600">Amount</th>
<th className="text-left p-2 font-semibold text-gray-600">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((row, i) => (
                          <tr key={i} className="border-b hover:bg-gray-50">
<td className="p-2 font-medium text-gray-800">{row.property_name}</td>
<td className="p-2 text-gray-600"> {/* ← CHANGE */}
  {row.items?.length > 0
    ? row.items.map((i: any) =>
        `${i.name}${i.qty ? ` (${i.qty}×₹${i.price})` : ""}`
      ).join(", ")
    : "—"}
</td>
<td className="p-2 text-gray-600">{row.category_name}</td>
<td className="p-2 text-gray-600">{row.vendor_name || "—"}</td>
<td className="p-2 text-gray-600">{fmt(row.amount)}</td>
<td className="p-2 text-gray-600">{row.expense_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                    ⚠️ Property and Category names must exactly match existing records, or rows will be skipped.
                  </p>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t flex gap-3">
              <button onClick={() => { setShowImportModal(false); setImportPreview([]); setImportFile(null); }}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleImportSave}
                disabled={importing || importPreview.length === 0}
                className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {importing ? (
                  <><span className="animate-spin">⟳</span> Importing...</>
                ) : (
                  <> Import {importPreview.length > 0 ? `(${importPreview.length} expenses)` : ""}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


    
    </div>
  );
}