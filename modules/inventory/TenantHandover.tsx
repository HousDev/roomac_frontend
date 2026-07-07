// TenantHandover.tsx - COMPLETE FIXED VERSION
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  FileText, Plus, Trash2, Loader2, X, Download,
  Building, IndianRupee, StickyNote, RefreshCw, Filter,
  AlertTriangle, ChevronDown, ChevronUp, User, Calendar,
  ShieldCheck, Eye, MessageCircle, FileDown, Printer, Check,
  ChevronRight, ChevronLeft, Boxes, Share2, CreditCard, Square, CheckSquare,
  Edit2,
  Edit,
  Mail,
  Share,
} from 'lucide-react';
// import { getAvailableAssets } from '@/lib/assetsApi'; // adjust path
import { getInventoryMappingsGrouped } from '@/lib/categorySubcategoryMapApi';

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
import { sendTenantOTP, verifyTenantOTP } from '@/lib/tenantAuthApi';
import { getAvailableAssets } from '@/lib/assestsApi';
import { request } from '@/lib/api';
import { FaWhatsapp } from 'react-icons/fa';
import { getSettings, getSettingValue } from "@/lib/settingsApi";


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
  const [showPrintPreview, setShowPrintPreview] = useState(false);
const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
const [tenantSearchTerm, setTenantSearchTerm] = useState('');
const [propertySearchTerm, setPropertySearchTerm] = useState('');
const [purchasedItemSearchTerm, setPurchasedItemSearchTerm] = useState('');
const [itemCategorySearchTerm, setItemCategorySearchTerm] = useState('');
const [itemNameSearchTerm, setItemNameSearchTerm] = useState('');

const tenantSearchRef = useRef<HTMLInputElement>(null);
const propertySearchRef = useRef<HTMLInputElement>(null);
const itemCategorySearchRef = useRef<HTMLInputElement>(null);
const itemNameSearchRef = useRef<HTMLInputElement>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const { can } = useAuth(); // ← ADD THIS
  // ── Pagination state (client-side) ──
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, "All"] as const;
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState<number | "All">(25);
const [totalItems, setTotalItems] = useState(0);
const [totalPages, setTotalPages] = useState(1);
const [siteSettings, setSiteSettings] = useState({
  siteName: "ROOMAC",
  logo: "",
  phone: "",
  email: "",
  address: "",
});

// ── Advanced date filters ──
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');
const [moveInFrom, setMoveInFrom] = useState('');
const [moveInTo, setMoveInTo] = useState('');

  const [generatedOtp, setGeneratedOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [currentOTP, setCurrentOTP] = useState('');
  const [isResendOtpSent, setIsResendOtpSent] = useState(true);
  const [otpData, setOtpData] = useState({
    email: localStorage.getItem("auth_email") || "",
    otp: "",
  });

  const [stats, setStats] = useState({
    total: 0, active: 0, confirmed: 0, pending: 0, completed: 0,
  });

  const [statusFilter, setStatusFilter] = useState<StatusType>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');

  const [colSearch, setColSearch] = useState({
    tenant_name: '', property_name: '', room_number: '', status: '', handover_date: '',
  });
const [availableAssets, setAvailableAssets] = useState<Record<string, string[]>>({});
const [inventoryMappings, setInventoryMappings] = useState <
  { category_id: string; category_name: string; subcategories: { subcategory_id: string; subcategory_name: string }[] }[]
>([]);
const [itemStockMap, setItemStockMap] = useState<Record<string, number>>({});


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

  const loadInventoryMappings = useCallback(async () => {
  try {
    const res = await getInventoryMappingsGrouped();
    setInventoryMappings(res?.data || []);
  } catch (err) {
    console.error('Could not load inventory mappings:', err);
  }
}, []);


const getSubcategoriesForCategory = (categoryName: string) => {
  if (!categoryName) return [];
  const mapping = inventoryMappings.find(
    m => m.category_name.trim().toLowerCase() === categoryName.trim().toLowerCase()
  );
  return mapping?.subcategories || [];
};


const fetchItemStock = async (itemName: string): Promise<number> => {
  if (!itemName || !formData.property_id) return 0;
  try {
    const res = await getAvailableAssets(itemName, formData.property_id);
    const count = res.data?.length || 0;
    setItemStockMap(prev => ({ ...prev, [itemName]: count }));
    return count;
  } catch (e) {
    console.error('Failed to fetch stock for', itemName, e);
    return 0;
  }
};
  const onVerifyOTP = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
  
        try {
          const result: any = await verifyTenantOTP(otpData.email, otpData.otp);
  
          if (result.success) {
            setShowOTPMadal(false);
          setGeneratedOtp(result.otp || "123456");
          toast.success(`OTP sent successfully!`); 
          } else {
            toast.error(result.message || "OTP verification failed");
          }
        } catch (error: any) {
          toast.error(error.message || "OTP verification failed");
        }
      },
      [otpData]
    ); // ✅ ADDED login dependency
  
    const handleSendOTP = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("otp : ", otpData)
        if (!otpData.email) {
          toast.error("Please enter your email");
          return;
        }
  
        try {
          const result = await sendTenantOTP(otpData.email);
          console.log("otp response from reset", result)
          if (result.success) {
            setGeneratedOtp(result.otp || "123456");
            toast.success(`OTP sent successfully!`); // Keep test OTP display
          } else {
            toast.error(result.error || result.message || "Failed to send OTP");
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to send OTP");
        }
      },
      [otpData.email],
    );
  
    
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
    const result = await sendTenantOTP(viewItem.tenant_email || viewItem.tenant_phone);
    
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
    const res = await listTenants({ pageSize: 1000 }); 
    // omit is_active and vacate_status entirely, or pass vacate_status: 'all'
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
  loadInventoryMappings();
}, []);

  useEffect(() => { loadAll(); }, [loadAll]);


  useEffect(() => {
  const fetchSettings = async () => {
    try {
      const settings = await getSettings();
      setSiteSettings({
        siteName: getSettingValue(settings, "site_name", "ROOMAC"),
        logo: getSettingValue(settings, "logo_header", ""),
        phone: getSettingValue(settings, "contact_phone", ""),
        email: getSettingValue(settings, "contact_email", ""),
        address: getSettingValue(settings, "contact_address", ""),
      });
    } catch {
      // fallback defaults already set
    }
  };
  fetchSettings();
}, []);

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
// TenantHandover.tsx - Replace the handleTenantSelect function

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

    // ✅ FIX: Extract values from the API response
    // The data already contains tenant_rent, rent_per_bed, security_deposit, etc.
    const monthlyRent = safeNum(d.tenant_rent) || safeNum(d.rent_per_bed) || 0;
    
    // Get security deposit - try multiple possible sources
    let securityDeposit = 0;
    
    // Option 1: From bed assignment if available
    if (d.bed_assignment_id) {
      try {
        const bedResponse = await fetch(`/api/rooms/bed-assignments/${d.bed_assignment_id}`);
        const bedResult = await bedResponse.json();
        if (bedResult.success && bedResult.data) {
          securityDeposit = safeNum(bedResult.data.security_deposit);
        }
      } catch (err) {
        console.error("Could not fetch bed assignment:", err);
      }
    }
    
    // Option 2: From property security_deposit
    if (securityDeposit === 0 && d.property_id) {
      securityDeposit = await fetchPropertyDeposit(String(d.property_id));
    }
    
    // Option 3: From tenant's own security_deposit field
    if (securityDeposit === 0) {
      securityDeposit = safeNum(d.security_deposit);
    }


    setFormData(p => ({
      ...p,
      property_id: String(d.property_id || ''),
      property_name: d.property_name || '',
      room_number: d.room_number || '',
      bed_number: String(d.bed_number || ''),
      move_in_date: toInputDate(d.check_in_date) || toInputDate(d.move_in_date) || p.move_in_date,
      security_deposit: securityDeposit,
      rent_amount: monthlyRent,
    }));
  } catch (err) {
    console.error('Could not fetch tenant details:', err);
    toast.error('Failed to fetch tenant details');
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

const filteredItems = useMemo(() => {
  return handovers.filter(h => {
    const cs = colSearch;
    const n = !cs.tenant_name || h.tenant_name?.toLowerCase().includes(cs.tenant_name.toLowerCase());
    const p = !cs.property_name || h.property_name?.toLowerCase().includes(cs.property_name.toLowerCase());
    const r = !cs.room_number || h.room_number?.toLowerCase().includes(cs.room_number.toLowerCase());
    const s = !cs.status || h.status?.toLowerCase().includes(cs.status.toLowerCase());
    const d = !cs.handover_date || fmt(h.handover_date).includes(cs.handover_date);

    // Status & property filters (dropdowns)
    const statusOk = statusFilter === 'all' || h.status === statusFilter;
    const propertyOk = propertyFilter === 'all' || h.property_id === propertyFilter;

    // Date ranges (handover date)
    const handoverDateOk = (dateFrom && dateTo)
      ? (h.handover_date >= dateFrom && h.handover_date <= dateTo)
      : true;
    const moveInDateOk = (moveInFrom && moveInTo)
      ? (h.move_in_date >= moveInFrom && h.move_in_date <= moveInTo)
      : true;

    return n && p && r && s && d && statusOk && propertyOk && handoverDateOk && moveInDateOk;
  });
}, [handovers, colSearch, statusFilter, propertyFilter, dateFrom, dateTo, moveInFrom, moveInTo]);


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

  // ── FINAL STOCK VALIDATION before submit ──
  for (const item of handoverItems) {
    if (!item.item_name) continue;
    const stock = itemStockMap[item.item_name] ?? await fetchItemStock(item.item_name);
   if ((item.quantity || 1) > stock) {
  toast.error(`"${item.item_name}" only ${stock} unit(s) available in this property. Please reduce quantity.`);
  return;
}
if (stock === 0) {
  toast.error(`"${item.item_name}" is not available in this property.`);
  return;
}
  }

   setSubmitting(true);
try {
  // Auto-assign available asset IDs for each item
 // Auto-assign available asset IDs per item — qty-aware + property-specific
const itemsWithAssets: HandoverItem[] = [];
const stockWarnings: string[] = [];

for (const item of handoverItems) {
  const qty = item.quantity || 1;
  const propertyId = formData.property_id;

  if (!item.item_name) {
    itemsWithAssets.push(item);
    continue;
  }

  try {
    const res = await getAvailableAssets(item.item_name, propertyId, qty);
    const available = res.data || [];

    if (available.length === 0) {
      stockWarnings.push(`❌ ${item.item_name}: No stock available in this property`);
      itemsWithAssets.push(item);
    } else if (available.length < qty) {
      stockWarnings.push(`⚠️ ${item.item_name}: Only ${available.length} of ${qty} available`);
      // assign what we have — expand item rows for each asset
      available.forEach((a: any) => {
        itemsWithAssets.push({ ...item, quantity: 1, asset_id: a.asset_id });
      });
      // remaining qty without asset
      for (let i = available.length; i < qty; i++) {
        itemsWithAssets.push({ ...item, quantity: 1, asset_id: undefined });
      }
    } else {
      // enough stock — assign one row per asset
      available.forEach((a: any) => {
        itemsWithAssets.push({ ...item, quantity: 1, asset_id: a.asset_id });
      });
    }
  } catch {
    itemsWithAssets.push(item);
  }
}

// Show stock warnings before proceeding
if (stockWarnings.length > 0) {
  stockWarnings.forEach(w => toast.warning(w));
}
const payload = {
    ...formData,
    security_deposit: safeNum(formData.security_deposit),
    rent_amount: safeNum(formData.rent_amount),
    handover_items: itemsWithAssets,
  };

  // Old vs new asset IDs — needed only when editing, so removed items
  // release their asset back to "available" and newly added items get
  // freshly assigned.
  const oldAssetIds = new Set(
    (editingItem?.handover_items || [])
      .map((i: any) => i.asset_id)
      .filter((a: any) => a && String(a).trim() !== '')
  );
  const newAssetIds = new Set(
    itemsWithAssets
      .map((i) => i.asset_id)
      .filter((a) => a && String(a).trim() !== '')
  );

  if (editingItem) {
    await updateHandover(editingItem.id, payload);

    // Release assets that were removed from the handover during edit
    for (const assetId of oldAssetIds) {
      if (!newAssetIds.has(assetId)) {
        try {
          await request('/api/inventory/assign-asset', {
            method: 'POST',
            body: JSON.stringify({ asset_id: assetId, status: 'available', tenant_id: null })
          });
        } catch (e) {
          console.error('Asset release error:', e);
        }
      }
    }

    // Assign any newly added items (skip ones that were already assigned before)
    for (const item of itemsWithAssets) {
      if (item.asset_id && item.asset_id.trim() !== '' && !oldAssetIds.has(item.asset_id)) {
        try {
          await request('/api/inventory/assign-asset', {
            method: 'POST',
            body: JSON.stringify({
              asset_id: item.asset_id,
              status: 'assigned',
              tenant_id: formData.tenant_id || null
            })
          });
        } catch (e) {
          console.error('Asset assign error:', e);
        }
      }
    }

    toast.success('Handover updated successfully');
  } else {
    await createHandover(payload);
    // Mark assigned asset IDs as 'assigned' in inventory
    for (const item of itemsWithAssets) {
      if (item.asset_id && item.asset_id.trim() !== '') {
        try {
          await request('/api/inventory/assign-asset', {
            method: 'POST',
            body: JSON.stringify({ 
              asset_id: item.asset_id, 
              status: 'assigned',
              tenant_id: formData.tenant_id || null
            })
          });
        } catch (e) {
          console.error('Asset assign error:', e);
        }
      }
    }
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
    // ✅ Delete se PEHLE, us handover ke saare assigned assets nikaal lo
    const handoverToDelete = handovers.find(h => h.id === id);
    const assetIds = (handoverToDelete?.handover_items || [])
      .map(i => i.asset_id)
      .filter(a => a && String(a).trim() !== '');

    await deleteHandover(id);

    // ✅ Har asset ko wapas 'available' kar do
    for (const assetId of assetIds) {
      try {
        await request('/api/inventory/assign-asset', {
          method: 'POST',
          body: JSON.stringify({ asset_id: assetId, status: 'available', tenant_id: null })
        });
      } catch (e) {
        console.error('Asset release error:', e);
      }
    }

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
    // ✅ Delete se pehle sab selected handovers ke asset_ids collect karo
    const allAssetIds: string[] = [];
    for (const id of selectedItems) {
      const h = handovers.find(x => x.id === id);
      (h?.handover_items || []).forEach(item => {
        if (item.asset_id && String(item.asset_id).trim() !== '') {
          allAssetIds.push(item.asset_id);
        }
      });
    }

    for (const id of selectedItems) await deleteHandover(id);

    // ✅ Sab assets wapas available
    for (const assetId of allAssetIds) {
      try {
        await request('/api/inventory/assign-asset', {
          method: 'POST',
          body: JSON.stringify({ asset_id: assetId, status: 'available', tenant_id: null })
        });
      } catch (e) {
        console.error('Asset release error:', e);
      }
    }

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
const handleDownloadPDF = async () => {
  if (!viewItem) return;

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    const secDep = safeNum(viewItem.security_deposit);
    const rentAmt = safeNum(viewItem.rent_amount);
    const totalAmt = secDep + rentAmt;

    const receiptNo = `HO-${String(viewItem.id).padStart(4, '0')}-${(() => {
      const d = viewItem.handover_date ? new Date(viewItem.handover_date) : new Date();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${mm}${d.getFullYear()}`;
    })()}`;

    const fmtDate = (d?: string) => {
      if (!d) return '—';
      try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return '—';
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        return `${dd}/${mm}/${date.getFullYear()}`;
      } catch { return '—'; }
    };

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
        const maxW = 30, maxH = 30;
        const ratio = Math.min(maxW / imgProps.width, maxH / imgProps.height);
        const imgW = imgProps.width * ratio;
        const imgH = imgProps.height * ratio;
        doc.addImage(siteSettings.logo, imgProps.fileType || "PNG", margin + (maxW - imgW) / 2, yBase - imgH / 2, imgW, imgH);
      } catch (e) {}
    }

    // Site name — center
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(siteSettings?.siteName || "ROOMAC", pageWidth / 2, yBase, { align: "center" });

    // Document No. — right
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("Document No.", pageWidth - margin, yBase - 3, { align: "right" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(receiptNo, pageWidth - margin, yBase + 2, { align: "right" });

    // Subtitle
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Handover Document", pageWidth / 2, yBase + 6, { align: "center" });

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
    doc.text("HANDOVER DATE", margin + 3, yPos + 4);
    doc.text("PROPERTY", pageWidth / 2 - 20, yPos + 4);
    doc.text("STATUS", pageWidth - margin - 30, yPos + 4);

    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "normal");
    doc.text(fmtDate(viewItem.handover_date), margin + 3, yPos + 8.5);
    doc.text(viewItem.property_name || "—", pageWidth / 2 - 20, yPos + 8.5);

    const status = viewItem.status || "Active";
    const statusCol: [number, number, number] =
      status === "Completed" || status === "Confirmed" ? [22, 101, 52] :
      status === "Pending" ? [146, 64, 14] :
      status === "Cancelled" ? [153, 27, 27] : [30, 58, 138];
    doc.setTextColor(...statusCol);
    doc.setFont("helvetica", "bold");
    doc.text(status.toUpperCase(), pageWidth - margin - 30, yPos + 8.5);

    yPos += metaHeight + 4;

    // ── Details grid (6 fields, 3 cols) ──
    const details = [
      ["Tenant", viewItem.tenant_name],
      ["Phone", viewItem.tenant_phone],
      ["Email", viewItem.tenant_email || "—"],
      ["Room/Bed", `${viewItem.room_number}${viewItem.bed_number ? " / " + viewItem.bed_number : ""}`],
      ["Move-In Date", fmtDate(viewItem.move_in_date)],
      ["Inspector", viewItem.inspector_name || "—"],
    ];
    const colWidth = (pageWidth - margin * 2) / 3;
    details.forEach(([label, value], idx) => {
      const x = margin + (idx % 3) * colWidth;
      const row = Math.floor(idx / 3);
      const y = yPos + row * 10;
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "bold");
      doc.text(label.toUpperCase(), x, y);
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), x, y + 5);
    });
    yPos += details.length > 3 ? 24 : 14;

    // ── Items Table ──
    if (viewItem.handover_items && viewItem.handover_items.length > 0) {
      const tableData = viewItem.handover_items.map((item, idx) => [
        String(idx + 1),
        item.item_name,
        item.category,
        String(item.quantity),
        item.condition_at_movein,
        item.notes || "—",
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["#", "Item Name", "Category", "Qty", "Condition", "Notes"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2, textColor: [51, 65, 85] },
        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: "bold", fontSize: 7.5 },
        columnStyles: {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: "auto" },
          2: { cellWidth: 28 },
          3: { cellWidth: 14, halign: "center" },
          4: { cellWidth: 24 },
          5: { cellWidth: "auto" },
        },
        margin: { left: margin, right: margin },
      });

      yPos = (doc as any).lastAutoTable.finalY + 6;
    }

    // ── Totals ──
    // const totalsX = pageWidth - margin - 62;
    // doc.setFontSize(8.5);
    // doc.setTextColor(71, 85, 105);
    // doc.setFont("helvetica", "normal");
    // doc.text("Security Deposit", totalsX, yPos);
    // doc.setFont("helvetica", "bold");
    // doc.setTextColor(30, 41, 59);
    // doc.text(pdfMoney(secDep), pageWidth - margin, yPos, { align: "right" });
    // yPos += 5;

    // doc.setFont("helvetica", "normal");
    // doc.setTextColor(71, 85, 105);
    // doc.text("Rent Amount", totalsX, yPos);
    // doc.setFont("helvetica", "bold");
    // doc.setTextColor(30, 41, 59);
    // doc.text(pdfMoney(rentAmt), pageWidth - margin, yPos, { align: "right" });
    // yPos += 5;

    // doc.setDrawColor(203, 213, 225);
    // doc.line(totalsX, yPos - 2, pageWidth - margin, yPos - 2);
    // doc.setFont("helvetica", "bold");
    // doc.setTextColor(59, 91, 219);
    // doc.setFontSize(9.5);
    // doc.text("Total Value", totalsX, yPos + 3);
    // doc.text(pdfMoney(totalAmt), pageWidth - margin, yPos + 3, { align: "right" });
    // yPos += 12;

    // ── Watermark (light, bottom-left → top-right) ──

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
    yPos += 4;
    const sigWidth = (pageWidth - margin * 2 - 20) / 3;
    const signatures = [
      { name: viewItem.tenant_name, label: "Tenant Signature" },
      { name: viewItem.inspector_name || "—", label: "Inspector/Manager" },
      { name: "Witness", label: "Witness Signature" },
    ];
    signatures.forEach((sig, idx) => {
      const x = margin + idx * (sigWidth + 10);
      doc.setDrawColor(148, 163, 184);
      doc.line(x, yPos + 12, x + sigWidth, yPos + 12);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(sig.name, x + sigWidth / 2, yPos + 17, { align: "center" });
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(sig.label, x + sigWidth / 2, yPos + 22, { align: "center" });
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
    doc.text(
      `Generated on ${new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
      pageWidth / 2, yPos + 8, { align: "center" }
    );

    const fileName = `Handover_${viewItem.tenant_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
    toast.success("PDF downloaded successfully");
  } catch (err: any) {
    console.error("PDF generation error:", err);
    toast.error("Failed to generate PDF: " + err.message);
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
  if (!viewItem) return;

  const secDep = safeNum(viewItem.security_deposit);
  const rentAmt = safeNum(viewItem.rent_amount);
  const totalAmt = secDep + rentAmt;

  const receiptNo = `HO-${String(viewItem.id).padStart(4, '0')}-${(() => {
    const d = viewItem.handover_date ? new Date(viewItem.handover_date) : new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${mm}${d.getFullYear()}`;
  })()}`;

  const itemsRows = (viewItem.handover_items || [])
    .map(
      (i, idx) => `
      <tr>
        <td class="c">${idx + 1}</td>
        <td class="b">${i.item_name}</td>
        <td>${i.category}</td>
        <td class="r">${i.quantity}</td>
        <td class="r">${i.condition_at_movein}</td>
        <td>${i.notes || '—'}</td>
      </tr>`
    )
    .join('');

  const statusBg = viewItem.status === 'Completed' || viewItem.status === 'Confirmed' ? '#DCFCE7' :
                    viewItem.status === 'Pending' ? '#FEF3C7' : '#FEF2F2';
  const statusColor = viewItem.status === 'Completed' || viewItem.status === 'Confirmed' ? '#166534' :
                    viewItem.status === 'Pending' ? '#92400E' : '#991B1B';

  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>Handover - ${viewItem.tenant_name}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, Helvetica, sans-serif; }
          body { background: #F4F6FB; padding: 24px; color: #1e293b; }
          .sheet {
            max-width: 720px;
            margin: 0 auto;
            background: #fff;
            border-radius: 14px;
            border: 1px solid #E2E8F4;
            box-shadow: 0 4px 24px rgba(26,43,109,0.08);
            padding: 18px 22px;
            position: relative;
            overflow: hidden;
          }
          /* ── SINGLE CENTERED WATERMARK ── */
          .watermark-single {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            user-select: none;
            overflow: hidden;
            z-index: 0;
          }
          .watermark-single span {
            font-weight: 900;
            line-height: 1;
            white-space: nowrap;
            font-size: min(10vw, 56px);
            letter-spacing: 0.02em;
            color: rgba(100, 116, 139, 0.09);
            transform: rotate(-30deg);
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .head {
            display: flex;
            align-items: center;
            border-bottom: 1px solid #E2E8F4;
            padding-bottom: 12px;
            margin-bottom: 12px;
            position: relative;
            z-index: 1;
          }
          .head .logo { width: 112px; flex-shrink: 0; }
          .head .logo img { height: 44px; max-width: 110px; object-fit: contain; }
          .head .center { flex: 1; text-align: center; }
          .head .center .brand { font-size: 17px; font-weight: 800; color: #1e293b; }
          .head .center .sub { font-size: 12.5px; font-weight: 700; color: #3B5BDB; margin-top: 1px; }
          .head .right { width: 112px; text-align: right; font-size: 9.5px; color: #94a3b8; }
          .head .right .label { display: block; font-weight: 600; color: #64748b; }
          .head .right .val { font-size: 10px; color: #94a3b8; }

          .meta-bar {
            display: flex;
            justify-content: space-between;
            background: #F8FAFF;
            border: 1px solid #E2E8F4;
            border-radius: 6px;
            padding: 7px 12px;
            margin-bottom: 12px;
            font-size: 10px;
            color: #94a3b8;
            position: relative;
            z-index: 1;
          }
          .meta-bar div span { display: block; font-weight: 700; color: #1e293b; font-size: 12px; margin-top: 2px; }
          .status-chip {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 800;
            background: ${statusBg};
            color: ${statusColor};
          }

          .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 16px; margin-bottom: 14px; position: relative; z-index: 1; }
          .field .label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.4px; color: #94a3b8; font-weight: 700; }
          .field .value { font-size: 12px; font-weight: 600; margin-top: 2px; color: #1e293b; }

          .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 5px; position: relative; z-index: 1; }

          table { width: 100%; border-collapse: collapse; position: relative; z-index: 1; margin-bottom: 14px; }
          thead th {
            background: #F1F5F9;
            color: #475569;
            font-size: 10px;
            text-align: left;
            font-weight: 700;
            padding: 6px 8px;
            border: 1px solid #E2E8F4;
          }
          tbody td {
            padding: 6px 8px;
            font-size: 11.5px;
            border: 1px solid #E2E8F4;
            color: #374151;
          }
          td.b { font-weight: 600; color: #1e293b; }
          td.c, th.c { text-align: center; }
          td.r, th.r { text-align: right; }

          .totals { margin-left: auto; width: 260px; position: relative; z-index: 1; }
          .totals .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 15px;
            font-weight: 800;
            color: #1e293b;
            border-top: 2px solid #1e293b;
          }

          .notes-box {
            background: #FFFBEB;
            border: 1px solid #FDE68A;
            border-radius: 8px;
            padding: 8px 10px;
            font-size: 11px;
            color: #92400E;
            margin: 10px 0;
            position: relative;
            z-index: 1;
          }

          .signatures {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-top: 22px;
            position: relative;
            z-index: 1;
          }
          .sig-block { text-align: center; }
          .sig-line { border-bottom: 1px solid #94A3B8; margin-bottom: 6px; padding-bottom: 26px; }
          .sig-name { font-size: 11px; font-weight: 700; color: #1e293b; }
          .sig-label { font-size: 8.5px; color: #94a3b8; margin-top: 1px; }
          .sig-date { font-size: 8px; color: #b0b7c3; margin-top: 1px; }

          .foot {
            text-align: center;
            font-size: 9.5px;
            color: #94a3b8;
            border-top: 1px solid #E2E8F4;
            padding-top: 10px;
            margin-top: 14px;
            position: relative;
            z-index: 1;
          }
          .foot .thanks { font-size: 10.5px; font-weight: 700; color: #3B5BDB; margin-bottom: 2px; }

          @media print {
            body { background: #fff; padding: 0; }
            .sheet { box-shadow: none; border: none; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <!-- SINGLE CENTERED WATERMARK -->
          <div class="watermark-single">
            <span>${siteSettings.siteName?.split(' ')[0] || 'ROOMAC'}</span>
          </div>
          <div class="head">
            <div class="logo">${siteSettings.logo ? `<img src="${siteSettings.logo}" />` : ''}</div>
            <div class="center">
              <div class="brand">${siteSettings.siteName}</div>
              <div class="sub">Handover Document</div>
            </div>
            <div class="right">
              <span class="label">Document No.</span>
              <span class="val">${receiptNo}</span>
            </div>
          </div>

          <div class="meta-bar">
            <div>HANDOVER DATE<span>${fmt(viewItem.handover_date)}</span></div>
            <div>PROPERTY<span>${viewItem.property_name || '—'}</span></div>
            <div style="text-align:right;">STATUS<span><span class="status-chip">${viewItem.status?.toUpperCase()}</span></span></div>
          </div>

          <div class="grid3">
            <div class="field"><div class="label">Tenant</div><div class="value">${viewItem.tenant_name}</div></div>
            <div class="field"><div class="label">Phone</div><div class="value">${viewItem.tenant_phone}</div></div>
            <div class="field"><div class="label">Email</div><div class="value">${viewItem.tenant_email || '—'}</div></div>
            <div class="field"><div class="label">Room/Bed</div><div class="value">${viewItem.room_number}${viewItem.bed_number ? ' / ' + viewItem.bed_number : ''}</div></div>
            <div class="field"><div class="label">Move-In Date</div><div class="value">${fmt(viewItem.move_in_date)}</div></div>
            <div class="field"><div class="label">Inspector</div><div class="value">${viewItem.inspector_name || '—'}</div></div>
          </div>

          ${itemsRows ? `
          <div class="section-title">Item Checklist</div>
          <table>
            <thead><tr><th class="c">#</th><th>Item</th><th>Category</th><th class="r">Qty</th><th class="r">Condition</th><th>Notes</th></tr></thead>
            <tbody>${itemsRows}</tbody>
          </table>` : ''}

          <div class="totals">
            <div class="row">
              <span>Security Deposit</span>
              <span>${pdfMoney(secDep)}</span>
            </div>
            <div class="row" style="border-top-color:#E2E8F4;">
              <span>Rent Amount</span>
              <span>${pdfMoney(rentAmt)}</span>
            </div>
            <div class="row">
              <span>Total Value</span>
              <span>${pdfMoney(totalAmt)}</span>
            </div>
          </div>

          ${viewItem.notes ? `<div class="notes-box"><strong>Notes:</strong> ${viewItem.notes}</div>` : ''}

          <div class="signatures">
            <div class="sig-block">
              <div class="sig-line"></div>
              <div class="sig-name">${viewItem.tenant_name}</div>
              <div class="sig-label">Tenant Signature</div>
              <div class="sig-date">Date: ${fmt(viewItem.handover_date)}</div>
            </div>
            <div class="sig-block">
              <div class="sig-line"></div>
              <div class="sig-name">${viewItem.inspector_name || '—'}</div>
              <div class="sig-label">Inspector/Manager</div>
              <div class="sig-date">Date: ${fmt(viewItem.handover_date)}</div>
            </div>
            <div class="sig-block">
              <div class="sig-line"></div>
              <div class="sig-name">Witness</div>
              <div class="sig-label">Witness Signature</div>
              <div class="sig-date">Date: __________</div>
            </div>
          </div>

          <div class="foot">
            ${siteSettings.phone || siteSettings.email ? `<p>${siteSettings.phone ? `Tel: ${siteSettings.phone}` : ''}${siteSettings.phone && siteSettings.email ? ' | ' : ''}${siteSettings.email ? `Email: ${siteSettings.email}` : ''}</p>` : ''}
            <p class="thanks" style="margin-top:4px;">Powered by ${siteSettings.siteName}</p>
            <p style="margin-top:2px;">Generated on ${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
};
  // ── OTP ───────────────────────────────────────────────────────────────────
  const handleInitiateOTP = async () => {
  if (!viewItem) return;
  
  try {
    // Send OTP to tenant's email/phone
    const result = await sendTenantOTP(viewItem.tenant_email || viewItem.tenant_phone);
    
    if (result.success) {
      setCurrentOTP(result.otp || "123456"); // Store for verification (in production, verify on backend)
      setOtpCode('');
      setShowOTPModal(true);
      setIsResendOtpSent(false);
      setTimeLeft(60); // 60 seconds timer
      toast.success(`OTP sent to ${viewItem.tenant_email || viewItem.tenant_phone}`);
    } else {
      toast.error(result.message || "Failed to send OTP");
    }
  } catch (error: any) {
    console.error('OTP send error:', error);
    toast.error(error.message || "Failed to send OTP");
  }
};

  // Fix handleVerifyOTP - This is called when clicking "Verify & Confirm"
const handleVerifyOTP = async () => {
  if (!viewItem) {
    toast.error('No handover record found');
    return;
  }
  
  if (!otpCode || otpCode.length !== 6) {
    toast.error('Please enter a valid 6-digit OTP');
    return;
  }
  
  try {
    console.log(viewItem)
    // Verify OTP with backend
    const result = await verifyTenantOTP(
      viewItem.tenant_email || viewItem.tenant_phone, 
      otpCode
    );
    console.log(result)
    
    if (result.success) {
      // Update handover status to 'Confirmed'
      const updatedHandover = { 
        ...viewItem, 
        status: 'Confirmed' 
      };
      
      console.log("updated handover",updatedHandover)
      await updateHandover(viewItem.id, updatedHandover);
      await loadAll(); // Refresh the list
      
      toast.success('Handover confirmed successfully!');
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

  // ── Handover Items helpers ────────────────────────────────────────────────
  const addHandoverItem = () => setHandoverItems(p => [...p, emptyHandoverItem()]);
  const removeHandoverItem = (i: number) => {
    if (handoverItems.length === 1) { toast.error('At least one item required'); return; }
    setHandoverItems(p => p.filter((_, idx) => idx !== i));
  };
  const updateHandoverItemField = (i: number, field: keyof HandoverItem, value: any) => {
    setHandoverItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

const hasFilters = statusFilter !== 'all' || propertyFilter !== 'all' || !!dateFrom || !!dateTo || !!moveInFrom || !!moveInTo;  const hasColSearch = Object.values(colSearch).some(v => v !== '');
  const activeFilterCount = [
  statusFilter !== 'all',
  propertyFilter !== 'all',
  !!dateFrom,
  !!dateTo,
  !!moveInFrom,
  !!moveInTo,
].filter(Boolean).length;

const clearFilters = () => {
  setStatusFilter('all');
  setPropertyFilter('all');
  setDateFrom('');
  setDateTo('');
  setMoveInFrom('');
  setMoveInTo('');
};
  const clearColSearch = () => setColSearch({ tenant_name: '', property_name: '', room_number: '', status: '', handover_date: '' });

  // FIX: safeNum for totalValue to prevent NaN display
  const totalValue = useMemo(() => {
    return safeNum(formData.security_deposit) + safeNum(formData.rent_amount);
  }, [formData.security_deposit, formData.rent_amount]);

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-gray-50 ">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
    <div className="mb-2">
  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">

    {/* LEFT - Stats */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-1">
      <StatCard
        title="Total Handovers"
        value={stats.total}
        icon={FileText}
        color="bg-blue-600"
        bg="bg-gradient-to-br from-blue-50 to-blue-100"
      />
      <StatCard
        title="Active"
        value={stats.active}
        icon={Boxes}
        color="bg-green-600"
        bg="bg-gradient-to-br from-green-50 to-green-100"
      />
      <StatCard
        title="Confirmed"
        value={stats.confirmed}
        icon={ShieldCheck}
        color="bg-emerald-600"
        bg="bg-gradient-to-br from-emerald-50 to-emerald-100"
      />
      <StatCard
        title="Pending"
        value={stats.pending}
        icon={AlertTriangle}
        color="bg-amber-600"
        bg="bg-gradient-to-br from-amber-50 to-amber-100"
      />
    </div>

    {/* RIGHT - Action Buttons */}
    <div className="flex items-center justify-end gap-2 shrink-0 lg:mt-8">
      

      <button
        onClick={() => setSidebarOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white text-[11px] font-medium transition-colors
        ${
          sidebarOpen || activeFilterCount > 0
            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
        }`}
      >
        <Filter className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="hidden sm:inline">Filters</span>

        {activeFilterCount > 0 && (
          <span
            className={`h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center
            ${
              sidebarOpen || activeFilterCount > 0
                ? "bg-white text-blue-600"
                : "bg-blue-600 text-white"
            }`}
          >
            {activeFilterCount}
          </span>
        )}
      </button>

      {can("export_tenant_handover") && (
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white text-[11px] font-medium"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      )}

      {can("create_tenant_handover") && (
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Add Handover</span>
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
            {can('delete_tenant_handover') && (
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
<div className="flex flex-col" style={{ height: window.innerWidth < 640 ? '420px' : '520px' }}>        <div className="overflow-auto flex-1 min-h-0">
          <table
            className="border-collapse text-[11px] font-sans"
            style={{ tableLayout: "fixed", minWidth: "1200px", width: "100%" }}
          >
            <colgroup>
              <col style={{ width: "34px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "70px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
            </colgroup>

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
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Move-In</span>
                </th>
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Handover</span>
                </th>
                <th className="px-1.5 py-1.5 text-right border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Deposit</span>
                </th>
                <th className="px-1.5 py-1.5 text-right border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Total</span>
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
                <td className="p-1 border-r border-gray-200" />
                <td className="p-1 border-r border-gray-200">
                  <input
                    placeholder="Date…"
                    value={colSearch.handover_date || ''}
                    onChange={e => setColSearch(p => ({ ...p, handover_date: e.target.value }))}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200" />
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
                  <td colSpan={12} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Loading handovers…</p>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12">
                    <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">No handovers found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map(h => (
                  <tr key={h.id} className="hover:bg-gray-50 border-b border-slate-200">
                    <td className="px-1.5 py-1.5 text-center border-r border-slate-200">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(h.id)}
                        onChange={() => {
                          const newSet = new Set(selectedItems);
                          if (newSet.has(h.id)) newSet.delete(h.id);
                          else newSet.add(h.id);
                          setSelectedItems(newSet);
                          setSelectAll(newSet.size === filteredItems.length && filteredItems.length > 0);
                        }}
                        className="w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] font-medium text-slate-800 border-r border-slate-200">
                      {h.tenant_name}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-200">
                      {h.tenant_phone}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] text-slate-600 truncate max-w-[140px] border-r border-slate-200">
                      {h.property_name}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-200">
                      {h.room_number}{h.bed_number ? ` / ${h.bed_number}` : ''}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-200">
                      {fmt(h.move_in_date)}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-200">
                      {fmt(h.handover_date)}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] font-semibold text-slate-800 text-right border-r border-slate-200">
                      {money(h.security_deposit)}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] font-semibold text-slate-800 text-right border-r border-slate-200">
                      {money(safeNum(h.security_deposit) + safeNum(h.rent_amount))}
                    </td>
                    <td className="px-1.5 py-1.5 text-center border-r border-slate-200">
                      <Badge className="bg-blue-100 text-blue-700 text-[9px] px-1.5">
                        {h.handover_items?.length || 0}
                      </Badge>
                    </td>
                    <td className="px-1.5 py-1.5 border-r border-slate-200">
                      <Badge className={`text-[9px] px-1.5 ${statusColor(h.status)}`}>
                        {h.status}
                      </Badge>
                    </td>
                    <td className="px-1.5 py-1.5 text-right">
                      <div className="flex justify-end gap-0.5">
                        {can('view_tenant_handover') && (
                          <button
                            title="View"
                            className="w-6 h-6 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center transition-colors"
                            onClick={() => setViewItem(h)}
                          >
                            <Eye size={12} />
                          </button>
                        )}
                        {can('edit_tenant_handover') && (
                          <button
                            title="Edit"
                            className="w-6 h-6 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 flex items-center justify-center transition-colors"
                            onClick={() => openEdit(h)}
                          >
                            <Edit size={12} />
                          </button>
                        )}
                        {can('delete_tenant_handover') && (
                          <button
                            title="Delete"
                            className="w-6 h-6 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors"
                            onClick={() => handleDelete(h.id, h.tenant_name)}
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

  {/* ── FILTER SIDEBAR (dropdowns + advanced filters) ── */}
  {sidebarOpen && (
    <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />
  )}
  <aside
    className={`fixed top-0 right-0 h-full z-40 w-[85vw] sm:w-96 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
  >
    <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-white" />
        <span className="text-sm font-semibold text-white">Filters</span>
        {activeFilterCount > 0 && (
          <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">
            {activeFilterCount} active
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {activeFilterCount > 0 && (
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
        {/* Status */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-blue-500" /> Status
          </p>
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
            <SelectTrigger className="w-full h-8 text-xs border-gray-200">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property */}
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

        {/* Date Range – spans both columns */}
        <div className="col-span-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-rose-500" /> Handover Date Range
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-gray-500 block mb-0.5">From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-7 text-[10px]"
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-500 block mb-0.5">To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-7 text-[10px]"
              />
            </div>
          </div>
        </div>

        {/* Move-In Date Range – spans both columns */}
        <div className="col-span-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-emerald-500" /> Move-In Date Range
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-gray-500 block mb-0.5">From</label>
              <Input
                type="date"
                value={moveInFrom}
                onChange={(e) => setMoveInFrom(e.target.value)}
                className="h-7 text-[10px]"
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-500 block mb-0.5">To</label>
              <Input
                type="date"
                value={moveInTo}
                onChange={(e) => setMoveInTo(e.target.value)}
                className="h-7 text-[10px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
      <button
        onClick={clearFilters}
        disabled={!activeFilterCount}
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
    onOpenChange={(open) => {
      if (open) requestAnimationFrame(() => tenantSearchRef.current?.focus());
    }}
  >
    <SelectTrigger className={F}>
      <User className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
      <SelectValue placeholder="Select tenant (auto-fills details)" />
    </SelectTrigger>
    <SelectContent position="popper" sideOffset={4} className="max-h-[300px] w-[var(--radix-select-trigger-width)]">
      {/* Search input */}
      <div className="sticky top-0 bg-white p-2 border-b z-10">
        <div className="relative">
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            ref={tenantSearchRef}
            placeholder="Search tenant..."
            className="pl-7 h-7 text-xs"
            value={tenantSearchTerm}
            onChange={(e) => setTenantSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
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
              {t.name}
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
    onOpenChange={(open) => {
      if (open) requestAnimationFrame(() => propertySearchRef.current?.focus());
    }}
  >
    <SelectTrigger className={F}>
      <Building className="h-3 w-3 text-gray-400 mr-1.5" />
      <SelectValue placeholder="Select property">
        {formData.property_name || "Select property"}
      </SelectValue>
    </SelectTrigger>
    <SelectContent position="popper" sideOffset={4} className="max-h-[300px] w-[var(--radix-select-trigger-width)]">
      {/* Search input */}
      <div className="sticky top-0 bg-white p-2 border-b z-10">
        <div className="relative">
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            ref={propertySearchRef}
            placeholder="Search properties..."
            className="pl-7 h-7 text-xs"
            value={propertySearchTerm}
            onChange={(e) => setPropertySearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
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
        <div className="col-span-1 text-center">Sr.</div>
        <div className="col-span-2 break-words leading-tight">CATEGORY</div>
        <div className="col-span-3 break-words leading-tight flex items-center gap-1">
          <span>ITEM NAME *</span>
        </div>
        <div className="col-span-2 break-words leading-tight">CONDITION</div>
        <div className="col-span-1 text-center break-words">QTY</div>
        <div className="col-span-2 break-words leading-tight">NOTES</div>
        <div className="col-span-1 text-center"></div>
      </div>

      {/* Single Card Container for ALL items */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        {handoverItems.map((item, idx) => (
          <div key={idx}>
            {/* Main Row */}
            <div className="grid grid-cols-12 gap-2 items-center p-2">
              
              {/* Serial Number */}
              <div className="col-span-1 flex justify-center">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
              </div>

              {/* Category */}
              <div className="col-span-2">
            <Select
                  value={item.category}
                  onValueChange={v => {
                    updateHandoverItemField(idx, 'category', v);
                    updateHandoverItemField(idx, 'item_name', '');
                    setItemCategorySearchTerm('');
                  }}
                  onOpenChange={(open) => {
                    if (open) requestAnimationFrame(() => itemCategorySearchRef.current?.focus());
                  }}
                >
                  <SelectTrigger className="h-6 text-xs border-gray-200 bg-gray-50 w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} avoidCollisions className="max-h-[220px] w-[var(--radix-select-trigger-width)]">
                    <div className="sticky top-0 bg-white p-1.5 border-b z-10">
                      <div className="relative">
                        <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <Input
                          ref={itemCategorySearchRef}
                          placeholder="Search category..."
                          className="pl-6 h-6 text-[10px]"
                          value={itemCategorySearchTerm}
                          onChange={(e) => setItemCategorySearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="py-1">
                      {(inventoryMappings.length > 0 ? inventoryMappings : categories.map(c => ({ category_id: c.id, category_name: c.name })))
                        .filter(c => c.category_name.toLowerCase().includes(itemCategorySearchTerm.toLowerCase()))
                        .map(c => (
                          <SelectItem key={c.category_id} value={c.category_name} className="text-xs">
                            {c.category_name}
                          </SelectItem>
                        ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              {/* Item Name */}
              <div className="col-span-3">
                {(() => {
                  const subcats = getSubcategoriesForCategory(item.category);
                  if (subcats.length > 0) {
                  return (
                        <Select
                          value={item.item_name}
                          onValueChange={async (v) => {
                            updateHandoverItemField(idx, 'item_name', v);
                            setItemNameSearchTerm('');
                            const stock = await fetchItemStock(v);
                            if (item.quantity > stock) {
                              toast.error(`Only ${stock} "${v}" available in this property.`);
                              updateHandoverItemField(idx, 'quantity', stock > 0 ? stock : 1);
                            }
                          }}
                          onOpenChange={(open) => {
                            if (open) requestAnimationFrame(() => itemNameSearchRef.current?.focus());
                          }}
                        >
                          <SelectTrigger className="h-6 text-xs border-gray-200 bg-gray-50 w-full">
                            <SelectValue placeholder="Item name" />
                          </SelectTrigger>
                          <SelectContent position="popper" sideOffset={4} avoidCollisions className="max-h-[220px] w-[var(--radix-select-trigger-width)]">
                            <div className="sticky top-0 bg-white p-1.5 border-b z-10">
                              <div className="relative">
                                <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <Input
                                  ref={itemNameSearchRef}
                                  placeholder="Search item..."
                                  className="pl-6 h-6 text-[10px]"
                                  value={itemNameSearchTerm}
                                  onChange={(e) => setItemNameSearchTerm(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            <div className="py-1">
                              {subcats
                                .filter(s => s.subcategory_name.toLowerCase().includes(itemNameSearchTerm.toLowerCase()))
                                .map(s => (
                                  <SelectItem key={s.subcategory_id} value={s.subcategory_name} className="text-xs">
                                    {s.subcategory_name}
                                  </SelectItem>
                                ))}
                            </div>
                          </SelectContent>
                        </Select>
                      );
                  }
                  return (
                    <Input
                      placeholder="Select category first"
                      className="h-6 text-xs border-gray-200 bg-gray-50 w-full"
                      value={item.item_name}
                      disabled={!item.category}
                      onChange={e => updateHandoverItemField(idx, 'item_name', e.target.value)}
                    />
                  );
                })()}
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
                  onChange={async e => {
                    let qty = parseInt(e.target.value) || 1;
                    if (item.item_name) {
                      const stock = itemStockMap[item.item_name] ?? await fetchItemStock(item.item_name);
                      if (qty > stock) {
                        toast.error(`Only ${stock} unit(s) of "${item.item_name}" available, cannot assign ${qty}.`);
                        qty = stock > 0 ? stock : 1;
                      }
                    }
                    updateHandoverItemField(idx, 'quantity', qty);
                  }} 
                />
              </div>

              {/* Notes */}
              <div className="col-span-2">
                <Input 
                  className="h-6 text-xs border-gray-200 bg-gray-50 w-full" 
                  placeholder="Notes (optional)"
                  value={item.notes || ''}
                  onChange={e => updateHandoverItemField(idx, 'notes', e.target.value)} 
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
          </div>
        ))}
      </div>

      {/* Add Item Button - compact, left-aligned */}
      <button 
        type="button" 
        onClick={addHandoverItem}
        className="w-auto px-2 py-1 border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
      >
        <Plus className="h-2.5 w-2.5" /> Add Item
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
                className="flex-1 h-8 text-[11px] font-semibold bg-gradient-to-r from-[#0A1F5C] hover:from-[#0A1F5C] hover:to-[#1E4ED8] text-white rounded-lg shadow-sm flex items-center justify-center gap-1.5">
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
    <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]  text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
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
      <Share2 className="h-3.5 w-3.5" />
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
            <FaWhatsapp className="h-3.5 w-3.5 text-white" />
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
  onClick={() => setShowPrintPreview(true)}
  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-medium transition-colors"
>
  <Printer className="h-3.5 w-3.5" />
  <span className="hidden sm:inline">Print</span>
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

      {/* Print Preview Dialog */}
<Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
  <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden p-0 flex flex-col">
    <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-3.5 py-2">
      <div>
        <h2 className="flex items-center gap-1.5 text-sm font-bold leading-tight text-white">
          <Printer className="h-3.5 w-3.5" />
          Handover Document
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
      {viewItem && (() => {
        const secDep = safeNum(viewItem.security_deposit);
        const rentAmt = safeNum(viewItem.rent_amount);
        const totalAmt = secDep + rentAmt;
        const receiptNo = `HO-${String(viewItem.id).padStart(4, '0')}-${(() => {
          const d = viewItem.handover_date ? new Date(viewItem.handover_date) : new Date();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          return `${mm}${d.getFullYear()}`;
        })()}`;

        return (
          <div id="handover-receipt-print-area" className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">

            {/* Watermark */}
            <div className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center overflow-hidden">
              <span
                className="whitespace-nowrap font-black leading-none"
                style={{ fontSize: "min(10vw, 56px)", letterSpacing: "0.02em", color: "rgba(100, 116, 139, 0.09)", transform: "rotate(-30deg)" }}
              >
                {siteSettings.siteName?.split(" ")[0]}
              </span>
            </div>

            {/* Header: logo left, name center, doc no right */}
            <div className="relative z-10 mb-3 flex items-center border-b border-slate-200 pb-3">
              <div className="w-28 flex-shrink-0">
                {siteSettings.logo && (
                  <img src={siteSettings.logo} alt={siteSettings.siteName} className="h-20 w-auto object-contain"
                    onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                )}
              </div>
              <div className="flex-1 text-center">
                <h2 className="text-lg font-bold text-slate-800">{siteSettings.siteName}</h2>
                <p className="text-sm font-semibold text-slate-700">Handover Document</p>
              </div>
              <div className="w-28 text-right text-[10px] text-slate-400">
                <span className="block font-semibold text-slate-600">Document No.</span>
                <span className="text-[10px]">{receiptNo}</span>
              </div>
            </div>

            {/* Meta bar */}
            <div className="relative z-10 mb-3 flex justify-between border-b border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-500">
              <div>
                <span className="text-[9px] font-semibold uppercase">Handover Date</span>
                <span className="block font-bold text-slate-800">{fmt(viewItem.handover_date)}</span>
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
            <div className="relative z-10 mb-3 grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
              <div><span className="text-[9px] font-semibold uppercase text-slate-400">Tenant</span><div className="font-medium text-slate-800">{viewItem.tenant_name || "—"}</div></div>
              <div><span className="text-[9px] font-semibold uppercase text-slate-400">Phone</span><div className="font-medium text-slate-800">{viewItem.tenant_phone || "—"}</div></div>
              <div><span className="text-[9px] font-semibold uppercase text-slate-400">Email</span><div className="font-medium text-slate-800">{viewItem.tenant_email || "—"}</div></div>
              <div><span className="text-[9px] font-semibold uppercase text-slate-400">Room/Bed</span><div className="font-medium text-slate-800">{viewItem.room_number}{viewItem.bed_number ? ` / ${viewItem.bed_number}` : ""}</div></div>
              <div><span className="text-[9px] font-semibold uppercase text-slate-400">Move-In Date</span><div className="font-medium text-slate-800">{fmt(viewItem.move_in_date)}</div></div>
              <div><span className="text-[9px] font-semibold uppercase text-slate-400">Inspector</span><div className="font-medium text-slate-800">{viewItem.inspector_name || "—"}</div></div>
            </div>

            {/* Items table */}
            {viewItem.handover_items && viewItem.handover_items.length > 0 && (
              <div className="relative z-10 mb-3">
                <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Item Checklist</p>
                <table className="w-full border-collapse border border-slate-300 text-xs">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">#</th>
                      <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Item</th>
                      <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Category</th>
                      <th className="border border-slate-300 px-2 py-1 text-center font-semibold text-slate-600">Qty</th>
                      <th className="border border-slate-300 px-2 py-1 text-center font-semibold text-slate-600">Condition</th>
                      <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewItem.handover_items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-300 px-2 py-1 text-center text-slate-500">{idx + 1}</td>
                        <td className="border border-slate-300 px-2 py-1 font-medium text-slate-700">{item.item_name}</td>
                        <td className="border border-slate-300 px-2 py-1 text-slate-600">{item.category}</td>
                        <td className="border border-slate-300 px-2 py-1 text-center text-slate-600">{item.quantity}</td>
                        <td className="border border-slate-300 px-2 py-1 text-center text-slate-600">{item.condition_at_movein}</td>
                        <td className="border border-slate-300 px-2 py-1 text-slate-500">{item.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            {/* <div className="relative z-10 mt-3 flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-slate-600">Security Deposit</span>
                  <span className="font-bold text-slate-800">{money(secDep)}</span>
                </div>
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-slate-600">Rent Amount</span>
                  <span className="font-bold text-slate-800">{money(rentAmt)}</span>
                </div>
                <div className="mt-1 flex justify-between border-t-2 border-slate-300 py-1 pt-1 text-sm">
                  <span className="font-bold text-slate-700">Total Value</span>
                  <span className="font-bold text-blue-700">{money(totalAmt)}</span>
                </div>
              </div>
            </div> */}

            {viewItem.notes && (
              <div className="relative z-10 mt-3 rounded-lg bg-yellow-50 p-2">
                <p className="mb-0.5 text-[10px] font-medium text-yellow-700">Notes</p>
                <p className="text-sm text-yellow-800">{viewItem.notes}</p>
              </div>
            )}

            {/* Signatures */}
            <div className="relative z-10 mt-8 grid grid-cols-3 gap-6 text-center text-xs">
              <div><div className="mb-1 border-t border-slate-400 pt-1">{viewItem.tenant_name}</div><p className="text-[9px] text-slate-500">Tenant Signature</p></div>
              <div><div className="mb-1 border-t border-slate-400 pt-1">{viewItem.inspector_name || "—"}</div><p className="text-[9px] text-slate-500">Inspector/Manager</p></div>
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
        );
      })()}
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
          const content = document.getElementById("handover-receipt-print-area");
          if (!content) return;
          const win = window.open("", "_blank", "width=800,height=900");
          if (!win) return;
          win.document.write(`
            <html>
              <head><title>Handover Document</title>
                <style>
                  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #fff; }
                  #handover-receipt-print-area { max-width: 760px; margin: 0 auto; }
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
            <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]  text-white px-2 py-2 rounded-t-lg ">
              <h2 className="text-base font-semibold">Verify OTP</h2>
              <p className="text-xs text-purple-100">Confirm handover with tenant</p>
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
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleVerifyOTP} disabled={otpCode.length !== 6}
                  className="flex-1 bg-gradient-to-r from-[#0A1F5C] to-[#1E4ED8]">
                  Verify & Confirm
                </Button>
                <Button variant="outline" onClick={() => setShowOTPModal(false)}>Cancel</Button>
                
              </div>
              {isResendOtpSent && timeLeft === 0 ? (
              <div className="mt-2.5 flex flex-col sm:flex-row items-center justify-between gap-1.5">
                <button
                  onClick={handleResendOTP}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Resend OTP
                </button>
              </div>
            ) : (
              timeLeft > 0 && (
                <div className="mt-2.5 flex flex-col sm:flex-row items-center justify-between gap-1.5">
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    Resend OTP in {timeLeft} seconds
                  </span>
                </div>
              )
            )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}