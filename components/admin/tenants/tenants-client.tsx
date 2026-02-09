// components/admin/tenants/tenants-client.tsx

// "use client";

// import { useCallback, useEffect, useMemo, useState, useRef } from "react";
// import { AdminHeader } from "@/components/admin/admin-header";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import {
//   Users,
//   Plus,
//   Mail,
//   Phone,
//   FileText,
//   Edit,
//   Trash2,
//   Eye,
//   CheckCircle,
//   XCircle,
//   UserX,
//   Key,
//   RefreshCw,
//   Download,
//   Filter,
//   IndianRupee,
//   MapPin,
//   Building,
//   Bed,
//   X,
//   SlidersHorizontal,
//   MoreVertical,
// } from "lucide-react";
// import { toast } from "sonner";
// import { DataTable } from "@/components/admin/data-table";
// import type { Column, FilterConfig, BulkAction, ActionButton } from "@/components/admin/data-table";

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
// import { TenantForm } from "@/components/admin/tenants/tenant-form";
// import { columnsConfig } from "@/components/admin/tenants/columns-config";

// interface TenantsClientProps {
//   initialData: Tenant[];
//   initialFilters: TenantFilters;
//   initialLoading: boolean;
// }

// export default function TenantsClient({ 
//   initialData = [], 
//   initialFilters = {},
//   initialLoading = false 
// }: TenantsClientProps) {
//   // State management
//   const [tenants, setTenants] = useState<Tenant[]>(initialData);
//   const [loading, setLoading] = useState(initialLoading);
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false);
//   const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
//   const [credentialPassword, setCredentialPassword] = useState("");
//   const [credentialLoading, setCredentialLoading] = useState(false);
//   const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
//   const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
//   const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  
//   // Filters state - using ref to prevent unnecessary re-renders
//   const filtersRef = useRef<TenantFilters>(initialFilters);
//   const [filters, setFiltersState] = useState<TenantFilters>(initialFilters);
  
//   // Column search state
//   const [columnSearch, setColumnSearch] = useState({
//     name: "",
//     contact: "",
//     occupation: "",
//     property: "",
//     payments: "",
//     status: "",
//   });

//   // Load tenants with useCallback to prevent recreation
//   const loadTenants = useCallback(async (customFilters?: TenantFilters) => {
//     setLoading(true);
//     try {
//       const filtersToUse = customFilters || filtersRef.current;
//       const res = await listTenants(filtersToUse);
      
//       if (res && res.success) {
//         setTenants(res.data || []);
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

//   // Handle filter updates - DEFINE THIS FIRST
//   const handleFilterChange = useCallback((newFilters: TenantFilters) => {
//     filtersRef.current = newFilters;
//     setFiltersState(newFilters);
//     loadTenants(newFilters);
//   }, [loadTenants]);

//   // Clear ALL filters including column search
//   const clearAllFilters = useCallback(() => {
//     // Clear main filters
//     const emptyFilters = {
//       search: "",
//       page: 1,
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
    
//     // Clear column search
//     setColumnSearch({
//       name: "",
//       contact: "",
//       occupation: "",
//       property: "",
//       payments: "",
//       status: "",
//     });
    
//     // Reload with empty filters
//     loadTenants(emptyFilters);
//     setIsFilterSidebarOpen(false);
    
//     toast.success("All filters cleared");
//   }, [loadTenants]);

//   // Clear only sidebar filters (not column search)
//   const clearSidebarFilters = useCallback(() => {
//     const emptyFilters = {
//       search: filters.search || "", // Keep search from header
//       page: 1,
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
    
//     toast.success("Filters cleared");
//   }, [filters.search, loadTenants]);

//   // Handler functions with useCallback
//   const handleSuccess = useCallback(() => {
//     toast.success("Tenant saved successfully");
//     setIsAddDialogOpen(false);
//     setIsEditDialogOpen(false);
//     setSelectedTenant(null);
//     loadTenants();
//   }, [loadTenants]);

//   const handleDelete = useCallback(async (tenant: Tenant) => {
//     try {
//       const res = await deleteTenant(tenant.id as any);
//       if (!res || !res.success) {
//         toast.error(res?.message || "Failed to delete tenant");
//       } else {
//         toast.success("Tenant deleted successfully");
//         loadTenants();
//       }
//     } catch (err) {
//       console.error("handleDelete", err);
//       toast.error("Failed to delete tenant");
//     }
//   }, [loadTenants]);

//   const handleBulkDelete = useCallback(async (selectedIds: string[]) => {
//     try {
//       const res = await bulkDeleteTenants(selectedIds);
//       if (!res || !res.success) {
//         toast.error(res?.message || "Failed to delete tenants");
//       } else {
//         toast.success(`${selectedIds.length} tenants deleted successfully`);
//         setSelectedTenantIds([]);
//         loadTenants();
//       }
//     } catch (err) {
//       console.error("handleBulkDelete", err);
//       toast.error("Failed to delete tenants");
//     }
//   }, [loadTenants]);

//   const handleBulkStatusChange = useCallback(async (selectedIds: string[], status: boolean = true) => {
//     try {
//       const res = await bulkUpdateTenantStatus(selectedIds, status);
//       if (!res || !res.success) {
//         toast.error(res?.message || "Failed to update status");
//       } else {
//         toast.success(`${selectedIds.length} tenants updated successfully`);
//         setSelectedTenantIds([]);
//         loadTenants();
//       }
//     } catch (err) {
//       console.error("handleBulkStatusChange", err);
//       toast.error("Failed to update status");
//     }
//   }, [loadTenants]);

//   const handleBulkPortalAccess = useCallback(async (selectedIds: string[], enabled: boolean) => {
//     try {
//       const res = await bulkUpdateTenantPortalAccess(selectedIds, enabled);
//       if (!res || !res.success) {
//         toast.error(res?.message || "Failed to update portal access");
//       } else {
//         toast.success(`${selectedIds.length} tenants portal access updated`);
//         setSelectedTenantIds([]);
//         loadTenants();
//       }
//     } catch (err) {
//       console.error("handleBulkPortalAccess", err);
//       toast.error("Failed to update portal access");
//     }
//   }, [loadTenants]);

//   const handleTogglePortalAccess = useCallback(async (tenant: Tenant) => {
//     try {
//       const res = await updateTenantSimple(tenant.id as any, {
//         portal_access_enabled: !tenant.portal_access_enabled,
//       });
      
//       if (!res || !res.success) {
//         toast.error(res?.message || "Failed to update portal access");
//       } else {
//         toast.success("Portal access updated successfully");
//         loadTenants();
//       }
//     } catch (err: any) {
//       console.error("handleTogglePortalAccess", err);
//       toast.error("Failed to update portal access");
//     }
//   }, [loadTenants]);

//   // Handle column search changes - MOVED AFTER handleFilterChange
//   const handleColumnSearchChange = useCallback((column: keyof typeof columnSearch, value: string) => {
//     setColumnSearch(prev => ({
//       ...prev,
//       [column]: value
//     }));
    
//     // Also update the main search filter if changing name column
//     if (column === 'name') {
//       handleFilterChange({ ...filtersRef.current, search: value });
//     }
//   }, [handleFilterChange]); // Only depend on handleFilterChange

//   const clearColumnSearch = useCallback(() => {
//     setColumnSearch({
//       name: "",
//       contact: "",
//       occupation: "",
//       property: "",
//       payments: "",
//       status: "",
//     });
    
//     // Also clear name filter in main filters
//     if (filtersRef.current.search) {
//       handleFilterChange({ ...filtersRef.current, search: "" });
//     }
//   }, [handleFilterChange]);

//   const handleTenantSelection = useCallback((selectedIds: string[]) => {
//     setSelectedTenantIds(selectedIds);
//   }, []);

//   const handleBulkAction = useCallback(async (action: BulkAction, selectedIds: string[]) => {
//     if (selectedIds.length === 0) {
//       toast.error("No tenants selected");
//       return;
//     }

//     if (action.confirmMessage) {
//       if (!confirm(action.confirmMessage)) return;
//     }

//     try {
//       await action.action(selectedIds);
//     } catch (error) {
//       console.error("Bulk action error:", error);
//       toast.error("Failed to perform bulk action");
//     }
//   }, []);

//   const handleExportToExcel = useCallback(async () => {
//     try {
//       const exportFilters = Object.fromEntries(
//         Object.entries(filtersRef.current).filter(([_, value]) => value !== "")
//       );

//       const result = await exportTenantsToExcel(exportFilters);
      
//       if (result.success) {
//         toast.success('Data exported successfully');
//       } else {
//         toast.error('Failed to export data');
//       }
//     } catch (err: any) {
//       console.error('Export error:', err);
//       toast.error(err.message || 'Failed to export data');
//     }
//   }, []);

//   // Memoized columns configuration
//   const columns = useMemo(() => columnsConfig(setSelectedTenant, setIsViewDialogOpen), []);

//   // Memoized table filters
//   const tableFilters = useMemo(() => [
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
//   ].map(filter => ({
//     ...filter,
//     options: filter.options?.map(opt => ({
//       ...opt,
//       value: opt.value || "empty"
//     }))
//   })), []);

//   // Memoized bulk actions - FOR THE DROPDOWN
//   const bulkActions = useMemo(() => [
//     {
//       label: "Activate Selected",
//       icon: <CheckCircle className="h-4 w-4" />,
//       action: handleBulkStatusChange,
//     },
//     {
//       label: "Deactivate Selected",
//       icon: <XCircle className="h-4 w-4" />,
//       action: (selectedIds: string[]) => handleBulkStatusChange(selectedIds, false),
//     },
//     {
//       label: "Enable Portal Access",
//       icon: <UserX className="h-4 w-4" />,
//       action: (selectedIds: string[]) => handleBulkPortalAccess(selectedIds, true),
//     },
//     {
//       label: "Disable Portal Access",
//       icon: <UserX className="h-4 w-4" />,
//       action: (selectedIds: string[]) => handleBulkPortalAccess(selectedIds, false),
//     },
//     {
//       label: "Delete Selected",
//       icon: <Trash2 className="h-4 w-4" />,
//       action: handleBulkDelete,
//       variant: "destructive" as const,
//       confirmMessage: "Are you sure you want to delete the selected tenants?",
//     },
//   ], [handleBulkStatusChange, handleBulkPortalAccess, handleBulkDelete]);

//   // Memoized actions
//   const actions = useMemo(() => [
//     {
//       label: "View Details",
//       icon: <Eye className="h-4 w-4" />,
//       action: (tenant: Tenant) => {
//         setSelectedTenant(tenant);
//         setIsViewDialogOpen(true);
//       },
//     },
//     {
//       label: "Edit",
//       icon: <Edit className="h-4 w-4" />,
//       action: (tenant: Tenant) => {
//         setSelectedTenant(tenant);
//         setIsEditDialogOpen(true);
//       },
//     },
//     {
//       label: "Create Login",
//       icon: <Key className="h-4 w-4" />,
//       action: (tenant: Tenant) => {
//         setSelectedTenant(tenant);
//         setCredentialPassword("");
//         setIsCredentialDialogOpen(true);
//       },
//       show: (tenant: Tenant) => !tenant.has_credentials,
//     },
//     {
//       label: "Reset Password",
//       icon: <RefreshCw className="h-4 w-4" />,
//       action: (tenant: Tenant) => {
//         setSelectedTenant(tenant);
//         setCredentialPassword("");
//         setIsCredentialDialogOpen(true);
//       },
//       show: (tenant: Tenant) => tenant.has_credentials === true,
//     },
//     {
//       label: "Toggle Portal Access",
//       icon: <UserX className="h-4 w-4" />,
//       action: handleTogglePortalAccess,
//     },
//     {
//       label: "Delete",
//       icon: <Trash2 className="h-4 w-4" />,
//       action: handleDelete,
//       variant: "destructive" as const,
//     },
//   ], [setSelectedTenant, setIsViewDialogOpen, setIsEditDialogOpen, setIsCredentialDialogOpen, setCredentialPassword, handleTogglePortalAccess, handleDelete]);

//   // Calculate active filters count - FIXED: Check all filters properly
//   const activeFiltersCount = useMemo(() => {
//     const mainFilters = Object.values(filters).filter(value => 
//       value !== undefined && value !== null && value !== ''
//     ).length;
    
//     const columnFilters = Object.values(columnSearch).filter(value => 
//       value !== undefined && value !== null && value !== ''
//     ).length;
    
//     return mainFilters + columnFilters;
//   }, [filters, columnSearch]);

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

//   return (
//     <div className="p-2">
//       <Card className="border-0 shadow-lg">
//         <CardHeader className="sticky top-16 z-10 bg-blue-600 shadow-md border-b py-3 h-auto min-h-[60px]">  
//           <div className="flex flex-col gap-3">
//             {/* Button row - Add on left, others on right */}
//             <div className="flex justify-between items-center w-full">
//               {/* Left side - Add Tenant button */}
//               <div className="rounded-lg p-2 shadow-sm">
//                 <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//                   <DialogTrigger asChild>
//                     <Button className="bg-white text-black hover:bg-teal-500 hover:text-white h-9">
//                       <Plus className="h-4 w-4 mr-2" />
//                       Add Tenant
//                     </Button>
//                   </DialogTrigger>
//                 </Dialog>
//               </div>

//               {/* Right side - Refresh, Filters, Bulk Actions, Export */}
//               <div className="flex gap-2 rounded-lg p-2 shadow-sm">
//                 <Button
//                   variant="outline"
//                   onClick={() => loadTenants()}
//                   className="flex items-center gap-2 h-9 px-3"
//                   disabled={loading}
//                   title="Refresh"
//                 >
//                   <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
//                 </Button>
                
//                 {/* Filter Sidebar Trigger */}
//                 <Button
//                   variant="outline"
//                   className="flex items-center gap-2 h-9"
//                   onClick={() => setIsFilterSidebarOpen(true)}
//                 >
//                   <SlidersHorizontal className="h-4 w-4" />
//                   Filters
//                   {activeFiltersCount > 0 && (
//                     <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
//                       {activeFiltersCount}
//                     </Badge>
//                   )}
//                 </Button>
                
//                 {/* Bulk Actions Dropdown */}
//                 <DropdownMenu open={isBulkActionOpen} onOpenChange={setIsBulkActionOpen}>
//                   <DropdownMenuTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className="flex items-center gap-2 h-9"
//                       disabled={selectedTenantIds.length === 0}
//                     >
//                       <CheckCircle className="h-4 w-4" />
//                       Bulk Actions
//                       {selectedTenantIds.length > 0 && (
//                         <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
//                           {selectedTenantIds.length}
//                         </Badge>
//                       )}
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end">
//                     {bulkActions.map((action, index) => (
//                       <DropdownMenuItem
//                         key={index}
//                         onClick={() => {
//                           if (action.confirmMessage && !confirm(action.confirmMessage)) return;
//                           action.action(selectedTenantIds);
//                           setIsBulkActionOpen(false);
//                         }}
//                         className={action.variant === 'destructive' ? 'text-red-600' : ''}
//                       >
//                         {action.icon}
//                         <span className="ml-2">{action.label}</span>
//                       </DropdownMenuItem>
//                     ))}
//                   </DropdownMenuContent>
//                 </DropdownMenu>
                
//                 <Button
//                   variant="outline"
//                   onClick={handleExportToExcel}
//                   className="flex items-center gap-2 h-9"
//                 >
//                   <Download className="h-4 w-4" />
//                   Export
//                 </Button>
//               </div>
//             </div>

//             {/* Filter Summary Badges - Show only when there are active filters */}
//             {activeFiltersCount > 0 && (
//               <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg border shadow-sm">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <Filter className="h-3 w-3" />
//                     <span className="font-medium text-xs">
//                       Active Filters ({activeFiltersCount})
//                     </span>
//                   </div>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={clearAllFilters}
//                     className="text-xs h-6 px-2"
//                   >
//                     Clear all
//                   </Button>
//                 </div>
                
//                 {/* Show individual filter badges */}
//                 <div className="flex flex-wrap gap-1 mt-2">
//                   {filters.search && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       Search: {filters.search}
//                     </Badge>
//                   )}
//                   {filters.is_active && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       Status: {filters.is_active === "true" ? "Active" : "Inactive"}
//                     </Badge>
//                   )}
//                   {filters.gender && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       Gender: {filters.gender}
//                     </Badge>
//                   )}
//                   {filters.occupation_category && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       Occupation: {filters.occupation_category}
//                     </Badge>
//                   )}
//                   {filters.city && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       City: {filters.city}
//                     </Badge>
//                   )}
//                   {filters.state && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       State: {filters.state}
//                     </Badge>
//                   )}
//                   {filters.preferred_sharing && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       Sharing: {filters.preferred_sharing}
//                     </Badge>
//                   )}
//                   {filters.portal_access_enabled && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       Portal: {filters.portal_access_enabled === "true" ? "Enabled" : "Disabled"}
//                     </Badge>
//                   )}
//                   {filters.has_credentials && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       Login: {filters.has_credentials === "true" ? "Has Login" : "No Login"}
//                     </Badge>
//                   )}
//                   {columnSearch.name && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       Name: {columnSearch.name}
//                     </Badge>
//                   )}
//                   {columnSearch.contact && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       Contact: {columnSearch.contact}
//                     </Badge>
//                   )}
//                   {columnSearch.occupation && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       Occupation: {columnSearch.occupation}
//                     </Badge>
//                   )}
//                   {columnSearch.property && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       Property: {columnSearch.property}
//                     </Badge>
//                   )}
//                   {columnSearch.payments && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       Payments: {columnSearch.payments}
//                     </Badge>
//                   )}
//                   {columnSearch.status && (
//                     <Badge variant="secondary" className="text-xs h-5">
//                       Status: {columnSearch.status}
//                     </Badge>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </CardHeader>

//         <CardContent className="p-0">
//           {/* Column Search Fields */}
//           <div className="bg-slate-100 border-b">
//             <div className="grid grid-cols-12 gap-2 px-6 py-3">
//               {/* Name Column Header with Search */}
//               <div className="col-span-2">
//                 <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
//                   Name
//                 </div>
//                 <Input
//                   placeholder="Search name..."
//                   value={columnSearch.name}
//                   onChange={(e) => handleColumnSearchChange('name', e.target.value)}
//                   className="mt-2 h-8 text-sm"
//                 />
//               </div>
              
//               {/* Contact Column Header with Search */}
//               <div className="col-span-2">
//                 <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
//                   Contact
//                 </div>
//                 <Input
//                   placeholder="Search email/phone..."
//                   value={columnSearch.contact}
//                   onChange={(e) => handleColumnSearchChange('contact', e.target.value)}
//                   className="mt-2 h-8 text-sm"
//                 />
//               </div>
              
//               {/* Occupation Column Header with Search */}
//               <div className="col-span-2">
//                 <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
//                   Occupation
//                 </div>
//                 <Input
//                   placeholder="Search occupation..."
//                   value={columnSearch.occupation}
//                   onChange={(e) => handleColumnSearchChange('occupation', e.target.value)}
//                   className="mt-2 h-8 text-sm"
//                 />
//               </div>
              
//               {/* Property Column Header with Search */}
//               <div className="col-span-2">
//                 <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
//                   Property & Room
//                 </div>
//                 <Input
//                   placeholder="Search property..."
//                   value={columnSearch.property}
//                   onChange={(e) => handleColumnSearchChange('property', e.target.value)}
//                   className="mt-2 h-8 text-sm"
//                 />
//               </div>
              
//               {/* Payments Column Header with Search */}
//               <div className="col-span-2">
//                 <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
//                   Payments
//                 </div>
//                 <Input
//                   placeholder="Search payments..."
//                   value={columnSearch.payments}
//                   onChange={(e) => handleColumnSearchChange('payments', e.target.value)}
//                   className="mt-2 h-8 text-sm"
//                 />
//               </div>
              
//               {/* Status Column Header with Search */}
//               <div className="col-span-1">
//                 <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
//                   Status
//                 </div>
//                 <Input
//                   placeholder="Search status..."
//                   value={columnSearch.status}
//                   onChange={(e) => handleColumnSearchChange('status', e.target.value)}
//                   className="mt-2 h-8 text-sm"
//                 />
//               </div>
              
//               {/* Actions Column */}
//               <div className="col-span-1 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
//                 Actions
//               </div>
//             </div>
//           </div>
          
//           {/* DataTable Component - WITHOUT built-in headers */}
//           <div className="p-6">
//             <DataTable
//               data={tenants.map(t => ({ ...t, id: String(t.id) }))}
//               columns={columns}
//               filters={tableFilters}
//               bulkActions={bulkActions}
//               actions={actions}
//               loading={loading}
//               onRefresh={loadTenants}
//               searchPlaceholder="Search tenants..."
//               emptyMessage="No tenants found. Add your first tenant to get started."
//               pageSize={15}
//               showSearch={false}
//               showFilters={false}
//               showRefresh={false}
//               showExport={false}
//               showColumnHeaders={false}
//               onSearchChange={(search) => {
//                 handleFilterChange({ ...filters, search });
//                 // Also update name column search
//                 setColumnSearch(prev => ({ ...prev, name: search }));
//               }}
//               onFilterChange={(key, value) => {
//                 handleFilterChange({ ...filters, [key]: value });
//               }}
//               onSelectionChange={handleTenantSelection}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Filter Sidebar */}
//       <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
//         <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
//           <SheetHeader className="border-b pb-4">
//             <div className="flex items-center justify-between">
//               <SheetTitle className="flex items-center gap-2">
//                 <SlidersHorizontal className="h-5 w-5" />
//                 Advanced Filters
//               </SheetTitle>
//             </div>
//             {activeFiltersCount > 0 && (
//               <div className="flex items-center justify-between mt-2">
//                 <span className="text-sm text-slate-600">
//                   Active filters: {activeFiltersCount}
//                 </span>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={clearSidebarFilters}
//                   className="text-xs h-7"
//                 >
//                   Clear filters
//                 </Button>
//               </div>
//             )}
//           </SheetHeader>
          
//           <div className="space-y-6 py-6">
//             <div className="space-y-4">
//               <h3 className="font-medium text-sm">Status & Access</h3>
//               <FilterSelect
//                 label="Account Status"
//                 value={filters.is_active || ""}
//                 onChange={(value) => handleFilterChange({...filters, is_active: value})}
//                 options={[
//                   { value: "true", label: "Active" },
//                   { value: "false", label: "Inactive" },
//                 ]}
//               />
              
//               <FilterSelect
//                 label="Portal Access"
//                 value={filters.portal_access_enabled || ""}
//                 onChange={(value) => handleFilterChange({...filters, portal_access_enabled: value})}
//                 options={[
//                   { value: "true", label: "Enabled" },
//                   { value: "false", label: "Disabled" },
//                 ]}
//               />
              
//               <FilterSelect
//                 label="Login Status"
//                 value={filters.has_credentials || ""}
//                 onChange={(value) => handleFilterChange({...filters, has_credentials: value})}
//                 options={[
//                   { value: "true", label: "Has Login" },
//                   { value: "false", label: "No Login" },
//                 ]}
//               />
//             </div>
            
//             <Separator />
            
//             <div className="space-y-4">
//               <h3 className="font-medium text-sm">Personal Information</h3>
//               <FilterSelect
//                 label="Gender"
//                 value={filters.gender || ""}
//                 onChange={(value) => handleFilterChange({...filters, gender: value})}
//                 options={[
//                   { value: "Male", label: "Male" },
//                   { value: "Female", label: "Female" },
//                   { value: "Other", label: "Other" },
//                 ]}
//               />
              
//               <FilterSelect
//                 label="Occupation"
//                 value={filters.occupation_category || ""}
//                 onChange={(value) => handleFilterChange({...filters, occupation_category: value})}
//                 options={[
//                   { value: "Service", label: "Service" },
//                   { value: "Business", label: "Business" },
//                   { value: "Student", label: "Student" },
//                   { value: "Other", label: "Other" },
//                 ]}
//               />
//             </div>
            
//             <Separator />
            
//             <div className="space-y-4">
//               <h3 className="font-medium text-sm">Location</h3>
//               <div className="space-y-2">
//                 <Label className="text-xs">City</Label>
//                 <Input
//                   placeholder="Enter city"
//                   value={filters.city || ""}
//                   onChange={(e) => handleFilterChange({...filters, city: e.target.value})}
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label className="text-xs">State</Label>
//                 <Input
//                   placeholder="Enter state"
//                   value={filters.state || ""}
//                   onChange={(e) => handleFilterChange({...filters, state: e.target.value})}
//                 />
//               </div>
//             </div>
            
//             <Separator />
            
//             <div className="space-y-4">
//               <h3 className="font-medium text-sm">Preferences</h3>
//               <FilterSelect
//                 label="Sharing Type"
//                 value={filters.preferred_sharing || ""}
//                 onChange={(value) => handleFilterChange({...filters, preferred_sharing: value})}
//                 options={[
//                   { value: "single", label: "Single" },
//                   { value: "double", label: "Double" },
//                   { value: "triple", label: "Triple" },
//                 ]}
//               />
//             </div>
            
//             <div className="sticky bottom-0 pt-4 border-t mt-6">
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   onClick={clearSidebarFilters}
//                   className="flex-1"
//                 >
//                   Clear Filters
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     loadTenants();
//                     setIsFilterSidebarOpen(false);
//                   }}
//                   className="flex-1"
//                 >
//                   Apply Filters
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </SheetContent>
//       </Sheet>

//       {/* Dialogs */}
//       <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//         <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Add New Tenant</DialogTitle>
//           </DialogHeader>
//           <TenantForm 
//             onSuccess={handleSuccess} 
//             onCancel={() => setIsAddDialogOpen(false)} 
//           />
//         </DialogContent>
//       </Dialog>

//       {/* View Dialog */}
//       {selectedTenant && (
//         <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
//           <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle className="flex items-center gap-2">
//                 <Users className="h-5 w-5" />
//                 Tenant Details: {selectedTenant.full_name}
//               </DialogTitle>
//             </DialogHeader>
            
//             <div className="space-y-6">
//               <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
//                 {selectedTenant.photo_url && (
//                   <img 
//                     src={selectedTenant.photo_url} 
//                     alt={selectedTenant.full_name}
//                     className="h-24 w-24 object-cover rounded-lg"
//                   />
//                 )}
//                 <div className="flex-1">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="text-xl font-bold">{selectedTenant.full_name}</h3>
//                       <div className="flex items-center gap-3 mt-2">
//                         <Badge variant={selectedTenant.is_active ? "default" : "secondary"}>
//                           {selectedTenant.is_active ? "Active" : "Inactive"}
//                         </Badge>
//                         <Badge variant="outline">
//                           {selectedTenant.gender}
//                         </Badge>
//                         {selectedTenant.portal_access_enabled && (
//                           <Badge variant="outline" className="bg-blue-50 text-blue-700">
//                             Portal Access Enabled
//                           </Badge>
//                         )}
//                         {selectedTenant.has_credentials ? (
//                           <Badge variant="outline" className="bg-green-50 text-green-700">
//                             Login Enabled
//                           </Badge>
//                         ) : (
//                           <Badge variant="outline" className="bg-orange-50 text-orange-700">
//                             No Login
//                           </Badge>
//                         )}
//                       </div>
//                     </div>
//                     <Button
//                       variant="outline"
//                       onClick={() => {
//                         setIsViewDialogOpen(false);
//                         setIsEditDialogOpen(true);
//                       }}
//                     >
//                       <Edit className="h-4 w-4 mr-2" />
//                       Edit
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* Edit Dialog */}
//       {selectedTenant && (
//         <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//           <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>Edit Tenant: {selectedTenant.full_name}</DialogTitle>
//             </DialogHeader>
//             <TenantForm
//               tenant={selectedTenant}
//               onSuccess={handleSuccess}
//               onCancel={() => {
//                 setIsEditDialogOpen(false);
//                 setSelectedTenant(null);
//               }}
//             />
//           </DialogContent>
//         </Dialog>
//       )}

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
//                   onClick={async () => {
//                     if (!selectedTenant || !credentialPassword) {
//                       toast.error("Please enter a password");
//                       return;
//                     }

//                     setCredentialLoading(true);
//                     try {
//                       if (selectedTenant.has_credentials) {
//                         const res = await resetCredential(selectedTenant.id as any, credentialPassword);
//                         if (!res || !res.success) {
//                           toast.error(res?.message || "Failed to reset password");
//                         } else {
//                           toast.success("Password reset successfully");
//                           setIsCredentialDialogOpen(false);
//                           setCredentialPassword("");
//                           setSelectedTenant(null);
//                           loadTenants();
//                         }
//                       } else {
//                         const res = await createCredential(
//                           selectedTenant.id as any,
//                           selectedTenant.email,
//                           credentialPassword
//                         );
//                         if (!res || !res.success) {
//                           toast.error(res?.message || "Failed to create credentials");
//                         } else {
//                           toast.success("Login credentials created successfully");
//                           setIsCredentialDialogOpen(false);
//                           setCredentialPassword("");
//                           setSelectedTenant(null);
//                           loadTenants();
//                         }
//                       }
//                     } catch (error: any) {
//                       console.error("Credential error", error);
//                       toast.error("Failed to process credentials");
//                     } finally {
//                       setCredentialLoading(false);
//                     }
//                   }}
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
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
import type { Column, FilterConfig, BulkAction, ActionButton } from "@/components/admin/data-table";
import { TenantForm } from "@/components/admin/tenants/tenant-form";

interface TenantsClientProps {
  initialData: Tenant[];
  initialLoading: boolean;
  initialFilters: any;
}

export default function TenantsClient({
  initialData = [],
  initialLoading = false,
}: TenantsClientProps) {
  const [tenants, setTenants] = useState<Tenant[]>(initialData);
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

  // Toggle all selection
  const toggleSelectAll = useCallback(() => {
    if (selectedTenantIds.length === tenants.length) {
      setSelectedTenantIds([]);
    } else {
      setSelectedTenantIds(tenants.map(tenant => String(tenant.id)));
    }
  }, [tenants]);

  // Load tenants
  const loadTenants = useCallback(async (customFilters?: TenantFilters) => {
    setLoading(true);
    try {
      const useFilters = customFilters || filtersRef.current;
      const res = await listTenants(useFilters);

      if (res?.success && Array.isArray(res.data)) {
        setTenants(res.data);
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
    
    // Map column search to API filters
    if (columnSearch.name) {
      newFilters.search = columnSearch.name;
    }
    if (columnSearch.contact) {
      // Search in email or phone
      if (!newFilters.search) {
        newFilters.search = columnSearch.contact;
      }
    }
    if (columnSearch.occupation) {
      newFilters.occupation_category = columnSearch.occupation;
    }
    if (columnSearch.property) {
      // This would need a property search filter in your API
      // For now, we'll add it to general search
      if (!newFilters.search) {
        newFilters.search = columnSearch.property;
      }
    }
    if (columnSearch.payments) {
      // Payment search - you might need a separate endpoint
      // For now, we'll ignore or handle differently
    }
    if (columnSearch.status) {
      if (columnSearch.status.toLowerCase() === 'active' || columnSearch.status.toLowerCase() === 'inactive') {
        newFilters.is_active = columnSearch.status.toLowerCase() === 'active' ? 'true' : 'false';
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
    }, 500); // 500ms debounce

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

  // Memoized columns with inline rendering as shown in screenshot
  const columns: Column<Tenant>[] = useMemo(() => [
    {
      key: "full_name",
      label: "Name",
      sortable: true,
      render: (tenant) => (
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {tenant.photo_url ? (
              <img 
                src={tenant.photo_url} 
                alt={tenant.full_name}
                className="h-10 w-10 object-cover rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            )}
            <div>
              <p className="font-medium">{tenant.full_name}</p>
              <p className="text-sm text-slate-500 capitalize">{tenant.gender?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (tenant) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-slate-400" />
            <span className="truncate">{tenant.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-slate-400" />
            <span>{tenant.country_code} {tenant.phone}</span>
          </div>
          {tenant.city && (
            <div className="text-xs text-slate-500">
              <MapPin className="h-3 w-3 inline mr-1" />
              {tenant.city}, {tenant.state}
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
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs">
            {tenant.occupation_category || "Other"}
          </Badge>
          <p className="text-sm mt-1">{tenant.exact_occupation || tenant.occupation || "Not specified"}</p>
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
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Building className="h-3 w-3 text-slate-400" />
                <span className="font-medium text-sm">
                  {assignment.property_name || 'Unknown Property'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <Bed className="h-3 w-3 text-slate-400" />
                Room {assignment.room_number || 'N/A'} • Bed {assignment.bed_number || 'N/A'}
              </div>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Bed Assigned
              </Badge>
            </div>
          );
        }
        
        return (
          <div className="text-sm text-slate-400 italic">
            <Building className="h-3 w-3 inline mr-1" />
            No assignment
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
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <IndianRupee className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">₹{paid.toLocaleString()} paid</span>
            </div>
            {pending > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <IndianRupee className="h-3 w-3 text-red-600" />
                <span className="text-red-600">₹{pending.toLocaleString()} pending</span>
              </div>
            )}
            <div className="text-xs text-slate-500">
              {payments.length} transaction(s)
            </div>
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
        <div className="space-y-1">
          <div>
            <Badge variant={tenant.is_active ? "default" : "secondary"}>
              {tenant.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="space-y-1">
            {tenant.portal_access_enabled ? (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Portal Access
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200">
                <XCircle className="h-3 w-3 mr-1" />
                No Portal
              </Badge>
            )}
            {tenant.has_credentials ? (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Key className="h-3 w-3 mr-1" />
                Login Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                <XCircle className="h-3 w-3 mr-1" />
                No Login
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (tenant) => (
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setSelectedTenant(tenant);
                setIsViewDialogOpen(true);
              }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedTenant(tenant);
                setIsEditDialogOpen(true);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedTenant(tenant);
                setCredentialPassword("");
                setIsCredentialDialogOpen(true);
              }}>
                <Key className="h-4 w-4 mr-2" />
                {tenant.has_credentials ? "Reset Password" : "Create Login"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTogglePortalAccess(tenant)}>
                <UserX className="h-4 w-4 mr-2" />
                {tenant.portal_access_enabled ? "Disable Portal" : "Enable Portal"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDelete(tenant)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
      icon: <CheckCircle className="h-4 w-4" />,
      action: (selectedIds) => handleBulkStatusChange(selectedIds, true),
    },
    {
      label: "Deactivate Selected",
      icon: <XCircle className="h-4 w-4" />,
      action: (selectedIds) => handleBulkStatusChange(selectedIds, false),
    },
    {
      label: "Enable Portal Access",
      icon: <UserX className="h-4 w-4" />,
      action: (selectedIds) => handleBulkPortalAccess(selectedIds, true),
    },
    {
      label: "Disable Portal Access",
      icon: <UserX className="h-4 w-4" />,
      action: (selectedIds) => handleBulkPortalAccess(selectedIds, false),
    },
    {
      label: "Delete Selected",
      icon: <Trash2 className="h-4 w-4" />,
      action: handleBulkDelete,
      variant: "destructive",
      confirmMessage: "Are you sure you want to delete the selected tenants?",
    },
  ], [handleBulkStatusChange, handleBulkPortalAccess, handleBulkDelete]);

  // FilterSelect component for sidebar
  const FilterSelect = ({ 
    label, 
    value, 
    onChange, 
    options,
    placeholder = "All"
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
  }) => {
    const validOptions = options.filter(opt => opt.value !== "");
    
    return (
      <div className="space-y-2">
        <Label className="text-xs">{label}</Label>
        <Select
          value={value}
          onValueChange={(value) => onChange(value === "all" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder}>
              {value ? validOptions.find(opt => opt.value === value)?.label : placeholder}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{placeholder}</SelectItem>
            {validOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
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

  return (
    <div className="p-2">
      <Card className="border-0 shadow-lg">
        <CardHeader className="sticky top-16 z-10 bg-blue-600 shadow-md border-b py-3">
          <div className="flex flex-col gap-3">
            {/* Top actions row */}
            <div className="flex justify-between items-center w-full">
              {/* Left side - Add Tenant button */}
              <div className="rounded-lg p-2 shadow-sm">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-black hover:bg-teal-500 hover:text-white h-9">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tenant
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              {/* Right side - Actions */}
              <div className="flex gap-2 rounded-lg p-2 shadow-sm">
                <Button
                  variant="outline"
                  onClick={() => loadTenants()}
                  className="flex items-center gap-2 h-9 px-3"
                  disabled={loading}
                  title="Refresh"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                
                {/* Filter Sidebar Trigger */}
                <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-9"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader className="border-b pb-4">
                      <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2">
                          <SlidersHorizontal className="h-5 w-5" />
                          Advanced Filters
                        </SheetTitle>
                      </div>
                      {activeFiltersCount > 0 && (
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-slate-600">
                            Active filters: {activeFiltersCount}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSidebarFilters}
                            className="text-xs h-7"
                          >
                            Clear filters
                          </Button>
                        </div>
                      )}
                    </SheetHeader>
                    
                    <div className="space-y-6 py-6">
                      <div className="space-y-4">
                        <h3 className="font-medium text-sm">Status & Access</h3>
                        <FilterSelect
                          label="Account Status"
                          // value={filters.is_active || ""}
                          value={
  filters.is_active !== undefined
    ? String(filters.is_active)
    : ""
}

                          // onChange={(value) => handleFilterChange({...filters, is_active: value})}
                          onChange={(value) =>
  handleFilterChange({
    ...filters,
    is_active: value === "true"
  })
}

                          options={[
                            { value: "true", label: "Active" },
                            { value: "false", label: "Inactive" },
                          ]}
                        />
                        
                        <FilterSelect
                          label="Portal Access"
                          // value={filters.portal_access_enabled || ""}
                          value={
  filters.portal_access_enabled !== undefined
    ? String(filters.portal_access_enabled)
    : ""
}
                          // onChange={(value) => handleFilterChange({...filters, portal_access_enabled: value})}
                          onChange={(value) =>
  handleFilterChange({
    ...filters,
    portal_access_enabled: value === "true"
  })
}

                          options={[
                            { value: "true", label: "Enabled" },
                            { value: "false", label: "Disabled" },
                          ]}
                        />
                        
                        <FilterSelect
                          label="Login Status"
                          // value={filters.has_credentials || ""}
                          value={
  filters.has_credentials !== undefined
    ? String(filters.has_credentials)
    : ""
}

                          // onChange={(value) => handleFilterChange({...filters, has_credentials: value})}
                          onChange={(value) =>
  handleFilterChange({
    ...filters,
    has_credentials: value === "true"
  })
}

                          options={[
                            { value: "true", label: "Has Login" },
                            { value: "false", label: "No Login" },
                          ]}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="font-medium text-sm">Personal Information</h3>
                        <FilterSelect
                          label="Gender"
                          value={filters.gender || ""}
                          onChange={(value) => handleFilterChange({...filters, gender: value})}
                          options={[
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                            { value: "Other", label: "Other" },
                          ]}
                        />
                        
                        <FilterSelect
                          label="Occupation"
                          value={filters.occupation_category || ""}
                          onChange={(value) => handleFilterChange({...filters, occupation_category: value})}
                          options={[
                            { value: "Service", label: "Service" },
                            { value: "Business", label: "Business" },
                            { value: "Student", label: "Student" },
                            { value: "Other", label: "Other" },
                          ]}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="font-medium text-sm">Location</h3>
                        <div className="space-y-2">
                          <Label className="text-xs">City</Label>
                          <Input
                            placeholder="Enter city"
                            value={filters.city || ""}
                            onChange={(e) => handleFilterChange({...filters, city: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs">State</Label>
                          <Input
                            placeholder="Enter state"
                            value={filters.state || ""}
                            onChange={(e) => handleFilterChange({...filters, state: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="font-medium text-sm">Preferences</h3>
                        <FilterSelect
                          label="Sharing Type"
                          value={filters.preferred_sharing || ""}
                          onChange={(value) => handleFilterChange({...filters, preferred_sharing: value})}
                          options={[
                            { value: "single", label: "Single" },
                            { value: "double", label: "Double" },
                            { value: "triple", label: "Triple" },
                          ]}
                        />
                      </div>
                      
                      <div className="sticky bottom-0 pt-4 border-t mt-6">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={clearSidebarFilters}
                            className="flex-1"
                          >
                            Clear Filters
                          </Button>
                          <Button
                            onClick={applyFilters}
                            className="flex-1"
                          >
                            Apply Filters
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                
                {/* Bulk Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-9"
                      disabled={selectedTenantIds.length === 0}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Bulk Actions
                      {selectedTenantIds.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                          {selectedTenantIds.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {bulkActions.map((action, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => handleBulkAction(action, selectedTenantIds)}
                        className={action.variant === 'destructive' ? 'text-red-600' : ''}
                      >
                        {action.icon}
                        <span className="ml-2">{action.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button
                  variant="outline"
                  onClick={handleExportToExcel}
                  className="flex items-center gap-2 h-9"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Filter summary */}
            {activeFiltersCount > 0 && (
              <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3" />
                    <span className="font-medium text-xs">
                      Active Filters ({activeFiltersCount})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs h-6 px-2"
                  >
                    Clear all
                  </Button>
                </div>
                
                {/* Show individual filter badges */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.search && (
                    <Badge variant="secondary" className="text-xs h-5">
                      Search: {filters.search}
                    </Badge>
                  )}
                  {filters.is_active && (
                    <Badge variant="secondary" className="text-xs h-5">
                      Status: {filters.is_active === "true" ? "Active" : "Inactive"}
                    </Badge>
                  )}
                  {filters.gender && (
                    <Badge variant="secondary" className="text-xs h-5">
                      Gender: {filters.gender}
                    </Badge>
                  )}
                  {filters.occupation_category && (
                    <Badge variant="secondary" className="text-xs h-5">
                      Occupation: {filters.occupation_category}
                    </Badge>
                  )}
                  {filters.city && (
                    <Badge variant="secondary" className="text-xs h-5">
                      City: {filters.city}
                    </Badge>
                  )}
                  {filters.state && (
                    <Badge variant="secondary" className="text-xs h-5">
                      State: {filters.state}
                    </Badge>
                  )}
                  {filters.preferred_sharing && (
                    <Badge variant="secondary" className="text-xs h-5">
                      Sharing: {filters.preferred_sharing}
                    </Badge>
                  )}
                  {filters.portal_access_enabled && (
                    <Badge variant="secondary" className="text-xs h-5">
                      Portal: {filters.portal_access_enabled === "true" ? "Enabled" : "Disabled"}
                    </Badge>
                  )}
                  {filters.has_credentials && (
                    <Badge variant="secondary" className="text-xs h-5">
                      Login: {filters.has_credentials === "true" ? "Has Login" : "No Login"}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 ">
          {/* Column Headers - Like in screenshot but with search inputs below */}
          <div className="bg-slate-100 border-b  sticky top-36 z-30">
            {/* Column Titles Row */}
            <div className="grid grid-cols-10 gap-2 px-4 md:px-6 py-3 border-b ">
              {/* Select All Checkbox */}
  
              <div className="">
                <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  select
                </div>
              </div>
              
              {/* Name Column Title */}
              <div className="col-span-2">
                <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  NAME
                </div>
              </div>
              
              {/* Contact Column Title */}
              <div className="col-span-2">
                <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  CONTACT
                </div>
              </div>
              
              {/* Occupation Column Title */}
              <div className="col-span-1">
                <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  OCCUPATION
                </div>
              </div>
              
              {/* Property Column Title */}
              <div className="col-span-1">
                <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  PROPERTY & ROOM
                </div>
              </div>
              
              {/* Payments Column Title */}
              <div className="col-span-1">
                <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  PAYMENTS
                </div>
              </div>
              
              {/* Status Column Title */}
              <div className="col-span-1">
                <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  STATUS
                </div>
              </div>
              
              {/* Actions Column Title */}
              <div className="1">
                <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  ACTIONS
                </div>
              </div>
            </div>

            {/* Search Inputs Row */}
            <div className="grid grid-cols-10 gap-2 px-4 md:px-6 py-3">
              {/* Empty column for checkbox alignment */}
              <div>
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center justify-center h-5 w-5"
                >
                  {selectedTenantIds.length === tenants.length && tenants.length > 0 ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
              
              {/* Name Column Search */}
              <div className="col-span-2">
                <Input
                  placeholder="Search name..."
                  value={columnSearch.name}
                  onChange={(e) => handleColumnSearchChange('name', e.target.value)}
                  className="h-8 text-sm w-full"
                />
              </div>
              
              {/* Contact Column Search */}
              <div className="col-span-2">
                <Input
                  placeholder="Search email/phone..."
                  value={columnSearch.contact}
                  onChange={(e) => handleColumnSearchChange('contact', e.target.value)}
                  className="h-8 text-sm w-full"
                />
              </div>
              
              {/* Occupation Column Search */}
              <div>
                <Input
                  placeholder="Search occupation"
                  value={columnSearch.occupation}
                  onChange={(e) => handleColumnSearchChange('occupation', e.target.value)}
                  className="h-8 text-sm w-full"
                />
              </div>
              
              {/* Property Column Search */}
              <div>
                <Input
                  placeholder="Search property"
                  value={columnSearch.property}
                  onChange={(e) => handleColumnSearchChange('property', e.target.value)}
                  className="h-8 text-sm w-full"
                />
              </div>
              
              {/* Payments Column Search */}
              <div>
                <Input
                  placeholder="Search payment"
                  value={columnSearch.payments}
                  onChange={(e) => handleColumnSearchChange('payments', e.target.value)}
                  className="h-8 text-sm w-full"
                />
              </div>
              
              {/* Status Column Search */}
              <div>
                <Input
                  placeholder="Search status"
                  value={columnSearch.status}
                  onChange={(e) => handleColumnSearchChange('status', e.target.value)}
                  className="h-8 text-sm w-full"
                />
              </div>
              
              {/* Actions Column - Empty for alignment */}
              <div></div>
            </div>
          </div>
          
          {/* Tenants List */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600">No tenants found</h3>
                <p className="text-slate-500 mt-1">Add your first tenant to get started</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tenant
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="grid grid-cols-10 gap-4 px-4 md:px-6 py-4 hover:bg-slate-50 transition-colors items-center">
                    {/* Selection Checkbox */}
                    <div className="flex items-center col-span-1">
                      <button
                        onClick={() => toggleSelection(String(tenant.id))}
                        className="flex items-center justify-center h-5 w-5"
                      >
                        {selectedTenantIds.includes(String(tenant.id)) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                    
                    {/* Name Column */}
                    <div className="space-y-1 col-span-2">
                      <div className="flex items-center gap-3">
                        {tenant.photo_url ? (
                          <img 
                            src={tenant.photo_url} 
                            alt={tenant.full_name}
                            className="h-10 w-10 object-cover rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{tenant.full_name}</p>
                          <p className="text-sm text-slate-500 capitalize">{tenant.gender?.toLowerCase()}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contact Column */}
                    <div className="space-y-1 col-span-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span className="truncate">{tenant.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{tenant.country_code} {tenant.phone}</span>
                      </div>
                      {tenant.city && (
                        <div className="text-xs text-slate-500">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {tenant.city}, {tenant.state}
                        </div>
                      )}
                    </div>
                    
                    {/* Occupation Column */}
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {tenant.occupation_category || "Other"}
                      </Badge>
                      <p className="text-sm mt-1">{tenant.exact_occupation || tenant.occupation || "Not specified"}</p>
                    </div>
                    
                    {/* Property Column */}
                    <div className="space-y-1">
                      {tenant.current_assignment || tenant.assigned_room_id ? (
                        <>
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-slate-400" />
                            <span className="font-medium text-sm">
                              {tenant.current_assignment?.property_name || tenant.assigned_property_name || 'Unknown Property'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Bed className="h-3 w-3 text-slate-400" />
                            Room {tenant.current_assignment?.room_number || tenant.assigned_room_number || 'N/A'} • Bed {tenant.current_assignment?.bed_number || tenant.assigned_bed_number || 'N/A'}
                          </div>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Bed Assigned
                          </Badge>
                        </>
                      ) : (
                        <div className="text-sm text-slate-400 italic">
                          <Building className="h-3 w-3 inline mr-1" />
                          No assignment
                        </div>
                      )}
                    </div>
                    
                    {/* Payments Column */}
                    <div className="space-y-1">
                      {(() => {
                        const payments = tenant.payments || [];
                        const paid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
                        const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
                        
                        return (
                          <>
                            <div className="flex items-center gap-1 text-sm">
                              <IndianRupee className="h-3 w-3 text-green-600" />
                              <span className="text-green-600 font-medium">₹{paid.toLocaleString()} paid</span>
                            </div>
                            {pending > 0 && (
                              <div className="flex items-center gap-1 text-sm">
                                <IndianRupee className="h-3 w-3 text-red-600" />
                                <span className="text-red-600">₹{pending.toLocaleString()} pending</span>
                              </div>
                            )}
                            <div className="text-xs text-slate-500">
                              {payments.length} transaction(s)
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    
                    {/* Status Column */}
                    <div className="space-y-1">
                      <div>
                        <Badge variant={tenant.is_active ? "default" : "secondary"}>
                          {tenant.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {tenant.portal_access_enabled ? (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Portal Access
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            No Portal
                          </Badge>
                        )}
                        {tenant.has_credentials ? (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <Key className="h-3 w-3 mr-1" />
                            Login Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            No Login
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions Column */}
                    <div className="flex items-center justify-start">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedTenant(tenant);
                            setIsViewDialogOpen(true);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedTenant(tenant);
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedTenant(tenant);
                            setCredentialPassword("");
                            setIsCredentialDialogOpen(true);
                          }}>
                            <Key className="h-4 w-4 mr-2" />
                            {tenant.has_credentials ? "Reset Password" : "Create Login"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePortalAccess(tenant)}>
                            <UserX className="h-4 w-4 mr-2" />
                            {tenant.portal_access_enabled ? "Disable Portal" : "Enable Portal"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(tenant)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
          </DialogHeader>
          <TenantForm 
            onSuccess={handleSuccess} 
            onCancel={() => setIsAddDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {selectedTenant && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tenant Details: {selectedTenant.full_name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                {selectedTenant.photo_url && (
                  <img 
                    src={selectedTenant.photo_url} 
                    alt={selectedTenant.full_name}
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{selectedTenant.full_name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant={selectedTenant.is_active ? "default" : "secondary"}>
                          {selectedTenant.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {selectedTenant.gender}
                        </Badge>
                        {selectedTenant.portal_access_enabled && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Portal Access Enabled
                          </Badge>
                        )}
                        {selectedTenant.has_credentials ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Login Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            No Login
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Email</p>
                      <p className="text-sm">{selectedTenant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Phone</p>
                      <p className="text-sm">{selectedTenant.country_code} {selectedTenant.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Address</p>
                      <p className="text-sm">{selectedTenant.address}</p>
                      <p className="text-sm">
                        {selectedTenant.city}, {selectedTenant.state} - {selectedTenant.pincode}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Occupation & Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Occupation & Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Occupation Category</p>
                      <Badge variant="outline">{selectedTenant.occupation_category || "Other"}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Occupation Details</p>
                      <p className="text-sm">{selectedTenant.exact_occupation || selectedTenant.occupation || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Room Preferences</p>
                      <div className="flex gap-2 mt-1">
                        {selectedTenant.preferred_sharing && (
                          <Badge variant="outline">{selectedTenant.preferred_sharing} sharing</Badge>
                        )}
                        {selectedTenant.preferred_room_type && (
                          <Badge variant="outline">{selectedTenant.preferred_room_type}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Booking & Payments */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Current Booking & Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(selectedTenant.bookings ?? []).length > 0 ? (
                      (selectedTenant.bookings ?? [])
                        .filter(b => b.status === 'active')
                        .map((booking) => (
                          <div key={booking.id} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm font-medium text-slate-600">Property</p>
                                <p className="font-medium">{booking.properties?.name}</p>
                                <p className="text-sm text-slate-500">
                                  {booking.properties?.city}, {booking.properties?.state}
                                </p>
                              </div>
                              {booking.room && (
                                <div>
                                  <p className="text-sm font-medium text-slate-600">Room Details</p>
                                  <p className="font-medium">
                                    Room {booking.room.room_number}
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    {booking.room.sharing_type} sharing • Floor {booking.room.floor || "-"}
                                  </p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-slate-600">Monthly Rent</p>
                                <p className="font-medium text-green-600">
                                  ₹{booking.monthly_rent?.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Payment Summary */}
                            {selectedTenant.payments && selectedTenant.payments.length > 0 && (
                              <div className="mt-4">
                                <Separator className="my-4" />
                                <h4 className="font-medium mb-2">Payment History</h4>
                                <div className="space-y-2">
                                  {selectedTenant.payments.slice(0, 5).map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                      <div>
                                        <p className="text-sm font-medium">
                                          {payment.description || "Payment"}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {new Date(payment.payment_date).toLocaleDateString()} • 
                                          {payment.payment_method}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className={`font-medium ${
                                          payment.status === 'paid' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          ₹{payment.amount?.toLocaleString()}
                                        </p>
                                        <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
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
                      <p className="text-slate-500">No active booking</p>
                    )}
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedTenant.id_proof_url && (
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">ID Proof</span>
                          </div>
                          <a
                            href={selectedTenant.id_proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                      )}
                      
                      {selectedTenant.address_proof_url && (
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">Address Proof</span>
                          </div>
                          <a
                            href={selectedTenant.address_proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                      )}
                      
                      {selectedTenant.photo_url && (
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">Photo</span>
                          </div>
                          <a
                            href={selectedTenant.photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Photo
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* System Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Created At</p>
                      <p className="text-sm">
                        {new Date(selectedTenant.created_at!).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Last Updated</p>
                      <p className="text-sm">
                        {selectedTenant.updated_at 
                          ? new Date(selectedTenant.updated_at).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Login Email</p>
                      <p className="text-sm">
                        {selectedTenant.credential_email || "No login configured"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {selectedTenant && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Tenant: {selectedTenant.full_name}</DialogTitle>
            </DialogHeader>
            <TenantForm
              tenant={selectedTenant}
              onSuccess={handleSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedTenant(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Credential Dialog */}
      {selectedTenant && (
        <Dialog open={isCredentialDialogOpen} onOpenChange={setIsCredentialDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedTenant.has_credentials ? "Reset Password" : "Create Login Credentials"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tenant Name</Label>
                <Input value={selectedTenant.full_name} disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={selectedTenant.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>{selectedTenant.has_credentials ? "New Password" : "Password"} *</Label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={credentialPassword}
                  onChange={(e) => setCredentialPassword(e.target.value)}
                />
                <p className="text-xs text-slate-500">Minimum 6 characters required</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCredentialDialogOpen(false);
                    setCredentialPassword("");
                    setSelectedTenant(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCredentialSubmit}
                  disabled={credentialLoading || !credentialPassword || credentialPassword.length < 6}
                >
                  {credentialLoading ? "Processing..." : selectedTenant.has_credentials ? "Reset Password" : "Create Login"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}



