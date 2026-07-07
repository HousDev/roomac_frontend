

// MoveOutInspection.tsx
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  FileText, Plus, Trash2, Loader2, X, Download,
  Building, IndianRupee, StickyNote, RefreshCw, Filter, 
  AlertTriangle, ChevronDown, ChevronUp, User, Calendar,
  ShieldCheck, Eye, MessageCircle, FileDown, Printer, Check,
  ChevronRight, ChevronLeft, Boxes, Square, CheckSquare,
  AlertCircle,
  Edit,
  Smartphone,
  Mail,
  Share2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
  bulkDeleteInspections,
  getInspectionStats,
  getDefaultPenaltyRules
} from "@/lib/moveOutInspectionApi";
import { getHandovers } from "@/lib/handoverApi";
import { penaltyRulesApi } from "@/lib/penaltyRulesApi";
import * as XLSX from 'xlsx';
import { useAuth } from '@/context/authContext';
import { sendTenantOTP, verifyTenantOTP } from '@/lib/tenantAuthApi';
import { request } from '@/lib/api';
import { FaWhatsapp } from 'react-icons/fa';
import { getSettings, getSettingValue } from "@/lib/settingsApi";


// ─── Types ────────────────────────────────────────────────────────────────────
interface InspectionItem {
  id?: string;
  inspection_id?: string;
  handover_item_id: string;
  item_name: string;
  category: string;
  quantity: number;
  condition_at_movein: string;
  condition_at_moveout: string;
  penalty_amount: number;
  asset_id?: string; 
  notes?: string;
}

interface PenaltyRule {
  id: string;
  item_category: string;
  from_condition: string;
  to_condition: string;
  penalty_amount: number;
  description?: string;
}

interface MoveOutInspection {
  id: string;
  handover_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email?: string;
  property_id?: number;
  property_name: string;
  room_number: string;
  bed_number?: string;
  move_in_date?: string;
  inspection_date: string;
  inspector_name: string;
  total_penalty: number;
  notes?: string;
  status: string;
  penalty_rules?: PenaltyRule[];
  inspection_items?: InspectionItem[];
  created_at?: string;
}

interface HandoverOption {
  id: string;
  tenant_name: string;
  tenant_phone: string;
  property_name: string;
  room_number: string;
  bed_number?: string;
  move_in_date: string;
  status: string;
  handover_items?: any[];
}

type StatusType = 'all' | 'Completed' | 'Approved' | 'Pending' | 'Active' | 'Cancelled';

const CONDITIONS = ['New', 'Good', 'Used', 'Damaged', 'Missing'];

// ─── Style tokens ─────────────────────────────────────────────────────────────
const F = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L = "block text-[11px] font-semibold text-gray-500 mb-0.5";
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

const statusColor = (s: string) => {
  switch (s) {
    case 'Approved': return 'bg-emerald-100 text-emerald-700';
    case 'Completed': return 'bg-green-100 text-green-700';
    case 'Active': return 'bg-blue-100 text-blue-700';
    case 'Pending': return 'bg-amber-100 text-amber-700';
    case 'Cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const conditionColor = (c: string) => {
  switch (c) {
    case 'New': return 'bg-green-100 text-green-700';
    case 'Good': return 'bg-blue-100 text-blue-700';
    case 'Used': return 'bg-yellow-100 text-yellow-700';
    case 'Damaged': return 'bg-orange-100 text-orange-700';
    case 'Missing': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

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

const toInputDate = (d: string | undefined | null): string => {
  if (!d) return '';
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const safeNum = (v: any): number => {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
};

const money = (n: any) => `₹${safeNum(n).toLocaleString('en-IN')}`;
const pdfMoney = (n: any) => `Rs. ${safeNum(n).toLocaleString('en-IN')}`;

export function MoveOutInspection() {
  const [inspections, setInspections] = useState<MoveOutInspection[]>([]);
  const [handovers, setHandovers] = useState<HandoverOption[]>([]);
  const [penaltyRules, setPenaltyRules] = useState<PenaltyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MoveOutInspection | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewItem, setViewItem] = useState<MoveOutInspection | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [selectedHandover, setSelectedHandover] = useState<HandoverOption | null>(null);
  const [loadingHandovers, setLoadingHandovers] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
const [handoverSearchTerm, setHandoverSearchTerm] = useState('');
const [propertyFilterSearchTerm, setPropertyFilterSearchTerm] = useState('');
const handoverSearchRef = useRef<HTMLInputElement>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const { can } = useAuth(); // ← ADD THIS
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);

  const [stats, setStats] = useState({
    total: 0, completed: 0, approved: 0, pending: 0, active: 0, cancelled: 0,
    total_penalties: 0, avg_penalty: 0, max_penalty: 0, total_properties: 0
  });

  // ── Site settings (for logo, name, footer) ──
const [siteSettings, setSiteSettings] = useState({
  siteName: "ROOMAC",
  logo: "",
  phone: "",
  email: "",
  address: "",
});

// ── Print preview dialog state ──
const [showPrintPreview, setShowPrintPreview] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusType>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);

  const [generatedOtp, setGeneratedOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(60); 
    const [currentOTP, setCurrentOTP] = useState('');
    const [isResendOtpSent, setIsResendOtpSent] = useState(true);
   
// ── Pagination state (client-side) ──
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, "All"] as const;
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState<number | "All">(25);
const [totalItems, setTotalItems] = useState(0);
const [totalPages, setTotalPages] = useState(1);
  const [colSearch, setColSearch] = useState({
    tenant_name: '', property_name: '', room_number: '', inspector_name: '', status: '', inspection_date: ''
  });

  const emptyForm = {
    handover_id: '',
    inspection_date: new Date().toISOString().split('T')[0],
    inspector_name: '',
    total_penalty: 0,
    notes: '',
    status: 'Completed'
  };
  const [formData, setFormData] = useState(emptyForm);

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);

  // ── Load data ────────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (propertyFilter !== 'all') filters.property_id = propertyFilter;

      const res = await getInspections(filters);
      
      // Ensure data is properly formatted
      const data: MoveOutInspection[] = (res.data || []).map(i => {
  let items = i.inspection_items || [];
  if (typeof items === 'string') {
    try { items = JSON.parse(items); } catch { items = []; }
  }
  return {
    ...i,
    id: String(i.id),
    handover_id: String(i.handover_id),
    total_penalty: safeNum(i.total_penalty),
    inspection_items: Array.isArray(items) ? items : []
  };
});
      setInspections(data);

      try {
        const statsRes = await getInspectionStats();
        setStats(statsRes.data);
      } catch (statsErr) {
        console.error('Failed to load stats:', statsErr);
      }

      // Extract unique properties for filter
      const uniqueProps = Array.from(new Set(data.map(i => i.property_name)))
        .filter(Boolean)
        .map(name => ({ id: name, name }));
      setProperties(uniqueProps);
    } catch (err: any) {
      console.error('Failed to load inspections:', err);
      toast.error(err.message || 'Failed to load inspections');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, propertyFilter]);

  const loadHandovers = useCallback(async () => {
    try {
      setLoadingHandovers(true);
      const res = await getHandovers({ status: 'Active' });
      
      const data = (res.data || []).map(h => ({
        id: String(h.id),
        tenant_name: h.tenant_name,
        tenant_phone: h.tenant_phone,
        property_name: h.property_name,
        room_number: h.room_number,
        bed_number: h.bed_number,
        move_in_date: h.move_in_date,
        status: h.status,
        handover_items: h.handover_items || []
      }));
      setHandovers(data);
    } catch (err: any) {
      console.error('Failed to load handovers:', err);
      toast.error(err.message || 'Failed to load handovers');
    } finally {
      setLoadingHandovers(false);
    }
  }, []);

  const loadPenaltyRules = useCallback(async () => {
  try {
    const res = await penaltyRulesApi.getAll();
    const data = res.data || res;
    setPenaltyRules(Array.isArray(data) ? data : []);
  } catch (err: any) {
    console.error('Failed to load penalty rules:', err);
    setPenaltyRules([]);
  }
}, []);

  useEffect(() => {
    loadAll();
    loadHandovers();
    loadPenaltyRules();

     const fetchSiteSettings = async () => {
    try {
      const settings = await getSettings();
      setSiteSettings({
        siteName: getSettingValue(settings, "site_name", "ROOMAC"),
        logo: getSettingValue(settings, "logo_header", ""),
        phone: getSettingValue(settings, "contact_phone", ""),
        email: getSettingValue(settings, "contact_email", ""),
        address: getSettingValue(settings, "contact_address", ""),
      });
    } catch (err) {
      console.error("Failed to load site settings:", err);
    }
  };
  fetchSiteSettings();
}, []);

  

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Handover selection ───────────────────────────────────────────────────────
  const handleHandoverSelect = async (handoverId: string) => {
    if (!handoverId) {
      setSelectedHandover(null);
      setInspectionItems([]);
      return;
    }

    const handover = handovers.find(h => h.id === handoverId);
    if (!handover) return;

    setSelectedHandover(handover);
    setFormData(p => ({
      ...p,
      handover_id: handoverId
    }));

    setLoadingItems(true);
    try {
      // Simulate API delay - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Initialize inspection items from handover items
      if (handover.handover_items && handover.handover_items.length > 0) {
        const items: InspectionItem[] = handover.handover_items.map((item: any, index: number) => ({
          handover_item_id: item.id || String(index),
          item_name: item.item_name,
          category: item.category,
          quantity: item.quantity,
          condition_at_movein: item.condition_at_movein,
          condition_at_moveout: item.condition_at_movein, // Default to same as move-in
          penalty_amount: 0,
          asset_id: item.asset_id || '',
          notes: ''
        }));
        setInspectionItems(items);
      } else {
        // Create sample items for demo if none exist
        const sampleItems: InspectionItem[] = [
          {
            handover_item_id: 'sample1',
            item_name: 'King Size Bed',
            category: 'Furniture',
            quantity: 1,
            condition_at_movein: 'Good',
            condition_at_moveout: 'Good',
            penalty_amount: 0,
            notes: ''
          },
          {
            handover_item_id: 'sample2',
            item_name: 'Wardrobe',
            category: 'Furniture',
            quantity: 1,
            condition_at_movein: 'Good',
            condition_at_moveout: 'Good',
            penalty_amount: 0,
            notes: ''
          },
          {
            handover_item_id: 'sample3',
            item_name: 'Study Table',
            category: 'Furniture',
            quantity: 1,
            condition_at_movein: 'Used',
            condition_at_moveout: 'Used',
            penalty_amount: 0,
            notes: ''
          }
        ];
        setInspectionItems(sampleItems);
        toast.info('Sample items loaded for demo');
      }
    } catch (error) {
      console.error('Failed to load items:', error);
      toast.error('Failed to load handover items');
    } finally {
      setLoadingItems(false);
    }
  };

  // ── Calculate penalty based on rules ─────────────────────────────────────────
 const calculatePenalty = (
  category: string,
  fromCondition: string,
  toCondition: string
): number => {
  if (fromCondition === toCondition) return 0;

  // Exact rule match dhundho
  const rule = penaltyRules.find(r =>
    r.item_category === category &&
    r.from_condition === fromCondition &&
    r.to_condition === toCondition
  );

  if (rule) return rule.penalty_amount;

  // Agar Missing ke liye koi rule nahi, to category ki max penalty × 2
  if (toCondition === 'Missing') {
    const categoryRules = penaltyRules.filter(r => r.item_category === category);
    if (categoryRules.length > 0) {
      return Math.max(...categoryRules.map(r => r.penalty_amount)) * 2;
    }
  }

  return 0;
};

  // ── Update inspection item ───────────────────────────────────────────────────
 const updateInspectionItem = (index: number, field: keyof InspectionItem, value: any) => {
  const newItems = [...inspectionItems];
  newItems[index] = { ...newItems[index], [field]: value };

  if (field === 'condition_at_moveout') {
    const item = newItems[index];
    const penalty = calculatePenalty(
      item.category,
      item.condition_at_movein,
      value
    );
    newItems[index].penalty_amount = penalty;
  }

  setInspectionItems(newItems);

  const total = newItems.reduce((sum, item) => sum + (item.penalty_amount || 0), 0);
  setFormData(p => ({ ...p, total_penalty: total }));
};

  // ── Filtered rows ───────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return inspections.filter(i => {
      const cs = colSearch;
      const tn = !cs.tenant_name || i.tenant_name?.toLowerCase().includes(cs.tenant_name.toLowerCase());
      const pn = !cs.property_name || i.property_name?.toLowerCase().includes(cs.property_name.toLowerCase());
      const rn = !cs.room_number || i.room_number?.toLowerCase().includes(cs.room_number.toLowerCase());
      const ins = !cs.inspector_name || i.inspector_name?.toLowerCase().includes(cs.inspector_name.toLowerCase());
      const s = !cs.status || i.status?.toLowerCase().includes(cs.status.toLowerCase());
      const d = !cs.inspection_date || fmt(i.inspection_date).includes(cs.inspection_date);
      return tn && pn && rn && ins && s && d;
    });
  }, [inspections, colSearch]);

  const paginatedItems = useMemo(() => {
  if (pageSize === "All") return filteredItems;
  const start = (currentPage - 1) * (pageSize as number);
  return filteredItems.slice(start, start + (pageSize as number));
}, [filteredItems, currentPage, pageSize]);

useEffect(() => {
  setTotalItems(filteredItems.length);
  setTotalPages(pageSize === "All" ? 1 : Math.ceil(filteredItems.length / (pageSize as number)));
  if (currentPage > Math.ceil(filteredItems.length / (pageSize === "All" ? filteredItems.length : pageSize as number))) {
    setCurrentPage(1);
  }
}, [filteredItems, pageSize]);

  // ── Bulk Selection ───────────────────────────────────────────────────────────
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

  // ── CRUD Operations ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingItem(null);
    setSelectedHandover(null);
    setFormData({
      ...emptyForm,
      inspection_date: new Date().toISOString().split('T')[0]
    });
    setInspectionItems([]);
    setCurrentStep(1);
    setShowForm(true);
  };

  const openEdit = async (inspection: MoveOutInspection) => {
    try {
      setLoading(true);
      
      let fullData = inspection;
      if (inspection.id) {
        try {
          const fullInspection = await getInspectionById(inspection.id);
          fullData = fullInspection.data;
        } catch (err) {
          console.warn('Could not fetch full details, using provided data');
        }
      }

      setEditingItem(fullData);
      
      // Create handover object from inspection data
      setSelectedHandover({
        id: fullData.handover_id,
        tenant_name: fullData.tenant_name,
        tenant_phone: fullData.tenant_phone,
        property_name: fullData.property_name,
        room_number: fullData.room_number,
        bed_number: fullData.bed_number || '',
        move_in_date: fullData.move_in_date || '',
        status: 'Active',
        handover_items: []
      });

      setFormData({
        handover_id: fullData.handover_id,
        inspection_date: toInputDate(fullData.inspection_date) || new Date().toISOString().split('T')[0],
        inspector_name: fullData.inspector_name || '',
        total_penalty: safeNum(fullData.total_penalty),
        notes: fullData.notes || '',
        status: fullData.status || 'Pending'
      });

      // Ensure inspection items are properly formatted
    const rawItems = fullData.inspection_items;
const items = (Array.isArray(rawItems) ? rawItems : []).map(item => ({
  handover_item_id: String(item.handover_item_id || item.id || Math.random()),
  item_name: item.item_name || '',
  category: item.category || '',
  quantity: Number(item.quantity) || 1,
  condition_at_movein: item.condition_at_movein || 'Good',
  condition_at_moveout: item.condition_at_moveout || item.condition_at_movein || 'Good',
  penalty_amount: parseFloat(String(item.penalty_amount)) || 0,
  asset_id: item.asset_id || '',
  notes: item.notes || ''
}));
      
      setInspectionItems(items);
      
      setCurrentStep(2);
      setShowForm(true);
    } catch (err: any) {
      console.error('Failed to load inspection details:', err);
      toast.error(err.message || 'Failed to load inspection details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.handover_id) {
      toast.error('Please select a handover');
      return;
    }
    if (!formData.inspector_name) {
      toast.error('Inspector name is required');
      return;
    }
    if (currentStep === 1) {
      if (inspectionItems.length === 0) {
        toast.error('No items to inspect');
        return;
      }
      setCurrentStep(2);
      return;
    }

    // Validate all items have condition selected
    for (let i = 0; i < inspectionItems.length; i++) {
      if (!inspectionItems[i].condition_at_moveout) {
        toast.error(`Please select condition for item: ${inspectionItems[i].item_name}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const totalPenalty = inspectionItems.reduce((sum, item) => sum + (item.penalty_amount || 0), 0);
      
      const payload = {
        handover_id: formData.handover_id,
        inspection_date: formData.inspection_date,
        inspector_name: formData.inspector_name,
        total_penalty: totalPenalty,
        notes: formData.notes,
        status: formData.status || 'Completed',
        inspection_items: inspectionItems.map(item => ({
          handover_item_id: item.handover_item_id,
          item_name: item.item_name,
          category: item.category,
          quantity: item.quantity,
          condition_at_movein: item.condition_at_movein,
          condition_at_moveout: item.condition_at_moveout,
          penalty_amount: item.penalty_amount || 0,
          asset_id: item.asset_id || '',
          notes: item.notes || ''
        }))
      };


     if (editingItem) {
  await updateInspection(editingItem.id, payload);
  toast.success('Inspection updated successfully');
} else {
  await createInspection(payload);
  toast.success('Inspection created successfully');
}

// Update asset status in inventory based on move-out condition
console.log('Updating asset statuses for items:', inspectionItems.map(i => ({ 
  name: i.item_name, 
  asset_id: i.asset_id, 
  condition: i.condition_at_moveout 
})));


const shouldUpdateAssets = ['Pending','Completed', 'Approved'].includes(payload.status || '');

for (const item of inspectionItems) {
  if (!item.asset_id || String(item.asset_id).trim() === '') continue;
  if (!shouldUpdateAssets) continue;

  let newStatus: string;
  if (item.condition_at_moveout === 'Damaged') {
    newStatus = 'damaged';
  } else if (item.condition_at_moveout === 'Missing') {
    newStatus = 'missing';
  } else {
    newStatus = 'available';
  }

  console.log(`Updating asset ${item.asset_id} → ${newStatus}`);

  try {
    const res = await request('/api/inventory/assign-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        asset_id: String(item.asset_id).trim(), 
        status: newStatus,
        tenant_id: null
      })
    });
    console.log(`Asset ${item.asset_id} updated to ${newStatus}:`, res);
  } catch (e) {
    console.error(`Asset status update error for ${item.asset_id}:`, e);
  }
}
setShowForm(false);
await loadAll();
    } catch (err: any) {
      console.error('Failed to save inspection:', err);
      toast.error(err.message || 'Failed to save inspection');
    } finally {
      setSubmitting(false);
    }
  };

 const handleDelete = async (id: string, name?: string) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Delete inspection for "${name || id}"? This cannot be undone!`,
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
    await deleteInspection(id);
    await loadAll();
    
    Swal.fire({
      title: 'Deleted!',
      text: 'Inspection record deleted successfully.',
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
      text: err.message || 'Failed to delete inspection',
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
    text: `Delete ${selectedItems.size} selected inspection record(s)? This cannot be undone!`,
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
    await bulkDeleteInspections(Array.from(selectedItems));
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

    // 1. Main inspections sheet
    const inspectionsData = filteredItems.map(i => ({
      'Tenant Name': i.tenant_name,
      'Phone': i.tenant_phone,
      'Email': i.tenant_email || '',
      'Property': i.property_name,
      'Room Number': i.room_number,
      'Bed Number': i.bed_number || '',
      'Move-in Date': fmt(i.move_in_date),
      'Inspection Date': fmt(i.inspection_date),
      'Inspector': i.inspector_name,
      'Total Penalty (₹)': safeNum(i.total_penalty),
      'Items Count': i.inspection_items?.length || 0,
      'Status': i.status,
      'Notes': i.notes || '',
      'Created Date': i.created_at ? fmt(i.created_at) : '',
      'Inspection ID': i.id,
      'Handover ID': i.handover_id
    }));

    const inspectionsWs = XLSX.utils.json_to_sheet(inspectionsData);
    
    // Auto-size columns
    const inspectionsColWidths = [];
    const inspectionsHeaders = Object.keys(inspectionsData[0] || {});
    inspectionsHeaders.forEach(header => {
      const maxLength = Math.max(
        header.length,
        ...inspectionsData.map(row => String(row[header] || '').length)
      );
      inspectionsColWidths.push({ wch: Math.min(maxLength + 2, 50) });
    });
    inspectionsWs['!cols'] = inspectionsColWidths;
    
    XLSX.utils.book_append_sheet(wb, inspectionsWs, "Inspections");

    // 2. Items sheet - all inspection items with details
    const allItems: any[] = [];
    filteredItems.forEach(inspection => {
      if (inspection.inspection_items && inspection.inspection_items.length > 0) {
        inspection.inspection_items.forEach((item, idx) => {
          allItems.push({
            'Inspection ID': inspection.id,
            'Tenant': inspection.tenant_name,
            'Property': inspection.property_name,
            'Item #': idx + 1,
            'Item Name': item.item_name,
            'Category': item.category,
            'Quantity': item.quantity,
            'Condition at Move-in': item.condition_at_movein,
            'Condition at Move-out': item.condition_at_moveout,
            'Penalty Amount (₹)': item.penalty_amount || 0,
            'Item Notes': item.notes || '',
            'Status': inspection.status,
            'Inspection Date': fmt(inspection.inspection_date)
          });
        });
      }
    });

    if (allItems.length > 0) {
      const itemsWs = XLSX.utils.json_to_sheet(allItems);
      XLSX.utils.book_append_sheet(wb, itemsWs, "Inspection Items");
    }

    // 3. Summary sheet
    const totalInspections = filteredItems.length;
    const totalPenalties = filteredItems.reduce((sum, i) => sum + safeNum(i.total_penalty), 0);
    const maxPenalty = Math.max(...filteredItems.map(i => safeNum(i.total_penalty)), 0);
    const avgPenalty = totalInspections > 0 ? totalPenalties / totalInspections : 0;
    
    const completedCount = filteredItems.filter(i => i.status === 'Completed').length;
    const approvedCount = filteredItems.filter(i => i.status === 'Approved').length;
    const pendingCount = filteredItems.filter(i => i.status === 'Pending').length;
    const activeCount = filteredItems.filter(i => i.status === 'Active').length;
    const cancelledCount = filteredItems.filter(i => i.status === 'Cancelled').length;
    const itemsWithDamage = allItems.filter(item => 
      item['Condition at Move-out'] !== item['Condition at Move-in']
    ).length;

    const summaryData = [
      ['Metric', 'Value'],
      ['Total Inspections', totalInspections],
      ['Total Penalties (₹)', totalPenalties.toLocaleString('en-IN')],
      ['Average Penalty (₹)', avgPenalty.toLocaleString('en-IN')],
      ['Maximum Penalty (₹)', maxPenalty.toLocaleString('en-IN')],
      ['Completed Inspections', completedCount],
      ['Approved Inspections', approvedCount],
      ['Pending Inspections', pendingCount],
      ['Active Inspections', activeCount],
      ['Cancelled Inspections', cancelledCount],
      ['Items with Condition Change', itemsWithDamage],
      ['Total Items Inspected', allItems.length],
      ['Unique Properties', new Set(filteredItems.map(i => i.property_name)).size],
      ['Unique Inspectors', new Set(filteredItems.map(i => i.inspector_name)).size],
      ['Export Date', new Date().toLocaleString('en-IN')]
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // 4. Status breakdown sheet
    const statusData = [
      ['Status', 'Count', 'Total Penalty (₹)', 'Avg Penalty (₹)', 'Items Count'],
      ['Completed', 
        completedCount,
        filteredItems.filter(i => i.status === 'Completed').reduce((sum, i) => sum + safeNum(i.total_penalty), 0),
        completedCount > 0 ? filteredItems.filter(i => i.status === 'Completed').reduce((sum, i) => sum + safeNum(i.total_penalty), 0) / completedCount : 0,
        filteredItems.filter(i => i.status === 'Completed').reduce((sum, i) => sum + (i.inspection_items?.length || 0), 0)
      ],
      ['Approved',
        approvedCount,
        filteredItems.filter(i => i.status === 'Approved').reduce((sum, i) => sum + safeNum(i.total_penalty), 0),
        approvedCount > 0 ? filteredItems.filter(i => i.status === 'Approved').reduce((sum, i) => sum + safeNum(i.total_penalty), 0) / approvedCount : 0,
        filteredItems.filter(i => i.status === 'Approved').reduce((sum, i) => sum + (i.inspection_items?.length || 0), 0)
      ],
      ['Pending',
        pendingCount,
        filteredItems.filter(i => i.status === 'Pending').reduce((sum, i) => sum + safeNum(i.total_penalty), 0),
        pendingCount > 0 ? filteredItems.filter(i => i.status === 'Pending').reduce((sum, i) => sum + safeNum(i.total_penalty), 0) / pendingCount : 0,
        filteredItems.filter(i => i.status === 'Pending').reduce((sum, i) => sum + (i.inspection_items?.length || 0), 0)
      ],
      ['Active',
        activeCount,
        filteredItems.filter(i => i.status === 'Active').reduce((sum, i) => sum + safeNum(i.total_penalty), 0),
        activeCount > 0 ? filteredItems.filter(i => i.status === 'Active').reduce((sum, i) => sum + safeNum(i.total_penalty), 0) / activeCount : 0,
        filteredItems.filter(i => i.status === 'Active').reduce((sum, i) => sum + (i.inspection_items?.length || 0), 0)
      ],
      ['Cancelled',
        cancelledCount,
        filteredItems.filter(i => i.status === 'Cancelled').reduce((sum, i) => sum + safeNum(i.total_penalty), 0),
        cancelledCount > 0 ? filteredItems.filter(i => i.status === 'Cancelled').reduce((sum, i) => sum + safeNum(i.total_penalty), 0) / cancelledCount : 0,
        filteredItems.filter(i => i.status === 'Cancelled').reduce((sum, i) => sum + (i.inspection_items?.length || 0), 0)
      ]
    ];

    const statusWs = XLSX.utils.aoa_to_sheet(statusData);
    XLSX.utils.book_append_sheet(wb, statusWs, "Status Breakdown");

    // 5. Property summary sheet
    const propertyMap = new Map();
    filteredItems.forEach(i => {
      if (!propertyMap.has(i.property_name)) {
        propertyMap.set(i.property_name, {
          property: i.property_name,
          inspections: 0,
          penalties: 0,
          items: 0,
          completed: 0
        });
      }
      const prop = propertyMap.get(i.property_name);
      prop.inspections++;
      prop.penalties += safeNum(i.total_penalty);
      prop.items += i.inspection_items?.length || 0;
      if (i.status === 'Completed' || i.status === 'Approved') prop.completed++;
    });

    const propertyData = Array.from(propertyMap.values()).map(p => ({
      'Property': p.property,
      'Total Inspections': p.inspections,
      'Completed/Approved': p.completed,
      'Completion Rate': p.inspections > 0 ? `${((p.completed / p.inspections) * 100).toFixed(1)}%` : '0%',
      'Total Penalties (₹)': p.penalties,
      'Avg Penalty (₹)': p.inspections > 0 ? p.penalties / p.inspections : 0,
      'Total Items': p.items
    }));

    if (propertyData.length > 0) {
      const propertyWs = XLSX.utils.json_to_sheet(propertyData);
      XLSX.utils.book_append_sheet(wb, propertyWs, "By Property");
    }

    // 6. Condition change analysis sheet
    const conditionChanges: Record<string, { from: string, to: string, count: number, totalPenalty: number }> = {};
    
    allItems.forEach(item => {
      const from = item['Condition at Move-in'];
      const to = item['Condition at Move-out'];
      const key = `${from}→${to}`;
      
      if (!conditionChanges[key]) {
        conditionChanges[key] = { from, to, count: 0, totalPenalty: 0 };
      }
      conditionChanges[key].count++;
      conditionChanges[key].totalPenalty += item['Penalty Amount (₹)'] || 0;
    });

    const changeData = Object.values(conditionChanges).map(c => ({
      'From Condition': c.from,
      'To Condition': c.to,
      'Count': c.count,
      'Total Penalty (₹)': c.totalPenalty,
      'Avg Penalty (₹)': c.count > 0 ? c.totalPenalty / c.count : 0,
      'Percentage': allItems.length > 0 ? `${((c.count / allItems.length) * 100).toFixed(1)}%` : '0%'
    }));

    if (changeData.length > 0) {
      const changeWs = XLSX.utils.json_to_sheet(changeData);
      XLSX.utils.book_append_sheet(wb, changeWs, "Condition Changes");
    }

    // 7. Inspector performance sheet
    const inspectorMap = new Map();
    filteredItems.forEach(i => {
      if (!inspectorMap.has(i.inspector_name)) {
        inspectorMap.set(i.inspector_name, {
          inspector: i.inspector_name,
          inspections: 0,
          penalties: 0,
          items: 0,
          completed: 0
        });
      }
      const ins = inspectorMap.get(i.inspector_name);
      ins.inspections++;
      ins.penalties += safeNum(i.total_penalty);
      ins.items += i.inspection_items?.length || 0;
      if (i.status === 'Completed' || i.status === 'Approved') ins.completed++;
    });

    const inspectorData = Array.from(inspectorMap.values()).map(ins => ({
      'Inspector': ins.inspector,
      'Inspections': ins.inspections,
      'Completed/Approved': ins.completed,
      'Completion Rate': ins.inspections > 0 ? `${((ins.completed / ins.inspections) * 100).toFixed(1)}%` : '0%',
      'Total Penalties (₹)': ins.penalties,
      'Avg Penalty (₹)': ins.inspections > 0 ? ins.penalties / ins.inspections : 0,
      'Items Inspected': ins.items
    }));

    if (inspectorData.length > 0) {
      const inspectorWs = XLSX.utils.json_to_sheet(inspectorData);
      XLSX.utils.book_append_sheet(wb, inspectorWs, "Inspector Performance");
    }

    // 8. Monthly trend sheet
    const monthlyMap = new Map();
    filteredItems.forEach(i => {
      const month = i.inspection_date ? new Date(i.inspection_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Unknown';
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          inspections: 0,
          penalties: 0,
          items: 0
        });
      }
      const m = monthlyMap.get(month);
      m.inspections++;
      m.penalties += safeNum(i.total_penalty);
      m.items += i.inspection_items?.length || 0;
    });

    const monthlyData = Array.from(monthlyMap.values()).map(m => ({
      'Month': m.month,
      'Inspections': m.inspections,
      'Total Penalties (₹)': m.penalties,
      'Avg Penalty (₹)': m.inspections > 0 ? m.penalties / m.inspections : 0,
      'Items Inspected': m.items
    }));

    if (monthlyData.length > 0) {
      const monthlyWs = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, monthlyWs, "Monthly Trend");
    }

    // Generate filename
    const filename = `moveout_inspections_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    
    toast.success(`Exported ${filteredItems.length} inspections successfully`);
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export inspections');
  }
};
  // ── PDF Generation ───────────────────────────────────────────────────────────
const handleDownloadPDF = () => {
  if (!viewItem) return;
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    // ── White header ──
    const headerHeight = 30;
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, headerHeight, "F");
    doc.setDrawColor(226, 232, 240);
    doc.line(0, headerHeight, pageWidth, headerHeight);

    const yBase = headerHeight / 2 + 2;

    // Logo — left
    if (siteSettings?.logo) {
      try {
        const imgProps = doc.getImageProperties(siteSettings.logo);
        const maxW = 26, maxH = 26;
        const ratio = Math.min(maxW / imgProps.width, maxH / imgProps.height);
        const imgW = imgProps.width * ratio;
        const imgH = imgProps.height * ratio;
        doc.addImage(siteSettings.logo, imgProps.fileType || "PNG", margin + (maxW - imgW) / 2, yBase - imgH / 2, imgW, imgH);
      } catch (e) {}
    }

    // Heading — center
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(siteSettings?.siteName || "MOVE-OUT INSPECTION", pageWidth / 2, yBase, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Move-Out Inspection Report", pageWidth / 2, yBase + 6, { align: "center" });

    // Doc ID — right
    const docId = String(viewItem.id).substring(0, 8).toUpperCase();
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Document ID", pageWidth - margin, yBase - 3, { align: "right" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(docId, pageWidth - margin, yBase + 2, { align: "right" });

    let yPos = headerHeight + 4;

    // ── Meta bar ──
    const metaHeight = 11;
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, yPos, pageWidth - margin * 2, metaHeight, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, yPos, pageWidth - margin * 2, metaHeight, "S");

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "bold");
    doc.text("INSPECTION DATE", margin + 3, yPos + 4);
    doc.text("PROPERTY", pageWidth / 2 - 20, yPos + 4);
    doc.text("STATUS", pageWidth - margin - 30, yPos + 4);

    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(fmt(viewItem.inspection_date), margin + 3, yPos + 8.5);
    doc.text(viewItem.property_name || "—", pageWidth / 2 - 20, yPos + 8.5);

    const statusCol: [number, number, number] =
      viewItem.status === "Approved" || viewItem.status === "Completed" ? [22, 101, 52] :
      viewItem.status === "Pending" ? [146, 64, 14] : [153, 27, 27];
    doc.setTextColor(...statusCol);
    doc.setFont("helvetica", "bold");
    doc.text(viewItem.status?.toUpperCase() || "—", pageWidth - margin - 30, yPos + 8.5);

    yPos += metaHeight + 4;

    // ── Tenant / Inspector info ──
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "bold");
    doc.text("TENANT", margin, yPos);
    doc.text("PHONE", margin + 60, yPos);
    doc.text("ROOM/BED", margin + 110, yPos);
    doc.text("INSPECTOR", margin + 150, yPos);

    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "normal");
    doc.text(viewItem.tenant_name || "—", margin, yPos + 5);
    doc.text(viewItem.tenant_phone || "—", margin + 60, yPos + 5);
    doc.text(`${viewItem.room_number}${viewItem.bed_number ? "/" + viewItem.bed_number : ""}`, margin + 110, yPos + 5);
    doc.text(viewItem.inspector_name || "—", margin + 150, yPos + 5);

    yPos += 14;

    // ── Items table ──
    if (viewItem.inspection_items && viewItem.inspection_items.length > 0) {
      const tableData = viewItem.inspection_items.map((item, idx) => [
        String(idx + 1),
        item.item_name,
        item.category,
        String(item.quantity),
        item.condition_at_movein,
        item.condition_at_moveout,
        `Rs. ${safeNum(item.penalty_amount).toLocaleString("en-IN")}`,
        item.notes || "-",
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["#", "Item", "Category", "Qty", "Move-in", "Move-out", "Penalty", "Notes"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [51, 65, 85] },
        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: "bold", fontSize: 7.5 },
        margin: { left: margin, right: margin },
      });

      yPos = (doc as any).lastAutoTable.finalY + 6;
    }

    // ── Total penalty ──
    doc.setDrawColor(203, 213, 225);
    doc.line(pageWidth - margin - 62, yPos - 2, pageWidth - margin, yPos - 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Total Penalty", pageWidth - margin - 62, yPos + 3);
    doc.setTextColor(217, 119, 6);
    doc.text(pdfMoney(viewItem.total_penalty), pageWidth - margin, yPos + 3, { align: "right" });
    yPos += 12;

    // ── Diagonal watermark ──

doc.saveGraphicsState();
doc.setGState(new doc.GState({ opacity: 0.09 }));
doc.setFont("helvetica", "bold");
doc.setFontSize(56);
doc.setTextColor(100, 116, 139);

doc.text(
  (siteSettings.siteName?.split(" ")[0] || "ROOMAC").toUpperCase(),
  pageWidth / 2,
  pageHeight / 2,
  {
    align: "center",
    angle: 30,
  }
);

doc.restoreGraphicsState();

    // ── Notes ──
    if (viewItem.notes) {
      doc.setFillColor(254, 252, 232);
      doc.roundedRect(margin, yPos, pageWidth - margin * 2, 14, 2, 2, "F");
      doc.setFontSize(7);
      doc.setTextColor(161, 98, 7);
      doc.setFont("helvetica", "bold");
      doc.text("NOTES", margin + 3, yPos + 4);
      doc.setFontSize(8);
      doc.setTextColor(113, 63, 18);
      doc.setFont("helvetica", "normal");
      const notesLines = doc.splitTextToSize(viewItem.notes, pageWidth - margin * 2 - 6);
      doc.text(notesLines.slice(0, 2), margin + 3, yPos + 9);
      yPos += 18;
    }

    // ── Signatures ──
    if (yPos > 250) { doc.addPage(); yPos = margin; }
    yPos += 6;
    const signatureWidth = (pageWidth - 2 * margin - 20) / 3;
    const signatures = [
      { name: viewItem.tenant_name, label: "Tenant Signature" },
      { name: viewItem.inspector_name, label: "Inspector/Manager" },
      { name: "Witness", label: "Witness Signature" },
    ];
    signatures.forEach((sig, idx) => {
      const xPos = margin + idx * (signatureWidth + 10);
      doc.setDrawColor(148, 163, 184);
      doc.line(xPos, yPos + 12, xPos + signatureWidth, yPos + 12);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(sig.name || "—", xPos + signatureWidth / 2, yPos + 17, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(sig.label, xPos + signatureWidth / 2, yPos + 22, { align: "center" });
    });
    yPos += 30;

    // ── Footer ──
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    const footerParts = [siteSettings.phone && `Tel: ${siteSettings.phone}`, siteSettings.email && `Email: ${siteSettings.email}`].filter(Boolean).join("  |  ");
    if (footerParts) doc.text(footerParts, pageWidth / 2, yPos, { align: "center" });
    doc.text(`Powered by ${siteSettings.siteName}`, pageWidth / 2, yPos + 4, { align: "center" });
    doc.text(`Generated on ${new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, pageWidth / 2, yPos + 8, { align: "center" });

    const fileName = `MoveOut_Inspection_${viewItem.tenant_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
    toast.success("PDF downloaded successfully");
  } catch (err: any) {
    console.error("PDF generation error:", err);
    toast.error("Failed to generate PDF: " + err.message);
  }
};

  // ── Share WhatsApp ───────────────────────────────────────────────────────────
  const handleShareWhatsApp = () => {
    if (!viewItem) return;

    try {
      const phoneNumber = viewItem.tenant_phone.replace(/\D/g, '');
      if (!phoneNumber) { toast.error('Phone number is missing'); return; }

      const message = encodeURIComponent(
        `📋 *MOVE-OUT INSPECTION REPORT*\n\n` +
        `*Tenant:* ${viewItem.tenant_name}\n` +
        `*Phone:* ${viewItem.tenant_phone}\n` +
        `*Property:* ${viewItem.property_name}\n` +
        `*Room:* ${viewItem.room_number}${viewItem.bed_number ? ` / ${viewItem.bed_number}` : ''}\n` +
        `*Inspection Date:* ${fmt(viewItem.inspection_date)}\n` +
        `*Inspector:* ${viewItem.inspector_name}\n` +
        `*Total Penalty:* ${money(viewItem.total_penalty)}\n` +
        `*Items Inspected:* ${viewItem.inspection_items?.length || 0}\n` +
        `*Status:* ${viewItem.status}`
      );
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    } catch (err) {
      toast.error('Failed to share via WhatsApp');
    }
  };

const handlePrint = () => {
  const printContent = document.getElementById('inspection-report-print');
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
        <title>Move-Out Inspection Report</title>
        <style>${styles}</style>
        <style>
          body { background: white; padding: 20px; }
          .no-print { display: none !important; }
          @media print { body { margin: 10mm; } }
        </style>
      </head>
      <body>
        <div style="text-align:center; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
          <h1 style="font-size:18px; font-weight:700; color:#1e3a8a; margin:0;">Move-Out Inspection Report</h1>
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
// ── OTP Verification Functions ────────────────────────────────────────────────
const handleInitiateOTP = async () => {
  if (!viewItem) return;
  
  try {
    // Send OTP to tenant's email or phone
    const contact = viewItem.tenant_email || viewItem.tenant_phone;
    const result = await sendTenantOTP(contact);
    
    if (result.success) {
      setCurrentOTP(result.otp || "123456");
      setOtpCode('');
      setShowOTPModal(true);
      setIsResendOtpSent(false);
      setTimeLeft(60); // 60 seconds timer
      toast.success(`OTP sent to ${contact}`);
    } else {
      toast.error(result.message || "Failed to send OTP");
    }
  } catch (error: any) {
    console.error('OTP send error:', error);
    toast.error(error.message || "Failed to send OTP");
  }
};

const handleVerifyOTP = async () => {
  if (!viewItem) {
    toast.error('No inspection record found');
    return;
  }
  
  if (!otpCode || otpCode.length !== 6) {
    toast.error('Please enter a valid 6-digit OTP');
    return;
  }
  
  try {
    const contact = viewItem.tenant_email || viewItem.tenant_phone;
    // Verify OTP with backend
    const result = await verifyTenantOTP(contact, otpCode);
    
    if (result.success) {
      // Update inspection status to 'Approved'
      const updatedInspection = { 
        ...viewItem, 
        status: 'Approved' 
      };
      
      await updateInspection(viewItem.id, updatedInspection);
      await loadAll(); // Refresh the list
      
      toast.success('Inspection approved successfully!');
      setShowOTPModal(false);
      setOtpCode('');
      setViewItem(null); // Close view dialog
    } else {
      toast.error(result.message || 'Invalid OTP. Please try again.');
    }
  } catch (error: any) {
    console.error('OTP verification error:', error);
    toast.error(error.message || 'Failed to verify OTP');
  }
};

// Timer effect for resend
useEffect(() => {
  if (!showOTPModal) return;
  
  if (timeLeft > 0) {
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  } else if (timeLeft === 0 && !isResendOtpSent) {
    setIsResendOtpSent(true);
  }
}, [timeLeft, showOTPModal, isResendOtpSent]);

// Handle resend OTP
const handleResendOTP = async () => {
  if (!viewItem) return;
  
  try {
    const contact = viewItem.tenant_email || viewItem.tenant_phone;
    const result = await sendTenantOTP(contact);
    
    if (result.success) {
      setCurrentOTP(result.otp || "123456");
      setTimeLeft(60);
      setIsResendOtpSent(false);
      toast.success('OTP resent successfully!');
    } else {
      toast.error(result.message || "Failed to resend OTP");
    }
  } catch (error: any) {
    toast.error(error.message || "Failed to resend OTP");
  }
};

  const hasFilters = statusFilter !== 'all' || propertyFilter !== 'all';
  const hasColSearch = Object.values(colSearch).some(v => v !== '');
const activeCount = [
  statusFilter !== 'all',
  propertyFilter !== 'all',
].filter(Boolean).length;
  const clearFilters = () => { setStatusFilter('all'); setPropertyFilter('all'); };
  const clearColSearch = () => setColSearch({
    tenant_name: '', property_name: '', room_number: '', inspector_name: '', status: '', inspection_date: ''
  });

  return (
    <div className="bg-gray-50 ">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
     <div className="mb-2">
  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">

    {/* LEFT - Stats */}
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-1.5 flex-1">
      <StatCard
        title="Total Inspections"
        value={stats.total}
        icon={FileText}
        color="bg-blue-600"
        bg="bg-gradient-to-br from-blue-50 to-blue-100"
      />

      <StatCard
        title="Total Penalties"
        value={money(stats.total_penalties)}
        icon={IndianRupee}
        color="bg-red-600"
        bg="bg-gradient-to-br from-red-50 to-red-100"
      />

      <StatCard
        title="Completed"
        value={stats.completed}
        icon={Check}
        color="bg-green-600"
        bg="bg-green-50"
      />

      <StatCard
        title="Approved"
        value={stats.approved}
        icon={ShieldCheck}
        color="bg-emerald-600"
        bg="bg-emerald-50"
      />

      <StatCard
        title="Pending"
        value={stats.pending}
        icon={AlertCircle}
        color="bg-amber-600"
        bg="bg-amber-50"
      />

      <StatCard
        title="Cancelled"
        value={stats.cancelled}
        icon={X}
        color="bg-red-600"
        bg="bg-red-50"
      />
    </div>

    {/* RIGHT - Action Buttons */}
    <div className="flex items-center justify-end gap-2 shrink-0 lg:mt-8">
      <button
        onClick={() => setSidebarOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white text-[11px] font-medium transition-colors
          ${
            sidebarOpen || hasFilters
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
      >
        <Filter className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="hidden sm:inline">Filters</span>

        {activeCount > 0 && (
          <span
            className={`h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center
              ${
                sidebarOpen || hasFilters
                  ? "bg-white text-blue-600"
                  : "bg-blue-600 text-white"
              }`}
          >
            {activeCount}
          </span>
        )}
      </button>

      {can("export_moveout_inspection") && (
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white text-[11px] font-medium"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      )}

      {can("create_moveout_inspection") && (
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Add Inspection</span>
        </button>
      )}
    </div>

  </div>
</div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="relative">
  <main className="p-0 sm:p-0">
    {/* ── Bulk Selection Bar (outside Card) ── */}
    {selectedItems.size > 0 && (
      <div className="px-0 pb-2">
        <div className="flex items-center justify-between gap-3 border border-[#E2E8F4] rounded-xl px-3 py-2 min-h-[44px] bg-white">
          <span className="font-bold text-[#1A2B6D] text-sm whitespace-nowrap">
            {selectedItems.size} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSelectedItems(new Set()); setSelectAll(false); }}
              className="text-xs text-[#8892A4] hover:text-gray-600 px-2 py-1"
            >
              Clear
            </button>
            {can('delete_moveout_inspection') && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg text-xs font-bold text-[#DC2626] hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete {selectedItems.size}
              </button>
            )}
          </div>
        </div>
      </div>
    )}

    <Card className="border rounded-lg shadow-sm overflow-hidden">
      {/* ── Table ── */}
<div className="flex flex-col" style={{ height: window.innerWidth < 640 ? '310px' : '520px' }}>        <div className="overflow-auto flex-1 min-h-0">
          <table
            className="border-collapse text-[11px] font-sans"
            style={{ tableLayout: "fixed", minWidth: "1200px", width: "100%" }}
          >
            <colgroup>
              <col style={{ width: "34px" }} />    {/* checkbox */}
              <col style={{ width: "130px" }} />   {/* Tenant */}
              <col style={{ width: "100px" }} />   {/* Phone */}
              <col style={{ width: "140px" }} />   {/* Property */}
              <col style={{ width: "90px" }} />    {/* Room/Bed */}
              <col style={{ width: "100px" }} />   {/* Inspector */}
              <col style={{ width: "90px" }} />    {/* Inspection Date */}
              <col style={{ width: "100px" }} />   {/* Total Penalty */}
              <col style={{ width: "70px" }} />    {/* Items */}
              <col style={{ width: "90px" }} />    {/* Status */}
              <col style={{ width: "90px" }} />    {/* Actions */}
            </colgroup>

            {/* ── STICKY THEAD ── */}
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-200 border-b border-gray-300">
                <th className="px-1.5 py-1.5 text-center border-r border-gray-300 bg-gray-200">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectAll(checked);
                      setSelectedItems(checked ? new Set(filteredItems.map(i => i.id)) : new Set());
                    }}
                    className="w-3.5 h-3.5 cursor-pointer"
                  />
                </th>
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Tenant</span>
                </th>
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Phone</span>
                </th>
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Property</span>
                </th>
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Room/Bed</span>
                </th>
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Inspector</span>
                </th>
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Inspection Date</span>
                </th>
                <th className="px-1.5 py-1.5 text-right border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Penalty</span>
                </th>
                <th className="px-1.5 py-1.5 text-center border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Items</span>
                </th>
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Status</span>
                </th>
                <th className="px-1.5 py-1.5 text-right bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Actions</span>
                </th>
              </tr>

              {/* Search row */}
              <tr className="bg-white border-b border-gray-300">
                <td className="p-1 border-r border-gray-200" />
                <td className="p-1 border-r border-gray-200">
                  <input
                    placeholder="Search…"
                    value={colSearch.tenant_name || ''}
                    onChange={e => setColSearch(p => ({ ...p, tenant_name: e.target.value }))}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200" />
                <td className="p-1 border-r border-gray-200">
                  <input
                    placeholder="Search prop…"
                    value={colSearch.property_name || ''}
                    onChange={e => setColSearch(p => ({ ...p, property_name: e.target.value }))}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <input
                    placeholder="Room…"
                    value={colSearch.room_number || ''}
                    onChange={e => setColSearch(p => ({ ...p, room_number: e.target.value }))}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <input
                    placeholder="Inspector…"
                    value={colSearch.inspector_name || ''}
                    onChange={e => setColSearch(p => ({ ...p, inspector_name: e.target.value }))}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <input
                    placeholder="Date…"
                    value={colSearch.inspection_date || ''}
                    onChange={e => setColSearch(p => ({ ...p, inspection_date: e.target.value }))}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200" />
                <td className="p-1 border-r border-gray-200" />
                <td className="p-1 border-r border-gray-200">
                  <input
                    placeholder="Status…"
                    value={colSearch.status || ''}
                    onChange={e => setColSearch(p => ({ ...p, status: e.target.value }))}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1" />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Loading inspections…</p>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12">
                    <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">No inspections found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map(i => (
                  <tr key={i.id} className="hover:bg-gray-50 border-b border-slate-200">
                    <td className="px-1.5 py-1.5 text-center border-r border-slate-200">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(i.id)}
                        onChange={() => {
                          const newSet = new Set(selectedItems);
                          if (newSet.has(i.id)) newSet.delete(i.id);
                          else newSet.add(i.id);
                          setSelectedItems(newSet);
                          setSelectAll(newSet.size === filteredItems.length && filteredItems.length > 0);
                        }}
                        className="w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] font-medium text-slate-800 border-r border-slate-200">
                      {i.tenant_name}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-200">
                      {i.tenant_phone}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] text-slate-600 truncate max-w-[140px] border-r border-slate-200">
                      {i.property_name}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-200">
                      {i.room_number}{i.bed_number ? ` / ${i.bed_number}` : ''}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-200">
                      {i.inspector_name}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-200">
                      {fmt(i.inspection_date)}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] font-semibold text-slate-800 text-right border-r border-slate-200">
                      <span className={i.total_penalty > 0 ? 'text-red-600' : 'text-green-600'}>
                        {money(i.total_penalty)}
                      </span>
                    </td>
                    <td className="px-1.5 py-1.5 text-center border-r border-slate-200">
                      <Badge className="bg-blue-100 text-blue-700 text-[9px] px-1.5">
                        {i.inspection_items?.length || 0}
                      </Badge>
                    </td>
                    <td className="px-1.5 py-1.5 border-r border-slate-200">
                      <Badge className={`text-[9px] px-1.5 ${statusColor(i.status)}`}>
                        {i.status}
                      </Badge>
                    </td>
                    <td className="px-1.5 py-1.5 text-right">
                      <div className="flex justify-end gap-0.5">
                        {can('view_moveout_inspection') && (
                          <button
                            title="View"
                            className="w-6 h-6 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center transition-colors"
                            onClick={async () => {
                              try {
                                const full = await getInspectionById(i.id);
                                setViewItem(full.data);
                              } catch {
                                setViewItem(i);
                              }
                            }}
                          >
                            <Eye size={12} />
                          </button>
                        )}
                        {can('edit_moveout_inspection') && (
                          <button
                            title="Edit"
                            className="w-6 h-6 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 flex items-center justify-center transition-colors"
                            onClick={() => openEdit(i)}
                          >
                            <Edit size={12} />
                          </button>
                        )}
                        {can('delete_moveout_inspection') && (
                          <button
                            title="Delete"
                            className="w-6 h-6 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors"
                            onClick={() => handleDelete(i.id, i.tenant_name)}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer: pagination ── */}
      {!loading && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 bg-white border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Show</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                const newSize = val === "All" ? "All" : Number(val);
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-6 w-16 text-[10px] border-gray-200 px-1">
                <SelectValue>{pageSize}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={String(size)} value={String(size)} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>entries</span>
            <span className="ml-2">
              Showing {paginatedItems.length > 0 ? ((currentPage - 1) * (pageSize === "All" ? totalItems : pageSize)) + 1 : 0}–
              {Math.min(
                (pageSize === "All" ? totalItems : currentPage * (pageSize as number)),
                totalItems
              )} of {totalItems}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm" variant="outline"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum} size="sm"
                  variant={currentPage === pageNum ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-6 w-6 p-0 text-[10px] ${currentPage === pageNum ? "bg-blue-600 text-white border-blue-600" : ""}`}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              size="sm" variant="outline"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  </main>

        {/* ── FILTER DRAWER ────────────────────────────────────────────── */}
     {sidebarOpen && (
  <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />
)}
<aside className={`fixed top-0 right-0 h-full z-40 w-[85vw] sm:w-96 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
  <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-white" />
      <span className="text-sm font-semibold text-white">Filters</span>
      {activeCount > 0 && (
        <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">
          {activeCount} active
        </span>
      )}
    </div>
    <div className="flex items-center gap-2">
      {activeCount > 0 && (
        <button onClick={clearFilters} className="text-[10px] text-blue-200 hover:text-white font-semibold">
          Clear all
        </button>
      )}
      <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white">
        <X className="h-4 w-4" />
      </button>
    </div>
  </div>

  <div className="flex-1 overflow-y-auto p-4">
    <div className="grid grid-cols-2 gap-3">
      {/* Status Dropdown */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3 text-blue-500" /> Status
        </p>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as StatusType)}>
          <SelectTrigger className="w-full h-8 text-xs border-gray-200">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Property Dropdown */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <Building className="h-3 w-3 text-indigo-500" /> Property
        </p>
        <Select value={propertyFilter} onValueChange={(val) => setPropertyFilter(val)}>
          <SelectTrigger className="w-full h-8 text-xs border-gray-200">
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>

  <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
    <button
      onClick={clearFilters}
      disabled={!activeCount}
      className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Clear All
    </button>
    <button
      onClick={() => setSidebarOpen(false)}
      className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:from-blue-700 hover:to-indigo-700"
    >
      Apply & Close
    </button>
  </div>
</aside>
      </div>

      {/* ══ ADD / EDIT DIALOG ════════════════════════════════════════════════ */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-2 py-2 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">{editingItem ? 'Edit Inspection' : 'New Move-Out Inspection'}</h2>
              <p className="text-xs text-blue-100">
                Step {currentStep} of 2 — {currentStep === 1 ? 'Select Handover' : 'Inspect Items'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className={`h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center
                  ${currentStep === 1 ? 'bg-white text-blue-700' : 'bg-blue-500 text-white'}`}>
                  {currentStep > 1 ? <Check className="h-3 w-3" /> : '1'}
                </span>
                <div className="h-0.5 w-4 bg-blue-200" />
                <span className={`h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center
                  ${currentStep === 2 ? 'bg-white text-blue-700' : 'bg-blue-500 text-white opacity-60'}`}>2</span>
              </div>
              <DialogClose asChild>
                <button className="p-1.5 rounded-full hover:bg-white/20 transition"><X className="h-4 w-4" /></button>
              </DialogClose>
            </div>
          </div>

          <div className="p-2 overflow-y-auto max-h-[75vh] space-y-4">

            {/* ── STEP 1 ── */}
            {currentStep === 1 && (
              <>
                <div>
                  <SH icon={<User className="h-3 w-3" />} title="Select Tenant Handover" />
                 <div>
  <label className={L}>Handover <span className="text-red-400">*</span></label>
  {loadingHandovers ? (
    <div className="flex items-center justify-center py-4">
      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
    </div>
  ) : (
   <Select 
      value={formData.handover_id} 
      onValueChange={(v) => {
        handleHandoverSelect(v);
        setHandoverSearchTerm('');
      }}
      onOpenChange={(open) => {
        if (open) requestAnimationFrame(() => handoverSearchRef.current?.focus());
      }}
    >
      <SelectTrigger className={F}>
        <User className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
        <SelectValue placeholder="Select active handover" />
      </SelectTrigger>
      <SelectContent position="popper" sideOffset={4} className="max-h-[300px] w-[var(--radix-select-trigger-width)]">
        {/* Search input */}
        <div className="sticky top-0 bg-white p-2 border-b z-10">
          <div className="relative">
            <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              ref={handoverSearchRef}
              placeholder="Search handovers..."
              className="pl-7 h-7 text-xs"
              value={handoverSearchTerm}
              onChange={(e) => setHandoverSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        
        {/* Handovers list */}
        <div className="py-1">
          {handovers
            .filter(h => 
              h.tenant_name.toLowerCase().includes(handoverSearchTerm.toLowerCase()) ||
              h.property_name.toLowerCase().includes(handoverSearchTerm.toLowerCase()) ||
              h.room_number.toLowerCase().includes(handoverSearchTerm.toLowerCase())
            )
            .map(h => (
              <SelectItem key={h.id} value={String(h.id)} className={SI}>
                {h.tenant_name} — {h.property_name} Room {h.room_number}
                {h.bed_number ? `/${h.bed_number}` : ''}
              </SelectItem>
            ))}
          
          {/* Show message if no results */}
          {handovers.filter(h => 
            h.tenant_name.toLowerCase().includes(handoverSearchTerm.toLowerCase()) ||
            h.property_name.toLowerCase().includes(handoverSearchTerm.toLowerCase()) ||
            h.room_number.toLowerCase().includes(handoverSearchTerm.toLowerCase())
          ).length === 0 && (
            <div className="px-2 py-3 text-center">
              <p className="text-xs text-gray-400">No handovers found</p>
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  )}
</div>
                </div>

                {selectedHandover && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <SH icon={<Building className="h-3 w-3" />} title="Handover Details" color="text-blue-700" />
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><span className="font-semibold">Tenant:</span> {selectedHandover.tenant_name}</div>
                      <div><span className="font-semibold">Phone:</span> {selectedHandover.tenant_phone}</div>
                      <div><span className="font-semibold">Property:</span> {selectedHandover.property_name}</div>
                      <div><span className="font-semibold">Room:</span> {selectedHandover.room_number}{selectedHandover.bed_number ? `/${selectedHandover.bed_number}` : ''}</div>
                      <div><span className="font-semibold">Move-in:</span> {fmt(selectedHandover.move_in_date)}</div>
                      <div><span className="font-semibold">Items:</span> {selectedHandover.handover_items?.length || 0}</div>
                    </div>
                  </div>
                )}

                <div>
                  <SH icon={<Calendar className="h-3 w-3" />} title="Inspection Details" color="text-green-600" />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                    <div>
                      <label className={L}>Inspector Name <span className="text-red-400">*</span></label>
                      <Input className={F} placeholder="Inspector name"
                        value={formData.inspector_name}
                        onChange={e => setFormData(p => ({ ...p, inspector_name: e.target.value }))} />
                    </div>
                    <div>
                      <label className={L}>Inspection Date <span className="text-red-400">*</span></label>
                      <Input type="date" className={F}
                        value={formData.inspection_date}
                        onChange={e => setFormData(p => ({ ...p, inspection_date: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div>
                  <SH icon={<StickyNote className="h-3 w-3" />} title="Notes" color="text-amber-600" />
                  <Textarea className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-0 min-h-[48px] resize-none"
                    rows={2} placeholder="Additional notes…"
                    value={formData.notes}
                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
                </div>

                {loadingItems && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="ml-2 text-xs text-gray-600">Loading items...</span>
                  </div>
                )}

                {inspectionItems.length > 0 && !loadingItems && (
                  <div className="bg-green-50 rounded-lg p-2 text-[11px] text-green-700 flex items-center gap-2">
                    <Check className="h-3.5 w-3.5" />
                    {inspectionItems.length} items loaded for inspection
                  </div>
                )}
              </>
            )}

            {/* ── STEP 2: Item Inspection ── */}
     {currentStep === 2 && (
  <div>
    <SH icon={<FileText className="h-3 w-3" />} title="Item Inspection Checklist" />

    {/* Alert / Summary – more compact */}
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-[11px] text-amber-800 font-semibold">
            Inspect each item and select its condition at move-out. Penalties will be calculated automatically based on condition changes.
          </p>
          <div className="bg-white rounded-md p-1.5 mt-1.5 border border-amber-200">
            <div className="text-xs font-bold text-gray-900">
              Total Penalty: <span className={formData.total_penalty > 0 ? 'text-red-600' : 'text-green-600'}>
                {money(formData.total_penalty)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Items list – reduced gaps and padding */}
    <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1">
      {inspectionItems.map((item, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
          
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-bold text-gray-900 text-sm">{item.item_name}</div>
              <div className="text-[10px] text-gray-600 mt-0.5">
                Category: <span className="font-semibold">{item.category}</span> |
                Qty: <span className="font-semibold">{item.quantity}</span>
              </div>
            </div>
            {item.penalty_amount > 0 && (
              <Badge className="bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 text-[10px] whitespace-nowrap ml-1">
                Penalty: {money(item.penalty_amount)}
              </Badge>
            )}
          </div>

          {/* Fields – compact grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-medium text-gray-600">Condition at Move-in</label>
              <Badge className={`text-[10px] px-1.5 py-0.5 block w-fit ${conditionColor(item.condition_at_movein)}`}>
                {item.condition_at_movein}
              </Badge>
            </div>

            <div>
              <label className="text-[10px] font-medium text-gray-600">Condition at Move-out *</label>
              <Select
                value={item.condition_at_moveout}
                onValueChange={v => updateInspectionItem(idx, 'condition_at_moveout', v)}
              >
                <SelectTrigger className="h-7 text-[10px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map(c => (
                    <SelectItem key={c} value={c} className="text-[10px]">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] font-medium text-gray-600">Custom Penalty (₹)</label>
              <Input
                type="number"
                min={0}
                className="h-7 text-[10px]"
                value={item.penalty_amount}
                onChange={e =>
                  updateInspectionItem(idx, 'penalty_amount', parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>

          {/* Notes – compact */}
          <div className="mt-0">
            <label className="text-[10px] font-medium text-gray-600">Notes / Damage Description</label>
            <Input
              className="h-7 text-[10px] w-full"
              placeholder="Describe any damage or issues..."
              value={item.notes || ''}
              onChange={e => updateInspectionItem(idx, 'notes', e.target.value)}
            />
          </div>

        </div>
      ))}
    </div>

    {/* Status – compact */}
    <div className="mt-2">
      <SH icon={<StickyNote className="h-3 w-3" />} title="Status" color="text-purple-600" />
      <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
        <SelectTrigger className="h-7 text-[10px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Approved">Approved</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
)}

            {/* Navigation */}
            <div className="flex gap-2 pt-4 border-t">
              {currentStep === 2 && (
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}
                  className="h-8 text-[11px] px-4 flex items-center gap-1.5">
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </Button>
              )}
              <Button disabled={submitting || loadingItems} onClick={handleSubmit}
                className="flex-1 h-8 text-[11px] font-semibold bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] hover:from-[#0A1F5C] hover:to-[#1E4ED8] text-white rounded-lg shadow-sm flex items-center justify-center gap-1.5">
                {submitting ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</>
                ) : currentStep === 1 ? (
                  <>Next <ChevronRight className="h-3.5 w-3.5" /></>
                ) : editingItem ? (
                  <><Check className="h-3.5 w-3.5" /> Update Inspection</>
                ) : (
                  <><Check className="h-3.5 w-3.5" /> Complete Inspection</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ VIEW DIALOG ══════════════════════════════════════════════════════ */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={v => { if (!v) setViewItem(null); }}>
          <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-2 py-2 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-base font-semibold">Move-Out Inspection Report</h2>
                <p className="text-xs text-blue-100">{viewItem.tenant_name} — {viewItem.property_name}</p>
              </div>
       <div className="flex items-center gap-2 relative">
  {/* Download PDF — Red */}
  <button
    onClick={handleDownloadPDF}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-medium transition-colors"
  >
    <FileDown className="h-3.5 w-3.5" />
    <span>Download PDF</span>
  </button>

  {/* Share — Green, opens popup */}
  <div className="relative">
    <button
      onClick={() => setShowSharePopup(p => !p)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[11px] font-medium transition-colors"
    >
      <Share2 className="h-3.5 w-3.5" />
      <span>Share</span>
    </button>

    {/* Share Popup */}
   {showSharePopup && (
  <div className="absolute top-full right-0 mt-1.5 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-48">
    
    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        Share via
      </p>
    </div>

    {/* WhatsApp */}
    <button
      onClick={() => { handleShareWhatsApp(); setShowSharePopup(false); }}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-green-50 transition-colors text-left"
    >
      <div className="h-7 w-7 rounded-full bg-green-500 flex items-center justify-center">
        <FaWhatsapp className="h-3.5 w-3.5 text-white" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-gray-800">WhatsApp</p>
        <p className="text-[9px] text-gray-400">Send to tenant</p>
      </div>
    </button>

    {/* SMS */}
    <button
      onClick={() => {
        if (viewItem?.tenant_phone) {
          const body = encodeURIComponent(
            `Inspection Report:\nProperty: ${viewItem.property_name}\nPenalty: ${money(viewItem.total_penalty)}`
          );
          window.open(`sms:${viewItem.tenant_phone}?body=${body}`);
        } else {
          toast.error('No phone number found');
        }
        setShowSharePopup(false);
      }}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-yellow-50 transition-colors text-left border-t border-gray-100"
    >
      <div className="h-7 w-7 rounded-full bg-yellow-500 flex items-center justify-center">
        <Smartphone className="h-3.5 w-3.5 text-white" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-gray-800">SMS</p>
        <p className="text-[9px] text-gray-400">{viewItem?.tenant_phone || 'No phone'}</p>
      </div>
    </button>

    {/* Email */}
    <button
      onClick={() => {
        if (viewItem?.tenant_email) {
          const subject = encodeURIComponent(`Move-Out Inspection Report — ${viewItem.property_name}`);
          const body = encodeURIComponent(
            `Dear ${viewItem.tenant_name},\n\nPlease find your move-out inspection details:\n\nProperty: ${viewItem.property_name}\nRoom: ${viewItem.room_number}\nInspection Date: ${fmt(viewItem.inspection_date)}\nTotal Penalty: ${money(viewItem.total_penalty)}\nStatus: ${viewItem.status}\n\nRegards`
          );
          window.open(`mailto:${viewItem.tenant_email}?subject=${subject}&body=${body}`, '_blank');
        } else {
          toast.error('No email address found for this tenant');
        }
        setShowSharePopup(false);
      }}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left border-t border-gray-100"
    >
      <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center">
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
  onClick={() => setShowPrintPreview(true)}
  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-medium transition-colors"
>
  <Printer className="h-3.5 w-3.5" />
  <span>Print</span>
</button>

  {/* Verify — Purple */}
  {viewItem.status !== 'Approved' && (
    <button
      onClick={handleInitiateOTP}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-medium transition-colors"
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      <span>Verify with OTP</span>
    </button>
  )}

  {/* Close */}
  <DialogClose asChild>
    <button className="p-1.5 rounded-full hover:bg-white/20 transition ml-1">
      <X className="h-4 w-4 text-white" />
    </button>
  </DialogClose>
</div>   </div>

<div id="inspection-report-print" className="p-4 overflow-y-auto max-h-[75vh] space-y-4">              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  ['Tenant', viewItem.tenant_name],
                  ['Phone', viewItem.tenant_phone],
                  ['Email', viewItem.tenant_email || 'N/A'],
                  ['Property', viewItem.property_name],
                  ['Room/Bed', `${viewItem.room_number}${viewItem.bed_number ? ' / ' + viewItem.bed_number : ''}`],
                  ['Move-in', fmt(viewItem.move_in_date)],
                  ['Inspection Date', fmt(viewItem.inspection_date)],
                  ['Inspector', viewItem.inspector_name],
                  ['Total Penalty', money(viewItem.total_penalty)],
                  ['Status', viewItem.status],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-500 font-medium">{label}</p>
                    <p className="text-[11px] font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {viewItem.inspection_items && viewItem.inspection_items.length > 0 ? (
                <div>
                  <p className="text-[11px] font-bold text-gray-700 mb-2 flex items-center justify-between">
                    <span>Inspection Checklist</span>
                    <Badge className="bg-blue-100 text-blue-700 text-[9px] px-2">
                      {viewItem.inspection_items.length} Items
                    </Badge>
                  </p>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">#</th>
                          <th className="px-3 py-2 text-left font-semibold">Item Name</th>
                          <th className="px-3 py-2 text-left font-semibold">Category</th>
                          <th className="px-3 py-2 text-center font-semibold">Qty</th>
                          <th className="px-3 py-2 text-center font-semibold">Move-in</th>
                          <th className="px-3 py-2 text-center font-semibold">Move-out</th>
                          <th className="px-3 py-2 text-right font-semibold">Penalty</th>
                          <th className="px-3 py-2 text-left font-semibold">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewItem.inspection_items.map((item, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 font-bold text-gray-500 border-r border-gray-200">{i + 1}</td>
                            <td className="px-3 py-2 font-medium text-gray-800 border-r border-gray-200">{item.item_name}</td>
                            <td className="px-3 py-2 text-gray-600 border-r border-gray-200">
                              <Badge className="bg-blue-100 text-blue-700 text-[8px] px-1">
                                {item.category}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-center font-semibold border-r border-gray-200">{item.quantity}</td>
                            <td className="px-3 py-2 text-center border-r border-gray-200">
                              <Badge className={`text-[8px] px-1 ${conditionColor(item.condition_at_movein)}`}>
                                {item.condition_at_movein}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-center border-r border-gray-200">
                              <Badge className={`text-[8px] px-1 ${conditionColor(item.condition_at_moveout)}`}>
                                {item.condition_at_moveout}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-red-600 border-r border-gray-200">
                              {money(item.penalty_amount)}
                            </td>
                            <td className="px-3 py-2 text-gray-500">{item.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-100 font-bold">
                        <tr>
                          <td colSpan={6} className="px-3 py-2 text-right">Total Penalty:</td>
                          <td className="px-3 py-2 text-right text-red-600">{money(viewItem.total_penalty)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-xs text-yellow-700">No inspection items found for this record.</p>
                </div>
              )}

              {viewItem.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3  no-print">
                  <p className="text-[10px] font-bold text-amber-800 mb-1">Additional Notes</p>
                  <p className="text-[11px] text-amber-700">{viewItem.notes}</p>
                </div>
              )}

              <div className="border-t-2 border-gray-200 pt-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 mb-2 pb-8"></div>
                    <p className="text-xs font-bold text-gray-800">{viewItem.tenant_name}</p>
                    <p className="text-[9px] text-gray-500">Tenant Signature</p>
                    <p className="text-[8px] text-gray-400 mt-1">Date: {fmt(viewItem.inspection_date)}</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 mb-2 pb-8"></div>
                    <p className="text-xs font-bold text-gray-800">{viewItem.inspector_name}</p>
                    <p className="text-[9px] text-gray-500">Inspector/Manager</p>
                    <p className="text-[8px] text-gray-400 mt-1">Date: {fmt(viewItem.inspection_date)}</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 mb-2 pb-8"></div>
                    <p className="text-xs font-bold text-gray-800">Witness</p>
                    <p className="text-[9px] text-gray-500">Witness Signature</p>
                    <p className="text-[8px] text-gray-400 mt-1">Date: __________</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                <p className="text-[8px] text-blue-800">
                  This is an official move-out inspection document. By signing, both parties acknowledge the accuracy of the inspection results.
                </p>
                <p className="text-[8px] text-blue-700 mt-1 font-semibold">Status: {viewItem.status}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}


      {/* Print Preview Dialog */}
<Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
  <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden p-0 flex flex-col">
    <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] px-2.5 py-2">
      <div>
        <h2 className="flex items-center gap-1.5 text-sm font-bold leading-tight text-white">
          <Printer className="h-3.5 w-3.5" />
          Inspection Report
        </h2>
        <p className="text-[10px] leading-tight text-blue-100">
          {viewItem?.tenant_name} • {viewItem?.property_name}
        </p>
      </div>
      <button
        onClick={() => setShowPrintPreview(false)}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
      >
        <X className="h-3.5 w-3.5 text-white" />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto px-3 py-2">
      {viewItem && (
        <div id="inspection-receipt-print-area" className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">

          {/* Watermark */}
          <div className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center overflow-hidden">
            <span
              className="whitespace-nowrap font-black leading-none"
              style={{ fontSize: "min(10vw, 56px)", letterSpacing: "0.02em", color: "rgba(100, 116, 139, 0.09)", transform: "rotate(-30deg)" }}
            >
              {siteSettings.siteName?.split(" ")[0]}
            </span>
          </div>

          {/* Header: logo left, name center, doc id right */}
          <div className="relative z-10 mb-3 flex items-center border-b border-slate-200 pb-3">
            <div className="w-28 flex-shrink-0">
              {siteSettings.logo && (
                <img src={siteSettings.logo} alt={siteSettings.siteName} className="h-20 w-auto object-contain"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
              )}
            </div>
            <div className="flex-1 text-center">
              <h2 className="text-lg font-bold text-slate-800">{siteSettings.siteName}</h2>
              <p className="text-sm font-semibold text-slate-700">Move-Out Inspection Report</p>
            </div>
            <div className="w-28 text-right text-[10px] text-slate-400">
              <span className="block font-semibold text-slate-600">Document ID</span>
              <span className="text-[10px]">{String(viewItem.id).substring(0, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Meta bar */}
          <div className="relative z-10 mb-3 flex justify-between border-b border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-500">
            <div>
              <span className="text-[9px] font-semibold uppercase">Inspection Date</span>
              <span className="block font-bold text-slate-800">{fmt(viewItem.inspection_date)}</span>
            </div>
            <div>
              <span className="text-[9px] font-semibold uppercase">Property</span>
              <span className="block font-bold text-slate-800">{viewItem.property_name || "—"}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-semibold uppercase">Status</span>
              <span className="block">
                <Badge className={`text-[10px] px-2 ${statusColor(viewItem.status)}`}>{viewItem.status}</Badge>
              </span>
            </div>
          </div>

          {/* Details grid */}
          <div className="relative z-10 mb-3 grid grid-cols-4 gap-x-4 gap-y-1 text-xs">
            <div><span className="text-[9px] font-semibold uppercase text-slate-400">Tenant</span><div className="font-medium text-slate-800">{viewItem.tenant_name || "—"}</div></div>
            <div><span className="text-[9px] font-semibold uppercase text-slate-400">Phone</span><div className="font-medium text-slate-800">{viewItem.tenant_phone || "—"}</div></div>
            <div><span className="text-[9px] font-semibold uppercase text-slate-400">Room/Bed</span><div className="font-medium text-slate-800">{viewItem.room_number}{viewItem.bed_number ? `/${viewItem.bed_number}` : ""}</div></div>
            <div><span className="text-[9px] font-semibold uppercase text-slate-400">Inspector</span><div className="font-medium text-slate-800">{viewItem.inspector_name || "—"}</div></div>
          </div>

          {/* Items table */}
          {viewItem.inspection_items && viewItem.inspection_items.length > 0 && (
            <div className="relative z-10 mb-3">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Inspection Checklist</p>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">#</th>
                    <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Item</th>
                    <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Category</th>
                    <th className="border border-slate-300 px-2 py-1 text-center font-semibold text-slate-600">Qty</th>
                    <th className="border border-slate-300 px-2 py-1 text-center font-semibold text-slate-600">Move-in</th>
                    <th className="border border-slate-300 px-2 py-1 text-center font-semibold text-slate-600">Move-out</th>
                    <th className="border border-slate-300 px-2 py-1 text-right font-semibold text-slate-600">Penalty</th>
                  </tr>
                </thead>
                <tbody>
                  {viewItem.inspection_items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-2 py-1 text-center text-slate-500">{idx + 1}</td>
                      <td className="border border-slate-300 px-2 py-1 font-medium text-slate-700">{item.item_name}</td>
                      <td className="border border-slate-300 px-2 py-1 text-slate-600">{item.category}</td>
                      <td className="border border-slate-300 px-2 py-1 text-center text-slate-600">{item.quantity}</td>
                      <td className="border border-slate-300 px-2 py-1 text-center text-slate-600">{item.condition_at_movein}</td>
                      <td className="border border-slate-300 px-2 py-1 text-center text-slate-600">{item.condition_at_moveout}</td>
                      <td className="border border-slate-300 px-2 py-1 text-right font-medium text-red-600">{money(item.penalty_amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 font-bold">
                    <td colSpan={6} className="border border-slate-300 px-2 py-1 text-right text-blue-700">Total Penalty</td>
                    <td className="border border-slate-300 px-2 py-1 text-right text-red-600">{money(viewItem.total_penalty)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {viewItem.notes && (
            <div className="relative z-10 mt-3 rounded-lg bg-yellow-50 p-2">
              <p className="mb-0.5 text-[10px] font-medium text-yellow-700">Notes</p>
              <p className="text-sm text-yellow-800">{viewItem.notes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="relative z-10 mt-8 grid grid-cols-3 gap-6 text-center text-xs">
            <div><div className="mb-1 border-t border-slate-400 pt-1">{viewItem.tenant_name}</div><p className="text-[9px] text-slate-500">Tenant Signature</p></div>
            <div><div className="mb-1 border-t border-slate-400 pt-1">{viewItem.inspector_name}</div><p className="text-[9px] text-slate-500">Inspector/Manager</p></div>
            <div><div className="mb-1 border-t border-slate-400 pt-1">Witness</div><p className="text-[9px] text-slate-500">Witness Signature</p></div>
          </div>

          <div className="receipt-footer relative z-10 mt-3 border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400">
            <p>
              {siteSettings.phone && `Tel: ${siteSettings.phone}`}
              {siteSettings.phone && siteSettings.email && "  |  "}
              {siteSettings.email && `Email: ${siteSettings.email}`}
            </p>
            <p className="mt-0.5">Powered by {siteSettings.siteName}</p>
            <p className="mt-0.5">
              Generated on {new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      )}
    </div>

    <div className="flex flex-shrink-0 gap-2 border-t border-slate-100 px-3 py-2">
      <button
        onClick={() => setShowPrintPreview(false)}
        className="h-8 flex-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
      >
        Close
      </button>
      <button
        onClick={() => {
          const content = document.getElementById("inspection-receipt-print-area");
          if (!content) return;
          const win = window.open("", "_blank", "width=800,height=900");
          if (!win) return;
          win.document.write(`
            <html>
              <head><title>Move-Out Inspection Report</title>
                <style>
                  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #fff; }
                  #inspection-receipt-print-area { max-width: 760px; margin: 0 auto; }
                  ${Array.from(document.styleSheets).reduce((acc, sheet) => {
                    try {
                      const rules = sheet.cssRules || sheet.rules;
                      if (rules) for (const rule of rules) acc += rule.cssText;
                    } catch (e) {}
                    return acc;
                  }, "")}
                </style>
              </head>
              <body>${content.outerHTML}</body>
            </html>
          `);
          win.document.close();
          win.focus();
          win.print();
        }}
        className="flex h-8 flex-[2] items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]  text-[11px] font-bold text-white hover:opacity-90"
      >
        <Printer className="h-3.5 w-3.5" /> Print Receipt
      </button>
    </div>
  </DialogContent>
</Dialog>

      {/* ══ OTP Modal ════════════════════════════════════════════════════════ */}
      {showOTPModal && viewItem && (
        <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
          <DialogContent className="max-w-md px-0 py-0">
            <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-2 py-2 rounded-t-lg">
              <h2 className="text-base font-semibold">Verify OTP</h2>
              <p className="text-xs text-purple-100">Confirm inspection with tenant</p>
            </div>
            <div className="space-y-4 px-4 pb-3">
              
              <div>
                <label className={L}>Enter OTP</label>
                <Input
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  placeholder="6-digit OTP"
                  className="text-center text-lg tracking-widest"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleVerifyOTP} disabled={otpCode.length !== 6}
                  className="flex-1 bg-gradient-to-r from-[#0A1F5C] to-[#1E4ED8]">
                  Verify & Approve
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowOTPModal(false);
                  setOtpCode('');
                }}>
                  Cancel
                </Button>
              </div>

          {isResendOtpSent && timeLeft === 0 ? (
            <button
              onClick={handleResendOTP}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Resend OTP
            </button>
          ) : (
            timeLeft > 0 && (
              <span className="text-xs text-gray-500">
                Resend available in {timeLeft} seconds
              </span>
            )
          )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}