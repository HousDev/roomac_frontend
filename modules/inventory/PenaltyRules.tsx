

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus, Trash2, Search, Loader2, X, Download,
  Filter, ChevronDown, ChevronUp, AlertTriangle,
  Scale, IndianRupee, Gavel, RefreshCw, Edit,
  ChevronLeft,
  ChevronRight,
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
import * as XLSX from 'xlsx';
import { useAuth } from '@/context/authContext';

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
  // ── Bulk selection state ──
const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
const [selectAll, setSelectAll] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
    const { can } = useAuth(); // ← ADD THIS

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
// ── Pagination state (client‑side) ──
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, "All"] as const;
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState<number | "All">(25);
const [totalItems, setTotalItems] = useState(0);
const [totalPages, setTotalPages] = useState(1);
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


  const paginatedRules = useMemo(() => {
  if (pageSize === "All") return filteredRules;
  const start = (currentPage - 1) * (pageSize as number);
  return filteredRules.slice(start, start + (pageSize as number));
}, [filteredRules, currentPage, pageSize]);

useEffect(() => {
  setTotalItems(filteredRules.length);
  setTotalPages(pageSize === "All" ? 1 : Math.ceil(filteredRules.length / (pageSize as number)));
  if (currentPage > Math.ceil(filteredRules.length / (pageSize === "All" ? filteredRules.length : pageSize as number))) {
    setCurrentPage(1);
  }
}, [filteredRules, pageSize]);
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

 const handleBulkDelete = async () => {
  if (selectedItems.size === 0) return;

  const result = await Swal.fire({
    title: 'Delete Multiple Rules?',
    text: `You are about to delete ${selectedItems.size} penalty rules. This cannot be undone!`,
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
    await Promise.all([...selectedItems].map(id => penaltyRulesApi.delete(id)));
    await loadRules();
    setSelectedItems(new Set());
    setSelectAll(false);
    toast.success(`${selectedItems.size} rules deleted successfully`);
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
  try {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // 1. Main rules sheet
    const rulesData = filteredRules.map(r => ({
      'Item Category': r.item_category,
      'From Condition': r.from_condition,
      'To Condition': r.to_condition,
      'Penalty Amount (₹)': safeNum(r.penalty_amount),
      'Description': r.description || '',
      'Created Date': r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '',
      'Last Updated': r.updated_at ? new Date(r.updated_at).toLocaleDateString('en-IN') : '',
      'Rule ID': r.id
    }));

    const rulesWs = XLSX.utils.json_to_sheet(rulesData);
    
    // Auto-size columns
    const rulesColWidths = [];
    const rulesHeaders = Object.keys(rulesData[0] || {});
    rulesHeaders.forEach(header => {
      const maxLength = Math.max(
        header.length,
        ...rulesData.map(row => String(row[header] || '').length)
      );
      rulesColWidths.push({ wch: Math.min(maxLength + 2, 50) });
    });
    rulesWs['!cols'] = rulesColWidths;
    
    XLSX.utils.book_append_sheet(wb, rulesWs, "Penalty Rules");

    // 2. Summary sheet
    const totalRules = filteredRules.length;
    const totalCategories = new Set(filteredRules.map(r => r.item_category)).size;
    
    // Calculate statistics
    const amounts = filteredRules.map(r => r.penalty_amount);
    const maxPenalty = amounts.length > 0 ? Math.max(...amounts) : 0;
    const minPenalty = amounts.length > 0 ? Math.min(...amounts) : 0;
    const avgPenalty = amounts.length > 0 ? Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length) : 0;
    
    // Condition transition counts
    const transitions: Record<string, number> = {};
    filteredRules.forEach(r => {
      const key = `${r.from_condition}→${r.to_condition}`;
      transitions[key] = (transitions[key] || 0) + 1;
    });

    const summaryData = [
      ['Metric', 'Value'],
      ['Total Rules', totalRules],
      ['Total Categories', totalCategories],
      ['Maximum Penalty (₹)', maxPenalty.toLocaleString('en-IN')],
      ['Minimum Penalty (₹)', minPenalty.toLocaleString('en-IN')],
      ['Average Penalty (₹)', avgPenalty.toLocaleString('en-IN')],
      ['Median Penalty (₹)', amounts.length > 0 ? [...amounts].sort((a, b) => a - b)[Math.floor(amounts.length / 2)].toLocaleString('en-IN') : '0'],
      ['Unique From Conditions', new Set(filteredRules.map(r => r.from_condition)).size],
      ['Unique To Conditions', new Set(filteredRules.map(r => r.to_condition)).size],
      ['Export Date', new Date().toLocaleString('en-IN')]
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // 3. Category breakdown sheet
    const categoryMap = new Map();
    filteredRules.forEach(r => {
      if (!categoryMap.has(r.item_category)) {
        categoryMap.set(r.item_category, {
          category: r.item_category,
          rules: 0,
          total_penalty: 0,
          min_penalty: Infinity,
          max_penalty: -Infinity,
          penalties: []
        });
      }
      const cat = categoryMap.get(r.item_category);
      cat.rules++;
      cat.total_penalty += r.penalty_amount;
      cat.penalties.push(r.penalty_amount);
      cat.min_penalty = Math.min(cat.min_penalty, r.penalty_amount);
      cat.max_penalty = Math.max(cat.max_penalty, r.penalty_amount);
    });

    const categoryData = Array.from(categoryMap.values()).map(c => ({
      'Category': c.category,
      'Number of Rules': c.rules,
      'Total Penalty (₹)': c.total_penalty,
      'Average Penalty (₹)': Math.round(c.total_penalty / c.rules),
      'Minimum Penalty (₹)': c.min_penalty === Infinity ? 0 : c.min_penalty,
      'Maximum Penalty (₹)': c.max_penalty === -Infinity ? 0 : c.max_penalty,
      'Penalty Range': `${currencyFormatter.format(c.min_penalty === Infinity ? 0 : c.min_penalty)} - ${currencyFormatter.format(c.max_penalty === -Infinity ? 0 : c.max_penalty)}`
    }));

    if (categoryData.length > 0) {
      const categoryWs = XLSX.utils.json_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(wb, categoryWs, "By Category");
    }

    // 4. Condition matrix sheet - Show penalty amounts for each from→to transition
    const fromConditions = [...new Set(filteredRules.map(r => r.from_condition))];
    const toConditions = [...new Set(filteredRules.map(r => r.to_condition))];
    
    // Create a matrix data structure
    const matrixData: any[] = [];
    
    // Header row
    const headerRow = ['From \\ To', ...toConditions];
    matrixData.push(headerRow);
    
    // Data rows
    fromConditions.forEach(from => {
      const row: any[] = [from];
      toConditions.forEach(to => {
        const rule = filteredRules.find(r => r.from_condition === from && r.to_condition === to);
        row.push(rule ? rule.penalty_amount : '-');
      });
      matrixData.push(row);
    });

    if (matrixData.length > 1) {
      const matrixWs = XLSX.utils.aoa_to_sheet(matrixData);
      XLSX.utils.book_append_sheet(wb, matrixWs, "Condition Matrix");
    }

    // 5. Transition analysis sheet
    const transitionData = Object.entries(transitions).map(([transition, count]) => {
      const [from, to] = transition.split('→');
      const avgPenaltyForTransition = filteredRules
        .filter(r => r.from_condition === from && r.to_condition === to)
        .reduce((sum, r) => sum + r.penalty_amount, 0) / count;
      
      return {
        'From Condition': from,
        'To Condition': to,
        'Number of Rules': count,
        'Average Penalty (₹)': Math.round(avgPenaltyForTransition),
        'Min Penalty (₹)': Math.min(...filteredRules.filter(r => r.from_condition === from && r.to_condition === to).map(r => r.penalty_amount)),
        'Max Penalty (₹)': Math.max(...filteredRules.filter(r => r.from_condition === from && r.to_condition === to).map(r => r.penalty_amount))
      };
    });

    if (transitionData.length > 0) {
      const transitionWs = XLSX.utils.json_to_sheet(transitionData);
      XLSX.utils.book_append_sheet(wb, transitionWs, "Transition Analysis");
    }

    // 6. Penalty severity analysis sheet
    const severityLevels = [
      { level: 'Low (₹0-500)', min: 0, max: 500 },
      { level: 'Medium (₹501-2000)', min: 501, max: 2000 },
      { level: 'High (₹2001-5000)', min: 2001, max: 5000 },
      { level: 'Severe (>₹5000)', min: 5001, max: Infinity }
    ];

    const severityData = severityLevels.map(level => {
      const rulesInRange = filteredRules.filter(r => 
        r.penalty_amount >= level.min && r.penalty_amount <= level.max
      );
      return {
        'Severity Level': level.level,
        'Number of Rules': rulesInRange.length,
        'Percentage': filteredRules.length > 0 ? `${((rulesInRange.length / filteredRules.length) * 100).toFixed(1)}%` : '0%',
        'Total Penalty Value (₹)': rulesInRange.reduce((sum, r) => sum + r.penalty_amount, 0),
        'Average Penalty (₹)': rulesInRange.length > 0 
          ? Math.round(rulesInRange.reduce((sum, r) => sum + r.penalty_amount, 0) / rulesInRange.length)
          : 0
      };
    });

    const severityWs = XLSX.utils.json_to_sheet(severityData);
    XLSX.utils.book_append_sheet(wb, severityWs, "Penalty Severity");

    // Generate filename
    const filename = `penalty_rules_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    
    toast.success(`Exported ${filteredRules.length} penalty rules successfully`);
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export penalty rules');
  }
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
const activeFilterCount = [
  categoryFilter !== 'all',
].filter(Boolean).length;
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
   <div className="mb-2">
  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">

    {/* LEFT - Stats */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-1">
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

      <StatCard
        title="Avg Penalty"
        value={currencyFormatter.format(stats.avg_penalty)}
        icon={AlertTriangle}
        color="bg-orange-600"
        bg="bg-gradient-to-br from-orange-50 to-orange-100"
      />
    </div>

    {/* RIGHT - Action Buttons */}
    <div className="flex items-center justify-end gap-2 shrink-0 lg:mt-8">

      {/* Filter */}
      {/* <button
        onClick={() => setSidebarOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white
          ${
            sidebarOpen || hasFilters
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "border-gray-200"
          }`}
      >
        <Filter className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="hidden sm:inline">Filters</span>

        {activeFilterCount > 0 && (
          <span
            className={`h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center
              ${
                sidebarOpen || hasFilters
                  ? "bg-white text-blue-600"
                  : "bg-blue-600 text-white"
              }`}
          >
            {activeFilterCount}
          </span>
        )}
      </button> */}

      {/* Export */}
      {can("export_penalty_rules") && (
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white text-[11px] font-medium"
        >
          <Download className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">Export</span>
        </button>
      )}

      {/* Add Rule */}
      {can("create_penalty_rules") && (
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 flex-shrink-0" />
          <span>New Rule</span>
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
            {can('delete_penalty_rules') && (
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
            style={{ tableLayout: "fixed", minWidth: "900px", width: "100%" }}
          >
            <colgroup>
              <col style={{ width: "34px" }} />    {/* checkbox */}
              <col style={{ width: "150px" }} />   {/* Item Category */}
              <col style={{ width: "120px" }} />   {/* From Condition */}
              <col style={{ width: "120px" }} />   {/* To Condition */}
              <col style={{ width: "110px" }} />   {/* Penalty Amount */}
              <col style={{ width: "200px" }} />   {/* Description */}
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
                      setSelectedItems(checked ? new Set(filteredRules.map(i => i.id)) : new Set());
                    }}
                    className="w-3.5 h-3.5 cursor-pointer"
                  />
                </th>
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Item Category</span>
                </th>
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">From Condition</span>
                </th>
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">To Condition</span>
                </th>
                <th className="px-1.5 py-1.5 text-right border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Penalty Amount</span>
                </th>
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Description</span>
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
                    placeholder="Search category…"
                    value={colSearch.item_category || ''}
                    onChange={e => setColSearch(p => ({ ...p, item_category: e.target.value }))}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <input
                    placeholder="From…"
                    value={colSearch.from_condition || ''}
                    onChange={e => setColSearch(p => ({ ...p, from_condition: e.target.value }))}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <input
                    placeholder="To…"
                    value={colSearch.to_condition || ''}
                    onChange={e => setColSearch(p => ({ ...p, to_condition: e.target.value }))}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <input
                    placeholder="Amount…"
                    value={colSearch.penalty_amount || ''}
                    onChange={e => setColSearch(p => ({ ...p, penalty_amount: e.target.value }))}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0 text-right"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <input
                    placeholder="Description…"
                    value={colSearch.description || ''}
                    onChange={e => setColSearch(p => ({ ...p, description: e.target.value }))}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1" />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Loading penalty rules…</p>
                  </td>
                </tr>
              ) : paginatedRules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Gavel className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">No penalty rules found</p>
                    <p className="text-xs text-gray-400 mt-1">Click "New Rule" to create one</p>
                  </td>
                </tr>
              ) : (
                paginatedRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50 border-b border-slate-200">
                    <td className="px-1.5 py-1.5 text-center border-r border-slate-200">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(rule.id)}
                        onChange={() => {
                          const newSet = new Set(selectedItems);
                          if (newSet.has(rule.id)) newSet.delete(rule.id);
                          else newSet.add(rule.id);
                          setSelectedItems(newSet);
                          setSelectAll(newSet.size === filteredRules.length && filteredRules.length > 0);
                        }}
                        className="w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] font-medium border-r border-slate-200">
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[9px] px-1.5 py-0.5 font-medium">
                        {rule.item_category}
                      </Badge>
                    </td>
                    <td className="px-1.5 py-1.5 border-r border-slate-200">
                      {getConditionBadge(rule.from_condition)}
                    </td>
                    <td className="px-1.5 py-1.5 border-r border-slate-200">
                      {getConditionBadge(rule.to_condition)}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] font-bold text-red-600 text-right border-r border-slate-200">
                      {currencyFormatter.format(rule.penalty_amount)}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] text-gray-600 truncate max-w-[200px] border-r border-slate-200">
                      {rule.description || '-'}
                    </td>
                    <td className="px-1.5 py-1.5 text-right">
                      <div className="flex justify-end gap-0.5">
                        {can('edit_penalty_rules') && (
                          <button
                            title="Edit"
                            className="w-6 h-6 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 flex items-center justify-center transition-colors"
                            onClick={() => openEdit(rule)}
                          >
                            <Edit size={12} />
                          </button>
                        )}
                        {can('delete_penalty_rules') && (
                          <button
                            title="Delete"
                            className="w-6 h-6 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors"
                            onClick={() => handleDelete(rule)}
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
              Showing {paginatedRules.length > 0 ? ((currentPage - 1) * (pageSize === "All" ? totalItems : pageSize)) + 1 : 0}–
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
            {/* <div className="border-t border-gray-100" /> */}

            {/* ── Quick Stats ────────────────────────────────────────────── */}
            {/* <div>
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
            </div> */}
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

          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
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