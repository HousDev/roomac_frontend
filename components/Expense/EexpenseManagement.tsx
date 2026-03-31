// pages/ExpensesManagement.tsx
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  getExpenses,
  getExpenseStats,
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/lib/expenseApi";
import { getAllStaff } from "@/lib/staffApi";
import { listProperties } from "@/lib/propertyApi";
import { getMasterItemsByTab, getMasterValues } from "@/lib/masterApi";
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

/* Capitalize only the first letter of a string, rest lowercase */
const capFirst = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

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
});

const blankForm = () => ({
  property_id: "",
  property_name: "",
  category_id: "",
  category_name: "",
  description: "",
  amount: "" as any,
  payment_mode: "Cash" as "Cash" | "Bank Transfer" | "UPI" | "Cheque" | "Card" | "Online Payment Gateway" | "Wallet",
  expense_date: new Date().toISOString().split("T")[0],
  status: "Pending" as "Pending" | "Paid",
  added_by_name: "",
  notes: "",
  items: [newItem()],
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
  const fileRef = useRef<HTMLInputElement>(null);

  // Filters
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterProp, setFilterProp] = useState("All");
  const [filterPaymentMode, setFilterPaymentMode] = useState("All");
  const [search, setSearch] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Auth
  const { can, user } = useAuth();

  /* ── Load master data once ─────────────────────────────────────────────── */
  const loadMasterData = useCallback(async () => {
    try {
      // Properties
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
      // Categories from Masters > Common tab > "Expenses Category"
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
      // Purchased item names from material purchase API
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
            e.description,
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
  const itemsTotal = (items: any[]) =>
    items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.price || 0), 0);
  const setItems = (items: any[]) => setForm((f) => ({ ...f, items }));
  const addItem = () => setItems([...form.items, newItem()]);
  const removeItem = (id: any) => {
    if (form.items.length > 1) setItems(form.items.filter((i: any) => i.id !== id));
  };
  const updateItem = (id: any, key: string, val: any) =>
    setItems(form.items.map((i: any) => (i.id === id ? { ...i, [key]: val } : i)));

  /* ── Open / close modals ───────────────────────────────────────────────── */
  function openAdd() {
    setForm({
      ...blankForm(),
      added_by_name: user?.name || "",
    });
    setEditId(null);
    setErrors({});
    setReceiptFile(null);
    setReceiptPreview("");
    setShowModal(true);
  }

  function openEdit(exp: any) {
    setForm({
      property_id: String(exp.property_id),
      property_name: exp.property_name,
      category_id: String(exp.category_id),
      category_name: exp.category_name,
      description: exp.description,
      amount: exp.amount,
      payment_mode: exp.payment_mode || "Cash",
      expense_date: exp.expense_date?.split("T")[0] || "",
      status: exp.status,
      added_by_name: exp.added_by_name,
      notes: exp.notes || "",
      items: exp.items?.length
        ? exp.items.map((i: any) => ({
            id: i.id || Math.random(),
            name: i.name || i.item_name,
            category: i.category || i.category_name || "Groceries",
            qty: i.qty || i.quantity,
            price: i.price || i.unit_price,
          }))
        : [newItem()],
    });
    setEditId(exp.id);
    setErrors({});
    setReceiptFile(null);
    setReceiptPreview(exp.receipt_name || "");
    setShowModal(true);
  }

  /* ── Validate ──────────────────────────────────────────────────────────── */
  function validate() {
    const e: Record<string, string> = {};
    if (!form.property_id) e.property_id = "Required";
    if (!form.category_id) e.category_id = "Required";
    if (!form.description?.trim()) e.description = "Required";
    if (!form.payment_mode) e.payment_mode = "Required";
    if (!form.expense_date) e.expense_date = "Required";
    if (!form.added_by_name?.trim()) e.added_by_name = "Required";
    const it = itemsTotal(form.items);
    if (!form.amount && it === 0) e.amount = "Enter amount or add items";
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
      const it = itemsTotal(form.items);
      const finalAmt = it > 0 ? it : Number(form.amount);
      const validItems = form.items.filter((i: any) => i.name);

      const payload = {
        ...form,
        amount: finalAmt,
        items: validItems,
        paid_by_staff_id: null,
        paid_by_name: form.payment_mode,
      };

      if (editId) {
        await updateExpense(editId, payload, receiptFile);
        toast.success("Expense updated");
      } else {
        await createExpense(payload, receiptFile);
        toast.success("Expense created");
      }
      setShowModal(false);
      await loadExpenses();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Delete ────────────────────────────────────────────────────────────── */
  async function handleDelete(id: number, desc: string) {
    const result = await Swal.fire({
      title: "Delete Expense?",
      text: `"${desc}" will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E53E3E",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteExpense(id);
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

  /* ── Computed values ───────────────────────────────────────────────────── */
  const iTotal = itemsTotal(form.items);

  // Unique values for filter dropdowns
  const uniqueProps = [...new Set(expenses.map((e) => e.property_name))];
  const uniqueCats = [...new Set(expenses.map((e) => e.category_name))];
  const paymentModes = ["Cash", "Bank Transfer", "UPI", "Cheque", "Card", "Online Payment Gateway", "Wallet"];

  /* ── Style helpers ─────────────────────────────────────────────────────── */
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

  const Label = ({
    children,
    required,
  }: {
    children: React.ReactNode;
    required?: boolean;
  }) => (
    <label
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 600,
        color: "#374151",
        marginBottom: 5,
      }}
    >
      {children}
      {required && <span style={{ color: "#E53E3E", marginLeft: 2 }}>*</span>}
    </label>
  );

  const ErrMsg = ({ msg }: { msg?: string }) =>
    msg ? (
      <div style={{ fontSize: 11, color: "#E53E3E", marginTop: 3 }}>{msg}</div>
    ) : null;

  const SectionHead = ({
    n,
    title,
    sub,
  }: {
    n: string;
    title: string;
    sub?: string;
  }) => (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: "#3B5BDB",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          background: "linear-gradient(135deg,#1A2B6D,#3B5BDB)",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          color: "#fff",
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {n}
      </span>
      {title}
      {sub && (
        <span
          style={{
            fontSize: 10.5,
            color: "#8892A4",
            fontWeight: 400,
            textTransform: "none",
            letterSpacing: 0,
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );

  // Category options for item rows — use master categories
  const catOptions = categories.map((c) => c.name);

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div
      style={{
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        background: "#F4F6FB",
        minHeight: "100vh",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* ── STICKY HEADER + COMPACT STATS ────────────────────────────────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#F4F6FB" }}>
        {/* Top row */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid #E8ECF4",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          {can("create_expenses") && (
            <button
              onClick={openAdd}
              style={{
                background: "linear-gradient(135deg,#1A2B6D,#3B5BDB)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "7px 14px",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 3px 10px rgba(59,91,219,0.3)",
                whiteSpace: "nowrap",
              }}
            >
              <svg
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Expense
            </button>
          )}
        </div>
        {/* Compact stat cards */}
        <div
          className="exp-stat-grid"
          style={{
            padding: "10px 14px 0",
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 8,
          }}
        >
          {[
            {
              label: "Total Items",
              val: fmt(stats.total_amount || 0),
              sub: `${stats.total_count || expenses.length} records`,
              icon: "💰",
              c: "#1A2B6D",
              ibg: "#EEF1FB",
            },
            {
              label: "Total Value",
              val: fmt(stats.paid_amount || 0),
              sub: `${stats.paid_count || 0} paid`,
              icon: "✅",
              c: "#1B7A4E",
              ibg: "#E8F5F0",
            },
            {
              label: "Low Stock",
              val: fmt(stats.pending_amount || 0),
              sub: `${stats.pending_count || 0} pending`,
              icon: "⏳",
              c: "#B45309",
              ibg: "#FFF8EC",
            },
            {
              label: "Out of Stock",
              val: fmt(
                expenses
                  .filter((e: any) =>
                    e.expense_date?.startsWith(new Date().toISOString().slice(0, 7))
                  )
                  .reduce((s: number, e: any) => s + Number(e.amount), 0)
              ),
              sub: new Date().toLocaleString("en-IN", {
                month: "short",
                year: "numeric",
              }),
              icon: "📅",
              c: "#6B21A8",
              ibg: "#F5F0FF",
            },
          ].map((c, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: "10px 12px",
                border: "1px solid #E8ECF4",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 9,
                    color: "#8892A4",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                    marginBottom: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: c.c,
                    lineHeight: 1.2,
                  }}
                >
                  {c.val}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "#B0BAC9",
                    marginTop: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.sub}
                </div>
              </div>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: c.ibg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {c.icon}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 14px" }}>
        {/* ── TABLE CARD ──────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #E8ECF4",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          {/* Filters bar */}
          <div
            className="exp-filter-wrap"
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid #F0F3FA",
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 180px", minWidth: 160 }}>
              <svg
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                width="13"
                height="13"
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
                placeholder="Search expenses…"
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 32px",
                  border: "1px solid #E8ECF4",
                  borderRadius: 9,
                  fontSize: 12,
                  background: "#F8FAFF",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "#374151",
                }}
              />
            </div>

            {/* Mobile: toggle more filters */}
            <button
              onClick={() => setMobileFiltersOpen((o) => !o)}
              style={{
                display: "none",
                padding: "8px 12px",
                border: "1px solid #E8ECF4",
                borderRadius: 9,
                fontSize: 12,
                background: "#F8FAFF",
                cursor: "pointer",
                alignItems: "center",
                gap: 6,
                color: "#374151",
              }}
              className="mobile-filter-btn"
            >
              <svg
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              Filters
            </button>

            {/* Filter selects */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                flex: "1 1 auto",
              }}
              className="filter-selects"
            >
              <select
                value={filterProp}
                onChange={(e) => setFilterProp(e.target.value)}
                style={{
                  padding: "9px 12px",
                  border: "1px solid #E8ECF4",
                  borderRadius: 9,
                  fontSize: 12,
                  background: "#F8FAFF",
                  color: "#374151",
                  outline: "none",
                  cursor: "pointer",
                  flex: "1 1 120px",
                  minWidth: 110,
                }}
              >
                <option value="All">All Properties</option>
                {uniqueProps.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                style={{
                  padding: "9px 12px",
                  border: "1px solid #E8ECF4",
                  borderRadius: 9,
                  fontSize: 12,
                  background: "#F8FAFF",
                  color: "#374151",
                  outline: "none",
                  cursor: "pointer",
                  flex: "1 1 120px",
                  minWidth: 110,
                }}
              >
                <option value="All">All Categories</option>
                {uniqueCats.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={filterPaymentMode}
                onChange={(e) => setFilterPaymentMode(e.target.value)}
                style={{
                  padding: "9px 12px",
                  border: "1px solid #E8ECF4",
                  borderRadius: 9,
                  fontSize: 12,
                  background: "#F8FAFF",
                  color: "#374151",
                  outline: "none",
                  cursor: "pointer",
                  flex: "1 1 120px",
                  minWidth: 110,
                }}
              >
                <option value="All">All Payment Modes</option>
                {paymentModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: "9px 12px",
                  border: "1px solid #E8ECF4",
                  borderRadius: 9,
                  fontSize: 12,
                  background: "#F8FAFF",
                  color: "#374151",
                  outline: "none",
                  cursor: "pointer",
                  flex: "1 1 110px",
                  minWidth: 100,
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#8892A4",
                fontWeight: 500,
                background: "#EEF1FB",
                padding: "5px 12px",
                borderRadius: 20,
                whiteSpace: "nowrap",
              }}
            >
              {filtered.length} results
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            {loading ? (
              <div
                style={{
                  padding: 60,
                  textAlign: "center",
                  color: "#8892A4",
                  fontSize: 14,
                }}
              >
                Loading expenses…
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 1000,
                }}
              >
                <thead>
                  <tr style={{ background: "#F8FAFF" }}>
                    {[
                      "Property",
                      "Category",
                      "Description",
                      "Amount",
                      "Paid Through",
                      "Receipt",
                      "Date",
                      "Status",
                      "Added By",
                      "Created",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 14px",
                          textAlign: "left",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#8892A4",
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={11}
                        style={{
                          padding: 48,
                          textAlign: "center",
                          color: "#B0BAC9",
                          fontSize: 14,
                        }}
                      >
                        No expenses found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((exp) => {
                      const cc = getCatColor(exp.category_name);
                      const validItems = (exp.items || []).filter(
                        (i: any) => i.name || i.item_name
                      );
                      return (
                        <tr
                          key={exp.id}
                          style={{
                            borderBottom: "1px solid #F5F7FC",
                            transition: "background .12s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#FAFBFF")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          {/* Property */}
                          <td
                            style={{
                              padding: "11px 14px",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#1A2B6D",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <span
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  background: "#3B5BDB",
                                  flexShrink: 0,
                                }}
                              />
                              {exp.property_name}
                            </span>
                          </td>
                          {/* Category */}
                          <td style={{ padding: "11px 14px" }}>
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
                                whiteSpace: "nowrap",
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
                              {exp.category_name}
                            </span>
                          </td>
                          {/* Description */}
                          <td
                            style={{
                              padding: "11px 14px",
                              fontSize: 12,
                              color: "#374151",
                              maxWidth: 180,
                            }}
                          >
                            <div
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {exp.description}
                              {validItems.length > 0 && (
                                <span
                                  style={{
                                    marginLeft: 7,
                                    background: "#EEF1FB",
                                    color: "#3B5BDB",
                                    fontSize: 9,
                                    padding: "2px 7px",
                                    borderRadius: 12,
                                    fontWeight: 700,
                                  }}
                                >
                                  {validItems.length} items
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Amount */}
                          <td
                            style={{
                              padding: "11px 14px",
                              fontSize: 13,
                              fontWeight: 800,
                              color: "#1A2B6D",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmt(exp.amount)}
                          </td>
                          {/* Paid Through */}
                          <td style={{ padding: "11px 14px" }}>
                            <span
                              style={{
                                background: "#F8FAFF",
                                color: "#374151",
                                padding: "3px 10px",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 500,
                                display: "inline-block",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {exp.payment_mode || "Cash"}
                            </span>
                          </td>
                          {/* Receipt */}
                          <td style={{ padding: "11px 14px" }}>
                            {exp.receipt_url ? (
                              <ReceiptThumbnail
                                url={exp.receipt_url}
                                filename={exp.receipt_name}
                                onClick={() => setViewItem(exp)}
                              />
                            ) : (
                              <span style={{ color: "#CBD5E1", fontSize: 12 }}>—</span>
                            )}
                          </td>
                          {/* Date */}
                          <td
                            style={{
                              padding: "11px 14px",
                              fontSize: 11,
                              color: "#8892A4",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmtDate(exp.expense_date)}
                          </td>
                          {/* Status */}
                          <td style={{ padding: "11px 14px" }}>
                            <span
                              style={{
                                background: exp.status === "Paid" ? "#E8F5F0" : "#FFF3E0",
                                color: exp.status === "Paid" ? "#1B7A4E" : "#B45309",
                                padding: "3px 10px",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                display: "inline-block",
                              }}
                            >
                              {exp.status === "Paid" ? "✓ Paid" : "⏳ Pending"}
                            </span>
                          </td>
                          {/* Added By */}
                          <td
                            style={{
                              padding: "11px 14px",
                              fontSize: 12,
                              color: "#374151",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {exp.added_by_name}
                          </td>
                          {/* Created */}
                          <td
                            style={{
                              padding: "11px 14px",
                              fontSize: 10,
                              color: "#B0BAC9",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmtDateTime(exp.created_at)}
                          </td>
                          {/* Actions */}
                          <td style={{ padding: "11px 14px" }}>
                            <div style={{ display: "flex", gap: 5 }}>
                              <button
                                onClick={() => setViewItem(exp)}
                                title="View"
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 7,
                                  border: "1px solid #E8ECF4",
                                  background: "#F8FAFF",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  fill="none"
                                  stroke="#3B5BDB"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                              {can("edit_expenses") && (
                                <button
                                  onClick={() => openEdit(exp)}
                                  title="Edit"
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 7,
                                    border: "1px solid #E8ECF4",
                                    background: "#F8FAFF",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <svg
                                    width="13"
                                    height="13"
                                    fill="none"
                                    stroke="#1A2B6D"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                              )}
                              {can("delete_expenses") && (
                                <button
                                  onClick={() => handleDelete(exp.id, exp.description)}
                                  title="Delete"
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 7,
                                    border: "1px solid #FFE4E4",
                                    background: "#FFF5F5",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <svg
                                    width="13"
                                    height="13"
                                    fill="none"
                                    stroke="#E53E3E"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
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
          <div
            style={{
              padding: "12px 14px",
              background: "#F8FAFF",
              borderTop: "1px solid #F0F3FA",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 11, color: "#8892A4" }}>
              Showing{" "}
              <span style={{ fontWeight: 600, color: "#1A2B6D" }}>
                {filtered.length}
              </span>{" "}
              of{" "}
              <span style={{ fontWeight: 600, color: "#1A2B6D" }}>
                {expenses.length}
              </span>
            </div>
            <div
              className="exp-footer-totals"
              style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
            >
              <span style={{ fontSize: 12, color: "#1B7A4E", fontWeight: 700 }}>
                Paid:{" "}
                {fmt(
                  filtered
                    .filter((e) => e.status === "Paid")
                    .reduce((s: number, e: any) => s + Number(e.amount), 0)
                )}
              </span>
              <span style={{ fontSize: 12, color: "#B45309", fontWeight: 700 }}>
                Pending:{" "}
                {fmt(
                  filtered
                    .filter((e) => e.status === "Pending")
                    .reduce((s: number, e: any) => s + Number(e.amount), 0)
                )}
              </span>
              <span style={{ fontSize: 13, color: "#1A2B6D", fontWeight: 800 }}>
                Total:{" "}
                {fmt(
                  filtered.reduce((s: number, e: any) => s + Number(e.amount), 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          ADD / EDIT MODAL
      ════════════════════════════════════════════════════════════════════ */}
      {showModal && (
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
              maxWidth: 740,
              maxHeight: "95vh",
              overflowY: "auto",
              boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                padding: "18px 22px 14px",
                borderBottom: "1px solid #F0F3FA",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 10,
                borderRadius: "20px 20px 0 0",
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1A2B6D" }}>
                  {editId ? "✏️ Edit Expense" : "➕ Add New Expense"}
                </div>
                <div style={{ fontSize: 11, color: "#8892A4", marginTop: 2 }}>
                  Fields marked with{" "}
                  <span style={{ color: "#E53E3E" }}>*</span> are required
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
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

            <div style={{ padding: "20px 22px" }}>
              {/* SECTION 1 — Basic Info */}
              <div style={{ marginBottom: 22 }}>
                <SectionHead n="1" title="Basic Information" />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 14,
                  }}
                >
                  <div>
                    <Label required>Property</Label>
                    <SearchableDropdown
                      options={properties}
                      value={form.property_id}
                      onChange={(val, opt) =>
                        setForm((f) => ({
                          ...f,
                          property_id: val,
                          property_name: opt.name,
                        }))
                      }
                      placeholder="Select property"
                      error={errors.property_id}
                    />
                    <ErrMsg msg={errors.property_id} />
                  </div>
                  <div>
                    <Label required>Category</Label>
                    <SearchableDropdown
                      options={categories}
                      value={form.category_id}
                      onChange={(val, opt) =>
                        setForm((f) => ({
                          ...f,
                          category_id: val,
                          category_name: opt.name,
                        }))
                      }
                      placeholder="Select category"
                      error={errors.category_id}
                    />
                    <ErrMsg msg={errors.category_id} />
                  </div>
                  {/* <div style={{ gridColumn: "1/-1" }}>
                    <Label required>Description</Label>
                    <input
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      placeholder="e.g. Electricity bill for March 2026"
                      style={inp(errors.description)}
                    />
                    <ErrMsg msg={errors.description} />
                  </div> */}
                </div>
              </div>

              {/* SECTION 2 — Purchase Items */}
              <div style={{ marginBottom: 22 }}>
                <SectionHead
                  n="2"
                  title="Purchase Items"
                  sub="(optional — auto-fills amount)"
                />
                <div
                  style={{
                    background: "#F8FAFF",
                    borderRadius: 14,
                    border: "1.5px solid #E2E8F4",
                    overflow: "hidden",
                  }}
                >
                  {/* Column headers */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 140px 70px 100px 90px 32px",
                      padding: "8px 12px",
                      background: "linear-gradient(90deg,#EEF1FB,#F0F4FF)",
                      borderBottom: "1.5px solid #E2E8F4",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {["Item Name *", "Category", "Qty", "Price (₹)", "Amount", ""].map(
                      (h, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#3B5BDB",
                            textTransform: "uppercase",
                            letterSpacing: 0.4,
                          }}
                        >
                          {h}
                        </div>
                      )
                    )}
                  </div>

                  {form.items.map((item: any, idx: number) => {
                    const rowAmt = Number(item.qty || 0) * Number(item.price || 0);
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 140px 70px 100px 90px 32px",
                          padding: "7px 12px",
                          gap: 6,
                          borderBottom:
                            idx < form.items.length - 1 ? "1px solid #F0F3FA" : "none",
                          alignItems: "center",
                          background: idx % 2 === 1 ? "#FAFBFF" : "#fff",
                        }}
                      >
                        {/* Item name — searchable from purchased items */}
                        <div style={{ position: "relative" }}>
                          <input
                            value={item.name}
                            onChange={(e) => updateItem(item.id, "name", e.target.value)}
                            placeholder="Item name"
                            list={`items-list-${item.id}`}
                            style={{
                              ...inp(),
                              fontSize: 12,
                              padding: "7px 9px",
                              borderRadius: 8,
                            }}
                          />
                          <datalist id={`items-list-${item.id}`}>
                            {purchasedItems.map((pi) => (
                              <option key={pi} value={pi} />
                            ))}
                          </datalist>
                        </div>
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(item.id, "category", e.target.value)}
                          style={{
                            ...inp(),
                            fontSize: 12,
                            padding: "7px 7px",
                            borderRadius: 8,
                          }}
                        >
                          {catOptions.length > 0
                            ? catOptions.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))
                            : ["Groceries", "Maintenance", "Other"].map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                        </select>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                          placeholder="Qty"
                          min="1"
                          style={{
                            ...inp(),
                            fontSize: 12,
                            padding: "7px 7px",
                            borderRadius: 8,
                            textAlign: "center",
                          }}
                        />
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, "price", e.target.value)}
                          placeholder="0.00"
                          min="0"
                          style={{
                            ...inp(),
                            fontSize: 12,
                            padding: "7px 7px",
                            borderRadius: 8,
                          }}
                        />
                        <div
                          style={{
                            background: "#EEF1FB",
                            borderRadius: 8,
                            padding: "7px 6px",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#1A2B6D",
                            textAlign: "center",
                          }}
                        >
                          {fmt(rowAmt)}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={form.items.length <= 1}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 7,
                            border: "1.5px solid #FFE4E4",
                            background: "#FFF5F5",
                            cursor: form.items.length > 1 ? "pointer" : "not-allowed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: form.items.length > 1 ? 1 : 0.3,
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            width="11"
                            height="11"
                            fill="none"
                            stroke="#E53E3E"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}

                  <div
                    style={{
                      padding: "9px 12px",
                      borderTop: "1.5px solid #E2E8F4",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "#EEF1FB",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
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
                      }}
                    >
                      + Add Item
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#8892A4" }}>Total:</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#1A2B6D" }}>
                        {fmt(iTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3 — Payment Details */}
              <div style={{ marginBottom: 4 }}>
                <SectionHead n="3" title="Payment Details" />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 14,
                  }}
                >
                  <div>
                    <Label required>
                      Amount (₹)
                      {iTotal > 0 && (
                        <span
                          style={{
                            color: "#3B5BDB",
                            fontWeight: 400,
                            fontSize: 11,
                            marginLeft: 4,
                          }}
                        >
                          — auto from items
                        </span>
                      )}
                    </Label>
                    <input
                      type="number"
                      value={iTotal > 0 ? iTotal : form.amount}
                      readOnly={iTotal > 0}
                      onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                      placeholder="0.00"
                      style={{
                        ...inp(errors.amount),
                        background: iTotal > 0 ? "#EEF1FB" : "#F8FAFF",
                        fontWeight: iTotal > 0 ? 800 : 400,
                        color: iTotal > 0 ? "#1A2B6D" : "#374151",
                      }}
                    />
                    <ErrMsg msg={errors.amount} />
                  </div>

                  {/* Paid Through - Payment Mode Dropdown */}
                  <div>
                    <Label required>Paid Through</Label>
                    <select
                      value={form.payment_mode}
                      onChange={(e) => setForm((f) => ({ ...f, payment_mode: e.target.value }))}
                      style={{
                        ...inp(errors.payment_mode),
                        cursor: "pointer",
                        appearance: "none",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238892A4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 12px center",
                        backgroundSize: "14px",
                      }}
                    >
                      <option value="Cash">💵 Cash</option>
                      <option value="Bank Transfer">🏦 Bank Transfer</option>
                      <option value="UPI">📱 UPI</option>
                      <option value="Cheque">📝 Cheque</option>
                      <option value="Card">💳 Card (Debit/Credit)</option>
                      <option value="Online Payment Gateway">🌐 Online Payment Gateway</option>
                      <option value="Wallet">👛 Wallet</option>
                    </select>
                    <ErrMsg msg={errors.payment_mode} />
                  </div>

                  <div>
                    <Label required>Expense Date</Label>
                    <input
                      type="date"
                      value={form.expense_date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, expense_date: e.target.value }))
                      }
                      style={inp(errors.expense_date)}
                    />
                    <ErrMsg msg={errors.expense_date} />
                  </div>

                  <div>
                    <Label required>Status</Label>
                    <div style={{ display: "flex", gap: 8, height: 41 }}>
                      {(["Pending", "Paid"] as const).map((s) => {
                        const active = form.status === s;
                        const col =
                          s === "Paid"
                            ? { border: "#43A047", bg: "#E8F5E9", text: "#1B7A4E" }
                            : { border: "#FFB300", bg: "#FFF8E1", text: "#B45309" };
                        return (
                          <button
                            key={s}
                            onClick={() => setForm((f) => ({ ...f, status: s }))}
                            style={{
                              flex: 1,
                              border: `1.5px solid ${active ? col.border : "#E2E8F4"}`,
                              borderRadius: 10,
                              background: active ? col.bg : "#F8FAFF",
                              fontSize: 12,
                              fontWeight: 700,
                              color: active ? col.text : "#8892A4",
                              cursor: "pointer",
                              transition: "all .15s",
                            }}
                          >
                            {s === "Paid" ? "✓ Paid" : "⏳ Pending"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label required>Added By</Label>
                    <input
                      value={form.added_by_name}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          added_by_name: e.target.value,
                        }))
                      }
                      placeholder="Your name"
                      style={inp(errors.added_by_name)}
                    />
                    <ErrMsg msg={errors.added_by_name} />
                  </div>

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
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        stroke={receiptPreview ? "#3B5BDB" : "#B0BAC9"}
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17,8 12,3 7,8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span
                        style={{
                          fontSize: 12,
                          color: receiptPreview ? "#3B5BDB" : "#B0BAC9",
                          fontWeight: receiptPreview ? 600 : 400,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {receiptPreview || "Upload receipt / bill"}
                      </span>
                      {receiptPreview && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReceiptFile(null);
                            setReceiptPreview("");
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#8892A4",
                            fontSize: 15,
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFile}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>

                  <div style={{ gridColumn: "1/-1" }}>
                    <Label>Notes</Label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Additional notes…"
                      rows={2}
                      style={{
                        ...inp(),
                        resize: "vertical",
                        minHeight: 60,
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div
              style={{
                padding: "14px 22px 20px",
                borderTop: "1px solid #F0F3FA",
                display: "flex",
                gap: 10,
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  border: "1.5px solid #E8ECF4",
                  borderRadius: 11,
                  background: "#F8FAFF",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: "11px",
                  border: "none",
                  borderRadius: 11,
                  background: submitting
                    ? "#B0BAC9"
                    : "linear-gradient(135deg,#1A2B6D,#3B5BDB)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: submitting ? "none" : "0 4px 16px rgba(59,91,219,0.35)",
                }}
              >
                {submitting ? "Saving…" : editId ? "✓ Update Expense" : "✓ Save Expense"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL with full receipt preview */}
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
              maxWidth: 620,
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
                onClick={() => setViewItem(null)}
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

                {/* Description */}
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
                    Description
                  </div>
                  <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                    {viewItem.description}
                  </div>
                </div>

                {/* Amount */}
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
                    Amount
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#1A2B6D" }}>
                    {fmt(viewItem.amount)}
                  </div>
                </div>

                {/* Paid Through */}
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
                    Paid Through
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#374151",
                      fontWeight: 500,
                      padding: "2px 10px",
                      borderRadius: 12,
                      background: "#F8FAFF",
                      display: "inline-block",
                    }}
                  >
                    {viewItem.payment_mode || "Cash"}
                  </div>
                </div>

                {/* Status */}
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
                      background: viewItem.status === "Paid" ? "#E8F5F0" : "#FFF3E0",
                      color: viewItem.status === "Paid" ? "#1B7A4E" : "#B45309",
                      padding: "3px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      display: "inline-block",
                    }}
                  >
                    {viewItem.status === "Paid" ? "✓ Paid" : "⏳ Pending"}
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
                    Created At
                  </div>
                  <div style={{ fontSize: 12, color: "#B0BAC9", fontWeight: 400 }}>
                    {fmtDateTime(viewItem.created_at)}
                  </div>
                </div>

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

        /* Mobile: stack stat cards 2x2 */
        @media (max-width: 480px) {
          .exp-stat-grid { grid-template-columns: repeat(2,1fr) !important; }
          .exp-filter-wrap { flex-direction: column !important; }
          .exp-filter-wrap select { width: 100% !important; flex: none !important; }
          .exp-footer-totals { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
        }
        @media (max-width: 640px) {
          .mobile-filter-btn { display: flex !important; }
          .filter-selects { display: none !important; }
          .filter-selects.open { display: flex !important; flex-direction: column; width: 100%; }
        }
      `}</style>
    </div>
  );
}