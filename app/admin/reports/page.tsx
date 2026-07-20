// app/admin/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
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
  { id: "overview", label: "Overview", icon: TrendingUp },
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
  const [staffList, setStaffList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [expenseSubcategoryOptions, setExpenseSubcategoryOptions] = useState<any[]>([]);

  const [ignoreDate, setIgnoreDate] = useState(false);
  const [tempIgnoreDate, setTempIgnoreDate] = useState(false);

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
  const [chartTooltip, setChartTooltip] = useState<{ x: number; label: string; revenue: number; expenses: number; profit: number; rent?: number; deposit?: number; refund?: number } | null>(null);
  useEffect(() => { setMounted(true); }, []);

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

  // Dynamic KPI Card renderer (matching the pastel/border theme of other modules)
  const renderKPIs = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <KPICard title="Active Tenants" value={stats.activeTenants || 0} icon={Users} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Vacated Tenants" value={stats.vacatedTenants || 0} icon={DoorOpen} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
            <KPICard title="Couple Bookings" value={stats.coupleTenants || 0} icon={UserPlus} bgColor="bg-purple-50/50" textColor="text-purple-900" borderColor="border-purple-100" iconBg="bg-purple-100" iconColor="text-purple-600" />
            <KPICard title="New Check-ins" value={stats.newCheckIns || 0} icon={Calendar} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Total Beds" value={stats.totalBeds || 0} icon={Bed} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
            <KPICard title="Occupied Beds" value={stats.occupiedBeds || 0} icon={Home} bgColor="bg-amber-50/50" textColor="text-amber-900" borderColor="border-amber-100" iconBg="bg-amber-100" iconColor="text-amber-600" />
            <KPICard title="Rent Collected" value={stats.totalRentCollected || "₹0"} icon={IndianRupee} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Total Expenses" value={stats.totalExpenses || "₹0"} icon={Wallet} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
          </>
        );
      case "enquiry":
        return (
          <>
            <KPICard title="Total Enquiries" value={stats.totalEnquiries || 0} icon={FileText} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Converted to Tenants" value={stats.convertedEnquiries || 0} icon={Users} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Conversion Rate" value={stats.conversionRate || "0%"} icon={TrendingUp} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
            <KPICard title="Active / Pending" value={stats.pendingEnquiries || 0} icon={Clock} bgColor="bg-amber-50/50" textColor="text-amber-900" borderColor="border-amber-100" iconBg="bg-amber-100" iconColor="text-amber-600" />
          </>
        );
      case "tenant":
        return (
          <>
            <KPICard title="Total Registered Tenants" value={stats.totalTenants || 0} icon={Users} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="New Check-ins" value={stats.newTenants || 0} icon={UserPlus} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Vacated Tenants" value={stats.vacatedTenants || 0} icon={DoorOpen} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
            <KPICard title="Bed Occupancy Rate" value={stats.occupancyRate || "0%"} icon={Home} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
          </>
        );
      case "tenant_payment":
        return (
          <>
            <KPICard title="Total Tenants" value={stats.totalTenants || 0} icon={Users} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Expected Rent" value={stats.totalExpected || "₹0"} icon={IndianRupee} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
            <KPICard title="Rent Collected" value={stats.totalPaid || "₹0"} icon={TrendingUp} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Collection Rate" value={stats.collectionRate || "0%"} icon={Wallet} bgColor="bg-amber-50/50" textColor="text-amber-900" borderColor="border-amber-100" iconBg="bg-amber-100" iconColor="text-amber-600" />
          </>
        );
      case "property":
        return (
          <>
            <KPICard title="Total Properties" value={stats.totalProperties || 0} icon={Building2} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Total Rooms" value={stats.totalRooms || 0} icon={Home} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
            <KPICard title="Total Beds" value={stats.totalBeds || 0} icon={Bed} bgColor="bg-amber-50/50" textColor="text-amber-900" borderColor="border-amber-100" iconBg="bg-amber-100" iconColor="text-amber-600" />
            <KPICard title="Average Bed Occupancy" value={stats.occupancyRate || "0%"} icon={TrendingUp} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
          </>
        );
      case "room":
        return (
          <>
            <KPICard title="Total Rooms" value={stats.totalRooms || 0} icon={Home} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Total Beds" value={stats.totalBeds || 0} icon={Bed} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
            <KPICard title="Occupied Beds" value={stats.occupiedBeds || 0} icon={Users} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Available Beds" value={stats.availableBeds || 0} icon={DoorOpen} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
          </>
        );
      case "visitor":
        return (
          <>
            <KPICard title="Total Visitors" value={stats.totalVisitors || 0} icon={UserPlus} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Visitors Today" value={stats.todayVisitors || 0} icon={Calendar} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Active Status" value={stats.pendingCheckOut || 0} icon={Clock} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
            <KPICard title="Blocked Visitors" value={stats.blockedVisitors || 0} icon={X} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
          </>
        );
      case "vacancy":
        return (
          <>
            <KPICard title="Vacated Accounts" value={stats.totalVacated || 0} icon={DoorOpen} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
            <KPICard title="Refundable Deposit Sum" value={stats.refundableAmount || "₹0"} icon={IndianRupee} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Penalties Charged" value={stats.collectedPenalties || "₹0"} icon={Wallet} bgColor="bg-amber-50/50" textColor="text-amber-900" borderColor="border-amber-100" iconBg="bg-amber-100" iconColor="text-amber-600" />
            <KPICard title="Deductions Settled" value={stats.totalVacated || 0} icon={FileText} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
          </>
        );
      case "expense":
        return (
          <>
            <KPICard title="Total Period Expenses" value={stats.totalExpenses || "₹0"} icon={Wallet} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
            <KPICard title="Total Paid Vouchers" value={stats.expenseCount || 0} icon={FileText} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Highest Category" value={stats.highestCategory || "N/A"} icon={Building2} bgColor="bg-amber-50/50" textColor="text-amber-900" borderColor="border-amber-100" iconBg="bg-amber-100" iconColor="text-amber-600" />
            <KPICard title="Tax Deductible Ratio" value="100.0%" icon={TrendingUp} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
          </>
        );
      case "communication":
        return (
          <>
            <KPICard title="Total Alerts Sent" value={stats.totalAlertsSent || 0} icon={Mail} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Email Dispatch" value={stats.emailsSent || 0} icon={Mail} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="SMS/WhatsApp" value={stats.smsSent || 0} icon={TrendingUp} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
            <KPICard title="Failed Dispatches" value={stats.failedCount || 0} icon={X} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
          </>
        );
      case "inventory":
        return (
          <>
            <KPICard title="Total Assets" value={stats.totalItems || 0} icon={Briefcase} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Available in Stock" value={stats.availableItems || 0} icon={Home} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Allocated to Rooms" value={stats.assignedItems || 0} icon={Users} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
            <KPICard title="Damaged / Repair" value={stats.damagedItems || 0} icon={X} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
          </>
        );
      case "payment":
        return (
          <>
            <KPICard title="Total Paid Revenue" value={stats.totalPaid || "₹0"} icon={IndianRupee} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Total Pending Accounts" value={stats.totalPending || "₹0"} icon={Clock} bgColor="bg-amber-50/50" textColor="text-amber-900" borderColor="border-amber-100" iconBg="bg-amber-100" iconColor="text-amber-600" />
            <KPICard title="Approved Invoices" value={stats.paidCount || 0} icon={FileText} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Defaulters / Pending" value={stats.pendingCount || 0} icon={Users} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
          </>
        );
      case "login":
        return (
          <>
            <KPICard title="Total Access Logins" value={stats.totalLogins || 0} icon={Clock} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Tenant Logins" value={stats.tenantLogins || 0} icon={Users} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Admin & Staff Logins" value={stats.staffLogins || 0} icon={TrendingUp} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Portal Access Level" value="Live Audited" icon={Home} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
          </>
        );
      case "revenue":
        return (
          <>
            <KPICard title="Net Revenues" value={stats.totalRevenue || "₹0"} icon={IndianRupee} bgColor="bg-emerald-50/50" textColor="text-emerald-900" borderColor="border-emerald-100" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <KPICard title="Net Expenses" value={stats.totalExpenses || "₹0"} icon={Wallet} bgColor="bg-rose-50/50" textColor="text-rose-900" borderColor="border-rose-100" iconBg="bg-rose-100" iconColor="text-rose-600" />
            <KPICard title="Net Operational Profit" value={stats.netRevenue || "₹0"} icon={TrendingUp} bgColor="bg-indigo-50/50" textColor="text-indigo-900" borderColor="border-indigo-100" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <KPICard title="Profit Margin %" value={stats.netMargin || "0%"} icon={Home} bgColor="bg-sky-50/50" textColor="text-sky-900" borderColor="border-sky-100" iconBg="bg-sky-100" iconColor="text-sky-600" />
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

  const buildReportPrintHTML = () => {
    const rows = buildExportRows(activeTab, processedData);
    const headers = rows.length ? Object.keys(rows[0]) : [];
    const tabLabel = TABS.find((t) => t.id === activeTab)?.label || "Report";
    const propertyLabel =
      propertyId === "all" ? "All Properties" : properties.find((p) => p.id.toString() === propertyId)?.name || propertyId;

    const kpiHtml = Object.entries(stats)
  .filter(([, val]) => typeof val !== "object" || val === null)
  .map(([key, val]) => `
  <div class="stat-box">
    <div class="stat-lbl">${key.replace(/([A-Z])/g, " $1")}</div>
    <div class="stat-val">${val}</div>
  </div>`)
  .join("");

    const bodyRows = rows.length
      ? rows.map((r) => `<tr>${headers.map((h) => `<td>${r[h as keyof typeof r] ?? "—"}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${headers.length || 1}" style="text-align:center;color:#9ca3af;padding:24px">No records found</td></tr>`;

    const monthlyHtml = activeTab === "overview" && (stats.monthlyBreakdown || []).length
      ? `<h3 style="font-size:12px;font-weight:800;color:#1e293b;margin:18px 0 8px">Revenue vs Expenses vs Profit — Monthly Breakdown</h3>
         <table>
           <thead><tr>
             <th>Month</th><th>Revenue (₹)</th><th>Expenses (₹)</th><th>Profit (₹)</th>
             <th>Rent (₹)</th><th>Deposit (₹)</th><th>Refund (₹)</th>
           </tr></thead>
           <tbody>
             ${stats.monthlyBreakdown.map((m: any) => `
               <tr>
                 <td>${m.month}</td>
                 <td>${Number(m.revenue || 0).toLocaleString("en-IN")}</td>
                 <td>${Number(m.expenses || 0).toLocaleString("en-IN")}</td>
                 <td>${Number(m.profit || 0).toLocaleString("en-IN")}</td>
                 <td>${Number(m.rent || 0).toLocaleString("en-IN")}</td>
                 <td>${Number(m.deposit || 0).toLocaleString("en-IN")}</td>
                 <td>${Number(m.refund || 0).toLocaleString("en-IN")}</td>
               </tr>`).join("")}
           </tbody>
         </table>`
      : "";

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
  ${monthlyHtml}
  <div class="footer">
    <span>Roomac Co-Living Management System</span>
    <span>${rows.length} record(s)</span>
  </div>
  </body></html>`;
  };

  const handlePrint = () => {
    const html = buildReportPrintHTML();
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
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe!.contentWindow?.focus();
      iframe!.contentWindow?.print();
    }, 300);
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
    <div className="flex flex-col bg-[#f8fafc] dark:bg-slate-950 p-4 md:p-2 gap-4 relative font-sans">

      {/* 📊 DYNAMIC STATS ROW — normal page flow, no forced scroll box */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-2.5 print:hidden">
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

      {/* 📈 OVERVIEW CHARTS — only on Overview, normal page flow (scrolls with the page, no internal scrollbox) */}
      {activeTab === "overview" && !loading && (
        <div className="space-y-3 print:hidden">
          <Card className="border-slate-200 divide-y divide-slate-100">
            {/* Compact secondary rows: Tenant mix + Room/bed snapshot, side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100  items-start">
             <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tenant Overview</p>
                  <span className="text-[9px] text-slate-400 font-semibold">FOR SELECTED PERIOD</span>
                </div>
               {(() => {
  const active = stats.activeTenants || 0;
  const vacated = stats.vacatedTenants || 0;
  const couple = stats.coupleTenants || 0;
  const single = stats.singleTenants || 0;
  const total = stats.totalTenants || 0;

  const segments = [
    { label: "Single", value: single, color: "#0ea5e9" },
    { label: "Couple", value: couple, color: "#a855f7" },
    { label: "Vacated", value: vacated, color: "#f43f5e" },
  ];
  const maxVal = Math.max(1, ...segments.map(s => s.value));

  return (
    <div className="flex flex-col justify-center h-full py-2">
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-4xl font-extrabold text-slate-800">{total}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tenants · {active} Active</span>
      </div>

      <div className="space-y-3.5">
        {segments.map((seg) => {
          const widthPct = (seg.value / maxVal) * 100;
          return (
            <div key={seg.label} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-[11px] font-bold text-slate-600">{seg.label}</span>
              <div className="flex-1 h-5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${Math.max(widthPct, 6)}%`, backgroundColor: seg.color }}
                >
                  {widthPct > 15 && <span className="text-[10px] font-bold text-white">{seg.value}</span>}
                </div>
              </div>
              {widthPct <= 15 && <span className="w-6 text-right text-[11px] font-bold text-slate-700">{seg.value}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
})()}
              </div>

             <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Room & Bed Occupancy</p>
                  <span className="text-[9px] text-slate-400 font-semibold">CURRENT SNAPSHOT</span>
                </div>
               {(() => {
  const totalRooms = stats.totalRooms || 0;
  const totalBeds = stats.totalBeds || 0;
  const occupied = stats.occupiedBeds || 0;
  const available = stats.availableBeds || 0;
  const vacatedBeds = stats.vacatedBeds || 0;
  const occupancyPct = totalBeds > 0 ? (occupied / totalBeds) * 100 : 0;

  const r = 80;
  const circumference = Math.PI * r;
  const dashOffset = circumference - (Math.min(100, occupancyPct) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center h-full py-1">
      <svg viewBox="0 0 200 115" width="220" height="127">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="100" y="88" textAnchor="middle" fontSize="30" fontWeight="800" fill="#1e293b">
          {Math.round(occupancyPct)}%
        </text>
        <text x="100" y="105" textAnchor="middle" fontSize="10" fontWeight="700" fill="#94a3b8" letterSpacing="0.5">
          OCCUPIED
        </text>
      </svg>

      <div className="grid grid-cols-3 gap-2 w-full mt-2">
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2 text-center">
          <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-amber-500" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Occupied</span>
          <p className="text-base font-extrabold text-slate-800 mt-0.5">{occupied}</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2 text-center">
          <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Available</span>
          <p className="text-base font-extrabold text-slate-800 mt-0.5">{available}</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2 text-center">
          <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-rose-500" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Vacated</span>
          <p className="text-base font-extrabold text-slate-800 mt-0.5">{vacatedBeds}</p>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 font-semibold mt-2">{totalRooms} rooms · {totalBeds} beds total</p>
    </div>
  );
})()}
              </div>
            </div>

            {/* Main bar chart: Revenue vs Expenses vs Profit — same card now */}
            <div className="p-5 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Revenue vs Expenses vs Profit</h3>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Expenses</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Profit</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 inline-block" /> Rent</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Deposit</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Refund</span>
              </div>
            </div>

            {(() => {
              const monthly = stats.monthlyBreakdown || [];
              if (!monthly.length) {
                return <div className="h-64 flex items-center justify-center text-sm text-slate-400">No financial data for this period.</div>;
              }

              const chartHeight = 260;
              const minChartWidth = 600;
              const chartWidth = Math.max(minChartWidth, monthly.length * 90);
              const isNarrow = monthly.length * 90 < minChartWidth;
              const maxVal = Math.max(1, ...monthly.map((m: any) => Math.max(m.revenue, m.expenses, Math.abs(m.profit), m.rent || 0, m.deposit || 0, m.refund || 0)));
              const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(maxVal * f));
              const groupWidth = chartWidth / monthly.length;
              const barWidth = Math.min(12, groupWidth / 8);

              const scaleY = (v: number) => chartHeight - (v / maxVal) * chartHeight;

              return (
                <div className={isNarrow ? "" : "overflow-x-auto"}>
                  <svg
                    viewBox={`0 0 ${chartWidth + 60} ${chartHeight + 50}`}
                    width={isNarrow ? "100%" : chartWidth + 60}
                    height={chartHeight + 50}
                    preserveAspectRatio="xMidYMid meet"
                    className="select-none"
                  >
                    {/* Y gridlines + labels */}
                    {yTicks.map((tick, i) => (
                      <g key={i}>
                        <line x1={50} x2={chartWidth + 50} y1={scaleY(tick) + 10} y2={scaleY(tick) + 10} stroke="#e2e8f0" strokeDasharray="3,3" />
                        <text x={44} y={scaleY(tick) + 14} textAnchor="end" fontSize="10" fill="#94a3b8">
                          ₹{tick >= 100000 ? `${(tick / 100000).toFixed(1)}L` : tick.toLocaleString("en-IN")}
                        </text>
                      </g>
                    ))}

                    {monthly.map((m: any, i: number) => {
                      const groupX = 55 + i * groupWidth;
                      const bars = [
                        { key: "revenue", value: m.revenue, color: "#10b981" },
                        { key: "expenses", value: m.expenses, color: "#f43f5e" },
                        { key: "profit", value: Math.max(0, m.profit), color: "#6366f1" },
                        { key: "rent", value: m.rent || 0, color: "#d946ef" },
                        { key: "deposit", value: m.deposit || 0, color: "#0ea5e9" },
                        { key: "refund", value: m.refund || 0, color: "#f59e0b" },
                      ];
                      return (
                        <g key={m.month_key}
                          onMouseEnter={() => setChartTooltip({ x: groupX, label: m.month, revenue: m.revenue, expenses: m.expenses, profit: m.profit, rent: m.rent || 0, deposit: m.deposit || 0, refund: m.refund || 0 } as any)}
                          onMouseLeave={() => setChartTooltip(null)}
                        >
                          <rect x={groupX - 5} y={10} width={groupWidth - 10} height={chartHeight} fill="transparent" />
                          {bars.map((b, bi) => (
                            <rect
                              key={b.key}
                              x={groupX + bi * (barWidth + 4)}
                              y={scaleY(b.value) + 10}
                              width={barWidth}
                              height={Math.max(0, chartHeight - scaleY(b.value))}
                              fill={b.color}
                              rx={2}
                            />
                          ))}
                          <text x={groupX + groupWidth / 2 - 10} y={chartHeight + 30} textAnchor="middle" fontSize="11" fontWeight="600" fill="#64748b">
                            {m.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {chartTooltip && (
                    <div
                      className="absolute bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs pointer-events-none z-10"
                      style={{ left: Math.min(chartTooltip.x + 60, chartWidth - 120), top: 20 }}
                    >
                      <div className="font-bold text-slate-800 mb-1">{chartTooltip.label}</div>
                      <div className="text-emerald-600 font-semibold">Revenue: ₹{chartTooltip.revenue.toLocaleString("en-IN")}</div>
                      <div className="text-rose-600 font-semibold">Expenses: ₹{chartTooltip.expenses.toLocaleString("en-IN")}</div>
                      <div className="text-indigo-600 font-semibold">Profit: ₹{chartTooltip.profit.toLocaleString("en-IN")}</div>
                      <div className="text-fuchsia-600 font-semibold">Rent: ₹{(chartTooltip.rent || 0).toLocaleString("en-IN")}</div>
                      <div className="text-sky-600 font-semibold">Deposit: ₹{(chartTooltip.deposit || 0).toLocaleString("en-IN")}</div>
                      <div className="text-amber-600 font-semibold">Refund: ₹{(chartTooltip.refund || 0).toLocaleString("en-IN")}</div>                    </div>
                  )}
                </div>
              );
            })()}

            {/* Totals row */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-5 pt-4 border-t border-slate-100 text-center">
              {(() => {
                const monthly = stats.monthlyBreakdown || [];
                const totalRevenue = monthly.reduce((s: number, m: any) => s + m.revenue, 0);
                const totalExpenses = monthly.reduce((s: number, m: any) => s + m.expenses, 0);
                const totalRent = monthly.reduce((s: number, m: any) => s + (m.rent || 0), 0);
                const totalDeposit = monthly.reduce((s: number, m: any) => s + (m.deposit || 0), 0);
                const totalRefund = monthly.reduce((s: number, m: any) => s + (m.refund || 0), 0);
                const totalProfit = totalRevenue - totalExpenses;
                return (
                  <>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Revenue</p>
                      <p className="text-lg font-extrabold text-emerald-600">₹{totalRevenue.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Expenses</p>
                      <p className="text-lg font-extrabold text-rose-600">₹{totalExpenses.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Profit</p>
                      <p className="text-lg font-extrabold text-indigo-600">₹{totalProfit.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Rent</p>
                      <p className="text-lg font-extrabold text-fuchsia-600">₹{totalRent.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Deposit</p>
                      <p className="text-lg font-extrabold text-sky-600">₹{totalDeposit.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Refund</p>
                      <p className="text-lg font-extrabold text-amber-600">₹{totalRefund.toLocaleString("en-IN")}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          </Card>
        </div>
      )}

      {/* 📋 REPORT DETAILS CONTAINER — fixed height + internal scroll, same for every tab (only this box scrolls internally, not the page) */}
<Card className="h-[65vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden print:shadow-none print:border-none">
        {/* Table toolbar with Export & Print buttons - Print Hidden */}
        <div className="shrink-0 p-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 print:hidden bg-slate-50/40">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Report Records: <span className="text-[#1e3b8b] dark:text-indigo-400 font-bold">{totalRecords} entries found</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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



        <div className="flex-1 overflow-auto">
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
                <thead className="sticky top-0 z-20 bg-[#f8fafc] dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
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

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedData.map((row: any, index: number) => {
                    const zebraBg = index % 2 === 1 ? "bg-slate-50/30 dark:bg-slate-900/10" : "";

                    return (
                      <tr key={index} className={`hover:bg-[#f1f5f9]/40 dark:hover:bg-slate-800/40 transition-colors ${zebraBg}`}>
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
          .scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;     /* Firefox */
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