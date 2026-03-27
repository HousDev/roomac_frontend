// app/admin/support-tickets/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button }        from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge }         from "@/components/ui/badge";
import { Checkbox }      from "@/components/ui/checkbox";
import { Input }         from "@/components/ui/input";
import { Textarea }      from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye, AlertCircle, Loader2, RefreshCw, User, Phone, Mail,
  Calendar, MessageSquare, FileText, ArrowUpDown, MoreVertical,
  CheckCircle, XCircle, Clock, X, Send, Headphones, Tag,
} from "lucide-react";
import {
  getAllSupportTickets,
  getSupportTicketById,
  updateSupportTicketStatus,
  bulkDeleteSupportTickets,
  type SupportTicket,
} from "@/lib/supportTicketsApi";
import { toast } from "sonner";

// ─── Category / Priority helpers ──────────────────────────────────────────────

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  payments:    { label: "Payments & Billing",   color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  maintenance: { label: "Maintenance & Repairs", color: "bg-orange-100  text-orange-800  border-orange-200"  },
  documents:   { label: "Documents",             color: "bg-purple-100  text-purple-800  border-purple-200"  },
  account:     { label: "Account & Profile",     color: "bg-blue-100    text-blue-800    border-blue-200"    },
  leave:       { label: "Leave & Vacating",      color: "bg-yellow-100  text-yellow-800  border-yellow-200"  },
  general:     { label: "General Inquiry",       color: "bg-gray-100    text-gray-800    border-gray-200"    },
};

const CATEGORIES = [
  { value: "payments",    label: "Payments & Billing"   },
  { value: "maintenance", label: "Maintenance & Repairs" },
  { value: "documents",   label: "Documents"             },
  { value: "account",     label: "Account & Profile"     },
  { value: "leave",       label: "Leave & Vacating"      },
  { value: "general",     label: "General Inquiry"       },
];

function getPriorityBadge(priority: string) {
  const map: Record<string, string> = {
    low:    "bg-green-100  text-green-800  border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high:   "bg-orange-100 text-orange-800 border-orange-200",
    urgent: "bg-red-100    text-red-800    border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${map[priority] || map.medium}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    open:        "bg-red-100    text-red-800    border-red-200",
    in_progress: "bg-blue-100   text-blue-800   border-blue-200",
    resolved:    "bg-green-100  text-green-800  border-green-200",
    closed:      "bg-gray-100   text-gray-600   border-gray-200",
  };
  const labels: Record<string, string> = {
    open: "Open", in_progress: "In Progress", resolved: "Resolved", closed: "Closed",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${map[status] || map.open}`}>
      {labels[status] || status}
    </span>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case "open":        return <Clock       className="h-3.5 w-3.5 text-red-500"   />;
    case "in_progress": return <Loader2     className="h-3.5 w-3.5 text-blue-500 animate-spin" />;
    case "resolved":    return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
    case "closed":      return <XCircle     className="h-3.5 w-3.5 text-gray-400"  />;
    default:            return <Clock       className="h-3.5 w-3.5 text-gray-400"  />;
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets]           = useState<SupportTicket[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  // dialogs
  const [selected, setSelected]             = useState<SupportTicket | null>(null);
  const [showView, setShowView]             = useState(false);
  const [showStatus, setShowStatus]         = useState(false);
  const [showBulkDel, setShowBulkDel]       = useState(false);

  // status dialog state
  const [newStatus, setNewStatus]   = useState("");
  const [adminNote, setAdminNote]   = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // bulk
  const [selectedIds, setSelectedIds]     = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading]     = useState(false);

  // sort
  const [sortField, setSortField]         = useState<keyof SupportTicket>("created_at");
  const [sortDir, setSortDir]             = useState<"asc" | "desc">("desc");

  // search filters
  const [filters, setFilters] = useState({
    id: "", name: "", subject: "", priority: "all", status: "all", category: "all", date: "",
  });

  // ── Load ──────────────────────────────────────────────────────
  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await getAllSupportTickets();
    setTickets(data);
    setLoading(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    toast.success("Refreshed");
  };

  // ── Sort ──────────────────────────────────────────────────────
  const handleSort = (field: keyof SupportTicket) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  // ── Filter + sort ─────────────────────────────────────────────
  const filtered = [...tickets]
    .sort((a, b) => {
      const av = a[sortField], bv = b[sortField];
      if (av == null) return 1;
      if (bv == null) return -1;
      return sortDir === "asc" ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
    })
    .filter((t) => {
      const f = filters;
      return (
        (!f.id       || t.id.toString().includes(f.id)) &&
        (!f.name     || (t.name  || "").toLowerCase().includes(f.name.toLowerCase())) &&
        (!f.subject  || (t.subject || "").toLowerCase().includes(f.subject.toLowerCase())) &&
        (f.priority === "all" || t.priority === f.priority) &&
        (f.status   === "all" || t.status   === f.status)   &&
        (f.category === "all" || t.category === f.category) &&
        (!f.date     || new Date(t.created_at).toISOString().split("T")[0] === f.date)
      );
    });

  // ── Select all ────────────────────────────────────────────────
  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((t) => t.id)));
  };

  // ── View ──────────────────────────────────────────────────────
  const handleView = async (id: number) => {
    const t = await getSupportTicketById(id);
    if (t) { setSelected(t); setShowView(true); }
    else toast.error("Failed to load ticket");
  };

  // ── Open status dialog ────────────────────────────────────────
  const openStatusDialog = async (t: SupportTicket) => {
    const detail = await getSupportTicketById(t.id);
    setSelected(detail || t);
    setNewStatus(detail?.status || t.status);
    setAdminNote("");
    setShowStatus(true);
  };

  // ── Update status ─────────────────────────────────────────────
  const handleUpdateStatus = async () => {
    if (!selected || !newStatus) return;
    setUpdatingStatus(true);
    const ok = await updateSupportTicketStatus(selected.id, newStatus, adminNote || undefined);
    setUpdatingStatus(false);
    if (ok) {
      toast.success(`Status updated to ${newStatus}`);
      setShowStatus(false);
      setAdminNote(""); setNewStatus("");
      await load();
    } else {
      toast.error("Failed to update status");
    }
  };

  // ── Bulk delete ───────────────────────────────────────────────
  const handleBulkDelete = async () => {
    setBulkLoading(true);
    const ok = await bulkDeleteSupportTickets(Array.from(selectedIds));
    setBulkLoading(false);
    if (ok) {
      toast.success(`Deleted ${selectedIds.size} tickets`);
      setSelectedIds(new Set());
      setShowBulkDel(false);
      await load();
    } else {
      toast.error("Failed to delete tickets");
    }
  };

  // ── Stats ─────────────────────────────────────────────────────
  const stats = {
    total:       tickets.length,
    open:        tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved:    tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-500 text-sm">Loading support tickets...</p>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gradient-to-br from-violet-50/30 to-indigo-50/30">

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-4 -mt-5 md:-mt-2 sticky top-24 z-10">
        {[
          { label: "Total Tickets",   value: stats.total,       icon: Headphones,  bg: "from-slate-50  to-slate-100",  iconBg: "bg-slate-600"  },
          { label: "Open",            value: stats.open,        icon: AlertCircle, bg: "from-red-50    to-red-100",    iconBg: "bg-red-600"    },
          { label: "In Progress",     value: stats.in_progress, icon: Loader2,     bg: "from-blue-50   to-blue-100",   iconBg: "bg-blue-600"   },
          { label: "Resolved/Closed", value: stats.resolved,    icon: CheckCircle, bg: "from-green-50  to-green-100",  iconBg: "bg-green-600"  },
        ].map(({ label, value, icon: Icon, bg, iconBg }) => (
          <Card key={label} className={`bg-gradient-to-br ${bg} border-0 shadow-sm`}>
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{label}</p>
                  <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
                </div>
                <div className={`p-1.5 rounded-lg ${iconBg}`}>
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Bulk action bar ────────────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="sticky top-36 z-10 mb-4 bg-white rounded-lg shadow-lg border border-violet-200 p-3 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-violet-100 text-violet-700">
              {selectedIds.size} selected
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="text-gray-500">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setShowBulkDel(true)} className="bg-red-600 hover:bg-red-700">
            <XCircle className="h-4 w-4 mr-1" /> Delete Selected
          </Button>
        </div>
      )}

      {/* ── Refresh btn ────────────────────────────────────────────────── */}
      <div className="flex justify-end mb-2 px-0.5">
        <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing} className="text-xs h-8">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          {tickets.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 m-6 rounded-lg">
              <div className="bg-white p-8 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-sm">
                <MessageSquare className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No support tickets</h3>
              <p className="text-gray-500 text-sm">No tickets have been submitted yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className={`overflow-y-auto rounded-b-lg transition-all duration-300 ${
                selectedIds.size > 0 ? "max-h-[440px] md:max-h-[390px]" : "max-h-[390px] md:max-h-[480px]"
              }`}>
                <Table>
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow className="hover:bg-transparent">

                      {/* Checkbox */}
                      <TableHead className="w-[46px] bg-white/95 backdrop-blur-sm border-b-2 border-violet-200">
                        <div className="py-2 flex justify-center">
                          <Checkbox
                            checked={selectedIds.size === filtered.length && filtered.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </div>
                      </TableHead>

                      {/* ID */}
                      <TableHead className="min-w-[90px] bg-white/95 backdrop-blur-sm border-b-2 border-violet-200">
                        <div className="space-y-2 py-2">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("id")}>
                            <span className="font-semibold text-gray-700 text-xs">ID</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                          </div>
                          <Input placeholder="Search…" className="h-7 text-xs border-gray-200"
                            value={filters.id} onChange={(e) => setFilters({ ...filters, id: e.target.value })} />
                        </div>
                      </TableHead>

                      {/* Name / Contact */}
                      <TableHead className="min-w-[180px] bg-white/95 backdrop-blur-sm border-b-2 border-violet-200">
                        <div className="space-y-2 py-2">
                          <span className="font-semibold text-gray-700 text-xs">Name / Contact</span>
                          <Input placeholder="Search name…" className="h-7 text-xs border-gray-200"
                            value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
                        </div>
                      </TableHead>

                      {/* Subject */}
                      <TableHead className="min-w-[220px] bg-white/95 backdrop-blur-sm border-b-2 border-violet-200">
                        <div className="space-y-2 py-2">
                          <span className="font-semibold text-gray-700 text-xs">Subject</span>
                          <Input placeholder="Search subject…" className="h-7 text-xs border-gray-200"
                            value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })} />
                        </div>
                      </TableHead>

                      {/* Category */}
                      <TableHead className="min-w-[140px] bg-white/95 backdrop-blur-sm border-b-2 border-violet-200">
                        <div className="space-y-2 py-2">
                          <span className="font-semibold text-gray-700 text-xs">Category</span>
                          <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
                            <SelectTrigger className="h-7 text-xs border-gray-200"><SelectValue placeholder="All" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>

                      {/* Priority */}
                      <TableHead className="min-w-[120px] bg-white/95 backdrop-blur-sm border-b-2 border-violet-200">
                        <div className="space-y-2 py-2">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("priority")}>
                            <span className="font-semibold text-gray-700 text-xs">Priority</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                          </div>
                          <Select value={filters.priority} onValueChange={(v) => setFilters({ ...filters, priority: v })}>
                            <SelectTrigger className="h-7 text-xs border-gray-200"><SelectValue placeholder="All" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>

                      {/* Status */}
                      <TableHead className="min-w-[130px] bg-white/95 backdrop-blur-sm border-b-2 border-violet-200">
                        <div className="space-y-2 py-2">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("status")}>
                            <span className="font-semibold text-gray-700 text-xs">Status</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                          </div>
                          <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                            <SelectTrigger className="h-7 text-xs border-gray-200"><SelectValue placeholder="All" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>

                      {/* Date */}
                      <TableHead className="min-w-[140px] bg-white/95 backdrop-blur-sm border-b-2 border-violet-200">
                        <div className="space-y-2 py-2">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("created_at")}>
                            <span className="font-semibold text-gray-700 text-xs">Date</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                          </div>
                          <Input type="date" className="h-7 text-xs border-gray-200"
                            value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
                        </div>
                      </TableHead>

                      {/* Actions */}
                      <TableHead className="min-w-[80px] bg-white/95 backdrop-blur-sm border-b-2 border-violet-200">
                        <span className="font-semibold text-gray-700 text-xs">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                          No tickets match your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((ticket, idx) => (
                        <TableRow
                          key={ticket.id}
                          className={`transition-all duration-150 hover:bg-violet-50/40 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                        >
                          {/* Checkbox */}
                          <TableCell className="w-[46px]">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={selectedIds.has(ticket.id)}
                                onCheckedChange={() => {
                                  const next = new Set(selectedIds);
                                  next.has(ticket.id) ? next.delete(ticket.id) : next.add(ticket.id);
                                  setSelectedIds(next);
                                }}
                              />
                            </div>
                          </TableCell>

                          {/* ID */}
                          <TableCell className="font-mono text-xs font-semibold text-violet-600">
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                              #{ticket.id}
                            </div>
                          </TableCell>

                          {/* Name / Contact */}
                          <TableCell>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 font-medium text-xs text-gray-900">
                                <div className="bg-violet-100 p-0.5 rounded-full">
                                  <User className="h-2.5 w-2.5 text-violet-600" />
                                </div>
                                <span className="truncate max-w-[130px]">{ticket.name}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400 ml-4">
                                <Mail className="h-2.5 w-2.5" />
                                <span className="truncate max-w-[130px]">{ticket.email}</span>
                              </div>
                              {ticket.phone && (
                                <div className="flex items-center gap-1 text-[10px] text-gray-400 ml-4">
                                  <Phone className="h-2.5 w-2.5" />
                                  {ticket.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Subject */}
                          <TableCell>
                            <p className="text-xs font-medium text-gray-800 line-clamp-2 max-w-[200px]">
                              {ticket.subject}
                            </p>
                          </TableCell>

                          {/* Category */}
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${CATEGORY_MAP[ticket.category]?.color || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                              {CATEGORY_MAP[ticket.category]?.label || ticket.category}
                            </span>
                          </TableCell>

                          {/* Priority */}
                          <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>

                          {/* Status */}
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(ticket.status)}
                              {getStatusBadge(ticket.status)}
                            </div>
                          </TableCell>

                          {/* Date */}
                          <TableCell>
                            <div className="space-y-0.5">
                              <p className="text-xs font-medium text-gray-700">
                                {new Date(ticket.created_at).toLocaleDateString("en-IN", {
                                  month: "short", day: "numeric", year: "numeric",
                                })}
                              </p>
                              <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {new Date(ticket.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="hover:bg-violet-100 hover:text-violet-600">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 border-violet-100 shadow-lg">
                                <DropdownMenuLabel className="text-violet-600 text-xs">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleView(ticket.id)} className="cursor-pointer hover:bg-violet-50 text-xs">
                                  <Eye className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openStatusDialog(ticket)} className="cursor-pointer hover:bg-violet-50 text-xs">
                                  <FileText className="h-3.5 w-3.5 mr-2 text-purple-500" />
                                  Update Status
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── View Dialog ────────────────────────────────────────────────── */}
      <Dialog open={showView} onOpenChange={setShowView}>
        <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm font-semibold">
                <Headphones className="h-4 w-4" />
                Ticket #{selected?.id} — Details
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowView(false)}
                className="h-7 w-7 text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-violet-100 text-xs mt-0.5">
              Support ticket submitted by {selected?.name}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto text-xs">
              {/* badges row */}
              <div className="flex flex-wrap gap-2 bg-gray-50 px-3 py-2 rounded-md">
                <div className="flex items-center gap-1"><span className="text-gray-500">Status:</span>{getStatusBadge(selected.status)}</div>
                <div className="flex items-center gap-1"><span className="text-gray-500">Priority:</span>{getPriorityBadge(selected.priority)}</div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Category:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${CATEGORY_MAP[selected.category]?.color || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                    {CATEGORY_MAP[selected.category]?.label || selected.category}
                  </span>
                </div>
              </div>

              {/* Contact info */}
              <div className="border rounded-md p-3">
                <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-violet-600">
                  <User className="h-3 w-3" /> Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div><p className="text-gray-400">Name</p><p className="font-medium">{selected.name}</p></div>
                  <div><p className="text-gray-400">Email</p>
                    <a href={`mailto:${selected.email}`} className="font-medium text-violet-600 hover:underline truncate block">{selected.email}</a>
                  </div>
                  <div><p className="text-gray-400">Phone</p>
                    {selected.phone
                      ? <a href={`tel:${selected.phone}`} className="font-medium text-violet-600 hover:underline">{selected.phone}</a>
                      : <p className="text-gray-400">—</p>}
                  </div>
                </div>
              </div>

              {/* Ticket details */}
              <div className="border rounded-md p-3">
                <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-violet-600">
                  <MessageSquare className="h-3 w-3" /> Ticket Details
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-400">Subject</p>
                    <p className="font-medium">{selected.subject}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Message</p>
                    <div className="bg-gray-50 p-2 rounded mt-0.5 leading-relaxed">{selected.message}</div>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-gray-400">Submitted</p>
                      <p>{new Date(selected.created_at).toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Updated</p>
                      <p>{new Date(selected.updated_at).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin notes history */}
              {selected.admin_notes && (
                <div className="border rounded-md p-3">
                  <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-violet-600">
                    <FileText className="h-3 w-3" /> Admin Notes History
                  </h4>
                  <div className="bg-gray-50 p-2 rounded max-h-36 overflow-y-auto space-y-0.5">
                    {selected.admin_notes.split("\n").map((line, i) => {
                      if (line.includes("---"))   return <hr key={i} className="my-1 border-gray-300" />;
                      if (line.includes("[") && line.includes("]")) return <div key={i} className="text-violet-600 font-mono">{line}</div>;
                      if (line.startsWith("Note:"))   return <div key={i} className="pl-2 border-l-2 border-violet-300 ml-1 text-gray-700">{line}</div>;
                      if (line.startsWith("Status:")) return <div key={i} className="font-medium text-violet-700">{line}</div>;
                      return line.trim() ? <div key={i} className="text-gray-500 pl-1">{line}</div> : null;
                    })}
                  </div>
                </div>
              )}

              {/* Quick status update */}
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="flex-1 h-8 bg-violet-600 hover:bg-violet-700 text-xs"
                  onClick={() => { setShowView(false); openStatusDialog(selected); }}>
                  <FileText className="h-3 w-3 mr-1" /> Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Update Status Dialog ────────────────────────────────────────── */}
      <Dialog open={showStatus} onOpenChange={setShowStatus}>
        <DialogContent className="max-w-lg w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm font-semibold">
                <FileText className="h-4 w-4" /> Update Status — #{selected?.id}
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowStatus(false)}
                className="h-7 w-7 text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-violet-100 text-xs mt-0.5">
              {selected?.subject}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg text-xs">
                <div><p className="text-gray-400">Current</p>
                  <div className="flex items-center gap-1 mt-0.5">{getStatusIcon(selected.status)}{getStatusBadge(selected.status)}</div>
                </div>
                <div className="text-gray-300 text-lg">→</div>
                <div className="flex-1">
                  <p className="text-gray-400 mb-1">New Status</p>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Add Note (optional)</label>
                <Textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Enter note for this update…" rows={3} className="text-xs resize-none" />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowStatus(false)}>Cancel</Button>
                <Button size="sm" disabled={!newStatus || updatingStatus}
                  onClick={handleUpdateStatus}
                  className="bg-violet-600 hover:bg-violet-700">
                  {updatingStatus
                    ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Updating…</>
                    : <><CheckCircle className="h-3.5 w-3.5 mr-1.5" />Update Status</>}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Bulk Delete Confirm ────────────────────────────────────────── */}
      <Dialog open={showBulkDel} onOpenChange={setShowBulkDel}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" /> Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-xs">
              Delete {selectedIds.size} ticket{selectedIds.size !== 1 ? "s" : ""}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-3 rounded-md max-h-32 overflow-y-auto text-xs text-red-700 space-y-1">
            {Array.from(selectedIds).slice(0, 5).map((id) => {
              const t = tickets.find((x) => x.id === id);
              return <div key={id} className="flex gap-2"><span className="font-mono">#{id}</span><span className="truncate">— {t?.subject || "Unknown"}</span></div>;
            })}
            {selectedIds.size > 5 && <div className="font-medium">…and {selectedIds.size - 5} more</div>}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBulkDel(false)} disabled={bulkLoading}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={bulkLoading}>
              {bulkLoading ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Deleting…</> : <><XCircle className="h-3.5 w-3.5 mr-1.5" />Delete {selectedIds.size}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}