// app/admin/reports/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Users,
  Home,
  FileText,
  Filter,
  BarChart3,
  Loader2,
  Building2,
  RefreshCw,
  CreditCard,
  Clock,
  CheckCircle,
  Activity,
  PieChart as PieChartIcon,
  Wallet,
  DoorOpen,
  AlertCircle,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  LayoutGrid,
  List,
  Minimize2,
  Maximize2,
  Receipt,
  ChevronDown,
  BarChart2,
  LineChart as LineChartIcon,
  Layers,
} from "lucide-react";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

import * as reportApi from "@/lib/reportApi";

type DateRangeType =
  | "today"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "custom";
type ChartType = "area" | "bar" | "line" | "pie";
type ViewMode = "grid" | "list";
type ReportType =
  | "revenue"
  | "payments"
  | "tenants"
  | "occupancy"
  | "expenses"
  | "requests";

interface DateRange {
  start: Date;
  end: Date;
}

// ── Theme tokens ─────────────────────────────────────────────────────────────
const NAVY = "#0a1628";
const NAVY2 = "#1e3a5f";
const YELLOW = "#eab308";
const YELLOW_LIGHT = "#fefce8";
const YELLOW_BORDER = "#fde68a";

const CHART_COLORS = [
  "#1e40af",
  "#eab308",
  "#0a1628",
  "#16a34a",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
];

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-white border rounded-xl p-3 shadow-2xl"
      style={{ borderColor: "#e2e8f0" }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-2"
        style={{ color: "#94a3b8" }}
      >
        {label}
      </p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: entry.color }}
          />
          <span
            className="text-xs font-bold font-mono"
            style={{ color: NAVY }}
          >
            {formatCurrency ? formatCurrency(entry.value) : entry.value}
          </span>
          <span className="text-[10px]" style={{ color: "#94a3b8" }}>
            {entry.name}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  accent = NAVY,
  loading,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
  accent?: string;
  loading?: boolean;
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 animate-pulse border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="w-9 h-9 bg-slate-200 rounded-xl" />
        </div>
        <div className="h-7 w-28 bg-slate-300 rounded mb-1" />
        <div className="h-3 w-16 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl p-4 relative overflow-hidden group transition-all duration-200 hover:-translate-y-1"
      style={{
        border: `1.5px solid #e8edf7`,
        boxShadow: "0 2px 12px rgba(10,22,40,0.06)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between mb-3">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.1em] pt-1"
          style={{ color: "#94a3b8" }}
        >
          {title}
        </p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}14`, border: `1.5px solid ${accent}22` }}
        >
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
      </div>
      <p
        className="text-2xl font-black tracking-tight font-mono mb-0.5"
        style={{ color: NAVY }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-[10px]" style={{ color: "#94a3b8" }}>
          {subtitle}
        </p>
      )}
      {trend !== undefined && (
        <div
          className={`flex items-center gap-1 text-[10px] font-bold mt-1 font-mono ${
            trend === "up"
              ? "text-green-600"
              : trend === "down"
              ? "text-red-500"
              : "text-slate-400"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : trend === "down" ? (
            <ArrowDownRight className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          {Math.abs(trendValue || 0).toFixed(1)}% vs last period
        </div>
      )}
    </div>
  );
};

// ── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = NAVY,
  children,
  action,
  dark = false,
}: {
  title: string;
  subtitle?: string;
  icon: any;
  iconColor?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  dark?: boolean;
}) => (
  <div
    className="rounded-2xl overflow-hidden"
    style={{
      border: "1.5px solid #e2e8f0",
      boxShadow: "0 2px 12px rgba(10,22,40,0.07)",
    }}
  >
    <div
      className="flex items-center justify-between px-5 py-4 border-b"
      style={{
        borderColor: dark ? "rgba(255,255,255,0.1)" : "#f1f5f9",
        background: dark
          ? `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`
          : `linear-gradient(135deg, #fafbff 0%, #f8fafc 100%)`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: dark
              ? "rgba(234,179,8,0.2)"
              : `${iconColor}14`,
            border: dark
              ? "1.5px solid rgba(234,179,8,0.35)"
              : `1.5px solid ${iconColor}22`,
          }}
        >
          <Icon
            className="w-4 h-4"
            style={{ color: dark ? YELLOW : iconColor }}
          />
        </div>
        <div>
          <h3
            className="text-sm font-bold"
            style={{ color: dark ? "#fff" : NAVY }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className="text-[10px]"
              style={{ color: dark ? "rgba(255,255,255,0.5)" : "#94a3b8" }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
    <div className="bg-white">{children}</div>
  </div>
);

// ── Data Table ────────────────────────────────────────────────────────────────
const DataTable = ({
  columns,
  data,
  onExport,
  onPrint,
}: {
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
  }[];
  data: any[];
  onExport?: () => void;
  onPrint?: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((row) =>
      columns.some((col) =>
        row[col.key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, columns]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  return (
    <div className="space-y-3">
      {/* Table controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: "#94a3b8" }}
            />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-8 text-xs w-52 border-slate-200 focus:border-blue-400"
            />
          </div>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(v) => setRowsPerPage(parseInt(v))}
          >
            <SelectTrigger className="h-8 text-xs w-20 border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((s) => (
                <SelectItem key={s} value={s.toString()} className="text-xs">
                  {s} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-mono" style={{ color: "#94a3b8" }}>
            {filtered.length} records
          </p>
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{
                background: NAVY,
                color: "#fff",
              }}
            >
              <Download className="w-3 h-3" />
              Export
            </button>
          )}
          {onPrint && (
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-slate-50"
              style={{ borderColor: "#e2e8f0", color: NAVY2 }}
            >
              <Printer className="w-3 h-3" />
              Print
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "#f8fafc", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3 text-left font-bold uppercase tracking-wider"
                  style={{ color: "#64748b", fontSize: "10px", letterSpacing: "0.08em" }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center"
                  style={{ color: "#cbd5e1" }}
                >
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No records found</p>
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b transition-colors hover:bg-slate-50"
                  style={{ borderColor: "#f1f5f9" }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-5 py-2.5"
                      style={{ color: "#334155" }}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key] || "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-5 py-3 border-t"
          style={{ borderColor: "#f1f5f9" }}
        >
          <p className="text-[10px] font-mono" style={{ color: "#94a3b8" }}>
            Showing {(currentPage - 1) * rowsPerPage + 1}–
            {Math.min(currentPage * rowsPerPage, filtered.length)} of{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all disabled:opacity-40 hover:bg-slate-50"
              style={{ borderColor: "#e2e8f0" }}
            >
              <ChevronLeft className="w-3.5 h-3.5" style={{ color: NAVY2 }} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="w-7 h-7 rounded-lg text-[11px] font-bold transition-all"
                  style={{
                    background: currentPage === p ? NAVY : "transparent",
                    color: currentPage === p ? "#fff" : "#64748b",
                    border: `1px solid ${currentPage === p ? NAVY : "#e2e8f0"}`,
                  }}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all disabled:opacity-40 hover:bg-slate-50"
              style={{ borderColor: "#e2e8f0" }}
            >
              <ChevronRight className="w-3.5 h-3.5" style={{ color: NAVY2 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    approved: { bg: "#dcfce7", color: "#15803d", label: "Approved" },
    paid: { bg: "#dcfce7", color: "#15803d", label: "Paid" },
    pending: { bg: "#fefce8", color: "#854d0e", label: "Pending" },
    rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
    active: { bg: "#eff6ff", color: "#1d4ed8", label: "Active" },
    inactive: { bg: "#f1f5f9", color: "#64748b", label: "Inactive" },
    full: { bg: "#dcfce7", color: "#15803d", label: "Full" },
    partial: { bg: "#fefce8", color: "#854d0e", label: "Partial" },
    vacant: { bg: "#f1f5f9", color: "#64748b", label: "Vacant" },
    resolved: { bg: "#dcfce7", color: "#15803d", label: "Resolved" },
    in_progress: { bg: "#fefce8", color: "#854d0e", label: "In Progress" },
    Paid: { bg: "#dcfce7", color: "#15803d", label: "Paid" },
    Partial: { bg: "#fefce8", color: "#854d0e", label: "Partial" },
    Unpaid: { bg: "#fee2e2", color: "#dc2626", label: "Unpaid" },
  };
  const c = cfg[status] || { bg: "#f1f5f9", color: "#64748b", label: status };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
};

// ── Report Type Config ────────────────────────────────────────────────────────
const REPORT_TYPES = [
  { value: "revenue", label: "Revenue", icon: IndianRupee, color: "#15803d" },
  { value: "payments", label: "Payments", icon: CreditCard, color: "#1e40af" },
  { value: "tenants", label: "Tenants", icon: Users, color: NAVY },
  { value: "occupancy", label: "Occupancy", icon: Home, color: "#0891b2" },
  { value: "expenses", label: "Expenses", icon: Wallet, color: "#dc2626" },
  { value: "requests", label: "Requests", icon: FileText, color: "#7c3aed" },
] as const;

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dashboardStats, setDashboardStats] =
    useState<reportApi.DashboardStats | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [properties, setProperties] = useState<reportApi.PropertyOption[]>([]);
  const [filterOptions, setFilterOptions] =
    useState<reportApi.FilterOptions | null>(null);

  const [activeTab, setActiveTab] = useState<"overview" | "reports">(
    "overview"
  );
  const [reportType, setReportType] = useState<ReportType>("revenue");
  const [dateRange, setDateRange] = useState<DateRangeType>("month");
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRequestType, setSelectedRequestType] = useState("all");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [fullscreen, setFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const reportSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === "overview") loadDashboardStats();
  }, [dateRange, selectedProperty]);

  useEffect(() => {
    if (activeTab === "reports") generateReport();
  }, [
    reportType,
    dateRange,
    selectedProperty,
    selectedStatus,
    selectedCategory,
    selectedRequestType,
  ]);

  const getDateRangeValues = (): DateRange => {
    const today = new Date();
    if (dateRange === "custom") return customDateRange;
    switch (dateRange) {
      case "today":
        return { start: today, end: today };
      case "week":
        return { start: subDays(today, 7), end: today };
      case "month":
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case "quarter":
        return { start: subDays(today, 90), end: today };
      case "year":
        return { start: startOfYear(today), end: endOfYear(today) };
      default:
        return { start: startOfMonth(today), end: endOfMonth(today) };
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [props, filters] = await Promise.all([
        reportApi.fetchProperties(),
        reportApi.getReportFilters(),
      ]);
      setProperties(props);
      setFilterOptions(filters);
      await loadDashboardStats();
    } catch (e) {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const { start, end } = getDateRangeValues();
      const stats = await reportApi.getDashboardStats({
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
        propertyId: selectedProperty,
      });
      setDashboardStats(stats);
    } catch (e) {
      console.error(e);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { start, end } = getDateRangeValues();
      const filters = {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
        propertyId: selectedProperty,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
        requestType:
          selectedRequestType !== "all" ? selectedRequestType : undefined,
      } as reportApi.ReportFilters;

      let response;
      switch (reportType) {
        case "revenue":
          response = await reportApi.generateRevenueReport(filters);
          break;
        case "payments":
          response = await reportApi.generatePaymentsReport(filters);
          break;
        case "tenants":
          response = await reportApi.generateTenantsReport(filters);
          break;
        case "occupancy":
          response = await reportApi.generateOccupancyReport(filters);
          break;
        case "expenses":
          response = await reportApi.generateExpenseReport(filters);
          break;
        case "requests":
          response = await reportApi.generateRequestReport(filters);
          break;
      }
      setReportData(response);
      setActiveTab("reports");
    } catch (e) {
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

const handleExport = async () => {
  if (!reportData) return;
  try {
    const { start, end } = getDateRangeValues();
    const propertyName = selectedProperty !== "all"
      ? properties.find((p) => p.id === selectedProperty)?.name
      : "All Properties";
    
    const blob = await reportApi.exportReportToExcel(reportType, reportData, {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
      propertyName,
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_report_${format(new Date(), "yyyy-MM-dd_HH-mm")}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully as Excel");
  } catch (error: any) {
    console.error("Export error:", error);
    toast.error(error.message || "Failed to export report");
  }
};

  const handlePrint = () => {
    if (!reportData) return;
    const { start, end } = getDateRangeValues();
    const propertyName =
      selectedProperty !== "all"
        ? properties.find((p) => p.id === selectedProperty)?.name
        : "All Properties";
    reportApi.printReport(
      reportType,
      reportData,
      {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
        reportType,
        propertyId: selectedProperty,
      } as reportApi.ReportFilters,
      propertyName
    );
  };

  // ── Derived chart data ──────────────────────────────────────────────────────
  const revenueChartData = useMemo(() => {
    if (!reportData?.summary?.timeSeries) return [];
    return reportData.summary.timeSeries.map((item: any) => ({
      date: item.date,
      revenue: item.revenue,
      transactions: item.count,
    }));
  }, [reportData]);

  const paymentsChartData = useMemo(() => {
    if (!reportData?.summary?.statusSummary) return [];
    return Object.entries(reportData.summary.statusSummary).map(
      ([status, data]: [string, any]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: data.amount,
        count: data.count,
      })
    );
  }, [reportData]);

  const occupancyChartData = useMemo(() => {
    if (!reportData?.rooms) return [];
    const rt: Record<string, { total: number; occupied: number }> = {};
    reportData.rooms.forEach((room: any) => {
      const type = room.room_type || "Standard";
      if (!rt[type]) rt[type] = { total: 0, occupied: 0 };
      rt[type].total++;
      if (room.status !== "vacant") rt[type].occupied++;
    });
    return Object.entries(rt).map(([name, d]) => ({
      name,
      total: d.total,
      occupied: d.occupied,
      vacant: d.total - d.occupied,
    }));
  }, [reportData]);

  const expenseChartData = useMemo(() => {
    if (!reportData?.summary?.categoryBreakdown) return [];
    return Object.entries(reportData.summary.categoryBreakdown).map(
      ([name, data]: [string, any]) => ({ name, amount: data.amount })
    );
  }, [reportData]);

  const requestChartData = useMemo(() => {
    if (!reportData?.summary?.typeBreakdown) return [];
    return Object.entries(reportData.summary.typeBreakdown).map(
      ([name, count]) => ({
        name: name
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        count,
      })
    );
  }, [reportData]);

  const tenantChartData = useMemo(() => {
    if (!reportData?.summary?.occupationDistribution) return [];
    return Object.entries(reportData.summary.occupationDistribution).map(
      ([name, count]) => ({ name, count })
    );
  }, [reportData]);

  // ── Overview stat cards ─────────────────────────────────────────────────────
  const overviewStats = [
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardStats?.totalRevenue || 0),
      icon: IndianRupee,
      accent: "#15803d",
      trend:
        (dashboardStats?.revenueGrowth || 0) > 0
          ? ("up" as const)
          : (dashboardStats?.revenueGrowth || 0) < 0
          ? ("down" as const)
          : ("neutral" as const),
      trendValue: Math.abs(dashboardStats?.revenueGrowth || 0),
      subtitle: "Total collected",
    },
    {
      title: "Total Properties",
      value: dashboardStats?.totalProperties || 0,
      icon: Building2,
      accent: NAVY,
      subtitle: `${dashboardStats?.totalRooms || 0} rooms`,
    },
    {
      title: "Active Tenants",
      value: dashboardStats?.activeTenants || 0,
      icon: Users,
      accent: "#1d4ed8",
      subtitle: `of ${dashboardStats?.totalTenants || 0} total`,
    },
    {
      title: "Occupancy Rate",
      value: `${dashboardStats?.occupancyRate || 0}%`,
      icon: Home,
      accent: "#0891b2",
      subtitle: `${dashboardStats?.occupiedBeds || 0}/${dashboardStats?.totalBeds || 0} beds`,
    },
    {
      title: "Collection Rate",
      value: `${dashboardStats?.collectionRate || 0}%`,
      icon: CheckCircle,
      accent: "#15803d",
      subtitle: `${dashboardStats?.completedPayments || 0} completed`,
    },
    {
      title: "Pending Amount",
      value: formatCurrency(dashboardStats?.pendingAmount || 0),
      icon: Clock,
      accent: "#dc2626",
      subtitle: `${dashboardStats?.pendingPayments || 0} pending`,
    },
  ];

  // ── Report summary stat cards ───────────────────────────────────────────────
  const reportSummaryCards = useMemo(() => {
    if (!reportData) return [];
    switch (reportType) {
      case "revenue":
        return [
          {
            title: "Total Revenue",
            value: formatCurrency(reportData.summary?.totalRevenue || 0),
            icon: IndianRupee,
            accent: "#15803d",
          },
          {
            title: "Transactions",
            value: reportData.summary?.totalTransactions || 0,
            icon: CreditCard,
            accent: NAVY,
          },
          {
            title: "Avg Transaction",
            value: formatCurrency(reportData.summary?.avgTransactionValue || 0),
            icon: BarChart3,
            accent: "#1d4ed8",
          },
          {
            title: "Rent Revenue",
            value: formatCurrency(reportData.summary?.revenueByType?.rent || 0),
            icon: Home,
            accent: "#854d0e",
          },
        ];
      case "payments":
        return [
          {
            title: "Total Amount",
            value: formatCurrency(reportData.summary?.totalAmount || 0),
            icon: IndianRupee,
            accent: "#15803d",
          },
          {
            title: "Collection Rate",
            value: `${reportData.summary?.collectionRate || 0}%`,
            icon: CheckCircle,
            accent: "#0891b2",
          },
          {
            title: "Completed",
            value: reportData.summary?.completedTransactions || 0,
            icon: CheckCircle,
            accent: "#15803d",
          },
          {
            title: "Pending",
            value: reportData.summary?.pendingTransactions || 0,
            icon: Clock,
            accent: "#854d0e",
          },
        ];
      case "tenants":
        return [
          {
            title: "Total Tenants",
            value: reportData.summary?.totalTenants || 0,
            icon: Users,
            accent: NAVY,
          },
          {
            title: "Active",
            value: reportData.summary?.activeTenants || 0,
            icon: UserPlus,
            accent: "#15803d",
          },
          {
            title: "With Bookings",
            value: reportData.summary?.tenantsWithAssignments || 0,
            icon: Home,
            accent: "#1d4ed8",
          },
          {
            title: "Total Paid",
            value: formatCurrency(reportData.summary?.totalPaid || 0),
            icon: Wallet,
            accent: "#854d0e",
          },
        ];
      case "occupancy":
        return [
          {
            title: "Occupancy Rate",
            value: `${reportData.summary?.occupancyRate || 0}%`,
            icon: Home,
            accent: "#0891b2",
          },
          {
            title: "Total Rooms",
            value: reportData.summary?.totalRooms || 0,
            icon: DoorOpen,
            accent: NAVY,
          },
          {
            title: "Occupied",
            value: reportData.summary?.occupiedRooms || 0,
            icon: CheckCircle,
            accent: "#15803d",
          },
          {
            title: "Vacant",
            value: reportData.summary?.vacantRooms || 0,
            icon: AlertCircle,
            accent: "#854d0e",
          },
        ];
      case "expenses":
        return [
          {
            title: "Total Expenses",
            value: formatCurrency(reportData.summary?.totalAmount || 0),
            icon: Wallet,
            accent: "#dc2626",
          },
          {
            title: "Total Paid",
            value: formatCurrency(reportData.summary?.totalPaid || 0),
            icon: CheckCircle,
            accent: "#15803d",
          },
          {
            title: "Pending Balance",
            value: formatCurrency(reportData.summary?.totalBalance || 0),
            icon: Clock,
            accent: "#854d0e",
          },
          {
            title: "Transactions",
            value: reportData.summary?.totalTransactions || 0,
            icon: Receipt,
            accent: NAVY,
          },
        ];
      case "requests":
        return [
          {
            title: "Total Requests",
            value: reportData.summary?.totalRequests || 0,
            icon: FileText,
            accent: NAVY,
          },
          {
            title: "Pending",
            value: reportData.summary?.pendingCount || 0,
            icon: Clock,
            accent: "#854d0e",
          },
          {
            title: "In Progress",
            value: reportData.summary?.inProgressCount || 0,
            icon: Activity,
            accent: "#1d4ed8",
          },
          {
            title: "Resolved",
            value: reportData.summary?.resolvedCount || 0,
            icon: CheckCircle,
            accent: "#15803d",
          },
        ];
      default:
        return [];
    }
  }, [reportData, reportType]);

  const activeReportConfig = REPORT_TYPES.find((r) => r.value === reportType)!;

  // ── Table columns per report ────────────────────────────────────────────────
  const tableColumns = useMemo(() => {
    switch (reportType) {
      case "revenue":
        return [
          { key: "payment_date", label: "Date" },
          { key: "tenant_name", label: "Tenant" },
          { key: "property_name", label: "Property" },
          { key: "payment_type", label: "Type" },
          {
            key: "amount",
            label: "Amount",
            render: (v: any) => (
              <span className="font-mono font-bold" style={{ color: "#15803d" }}>
                {formatCurrency(v)}
              </span>
            ),
          },
          { key: "payment_mode", label: "Mode" },
          {
            key: "status",
            label: "Status",
            render: (v: any) => <StatusBadge status={v} />,
          },
        ];
      case "payments":
        return [
          { key: "payment_date", label: "Date" },
          { key: "tenant_name", label: "Tenant" },
          { key: "property_name", label: "Property" },
          {
            key: "amount",
            label: "Amount",
            render: (v: any) => (
              <span className="font-mono font-bold" style={{ color: NAVY }}>
                {formatCurrency(v)}
              </span>
            ),
          },
          { key: "payment_mode", label: "Mode" },
          {
            key: "status",
            label: "Status",
            render: (v: any) => <StatusBadge status={v} />,
          },
          { key: "transaction_id", label: "Transaction ID" },
        ];
      case "tenants":
        return [
          { key: "full_name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "gender", label: "Gender" },
          { key: "occupation_category", label: "Occupation" },
          { key: "property_name", label: "Property" },
          { key: "room_number", label: "Room" },
          {
            key: "is_active",
            label: "Status",
            render: (v: any) => <StatusBadge status={v ? "active" : "inactive"} />,
          },
        ];
      case "occupancy":
        return [
          { key: "property_name", label: "Property" },
          { key: "room_number", label: "Room #" },
          { key: "room_type", label: "Type" },
          {
            key: "rent_per_bed",
            label: "Rent/Bed",
            render: (v: any) => (
              <span className="font-mono">{formatCurrency(v)}</span>
            ),
          },
          {
            key: "occupied_beds",
            label: "Occupancy",
            render: (v: any, row: any) => (
              <span className="font-mono">
                {v}/{row.total_bed}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (v: any) => <StatusBadge status={v} />,
          },
        ];
      case "expenses":
        return [
          { key: "expense_date", label: "Date" },
          { key: "property_name", label: "Property" },
          { key: "category_name", label: "Category" },
          { key: "vendor_name", label: "Vendor" },
          {
            key: "total_amount",
            label: "Amount",
            render: (v: any) => (
              <span className="font-mono font-bold" style={{ color: "#dc2626" }}>
                {formatCurrency(v)}
              </span>
            ),
          },
          {
            key: "total_paid",
            label: "Paid",
            render: (v: any) => (
              <span className="font-mono">{formatCurrency(v)}</span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (v: any) => <StatusBadge status={v} />,
          },
        ];
      case "requests":
        return [
          { key: "created_at", label: "Date" },
          { key: "tenant_name", label: "Tenant" },
          {
            key: "request_type",
            label: "Type",
            render: (v: any) => (
              <span className="capitalize">
                {v?.replace(/_/g, " ")}
              </span>
            ),
          },
          { key: "title", label: "Title" },
          {
            key: "status",
            label: "Status",
            render: (v: any) => <StatusBadge status={v} />,
          },
          { key: "priority", label: "Priority" },
        ];
      default:
        return [];
    }
  }, [reportType]);

  const renderChart = () => {
    const axisStyle = {
      fill: "#94a3b8",
      fontSize: 10,
      fontFamily: "monospace",
    };
    const gridStyle = { stroke: "#f1f5f9", strokeDasharray: "4 4" };

    // Revenue / Payments chart
    if (
      (reportType === "revenue" || reportType === "payments") &&
      revenueChartData.length > 0
    ) {
      if (chartType === "area")
        return (
          <AreaChart data={revenueChartData}>
            <defs>
              <linearGradient id="rev_grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={NAVY2} stopOpacity={0.18} />
                <stop offset="95%" stopColor={NAVY2} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} {...gridStyle} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={(v) => `₹${v / 1000}k`} width={60} />
            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke={NAVY2} strokeWidth={2.5} fill="url(#rev_grad)" />
          </AreaChart>
        );
      if (chartType === "line")
        return (
          <LineChart data={revenueChartData}>
            <CartesianGrid vertical={false} {...gridStyle} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={(v) => `₹${v / 1000}k`} width={60} />
            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke={NAVY2} strokeWidth={2.5} dot={{ r: 3, fill: NAVY2 }} />
          </LineChart>
        );
      return (
        <BarChart data={revenueChartData}>
          <CartesianGrid vertical={false} {...gridStyle} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} dy={8} />
          <YAxis axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={(v) => `₹${v / 1000}k`} width={60} />
          <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
          <Bar dataKey="revenue" name="Revenue" fill={NAVY2} radius={[5, 5, 0, 0]} />
        </BarChart>
      );
    }

    // Payments pie
    if (reportType === "payments" && paymentsChartData.length > 0)
      return (
        <PieChart>
          <Pie data={paymentsChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {paymentsChartData.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />)}
          </Pie>
          <Tooltip formatter={(v: number) => formatCurrency(v)} />
          <Legend />
        </PieChart>
      );

    // Occupancy
    if (reportType === "occupancy" && occupancyChartData.length > 0)
      return (
        <BarChart data={occupancyChartData}>
          <CartesianGrid vertical={false} {...gridStyle} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisStyle} />
          <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
          <Tooltip />
          <Legend />
          <Bar dataKey="occupied" name="Occupied" fill={NAVY2} radius={[5, 5, 0, 0]} />
          <Bar dataKey="vacant" name="Vacant" fill={YELLOW} radius={[5, 5, 0, 0]} />
        </BarChart>
      );

    // Tenants
    if (reportType === "tenants" && tenantChartData.length > 0)
      return (
        <PieChart>
          <Pie data={tenantChartData} cx="50%" cy="50%" outerRadius={90} dataKey="count" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {tenantChartData.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      );

    // Expenses
    if (reportType === "expenses" && expenseChartData.length > 0)
      return (
        <BarChart data={expenseChartData} layout="vertical">
          <CartesianGrid horizontal={false} {...gridStyle} />
          <XAxis type="number" axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={(v) => `₹${v / 1000}k`} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={axisStyle} width={100} />
          <Tooltip formatter={(v: number) => formatCurrency(v)} />
          <Bar dataKey="amount" name="Amount" fill="#dc2626" radius={[0, 5, 5, 0]} />
        </BarChart>
      );

    // Requests
    if (reportType === "requests" && requestChartData.length > 0)
      return (
        <BarChart data={requestChartData}>
          <CartesianGrid vertical={false} {...gridStyle} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ ...axisStyle, angle: -30, textAnchor: "end", height: 50 }} />
          <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
          <Tooltip />
          <Bar dataKey="count" name="Count" fill="#7c3aed" radius={[5, 5, 0, 0]} />
        </BarChart>
      );

    return null;
  };

  const chart = renderChart();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Sora', sans-serif; }
        .rp-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes rp-fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rp-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .rp-fade { animation: rp-fadeUp 0.35s ease both; }
        .rp-fade:nth-child(1) { animation-delay: .04s; }
        .rp-fade:nth-child(2) { animation-delay: .08s; }
        .rp-fade:nth-child(3) { animation-delay: .12s; }
        .rp-fade:nth-child(4) { animation-delay: .16s; }
        .rp-fade:nth-child(5) { animation-delay: .20s; }
        .rp-fade:nth-child(6) { animation-delay: .24s; }
        select { appearance: none; -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      <div
        className="min-h-screen font-['Sora',sans-serif]"
        style={{ background: "#f0f4fb" }}
      >

        {/* ── Sticky Header ── */}
        <div
          className="sticky top-0 z-30 border-b bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]"
        >
          <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(234,179,8,0.2)", border: "1.5px solid rgba(234,179,8,0.35)" }}
              >
                <BarChart3 className="w-5 h-5" style={{ color: YELLOW }} />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Tab switcher */}
              <div
                className="flex rounded-xl p-1"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                {(["overview", "reports"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
                    style={{
                      background:
                        activeTab === tab ? "#fff" : "transparent",
                      color:
                        activeTab === tab ? NAVY : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {tab === "overview" ? (
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        Overview
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5" />
                        Reports
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Date range */}
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) =>
                    setDateRange(e.target.value as DateRangeType)
                  }
                  className="appearance-none text-xs font-semibold rounded-xl px-3 py-2 pr-7 outline-none cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1.5px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    fontFamily: "Sora, sans-serif",
                  }}
                >
                  <option value="today" style={{ color: NAVY, background: "#fff" }}>Today</option>
                  <option value="week" style={{ color: NAVY, background: "#fff" }}>Last 7 Days</option>
                  <option value="month" style={{ color: NAVY, background: "#fff" }}>This Month</option>
                  <option value="quarter" style={{ color: NAVY, background: "#fff" }}>Last 3 Months</option>
                  <option value="year" style={{ color: NAVY, background: "#fff" }}>This Year</option>
                  <option value="custom" style={{ color: NAVY, background: "#fff" }}>Custom</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "rgba(255,255,255,0.5)" }} />
              </div>

              {/* Property */}
              <div className="relative">
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="appearance-none text-xs font-semibold rounded-xl px-3 py-2 pr-7 outline-none cursor-pointer max-w-[160px]"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1.5px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    fontFamily: "Sora, sans-serif",
                  }}
                >
                  <option value="all" style={{ color: NAVY, background: "#fff" }}>All Properties</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id} style={{ color: NAVY, background: "#fff" }}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "rgba(255,255,255,0.5)" }} />
              </div>

              <button
                onClick={loadDashboardStats}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-semibold rounded-xl px-3 py-2 transition-all"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                }}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Custom date range row */}
          {dateRange === "custom" && (
            <div
              className="px-6 pb-3 flex items-center gap-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                Custom range:
              </p>
              <input
                type="date"
                value={format(customDateRange.start, "yyyy-MM-dd")}
                onChange={(e) =>
                  setCustomDateRange({
                    ...customDateRange,
                    start: new Date(e.target.value),
                  })
                }
                className="text-xs rounded-lg px-3 py-1.5 outline-none"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                }}
              />
              <span style={{ color: "rgba(255,255,255,0.3)" }}>→</span>
              <input
                type="date"
                value={format(customDateRange.end, "yyyy-MM-dd")}
                onChange={(e) =>
                  setCustomDateRange({
                    ...customDateRange,
                    end: new Date(e.target.value),
                  })
                }
                className="text-xs rounded-lg px-3 py-1.5 outline-none"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                }}
              />
            </div>
          )}
        </div>

        {/* ── Reports sub-header (only on reports tab) ── */}
        {activeTab === "reports" && (
          <div
            className="sticky z-20 border-b px-6 py-3"
            style={{
              top: "73px",
              background: YELLOW_LIGHT,
              borderColor: YELLOW_BORDER,
            }}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Report type tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                {REPORT_TYPES.map((rt) => (
                  <button
                    key={rt.value}
                    onClick={() => setReportType(rt.value as ReportType)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background:
                        reportType === rt.value ? NAVY : "rgba(10,22,40,0.06)",
                      color:
                        reportType === rt.value ? "#fff" : "#475569",
                      border: `1.5px solid ${reportType === rt.value ? NAVY : "transparent"}`,
                    }}
                  >
                    <rt.icon className="w-3.5 h-3.5" />
                    {rt.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {/* Status filter */}
                {(reportType === "payments" ||
                  reportType === "tenants" ||
                  reportType === "requests") && (
                  <div className="relative">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="appearance-none text-xs font-semibold rounded-xl px-3 py-2 pr-7 outline-none cursor-pointer border"
                      style={{
                        background: "#fff",
                        borderColor: YELLOW_BORDER,
                        color: NAVY,
                        fontFamily: "Sora, sans-serif",
                      }}
                    >
                      <option value="all">All Status</option>
                      {reportType === "payments" &&
                        filterOptions?.paymentStatuses?.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      {reportType === "tenants" && (
                        <>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </>
                      )}
                      {reportType === "requests" &&
                        filterOptions?.requestStatuses?.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: "#94a3b8" }} />
                  </div>
                )}

                {/* Chart type toggle */}
                <div
                  className="flex rounded-xl p-0.5"
                  style={{
                    background: "rgba(10,22,40,0.06)",
                    border: `1px solid ${YELLOW_BORDER}`,
                  }}
                >
                  {(
                    [
                      { t: "area", Icon: BarChart2 },
                      { t: "bar", Icon: BarChart3 },
                      { t: "line", Icon: LineChartIcon },
                      { t: "pie", Icon: PieChartIcon },
                    ] as const
                  ).map(({ t, Icon }) => (
                    <button
                      key={t}
                      onClick={() => setChartType(t as ChartType)}
                      className="w-8 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background: chartType === t ? NAVY : "transparent",
                      }}
                    >
                      <Icon
                        className="w-3.5 h-3.5"
                        style={{
                          color: chartType === t ? "#fff" : "#94a3b8",
                        }}
                      />
                    </button>
                  ))}
                </div>

                <div
                  className="flex rounded-xl p-0.5"
                  style={{ background: "rgba(10,22,40,0.06)", border: `1px solid ${YELLOW_BORDER}` }}
                >
                  {([{ v: "grid", Icon: LayoutGrid }, { v: "list", Icon: List }] as const).map(({ v, Icon }) => (
                    <button
                      key={v}
                      onClick={() => setViewMode(v)}
                      className="w-8 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: viewMode === v ? NAVY : "transparent" }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: viewMode === v ? "#fff" : "#94a3b8" }} />
                    </button>
                  ))}
                </div>

                <button
                  onClick={generateReport}
                  disabled={generating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{ background: NAVY, color: "#fff" }}
                >
                  {generating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <BarChart3 className="w-3.5 h-3.5" />
                  )}
                  Generate
                </button>

                <button
                  onClick={handleExport}
                  disabled={!reportData}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-40"
                  style={{ borderColor: YELLOW_BORDER, color: "#854d0e", background: "#fff" }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>

                <button
                  onClick={handlePrint}
                  disabled={!reportData}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-40"
                  style={{ borderColor: "#e2e8f0", color: NAVY2, background: "#fff" }}
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>

                <button
                  onClick={() => setFullscreen(!fullscreen)}
                  className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all"
                  style={{ borderColor: "#e2e8f0", background: "#fff" }}
                >
                  {fullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5" style={{ color: NAVY }} />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" style={{ color: NAVY }} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Content ── */}
        <div
          className={`px-6 py-6 ${fullscreen ? "fixed inset-0 z-50 overflow-auto" : ""}`}
          style={{ background: fullscreen ? "#f0f4fb" : undefined }}
          ref={reportSectionRef}
        >
          {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {overviewStats.map((s, i) => (
                  <div key={i} className="rp-fade">
                    <StatCard {...s} loading={loading} />
                  </div>
                ))}
              </div>

              {/* Revenue trend */}
              <SectionCard
                title="Revenue Trend"
                subtitle="Monthly revenue & transaction analysis"
                icon={TrendingUp}
                iconColor={NAVY2}
                dark
                action={
                  <button
                    onClick={() => {
                      setReportType("revenue");
                      setActiveTab("reports");
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: "rgba(234,179,8,0.2)", color: YELLOW, border: "1px solid rgba(234,179,8,0.35)" }}
                  >
                    <Eye className="w-3 h-3" />
                    Full Report
                  </button>
                }
              >
                <div className="p-5 h-80">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin" style={{ color: NAVY2 }} />
                    </div>
                  ) : revenueChartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full" style={{ color: "#cbd5e1" }}>
                      <BarChart3 className="w-10 h-10 mb-2" />
                      <p className="text-xs">No revenue data for this period</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <defs>
                          <linearGradient id="ov_rev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={NAVY2} stopOpacity={0.18} />
                            <stop offset="95%" stopColor={NAVY2} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }} dy={8} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }} tickFormatter={(v) => `₹${v / 1000}k`} width={60} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }} />
                        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                        <Legend wrapperStyle={{ fontSize: 11, color: "#64748b", paddingTop: 8 }} />
                        <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke={NAVY2} strokeWidth={2.5} fill="url(#ov_rev)" />
                        <Bar yAxisId="right" dataKey="transactions" name="Transactions" fill={YELLOW} radius={[4, 4, 0, 0]} opacity={0.8} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </SectionCard>

              {/* Two column charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment status */}
                <SectionCard
                  title="Payment Status"
                  subtitle="Distribution by payment status"
                  icon={CreditCard}
                  iconColor={NAVY}
                >
                  <div className="p-5 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Completed", value: dashboardStats?.completedAmount || 0 },
                            { name: "Pending", value: dashboardStats?.pendingAmount || 0 },
                            { name: "Rejected", value: dashboardStats?.rejectedPayments || 0 },
                          ]}
                          cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value"
                        >
                          {[NAVY2, YELLOW, "#dc2626"].map((c, i) => (
                            <Cell key={i} fill={c} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>

                {/* Request breakdown */}
                <SectionCard
                  title="Request Breakdown"
                  subtitle="Open requests by type"
                  icon={FileText}
                  iconColor={NAVY}
                >
                  <div className="p-5 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "Complaints", value: dashboardStats?.complaints || 0 },
                          { name: "Maintenance", value: dashboardStats?.maintenanceRequests || 0 },
                          { name: "Vacate", value: dashboardStats?.vacateRequests || 0 },
                          { name: "Change Bed", value: dashboardStats?.changeBedRequests || 0 },
                        ]}
                        layout="vertical"
                        margin={{ left: 10, right: 10 }}
                      >
                        <CartesianGrid horizontal={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} width={80} />
                        <Tooltip />
                        <Bar dataKey="value" fill={NAVY} radius={[0, 5, 5, 0]}>
                          {[NAVY, NAVY2, "#1d4ed8", "#0891b2"].map((c, i) => (
                            <Cell key={i} fill={c} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>

              {/* KPI summary row */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1.5px solid #e2e8f0", boxShadow: "0 2px 12px rgba(10,22,40,0.07)" }}
              >
                <div
                  className="px-5 py-3 border-b flex items-center gap-2 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]">
                  <Layers className="w-4 h-4" style={{ color: YELLOW }} />
                  <h3 className="text-sm font-bold text-white">Key Performance Indicators</h3>
                </div>
                <div className="bg-white grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0" style={{ divideColor: "#f1f5f9" }}>
                  {[
                    { label: "Revenue Growth", value: `${dashboardStats?.revenueGrowth?.toFixed(1) || 0}%`, positive: (dashboardStats?.revenueGrowth || 0) >= 0, Icon: TrendingUp },
                    { label: "Collection Rate", value: `${dashboardStats?.collectionRate || 0}%`, positive: (dashboardStats?.collectionRate || 0) >= 80, Icon: CheckCircle },
                    { label: "Bed Occupancy", value: `${dashboardStats?.occupancyRate || 0}%`, positive: (dashboardStats?.occupancyRate || 0) >= 70, Icon: Home },
                    { label: "Pending Payments", value: dashboardStats?.pendingPayments || 0, positive: (dashboardStats?.pendingPayments || 0) < 5, Icon: Clock },
                  ].map(({ label, value, positive, Icon }, i) => (
                    <div key={i} className="p-5 flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: positive ? "#dcfce7" : "#fee2e2" }}
                      >
                        <Icon className="w-5 h-5" style={{ color: positive ? "#15803d" : "#dc2626" }} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>{label}</p>
                        <p className="text-xl font-black font-mono" style={{ color: NAVY }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ REPORTS TAB ═══════════════ */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {generating ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]"
                  >
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: NAVY }} />
                  </div>
                  <p className="font-bold" style={{ color: NAVY }}>
                    Generating report...
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    Fetching and processing data
                  </p>
                </div>
              ) : !reportData ? (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ border: "1.5px solid #e2e8f0" }}
                >
                  <div className="bg-white flex flex-col items-center justify-center py-20">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: `${NAVY}08`, border: `1.5px solid #e2e8f0` }}
                    >
                      <BarChart3 className="w-8 h-8" style={{ color: "#cbd5e1" }} />
                    </div>
                    <h3 className="font-bold mb-1" style={{ color: NAVY }}>
                      No Report Generated
                    </h3>
                    <p className="text-xs mb-5" style={{ color: "#94a3b8" }}>
                      Select filters and click Generate to view data
                    </p>
                    <button
                      onClick={generateReport}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                      style={{ background: NAVY }}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Generate Report
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Report header banner */}
                  <div
                    className="rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3"
                    style={{
                      background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`,
                      border: "1.5px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(234,179,8,0.2)", border: "1.5px solid rgba(234,179,8,0.35)" }}
                      >
                        <activeReportConfig.icon className="w-5 h-5" style={{ color: YELLOW }} />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-white">
                          {activeReportConfig.label} Report
                        </h2>
                        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                          {reportData.meta?.dateRange?.start} → {reportData.meta?.dateRange?.end}
                          {reportData.meta?.property ? ` · ${reportData.meta.property.name}` : " · All Properties"}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Generated {new Date(reportData.meta?.generatedAt || Date.now()).toLocaleString()}
                    </p>
                  </div>

                  {/* Summary stat cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {reportSummaryCards.map((s, i) => (
                      <div key={i} className="rp-fade">
                        <StatCard {...s} />
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  {chart && (
                    <SectionCard
                      title={`${activeReportConfig.label} Analysis`}
                      subtitle="Visual breakdown of report data"
                      icon={activeReportConfig.icon}
                      iconColor={activeReportConfig.color}
                      dark
                    >
                      <div className="p-5 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          {chart}
                        </ResponsiveContainer>
                      </div>
                    </SectionCard>
                  )}

                  {/* Additional charts for payments & occupancy */}
                  {reportType === "payments" && paymentsChartData.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <SectionCard
                        title="Payment Mode Breakdown"
                        subtitle="Transactions by payment method"
                        icon={CreditCard}
                        iconColor={NAVY}
                      >
                        <div className="p-5">
                          {reportData.summary?.modeSummary &&
                            Object.entries(reportData.summary.modeSummary).map(
                              ([mode, data]: [string, any], i) => {
                                const pct =
                                  reportData.summary.totalTransactions > 0
                                    ? (data.count / reportData.summary.totalTransactions) * 100
                                    : 0;
                                return (
                                  <div key={i} className="mb-4">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-xs font-semibold capitalize" style={{ color: "#475569" }}>
                                        {mode.replace(/_/g, " ")}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-black font-mono" style={{ color: NAVY }}>
                                          {formatCurrency(data.amount)}
                                        </span>
                                        <span className="text-[10px] font-mono" style={{ color: "#94a3b8" }}>
                                          ({pct.toFixed(0)}%)
                                        </span>
                                      </div>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                                      <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                          width: `${pct}%`,
                                          background: CHART_COLORS[i % CHART_COLORS.length],
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              }
                            )}
                        </div>
                      </SectionCard>

                      <SectionCard
                        title="Status Distribution"
                        subtitle="Breakdown by payment status"
                        icon={Activity}
                        iconColor={NAVY}
                      >
                        <div className="p-5 h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={paymentsChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                {paymentsChartData.map((_: any, i: number) => (
                                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v: number) => formatCurrency(v)} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </SectionCard>
                    </div>
                  )}

                  {/* Occupancy extras */}
                  {reportType === "occupancy" && reportData.summary && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Potential Revenue", value: formatCurrency(reportData.summary.potentialRevenue || 0), color: NAVY2 },
                        { label: "Actual Revenue", value: formatCurrency(reportData.summary.actualRevenue || 0), color: "#15803d" },
                        { label: "Revenue Loss", value: formatCurrency(reportData.summary.revenueLoss || 0), color: "#dc2626" },
                        { label: "Full Rooms", value: reportData.summary.fullRooms || 0, color: "#0891b2" },
                      ].map(({ label, value, color }, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-2xl p-4"
                          style={{ border: "1.5px solid #e2e8f0" }}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#94a3b8" }}>
                            {label}
                          </p>
                          <p className="text-xl font-black font-mono" style={{ color }}>
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Data Table */}
                  <SectionCard
                    title="Detailed Records"
                    subtitle={`${(reportData.payments || reportData.tenants || reportData.rooms || reportData.expenses || reportData.requests || []).length} total records`}
                    icon={FileText}
                    iconColor={NAVY}
                  >
                    <DataTable
                      columns={tableColumns}
                      data={
                        reportData.payments ||
                        reportData.tenants ||
                        reportData.rooms ||
                        reportData.expenses ||
                        reportData.requests ||
                        []
                      }
                      onExport={handleExport}
                      onPrint={handlePrint}
                    />
                  </SectionCard>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}