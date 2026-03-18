


import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FileText, Plus, Trash2, Loader2, X, Download,
  Building, IndianRupee, StickyNote, RefreshCw, Filter,
  AlertTriangle, ChevronDown, ChevronUp, User, Calendar,
  ShieldCheck, Eye, MessageCircle, FileDown, Printer, Check,
  ChevronRight, ChevronLeft, Boxes, Square, CheckSquare,
  AlertCircle,
  Edit,
  Smartphone,
  Mail
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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [stats, setStats] = useState({
    total: 0, completed: 0, approved: 0, pending: 0, active: 0, cancelled: 0,
    total_penalties: 0, avg_penalty: 0, max_penalty: 0, total_properties: 0
  });

  const [statusFilter, setStatusFilter] = useState<StatusType>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);

  const [colSearch, setColSearch] = useState({
    tenant_name: '', property_name: '', room_number: '', inspector_name: '', status: '', inspection_date: ''
  });

  const emptyForm = {
    handover_id: '',
    inspection_date: new Date().toISOString().split('T')[0],
    inspector_name: '',
    total_penalty: 0,
    notes: '',
    status: 'Pending'
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

    // Update total penalty
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
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = margin;

      const docId = String(viewItem.id).substring(0, 8).toUpperCase();

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('MOVE-OUT INSPECTION REPORT', pageWidth / 2, yPos, { align: 'center' });
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
        ['Move-in Date:', fmt(viewItem.move_in_date)],
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

      // Inspection Details
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Inspection Details', margin, yPos);
      yPos += 6;

      const inspectionInfo = [
        ['Inspection Date:', fmt(viewItem.inspection_date)],
        ['Inspector:', viewItem.inspector_name],
        ['Total Penalty:', pdfMoney(viewItem.total_penalty)],
        ['Status:', viewItem.status],
      ];

      doc.setFontSize(10);
      inspectionInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), margin + 40, yPos);
        yPos += 6;
      });

      // Items Table
      if (viewItem.inspection_items && viewItem.inspection_items.length > 0) {
        yPos += 4;
        if (yPos > 250) { doc.addPage(); yPos = margin; }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Inspection Checklist (${viewItem.inspection_items.length} Items)`, margin, yPos);
        yPos += 8;

        const tableData = viewItem.inspection_items.map((item, idx) => [
          (idx + 1).toString(),
          item.item_name,
          item.category,
          item.quantity.toString(),
          item.condition_at_movein,
          item.condition_at_moveout,
          pdfMoney(item.penalty_amount),
          item.notes || '-',
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Item Name', 'Category', 'Qty', 'Move-in', 'Move-out', 'Penalty', 'Notes']],
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
        { name: viewItem.tenant_name, label: 'Tenant Signature', date: fmt(viewItem.inspection_date) },
        { name: viewItem.inspector_name, label: 'Inspector/Manager', date: fmt(viewItem.inspection_date) },
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

      const fileName = `MoveOut_Inspection_${viewItem.tenant_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success('PDF downloaded successfully');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF: ' + err.message);
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
  // ── OTP Verification ─────────────────────────────────────────────────────────
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
        await updateInspection(viewItem.id, { ...viewItem, status: 'Approved' });
        await loadAll();
        toast.success('Inspection approved via OTP!');
        setShowOTPModal(false);
        setViewItem(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const hasFilters = statusFilter !== 'all' || propertyFilter !== 'all';
  const hasColSearch = Object.values(colSearch).some(v => v !== '');
  const activeCount = [statusFilter !== 'all', propertyFilter !== 'all'].filter(Boolean).length;
  const clearFilters = () => { setStatusFilter('all'); setPropertyFilter('all'); };
  const clearColSearch = () => setColSearch({
    tenant_name: '', property_name: '', room_number: '', inspector_name: '', status: '', inspection_date: ''
  });

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
              <span className=" xs:inline">New Inspection</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-0 sm:px-0 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
            <StatCard title="Total Inspections" value={stats.total}
              icon={FileText} color="bg-blue-600" bg="bg-gradient-to-br from-blue-50 to-blue-100" />
            <StatCard title="Total Penalties" value={money(stats.total_penalties)}
              icon={IndianRupee} color="bg-red-600" bg="bg-gradient-to-br from-red-50 to-red-100" />
            <StatCard title="Completed" value={stats.completed} icon={Check} color="bg-green-600" bg="bg-green-50" />
            <StatCard title="Approved" value={stats.approved} icon={ShieldCheck} color="bg-emerald-600" bg="bg-emerald-50" />
           <StatCard title="Pending" value={stats.pending} icon={AlertCircle} color="bg-amber-600" bg="bg-amber-50" />
            <StatCard title="Cancelled" value={stats.cancelled} icon={X} color="bg-red-600" bg="bg-red-50" />
          </div>
          <div className="grid grid-cols-5 gap-1.5 mt-1.5">
            
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="relative">
        <main className="p-0 sm:p-0">
          <Card className="border rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
              <span className="text-sm font-semibold text-gray-700">
                All Inspections ({filteredItems.length})
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
    ? 'max-h-[310px] md:max-h-[450px]'
    : 'max-h-[310px] md:max-h-[450px]'
}`}>              <div className="min-w-[1200px]">
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
                      <TableHead className="py-2 px-3 text-xs">Inspector</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Inspection Date</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Total Penalty</TableHead>
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
                        { key: 'inspector_name', ph: 'Inspector…' },
                        { key: 'inspection_date', ph: 'Date…' },
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
                          <p className="text-xs text-gray-500">Loading inspections…</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-12">
                          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500">No inspections found</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.map(i => (
                      <TableRow key={i.id} className="hover:bg-gray-50">
                        <TableCell className="py-2 px-3">
                          <button onClick={() => toggleSelectItem(i.id)} className="p-1 hover:bg-gray-200 rounded">
                            {selectedItems.has(i.id) ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" /> : <Square className="h-3.5 w-3.5 text-gray-400" />}
                          </button>
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs font-medium">{i.tenant_name}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">{i.tenant_phone}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600 max-w-[140px] truncate">{i.property_name}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">
                          {i.room_number}{i.bed_number ? ` / ${i.bed_number}` : ''}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">{i.inspector_name}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">{fmt(i.inspection_date)}</TableCell>
                        <TableCell className="py-2 px-3 text-xs font-semibold text-gray-800">
                          <span className={i.total_penalty > 0 ? 'text-red-600' : 'text-green-600'}>
                            {money(i.total_penalty)}
                          </span>
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs">
                          <Badge className="bg-blue-100 text-blue-700 text-[9px] px-1.5">
                            {i.inspection_items?.length || 0} items
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <Badge className={`text-[9px] px-1.5 ${statusColor(i.status)}`}>{i.status}</Badge>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                              onClick={async () => {
  try {
    const full = await getInspectionById(i.id);
    setViewItem(full.data);
  } catch {
    setViewItem(i);
  }
}} title="View">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-amber-50 hover:text-amber-600"
                              onClick={() => openEdit(i)} title="Edit">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDelete(i.id, i.tenant_name)} title="Delete">
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
                {(['all', 'Completed', 'Approved', 'Pending', 'Active', 'Cancelled'] as StatusType[]).map(s => (
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
  
  {/* Search input for properties */}
  <div className="relative mb-2">
    <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <Input
      placeholder="Search properties..."
      className="pl-7 h-7 text-xs"
      value={propertyFilterSearchTerm}
      onChange={(e) => setPropertyFilterSearchTerm(e.target.value)}
    />
  </div>
  
  <div className="space-y-1 max-h-[200px] overflow-y-auto">
    <label className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
      ${propertyFilter === 'all' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
      <input type="radio" name="prop" value="all" checked={propertyFilter === 'all'}
        onChange={() => setPropertyFilter('all')} className="sr-only" />
      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${propertyFilter === 'all' ? 'bg-blue-500' : 'bg-gray-300'}`} />
      <span className="text-[12px] font-medium">All Properties</span>
      {propertyFilter === 'all' && (
        <span className="ml-auto">
          <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </label>
    
    {properties
      .filter(p => p.name.toLowerCase().includes(propertyFilterSearchTerm.toLowerCase()))
      .map(p => (
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
      
    {/* Show message if no results */}
    {properties.filter(p => p.name.toLowerCase().includes(propertyFilterSearchTerm.toLowerCase())).length === 0 && (
      <div className="px-2 py-3 text-center">
        <p className="text-xs text-gray-400">No properties found</p>
      </div>
    )}
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
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
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
    >
      <SelectTrigger className={F}>
        <User className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
        <SelectValue placeholder="Select active handover" />
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
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-amber-800 font-semibold">
            Inspect each item and select its condition at move-out. Penalties will be calculated automatically based on condition changes.
          </p>
          <div className="bg-white rounded-lg p-2 mt-2 border border-amber-200">
            <div className="text-sm font-bold text-gray-900">
              Total Penalty: <span className={formData.total_penalty > 0 ? 'text-red-600' : 'text-green-600'}>
                {money(formData.total_penalty)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-1">
  {inspectionItems.map((item, idx) => (
    <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold text-gray-900 text-sm">{item.item_name}</div>
          <div className="text-xs text-gray-600 mt-1">
            Category: <span className="font-semibold">{item.category}</span> |
            Quantity: <span className="font-semibold">{item.quantity}</span>
          </div>
        </div>

        {item.penalty_amount > 0 && (
          <Badge className="bg-red-100 text-red-700 border border-red-200 px-2 py-1 text-xs whitespace-nowrap ml-1">
            Penalty: {money(item.penalty_amount)}
          </Badge>
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Condition at Move-in</label>
          <Badge className={`text-xs px-2 py-1 block w-fit ${conditionColor(item.condition_at_movein)}`}>
            {item.condition_at_movein}
          </Badge>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Condition at Move-out *</label>
          <Select
            value={item.condition_at_moveout}
            onValueChange={v => updateInspectionItem(idx, 'condition_at_moveout', v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map(c => (
                <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="text-xs font-medium text-gray-600">Custom Penalty Amount (₹)</label>
          <Input
            type="number"
            min={0}
            className="h-8 text-xs"
            value={item.penalty_amount}
            onChange={e =>
              updateInspectionItem(idx, 'penalty_amount', parseFloat(e.target.value) || 0)
            }
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="text-xs font-medium text-gray-600">Notes / Damage Description</label>
        <Input
          className="h-8 text-xs w-full"
          placeholder="Describe any damage or issues..."
          value={item.notes || ''}
          onChange={e => updateInspectionItem(idx, 'notes', e.target.value)}
        />
      </div>

    </div>
  ))}
</div>

    <div className="mt-4">
      <SH icon={<StickyNote className="h-3 w-3" />} title="Status" color="text-purple-600" />
      <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
        <SelectTrigger className="h-8 text-xs">
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
                className="flex-1 h-8 text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm flex items-center justify-center gap-1.5">
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
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
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
      <MessageCircle className="h-3.5 w-3.5" />
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
        <MessageCircle className="h-3.5 w-3.5 text-white" />
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
    onClick={handlePrint}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-medium transition-colors"
  >
    <Printer className="h-3.5 w-3.5" />
    <span>Print Page</span>
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

      {/* ══ OTP Modal ════════════════════════════════════════════════════════ */}
      {showOTPModal && viewItem && (
        <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
          <DialogContent className="max-w-md">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-t-lg -mt-4 -mx-4 mb-4">
              <h2 className="text-base font-semibold">Verify OTP</h2>
              <p className="text-xs text-purple-100">Confirm inspection with tenant</p>
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
                  Verify & Approve
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