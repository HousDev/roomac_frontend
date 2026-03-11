// components/admin/tenants/tenants-client.tsx
"use client";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Download, CheckCircle, XCircle, UserX, Trash2, Filter, SlidersHorizontal, MoreVertical, Eye, Edit, Key, Mail, Phone, Building, Bed, MapPin, Users, FileText, IndianRupee, CheckSquare, Square, Search, X, Briefcase, Building2, Globe, LogIn, ShieldCheck, Users2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Upload, AlertTriangle, Calendar, Clock, User, } from "lucide-react";
import { toast } from "sonner";
import { deleteTenant, bulkDeleteTenants, bulkUpdateTenantStatus, bulkUpdateTenantPortalAccess, updateTenantSimple, createCredential, resetCredential, exportTenantsToExcel, listTenants, type Tenant, type TenantFilters, } from "@/lib/tenantApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/admin/data-table";
import type { Column, FilterConfig, BulkAction, ActionButton } from "@/components/admin/data-table";
import { TenantForm } from "@/components/admin/tenants/tenant-form";
import TenantImportModal from "./tenant-import-modal";

interface TenantsClientProps {
  initialData: Tenant[];
  initialLoading: boolean;
  initialFilters: any;
}

// Pagination constants
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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
const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

const filtersRef = useRef<TenantFilters>({});

const [showImportModal, setShowImportModal] = useState(false);
const [importing, setImporting] = useState(false);


const [filters, setFiltersState] = useState<TenantFilters>({});
  // Column search for the header
  const [columnSearch, setColumnSearch] = useState({
    name: "",
    contact: "",
    occupation: "",
    property: "",
    payments: "",
    status: "",
  });

  // Toggle selection
  const toggleSelection = useCallback((tenantId: string) => {
    setSelectedTenantIds(prev => {
      if (prev.includes(tenantId)) {
        return prev.filter(id => id !== tenantId);
      } else {
        return [...prev, tenantId];
      }
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedTenantIds.length === tenants.length && tenants.length > 0) {
      setSelectedTenantIds([]);
    } else {
      const allIds = tenants.map(tenant => String(tenant.id));
      setSelectedTenantIds(allIds);
    }
  }, [tenants, selectedTenantIds]);

  // Load tenants
  const loadTenants = useCallback(async (customFilters?: TenantFilters) => {
    setLoading(true);
    try {
      const useFilters = customFilters || filtersRef.current;
      const res = await listTenants(useFilters);
      if (res?.success && Array.isArray(res.data)) {
        setTenants(res.data);
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
    }
  }, []);

  // Initialize
  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  // Handle column search
 const handleColumnSearch = useCallback(() => {
    const newFilters: TenantFilters = {};
    if (columnSearch.name) {
      newFilters.search = columnSearch.name;
    } else if (columnSearch.contact) {
      newFilters.search = columnSearch.contact;
    } else if (columnSearch.property) {
      newFilters.search = columnSearch.property;
    }
    if (columnSearch.occupation) {
      newFilters.occupation_category = columnSearch.occupation;
    }
    if (columnSearch.status) {
      const s = columnSearch.status.toLowerCase();
      if (s === 'active' || s === 'inactive') {
        newFilters.is_active = s === 'active' ? 'true' : 'false';
      } else if (s === 'portal' || s === 'portal access') {
        newFilters.portal_access_enabled = 'true';
      } else if (s === 'no portal') {
        newFilters.portal_access_enabled = 'false';
      } else if (s === 'login' || s === 'login enabled') {
        newFilters.has_credentials = 'true';
      } else if (s === 'no login') {
        newFilters.has_credentials = 'false';
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

// Add import file handler
const handleImportFile = async (file: File) => {
  setImporting(true);
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/tenants/import`, {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (result.success) {
      toast.success(`Successfully imported ${result.count} tenants`);
      setShowImportModal(false);
      await loadTenants(); // Refresh the tenants list
      
      if (result.errors && result.errors.length > 0) {
        console.warn('Import errors:', result.errors);
        // You could show these in a separate dialog if needed
      }
    } else {
      throw new Error(result.message || 'Import failed');
    }
  } catch (error: any) {
    console.error('Import error:', error);
    toast.error(error.message || 'Failed to import tenants');
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
  const handleFilterChange = useCallback((newFilters: TenantFilters) => {
    filtersRef.current = newFilters;
    setFiltersState(newFilters);
    loadTenants(newFilters);
  }, [loadTenants]);

  // Clear all filters
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
  }, [loadTenants]);

  // Clear sidebar filters only
  const clearSidebarFilters = useCallback(() => {
    const emptyFilters = {
      search: filters.search || "",
      is_active: "any",
      portal_access_enabled: "",
      has_credentials: "",
      gender: "",
      occupation_category: "",
      city: "",
      state: "",
      preferred_sharing: "",
    };
    filtersRef.current = emptyFilters;
    setFiltersState(emptyFilters);
    loadTenants(emptyFilters);
    setIsFilterSidebarOpen(false);
  }, [filters.search, loadTenants]);

  // Handle delete
  const handleDelete = useCallback(async (tenant: Tenant) => {
    if (!confirm(`Are you sure you want to delete ${tenant.full_name}?`)) return;
    try {
      const res = await deleteTenant(tenant.id as any);
      if (res?.success) {
        toast.success("Tenant deleted successfully");
        loadTenants();
      } else {
        toast.error(res?.message || "Failed to delete tenant");
      }
    } catch {
      toast.error("Failed to delete tenant");
    }
  }, [loadTenants]);

  // Bulk delete
  const handleBulkDelete = useCallback(async (selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      toast.error("No tenants selected");
      return;
    }
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} tenants?`)) return;
    try {
      const res = await bulkDeleteTenants(selectedIds);
      if (res?.success) {
        toast.success(`${selectedIds.length} tenants deleted successfully`);
        setSelectedTenantIds([]);
        loadTenants();
      } else {
        toast.error(res?.message || "Failed to delete tenants");
      }
    } catch {
      toast.error("Failed to delete tenants");
    }
  }, [loadTenants]);

  // Bulk status change
  const handleBulkStatusChange = useCallback(async (selectedIds: string[], status: boolean = true) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await bulkUpdateTenantStatus(selectedIds, status);
      if (res?.success) {
        toast.success(`${selectedIds.length} tenants ${status ? 'activated' : 'deactivated'}`);
        setSelectedTenantIds([]);
        loadTenants();
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
  }, [loadTenants]);

  // Bulk portal access
  const handleBulkPortalAccess = useCallback(async (selectedIds: string[], enabled: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await bulkUpdateTenantPortalAccess(selectedIds, enabled);
      if (res?.success) {
        toast.success(`${selectedIds.length} tenants portal access ${enabled ? 'enabled' : 'disabled'}`);
        setSelectedTenantIds([]);
        loadTenants();
      } else {
        toast.error(res?.message || "Failed to update portal access");
      }
    } catch {
      toast.error("Failed to update portal access");
    }
  }, [loadTenants]);

  // Toggle portal access for single tenant
  const handleTogglePortalAccess = useCallback(async (tenant: Tenant) => {
    try {
      const res = await updateTenantSimple(tenant.id as any, {
        portal_access_enabled: !tenant.portal_access_enabled,
      });
      if (res?.success) {
        toast.success(`Portal access ${!tenant.portal_access_enabled ? 'enabled' : 'disabled'}`);
        loadTenants();
      } else {
        toast.error(res?.message || "Failed to update portal access");
      }
    } catch {
      toast.error("Failed to update portal access");
    }
  }, [loadTenants]);

  // Handle success actions
  const handleSuccess = useCallback(() => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsViewDialogOpen(false);
    setSelectedTenant(null);
    loadTenants();
  }, [loadTenants]);

  // Export to Excel
  const handleExportToExcel = useCallback(async () => {
    try {
      const exportFilters = Object.fromEntries(
        Object.entries(filtersRef.current).filter(([_, v]) => v !== "")
      );
      const res = await exportTenantsToExcel(exportFilters);
      if (res.success) {
        toast.success("Exported successfully");
      } else {
        toast.error("Export failed");
      }
    } catch {
      toast.error("Export failed");
    }
  }, []);

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
        res = await resetCredential(selectedTenant.id as any, credentialPassword);
      } else {
        res = await createCredential(
          selectedTenant.id as any,
          selectedTenant.email,
          credentialPassword
        );
      }
      if (res?.success) {
        toast.success(selectedTenant.has_credentials ? "Password reset successfully" : "Login credentials created");
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

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    const main = Object.values(filters).filter(v => v !== "").length;
    return main;
  }, [filters]);

   const filteredTenants = useMemo(() => {
    let filtered = tenants;
    if (columnSearch.name) {
      const q = columnSearch.name.toLowerCase();
      filtered = filtered.filter(t => t.full_name?.toLowerCase().includes(q));
    }
    if (columnSearch.contact) {
      const q = columnSearch.contact.toLowerCase();
      filtered = filtered.filter(t =>
        t.email?.toLowerCase().includes(q) || t.phone?.toLowerCase().includes(q)
      );
    }
    if (columnSearch.occupation) {
      const q = columnSearch.occupation.toLowerCase();
      filtered = filtered.filter(t =>
        t.occupation_category?.toLowerCase().includes(q) ||
        t.exact_occupation?.toLowerCase().includes(q) ||
        t.occupation?.toLowerCase().includes(q)
      );
    }
    if (columnSearch.property) {
      const q = columnSearch.property.toLowerCase();
      filtered = filtered.filter(t =>
        t.current_assignment?.property_name?.toLowerCase().includes(q) ||
        t.assigned_property_name?.toLowerCase().includes(q) ||
        t.current_assignment?.room_number?.toString().includes(q)
      );
    }
    if (columnSearch.status) {
      const q = columnSearch.status.toLowerCase();
      filtered = filtered.filter(t => {
        if (q === 'active') return t.is_active === true;
        if (q === 'inactive') return t.is_active === false;
        if (q === 'portal') return t.portal_access_enabled === true;
        if (q === 'no portal') return t.portal_access_enabled === false;
        if (q === 'login') return t.has_credentials === true;
        if (q === 'no login') return t.has_credentials === false;
        return (
          (t.is_active ? 'active' : 'inactive').includes(q) ||
          (t.portal_access_enabled ? 'portal' : 'no portal').includes(q) ||
          (t.has_credentials ? 'login' : 'no login').includes(q)
        );
      });
    }
    return filtered;
  }, [tenants, columnSearch]);

  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTenants.slice(start, start + pageSize);
  }, [filteredTenants, currentPage, pageSize]);
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

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  // Memoized columns with inline rendering
const columns: Column<Tenant>[] = useMemo(() => [    {
      key: "full_name",
      label: "Name",
      sortable: true,
      render: (tenant) => (
        <div className="flex items-center gap-2 min-w-0">
          {tenant.photo_url ? (
            <img src={tenant.photo_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
            
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-semibold text-[10px]">{tenant.full_name?.charAt(0)}</span>
              
            </div>
          )}
          <div className="min-w-0">
            <div className="font-medium text-xs text-gray-900 truncate">{tenant.full_name}</div>
            <div className="text-[10px] text-gray-400 capitalize">{tenant.gender?.toLowerCase()}</div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (tenant) => (
        <div className="space-y-0.5 min-w-0">
          <div className="text-[10px] text-gray-700 truncate flex items-center gap-1">
            <Mail className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{tenant.email}</span>
          </div>
          <div className="text-[10px] text-gray-500 flex items-center gap-1">
            <Phone className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
            <span>{tenant.country_code} {tenant.phone}</span>
          </div>
          {tenant.city && (
            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{tenant.city}, {tenant.state}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "occupation",
      label: "Occupation",
      sortable: true,
      render: (tenant) => (
        <div className="space-y-0.5">
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-medium border-blue-200 text-blue-700 bg-blue-50">
            {tenant.occupation_category || "Other"}
          </Badge>
          <div className="text-[10px] text-gray-600 leading-tight">{tenant.exact_occupation || tenant.occupation || "Not specified"}</div>
        </div>
      ),
    },
    {
      key: "property",
      label: "Property & Room",
      render: (tenant) => {
        if (tenant.current_assignment || tenant.assigned_room_id) {
          const assignment = tenant.current_assignment || {
            property_name: tenant.assigned_property_name,
            room_number: tenant.assigned_room_number,
            bed_number: tenant.assigned_bed_number
          };
          return (
            <div className="space-y-0.5">
              <div className="text-[10px] font-medium text-gray-800 flex items-center gap-1">
                <Building className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{assignment.property_name || 'Unknown Property'}</span>
              </div>
              <div className="text-[10px] text-gray-500 flex items-center gap-1">
                <Bed className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                <span>Room {assignment.room_number || 'N/A'} · Bed {assignment.bed_number || 'N/A'}</span>
              </div>
              <Badge className="text-[9px] px-1.5 py-0 h-4 bg-green-50 text-green-700 border-green-200 border">
                <CheckCircle className="w-2 h-2 mr-0.5" />Assigned
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
      render: (tenant) => {
        const payments = tenant.payments || [];
        const paid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
        const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
        return (
          <div className="space-y-0.5">
            <div className="text-[10px] font-semibold text-green-600">₹{paid.toLocaleString()}</div>
            {pending > 0 && (
              <div className="text-[10px] text-red-500">₹{pending.toLocaleString()}</div>
            )}
            <div className="text-[9px] text-gray-400">{payments.length} txn</div>
          </div>
        );
      },
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      filterable: true,
      render: (tenant) => (
        <div className="flex flex-wrap gap-1">
          <Badge className={`text-[9px] px-1.5 py-0 h-4 font-semibold ${tenant.is_active ? "bg-emerald-500 text-white" : "bg-gray-400 text-white"}`}>
            {tenant.is_active ? "Active" : "Inactive"}
          </Badge>
          {tenant.portal_access_enabled ? (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-blue-300 text-blue-600 bg-blue-50">
              <ShieldCheck className="w-2 h-2 mr-0.5" />Portal
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-gray-300 text-gray-400">
              No Portal
            </Badge>
          )}
          {tenant.has_credentials ? (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-green-300 text-green-600 bg-green-50">
              <LogIn className="w-2 h-2 mr-0.5" />Login
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-orange-300 text-orange-500">
              No Login
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (tenant) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100">
              <MoreVertical className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-xs">
            <DropdownMenuItem className="text-xs" onClick={() => { setSelectedTenant(tenant); setIsViewDialogOpen(true); }}>
              <Eye className="w-3 h-3 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={() => { setSelectedTenant(tenant); setIsEditDialogOpen(true); }}>
              <Edit className="w-3 h-3 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={() => { setSelectedTenant(tenant); setCredentialPassword(""); setIsCredentialDialogOpen(true); }}>
              <Key className="w-3 h-3 mr-2" /> {tenant.has_credentials ? "Reset Password" : "Create Login"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={() => handleTogglePortalAccess(tenant)}>
              <Globe className="w-3 h-3 mr-2" /> {tenant.portal_access_enabled ? "Disable Portal" : "Enable Portal"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-red-600" onClick={() => handleDelete(tenant)}>
              <Trash2 className="w-3 h-3 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [handleDelete, handleTogglePortalAccess]);

  // Memoized table filters
  const tableFilters: FilterConfig[] = useMemo(() => [
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
  ], []);

  // Memoized bulk actions
  const bulkActions: BulkAction[] = useMemo(() => [
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
      confirmMessage: "Are you sure you want to delete the selected tenants?",
    },
  ], [handleBulkStatusChange, handleBulkPortalAccess, handleBulkDelete]);

  // FilterSelect component for sidebar
  const FilterSelect = ({ label, value, onChange, options, placeholder = "All" }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
  }) => {
    const validOptions = options.filter(opt => opt.value !== "");
    return (
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-600">{label}</Label>
        <Select value={value || "all"} onValueChange={(value) => onChange(value === "all" ? "" : value)}>
          <SelectTrigger className="h-8 text-xs border-gray-200">
            <SelectValue>{value ? validOptions.find(opt => opt.value === value)?.label : placeholder}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">{placeholder}</SelectItem>
            {validOptions.map((option) => (
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
  const handleBulkAction = useCallback(async (action: BulkAction, selectedIds: string[]) => {
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
  }, []);

  // Apply filters from sidebar
  const applyFilters = () => {
    loadTenants(filters);
    setIsFilterSidebarOpen(false);
  };

  // Handle column search change
  const handleColumnSearchChange = useCallback((column: keyof typeof columnSearch, value: string) => {
    setColumnSearch(prev => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  // ── PAGINATION COMPONENT ──
  const PaginationBar = () => (
    <div className="flex items-center justify-between px-3 py-2 border-t bg-white text-xs">
      {/* Left: record count + page size selector */}
      <div className="flex items-center gap-2 text-gray-500">
        <span className="hidden sm:inline">
          {totalTenants === 0 ? "No records" : `Showing ${startRecord}–${endRecord} of ${totalTenants} tenants`}
        </span>
        <span className="sm:hidden text-[10px]">{startRecord}–{endRecord}/{totalTenants}</span>
        <div className="flex items-center gap-1 ml-2">
          <span className="text-gray-400 hidden sm:inline">Rows:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              setPageSize(Number(val));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-6 w-14 text-[10px] border-gray-200 px-1">
              <SelectValue>{pageSize}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)} className="text-xs">{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right: page navigation */}
      <div className="flex items-center gap-0.5">
        {/* First page */}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => goToPage(1)} disabled={currentPage === 1} title="First page">
          <ChevronsLeft className="w-3 h-3" />
        </Button>
        {/* Prev page */}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} title="Previous page">
          <ChevronLeft className="w-3 h-3" />
        </Button>
        {/* Page number buttons */}
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
                <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-[10px]">…</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="icon"
                  className={`h-6 w-6 text-[10px] ${currentPage === page ? "bg-blue-600 text-white" : ""}`}
                  onClick={() => goToPage(page as number)}
                >
                  {page}
                </Button>
              )
            );
          })()}
        </div>
        {/* xs: just show current/total */}
        <span className="sm:hidden text-[10px] text-gray-500 px-1">{currentPage}/{totalPages}</span>
        {/* Next page */}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} title="Next page">
          <ChevronRight className="w-3 h-3" />
        </Button>
        {/* Last page */}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} title="Last page">
          <ChevronsRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );

  return (
<Card className="flex flex-col  max-h-[570px] md:max-h-[620px] overflow-y-auto rounded-xl shadow-sm border-gray-200">      {/* ── STICKY HEADER (CardHeader) ── */}
      <CardHeader className="sticky top-0 z-20 p-0 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] shadow-md">

        {/* Desktop View (lg and above) */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2.5">
          {/* LEFT: Icon + Search */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex-shrink-0">
              <Users2 className="w-4 h-4 text-white" />
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-200 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange({...filters, search: e.target.value})}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white/20 text-white placeholder-blue-200 backdrop-blur-md border border-white/30 shadow-sm focus:outline-none focus:ring-1 focus:ring-white/50"
              />
            </div>
          </div>

          {/* RIGHT: Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-lg"
              onClick={() => loadTenants()}
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            {/* Filter */}
            <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg text-xs relative">
                  <Filter className="w-3.5 h-3.5 mr-1" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-400 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0 bg-white flex flex-col gap-0">
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
                  {/* STATUS & ACCESS */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />
                      Status & Access
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Account</Label>
                        <FilterSelect
                          label=""
                          value={filters.is_active || ""}
                          onChange={(value) => handleFilterChange({ ...filters, is_active: value === "true" })}
                          options={[
                            { value: "true", label: "Active" },
                            { value: "false", label: "Inactive" },
                          ]}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Portal</Label>
                        <FilterSelect
                          label=""
                          value={filters.portal_access_enabled || ""}
                          onChange={(value) => handleFilterChange({ ...filters, portal_access_enabled: value === "true" })}
                          options={[
                            { value: "true", label: "Enabled" },
                            { value: "false", label: "Disabled" },
                          ]}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Login</Label>
                        <FilterSelect
                          label=""
                          value={filters.has_credentials || ""}
                          onChange={(value) => handleFilterChange({ ...filters, has_credentials: value === "true" })}
                          options={[
                            { value: "true", label: "Has Login" },
                            { value: "false", label: "No Login" },
                          ]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* PERSONAL INFORMATION */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      <Users className="w-3 h-3" />
                      Personal Information
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Gender</Label>
                        <FilterSelect
                          label=""
                          value={filters.gender || ""}
                          onChange={(value) => handleFilterChange({ ...filters, gender: value })}
                          options={[
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                            { value: "Other", label: "Other" },
                          ]}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Occupation</Label>
                        <FilterSelect
                          label=""
                          value={filters.occupation_category || ""}
                          onChange={(value) => handleFilterChange({ ...filters, occupation_category: value })}
                          options={[
                            { value: "Service", label: "Service" },
                            { value: "Business", label: "Business" },
                            { value: "Student", label: "Student" },
                            { value: "Other", label: "Other" },
                          ]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      <MapPin className="w-3 h-3" />
                      Location
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="relative">
                        <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="City"
                          value={filters.city || ""}
                          onChange={(e) => handleFilterChange({ ...filters, city: e.target.value })}
                          className="pl-6 h-7 text-xs border-gray-200 w-full rounded-md border px-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="State"
                          value={filters.state || ""}
                          onChange={(e) => handleFilterChange({ ...filters, state: e.target.value })}
                          className="pl-6 h-7 text-xs border-gray-200 w-full rounded-md border px-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PREFERENCES */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      <Bed className="w-3 h-3" />
                      Preferences
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500 mb-1 block">Sharing</Label>
                      <FilterSelect
                        label=""
                        value={filters.preferred_sharing || ""}
                        onChange={(value) => handleFilterChange({ ...filters, preferred_sharing: value })}
                        options={[
                          { value: "single", label: "Single" },
                          { value: "double", label: "Double" },
                          { value: "triple", label: "Triple" },
                        ]}
                      />
                    </div>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg text-xs relative">
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
                    onClick={() => handleBulkAction(action, selectedTenantIds)}
                    className={action.variant === 'destructive' ? 'text-red-600 text-xs' : 'text-xs'}
                  >
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg text-xs"
              onClick={handleExportToExcel}
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Export
            </Button>

<Button
  variant="ghost"
  size="sm"
  className="h-7 px-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg text-xs"
  onClick={handleImportClick}
>
  <Upload className="w-3.5 h-3.5 mr-1" />
  Import
</Button>

            {/* Add Tenant Button */}
            <Button
              size="sm"
              className="h-7 px-3 bg-white text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold shadow-sm"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Tenant
            </Button>
          </div>
        </div>

        {/* Active Filters Row */}
        {activeFiltersCount > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 bg-blue-800/40 border-t border-white/10 flex-wrap">
            <span className="text-[10px] text-blue-200 font-medium">Active Filters ({activeFiltersCount})</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value || key === 'search') return null;
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
        )}

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
                onChange={(e) => handleFilterChange({...filters, search: e.target.value})}
                className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg bg-white/20 text-white placeholder-blue-200 backdrop-blur-md border border-white/30 shadow-sm focus:outline-none focus:ring-1 focus:ring-white/50"
              />
            </div>
          </div>

          {/* RIGHT: Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white/80 hover:bg-white/20 rounded-lg" onClick={() => loadTenants()} disabled={loading}>
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white/80 hover:bg-white/20 rounded-lg relative">
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
                <Button variant="ghost" size="sm" className="h-7 px-2 text-white/80 hover:bg-white/20 rounded-lg text-xs relative">
                  <CheckSquare className="w-3 h-3 mr-1" />Bulk
                  {selectedTenantIds.length > 0 && (
                    <Badge className="ml-1 text-[8px] px-1 py-0 h-3 bg-orange-400 text-white border-0">
                      {selectedTenantIds.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {bulkActions.map((action, index) => (
                  <DropdownMenuItem key={index} onClick={() => handleBulkAction(action, selectedTenantIds)} className={action.variant === 'destructive' ? 'text-red-600 text-xs' : 'text-xs'}>
                    {action.icon}<span className="ml-2">{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-white/80 hover:bg-white/20 rounded-lg text-xs" onClick={handleExportToExcel}>
              <Download className="w-3 h-3 mr-1" />Export
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-white/80 hover:bg-white/20 rounded-lg text-xs" onClick={handleImportClick}>
              <Download className="w-3 h-3 mr-1" />Import
            </Button>
            <Button size="sm" className="h-7 px-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-3 h-3 mr-1" />Add Tenant
            </Button>
          </div>
        </div>

        {/* Tablet: Active Filters Row */}
        {activeFiltersCount > 0 && (
          <div className="hidden md:flex lg:hidden items-center gap-1.5 px-3 py-1 bg-blue-800/40 border-t border-white/10 flex-wrap">
            <span className="text-[10px] text-blue-200">Active ({activeFiltersCount})</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value || key === 'search') return null;
              return (
                <Badge key={key} variant="outline" className="text-[9px] px-1 py-0 h-3.5 bg-white/20 text-white border-white/30">
                  {key}: {String(value)}
                </Badge>
              );
            })}
            <button onClick={clearAllFilters} className="text-[10px] text-orange-300 underline ml-1">Clear</button>
          </div>
        )}

        {/* Mobile View */}
        <div className="flex md:hidden items-center gap-1.5 px-3 py-2">
          <div className="flex items-center gap-1 flex-shrink-0">
            <Users2 className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">Tenants</span>
            {selectedTenantIds.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge className="text-[9px] px-1.5 py-0 h-4 bg-orange-400 text-white border-0 cursor-pointer ml-1">
                    {selectedTenantIds.length}
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {bulkActions.map((action, index) => (
                    <DropdownMenuItem key={index} onClick={() => handleBulkAction(action, selectedTenantIds)} className={action.variant === 'destructive' ? 'text-red-600 text-xs' : 'text-xs'}>
                      {action.icon}<span className="ml-2">{action.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span className="text-[10px] text-blue-200 ml-1">({tenants.length > 0 ? tenants.length : 0})</span>
            )}
          </div>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white/80 hover:bg-white/20 rounded-lg" onClick={() => loadTenants()} disabled={loading}>
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white/80 hover:bg-white/20 rounded-lg relative">
                <Filter className="w-3 h-3" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-400 text-white text-[7px] font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
          </Sheet>
          <Button size="sm" className="h-7 px-2 bg-white text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-3 h-3 mr-0.5" />Add
          </Button>
        </div>

        {/* Mobile Search Bar */}
        <div className="flex md:hidden px-3 pb-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-200 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tenants..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange({...filters, search: e.target.value})}
              className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md bg-white/20 text-white placeholder-blue-200 backdrop-blur-md border border-white/30 shadow-sm focus:outline-none focus:ring-1 focus:ring-white/50"
            />
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex md:hidden px-3 pb-1.5">
            <span className="text-[10px] text-orange-300">Active filters ({activeFiltersCount})</span>
          </div>
        )}
      </CardHeader>

      {/* ── TABLE CONTAINER WITH SINGLE HORIZONTAL SCROLL ── */}
<div className="flex-1 overflow-auto min-h-0 max-h-full">
  <div className="overflow-x-auto overflow-y-auto h-full">        <table className="w-full border-collapse" style={{ minWidth: '780px' }}>
          {/* Column Headers */}
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            {/* Column Titles Row */}
            <tr>
              {/* SELECT - tight, no excess padding */}
              <th className="w-8 px-2 py-2 text-center">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center justify-center w-4 h-4 mx-auto"
                >
                  {selectedTenantIds.length === tenants.length && tenants.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-36">NAME</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-40">CONTACT</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-28">OCCUPATION</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-36">PROPERTY & ROOM</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-20">PAYMENTS</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-28">STATUS</th>
              <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-12">ACTIONS</th>
            </tr>
            {/* Search Inputs Row */}
            <tr className="border-t border-gray-100 bg-white">
              <td className="w-8 px-2 py-1.5 text-center">
                {/* empty */}
              </td>
              <td className="px-2 py-1.5">
                <Input
                  placeholder="Search name..."
                  value={columnSearch.name}
                  onChange={(e) => handleColumnSearchChange('name', e.target.value)}
                  className="h-6 text-[10px] w-full border-gray-200 focus:border-blue-300"
                />
              </td>
              <td className="px-2 py-1.5">
                <Input
                  placeholder="Search email/phone..."
                  value={columnSearch.contact}
                  onChange={(e) => handleColumnSearchChange('contact', e.target.value)}
                  className="h-6 text-[10px] w-full border-gray-200 focus:border-blue-300"
                />
              </td>
              <td className="px-2 py-1.5">
                <Input
                  placeholder="Search occupation..."
                  value={columnSearch.occupation}
                  onChange={(e) => handleColumnSearchChange('occupation', e.target.value)}
                  className="h-6 text-[10px] w-full border-gray-200 focus:border-blue-300"
                />
              </td>
              <td className="px-2 py-1.5">
                <Input
                  placeholder="Search property..."
                  value={columnSearch.property}
                  onChange={(e) => handleColumnSearchChange('property', e.target.value)}
                  className="h-6 text-[10px] w-full border-gray-200 focus:border-blue-300"
                />
              </td>
              <td className="px-2 py-1.5">
                <span className="text-[9px] text-gray-300 italic">—</span>
              </td>
              <td className="px-2 py-1.5">
                <Input
                  placeholder="Search status..."
                  value={columnSearch.status}
                  onChange={(e) => handleColumnSearchChange('status', e.target.value)}
                  className="h-6 text-[10px] w-full border-gray-200 focus:border-blue-300"
                />
              </td>
              <td className="px-2 py-1.5" />
            </tr>
          </thead>

          {/* Data Rows */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                    <span className="text-xs text-gray-400">Loading tenants...</span>
                  </div>
                </td>
              </tr>
            ) : tenants.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users2 className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">No tenants found</p>
                      <p className="text-xs text-gray-400 mt-0.5">Add your first tenant to get started</p>
                    </div>
                    <Button size="sm" className="text-xs h-7 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="w-3 h-3 mr-1" />Add Tenant
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTenants.map((tenant, idx) => (
                <tr
                  key={tenant.id}
                  className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                >
                  {/* Selection Checkbox */}
                  <td className="w-8 px-2 py-2 text-center">
                    <button
                      onClick={() => toggleSelection(String(tenant.id))}
                      className="flex items-center justify-center w-4 h-4 mx-auto"
                    >
                      {selectedTenantIds.includes(String(tenant.id)) ? (
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400" />
                      )}
                    </button>
                  </td>

                  {/* Name Column */}

{/* Name Column */}
<td className="px-3 py-2.5 cursor-pointer" onClick={() => { setSelectedTenant(tenant); setIsViewDialogOpen(true); }}>
  <div className="flex items-center gap-2 min-w-0">
     <div>
        {tenant.photo_url ? (
          <img src={tenant.photo_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-200" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-[10px]">
              {tenant.full_name
                ?.split(" ")
                .map(n => n[0])
                .join("")
                .substring(0,2)
                .toUpperCase()}
            </span>
          </div>
        )}
     </div>
     <div className="min-w-0">
        <div className="font-medium text-xs text-gray-900 truncate leading-tight">
          <span className="text-gray-500 mr-1">{tenant.salutation || ''}</span>
          {tenant.full_name}
        </div>
        <div className="text-[10px] text-gray-400 capitalize leading-tight">{tenant.gender?.toLowerCase() || 'N/A'}</div>
        <div className="text-[9px] text-blue-600 font-semibold">TID-{tenant.id}</div>
     </div>
  </div>
</td>

                  {/* Contact Column */}
{/* Contact Column */}
<td className="px-2 py-2.5">
  <div className="space-y-0.5 min-w-0">
    <a href={`mailto:${tenant.email}`} className="text-[10px] text-gray-700 truncate flex items-center gap-1 hover:text-blue-600 transition-colors">
      <Mail className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
      <span className="truncate">{tenant.email || 'No email'}</span>
    </a>
    <a href={`tel:${tenant.country_code || ''}${tenant.phone || ''}`} className="text-[10px] text-gray-500 flex items-center gap-1 hover:text-blue-600 transition-colors">
      <Phone className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
      <span>{tenant.country_code || ''} {tenant.phone || 'No phone'}</span>
    </a>
                      {tenant.city && (
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{tenant.city}{tenant.state && `, ${tenant.state}`}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Occupation Column */}
                  <td className="px-2 py-2.5">
                    <div className="space-y-0.5">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-medium border-blue-200 text-blue-700 bg-blue-50 leading-none">
                        {tenant.occupation_category || "Other"}
                      </Badge>
                      <div className="text-[10px] text-gray-600 leading-tight truncate max-w-[100px]">
                        {tenant.exact_occupation || tenant.occupation || "Not specified"}
                      </div>
                    </div>
                  </td>

                  {/* Property Column */}
                  <td className="px-2 py-2.5">
                    {tenant.current_assignment || tenant.assigned_room_id ? (
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-medium text-gray-800 flex items-center gap-1">
                          <Building className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[110px]">{tenant.current_assignment?.property_name || tenant.assigned_property_name || 'Unknown'}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Bed className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                          <span>Room {tenant.current_assignment?.room_number || tenant.assigned_room_number || 'N/A'} · Bed {tenant.current_assignment?.bed_number || tenant.assigned_bed_number || 'N/A'}</span>
                        </div>
                        <Badge className="text-[9px] px-1.5 py-0 h-4 bg-green-50 text-green-700 border border-green-200 leading-none">
                          <CheckCircle className="w-2 h-2 mr-0.5" />Assigned
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Building className="w-2.5 h-2.5" />
                        <span>No assignment</span>
                      </div>
                    )}
                  </td>

                  {/* Payments Column */}
                  <td className="px-2 py-2.5">
                    {(() => {
                      const payments = tenant.payments || [];
                      const paid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
                      const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
                      return (
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-semibold text-green-600 flex items-center gap-0.5">
                            <span>₹{paid.toLocaleString()}</span>
                          </div>
                          {pending > 0 && (
                            <div className="text-[10px] text-red-500">₹{pending.toLocaleString()}</div>
                          )}
                          <div className="text-[9px] text-gray-400">{payments.length} txn</div>
                        </div>
                      );
                    })()}
                  </td>

                  {/* Status Column */}
                  <td className="px-2 py-2.5">
                    <div className="flex flex-wrap gap-0.5">
                      <Badge className={`text-[9px] px-1.5 py-0 h-4 font-semibold leading-none ${tenant.is_active ? "bg-emerald-500 text-white" : "bg-gray-400 text-white"}`}>
                        {tenant.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {tenant.portal_access_enabled ? (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-blue-300 text-blue-600 bg-blue-50 leading-none">
                          <ShieldCheck className="w-2 h-2 mr-0.5" />Portal
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-gray-300 text-gray-400 leading-none">
                          No Portal
                        </Badge>
                      )}
                      {tenant.has_credentials ? (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-green-300 text-green-600 bg-green-50 leading-none">
                          <LogIn className="w-2 h-2 mr-0.5" />Login
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-orange-300 text-orange-500 leading-none">
                          No Login
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-2 py-2.5 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-200 rounded-md ">
                          <MoreVertical className="w-3.5 h-3.5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem className="text-xs" onClick={() => { setSelectedTenant(tenant); setIsViewDialogOpen(true); }}>
                          <Eye className="w-3 h-3 mr-2 text-gray-500" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs" onClick={() => { setSelectedTenant(tenant); setIsEditDialogOpen(true); }}>
                          <Edit className="w-3 h-3 mr-2 text-gray-500" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs" onClick={() => { setSelectedTenant(tenant); setCredentialPassword(""); setIsCredentialDialogOpen(true); }}>
                          <Key className="w-3 h-3 mr-2 text-gray-500" /> {tenant.has_credentials ? "Reset Password" : "Create Login"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs" onClick={() => handleTogglePortalAccess(tenant)}>
                          <Globe className="w-3 h-3 mr-2 text-gray-500" /> {tenant.portal_access_enabled ? "Disable Portal" : "Enable Portal"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs text-red-600" onClick={() => handleDelete(tenant)}>
                          <Trash2 className="w-3 h-3 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
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
  <DialogContent className="max-w-3xl h-[65vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl"
    onInteractOutside={(e) => {
      e.preventDefault();
    }}
  >
          {/* Gradient header — responsive padding and height */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-4 md:px-6 py-3 md:py-4 flex items-start justify-between flex-shrink-0">
            <div>
              <DialogTitle className="text-sm md:text-base font-semibold text-white">+ Add New Tenant</DialogTitle>
              <p className="text-[10px] md:text-xs text-blue-200 mt-0.5">Fill in tenant details across all sections</p>
            </div>
            <button onClick={() => setIsAddDialogOpen(false)} className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form scrolls inside here */}
          <div className="flex-1 overflow-y-auto">
            <TenantForm onSuccess={handleSuccess} onCancel={() => setIsAddDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {selectedTenant && (
  <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
    <DialogContent
      className="max-w-2xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl"
      onInteractOutside={(e) => { e.preventDefault(); }}
    >
      {/* ── Sticky Gradient Header ───────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-4 md:px-6 py-3 flex items-start justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar */}
          {selectedTenant.photo_url ? (
            <img src={selectedTenant.photo_url} alt=""
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/40 flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <DialogTitle className="text-sm font-semibold text-white truncate leading-tight">
              {selectedTenant.salutation ? `${selectedTenant.salutation}. ` : ""}
              {selectedTenant.full_name}
            </DialogTitle>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <Badge className={`text-[9px] px-1.5 py-0 h-4 ${selectedTenant.is_active ? "bg-emerald-500" : "bg-gray-400"} text-white border-0`}>
                {selectedTenant.is_active ? "Active" : "Inactive"}
              </Badge>
              {selectedTenant.gender && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-white/40 text-white bg-white/20">
                  {selectedTenant.gender}
                </Badge>
              )}
              {selectedTenant.portal_access_enabled && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-white/40 text-white bg-white/20">
                  Portal Access
                </Badge>
              )}
              {selectedTenant.has_credentials ? (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-white/40 text-white bg-white/20">
                  Login Enabled
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-orange-300/60 text-orange-200 bg-orange-500/20">
                  No Login
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
            onClick={() => { setIsViewDialogOpen(false); setIsEditDialogOpen(true); }} title="Edit">
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
            onClick={() => setIsViewDialogOpen(false)}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Scrollable Body ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 bg-gray-50/40">

        {/* ── Personal Information ──────────────────────────────────────── */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
            <User className="w-3 h-3 text-blue-500" /> Personal Information
          </h4>
          <div className="bg-white rounded-lg border border-gray-100 p-3 grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              ["Salutation",     selectedTenant.salutation || "—"],
              ["Full Name",      selectedTenant.full_name  || "—"],
              ["Gender",         selectedTenant.gender     || "—"],
              ["Date of Birth",  selectedTenant.date_of_birth
                ? `${new Date(selectedTenant.date_of_birth).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })} (${Math.floor((Date.now() - new Date(selectedTenant.date_of_birth).getTime()) / (365.25*24*60*60*1000))} yrs)`
                : "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">{label}</p>
                <p className="text-[11px] font-medium text-gray-800">{value}</p>
              </div>
            ))}

            {/* Emergency contact — full width */}
            {(selectedTenant.emergency_contact_name || selectedTenant.emergency_contact_phone) && (
              <div className="col-span-2 pt-1 border-t border-gray-100 mt-1">
                <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400 mb-0.5">Emergency Contact</p>
                <p className="text-[11px] font-medium text-gray-800">
                  {selectedTenant.emergency_contact_name || "—"}
                  {selectedTenant.emergency_contact_relation ? ` · ${selectedTenant.emergency_contact_relation}` : ""}
                </p>
                <p className="text-[11px] text-gray-500">{selectedTenant.emergency_contact_phone || "—"}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Contact Information ───────────────────────────────────────── */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
            <Phone className="w-3 h-3 text-indigo-500" /> Contact Information
          </h4>
          <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
            {[
              ["Email",   selectedTenant.email],
              ["Phone",   `${selectedTenant.country_code || ""} ${selectedTenant.phone || ""}`.trim()],
              ["Address", [selectedTenant.address, selectedTenant.city, selectedTenant.state, selectedTenant.pincode ? `- ${selectedTenant.pincode}` : ""].filter(Boolean).join(", ")],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-xs gap-2">
                <span className="text-gray-500 font-medium flex-shrink-0">{label}</span>
                <span className="text-gray-800 text-right">{value || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Occupation & Work ─────────────────────────────────────────── */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
            <Briefcase className="w-3 h-3 text-green-600" /> Occupation & Work
          </h4>
          <div className="bg-white rounded-lg border border-gray-100 p-3 grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Category</p>
              {selectedTenant.occupation_category
                ? <Badge variant="outline" className="text-[9px] px-1.5 py-0 mt-0.5">{selectedTenant.occupation_category}</Badge>
                : <p className="text-[11px] font-medium text-gray-800">—</p>}
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Sub-Category / Role</p>
              <p className="text-[11px] font-medium text-gray-800">{selectedTenant.exact_occupation || selectedTenant.occupation || "—"}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Organization</p>
              <p className="text-[11px] font-medium text-gray-800">{selectedTenant.organization || "—"}</p>
            </div>

            {/* Conditional fields based on occupation category */}
            {selectedTenant.occupation_category === "Student" ? (
              <>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Course Duration</p>
                  <p className="text-[11px] font-medium text-gray-800">{selectedTenant.course_duration?.replace("_"," ") || "—"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Student ID</p>
                  <p className="text-[11px] font-medium text-gray-800">{selectedTenant.student_id || "—"}</p>
                </div>
              </>
            ) : selectedTenant.occupation_category === "Government Employee" ? (
              <div>
                <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Employee / Service ID</p>
                <p className="text-[11px] font-medium text-gray-800">{selectedTenant.employee_id || "—"}</p>
              </div>
            ) : selectedTenant.occupation_category === "Freelancer / Self-Employed" ? (
              <div className="col-span-2">
                <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Portfolio / Website</p>
                {selectedTenant.portfolio_url
                  ? <a href={selectedTenant.portfolio_url} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline">{selectedTenant.portfolio_url}</a>
                  : <p className="text-[11px] font-medium text-gray-800">—</p>}
              </div>
            ) : (
              <>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Experience</p>
                  <p className="text-[11px] font-medium text-gray-800">{selectedTenant.years_of_experience ? `${selectedTenant.years_of_experience} yrs` : "—"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Monthly Income</p>
                  <p className="text-[11px] font-medium text-gray-800">{selectedTenant.monthly_income ? `₹${Number(selectedTenant.monthly_income).toLocaleString("en-IN")}` : "—"}</p>
                </div>
              </>
            )}

            <div>
              <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Work Mode</p>
              <p className="text-[11px] font-medium text-gray-800">{selectedTenant.work_mode || "—"}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Shift Timing</p>
              <p className="text-[11px] font-medium text-gray-800">{selectedTenant.shift_timing || "—"}</p>
            </div>

            {/* Room preferences */}
            <div className="col-span-2 pt-1 border-t border-gray-100 mt-1">
              <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400 mb-1">Room Preferences</p>
              <div className="flex gap-1.5 flex-wrap">
                {selectedTenant.preferred_sharing
                  ? <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">{selectedTenant.preferred_sharing} sharing</Badge>
                  : null}
                {selectedTenant.preferred_room_type
                  ? <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">{selectedTenant.preferred_room_type}</Badge>
                  : null}
                {!selectedTenant.preferred_sharing && !selectedTenant.preferred_room_type && (
                  <p className="text-[11px] text-gray-400">—</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Property, Check-in & Terms ───────────────────────────────── */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
            <Building className="w-3 h-3 text-indigo-500" /> Property, Check-in & Terms
          </h4>
          <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-3">
            {/* Property + Check-in row */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Assigned Property</p>
                <p className="text-[11px] font-medium text-gray-800">
                  {selectedTenant.property_name || (selectedTenant.property_id ? `Property #${selectedTenant.property_id}` : "—")}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Check-in Date</p>
                <p className="text-[11px] font-medium text-gray-800">
                  {selectedTenant.check_in_date
                    ? new Date(selectedTenant.check_in_date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
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
                  Penalty: {selectedTenant.lockin_penalty_type === "percentage" ? "%" : "₹"}
                  {selectedTenant.lockin_penalty_amount ?? 0}
                  {" "}({selectedTenant.lockin_penalty_type || "fixed"})
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
                  Penalty: {selectedTenant.notice_penalty_type === "percentage" ? "%" : "₹"}
                  {selectedTenant.notice_penalty_amount ?? 0}
                  {" "}({selectedTenant.notice_penalty_type || "fixed"})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Current Booking & Payments ────────────────────────────────── */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
            <Building className="w-3 h-3 text-purple-500" /> Current Booking & Payments
          </h4>
          {(selectedTenant.bookings ?? []).filter(b => b.status === "active").length > 0 ? (
            (selectedTenant.bookings ?? [])
              .filter(b => b.status === "active")
              .map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Property</p>
                      <p className="text-[11px] font-medium text-gray-800">{booking.properties?.name || "—"}</p>
                      <p className="text-[10px] text-gray-500">{booking.properties?.city}, {booking.properties?.state}</p>
                    </div>
                    {booking.room && (
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Room</p>
                        <p className="text-[11px] font-medium text-gray-800">Room {booking.room.room_number}</p>
                        <p className="text-[10px] text-gray-500">{booking.room.sharing_type} sharing · Floor {booking.room.floor || "—"}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Monthly Rent</p>
                      <p className="text-[12px] font-bold text-green-600">₹{booking.monthly_rent?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Payment history */}
                  {selectedTenant.payments && selectedTenant.payments.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400 mb-1.5">Payment History</p>
                      <div className="space-y-1">
                        {selectedTenant.payments.slice(0, 5).map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                            <div>
                              <p className="text-[11px] text-gray-800">{payment.description || "Payment"}</p>
                              <p className="text-[10px] text-gray-400">
                                {new Date(payment.payment_date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                                {" · "}{payment.payment_method}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[11px] font-semibold text-gray-900">₹{payment.amount?.toLocaleString()}</p>
                              <Badge className={`text-[9px] px-1 py-0 h-3.5 border-0 ${payment.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
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
                { label: "ID Proof",      url: selectedTenant.id_proof_url      },
                { label: "Address Proof", url: selectedTenant.address_proof_url },
                { label: "Photograph",    url: selectedTenant.photo_url         },
              ].map(({ label, url }) =>
                url ? (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                    {/\.(jpeg|jpg|png|gif|webp|bmp)$/i.test(url)
                      ? <img src={url} alt={label} className="h-12 w-full object-contain rounded" />
                      : <div className="h-12 w-full flex items-center justify-center bg-gray-100 rounded">
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                    }
                    <span className="text-[9px] text-gray-500 group-hover:text-blue-600 text-center leading-tight">{label}</span>
                    <span className="text-[9px] text-blue-400 flex items-center gap-0.5"><Eye className="h-2.5 w-2.5"/>View</span>
                  </a>
                ) : (
                  <div key={label}
                    className="flex flex-col items-center gap-1 p-2 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <div className="h-12 w-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-gray-300" />
                    </div>
                    <span className="text-[9px] text-gray-400 text-center">{label}</span>
                    <span className="text-[9px] text-red-400">Not uploaded</span>
                  </div>
                )
              )}
            </div>

            {/* Additional documents */}
            {selectedTenant.additional_documents && selectedTenant.additional_documents.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400 mb-1.5">Additional Documents</p>
                <div className="space-y-1">
                  {selectedTenant.additional_documents.map((doc, i) => (
                    <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between p-1.5 border border-gray-100 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium text-gray-700 truncate group-hover:text-blue-700">{doc.filename}</p>
                          {doc.uploaded_at && (
                            <p className="text-[9px] text-gray-400">
                              {new Date(doc.uploaded_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] text-blue-500 flex items-center gap-0.5 flex-shrink-0 ml-2">
                        <Eye className="h-2.5 w-2.5"/>View
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Portal & Login ────────────────────────────────────────────── */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Portal & Login
          </h4>
          <div className="bg-white rounded-lg border border-gray-100 p-3 grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Portal Access</p>
              <Badge className={`text-[9px] px-1.5 py-0 mt-0.5 border-0 font-semibold ${selectedTenant.portal_access_enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {selectedTenant.portal_access_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Login Status</p>
              {selectedTenant.has_credentials
                ? <Badge className="text-[9px] px-1.5 py-0 mt-0.5 bg-emerald-100 text-emerald-700 border-0 font-semibold">Active</Badge>
                : <Badge className="text-[9px] px-1.5 py-0 mt-0.5 bg-orange-100 text-orange-600 border-0 font-semibold">Not Created</Badge>
              }
            </div>
            <div className="col-span-2">
              <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Login Email</p>
              <p className="text-[11px] font-medium text-gray-800">{selectedTenant.credential_email || selectedTenant.email || "No login configured"}</p>
            </div>
          </div>
        </div>

        {/* ── System Information ────────────────────────────────────────── */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">
            <ShieldCheck className="w-3 h-3 text-gray-400" /> System Information
          </h4>
          <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-1.5">
            {[
              ["Tenant ID",    `#${selectedTenant.id}`],
              ["Created At",   selectedTenant.created_at ? new Date(selectedTenant.created_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—"],
              ["Last Updated", selectedTenant.updated_at ? new Date(selectedTenant.updated_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">{label}</span>
                <span className="text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>{/* end scrollable body */}

      {/* ── Sticky Footer ────────────────────────────────────────────────── */}
      <div className="border-t bg-white px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <p className="text-[10px] text-gray-400">
          ID: <span className="font-medium text-gray-600">#{selectedTenant.id}</span>
          {selectedTenant.check_in_date && (
            <> · Check-in: <span className="font-medium text-gray-600">
              {new Date(selectedTenant.check_in_date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
            </span></>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"
            onClick={() => setIsViewDialogOpen(false)}
            className="h-7 text-[10px] px-3 border-gray-200 text-gray-500">
            Close
          </Button>
          <Button size="sm"
            onClick={() => { setIsViewDialogOpen(false); setIsEditDialogOpen(true); }}
            className="h-7 text-[10px] px-3 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg">
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
                onClick={() => { setIsEditDialogOpen(false); setSelectedTenant(null); }}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto">
              <TenantForm
                tenant={selectedTenant}
                onSuccess={handleSuccess}
                onCancel={() => { setIsEditDialogOpen(false); setSelectedTenant(null); }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Credential Dialog */}
      {selectedTenant && (
       <Dialog open={isCredentialDialogOpen} onOpenChange={setIsCredentialDialogOpen}>
  <DialogContent 
    className="max-w-sm rounded-xl"
    onInteractOutside={(e) => {
      e.preventDefault();
    }}
  >
            <DialogHeader>
              <DialogTitle className="text-sm">
                {selectedTenant.has_credentials ? "Reset Password" : "Create Login Credentials"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Tenant Name</span>
                <span className="text-gray-800">{selectedTenant.full_name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Email</span>
                <span className="text-gray-800">{selectedTenant.email}</span>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">
                  {selectedTenant.has_credentials ? "New Password" : "Password"} *
                </Label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={credentialPassword}
                  onChange={(e) => setCredentialPassword(e.target.value)}
                  className="h-8 text-xs"
                />
                <p className="text-[10px] text-gray-400">Minimum 6 characters required</p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => { setIsCredentialDialogOpen(false); setCredentialPassword(""); setSelectedTenant(null); }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 bg-blue-600 hover:bg-blue-700"
                onClick={handleCredentialSubmit}
                disabled={credentialLoading}
              >
                {credentialLoading ? "Processing..." : selectedTenant.has_credentials ? "Reset Password" : "Create Login"}
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
    />
    </Card>
  );
}