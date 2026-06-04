

// // import { useState, useEffect, useCallback } from "react";
// // import {
// //     getCommunicationLogs,
// //     getCommunicationStatistics,
// //     exportCommunicationLogs,
// //     resendCommunication,
// //     deleteCommunicationLog,
// //     type CommunicationLog,
// // } from "@/lib/communicationLogApi";

// // // ─────────────────────────────────────────────────────────────────────────────
// // // STYLE TOKENS
// // // ─────────────────────────────────────────────────────────────────────────────

// // const color = {
// //     bg: "#F2F4F8",
// //     surface: "#FFFFFF",
// //     border: "#E4E8F0",
// //     borderSub: "#EEF0F5",
// //     text: "#1A2340",
// //     textSub: "#6B7A99",
// //     textMute: "#9BA5BF",
// //     blue: "#185FA5",
// //     blueBg: "#E6F1FB",
// //     green: "#0F6E56",
// //     greenBg: "#E1F5EE",
// //     greenLine: "#1D9E75",
// //     red: "#A32D2D",
// //     redBg: "#FCEBEB",
// //     redLine: "#E24B4A",
// //     amber: "#854F0B",
// //     amberBg: "#FAEEDA",
// //     purple: "#3C3489",
// //     purpleBg: "#EEEDFE",
// //     orange: "#E8601A",
// // };

// // const radius = { sm: 6, md: 8, lg: 12 };

// // const AVATAR_COLORS = [
// //     { bg: "#E6F1FB", c: "#185FA5" }, { bg: "#E1F5EE", c: "#0F6E56" },
// //     { bg: "#EEEDFE", c: "#3C3489" }, { bg: "#FAEEDA", c: "#854F0B" },
// //     { bg: "#FCEBEB", c: "#A32D2D" }, { bg: "#EAF3DE", c: "#3B6D11" },
// //     { bg: "#FAECE7", c: "#993C1D" }, { bg: "#FBEAF0", c: "#993556" },
// // ];

// // // ─────────────────────────────────────────────────────────────────────────────
// // // HELPERS
// // // ─────────────────────────────────────────────────────────────────────────────

// // const getInitials = (name: string) =>
// //     (name || "U").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

// // const getAvatar = (id: number) => AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];

// // const trunc = (str: string | null, n: number) => {
// //     if (!str) return "";
// //     return str.length > n ? str.slice(0, n) + "…" : str;
// // };

// // const formatDate = (dateStr: string | null) => {
// //     if (!dateStr) return "—";
// //     return new Date(dateStr).toLocaleString("en-IN", {
// //         day: "2-digit",
// //         month: "short",
// //         year: "numeric",
// //         hour: "2-digit",
// //         minute: "2-digit",
// //     });
// // };

// // // ─────────────────────────────────────────────────────────────────────────────
// // // ATOMS
// // // ─────────────────────────────────────────────────────────────────────────────

// // function Badge({ variant = "success", children }: { variant?: string; children: React.ReactNode }) {
// //     const styles: Record<string, { bg: string; fg: string }> = {
// //         success: { bg: color.greenBg, fg: color.green },
// //         failed: { bg: color.redBg, fg: color.red },
// //         pending: { bg: color.amberBg, fg: color.amber },
// //         sent: { bg: color.greenBg, fg: color.green },
// //         delivered: { bg: color.greenBg, fg: color.green },
// //     };
// //     const s = styles[variant] || styles.success;
// //     return (
// //         <span style={{
// //             display: "inline-flex", alignItems: "center", gap: 3,
// //             padding: "2px 7px", borderRadius: 20,
// //             fontSize: 10, fontWeight: 600,
// //             background: s.bg, color: s.fg,
// //             whiteSpace: "nowrap",
// //         }}>
// //             {children}
// //         </span>
// //     );
// // }

// // function MiniBar({ pct, color: bg = color.greenLine }: { pct: number; color?: string }) {
// //     return (
// //         <div style={{ height: 3, borderRadius: 2, background: color.border, overflow: "hidden", marginTop: 3, width: "100%" }}>
// //             <div style={{ height: "100%", borderRadius: 2, background: bg, width: `${pct}%`, transition: "width .4s ease" }} />
// //         </div>
// //     );
// // }

// // function Avatar({ name, id }: { name: string; id: number }) {
// //     const av = getAvatar(id);
// //     return (
// //         <span style={{
// //             width: 26, height: 26, borderRadius: "50%",
// //             background: av.bg, color: av.c,
// //             display: "inline-flex", alignItems: "center", justifyContent: "center",
// //             fontSize: 9, fontWeight: 700, flexShrink: 0, marginRight: 7,
// //         }}>
// //             {getInitials(name)}
// //         </span>
// //     );
// // }

// // function StatCard({ num, label, pct, barColor, textColor }: { num: number; label: string; pct?: number; barColor?: string; textColor?: string }) {
// //     return (
// //         <div style={{
// //             background: color.surface, border: `0.5px solid ${color.border}`,
// //             borderRadius: radius.md, padding: "10px 14px", flex: 1, minWidth: 0,
// //         }}>
// //             <div style={{ fontSize: 22, fontWeight: 600, color: textColor || color.text, lineHeight: 1 }}>{num.toLocaleString()}</div>
// //             <div style={{ fontSize: 10, color: color.textSub, marginTop: 3 }}>{label}</div>
// //             {pct !== undefined && <MiniBar pct={pct} color={barColor} />}
// //         </div>
// //     );
// // }

// // function FilterPill({ label, active, onClick, count, activeStyle }: { label: string; active: boolean; onClick: () => void; count?: number; activeStyle: any }) {
// //     return (
// //         <button
// //             onClick={onClick}
// //             style={{
// //                 padding: "4px 11px", borderRadius: 20, fontSize: 11, cursor: "pointer",
// //                 display: "flex", alignItems: "center", gap: 4,
// //                 fontFamily: "inherit", border: `0.5px solid ${color.border}`,
// //                 transition: "all .15s",
// //                 ...(active
// //                     ? activeStyle
// //                     : { background: color.bg, color: color.textSub }),
// //             }}
// //         >
// //             {label}
// //             {count !== undefined && (
// //                 <span style={{
// //                     background: active ? "rgba(255,255,255,0.35)" : color.border,
// //                     color: active ? "inherit" : color.textSub,
// //                     borderRadius: 10, fontSize: 10, padding: "0 5px", fontWeight: 600,
// //                 }}>
// //                     {count}
// //                 </span>
// //             )}
// //         </button>
// //     );
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // EXPANDED ROW
// // // ─────────────────────────────────────────────────────────────────────────────

// // function ExpandedRow({ row }: { row: CommunicationLog }) {
// //     const isOk = row.status === "sent" || row.status === "delivered";
// //     const isPend = row.status === "pending";

// //     const InfoBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
// //         <div>
// //             <div style={{ fontSize: 9, fontWeight: 700, color: color.textMute, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
// //                 {title}
// //             </div>
// //             <div style={{ fontSize: 11, color: color.text, lineHeight: 1.8 }}>{children}</div>
// //         </div>
// //     );

// //     const Row = ({ label, val, valColor }: { label: string; val: string | number; valColor?: string }) => (
// //         <div style={{ display: "flex", gap: 6 }}>
// //             <span style={{ color: color.textSub, minWidth: 64, flexShrink: 0 }}>{label}</span>
// //             <span style={{ color: valColor || color.text, fontWeight: 500 }}>{String(val)}</span>
// //         </div>
// //     );

// //     return (
// //         <tr>
// //             <td colSpan={10} style={{ padding: 0 }}>
// //                 <div style={{
// //                     display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14,
// //                     padding: "14px 16px", background: "#F8F9FC",
// //                     borderTop: `0.5px solid ${color.border}`,
// //                 }}>
// //                     <InfoBlock title="Delivery Timeline">
// //                         <Row label="Sent" val={formatDate(row.sent_at)} />
// //                         <Row label="Delivered" val={formatDate(row.delivered_at) || formatDate(row.sent_at)} valColor={isOk ? color.green : color.red} />
// //                         <Row label="Created" val={formatDate(row.created_at)} />
// //                     </InfoBlock>

// //                     <InfoBlock title="Contact Info">
// //                         <Row label="Name" val={row.recipient_name || "—"} />
// //                         <Row label="Email" val={row.recipient_email} />
// //                         <Row label="Phone" val={row.recipient_phone || "—"} />
// //                     </InfoBlock>

// //                     <InfoBlock title="Details">
// //                         <Row label="Retries" val={row.retries} />
// //                         <Row label="Template" val={row.template_name || "—"} />
// //                         <Row label="Property" val={row.property_name || "—"} />
// //                         <Row label="Tenant" val={row.tenant_name || "—"} />
// //                         {row.status === "failed" && row.error_message && (
// //                             <div style={{
// //                                 marginTop: 8,
// //                                 padding: 8,
// //                                 background: color.redBg,
// //                                 borderRadius: radius.sm,
// //                                 color: color.red,
// //                                 fontSize: 11
// //                             }}>
// //                                 <strong>Error:</strong> {row.error_message}
// //                             </div>
// //                         )}
// //                     </InfoBlock>
// //                 </div>
// //             </td>
// //         </tr>
// //     );
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // TABLE ROW
// // // ─────────────────────────────────────────────────────────────────────────────

// // function EmailRow({ row, isExpanded, onToggle, onResend, onDelete }: {
// //     row: CommunicationLog;
// //     isExpanded: boolean;
// //     onToggle: () => void;
// //     onResend: (id: number) => void;
// //     onDelete: (id: number) => void;
// // }) {
// //     const [hovered, setHovered] = useState(false);

// //     const statusBadge = {
// //         sent: <Badge variant="success">Sent</Badge>,
// //         delivered: <Badge variant="success">Delivered</Badge>,
// //         failed: <Badge variant="failed">Failed</Badge>,
// //         pending: <Badge variant="pending">Pending</Badge>,
// //     }[row.status] || <Badge variant="pending">{row.status}</Badge>;

// //     const remarkText = row.error_message || row.subject || "—";
// //     const remarkColor = row.status === "failed" ? color.red : row.status === "pending" ? color.amber : color.textSub;

// //     const tdStyle = {
// //         padding: "9px 11px", verticalAlign: "middle",
// //         background: hovered || isExpanded ? "#F5F7FB" : "transparent",
// //         transition: "background .1s",
// //     };

// //     return (
// //         <>
// //             <tr
// //                 onClick={onToggle}
// //                 onMouseEnter={() => setHovered(true)}
// //                 onMouseLeave={() => setHovered(false)}
// //                 style={{ cursor: "pointer", borderBottom: `0.5px solid ${color.borderSub}` }}
// //             >
// //                 <td style={{ ...tdStyle, width: 28, textAlign: "center", padding: "9px 6px" }}>
// //                     <span style={{
// //                         display: "inline-block", fontSize: 10, color: color.textMute,
// //                         transition: "transform .15s",
// //                         transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
// //                     }}>▶</span>
// //                 </td>

// //                 <td style={{ ...tdStyle, maxWidth: 150 }}>
// //                     <div style={{ display: "flex", alignItems: "center" }}>
// //                         <Avatar name={row.recipient_name || row.recipient_email} id={row.id} />
// //                         <div style={{ minWidth: 0 }}>
// //                             <div style={{ fontSize: 12, fontWeight: 600, color: color.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
// //                                 {row.recipient_name || "—"}
// //                             </div>
// //                             <div style={{ fontSize: 10, color: color.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
// //                                 {row.recipient_email}
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </td>

// //                 <td style={{ ...tdStyle, fontSize: 11, color: color.text, maxWidth: 160 }}>
// //                     <span title={row.subject || ""}>{trunc(row.subject, 30) || "—"}</span>
// //                 </td>

// //                 <td style={{ ...tdStyle, fontSize: 11, color: color.textSub, whiteSpace: "nowrap" }}>
// //                     {row.communication_type?.replace("_", " ") || "—"}
// //                 </td>

// //                 <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{statusBadge}</td>

// //                 <td style={{ ...tdStyle, textAlign: "center", fontSize: 12 }}>
// //                     {row.channel === "email" ? "Email" : row.channel === "whatsapp" ? "WhatsApp" : "SMS"}
// //                 </td>

// //                 <td style={{ ...tdStyle, fontSize: 11, color: color.textSub, whiteSpace: "nowrap" }}>
// //                     {formatDate(row.sent_at)}
// //                 </td>

// //                 <td style={{ ...tdStyle, textAlign: "center" }}>
// //                     {row.retries > 0 ? <Badge variant="failed">{row.retries}x</Badge> : <span style={{ fontSize: 10, color: color.textMute }}>0</span>}
// //                 </td>

// //                 <td style={{ ...tdStyle, fontSize: 10, color: remarkColor, maxWidth: 140 }}>
// //                     <span title={remarkText}>{trunc(remarkText, 32)}</span>
// //                 </td>

// //                 <td style={{ ...tdStyle, textAlign: "center", whiteSpace: "nowrap" }}>
// //                     <button
// //                         onClick={(e) => { e.stopPropagation(); onResend(row.id); }}
// //                         disabled={row.status !== "failed"}
// //                         style={{
// //                             background: "none", border: `0.5px solid ${row.status === "failed" ? color.red : color.border}`,
// //                             borderRadius: radius.sm, padding: "4px 8px",
// //                             fontSize: 10, cursor: row.status === "failed" ? "pointer" : "not-allowed",
// //                             color: row.status === "failed" ? color.red : color.textMute,
// //                             marginRight: 6, fontFamily: "inherit",
// //                         }}
// //                     >
// //                         Retry
// //                     </button>
// //                     <button
// //                         onClick={(e) => { e.stopPropagation(); onDelete(row.id); }}
// //                         style={{
// //                             background: "none", border: `0.5px solid ${color.border}`,
// //                             borderRadius: radius.sm, padding: "4px 8px",
// //                             fontSize: 10, cursor: "pointer", color: color.textMute,
// //                             fontFamily: "inherit",
// //                         }}
// //                     >
// //                         Delete
// //                     </button>
// //                 </td>
// //             </tr>
// //             {isExpanded && <ExpandedRow row={row} />}
// //         </>
// //     );
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // MAIN COMPONENT
// // // ─────────────────────────────────────────────────────────────────────────────

// // export default function EmailHistory() {
// //     const [logs, setLogs] = useState<CommunicationLog[]>([]);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState<string | null>(null);
// //     const [stats, setStats] = useState({
// //         total: 0, sent: 0, failed: 0, pending: 0
// //     });

// //     const [search, setSearch] = useState("");
// //     const [filter, setFilter] = useState("all");
// //     const [page, setPage] = useState(1);
// //     const [expandedId, setExpandedId] = useState<number | null>(null);
// //     const [exporting, setExporting] = useState(false);

// //     const PER_PAGE = 10;

// //     const loadLogs = useCallback(async () => {
// //         setLoading(true);
// //         setError(null);
// //         try {
// //             const filters: any = { page, limit: PER_PAGE };
// //             if (search) filters.search = search;
// //             if (filter !== "all") filters.status = filter;

// //             const response = await getCommunicationLogs(filters);
// //             if (response.success) {
// //                 setLogs(response.data);
// //             } else {
// //                 setError("Failed to load logs");
// //             }
// //         } catch (err: any) {
// //             setError(err.message || "An error occurred");
// //         } finally {
// //             setLoading(false);
// //         }
// //     }, [page, search, filter]);

// //     const loadStats = useCallback(async () => {
// //         try {
// //             const response = await getCommunicationStatistics();
// //             if (response.success) {
// //                 setStats({
// //                     total: response.data.total || 0,
// //                     sent: response.data.sent || 0,
// //                     failed: response.data.failed || 0,
// //                     pending: response.data.pending || 0,
// //                 });
// //             }
// //         } catch (err) {
// //             console.error("Error loading stats:", err);
// //         }
// //     }, []);

// //     useEffect(() => {
// //         loadLogs();
// //         loadStats();
// //     }, [loadLogs, loadStats]);

// //     const handleResend = async (id: number) => {
// //         if (!confirm("Are you sure you want to resend this?")) return;
// //         try {
// //             await resendCommunication(id);
// //             alert("Resent successfully!");
// //             loadLogs();
// //         } catch (err: any) {
// //             alert(err.message || "Failed to resend");
// //         }
// //     };

// //     const handleDelete = async (id: number) => {
// //         if (!confirm("Are you sure you want to delete this log?")) return;
// //         try {
// //             await deleteCommunicationLog(id);
// //             alert("Deleted successfully!");
// //             loadLogs();
// //             loadStats();
// //         } catch (err: any) {
// //             alert(err.message || "Failed to delete");
// //         }
// //     };

// //     const handleExport = async () => {
// //         setExporting(true);
// //         try {
// //             const filters: any = {};
// //             if (search) filters.search = search;
// //             if (filter !== "all") filters.status = filter;
// //             await exportCommunicationLogs(filters);
// //             alert("Export completed!");
// //         } catch (err: any) {
// //             alert(err.message || "Export failed");
// //         } finally {
// //             setExporting(false);
// //         }
// //     };

// //     const handleFilter = (f: string) => { setFilter(f); setPage(1); setExpandedId(null); };
// //     const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); setExpandedId(null); };
// //     const toggleExpand = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

// //     const totalPages = Math.ceil(stats.total / PER_PAGE) || 1;
// //     const safePage = Math.min(page, totalPages);

// //     const pills = [
// //         { key: "all", label: "All", activeStyle: { background: color.blueBg, color: color.blue, border: `0.5px solid ${color.blue}` }, count: stats.total },
// //         { key: "sent", label: "Sent", activeStyle: { background: color.greenBg, color: color.green, border: `0.5px solid ${color.green}` }, count: stats.sent },
// //         { key: "failed", label: "Failed", activeStyle: { background: color.redBg, color: color.red, border: `0.5px solid ${color.red}` }, count: stats.failed },
// //         { key: "pending", label: "Pending", activeStyle: { background: color.amberBg, color: color.amber, border: `0.5px solid ${color.amber}` }, count: stats.pending },
// //     ];

// //     const headers = [
// //         { key: null, label: "", width: 30 },
// //         { key: "recipient_name", label: "Recipient", width: 180 },
// //         { key: "subject", label: "Subject", width: 200 },
// //         { key: "communication_type", label: "Type", width: 120 },
// //         { key: "status", label: "Status", width: 90 },
// //         { key: "channel", label: "Channel", width: 80 },
// //         { key: "sent_at", label: "Sent At", width: 150 },
// //         { key: "retries", label: "Retries", width: 70 },
// //         { key: "error_message", label: "Remark", width: 180 },
// //         { key: null, label: "Actions", width: 100 },
// //     ];

// //     return (
// //         <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: color.bg, minHeight: "100vh", padding: "24px" }}>
// //             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
// //                 <div>
// //                     <h2 style={{ fontSize: 20, fontWeight: 600, color: color.text, margin: 0 }}>Communication History</h2>
// //                     <p style={{ fontSize: 12, color: color.textSub, marginTop: 3 }}>Communication logs with status & delivery details</p>
// //                 </div>
// //                 <button
// //                     onClick={handleExport}
// //                     disabled={exporting}
// //                     style={{
// //                         background: color.orange, color: "#fff", border: "none",
// //                         borderRadius: radius.md, padding: "8px 16px",
// //                         fontSize: 12, fontWeight: 600, cursor: exporting ? "not-allowed" : "pointer",
// //                         display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
// //                         opacity: exporting ? 0.6 : 1,
// //                     }}
// //                 >
// //                     {exporting ? "⏳" : "📥"} {exporting ? "Exporting..." : "Export CSV"}
// //                 </button>
// //             </div>

// //             <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
// //                 <StatCard num={stats.total} label="Total Communications" textColor={color.blue} />
// //                 <StatCard num={stats.sent} label="Sent / Delivered" textColor={color.green}
// //                     pct={stats.total ? Math.round(stats.sent / stats.total * 100) : 0} barColor={color.greenLine} />
// //                 <StatCard num={stats.failed} label="Failed" textColor={color.red}
// //                     pct={stats.total ? Math.round(stats.failed / stats.total * 100) : 0} barColor={color.redLine} />
// //                 <StatCard num={stats.pending} label="Pending" textColor={color.amber} />
// //             </div>

// //             <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
// //                 <div style={{
// //                     display: "flex", alignItems: "center", gap: 6,
// //                     background: color.surface, border: `0.5px solid ${color.border}`,
// //                     borderRadius: radius.md, padding: "6px 10px", flex: 1, minWidth: 200,
// //                 }}>
// //                     <span style={{ fontSize: 13, color: color.textMute }}>🔍</span>
// //                     <input
// //                         value={search}
// //                         onChange={handleSearch}
// //                         placeholder="Search name, email, subject…"
// //                         style={{
// //                             border: "none", background: "none", fontSize: 12,
// //                             color: color.text, outline: "none", fontFamily: "inherit", width: "100%",
// //                         }}
// //                     />
// //                     {search && (
// //                         <button
// //                             onClick={() => { setSearch(""); setPage(1); }}
// //                             style={{ border: "none", background: "none", color: color.textMute, cursor: "pointer", fontSize: 14, lineHeight: 1 }}
// //                         >×</button>
// //                     )}
// //                 </div>

// //                 {pills.map((p) => (
// //                     <FilterPill
// //                         key={p.key}
// //                         label={p.label}
// //                         count={p.count}
// //                         active={filter === p.key}
// //                         activeStyle={p.activeStyle}
// //                         onClick={() => handleFilter(p.key)}
// //                     />
// //                 ))}
// //             </div>

// //             <div style={{
// //                 background: color.surface, border: `0.5px solid ${color.border}`,
// //                 borderRadius: radius.lg, overflow: "hidden",
// //             }}>
// //                 <div style={{ overflowX: "auto" }}>
// //                     <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
// //                         <thead>
// //                             <tr style={{ background: "#F8F9FC", borderBottom: `0.5px solid ${color.border}` }}>
// //                                 {headers.map((h) => (
// //                                     <th
// //                                         key={h.label}
// //                                         style={{
// //                                             padding: "8px 11px", textAlign: "left",
// //                                             fontSize: 10, fontWeight: 600, color: color.textSub,
// //                                             whiteSpace: "nowrap",
// //                                         }}
// //                                     >
// //                                         {h.label}
// //                                     </th>
// //                                 ))}
// //                             </tr>
// //                         </thead>
// //                         <tbody>
// //                             {loading ? (
// //                                 <tr>
// //                                     <td colSpan={10} style={{ textAlign: "center", padding: 40 }}>Loading...</td>
// //                                 </tr>
// //                             ) : error ? (
// //                                 <tr>
// //                                     <td colSpan={10} style={{ textAlign: "center", padding: 40, color: color.red }}>❌ {error}</td>
// //                                 </tr>
// //                             ) : logs.length === 0 ? (
// //                                 <tr>
// //                                     <td colSpan={10} style={{ textAlign: "center", padding: 40, color: color.textMute }}>No records found</td>
// //                                 </tr>
// //                             ) : (
// //                                 logs.map((row) => (
// //                                     <EmailRow
// //                                         key={row.id}
// //                                         row={row}
// //                                         isExpanded={expandedId === row.id}
// //                                         onToggle={() => toggleExpand(row.id)}
// //                                         onResend={handleResend}
// //                                         onDelete={handleDelete}
// //                                     />
// //                                 ))
// //                             )}
// //                         </tbody>
// //                     </table>
// //                 </div>

// //                 {!loading && totalPages > 1 && (
// //                     <div style={{
// //                         display: "flex", alignItems: "center", justifyContent: "space-between",
// //                         padding: "10px 14px", borderTop: `0.5px solid ${color.border}`,
// //                         fontSize: 11, color: color.textSub,
// //                     }}>
// //                         <span>
// //                             {logs.length > 0
// //                                 ? `Showing ${(safePage - 1) * PER_PAGE + 1}–${Math.min(safePage * PER_PAGE, stats.total)} of ${stats.total} records`
// //                                 : "No records"}
// //                         </span>
// //                         <div style={{ display: "flex", gap: 4 }}>
// //                             <button
// //                                 onClick={() => setPage(p => Math.max(1, p - 1))}
// //                                 disabled={page === 1}
// //                                 style={{
// //                                     padding: "4px 10px", border: `0.5px solid ${color.border}`,
// //                                     borderRadius: radius.sm, background: color.surface,
// //                                     cursor: page === 1 ? "not-allowed" : "pointer",
// //                                     opacity: page === 1 ? 0.5 : 1,
// //                                 }}
// //                             >‹ Prev</button>
// //                             <span style={{ padding: "4px 10px" }}>Page {page} of {totalPages}</span>
// //                             <button
// //                                 onClick={() => setPage(p => Math.min(totalPages, p + 1))}
// //                                 disabled={page === totalPages}
// //                                 style={{
// //                                     padding: "4px 10px", border: `0.5px solid ${color.border}`,
// //                                     borderRadius: radius.sm, background: color.surface,
// //                                     cursor: page === totalPages ? "not-allowed" : "pointer",
// //                                     opacity: page === totalPages ? 0.5 : 1,
// //                                 }}
// //                             >Next ›</button>
// //                         </div>
// //                     </div>
// //                 )}
// //             </div>
// //         </div>
// //     );
// // }



// import { useState, useEffect, useCallback, useRef } from "react";
// import {
//     getCommunicationLogs,
//     getCommunicationStatistics,
//     exportCommunicationLogs,
//     resendCommunication,
//     deleteCommunicationLog,
//     type CommunicationLog,
// } from "@/lib/communicationLogApi";

// // ─── SweetAlert2 (CDN via script tag — ensure it's loaded in your HTML) ───────
// declare const Swal: any;

// // ─────────────────────────────────────────────────────────────────────────────
// // STYLE TOKENS
// // ─────────────────────────────────────────────────────────────────────────────

// const color = {
//     bg: "#F2F4F8",
//     surface: "#FFFFFF",
//     border: "#E4E8F0",
//     borderSub: "#EEF0F5",
//     text: "#1A2340",
//     textSub: "#6B7A99",
//     textMute: "#9BA5BF",
//     blue: "#185FA5",
//     blueBg: "#E6F1FB",
//     green: "#0F6E56",
//     greenBg: "#E1F5EE",
//     greenLine: "#1D9E75",
//     red: "#A32D2D",
//     redBg: "#FCEBEB",
//     redLine: "#E24B4A",
//     amber: "#854F0B",
//     amberBg: "#FAEEDA",
//     purple: "#3C3489",
//     purpleBg: "#EEEDFE",
//     orange: "#E8601A",
//     slate: "#64748B",
//     slateBg: "#F1F5F9",
// };

// const radius = { sm: 6, md: 8, lg: 12 };

// const AVATAR_COLORS = [
//     { bg: "#E6F1FB", c: "#185FA5" }, { bg: "#E1F5EE", c: "#0F6E56" },
//     { bg: "#EEEDFE", c: "#3C3489" }, { bg: "#FAEEDA", c: "#854F0B" },
//     { bg: "#FCEBEB", c: "#A32D2D" }, { bg: "#EAF3DE", c: "#3B6D11" },
//     { bg: "#FAECE7", c: "#993C1D" }, { bg: "#FBEAF0", c: "#993556" },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────────────────

// const getInitials = (name: string) =>
//     (name || "U").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

// const getAvatar = (id: number) => AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];

// const trunc = (str: string | null, n: number) => {
//     if (!str) return "";
//     return str.length > n ? str.slice(0, n) + "…" : str;
// };

// const formatDate = (dateStr: string | null) => {
//     if (!dateStr) return "—";
//     return new Date(dateStr).toLocaleString("en-IN", {
//         day: "2-digit", month: "short", year: "numeric",
//         hour: "2-digit", minute: "2-digit",
//     });
// };

// // Excel export using SheetJS-like CSV with BOM for proper Excel encoding
// const exportToExcel = (logs: CommunicationLog[], filename = "communication_logs") => {
//     const headers = [
//         "ID", "Recipient Name", "Recipient Email", "Recipient Phone",
//         "Subject", "Type", "Status", "Channel",
//         "Sent At", "Delivered At", "Created At",
//         "Retries", "Template", "Property", "Tenant", "Error Message"
//     ];

//     const rows = logs.map(row => [
//         row.id,
//         row.recipient_name || "",
//         row.recipient_email || "",
//         row.recipient_phone || "",
//         row.subject || "",
//         row.communication_type || "",
//         row.status || "",
//         row.channel || "",
//         row.sent_at || "",
//         row.delivered_at || "",
//         row.created_at || "",
//         row.retries,
//         row.template_name || "",
//         row.property_name || "",
//         row.tenant_name || "",
//         row.error_message || "",
//     ]);

//     const csvContent = [headers, ...rows]
//         .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
//         .join("\n");

//     const BOM = "\uFEFF";
//     const blob = new Blob([BOM + csvContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
// };

// // SweetAlert2 bulk delete confirmation
// const confirmBulkDelete = async (count: number): Promise<boolean> => {
//     if (typeof Swal === "undefined") {
//         return window.confirm(`Are you sure you want to delete ${count} selected record(s)? This action cannot be undone.`);
//     }
//     const result = await Swal.fire({
//         title: `<span style="font-size:18px;font-weight:700;color:#1A2340">Delete ${count} Record${count > 1 ? "s" : ""}?</span>`,
//         html: `
//             <div style="text-align:center;padding:4px 0">
//                 <div style="width:52px;height:52px;border-radius:50%;background:#FCEBEB;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
//                     <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#A32D2D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
//                 </div>
//                 <p style="color:#6B7A99;font-size:13px;line-height:1.6;margin:0">
//                     You're about to permanently delete <strong style="color:#1A2340">${count} communication log${count > 1 ? "s" : ""}</strong>.<br/>
//                     This action <strong style="color:#A32D2D">cannot be undone</strong>.
//                 </p>
//             </div>`,
//         showCancelButton: true,
//         confirmButtonText: `Delete ${count} Record${count > 1 ? "s" : ""}`,
//         cancelButtonText: "Cancel",
//         customClass: {
//             popup: "swal-custom-popup",
//             confirmButton: "swal-confirm-btn",
//             cancelButton: "swal-cancel-btn",
//         },
//         buttonsStyling: false,
//         width: 360,
//     });
//     return result.isConfirmed;
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // ATOMS
// // ─────────────────────────────────────────────────────────────────────────────

// function Badge({ variant = "success", children }: { variant?: string; children: React.ReactNode }) {
//     const styles: Record<string, { bg: string; fg: string }> = {
//         success: { bg: color.greenBg, fg: color.green },
//         failed: { bg: color.redBg, fg: color.red },
//         pending: { bg: color.amberBg, fg: color.amber },
//         sent: { bg: color.greenBg, fg: color.green },
//         delivered: { bg: color.greenBg, fg: color.green },
//     };
//     const s = styles[variant] || styles.success;
//     return (
//         <span style={{
//             display: "inline-flex", alignItems: "center", gap: 3,
//             padding: "2px 7px", borderRadius: 20,
//             fontSize: 10, fontWeight: 600,
//             background: s.bg, color: s.fg, whiteSpace: "nowrap",
//         }}>
//             {children}
//         </span>
//     );
// }

// function MiniBar({ pct, color: bg = color.greenLine }: { pct: number; color?: string }) {
//     return (
//         <div style={{ height: 3, borderRadius: 2, background: color.border, overflow: "hidden", marginTop: 3, width: "100%" }}>
//             <div style={{ height: "100%", borderRadius: 2, background: bg, width: `${pct}%`, transition: "width .4s ease" }} />
//         </div>
//     );
// }

// function Avatar({ name, id }: { name: string; id: number }) {
//     const av = getAvatar(id);
//     return (
//         <span style={{
//             width: 28, height: 28, borderRadius: "50%",
//             background: av.bg, color: av.c,
//             display: "inline-flex", alignItems: "center", justifyContent: "center",
//             fontSize: 9, fontWeight: 700, flexShrink: 0, marginRight: 7,
//         }}>
//             {getInitials(name)}
//         </span>
//     );
// }

// // ─── STAT CARD (matching the complaints style from user snippet) ───────────
// function StatCard({ num, label, pct, barColor, textColor, iconBg, icon }: {
//     num: number; label: string; pct?: number;
//     barColor?: string; textColor?: string; iconBg?: string; icon?: React.ReactNode;
// }) {
//     return (
//         <div style={{
//             background: color.surface,
//             border: `0.5px solid ${color.border}`,
//             borderRadius: radius.md,
//             padding: "10px 12px",
//             flex: 1, minWidth: 0,
//             display: "flex", flexDirection: "column",
//             gap: 4,
//         }}>
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                 <div style={{ minWidth: 0 }}>
//                     <div style={{ fontSize: 10, color: color.textSub, fontWeight: 500, marginBottom: 2, whiteSpace: "nowrap" }}>{label}</div>
//                     <div style={{ fontSize: 20, fontWeight: 700, color: textColor || color.text, lineHeight: 1 }}>
//                         {num.toLocaleString()}
//                     </div>
//                 </div>
//                 {icon && (
//                     <div style={{
//                         width: 32, height: 32, borderRadius: 8,
//                         background: iconBg || color.slateBg,
//                         display: "flex", alignItems: "center", justifyContent: "center",
//                         flexShrink: 0,
//                     }}>
//                         {icon}
//                     </div>
//                 )}
//             </div>
//             {pct !== undefined && <MiniBar pct={pct} color={barColor} />}
//         </div>
//     );
// }

// function FilterPill({ label, active, onClick, count, activeStyle }: {
//     label: string; active: boolean; onClick: () => void; count?: number; activeStyle: any;
// }) {
//     return (
//         <button
//             onClick={onClick}
//             style={{
//                 padding: "4px 11px", borderRadius: 20, fontSize: 11, cursor: "pointer",
//                 display: "flex", alignItems: "center", gap: 4,
//                 fontFamily: "inherit", border: `0.5px solid ${color.border}`,
//                 transition: "all .15s",
//                 ...(active ? activeStyle : { background: color.bg, color: color.textSub }),
//             }}
//         >
//             {label}
//             {count !== undefined && (
//                 <span style={{
//                     background: active ? "rgba(255,255,255,0.35)" : color.border,
//                     color: active ? "inherit" : color.textSub,
//                     borderRadius: 10, fontSize: 10, padding: "0 5px", fontWeight: 600,
//                 }}>
//                     {count}
//                 </span>
//             )}
//         </button>
//     );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // FILTER SIDEBAR
// // ─────────────────────────────────────────────────────────────────────────────

// interface FilterState {
//     status: string;
//     channel: string;
//     communicationType: string;
//     dateFrom: string;
//     dateTo: string;
//     hasRetries: boolean;
// }

// function FilterSidebar({
//     open,
//     onClose,
//     filters,
//     onApply,
//     onReset,
// }: {
//     open: boolean;
//     onClose: () => void;
//     filters: FilterState;
//     onApply: (f: FilterState) => void;
//     onReset: () => void;
// }) {
//     const [local, setLocal] = useState<FilterState>(filters);
//     useEffect(() => { setLocal(filters); }, [filters, open]);

//     const set = (k: keyof FilterState, v: any) => setLocal(prev => ({ ...prev, [k]: v }));

//     const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
//         <div style={{ marginBottom: 14 }}>
//             <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: color.textMute, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5 }}>
//                 {label}
//             </label>
//             {children}
//         </div>
//     );

//     const selectStyle: React.CSSProperties = {
//         width: "100%", padding: "7px 10px",
//         border: `0.5px solid ${color.border}`, borderRadius: radius.sm,
//         background: color.surface, fontSize: 12, color: color.text,
//         fontFamily: "inherit", outline: "none", cursor: "pointer",
//     };

//     const inputStyle: React.CSSProperties = {
//         width: "100%", padding: "7px 10px",
//         border: `0.5px solid ${color.border}`, borderRadius: radius.sm,
//         background: color.surface, fontSize: 12, color: color.text,
//         fontFamily: "inherit", outline: "none", boxSizing: "border-box",
//     };

//     return (
//         <>
//             {/* Backdrop */}
//             <div
//                 onClick={onClose}
//                 style={{
//                     position: "fixed", inset: 0, background: "rgba(26,35,64,.35)",
//                     zIndex: 199, opacity: open ? 1 : 0,
//                     pointerEvents: open ? "all" : "none",
//                     transition: "opacity .25s",
//                     backdropFilter: "blur(2px)",
//                 }}
//             />
//             {/* Drawer — slides from RIGHT to LEFT */}
//             <div style={{
//                 position: "fixed", top: 0, right: 0, bottom: 0,
//                 width: "min(340px, 90vw)",
//                 background: color.surface,
//                 boxShadow: "-4px 0 24px rgba(26,35,64,.12)",
//                 zIndex: 200,
//                 transform: open ? "translateX(0)" : "translateX(100%)",
//                 transition: "transform .3s cubic-bezier(.4,0,.2,1)",
//                 display: "flex", flexDirection: "column",
//             }}>
//                 {/* Header */}
//                 <div style={{
//                     display: "flex", alignItems: "center", justifyContent: "space-between",
//                     padding: "16px 18px", borderBottom: `0.5px solid ${color.border}`,
//                 }}>
//                     <div>
//                         <div style={{ fontSize: 14, fontWeight: 700, color: color.text }}>🔽 Filter Logs</div>
//                         <div style={{ fontSize: 10, color: color.textSub, marginTop: 2 }}>Narrow down results</div>
//                     </div>
//                     <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: color.textMute, lineHeight: 1 }}>×</button>
//                 </div>

//                 {/* Body */}
//                 <div style={{ flex: 1, overflowY: "auto", padding: "18px" }}>
//                     <Field label="Status">
//                         <select value={local.status} onChange={e => set("status", e.target.value)} style={selectStyle}>
//                             <option value="">All Statuses</option>
//                             <option value="sent">Sent</option>
//                             <option value="delivered">Delivered</option>
//                             <option value="failed">Failed</option>
//                             <option value="pending">Pending</option>
//                         </select>
//                     </Field>

//                     <Field label="Channel">
//                         <select value={local.channel} onChange={e => set("channel", e.target.value)} style={selectStyle}>
//                             <option value="">All Channels</option>
//                             <option value="email">Email</option>
//                             <option value="whatsapp">WhatsApp</option>
//                             <option value="sms">SMS</option>
//                         </select>
//                     </Field>

//                     <Field label="Communication Type">
//                         <select value={local.communicationType} onChange={e => set("communicationType", e.target.value)} style={selectStyle}>
//                             <option value="">All Types</option>
//                             <option value="rent_reminder">Rent Reminder</option>
//                             <option value="maintenance_update">Maintenance Update</option>
//                             <option value="notice">Notice</option>
//                             <option value="welcome">Welcome</option>
//                             <option value="other">Other</option>
//                         </select>
//                     </Field>

//                     <Field label="Date From">
//                         <input type="date" value={local.dateFrom} onChange={e => set("dateFrom", e.target.value)} style={inputStyle} />
//                     </Field>

//                     <Field label="Date To">
//                         <input type="date" value={local.dateTo} onChange={e => set("dateTo", e.target.value)} style={inputStyle} />
//                     </Field>

//                     <Field label="Retries">
//                         <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
//                             <input
//                                 type="checkbox"
//                                 checked={local.hasRetries}
//                                 onChange={e => set("hasRetries", e.target.checked)}
//                                 style={{ width: 14, height: 14, cursor: "pointer" }}
//                             />
//                             <span style={{ fontSize: 12, color: color.text }}>Show only records with retries</span>
//                         </label>
//                     </Field>
//                 </div>

//                 {/* Footer */}
//                 <div style={{
//                     padding: "14px 18px", borderTop: `0.5px solid ${color.border}`,
//                     display: "flex", gap: 8,
//                 }}>
//                     <button
//                         onClick={onReset}
//                         style={{
//                             flex: 1, padding: "8px", border: `0.5px solid ${color.border}`,
//                             borderRadius: radius.sm, background: color.bg, color: color.textSub,
//                             fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
//                         }}
//                     >
//                         Reset
//                     </button>
//                     <button
//                         onClick={() => { onApply(local); onClose(); }}
//                         style={{
//                             flex: 2, padding: "8px", border: "none",
//                             borderRadius: radius.sm, background: color.blue, color: "#fff",
//                             fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
//                         }}
//                     >
//                         Apply Filters
//                     </button>
//                 </div>
//             </div>
//         </>
//     );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // EXPANDED ROW
// // ─────────────────────────────────────────────────────────────────────────────

// function ExpandedRow({ row }: { row: CommunicationLog }) {
//     const isOk = row.status === "sent" || row.status === "delivered";

//     const InfoBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
//         <div>
//             <div style={{ fontSize: 9, fontWeight: 700, color: color.textMute, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
//                 {title}
//             </div>
//             <div style={{ fontSize: 11, color: color.text, lineHeight: 1.8 }}>{children}</div>
//         </div>
//     );

//     const Row = ({ label, val, valColor }: { label: string; val: string | number; valColor?: string }) => (
//         <div style={{ display: "flex", gap: 6 }}>
//             <span style={{ color: color.textSub, minWidth: 64, flexShrink: 0 }}>{label}</span>
//             <span style={{ color: valColor || color.text, fontWeight: 500 }}>{String(val)}</span>
//         </div>
//     );

//     return (
//         <tr>
//             <td colSpan={11} style={{ padding: 0 }}>
//                 <div style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
//                     gap: 14,
//                     padding: "14px 16px",
//                     background: "#F8F9FC",
//                     borderTop: `0.5px solid ${color.border}`,
//                 }}>
//                     <InfoBlock title="Delivery Timeline">
//                         <Row label="Sent" val={formatDate(row.sent_at)} />
//                         <Row label="Delivered" val={formatDate(row.delivered_at) || formatDate(row.sent_at)} valColor={isOk ? color.green : color.red} />
//                         <Row label="Created" val={formatDate(row.created_at)} />
//                     </InfoBlock>
//                     <InfoBlock title="Contact Info">
//                         <Row label="Name" val={row.recipient_name || "—"} />
//                         <Row label="Email" val={row.recipient_email} />
//                         <Row label="Phone" val={row.recipient_phone || "—"} />
//                     </InfoBlock>
//                     <InfoBlock title="Details">
//                         <Row label="Retries" val={row.retries} />
//                         <Row label="Template" val={row.template_name || "—"} />
//                         <Row label="Property" val={row.property_name || "—"} />
//                         <Row label="Tenant" val={row.tenant_name || "—"} />
//                         {row.status === "failed" && row.error_message && (
//                             <div style={{
//                                 marginTop: 8, padding: 8,
//                                 background: color.redBg, borderRadius: radius.sm,
//                                 color: color.red, fontSize: 11,
//                             }}>
//                                 <strong>Error:</strong> {row.error_message}
//                             </div>
//                         )}
//                     </InfoBlock>
//                 </div>
//             </td>
//         </tr>
//     );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MOBILE CARD (responsive alternative to table row)
// // ─────────────────────────────────────────────────────────────────────────────

// function MobileCard({ row, isExpanded, onToggle, onResend, onDelete, isSelected, onSelect }: {
//     row: CommunicationLog;
//     isExpanded: boolean;
//     onToggle: () => void;
//     onResend: (id: number) => void;
//     onDelete: (id: number) => void;
//     isSelected: boolean;
//     onSelect: (id: number, checked: boolean) => void;
// }) {
//     const statusBadge = {
//         sent: <Badge variant="success">Sent</Badge>,
//         delivered: <Badge variant="success">Delivered</Badge>,
//         failed: <Badge variant="failed">Failed</Badge>,
//         pending: <Badge variant="pending">Pending</Badge>,
//     }[row.status] || <Badge variant="pending">{row.status}</Badge>;

//     return (
//         <div style={{
//             background: isSelected ? color.blueBg : color.surface,
//             border: `0.5px solid ${isSelected ? color.blue : color.border}`,
//             borderRadius: radius.md,
//             marginBottom: 8,
//             overflow: "hidden",
//             transition: "all .15s",
//         }}>
//             <div
//                 style={{ padding: "10px 12px", cursor: "pointer" }}
//                 onClick={onToggle}
//             >
//                 <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
//                     <input
//                         type="checkbox"
//                         checked={isSelected}
//                         onClick={e => e.stopPropagation()}
//                         onChange={e => onSelect(row.id, e.target.checked)}
//                         style={{ width: 14, height: 14, cursor: "pointer", flexShrink: 0 }}
//                     />
//                     <Avatar name={row.recipient_name || row.recipient_email} id={row.id} />
//                     <div style={{ flex: 1, minWidth: 0 }}>
//                         <div style={{ fontSize: 12, fontWeight: 600, color: color.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                             {row.recipient_name || "—"}
//                         </div>
//                         <div style={{ fontSize: 10, color: color.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                             {row.recipient_email}
//                         </div>
//                     </div>
//                     {statusBadge}
//                     <span style={{ fontSize: 10, color: color.textMute, transform: isExpanded ? "rotate(90deg)" : "none", display: "inline-block", transition: "transform .15s" }}>▶</span>
//                 </div>

//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                     <div style={{ fontSize: 11, color: color.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
//                         {trunc(row.subject, 40) || "—"}
//                     </div>
//                     <div style={{ fontSize: 10, color: color.textMute, marginLeft: 8, whiteSpace: "nowrap" }}>
//                         {formatDate(row.sent_at)}
//                     </div>
//                 </div>

//                 <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
//                     <span style={{ fontSize: 10, color: color.textSub, background: color.slateBg, padding: "2px 7px", borderRadius: 10 }}>
//                         {row.channel === "email" ? "✉️ Email" : row.channel === "whatsapp" ? "💬 WhatsApp" : "📱 SMS"}
//                     </span>
//                     <span style={{ fontSize: 10, color: color.textSub }}>{row.communication_type?.replace("_", " ") || "—"}</span>
//                     {row.retries > 0 && <Badge variant="failed">{row.retries}x retry</Badge>}
//                     <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
//                         <button
//                             onClick={e => { e.stopPropagation(); onResend(row.id); }}
//                             disabled={row.status !== "failed"}
//                             style={{
//                                 background: "none", border: `0.5px solid ${row.status === "failed" ? color.red : color.border}`,
//                                 borderRadius: radius.sm, padding: "3px 8px",
//                                 fontSize: 10, cursor: row.status === "failed" ? "pointer" : "not-allowed",
//                                 color: row.status === "failed" ? color.red : color.textMute,
//                                 fontFamily: "inherit",
//                             }}
//                         >Retry</button>
//                         <button
//                             onClick={e => { e.stopPropagation(); onDelete(row.id); }}
//                             style={{
//                                 background: "none", border: `0.5px solid ${color.border}`,
//                                 borderRadius: radius.sm, padding: "3px 8px",
//                                 fontSize: 10, cursor: "pointer", color: color.textMute,
//                                 fontFamily: "inherit",
//                             }}
//                         >Delete</button>
//                     </div>
//                 </div>
//             </div>

//             {isExpanded && (
//                 <div style={{
//                     padding: "12px", background: "#F8F9FC",
//                     borderTop: `0.5px solid ${color.border}`,
//                     fontSize: 11, color: color.text,
//                     display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12,
//                 }}>
//                     <div>
//                         <div style={{ fontSize: 9, fontWeight: 700, color: color.textMute, textTransform: "uppercase", marginBottom: 4 }}>Timeline</div>
//                         <div>Sent: {formatDate(row.sent_at)}</div>
//                         <div>Created: {formatDate(row.created_at)}</div>
//                     </div>
//                     <div>
//                         <div style={{ fontSize: 9, fontWeight: 700, color: color.textMute, textTransform: "uppercase", marginBottom: 4 }}>Contact</div>
//                         <div>{row.recipient_phone || "No phone"}</div>
//                         <div>{row.property_name || "No property"}</div>
//                     </div>
//                     {row.status === "failed" && row.error_message && (
//                         <div style={{ padding: 8, background: color.redBg, borderRadius: radius.sm, color: color.red, gridColumn: "1 / -1" }}>
//                             <strong>Error:</strong> {row.error_message}
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // TABLE ROW (desktop)
// // ─────────────────────────────────────────────────────────────────────────────

// function EmailRow({ row, isExpanded, onToggle, onResend, onDelete, isSelected, onSelect }: {
//     row: CommunicationLog;
//     isExpanded: boolean;
//     onToggle: () => void;
//     onResend: (id: number) => void;
//     onDelete: (id: number) => void;
//     isSelected: boolean;
//     onSelect: (id: number, checked: boolean) => void;
// }) {
//     const [hovered, setHovered] = useState(false);

//     const statusBadge = {
//         sent: <Badge variant="success">Sent</Badge>,
//         delivered: <Badge variant="success">Delivered</Badge>,
//         failed: <Badge variant="failed">Failed</Badge>,
//         pending: <Badge variant="pending">Pending</Badge>,
//     }[row.status] || <Badge variant="pending">{row.status}</Badge>;

//     const remarkText = row.error_message || row.subject || "—";
//     const remarkColor = row.status === "failed" ? color.red : row.status === "pending" ? color.amber : color.textSub;

//     const tdStyle: React.CSSProperties = {
//         padding: "9px 11px", verticalAlign: "middle",
//         background: isSelected ? color.blueBg : hovered || isExpanded ? "#F5F7FB" : "transparent",
//         transition: "background .1s",
//     };

//     return (
//         <>
//             <tr
//                 onClick={onToggle}
//                 onMouseEnter={() => setHovered(true)}
//                 onMouseLeave={() => setHovered(false)}
//                 style={{ cursor: "pointer", borderBottom: `0.5px solid ${color.borderSub}` }}
//             >
//                 <td style={{ ...tdStyle, width: 28, textAlign: "center", padding: "9px 8px" }} onClick={e => e.stopPropagation()}>
//                     <input
//                         type="checkbox"
//                         checked={isSelected}
//                         onChange={e => onSelect(row.id, e.target.checked)}
//                         style={{ width: 14, height: 14, cursor: "pointer" }}
//                     />
//                 </td>
//                 <td style={{ ...tdStyle, width: 28, textAlign: "center", padding: "9px 4px" }}>
//                     <span style={{
//                         display: "inline-block", fontSize: 10, color: color.textMute,
//                         transition: "transform .15s", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
//                     }}>▶</span>
//                 </td>

//                 <td style={{ ...tdStyle, maxWidth: 150 }}>
//                     <div style={{ display: "flex", alignItems: "center" }}>
//                         <Avatar name={row.recipient_name || row.recipient_email} id={row.id} />
//                         <div style={{ minWidth: 0 }}>
//                             <div style={{ fontSize: 12, fontWeight: 600, color: color.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                                 {row.recipient_name || "—"}
//                             </div>
//                             <div style={{ fontSize: 10, color: color.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                                 {row.recipient_email}
//                             </div>
//                         </div>
//                     </div>
//                 </td>

//                 <td style={{ ...tdStyle, fontSize: 11, color: color.text, maxWidth: 160 }}>
//                     <span title={row.subject || ""}>{trunc(row.subject, 30) || "—"}</span>
//                 </td>
//                 <td style={{ ...tdStyle, fontSize: 11, color: color.textSub, whiteSpace: "nowrap" }}>
//                     {row.communication_type?.replace("_", " ") || "—"}
//                 </td>
//                 <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{statusBadge}</td>
//                 <td style={{ ...tdStyle, textAlign: "center", fontSize: 12 }}>
//                     {row.channel === "email" ? "✉️" : row.channel === "whatsapp" ? "💬" : "📱"}{" "}
//                     <span style={{ fontSize: 10, color: color.textSub }}>{row.channel}</span>
//                 </td>
//                 <td style={{ ...tdStyle, fontSize: 11, color: color.textSub, whiteSpace: "nowrap" }}>
//                     {formatDate(row.sent_at)}
//                 </td>
//                 <td style={{ ...tdStyle, textAlign: "center" }}>
//                     {row.retries > 0 ? <Badge variant="failed">{row.retries}x</Badge> : <span style={{ fontSize: 10, color: color.textMute }}>0</span>}
//                 </td>
//                 <td style={{ ...tdStyle, fontSize: 10, color: remarkColor, maxWidth: 140 }}>
//                     <span title={remarkText}>{trunc(remarkText, 32)}</span>
//                 </td>
//                 <td style={{ ...tdStyle, textAlign: "center", whiteSpace: "nowrap" }}>
//                     <button
//                         onClick={e => { e.stopPropagation(); onResend(row.id); }}
//                         disabled={row.status !== "failed"}
//                         style={{
//                             background: "none", border: `0.5px solid ${row.status === "failed" ? color.red : color.border}`,
//                             borderRadius: radius.sm, padding: "4px 8px",
//                             fontSize: 10, cursor: row.status === "failed" ? "pointer" : "not-allowed",
//                             color: row.status === "failed" ? color.red : color.textMute,
//                             marginRight: 6, fontFamily: "inherit",
//                         }}
//                     >Retry</button>
//                     <button
//                         onClick={e => { e.stopPropagation(); onDelete(row.id); }}
//                         style={{
//                             background: "none", border: `0.5px solid ${color.border}`,
//                             borderRadius: radius.sm, padding: "4px 8px",
//                             fontSize: 10, cursor: "pointer", color: color.textMute,
//                             fontFamily: "inherit",
//                         }}
//                     >Delete</button>
//                 </td>
//             </tr>
//             {isExpanded && <ExpandedRow row={row} />}
//         </>
//     );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // COLUMN SEARCH BAR
// // ─────────────────────────────────────────────────────────────────────────────

// function ColumnSearch({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
//     return (
//         <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
//             <input
//                 value={value}
//                 onChange={e => onChange(e.target.value)}
//                 placeholder={placeholder}
//                 style={{
//                     width: "100%", padding: "4px 22px 4px 6px",
//                     border: `0.5px solid ${color.border}`, borderRadius: radius.sm,
//                     fontSize: 10, color: color.text, background: "#FAFBFE",
//                     fontFamily: "inherit", outline: "none",
//                     boxSizing: "border-box",
//                 }}
//             />
//             {value && (
//                 <button
//                     onClick={() => onChange("")}
//                     style={{
//                         position: "absolute", right: 4, border: "none",
//                         background: "none", color: color.textMute, cursor: "pointer",
//                         fontSize: 12, lineHeight: 1, padding: 0,
//                     }}
//                 >×</button>
//             )}
//         </div>
//     );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────

// const DEFAULT_FILTERS: FilterState = {
//     status: "", channel: "", communicationType: "", dateFrom: "", dateTo: "", hasRetries: false,
// };

// export default function EmailHistory() {
//     const [logs, setLogs] = useState<CommunicationLog[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, pending: 0 });

//     // Global search
//     const [search, setSearch] = useState("");
//     // Quick status filter (pill)
//     const [filter, setFilter] = useState("all");
//     const [page, setPage] = useState(1);
//     const [expandedId, setExpandedId] = useState<number | null>(null);
//     const [exporting, setExporting] = useState(false);

//     // Sidebar filter
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [sidebarFilters, setSidebarFilters] = useState<FilterState>(DEFAULT_FILTERS);

//     // Column-level search
//     const [colSearch, setColSearch] = useState({
//         recipient: "", subject: "", type: "", channel: "", sentAt: "", remark: "",
//     });

//     // Bulk select
//     const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
//     const [bulkDeleting, setBulkDeleting] = useState(false);

//     // Responsive
//     const [isMobile, setIsMobile] = useState(false);
//     useEffect(() => {
//         const check = () => setIsMobile(window.innerWidth < 768);
//         check();
//         window.addEventListener("resize", check);
//         return () => window.removeEventListener("resize", check);
//     }, []);

//     const PER_PAGE = 10;

//     const loadLogs = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const filters: any = { page, limit: PER_PAGE };
//             if (search) filters.search = search;
//             if (filter !== "all") filters.status = filter;
//             if (sidebarFilters.status) filters.status = sidebarFilters.status;
//             if (sidebarFilters.channel) filters.channel = sidebarFilters.channel;
//             if (sidebarFilters.communicationType) filters.communication_type = sidebarFilters.communicationType;
//             if (sidebarFilters.dateFrom) filters.date_from = sidebarFilters.dateFrom;
//             if (sidebarFilters.dateTo) filters.date_to = sidebarFilters.dateTo;
//             if (sidebarFilters.hasRetries) filters.has_retries = true;

//             const response = await getCommunicationLogs(filters);
//             if (response.success) {
//                 setLogs(response.data);
//             } else {
//                 setError("Failed to load logs");
//             }
//         } catch (err: any) {
//             setError(err.message || "An error occurred");
//         } finally {
//             setLoading(false);
//         }
//     }, [page, search, filter, sidebarFilters]);

//     const loadStats = useCallback(async () => {
//         try {
//             const response = await getCommunicationStatistics();
//             if (response.success) {
//                 setStats({
//                     total: response.data.total || 0,
//                     sent: response.data.sent || 0,
//                     failed: response.data.failed || 0,
//                     pending: response.data.pending || 0,
//                 });
//             }
//         } catch (err) {
//             console.error("Error loading stats:", err);
//         }
//     }, []);

//     useEffect(() => { loadLogs(); loadStats(); }, [loadLogs, loadStats]);

//     // Column-level client-side filtering
//     const filteredLogs = logs.filter(row => {
//         const cs = colSearch;
//         if (cs.recipient && !`${row.recipient_name || ""} ${row.recipient_email}`.toLowerCase().includes(cs.recipient.toLowerCase())) return false;
//         if (cs.subject && !(row.subject || "").toLowerCase().includes(cs.subject.toLowerCase())) return false;
//         if (cs.type && !(row.communication_type || "").toLowerCase().includes(cs.type.toLowerCase())) return false;
//         if (cs.channel && !(row.channel || "").toLowerCase().includes(cs.channel.toLowerCase())) return false;
//         if (cs.sentAt && !formatDate(row.sent_at).toLowerCase().includes(cs.sentAt.toLowerCase())) return false;
//         if (cs.remark && !`${row.error_message || ""} ${row.subject || ""}`.toLowerCase().includes(cs.remark.toLowerCase())) return false;
//         return true;
//     });

//     const handleResend = async (id: number) => {
//         if (!window.confirm("Are you sure you want to resend this?")) return;
//         try {
//             await resendCommunication(id);
//             alert("Resent successfully!");
//             loadLogs();
//         } catch (err: any) {
//             alert(err.message || "Failed to resend");
//         }
//     };

//     const handleDelete = async (id: number) => {
//         if (!window.confirm("Are you sure you want to delete this log?")) return;
//         try {
//             await deleteCommunicationLog(id);
//             loadLogs();
//             loadStats();
//         } catch (err: any) {
//             alert(err.message || "Failed to delete");
//         }
//     };

//     const handleBulkDelete = async () => {
//         const count = selectedIds.size;
//         if (count === 0) return;
//         const confirmed = await confirmBulkDelete(count);
//         if (!confirmed) return;

//         setBulkDeleting(true);
//         try {
//             await Promise.all(Array.from(selectedIds).map(id => deleteCommunicationLog(id)));
//             setSelectedIds(new Set());
//             loadLogs();
//             loadStats();
//             if (typeof Swal !== "undefined") {
//                 Swal.fire({
//                     title: "Deleted!",
//                     text: `${count} record${count > 1 ? "s" : ""} deleted successfully.`,
//                     icon: "success",
//                     timer: 2000,
//                     showConfirmButton: false,
//                     customClass: { popup: "swal-custom-popup" },
//                 });
//             }
//         } catch (err: any) {
//             alert(err.message || "Bulk delete failed");
//         } finally {
//             setBulkDeleting(false);
//         }
//     };

//     const handleExport = async () => {
//         setExporting(true);
//         try {
//             // Try API export first; if it fails or isn't available, fall back to client-side
//             try {
//                 const filters: any = {};
//                 if (search) filters.search = search;
//                 if (filter !== "all") filters.status = filter;
//                 await exportCommunicationLogs(filters);
//             } catch {
//                 // Fallback: export currently visible logs as Excel
//                 exportToExcel(logs, "communication_logs");
//             }
//         } catch (err: any) {
//             alert(err.message || "Export failed");
//         } finally {
//             setExporting(false);
//         }
//     };

//     const handleFilter = (f: string) => { setFilter(f); setPage(1); setExpandedId(null); };
//     const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); setExpandedId(null); };
//     const toggleExpand = (id: number) => setExpandedId(prev => prev === id ? null : id);

//     const handleSelect = (id: number, checked: boolean) => {
//         setSelectedIds(prev => {
//             const next = new Set(prev);
//             if (checked) next.add(id); else next.delete(id);
//             return next;
//         });
//     };

//     const handleSelectAll = (checked: boolean) => {
//         if (checked) setSelectedIds(new Set(filteredLogs.map(r => r.id)));
//         else setSelectedIds(new Set());
//     };

//     const allSelected = filteredLogs.length > 0 && filteredLogs.every(r => selectedIds.has(r.id));
//     const someSelected = selectedIds.size > 0;
//     const hasActiveSidebarFilters = Object.values(sidebarFilters).some(v => v !== "" && v !== false);

//     const totalPages = Math.ceil(stats.total / PER_PAGE) || 1;
//     const safePage = Math.min(page, totalPages);

//     const pills = [
//         { key: "all", label: "All", activeStyle: { background: color.blueBg, color: color.blue, border: `0.5px solid ${color.blue}` }, count: stats.total },
//         { key: "sent", label: "Sent", activeStyle: { background: color.greenBg, color: color.green, border: `0.5px solid ${color.green}` }, count: stats.sent },
//         { key: "failed", label: "Failed", activeStyle: { background: color.redBg, color: color.red, border: `0.5px solid ${color.red}` }, count: stats.failed },
//         { key: "pending", label: "Pending", activeStyle: { background: color.amberBg, color: color.amber, border: `0.5px solid ${color.amber}` }, count: stats.pending },
//     ];

//     const headers = [
//         { label: "", width: 36 },   // checkbox
//         { label: "", width: 28 },   // expand arrow
//         { label: "Recipient", colKey: "recipient" },
//         { label: "Subject", colKey: "subject" },
//         { label: "Type", colKey: "type" },
//         { label: "Status", width: 90 },
//         { label: "Channel", colKey: "channel" },
//         { label: "Sent At", colKey: "sentAt" },
//         { label: "Retries", width: 70 },
//         { label: "Remark", colKey: "remark" },
//         { label: "Actions", width: 120 },
//     ];

//     return (
//         <>
//             {/* SweetAlert2 custom styles injected inline */}
//             <style>{`
//                 .swal-custom-popup { border-radius: 12px !important; font-family: 'DM Sans', 'Segoe UI', sans-serif !important; }
//                 .swal-confirm-btn { background: #A32D2D !important; color: #fff !important; border: none !important; border-radius: 7px !important; padding: 9px 20px !important; font-size: 13px !important; font-weight: 600 !important; cursor: pointer !important; margin: 0 5px !important; }
//                 .swal-cancel-btn { background: #F2F4F8 !important; color: #6B7A99 !important; border: 0.5px solid #E4E8F0 !important; border-radius: 7px !important; padding: 9px 20px !important; font-size: 13px !important; font-weight: 600 !important; cursor: pointer !important; margin: 0 5px !important; }
//             `}</style>

//             <FilterSidebar
//                 open={sidebarOpen}
//                 onClose={() => setSidebarOpen(false)}
//                 filters={sidebarFilters}
//                 onApply={f => { setSidebarFilters(f); setPage(1); setExpandedId(null); }}
//                 onReset={() => { setSidebarFilters(DEFAULT_FILTERS); setPage(1); }}
//             />

//             <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: color.bg, minHeight: "100vh", padding: isMobile ? "16px 12px" : "24px" }}>

//                 {/* ── Header ── */}
//                 <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                    
//                     <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//                         <button
//                             onClick={() => setSidebarOpen(true)}
//                             style={{
//                                 background: hasActiveSidebarFilters ? color.blueBg : color.surface,
//                                 color: hasActiveSidebarFilters ? color.blue : color.textSub,
//                                 border: `0.5px solid ${hasActiveSidebarFilters ? color.blue : color.border}`,
//                                 borderRadius: radius.md, padding: isMobile ? "7px 12px" : "8px 14px",
//                                 fontSize: 12, fontWeight: 600, cursor: "pointer",
//                                 display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit",
//                             }}
//                         >
//                              Filters{hasActiveSidebarFilters ? " ●" : ""}
//                         </button>
//                         <button
//                             onClick={handleExport}
//                             disabled={exporting}
//                             style={{
//                                 background: color.orange, color: "#fff", border: "none",
//                                 borderRadius: radius.md, padding: isMobile ? "7px 12px" : "8px 16px",
//                                 fontSize: 12, fontWeight: 600, cursor: exporting ? "not-allowed" : "pointer",
//                                 display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
//                                 opacity: exporting ? 0.6 : 1,
//                             }}
//                         >
//                             {exporting } {isMobile ? "Export" : (exporting ? "Exporting..." : "Export Excel")}
//                         </button>
//                     </div>
//                 </div>

//                 {/* ── Stat Cards (matching complaints style) ── */}
//                 <div style={{
//                     display: "grid",
//                     gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
//                     gap: isMobile ? 8 : 10,
//                     marginBottom: 16,
//                 }}>
//                     <StatCard
//                         num={stats.total} label="Total Communications"
//                         textColor={color.blue}
//                         iconBg={color.slateBg}
//                         icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke={color.slate} strokeWidth="2" strokeLinecap="round" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path stroke={color.slate} strokeWidth="2" strokeLinecap="round" d="m22 6-10 7L2 6"/></svg>}
//                     />
//                     <StatCard
//                         num={stats.sent} label="Sent / Delivered"
//                         textColor={color.green}
//                         iconBg="#DCFCE7"
//                         icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke={color.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5"/></svg>}
//                         pct={stats.total ? Math.round(stats.sent / stats.total * 100) : 0}
//                         barColor={color.greenLine}
//                     />
//                     <StatCard
//                         num={stats.failed} label="Failed"
//                         textColor={color.red}
//                         iconBg={color.redBg}
//                         icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke={color.red} strokeWidth="2"/><path stroke={color.red} strokeWidth="2" strokeLinecap="round" d="M15 9l-6 6M9 9l6 6"/></svg>}
//                         pct={stats.total ? Math.round(stats.failed / stats.total * 100) : 0}
//                         barColor={color.redLine}
//                     />
//                     <StatCard
//                         num={stats.pending} label="Pending"
//                         textColor={color.amber}
//                         iconBg={color.amberBg}
//                         icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke={color.amber} strokeWidth="2"/><path stroke={color.amber} strokeWidth="2" strokeLinecap="round" d="M12 7v5l3 3"/></svg>}
//                     />
//                 </div>

//                 {/* ── Search + Pills ── */}
//                 <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
//                     <div style={{
//                         display: "flex", alignItems: "center", gap: 6,
//                         background: color.surface, border: `0.5px solid ${color.border}`,
//                         borderRadius: radius.md, padding: "6px 10px",
//                         flex: 1, minWidth: isMobile ? 120 : 200,
//                     }}>
//                         <span style={{ fontSize: 13, color: color.textMute }}>🔍</span>
//                         <input
//                             value={search}
//                             onChange={handleSearch}
//                             placeholder="Search name, email, subject…"
//                             style={{
//                                 border: "none", background: "none", fontSize: 12,
//                                 color: color.text, outline: "none", fontFamily: "inherit", width: "100%",
//                             }}
//                         />
//                         {search && (
//                             <button
//                                 onClick={() => { setSearch(""); setPage(1); }}
//                                 style={{ border: "none", background: "none", color: color.textMute, cursor: "pointer", fontSize: 14, lineHeight: 1 }}
//                             >×</button>
//                         )}
//                     </div>
//                     {!isMobile && pills.map(p => (
//                         <FilterPill
//                             key={p.key} label={p.label} count={p.count}
//                             active={filter === p.key} activeStyle={p.activeStyle}
//                             onClick={() => handleFilter(p.key)}
//                         />
//                     ))}
//                 </div>

//                 {/* Mobile pills row */}
//                 {isMobile && (
//                     <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
//                         {pills.map(p => (
//                             <FilterPill
//                                 key={p.key} label={p.label} count={p.count}
//                                 active={filter === p.key} activeStyle={p.activeStyle}
//                                 onClick={() => handleFilter(p.key)}
//                             />
//                         ))}
//                     </div>
//                 )}

//                 {/* ── Bulk Action Bar ── */}
//                 {someSelected && (
//                     <div style={{
//                         display: "flex", alignItems: "center", gap: 10,
//                         background: color.blueBg, border: `0.5px solid ${color.blue}`,
//                         borderRadius: radius.md, padding: "8px 14px",
//                         marginBottom: 10, flexWrap: "wrap",
//                     }}>
//                         <span style={{ fontSize: 12, color: color.blue, fontWeight: 600 }}>
//                             {selectedIds.size} record{selectedIds.size > 1 ? "s" : ""} selected
//                         </span>
//                         <button
//                             onClick={handleBulkDelete}
//                             disabled={bulkDeleting}
//                             style={{
//                                 background: color.red, color: "#fff", border: "none",
//                                 borderRadius: radius.sm, padding: "5px 12px",
//                                 fontSize: 11, fontWeight: 600, cursor: bulkDeleting ? "not-allowed" : "pointer",
//                                 fontFamily: "inherit", opacity: bulkDeleting ? 0.6 : 1,
//                                 display: "flex", alignItems: "center", gap: 5,
//                             }}
//                         >
//                             🗑️ {bulkDeleting ? "Deleting..." : `Delete ${selectedIds.size}`}
//                         </button>
//                         <button
//                             onClick={() => { exportToExcel(logs.filter(r => selectedIds.has(r.id)), "selected_logs"); }}
//                             style={{
//                                 background: color.green, color: "#fff", border: "none",
//                                 borderRadius: radius.sm, padding: "5px 12px",
//                                 fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
//                             }}
//                         >
//                             📥 Export Selected
//                         </button>
//                         <button
//                             onClick={() => setSelectedIds(new Set())}
//                             style={{
//                                 background: "none", border: `0.5px solid ${color.blue}`, color: color.blue,
//                                 borderRadius: radius.sm, padding: "5px 10px",
//                                 fontSize: 11, cursor: "pointer", fontFamily: "inherit", marginLeft: "auto",
//                             }}
//                         >
//                             Clear
//                         </button>
//                     </div>
//                 )}

//                 {/* ── Table / Cards ── */}
//                 {isMobile ? (
//                     // Mobile: card list
//                     <div>
//                         {loading ? (
//                             <div style={{ textAlign: "center", padding: 40, color: color.textMute }}>Loading...</div>
//                         ) : error ? (
//                             <div style={{ textAlign: "center", padding: 40, color: color.red }}>❌ {error}</div>
//                         ) : filteredLogs.length === 0 ? (
//                             <div style={{ textAlign: "center", padding: 40, color: color.textMute }}>No records found</div>
//                         ) : (
//                             filteredLogs.map(row => (
//                                 <MobileCard
//                                     key={row.id} row={row}
//                                     isExpanded={expandedId === row.id}
//                                     onToggle={() => toggleExpand(row.id)}
//                                     onResend={handleResend}
//                                     onDelete={handleDelete}
//                                     isSelected={selectedIds.has(row.id)}
//                                     onSelect={handleSelect}
//                                 />
//                             ))
//                         )}
//                     </div>
//                 ) : (
//                     // Desktop: table
//                     <div style={{
//                         background: color.surface, border: `0.5px solid ${color.border}`,
//                         borderRadius: radius.lg, overflow: "hidden",
//                     }}>
//                         <div style={{ overflowX: "auto" }}>
//                             <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 960 }}>
//                                 <thead>
//                                     <tr style={{ background: "#F8F9FC", borderBottom: `0.5px solid ${color.border}` }}>
//                                         {/* Checkbox select-all */}
//                                         <th style={{ padding: "8px 8px", width: 36 }}>
//                                             <input
//                                                 type="checkbox"
//                                                 checked={allSelected}
//                                                 onChange={e => handleSelectAll(e.target.checked)}
//                                                 style={{ width: 14, height: 14, cursor: "pointer" }}
//                                             />
//                                         </th>
//                                         <th style={{ width: 28 }} />
//                                         {headers.slice(2).map(h => (
//                                             <th key={h.label} style={{
//                                                 padding: "8px 11px", textAlign: "left",
//                                                 fontSize: 10, fontWeight: 600, color: color.textSub,
//                                                 whiteSpace: "nowrap", minWidth: h.width,
//                                             }}>
//                                                 {h.label}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                     {/* Column search row */}
//                                     <tr style={{ background: "#FAFBFE", borderBottom: `0.5px solid ${color.border}` }}>
//                                         <td colSpan={2} />
//                                         <td style={{ padding: "5px 11px" }}>
//                                             <ColumnSearch value={colSearch.recipient} onChange={v => setColSearch(p => ({ ...p, recipient: v }))} placeholder="Search…" />
//                                         </td>
//                                         <td style={{ padding: "5px 11px" }}>
//                                             <ColumnSearch value={colSearch.subject} onChange={v => setColSearch(p => ({ ...p, subject: v }))} placeholder="Search…" />
//                                         </td>
//                                         <td style={{ padding: "5px 11px" }}>
//                                             <ColumnSearch value={colSearch.type} onChange={v => setColSearch(p => ({ ...p, type: v }))} placeholder="Search…" />
//                                         </td>
//                                         <td />
//                                         <td style={{ padding: "5px 11px" }}>
//                                             <ColumnSearch value={colSearch.channel} onChange={v => setColSearch(p => ({ ...p, channel: v }))} placeholder="Search…" />
//                                         </td>
//                                         <td style={{ padding: "5px 11px" }}>
//                                             <ColumnSearch value={colSearch.sentAt} onChange={v => setColSearch(p => ({ ...p, sentAt: v }))} placeholder="Search…" />
//                                         </td>
//                                         <td />
//                                         <td style={{ padding: "5px 11px" }}>
//                                             <ColumnSearch value={colSearch.remark} onChange={v => setColSearch(p => ({ ...p, remark: v }))} placeholder="Search…" />
//                                         </td>
//                                         <td />
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {loading ? (
//                                         <tr><td colSpan={11} style={{ textAlign: "center", padding: 40 }}>Loading...</td></tr>
//                                     ) : error ? (
//                                         <tr><td colSpan={11} style={{ textAlign: "center", padding: 40, color: color.red }}>❌ {error}</td></tr>
//                                     ) : filteredLogs.length === 0 ? (
//                                         <tr><td colSpan={11} style={{ textAlign: "center", padding: 40, color: color.textMute }}>No records found</td></tr>
//                                     ) : (
//                                         filteredLogs.map(row => (
//                                             <EmailRow
//                                                 key={row.id} row={row}
//                                                 isExpanded={expandedId === row.id}
//                                                 onToggle={() => toggleExpand(row.id)}
//                                                 onResend={handleResend}
//                                                 onDelete={handleDelete}
//                                                 isSelected={selectedIds.has(row.id)}
//                                                 onSelect={handleSelect}
//                                             />
//                                         ))
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>

//                         {/* Pagination */}
//                         {!loading && totalPages > 1 && (
//                             <div style={{
//                                 display: "flex", alignItems: "center", justifyContent: "space-between",
//                                 padding: "10px 14px", borderTop: `0.5px solid ${color.border}`,
//                                 fontSize: 11, color: color.textSub, flexWrap: "wrap", gap: 8,
//                             }}>
//                                 <span>
//                                     {filteredLogs.length > 0
//                                         ? `Showing ${(safePage - 1) * PER_PAGE + 1}–${Math.min(safePage * PER_PAGE, stats.total)} of ${stats.total} records`
//                                         : "No records"}
//                                 </span>
//                                 <div style={{ display: "flex", gap: 4 }}>
//                                     <button
//                                         onClick={() => setPage(p => Math.max(1, p - 1))}
//                                         disabled={page === 1}
//                                         style={{
//                                             padding: "4px 10px", border: `0.5px solid ${color.border}`,
//                                             borderRadius: radius.sm, background: color.surface,
//                                             cursor: page === 1 ? "not-allowed" : "pointer",
//                                             opacity: page === 1 ? 0.5 : 1, fontSize: 11,
//                                         }}
//                                     >‹ Prev</button>
//                                     <span style={{ padding: "4px 10px" }}>Page {page} of {totalPages}</span>
//                                     <button
//                                         onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                                         disabled={page === totalPages}
//                                         style={{
//                                             padding: "4px 10px", border: `0.5px solid ${color.border}`,
//                                             borderRadius: radius.sm, background: color.surface,
//                                             cursor: page === totalPages ? "not-allowed" : "pointer",
//                                             opacity: page === totalPages ? 0.5 : 1, fontSize: 11,
//                                         }}
//                                     >Next ›</button>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Mobile pagination */}
//                 {isMobile && !loading && totalPages > 1 && (
//                     <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
//                         <button
//                             onClick={() => setPage(p => Math.max(1, p - 1))}
//                             disabled={page === 1}
//                             style={{
//                                 padding: "6px 14px", border: `0.5px solid ${color.border}`,
//                                 borderRadius: radius.sm, background: color.surface,
//                                 cursor: page === 1 ? "not-allowed" : "pointer",
//                                 opacity: page === 1 ? 0.5 : 1, fontSize: 11,
//                             }}
//                         >‹ Prev</button>
//                         <span style={{ padding: "6px 10px", fontSize: 11, color: color.textSub }}>
//                             {page} / {totalPages}
//                         </span>
//                         <button
//                             onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                             disabled={page === totalPages}
//                             style={{
//                                 padding: "6px 14px", border: `0.5px solid ${color.border}`,
//                                 borderRadius: radius.sm, background: color.surface,
//                                 cursor: page === totalPages ? "not-allowed" : "pointer",
//                                 opacity: page === totalPages ? 0.5 : 1, fontSize: 11,
//                             }}
//                         >Next ›</button>
//                     </div>
//                 )}
//             </div>
//         </>
//     );
// }


// "use client";

// import { useState, useEffect, useCallback } from "react";
// import {
//   getCommunicationLogs,
//   getCommunicationStatistics,
//   exportCommunicationLogs,
//   resendCommunication,
//   deleteCommunicationLog,
//   type CommunicationLog,
// } from "@/lib/communicationLogApi";
// import { AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";

// declare const Swal: any;

// // ─────────────────────────────────────────────────────────────────────────────
// // THEME CONSTANTS (matching Category Mapping Form)
// // ─────────────────────────────────────────────────────────────────────────────
// const colors = {
//   primary: {
//     from: "#1A2B6D",
//     to: "#3B5BDB",
//   },
//   bg: "#F2F4F8",
//   surface: "#FFFFFF",
//   border: "#E4E8F0",
//   borderSub: "#EEF0F5",
//   text: "#1A2340",
//   textSub: "#6B7A99",
//   textMute: "#9BA5BF",
//   blue: "#185FA5",
//   blueBg: "#E6F1FB",
//   green: "#0F6E56",
//   greenBg: "#E1F5EE",
//   greenLine: "#1D9E75",
//   red: "#A32D2D",
//   redBg: "#FCEBEB",
//   redLine: "#E24B4A",
//   amber: "#854F0B",
//   amberBg: "#FAEEDA",
//   orange: "#E8601A",
//   slate: "#64748B",
//   slateBg: "#F1F5F9",
// };

// const AVATAR_COLORS = [
//   { bg: "#E6F1FB", c: "#185FA5" },
//   { bg: "#E1F5EE", c: "#0F6E56" },
//   { bg: "#EEEDFE", c: "#3C3489" },
//   { bg: "#FAEEDA", c: "#854F0B" },
//   { bg: "#FCEBEB", c: "#A32D2D" },
//   { bg: "#EAF3DE", c: "#3B6D11" },
//   { bg: "#FAECE7", c: "#993C1D" },
//   { bg: "#FBEAF0", c: "#993556" },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────────────────
// const getInitials = (name: string) =>
//   (name || "U")
//     .split(" ")
//     .map((x) => x[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

// const getAvatar = (id: number) => AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];

// const trunc = (str: string | null, n: number) => {
//   if (!str) return "";
//   return str.length > n ? str.slice(0, n) + "…" : str;
// };

// const formatDate = (dateStr: string | null) => {
//   if (!dateStr) return "—";
//   return new Date(dateStr).toLocaleString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// // Excel export using CSV with BOM
// const exportToExcel = (logs: CommunicationLog[], filename = "communication_logs") => {
//   const headers = [
//     "ID",
//     "Recipient Name",
//     "Recipient Email",
//     "Recipient Phone",
//     "Subject",
//     "Type",
//     "Status",
//     "Channel",
//     "Sent At",
//     "Delivered At",
//     "Created At",
//     "Retries",
//     "Template",
//     "Property",
//     "Tenant",
//     "Error Message",
//   ];

//   const rows = logs.map((row) => [
//     row.id,
//     row.recipient_name || "",
//     row.recipient_email || "",
//     row.recipient_phone || "",
//     row.subject || "",
//     row.communication_type || "",
//     row.status || "",
//     row.channel || "",
//     row.sent_at || "",
//     row.delivered_at || "",
//     row.created_at || "",
//     row.retries,
//     row.template_name || "",
//     row.property_name || "",
//     row.tenant_name || "",
//     row.error_message || "",
//   ]);

//   const csvContent = [headers, ...rows]
//     .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
//     .join("\n");

//   const BOM = "\uFEFF";
//   const blob = new Blob([BOM + csvContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`;
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// };

// // SweetAlert2 bulk delete confirmation
// const confirmBulkDelete = async (count: number): Promise<boolean> => {
//   if (typeof Swal === "undefined") {
//     return window.confirm(`Are you sure you want to delete ${count} selected record(s)? This action cannot be undone.`);
//   }
//   const result = await Swal.fire({
//     title: `<span style="font-size:18px;font-weight:700;color:#1A2340">Delete ${count} Record${count > 1 ? "s" : ""}?</span>`,
//     html: `
//       <div style="text-align:center;padding:4px 0">
//         <div style="width:52px;height:52px;border-radius:50%;background:#FCEBEB;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
//           <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#A32D2D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
//         </div>
//         <p style="color:#6B7A99;font-size:13px;line-height:1.6;margin:0">
//           You're about to permanently delete <strong style="color:#1A2340">${count} communication log${count > 1 ? "s" : ""}</strong>.<br/>
//           This action <strong style="color:#A32D2D">cannot be undone</strong>.
//         </p>
//       </div>`,
//     showCancelButton: true,
//     confirmButtonText: `Delete ${count} Record${count > 1 ? "s" : ""}`,
//     cancelButtonText: "Cancel",
//     customClass: {
//       popup: "swal-custom-popup",
//       confirmButton: "swal-confirm-btn",
//       cancelButton: "swal-cancel-btn",
//     },
//     buttonsStyling: false,
//     width: 360,
//   });
//   return result.isConfirmed;
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // SUB-COMPONENTS (Tailwind + no icons)
// // ─────────────────────────────────────────────────────────────────────────────
// function Badge({ variant = "success", children }: { variant?: string; children: React.ReactNode }) {
//   const styles: Record<string, { bg: string; text: string }> = {
//     success: { bg: colors.greenBg, text: colors.green },
//     failed: { bg: colors.redBg, text: colors.red },
//     pending: { bg: colors.amberBg, text: colors.amber },
//     sent: { bg: colors.greenBg, text: colors.green },
//     delivered: { bg: colors.greenBg, text: colors.green },
//   };
//   const s = styles[variant] || styles.success;
//   return (
//     <span
//       className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
//       style={{ backgroundColor: s.bg, color: s.text }}
//     >
//       {children}
//     </span>
//   );
// }

// function MiniBar({ pct, color: barColor = colors.greenLine }: { pct: number; color?: string }) {
//   return (
//     <div className="h-1 rounded-sm overflow-hidden w-full mt-1" style={{ backgroundColor: colors.border }}>
//       <div className="h-full rounded-sm transition-all duration-400" style={{ width: `${pct}%`, backgroundColor: barColor }} />
//     </div>
//   );
// }

// function Avatar({ name, id }: { name: string; id: number }) {
//   const av = getAvatar(id);
//   return (
//     <span
//       className="w-7 h-7 rounded-full inline-flex items-center justify-center text-[9px] font-bold shrink-0 mr-2"
//       style={{ backgroundColor: av.bg, color: av.c }}
//     >
//       {getInitials(name)}
//     </span>
//   );
// }

// function StatCard({
//   num,
//   label,
//   pct,
//   barColor,
//   textColor,
// }: {
//   num: number;
//   label: string;
//   pct?: number;
//   barColor?: string;
//   textColor?: string;
// }) {
//   return (
//     <div className="bg-white border border-[#E4E8F0] rounded-lg p-2.5 flex-1 min-w-0 flex flex-col gap-1">
//       <div className="flex items-center justify-between">
//         <div className="min-w-0">
//           <div className="text-[10px] font-medium text-[#6B7A99] mb-0.5 whitespace-nowrap">{label}</div>
//           <div className="text-xl font-bold leading-tight" style={{ color: textColor || colors.text }}>
//             {num.toLocaleString()}
//           </div>
//         </div>
//       </div>
//       {pct !== undefined && <MiniBar pct={pct} color={barColor} />}
//     </div>
//   );
// }

// function FilterPill({
//   label,
//   active,
//   onClick,
//   count,
//   activeStyle,
// }: {
//   label: string;
//   active: boolean;
//   onClick: () => void;
//   count?: number;
//   activeStyle: any;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-all font-inherit border ${
//         active ? "" : "bg-[#F2F4F8] text-[#6B7A99] border-[#E4E8F0]"
//       }`}
//       style={active ? activeStyle : undefined}
//     >
//       {label}
//       {count !== undefined && (
//         <span
//           className={`rounded-full text-[10px] px-1 font-semibold ${
//             active ? "bg-white/35" : "bg-[#E4E8F0] text-[#6B7A99]"
//           }`}
//         >
//           {count}
//         </span>
//       )}
//     </button>
//   );
// }

// function ColumnSearch({
//   value,
//   onChange,
//   placeholder,
// }: {
//   value: string;
//   onChange: (v: string) => void;
//   placeholder: string;
// }) {
//   return (
//     <div className="relative flex items-center">
//       <input
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         className="w-full px-1.5 py-1 pr-6 text-[10px] border border-[#E4E8F0] rounded-md bg-[#FAFBFE] text-[#1A2340] outline-none font-inherit"
//       />
//       {value && (
//         <button
//           onClick={() => onChange("")}
//           className="absolute right-1 border-none bg-transparent text-[#9BA5BF] cursor-pointer text-xs leading-none p-0"
//         >
//           ×
//         </button>
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // FILTER SIDEBAR (Tailwind version)
// // ─────────────────────────────────────────────────────────────────────────────
// interface FilterState {
//   status: string;
//   channel: string;
//   communicationType: string;
//   dateFrom: string;
//   dateTo: string;
//   hasRetries: boolean;
// }

// function FilterSidebar({
//   open,
//   onClose,
//   filters,
//   onApply,
//   onReset,
// }: {
//   open: boolean;
//   onClose: () => void;
//   filters: FilterState;
//   onApply: (f: FilterState) => void;
//   onReset: () => void;
// }) {
//   const [local, setLocal] = useState<FilterState>(filters);
//   useEffect(() => {
//     setLocal(filters);
//   }, [filters, open]);

//   const set = (k: keyof FilterState, v: any) => setLocal((prev) => ({ ...prev, [k]: v }));

//   const selectClasses =
//     "w-full px-2.5 py-1.5 border border-[#E4E8F0] rounded-md bg-white text-xs text-[#1A2340] outline-none cursor-pointer font-inherit";
//   const inputClasses =
//     "w-full px-2.5 py-1.5 border border-[#E4E8F0] rounded-md bg-white text-xs text-[#1A2340] outline-none font-inherit";

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         onClick={onClose}
//         className={`fixed inset-0 bg-black/35 z-[199] transition-opacity duration-250 backdrop-blur-sm ${
//           open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
//         }`}
//       />
//       {/* Drawer */}
//       <div
//         className={`fixed top-0 right-0 bottom-0 w-[min(340px,90vw)] bg-white shadow-[-4px_0_24px_rgba(26,35,64,0.12)] z-[200] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
//           open ? "translate-x-0" : "translate-x-full"
//         }`}
//       >
//         <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E8F0]">
//           <div>
//             <div className="text-sm font-bold text-[#1A2340]">Filter Logs</div>
//             <div className="text-[10px] text-[#6B7A99] mt-0.5">Narrow down results</div>
//           </div>
//           <button onClick={onClose} className="border-none bg-transparent cursor-pointer text-xl text-[#9BA5BF] leading-none">
//             ×
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-5">
//           <div className="mb-3.5">
//             <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">Status</label>
//             <select value={local.status} onChange={(e) => set("status", e.target.value)} className={selectClasses}>
//               <option value="">All Statuses</option>
//               <option value="sent">Sent</option>
//               <option value="delivered">Delivered</option>
//               <option value="failed">Failed</option>
//               <option value="pending">Pending</option>
//             </select>
//           </div>

//           <div className="mb-3.5">
//             <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">Channel</label>
//             <select value={local.channel} onChange={(e) => set("channel", e.target.value)} className={selectClasses}>
//               <option value="">All Channels</option>
//               <option value="email">Email</option>
//               <option value="whatsapp">WhatsApp</option>
//               <option value="sms">SMS</option>
//             </select>
//           </div>

//           <div className="mb-3.5">
//             <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">
//               Communication Type
//             </label>
//             <select
//               value={local.communicationType}
//               onChange={(e) => set("communicationType", e.target.value)}
//               className={selectClasses}
//             >
//               <option value="">All Types</option>
//               <option value="rent_reminder">Rent Reminder</option>
//               <option value="maintenance_update">Maintenance Update</option>
//               <option value="notice">Notice</option>
//               <option value="welcome">Welcome</option>
//               <option value="other">Other</option>
//             </select>
//           </div>

//           <div className="mb-3.5">
//             <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">Date From</label>
//             <input type="date" value={local.dateFrom} onChange={(e) => set("dateFrom", e.target.value)} className={inputClasses} />
//           </div>

//           <div className="mb-3.5">
//             <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">Date To</label>
//             <input type="date" value={local.dateTo} onChange={(e) => set("dateTo", e.target.value)} className={inputClasses} />
//           </div>

//           <div className="mb-3.5">
//             <label className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={local.hasRetries}
//                 onChange={(e) => set("hasRetries", e.target.checked)}
//                 className="w-3.5 h-3.5 cursor-pointer"
//               />
//               <span className="text-xs text-[#1A2340]">Show only records with retries</span>
//             </label>
//           </div>
//         </div>

//         <div className="p-4 border-t border-[#E4E8F0] flex gap-2">
//           <button
//             onClick={onReset}
//             className="flex-1 py-2 border border-[#E4E8F0] rounded-md bg-[#F2F4F8] text-[#6B7A99] text-xs font-semibold cursor-pointer"
//           >
//             Reset
//           </button>
//           <button
//             onClick={() => {
//               onApply(local);
//               onClose();
//             }}
//             className="flex-[2] py-2 rounded-md text-xs font-semibold cursor-pointer text-white"
//             style={{ background: `linear-gradient(135deg, ${colors.primary.from}, ${colors.primary.to})` }}
//           >
//             Apply Filters
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // EXPANDED ROW (Desktop)
// // ─────────────────────────────────────────────────────────────────────────────
// function ExpandedRow({ row }: { row: CommunicationLog }) {
//   const isOk = row.status === "sent" || row.status === "delivered";
//   return (
//     <tr>
//       <td colSpan={11} className="p-0">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 p-3.5 bg-[#F8F9FC] border-t border-[#E4E8F0]">
//           <div>
//             <div className="text-[9px] font-bold text-[#6B7A99] uppercase tracking-wide mb-1.5">Delivery Timeline</div>
//             <div className="text-xs text-[#1A2340] space-y-1">
//               <div>
//                 <span className="text-[#6B7A99] w-16 inline-block">Sent</span> {formatDate(row.sent_at)}
//               </div>
//               <div>
//                 <span className="text-[#6B7A99] w-16 inline-block">Delivered</span>{" "}
//                 <span className={isOk ? "text-[#0F6E56]" : "text-[#A32D2D]"}>
//                   {formatDate(row.delivered_at) || formatDate(row.sent_at)}
//                 </span>
//               </div>
//               <div>
//                 <span className="text-[#6B7A99] w-16 inline-block">Created</span> {formatDate(row.created_at)}
//               </div>
//             </div>
//           </div>
//           <div>
//             <div className="text-[9px] font-bold text-[#6B7A99] uppercase tracking-wide mb-1.5">Contact Info</div>
//             <div className="text-xs text-[#1A2340] space-y-1">
//               <div>
//                 <span className="text-[#6B7A99] w-16 inline-block">Name</span> {row.recipient_name || "—"}
//               </div>
//               <div>
//                 <span className="text-[#6B7A99] w-16 inline-block">Email</span> {row.recipient_email}
//               </div>
//               <div>
//                 <span className="text-[#6B7A99] w-16 inline-block">Phone</span> {row.recipient_phone || "—"}
//               </div>
//             </div>
//           </div>
//           <div>
//             <div className="text-[9px] font-bold text-[#6B7A99] uppercase tracking-wide mb-1.5">Details</div>
//             <div className="text-xs text-[#1A2340] space-y-1">
//               <div>
//                 <span className="text-[#6B7A99] w-16 inline-block">Retries</span> {row.retries}
//               </div>
//               <div>
//                 <span className="text-[#6B7A99] w-16 inline-block">Template</span> {row.template_name || "—"}
//               </div>
//               <div>
//                 <span className="text-[#6B7A99] w-16 inline-block">Property</span> {row.property_name || "—"}
//               </div>
//               <div>
//                 <span className="text-[#6B7A99] w-16 inline-block">Tenant</span> {row.tenant_name || "—"}
//               </div>
//             </div>
//             {row.status === "failed" && row.error_message && (
//               <div className="mt-2 p-2 rounded-md text-xs text-[#A32D2D]" style={{ backgroundColor: colors.redBg }}>
//                 <strong>Error:</strong> {row.error_message}
//               </div>
//             )}
//           </div>
//         </div>
//       </td>
//     </tr>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MOBILE CARD
// // ─────────────────────────────────────────────────────────────────────────────
// function MobileCard({
//   row,
//   isExpanded,
//   onToggle,
//   onResend,
//   onDelete,
//   isSelected,
//   onSelect,
// }: {
//   row: CommunicationLog;
//   isExpanded: boolean;
//   onToggle: () => void;
//   onResend: (id: number) => void;
//   onDelete: (id: number) => void;
//   isSelected: boolean;
//   onSelect: (id: number, checked: boolean) => void;
// }) {
//   const statusBadge = {
//     sent: <Badge variant="success">Sent</Badge>,
//     delivered: <Badge variant="success">Delivered</Badge>,
//     failed: <Badge variant="failed">Failed</Badge>,
//     pending: <Badge variant="pending">Pending</Badge>,
//   }[row.status] || <Badge variant="pending">{row.status}</Badge>;

//   return (
//     <div
//       className={`border rounded-lg mb-2 overflow-hidden transition-all ${
//         isSelected ? "bg-[#E6F1FB] border-[#185FA5]" : "bg-white border-[#E4E8F0]"
//       }`}
//     >
//       <div className="p-2.5 cursor-pointer" onClick={onToggle}>
//         <div className="flex items-center gap-2 mb-1.5">
//           <input
//             type="checkbox"
//             checked={isSelected}
//             onClick={(e) => e.stopPropagation()}
//             onChange={(e) => onSelect(row.id, e.target.checked)}
//             className="w-3.5 h-3.5 cursor-pointer shrink-0"
//           />
//           <Avatar name={row.recipient_name || row.recipient_email} id={row.id} />
//           <div className="flex-1 min-w-0">
//             <div className="text-xs font-semibold text-[#1A2340] truncate">{row.recipient_name || "—"}</div>
//             <div className="text-[10px] text-[#6B7A99] truncate">{row.recipient_email}</div>
//           </div>
//           {statusBadge}
//           <span className={`text-[10px] text-[#9BA5BF] inline-block transition-transform ${isExpanded ? "rotate-90" : ""}`}>
//             ▶
//           </span>
//         </div>

//         <div className="flex justify-between items-center">
//           <div className="text-xs text-[#1A2340] truncate flex-1">{trunc(row.subject, 40) || "—"}</div>
//           <div className="text-[10px] text-[#9BA5BF] ml-2 whitespace-nowrap">{formatDate(row.sent_at)}</div>
//         </div>

//         <div className="flex flex-wrap gap-1.5 mt-2 items-center">
//           <span className="text-[10px] text-[#6B7A99] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
//             {row.channel === "email" ? "Email" : row.channel === "whatsapp" ? "WhatsApp" : "SMS"}
//           </span>
//           <span className="text-[10px] text-[#6B7A99]">{row.communication_type?.replace("_", " ") || "—"}</span>
//           {row.retries > 0 && <Badge variant="failed">{row.retries}x retry</Badge>}
//           <div className="ml-auto flex gap-1.5">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onResend(row.id);
//               }}
//               disabled={row.status !== "failed"}
//               className={`text-[10px] px-2 py-0.5 rounded-md border ${
//                 row.status === "failed"
//                   ? "border-[#A32D2D] text-[#A32D2D] cursor-pointer"
//                   : "border-[#E4E8F0] text-[#9BA5BF] cursor-not-allowed"
//               } bg-none font-inherit`}
//             >
//               Retry
//             </button>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onDelete(row.id);
//               }}
//               className="text-[10px] px-2 py-0.5 rounded-md border border-[#E4E8F0] text-[#9BA5BF] cursor-pointer bg-none font-inherit"
//             >
//               Delete
//             </button>
//           </div>
//         </div>
//       </div>

//       {isExpanded && (
//         <div className="p-3 bg-[#F8F9FC] border-t border-[#E4E8F0] text-xs text-[#1A2340] grid grid-cols-2 gap-3">
//           <div>
//             <div className="text-[9px] font-bold text-[#6B7A99] uppercase mb-1">Timeline</div>
//             <div>Sent: {formatDate(row.sent_at)}</div>
//             <div>Created: {formatDate(row.created_at)}</div>
//           </div>
//           <div>
//             <div className="text-[9px] font-bold text-[#6B7A99] uppercase mb-1">Contact</div>
//             <div>{row.recipient_phone || "No phone"}</div>
//             <div>{row.property_name || "No property"}</div>
//           </div>
//           {row.status === "failed" && row.error_message && (
//             <div className="col-span-2 p-2 rounded-md text-[#A32D2D] text-xs" style={{ backgroundColor: colors.redBg }}>
//               <strong>Error:</strong> {row.error_message}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // TABLE ROW (Desktop)
// // ─────────────────────────────────────────────────────────────────────────────
// function EmailRow({
//   row,
//   isExpanded,
//   onToggle,
//   onResend,
//   onDelete,
//   isSelected,
//   onSelect,
// }: {
//   row: CommunicationLog;
//   isExpanded: boolean;
//   onToggle: () => void;
//   onResend: (id: number) => void;
//   onDelete: (id: number) => void;
//   isSelected: boolean;
//   onSelect: (id: number, checked: boolean) => void;
// }) {
//   const [hovered, setHovered] = useState(false);

//   const statusBadge = {
//     sent: <Badge variant="success">Sent</Badge>,
//     delivered: <Badge variant="success">Delivered</Badge>,
//     failed: <Badge variant="failed">Failed</Badge>,
//     pending: <Badge variant="pending">Pending</Badge>,
//   }[row.status] || <Badge variant="pending">{row.status}</Badge>;

//   const remarkText = row.error_message || row.subject || "—";
//   const remarkColor =
//     row.status === "failed" ? colors.red : row.status === "pending" ? colors.amber : colors.textSub;

//   const bgClass = isSelected
//     ? "bg-[#E6F1FB]"
//     : hovered || isExpanded
//     ? "bg-[#F5F7FB]"
//     : "bg-transparent";

//   return (
//     <>
//       <tr
//         onClick={onToggle}
//         onMouseEnter={() => setHovered(true)}
//         onMouseLeave={() => setHovered(false)}
//         className="cursor-pointer border-b border-[#EEF0F5]"
//       >
//         <td className={`${bgClass} px-2 py-2 align-middle w-7 text-center`} onClick={(e) => e.stopPropagation()}>
//           <input
//             type="checkbox"
//             checked={isSelected}
//             onChange={(e) => onSelect(row.id, e.target.checked)}
//             className="w-3.5 h-3.5 cursor-pointer"
//           />
//         </td>
//         <td className={`${bgClass} px-1 py-2 align-middle w-7 text-center`}>
//           <span
//             className={`inline-block text-[10px] text-[#9BA5BF] transition-transform ${
//               isExpanded ? "rotate-90" : "rotate-0"
//             }`}
//           >
//             ▶
//           </span>
//         </td>
//         <td className={`${bgClass} px-3 py-2 align-middle max-w-[150px]`}>
//           <div className="flex items-center">
//             <Avatar name={row.recipient_name || row.recipient_email} id={row.id} />
//             <div className="min-w-0">
//               <div className="text-xs font-semibold text-[#1A2340] truncate">{row.recipient_name || "—"}</div>
//               <div className="text-[10px] text-[#6B7A99] truncate">{row.recipient_email}</div>
//             </div>
//           </div>
//         </td>
//         <td className={`${bgClass} px-3 py-2 align-middle text-xs text-[#1A2340] max-w-[160px]`}>
//           <span title={row.subject || ""}>{trunc(row.subject, 30) || "—"}</span>
//         </td>
//         <td className={`${bgClass} px-3 py-2 align-middle text-xs text-[#6B7A99] whitespace-nowrap`}>
//           {row.communication_type?.replace("_", " ") || "—"}
//         </td>
//         <td className={`${bgClass} px-3 py-2 align-middle whitespace-nowrap`}>{statusBadge}</td>
//         <td className={`${bgClass} px-3 py-2 align-middle text-center text-xs`}>
//           <span className="text-[10px] text-[#6B7A99]">{row.channel}</span>
//         </td>
//         <td className={`${bgClass} px-3 py-2 align-middle text-xs text-[#6B7A99] whitespace-nowrap`}>
//           {formatDate(row.sent_at)}
//         </td>
//         <td className={`${bgClass} px-3 py-2 align-middle text-center`}>
//           {row.retries > 0 ? <Badge variant="failed">{row.retries}x</Badge> : <span className="text-[10px] text-[#9BA5BF]">0</span>}
//         </td>
//         <td className={`${bgClass} px-3 py-2 align-middle text-[10px] max-w-[140px]`} style={{ color: remarkColor }}>
//           <span title={remarkText}>{trunc(remarkText, 32)}</span>
//         </td>
//         <td className={`${bgClass} px-3 py-2 align-middle text-center whitespace-nowrap`}>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onResend(row.id);
//             }}
//             disabled={row.status !== "failed"}
//             className={`text-[10px] px-2 py-1 rounded-md border mr-1.5 font-inherit ${
//               row.status === "failed"
//                 ? "border-[#A32D2D] text-[#A32D2D] cursor-pointer"
//                 : "border-[#E4E8F0] text-[#9BA5BF] cursor-not-allowed"
//             } bg-none`}
//           >
//             Retry
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onDelete(row.id);
//             }}
//             className="text-[10px] px-2 py-1 rounded-md border border-[#E4E8F0] text-[#9BA5BF] cursor-pointer bg-none font-inherit"
//           >
//             Delete
//           </button>
//         </td>
//       </tr>
//       {isExpanded && <ExpandedRow row={row} />}
//     </>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────
// const DEFAULT_FILTERS: FilterState = {
//   status: "",
//   channel: "",
//   communicationType: "",
//   dateFrom: "",
//   dateTo: "",
//   hasRetries: false,
// };

// export default function EmailHistory() {
//   const [logs, setLogs] = useState<CommunicationLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, pending: 0 });
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [page, setPage] = useState(1);
//   const [expandedId, setExpandedId] = useState<number | null>(null);
//   const [exporting, setExporting] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarFilters, setSidebarFilters] = useState<FilterState>(DEFAULT_FILTERS);
//   const [colSearch, setColSearch] = useState({
//     recipient: "",
//     subject: "",
//     type: "",
//     channel: "",
//     sentAt: "",
//     remark: "",
//   });
//   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
//   const [bulkDeleting, setBulkDeleting] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const check = () => setIsMobile(window.innerWidth < 768);
//     check();
//     window.addEventListener("resize", check);
//     return () => window.removeEventListener("resize", check);
//   }, []);

//   const PER_PAGE = 10;

//   const loadLogs = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const filters: any = { page, limit: PER_PAGE };
//       if (search) filters.search = search;
//       if (filter !== "all") filters.status = filter;
//       if (sidebarFilters.status) filters.status = sidebarFilters.status;
//       if (sidebarFilters.channel) filters.channel = sidebarFilters.channel;
//       if (sidebarFilters.communicationType) filters.communication_type = sidebarFilters.communicationType;
//       if (sidebarFilters.dateFrom) filters.date_from = sidebarFilters.dateFrom;
//       if (sidebarFilters.dateTo) filters.date_to = sidebarFilters.dateTo;
//       if (sidebarFilters.hasRetries) filters.has_retries = true;

//       const response = await getCommunicationLogs(filters);
//       if (response.success) {
//         setLogs(response.data);
//       } else {
//         setError("Failed to load logs");
//       }
//     } catch (err: any) {
//       setError(err.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   }, [page, search, filter, sidebarFilters]);

//   const loadStats = useCallback(async () => {
//     try {
//       const response = await getCommunicationStatistics();
//       if (response.success) {
//         setStats({
//           total: response.data.total || 0,
//           sent: response.data.sent || 0,
//           failed: response.data.failed || 0,
//           pending: response.data.pending || 0,
//         });
//       }
//     } catch (err) {
//       console.error("Error loading stats:", err);
//     }
//   }, []);

//   useEffect(() => {
//     loadLogs();
//     loadStats();
//   }, [loadLogs, loadStats]);

//   const filteredLogs = logs.filter((row) => {
//     const cs = colSearch;
//     if (cs.recipient && !`${row.recipient_name || ""} ${row.recipient_email}`.toLowerCase().includes(cs.recipient.toLowerCase()))
//       return false;
//     if (cs.subject && !(row.subject || "").toLowerCase().includes(cs.subject.toLowerCase())) return false;
//     if (cs.type && !(row.communication_type || "").toLowerCase().includes(cs.type.toLowerCase())) return false;
//     if (cs.channel && !(row.channel || "").toLowerCase().includes(cs.channel.toLowerCase())) return false;
//     if (cs.sentAt && !formatDate(row.sent_at).toLowerCase().includes(cs.sentAt.toLowerCase())) return false;
//     if (cs.remark && !`${row.error_message || ""} ${row.subject || ""}`.toLowerCase().includes(cs.remark.toLowerCase()))
//       return false;
//     return true;
//   });

//   const handleResend = async (id: number) => {
//     if (!window.confirm("Are you sure you want to resend this?")) return;
//     try {
//       await resendCommunication(id);
//       alert("Resent successfully!");
//       loadLogs();
//     } catch (err: any) {
//       alert(err.message || "Failed to resend");
//     }
//   };

//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure you want to delete this log?")) return;
//     try {
//       await deleteCommunicationLog(id);
//       loadLogs();
//       loadStats();
//     } catch (err: any) {
//       alert(err.message || "Failed to delete");
//     }
//   };

//   const handleBulkDelete = async () => {
//     const count = selectedIds.size;
//     if (count === 0) return;
//     const confirmed = await confirmBulkDelete(count);
//     if (!confirmed) return;

//     setBulkDeleting(true);
//     try {
//       await Promise.all(Array.from(selectedIds).map((id) => deleteCommunicationLog(id)));
//       setSelectedIds(new Set());
//       loadLogs();
//       loadStats();
//       if (typeof Swal !== "undefined") {
//         Swal.fire({
//           title: "Deleted!",
//           text: `${count} record${count > 1 ? "s" : ""} deleted successfully.`,
//           icon: "success",
//           timer: 2000,
//           showConfirmButton: false,
//           customClass: { popup: "swal-custom-popup" },
//         });
//       }
//     } catch (err: any) {
//       alert(err.message || "Bulk delete failed");
//     } finally {
//       setBulkDeleting(false);
//     }
//   };

//   const handleExport = async () => {
//     setExporting(true);
//     try {
//       try {
//         const filters: any = {};
//         if (search) filters.search = search;
//         if (filter !== "all") filters.status = filter;
//         await exportCommunicationLogs(filters);
//       } catch {
//         exportToExcel(logs, "communication_logs");
//       }
//     } catch (err: any) {
//       alert(err.message || "Export failed");
//     } finally {
//       setExporting(false);
//     }
//   };

//   const handleFilter = (f: string) => {
//     setFilter(f);
//     setPage(1);
//     setExpandedId(null);
//   };

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearch(e.target.value);
//     setPage(1);
//     setExpandedId(null);
//   };

//   const toggleExpand = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

//   const handleSelect = (id: number, checked: boolean) => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       if (checked) next.add(id);
//       else next.delete(id);
//       return next;
//     });
//   };

//   const handleSelectAll = (checked: boolean) => {
//     if (checked) setSelectedIds(new Set(filteredLogs.map((r) => r.id)));
//     else setSelectedIds(new Set());
//   };

//   const allSelected = filteredLogs.length > 0 && filteredLogs.every((r) => selectedIds.has(r.id));
//   const someSelected = selectedIds.size > 0;
//   const hasActiveSidebarFilters = Object.values(sidebarFilters).some((v) => v !== "" && v !== false);
//   const totalPages = Math.ceil(stats.total / PER_PAGE) || 1;
//   const safePage = Math.min(page, totalPages);

//   const pills = [
//     { key: "all", label: "All", activeStyle: { background: colors.blueBg, color: colors.blue, border: `0.5px solid ${colors.blue}` }, count: stats.total },
//     { key: "sent", label: "Sent", activeStyle: { background: colors.greenBg, color: colors.green, border: `0.5px solid ${colors.green}` }, count: stats.sent },
//     { key: "failed", label: "Failed", activeStyle: { background: colors.redBg, color: colors.red, border: `0.5px solid ${colors.red}` }, count: stats.failed },
//     { key: "pending", label: "Pending", activeStyle: { background: colors.amberBg, color: colors.amber, border: `0.5px solid ${colors.amber}` }, count: stats.pending },
//   ];

//   return (
//     <>
//       <style>{`
//         .swal-custom-popup { border-radius: 12px !important; font-family: 'DM Sans', 'Segoe UI', sans-serif !important; }
//         .swal-confirm-btn { background: #A32D2D !important; color: #fff !important; border: none !important; border-radius: 7px !important; padding: 9px 20px !important; font-size: 13px !important; font-weight: 600 !important; cursor: pointer !important; margin: 0 5px !important; }
//         .swal-cancel-btn { background: #F2F4F8 !important; color: #6B7A99 !important; border: 0.5px solid #E4E8F0 !important; border-radius: 7px !important; padding: 9px 20px !important; font-size: 13px !important; font-weight: 600 !important; cursor: pointer !important; margin: 0 5px !important; }
//       `}</style>

//       <FilterSidebar
//         open={sidebarOpen}
//         onClose={() => setSidebarOpen(false)}
//         filters={sidebarFilters}
//         onApply={(f) => {
//           setSidebarFilters(f);
//           setPage(1);
//           setExpandedId(null);
//         }}
//         onReset={() => {
//           setSidebarFilters(DEFAULT_FILTERS);
//           setPage(1);
//         }}
//       />

//       <div className="font-['DM Sans','Segoe UI',sans-serif]  p-0 md:p-0">
//         {/* Header Buttons */}
//         <div className="flex flex-wrap gap-2 mb-4 justify-end">
//           <button
//             onClick={() => setSidebarOpen(true)}
//             className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold border flex items-center gap-1 ${
//               hasActiveSidebarFilters
//                 ? "bg-[#E6F1FB] text-[#185FA5] border-[#185FA5]"
//                 : "bg-white text-[#6B7A99] border-[#E4E8F0]"
//             }`}
//           >
//             Filters {hasActiveSidebarFilters && "●"}
//           </button>
//           <button
//             onClick={handleExport}
//             disabled={exporting}
//             className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold text-white bg-[#E8601A] disabled:opacity-60"
//             style={{ background: `linear-gradient(135deg, ${colors.primary.from}, ${colors.primary.to})` }}
//           >
//             {exporting ? "Exporting..." : isMobile ? "Export" : "Export Excel"}
//           </button>
//         </div>

//         {/* Stat Cards */}
//      {/* Stat Cards – Gradient UI (matches complaint cards) */}
// <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-4 -mt-5 md:-mt-2 sticky top-24 z-10">
//   {/* Total Communications */}
//   <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-0 shadow-sm p-2 sm:p-3">
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Total Communications</p>
//         <p className="text-sm sm:text-base font-bold text-slate-800">{stats.total}</p>
//       </div>
//       <div className="p-1.5 rounded-lg bg-slate-600">
//         <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
//       </div>
//     </div>
//   </div>

//   {/* Sent / Delivered */}
//   <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-0 shadow-sm p-2 sm:p-3">
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Sent / Delivered</p>
//         <p className="text-sm sm:text-base font-bold text-slate-800">{stats.sent}</p>
//       </div>
//       <div className="p-1.5 rounded-lg bg-green-600">
//         <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
//       </div>
//     </div>
//   </div>

//   {/* Failed */}
//   <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border-0 shadow-sm p-2 sm:p-3">
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Failed</p>
//         <p className="text-sm sm:text-base font-bold text-slate-800">{stats.failed}</p>
//       </div>
//       <div className="p-1.5 rounded-lg bg-red-600">
//         <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
//       </div>
//     </div>
//   </div>

//   {/* Pending */}
//   <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border-0 shadow-sm p-2 sm:p-3">
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Pending</p>
//         <p className="text-sm sm:text-base font-bold text-slate-800">{stats.pending}</p>
//       </div>
//       <div className="p-1.5 rounded-lg bg-yellow-600">
//         <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
//       </div>
//     </div>
//   </div>
// </div>

//         {/* Search + Pills */}
//         <div className="flex flex-wrap items-center gap-1.5 mb-3">
//           <div className="flex items-center gap-1.5 bg-white border border-[#E4E8F0] rounded-lg px-2.5 py-1.5 flex-1 min-w-[120px] md:min-w-[200px]">
//             <input
//               value={search}
//               onChange={handleSearch}
//               placeholder="Search name, email, subject…"
//               className="border-none bg-transparent text-xs text-[#1A2340] outline-none w-full font-inherit"
//             />
//             {search && (
//               <button
//                 onClick={() => {
//                   setSearch("");
//                   setPage(1);
//                 }}
//                 className="border-none bg-transparent text-[#9BA5BF] cursor-pointer text-sm"
//               >
//                 ×
//               </button>
//             )}
//           </div>
//           {!isMobile &&
//             pills.map((p) => (
//               <FilterPill
//                 key={p.key}
//                 label={p.label}
//                 count={p.count}
//                 active={filter === p.key}
//                 activeStyle={p.activeStyle}
//                 onClick={() => handleFilter(p.key)}
//               />
//             ))}
//         </div>

//         {/* Mobile Pills */}
//         {isMobile && (
//           <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
//             {pills.map((p) => (
//               <FilterPill
//                 key={p.key}
//                 label={p.label}
//                 count={p.count}
//                 active={filter === p.key}
//                 activeStyle={p.activeStyle}
//                 onClick={() => handleFilter(p.key)}
//               />
//             ))}
//           </div>
//         )}

//         {/* Bulk Action Bar */}
//         {someSelected && (
//           <div className="flex items-center gap-2.5 bg-[#E6F1FB] border border-[#185FA5] rounded-lg p-2 mb-2.5 flex-wrap">
//             <span className="text-xs font-semibold text-[#185FA5]">
//               {selectedIds.size} record{selectedIds.size > 1 ? "s" : ""} selected
//             </span>
//             <button
//               onClick={handleBulkDelete}
//               disabled={bulkDeleting}
//               className="bg-[#A32D2D] text-white border-none rounded-md px-3 py-1 text-xs font-semibold disabled:opacity-60 flex items-center gap-1"
//             >
//               {bulkDeleting ? "Deleting..." : `Delete ${selectedIds.size}`}
//             </button>
//             <button
//               onClick={() => exportToExcel(logs.filter((r) => selectedIds.has(r.id)), "selected_logs")}
//               className="bg-[#0F6E56] text-white border-none rounded-md px-3 py-1 text-xs font-semibold"
//             >
//               Export Selected
//             </button>
//             <button
//               onClick={() => setSelectedIds(new Set())}
//               className="bg-none border border-[#185FA5] text-[#185FA5] rounded-md px-2.5 py-1 text-xs cursor-pointer ml-auto"
//             >
//               Clear
//             </button>
//           </div>
//         )}

//         {/* Table / Cards */}
//         {isMobile ? (
//           <div>
//             {loading ? (
//               <div className="text-center py-10 text-[#9BA5BF]">Loading...</div>
//             ) : error ? (
//               <div className="text-center py-10 text-[#A32D2D]">{error}</div>
//             ) : filteredLogs.length === 0 ? (
//               <div className="text-center py-10 text-[#9BA5BF]">No records found</div>
//             ) : (
//               filteredLogs.map((row) => (
//                 <MobileCard
//                   key={row.id}
//                   row={row}
//                   isExpanded={expandedId === row.id}
//                   onToggle={() => toggleExpand(row.id)}
//                   onResend={handleResend}
//                   onDelete={handleDelete}
//                   isSelected={selectedIds.has(row.id)}
//                   onSelect={handleSelect}
//                 />
//               ))
//             )}
//           </div>
//         ) : (
//           <div className="bg-white border border-[#E4E8F0] rounded-xl overflow-hidden">
//             <div className="overflow-x-auto  overflow-y-auto max h-[460px] sm:max-h-[450px]">
//               <table className="w-full border-collapse min-w-[960px]">
//                 <thead>
//                   <tr className="bg-[#F8F9FC] border-b border-[#E4E8F0]">
//                     <th className="px-2 py-2 w-9">
//                       <input
//                         type="checkbox"
//                         checked={allSelected}
//                         onChange={(e) => handleSelectAll(e.target.checked)}
//                         className="w-3.5 h-3.5 cursor-pointer"
//                       />
//                     </th>
//                     <th className="w-7" />
//                     <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Recipient</th>
//                     <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Subject</th>
//                     <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Type</th>
//                     <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap w-[90px]">Status</th>
//                     <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Channel</th>
//                     <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Sent At</th>
//                     <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap w-[70px]">Retries</th>
//                     <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Remark</th>
//                     <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap w-[120px]">Actions</th>
//                   </tr>
//                   <tr className="bg-[#FAFBFE] border-b border-[#E4E8F0]">
//                     <td colSpan={2} />
//                     <td className="px-3 py-1">
//                       <ColumnSearch value={colSearch.recipient} onChange={(v) => setColSearch((p) => ({ ...p, recipient: v }))} placeholder="Search…" />
//                     </td>
//                     <td className="px-3 py-1">
//                       <ColumnSearch value={colSearch.subject} onChange={(v) => setColSearch((p) => ({ ...p, subject: v }))} placeholder="Search…" />
//                     </td>
//                     <td className="px-3 py-1">
//                       <ColumnSearch value={colSearch.type} onChange={(v) => setColSearch((p) => ({ ...p, type: v }))} placeholder="Search…" />
//                     </td>
//                     <td />
//                     <td className="px-3 py-1">
//                       <ColumnSearch value={colSearch.channel} onChange={(v) => setColSearch((p) => ({ ...p, channel: v }))} placeholder="Search…" />
//                     </td>
//                     <td className="px-3 py-1">
//                       <ColumnSearch value={colSearch.sentAt} onChange={(v) => setColSearch((p) => ({ ...p, sentAt: v }))} placeholder="Search…" />
//                     </td>
//                     <td />
//                     <td className="px-3 py-1">
//                       <ColumnSearch value={colSearch.remark} onChange={(v) => setColSearch((p) => ({ ...p, remark: v }))} placeholder="Search…" />
//                     </td>
//                     <td />
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td colSpan={11} className="text-center py-10 text-[#9BA5BF]">
//                         Loading...
//                       </td>
//                     </tr>
//                   ) : error ? (
//                     <tr>
//                       <td colSpan={11} className="text-center py-10 text-[#A32D2D]">
//                         {error}
//                       </td>
//                     </tr>
//                   ) : filteredLogs.length === 0 ? (
//                     <tr>
//                       <td colSpan={11} className="text-center py-10 text-[#9BA5BF]">
//                         No records found
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredLogs.map((row) => (
//                       <EmailRow
//                         key={row.id}
//                         row={row}
//                         isExpanded={expandedId === row.id}
//                         onToggle={() => toggleExpand(row.id)}
//                         onResend={handleResend}
//                         onDelete={handleDelete}
//                         isSelected={selectedIds.has(row.id)}
//                         onSelect={handleSelect}
//                       />
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             {!loading && totalPages > 1 && (
//               <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-[#E4E8F0] text-xs text-[#6B7A99] flex-wrap gap-2">
//                 <span>
//                   {filteredLogs.length > 0
//                     ? `Showing ${(safePage - 1) * PER_PAGE + 1}–${Math.min(safePage * PER_PAGE, stats.total)} of ${stats.total} records`
//                     : "No records"}
//                 </span>
//                 <div className="flex gap-1">
//                   <button
//                     onClick={() => setPage((p) => Math.max(1, p - 1))}
//                     disabled={page === 1}
//                     className="px-2.5 py-1 border border-[#E4E8F0] rounded-md bg-white disabled:opacity-50 text-xs"
//                   >
//                     ‹ Prev
//                   </button>
//                   <span className="px-2.5 py-1">
//                     Page {page} of {totalPages}
//                   </span>
//                   <button
//                     onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                     disabled={page === totalPages}
//                     className="px-2.5 py-1 border border-[#E4E8F0] rounded-md bg-white disabled:opacity-50 text-xs"
//                   >
//                     Next ›
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Mobile Pagination */}
//         {isMobile && !loading && totalPages > 1 && (
//           <div className="flex justify-center gap-2 mt-3">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="px-3.5 py-1.5 border border-[#E4E8F0] rounded-md bg-white disabled:opacity-50 text-xs"
//             >
//               ‹ Prev
//             </button>
//             <span className="px-2.5 py-1.5 text-xs text-[#6B7A99]">
//               {page} / {totalPages}
//             </span>
//             <button
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               disabled={page === totalPages}
//               className="px-3.5 py-1.5 border border-[#E4E8F0] rounded-md bg-white disabled:opacity-50 text-xs"
//             >
//               Next ›
//             </button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }



"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getCommunicationLogs,
  getCommunicationStatistics,
  exportCommunicationLogs,
  resendCommunication,
  deleteCommunicationLog,
  type CommunicationLog,
} from "@/lib/communicationLogApi";
import { AlertCircle, CheckCircle, ChevronRight, Clock, FileText } from "lucide-react";
import * as XLSX from 'xlsx';

import Swal from 'sweetalert2';
// ─────────────────────────────────────────────────────────────────────────────
// THEME CONSTANTS (matching Category Mapping Form)
// ─────────────────────────────────────────────────────────────────────────────
const colors = {
  primary: {
    from: "#1A2B6D",
    to: "#3B5BDB",
  },
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
  orange: "#E8601A",
  slate: "#64748B",
  slateBg: "#F1F5F9",
};

const AVATAR_COLORS = [
  { bg: "#E6F1FB", c: "#185FA5" },
  { bg: "#E1F5EE", c: "#0F6E56" },
  { bg: "#EEEDFE", c: "#3C3489" },
  { bg: "#FAEEDA", c: "#854F0B" },
  { bg: "#FCEBEB", c: "#A32D2D" },
  { bg: "#EAF3DE", c: "#3B6D11" },
  { bg: "#FAECE7", c: "#993C1D" },
  { bg: "#FBEAF0", c: "#993556" },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
  (name || "U")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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

// Excel export using CSV with BOM
const exportToExcel = (logs: CommunicationLog[], filename = "communication_logs") => {
  const rows = logs.map((row) => ({
    "ID": row.id,
    "Recipient Name": row.recipient_name || "",
    "Recipient Email": row.recipient_email || "",
    "Recipient Phone": row.recipient_phone || "",
    "Subject": row.subject || "",
    "Type": row.communication_type || "",
    "Status": row.status || "",
    "Channel": row.channel || "",
    "Sent At": row.sent_at || "",
    "Created At": row.created_at || "",
    "Retries": row.retries,
    "Template": row.template_name || "",
    "Property": row.property_name || "",
    "Tenant": row.tenant_name || "",
    "Error": row.error_message || "",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Logs");
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

// ─────────────────────────────────────────────────────────────────────────────
// SWEET ALERT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// SweetAlert2 bulk delete confirmation — styled like image 6
const confirmBulkDelete = async (count: number): Promise<boolean> => {
  const result = await Swal.fire({
    html: `
      <div style="text-align:center;padding:12px 0 4px">
        <div style="width:64px;height:64px;border-radius:50%;border:3px solid #E8601A;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
          <span style="font-size:28px;color:#E8601A;font-weight:700;line-height:1">!</span>
        </div>
        <div style="font-size:18px;font-weight:700;color:#1A2340;margin-bottom:10px">Are you sure?</div>
        <p style="color:#6B7A99;font-size:13px;line-height:1.6;margin:0">
          You are about to delete <strong style="color:#1A2340">${count} communication log${count > 1 ? "s" : ""}</strong>.<br/>
          This action <strong style="color:#A32D2D">cannot be undone!</strong>
        </p>
      </div>`,
    showCancelButton: true,
    confirmButtonText: `Yes, delete ${count} record${count > 1 ? "s" : ""}!`,
    cancelButtonText: "Cancel",
    customClass: {
      popup: "swal-custom-popup",
      confirmButton: "swal-confirm-btn",
      cancelButton: "swal-cancel-btn",
    },
    buttonsStyling: false,
    width: 380,
  });
  return result.isConfirmed;
};

// Single delete confirmation — same style
const confirmSingleDelete = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete 1 communication log. This action cannot be undone!`,
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
  return result.isConfirmed;
};

// Resend confirmation with SweetAlert
const confirmResend = async (): Promise<boolean> => {
  if (typeof Swal === "undefined") {
    return window.confirm("Are you sure you want to resend this communication?");
  }
  const result = await Swal.fire({
    title: `<span style="font-size:18px;font-weight:700;color:#1A2340">Resend Communication?</span>`,
    html: `
      <div style="text-align:center;padding:4px 0">
        <p style="color:#6B7A99;font-size:13px;line-height:1.6;margin:0">
          This will attempt to resend the communication to the recipient.
        </p>
      </div>`,
    showCancelButton: true,
    confirmButtonText: "Yes, Resend",
    cancelButtonText: "Cancel",
    customClass: {
      popup: "swal-custom-popup",
      confirmButton: "swal-confirm-btn",
      cancelButton: "swal-cancel-btn",
    },
    buttonsStyling: false,
    width: 360,
  });
  return result.isConfirmed;
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS (Tailwind + icons)
// ─────────────────────────────────────────────────────────────────────────────
function Badge({ variant = "success", children }: { variant?: string; children: React.ReactNode }) {
  const styles: Record<string, { bg: string; text: string }> = {
    success: { bg: colors.greenBg, text: colors.green },
    failed: { bg: colors.redBg, text: colors.red },
    pending: { bg: colors.amberBg, text: colors.amber },
    sent: { bg: colors.greenBg, text: colors.green },
    delivered: { bg: colors.greenBg, text: colors.green },
  };
  const s = styles[variant] || styles.success;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {children}
    </span>
  );
}

function MiniBar({ pct, color: barColor = colors.greenLine }: { pct: number; color?: string }) {
  return (
    <div className="h-1 rounded-sm overflow-hidden w-full mt-1" style={{ backgroundColor: colors.border }}>
      <div className="h-full rounded-sm transition-all duration-400" style={{ width: `${pct}%`, backgroundColor: barColor }} />
    </div>
  );
}

function Avatar({ name, id }: { name: string; id: number }) {
  const av = getAvatar(id);
  return (
    <span
      className="w-7 h-7 rounded-full inline-flex items-center justify-center text-[9px] font-bold shrink-0 mr-2"
      style={{ backgroundColor: av.bg, color: av.c }}
    >
      {getInitials(name)}
    </span>
  );
}

function StatCard({
  num,
  label,
  pct,
  barColor,
  textColor,
}: {
  num: number;
  label: string;
  pct?: number;
  barColor?: string;
  textColor?: string;
}) {
  return (
    <div className="bg-white border border-[#E4E8F0] rounded-lg p-2.5 flex-1 min-w-0 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-[#6B7A99] mb-0.5 whitespace-nowrap">{label}</div>
          <div className="text-xl font-bold leading-tight" style={{ color: textColor || colors.text }}>
            {num.toLocaleString()}
          </div>
        </div>
      </div>
      {pct !== undefined && <MiniBar pct={pct} color={barColor} />}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  count,
  activeStyle,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  activeStyle: any;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-all font-inherit border whitespace-nowrap ${
        active ? "" : "bg-[#F2F4F8] text-[#6B7A99] border-[#E4E8F0]"
      }`}
      style={active ? activeStyle : undefined}
    >
      {label}
      {count !== undefined && (
        <span
          className={`rounded-full text-[10px] px-1 font-semibold ${
            active ? "bg-white/35" : "bg-[#E4E8F0] text-[#6B7A99]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function ColumnSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative flex items-center">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-1.5 py-1 pr-6 text-[10px] border border-[#E4E8F0] rounded-md bg-[#FAFBFE] text-[#1A2340] outline-none font-inherit"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-1 border-none bg-transparent text-[#9BA5BF] cursor-pointer text-xs leading-none p-0"
        >
          ×
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER SIDEBAR (Tailwind version)
// ─────────────────────────────────────────────────────────────────────────────
interface FilterState {
  status: string;
  channel: string;
  communicationType: string;
  hasRetries: boolean;
   dateFrom: string;  // ← add
  dateTo: string;
  ignoreDateFilter: boolean;
  
}

function FilterSidebar({
  open,
  onClose,
  filters,
  onApply,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (f: FilterState) => void;
  onReset: () => void;
}) {
  const [local, setLocal] = useState<FilterState>(filters);
  useEffect(() => {
    setLocal(filters);
  }, [filters, open]);

const set = (k: keyof FilterState, v: any) => {
  const updated = { ...local, [k]: v };
  setLocal(updated);
  onApply(updated);  // ← fires immediately, triggers loadLogs
};

  const selectClasses =
    "w-full px-2.5 py-1.5 border border-[#E4E8F0] rounded-md bg-white text-xs text-[#1A2340] outline-none cursor-pointer font-inherit";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/35 z-[199] transition-opacity duration-250 backdrop-blur-sm ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[min(340px,90vw)] bg-white shadow-[-4px_0_24px_rgba(26,35,64,0.12)] z-[200] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E8F0] bg-gradient-to-r from-[#1A2B6D] to-[#3B5BDB] text-white">
          <div >
            <div className="text-sm font-bold text-white">Filter Logs</div>
            <div className="text-[10px] text-white mt-0.5">Narrow down results</div>
          </div>
          <button onClick={onClose} className="border-none bg-transparent cursor-pointer text-xl text-[#9BA5BF] leading-none">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-3.5">
            <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">Status</label>
            <select value={local.status} onChange={(e) => set("status", e.target.value)} className={selectClasses}>
              <option value="">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="mb-3.5">
            <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">Channel</label>
            <select value={local.channel} onChange={(e) => set("channel", e.target.value)} className={selectClasses}>
              <option value="">All Channels</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <div className="mb-3.5">
            <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">
              Communication Type
            </label>
            <select
              value={local.communicationType}
              onChange={(e) => set("communicationType", e.target.value)}
              className={selectClasses}
            >
              <option value="">All Types</option>
              <option value="rent_reminder">Rent Reminder</option>
              <option value="maintenance_update">Maintenance Update</option>
              <option value="notice">Notice</option>
              <option value="welcome">Welcome</option>
              <option value="credentials">Credentials</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-3.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={local.hasRetries}
                onChange={(e) => set("hasRetries", e.target.checked)}
                className="w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-xs text-[#1A2340]">Show only records with retries</span>
            </label>
          </div>




{!local.ignoreDateFilter && (
  <>
    <div className="mb-3.5">
      <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">Date From</label>
      <input type="date" value={local.dateFrom} onChange={(e) => set("dateFrom", e.target.value)}
        className="w-full px-2.5 py-1.5 border border-[#E4E8F0] rounded-md bg-white text-xs text-[#1A2340] outline-none font-inherit" />
    </div>
    <div className="mb-3.5">
      <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">Date To</label>
      <input type="date" value={local.dateTo} onChange={(e) => set("dateTo", e.target.value)}
        className="w-full px-2.5 py-1.5 border border-[#E4E8F0] rounded-md bg-white text-xs text-[#1A2340] outline-none font-inherit" />
    </div>
  </>
)}

<div className="mb-3.5">
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={local.ignoreDateFilter}
      onChange={(e) => set("ignoreDateFilter", e.target.checked)}
      className="w-3.5 h-3.5 cursor-pointer"
    />
    <span className="text-xs text-[#1A2340]">Ignore date filter</span>
  </label>
</div>
        </div>


        <div className="p-4 border-t border-[#E4E8F0] flex gap-2">
          <button
            onClick={onReset}
            className="flex-1 py-2 border border-[#E4E8F0] rounded-md bg-[#F2F4F8] text-[#6B7A99] text-xs font-semibold cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={() => {
              onApply(local);
              onClose();
            }}
            className="flex-[2] py-2 rounded-md text-xs font-semibold cursor-pointer text-white"
            style={{ background: `linear-gradient(135deg, ${colors.primary.from}, ${colors.primary.to})` }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPANDED ROW (Desktop)
// ─────────────────────────────────────────────────────────────────────────────
function ExpandedRow({ row }: { row: CommunicationLog }) {
  const isOk = row.status === "sent" || row.status === "delivered";
  return (
    <tr>
      <td colSpan={11} className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 p-3.5 bg-[#F8F9FC] border-t border-[#E4E8F0]">
          <div>
            <div className="text-[9px] font-bold text-[#6B7A99] uppercase tracking-wide mb-1.5">Delivery Timeline</div>
            <div className="text-xs text-[#1A2340] space-y-1">
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Sent</span> {formatDate(row.sent_at)}
              </div>
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Delivered</span>{" "}
                <span className={isOk ? "text-[#0F6E56]" : "text-[#A32D2D]"}>
                  {formatDate((row as any).delivered_at) || formatDate(row.sent_at)}
                </span>
              </div>
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Created</span> {formatDate(row.created_at)}
              </div>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-[#6B7A99] uppercase tracking-wide mb-1.5">Contact Info</div>
            <div className="text-xs text-[#1A2340] space-y-1">
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Name</span> {row.recipient_name || "—"}
              </div>
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Email</span> {row.recipient_email}
              </div>
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Phone</span> {row.recipient_phone || "—"}
              </div>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-[#6B7A99] uppercase tracking-wide mb-1.5">Details</div>
            <div className="text-xs text-[#1A2340] space-y-1">
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Retries</span> {row.retries}
              </div>
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Template</span> {row.template_name || "—"}
              </div>
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Property</span> {row.property_name || "—"}
              </div>
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Tenant</span> {row.tenant_name || "—"}
              </div>
            </div>
            {row.status === "failed" && row.error_message && (
              <div className="mt-2 p-2 rounded-md text-xs text-[#A32D2D]" style={{ backgroundColor: colors.redBg }}>
                <strong>Error:</strong> {row.error_message}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE ROW (Desktop & Mobile responsive)
// ─────────────────────────────────────────────────────────────────────────────
function EmailRow({
  row,
  isExpanded,
  onToggle,
  onResend,
  onDelete,
  isSelected,
  onSelect,
}: {
  row: CommunicationLog;
  isExpanded: boolean;
  onToggle: () => void;
  onResend: (id: number) => void;
  onDelete: (id: number) => void;
  isSelected: boolean;
  onSelect: (id: number, checked: boolean) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const statusBadge = {
    sent: <Badge variant="success">Sent</Badge>,
    delivered: <Badge variant="success">Delivered</Badge>,
    failed: <Badge variant="failed">Failed</Badge>,
    pending: <Badge variant="pending">Pending</Badge>,
  }[row.status] || <Badge variant="pending">{row.status}</Badge>;

  const remarkText = row.error_message || row.subject || "—";
  const remarkColor =
    row.status === "failed" ? colors.red : row.status === "pending" ? colors.amber : colors.textSub;

  const bgClass = isSelected
    ? "bg-[#E6F1FB]"
    : hovered || isExpanded
    ? "bg-[#F5F7FB]"
    : "bg-transparent";

  return (
    <>
      <tr
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="cursor-pointer border-b border-[#EEF0F5]"
      >
        <td className={`${bgClass} px-2 py-2 align-middle w-7 text-center`} onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(row.id, e.target.checked)}
            className="w-3.5 h-3.5 cursor-pointer"
          />
        </td>
       <td className={`${bgClass} px-1 py-2 align-middle w-7 text-center`}>
  <ChevronRight
    size={12}
    className={`inline-block text-[#9BA5BF] transition-transform ${
      isExpanded ? "rotate-90" : "rotate-0"
    }`}
  />
</td>
        <td className={`${bgClass} px-3 py-2 align-middle max-w-[150px]`}>
          <div className="flex items-center">
            <Avatar name={row.recipient_name || row.recipient_email} id={row.id} />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#1A2340] truncate">{row.recipient_name || "—"}</div>
              <div className="text-[10px] text-[#6B7A99] truncate">{row.recipient_email}</div>
            </div>
          </div>
        </td>
        <td className={`${bgClass} px-3 py-2 align-middle text-xs text-[#1A2340] max-w-[160px]`}>
          <span title={row.subject || ""}>{trunc(row.subject, 30) || "—"}</span>
        </td>
        <td className={`${bgClass} px-3 py-2 align-middle text-xs text-[#6B7A99] whitespace-nowrap`}>
          {row.communication_type?.replace(/_/g, " ") || "—"}
        </td>
        <td className={`${bgClass} px-3 py-2 align-middle whitespace-nowrap`}>{statusBadge}</td>
        <td className={`${bgClass} px-3 py-2 align-middle text-center text-xs`}>
          <span className="text-[10px] text-[#6B7A99]">{row.channel}</span>
        </td>
        <td className={`${bgClass} px-3 py-2 align-middle text-xs text-[#6B7A99] whitespace-nowrap`}>
          {formatDate(row.sent_at)}
        </td>
        <td className={`${bgClass} px-3 py-2 align-middle text-center`}>
          {row.retries > 0 ? <Badge variant="failed">{row.retries}x</Badge> : <span className="text-[10px] text-[#9BA5BF]">0</span>}
        </td>
        <td className={`${bgClass} px-3 py-2 align-middle text-[10px] max-w-[140px]`} style={{ color: remarkColor }}>
          <span title={remarkText}>{trunc(remarkText, 32)}</span>
        </td>
        <td className={`${bgClass} px-3 py-2 align-middle text-center whitespace-nowrap`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResend(row.id);
            }}
            disabled={row.status !== "failed"}
            className={`text-[10px] px-2 py-1 rounded-md border mr-1.5 font-inherit ${
              row.status === "failed"
                ? "border-[#A32D2D] text-[#A32D2D] cursor-pointer"
                : "border-[#E4E8F0] text-[#9BA5BF] cursor-not-allowed"
            } bg-none`}
          >
            Retry
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row.id);
            }}
            className="text-[10px] px-2 py-1 rounded-md border border-[#E4E8F0] text-[#9BA5BF] cursor-pointer bg-none font-inherit"
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
const DEFAULT_FILTERS: FilterState = {
  status: "",
  channel: "",
  communicationType: "",
  hasRetries: false,
  dateFrom: "", dateTo: "",
  ignoreDateFilter: false,
};

export default function EmailHistory() {
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, pending: 0 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [colSearch, setColSearch] = useState({
    recipient: "",
    subject: "",
    type: "",
    channel: "",
    sentAt: "",
    remark: "",
  });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const PER_PAGE = 10;

  // Client-side filtering: combine main search and column searches
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Main search filter (name, email, subject)
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          (row.recipient_name && row.recipient_name.toLowerCase().includes(term)) ||
          (row.recipient_email && row.recipient_email.toLowerCase().includes(term)) ||
          (row.subject && row.subject.toLowerCase().includes(term))
      );
    }

    // Column search filters
    if (colSearch.recipient) {
      const term = colSearch.recipient.toLowerCase();
      filtered = filtered.filter((row) =>
        `${row.recipient_name || ""} ${row.recipient_email || ""}`.toLowerCase().includes(term)
      );
    }
    if (colSearch.subject) {
      const term = colSearch.subject.toLowerCase();
      filtered = filtered.filter((row) => (row.subject || "").toLowerCase().includes(term));
    }
    if (colSearch.type) {
      const term = colSearch.type.toLowerCase();
      filtered = filtered.filter((row) => (row.communication_type || "").toLowerCase().includes(term));
    }
    if (colSearch.channel) {
      const term = colSearch.channel.toLowerCase();
      filtered = filtered.filter((row) => (row.channel || "").toLowerCase().includes(term));
    }
    if (colSearch.sentAt) {
      const term = colSearch.sentAt.toLowerCase();
      filtered = filtered.filter((row) => formatDate(row.sent_at).toLowerCase().includes(term));
    }
    if (colSearch.remark) {
      const term = colSearch.remark.toLowerCase();
      filtered = filtered.filter((row) =>
        `${row.error_message || ""} ${row.subject || ""}`.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [logs, search, colSearch]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Build filters — use snake_case keys that match the API interface
      const apiFilters: Record<string, any> = {
        page,
        limit: PER_PAGE,
      };

      if (search) apiFilters.search = search;

      // Status: sidebar filter takes priority over pill filter
      if (sidebarFilters.status) {
        apiFilters.status = sidebarFilters.status;
      } else if (filter !== "all") {
        apiFilters.status = filter;
      }

      // Channel — send as-is (email / whatsapp / sms)
      if (sidebarFilters.channel) {
        apiFilters.channel = sidebarFilters.channel;
      }

      // Communication type — API expects snake_case key
      if (sidebarFilters.communicationType) {
        apiFilters.communication_type = sidebarFilters.communicationType;
      }

      // Retries
      if (sidebarFilters.hasRetries) {
        apiFilters.has_retries = true;
      }

      if (!sidebarFilters.ignoreDateFilter) {
  if (sidebarFilters.dateFrom) apiFilters.dateFrom = sidebarFilters.dateFrom;
  if (sidebarFilters.dateTo) apiFilters.dateTo = sidebarFilters.dateTo;
}

      

      const response = await getCommunicationLogs(apiFilters);
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
  }, [page, search, filter, sidebarFilters]);

  const loadStats = useCallback(async () => {
    try {
      const response = await getCommunicationStatistics();
      if (response.success) {
        setStats({
          total: response.data.total || 0,
          sent: response.data.sent || 0,
          failed: response.data.failed || 0,
          pending: response.data.pending || 0,
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
    const confirmed = await confirmResend();
    if (!confirmed) return;
    try {
      await resendCommunication(id);
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Resent!",
          text: "Communication has been resent successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-custom-popup" },
        });
      } else {
        alert("Resent successfully!");
      }
      loadLogs();
    } catch (err: any) {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Error!",
          text: err.message || "Failed to resend",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-custom-popup" },
        });
      } else {
        alert(err.message || "Failed to resend");
      }
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirmSingleDelete();
    if (!confirmed) return;
    try {
      await deleteCommunicationLog(id);
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Deleted!",
          text: "Log deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-custom-popup" },
        });
      }
      loadLogs();
      loadStats();
    } catch (err: any) {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Error!",
          text: err.message || "Failed to delete",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-custom-popup" },
        });
      } else {
        alert(err.message || "Failed to delete");
      }
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    const confirmed = await confirmBulkDelete(count);
    if (!confirmed) return;

    setBulkDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteCommunicationLog(id)));
      setSelectedIds(new Set());
      loadLogs();
      loadStats();
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Deleted!",
          text: `${count} record${count > 1 ? "s" : ""} deleted successfully.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-custom-popup" },
        });
      }
    } catch (err: any) {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Error!",
          text: err.message || "Bulk delete failed",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-custom-popup" },
        });
      } else {
        alert(err.message || "Bulk delete failed");
      }
    } finally {
      setBulkDeleting(false);
    }
  };

 const handleExport = async () => {
  setExporting(true);
  try {
    exportToExcel(logs, "communication_logs");
  } catch (err: any) {
    alert(err.message || "Export failed");
  } finally {
    setExporting(false);
  }
};

  const handleFilter = (f: string) => {
    setFilter(f);
    setPage(1);
    setExpandedId(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    setExpandedId(null);
  };

  const toggleExpand = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

  const handleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(filteredLogs.map((r) => r.id)));
    else setSelectedIds(new Set());
  };

  const allSelected = filteredLogs.length > 0 && filteredLogs.every((r) => selectedIds.has(r.id));
  const someSelected = selectedIds.size > 0;
  const hasActiveSidebarFilters = Object.values(sidebarFilters).some((v) => v !== "" && v !== false);
  const totalPages = Math.ceil(stats.total / PER_PAGE) || 1;
  const safePage = Math.min(page, totalPages);

  const pills = [
    {
      key: "all",
      label: "All",
      activeStyle: { background: colors.blueBg, color: colors.blue, border: `0.5px solid ${colors.blue}` },
      count: stats.total,
    },
    {
      key: "sent",
      label: "Sent",
      activeStyle: { background: colors.greenBg, color: colors.green, border: `0.5px solid ${colors.green}` },
      count: stats.sent,
    },
    {
      key: "failed",
      label: "Failed",
      activeStyle: { background: colors.redBg, color: colors.red, border: `0.5px solid ${colors.red}` },
      count: stats.failed,
    },
    {
      key: "pending",
      label: "Pending",
      activeStyle: { background: colors.amberBg, color: colors.amber, border: `0.5px solid ${colors.amber}` },
      count: stats.pending,
    },
  ];

  // Reduce table height when bulk action bar is visible
  const tableMaxHeight = someSelected ? "max-h-[360px] sm:max-h-[200px]" : "max-h-[380px] sm:max-h-[450px]";

  return (
    <>
      <style>{`
        .swal-custom-popup { border-radius: 14px !important; font-family: 'DM Sans', 'Segoe UI', sans-serif !important; padding: 28px 24px 24px !important; }
        .swal-confirm-btn { background: #A32D2D !important; color: #fff !important; border: none !important; border-radius: 8px !important; padding: 10px 22px !important; font-size: 13px !important; font-weight: 600 !important; cursor: pointer !important; margin: 0 5px !important; }
        .swal-cancel-btn { background: #4B5563 !important; color: #fff !important; border: none !important; border-radius: 8px !important; padding: 10px 22px !important; font-size: 13px !important; font-weight: 600 !important; cursor: pointer !important; margin: 0 5px !important; }
        .swal2-actions { gap: 8px !important; margin-top: 20px !important; }
      `}</style>

      <FilterSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        filters={sidebarFilters}
        onApply={(f) => {
          setSidebarFilters(f);
          setPage(1);
          setExpandedId(null);
        }}
        onReset={() => {
          setSidebarFilters(DEFAULT_FILTERS);
          setPage(1);
        }}
      />

      <div className="font-['DM Sans','Segoe UI',sans-serif] p-0 md:p-0">
        {/* Header Buttons */}
        <div className="flex flex-wrap gap-2 mb-4 justify-end -mt-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold border flex items-center gap-1 ${
              hasActiveSidebarFilters
                ? "bg-[#E6F1FB] text-[#185FA5] border-[#185FA5]"
                : "bg-white text-[#6B7A99] border-[#E4E8F0]"
            }`}
          >
            Filters {hasActiveSidebarFilters && "●"}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${colors.primary.from}, ${colors.primary.to})` }}
          >
            {exporting ? "Exporting..." : "Export Excel"}
          </button>
        </div>

        {/* Stat Cards – Gradient UI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-4  md:-mt-2 sticky top-0 z-10">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-0 shadow-sm p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Total Communications</p>
                <p className="text-sm sm:text-base font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-600">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-0 shadow-sm p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Sent / Delivered</p>
                <p className="text-sm sm:text-base font-bold text-slate-800">{stats.sent}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-green-600">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border-0 shadow-sm p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Failed</p>
                <p className="text-sm sm:text-base font-bold text-slate-800">{stats.failed}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-red-600">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border-0 shadow-sm p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Pending</p>
                <p className="text-sm sm:text-base font-bold text-slate-800">{stats.pending}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-yellow-600">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search + Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <div className="flex items-center gap-1.5 bg-white border border-[#E4E8F0] rounded-lg px-2.5 py-1.5 flex-1 min-w-[120px] md:min-w-[200px]">
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search name, email, subject…"
              className="border-none bg-transparent text-xs text-[#1A2340] outline-none w-full font-inherit"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="border-none bg-transparent text-[#9BA5BF] cursor-pointer text-sm"
              >
                ×
              </button>
            )}
          </div>
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

        {/* Bulk Action Bar */}
        {someSelected && (
          <div className="flex items-center gap-2.5 bg-[#E6F1FB] border border-[#185FA5] rounded-lg p-2 mb-2.5 flex-wrap">
            <span className="text-xs font-semibold text-[#185FA5]">
              {selectedIds.size} record{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="bg-[#A32D2D] text-white border-none rounded-md px-3 py-1 text-xs font-semibold disabled:opacity-60 flex items-center gap-1"
            >
              {bulkDeleting ? "Deleting..." : `Delete ${selectedIds.size}`}
            </button>
            <button
              onClick={() => exportToExcel(logs.filter((r) => selectedIds.has(r.id)), "selected_logs")}
              className="bg-[#0F6E56] text-white border-none rounded-md px-3 py-1 text-xs font-semibold"
            >
              Export Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="bg-none border border-[#185FA5] text-[#185FA5] rounded-md px-2.5 py-1 text-xs cursor-pointer ml-auto"
            >
              Clear
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-[#E4E8F0] rounded-xl overflow-hidden">
          {/* Dynamic max-height: smaller when bulk bar is visible */}
          <div className={`overflow-x-auto overflow-y-auto ${tableMaxHeight} transition-all duration-200`}>
            <table className="w-full border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-[#F8F9FC] border-b border-[#E4E8F0]">
                  <th className="px-2 py-2 w-9">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-3.5 h-3.5 cursor-pointer"
                    />
                  </th>
                  <th className="w-7" />
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Recipient</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Subject</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Type</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap w-[90px]">Status</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Channel</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Sent At</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap w-[70px]">Retries</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Remark</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap w-[120px]">Actions</th>
                </tr>
                <tr className="bg-[#FAFBFE] border-b border-[#E4E8F0]">
                  <td colSpan={2} />
                  <td className="px-3 py-1">
                    <ColumnSearch
                      value={colSearch.recipient}
                      onChange={(v) => setColSearch((p) => ({ ...p, recipient: v }))}
                      placeholder="Search…"
                    />
                  </td>
                  <td className="px-3 py-1">
                    <ColumnSearch
                      value={colSearch.subject}
                      onChange={(v) => setColSearch((p) => ({ ...p, subject: v }))}
                      placeholder="Search…"
                    />
                  </td>
                  <td className="px-3 py-1">
                    <ColumnSearch
                      value={colSearch.type}
                      onChange={(v) => setColSearch((p) => ({ ...p, type: v }))}
                      placeholder="Search…"
                    />
                  </td>
                  <td />
                  <td className="px-3 py-1">
                    <ColumnSearch
                      value={colSearch.channel}
                      onChange={(v) => setColSearch((p) => ({ ...p, channel: v }))}
                      placeholder="Search…"
                    />
                  </td>
                  <td className="px-3 py-1">
                    <ColumnSearch
                      value={colSearch.sentAt}
                      onChange={(v) => setColSearch((p) => ({ ...p, sentAt: v }))}
                      placeholder="Search…"
                    />
                  </td>
                  <td />
                  <td className="px-3 py-1">
                    <ColumnSearch
                      value={colSearch.remark}
                      onChange={(v) => setColSearch((p) => ({ ...p, remark: v }))}
                      placeholder="Search…"
                    />
                  </td>
                  <td />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-[#9BA5BF]">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-[#A32D2D]">
                      {error}
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-[#9BA5BF]">
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((row) => (
                    <EmailRow
                      key={row.id}
                      row={row}
                      isExpanded={expandedId === row.id}
                      onToggle={() => toggleExpand(row.id)}
                      onResend={handleResend}
                      onDelete={handleDelete}
                      isSelected={selectedIds.has(row.id)}
                      onSelect={handleSelect}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-[#E4E8F0] text-xs text-[#6B7A99] flex-wrap gap-2">
              <span>
                {filteredLogs.length > 0
                  ? `Showing ${(safePage - 1) * PER_PAGE + 1}–${Math.min(safePage * PER_PAGE, stats.total)} of ${stats.total} records`
                  : "No records"}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 border border-[#E4E8F0] rounded-md bg-white disabled:opacity-50 text-xs"
                >
                  ‹ Prev
                </button>
                <span className="px-2.5 py-1">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1 border border-[#E4E8F0] rounded-md bg-white disabled:opacity-50 text-xs"
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}