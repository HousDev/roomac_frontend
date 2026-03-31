



// TenantHandover.tsx - COMPLETE FIXED VERSION
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FileText, Plus, Trash2, Loader2, X, Download,
  Building, IndianRupee, StickyNote, RefreshCw, Filter,
  AlertTriangle, ChevronDown, ChevronUp, User, Calendar,
  ShieldCheck, Eye, MessageCircle, FileDown, Printer, Check,
  ChevronRight, ChevronLeft, Boxes, Share2, CreditCard, Square, CheckSquare,
  Edit2,
  Edit,
  Mail,
} from 'lucide-react';
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogClose,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  getHandovers,
  createHandover,
  updateHandover,
  deleteHandover,
  getHandoverStats,
  getHandoverById,
} from "@/lib/handoverApi";
import { listProperties, getProperty } from "@/lib/propertyApi";
import { tenantDetailsApi } from "@/lib/tenantDetailsApi";
import { listTenants } from "@/lib/tenantApi";
import { getMasterItemsByTab, getMasterValues } from "@/lib/masterApi";
import { getPurchases } from "@/lib/materialPurchaseApi";
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAuth } from '@/context/authContext';


// ─── Types ────────────────────────────────────────────────────────────────────
interface HandoverItem {
  id?: string;
  item_name: string;
  category: string;
  category_id?: string;
  quantity: number;
  condition_at_movein: string;
  asset_id?: string;
  notes?: string;
}

interface TenantHandover {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email?: string;
  property_id: string;
  property_name: string;
  room_number: string;
  bed_number?: string;
  move_in_date: string;
  handover_date: string;
  inspector_name: string;
  security_deposit: number;
  rent_amount: number;
  notes?: string;
  status: string;
  handover_items?: HandoverItem[];
  created_at?: string;
}

interface TenantOption {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface MasterCategory {
  id: string;
  name: string;
  value?: string;
}

// ─── Purchased item type ──────────────────────────────────────────────────────
interface PurchasedItemOption {
  label: string;
  value: string;
}

type StatusType = 'all' | 'Active' | 'Confirmed' | 'Completed' | 'Pending' | 'Cancelled';

// ─── Style tokens ─────────────────────────────────────────────────────────────
const F  = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
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
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const CONDITIONS = ['New', 'Good', 'Used', 'Damaged'];
const STATUSES = ['Active', 'Confirmed', 'Completed', 'Pending', 'Cancelled'];

const statusColor = (s: string) => {
  switch (s) {
    case 'Confirmed': return 'bg-emerald-100 text-emerald-700';
    case 'Active':    return 'bg-blue-100 text-blue-700';
    case 'Completed': return 'bg-green-100 text-green-700';
    case 'Pending':   return 'bg-amber-100 text-amber-700';
    case 'Cancelled': return 'bg-red-100 text-red-700';
    default:          return 'bg-gray-100 text-gray-700';
  }
};

// ── FIX: Safe date formatter — handles undefined/null and format issues ────────
const fmt = (d: string | undefined | null) => {
  if (!d) return 'N/A';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN');
  } catch {
    return 'N/A';
  }
};

// ── FIX: Convert any date string to YYYY-MM-DD for input[type=date] ───────────
const toInputDate = (d: string | undefined | null): string => {
  if (!d) return '';
  try {
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

// ── FIX: Safe number parser — prevents NaN ────────────────────────────────────
const safeNum = (v: any): number => {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
};

const money = (n: any) => `₹${safeNum(n).toLocaleString('en-IN')}`;

// ═══════════════════════════════════════════════════════════════════════════════
export function TenantHandover() {
  const [handovers, setHandovers] = useState<TenantHandover[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [properties, setProperties] = useState<{ id: string; name: string; security_deposit?: number }[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItemOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<TenantHandover | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewItem, setViewItem] = useState<TenantHandover | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
// PDF-safe money formatter (jsPDF doesn't support ₹ symbol)
const pdfMoney = (n: any) => `Rs. ${safeNum(n).toLocaleString('en-IN')}`;
  const [showSharePopup, setShowSharePopup] = useState(false);
const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
const [tenantSearchTerm, setTenantSearchTerm] = useState('');
const [propertySearchTerm, setPropertySearchTerm] = useState('');
const [purchasedItemSearchTerm, setPurchasedItemSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const { can } = useAuth(); // ← ADD THIS

  const [stats, setStats] = useState({
    total: 0, active: 0, confirmed: 0, pending: 0, completed: 0,
  });

  const [statusFilter, setStatusFilter] = useState<StatusType>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');

  const [colSearch, setColSearch] = useState({
    tenant_name: '', property_name: '', room_number: '', status: '', handover_date: '',
  });

  const emptyForm = {
    tenant_id: '', tenant_name: '', tenant_phone: '', tenant_email: '',
    property_id: '', property_name: '', room_number: '', bed_number: '',
    move_in_date: new Date().toISOString().split('T')[0],
    handover_date: new Date().toISOString().split('T')[0],
    inspector_name: '', security_deposit: 0, rent_amount: 0,
    notes: '', status: 'Active',
  };
  const [formData, setFormData] = useState(emptyForm);

  const emptyHandoverItem = (): HandoverItem => ({
    item_name: '', category: 'Furniture', quantity: 1,
    condition_at_movein: 'Good', asset_id: '', notes: '',
  });
  const [handoverItems, setHandoverItems] = useState<HandoverItem[]>([emptyHandoverItem()]);

  // ── Load categories ────────────────────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    try {
      const res = await getMasterItemsByTab('Properties');
      const list = Array.isArray(res.data) ? res.data : [];
      const catItem = list.find((i: any) => i.name?.toLowerCase() === 'category');

      if (!catItem) {
        setCategories([
          { id: '1', name: 'Furniture' }, { id: '2', name: 'Electronics' },
          { id: '3', name: 'Mattress' }, { id: '4', name: 'Bedding' },
          { id: '5', name: 'Utensils' }, { id: '6', name: 'Appliances' },
          { id: '7', name: 'Other' },
        ]);
        return;
      }

      const vRes = await getMasterValues(catItem.id);
      const values = Array.isArray(vRes.data) ? vRes.data : Array.isArray(vRes) ? vRes : [];
      setCategories(
        values
          .filter((v: any) => v.isactive === 1 || v.is_active === 1)
          .map((v: any) => ({ id: String(v.id), name: v.value || v.name || '' }))
      );
    } catch (err) {
      console.error('Could not load categories:', err);
      setCategories([
        { id: '1', name: 'Furniture' }, { id: '2', name: 'Electronics' },
        { id: '3', name: 'Mattress' }, { id: '4', name: 'Bedding' },
        { id: '5', name: 'Utensils' }, { id: '6', name: 'Appliances' },
        { id: '7', name: 'Other' },
      ]);
    }
  }, []);

  // ── Load purchased items from material purchases ───────────────────────────
  const loadPurchasedItems = useCallback(async () => {
    try {
      const res = await getPurchases();
      const allItems: PurchasedItemOption[] = [];

      (res.data || []).forEach(purchase => {
        let items: any[] = [];

        if (purchase.purchase_items && purchase.purchase_items.length > 0) {
          items = purchase.purchase_items;
        } else if (purchase.items) {
          if (typeof purchase.items === 'string') {
            try { items = JSON.parse(purchase.items as any); } catch { items = []; }
          } else if (Array.isArray(purchase.items)) {
            items = purchase.items;
          }
        }

        items.forEach((item: any) => {
          if (item.item_name) {
            allItems.push({ label: item.item_name, value: item.item_name });
          }
        });
      });

      // Remove duplicates
      const unique = allItems.filter((v, i, a) => a.findIndex(t => t.value === v.value) === i);
      setPurchasedItems(unique);
    } catch (err) {
      console.error('Could not load purchased items:', err);
    }
  }, []);

  // ── Loaders ──────────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (propertyFilter !== 'all') filters.property_id = propertyFilter;

      const res = await getHandovers(filters);
      const data: TenantHandover[] = (res.data || []).map(h => ({
        ...h,
        // FIX: Ensure numbers are parsed correctly
        security_deposit: safeNum(h.security_deposit),
        rent_amount: safeNum(h.rent_amount),
      }));
      setHandovers(data);

      setStats({
        total: data.length,
        active: data.filter(h => h.status === 'Active').length,
        confirmed: data.filter(h => h.status === 'Confirmed').length,
        pending: data.filter(h => h.status === 'Pending').length,
        completed: data.filter(h => h.status === 'Completed').length,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to load handovers');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, propertyFilter]);

  const loadTenants = useCallback(async () => {
    try {
      const res = await listTenants({ is_active: true });
      const list = res?.data || [];
      const arr = Array.isArray(list) ? list : [];
      setTenants(arr.map((t: any) => ({
        id: String(t.id),
        name: t.full_name || '',
        phone: t.phone || '',
        email: t.email || '',
      })));
    } catch (err) {
      console.error('Could not load tenants:', err);
    }
  }, []);

  const loadProperties = useCallback(async () => {
    try {
      const res = await listProperties({ is_active: true });
      const list = res?.data?.data || res?.data || [];
      const arr = Array.isArray(list) ? list : Object.values(list);
      setProperties(arr.map((p: any) => ({
        id: String(p.id),
        name: p.name,
        security_deposit: safeNum(p.security_deposit),
      })));
    } catch (err) {
      console.error('Could not load properties:', err);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadTenants();
    loadProperties();
    loadPurchasedItems();
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Fetch property deposit ────────────────────────────────────────────────
  const fetchPropertyDeposit = async (propertyId: string) => {
    try {
      const res = await getProperty(propertyId);
      if (res.success && res.data) {
        return safeNum(res.data.security_deposit);
      }
    } catch (err) {
      console.error('Could not fetch property deposit:', err);
    }
    return 0;
  };

  // ── Tenant auto-fill — FIX: use toInputDate for dates ────────────────────
  const handleTenantSelect = async (tenantId: string) => {
    const t = tenants.find(t => String(t.id) === tenantId);
    if (!t) return;

    setFormData(p => ({
      ...p,
      tenant_id: String(t.id),
      tenant_name: t.name || '',
      tenant_phone: t.phone || '',
      tenant_email: t.email || '',
    }));

    try {
      const res = await tenantDetailsApi.getProfileById(tenantId);
      const d = res?.data;
      if (!d) return;

      let deposit = 0;
      if (d.property_id) {
        deposit = await fetchPropertyDeposit(String(d.property_id));
      }

      setFormData(p => ({
        ...p,
        property_id: String(d.property_id || ''),
        property_name: d.property_name || '',
        room_number: d.room_number || '',
        bed_number: String(d.bed_number || ''),
        // FIX: use toInputDate to ensure YYYY-MM-DD format
        move_in_date: toInputDate(d.check_in_date) || toInputDate(d.move_in_date) || p.move_in_date,
        security_deposit: deposit,
        rent_amount: safeNum(d.monthly_rent || d.rent_per_bed || 0),
      }));
    } catch (err) {
      console.error('Could not fetch tenant details:', err);
    }
  };

  // ── Property select ───────────────────────────────────────────────────────
  const handlePropertySelect = async (propertyId: string) => {
    const selected = properties.find(p => p.id === propertyId);
    if (!selected) return;
    const deposit = await fetchPropertyDeposit(propertyId);
    setFormData(p => ({
      ...p,
      property_id: propertyId,
      property_name: selected.name,
      security_deposit: deposit,
    }));
  };

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return handovers.filter(h => {
      const cs = colSearch;
      const n = !cs.tenant_name || h.tenant_name?.toLowerCase().includes(cs.tenant_name.toLowerCase());
      const p = !cs.property_name || h.property_name?.toLowerCase().includes(cs.property_name.toLowerCase());
      const r = !cs.room_number || h.room_number?.toLowerCase().includes(cs.room_number.toLowerCase());
      const s = !cs.status || h.status?.toLowerCase().includes(cs.status.toLowerCase());
      const d = !cs.handover_date || fmt(h.handover_date).includes(cs.handover_date);
      return n && p && r && s && d;
    });
  }, [handovers, colSearch]);

  // ── Bulk Selection ─────────────────────────────────────────────────────────
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredItems.length && filteredItems.length > 0);
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setHandoverItems([emptyHandoverItem()]);
    setCurrentStep(1);
    setShowForm(true);
  };

  // FIX: Edit — properly convert dates and parse numbers
  const openEdit = async (h: TenantHandover) => {
    try {
      const fullHandover = await getHandoverById(h.id);
      const hd = fullHandover.data;

      setEditingItem(hd);
      setFormData({
        tenant_id:        hd.tenant_id || '',
        tenant_name:      hd.tenant_name || '',
        tenant_phone:     hd.tenant_phone || '',
        tenant_email:     hd.tenant_email || '',
        property_id:      String(hd.property_id || ''),
        property_name:    hd.property_name || '',
        room_number:      hd.room_number || '',
        bed_number:       hd.bed_number || '',
        // FIX: Use toInputDate to ensure YYYY-MM-DD format for date inputs
        move_in_date:     toInputDate(hd.move_in_date) || new Date().toISOString().split('T')[0],
        handover_date:    toInputDate(hd.handover_date) || new Date().toISOString().split('T')[0],
        inspector_name:   hd.inspector_name || '',
        // FIX: Use safeNum to prevent NaN
        security_deposit: safeNum(hd.security_deposit),
        rent_amount:      safeNum(hd.rent_amount),
        notes:            hd.notes || '',
        status:           hd.status || 'Active',
      });

      setHandoverItems(hd.handover_items?.length ? hd.handover_items : [emptyHandoverItem()]);
      setCurrentStep(1);
      setShowForm(true);
    } catch (err) {
      console.error('Error fetching handover details:', err);
      toast.error('Failed to load handover details');
    }
  };

  const handleSubmit = async () => {
    if (!formData.tenant_name || !formData.property_id || !formData.room_number) {
      toast.error('Tenant, property and room are required');
      return;
    }
    if (currentStep === 1) { setCurrentStep(2); return; }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        // FIX: Ensure numbers are sent as numbers
        security_deposit: safeNum(formData.security_deposit),
        rent_amount: safeNum(formData.rent_amount),
        handover_items: handoverItems,
      };
      if (editingItem) {
        await updateHandover(editingItem.id, payload);
        toast.success('Handover updated successfully');
      } else {
        await createHandover(payload);
        toast.success('Handover created successfully');
      }
      setShowForm(false);
      await loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save handover');
    } finally {
      setSubmitting(false);
    }
  };

 const handleDelete = async (id: string, name?: string) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Delete handover for "${name || id}"? This cannot be undone!`,
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
    await deleteHandover(id);
    await loadAll();
    Swal.fire({
      title: 'Deleted!',
      text: 'Handover record deleted successfully.',
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
  } catch (err: any) {
    Swal.fire({
      title: 'Error!',
      text: err.message || 'Failed to delete handover',
      icon: 'error',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
      width: '350px',
      padding: '1rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-red-600',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
      },
      buttonsStyling: false
    });
  }
};

  const handleBulkDelete = async () => {
  if (selectedItems.size === 0) {
    Swal.fire({
      title: 'No items selected',
      text: 'Please select at least one record to delete.',
      icon: 'info',
      confirmButtonText: 'OK',
      width: '350px',
      padding: '1rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-blue-600',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
      },
      buttonsStyling: false
    });
    return;
  }
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Delete ${selectedItems.size} selected handover record(s)? This cannot be undone!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete them!',
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
    for (const id of selectedItems) await deleteHandover(id);
    await loadAll();
    setSelectedItems(new Set());
    setSelectAll(false);
    Swal.fire({
      title: 'Deleted!',
      text: `${selectedItems.size} record(s) deleted successfully.`,
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
  } catch (err: any) {
    Swal.fire({
      title: 'Error!',
      text: err.message || 'Failed to delete records',
      icon: 'error',
      confirmButtonText: 'OK',
      width: '350px',
      padding: '1rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-red-600',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
      },
      buttonsStyling: false
    });
  }
};

const handleExport = () => {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // 1. Main handovers sheet
    const handoversData = filteredItems.map(h => ({
      'Tenant Name': h.tenant_name,
      'Phone': h.tenant_phone,
      'Email': h.tenant_email || '',
      'Property': h.property_name,
      'Room Number': h.room_number,
      'Bed Number': h.bed_number || '',
      'Move-In Date': fmt(h.move_in_date),
      'Handover Date': fmt(h.handover_date),
      'Inspector': h.inspector_name,
      'Security Deposit (₹)': safeNum(h.security_deposit),
      'Rent Amount (₹)': safeNum(h.rent_amount),
      'Total Amount (₹)': safeNum(h.security_deposit) + safeNum(h.rent_amount),
      'Items Count': h.handover_items?.length || 0,
      'Status': h.status,
      'Notes': h.notes || '',
      'Created Date': h.created_at ? fmt(h.created_at) : '',
      'Handover ID': h.id
    }));

    const handoversWs = XLSX.utils.json_to_sheet(handoversData);
    
    // Auto-size columns
    const handoversColWidths = [];
    const handoversHeaders = Object.keys(handoversData[0] || {});
    handoversHeaders.forEach(header => {
      const maxLength = Math.max(
        header.length,
        ...handoversData.map(row => String(row[header] || '').length)
      );
      handoversColWidths.push({ wch: Math.min(maxLength + 2, 50) });
    });
    handoversWs['!cols'] = handoversColWidths;
    
    XLSX.utils.book_append_sheet(wb, handoversWs, "Handovers");

    // 2. Items sheet - all handover items
    const allItems: any[] = [];
    filteredItems.forEach(handover => {
      if (handover.handover_items && handover.handover_items.length > 0) {
        handover.handover_items.forEach((item, idx) => {
          allItems.push({
            'Handover ID': handover.id,
            'Tenant': handover.tenant_name,
            'Property': handover.property_name,
            'Room': handover.room_number,
            'Item #': idx + 1,
            'Item Name': item.item_name,
            'Category': item.category,
            'Quantity': item.quantity,
            'Condition': item.condition_at_movein,
            'Asset ID': item.asset_id || '',
            'Item Notes': item.notes || '',
            'Status': handover.status,
            'Handover Date': fmt(handover.handover_date)
          });
        });
      }
    });

    if (allItems.length > 0) {
      const itemsWs = XLSX.utils.json_to_sheet(allItems);
      XLSX.utils.book_append_sheet(wb, itemsWs, "Items");
    }

    // 3. Summary sheet
    const totalHandovers = filteredItems.length;
    const totalDeposits = filteredItems.reduce((sum, h) => sum + safeNum(h.security_deposit), 0);
    const totalRent = filteredItems.reduce((sum, h) => sum + safeNum(h.rent_amount), 0);
    const totalValue = totalDeposits + totalRent;
    
    const activeCount = filteredItems.filter(h => h.status === 'Active').length;
    const confirmedCount = filteredItems.filter(h => h.status === 'Confirmed').length;
    const completedCount = filteredItems.filter(h => h.status === 'Completed').length;
    const pendingCount = filteredItems.filter(h => h.status === 'Pending').length;
    const cancelledCount = filteredItems.filter(h => h.status === 'Cancelled').length;

    const summaryData = [
      ['Metric', 'Value'],
      ['Total Handovers', totalHandovers],
      ['Total Security Deposits (₹)', totalDeposits.toLocaleString('en-IN')],
      ['Total Monthly Rent (₹)', totalRent.toLocaleString('en-IN')],
      ['Total Value (₹)', totalValue.toLocaleString('en-IN')],
      ['Average Deposit (₹)', totalHandovers > 0 ? (totalDeposits / totalHandovers).toLocaleString('en-IN') : '0'],
      ['Average Rent (₹)', totalHandovers > 0 ? (totalRent / totalHandovers).toLocaleString('en-IN') : '0'],
      ['Active Handovers', activeCount],
      ['Confirmed Handovers', confirmedCount],
      ['Completed Handovers', completedCount],
      ['Pending Handovers', pendingCount],
      ['Cancelled Handovers', cancelledCount],
      ['Unique Properties', new Set(filteredItems.map(h => h.property_name)).size],
      ['Total Items', allItems.length],
      ['Export Date', new Date().toLocaleString('en-IN')]
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // 4. Property summary sheet
    const propertyMap = new Map();
    filteredItems.forEach(h => {
      if (!propertyMap.has(h.property_name)) {
        propertyMap.set(h.property_name, {
          property: h.property_name,
          handovers: 0,
          deposits: 0,
          rent: 0,
          items: 0,
          active: 0
        });
      }
      const prop = propertyMap.get(h.property_name);
      prop.handovers++;
      prop.deposits += safeNum(h.security_deposit);
      prop.rent += safeNum(h.rent_amount);
      prop.items += h.handover_items?.length || 0;
      if (h.status === 'Active') prop.active++;
    });

    const propertyData = Array.from(propertyMap.values()).map(p => ({
      'Property': p.property,
      'Total Handovers': p.handovers,
      'Active Handovers': p.active,
      'Total Deposits (₹)': p.deposits,
      'Total Monthly Rent (₹)': p.rent,
      'Total Value (₹)': p.deposits + p.rent,
      'Total Items': p.items,
      'Avg Deposit (₹)': p.handovers > 0 ? Math.round(p.deposits / p.handovers) : 0
    }));

    if (propertyData.length > 0) {
      const propertyWs = XLSX.utils.json_to_sheet(propertyData);
      XLSX.utils.book_append_sheet(wb, propertyWs, "By Property");
    }

    // 5. Status summary sheet
    const statusData = [
      ['Status', 'Count', 'Total Deposits (₹)', 'Total Rent (₹)', 'Total Value (₹)', 'Items Count'],
      ['Active', 
        activeCount,
        filteredItems.filter(h => h.status === 'Active').reduce((sum, h) => sum + safeNum(h.security_deposit), 0),
        filteredItems.filter(h => h.status === 'Active').reduce((sum, h) => sum + safeNum(h.rent_amount), 0),
        filteredItems.filter(h => h.status === 'Active').reduce((sum, h) => sum + safeNum(h.security_deposit) + safeNum(h.rent_amount), 0),
        filteredItems.filter(h => h.status === 'Active').reduce((sum, h) => sum + (h.handover_items?.length || 0), 0)
      ],
      ['Confirmed',
        confirmedCount,
        filteredItems.filter(h => h.status === 'Confirmed').reduce((sum, h) => sum + safeNum(h.security_deposit), 0),
        filteredItems.filter(h => h.status === 'Confirmed').reduce((sum, h) => sum + safeNum(h.rent_amount), 0),
        filteredItems.filter(h => h.status === 'Confirmed').reduce((sum, h) => sum + safeNum(h.security_deposit) + safeNum(h.rent_amount), 0),
        filteredItems.filter(h => h.status === 'Confirmed').reduce((sum, h) => sum + (h.handover_items?.length || 0), 0)
      ],
      ['Completed',
        completedCount,
        filteredItems.filter(h => h.status === 'Completed').reduce((sum, h) => sum + safeNum(h.security_deposit), 0),
        filteredItems.filter(h => h.status === 'Completed').reduce((sum, h) => sum + safeNum(h.rent_amount), 0),
        filteredItems.filter(h => h.status === 'Completed').reduce((sum, h) => sum + safeNum(h.security_deposit) + safeNum(h.rent_amount), 0),
        filteredItems.filter(h => h.status === 'Completed').reduce((sum, h) => sum + (h.handover_items?.length || 0), 0)
      ],
      ['Pending',
        pendingCount,
        filteredItems.filter(h => h.status === 'Pending').reduce((sum, h) => sum + safeNum(h.security_deposit), 0),
        filteredItems.filter(h => h.status === 'Pending').reduce((sum, h) => sum + safeNum(h.rent_amount), 0),
        filteredItems.filter(h => h.status === 'Pending').reduce((sum, h) => sum + safeNum(h.security_deposit) + safeNum(h.rent_amount), 0),
        filteredItems.filter(h => h.status === 'Pending').reduce((sum, h) => sum + (h.handover_items?.length || 0), 0)
      ],
      ['Cancelled',
        cancelledCount,
        filteredItems.filter(h => h.status === 'Cancelled').reduce((sum, h) => sum + safeNum(h.security_deposit), 0),
        filteredItems.filter(h => h.status === 'Cancelled').reduce((sum, h) => sum + safeNum(h.rent_amount), 0),
        filteredItems.filter(h => h.status === 'Cancelled').reduce((sum, h) => sum + safeNum(h.security_deposit) + safeNum(h.rent_amount), 0),
        filteredItems.filter(h => h.status === 'Cancelled').reduce((sum, h) => sum + (h.handover_items?.length || 0), 0)
      ]
    ];

    const statusWs = XLSX.utils.aoa_to_sheet(statusData);
    XLSX.utils.book_append_sheet(wb, statusWs, "By Status");

    // 6. Monthly summary sheet
    const monthlyMap = new Map();
    filteredItems.forEach(h => {
      const month = h.handover_date ? new Date(h.handover_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Unknown';
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          handovers: 0,
          deposits: 0,
          rent: 0,
          items: 0
        });
      }
      const m = monthlyMap.get(month);
      m.handovers++;
      m.deposits += safeNum(h.security_deposit);
      m.rent += safeNum(h.rent_amount);
      m.items += h.handover_items?.length || 0;
    });

    const monthlyData = Array.from(monthlyMap.values()).map(m => ({
      'Month': m.month,
      'Handovers': m.handovers,
      'Total Deposits (₹)': m.deposits,
      'Total Rent (₹)': m.rent,
      'Total Value (₹)': m.deposits + m.rent,
      'Items Handed Over': m.items
    }));

    if (monthlyData.length > 0) {
      const monthlyWs = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, monthlyWs, "Monthly Trend");
    }

    // 7. Condition analysis sheet
    const conditionCounts: Record<string, number> = {};
    allItems.forEach(item => {
      const condition = item['Condition'] || 'Unknown';
      conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
    });

    const conditionData = Object.entries(conditionCounts).map(([condition, count]) => ({
      'Condition': condition,
      'Count': count,
      'Percentage': allItems.length > 0 ? `${((count / allItems.length) * 100).toFixed(1)}%` : '0%'
    }));

    if (conditionData.length > 0) {
      const conditionWs = XLSX.utils.json_to_sheet(conditionData);
      XLSX.utils.book_append_sheet(wb, conditionWs, "Item Conditions");
    }

    // Generate filename
    const filename = `handovers_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    
    toast.success(`Exported ${filteredItems.length} handovers successfully`);
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export handovers');
  }
};

  // ── PDF — FIX: convert id to string safely ────────────────────────────────
  const handleDownloadPDF = () => {
    if (!viewItem) return;
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = margin;

      // FIX: Convert id to string safely before substring
      const docId = String(viewItem.id).substring(0, 8).toUpperCase();

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('TENANT HANDOVER DOCUMENT', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Document ID: ${docId}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      // Tenant Info
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Tenant Information', margin, yPos);
      yPos += 6;

      const tenantInfo = [
        ['Tenant Name:', viewItem.tenant_name],
        ['Phone:', viewItem.tenant_phone],
        ['Email:', viewItem.tenant_email || 'N/A'],
        ['Property:', viewItem.property_name],
        ['Room:', `${viewItem.room_number}${viewItem.bed_number ? ` / ${viewItem.bed_number}` : ''}`],
      ];

      doc.setFontSize(10);
      tenantInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), margin + 40, yPos);
        yPos += 6;
      });
      yPos += 4;

      // Handover Details
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Handover Details', margin, yPos);
      yPos += 6;

      // FIX: Use safeNum for money values in PDF
      const secDep = safeNum(viewItem.security_deposit);
      const rentAmt = safeNum(viewItem.rent_amount);

      const handoverInfo = [
        ['Move-in Date:', fmt(viewItem.move_in_date)],
        ['Handover Date:', fmt(viewItem.handover_date)],
        ['Inspector:', viewItem.inspector_name],
      ['Security Deposit:', pdfMoney(secDep)],
['Rent Amount:', pdfMoney(rentAmt)],
['Total Amount:', pdfMoney(secDep + rentAmt)],
        ['Status:', viewItem.status],
      ];

      doc.setFontSize(10);
      handoverInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), margin + 40, yPos);
        yPos += 6;
      });

      // Items Table
      if (viewItem.handover_items && viewItem.handover_items.length > 0) {
        yPos += 4;
        if (yPos > 250) { doc.addPage(); yPos = margin; }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Item Checklist (${viewItem.handover_items.length} Items)`, margin, yPos);
        yPos += 8;

        const tableData = viewItem.handover_items.map((item, idx) => [
          (idx + 1).toString(),
          item.item_name,
          item.category,
          item.quantity.toString(),
          item.condition_at_movein,
          item.notes || '-',
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Item Name', 'Category', 'Qty', 'Condition', 'Notes']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235], textColor: 255 },
          margin: { left: margin, right: margin },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Notes
      if (viewItem.notes) {
        if (yPos > 250) { doc.addPage(); yPos = margin; }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Additional Notes:', margin, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const notesLines = doc.splitTextToSize(viewItem.notes, pageWidth - 2 * margin);
        doc.text(notesLines, margin, yPos);
        yPos += notesLines.length * 5 + 10;
      }

      // Signatures
      if (yPos > 250) { doc.addPage(); yPos = margin; }
      yPos += 10;
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Signatures', margin, yPos);
      yPos += 10;

      const signatureWidth = (pageWidth - 2 * margin - 20) / 3;
      const signatures = [
        { name: viewItem.tenant_name, label: 'Tenant Signature', date: fmt(viewItem.handover_date) },
        { name: viewItem.inspector_name, label: 'Inspector/Manager', date: fmt(viewItem.handover_date) },
        { name: 'Witness', label: 'Witness Signature', date: '__________' },
      ];

      signatures.forEach((sig, idx) => {
        const xPos = margin + idx * (signatureWidth + 10);
        doc.line(xPos, yPos + 15, xPos + signatureWidth, yPos + 15);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(sig.name, xPos + signatureWidth / 2, yPos + 20, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(sig.label, xPos + signatureWidth / 2, yPos + 25, { align: 'center' });
        doc.text(`Date: ${sig.date}`, xPos + signatureWidth / 2, yPos + 30, { align: 'center' });
      });

      const fileName = `Handover_${viewItem.tenant_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success('PDF downloaded successfully');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF: ' + err.message);
    }
  };

  // ── Share WhatsApp ────────────────────────────────────────────────────────
  const handleShareWhatsApp = () => {
    if (!viewItem) return;
    try {
      const phoneNumber = viewItem.tenant_phone.replace(/\D/g, '');
      if (!phoneNumber) { toast.error('Phone number is missing'); return; }

      const secDep = safeNum(viewItem.security_deposit);
      const rentAmt = safeNum(viewItem.rent_amount);

      const message = encodeURIComponent(
        `🏠 *TENANT HANDOVER DOCUMENT*\n\n` +
        `*Tenant:* ${viewItem.tenant_name}\n` +
        `*Phone:* ${viewItem.tenant_phone}\n` +
        `*Property:* ${viewItem.property_name}\n` +
        `*Room:* ${viewItem.room_number}${viewItem.bed_number ? ` / ${viewItem.bed_number}` : ''}\n` +
        `*Move-in Date:* ${fmt(viewItem.move_in_date)}\n` +
        `*Handover Date:* ${fmt(viewItem.handover_date)}\n` +
        `*Deposit:* ${money(secDep)}\n` +
        `*Rent:* ${money(rentAmt)}\n` +
        `*Total:* ${money(secDep + rentAmt)}\n` +
        `*Items:* ${viewItem.handover_items?.length || 0} items\n` +
        `*Status:* ${viewItem.status}`
      );
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    } catch (err) {
      toast.error('Failed to share via WhatsApp');
    }
  };

const handlePrint = () => {
  const printContent = document.getElementById('handover-report-print');
  if (!printContent) return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const styles = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
      } catch { return ''; }
    }).join('\n');

  printWindow.document.write(`
    <html>
      <head>
        <title>Tenant Handover Document</title>
        <style>${styles}</style>
        <style>
          body { background: white; padding: 20px; }
          .no-print { display: none !important; }
          @media print { body { margin: 10mm; } }
        </style>
      </head>
      <body>
        <div style="text-align:center; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
          <h1 style="font-size:18px; font-weight:700; color:#1e3a8a; margin:0;">Tenant Handover Document</h1>
          <p style="font-size:11px; color:#6b7280; margin:4px 0 0 0;">${viewItem?.tenant_name} — ${viewItem?.property_name}</p>
        </div>
        ${printContent.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 800);
};
  // ── OTP ───────────────────────────────────────────────────────────────────
  const handleInitiateOTP = () => {
    if (!viewItem) return;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);
    setOtpCode('');
    setShowOTPModal(true);
    toast.info(`OTP: ${otp} (demo mode)`);
  };

  const handleVerifyOTP = async () => {
    if (otpCode !== generatedOTP) { toast.error('Invalid OTP'); return; }
    try {
      if (viewItem) {
        await updateHandover(viewItem.id, { ...viewItem, status: 'Confirmed' });
        await loadAll();
        toast.success('Handover confirmed via OTP!');
        setShowOTPModal(false);
        setViewItem(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // ── Handover Items helpers ────────────────────────────────────────────────
  const addHandoverItem = () => setHandoverItems(p => [...p, emptyHandoverItem()]);
  const removeHandoverItem = (i: number) => {
    if (handoverItems.length === 1) { toast.error('At least one item required'); return; }
    setHandoverItems(p => p.filter((_, idx) => idx !== i));
  };
  const updateHandoverItemField = (i: number, field: keyof HandoverItem, value: any) => {
    setHandoverItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const hasFilters = statusFilter !== 'all' || propertyFilter !== 'all';
  const hasColSearch = Object.values(colSearch).some(v => v !== '');
  const activeCount = [statusFilter !== 'all', propertyFilter !== 'all'].filter(Boolean).length;
  const clearFilters = () => { setStatusFilter('all'); setPropertyFilter('all'); };
  const clearColSearch = () => setColSearch({ tenant_name: '', property_name: '', room_number: '', status: '', handover_date: '' });

  // FIX: safeNum for totalValue to prevent NaN display
  const totalValue = useMemo(() => {
    return safeNum(formData.security_deposit) + safeNum(formData.rent_amount);
  }, [formData.security_deposit, formData.rent_amount]);

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-gray-50 ">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="sticky top-20 z-10">
        <div className="px-0 sm:px-0 pt-0 pb-2 flex items-end justify-end gap-2">
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
  {can('export_tenant_handover') && (

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
  {can('create_tenant_handover') && (

            <button onClick={openAdd}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm transition-colors">
              <Plus className="h-3.5 w-3.5 flex-shrink-0" />
              <span className=" xs:inline">Add Handover</span>
            </button>
  )}
          </div>
        </div>

        {/* Stats */}
        <div className="px-0 sm:px-0 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <StatCard title="Total Handovers" value={stats.total}
              icon={FileText} color="bg-blue-600" bg="bg-gradient-to-br from-blue-50 to-blue-100" />
            <StatCard title="Active" value={stats.active}
              icon={Boxes} color="bg-green-600" bg="bg-gradient-to-br from-green-50 to-green-100" />
            <StatCard title="Confirmed" value={stats.confirmed}
              icon={ShieldCheck} color="bg-emerald-600" bg="bg-gradient-to-br from-emerald-50 to-emerald-100" />
            <StatCard title="Pending" value={stats.pending}
              icon={AlertTriangle} color="bg-amber-600" bg="bg-gradient-to-br from-amber-50 to-amber-100" />
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="relative">
        <main className="p-0 sm:p-0">
          <Card className="border rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
              <span className="text-sm font-semibold text-gray-700">
                All Handovers ({filteredItems.length})
                {selectedItems.size > 0 && (
                  <span className="ml-2 text-blue-600 text-xs">({selectedItems.size} selected)</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {selectedItems.size > 0 && (
                  <Button size="sm" variant="destructive"
                    className="h-7 text-[10px] px-2 bg-red-600 hover:bg-red-700"
                    onClick={handleBulkDelete}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete Selected ({selectedItems.size})
                  </Button>
                )}
                {hasColSearch && (
                  <button onClick={clearColSearch} className="text-[10px] text-blue-600 font-semibold">
                    Clear Search
                  </button>
                )}
              </div>
            </div>

<div className={`overflow-auto rounded-b-lg transition-all duration-300 ${
  selectedItems.size > 0
    ? 'max-h-[350px] md:max-h-[460px]'
    : 'max-h-[350px] md:max-h-[460px]'
}`}>              <div className="min-w-[1000px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50">
                    <TableRow>
                      <TableHead className="py-2 px-3 text-xs w-8">
                        <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200 rounded">
                          {selectAll ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" /> : <Square className="h-3.5 w-3.5 text-gray-400" />}
                        </button>
                      </TableHead>
                      <TableHead className="py-2 px-3 text-xs">Tenant</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Phone</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Property</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Room/Bed</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Move-In</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Handover Date</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Deposit</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Total</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Items</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Status</TableHead>
                      <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
                    </TableRow>

                    <TableRow className="bg-gray-50/80">
                      <TableCell className="py-1 px-2" />
                      {[
                        { key: 'tenant_name', ph: 'Search tenant…' },
                        { key: null, ph: '' },
                        { key: 'property_name', ph: 'Search prop…' },
                        { key: 'room_number', ph: 'Room…' },
                        { key: null, ph: '' },
                        { key: 'handover_date', ph: 'Date…' },
                        { key: null, ph: '' },
                        { key: null, ph: '' },
                        { key: null, ph: '' },
                        { key: 'status', ph: 'Status…' },
                      ].map((col, idx) => (
                        <TableCell key={idx} className="py-1 px-2">
                          {col.key ? (
                            <Input placeholder={col.ph}
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
                        <TableCell colSpan={12} className="text-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Loading handovers…</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-12">
                          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500">No handovers found</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.map(h => (
                      <TableRow key={h.id} className="hover:bg-gray-50">
                        <TableCell className="py-2 px-3">
                          <button onClick={() => toggleSelectItem(h.id)} className="p-1 hover:bg-gray-200 rounded">
                            {selectedItems.has(h.id) ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" /> : <Square className="h-3.5 w-3.5 text-gray-400" />}
                          </button>
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs font-medium">{h.tenant_name}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">{h.tenant_phone}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600 max-w-[140px] truncate">{h.property_name}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">
                          {h.room_number}{h.bed_number ? ` / ${h.bed_number}` : ''}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">{fmt(h.move_in_date)}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">{fmt(h.handover_date)}</TableCell>
                        <TableCell className="py-2 px-3 text-xs font-semibold text-gray-800">{money(h.security_deposit)}</TableCell>
                        <TableCell className="py-2 px-3 text-xs font-semibold text-gray-800">
                          {money(safeNum(h.security_deposit) + safeNum(h.rent_amount))}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs">
                          <Badge className="bg-blue-100 text-blue-700 text-[9px] px-1.5">
                            {h.handover_items?.length || 0} items
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <Badge className={`text-[9px] px-1.5 ${statusColor(h.status)}`}>{h.status}</Badge>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <div className="flex justify-end gap-1">
                               {can('view_tenant_handover') && (

                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => setViewItem(h)} title="View">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                               )}
                                  {can('edit_tenant_handover') && (
 
                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-amber-50 hover:text-amber-600"
                              onClick={() => openEdit(h)} title="Edit">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                                  )}
                                      {can('delete_tenant_handover') && (

                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDelete(h.id, h.tenant_name)} title="Delete">
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

        {/* ── FILTER DRAWER ────────────────────────────────────────────── */}
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
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-blue-500" /> Status
              </p>
              <div className="space-y-1">
                {(['all', 'Active', 'Confirmed', 'Completed', 'Pending', 'Cancelled'] as StatusType[]).map(s => (
                  <label key={s} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                    ${statusFilter === s ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
                    <input type="radio" name="status" value={s} checked={statusFilter === s}
                      onChange={() => setStatusFilter(s)} className="sr-only" />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusFilter === s ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <span className="text-[12px] font-medium">{s === 'all' ? 'All Statuses' : s}</span>
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

      {/* ══ ADD / EDIT DIALOG ════════════════════════════════════════════════ */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">{editingItem ? 'Edit Handover' : 'New Tenant Handover'}</h2>
              <p className="text-xs text-blue-100">
                Step {currentStep} of 2 — {currentStep === 1 ? 'Tenant & Property Details' : 'Item Checklist'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className={`h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center
                  ${currentStep === 1 ? 'bg-white text-blue-700' : 'bg-blue-500 text-white'}`}>
                  {currentStep > 1 ? <Check className="h-3 w-3" /> : '1'}
                </span>
                <div className="h-0.5 w-4 bg-blue-400" />
                <span className={`h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center
                  ${currentStep === 2 ? 'bg-white text-blue-700' : 'bg-blue-500 text-white opacity-60'}`}>2</span>
              </div>
              <DialogClose asChild>
                <button className="p-1.5 rounded-full hover:bg-white/20 transition"><X className="h-4 w-4" /></button>
              </DialogClose>
            </div>
          </div>

          <div className="p-4 overflow-y-auto max-h-[75vh] space-y-4">

            {/* ── STEP 1 ── */}
            {currentStep === 1 && (
              <>
                <div>
                  <SH icon={<User className="h-3 w-3" />} title="Tenant Details" />
                 <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">

  {/* Row 1 */}
  <div>
  <label className={L}>Select Tenant</label>
  <Select 
    value={formData.tenant_id} 
    onValueChange={(v) => {
      handleTenantSelect(v);
      setTenantSearchTerm('');
    }}
  >
    <SelectTrigger className={F}>
      <User className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
      <SelectValue placeholder="Select tenant (auto-fills details)" />
    </SelectTrigger>
    <SelectContent className="max-h-[300px]">
      {/* Search input */}
      <div className="sticky top-0 bg-white p-2 border-b z-10">
        <div className="relative">
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            placeholder="Search tenants..."
            className="pl-7 h-7 text-xs"
            value={tenantSearchTerm}
            onChange={(e) => setTenantSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      
      {/* Tenants list */}
      <div className="py-1">
        {tenants
          .filter(t => t.name.toLowerCase().includes(tenantSearchTerm.toLowerCase()) || 
                       t.phone.includes(tenantSearchTerm))
          .map(t => (
            <SelectItem key={t.id} value={String(t.id)} className={SI}>
              {t.name} — {t.phone}
            </SelectItem>
          ))}
        
        {/* Show message if no results */}
        {tenants.filter(t => t.name.toLowerCase().includes(tenantSearchTerm.toLowerCase()) || 
                            t.phone.includes(tenantSearchTerm)).length === 0 && (
          <div className="px-2 py-3 text-center">
            <p className="text-xs text-gray-400">No tenants found</p>
          </div>
        )}
      </div>
    </SelectContent>
  </Select>
</div>

  <div>
    <label className={L}>Tenant Name <span className="text-red-400">*</span></label>
    <Input
      className={F}
      placeholder="Auto-filled or enter manually"
      value={formData.tenant_name}
      onChange={e =>
        setFormData(p => ({ ...p, tenant_name: e.target.value }))
      }
    />
  </div>

  {/* Row 2 */}
  <div>
    <label className={L}>Phone <span className="text-red-400">*</span></label>
    <Input
      className={F}
      placeholder="Auto-filled"
      value={formData.tenant_phone}
      onChange={e =>
        setFormData(p => ({ ...p, tenant_phone: e.target.value }))
      }
    />
  </div>

  <div>
    <label className={L}>Email</label>
    <Input
      className={F}
      type="email"
      placeholder="Auto-filled"
      value={formData.tenant_email}
      onChange={e =>
        setFormData(p => ({ ...p, tenant_email: e.target.value }))
      }
    />
  </div>

</div>
                </div>

                <div>
                  <SH icon={<Building className="h-3 w-3" />} title="Property & Room" color="text-indigo-600" />
                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">

  {/* Row 1 */}
 <div>
  <label className={L}>Property <span className="text-red-400">*</span></label>
  <Select 
    value={formData.property_id} 
    onValueChange={(v) => {
      handlePropertySelect(v);
      setPropertySearchTerm('');
    }}
  >
    <SelectTrigger className={F}>
      <Building className="h-3 w-3 text-gray-400 mr-1.5" />
      <SelectValue placeholder="Select property">
        {formData.property_name || "Select property"}
      </SelectValue>
    </SelectTrigger>
    <SelectContent className="max-h-[300px]">
      {/* Search input */}
      <div className="sticky top-0 bg-white p-2 border-b z-10">
        <div className="relative">
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            placeholder="Search properties..."
            className="pl-7 h-7 text-xs"
            value={propertySearchTerm}
            onChange={(e) => setPropertySearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      
      {/* Properties list */}
      <div className="py-1">
        {properties
          .filter(p => p.name.toLowerCase().includes(propertySearchTerm.toLowerCase()))
          .map(p => (
            <SelectItem key={p.id} value={p.id} className={SI}>
              {p.name}
            </SelectItem>
          ))}
        
        {/* Show message if no results */}
        {properties.filter(p => 
          p.name.toLowerCase().includes(propertySearchTerm.toLowerCase())
        ).length === 0 && (
          <div className="px-2 py-3 text-center">
            <p className="text-xs text-gray-400">No properties found</p>
          </div>
        )}
      </div>
    </SelectContent>
  </Select>
</div>

  <div>
    <label className={L}>Room No. <span className="text-red-400">*</span></label>
    <Input
      className={F}
      placeholder="101"
      value={formData.room_number}
      onChange={e =>
        setFormData(p => ({ ...p, room_number: e.target.value }))
      }
    />
  </div>

  {/* Row 2 */}
  <div>
    <label className={L}>Bed No.</label>
    <Input
      className={F}
      placeholder="A / B"
      value={formData.bed_number}
      onChange={e =>
        setFormData(p => ({ ...p, bed_number: e.target.value }))
      }
    />
  </div>

  <div>
    <label className={L}>Inspector <span className="text-red-400">*</span></label>
    <Input
      className={F}
      placeholder="Inspector name"
      value={formData.inspector_name}
      onChange={e =>
        setFormData(p => ({ ...p, inspector_name: e.target.value }))
      }
    />
  </div>

</div>
                </div>

                <div>
                  <SH icon={<IndianRupee className="h-3 w-3" />} title="Dates & Financials" color="text-green-600" />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                    <div>
                      <label className={L}>Move-In Date <span className="text-red-400">*</span></label>
                      {/* FIX: value is already in YYYY-MM-DD via toInputDate */}
                      <Input type="date" className={F}
                        value={formData.move_in_date}
                        onChange={e => setFormData(p => ({ ...p, move_in_date: e.target.value }))} />
                    </div>
                    <div>
                      <label className={L}>Handover Date <span className="text-red-400">*</span></label>
                      <Input type="date" className={F}
                        value={formData.handover_date}
                        onChange={e => setFormData(p => ({ ...p, handover_date: e.target.value }))} />
                    </div>
                    <div>
                      <label className={L}>Security Deposit (₹)</label>
                      <Input type="number" min={0} className={F} placeholder="0"
                        value={formData.security_deposit}
                        onChange={e => setFormData(p => ({ ...p, security_deposit: safeNum(e.target.value) }))} />
                    </div>
                    <div>
                      <label className={L}>Rent Amount (₹)</label>
                      <Input type="number" min={0} className={F} placeholder="0"
                        value={formData.rent_amount}
                        onChange={e => setFormData(p => ({ ...p, rent_amount: safeNum(e.target.value) }))} />
                    </div>
                    {/* FIX: totalValue uses safeNum so never shows NaN */}
                    <div className="col-span-2 bg-blue-50 rounded-md px-3 py-1.5 flex justify-between items-center">
                      <span className="text-[11px] text-blue-700 font-semibold">Total Amount</span>
                      <span className="text-[12px] font-bold text-blue-800">{money(totalValue)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <SH icon={<StickyNote className="h-3 w-3" />} title="Status & Notes" color="text-amber-600" />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                    <div>
                      <label className={L}>Status</label>
                      <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
                        <SelectTrigger className={F}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => <SelectItem key={s} value={s} className={SI}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <label className={L}>Notes</label>
                      <Textarea className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-0 min-h-[48px] resize-none"
                        rows={2} placeholder="Additional notes…"
                        value={formData.notes}
                        onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 2: Item Checklist — with purchased items dropdown ── */}
         {currentStep === 2 && (
  <div>
    <SH icon={<FileText className="h-3 w-3" />} title="Item Checklist" />
    <div className="space-y-2">
      {/* Table Header */}
      <div className="
  grid grid-cols-12 gap-2 
  px-2 sm:px-3 py-2 
  bg-gray-100 rounded-lg 
  text-[9px] sm:text-[11px] 
  font-bold text-gray-600 uppercase tracking-wider
">
  <div className="col-span-3 break-words leading-tight">ITEM NAME *</div>
  
  <div className="col-span-3 break-words leading-tight">CATEGORY</div>
  
  <div className="col-span-2 break-words leading-tight">CONDITION</div>
  
  <div className="col-span-1 text-center break-words">QTY</div>
  
  <div className="col-span-2 break-words leading-tight">ASSET ID</div>
  
  <div className="col-span-1 text-center"></div>
</div>

      {/* Items List */}
      {handoverItems.map((item, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg bg-white">
          {/* Main Row */}
          <div className="grid grid-cols-12 gap-2 items-center p-2">
            {/* Item Name */}
            <div className="col-span-3">
              {purchasedItems.length > 0 ? (
                <Select
                  value={item.item_name}
                  onValueChange={v => {
                    updateHandoverItemField(idx, 'item_name', v);
                    setPurchasedItemSearchTerm('');
                  }}
                >
                  <SelectTrigger className="h-6 text-xs border-gray-200 bg-gray-50 w-full">
                    <SelectValue placeholder="Item name" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <div className="sticky top-0 bg-white p-2 border-b z-10">
                      <div className="relative">
                        <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <Input
                          placeholder="Search items..."
                          className="pl-7 h-7 text-xs"
                          value={purchasedItemSearchTerm}
                          onChange={(e) => setPurchasedItemSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="py-1">
                      {purchasedItems
                        .filter(pi => pi.label.toLowerCase().includes(purchasedItemSearchTerm.toLowerCase()))
                        .map((pi, i) => (
                          <SelectItem key={i} value={pi.value} className="text-xs">{pi.label}</SelectItem>
                        ))}
                      {purchasedItems.filter(pi => 
                        pi.label.toLowerCase().includes(purchasedItemSearchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="px-2 py-3 text-center">
                          <p className="text-xs text-gray-400">No items found</p>
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
              ) : (
                <Input 
                  className="h-6 text-xs border-gray-200 bg-gray-50 w-full" 
                  placeholder="Item name"
                  value={item.item_name}
                  onChange={e => updateHandoverItemField(idx, 'item_name', e.target.value)} 
                />
              )}
            </div>

            {/* Category */}
            <div className="col-span-3">
              <Select value={item.category} onValueChange={v => updateHandoverItemField(idx, 'category', v)}>
                <SelectTrigger className="h-6 text-xs border-gray-200 bg-gray-50 w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map(c => (
                      <SelectItem key={c.id} value={c.name} className="text-xs">{c.name}</SelectItem>
                    ))
                  ) : (
                    ['Furniture', 'Electronics', 'Mattress', 'Bedding', 'Utensils', 'Appliances', 'Other'].map(c => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Condition */}
            <div className="col-span-2">
              <Select 
                value={item.condition_at_movein} 
                onValueChange={v => updateHandoverItemField(idx, 'condition_at_movein', v)}
              >
                <SelectTrigger className="h-6 text-xs border-gray-200 bg-gray-50 w-full">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="col-span-1">
              <Input 
                type="number" 
                min={1} 
                className="h-6 text-xs text-center border-gray-200 bg-gray-50 w-full"
                value={item.quantity}
                onChange={e => updateHandoverItemField(idx, 'quantity', parseInt(e.target.value) || 1)} 
              />
            </div>

            {/* Asset ID */}
            <div className="col-span-2">
              <Input 
                className="h-6 text-xs border-gray-200 bg-gray-50 w-full" 
                placeholder="Asset ID"
                value={item.asset_id || ''}
                onChange={e => updateHandoverItemField(idx, 'asset_id', e.target.value)} 
              />
            </div>

            {/* Delete Button */}
            <div className="col-span-1 flex justify-center">
              <button 
                type="button" 
                onClick={() => removeHandoverItem(idx)}
                className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Second Row - Notes (Full Width) */}
          <div className="px-2 pb-2 pt-0">
            <Input 
              className="h-7 text-xs border-gray-200 bg-gray-50 w-full" 
              placeholder="Notes (Optional)"
              value={item.notes || ''}
              onChange={e => updateHandoverItemField(idx, 'notes', e.target.value)} 
            />
          </div>
        </div>
      ))}

      {/* Add Item Button */}
      <button 
        type="button" 
        onClick={addHandoverItem}
        className="w-full py-2.5 border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" /> Add Item
      </button>

      {/* Total */}
      <div className="flex justify-end items-center pt-3 mt-1 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-600 uppercase">Total Items:</span>
          <span className="text-lg font-bold text-gray-800">
            {handoverItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
          </span>
        </div>
      </div>
    </div>
  </div>
)}

            {/* Navigation */}
            <div className="flex gap-2 pt-1">
              {currentStep === 2 && (
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}
                  className="h-8 text-[11px] px-4 flex items-center gap-1.5">
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </Button>
              )}
              <Button disabled={submitting} onClick={handleSubmit}
                className="flex-1 h-8 text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm flex items-center justify-center gap-1.5">
                {submitting ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</>
                ) : currentStep === 1 ? (
                  <>Next <ChevronRight className="h-3.5 w-3.5" /></>
                ) : editingItem ? (
                  <><Check className="h-3.5 w-3.5" /> Update Handover</>
                ) : (
                  <><Check className="h-3.5 w-3.5" /> Create Handover</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ VIEW DIALOG ══════════════════════════════════════════════════════ */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={v => { if (!v) setViewItem(null); }}>
    <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-base font-semibold">Handover Document</h2>
                <p className="text-xs text-blue-100">{viewItem.tenant_name} — {viewItem.property_name}</p>
              </div>
             <div className="flex items-center gap-2 relative">
  {/* Download PDF — Red */}
  <button
    onClick={handleDownloadPDF}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-medium transition-colors"
  >
    <FileDown className="h-3.5 w-3.5" />
    <span className="hidden sm:inline">Download PDF</span>
  </button>

  {/* Share — Green, opens popup */}
  <div className="relative">
    <button
      onClick={() => setShowSharePopup(p => !p)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[11px] font-medium transition-colors"
    >
      <MessageCircle className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Share</span>
    </button>

    {showSharePopup && (
      <div className="absolute top-full right-0 mt-1.5 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-48 ">
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Share via</p>
        </div>
        {/* WhatsApp */}
        <button
          onClick={() => { handleShareWhatsApp(); setShowSharePopup(false); }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-green-50 transition-colors text-left"
        >
          <div className="h-7 w-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-800">WhatsApp</p>
            <p className="text-[9px] text-gray-400">Send to tenant</p>
          </div>
        </button>
        {/* Email */}
        <button
          onClick={() => {
            if (viewItem?.tenant_email) {
              const subject = encodeURIComponent(`Tenant Handover Document — ${viewItem.property_name}`);
              const body = encodeURIComponent(
                `Dear ${viewItem.tenant_name},\n\nYour handover details:\n\nProperty: ${viewItem.property_name}\nRoom: ${viewItem.room_number}\nMove-in: ${fmt(viewItem.move_in_date)}\nDeposit: ${money(viewItem.security_deposit)}\nRent: ${money(viewItem.rent_amount)}\nStatus: ${viewItem.status}\n\nRegards`
              );
              window.open(`mailto:${viewItem.tenant_email}?subject=${subject}&body=${body}`, '_blank');
            } else {
              toast.error('No email address found for this tenant');
            }
            setShowSharePopup(false);
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left border-t border-gray-100"
        >
          <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Mail className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-800">Email</p>
            <p className="text-[9px] text-gray-400">{viewItem?.tenant_email || 'No email'}</p>
          </div>
        </button>
      </div>
    )}
  </div>

  {/* Print — Blue */}
  <button
    onClick={handlePrint}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-medium transition-colors"
  >
    <Printer className="h-3.5 w-3.5" />
    <span className="hidden sm:inline">Print Page</span>
  </button>

  {/* Verify — Purple */}
  {viewItem.status !== 'Confirmed' && (
    <button
      onClick={handleInitiateOTP}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-medium transition-colors"
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Verify with OTP</span>
    </button>
  )}

  {/* Close */}
  <DialogClose asChild>
    <button className="p-1.5 rounded-full hover:bg-white/20 transition ml-1">
      <X className="h-4 w-4 text-white" />
    </button>
  </DialogClose>
</div>
            </div>

<div id="handover-report-print" className="p-4 overflow-y-auto max-h-[75vh] space-y-4">
              {/* FIX: use safeNum for all money values in view */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  ['Tenant', viewItem.tenant_name],
                  ['Phone', viewItem.tenant_phone],
                  ['Email', viewItem.tenant_email || 'N/A'],
                  ['Property', viewItem.property_name],
                  ['Room/Bed', `${viewItem.room_number}${viewItem.bed_number ? ' / ' + viewItem.bed_number : ''}`],
                  ['Move-In', fmt(viewItem.move_in_date)],
                  ['Handover', fmt(viewItem.handover_date)],
                  ['Inspector', viewItem.inspector_name],
                  ['Deposit', money(viewItem.security_deposit)],
                  ['Rent', money(viewItem.rent_amount)],
                  ['Total', money(safeNum(viewItem.security_deposit) + safeNum(viewItem.rent_amount))],
                  ['Status', viewItem.status],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-500 font-medium">{label}</p>
                    <p className="text-[11px] font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {viewItem.handover_items && viewItem.handover_items.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-gray-700 mb-2">
                    Item Checklist ({viewItem.handover_items.length} items)
                  </p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">#</th>
                          <th className="px-3 py-2 text-left font-semibold">Item</th>
                          <th className="px-3 py-2 text-left font-semibold">Category</th>
                          <th className="px-3 py-2 text-center font-semibold">Qty</th>
                          <th className="px-3 py-2 text-center font-semibold">Condition</th>
                          <th className="px-3 py-2 text-left font-semibold">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewItem.handover_items.map((item, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 font-bold text-gray-500">{i + 1}</td>
                            <td className="px-3 py-2 font-medium text-gray-800">{item.item_name}</td>
                            <td className="px-3 py-2 text-gray-600">{item.category}</td>
                            <td className="px-3 py-2 text-center font-semibold">{item.quantity}</td>
                            <td className="px-3 py-2 text-center">
                              <Badge className={`text-[9px] px-1.5
                                ${item.condition_at_movein === 'New' ? 'bg-green-100 text-green-700' :
                                  item.condition_at_movein === 'Good' ? 'bg-blue-100 text-blue-700' :
                                  item.condition_at_movein === 'Used' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-orange-100 text-orange-700'}`}>
                                {item.condition_at_movein}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-gray-500">{item.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {viewItem.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 no-print">
                  <p className="text-[10px] font-bold text-amber-800 mb-1">Notes</p>
                  <p className="text-[11px] text-amber-700">{viewItem.notes}</p>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="border-b border-gray-400 mb-2 pb-8"></div>
                    <p className="text-xs font-bold text-gray-800">{viewItem.tenant_name}</p>
                    <p className="text-[9px] text-gray-500">Tenant Signature</p>
                    <p className="text-[8px] text-gray-400 mt-1">Date: {fmt(viewItem.handover_date)}</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b border-gray-400 mb-2 pb-8"></div>
                    <p className="text-xs font-bold text-gray-800">{viewItem.inspector_name}</p>
                    <p className="text-[9px] text-gray-500">Inspector/Manager</p>
                    <p className="text-[8px] text-gray-400 mt-1">Date: {fmt(viewItem.handover_date)}</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b border-gray-400 mb-2 pb-8"></div>
                    <p className="text-xs font-bold text-gray-800">Witness</p>
                    <p className="text-[9px] text-gray-500">Witness Signature</p>
                    <p className="text-[8px] text-gray-400 mt-1">Date: __________</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                <p className="text-[8px] text-blue-800">
                  This is an official handover document. By signing, both parties acknowledge the accuracy of the information above.
                </p>
                <p className="text-[8px] text-blue-700 mt-1 font-semibold">Status: {viewItem.status}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ══ OTP Modal ════════════════════════════════════════════════════════ */}
      {showOTPModal && viewItem && (
        <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
          <DialogContent className="max-w-md">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-t-lg -mt-4 -mx-4 mb-4">
              <h2 className="text-base font-semibold">Verify OTP</h2>
              <p className="text-xs text-purple-100">Confirm handover with tenant</p>
            </div>
            <div className="space-y-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-800">OTP sent to {viewItem.tenant_phone}</p>
                <p className="text-[10px] text-purple-600 mt-1">Demo OTP: {generatedOTP}</p>
              </div>
              <div>
                <label className={L}>Enter OTP</label>
                <Input
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  placeholder="6-digit OTP"
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleVerifyOTP} disabled={otpCode.length !== 6}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600">
                  Verify & Confirm
                </Button>
                <Button variant="outline" onClick={() => setShowOTPModal(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}