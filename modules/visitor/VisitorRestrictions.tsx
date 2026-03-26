
// VisitorRestrictions.tsx
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  ShieldAlert, Plus, Trash2, Loader2, X, Download,
  RefreshCw, Filter, Eye, ToggleLeft, ToggleRight,
  Building, Clock, AlertTriangle, CheckCircle, XCircle,
  Check, Search, StickyNote, Square, CheckSquare,
  Edit,
} from 'lucide-react';
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import {
  getRestrictions, createRestriction, updateRestriction,
  deleteRestriction, bulkDeleteRestrictions,
  toggleRestrictionStatus, getRestrictionStats,
  VisitorRestriction, RestrictionPayload,
} from "@/lib/restrictionApi";
import { listProperties } from "@/lib/propertyApi";

// ─── Style tokens ───────────────────────────────────────────────────────────
const F = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L = "block text-[11px] font-semibold text-gray-500 mb-0.5";

const SH = ({ icon, title, color = "text-blue-600" }: { icon: React.ReactNode; title: string; color?: string }) => (
  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
    {icon}{title}
  </div>
);

// Add this helper at the top if not already present
const safeNum = (v: any): number => {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
};

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

const RESTRICTION_TYPES = ['Time-Based', 'Full Restriction', 'Conditional'];

const typeColor = (t: string) => {
  switch (t) {
    case 'Time-Based':       return 'bg-blue-100 text-blue-700';
    case 'Full Restriction': return 'bg-red-100 text-red-700';
    case 'Conditional':      return 'bg-amber-100 text-amber-700';
    default:                 return 'bg-gray-100 text-gray-700';
  }
};

const fmt = (d?: string | null) => {
  if (!d) return '—';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
};

const toInputDT = (d?: string | null) => {
  if (!d) return '';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
  } catch { return ''; }
};


// ── Searchable Property Dropdown ────────────────────────────────────────────
interface PropOption { id: string; name: string; }

function PropertySearchDropdown({ value, onChange, properties }: {
  value: string;
  onChange: (id: string, name: string) => void;
  properties: PropOption[];
}) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const ref               = useRef<HTMLDivElement>(null);
  const selected          = properties.find(p => p.id === value);

  const filtered = useMemo(() =>
    properties.filter(p => p.name.toLowerCase().includes(query.toLowerCase())),
    [properties, query]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setQuery(''); }}
        className={`${F} w-full flex items-center justify-between px-3 text-left`}
      >
        <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
          {selected ? selected.name : 'Search & select property…'}
        </span>
        <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Type to search…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 bg-gray-50"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-[11px] text-gray-400 text-center">No properties found</div>
            ) : (
              filtered.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { onChange(p.id, p.name); setOpen(false); setQuery(''); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] hover:bg-blue-50 text-left transition-colors
                    ${value === p.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}
                >
                  <Building className="h-3 w-3 flex-shrink-0 text-gray-400" />
                  {p.name}
                  {value === p.id && <Check className="h-3 w-3 ml-auto text-blue-600" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function VisitorRestrictions() {
  const [restrictions, setRestrictions] = useState<VisitorRestriction[]>([]);
  const [properties, setProperties]     = useState<PropOption[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editingItem, setEditingItem]   = useState<VisitorRestriction | null>(null);
  const [submitting, setSubmitting]     = useState(false);
  const [viewItem, setViewItem]         = useState<VisitorRestriction | null>(null);
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  // Selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll]         = useState(false);

  // Filters
  const [typeFilter, setTypeFilter]         = useState('all');
  const [statusFilter, setStatusFilter]     = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');

  // Column search
  const [colSearch, setColSearch] = useState({
    property_name: '', restriction_type: '', description: '', start_time: '', status: '',
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0, active: 0, inactive: 0,
    time_based: 0, full_restriction: 0, conditional: 0,
  });

  const emptyForm: RestrictionPayload = {
    property_id: '', property_name: '',
    restriction_type: 'Time-Based',
    start_time: '', end_time: '',
    description: '', is_active: true,
  };
  const [formData, setFormData] = useState<RestrictionPayload>(emptyForm);
  const set = (k: string, v: any) => setFormData(p => ({ ...p, [k]: v }));

  // ── Load ──────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (typeFilter     !== 'all') filters.restriction_type = typeFilter;
      if (statusFilter   !== 'all') filters.is_active        = statusFilter;
      if (propertyFilter !== 'all') filters.property_id      = propertyFilter;

      const [rRes, sRes] = await Promise.all([
        getRestrictions(filters),
        getRestrictionStats(),
      ]);
      setRestrictions(rRes.data || []);
      setStats(sRes.data || { total: 0, active: 0, inactive: 0, time_based: 0, full_restriction: 0, conditional: 0 });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load restrictions');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, propertyFilter]);

  useEffect(() => {
    (async () => {
      try {
        const res = await listProperties({ is_active: true });
        const list = res?.data?.data || res?.data || [];
        setProperties((Array.isArray(list) ? list : Object.values(list)).map((p: any) => ({
          id: String(p.id),
          name: p.name,
        })));
      } catch (err) {
        console.error('Failed to load properties:', err);
      }
    })();
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Column search filter ───────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return restrictions.filter(r => {
      const cs = colSearch;
      const pn = !cs.property_name    || r.property_name?.toLowerCase().includes(cs.property_name.toLowerCase());
      const rt = !cs.restriction_type || r.restriction_type?.toLowerCase().includes(cs.restriction_type.toLowerCase());
      const de = !cs.description      || r.description?.toLowerCase().includes(cs.description.toLowerCase());
      const st = !cs.start_time       || fmt(r.start_time).toLowerCase().includes(cs.start_time.toLowerCase());
      const ss = !cs.status           || (r.is_active ? 'active' : 'inactive').includes(cs.status.toLowerCase());
      return pn && rt && de && st && ss;
    });
  }, [restrictions, colSearch]);

  // ── Selection ─────────────────────────────────────────────────────────
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

  // ── Open add / edit ───────────────────────────────────────────────────
  const openAdd = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (r: VisitorRestriction) => {
    setEditingItem(r);
    setFormData({
      property_id:      r.property_id      || '',
      property_name:    r.property_name    || '',
      restriction_type: r.restriction_type || 'Time-Based',
      start_time:       toInputDT(r.start_time),
      end_time:         toInputDT(r.end_time),
      description:      r.description      || '',
      is_active:        r.is_active !== undefined ? r.is_active : true,
    });
    setShowForm(true);
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  // FIX: Validate all required fields in one step, send correct payload
  const handleSubmit = async () => {
    if (!formData.property_name?.trim()) {
      toast.error('Property is required'); return;
    }
    if (!formData.restriction_type) {
      toast.error('Restriction type is required'); return;
    }
    if (!formData.description?.trim()) {
      toast.error('Description is required'); return;
    }

    setSubmitting(true);
    try {
      // FIX: Build payload carefully — don't send empty strings for optional fields
     const payload: RestrictionPayload = {
  property_id: formData.property_id ? String(formData.property_id).trim() || undefined : undefined,  // ✅
  property_name:    formData.property_name.trim(),
  restriction_type: formData.restriction_type,
  description:      formData.description.trim(),
  is_active:        formData.is_active ?? true,
  start_time:       formData.start_time
    ? new Date(formData.start_time).toISOString()
    : undefined,
  end_time:         formData.end_time
    ? new Date(formData.end_time).toISOString()
    : undefined,
};

      if (editingItem) {
        await updateRestriction(editingItem.id, payload);
        toast.success('Restriction updated successfully');
      } else {
        await createRestriction(payload);
        toast.success('Restriction created successfully');
      }
      setShowForm(false);
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save restriction');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle status ──────────────────────────────────────────────────────
  const handleToggle = async (id: string, name: string, current: boolean) => {
    try {
      await toggleRestrictionStatus(id);
      toast.success(`Restriction ${current ? 'deactivated' : 'activated'}`);
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Toggle failed');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, name?: string) => {
    const result = await Swal.fire({
      title: 'Delete Restriction?',
      text: `Delete restriction for "${name}"? This cannot be undone!`,
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
      await deleteRestriction(id);
      toast.success('Restriction deleted');
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  // ── Bulk delete ────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) { toast.error('Select items first'); return; }
    const result = await Swal.fire({
      title: 'Delete Selected?',
      text: `Delete ${selectedItems.size} restriction(s)? This cannot be undone!`,
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
      await bulkDeleteRestrictions(Array.from(selectedItems));
      toast.success(`${selectedItems.size} restriction(s) deleted`);
      setSelectedItems(new Set()); setSelectAll(false);
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Bulk delete failed');
    }
  };

  // ── Export CSV ─────────────────────────────────────────────────────────

const handleExport = () => {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // 1. Main restrictions sheet
    const restrictionsData = filteredItems.map(r => ({
      'Property Name': r.property_name,
      'Restriction Type': r.restriction_type,
      'Start Time': fmt(r.start_time),
      'End Time': fmt(r.end_time),
      'Description': r.description || '',
      'Status': r.is_active ? 'Active' : 'Inactive',
      'Created Date': r.created_at ? fmt(r.created_at) : '',
      'Last Updated': r.updated_at ? fmt(r.updated_at) : '',
      'Restriction ID': r.id,
      'Property ID': r.property_id || ''
    }));

    const restrictionsWs = XLSX.utils.json_to_sheet(restrictionsData);
    
    // Auto-size columns
    const restrictionsColWidths = [];
    const restrictionsHeaders = Object.keys(restrictionsData[0] || {});
    restrictionsHeaders.forEach(header => {
      const maxLength = Math.max(
        header.length,
        ...restrictionsData.map(row => String(row[header] || '').length)
      );
      restrictionsColWidths.push({ wch: Math.min(maxLength + 2, 50) });
    });
    restrictionsWs['!cols'] = restrictionsColWidths;
    
    XLSX.utils.book_append_sheet(wb, restrictionsWs, "Restrictions");

    // 2. Summary sheet
    const totalRestrictions = filteredItems.length;
    const activeCount = filteredItems.filter(r => r.is_active).length;
    const inactiveCount = filteredItems.filter(r => !r.is_active).length;
    const timeBasedCount = filteredItems.filter(r => r.restriction_type === 'Time-Based').length;
    const fullRestrictionCount = filteredItems.filter(r => r.restriction_type === 'Full Restriction').length;
    const conditionalCount = filteredItems.filter(r => r.restriction_type === 'Conditional').length;

    const summaryData = [
      ['Metric', 'Value'],
      ['Total Restrictions', totalRestrictions],
      ['Active Restrictions', activeCount],
      ['Inactive Restrictions', inactiveCount],
      ['Time-Based Restrictions', timeBasedCount],
      ['Full Restrictions', fullRestrictionCount],
      ['Conditional Restrictions', conditionalCount],
      ['Unique Properties', new Set(filteredItems.map(r => r.property_name)).size],
      ['Export Date', new Date().toLocaleString('en-IN')]
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // 3. Status breakdown sheet
    const statusData = [
      ['Status', 'Count', 'Percentage', 'Restriction Types'],
      ['Active', 
        activeCount,
        totalRestrictions > 0 ? `${((activeCount / totalRestrictions) * 100).toFixed(1)}%` : '0%',
        `Time: ${filteredItems.filter(r => r.is_active && r.restriction_type === 'Time-Based').length}, ` +
        `Full: ${filteredItems.filter(r => r.is_active && r.restriction_type === 'Full Restriction').length}, ` +
        `Cond: ${filteredItems.filter(r => r.is_active && r.restriction_type === 'Conditional').length}`
      ],
      ['Inactive',
        inactiveCount,
        totalRestrictions > 0 ? `${((inactiveCount / totalRestrictions) * 100).toFixed(1)}%` : '0%',
        `Time: ${filteredItems.filter(r => !r.is_active && r.restriction_type === 'Time-Based').length}, ` +
        `Full: ${filteredItems.filter(r => !r.is_active && r.restriction_type === 'Full Restriction').length}, ` +
        `Cond: ${filteredItems.filter(r => !r.is_active && r.restriction_type === 'Conditional').length}`
      ]
    ];

    const statusWs = XLSX.utils.aoa_to_sheet(statusData);
    XLSX.utils.book_append_sheet(wb, statusWs, "Status Breakdown");

    // 4. Property-wise analysis sheet
    const propertyMap = new Map();
    filteredItems.forEach(r => {
      if (!propertyMap.has(r.property_name)) {
        propertyMap.set(r.property_name, {
          property: r.property_name,
          total: 0,
          active: 0,
          timeBased: 0,
          fullRestriction: 0,
          conditional: 0,
          restrictions: []
        });
      }
      const prop = propertyMap.get(r.property_name);
      prop.total++;
      if (r.is_active) prop.active++;
      if (r.restriction_type === 'Time-Based') prop.timeBased++;
      else if (r.restriction_type === 'Full Restriction') prop.fullRestriction++;
      else if (r.restriction_type === 'Conditional') prop.conditional++;
      prop.restrictions.push(r.description);
    });

    const propertyData = Array.from(propertyMap.values()).map(p => ({
      'Property': p.property,
      'Total Restrictions': p.total,
      'Active Restrictions': p.active,
      'Inactive Restrictions': p.total - p.active,
      'Active %': p.total > 0 ? `${((p.active / p.total) * 100).toFixed(1)}%` : '0%',
      'Time-Based': p.timeBased,
      'Full Restrictions': p.fullRestriction,
      'Conditional': p.conditional
    }));

    if (propertyData.length > 0) {
      const propertyWs = XLSX.utils.json_to_sheet(propertyData);
      XLSX.utils.book_append_sheet(wb, propertyWs, "By Property");
    }

    // 5. Time window analysis sheet
    const timeWindowData = filteredItems.map(r => {
      // Calculate duration if both times exist
      let duration = '';
      if (r.start_time && r.end_time) {
        try {
          const start = new Date(r.start_time).getTime();
          const end = new Date(r.end_time).getTime();
          const hours = (end - start) / (1000 * 60 * 60);
          if (hours > 0) {
            const days = Math.floor(hours / 24);
            const remainingHours = Math.round(hours % 24);
            duration = days > 0 ? `${days}d ${remainingHours}h` : `${remainingHours}h`;
          }
        } catch { duration = 'N/A'; }
      }
      
      return {
        'Property': r.property_name,
        'Restriction Type': r.restriction_type,
        'Start Time': fmt(r.start_time),
        'End Time': fmt(r.end_time),
        'Duration': duration || 'N/A',
        'Status': r.is_active ? 'Active' : 'Inactive'
      };
    });

    const timeWindowWs = XLSX.utils.json_to_sheet(timeWindowData);
    XLSX.utils.book_append_sheet(wb, timeWindowWs, "Time Windows");

    // 6. Type distribution sheet
    const typeDistribution = [
      ['Restriction Type', 'Count', 'Percentage', 'Active Count'],
      ['Time-Based', 
        timeBasedCount,
        totalRestrictions > 0 ? `${((timeBasedCount / totalRestrictions) * 100).toFixed(1)}%` : '0%',
        filteredItems.filter(r => r.restriction_type === 'Time-Based' && r.is_active).length
      ],
      ['Full Restriction',
        fullRestrictionCount,
        totalRestrictions > 0 ? `${((fullRestrictionCount / totalRestrictions) * 100).toFixed(1)}%` : '0%',
        filteredItems.filter(r => r.restriction_type === 'Full Restriction' && r.is_active).length
      ],
      ['Conditional',
        conditionalCount,
        totalRestrictions > 0 ? `${((conditionalCount / totalRestrictions) * 100).toFixed(1)}%` : '0%',
        filteredItems.filter(r => r.restriction_type === 'Conditional' && r.is_active).length
      ]
    ];

    const typeWs = XLSX.utils.aoa_to_sheet(typeDistribution);
    XLSX.utils.book_append_sheet(wb, typeWs, "Type Distribution");

    // 7. Active vs Inactive comparison sheet
    const comparisonData = [
      ['Metric', 'Active', 'Inactive', 'Total'],
      ['Count', activeCount, inactiveCount, totalRestrictions],
      ['Time-Based', 
        filteredItems.filter(r => r.is_active && r.restriction_type === 'Time-Based').length,
        filteredItems.filter(r => !r.is_active && r.restriction_type === 'Time-Based').length,
        timeBasedCount
      ],
      ['Full Restriction',
        filteredItems.filter(r => r.is_active && r.restriction_type === 'Full Restriction').length,
        filteredItems.filter(r => !r.is_active && r.restriction_type === 'Full Restriction').length,
        fullRestrictionCount
      ],
      ['Conditional',
        filteredItems.filter(r => r.is_active && r.restriction_type === 'Conditional').length,
        filteredItems.filter(r => !r.is_active && r.restriction_type === 'Conditional').length,
        conditionalCount
      ]
    ];

    const comparisonWs = XLSX.utils.aoa_to_sheet(comparisonData);
    XLSX.utils.book_append_sheet(wb, comparisonWs, "Active vs Inactive");

    // 8. Monthly creation trend (if created_at exists)
    const monthlyMap = new Map();
    filteredItems.forEach(r => {
      if (r.created_at) {
        const month = new Date(r.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, {
            month,
            total: 0,
            active: 0,
            timeBased: 0,
            fullRestriction: 0,
            conditional: 0
          });
        }
        const m = monthlyMap.get(month);
        m.total++;
        if (r.is_active) m.active++;
        if (r.restriction_type === 'Time-Based') m.timeBased++;
        else if (r.restriction_type === 'Full Restriction') m.fullRestriction++;
        else if (r.restriction_type === 'Conditional') m.conditional++;
      }
    });

    const monthlyData = Array.from(monthlyMap.values()).map(m => ({
      'Month': m.month,
      'Total Created': m.total,
      'Active': m.active,
      'Active %': m.total > 0 ? `${((m.active / m.total) * 100).toFixed(1)}%` : '0%',
      'Time-Based': m.timeBased,
      'Full Restrictions': m.fullRestriction,
      'Conditional': m.conditional
    }));

    if (monthlyData.length > 0) {
      const monthlyWs = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, monthlyWs, "Monthly Trend");
    }

    // Generate filename
    const filename = `visitor_restrictions_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    
    toast.success(`Exported ${filteredItems.length} restrictions successfully`);
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export restrictions');
  }
};

  const hasFilters   = typeFilter !== 'all' || statusFilter !== 'all' || propertyFilter !== 'all';
  const hasColSearch = Object.values(colSearch).some(v => v !== '');
  const activeCount  = [typeFilter !== 'all', statusFilter !== 'all', propertyFilter !== 'all'].filter(Boolean).length;
  const clearFilters   = () => { setTypeFilter('all'); setStatusFilter('all'); setPropertyFilter('all'); };
  const clearColSearch = () => setColSearch({ property_name: '', restriction_type: '', description: '', start_time: '', status: '' });

  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-gray-50 ">

      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <div className="sticky top-20 z-10">
<div className="px-0 sm:px-0 mt-0 md:-mt-3 pb-0 flex items-end justify-end gap-2">          <div className="flex items-end justify-end gap-1.5 flex-shrink-0">
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

            <button onClick={handleExport}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium transition-colors">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button onClick={loadAll} disabled={loading}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button onClick={openAdd}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm transition-colors">
              <Plus className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Add Restriction</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-0 sm:px-0 pb-3 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <StatCard title="Total"            value={stats.total}            icon={ShieldAlert}   color="bg-blue-600"  bg="bg-gradient-to-br from-blue-50 to-blue-100" />
            <StatCard title="Active"           value={stats.active}           icon={CheckCircle}   color="bg-green-600" bg="bg-gradient-to-br from-green-50 to-green-100" />
            <StatCard title="Inactive"         value={stats.inactive}         icon={XCircle}       color="bg-gray-500"  bg="bg-gradient-to-br from-gray-50 to-gray-100" />
            <StatCard title="Full Restriction" value={stats.full_restriction} icon={AlertTriangle} color="bg-red-600"   bg="bg-gradient-to-br from-red-50 to-red-100" />
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div className="relative">
        <main className="p-0 sm:p-0">

          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-lg">
                {selectedItems.size} selected
              </span>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}
                className="h-7 text-[10px] px-2.5 bg-red-600 hover:bg-red-700 gap-1">
                <Trash2 className="h-3 w-3" /> Delete Selected
              </Button>
            </div>
          )}

          <Card className="border rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
              <span className="text-sm font-semibold text-gray-700">
                All Restrictions ({filteredItems.length})
                {selectedItems.size > 0 && (
                  <span className="ml-2 text-blue-600 text-xs">({selectedItems.size} selected)</span>
                )}
              </span>
              {hasColSearch && (
                <button onClick={clearColSearch} className="text-[10px] text-blue-600 font-semibold hover:underline">
                  Clear Search
                </button>
              )}
            </div>
<div
  className="overflow-auto rounded-b-lg transition-all duration-300"
  style={{
    maxHeight: selectedItems.size > 0
      ? (window.innerWidth >= 768 ? '410px' : '320px')
      : (window.innerWidth >= 768 ? '460px' : '370px')
  }}
>            <div className="min-w-[900px]">
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
                      <TableHead className="py-2 px-3 text-xs">Property</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Type</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Start Time</TableHead>
                      <TableHead className="py-2 px-3 text-xs">End Time</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Description</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Status</TableHead>
                      <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
                    </TableRow>

                    {/* Column search row */}
                    <TableRow className="bg-gray-50/80">
                      <TableCell className="py-1 px-2" />
                      {[
                        { key: 'property_name',    ph: 'Property…' },
                        { key: 'restriction_type', ph: 'Type…' },
                        { key: 'start_time',       ph: 'Start…' },
                        { key: null,               ph: '' },
                        { key: 'description',      ph: 'Description…' },
                        { key: 'status',           ph: 'Status…' },
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
                        <TableCell colSpan={8} className="text-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Loading restrictions…</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <ShieldAlert className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500">No restrictions found</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.map(r => (
                      <TableRow key={r.id} className="hover:bg-gray-50">
                        <TableCell className="py-2 px-3">
                          <button onClick={() => toggleSelectItem(r.id)} className="p-1 hover:bg-gray-200 rounded">
                            {selectedItems.has(r.id)
                              ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" />
                              : <Square className="h-3.5 w-3.5 text-gray-400" />}
                          </button>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs font-medium text-gray-800">{r.property_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <Badge className={`text-[9px] px-1.5 font-semibold ${typeColor(r.restriction_type)}`}>
                            {r.restriction_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            {fmt(r.start_time)}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            {fmt(r.end_time)}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600 max-w-[200px]">
                          <p className="truncate" title={r.description}>{r.description || '—'}</p>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <Badge className={`text-[9px] px-1.5 font-bold ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {r.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => setViewItem(r)} title="View">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-amber-50 hover:text-amber-600"
                              onClick={() => openEdit(r)} title="Edit">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost"
                              className={`h-6 w-6 p-0 ${r.is_active ? 'hover:bg-orange-50 hover:text-orange-600' : 'hover:bg-green-50 hover:text-green-600'}`}
                              onClick={() => handleToggle(r.id, r.property_name, r.is_active)}
                              title={r.is_active ? 'Deactivate' : 'Activate'}>
                              {r.is_active
                                ? <ToggleRight className="h-3.5 w-3.5 text-green-500" />
                                : <ToggleLeft  className="h-3.5 w-3.5 text-gray-400" />}
                            </Button>
                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDelete(r.id, r.property_name)} title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
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
          <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
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
                <CheckCircle className="h-3 w-3 text-green-500" /> Status
              </p>
              <div className="space-y-1">
                {[
                  { value: 'all',   label: 'All Statuses' },
                  { value: 'true',  label: 'Active' },
                  { value: 'false', label: 'Inactive' },
                ].map(s => (
                  <label key={s.value} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                    ${statusFilter === s.value ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
                    <input type="radio" name="status" value={s.value} checked={statusFilter === s.value}
                      onChange={() => setStatusFilter(s.value)} className="sr-only" />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusFilter === s.value ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <span className="text-[12px] font-medium">{s.label}</span>
                    {statusFilter === s.value && (
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

            {/* Type filter */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <ShieldAlert className="h-3 w-3 text-blue-500" /> Restriction Type
              </p>
              <div className="space-y-1">
                {['all', ...RESTRICTION_TYPES].map(t => (
                  <label key={t} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                    ${typeFilter === t ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
                    <input type="radio" name="type" value={t} checked={typeFilter === t}
                      onChange={() => setTypeFilter(t)} className="sr-only" />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${typeFilter === t ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <span className="text-[12px] font-medium">{t === 'all' ? 'All Types' : t}</span>
                    {typeFilter === t && (
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
                {[{ id: 'all', name: 'All Properties' }, ...properties].map(p => (
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
              className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:from-blue-700 hover:to-indigo-700">
              Apply & Close
            </button>
          </div>
        </aside>
      </div>

      {/* ══ ADD / EDIT DIALOG — SINGLE STEP ════════════════════════════════ */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-hidden p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">{editingItem ? 'Edit Restriction' : 'New Visitor Restriction'}</h2>
              <p className="text-xs text-blue-100">Fill in all the details below</p>
            </div>
            <DialogClose asChild>
              <button className="p-1.5 rounded-full hover:bg-white/20 transition"><X className="h-4 w-4" /></button>
            </DialogClose>
          </div>

          {/* Form body */}
          <div className="p-4 overflow-y-auto max-h-[75vh] space-y-4">

            {/* Property */}
            <div>
              <SH icon={<Building className="h-3 w-3" />} title="Property" />
              <div className="space-y-2">
                <div>
                  <label className={L}>Select Property <span className="text-red-400">*</span></label>
                  <PropertySearchDropdown
                    value={formData.property_id || ''}
                    onChange={(id, name) => setFormData(p => ({ ...p, property_id: id, property_name: name }))}
                    properties={properties}
                  />
                </div>
                <div>
                  <label className={L}>Property Name <span className="text-red-400">*</span></label>
                  <Input
                    className={F}
                    placeholder="Auto-filled or enter manually"
                    value={formData.property_name}
                    onChange={e => set('property_name', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Restriction Type */}
            <div>
              <SH icon={<ShieldAlert className="h-3 w-3" />} title="Restriction Type" color="text-red-600" />
              <div className="grid grid-cols-3 gap-2">
                {RESTRICTION_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('restriction_type', t)}
                    className={`py-2.5 px-3 rounded-lg border-2 text-[11px] font-semibold transition-all text-center
                      ${formData.restriction_type === t
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Window */}
            <div>
              <SH icon={<Clock className="h-3 w-3" />} title="Time Window" color="text-amber-600" />
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                <div>
                  <label className={L}>Start Time</label>
                  <Input type="datetime-local" className={F}
                    value={formData.start_time || ''}
                    onChange={e => set('start_time', e.target.value)} />
                </div>
                <div>
                  <label className={L}>End Time</label>
                  <Input type="datetime-local" className={F}
                    value={formData.end_time || ''}
                    onChange={e => set('end_time', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <SH icon={<StickyNote className="h-3 w-3" />} title="Description" color="text-indigo-600" />
              <label className={L}>Description <span className="text-red-400">*</span></label>
              <Textarea
                className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-0 min-h-[80px] resize-none"
                rows={3}
                placeholder="Describe the restriction details, rules, and exceptions…"
                value={formData.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            {/* Status toggle */}
            <div>
              <SH icon={<ToggleRight className="h-3 w-3" />} title="Status" color="text-green-600" />
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => set('is_active', !formData.is_active)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                    ${formData.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow
                    ${formData.is_active ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
                <span className={`text-[11px] font-semibold ${formData.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                  {formData.is_active ? 'Active — restriction is enforced' : 'Inactive — restriction is disabled'}
                </span>
              </div>
            </div>

            {/* Submit button */}
            <Button
              disabled={submitting}
              onClick={handleSubmit}
              className="w-full h-9 text-[12px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
              ) : editingItem ? (
                <><Check className="h-3.5 w-3.5" /> Update Restriction</>
              ) : (
                <><Check className="h-3.5 w-3.5" /> Create Restriction</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ VIEW DIALOG ══════════════════════════════════════════════════ */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={v => { if (!v) setViewItem(null); }}>
          <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-base font-semibold">Restriction Details</h2>
                <p className="text-xs text-blue-100">{viewItem.property_name}</p>
              </div>
              <DialogClose asChild>
                <button className="p-1.5 rounded-full hover:bg-white/20"><X className="h-4 w-4" /></button>
              </DialogClose>
            </div>

            <div className="p-4 overflow-y-auto max-h-[75vh] space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] px-2 py-1 font-bold ${typeColor(viewItem.restriction_type)}`}>
                  {viewItem.restriction_type}
                </Badge>
                <Badge className={`text-[10px] px-2 py-1 font-bold ${viewItem.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {viewItem.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Property',   viewItem.property_name],
                  ['Type',       viewItem.restriction_type],
                  ['Start Time', fmt(viewItem.start_time)],
                  ['End Time',   fmt(viewItem.end_time)],
                  ['Created',    fmt(viewItem.created_at)],
                  ['Updated',    fmt(viewItem.updated_at)],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-500 font-medium">{label}</p>
                    <p className="text-[11px] font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {viewItem.description && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-amber-800 mb-1">Description</p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">{viewItem.description}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button onClick={() => { openEdit(viewItem); setViewItem(null); }}
                  className="flex-1 h-8 text-[11px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white gap-1.5">
                  Edit Restriction
                </Button>
                <Button variant="outline"
                  onClick={() => { handleToggle(viewItem.id, viewItem.property_name, viewItem.is_active); setViewItem(null); }}
                  className={`h-8 text-[11px] gap-1.5 ${viewItem.is_active ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                  {viewItem.is_active ? <ToggleLeft className="h-3.5 w-3.5" /> : <ToggleRight className="h-3.5 w-3.5" />}
                  {viewItem.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}