import { useState, useEffect, useCallback } from "react";
import {
    getCommunicationLogs,
    getCommunicationStatistics,
    exportCommunicationLogs,
    resendCommunication,
    deleteCommunicationLog,
    type CommunicationLog,
} from "@/lib/communicationLogApi";

// ─────────────────────────────────────────────────────────────────────────────
// STYLE TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const color = {
    bg: "#F2F4F8",
    surface: "#FFFFFF",
    border: "#E4E8F0",
    borderSub: "#EEF0F5",
    text: "#1A2340",
    textSub: "#6B7A99",
    textMute: "#9BA5BF",
    blue: "#185FA5",
    blueBg: "#E6F1FB",
    green: "#0F6E56",
    greenBg: "#E1F5EE",
    greenLine: "#1D9E75",
    red: "#A32D2D",
    redBg: "#FCEBEB",
    redLine: "#E24B4A",
    amber: "#854F0B",
    amberBg: "#FAEEDA",
    purple: "#3C3489",
    purpleBg: "#EEEDFE",
    orange: "#E8601A",
};

const radius = { sm: 6, md: 8, lg: 12 };

const AVATAR_COLORS = [
    { bg: "#E6F1FB", c: "#185FA5" }, { bg: "#E1F5EE", c: "#0F6E56" },
    { bg: "#EEEDFE", c: "#3C3489" }, { bg: "#FAEEDA", c: "#854F0B" },
    { bg: "#FCEBEB", c: "#A32D2D" }, { bg: "#EAF3DE", c: "#3B6D11" },
    { bg: "#FAECE7", c: "#993C1D" }, { bg: "#FBEAF0", c: "#993556" },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
    (name || "U").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

const getAvatar = (id: number) => AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];

const trunc = (str: string | null, n: number) => {
    if (!str) return "";
    return str.length > n ? str.slice(0, n) + "…" : str;
};

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────────────────────────────

function Badge({ variant = "success", children }: { variant?: string; children: React.ReactNode }) {
    const styles: Record<string, { bg: string; fg: string }> = {
        success: { bg: color.greenBg, fg: color.green },
        failed: { bg: color.redBg, fg: color.red },
        pending: { bg: color.amberBg, fg: color.amber },
        sent: { bg: color.greenBg, fg: color.green },
        delivered: { bg: color.greenBg, fg: color.green },
    };
    const s = styles[variant] || styles.success;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            padding: "2px 7px", borderRadius: 20,
            fontSize: 10, fontWeight: 600,
            background: s.bg, color: s.fg,
            whiteSpace: "nowrap",
        }}>
            {children}
        </span>
    );
}

function MiniBar({ pct, color: bg = color.greenLine }: { pct: number; color?: string }) {
    return (
        <div style={{ height: 3, borderRadius: 2, background: color.border, overflow: "hidden", marginTop: 3, width: "100%" }}>
            <div style={{ height: "100%", borderRadius: 2, background: bg, width: `${pct}%`, transition: "width .4s ease" }} />
        </div>
    );
}

function Avatar({ name, id }: { name: string; id: number }) {
    const av = getAvatar(id);
    return (
        <span style={{
            width: 26, height: 26, borderRadius: "50%",
            background: av.bg, color: av.c,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 700, flexShrink: 0, marginRight: 7,
        }}>
            {getInitials(name)}
        </span>
    );
}

function SortIcon({ active, dir }: { active: boolean; dir: number }) {
    return (
        <span style={{ fontSize: 9, color: active ? color.blue : color.textMute, marginLeft: 2 }}>
            {active ? (dir === 1 ? "▲" : "▼") : "⇅"}
        </span>
    );
}

function StatCard({ num, label, pct, barColor, textColor }: { num: number; label: string; pct?: number; barColor?: string; textColor?: string }) {
    return (
        <div style={{
            background: color.surface, border: `0.5px solid ${color.border}`,
            borderRadius: radius.md, padding: "10px 14px", flex: 1, minWidth: 0,
        }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: textColor || color.text, lineHeight: 1 }}>{num.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: color.textSub, marginTop: 3 }}>{label}</div>
            {pct !== undefined && <MiniBar pct={pct} color={barColor} />}
        </div>
    );
}

function FilterPill({ label, active, onClick, count, activeStyle }: { label: string; active: boolean; onClick: () => void; count?: number; activeStyle: any }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "4px 11px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
                fontFamily: "inherit", border: `0.5px solid ${color.border}`,
                transition: "all .15s",
                ...(active
                    ? activeStyle
                    : { background: color.bg, color: color.textSub }),
            }}
        >
            {label}
            {count !== undefined && (
                <span style={{
                    background: active ? "rgba(255,255,255,0.35)" : color.border,
                    color: active ? "inherit" : color.textSub,
                    borderRadius: 10, fontSize: 10, padding: "0 5px", fontWeight: 600,
                }}>
                    {count}
                </span>
            )}
        </button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPANDED ROW
// ─────────────────────────────────────────────────────────────────────────────

function ExpandedRow({ row }: { row: CommunicationLog }) {
    const isOk = row.status === "sent";
    const isPend = row.status === "pending";

    const InfoBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: color.textMute, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
                {title}
            </div>
            <div style={{ fontSize: 11, color: color.text, lineHeight: 1.8 }}>{children}</div>
        </div>
    );

    const Row = ({ label, val, valColor }: { label: string; val: string | number; valColor?: string }) => (
        <div style={{ display: "flex", gap: 6 }}>
            <span style={{ color: color.textSub, minWidth: 64, flexShrink: 0 }}>{label}</span>
            <span style={{ color: valColor || color.text, fontWeight: 500 }}>{String(val)}</span>
        </div>
    );

    const remarkVariant = isOk ? "ok" : isPend ? "pending" : "fail";
    const remarkStyles = {
        ok: { bg: color.greenBg, fg: color.green, border: "#9FE1CB" },
        pending: { bg: color.amberBg, fg: color.amber, border: "#FAC775" },
        fail: { bg: color.redBg, fg: color.red, border: "#F7C1C1" },
    };
    const rs = remarkStyles[remarkVariant as keyof typeof remarkStyles];

    return (
        <tr>
            <td colSpan={11} style={{ padding: 0 }}>
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14,
                    padding: "14px 16px", background: "#F8F9FC",
                    borderTop: `0.5px solid ${color.border}`,
                }}>
                    <InfoBlock title="Delivery Timeline">
                        <Row label="Sent" val={formatDate(row.sent_at)} />
                        <Row label="Delivered" val={row.delivered_at || "—"} valColor={isOk ? color.green : color.red} />
                        <Row label="Created" val={formatDate(row.created_at)} />
                    </InfoBlock>

                    <InfoBlock title="Contact Info">
                        <Row label="Name" val={row.recipient_name || "—"} />
                        <Row label="Email" val={row.recipient_email} />
                        <Row label="Phone" val={row.recipient_phone || "—"} />
                    </InfoBlock>

                    <InfoBlock title="Engagement">
                        <Row label="Retries" val={row.retries} />
                        <Row label="Template" val={row.template_name || "—"} />
                        <Row label="Property" val={row.property_name || "—"} />
                        <Row label="Tenant" val={row.tenant_name || "—"} />
                    </InfoBlock>

                    <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: color.textMute, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
                            {row.status === "failed" ? "Failure Reason" : "Remark"}
                        </div>
                        <div style={{
                            borderRadius: radius.sm, padding: "8px 10px",
                            fontSize: 11, lineHeight: 1.6,
                            background: rs.bg, color: rs.fg,
                            border: `0.5px solid ${rs.border}`,
                        }}>
                            {row.error_message || "No error / All good"}
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE ROW
// ─────────────────────────────────────────────────────────────────────────────

function EmailRow({ row, isExpanded, onToggle, onResend, onDelete }: {
    row: CommunicationLog;
    isExpanded: boolean;
    onToggle: () => void;
    onResend: (id: number) => void;
    onDelete: (id: number) => void;
}) {
    const [hovered, setHovered] = useState(false);

    const statusBadge = {
        sent: <Badge variant="success">Sent</Badge>,
        failed: <Badge variant="failed">Failed</Badge>,
        pending: <Badge variant="pending">Pending</Badge>,
        delivered: <Badge variant="success">Delivered</Badge>,
    }[row.status] || <Badge variant="pending">{row.status}</Badge>;

    const remarkText = row.error_message || row.subject || "—";
    const remarkColor = row.status === "failed" ? color.red : row.status === "pending" ? color.amber : color.textSub;

    const tdStyle = {
        padding: "9px 11px", verticalAlign: "middle",
        background: hovered || isExpanded ? "#F5F7FB" : "transparent",
        transition: "background .1s",
    };

    return (
        <>
            <tr
                onClick={onToggle}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{ cursor: "pointer", borderBottom: `0.5px solid ${color.borderSub}` }}
            >
                <td style={{ ...tdStyle, width: 28, textAlign: "center", padding: "9px 6px" }}>
                    <span style={{
                        display: "inline-block", fontSize: 10, color: color.textMute,
                        transition: "transform .15s",
                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    }}>▶</span>
                </td>

                <td style={{ ...tdStyle, maxWidth: 150 }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar name={row.recipient_name || row.recipient_email} id={row.id} />
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: color.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {row.recipient_name || "—"}
                            </div>
                            <div style={{ fontSize: 10, color: color.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {row.recipient_email}
                            </div>
                        </div>
                    </div>
                </td>

                <td style={{ ...tdStyle, fontSize: 11, color: color.text, maxWidth: 160 }}>
                    <span title={row.subject || ""}>{trunc(row.subject, 30) || "—"}</span>
                </td>

                <td style={{ ...tdStyle, fontSize: 11, color: color.textSub, whiteSpace: "nowrap" }}>
                    {row.communication_type?.replace("_", " ") || "—"}
                </td>

                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{statusBadge}</td>
                <td style={{ ...tdStyle, textAlign: "center", fontSize: 12 }}>
                    {row.channel === "email" ? "Email" : row.channel === "whatsapp" ? "WhatsApp" : "SMS"}
                </td>
                <td style={{ ...tdStyle, fontSize: 11, color: color.textSub, whiteSpace: "nowrap" }}>
                    {formatDate(row.sent_at)}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                    {row.retries > 0 ? <Badge variant="failed">{row.retries}x</Badge> : <span style={{ fontSize: 10, color: color.textMute }}>0</span>}
                </td>
                <td style={{ ...tdStyle, fontSize: 10, color: remarkColor, maxWidth: 140 }}>
                    <span title={remarkText}>{trunc(remarkText, 32)}</span>
                </td>
                <td style={{ ...tdStyle, textAlign: "center", whiteSpace: "nowrap" }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onResend(row.id); }}
                        disabled={row.status !== "failed"}
                        style={{
                            background: "none", border: `0.5px solid ${row.status === "failed" ? color.red : color.border}`,
                            borderRadius: radius.sm, padding: "4px 8px",
                            fontSize: 10, cursor: row.status === "failed" ? "pointer" : "not-allowed",
                            color: row.status === "failed" ? color.red : color.textMute,
                            marginRight: 6, fontFamily: "inherit",
                        }}
                    >
                        Retry
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(row.id); }}
                        style={{
                            background: "none", border: `0.5px solid ${color.border}`,
                            borderRadius: radius.sm, padding: "4px 8px",
                            fontSize: 10, cursor: "pointer", color: color.textMute,
                            fontFamily: "inherit",
                        }}
                    >
                        Delete
                    </button>
                </td>
            </tr>
            {isExpanded && <ExpandedRow row={row} />}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function EmailHistory() {
    const [logs, setLogs] = useState<CommunicationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0, sent: 0, failed: 0, pending: 0, opened: 0, clicked: 0
    });

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [sortKey, setSortKey] = useState("sent_at");
    const [sortDir, setSortDir] = useState(-1);
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [exporting, setExporting] = useState(false);

    const PER_PAGE = 8;

    // Load logs from API
    const loadLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const filters: any = { page, limit: PER_PAGE, sortBy: sortKey, sortOrder: sortDir === 1 ? "ASC" : "DESC" };
            if (search) filters.search = search;
            if (filter !== "all") {
                if (filter === "opened") filters.status = "opened";
                else if (filter === "clicked") filters.status = "clicked";
                else filters.status = filter;
            }

            const response = await getCommunicationLogs(filters);
            if (response.success) {
                setLogs(response.data);
            } else {
                setError("Failed to load logs");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [page, search, filter, sortKey, sortDir]);

    // Load statistics from API
    const loadStats = useCallback(async () => {
        try {
            const response = await getCommunicationStatistics();
            if (response.success) {
                setStats({
                    total: response.data.total || 0,
                    sent: response.data.sent || 0,
                    failed: response.data.failed || 0,
                    pending: response.data.pending || 0,
                    opened: 0,
                    clicked: 0,
                });
            }
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    }, []);

    useEffect(() => {
        loadLogs();
        loadStats();
    }, [loadLogs, loadStats]);

    const handleResend = async (id: number) => {
        if (!confirm("Are you sure you want to resend this?")) return;
        try {
            await resendCommunication(id);
            alert("Resent successfully!");
            loadLogs();
        } catch (err: any) {
            alert(err.message || "Failed to resend");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this log?")) return;
        try {
            await deleteCommunicationLog(id);
            alert("Deleted successfully!");
            loadLogs();
            loadStats();
        } catch (err: any) {
            alert(err.message || "Failed to delete");
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const filters: any = {};
            if (search) filters.search = search;
            if (filter !== "all") filters.status = filter;
            await exportCommunicationLogs(filters);
            alert("Export completed!");
        } catch (err: any) {
            alert(err.message || "Export failed");
        } finally {
            setExporting(false);
        }
    };

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => d * -1);
        else { setSortKey(key); setSortDir(1); }
        setPage(1);
    };

    const handleFilter = (f: string) => { setFilter(f); setPage(1); setExpandedId(null); };
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); setExpandedId(null); };
    const toggleExpand = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

    const totalPages = Math.ceil(stats.total / PER_PAGE) || 1;
    const safePage = Math.min(page, totalPages);

    const pills = [
        { key: "all", label: "All", activeStyle: { background: color.blueBg, color: color.blue, border: `0.5px solid ${color.blue}` }, count: stats.total },
        { key: "sent", label: "Sent", activeStyle: { background: color.greenBg, color: color.green, border: `0.5px solid ${color.green}` }, count: stats.sent },
        { key: "failed", label: "Failed", activeStyle: { background: color.redBg, color: color.red, border: `0.5px solid ${color.red}` }, count: stats.failed },
        { key: "pending", label: "Pending", activeStyle: { background: color.amberBg, color: color.amber, border: `0.5px solid ${color.amber}` }, count: stats.pending },
    ];

    const headers = [
        { key: null, label: "", width: 28, sortable: false },
        { key: "recipient_name", label: "Recipient", width: 155, sortable: true },
        { key: "subject", label: "Subject", width: 160, sortable: true },
        { key: "communication_type", label: "Type", width: 110, sortable: true },
        { key: "status", label: "Status", width: 88, sortable: true },
        { key: "channel", label: "Channel", width: 70, sortable: false },
        { key: "sent_at", label: "Sent At", width: 130, sortable: true },
        { key: "retries", label: "Retries", width: 68, sortable: true },
        { key: "error_message", label: "Remark", width: 140, sortable: false },
        { key: null, label: "Actions", width: 100, sortable: false },
    ];

    return (
        <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: color.bg, minHeight: "100vh", padding: "24px" }}>
            {/* Page Title */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: color.text, margin: 0 }}>Communication History</h2>
                    <p style={{ fontSize: 12, color: color.textSub, marginTop: 3 }}>Communication logs with status & delivery details</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    style={{
                        background: color.orange, color: "#fff", border: "none",
                        borderRadius: radius.md, padding: "8px 16px",
                        fontSize: 12, fontWeight: 600, cursor: exporting ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
                        opacity: exporting ? 0.6 : 1,
                    }}
                >
                    {exporting ? "⏳" : "📥"} {exporting ? "Exporting..." : "Export CSV"}
                </button>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <StatCard num={stats.total} label="Total Communications" textColor={color.blue} />
                <StatCard num={stats.sent} label="Sent / Delivered" textColor={color.green}
                    pct={stats.total ? Math.round(stats.sent / stats.total * 100) : 0} barColor={color.greenLine} />
                <StatCard num={stats.failed} label="Failed" textColor={color.red}
                    pct={stats.total ? Math.round(stats.failed / stats.total * 100) : 0} barColor={color.redLine} />
                <StatCard num={stats.pending} label="Pending" textColor={color.amber} />
            </div>

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {/* Search */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: color.surface, border: `0.5px solid ${color.border}`,
                    borderRadius: radius.md, padding: "6px 10px", flex: 1, minWidth: 200,
                }}>
                    <span style={{ fontSize: 13, color: color.textMute }}>🔍</span>
                    <input
                        value={search}
                        onChange={handleSearch}
                        placeholder="Search name, email, subject…"
                        style={{
                            border: "none", background: "none", fontSize: 12,
                            color: color.text, outline: "none", fontFamily: "inherit", width: "100%",
                        }}
                    />
                    {search && (
                        <button
                            onClick={() => { setSearch(""); setPage(1); }}
                            style={{ border: "none", background: "none", color: color.textMute, cursor: "pointer", fontSize: 14, lineHeight: 1 }}
                        >×</button>
                    )}
                </div>

                {/* Filter pills */}
                {pills.map((p) => (
                    <FilterPill
                        key={p.key}
                        label={p.label}
                        count={p.count}
                        active={filter === p.key}
                        activeStyle={p.activeStyle}
                        onClick={() => handleFilter(p.key)}
                    />
                ))}
            </div>

            {/* Table */}
            <div style={{
                background: color.surface, border: `0.5px solid ${color.border}`,
                borderRadius: radius.lg, overflow: "hidden",
            }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 900 }}>
                        <colgroup>
                            {headers.map((h, i) => <col key={i} style={{ width: h.width }} />)}
                        </colgroup>
                        <thead>
                            <tr style={{ background: "#F8F9FC", borderBottom: `0.5px solid ${color.border}` }}>
                                {headers.map((h) => (
                                    <th
                                        key={h.label}
                                        onClick={h.sortable ? () => handleSort(h.key as string) : undefined}
                                        style={{
                                            padding: "8px 11px", textAlign: "left",
                                            fontSize: 10, fontWeight: 600, color: color.textSub,
                                            whiteSpace: "nowrap", userSelect: "none",
                                            cursor: h.sortable ? "pointer" : "default",
                                        }}
                                    >
                                        {h.label}
                                        {h.sortable && <SortIcon active={sortKey === h.key} dir={sortDir} />}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={10} style={{ textAlign: "center", padding: 40 }}>Loading...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: color.red }}>❌ {error}</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: color.textMute }}>No records found</td></tr>
                            ) : (
                                logs.map((row) => (
                                    <EmailRow
                                        key={row.id}
                                        row={row}
                                        isExpanded={expandedId === row.id}
                                        onToggle={() => toggleExpand(row.id)}
                                        onResend={handleResend}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderTop: `0.5px solid ${color.border}`,
                    fontSize: 11, color: color.textSub,
                }}>
                    <span>
                        {logs.length > 0
                            ? `Showing ${(safePage - 1) * PER_PAGE + 1}–${Math.min(safePage * PER_PAGE, stats.total)} of ${stats.total} records`
                            : "No records"}
                    </span>
                    <div style={{ display: "flex", gap: 3 }}>
                        <button
                            onClick={() => { setPage((p) => Math.max(1, p - 1)); setExpandedId(null); }}
                            disabled={safePage === 1}
                            style={{
                                padding: "3px 8px", border: `0.5px solid ${color.border}`,
                                borderRadius: radius.sm, background: color.surface,
                                color: safePage === 1 ? color.textMute : color.text,
                                fontSize: 11, cursor: safePage === 1 ? "default" : "pointer",
                                fontFamily: "inherit",
                            }}
                        >‹</button>
                        <span style={{ padding: "3px 8px", fontSize: 11 }}>
                            Page {safePage} of {totalPages}
                        </span>
                        <button
                            onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); setExpandedId(null); }}
                            disabled={safePage === totalPages}
                            style={{
                                padding: "3px 8px", border: `0.5px solid ${color.border}`,
                                borderRadius: radius.sm, background: color.surface,
                                color: safePage === totalPages ? color.textMute : color.text,
                                fontSize: 11, cursor: safePage === totalPages ? "default" : "pointer",
                                fontFamily: "inherit",
                            }}
                        >›</button>
                    </div>
                </div>
            </div>
        </div>
    );
}