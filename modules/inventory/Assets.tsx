
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Package, Plus, Trash2, Search, Loader2, X, Download,
  Building, IndianRupee, StickyNote, RefreshCw, Filter,
  BarChart, AlertTriangle, TrendingDown, Boxes, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
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
}

interface MasterCategory { id: string; name: string; }
interface Property       { id: string; name: string; }

type StockFilter = 'all' | 'low_stock' | 'out_of_stock';

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

// ═══════════════════════════════════════════════════════════════════════════════
export function Assets() {
  const [items,        setItems]        = useState<InventoryItem[]>([]);
  const [categories,   setCategories]   = useState<MasterCategory[]>([]);
  const [properties,   setProperties]   = useState<Property[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editingItem,  setEditingItem]  = useState<InventoryItem | null>(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [purchasedItems, setPurchasedItems] = useState<{label: string, value: string}[]>([]);
const [itemSearchTerm, setItemSearchTerm] = useState('');
const [categorySearchTerm, setCategorySearchTerm] = useState('');
const [propertySearchTerm, setPropertySearchTerm] = useState('');
  const [stats, setStats] = useState({
    total_items: 0, total_quantity: 0, total_value: 0,
    low_stock_count: 0, out_of_stock_count: 0,
  });

  const [stockFilter,    setStockFilter]    = useState<StockFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');

  const [colSearch, setColSearch] = useState({
    item_name: '', category: '', property: '', quantity: '', unit_price: '', status: '',
  });

  const loadPurchasedItems = useCallback(async () => {
  try {
    const res = await getPurchases();
    const allItems: {label: string, value: string}[] = [];
    
    (res.data || []).forEach(purchase => {
      // Try all possible sources for items
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
          allItems.push({
            label: item.item_name,   // ← Just item name, no invoice
            value: item.item_name
          });
        }
      });
    });
    
    // Remove duplicates by value
    const unique = allItems.filter((v, i, a) => 
      a.findIndex(t => t.value === v.value) === i
    );
    
    console.log('Loaded purchased items:', unique); // ← Check console
    setPurchasedItems(unique);
  } catch (err) {
    console.error('Could not load purchased items:', err);
  }
}, []);
  const emptyForm = {
    item_name: '', category_id: '', category_name: '',
    property_id: '', property_name: '',
    quantity: 0, unit_price: 0, min_stock_level: 10, notes: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  // ── Loaders (UNCHANGED) ───────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, statsRes] = await Promise.all([
        getInventory({
          stock_status: stockFilter !== 'all' ? stockFilter as any : undefined,
          category_id:  categoryFilter !== 'all' ? categoryFilter : undefined,
          property_id:  propertyFilter !== 'all' ? propertyFilter : undefined,
        }),
        getInventoryStats(),
      ]);
      setItems(itemsRes.data || []);
      setStats(statsRes.data || stats);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [stockFilter, categoryFilter, propertyFilter]);

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

useEffect(() => { loadCategories(); loadProperties(); loadPurchasedItems(); }, []);
  useEffect(() => { loadAll(); }, [loadAll]);
  // ── Filtered items (UNCHANGED) ────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const cs = colSearch;
      const nameOk  = !cs.item_name || item.item_name?.toLowerCase().includes(cs.item_name.toLowerCase());
      const catOk   = !cs.category  || (item.category_name || '').toLowerCase().includes(cs.category.toLowerCase());
      const propOk  = !cs.property  || (item.property_full_name || '').toLowerCase().includes(cs.property.toLowerCase());
      const qtyOk   = !cs.quantity  || String(item.quantity).includes(cs.quantity);
      const priceOk = !cs.unit_price|| String(item.unit_price).includes(cs.unit_price);
      const isLow   = item.quantity <= item.min_stock_level && item.quantity > 0;
      const isOut   = item.quantity === 0;
      const statusLabel = isOut ? 'out' : isLow ? 'low' : 'ok';
      const stOk    = !cs.status || statusLabel.includes(cs.status.toLowerCase());
      return nameOk && catOk && propOk && qtyOk && priceOk && stOk;
    });
  }, [items, colSearch]);

  // ── CRUD (UNCHANGED) ──────────────────────────────────────────────────────
  const openAdd = () => { setEditingItem(null); setFormData(emptyForm); setShowForm(true); };
  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      item_name:       item.item_name,
      category_id:     String(item.category_id),
      property_id:     String(item.property_id),
      quantity:        item.quantity,
      unit_price:      item.unit_price,
      min_stock_level: item.min_stock_level,
      notes:           item.notes || '',
    });
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

 const handleDelete = async (id: string | number, invoiceNumber?: string) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete purchase "${invoiceNumber || id}". This action cannot be undone!`,
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
    setSubmitting(true);
    await deletePurchase(id);
    await loadAll();
    
    Swal.fire({
      title: 'Deleted!',
      text: 'Purchase has been deleted successfully.',
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
    console.error('Error deleting purchase:', err);
    Swal.fire({
      title: 'Error!',
      text: err.message || 'Failed to delete purchase',
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
  } finally {
    setSubmitting(false);
  }
};

  const handleExport = () => {
    const headers = ['Item Name', 'Category', 'Property', 'Quantity', 'Unit Price', 'Total Value', 'Min Stock', 'Status'];
    const rows = filteredItems.map(i => {
      const isLow = i.quantity <= i.min_stock_level && i.quantity > 0;
      const isOut = i.quantity === 0;
      return [
        i.item_name, i.category_name || '', i.property_full_name || '',
        i.quantity, i.unit_price, i.quantity * i.unit_price, i.min_stock_level,
        isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'OK',
      ];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  const stockBadge = (item: InventoryItem) => {
    if (item.quantity === 0)
      return <Badge className="bg-red-100 text-red-700 text-[9px] px-1.5">Out</Badge>;
    if (item.quantity <= item.min_stock_level)
      return <Badge className="bg-orange-100 text-orange-700 text-[9px] px-1.5">Low</Badge>;
    return <Badge className="bg-green-100 text-green-700 text-[9px] px-1.5">OK</Badge>;
  };

  const hasColSearch = Object.values(colSearch).some(v => v !== '');
  const hasFilters   = stockFilter !== 'all' || categoryFilter !== 'all' || propertyFilter !== 'all';
  const activeFilterCount = [
    stockFilter !== 'all',
    categoryFilter !== 'all',
    propertyFilter !== 'all',
  ].filter(Boolean).length;

  const clearFilters   = () => { setStockFilter('all'); setCategoryFilter('all'); setPropertyFilter('all'); };
  const clearColSearch = () => setColSearch({ item_name:'', category:'', property:'', quantity:'', unit_price:'', status:'' });

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── HEADER — fully responsive ────────────────────────────────────── */}
      <div className="sticky top-0 z-20  ">

        {/* Top row: title + actions */}
        <div className="px-3 sm:px-5 pt-3 pb-2 flex items-end justify-end gap-2">

          {/* Title */}
          {/* <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-gray-800 leading-tight truncate">
              Inventory Assets
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
              Manage all inventory items
            </p>
          </div> */}

          {/* Action buttons — icon-only on mobile, icon+label on sm+ */}
          <div className="flex items-end justify-end gap-1.5 flex-shrink-0">

            {/* Filter */}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className={`
                inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors
                ${sidebarOpen || hasFilters
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
              `}
            >
              <Filter className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className={`
                  h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0
                  ${sidebarOpen || hasFilters ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}
                `}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium transition-colors"
            >
              <Download className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Refresh */}
            <button
              onClick={loadAll}
              disabled={loading}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Add Item */}
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">Add Item</span>
            </button>
          </div>
        </div>

        {/* Stats row — scrollable on xs, grid on sm+ */}
        <div className="px-3 sm:px-5 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <StatCard title="Total Items"  value={stats.total_items}
              icon={Boxes}         color="bg-blue-600"   bg="bg-gradient-to-br from-blue-50 to-blue-100" />
            <StatCard title="Total Value"  value={`₹${Number(stats.total_value || 0).toLocaleString('en-IN')}`}
              icon={IndianRupee}   color="bg-green-600"  bg="bg-gradient-to-br from-green-50 to-green-100" />
            <StatCard title="Low Stock"    value={stats.low_stock_count}
              icon={TrendingDown}  color="bg-orange-600" bg="bg-gradient-to-br from-orange-50 to-orange-100" />
            <StatCard title="Out of Stock" value={stats.out_of_stock_count}
              icon={AlertTriangle} color="bg-red-600"    bg="bg-gradient-to-br from-red-50 to-red-100" />
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="relative">

        {/* Table area */}
        <main className="p-3 sm:p-4">
          <Card className="border rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
              <span className="text-sm font-semibold text-gray-700">
                All Items ({filteredItems.length})
              </span>
              {hasColSearch && (
                <button onClick={clearColSearch} className="text-[10px] text-blue-600 font-semibold">
                  Clear Search
                </button>
              )}
            </div>

            <div className="overflow-auto max-h-[calc(100vh-320px)]">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50">
                    <TableRow>
                      <TableHead className="py-2 px-3 text-xs">Item Name</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Category</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Property</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Qty</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Unit Price</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Total Value</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Status</TableHead>
                      <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
                    </TableRow>

                    {/* Column search */}
                    <TableRow className="bg-gray-50/80">
                      {[
                        { key: 'item_name',  ph: 'Search name…' },
                        { key: 'category',   ph: 'Search cat…' },
                        { key: 'property',   ph: 'Search prop…' },
                        { key: 'quantity',   ph: 'Qty…' },
                        { key: 'unit_price', ph: 'Price…' },
                        { key: null,         ph: '' },
                        { key: 'status',     ph: 'ok/low/out' },
                      ].map((col, idx) => (
                        <TableCell key={idx} className="py-1 px-2">
                          {col.key ? (
                            <Input placeholder={col.ph}
                              value={colSearch[col.key as keyof typeof colSearch]}
                              onChange={e => setColSearch(prev => ({ ...prev, [col.key!]: e.target.value }))}
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
                          <p className="text-xs text-gray-500">Loading inventory…</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500">No items found</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.map(item => {
                      const total = item.quantity * item.unit_price;
                      return (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell className="py-2 px-3 text-xs font-medium">{item.item_name}</TableCell>
                          <TableCell className="py-2 px-3 text-xs text-gray-600">{item.category_name || '-'}</TableCell>
                          <TableCell className="py-2 px-3 text-xs text-gray-600 max-w-[160px] truncate">
                            {item.property_full_name || '-'}
                          </TableCell>
                          <TableCell className="py-2 px-3 text-xs font-semibold">
                            <span className={
                              item.quantity === 0 ? 'text-red-600' :
                              item.quantity <= item.min_stock_level ? 'text-orange-600' : 'text-gray-800'
                            }>
                              {item.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="py-2 px-3 text-xs">
                            ₹{Number(item.unit_price).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="py-2 px-3 text-xs font-semibold text-gray-800">
                            ₹{total.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="py-2 px-3">{stockBadge(item)}</TableCell>
                          <TableCell className="py-2 px-3">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                                onClick={() => openEdit(item)} title="Edit">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Button>
                              <Button size="sm" variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleDelete(item.id)} title="Delete">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </main>

        {/* ── RIGHT-SIDE SLIDE-IN FILTER DRAWER ──────────────────────────── */}

        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Drawer panel */}
        <aside
          className={`
            fixed top-0 right-0 h-full z-40 w-72 sm:w-80
            bg-white shadow-2xl flex flex-col
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          {/* Drawer header */}
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
                <button
                  onClick={clearFilters}
                  className="text-[10px] text-blue-200 hover:text-white font-semibold transition-colors"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Drawer content — scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {/* ── Stock Status ─────────────────────────────────────────── */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <TrendingDown className="h-3 w-3 text-orange-500" /> Stock Status
              </p>
              <div className="space-y-1">
                {([
                  { val: 'all',          label: 'All Items',     dot: 'bg-gray-400' },
                  { val: 'low_stock',    label: 'Low Stock',     dot: 'bg-orange-500' },
                  { val: 'out_of_stock', label: 'Out of Stock',  dot: 'bg-red-500' },
                ] as { val: StockFilter; label: string; dot: string }[]).map(opt => (
                  <label key={opt.val}
                    className={`
                      flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                      ${stockFilter === opt.val
                        ? 'bg-blue-50 border border-blue-200 text-blue-700'
                        : 'hover:bg-gray-50 border border-transparent text-gray-700'}
                    `}
                  >
                    <input type="radio" name="stock" value={opt.val}
                      checked={stockFilter === opt.val}
                      onChange={() => setStockFilter(opt.val)}
                      className="sr-only"
                    />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${opt.dot}`} />
                    <span className="text-[12px] font-medium">{opt.label}</span>
                    {stockFilter === opt.val && (
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

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* ── Category ─────────────────────────────────────────────── */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Package className="h-3 w-3 text-blue-500" /> Category
              </p>
              <div className="space-y-1">
                {[{ id: 'all', name: 'All Categories' }, ...categories].map(c => (
                  <label key={c.id}
                    className={`
                      flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                      ${categoryFilter === c.id
                        ? 'bg-blue-50 border border-blue-200 text-blue-700'
                        : 'hover:bg-gray-50 border border-transparent text-gray-700'}
                    `}
                  >
                    <input type="radio" name="cat" value={c.id}
                      checked={categoryFilter === c.id}
                      onChange={() => setCategoryFilter(c.id)}
                      className="sr-only"
                    />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${categoryFilter === c.id ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <span className="text-[12px] font-medium truncate">{c.name}</span>
                    {categoryFilter === c.id && (
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

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* ── Property ─────────────────────────────────────────────── */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Building className="h-3 w-3 text-indigo-500" /> Property
              </p>
              <div className="space-y-1">
                {[{ id: 'all', name: 'All Properties' }, ...properties].map(p => (
                  <label key={p.id}
                    className={`
                      flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                      ${propertyFilter === p.id
                        ? 'bg-blue-50 border border-blue-200 text-blue-700'
                        : 'hover:bg-gray-50 border border-transparent text-gray-700'}
                    `}
                  >
                    <input type="radio" name="prop" value={p.id}
                      checked={propertyFilter === p.id}
                      onChange={() => setPropertyFilter(p.id)}
                      className="sr-only"
                    />
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

          {/* Drawer footer */}
          <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
            <button
              onClick={clearFilters}
              disabled={!hasFilters}
              className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Clear All
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors"
            >
              Apply & Close
            </button>
          </div>
        </aside>
      </div>

      {/* ══ Add / Edit Dialog (unchanged logic) ══════════════════════════════ */}
    {/* ══ Add / Edit Dialog (unchanged logic) ══════════════════════════════ */}
<Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
  <DialogContent className="max-w-xl w-[95vw] max-h-[90vh] overflow-hidden p-0">

    <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
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

    <div className="p-4 overflow-y-auto max-h-[75vh] space-y-5">

      <div>
        <SH icon={<Package className="h-3 w-3" />} title="Item Info" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">

          {/* Searchable Item Name Dropdown */}
          <div className="col-span-2">
            <label className={L}>Item Name <span className="text-red-400">*</span></label>
            <Select 
              value={formData.item_name}
              onValueChange={v => {
                setFormData(p => ({ ...p, item_name: v }));
                setItemSearchTerm('');
              }}
            >
              <SelectTrigger className={F}>
                <SelectValue placeholder="Select purchased item" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <div className="sticky top-0 bg-white p-2 border-b z-10">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      placeholder="Search items..."
                      className="pl-7 h-7 text-xs"
                      value={itemSearchTerm}
                      onChange={(e) => setItemSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="py-1">
                  {purchasedItems
                    .filter(item => item.label.toLowerCase().includes(itemSearchTerm.toLowerCase()))
                    .map((item, idx) => (
                      <SelectItem key={idx} value={item.value} className={SI}>
                        {item.label}
                      </SelectItem>
                    ))}
                  {purchasedItems.filter(item => 
                    item.label.toLowerCase().includes(itemSearchTerm.toLowerCase())
                  ).length === 0 && (
                    <div className="px-2 py-3 text-center">
                      <p className="text-xs text-gray-400">No items found</p>
                    </div>
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Searchable Category Dropdown */}
          <div>
            <label className={L}>Category <span className="text-red-400">*</span></label>
            <Select 
              value={formData.category_id}
              onValueChange={v => {
                const selected = categories.find(c => String(c.id) === v);
                setFormData(p => ({ ...p, category_id: v, category_name: selected?.name || '' }));
                setCategorySearchTerm('');
              }}
            >
              <SelectTrigger className={F}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <div className="sticky top-0 bg-white p-2 border-b z-10">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      placeholder="Search categories..."
                      className="pl-7 h-7 text-xs"
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="py-1">
                  {categories.length > 0 ? (
                    categories
                      .filter(c => c.name.toLowerCase().includes(categorySearchTerm.toLowerCase()))
                      .map(c => (
                        <SelectItem key={c.id} value={String(c.id)} className={SI}>
                          {c.name}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="__none__" disabled className={SI}>
                      No categories — add values to "Category" in Masters &gt; Properties
                    </SelectItem>
                  )}
                  {categories.length > 0 && categories.filter(c => 
                    c.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
                  ).length === 0 && (
                    <div className="px-2 py-3 text-center">
                      <p className="text-xs text-gray-400">No categories found</p>
                    </div>
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Searchable Property Dropdown */}
          <div>
            <label className={L}>Property <span className="text-red-400">*</span></label>
            <Select 
              value={formData.property_id}
              onValueChange={v => {
                const selected = properties.find(p => String(p.id) === v);
                setFormData(p => ({ ...p, property_id: v, property_name: selected?.name || '' }));
                setPropertySearchTerm('');
              }}
            >
              <SelectTrigger className={F}>
                <Building className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <div className="sticky top-0 bg-white p-2 border-b z-10">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      placeholder="Search properties..."
                      className="pl-7 h-7 text-xs"
                      value={propertySearchTerm}
                      onChange={(e) => setPropertySearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="py-1">
                  {properties
                    .filter(p => p.name.toLowerCase().includes(propertySearchTerm.toLowerCase()))
                    .map(p => (
                      <SelectItem key={p.id} value={String(p.id)} className={SI}>
                        {p.name}
                      </SelectItem>
                    ))}
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

      <Button
        disabled={submitting}
        onClick={handleSubmit}
        className="w-full h-8 text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm"
      >
        {submitting ? (
          <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
        ) : editingItem ? 'Update Item' : 'Add Item'}
      </Button>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}