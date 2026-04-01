

// VisitorLogs.tsx — Fully functional, TenantHandover-style
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Users, Download, CheckCircle, XCircle, Clock, AlertCircle,
  CheckSquare, Square, LogOut, UserPlus, X, RefreshCw,
  Filter, Eye, Trash2, Ban, Search, FileText, Loader2,
  ShieldCheck, Building, ChevronDown,
} from 'lucide-react';
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Badge }   from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import {
  getVisitors, deleteVisitor, blockVisitor, unblockVisitor,
  checkOutVisitor, bulkCheckOut, getVisitorStats,
  VisitorLog,
} from "@/lib/visitorApi";
import { NewVisitorEntry } from "./NewVisitorEntry";
import { useAuth } from '@/context/authContext';

// ─── Style tokens (same as TenantHandover) ───────────────────────────────────
const SI = "text-[11px] py-0.5";

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <Card className={`${bg} border-0 shadow-sm`}>
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
          <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
        </div>
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

type StatusFilter = 'all' | 'checked_in' | 'checked_out' | 'overstayed';

const statusColor = (s: string) => {
  switch (s) {
    case 'checked_in':  return 'bg-green-100 text-green-700';
    case 'checked_out': return 'bg-gray-100 text-gray-700';
    case 'overstayed':  return 'bg-red-100 text-red-700';
    default:            return 'bg-gray-100 text-gray-700';
  }
};

const statusLabel = (s: string) => {
  switch (s) {
    case 'checked_in':  return 'CHECKED IN';
    case 'checked_out': return 'CHECKED OUT';
    case 'overstayed':  return 'OVERSTAYED';
    default:            return s.toUpperCase();
  }
};

const fmt = (d: string | null | undefined) => {
  if (!d) return 'N/A';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return 'N/A'; }
};

// ═══════════════════════════════════════════════════════════════════════════════
export function VisitorLogs() {
  const [logs, setLogs]           = useState<VisitorLog[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem]   = useState<VisitorLog | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guardName, setGuardName] = useState('Security Guard');
const { can } = useAuth();

  // filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [colSearch, setColSearch] = useState({
    visitor_name: '', visitor_phone: '', tenant_name: '',
    property_name: '', room_number: '', status: '', entry_time: '',
  });

  // selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll]         = useState(false);

  // stats
  const [stats, setStats] = useState({ total: 0, checked_in: 0, checked_out: 0, overstayed: 0, checked_out_today: 0 });

  // ── Load ───────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== 'all')   filters.status      = statusFilter;
      if (propertyFilter !== 'all') filters.property_id = propertyFilter;

      const [visRes, stRes] = await Promise.all([
        getVisitors(filters),
        getVisitorStats(),
      ]);
      setLogs(visRes.data || []);
      setStats({
        total:            stRes.data.total          || 0,
        checked_in:       stRes.data.checked_in     || 0,
        checked_out:      stRes.data.checked_out    || 0,
        overstayed:       stRes.data.overstayed     || 0,
        checked_out_today: stRes.data.checked_out_today || 0,
      });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load visitor logs');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, propertyFilter]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Unique properties for filter ───────────────────────────────────────
  const uniqueProperties = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string }[] = [];
    logs.forEach(l => {
      const key = l.property_id || l.property_name;
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ id: l.property_id || l.property_name, name: l.property_name });
      }
    });
    return list;
  }, [logs]);

  // ── Column search filter ───────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return logs.filter(h => {
      const cs = colSearch;
      const vn = !cs.visitor_name  || h.visitor_name?.toLowerCase().includes(cs.visitor_name.toLowerCase());
      const vp = !cs.visitor_phone || h.visitor_phone?.includes(cs.visitor_phone);
      const tn = !cs.tenant_name   || h.tenant_name?.toLowerCase().includes(cs.tenant_name.toLowerCase());
      const pn = !cs.property_name || h.property_name?.toLowerCase().includes(cs.property_name.toLowerCase());
      const rn = !cs.room_number   || h.room_number?.toLowerCase().includes(cs.room_number.toLowerCase());
      const st = !cs.status        || h.status?.toLowerCase().includes(cs.status.toLowerCase());
      const et = !cs.entry_time    || fmt(h.entry_time).toLowerCase().includes(cs.entry_time.toLowerCase());
      return vn && vp && tn && pn && rn && st && et;
    });
  }, [logs, colSearch]);

  // ── Selection ──────────────────────────────────────────────────────────
  const toggleSelectAll = () => {
    if (selectAll) { setSelectedItems(new Set()); }
    else { setSelectedItems(new Set(filteredItems.map(i => i.id))); }
    setSelectAll(!selectAll);
  };
  const toggleSelectItem = (id: string) => {
    const ns = new Set(selectedItems);
    if (ns.has(id)) ns.delete(id); else ns.add(id);
    setSelectedItems(ns);
    setSelectAll(ns.size === filteredItems.length && filteredItems.length > 0);
  };

  // ── Check out ──────────────────────────────────────────────────────────
  const handleCheckOut = async (id: string) => {
    if (!guardName) { toast.error('Enter guard name'); return; }
    try {
      await checkOutVisitor(id, guardName);
      toast.success('Visitor checked out');
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Check out failed');
    }
  };

  // ── Bulk check out ─────────────────────────────────────────────────────
  const handleBulkCheckOut = async () => {
    if (selectedItems.size === 0) { toast.error('Select visitors first'); return; }
    if (!guardName) { toast.error('Enter guard name'); return; }

    const result = await Swal.fire({
      title: 'Bulk Check Out?',
      text: `Check out ${selectedItems.size} visitor(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, check out!',
      width: '360px',
      customClass: { popup: 'rounded-xl shadow-2xl' },
    });
    if (!result.isConfirmed) return;

    try {
      await bulkCheckOut(Array.from(selectedItems), guardName);
      toast.success(`${selectedItems.size} visitor(s) checked out`);
      setSelectedItems(new Set());
      setSelectAll(false);
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Bulk check out failed');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, name?: string) => {
    const result = await Swal.fire({
      title: 'Delete Record?',
      text: `Delete visitor log for "${name || id}"? This cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete!',
      width: '380px',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 mx-1',
        cancelButton:  'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 mx-1',
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;
    try {
      await deleteVisitor(id);
      toast.success('Visitor record deleted');
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  // ── Bulk delete ────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) { toast.error('Select records first'); return; }
    const result = await Swal.fire({
      title: 'Delete Selected?',
      text: `Delete ${selectedItems.size} visitor record(s)? This cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete all!',
      width: '400px',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 mx-1',
        cancelButton:  'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 mx-1',
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;
    try {
      for (const id of selectedItems) await deleteVisitor(id);
      toast.success(`${selectedItems.size} records deleted`);
      setSelectedItems(new Set()); setSelectAll(false);
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  // ── Block visitor ──────────────────────────────────────────────────────
 const handleBlock = async (log: VisitorLog) => {
  const { value: reason } = await Swal.fire({
    title: 'Block Visitor',
    input: 'textarea',
    inputLabel: `Reason for blocking ${log.visitor_name}`,
    inputPlaceholder: 'Enter reason...',
    showCancelButton: true,
    confirmButtonText: 'Block',
    cancelButtonText: 'Cancel',
    width: '420px',

    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',

    buttonsStyling: true,

    customClass: {
      popup: 'rounded-xl shadow-2xl',
    },

    didOpen: () => {
      const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
      const cancelBtn = document.querySelector('.swal2-cancel') as HTMLElement;

      if (confirmBtn) {
        confirmBtn.style.background = '#dc2626';
        confirmBtn.style.color = '#fff';
        confirmBtn.style.padding = '8px 18px';
        confirmBtn.style.borderRadius = '6px';
        confirmBtn.style.fontWeight = '600';
        confirmBtn.style.display = 'inline-block'; // force visible
      }

      if (cancelBtn) {
        cancelBtn.style.background = '#6b7280';
        cancelBtn.style.color = '#fff';
        cancelBtn.style.padding = '8px 18px';
        cancelBtn.style.borderRadius = '6px';
        cancelBtn.style.marginRight = '8px';
        cancelBtn.style.display = 'inline-block'; // force visible
      }
    }
  });

  if (!reason) return;

  try {
    await blockVisitor({
      visitor_name: log.visitor_name,
      visitor_phone: log.visitor_phone,
      id_proof_number: log.id_proof_number,
      reason,
      blocked_by: guardName || 'Security',
    });

    toast.success(`${log.visitor_name} blocked successfully`);
  } catch (err: any) {
    toast.error(err?.message || 'Block failed');
  }
};

  // Add this after handleBlock function:
const handleUnblock = async (log: VisitorLog) => {
  const result = await Swal.fire({
    title: 'Unblock Visitor',
    html: `
      <div style="text-align:left;font-size:13px;">
        <p><b>Name:</b> ${log.visitor_name}</p>
        <p><b>Phone:</b> ${log.visitor_phone}</p>
        <p><b>Aadhar:</b> ${log.id_proof_number}</p>

        <p style="margin-top:10px;color:#6b7280;font-size:12px;">
          This will allow the visitor to enter again.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Unblock',
    cancelButtonText: 'Cancel',
    width: '420px',

    confirmButtonColor: '#16a34a',
    cancelButtonColor: '#6b7280',

    buttonsStyling: true,

    customClass: {
      popup: 'rounded-xl shadow-2xl',
    },

    didOpen: () => {
      const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
      const cancelBtn = document.querySelector('.swal2-cancel') as HTMLElement;

      if (confirmBtn) {
        confirmBtn.style.background = '#16a34a';
        confirmBtn.style.color = '#fff';
        confirmBtn.style.padding = '8px 18px';
        confirmBtn.style.borderRadius = '6px';
        confirmBtn.style.fontWeight = '600';
        confirmBtn.style.display = 'inline-block';
        confirmBtn.style.filter = 'none';
        confirmBtn.onmouseover = () => (confirmBtn.style.filter = 'none');
      }

      if (cancelBtn) {
        cancelBtn.style.background = '#6b7280';
        cancelBtn.style.color = '#fff';
        cancelBtn.style.padding = '8px 18px';
        cancelBtn.style.borderRadius = '6px';
        cancelBtn.style.marginRight = '8px';
        cancelBtn.style.display = 'inline-block';
        cancelBtn.style.filter = 'none';
        cancelBtn.onmouseover = () => (cancelBtn.style.filter = 'none');
      }
    }
  });

  if (!result.isConfirmed) return;

  try {
    await unblockVisitor(log.visitor_phone, log.id_proof_number);
    toast.success(`${log.visitor_name} unblocked successfully`);
    loadAll();
  } catch (err: any) {
    toast.error(err?.message || 'Unblock failed');
  }
};

  // ── Export CSV ─────────────────────────────────────────────────────────
const handleExport = () => {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // 1. Main visitors sheet
    const visitorsData = filteredItems.map(log => ({
      'Visitor Name': log.visitor_name,
      'Phone Number': log.visitor_phone,
      'Tenant Name': log.tenant_name,
      'Tenant Phone': log.tenant_phone || '',
      'Property': log.property_name,
      'Room Number': log.room_number,
      'Purpose': log.purpose,
      'Entry Time': fmt(log.entry_time),
      'Exit Time': log.exit_time ? fmt(log.exit_time) : '',
      'Expected Exit': log.tentative_exit_time ? fmt(log.tentative_exit_time) : '',
      'Status': statusLabel(log.status),
      'QR Code': log.qr_code || '',
      'ID Proof Type': log.id_proof_type,
      'ID Proof Number': log.id_proof_number,
      'Vehicle Number': log.vehicle_number || '',
      'Security Guard': log.security_guard_name,
      'Checked Out By': log.checked_out_by || '',
      'Approval Status': log.approval_status,
      'Is Blocked': log.is_blocked === 1 ? 'Yes' : 'No',
      'Block Reason': log.block_reason || '',
      'Blocked By': log.blocked_by || '',
      'Notes': log.notes || '',
      'Created At': log.created_at ? fmt(log.created_at) : '',
      'Visitor ID': log.id
    }));

    const visitorsWs = XLSX.utils.json_to_sheet(visitorsData);
    
    // Auto-size columns
    const visitorsColWidths = [];
    const visitorsHeaders = Object.keys(visitorsData[0] || {});
    visitorsHeaders.forEach(header => {
      const maxLength = Math.max(
        header.length,
        ...visitorsData.map(row => String(row[header] || '').length)
      );
      visitorsColWidths.push({ wch: Math.min(maxLength + 2, 50) });
    });
    visitorsWs['!cols'] = visitorsColWidths;
    
    XLSX.utils.book_append_sheet(wb, visitorsWs, "Visitor Logs");

    // 2. Summary sheet
    const checkedIn = filteredItems.filter(l => l.status === 'checked_in').length;
    const checkedOut = filteredItems.filter(l => l.status === 'checked_out').length;
    const overstayed = filteredItems.filter(l => l.status === 'overstayed').length;
    const blocked = filteredItems.filter(l => l.is_blocked === 1).length;

    const summaryData = [
      ['Metric', 'Value'],
      ['Total Visitor Records', filteredItems.length],
      ['Currently Checked In', checkedIn],
      ['Checked Out', checkedOut],
      ['Overstayed', overstayed],
      ['Blocked Visitors', blocked],
      ['Checked Out Today', stats.checked_out_today],
      ['Unique Visitors', new Set(filteredItems.map(l => l.visitor_name)).size],
      ['Unique Properties', new Set(filteredItems.map(l => l.property_name)).size],
      ['Export Date', new Date().toLocaleString('en-IN')]
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // 3. Status breakdown sheet
    const statusData = [
      ['Status', 'Count', 'Percentage', 'Unique Visitors'],
      ['Checked In', 
        checkedIn,
        filteredItems.length > 0 ? `${((checkedIn / filteredItems.length) * 100).toFixed(1)}%` : '0%',
        new Set(filteredItems.filter(l => l.status === 'checked_in').map(l => l.visitor_name)).size
      ],
      ['Checked Out',
        checkedOut,
        filteredItems.length > 0 ? `${((checkedOut / filteredItems.length) * 100).toFixed(1)}%` : '0%',
        new Set(filteredItems.filter(l => l.status === 'checked_out').map(l => l.visitor_name)).size
      ],
      ['Overstayed',
        overstayed,
        filteredItems.length > 0 ? `${((overstayed / filteredItems.length) * 100).toFixed(1)}%` : '0%',
        new Set(filteredItems.filter(l => l.status === 'overstayed').map(l => l.visitor_name)).size
      ]
    ];

    const statusWs = XLSX.utils.aoa_to_sheet(statusData);
    XLSX.utils.book_append_sheet(wb, statusWs, "Status Breakdown");

    // 4. Property-wise analysis sheet
    const propertyMap = new Map();
    filteredItems.forEach(log => {
      if (!propertyMap.has(log.property_name)) {
        propertyMap.set(log.property_name, {
          property: log.property_name,
          visits: 0,
          checkedIn: 0,
          checkedOut: 0,
          overstayed: 0,
          blocked: 0,
          uniqueVisitors: new Set()
        });
      }
      const prop = propertyMap.get(log.property_name);
      prop.visits++;
      prop.uniqueVisitors.add(log.visitor_name);
      if (log.status === 'checked_in') prop.checkedIn++;
      else if (log.status === 'checked_out') prop.checkedOut++;
      else if (log.status === 'overstayed') prop.overstayed++;
      if (log.is_blocked === 1) prop.blocked++;
    });

    const propertyData = Array.from(propertyMap.values()).map(p => ({
      'Property': p.property,
      'Total Visits': p.visits,
      'Currently Checked In': p.checkedIn,
      'Checked Out': p.checkedOut,
      'Overstayed': p.overstayed,
      'Blocked Visitors': p.blocked,
      'Unique Visitors': p.uniqueVisitors.size,
      'Occupancy Rate': p.visits > 0 ? `${((p.checkedIn / p.visits) * 100).toFixed(1)}%` : '0%'
    }));

    if (propertyData.length > 0) {
      const propertyWs = XLSX.utils.json_to_sheet(propertyData);
      XLSX.utils.book_append_sheet(wb, propertyWs, "By Property");
    }

    // 5. Purpose analysis sheet
    const purposeMap = new Map();
    filteredItems.forEach(log => {
      if (!purposeMap.has(log.purpose)) {
        purposeMap.set(log.purpose, {
          purpose: log.purpose,
          count: 0,
          checkedIn: 0,
          checkedOut: 0,
          avgDuration: 0,
          durations: []
        });
      }
      const purp = purposeMap.get(log.purpose);
      purp.count++;
      if (log.status === 'checked_in') purp.checkedIn++;
      else if (log.status === 'checked_out') purp.checkedOut++;
      
      // Calculate duration if both entry and exit times exist
      if (log.entry_time && log.exit_time) {
        const duration = (new Date(log.exit_time).getTime() - new Date(log.entry_time).getTime()) / (1000 * 60 * 60); // hours
        purp.durations.push(duration);
      }
    });

    const purposeData = Array.from(purposeMap.values()).map(p => {
      const avgDuration = p.durations.length > 0 
        ? (p.durations.reduce((a, b) => a + b, 0) / p.durations.length).toFixed(1)
        : 'N/A';
      
      return {
        'Purpose': p.purpose,
        'Total Visits': p.count,
        'Currently Checked In': p.checkedIn,
        'Checked Out': p.checkedOut,
        'Completion Rate': p.count > 0 ? `${((p.checkedOut / p.count) * 100).toFixed(1)}%` : '0%',
        'Avg Stay Duration (hrs)': avgDuration,
        'Percentage of Total': filteredItems.length > 0 ? `${((p.count / filteredItems.length) * 100).toFixed(1)}%` : '0%'
      };
    });

    if (purposeData.length > 0) {
      const purposeWs = XLSX.utils.json_to_sheet(purposeData);
      XLSX.utils.book_append_sheet(wb, purposeWs, "By Purpose");
    }

    // 6. Visitor frequency analysis
    const visitorFrequency = new Map();
    filteredItems.forEach(log => {
      const key = `${log.visitor_name}|${log.visitor_phone}`;
      if (!visitorFrequency.has(key)) {
        visitorFrequency.set(key, {
          name: log.visitor_name,
          phone: log.visitor_phone,
          visits: 0,
          properties: new Set(),
          lastVisit: null,
          isBlocked: log.is_blocked === 1
        });
      }
      const v = visitorFrequency.get(key);
      v.visits++;
      v.properties.add(log.property_name);
      if (log.entry_time && (!v.lastVisit || new Date(log.entry_time) > new Date(v.lastVisit))) {
        v.lastVisit = log.entry_time;
      }
    });

    const frequencyData = Array.from(visitorFrequency.values()).map(v => ({
      'Visitor Name': v.name,
      'Phone': v.phone,
      'Total Visits': v.visits,
      'Unique Properties': v.properties.size,
      'Properties Visited': Array.from(v.properties).join(', '),
      'Last Visit': v.lastVisit ? fmt(v.lastVisit) : 'N/A',
      'Currently Blocked': v.isBlocked ? 'Yes' : 'No'
    }));

    if (frequencyData.length > 0) {
      const frequencyWs = XLSX.utils.json_to_sheet(frequencyData);
      XLSX.utils.book_append_sheet(wb, frequencyWs, "Visitor Frequency");
    }

    // 7. Blocked visitors analysis
    const blockedVisitors = filteredItems.filter(l => l.is_blocked === 1);
    if (blockedVisitors.length > 0) {
      const blockedData = blockedVisitors.map(log => ({
        'Visitor Name': log.visitor_name,
        'Phone': log.visitor_phone,
        'Block Reason': log.block_reason || '',
        'Blocked By': log.blocked_by || '',
        'Property': log.property_name,
        'Last Visit': log.entry_time ? fmt(log.entry_time) : 'N/A',
        'Block Date': log.updated_at ? fmt(log.updated_at) : 'N/A'
      }));

      const blockedWs = XLSX.utils.json_to_sheet(blockedData);
      XLSX.utils.book_append_sheet(wb, blockedWs, "Blocked Visitors");
    }

    // 8. Hourly distribution (if entry_time exists)
    const hourlyData: Record<string, number> = {};
    filteredItems.forEach(log => {
      if (log.entry_time) {
        const hour = new Date(log.entry_time).getHours();
        const hourStr = `${hour}:00 - ${hour + 1}:00`;
        hourlyData[hourStr] = (hourlyData[hourStr] || 0) + 1;
      }
    });

    const hourlyDistribution = Object.entries(hourlyData).map(([hour, count]) => ({
      'Time Slot': hour,
      'Visitor Count': count,
      'Percentage': filteredItems.length > 0 ? `${((count / filteredItems.length) * 100).toFixed(1)}%` : '0%'
    }));

    if (hourlyDistribution.length > 0) {
      const hourlyWs = XLSX.utils.json_to_sheet(hourlyDistribution);
      XLSX.utils.book_append_sheet(wb, hourlyWs, "Hourly Distribution");
    }

    // Generate filename
    const filename = `visitor_logs_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    
    toast.success(`Exported ${filteredItems.length} visitor records successfully`);
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export visitor logs');
  }
};

  const hasFilters   = statusFilter !== 'all' || propertyFilter !== 'all';
  const hasColSearch = Object.values(colSearch).some(v => v !== '');
  const activeCount  = [statusFilter !== 'all', propertyFilter !== 'all'].filter(Boolean).length;
  const clearFilters    = () => { setStatusFilter('all'); setPropertyFilter('all'); };
  const clearColSearch  = () => setColSearch({ visitor_name: '', visitor_phone: '', tenant_name: '', property_name: '', room_number: '', status: '', entry_time: '' });

  // ════════════════════════════════════════════════════════════════════════════
  return (
<div className="bg-gray-50 flex flex-col">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="sticky top-20 z-10 ">
        <div className="px-0 sm:px-0 pt-0  pb-2 flex items-end justify-end gap-2">
          <div className="flex items-end justify-end gap-1.5 flex-shrink-0">

            <button onClick={() => setSidebarOpen(o => !o)}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors
                ${sidebarOpen || hasFilters ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              <Filter className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Filters</span>
              {activeCount > 0 && (
                <span className={`h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center
                  ${sidebarOpen || hasFilters ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                  {activeCount}
                </span>
              )}
            </button>


          {can('export_visitor_logs') && (
            <button onClick={handleExport}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium transition-colors">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

            <button onClick={loadAll} disabled={loading}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {can('create_visitor') && (

            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-[11px] font-semibold shadow-sm transition-colors">
              <UserPlus className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="xs:inline">New Visitor</span>
            </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="px-0 sm:px-0 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            <StatCard title="Total Visitors"    value={stats.total}             icon={Users}        color="bg-blue-600"   bg="bg-gradient-to-br from-blue-50 to-blue-100" />
            <StatCard title="Checked In"        value={stats.checked_in}        icon={CheckCircle}  color="bg-green-600"  bg="bg-gradient-to-br from-green-50 to-green-100" />
            <StatCard title="Overstayed"        value={stats.overstayed}        icon={AlertCircle}  color="bg-red-600"    bg="bg-gradient-to-br from-red-50 to-red-100" />
            <StatCard title="Checked Out Today" value={stats.checked_out_today} icon={XCircle}      color="bg-gray-600"   bg="bg-gradient-to-br from-gray-50 to-gray-100" />
            <StatCard title="Total Checked Out" value={stats.checked_out}       icon={ShieldCheck}  color="bg-cyan-600"   bg="bg-gradient-to-br from-cyan-50 to-cyan-100" />
          </div>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div className="relative">
        <main className="p-0 sm:p-0 ">

          {/* Guard name + bulk actions bar */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Guard name for checkout…"
                value={guardName}
                onChange={e => setGuardName(e.target.value)}
                className="h-7 text-[11px] w-44 border-gray-200 bg-white"
              />
            </div>
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-lg">
                  {selectedItems.size} selected
                </span>
                    {can('checkout_visitor') && (

                <Button size="sm" onClick={handleBulkCheckOut}
                  className="h-7 text-[10px] px-2.5 bg-blue-600 hover:bg-blue-700 text-white gap-1">
                  <LogOut className="h-3 w-3" /> Bulk Check Out
                </Button>
                    )}
                        {can('delete_visitor_logs') && (

                <Button size="sm" variant="destructive" onClick={handleBulkDelete}
                  className="h-7 text-[10px] px-2.5 bg-red-600 hover:bg-red-700 gap-1">
                  <Trash2 className="h-3 w-3" /> Delete Selected
                </Button>
                        )}
              </div>
            )}
          </div>

          <Card className="border rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
              <span className="text-sm font-semibold text-gray-700">
                All Visitor Logs ({filteredItems.length})
                {selectedItems.size > 0 && (
                  <span className="ml-2 text-blue-600 text-xs">({selectedItems.size} selected)</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {hasColSearch && (
                  <button onClick={clearColSearch} className="text-[10px] text-blue-600 font-semibold hover:underline">
                    Clear Search
                  </button>
                )}
              </div>
            </div>

<div className={`overflow-auto rounded-b-lg transition-all duration-300 ${
  selectedItems.size > 0
    ? 'max-h-[250px] md:max-h-[450px]'
    : 'max-h-[280px] md:max-h-[400px]'
}`}>
  <div className="min-w-[1100px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50">
                    <TableRow>
                      <TableHead className="py-2 px-3 text-xs w-8">
                        <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200 rounded">
                          {selectAll
                            ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" />
                            : <Square className="h-3.5 w-3.5 text-gray-400" />}
                        </button>
                      </TableHead>
                      <TableHead className="py-2 px-3 text-xs">Visitor</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Phone</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Tenant</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Property</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Room</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Entry Time</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Exit / Expected</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Purpose</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Status</TableHead>
                      <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
                    </TableRow>

                    {/* Column search row */}
                    <TableRow className="bg-gray-50/80">
                      <TableCell className="py-1 px-2" />
                      {[
                        { key: 'visitor_name',  ph: 'Visitor…' },
                        { key: 'visitor_phone', ph: 'Phone…' },
                        { key: 'tenant_name',   ph: 'Tenant…' },
                        { key: 'property_name', ph: 'Property…' },
                        { key: 'room_number',   ph: 'Room…' },
                        { key: 'entry_time',    ph: 'Entry…' },
                        { key: null, ph: '' },
                        { key: null, ph: '' },
                        { key: 'status',        ph: 'Status…' },
                      ].map((col, idx) => (
                        <TableCell key={idx} className="py-1 px-2">
                          {col.key ? (
                            <Input
                              placeholder={col.ph}
                              value={colSearch[col.key as keyof typeof colSearch]}
                              onChange={e => setColSearch(p => ({ ...p, [col.key!]: e.target.value }))}
                              className="h-6 text-[10px]"
                            />
                          ) : <div />}
                        </TableCell>
                      ))}
                      <TableCell className="py-1 px-2" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Loading visitor logs…</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-12">
                          <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500">No visitor logs found</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.map(log => (
                      <TableRow key={log.id} className="hover:bg-gray-50">
                        <TableCell className="py-2 px-3">
                          <button onClick={() => toggleSelectItem(log.id)} className="p-1 hover:bg-gray-200 rounded">
                            {selectedItems.has(log.id)
                              ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" />
                              : <Square className="h-3.5 w-3.5 text-gray-400" />}
                          </button>
                        </TableCell>

                       <TableCell className="py-2 px-3">
  <div>
    <div className="flex items-center gap-1">
      <p className={`text-xs font-semibold ${log.is_blocked ? 'text-red-600' : 'text-gray-800'}`}>
        {log.visitor_name}
      </p>
      {log.is_blocked === 1 && (
        <span className="inline-flex items-center gap-0.5 bg-red-100 text-red-700 text-[8px] font-bold px-1 py-0.5 rounded">
          <Ban className="h-2 w-2" /> BLOCKED
        </span>
      )}
    </div>
    {log.qr_code && (
      <p className="text-[9px] text-blue-600 font-mono mt-0.5">{log.qr_code}</p>
    )}
    {log.is_blocked === 1 && log.block_reason && (
      <p className="text-[8px] text-red-400 mt-0.5 truncate max-w-[120px]" title={log.block_reason}>
        {log.block_reason}
      </p>
    )}
  </div>
</TableCell>

                        <TableCell className="py-2 px-3 text-xs text-gray-600">{log.visitor_phone}</TableCell>

                        <TableCell className="py-2 px-3 text-xs text-gray-700 font-medium">{log.tenant_name}</TableCell>

                        <TableCell className="py-2 px-3 text-xs text-gray-600 max-w-[130px] truncate">{log.property_name}</TableCell>

                        <TableCell className="py-2 px-3 text-xs text-gray-600">{log.room_number}</TableCell>

                        <TableCell className="py-2 px-3 text-xs text-gray-600">{fmt(log.entry_time)}</TableCell>

                        <TableCell className="py-2 px-3 text-xs">
                          {log.exit_time ? (
                            <span className="text-gray-600">{fmt(log.exit_time)}</span>
                          ) : log.tentative_exit_time ? (
                            <span className="text-orange-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {fmt(log.tentative_exit_time)}
                            </span>
                          ) : <span className="text-gray-400">—</span>}
                        </TableCell>

                        <TableCell className="py-2 px-3 text-xs text-gray-600">{log.purpose}</TableCell>

                        <TableCell className="py-2 px-3">
                          <Badge className={`text-[9px] px-1.5 font-bold ${statusColor(log.status)}`}>
                            {statusLabel(log.status)}
                          </Badge>
                        </TableCell>
<TableCell className="py-2 px-3">
  <div className="flex justify-end items-center gap-1 flex-nowrap">

    {/* View */}
    {can('view_visitor_logs') && (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 w-7 p-0 flex items-center justify-center text-blue-600 hover:bg-blue-500 rounded-md"
      onClick={() => setViewItem(log)}
      title="View"
    >
      <Eye className="h-3.5 w-3.5" />
    </Button>
    )}

    {/* Check Out — only if active */}
    {can('checkout_visitor') && (log.status === 'checked_in' || log.status === 'overstayed') && !log.is_blocked && (
      <Button
        size="sm"
        variant="ghost"
        className="h-7 px-1.5 flex items-center gap-1 text-green-600 hover:bg-green-500 hover:text-green-700 rounded-md text-[10px]"
        onClick={() => handleCheckOut(log.id)}
        title="Check Out"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Check Out</span>
      </Button>
    )}

    {/* UNBLOCK — show if blocked */}
    {can('block_visitor') && log.is_blocked === 1 ? (
      <Button
        size="sm"
        variant="ghost"
        className="h-7 px-1.5 flex items-center gap-1 text-green-700 hover:bg-green-900 hover:text-green-900 rounded-md text-[10px] border border-green-300 bg-green-50"
        onClick={() => handleUnblock(log)}
        title="Unblock Visitor"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Unblock</span>
      </Button>
    ) : can('block_visitor') ? (
      /* BLOCK — show if not blocked */
      <Button
        size="sm"
        variant="ghost"
        className="h-7 px-1.5 flex items-center gap-1 text-orange-600 hover:bg-orange-500 rounded-md text-[10px]"
        onClick={() => handleBlock(log)}
        title="Block Visitor"
      >
        <Ban className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Block</span>
      </Button>
    ) : null}

    {/* Delete */}
        {can('delete_visitor_logs') && (

    <Button
      size="sm"
      variant="ghost"
      className="h-7 w-7 p-0 flex items-center justify-center text-red-500 hover:bg-red-500 rounded-md"
      onClick={() => handleDelete(log.id, log.visitor_name)}
      title="Delete"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
        )}

  </div>
</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </main>

        {/* ── FILTER DRAWER ──────────────────────────────────────────── */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`fixed top-0 right-0 h-full z-40 w-72 sm:w-80 bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="bg-gradient-to-r from-blue-700 to-cyan-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">Filters</span>
              {hasFilters && (
                <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">
                  {activeCount} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasFilters && (
                <button onClick={clearFilters} className="text-[10px] text-blue-200 hover:text-white font-semibold">
                  Clear all
                </button>
              )}
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Status filter */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-blue-500" /> Status
              </p>
              <div className="space-y-1">
                {(['all', 'checked_in', 'checked_out', 'overstayed'] as StatusFilter[]).map(s => (
                  <label key={s} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                    ${statusFilter === s ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
                    <input type="radio" name="status" value={s} checked={statusFilter === s}
                      onChange={() => setStatusFilter(s)} className="sr-only" />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusFilter === s ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <span className="text-[12px] font-medium">
                      {s === 'all' ? 'All Statuses' : statusLabel(s)}
                    </span>
                    {statusFilter === s && (
                      <span className="ml-auto">
                        <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Property filter */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Building className="h-3 w-3 text-indigo-500" /> Property
              </p>
              <div className="space-y-1">
                {[{ id: 'all', name: 'All Properties' }, ...uniqueProperties].map(p => (
                  <label key={p.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                    ${propertyFilter === p.id ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
                    <input type="radio" name="prop" value={p.id} checked={propertyFilter === p.id}
                      onChange={() => setPropertyFilter(p.id)} className="sr-only" />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${propertyFilter === p.id ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <span className="text-[12px] font-medium truncate">{p.name}</span>
                    {propertyFilter === p.id && (
                      <span className="ml-auto flex-shrink-0">
                        <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
            <button onClick={clearFilters} disabled={!hasFilters}
              className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
              Clear All
            </button>
            <button onClick={() => setSidebarOpen(false)}
              className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[11px] font-semibold hover:from-blue-700 hover:to-cyan-700">
              Apply & Close
            </button>
          </div>
        </aside>
      </div>

      {/* ══ NEW VISITOR MODAL ══════════════════════════════════════════════ */}
      <Dialog open={showModal} onOpenChange={v => { if (!v) setShowModal(false); }}>
  <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
    <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white px-4 py-2 flex items-center justify-between rounded-t-lg">
      <div>
        <h2 className="text-sm font-semibold">New Visitor Entry</h2>
        <p className="text-[9px] text-blue-100">Register a new visitor</p>
      </div>
      <DialogClose asChild>
        <button className="p-1 rounded-full hover:bg-white/20 transition"><X className="h-3.5 w-3.5" /></button>
      </DialogClose>
    </div>
    <div className="p-3 overflow-y-auto max-h-[calc(90vh-80px)]">
      <NewVisitorEntry
        onSuccess={data => {
          toast.success(`Visitor ${data?.visitor_name} registered!`);
          setShowModal(false);
          loadAll();
        }}
        onClose={() => setShowModal(false)}
      />
    </div>
  </DialogContent>
</Dialog>

      {/* ══ VIEW DETAIL MODAL ══════════════════════════════════════════════ */}
     {viewItem && (
  <Dialog open={!!viewItem} onOpenChange={v => { if (!v) setViewItem(null); }}>
    {/* Width badhayi - max-w-4xl (896px) ya max-w-5xl (1024px) */}
    <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
        <div>
          <h2 className="text-base font-semibold">Visitor Details</h2>
          <p className="text-xs text-blue-100">{viewItem.visitor_name} — {viewItem.property_name}</p>
        </div>
        <DialogClose asChild>
          <button className="p-1.5 rounded-full hover:bg-white/20 transition"><X className="h-4 w-4" /></button>
        </DialogClose>
      </div>

      <div className="p-4 overflow-y-auto max-h-[75vh] space-y-3">
        {/* Status badge */}
        <div className="flex items-center justify-between">
          <Badge className={`text-[10px] px-2 py-1 font-bold ${statusColor(viewItem.status)}`}>
            {statusLabel(viewItem.status)}
          </Badge>
          {viewItem.qr_code && (
            <span className="text-[10px] text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
              {viewItem.qr_code}
            </span>
          )}
        </div>

        {/* 4x4 Grid - 4 columns on all screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {[
            ['Visitor Name', viewItem.visitor_name],
            ['Visitor Phone', viewItem.visitor_phone],
            ['Tenant', viewItem.tenant_name],
            ['Tenant Phone', viewItem.tenant_phone || '—'],
            ['Property', viewItem.property_name],
            ['Room', viewItem.room_number],
            ['Purpose', viewItem.purpose],
            ['ID Type', viewItem.id_proof_type],
            ['ID Number', viewItem.id_proof_number],
            ['Vehicle', viewItem.vehicle_number || '—'],
            ['Guard', viewItem.security_guard_name],
            ['Approval', viewItem.approval_status],
            ['Entry Time', fmt(viewItem.entry_time)],
            ['Exit Time', viewItem.exit_time ? fmt(viewItem.exit_time) : '—'],
            ['Expected Exit', viewItem.tentative_exit_time ? fmt(viewItem.tentative_exit_time) : '—'],
            viewItem.checked_out_by ? ['Checked Out By', viewItem.checked_out_by] : ['Checked Out By', '—'],
          ].filter(Boolean).map(([label, value]) => (
            <div key={label as string} className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-[10px] text-gray-500 font-medium">{label}</p>
              <p className="text-[11px] font-semibold text-gray-800 mt-0.5 break-words">{value as string}</p>
            </div>
          ))}
        </div>

        {/* Notes */}
        {viewItem.notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-[10px] font-bold text-amber-800 mb-1">Notes</p>
            <p className="text-[11px] text-amber-700">{viewItem.notes}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1 flex-wrap">
  {can('checkout_visitor') && (viewItem.status === 'checked_in' || viewItem.status === 'overstayed') && !viewItem.is_blocked && (
            <Button onClick={() => { handleCheckOut(viewItem.id); setViewItem(null); }}
              className="flex-1 h-8 text-[11px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-1.5">
              <LogOut className="h-3.5 w-3.5" /> Check Out Now
            </Button>
          )}

  {can('block_visitor') && (viewItem.is_blocked === 1 ? (
            <Button
              onClick={() => { handleUnblock(viewItem); setViewItem(null); }}
              className="flex-1 h-8 text-[11px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Unblock Visitor
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => { handleBlock(viewItem); setViewItem(null); }}
              className="h-8 text-[11px] border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
            >
              <Ban className="h-3.5 w-3.5" /> Block
            </Button>
          ))}

          {/* Blocked reason shown in modal */}
          {viewItem.is_blocked === 1 && viewItem.block_reason && (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-[9px] font-bold text-red-700">Block Reason</p>
              <p className="text-[10px] text-red-600">{viewItem.block_reason}</p>
              {viewItem.blocked_by && (
                <p className="text-[9px] text-red-400 mt-0.5">By: {viewItem.blocked_by}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  </Dialog>
)}
    </div>
  );
}