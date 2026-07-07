// // app/admin/offers/PricingPlansTable.tsx
// import { useState } from "react";
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
// import {
//   Edit, Trash2, Star, IndianRupee, Building, ChevronLeft, ChevronRight,
//   Sparkles, Clock, Check, Gift, Eye, Loader2, AlertCircle, Trash,
// } from "lucide-react";
// import { PricingPlan, PaginationMeta } from "@/lib/pricingPlanApi";
// import { PropertyApiResponse } from "../offers/OffersClientPage";
// import { useAuth } from "@/context/authContext";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, "All"] as const;
// interface PricingPlansTableProps {
//   plans: PricingPlan[];
//   loading: boolean;
//   properties: PropertyApiResponse[];
//   pagination: PaginationMeta;
//   onEdit: (plan: PricingPlan) => void;
//   onDelete: (id: string) => void;
//   onBulkDelete?: (ids: string[]) => void;
//   onToggleActive: (id: string, current: boolean) => void;
//   onPageChange: (page: number) => void;
//   onCreateNew: () => void;
//   onView?: (plan: PricingPlan) => void;
//   onItemsPerPageChange?: (limit: number | "All") => void;
//    currentItemsPerPage?: number | "All"; 
// }

// const PricingPlansTable = ({
//   plans,
//   loading,
//   properties,
//   pagination,
//   onEdit,
//   onDelete,
//   onBulkDelete,
//   onToggleActive,
//   onPageChange,
//   onCreateNew,
//   onView,
//   currentItemsPerPage, 
//   onItemsPerPageChange,
// }: PricingPlansTableProps) => {
//   const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [planToDelete, setPlanToDelete] = useState<PricingPlan | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [isBulkDeleting, setIsBulkDeleting] = useState(false);
// const { can } = useAuth();

//   const getPropertyName = (propertyId: number | null) => {
//     if (!propertyId) return null;
//     return properties.find(p => p.id === propertyId)?.name || `Property #${propertyId}`;
//   };

//   // Handle single plan selection
//   const handleSelectPlan = (id: string) => {
//     setSelectedPlans(prev => {
//       if (prev.includes(id)) {
//         return prev.filter(planId => planId !== id);
//       } else {
//         return [...prev, id];
//       }
//     });
//     setSelectAll(false);
//   };

//   // Handle select all
//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedPlans([]);
//       setSelectAll(false);
//     } else {
//       const allIds = plans.map(plan => plan.id);
//       setSelectedPlans(allIds);
//       setSelectAll(true);
//     }
//   };

//   // Handle single delete with modal
//   const handleDeleteClick = (plan: PricingPlan) => {
//     setPlanToDelete(plan);
//     setShowDeleteDialog(true);
//   };

//   // Confirm single delete
//   const confirmDelete = async () => {
//     if (!planToDelete) return;
    
//     setIsDeleting(true);
//     try {
//       await onDelete(planToDelete.id);
//       setShowDeleteDialog(false);
//       setPlanToDelete(null);
//     } catch (error) {
//       console.error("Error deleting plan:", error);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   // Handle bulk delete
//   const handleBulkDelete = () => {
//     if (selectedPlans.length === 0) return;
//     setShowBulkDeleteDialog(true);
//   };

//   // Confirm bulk delete
//   const confirmBulkDelete = async () => {
//     if (!onBulkDelete) return;
    
//     setIsBulkDeleting(true);
//     try {
//       await onBulkDelete(selectedPlans);
//       setSelectedPlans([]);
//       setSelectAll(false);
//       setShowBulkDeleteDialog(false);
//     } catch (error) {
//       console.error("Error bulk deleting plans:", error);
//     } finally {
//       setIsBulkDeleting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="space-y-2 p-4">
//         {[...Array(5)].map((_, i) => (
//           <Skeleton key={i} className="h-12 w-full rounded-lg" />
//         ))}
//       </div>
//     );
//   }

//   if (!plans.length) {
//     return (
//       <div className="text-center py-16">
//         <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <Sparkles className="h-8 w-8 text-blue-500" />
//         </div>
//         <h3 className="text-base font-bold text-gray-700 mb-1">No Pricing Plans Yet</h3>
//         <p className="text-sm text-gray-500 mb-4">Create your first pricing plan to get started</p>
//         <Button
//           onClick={onCreateNew}
//           size="sm"
//           className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
//         >
//           Create Plan
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="space-y-3">
//         {/* Bulk Actions Bar */}
// {can('delete_pricing_plans') && selectedPlans.length > 0 && (
//           <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-3 flex items-center justify-between animate-in slide-in-from-top-2">
//             <div className="flex items-center gap-3">
//               <Badge variant="secondary" className="bg-blue-100 text-blue-700">
//                 {selectedPlans.length} {selectedPlans.length === 1 ? 'plan' : 'plans'} selected
//               </Badge>
//               <Button 
//                 variant="ghost" 
//                 size="sm" 
//                 onClick={() => {
//                   setSelectedPlans([]);
//                   setSelectAll(false);
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 Clear
//               </Button>
//             </div>
//             <Button 
//               variant="destructive" 
//               size="sm"
//               onClick={handleBulkDelete}
//               className="bg-red-600 hover:bg-red-700"
//             >
//               <Trash className="h-4 w-4 mr-1" />
//               Delete Selected
//             </Button>
//           </div>
//         )}

//        <div className="overflow-x-auto rounded-xl border border-gray-100 max-h-[380px] md:max-h-[400px] overflow-y-auto relative">
//   <Table>
// <TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-white [&_th]:shadow-sm">
//               <TableRow className="bg-gray-50/80">
//                 {/* Checkbox column */}
//                 <TableHead className="text-[11px] font-bold text-gray-600 py-2 pl-4 w-8">
//                     {can('delete_pricing_plans') && (

//                   <Checkbox 
//                     checked={selectAll && plans.length > 0}
//                     onCheckedChange={handleSelectAll}
//                     className="h-3.5 w-3.5"
//                   />
//                     )}
//                 </TableHead>
//                 <TableHead className="text-[11px] font-bold text-gray-600 py-2 w-8">#</TableHead>
//                 <TableHead className="text-[11px] font-bold text-gray-600 py-2">Plan</TableHead>
//                 <TableHead className="text-[11px] font-bold text-gray-600 py-2">Pricing</TableHead>
//                 <TableHead className="text-[11px] font-bold text-gray-600 py-2 hidden md:table-cell">Features</TableHead>
//                 <TableHead className="text-[11px] font-bold text-gray-600 py-2 hidden sm:table-cell">Property</TableHead>
//                 <TableHead className="text-[11px] font-bold text-gray-600 py-2">Status</TableHead>
//                 <TableHead className="text-[11px] font-bold text-gray-600 py-2 text-right pr-4">Actions</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {plans.map((plan) => {
//                 const propertyName = getPropertyName(plan.property_id);
//                 const isShortStay = plan.is_short_stay;

//                 return (
//                   <TableRow key={plan.id} className="hover:bg-blue-50/30 transition-colors">
//                     {/* Checkbox */}
//                       {can('delete_pricing_plans') && (

//                     <TableCell className="py-2.5 pl-4">
//                       <Checkbox 
//                         checked={selectedPlans.includes(plan.id)}
//                         onCheckedChange={() => handleSelectPlan(plan.id)}
//                         className="h-3.5 w-3.5"
//                       />
//                     </TableCell>
//                       )}

//                     {/* Order column */}
//                     <TableCell className="py-2.5">
//                       {!plan.is_short_stay && (
//                         <span className="text-[10px] font-bold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
//                           {plan.display_order}
//                         </span>
//                       )}
//                     </TableCell>

//                     <TableCell className="py-2.5">
//                       <div className="flex items-center gap-2">
//                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
//                           isShortStay
//                             ? "bg-gradient-to-br from-amber-500 to-orange-500"
//                             : plan.button_style === "blue"
//                               ? "bg-gradient-to-br from-blue-600 to-cyan-600"
//                               : "bg-gradient-to-br from-gray-700 to-gray-900"
//                         }`}>
//                           {isShortStay ? (
//                             <Gift className="h-3.5 w-3.5 text-white" />
//                           ) : (
//                             <Sparkles className="h-3.5 w-3.5 text-white" />
//                           )}
//                         </div>
//                         <div>
//                           <div className="flex items-center gap-1">
//                             <span className="text-xs font-bold text-gray-900">{plan.name}</span>
//                             {isShortStay && (
//                               <Badge className="text-[8px] px-1 py-0 h-3.5 bg-amber-100 text-amber-700 border-amber-200">
//                                 <Gift className="h-2 w-2 mr-0.5" />
//                                 Short Stay
//                               </Badge>
//                             )}
//                             {!!plan.is_popular && !isShortStay && (
//                               <Badge className="text-[8px] px-1 py-0 h-3.5 bg-amber-100 text-amber-700 border-amber-200">
//                                 <Star className="h-2 w-2 mr-0.5 fill-amber-500 text-amber-500" />
//                                 Popular
//                               </Badge>
//                             )}
//                           </div>
//                           {!isShortStay && (
//                             <div className="flex items-center gap-1 text-[10px] text-gray-500">
//                               <Clock className="h-2.5 w-2.5" />
//                               {plan.duration}
//                               <span className="text-gray-300 mx-0.5">•</span>
//                               <span className="text-gray-400">{plan.subtitle}</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </TableCell>

//                     <TableCell className="py-2.5">
//                       {isShortStay ? (
//                         <div>
//                           <div className="flex items-baseline gap-0.5">
//                             <IndianRupee className="h-3 w-3 text-amber-600" />
//                             <span className="text-sm font-black text-amber-600">
//                               {plan.short_stay_rate_per_day?.toLocaleString()}
//                             </span>
//                             <span className="text-[10px] text-gray-400">/day</span>
//                           </div>
//                           <div className="text-[9px] text-gray-400 mt-0.5">
//                             Flexible daily booking
//                           </div>
//                         </div>
//                       ) : (
//                         <div>
//                           <div className="flex items-baseline gap-0.5">
//                             <IndianRupee className="h-3 w-3 text-blue-600" />
//                             <span className="text-sm font-black text-blue-600">
//                               {plan.total_price.toLocaleString()}
//                             </span>
//                           </div>
//                           <div className="text-[10px] text-gray-400">
//                             ₹{plan.per_day_price}/day
//                           </div>
//                         </div>
//                       )}
//                     </TableCell>

//                     <TableCell className="py-2.5 hidden md:table-cell">
//                       {isShortStay ? (
//                         <div className="flex flex-wrap gap-1">
//                           <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
//                             <Check className="h-2 w-2" />
//                             No minimum stay
//                           </span>
//                           <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
//                             <Check className="h-2 w-2" />
//                             Flexible check-in
//                           </span>
//                         </div>
//                       ) : (
//                         <div className="flex flex-wrap gap-1 max-w-[200px]">
//                           {plan.features.slice(0, 2).map((f, i) => (
//                             <span key={i} className="inline-flex items-center gap-0.5 text-[9px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-full">
//                               <Check className="h-2 w-2 text-green-500" />
//                               {f}
//                             </span>
//                           ))}
//                           {plan.features.length > 2 && (
//                             <span className="text-[9px] text-gray-400">+{plan.features.length - 2} more</span>
//                           )}
//                         </div>
//                       )}
//                     </TableCell>

//                     <TableCell className="py-2.5 hidden sm:table-cell">
//                       {propertyName ? (
//                         <div className="flex items-center gap-1 text-[10px] text-gray-600">
//                           <Building className="h-2.5 w-2.5 text-purple-500" />
//                           <span className="truncate max-w-[100px]">{propertyName}</span>
//                         </div>
//                       ) : (
//                         <span className="text-[10px] text-gray-400 italic">General</span>
//                       )}
//                     </TableCell>

//                     <TableCell className="py-2.5">
//                       <div className="flex items-center gap-1.5">
//                         <Switch
//                           checked={plan.is_active}
//                           onCheckedChange={() => onToggleActive(plan.id, plan.is_active)}
//                           className="scale-75 data-[state=checked]:bg-green-500"
//                         />
//                         <span className={`text-[10px] font-semibold ${plan.is_active ? "text-green-600" : "text-gray-400"}`}>
//                           {plan.is_active ? "Active" : "Off"}
//                         </span>
//                       </div>
//                     </TableCell>

//                     <TableCell className="py-2.5 pr-4 text-right">
//                       <div className="flex items-center justify-end gap-1">
//                         {can('view_pricing_plans') && onView && (
//                           <Button
//                             size="sm"
//                             variant="ghost"
//                             onClick={() => onView(plan)}
//                             className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
//                             title="View Details"
//                           >
//                             <Eye className="h-3 w-3" />
//                           </Button>
//                         )}
//                             {can('edit_pricing_plans') && (

//                         <Button
//                           size="sm"
//                           variant="ghost"
//                           onClick={() => onEdit(plan)}
//                           className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
//                           title="Edit"
//                         >
//                           <Edit className="h-3 w-3" />
//                         </Button>
//                             )}
//                             {can('delete_pricing_plans') && (
//                         <Button
//                           size="sm"
//                           variant="ghost"
//                           onClick={() => handleDeleteClick(plan)}
//                           className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
//                           title="Delete"
//                         >
//                           <Trash2 className="h-3 w-3" />
//                         </Button>
//                             )}
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           </Table>
//         </div>

//       {plans.length > 0 && (
//   <div className="flex items-center justify-between px-1 flex-wrap gap-2">
//     <div className="flex items-center gap-2 text-gray-500">
//       <span className="text-[11px]">
//         Showing {((pagination.currentPage - 1) * pagination.limit) + 1}–
//         {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of {pagination.totalItems} plans
//       </span>
//       {onItemsPerPageChange && (
//         <div className="flex items-center gap-1">
//           <span className="text-gray-400 text-[10px]">Rows:</span>
//           <Select
//            value={String(currentItemsPerPage ?? pagination.limit)} 
//             onValueChange={(val) => {
//               if (val === "All") {
//                 onItemsPerPageChange("All");
//               } else {
//                 onItemsPerPageChange(Number(val));
//               }
//             }}
//           >
//             <SelectTrigger className="h-6 w-14 text-[10px] border-gray-200 px-1">
//               <SelectValue>
//                   {currentItemsPerPage === "All" ? "All" : (currentItemsPerPage ?? pagination.limit)}
//               </SelectValue>
//             </SelectTrigger>
//             <SelectContent>
//               {PAGE_SIZE_OPTIONS.map((size) => (
//                 <SelectItem
//                   key={String(size)}
//                   value={String(size)}
//                   className="text-xs"
//                 >
//                   {size}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       )}
//     </div>

//     {/* Page navigation – only show if more than one page */}
//     {pagination.totalPages > 1 && (
//       <div className="flex items-center gap-1">
//         <Button
//           size="sm"
//           variant="outline"
//           onClick={() => onPageChange(pagination.currentPage - 1)}
//           disabled={!pagination.hasPrevPage}
//           className="h-6 w-6 p-0"
//         >
//           <ChevronLeft className="h-3 w-3" />
//         </Button>
//         {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
//           const page = i + 1;
//           return (
//             <Button
//               key={page}
//               size="sm"
//               variant={pagination.currentPage === page ? "default" : "outline"}
//               onClick={() => onPageChange(page)}
//               className={`h-6 w-6 p-0 text-[10px] ${
//                 pagination.currentPage === page
//                   ? "bg-blue-600 text-white border-blue-600"
//                   : ""
//               }`}
//             >
//               {page}
//             </Button>
//           );
//         })}
//         <Button
//           size="sm"
//           variant="outline"
//           onClick={() => onPageChange(pagination.currentPage + 1)}
//           disabled={!pagination.hasNextPage}
//           className="h-6 w-6 p-0"
//         >
//           <ChevronRight className="h-3 w-3" />
//         </Button>
//       </div>
//     )}
//   </div>
// )}
//       </div>

//       {/* Single Delete Confirmation Dialog */}
//       <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-red-600">
//               <AlertCircle className="h-5 w-5" />
//               Confirm Delete
//             </DialogTitle>
//             <DialogDescription>
//               Are you sure you want to delete this pricing plan?
//               {planToDelete && (
//                 <div className="mt-3 p-3 bg-gray-50 rounded-md">
//                   <p className="text-sm font-medium text-gray-900">{planToDelete.name}</p>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Price: ₹{planToDelete.is_short_stay 
//                       ? planToDelete.short_stay_rate_per_day?.toLocaleString() + "/day"
//                       : planToDelete.total_price.toLocaleString()}
//                   </p>
//                 </div>
//               )}
//               <p className="mt-2 text-sm text-red-600">This action cannot be undone.</p>
//             </DialogDescription>
//           </DialogHeader>
          
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowDeleteDialog(false);
//                 setPlanToDelete(null);
//               }}
//               disabled={isDeleting}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={confirmDelete}
//               disabled={isDeleting}
//               className="bg-red-600 hover:bg-red-700"
//             >
//               {isDeleting ? (
//                 <>
//                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   Deleting...
//                 </>
//               ) : (
//                 <>
//                   <Trash2 className="h-4 w-4 mr-2" />
//                   Delete Plan
//                 </>
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Bulk Delete Confirmation Dialog */}
//       <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-red-600">
//               <AlertCircle className="h-5 w-5" />
//               Confirm Bulk Delete
//             </DialogTitle>
//             <DialogDescription>
//               Are you sure you want to delete {selectedPlans.length} {selectedPlans.length === 1 ? 'plan' : 'plans'}?
//               <div className="mt-3 p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
//                 <p className="text-xs font-medium text-gray-700 mb-1">Selected plans:</p>
//                 <ul className="text-xs text-gray-600 space-y-1">
//                   {plans
//                     .filter(p => selectedPlans.includes(p.id))
//                     .slice(0, 5)
//                     .map(p => (
//                       <li key={p.id} className="truncate">• {p.name}</li>
//                     ))}
//                   {selectedPlans.length > 5 && (
//                     <li className="text-gray-400">...and {selectedPlans.length - 5} more</li>
//                   )}
//                 </ul>
//               </div>
//               <p className="mt-2 text-sm text-red-600">This action cannot be undone.</p>
//             </DialogDescription>
//           </DialogHeader>
          
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setShowBulkDeleteDialog(false)}
//               disabled={isBulkDeleting}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={confirmBulkDelete}
//               disabled={isBulkDeleting}
//               className="bg-red-600 hover:bg-red-700"
//             >
//               {isBulkDeleting ? (
//                 <>
//                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   Deleting...
//                 </>
//               ) : (
//                 <>
//                   <Trash className="h-4 w-4 mr-2" />
//                   Delete {selectedPlans.length} {selectedPlans.length === 1 ? 'Plan' : 'Plans'}
//                 </>
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default PricingPlansTable;


// app/admin/offers/PricingPlansTable.tsx
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit, Trash2, Star, IndianRupee, Building, ChevronLeft, ChevronRight,
  Sparkles, Clock, Check, Gift, Eye, Loader2, AlertCircle, Trash,
  X,
} from "lucide-react";
import { PricingPlan, PaginationMeta } from "@/lib/pricingPlanApi";
import { PropertyApiResponse } from "../offers/OffersClientPage";
import { useAuth } from "@/context/authContext";
import MySwal from "@/app/utils/swal";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, "All"] as const;

interface PricingPlansTableProps {
  plans: PricingPlan[];
  loading: boolean;
  properties: PropertyApiResponse[];
  pagination: PaginationMeta;
  onEdit: (plan: PricingPlan) => void;
  onDelete: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onToggleActive: (id: string, current: boolean) => void;
  onPageChange: (page: number) => void;
  onCreateNew: () => void;
  onView?: (plan: PricingPlan) => void;
  onItemsPerPageChange?: (limit: number | "All") => void;
  currentItemsPerPage?: number | "All";
}

interface ColumnFilters {
  name: string;
  pricing: string;
  features: string;
  property: string;
  status: string;
}

const PricingPlansTable = ({
  plans,
  loading,
  properties,
  pagination,
  onEdit,
  onDelete,
  onBulkDelete,
  onToggleActive,
  onPageChange,
  onCreateNew,
  onView,
  currentItemsPerPage,
  onItemsPerPageChange,
}: PricingPlansTableProps) => {
  const [filters, setFilters] = useState<ColumnFilters>({
    name: "",
    pricing: "",
    features: "",
    property: "",
    status: "",
  });

  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { can } = useAuth();

  const getPropertyName = (propertyId: number | null) => {
    if (!propertyId) return null;
    return properties.find(p => p.id === propertyId)?.name || `Property #${propertyId}`;
  };

  // Filter plans
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const nameMatch = plan.name.toLowerCase().includes(filters.name.toLowerCase());
      const pricingStr = plan.is_short_stay
        ? `₹${plan.short_stay_rate_per_day}/day`
        : `₹${plan.total_price}`;
      const pricingMatch = pricingStr.toLowerCase().includes(filters.pricing.toLowerCase());
      const featuresStr = plan.features.join(" ");
      const featuresMatch = featuresStr.toLowerCase().includes(filters.features.toLowerCase());
      const propertyName = getPropertyName(plan.property_id) || "";
      const propertyMatch = propertyName.toLowerCase().includes(filters.property.toLowerCase());
      const statusMatch = filters.status === "" || filters.status === "all"
        ? true
        : filters.status === "active"
          ? plan.is_active
          : !plan.is_active;
      return nameMatch && pricingMatch && featuresMatch && propertyMatch && statusMatch;
    });
  }, [plans, filters, properties]);

  const handleFilterChange = (key: keyof ColumnFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      pricing: "",
      features: "",
      property: "",
      status: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "" && v !== "all");

  // Selection
  const handleSelectPlan = (id: string) => {
    setSelectedPlans(prev => {
      if (prev.includes(id)) {
        return prev.filter(pid => pid !== id);
      } else {
        return [...prev, id];
      }
    });
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPlans([]);
      setSelectAll(false);
    } else {
      const allIds = filteredPlans.map(plan => plan.id);
      setSelectedPlans(allIds);
      setSelectAll(true);
    }
  };

  // Single delete with SweetAlert
  const handleDeleteClick = (plan: PricingPlan) => {
    MySwal.fire({
      title: 'Delete Pricing Plan?',
      html: `
        <div class="text-left">
          <p>You are about to delete <b>${plan.name}</b>.</p>
          <p class="text-sm text-gray-500 mt-1">Price: ${plan.is_short_stay ? `₹${plan.short_stay_rate_per_day}/day` : `₹${plan.total_price.toLocaleString()}`}</p>
          <p class="text-sm text-red-600 mt-2">This action cannot be undone!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete plan!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 mx-1',
        cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 mx-1',
        actions: 'flex justify-center gap-2 mt-4',
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        setIsDeleting(true);
        onDelete(plan.id)
          .catch(() => {})
          .finally(() => setIsDeleting(false));
      }
    });
  };

  // Bulk delete with SweetAlert
  const handleBulkDelete = () => {
    if (selectedPlans.length === 0) return;

    MySwal.fire({
      title: 'Delete Pricing Plans?',
      html: `
        <div class="text-left">
          <p>You are about to delete <b>${selectedPlans.length}</b> plan${selectedPlans.length !== 1 ? 's' : ''}.</p>
          <div class="mt-2 p-2 bg-gray-50 rounded max-h-32 overflow-y-auto">
            <p class="text-xs font-medium text-gray-700">Selected plans:</p>
            <ul class="text-xs text-gray-600 space-y-1">
              ${filteredPlans
                .filter(p => selectedPlans.includes(p.id))
                .slice(0, 5)
                .map(p => `<li>• ${p.name}</li>`)
                .join('')}
              ${selectedPlans.length > 5 ? `<li class="text-gray-400">...and ${selectedPlans.length - 5} more</li>` : ''}
            </ul>
          </div>
          <p class="text-sm text-red-600 mt-2">This action cannot be undone!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, delete ${selectedPlans.length} plan${selectedPlans.length !== 1 ? 's' : ''}!`,
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 mx-1',
        cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 mx-1',
        actions: 'flex justify-center gap-2 mt-4',
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        if (onBulkDelete) {
          onBulkDelete(selectedPlans);
        } else {
          // fallback: delete one by one
          selectedPlans.forEach(id => onDelete(id));
        }
        setSelectedPlans([]);
        setSelectAll(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!plans.length) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-base font-bold text-gray-700 mb-1">No Pricing Plans Yet</h3>
        <p className="text-sm text-gray-500 mb-4">Create your first pricing plan to get started</p>
        <Button
          onClick={onCreateNew}
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
        >
          Create Plan
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* ── Bulk actions bar ── */}
      {selectedPlans.length > 0 && (
        <div className="flex items-center justify-between gap-3 border border-[#E2E8F4] rounded-xl px-3 py-2 min-h-[44px] bg-white mb-2">
          <span className="font-bold text-[#1A2B6D] text-sm whitespace-nowrap">
            {selectedPlans.length} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedPlans([]);
                setSelectAll(false);
              }}
              className="text-xs text-[#8892A4] hover:text-gray-600 px-2 py-1"
            >
              Clear
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg text-xs font-bold text-[#DC2626] hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete {selectedPlans.length}
            </button>
          </div>
        </div>
      )}

      {/* ── Table Container ── */}
  <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
  <div
    className={`flex flex-col rounded-xl transition-all duration-300 ${
      selectedPlans.length > 0
        ? "h-[400px] md:h-[420px]"
        : "h-[450px] md:h-[460px]"
    }`}
  >
    <div className="overflow-auto flex-1 min-h-0 rounded-lg">
      <table className="w-full min-w-[1000px] table-fixed border-collapse ">
        <colgroup>
          <col style={{ width: "34px" }} />   {/* checkbox */}
          <col style={{ width: "40px" }} />   {/* order */}
          <col style={{ width: "180px" }} />  {/* Plan */}
          <col style={{ width: "110px" }} />  {/* Pricing */}
          <col style={{ width: "140px" }} />  {/* Features */}
          <col style={{ width: "100px" }} />  {/* Property */}
          <col style={{ width: "90px" }} />   {/* Status */}
          <col style={{ width: "110px" }} />  {/* Actions */}
        </colgroup>

        <thead className="sticky top-0 z-10">
          {/* ── Row 1: Column Titles ── */}
          <tr className="bg-gray-200 border-b border-gray-300">
            <th className="py-0.5 px-1 text-center border-r border-gray-300 bg-gray-200">
              {can('delete_pricing_plans') && (
                <input
                  type="checkbox"
                  checked={selectAll && filteredPlans.length > 0}
                  onChange={handleSelectAll}
                  className="w-3.5 h-3.5 cursor-pointer"
                />
              )}
            </th>
            <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">#</span>
            </th>
            <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Plan</span>
            </th>
            <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Pricing</span>
            </th>
            <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Features</span>
            </th>
            <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Property</span>
            </th>
            <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Status</span>
            </th>
            <th className="py-0.5 px-1 text-left bg-gray-200">
              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Actions</span>
            </th>
          </tr>

          {/* ── Row 2: Search Inputs ── */}
          <tr className="bg-white border-b border-gray-300">
            <td className="p-0.5 border-r border-gray-200 text-center" />
            <td className="p-0.5 border-r border-gray-200" />
            <td className="p-0.5 border-r border-gray-200">
              <input
                type="text"
                placeholder="Search plan…"
                className="h-5 w-full text-[10px] border border-gray-300 rounded px-1 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
              />
            </td>
            <td className="p-0.5 border-r border-gray-200">
              <input
                type="text"
                placeholder="Search pricing…"
                className="h-5 w-full text-[10px] border border-gray-300 rounded px-1 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                value={filters.pricing}
                onChange={(e) => handleFilterChange("pricing", e.target.value)}
              />
            </td>
            <td className="p-0.5 border-r border-gray-200">
              <input
                type="text"
                placeholder="Search features…"
                className="h-5 w-full text-[10px] border border-gray-300 rounded px-1 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                value={filters.features}
                onChange={(e) => handleFilterChange("features", e.target.value)}
              />
            </td>
            <td className="p-0.5 border-r border-gray-200">
              <input
                type="text"
                placeholder="Search property…"
                className="h-5 w-full text-[10px] border border-gray-300 rounded px-1 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                value={filters.property}
                onChange={(e) => handleFilterChange("property", e.target.value)}
              />
            </td>
            <td className="p-0.5 border-r border-gray-200">
              <Select
                value={filters.status}
                onValueChange={(v) => handleFilterChange("status", v)}
              >
                <SelectTrigger className="h-5 text-[10px] border border-gray-300 rounded px-1 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </td>
            <td className="p-0.5">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="h-5 w-full text-[10px] text-blue-600 hover:text-blue-800 flex items-center justify-center gap-0.5"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </td>
          </tr>
        </thead>

        <tbody>
          {filteredPlans.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-8 text-gray-400 text-xs">
                <div className="flex flex-col items-center gap-2">
                  <Sparkles className="h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">No pricing plans found</p>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">
                      Clear Filters
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            filteredPlans.map((plan) => {
              const propertyName = getPropertyName(plan.property_id);
              const isShortStay = plan.is_short_stay;

              return (
                <tr
                  key={plan.id}
                  className={`hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100 ${
                    selectedPlans.includes(plan.id) ? "bg-blue-50/50" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-0.5 px-1 text-center border-r border-gray-100">
                    {can('delete_pricing_plans') && (
                      <input
                        type="checkbox"
                        checked={selectedPlans.includes(plan.id)}
                        onChange={() => handleSelectPlan(plan.id)}
                        className="w-3.5 h-3.5 cursor-pointer"
                      />
                    )}
                  </td>

                  {/* Order */}
                  <td className="py-0.5 px-1 border-r border-gray-100">
                    {!isShortStay && (
                      <span className="text-[9px] font-bold text-gray-400 bg-gray-100 rounded px-1 py-0.5">
                        {plan.display_order}
                      </span>
                    )}
                  </td>

                  {/* Plan */}
                  <td className="py-0.5 px-1 border-r border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isShortStay
                          ? "bg-gradient-to-br from-amber-500 to-orange-500"
                          : plan.button_style === "blue"
                            ? "bg-gradient-to-br from-blue-600 to-cyan-600"
                            : "bg-gradient-to-br from-gray-700 to-gray-900"
                      }`}>
                        {isShortStay ? (
                          <Gift className="h-3 w-3 text-white" />
                        ) : (
                          <Sparkles className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-0.5 flex-wrap">
                          <span className="text-[10px] font-bold text-gray-900">{plan.name}</span>
                          {isShortStay && (
                            <Badge className="text-[7px] px-0.5 py-0 h-3 bg-amber-100 text-amber-700 border-amber-200">
                              <Gift className="h-2 w-2 mr-0.5" />
                              Short Stay
                            </Badge>
                          )}
                          {!!plan.is_popular && !isShortStay && (
                            <Badge className="text-[7px] px-0.5 py-0 h-3 bg-amber-100 text-amber-700 border-amber-200">
                              <Star className="h-2 w-2 mr-0.5 fill-amber-500 text-amber-500" />
                              Popular
                            </Badge>
                          )}
                        </div>
                        {!isShortStay && (
                          <div className="flex items-center gap-0.5 text-[8px] text-gray-500">
                            <Clock className="h-2 w-2" />
                            {plan.duration}
                            <span className="text-gray-300 mx-0.5">•</span>
                            <span className="text-gray-400">{plan.subtitle}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Pricing */}
                  <td className="py-0.5 px-1 border-r border-gray-100">
                    {isShortStay ? (
                      <div>
                        <div className="flex items-baseline gap-0.5">
                          <IndianRupee className="h-2.5 w-2.5 text-amber-600" />
                          <span className="text-xs font-black text-amber-600">
                            {plan.short_stay_rate_per_day?.toLocaleString()}
                          </span>
                          <span className="text-[8px] text-gray-400">/day</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-0.5">
                          <IndianRupee className="h-2.5 w-2.5 text-blue-600" />
                          <span className="text-xs font-black text-blue-600">
                            {plan.total_price.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[8px] text-gray-400">
                          ₹{plan.per_day_price}/day
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Features */}
                  <td className="py-0.5 px-1 border-r border-gray-100">
                    <div className="flex flex-wrap gap-0.5">
                      {plan.features.slice(0, 2).map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-0.5 text-[8px] text-gray-600 bg-gray-100 px-1 py-0 rounded-full">
                          <Check className="h-2 w-2 text-green-500" />
                          {f}
                        </span>
                      ))}
                      {plan.features.length > 2 && (
                        <span className="text-[8px] text-gray-400">+{plan.features.length - 2}</span>
                      )}
                      {isShortStay && (
                        <span className="text-[8px] text-amber-600 bg-amber-50 px-1 py-0 rounded-full">
                          Flexible
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Property */}
                  <td className="py-0.5 px-1 border-r border-gray-100">
                    {propertyName ? (
                      <div className="flex items-center gap-0.5 text-[9px] text-gray-600">
                        <Building className="h-2 w-2 text-purple-500" />
                        <span className="truncate max-w-[80px]">{propertyName}</span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-gray-400 italic">General</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-0.5 px-1 border-r border-gray-100">
                    <div className="flex items-center gap-0.5">
                      <Switch
                        checked={plan.is_active}
                        onCheckedChange={() => onToggleActive(plan.id, plan.is_active)}
                        className="scale-75 data-[state=checked]:bg-green-500"
                      />
                      <span className={`text-[8px] font-semibold ${plan.is_active ? "text-green-600" : "text-gray-400"}`}>
                        {plan.is_active ? "Active" : "Off"}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-0.5 px-1">
                    <div className="flex items-center gap-0.5">
                      {can('view_pricing_plans') && onView && (
                        <button
                          onClick={() => onView(plan)}
                          className="h-5 w-5 rounded hover:bg-blue-100 flex items-center justify-center"
                          title="View"
                        >
                          <Eye className="h-2.5 w-2.5 text-blue-500" />
                        </button>
                      )}
                      {can('edit_pricing_plans') && (
                        <button
                          onClick={() => onEdit(plan)}
                          className="h-5 w-5 rounded hover:bg-amber-50 flex items-center justify-center"
                          title="Edit"
                        >
                          <Edit className="h-2.5 w-2.5 text-amber-600" />
                        </button>
                      )}
                      {can('delete_pricing_plans') && (
                        <button
                          onClick={() => handleDeleteClick(plan)}
                          className="h-5 w-5 rounded hover:bg-red-50 flex items-center justify-center"
                          title="Delete"
                        >
                          <Trash2 className="h-2.5 w-2.5 text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>

    {/* ── Pagination ── */}
    <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-3 py-1.5 rounded-b-lg">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 whitespace-nowrap text-[10px]">
            {pagination.totalItems} plans
          </span>
          {onItemsPerPageChange && (
            <Select
              value={String(currentItemsPerPage ?? pagination.limit)}
              onValueChange={(val) => {
                if (val === "All") {
                  onItemsPerPageChange("All");
                } else {
                  onItemsPerPageChange(Number(val));
                }
              }}
            >
              <SelectTrigger className="h-5 w-14 text-[10px] border-gray-200 px-1">
                <SelectValue>
                  {currentItemsPerPage === "All" ? "All" : (currentItemsPerPage ?? pagination.limit)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={String(size)} value={String(size)} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="h-5 w-5 rounded border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-100"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <span className="text-[10px] text-gray-600 px-1 whitespace-nowrap">
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="h-5 w-5 rounded border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-100"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
    </>
  );
};

export default PricingPlansTable;