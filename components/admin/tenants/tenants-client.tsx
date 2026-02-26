
// // components/admin/tenants/tenants-client.tsx
// "use client";

// import { useCallback, useEffect, useMemo, useState, useRef } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import {
//   Plus,
//   RefreshCw,
//   Download,
//   CheckCircle,
//   XCircle,
//   UserX,
//   Trash2,
//   Filter,
//   SlidersHorizontal,
//   MoreVertical,
//   Eye,
//   Edit,
//   Key,
//   Mail,
//   Phone,
//   Building,
//   Bed,
//   MapPin,
//   Users,
//   FileText,
//   IndianRupee,
//   CheckSquare,
//   Square,
//   Search,
//   X,
//   Briefcase,
//   Building2,
//   Globe,
//   LogIn,
//   ShieldCheck,
//   Users2,
//   ChevronLeft,
//   ChevronRight,
//   ChevronsLeft,
//   ChevronsRight,
// } from "lucide-react";
// import { toast } from "sonner";

// import {
//   deleteTenant,
//   bulkDeleteTenants,
//   bulkUpdateTenantStatus,
//   bulkUpdateTenantPortalAccess,
//   updateTenantSimple,
//   createCredential,
//   resetCredential,
//   exportTenantsToExcel,
//   listTenants,
//   type Tenant,
//   type TenantFilters,
// } from "@/lib/tenantApi";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Separator } from "@/components/ui/separator";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { DataTable } from "@/components/admin/data-table";
// import type { Column, FilterConfig, BulkAction, ActionButton } from "@/components/admin/data-table";
// import { TenantForm } from "@/components/admin/tenants/tenant-form";

// interface TenantsClientProps {
//   initialData: Tenant[];
//   initialLoading: boolean;
//   initialFilters: any;
// }

// // Pagination constants
// const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// export default function TenantsClient({
//   initialData = [],
//   initialLoading = false,
// }: TenantsClientProps) {
//   const [tenants, setTenants] = useState<Tenant[]>(initialData);
//   const [loading, setLoading] = useState(initialLoading);
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
//   const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false);
//   const [credentialPassword, setCredentialPassword] = useState("");
//   const [credentialLoading, setCredentialLoading] = useState(false);
//   const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
//   const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(25);
  
//   const filtersRef = useRef<TenantFilters>({});
//   const [filters, setFiltersState] = useState<TenantFilters>({});
  
//   // Column search for the header
//   const [columnSearch, setColumnSearch] = useState({
//     name: "",
//     contact: "",
//     occupation: "",
//     property: "",
//     payments: "",
//     status: "",
//   });

//   // Toggle selection
//   const toggleSelection = useCallback((tenantId: string) => {
//     setSelectedTenantIds(prev => {
//       if (prev.includes(tenantId)) {
//         return prev.filter(id => id !== tenantId);
//       } else {
//         return [...prev, tenantId];
//       }
//     });
//   }, []);

//   const toggleSelectAll = useCallback(() => {
//     if (selectedTenantIds.length === tenants.length && tenants.length > 0) {
//       setSelectedTenantIds([]);
//     } else {
//       const allIds = tenants.map(tenant => String(tenant.id));
//       setSelectedTenantIds(allIds);
//     }
//   }, [tenants, selectedTenantIds]);

//   // Load tenants
//   const loadTenants = useCallback(async (customFilters?: TenantFilters) => {
//     setLoading(true);
//     try {
//       const useFilters = customFilters || filtersRef.current;
//       const res = await listTenants(useFilters);

//       if (res?.success && Array.isArray(res.data)) {
//         setTenants(res.data);
//         setCurrentPage(1); // Reset to first page on new data load
//       } else {
//         toast.error(res?.message || "Failed to load tenants");
//         setTenants([]);
//       }
//     } catch (err) {
//       console.error("loadTenants error", err);
//       toast.error("Failed to load tenants");
//       setTenants([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Initialize
//   useEffect(() => {
//     loadTenants();
//   }, [loadTenants]);

//   // Handle column search
//   const handleColumnSearch = useCallback(() => {
//     const newFilters: TenantFilters = {};
    
//     if (columnSearch.name) {
//       newFilters.search = columnSearch.name;
//     }
//     if (columnSearch.contact) {
//       if (!newFilters.search) {
//         newFilters.search = columnSearch.contact;
//       }
//     }
//     if (columnSearch.occupation) {
//       newFilters.occupation_category = columnSearch.occupation;
//     }
//     if (columnSearch.property) {
//       if (!newFilters.search) {
//         newFilters.search = columnSearch.property;
//       }
//     }
//     if (columnSearch.status) {
//       if (columnSearch.status.toLowerCase() === 'active' || columnSearch.status.toLowerCase() === 'inactive') {
//         newFilters.is_active = columnSearch.status.toLowerCase() === 'active' ? 'true' : 'false';
//       }
//     }

//     filtersRef.current = newFilters;
//     setFiltersState(newFilters);
//     loadTenants(newFilters);
//   }, [columnSearch, loadTenants]);

//   // Handle column search change with debounce
//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       handleColumnSearch();
//     }, 500);

//     return () => clearTimeout(timeoutId);
//   }, [columnSearch, handleColumnSearch]);

//   // Handle filter change
//   const handleFilterChange = useCallback((newFilters: TenantFilters) => {
//     filtersRef.current = newFilters;
//     setFiltersState(newFilters);
//     loadTenants(newFilters);
//   }, [loadTenants]);

//   // Clear all filters
//   const clearAllFilters = useCallback(() => {
//     const emptyFilters = {
//       search: "",
//       is_active: "",
//       portal_access_enabled: "",
//       has_credentials: "",
//       gender: "",
//       occupation_category: "",
//       city: "",
//       state: "",
//       preferred_sharing: "",
//     };

//     filtersRef.current = emptyFilters;
//     setFiltersState(emptyFilters);
//     setColumnSearch({
//       name: "",
//       contact: "",
//       occupation: "",
//       property: "",
//       payments: "",
//       status: "",
//     });

//     loadTenants(emptyFilters);
//   }, [loadTenants]);

//   // Clear sidebar filters only
//   const clearSidebarFilters = useCallback(() => {
//     const emptyFilters = {
//       search: filters.search || "",
//       is_active: "",
//       portal_access_enabled: "",
//       has_credentials: "",
//       gender: "",
//       occupation_category: "",
//       city: "",
//       state: "",
//       preferred_sharing: "",
//     };

//     filtersRef.current = emptyFilters;
//     setFiltersState(emptyFilters);
//     loadTenants(emptyFilters);
//     setIsFilterSidebarOpen(false);
//   }, [filters.search, loadTenants]);

//   // Handle delete
//   const handleDelete = useCallback(async (tenant: Tenant) => {
//     if (!confirm(`Are you sure you want to delete ${tenant.full_name}?`)) return;
    
//     try {
//       const res = await deleteTenant(tenant.id as any);
//       if (res?.success) {
//         toast.success("Tenant deleted successfully");
//         loadTenants();
//       } else {
//         toast.error(res?.message || "Failed to delete tenant");
//       }
//     } catch {
//       toast.error("Failed to delete tenant");
//     }
//   }, [loadTenants]);

//   // Bulk delete
//   const handleBulkDelete = useCallback(async (selectedIds: string[]) => {
//     if (selectedIds.length === 0) {
//       toast.error("No tenants selected");
//       return;
//     }
    
//     if (!confirm(`Are you sure you want to delete ${selectedIds.length} tenants?`)) return;
    
//     try {
//       const res = await bulkDeleteTenants(selectedIds);
//       if (res?.success) {
//         toast.success(`${selectedIds.length} tenants deleted successfully`);
//         setSelectedTenantIds([]);
//         loadTenants();
//       } else {
//         toast.error(res?.message || "Failed to delete tenants");
//       }
//     } catch {
//       toast.error("Failed to delete tenants");
//     }
//   }, [loadTenants]);

//   // Bulk status change
//   const handleBulkStatusChange = useCallback(async (selectedIds: string[], status: boolean = true) => {
//     if (selectedIds.length === 0) return;
    
//     try {
//       const res = await bulkUpdateTenantStatus(selectedIds, status);
//       if (res?.success) {
//         toast.success(`${selectedIds.length} tenants ${status ? 'activated' : 'deactivated'}`);
//         setSelectedTenantIds([]);
//         loadTenants();
//       } else {
//         toast.error(res?.message || "Failed to update status");
//       }
//     } catch {
//       toast.error("Failed to update status");
//     }
//   }, [loadTenants]);

//   // Bulk portal access
//   const handleBulkPortalAccess = useCallback(async (selectedIds: string[], enabled: boolean) => {
//     if (selectedIds.length === 0) return;
    
//     try {
//       const res = await bulkUpdateTenantPortalAccess(selectedIds, enabled);
//       if (res?.success) {
//         toast.success(`${selectedIds.length} tenants portal access ${enabled ? 'enabled' : 'disabled'}`);
//         setSelectedTenantIds([]);
//         loadTenants();
//       } else {
//         toast.error(res?.message || "Failed to update portal access");
//       }
//     } catch {
//       toast.error("Failed to update portal access");
//     }
//   }, [loadTenants]);

//   // Toggle portal access for single tenant
//   const handleTogglePortalAccess = useCallback(async (tenant: Tenant) => {
//     try {
//       const res = await updateTenantSimple(tenant.id as any, {
//         portal_access_enabled: !tenant.portal_access_enabled,
//       });
      
//       if (res?.success) {
//         toast.success(`Portal access ${!tenant.portal_access_enabled ? 'enabled' : 'disabled'}`);
//         loadTenants();
//       } else {
//         toast.error(res?.message || "Failed to update portal access");
//       }
//     } catch {
//       toast.error("Failed to update portal access");
//     }
//   }, [loadTenants]);

//   // Handle success actions
//   const handleSuccess = useCallback(() => {
//     setIsAddDialogOpen(false);
//     setIsEditDialogOpen(false);
//     setIsViewDialogOpen(false);
//     setSelectedTenant(null);
//     loadTenants();
//   }, [loadTenants]);

//   // Export to Excel
//   const handleExportToExcel = useCallback(async () => {
//     try {
//       const exportFilters = Object.fromEntries(
//         Object.entries(filtersRef.current).filter(([_, v]) => v !== "")
//       );

//       const res = await exportTenantsToExcel(exportFilters);
//       if (res.success) {
//         toast.success("Exported successfully");
//       } else {
//         toast.error("Export failed");
//       }
//     } catch {
//       toast.error("Export failed");
//     }
//   }, []);

//   // Handle credential creation/reset
//   const handleCredentialSubmit = useCallback(async () => {
//     if (!selectedTenant || !credentialPassword) {
//       toast.error("Please enter a password");
//       return;
//     }

//     if (credentialPassword.length < 6) {
//       toast.error("Password must be at least 6 characters");
//       return;
//     }

//     setCredentialLoading(true);
//     try {
//       let res;
//       if (selectedTenant.has_credentials) {
//         res = await resetCredential(selectedTenant.id as any, credentialPassword);
//       } else {
//         res = await createCredential(
//           selectedTenant.id as any,
//           selectedTenant.email,
//           credentialPassword
//         );
//       }

//       if (res?.success) {
//         toast.success(selectedTenant.has_credentials ? "Password reset successfully" : "Login credentials created");
//         setIsCredentialDialogOpen(false);
//         setCredentialPassword("");
//         setSelectedTenant(null);
//         loadTenants();
//       } else {
//         toast.error(res?.message || "Failed to process credentials");
//       }
//     } catch {
//       toast.error("Failed to process credentials");
//     } finally {
//       setCredentialLoading(false);
//     }
//   }, [selectedTenant, credentialPassword, loadTenants]);

//   // Calculate active filters count
//   const activeFiltersCount = useMemo(() => {
//     const main = Object.values(filters).filter(v => v !== "").length;
//     return main;
//   }, [filters]);

//   // ── PAGINATION LOGIC ──
//   const totalTenants = tenants.length;
//   const totalPages = Math.max(1, Math.ceil(totalTenants / pageSize));

//   // Clamp currentPage whenever tenants/pageSize changes
//   useEffect(() => {
//     if (currentPage > totalPages) {
//       setCurrentPage(totalPages);
//     }
//   }, [totalPages, currentPage]);

//   const paginatedTenants = useMemo(() => {
//     const start = (currentPage - 1) * pageSize;
//     return tenants.slice(start, start + pageSize);
//   }, [tenants, currentPage, pageSize]);

//   const startRecord = totalTenants === 0 ? 0 : (currentPage - 1) * pageSize + 1;
//   const endRecord = Math.min(currentPage * pageSize, totalTenants);

//   const goToPage = useCallback((page: number) => {
//     setCurrentPage(Math.min(Math.max(1, page), totalPages));
//   }, [totalPages]);

//   // Memoized columns with inline rendering
//   const columns: Column<Tenant>[] = useMemo(() => [
//     {
//       key: "full_name",
//       label: "Name",
//       sortable: true,
//       render: (tenant) => (
//         <div className="space-y-1">
//           <div className="flex items-center gap-3">
//             {tenant.photo_url ? (
//               <img 
//                 src={tenant.photo_url} 
//                 alt={tenant.full_name}
//                 className="h-10 w-10 object-cover rounded-full"
//               />
//             ) : (
//               <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
//                 <Users className="h-5 w-5 text-blue-600" />
//               </div>
//             )}
//             <div>
//               <p className="font-medium">{tenant.full_name}</p>
//               <p className="text-sm text-slate-500 capitalize">{tenant.gender?.toLowerCase()}</p>
//             </div>
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: "email",
//       label: "Contact",
//       render: (tenant) => (
//         <div className="space-y-1">
//           <div className="flex items-center gap-2 text-sm">
//             <Mail className="h-3 w-3 text-slate-400" />
//             <span className="truncate">{tenant.email}</span>
//           </div>
//           <div className="flex items-center gap-2 text-sm">
//             <Phone className="h-3 w-3 text-slate-400" />
//             <span>{tenant.country_code} {tenant.phone}</span>
//           </div>
//           {tenant.city && (
//             <div className="text-xs text-slate-500">
//               <MapPin className="h-3 w-3 inline mr-1" />
//               {tenant.city}, {tenant.state}
//             </div>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "occupation",
//       label: "Occupation",
//       sortable: true,
//       render: (tenant) => (
//         <div className="space-y-1">
//           <Badge variant="outline" className="text-xs">
//             {tenant.occupation_category || "Other"}
//           </Badge>
//           <p className="text-sm mt-1">{tenant.exact_occupation || tenant.occupation || "Not specified"}</p>
//         </div>
//       ),
//     },
//     {
//       key: "property",
//       label: "Property & Room",
//       render: (tenant) => {
//         if (tenant.current_assignment || tenant.assigned_room_id) {
//           const assignment = tenant.current_assignment || {
//             property_name: tenant.assigned_property_name,
//             room_number: tenant.assigned_room_number,
//             bed_number: tenant.assigned_bed_number
//           };
          
//           return (
//             <div className="space-y-1">
//               <div className="flex items-center gap-1">
//                 <Building className="h-3 w-3 text-slate-400" />
//                 <span className="font-medium text-sm">
//                   {assignment.property_name || 'Unknown Property'}
//                 </span>
//               </div>
//               <div className="flex items-center gap-1 text-xs text-slate-600">
//                 <Bed className="h-3 w-3 text-slate-400" />
//                 Room {assignment.room_number || 'N/A'} • Bed {assignment.bed_number || 'N/A'}
//               </div>
//               <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
//                 <CheckCircle className="h-3 w-3 mr-1" />
//                 Bed Assigned
//               </Badge>
//             </div>
//           );
//         }
        
//         return (
//           <div className="text-sm text-slate-400 italic">
//             <Building className="h-3 w-3 inline mr-1" />
//             No assignment
//           </div>
//         );
//       },
//     },
//     {
//       key: "payments",
//       label: "Payments",
//       render: (tenant) => {
//         const payments = tenant.payments || [];
//         const paid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
//         const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
        
//         return (
//           <div className="space-y-1">
//             <div className="flex items-center gap-1 text-sm">
//               <IndianRupee className="h-3 w-3 text-green-600" />
//               <span className="text-green-600 font-medium">₹{paid.toLocaleString()} paid</span>
//             </div>
//             {pending > 0 && (
//               <div className="flex items-center gap-1 text-sm">
//                 <IndianRupee className="h-3 w-3 text-red-600" />
//                 <span className="text-red-600">₹{pending.toLocaleString()} pending</span>
//               </div>
//             )}
//             <div className="text-xs text-slate-500">
//               {payments.length} transaction(s)
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       key: "is_active",
//       label: "Status",
//       sortable: true,
//       filterable: true,
//       render: (tenant) => (
//         <div className="space-y-1">
//           <div>
//             <Badge variant={tenant.is_active ? "default" : "secondary"}>
//               {tenant.is_active ? "Active" : "Inactive"}
//             </Badge>
//           </div>
//           <div className="space-y-1">
//             {tenant.portal_access_enabled ? (
//               <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
//                 <CheckCircle className="h-3 w-3 mr-1" />
//                 Portal Access
//               </Badge>
//             ) : (
//               <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200">
//                 <XCircle className="h-3 w-3 mr-1" />
//                 No Portal
//               </Badge>
//             )}
//             {tenant.has_credentials ? (
//               <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
//                 <Key className="h-3 w-3 mr-1" />
//                 Login Enabled
//               </Badge>
//             ) : (
//               <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
//                 <XCircle className="h-3 w-3 mr-1" />
//                 No Login
//               </Badge>
//             )}
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: "actions",
//       label: "Actions",
//       render: (tenant) => (
//         <div className="flex justify-start">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                 <MoreVertical className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem onClick={() => {
//                 setSelectedTenant(tenant);
//                 setIsViewDialogOpen(true);
//               }}>
//                 <Eye className="h-4 w-4 mr-2" />
//                 View Details
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => {
//                 setSelectedTenant(tenant);
//                 setIsEditDialogOpen(true);
//               }}>
//                 <Edit className="h-4 w-4 mr-2" />
//                 Edit
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => {
//                 setSelectedTenant(tenant);
//                 setCredentialPassword("");
//                 setIsCredentialDialogOpen(true);
//               }}>
//                 <Key className="h-4 w-4 mr-2" />
//                 {tenant.has_credentials ? "Reset Password" : "Create Login"}
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => handleTogglePortalAccess(tenant)}>
//                 <UserX className="h-4 w-4 mr-2" />
//                 {tenant.portal_access_enabled ? "Disable Portal" : "Enable Portal"}
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem 
//                 onClick={() => handleDelete(tenant)}
//                 className="text-red-600"
//               >
//                 <Trash2 className="h-4 w-4 mr-2" />
//                 Delete
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       ),
//     },
//   ], [handleDelete, handleTogglePortalAccess]);

//   // Memoized table filters
//   const tableFilters: FilterConfig[] = useMemo(() => [
//     {
//       key: "is_active",
//       label: "Status",
//       type: "select",
//       options: [
//         { value: "true", label: "Active" },
//         { value: "false", label: "Inactive" },
//       ],
//     },
//     {
//       key: "gender",
//       label: "Gender",
//       type: "select",
//       options: [
//         { value: "Male", label: "Male" },
//         { value: "Female", label: "Female" },
//         { value: "Other", label: "Other" },
//       ],
//     },
//     {
//       key: "occupation_category",
//       label: "Occupation",
//       type: "select",
//       options: [
//         { value: "Service", label: "Service" },
//         { value: "Business", label: "Business" },
//         { value: "Student", label: "Student" },
//         { value: "Other", label: "Other" },
//       ],
//     },
//     {
//       key: "preferred_sharing",
//       label: "Sharing",
//       type: "select",
//       options: [
//         { value: "single", label: "Single" },
//         { value: "double", label: "Double" },
//         { value: "triple", label: "Triple" },
//       ],
//     },
//     {
//       key: "has_credentials",
//       label: "Login Status",
//       type: "select",
//       options: [
//         { value: "true", label: "Has Login" },
//         { value: "false", label: "No Login" },
//       ],
//     },
//     {
//       key: "portal_access_enabled",
//       label: "Portal Access",
//       type: "select",
//       options: [
//         { value: "true", label: "Enabled" },
//         { value: "false", label: "Disabled" },
//       ],
//     },
//   ], []);

//   // Memoized bulk actions
//   const bulkActions: BulkAction[] = useMemo(() => [
//     {
//       label: "Activate Selected",
//       icon: <CheckCircle className="h-4 w-4" />,
//       action: (selectedIds) => handleBulkStatusChange(selectedIds, true),
//     },
//     {
//       label: "Deactivate Selected",
//       icon: <XCircle className="h-4 w-4" />,
//       action: (selectedIds) => handleBulkStatusChange(selectedIds, false),
//     },
//     {
//       label: "Enable Portal Access",
//       icon: <UserX className="h-4 w-4" />,
//       action: (selectedIds) => handleBulkPortalAccess(selectedIds, true),
//     },
//     {
//       label: "Disable Portal Access",
//       icon: <UserX className="h-4 w-4" />,
//       action: (selectedIds) => handleBulkPortalAccess(selectedIds, false),
//     },
//     {
//       label: "Delete Selected",
//       icon: <Trash2 className="h-4 w-4" />,
//       action: handleBulkDelete,
//       variant: "destructive",
//       confirmMessage: "Are you sure you want to delete the selected tenants?",
//     },
//   ], [handleBulkStatusChange, handleBulkPortalAccess, handleBulkDelete]);

//   // FilterSelect component for sidebar
//   const FilterSelect = ({ 
//     label, 
//     value, 
//     onChange, 
//     options,
//     placeholder = "All"
//   }: {
//     label: string;
//     value: string;
//     onChange: (value: string) => void;
//     options: Array<{ value: string; label: string }>;
//     placeholder?: string;
//   }) => {
//     const validOptions = options.filter(opt => opt.value !== "");
    
//     return (
//       <div className="space-y-2">
//         <Label className="text-xs">{label}</Label>
//         <Select
//           value={value}
//           onValueChange={(value) => onChange(value === "all" ? "" : value)}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder={placeholder}>
//               {value ? validOptions.find(opt => opt.value === value)?.label : placeholder}
//             </SelectValue>
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">{placeholder}</SelectItem>
//             {validOptions.map((option) => (
//               <SelectItem key={option.value} value={option.value}>
//                 {option.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//     );
//   };

//   // Handle bulk action
//   const handleBulkAction = useCallback(async (action: BulkAction, selectedIds: string[]) => {
//     if (selectedIds.length === 0) {
//       toast.error("No tenants selected");
//       return;
//     }

//     if (action.confirmMessage && !confirm(action.confirmMessage)) return;

//     try {
//       await action.action(selectedIds);
//       setSelectedTenantIds([]);
//     } catch (error) {
//       console.error("Bulk action error:", error);
//       toast.error("Failed to perform bulk action");
//     }
//   }, []);

//   // Apply filters from sidebar
//   const applyFilters = () => {
//     loadTenants(filters);
//     setIsFilterSidebarOpen(false);
//   };

//   // Handle column search change
//   const handleColumnSearchChange = useCallback((column: keyof typeof columnSearch, value: string) => {
//     setColumnSearch(prev => ({
//       ...prev,
//       [column]: value,
//     }));
//   }, []);

//   // ── PAGINATION COMPONENT ──
//   const PaginationBar = () => (
//     <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t bg-white">
//       {/* Left: record count + page size selector */}
//       <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-slate-600 w-full sm:w-auto justify-center sm:justify-start">
//         <span className="text-xs sm:text-sm whitespace-nowrap">
//           {totalTenants === 0
//             ? "No records"
//             : `Showing ${startRecord}–${endRecord} of ${totalTenants} tenants`}
//         </span>
//         <div className="flex items-center gap-1.5">
//           <span className="text-xs text-slate-500 whitespace-nowrap">Rows:</span>
//           <Select
//             value={String(pageSize)}
//             onValueChange={(val) => {
//               setPageSize(Number(val));
//               setCurrentPage(1);
//             }}
//           >
//             <SelectTrigger className="h-7 w-14 text-xs">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {PAGE_SIZE_OPTIONS.map((size) => (
//                 <SelectItem key={size} value={String(size)} className="text-xs">
//                   {size}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* Right: page navigation */}
//       <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end">
//         {/* First page */}
//         <Button
//           variant="outline"
//           size="icon"
//           className="h-7 w-7"
//           onClick={() => goToPage(1)}
//           disabled={currentPage === 1}
//           title="First page"
//         >
//           <ChevronsLeft className="h-3.5 w-3.5" />
//         </Button>

//         {/* Prev page */}
//         <Button
//           variant="outline"
//           size="icon"
//           className="h-7 w-7"
//           onClick={() => goToPage(currentPage - 1)}
//           disabled={currentPage === 1}
//           title="Previous page"
//         >
//           <ChevronLeft className="h-3.5 w-3.5" />
//         </Button>

//         {/* Page number buttons - hidden on xs, visible sm+ */}
//         <div className="hidden sm:flex items-center gap-1">
//         {(() => {
//           const pages: (number | "...")[] = [];
//           const delta = 2;
//           const left = currentPage - delta;
//           const right = currentPage + delta;

//           for (let i = 1; i <= totalPages; i++) {
//             if (i === 1 || i === totalPages || (i >= left && i <= right)) {
//               pages.push(i);
//             } else if (i === left - 1 || i === right + 1) {
//               pages.push("...");
//             }
//           }

//           return pages.map((page, idx) =>
//             page === "..." ? (
//               <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">
//                 …
//               </span>
//             ) : (
//               <Button
//                 key={page}
//                 variant={currentPage === page ? "default" : "outline"}
//                 size="icon"
//                 className="h-7 w-7 text-xs"
//                 onClick={() => goToPage(page as number)}
//               >
//                 {page}
//               </Button>
//             )
//           );
//         })()}
//         </div>
//         {/* xs: just show current/total */}
//         <span className="sm:hidden text-xs text-slate-600 px-1">{currentPage}/{totalPages}</span>

//         {/* Next page */}
//         <Button
//           variant="outline"
//           size="icon"
//           className="h-7 w-7"
//           onClick={() => goToPage(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           title="Next page"
//         >
//           <ChevronRight className="h-3.5 w-3.5" />
//         </Button>

//         {/* Last page */}
//         <Button
//           variant="outline"
//           size="icon"
//           className="h-7 w-7"
//           onClick={() => goToPage(totalPages)}
//           disabled={currentPage === totalPages}
//           title="Last page"
//         >
//           <ChevronsRight className="h-3.5 w-3.5" />
//         </Button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="p-0">
//       <Card className="border-0 shadow-lg flex flex-col h-[calc(96vh-5rem)]">
//         {/* ── STICKY HEADER (CardHeader) ── */}
//         <CardHeader className="shrink-0 sticky top-0 z-10 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white shadow-md border-b py-2 px-3 md:px-4 rounded-t-xl">
//           <div className="flex flex-col gap-2">
//             {/* Desktop View (lg and above) */}
//             <div className="hidden lg:block">
//               <div className="flex items-center justify-between">
//                 {/* LEFT: Icon + Search */}
//                 <div className="flex items-center gap-3">
//                   <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md shadow-md ring-1 ring-white/30">
//                     <Users className="h-5 w-5" />
//                   </div>
//                   <div className="relative w-[420px]">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200" />
//                     <input
//                       type="text"
//                       placeholder="Search tenants..."
//                       value={filters.search || ''}
//                       onChange={(e) => handleFilterChange({...filters, search: e.target.value})}
//                       className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg
//                                bg-white/20 text-white placeholder-blue-100
//                                backdrop-blur-md border border-white/30
//                                shadow-sm focus:outline-none focus:ring-1 focus:ring-white/50"
//                     />
//                   </div>
//                 </div>

//                 {/* RIGHT: Buttons */}
//                 <div className="flex items-center gap-2">
//                   {/* Refresh */}
//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-8 w-8 bg-white/10 text-white hover:bg-white/20 border-white/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
//                     onClick={() => loadTenants()}
//                     disabled={loading}
//                   >
//                     <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
//                   </Button>

//                   {/* Filter */}
//                   <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
//                     <SheetTrigger asChild>
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="relative h-8 w-8 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
//                       >
//                         <Filter className="h-4 w-4" />
//                         {activeFiltersCount > 0 && (
//                           <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-400 ring-1 ring-blue-500" />
//                         )}
//                       </Button>
//                     </SheetTrigger>

//                     <SheetContent
//                       side="right"
//                       className="p-0 w-[50vw] min-w-[280px] sm:w-[360px] lg:w-full lg:max-w-sm"
//                     >
//                       <div className="h-full flex flex-col">
//                         {/* HEADER */}
//                         <div
//                           className="px-4 py-3 shrink-0 flex items-center justify-between"
//                           style={{ background: 'linear-gradient(135deg, #004ab0 0%, #003d8c 100%)' }}
//                         >
//                           <div className="flex items-center gap-2">
//                             <SlidersHorizontal className="h-4 w-4" style={{ color: '#f9bd07' }} />
//                             <span className="text-white font-semibold text-sm">Advanced Filters</span>
//                             {activeFiltersCount > 0 && (
//                               <span
//                                 className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
//                                 style={{ backgroundColor: '#f9bd07', color: '#000' }}
//                               >
//                                 {activeFiltersCount}
//                               </span>
//                             )}
//                           </div>
//                           <button
//                             onClick={() => setIsFilterSidebarOpen(false)}
//                             className="text-white/70 hover:text-white transition-colors"
//                           >
//                             <X className="h-4 w-4" />
//                           </button>
//                         </div>

//                         {/* BODY */}
//                         <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
//                           {/* STATUS & ACCESS */}
//                           <div className="rounded-lg border border-blue-100 overflow-hidden">
//                             <div className="px-3 py-1.5" style={{ backgroundColor: '#e6f0ff' }}>
//                               <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#004ab0' }}>
//                                 Status &amp; Access
//                               </span>
//                             </div>
//                             <div className="divide-y divide-gray-100">
//                               <div className="flex items-center gap-2 px-3 py-2">
//                                 <ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: '#004ab0' }} />
//                                 <span className="text-xs text-gray-500 w-20 shrink-0">Account</span>
//                                 <div className="flex-1">
//                                   <FilterSelect
//                                     label=""
//                                     value={filters.is_active !== undefined ? String(filters.is_active) : ""}
//                                     onChange={(value) => handleFilterChange({ ...filters, is_active: value === "true" })}
//                                     options={[
//                                       { value: "true", label: "Active" },
//                                       { value: "false", label: "Inactive" },
//                                     ]}
//                                   />
//                                 </div>
//                               </div>
//                               <div className="flex items-center gap-2 px-3 py-2">
//                                 <Globe className="h-3.5 w-3.5 shrink-0" style={{ color: '#004ab0' }} />
//                                 <span className="text-xs text-gray-500 w-20 shrink-0">Portal</span>
//                                 <div className="flex-1">
//                                   <FilterSelect
//                                     label=""
//                                     value={filters.portal_access_enabled !== undefined ? String(filters.portal_access_enabled) : ""}
//                                     onChange={(value) => handleFilterChange({ ...filters, portal_access_enabled: value === "true" })}
//                                     options={[
//                                       { value: "true", label: "Enabled" },
//                                       { value: "false", label: "Disabled" },
//                                     ]}
//                                   />
//                                 </div>
//                               </div>
//                               <div className="flex items-center gap-2 px-3 py-2">
//                                 <LogIn className="h-3.5 w-3.5 shrink-0" style={{ color: '#004ab0' }} />
//                                 <span className="text-xs text-gray-500 w-20 shrink-0">Login</span>
//                                 <div className="flex-1">
//                                   <FilterSelect
//                                     label=""
//                                     value={filters.has_credentials !== undefined ? String(filters.has_credentials) : ""}
//                                     onChange={(value) => handleFilterChange({ ...filters, has_credentials: value === "true" })}
//                                     options={[
//                                       { value: "true", label: "Has Login" },
//                                       { value: "false", label: "No Login" },
//                                     ]}
//                                   />
//                                 </div>
//                               </div>
//                             </div>
//                           </div>

//                           {/* PERSONAL INFORMATION */}
//                           <div className="rounded-lg border border-blue-100 overflow-hidden">
//                             <div className="px-3 py-1.5" style={{ backgroundColor: '#e6f0ff' }}>
//                               <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#004ab0' }}>
//                                 Personal Information
//                               </span>
//                             </div>
//                             <div className="grid grid-cols-2 divide-x divide-gray-100 px-0">
//                               <div className="flex flex-col gap-1 p-2">
//                                 <div className="flex items-center gap-1">
//                                   <Users2 className="h-3 w-3" style={{ color: '#004ab0' }} />
//                                   <span className="text-[10px] text-gray-500">Gender</span>
//                                 </div>
//                                 <FilterSelect
//                                   label=""
//                                   value={filters.gender || ""}
//                                   onChange={(value) => handleFilterChange({ ...filters, gender: value })}
//                                   options={[
//                                     { value: "Male", label: "Male" },
//                                     { value: "Female", label: "Female" },
//                                     { value: "Other", label: "Other" },
//                                   ]}
//                                 />
//                               </div>
//                               <div className="flex flex-col gap-1 p-2">
//                                 <div className="flex items-center gap-1">
//                                   <Briefcase className="h-3 w-3" style={{ color: '#004ab0' }} />
//                                   <span className="text-[10px] text-gray-500">Occupation</span>
//                                 </div>
//                                 <FilterSelect
//                                   label=""
//                                   value={filters.occupation_category || ""}
//                                   onChange={(value) => handleFilterChange({ ...filters, occupation_category: value })}
//                                   options={[
//                                     { value: "Service", label: "Service" },
//                                     { value: "Business", label: "Business" },
//                                     { value: "Student", label: "Student" },
//                                     { value: "Other", label: "Other" },
//                                   ]}
//                                 />
//                               </div>
//                             </div>
//                           </div>

//                           {/* LOCATION */}
//                           <div className="rounded-lg border border-blue-100 overflow-hidden">
//                             <div className="px-3 py-1.5" style={{ backgroundColor: '#fff4e0' }}>
//                               <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#004ab0' }}>
//                                 Location
//                               </span>
//                             </div>
//                             <div className="grid grid-cols-2 gap-2 p-2">
//                               <div className="relative">
//                                 <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" style={{ color: '#004ab0' }} />
//                                 <Input
//                                   placeholder="City"
//                                   value={filters.city || ""}
//                                   onChange={(e) => handleFilterChange({ ...filters, city: e.target.value })}
//                                   className="pl-6 h-7 text-xs border-gray-200"
//                                 />
//                               </div>
//                               <div className="relative">
//                                 <Building2 className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" style={{ color: '#004ab0' }} />
//                                 <Input
//                                   placeholder="State"
//                                   value={filters.state || ""}
//                                   onChange={(e) => handleFilterChange({ ...filters, state: e.target.value })}
//                                   className="pl-6 h-7 text-xs border-gray-200"
//                                 />
//                               </div>
//                             </div>
//                           </div>

//                           {/* PREFERENCES */}
//                           <div className="rounded-lg border border-blue-100 overflow-hidden">
//                             <div className="px-3 py-1.5" style={{ backgroundColor: '#fff4e0' }}>
//                               <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#004ab0' }}>
//                                 Preferences
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2 px-3 py-2">
//                               <Users className="h-3.5 w-3.5 shrink-0" style={{ color: '#004ab0' }} />
//                               <span className="text-xs text-gray-500 w-20 shrink-0">Sharing</span>
//                               <div className="flex-1">
//                                 <FilterSelect
//                                   label=""
//                                   value={filters.preferred_sharing || ""}
//                                   onChange={(value) => handleFilterChange({ ...filters, preferred_sharing: value })}
//                                   options={[
//                                     { value: "single", label: "Single" },
//                                     { value: "double", label: "Double" },
//                                     { value: "triple", label: "Triple" },
//                                   ]}
//                                 />
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         {/* FOOTER */}
//                         <div className="px-3 py-3 border-t shrink-0" style={{ backgroundColor: '#f9fafb' }}>
//                           <div className="flex gap-2">
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="flex-1 gap-1.5 h-8 text-xs font-medium"
//                               onClick={clearSidebarFilters}
//                               style={{ borderColor: '#004ab0', color: '#004ab0' }}
//                             >
//                               <RefreshCw className="h-3 w-3" />
//                               Reset
//                             </Button>
//                             <Button
//                               size="sm"
//                               className="flex-1 h-8 text-xs font-medium text-white"
//                               onClick={applyFilters}
//                               style={{ backgroundColor: '#004ab0' }}
//                             >
//                               Apply Filters
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </SheetContent>
//                   </Sheet>

//                   {/* Bulk Actions Dropdown */}
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button
//                         variant="outline"
//                         className="flex items-center gap-2 h-8 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
//                         disabled={selectedTenantIds.length === 0}
//                       >
//                         <CheckSquare className="h-4 w-4" />
//                         Bulk Actions
//                         {selectedTenantIds.length > 0 && (
//                           <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-white/20 text-white">
//                             {selectedTenantIds.length}
//                           </Badge>
//                         )}
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end" className="w-56">
//                       {bulkActions.map((action, index) => (
//                         <DropdownMenuItem
//                           key={index}
//                           onClick={() => handleBulkAction(action, selectedTenantIds)}
//                           className={action.variant === 'destructive' ? 'text-red-600' : ''}
//                         >
//                           {action.icon}
//                           <span className="ml-2">{action.label}</span>
//                         </DropdownMenuItem>
//                       ))}
//                     </DropdownMenuContent>
//                   </DropdownMenu>

//                   {/* Export Button */}
//                   <Button
//                     variant="outline"
//                     className="flex items-center gap-2 h-8 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
//                     onClick={handleExportToExcel}
//                   >
//                     <Download className="h-4 w-4" />
//                     Export
//                   </Button>

//                   {/* Add Tenant Button */}
//                   <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//                     <DialogTrigger asChild>
//                       <Button
//                         className="bg-white text-blue-600 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 font-semibold border-2 border-white/50 px-3 py-1.5 text-sm flex items-center"
//                       >
//                         <Plus className="h-4 w-4 mr-2" />
//                         Add Tenant
//                       </Button>
//                     </DialogTrigger>
//                   </Dialog>
//                 </div>
//               </div>

//               {/* Active Filters Row */}
//               {activeFiltersCount > 0 && (
//                 <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/30">
//                   <div className="flex items-center gap-2">
//                     <Filter className="h-3 w-3 text-white" />
//                     <span className="text-xs text-white">Active Filters ({activeFiltersCount})</span>
//                     <div className="flex gap-1 ml-2">
//                       {Object.entries(filters).map(([key, value]) => {
//                         if (!value || key === 'search') return null;
//                         return (
//                           <Badge key={key} variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
//                             {key}: {String(value)}
//                           </Badge>
//                         );
//                       })}
//                     </div>
//                   </div>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={clearAllFilters}
//                     className="h-6 px-2 text-xs text-white hover:bg-white/20"
//                   >
//                     <X className="h-3 w-3 mr-1" />
//                     Clear all
//                   </Button>
//                 </div>
//               )}
//             </div>

//             {/* Tablet View (md to lg) */}
//             <div className="hidden md:block lg:hidden">
//               <div className="flex items-center justify-between gap-2">
//                 {/* LEFT: Icon + Search */}
//                 <div className="flex items-center gap-2 flex-1 min-w-0">
//                   <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md shadow-md ring-1 ring-white/30 shrink-0">
//                     <Users className="h-4 w-4" />
//                   </div>
//                   <div className="relative flex-1 min-w-0">
//                     <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-blue-200" />
//                     <input
//                       type="text"
//                       placeholder="Search tenants..."
//                       value={filters.search || ''}
//                       onChange={(e) => handleFilterChange({...filters, search: e.target.value})}
//                       className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg
//                                bg-white/20 text-white placeholder-blue-100
//                                backdrop-blur-md border border-white/30
//                                shadow-sm focus:outline-none focus:ring-1 focus:ring-white/50"
//                     />
//                   </div>
//                 </div>

//                 {/* RIGHT: Action buttons */}
//                 <div className="flex items-center gap-1.5 shrink-0">
//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-7 w-7 bg-white/10 text-white hover:bg-white/20 border-white/30 backdrop-blur-sm"
//                     onClick={() => loadTenants()}
//                     disabled={loading}
//                   >
//                     <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
//                   </Button>

//                   <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
//                     <SheetTrigger asChild>
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="relative h-7 w-7 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm"
//                       >
//                         <Filter className="h-3.5 w-3.5" />
//                         {activeFiltersCount > 0 && (
//                           <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400 ring-1 ring-blue-500" />
//                         )}
//                       </Button>
//                     </SheetTrigger>
//                   </Sheet>

//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button
//                         variant="outline"
//                         className="flex items-center gap-1 h-7 text-xs bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm px-2"
//                         disabled={selectedTenantIds.length === 0}
//                       >
//                         <CheckSquare className="h-3.5 w-3.5" />
//                         <span className="hidden sm:inline">Bulk</span>
//                         {selectedTenantIds.length > 0 && (
//                           <Badge variant="secondary" className="ml-0.5 h-4 w-4 p-0 flex items-center justify-center bg-white/20 text-white text-[10px]">
//                             {selectedTenantIds.length}
//                           </Badge>
//                         )}
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end" className="w-52">
//                       {bulkActions.map((action, index) => (
//                         <DropdownMenuItem
//                           key={index}
//                           onClick={() => handleBulkAction(action, selectedTenantIds)}
//                           className={action.variant === 'destructive' ? 'text-red-600' : ''}
//                         >
//                           {action.icon}
//                           <span className="ml-2 text-xs">{action.label}</span>
//                         </DropdownMenuItem>
//                       ))}
//                     </DropdownMenuContent>
//                   </DropdownMenu>

//                   <Button
//                     variant="outline"
//                     className="flex items-center gap-1 h-7 text-xs bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm px-2"
//                     onClick={handleExportToExcel}
//                   >
//                     <Download className="h-3.5 w-3.5" />
//                     <span className="hidden sm:inline">Export</span>
//                   </Button>

//                   <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//                     <DialogTrigger asChild>
//                       <Button
//                         className="bg-white text-blue-600 hover:bg-blue-50 shadow-md font-semibold border border-white/50 h-7 px-2.5 text-xs flex items-center gap-1"
//                       >
//                         <Plus className="h-3.5 w-3.5" />
//                         Add Tenant
//                       </Button>
//                     </DialogTrigger>
//                   </Dialog>
//                 </div>
//               </div>

//               {/* Tablet: Active Filters Row */}
//               {activeFiltersCount > 0 && (
//                 <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/30">
//                   <div className="flex items-center gap-1.5 flex-wrap">
//                     <Filter className="h-3 w-3 text-white" />
//                     <span className="text-xs text-white">Active ({activeFiltersCount})</span>
//                     {Object.entries(filters).map(([key, value]) => {
//                       if (!value || key === 'search') return null;
//                       return (
//                         <Badge key={key} variant="secondary" className="text-[10px] bg-white/20 text-white border-white/30">
//                           {key}: {String(value)}
//                         </Badge>
//                       );
//                     })}
//                   </div>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={clearAllFilters}
//                     className="h-5 px-2 text-[10px] text-white hover:bg-white/20"
//                   >
//                     <X className="h-2.5 w-2.5 mr-0.5" />
//                     Clear
//                   </Button>
//                 </div>
//               )}
//             </div>

//             {/* Mobile View */}
//             <div className="md:hidden">
//               <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-1.5">
//                   <div className="p-1 rounded-md bg-white/20 backdrop-blur-md shadow-sm ring-1 ring-white/30">
//                     <Users className="h-3 w-3" />
//                   </div>
//                   <span className="text-sm font-semibold">Tenants</span>
                  
//                   {selectedTenantIds.length > 0 ? (
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button
//                           size="sm"
//                           className="h-6 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-xs px-2"
//                         >
//                           <CheckSquare className="h-3 w-3 mr-1" />
//                           {selectedTenantIds.length}
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="start" className="w-48">
//                         {bulkActions.map((action, index) => (
//                           <DropdownMenuItem
//                             key={index}
//                             onClick={() => handleBulkAction(action, selectedTenantIds)}
//                             className={action.variant === 'destructive' ? 'text-red-600' : ''}
//                           >
//                             {action.icon}
//                             <span className="ml-2 text-xs">{action.label}</span>
//                           </DropdownMenuItem>
//                         ))}
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   ) : (
//                     <Button
//                       size="sm"
//                       variant="ghost"
//                       className="h-5 bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs px-2 opacity-70"
//                       disabled
//                     >
//                       <CheckSquare className="h-2 w-2 mr-1" />
//                       0
//                     </Button>
//                   )}
//                 </div>

//                 <div className="flex items-center gap-1">
//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-6 w-6 bg-white/10 text-white hover:bg-white/20 border-white/30 backdrop-blur-sm"
//                     onClick={() => loadTenants()}
//                     disabled={loading}
//                   >
//                     <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
//                   </Button>

//                   <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
//                     <SheetTrigger asChild>
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="relative h-6 w-6 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm"
//                       >
//                         <Filter className="h-3 w-3" />
//                         {activeFiltersCount > 0 && (
//                           <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-green-400 ring-1 ring-blue-500" />
//                         )}
//                       </Button>
//                     </SheetTrigger>
//                   </Sheet>

//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-6 w-6 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm"
//                     onClick={handleExportToExcel}
//                   >
//                     <Download className="h-3 w-3" />
//                   </Button>

//                   <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//                     <DialogTrigger asChild>
//                       <Button
//                         size="sm"
//                         className="h-5 bg-white text-blue-600 hover:bg-blue-50 font-semibold border border-white/50 px-2 text-xs flex items-center ml-1"
//                       >
//                         <Plus className="h-2 w-2" />
//                         <span className="ml-0.2">Add</span>
//                       </Button>
//                     </DialogTrigger>
//                   </Dialog>
//                 </div>
//               </div>

//               {/* Mobile Search Bar */}
//               <div className="relative py-2">
//                 <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-blue-200" />
//                 <input
//                   type="text"
//                   placeholder="Search tenants..."
//                   value={filters.search || ''}
//                   onChange={(e) => handleFilterChange({...filters, search: e.target.value})}
//                   className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md
//                            bg-white/20 text-white placeholder-blue-100
//                            backdrop-blur-md border border-white/30
//                            shadow-sm focus:outline-none focus:ring-1 focus:ring-white/50"
//                 />
//               </div>

//               {activeFiltersCount > 0 && (
//                 <div className="mt-2 flex items-center justify-between bg-white/10 backdrop-blur-md rounded px-1.5 py-0.5">
//                   <div className="flex items-center gap-1">
//                     <Filter className="h-2.5 w-2.5" />
//                     <span className="text-[10px] text-white">
//                       Active filters ({activeFiltersCount})
//                     </span>
//                   </div>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="h-4 w-4 p-0 text-white hover:bg-white/20"
//                     onClick={clearAllFilters}
//                   >
//                     <X className="h-2.5 w-2.5" />
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </CardHeader>

//         {/* ── TABLE CONTAINER WITH SINGLE HORIZONTAL SCROLL ── */}
//         <div className="flex-1 overflow-auto min-h-0 ">
//           <div className="min-w-[1200px] h-full flex flex-col ">
//             {/* Column Headers */}
//             <div className="sticky top-0 z-10 bg-slate-50 border-b">
//               {/* Column Titles Row */}
//               <div className="grid grid-cols-10 gap-1 px-3 md:px-4 py-1 border-b">
//                 <div className="flex justify-center">
//                   <div className="text-center text-[10px] font-medium text-slate-600 uppercase tracking-wider">
//                     select
//                   </div>
//                 </div>
//                 <div className="col-span-2">
//                   <div className="text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">NAME</div>
//                 </div>
//                 <div className="col-span-2">
//                   <div className="text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">CONTACT</div>
//                 </div>
//                 <div>
//                   <div className="text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">OCCUPATION</div>
//                 </div>
//                 <div>
//                   <div className="text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">PROPERTY &amp; ROOM</div>
//                 </div>
//                 <div>
//                   <div className="text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">PAYMENTS</div>
//                 </div>
//                 <div>
//                   <div className="text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">STATUS</div>
//                 </div>
//                 <div>
//                   <div className="text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">ACTIONS</div>
//                 </div>
//               </div>

//               {/* Search Inputs Row */}
//               <div className="grid grid-cols-10 gap-1 px-3 md:px-4 py-1 bg-white">
//                 <div className="flex justify-center">
//                   <button
//                     onClick={toggleSelectAll}
//                     className="flex items-center justify-center h-4 w-4"
//                   >
//                     {selectedTenantIds.length === tenants.length && tenants.length > 0 ? (
//                       <CheckSquare className="h-4 w-4 text-blue-600" />
//                     ) : (
//                       <Square className="h-4 w-4 text-slate-400" />
//                     )}
//                   </button>
//                 </div>
//                 <div className="col-span-2">
//                   <Input
//                     placeholder="Search name..."
//                     value={columnSearch.name}
//                     onChange={(e) => handleColumnSearchChange('name', e.target.value)}
//                     className="h-6 text-[10px] w-full"
//                   />
//                 </div>
//                 <div className="col-span-2">
//                   <Input
//                     placeholder="Search email/phone..."
//                     value={columnSearch.contact}
//                     onChange={(e) => handleColumnSearchChange('contact', e.target.value)}
//                     className="h-6 text-[10px] w-full"
//                   />
//                 </div>
//                 <div>
//                   <Input
//                     placeholder="Search occupation"
//                     value={columnSearch.occupation}
//                     onChange={(e) => handleColumnSearchChange('occupation', e.target.value)}
//                     className="h-6 text-[10px] w-full"
//                   />
//                 </div>
//                 <div>
//                   <Input
//                     placeholder="Search property"
//                     value={columnSearch.property}
//                     onChange={(e) => handleColumnSearchChange('property', e.target.value)}
//                     className="h-6 text-[10px] w-full"
//                   />
//                 </div>
//                 <div>
//                   <Input
//                     placeholder="Search payment"
//                     value={columnSearch.payments}
//                     onChange={(e) => handleColumnSearchChange('payments', e.target.value)}
//                     className="h-6 text-[10px] w-full"
//                   />
//                 </div>
//                 <div>
//                   <Input
//                     placeholder="Search status"
//                     value={columnSearch.status}
//                     onChange={(e) => handleColumnSearchChange('status', e.target.value)}
//                     className="h-6 text-[10px] w-full"
//                   />
//                 </div>
//                 <div></div>
//               </div>
//             </div>

//             {/* Data Rows */}
//             <CardContent className="flex-1 p-0">
//               {loading ? (
//                 <div className="flex justify-center items-center h-48">
//                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//                 </div>
//               ) : tenants.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
//                   <h3 className="text-sm font-medium text-slate-600">No tenants found</h3>
//                   <p className="text-slate-500 text-xs mt-1">Add your first tenant to get started</p>
//                   <Button 
//                     className="mt-3 h-7 text-xs" 
//                     onClick={() => setIsAddDialogOpen(true)}
//                   >
//                     <Plus className="h-3 w-3 mr-1" />
//                     Add Tenant
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="divide-y">
//                   {paginatedTenants.map((tenant) => (
//                     <div key={tenant.id} className="grid grid-cols-10 gap-1 px-3 md:px-4 py-2 hover:bg-slate-50 transition-colors items-center">
//                       {/* Selection Checkbox */}
//                       <div className="flex justify-center">
//                         <button
//                           onClick={() => toggleSelection(String(tenant.id))}
//                           className="flex items-center justify-center h-4 w-4"
//                         >
//                           {selectedTenantIds.includes(String(tenant.id)) ? (
//                             <CheckSquare className="h-4 w-4 text-blue-600" />
//                           ) : (
//                             <Square className="h-4 w-4 text-slate-400" />
//                           )}
//                         </button>
//                       </div>
                      
//                       {/* Name Column */}
//                       <div className="space-y-0.5 col-span-2">
//                         <div className="flex items-center gap-2">
//                           {tenant.photo_url ? (
//                             <img 
//                               src={tenant.photo_url} 
//                               alt={tenant.full_name}
//                               className="h-8 w-8 object-cover rounded-full"
//                             />
//                           ) : (
//                             <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
//                               <Users className="h-4 w-4 text-blue-600" />
//                             </div>
//                           )}
//                           <div className="min-w-0">
//                             <p className="font-medium text-sm truncate">{tenant.full_name}</p>
//                             <p className="text-xs text-slate-500 capitalize truncate">{tenant.gender?.toLowerCase() || 'Not specified'}</p>
//                           </div>
//                         </div>
//                       </div>
                      
//                       {/* Contact Column */}
//                       <div className="space-y-0.5 col-span-2">
//                         <div className="flex items-center gap-1 text-xs">
//                           <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
//                           <span className="truncate">{tenant.email || 'No email'}</span>
//                         </div>
//                         <div className="flex items-center gap-1 text-xs">
//                           <Phone className="h-3 w-3 text-slate-400 flex-shrink-0" />
//                           <span className="truncate">{tenant.country_code || ''} {tenant.phone || 'No phone'}</span>
//                         </div>
//                         {tenant.city && (
//                           <div className="text-[10px] text-slate-500 truncate">
//                             <MapPin className="h-2.5 w-2.5 inline mr-0.5" />
//                             {tenant.city}{tenant.state && `, ${tenant.state}`}
//                           </div>
//                         )}
//                       </div>
                      
//                       {/* Occupation Column */}
//                       <div className="space-y-0.5">
//                         <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
//                           {tenant.occupation_category || "Other"}
//                         </Badge>
//                         <p className="text-xs mt-0.5 truncate">{tenant.exact_occupation || tenant.occupation || "Not specified"}</p>
//                       </div>
                      
//                       {/* Property Column */}
//                       <div className="space-y-0.5">
//                         {tenant.current_assignment || tenant.assigned_room_id ? (
//                           <>
//                             <div className="flex items-center gap-1">
//                               <Building className="h-3 w-3 text-slate-400 flex-shrink-0" />
//                               <span className="font-medium text-xs truncate">
//                                 {tenant.current_assignment?.property_name || tenant.assigned_property_name || 'Unknown'}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-1 text-[10px] text-slate-600">
//                               <Bed className="h-2.5 w-2.5 text-slate-400 flex-shrink-0" />
//                               Room {tenant.current_assignment?.room_number || tenant.assigned_room_number || 'N/A'} • Bed {tenant.current_assignment?.bed_number || tenant.assigned_bed_number || 'N/A'}
//                             </div>
//                             <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-green-50 text-green-700 border-green-200">
//                               <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
//                               Assigned
//                             </Badge>
//                           </>
//                         ) : (
//                           <div className="text-xs text-slate-400 italic">
//                             <Building className="h-3 w-3 inline mr-1" />
//                             No assignment
//                           </div>
//                         )}
//                       </div>
                      
//                       {/* Payments Column */}
//                       <div className="space-y-0.5">
//                         {(() => {
//                           const payments = tenant.payments || [];
//                           const paid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
//                           const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
                          
//                           return (
//                             <>
//                               <div className="flex items-center gap-1 text-xs">
//                                 {/* <IndianRupee className="h-3 w-3 text-green-600 flex-shrink-0" /> */}
//                                 <span className="text-green-600 font-medium truncate">₹{paid.toLocaleString()}</span>
//                               </div>
//                               {pending > 0 && (
//                                 <div className="flex items-center gap-1 text-xs">
//                                   <IndianRupee className="h-3 w-3 text-red-600 flex-shrink-0" />
//                                   <span className="text-red-600 truncate">₹{pending.toLocaleString()}</span>
//                                 </div>
//                               )}
//                               <div className="text-[10px] text-slate-500">
//                                 {payments.length} txn
//                               </div>
//                             </>
//                           );
//                         })()}
//                       </div>
                      
//                       {/* Status Column */}
//                       <div className="space-y-0.5">
//                         <div>
//                           <Badge 
//                             variant={tenant.is_active ? "default" : "secondary"} 
//                             className="text-[10px] py-0 px-1.5 h-4"
//                           >
//                             {tenant.is_active ? "Active" : "Inactive"}
//                           </Badge>
//                         </div>
//                         <div className="space-y-0.5">
//                           {tenant.portal_access_enabled ? (
//                             <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-blue-50 text-blue-700 border-blue-200">
//                               <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
//                               Portal Access
//                             </Badge>
//                           ) : (
//                             <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-slate-50 text-slate-700 border-slate-200">
//                               <XCircle className="h-2.5 w-2.5 mr-0.5" />
//                               No Portal
//                             </Badge>
//                           )}
//                           {tenant.has_credentials ? (
//                             <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-green-50 text-green-700 border-green-200">
//                               <Key className="h-2.5 w-2.5 mr-0.5" />
//                               Login Enabled
//                             </Badge>
//                           ) : (
//                             <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-orange-50 text-orange-700 border-orange-200">
//                               <XCircle className="h-2.5 w-2.5 mr-0.5" />
//                               No Login
//                             </Badge>
//                           )}
//                         </div>
//                       </div>
                      
//                       {/* Actions Column */}
//                       <div className="flex items-center justify-start">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
//                               <MoreVertical className="h-3.5 w-3.5" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end" className="text-xs">
//                             <DropdownMenuItem onClick={() => {
//                               setSelectedTenant(tenant);
//                               setIsViewDialogOpen(true);
//                             }}>
//                               <Eye className="h-3.5 w-3.5 mr-2" />
//                               View Details
//                             </DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => {
//                               setSelectedTenant(tenant);
//                               setIsEditDialogOpen(true);
//                             }}>
//                               <Edit className="h-3.5 w-3.5 mr-2" />
//                               Edit
//                             </DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => {
//                               setSelectedTenant(tenant);
//                               setCredentialPassword("");
//                               setIsCredentialDialogOpen(true);
//                             }}>
//                               <Key className="h-3.5 w-3.5 mr-2" />
//                               {tenant.has_credentials ? "Reset Password" : "Create Login"}
//                             </DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => handleTogglePortalAccess(tenant)}>
//                               <UserX className="h-3.5 w-3.5 mr-2" />
//                               {tenant.portal_access_enabled ? "Disable Portal" : "Enable Portal"}
//                             </DropdownMenuItem>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem 
//                               onClick={() => handleDelete(tenant)}
//                               className="text-red-600"
//                             >
//                               <Trash2 className="h-3.5 w-3.5 mr-2" />
//                               Delete
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </div>
//         </div>

//         {/* ── STICKY PAGINATION BAR ── */}
//         {!loading && tenants.length > 0 && (
//           <div className="shrink-0 border-t">
//             <PaginationBar />
//           </div>
//         )}
//       </Card>

//       {/* ── DIALOGS (unchanged) ── */}
//       {/* <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//         <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Add New Tenant</DialogTitle>
//           </DialogHeader>
//           <TenantForm 
//             onSuccess={handleSuccess} 
//             onCancel={() => setIsAddDialogOpen(false)} 
//           />
//         </DialogContent>
//       </Dialog> */}
//       <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//   <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col sm:px-0 rounded-2xl">
    
//     {/* Gradient header — responsive padding and height */}
//     <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 sm:px-6 py-3 sm:py-4 flex items-start justify-between flex-shrink-0">
//       <div>
//         <h2 className="text-base sm:text-lg font-bold text-white">+ Add New Tenant</h2>
//         <p className="text-blue-100 text-xs sm:text-sm mt-0.5">Fill in tenant details across all sections</p>
//       </div>
//       <button onClick={() => setIsAddDialogOpen(false)}
//         className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1">
//         <X className="h-4 w-4 sm:h-5 sm:w-5" />
//       </button>
//     </div>

//     {/* Form scrolls inside here */}
//     <div className="flex-1 overflow-y-auto px-3 sm:px-0">
//       <TenantForm onSuccess={handleSuccess} onCancel={() => setIsAddDialogOpen(false)} />
//     </div>
//   </DialogContent>
// </Dialog>

//       {/* View Dialog */}
//     {selectedTenant && (
//   <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
//     <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-3xl lg:max-w-5xl max-h-[90vh] overflow-hidden p-0 border-0 flex flex-col rounded-2xl">

//       {/* Sticky Gradient Header */}
//       <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-2 md:px-4 md:py-3 flex-shrink-0">
//         <DialogHeader className="space-y-0.5 md:space-y-1">
//           <div className="flex items-center justify-between gap-2">
//             <DialogTitle className="text-sm md:text-base lg:text-lg font-bold flex items-center gap-2 min-w-0">
//               <Users className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
//               <span className="truncate">Tenant Details: {selectedTenant.full_name}</span>
//             </DialogTitle>
//             <div className="flex items-center gap-1 flex-shrink-0">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-6 w-6 md:h-7 md:w-7 text-white hover:bg-white/20 rounded-full"
//                 onClick={() => {
//                   setIsViewDialogOpen(false);
//                   setIsEditDialogOpen(true);
//                 }}
//                 title="Edit"
//               >
//                 <Edit className="h-3 w-3 md:h-3.5 md:w-3.5" />
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-6 w-6 md:h-7 md:w-7 text-white hover:bg-white/20 rounded-full -mr-1"
//                 onClick={() => setIsViewDialogOpen(false)}
//               >
//                 <X className="h-3 w-3 md:h-4 md:w-4" />
//               </Button>
//             </div>
//           </div>
//           {/* Badges sub-row */}
//           <div className="flex items-center gap-1.5 flex-wrap">
//             <Badge className="text-[9px] px-1.5 py-0 bg-white text-violet-600 border-0">
//               {selectedTenant.is_active ? "Active" : "Inactive"}
//             </Badge>
//             <Badge className="text-[9px] px-1.5 py-0 bg-white/20 text-white border-0">
//               {selectedTenant.gender}
//             </Badge>
//             {selectedTenant.portal_access_enabled && (
//               <Badge className="text-[9px] px-1.5 py-0 bg-blue-400/30 text-white border-0">
//                 Portal Access Enabled
//               </Badge>
//             )}
//             {selectedTenant.has_credentials ? (
//               <Badge className="text-[9px] px-1.5 py-0 bg-green-400/30 text-white border-0">
//                 Login Enabled
//               </Badge>
//             ) : (
//               <Badge className="text-[9px] px-1.5 py-0 bg-orange-400/30 text-white border-0">
//                 No Login
//               </Badge>
//             )}
//           </div>
//         </DialogHeader>
//       </div>

//       {/* Scrollable Body */}
//       <div className="px-3 py-2 md:px-4 md:py-2.5 overflow-y-auto flex-1 min-h-0">
//         <div className="space-y-2 md:space-y-3">

//           {/* Profile Header */}
//           <div className="flex items-start gap-3 p-2 md:p-2.5 bg-slate-50 rounded-lg border">
//             {selectedTenant.photo_url && (
//               <img
//                 src={selectedTenant.photo_url}
//                 alt={selectedTenant.full_name}
//                 className="h-12 w-12 md:h-16 md:w-16 object-cover rounded-lg flex-shrink-0"
//               />
//             )}
//             <div className="flex-1 min-w-0">
//               <div className="flex items-start justify-between gap-2">
//                 <div className="min-w-0">
//                   <h3 className="text-xs md:text-sm font-bold truncate">{selectedTenant.full_name}</h3>
//                 </div>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="h-6 md:h-7 text-[9px] md:text-[10px] px-2 md:px-2.5 flex-shrink-0"
//                   onClick={() => {
//                     setIsViewDialogOpen(false);
//                     setIsEditDialogOpen(true);
//                   }}
//                 >
//                   <Edit className="h-2.5 w-2.5 mr-1" />
//                   Edit
//                 </Button>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">

//             {/* Contact Information */}
//             <Card className="border">
//               <CardHeader className="pb-2 px-2.5 pt-2.5 md:px-4 md:pt-3">
//                 <CardTitle className="text-xs md:text-sm">Contact Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-1.5 md:space-y-2 px-2.5 pb-2.5 md:px-4 md:pb-3">
//                 <div className="flex justify-between items-center gap-2">
//                   <span className="text-[10px] md:text-xs font-medium text-slate-600 flex-shrink-0">Email</span>
//                   <span className="text-[10px] md:text-xs truncate max-w-[160px] md:max-w-[200px]">
//                     {selectedTenant.email}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center gap-2">
//                   <span className="text-[10px] md:text-xs font-medium text-slate-600 flex-shrink-0">Phone</span>
//                   <span className="text-[10px] md:text-xs">
//                     {selectedTenant.country_code} {selectedTenant.phone}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-start gap-2">
//                   <span className="text-[10px] md:text-xs font-medium text-slate-600 flex-shrink-0">Address</span>
//                   <span className="text-[10px] md:text-xs text-right">
//                     {selectedTenant.address}<br />
//                     {selectedTenant.city}, {selectedTenant.state} - {selectedTenant.pincode}
//                   </span>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Occupation & Preferences */}
//             <Card className="border">
//               <CardHeader className="pb-2 px-2.5 pt-2.5 md:px-4 md:pt-3">
//                 <CardTitle className="text-xs md:text-sm">Occupation & Preferences</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-1.5 md:space-y-2 px-2.5 pb-2.5 md:px-4 md:pb-3">
//                 <div className="flex justify-between items-center gap-2">
//                   <span className="text-[10px] md:text-xs font-medium text-slate-600 flex-shrink-0">Occupation Category</span>
//                   <Badge variant="outline" className="text-[9px] md:text-[10px] px-1.5 py-0">
//                     {selectedTenant.occupation_category || "Other"}
//                   </Badge>
//                 </div>
//                 <div className="flex justify-between items-center gap-2">
//                   <span className="text-[10px] md:text-xs font-medium text-slate-600 flex-shrink-0">Occupation Details</span>
//                   <span className="text-[10px] md:text-xs truncate max-w-[140px] md:max-w-[170px]">
//                     {selectedTenant.exact_occupation || selectedTenant.occupation || "-"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-start gap-2">
//                   <span className="text-[10px] md:text-xs font-medium text-slate-600 flex-shrink-0">Room Preferences</span>
//                   <div className="flex gap-1 flex-wrap justify-end">
//                     {selectedTenant.preferred_sharing && (
//                       <Badge variant="outline" className="text-[9px] md:text-[10px] px-1.5 py-0">
//                         {selectedTenant.preferred_sharing} sharing
//                       </Badge>
//                     )}
//                     {selectedTenant.preferred_room_type && (
//                       <Badge variant="outline" className="text-[9px] md:text-[10px] px-1.5 py-0">
//                         {selectedTenant.preferred_room_type}
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Current Booking & Payments */}
//             <Card className="md:col-span-2 border">
//               <CardHeader className="pb-2 px-2.5 pt-2.5 md:px-4 md:pt-3">
//                 <CardTitle className="text-xs md:text-sm">Current Booking & Payments</CardTitle>
//               </CardHeader>
//               <CardContent className="px-2.5 pb-2.5 md:px-4 md:pb-3">
//                 {(selectedTenant.bookings ?? []).length > 0 ? (
//                   (selectedTenant.bookings ?? [])
//                     .filter(b => b.status === 'active')
//                     .map((booking) => (
//                       <div key={booking.id} className="space-y-2">
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 md:gap-2">
//                           <div>
//                             <p className="text-[9px] md:text-[10px] font-medium text-slate-600 mb-0.5">Property</p>
//                             <p className="text-[10px] md:text-xs font-medium">{booking.properties?.name}</p>
//                             <p className="text-[9px] md:text-[10px] text-slate-500">
//                               {booking.properties?.city}, {booking.properties?.state}
//                             </p>
//                           </div>
//                           {booking.room && (
//                             <div>
//                               <p className="text-[9px] md:text-[10px] font-medium text-slate-600 mb-0.5">Room Details</p>
//                               <p className="text-[10px] md:text-xs font-medium">Room {booking.room.room_number}</p>
//                               <p className="text-[9px] md:text-[10px] text-slate-500">
//                                 {booking.room.sharing_type} sharing • Floor {booking.room.floor || "-"}
//                               </p>
//                             </div>
//                           )}
//                           <div>
//                             <p className="text-[9px] md:text-[10px] font-medium text-slate-600 mb-0.5">Monthly Rent</p>
//                             <p className="text-[10px] md:text-xs font-medium text-green-600">
//                               ₹{booking.monthly_rent?.toLocaleString()}
//                             </p>
//                           </div>
//                         </div>

//                         {selectedTenant.payments && selectedTenant.payments.length > 0 && (
//                           <div className="mt-1.5 pt-1.5 border-t">
//                             <Separator className="my-1.5" />
//                             <h4 className="text-[10px] md:text-xs font-medium mb-1 md:mb-1.5">Payment History</h4>
//                             <div className="space-y-1 md:space-y-1.5">
//                               {selectedTenant.payments.slice(0, 5).map((payment) => (
//                                 <div key={payment.id} className="flex items-center justify-between p-1.5 md:p-2 bg-slate-50 rounded-lg border">
//                                   <div className="min-w-0">
//                                     <p className="text-[9px] md:text-[10px] font-medium truncate">
//                                       {payment.description || "Payment"}
//                                     </p>
//                                     <p className="text-[8px] md:text-[9px] text-slate-500">
//                                       {new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method}
//                                     </p>
//                                   </div>
//                                   <div className="text-right flex-shrink-0 ml-2">
//                                     <p className={`text-[10px] md:text-xs font-medium ${
//                                       payment.status === 'paid' ? 'text-green-600' : 'text-red-600'
//                                     }`}>
//                                       ₹{payment.amount?.toLocaleString()}
//                                     </p>
//                                     <Badge
//                                       variant={payment.status === 'paid' ? 'default' : 'secondary'}
//                                       className="text-[8px] md:text-[9px] px-1 py-0"
//                                     >
//                                       {payment.status}
//                                     </Badge>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     ))
//                 ) : (
//                   <p className="text-[10px] md:text-xs text-slate-500">No active booking</p>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Documents */}
//             <Card className="md:col-span-2 border">
//               <CardHeader className="pb-2 px-2.5 pt-2.5 md:px-4 md:pt-3">
//                 <CardTitle className="text-xs md:text-sm">Documents</CardTitle>
//               </CardHeader>
//               <CardContent className="px-2.5 pb-2.5 md:px-4 md:pb-3">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 md:gap-2">
//                   {selectedTenant.id_proof_url && (
//                     <div className="border rounded-lg p-2 md:p-2.5">
//                       <div className="flex items-center gap-1.5 mb-1">
//                         <FileText className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
//                         <span className="text-[10px] md:text-xs font-medium">ID Proof</span>
//                       </div>
//                       <a
//                         href={selectedTenant.id_proof_url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-[9px] md:text-[10px] text-blue-600 hover:underline"
//                       >
//                         View Document
//                       </a>
//                     </div>
//                   )}
//                   {selectedTenant.address_proof_url && (
//                     <div className="border rounded-lg p-2 md:p-2.5">
//                       <div className="flex items-center gap-1.5 mb-1">
//                         <FileText className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
//                         <span className="text-[10px] md:text-xs font-medium">Address Proof</span>
//                       </div>
//                       <a
//                         href={selectedTenant.address_proof_url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-[9px] md:text-[10px] text-blue-600 hover:underline"
//                       >
//                         View Document
//                       </a>
//                     </div>
//                   )}
//                   {selectedTenant.photo_url && (
//                     <div className="border rounded-lg p-2 md:p-2.5">
//                       <div className="flex items-center gap-1.5 mb-1">
//                         <FileText className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
//                         <span className="text-[10px] md:text-xs font-medium">Photo</span>
//                       </div>
//                       <a
//                         href={selectedTenant.photo_url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-[9px] md:text-[10px] text-blue-600 hover:underline"
//                       >
//                         View Photo
//                       </a>
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* System Information */}
//             <Card className="border">
//               <CardHeader className="pb-2 px-2.5 pt-2.5 md:px-4 md:pt-3">
//                 <CardTitle className="text-xs md:text-sm">System Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-1.5 md:space-y-2 px-2.5 pb-2.5 md:px-4 md:pb-3">
//                 <div className="flex justify-between items-center gap-2">
//                   <span className="text-[10px] md:text-xs font-medium text-slate-600">Created At</span>
//                   <span className="text-[10px] md:text-xs">
//                     {new Date(selectedTenant.created_at!).toLocaleDateString()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center gap-2">
//                   <span className="text-[10px] md:text-xs font-medium text-slate-600">Last Updated</span>
//                   <span className="text-[10px] md:text-xs">
//                     {selectedTenant.updated_at
//                       ? new Date(selectedTenant.updated_at).toLocaleDateString()
//                       : "-"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center gap-2">
//                   <span className="text-[10px] md:text-xs font-medium text-slate-600">Login Email</span>
//                   <span className="text-[10px] md:text-xs truncate max-w-[160px] md:max-w-[200px]">
//                     {selectedTenant.credential_email || "No login configured"}
//                   </span>
//                 </div>
//               </CardContent>
//             </Card>

//           </div>
//         </div>
//       </div>

//       {/* Sticky Footer */}
//       <DialogFooter className="sticky bottom-0 bg-white border-t px-3 py-2 md:px-4 md:py-2.5 flex-shrink-0">
//         <Button
//           variant="outline"
//           onClick={() => setIsViewDialogOpen(false)}
//           className="h-7 md:h-8 text-[10px] md:text-xs px-3 md:px-4 w-full md:w-auto"
//         >
//           Close
//         </Button>
//       </DialogFooter>

//     </DialogContent>
//   </Dialog>
// )}

//       {/* Edit Dialog */}
//       {selectedTenant && (
//   <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//     <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-hidden p-0 border-0 flex flex-col rounded-2xl">

//       {/* Sticky Gradient Header */}
//       <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-2 md:px-4 md:py-3 flex-shrink-0 ">
//         <DialogHeader className="space-y-0.5 md:space-y-1">
//           <div className="flex items-center justify-between gap-2">
//             <DialogTitle className="text-sm md:text-base lg:text-lg font-bold flex items-center gap-2 min-w-0">
//               <Edit className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
//               <span className="truncate">Edit Tenant: {selectedTenant.full_name}</span>
//             </DialogTitle>
//             <Button
//               variant="ghost"
//               size="icon"
//               className="h-6 w-6 md:h-7 md:w-7 text-white hover:bg-white/20 rounded-full -mr-1"
//               onClick={() => {
//                 setIsEditDialogOpen(false);
//                 setSelectedTenant(null);
//               }}
//             >
//               <X className="h-3 w-3 md:h-4 md:w-4" />
//             </Button>
//           </div>
//         </DialogHeader>
//       </div>

//       {/* Scrollable Form Body */}
//       <div className="overflow-y-auto flex-1 min-h-0">
//         <TenantForm
//           tenant={selectedTenant}
//           onSuccess={handleSuccess}
//           onCancel={() => {
//             setIsEditDialogOpen(false);
//             setSelectedTenant(null);
//           }}
//         />
//       </div>

//     </DialogContent>
//   </Dialog>
// )}


//       {/* Credential Dialog */}
//       {selectedTenant && (
//         <Dialog open={isCredentialDialogOpen} onOpenChange={setIsCredentialDialogOpen}>
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>
//                 {selectedTenant.has_credentials ? "Reset Password" : "Create Login Credentials"}
//               </DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4 py-4">
//               <div className="space-y-2">
//                 <Label>Tenant Name</Label>
//                 <Input value={selectedTenant.full_name} disabled />
//               </div>
//               <div className="space-y-2">
//                 <Label>Email</Label>
//                 <Input value={selectedTenant.email} disabled />
//               </div>
//               <div className="space-y-2">
//                 <Label>{selectedTenant.has_credentials ? "New Password" : "Password"} *</Label>
//                 <Input
//                   type="password"
//                   placeholder="Enter password"
//                   value={credentialPassword}
//                   onChange={(e) => setCredentialPassword(e.target.value)}
//                 />
//                 <p className="text-xs text-slate-500">Minimum 6 characters required</p>
//               </div>
//               <div className="flex justify-end gap-2">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setIsCredentialDialogOpen(false);
//                     setCredentialPassword("");
//                     setSelectedTenant(null);
//                   }}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleCredentialSubmit}
//                   disabled={credentialLoading || !credentialPassword || credentialPassword.length < 6}
//                 >
//                   {credentialLoading ? "Processing..." : selectedTenant.has_credentials ? "Reset Password" : "Create Login"}
//                 </Button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }



// components/admin/tenants/tenants-client.tsx
"use client";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Download, CheckCircle, XCircle, UserX, Trash2, Filter, SlidersHorizontal, MoreVertical, Eye, Edit, Key, Mail, Phone, Building, Bed, MapPin, Users, FileText, IndianRupee, CheckSquare, Square, Search, X, Briefcase, Building2, Globe, LogIn, ShieldCheck, Users2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, } from "lucide-react";
import { toast } from "sonner";
import { deleteTenant, bulkDeleteTenants, bulkUpdateTenantStatus, bulkUpdateTenantPortalAccess, updateTenantSimple, createCredential, resetCredential, exportTenantsToExcel, listTenants, type Tenant, type TenantFilters, } from "@/lib/tenantApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/admin/data-table";
import type { Column, FilterConfig, BulkAction, ActionButton } from "@/components/admin/data-table";
import { TenantForm } from "@/components/admin/tenants/tenant-form";

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
                      {tenant.photo_url ? (
                        <img src={tenant.photo_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-200" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-[10px]">{tenant.full_name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-xs text-gray-900 truncate leading-tight">{tenant.full_name}</div>
                        <div className="text-[10px] text-gray-400 capitalize leading-tight">{tenant.gender?.toLowerCase() || 'N/A'}</div>
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
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl">
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
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl">
            {/* Sticky Gradient Header */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-4 md:px-6 py-3 flex items-start justify-between flex-shrink-0">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-sm font-semibold text-white truncate">
                  Tenant Details: {selectedTenant.full_name}
                </DialogTitle>
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  <Badge className={`text-[9px] px-1.5 py-0 h-4 ${selectedTenant.is_active ? "bg-emerald-500" : "bg-gray-400"} text-white border-0`}>
                    {selectedTenant.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-white/40 text-white bg-white/20">
                    {selectedTenant.gender}
                  </Badge>
                  {selectedTenant.portal_access_enabled && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-white/40 text-white bg-white/20">
                      Portal Access Enabled
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
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
                  onClick={() => { setIsViewDialogOpen(false); setIsEditDialogOpen(true); }}
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20" onClick={() => setIsViewDialogOpen(false)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
              {/* Profile Header */}
              <div className="flex items-center gap-3">
                {selectedTenant.photo_url && (
                  <img src={selectedTenant.photo_url} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-100" />
                )}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{selectedTenant.full_name}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 h-6 text-[10px] px-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => { setIsViewDialogOpen(false); setIsEditDialogOpen(true); }}
                  >
                    <Edit className="w-2.5 h-2.5 mr-1" /> Edit
                  </Button>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Contact Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Email</span>
                    <span className="text-gray-800">{selectedTenant.email}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Phone</span>
                    <span className="text-gray-800">{selectedTenant.country_code} {selectedTenant.phone}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Address</span>
                    <span className="text-gray-800 text-right max-w-[200px]">{selectedTenant.address} {selectedTenant.city}, {selectedTenant.state} - {selectedTenant.pincode}</span>
                  </div>
                </div>
              </div>

              {/* Occupation & Preferences */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Occupation & Preferences
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Occupation Category</span>
                    <span className="text-gray-800">{selectedTenant.occupation_category || "Other"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Occupation Details</span>
                    <span className="text-gray-800">{selectedTenant.exact_occupation || selectedTenant.occupation || "-"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Room Preferences</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {selectedTenant.preferred_sharing && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">{selectedTenant.preferred_sharing} sharing</Badge>
                      )}
                      {selectedTenant.preferred_room_type && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">{selectedTenant.preferred_room_type}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Booking & Payments */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Building className="w-3 h-3" /> Current Booking & Payments
                </h4>
                {(selectedTenant.bookings ?? []).length > 0 ? (
                  (selectedTenant.bookings ?? [])
                    .filter(b => b.status === 'active')
                    .map((booking) => (
                      <div key={booking.id} className="bg-gray-50 rounded-lg p-3 space-y-3">
                        <div className="space-y-1">
                          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Property</div>
                          <div className="text-xs font-medium text-gray-900">{booking.properties?.name}</div>
                          <div className="text-[10px] text-gray-500">{booking.properties?.city}, {booking.properties?.state}</div>
                        </div>
                        {booking.room && (
                          <div className="space-y-1">
                            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Room Details</div>
                            <div className="text-xs text-gray-900">Room {booking.room.room_number}</div>
                            <div className="text-[10px] text-gray-500">{booking.room.sharing_type} sharing · Floor {booking.room.floor || "-"}</div>
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Monthly Rent</div>
                          <div className="text-sm font-semibold text-green-600">₹{booking.monthly_rent?.toLocaleString()}</div>
                        </div>
                        {selectedTenant.payments && selectedTenant.payments.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Payment History</div>
                            {selectedTenant.payments.slice(0, 5).map((payment) => (
                              <div key={payment.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                                <div>
                                  <div className="text-xs text-gray-800">{payment.description || "Payment"}</div>
                                  <div className="text-[10px] text-gray-400">{new Date(payment.payment_date).toLocaleDateString()} · {payment.payment_method}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs font-semibold text-gray-900">₹{payment.amount?.toLocaleString()}</div>
                                  <Badge className={`text-[9px] px-1 py-0 h-3.5 ${payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'} border-0`}>
                                    {payment.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-xs text-gray-400">No active booking</div>
                )}
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Documents
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {selectedTenant.id_proof_url && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">ID Proof</span>
                      <a href={selectedTenant.id_proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">View Document</a>
                    </div>
                  )}
                  {selectedTenant.address_proof_url && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Address Proof</span>
                      <a href={selectedTenant.address_proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">View Document</a>
                    </div>
                  )}
                  {selectedTenant.photo_url && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Photo</span>
                      <a href={selectedTenant.photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">View Photo</a>
                    </div>
                  )}
                </div>
              </div>

              {/* System Information */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> System Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Created At</span>
                    <span className="text-gray-800">{new Date(selectedTenant.created_at!).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="text-gray-800">{selectedTenant.updated_at ? new Date(selectedTenant.updated_at).toLocaleDateString() : "-"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Login Email</span>
                    <span className="text-gray-800">{selectedTenant.credential_email || "No login configured"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="border-t bg-gray-50 px-4 py-2.5 flex justify-end flex-shrink-0">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="h-7 md:h-8 text-[10px] md:text-xs px-3 md:px-4 w-full md:w-auto">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {selectedTenant && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl">
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
          <DialogContent className="max-w-sm rounded-xl">
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
    </Card>
  );
}