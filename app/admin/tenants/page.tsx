// "use client";

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
// import { useEffect, useState } from "react";
// import { TenantForm } from "@/components/admin/tenant-form";
// import { toast } from "sonner";
// import { DataTable } from "@/components/admin/data-table";
// import type { Column, FilterConfig, BulkAction, ActionButton } from "@/components/admin/data-table";

// import {
//   listTenants,
//   deleteTenant,
//   bulkDeleteTenants,
//   bulkUpdateTenantStatus,
//   bulkUpdateTenantPortalAccess,
//    updateTenant,
//    updateTenantSimple,
//   createCredential,
//   resetCredential,
//   exportTenantsToExcel,
//   type Tenant,
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

// export default function TenantsPage() {
//   const [tenants, setTenants] = useState<Tenant[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false);
//   const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
//   const [credentialPassword, setCredentialPassword] = useState("");
//   const [credentialLoading, setCredentialLoading] = useState(false);
//   const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
//   const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
//   const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  
//   const [filters, setFilters] = useState({
//     search: "",
//     is_active: "",
//     portal_access_enabled: "",
//     has_credentials: "",
//     gender: "",
//     occupation_category: "",
//     city: "",
//     state: "",
//     preferred_sharing: "",
//   });

//   // Column-specific search inputs
//   const [columnSearch, setColumnSearch] = useState({
//     name: "",
//     contact: "",
//     occupation: "",
//     property: "",
//     payments: "",
//     status: "",
//   });

//   useEffect(() => {
//     loadTenants();
//   }, []);

// const loadTenants = async () => {
//   setLoading(true);
//   try {
//     console.log('🔍 Loading tenants with filters:', filters);
//     const res = await listTenants(filters);
    
//     console.log('🔍 API Response:', {
//       success: res.success,
//       hasData: !!res.data,
//       dataType: typeof res.data,
//       isArray: Array.isArray(res.data),
//       dataLength: Array.isArray(res.data) ? res.data.length : 'Not an array',
//       rawData: res.data // Just for debugging
//     });
    
//     if (res && res.success) {
//       // Ensure we're handling the data correctly
//       if (Array.isArray(res.data)) {
//         console.log(`✅ Setting ${res.data.length} tenants`);
//         setTenants(res.data);
//       } else if (res.data && typeof res.data === 'object') {
//         // Check if data might be nested
//         console.log('🔍 Data is object, checking structure:', Object.keys(res.data));
//         // Try different possible structures
//         const dataArray = (res.data as any).data || (res.data as any).tenants || [];
//         if (Array.isArray(dataArray)) {
//           console.log(`✅ Found nested array with ${dataArray.length} tenants`);
//           setTenants(dataArray);
//         } else {
//           console.log('❌ Could not extract array from response');
//           setTenants([]);
//         }
//       } else {
//         console.log('❌ No array data found, setting empty array');
//         setTenants([]);
//       }
//     } else {
//       toast.error(res?.message || "Failed to load tenants");
//       setTenants([]);
//     }
//   } catch (err) {
//     console.error("loadTenants error", err);
//     toast.error("Failed to load tenants");
//     setTenants([]);
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleColumnSearchChange = (column: keyof typeof columnSearch, value: string) => {
//     setColumnSearch(prev => ({
//       ...prev,
//       [column]: value
//     }));
//   };

//   const clearColumnSearch = () => {
//     setColumnSearch({
//       name: "",
//       contact: "",
//       occupation: "",
//       property: "",
//       payments: "",
//       status: "",
//     });
//   };

//   const handleSuccess = () => {
//     toast.success("Tenant saved successfully");
//     setIsAddDialogOpen(false);
//     setIsEditDialogOpen(false);
//     setSelectedTenant(null);
//     loadTenants();
//   };

//   const handleDelete = async (tenant: Tenant) => {
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
//   };

//   const handleBulkDelete = async (selectedIds: string[]) => {
//     try {
//       const res = await bulkDeleteTenants(selectedIds);
//       if (!res || !res.success) {
//         toast.error(res?.message || "Failed to delete tenants");
//       } else {
//         toast.success(`${selectedIds.length} tenants deleted successfully`);
//         loadTenants();
//       }
//     } catch (err) {
//       console.error("handleBulkDelete", err);
//       toast.error("Failed to delete tenants");
//     }
//   };

//   const handleBulkStatusChange = async (selectedIds: string[], status: boolean) => {
//     try {
//       const res = await bulkUpdateTenantStatus(selectedIds, status);
//       if (!res || !res.success) {
//         toast.error(res?.message || "Failed to update status");
//       } else {
//         toast.success(`${selectedIds.length} tenants updated successfully`);
//         loadTenants();
//       }
//     } catch (err) {
//       console.error("handleBulkStatusChange", err);
//       toast.error("Failed to update status");
//     }
//   };

//   const handleBulkPortalAccess = async (selectedIds: string[], enabled: boolean) => {
//     try {
//       const res = await bulkUpdateTenantPortalAccess(selectedIds, enabled);
//       if (!res || !res.success) {
//         toast.error(res?.message || "Failed to update portal access");
//       } else {
//         toast.success(`${selectedIds.length} tenants portal access updated`);
//         loadTenants();
//       }
//     } catch (err) {
//       console.error("handleBulkPortalAccess", err);
//       toast.error("Failed to update portal access");
//     }
//   };

// const handleTogglePortalAccess = async (tenant: Tenant) => {
//   console.log('🔍 Toggling portal access for:', {
//     tenantId: tenant.id,
//     currentValue: tenant.portal_access_enabled,
//     newValue: !tenant.portal_access_enabled
//   });
  
//   try {
//     console.log('🔍 Calling updateTenantSimple...');
//     const res = await updateTenantSimple(tenant.id as any, {
//       portal_access_enabled: !tenant.portal_access_enabled,
//     });
    
//     console.log('🔍 API Response from updateTenantSimple:', res);
    
//     if (!res || !res.success) {
//       console.error('❌ API Error Response:', res);
//       toast.error(res?.message || "Failed to update portal access");
//     } else {
//       toast.success("Portal access updated successfully");
//       loadTenants();
//     }
//   } catch (err: any) {
//     console.error("❌ handleTogglePortalAccess catch error:", {
//       name: err.name,
//       message: err.message,
//       stack: err.stack,
//       status: err.status,
//       response: err.response
//     });
    
//     console.log('🔄 Trying alternative approach...');
//     try {
//       const result = await fetch(`/api/tenants/${tenant.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ portal_access_enabled: !tenant.portal_access_enabled }),
//       });
      
//       const data = await result.json();
//       console.log('✅ Alternative approach result:', data);
//       if (data.success) {
//         toast.success("Portal access updated successfully");
//         loadTenants();
//       } else {
//         toast.error(data.message || "Failed to update portal access");
//       }
//     } catch (secondErr: any) {
//       console.error('❌ Second approach also failed:', secondErr);
//       toast.error(secondErr.message || "Failed to update portal access");
//     }
//   }
// };

//   const handleCreateCredentials = async () => {
//     if (!selectedTenant || !credentialPassword) {
//       toast.error("Please enter a password");
//       return;
//     }

//     setCredentialLoading(true);
//     try {
//       const res = await createCredential(
//         selectedTenant.id as any,
//         selectedTenant.email,
//         credentialPassword
//       );
//       if (!res || !res.success) {
//         toast.error(res?.message || "Failed to create credentials");
//       } else {
//         toast.success("Login credentials created successfully");
//         setIsCredentialDialogOpen(false);
//         setCredentialPassword("");
//         setSelectedTenant(null);
//         loadTenants();
//       }
//     } catch (error: any) {
//       console.error("handleCreateCredentials", error);
//       toast.error("Failed to create credentials");
//     } finally {
//       setCredentialLoading(false);
//     }
//   };

//   const handleResetPassword = async () => {
//     if (!selectedTenant || !credentialPassword) {
//       toast.error("Please enter a new password");
//       return;
//     }

//     setCredentialLoading(true);
//     try {
//       const res = await resetCredential(selectedTenant.id as any, credentialPassword);
//       if (!res || !res.success) {
//         toast.error(res?.message || "Failed to reset password");
//       } else {
//         toast.success("Password reset successfully");
//         setIsCredentialDialogOpen(false);
//         setCredentialPassword("");
//         setSelectedTenant(null);
//         loadTenants();
//       }
//     } catch (error: any) {
//       console.error("handleResetPassword", error);
//       toast.error("Failed to reset password");
//     } finally {
//       setCredentialLoading(false);
//     }
//   };

//   // Add this function to handle tenant selection from DataTable
//   const handleTenantSelection = (selectedIds: string[]) => {
//     setSelectedTenantIds(selectedIds);
//   };

//   // Add this function to handle bulk action selection
//   const handleBulkAction = async (action: BulkAction, selectedIds: string[]) => {
//     if (selectedIds.length === 0) {
//       toast.error("No tenants selected");
//       return;
//     }

//     if (action.confirmMessage) {
//       if (!confirm(action.confirmMessage)) return;
//     }

//     try {
//       // Map the action to the existing bulk action functions
//       if (action.label === "Delete Selected") {
//         await handleBulkDelete(selectedIds);
//       } else if (action.label === "Activate Selected") {
//         await handleBulkStatusChange(selectedIds, true);
//       } else if (action.label === "Deactivate Selected") {
//         await handleBulkStatusChange(selectedIds, false);
//       } else if (action.label === "Enable Portal Access") {
//         await handleBulkPortalAccess(selectedIds, true);
//       } else if (action.label === "Disable Portal Access") {
//         await handleBulkPortalAccess(selectedIds, false);
//       } else {
//         // For custom actions, call the action function
//         action.action(selectedIds);
//       }
      
//       // Clear selection after action
//       setSelectedTenantIds([]);
//       setIsBulkActionOpen(false);
//     } catch (error) {
//       console.error("Bulk action error:", error);
//       toast.error("Failed to perform bulk action");
//     }
//   };

//   const columns: Column<Tenant>[] = [
//     {
//       key: "full_name",
//       label: "Name",
//       sortable: true,
//       render: (tenant) => (
//         <div>
//           <p className="font-medium">{tenant.full_name}</p>
//           <p className="text-sm text-slate-500">{tenant.gender}</p>
//           {tenant.photo_url && (
//             <img 
//               src={tenant.photo_url} 
//               alt={tenant.full_name}
//               className="h-10 w-10 object-cover rounded-full mt-1"
//             />
//           )}
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
//             {tenant.email}
//           </div>
//           <div className="flex items-center gap-2 text-sm">
//             <Phone className="h-3 w-3 text-slate-400" />
//             {tenant.country_code} {tenant.phone}
//           </div>
//           <div className="text-xs text-slate-500 mt-1">
//             {tenant.city}, {tenant.state}
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: "occupation",
//       label: "Occupation",
//       sortable: true,
//       render: (tenant) => (
//         <div>
//           <Badge variant="outline" className="mb-1">
//             {tenant.occupation_category || "Other"}
//           </Badge>
//           <p className="text-sm">{tenant.exact_occupation || tenant.occupation}</p>
//         </div>
//       ),
//     },
// {
//   key: "property",
//   label: "Property & Room",
//   render: (tenant) => {
//     // Check if tenant has active bed assignment
//     if (tenant.current_assignment || tenant.assigned_room_id) {
//       const assignment = tenant.current_assignment || {
//         property_name: tenant.assigned_property_name,
//         room_number: tenant.assigned_room_number,
//         bed_number: tenant.assigned_bed_number
//       };
      
//       return (
//         <div className="space-y-1">
//           <div className="flex items-center gap-1">
//             <Building className="h-3 w-3" />
//             <span className="font-medium">
//               {assignment.property_name || 'Unknown Property'}
//             </span>
//           </div>
//           <div className="flex items-center gap-1 text-sm">
//             <Bed className="h-3 w-3" />
//             Room {assignment.room_number || 'N/A'} • 
//             Bed {assignment.bed_number || 'N/A'}
//           </div>
//           <Badge variant="outline" className="text-xs">
//             <CheckCircle className="h-3 w-3 mr-1" />
//             Bed Assigned
//           </Badge>
//         </div>
//       );
//     }
    
//     // Fallback to booking info if no assignment but has booking
//     const activeBooking = tenant.bookings?.find((b) => b.status === "active");
//     if (activeBooking) {
//       return (
//         <div className="space-y-1">
//           <div className="flex items-center gap-1">
//             <Building className="h-3 w-3" />
//             <span className="font-medium">{activeBooking.properties?.name}</span>
//           </div>
//           {activeBooking.room && (
//             <div className="flex items-center gap-1 text-sm">
//               <Bed className="h-3 w-3" />
//               Room {activeBooking.room.room_number} • 
//               {activeBooking.room.sharing_type} sharing • 
//               Floor {activeBooking.room.floor}
//             </div>
//           )}
//           <Badge variant="outline" className="text-xs">
//             <CheckCircle className="h-3 w-3 mr-1" />
//             Booked
//           </Badge>
//         </div>
//       );
//     }
    
//     // No assignment or booking
//     return tenant.preferred_property_id ? (
//       <div className="text-sm text-amber-600">
//         <MapPin className="h-3 w-3 inline mr-1" />
//         Preference set • {tenant.preferred_sharing} sharing
//       </div>
//     ) : (
//       <span className="text-sm text-slate-400">No assignment</span>
//     );
//   },
// },
//     {
//       key: "payments",
//       label: "Payments",
//       render: (tenant) => {
//         const payments = tenant.payments || [];
//         const paid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
//         const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
        
//         return (
//           <div className="space-y-1">
//             <div className="text-sm">
//               <span className="text-green-600">₹{paid.toLocaleString()} paid</span>
//             </div>
//             {pending > 0 && (
//               <div className="text-sm">
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
//           <div className="flex flex-wrap gap-1">
//             {tenant.portal_access_enabled && (
//               <Badge variant="outline" className="text-xs">
//                 <CheckCircle className="h-3 w-3 mr-1" />
//                 Portal Access
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
//   ];

//   // Fixed: Ensure all options have non-empty string values
//   const tableFilters: FilterConfig[] = [
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
//       value: opt.value || "empty" // Ensure no empty string values
//     }))
//   }));

//   const bulkActions: BulkAction[] = [
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
//   ];

//   const actions: ActionButton<Tenant>[] = [
//     {
//       label: "View Details",
//       icon: <Eye className="h-4 w-4" />,
//       action: (tenant) => {
//         setSelectedTenant(tenant);
//         setIsViewDialogOpen(true);
//       },
//     },
//     {
//       label: "Edit",
//       icon: <Edit className="h-4 w-4" />,
//       action: (tenant) => {
//         setSelectedTenant(tenant);
//         setIsEditDialogOpen(true);
//       },
//     },
//     {
//       label: "Create Login",
//       icon: <Key className="h-4 w-4" />,
//       action: (tenant) => {
//         setSelectedTenant(tenant);
//         setCredentialPassword("");
//         setIsCredentialDialogOpen(true);
//       },
//       show: (tenant) => !tenant.has_credentials,
//     },
//     {
//       label: "Reset Password",
//       icon: <RefreshCw className="h-4 w-4" />,
//       action: (tenant) => {
//         setSelectedTenant(tenant);
//         setCredentialPassword("");
//         setIsCredentialDialogOpen(true);
//       },
//       show: (tenant) => tenant.has_credentials === true,
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
//       variant: "destructive",
//     },
//   ];

//   // Fixed FilterSelect component - don't use empty string for SelectItem
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
//     // Filter out any empty string options
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

//   const applyFilters = () => {
//     loadTenants();
//     setIsFilterSidebarOpen(false);
//   };

//   const clearFilters = () => {
//     setFilters({
//       search: "",
//       is_active: "",
//       portal_access_enabled: "",
//       has_credentials: "",
//       gender: "",
//       occupation_category: "",
//       city: "",
//       state: "",
//       preferred_sharing: "",
//     });
//     setTimeout(() => {
//       loadTenants();
//       setIsFilterSidebarOpen(false);
//     }, 100);
//   };

//   const handleExportToExcel = async () => {
//     try {
//       const exportFilters = Object.fromEntries(
//         Object.entries(filters).filter(([_, value]) => value !== "")
//       );

//       console.log('🔍 Exporting with filters:', exportFilters);
      
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
//   };

//   const activeFilters = Object.entries(filters)
//     .filter(([_, value]) => value !== "")
//     .map(([key]) => key);

//   const hasColumnSearch = Object.values(columnSearch).some(value => value !== "");

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <div className="p-2">
//         <Card className="border-0 shadow-lg">
//           <CardHeader className="sticky top-16 z-10 bg-blue-600 shadow-md border-b py-3 h-auto min-h-[60px]">  
//             <div className="flex flex-col gap-3">
//               {/* Button row - Add on left, others on right */}
//               <div className="flex justify-between items-center w-full">
//                 {/* Left side - Add Tenant button */}
//                 <div className="rounded-lg p-2 shadow-sm">
//                   <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//                     <DialogTrigger asChild>
//                       <Button className="bg-white text-black hover:bg-teal-500 hover:text-white h-9">
//                         <Plus className="h-4 w-4 mr-2" />
//                         Add Tenant
//                       </Button>
//                     </DialogTrigger>
//                     <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//                       <DialogHeader>
//                         <DialogTitle>Add New Tenant</DialogTitle>
//                       </DialogHeader>
//                       <TenantForm 
//                         onSuccess={handleSuccess} 
//                         onCancel={() => setIsAddDialogOpen(false)} 
//                       />
//                     </DialogContent>
//                   </Dialog>
//                 </div>

//                 {/* Right side - Refresh, Filters, Bulk Actions, Export */}
//                 <div className="flex gap-2 rounded-lg p-2 shadow-sm">
//                   <Button
//                     variant="outline"
//                     onClick={loadTenants}
//                     className="flex items-center gap-2 h-9 px-3"
//                     disabled={loading}
//                     title="Refresh"
//                   >
//                     <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
//                   </Button>
                  
//                   <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
//                     <SheetTrigger asChild>
//                       <Button
//                         variant="outline"
//                         className="flex items-center gap-2 h-9"
//                         onClick={() => setIsFilterSidebarOpen(true)}
//                       >
//                         <SlidersHorizontal className="h-4 w-4" />
//                         Filters
//                         {activeFilters.length > 0 && (
//                           <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
//                             {activeFilters.length}
//                           </Badge>
//                         )}
//                       </Button>
//                     </SheetTrigger>
//                     <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
//                       <SheetHeader className="border-b pb-4">
//                         <div className="flex items-center justify-between">
//                           <SheetTitle className="flex items-center gap-2">
//                             <SlidersHorizontal className="h-5 w-5" />
//                             Advanced Filters
//                           </SheetTitle>
//                         </div>
//                         {activeFilters.length > 0 && (
//                           <div className="flex items-center justify-between mt-2">
//                             <span className="text-sm text-slate-600">
//                               Active filters: {activeFilters.length}
//                             </span>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={clearFilters}
//                               className="text-xs h-7"
//                             >
//                               Clear all
//                             </Button>
//                           </div>
//                         )}
//                       </SheetHeader>
                      
//                       <div className="space-y-6 py-6">
//                         <div className="space-y-4">
//                           <h3 className="font-medium text-sm">Status & Access</h3>
//                           <FilterSelect
//                             label="Account Status"
//                             value={filters.is_active}
//                             onChange={(value) => setFilters({...filters, is_active: value})}
//                             options={[
//                               { value: "true", label: "Active" },
//                               { value: "false", label: "Inactive" },
//                             ]}
//                           />
                          
//                           <FilterSelect
//                             label="Portal Access"
//                             value={filters.portal_access_enabled}
//                             onChange={(value) => setFilters({...filters, portal_access_enabled: value})}
//                             options={[
//                               { value: "true", label: "Enabled" },
//                               { value: "false", label: "Disabled" },
//                             ]}
//                           />
                          
//                           <FilterSelect
//                             label="Login Status"
//                             value={filters.has_credentials}
//                             onChange={(value) => setFilters({...filters, has_credentials: value})}
//                             options={[
//                               { value: "true", label: "Has Login" },
//                               { value: "false", label: "No Login" },
//                             ]}
//                           />
//                         </div>
                        
//                         <Separator />
                        
//                         <div className="space-y-4">
//                           <h3 className="font-medium text-sm">Personal Information</h3>
//                           <FilterSelect
//                             label="Gender"
//                             value={filters.gender}
//                             onChange={(value) => setFilters({...filters, gender: value})}
//                             options={[
//                               { value: "Male", label: "Male" },
//                               { value: "Female", label: "Female" },
//                               { value: "Other", label: "Other" },
//                             ]}
//                           />
                          
//                           <FilterSelect
//                             label="Occupation"
//                             value={filters.occupation_category}
//                             onChange={(value) => setFilters({...filters, occupation_category: value})}
//                             options={[
//                               { value: "Service", label: "Service" },
//                               { value: "Business", label: "Business" },
//                               { value: "Student", label: "Student" },
//                               { value: "Other", label: "Other" },
//                             ]}
//                           />
//                         </div>
                        
//                         <Separator />
                        
//                         <div className="space-y-4">
//                           <h3 className="font-medium text-sm">Location</h3>
//                           <div className="space-y-2">
//                             <Label className="text-xs">City</Label>
//                             <Input
//                               placeholder="Enter city"
//                               value={filters.city}
//                               onChange={(e) => setFilters({...filters, city: e.target.value})}
//                             />
//                           </div>
                          
//                           <div className="space-y-2">
//                             <Label className="text-xs">State</Label>
//                             <Input
//                               placeholder="Enter state"
//                               value={filters.state}
//                               onChange={(e) => setFilters({...filters, state: e.target.value})}
//                             />
//                           </div>
//                         </div>
                        
//                         <Separator />
                        
//                         <div className="space-y-4">
//                           <h3 className="font-medium text-sm">Preferences</h3>
//                           <FilterSelect
//                             label="Sharing Type"
//                             value={filters.preferred_sharing}
//                             onChange={(value) => setFilters({...filters, preferred_sharing: value})}
//                             options={[
//                               { value: "single", label: "Single" },
//                               { value: "double", label: "Double" },
//                               { value: "triple", label: "Triple" },
//                             ]}
//                           />
//                         </div>
                        
//                         <div className="sticky bottom-0 pt-4 border-t mt-6">
//                           <div className="flex gap-2">
//                             <Button
//                               variant="outline"
//                               onClick={clearFilters}
//                               className="flex-1"
//                             >
//                               Clear All
//                             </Button>
//                             <Button
//                               onClick={applyFilters}
//                               className="flex-1"
//                             >
//                               Apply Filters
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </SheetContent>
//                   </Sheet>
                  
//                   {/* Bulk Actions Dropdown */}
//                   <DropdownMenu open={isBulkActionOpen} onOpenChange={setIsBulkActionOpen}>
//                     <DropdownMenuTrigger asChild>
//                       <Button
//                         variant="outline"
//                         className="flex items-center gap-2 h-9"
//                         disabled={selectedTenantIds.length === 0}
//                       >
//                         <CheckCircle className="h-4 w-4" />
//                         Bulk Actions
//                         {selectedTenantIds.length > 0 && (
//                           <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
//                             {selectedTenantIds.length}
//                           </Badge>
//                         )}
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
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
                  
//                   <Button
//                     variant="outline"
//                     onClick={handleExportToExcel}
//                     className="flex items-center gap-2 h-9"
//                   >
//                     <Download className="h-4 w-4" />
//                     Export
//                   </Button>
//                 </div>
//               </div>

//               {/* Filter Summary Badges - Show active filters */}
//               {(activeFilters.length > 0 || hasColumnSearch) && (
//                 <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg border shadow-sm">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <Filter className="h-3 w-3" />
//                       <span className="font-medium text-xs">
//                         Active Filters ({activeFilters.length + (hasColumnSearch ? 1 : 0)})
//                       </span>
//                     </div>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => {
//                         clearFilters();
//                         clearColumnSearch();
//                       }}
//                       className="text-xs h-6 px-2"
//                     >
//                       Clear all
//                     </Button>
//                   </div>
//                   <div className="flex flex-wrap gap-1 mt-1">
//                     {filters.is_active && (
//                       <Badge variant="secondary" className="text-xs h-5">
//                         Status: {filters.is_active === "true" ? "Active" : "Inactive"}
//                       </Badge>
//                     )}
//                     {filters.gender && (
//                       <Badge variant="secondary" className="text-xs h-5">
//                         Gender: {filters.gender}
//                       </Badge>
//                     )}
//                     {filters.occupation_category && (
//                       <Badge variant="secondary" className="text-xs h-5">
//                         Occupation: {filters.occupation_category}
//                       </Badge>
//                     )}
//                     {filters.city && (
//                       <Badge variant="secondary" className="text-xs h-5">
//                         City: {filters.city}
//                       </Badge>
//                     )}
//                     {filters.state && (
//                       <Badge variant="secondary" className="text-xs h-5">
//                         State: {filters.state}
//                       </Badge>
//                     )}
//                     {filters.preferred_sharing && (
//                       <Badge variant="secondary" className="text-xs h-5">
//                         Sharing: {filters.preferred_sharing}
//                       </Badge>
//                     )}
//                     {filters.portal_access_enabled && (
//                       <Badge variant="secondary" className="text-xs h-5">
//                         Portal: {filters.portal_access_enabled === "true" ? "Enabled" : "Disabled"}
//                       </Badge>
//                     )}
//                     {filters.has_credentials && (
//                       <Badge variant="secondary" className="text-xs h-5">
//                         Login: {filters.has_credentials === "true" ? "Has Login" : "No Login"}
//                       </Badge>
//                     )}
//                     {hasColumnSearch && (
//                       <Badge variant="secondary" className="text-xs h-5">
//                         Column Search
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </CardHeader>

//           <CardContent className="p-0">
//             {/* DataTable Component with Column Search Fields */}
//             <div className="overflow-x-auto">
//               <div className="w-full">
//                 <div className="bg-slate-100 border-b">
//                   <div className="grid grid-cols-12 gap-2 px-6 py-3">
//                     {/* Name Column Header with Search */}
//                     <div className="col-span-2">
//                       <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
//                         Name
//                       </div>
//                       <Input
//                         placeholder="Search name..."
//                         value={columnSearch.name}
//                         onChange={(e) => handleColumnSearchChange('name', e.target.value)}
//                         className="mt-2 h-8 text-sm"
//                       />
//                     </div>
                    
//                     {/* Contact Column Header with Search */}
//                     <div className="col-span-2">
//                       <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
//                         Contact
//                       </div>
//                       <Input
//                         placeholder="Search email/phone..."
//                         value={columnSearch.contact}
//                         onChange={(e) => handleColumnSearchChange('contact', e.target.value)}
//                         className="mt-2 h-8 text-sm"
//                       />
//                     </div>
                    
//                     {/* Occupation Column Header with Search */}
//                     <div className="col-span-2">
//                       <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
//                         Occupation
//                       </div>
//                       <Input
//                         placeholder="Search occupation..."
//                         value={columnSearch.occupation}
//                         onChange={(e) => handleColumnSearchChange('occupation', e.target.value)}
//                         className="mt-2 h-8 text-sm"
//                       />
//                     </div>
                    
//                     {/* Property Column Header with Search */}
//                     <div className="col-span-2">
//                       <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
//                         Property & Room
//                       </div>
//                       <Input
//                         placeholder="Search property..."
//                         value={columnSearch.property}
//                         onChange={(e) => handleColumnSearchChange('property', e.target.value)}
//                         className="mt-2 h-8 text-sm"
//                       />
//                     </div>
                    
//                     {/* Payments Column Header with Search */}
//                     <div className="col-span-2">
//                       <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
//                         Payments
//                       </div>
//                       <Input
//                         placeholder="Search payments..."
//                         value={columnSearch.payments}
//                         onChange={(e) => handleColumnSearchChange('payments', e.target.value)}
//                         className="mt-2 h-8 text-sm"
//                       />
//                     </div>
                    
//                     {/* Status Column Header with Search */}
//                     <div className="col-span-1">
//                       <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
//                         Status
//                       </div>
//                       <Input
//                         placeholder="Search status..."
//                         value={columnSearch.status}
//                         onChange={(e) => handleColumnSearchChange('status', e.target.value)}
//                         className="mt-2 h-8 text-sm"
//                       />
//                     </div>
                    
//                     {/* Actions Column */}
//                     <div className="col-span-1 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
//                       Actions
//                     </div>
//                   </div>
//                 </div>
                
//                 {/* DataTable Component */}
//                 <div className="p-6">
//                   <DataTable
//                     data={tenants.map(t => ({ ...t, id: String(t.id) }))}
//                     columns={columns}
//                     filters={tableFilters}
//                     bulkActions={bulkActions}
//                     actions={actions}
//                     loading={loading}
//                     onRefresh={loadTenants}
//                     searchPlaceholder="Search tenants..."
//                     emptyMessage="No tenants found. Add your first tenant to get started."
//                     pageSize={15}
//                     showSearch={false}
//                     showFilters={false}
//                     showRefresh={false}
//                     showExport={false}
//                     onSearchChange={(search) => {
//                       setFilters(prev => ({ ...prev, search }));
//                       setTimeout(() => loadTenants(), 300);
//                     }}
//                     onFilterChange={(key, value) => {
//                       loadTenants();
//                     }}
//                     onSelectionChange={handleTenantSelection}
//                   />
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* View Tenant Details Dialog */}
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
//               {/* Profile Header */}
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

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Contact Information */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">Contact Information</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-3">
//                     <div>
//                       <p className="text-sm font-medium text-slate-600">Email</p>
//                       <p className="text-sm">{selectedTenant.email}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-slate-600">Phone</p>
//                       <p className="text-sm">{selectedTenant.country_code} {selectedTenant.phone}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-slate-600">Address</p>
//                       <p className="text-sm">{selectedTenant.address}</p>
//                       <p className="text-sm">
//                         {selectedTenant.city}, {selectedTenant.state} - {selectedTenant.pincode}
//                       </p>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Occupation & Preferences */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">Occupation & Preferences</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-3">
//                     <div>
//                       <p className="text-sm font-medium text-slate-600">Occupation Category</p>
//                       <Badge variant="outline">{selectedTenant.occupation_category || "Other"}</Badge>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-slate-600">Occupation Details</p>
//                       <p className="text-sm">{selectedTenant.exact_occupation || selectedTenant.occupation || "-"}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-slate-600">Room Preferences</p>
//                       <div className="flex gap-2 mt-1">
//                         {selectedTenant.preferred_sharing && (
//                           <Badge variant="outline">{selectedTenant.preferred_sharing} sharing</Badge>
//                         )}
//                         {selectedTenant.preferred_room_type && (
//                           <Badge variant="outline">{selectedTenant.preferred_room_type}</Badge>
//                         )}
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Current Booking */}
//                 <Card className="md:col-span-2">
//                   <CardHeader>
//                     <CardTitle className="text-lg">Current Booking & Payments</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     {selectedTenant.bookings?.length > 0 ? (
//                       selectedTenant.bookings
//                         .filter(b => b.status === 'active')
//                         .map((booking) => (
//                           <div key={booking.id} className="space-y-4">
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                               <div>
//                                 <p className="text-sm font-medium text-slate-600">Property</p>
//                                 <p className="font-medium">{booking.properties?.name}</p>
//                                 <p className="text-sm text-slate-500">
//                                   {booking.properties?.city}, {booking.properties?.state}
//                                 </p>
//                               </div>
//                               {booking.room && (
//                                 <div>
//                                   <p className="text-sm font-medium text-slate-600">Room Details</p>
//                                   <p className="font-medium">
//                                     Room {booking.room.room_number}
//                                   </p>
//                                   <p className="text-sm text-slate-500">
//                                     {booking.room.sharing_type} sharing • Floor {booking.room.floor || "-"}
//                                   </p>
//                                 </div>
//                               )}
//                               <div>
//                                 <p className="text-sm font-medium text-slate-600">Monthly Rent</p>
//                                 <p className="font-medium text-green-600">
//                                   ₹{booking.monthly_rent?.toLocaleString()}
//                                 </p>
//                               </div>
//                             </div>

//                             {/* Payment Summary */}
//                             {selectedTenant.payments && selectedTenant.payments.length > 0 && (
//                               <div className="mt-4">
//                                 <Separator className="my-4" />
//                                 <h4 className="font-medium mb-2">Payment History</h4>
//                                 <div className="space-y-2">
//                                   {selectedTenant.payments.slice(0, 5).map((payment) => (
//                                     <div key={payment.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
//                                       <div>
//                                         <p className="text-sm font-medium">
//                                           {payment.description || "Payment"}
//                                         </p>
//                                         <p className="text-xs text-slate-500">
//                                           {new Date(payment.payment_date).toLocaleDateString()} • 
//                                           {payment.payment_method}
//                                         </p>
//                                       </div>
//                                       <div className="text-right">
//                                         <p className={`font-medium ${
//                                           payment.status === 'paid' ? 'text-green-600' : 'text-red-600'
//                                         }`}>
//                                           ₹{payment.amount?.toLocaleString()}
//                                         </p>
//                                         <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
//                                           {payment.status}
//                                         </Badge>
//                                       </div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         ))
//                     ) : (
//                       <p className="text-slate-500">No active booking</p>
//                     )}
//                   </CardContent>
//                 </Card>

//                 {/* Documents */}
//                 <Card className="md:col-span-2">
//                   <CardHeader>
//                     <CardTitle className="text-lg">Documents</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       {selectedTenant.id_proof_url && (
//                         <div className="border rounded-lg p-4">
//                           <div className="flex items-center gap-2 mb-2">
//                             <FileText className="h-4 w-4" />
//                             <span className="font-medium">ID Proof</span>
//                           </div>
//                           <a
//                             href={selectedTenant.id_proof_url}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-sm text-blue-600 hover:underline"
//                           >
//                             View Document
//                           </a>
//                         </div>
//                       )}
                      
//                       {selectedTenant.address_proof_url && (
//                         <div className="border rounded-lg p-4">
//                           <div className="flex items-center gap-2 mb-2">
//                             <FileText className="h-4 w-4" />
//                             <span className="font-medium">Address Proof</span>
//                           </div>
//                           <a
//                             href={selectedTenant.address_proof_url}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-sm text-blue-600 hover:underline"
//                           >
//                             View Document
//                           </a>
//                         </div>
//                       )}
                      
//                       {selectedTenant.photo_url && (
//                         <div className="border rounded-lg p-4">
//                           <div className="flex items-center gap-2 mb-2">
//                             <FileText className="h-4 w-4" />
//                             <span className="font-medium">Photo</span>
//                           </div>
//                           <a
//                             href={selectedTenant.photo_url}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-sm text-blue-600 hover:underline"
//                           >
//                             View Photo
//                           </a>
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* System Information */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">System Information</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-3">
//                     <div>
//                       <p className="text-sm font-medium text-slate-600">Created At</p>
//                       <p className="text-sm">
//                         {new Date(selectedTenant.created_at!).toLocaleDateString()}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-slate-600">Last Updated</p>
//                       <p className="text-sm">
//                         {selectedTenant.updated_at 
//                           ? new Date(selectedTenant.updated_at).toLocaleDateString()
//                           : "-"}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-slate-600">Login Email</p>
//                       <p className="text-sm">
//                         {selectedTenant.credential_email || "No login configured"}
//                       </p>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* Edit Tenant Dialog */}
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
//                   onClick={selectedTenant.has_credentials ? handleResetPassword : handleCreateCredentials}
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



// import { Suspense } from "react";
// import TenantsClient from "@/components/admin/tenants/tenants-client";
// import { TenantFilters } from "@/lib/tenantApi";

// interface TenantsPageProps {
//   searchParams: {
//     search?: string;
//     page?: string;
//     is_active?: string;
//     portal_access_enabled?: string;
//     has_credentials?: string;
//     gender?: string;
//     occupation_category?: string;
//     city?: string;
//     state?: string;
//     preferred_sharing?: string;
//   };
// }

// export default async function TenantsPage({ searchParams }: TenantsPageProps) {

//   const filters: TenantFilters = {
//     search: searchParams.search || "",
//     page: searchParams.page ? Number(searchParams.page) : 1,
//     is_active: searchParams.is_active,
//     portal_access_enabled: searchParams.portal_access_enabled,
//     has_credentials: searchParams.has_credentials,
//     gender: searchParams.gender,
//     occupation_category: searchParams.occupation_category,
//     city: searchParams.city,
//     state: searchParams.state,
//     preferred_sharing: searchParams.preferred_sharing,
//   };

//   let initialData: any[] = [];

//   try {
//     const params = new URLSearchParams();

//     Object.entries(filters).forEach(([key, value]) => {
//       if (value !== "" && value !== undefined && value !== null) {
//         params.append(key, String(value));
//       }
//     });

//     const res = await fetch(
//       `http://localhost:3001/api/tenants?${params.toString()}`,
//       { cache: "no-store" }
//     );

//     if (res.ok) {
//       const result = await res.json();
//       if (result.success) {
//         initialData = result.data.map((t: any) => ({
//           ...t,
//           id: String(t.id),
//         }));
//       }
//     }
//   } catch (error) {
//     console.error("Tenant fetch failed:", error);
//   }

//   // Fixed FilterSelect component
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
//     <div className="min-h-screen bg-slate-50">

//       <Suspense fallback={<TenantsLoading />}>

//         <TenantsClient
//           initialData={initialData}
//           initialFilters={filters}
//           initialSearchQuery={filters.search}
//         />

//       </Suspense>

//     </div>
//   );
// }

// function TenantsLoading() {
//   return (
//     <div className="p-2">
//       <div className="border-0 shadow-lg rounded-lg">
//         <div className="sticky top-16 z-10 bg-blue-600 py-3 px-6">
//           <div className="flex justify-between">
//             <div className="animate-pulse bg-white/30 h-9 w-32 rounded" />
//             <div className="flex gap-2">
//               {[1,2,3,4].map(i => (
//                 <div key={i} className="animate-pulse bg-white/30 h-9 w-24 rounded" />
//               ))}
//             </div>
//           </div>
//         </div>
//         <div className="p-6">
//           <div className="animate-pulse bg-white/30 h-96 rounded" />
//         </div>
//       </div>
//     </div>
//   );
// }

// app/admin/tenants/page.tsx
import { useState, useEffect } from "react";
import TenantsClient from "@/components/admin/tenants/tenants-client";
import { listTenants, Tenant } from "@/lib/tenantApi";

const initialFilters = {
  search: undefined,
  page: undefined,
  pageSize: undefined,
  gender: undefined,
  occupation_category: undefined,
  is_active: undefined,
  portal_access_enabled: undefined,
  has_credentials: undefined,
  city: undefined,
  state: undefined,
  preferred_sharing: undefined
};

export default function TenantsPage() {
  const [initialData, setInitialData] = useState<Tenant[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    listTenants({})
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setInitialData(res.data);
        }
      })
      .catch((err) => console.error("Failed to load tenants:", err))
      .finally(() => setInitialLoading(false));
  }, []);

  if (initialLoading) return <TenantsLoading />;
  return (
    <TenantsClient
      initialData={initialData}
      initialLoading={false}
      initialFilters={initialFilters}
    />
  );
}

function TenantsLoading() {
  return (
    <div className="p-2">
      <div className="border-0 shadow-lg rounded-lg">
        <div className="sticky top-16 z-10 bg-blue-600 py-3 px-6">
          <div className="flex justify-between">
            <div className="animate-pulse bg-white/30 h-9 w-32 rounded" />
            <div className="flex gap-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse bg-white/30 h-9 w-24 rounded" />
              ))}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse bg-white/30 h-96 rounded" />
        </div>
      </div>
    </div>
  );
}