import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Package, Plus, Trash2, Search, Loader2, X, Download,
  Building, IndianRupee, StickyNote, RefreshCw, Filter,
  BarChart, AlertTriangle, TrendingDown, Boxes, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Eye, Pencil, Printer,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Copy,
  Mail,
  MessageCircle,
  Share2,
  Smartphone,  // ← add Printer
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  getInventoryStats,
} from "@/lib/assestsApi";
import { getMasterItemsByTab, getMasterValues } from "@/lib/masterApi";
import { listProperties } from "@/lib/propertyApi";
import Swal from 'sweetalert2';
import { deletePurchase, getPurchases } from "@/lib/materialPurchaseApi";
import * as XLSX from 'xlsx';
import { useAuth } from "@/context/authContext";
import { getInventoryMappingsGrouped } from "@/lib/categorySubcategoryMapApi";
import { getSettings, getSettingValue } from "@/lib/settingsApi"; // optional
import { FaWhatsapp } from 'react-icons/fa';

// ─── Types ────────────────────────────────────────────────────────────────────
interface InventoryItem {
  id: string;
  item_name: string;
  category_id: string;
  category_name?: string;
  property_id: string;
  property_full_name?: string;
  quantity: number;
  unit_price: number;
  min_stock_level: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  asset_id?: string;
  vendor_name?: string;
  purchase_date?: string;
  asset_status?: string;
}

interface MasterCategory { id: string; name: string; }
interface Property { id: string; name: string; }

type StockFilter = 'all' | 'low_stock' | 'out_of_stock';

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

// ═══════════════════════════════════════════════════════════════════════════════
export function Assets() {
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── View modals ──
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);
  const [viewGroup, setViewGroup] = useState<any | null>(null);

  // ── Bulk selection ──
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // ── Pagination state (client-side) ──
  const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, "All"] as const;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | "All">(25);
  const [totalGroups, setTotalGroups] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [purchasedItems, setPurchasedItems] = useState<{ label: string; value: string }[]>([]);
  const [propertySearchTerm, setPropertySearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');   // NEW
const [itemSearchTerm, setItemSearchTerm] = useState('');

const categorySearchRef = React.useRef<HTMLInputElement>(null);
const itemSearchRef = React.useRef<HTMLInputElement>(null);
const propertySearchRef = React.useRef<HTMLInputElement>(null);


const [categorySelectOpen, setCategorySelectOpen] = useState(false);
const [itemSelectOpen, setItemSelectOpen] = useState(false);
const [propertySelectOpen, setPropertySelectOpen] = useState(false);

const [draftStockFilter, setDraftStockFilter] = useState<StockFilter>('all');
const [draftCategoryFilter, setDraftCategoryFilter] = useState('all');
const [draftPropertyFilter, setDraftPropertyFilter] = useState('all');
const [draftAssetStatusFilter, setDraftAssetStatusFilter] = useState('all');
const [draftVendorFilter, setDraftVendorFilter] = useState('all');
const [draftDateFrom, setDraftDateFrom] = useState('');
const [draftDateTo, setDraftDateTo] = useState('');


useEffect(() => {
  if (sidebarOpen) {
    setDraftStockFilter(stockFilter);
    setDraftCategoryFilter(categoryFilter);
    setDraftPropertyFilter(propertyFilter);
    setDraftAssetStatusFilter(assetStatusFilter);
    setDraftVendorFilter(vendorFilter);
    setDraftDateFrom(dateFrom);
    setDraftDateTo(dateTo);
  }
}, [sidebarOpen]); // eslint-disable-line react-hooks/exhaustive-deps

// NEW — auto-focus effects
useEffect(() => {
  if (categorySelectOpen) {
    requestAnimationFrame(() => categorySearchRef.current?.focus());
  }
}, [categorySelectOpen]);

useEffect(() => {
  if (itemSelectOpen) {
    requestAnimationFrame(() => itemSearchRef.current?.focus());
  }
}, [itemSelectOpen]);

useEffect(() => {
  if (propertySelectOpen) {
    requestAnimationFrame(() => propertySearchRef.current?.focus());
  }
}, [propertySelectOpen]);
  const [stats, setStats] = useState({
    total_items: 0, total_quantity: 0, total_value: 0,
    low_stock_count: 0, out_of_stock_count: 0,
  });
const [showSharePopup, setShowSharePopup] = useState(false);

  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const { can } = useAuth();
  const [inventoryMappings, setInventoryMappings] = useState<
    { category_id: string; category_name: string; subcategories: { subcategory_id: string; subcategory_name: string }[] }[]
  >([]);
  const [mappingsLoading, setMappingsLoading] = useState(true);
 const [colSearch, setColSearch] = useState({
  item_name: '', category: '', property: '', vendor: '',
  unit_price: '', quantity: '', status: '',
});

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');
const [assetStatusFilter, setAssetStatusFilter] = useState('all');
const [vendorFilter, setVendorFilter] = useState('all');

  const [siteSettings, setSiteSettings] = useState({
  siteName: "ROOMAC",
  logo: "",
  phone: "",
  email: "",
  address: "",
});

useEffect(() => {
  const fetchSettings = async () => {
    try {
      // If getSettings is available:
      const settings = await getSettings();
      setSiteSettings({
        siteName: getSettingValue(settings, "site_name", "ROOMAC"),
        logo: getSettingValue(settings, "logo_header", ""),
        phone: getSettingValue(settings, "contact_phone", ""),
        email: getSettingValue(settings, "contact_email", ""),
        address: getSettingValue(settings, "contact_address", ""),
      });
    } catch {
      // fallback defaults (already set)
    }
  };
  fetchSettings();
}, []);
  const loadPurchasedItems = useCallback(async () => {
    try {
      const res = await getPurchases();
      const allItems: { label: string; value: string }[] = [];
      (res.data || []).forEach(purchase => {
        let items: any[] = [];
        if (purchase.purchase_items && purchase.purchase_items.length > 0) {
          items = purchase.purchase_items;
        } else if (purchase.items) {
          if (typeof purchase.items === 'string') {
            try { items = JSON.parse(purchase.items); } catch { items = []; }
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
      const unique = allItems.filter((v, i, a) => a.findIndex(t => t.value === v.value) === i);
      setPurchasedItems(unique);
    } catch (err) {
      console.error('Could not load purchased items:', err);
    }
  }, []);

  const emptyForm = {
    item_name: '', category_id: '', category_name: '',
    property_id: '', property_name: '',
    quantity: 0, unit_price: 0, min_stock_level: 10, notes: '', vendor_name: '',
    purchase_date: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  // ── Loaders ──────────────────────────────────────────────────────────────────
 const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        getInventory({
          category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
          property_id: propertyFilter !== 'all' ? propertyFilter : undefined,
          page: 1,
          limit: 999999,
        }),
        getInventoryStats(),
      ]);
      const rawItems = res.data || [];
      setAllItems(rawItems);
      setStats(statsRes.data);
      setBulkSelected(new Set());
      setSelectAll(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [ categoryFilter, propertyFilter]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await getMasterItemsByTab('Properties');
      const list = Array.isArray(res.data) ? res.data : [];
      const catItem = list.find((i: any) => i.name?.toLowerCase() === 'category');
      if (!catItem) return;
      const vRes = await getMasterValues(catItem.id);
      const values = Array.isArray(vRes.data) ? vRes.data : Array.isArray(vRes) ? vRes : [];
      setCategories(
        values
          .filter((v: any) => v.isactive === 1 || v.is_active === 1)
          .map((v: any) => ({ id: String(v.id), name: v.value || v.name || '' }))
      );
    } catch (err) {
      console.error('Could not load categories:', err);
    }
  }, []);

  const loadProperties = useCallback(async () => {
    try {
      const res = await listProperties({ is_active: true });
      const list = res?.data?.data || res?.data || (res as any)?.results || [];
      const arr = Array.isArray(list) ? list : Object.values(list);
      setProperties(arr.map((p: any) => ({ id: String(p.id), name: p.name })));
    } catch (err) {
      console.error('Could not load properties:', err);
    }
  }, []);

  const loadInventoryMappings = useCallback(async () => {
    setMappingsLoading(true);
    try {
      const res = await getInventoryMappingsGrouped();
      setInventoryMappings(res?.data || []);
    } catch (err) {
      console.error("Could not load inventory mappings:", err);
    } finally {
      setMappingsLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); loadProperties(); loadPurchasedItems(); loadInventoryMappings(); }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

const filteredItems = useMemo(() => {
  return allItems.filter(item => {
    const cs = colSearch;

    const nameOk = !cs.item_name || item.item_name?.toLowerCase().includes(cs.item_name.toLowerCase());
    const catOk = !cs.category || (item.category_name || '').toLowerCase().includes(cs.category.toLowerCase());
    const propOk = !cs.property || (item.property_full_name || '').toLowerCase().includes(cs.property.toLowerCase());
    const priceOk = !cs.unit_price || String(item.unit_price).includes(cs.unit_price);


    // Sidebar filters (dropdowns) – compare by ID
    const categoryFilterOk = categoryFilter === 'all' || (item.category_name || '') === categoryFilter;
    const propertyFilterOk = propertyFilter === 'all' || String(item.property_id) === String(propertyFilter);
 

    const dateOk = dateFrom && dateTo
      ? (item.purchase_date || '') >= dateFrom && (item.purchase_date || '') <= dateTo
      : true;

    const assetStatusOk = assetStatusFilter === 'all' || item.asset_status === assetStatusFilter;
    const vendorFilterOk = vendorFilter === 'all' || item.vendor_name === vendorFilter;

   return nameOk && catOk && propOk && priceOk &&
       categoryFilterOk && propertyFilterOk &&
       dateOk && assetStatusOk && vendorFilterOk;
  });
}, [allItems, colSearch, categoryFilter, propertyFilter, stockFilter,
    dateFrom, dateTo, assetStatusFilter, vendorFilter]);

  // ── Grouping ────────────────────────────────────────────────────────────────
 // ── Grouping ────────────────────────────────────────────────────────────────
const groupedItems = useMemo(() => {
    const groups: Record<string, any> = {};
    filteredItems.forEach(item => {
      const key = `${item.item_name}__${item.property_id}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          item_name: item.item_name,
          category_name: item.category_name,
          property_full_name: item.property_full_name,
          total_quantity: 0,
          total_value: 0,
          unit_price: item.unit_price,
          min_stock_level: item.min_stock_level,
          available_count: 0,
          assets: [],
        };
      }
      groups[key].total_quantity += item.quantity || 1;
      groups[key].total_value += (item.quantity || 1) * item.unit_price;
      if (item.asset_status === 'available' || !item.asset_status) {
        groups[key].available_count += item.quantity || 1;
      }
      groups[key].assets.push(item);
    });

    Object.values(groups).forEach((g: any) => {
  const totalAssets = g.assets.length;
  const availablePercent = totalAssets > 0 ? (g.available_count / totalAssets) * 100 : 0;
  
  if (g.available_count === 0) {
    g.stock_status = 'out_of_stock';
  } else if (availablePercent <= 50) {
    g.stock_status = 'low_stock';
  } else {
    g.stock_status = 'ok';
  }
});

    return Object.values(groups);
  }, [filteredItems]);

  // ── Qty / Status search (post-grouping) ───────────────────────────────────
const searchedGroups = useMemo(() => {
    return groupedItems.filter((group: any) => {
      const qtyOk = !colSearch.quantity ||
        String(group.total_quantity).includes(colSearch.quantity);

      const stOk = !colSearch.status ||
        group.assets.some((a: InventoryItem) => {
          const isOut = a.quantity === 0;
          const isLow = a.quantity <= a.min_stock_level && a.quantity > 0;
          const label = a.asset_status || (isOut ? 'out' : isLow ? 'low' : 'ok');
          return label.toLowerCase().includes(colSearch.status.toLowerCase());
        });

      const stockFilterOk = stockFilter === 'all' ? true : group.stock_status === stockFilter;

      return qtyOk && stOk && stockFilterOk;
    });
  }, [groupedItems, colSearch.quantity, colSearch.status, stockFilter]);

  // ── Paginated groups ──────────────────────────────────────────────────────
  const paginatedGroups = useMemo(() => {
    if (pageSize === "All") return searchedGroups;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return searchedGroups.slice(start, end);
  }, [searchedGroups, currentPage, pageSize]);

  useEffect(() => {
    setTotalGroups(searchedGroups.length);
    setTotalPages(pageSize === "All" ? 1 : Math.ceil(searchedGroups.length / pageSize));
    if (currentPage > Math.ceil(searchedGroups.length / (pageSize === "All" ? searchedGroups.length : pageSize))) {
      setCurrentPage(1);
    }
  }, [searchedGroups, pageSize]);

  // useEffect(() => {
  //   setTotalGroups(groupedItems.length);
  //   setTotalPages(pageSize === "All" ? 1 : Math.ceil(groupedItems.length / pageSize));
  //   if (currentPage > Math.ceil(groupedItems.length / (pageSize === "All" ? groupedItems.length : pageSize))) {
  //     setCurrentPage(1);
  //   }
  // }, [groupedItems, pageSize]);

  // ── Toggle expanded group ─────────────────────────────────────────────────
  const toggleGroup = (key: string) =>
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // ── Bulk selection ────────────────────────────────────────────────────────
  const toggleBulkSelect = (id: string) => {
    setBulkSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setBulkSelected(checked ? new Set(filteredItems.map(i => i.id)) : new Set());
  };

  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: 'Delete Selected?',
      text: `You are about to delete ${bulkSelected.size} asset(s). This cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete all!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      width: '400px',
      padding: '1.5rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
        cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
        actions: 'flex justify-center gap-2 mt-4',
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;

   try {
    setSubmitting(true);
    await Promise.all([...bulkSelected].map((id) => deleteInventory(id))); // ← use deleteInventory
    toast.success(`${bulkSelected.size} assets deleted`);
    setBulkSelected(new Set());
    setSelectAll(false);
    await loadAll();
  } catch (err: any) {
    toast.error(err.message || 'Bulk delete failed');
  } finally {
    setSubmitting(false);
  }
};

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const openAdd = () => { setEditingItem(null); setFormData(emptyForm); setShowForm(true); };
  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      category_id: String(item.category_id),
      property_id: String(item.property_id),
      quantity: item.quantity,
      unit_price: item.unit_price,
      min_stock_level: item.min_stock_level,
      notes: item.notes || '',
      vendor_name: item.vendor_name || '',
      purchase_date: item.purchase_date ? new Date(item.purchase_date).toISOString().split('T')[0] : '',
    } as any);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.item_name || !formData.category_id || !formData.property_id) {
      toast.error('Item name, category, and property are required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingItem) {
        await updateInventory(editingItem.id, formData);
      } else {
        await createInventory(formData as any);
      }
      setShowForm(false);
      await loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

const handleDeleteAsset = async (id: string) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete this asset. This action cannot be undone!`,
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
      actions: 'flex justify-center gap-2 mt-4',
    },
    buttonsStyling: false,
  });

  if (!result.isConfirmed) return;

  try {
    setSubmitting(true);
    await deleteInventory(id); // ← use deleteInventory, not deletePurchase
    await loadAll();
    Swal.fire({
      title: 'Deleted!',
      text: 'Asset has been deleted successfully.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      width: '350px',
      padding: '1rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-green-600',
        htmlContainer: 'text-xs text-gray-600',
      },
    });
  } catch (err: any) {
    console.error('Error deleting asset:', err);
    Swal.fire({
      title: 'Error!',
      text: err.message || 'Failed to delete asset',
      icon: 'error',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
      width: '350px',
      padding: '1rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-red-600',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors',
      },
      buttonsStyling: false,
    });
  } finally {
    setSubmitting(false);
  }
};

  const handleExport = () => {
    try {
      const exportData = filteredItems.map(item => {
        const isLow = item.quantity <= item.min_stock_level && item.quantity > 0;
        const isOut = item.quantity === 0;
        const status = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'OK';
        const totalValue = item.quantity * item.unit_price;
        return {
          'Item Name': item.item_name,
          'Category': item.category_name || '',
          'Property': item.property_full_name || '',
          'Vendor': item.vendor_name || '',
          'Quantity': item.quantity,
          'Unit Price (₹)': item.unit_price,
          'Total Value (₹)': totalValue,
          'Min Stock Level': item.min_stock_level,
          'Status': status,
          'Notes': item.notes || '',
          'Last Updated': new Date(item.updated_at).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
          }),
          'Item ID': item.id,
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const colWidths: any[] = [];
      const headers = Object.keys(exportData[0] || {});
      headers.forEach(header => {
        const maxLength = Math.max(
          header.length,
          ...exportData.map(row => String((row as any)[header] || '').length)
        );
        colWidths.push({ wch: Math.min(maxLength + 2, 50) });
      });
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventory");

      const summaryData: any[] = [{
        'Metric': 'Total Items', 'Value': filteredItems.length,
      }, {
        'Metric': 'Total Quantity', 'Value': filteredItems.reduce((sum, item) => sum + item.quantity, 0),
      }, {
        'Metric': 'Total Value', 'Value': `₹${filteredItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toLocaleString('en-IN')}`,
      }, {
        'Metric': 'Low Stock Items', 'Value': filteredItems.filter(item => item.quantity <= item.min_stock_level && item.quantity > 0).length,
      }, {
        'Metric': 'Out of Stock Items', 'Value': filteredItems.filter(item => item.quantity === 0).length,
      }, {
        'Metric': 'Categories', 'Value': new Set(filteredItems.map(item => item.category_name)).size,
      }, {
        'Metric': 'Properties', 'Value': new Set(filteredItems.map(item => item.property_full_name)).size,
      }, {
        'Metric': 'Export Date', 'Value': new Date().toLocaleString('en-IN'),
      }];

      const categoryCounts = filteredItems.reduce((acc, item) => {
        const cat = item.category_name || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(categoryCounts).forEach(([category, count]) => {
        summaryData.push({ 'Metric': `${category} Items`, 'Value': count });
      });

      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      const filename = `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success(`Exported ${filteredItems.length} items successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export inventory');
    }
  };

  const hasColSearch = Object.values(colSearch).some(v => v !== '');
const hasFilters =
  stockFilter !== 'all' ||
  categoryFilter !== 'all' ||
  propertyFilter !== 'all' ||
  assetStatusFilter !== 'all' ||
  vendorFilter !== 'all' ||
  !!dateFrom ||
  !!dateTo; 
  
  const activeFilterCount = [
  stockFilter !== 'all',
  categoryFilter !== 'all',
  propertyFilter !== 'all',
  !!dateFrom,
  !!dateTo,
  assetStatusFilter !== 'all',
  vendorFilter !== 'all',
].filter(Boolean).length;

const clearFilters = () => {
  setStockFilter('all');
  setCategoryFilter('all');
  setPropertyFilter('all');
  setDateFrom('');
  setDateTo('');
  setAssetStatusFilter('all');
  setVendorFilter('all');
};  
const clearColSearch = () => setColSearch({
  item_name: '', category: '', property: '', vendor: '',
  unit_price: '', quantity: '', status: '',
});
const statusBadgeStyle = (status?: string) => {
  if (status === 'assigned') return { bg: '#DBEAFE', text: '#1D4ED8' };
  if (status === 'damaged') return { bg: '#FEE2E2', text: '#991B1B' };   // red background, dark red text
  if (status === 'missing') return { bg: '#FEF2F2', text: '#DC2626' };   // light red background, bright red text
  return { bg: '#DCFCE7', text: '#166534' }; // available (green)
};
 const printGroupSummary = (group: any) => {
  if (!group) return;

  const win = window.open('', '_blank', 'width=1000,height=900');
  if (!win) return;

  const rows = group.assets.map((item: InventoryItem, idx: number) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${item.asset_id || '-'}</strong></td>
      <td>${item.item_name}</td>
      <td>${item.category_name || '-'}</td>
      <td>${item.property_full_name || '-'}</td>
      <td>${item.vendor_name || '-'}</td>
      <td>${item.purchase_date ? new Date(item.purchase_date).toLocaleDateString('en-IN') : '-'}</td>
      <td style="text-align:right;">₹${Number(item.unit_price).toLocaleString('en-IN')}</td>
      <td>${item.asset_status || 'available'}</td>
    </tr>
  `).join('');

  const totalQuantity = group.total_quantity;
  const totalValue = Number(group.total_value).toLocaleString('en-IN');
  const assetCount = group.assets.length;

  // Generate a short group ID (first 6 chars of first asset id or fallback)
  const groupId = group.assets[0]?.id ? `G-${String(group.assets[0].id).slice(0,6)}` : 'G-0001';

  win.document.write(`
    <html>
      <head><title>Asset Group - ${group.item_name}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; }
          body { background: #F4F6FB; padding: 24px; color: #1A2B6D; }
          .sheet {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(26,43,109,0.08);
            border: 1px solid #E2E8F4;
            padding: 24px 28px;
            position: relative;
          }
          .watermark {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            user-select: none;
            overflow: hidden;
            z-index: 0;
            opacity: 0.08;
          }
          .watermark span {
            font-size: min(10vw, 56px);
            font-weight: 900;
            line-height: 1;
            white-space: nowrap;
            letter-spacing: 0.02em;
            color: #475569;
            transform: rotate(-30deg);
          }
          .head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #E2E8F4;
            padding-bottom: 14px;
            margin-bottom: 18px;
            position: relative;
            z-index: 1;
          }
          .head .brand {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 0 0 auto;
          }
          .head .brand img {
            height: 48px;
            max-width: 120px;
            object-fit: contain;
            background: #fff;
            border-radius: 6px;
            padding: 4px;
          }
          .head .title-area {
            flex: 1;
            text-align: center;
          }
          .head .title-area .brand-name {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 0.5px;
          }
          .head .title-area .sub-title {
            font-size: 13px;
            font-weight: 600;
            color: #3B5BDB;
            margin-top: 2px;
          }
          .head .group-id {
            flex: 0 0 auto;
            text-align: right;
            font-size: 10px;
            color: #8892A4;
          }
          .head .group-id .label {
            display: block;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .head .group-id .value {
            font-size: 14px;
            font-weight: 700;
            color: #1A2B6D;
            margin-top: 2px;
          }
          .meta-bar {
            display: flex;
            justify-content: space-between;
            background: #F8FAFF;
            padding: 8px 12px;
            border-radius: 8px;
            margin-bottom: 18px;
            font-size: 11px;
            color: #5A6480;
            position: relative;
            z-index: 1;
          }
          .meta-bar div span {
            display: block;
            font-weight: 700;
            color: #1A2B6D;
            font-size: 13px;
            margin-top: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 12px;
            position: relative;
            z-index: 1;
          }
          thead th {
            background: #F0F3FF;
            color: #3B5BDB;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.4px;
            text-align: left;
            padding: 8px 6px;
            font-weight: 700;
            border: 1px solid #E2E8F4;
          }
          tbody td {
            padding: 6px;
            border: 1px solid #E2E8F4;
            color: #374151;
          }
          tfoot td {
            padding: 8px 6px;
            border: 1px solid #E2E8F4;
            font-weight: 700;
          }
          .totals {
            margin-top: 16px;
            margin-left: auto;
            width: 300px;
            position: relative;
            z-index: 1;
          }
          .totals .row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 13px;
          }
          .totals .row.grand {
            border-top: 2px solid #1A2B6D;
            padding-top: 8px;
            font-size: 16px;
            font-weight: 800;
          }
          .foot {
            text-align: center;
            font-size: 10px;
            color: #9AA3B5;
            border-top: 1px dashed #E2E8F4;
            padding-top: 14px;
            margin-top: 20px;
            position: relative;
            z-index: 1;
          }
          .foot .thanks {
            font-size: 12px;
            font-weight: 700;
            color: #3B5BDB;
            margin-bottom: 4px;
          }
          @media print {
            body { background: #fff; padding: 0; }
            .sheet { box-shadow: none; border: none; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <!-- WATERMARK -->
          <div class="watermark">
            <span>${siteSettings.siteName?.split(" ")[0] || "ROOMAC"}</span>
          </div>

          <!-- HEADER: Logo left, Title center, Group ID right -->
          <div class="head">
            <div class="brand">
              ${siteSettings.logo ? `<img src="${siteSettings.logo}" alt="logo" />` : ''}
            </div>
            <div class="title-area">
              <div class="brand-name">${siteSettings.siteName}</div>
              <div class="sub-title">Asset Group Summary</div>
            </div>
            <div class="group-id">
              <span class="label">Group ID</span>
              <span class="value">${groupId}</span>
            </div>
          </div>

          <!-- META BAR: Item, Category, Property, Total Assets -->
          <div class="meta-bar">
            <div>Item <span>${group.item_name}</span></div>
            <div>Category <span>${group.category_name || '—'}</span></div>
            <div>Property <span>${group.property_full_name || '—'}</span></div>
            <div>Total Assets <span>${assetCount}</span></div>
          </div>

          <!-- TABLE -->
          <table>
            <thead>
              <tr>
                <th>#</th><th>Asset ID</th><th>Item</th><th>Category</th><th>Property</th>
                <th>Vendor</th><th>Purchase Date</th><th style="text-align:right;">Unit Price</th><th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr><td colspan="7" style="text-align:right;">Total Assets</td><td style="text-align:right;">${assetCount}</td><td></td></tr>
              <tr><td colspan="7" style="text-align:right;">Total Quantity</td><td style="text-align:right;">${totalQuantity}</td><td></td></tr>
              <tr><td colspan="7" style="text-align:right;font-weight:700;">Total Value</td><td style="text-align:right;font-weight:700;">₹${totalValue}</td><td></td></tr>
            </tfoot>
          </table>

          <!-- FOOTER -->
          <div class="foot">
            <div class="thanks">Thank you</div>
            ${siteSettings.email || siteSettings.phone ? `${siteSettings.email || ''} ${siteSettings.email && siteSettings.phone ? '•' : ''} ${siteSettings.phone || ''}` : ''}
            <div style="margin-top:4px;">Generated on ${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
};

const handleShareWhatsApp = () => {
  if (!viewGroup) return;
  const message = encodeURIComponent(
    `🏠 *Asset Group Summary*\n\n` +
    `*Item:* ${viewGroup.item_name}\n` +
    `*Category:* ${viewGroup.category_name || '—'}\n` +
    `*Property:* ${viewGroup.property_full_name || '—'}\n` +
    `*Total Assets:* ${viewGroup.assets.length}\n` +
    `*Total Quantity:* ${viewGroup.total_quantity}\n` +
    `*Total Value:* ₹${Number(viewGroup.total_value).toLocaleString('en-IN')}`
  );
  window.open(`https://wa.me/?text=${message}`, '_blank');
};
const handleShareEmail = () => {
  if (!viewGroup) return;
  const subject = encodeURIComponent(`Asset Group Summary — ${viewGroup.item_name}`);
  const body = encodeURIComponent(
    `Item: ${viewGroup.item_name}\n` +
    `Category: ${viewGroup.category_name || '—'}\n` +
    `Property: ${viewGroup.property_full_name || '—'}\n` +
    `Total Assets: ${viewGroup.assets.length}\n` +
    `Total Quantity: ${viewGroup.total_quantity}\n` +
    `Total Value: ₹${Number(viewGroup.total_value).toLocaleString('en-IN')}`
  );
  window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
};
const handleShareSMS = () => {
  if (!viewGroup) return;
  const body = encodeURIComponent(
    `Asset Group: ${viewGroup.item_name} | Category: ${viewGroup.category_name || '—'} | Total Assets: ${viewGroup.assets.length} | Total Value: ₹${Number(viewGroup.total_value).toLocaleString('en-IN')}`
  );
  window.open(`sms:?body=${body}`, '_blank');
};
const handleCopyLink = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    toast.success('Link copied to clipboard');
  }).catch(() => {
    toast.error('Failed to copy link');
  });
};
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-gray-50">
      {/* ── HEADER ── */}
  <div
  className="-mt-6 sm:-mt-4"
  style={{
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "#F4F6FB",
  }}
>
  {/* Stats + Actions row */}
  <div className="px-2 py-2">
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">

      {/* LEFT – 4 stats cards */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 flex-1">
  <StatCard
    title="Total Assets"
    value={allItems.length}
    icon={Boxes}
    color="bg-blue-600"
    bg="bg-gradient-to-br from-blue-50 to-blue-100"
  />
  <StatCard
    title="Total Groups"
    value={totalGroups}
    icon={Package}
    color="bg-indigo-600"
    bg="bg-gradient-to-br from-indigo-50 to-indigo-100"
  />
  <StatCard
    title="Total Amount"
    value={`₹${Number(stats.total_value || 0).toLocaleString('en-IN')}`}
    icon={IndianRupee}
    color="bg-green-600"
    bg="bg-gradient-to-br from-green-50 to-green-100"
  />
    <StatCard
    title="Available Assets"
    value={allItems.filter(item => item.asset_status === 'available').length}
    icon={CheckCircle}
    color="bg-emerald-600"
    bg="bg-gradient-to-br from-emerald-50 to-emerald-100"
  />
</div>

      {/* RIGHT – Action buttons */}
      <div className="flex items-center lg:items-start justify-end gap-2 shrink-0 mt-0 lg:mt-8">
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
          {activeFilterCount > 0 && (
            <span
              className={`h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0
                ${
                  sidebarOpen || hasFilters
                    ? "bg-white text-blue-600"
                    : "bg-blue-600 text-white"
                }`}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        {can("export_assets") && (
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white text-[11px] font-medium"
          >
            <Download className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}

        {can("create_assets") && (
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="">Add Item</span>
          </button>
        )}
      </div>
    </div>
  </div>
</div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="relative">
        <main className="p-0 sm:p-0">
          {bulkSelected.size > 0 && (
            <div className="px-0 pb-2">
              <div className="flex items-center justify-between gap-3 border border-[#E2E8F4] rounded-xl px-3 py-2 min-h-[44px] bg-white">
                <span className="font-bold text-[#1A2B6D] text-sm whitespace-nowrap">
                  {bulkSelected.size} selected
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setBulkSelected(new Set()); setSelectAll(false); }} className="text-xs text-[#8892A4] hover:text-gray-600 px-2 py-1">
                    Clear
                  </button>
                  {can('delete_assets') && (
                    <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg text-xs font-bold text-[#DC2626] hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete {bulkSelected.size}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <Card className="border rounded-lg shadow-sm overflow-hidden">
           

            {/* ── Table ── */}
<div className="flex flex-col" style={{ height: window.innerWidth < 640 ? '380px' : '520px' }}>  <div className="overflow-auto flex-1 min-h-0">
    <table
      className="border-collapse text-[11px] font-sans"
      style={{ tableLayout: "fixed", minWidth: "1100px", width: "100%" }}
    >
      <colgroup>
        <col style={{ width: "34px" }} />    {/* expand toggle */}
        <col style={{ width: "150px" }} />   {/* Item Name */}
        <col style={{ width: "120px" }} />   {/* Category */}
        <col style={{ width: "140px" }} />   {/* Property */}
        <col style={{ width: "100px" }} />   {/* Avg Price */}
        <col style={{ width: "110px" }} />   {/* Total Amount */}
        <col style={{ width: "110px" }} />   {/* Status / Qty */}
        <col style={{ width: "90px" }} />    {/* Actions */}
      </colgroup>

      {/* ── STICKY THEAD ── */}
      <thead className="sticky top-0 z-10">
        <tr className="bg-gray-200 border-b border-gray-300">
          <th className="px-1.5 py-1.5 text-center border-r border-gray-300 bg-gray-200">
            {/* Global select all (works on all assets) */}
            <input
              type="checkbox"
              checked={selectAll}
              onChange={(e) => toggleSelectAll(e.target.checked)}
              className="w-3.5 h-3.5 cursor-pointer"
            />
          </th>
          <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
            <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Item Name</span>
          </th>
          <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
            <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Category</span>
          </th>
          <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
            <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Property</span>
          </th>
          <th className="px-1.5 py-1.5 text-right border-r border-gray-300 bg-gray-200">
            <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Avg Price</span>
          </th>
          <th className="px-1.5 py-1.5 text-right border-r border-gray-300 bg-gray-200">
            <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Total Amount</span>
          </th>
          <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
            <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Status / Qty</span>
          </th>
          <th className="px-1.5 py-1.5 text-right bg-gray-200">
            <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Actions</span>
          </th>
        </tr>
        {/* Search row */}
     <tr className="bg-white border-b border-gray-300">
  <td className="p-1 border-r border-gray-200" />
  <td className="p-1 border-r border-gray-200">
    <input placeholder="Search…" value={colSearch.item_name}
      onChange={e => setColSearch(prev => ({ ...prev, item_name: e.target.value }))}
      className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0" />
  </td>
  <td className="p-1 border-r border-gray-200">
    <input placeholder="Search…" value={colSearch.category}
      onChange={e => setColSearch(prev => ({ ...prev, category: e.target.value }))}
      className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0" />
  </td>
  <td className="p-1 border-r border-gray-200">
    <input placeholder="Search…" value={colSearch.property}
      onChange={e => setColSearch(prev => ({ ...prev, property: e.target.value }))}
      className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0" />
  </td>
  <td className="p-1 border-r border-gray-200">
    <input placeholder="Price…" value={colSearch.unit_price}
      onChange={e => setColSearch(prev => ({ ...prev, unit_price: e.target.value }))}
      className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0 text-right" />
  </td>
  <td className="p-1 border-r border-gray-200"/>
    
  <td className="p-1 border-r border-gray-200">
    <input placeholder="Units…" value={colSearch.quantity}
      onChange={e => setColSearch(prev => ({ ...prev, quantity: e.target.value }))}
      className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0 text-right" />
  </td>
  <td className="p-1" />
</tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan={8} className="text-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Loading inventory…</p>
            </td>
          </tr>
        ) : paginatedGroups.length === 0 ? (
          <tr>
            <td colSpan={8} className="text-center py-12">
              <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No items found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
            </td>
          </tr>
        ) : (
          paginatedGroups.map((group: any) => {
            const isExpanded = expandedGroups.has(group.key);
          const avgPrice =
  group.assets.reduce((sum: number, a: any) => sum + (Number(a.unit_price) || 0), 0) /
  group.assets.length;

            // Check if all assets in this group are selected (used only in child header checkbox)
            const allSelected = group.assets.every((a: any) => bulkSelected.has(a.id));

            return (
              <React.Fragment key={group.key}>
                {/* ── Parent / summary row (NO checkbox) ── */}
                <tr
                  className="cursor-pointer bg-blue-50/40 hover:bg-blue-50 border-b border-slate-200"
                  onClick={() => toggleGroup(group.key)}
                >
                  <td className="px-1.5 py-1.5 text-center border-r border-slate-200">
                    {/* Only expand/collapse toggle */}
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center mx-auto bg-gray-200 text-gray-600 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); toggleGroup(group.key); }}
                    >
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </div>
                  </td>
                  <td className="px-1.5 py-1.5 text-[11px] font-bold text-slate-800 border-r border-slate-200">
                    {group.item_name}
                  </td>
                  <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-200">
                    {group.category_name || '-'}
                  </td>
                  <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-200">
                    {group.property_full_name || '-'}
                  </td>
                  <td className="px-1.5 py-1.5 text-[11px] font-bold text-slate-700 text-right border-r border-slate-200">
                    ₹{Number(avgPrice).toLocaleString('en-IN')}
                  </td>
                  <td className="px-1.5 py-1.5 text-[11px] font-bold text-blue-600 text-right border-r border-slate-200">
                    ₹{Number(group.total_value).toLocaleString('en-IN')}
                  </td>
                  <td className="px-1.5 py-1.5 border-r border-slate-200">
                    <Badge className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5">
                      {group.total_quantity} units
                    </Badge>
                  </td>
                  <td className="px-1.5 py-1.5 text-right">
                    <button
                      title="View Group Summary"
                      className="w-6 h-6 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center transition-colors"
                      onClick={(e) => { e.stopPropagation(); setViewGroup(group); }}
                    >
                      <Eye size={12} />
                    </button>
                  </td>
                </tr>

                {/* ── Expanded child table ── */}
                {isExpanded && (
                  <tr>
                    <td colSpan={8} className="p-0 bg-gray-50/80 border-b border-slate-200">
                      <div className="p-1.5">
                        <table className="w-full border-collapse text-[11px]">
                          <thead className="bg-gray-100 border-b border-gray-300">
                            <tr>
                              {/* Header checkbox for this group */}
                              <th className="px-1.5 py-1 text-center text-[10px] font-semibold text-gray-600 border-r border-gray-200 w-8">
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  onChange={() => {
                                    const assetIds = group.assets.map((a: any) => a.id);
                                    const allSelectedNow = group.assets.every((a: any) => bulkSelected.has(a.id));
                                    if (allSelectedNow) {
                                      // Deselect all assets in this group
                                      setBulkSelected(prev => {
                                        const next = new Set(prev);
                                        assetIds.forEach(id => next.delete(id));
                                        return next;
                                      });
                                    } else {
                                      // Select all assets in this group
                                      setBulkSelected(prev => new Set([...prev, ...assetIds]));
                                    }
                                  }}
                                  className="w-3 h-3 cursor-pointer"
                                />
                              </th>
                              <th className="px-2 py-1 text-left text-[10px] font-semibold text-gray-600 border-r border-gray-200">Asset ID</th>
                              <th className="px-2 py-1 text-left text-[10px] font-semibold text-gray-600 border-r border-gray-200">Category</th>
                              <th className="px-2 py-1 text-left text-[10px] font-semibold text-gray-600 border-r border-gray-200">Property</th>
                              <th className="px-2 py-1 text-left text-[10px] font-semibold text-gray-600 border-r border-gray-200">Vendor</th>
                              <th className="px-2 py-1 text-left text-[10px] font-semibold text-gray-600 border-r border-gray-200">Purchase Date</th>
                              <th className="px-2 py-1 text-right text-[10px] font-semibold text-gray-600 border-r border-gray-200">Unit Price</th>
                              <th className="px-2 py-1 text-left text-[10px] font-semibold text-gray-600 border-r border-gray-200">Status</th>
                              <th className="px-2 py-1 text-right text-[10px] font-semibold text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.assets.map((item: InventoryItem) => {
                              const st = statusBadgeStyle(item.asset_status);
                              return (
                                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                  {/* Child row checkbox */}
                                  <td className="px-1.5 py-1 text-center">
                                    <input
                                      type="checkbox"
                                      checked={bulkSelected.has(item.id)}
                                      onChange={() => toggleBulkSelect(item.id)}
                                      className="w-3 h-3 cursor-pointer"
                                    />
                                  </td>
                                  <td className="px-2 py-1 text-blue-700 font-mono">{item.asset_id || '-'}</td>
                                  <td className="px-2 py-1 text-slate-600">{item.category_name || '-'}</td>
                                  <td className="px-2 py-1 text-slate-600">{item.property_full_name || '-'}</td>
                                  <td className="px-2 py-1 text-slate-600">{item.vendor_name || '-'}</td>
                                  <td className="px-2 py-1 text-slate-600">
                                    {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString('en-IN') : '-'}
                                  </td>
                                  <td className="px-2 py-1 text-right text-slate-700">₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                                  <td className="px-2 py-1">
                                    <span
                                      className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                                      style={{ background: st.bg, color: st.text }}
                                    >
                                      {item.asset_status || 'available'}
                                    </span>
                                  </td>
                                  <td className="px-2 py-1 text-right">
                                    <div className="flex justify-end gap-0.5">
                                      <button
                                        title="View"
                                        className="w-6 h-6 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center transition-colors"
                                        onClick={(e) => { e.stopPropagation(); setViewItem(item); }}
                                      >
                                        <Eye size={12} />
                                      </button>
                                     {can('delete_assets') && (
  <button
    title="Delete"
    className="w-6 h-6 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors"
    onClick={(e) => { e.stopPropagation(); handleDeleteAsset(item.id); }}
  >
    <Trash2 size={12} />
  </button>
)}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })
        )}
      </tbody>
    </table>
  </div>
</div>

            {/* ── Footer: pagination (client-side) ── */}
            {!loading && totalGroups > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 bg-white border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Show</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(val) => {
                      const newSize = val === "All" ? "All" : Number(val);
                      setPageSize(newSize as any);
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
                    Showing {paginatedGroups.length > 0 ? ((currentPage - 1) * (pageSize === "All" ? totalGroups : pageSize)) + 1 : 0}–
                    {Math.min(
                      (pageSize === "All" ? totalGroups : currentPage * pageSize),
                      totalGroups
                    )} of {totalGroups}
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

        {/* ── FILTER SIDEBAR (dropdowns) ── */}
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
              {hasFilters && (
                <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasFilters && (
                <button onClick={clearFilters} className="text-[10px] text-blue-200 hover:text-white font-semibold transition-colors">
                  Clear all
                </button>
              )}
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
<div className="flex-1 overflow-y-auto p-4">
  <div className="grid grid-cols-2 gap-3">
    {/* Stock Status */}
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
        <TrendingDown className="h-3 w-3 text-orange-500" /> Stock Status
      </p>
      <Select value={draftStockFilter} onValueChange={(val) => setDraftStockFilter(val as StockFilter)}>
        <SelectTrigger className="w-full h-8 text-xs border-gray-200">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Items</SelectItem>
          <SelectItem value="low_stock">Low Stock</SelectItem>
          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Category */}
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
        <Package className="h-3 w-3 text-blue-500" /> Category
      </p>
      <Select value={draftCategoryFilter} onValueChange={(val) => setDraftCategoryFilter(val)}>
        <SelectTrigger className="w-full h-8 text-xs border-gray-200">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {inventoryMappings.map(m => (
            <SelectItem key={m.category_id} value={m.category_name}>{m.category_name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Property */}
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
        <Building className="h-3 w-3 text-indigo-500" /> Property
      </p>
      <Select value={draftPropertyFilter} onValueChange={(val) => setDraftPropertyFilter(val)}>
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

    {/* Asset Status */}
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
        <AlertCircle className="h-3 w-3 text-purple-500" /> Asset Status
      </p>
    <Select value={draftAssetStatusFilter} onValueChange={(val) => setDraftAssetStatusFilter(val)}>
  <SelectTrigger className="w-full h-8 text-xs border-gray-200">
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Status</SelectItem>
    <SelectItem value="available">Available</SelectItem>
    <SelectItem value="assigned">Assigned</SelectItem>
    <SelectItem value="missing">Missing</SelectItem>
    <SelectItem value="damaged">Damaged</SelectItem>
  </SelectContent>
</Select>
    </div>

    {/* Vendor */}
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
        <Users className="h-3 w-3 text-cyan-500" /> Vendor
      </p>
      <Select value={draftVendorFilter} onValueChange={(val) => setDraftVendorFilter(val)}>
        <SelectTrigger className="w-full h-8 text-xs border-gray-200">
          <SelectValue placeholder="Select vendor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Vendors</SelectItem>
          {[...new Set(allItems.map(item => item.vendor_name).filter(Boolean))].map(v => (
            <SelectItem key={v} value={v}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Date Range (purchase date) – spans both columns */}
    <div className="col-span-2">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
        <Calendar className="h-3 w-3 text-rose-500" /> Purchase Date
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-gray-500 block mb-0.5">From</label>
          <Input
            type="date"
            value={draftDateFrom}
            onChange={(e) => setDraftDateFrom(e.target.value)}
            className="h-7 text-[10px]"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-500 block mb-0.5">To</label>
          <Input
            type="date"
            value={draftDateTo}
            onChange={(e) => setDraftDateTo(e.target.value)}
            className="h-7 text-[10px]"
          />
        </div>
      </div>
    </div>
  </div>
</div>

         <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
  <button
    onClick={() => {
      clearFilters();
      setDraftStockFilter('all');
      setDraftCategoryFilter('all');
      setDraftPropertyFilter('all');
      setDraftAssetStatusFilter('all');
      setDraftVendorFilter('all');
      setDraftDateFrom('');
      setDraftDateTo('');
    }}
    disabled={!hasFilters}
    className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
  >
    Clear All
  </button>
  <button
    onClick={() => {
      setStockFilter(draftStockFilter);
      setCategoryFilter(draftCategoryFilter);
      setPropertyFilter(draftPropertyFilter);
      setAssetStatusFilter(draftAssetStatusFilter);
      setVendorFilter(draftVendorFilter);
      setDateFrom(draftDateFrom);
      setDateTo(draftDateTo);
      setSidebarOpen(false);
    }}
    className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors"
  >
    Apply & Close
  </button>
</div>
        </aside>
      </div>

      {/* ══ VIEW MODAL (individual asset) ══ (unchanged) */}
      {viewItem && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">
            <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-3.5 py-2">
              <div>
                <h2 className="flex items-center gap-1.5 text-sm font-bold leading-tight text-white">
                  <Eye className="h-3.5 w-3.5" /> Asset Details
                </h2>
                <p className="text-[10px] leading-tight text-blue-100">
                  {viewItem.item_name} • {viewItem.asset_id || '-'}
                </p>
              </div>
              <button
                onClick={() => setViewItem(null)}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
              >
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2">
              <div className="mb-2 rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
                <div className="mb-1.5 flex items-center gap-1 border-b border-slate-50 pb-1">
                  <Package className="h-3 w-3 flex-shrink-0 text-blue-500" />
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-600">Overview</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Asset ID</div>
                    <div className="mt-0.5 text-[11px] font-mono text-blue-700">{viewItem.asset_id || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Item Name</div>
                    <div className="mt-0.5 text-[11px] font-medium text-slate-700">{viewItem.item_name}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Category</div>
                    <div className="mt-0.5 text-[11px] font-medium text-slate-700">{viewItem.category_name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Property</div>
                    <div className="mt-0.5 text-[11px] font-medium text-slate-700">{viewItem.property_full_name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Vendor</div>
                    <div className="mt-0.5 text-[11px] font-medium text-slate-700">{viewItem.vendor_name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Purchase Date</div>
                    <div className="mt-0.5 text-[11px] font-medium text-slate-700">
                      {viewItem.purchase_date ? new Date(viewItem.purchase_date).toLocaleDateString('en-IN') : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Status</div>
                    {(() => {
                      const st = statusBadgeStyle(viewItem.asset_status);
                      return (
                        <span className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: st.bg, color: st.text }}>
                          {viewItem.asset_status || 'available'}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="mb-2 rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
                <div className="mb-1.5 flex items-center gap-1 border-b border-slate-50 pb-1">
                  <IndianRupee className="h-3 w-3 flex-shrink-0 text-green-500" />
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-600">Stock & Price</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-md bg-blue-50 p-2">
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-blue-600">Quantity</div>
                    <div className="mt-0.5 text-[13px] font-extrabold text-blue-800">{viewItem.quantity}</div>
                  </div>
                  <div className="rounded-md bg-emerald-50 p-2">
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-emerald-600">Unit Price</div>
                    <div className="mt-0.5 text-[13px] font-extrabold text-emerald-700">
                      ₹{Number(viewItem.unit_price).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="rounded-md bg-amber-50 p-2">
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-amber-600">Total Value</div>
                    <div className="mt-0.5 text-[13px] font-extrabold text-amber-700">
                      ₹{Number(viewItem.quantity * viewItem.unit_price).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500">
                  Min Stock Level: <span className="font-semibold text-slate-700">{viewItem.min_stock_level}</span>
                </div>
              </div>

              {viewItem.notes && (
                <div className="mb-2 rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
                  <div className="mb-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">Notes</div>
                  <div className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700">
                    {viewItem.notes}
                  </div>
                </div>
              )}

              <div className="text-[9px] text-slate-400">
                Created: {new Date(viewItem.created_at).toLocaleString('en-IN')} • Updated: {new Date(viewItem.updated_at).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="flex flex-shrink-0 gap-2 border-t border-slate-100 px-3 py-2">
              {can('edit_assets') && (
                <button
                  onClick={() => { openEdit(viewItem); setViewItem(null); }}
                  className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              )}
              <button
                onClick={() => setViewItem(null)}
                className="h-8 flex-[2] rounded-lg bg-gradient-to-r from-[#0A1F5C] to-[#1E4ED8] text-[11px] font-bold text-white hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ VIEW GROUP MODAL ══ */}
   {/* ══ VIEW GROUP MODAL (with print) ══ */}
{viewGroup && (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm">
    <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">

      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-3.5 py-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-bold leading-tight text-white">
            <Package className="h-3.5 w-3.5" />
            Group Summary
          </h2>
          <p className="text-[10px] leading-tight text-blue-100">
            {viewGroup.item_name} • {viewGroup.assets.length} assets
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5">
  {/* Print button */}
  <button
    onClick={() => printGroupSummary(viewGroup)}
    title="Print"
    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
  >
    <Printer className="h-3.5 w-3.5 text-white" />
  </button>

  {/* Share button with popup */}
  <div className="relative">
    <button
      onClick={() => setShowSharePopup(!showSharePopup)}
      title="Share"
      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
    >
      <Share2 className="h-3.5 w-3.5 text-white" />
    </button>

    {showSharePopup && (
      <div className="absolute top-full right-0 mt-1.5 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-48">
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
            <p className="text-[9px] text-gray-400">Share via WhatsApp</p>
          </div>
        </button>

        {/* Email */}
        <button
          onClick={() => { handleShareEmail(); setShowSharePopup(false); }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left border-t border-gray-100"
        >
          <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Mail className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-800">Email</p>
            <p className="text-[9px] text-gray-400">Send via email</p>
          </div>
        </button>

        {/* SMS */}
        <button
          onClick={() => { handleShareSMS(); setShowSharePopup(false); }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-yellow-50 transition-colors text-left border-t border-gray-100"
        >
          <div className="h-7 w-7 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
            <Smartphone className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-800">SMS</p>
            <p className="text-[9px] text-gray-400">Send via text message</p>
          </div>
        </button>

        {/* Copy Link */}
        <button
          onClick={() => { handleCopyLink(); setShowSharePopup(false); }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-100 transition-colors text-left border-t border-gray-100"
        >
          <div className="h-7 w-7 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
            <Copy className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-800">Copy Link</p>
            <p className="text-[9px] text-gray-400">Copy URL to clipboard</p>
          </div>
        </button>
      </div>
    )}
  </div>


</div>
          <button
            onClick={() => setViewGroup(null)}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
          >
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div id="group-print-area" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden">
          {/* Watermark */}
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
  <span
    className="font-black leading-none whitespace-nowrap"
    style={{
      fontSize: "min(10vw, 56px)",
      letterSpacing: "0.02em",
      color: "rgba(100, 116, 139, 0.09)",
      transform: "rotate(-30deg)",
    }}
  >
    {siteSettings.siteName?.split(" ")[0]}
  </span>
</div> 

          {/* Header with logo */}
          <div className="flex items-center border-b border-slate-200 pb-3 mb-3 relative z-10">
            <div className="w-28 flex-shrink-0">
              {siteSettings.logo && (
                <img
                  src={siteSettings.logo}
                  alt={siteSettings.siteName}
                  className="h-16 w-auto object-contain"
                  onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                />
              )}
            </div>
            <div className="flex-1 text-center">
              <h2 className="text-lg font-bold text-slate-800">{siteSettings.siteName}</h2>
              <p className="text-sm font-semibold text-slate-700">Asset Group Summary</p>
            </div>
            <div className="w-28 text-right text-[10px] text-slate-400">
              <span className="block font-semibold text-slate-600">Group ID</span>
              <span>G-{String(viewGroup.assets[0]?.id || '0001').slice(0,6)}</span>
            </div>
          </div>

          {/* Meta bar */}
          <div className="flex justify-between border-b border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-500 mb-3 relative z-10">
            <div>
              <span className="uppercase text-[9px] font-semibold">Item</span>
              <span className="block font-bold text-slate-800">{viewGroup.item_name}</span>
            </div>
            <div>
              <span className="uppercase text-[9px] font-semibold">Category</span>
              <span className="block font-bold text-slate-800">{viewGroup.category_name || '—'}</span>
            </div>
            <div>
              <span className="uppercase text-[9px] font-semibold">Property</span>
              <span className="block font-bold text-slate-800">{viewGroup.property_full_name || '—'}</span>
            </div>
            <div className="text-right">
              <span className="uppercase text-[9px] font-semibold">Total Assets</span>
              <span className="block font-bold text-slate-800">{viewGroup.assets.length}</span>
            </div>
          </div>

          {/* Assets table */}
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">All Assets in Group</p>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">#</th>
                  <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Asset ID</th>
                  <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Item</th>
                  <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Category</th>
                  <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Property</th>
                  <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Vendor</th>
                  <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Purchase Date</th>
                  <th className="border border-slate-300 px-2 py-1 text-right font-semibold text-slate-600">Unit Price</th>
                  <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {viewGroup.assets.map((item: InventoryItem, idx: number) => {
                  const st = statusBadgeStyle(item.asset_status);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-2 py-1 text-center text-slate-500">{idx + 1}</td>
                      <td className="border border-slate-300 px-2 py-1 font-mono text-blue-700">{item.asset_id || '-'}</td>
                      <td className="border border-slate-300 px-2 py-1 font-medium text-slate-700">{item.item_name}</td>
                      <td className="border border-slate-300 px-2 py-1 text-slate-600">{item.category_name || '-'}</td>
                      <td className="border border-slate-300 px-2 py-1 text-slate-600">{item.property_full_name || '-'}</td>
                      <td className="border border-slate-300 px-2 py-1 text-slate-600">{item.vendor_name || '-'}</td>
                      <td className="border border-slate-300 px-2 py-1 text-slate-600">
                        {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="border border-slate-300 px-2 py-1 text-right text-slate-700">₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                      <td className="border border-slate-300 px-2 py-1">
                        <span
                          className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                          style={{ background: st.bg, color: st.text }}
                        >
                          {item.asset_status || 'available'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50 font-bold">
                  <td colSpan={7} className="border border-slate-300 px-2 py-1 text-right text-blue-700">Total Assets</td>
                  <td className="border border-slate-300 px-2 py-1 text-right text-blue-700">{viewGroup.assets.length}</td>
                  <td className="border border-slate-300 px-2 py-1"></td>
                </tr>
                <tr className="bg-amber-50 font-bold">
                  <td colSpan={7} className="border border-slate-300 px-2 py-1 text-right text-amber-700">Total Quantity</td>
                  <td className="border border-slate-300 px-2 py-1 text-right text-amber-700">{viewGroup.total_quantity}</td>
                  <td className="border border-slate-300 px-2 py-1"></td>
                </tr>
                <tr className="bg-emerald-50 font-bold">
                  <td colSpan={7} className="border border-slate-300 px-2 py-1 text-right text-emerald-700">Total Value</td>
                  <td className="border border-slate-300 px-2 py-1 text-right text-emerald-700">₹{Number(viewGroup.total_value).toLocaleString('en-IN')}</td>
                  <td className="border border-slate-300 px-2 py-1"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-shrink-0 gap-2 border-t border-slate-100 px-3 py-2">
        <button
          onClick={() => setViewGroup(null)}
          className="h-8 flex-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
        >
          Close
        </button>
        <button
          onClick={() => printGroupSummary(viewGroup)}
          className="h-8 flex-[2] rounded-lg bg-blue-800 text-[11px] font-bold text-white hover:opacity-90 flex items-center justify-center gap-1"
        >
          <Printer className="h-3.5 w-3.5" /> Print 
        </button>
      </div>
    </div>
  </div>
)}

      {/* ══ Add / Edit Dialog (unchanged) ══ */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
        <DialogContent className="max-w-xl w-[95vw] max-h-[90vh] overflow-hidden p-0 rounded-2xl">
          <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]  text-white px-2 py-2 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">{editingItem ? 'Edit Item' : 'Add Inventory Item'}</h2>
              <p className="text-xs text-blue-100">Fill in the details below</p>
            </div>
            <DialogClose asChild>
              <button className="p-1.5 rounded-full hover:bg-white/20 transition">
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>

          <div className="p-2 -mt-2 overflow-y-auto max-h-[75vh] space-y-5">
            <div>
              <SH icon={<Package className="h-3 w-3" />} title="Item Info" />
              <div className="grid grid-cols-3 gap-x-3 gap-y-2.5">
                <div>
                  <label className={L}>Category <span className="text-red-400">*</span></label>
             <Select
  value={formData.category_id}
  open={categorySelectOpen}
  onOpenChange={setCategorySelectOpen}
  onValueChange={(v) => {
    const selected = inventoryMappings.find((m) => m.category_id === v);
    setFormData((prev) => ({
      ...prev,
      category_id: v,
      category_name: selected?.category_name || '',
      item_name: '',
    }));
    setItemSearchTerm('');
  }}
>
  <SelectTrigger className={F}>
    <SelectValue placeholder="Select category" />
  </SelectTrigger>
 <SelectContent
  position="popper"
  sideOffset={4}
  className="max-h-[300px] w-[var(--radix-select-trigger-width)]"
>
    <div className="sticky top-0 bg-white p-2 border-b z-10">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <Input
          ref={categorySearchRef}
          placeholder="Search category..."
          className="pl-7 h-7 text-xs"
          value={categorySearchTerm}
          onChange={(e) => setCategorySearchTerm(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
    <div className="py-1">
      {inventoryMappings
        .filter((m) => m.category_name.toLowerCase().includes(categorySearchTerm.toLowerCase()))
        .map((m) => (
          <SelectItem key={m.category_id} value={m.category_id} className={SI}>
            {m.category_name}
          </SelectItem>
        ))}
      {inventoryMappings.filter((m) => m.category_name.toLowerCase().includes(categorySearchTerm.toLowerCase())).length === 0 && (
        <div className="px-2 py-3 text-center">
          <p className="text-xs text-gray-400">No categories found</p>
        </div>
      )}
    </div>
  </SelectContent>
</Select>
                </div>

                <div>
                  <label className={L}>Item Name <span className="text-red-400">*</span></label>
                  {(() => {
                    const selectedCategory = inventoryMappings.find((m) => m.category_id === formData.category_id);
                    const subcategories = selectedCategory?.subcategories || [];
                    if (subcategories.length > 0) {
                     return (
 <Select
  value={formData.item_name}
  open={itemSelectOpen}
  onOpenChange={setItemSelectOpen}
  onValueChange={(v) => {
    setFormData((prev) => ({ ...prev, item_name: v }));
    setItemSearchTerm('');
  }}
>
    <SelectTrigger className={F}>
      <SelectValue placeholder="Select item" />
    </SelectTrigger>
 <SelectContent
  position="popper"
  sideOffset={4}
  className="max-h-[300px] w-[var(--radix-select-trigger-width)]"
>
      <div className="sticky top-0 bg-white p-2 border-b z-10">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            ref={itemSearchRef}
            placeholder="Search item..."
            className="pl-7 h-7 text-xs"
            value={itemSearchTerm}
            onChange={(e) => setItemSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      <div className="py-1">
        {subcategories
          .filter((s) => s.subcategory_name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
          .map((s) => (
            <SelectItem key={s.subcategory_id} value={s.subcategory_name} className={SI}>
              {s.subcategory_name}
            </SelectItem>
          ))}
        {subcategories.filter((s) => s.subcategory_name.toLowerCase().includes(itemSearchTerm.toLowerCase())).length === 0 && (
          <div className="px-2 py-3 text-center">
            <p className="text-xs text-gray-400">No items found</p>
          </div>
        )}
      </div>
    </SelectContent>
  </Select>
);
                    }
                    return (
                      <Input
                        className={F}
                        placeholder="Enter item name"
                        value={formData.item_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, item_name: e.target.value }))}
                      />
                    );
                  })()}
                </div>

                <div className="col-span-1">
                  <label className={L}>Property <span className="text-red-400">*</span></label>
                 <Select
  value={formData.property_id}
  open={propertySelectOpen}
  onOpenChange={setPropertySelectOpen}
  onValueChange={(v) => {
    const selected = properties.find((p) => String(p.id) === v);
    setFormData((prev) => ({ ...prev, property_id: v, property_name: selected?.name || '' }));
    setPropertySearchTerm('');
  }}
>
                    <SelectTrigger className={F}>
                      <Building className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
<SelectContent
  position="popper"
  sideOffset={4}
  align="end"
  className="max-h-[300px] w-[var(--radix-select-trigger-width)]"
>
                      <div className="sticky top-0 bg-white p-2 border-b z-10">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
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
                      <div className="py-1">
                        {properties
                          .filter((p) => p.name.toLowerCase().includes(propertySearchTerm.toLowerCase()))
                          .map((p) => (
                            <SelectItem key={p.id} value={String(p.id)} className={SI}>
                              {p.name}
                            </SelectItem>
                          ))}
                        {properties.filter((p) => p.name.toLowerCase().includes(propertySearchTerm.toLowerCase())).length === 0 && (
                          <div className="px-2 py-3 text-center">
                            <p className="text-xs text-gray-400">No properties found</p>
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <SH icon={<IndianRupee className="h-3 w-3" />} title="Stock & Price" color="text-green-600" />
              <div className="grid grid-cols-3 gap-x-3 gap-y-2.5">
                <div>
                  <label className={L}>Quantity <span className="text-red-400">*</span></label>
                  <Input type="number" min={0} className={F} placeholder="0"
                    value={formData.quantity}
                    onChange={e => setFormData(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className={L}>Unit Price (₹) <span className="text-red-400">*</span></label>
                  <Input type="number" min={0} step="0.01" className={F} placeholder="0.00"
                    value={formData.unit_price}
                    onChange={e => setFormData(p => ({ ...p, unit_price: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className={L}>Min Stock Level</label>
                  <Input type="number" min={0} className={F} placeholder="10"
                    value={formData.min_stock_level}
                    onChange={e => setFormData(p => ({ ...p, min_stock_level: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="col-span-3 bg-blue-50 rounded-md px-3 py-1.5 flex justify-between items-center">
                  <span className="text-[11px] text-blue-700 font-semibold">Total Value Preview</span>
                  <span className="text-[12px] font-bold text-blue-800">
                    ₹{(formData.quantity * formData.unit_price).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <SH icon={<StickyNote className="h-3 w-3" />} title="Notes" color="text-amber-600" />
              <Textarea
                className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-0 min-h-[56px] resize-none transition-colors"
                placeholder="Additional notes about this item…"
                rows={2}
                value={formData.notes}
                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              />
            </div>

           <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1 h-8 text-[11px] font-semibold border-gray-200 text-gray-600 hover:bg-gray-500  hover:text-gray-600 rounded-lg"
              >
                Close
              </Button>
              <Button
                disabled={submitting}
                onClick={handleSubmit}
                className="flex-[2] h-8 text-[11px] font-semibold bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]  hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm"
              >
                {submitting ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
                ) : editingItem ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}