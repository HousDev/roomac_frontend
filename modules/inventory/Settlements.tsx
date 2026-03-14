

// Settlements.tsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus, Trash2, Loader2, X, Download, RefreshCw, Filter,
  Eye, Check, ChevronLeft, ChevronRight, Square, CheckSquare,
  Building, ShieldCheck, IndianRupee, Receipt, Banknote, AlertTriangle,
  CreditCard, User,
} from 'lucide-react';
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Swal from 'sweetalert2';
import { getHandovers, getHandoverById } from "@/lib/handoverApi";
import {
  getSettlements, getSettlementById,
  createSettlement, updateSettlement, deleteSettlement,
  type Settlement, type SettlementPayload,
} from "@/lib/settlementApi";

// ── helpers ──────────────────────────────────────────────────────────────────
const safeNum = (v: any) => { const n = parseFloat(String(v)); return isNaN(n) ? 0 : n; };
const money   = (n: any)  => `₹${safeNum(n).toLocaleString('en-IN')}`;
const fmt     = (d?: string | null) => {
  if (!d) return '—';
  try { const dt = new Date(d); return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-IN'); } catch { return '—'; }
};
const toDate  = (d?: string | null) => {
  if (!d) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  try { const dt = new Date(d); return isNaN(dt.getTime()) ? '' : dt.toISOString().split('T')[0]; } catch { return ''; }
};

const statusColor = (s: string) => ({
  Pending:    'bg-amber-100 text-amber-700',
  Processing: 'bg-blue-100 text-blue-700',
  Paid:       'bg-emerald-100 text-emerald-700',
  Completed:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-700',
}[s] ?? 'bg-gray-100 text-gray-700');

const F  = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white";
const L  = "block text-[11px] font-semibold text-gray-500 mb-0.5";
const SI = "text-[11px] py-0.5";

const SH = ({ icon, title, color = "text-blue-600" }: { icon: React.ReactNode; title: string; color?: string }) => (
  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
    {icon}{title}
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <Card className={`${bg} border-0 shadow-sm`}>
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
          <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
        </div>
        <div className={`p-1.5 rounded-lg ${color}`}><Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white"/></div>
      </div>
    </CardContent>
  </Card>
);

const PAYMENT_METHODS = ['Bank Transfer','UPI','Cash','Cheque','NEFT','RTGS'];
const STATUSES        = ['Pending','Processing','Paid','Completed','Cancelled'];
type  StatusType      = 'all' | 'Pending' | 'Processing' | 'Paid' | 'Completed' | 'Cancelled';

const swalDel = (text: string) => Swal.fire({
  title: 'Are you sure?', text, icon: 'warning',
  showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
  confirmButtonText: 'Yes, delete it!', cancelButtonText: 'Cancel',
  width: '400px', padding: '1.5rem',
  customClass: {
    popup: 'rounded-xl shadow-2xl', title: 'text-lg font-bold text-gray-800',
    htmlContainer: 'text-sm text-gray-600 my-2',
    confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg mx-1',
    cancelButton:  'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg mx-1',
    actions: 'flex justify-center gap-2 mt-4',
  }, buttonsStyling: false,
});
const swalOk = (text: string) => Swal.fire({
  title: 'Done!', text, icon: 'success', timer: 1500, showConfirmButton: false,
  width: '350px', customClass: { popup: 'rounded-xl shadow-2xl' },
});

const emptyForm = (): SettlementPayload => ({
  handover_id: '', tenant_id: '', tenant_name: '', tenant_phone: '',
  tenant_email: '', property_name: '', room_number: '', bed_number: '',
  settlement_date: new Date().toISOString().split('T')[0],
  move_out_date: '', security_deposit: 0, penalties: 0, penalty_discount: 0,
  outstanding_rent: 0, other_deductions: 0,
  payment_method: 'Bank Transfer', payment_reference: '', notes: '', status: 'Pending',
});

// ═════════════════════════════════════════════════════════════════════════════
export function Settlements() {
  const [settlements,   setSettlements]   = useState<Settlement[]>([]);
  const [handovers,     setHandovers]     = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [showForm,      setShowForm]      = useState(false);
  const [editingItem,   setEditingItem]   = useState<Settlement | null>(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [viewItem,      setViewItem]      = useState<Settlement | null>(null);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [step,          setStep]          = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll,     setSelectAll]     = useState(false);
  const [statusFilter,  setStatusFilter]  = useState<StatusType>('all');
  const [colSearch,     setColSearch]     = useState({ tenant_name:'', tenant_phone:'', property_name:'', room_number:'', settlement_date:'', security_deposit:'', penalties:'', penalty_discount:'', outstanding_rent:'', total_deductions:'', refund_amount:'', payment_method:'', status:'' });
  const [formData,      setFormData]      = useState<SettlementPayload>(emptyForm());
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, totalRefund: 0 });
const [handoverSearchTerm, setHandoverSearchTerm] = useState('');
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      const res  = await getSettlements(filters);
      const data = res.data || [];
      setSettlements(data);
      setStats({
        total:       data.length,
        pending:     data.filter(s => ['Pending','Processing'].includes(s.status)).length,
        paid:        data.filter(s => ['Paid','Completed'].includes(s.status)).length,
        totalRefund: data.reduce((a, s) => a + safeNum(s.refund_amount), 0),
      });
    } catch (err: any) { toast.error(err.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { getHandovers({ status: 'Active' }).then(r => setHandovers(r.data || [])).catch(() => {}); }, []);

  const handleHandoverSelect = async (id: string) => {
    try {
      const h = (await getHandoverById(id)).data;
      setFormData(p => ({
        ...p, handover_id: h.id, tenant_id: h.tenant_id,
        tenant_name: h.tenant_name, tenant_phone: h.tenant_phone,
        tenant_email: h.tenant_email || '', property_name: h.property_name,
        room_number: h.room_number, bed_number: h.bed_number || '',
        security_deposit: safeNum(h.security_deposit),
        move_out_date: toDate(h.handover_date),
      }));
    } catch { toast.error('Could not load handover'); }
  };

  const filteredItems = useMemo(() => settlements.filter(s => {
    const cs = colSearch;
    return (
      (!cs.tenant_name      || s.tenant_name?.toLowerCase().includes(cs.tenant_name.toLowerCase())) &&
      (!cs.tenant_phone     || s.tenant_phone?.toLowerCase().includes(cs.tenant_phone.toLowerCase())) &&
      (!cs.property_name    || s.property_name?.toLowerCase().includes(cs.property_name.toLowerCase())) &&
      (!cs.room_number      || s.room_number?.toLowerCase().includes(cs.room_number.toLowerCase())) &&
      (!cs.settlement_date  || fmt(s.settlement_date).includes(cs.settlement_date)) &&
      (!cs.security_deposit || money(s.security_deposit).includes(cs.security_deposit)) &&
      (!cs.penalties        || money(s.penalties).includes(cs.penalties)) &&
      (!cs.penalty_discount || money(s.penalty_discount).includes(cs.penalty_discount)) &&
      (!cs.outstanding_rent || money(s.outstanding_rent).includes(cs.outstanding_rent)) &&
      (!cs.total_deductions || money(s.total_deductions).includes(cs.total_deductions)) &&
      (!cs.refund_amount    || money(s.refund_amount).includes(cs.refund_amount)) &&
      (!cs.payment_method   || s.payment_method?.toLowerCase().includes(cs.payment_method.toLowerCase())) &&
      (!cs.status           || s.status?.toLowerCase().includes(cs.status.toLowerCase()))
    );
  }), [settlements, colSearch]);

  const toggleAll = () => {
    if (selectAll) setSelectedItems(new Set()); else setSelectedItems(new Set(filteredItems.map(s => s.id)));
    setSelectAll(!selectAll);
  };
  const toggleOne = (id: string) => {
    const n = new Set(selectedItems);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelectedItems(n);
    setSelectAll(n.size === filteredItems.length && filteredItems.length > 0);
  };

  const openAdd  = () => { setEditingItem(null); setFormData(emptyForm()); setStep(1); setShowForm(true); };
  const openEdit = async (s: Settlement) => {
    try {
      const sd = (await getSettlementById(s.id)).data;
      setEditingItem(sd);
      setFormData({
        handover_id: sd.handover_id || '', tenant_id: sd.tenant_id || '',
        tenant_name: sd.tenant_name, tenant_phone: sd.tenant_phone,
        tenant_email: sd.tenant_email || '', property_name: sd.property_name,
        room_number: sd.room_number, bed_number: sd.bed_number || '',
        settlement_date: toDate(sd.settlement_date) || new Date().toISOString().split('T')[0],
        move_out_date: toDate(sd.move_out_date) || '',
        security_deposit: safeNum(sd.security_deposit), penalties: safeNum(sd.penalties),
        penalty_discount: safeNum(sd.penalty_discount), outstanding_rent: safeNum(sd.outstanding_rent),
        other_deductions: safeNum(sd.other_deductions),
        payment_method: sd.payment_method, payment_reference: sd.payment_reference || '',
        notes: sd.notes || '', status: sd.status,
      });
      setStep(1); setShowForm(true);
    } catch { toast.error('Failed to load'); }
  };

  const handleSubmit = async () => {
    if (!formData.tenant_name || !formData.property_name || !formData.room_number) {
      toast.error('Tenant, property and room required'); return;
    }
    if (step === 1) { setStep(2); return; }
    setSubmitting(true);
    try {
      // send raw values — backend computes total_deductions & refund_amount
      if (editingItem) { await updateSettlement(editingItem.id, formData); toast.success('Updated'); }
      else             { await createSettlement(formData);                 toast.success('Created'); }
      setShowForm(false); loadAll();
    } catch (err: any) { toast.error(err.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string, name?: string) => {
    const r = await swalDel(`Delete settlement for "${name || id}"?`);
    if (!r.isConfirmed) return;
    try { await deleteSettlement(id); loadAll(); swalOk('Deleted.'); }
    catch (err: any) { Swal.fire('Error', err.message, 'error'); }
  };

  const handleBulkDelete = async () => {
    if (!selectedItems.size) { toast.info('Select items first'); return; }
    const r = await swalDel(`Delete ${selectedItems.size} record(s)?`);
    if (!r.isConfirmed) return;
    try {
      for (const id of selectedItems) await deleteSettlement(id);
      setSelectedItems(new Set()); setSelectAll(false); loadAll(); swalOk(`${selectedItems.size} deleted.`);
    } catch (err: any) { Swal.fire('Error', err.message, 'error'); }
  };

  const handleExport = () => {
    const h = ['Tenant','Phone','Property','Room','Date','Deposit','Penalties','Deductions','Refund','Method','Status'];
    const rows = filteredItems.map(s => [
      s.tenant_name, s.tenant_phone, s.property_name, s.room_number,
      fmt(s.settlement_date), s.security_deposit, s.penalties,
      s.total_deductions, s.refund_amount, s.payment_method, s.status,
    ]);
    const csv = [h, ...rows].map(r => r.join(',')).join('\n');
    const a   = document.createElement('a');
    a.href    = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download= `settlements_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const hasFilters   = statusFilter !== 'all';
  const hasColSearch = Object.values(colSearch).some(v => v);
  const clearCol     = () => setColSearch({ tenant_name:'', tenant_phone:'', property_name:'', room_number:'', settlement_date:'', security_deposit:'', penalties:'', penalty_discount:'', outstanding_rent:'', total_deductions:'', refund_amount:'', payment_method:'', status:'' });

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="sticky top-0 z-20">
        <div className="px-3 sm:px-5 pt-3 pb-2 flex justify-end gap-1.5">
          <button onClick={() => setSidebarOpen(o => !o)}
            className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors
              ${sidebarOpen || hasFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            <Filter className="h-3.5 w-3.5"/><span className="hidden sm:inline">Filters</span>
          </button>
          <button onClick={handleExport}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium">
            <Download className="h-3.5 w-3.5"/><span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={loadAll} disabled={loading}
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}/>
          </button>
          <button onClick={openAdd}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm">
            <Plus className="h-3.5 w-3.5"/>New Settlement
          </button>
        </div>

        <div className="px-3 sm:px-5 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <StatCard title="Total"             value={stats.total}             icon={Receipt}       color="bg-blue-600"    bg="bg-gradient-to-br from-blue-50 to-blue-100"/>
          <StatCard title="Pending"           value={stats.pending}           icon={AlertTriangle} color="bg-amber-600"   bg="bg-gradient-to-br from-amber-50 to-amber-100"/>
          <StatCard title="Paid / Completed"  value={stats.paid}              icon={ShieldCheck}   color="bg-emerald-600" bg="bg-gradient-to-br from-emerald-50 to-emerald-100"/>
          <StatCard title="Total Refunds"     value={money(stats.totalRefund)} icon={Banknote}     color="bg-indigo-600"  bg="bg-gradient-to-br from-indigo-50 to-indigo-100"/>
        </div>
      </div>

      {/* TABLE */}
      <div className="relative p-3 sm:p-4">
        <Card className="border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
            <span className="text-sm font-semibold text-gray-700">
              All Settlements ({filteredItems.length})
              {selectedItems.size > 0 && <span className="ml-2 text-blue-600 text-xs">({selectedItems.size} selected)</span>}
            </span>
            <div className="flex items-center gap-2">
              {selectedItems.size > 0 && (
                <Button size="sm" variant="destructive" className="h-7 text-[10px] px-2" onClick={handleBulkDelete}>
                  <Trash2 className="h-3 w-3 mr-1"/>Delete ({selectedItems.size})
                </Button>
              )}
              {hasColSearch && <button onClick={clearCol} className="text-[10px] text-blue-600 font-semibold">Clear Search</button>}
            </div>
          </div>

          <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-310px)]">
            <table className="w-full text-[11px] border-collapse" style={{ minWidth: '1380px' }}>
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="py-2 px-2 w-8">
                    <button onClick={toggleAll} className="p-1 hover:bg-gray-200 rounded">
                      {selectAll ? <CheckSquare className="h-3.5 w-3.5 text-blue-600"/> : <Square className="h-3.5 w-3.5 text-gray-400"/>}
                    </button>
                  </th>
                  {([
                    ['Tenant Name',      130],['Phone',          105],['Property',        130],
                    ['Room',             65], ['Settlement Date', 105],['Security Deposit',105],
                    ['Penalties',        90], ['Penalty Discount',105],['Outstg. Rent',    90],
                    ['Total Deductions', 105],['Refund Amount',   105],['Method',          95],
                    ['Status',           80], ['Actions',         82],
                  ] as [string, number][]).map(([label, w]) => (
                    <th key={label} style={{ minWidth: w, width: w }}
                      className="py-2 px-2 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">
                      {label}
                    </th>
                  ))}
                </tr>
                <tr className="bg-white border-b border-gray-100">
                  <td className="py-1 px-2"/>
                  {([
                    ['tenant_name',     'Name…'     ],
                    ['tenant_phone',    'Phone…'    ],
                    ['property_name',   'Property…' ],
                    ['room_number',     'Room…'     ],
                    ['settlement_date', 'Date…'     ],
                    ['security_deposit','Deposit…'  ],
                    ['penalties',       'Penalties…'],
                    ['penalty_discount','Discount…' ],
                    ['outstanding_rent','Rent…'     ],
                    ['total_deductions','Deductions…'],
                    ['refund_amount',   'Refund…'   ],
                    ['payment_method',  'Method…'   ],
                    ['status',          'Status…'   ],
                  ] as [string, string][]).map(([key, ph], i) => (
                    <td key={i} className="py-1 px-2">
                      <input placeholder={ph} value={colSearch[key as keyof typeof colSearch]}
                        onChange={e => setColSearch(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full h-6 px-2 rounded border border-gray-200 bg-gray-50 text-[10px] focus:outline-none focus:border-blue-400 focus:bg-white"/>
                    </td>
                  ))}
                  <td className="py-1 px-2"/>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={15} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2"/>
                    <p className="text-xs text-gray-500">Loading…</p>
                  </td></tr>
                ) : filteredItems.length === 0 ? (
                  <tr><td colSpan={15} className="text-center py-12">
                    <Receipt className="h-10 w-10 text-gray-300 mx-auto mb-3"/>
                    <p className="text-sm font-medium text-gray-500">No settlements found</p>
                  </td></tr>
                ) : filteredItems.map((s, idx) => (
                  <tr key={s.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="py-2 px-2">
                      <button onClick={() => toggleOne(s.id)} className="p-1 hover:bg-gray-200 rounded">
                        {selectedItems.has(s.id) ? <CheckSquare className="h-3.5 w-3.5 text-blue-600"/> : <Square className="h-3.5 w-3.5 text-gray-400"/>}
                      </button>
                    </td>
                    <td className="py-2 px-2 font-semibold text-gray-800 whitespace-nowrap">{s.tenant_name}</td>
                    <td className="py-2 px-2 text-gray-500 whitespace-nowrap">{s.tenant_phone}</td>
                    <td className="py-2 px-2 text-gray-600 whitespace-nowrap">
                      <span className="block max-w-[128px] truncate" title={s.property_name}>{s.property_name}</span>
                    </td>
<td className="py-2 px-2 text-gray-600 whitespace-nowrap">{s.room_number}{s.bed_number ? `/${s.bed_number}` : ''}</td>                    <td className="py-2 px-2 text-gray-600 whitespace-nowrap">{fmt(s.settlement_date)}</td>
                    <td className="py-2 px-2 font-semibold text-gray-800 whitespace-nowrap">{money(s.security_deposit)}</td>
                    <td className="py-2 px-2 text-red-600 whitespace-nowrap">{money(s.penalties)}</td>
                    <td className="py-2 px-2 text-emerald-600 font-medium whitespace-nowrap">{money(s.penalty_discount)}</td>
                    <td className="py-2 px-2 text-orange-500 whitespace-nowrap">{money(s.outstanding_rent)}</td>
                    <td className="py-2 px-2 font-bold text-orange-700 whitespace-nowrap">{money(s.total_deductions)}</td>
                    <td className="py-2 px-2 font-bold text-emerald-700 whitespace-nowrap">{money(s.refund_amount)}</td>
                    <td className="py-2 px-2 text-gray-600 whitespace-nowrap">{s.payment_method}</td>
                    <td className="py-2 px-2 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-semibold \${statusColor(s.status)}`}>{s.status}</span>
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => setViewItem(s)} title="View"
                          className="h-6 w-6 flex items-center justify-center rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="h-3.5 w-3.5"/>
                        </button>
                        <button onClick={() => openEdit(s)} title="Edit"
                          className="h-6 w-6 flex items-center justify-center rounded hover:bg-amber-100 text-gray-400 hover:text-amber-600 transition-colors">
                          <CreditCard className="h-3.5 w-3.5"/>
                        </button>
                        <button onClick={() => handleDelete(s.id, s.tenant_name)} title="Delete"
                          className="h-6 w-6 flex items-center justify-center rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="h-3.5 w-3.5"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* FILTER SIDEBAR */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)}/>}
        <aside className={`fixed top-0 right-0 h-full z-40 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white flex items-center gap-2"><Filter className="h-4 w-4"/>Filters</span>
            <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white"><X className="h-4 w-4"/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Status</p>
            <div className="space-y-1">
              {(['all','Pending','Processing','Paid','Completed','Cancelled'] as StatusType[]).map(s => (
                <label key={s} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                  ${statusFilter === s ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
                  <input type="radio" checked={statusFilter === s} onChange={() => setStatusFilter(s)} className="sr-only"/>
                  <span className={`h-2 w-2 rounded-full ${statusFilter === s ? 'bg-blue-500' : 'bg-gray-300'}`}/>
                  <span className="text-[12px] font-medium">{s === 'all' ? 'All' : s}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="border-t px-4 py-3 bg-gray-50 flex gap-2">
            <button onClick={() => setStatusFilter('all')} disabled={!hasFilters}
              className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] text-gray-600 disabled:opacity-40">Clear</button>
            <button onClick={() => setSidebarOpen(false)}
              className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold">Apply & Close</button>
          </div>
        </aside>
      </div>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">{editingItem ? 'Edit Settlement' : 'New Settlement'}</h2>
              <p className="text-xs text-blue-100">Step {step} of 2 — {step === 1 ? 'Tenant & Property' : 'Financials & Payment'}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className={`h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center ${step === 1 ? 'bg-white text-blue-700' : 'bg-blue-500 text-white'}`}>
                  {step > 1 ? <Check className="h-3 w-3"/> : '1'}
                </span>
                <div className="h-0.5 w-4 bg-blue-400"/>
                <span className={`h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center ${step === 2 ? 'bg-white text-blue-700' : 'bg-blue-500 text-white opacity-60'}`}>2</span>
              </div>
              <DialogClose asChild>
                <button className="p-1.5 rounded-full hover:bg-white/20"><X className="h-4 w-4"/></button>
              </DialogClose>
            </div>
          </div>

          <div className="p-4 overflow-y-auto max-h-[75vh] space-y-4">

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <div>
                  <SH icon={<Receipt className="h-3 w-3"/>} title="Active Tenant Handover"/>
                 <Select 
  value={formData.handover_id || ''} 
  onValueChange={(v) => {
    handleHandoverSelect(v);
    setHandoverSearchTerm('');
  }}
>
  <SelectTrigger className={F}>
    <SelectValue placeholder="select from active handover tenant"/>
  </SelectTrigger>
  <SelectContent className="max-h-[300px]">
    {/* Search input */}
    <div className="sticky top-0 bg-white p-2 border-b z-10">
      <div className="relative">
        <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Input
          placeholder="Search handovers..."
          className="pl-7 h-7 text-xs"
          value={handoverSearchTerm}
          onChange={(e) => setHandoverSearchTerm(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
    
    {/* Handovers list */}
    <div className="py-1">
      {handovers
        .filter(h => 
          h.tenant_name?.toLowerCase().includes(handoverSearchTerm.toLowerCase()) ||
          h.property_name?.toLowerCase().includes(handoverSearchTerm.toLowerCase()) ||
          h.room_number?.toLowerCase().includes(handoverSearchTerm.toLowerCase())
        )
        .map(h => (
          <SelectItem key={h.id} value={h.id} className={SI}>
            {h.tenant_name} — {h.property_name} ({h.room_number})
          </SelectItem>
        ))}
      
      {/* Show message if no results */}
      {handovers.filter(h => 
        h.tenant_name?.toLowerCase().includes(handoverSearchTerm.toLowerCase()) ||
        h.property_name?.toLowerCase().includes(handoverSearchTerm.toLowerCase()) ||
        h.room_number?.toLowerCase().includes(handoverSearchTerm.toLowerCase())
      ).length === 0 && (
        <div className="px-2 py-3 text-center">
          <p className="text-xs text-gray-400">No handovers found</p>
        </div>
      )}
    </div>
  </SelectContent>
</Select>
                </div>

                <div>
                  <SH icon={<User className="h-3 w-3"/>} title="Tenant Details"/>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                    <div><label className={L}>Tenant Name *</label>
                      <Input className={F} placeholder="Full name" value={formData.tenant_name}
                        onChange={e => setFormData(p => ({ ...p, tenant_name: e.target.value }))}/></div>
                    <div><label className={L}>Phone</label>
                      <Input className={F} placeholder="Phone" value={formData.tenant_phone}
                        onChange={e => setFormData(p => ({ ...p, tenant_phone: e.target.value }))}/></div>
                    <div className="col-span-2"><label className={L}>Email</label>
                      <Input className={F} type="email" placeholder="Email" value={formData.tenant_email}
                        onChange={e => setFormData(p => ({ ...p, tenant_email: e.target.value }))}/></div>
                  </div>
                </div>

                <div>
                  <SH icon={<Building className="h-3 w-3"/>} title="Property & Room" color="text-indigo-600"/>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                    <div><label className={L}>Property Name *</label>
                      <Input className={F} placeholder="Property" value={formData.property_name}
                        onChange={e => setFormData(p => ({ ...p, property_name: e.target.value }))}/></div>
                    <div><label className={L}>Room No. *</label>
                      <Input className={F} placeholder="101" value={formData.room_number}
                        onChange={e => setFormData(p => ({ ...p, room_number: e.target.value }))}/></div>
                    <div><label className={L}>Bed No.</label>
                      <Input className={F} placeholder="A / B" value={formData.bed_number || ''}
                        onChange={e => setFormData(p => ({ ...p, bed_number: e.target.value }))}/></div>
                    <div><label className={L}>Move-Out Date</label>
                      <Input type="date" className={F} value={formData.move_out_date || ''}
                        onChange={e => setFormData(p => ({ ...p, move_out_date: e.target.value }))}/></div>
                    <div><label className={L}>Settlement Date *</label>
                      <Input type="date" className={F} value={formData.settlement_date}
                        onChange={e => setFormData(p => ({ ...p, settlement_date: e.target.value }))}/></div>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <div>
                  <SH icon={<IndianRupee className="h-3 w-3"/>} title="Deposit & Deductions"/>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                    <div><label className={L}>Security Deposit (₹)</label>
                      <Input type="number" min={0} className={F} value={formData.security_deposit}
                        onChange={e => setFormData(p => ({ ...p, security_deposit: safeNum(e.target.value) }))}/></div>
                    <div><label className={L}>Penalties (₹)</label>
                      <Input type="number" min={0} className={F} value={formData.penalties}
                        onChange={e => setFormData(p => ({ ...p, penalties: safeNum(e.target.value) }))}/></div>
                    <div><label className={L}>Penalty Discount (₹)</label>
                      <Input type="number" min={0} className={F} value={formData.penalty_discount}
                        onChange={e => setFormData(p => ({ ...p, penalty_discount: safeNum(e.target.value) }))}/></div>
                    <div><label className={L}>Outstanding Rent (₹)</label>
                      <Input type="number" min={0} className={F} value={formData.outstanding_rent}
                        onChange={e => setFormData(p => ({ ...p, outstanding_rent: safeNum(e.target.value) }))}/></div>
                    <div><label className={L}>Other Deductions (₹)</label>
                      <Input type="number" min={0} className={F} value={formData.other_deductions}
                        onChange={e => setFormData(p => ({ ...p, other_deductions: safeNum(e.target.value) }))}/></div>

                    {/* Live computed preview */}
                    <div>
                      <label className={L}>Total Deductions <span className="text-[9px] text-gray-400">(auto)</span></label>
                      <div className="h-8 flex items-center px-3 rounded-md bg-orange-50 border border-orange-200 text-[11px] font-semibold text-orange-700">
                        {money(Math.max(0, safeNum(formData.penalties) - safeNum(formData.penalty_discount)) + safeNum(formData.outstanding_rent) + safeNum(formData.other_deductions))}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className={L}>Refund Amount <span className="text-[9px] text-gray-400">(auto)</span></label>
                      <div className="h-10 flex items-center justify-between px-3 rounded-md bg-emerald-50 border border-emerald-200">
                        <span className="text-[11px] text-emerald-600">Deposit − Deductions</span>
                        <span className="text-base font-black text-emerald-700">
                          {money(Math.max(0, safeNum(formData.security_deposit) - (Math.max(0, safeNum(formData.penalties) - safeNum(formData.penalty_discount)) + safeNum(formData.outstanding_rent) + safeNum(formData.other_deductions))))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <SH icon={<CreditCard className="h-3 w-3"/>} title="Payment & Status" color="text-indigo-600"/>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                    <div><label className={L}>Payment Method</label>
                      <Select value={formData.payment_method} onValueChange={v => setFormData(p => ({ ...p, payment_method: v }))}>
                        <SelectTrigger className={F}><SelectValue/></SelectTrigger>
                        <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m} value={m} className={SI}>{m}</SelectItem>)}</SelectContent>
                      </Select></div>
                    <div><label className={L}>Status</label>
                      <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
                        <SelectTrigger className={F}><SelectValue/></SelectTrigger>
                        <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s} className={SI}>{s}</SelectItem>)}</SelectContent>
                      </Select></div>
                    <div className="col-span-2"><label className={L}>Payment Reference / UTR</label>
                      <Input className={F} placeholder="UTR123…" value={formData.payment_reference || ''}
                        onChange={e => setFormData(p => ({ ...p, payment_reference: e.target.value }))}/></div>
                    <div className="col-span-2"><label className={L}>Notes</label>
                      <Textarea className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-0 min-h-[48px] resize-none"
                        rows={2} placeholder="Notes…" value={formData.notes || ''}
                        onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}/></div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-1">
              {step === 2 && (
                <Button variant="outline" onClick={() => setStep(1)} className="h-8 text-[11px] px-4 flex items-center gap-1.5">
                  <ChevronLeft className="h-3.5 w-3.5"/>Back
                </Button>
              )}
              <Button disabled={submitting} onClick={handleSubmit}
                className="flex-1 h-8 text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center gap-1.5">
                {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin"/>Saving…</>
                  : step === 1 ? <>Next <ChevronRight className="h-3.5 w-3.5"/></>
                  : <><Check className="h-3.5 w-3.5"/>{editingItem ? 'Update' : 'Create'} Settlement</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* VIEW DIALOG */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={v => { if (!v) setViewItem(null); }}>
          <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-base font-semibold">Settlement Details</h2>
                <p className="text-xs text-blue-100">{viewItem.tenant_name} — {viewItem.property_name}</p>
              </div>
              <DialogClose asChild>
                <button className="p-1.5 rounded-full hover:bg-white/20"><X className="h-4 w-4"/></button>
              </DialogClose>
            </div>
            <div className="p-4 overflow-y-auto max-h-[75vh] space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Tenant',    viewItem.tenant_name],
                  ['Phone',     viewItem.tenant_phone],
                  ['Property',  viewItem.property_name],
                  ['Room',      `${viewItem.room_number}${viewItem.bed_number ? '/'+viewItem.bed_number : ''}`],
                  ['Date',      fmt(viewItem.settlement_date)],
                  ['Method',    viewItem.payment_method],
                  ['Ref / UTR', viewItem.payment_reference || '—'],
                  ['Status',    viewItem.status],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-500">{label}</p>
                    <p className="text-[11px] font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2">
                  <p className="text-[11px] font-bold text-white">Financial Breakdown</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    ['Security Deposit', money(viewItem.security_deposit), 'text-gray-800'],
                    ['Penalties',        `– ${money(viewItem.penalties)}`, 'text-red-600'],
                    ['Penalty Discount', `+ ${money(viewItem.penalty_discount)}`, 'text-emerald-600'],
                    ['Outstanding Rent', `– ${money(viewItem.outstanding_rent)}`, 'text-orange-600'],
                    ['Other Deductions', `– ${money(viewItem.other_deductions)}`, 'text-orange-600'],
                    ['Total Deductions', money(viewItem.total_deductions), 'text-orange-700 font-bold'],
                  ].map(([label, value, color]) => (
                    <div key={label} className="flex justify-between px-3 py-2">
                      <span className="text-[11px] text-gray-600">{label}</span>
                      <span className={`text-[11px] font-semibold ${color}`}>{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-3 py-2.5 bg-emerald-50">
                    <span className="text-[12px] font-bold text-emerald-800">Refund Amount</span>
                    <span className="text-base font-black text-emerald-700">{money(viewItem.refund_amount)}</span>
                  </div>
                </div>
              </div>

              {viewItem.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-amber-800 mb-1">Notes</p>
                  <p className="text-[11px] text-amber-700">{viewItem.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
