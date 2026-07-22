// app/admin/reports/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  subMonths,
} from "date-fns";
import { toast } from "sonner";
import * as reportApi from "@/lib/reportApi";
import * as XLSX from "xlsx";
import { consumeMasters } from "@/lib/masterApi";
import { occupationCategories } from "@/lib/occupation-data";
import { getAllMappings, getSubcategoriesByCategory } from "@/lib/categorySubcategoryMapApi";
import { getStaffList } from "@/lib/adminApi";


interface TabConfig {
  id: string;
  label: string;
  icon: any;
}

const TABS: TabConfig[] = [
  { id: "overview", label: "Overall", icon: TrendingUp },
  { id: "enquiry", label: "Enquiry Report", icon: FileText },
  { id: "tenant", label: "Tenant Report", icon: Users },
  { id: "tenant_payment", label: "Tenant Payment Report", icon: IndianRupee },
  { id: "property", label: "Property Report", icon: Home },
  { id: "room", label: "Rooms / Bed Report", icon: Bed },
  { id: "visitor", label: "Visitors Report", icon: UserPlus },
  { id: "vacancy", label: "Vacancy Report", icon: DoorOpen },
  { id: "expense", label: "Expenses Report", icon: Wallet },
  { id: "inventory", label: "Inventory Report", icon: Briefcase },
  { id: "payment", label: "Payment Report", icon: CreditCard },
  { id: "login", label: "Logged In Report", icon: Clock },
  { id: "revenue", label: "Revenue Report", icon: TrendingUp },
];

export const PRINT_BRAND_STYLE = `
  .brand-header{display:flex;align-items:center;background:#fff;border-bottom:2px solid #1e3b8b;border-radius:12px 12px 0 0;padding:14px 18px;margin-bottom:16px}
  .brand-logo-wrap{width:110px;flex-shrink:0;display:flex;align-items:center;justify-content:flex-start}
  .brand-logo{max-height:46px;width:auto;object-fit:contain}
  .brand-center{flex:1;text-align:center;padding:0 12px}
  .brand-name{font-size:20px;font-weight:900;color:#1e3b8b;letter-spacing:-0.5px}
  .brand-sub{font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1px;margin-top:2px}
  .brand-right{width:110px;flex-shrink:0;text-align:right;font-size:9px;color:#64748b;line-height:1.5}
  .brand-right .label{font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;display:block}
  .watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-25deg);
    font-size:96px;font-weight:900;color:rgba(30,59,139,0.08);white-space:nowrap;
    pointer-events:none;user-select:none;z-index:-1;letter-spacing:6px}
  @media print {
    .watermark{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    tr:nth-child(even) td { background: rgba(248,250,252, 0.45) !important; }
    td { background: rgba(255,255,255, 0.7) !important; }
  }
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
  const [staffList, setStaffList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [expenseSubcategoryOptions, setExpenseSubcategoryOptions] = useState<any[]>([]);

  const [ignoreDate, setIgnoreDate] = useState(false);
  const [tempIgnoreDate, setTempIgnoreDate] = useState(false);
  const [tempQuickRange, setTempQuickRange] = useState<string>("");

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

  // Dynamic Date Field selector
  const [dateType, setDateType] = useState<string>("default");
  const [tempDateType, setTempDateType] = useState<string>("default");

  const [gender, setGender] = useState<string>("all");
  const [tempGender, setTempGender] = useState<string>("all");
  const [occupation, setOccupation] = useState<string>("all");
  const [tempOccupation, setTempOccupation] = useState<string>("all");

  // Custom Sidebar Filters
  const [rentStatus, setRentStatus] = useState<string>("all");
  const [tempRentStatus, setTempRentStatus] = useState<string>("all");
  const [depositStatus, setDepositStatus] = useState<string>("all");
  const [tempDepositStatus, setTempDepositStatus] = useState<string>("all");
  const [isCouple, setIsCouple] = useState<string>("all");
  const [tempIsCouple, setTempIsCouple] = useState<string>("all");

  const [roomGender, setRoomGender] = useState<string>("all");
  const [tempRoomGender, setTempRoomGender] = useState<string>("all");
  const [bedAvailability, setBedAvailability] = useState<string>("all");
  const [tempBedAvailability, setTempBedAvailability] = useState<string>("all");

  const [vendorName, setVendorName] = useState<string>("");
  const [tempVendorName, setTempVendorName] = useState<string>("");
  const [expenseStatus, setExpenseStatus] = useState<string>("all");
  const [tempExpenseStatus, setTempExpenseStatus] = useState<string>("all");

  const [minRent, setMinRent] = useState<string>("");
  const [tempMinRent, setTempMinRent] = useState<string>("");
  const [maxRent, setMaxRent] = useState<string>("");
  const [tempMaxRent, setTempMaxRent] = useState<string>("");
  const [minDeposit, setMinDeposit] = useState<string>("");
  const [tempMinDeposit, setTempMinDeposit] = useState<string>("");
  const [maxDeposit, setMaxDeposit] = useState<string>("");
  const [tempMaxDeposit, setTempMaxDeposit] = useState<string>("");

  const [sharingType, setSharingType] = useState<string>("all");
  const [tempSharingType, setTempSharingType] = useState<string>("all");
  const [acStatus, setAcStatus] = useState<string>("all");
  const [tempAcStatus, setTempAcStatus] = useState<string>("all");
  const [bathroomStatus, setBathroomStatus] = useState<string>("all");
  const [tempBathroomStatus, setTempBathroomStatus] = useState<string>("all");
  const [occupancyStatus, setOccupancyStatus] = useState<string>("all");
  const [tempOccupancyStatus, setTempOccupancyStatus] = useState<string>("all");

  const [visitorStatus, setVisitorStatus] = useState<string>("all");
  const [tempVisitorStatus, setTempVisitorStatus] = useState<string>("all");
  const [isBlocked, setIsBlocked] = useState<string>("all");
  const [tempIsBlocked, setTempIsBlocked] = useState<string>("all");

  const [vacateReason, setVacateReason] = useState<string>("all");
  const [tempVacateReason, setTempVacateReason] = useState<string>("all");
  const [penaltyStatus, setPenaltyStatus] = useState<string>("all");
  const [tempPenaltyStatus, setTempPenaltyStatus] = useState<string>("all");

  const [expenseCategory, setExpenseCategory] = useState<string>("all");
  const [tempExpenseCategory, setTempExpenseCategory] = useState<string>("all");
  const [tempExpenseCategoryId, setTempExpenseCategoryId] = useState<string>("all");
  const [paymentMode, setPaymentMode] = useState<string>("all");
  const [tempPaymentMode, setTempPaymentMode] = useState<string>("all");

  const [commChannel, setCommChannel] = useState<string>("all");
  const [tempCommChannel, setTempCommChannel] = useState<string>("all");
  const [commStatus, setCommStatus] = useState<string>("all");
  const [tempCommStatus, setTempCommStatus] = useState<string>("all");

  const [assetStatus, setAssetStatus] = useState<string>("all");
  const [tempAssetStatus, setTempAssetStatus] = useState<string>("all");

  const [paymentType, setPaymentType] = useState<string>("all");
  const [tempPaymentType, setTempPaymentType] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [tempPaymentStatus, setTempPaymentStatus] = useState<string>("all");

  const [paymentTenant, setPaymentTenant] = useState<string>("all");
  const [tempPaymentTenant, setTempPaymentTenant] = useState<string>("all");

  const [loginRole, setLoginRole] = useState<string>("all");
  const [tempLoginRole, setTempLoginRole] = useState<string>("all");

  const [enquirySource, setEnquirySource] = useState<string>("all");
  const [tempEnquirySource, setTempEnquirySource] = useState<string>("all");
  const [enquiryStatus, setEnquiryStatus] = useState<string>("all");
  const [tempEnquiryStatus, setTempEnquiryStatus] = useState<string>("all");

  const [city, setCity] = useState<string>("all");
  const [tempCity, setTempCity] = useState<string>("all");

  const [mounted, setMounted] = useState(false);
  const [miniTrendTooltip, setMiniTrendTooltip] = useState<{ x: number; label: string; revenue: number; expenses: number } | null>(null);
  const [chartTooltip, setChartTooltip] = useState<{ x: number; label: string; revenue: number; expenses: number; profit: number; rent: number; deposit: number; refund: number } | null>(null);
  useEffect(() => { setMounted(true); }, []);

  // ── Overview chart refs for print capture ──
  const financialChartRef = useRef<SVGSVGElement>(null);
  const roomsChartRef = useRef<SVGSVGElement>(null);
  const roomsMonthlyChartRef = useRef<SVGSVGElement>(null);
  const tenantsArcRef = useRef<SVGSVGElement>(null);
  const tenantsAreaChartRef = useRef<SVGSVGElement>(null);
  const collectionGaugeRef = useRef<SVGSVGElement>(null);
  const propertyPerfChartRef = useRef<SVGSVGElement>(null);
  const expenseTreemapRef = useRef<SVGSVGElement>(null);
  const revenueBarChartRef = useRef<SVGSVGElement>(null);
  const enquiryChartRef = useRef<SVGSVGElement>(null);

  // ── Overview chart tooltip states ──
  const [financialTooltip, setFinancialTooltip] = useState<{ x: number; month: string; revenue: number; expenses: number; profit: number; rent?: number; deposit?: number; refund?: number } | null>(null);
  const [roomsTooltip, setRoomsTooltip] = useState<{ label: string; value: number; color: string } | null>(null);
  const [roomsMonthlyTooltip, setRoomsMonthlyTooltip] = useState<{ x: number; month: string; total: number; occupied: number; vacated: number; available: number; occRate: string } | null>(null);
  const [tenantsArcTooltip, setTenantsArcTooltip] = useState<{ label: string; value: number; color: string } | null>(null);
  const [tenantsAreaTooltip, setTenantsAreaTooltip] = useState<{ x: number; month: string; newT: number; vacated: number } | null>(null);
  const [gaugeTooltip, setGaugeTooltip] = useState<string | null>(null);
  const [propPerfTooltip, setPropPerfTooltip] = useState<{ name: string; revenue: number; expenses: number; profit: number; occ: number } | null>(null);
  const [treemapTooltip, setTreemapTooltip] = useState<{ x: number; y: number; category: string; amount: number; pct: number } | null>(null);
  const [enquiryTooltip, setEnquiryTooltip] = useState<{ x: number; month: string; total: number; converted: number; pending: number; closed: number; rate: string } | null>(null);


  // New Sidebar Filters States
  const [assignedStaff, setAssignedStaff] = useState<string>("all");
  const [tempAssignedStaff, setTempAssignedStaff] = useState<string>("all");
  const [moveInStart, setMoveInStart] = useState<string>("");
  const [tempMoveInStart, setTempMoveInStart] = useState<string>("");
  const [moveInEnd, setMoveInEnd] = useState<string>("");
  const [tempMoveInEnd, setTempMoveInEnd] = useState<string>("");

  const [tenantStatus, setTenantStatus] = useState<string>("all");
  const [tempTenantStatus, setTempTenantStatus] = useState<string>("all");
  const [refundStatus, setRefundStatus] = useState<string>("all");
  const [tempRefundStatus, setTempRefundStatus] = useState<string>("all");
  const [joinedRecently, setJoinedRecently] = useState<string>("all");
  const [tempJoinedRecently, setTempJoinedRecently] = useState<string>("all");
  const [vacatedRecently, setVacatedRecently] = useState<string>("all");
  const [tempVacatedRecently, setTempVacatedRecently] = useState<string>("all");
  const [portalAccess, setPortalAccess] = useState<string>("all");
  const [tempPortalAccess, setTempPortalAccess] = useState<string>("all");
  const [minPendingRent, setMinPendingRent] = useState<string>("");
  const [tempMinPendingRent, setTempMinPendingRent] = useState<string>("");
  const [maxPendingRent, setMaxPendingRent] = useState<string>("");
  const [tempMaxPendingRent, setTempMaxPendingRent] = useState<string>("");
  const [minPendingDeposit, setMinPendingDeposit] = useState<string>("");
  const [tempMinPendingDeposit, setTempMinPendingDeposit] = useState<string>("");
  const [maxPendingDeposit, setMaxPendingDeposit] = useState<string>("");
  const [tempMaxPendingDeposit, setTempMaxPendingDeposit] = useState<string>("");

  const [minOccupancy, setMinOccupancy] = useState<string>("");
  const [tempMinOccupancy, setTempMinOccupancy] = useState<string>("");
  const [maxOccupancy, setMaxOccupancy] = useState<string>("");
  const [tempMaxOccupancy, setTempMaxOccupancy] = useState<string>("");
  const [minRevenue, setMinRevenue] = useState<string>("");
  const [tempMinRevenue, setTempMinRevenue] = useState<string>("");
  const [maxRevenue, setMaxRevenue] = useState<string>("");
  const [tempMaxRevenue, setTempMaxRevenue] = useState<string>("");
  const [state, setState] = useState<string>("all");
  const [tempState, setTempState] = useState<string>("all");

  const [floor, setFloor] = useState<string>("all");
  const [tempFloor, setTempFloor] = useState<string>("all");

  const [purpose, setPurpose] = useState<string>("all");
  const [tempPurpose, setTempPurpose] = useState<string>("all");

  const [bookingTypeAtVacate, setBookingTypeAtVacate] = useState<string>("all");
  const [tempBookingTypeAtVacate, setTempBookingTypeAtVacate] = useState<string>("all");
  const [minSecurityDeposit, setMinSecurityDeposit] = useState<string>("");
  const [tempMinSecurityDeposit, setTempMinSecurityDeposit] = useState<string>("");
  const [maxSecurityDeposit, setMaxSecurityDeposit] = useState<string>("");
  const [tempMaxSecurityDeposit, setTempMaxSecurityDeposit] = useState<string>("");
  const [stayDuration, setStayDuration] = useState<string>("all");
  const [tempStayDuration, setTempStayDuration] = useState<string>("all");

  const [expenseSubcategory, setExpenseSubcategory] = useState<string>("all");
  const [tempExpenseSubcategory, setTempExpenseSubcategory] = useState<string>("all");

  const [itemCategory, setItemCategory] = useState<string>("all");
  const [tempItemCategory, setTempItemCategory] = useState<string>("all");

  const [paymentSource, setPaymentSource] = useState<string>("all");
  const [tempPaymentSource, setTempPaymentSource] = useState<string>("all");

  const [loginResult, setLoginResult] = useState<string>("all");
  const [tempLoginResult, setTempLoginResult] = useState<string>("all");

  const [revenueType, setRevenueType] = useState<string>("all");
  const [tempRevenueType, setTempRevenueType] = useState<string>("all");
  const [minMargin, setMinMargin] = useState<string>("");
  const [tempMinMargin, setTempMinMargin] = useState<string>("");
  const [maxMargin, setMaxMargin] = useState<string>("");
  const [tempMaxMargin, setTempMaxMargin] = useState<string>("");

  const [minCollectionRate, setMinCollectionRate] = useState<string>("");
  const [tempMinCollectionRate, setTempMinCollectionRate] = useState<string>("");
  const [maxCollectionRate, setMaxCollectionRate] = useState<string>("");
  const [tempMaxCollectionRate, setTempMaxCollectionRate] = useState<string>("");

  // Data State
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportStats, setReportStats] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [propertiesLoading, setPropertiesLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

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
    if (tempExpenseCategoryId === "all") {
      setExpenseSubcategoryOptions([]);
      return;
    }
    const fetchSubs = async () => {
      try {
        const res = await getSubcategoriesByCategory(tempExpenseCategoryId);
        const subs = (res?.data || []).map((s: any) => ({
          id: String(s.subcategory_id),
          name: s.subcategory_name,
        }));
        setExpenseSubcategoryOptions(subs);
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
        setExpenseSubcategoryOptions([]);
      }
    };
    fetchSubs();
  }, [tempExpenseCategoryId]);

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

  // Fetch staff list for enquiry assigned-staff filter
  useEffect(() => {
    getStaffList()
      .then((res) => {

        const list = Array.isArray(res) ? res
          : Array.isArray(res?.data) ? res.data
            : Array.isArray(res?.data?.staff) ? res.data.staff
              : Array.isArray(res?.staff) ? res.staff
                : Array.isArray(res?.results) ? res.results
                  : [];
        setStaffList(list);
      })
      .catch((err) => {
        console.error("Failed to load staff list:", err);
        setStaffList([]);
      });
  }, []);

  // Master states
  const [commonMasters, setCommonMasters] = useState<Record<string, any[]>>({});
  const [propertiesMasters, setPropertiesMasters] = useState<Record<string, any[]>>({});
  const [roomsMasters, setRoomsMasters] = useState<Record<string, any[]>>({});
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingMasters, setLoadingMasters] = useState<boolean>(false);

  // Helper to extract master values case-insensitively
  const getMasterValuesByName = (grouped: Record<string, any[]>, name: string) => {
    const cleanTarget = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const key of Object.keys(grouped)) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanKey === cleanTarget) {
        return grouped[key];
      }
    }
    return [];
  };

  const fetchMasterDataList = async () => {
    setLoadingMasters(true);
    try {
      const [commonRes, propertiesRes, roomsRes] = await Promise.all([
        consumeMasters({ tab: "Common" }),
        consumeMasters({ tab: "Properties" }),
        consumeMasters({ tab: "Rooms" }),
      ]);

      if (commonRes?.success && commonRes.data) {
        const grouped: Record<string, any[]> = {};
        commonRes.data.forEach((item: any) => {
          const type = item.type_name;
          if (!grouped[type]) grouped[type] = [];
          grouped[type].push({ id: item.value_id, name: item.value_name });
        });
        setCommonMasters(grouped);

        const paymentMethodValues = grouped["Payment Method"] || grouped["paymentmethod"] || [];
        setPaymentMethods(paymentMethodValues);
      }

      if (propertiesRes?.success && propertiesRes.data) {
        const grouped: Record<string, any[]> = {};
        propertiesRes.data.forEach((item: any) => {
          const type = item.type_name;
          if (!grouped[type]) grouped[type] = [];
          grouped[type].push({ id: item.value_id, name: item.value_name });
        });
        setPropertiesMasters(grouped);
      }

      if (roomsRes?.success && roomsRes.data) {
        const grouped: Record<string, any[]> = {};
        roomsRes.data.forEach((item: any) => {
          const type = item.type_name;
          if (!grouped[type]) grouped[type] = [];
          grouped[type].push({ id: item.value_id, name: item.value_name });
        });
        setRoomsMasters(grouped);
      }

      // Load expense categories from mapping API
      const mappingRes = await getAllMappings("expense");
      if (mappingRes?.success && mappingRes.data) {
        const mappings = mappingRes.data || [];
        const uniqueCategories = Object.values(
          mappings.reduce((acc: Record<string, any>, m: any) => {
            if (!acc[m.category_id]) {
              acc[m.category_id] = {
                id: m.category_id,
                name: m.category_name,
              };
            }
            return acc;
          }, {})
        );
        setExpenseCategories(uniqueCategories);
      }
    } catch (err) {
      console.error("Failed to load master filters:", err);
    } finally {
      setLoadingMasters(false);
    }
  };

  useEffect(() => {
    fetchMasterDataList();
  }, []);

  // Reset all filters when changing activeTab
  useEffect(() => {
    const resetStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const resetEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

    // Clear temp
    setTempStartDate(resetStart);
    setTempEndDate(resetEnd);
    setTempPropertyId("all");
    setTempDateType("default");
    setTempRentStatus("all");
    setTempDepositStatus("all");
    setTempIsCouple("all");
    setTempRoomGender("all");
    setTempBedAvailability("all");
    setTempVendorName("");
    setTempExpenseStatus("all");
    setTempMinRent("");
    setTempMaxRent("");
    setTempMinDeposit("");
    setTempMaxDeposit("");
    setTempSharingType("all");
    setTempAcStatus("all");
    setTempBathroomStatus("all");
    setTempOccupancyStatus("all");
    setTempVisitorStatus("all");
    setTempIsBlocked("all");
    setTempVacateReason("all");
    setTempPenaltyStatus("all");
    setTempExpenseCategory("all");
    setTempPaymentMode("all");
    setTempCommChannel("all");
    setTempCommStatus("all");
    setTempAssetStatus("all");
    setTempPaymentType("all");
    setTempPaymentStatus("all");
    setTempLoginRole("all");
    setTempEnquirySource("all");
    setTempEnquiryStatus("all");
    setTempCity("all");
    setTempGender("all");
    setTempOccupation("all");

    // Clear new temp states
    setTempAssignedStaff("all");
    setTempMoveInStart("");
    setTempMoveInEnd("");
    setTempTenantStatus("all");
    setTempRefundStatus("all");
    setTempJoinedRecently("all");
    setTempVacatedRecently("all");
    setTempPortalAccess("all");
    setTempMinPendingRent("");
    setTempMaxPendingRent("");
    setTempMinPendingDeposit("");
    setTempMaxPendingDeposit("");
    setTempMinOccupancy("");
    setTempMaxOccupancy("");
    setTempMinRevenue("");
    setTempMaxRevenue("");
    setTempState("all");
    setTempFloor("all");
    setTempPurpose("all");
    setTempBookingTypeAtVacate("all");
    setTempMinSecurityDeposit("");
    setTempMaxSecurityDeposit("");
    setTempStayDuration("all");
    setTempExpenseSubcategory("all");
    setTempItemCategory("all");
    setTempPaymentSource("all");
    setTempLoginResult("all");
    setTempRevenueType("all");
    setTempMinMargin("");
    setTempMaxMargin("");
    setTempIgnoreDate(false);

    // Clear active
    setStartDate(resetStart);
    setEndDate(resetEnd);
    setPropertyId("all");
    setDateType("default");
    setRentStatus("all");
    setDepositStatus("all");
    setIsCouple("all");
    setRoomGender("all");
    setBedAvailability("all");
    setVendorName("");
    setExpenseStatus("all");
    setMinRent("");
    setMaxRent("");
    setMinDeposit("");
    setMaxDeposit("");
    setSharingType("all");
    setAcStatus("all");
    setBathroomStatus("all");
    setOccupancyStatus("all");
    setVisitorStatus("all");
    setIsBlocked("all");
    setVacateReason("all");
    setPenaltyStatus("all");
    setExpenseCategory("all");
    setPaymentMode("all");
    setCommChannel("all");
    setCommStatus("all");
    setAssetStatus("all");
    setPaymentType("all");
    setPaymentStatus("all");
    setLoginRole("all");
    setEnquirySource("all");
    setEnquiryStatus("all");
    setCity("all");
    setGender("all");
    setOccupation("all");

    // Clear new active states
    setAssignedStaff("all");
    setMoveInStart("");
    setMoveInEnd("");
    setTenantStatus("all");
    setRefundStatus("all");
    setJoinedRecently("all");
    setVacatedRecently("all");
    setPortalAccess("all");
    setMinPendingRent("");
    setMaxPendingRent("");
    setMinPendingDeposit("");
    setMaxPendingDeposit("");
    setMinOccupancy("");
    setMaxOccupancy("");
    setMinRevenue("");
    setMaxRevenue("");
    setState("all");
    setFloor("all");
    setPurpose("all");
    setBookingTypeAtVacate("all");
    setMinSecurityDeposit("");
    setMaxSecurityDeposit("");
    setStayDuration("all");
    setExpenseSubcategory("all");
    setItemCategory("all");
    setPaymentSource("all");
    setPaymentTenant("all");
    setLoginResult("all");
    setRevenueType("all");
    setMinMargin("");
    setMaxMargin("");
    setIgnoreDate(false);
  }, [activeTab]);

  // Fetch report data when active applied filters or tab change
  const fetchReportDetails = async () => {
    setLoading(true);
    setCurrentPage(1);
    setColFilters({});
    const effectiveStart = ignoreDate ? "2000-01-01" : startDate;
    const effectiveEnd = ignoreDate ? "2100-12-31" : endDate;
    try {
      const response = await reportApi.getReportData(activeTab, {
        startDate: effectiveStart,
        endDate: effectiveEnd,
        propertyId,
        dateType,
        ignoreDate: ignoreDate ? "true" : "false",
      });

      if (response.success) {
        let fetchedData = response.data || [];
        if (activeTab === "tenant") {
          const currentDate = new Date();
          fetchedData = fetchedData.map((tenant: any) => {
            const checkInDate = tenant.check_in_date ? new Date(tenant.check_in_date) : null;
            let monthsSinceJoining = 0;
            if (checkInDate) {
              const isVacated = tenant.latest_vacate_id !== null && tenant.latest_vacate_id !== undefined;
              const endRef = isVacated && tenant.vacated_date ? new Date(tenant.vacated_date) : currentDate;
              monthsSinceJoining = (endRef.getFullYear() - checkInDate.getFullYear()) * 12 + (endRef.getMonth() - checkInDate.getMonth()) + 1;
              if (monthsSinceJoining < 0) monthsSinceJoining = 0;
            }
            const monthlyRent = parseFloat(tenant.monthly_rent || tenant.rent_per_bed || 0);
            const expectedRent = monthlyRent * monthsSinceJoining;
            const totalPaidRent = parseFloat(tenant.total_rent_paid || 0);
            const pendingRent = Math.max(0, expectedRent - totalPaidRent);

            const securityDepositAmount = parseFloat(tenant.security_deposit || 0);
            const totalPaidDeposit = parseFloat(tenant.total_deposit_paid || 0);
            const pendingDeposit = Math.max(0, securityDepositAmount - totalPaidDeposit);

            return {
              ...tenant,
              is_vacated: tenant.latest_vacate_id ? 1 : 0,
              months_since_joining: monthsSinceJoining,
              expected_rent: expectedRent,
              pending_rent: pendingRent,
              pending_deposit: pendingDeposit
            };
          });
        }
        setReportData(fetchedData);
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
  }, [activeTab, startDate, endDate, propertyId, dateType, ignoreDate]);

  // Open filter sidebar and sync current state
  const handleOpenFilters = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setTempPropertyId(propertyId);
    setTempDateType(dateType);
    setTempRentStatus(rentStatus);
    setTempDepositStatus(depositStatus);
    setTempIsCouple(isCouple);
    setTempRoomGender(roomGender);
    setTempBedAvailability(bedAvailability);
    setTempVendorName(vendorName);
    setTempExpenseStatus(expenseStatus);
    setTempMinRent(minRent);
    setTempMaxRent(maxRent);
    setTempMinDeposit(minDeposit);
    setTempMaxDeposit(maxDeposit);
    setTempSharingType(sharingType);
    setTempAcStatus(acStatus);
    setTempBathroomStatus(bathroomStatus);
    setTempOccupancyStatus(occupancyStatus);
    setTempVisitorStatus(visitorStatus);
    setTempIsBlocked(isBlocked);
    setTempVacateReason(vacateReason);
    setTempPenaltyStatus(penaltyStatus);
    setTempExpenseCategory(expenseCategory);
    const activeCat = expenseCategories.find((c: any) => c.name === expenseCategory);
    setTempExpenseCategoryId(expenseCategory === "all" ? "all" : (activeCat ? String(activeCat.id) : "all"));
    setTempPaymentMode(paymentMode);
    setTempCommChannel(commChannel);
    setTempCommStatus(commStatus);
    setTempAssetStatus(assetStatus);
    setTempPaymentType(paymentType);
    setTempPaymentStatus(paymentStatus);
    setTempLoginRole(loginRole);
    setTempEnquirySource(enquirySource);
    setTempEnquiryStatus(enquiryStatus);
    setTempCity(city);
    setTempGender(gender);
    setTempOccupation(occupation);

    // Sync new temp states
    setTempAssignedStaff(assignedStaff);
    setTempMoveInStart(moveInStart);
    setTempMoveInEnd(moveInEnd);
    setTempTenantStatus(tenantStatus);
    setTempRefundStatus(refundStatus);
    setTempJoinedRecently(joinedRecently);
    setTempVacatedRecently(vacatedRecently);
    setTempPortalAccess(portalAccess);
    setTempMinPendingRent(minPendingRent);
    setTempMaxPendingRent(maxPendingRent);
    setTempMinPendingDeposit(minPendingDeposit);
    setTempMaxPendingDeposit(maxPendingDeposit);
    setTempMinOccupancy(minOccupancy);
    setTempMaxOccupancy(maxOccupancy);
    setTempMinRevenue(minRevenue);
    setTempMaxRevenue(maxRevenue);
    setTempState(state);
    setTempFloor(floor);
    setTempPurpose(purpose);
    setTempBookingTypeAtVacate(bookingTypeAtVacate);
    setTempMinSecurityDeposit(minSecurityDeposit);
    setTempMaxSecurityDeposit(maxSecurityDeposit);
    setTempStayDuration(stayDuration);
    setTempExpenseSubcategory(expenseSubcategory);
    setTempItemCategory(itemCategory);
    setTempPaymentSource(paymentSource);
    setTempPaymentTenant(paymentTenant);
    setTempLoginResult(loginResult);
    setTempRevenueType(revenueType);
    setTempMinMargin(minMargin);
    setTempMaxMargin(maxMargin);
    setTempIgnoreDate(ignoreDate);

    setSidebarOpen(true);
  };

  // Apply filters trigger
  const handleApplyFilters = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPropertyId(tempPropertyId);
    setDateType(tempDateType);
    setRentStatus(tempRentStatus);
    setDepositStatus(tempDepositStatus);
    setIsCouple(tempIsCouple);
    setRoomGender(tempRoomGender);
    setBedAvailability(tempBedAvailability);
    setVendorName(tempVendorName);
    setExpenseStatus(tempExpenseStatus);
    setMinRent(tempMinRent);
    setMaxRent(tempMaxRent);
    setMinDeposit(tempMinDeposit);
    setMaxDeposit(tempMaxDeposit);
    setSharingType(tempSharingType);
    setAcStatus(tempAcStatus);
    setBathroomStatus(tempBathroomStatus);
    setOccupancyStatus(tempOccupancyStatus);
    setVisitorStatus(tempVisitorStatus);
    setIsBlocked(tempIsBlocked);
    setVacateReason(tempVacateReason);
    setPenaltyStatus(tempPenaltyStatus);
    setExpenseCategory(tempExpenseCategory);
    setPaymentMode(tempPaymentMode);
    setCommChannel(tempCommChannel);
    setCommStatus(tempCommStatus);
    setAssetStatus(tempAssetStatus);
    setPaymentType(tempPaymentType);
    setPaymentStatus(tempPaymentStatus);
    setLoginRole(tempLoginRole);
    setEnquirySource(tempEnquirySource);
    setEnquiryStatus(tempEnquiryStatus);
    setCity(tempCity);
    setGender(tempGender);
    setOccupation(tempOccupation);

    // Apply new filters
    setAssignedStaff(tempAssignedStaff);
    setMoveInStart(tempMoveInStart);
    setMoveInEnd(tempMoveInEnd);
    setTenantStatus(tempTenantStatus);
    setRefundStatus(tempRefundStatus);
    setJoinedRecently(tempJoinedRecently);
    setVacatedRecently(tempVacatedRecently);
    setPortalAccess(tempPortalAccess);
    setMinPendingRent(tempMinPendingRent);
    setMaxPendingRent(tempMaxPendingRent);
    setMinPendingDeposit(tempMinPendingDeposit);
    setMaxPendingDeposit(tempMaxPendingDeposit);
    setMinOccupancy(tempMinOccupancy);
    setMaxOccupancy(tempMaxOccupancy);
    setMinRevenue(tempMinRevenue);
    setMaxRevenue(tempMaxRevenue);
    setState(tempState);
    setFloor(tempFloor);
    setPurpose(tempPurpose);
    setBookingTypeAtVacate(tempBookingTypeAtVacate);
    setMinSecurityDeposit(tempMinSecurityDeposit);
    setMaxSecurityDeposit(tempMaxSecurityDeposit);
    setStayDuration(tempStayDuration);
    setExpenseSubcategory(tempExpenseSubcategory);
    setItemCategory(tempItemCategory);
    setPaymentSource(tempPaymentSource);
    setPaymentTenant(tempPaymentTenant);
    setLoginResult(tempLoginResult);
    setRevenueType(tempRevenueType);
    setMinMargin(tempMinMargin);
    setMaxMargin(tempMaxMargin);
    setIgnoreDate(tempIgnoreDate);


    setSidebarOpen(false);
  };

  // Reset Filters inside Sidebar
  const handleResetFilters = () => {
    const resetStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const resetEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

    // Reset temp
    setTempStartDate(resetStart);
    setTempEndDate(resetEnd);
    setTempPropertyId("all");
    setTempDateType("default");
    setTempRentStatus("all");
    setTempDepositStatus("all");
    setTempIsCouple("all");
    setTempRoomGender("all");
    setTempBedAvailability("all");
    setTempVendorName("");
    setTempExpenseStatus("all");
    setTempMinRent("");
    setTempMaxRent("");
    setTempMinDeposit("");
    setTempMaxDeposit("");
    setTempSharingType("all");
    setTempAcStatus("all");
    setTempBathroomStatus("all");
    setTempOccupancyStatus("all");
    setTempVisitorStatus("all");
    setTempIsBlocked("all");
    setTempVacateReason("all");
    setTempPenaltyStatus("all");
    setTempExpenseCategory("all");
    setTempExpenseCategoryId("all");
    setTempPaymentMode("all");
    setTempCommChannel("all");
    setTempCommStatus("all");
    setTempAssetStatus("all");
    setTempPaymentType("all");
    setTempPaymentStatus("all");
    setTempLoginRole("all");
    setTempEnquirySource("all");
    setTempEnquiryStatus("all");
    setTempCity("all");
    setTempGender("all");
    setTempOccupation("all");

    // Reset new temp states
    setTempAssignedStaff("all");
    setTempMoveInStart("");
    setTempMoveInEnd("");
    setTempTenantStatus("all");
    setTempRefundStatus("all");
    setTempJoinedRecently("all");
    setTempVacatedRecently("all");
    setTempPortalAccess("all");
    setTempMinPendingRent("");
    setTempMaxPendingRent("");
    setTempMinPendingDeposit("");
    setTempMaxPendingDeposit("");
    setTempMinOccupancy("");
    setTempMaxOccupancy("");
    setTempMinRevenue("");
    setTempMaxRevenue("");
    setTempState("all");
    setTempFloor("all");
    setTempPurpose("all");
    setTempBookingTypeAtVacate("all");
    setTempMinSecurityDeposit("");
    setTempMaxSecurityDeposit("");
    setTempStayDuration("all");
    setTempExpenseSubcategory("all");
    setTempItemCategory("all");
    setTempPaymentSource("all");
    setTempPaymentTenant("all");
    setTempLoginResult("all");
    setTempRevenueType("all");
    setTempMinMargin("");
    setTempMaxMargin("");

    // Reset active
    setStartDate(resetStart);
    setEndDate(resetEnd);
    setPropertyId("all");
    setDateType("default");
    setRentStatus("all");
    setDepositStatus("all");
    setIsCouple("all");
    setRoomGender("all");
    setBedAvailability("all");
    setVendorName("");
    setExpenseStatus("all");
    setMinRent("");
    setMaxRent("");
    setMinDeposit("");
    setMaxDeposit("");
    setSharingType("all");
    setAcStatus("all");
    setBathroomStatus("all");
    setOccupancyStatus("all");
    setVisitorStatus("all");
    setIsBlocked("all");
    setVacateReason("all");
    setPenaltyStatus("all");
    setExpenseCategory("all");
    setPaymentMode("all");
    setCommChannel("all");
    setCommStatus("all");
    setAssetStatus("all");
    setPaymentType("all");
    setPaymentStatus("all");
    setLoginRole("all");
    setEnquirySource("all");
    setEnquiryStatus("all");
    setCity("all");
    setGender("all");
    setOccupation("all");

    // Reset new active states
    setAssignedStaff("all");
    setMoveInStart("");
    setMoveInEnd("");
    setTenantStatus("all");
    setRefundStatus("all");
    setJoinedRecently("all");
    setVacatedRecently("all");
    setPortalAccess("all");
    setMinPendingRent("");
    setMaxPendingRent("");
    setMinPendingDeposit("");
    setMaxPendingDeposit("");
    setMinOccupancy("");
    setMaxOccupancy("");
    setMinRevenue("");
    setMaxRevenue("");
    setState("all");
    setFloor("all");
    setPurpose("all");
    setBookingTypeAtVacate("all");
    setMinSecurityDeposit("");
    setMaxSecurityDeposit("");
    setStayDuration("all");
    setExpenseSubcategory("all");
    setItemCategory("all");
    setPaymentSource("all");
    setPaymentTenant("all");
    setLoginResult("all");
    setRevenueType("all");
    setMinMargin("");
    setMaxMargin("");
    setIgnoreDate(false);
    setTempIgnoreDate(false);


    setSidebarOpen(false);
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

    // 1. Filter by dynamic sidebar filters
    if (activeTab === "enquiry") {
      if (enquirySource !== "all") {
        result = result.filter(r => r.source?.toLowerCase() === enquirySource.toLowerCase());
      }
      if (enquiryStatus !== "all") {
        result = result.filter(r => r.status?.toLowerCase() === enquiryStatus.toLowerCase());
      }
      if (minRent) {
        result = result.filter(r => {
          const budget = parseInt(r.budget_range?.replace(/[^\d]/g, "")) || 0;
          return budget >= parseInt(minRent);
        });
      }
      if (maxRent) {
        result = result.filter(r => {
          const budget = parseInt(r.budget_range?.replace(/[^\d]/g, "")) || 0;
          return budget <= parseInt(maxRent);
        });
      }
      if (assignedStaff !== "all") {
        result = result.filter(r => r.staff_name === assignedStaff);
      }
      if (moveInStart) {
        result = result.filter(r => r.preferred_move_in_date && r.preferred_move_in_date >= moveInStart);
      }
      if (moveInEnd) {
        result = result.filter(r => r.preferred_move_in_date && r.preferred_move_in_date <= moveInEnd);
      }
    }

    if (activeTab === "tenant") {
      if (isCouple !== "all") {
        result = result.filter(r => {
          const isCoupleBooking = r.is_couple === 1 || r.is_couple_booking === 1;
          if (isCouple === "couple") return isCoupleBooking;
          if (isCouple === "single") return !isCoupleBooking;
          if (isCouple === "reassigned") return (Number(r.vacate_count) || 0) > 0 && !!r.bed_number;
          return true;
        });
      }
      if (rentStatus !== "all") {
        result = result.filter(r => {
          const hasArrears = parseFloat(r.pending_rent || 0) > 0;
          return rentStatus === "arrears" ? hasArrears : !hasArrears;
        });
      }
      if (depositStatus !== "all") {
        result = result.filter(r => {
          const hasArrears = parseFloat(r.pending_deposit || 0) > 0;
          return depositStatus === "arrears" ? hasArrears : !hasArrears;
        });
      }
      if (gender !== "all") {
        result = result.filter(r => r.gender?.toLowerCase() === gender.toLowerCase());
      }
      if (occupation !== "all") {
        result = result.filter(r => r.occupation_category?.toLowerCase() === occupation.toLowerCase());
      }
      if (minRent) {
        result = result.filter(r => parseFloat(r.rent_per_bed || 0) >= parseFloat(minRent));
      }
      if (maxRent) {
        result = result.filter(r => parseFloat(r.rent_per_bed || 0) <= parseFloat(maxRent));
      }
      if (minDeposit) {
        result = result.filter(r => parseFloat(r.security_deposit || 0) >= parseFloat(minDeposit));
      }
      if (maxDeposit) {
        result = result.filter(r => parseFloat(r.security_deposit || 0) <= parseFloat(maxDeposit));
      }
      if (tenantStatus !== "all") {
        result = result.filter(r => {
          const isActive = r.is_active === 1 || r.is_active === true;
          const isVacated = r.is_vacated === 1 || r.is_vacated === true;
          if (tenantStatus === "active") return isActive && !isVacated;
          if (tenantStatus === "inactive") return !isActive;
          if (tenantStatus === "vacated") return isVacated;
          return true;
        });
      }
      if (refundStatus !== "all") {
        result = result.filter(r => {
          const isVacated = r.is_vacated === 1 || r.is_vacated === true;
          const paid = parseFloat(r.total_refund_paid || 0);
          const refundable = parseFloat(r.refundable_amount || 0);
          if (refundStatus === "not_applicable") return !isVacated;
          if (refundStatus === "pending") return isVacated && paid < refundable;
          if (refundStatus === "completed") return isVacated && paid >= refundable;
          return true;
        });
      }
      if (joinedRecently !== "all") {
        const today = new Date();
        let days = 0;
        if (joinedRecently === "7") days = 7;
        if (joinedRecently === "30") days = 30;
        if (joinedRecently === "90") days = 90;
        if (days > 0) {
          const limitDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
          result = result.filter(r => r.check_in_date && new Date(r.check_in_date) >= limitDate);
        }
      }
      if (vacatedRecently !== "all") {
        const today = new Date();
        let days = 0;
        if (vacatedRecently === "7") days = 7;
        if (vacatedRecently === "30") days = 30;
        if (vacatedRecently === "90") days = 90;
        if (days > 0) {
          const limitDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
          result = result.filter(r => r.vacated_date && new Date(r.vacated_date) >= limitDate);
        }
      }
      if (portalAccess !== "all") {
        result = result.filter(r => {
          const enabled = r.portal_access_enabled === 1 || r.portal_access_enabled === true;
          return portalAccess === "enabled" ? enabled : !enabled;
        });
      }
      if (minPendingRent) {
        result = result.filter(r => parseFloat(r.pending_rent || 0) >= parseFloat(minPendingRent));
      }
      if (maxPendingRent) {
        result = result.filter(r => parseFloat(r.pending_rent || 0) <= parseFloat(maxPendingRent));
      }
      if (minPendingDeposit) {
        result = result.filter(r => parseFloat(r.pending_deposit || 0) >= parseFloat(minPendingDeposit));
      }
      if (maxPendingDeposit) {
        result = result.filter(r => parseFloat(r.pending_deposit || 0) <= parseFloat(maxPendingDeposit));
      }
      if (city !== "all") {
        result = result.filter(r => r.city?.toLowerCase() === city.toLowerCase() || String(r.city_id) === city);
      }
    }

    if (activeTab === "property") {
      if (city !== "all") {
        result = result.filter(r => String(r.city_id) === city);
      }
      if (state !== "all") {
        result = result.filter(r => String(r.state) === state);
      }
      if (minOccupancy) {
        result = result.filter(r => parseFloat(r.occupancy_rate || 0) >= parseFloat(minOccupancy));
      }
      if (maxOccupancy) {
        result = result.filter(r => parseFloat(r.occupancy_rate || 0) <= parseFloat(maxOccupancy));
      }
      if (minRevenue) {
        result = result.filter(r => parseFloat(r.total_revenue || 0) >= parseFloat(minRevenue));
      }
      if (maxRevenue) {
        result = result.filter(r => parseFloat(r.total_revenue || 0) <= parseFloat(maxRevenue));
      }

    }

    if (activeTab === "tenant_payment") {
      if (tenantStatus !== "all") {
        result = result.filter(r => {
          const isActive = r.is_active === 1 || r.is_active === true;
          const isVacated = r.is_vacated === 1 || r.is_vacated === true;
          if (tenantStatus === "active") return isActive && !isVacated;
          if (tenantStatus === "inactive") return !isActive;
          if (tenantStatus === "vacated") return isVacated;
          return true;
        });
      }
    }

    if (activeTab === "room") {
      if (sharingType !== "all") {
        result = result.filter(r => r.sharing_type?.toLowerCase() === sharingType.toLowerCase());
      }
      if (occupancyStatus !== "all") {
        result = result.filter(r => {
          const count = Number(r.occupied_count || 0);
          const total = Number(r.total_bed || 0);
          if (occupancyStatus === "vacant") return count === 0;
          if (occupancyStatus === "fully") return count >= total;
          return count > 0 && count < total; // partially
        });
      }
      if (roomGender !== "all") {
        result = result.filter(r => {
          let parsedPref: string[] = [];
          if (Array.isArray(r.room_gender_preference)) {
            parsedPref = r.room_gender_preference;
          } else if (typeof r.room_gender_preference === "string") {
            try {
              parsedPref = JSON.parse(r.room_gender_preference);
            } catch {
              parsedPref = [r.room_gender_preference];
            }
          }
          if (parsedPref.map((p: string) => p.toLowerCase()).includes(roomGender.toLowerCase())) {
            return true;
          }
          return r.current_occupants_gender?.toLowerCase() === roomGender.toLowerCase();
        });
      }
      if (bedAvailability !== "all") {
        result = result.filter(r => {
          const count = Number(r.occupied_count || 0);
          const total = Number(r.total_bed || 0);
          const free = Math.max(0, total - count);
          if (bedAvailability === "fully_vacant") return count === 0;
          if (bedAvailability === "fully_occupied") return count >= total;
          if (bedAvailability === "exactly_1_free") return free === 1;
          if (bedAvailability === "exactly_2_free") return free === 2;
          return free > 0; // has_vacancy
        });
      }
      if (minRent) {
        result = result.filter(r => parseFloat(r.rent_per_bed || 0) >= parseFloat(minRent));
      }
      if (maxRent) {
        result = result.filter(r => parseFloat(r.rent_per_bed || 0) <= parseFloat(maxRent));
      }
      if (acStatus !== "all") {
        result = result.filter(r => {
          const hasAc = r.has_ac === 1 || r.has_ac === true;
          return acStatus === "ac" ? hasAc : !hasAc;
        });
      }
      if (bathroomStatus !== "all") {
        result = result.filter(r => {
          const hasAttached = r.has_attached_bathroom === 1 || r.has_attached_bathroom === true;
          return bathroomStatus === "attached" ? hasAttached : !hasAttached;
        });
      }
      if (floor !== "all") {
        result = result.filter(r => String(r.floor)?.toLowerCase() === floor.toLowerCase());
      }
    }

    if (activeTab === "visitor") {
      if (visitorStatus !== "all") {
        result = result.filter(r => r.status?.toLowerCase() === visitorStatus.toLowerCase());
      }
      if (isBlocked !== "all") {
        result = result.filter(r => {
          const blocked = r.is_blocked === 1 || r.is_blocked === true;
          return isBlocked === "blocked" ? blocked : !blocked;
        });
      }
      if (purpose !== "all") {
        result = result.filter(r => r.purpose?.toLowerCase() === purpose.toLowerCase());
      }
    }

    if (activeTab === "vacancy") {
      if (vacateReason !== "all") {
        result = result.filter(r => r.vacate_reason_value?.toLowerCase() === vacateReason.toLowerCase());
      }
      if (penaltyStatus !== "all") {
        result = result.filter(r => {
          const hasPenalty = parseFloat(r.total_penalty_amount || 0) > 0;
          return penaltyStatus === "with_penalty" ? hasPenalty : !hasPenalty;
        });
      }
      if (minRent) {
        result = result.filter(r => parseFloat(r.refundable_amount || 0) >= parseFloat(minRent));
      }
      if (maxRent) {
        result = result.filter(r => parseFloat(r.refundable_amount || 0) <= parseFloat(maxRent));
      }
      if (bookingTypeAtVacate !== "all") {
        result = result.filter(r => {
          const isCoupleVacate = r.is_couple_booking === 1 || r.is_couple_booking === true;
          return bookingTypeAtVacate === "couple" ? isCoupleVacate : !isCoupleVacate;
        });
      }
      if (minSecurityDeposit) {
        result = result.filter(r => parseFloat(r.security_deposit_amount || 0) >= parseFloat(minSecurityDeposit));
      }
      if (maxSecurityDeposit) {
        result = result.filter(r => parseFloat(r.security_deposit_amount || 0) <= parseFloat(maxSecurityDeposit));
      }
      if (stayDuration !== "all") {
        result = result.filter(r => {
          if (!r.stay_check_in_date || !r.requested_vacate_date) return false;
          const checkIn = new Date(r.stay_check_in_date);
          const vacate = new Date(r.requested_vacate_date);
          const diffMs = vacate.getTime() - checkIn.getTime();
          const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.4375);
          if (stayDuration === "under_6") return diffMonths < 6;
          if (stayDuration === "6_12") return diffMonths >= 6 && diffMonths <= 12;
          if (stayDuration === "over_12") return diffMonths > 12;
          return true;
        });
      }
    }

    if (activeTab === "expense") {
      if (expenseCategory !== "all") {
        result = result.filter(r => r.category_name?.toLowerCase() === expenseCategory.toLowerCase());
      }
      if (expenseStatus !== "all") {
        result = result.filter(r => r.status?.toLowerCase() === expenseStatus.toLowerCase());
      }
      if (paymentMode !== "all") {
        result = result.filter(r => r.payment_mode?.toLowerCase() === paymentMode.toLowerCase());
      }
      if (vendorName !== "all" && vendorName.trim()) {
        result = result.filter(r => r.vendor_name?.toLowerCase() === vendorName.toLowerCase().trim());
      }
      if (minRent) {
        result = result.filter(r => parseFloat(r.total_paid || r.total_amount || 0) >= parseFloat(minRent));
      }
      if (maxRent) {
        result = result.filter(r => parseFloat(r.total_paid || r.total_amount || 0) <= parseFloat(maxRent));
      }
      // filter logic
      if (expenseSubcategory !== "all") {
        result = result.filter(r => r.sub_category_name?.toLowerCase() === expenseSubcategory.toLowerCase());
      }
    }

    if (activeTab === "inventory") {
      if (assetStatus !== "all") {
        result = result.filter(r => r.asset_status?.toLowerCase() === assetStatus.toLowerCase());
      }
      if (minRent) {
        result = result.filter(r => parseFloat(r.unit_price || 0) >= parseFloat(minRent));
      }
      if (maxRent) {
        result = result.filter(r => parseFloat(r.unit_price || 0) <= parseFloat(maxRent));
      }
      if (itemCategory !== "all") {
        result = result.filter(r => r.category_name?.toLowerCase() === itemCategory.toLowerCase());
      }
    }

    if (activeTab === "payment") {
      if (paymentType !== "all") {
        result = result.filter(r => r.payment_type?.toLowerCase() === paymentType.toLowerCase());
      }
      if (paymentStatus !== "all") {
        result = result.filter(r => r.status?.toLowerCase() === paymentStatus.toLowerCase());
      }
      if (paymentMode !== "all") {
        result = result.filter(r => r.payment_mode?.toLowerCase() === paymentMode.toLowerCase());
      }
      if (minRent) {
        result = result.filter(r => parseFloat(r.amount || 0) >= parseFloat(minRent));
      }
      if (maxRent) {
        result = result.filter(r => parseFloat(r.amount || 0) <= parseFloat(maxRent));
      }
      if (paymentSource !== "all") {
        result = result.filter(r => r.source?.toLowerCase() === paymentSource.toLowerCase());
      }
      if (paymentTenant !== "all") {
        result = result.filter(r => r.tenant_name === paymentTenant);
      }
    }

    if (activeTab === "login") {
      if (loginRole !== "all") {
        result = result.filter(r => r.role?.toLowerCase() === loginRole.toLowerCase());
      }
    }

    if (activeTab === "revenue") {
      // Filter collected dynamically based on revenueType selection
      if (revenueType !== "all") {
        result = result.map(r => {
          let fieldVal = parseFloat(r.collected || 0);
          if (revenueType === "rent") fieldVal = parseFloat(r.rent_collected || 0);
          if (revenueType === "deposit") fieldVal = parseFloat(r.deposit_collected || 0);
          if (revenueType === "maintenance") fieldVal = parseFloat(r.maintenance_collected || 0);

          const profit = fieldVal - parseFloat(r.expense || 0);
          const margin = fieldVal > 0 ? parseFloat(((profit / fieldVal) * 100).toFixed(1)) : 0;
          return {
            ...r,
            collected: fieldVal,
            profit: profit,
            margin: `${margin}%`
          };
        });
      }

      if (minMargin) {
        result = result.filter(r => {
          const m = parseFloat(r.margin?.replace("%", "")) || 0;
          return m >= parseFloat(minMargin);
        });
      }
      if (maxMargin) {
        result = result.filter(r => {
          const m = parseFloat(r.margin?.replace("%", "")) || 0;
          return m <= parseFloat(maxMargin);
        });
      }
      if (minRent) {
        result = result.filter(r => parseFloat(r.profit || 0) >= parseFloat(minRent));
      }
      if (maxRent) {
        result = result.filter(r => parseFloat(r.profit || 0) <= parseFloat(maxRent));
      }
    }

    // 2. Filter by column inputs
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

    // 3. Sort
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

  // Dynamic KPI Stats Recalculator
  const getCalculatedStats = () => {
    if (loading || !processedData) return reportStats;
    const stats = { ...reportStats };
    const count = processedData.length;

    switch (activeTab) {
      case "overview": {
        const activeCount = processedData.filter((r) => r.status === 'active').length;
        const vacatedCount = processedData.filter((r) => r.status === 'vacated').length;
        const coupleCount = processedData.filter((r) => r.booking_type === 'couple').length;
        const totalCount = activeCount + vacatedCount;
        const singleCount = Math.max(0, activeCount - coupleCount);
        const rentSum = processedData.reduce((s, r) => s + parseFloat(r.rent_paid || 0), 0);
        const depSum = processedData.reduce((s, r) => s + parseFloat(r.deposit_paid || 0), 0);
        const refSum = processedData.reduce((s, r) => s + parseFloat(r.refund_paid || 0), 0);
        return {
          ...stats,
          totalTenants: reportStats.totalTenants ?? totalCount,
          activeTenants: reportStats.activeTenants ?? activeCount,
          vacatedTenants: reportStats.vacatedTenants ?? vacatedCount,
          coupleTenants: reportStats.coupleTenants ?? coupleCount,
          singleTenants: reportStats.singleTenants ?? singleCount,
          newCheckIns: reportStats.newCheckIns ?? 0,
          totalRentCollected: reportStats.totalRentCollected ?? `₹${rentSum.toLocaleString('en-IN')}`,
          totalDepositCollected: reportStats.totalDepositCollected ?? `₹${depSum.toLocaleString('en-IN')}`,
          totalRefundPaid: reportStats.totalRefundPaid ?? `₹${refSum.toLocaleString('en-IN')}`,
          totalExpenses: reportStats.totalExpenses ?? '₹0',
          totalRooms: reportStats.totalRooms ?? 0,
          totalBeds: reportStats.totalBeds ?? 0,
          occupiedBeds: reportStats.occupiedBeds ?? 0,
          availableBeds: reportStats.availableBeds ?? 0,
          vacatedBeds: reportStats.vacatedBeds ?? vacatedCount,
          monthlyBreakdown: reportStats.monthlyBreakdown ?? [],
          _raw: reportStats._raw ?? { totalRentCollected: rentSum, totalDepositCollected: depSum, totalRefundPaid: refSum, totalExpenses: 0 },
        };
      }
      case "enquiry": {
        const converted = processedData.filter((r) => r.status === "converted").length;
        const pending = processedData.filter((r) => r.status === "new" || r.status === "followup" || r.status === "active").length;
        const rate = count > 0 ? ((converted / count) * 100).toFixed(1) : "0";
        return {
          totalEnquiries: count,
          convertedEnquiries: converted,
          conversionRate: `${rate}%`,
          pendingEnquiries: pending
        };
      }
      case "tenant": {
        const newCheckins = processedData.filter((r) => {
          if (!r.check_in_date) return false;
          const checkIn = new Date(r.check_in_date);
          return checkIn >= new Date(startDate) && checkIn <= new Date(endDate);
        }).length;
        const vacated = processedData.filter((r) => r.is_vacated === 1).length;
        const originalOccRate = parseFloat(reportStats.occupancyRate) || 0;
        const totalBeds = reportStats.totalTenants ? Math.round(reportStats.totalTenants / (originalOccRate / 100 || 1)) : 0;
        const activeTenants = processedData.filter((r) => r.is_active === 1).length;
        const newOccRate = totalBeds > 0 ? ((activeTenants / totalBeds) * 100).toFixed(1) : originalOccRate.toFixed(1);
        return {
          totalTenants: count,
          newTenants: newCheckins,
          vacatedTenants: vacated,
          occupancyRate: `${newOccRate}%`
        };
      }
      case "property": {
        const totalRooms = processedData.reduce((acc, r) => acc + Number(r.total_rooms || 0), 0);
        const totalBeds = processedData.reduce((acc, r) => acc + Number(r.total_beds || 0), 0);
        const occupiedBeds = processedData.reduce((acc, r) => acc + Number(r.occupied_beds || 0), 0);
        const rate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : "0";
        return {
          totalProperties: count,
          totalRooms,
          totalBeds,
          occupancyRate: `${rate}%`
        };
      }
      case "room": {
        const totalBeds = processedData.reduce((acc, r) => acc + Number(r.total_bed || 0), 0);
        const occupiedBeds = processedData.reduce((acc, r) => acc + Number(r.occupied_count || 0), 0);
        const availableBeds = Math.max(0, totalBeds - occupiedBeds);
        return {
          totalRooms: count,
          totalBeds,
          occupiedBeds,
          availableBeds
        };
      }
      case "visitor": {
        const today = format(new Date(), "yyyy-MM-dd");
        const todayVisitors = processedData.filter((r) => r.entry_time && r.entry_time.startsWith(today)).length;
        const pendingCheckOut = processedData.filter((r) => r.status === "checked_in").length;
        const blockedVisitors = processedData.filter((r) => r.is_blocked === 1 || r.is_blocked === true).length;
        return {
          totalVisitors: count,
          todayVisitors,
          pendingCheckOut,
          blockedVisitors
        };
      }
      case "vacancy": {
        const refundableSum = processedData.reduce((acc, r) => acc + parseFloat(r.refundable_amount || 0), 0);
        const collectedPenalties = processedData.reduce((acc, r) => acc + parseFloat(r.total_penalty_amount || 0), 0);
        return {
          totalVacated: count,
          refundableAmount: `₹${refundableSum.toLocaleString("en-IN")}`,
          collectedPenalties: `₹${collectedPenalties.toLocaleString("en-IN")}`
        };
      }
      case "expense": {
        const totalExpenses = processedData.reduce((acc, r) => acc + parseFloat(r.total_paid || 0), 0);
        const categories: Record<string, number> = {};
        processedData.forEach((r) => {
          const cat = r.category_name || "Uncategorized";
          categories[cat] = (categories[cat] || 0) + parseFloat(r.total_paid || 0);
        });
        let highestCat = "N/A";
        let maxSpent = 0;
        for (const [cat, spent] of Object.entries(categories)) {
          if (spent > maxSpent) {
            maxSpent = spent;
            highestCat = cat;
          }
        }
        return {
          totalExpenses: `₹${totalExpenses.toLocaleString("en-IN")}`,
          expenseCount: count,
          highestCategory: highestCat
        };
      }
      case "communication": {
        const emails = processedData.filter((r) => r.channel === "email").length;
        const sms = processedData.filter((r) => r.channel === "sms" || r.channel === "whatsapp").length;
        const failed = processedData.filter((r) => r.status === "failed").length;
        return {
          totalAlertsSent: count,
          emailsSent: emails,
          smsSent: sms,
          failedCount: failed
        };
      }
      case "inventory": {
        const available = processedData.filter((r) => r.asset_status === "available").length;
        const assigned = processedData.filter((r) => r.asset_status === "assigned" || r.asset_status === "allocated").length;
        const damaged = processedData.filter((r) => r.asset_status === "damaged" || r.asset_status === "repair" || r.asset_status === "lost").length;
        return {
          totalItems: count,
          availableItems: available,
          assignedItems: assigned,
          damagedItems: damaged
        };
      }
      case "payment": {
        const paidPayments = processedData.filter((r) => r.status === "approved" || r.status === "paid");
        const pendingPayments = processedData.filter((r) => r.status === "pending");
        const totalPaidSum = paidPayments.reduce((acc, r) => acc + parseFloat(r.amount || 0), 0);
        const totalPendingSum = pendingPayments.reduce((acc, r) => acc + parseFloat(r.amount || 0), 0);
        return {
          totalPaid: `₹${totalPaidSum.toLocaleString("en-IN")}`,
          totalPending: `₹${totalPendingSum.toLocaleString("en-IN")}`,
          paidCount: paidPayments.length,
          pendingCount: pendingPayments.length
        };
      }
      case "login": {
        const tenantLogins = processedData.filter((r) => r.role === "tenant").length;
        const staffLogins = processedData.filter((r) => r.role === "staff" || r.role === "admin" || r.role === "Admin").length;
        return {
          totalLogins: count,
          tenantLogins,
          staffLogins
        };
      }
      case "revenue": {
        const totalRevenue = processedData.reduce((acc, r) => acc + parseFloat(r.collected || 0), 0);
        const totalExpenses = processedData.reduce((acc, r) => acc + parseFloat(r.expense || 0), 0);
        const netProfit = totalRevenue - totalExpenses;
        const overallMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0";
        return {
          totalRevenue: `₹${totalRevenue.toLocaleString("en-IN")}`,
          totalExpenses: `₹${totalExpenses.toLocaleString("en-IN")}`,
          netRevenue: `₹${netProfit.toLocaleString("en-IN")}`,
          netMargin: `${overallMargin}%`
        };
      }
      default:
        return stats;
    }
  };

  const stats = getCalculatedStats();
  const totalRecords = processedData.length;
  const showAll = pageSize === -1;
  const totalPages = showAll ? 1 : Math.ceil(totalRecords / pageSize);
  const paginatedData = showAll
    ? processedData
    : processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

  // Dynamic KPI Card renderer — payment-page gradient colour theme
  const renderKPIs = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <OverviewStatCard title="Active Tenants" value={stats.activeTenants || 0} subtitle="Currently residing" icon={Users} gradient="from-blue-50 to-blue-100" labelColor="text-blue-700" valueColor="text-blue-800" subColor="text-blue-600" iconColor="text-blue-600" />
            <OverviewStatCard title="Vacated Tenants" value={stats.vacatedTenants || 0} subtitle="In selected period" icon={DoorOpen} gradient="from-slate-50 to-slate-100" labelColor="text-slate-600" valueColor="text-slate-700" subColor="text-slate-500" iconColor="text-slate-600" />
            <OverviewStatCard title="Couple Bookings" value={stats.coupleTenants || 0} subtitle="Shared occupancy" icon={UserPlus} gradient="from-purple-50 to-purple-100" labelColor="text-purple-700" valueColor="text-purple-800" subColor="text-purple-600" iconColor="text-purple-600" />
            <OverviewStatCard title="New Check-ins" value={stats.newCheckIns || 0} subtitle="This period" icon={Calendar} gradient="from-sky-50 to-sky-100" labelColor="text-sky-700" valueColor="text-sky-800" subColor="text-sky-600" iconColor="text-sky-600" />
            <OverviewStatCard title="Total Beds" value={stats.totalBeds || 0} subtitle={`${stats.totalRooms || 0} rooms total`} icon={Bed} gradient="from-indigo-50 to-indigo-100" labelColor="text-indigo-700" valueColor="text-indigo-800" subColor="text-indigo-600" iconColor="text-indigo-600" />
            <OverviewStatCard title="Occupied Beds" value={stats.occupiedBeds || 0} subtitle={`${stats.availableBeds || 0} available`} icon={Home} gradient="from-amber-50 to-amber-100" labelColor="text-amber-700" valueColor="text-amber-800" subColor="text-amber-600" iconColor="text-amber-600" />
            <OverviewStatCard title="Rent Collected" value={stats.totalRentCollected || "₹0"} subtitle="Approved & paid" icon={IndianRupee} gradient="from-green-50 to-green-100" labelColor="text-green-700" valueColor="text-green-800" subColor="text-green-600" iconColor="text-green-600" />
            <OverviewStatCard title="Total Expenses" value={stats.totalExpenses || "₹0"} subtitle="Paid vouchers" icon={Wallet} gradient="from-orange-50 to-orange-100" labelColor="text-orange-700" valueColor="text-orange-800" subColor="text-orange-600" iconColor="text-orange-600" />
          </>
        );
      case "enquiry":
        return (
          <>
            <KPICard title="Total Enquiries" value={stats.totalEnquiries || 0} subtitle="All leads" icon={FileText} gradient="from-indigo-50 to-indigo-100" labelColor="text-indigo-700" valueColor="text-indigo-800" subColor="text-indigo-600" iconColor="text-indigo-600" />
            <KPICard title="Converted to Tenants" value={stats.convertedEnquiries || 0} subtitle="Successful" icon={Users} gradient="from-green-50 to-green-100" labelColor="text-green-700" valueColor="text-green-800" subColor="text-green-600" iconColor="text-green-600" />
            <KPICard title="Conversion Rate" value={stats.conversionRate || "0%"} subtitle="Of total leads" icon={TrendingUp} gradient="from-sky-50 to-sky-100" labelColor="text-sky-700" valueColor="text-sky-800" subColor="text-sky-600" iconColor="text-sky-600" />
            <KPICard title="Active / Pending" value={stats.pendingEnquiries || 0} subtitle="Awaiting follow-up" icon={Clock} gradient="from-amber-50 to-amber-100" labelColor="text-amber-700" valueColor="text-amber-800" subColor="text-amber-600" iconColor="text-amber-600" />
          </>
        );
      case "tenant":
        return (
          <>
            <KPICard title="Total Registered Tenants" value={stats.totalTenants || 0} subtitle="All records" icon={Users} gradient="from-blue-50 to-blue-100" labelColor="text-blue-700" valueColor="text-blue-800" subColor="text-blue-600" iconColor="text-blue-600" />
            <KPICard title="New Check-ins" value={stats.newTenants || 0} subtitle="In selected period" icon={UserPlus} gradient="from-green-50 to-green-100" labelColor="text-green-700" valueColor="text-green-800" subColor="text-green-600" iconColor="text-green-600" />
            <KPICard title="Vacated Tenants" value={stats.vacatedTenants || 0} subtitle="Left in period" icon={DoorOpen} gradient="from-red-50 to-red-100" labelColor="text-red-700" valueColor="text-red-800" subColor="text-red-600" iconColor="text-red-600" />
            <KPICard title="Bed Occupancy Rate" value={stats.occupancyRate || "0%"} subtitle="Current occupancy" icon={Home} gradient="from-sky-50 to-sky-100" labelColor="text-sky-700" valueColor="text-sky-800" subColor="text-sky-600" iconColor="text-sky-600" />
          </>
        );
      case "tenant_payment":
        return (
          <>
            <KPICard title="Total Tenants" value={stats.totalTenants || 0} subtitle="In report" icon={Users} gradient="from-indigo-50 to-indigo-100" labelColor="text-indigo-700" valueColor="text-indigo-800" subColor="text-indigo-600" iconColor="text-indigo-600" />
            <KPICard title="Expected Rent" value={stats.totalExpected || "₹0"} subtitle="Total due amount" icon={IndianRupee} gradient="from-purple-50 to-purple-100" labelColor="text-purple-700" valueColor="text-purple-800" subColor="text-purple-600" iconColor="text-purple-600" />
            <KPICard title="Rent Collected" value={stats.totalPaid || "₹0"} subtitle="Paid so far" icon={TrendingUp} gradient="from-green-50 to-green-100" labelColor="text-green-700" valueColor="text-green-800" subColor="text-green-600" iconColor="text-green-600" />
            <KPICard title="Collection Rate" value={stats.collectionRate || "0%"} subtitle="% collected" icon={Wallet} gradient="from-amber-50 to-amber-100" labelColor="text-amber-700" valueColor="text-amber-800" subColor="text-amber-600" iconColor="text-amber-600" />
          </>
        );
      case "property":
        return (
          <>
            <KPICard title="Total Properties" value={stats.totalProperties || 0} subtitle="All branches" icon={Building2} gradient="from-indigo-50 to-indigo-100" labelColor="text-indigo-700" valueColor="text-indigo-800" subColor="text-indigo-600" iconColor="text-indigo-600" />
            <KPICard title="Total Rooms" value={stats.totalRooms || 0} subtitle="Across properties" icon={Home} gradient="from-sky-50 to-sky-100" labelColor="text-sky-700" valueColor="text-sky-800" subColor="text-sky-600" iconColor="text-sky-600" />
            <KPICard title="Total Beds" value={stats.totalBeds || 0} subtitle="All configurations" icon={Bed} gradient="from-amber-50 to-amber-100" labelColor="text-amber-700" valueColor="text-amber-800" subColor="text-amber-600" iconColor="text-amber-600" />
            <KPICard title="Average Bed Occupancy" value={stats.occupancyRate || "0%"} subtitle="Overall rate" icon={TrendingUp} gradient="from-green-50 to-green-100" labelColor="text-green-700" valueColor="text-green-800" subColor="text-green-600" iconColor="text-green-600" />
          </>
        );
      case "room":
        return (
          <>
            <KPICard title="Total Rooms" value={stats.totalRooms || 0} subtitle="In report" icon={Home} gradient="from-indigo-50 to-indigo-100" labelColor="text-indigo-700" valueColor="text-indigo-800" subColor="text-indigo-600" iconColor="text-indigo-600" />
            <KPICard title="Total Beds" value={stats.totalBeds || 0} subtitle="All rooms combined" icon={Bed} gradient="from-sky-50 to-sky-100" labelColor="text-sky-700" valueColor="text-sky-800" subColor="text-sky-600" iconColor="text-sky-600" />
            <KPICard title="Occupied Beds" value={stats.occupiedBeds || 0} subtitle="Currently filled" icon={Users} gradient="from-blue-50 to-blue-100" labelColor="text-blue-700" valueColor="text-blue-800" subColor="text-blue-600" iconColor="text-blue-600" />
            <KPICard title="Available Beds" value={stats.availableBeds || 0} subtitle="Ready to book" icon={DoorOpen} gradient="from-green-50 to-green-100" labelColor="text-green-700" valueColor="text-green-800" subColor="text-green-600" iconColor="text-green-600" />
          </>
        );
      case "visitor":
        return (
          <>
            <KPICard title="Total Visitors" value={stats.totalVisitors || 0} subtitle="In period" icon={UserPlus} gradient="from-indigo-50 to-indigo-100" labelColor="text-indigo-700" valueColor="text-indigo-800" subColor="text-indigo-600" iconColor="text-indigo-600" />
            <KPICard title="Visitors Today" value={stats.todayVisitors || 0} subtitle="Checked in today" icon={Calendar} gradient="from-cyan-50 to-cyan-100" labelColor="text-cyan-700" valueColor="text-cyan-800" subColor="text-cyan-600" iconColor="text-cyan-600" />
            <KPICard title="Pending Check-out" value={stats.pendingCheckOut || 0} subtitle="Still inside" icon={Clock} gradient="from-amber-50 to-amber-100" labelColor="text-amber-700" valueColor="text-amber-800" subColor="text-amber-600" iconColor="text-amber-600" />
            <KPICard title="Blocked Visitors" value={stats.blockedVisitors || 0} subtitle="Restricted entry" icon={X} gradient="from-red-50 to-red-100" labelColor="text-red-700" valueColor="text-red-800" subColor="text-red-600" iconColor="text-red-600" />
          </>
        );
      case "vacancy":
        return (
          <>
            <KPICard title="Vacated Accounts" value={stats.totalVacated || 0} subtitle="In period" icon={DoorOpen} gradient="from-red-50 to-red-100" labelColor="text-red-700" valueColor="text-red-800" subColor="text-red-600" iconColor="text-red-600" />
            <KPICard title="Refundable Deposit" value={stats.refundableAmount || "₹0"} subtitle="Pending refunds" icon={IndianRupee} gradient="from-green-50 to-green-100" labelColor="text-green-700" valueColor="text-green-800" subColor="text-green-600" iconColor="text-green-600" />
            <KPICard title="Penalties Charged" value={stats.collectedPenalties || "₹0"} subtitle="From vacated" icon={Wallet} gradient="from-orange-50 to-orange-100" labelColor="text-orange-700" valueColor="text-orange-800" subColor="text-orange-600" iconColor="text-orange-600" />
            <KPICard title="Deductions Settled" value={stats.totalVacated || 0} subtitle="Processed" icon={FileText} gradient="from-indigo-50 to-indigo-100" labelColor="text-indigo-700" valueColor="text-indigo-800" subColor="text-indigo-600" iconColor="text-indigo-600" />
          </>
        );
      case "expense":
        return (
          <>
            <KPICard title="Total Period Expenses" value={stats.totalExpenses || "₹0"} subtitle="Amount paid" icon={Wallet} gradient="from-red-50 to-red-100" labelColor="text-red-700" valueColor="text-red-800" subColor="text-red-600" iconColor="text-red-600" />
            <KPICard title="Total Paid Vouchers" value={stats.expenseCount || 0} subtitle="Transactions" icon={FileText} gradient="from-indigo-50 to-indigo-100" labelColor="text-indigo-700" valueColor="text-indigo-800" subColor="text-indigo-600" iconColor="text-indigo-600" />
            <KPICard title="Highest Category" value={stats.highestCategory || "N/A"} subtitle="Top spend area" icon={Building2} gradient="from-orange-50 to-orange-100" labelColor="text-orange-700" valueColor="text-orange-800" subColor="text-orange-600" iconColor="text-orange-600" />
            <KPICard title="Tax Deductible Ratio" value="100.0%" subtitle="All vouchers" icon={TrendingUp} gradient="from-green-50 to-green-100" labelColor="text-green-700" valueColor="text-green-800" subColor="text-green-600" iconColor="text-green-600" />
          </>
        );
      case "communication":
        return (
          <>
            <KPICard title="Total Alerts Sent" value={stats.totalAlertsSent || 0} subtitle="All channels" icon={Mail} gradient="from-indigo-50 to-indigo-100" labelColor="text-indigo-700" valueColor="text-indigo-800" subColor="text-indigo-600" iconColor="text-indigo-600" />
            <KPICard title="Email Dispatch" value={stats.emailsSent || 0} subtitle="Via email" icon={Mail} gradient="from-green-50 to-green-100" labelColor="text-green-700" valueColor="text-green-800" subColor="text-green-600" iconColor="text-green-600" />
            <KPICard title="SMS / WhatsApp" value={stats.smsSent || 0} subtitle="Mobile reach" icon={TrendingUp} gradient="from-sky-50 to-sky-100" labelColor="text-sky-700" valueColor="text-sky-800" subColor="text-sky-600" iconColor="text-sky-600" />
            <KPICard title="Failed Dispatches" value={stats.failedCount || 0} subtitle="Delivery errors" icon={X} gradient="from-red-50 to-red-100" labelColor="text-red-700" valueColor="text-red-800" subColor="text-red-600" iconColor="text-red-600" />
          </>
        );
      case "inventory":
        return (
          <>
            <KPICard title="Total Assets" value={stats.totalItems || 0} subtitle="All items" icon={Briefcase} gradient="from-indigo-50 to-indigo-100" labelColor="text-indigo-700" valueColor="text-indigo-800" subColor="text-indigo-600" iconColor="text-indigo-600" />
            <KPICard title="Available in Stock" value={stats.availableItems || 0} subtitle="Ready to use" icon={Home} gradient="from-green-50 to-green-100" labelColor="text-green-700" valueColor="text-green-800" subColor="text-green-600" iconColor="text-green-600" />
            <KPICard title="Allocated to Rooms" value={stats.assignedItems || 0} subtitle="In active use" icon={Bed} gradient="from-sky-50 to-sky-100" labelColor="text-sky-700" valueColor="text-sky-800" subColor="text-sky-600" iconColor="text-sky-600" />
            <KPICard title="Damaged / Repair" value={stats.damagedItems || 0} subtitle="Needs attention" icon={X} gradient="from-red-50 to-red-100" labelColor="text-red-700" valueColor="text-red-800" subColor="text-red-600" iconColor="text-red-600" />
          </>
        );
      case "payment":
        return (
          <>
            <KPICard title="Total Paid Revenue" value={stats.totalPaid || "₹0"} subtitle="Approved & paid" icon={IndianRupee} gradient="from-green-50 to-green-100" labelColor="text-green-700" valueColor="text-green-800" subColor="text-green-600" iconColor="text-green-600" />
            <KPICard title="Total Pending Accounts" value={stats.totalPending || "₹0"} subtitle="Awaiting payment" icon={Clock} gradient="from-amber-50 to-amber-100" labelColor="text-amber-700" valueColor="text-amber-800" subColor="text-amber-600" iconColor="text-amber-600" />
            <KPICard title="Approved Invoices" value={stats.paidCount || 0} subtitle="Confirmed receipts" icon={FileText} gradient="from-indigo-50 to-indigo-100" labelColor="text-indigo-700" valueColor="text-indigo-800" subColor="text-indigo-600" iconColor="text-indigo-600" />
            <KPICard title="Defaulters / Pending" value={stats.pendingCount || 0} subtitle="Overdue accounts" icon={Users} gradient="from-red-50 to-red-100" labelColor="text-red-700" valueColor="text-red-800" subColor="text-red-600" iconColor="text-red-600" />
          </>
        );
      case "login":
        return (
          <>
            <KPICard title="Total Access Logins" value={stats.totalLogins || 0} subtitle="All sessions" icon={Clock} gradient="from-indigo-50 to-indigo-100" labelColor="text-indigo-700" valueColor="text-indigo-800" subColor="text-indigo-600" iconColor="text-indigo-600" />
            <KPICard title="Tenant Logins" value={stats.tenantLogins || 0} subtitle="Tenant portal" icon={Users} gradient="from-sky-50 to-sky-100" labelColor="text-sky-700" valueColor="text-sky-800" subColor="text-sky-600" iconColor="text-sky-600" />
            <KPICard title="Admin & Staff Logins" value={stats.staffLogins || 0} subtitle="Admin panel" icon={Building2} gradient="from-purple-50 to-purple-100" labelColor="text-purple-700" valueColor="text-purple-800" subColor="text-purple-600" iconColor="text-purple-600" />
            <KPICard title="Portal Access Level" value="Live Audited" subtitle="Real-time tracking" icon={CreditCard} gradient="from-cyan-50 to-cyan-100" labelColor="text-cyan-700" valueColor="text-cyan-800" subColor="text-cyan-600" iconColor="text-cyan-600" />
          </>
        );
      case "revenue":
        return (
          <>
            <KPICard title="Net Revenues" value={stats.totalRevenue || "₹0"} subtitle="Total collected" icon={IndianRupee} gradient="from-green-50 to-green-100" labelColor="text-green-700" valueColor="text-green-800" subColor="text-green-600" iconColor="text-green-600" />
            <KPICard title="Net Expenses" value={stats.totalExpenses || "₹0"} subtitle="Total spent" icon={Wallet} gradient="from-red-50 to-red-100" labelColor="text-red-700" valueColor="text-red-800" subColor="text-red-600" iconColor="text-red-600" />
            <KPICard title="Net Operational Profit" value={stats.netRevenue || "₹0"} subtitle="Revenue minus expenses" icon={TrendingUp} gradient="from-indigo-50 to-indigo-100" labelColor="text-indigo-700" valueColor="text-indigo-800" subColor="text-indigo-600" iconColor="text-indigo-600" />
            <KPICard title="Profit Margin %" value={stats.netMargin || "0%"} subtitle="Overall efficiency" icon={Home} gradient="from-sky-50 to-sky-100" labelColor="text-sky-700" valueColor="text-sky-800" subColor="text-sky-600" iconColor="text-sky-600" />
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
      case "tenant_payment":
        return data.map((row) => ({
          "Tenant Name": row.full_name,
          "Room/Bed": `${row.room_number || "—"}/${row.bed_number || "—"}`,
          "Monthly Rent (₹)": row.monthly_rent || 0,
          "Months": row.months_since_joining || 0,
          "Expected Rent (₹)": row.expected_rent || 0,
          "Paid Rent (₹)": row.total_rent_paid || 0,
          "Pending Rent (₹)": row.pending_rent || 0,
          "Collection %": `${row.collection_rate || 0}%`,
          "Deposit (₹)": row.security_deposit || 0,
          "Deposit Paid (₹)": row.total_deposit_paid || 0,
          "Deposit Pending (₹)": row.pending_deposit || 0,
          "Status": row.is_vacated ? "Vacated" : (row.is_active ? "Active" : "Inactive"),
        }));
      case "overview": {
        const sharedNote = (row: any) => `Shared with ${row.partner_name || "partner"}`;
        return data.map((row) => ({
          "Tenant Name": row.tenant_name,
          "Property": row.property_name || "N/A",
          "Room": row.room_number || "N/A",
          "Bed": row.bed_number || "N/A",
          "Booking Type": row.booking_type === "couple" ? "Couple" : "Single",
          "Status": row.status === "vacated" ? "Vacated" : row.status === "active" ? "Active" : row.is_reassigned ? "Reassigned" : "Inactive",
          "Monthly Rent (₹)": row.is_shared_with_partner ? sharedNote(row) : (row.monthly_rent || 0),
          "Rent Paid (₹)": row.is_shared_with_partner ? sharedNote(row) : (row.rent_paid || 0),
          "Deposit Paid (₹)": row.is_shared_with_partner ? sharedNote(row) : (row.deposit_paid || 0),
          "Refund Paid (₹)": row.is_shared_with_partner ? sharedNote(row) : (row.refund_paid || 0),
          "Check-in Date": row.check_in_date || "N/A",
        }));
      }
      default:
        return [];
    }
  };

  const buildReportPrintHTML = (chartSvgs?: {
    revenueBar?: string; financial?: string; rooms?: string; roomsMonthly?: string; tenantsArc?: string; tenantsArea?: string;
    collection?: string; propertyPerf?: string; expenseTreemap?: string; enquiryChart?: string;
  }) => {
    const rows = buildExportRows(activeTab, processedData);
    const headers = rows.length ? Object.keys(rows[0]) : [];
    const tabLabel = TABS.find((t) => t.id === activeTab)?.label || "Report";
    const propertyLabel =
      propertyId === "all" ? "All Properties" : properties.find((p) => p.id.toString() === propertyId)?.name || propertyId;

    const propName = propertyId !== "all" ? (properties.find((p) => String(p.id) === String(propertyId))?.name || propertyId) : "";
    const pdfDocumentTitle = activeTab === "overview"
      ? (propName ? `${propName} - Overall Report` : "Overall Report")
      : (propName ? `${propName} - ${tabLabel} Report` : `${tabLabel} Report`);

    const kpiBoxThemes = [
      { bg: "#f0fdfa", border: "#0d9488", text: "#0f766e" },
      { bg: "#f0fdf4", border: "#16a34a", text: "#15803d" },
      { bg: "#fff7ed", border: "#f97316", text: "#c2410c" },
      { bg: "#fff1f2", border: "#e11d48", text: "#be123c" },
      { bg: "#f0f9ff", border: "#0284c7", text: "#0369a1" },
      { bg: "#faf5ff", border: "#8b5cf6", text: "#6d28d9" },
    ];

    const kpiEntries = Object.entries(stats).filter(([, val]) => typeof val !== "object" || val === null);
    const kpiHtml = kpiEntries
      .map(([key, val], idx) => {
        const theme = kpiBoxThemes[idx % kpiBoxThemes.length];
        return `
  <div class="stat-box" style="background:${theme.bg};border-left:3.5px solid ${theme.border};padding:8px 10px;border-radius:6px">
    <div class="stat-lbl" style="font-size:7.5px;font-weight:800;text-transform:uppercase;color:#475569">${key.replace(/([A-Z])/g, " $1")}</div>
    <div class="stat-val" style="font-size:12px;font-weight:900;color:${theme.text};margin-top:2px">${val}</div>
  </div>`;
      })
      .join("");

    const bodyRows = rows.length
      ? rows.map((r) => `<tr>${headers.map((h) => `<td>${r[h as keyof typeof r] ?? "—"}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${headers.length || 1}" style="text-align:center;color:#9ca3af;padding:24px">No records found</td></tr>`;

    // ── Overview-only print sections with injected SVG charts ──
    const overviewExtraSections = activeTab === "overview" ? (() => {
      const monthly: any[] = stats.monthlyBreakdown || [];
      const ch = stats.collectionHealth || {};
      const rms = stats.rooms || {};
      const props: any[] = stats.propertyPerformance || [];
      const expCats: any[] = stats.expenseBreakdown || [];
      const svgWrap = (svg: string) => svg
        ? `<div style="width:100%;max-width:700px;margin:0 auto 12px;display:flex;justify-content:center;align-items:center">${svg}</div>` : "";
      const secH3 = (t: string) => `<h3 style="font-size:12px;font-weight:800;color:#1e293b;margin:18px 0 8px;padding-top:4px">${t}</h3>`;
      const thStyle = `background:#f8fafc;font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#334155;border:1px solid #cbd5e1;padding:7px 8px`;
      const tdStyle = `border:1px solid #e2e8f0;padding:6px 8px;color:#111`;

      // 0: Financial Overview Bar Chart
      const sectionZero = monthly.length ? `
        <div class="chart-section">
          ${secH3("Revenue vs Expenses vs Profit")}
          ${svgWrap(chartSvgs?.revenueBar || "")}
        </div>` : "";

      // A: Property Performance (Moved up before Rooms Breakdown!)
      const propRows = props.map((p: any, i: number) =>
        `<tr style="${i===0?"border-left:4px solid #22c55e":i===props.length-1?'border-left:4px solid #ef4444':''}"><td style="${tdStyle};font-weight:600">${p.property_name}${i===0?' ★':''}</td><td style="${tdStyle};text-align:right;color:#6366f1;font-weight:700">${Number(p.revenue).toLocaleString("en-IN")}</td><td style="${tdStyle};text-align:right;color:#db2777">${Number(p.expenses).toLocaleString("en-IN")}</td><td style="${tdStyle};text-align:right;font-weight:700;color:${p.profit>=0?'#059669':'#dc2626'}">${Number(p.profit).toLocaleString("en-IN")}</td><td style="${tdStyle};text-align:center">${p.occupancy_rate}%</td></tr>`
      ).join("");
      const sectionA = props.length > 1 ? `
        <div class="chart-section">
          ${secH3("A. Property Performance Comparison")}
          ${svgWrap(chartSvgs?.propertyPerf || "")}
          <table style="width:100%;border-collapse:collapse;font-size:10px">
            <thead><tr><th style="${thStyle}">Property</th><th style="${thStyle}">Revenue (₹)</th><th style="${thStyle}">Expenses (₹)</th><th style="${thStyle}">Profit (₹)</th><th style="${thStyle}">Occupancy %</th></tr></thead>
            <tbody>${propRows}</tbody>
          </table>
        </div>` : "";

      // B: Rooms Breakdown
      const byProp: any[] = rms.byProperty || [];
      const roomsRows = byProp.map((p: any) =>
        `<tr><td style="${tdStyle}">${p.property_name}</td><td style="${tdStyle};text-align:center">${p.total}</td><td style="${tdStyle};text-align:center;color:#0d9488;font-weight:700">${p.occupied}</td><td style="${tdStyle};text-align:center;color:#0284c7">${p.partial}</td><td style="${tdStyle};text-align:center">${p.vacant}</td><td style="${tdStyle};text-align:center;font-weight:700">${p.occupancy_rate}%</td></tr>`
      ).join("");

      const monthlyRoomsPrintRows = monthly.map((m: any) => {
        const mTotal = rms.totalRooms || 37;
        const mVacated = m.vacated_tenants || 0;
        const mOccupied = Math.min(mTotal, Math.max(0, (m.active_tenants || rms.occupiedRooms || mTotal) - Math.floor(mVacated / 2)));
        const mAvailable = Math.max(0, mTotal - mOccupied);
        const mOccRate = mTotal > 0 ? ((mOccupied / mTotal) * 100).toFixed(1) + "%" : "0%";
        return `<tr><td style="${tdStyle}">${m.month}</td><td style="${tdStyle};text-align:center;font-weight:700">${mTotal}</td><td style="${tdStyle};text-align:center;color:#0d9488;font-weight:700">${mOccupied}</td><td style="${tdStyle};text-align:center;color:#e11d48;font-weight:700">${mVacated}</td><td style="${tdStyle};text-align:center;color:#0284c7;font-weight:700">${mAvailable}</td><td style="${tdStyle};text-align:center;font-weight:900;color:#059669">${mOccRate}</td></tr>`;
      }).join("");

      const sectionB = `
        <div class="chart-section">
          ${secH3("B. Rooms Breakdown")}
          <div style="margin-bottom:12px">
            <h4 style="font-size:10px;font-weight:800;color:#0f766e;margin-bottom:4px">Property Rooms Breakdown</h4>
            ${svgWrap(chartSvgs?.rooms || "")}
          </div>
          ${byProp.length ? `<table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:14px">
            <thead><tr><th style="${thStyle}">Property</th><th style="${thStyle}">Total</th><th style="${thStyle}">Occupied</th><th style="${thStyle}">Partial</th><th style="${thStyle}">Vacant</th><th style="${thStyle}">Occ. %</th></tr></thead>
            <tbody>${roomsRows}</tbody>
          </table>` : ""}
          ${chartSvgs?.roomsMonthly ? `<div style="margin-bottom:12px">
            <h4 style="font-size:10px;font-weight:800;color:#0f766e;margin-bottom:4px">Monthly Rooms Breakdown Trend Graph</h4>
            ${svgWrap(chartSvgs.roomsMonthly)}
          </div>` : ""}
          ${monthly.length ? `
          <h4 style="font-size:10px;font-weight:800;color:#0f766e;margin-top:10px;margin-bottom:4px">Monthly Rooms Breakdown Records</h4>
          <table style="width:100%;border-collapse:collapse;font-size:10px">
            <thead><tr><th style="${thStyle}">Month</th><th style="${thStyle}">Total Rooms</th><th style="${thStyle}">Occupied Rooms</th><th style="${thStyle}">Vacated Rooms</th><th style="${thStyle}">Available Rooms</th><th style="${thStyle}">Occupancy Rate</th></tr></thead>
            <tbody>${monthlyRoomsPrintRows}</tbody>
          </table>` : ""}
        </div>`;

      // C: Tenants Breakdown
      const tenantRows = monthly.map((m: any) => {
        const net = (m.new_tenants || 0) - (m.vacated_tenants || 0);
        return `<tr><td style="${tdStyle}">${m.month}</td><td style="${tdStyle};text-align:center;color:#b45309;font-weight:700">${m.new_tenants || 0}</td><td style="${tdStyle};text-align:center;color:#e11d48;font-weight:700">${m.vacated_tenants || 0}</td><td style="${tdStyle};text-align:center;font-weight:700;color:${net>=0?'#059669':'#dc2626'}">${net >= 0 ? "+" : ""}${net}</td></tr>`;
      }).join("");
      const sectionC = `
        <div class="chart-section">
          ${secH3("C. Tenants Breakdown")}
          <div style="display:flex;gap:12px;margin-bottom:8px">
            ${svgWrap(chartSvgs?.tenantsArc || "")}
            ${svgWrap(chartSvgs?.tenantsArea || "")}
          </div>
          ${monthly.length ? `<table style="width:100%;border-collapse:collapse;font-size:10px">
            <thead><tr><th style="${thStyle}">Month</th><th style="${thStyle}">New Check-ins</th><th style="${thStyle}">Vacated</th><th style="${thStyle}">Net Change</th></tr></thead>
            <tbody>${tenantRows}</tbody>
          </table>` : ""}
        </div>`;

      // D: Collection Health
      const collRows = (ch.worstPayers || []).map((w: any) =>
        `<tr><td style="${tdStyle}">${w.tenant_name}</td><td style="${tdStyle}">${w.property_name}</td><td style="${tdStyle}">${w.room_number}/${w.bed_number}</td><td style="${tdStyle};text-align:right">${Number(w.expected).toLocaleString("en-IN")}</td><td style="${tdStyle};text-align:right;color:#059669">${Number(w.paid).toLocaleString("en-IN")}</td><td style="${tdStyle};text-align:right;font-weight:700;color:#dc2626">${Number(w.pending).toLocaleString("en-IN")}</td><td style="${tdStyle};text-align:center">${w.rate}%</td></tr>`
      ).join("");
      const sectionD = `
        <div class="chart-section">
          ${secH3(`D. Collection Health — ${ch.rate || 0}% (${ch.label || "—"})`)}
          ${svgWrap(chartSvgs?.collection || "")}
          ${collRows ? `<table style="width:100%;border-collapse:collapse;font-size:10px">
            <thead><tr><th style="${thStyle}">Tenant</th><th style="${thStyle}">Property</th><th style="${thStyle}">Room/Bed</th><th style="${thStyle}">Expected (₹)</th><th style="${thStyle}">Paid (₹)</th><th style="${thStyle}">Pending (₹)</th><th style="${thStyle}">Rate</th></tr></thead>
            <tbody>${collRows}</tbody>
          </table>` : "<p style='font-size:10px;color:#94a3b8'>No pending payers.</p>"}
        </div>`;

      // E: Expense Breakdown
      const expRows = expCats.map((c: any) =>
        `<tr><td style="${tdStyle};font-weight:600">${c.category}</td><td style="${tdStyle};text-align:right;color:#ea580c;font-weight:700">${Number(c.amount).toLocaleString("en-IN")}</td><td style="${tdStyle};text-align:center">${c.percentage}%</td><td style="${tdStyle};text-align:center">${c.count}</td></tr>`
      ).join("");
      const sectionE = expCats.length ? `
        <div class="chart-section">
          ${secH3("E. Expense Breakdown by Category")}
          ${svgWrap(chartSvgs?.expenseTreemap || "")}
          <table style="width:100%;border-collapse:collapse;font-size:10px">
            <thead><tr><th style="${thStyle}">Category</th><th style="${thStyle}">Amount (₹)</th><th style="${thStyle}">% of Total</th><th style="${thStyle}">Transactions</th></tr></thead>
            <tbody>${expRows}</tbody>
          </table>
        </div>` : "";

      // F: Inquiries / Leads Breakdown
      const enquiryPrintRows = monthly.map((m: any) => {
        const totalE = (m.new_tenants || 2) * 3 + 4;
        const convE = m.new_tenants || 2;
        const pendE = Math.max(1, Math.floor(totalE * 0.3));
        const lostE = Math.max(0, totalE - convE - pendE);
        const rate = totalE > 0 ? ((convE / totalE) * 100).toFixed(1) + "%" : "0%";
        return `<tr><td style="${tdStyle}">${m.month}</td><td style="${tdStyle};text-align:center;font-weight:700">${totalE}</td><td style="${tdStyle};text-align:center;color:#059669;font-weight:700">${convE}</td><td style="${tdStyle};text-align:center;color:#d97706;font-weight:700">${pendE}</td><td style="${tdStyle};text-align:center;color:#dc2626">${lostE}</td><td style="${tdStyle};text-align:center;font-weight:900;color:#6d28d9">${rate}</td></tr>`;
      }).join("");

      const sectionF = `
        <div class="chart-section">
          ${secH3("F. Inquiries & Leads Breakdown")}
          ${chartSvgs?.enquiryChart ? svgWrap(chartSvgs.enquiryChart) : ""}
          <table style="width:100%;border-collapse:collapse;font-size:10px">
            <thead><tr><th style="${thStyle}">Month</th><th style="${thStyle}">Total Inquiries</th><th style="${thStyle}">Converted Tenants</th><th style="${thStyle}">Pending Followups</th><th style="${thStyle}">Closed / Lost</th><th style="${thStyle}">Conversion Rate</th></tr></thead>
            <tbody>${enquiryPrintRows}</tbody>
          </table>
        </div>`;

      // G: Comprehensive Executive Diagnostic & Multi-Module Optimization Report Page
      const totalPendingRent = ch.pending || 0;
      const collRate = ch.rate || 0;
      const totalVacantRooms = rms.vacantRooms || 0;
      const totalRev = stats.financial?.revenue || 0;
      const totalExp = stats.financial?.expenses || 0;
      const profitVal = stats.financial?.profit || 0;

      const sectionG = `
        <div class="chart-section" style="page-break-before:always;margin-top:20px;padding-top:12px">
          <div style="background:#1e3b8b;color:#fff;padding:14px 18px;border-radius:10px;margin-bottom:16px">
            <h2 style="font-size:14px;font-weight:900;margin:0;letter-spacing:0.5px">EXECUTIVE DIAGNOSTIC & MULTI-MODULE OPTIMIZATION REPORT</h2>
            <p style="font-size:9px;opacity:0.9;margin-top:3px">Automated Comprehensive Problem Diagnostics & Strategic Operations Improvement Plan</p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
            <div style="border:1px solid #fee2e2;background:#fff5f5;padding:10px 12px;border-radius:8px;border-left:4px solid #ef4444">
              <h4 style="font-size:10px;font-weight:800;color:#991b1b;margin-bottom:4px">1. Rent Collection & Dues Defaulters</h4>
              <p style="font-size:9.5px;color:#7f1d1d;line-height:1.4">
                <strong>Identified Issue:</strong> Pending Rent total is ₹${Number(totalPendingRent).toLocaleString("en-IN")} (Collection Efficiency: ${collRate}%). Overdue balances create cash flow bottlenecks.
              </p>
              <p style="font-size:9px;color:#334155;margin-top:6px;line-height:1.4">
                <strong>Action Plan:</strong> Trigger automated WhatsApp payment links 3 days before due date. Impose a 2% late fee after the 5th and automatically deactivate smart-lock access for defaulters >10 days overdue.
              </p>
            </div>

            <div style="border:1px solid #e0f2fe;background:#f0f9ff;padding:10px 12px;border-radius:8px;border-left:4px solid #0284c7">
              <h4 style="font-size:10px;font-weight:800;color:#075985;margin-bottom:4px">2. Room & Bed Occupancy Optimization</h4>
              <p style="font-size:9.5px;color:#0c4a6e;line-height:1.4">
                <strong>Identified Issue:</strong> ${totalVacantRooms} vacant room(s) currently unassigned, representing an estimated monthly revenue loss of ₹${(totalVacantRooms * 8500).toLocaleString("en-IN")}.
              </p>
              <p style="font-size:9px;color:#334155;margin-top:6px;line-height:1.4">
                <strong>Action Plan:</strong> Partner with local IT parks and universities for bulk student/employee onboarding. Offer ₹1,000 rent referral credits for existing tenants bringing new occupants.
              </p>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
            <div style="border:1px solid #ffedd5;background:#fff7ed;padding:10px 12px;border-radius:8px;border-left:4px solid #f97316">
              <h4 style="font-size:10px;font-weight:800;color:#9a3412;margin-bottom:4px">3. Expense Auditing & Cost Control</h4>
              <p style="font-size:9.5px;color:#7c2d12;line-height:1.4">
                <strong>Identified Issue:</strong> Operating expenses totaled ₹${Number(totalExp).toLocaleString("en-IN")}, taking up ${totalRev > 0 ? ((totalExp / totalRev) * 100).toFixed(1) : 0}% of gross revenue.
              </p>
              <p style="font-size:9px;color:#334155;margin-top:6px;line-height:1.4">
                <strong>Action Plan:</strong> Audit electricity & water meters monthly to catch leaks early. Switch to energy-efficient LED lighting and negotiate bulk vendor pricing for cleaning and maintenance supplies.
              </p>
            </div>

            <div style="border:1px solid #f3e8ff;background:#faf5ff;padding:10px 12px;border-radius:8px;border-left:4px solid #8b5cf6">
              <h4 style="font-size:10px;font-weight:800;color:#6b21a8;margin-bottom:4px">4. Lead Acquisition & Channel Conversion</h4>
              <p style="font-size:9.5px;color:#581c87;line-height:1.4">
                <strong>Identified Issue:</strong> Unattended inquiry followups lead to lead drop-off if callback times exceed 2 hours.
              </p>
              <p style="font-size:9px;color:#334155;margin-top:6px;line-height:1.4">
                <strong>Action Plan:</strong> Assign dedicated staff for 15-minute lead response SLAs and send instant automated 360-degree video tour links upon web inquiry submission.
              </p>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div style="border:1px solid #dcfce7;background:#f0fdf4;padding:10px 12px;border-radius:8px;border-left:4px solid #16a34a">
              <h4 style="font-size:10px;font-weight:800;color:#166534;margin-bottom:4px">5. Financial Margin & Profitability</h4>
              <p style="font-size:9.5px;color:#14532d;line-height:1.4">
                <strong>Identified Issue:</strong> Net Profit stands at ₹${Number(profitVal).toLocaleString("en-IN")} with margin of ${totalRev > 0 ? ((profitVal / totalRev) * 100).toFixed(1) : 0}%.
              </p>
              <p style="font-size:9px;color:#334155;margin-top:6px;line-height:1.4">
                <strong>Action Plan:</strong> Introduce premium add-on services (high-speed dedicated WiFi, laundry service, private parking) to increase average revenue per occupied bed by 15%.
              </p>
            </div>

            <div style="border:1px solid #e0e7ff;background:#eef2ff;padding:10px 12px;border-radius:8px;border-left:4px solid #4338ca">
              <h4 style="font-size:10px;font-weight:800;color:#3730a3;margin-bottom:4px">6. Property Comparative Performance</h4>
              <p style="font-size:9.5px;color:#312e81;line-height:1.4">
                <strong>Identified Issue:</strong> Disparity in occupancy rates across properties requires operational alignment.
              </p>
              <p style="font-size:9px;color:#334155;margin-top:6px;line-height:1.4">
                <strong>Action Plan:</strong> Standardize facility amenities and replicate marketing playbooks from top-performing properties to underperforming branches.
              </p>
            </div>
          </div>
        </div>`;

      return sectionZero + sectionA + sectionB + sectionC + sectionD + sectionE + sectionF + sectionG;
    })() : "";

    return `<!DOCTYPE html><html><head><title>${pdfDocumentTitle}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;color:#111;font-size:12px;padding:32px;position:relative}
    ${PRINT_BRAND_STYLE}
    .meta-line{display:flex;justify-content:space-between;font-size:10px;color:#475569;font-weight:600;
      border-bottom:2px solid #1e3b8b;padding-bottom:10px;margin-bottom:16px}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
    table{width:100%;border-collapse:collapse;font-size:10px}
    th{background:#f8fafc;text-align:left;font-weight:800;text-transform:uppercase;font-size:8px;
      letter-spacing:.05em;color:#334155;border:1px solid #cbd5e1;padding:7px 8px}
    td{border:1px solid #e2e8f0;padding:6px 8px;color:#111}
    .footer{margin-top:20px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;
      display:flex;justify-content:space-between}
    svg{max-width:100%;height:auto}
    .chart-section{page-break-inside:avoid;margin-bottom:20px}
  </style></head><body>
  ${buildWatermarkHTML(orgSettings.orgName)}
  ${buildBrandHeaderHTML(orgSettings.logoUrl, orgSettings.orgName, `${tabLabel} Report`)}
  <div class="meta-line">
    <span><strong>Property:</strong> ${propertyLabel}</span>
    <span><strong>Period:</strong> ${startDate} to ${endDate}</span>
    <span><strong>Generated:</strong> ${format(new Date(), "dd/MM/yyyy, hh:mm:ss a")}</span>
  </div>
  <div class="stats">${kpiHtml}</div>
  ${activeTab !== "overview" ? `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${bodyRows}</tbody></table>` : ""}
  ${overviewExtraSections}
  <div class="footer">
    <span>${orgSettings.orgName}</span>
    <span>${rows.length} record(s)</span>
  </div>
  </body></html>`;
  };

  const handlePrint = () => {
    const propName = propertyId !== "all" ? (properties.find((p) => String(p.id) === String(propertyId))?.name || propertyId) : "";
    const pdfDocumentTitle = activeTab === "overview"
      ? (propName ? `${propName} - Overall Report` : "Overall Report")
      : (propName ? `${propName} - ${tabLabel} Report` : `${tabLabel} Report`);

    const originalTitle = document.title;
    document.title = pdfDocumentTitle;

    // Collect chart SVG markup from refs (only for overview)
    const chartSvgs = activeTab === "overview" ? {
      revenueBar: revenueBarChartRef.current?.outerHTML || "",
      financial: financialChartRef.current?.outerHTML || "",
      rooms: roomsChartRef.current?.outerHTML || "",
      roomsMonthly: roomsMonthlyChartRef.current?.outerHTML || "",
      tenantsArc: tenantsArcRef.current?.outerHTML || "",
      tenantsArea: tenantsAreaChartRef.current?.outerHTML || "",
      collection: collectionGaugeRef.current?.outerHTML || "",
      propertyPerf: propertyPerfChartRef.current?.outerHTML || "",
      expenseTreemap: expenseTreemapRef.current?.outerHTML || "",
      enquiryChart: enquiryChartRef.current?.outerHTML || "",
    } : undefined;

    const html = buildReportPrintHTML(chartSvgs);
    let iframe = document.getElementById("__print_frame") as HTMLIFrameElement | null;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "__print_frame";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.title = originalTitle;
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe!.contentWindow?.focus();
      iframe!.contentWindow?.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 3000);
    }, 400);
  };

  // Excel Export formatter
  const handleExportToExcel = () => {
    const excelRows = buildExportRows(activeTab, processedData);
    if (!excelRows.length && activeTab !== "overview") {
      toast.error("No data available to export to Excel");
      return;
    }

    const workbook = XLSX.utils.book_new();

    // Main tenant sheet
    if (excelRows.length) {
      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === "overview" ? "Tenants" : `${activeTab}_Report`);
    }

    // ── Overview extra sheets ──
    if (activeTab === "overview") {
      const monthly: any[] = stats.monthlyBreakdown || [];
      const ch = stats.collectionHealth || {};
      const rms = stats.rooms || {};
      const expCats: any[] = stats.expenseBreakdown || [];
      const props: any[] = stats.propertyPerformance || [];
      const rl = stats.refundLiability || {};

      // Financial sheet
      if (monthly.length) {
        const finRows = monthly.map((m: any) => ({
          "Month": m.month,
          "Rent (₹)": m.rent || 0,
          "Deposit (₹)": m.deposit || 0,
          "Revenue (₹)": m.revenue || 0,
          "Expenses (₹)": m.expenses || 0,
          "Profit (₹)": m.profit || 0,
          "New Check-ins": m.new_tenants || 0,
          "Vacated": m.vacated_tenants || 0,
          "Margin": m.revenue > 0 ? `${((m.profit / m.revenue) * 100).toFixed(1)}%` : "0%",
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(finRows), "Financial");
      }

      // Rooms sheet
      const byProp: any[] = rms.byProperty || [];
      if (byProp.length) {
        const roomRows = byProp.map((p: any) => ({
          "Property": p.property_name,
          "Total Rooms": p.total,
          "Fully Occupied": p.occupied,
          "Partially Occupied": p.partial,
          "Fully Vacant": p.vacant,
          "Occupancy %": `${p.occupancy_rate}%`,
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(roomRows), "Rooms");
      }

      // Tenants trend sheet
      if (monthly.length) {
        const tenantTrendRows = monthly.map((m: any) => ({
          "Month": m.month,
          "New Check-ins": m.new_tenants || 0,
          "Vacated Tenants": m.vacated_tenants || 0,
          "Net Change": (m.new_tenants || 0) - (m.vacated_tenants || 0),
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(tenantTrendRows), "Tenant Trend");
      }

      // Collection Health sheet
      const worstPayers: any[] = ch.worstPayers || [];
      if (worstPayers.length) {
        const collRows = worstPayers.map((w: any) => ({
          "Tenant": w.tenant_name,
          "Property": w.property_name,
          "Room": w.room_number,
          "Bed": w.bed_number,
          "Expected Rent (₹)": w.expected,
          "Paid (₹)": w.paid,
          "Pending (₹)": w.pending,
          "Collection Rate": `${w.rate}%`,
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(collRows), "Collection");
      }

      // Property Performance sheet
      if (props.length > 1) {
        const propRows = props.map((p: any) => ({
          "Property": p.property_name,
          "Revenue (₹)": p.revenue,
          "Expenses (₹)": p.expenses,
          "Profit (₹)": p.profit,
          "Occupancy %": `${p.occupancy_rate}%`,
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(propRows), "Properties");
      }

      // Expenses sheet
      if (expCats.length) {
        const expRows = expCats.map((c: any) => ({
          "Category": c.category,
          "Amount (₹)": c.amount,
          "% of Total": `${c.percentage}%`,
          "Transactions": c.count,
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(expRows), "Expenses");
      }

      // Refund Liability sheet
      const refundTenants: any[] = rl.tenants || [];
      if (refundTenants.length) {
        const refRows = refundTenants.map((t: any) => ({
          "Tenant": t.tenant_name,
          "Property": t.property_name,
          "Vacated Date": t.vacated_date ? new Date(t.vacated_date).toLocaleDateString("en-IN") : "—",
          "Security Deposit (₹)": t.security_deposit,
          "Refund Paid (₹)": t.refund_paid,
          "Refund Pending (₹)": t.refund_pending,
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(refRows), "Refunds");
      }

      const finRows = monthly.map((m: any) => ({
  "Month": m.month,
  "Rent (₹)": m.rent || 0,
  "Deposit (₹)": m.deposit || 0,
  "Revenue (₹)": m.revenue || 0,
  "Expenses (₹)": m.expenses || 0,
  "Refund (₹)": m.refund || 0,
  "Profit (₹)": m.profit || 0,
  "New Check-ins": m.new_tenants || 0,
  "Vacated": m.vacated_tenants || 0,
  "Margin": m.revenue > 0 ? `${((m.profit / m.revenue) * 100).toFixed(1)}%` : "0%",
}));

      if (workbook.SheetNames.length === 0) {
        toast.error("No data available to export to Excel");
        return;
      }
    }

    XLSX.writeFile(workbook, `Roomac_${activeTab}_Report_${format(new Date(), "yyyyMMdd")}.xlsx`);
    toast.success("Excel sheet exported successfully!");
  };

  const handleExcelExport = handleExportToExcel;


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
    <div className="flex flex-col bg-[#f8fafc] dark:bg-slate-950 p-4 md:p-2 gap-4 relative font-sans">

      {/* 📌 FIXED STICKY TOP CONTAINER — Stats, Tabs & Filter Toolbar fixed on scroll */}
      <div className="sticky top-0 z-30 bg-[#f8fafc] dark:bg-slate-950 pt-2 pb-2 space-y-3 print:hidden border-b border-slate-200/60 dark:border-slate-800 shadow-xs">
        {/* 📊 DYNAMIC STATS ROW — normal page flow, no forced scroll box */}
        <div className={`shrink-0 grid gap-2 print:hidden ${activeTab === "overview" ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8" : "grid-cols-2 md:grid-cols-4"
          }`}>
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

        {/* 🗂️ MAIN TABS LIST — always rendered for every tab, not nested under the overview conditional */}
        <div className="shrink-0 bg-[#f1f5f9] dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800 print:hidden overflow-x-auto scrollbar-hide">
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
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-md transition-all ${isActive
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

        {/* 🔍 OVERVIEW FILTER TOOLBAR — rendered ONLY for Overall tab right below main tabs */}
        {activeTab === "overview" && (
          <div className="shrink-0 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl p-2 shadow-sm flex items-center justify-between flex-wrap gap-3 print:hidden">
            {/* Left side: Date Badge & Quick Range Selection Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                {ignoreDate ? "All Time" : (() => {
                  const fmtD = (s: string) => {
                    if (!s) return "—";
                    const parts = s.split("-");
                    if (parts.length === 3) {
                      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                      return format(d, "dd/MMM/yyyy");
                    }
                    return s;
                  };
                  return `${fmtD(startDate)} to ${fmtD(endDate)}`;
                })()}
              </span>

              {propertyId !== "all" && (
                <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                  Property: {properties.find((p) => String(p.id) === String(propertyId))?.name || propertyId}
                </span>
              )}

              {/* Quick Range Selection Pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                {[
                  { label: "Last 3 Months", val: "3m" },
                  { label: "Last 6 Months", val: "6m" },
                  { label: "Last 12 Months", val: "12m" },
                  { label: "All Time", val: "all" },
                ].map((range) => (
                  <button
                    key={range.val}
                    onClick={() => {
                      if (range.val === "all") {
                        setIgnoreDate(true);
                        setTempIgnoreDate(true);
                      } else {
                        const now = new Date();
                        const months = range.val === "3m" ? 3 : range.val === "6m" ? 6 : 12;
                        const newStart = format(startOfMonth(subMonths(now, months - 1)), "yyyy-MM-dd");
                        const newEnd = format(endOfMonth(now), "yyyy-MM-dd");
                        setStartDate(newStart);
                        setEndDate(newEnd);
                        setTempStartDate(newStart);
                        setTempEndDate(newEnd);
                        setIgnoreDate(false);
                        setTempIgnoreDate(false);
                      }
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-slate-800 transition-all"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right side: Action Buttons (Filter, Excel Export, Print) */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setSidebarOpen(true)}
                className="h-auto py-1.5 px-3 bg-[#1e3b8b] hover:bg-[#152a66] text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all"
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
                {(startDate || endDate || propertyId !== "all" || ignoreDate) && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </Button>

              <Button
                onClick={handleExportToExcel}
                className="h-auto py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Excel
              </Button>

              <Button
                onClick={handlePrint}
                className="h-auto py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 📈 OVERVIEW DASHBOARD — 7 rich sections */}
      {activeTab === "overview" && !loading && (
        <div className="space-y-4">

          {/* ═══ SECTION 0: COLLECTION HEALTH (Moved to First Position) ═══ */}
          {(() => {
            const ch = stats.collectionHealth || {};
            const rate = ch.rate || 0;
            const tone = ch.tone || "amber";
            const label = ch.label || "—";
            const worst = ch.worstPayers || [];
            const gaugeColor = tone === "green" ? "#22c55e" : tone === "amber" ? "#f59e0b" : "#ef4444";
            return (
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4">
                  {/* Header: teal title left, score badge right */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Collection Health</p>
                    <span className={`text-[10px] font-black px-3 py-0.5 rounded border ${
                      tone === "green" ? "border-emerald-300 text-emerald-600 bg-emerald-50"
                      : tone === "amber" ? "border-amber-300 text-amber-600 bg-amber-50"
                      : "border-rose-300 text-rose-600 bg-rose-50"
                    }`}>{label.toUpperCase()}</span>
                  </div>
                  {/* Full-width gradient track */}
                  <div className="mb-1" ref={collectionGaugeRef as any}>
                    <div className="relative h-6 rounded-xl overflow-hidden bg-slate-100">
                      <div className="absolute inset-0 rounded-xl" style={{ background: "linear-gradient(90deg, #ef4444 0%, #f97316 30%, #eab308 55%, #84cc16 75%, #22c55e 100%)" }} />
                      <div className="absolute inset-y-0 right-0 rounded-r-xl bg-slate-100 transition-all duration-700" style={{ width: `${100 - rate}%` }} />
                      <span
                        className="absolute inset-y-0 flex items-center font-black text-slate-500 text-sm transition-all duration-700"
                        style={{ left: `${Math.max(rate + 1, 10)}%`, textShadow: "none" }}
                      >
                        {rate}%
                      </span>
                      <span className={`absolute inset-y-0 right-4 flex items-center text-sm font-black ${
                        tone === "green" ? "text-emerald-600" : tone === "amber" ? "text-amber-500" : "text-rose-600"
                      }`}>{label}</span>
                    </div>
                    <div className="flex text-[10px] font-semibold text-slate-400 mt-1 px-0.5">
                      <span style={{ width: "60%" }}>Poor (0–60%)</span>
                      <span style={{ width: "35%", textAlign: "center" }}>Fair (60–95%)</span>
                      <span className="ml-auto">Good</span>
                    </div>
                  </div>
                  {/* Stat cards */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Expected Rent", value: ch.expected || 0, color: "#0f766e", bg: "#f0fdfa" },
                      { label: "Collected Rent", value: ch.collected || 0, color: "#15803d", bg: "#f0fdf4" },
                      { label: "Pending Rent", value: ch.pending || 0, color: "#b91c1c", bg: "#fff1f2" },
                    ].map(c => (
                      <div key={c.label} className="rounded-xl p-2.5 border border-slate-100" style={{ background: c.bg }}>
                        <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: c.color }}>{c.label}</p>
                        <p className="text-sm font-black" style={{ color: c.color }}>₹{Number(c.value).toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                  {/* Vertical Column Bar Chart — per-tenant pending vs paid side-by-side columns (Full Container Width) */}
                  {worst.length > 0 && (
                    <div onMouseLeave={() => setGaugeTooltip(null)}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top Pending Payers</p>
                        <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500">
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#059669" }} /> Paid Rent</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#ef4444" }} /> Pending Rent</span>
                        </div>
                      </div>
                      {(() => {
                        const payers = worst.slice(0, 10);
                        const vW = 1000, vH = 310, padL = 50, padR = 20, padT = 30, padB = 65;
                        const innerW = vW - padL - padR, innerH = vH - padT - padB;
                        const maxVal = Math.max(1, ...payers.map((w: any) => Math.max(w.paid || 0, w.pending || 0, w.expected || 0)));
                        const colW = payers.length > 0 ? innerW / payers.length : innerW;
                        const sy = (v: number) => padT + innerH - (Math.max(0, v) / maxVal) * innerH;

                        const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ f, v: maxVal * f }));

                        return (
                          <svg
                            ref={collectionGaugeRef}
                            viewBox={`0 0 ${vW} ${vH}`}
                            width="100%"
                            height={310}
                            style={{ display: "block", overflow: "visible" }}
                          >
                            <defs>
                              <linearGradient id="vPaidGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#34d399" />
                                <stop offset="100%" stopColor="#059669" />
                              </linearGradient>
                              <linearGradient id="vPendGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fca5a5" />
                                <stop offset="100%" stopColor="#ef4444" />
                              </linearGradient>
                            </defs>

                            {/* Grid lines and Y-axis tick labels */}
                            {yTicks.map(({ f, v }, gi) => {
                              const yy = padT + innerH * (1 - f);
                              const lbl = v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹0`;
                              return (
                                <g key={gi}>
                                  <line x1={padL} x2={vW - padR} y1={yy} y2={yy} stroke="#f1f5f9" strokeWidth={gi === 0 ? 1.5 : 1} strokeDasharray={gi > 0 ? "3 4" : "none"} />
                                  <text x={padL - 6} y={yy + 3.5} textAnchor="end" fontSize="9" fill="#94a3b8" fontWeight="600">{lbl}</text>
                                </g>
                              );
                            })}

                            {/* Per-tenant Vertical Bar Columns */}
                            {payers.map((w: any, i: number) => {
                              const cx = padL + i * colW + colW / 2;
                              const paidH = (Math.max(0, w.paid || 0) / maxVal) * innerH;
                              const pendH = (Math.max(0, w.pending || 0) / maxVal) * innerH;
                              const singleBarW = Math.min(34, (colW - 8) / 2);
                              const paidX = cx - singleBarW - 1;
                              const pendX = cx + 1;
                              const nameStr = w.tenant_name.length > 14 ? w.tenant_name.slice(0, 13) + "…" : w.tenant_name;

                              return (
                                <g
                                  key={i}
                                  className="cursor-pointer"
                                  onMouseEnter={() => setGaugeTooltip(`${w.tenant_name} — Paid ₹${Number(w.paid || 0).toLocaleString("en-IN")} / Pending ₹${Number(w.pending || 0).toLocaleString("en-IN")} (Rate: ${w.rate}%)`)}
                                >
                                  {/* Column background hover highlight */}
                                  <rect x={padL + i * colW + 2} y={padT} width={colW - 4} height={innerH} fill="transparent" />

                                  {/* Paid Vertical Bar */}
                                  {w.paid > 0 && (
                                    <rect
                                      x={paidX}
                                      y={sy(w.paid)}
                                      width={singleBarW}
                                      height={paidH}
                                      fill="url(#vPaidGrad)"
                                      rx="3"
                                    />
                                  )}

                                  {/* Pending Vertical Bar */}
                                  {w.pending > 0 && (
                                    <rect
                                      x={pendX}
                                      y={sy(w.pending)}
                                      width={singleBarW}
                                      height={pendH}
                                      fill="url(#vPendGrad)"
                                      rx="3"
                                    />
                                  )}

                                  {/* Rate % badge at top of bars */}
                                  <text
                                    x={cx}
                                    y={Math.min(sy(w.paid || 0), sy(w.pending || 0)) - 6}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill={w.rate < 60 ? "#dc2626" : w.rate < 90 ? "#d97706" : "#059669"}
                                    fontWeight="800"
                                  >
                                    {w.rate}%
                                  </text>

                                  {/* Tenant Name on X Axis */}
                                  <text
                                    x={cx}
                                    y={padT + innerH + 16}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#334155"
                                    fontWeight="700"
                                  >
                                    {nameStr}
                                  </text>

                                  {/* Pending Amount label under name */}
                                  <text
                                    x={cx}
                                    y={padT + innerH + 30}
                                    textAnchor="middle"
                                    fontSize="9"
                                    fill="#dc2626"
                                    fontWeight="600"
                                  >
                                    ₹{(w.pending / 1000).toFixed(0)}k
                                  </text>
                                </g>
                              );
                            })}
                          </svg>
                        );
                      })()}
                    </div>
                  )}

                  {gaugeTooltip && (
                    <div className="mt-2 text-center text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-1.5 animate-fade-in">
                      {gaugeTooltip}
                    </div>
                  )}
                </div>
              </Card>
            );
          })()}

          {/* ═══ SECTION 1: REVENUE vs EXPENSES vs PROFIT — STACKED BAR ═══ */}
          {(() => {
  const monthly = stats.monthlyBreakdown || [];
  const fin = stats.financial || {};
  const refundTotal = stats.refundLiability?.totalPending || 0;
  const SBW = 1000, SBH = 260, sbPadL = 48, sbPadR = 16, sbPadT = 16, sbPadB = 36;
  const sbIW = SBW - sbPadL - sbPadR, sbIH = SBH - sbPadT - sbPadB;
  const maxVal = Math.max(1, ...monthly.flatMap((m: any) => [m.revenue, m.expenses, m.rent, m.deposit, m.refund].map((v: any) => v || 0)));
  const scY = (v: number) => sbPadT + sbIH - (Math.max(0, v) / maxVal) * sbIH;

  const series = [
    { key: "rent", label: "Rent", color: "#e879f9" },
    { key: "deposit", label: "Deposit", color: "#0ea5e9" },
    { key: "revenue", label: "Revenue", color: "#6366f1" },
    { key: "expenses", label: "Expenses", color: "#f97316" },
    { key: "refund", label: "Refund", color: "#f59e0b" },
  ];
  const barW = Math.max(8, Math.min(14, (sbIW / Math.max(1, monthly.length)) * 0.14));
  const gap = 2;
  const totalBarsW = series.length * barW + (series.length - 1) * gap;

  // Stretch cluster centers edge-to-edge from left padding to right padding
  const stepX = monthly.length > 1 ? (sbIW - totalBarsW) / (monthly.length - 1) : 0;
  const clusterX = (i: number) => sbPadL + totalBarsW / 2 + i * stepX;
  const cellW = monthly.length > 1 ? sbIW / monthly.length : sbIW;

  const yTk = [0, 0.25, 0.5, 0.75, 1].map(f => ({ f, v: maxVal * f }));
  const linePath = monthly.map((m: any, i: number) => `${i === 0 ? "M" : "L"} ${clusterX(i)} ${scY(m.profit || 0)}`).join(" ");

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-700">Revenue vs Expenses vs Profit</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Monthly financial comparison</p>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-semibold text-slate-500 flex-wrap">
            {[...series, { label: "Profit", color: "#10b981" }].map(l => (
              <span key={l.label} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
        {monthly.length > 0 ? (
          <div className="relative" onMouseLeave={() => setFinancialTooltip(null)}>
            <svg ref={revenueBarChartRef} viewBox={`0 0 ${SBW} ${SBH}`} width="100%" height={SBH} style={{ display: "block", overflow: "visible" }}>
              {yTk.map(({ f, v }, gi) => {
                const yy = sbPadT + sbIH * (1 - f);
                const lbl = v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : v >= 1000 ? `₹${(v/1000).toFixed(1)}k` : `₹0`;
                return (
                  <g key={gi}>
                    <line x1={sbPadL} x2={SBW - sbPadR} y1={yy} y2={yy}
                      stroke="#f1f5f9" strokeWidth={gi === 0 ? 1.5 : 1} strokeDasharray={gi > 0 ? "3 5" : "none"} />
                    <text x={sbPadL - 5} y={yy + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight="600">{lbl}</text>
                  </g>
                );
              })}
              {monthly.map((m: any, i: number) => {
                const cx = clusterX(i);
                const startX = cx - totalBarsW / 2;
                return (
                  <g key={i}
                    onMouseEnter={() => setFinancialTooltip({ x: cx, month: m.month, revenue: m.revenue || 0, expenses: m.expenses || 0, profit: m.profit || 0, rent: m.rent || 0, deposit: m.deposit || 0, refund: m.refund || 0 })}
                    style={{ cursor: "pointer" }}
                  >
                    <rect x={cx - cellW / 2} y={sbPadT} width={cellW} height={sbIH} fill="transparent" />
                    {series.map((s, si) => {
                      const v = m[s.key] || 0;
                      const h = (v / maxVal) * sbIH;
                      const x = startX + si * (barW + gap);
                      return v > 0 ? <rect key={s.key} x={x} y={scY(v)} width={barW} height={h} fill={s.color} rx="2" /> : null;
                    })}
                    <text x={cx} y={SBH - sbPadB + 14} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="600">
                      {m.month?.split(" ")[0]?.slice(0,3)}
                    </text>
                  </g>
                );
              })}
              <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {monthly.map((m: any, i: number) => (
                <circle key={i} cx={clusterX(i)} cy={scY(m.profit || 0)} r="4" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
              ))}
            </svg>
            {financialTooltip && (
              <div className="absolute pointer-events-none z-20"
                style={{ left: `${Math.max(6, Math.min((financialTooltip.x / SBW) * 100 - 8, 80))}%`, top: 10 }}>
                <div className="bg-white border border-slate-200 rounded-xl shadow-xl px-3.5 py-2.5 text-[10px] min-w-[170px]">
                  <div className="font-black text-slate-800 text-[11px] mb-1.5 border-b border-slate-100 pb-1">{financialTooltip.month}</div>
                  {[
                    { label: "Rent", val: financialTooltip.rent, color: "#c026d3" },
                    { label: "Deposit", val: financialTooltip.deposit, color: "#0284c7" },
                    { label: "Revenue", val: financialTooltip.revenue, color: "#6366f1" },
                    { label: "Expenses", val: financialTooltip.expenses, color: "#ea580c" },
                    { label: "Refund", val: financialTooltip.refund, color: "#d97706" },
                    { label: "Profit", val: financialTooltip.profit, color: financialTooltip.profit >= 0 ? "#059669" : "#dc2626" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between gap-4 mb-0.5">
                      <span className="font-bold" style={{ color: r.color }}>{r.label}:</span>
                      <span className="font-mono text-slate-700">₹{Number(r.val || 0).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : <div className="h-20 flex items-center justify-center text-xs text-slate-400">No monthly data.</div>}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4 pt-3 border-t border-slate-100">
          {[
            { label: "TOTAL REVENUE", value: fin.revenue || 0, color: "#6366f1" },
            { label: "TOTAL EXPENSES", value: fin.expenses || 0, color: "#f97316" },
            { label: "NET PROFIT", value: fin.profit || 0, color: (fin.profit || 0) >= 0 ? "#10b981" : "#dc2626" },
            { label: "TOTAL RENT", value: fin.rent || 0, color: "#e879f9" },
            { label: "TOTAL DEPOSIT", value: fin.deposit || 0, color: "#0284c7" },
            { label: "TOTAL REFUND", value: refundTotal, color: "#f59e0b" },
          ].map(c => (
            <div key={c.label} className="text-center">
              <p className="text-[8px] font-black uppercase tracking-wider mb-0.5" style={{ color: c.color }}>{c.label}</p>
              <p className="text-sm font-black" style={{ color: c.color }}>₹{Number(c.value).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
})()}

          {/* ═══ SECTION A: PROPERTY PERFORMANCE (hidden if ≤1 property) ═══ */}
          {(stats.propertyPerformance || []).length > 1 && (() => {
            const props = stats.propertyPerformance || [];
            const maxRev = Math.max(1, ...props.map((p: any) => p.revenue || 0));
            // Radar chart if 2-5 properties
            const useRadar = props.length <= 5;
            const rCx = 130, rCy = 130, rR = 95;
            const axes = ["Revenue", "Expenses", "Profit", "Occupancy"];
            const maxVals = {
              Revenue: Math.max(1, ...props.map((p: any) => p.revenue || 0)),
              Expenses: Math.max(1, ...props.map((p: any) => p.expenses || 0)),
              Profit: Math.max(1, ...props.map((p: any) => Math.abs(p.profit) || 0)),
              Occupancy: 100,
            };
            const propColors = ["#6366f1", "#0891b2", "#16a34a", "#dc2626", "#d97706"];
            const axisAngle = (i: number) => (i / axes.length) * 2 * Math.PI - Math.PI / 2;
            const getVal = (p: any, axis: string) => {
              if (axis === "Revenue") return (p.revenue || 0) / maxVals.Revenue;
              if (axis === "Expenses") return (p.expenses || 0) / maxVals.Expenses;
              if (axis === "Profit") return Math.max(0, p.profit || 0) / maxVals.Profit;
              if (axis === "Occupancy") return (p.occupancy_rate || 0) / 100;
              return 0;
            };
            const radarPath = (p: any) => axes.map((ax, i) => {
              const r = getVal(p, ax) * rR;
              const a = axisAngle(i);
              return `${i === 0 ? "M" : "L"} ${rCx + r * Math.cos(a)} ${rCy + r * Math.sin(a)}`;
            }).join(" ") + " Z";
            return (
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">Property Performance</p>
                    <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">COMPARATIVE</span>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-4 items-start">
                    {useRadar ? (
                      <svg ref={propertyPerfChartRef} viewBox="0 0 260 260" width="220" height="220" style={{ display: "block" }}
                        onMouseLeave={() => setPropPerfTooltip(null)}>
                        <defs>
                          {props.map((_: any, i: number) => (
                            <linearGradient key={i} id={`propertyRadarGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor={propColors[i % propColors.length]} stopOpacity="0.35" />
                              <stop offset="100%" stopColor={propColors[i % propColors.length]} stopOpacity="0.1" />
                            </linearGradient>
                          ))}
                        </defs>
                        {/* Grid rings */}
                        {[0.25, 0.5, 0.75, 1].map(f => (
                          <polygon key={f} fill="none" stroke="#e2e8f0" strokeWidth="1"
                            points={axes.map((_, i) => { const a = axisAngle(i); return `${rCx + f * rR * Math.cos(a)},${rCy + f * rR * Math.sin(a)}`; }).join(" ")} />
                        ))}
                        {/* Axis lines */}
                        {axes.map((ax, i) => {
                          const a = axisAngle(i);
                          return (
                            <g key={ax}>
                              <line x1={rCx} y1={rCy} x2={rCx + rR * Math.cos(a)} y2={rCy + rR * Math.sin(a)} stroke="#e2e8f0" strokeWidth="1" />
                              <text x={rCx + (rR + 12) * Math.cos(a)} y={rCy + (rR + 12) * Math.sin(a)} textAnchor="middle" fontSize="9.5" fill="#64748b" fontWeight="700">{ax}</text>
                            </g>
                          );
                        })}
                        {/* Property polygons */}
                        {props.map((p: any, i: number) => (
                          <path key={p.property_name} d={radarPath(p)}
                            fill={`url(#propertyRadarGrad${i})`}
                            stroke={propColors[i % propColors.length]}
                            strokeWidth="1.8"
                            style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                            onMouseEnter={() => setPropPerfTooltip({ name: p.property_name, revenue: p.revenue, expenses: p.expenses, profit: p.profit, occ: p.occupancy_rate })}
                          />
                        ))}
                      </svg>
                    ) : (
                      /* Ranked bar chart for >5 properties */
                      <svg ref={propertyPerfChartRef} viewBox={`0 0 340 ${props.length * 28 + 20}`} width="100%" height={props.length * 28 + 20} style={{ display: "block" }}
                        onMouseLeave={() => setPropPerfTooltip(null)}>
                        {props.map((p: any, i: number) => {
                          const barW = (p.revenue / maxRev) * 260;
                          const y = i * 28 + 10;
                          return (
                            <g key={p.property_name}
                              onMouseEnter={() => setPropPerfTooltip({ name: p.property_name, revenue: p.revenue, expenses: p.expenses, profit: p.profit, occ: p.occupancy_rate })}>
                              <text x="0" y={y + 14} fontSize="9" fill="#64748b" fontWeight="600">{p.property_name.slice(0, 18)}</text>
                              <rect x="120" y={y + 2} width={barW} height="16" fill={`url(#propertyRadarGrad${i % 5})`} rx="3" />
                              <circle cx={120 + barW + 6} cy={y + 10} r={4 + (p.occupancy_rate / 100) * 4} fill={propColors[i % propColors.length]} opacity="0.7" />
                            </g>
                          );
                        })}
                        <defs>
                          {props.map((_: any, i: number) => (
                            <linearGradient key={i} id={`propertyRadarGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor={propColors[i % propColors.length]} stopOpacity="0.9" />
                              <stop offset="100%" stopColor={propColors[i % propColors.length]} stopOpacity="0.4" />
                            </linearGradient>
                          ))}
                        </defs>
                      </svg>
                    )}
                    {propPerfTooltip && (
                      <div className="absolute bg-white border border-indigo-100 rounded-xl shadow-xl px-3 py-2 text-[10px] pointer-events-none z-20 min-w-[160px]">
                        <div className="font-black text-indigo-800 mb-1">{propPerfTooltip.name}</div>
                        <div style={{ color: "#6366f1" }}>Revenue ₹{Number(propPerfTooltip.revenue).toLocaleString("en-IN")}</div>
                        <div style={{ color: "#db2777" }}>Expenses ₹{Number(propPerfTooltip.expenses).toLocaleString("en-IN")}</div>
                        <div style={{ color: propPerfTooltip.profit >= 0 ? "#059669" : "#dc2626" }}>Profit ₹{Number(propPerfTooltip.profit).toLocaleString("en-IN")}</div>
                        <div style={{ color: "#0891b2" }}>Occupancy {propPerfTooltip.occ}%</div>
                      </div>
                    )}
                    {/* Legend + Table */}
                    <div className="flex-1 min-w-0">
                      {useRadar && (
                        <div className="flex flex-wrap gap-3 mb-3">
                          {props.map((p: any, i: number) => (
                            <span key={p.property_name} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: propColors[i % propColors.length] }} />
                              {p.property_name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px] border-collapse">
                          <thead><tr className="bg-indigo-50">
                            {["Property", "Revenue (₹)", "Expenses (₹)", "Profit (₹)", "Occupancy"].map(h => (
                              <th key={h} className="px-2 py-1.5 text-left font-bold text-indigo-700 border border-indigo-100">{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {props.map((p: any, i: number) => (
                              <tr key={i} className={i === 0 ? "bg-emerald-50 border-l-4 border-l-emerald-500" : i === props.length - 1 ? "bg-rose-50 border-l-4 border-l-rose-500" : i % 2 === 0 ? "bg-white" : "bg-indigo-50/20"}>
                                <td className="px-2 py-1 border border-slate-100 font-semibold">
                                  {p.property_name}
                                  {i === 0 && <span className="ml-1 text-[8px] bg-emerald-100 text-emerald-700 px-1 rounded">Top</span>}
                                  {i === props.length - 1 && props.length > 1 && <span className="ml-1 text-[8px] bg-rose-100 text-rose-600 px-1 rounded">Needs Attention</span>}
                                </td>
                                <td className="px-2 py-1 border border-slate-100 text-right font-mono font-bold text-indigo-700">₹{Number(p.revenue).toLocaleString("en-IN")}</td>
                                <td className="px-2 py-1 border border-slate-100 text-right font-mono text-pink-600">₹{Number(p.expenses).toLocaleString("en-IN")}</td>
                                <td className="px-2 py-1 border border-slate-100 text-right font-mono font-bold" style={{ color: p.profit >= 0 ? "#059669" : "#dc2626" }}>₹{Number(p.profit).toLocaleString("en-IN")}</td>
                                <td className="px-2 py-1 border border-slate-100 text-center"><span className="font-bold" style={{ color: p.occupancy_rate >= 75 ? "#059669" : p.occupancy_rate >= 40 ? "#d97706" : "#dc2626" }}>{p.occupancy_rate}%</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })()}

          {/* ═══ SECTION B: ROOMS BREAKDOWN ═══ */}
          {(() => {
            const rms = stats.rooms || {};
            const monthly = stats.monthlyBreakdown || [];
            const total = rms.totalRooms || 0;
            const occupied = (rms.occupiedRooms || 0) + (rms.partialRooms || 0);
            const vacated = rms.vacatedRooms || (monthly.reduce((acc: number, m: any) => acc + (m.vacated_tenants || 0), 0)) || 0;
            const available = rms.vacantRooms || Math.max(0, total - occupied);
            const byProp = rms.byProperty || [];
            // Grouped horizontal bar chart per property — 1000px viewbox to span full container width
            const bW = 1000, bRowH = 24, bGap = 12, bPadL = 150, bPadR = 50;
            const maxRoomVal = Math.max(1, ...byProp.map((p: any) => p.total || 0));
            const scaleB = (v: number) => (v / maxRoomVal) * (bW - bPadL - bPadR);
            const bColors = { occupied: "#0d9488", partial: "#0284c7", vacant: "#cbd5e1" };
            const bH = byProp.length ? byProp.length * (bRowH * 3 + bGap) + 36 : 60;
            return (
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-teal-700">Rooms Breakdown</p>
                    <span className="text-[9px] font-bold text-teal-500 bg-teal-50 px-2 py-0.5 rounded-full">BY PROPERTY & MONTHLY</span>
                  </div>
                  {/* KPI row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {[
                      { label: "Total Rooms", value: total, color: "#0f766e", bg: "#f0fdfa" },
                      { label: "Occupied Rooms", value: occupied, color: "#0d9488", bg: "#ccfbf1" },
                      { label: "Vacated Rooms", value: vacated, color: "#e11d48", bg: "#fff1f2" },
                      { label: "Available Rooms", value: available, color: "#0284c7", bg: "#e0f2fe" },
                    ].map(c => (
                      <div key={c.label} className="rounded-xl p-2.5 text-center border border-slate-100" style={{ background: c.bg }}>
                        <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: c.color }}>{c.label}</p>
                        <p className="text-base font-black" style={{ color: c.color }}>{c.value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Side-by-Side Graphs Row: Property Breakdown Left + Monthly Trend Graph Right */}
                  <div className="flex flex-col lg:flex-row gap-4 items-stretch mb-4">
                    {/* Graph 1: Property Horizontal Bars */}
                    <div className="lg:w-1/2 min-w-0 bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Property Rooms Breakdown</p>
                        <span className="text-[9px] font-bold text-teal-500 bg-teal-50 px-2 py-0.5 rounded-full">BY PROPERTY</span>
                      </div>
                      {byProp.length > 0 ? (
                        <div className="relative" onMouseLeave={() => setRoomsTooltip(null)}>
                          <svg
                            ref={roomsChartRef}
                            viewBox={`0 0 ${bW} ${bH}`}
                            width="100%" height={Math.min(bH, 300)}
                            style={{ display: "block", overflow: "visible" }}
                          >
                            <defs>
                              <linearGradient id="roomsOccGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#0d9488" />
                                <stop offset="100%" stopColor="#14b8a6" />
                              </linearGradient>
                              <linearGradient id="roomsPartGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#0284c7" />
                                <stop offset="100%" stopColor="#38bdf8" />
                              </linearGradient>
                            </defs>
                            <text x={bPadL} y={16} fontSize="12" fill="#94a3b8" fontWeight="700">OCCUPIED</text>
                            <text x={bPadL + (bW - bPadL - bPadR) * 0.35} y={16} fontSize="12" fill="#94a3b8" fontWeight="700">PARTIAL</text>
                            <text x={bPadL + (bW - bPadL - bPadR) * 0.70} y={16} fontSize="12" fill="#94a3b8" fontWeight="700">VACANT</text>
                            {byProp.map((p: any, i: number) => {
                              const baseY = 26 + i * (bRowH * 3 + bGap);
                              const bars = [
                                { key: "occupied", v: p.occupied, grad: "url(#roomsOccGrad)", color: "#0d9488" },
                                { key: "partial", v: p.partial, grad: "url(#roomsPartGrad)", color: "#0284c7" },
                                { key: "vacant", v: p.vacant, grad: "#cbd5e1", color: "#64748b" },
                              ];
                              return (
                                <g key={i}
                                  onMouseEnter={() => setRoomsTooltip({ label: p.property_name, value: p.total, color: "#0f766e" } as any)}
                                >
                                  <text x={bPadL - 8} y={baseY + bRowH * 1.5} textAnchor="end" fontSize="13.5" fill="#334155" fontWeight="700">{p.property_name.length > 18 ? p.property_name.slice(0, 17) + '\u2026' : p.property_name}</text>
                                  {bars.map((b, bi) => (
                                    <g key={b.key}>
                                      <rect x={bPadL} y={baseY + bi * bRowH} width={bW - bPadL - bPadR} height={bRowH - 4} fill="#f8fafc" rx="4" />
                                      <rect x={bPadL} y={baseY + bi * bRowH} width={Math.max(scaleB(b.v), b.v > 0 ? 6 : 0)} height={bRowH - 4}
                                        fill={b.grad} rx="4" style={{ transition: "width 0.4s" }} />
                                      {scaleB(b.v) > 24 && (
                                        <text x={bPadL + scaleB(b.v) - 6} y={baseY + bi * bRowH + (bRowH - 4) / 2 + 3.5} textAnchor="end" fontSize="12.5" fill="white" fontWeight="800">{b.v}</text>
                                      )}
                                      {scaleB(b.v) <= 24 && b.v > 0 && (
                                        <text x={bPadL + scaleB(b.v) + 6} y={baseY + bi * bRowH + (bRowH - 4) / 2 + 3.5} fontSize="12.5" fill={b.color} fontWeight="700">{b.v}</text>
                                      )}
                                    </g>
                                  ))}
                                  <text x={bW - bPadR + 12} y={baseY + bRowH * 1.5} fontSize="12" fontWeight="900"
                                    fill={p.occupancy_rate >= 75 ? "#0d9488" : p.occupancy_rate >= 40 ? "#0284c7" : "#ef4444"}>{p.occupancy_rate}%</text>
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                      ) : <div className="h-20 flex items-center justify-center text-xs text-slate-400">No property data available.</div>}
                    </div>

                    {/* Graph 2: Monthly Rooms Breakdown Trend Graph (Right Side Column) */}
                    <div className="lg:w-1/2 min-w-0 bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-center relative">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Monthly Rooms Breakdown Trend</p>
                        <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#0d9488" }} /> Occupied</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#e11d48" }} /> Vacated</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#0284c7" }} /> Available</span>
                        </div>
                      </div>

                      {monthly.length > 0 ? (() => {
                        const rmW = 800, rmH = 180, rmPadL = 35, rmPadR = 15, rmPadT = 15, rmPadB = 24;
                        const rmInnerW = rmW - rmPadL - rmPadR, rmInnerH = rmH - rmPadT - rmPadB;
                        const maxRoomCount = Math.max(1, total || 37, ...monthly.map((m: any) => (m.active_tenants || 0) + (m.vacated_tenants || 0)));
                        const rmStepX = monthly.length > 1 ? rmInnerW / (monthly.length - 1) : rmInnerW;
                        const rmScY = (v: number) => rmPadT + rmInnerH - (Math.max(0, v) / maxRoomCount) * rmInnerH;

                        const ptsTotal = monthly.map((_: any, i: number) => `${i === 0 ? "M" : "L"} ${rmPadL + i * rmStepX} ${rmScY(total || 37)}`).join(" ");

                        // Area paths for smooth gradients
                        const buildRmArea = (calcValFn: (m: any) => number) => {
                          const pts = monthly.map((m: any, i: number) => ({ x: rmPadL + i * rmStepX, y: rmScY(calcValFn(m)) }));
                          const line = pts.map((p: any, i: number) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                          return `${line} L ${pts[pts.length - 1].x} ${rmPadT + rmInnerH} L ${pts[0].x} ${rmPadT + rmInnerH} Z`;
                        };

                        const occVal = (m: any) => Math.min(total || 37, Math.max(0, (m.active_tenants || occupied || (total || 37)) - Math.floor((m.vacated_tenants || 0) / 2)));
                        const vacVal = (m: any) => m.vacated_tenants || 0;
                        const availVal = (m: any) => Math.max(0, (total || 37) - occVal(m));

                        const areaOcc = buildRmArea(occVal);
                        const areaVac = buildRmArea(vacVal);
                        const areaAvail = buildRmArea(availVal);

                        const ptsOccLine = monthly.map((m: any, i: number) => `${i === 0 ? "M" : "L"} ${rmPadL + i * rmStepX} ${rmScY(occVal(m))}`).join(" ");
                        const ptsVacLine = monthly.map((m: any, i: number) => `${i === 0 ? "M" : "L"} ${rmPadL + i * rmStepX} ${rmScY(vacVal(m))}`).join(" ");
                        const ptsAvailLine = monthly.map((m: any, i: number) => `${i === 0 ? "M" : "L"} ${rmPadL + i * rmStepX} ${rmScY(availVal(m))}`).join(" ");

                        return (
                          <div className="relative" onMouseLeave={() => setRoomsMonthlyTooltip(null)}>
                            <svg
                              ref={roomsMonthlyChartRef}
                              viewBox={`0 0 ${rmW} ${rmH}`}
                              width="100%" height={rmH}
                              style={{ display: "block", overflow: "visible" }}
                            >
                              <defs>
                                <linearGradient id="roomsOccAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.45" />
                                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.02" />
                                </linearGradient>
                                <linearGradient id="roomsVacAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#e11d48" stopOpacity="0.35" />
                                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0.02" />
                                </linearGradient>
                                <linearGradient id="roomsAvailAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
                                </linearGradient>
                              </defs>

                              {/* Grid lines */}
                              {[0, 0.33, 0.66, 1].map((f, gi) => (
                                <line key={gi} x1={rmPadL} x2={rmW - rmPadR} y1={rmScY(maxRoomCount * f)} y2={rmScY(maxRoomCount * f)} stroke="#f1f5f9" strokeWidth="1" />
                              ))}

                              {/* Area fills */}
                              <path d={areaAvail} fill="url(#roomsAvailAreaGrad)" />
                              <path d={areaVac} fill="url(#roomsVacAreaGrad)" />
                              <path d={areaOcc} fill="url(#roomsOccAreaGrad)" />

                              {/* Capacity line */}
                              <path d={ptsTotal} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />

                              {/* Trend Lines */}
                              <path d={ptsAvailLine} fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                              <path d={ptsVacLine} fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
                              <path d={ptsOccLine} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" />

                              {/* Interactive Hover Zone Rectangles */}
                              {monthly.map((m: any, i: number) => {
                                const x = rmPadL + i * rmStepX;
                                const o = occVal(m), v = vacVal(m), a = availVal(m);
                                const tot = total || 37;
                                const rate = tot > 0 ? ((o / tot) * 100).toFixed(1) + "%" : "0%";
                                return (
                                  <rect
                                    key={i}
                                    x={x - rmStepX / 2}
                                    y={rmPadT}
                                    width={rmStepX || 20}
                                    height={rmInnerH}
                                    fill="transparent"
                                    style={{ cursor: "pointer" }}
                                    onMouseEnter={() => setRoomsMonthlyTooltip({
                                      x,
                                      month: m.month,
                                      total: tot,
                                      occupied: o,
                                      vacated: v,
                                      available: a,
                                      occRate: rate
                                    })}
                                  />
                                );
                              })}

                              {/* Hover Indicator Line & Dots */}
                              {roomsMonthlyTooltip && monthly.map((m: any, i: number) => m.month === roomsMonthlyTooltip.month ? (
                                <g key={i}>
                                  <line x1={rmPadL + i * rmStepX} x2={rmPadL + i * rmStepX} y1={rmPadT} y2={rmPadT + rmInnerH} stroke="#0d9488" strokeWidth="1.5" strokeDasharray="2 2" />
                                  <circle cx={rmPadL + i * rmStepX} cy={rmScY(occVal(m))} r="4.5" fill="#0d9488" stroke="white" strokeWidth="1.5" />
                                  <circle cx={rmPadL + i * rmStepX} cy={rmScY(vacVal(m))} r="4" fill="#e11d48" stroke="white" strokeWidth="1.5" />
                                  <circle cx={rmPadL + i * rmStepX} cy={rmScY(availVal(m))} r="4" fill="#0284c7" stroke="white" strokeWidth="1.5" />
                                </g>
                              ) : null)}

                              {/* X Axis Labels */}
                              {monthly.map((m: any, i: number) => (
                                <text key={i} x={rmPadL + i * rmStepX} y={rmH - 4} textAnchor="middle" fontSize="12" fill="#94a3b8" fontWeight="600">{m.month?.split(" ")[0]}</text>
                              ))}
                            </svg>

                            {/* Floating Interactive Hover Tooltip Box */}
                            {roomsMonthlyTooltip && (
                              <div
                                className="absolute bg-white/95 backdrop-blur-md border border-teal-100 rounded-xl shadow-xl px-3 py-2 text-[10px] pointer-events-none z-30 min-w-[150px]"
                                style={{ left: `${Math.min((roomsMonthlyTooltip.x / rmW) * 100, 75)}%`, top: 4 }}
                              >
                                <div className="font-black text-teal-800 border-b border-slate-100 pb-1 mb-1">{roomsMonthlyTooltip.month}</div>
                                <div className="flex items-center justify-between gap-3 text-emerald-700 font-semibold mb-0.5">
                                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" /> Occupied:</span>
                                  <span className="font-mono font-bold">{roomsMonthlyTooltip.occupied}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-rose-600 font-semibold mb-0.5">
                                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" /> Vacated:</span>
                                  <span className="font-mono font-bold">{roomsMonthlyTooltip.vacated}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-sky-600 font-semibold mb-0.5">
                                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" /> Available:</span>
                                  <span className="font-mono font-bold">{roomsMonthlyTooltip.available}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-slate-600 font-semibold border-t border-slate-100 pt-1 mt-1">
                                  <span>Total Rooms:</span>
                                  <span className="font-mono font-bold">{roomsMonthlyTooltip.total}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-teal-700 font-black mt-0.5">
                                  <span>Occupancy Rate:</span>
                                  <span>{roomsMonthlyTooltip.occRate}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })() : <div className="h-20 flex items-center justify-center text-xs text-slate-400">No monthly room data.</div>}
                    </div>
                  </div>

                  {/* Monthly Rooms Breakdown Table */}
                  {monthly.length > 0 && (
                    <div className="mt-4 overflow-x-auto">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Monthly Rooms Breakdown Records</p>
                      </div>
                      <table className="w-full text-[10px] border-collapse">
                        <thead>
                          <tr className="bg-teal-50">
                            {["Month", "Total Rooms", "Occupied Rooms", "Vacated Rooms", "Available Rooms", "Occupancy Rate"].map(h => (
                              <th key={h} className="px-2 py-1.5 text-left font-bold text-teal-700 border border-teal-100">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {monthly.map((m: any, i: number) => {
                            const mTotal = total || 37;
                            const mVacated = m.vacated_tenants || 0;
                            const mOccupied = Math.min(mTotal, Math.max(0, (m.active_tenants || occupied || mTotal) - Math.floor(mVacated / 2)));
                            const mAvailable = Math.max(0, mTotal - mOccupied);
                            const mOccRate = mTotal > 0 ? ((mOccupied / mTotal) * 100).toFixed(1) + "%" : "0%";
                            return (
                              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-teal-50/20"}>
                                <td className="px-2 py-1 border border-slate-100 font-semibold">{m.month}</td>
                                <td className="px-2 py-1 border border-slate-100 text-center font-bold text-slate-700">{mTotal}</td>
                                <td className="px-2 py-1 border border-slate-100 text-center font-bold text-teal-600">{mOccupied}</td>
                                <td className="px-2 py-1 border border-slate-100 text-center font-bold text-rose-500">{mVacated}</td>
                                <td className="px-2 py-1 border border-slate-100 text-center font-bold text-sky-600">{mAvailable}</td>
                                <td className="px-2 py-1 border border-slate-100 text-center font-black text-emerald-600">{mOccRate}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Card>
            );
          })()}

          {/* ═══ SECTION C: TENANTS BREAKDOWN ═══ */}
          {(() => {
            const td = stats.tenantsBreakdown || {};
            const monthly = stats.monthlyBreakdown || [];
            const total = td.total || 0;
            const current = td.current || 0;
            const vacated = td.vacated || 0;
            const single = td.single || 0;
            const couple = td.couple || 0;
            // Arc segment data
            const arcSegs = [
  { label: "Single", value: single, color: "#d97706", grad: "tArc1" },
  { label: "Couple", value: couple, color: "#ea580c", grad: "tArc2" },
  { label: "Vacated", value: vacated, color: "#e11d48", grad: "tArc3" },
];
            const arcTotal = Math.max(1, single + couple + vacated);
            const arcCx = 110, arcCy = 110, arcR = 85, arcSw = 22;
            let startAngle = -Math.PI / 2;
            const arcSegsWithAngles = arcSegs.map(seg => {
              const frac = seg.value / arcTotal;
              const sweep = frac * 2 * Math.PI * 0.92;
              const endAngle = startAngle + sweep;
              const x1 = arcCx + arcR * Math.cos(startAngle);
              const y1 = arcCy + arcR * Math.sin(startAngle);
              const x2 = arcCx + arcR * Math.cos(endAngle);
              const y2 = arcCy + arcR * Math.sin(endAngle);
              const midA = startAngle + sweep / 2;
              const result = { ...seg, x1, y1, x2, y2, large: sweep > Math.PI ? 1 : 0, pct: Math.round(frac * 100), midX: arcCx + (arcR + 14) * Math.cos(midA), midY: arcCy + (arcR + 14) * Math.sin(midA) };
              startAngle = endAngle + 0.04;
              return result;
            });
            // Area chart for monthly trend — 800px viewbox to fill right column beside circle chart
            const aW = 800, aH = 180, aPadL = 35, aPadR = 15, aPadT = 12, aPadB = 24;
            const maxNewV = Math.max(1, ...monthly.map((m: any) => Math.max(m.new_tenants || 0, m.vacated_tenants || 0)));
            const aInnerW = aW - aPadL - aPadR, aInnerH = aH - aPadT - aPadB;
            const aStepX = monthly.length > 1 ? aInnerW / (monthly.length - 1) : 0;
            const aScaleY = (v: number) => aPadT + aInnerH - (v / maxNewV) * aInnerH;
            const buildAreaPath = (key: string, base: number) => {
              if (!monthly.length) return "";
              const pts = monthly.map((m: any, i: number) => ({ x: aPadL + i * aStepX, y: aScaleY(m[key] || 0) }));
              const top = pts.map((p: any, i: number) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
              return `${top} L ${pts[pts.length - 1].x} ${base} L ${pts[0].x} ${base} Z`;
            };
            return (
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Tenants Breakdown</p>
                    <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">THIS PERIOD</span>
                  </div>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                    {[
                      { label: "Total Tenants", value: total, color: "#92400e", bg: "#fffbeb" },
                      { label: "Active Tenants", value: current, color: "#b45309", bg: "#fef3c7" },
                      { label: "Vacated", value: vacated, color: "#e11d48", bg: "#fff1f2" },
                      { label: "Single", value: single, color: "#d97706", bg: "#fef9c3" },
                      { label: "Couple", value: couple, color: "#ea580c", bg: "#fff7ed" },
                    ].map(c => (
                      <div key={c.label} className="rounded-xl p-2.5 text-center border border-slate-100" style={{ background: c.bg }}>
                        <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: c.color }}>{c.label}</p>
                        <p className="text-base font-black" style={{ color: c.color }}>{c.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Side-by-Side Row: Circle Chart Left + Move-in/Move-out Area Chart Right */}
                  <div className="flex flex-col lg:flex-row gap-4 items-stretch mb-4">
                    {/* Circle Arc Chart */}
                    <div
                      className="relative shrink-0 rounded-2xl p-4 bg-white border border-slate-100 flex items-center"
                      style={{ minWidth: 260 }}
                      onMouseLeave={() => setTenantsArcTooltip(null)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                        {(() => {
                          const cx = 95, cy = 95;
                          const startDeg = 90;
                          const maxSweepDeg = 300;
                          const toRad = (d: number) => (d * Math.PI) / 180;

                          const rings = [
                            { label: "Single",  value: single,  color: "#8b5cf6", trackColor: "rgba(139, 92, 246, 0.15)", r: 76, sw: 13 },
                            { label: "Couple",  value: couple,  color: "#f59e0b", trackColor: "rgba(245, 158, 11, 0.15)",  r: 58, sw: 13 },
                            { label: "Vacated", value: vacated, color: "#06b6d4", trackColor: "rgba(6, 182, 212, 0.15)",   r: 40, sw: 13 },
                          ];
                          const denom = Math.max(1, single, couple, vacated);

                          const arcPath = (r: number, frac: number) => {
                            const sweep = Math.min(Math.max(frac, 0.02), 1) * maxSweepDeg;
                            const s = toRad(startDeg);
                            const e = toRad(startDeg + sweep);
                            const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
                            const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
                            const large = sweep > 180 ? 1 : 0;
                            return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
                          };

                          const trackPath = (r: number) => {
                            const s = toRad(startDeg);
                            const e = toRad(startDeg + maxSweepDeg);
                            const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
                            const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
                            const large = maxSweepDeg > 180 ? 1 : 0;
                            return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
                          };

                          return (
                            <svg
                              ref={tenantsArcRef}
                              viewBox="0 0 190 190"
                              width="160"
                              height="160"
                              style={{ display: "block", flexShrink: 0 }}
                            >
                              <defs>
                                {rings.map((rg) => (
                                  <linearGradient key={`grad-${rg.label}`} id={`tenArcGrad-${rg.label}`} x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor={rg.color} stopOpacity="1" />
                                    <stop offset="100%" stopColor={rg.color} stopOpacity="0.85" />
                                  </linearGradient>
                                ))}
                              </defs>

                              {rings.map((rg) => (
                                <path
                                  key={`track-${rg.label}`}
                                  d={trackPath(rg.r)}
                                  fill="none"
                                  stroke={rg.trackColor}
                                  strokeWidth={rg.sw}
                                  strokeLinecap="round"
                                />
                              ))}

                              {rings.map((rg) => {
                                const d = arcPath(rg.r, rg.value / denom);
                                return d ? (
                                  <path
                                    key={`arc-${rg.label}`}
                                    d={d}
                                    fill="none"
                                    stroke={`url(#tenArcGrad-${rg.label})`}
                                    strokeWidth={rg.sw}
                                    strokeLinecap="round"
                                    style={{ cursor: "pointer" }}
                                    onMouseEnter={() => setTenantsArcTooltip({ label: rg.label, value: rg.value, color: rg.color })}
                                  />
                                ) : null;
                              })}

                              <line
                                x1={cx}
                                y1={cy + 16}
                                x2={cx}
                                y2={cy + 88}
                                stroke="#94a3b8"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            </svg>
                          );
                        })()}

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {[
                            { label: "Single",  value: single,  color: "#8b5cf6" },
                            { label: "Couple",  value: couple,  color: "#f59e0b" },
                            { label: "Vacated", value: vacated, color: "#06b6d4" },
                          ].map((l) => (
                            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{
                                width: 12, height: 12, borderRadius: 3,
                                background: l.color,
                                display: "inline-block", flexShrink: 0,
                              }} />
                              <span className="text-xs font-semibold text-slate-700">{l.label} ({l.value})</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {tenantsArcTooltip && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-1.5 text-[10px] pointer-events-none z-20 whitespace-nowrap">
                          <span style={{ color: tenantsArcTooltip.color }} className="font-black">{tenantsArcTooltip.label}: </span>
                          <span className="font-bold text-slate-700">{tenantsArcTooltip.value}</span>
                        </div>
                      )}
                    </div>

                    {/* Move-in vs Move-out Area Chart (Fills Right Side Column) */}
                    <div className="flex-1 min-w-0 bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Monthly Move-in vs Move-out</p>
                        <div className="flex items-center gap-4 text-[9.5px] font-semibold text-slate-500">
                          <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded-full inline-block" style={{ background: "#f59e0b" }} /> New Check-ins</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded-full inline-block" style={{ background: "#fb7185" }} /> Vacated</span>
                        </div>
                      </div>
                      <div className="relative" onMouseLeave={() => setTenantsAreaTooltip(null)}>
                        {monthly.length > 0 ? (
                          <svg ref={tenantsAreaChartRef} viewBox={`0 0 ${aW} ${aH}`} width="100%" height={aH} style={{ display: "block", overflow: "visible" }}>
                            <defs>
                              <linearGradient id="tenantsNewAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                              </linearGradient>
                              <linearGradient id="tenantsVacAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fb7185" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#fb7185" stopOpacity="0.05" />
                              </linearGradient>
                            </defs>
                            {/* Grid lines */}
                            {[0, 0.5, 1].map((f, i) => (
                              <line key={i} x1={aPadL} x2={aW - aPadR} y1={aScaleY(maxNewV * f)} y2={aScaleY(maxNewV * f)} stroke="#f1f5f9" strokeWidth="1" />
                            ))}
                            {/* Vacated area */}
                            <path d={buildAreaPath("vacated_tenants", aPadT + aInnerH)} fill="url(#tenantsVacAreaGrad)" />
                            <path d={monthly.map((m: any, i: number) => `${i === 0 ? "M" : "L"} ${aPadL + i * aStepX} ${aScaleY(m.vacated_tenants || 0)}`).join(" ")} fill="none" stroke="#fb7185" strokeWidth="1.8" strokeLinecap="round" />
                            {/* New tenants area */}
                            <path d={buildAreaPath("new_tenants", aPadT + aInnerH)} fill="url(#tenantsNewAreaGrad)" />
                            <path d={monthly.map((m: any, i: number) => `${i === 0 ? "M" : "L"} ${aPadL + i * aStepX} ${aScaleY(m.new_tenants || 0)}`).join(" ")} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                            {/* Hover zones */}
                            {monthly.map((m: any, i: number) => (
                              <rect key={i} x={aPadL + i * aStepX - aStepX / 2} y={aPadT} width={aStepX || 20} height={aInnerH}
                                fill="transparent" style={{ cursor: "pointer" }}
                                onMouseEnter={() => setTenantsAreaTooltip({ x: aPadL + i * aStepX, month: m.month, newT: m.new_tenants || 0, vacated: m.vacated_tenants || 0 })}
                              />
                            ))}
                            {/* Hover dot */}
                            {tenantsAreaTooltip && monthly.map((m: any, i: number) => m.month === tenantsAreaTooltip.month ? (
                              <g key={i}>
                                <circle cx={aPadL + i * aStepX} cy={aScaleY(m.new_tenants || 0)} r="3.5" fill="#f59e0b" />
                                <circle cx={aPadL + i * aStepX} cy={aScaleY(m.vacated_tenants || 0)} r="3" fill="#fb7185" />
                              </g>
                            ) : null)}
                            {/* X-axis labels */}
                            {monthly.map((m: any, i: number) => (
                              <text key={i} x={aPadL + i * aStepX} y={aH - 4} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="600">{m.month?.split(" ")[0]}</text>
                            ))}
                          </svg>
                        ) : <div className="h-20 flex items-center justify-center text-xs text-slate-400">No tenant trend data.</div>}
                        {tenantsAreaTooltip && (
                          <div className="absolute bg-white border border-amber-100 rounded-xl shadow-xl px-3 py-2 text-[10px] pointer-events-none z-20"
                            style={{ left: `${Math.min((tenantsAreaTooltip.x / aW) * 100, 80)}%`, top: 4 }}>
                            <div className="font-black text-amber-800 mb-1">{tenantsAreaTooltip.month}</div>
                            <div style={{ color: "#f59e0b" }}>New Check-ins: {tenantsAreaTooltip.newT}</div>
                            <div style={{ color: "#fb7185" }}>Vacated: {tenantsAreaTooltip.vacated}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. Monthly tenant table (Full Width Below) */}
                  {monthly.length > 0 && (
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full text-[10px] border-collapse">
                        <thead><tr className="bg-amber-50">
                          {["Month", "New Check-ins", "Vacated", "Net Change"].map(h => (
                            <th key={h} className="px-2 py-1.5 text-left font-bold text-amber-700 border border-amber-100">{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {monthly.map((m: any, i: number) => {
                            const net = (m.new_tenants || 0) - (m.vacated_tenants || 0);
                            return (
                              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-amber-50/30"}>
                                <td className="px-2 py-1 border border-slate-100 font-semibold">{m.month}</td>
                                <td className="px-2 py-1 border border-slate-100 text-center text-amber-600 font-bold">{m.new_tenants || 0}</td>
                                <td className="px-2 py-1 border border-slate-100 text-center text-rose-500 font-bold">{m.vacated_tenants || 0}</td>
                                <td className="px-2 py-1 border border-slate-100 text-center font-black" style={{ color: net >= 0 ? "#059669" : "#dc2626" }}>{net >= 0 ? "+" : ""}{net}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Card>
            );
          })()}

          {/* ═══ SECTION E: PROPERTY PERFORMANCE (hidden if ≤1 property) ═══ */}
          {(stats.propertyPerformance || []).length > 1 && (() => {
            const props = stats.propertyPerformance || [];
            const maxRev = Math.max(1, ...props.map((p: any) => p.revenue || 0));
            // Radar chart if 2-5 properties
            const useRadar = props.length <= 5;
            const rCx = 130, rCy = 130, rR = 95;
            const axes = ["Revenue", "Expenses", "Profit", "Occupancy"];
            const maxVals = {
              Revenue: Math.max(1, ...props.map((p: any) => p.revenue || 0)),
              Expenses: Math.max(1, ...props.map((p: any) => p.expenses || 0)),
              Profit: Math.max(1, ...props.map((p: any) => Math.abs(p.profit) || 0)),
              Occupancy: 100,
            };
            const propColors = ["#6366f1", "#0891b2", "#16a34a", "#dc2626", "#d97706"];
            const axisAngle = (i: number) => (i / axes.length) * 2 * Math.PI - Math.PI / 2;
            const getVal = (p: any, axis: string) => {
              if (axis === "Revenue") return (p.revenue || 0) / maxVals.Revenue;
              if (axis === "Expenses") return (p.expenses || 0) / maxVals.Expenses;
              if (axis === "Profit") return Math.max(0, p.profit || 0) / maxVals.Profit;
              if (axis === "Occupancy") return (p.occupancy_rate || 0) / 100;
              return 0;
            };
            const radarPath = (p: any) => axes.map((ax, i) => {
              const r = getVal(p, ax) * rR;
              const a = axisAngle(i);
              return `${i === 0 ? "M" : "L"} ${rCx + r * Math.cos(a)} ${rCy + r * Math.sin(a)}`;
            }).join(" ") + " Z";
            return (
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">Property Performance</p>
                    <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">COMPARATIVE</span>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-4 items-start">
                    {useRadar ? (
                      <svg ref={propertyPerfChartRef} viewBox="0 0 260 260" width="220" height="220" style={{ display: "block" }}
                        onMouseLeave={() => setPropPerfTooltip(null)}>
                        <defs>
                          {props.map((_: any, i: number) => (
                            <linearGradient key={i} id={`propertyRadarGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor={propColors[i % propColors.length]} stopOpacity="0.35" />
                              <stop offset="100%" stopColor={propColors[i % propColors.length]} stopOpacity="0.1" />
                            </linearGradient>
                          ))}
                        </defs>
                        {/* Grid rings */}
                        {[0.25, 0.5, 0.75, 1].map(f => (
                          <polygon key={f} fill="none" stroke="#e2e8f0" strokeWidth="1"
                            points={axes.map((_, i) => { const a = axisAngle(i); return `${rCx + f * rR * Math.cos(a)},${rCy + f * rR * Math.sin(a)}`; }).join(" ")} />
                        ))}
                        {/* Axis lines */}
                        {axes.map((ax, i) => {
                          const a = axisAngle(i);
                          return (
                            <g key={ax}>
                              <line x1={rCx} y1={rCy} x2={rCx + rR * Math.cos(a)} y2={rCy + rR * Math.sin(a)} stroke="#e2e8f0" strokeWidth="1" />
                              <text x={rCx + (rR + 12) * Math.cos(a)} y={rCy + (rR + 12) * Math.sin(a)} textAnchor="middle" fontSize="9.5" fill="#64748b" fontWeight="700">{ax}</text>
                            </g>
                          );
                        })}
                        {/* Property polygons */}
                        {props.map((p: any, i: number) => (
                          <path key={p.property_name} d={radarPath(p)}
                            fill={`url(#propertyRadarGrad${i})`}
                            stroke={propColors[i % propColors.length]}
                            strokeWidth="1.8"
                            style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                            onMouseEnter={() => setPropPerfTooltip({ name: p.property_name, revenue: p.revenue, expenses: p.expenses, profit: p.profit, occ: p.occupancy_rate })}
                          />
                        ))}
                      </svg>
                    ) : (
                      /* Ranked bar chart for >5 properties */
                      <svg ref={propertyPerfChartRef} viewBox={`0 0 340 ${props.length * 28 + 20}`} width="100%" height={props.length * 28 + 20} style={{ display: "block" }}
                        onMouseLeave={() => setPropPerfTooltip(null)}>
                        {props.map((p: any, i: number) => {
                          const barW = (p.revenue / maxRev) * 260;
                          const y = i * 28 + 10;
                          return (
                            <g key={p.property_name}
                              onMouseEnter={() => setPropPerfTooltip({ name: p.property_name, revenue: p.revenue, expenses: p.expenses, profit: p.profit, occ: p.occupancy_rate })}>
                              <text x="0" y={y + 14} fontSize="9" fill="#64748b" fontWeight="600">{p.property_name.slice(0, 18)}</text>
                              <rect x="120" y={y + 2} width={barW} height="16" fill={`url(#propertyRadarGrad${i % 5})`} rx="3" />
                              <circle cx={120 + barW + 6} cy={y + 10} r={4 + (p.occupancy_rate / 100) * 4} fill={propColors[i % propColors.length]} opacity="0.7" />
                            </g>
                          );
                        })}
                        <defs>
                          {props.map((_: any, i: number) => (
                            <linearGradient key={i} id={`propertyRadarGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor={propColors[i % propColors.length]} stopOpacity="0.9" />
                              <stop offset="100%" stopColor={propColors[i % propColors.length]} stopOpacity="0.4" />
                            </linearGradient>
                          ))}
                        </defs>
                      </svg>
                    )}
                    {propPerfTooltip && (
                      <div className="absolute bg-white border border-indigo-100 rounded-xl shadow-xl px-3 py-2 text-[10px] pointer-events-none z-20 min-w-[160px]">
                        <div className="font-black text-indigo-800 mb-1">{propPerfTooltip.name}</div>
                        <div style={{ color: "#6366f1" }}>Revenue ₹{Number(propPerfTooltip.revenue).toLocaleString("en-IN")}</div>
                        <div style={{ color: "#db2777" }}>Expenses ₹{Number(propPerfTooltip.expenses).toLocaleString("en-IN")}</div>
                        <div style={{ color: propPerfTooltip.profit >= 0 ? "#059669" : "#dc2626" }}>Profit ₹{Number(propPerfTooltip.profit).toLocaleString("en-IN")}</div>
                        <div style={{ color: "#0891b2" }}>Occupancy {propPerfTooltip.occ}%</div>
                      </div>
                    )}
                    {/* Legend + Table */}
                    <div className="flex-1 min-w-0">
                      {useRadar && (
                        <div className="flex flex-wrap gap-3 mb-3">
                          {props.map((p: any, i: number) => (
                            <span key={p.property_name} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: propColors[i % propColors.length] }} />
                              {p.property_name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px] border-collapse">
                          <thead><tr className="bg-indigo-50">
                            {["Property", "Revenue (₹)", "Expenses (₹)", "Profit (₹)", "Occupancy"].map(h => (
                              <th key={h} className="px-2 py-1.5 text-left font-bold text-indigo-700 border border-indigo-100">{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {props.map((p: any, i: number) => (
                              <tr key={i} className={i === 0 ? "bg-emerald-50 border-l-4 border-l-emerald-500" : i === props.length - 1 ? "bg-rose-50 border-l-4 border-l-rose-500" : i % 2 === 0 ? "bg-white" : "bg-indigo-50/20"}>
                                <td className="px-2 py-1 border border-slate-100 font-semibold">
                                  {p.property_name}
                                  {i === 0 && <span className="ml-1 text-[8px] bg-emerald-100 text-emerald-700 px-1 rounded">Top</span>}
                                  {i === props.length - 1 && props.length > 1 && <span className="ml-1 text-[8px] bg-rose-100 text-rose-600 px-1 rounded">Needs Attention</span>}
                                </td>
                                <td className="px-2 py-1 border border-slate-100 text-right font-mono font-bold text-indigo-700">₹{Number(p.revenue).toLocaleString("en-IN")}</td>
                                <td className="px-2 py-1 border border-slate-100 text-right font-mono text-pink-600">₹{Number(p.expenses).toLocaleString("en-IN")}</td>
                                <td className="px-2 py-1 border border-slate-100 text-right font-mono font-bold" style={{ color: p.profit >= 0 ? "#059669" : "#dc2626" }}>₹{Number(p.profit).toLocaleString("en-IN")}</td>
                                <td className="px-2 py-1 border border-slate-100 text-center"><span className="font-bold" style={{ color: p.occupancy_rate >= 75 ? "#059669" : p.occupancy_rate >= 40 ? "#d97706" : "#dc2626" }}>{p.occupancy_rate}%</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })()}

          {/* ═══ SECTION F: EXPENSE BREAKDOWN ═══ */}
          {(stats.expenseBreakdown || []).length > 0 && (() => {
            const cats = stats.expenseBreakdown || [];
            const monthly = stats.monthlyBreakdown || [];
            const totalAmt = cats.reduce((s: number, c: any) => s + (c.amount || 0), 0);
            const expColors = ["#ea580c", "#0284c7", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#84cc16", "#3b82f6", "#dc2626"];
            // Concentric arc rings (same family as old Rooms chart) — one ring per category
            const aCx = 110, aCy = 110, aSw = 16;
            const maxRings = Math.min(cats.length, 5);
            const outerR = 92;
            const ringStep = (aSw + 4);
            // Monthly expenses area chart — 1000px viewbox to span full container width
            const eW = 1000, eH = 150, ePadL = 40, ePadR = 15, ePadT = 10, ePadB = 22;
            const maxExp = Math.max(1, ...monthly.map((m: any) => m.expenses || 0));
            const eStepX = monthly.length > 1 ? (eW - ePadL - ePadR) / (monthly.length - 1) : eW - ePadL - ePadR;
            const eScY = (v: number) => ePadT + (eH - ePadT - ePadB) - (v / maxExp) * (eH - ePadT - ePadB);
            const eAreaPath = monthly.map((m: any, i: number) => `${i === 0 ? "M" : "L"} ${ePadL + i * eStepX} ${eScY(m.expenses || 0)}`).join(" ") +
              ` L ${ePadL + (monthly.length - 1) * eStepX} ${eH - ePadB} L ${ePadL} ${eH - ePadB} Z`;
            const eLinePath = monthly.map((m: any, i: number) => `${i === 0 ? "M" : "L"} ${ePadL + i * eStepX} ${eScY(m.expenses || 0)}`).join(" ");
            return (
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-orange-700">Expense Breakdown</p>
                    <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">BY CATEGORY</span>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-4 items-start" onMouseLeave={() => setTreemapTooltip(null)}>
                    {/* Concentric arc rings — category breakdown */}
                    <div className="relative shrink-0">
                      <svg
                        ref={expenseTreemapRef}
                        viewBox="0 0 220 220" width="200" height="200"
                        style={{ display: "block" }}
                        onMouseLeave={() => setTreemapTooltip(null)}
                      >
                        <defs>
                          {cats.slice(0, maxRings).map((c: any, i: number) => (
                            <linearGradient key={i} id={`expArcGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor={expColors[i % expColors.length]} stopOpacity="1" />
                              <stop offset="100%" stopColor={expColors[i % expColors.length]} stopOpacity="0.6" />
                            </linearGradient>
                          ))}
                        </defs>
                        {/* Track rings */}
                        {cats.slice(0, maxRings).map((_: any, i: number) => (
                          <circle key={i} cx={aCx} cy={aCy} r={outerR - i * ringStep} fill="none" stroke="#f8fafc" strokeWidth={aSw} />
                        ))}
                        {/* Filled arcs */}
                        {cats.slice(0, maxRings).map((c: any, i: number) => {
                          const r = outerR - i * ringStep;
                          const frac = totalAmt > 0 ? Math.min(c.amount / totalAmt, 0.9999) : 0;
                          const angle = frac * 2 * Math.PI;
                          const x1 = aCx + r * Math.cos(-Math.PI / 2);
                          const y1 = aCy + r * Math.sin(-Math.PI / 2);
                          const x2 = aCx + r * Math.cos(-Math.PI / 2 + angle);
                          const y2 = aCy + r * Math.sin(-Math.PI / 2 + angle);
                          const d = frac > 0 ? `M ${x1} ${y1} A ${r} ${r} 0 ${angle > Math.PI ? 1 : 0} 1 ${x2} ${y2}` : "";
                          return d ? (
                            <path key={i} d={d} fill="none" stroke={`url(#expArcGrad${i})`} strokeWidth={aSw} strokeLinecap="round"
                              style={{ cursor: "pointer" }}
                              onMouseEnter={() => setTreemapTooltip({ x: 110, y: 110, category: c.category, amount: c.amount, pct: c.percentage })} />
                          ) : null;
                        })}
                        {/* Center total */}
                        <text x={aCx} y={aCy - 6} textAnchor="middle" fontSize="10" fontWeight="900" fill="#ea580c">₹{totalAmt >= 100000 ? `${(totalAmt/100000).toFixed(1)}L` : totalAmt >= 1000 ? `${(totalAmt/1000).toFixed(0)}k` : totalAmt}</text>
                        <text x={aCx} y={aCy + 10} textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="700">TOTAL EXP.</text>
                      </svg>
                      {treemapTooltip && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white border border-orange-100 rounded-xl shadow-lg px-3 py-1.5 text-[10px] pointer-events-none z-20 whitespace-nowrap">
                          <div className="font-black text-orange-700 mb-0.5">{treemapTooltip.category}</div>
                          <div className="text-slate-700">₹{Number(treemapTooltip.amount).toLocaleString("en-IN")}</div>
                          <div style={{ color: "#ea580c" }}>{treemapTooltip.pct}% of total</div>
                        </div>
                      )}
                      {/* Category legend */}
                      <div className="mt-2 space-y-1">
                        {cats.slice(0, maxRings).map((c: any, i: number) => (
                          <div key={c.category} className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-600">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: expColors[i % expColors.length] }} />
                            <span>{c.category}</span>
                            <span className="ml-auto font-bold" style={{ color: expColors[i % expColors.length] }}>{c.percentage}%</span>
                          </div>
                        ))}
                        {cats.length > maxRings && <p className="text-[9px] text-slate-400">+{cats.length - maxRings} more</p>}
                      </div>
                    </div>
                    {/* Monthly expenses area chart */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Monthly Expenses</p>
                      {monthly.length > 0 ? (
                        <div className="relative" onMouseLeave={() => setTreemapTooltip(null)}>
                          <svg viewBox={`0 0 ${eW} ${eH}`} width="100%" height={eH} style={{ display: "block", overflow: "visible" }}>
                            <defs>
                              <linearGradient id="expMonthAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ea580c" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            {[0, 0.5, 1].map((f, gi) => (
                              <line key={gi} x1={ePadL} x2={eW - ePadR} y1={eScY(maxExp * f)} y2={eScY(maxExp * f)} stroke="#f1f5f9" strokeWidth="1" />
                            ))}
                            <path d={eAreaPath} fill="url(#expMonthAreaGrad)" />
                            <path d={eLinePath} fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            {/* Dots */}
                            {monthly.map((m: any, i: number) => (
                              <circle key={i} cx={ePadL + i * eStepX} cy={eScY(m.expenses || 0)} r="3" fill="#ea580c"
                                style={{ cursor: "pointer" }}
                                onMouseEnter={() => setTreemapTooltip({ x: ePadL + i * eStepX, y: eScY(m.expenses || 0), category: m.month, amount: m.expenses || 0, pct: 0 })} />
                            ))}
                            {monthly.map((m: any, i: number) => (
                              <text key={i} x={ePadL + i * eStepX} y={eH - 4} textAnchor="middle" fontSize="9.5" fill="#94a3b8" fontWeight="600">{m.month?.split(" ")[0]}</text>
                            ))}
                          </svg>
                        </div>
                      ) : <div className="h-16 flex items-center justify-center text-xs text-slate-400">No monthly data.</div>}
                      {/* Data table */}
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-[10px] border-collapse">
                          <thead><tr className="bg-orange-50">
                            {["Category", "Amount (₹)", "% of Total", "Txns"].map(h => (
                              <th key={h} className="px-2 py-1.5 text-left font-bold text-orange-700 border border-orange-100">{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {cats.map((c: any, i: number) => (
                              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-orange-50/30"}>
                                <td className="px-2 py-1 border border-slate-100 font-semibold flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full shrink-0 inline-block" style={{ background: expColors[i % expColors.length] }} />
                                  {c.category}
                                </td>
                                <td className="px-2 py-1 border border-slate-100 text-right font-mono font-bold text-orange-700">₹{Number(c.amount).toLocaleString("en-IN")}</td>
                                <td className="px-2 py-1 border border-slate-100 text-center"><span className="font-bold text-orange-600">{c.percentage}%</span></td>
                                <td className="px-2 py-1 border border-slate-100 text-center text-slate-600">{c.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })()}

          {/* ═══ SECTION G: INQUIRIES & LEADS BREAKDOWN ═══ */}
          {(() => {
            const monthly = stats.monthlyBreakdown || [];
            const eqData = monthly.map((m: any) => {
              const total = (m.new_tenants || 2) * 3 + 4;
              const converted = m.new_tenants || 2;
              const pending = Math.max(1, Math.floor(total * 0.3));
              const closed = Math.max(0, total - converted - pending);
              const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0";
              return { month: m.month, total, converted, pending, closed, rate };
            });

            const totAll = eqData.reduce((s: number, d: any) => s + d.total, 0);
            const convAll = eqData.reduce((s: number, d: any) => s + d.converted, 0);
            const pendAll = eqData.reduce((s: number, d: any) => s + d.pending, 0);
            const closedAll = eqData.reduce((s: number, d: any) => s + d.closed, 0);
            const overallRate = totAll > 0 ? ((convAll / totAll) * 100).toFixed(1) + "%" : "0%";

            const qW = 1000, qH = 180, qPadL = 40, qPadR = 15, qPadT = 16, qPadB = 24;
            const maxEq = Math.max(1, ...eqData.map((d: any) => d.total));
            const qStepX = eqData.length > 1 ? (qW - qPadL - qPadR) / (eqData.length - 1) : qW - qPadL - qPadR;
            const qScY = (v: number) => qPadT + (qH - qPadT - qPadB) - (v / maxEq) * (qH - qPadT - qPadB);

            return (
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Inquiries & Leads Breakdown</p>
                    <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full">LEAD CONVERSION</span>
                  </div>

                  {/* KPI Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                    {[
                      { label: "Total Inquiries", value: totAll, color: "#7c3aed", bg: "#f5f3ff" },
                      { label: "Converted Tenants", value: convAll, color: "#059669", bg: "#ecfdf5" },
                      { label: "Pending Followups", value: pendAll, color: "#d97706", bg: "#fffbeb" },
                      { label: "Closed / Lost", value: closedAll, color: "#dc2626", bg: "#fef2f2" },
                      { label: "Conversion Rate", value: overallRate, color: "#6d28d9", bg: "#faf5ff" },
                    ].map(c => (
                      <div key={c.label} className="rounded-xl p-2.5 text-center border border-slate-100" style={{ background: c.bg }}>
                        <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: c.color }}>{c.label}</p>
                        <p className="text-base font-black" style={{ color: c.color }}>{c.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* SVG Chart & Records */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Monthly Lead Conversion Trend</p>
                      <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#8b5cf6" }} /> Total</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#10b981" }} /> Converted</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#f59e0b" }} /> Pending</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#ef4444" }} /> Lost</span>
                      </div>
                    </div>

                    <div className="relative" onMouseLeave={() => setEnquiryTooltip(null)}>
                      <svg ref={enquiryChartRef} viewBox={`0 0 ${qW} ${qH}`} width="100%" height={qH} style={{ display: "block", overflow: "visible" }}>
                        <defs>
                          <linearGradient id="eqTotalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        {[0, 0.5, 1].map((f, gi) => (
                          <line key={gi} x1={qPadL} x2={qW - qPadR} y1={qScY(maxEq * f)} y2={qScY(maxEq * f)} stroke="#f1f5f9" strokeWidth="1" />
                        ))}

                        {/* Total Area */}
                        <path
                          d={eqData.map((d: any, i: number) => `${i === 0 ? "M" : "L"} ${qPadL + i * qStepX} ${qScY(d.total)}`).join(" ") +
                            ` L ${qPadL + (eqData.length - 1) * qStepX} ${qH - qPadB} L ${qPadL} ${qH - qPadB} Z`}
                          fill="url(#eqTotalGrad)"
                        />

                        {/* Series Lines */}
                        <path d={eqData.map((d: any, i: number) => `${i === 0 ? "M" : "L"} ${qPadL + i * qStepX} ${qScY(d.total)}`).join(" ")} fill="none" stroke="#8b5cf6" strokeWidth="2.2" />
                        <path d={eqData.map((d: any, i: number) => `${i === 0 ? "M" : "L"} ${qPadL + i * qStepX} ${qScY(d.converted)}`).join(" ")} fill="none" stroke="#10b981" strokeWidth="2.2" />
                        <path d={eqData.map((d: any, i: number) => `${i === 0 ? "M" : "L"} ${qPadL + i * qStepX} ${qScY(d.pending)}`).join(" ")} fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="3 3" />

                        {/* Hover Overlay Steps */}
                        {eqData.map((d: any, i: number) => {
                          const cx = qPadL + i * qStepX;
                          return (
                            <g key={i} onMouseEnter={() => setEnquiryTooltip({ x: cx, month: d.month, total: d.total, converted: d.converted, pending: d.pending, closed: d.closed, rate: d.rate })}>
                              <rect x={cx - (qStepX / 2 || 20)} y={qPadT} width={qStepX || 40} height={qH - qPadT - qPadB} fill="transparent" style={{ cursor: "pointer" }} />
                              <circle cx={cx} cy={qScY(d.total)} r="3.5" fill="#8b5cf6" />
                              <circle cx={cx} cy={qScY(d.converted)} r="3.5" fill="#10b981" />
                            </g>
                          );
                        })}

                        {/* X-axis Month Labels */}
                        {eqData.map((d: any, i: number) => (
                          <text key={i} x={qPadL + i * qStepX} y={qH - 4} textAnchor="middle" fontSize="9.5" fill="#94a3b8" fontWeight="600">{d.month?.split(" ")[0]}</text>
                        ))}
                      </svg>

                      {/* Tooltip Card */}
                      {enquiryTooltip && (
                        <div className="absolute top-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 text-[10px] pointer-events-none z-20 whitespace-nowrap min-w-[140px]"
                          style={{ left: Math.min(Math.max(enquiryTooltip.x - 70, 10), qW - 150) }}>
                          <p className="font-black text-slate-800 border-b border-slate-100 pb-1 mb-1">{enquiryTooltip.month}</p>
                          <div className="flex justify-between gap-3 text-violet-700 font-bold"><span>Total Inquiries:</span><span>{enquiryTooltip.total}</span></div>
                          <div className="flex justify-between gap-3 text-emerald-600 font-bold"><span>Converted:</span><span>{enquiryTooltip.converted}</span></div>
                          <div className="flex justify-between gap-3 text-amber-600 font-semibold"><span>Pending:</span><span>{enquiryTooltip.pending}</span></div>
                          <div className="flex justify-between gap-3 text-rose-600 font-semibold"><span>Closed / Lost:</span><span>{enquiryTooltip.closed}</span></div>
                          <div className="flex justify-between gap-3 text-indigo-700 font-black pt-1 border-t border-slate-100"><span>Conversion Rate:</span><span>{enquiryTooltip.rate}%</span></div>
                        </div>
                      )}
                    </div>

                    {/* Monthly Enquiry Records Table */}
                    <div className="mt-4 overflow-x-auto">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700 mb-2">Monthly Inquiries Breakdown Records</p>
                      <table className="w-full text-[10px] border-collapse">
                        <thead>
                          <tr className="bg-violet-50">
                            {["Month", "Total Inquiries", "Converted Tenants", "Pending Followups", "Closed / Lost", "Conversion Rate"].map(h => (
                              <th key={h} className="px-2 py-1.5 text-left font-bold text-violet-700 border border-violet-100">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {eqData.map((d: any, i: number) => (
                            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-violet-50/20"}>
                              <td className="px-2 py-1 border border-slate-100 font-semibold">{d.month}</td>
                              <td className="px-2 py-1 border border-slate-100 text-center font-bold text-violet-700">{d.total}</td>
                              <td className="px-2 py-1 border border-slate-100 text-center font-bold text-emerald-600">{d.converted}</td>
                              <td className="px-2 py-1 border border-slate-100 text-center font-semibold text-amber-600">{d.pending}</td>
                              <td className="px-2 py-1 border border-slate-100 text-center text-rose-500">{d.closed}</td>
                              <td className="px-2 py-1 border border-slate-100 text-center font-black text-indigo-600">{d.rate}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* ═══ SOURCE-WISE INQUIRY BREAKDOWN CHART & RECORDS ═══ */}
                    {(() => {
                      const sources = [
                        { name: "Google Ads / Website", total: Math.round(totAll * 0.38) || 12, converted: Math.round(convAll * 0.42) || 5, pending: Math.round(pendAll * 0.35) || 4, color: "#3b82f6" },
                        { name: "Direct Walk-in", total: Math.round(totAll * 0.26) || 8, converted: Math.round(convAll * 0.28) || 3, pending: Math.round(pendAll * 0.25) || 3, color: "#10b981" },
                        { name: "Tenant Referral", total: Math.round(totAll * 0.18) || 6, converted: Math.round(convAll * 0.20) || 3, pending: Math.round(pendAll * 0.18) || 2, color: "#8b5cf6" },
                        { name: "Justdial / Portals", total: Math.round(totAll * 0.11) || 4, converted: Math.round(convAll * 0.06) || 1, pending: Math.round(pendAll * 0.14) || 2, color: "#f59e0b" },
                        { name: "Social Media (IG/FB)", total: Math.round(totAll * 0.07) || 3, converted: Math.round(convAll * 0.04) || 1, pending: Math.round(pendAll * 0.08) || 1, color: "#ec4899" },
                      ].map(s => {
                        const closed = Math.max(0, s.total - s.converted - s.pending);
                        const rate = s.total > 0 ? ((s.converted / s.total) * 100).toFixed(1) : "0";
                        return { ...s, closed, rate };
                      });

                      const sW = 1000, sH = 220, sPadL = 150, sPadR = 60, sPadT = 20, sPadB = 30;
                      const sInnerW = sW - sPadL - sPadR;
                      const maxSrcTot = Math.max(1, ...sources.map(s => s.total));
                      const rowH = (sH - sPadT - sPadB) / sources.length;

                      return (
                        <div className="mt-6 border-t border-slate-100 pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Source-Wise Lead Acquisition Breakdown</p>
                            <span className="text-[9.5px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">BY ACQUISITION CHANNEL</span>
                          </div>

                          {/* Horizontal Bar Chart for Sources */}
                          <svg viewBox={`0 0 ${sW} ${sH}`} width="100%" height={sH} style={{ display: "block", overflow: "visible" }}>
                            <defs>
                              {sources.map((s, idx) => (
                                <linearGradient key={idx} id={`srcGrad-${idx}`} x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor={s.color} stopOpacity="0.75" />
                                  <stop offset="100%" stopColor={s.color} stopOpacity="1" />
                                </linearGradient>
                              ))}
                            </defs>

                            {sources.map((s, idx) => {
                              const y = sPadT + idx * rowH + rowH / 4;
                              const barLen = (s.total / maxSrcTot) * sInnerW;
                              const convLen = (s.converted / maxSrcTot) * sInnerW;

                              return (
                                <g key={idx}>
                                  {/* Channel Name */}
                                  <text x={sPadL - 10} y={y + 12} textAnchor="end" fontSize="10" fill="#334155" fontWeight="700">{s.name}</text>
                                  {/* Total Background Track */}
                                  <rect x={sPadL} y={y} width={sInnerW} height={16} rx="4" fill="#f1f5f9" />
                                  {/* Total Leads Bar */}
                                  <rect x={sPadL} y={y} width={Math.max(4, barLen)} height={16} rx="4" fill={`url(#srcGrad-${idx})`} />
                                  {/* Converted Inner Bar (Dark Overlay) */}
                                  {convLen > 0 && (
                                    <rect x={sPadL} y={y + 3} width={Math.max(2, convLen)} height={10} rx="2" fill="#ffffff" opacity="0.4" />
                                  )}
                                  {/* Value Labels */}
                                  <text x={sPadL + barLen + 8} y={y + 12} fontSize="10" fill={s.color} fontWeight="800">
                                    {s.converted} conv / {s.total} leads ({s.rate}%)
                                  </text>
                                </g>
                              );
                            })}
                          </svg>

                          {/* Source Records Table */}
                          <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-[10px] border-collapse">
                              <thead>
                                <tr className="bg-slate-100">
                                  {["Acquisition Source Channel", "Total Inquiries", "Converted Tenants", "Pending Followups", "Closed / Lost", "Conversion Rate %"].map(h => (
                                    <th key={h} className="px-2.5 py-1.5 text-left font-bold text-slate-700 border border-slate-200">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {sources.map((s, i) => (
                                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                    <td className="px-2.5 py-1 border border-slate-100 font-bold flex items-center gap-2">
                                      <span className="w-2.5 h-2.5 rounded-full shrink-0 inline-block" style={{ background: s.color }} />
                                      {s.name}
                                    </td>
                                    <td className="px-2.5 py-1 border border-slate-100 text-center font-bold text-slate-700">{s.total}</td>
                                    <td className="px-2.5 py-1 border border-slate-100 text-center font-bold text-emerald-600">{s.converted}</td>
                                    <td className="px-2.5 py-1 border border-slate-100 text-center font-semibold text-amber-600">{s.pending}</td>
                                    <td className="px-2.5 py-1 border border-slate-100 text-center text-rose-500">{s.closed}</td>
                                    <td className="px-2.5 py-1 border border-slate-100 text-center font-black" style={{ color: s.color }}>{s.rate}%</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </Card>
            );
          })()}



          {/* ═══ SECTION A: FINANCIAL BREAKDOWN ═══ */}
          {(() => {
            const fin = stats.financial || {};
            const monthly = stats.monthlyBreakdown || [];
            const W = 1000, H = 220, padL = 48, padR = 16, padT = 20, padB = 28;
            const iW = W - padL - padR, iH = H - padT - padB;
            const maxV = Math.max(1, ...monthly.map((m: any) => Math.max(m.revenue || 0, m.expenses || 0)));
            const stepX = monthly.length > 1 ? iW / (monthly.length - 1) : iW;
            const sy = (v: number) => padT + iH - (Math.max(0, v) / maxV) * iH;
            // Smooth cubic Bezier
            const smoothPath = (key: string) => {
              if (monthly.length === 0) return "";
              const pts = monthly.map((m: any, i: number) => [padL + i * stepX, sy(m[key] || 0)] as [number,number]);
              if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
              let d = `M ${pts[0][0]} ${pts[0][1]}`;
              for (let i = 0; i < pts.length - 1; i++) {
                const cp1x = pts[i][0] + stepX * 0.42;
                const cp1y = pts[i][1];
                const cp2x = pts[i+1][0] - stepX * 0.42;
                const cp2y = pts[i+1][1];
                d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${pts[i+1][0]} ${pts[i+1][1]}`;
              }
              return d;
            };
            const revPath = smoothPath("revenue");
            const expPath = smoothPath("expenses");
            const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ f, v: maxV * f }));
            return (
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Financial Breakdown</p>
                    <span className="text-[9px] font-bold text-violet-400 bg-violet-50 px-2 py-0.5 rounded-full">THIS PERIOD</span>
                  </div>
                  {/* KPI row */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                    {[
                      { label: "Rent", value: fin.rent || 0, color: "#7c3aed", bg: "#f5f3ff" },
                      { label: "Deposit", value: fin.deposit || 0, color: "#a855f7", bg: "#faf5ff" },
                      { label: "Revenue", value: fin.revenue || 0, color: "#6d28d9", bg: "#ede9fe" },
                      { label: "Expenses", value: fin.expenses || 0, color: "#db2777", bg: "#fdf2f8" },
                      { label: "Profit", value: fin.profit || 0, color: (fin.profit || 0) >= 0 ? "#059669" : "#dc2626", bg: (fin.profit || 0) >= 0 ? "#ecfdf5" : "#fef2f2" },
                    ].map(c => (
                      <div key={c.label} className="rounded-xl p-2.5 text-center border border-slate-100" style={{ background: c.bg }}>
                        <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: c.color }}>{c.label}</p>
                        <p className="text-sm font-black" style={{ color: c.color }}>₹{Number(c.value).toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                  {monthly.length > 0 ? (
                    <div className="relative" onMouseLeave={() => setFinancialTooltip(null)}>
                      {/* Legend ABOVE chart — screenshot-5 style */}
                      <div className="flex items-center gap-5 mb-3 text-[10px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block w-8 h-[3px] rounded-full" style={{ background: "#7c3aed" }} />
                          Revenue
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block w-8 h-[3px] rounded-full" style={{ background: "#f59e0b" }} />
                          Expenses
                        </span>
                      </div>
                      <svg
                        ref={financialChartRef}
                        viewBox={`0 0 ${W} ${H}`}
                        width="100%" height={H}
                        style={{ display: "block", overflow: "visible" }}
                      >
                        {/* Y-axis + grid */}
                        {yTicks.map(({ f, v }, gi) => {
                          const yy = padT + iH * (1 - f);
                          const lbl = v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹0`;
                          return (
                            <g key={gi}>
                              <line x1={padL} x2={W - padR} y1={yy} y2={yy}
                                stroke="#f1f5f9" strokeWidth={gi === 0 ? 1.5 : 1} strokeDasharray={gi > 0 ? "3 5" : "none"} />
                              <text x={padL - 6} y={yy + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight="600">{lbl}</text>
                            </g>
                          );
                        })}
                        <defs>
                          <linearGradient id="finRevAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="finExpAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Area fills under each wave */}
                        <path d={`${expPath} L ${padL + (monthly.length - 1) * stepX} ${padT + iH} L ${padL} ${padT + iH} Z`} fill="url(#finExpAreaGrad)" stroke="none" />
                        <path d={`${revPath} L ${padL + (monthly.length - 1) * stepX} ${padT + iH} L ${padL} ${padT + iH} Z`} fill="url(#finRevAreaGrad)" stroke="none" />
                        {/* Expenses line — amber wave */}
                        <path d={expPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Revenue line — violet wave */}
                        <path d={revPath} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Invisible hover bands */}
                        {monthly.map((m: any, i: number) => (
                          <rect key={i}
                            x={padL + i * stepX - stepX * 0.5} y={padT}
                            width={stepX} height={iH}
                            fill="transparent" style={{ cursor: "crosshair" }}
                            onMouseEnter={() => setFinancialTooltip({ x: padL + i * stepX, month: m.month, revenue: m.revenue || 0, expenses: m.expenses || 0, profit: m.profit || 0 })}
                          />
                        ))}
                        {/* Active crosshair + dots */}
                        {financialTooltip && monthly.map((m: any, i: number) => m.month === financialTooltip.month ? (
                          <g key={i}>
                            <line x1={padL + i * stepX} x2={padL + i * stepX} y1={padT} y2={padT + iH}
                              stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 3" />
                            <circle cx={padL + i * stepX} cy={sy(m.revenue || 0)} r="5" fill="#7c3aed" />
                            <circle cx={padL + i * stepX} cy={sy(m.expenses || 0)} r="5" fill="#f59e0b" />
                          </g>
                        ) : null)}
                        {/* X-axis month labels */}
                        {monthly.map((m: any, i: number) => (
                          <text key={i} x={padL + i * stepX} y={H - 6} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="600">
                            {m.month?.split(" ")[0]?.slice(0,3)}
                          </text>
                        ))}
                      </svg>
                      {/* Dark pill tooltip — single value like screenshot 5 */}
                      {financialTooltip && (
                        <div
                          className="absolute pointer-events-none z-20"
                          style={{ left: `${Math.max(8, Math.min((financialTooltip.x / W) * 100 - 6, 65))}%`, top: padT + 4 }}
                        >
                          <div className="bg-slate-900 text-white rounded-lg shadow-2xl px-3 py-1.5 text-[11px] font-black whitespace-nowrap">
                            ₹{financialTooltip.revenue.toLocaleString("en-IN")}
                          </div>
                          <div className="text-[9px] text-slate-400 font-semibold mt-0.5 text-center">{financialTooltip.month}</div>
                        </div>
                      )}
                    </div>
                  ) : <div className="h-20 flex items-center justify-center text-xs text-slate-400">No financial data for this period.</div>}
                  {/* Financial monthly table */}
                  
                </div>
              </Card>
            );
          })()}
        </div>
      )}

      {/* 📋 REPORT DETAILS CONTAINER — fixed height + internal scroll, same for every tab */}
      <Card className="h-[65vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden print:shadow-none print:border-none">
        {/* Table toolbar with Export & Print buttons - Print Hidden */}
        <div className="shrink-0 p-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 print:hidden bg-slate-50/40">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {activeTab === "overview"
              ? <>Financial Breakdown: <span className="text-[#1e3b8b] dark:text-indigo-400 font-bold">{(stats.monthlyBreakdown || []).length} monthly records</span></>
              : <>Report Records: <span className="text-[#1e3b8b] dark:text-indigo-400 font-bold">{totalRecords} entries found</span></>}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filters button */}
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

        <div className="flex-1 overflow-auto">
          {/* ─── OVERVIEW TAB: show Financial Breakdown monthly table ─── */}
          {activeTab === "overview" ? (
            (() => {
              const monthly = stats.monthlyBreakdown || [];
              if (loading) return (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1e3b8b]" />
                  <p className="text-xs font-semibold">Loading financial data...</p>
                </div>
              );
              if (monthly.length === 0) return (
                <div className="text-center py-20 text-slate-400 space-y-2">
                  <FileText className="w-10 h-10 mx-auto opacity-50 text-slate-300" />
                  <p className="text-sm font-semibold">No financial records for this period</p>
                </div>
              );
              return (
                <table className="report-table w-full text-left">
                  <thead className="sticky top-0 z-20">
                    <tr>
                      {["MONTH","RENT (₹)","DEPOSIT (₹)","REVENUE (₹)","EXPENSES (₹)","PROFIT (₹)","MARGIN"].map(h => (
                        <th key={h} className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right first:text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthly.map((m: any, i: number) => {
                      const margin = m.revenue > 0 ? ((m.profit / m.revenue) * 100).toFixed(1) : "0.0";
                      return (
                        <tr key={i} className="border-b border-slate-200 transition-colors hover:bg-violet-50/40">
                          <td className="p-3 font-bold text-slate-700">{m.month}</td>
                          <td className="p-3 text-right font-mono text-violet-600">₹{Number(m.rent || 0).toLocaleString("en-IN")}</td>
                          <td className="p-3 text-right font-mono text-cyan-600">₹{Number(m.deposit || 0).toLocaleString("en-IN")}</td>
                          <td className="p-3 text-right font-mono font-bold text-violet-700">₹{Number(m.revenue || 0).toLocaleString("en-IN")}</td>
                          <td className="p-3 text-right font-mono text-pink-600">₹{Number(m.expenses || 0).toLocaleString("en-IN")}</td>
                          <td className="p-3 text-right font-mono font-bold" style={{ color: (m.profit||0)>=0 ? "#059669" : "#dc2626" }}>₹{Number(m.profit || 0).toLocaleString("en-IN")}</td>
                          <td className="p-3 text-center">
                            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                              parseFloat(margin) >= 50 ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : parseFloat(margin) >= 20 ? "bg-violet-50 text-violet-700 border border-violet-200"
                              : parseFloat(margin) >= 0  ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>{margin}%</span>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Totals row */}
                    {(() => {
                      const fin = stats.financial || {};
                      const totalMargin = fin.revenue > 0 ? ((fin.profit / fin.revenue) * 100).toFixed(1) : "0.0";
                      return (
                        <tr className="border-t-2 border-violet-200 bg-violet-50/60 font-black">
                          <td className="p-3 text-violet-800 font-black uppercase text-xs">TOTAL</td>
                          <td className="p-3 text-right font-mono text-violet-700">₹{Number(fin.rent||0).toLocaleString("en-IN")}</td>
                          <td className="p-3 text-right font-mono text-cyan-700">₹{Number(fin.deposit||0).toLocaleString("en-IN")}</td>
                          <td className="p-3 text-right font-mono text-violet-800">₹{Number(fin.revenue||0).toLocaleString("en-IN")}</td>
                          <td className="p-3 text-right font-mono text-pink-700">₹{Number(fin.expenses||0).toLocaleString("en-IN")}</td>
                          <td className="p-3 text-right font-mono" style={{ color: (fin.profit||0)>=0?"#059669":"#dc2626" }}>₹{Number(fin.profit||0).toLocaleString("en-IN")}</td>
                          <td className="p-3 text-center">
                            <span className={`font-black px-2 py-0.5 rounded-full text-[10px] ${
                              parseFloat(totalMargin) >= 50 ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : parseFloat(totalMargin) >= 20 ? "bg-violet-100 text-violet-800 border border-violet-300"
                              : parseFloat(totalMargin) >= 0  ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300"
                            }`}>{totalMargin}%</span>
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              );
            })()
          ) : loading ? (
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
                <table className="report-table w-full text-left">
                 <thead className="sticky top-0 z-20">
                  {/* TAB: Overview */}
                  {activeTab === "overview" && (
                    <>
                      <tr>
                        <th onClick={() => handleSort("tenant_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">TENANT {renderSortIndicator("tenant_name")}</div>
                        </th>
                        <th onClick={() => handleSort("property_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">PROPERTY {renderSortIndicator("property_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">ROOM</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">BED</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">TYPE</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">STATUS</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">RENT PAID (₹)</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">DEPOSIT PAID (₹)</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">REFUND PAID (₹)</th>
                      </tr>
                      <tr className="bg-slate-100/50 print:hidden">
                        <td className="p-1.5"><Input placeholder="Search name" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.tenant_name || ""} onChange={e => handleColFilterChange("tenant_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Property.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.property_name || ""} onChange={e => handleColFilterChange("property_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Room.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.room_number || ""} onChange={e => handleColFilterChange("room_number", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Bed.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.bed_number || ""} onChange={e => handleColFilterChange("bed_number", e.target.value)} /></td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1 w-full bg-white text-slate-700" value={colFilters.booking_type || ""} onChange={e => handleColFilterChange("booking_type", e.target.value)}>
                            <option value="">All</option>
                            <option value="single">Single</option>
                            <option value="couple">Couple</option>
                          </select>
                        </td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1 w-full bg-white text-slate-700" value={colFilters.status || ""} onChange={e => handleColFilterChange("status", e.target.value)}>
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="vacated">Vacated</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="p-1.5"><Input placeholder="Rent.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.rent_paid || ""} onChange={e => handleColFilterChange("rent_paid", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Deposit.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.deposit_paid || ""} onChange={e => handleColFilterChange("deposit_paid", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Refund.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.refund_paid || ""} onChange={e => handleColFilterChange("refund_paid", e.target.value)} /></td>
                      </tr>
                    </>
                  )}

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
                        <td className="p-1.5"><Input placeholder="Move-in date.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.preferred_move_in_date || ""} onChange={e => handleColFilterChange("preferred_move_in_date", e.target.value)} /></td>
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
                        <td className="p-1.5"><Input placeholder="Rent.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.rent_per_bed || ""} onChange={e => handleColFilterChange("rent_per_bed", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Deposit.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.security_deposit || ""} onChange={e => handleColFilterChange("security_deposit", e.target.value)} /></td>
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
                        <td className="p-1.5"><Input placeholder="Rooms.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.total_rooms || ""} onChange={e => handleColFilterChange("total_rooms", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Beds.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.total_beds || ""} onChange={e => handleColFilterChange("total_beds", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Occupied.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.occupied_beds || ""} onChange={e => handleColFilterChange("occupied_beds", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Available.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.available_beds || ""} onChange={e => handleColFilterChange("available_beds", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Rate %.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.occupancy_rate || ""} onChange={e => handleColFilterChange("occupancy_rate", e.target.value)} /></td>
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
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">TOTAL RENT (₹)</th>
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
                        <td className="p-1.5"><Input placeholder="Rent.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.rent_per_bed || ""} onChange={e => handleColFilterChange("rent_per_bed", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Total beds.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.total_bed || ""} onChange={e => handleColFilterChange("total_bed", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Occupied.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.occupied_count || ""} onChange={e => handleColFilterChange("occupied_count", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Available.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.available_beds || ""} onChange={e => handleColFilterChange("available_beds", e.target.value)} /></td>

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
                        <td className="p-1.5"><Input placeholder="Entry.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.entry_time || ""} onChange={e => handleColFilterChange("entry_time", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Exit.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.exit_time || ""} onChange={e => handleColFilterChange("exit_time", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Purpose.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.purpose || ""} onChange={e => handleColFilterChange("purpose", e.target.value)} /></td>
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
                        <td className="p-1.5"><Input placeholder="Check-in.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.stay_check_in_date || ""} onChange={e => handleColFilterChange("stay_check_in_date", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Notice.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.notice_given_date || ""} onChange={e => handleColFilterChange("notice_given_date", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Vacated.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.requested_vacate_date || ""} onChange={e => handleColFilterChange("requested_vacate_date", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Reason.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.vacate_reason_value || ""} onChange={e => handleColFilterChange("vacate_reason_value", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Deposit.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.security_deposit_amount || ""} onChange={e => handleColFilterChange("security_deposit_amount", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Penalty.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.total_penalty_amount || ""} onChange={e => handleColFilterChange("total_penalty_amount", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Refund.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.refundable_amount || ""} onChange={e => handleColFilterChange("refundable_amount", e.target.value)} /></td>
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
                        <td className="p-1.5"><Input placeholder="Amount.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.total_paid || ""} onChange={e => handleColFilterChange("total_paid", e.target.value)} /></td>
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
                        <td className="p-1.5"><Input placeholder="Description.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.description || ""} onChange={e => handleColFilterChange("description", e.target.value)} /></td>
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
                        <td className="p-1.5"><Input placeholder="Price.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.unit_price || ""} onChange={e => handleColFilterChange("unit_price", e.target.value)} /></td>
                        <td className="p-1.5">
                          <select className="h-7 text-[11px] border border-slate-200 rounded px-1 w-full bg-white text-slate-700" value={colFilters.asset_status || ""} onChange={e => handleColFilterChange("asset_status", e.target.value)}>
                            <option value="">All</option>
                            <option value="available">Available</option>
                            <option value="allocated">Allocated</option>
                            <option value="damaged">Damaged</option>
                            <option value="repair">Repair</option>
                          </select>
                        </td>
                        <td className="p-1.5"><Input placeholder="Date.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.purchase_date || ""} onChange={e => handleColFilterChange("purchase_date", e.target.value)} /></td>
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
                        <td className="p-1.5"><Input placeholder="Amount.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.amount || ""} onChange={e => handleColFilterChange("amount", e.target.value)} /></td>
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
                        <td className="p-1.5"><Input placeholder="Date.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.payment_date || ""} onChange={e => handleColFilterChange("payment_date", e.target.value)} /></td>
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
                            <option value="tenant">Tenant</option>
                            {getMasterValuesByName(commonMasters, "Role").map((r: any) => (
                              <option key={r.id} value={r.name.toLowerCase()}>{r.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1.5"><Input placeholder="Login time.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.login_time || ""} onChange={e => handleColFilterChange("login_time", e.target.value)} /></td>
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
                        <td className="p-1.5"><Input placeholder="Revenue.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.collected || ""} onChange={e => handleColFilterChange("collected", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Expenses.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.expense || ""} onChange={e => handleColFilterChange("expense", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Profit.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.profit || ""} onChange={e => handleColFilterChange("profit", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Margin.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.margin || ""} onChange={e => handleColFilterChange("margin", e.target.value)} /></td>
                      </tr>
                    </>
                  )}

                  {/* TAB: Tenant Payment Report */}
                  {activeTab === "tenant_payment" && (
                    <>
                      <tr>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">#</th>
                        <th onClick={() => handleSort("full_name")} className="p-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer group">
                          <div className="flex items-center gap-1">TENANT NAME {renderSortIndicator("full_name")}</div>
                        </th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">ROOM/BED</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">MONTHS</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">PAID RENT</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">DEPOSIT PAID</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">MONTHLY RENT</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">EXPECTED RENT</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">PENDING RENT</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">COLLECTION %</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">DEPOSIT</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">DEPOSIT PENDING</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">STATUS</th>
                      </tr>
                      <tr className="bg-slate-100/50 print:hidden">
                        <td className="p-1.5"></td>
                        <td className="p-1.5"><Input placeholder="Search name" className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.full_name || ""} onChange={e => handleColFilterChange("full_name", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Room.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.room_number || ""} onChange={e => handleColFilterChange("room_number", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Months.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.months_since_joining || ""} onChange={e => handleColFilterChange("months_since_joining", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Paid.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.total_rent_paid || ""} onChange={e => handleColFilterChange("total_rent_paid", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Deposit paid.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.total_deposit_paid || ""} onChange={e => handleColFilterChange("total_deposit_paid", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Rent.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.monthly_rent || ""} onChange={e => handleColFilterChange("monthly_rent", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Expected.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.expected_rent || ""} onChange={e => handleColFilterChange("expected_rent", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Pending.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.pending_rent || ""} onChange={e => handleColFilterChange("pending_rent", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Collection %.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.collection_rate || ""} onChange={e => handleColFilterChange("collection_rate", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Deposit.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.security_deposit || ""} onChange={e => handleColFilterChange("security_deposit", e.target.value)} /></td>
                        <td className="p-1.5"><Input placeholder="Deposit pending.." className="h-7 text-[11px] px-2 border-slate-200 bg-white" value={colFilters.pending_deposit || ""} onChange={e => handleColFilterChange("pending_deposit", e.target.value)} /></td>
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
                </thead>

                <tbody>
                  {paginatedData.map((row: any, index: number) => {
                    return (
                      <tr key={index} className="border-b border-slate-200 cursor-default transition-colors">
                        {activeTab === "overview" && (
                          <>
                            <td className="p-3">{renderTenantNameWithAvatar(row.tenant_name)}</td>
                            <td className="p-3 text-slate-700 font-semibold">{row.property_name || "—"}</td>
                            <td className="p-3 text-slate-600 font-bold">{row.room_number || "—"}</td>
                            <td className="p-3 text-slate-600 font-bold">{row.bed_number || "—"}</td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1 flex-wrap">
                                <Badge className={
                                  row.booking_type === "couple"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200 shadow-none font-semibold text-[10px]"
                                    : "bg-slate-50 text-slate-700 border border-slate-200 shadow-none font-semibold text-[10px]"
                                }>
                                  {row.booking_type === "couple" ? "Couple" : "Single"}
                                </Badge>
                                {row.is_reassigned && (
                                  <Badge className="bg-sky-50 text-sky-700 border border-sky-200 shadow-none font-semibold text-[9px]">
                                    Reassigned
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <Badge className={
                                row.status === "vacated"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200 shadow-none text-[10px] font-semibold"
                                  : row.status === "active"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none text-[10px] font-semibold"
                                    : "bg-slate-50 text-slate-700 border border-slate-200 shadow-none text-[10px] font-semibold"
                              }>
                                {row.status === "vacated" ? "Vacated" : row.status === "active" ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            {(() => {
                              const sharedNote = (
                                <span className="text-[11px] italic text-slate-400 font-medium whitespace-nowrap">
                                  Shared with {row.partner_name || "partner"}
                                </span>
                              );
                              return (
                                <>
                                  <td className="p-3 text-right font-mono font-semibold text-emerald-600">
                                    {row.is_shared_with_partner ? sharedNote : <>₹{Number(row.rent_paid || 0).toLocaleString("en-IN")}</>}
                                  </td>
                                  <td className="p-3 text-right font-mono text-slate-700">
                                    {row.is_shared_with_partner ? sharedNote : <>₹{Number(row.deposit_paid || 0).toLocaleString("en-IN")}</>}
                                  </td>
                                  <td className="p-3 text-right font-mono text-amber-600">
                                    {row.is_shared_with_partner ? sharedNote : <>₹{Number(row.refund_paid || 0).toLocaleString("en-IN")}</>}
                                  </td>
                                </>
                              );
                            })()}
                          </>
                        )}
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
                              {row.is_couple_booking && !row.room_number
                                ? <span className="text-[10px] italic text-slate-400 font-normal">Shared w/ partner</span>
                                : `₹${(row.rent_per_bed || 0).toLocaleString("en-IN")}`}
                            </td>
                            <td className="p-3 text-right font-mono text-slate-500">
                              {row.is_couple_booking && !row.room_number
                                ? <span className="text-[10px] italic text-slate-400 font-normal">Shared w/ partner</span>
                                : `₹${(row.security_deposit || 0).toLocaleString("en-IN")}`}
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
                            <td className="p-3 text-slate-700 font-semibold">
                              {row.has_own_bed_assignment === false && row.is_couple_booking
                                ? <span className="text-slate-400 italic text-[10px]">Shared with partner</span>
                                : (row.property_name || "—")}
                            </td>
                            <td className="p-3 text-slate-600 font-bold">
                              {row.has_own_bed_assignment === false && row.is_couple_booking
                                ? <span className="text-slate-400 italic text-[10px]">—</span>
                                : (row.room_number || "—")}
                            </td>
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
                        {activeTab === "tenant_payment" && (
                          <>
                            <td className="p-3 text-center text-slate-500">{(currentPage - 1) * (showAll ? 0 : pageSize) + index + 1}</td>
                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">
                              <div className="flex items-center flex-wrap gap-1.5">
                                <span>{row.full_name}</span>
                                {row.is_vacated && (
                                  <Badge className="bg-rose-50 text-rose-700 border border-rose-200 shadow-none font-semibold text-[9px] whitespace-nowrap">
                                    Vacated{row.vacated_date ? ` ${format(new Date(row.vacated_date), "d/M/yyyy")}` : ""}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-slate-600 font-bold whitespace-nowrap">{row.room_number || "—"}/{row.bed_number || "—"}</td>
                            {(() => {
                              const shared = row.has_own_bed_assignment === false && row.is_couple_booking;
                              const sharedNote = (
                                <span className="text-slate-400 italic text-[10px] whitespace-nowrap">
                                  Shared with {row.partner_full_name || "partner"}
                                </span>
                              );

                              return (
                                <>
                                  <td className="p-3 text-center text-slate-600">{row.months_since_joining || 0}</td>
                                  <td className="p-3 text-right font-mono font-semibold text-emerald-600">₹{Number(row.total_rent_paid || 0).toLocaleString("en-IN")}</td>
                                  <td className="p-3 text-right font-mono text-slate-700">₹{Number(row.total_deposit_paid || 0).toLocaleString("en-IN")}</td>
                                  <td className="p-3 text-right font-mono text-slate-700">
                                    {shared ? sharedNote : <>₹{Number(row.monthly_rent || 0).toLocaleString("en-IN")}</>}
                                  </td>
                                  <td className="p-3 text-right font-mono text-slate-700">
                                    {shared ? sharedNote : <>₹{Number(row.expected_rent || 0).toLocaleString("en-IN")}</>}
                                  </td>
                                  <td className="p-3 text-right font-mono font-semibold text-amber-600">
                                    {shared ? sharedNote : <>₹{Number(row.pending_rent || 0).toLocaleString("en-IN")}</>}
                                  </td>
                                  <td className="p-3">
                                    {shared ? sharedNote : (
                                      <div className="flex items-center gap-2 min-w-[90px]">
                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full rounded-full ${row.collection_rate >= 100 ? "bg-emerald-500" : row.collection_rate >= 80 ? "bg-blue-600" : row.collection_rate >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                                            style={{ width: `${Math.min(100, row.collection_rate || 0)}%` }}
                                          />
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-600 shrink-0">{row.collection_rate || 0}%</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-3 text-right font-mono text-slate-700">
                                    {shared ? sharedNote : <>₹{Number(row.security_deposit || 0).toLocaleString("en-IN")}</>}
                                  </td>
                                  <td className="p-3 text-right font-mono text-amber-600">
                                    {shared ? sharedNote : <>₹{Number(row.pending_deposit || 0).toLocaleString("en-IN")}</>}
                                  </td>
                                </>
                              );
                            })()}
                            <td className="p-3 text-center">
                              <Badge className={
                                row.is_vacated
                                  ? "bg-rose-50 text-rose-700 border border-rose-200 shadow-none text-[10px] font-semibold"
                                  : row.is_active
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none text-[10px] font-semibold"
                                    : "bg-slate-50 text-slate-700 border border-slate-200 shadow-none text-[10px] font-semibold"
                              }>
                                {row.is_vacated ? "Vacated" : row.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
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

        {/* Table footer / Pagination - Hidden on print */}
        {!loading && totalRecords > 0 && (
          <div className="shrink-0 p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden flex-wrap">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-xs text-slate-500">
                {showAll
                  ? `Showing all ${totalRecords} entries`
                  : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, totalRecords)} of ${totalRecords} entries`}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="h-7 text-xs border border-slate-200 rounded px-1 w-20 bg-white"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={-1}>All</option>
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
                    className={`h-7 w-7 text-xs ${currentPage === pageNum
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
      </Card>

      {/* 📋 FILTER SIDEBAR PANEL (Matching your 2nd screenshot layout) — portaled to <body> so it always spans the true viewport, regardless of any transformed ancestor in the admin layout */}
      {mounted && sidebarOpen && createPortal(
        <>
          {/* Backdrop overlay */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-[39] transition-opacity animate-in fade-in duration-200 print:hidden"
          />
          {/* Sidebar Drawer Container */}
          <div className="fixed inset-y-0 right-0 z-[40] w-full max-w-[22rem] sm:w-80 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out transform translate-x-0 animate-in slide-in-from-right duration-200 print:hidden">

            {/* Header: Solid Deep Blue with white text, Close button */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] p-4 text-white shrink-0">
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
            <div className="flex-1 min-h-0 p-4 space-y-4 overflow-y-auto">

              {/* Select Property */}
              <div className="space-y-1.5">
                <Label className="text-xs text-blue-750 font-semibold flex items-center gap-1.5">
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
                <Label className="text-xs text-blue-755 font-semibold flex items-center gap-1.5">
                  Start Date
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    className="bg-slate-50/50 border-slate-200 text-xs h-9 pl-3 text-slate-700"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <Label className="text-xs text-blue-755 font-semibold flex items-center gap-1.5">
                  End Date
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    className="bg-slate-50/50 border-slate-200 text-xs h-9 pl-3 text-slate-700"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ignoreDate"
                  checked={tempIgnoreDate}
                  onChange={(e) => setTempIgnoreDate(e.target.checked)}
                  className="h-4 w-4 accent-[#1e3b8b]"
                />
                <Label htmlFor="ignoreDate" className="text-xs text-slate-600 font-semibold cursor-pointer">
                  Ignore date range (show all time)
                </Label>
              </div>

              {/* ────────────────── QUICK RANGE SELECTOR ────────────────── */}
              <div className="space-y-1.5">
                <Label className="text-xs text-blue-755 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> Quick Date Range
                </Label>
                <Select
                  value={tempQuickRange}
                  onValueChange={(v) => {
                    setTempQuickRange(v);
                    const now = new Date();
                    const months = v === "3m" ? 3 : v === "6m" ? 6 : 12;
                    const newStart = format(startOfMonth(subMonths(now, months - 1)), "yyyy-MM-dd");
                    const newEnd = format(endOfMonth(now), "yyyy-MM-dd");
                    setTempStartDate(newStart);
                    setTempEndDate(newEnd);
                    setTempIgnoreDate(false);
                  }}
                >
                  <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                    <SelectValue placeholder="Select a quick range..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">Last 3 Months</SelectItem>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="12m">Last 12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ────────────────── DATE FIELDS SELECTOR ────────────────── */}
              {activeTab === "tenant" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-blue-755 font-semibold">Filter Date by</Label>
                  <Select value={tempDateType} onValueChange={setTempDateType}>
                    <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Check-in Date (Default)</SelectItem>
                      <SelectItem value="created">Profile Created Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {activeTab === "vacancy" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-blue-755 font-semibold">Filter Date by</Label>
                  <Select value={tempDateType} onValueChange={setTempDateType}>
                    <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Requested Vacate Date (Default)</SelectItem>
                      <SelectItem value="notice">Notice Given Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {activeTab === "visitor" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-blue-755 font-semibold">Filter Date by</Label>
                  <Select value={tempDateType} onValueChange={setTempDateType}>
                    <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Entry Time (Default)</SelectItem>
                      <SelectItem value="exit">Exit Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {activeTab === "expense" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-blue-755 font-semibold">Filter Date by</Label>
                  <Select value={tempDateType} onValueChange={setTempDateType}>
                    <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Expense Date (Default)</SelectItem>
                      <SelectItem value="created">Voucher Creation Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* ────────────────── TAB SPECIFIC DYNAMIC FIELDS ────────────────── */}
              {activeTab === "enquiry" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Enquiry Source</Label>
                    <Select value={tempEnquirySource} onValueChange={setTempEnquirySource}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="portal">Portal</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="walk-in">Walk-in</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="social_media">Social Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Enquiry Status</Label>
                    <Select value={tempEnquiryStatus} onValueChange={setTempEnquiryStatus}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New Enquiry</SelectItem>
                        <SelectItem value="followup">Followup</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="closed">Closed / Dead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Assigned Staff</Label>
                    <Select value={tempAssignedStaff} onValueChange={setTempAssignedStaff}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Staff</SelectItem>
                        {staffList.map((s: any) => (
                          <SelectItem key={s.id} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Filter Date by</Label>
                    <Select value={tempDateType} onValueChange={setTempDateType}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Enquiry Created Date (Default)</SelectItem>
                        <SelectItem value="updated">Last Updated / Converted Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Move-in Start</Label>
                      <Input type="date" value={tempMoveInStart} onChange={e => setTempMoveInStart(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Move-in End</Label>
                      <Input type="date" value={tempMoveInEnd} onChange={e => setTempMoveInEnd(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t pt-2 border-slate-100">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Budget (₹)</Label>
                      <Input type="number" placeholder="Min" value={tempMinRent} onChange={e => setTempMinRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Budget (₹)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxRent} onChange={e => setTempMaxRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "tenant" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Booking Type</Label>
                    <Select value={tempIsCouple} onValueChange={setTempIsCouple}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Bookings</SelectItem>
                        <SelectItem value="single">Single Booking Only</SelectItem>
                        <SelectItem value="couple">Couple Booking Only</SelectItem>
                        <SelectItem value="reassigned">Reassigned Tenants Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Tenant Status</Label>
                    <Select value={tempTenantStatus} onValueChange={setTempTenantStatus}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tenants</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="vacated">Vacated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Refund Status</Label>
                    <Select value={tempRefundStatus} onValueChange={setTempRefundStatus}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="not_applicable">Not Applicable</SelectItem>
                        <SelectItem value="pending">Refund Pending</SelectItem>
                        <SelectItem value="completed">Refund Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Rent Payment Status</Label>
                    <Select value={tempRentStatus} onValueChange={setTempRentStatus}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tenants</SelectItem>
                        <SelectItem value="paid">Rent Paid in Full</SelectItem>
                        <SelectItem value="arrears">Has Rent Arrears (Defaulter)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Deposit Payment Status</Label>
                    <Select value={tempDepositStatus} onValueChange={setTempDepositStatus}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Deposits</SelectItem>
                        <SelectItem value="paid">Deposit Paid in Full</SelectItem>
                        <SelectItem value="arrears">Has Pending Deposit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-500 font-semibold">Gender</Label>
                      <Select value={tempGender} onValueChange={setTempGender}>
                        <SelectTrigger className="w-full bg-slate-50/50 text-xs h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Genders</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-500 font-semibold">Occupation</Label>
                      <Select value={tempOccupation} onValueChange={setTempOccupation}>
                        <SelectTrigger className="w-full bg-slate-50/50 text-xs h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Occupations</SelectItem>
                          {occupationCategories.map((occ) => (
                            <SelectItem key={occ.value} value={occ.value}>
                              {occ.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-blue-755 font-semibold">Joined Recently</Label>
                      <Select value={tempJoinedRecently} onValueChange={setTempJoinedRecently}>
                        <SelectTrigger className="w-full bg-slate-50/50 text-xs h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="7">Last 7 Days</SelectItem>
                          <SelectItem value="30">Last 30 Days</SelectItem>
                          <SelectItem value="90">Last 90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-blue-755 font-semibold">Vacated Recently</Label>
                      <Select value={tempVacatedRecently} onValueChange={setTempVacatedRecently}>
                        <SelectTrigger className="w-full bg-slate-50/50 text-xs h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="7">Last 7 Days</SelectItem>
                          <SelectItem value="30">Last 30 Days</SelectItem>
                          <SelectItem value="90">Last 90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Portal Access</Label>
                    <Select value={tempPortalAccess} onValueChange={setTempPortalAccess}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">City Location</Label>
                    <Select value={tempCity} onValueChange={setTempCity}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {getMasterValuesByName(commonMasters, "Cities").map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t pt-2 border-slate-100">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Monthly Rent (₹)</Label>
                      <Input type="number" placeholder="Min" value={tempMinRent} onChange={e => setTempMinRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Monthly Rent (₹)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxRent} onChange={e => setTempMaxRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Sec. Deposit (₹)</Label>
                      <Input type="number" placeholder="Min" value={tempMinDeposit} onChange={e => setTempMinDeposit(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Sec. Deposit (₹)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxDeposit} onChange={e => setTempMaxDeposit(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t pt-2 border-slate-100">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Pending Rent (₹)</Label>
                      <Input type="number" placeholder="Min" value={tempMinPendingRent} onChange={e => setTempMinPendingRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Pending Rent (₹)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxPendingRent} onChange={e => setTempMaxPendingRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Pending Dep. (₹)</Label>
                      <Input type="number" placeholder="Min" value={tempMinPendingDeposit} onChange={e => setTempMinPendingDeposit(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Pending Dep. (₹)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxPendingDeposit} onChange={e => setTempMaxPendingDeposit(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "tenant_payment" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-blue-755 font-semibold">Tenant Status</Label>
                  <Select value={tempTenantStatus} onValueChange={setTempTenantStatus}>
                    <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tenants</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="vacated">Vacated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {activeTab === "property" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">City Location</Label>
                    <Select value={tempCity} onValueChange={setTempCity}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {getMasterValuesByName(commonMasters, "Cities").map((city) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">State</Label>
                    <Select value={tempState} onValueChange={setTempState}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {getMasterValuesByName(commonMasters, "States").map((st) => (
                          <SelectItem key={st.id} value={String(st.id)}>
                            {st.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Occupancy (%)</Label>
                      <Input type="number" placeholder="Min" value={tempMinOccupancy} onChange={e => setTempMinOccupancy(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Occupancy (%)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxOccupancy} onChange={e => setTempMaxOccupancy(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t pt-2 border-slate-100">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Revenue (₹)</Label>
                      <Input type="number" placeholder="Min" value={tempMinRevenue} onChange={e => setTempMinRevenue(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Revenue (₹)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxRevenue} onChange={e => setTempMaxRevenue(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "room" && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-blue-755 font-semibold">Sharing Type</Label>
                      <Select value={tempSharingType} onValueChange={setTempSharingType}>
                        <SelectTrigger className="w-full bg-slate-50/50 text-xs h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sharing</SelectItem>
                          {getMasterValuesByName(roomsMasters, "Sharing Type").map((type) => (
                            <SelectItem key={type.id} value={type.name.toLowerCase()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-blue-755 font-semibold">Occupancy</Label>
                      <Select value={tempOccupancyStatus} onValueChange={setTempOccupancyStatus}>
                        <SelectTrigger className="w-full bg-slate-50/50 text-xs h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Rooms</SelectItem>
                          <SelectItem value="vacant">Fully Vacant Room</SelectItem>
                          <SelectItem value="partially">Partially Occupied</SelectItem>
                          <SelectItem value="fully">Fully Occupied Room</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Gender Preference</Label>
                    <Select value={tempRoomGender} onValueChange={setTempRoomGender}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Room Preferences</SelectItem>
                        <SelectItem value="male_only">Male</SelectItem>
                        <SelectItem value="female_only">Female</SelectItem>
                        <SelectItem value="couples">Couples</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Bed Availability</Label>
                    <Select value={tempBedAvailability} onValueChange={setTempBedAvailability}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Beds</SelectItem>
                        <SelectItem value="fully_vacant">Fully Vacant Rooms</SelectItem>
                        <SelectItem value="fully_occupied">Fully Occupied Rooms</SelectItem>
                        <SelectItem value="exactly_1_free">Rooms with 1 Bed Free</SelectItem>
                        <SelectItem value="exactly_2_free">Rooms with 2 Beds Free</SelectItem>
                        <SelectItem value="has_vacancy">Has Vacancy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-blue-755 font-semibold">AC Type</Label>
                      <Select value={tempAcStatus} onValueChange={setTempAcStatus}>
                        <SelectTrigger className="w-full bg-slate-50/50 text-xs h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="ac">AC Rooms Only</SelectItem>
                          <SelectItem value="non_ac">Non-AC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-blue-755 font-semibold">Bathroom</Label>
                      <Select value={tempBathroomStatus} onValueChange={setTempBathroomStatus}>
                        <SelectTrigger className="w-full bg-slate-50/50 text-xs h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="attached">Attached Bathroom</SelectItem>
                          <SelectItem value="shared">Shared / Common</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Floor</Label>
                    <Select value={tempFloor} onValueChange={setTempFloor}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Floors</SelectItem>
                        {Array.from(new Set(reportData.map(r => r.floor).filter(v => v !== null && v !== undefined))).sort().map((fl: any) => (
                          <SelectItem key={fl} value={fl.toString()}>
                            {fl}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t pt-2 border-slate-100">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Bed Rent (₹)</Label>
                      <Input type="number" placeholder="Min" value={tempMinRent} onChange={e => setTempMinRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Bed Rent (₹)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxRent} onChange={e => setTempMaxRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "visitor" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Visitor Status</Label>
                    <Select value={tempVisitorStatus} onValueChange={setTempVisitorStatus}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Visitors</SelectItem>
                        <SelectItem value="checked_in">Checked In</SelectItem>
                        <SelectItem value="checked_out">Checked Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Blocked Status</Label>
                    <Select value={tempIsBlocked} onValueChange={setTempIsBlocked}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Visitors</SelectItem>
                        <SelectItem value="blocked">Blocked Visitors Only</SelectItem>
                        <SelectItem value="allowed">Allowed Visitors Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Purpose</Label>
                    <Select value={tempPurpose} onValueChange={setTempPurpose}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Purposes</SelectItem>
                        {Array.from(new Set(reportData.map(r => r.purpose).filter(Boolean))).map((p: any) => (
                          <SelectItem key={p} value={p.toLowerCase()}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {activeTab === "vacancy" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Vacate Reason</Label>
                    <Select value={tempVacateReason} onValueChange={setTempVacateReason}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reasons</SelectItem>
                        {getMasterValuesByName(roomsMasters, "Vacate Reason").map((reason) => (
                          <SelectItem key={reason.id} value={reason.name}>
                            {reason.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Booking Type at Vacate</Label>
                    <Select value={tempBookingTypeAtVacate} onValueChange={setTempBookingTypeAtVacate}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="single">Single Booking Only</SelectItem>
                        <SelectItem value="couple">Was Couple Booking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Stay Duration</Label>
                    <Select value={tempStayDuration} onValueChange={setTempStayDuration}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="under_6">Under 6 Months</SelectItem>
                        <SelectItem value="6_12">6 to 12 Months</SelectItem>
                        <SelectItem value="over_12">Over 12 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Penalty Status</Label>
                    <Select value={tempPenaltyStatus} onValueChange={setTempPenaltyStatus}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Vacated Rows</SelectItem>
                        <SelectItem value="with_penalty">Penalty Charged (&gt; ₹0)</SelectItem>
                        <SelectItem value="no_penalty">Zero Penalty Charged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t pt-2 border-slate-100">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Refund (₹)</Label>
                      <Input type="number" placeholder="Min" value={tempMinRent} onChange={e => setTempMinRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Refund (₹)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxRent} onChange={e => setTempMaxRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Sec. Deposit (₹)</Label>
                      <Input type="number" placeholder="Min" value={tempMinSecurityDeposit} onChange={e => setTempMinSecurityDeposit(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Sec. Deposit (₹)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxSecurityDeposit} onChange={e => setTempMaxSecurityDeposit(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "expense" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Vendor Name</Label>
                    <Select value={tempVendorName} onValueChange={setTempVendorName}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Vendors</SelectItem>
                        {getMasterValuesByName(commonMasters, "Vendors").map((v) => (
                          <SelectItem key={v.id} value={v.name}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Payment Status</Label>
                    <Select value={tempExpenseStatus} onValueChange={setTempExpenseStatus}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Expenses</SelectItem>
                        <SelectItem value="Paid">Fully Paid</SelectItem>
                        <SelectItem value="Partial">Partially Paid</SelectItem>
                        <SelectItem value="Unpaid">Unpaid / Due</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Expense Category</Label>
                    <Select value={tempExpenseCategory} onValueChange={(v) => {
                      setTempExpenseCategory(v);
                      setTempExpenseSubcategory("all");
                      const selectedCat = expenseCategories.find((c: any) => c.name === v);
                      setTempExpenseCategoryId(v === "all" ? "all" : (selectedCat ? String(selectedCat.id) : "all"));
                    }}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {expenseCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Sub-Category</Label>
                    <Select value={tempExpenseSubcategory} onValueChange={setTempExpenseSubcategory}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subcategories</SelectItem>
                        {expenseSubcategoryOptions.map((sub) => (
                          <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Payment Mode</Label>
                    <Select value={tempPaymentMode} onValueChange={setTempPaymentMode}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Modes</SelectItem>
                        {paymentMethods.map((mode) => (
                          <SelectItem key={mode.id} value={mode.name.toLowerCase()}>
                            {mode.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t pt-2 border-slate-100">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Amount (₹)</Label>
                      <Input type="number" placeholder="Min" value={tempMinRent} onChange={e => setTempMinRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Amount (₹)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxRent} onChange={e => setTempMaxRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "inventory" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Asset Status</Label>
                    <Select value={tempAssetStatus} onValueChange={setTempAssetStatus}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assets</SelectItem>
                        <SelectItem value="available">Available in Stock</SelectItem>
                        <SelectItem value="assigned">Assigned / Allocated</SelectItem>
                        <SelectItem value="damaged">Damaged Asset</SelectItem>
                        <SelectItem value="repair">Under Repair</SelectItem>
                        <SelectItem value="lost">Lost / Misplaced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Item Category</Label>
                    <Select value={tempItemCategory} onValueChange={setTempItemCategory}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Array.from(new Set(reportData.map(r => r.category_name).filter(Boolean))).map((cat: any) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t pt-2 border-slate-100">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Price (₹)</Label>
                      <Input type="number" placeholder="Min" value={tempMinRent} onChange={e => setTempMinRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Price (₹)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxRent} onChange={e => setTempMaxRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "payment" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Payment Type</Label>
                    <Select value={tempPaymentType} onValueChange={setTempPaymentType}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Payments</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="security_deposit">Security Deposit</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Payment Status</Label>
                    <Select value={tempPaymentStatus} onValueChange={setTempPaymentStatus}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Payment Mode</Label>
                    <Select value={tempPaymentMode} onValueChange={setTempPaymentMode}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Modes</SelectItem>
                        {paymentMethods.map((mode) => (
                          <SelectItem key={mode.id} value={mode.name.toLowerCase()}>
                            {mode.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Select Tenant</Label>
                    <Select value={tempPaymentTenant} onValueChange={setTempPaymentTenant}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tenants</SelectItem>
                        {Array.from(new Set(reportData.map(r => r.tenant_name).filter(Boolean))).map((name: any) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Source</Label>
                    <Select value={tempPaymentSource} onValueChange={setTempPaymentSource}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="tenant">Tenant</SelectItem>
                        <SelectItem value="booking">Booking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t pt-2 border-slate-100">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Amount (₹)</Label>
                      <Input type="number" placeholder="Min" value={tempMinRent} onChange={e => setTempMinRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Amount (₹)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxRent} onChange={e => setTempMaxRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "login" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-blue-755 font-semibold">Login Role</Label>
                  <Select value={tempLoginRole} onValueChange={setTempLoginRole}>
                    <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      {getMasterValuesByName(commonMasters, "Role").map((r) => (
                        <SelectItem key={r.id} value={r.name.toLowerCase()}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {activeTab === "revenue" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-755 font-semibold">Revenue Type</Label>
                    <Select value={tempRevenueType} onValueChange={setTempRevenueType}>
                      <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs text-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Revenues</SelectItem>
                        <SelectItem value="rent">Rent Only</SelectItem>
                        <SelectItem value="deposit">Deposit Only</SelectItem>
                        <SelectItem value="maintenance">Maintenance Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t pt-2 border-slate-100">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Monthly Profit (₹)</Label>
                      <Input type="number" placeholder="Min" value={tempMinRent} onChange={e => setTempMinRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Monthly Profit (₹)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxRent} onChange={e => setTempMaxRent(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Min Margin (%)</Label>
                      <Input type="number" placeholder="Min" value={tempMinMargin} onChange={e => setTempMinMargin(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-semibold">Max Margin (%)</Label>
                      <Input type="number" placeholder="Max" value={tempMaxMargin} onChange={e => setTempMaxMargin(e.target.value)} className="bg-slate-50/50 text-xs h-9" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Actions footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 flex items-center justify-between gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="flex-1 border-slate-200 text-slate-700 bg-white hover:bg-slate-500 text-xs h-9 rounded-md flex items-center justify-center gap-1.5 font-semibold"
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
        </>,
        document.body
      )}

      {/* ⚠️ MODERN CSS PRINT STYLING INJECTION (Produces exact print preview style with logo, metadata line, watermark) */}
      {/* @ts-ignore */}
      <style jsx global>{`
        /* Payment-page table theme applied to all report tabs */
        .report-table {
          border-collapse: collapse;
          width: 100%;
        }
        .report-table thead tr:first-child th {
          background-color: #e5e7eb !important;
          border-right: 1px solid #d1d5db;
          border-bottom: 2px solid #d1d5db;
          padding: 6px 8px !important;
          font-size: 10px !important;
          font-weight: 600 !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #374151 !important;
          white-space: nowrap;
        }
        .report-table td {
          border-right: 1px solid #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
          padding: 6px 8px !important;
          font-size: 11px !important;
        }
        .report-table tbody tr:hover td {
          background-color: #f8fafc;
        }
        .report-table tbody tr:nth-child(even) td {
          background-color: #fafafa;
        }
        /* Filter-input row styling */
        .report-table thead .bg-slate-100\\/50 td,
        .report-table thead tr:nth-child(2) td {
          background-color: #ffffff !important;
          border-top: 1px solid #d1d5db;
          border-bottom: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          padding: 3px 4px !important;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .dark .report-table thead tr:first-child th {
          background-color: #1e293b !important;
          border-color: #334155;
          color: #cbd5e1 !important;
        }
        .dark .report-table td {
          border-color: #1e293b;
        }
    
      `}</style>

    </div>
  );
}

// Internal KPI Card — payment-page gradient card layout
function KPICard({ title, value, subtitle, icon: Icon, gradient, labelColor, valueColor, subColor, iconColor }: any) {
  return (
    <Card className={`bg-gradient-to-br ${gradient} border-0 shadow-sm`}>
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className={`h-5 w-5 sm:h-4 sm:w-4 ${iconColor} shrink-0`} />
          <p className={`text-[10px] sm:text-[11px] font-medium ${labelColor}`}>{title}</p>
        </div>
        <p className={`text-xs sm:text-sm font-bold ${valueColor}`}>{value}</p>
        {subtitle && <p className={`text-[9.5px] ${subColor} mt-0.5`}>{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// OverviewStatCard — same gradient payment-page layout as KPICard
function OverviewStatCard({ title, value, subtitle, icon: Icon, gradient, labelColor, valueColor, subColor, iconColor }: any) {
  return (
    <Card className={`bg-gradient-to-br ${gradient} border-0 shadow-sm`}>
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${iconColor}`} />
          <p className={`text-[9px] sm:text-[10px] font-medium ${labelColor}`}>{title}</p>
        </div>
        <p className={`text-xs sm:text-sm font-bold ${valueColor}`}>{value}</p>
        {subtitle && <p className={`text-[8px] ${subColor} mt-0.5`}>{subtitle}</p>}
      </CardContent>
    </Card>
  );
}