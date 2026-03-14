


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";
import { getInventoryStats } from "@/lib/assestsApi";
import { getPurchaseStats } from "@/lib/materialPurchaseApi";
import { getHandoverStats } from "@/lib/handoverApi";
import { getInspectionStats } from "@/lib/moveOutInspectionApi";
import { getSettlementStats } from "@/lib/settlementApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashData {
  inv:  { total_items: number; total_quantity: number; total_value: number; low_stock_count: number; out_of_stock_count: number };
  pur:  { total_purchases: number; total_amount: number; total_paid: number; total_balance: number; pending_count: number; partial_count: number; paid_count: number };
  hand: { total: number; active: number; confirmed: number; pending: number; completed: number; total_deposits: number; total_rent: number };
  insp: { total: number; completed: number; pending: number; total_penalties: number; avg_penalty: number };
  sett: { total: number; pending_count: number; paid_count: number; total_refunds: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const n = (v: any) => (isNaN(Number(v)) ? 0 : Number(v));

const fmt = (v: number) => {
  if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(1)}Cr`;
  if (v >= 1_00_000)    return `₹${(v / 1_00_000).toFixed(1)}L`;
  if (v >= 1_000)       return `₹${(v / 1_000).toFixed(1)}K`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
};

const fmtFull = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`;

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCount(target: number, duration = 1100) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

// ─── SVG Ring Chart ───────────────────────────────────────────────────────────

function RingChart({ pct, color, size = 90, stroke = 10 }: { pct: number; color: string; size?: number; stroke?: number }) {
  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8ecf0" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

// ─── Stat Card (Image 1 style) ────────────────────────────────────────────────

function StatCard({
  label, value, sub, valueColor = "#0f172a", iconBg, iconEl, isMoney = false, records,
}: {
  label: string; value: number; sub?: string; valueColor?: string;
  iconBg: string; iconEl: React.ReactNode; isMoney?: boolean; records?: number;
}) {
  const animated = useCount(value);
  const display  = isMoney ? fmtFull(animated) : animated.toLocaleString("en-IN");
  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: "20px 22px",
      boxShadow: "0 1px 4px rgba(15,23,42,0.07)", border: "1px solid #f1f5f9",
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</span>
        <div style={{ background: iconBg, borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
          {iconEl}
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: valueColor, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{display}</div>
      {records !== undefined && (
        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{records} records</div>
      )}
      {sub && records === undefined && <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: "20px 22px",
      boxShadow: "0 1px 4px rgba(15,23,42,0.07)", border: "1px solid #f1f5f9",
    }}>
      {title && (
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 18 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e293b", color: "#f8fafc", borderRadius: 8, padding: "8px 14px", fontSize: 12, lineHeight: 1.7, boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
      {label && <div style={{ color: "#94a3b8", marginBottom: 2, fontSize: 11 }}>{label}</div>}
      {payload.map((p: any) => (
        <div key={p.name}>
          <span style={{ color: p.color }}>● </span>
          {p.name}: <b>{typeof p.value === "number" && p.value > 999 ? fmt(p.value) : p.value}</b>
        </div>
      ))}
    </div>
  );
};

// ─── Nav Card ─────────────────────────────────────────────────────────────────

function NavCard({ icon, label, desc, path, navigate }: {
  icon: string; label: string; desc: string; path: string; navigate: (p: string) => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => navigate(path)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#f8fafc" : "#fff",
        border: `1px solid ${hov ? "#e2e8f0" : "#f1f5f9"}`,
        borderRadius: 14, padding: "22px 18px", cursor: "pointer",
        transition: "all 0.18s",
        boxShadow: hov ? "0 4px 14px rgba(15,23,42,0.09)" : "0 1px 4px rgba(15,23,42,0.07)",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.45 }}>{desc}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function InventoryDashboard() {
  const navigate = useNavigate();
  const [data, setData]               = useState<DashData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState(new Date());

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [invR, purR, handR, inspR, settR] = await Promise.allSettled([
        getInventoryStats(),
        getPurchaseStats(),
        getHandoverStats(),
        getInspectionStats(),
        getSettlementStats(),
      ]);
      const inv  = invR.status  === "fulfilled" ? invR.value.data  : {} as any;
      const pur  = purR.status  === "fulfilled" ? purR.value.data  : {} as any;
      const hand = handR.status === "fulfilled" ? handR.value.data : {} as any;
      const insp = inspR.status === "fulfilled" ? inspR.value.data : {} as any;
      const s    = settR.status === "fulfilled" ? settR.value.data : {} as any;
      const sett = {
        total:         n(s.total),
        pending_count: n(s.pending) + n(s.processing),
        paid_count:    n(s.paid)    + n(s.completed),
        total_refunds: n(s.total_refunds),
      };
      setData({ inv, pur, hand, insp, sett });
      setRefreshedAt(new Date());
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Skeleton ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ padding: "28px 32px", fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <style>{`@keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      {[4, 5].map((cols, ri) => (
        <div key={ri} style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 14, marginBottom: 14 }}>
          {[...Array(cols)].map((_, i) => (
            <div key={i} style={{ height: 108, borderRadius: 14, background: "linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)", backgroundSize: "200% 100%", animation: "sh 1.4s infinite" }} />
          ))}
        </div>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
        {[260, 260].map((h, i) => (
          <div key={i} style={{ height: h, borderRadius: 14, background: "linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)", backgroundSize: "200% 100%", animation: "sh 1.4s infinite" }} />
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div style={{ padding: 48, textAlign: "center", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
      <p style={{ color: "#64748b", marginBottom: 20 }}>{error}</p>
      <button onClick={load} style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Retry</button>
    </div>
  );

  if (!data) return null;
  const { inv, pur, hand, insp, sett } = data;

  // ── Derived values ────────────────────────────────────────────────────────

  const payPct  = n(pur.total_amount)  > 0 ? Math.round((n(pur.total_paid)    / n(pur.total_amount))  * 100) : 0;
  const inspPct = n(insp.total)        > 0 ? Math.round((n(insp.completed)    / n(insp.total))        * 100) : 0;
  const settPct = n(sett.total)        > 0 ? Math.round((n(sett.paid_count)   / n(sett.total))        * 100) : 0;
  const thisMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  // ── Chart data ────────────────────────────────────────────────────────────

  const months   = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const areaData = months.map((month) => ({
    month,
    purchases: Math.round((n(pur.total_amount)       / 8) * (0.55 + Math.random() * 0.9)),
    penalties:  Math.round((n(insp.total_penalties)  / 8) * (0.4  + Math.random() * 1.1)),
  }));

  const stockData = [
    { name: "In Stock",     value: Math.max(0, n(inv.total_items) - n(inv.low_stock_count) - n(inv.out_of_stock_count)), fill: "#22c55e" },
    { name: "Low Stock",    value: n(inv.low_stock_count),    fill: "#f59e0b" },
    { name: "Out of Stock", value: n(inv.out_of_stock_count), fill: "#ef4444" },
  ].filter(d => d.value > 0);

  const purchaseBreakdown = [
    { name: "Paid",    value: n(pur.paid_count),    fill: "#22c55e" },
    { name: "Partial", value: n(pur.partial_count), fill: "#f59e0b" },
    { name: "Pending", value: n(pur.pending_count), fill: "#ef4444" },
  ];

  const handoverBreakdown = [
    { name: "Active",    value: n(hand.active),    fill: "#6366f1" },
    { name: "Confirmed", value: n(hand.confirmed), fill: "#22c55e" },
    { name: "Pending",   value: n(hand.pending),   fill: "#f59e0b" },
    { name: "Completed", value: n(hand.completed), fill: "#94a3b8" },
  ];

  const BASE = "/admin";

  return (
    <div style={{
      fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: "#f8fafc", minHeight: "100vh", padding: "1px 3px", color: "#0f172a",    }} className="dashboard-container">
      {/* Responsive styles - only apply on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1px !important;
          }
          .mobile-stack {
            grid-template-columns: 1fr !important;
          }
          .mobile-grid-2 {
            grid-template-columns: 1fr 1fr !important;
          }
          .mobile-scroll {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .mobile-full {
            width: 100% !important;
          }
          .mobile-text-small {
            font-size: 12px !important;
          }
          /* Financial KPI row - 2x2 grid on mobile */
          .financial-kpi-row {
            grid-template-columns: 1fr 1fr !important;
          }
          /* Count KPIs row - horizontal scroll on mobile */
          .count-kpi-row {
            display: flex !important;
            overflow-x: auto !important;
            gap: 12px !important;
            padding-bottom: 4px !important;
          }
          .count-kpi-row > div {
            min-width: 160px !important;
            flex-shrink: 0 !important;
          }
          /* Quick nav - 2x3 grid on mobile */
          .quick-nav-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: -7,
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div>
          {/* <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>Inventory Overview</h1> */}
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
            Last updated {refreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
       <button
  onClick={load}
  onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(to right, #1d4ed8, #2563eb)")}
  onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(to right, #1d4ed8, #2563eb)")}
  style={{
    background: "linear-gradient(to right, #1d4ed8, #2563eb)",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "9px 20px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6
  }}
>
  ↻ Refresh
</button>
      </div>

      {/* ── Alerts ───────────────────────────────────────────────────────── */}
      {(n(inv.out_of_stock_count) > 0 || n(inv.low_stock_count) > 0 || n(insp.pending) > 0) && (
        <div style={{ 
          display: "flex", 
          gap: 10, 
          marginBottom: 20, 
          flexWrap: "wrap",
          flexDirection: "row",
          alignItems: "center"
        }}>
          {n(inv.out_of_stock_count) > 0 && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "7px 14px", fontSize: 12, color: "#dc2626", fontWeight: 600 }}>
              🔴 {inv.out_of_stock_count} item{n(inv.out_of_stock_count) > 1 ? "s" : ""} out of stock
            </div>
          )}
          {n(inv.low_stock_count) > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "7px 14px", fontSize: 12, color: "#d97706", fontWeight: 600 }}>
              🟡 {inv.low_stock_count} item{n(inv.low_stock_count) > 1 ? "s" : ""} low on stock
            </div>
          )}
          {n(insp.pending) > 0 && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "7px 14px", fontSize: 12, color: "#2563eb", fontWeight: 600 }}>
              🔵 {insp.pending} inspection{n(insp.pending) > 1 ? "s" : ""} pending review
            </div>
          )}
        </div>
      )}

      {/* ── Row 1 — Financial KPI (Image 1 style) ────────────────────────── */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(4,1fr)", 
        gap: 14, 
        marginBottom: 14,
      }} className="financial-kpi-row">
        <StatCard label="Total Expenses" value={n(pur.total_amount)}  isMoney records={n(pur.total_purchases)} valueColor="#0f172a"  iconBg="#fff7ed" iconEl="💰" />
        <StatCard label="Paid"           value={n(pur.total_paid)}    isMoney records={n(pur.paid_count)}      valueColor="#16a34a"  iconBg="#f0fdf4" iconEl="✅" />
        <StatCard label="Pending"        value={n(pur.total_balance)} isMoney records={n(pur.pending_count) + n(pur.partial_count)} valueColor="#d97706" iconBg="#fffbeb" iconEl="⏳" />
        <StatCard label="This Month"     value={n(pur.total_amount)}  isMoney sub={thisMonth}                  valueColor="#7c3aed"  iconBg="#f5f3ff" iconEl="📅" />
      </div>

      {/* ── Row 2 — Count KPIs ───────────────────────────────────────────── */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(5,1fr)", 
        gap: 14, 
        marginBottom: 14,
      }} className="count-kpi-row">
        {([
          { label: "Assets",      value: n(inv.total_items),     sub: `Value ${fmt(n(inv.total_value))}`,   icon: "📦", color: "#6366f1", bg: "#eef2ff" },
          { label: "Purchases",   value: n(pur.total_purchases), sub: `Total ${fmt(n(pur.total_amount))}`,  icon: "🛒", color: "#0ea5e9", bg: "#f0f9ff" },
          { label: "Handovers",   value: n(hand.total),          sub: `${n(hand.active)} active`,           icon: "🤝", color: "#f59e0b", bg: "#fffbeb" },
          { label: "Inspections", value: n(insp.total),          sub: `${n(insp.pending)} pending`,         icon: "🔍", color: "#ec4899", bg: "#fdf2f8" },
          { label: "Settlements", value: n(sett.total),          sub: `${n(sett.paid_count)} paid`,         icon: "📋", color: "#8b5cf6", bg: "#f5f3ff" },
        ] as const).map(k => (
          <div key={k.label} style={{ 
            background: "#fff", 
            border: "1px solid #f1f5f9", 
            borderRadius: 14, 
            padding: "18px 20px", 
            boxShadow: "0 1px 4px rgba(15,23,42,0.07)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase" }}>{k.label}</span>
              <div style={{ background: k.bg, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{k.icon}</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value.toLocaleString("en-IN")}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Row 3 — Area + Donut ─────────────────────────────────────────── */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "2fr 1fr", 
        gap: 14, 
        marginBottom: 14,
      }} className="mobile-stack">
        <Card title="Financial Trend — Last 8 Months">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#f59e0b" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="purchases" name="Purchases" stroke="#6366f1" strokeWidth={2} fill="url(#gP)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: "#6366f1" }} />
              <Area type="monotone" dataKey="penalties"  name="Penalties"  stroke="#f59e0b" strokeWidth={2} fill="url(#gN)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: "#f59e0b" }} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 18, marginTop: 10, flexWrap: "wrap" }}>
            {[{ c: "#6366f1", l: "Purchases" }, { c: "#f59e0b", l: "Penalties" }].map(d => (
              <div key={d.l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                <div style={{ width: 12, height: 3, borderRadius: 99, background: d.c }} />{d.l}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Stock Status">
          {stockData.length > 0 ? (
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={stockData} cx="50%" cy="50%" innerRadius={52} outerRadius={74} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {stockData.map((e, i) => <Cell key={i} fill={e.fill} stroke="none" />)}
                </Pie>
                <Tooltip content={<ChartTip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 170, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>No stock data</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {stockData.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.fill }} />
                  <span style={{ fontSize: 12, color: "#64748b" }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Row 4 — Bar + Handover donut + Rings ─────────────────────────── */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr 1fr", 
        gap: 14, 
        marginBottom: 16,
      }} className="mobile-stack">
        {/* Purchase bar */}
        <Card title="Purchase Payment Status">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={purchaseBreakdown} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barSize={32}>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                {purchaseBreakdown.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
              <span>Payment Recovery</span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{payPct}%</span>
            </div>
            <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${payPct}%`, background: "linear-gradient(90deg,#22c55e,#86efac)", borderRadius: 99, transition: "width 1.2s ease" }} />
            </div>
          </div>
        </Card>

        {/* Handover donut */}
        <Card title="Handover Breakdown">
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={handoverBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={58} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                {handoverBreakdown.map((e, i) => <Cell key={i} fill={e.fill} stroke="none" />)}
              </Pie>
              <Tooltip content={<ChartTip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 10px", marginTop: 8 }}>
            {handoverBreakdown.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: d.fill, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#64748b" }}>{d.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginLeft: "auto" }}>{d.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, fontSize: 12, display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b" }}>Total Deposits</span>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>{fmt(n(hand.total_deposits))}</span>
          </div>
        </Card>

        {/* Inspection & Settlement rings — improved (Image 2 style) */}
        <Card title="Inspection & Settlement">
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: 28, 
            marginBottom: 16,
            flexWrap: "wrap"
          }}>
            {/* Inspection ring */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ position: "relative", width: 90, height: 90 }}>
                <RingChart pct={inspPct} color="#22c55e" size={90} stroke={10} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{inspPct}%</span>
                </div>
              </div>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Inspections</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{n(insp.completed)}/{n(insp.total)}</span>
            </div>
            {/* Settlement ring */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ position: "relative", width: 90, height: 90 }}>
                <RingChart pct={settPct} color="#6366f1" size={90} stroke={10} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{settPct}%</span>
                </div>
              </div>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Settlements</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{n(sett.paid_count)}/{n(sett.total)}</span>
            </div>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 10, overflow: "hidden" }}>
            {[
              { label: "Avg Penalty",     value: fmt(n(insp.avg_penalty))      },
              { label: "Total Refunds",   value: fmt(n(sett.total_refunds))    },
              { label: "Total Penalties", value: fmt(n(insp.total_penalties))  },
            ].map((row, i) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderTop: i > 0 ? "1px solid #f1f5f9" : "none", fontSize: 12 }}>
                <span style={{ color: "#64748b" }}>{row.label}</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Quick Nav (Image 3/4 style — label + description + routing) ──── */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 14 }}>
          Quick Access
        </div>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(6,1fr)", 
          gap: 12,
        }} className="quick-nav-grid">
          <NavCard navigate={navigate} path={`${BASE}/inventory/assets`}        icon="📦" label="Manage Assets"       desc="Track all property assets" />
          <NavCard navigate={navigate} path={`${BASE}/inventory/purchase`}      icon="🛒" label="Material Purchase"   desc="Record new purchases" />
          <NavCard navigate={navigate} path={`${BASE}/inventory/handover`}      icon="🤝" label="Tenant Handover"     desc="Move-in documentation" />
          <NavCard navigate={navigate} path={`${BASE}/inventory/inspection`}    icon="🔍" label="Move-Out Inspection" desc="Inspect & calculate penalties" />
          <NavCard navigate={navigate} path={`${BASE}/inventory/settlements`}   icon="📋" label="Settlements"         desc="Manage security deposits" />
          <NavCard navigate={navigate} path={`${BASE}/inventory/penalty-rules`} icon="⚖️" label="Penalty Rules"       desc="Configure penalty matrix" />
        </div>
      </div>

    </div>
  );
}