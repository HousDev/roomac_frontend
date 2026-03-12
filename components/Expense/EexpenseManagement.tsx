import { useState, useRef } from "react";

const initialExpenses = [
    { id: 1, property: "Sunrise PG", category: "Maintenance", description: "Plumbing repair - Room 3", amount: 2500, paidBy: "Kamlesh Shah", receipt: null, expenseDate: "2026-03-01", status: "Paid", addedBy: "Kamlesh Shah", createdAt: "2026-03-01T10:30:00", items: [] },
    { id: 2, property: "Sunrise PG", category: "Utilities", description: "Electricity Bill - Feb", amount: 8200, paidBy: "Kamlesh Shah", receipt: "electricity_feb.pdf", expenseDate: "2026-03-03", status: "Paid", addedBy: "Kamlesh Shah", createdAt: "2026-03-03T09:00:00", items: [] },
    { id: 3, property: "Sunrise PG", category: "Groceries", description: "Kitchen supplies", amount: 1500, paidBy: "Rahul Manager", receipt: null, expenseDate: "2026-03-05", status: "Pending", addedBy: "Rahul Manager", createdAt: "2026-03-05T14:20:00", items: [{ id: 1, name: "Rice", category: "Groceries", qty: 5, price: 150 }, { id: 2, name: "Dal", category: "Groceries", qty: 3, price: 100 }] },
    { id: 4, property: "Sunrise PG", category: "Salary", description: "Cook salary - Feb", amount: 12000, paidBy: "Kamlesh Shah", receipt: "salary_slip.pdf", expenseDate: "2026-03-07", status: "Paid", addedBy: "Kamlesh Shah", createdAt: "2026-03-07T11:00:00", items: [] },
    { id: 5, property: "Sunrise PG", category: "Maintenance", description: "Painting - Common area", amount: 6000, paidBy: "Kamlesh Shah", receipt: null, expenseDate: "2026-03-08", status: "Pending", addedBy: "Kamlesh Shah", createdAt: "2026-03-08T16:45:00", items: [] },
    { id: 6, property: "Sunrise PG", category: "Internet", description: "Broadband - March", amount: 1200, paidBy: "Kamlesh Shah", receipt: "internet_bill.pdf", expenseDate: "2026-03-10", status: "Paid", addedBy: "Kamlesh Shah", createdAt: "2026-03-10T08:30:00", items: [] },
];

const CATEGORIES = ["Maintenance", "Utilities", "Groceries", "Salary", "Internet", "Furniture", "Cleaning", "Security", "Other"];
const PROPERTIES = ["Sunrise PG", "Green Valley PG"];
const PAID_BY_OPTIONS = ["Kamlesh Shah", "Rahul Manager", "Priya Staff", "Cash", "Online Transfer"];

const catColors = {
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

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const newItem = () => ({ id: Date.now() + Math.random(), name: "", category: "Groceries", qty: "", price: "" });
const blankForm = () => ({
    property: "Sunrise PG", category: "Maintenance", description: "",
    amount: "", paidBy: "Kamlesh Shah", receipt: null, receiptName: "",
    expenseDate: new Date().toISOString().split("T")[0],
    status: "Pending", addedBy: "Kamlesh Shah",
    createdAt: new Date().toISOString(),
    items: [newItem()],
});

export default function ExpensesManagement() {
    const [expenses, setExpenses] = useState(initialExpenses);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [viewItem, setViewItem] = useState(null);
    const [form, setForm] = useState(blankForm());
    const [errors, setErrors] = useState({});
    const [filterCat, setFilterCat] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterProp, setFilterProp] = useState("All");
    const [search, setSearch] = useState("");
    const fileRef = useRef();

    const filtered = expenses.filter(e => {
        if (filterCat !== "All" && e.category !== filterCat) return false;
        if (filterStatus !== "All" && e.status !== filterStatus) return false;
        if (filterProp !== "All" && e.property !== filterProp) return false;
        if (search && ![e.description, e.category, e.paidBy, e.addedBy].some(v => v?.toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
    });

    const totalAll = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const totalPaid = expenses.filter(e => e.status === "Paid").reduce((s, e) => s + Number(e.amount), 0);
    const totalPending = expenses.filter(e => e.status === "Pending").reduce((s, e) => s + Number(e.amount), 0);
    const thisMonth = expenses.filter(e => e.expenseDate?.startsWith("2026-03")).reduce((s, e) => s + Number(e.amount), 0);
    const catTotals = {};
    expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount); });

    const itemsTotal = (items) => items.reduce((s, it) => s + (Number(it.qty || 0) * Number(it.price || 0)), 0);
    const setItems = (items) => setForm(f => ({ ...f, items }));
    const addItem = () => setItems([...form.items, newItem()]);
    const removeItem = (id) => { if (form.items.length > 1) setItems(form.items.filter(i => i.id !== id)); };
    const updateItem = (id, key, val) => setItems(form.items.map(i => i.id === id ? { ...i, [key]: val } : i));

    function openAdd() { setForm(blankForm()); setEditId(null); setErrors({}); setShowModal(true); }
    function openEdit(exp) {
        setForm({ ...exp, receiptName: exp.receipt || "", items: exp.items?.length ? exp.items : [newItem()] });
        setEditId(exp.id); setErrors({}); setShowModal(true);
    }

    function validate() {
        const e = {};
        if (!form.property) e.property = "Required";
        if (!form.category) e.category = "Required";
        if (!form.description?.trim()) e.description = "Required";
        const it = itemsTotal(form.items);
        if (!form.amount && it === 0) e.amount = "Enter amount or add items above";
        if (!form.paidBy) e.paidBy = "Required";
        if (!form.expenseDate) e.expenseDate = "Required";
        if (!form.addedBy?.trim()) e.addedBy = "Required";
        return e;
    }

    function save() {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        const it = itemsTotal(form.items);
        const finalAmt = it > 0 ? it : Number(form.amount);
        const record = { ...form, amount: finalAmt, createdAt: editId ? form.createdAt : new Date().toISOString() };
        if (editId) setExpenses(expenses.map(ex => ex.id === editId ? { ...record, id: editId } : ex));
        else setExpenses([{ ...record, id: Date.now() }, ...expenses]);
        setShowModal(false);
    }

    function handleFile(e) {
        const file = e.target.files[0];
        if (file) setForm(f => ({ ...f, receipt: file.name, receiptName: file.name }));
    }

    const iTotal = itemsTotal(form.items);

    const inp = (err) => ({
        width: "100%", padding: "10px 12px",
        border: `1.5px solid ${err ? "#FC8181" : "#E2E8F4"}`,
        borderRadius: 10, fontSize: 13, color: "#1A2B6D",
        background: err ? "#FFF5F5" : "#F8FAFF",
        outline: "none", boxSizing: "border-box", fontFamily: "inherit",
    });

    const Label = ({ children, required }) => (
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
            {children}{required && <span style={{ color: "#E53E3E", marginLeft: 2 }}>*</span>}
        </label>
    );

    const ErrMsg = ({ msg }) => msg ? <div style={{ fontSize: 11, color: "#E53E3E", marginTop: 3 }}>{msg}</div> : null;

    const SectionHead = ({ n, title, sub }) => (
        <div style={{ fontSize: 12, fontWeight: 700, color: "#3B5BDB", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 22, background: "linear-gradient(135deg,#1A2B6D,#3B5BDB)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800, flexShrink: 0 }}>{n}</span>
            {title}
            {sub && <span style={{ fontSize: 10.5, color: "#8892A4", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{sub}</span>}
        </div>
    );

    return (
        <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F4F6FB", minHeight: "100vh" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

            {/* Header */}
            <div style={{ background: "#fff", borderBottom: "1px solid #E8ECF4", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#1A2B6D,#3B5BDB)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
                    </div>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#1A2B6D", letterSpacing: -0.5 }}>Expense Management</div>
                        <div style={{ fontSize: 12, color: "#8892A4" }}>Track all PG expenses — properties, receipts & items</div>
                    </div>
                </div>
                <button onClick={openAdd} style={{ background: "linear-gradient(135deg,#1A2B6D,#3B5BDB)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(59,91,219,0.3)" }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Expense
                </button>
            </div>

            <div style={{ padding: "22px 28px" }}>
                {/* Summary Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                    {[
                        { label: "Total Expenses", val: fmt(totalAll), sub: `${expenses.length} records`, icon: "💰", c: "#1A2B6D", bg: "#EEF1FB" },
                        { label: "Paid", val: fmt(totalPaid), sub: `${expenses.filter(e => e.status === "Paid").length} records`, icon: "✅", c: "#1B7A4E", bg: "#E8F5F0" },
                        { label: "Pending", val: fmt(totalPending), sub: `${expenses.filter(e => e.status === "Pending").length} records`, icon: "⏳", c: "#B45309", bg: "#FFF8EC" },
                        { label: "This Month", val: fmt(thisMonth), sub: "March 2026", icon: "📅", c: "#6B21A8", bg: "#F5F0FF" },
                    ].map((c, i) => (
                        <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", border: "1px solid #E8ECF4", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ fontSize: 11, color: "#8892A4", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{c.label}</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: c.c }}>{c.val}</div>
                                <div style={{ fontSize: 11, color: "#B0BAC9", marginTop: 3 }}>{c.sub}</div>
                            </div>
                            <div style={{ width: 42, height: 42, background: c.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{c.icon}</div>
                        </div>
                    ))}
                </div>

                {/* Full Width Table */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8ECF4", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                    {/* Filters */}
                    <div style={{ padding: "14px 18px", borderBottom: "1px solid #F0F3FA", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" fill="none" stroke="#8892A4" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search expenses..."
                                style={{ width: "100%", padding: "10px 16px 10px 38px", border: "1px solid #E8ECF4", borderRadius: 10, fontSize: 13, background: "#F8FAFF", outline: "none", boxSizing: "border-box", color: "#374151" }}
                            />
                        </div>

                        <select value={filterProp} onChange={e => setFilterProp(e.target.value)} style={{ padding: "10px 14px", border: "1px solid #E8ECF4", borderRadius: 10, fontSize: 13, background: "#F8FAFF", color: "#374151", outline: "none", cursor: "pointer", minWidth: 140 }}>
                            <option value="All">All Properties</option>
                            {PROPERTIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>

                        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: "10px 14px", border: "1px solid #E8ECF4", borderRadius: 10, fontSize: 13, background: "#F8FAFF", color: "#374151", outline: "none", cursor: "pointer", minWidth: 140 }}>
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "10px 14px", border: "1px solid #E8ECF4", borderRadius: 10, fontSize: 13, background: "#F8FAFF", color: "#374151", outline: "none", cursor: "pointer", minWidth: 140 }}>
                            <option value="All">All Statuses</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                        </select>

                        <div style={{ fontSize: 12, color: "#8892A4", fontWeight: 500, background: "#EEF1FB", padding: "6px 14px", borderRadius: 20 }}>
                            {filtered.length} results
                        </div>
                    </div>

                    {/* Table Container with Horizontal Scroll */}
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1400px" }}>
                            <thead>
                                <tr style={{ background: "#F8FAFF" }}>
                                    {["Property", "Category", "Description", "Amount", "Paid By", "Receipt", "Exp. Date", "Status", "Added By", "Created At", "Actions"].map(h => (
                                        <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8892A4", letterSpacing: 0.5, textTransform: "uppercase", borderBottom: "1px solid #F0F3FA", whiteSpace: "nowrap" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={11} style={{ padding: 48, textAlign: "center", color: "#B0BAC9", fontSize: 14 }}>No expenses found</td></tr>
                                ) : filtered.map(exp => {
                                    const cc = catColors[exp.category] || catColors.Other;
                                    return (
                                        <tr key={exp.id} style={{ borderBottom: "1px solid #F5F7FC", transition: "background .12s" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#FAFBFF"}
                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                            <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "#1A2B6D", whiteSpace: "nowrap" }}>
                                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B5BDB", flexShrink: 0 }}></span>
                                                    {exp.property}
                                                </span>
                                            </td>
                                            <td style={{ padding: "14px 16px" }}>
                                                <span style={{ background: cc.bg, color: cc.text, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: cc.dot }}></span>
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151", maxWidth: 200 }}>
                                                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {exp.description}
                                                    {exp.items?.filter(i => i.name).length > 0 && (
                                                        <span style={{ marginLeft: 8, background: "#EEF1FB", color: "#3B5BDB", fontSize: 10, padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>
                                                            {exp.items.filter(i => i.name).length} items
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "#1A2B6D", whiteSpace: "nowrap" }}>{fmt(exp.amount)}</td>
                                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{exp.paidBy}</td>
                                            <td style={{ padding: "14px 16px" }}>
                                                {exp.receipt ? (
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#E8F5F0", color: "#1B7A4E", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                                                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                            <polyline points="14,2 14,8 20,8" />
                                                        </svg>
                                                        Receipt
                                                    </span>
                                                ) : (
                                                    <span style={{ color: "#CBD5E1", fontSize: 12 }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ padding: "14px 16px", fontSize: 12, color: "#8892A4", whiteSpace: "nowrap" }}>{fmtDate(exp.expenseDate)}</td>
                                            <td style={{ padding: "14px 16px" }}>
                                                <span style={{
                                                    background: exp.status === "Paid" ? "#E8F5F0" : "#FFF3E0",
                                                    color: exp.status === "Paid" ? "#1B7A4E" : "#B45309",
                                                    padding: "4px 12px",
                                                    borderRadius: 20,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    whiteSpace: "nowrap",
                                                    display: "inline-block"
                                                }}>
                                                    {exp.status === "Paid" ? "✓ Paid" : "⏳ Pending"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{exp.addedBy}</td>
                                            <td style={{ padding: "14px 16px", fontSize: 11, color: "#B0BAC9", whiteSpace: "nowrap" }}>{fmtDateTime(exp.createdAt)}</td>
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ display: "flex", gap: 6 }}>
                                                    <button
                                                        onClick={() => setViewItem(exp)}
                                                        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E8ECF4", background: "#F8FAFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", hover: { background: "#EEF1FB" } }}
                                                        title="View Details"
                                                    >
                                                        <svg width="14" height="14" fill="none" stroke="#3B5BDB" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                            <circle cx="12" cy="12" r="3" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(exp)}
                                                        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E8ECF4", background: "#F8FAFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                                                        title="Edit Expense"
                                                    >
                                                        <svg width="14" height="14" fill="none" stroke="#1A2B6D" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(exp.id)}
                                                        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #FFE4E4", background: "#FFF5F5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                                                        title="Delete Expense"
                                                    >
                                                        <svg width="14" height="14" fill="none" stroke="#E53E3E" strokeWidth="2" viewBox="0 0 24 24">
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6l-1 14H6L5 6" />
                                                            <path d="M10 11v6M14 11v6" />
                                                            <path d="M9 6V4h6v2" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    <div style={{ padding: "14px 18px", background: "#F8FAFF", borderTop: "1px solid #F0F3FA", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 12, color: "#8892A4" }}>
                            Showing <span style={{ fontWeight: 600, color: "#1A2B6D" }}>{filtered.length}</span> of <span style={{ fontWeight: 600, color: "#1A2B6D" }}>{expenses.length}</span> expenses
                        </div>
                        <div style={{ display: "flex", gap: 24 }}>
                            <span style={{ fontSize: 13, color: "#1B7A4E", fontWeight: 700 }}>
                                Paid: {fmt(filtered.filter(e => e.status === "Paid").reduce((s, e) => s + Number(e.amount), 0))}
                            </span>
                            <span style={{ fontSize: 13, color: "#B45309", fontWeight: 700 }}>
                                Pending: {fmt(filtered.filter(e => e.status === "Pending").reduce((s, e) => s + Number(e.amount), 0))}
                            </span>
                            <span style={{ fontSize: 14, color: "#1A2B6D", fontWeight: 800 }}>
                                Total: {fmt(filtered.reduce((s, e) => s + Number(e.amount), 0))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(5px)", padding: 16 }}>
                    <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 720, maxHeight: "93vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}>
                        {/* Modal Header */}
                        <div style={{ padding: "20px 26px 16px", borderBottom: "1px solid #F0F3FA", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 10, borderRadius: "20px 20px 0 0" }}>
                            <div>
                                <div style={{ fontSize: 17, fontWeight: 800, color: "#1A2B6D" }}>{editId ? "✏️ Edit Expense" : "➕ Add New Expense"}</div>
                                <div style={{ fontSize: 11.5, color: "#8892A4", marginTop: 2 }}>Fields marked with <span style={{ color: "#E53E3E" }}>*</span> are required</div>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid #E8ECF4", background: "#F8FAFF", cursor: "pointer", fontSize: 18, color: "#8892A4", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        </div>

                        <div style={{ padding: "22px 26px" }}>
                            {/* SECTION 1 — Basic Info */}
                            <div style={{ marginBottom: 24 }}>
                                <SectionHead n="1" title="Basic Information" />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                    <div>
                                        <Label required>Property Name</Label>
                                        <select value={form.property} onChange={e => setForm(f => ({ ...f, property: e.target.value }))} style={inp(errors.property)}>
                                            {PROPERTIES.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                        <ErrMsg msg={errors.property} />
                                    </div>
                                    <div>
                                        <Label required>Category</Label>
                                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp(errors.category)}>
                                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                        <ErrMsg msg={errors.category} />
                                    </div>
                                    <div style={{ gridColumn: "1/-1" }}>
                                        <Label required>Description</Label>
                                        <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Electricity bill for March 2026" style={inp(errors.description)} />
                                        <ErrMsg msg={errors.description} />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2 — Purchase Items */}
                            <div style={{ marginBottom: 24 }}>
                                <SectionHead n="2" title="Purchase Items" sub="(optional — auto-fills amount)" />
                                <div style={{ background: "#F8FAFF", borderRadius: 14, border: "1.5px solid #E2E8F4", overflow: "hidden" }}>
                                    {/* Column Headers */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 76px 110px 96px 36px", padding: "9px 14px", background: "linear-gradient(90deg,#EEF1FB,#F0F4FF)", borderBottom: "1.5px solid #E2E8F4", alignItems: "center" }}>
                                        {["Item Name *", "Select Category", "Qty", "Price (₹)", "Amount", ""].map((h, i) => (
                                            <div key={i} style={{ fontSize: 10.5, fontWeight: 700, color: "#3B5BDB", textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</div>
                                        ))}
                                    </div>

                                    {/* Rows */}
                                    {form.items.map((item, idx) => {
                                        const rowAmt = Number(item.qty || 0) * Number(item.price || 0);
                                        return (
                                            <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 150px 76px 110px 96px 36px", padding: "8px 14px", gap: 0, borderBottom: idx < form.items.length - 1 ? "1px solid #F0F3FA" : "none", alignItems: "center", background: idx % 2 === 1 ? "#FAFBFF" : "#fff", transition: "background .1s" }}>
                                                <input value={item.name} onChange={e => updateItem(item.id, "name", e.target.value)} placeholder="Item name *"
                                                    style={{ ...inp(false), fontSize: 12.5, padding: "8px 10px", marginRight: 8, borderRadius: 8 }} />
                                                <select value={item.category} onChange={e => updateItem(item.id, "category", e.target.value)}
                                                    style={{ ...inp(false), fontSize: 12, padding: "8px 8px", marginRight: 8, borderRadius: 8 }}>
                                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                                </select>
                                                <input type="number" value={item.qty} onChange={e => updateItem(item.id, "qty", e.target.value)} placeholder="Qty" min="1"
                                                    style={{ ...inp(false), fontSize: 12.5, padding: "8px 6px", marginRight: 8, borderRadius: 8, textAlign: "center" }} />
                                                <input type="number" value={item.price} onChange={e => updateItem(item.id, "price", e.target.value)} placeholder="0.00" min="0"
                                                    style={{ ...inp(false), fontSize: 12.5, padding: "8px 8px", marginRight: 8, borderRadius: 8 }} />
                                                <div style={{ background: "#EEF1FB", borderRadius: 8, padding: "8px 8px", fontSize: 12.5, fontWeight: 700, color: "#1A2B6D", marginRight: 6, textAlign: "center" }}>
                                                    {fmt(rowAmt)}
                                                </div>
                                                <button onClick={() => removeItem(item.id)}
                                                    style={{ width: 28, height: 28, borderRadius: 7, border: "1.5px solid #FFE4E4", background: "#FFF5F5", cursor: form.items.length > 1 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", opacity: form.items.length > 1 ? 1 : 0.3 }}>
                                                    <svg width="13" height="13" fill="none" stroke="#E53E3E" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {/* Footer */}
                                    <div style={{ padding: "10px 14px", borderTop: "1.5px solid #E2E8F4", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#EEF1FB" }}>
                                        <button onClick={addItem} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #3B5BDB", borderRadius: 9, padding: "7px 16px", fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", cursor: "pointer" }}>
                                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                             Add Item
                                        </button>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <span style={{ fontSize: 12, color: "#8892A4", fontWeight: 500 }}>Total Amount:</span>
                                            <span style={{ fontSize: 17, fontWeight: 800, color: "#1A2B6D" }}>{fmt(iTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3 — Payment Details */}
                            <div style={{ marginBottom: 4 }}>
                                <SectionHead n="3" title="Payment Details" />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                                    <div>
                                        <Label required>Amount (₹){iTotal > 0 && <span style={{ color: "#3B5BDB", fontWeight: 400, fontSize: 11 }}> — auto from items</span>}</Label>
                                        <input type="number" value={iTotal > 0 ? iTotal : form.amount} readOnly={iTotal > 0}
                                            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00"
                                            style={{ ...inp(errors.amount), background: iTotal > 0 ? "#EEF1FB" : "#F8FAFF", fontWeight: iTotal > 0 ? 800 : 400, color: iTotal > 0 ? "#1A2B6D" : "#374151" }} />
                                        <ErrMsg msg={errors.amount} />
                                    </div>
                                    <div>
                                        <Label required>Paid By</Label>
                                        <select value={form.paidBy} onChange={e => setForm(f => ({ ...f, paidBy: e.target.value }))} style={inp(errors.paidBy)}>
                                            {PAID_BY_OPTIONS.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                        <ErrMsg msg={errors.paidBy} />
                                    </div>
                                    <div>
                                        <Label required>Expense Date</Label>
                                        <input type="date" value={form.expenseDate} onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))} style={inp(errors.expenseDate)} />
                                        <ErrMsg msg={errors.expenseDate} />
                                    </div>
                                    <div>
                                        <Label required>Status</Label>
                                        <div style={{ display: "flex", gap: 8, height: 42 }}>
                                            {["Pending", "Paid"].map(s => {
                                                const active = form.status === s;
                                                const col = s === "Paid" ? { border: "#43A047", bg: "#E8F5E9", text: "#1B7A4E" } : { border: "#FFB300", bg: "#FFF8E1", text: "#B45309" };
                                                return (
                                                    <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                                                        style={{ flex: 1, border: `1.5px solid ${active ? col.border : "#E2E8F4"}`, borderRadius: 10, background: active ? col.bg : "#F8FAFF", fontSize: 13, fontWeight: 700, color: active ? col.text : "#8892A4", cursor: "pointer", transition: "all .15s" }}>
                                                        {s === "Paid" ? "✓ Paid" : "⏳ Pending"}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <Label required>Added By</Label>
                                        <input value={form.addedBy} onChange={e => setForm(f => ({ ...f, addedBy: e.target.value }))} placeholder="Your name" style={inp(errors.addedBy)} />
                                        <ErrMsg msg={errors.addedBy} />
                                    </div>
                                    <div>
                                        <Label>Receipt Upload</Label>
                                        <div onClick={() => fileRef.current.click()}
                                            style={{ border: "1.5px dashed #3B5BDB", borderRadius: 10, padding: "10px 12px", background: form.receiptName ? "#EEF1FB" : "#F8FAFF", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, height: 42, boxSizing: "border-box" }}>
                                            <svg width="15" height="15" fill="none" stroke={form.receiptName ? "#3B5BDB" : "#B0BAC9"} strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                            <span style={{ fontSize: 12.5, color: form.receiptName ? "#3B5BDB" : "#B0BAC9", fontWeight: form.receiptName ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                                                {form.receiptName || "Upload receipt / bill"}
                                            </span>
                                            {form.receiptName && (
                                                <button onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, receipt: null, receiptName: "" })) }}
                                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#8892A4", fontSize: 14, lineHeight: 1 }}>×</button>
                                            )}
                                            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} style={{ display: "none" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: "16px 26px 22px", borderTop: "1px solid #F0F3FA", display: "flex", gap: 10 }}>
                            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", border: "1.5px solid #E8ECF4", borderRadius: 11, background: "#F8FAFF", fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Cancel</button>
                            <button onClick={save} style={{ flex: 2, padding: "12px", border: "none", borderRadius: 11, background: "linear-gradient(135deg,#1A2B6D,#3B5BDB)", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(59,91,219,0.35)" }}>
                                {editId ? "✓ Update Expense" : "✓ Save Expense"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewItem && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(5px)", padding: 16 }}>
                    <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(0,0,0,0.25)" }}>
                        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #F0F3FA", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#1A2B6D" }}>📄 Expense Details</div>
                            <button onClick={() => setViewItem(null)} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #E8ECF4", background: "#F8FAFF", cursor: "pointer", fontSize: 18, color: "#8892A4", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        </div>
                        <div style={{ padding: "20px 24px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: viewItem.items?.filter(i => i.name).length > 0 ? 18 : 0 }}>
                                {[
                                    ["Property", viewItem.property],
                                    ["Category", viewItem.category],
                                    ["Description", viewItem.description, true],
                                    ["Amount", fmt(viewItem.amount)],
                                    ["Paid By", viewItem.paidBy],
                                    ["Expense Date", fmtDate(viewItem.expenseDate)],
                                    ["Status", viewItem.status],
                                    ["Added By", viewItem.addedBy],
                                    ["Receipt", viewItem.receipt || "Not uploaded"],
                                    ["Created At", fmtDateTime(viewItem.createdAt)],
                                ].map(([label, val, full], i) => (
                                    <div key={i} style={{ gridColumn: full ? "1/-1" : "auto" }}>
                                        <div style={{ fontSize: 10.5, color: "#8892A4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
                                        <div style={{ fontSize: 13, color: label === "Amount" ? "#1A2B6D" : label === "Status" ? (val === "Paid" ? "#1B7A4E" : "#B45309") : "#374151", fontWeight: label === "Amount" ? 800 : 500 }}>{val}</div>
                                    </div>
                                ))}
                            </div>
                            {viewItem.items?.filter(i => i.name).length > 0 && (
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "#3B5BDB", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Purchase Items</div>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                        <thead>
                                            <tr style={{ background: "#F8FAFF" }}>
                                                {["Item", "Category", "Qty", "Price", "Amount"].map(h => (
                                                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "#8892A4", borderBottom: "1px solid #F0F3FA" }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {viewItem.items.filter(i => i.name).map(it => (
                                                <tr key={it.id} style={{ borderBottom: "1px solid #F5F7FC" }}>
                                                    <td style={{ padding: "8px 10px", fontWeight: 500 }}>{it.name}</td>
                                                    <td style={{ padding: "8px 10px", color: "#8892A4" }}>{it.category}</td>
                                                    <td style={{ padding: "8px 10px" }}>{it.qty}</td>
                                                    <td style={{ padding: "8px 10px" }}>{fmt(it.price)}</td>
                                                    <td style={{ padding: "8px 10px", fontWeight: 700, color: "#1A2B6D" }}>{fmt(Number(it.qty || 0) * Number(it.price || 0))}</td>
                                                </tr>
                                            ))}
                                            <tr style={{ background: "#EEF1FB" }}>
                                                <td colSpan={4} style={{ padding: "8px 10px", fontWeight: 700, color: "#1A2B6D", textAlign: "right", fontSize: 12 }}>Total:</td>
                                                <td style={{ padding: "8px 10px", fontWeight: 800, color: "#1A2B6D", fontSize: 13 }}>{fmt(viewItem.items.filter(i => i.name).reduce((s, i) => s + (Number(i.qty || 0) * Number(i.price || 0)), 0))}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteId && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(5px)" }}>
                    <div style={{ background: "#fff", borderRadius: 20, padding: "34px", width: 380, textAlign: "center", boxShadow: "0 30px 80px rgba(0,0,0,0.25)" }}>
                        <div style={{ width: 56, height: 56, background: "#FFF5F5", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 26 }}>🗑️</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#1A2B6D", marginBottom: 8 }}>Delete Expense?</div>
                        <div style={{ fontSize: 13, color: "#8892A4", marginBottom: 24 }}>This action cannot be undone. The expense will be permanently deleted.</div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: "12px", border: "1.5px solid #E8ECF4", borderRadius: 10, background: "#F8FAFF", fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => { setExpenses(expenses.filter(e => e.id !== deleteId)); setDeleteId(null); }} style={{ flex: 1, padding: "12px", border: "none", borderRadius: 10, background: "linear-gradient(135deg,#C53030,#E53E3E)", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}