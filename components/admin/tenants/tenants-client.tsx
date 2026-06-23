  // components/admin/tenants/tenants-client.tsx
  "use client";
  import { useCallback, useEffect, useMemo, useState, useRef } from "react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Badge } from "@/components/ui/badge";
  import {
    Plus,
    RefreshCw,
    Download,
    CheckCircle,
    XCircle,
    UserX,
    Trash2,
    Filter,
    SlidersHorizontal,
    MoreVertical,
    Eye,
    Edit,
    Key,
    Mail,
    Phone,
    Building,
    Bed,
    MapPin,
    Users,
    FileText,
    IndianRupee,
    CheckSquare,
    Square,
    Search,
    X,
    Briefcase,
    Building2,
    Globe,
    LogIn,
    ShieldCheck,
    Users2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Upload,
    AlertTriangle,
    Calendar,
    Clock,
    User,
    Shield,
    Share2,
  } from "lucide-react";
  import { toast } from "sonner";
  import {
    deleteTenant,
    bulkDeleteTenants,
    bulkUpdateTenantStatus,
    bulkUpdateTenantPortalAccess,
    updateTenantSimple,
    createCredential,
    resetCredential,
    exportTenantsToExcel,
    listTenants,
    type Tenant,
    type TenantFilters,
    softDeleteTenant,
    restoreTenant,
    getTenant,
    processVacatedTenantPayment,
    processVacatedTenantRefund,
  } from "@/lib/tenantApi";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { Separator } from "@/components/ui/separator";
  import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { DataTable } from "@/components/admin/data-table";
  import type {
    Column,
    FilterConfig,
    BulkAction,
    ActionButton,
  } from "@/components/admin/data-table";
  import { TenantForm } from "@/components/admin/tenants/tenant-form";
  import TenantImportModal from "./tenant-import-modal";
  import Swal from "sweetalert2";
  import Link from "next/link";
  import * as XLSX from "xlsx";
  import { useAuth } from "@/context/authContext";
  import { VacatedTenantPaymentModal } from "./VacatedTenantPaymentModal";
import { FaMale, FaFemale } from "react-icons/fa";


  // Helper to capitalize first letter of each word in a name
  const capitalizeWords = (str: string | undefined | null): string => {
    if (!str) return '';
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };
  interface TenantsClientProps {
    initialData: Tenant[];
    initialLoading: boolean;
    initialFilters: any;
  }

  // Pagination constants
  const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, "All"] as const;

  export default function TenantsClient({
    initialData = [],
    initialLoading = false,
  }: TenantsClientProps) {
    const [tenants, setTenants] = useState(initialData);
    const [loading, setLoading] = useState(initialLoading);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false);
    const [credentialPassword, setCredentialPassword] = useState("");
    const [credentialLoading, setCredentialLoading] = useState(false);
    const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
    const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

    const [shareModalTenant, setShareModalTenant] = useState<Tenant | null>(null);
const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    // 1. Change the initial state to read from sessionStorage:
    const [activeTab, setActiveTab] = useState<"all" | "vacated" | "deleted">(
      () => {
        if (typeof window !== "undefined") {
          return (
            (sessionStorage.getItem("tenants_active_tab") as
              | "all"
              | "vacated"
              | "deleted") || "all"
          );
        }
        return "all";
      },
    );
    const [forceUpdate, setForceUpdate] = useState(0);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const isLoadingRef = useRef(false);
    const filtersRef = useRef<TenantFilters>({
      vacate_status: "non_vacated",
      include_deleted: false,
    });

    const [showImportModal, setShowImportModal] = useState(false);
    const [importing, setImporting] = useState(false);
    const { can } = useAuth();

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedVacatedTenant, setSelectedVacatedTenant] =
      useState<Tenant | null>(null);
    const [paymentModalType, setPaymentModalType] = useState<
      "refund" | "payment"
    >("refund");
    const [paymentModalAmount, setPaymentModalAmount] = useState(0);

    // const [filters, setFiltersState] = useState<TenantFilters>({});
  const [filters, setFiltersState] = useState<TenantFilters>({
      vacate_status: "non_vacated",
    });

    // Sidebar pending state — only applied when user clicks "Apply Filters"
    const [pendingFilters, setPendingFilters] = useState<TenantFilters>({
      vacate_status: "non_vacated",
    });

  const [coupleFilter, setCoupleFilter] = useState(false);
  const [pendingCoupleFilter, setPendingCoupleFilter] = useState(false);


  // ─── Date & Refund filters (actual applied) ───
const [checkInDateFrom, setCheckInDateFrom] = useState("");
const [checkInDateTo, setCheckInDateTo] = useState("");
const [vacatedDateFrom, setVacatedDateFrom] = useState("");
const [vacatedDateTo, setVacatedDateTo] = useState("");
const [refundStatus, setRefundStatus] = useState(""); // "pending" | "settled" | "no_refund" | ""

// ─── Pending versions (for sidebar) ───
const [pendingCheckInDateFrom, setPendingCheckInDateFrom] = useState("");
const [pendingCheckInDateTo, setPendingCheckInDateTo] = useState("");
const [pendingVacatedDateFrom, setPendingVacatedDateFrom] = useState("");
const [pendingVacatedDateTo, setPendingVacatedDateTo] = useState("");
const [pendingRefundStatus, setPendingRefundStatus] = useState("");
    const [pendingDeposit, setPendingDeposit] = useState(false);
    const [pendingPendingDeposit, setPendingPendingDeposit] = useState(false);
  const [pendingRent, setPendingRent] = useState(false);
  const [pendingPendingRent, setPendingPendingRent] = useState(false);
    // Column search for the header
  const [columnSearch, setColumnSearch] = useState({
    name: "",
    contact: "",
    occupation: "",
    property: "",
    payments: "",
    status: "",
    location: "",
    checkInDate: "",
    monthlyRent: "",
    securityDeposit: "",
    vacatedDate: "",
  });

    // Toggle selection
    const toggleSelection = useCallback((tenantId: string) => {
      setSelectedTenantIds((prev) => {
        if (prev.includes(tenantId)) {
          return prev.filter((id) => id !== tenantId);
        } else {
          return [...prev, tenantId];
        }
      });
    }, []);

    const toggleSelectAll = useCallback(() => {
      if (selectedTenantIds.length === tenants.length && tenants.length > 0) {
        setSelectedTenantIds([]);
      } else {
        const allIds = tenants.map((tenant) => String(tenant.id));
        setSelectedTenantIds(allIds);
      }
    }, [tenants, selectedTenantIds]);

    // In tenants-client.tsx, inside the loadTenants function
    const loadTenants = useCallback(async (customFilters?: TenantFilters) => {
      if (isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;
      setLoading(true);

      try {
        const useFilters = customFilters || filtersRef.current;
        const res = await listTenants({ ...useFilters, pageSize: 1000 });

      if (res?.success && Array.isArray(res.data)) {
    const normalizedData = res.data.map((tenant: any) => ({
      ...tenant,
      is_active: tenant.is_active == 1 || tenant.is_active === true,
      portal_access_enabled: tenant.portal_access_enabled == 1 || tenant.portal_access_enabled === true,
      has_credentials: tenant.has_credentials == 1 || tenant.has_credentials === true,
      has_vacated: tenant.has_vacated == 1 || tenant.has_vacated === true,
      is_couple_booking: tenant.is_couple_booking == 1 || tenant.is_couple_booking === true,
    is_primary_tenant: tenant.is_primary_tenant == 1 || tenant.is_primary_tenant === true,

    }));
    setTenants(normalizedData);
    setCurrentPage(1);
  } else {
          toast.error(res?.message || "Failed to load tenants");
          setTenants([]);
        }
      } catch (err) {
        console.error("loadTenants error", err);
        toast.error("Failed to load tenants");
        setTenants([]);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    }, []);

    // Add this useEffect to trigger re-render when activeTab changes
  // Trigger re-render when activeTab changes
    useEffect(() => {
      setForceUpdate((prev) => prev + 1);
    }, [activeTab]);

    // Sync pending filters from applied filters when sidebar opens
    useEffect(() => {
      if (isFilterSidebarOpen) {
        setPendingFilters({ ...filters });
        setPendingCoupleFilter(coupleFilter);
        setPendingPendingDeposit(pendingDeposit);
        setPendingPendingRent(pendingRent);
        setPendingCheckInDateFrom(checkInDateFrom);
    setPendingCheckInDateTo(checkInDateTo);
    setPendingVacatedDateFrom(vacatedDateFrom);
    setPendingVacatedDateTo(vacatedDateTo);
    setPendingRefundStatus(refundStatus);
      }
    }, [isFilterSidebarOpen]);

    // Handle column search
    const handleColumnSearch = useCallback(() => {
      const newFilters: TenantFilters = {
        // preserve current vacate_status AND include_deleted
        vacate_status: filtersRef.current.vacate_status || "non_vacated",
        include_deleted: filtersRef.current.include_deleted, // ✅ PRESERVE include_deleted
      };

     if (columnSearch.name) {
        newFilters.search = columnSearch.name;
      } else if (columnSearch.contact) {
        newFilters.search = columnSearch.contact;
      }
      if (columnSearch.occupation) {
        newFilters.occupation_category = columnSearch.occupation;
      }
      if (columnSearch.status) {
        const s = columnSearch.status.toLowerCase();
        if (s === "active" || s === "inactive") {
          newFilters.is_active = s === "active" ? "true" : "false";
        } else if (s === "portal" || s === "portal access") {
          newFilters.portal_access_enabled = "true";
        } else if (s === "no portal") {
          newFilters.portal_access_enabled = "false";
        } else if (s === "login" || s === "login enabled") {
          newFilters.has_credentials = "true";
        } else if (s === "no login") {
          newFilters.has_credentials = "false";
        }
      }

      
      filtersRef.current = newFilters;
      setFiltersState(newFilters);
      loadTenants(newFilters);
    }, [columnSearch, loadTenants]);

    // Add import handler
    const handleImportClick = useCallback(() => {
      setShowImportModal(true);
    }, []);

    // Enhanced import file handler
  const handleImportFile = async (formData: FormData) => {
    setImporting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/tenants/import`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const { summary } = result.data || {};

        // ── Primary success toast ──────────────────────────────────────────
        if (summary?.imported > 0) {
          toast.success(
            `Successfully imported ${summary.imported} tenant${summary.imported !== 1 ? "s" : ""}`,
          );
        } else {
          // toast.error("Import failed.");
        }

        // ── Couple rows skipped ────────────────────────────────────────────
        if (summary?.skipped_couples > 0) {
          toast.warning(
            `${summary.skipped_couples} couple/partner row${
              summary.skipped_couples !== 1 ? "s" : ""
            } skipped — create couple tenants manually via Add Tenant.`,
            { duration: 6000 },
          );
        }

        // ── Rows with errors ───────────────────────────────────────────────
        const importErrors = result.data?.errors || [];
        const duplicateErrors = importErrors.filter((e: any) =>
          e.error && e.error.includes("Duplicate entry")
        );
        const otherErrors = importErrors.filter((e: any) =>
          e.error && !e.error.includes("Duplicate entry")
        );

        if (duplicateErrors.length > 0) {
          toast.warning(
            `${duplicateErrors.length} duplicate row${duplicateErrors.length !== 1 ? "s" : ""} skipped — already exist.`,
            { duration: 5000 }
          );
        }

        if (otherErrors.length > 0) {
          const detail = otherErrors
            .slice(0, 3)
            .map((e: any) => `Row ${e.row}: ${e.error}`)
            .join(" | ");
          toast.error(
            detail || `${otherErrors.length} row${otherErrors.length !== 1 ? "s" : ""} had errors`,
            { duration: 7000 },
          );
        }

        if (importErrors.length > 0) {
          console.warn("Import row errors:", importErrors);
        }

        setShowImportModal(false);
        await loadTenants();
      } else {
        throw new Error(result.message || "Import failed");
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import tenants");
    } finally {
      setImporting(false);
    }
  };

    // Handle column search change with debounce
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        handleColumnSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    }, [columnSearch, handleColumnSearch]);

    // Handle filter change
    const handleFilterChange = useCallback(
      (newFilters: TenantFilters) => {
        // Merge with existing to preserve include_deleted if not provided
        const mergedFilters = {
          ...filtersRef.current,
          ...newFilters,
        };
        filtersRef.current = mergedFilters;
        setFiltersState(mergedFilters);
        loadTenants(mergedFilters);
      },
      [loadTenants],
    );

    // 2. Update handleTabChange to save to sessionStorage:
    const handleTabChange = useCallback(
      (tab: "all" | "vacated" | "deleted") => {
        setActiveTab(tab);
        sessionStorage.setItem("tenants_active_tab", tab); // ← ADD THIS
        setColumnSearch({
          name: "",
          contact: "",
          occupation: "",
          property: "",
          payments: "",
          status: "",
          location: "",
          checkInDate: "",
          monthlyRent: "",
          securityDeposit: "",
          vacatedDate: "",
        });

        let filters;
        if (tab === "all") {
          filters = {
            vacate_status: "non_vacated",
            include_deleted: false,
            pageSize: 1000,
          };
        } else if (tab === "vacated") {
          filters = {
            vacate_status: "vacated",
            include_deleted: false,
            pageSize: 1000,
          };
        } else {
          filters = {
            vacate_status: "vacated",
            include_deleted: true,
            pageSize: 1000,
          };
        }

        handleFilterChange(filters);
      },
      [handleFilterChange],
    );

    const handleClearAll = useCallback(() => {
      setActiveTab("all");
      sessionStorage.setItem("tenants_active_tab", "all"); // ← ADD THIS
      setColumnSearch({
        name: "",
        contact: "",
        occupation: "",
        property: "",
        payments: "",
        status: "",
      });
      handleFilterChange({ vacate_status: "non_vacated" });
    }, [handleFilterChange]);

    // 3. On initial mount, load data for the restored tab:
    useEffect(() => {
      const savedTab =
        (sessionStorage.getItem("tenants_active_tab") as
          | "all"
          | "vacated"
          | "deleted") || "all";

      let initialFilters;
      if (savedTab === "all") {
        initialFilters = {
          vacate_status: "non_vacated",
          include_deleted: false,
          pageSize: 1000,
        };
      } else if (savedTab === "vacated") {
        initialFilters = {
          vacate_status: "vacated",
          include_deleted: false,
          pageSize: 1000,
        };
      } else {
        initialFilters = {
          vacate_status: "vacated",
          include_deleted: true,
          pageSize: 1000,
        };
      }

      filtersRef.current = initialFilters;
      setFiltersState(initialFilters);
      loadTenants(initialFilters);
    }, []); // ← runs once on mount

    // Clear all filters (but keep the current tab's vacate_status)
    const clearAllFilters = useCallback(() => {
      const emptyFilters = {
        search: "",
        is_active: "",
        portal_access_enabled: "",
        has_credentials: "",
        gender: "",
        occupation_category: "",
        city: "",
        state: "",
        preferred_sharing: "",
        // PRESERVE the current tab's vacate_status
        vacate_status: activeTab === "vacated" ? "vacated" : "non_vacated",
      };
      filtersRef.current = emptyFilters;
      setFiltersState(emptyFilters);
      setColumnSearch({
        name: "",
        contact: "",
        occupation: "",
        property: "",
        payments: "",
        status: "",
      });
      loadTenants(emptyFilters);
    }, [loadTenants, activeTab]);

const clearSidebarFilters = useCallback(() => {
    const emptyFilters = {
      search: filters.search || "",
      is_active: "",
      portal_access_enabled: "",
      has_credentials: "",
      gender: "",
      occupation_category: "",
      city: "",
      state: "",
      preferred_sharing: "",
      vacate_status: activeTab === "vacated" ? "vacated" : "non_vacated",
    };
    filtersRef.current = emptyFilters;
    setFiltersState(emptyFilters);
    setPendingFilters(emptyFilters);
    setPendingDeposit(false);
    setPendingPendingDeposit(false);
    setPendingRent(false);
    setPendingPendingRent(false);
    setCoupleFilter(false);
    setPendingCoupleFilter(false);
    // Reset date & refund applied state
    setCheckInDateFrom("");
    setCheckInDateTo("");
    setVacatedDateFrom("");
    setVacatedDateTo("");
    setRefundStatus("");
    // Reset pending date state too
    setPendingCheckInDateFrom("");
    setPendingCheckInDateTo("");
    setPendingVacatedDateFrom("");
    setPendingVacatedDateTo("");
    setPendingRefundStatus("");
    loadTenants(emptyFilters);
    setIsFilterSidebarOpen(false);
  }, [filters.search, loadTenants, activeTab]);

    // Handle delete
    const handleDelete = useCallback(
      async (tenant: Tenant) => {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: `You are about to delete "${tenant.full_name}"`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "Cancel",
          background: "#fff",
          backdrop: `rgba(0,0,0,0.4)`,
          customClass: {
            title: "text-lg font-bold",
            popup: "rounded-xl",
            confirmButton:
              "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg",
            cancelButton:
              "bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg",
          },
        });

        if (result.isConfirmed) {
          try {
            const res = await softDeleteTenant(tenant.id as any);

            if (!res?.success) {
              toast.error(res?.message || "Failed to delete tenant");
              return;
            }

            await Swal.fire({
              title: "Deleted!",
              text: "Tenant has been deleted successfully.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              background: "#fff",
              customClass: {
                popup: "rounded-xl",
                title: "text-lg font-bold text-green-600",
              },
            });

            loadTenants();
          } catch (err: any) {
            console.error("Tenant delete error:", err);
            toast.error(err?.response?.message || "Failed to delete tenant");
          }
        }
      },
      [loadTenants],
    );

    // Bulk delete
    const handleBulkDelete = useCallback(
      async (selectedIds: string[]) => {
        if (selectedIds.length === 0) {
          toast.error("No tenants selected");
          return;
        }

        const result = await Swal.fire({
          title: "Are you sure?",
          text: `You are about to delete ${selectedIds.length} tenants`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete them!",
          cancelButtonText: "Cancel",
          background: "#fff",
          backdrop: `rgba(0,0,0,0.4)`,
          customClass: {
            title: "text-lg font-bold",
            popup: "rounded-xl",
            confirmButton:
              "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg",
            cancelButton:
              "bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg",
          },
        });

        if (result.isConfirmed) {
          try {
            const res = await bulkDeleteTenants(selectedIds);

            if (!res?.success) {
              toast.error(res?.message || "Failed to delete tenants");
              return;
            }

            await Swal.fire({
              title: "Deleted!",
              text: `${selectedIds.length} tenants deleted successfully.`,
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              background: "#fff",
              customClass: {
                popup: "rounded-xl",
                title: "text-lg font-bold text-green-600",
              },
            });

            setSelectedTenantIds([]);
            loadTenants();
          } catch (err: any) {
            console.error("Bulk delete error:", err);
            toast.error(err?.response?.message || "Failed to delete tenants");
          }
        }
      },
      [loadTenants],
    );

    // Bulk status change
    const handleBulkStatusChange = useCallback(
      async (selectedIds: string[], status: boolean = true) => {
        if (selectedIds.length === 0) return;
        try {
          const res = await bulkUpdateTenantStatus(selectedIds, status);
          if (res?.success) {
            toast.success(
              `${selectedIds.length} tenants ${status ? "activated" : "deactivated"}`,
            );
            setSelectedTenantIds([]);
            loadTenants();
          } else {
            toast.error(res?.message || "Failed to update status");
          }
        } catch {
          toast.error("Failed to update status");
        }
      },
      [loadTenants],
    );

    // Bulk portal access
    const handleBulkPortalAccess = useCallback(
      async (selectedIds: string[], enabled: boolean) => {
        if (selectedIds.length === 0) return;
        try {
          const res = await bulkUpdateTenantPortalAccess(selectedIds, enabled);
          if (res?.success) {
            toast.success(
              `${selectedIds.length} tenants portal access ${enabled ? "enabled" : "disabled"}`,
            );
            setSelectedTenantIds([]);
            loadTenants();
          } else {
            toast.error(res?.message || "Failed to update portal access");
          }
        } catch {
          toast.error("Failed to update portal access");
        }
      },
      [loadTenants],
    );

    // Toggle portal access for single tenant
    const handleTogglePortalAccess = useCallback(
      async (tenant: Tenant) => {
        try {
          const res = await updateTenantSimple(tenant.id as any, {
            portal_access_enabled: !tenant.portal_access_enabled,
          });
          if (res?.success) {
            toast.success(
              `Portal access ${!tenant.portal_access_enabled ? "enabled" : "disabled"}`,
            );
            loadTenants();
          } else {
            toast.error(res?.message || "Failed to update portal access");
          }
        } catch {
          toast.error("Failed to update portal access");
        }
      },
      [loadTenants],
    );

   const handleSuccess = useCallback(
  async (updatedData?: Tenant) => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsViewDialogOpen(false);
    setSelectedTenant(null);
    await loadTenants();
  },
  [loadTenants],
);

    // Add this useEffect for event listener (already there, but update it)
    useEffect(() => {
      const handleTenantUpdate = (event: CustomEvent) => {
        const { tenant, partner } = event.detail;

        setTenants((prevTenants) =>
          prevTenants.map((t) => {
            if (t.id === tenant.id) {
              return { ...t, ...tenant };
            }
            if (partner && t.id === partner.id) {
              return { ...t, ...partner };
            }
            return t;
          }),
        );

        if (selectedTenant) {
          if (selectedTenant.id === tenant.id) {
            setSelectedTenant({ ...selectedTenant, ...tenant });
          } else if (partner && selectedTenant.id === partner.id) {
            setSelectedTenant({ ...selectedTenant, ...partner });
          }
        }

        toast.success("Partner details updated!");
      };

      window.addEventListener(
        "tenantUpdated",
        handleTenantUpdate as EventListener,
      );

      return () => {
        window.removeEventListener(
          "tenantUpdated",
          handleTenantUpdate as EventListener,
        );
      };
    }, [selectedTenant]);

    // Export to Excel - Exports based on current tab
    const handleExportToExcel = useCallback(async () => {
      try {
        let exportData = [];

        // Show loading toast
        // toast.loading(`Exporting ${activeTab} tenants...`, {
        //   id: "export-loading",
        // });

        // Fetch data based on active tab
        if (activeTab === "vacated") {
          const response = await listTenants({
            vacate_status: "vacated",
            pageSize: 1000,
          });
          toast.dismiss("export-loading");

          if (response?.success && Array.isArray(response.data)) {
            exportData = response.data;
          } else {
            toast.error("Failed to fetch vacated tenants");
            return;
          }
        } else if (activeTab === "deleted") {
          // For deleted tab - fetch soft-deleted, vacated tenants
          const response = await listTenants({
            include_deleted: true,
            vacate_status: "vacated",
            pageSize: 1000,
          });

          toast.dismiss("export-loading");

          if (response?.success && Array.isArray(response.data)) {
            exportData = response.data;
            toast.success(`Found ${exportData.length} deleted tenants to export`);
          } else {
            toast.error("Failed to fetch deleted tenants");
            return;
          }
        } else {
          // All Tenants tab - use current tenants state
          exportData = tenants;
          toast.dismiss("export-loading");
          // toast.success(`Exporting ${exportData.length} tenants`);
        }

        if (exportData.length === 0) {
          toast.warning("No data to export");
          return;
        }

        // Prepare Excel data based on tab type
        const excelData = exportData.map((tenant) => {
          const baseData = {
            ID: tenant.id,
            Salutation: tenant.salutation || "",
            "Full Name": tenant.full_name,
            Email: tenant.email,
            Phone: `${tenant.country_code || ""} ${tenant.phone || ""}`.trim(),
            Gender: tenant.gender || "",
            "Date of Birth": tenant.date_of_birth || "",
            "Occupation Category": tenant.occupation_category || "",
            "Exact Occupation": tenant.exact_occupation || "",
            Organization: tenant.organization || "",
            Address: tenant.address || "",
            City: tenant.city || "",
            State: tenant.state || "",
            Pincode: tenant.pincode || "",
            "Emergency Contact": tenant.emergency_contact_name || "",
            "Emergency Phone": tenant.emergency_contact_phone || "",
            "Check-in Date": tenant.check_in_date || "",
            "Portal Access": tenant.portal_access_enabled ? "Yes" : "No",
            Status: tenant.is_active ? "Active" : "Inactive",
            "Has Login": tenant.has_credentials ? "Yes" : "No",
            Property: tenant.property_name || "",
            "Room Assignment": tenant.current_assignment
              ? `Room ${tenant.current_assignment.room_number}, Bed ${tenant.current_assignment.bed_number}`
              : "Not assigned",
          };

          // Add vacate information for vacated/deleted tabs
          if (activeTab === "vacated" || activeTab === "deleted") {
            return {
              ...baseData,
              "Vacated Date":
                tenant.vacate_records?.[0]?.requested_vacate_date || "",
              "Vacate Reason":
                tenant.vacate_records?.[0]?.vacate_reason_value || "",
              "Refund Amount": tenant.vacate_records?.[0]?.refundable_amount || 0,
              "Penalty Amount":
                tenant.vacate_records?.[0]?.total_penalty_amount || 0,
              "Security Deposit":
                tenant.vacate_records?.[0]?.security_deposit_amount || 0,
            };
          }

          return baseData;
        });

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Auto-size columns
        const colWidths = [];
        const headers = Object.keys(excelData[0] || {});
        headers.forEach((header) => {
          const maxLength = Math.max(
            header.length,
            ...excelData.map((row) => String(row[header] || "").length),
          );
          colWidths.push({ wch: Math.min(maxLength + 2, 50) });
        });
        ws["!cols"] = colWidths;

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Add sheet name based on active tab
        const sheetName =
          activeTab === "vacated"
            ? "Vacated Tenants"
            : activeTab === "deleted"
              ? "Deleted Vacated Tenants"
              : "All Tenants";
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // Add summary sheet
        const summaryData = [
          {
            Metric: "Total Tenants",
            Value: excelData.length,
          },
          {
            Metric: "Export Date",
            Value: new Date().toLocaleString(),
          },
          {
            Metric: "Export Type",
            Value: sheetName,
          },
        ];

        // Add tab-specific summary
        if (activeTab === "vacated" || activeTab === "deleted") {
          const totalRefund = excelData.reduce(
            (sum, t) => sum + (t["Refund Amount"] || 0),
            0,
          );
          const totalPenalty = excelData.reduce(
            (sum, t) => sum + (t["Penalty Amount"] || 0),
            0,
          );
          summaryData.push(
            {
              Metric: "Total Refund Amount",
              Value: `₹${totalRefund.toLocaleString()}`,
            },
            {
              Metric: "Total Penalty Amount",
              Value: `₹${totalPenalty.toLocaleString()}`,
            },
          );
        }

        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

        // Generate Excel file
        const fileName = `tenants_${activeTab}_${new Date().toISOString().split("T")[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        toast.success(`Exported ${excelData.length} ${sheetName} successfully!`);
      } catch (error: any) {
        console.error("Export error:", error);
        toast.dismiss("export-loading");
        toast.error(error.message || "Failed to export tenants");
      }
    }, [tenants, activeTab]);

    // Handle credential creation/reset
    const handleCredentialSubmit = useCallback(async () => {
      if (!selectedTenant || !credentialPassword) {
        toast.error("Please enter a password");
        return;
      }
      if (credentialPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      setCredentialLoading(true);
      try {
        let res;
        if (selectedTenant.has_credentials) {
          res = await resetCredential(
            selectedTenant.id as any,
            credentialPassword,
          );
        } else {
          res = await createCredential(
            selectedTenant.id as any,
            selectedTenant.email,
            credentialPassword,
          );
        }
        if (res?.success) {
          toast.success(
            selectedTenant.has_credentials
              ? "Password reset successfully"
              : "Login credentials created",
          );
          setIsCredentialDialogOpen(false);
          setCredentialPassword("");
          setSelectedTenant(null);
          loadTenants();
        } else {
          toast.error(res?.message || "Failed to process credentials");
        }
      } catch {
        toast.error("Failed to process credentials");
      } finally {
        setCredentialLoading(false);
      }
    }, [selectedTenant, credentialPassword, loadTenants]);

    // Update the activeFiltersCount calculation to EXCLUDE vacate_status
    const activeFiltersCount = useMemo(() => {
  const filterEntries = Object.entries(filters).filter(([key, value]) => {
    if (key === "vacate_status") return false;
    if (key === "search") return false;
    if (key === "include_deleted") return false;
    return value !== "" && value !== undefined && value !== null;
  });
  let count = filterEntries.length;
  if (pendingDeposit) count++;
  if (pendingRent) count++;
  if (coupleFilter) count++;
  // New filters
  if (checkInDateFrom || checkInDateTo) count++;
  if (vacatedDateFrom || vacatedDateTo) count++;
  if (refundStatus) count++;
  return count;
}, [filters, pendingDeposit, pendingRent, coupleFilter, checkInDateFrom, checkInDateTo, vacatedDateFrom, vacatedDateTo, refundStatus]);

    const filteredTenants = useMemo(() => {
      let filtered = tenants;
      if (columnSearch.name) {
        const q = columnSearch.name.toLowerCase();
        filtered = filtered.filter((t) => t.full_name?.toLowerCase().includes(q));
      }
      if (columnSearch.contact) {
        const q = columnSearch.contact.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.email?.toLowerCase().includes(q) ||
            t.phone?.toLowerCase().includes(q),
        );
      }
  // Apply couple filter
  // Apply couple filter
  if (coupleFilter) {
    filtered = filtered.filter(tenant => tenant.is_couple_booking == 1 || tenant.is_couple_booking === true);
  }
      if (columnSearch.location) {
        const q = columnSearch.location.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.city?.toLowerCase().includes(q) ||
            t.state?.toLowerCase().includes(q),
        );
      }
      if (columnSearch.checkInDate) {
        const q = columnSearch.checkInDate.toLowerCase();
        filtered = filtered.filter((t) => {
          if (!t.check_in_date) return false;
          const d = new Date(t.check_in_date).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
          }).toLowerCase();
          return d.includes(q);
        });
      }
      if (columnSearch.occupation) {
        const q = columnSearch.occupation.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.occupation_category?.toLowerCase().includes(q) ||
            t.exact_occupation?.toLowerCase().includes(q) ||
            t.occupation?.toLowerCase().includes(q),
        );
      }
      if (columnSearch.property) {
        const q = columnSearch.property.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.current_assignment?.property_name?.toLowerCase().includes(q) ||
            t.assigned_property_name?.toLowerCase().includes(q) ||
            t.current_assignment?.room_number?.toString().includes(q),
        );
      }
      if (columnSearch.monthlyRent) {
    const q = columnSearch.monthlyRent.replace(/[₹,]/g, "").trim();
    const amount = parseFloat(q);
    if (!isNaN(amount)) {
      filtered = filtered.filter((t) => {
        const vr = t.vacate_records?.[0];
        const rent = vr?.rent_amount
          ? Number(vr.rent_amount)
          : t.current_assignment?.tenant_rent
            ? Number(t.current_assignment.tenant_rent)
            : t.current_assignment?.rent_per_bed
              ? Number(t.current_assignment.rent_per_bed)
              : (t as any).monthly_rent
                ? Number((t as any).monthly_rent)
                : 0;
        return String(rent).includes(q);
      });
    }
  }
  if (columnSearch.securityDeposit) {
    const q = columnSearch.securityDeposit.replace(/[₹,]/g, "").trim();
    filtered = filtered.filter((t) => {
      const vr = t.vacate_records?.[0];
      const dep = vr?.security_deposit_amount
        ? Number(vr.security_deposit_amount)
        : t.current_assignment?.security_deposit
          ? Number(t.current_assignment.security_deposit)
          : (t as any).security_deposit
            ? Number((t as any).security_deposit)
            : 0;
      return String(dep).includes(q);
    });
  }

  // Apply pending deposit filter
  if (pendingDeposit) {
    filtered = filtered.filter(tenant => {
      // Security deposit required (from assignment or vacate record)
      const requiredDeposit = tenant.vacate_records?.[0]?.security_deposit_amount
        ?? tenant.current_assignment?.security_deposit
        ?? (tenant as any).security_deposit
        ?? 0;
      // Amount already paid as security deposit
      const payments = tenant.payments || [];
      const depositPaid = payments
        .filter(p => p.payment_type === 'security_deposit' && (p.status === 'approved' || p.status === 'paid'))
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      return depositPaid < requiredDeposit;
    });
  }

  // Apply pending rent filter
  // Inside filteredTenants useMemo, replace the pendingRent section:

  if (pendingRent) {
    filtered = filtered.filter(tenant => {
      // Calculate expected rent based on monthly rent and number of months since joining
      const monthlyRent = tenant.current_assignment?.tenant_rent ||
                          tenant.current_assignment?.rent_per_bed ||
                          (tenant as any).monthly_rent ||
                          0;
      // Estimate months since joining (based on check_in_date)
      let monthsSinceJoining = 0;
      if (tenant.check_in_date) {
        const checkIn = new Date(tenant.check_in_date);
        const now = new Date();
        monthsSinceJoining = (now.getFullYear() - checkIn.getFullYear()) * 12 +
                            (now.getMonth() - checkIn.getMonth());
        if (monthsSinceJoining < 1) monthsSinceJoining = 1;
      } else {
        monthsSinceJoining = 1;
      }

      const expectedRent = monthlyRent * monthsSinceJoining;

      // Total paid rent from approved/paid payments
      const payments = tenant.payments || [];
      const totalPaid = payments
        .filter(p => p.payment_type === 'rent' && (p.status === 'approved' || p.status === 'paid'))
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // Tenant has pending rent if total paid < expected rent
      return totalPaid < expectedRent;
    });
  }

  if (columnSearch.payments) {
    const q = columnSearch.payments.replace(/[₹,]/g, "").trim();
    filtered = filtered.filter((t) => {
      const payments = t.payments || [];
      const paid = payments
        .filter((p) => p.status === "approved" || p.status === "paid")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      return String(paid).includes(q);
    });
  }
  if (columnSearch.vacatedDate) {
    const q = columnSearch.vacatedDate.toLowerCase();
    filtered = filtered.filter((t) => {
      const vr = t.vacate_records?.[0];
      if (!vr?.requested_vacate_date) return false;
      const d = new Date(vr.requested_vacate_date).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      }).toLowerCase();
      return d.includes(q);
    });
  }
// ── Check-in date range filter ──
  if (checkInDateFrom || checkInDateTo) {
    filtered = filtered.filter((t) => {
      if (!t.check_in_date) return false;
      const d = new Date(t.check_in_date);
      if (checkInDateFrom && d < new Date(checkInDateFrom)) return false;
      if (checkInDateTo && d > new Date(checkInDateTo)) return false;
      return true;
    });
  }

  // ── Vacated date range filter ──
  if (vacatedDateFrom || vacatedDateTo) {
    filtered = filtered.filter((t) => {
      const vr = t.vacate_records?.[0];
      if (!vr?.requested_vacate_date) return false;
      const d = new Date(vr.requested_vacate_date);
      if (vacatedDateFrom && d < new Date(vacatedDateFrom)) return false;
      if (vacatedDateTo && d > new Date(vacatedDateTo)) return false;
      return true;
    });
  }

  // ── Refund status filter ──
  if (refundStatus) {
    filtered = filtered.filter((t) => {
      const vr = t.vacate_records?.[0];
      // refundable_amount can be string from DB, force to number
      const refundable = parseFloat(String(vr?.refundable_amount ?? 0)) || 0;

      const payments = t.payments || [];
      const totalRefunded = payments
        .filter((p) => {
          const type = ((p as any).payment_type || '').toLowerCase();
          const status = (p.status || '').toLowerCase();
          return (type === 'deposit_refund' || type === 'refund') &&
            (status === 'approved' || status === 'paid' || status === 'refund' || status === 'completed');
        })
        .reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0);

      const remainingRefund = refundable - totalRefunded;

      console.log(`[RefundFilter] tenant ${t.id}: refundable=${refundable}, totalRefunded=${totalRefunded}, remaining=${remainingRefund}, filter=${refundStatus}`);

      if (refundStatus === 'pending') {
        // Has refund amount due but not yet fully paid
        return remainingRefund > 0;
      }
      if (refundStatus === 'settled') {
        // Had refund amount and it's been fully paid
        return refundable > 0 && remainingRefund <= 0;
      }
      if (refundStatus === 'no_refund') {
        // No refund amount at all (deposit settled or penalty > deposit)
        return refundable <= 0;
      }
      return true;
    });
  }



      if (columnSearch.status) {
        const q = columnSearch.status.toLowerCase();
        filtered = filtered.filter((t) => {
          if (q === "active") return t.is_active === true;
          if (q === "inactive") return t.is_active === false;
          if (q === "portal") return t.portal_access_enabled === true;
          if (q === "no portal") return t.portal_access_enabled === false;
          if (q === "login") return t.has_credentials === true;
          if (q === "no login") return t.has_credentials === false;
          return (
            (t.is_active ? "active" : "inactive").includes(q) ||
            (t.portal_access_enabled ? "portal" : "no portal").includes(q) ||
            (t.has_credentials ? "login" : "no login").includes(q)
          );
        });
      }
      return filtered;
  }, [tenants, columnSearch, pendingDeposit, pendingRent, coupleFilter, checkInDateFrom, checkInDateTo, vacatedDateFrom, vacatedDateTo, refundStatus]);

    const paginatedTenants = useMemo(() => {
      const start = (currentPage - 1) * pageSize;
      return filteredTenants.slice(start, start + pageSize);
    }, [filteredTenants, currentPage, pageSize]);

    // Add handlers
    const handleVacatedTenantRefund = useCallback(
      (tenant: Tenant, refundAmount: number) => {
        setSelectedVacatedTenant(tenant);
        setPaymentModalAmount(refundAmount);
        setPaymentModalType("refund");
        setPaymentModalOpen(true);
      },
      [],
    );

    const handleVacatedTenantPayment = useCallback(
      (tenant: Tenant, paymentAmount: number) => {
        setSelectedVacatedTenant(tenant);
        setPaymentModalAmount(paymentAmount);
        setPaymentModalType("payment");
        setPaymentModalOpen(true);
      },
      [],
    );

    const handlePaymentModalSuccess = useCallback(async () => {
      // Force refresh the tenants data
      await loadTenants();
      // Force a re-render
      setForceUpdate((prev) => prev + 1);
      // Also refresh the selected tenant if it exists
      if (selectedVacatedTenant) {
        const refreshedTenant = await listTenants({
          vacate_status: "vacated",
          pageSize: 1000,
          search: String(selectedVacatedTenant.id),
        });
        if (refreshedTenant?.success && refreshedTenant.data?.length > 0) {
          const updatedTenant = refreshedTenant.data[0];
          setSelectedVacatedTenant(updatedTenant);
        }
      }
    }, [loadTenants, selectedVacatedTenant]);

    // Handle delete for vacated tenants - moves to deleted tab
    const handleDeleteVacatedTenant = useCallback(
      async (tenant: Tenant) => {
        const result = await Swal.fire({
          title: "Move to Deleted?",
          text: `You are about to move "${tenant.full_name}" to Deleted Vacated Tenants. You can restore it later.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, move to deleted!",
          cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
          try {
            const res = await softDeleteTenant(tenant.id as any);
            if (!res?.success) {
              toast.error(res?.message || "Failed to move tenant to deleted");
              return;
            }
            toast.success(`${tenant.full_name} moved to Deleted Vacated Tenants`);
            loadTenants(); // Refresh the current tab
          } catch (err: any) {
            console.error("Delete error:", err);
            toast.error(err?.response?.message || "Failed to delete tenant");
          }
        }
      },
      [loadTenants],
    );

    // Helper to get the correct tenant ID for viewing
    const getViewTenantId = (tenant: Tenant): string | number => {
      // If this is a partner tenant (is_primary_tenant === false)
      // and has its own ID, use that
      if (tenant.is_primary_tenant === false && tenant.id) {
        return tenant.id;
      }

      // If the tenant has an original_id (from the backend transformation)
      if (tenant.original_id) {
        return tenant.original_id;
      }

      // Otherwise use the regular id
      return tenant.id;
    };

    const handleRestoreVacatedTenant = useCallback(
      async (tenant: Tenant) => {
        const result = await Swal.fire({
          title: "Restore Tenant?",
          text: `Are you sure you want to restore "${tenant.full_name}" back to Vacated Tenants?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",

          confirmButtonText: "Yes, restore",
          cancelButtonText: "Cancel",

          background: "#fff",
          backdrop: `rgba(0,0,0,0.4)`,

          buttonsStyling: false, // ⭐ IMPORTANT FIX

          customClass: {
            title: "text-lg font-bold",
            popup: "rounded-xl",
            confirmButton:
              "bg-blue-600 m-4 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700",
            cancelButton:
              "bg-gray-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-600",
          },
        });

        if (result.isConfirmed) {
          try {
            const res = await restoreTenant(tenant.id as any);
            if (!res?.success) {
              toast.error(res?.message || "Failed to restore tenant");
              return;
            }
            toast.success(`${tenant.full_name} restored to Vacated Tenants`);
            loadTenants();
          } catch (err: any) {
            console.error("Restore error:", err);
            toast.error(err?.message || "Failed to restore tenant");
          }
        }
      },
      [loadTenants],
    );

    // ── PAGINATION LOGIC ──
    const totalTenants = filteredTenants?.length ?? tenants.length;
    const totalPages = Math.max(1, Math.ceil(totalTenants / pageSize));

    useEffect(() => {
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    }, [totalPages, currentPage]);

    const startRecord = totalTenants === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(currentPage * pageSize, totalTenants);

    const goToPage = useCallback(
      (page: number) => {
        setCurrentPage(Math.min(Math.max(1, page), totalPages));
      },
      [totalPages],
    );

    const columns = useMemo(
      () => [
        {
          key: "full_name",
          label: "Name",
          sortable: true,
          render: (tenant: Tenant) => {
            const viewId = getViewTenantId(tenant);
            return (
              <div className="flex items-center gap-2 min-w-0">
                {tenant.photo_url ? (
                  <img
                    src={tenant.photo_url}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-[10px]">
                      {tenant.full_name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <Link
                    href={`/admin/tenants/${viewId}`}
                    className="font-medium text-xs text-gray-900 truncate hover:text-blue-600 transition-colors block"
                  >
                    <span className="text-gray-500 mr-1">
                      {(tenant.salutation || "").toUpperCase()}
                    </span>
                    {(tenant.full_name || "").toUpperCase()}
                  </Link>
                  <div className="text-[10px] text-gray-400 capitalize">
                    {tenant.gender?.toLowerCase() || "N/A"}
                  </div>
                  <div className="text-[9px] text-blue-600 font-semibold">
                    TID-{tenant.id}
                  </div>
                  {tenant.is_primary_tenant === false && (
                    <div className="text-[8px] text-rose-500 font-medium">
                      Partner
                    </div>
                  )}
                </div>
              </div>
            );
          },
        },
        {
          key: "email",
          label: "Contact",
          render: (tenant: Tenant) => (
            <div className="space-y-0.5 min-w-0">
              <div className="text-[10px] text-gray-700 truncate flex items-center gap-1">
                <Mail className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{tenant.email}</span>
              </div>
              <div className="text-[10px] text-gray-500 flex items-center gap-1">
                <Phone className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                <span>
                  {tenant.country_code} {tenant.phone}
                </span>
              </div>
              {tenant.city && (
                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">
                    {tenant.city}, {tenant.state}
                  </span>
                </div>
              )}
            </div>
          ),
        },
        {
          key: "occupation",
          label: "Occupation",
          sortable: true,
          render: (tenant: Tenant) => (
            <div className="space-y-0.5">
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 font-medium border-blue-200 text-blue-700 bg-blue-50"
              >
                {tenant.occupation_category || "Other"}
              </Badge>
              <div className="text-[10px] text-gray-600 leading-tight">
                {tenant.exact_occupation || tenant.occupation || "Not specified"}
              </div>
            </div>
          ),
        },
        {
          key: "property",
          label: "Property & Room",
          render: (tenant: Tenant) => {
            if (tenant.current_assignment || tenant.assigned_room_id) {
              const assignment = tenant.current_assignment || {
                property_name: tenant.assigned_property_name,
                room_number: tenant.assigned_room_number,
                bed_number: tenant.assigned_bed_number,
              };
              return (
                <div className="space-y-0.5">
                  <div className="text-[10px] font-medium text-gray-800 flex items-center gap-1">
                    <Building className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      {assignment.property_name || "Unknown Property"}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Bed className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                    <span>
                      Room {assignment.room_number || "N/A"} · Bed{" "}
                      {assignment.bed_number || "N/A"}
                    </span>
                  </div>
                  <Badge className="text-[9px] px-1.5 py-0 h-4 bg-green-50 text-green-700 border-green-200 border">
                    <CheckCircle className="w-2 h-2 mr-0.5" />
                    Assigned
                  </Badge>
                </div>
              );
            }
            return (
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <Building className="w-2.5 h-2.5" />
                <span>No assignment</span>
              </div>
            );
          },
        },
        {
          key: "payments",
          label: "Payments",
          render: (tenant: Tenant) => {
            const payments = tenant.payments || [];
            const paid = payments
              .filter((p) => p.status === "paid" || p.status === "approved")
              .reduce((sum, p) => sum + (p.amount || 0), 0);
            const pending = payments
              .filter((p) => p.status === "pending")
              .reduce((sum, p) => sum + (p.amount || 0), 0);

            // Check if tenant is vacated and has refundable amount
            const isVacated = tenant.has_vacated === true;
            const vacateRecord = tenant.vacate_records?.[0];
            const refundableAmount = vacateRecord?.refundable_amount || 0;
            const totalPenalty = vacateRecord?.total_penalty_amount || 0;
            const securityDeposit = vacateRecord?.security_deposit_amount || 0;

            // Determine if we need to show refund/payment button
            const needsRefund = isVacated && refundableAmount > 0;
            const needsPayment = isVacated && refundableAmount < 0;

            console.log(
              `🔍 Tenant ${tenant.id}: isVacated=${isVacated}, refundableAmount=${refundableAmount}, needsRefund=${needsRefund}`,
            );

            return (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-green-600">
                  ₹{paid.toLocaleString()}
                </div>
                {pending > 0 && (
                  <div className="text-xs text-red-500">
                    ₹{pending.toLocaleString()}
                  </div>
                )}
                <div className="text-[9px] text-gray-400">
                  {payments.length} txn
                </div>

                {/* Show Refund/Payment buttons for vacated tenants */}
                {isVacated && (
                  <div className="mt-2">
                    {needsRefund && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[9px] px-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-600"
                        onClick={() =>
                          handleVacatedTenantRefund(
                            tenant,
                            refundableAmount,
                            vacateRecord?.id,
                          )
                        }
                      >
                        <Shield className="w-2.5 h-2.5 mr-1" />
                        Pay Refund ₹{refundableAmount.toLocaleString()}
                      </Button>
                    )}
                    {needsPayment && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[9px] px-2 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-600"
                        onClick={() =>
                          handleVacatedTenantPayment(
                            tenant,
                            Math.abs(refundableAmount),
                            vacateRecord?.id,
                          )
                        }
                      >
                        <IndianRupee className="w-2.5 h-2.5 mr-1" />
                        Receive Payment ₹
                        {Math.abs(refundableAmount).toLocaleString()}
                      </Button>
                    )}
                    {!needsRefund && !needsPayment && refundableAmount === 0 && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 h-5 bg-gray-100 text-gray-500"
                      >
                        Settled
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            );
          },
        },
        {
          key: "is_active",
          label: "Status",
          sortable: true,
          filterable: true,
          render: (tenant: Tenant) => (
            <div className="flex flex-wrap gap-1">
              <Badge
                className={`text-[9px] px-1.5 py-0 h-4 font-semibold ${tenant.is_active ? "bg-emerald-500 text-white" : "bg-gray-400 text-white"}`}
              >
                {tenant.is_active ? "Active" : "Inactive"}
              </Badge>
              {tenant.portal_access_enabled ? (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 border-blue-300 text-blue-600 bg-blue-50"
                >
                  <ShieldCheck className="w-2 h-2 mr-0.5" />
                  Portal
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 border-gray-300 text-gray-400"
                >
                  No Portal
                </Badge>
              )}
              {tenant.has_credentials ? (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 border-green-300 text-green-600 bg-green-50"
                >
                  <LogIn className="w-2 h-2 mr-0.5" />
                  Login
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 border-orange-300 text-orange-500"
                >
                  No Login
                </Badge>
              )}
            </div>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          render: (tenant: Tenant) => {
            // Use a ref to get the current activeTab value
            const currentTab = activeTab;
            const isDeletedTab = currentTab === "deleted";
            const isVacatedTab = currentTab === "vacated";

            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-gray-100"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 text-xs">
                  <DropdownMenuItem
                    className="text-xs"
                    onClick={() => {
                      setSelectedTenant(tenant);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    <Eye className="w-3 h-3 mr-2" /> View Details
                  </DropdownMenuItem>

                  {isDeletedTab ? (
                    <DropdownMenuItem
                      className="text-xs text-green-600"
                      onClick={() => handleRestoreVacatedTenant(tenant)}
                    >
                      <RefreshCw className="w-3 h-3 mr-2" /> Restore to Vacated
                    </DropdownMenuItem>
                  ) : isVacatedTab ? (
                    <>
                      {can("edit_tenants") && (
                        <DropdownMenuItem
                          className="text-xs"
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-2" /> Edit
                        </DropdownMenuItem>
                      )}
                      {can("manage_tenant_credentials") && (
                        <DropdownMenuItem
                          className="text-xs"
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setCredentialPassword("");
                            setIsCredentialDialogOpen(true);
                          }}
                        >
                          <Key className="w-3 h-3 mr-2" />{" "}
                          {tenant.has_credentials
                            ? "Reset Password"
                            : "Create Login"}
                        </DropdownMenuItem>
                      )}
                      {can("manage_tenant_portal") && (
                        <DropdownMenuItem
                          className="text-xs"
                          onClick={() => handleTogglePortalAccess(tenant)}
                        >
                          <Globe className="w-3 h-3 mr-2" />{" "}
                          {tenant.portal_access_enabled
                            ? "Disable Portal"
                            : "Enable Portal"}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-xs text-red-600"
                        onClick={() => handleDeleteVacatedTenant(tenant)}
                      >
                        <Trash2 className="w-3 h-3 mr-2" /> Move to Deleted
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      {can("edit_tenants") && (
                        <DropdownMenuItem
                          className="text-xs"
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-2" /> Edit
                        </DropdownMenuItem>
                      )}
                      {can("manage_tenant_credentials") && (
                        <DropdownMenuItem
                          className="text-xs"
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setCredentialPassword("");
                            setIsCredentialDialogOpen(true);
                          }}
                        >
                          <Key className="w-3 h-3 mr-2" />{" "}
                          {tenant.has_credentials
                            ? "Reset Password"
                            : "Create Login"}
                        </DropdownMenuItem>
                      )}
                      {can("manage_tenant_portal") && (
                        <DropdownMenuItem
                          className="text-xs"
                          onClick={() => handleTogglePortalAccess(tenant)}
                        >
                          <Globe className="w-3 h-3 mr-2" />{" "}
                          {tenant.portal_access_enabled
                            ? "Disable Portal"
                            : "Enable Portal"}
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },
      ],
      [
        activeTab,
        can,
        handleDeleteVacatedTenant,
        handleRestoreVacatedTenant,
        handleTogglePortalAccess,
        forceUpdate,
      ],
    );

    // Memoized table filters
    const tableFilters: FilterConfig[] = useMemo(
      () => [
        {
          key: "is_active",
          label: "Status",
          type: "select",
          options: [
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" },
          ],
        },
        {
          key: "gender",
          label: "Gender",
          type: "select",
          options: [
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Other", label: "Other" },
          ],
        },
        {
          key: "occupation_category",
          label: "Occupation",
          type: "select",
          options: [
            { value: "Service", label: "Service" },
            { value: "Business", label: "Business" },
            { value: "Student", label: "Student" },
            { value: "Other", label: "Other" },
          ],
        },
        {
          key: "preferred_sharing",
          label: "Sharing",
          type: "select",
          options: [
            { value: "single", label: "Single" },
            { value: "double", label: "Double" },
            { value: "triple", label: "Triple" },
          ],
        },
        {
          key: "has_credentials",
          label: "Login Status",
          type: "select",
          options: [
            { value: "true", label: "Has Login" },
            { value: "false", label: "No Login" },
          ],
        },
        {
          key: "portal_access_enabled",
          label: "Portal Access",
          type: "select",
          options: [
            { value: "true", label: "Enabled" },
            { value: "false", label: "Disabled" },
          ],
        },
      ],
      [],
    );

    // Memoized bulk actions
    const bulkActions: BulkAction[] = useMemo(
      () => [
        {
          label: "Activate Selected",
          icon: <CheckCircle className="w-3 h-3" />,
          action: (selectedIds) => handleBulkStatusChange(selectedIds, true),
        },
        {
          label: "Deactivate Selected",
          icon: <XCircle className="w-3 h-3" />,
          action: (selectedIds) => handleBulkStatusChange(selectedIds, false),
        },
        {
          label: "Enable Portal Access",
          icon: <Globe className="w-3 h-3" />,
          action: (selectedIds) => handleBulkPortalAccess(selectedIds, true),
        },
        {
          label: "Disable Portal Access",
          icon: <UserX className="w-3 h-3" />,
          action: (selectedIds) => handleBulkPortalAccess(selectedIds, false),
        },
        {
          label: "Delete Selected",
          icon: <Trash2 className="w-3 h-3" />,
          action: handleBulkDelete,
          variant: "destructive",
          // confirmMessage: "Are you sure you want to delete the selected tenants?",
        },
      ],
      [handleBulkStatusChange, handleBulkPortalAccess, handleBulkDelete],
    );

    // FilterSelect component for sidebar
  const FilterSelect = ({
    label,
    value,
    onChange,
    options,
    placeholder = "All",
  }: {
    label: string;
    value: string | boolean | undefined;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
  }) => {
    let stringValue = "";
    if (value === true) stringValue = "true";
    else if (value === false) stringValue = "false";
    else stringValue = value || "";

    const selectedOption = options.find(opt => opt.value === stringValue);
    const displayValue = selectedOption ? selectedOption.label : placeholder;

    return (
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-600">{label}</Label>
        <Select
          value={stringValue || "all"}
          onValueChange={(val) => onChange(val === "all" ? "" : val)}
        >
          <SelectTrigger className="h-8 text-xs border-gray-200">
            <SelectValue placeholder={placeholder}>
              {displayValue}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              {placeholder}
            </SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

    // Handle bulk action
    const handleBulkAction = useCallback(
      async (action: BulkAction, selectedIds: string[]) => {
        if (selectedIds.length === 0) {
          toast.error("No tenants selected");
          return;
        }
        if (action.confirmMessage && !confirm(action.confirmMessage)) return;
        try {
          await action.action(selectedIds);
          setSelectedTenantIds([]);
        } catch (error) {
          console.error("Bulk action error:", error);
          toast.error("Failed to perform bulk action");
        }
      },
      [],
    );

    // Apply filters from sidebar
  // Apply filters from sidebar — commit pending state to applied state
    // const applyFilters = () => {
    //   const merged = {
    //     ...filtersRef.current,
    //     ...pendingFilters,
    //     vacate_status: filtersRef.current.vacate_status,
    //     include_deleted: filtersRef.current.include_deleted,
    //   };
    //   filtersRef.current = merged;
    //   setFiltersState(merged);
    //   setCoupleFilter(pendingCoupleFilter);
    //   setPendingDeposit(pendingPendingDeposit);
    //   setPendingRent(pendingPendingRent);
    //   loadTenants(merged);
    //   setIsFilterSidebarOpen(false);
    // };


    // Apply a single filter change immediately, without waiting for "Apply Filters" click
const applyFiltersLive = (
  partialFilters: Partial<TenantFilters> = {},
  coupleOverride?: boolean
) => {
  const merged = {
    ...filtersRef.current,
    ...pendingFilters,
    ...partialFilters,
    vacate_status: filtersRef.current.vacate_status,
    include_deleted: filtersRef.current.include_deleted,
  };
  filtersRef.current = merged;
  setFiltersState(merged);

  if (typeof coupleOverride === "boolean") {
    setCoupleFilter(coupleOverride);
  }

  loadTenants(merged);
};

const applyFilters = () => {
  const merged = {
    ...filtersRef.current,
    ...pendingFilters,
    vacate_status: filtersRef.current.vacate_status,
    include_deleted: filtersRef.current.include_deleted,
  };
  filtersRef.current = merged;
  setFiltersState(merged);
  setCoupleFilter(pendingCoupleFilter);
  setPendingDeposit(pendingPendingDeposit);
  setPendingRent(pendingPendingRent);
  setCheckInDateFrom(pendingCheckInDateFrom);
  setCheckInDateTo(pendingCheckInDateTo);
  setVacatedDateFrom(pendingVacatedDateFrom);
  setVacatedDateTo(pendingVacatedDateTo);
  setRefundStatus(pendingRefundStatus);
  loadTenants(merged);
  setIsFilterSidebarOpen(false);
};

    // Handle column search change
    const handleColumnSearchChange = useCallback(
      (column: keyof typeof columnSearch, value: string) => {
        setColumnSearch((prev) => ({
          ...prev,
          [column]: value,
        }));
      },
      [],
    );

    const [checkInDateFilter, setCheckInDateFilter] = useState({ from: "", to: "" });
const totals = useMemo(() => {
  let totalRent = 0;
  let totalDeposit = 0;
  let totalRefunded = 0;

  paginatedTenants.forEach(tenant => {
    const isCoupleTenant = tenant.is_couple_booking === true || (tenant.is_couple_booking as any) === 1;
    const isPartnerTenant = isCoupleTenant && (
      tenant.is_primary_tenant === false ||
      (tenant.is_primary_tenant as any) === 0
    );
    if (isPartnerTenant) return; // skip partner rows

    const vr = tenant.vacate_records?.[0];
    const rent = vr?.rent_amount
      ? Number(vr.rent_amount)
      : Number(tenant.current_assignment?.tenant_rent || tenant.current_assignment?.rent_per_bed || 0);
    const deposit = vr?.security_deposit_amount
      ? Number(vr.security_deposit_amount)
      : Number(tenant.current_assignment?.security_deposit || 0);

    // FIX: same type check
    const refunded = (tenant.payments || [])
  .filter(p => {
    const type = ((p as any).payment_type || '').toLowerCase();
    return (type === 'deposit_refund' || type === 'refund') &&
           (p.status === 'approved' || p.status === 'paid' || p.status === 'refund' || p.status === 'completed');
  })
  .reduce((sum, p) => sum + (p.amount || 0), 0);

    totalRent += rent;
    totalDeposit += deposit;
    totalRefunded += refunded;
  });

  return { totalRent, totalDeposit, totalRefunded };
}, [paginatedTenants]);// ← paginatedTenants, filteredTenants nahi
    // ── PAGINATION COMPONENT ──
  const PaginationBar = () => (
  <div className="flex items-center justify-between px-3 py-2 border-t bg-white text-xs">
    {/* LEFT SIDE: record count + rows selector */}
    <div className="flex items-center gap-2 text-gray-500">
      <span className="hidden sm:inline">
        {totalTenants === 0
          ? "No records"
          : `Showing ${startRecord}–${endRecord} of ${totalTenants} tenants`}
      </span>
      <span className="sm:hidden text-[10px]">
        {startRecord}–{endRecord}/{totalTenants}
      </span>

      <div className="flex items-center gap-1 ml-2">
        <span className="text-gray-400 hidden sm:inline">Rows:</span>
        <Select
          value={
            pageSize === totalTenants && totalTenants > 100
              ? "All"
              : String(pageSize)
          }
          onValueChange={(val) => {
            if (val === "All") {
              setPageSize(totalTenants || 99999);
            } else {
              setPageSize(Number(val));
            }
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-6 w-14 text-[10px] border-gray-200 px-1">
            <SelectValue>
              {pageSize === totalTenants && totalTenants > 100
                ? "All"
                : pageSize}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem
                key={String(size)}
                value={String(size)}
                className="text-xs"
              >
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* RIGHT SIDE: totals + page navigation */}
    <div className="flex items-center gap-3">
      {/* Totals */}
      <span className="hidden sm:inline text-[10px] text-gray-400 border-r pr-3">
        Total Rent:{" "}
        <span className="font-semibold text-green-600">
          ₹{totals.totalRent.toLocaleString()}
        </span>
        &nbsp;·&nbsp;
        Total Deposit:{" "}
        <span className="font-semibold text-blue-600">
          ₹{totals.totalDeposit.toLocaleString()}
        </span>
        {(activeTab === "vacated" || activeTab === "deleted") && (
          <>
            &nbsp;·&nbsp;
            Total Refunded:{" "}
            <span className="font-semibold text-purple-600">
              ₹{totals.totalRefunded.toLocaleString()}
            </span>
          </>
        )}
      </span>

      {/* Page navigation buttons (unchanged) */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          title="First page"
        >
          <ChevronsLeft className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous page"
        >
          <ChevronLeft className="w-3 h-3" />
        </Button>

        <div className="hidden sm:flex items-center gap-0.5">
          {(() => {
            const pages: (number | "...")[] = [];
            const delta = 2;
            const left = currentPage - delta;
            const right = currentPage + delta;
            for (let i = 1; i <= totalPages; i++) {
              if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                pages.push(i);
              } else if (i === left - 1 || i === right + 1) {
                pages.push("...");
              }
            }
            return pages.map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-gray-400 text-[10px]"
                >
                  …
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="icon"
                  className={`h-6 w-6 text-[10px] ${
                    currentPage === page ? "bg-blue-600 text-white" : ""
                  }`}
                  onClick={() => goToPage(page as number)}
                >
                  {page}
                </Button>
              )
            );
          })()}
        </div>

        <span className="sm:hidden text-[10px] text-gray-500 px-1">
          {currentPage}/{totalPages}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next page"
        >
          <ChevronRight className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          title="Last page"
        >
          <ChevronsRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  </div>
);

    return (
      <div className="space-y-0 flex flex-col ">
        {" "}
        {/* Tabs */}
        <div className="flex overflow-hidden border border-gray-200 bg-white rounded-xl mb-3 shadow-sm sticky top-20 z-10">
          {/* All Tenants Tab */}
          <button
            onClick={() => handleTabChange("all")}
            className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all text-center flex items-center justify-center gap-1.5 sm:gap-2
        ${
          activeTab === "all"
            ? "border-blue-600 text-blue-700 bg-white"
            : "border-transparent text-gray-500 bg-gray-50 hover:text-gray-700 hover:bg-gray-100"
        }`}
          >
            <Users2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden xs:inline sm:inline">All Tenants</span>
            <span className="xs:hidden sm:hidden inline">All</span>
          </button>

          <div className="w-px bg-gray-200 my-2" />

          {/* Vacated Tenants Tab */}
          <button
            onClick={() => handleTabChange("vacated")}
            className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all text-center flex items-center justify-center gap-1.5 sm:gap-2
        ${
          activeTab === "vacated"
            ? "border-purple-600 text-purple-700 bg-white"
            : "border-transparent text-gray-500 bg-gray-50 hover:text-gray-700 hover:bg-gray-100"
        }`}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden xs:inline sm:inline">Vacated Tenants</span>
            <span className="xs:hidden sm:hidden inline">Vacated</span>
          </button>

          <div className="w-px bg-gray-200 my-2" />

          {/* Deleted Vacated Tenants Tab */}
          <button
            onClick={() => handleTabChange("deleted")}
            className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all text-center flex items-center justify-center gap-1.5 sm:gap-2
        ${
          activeTab === "deleted"
            ? "border-red-600 text-red-700 bg-white"
            : "border-transparent text-gray-500 bg-gray-50 hover:text-gray-700 hover:bg-gray-100"
        }`}
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden xs:inline sm:inline">
              Deleted Vacate Tenants (Storage)
            </span>
            <span className="xs:hidden sm:hidden inline">Deleted</span>
          </button>
        </div>
        <Card className="flex flex-col  overflow-y-auto rounded-xl shadow-sm border-gray-200 mt-8">
          {" "}
          <CardHeader className="sticky top-0 z-20 p-0 bg-gray-200 shadow-md">
            {/* Desktop View (lg and above) */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-2.5">
              {/* LEFT: Icon + Search */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex-shrink-0">
                  <Users2 className="w-4 h-4 text-gray-700" />
                </div>
                {/* <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-200 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange({...filters, search: e.target.value})}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white/20 text-white placeholder-blue-200 backdrop-blur-md border border-white/30 shadow-sm focus:outline-none focus:ring-1 focus:ring-white/50"
                />
              </div> */}
              </div>

              {/* RIGHT: Buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Refresh */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-800 hover:text-gray-700 hover:bg-white/20 rounded-lg"
                  onClick={() => loadTenants()}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>

                {/* Filter */}
        <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
  <SheetTrigger asChild>
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2.5 text-gray-800 hover:text-gray-700 hover:bg-white/20 rounded-lg text-xs relative"
    >
      <Filter className="w-3.5 h-3.5 mr-1" />
      Filters
      {activeFiltersCount > 0 && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-400 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
          {activeFiltersCount}
        </span>
      )}
    </Button>
  </SheetTrigger>

  <SheetContent side="right" className="w-[85vw] sm:w-96 p-0 bg-white flex flex-col gap-0">
    {/* HEADER */}
    <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-white" />
        <span className="text-sm font-semibold text-white">Advanced Filters</span>
        {activeFiltersCount > 0 && (
          <Badge className="text-[9px] px-1.5 py-0 h-4 bg-orange-400 text-white border-0">
            {activeFiltersCount}
          </Badge>
        )}
      </div>
      <button onClick={() => setIsFilterSidebarOpen(false)} className="text-white/70 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>

    {/* BODY */}
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
     {/* STATUS & ACCESS + PERSONAL — combined, no city */}
  <div className="space-y-3">
  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
    <ShieldCheck className="w-3 h-3" />
    Status & Access
  </div>
  <div className="grid grid-cols-2 gap-2">
    <div>
      <Label className="text-[10px] text-gray-500 mb-1 block">Login</Label>
      <FilterSelect
        label=""
        value={pendingFilters.has_credentials || ""}
        onChange={(value) => {
          setPendingFilters(prev => ({ ...prev, has_credentials: value === "" ? undefined : value }));
          applyFiltersLive({ has_credentials: value === "" ? undefined : value });
        }}
        options={[
          { value: "true", label: "Has Login" },
          { value: "false", label: "No Login" },
        ]}
      />
    </div>
    <div>
      <Label className="text-[10px] text-gray-500 mb-1 block">Gender</Label>
      <Select
        value={pendingCoupleFilter ? "Couple" : (pendingFilters.gender || "all")}
        onValueChange={(val) => {
          if (val === "Couple") {
            setPendingCoupleFilter(true);
            setPendingFilters(prev => ({ ...prev, gender: "" }));
            applyFiltersLive({ gender: "" }, true);
          } else {
            setPendingCoupleFilter(false);
            const genderVal = val === "all" ? "" : val;
            setPendingFilters(prev => ({ ...prev, gender: genderVal }));
            applyFiltersLive({ gender: genderVal }, false);
          }
        }}
      >
        <SelectTrigger className="h-8 text-xs border-gray-200">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">All</SelectItem>
          <SelectItem value="Male" className="text-xs">Male</SelectItem>
          <SelectItem value="Female" className="text-xs">Female</SelectItem>
          <SelectItem value="Other" className="text-xs">Other</SelectItem>
          <SelectItem value="Couple" className="text-xs">Couple Booking</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</div>

      {/* ─── DATE RANGES ─────────────────────────────────────────── */}
      {/* Check-in Date – shown in ALL tabs */}
<div className="space-y-3">
  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
    <Calendar className="w-3 h-3" />
    Check‑in Date Range
  </div>
  <div className="grid grid-cols-2 gap-2">
    <div>
      <Label className="text-[10px] text-gray-500 mb-1 block">From</Label>
      <input
        type="date"
        value={pendingCheckInDateFrom}
        onChange={(e) => {
          setPendingCheckInDateFrom(e.target.value);
          setCheckInDateFrom(e.target.value);
        }}
        className="h-8 w-full text-xs border-gray-200 rounded-md border px-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
    </div>
    <div>
      <Label className="text-[10px] text-gray-500 mb-1 block">To</Label>
      <input
        type="date"
        value={pendingCheckInDateTo}
        onChange={(e) => {
          setPendingCheckInDateTo(e.target.value);
          setCheckInDateTo(e.target.value);
        }}
        className="h-8 w-full text-xs border-gray-200 rounded-md border px-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
    </div>
  </div>
</div>

      {/* Vacated Date Range + Refund Status – only for Vacated/Deleted */}
      {(activeTab === "vacated" || activeTab === "deleted") && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            <Calendar className="w-3 h-3" />
            Vacated Date Range
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-gray-500 mb-1 block">From</Label>
             <input
  type="date"
  value={pendingVacatedDateFrom}
  onChange={(e) => {
    setPendingVacatedDateFrom(e.target.value);
    setVacatedDateFrom(e.target.value);
  }}
  className="h-8 w-full text-xs border-gray-200 rounded-md border px-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
/>
            </div>
            <div>
              <Label className="text-[10px] text-gray-500 mb-1 block">To</Label>
             <input
  type="date"
  value={pendingVacatedDateTo}
  onChange={(e) => {
    setPendingVacatedDateTo(e.target.value);
    setVacatedDateTo(e.target.value);
  }}
  className="h-8 w-full text-xs border-gray-200 rounded-md border px-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
/>
            </div>
          </div>

          {/* Refund Status Dropdown */}
          <div>
            <Label className="text-[10px] text-gray-500 mb-1 block">Refund Status</Label>
            <Select
  value={pendingRefundStatus || "all"}
  onValueChange={(val) => {
    const v = val === "all" ? "" : val;
    setPendingRefundStatus(v);
    setRefundStatus(v);
  }}
>
              <SelectTrigger className="h-8 text-xs border-gray-200">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All</SelectItem>
                <SelectItem value="pending" className="text-xs">Pending Refund</SelectItem>
                <SelectItem value="settled" className="text-xs">Settled</SelectItem>
                <SelectItem value="no_refund" className="text-xs">No Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

     {/* FINANCIAL STATUS – dropdown instead of checkboxes */}
<div className="space-y-3">
  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
    <IndianRupee className="w-3 h-3" />
    Financial Status
  </div>
  <div>
    <Label className="text-[10px] text-gray-500 mb-1 block">Payment Status</Label>
    <Select
  value={
    pendingPendingRent
      ? "pending_rent"
      : pendingPendingDeposit
      ? "pending_deposit"
      : "all"
  }
  onValueChange={(val) => {
    const isRent = val === "pending_rent";
    const isDeposit = val === "pending_deposit";
    setPendingPendingRent(isRent);
    setPendingPendingDeposit(isDeposit);
    setPendingRent(isRent);
    setPendingDeposit(isDeposit);
  }}
    >
      <SelectTrigger className="h-8 text-xs border-gray-200">
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all" className="text-xs">All</SelectItem>
        <SelectItem value="pending_rent" className="text-xs">Pending Rent</SelectItem>
        <SelectItem value="pending_deposit" className="text-xs">Pending Deposit</SelectItem>
      </SelectContent>
    </Select>
  </div>
  <p className="text-[9px] text-gray-400">
    Show tenants with incomplete security deposit or unpaid rent.
  </p>
</div>
    </div>

    {/* FOOTER */}
    <div className="border-t p-3 flex gap-2 bg-gray-50">
      <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={clearSidebarFilters}>
        Reset
      </Button>
      <Button size="sm" className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700" onClick={applyFilters}>
        Apply Filters
      </Button>
    </div>
  </SheetContent>
</Sheet>

                {/* Bulk Actions Dropdown */}
                {(can("edit_tenants") || can("delete_tenants")) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 text-gray-800 hover:text-gray-700 hover:bg-white/20 rounded-lg text-xs relative"
                      >
                        <CheckSquare className="w-3.5 h-3.5 mr-1" />
                        Bulk Actions
                        {selectedTenantIds.length > 0 && (
                          <Badge className="ml-1 text-[8px] px-1 py-0 h-3.5 bg-orange-400 text-white border-0">
                            {selectedTenantIds.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 text-xs">
                      {bulkActions.map((action, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={() =>
                            handleBulkAction(action, selectedTenantIds)
                          }
                          className={
                            action.variant === "destructive"
                              ? "text-red-600 text-xs"
                              : "text-xs"
                          }
                        >
                          {action.icon}
                          <span className="ml-2">{action.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Export Button */}
                {can("export_tenants") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2.5 text-gray-700 hover:text-gray-600 hover:bg-white/20 rounded-lg text-xs"
                    onClick={handleExportToExcel}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Export
                  </Button>
                )}

                {can("import_tenants") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2.5 text-gray-800 hover:text-gray-700 hover:bg-white/20 rounded-lg text-xs"
                    onClick={handleImportClick}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Import
                  </Button>
                )}

                {/* Add Tenant Button */}
                {can("create_tenants") && (
                  <Button
                    size="sm"
                    className="h-7 px-3 bg-white text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold shadow-sm"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Tenant
                  </Button>
                )}
              </div>
            </div>

            {/* Active Filters Row - Desktop */}
            {/* {activeFiltersCount > 0 && (
    <div className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 bg-blue-800/40 border-t border-white/10 flex-wrap">
      <span className="text-[10px] text-blue-200 font-medium">Active Filters ({activeFiltersCount})</span>
      {Object.entries(filters).map(([key, value]) => {
        // SKIP vacate_status and search
        if (key === 'vacate_status') return null;
        if (key === 'search') return null;
        if (!value) return null;
        return (
          <Badge key={key} variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-white/20 text-white border-white/30">
            {key}: {String(value)}
          </Badge>
        );
      })}
      <button onClick={clearAllFilters} className="text-[10px] text-orange-300 hover:text-orange-200 underline ml-1">
        Clear all
      </button>
    </div>
  )} */}

            {/* Tablet View (md to lg) */}
            <div className="hidden md:flex lg:hidden items-center gap-1.5 px-3 py-2">
              {/* LEFT: Icon + Search */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/20 flex-shrink-0">
                  <Users2 className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-200 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search tenants..."
                    value={filters.search || ""}
                    onChange={(e) =>
                      handleFilterChange({ ...filters, search: e.target.value })
                    }
                    className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg bg-white/20 text-white placeholder-blue-200 backdrop-blur-md border border-white/30 shadow-sm focus:outline-none focus:ring-1 focus:ring-white/50"
                  />
                </div>
              </div>

              {/* RIGHT: Action buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-white/80 hover:bg-white/20 rounded-lg"
                  onClick={() => loadTenants()}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
                <Sheet
                  open={isFilterSidebarOpen}
                  onOpenChange={setIsFilterSidebarOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-white/80 hover:bg-white/20 rounded-lg relative"
                    >
                      <Filter className="w-3 h-3" />
                      {activeFiltersCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-400 text-white text-[7px] font-bold rounded-full flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                </Sheet>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-white/80 hover:bg-white/20 rounded-lg text-xs relative"
                    >
                      <CheckSquare className="w-3 h-3 mr-1" />
                      Bulk
                      {selectedTenantIds.length > 0 && (
                        <Badge className="ml-1 text-[8px] px-1 py-0 h-3 bg-orange-400 text-white border-0">
                          {selectedTenantIds.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {bulkActions.map((action, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() =>
                          handleBulkAction(action, selectedTenantIds)
                        }
                        className={
                          action.variant === "destructive"
                            ? "text-red-600 text-xs"
                            : "text-xs"
                        }
                      >
                        {action.icon}
                        <span className="ml-2">{action.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {can("export_tenants") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-white/80 hover:bg-white/20 rounded-lg text-xs"
                    onClick={handleExportToExcel}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                )}
                {can("import_tenants") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-white/80 hover:bg-white/20 rounded-lg text-xs"
                    onClick={handleImportClick}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Import
                  </Button>
                )}
                {can("create_tenants") && (
                  <Button
                    size="sm"
                    className="h-7 px-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Tenant
                  </Button>
                )}
              </div>
            </div>

            {/* Tablet: Active Filters Row */}
            {/* {activeFiltersCount > 0 && (
    <div className="hidden md:flex lg:hidden items-center gap-1.5 px-3 py-1 bg-blue-800/40 border-t border-white/10 flex-wrap">
      <span className="text-[10px] text-blue-200">Active ({activeFiltersCount})</span>
      {Object.entries(filters).map(([key, value]) => {
        if (key === 'vacate_status') return null;
        if (key === 'search') return null;
        if (!value) return null;
        return (
          <Badge key={key} variant="outline" className="text-[9px] px-1 py-0 h-3.5 bg-white/20 text-white border-white/30">
            {key}: {String(value)}
          </Badge>
        );
      })}
      <button onClick={clearAllFilters} className="text-[10px] text-orange-300 underline ml-1">Clear</button>
    </div>
  )} */}

            <div className="flex md:hidden items-center gap-1.5 px-3 py-2">
              {/* Left: icon + title + count/bulk badge */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Users2 className="w-4 h-4 text-gray-800 hover:text-gray-700 hover:bg-white/20"/>
                <span className="text-sm font-semibold text-gray-700">Tenants</span>
                <span className="text-[10px] text-gray-700 ml-0.5">
                  ({totalTenants})
                </span>
                {selectedTenantIds.length > 0 && (
                  <Badge className="ml-1 text-[9px] px-1.5 py-0 h-4 bg-orange-400 text-gray-300 border-0">
                    {selectedTenantIds.length} selected
                  </Badge>
                )}
              </div>

              <div className="flex-1" />

              {/* Refresh */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-800 hover:text-gray-700 hover:bg-white/20 rounded-lg"
                onClick={() => loadTenants()}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
                />
              </Button>

              {/* Filter */}
              <Sheet
                open={isFilterSidebarOpen}
                onOpenChange={setIsFilterSidebarOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-800 hover:text-gray-700 hover:bg-white/20 rounded-lg relative"
                  >
                    <Filter className="w-3 h-3" />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-400 text-white text-[7px] font-bold rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
              </Sheet>

              {/* ── "More" overflow menu (bulk / export / import) ── */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-800 hover:text-gray-700 hover:bg-white/20 rounded-lg relative"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                    {selectedTenantIds.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-400 text-white text-[7px] font-bold rounded-full flex items-center justify-center">
                        {selectedTenantIds.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                  {/* Export */}
                  {can("export_tenants") && (
                    <DropdownMenuItem
                      className="text-xs"
                      onClick={handleExportToExcel}
                    >
                      <Download className="w-3 h-3 mr-2 text-gray-500" />
                      Export to Excel
                    </DropdownMenuItem>
                  )}

                  {/* Import */}
                  {can("import_tenants") && (
                    <DropdownMenuItem
                      className="text-xs"
                      onClick={handleImportClick}
                    >
                      <Upload className="w-3 h-3 mr-2 text-gray-500" />
                      Import Tenants
                    </DropdownMenuItem>
                  )}

                  {/* Bulk actions — only shown when something is selected */}
                  {selectedTenantIds.length > 0 &&
                    (can("edit_tenants") || can("delete_tenants")) && (
                      <>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1">
                          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                            Bulk Actions ({selectedTenantIds.length})
                          </p>
                        </div>
                        {bulkActions.map((action, index) => (
                          <DropdownMenuItem
                            key={index}
                            className={
                              action.variant === "destructive"
                                ? "text-red-600 text-xs"
                                : "text-xs"
                            }
                            onClick={() =>
                              handleBulkAction(action, selectedTenantIds)
                            }
                          >
                            {action.icon}
                            <span className="ml-2">{action.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}

                  {/* When nothing selected, show hint */}
                  {selectedTenantIds.length === 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <p className="text-[10px] text-gray-400 italic">
                          Select rows to enable bulk actions
                        </p>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Add Tenant */}
              {can("create_tenants") && (
                <Button
                  size="sm"
                  className="h-7 px-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="w-3 h-3 mr-0.5" />
                  Add
                </Button>
              )}
            </div>

            {/* ── Mobile Row 2: Search bar ── */}
            <div className="flex md:hidden px-3 pb-2 gap-2">
              {/* <div className="relative flex-1">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-200 pointer-events-none" />
      <input
        type="text"
        placeholder="Search tenants..."
        value={filters.search || ""}
        onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
        className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md bg-white/20 text-white placeholder-blue-200 backdrop-blur-md border border-white/30 shadow-sm focus:outline-none focus:ring-1 focus:ring-white/50"
      />
    </div> */}
            </div>

            {/* ── Mobile Row 3: active-filter hint ── */}
            {activeFiltersCount > 0 && (
              <div className="flex md:hidden items-center gap-1.5 px-3 pb-1.5">
                <span className="text-[10px] text-orange-300">
                  Active filters ({activeFiltersCount})
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] text-orange-200 underline"
                >
                  Clear
                </button>
              </div>
            )}
          </CardHeader>
          {/* ── TABLE CONTAINER WITH SINGLE HORIZONTAL SCROLL ── */}
 <div className="flex-1 min-h-0">
  <div className="overflow-auto" style={{ overflowX: "auto", overflowY: "auto", height: "calc(100vh - 250px)" }}>
    <table className="border-collapse border border-gray-200" style={{ minWidth: "800px", width: "100%" }}>
      <thead className="bg-gray-100 border-b border-gray-200" style={{ position: "sticky", top: 0, zIndex: 30 }}>
        {/* ── Column Title Row ── */}
        <tr className="border-b border-gray-200">
          {/* Sticky: checkbox */}
          <th className="bg-gray-50 w-8 px-2 py-2 text-center border-r border-gray-200 border-b">
            <button onClick={toggleSelectAll} className="flex items-center justify-center w-4 h-4 mx-auto">
              {selectedTenantIds.length === tenants.length && tenants.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </th>
          {/* Sticky: ACTIONS */}
          <th className="bg-gray-50 px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-16 border-r border-gray-200 border-b">
            ACTIONS
          </th>
          <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-36 border-r border-gray-200 border-b">STATUS</th>

          {/* Sticky: NAME */}
          <th className="bg-gray-50 px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 border-b">
            NAME
          </th>
          {/* Scrollable columns */}
          <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-14 border-r border-gray-200 border-b">CONTACT</th>
          <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-20 border-r border-gray-200 border-b">CHECK-IN DATE</th>
          {(activeTab === "vacated" || activeTab === "deleted") && (
            <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-28 border-r border-gray-200 border-b">VACATED DATE</th>
          )}
          <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-48 border-r border-gray-200 border-b">PROPERTY & ROOM</th>
          <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-20 border-r border-gray-200 border-b">MONTHLY RENT</th>
          <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-32 border-r border-gray-200 border-b">SECURITY DEPOSIT</th>
          {(activeTab === "vacated" || activeTab === "deleted") && (
            <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-28 border-r border-gray-200 border-b">REFUND AMT</th>
          )}
          <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-40 border-r border-gray-200 border-b">PAYMENTS</th>
          <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-36 border-r border-gray-200 border-b">LOCATION</th>
        </tr>

        {/* ── Search Inputs Row ── */}
        <tr className="border-t border-gray-200 bg-white">
          <td className="bg-white w-8 px-2 py-1.5 text-center border-r border-gray-200" />
          <td className="bg-white px-2 py-1.5 border-r border-gray-200" />
          <td className="px-2 py-1.5 border-r border-gray-200">
            <Input
              placeholder="Status..."
              value={columnSearch.status}
              onChange={(e) => handleColumnSearchChange("status", e.target.value)}
              className="h-6 text-[10px] w-full border-gray-200"
            />
          </td>
          <td className="bg-white px-1 py-1 border-r border-gray-200">
            <Input
              placeholder="Name..."
              value={columnSearch.name}
              onChange={(e) => handleColumnSearchChange("name", e.target.value)}
              className="h-6 text-[10px] border-gray-200"
            />
          </td>
          <td className="px-2 py-1.5 border-r border-gray-200">
            <Input
              placeholder="Phone..."
              value={columnSearch.contact}
              onChange={(e) => handleColumnSearchChange("contact", e.target.value)}
              className="h-6 text-[10px] w-full border-gray-200"
            />
          </td>
          <td className="px-2 py-1.5 border-r border-gray-200">
            <Input
              placeholder="Date.."
              value={columnSearch.checkInDate}
              onChange={(e) => handleColumnSearchChange("checkInDate", e.target.value)}
              className="h-6 text-[10px] w-full border-gray-200"
            />
          </td>
          {(activeTab === "vacated" || activeTab === "deleted") && (
            <td className="px-2 py-1.5 border-r border-gray-200">
              <Input
                placeholder="Date.."
                value={columnSearch.vacatedDate || ""}
                onChange={(e) => handleColumnSearchChange("vacatedDate" as any, e.target.value)}
                className="h-6 text-[10px] w-full border-gray-200"
              />
            </td>
          )}
          <td className="px-2 py-1.5 border-r border-gray-200">
            <Input
              placeholder="Property/room..."
              value={columnSearch.property}
              onChange={(e) => handleColumnSearchChange("property", e.target.value)}
              className="h-6 text-[10px] w-full border-gray-200"
            />
          </td>
          <td className="px-2 py-1.5 border-r border-gray-200">
            <Input
              placeholder="Rent.."
              value={columnSearch.monthlyRent}
              onChange={(e) => handleColumnSearchChange("monthlyRent", e.target.value)}
              className="h-6 text-[10px] w-full border-gray-200"
            />
          </td>
          <td className="px-2 py-1.5 border-r border-gray-200">
            <Input
              placeholder="Deposit.."
              value={columnSearch.securityDeposit}
              onChange={(e) => handleColumnSearchChange("securityDeposit", e.target.value)}
              className="h-6 text-[10px] w-full border-gray-200"
            />
          </td>
          {(activeTab === "vacated" || activeTab === "deleted") && (
            <td className="px-1 py-1 border-r border-gray-200" style={{ width: "80px" }}>
              <Input placeholder="Refund..." value={(columnSearch as any).refundAmount || ""}
                onChange={(e) => handleColumnSearchChange("refundAmount" as any, e.target.value)}
                className="h-6 text-[10px] w-full border-gray-200 px-1.5" />
            </td>
          )}
          <td className="px-2 py-1.5 border-r border-gray-200">
            <Input
              placeholder="Payment.."
              value={columnSearch.payments}
              onChange={(e) => handleColumnSearchChange("payments", e.target.value)}
              className="h-6 text-[10px] w-full border-gray-200"
            />
          </td>
          <td className="px-2 py-1.5 border-r border-gray-200">
            <Input
              placeholder="City/state..."
              value={columnSearch.location}
              onChange={(e) => handleColumnSearchChange("location", e.target.value)}
              className="h-6 text-[10px] w-full border-gray-200"
            />
          </td>
        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan={activeTab === "vacated" || activeTab === "deleted" ? 12 : 11} className="py-16 text-center border-b border-gray-200">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="text-xs text-gray-400">Loading tenants...</span>
              </div>
            </td>
          </tr>
        ) : filteredTenants.length === 0 ? (
          <tr>
            <td colSpan={activeTab === "vacated" || activeTab === "deleted" ? 13 : 11} className="py-16 text-center border-b border-gray-200">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Users2 className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">No tenants found</p>
                  <p className="text-xs text-gray-400 mt-0.5">Add your first tenant to get started</p>
                </div>
                {can("create_tenants") && (
                  <Button size="sm" className="text-xs h-7 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-3 h-3 mr-1" /> Add Tenant
                  </Button>
                )}
              </div>
            </td>
          </tr>
        ) : (
          paginatedTenants.map((tenant, idx) => {
            const vacateRecord = tenant.vacate_records?.[0];
            const rowBg = "bg-white";

            // ── MONTHLY RENT ──
            const monthlyRent = vacateRecord?.rent_amount
              ? Number(vacateRecord.rent_amount)
              : tenant.current_assignment?.tenant_rent
                ? Number(tenant.current_assignment.tenant_rent)
                : tenant.current_assignment?.rent_per_bed
                  ? Number(tenant.current_assignment.rent_per_bed)
                  : (tenant as any).monthly_rent
                    ? Number((tenant as any).monthly_rent)
                    : (tenant as any).rent_per_bed
                      ? Number((tenant as any).rent_per_bed)
                      : 0;

            // ── SECURITY DEPOSIT ──
            const securityDeposit = vacateRecord?.security_deposit_amount
              ? Number(vacateRecord.security_deposit_amount)
              : tenant.current_assignment?.security_deposit
                ? Number(tenant.current_assignment.security_deposit)
                : (tenant as any).security_deposit
                  ? Number((tenant as any).security_deposit)
                  : 0;

            // ── REFUND AMOUNT (vacated only) ──
            const refundableAmount = Number(vacateRecord?.refundable_amount || 0);
            // ── CHECK-IN DATE ──
            const checkInDate = tenant.check_in_date
              ? new Date(tenant.check_in_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—";

            const isCouple = tenant.is_couple_booking === true || (tenant.is_couple_booking as any) === 1;
            const isPartner = isCouple && (
              tenant.is_primary_tenant === false ||
              (tenant.is_primary_tenant as any) === 0
            );
            const payments = tenant.payments || [];
            // Include both 'deposit_refund' and 'refund' payment types
            const totalRefunded = payments
              .filter((p) => {
                const type = ((p as any).payment_type || '').toLowerCase();
                return (type === 'deposit_refund' || type === 'refund') &&
                       (p.status === 'approved' || p.status === 'paid' || p.status === 'refund' || p.status === 'completed');
              })
              .reduce((sum, p) => sum + (p.amount || 0), 0);
            const totalDepositPaid = payments
              .filter(p => (p as any).payment_type === 'security_deposit' && (p.status === 'approved' || p.status === 'paid'))
              .reduce((sum, p) => sum + (p.amount || 0), 0);
            const isDepositPending = securityDeposit > 0 && totalDepositPaid < securityDeposit;
            const totalPaid = payments
              .filter(p => p.status === 'approved' || p.status === 'paid')
              .reduce((sum, p) => sum + (p.amount || 0), 0);

            // ── Property info ──
            const propName = tenant.current_assignment?.property_name || tenant.assigned_property_name || "";
            const roomNum = tenant.current_assignment?.room_number || tenant.assigned_room_number || "";
            const bedNum = tenant.current_assignment?.bed_number || tenant.assigned_bed_number || "";
            const hasAssignment = !!(tenant.current_assignment || tenant.assigned_room_id);

            return (
              <tr
                key={tenant.id}
                className={`border-b border-gray-200 hover:bg-blue-50 transition-colors group ${rowBg}`}
              >
                {/* ── Sticky: Checkbox ── */}
                <td className={`${rowBg} group-hover:bg-blue-50 w-8 px-2 py-2 text-center border-r border-gray-200`}>
                  <button onClick={() => toggleSelection(String(tenant.id))} className="flex items-center justify-center w-4 h-4 mx-auto">
                    {selectedTenantIds.includes(String(tenant.id)) ? (
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400" />
                    )}
                  </button>
                </td>

                {/* ── Sticky: Actions ── */}
                <td className={`${rowBg} group-hover:bg-blue-100/40 px-1 py-2 border-r border-gray-200 bg-white`}>
                  <div className="flex items-center justify-center gap-1.5">
                   {/* Share credentials icon */}
<button
  onClick={() => {
    setShareModalTenant(tenant);
    setIsShareModalOpen(true);
  }}
  className="text-indigo-500 hover:text-indigo-700 transition-colors"
  title="Share Credentials"
>
  <Share2 className="w-3 h-3" />
</button>
                    {can("edit_tenants") && activeTab !== "deleted" && (
                      <button
                        onClick={async () => {
                          setLoading(true);
                          try {
                            const fullTenant = await getTenant(tenant.id);
                            if (fullTenant.success && fullTenant.data) {
                              setSelectedTenant(fullTenant.data);
                              setIsEditDialogOpen(true);
                            } else toast.error("Failed to load tenant details");
                          } catch (error) {
                            console.error(error);
                            toast.error("Failed to load tenant details");
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Edit Tenant"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    )}
                    {can("manage_tenant_credentials") && activeTab !== "deleted" && (
                      <button
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setCredentialPassword("");
                          setIsCredentialDialogOpen(true);
                        }}
                        className="text-orange-500 hover:text-orange-700 transition-colors"
                        title={tenant.has_credentials ? "Reset Password" : "Create Login"}
                      >
                        <Key className="w-3 h-3" />
                      </button>
                    )}
                    {can("manage_tenant_portal") && activeTab !== "deleted" && (
                      <button onClick={() => handleTogglePortalAccess(tenant)} className="text-purple-500 hover:text-purple-700 transition-colors" title={tenant.portal_access_enabled ? "Disable Portal" : "Enable Portal"}>
                        <Globe className={`w-3 h-3 ${!tenant.portal_access_enabled ? "opacity-50" : ""}`} />
                      </button>
                    )}
                    {can("delete_tenants") && activeTab !== "deleted" && (
                      <button onClick={() => handleDelete(tenant)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete Tenant">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    {activeTab === "deleted" && (
                      <button onClick={() => handleRestoreVacatedTenant(tenant)} className="text-green-500 hover:text-green-700 transition-colors" title="Restore to Vacated">
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>

                {/* ── STATUS (now scrollable) ── */}
                <td className="px-2 py-2 border-r border-gray-200">
                  <div className="flex whitespace-nowrap gap-1">
                    <Badge className={`text-[7px] px-1.5 py-0 h-4 font-semibold ${tenant.is_active ? "bg-emerald-500 text-white" : "bg-gray-400 text-white"}`}>
                      {tenant.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {tenant.portal_access_enabled ? (
                      <Badge variant="outline" className="text-[7px] px-1 py-0 h-4 border-blue-300 text-blue-600 bg-blue-50">
                        <ShieldCheck className="w-2 h-2 mr-0.5" />Portal
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[7px] px-1 py-0 h-4 border-gray-300 text-gray-400">
                        No Portal
                      </Badge>
                    )}
                    {tenant.has_credentials ? (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-green-300 text-green-600 bg-green-50">
                        <LogIn className="w-2 h-2 mr-0.5" />Login
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-orange-300 text-orange-500">
                        No Login
                      </Badge>
                    )}
                  </div>
                </td>

                {/* ── NAME ── */}
                <td className={`${rowBg} group-hover:bg-blue-50/60 px-1 py-1 border-r border-gray-200`}>
                  <Link href={`/admin/tenants/${tenant.id}`} className="flex items-center gap-1.5">
                    {tenant.photo_url ? (
                      <img src={tenant.photo_url} alt="" className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-200 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-[8px]">
                          {tenant.full_name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div
  className="font-medium text-[10px] text-gray-900 whitespace-nowrap leading-tight flex items-center gap-1"
  title={`${tenant.salutation || ""} ${tenant.full_name}`}
>
  <span className="text-gray-900 text-[10px]">
    {tenant.salutation || ""}
  </span>
  <span>{capitalizeWords(tenant.full_name)}</span>
  {isCouple && (
    <span title="Couple Booking" className="text-[8px]">💑</span>
  )}
  {tenant.gender === "Male" && (
    <FaMale
      className="w-2 h-2 text-blue-600 flex-shrink-0"
      title="Male"
    />
  )}
  {tenant.gender === "Female" && (
    <FaFemale
      className="w-2 h-2 text-pink-600 flex-shrink-0"
      title="Female"
    />
  )}
</div>
                    </div>
                  </Link>
                </td>

                {/* ── Contact ── */}
                <td className="px-2 py-2 border-r border-gray-200">
                  <div className="text-[10px] text-gray-700 whitespace-nowrap">
                    <a href={`tel:${tenant.country_code || ""}${tenant.phone || ""}`} className="hover:text-blue-600">
                      {tenant.country_code} {tenant.phone}
                    </a>
                  </div>
                </td>

                {/* ── Check-in Date ── */}
                <td className="px-2 py-2 border-r border-gray-200">
                  <div className="text-[10px] text-gray-700 whitespace-nowrap">
                    {checkInDate}
                  </div>
                </td>

                {/* ── Vacated Date ── */}
                {(activeTab === "vacated" || activeTab === "deleted") && (
                  <td className="px-2 py-2 text-[10px] text-gray-600 whitespace-nowrap border-r border-gray-200">
                    {tenant.has_vacated && vacateRecord?.requested_vacate_date ? (
                      new Date(vacateRecord.requested_vacate_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    ) : "—"}
                  </td>
                )}

                {/* ── Property & Room ── */}
                <td className="px-2 py-2 border-r border-gray-200">
                  {tenant.current_assignment || tenant.assigned_room_id ? (
                    <div className="text-[10px] text-gray-800 flex items-center gap-1 whitespace-nowrap">
                      <span className="truncate max-w-[110px] font-medium">
                        {tenant.current_assignment?.property_name || tenant.assigned_property_name || "Unknown"}
                      </span>
                      <span className="text-gray-400">·</span>
                      <span>
                        Room {tenant.current_assignment?.room_number || tenant.assigned_room_number || "N/A"} · Bed {tenant.current_assignment?.bed_number || tenant.assigned_bed_number || "N/A"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">No assignment</span>
                  )}
                </td>

                {/* ── Monthly Rent ── */}
                <td className="px-2 py-2 whitespace-nowrap border-r border-gray-200">
                  {isPartner ? (
                    <div className="text-[10px] text-gray-400 italic">
                      Shared {tenant.partner_full_name ? `with ${tenant.partner_full_name}` : ''}
                    </div>
                  ) : (
                    <>
                      <div className="text-[11px] font-semibold text-green-600">
                        ₹{monthlyRent.toLocaleString()}
                      </div>
                      {monthlyRent === 0 && (
                        <div className="text-[9px] text-gray-400">Not set</div>
                      )}
                    </>
                  )}
                </td>

                {/* ── Security Deposit ── */}
                <td className="px-2 py-2 whitespace-nowrap border-r border-gray-200">
                  {isPartner ? (
                    <div className="text-[10px] text-gray-400 italic">
                      Shared {tenant.partner_full_name ? `with ${tenant.partner_full_name}` : ''}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-gray-700">
                        ₹{securityDeposit.toLocaleString()}
                      </span>
                      {isDepositPending && (
                        <Badge className="text-[8px] px-1 py-0 h-3.5 bg-orange-100 text-orange-700 border-orange-200 whitespace-nowrap">
                          Pending
                        </Badge>
                      )}
                    </div>
                  )}
                </td>

                {/* ── REFUND AMOUNT (vacated/deleted tab only) ── */}
                {(activeTab === "vacated" || activeTab === "deleted") && (
                  <td className={`${rowBg} group-hover:bg-blue-50/60 px-1 py-1.5 border-r border-gray-200 whitespace-nowrap`}
                    style={{ width: "80px" }}>
                    {refundableAmount > 0 ? (
                      <>
                        <div className="text-[10px] font-semibold text-blue-600">
                          ₹{refundableAmount.toLocaleString()}
                        </div>
                      </>
                    ) : refundableAmount < 0 ? (
                      <>
                        <div className="text-[10px] font-semibold text-orange-600">
                          ₹{Math.abs(refundableAmount).toLocaleString()}
                        </div>
                        <div className="text-[8px] text-orange-400">To collect</div>
                      </>
                    ) : (
                      <>
                        <div className="text-[10px] text-gray-400">₹0</div>
                        <div className="text-[8px] text-gray-400">Settled</div>
                      </>
                    )}
                  </td>
                )}

                {/* ── Payments (includes refund info and pending deposit badge) ── */}
                <td className="px-2 py-2 border-r border-gray-200">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <span className="text-[10px] font-semibold text-green-600">
                      ₹{totalPaid.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      ({payments.length} txn)
                    </span>
                    {(activeTab === "vacated" || activeTab === "deleted") &&
                      totalRefunded > 0 && (
                        <span className="text-[9px] text-blue-600">
                          Refunded: ₹{totalRefunded.toLocaleString()}
                        </span>
                      )}
                    {(() => {
                      const isVacated = tenant.has_vacated === true;
                      const refundableAmount = vacateRecord?.refundable_amount || 0;
                      const remainingRefund = refundableAmount - totalRefunded;
                      const needsRefund = isVacated && remainingRefund > 0;

                      if (needsRefund) {
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-5 px-2 text-[9px] bg-green-100 text-green-700 border-green-200 hover:bg-green-400 whitespace-nowrap rounded-md"
                            onClick={() =>
                              handleVacatedTenantRefund(tenant, remainingRefund)
                            }
                          >
                            <Shield className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                            Pay ₹{remainingRefund.toLocaleString()}
                          </Button>
                        );
                      }
                      return null;
                    })()}
                    {(activeTab === "vacated" || activeTab === "deleted") &&
                      (() => {
                        const isVacated = tenant.has_vacated === true;
                        const refundableAmount = vacateRecord?.refundable_amount || 0;
                        const isFullyRefunded =
                          isVacated &&
                          refundableAmount > 0 &&
                          totalRefunded >= refundableAmount;
                        const isSettledNoRefund =
                          isVacated && refundableAmount === 0;

                        if (isFullyRefunded) {
                          return (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 h-4 bg-green-100 text-green-700 border-green-200 whitespace-nowrap"
                            >
                              Settled
                            </Badge>
                          );
                        }
                        if (isSettledNoRefund) {
                          return (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 h-4 bg-gray-100 text-gray-500 whitespace-nowrap"
                            >
                              No Refund
                            </Badge>
                          );
                        }
                        return null;
                      })()}
                  </div>
                </td>

                {/* ── Location ── */}
                <td className="px-2 py-2 border-r border-gray-200">
                  <div className="text-[10px] text-gray-500 whitespace-nowrap">
                    {[tenant.city, tenant.state].filter(Boolean).join(", ") || "—"}
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
</div>

          {/* ── STICKY PAGINATION BAR ── */}
          {!loading && tenants.length > 0 && (
            <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-sm">
              <PaginationBar />
            </div>
          )}
          {/* ── DIALOGS (unchanged) ── */}
          {/* Add New Tenant <TenantForm onSuccess={handleSuccess} onCancel={() => setIsAddDialogOpen(false)} /> */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent
              className="max-w-3xl h-[65vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl"
              onInteractOutside={(e) => {
                e.preventDefault();
              }}
            >
              {/* Gradient header — responsive padding and height */}
              <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-4 md:px-6 py-3 md:py-4 flex items-start justify-between flex-shrink-0">
                <div>
                  <DialogTitle className="text-sm md:text-base font-semibold text-white">
                    + Add New Tenant
                  </DialogTitle>
                  <p className="text-[10px] md:text-xs text-blue-200 mt-0.5">
                    Fill in tenant details across all sections
                  </p>
                </div>
                <button
                  onClick={() => setIsAddDialogOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form scrolls inside here */}
              <div className="flex-1 overflow-y-auto">
                <TenantForm
                  onSuccess={handleSuccess}
                  onCancel={() => setIsAddDialogOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
          {/* View Dialog */}
          {selectedTenant && (
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
              <DialogContent
                className="max-w-2xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl"
                onInteractOutside={(e) => {
                  e.preventDefault();
                }}
              >
                {/* ── Sticky Gradient Header ───────────────────────────────────────── */}
                <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-4 md:px-6 py-3 flex items-start justify-between flex-shrink-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar */}
                    {selectedTenant.photo_url ? (
                      <img
                        src={selectedTenant.photo_url}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-white/40 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <DialogTitle className="text-sm font-semibold text-white truncate leading-tight">
                        {selectedTenant.salutation
                          ? `${selectedTenant.salutation}. `
                          : ""}
                        {selectedTenant.full_name}
                      </DialogTitle>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <Badge
                          className={`text-[9px] px-1.5 py-0 h-4 ${selectedTenant.is_active ? "bg-emerald-500" : "bg-gray-400"} text-white border-0`}
                        >
                          {selectedTenant.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {selectedTenant.gender && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 h-4 border-white/40 text-white bg-white/20"
                          >
                            {selectedTenant.gender}
                          </Badge>
                        )}
                        {selectedTenant.portal_access_enabled && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 h-4 border-white/40 text-white bg-white/20"
                          >
                            Portal Access
                          </Badge>
                        )}
                        {selectedTenant.has_credentials ? (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 h-4 border-white/40 text-white bg-white/20"
                          >
                            Login Enabled
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 h-4 border-orange-300/60 text-orange-200 bg-orange-500/20"
                          >
                            No Login
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setIsEditDialogOpen(true);
                      }}
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
                      onClick={() => setIsViewDialogOpen(false)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* ── Scrollable Body ──────────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 bg-gray-50/40">
                  {/* ── Personal Information ──────────────────────────────────────── */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
                      <User className="w-3 h-3 text-blue-500" /> Personal
                      Information
                    </h4>
                    <div className="bg-white rounded-lg border border-gray-100 p-3 grid grid-cols-2 gap-x-4 gap-y-2">
                      {[
                        ["Salutation", selectedTenant.salutation || "—"],
                        ["Full Name", selectedTenant.full_name || "—"],
                        ["Gender", selectedTenant.gender || "—"],
                        [
                          "Date of Birth",
                          selectedTenant.date_of_birth
                            ? `${new Date(selectedTenant.date_of_birth).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} (${Math.floor((Date.now() - new Date(selectedTenant.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} yrs)`
                            : "—",
                        ],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                            {label}
                          </p>
                          <p className="text-[11px] font-medium text-gray-800">
                            {value}
                          </p>
                        </div>
                      ))}

                      {/* Emergency contact — full width */}
                      {(selectedTenant.emergency_contact_name ||
                        selectedTenant.emergency_contact_phone) && (
                        <div className="col-span-2 pt-1 border-t border-gray-100 mt-1">
                          <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400 mb-0.5">
                            Emergency Contact
                          </p>
                          <p className="text-[11px] font-medium text-gray-800">
                            {selectedTenant.emergency_contact_name || "—"}
                            {selectedTenant.emergency_contact_relation
                              ? ` · ${selectedTenant.emergency_contact_relation}`
                              : ""}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {selectedTenant.emergency_contact_phone || "—"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Contact Information ───────────────────────────────────────── */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
                      <Phone className="w-3 h-3 text-indigo-500" /> Contact
                      Information
                    </h4>
                    <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                      {[
                        ["Email", selectedTenant.email],
                        [
                          "Phone",
                          `${selectedTenant.country_code || ""} ${selectedTenant.phone || ""}`.trim(),
                        ],
                        [
                          "Address",
                          [
                            selectedTenant.address,
                            selectedTenant.city,
                            selectedTenant.state,
                            selectedTenant.pincode
                              ? `- ${selectedTenant.pincode}`
                              : "",
                          ]
                            .filter(Boolean)
                            .join(", "),
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex justify-between text-xs gap-2"
                        >
                          <span className="text-gray-500 font-medium flex-shrink-0">
                            {label}
                          </span>
                          <span className="text-gray-800 text-right">
                            {value || "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Occupation & Work ─────────────────────────────────────────── */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
                      <Briefcase className="w-3 h-3 text-green-600" /> Occupation
                      & Work
                    </h4>
                    <div className="bg-white rounded-lg border border-gray-100 p-3 grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                          Category
                        </p>
                        {selectedTenant.occupation_category ? (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 mt-0.5"
                          >
                            {selectedTenant.occupation_category}
                          </Badge>
                        ) : (
                          <p className="text-[11px] font-medium text-gray-800">
                            —
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                          Sub-Category / Role
                        </p>
                        <p className="text-[11px] font-medium text-gray-800">
                          {selectedTenant.exact_occupation ||
                            selectedTenant.occupation ||
                            "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                          Organization
                        </p>
                        <p className="text-[11px] font-medium text-gray-800">
                          {selectedTenant.organization || "—"}
                        </p>
                      </div>

                      {/* Conditional fields based on occupation category */}
                      {selectedTenant.occupation_category === "Student" ? (
                        <>
                          <div>
                            <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                              Course Duration
                            </p>
                            <p className="text-[11px] font-medium text-gray-800">
                              {selectedTenant.course_duration?.replace(
                                "_",
                                " ",
                              ) || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                              Student ID
                            </p>
                            <p className="text-[11px] font-medium text-gray-800">
                              {selectedTenant.student_id || "—"}
                            </p>
                          </div>
                        </>
                      ) : selectedTenant.occupation_category ===
                        "Government Employee" ? (
                        <div>
                          <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                            Employee / Service ID
                          </p>
                          <p className="text-[11px] font-medium text-gray-800">
                            {selectedTenant.employee_id || "—"}
                          </p>
                        </div>
                      ) : selectedTenant.occupation_category ===
                        "Freelancer / Self-Employed" ? (
                        <div className="col-span-2">
                          <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                            Portfolio / Website
                          </p>
                          {selectedTenant.portfolio_url ? (
                            <a
                              href={selectedTenant.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-blue-600 hover:underline"
                            >
                              {selectedTenant.portfolio_url}
                            </a>
                          ) : (
                            <p className="text-[11px] font-medium text-gray-800">
                              —
                            </p>
                          )}
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                              Experience
                            </p>
                            <p className="text-[11px] font-medium text-gray-800">
                              {selectedTenant.years_of_experience
                                ? `${selectedTenant.years_of_experience} yrs`
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                              Monthly Income
                            </p>
                            <p className="text-[11px] font-medium text-gray-800">
                              {selectedTenant.monthly_income
                                ? `₹${Number(selectedTenant.monthly_income).toLocaleString("en-IN")}`
                                : "—"}
                            </p>
                          </div>
                        </>
                      )}

                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                          Work Mode
                        </p>
                        <p className="text-[11px] font-medium text-gray-800">
                          {selectedTenant.work_mode || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                          Shift Timing
                        </p>
                        <p className="text-[11px] font-medium text-gray-800">
                          {selectedTenant.shift_timing || "—"}
                        </p>
                      </div>

                      {/* Room preferences */}
                      <div className="col-span-2 pt-1 border-t border-gray-100 mt-1">
                        <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400 mb-1">
                          Room Preferences
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                          {selectedTenant.preferred_sharing ? (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 h-4"
                            >
                              {selectedTenant.preferred_sharing} sharing
                            </Badge>
                          ) : null}
                          {selectedTenant.preferred_room_type ? (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 h-4"
                            >
                              {selectedTenant.preferred_room_type}
                            </Badge>
                          ) : null}
                          {!selectedTenant.preferred_sharing &&
                            !selectedTenant.preferred_room_type && (
                              <p className="text-[11px] text-gray-400">—</p>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Property, Check-in & Terms ───────────────────────────────── */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
                      <Building className="w-3 h-3 text-indigo-500" /> Property,
                      Check-in & Terms
                    </h4>
                    <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-3">
                      {/* Property + Check-in row */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                            Assigned Property
                          </p>
                          <p className="text-[11px] font-medium text-gray-800">
                            {selectedTenant.property_name ||
                              (selectedTenant.property_id
                                ? `Property #${selectedTenant.property_id}`
                                : "—")}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                            Check-in Date
                          </p>
                          <p className="text-[11px] font-medium text-gray-800">
                            {selectedTenant.check_in_date
                              ? new Date(
                                  selectedTenant.check_in_date,
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Rental terms */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                        <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-2">
                          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" /> Lock-in
                          </p>
                          <p className="text-[11px] font-semibold text-gray-800">
                            {selectedTenant.lockin_period_months ?? 0} months
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Penalty:{" "}
                            {selectedTenant.lockin_penalty_type === "percentage"
                              ? "%"
                              : "₹"}
                            {selectedTenant.lockin_penalty_amount ?? 0} (
                            {selectedTenant.lockin_penalty_type || "fixed"})
                          </p>
                        </div>
                        <div className="bg-amber-50/70 border border-amber-100 rounded-lg p-2">
                          <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> Notice
                          </p>
                          <p className="text-[11px] font-semibold text-gray-800">
                            {selectedTenant.notice_period_days ?? 0} days
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Penalty:{" "}
                            {selectedTenant.notice_penalty_type === "percentage"
                              ? "%"
                              : "₹"}
                            {selectedTenant.notice_penalty_amount ?? 0} (
                            {selectedTenant.notice_penalty_type || "fixed"})
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Current Booking & Payments ────────────────────────────────── */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
                      <Building className="w-3 h-3 text-purple-500" /> Current
                      Booking & Payments
                    </h4>
                    {(selectedTenant.bookings ?? []).filter(
                      (b) => b.status === "active",
                    ).length > 0 ? (
                      (selectedTenant.bookings ?? [])
                        .filter((b) => b.status === "active")
                        .map((booking) => (
                          <div
                            key={booking.id}
                            className="bg-white rounded-lg border border-gray-100 p-3 space-y-2"
                          >
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                              <div>
                                <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                                  Property
                                </p>
                                <p className="text-[11px] font-medium text-gray-800">
                                  {booking.properties?.name || "—"}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {booking.properties?.city},{" "}
                                  {booking.properties?.state}
                                </p>
                              </div>
                              {booking.room && (
                                <div>
                                  <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                                    Room
                                  </p>
                                  <p className="text-[11px] font-medium text-gray-800">
                                    Room {booking.room.room_number}
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    {booking.room.sharing_type} sharing · Floor{" "}
                                    {booking.room.floor || "—"}
                                  </p>
                                </div>
                              )}
                              <div>
                                <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                                  Monthly Rent
                                </p>
                                <p className="text-[12px] font-bold text-green-600">
                                  ₹{booking.monthly_rent?.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Payment history */}
                            {selectedTenant.payments &&
                              selectedTenant.payments.length > 0 && (
                                <div className="pt-2 border-t border-gray-100">
                                  <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400 mb-1.5">
                                    Payment History
                                  </p>
                                  <div className="space-y-1">
                                    {selectedTenant.payments
                                      .slice(0, 5)
                                      .map((payment) => (
                                        <div
                                          key={payment.id}
                                          className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0"
                                        >
                                          <div>
                                            <p className="text-[11px] text-gray-800">
                                              {payment.description || "Payment"}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                              {new Date(
                                                payment.payment_date,
                                              ).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                              })}
                                              {" · "}
                                              {payment.payment_method}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-[11px] font-semibold text-gray-900">
                                              ₹{payment.amount?.toLocaleString()}
                                            </p>
                                            <Badge
                                              className={`text-[9px] px-1 py-0 h-3.5 border-0 ${payment.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                                            >
                                              {payment.status}
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))
                    ) : (
                      <div className="bg-white rounded-lg border border-gray-100 p-4 text-center text-[11px] text-gray-400">
                        No active booking
                      </div>
                    )}
                  </div>

                  {/* ── Documents ────────────────────────────────────────────────── */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
                      <FileText className="w-3 h-3 text-amber-500" /> Documents
                    </h4>
                    <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-3">
                      {/* Required docs — thumbnail grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "ID Proof", url: selectedTenant.id_proof_url },
                          {
                            label: "Address Proof",
                            url: selectedTenant.address_proof_url,
                          },
                          { label: "Photograph", url: selectedTenant.photo_url },
                        ].map(({ label, url }) =>
                          url ? (
                            <a
                              key={label}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            >
                              {/\.(jpeg|jpg|png|gif|webp|bmp)$/i.test(url) ? (
                                <img
                                  src={url}
                                  alt={label}
                                  className="h-12 w-full object-contain rounded"
                                />
                              ) : (
                                <div className="h-12 w-full flex items-center justify-center bg-gray-100 rounded">
                                  <FileText className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                              <span className="text-[9px] text-gray-500 group-hover:text-blue-600 text-center leading-tight">
                                {label}
                              </span>
                              <span className="text-[9px] text-blue-400 flex items-center gap-0.5">
                                <Eye className="h-2.5 w-2.5" />
                                View
                              </span>
                            </a>
                          ) : (
                            <div
                              key={label}
                              className="flex flex-col items-center gap-1 p-2 border border-dashed border-gray-200 rounded-lg bg-gray-50"
                            >
                              <div className="h-12 w-full flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-gray-300" />
                              </div>
                              <span className="text-[9px] text-gray-400 text-center">
                                {label}
                              </span>
                              <span className="text-[9px] text-red-400">
                                Not uploaded
                              </span>
                            </div>
                          ),
                        )}
                      </div>

                      {/* Additional documents */}
                      {selectedTenant.additional_documents &&
                        selectedTenant.additional_documents.length > 0 && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400 mb-1.5">
                              Additional Documents
                            </p>
                            <div className="space-y-1">
                              {selectedTenant.additional_documents.map(
                                (doc, i) => (
                                  <a
                                    key={i}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-1.5 border border-gray-100 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-medium text-gray-700 truncate group-hover:text-blue-700">
                                          {doc.filename}
                                        </p>
                                        {doc.uploaded_at && (
                                          <p className="text-[9px] text-gray-400">
                                            {new Date(
                                              doc.uploaded_at,
                                            ).toLocaleDateString("en-IN", {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                            })}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-[9px] text-blue-500 flex items-center gap-0.5 flex-shrink-0 ml-2">
                                      <Eye className="h-2.5 w-2.5" />
                                      View
                                    </span>
                                  </a>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* ── Portal & Login ────────────────────────────────────────────── */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> Portal
                      & Login
                    </h4>
                    <div className="bg-white rounded-lg border border-gray-100 p-3 grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                          Portal Access
                        </p>
                        <Badge
                          className={`text-[9px] px-1.5 py-0 mt-0.5 border-0 font-semibold ${selectedTenant.portal_access_enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {selectedTenant.portal_access_enabled
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                          Login Status
                        </p>
                        {selectedTenant.has_credentials ? (
                          <Badge className="text-[9px] px-1.5 py-0 mt-0.5 bg-emerald-100 text-emerald-700 border-0 font-semibold">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="text-[9px] px-1.5 py-0 mt-0.5 bg-orange-100 text-orange-600 border-0 font-semibold">
                            Not Created
                          </Badge>
                        )}
                      </div>
                      <div className="col-span-2">
                        <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">
                          Login Email
                        </p>
                        <p className="text-[11px] font-medium text-gray-800">
                          {selectedTenant.credential_email ||
                            selectedTenant.email ||
                            "No login configured"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── System Information ────────────────────────────────────────── */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
                      <ShieldCheck className="w-3 h-3 text-gray-400" /> System
                      Information
                    </h4>
                    <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-1.5">
                      {[
                        ["Tenant ID", `#${selectedTenant.id}`],
                        [
                          "Created At",
                          selectedTenant.created_at
                            ? new Date(
                                selectedTenant.created_at,
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—",
                        ],
                        [
                          "Last Updated",
                          selectedTenant.updated_at
                            ? new Date(
                                selectedTenant.updated_at,
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—",
                        ],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between text-xs">
                          <span className="text-gray-500 font-medium">
                            {label}
                          </span>
                          <span className="text-gray-800">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* end scrollable body */}

                {/* ── Sticky Footer ────────────────────────────────────────────────── */}
                <div className="border-t bg-white px-4 py-2.5 flex items-center justify-between flex-shrink-0">
                  <p className="text-[10px] text-gray-400">
                    ID:{" "}
                    <span className="font-medium text-gray-600">
                      #{selectedTenant.id}
                    </span>
                    {selectedTenant.check_in_date && (
                      <>
                        {" "}
                        · Check-in:{" "}
                        <span className="font-medium text-gray-600">
                          {new Date(
                            selectedTenant.check_in_date,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsViewDialogOpen(false)}
                      className="h-7 text-[10px] px-3 border-gray-200 text-gray-500"
                    >
                      Close
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setIsEditDialogOpen(true);
                      }}
                      className="h-7 text-[10px] px-3 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg"
                    >
                      <Edit className="h-3 w-3 mr-1" /> Edit Tenant
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {/* Edit Dialog */}
          {selectedTenant && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent
                className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl"
                onInteractOutside={(e) => {
                  e.preventDefault();
                }}
              >
                {/* Sticky Gradient Header */}
                <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0">
                  <div>
                    <DialogTitle className="text-sm md:text-base font-semibold text-white">
                      Edit Tenant: {selectedTenant.full_name}
                    </DialogTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setSelectedTenant(null);
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto">
                  <TenantForm
                    tenant={selectedTenant}
                    onSuccess={handleSuccess}
                    onCancel={() => {
                      setIsEditDialogOpen(false);
                      setSelectedTenant(null);
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
          {/* Credential Dialog */}
          {selectedTenant && (
            <Dialog
              open={isCredentialDialogOpen}
              onOpenChange={setIsCredentialDialogOpen}
            >
              <DialogContent
                className="max-w-sm rounded-xl"
                onInteractOutside={(e) => {
                  e.preventDefault();
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => {
                    setIsCredentialDialogOpen(false);
                    setCredentialPassword("");
                    setSelectedTenant(null);
                  }}
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-x"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                  <span className="sr-only">Close</span>
                </button>

                <DialogHeader>
                  <DialogTitle className="text-sm">
                    {selectedTenant.has_credentials
                      ? "Reset Password"
                      : "Create Login Credentials"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Tenant Name</span>
                    <span className="text-gray-800">
                      {selectedTenant.full_name}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Email</span>
                    <span className="text-gray-800">{selectedTenant.email}</span>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">
                      {selectedTenant.has_credentials
                        ? "New Password"
                        : "Password"}{" "}
                      *
                    </Label>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={credentialPassword}
                      onChange={(e) => setCredentialPassword(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <p className="text-[10px] text-gray-400">
                      Minimum 6 characters required
                    </p>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => {
                      setIsCredentialDialogOpen(false);
                      setCredentialPassword("");
                      setSelectedTenant(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs h-8 bg-blue-600 hover:bg-blue-700"
                    onClick={handleCredentialSubmit}
                    disabled={credentialLoading}
                  >
                    {credentialLoading
                      ? "Processing..."
                      : selectedTenant.has_credentials
                        ? "Reset Password"
                        : "Create Login"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <TenantImportModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            onImport={handleImportFile}
            importing={importing}
            currentTab={activeTab}
          />
{/* ── Share Modal ── */}
{shareModalTenant && (
  <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
    <DialogContent className="max-w-sm rounded-xl" onInteractOutside={(e) => e.preventDefault()}>
      <DialogHeader>
        <DialogTitle className="text-sm">Share User Details</DialogTitle>
      </DialogHeader>
      <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-xs mb-2">
        <p><span className="font-semibold">Name:</span> {shareModalTenant.salutation} {shareModalTenant.full_name}</p>
        <p><span className="font-semibold">Email:</span> {shareModalTenant.email}</p>
        <p><span className="font-semibold">Username:</span> {shareModalTenant.credential_email || shareModalTenant.email || "—"}</p>
        <p><span className="font-semibold">Password:</span> Not available</p>
        <p><span className="font-semibold">Phone:</span> {shareModalTenant.country_code} {shareModalTenant.phone}</p>
      </div>
      {(() => {
        const name = `${shareModalTenant.salutation || ""} ${shareModalTenant.full_name}`.trim();
        const msg = `Hi ${name},\nYour tenant portal details:\nEmail: ${shareModalTenant.email}\nUsername: ${shareModalTenant.credential_email || shareModalTenant.email || "—"}\nPlease login to your portal.`;
        return (
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`mailto:${shareModalTenant.email}?subject=Your Portal Credentials&body=${encodeURIComponent(msg)}`}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-lg"
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
            <a
              href={`https://wa.me/${(shareModalTenant.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 px-3 rounded-lg"
            >
              <Phone className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <a
              href={`sms:${shareModalTenant.phone}?body=${encodeURIComponent(msg)}`}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 px-3 rounded-lg"
            >
              <Phone className="w-3.5 h-3.5" /> SMS
            </a>
            <button
              onClick={() => { navigator.clipboard.writeText(msg); toast.success("Copied!"); }}
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white text-xs font-semibold py-2 px-3 rounded-lg"
            >
              <FileText className="w-3.5 h-3.5" /> Copy
            </button>
          </div>
        );
      })()}
      <div className="flex justify-end mt-1">
        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setIsShareModalOpen(false)}>Close</Button>
      </div>
    </DialogContent>
  </Dialog>
)}
          
          {selectedVacatedTenant && (
            <VacatedTenantPaymentModal
              open={paymentModalOpen}
              onOpenChange={setPaymentModalOpen}
              tenant={selectedVacatedTenant}
              amount={paymentModalAmount}
              type={paymentModalType}
              onSuccess={handlePaymentModalSuccess}
              className="max-h-[300px]"
            />
          )}
        </Card>
      </div>
    );
  }
