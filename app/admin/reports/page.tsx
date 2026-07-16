// app/admin/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { getSettings } from "@/lib/settingsApi";

import {
  Download,
  Printer,
  TrendingUp,
  IndianRupee,
  Users,
  Home,
  FileText,
  Filter,
  Loader2,
  Building2,
  Calendar,
  RefreshCw,
  CreditCard,
  Mail,
  Clock,
  Wallet,
  DoorOpen,
  UserPlus,
  Bed,
  Briefcase,
  Search,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { toast } from "sonner";
import * as reportApi from "@/lib/reportApi";
import * as XLSX from "xlsx";

interface TabConfig {
  id: string;
  label: string;
  icon: any;
}

const TABS: TabConfig[] = [
  { id: "enquiry", label: "Enquiry Report", icon: FileText },
  { id: "tenant", label: "Tenant Report", icon: Users },
  { id: "property", label: "Property Report", icon: Home },
  { id: "room", label: "Rooms / Bed Report", icon: Bed },
  { id: "visitor", label: "Visitors Report", icon: UserPlus },
  { id: "vacancy", label: "Vacancy Report", icon: DoorOpen },
  { id: "expense", label: "Expenses", icon: Wallet },
  { id: "communication", label: "Communication", icon: Mail },
  { id: "inventory", label: "Inventory", icon: Briefcase },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "login", label: "Logged In Report", icon: Clock },
  { id: "revenue", label: "Revenue Report", icon: TrendingUp },
];

export const PRINT_BRAND_STYLE = `
  .brand-header{display:flex;align-items:center;background:#fff;border-bottom:2px solid #e5e7eb;border-radius:12px 12px 0 0;padding:16px 20px;margin-bottom:20px}
  .brand-logo-wrap{width:120px;flex-shrink:0;display:flex;align-items:center;justify-content:flex-start}
  .brand-logo{max-height:52px;width:auto;object-fit:contain}
  .brand-center{flex:1;text-align:center;padding:0 12px}
  .brand-name{font-size:22px;font-weight:700;color:#1e293b;letter-spacing:-0.5px}
  .brand-sub{font-size:10px;font-weight:500;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin-top:2px}
  .brand-right{width:120px;flex-shrink:0;text-align:right;font-size:9px;color:#6c7a8a;line-height:1.6}
  .brand-right .label{font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;display:block}
  .watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-25deg);
    font-size:120px;font-weight:900;color:rgba(27,63,160,0.09);white-space:nowrap;
    pointer-events:none;user-select:none;z-index:-1;letter-spacing:4px}
  @media print { .watermark{ -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
`;

export function buildBrandHeaderHTML(orgLogo: string, orgName: string, subtitle: string) {
  return `<div class="brand-header">
    <div class="brand-logo-wrap">${orgLogo ? `<img class="brand-logo" src="${orgLogo}" alt="logo" onerror="this.style.display='none'"/>` : ""}</div>
    <div class="brand-center">
      <div class="brand-name">${orgName}</div>
      <div class="brand-sub">${subtitle}</div>
    </div>
    <div class="brand-right">
      <span class="label">Report Date</span>
      ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
    </div>
  </div>`;
}

export function buildWatermarkHTML(orgName: string) {
  const firstWord = orgName?.split(" ")[0] || "ROOMAC";
  return `<div class="watermark">${firstWord}</div>`;
}

export default function ReportsPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("enquiry");
  
  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  // Active/Applied Filters (Used for API calls)
  const [startDate, setStartDate] = useState<string>(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [propertyId, setPropertyId] = useState<string>("all");

  // Sidebar Temporary Filters (Applied only when clicking "Apply")
  const [tempStartDate, setTempStartDate] = useState<string>(startDate);
  const [tempEndDate, setTempEndDate] = useState<string>(endDate);
  const [tempPropertyId, setTempPropertyId] = useState<string>(propertyId);
  
  // Data State
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportStats, setReportStats] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [propertiesLoading, setPropertiesLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>(currentSearchTerm => "");
  
  // Column Filters State (per-column input searches)
  const [colFilters, setColFilters] = useState<Record<string, string>>({});

  // Sorting State
  const [sortField, setSortField] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);


  const getApiUrl = () =>
  (typeof window !== "undefined" && (window as any).__ENV__?.VITE_API_URL) || "http://localhost:3001";

function resolveUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${getApiUrl()}${url}`;
}

// inside ReportsPage component
const [orgSettings, setOrgSettings] = useState<{ logoUrl: string; orgName: string }>({
  logoUrl: "",
  orgName: "Roomac Co-Living",
});

useEffect(() => {
  (async () => {
    try {
      const settings: any = await getSettings();
      const logo =
        settings.logo_header?.value ||
        settings.logo_admin_sidebar?.value ||
        settings.logo_footer?.value ||
        "";
      const name = settings.site_name?.value || "Roomac Co-Living";
      setOrgSettings({ logoUrl: logo ? resolveUrl(logo) : "", orgName: name });
    } catch (e) {
      console.error("Failed to load org settings for print branding", e);
    }
  })();
}, []);

  // Fetch properties for dropdown on load
  // NOTE: previously called reportApi.getProperties(), which either doesn't exist
  // or hits the wrong route, so the dropdown always came back empty. The backend
  // already scopes/returns properties correctly via GET /api/reports/filters
  // (ReportController.getReportFilters) — we just weren't calling it.
  useEffect(() => {
    const fetchPropertiesList = async () => {
      setPropertiesLoading(true);
      try {
        const response = await reportApi.getReportFilters();
        if (response?.success) {
          setProperties(response.data?.properties || []);
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error("Error loading properties:", err);
        setProperties([]);
      } finally {
        setPropertiesLoading(false);
      }
    };
    fetchPropertiesList();
  }, []);

  // Fetch report data when active applied filters or tab change
  const fetchReportDetails = async () => {
    setLoading(true);
    setCurrentPage(1);
    setColFilters({});
    try {
      const response = await reportApi.getReportData(activeTab, {
        startDate,
        endDate,
        propertyId,
      });

      if (response.success) {
        setReportData(response.data || []);
        setReportStats(response.stats || {});
      } else {
        toast.error(response.message || "Failed to fetch report data");
        setReportData([]);
        setReportStats({});
      }
    } catch (error) {
      console.error("Error loading report details:", error);
      toast.error("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetails();
  }, [activeTab, startDate, endDate, propertyId]);

  // Open filter sidebar and sync current state
  const handleOpenFilters = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setTempPropertyId(propertyId);
    setSidebarOpen(true);
  };

  // Apply filters trigger
  const handleApplyFilters = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPropertyId(tempPropertyId);
    setSidebarOpen(false);
  };

  // Reset Filters inside Sidebar
  // FIX: previously this only reset the *temp* sidebar fields and asked the
  // user to click Apply — which read as "Reset does nothing" since the table
  // behind it never changed. Reset now applies immediately, same as clicking
  // Apply right after resetting.
  const handleResetFilters = () => {
    const resetStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const resetEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");
    setTempStartDate(resetStart);
    setTempEndDate(resetEnd);
    setTempPropertyId("all");
    setStartDate(resetStart);
    setEndDate(resetEnd);
    setPropertyId("all");
  };

  // Handle Sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Column Filters change handler
  const handleColFilterChange = (field: string, val: string) => {
    setColFilters(prev => ({
      ...prev,
      [field]: val
    }));
    setCurrentPage(1);
  };

  // Filter & Sort Data client-side
  const getFilteredAndSortedData = () => {
    let result = [...reportData];

    // Filter by column inputs
    Object.entries(colFilters).forEach(([col, val]) => {
      if (val.trim()) {
        const term = val.toLowerCase().trim();
        result = result.filter((row) => {
          let rowVal = row[col];
          if (col === "is_active") {
            const statusText = rowVal ? "active" : "inactive";
            return statusText.includes(term);
          }
          if (rowVal === null || rowVal === undefined) return false;
          return rowVal.toString().toLowerCase().includes(term);
        });
      }
    });

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  };

  const processedData = getFilteredAndSortedData();
  const totalRecords = processedData.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Dynamic Avatar Circle Renderer
  const renderTenantNameWithAvatar = (name: string) => {
    if (!name) return "—";
    const words = name.trim().split(" ");
    let initials = "";
    if (words.length > 0) {
      initials += words[0][0];
      if (words.length > 1) {
        initials += words[1][0];
      }
    }
    initials = initials.toUpperCase();
    
    // Choosing a dynamic pastel background based on character hash
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-emerald-100 text-emerald-800 border-emerald-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-rose-100 text-rose-800 border-rose-200",
      "bg-sky-100 text-sky-800 border-sky-200",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorClass = colors[Math.abs(hash) % colors.length];

    return (
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border shrink-0 ${colorClass}`}>
          {initials}
        </div>
        <span className="font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">{name}</span>
      </div>
    );
  };

  // Dynamic KPI Card renderer (matching the pastel/border theme of other modules)
  const renderKPIs = () => {
    switch (activeTab) {
      case "enquiry":
        return (
          <>
            <KPICard title="Total Enquiries" value={reportStats.totalEnquiries || 0} icon={FileText} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Converted to Tenants" value={reportStats.convertedEnquiries || 0} icon={Users} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Conversion Rate" value={reportStats.conversionRate || "0%"} icon={TrendingUp} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
            <KPICard title="Active / Pending" value={reportStats.pendingEnquiries || 0} icon={Clock} bgColor="bg-amber-50/50" textColor="text-amber-900" borderColor="border-amber-100" iconBg="bg-amber-100" iconColor="text-amber-600" />
          </>
        );
      case "tenant":
        return (
          <>
            <KPICard title="Total Registered Tenants" value={reportStats.totalTenants || 0} icon={Users} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="New Check-ins" value={reportStats.newTenants || 0} icon={UserPlus} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Vacated Tenants" value={reportStats.vacatedTenants || 0} icon={DoorOpen} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
            <KPICard title="Bed Occupancy Rate" value={reportStats.occupancyRate || "0%"} icon={Home} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
          </>
        );
      case "property":
        return (
          <>
            <KPICard title="Total Properties" value={reportStats.totalProperties || 0} icon={Building2} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Total Rooms" value={reportStats.totalRooms || 0} icon={Home} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
            <KPICard title="Total Beds" value={reportStats.totalBeds || 0} icon={Bed} bgColor="bg-amber-50/50" textColor="text-amber-900" borderColor="border-amber-100" iconBg="bg-amber-100" iconColor="text-amber-600" />
            <KPICard title="Average Bed Occupancy" value={reportStats.occupancyRate || "0%"} icon={TrendingUp} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
          </>
        );
      case "room":
        return (
          <>
            <KPICard title="Total Rooms" value={reportStats.totalRooms || 0} icon={Home} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Total Beds" value={reportStats.totalBeds || 0} icon={Bed} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
            <KPICard title="Occupied Beds" value={reportStats.occupiedBeds || 0} icon={Users} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Available Beds" value={reportStats.availableBeds || 0} icon={DoorOpen} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
          </>
        );
      case "visitor":
        return (
          <>
            <KPICard title="Total Visitors" value={reportStats.totalVisitors || 0} icon={UserPlus} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Visitors Today" value={reportStats.todayVisitors || 0} icon={Calendar} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Active Status" value={reportStats.pendingCheckOut || 0} icon={Clock} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
            <KPICard title="Blocked Visitors" value={reportStats.blockedVisitors || 0} icon={X} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
          </>
        );
      case "vacancy":
        return (
          <>
            <KPICard title="Vacated Accounts" value={reportStats.totalVacated || 0} icon={DoorOpen} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
            <KPICard title="Refundable Deposit Sum" value={reportStats.refundableAmount || "₹0"} icon={IndianRupee} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Penalties Charged" value={reportStats.collectedPenalties || "₹0"} icon={Wallet} bgColor="bg-amber-50/50" textColor="text-amber-900" borderColor="border-amber-100" iconBg="bg-amber-100" iconColor="text-amber-600" />
            <KPICard title="Deductions Settled" value={reportStats.totalVacated || 0} icon={FileText} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
          </>
        );
      case "expense":
        return (
          <>
            <KPICard title="Total Period Expenses" value={reportStats.totalExpenses || "₹0"} icon={Wallet} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
            <KPICard title="Total Paid Vouchers" value={reportStats.expenseCount || 0} icon={FileText} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Highest Category" value={reportStats.highestCategory || "N/A"} icon={Building2} bgColor="bg-amber-50/50" textColor="text-amber-900" borderColor="border-amber-100" iconBg="bg-amber-100" iconColor="text-amber-600" />
            <KPICard title="Tax Deductible Ratio" value="100.0%" icon={TrendingUp} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
          </>
        );
      case "communication":
        return (
          <>
            <KPICard title="Total Alerts Sent" value={reportStats.totalSent || 0} icon={Mail} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Email Dispatch" value={reportStats.emailsSent || 0} icon={Mail} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="SMS/WhatsApp" value={reportStats.smsSent || 0} icon={TrendingUp} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
            <KPICard title="Failed Dispatches" value={reportStats.failedCount || 0} icon={X} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
          </>
        );
      case "inventory":
        return (
          <>
            <KPICard title="Total Assets" value={reportStats.totalItems || 0} icon={Briefcase} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Available in Stock" value={reportStats.availableItems || 0} icon={Home} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Allocated to Rooms" value={reportStats.assignedItems || 0} icon={Users} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
            <KPICard title="Damaged / Repair" value={reportStats.damagedItems || 0} icon={X} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
          </>
        );
      case "payment":
        return (
          <>
            <KPICard title="Total Paid Revenue" value={reportStats.totalPaid || "₹0"} icon={IndianRupee} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Total Pending Accounts" value={reportStats.totalPending || "₹0"} icon={Clock} bgColor="bg-amber-50/50" textColor="text-amber-900" borderColor="border-amber-100" iconBg="bg-amber-100" iconColor="text-amber-600" />
            <KPICard title="Approved Invoices" value={reportStats.paidCount || 0} icon={FileText} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Defaulters / Pending" value={reportStats.pendingCount || 0} icon={Users} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
          </>
        );
      case "login":
        return (
          <>
            <KPICard title="Total Access Logins" value={reportStats.totalLogins || 0} icon={Clock} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Tenant Logins" value={reportStats.tenantLogins || 0} icon={Users} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Admin & Staff Logins" value={reportStats.staffLogins || 0} icon={TrendingUp} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Portal Access Level" value="Live Audited" icon={Home} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
          </>
        );
      case "revenue":
        return (
          <>
            <KPICard title="Net Revenues" value={reportStats.totalRevenue || "₹0"} icon={IndianRupee} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Net Expenses" value={reportStats.totalExpenses || "₹0"} icon={Wallet} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
            <KPICard title="Net Operational Profit" value={reportStats.netRevenue || "₹0"} icon={TrendingUp} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Profit Margin %" value={reportStats.netMargin || "0%"} icon={Home} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
          </>
        );
      default:
        return null;
    }
  };

  const buildExportRows = (tab: string, data: any[]) => {
    switch (tab) {
      case "enquiry":
        return data.map((row) => ({
          "Created Date": row.created_at ? format(new Date(row.created_at), "dd-MM-yyyy") : "N/A",
          "Tenant Name": row.tenant_name,
          "Phone": row.phone,
          "Email": row.email,
          "Property": row.property_name || row.property_name_val || "N/A",
          "Move-in Date": row.preferred_move_in_date || "N/A",
          "Budget (₹)": row.budget_range || "N/A",
          "Source": row.source,
          "Status": row.status,
          "Remarks": row.remark || "",
        }));
      case "tenant":
        return data.map((row) => ({
          "Name": row.full_name,
          "Phone": row.phone,
          "Email": row.email,
          "Gender": row.gender,
          "Check-in Date": row.check_in_date || "N/A",
          "Property Name": row.property_name || "N/A",
          "Room": row.room_number || "N/A",
          "Bed": row.bed_number || "N/A",
          "Rent (₹)": row.rent_per_bed || 0,
          "Security Deposit (₹)": row.security_deposit || 0,
          "Status": row.is_active ? "Active" : "Inactive",
        }));
      case "property":
        return data.map((row) => ({
          "Property Name": row.name,
          "Address": row.address,
          "Total Rooms": row.total_rooms,
          "Total Beds": row.total_beds,
          "Occupied Beds": row.occupied_beds,
          "Available Beds": row.available_beds,
          "Occupancy Rate": `${row.occupancy_rate}%`,
        }));
      case "room":
        return data.map((row) => ({
          "Property Name": row.property_name,
          "Room #": row.room_number,
          "Room Type": row.room_type,
          "Sharing Type": row.sharing_type,
          "Rent per Bed (₹)": row.rent_per_bed,
          "Total Beds": row.total_bed,
          "Occupied Beds": row.occupied_count,
          "Available Beds": row.available_beds,
          "Status": row.status,
        }));
      case "visitor":
        return data.map((row) => ({
          "Visitor Name": row.visitor_name,
          "Visitor Phone": row.visitor_phone,
          "Tenant Visited": row.tenant_name,
          "Property Name": row.property_name,
          "Room #": row.room_number,
          "Entry Time": row.entry_time ? format(new Date(row.entry_time), "dd-MM-yyyy HH:mm") : "N/A",
          "Exit Time": row.exit_time ? format(new Date(row.exit_time), "dd-MM-yyyy HH:mm") : "N/A",
          "Purpose": row.purpose,
          "Status": row.status,
        }));
      case "vacancy":
        return data.map((row) => ({
          "Tenant Name": row.tenant_name,
          "Property Name": row.property_name,
          "Room": row.room_number,
          "Bed": row.bed_number,
          "Stay Check-in": row.stay_check_in_date || "N/A",
          "Notice Date": row.notice_given_date || "N/A",
          "Vacate Date": row.requested_vacate_date || "N/A",
          "Reason": row.vacate_reason_value,
          "Security Deposit (₹)": row.security_deposit_amount,
          "Penalty Applied (₹)": row.total_penalty_amount,
          "Refundable Amount (₹)": row.refundable_amount,
        }));
      case "expense":
        return data.map((row) => ({
          "Expense Date": row.expense_date || "N/A",
          "Category": row.category_name,
          "Total Paid (₹)": row.total_paid,
          "Payment Mode": row.payment_mode || "N/A",
          "Status": row.status,
          "Property": row.property_name || "N/A",
          "Description": row.description || "",
        }));
      case "communication":
        return data.map((row) => ({
          "Recipient Name": row.recipient_name,
          "Recipient Email/Phone": row.recipient_email || row.recipient_phone,
          "Channel": row.channel,
          "Subject": row.subject || "N/A",
          "Template": row.template_name || "N/A",
          "Type": row.communication_type,
          "Status": row.status,
          "Sent At": row.sent_at || row.created_at || "N/A",
        }));
      case "inventory":
        return data.map((row) => ({
          "Asset ID": row.asset_id,
          "Item Name": row.item_name,
          "Category": row.category_name,
          "Property Name": row.property_name || "N/A",
          "Purchase Price (₹)": row.unit_price,
          "Status": row.asset_status,
          "Purchase Date": row.purchase_date || "N/A",
        }));
      case "payment":
        return data.map((row) => ({
          "Tenant Name": row.tenant_name,
          "Property": row.property_name || "N/A",
          "Room #": row.room_number || "N/A",
          "Transaction ID": row.transaction_id || "N/A",
          "Amount (₹)": row.amount,
          "Payment Mode": row.payment_mode,
          "Status": row.status,
          "Payment Date": row.payment_date || "N/A",
        }));
      case "login":
        return data.map((row) => ({
          "User Name": row.name,
          "Email": row.email,
          "Role": row.role,
          "Login Time": row.login_time ? format(new Date(row.login_time), "dd-MM-yyyy HH:mm:ss") : "N/A",
        }));
      case "revenue":
        return data.map((row) => ({
          "Month": row.month,
          "Collected Revenue (₹)": row.collected,
          "Expenses Paid (₹)": row.expense,
          "Net Profit (₹)": row.profit,
          "Profit Margin": row.margin,
        }));
      default:
        return [];
    }
  };

  const buildReportPrintHTML = () => {
  const rows = buildExportRows(activeTab, processedData);
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const tabLabel = TABS.find((t) => t.id === activeTab)?.label || "Report";
  const propertyLabel =
    propertyId === "all" ? "All Properties" : properties.find((p) => p.id.toString() === propertyId)?.name || propertyId;

  const kpiHtml = Object.entries(reportStats)
    .map(([key, val]) => `
      <div class="stat-box">
        <div class="stat-lbl">${key.replace(/([A-Z])/g, " $1")}</div>
        <div class="stat-val">${val}</div>
      </div>`)
    .join("");

  const bodyRows = rows.length
    ? rows.map((r) => `<tr>${headers.map((h) => `<td>${r[h as keyof typeof r] ?? "—"}</td>`).join("")}</tr>`).join("")
    : `<tr><td colspan="${headers.length || 1}" style="text-align:center;color:#9ca3af;padding:24px">No records found</td></tr>`;

  return `<!DOCTYPE html><html><head><title>${tabLabel} · Roomac Co-Living</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;color:#111;font-size:12px;padding:32px;position:relative}
    ${PRINT_BRAND_STYLE}
    .meta-line{display:flex;justify-content:space-between;font-size:10px;color:#475569;font-weight:600;
      border-bottom:2px solid #1e3b8b;padding-bottom:10px;margin-bottom:16px}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
    .stat-box{border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;background:#f8fafc}
    .stat-lbl{font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#64748b}
    .stat-val{font-size:14px;font-weight:900;color:#1e3b8b;margin-top:2px}
    table{width:100%;border-collapse:collapse;font-size:10px}
    th{background:#f8fafc;text-align:left;font-weight:800;text-transform:uppercase;font-size:8px;
      letter-spacing:.05em;color:#334155;border:1px solid #cbd5e1;padding:7px 8px}
    td{border:1px solid #e2e8f0;padding:6px 8px;color:#111}
    tr:nth-child(even) td{background:#f8fafc}
    .footer{margin-top:20px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;
      display:flex;justify-content:space-between}
  </style></head><body>
  ${buildWatermarkHTML(orgSettings.orgName)}
  ${buildBrandHeaderHTML(orgSettings.logoUrl, orgSettings.orgName, `${tabLabel} Report`)}
  <div class="meta-line">
    <span><strong>Property:</strong> ${propertyLabel}</span>
    <span><strong>Period:</strong> ${startDate} to ${endDate}</span>
    <span><strong>Generated:</strong> ${format(new Date(), "dd/MM/yyyy, hh:mm:ss a")}</span>
  </div>
  <div class="stats">${kpiHtml}</div>
  <table>
    <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <div class="footer">
    <span>Roomac Co-Living Management System</span>
    <span>${rows.length} record(s)</span>
  </div>
  </body></html>`;
};

const handlePrint = () => {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(buildReportPrintHTML());
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300); // give the logo <img> a moment to load
};

  // Excel Export formatter
// Excel Export formatter
  const handleExportToExcel = () => {
    const excelRows = buildExportRows(activeTab, processedData);
    if (!excelRows.length) {
      toast.error("No data available to export to Excel");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${activeTab}_Report`);
    XLSX.writeFile(
      workbook,
      `Roomac_${activeTab}_Report_${format(new Date(), "yyyyMMdd")}.xlsx`
    );
    toast.success("Excel sheet exported successfully!");
  };

  // Sort arrow renderer
  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-3 h-3 text-indigo-600 font-bold" />
    ) : (
      <ChevronDown className="w-3 h-3 text-indigo-600 font-bold" />
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 md:p-2  space-y-4 relative overflow-hidden font-sans">
      

      {/* 📊 DYNAMIC STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5  print:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="bg-white border-slate-200 animate-pulse rounded-lg shadow-sm border">
              <div className="p-3 h-14" />
            </Card>
          ))
        ) : (
          renderKPIs()
        )}
      </div>

      {/* 🗂️ MAIN TABS LIST - Styled in grey wrapper with purple active underline */}
      <div className="bg-[#f1f5f9] dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800 print:hidden overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setColFilters({}); // Reset local column search inputs
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-md transition-all ${
                  isActive
                    ? "bg-white dark:bg-slate-800 text-[#1e3b8b] dark:text-indigo-400 shadow-sm border-b-2 border-indigo-600"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 hover:bg-white/40"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 📋 REPORT DETAILS CONTAINER WITH CUSTOM INPUT FILTERS IN HEADER */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden print:shadow-none print:border-none">
        
        {/* Table toolbar with Export & Print buttons - Print Hidden */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 print:hidden bg-slate-50/40">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Report Records: <span className="text-[#1e3b8b] dark:text-indigo-400 font-bold">{totalRecords} entries found</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Main Filter button matching theme - Deep Royal Blue */}
          <Button
            onClick={handleOpenFilters}
            className="flex items-center gap-2 bg-[#1e3b8b] hover:bg-[#152960] text-white font-medium text-xs px-3 h-8 shadow-md rounded-md transition-all duration-200"
          >
            <Filter className="w-3.5 h-3.5" /> 
            Filters
            {(propertyId !== "all" || 
              startDate !== format(startOfMonth(new Date()), "yyyy-MM-dd") || 
              endDate !== format(endOfMonth(new Date()), "yyyy-MM-dd")) && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToExcel}
              className="flex items-center gap-1.5 text-slate-700 bg-white border border-slate-200 shadow-sm h-8 px-3 text-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#1e3b8b]" /> Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-slate-700 bg-white border border-slate-200 shadow-sm h-8 px-3 text-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" /> Print
            </Button>
          </div>
        </div>

       

        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#1e3b8b]" />
              <p className="text-xs font-semibold">Generating live report grid...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-20 text-slate-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto opacity-50 text-slate-300" />
              <p className="text-sm font-semibold">No records matches filters</p>
              <p className="text-xs">Select filter parameters from the side panel.</p>
            </div>
          ) : (
            <div className="w-full">
              {/* DYNAMIC GRID WITH COLUMN FILTER INPUTS */}
              <table className="report-table w-full text-left text-xs">
                <thead className="bg-[#f8fafc] dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                  {/* TAB: Enquiry */}
                  {activeTab === "enquiry" && (
                    <>
                      <tr>
                        <th onClick={() => handleSort("created_at")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">DATE {renderSortIndicator("created_at")}</div>
                        </th>
                        <th onClick={() => handleSort("tenant_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">TENANT {renderSortIndicator("tenant_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">CONTACT</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">EMAIL</th>
                        <th onClick={() => handleSort("property_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">PROPERTY {renderSortIndicator("property_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">MOVE-IN DATE</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">SOURCE</th>
                        <th onClick={() => handleSort("status")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">STATUS {renderSortIndicator("status")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">REMARKS</th>
                      </tr>
                      <tr className="bg-slate-100/50 print:hidden">
                        <td className="p-1.5"><Input placeholder="dd/mm/yy" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.created_at || ""} onChange={e => handleColFilterChange("created_at", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Search name" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.tenant_name || ""} onChange={e => handleColFilterChange("tenant_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Search phone" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.phone || ""} onChange={e => handleColFilterChange("phone", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Search email" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.email || ""} onChange={e => handleColFilterChange("email", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Search property" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.property_name || ""} onChange={e => handleColFilterChange("property_name", e.target.value)} /></td>
                        <td className="p-1.5"></td>
                        <td className="p-1.5"><Input placeholder="Search source" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.source || ""} onChange={e => handleColFilterChange("source", e.target.value)} /></td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1.5 w-full bg-white text-slate-700" value={colFilters.status || ""} onChange={e => handleColFilterChange("status", e.target.value)}>
                            <option value="">All</option>
                            <option value="new">New</option>
                            <option value="followup">Followup</option>
                            <option value="active">Active</option>
                            <option value="converted">Converted</option>
                          </select>
                        </td>
                        <td className="p-1.5"></td>
                      </tr>
                    </>
                  )}

                  {/* TAB: Tenant */}
                  {activeTab === "tenant" && (
                    <>
                      <tr>
                        <th onClick={() => handleSort("full_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">TENANT {renderSortIndicator("full_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">CONTACT</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">EMAIL</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">GENDER</th>
                        <th onClick={() => handleSort("check_in_date")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">CHECK-IN {renderSortIndicator("check_in_date")}</div>
                        </th>
                        <th onClick={() => handleSort("property_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">PROPERTY {renderSortIndicator("property_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">ROOM </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">BED </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">RENT (₹)</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">DEPOSIT (₹)</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">STATUS</th>
                      </tr>
                      <tr className="bg-slate-100/50 print:hidden">
                        <td className="p-1.5"><Input placeholder="Search name" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.full_name || ""} onChange={e => handleColFilterChange("full_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Phone.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.phone || ""} onChange={e => handleColFilterChange("phone", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Email.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.email || ""} onChange={e => handleColFilterChange("email", e.target.value)} /></td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1 w-full bg-white text-slate-700" value={colFilters.gender || ""} onChange={e => handleColFilterChange("gender", e.target.value)}>
                            <option value="">All</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </td>
                        <td className="p-1.5"><Input placeholder="Date.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.check_in_date || ""} onChange={e => handleColFilterChange("check_in_date", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Property.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.property_name || ""} onChange={e => handleColFilterChange("property_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Room.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.room_number || ""} onChange={e => handleColFilterChange("room_number", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Bed.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.bed_number || ""} onChange={e => handleColFilterChange("bed_number", e.target.value)} /></td>
                        <td className="p-1.5"></td>
                        <td className="p-1.5"></td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1 w-full bg-white text-slate-700" value={colFilters.is_active || ""} onChange={e => handleColFilterChange("is_active", e.target.value)}>
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                      </tr>
                    </>
                  )}

                  {/* TAB: Property */}
                  {activeTab === "property" && (
                    <>
                      <tr>
                        <th onClick={() => handleSort("name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">PROPERTY NAME {renderSortIndicator("name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">ADDRESS</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">TOTAL ROOMS</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">TOTAL BEDS</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">OCCUPIED BEDS</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">AVAILABLE BEDS</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">OCCUPANCY RATE</th>
                      </tr>
                      <tr className="bg-slate-100/50 print:hidden">
                        <td className="p-1.5"><Input placeholder="Search name" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.name || ""} onChange={e => handleColFilterChange("name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Search address" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.address || ""} onChange={e => handleColFilterChange("address", e.target.value)} /></td>
                        <td className="p-1.5" colSpan={5}></td>
                      </tr>
                    </>
                  )}

                  {/* TAB: Room */}
                  {activeTab === "room" && (
                    <>
                      <tr>
                        <th onClick={() => handleSort("property_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">PROPERTY {renderSortIndicator("property_name")}</div>
                        </th>
                        <th onClick={() => handleSort("room_number")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">ROOM  {renderSortIndicator("room_number")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">ROOM TYPE</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">SHARING TYPE</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">RENT PER BED (₹)</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">TOTAL BEDS</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">OCCUPIED BEDS</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">AVAILABLE BEDS</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">STATUS</th>
                      </tr>
                      <tr className="bg-slate-100/50 print:hidden">
                        <td className="p-1.5"><Input placeholder="Property.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.property_name || ""} onChange={e => handleColFilterChange("property_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Room.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.room_number || ""} onChange={e => handleColFilterChange("room_number", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Room type.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.room_type || ""} onChange={e => handleColFilterChange("room_type", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Sharing.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.sharing_type || ""} onChange={e => handleColFilterChange("sharing_type", e.target.value)} /></td>
                        <td className="p-1.5" colSpan={4}></td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1 w-full bg-white text-slate-700" value={colFilters.status || ""} onChange={e => handleColFilterChange("status", e.target.value)}>
                            <option value="">All</option>
                            <option value="Vacant">Vacant</option>
                            <option value="Partially Occupied">Partially Occupied</option>
                            <option value="Fully Occupied">Fully Occupied</option>
                          </select>
                        </td>
                      </tr>
                    </>
                  )}

                  {/* TAB: Visitor */}
                  {activeTab === "visitor" && (
                    <>
                      <tr>
                        <th onClick={() => handleSort("visitor_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">VISITOR NAME {renderSortIndicator("visitor_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">PHONE</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">TENANT VISITED</th>
                        <th onClick={() => handleSort("property_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">PROPERTY {renderSortIndicator("property_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">ROOM</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">ENTRY TIME</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">EXIT TIME</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">PURPOSE</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">STATUS</th>
                      </tr>
                      <tr className="bg-slate-100/50 print:hidden">
                        <td className="p-1.5"><Input placeholder="Search name" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.visitor_name || ""} onChange={e => handleColFilterChange("visitor_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Phone.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.visitor_phone || ""} onChange={e => handleColFilterChange("visitor_phone", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Tenant.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.tenant_name || ""} onChange={e => handleColFilterChange("tenant_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Property.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.property_name || ""} onChange={e => handleColFilterChange("property_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Room.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.room_number || ""} onChange={e => handleColFilterChange("room_number", e.target.value)} /></td>
                        <td className="p-1.5" colSpan={3}></td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1 w-full bg-white text-slate-700" value={colFilters.status || ""} onChange={e => handleColFilterChange("status", e.target.value)}>
                            <option value="">All</option>
                            <option value="checked_in">Checked In</option>
                            <option value="checked_out">Checked Out</option>
                          </select>
                        </td>
                      </tr>
                    </>
                  )}

                  {/* TAB: Vacancy */}
                  {activeTab === "vacancy" && (
                    <>
                      <tr>
                        <th onClick={() => handleSort("tenant_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">TENANT NAME {renderSortIndicator("tenant_name")}</div>
                        </th>
                        <th onClick={() => handleSort("property_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">PROPERTY {renderSortIndicator("property_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">ROOM </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">BED </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">CHECK-IN</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">NOTICE</th>
                        <th onClick={() => handleSort("requested_vacate_date")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">VACATED {renderSortIndicator("requested_vacate_date")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">REASON</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">DEPOSIT (₹)</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">PENALTY (₹)</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">REFUND (₹)</th>
                      </tr>
                      <tr className="bg-slate-100/50 print:hidden">
                        <td className="p-1.5"><Input placeholder="Search tenant" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.tenant_name || ""} onChange={e => handleColFilterChange("tenant_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Property.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.property_name || ""} onChange={e => handleColFilterChange("property_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Room.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.room_number || ""} onChange={e => handleColFilterChange("room_number", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Bed.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.bed_number || ""} onChange={e => handleColFilterChange("bed_number", e.target.value)} /></td>
                        <td className="p-1.5" colSpan={3}></td>
                        <td className="p-1.5"><Input placeholder="Reason.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.vacate_reason_value || ""} onChange={e => handleColFilterChange("vacate_reason_value", e.target.value)} /></td>
                        <td className="p-1.5" colSpan={3}></td>
                      </tr>
                    </>
                  )}

                  {/* TAB: Expense */}
                  {activeTab === "expense" && (
                    <>
                      <tr>
                        <th onClick={() => handleSort("expense_date")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">EXPENSE DATE {renderSortIndicator("expense_date")}</div>
                        </th>
                        <th onClick={() => handleSort("category_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">CATEGORY {renderSortIndicator("category_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">TOTAL PAID (₹)</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">PAYMENT MODE</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">STATUS</th>
                        <th onClick={() => handleSort("property_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">PROPERTY {renderSortIndicator("property_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">DESCRIPTION</th>
                      </tr>
                      <tr className="bg-slate-100/50 print:hidden">
                        <td className="p-1.5"><Input placeholder="Date.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.expense_date || ""} onChange={e => handleColFilterChange("expense_date", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Category.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.category_name || ""} onChange={e => handleColFilterChange("category_name", e.target.value)} /></td>
                        <td className="p-1.5"></td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1 w-full bg-white text-slate-700" value={colFilters.payment_mode || ""} onChange={e => handleColFilterChange("payment_mode", e.target.value)}>
                            <option value="">All</option>
                            <option value="cash">Cash</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="upi">UPI</option>
                          </select>
                        </td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1.5 w-full bg-white text-slate-700" value={colFilters.status || ""} onChange={e => handleColFilterChange("status", e.target.value)}>
                            <option value="">All</option>
                            <option value="Paid">Paid</option>
                            <option value="Partial">Partial</option>
                            <option value="Unpaid">Unpaid</option>
                          </select>
                        </td>
                        <td className="p-1.5"><Input placeholder="Property.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.property_name || ""} onChange={e => handleColFilterChange("property_name", e.target.value)} /></td>
                        <td className="p-1.5"></td>
                      </tr>
                    </>
                  )}

                  {/* TAB: Communication */}
                  {activeTab === "communication" && (
                    <>
                      <tr>
                        <th onClick={() => handleSort("recipient_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">RECIPIENT NAME {renderSortIndicator("recipient_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">CONTACT</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">CHANNEL</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">SUBJECT</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">TEMPLATE</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">TYPE</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">STATUS</th>
                        <th onClick={() => handleSort("created_at")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">SENT AT {renderSortIndicator("created_at")}</div>
                        </th>
                      </tr>
                      <tr className="bg-slate-100/50 print:hidden">
                        <td className="p-1.5"><Input placeholder="Search name" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.recipient_name || ""} onChange={e => handleColFilterChange("recipient_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Search contact" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.recipient_email || ""} onChange={e => handleColFilterChange("recipient_email", e.target.value)} /></td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1.5 w-full bg-white text-slate-700" value={colFilters.channel || ""} onChange={e => handleColFilterChange("channel", e.target.value)}>
                            <option value="">All</option>
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                            <option value="whatsapp">WhatsApp</option>
                          </select>
                        </td>
                        <td className="p-1.5"><Input placeholder="Subject.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.subject || ""} onChange={e => handleColFilterChange("subject", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Template.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.template_name || ""} onChange={e => handleColFilterChange("template_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Type.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.communication_type || ""} onChange={e => handleColFilterChange("communication_type", e.target.value)} /></td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1 w-full bg-white text-slate-700" value={colFilters.status || ""} onChange={e => handleColFilterChange("status", e.target.value)}>
                            <option value="">All</option>
                            <option value="sent">Sent</option>
                            <option value="delivered">Delivered</option>
                            <option value="failed">Failed</option>
                          </select>
                        </td>
                        <td className="p-1.5"></td>
                      </tr>
                    </>
                  )}

                  {/* TAB: Inventory */}
                  {activeTab === "inventory" && (
                    <>
                      <tr>
                        <th onClick={() => handleSort("asset_id")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">ASSET ID {renderSortIndicator("asset_id")}</div>
                        </th>
                        <th onClick={() => handleSort("item_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">ITEM NAME {renderSortIndicator("item_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">CATEGORY</th>
                        <th onClick={() => handleSort("property_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">PROPERTY NAME {renderSortIndicator("property_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">UNIT PRICE</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">STATUS</th>
                        <th onClick={() => handleSort("purchase_date")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">PURCHASE DATE {renderSortIndicator("purchase_date")}</div>
                        </th>
                      </tr>
                      <tr className="bg-slate-100/50 print:hidden">
                        <td className="p-1.5"><Input placeholder="Asset ID.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.asset_id || ""} onChange={e => handleColFilterChange("asset_id", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Item name.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.item_name || ""} onChange={e => handleColFilterChange("item_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Category.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.category_name || ""} onChange={e => handleColFilterChange("category_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Property.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.property_name || ""} onChange={e => handleColFilterChange("property_name", e.target.value)} /></td>
                        <td className="p-1.5"></td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1 w-full bg-white text-slate-700" value={colFilters.asset_status || ""} onChange={e => handleColFilterChange("asset_status", e.target.value)}>
                            <option value="">All</option>
                            <option value="available">Available</option>
                            <option value="allocated">Allocated</option>
                            <option value="damaged">Damaged</option>
                            <option value="repair">Repair</option>
                          </select>
                        </td>
                        <td className="p-1.5"></td>
                      </tr>
                    </>
                  )}

                  {/* TAB: Payment */}
                  {activeTab === "payment" && (
                    <>
                      <tr>
                        <th onClick={() => handleSort("tenant_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">TENANT NAME {renderSortIndicator("tenant_name")}</div>
                        </th>
                        <th onClick={() => handleSort("property_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">PROPERTY {renderSortIndicator("property_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">ROOM </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">TRANSACTION ID</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">AMOUNT (₹)</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">METHOD</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">STATUS</th>
                        <th onClick={() => handleSort("payment_date")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">DATE {renderSortIndicator("payment_date")}</div>
                        </th>
                      </tr>
                      <tr className="bg-slate-100/50 print:hidden">
                        <td className="p-1.5"><Input placeholder="Search tenant" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.tenant_name || ""} onChange={e => handleColFilterChange("tenant_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Property.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.property_name || ""} onChange={e => handleColFilterChange("property_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Room.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.room_number || ""} onChange={e => handleColFilterChange("room_number", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Txn ID.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.transaction_id || ""} onChange={e => handleColFilterChange("transaction_id", e.target.value)} /></td>
                        <td className="p-1.5"></td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1.5 w-full bg-white text-slate-700" value={colFilters.payment_mode || ""} onChange={e => handleColFilterChange("payment_mode", e.target.value)}>
                            <option value="">All</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="upi">UPI</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="online_payment_gateway">Gateway</option>
                          </select>
                        </td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1 w-full bg-white text-slate-700" value={colFilters.status || ""} onChange={e => handleColFilterChange("status", e.target.value)}>
                            <option value="">All</option>
                            <option value="approved">Approved</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                          </select>
                        </td>
                        <td className="p-1.5"></td>
                      </tr>
                    </>
                  )}

                  {/* TAB: Login */}
                  {activeTab === "login" && (
                    <>
                      <tr>
                        <th onClick={() => handleSort("name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">USER NAME {renderSortIndicator("name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">EMAIL ADDRESS</th>
                        <th onClick={() => handleSort("role")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">ROLE {renderSortIndicator("role")}</div>
                        </th>
                        <th onClick={() => handleSort("login_time")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">LOGIN TIME {renderSortIndicator("login_time")}</div>
                        </th>
                      </tr>
                      <tr className="bg-slate-100/50 print:hidden">
                        <td className="p-1.5"><Input placeholder="Search name" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.name || ""} onChange={e => handleColFilterChange("name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Search email" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.email || ""} onChange={e => handleColFilterChange("email", e.target.value)} /></td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1.5 w-full bg-white text-slate-700" value={colFilters.role || ""} onChange={e => handleColFilterChange("role", e.target.value)}>
                            <option value="">All</option>
                            <option value="admin">Admin</option>
                            <option value="tenant">Tenant</option>
                            <option value="staff">Staff</option>
                          </select>
                        </td>
                        <td className="p-1.5"></td>
                      </tr>
                    </>
                  )}

                  {/* TAB: Revenue */}
                  {activeTab === "revenue" && (
                    <>
                      <tr>
                        <th onClick={() => handleSort("month")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">MONTH {renderSortIndicator("month")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">COLLECTED REVENUE (₹)</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">EXPENSES PAID (₹)</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">OPERATIONAL PROFIT (₹)</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">MARGIN %</th>
                      </tr>
                      <tr className="bg-slate-100/50 print:hidden">
                        <td className="p-1.5"><Input placeholder="yyyy-mm" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.month || ""} onChange={e => handleColFilterChange("month", e.target.value)} /></td>
                        <td className="p-1.5" colSpan={4}></td>
                      </tr>
                    </>
                  )}
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedData.map((row: any, index: number) => {
                    const zebraBg = index % 2 === 1 ? "bg-slate-50/30 dark:bg-slate-900/10" : "";
                    
                    return (
                      <tr key={index} className={`hover:bg-[#f1f5f9]/40 dark:hover:bg-slate-800/40 transition-colors ${zebraBg}`}>
                        {activeTab === "enquiry" && (
                          <>
                            <td className="p-3 text-slate-500 font-medium whitespace-nowrap">
                              {row.created_at ? format(new Date(row.created_at), "dd/MM/yyyy") : "—"}
                            </td>
                            <td className="p-3">{renderTenantNameWithAvatar(row.tenant_name)}</td>
                            <td className="p-3 text-slate-600 font-mono">{row.phone}</td>
                            <td className="p-3 text-slate-500 font-medium">{row.email || "—"}</td>
                            <td className="p-3 text-slate-700 font-semibold">{row.property_name || row.property_name_val || "—"}</td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">{row.preferred_move_in_date || "—"}</td>
                            <td className="p-3 text-slate-500">{row.source}</td>
                            <td className="p-3">
                              <Badge className={
                                row.status === "converted"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none font-semibold text-[10px]"
                                  : row.status === "new"
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-none font-semibold text-[10px]"
                                  : "bg-slate-50 text-slate-700 border border-slate-200 shadow-none font-semibold text-[10px]"
                              }>
                                {row.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-slate-500 max-w-xs truncate">{row.remark || "—"}</td>
                          </>
                        )}
                        {activeTab === "tenant" && (
                          <>
                            <td className="p-3">{renderTenantNameWithAvatar(row.full_name)}</td>
                            <td className="p-3 text-slate-600 font-mono">{row.phone}</td>
                            <td className="p-3 text-slate-500">{row.email || "—"}</td>
                            <td className="p-3 text-slate-500 capitalize">{row.gender}</td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">{row.check_in_date || "—"}</td>
                            <td className="p-3 text-slate-700 font-semibold">{row.property_name || "—"}</td>
                            <td className="p-3 text-slate-600 font-bold">{row.room_number || "—"}</td>
                            <td className="p-3 text-slate-600 font-bold">{row.bed_number || "—"}</td>
                            <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                              ₹{(row.rent_per_bed || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-right font-mono text-slate-500">
                              ₹{(row.security_deposit || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-center">
                              <Badge className={
                                row.is_active
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none text-[10px] font-semibold"
                                  : "bg-rose-50 text-rose-700 border border-rose-200 shadow-none text-[10px] font-semibold"
                              }>
                                {row.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                          </>
                        )}
                        {activeTab === "property" && (
                          <>
                            <td className="p-3 font-bold text-slate-900 dark:text-slate-50">{row.name}</td>
                            <td className="p-3 text-slate-500 max-w-sm truncate">{row.address}</td>
                            <td className="p-3 text-center font-semibold text-slate-700">{row.total_rooms}</td>
                            <td className="p-3 text-center font-semibold text-slate-700">{row.total_beds}</td>
                            <td className="p-3 text-center text-emerald-600 font-semibold">{row.occupied_beds}</td>
                            <td className="p-3 text-center text-indigo-600 font-semibold">{row.available_beds}</td>
                            <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">{row.occupancy_rate}%</td>
                          </>
                        )}
                        {activeTab === "room" && (
                          <>
                            <td className="p-3 font-semibold text-slate-700">{row.property_name}</td>
                            <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{row.room_number}</td>
                            <td className="p-3 text-slate-500 capitalize">{row.room_type}</td>
                            <td className="p-3 text-slate-500 capitalize">{row.sharing_type}</td>
                            <td className="p-3 text-right font-mono font-semibold text-slate-800">
                              ₹{Number(row.rent_per_bed).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-center text-slate-600">{row.total_bed}</td>
                            <td className="p-3 text-center text-emerald-600 font-semibold">{row.occupied_count}</td>
                            <td className="p-3 text-center text-indigo-600 font-semibold">{row.available_beds}</td>
                            <td className="p-3 text-center">
                              <Badge className={
                                row.status === "Fully Occupied"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200 shadow-none font-semibold text-[10px]"
                                  : row.status === "Partially Occupied"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200 shadow-none font-semibold text-[10px]"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none font-semibold text-[10px]"
                              }>
                                {row.status}
                              </Badge>
                            </td>
                          </>
                        )}
                        {activeTab === "visitor" && (
                          <>
                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{row.visitor_name}</td>
                            <td className="p-3 text-slate-600 font-mono">{row.visitor_phone}</td>
                            <td className="p-3">{renderTenantNameWithAvatar(row.tenant_name)}</td>
                            <td className="p-3 text-slate-500">{row.property_name}</td>
                            <td className="p-3 text-slate-500 font-bold">{row.room_number}</td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">
                              {row.entry_time ? format(new Date(row.entry_time), "dd/MM/yyyy HH:mm") : "—"}
                            </td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">
                              {row.exit_time ? format(new Date(row.exit_time), "dd/MM/yyyy HH:mm") : "—"}
                            </td>
                            <td className="p-3 text-slate-500 max-w-xs truncate">{row.purpose}</td>
                            <td className="p-3 text-center">
                              <Badge className={
                                row.status === "checked_out"
                                  ? "bg-slate-50 text-slate-700 border border-slate-200 shadow-none font-semibold text-[10px]"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none font-semibold text-[10px]"
                              }>
                                {row.status}
                              </Badge>
                            </td>
                          </>
                        )}
                        {activeTab === "vacancy" && (
                          <>
                            <td className="p-3">{renderTenantNameWithAvatar(row.tenant_name)}</td>
                            <td className="p-3 text-slate-700 font-semibold">{row.property_name}</td>
                            <td className="p-3 text-slate-600 font-bold">{row.room_number}</td>
                            <td className="p-3 text-slate-600 font-bold">{row.bed_number}</td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">{row.stay_check_in_date || "—"}</td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">{row.notice_given_date || "—"}</td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">{row.requested_vacate_date || "—"}</td>
                            <td className="p-3 text-slate-500 max-w-xs truncate">{row.vacate_reason_value || "—"}</td>
                            <td className="p-3 text-right font-mono font-medium text-slate-800">
                              ₹{Number(row.security_deposit_amount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-right font-mono text-rose-600">
                              ₹{Number(row.total_penalty_amount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-600">
                              ₹{Number(row.refundable_amount || 0).toLocaleString("en-IN")}
                            </td>
                          </>
                        )}
                        {activeTab === "expense" && (
                          <>
                            <td className="p-3 text-slate-500 font-medium whitespace-nowrap">{row.expense_date || "—"}</td>
                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{row.category_name}</td>
                            <td className="p-3 text-right font-mono font-bold text-rose-650 text-rose-600">
                              ₹{Number(row.total_paid || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-slate-500 capitalize">{row.payment_mode || "—"}</td>
                            <td className="p-3 text-center">
                              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none font-semibold text-[10px]">{row.status}</Badge>
                            </td>
                            <td className="p-3 text-slate-700 font-semibold">{row.property_name || "—"}</td>
                            <td className="p-3 text-slate-500 max-w-xs truncate">{row.description || "—"}</td>
                          </>
                        )}
                        {activeTab === "communication" && (
                          <>
                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{row.recipient_name}</td>
                            <td className="p-3 text-slate-600 font-mono">{row.recipient_email || row.recipient_phone}</td>
                            <td className="p-3 capitalize">
                              <Badge className={
                                row.channel === "email"
                                  ? "bg-sky-50 text-sky-700 border border-sky-200 shadow-none font-semibold text-[10px]"
                                  : "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-none font-semibold text-[10px]"
                              }>
                                {row.channel}
                              </Badge>
                            </td>
                            <td className="p-3 text-slate-600 max-w-xs truncate">{row.subject || "—"}</td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">{row.template_name || "—"}</td>
                            <td className="p-3 text-slate-500 capitalize">{row.communication_type}</td>
                            <td className="p-3 text-center">
                              <Badge className={
                                row.status === "sent" || row.status === "delivered"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none font-semibold text-[10px]"
                                  : "bg-rose-50 text-rose-700 border border-rose-200 shadow-none font-semibold text-[10px]"
                              }>
                                {row.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">
                              {row.sent_at ? format(new Date(row.sent_at), "dd/MM/yyyy HH:mm") : "—"}
                            </td>
                          </>
                        )}
                        {activeTab === "inventory" && (
                          <>
                            <td className="p-3 text-slate-600 font-mono font-bold">{row.asset_id}</td>
                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{row.item_name}</td>
                            <td className="p-3 text-slate-500">{row.category_name}</td>
                            <td className="p-3 text-slate-700 font-semibold">{row.property_name || "—"}</td>
                            <td className="p-3 text-right font-mono font-medium text-slate-800">
                              ₹{Number(row.unit_price || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-center">
                              <Badge className={
                                row.asset_status === "available"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none font-semibold text-[10px]"
                                    : row.asset_status === "assigned" || row.asset_status === "allocated"
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-none font-semibold text-[10px]"
                                    : "bg-rose-50 text-rose-700 border border-rose-200 shadow-none font-semibold text-[10px]"
                              }>
                                {row.asset_status}
                              </Badge>
                            </td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">{row.purchase_date || "—"}</td>
                          </>
                        )}
                        {activeTab === "payment" && (
                          <>
                            <td className="p-3">{renderTenantNameWithAvatar(row.tenant_name)}</td>
                            <td className="p-3 text-slate-700 font-semibold">{row.property_name || "—"}</td>
                            <td className="p-3 text-slate-600 font-bold">{row.room_number || "—"}</td>
                            <td className="p-3 text-slate-500 font-mono">{row.transaction_id || "—"}</td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-600">
                              ₹{Number(row.amount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-slate-500 capitalize">{row.payment_mode}</td>
                            <td className="p-3 text-center">
                              <Badge className={
                                row.status === "approved" || row.status === "paid"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none font-semibold text-[10px]"
                                    : "bg-amber-50 text-amber-700 border border-amber-200 shadow-none font-semibold text-[10px]"
                              }>
                                {row.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">{row.payment_date || "—"}</td>
                          </>
                        )}
                        {activeTab === "login" && (
                          <>
                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{row.name}</td>
                            <td className="p-3 text-slate-500">{row.email}</td>
                            <td className="p-3 capitalize">
                              <Badge className={
                                row.role === "tenant"
                                  ? "bg-sky-50 text-sky-700 border border-sky-200 shadow-none font-semibold text-[10px]"
                                  : "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-none font-semibold text-[10px]"
                              }>
                                {row.role}
                              </Badge>
                            </td>
                            <td className="p-3 text-slate-500 font-mono whitespace-nowrap">
                              {row.login_time ? format(new Date(row.login_time), "dd/MM/yyyy HH:mm:ss") : "—"}
                            </td>
                          </>
                        )}
                        {activeTab === "revenue" && (
                          <>
                            <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{row.month}</td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-600">
                              ₹{Number(row.collected || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-rose-600">
                              ₹{Number(row.expense || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-indigo-600">
                              ₹{Number(row.profit || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-right font-mono font-semibold text-slate-800">{row.margin}</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
      
      {/* Table footer / Pagination - Hidden on print */}
      {!loading && totalRecords > 0 && (
        <div className="p-3 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>Show</span>
              <select 
                value={pageSize} 
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="h-7 text-xs border border-slate-200 rounded px-1 w-16 bg-white"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-7 text-xs bg-white border border-slate-200"
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-7 w-7 text-xs ${
                    currentPage === pageNum
                      ? "bg-[#1e3b8b] hover:bg-[#152960] text-white"
                      : "bg-white border border-slate-200 text-slate-700"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-7 text-xs bg-white border border-slate-200"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* 📋 FILTER SIDEBAR PANEL (Matching your 2nd screenshot layout) */}
      {sidebarOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 transition-opacity animate-in fade-in duration-200 print:hidden" 
          />
          {/* Sidebar Drawer Container */}
          <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out transform translate-x-0 animate-in slide-in-from-right duration-200 print:hidden">
            
            <div>
              {/* Header: Solid Deep Blue with white text, Close button */}
              <div className="flex items-center justify-between bg-[#1e3b8b] p-4 text-white">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-bold tracking-wide uppercase">Filter Reports</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8 text-white hover:text-slate-200 hover:bg-white/10 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Sidebar Content Form Fields */}
              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
                
                {/* Select Property */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1.5">
                    Property
                  </Label>
                  <Select value={tempPropertyId} onValueChange={setTempPropertyId}>
                    <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                      <SelectValue placeholder={propertiesLoading ? "Loading properties..." : "All Properties"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!propertiesLoading && properties.length === 0 && (
                    <p className="text-[10px] text-amber-600">No properties found for your account.</p>
                  )}
                </div>

                {/* Start Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1.5">
                    Start Date
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="bg-slate-50/50 border-slate-200 text-xs h-9 pl-3 text-slate-700 pr-10"
                    />
                    <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* End Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1.5">
                    End Date
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={tempEndDate}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      className="bg-slate-50/50 border-slate-200 text-xs h-9 pl-3 text-slate-700 pr-10"
                    />
                    <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Actions footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="flex-1 border-slate-200 text-slate-700 bg-white hover:bg-slate-400 text-xs h-9 rounded-md flex items-center justify-center gap-1.5 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="flex-1 bg-[#1e3b8b] hover:bg-[#152960] text-white text-xs h-9 rounded-md font-semibold"
              >
                Apply
              </Button>
            </div>
            
          </div>
        </>
      )}
      
      {/* ⚠️ MODERN CSS PRINT STYLING INJECTION (Produces exact print preview style with logo, metadata line, watermark) */}
      <style jsx global>{`
        /* Bordered, compact grid table for all report tabs — applies on screen only.
           Because every tab renders its own <th>/<td> markup, we style them via
           this shared .report-table class instead of touching each of the 12
           tab branches individually. */
        .report-table {
          border-collapse: collapse;
          border: 1px solid #e2e8f0;
        }
        .report-table th,
        .report-table td {
          border: 1px solid #e2e8f0;
          padding: 6px 10px !important;
        }
        .report-table thead th {
          background-color: #f8fafc;
        }
        .dark .report-table th,
        .dark .report-table td {
          border-color: #1e293b;
        }

    
      `}</style>

    </div>
  );
}

// Internal KPI Card renderer — compact layout matching the Payments page stat cards
function KPICard({ title, value, icon: Icon, bgColor, textColor, borderColor, iconBg, iconColor }: any) {
  return (
    <Card className={`border shadow-sm rounded-lg overflow-hidden ${bgColor} ${borderColor} transition-all duration-200 hover:scale-[1.01]`}>
      <CardContent className="p-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{title}</p>
          <h3 className={`text-base md:text-lg font-extrabold tracking-tight mt-0.5 ${textColor} truncate`}>{value}</h3>
        </div>
        <div className={`p-1.5 rounded-md shrink-0 ${iconBg} ${iconColor}`}>
          <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </div>
      </CardContent>
    </Card>
  );
}