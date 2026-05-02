import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  getExpenses,
  getExpenseStats,
  createExpense,
  updateExpense,
  deleteExpense,
  addExpensePayment,
  getBankNames,
} from "@/lib/expenseApi";
import { getAllStaff } from "@/lib/staffApi";
import { listProperties } from "@/lib/propertyApi";
import { consumeMasters, getMasterItemsByTab, getMasterValues } from "@/lib/masterApi";
import { getPurchases } from "@/lib/materialPurchaseApi";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { useAuth } from "@/context/authContext";

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 });
const fmtDate = (d: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
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

  // Filters
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterProp, setFilterProp] = useState("All");
  const [filterPaymentMode, setFilterPaymentMode] = useState("All");
  const [search, setSearch] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  // Add with other state declarations
const [bankNames, setBankNames] = useState<Array<{ id: number; name: string }>>([]);
const [showCustomBankInput, setShowCustomBankInput] = useState(false);

  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    expense: any | null;
  }>({
    open: false,
    expense: null,
  });

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

    try {
      const tabRes = await getMasterItemsByTab("Common");
      const tabList = Array.isArray(tabRes.data) ? tabRes.data : [];
      const catItem = tabList.find(
        (i: any) =>
          i.name?.toLowerCase().replace(/\s+/g, "") === "expensescategory"
      );
      if (catItem) {
        const valRes = await getMasterValues(catItem.id);
        const vals = Array.isArray(valRes.data)
          ? valRes.data
          : Array.isArray(valRes)
          ? valRes
          : [];
        setCategories(
          vals
            .filter((v: any) => v.isactive === 1 || v.is_active === 1)
            .map((v: any) => ({
              id: String(v.id),
              name: v.value || v.name || "",
            }))
        );
      }
    } catch {}

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
    } catch (err: any) {
      toast.error(err.message || "Failed to load expenses");
    } finally {
      setLoading(false);
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
  const filtered = useMemo(
    () =>
      expenses.filter((e) => {
        if (filterCat !== "All" && e.category_name !== filterCat) return false;
        if (filterStatus !== "All" && e.status !== filterStatus) return false;
        if (filterProp !== "All" && e.property_name !== filterProp) return false;
        if (filterPaymentMode !== "All" && e.payment_mode !== filterPaymentMode) return false;
        if (
          search &&
          ![
            e.category_name,
            e.payment_mode,
            e.added_by_name,
          ].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
        )
          return false;
        return true;
      }),
    [expenses, filterCat, filterStatus, filterProp, filterPaymentMode, search]
  );

  /* ── Items helpers ─────────────────────────────────────────────────────── */
  const setItems = (items: any[]) => setForm((f) => ({ ...f, items }));
  const addItem = () => {
    const newItemObj = {
      id: Date.now() + Math.random(),
      name: "",
      category: form.category_name || "Groceries",
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
    setPaymentDetails({});
    setShowModal(true);
  }

function openEdit(exp: any) {
  const initialItems = exp.items?.length
    ? exp.items.map((i: any) => ({
        id: i.id || Math.random(),
        name: i.name || i.item_name,
        category: i.category || i.category_name || "Groceries",
        qty: i.qty || i.quantity || "",
        price: i.price || i.unit_price || "",
        total_amount: i.total_amount || ((Number(i.qty) || 0) * (Number(i.price) || 0)),
      }))
    : [{
        id: Date.now() + Math.random(),
        name: "",
        category: exp.category_name || "Groceries",
        qty: "",
        price: "",
        total_amount: 0,
      }];
    
  setForm({
    property_id: String(exp.property_id),
    property_name: exp.property_name,
    category_id: String(exp.category_id),
    category_name: exp.category_name,
    total_amount: exp.total_amount || exp.amount || "",
    vendor_name: exp.vendor_name || "",
    payment_mode: exp.payment_mode || null,
    expense_date: exp.expense_date?.split("T")[0] || "",
    added_by_name: exp.added_by_name,
    notes: exp.notes || "",
    items: initialItems,
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
  } else {
    setPaymentDetails({});
  }
  
  setEditId(exp.id);
  setErrors({});
  setReceiptFile(null);
  setReceiptPreview(exp.receipt_name || "");
  setShowModal(true);
}

  function validate() {
    const e: Record<string, string> = {};
    if (!form.property_id) e.property_id = "Required";
    if (!form.category_id) e.category_id = "Required";
    if (!form.expense_date) e.expense_date = "Required";
    if (!form.added_by_name?.trim()) e.added_by_name = "Required";
    if (form.items.filter((i: any) => i.name).length === 0) e.items = "At least one item required";
    return e;
  }

/* ── Save ──────────────────────────────────────────────────────────────── */
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
    
    // IMPORTANT: The expense total amount should be the FULL bill amount (items total)
    // The user-entered amount is the PAYMENT amount, not the expense total
    const expenseTotalAmount = itemsTotal; // Full bill amount from items
    const paymentAmount = form.total_amount ? Number(form.total_amount) : itemsTotal; // Amount being paid now
    
    console.log("Expense total amount (full bill):", expenseTotalAmount);
    console.log("Payment amount (being paid now):", paymentAmount);
    
    // Calculate the payment that will be recorded immediately
    let total_paid = 0;
    let balance = expenseTotalAmount;
    let status = 'Unpaid';
    
    // If payment mode is selected, this is an immediate payment
    if (form.payment_mode && paymentAmount > 0) {
      total_paid = paymentAmount;
      balance = expenseTotalAmount - paymentAmount;
      
      if (balance === 0 && total_paid > 0) {
        status = 'Paid';
      } else if (total_paid > 0 && balance > 0) {
        status = 'Partial';
      }
    }
    
    // Prepare payment details for database
    let cheque_no = null;
    let cheque_bank = null;
    let transaction_id = null;
    let upi_id = null;
    let card_ref = null;
    let bank_name = null;
    
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
    }
    
    const payload = {
      property_id: form.property_id,
      property_name: form.property_name,
      category_id: form.category_id,
      category_name: form.category_name,
      total_amount: expenseTotalAmount, // Full bill amount
      total_paid: total_paid, // Amount paid now
      balance: balance, // Remaining balance
      status: status, // Paid, Partial, or Unpaid
      vendor_name: form.vendor_name,
      payment_mode: form.payment_mode,
      expense_date: form.expense_date,
      added_by_name: form.added_by_name,
      notes: form.notes,
      items: updatedItems,
      // Payment details
      cheque_no,
      cheque_bank,
      transaction_id,
      upi_id,
      card_ref,
      bank_name,
    };
    
    console.log("Saving expense payload:", payload);

    if (editId) {
      await updateExpense(editId, payload, receiptFile);
      toast.success("Expense updated");
    } else {
      const response = await createExpense(payload, receiptFile);
      toast.success("Expense created");
      
      // Also create a payment transaction record if payment was made
      if (form.payment_mode && paymentAmount > 0 && paymentAmount < expenseTotalAmount) {
        try {
          await addExpensePayment(response.data.id, {
            paid_amount: paymentAmount,
            payment_mode: form.payment_mode,
            transaction_date: form.expense_date,
            reference_no: transaction_id || cheque_no || null,
            notes: `Initial payment of ${fmt(paymentAmount)} towards total bill of ${fmt(expenseTotalAmount)}`,
            created_by: user?.name,
          });
          console.log("Payment transaction created for expense:", response.data.id);
        } catch (paymentError) {
          console.error("Failed to create payment transaction:", paymentError);
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
  useEffect(() => {
    if (form.category_name && form.items.length > 0) {
      const firstItem = form.items[0];
      if (firstItem.category !== form.category_name) {
        setItems(
          form.items.map((item: any, idx: number) =>
            idx === 0 ? { ...item, category: form.category_name } : item
          )
        );
      }
    }
  }, [form.category_name]);

  const processPayment = async () => {
    if (!paymentModal.expense) return;
    
    const paid_amount = parseFloat((document.getElementById('paymentAmount') as HTMLInputElement)?.value || "0");
    const payment_mode = (document.getElementById('paymentMode') as HTMLSelectElement)?.value;
    const transaction_date = (document.getElementById('transactionDate') as HTMLInputElement)?.value;
    const reference_no = (document.getElementById('referenceNo') as HTMLInputElement)?.value;
    const payment_notes = (document.getElementById('paymentNotes') as HTMLTextAreaElement)?.value;
    
    let paymentDetailsStr = '';
    if (payment_mode === 'UPI') {
      const upiId = (document.getElementById('upiId') as HTMLInputElement)?.value;
      if (upiId) paymentDetailsStr = `UPI ID: ${upiId}`;
    } else if (payment_mode === 'Bank Transfer') {
  let bankName = (document.getElementById('bankNameSelect') as HTMLSelectElement)?.value;
  const customBankName = (document.getElementById('customBankName') as HTMLInputElement)?.value;
  if (customBankName) bankName = customBankName;
  const bankRef = (document.getElementById('bankRef') as HTMLInputElement)?.value;
  paymentDetailsStr = `Bank: ${bankName || 'N/A'}, Ref: ${bankRef || 'N/A'}`;
} else if (payment_mode === 'Cheque') {
      const chequeNo = (document.getElementById('chequeNo') as HTMLInputElement)?.value;
      const chequeBank = (document.getElementById('chequeBank') as HTMLInputElement)?.value;
      paymentDetailsStr = `Cheque: ${chequeNo || 'N/A'}, Bank: ${chequeBank || 'N/A'}`;
    } else if (payment_mode === 'Card') {
      const cardRef = (document.getElementById('cardRef') as HTMLInputElement)?.value;
      if (cardRef) paymentDetailsStr = `Card: ${cardRef}`;
    }
    
    const finalNotes = payment_notes + (paymentDetailsStr ? `\n${paymentDetailsStr}` : '');
    
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
      await addExpensePayment(paymentModal.expense.id, {
        paid_amount,
        payment_mode,
        transaction_date,
        reference_no,
        notes: finalNotes,
        created_by: user?.name,
      });
      
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

  // Add conditional fields effect for payment modal
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
          <div>
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">UPI ID</label>
            <input id="upiId" type="text" placeholder="example@upi" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px; outline: none;" />
          </div>
        `;
      } else if (mode === 'Bank Transfer') {
  html = `
    <div style="margin-bottom: 10px;">
      <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Bank Name</label>
      <select id="bankNameSelect" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;">
        <option value="">Select Bank</option>
        ${bankNames.map(bank => `<option value="${bank.name}">${bank.name}</option>`).join('')}
        <option value="other">+ Other (Specify)</option>
      </select>
      <input id="customBankName" type="text" placeholder="Enter bank name" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px; margin-top: 8px; display: none;" />
    </div>
    <div>
      <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Transaction Reference</label>
      <input id="bankRef" type="text" placeholder="Transaction ID/UTR" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
    </div>
  `;
  
  // Add event listener to show/hide custom bank input
  setTimeout(() => {
    const select = document.getElementById('bankNameSelect');
    const customInput = document.getElementById('customBankName');
    if (select && customInput) {
      select.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        customInput.style.display = target.value === 'other' ? 'block' : 'none';
      });
    }
  }, 100);
} else if (mode === 'Cheque') {
        html = `
          <div style="margin-bottom: 10px;">
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Cheque Number</label>
            <input id="chequeNo" type="text" placeholder="Cheque number" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
          </div>
          <div>
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Bank Name</label>
            <input id="chequeBank" type="text" placeholder="Bank name" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
          </div>
        `;
      } else if (mode === 'Card') {
        html = `
          <div>
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 5px; color: #374151;">Card Reference / Last 4 digits</label>
            <input id="cardRef" type="text" placeholder="Last 4 digits" style="width: 100%; padding: 8px 12px; border: 1.5px solid #E2E8F4; border-radius: 8px; font-size: 12px;" />
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
        <div style={{ background: "#fff", borderBottom: "1px solid #E8ECF4", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
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
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #F0F3FA", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1 1 200px", minWidth: 0 }}>
              <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="13" height="13" fill="none" stroke="#8892A4" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses…" style={{ width: "100%", padding: "9px 12px 9px 32px", border: "1px solid #E8ECF4", borderRadius: 9, fontSize: 12, background: "#F8FAFF", outline: "none", color: "#374151" }} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: "1 1 auto" }}>
              <select value={filterProp} onChange={(e) => setFilterProp(e.target.value)} style={{ padding: "9px 12px", border: "1px solid #E8ECF4", borderRadius: 9, fontSize: 12, background: "#F8FAFF", color: "#374151", outline: "none", cursor: "pointer", flex: "1 1 120px", minWidth: 110 }}>
                <option value="All">All Properties</option>
                {[...new Set(expenses.map((e) => e.property_name))].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ padding: "9px 12px", border: "1px solid #E8ECF4", borderRadius: 9, fontSize: 12, background: "#F8FAFF", color: "#374151", outline: "none", cursor: "pointer", flex: "1 1 120px", minWidth: 110 }}>
                <option value="All">All Categories</option>
                {[...new Set(expenses.map((e) => e.category_name))].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: "9px 12px", border: "1px solid #E8ECF4", borderRadius: 9, fontSize: 12, background: "#F8FAFF", color: "#374151", outline: "none", cursor: "pointer", flex: "1 1 110px", minWidth: 100 }}>
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div style={{ fontSize: 11, color: "#8892A4", fontWeight: 500, background: "#EEF1FB", padding: "5px 12px", borderRadius: 20, whiteSpace: "nowrap" }}>{filtered.length} results</div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "#8892A4", fontSize: 14 }}>Loading expenses…</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900, tableLayout: "fixed" }}>
                <thead>
                  <tr style={{ background: "#F8FAFF" }}>
                    {["Property", "Category", "Vendor", "Amount", "Paid By", "Receipt", "Date", "Status", "Added By", "Created", "Actions"].map((h, index) => (
                      <th key={h} style={{ padding: "12px 8px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: 0.5, textTransform: "uppercase", borderBottom: "1.5px solid #E2E8F0", whiteSpace: "nowrap", width: index === 0 ? "15%" : index === 1 ? "12%" : index === 2 ? "12%" : index === 3 ? "10%" : index === 4 ? "10%" : index === 5 ? "8%" : index === 6 ? "10%" : index === 7 ? "10%" : index === 8 ? "10%" : index === 9 ? "12%" : "8%" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={11} style={{ padding: 48, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>No expenses found</td></tr>
                  ) : (
                    filtered.map((exp) => {
                      const cc = getCatColor(exp.category_name);
                      return (
                        <tr key={exp.id} style={{ borderBottom: "1px solid #F1F5F9", transition: "background 0.12s ease" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          <td style={{ padding: "10px 8px", fontSize: 12, fontWeight: 600, color: "#0F172A" }}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", flexShrink: 0 }} />{exp.property_name || "—"}</span></td>
                          <td style={{ padding: "10px 8px" }}>{exp.category_name ? <span style={{ background: cc.bg, color: cc.text, padding: "3px 8px", borderRadius: 12, fontSize: 10, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: cc.dot }} />{exp.category_name}</span> : "—"}</td>
                          <td style={{ padding: "10px 8px", fontSize: 12, color: "#334155" }}>{exp.vendor_name || "—"}</td>
                          <td style={{ padding: "10px 8px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{fmt(exp.total_amount || exp.amount || 0)}</td>
                          <td style={{ padding: "10px 8px", fontSize: 12, color: "#475569" }}>
  {exp.payment_mode === 'Cheque' && (
    <div>
      <div>💵 {exp.payment_mode}</div>
      {exp.cheque_no && <div className="text-[10px] text-gray-500">Chq: {exp.cheque_no}</div>}
      {exp.cheque_bank && <div className="text-[10px] text-gray-500">Bank: {exp.cheque_bank}</div>}
    </div>
  )}
  {exp.payment_mode === 'UPI' && (
    <div>
      <div>📱 {exp.payment_mode}</div>
      {exp.upi_id && <div className="text-[10px] text-gray-500">UPI: {exp.upi_id}</div>}
    </div>
  )}
  {exp.payment_mode === 'Bank Transfer' && (
    <div>
      <div>🏦 {exp.payment_mode}</div>
      {exp.bank_name && <div className="text-[10px] text-gray-500">Bank: {exp.bank_name}</div>}
      {exp.transaction_id && <div className="text-[10px] text-gray-500">Txn: {exp.transaction_id}</div>}
    </div>
  )}
  {exp.payment_mode === 'Card' && (
    <div>
      <div>💳 {exp.payment_mode}</div>
      {exp.card_ref && <div className="text-[10px] text-gray-500">Card: {exp.card_ref}</div>}
    </div>
  )}
  {exp.payment_mode === 'Cash' && <div>💵 {exp.payment_mode}</div>}
  {!exp.payment_mode && "—"}
</td>
                          <td style={{ padding: "10px 8px" }}>{exp.receipt_url ? <ReceiptThumbnail url={exp.receipt_url} filename={exp.receipt_name} onClick={() => setViewItem(exp)} /> : <span style={{ color: "#CBD5E1", fontSize: 11 }}>—</span>}</td>
                          <td style={{ padding: "10px 8px", fontSize: 11, color: "#64748B" }}>{fmtDate(exp.expense_date)}</td>
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
      ? "✓ Paid" 
      : exp.status === "Partial" 
      ? "⟳ Partial" 
      : "⏳ Unpaid"}
  </span>
</td>
                          <td style={{ padding: "10px 8px", fontSize: 11, color: "#475569" }}>{exp.added_by_name || "—"}</td>
                          <td style={{ padding: "10px 8px", fontSize: 10, color: "#94A3B8" }}>{fmtDateTime(exp.created_at)}</td>
                          <td style={{ padding: "10px 8px" }}>
  <div style={{ display: "flex", gap: 4 }}>
    {/* View Button */}
    <button onClick={() => setViewItem(exp)} title="View" style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E2E8F0", background: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
            <div style={{ fontSize: 11, color: "#8892A4" }}>Showing <span style={{ fontWeight: 600, color: "#1A2B6D" }}>{filtered.length}</span> of <span style={{ fontWeight: 600, color: "#1A2B6D" }}>{expenses.length}</span></div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#1B7A4E", fontWeight: 700 }}>Paid: {fmt(filtered.filter((e) => e.status === "Paid").reduce((s: number, e: any) => s + Number(e.total_paid || 0), 0))}</span>
              <span style={{ fontSize: 12, color: "#B45309", fontWeight: 700 }}>Balance: {fmt(filtered.reduce((s: number, e: any) => s + Number(e.balance || 0), 0))}</span>
              <span style={{ fontSize: 13, color: "#1A2B6D", fontWeight: 800 }}>Total: {fmt(filtered.reduce((s: number, e: any) => s + Number(e.total_amount || e.amount || 0), 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(5px)", padding: 12 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 860, maxHeight: "95vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}>
            {/* Modal header */}
            <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #F0F3FA", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 10, borderRadius: "20px 20px 0 0" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1A2B6D" }}>{editId ? "✏️ Edit Expense" : "➕ Add New Expense"}</div>
                <div style={{ fontSize: 11, color: "#8892A4", marginTop: 2 }}>Fields marked with <span style={{ color: "#E53E3E" }}>*</span> are required</div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: 32, height: 32, borderRadius: 9, border: "1.5px solid #E8ECF4", background: "#F8FAFF", cursor: "pointer", fontSize: 18, color: "#8892A4", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            <div style={{ padding: "20px 22px" }}>
              {/* SECTION 1 — Basic Info */}
              <div style={{ marginBottom: 22 }}>
                <SectionHead n="1" title="Basic Information" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                  <div>
                    <Label required>Property</Label>
                    <SearchableDropdown options={properties} value={form.property_id} onChange={(val, opt) => setForm((f) => ({ ...f, property_id: val, property_name: opt.name }))} placeholder="Select property" error={errors.property_id} />
                    <ErrMsg msg={errors.property_id} />
                  </div>
                  <div>
                    <Label required>Category</Label>
                    <SearchableDropdown options={categories} value={form.category_id} onChange={(val, opt) => setForm((f) => ({ ...f, category_id: val, category_name: opt.name }))} placeholder="Select category" error={errors.category_id} />
                    <ErrMsg msg={errors.category_id} />
                  </div>
                </div>
              </div>

              {/* SECTION 2 — Purchase Items (Simplified) */}
<div style={{ marginBottom: 22 }}>
  <SectionHead n="2" title="Purchase Items" sub="(items from bill)" />
  <div style={{ background: "#F8FAFF", borderRadius: 14, border: "1.5px solid #E2E8F4", overflow: "auto" }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 100px 40px", padding: "8px 12px", background: "linear-gradient(90deg,#EEF1FB,#F0F4FF)", borderBottom: "1.5px solid #E2E8F4", alignItems: "center", gap: 6, minWidth: 600 }}>
      {["Item Name", "Category", "Qty", "Unit Price", ""].map((h) => <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#3B5BDB", textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</div>)}
    </div>

    {form.items.map((item: any, idx: number) => (
      <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 100px 40px", padding: "7px 12px", gap: 6, borderBottom: idx < form.items.length - 1 ? "1px solid #F0F3FA" : "none", alignItems: "center", background: idx % 2 === 1 ? "#FAFBFF" : "#fff", minWidth: 600 }}>
        <div style={{ position: "relative" }}>
          <input type="text" value={item.name || ""} onChange={(e) => updateItem(item.id, "name", e.target.value)} placeholder="Item name" list={`items-list-${item.id}`} style={{ ...inp(), fontSize: 12, padding: "7px 9px", borderRadius: 8, width: "100%" }} />
          <datalist id={`items-list-${item.id}`}>{purchasedItems.map((pi) => <option key={pi} value={pi} />)}</datalist>
        </div>
        <select value={item.category || "Groceries"} onChange={(e) => updateItem(item.id, "category", e.target.value)} style={{ ...inp(), fontSize: 12, padding: "7px 7px", borderRadius: 8 }}>
          {catOptions.length > 0 ? catOptions.map((c) => <option key={c} value={c}>{c}</option>) : ["Groceries", "Maintenance", "Other"].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" value={item.qty || ""} onChange={(e) => updateItem(item.id, "qty", e.target.value)} placeholder="Qty" min="0" step="1" style={{ ...inp(), fontSize: 12, padding: "7px 7px", borderRadius: 8, textAlign: "center" }} />
        <input type="number" value={item.price || ""} onChange={(e) => updateItem(item.id, "price", e.target.value)} placeholder="Price" min="0" step="1" style={{ ...inp(), fontSize: 12, padding: "7px 7px", borderRadius: 8 }} />
        <button onClick={() => removeItem(item.id)} disabled={form.items.length <= 1} style={{ width: 26, height: 26, borderRadius: 7, border: "1.5px solid #FFE4E4", background: "#FFF5F5", cursor: form.items.length > 1 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", opacity: form.items.length > 1 ? 1 : 0.3 }}>
          <svg width="11" height="11" fill="none" stroke="#E53E3E" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    ))}

    {/* Footer with 3 sections: Add Item button, Expense Date, Items Total */}
    <div style={{ 
      padding: "12px 16px", 
      borderTop: "1.5px solid #E2E8F4", 
      background: "#EEF1FB",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12
    }}>
      {/* Left: Add Item Button */}
      <button 
        onClick={addItem} 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 6, 
          background: "#fff", 
          border: "1.5px solid #3B5BDB", 
          borderRadius: 9, 
          padding: "6px 14px", 
          fontSize: 12, 
          fontWeight: 700, 
          color: "#3B5BDB", 
          cursor: "pointer",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#3B5BDB"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#3B5BDB"; }}
      >
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Item
      </button>

      {/* Center: Expense Date */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 8,
        background: "#fff",
        padding: "4px 12px",
        borderRadius: 8,
        border: "1px solid #E2E8F4"
      }}>
        <svg width="14" height="14" fill="none" stroke="#3B5BDB" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 9, color: "#8892A4", fontWeight: 600 }}>EXPENSE DATE</span>
          <input 
            type="date" 
            value={form.expense_date} 
            onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))} 
            style={{ 
              border: "none", 
              background: "transparent", 
              fontSize: 12, 
              fontWeight: 600,
              color: "#1A2B6D",
              outline: "none",
              padding: 0,
              fontFamily: "inherit",
              cursor: "pointer"
            }} 
          />
        </div>
      </div>

      {/* Right: Total Amount */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 8,
        background: "linear-gradient(135deg, #1A2B6D, #3B5BDB)",
        padding: "6px 16px",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(59,91,219,0.2)"
      }}>
        <span style={{ fontSize: 11, color: "#fff", opacity: 0.9 }}>Items Total:</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{fmt(totalAmount)}</span>
      </div>
    </div>
  </div>
  {errors.items && <ErrMsg msg={errors.items} />}
</div>

              {/* SECTION 3 — Payment Details */}
{/* SECTION 3 — Payment Details */}
<div style={{ marginBottom: 4 }}>
  <SectionHead n="3" title="Payment Details" />
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 14,
    }}
  >
    {/* Amount - NOW EDITABLE */}
    <div>
      <Label required>Total Amount (₹)</Label>
      <input
        type="number"
        value={form.total_amount || totalAmount}
        onChange={(e) => setForm((f) => ({ ...f, total_amount: e.target.value }))}
        placeholder="Enter total amount"
        min="0"
        step="1"
        style={inp()}
      />
      {totalAmount > 0 && Number(form.total_amount) !== totalAmount && (
        <div style={{ fontSize: 10, color: "#8892A4", marginTop: 3 }}>
          Items total: {fmt(totalAmount)} • You can override
        </div>
      )}
    </div>

    {/* Paid Through - Payment Mode */}
{/* Paid Through - Payment Mode */}
<div>
  <Label required>Paid Through</Label>
  <select
    value={form.payment_mode || ""}
    onChange={(e) => {
      setForm((f) => ({ ...f, payment_mode: e.target.value }));
      setPaymentDetails({});
      setShowCustomBankInput(false);
    }}
    style={inp()}
  >
    <option value="">Select Payment Mode</option>
    <option value="Cash">💵 Cash</option>
    <option value="Bank Transfer">🏦 Bank Transfer</option>
    <option value="UPI">📱 UPI</option>
    <option value="Cheque">📝 Cheque</option>
    <option value="Card">💳 Card</option>
    <option value="Online Payment Gateway">🌐 Online Payment Gateway</option>
    <option value="Wallet">👛 Wallet</option>
  </select>
</div>

    {/* Vendor Name */}
    <div>
      <Label>Vendor Name</Label>
      <input
        type="text"
        value={form.vendor_name || ""}
        onChange={(e) => setForm((f) => ({ ...f, vendor_name: e.target.value }))}
        placeholder="Vendor/supplier name"
        style={inp()}
      />
    </div>

    {/* Added By */}
    <div>
      <Label required>Added By</Label>
      <input
        value={form.added_by_name}
        onChange={(e) => setForm((f) => ({ ...f, added_by_name: e.target.value }))}
        placeholder="Your name"
        style={inp(errors.added_by_name)}
      />
      <ErrMsg msg={errors.added_by_name} />
    </div>

    {/* Conditional Payment Details Fields */}
    {form.payment_mode === 'UPI' && (
      <div>
        <Label>UPI ID</Label>
        <input
          type="text"
          placeholder="example@upi"
          value={paymentDetails.upiId || ''}
          onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
          style={inp()}
        />
      </div>
    )}

{form.payment_mode === 'Bank Transfer' && (
  <>
    <div>
      <Label>Bank Name</Label>
      <input
        type="text"
        placeholder="Enter bank name"
        value={paymentDetails.bankName || ''}
        onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
        style={inp()}
      />
    </div>
    <div>
      <Label>Transaction ID / Reference</Label>
      <input
        type="text"
        placeholder="Transaction reference"
        value={paymentDetails.referenceNo || ''}
        onChange={(e) => setPaymentDetails({ ...paymentDetails, referenceNo: e.target.value })}
        style={inp()}
      />
    </div>
  </>
)}

{form.payment_mode === 'Cheque' && (
  <>
    <div>
      <Label>Cheque Number</Label>
      <input
        type="text"
        placeholder="Cheque number"
        value={paymentDetails.chequeNo || ''}
        onChange={(e) => setPaymentDetails({ ...paymentDetails, chequeNo: e.target.value })}
        style={inp()}
      />
    </div>
    <div>
      <Label>Bank Name</Label>
      <input
        type="text"
        placeholder="Bank name"
        value={paymentDetails.bankName || ''}
        onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
        style={inp()}
      />
    </div>
  </>
)}

    {form.payment_mode === 'Card' && (
      <div>
        <Label>Card Reference / Last 4 digits</Label>
        <input
          type="text"
          placeholder="Last 4 digits or reference"
          value={paymentDetails.cardRef || ''}
          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardRef: e.target.value })}
          style={inp()}
        />
      </div>
    )}

    {form.payment_mode === 'Online Payment Gateway' && (
      <div>
        <Label>Transaction ID</Label>
        <input
          type="text"
          placeholder="Gateway transaction ID"
          value={paymentDetails.transactionId || ''}
          onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionId: e.target.value })}
          style={inp()}
        />
      </div>
    )}

    {form.payment_mode === 'Wallet' && (
      <div>
        <Label>Wallet Reference</Label>
        <input
          type="text"
          placeholder="Wallet transaction ID"
          value={paymentDetails.walletRef || ''}
          onChange={(e) => setPaymentDetails({ ...paymentDetails, walletRef: e.target.value })}
          style={inp()}
        />
      </div>
    )}

    {/* Receipt Upload */}
    <div>
      <Label>Receipt Upload</Label>
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          border: "1.5px dashed #3B5BDB",
          borderRadius: 10,
          padding: "9px 12px",
          background: receiptPreview ? "#EEF1FB" : "#F8FAFF",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 41,
          boxSizing: "border-box",
        }}
      >
        <svg width="14" height="14" fill="none" stroke={receiptPreview ? "#3B5BDB" : "#B0BAC9"} strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17,8 12,3 7,8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span style={{ fontSize: 12, color: receiptPreview ? "#3B5BDB" : "#B0BAC9", fontWeight: receiptPreview ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {receiptPreview || "Upload receipt / bill"}
        </span>
        {receiptPreview && (
          <button onClick={(e) => { e.stopPropagation(); setReceiptFile(null); setReceiptPreview(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#8892A4", fontSize: 15 }}>×</button>
        )}
        <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} style={{ display: "none" }} />
      </div>
    </div>

    {/* Notes - Full Width */}
    <div style={{ gridColumn: "1/-1" }}>
      <Label>Notes</Label>
      <textarea
        value={form.notes}
        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        placeholder="Additional notes…"
        rows={2}
        style={{ ...inp(), resize: "vertical", minHeight: 60, fontFamily: "inherit" }}
      />
    </div>
  </div>
</div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: "14px 22px 20px", borderTop: "1px solid #F0F3FA", display: "flex", gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", border: "1.5px solid #E8ECF4", borderRadius: 11, background: "#F8FAFF", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Cancel</button>
              <button onClick={save} disabled={submitting} style={{ flex: 2, padding: "11px", border: "none", borderRadius: 11, background: submitting ? "#B0BAC9" : "linear-gradient(135deg,#1A2B6D,#3B5BDB)", fontSize: 13, fontWeight: 700, color: "#fff", cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : "0 4px 16px rgba(59,91,219,0.35)" }}>{submitting ? "Saving…" : editId ? "✓ Update Expense" : "✓ Save Expense"}</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(5px)", padding: 12 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 620, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #F0F3FA", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", borderRadius: "20px 20px 0 0", zIndex: 5 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#1A2B6D" }}>📄 Expense Details</div>
              <button onClick={() => setViewItem(null)} style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #E8ECF4", background: "#F8FAFF", cursor: "pointer", fontSize: 18, color: "#8892A4", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ padding: "18px 20px", flex: 1, overflowY: "auto" }}>
              {/* View content - simplified for brevity, similar to original but without paid/balance in items */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 18 }}>
                <div><div style={{ fontSize: 10, color: "#8892A4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Property</div><div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{viewItem.property_name}</div></div>
                <div><div style={{ fontSize: 10, color: "#8892A4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Category</div>{(() => { const cc = getCatColor(viewItem.category_name); return <span style={{ background: cc.bg, color: cc.text, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: cc.dot }} />{viewItem.category_name}</span>; })()}</div>
                <div><div style={{ fontSize: 10, color: "#8892A4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Vendor</div><div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{viewItem.vendor_name || "—"}</div></div>
                <div><div style={{ fontSize: 10, color: "#8892A4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Total Amount</div><div style={{ fontSize: 16, fontWeight: 800, color: "#1A2B6D" }}>{fmt(viewItem.total_amount)}</div></div>
                <div><div style={{ fontSize: 10, color: "#8892A4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Paid</div><div style={{ fontSize: 14, fontWeight: 700, color: "#1B7A4E" }}>{fmt(viewItem.total_paid || 0)}</div></div>
                <div><div style={{ fontSize: 10, color: "#8892A4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Balance</div><div style={{ fontSize: 14, fontWeight: 700, color: "#B45309" }}>{fmt(viewItem.balance || 0)}</div></div>
                <div><div style={{ fontSize: 10, color: "#8892A4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Status</div><span style={{ background: viewItem.status === "Paid" ? "#E8F5F0" : viewItem.status === "Partial" ? "#FEF3C7" : "#FFF3E0", color: viewItem.status === "Paid" ? "#1B7A4E" : viewItem.status === "Partial" ? "#92400E" : "#B45309", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, display: "inline-block" }}>{viewItem.status === "Paid" ? "✓ Paid" : viewItem.status === "Partial" ? "⟳ Partial" : "⏳ Unpaid"}</span></div>
                <div><div style={{ fontSize: 10, color: "#8892A4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Expense Date</div><div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{fmtDate(viewItem.expense_date)}</div></div>
                <div><div style={{ fontSize: 10, color: "#8892A4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Added By</div><div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{viewItem.added_by_name}</div></div>
                <div><div style={{ fontSize: 10, color: "#8892A4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Created At</div><div style={{ fontSize: 12, color: "#B0BAC9", fontWeight: 400 }}>{fmtDateTime(viewItem.created_at)}</div></div>
                {viewItem.notes && (
                  <div style={{ gridColumn: "1/-1" }}>
                    <div style={{ fontSize: 10, color: "#8892A4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Notes</div>
                    <div style={{ fontSize: 13, color: "#374151", fontWeight: 400, background: "#F8FAFF", borderRadius: 8, padding: "8px 12px", border: "1px solid #E8ECF4" }}>{viewItem.notes}</div>
                  </div>
                )}
              </div>

              {/* Items table */}
              {viewItem.items?.filter((i: any) => i.name || i.item_name).length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#3B5BDB", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 18, height: 18, background: "linear-gradient(135deg,#1A2B6D,#3B5BDB)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 800 }}>✦</span>
                    Purchase Items ({viewItem.items.filter((i: any) => i.name || i.item_name).length})
                  </div>
                  <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #E8ECF4" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 360 }}>
                      <thead>
                        <tr style={{ background: "#F8FAFF" }}>
                          {["Item Name", "Category", "Qty", "Price", "Amount"].map((h) => (
                            <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#8892A4", borderBottom: "1px solid #F0F3FA", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {viewItem.items.filter((i: any) => i.name || i.item_name).map((it: any, idx: number) => {
                          const itCc = getCatColor(it.category || it.category_name || "");
                          return (
                            <tr key={idx} style={{ borderBottom: "1px solid #F5F7FC" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFBFF")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                              <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1A2B6D" }}>{it.name || it.item_name}</td>
                              <td style={{ padding: "8px 12px" }}>
                                {it.category || it.category_name ? (
                                  <span style={{ background: itCc.bg, color: itCc.text, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: itCc.dot }} />
                                    {it.category || it.category_name}
                                  </span>
                                ) : <span style={{ color: "#CBD5E1" }}>—</span>}
                              </td>
                              <td style={{ padding: "8px 12px", color: "#374151" }}>{it.qty || it.quantity || "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#374151" }}>{fmt(it.price || it.unit_price || 0)}</td>
                              <td style={{ padding: "8px 12px", fontWeight: 700, color: "#1A2B6D" }}>{fmt(Number(it.qty || it.quantity || 0) * Number(it.price || it.unit_price || 0))}</td>
                            </tr>
                          );
                        })}
                        <tr style={{ background: "#EEF1FB" }}>
                          <td colSpan={4} style={{ padding: "8px 12px", fontWeight: 700, color: "#1A2B6D", textAlign: "right", fontSize: 12 }}>Total:</td>
                          <td style={{ padding: "8px 12px", fontWeight: 800, color: "#1A2B6D", fontSize: 13 }}>{fmt(viewItem.items.filter((i: any) => i.name || i.item_name).reduce((s: number, i: any) => s + (Number(i.qty || i.quantity || 0) * Number(i.price || i.unit_price || 0)), 0))}</td>
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
                  <input id="paymentAmount" type="number" placeholder="0.00" style={{ width: "100%", padding: "8px 12px 8px 28px", border: "1.5px solid #E2E8F4", borderRadius: 8, fontSize: 13, outline: "none" }} />
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
                </select>
              </div>

              {/* Conditional Fields Container */}
              <div id="paymentConditionalFields" style={{ marginBottom: 14 }}></div>

              {/* Payment Date */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 5, color: "#374151" }}>Payment Date</label>
                <input id="transactionDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #E2E8F4", borderRadius: 8, fontSize: 12, outline: "none" }} />
              </div>

              {/* Reference (Optional) */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 5, color: "#374151" }}>Reference ID <span style={{ fontSize: 9, color: "#94A3B8" }}>(Optional)</span></label>
                <input id="referenceNo" type="text" placeholder="Transaction/Cheque/UTR number" style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #E2E8F4", borderRadius: 8, fontSize: 12, outline: "none" }} />
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
    </div>
  );
}