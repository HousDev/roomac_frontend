

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus, Trash2, Search, Loader2, X, Download,
  Filter, ChevronDown, ChevronUp, AlertTriangle,
  Scale, IndianRupee, Gavel, RefreshCw, Edit,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { penaltyRulesApi } from "@/lib/penaltyRulesApi";
import { getMasterItemsByTab, getMasterValues } from "@/lib/masterApi";
import Swal from 'sweetalert2';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PenaltyRule {
  id: string;
  item_category: string;
  from_condition: string;
  to_condition: string;
  penalty_amount: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface MasterCategory {
  id: string;
  name: string;
  value?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CONDITIONS = ['New', 'Good', 'Used', 'Damaged', 'Missing'];
const CONDITION_COLORS = {
  New: 'bg-green-100 text-green-700 border-green-200',
  Good: 'bg-blue-100 text-blue-700 border-blue-200',
  Used: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Damaged: 'bg-orange-100 text-orange-700 border-orange-200',
  Missing: 'bg-red-100 text-red-700 border-red-200',
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

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
export function PenaltyRules() {
  const [rules, setRules] = useState<PenaltyRule[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PenaltyRule | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [colSearch, setColSearch] = useState({
    item_category: '',
    from_condition: '',
    to_condition: '',
    penalty_amount: '',
    description: '',
  });

  const [stats, setStats] = useState({
    total_rules: 0,
    max_penalty: 0,
    min_penalty: 0,
    avg_penalty: 0,
    categories_count: 0,
  });

  const emptyForm = {
    item_category: '',
    from_condition: 'Good',
    to_condition: 'Damaged',
    penalty_amount: 0,
    description: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  // ── Load Categories from Master ───────────────────────────────────────────
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
          .map((v: any) => ({ 
            id: String(v.id), 
            name: v.value || v.name || '',
            value: v.value || v.name || ''
          }))
      );
    } catch (err) {
      console.error('Could not load categories:', err);
    }
  }, []);

  // ── Load Rules ────────────────────────────────────────────────────────────
  const loadRules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await penaltyRulesApi.getAll({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      });
      
      const rulesData = response.data || response;
      const rulesArray = Array.isArray(rulesData) ? rulesData : [];
      setRules(rulesArray);
      
      // Calculate stats
      if (rulesArray.length > 0) {
        const amounts = rulesArray.map(r => r.penalty_amount);
        setStats({
          total_rules: rulesArray.length,
          max_penalty: Math.max(...amounts),
          min_penalty: Math.min(...amounts),
          avg_penalty: Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length),
          categories_count: new Set(rulesArray.map(r => r.item_category)).size,
        });
      } else {
        setStats({
          total_rules: 0,
          max_penalty: 0,
          min_penalty: 0,
          avg_penalty: 0,
          categories_count: 0,
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load penalty rules');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  // ── Filtered Rules ────────────────────────────────────────────────────────
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const cs = colSearch;
      const catOk = !cs.item_category || 
        rule.item_category?.toLowerCase().includes(cs.item_category.toLowerCase());
      const fromOk = !cs.from_condition ||
        rule.from_condition?.toLowerCase().includes(cs.from_condition.toLowerCase());
      const toOk = !cs.to_condition ||
        rule.to_condition?.toLowerCase().includes(cs.to_condition.toLowerCase());
      const amountOk = !cs.penalty_amount ||
        String(rule.penalty_amount).includes(cs.penalty_amount);
      const descOk = !cs.description ||
        (rule.description || '').toLowerCase().includes(cs.description.toLowerCase());
      
      return catOk && fromOk && toOk && amountOk && descOk;
    });
  }, [rules, colSearch]);

  // ── CRUD Operations ───────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingRule(null);
    setFormData({
      ...emptyForm,
      item_category: categories.length > 0 ? categories[0].name : '',
    });
    setShowModal(true);
  };

  const openEdit = (rule: PenaltyRule) => {
    setEditingRule(rule);
    setFormData({
      item_category: rule.item_category || '',
      from_condition: rule.from_condition || 'Good',
      to_condition: rule.to_condition || 'Damaged',
      penalty_amount: rule.penalty_amount || 0,
      description: rule.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (rule: PenaltyRule) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete penalty rule for ${rule.item_category} from ${rule.from_condition} to ${rule.to_condition}?`,
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
      await penaltyRulesApi.delete(rule.id);
      await loadRules();
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Penalty rule has been deleted successfully.',
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
      toast.error(err.message || 'Failed to delete penalty rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async (rulesToDelete: PenaltyRule[]) => {
    if (rulesToDelete.length === 0) return;
    
    const result = await Swal.fire({
      title: 'Delete Multiple Rules?',
      text: `You are about to delete ${rulesToDelete.length} penalty rules. This cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      // Since bulk delete might not be supported, delete one by one
      await Promise.all(rulesToDelete.map(rule => penaltyRulesApi.delete(rule.id)));
      await loadRules();
      toast.success(`${rulesToDelete.length} rules deleted successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete rules');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.penalty_amount < 0) {
      toast.error('Penalty amount cannot be negative');
      return;
    }

    if (formData.from_condition === formData.to_condition) {
      toast.error('From condition and to condition cannot be the same');
      return;
    }

    if (!formData.item_category) {
      toast.error('Please select a category');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRule) {
        await penaltyRulesApi.update(editingRule.id, formData);
        toast.success('Penalty rule updated successfully');
      } else {
        await penaltyRulesApi.create(formData);
        toast.success('Penalty rule created successfully');
      }
      
      setShowModal(false);
      await loadRules();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save penalty rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    const headers = ['Category', 'From Condition', 'To Condition', 'Penalty Amount', 'Description'];
    const rows = filteredRules.map(r => [
      r.item_category,
      r.from_condition,
      r.to_condition,
      r.penalty_amount,
      r.description || '',
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `penalty_rules_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getConditionBadge = (condition: string) => {
    const colorClass = CONDITION_COLORS[condition as keyof typeof CONDITION_COLORS] || 'bg-gray-100 text-gray-700';
    return (
      <Badge className={`${colorClass} text-[9px] px-1.5 py-0.5 font-medium border`}>
        {condition}
      </Badge>
    );
  };

  const hasColSearch = Object.values(colSearch).some(v => v !== '');
  const hasFilters = categoryFilter !== 'all';
  const activeFilterCount = [hasFilters].filter(Boolean).length;

  const clearFilters = () => {
    setCategoryFilter('all');
  };

  const clearColSearch = () => {
    setColSearch({
      item_category: '',
      from_condition: '',
      to_condition: '',
      penalty_amount: '',
      description: '',
    });
  };

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-gray-50 ">

      {/* ── HEADER — fully responsive ────────────────────────────────────── */}
      <div className="sticky top-20 z-10">

        {/* Top row: title + actions */}
        <div className="px-0 sm:px-0 pt-0 pb-2 flex items-end justify-end gap-2">

          {/* Action buttons */}
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
              onClick={loadRules}
              disabled={loading}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Add Rule */}
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">New Rule</span>
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="px-0 sm:px-0 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <StatCard 
              title="Total Rules" 
              value={stats.total_rules}
              icon={Gavel} 
              color="bg-blue-600" 
              bg="bg-gradient-to-br from-blue-50 to-blue-100" 
            />
            <StatCard 
              title="Categories" 
              value={stats.categories_count}
              icon={Scale} 
              color="bg-purple-600" 
              bg="bg-gradient-to-br from-purple-50 to-purple-100" 
            />
            <StatCard 
              title="Max Penalty" 
              value={currencyFormatter.format(stats.max_penalty)}
              icon={IndianRupee} 
              color="bg-red-600" 
              bg="bg-gradient-to-br from-red-50 to-red-100" 
            />
            {/* <StatCard 
              title="Min Penalty" 
              value={currencyFormatter.format(stats.min_penalty)}
              icon={IndianRupee} 
              color="bg-green-600" 
              bg="bg-gradient-to-br from-green-50 to-green-100" 
            /> */}
            <StatCard 
              title="Avg Penalty" 
              value={currencyFormatter.format(stats.avg_penalty)}
              icon={AlertTriangle} 
              color="bg-orange-600" 
              bg="bg-gradient-to-br from-orange-50 to-orange-100" 
            />
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="relative">

        {/* Table area */}
        <main className="p-0 sm:p-0">
          <Card className="border rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
              <span className="text-sm font-semibold text-gray-700">
                Penalty Rules ({filteredRules.length})
              </span>
              {hasColSearch && (
                <button onClick={clearColSearch} className="text-[10px] text-blue-600 font-semibold">
                  Clear Search
                </button>
              )}
            </div>

<div className="overflow-auto rounded-b-lg transition-all duration-300 max-h-[350px] md:max-h-[460px]">              <div className="min-w-[900px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50">
                    <TableRow>
                      <TableHead className="py-2 px-3 text-xs"> Item Category</TableHead>
                      <TableHead className="py-2 px-3 text-xs">From Condition</TableHead>
                      <TableHead className="py-2 px-3 text-xs">To Condition</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Penalty Amount</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Description</TableHead>
                      <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
                    </TableRow>

                    {/* Column search */}
                    <TableRow className="bg-gray-50/80">
                      {[
                        { key: 'item_category', ph: 'Search category…' },
                        { key: 'from_condition', ph: 'From…' },
                        { key: 'to_condition', ph: 'To…' },
                        { key: 'penalty_amount', ph: 'Amount…' },
                        { key: 'description', ph: 'Description…' },
                      ].map((col, idx) => (
                        <TableCell key={idx} className="py-1 px-2">
                          {col.key ? (
                            <Input 
                              placeholder={col.ph}
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
                        <TableCell colSpan={6} className="text-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Loading penalty rules…</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredRules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Gavel className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500">No penalty rules found</p>
                          <p className="text-xs text-gray-400 mt-1">Click "New Rule" to create one</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredRules.map(rule => (
                      <TableRow key={rule.id} className="hover:bg-gray-50">
                        <TableCell className="py-2 px-3 text-xs font-medium">
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[9px] px-1.5 py-0.5 font-medium">
                            {rule.item_category}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          {getConditionBadge(rule.from_condition)}
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          {getConditionBadge(rule.to_condition)}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs font-bold text-red-600">
                          {currencyFormatter.format(rule.penalty_amount)}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600 max-w-[200px] truncate">
                          {rule.description || '-'}
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => openEdit(rule)} 
                              title="Edit"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDelete(rule)} 
                              title="Delete"
                            >
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

            {/* ── Category Filter ─────────────────────────────────────────── */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Scale className="h-3 w-3 text-blue-500" /> Category
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

            {/* ── Quick Stats ────────────────────────────────────────────── */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 text-orange-500" /> Quick Stats
              </p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500">Total Rules:</span>
                  <span className="text-xs font-bold text-gray-800">{stats.total_rules}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500">Categories:</span>
                  <span className="text-xs font-bold text-gray-800">{stats.categories_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500">Max Penalty:</span>
                  <span className="text-xs font-bold text-red-600">{currencyFormatter.format(stats.max_penalty)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500">Avg Penalty:</span>
                  <span className="text-xs font-bold text-orange-600">{currencyFormatter.format(stats.avg_penalty)}</span>
                </div>
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

      {/* ══ Add / Edit Dialog ════════════════════════════════════════════════ */}
      <Dialog open={showModal} onOpenChange={v => { if (!v) setShowModal(false); }}>
        <DialogContent className="max-w-xl w-[95vw] max-h-[90vh] overflow-hidden p-0">

          <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">{editingRule ? 'Edit Penalty Rule' : 'Create Penalty Rule'}</h2>
              <p className="text-xs text-blue-100">Define penalty for condition changes</p>
            </div>
            <DialogClose asChild>
              <button className="p-1.5 rounded-full hover:bg-white/20 transition">
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>

          <div className="p-4 overflow-y-auto max-h-[75vh] space-y-5">
            <form onSubmit={handleSubmit}>
              <div>
                <SH icon={<Scale className="h-3 w-3" />} title="Rule Configuration" />
                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">

                  <div className="col-span-2">
                    <label className={L}>Item Category <span className="text-red-400">*</span></label>
                    <Select 
                      value={formData.item_category}
                      onValueChange={v => setFormData(p => ({ ...p, item_category: v }))}
                    >
                      <SelectTrigger className={F}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length > 0 ? categories.map(c => (
                          <SelectItem key={c.id} value={c.name} className={SI}>
                            {c.name}
                          </SelectItem>
                        )) : (
                          <SelectItem value="__none__" disabled className={SI}>
                            No categories — add values to "Category" in Masters
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className={L}>From Condition <span className="text-red-400">*</span></label>
                    <Select 
                      value={formData.from_condition}
                      onValueChange={v => setFormData(p => ({ ...p, from_condition: v }))}
                    >
                      <SelectTrigger className={F}>
                        <SelectValue placeholder="From" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map(cond => (
                          <SelectItem key={cond} value={cond} className={SI}>
                            {cond}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className={L}>To Condition <span className="text-red-400">*</span></label>
                    <Select 
                      value={formData.to_condition}
                      onValueChange={v => setFormData(p => ({ ...p, to_condition: v }))}
                    >
                      <SelectTrigger className={F}>
                        <SelectValue placeholder="To" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map(cond => (
                          <SelectItem key={cond} value={cond} className={SI}>
                            {cond}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <label className={L}>Penalty Amount (₹) <span className="text-red-400">*</span></label>
                    <Input 
                      type="number" 
                      min={0} 
                      step="1"
                      className={F} 
                      placeholder="Enter penalty amount"
                      value={formData.penalty_amount}
                      onChange={e => setFormData(p => ({ ...p, penalty_amount: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <SH icon={<Gavel className="h-3 w-3" />} title="Description" color="text-amber-600" />
                <Textarea
                  className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-0 min-h-[56px] resize-none transition-colors"
                  placeholder="Optional description or notes about this penalty rule…"
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-blue-700 mb-1">Preview:</p>
                <p className="text-xs text-blue-900">
                  If a <span className="font-bold">{formData.item_category || 'category'}</span> item changes from{' '}
                  <Badge className={`${CONDITION_COLORS[formData.from_condition as keyof typeof CONDITION_COLORS] || 'bg-gray-100'} text-[8px] px-1 py-0`}>
                    {formData.from_condition}
                  </Badge>
                  {' '}to{' '}
                  <Badge className={`${CONDITION_COLORS[formData.to_condition as keyof typeof CONDITION_COLORS] || 'bg-gray-100'} text-[8px] px-1 py-0`}>
                    {formData.to_condition}
                  </Badge>
                  , penalty = <span className="font-bold text-red-600">{currencyFormatter.format(formData.penalty_amount)}</span>
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full mt-5 h-8 text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm"
              >
                {submitting ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
                ) : editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}