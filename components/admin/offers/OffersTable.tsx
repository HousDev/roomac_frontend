


// // app/admin/offers/components/OffersTable.tsx
// import {
//   Table,
//   TableBody,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCell,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Offer } from "@/lib/offerApi";
// import { PropertyApiResponse } from "./OffersClientPage";
// import {
//   Building,
//   Key,
//   Ticket,
//   Calendar,
//   Eye,
//   Edit,
//   Trash2,
//   Share2,
//   Search,
//   X,
//   Plus,
//   Filter,
//   Percent,
//   Clock,
//   CalendarDays,
//   Power,
// } from "lucide-react";
// import Pagination from "./Pagination";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useState, useEffect } from "react";
// import { useAuth } from "@/context/authContext";

// interface OffersTableProps {
//   offers: Offer[];
//   loading: boolean;
//   properties: PropertyApiResponse[];
//   onEdit: (offer: Offer) => void;
//   onDelete: (offerId: string) => void;
//   onToggleActive: (offerId: string, currentStatus: boolean) => void;
//   onPreview: (offer: Offer) => void;
//   onShare: (offer: Offer) => void;
//   pagination: {
//     currentPage: number;
//     totalPages: number;
//     totalItems: number;
//     limit: number;
//     hasNextPage: boolean;
//     hasPrevPage: boolean;
//   };
//   onPageChange: (page: number) => void;
//   onCreateNew: () => void;
//   onItemsPerPageChange?: (limit: number | "All") => void;
// }

// interface ColumnFilters {
//   code: string;
//   title: string;
//   property: string;
//   discount: string;
//   minStay: string;
//   validity: string;
//   status: string;
// }

// const OffersTable = ({
//   offers,
//   loading,
//   properties,
//   onEdit,
//   onDelete,
//   onToggleActive,
//   onPreview,
//   onShare,
//   pagination,
//   onItemsPerPageChange,
//   onPageChange,
//   onCreateNew,
// }: OffersTableProps) => {
//   const [filters, setFilters] = useState<ColumnFilters>({
//     code: "",
//     title: "",
//     property: "",
//     discount: "",
//     minStay: "",
//     validity: "",
//     status: "",
//   });

//   const [filteredOffers, setFilteredOffers] = useState<Offer[]>(offers);
// const { can } = useAuth();

//   useEffect(() => {
//     const filtered = offers.filter((offer) => {
//       const matchesCode = offer.code.toLowerCase().includes(filters.code.toLowerCase());
//       const matchesTitle = 
//         offer.title.toLowerCase().includes(filters.title.toLowerCase()) ||
//         (offer.description?.toLowerCase() || "").includes(filters.title.toLowerCase());
      
//       const propertyText = `${offer.property_name || ""} ${offer.room_number || ""} ${offer.sharing_type || ""}`.toLowerCase();
//       const matchesProperty = propertyText.includes(filters.property.toLowerCase());

//       const discountText = offer.discount_type === "percentage" 
//         ? `${offer.discount_percent}% off`
//         : `₹${offer.discount_value} off`;
//       const matchesDiscount = discountText.toLowerCase().includes(filters.discount.toLowerCase());
      
//       const matchesMinStay = offer.min_months.toString().includes(filters.minStay);
      
//       const validityText = `${offer.start_date || ""} ${offer.end_date || ""}`.toLowerCase();
//       const matchesValidity = validityText.includes(filters.validity.toLowerCase());
      
//       const matchesStatus = filters.status === "all" || filters.status === "" || 
//         (filters.status === "active" && offer.is_active) ||
//         (filters.status === "inactive" && !offer.is_active);

//       return matchesCode && matchesTitle && matchesProperty && 
//              matchesDiscount && matchesMinStay && matchesValidity && matchesStatus;
//     });
//     setFilteredOffers(filtered);
//   }, [offers, filters]);

//   const handleFilterChange = (column: keyof ColumnFilters, value: string) => {
//     setFilters(prev => ({ ...prev, [column]: value }));
//   };

//   const clearFilters = () => {
//     setFilters({
//       code: "",
//       title: "",
//       property: "",
//       discount: "",
//       minStay: "",
//       validity: "",
//       status: "",
//     });
//   };

//   const hasActiveFilters = Object.values(filters).some(v => v !== "" && v !== "all");

//   const renderPropertyInfo = (offer: Offer) => {
//     if (!offer.property_name) {
//       return (
//         <div className="space-y-0.5">
//           <div className="flex items-center gap-1">
//             <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
//             <span className="text-gray-500 text-xs">General Offer</span>
//           </div>
//         </div>
//       );
//     }
    
//     return (
//       <div className="space-y-0.5">
//         <div className="flex items-center gap-1">
//           <Building className="h-3 w-3 text-purple-500 flex-shrink-0" />
//           <span className="font-medium text-xs truncate max-w-[100px]">{offer.property_name}</span>
//         </div>
//         {offer.room_number && (
//           <div className="flex flex-wrap items-center gap-1 text-[10px] text-gray-600">
//             <Key className="h-2 w-2 flex-shrink-0" />
//             <span className="truncate max-w-[50px]">{offer.room_number}</span>
//             {offer.sharing_type && (
//               <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 capitalize">
//                 {offer.sharing_type}
//               </Badge>
//             )}
//             {offer.rent_per_bed && (
//               <span className="text-[9px] text-green-600 whitespace-nowrap">
//                 ₹{offer.rent_per_bed}
//               </span>
//             )}
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (loading) {
//     return <OffersTableSkeleton />;
//   }

//   return (
//     <>
     

//       {/* Table Container */}
// <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
//         {/* Scrollable Table */}
// <div className="overflow-auto max-h-[410px] md:max-h-[450px] overflow-y-auto relative">      <Table className="min-w-full table-auto border-collapse ">
// <TableHeader style={{ position: 'sticky', top: 0, zIndex: 10 }} className="bg-white shadow-sm">
//           <TableRow className="bg-gray-50 border-b border-gray-200">
//             <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[80px] text-left">Code</TableHead>
//             <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[150px] text-left">Offer Details</TableHead>
//             <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[150px] text-left">Property / Room</TableHead>
//             <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[80px] text-left">Discount</TableHead>
//             <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[70px] text-left">Min Stay</TableHead>
//             <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[130px] text-left">Validity</TableHead>
//             <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[80px] text-left">Status</TableHead>
//             <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[120px] text-left">Actions</TableHead>
//           </TableRow>
//           <TableRow className="bg-gray-50/50 border-b border-gray-200">
//             <TableHead className="py-1.5 px-2">
//               <Input placeholder="Filter" value={filters.code} onChange={(e) => handleFilterChange("code", e.target.value)} className="h-7 text-xs border-gray-200" />
//             </TableHead>
//             <TableHead className="py-1.5 px-2">
//               <Input placeholder="Filter" value={filters.title} onChange={(e) => handleFilterChange("title", e.target.value)} className="h-7 text-xs border-gray-200" />
//             </TableHead>
//             <TableHead className="py-1.5 px-2">
//               <Input placeholder="Filter" value={filters.property} onChange={(e) => handleFilterChange("property", e.target.value)} className="h-7 text-xs border-gray-200" />
//             </TableHead>
//             <TableHead className="py-1.5 px-2">
//               <Input placeholder="Filter" value={filters.discount} onChange={(e) => handleFilterChange("discount", e.target.value)} className="h-7 text-xs border-gray-200" />
//             </TableHead>
//             <TableHead className="py-1.5 px-2">
//               <Input placeholder="Filter" value={filters.minStay} onChange={(e) => handleFilterChange("minStay", e.target.value)} className="h-7 text-xs border-gray-200" />
//             </TableHead>
//             <TableHead className="py-1.5 px-2">
//               <Input placeholder="Filter" value={filters.validity} onChange={(e) => handleFilterChange("validity", e.target.value)} className="h-7 text-xs border-gray-200" />
//             </TableHead>
//             <TableHead className="py-1.5 px-2">
//               <Select value={filters.status} onValueChange={(v) => handleFilterChange("status", v)}>
//                 <SelectTrigger className="h-7 text-xs border-gray-200">
//                   <SelectValue placeholder="Filter" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All</SelectItem>
//                   <SelectItem value="active">Active</SelectItem>
//                   <SelectItem value="inactive">Inactive</SelectItem>
//                 </SelectContent>
//               </Select>
//             </TableHead>
//             <TableHead className="py-1.5 px-2">
//               {hasActiveFilters && (
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={clearFilters}
//                   className="h-7 w-full text-xs border border-gray-200"
//                 >
//                   <X className="h-3 w-3 mr-1" />
//                   Clear
//                 </Button>
//               )}
//             </TableHead>
//           </TableRow>
//         </TableHeader>

//                 <TableBody>
//                   {filteredOffers.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={8} className="text-center py-8">
//                         <div className="flex flex-col items-center gap-2">
//                           <Filter className="h-8 w-8 text-gray-300" />
//                           <p className="text-sm text-gray-500">No offers found</p>
//                           {hasActiveFilters && (
//                             <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">
//                               Clear Filters
//                             </Button>
//                           )}
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     filteredOffers.map((offer) => (
//                       <TableRow key={offer.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
//                         <TableCell className="py-1.5 px-2">
//                           <div className="flex items-center gap-1">
//                             <Ticket className="h-3 w-3 text-blue-500 flex-shrink-0" />
//                             <span className="font-mono font-semibold text-blue-700 text-xs">
//                               {offer.code}
//                             </span>
//                           </div>
//                         </TableCell>
//                         <TableCell className="py-1.5 px-2">
//                           <div>
//                             <p className="font-medium text-xs text-gray-800 truncate max-w-[120px]">
//                               {offer.title}
//                             </p>
//                             <p className="text-[9px] text-slate-500 truncate max-w-[120px] mt-0.5">
//                               {offer.description || offer.offer_type.replace('_', ' ')}
//                             </p>
//                           </div>
//                         </TableCell>
//                         <TableCell className="py-1.5 px-2">
//                           {renderPropertyInfo(offer)}
//                         </TableCell>
//                         <TableCell className="py-1.5 px-2">
//                           <Badge variant="secondary" className={`
//                             text-[9px] px-1 py-0 h-4 font-medium whitespace-nowrap
//                             ${offer.discount_type === "percentage"
//                               ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200"
//                               : "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200"
//                             }
//                           `}>
//                             {offer.discount_type === "percentage" ? (
//                               <span>{offer.discount_percent}% OFF</span>
//                             ) : (
//                               <span>₹{offer.discount_value} OFF</span>
//                             )}
//                           </Badge>
//                         </TableCell>
//                        <TableCell className="py-1.5 px-2">
//   <div className="flex items-center gap-1">
//     <Clock className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
//     <span className="text-xs whitespace-nowrap">
//       {offer.min_months} {offer.min_months === 1 ? "month" : "months"}
//     </span>
//   </div>
// </TableCell>

//                         <TableCell className="py-1.5 px-2">
//                           <div className="text-[9px]">
//                             {offer.start_date ? (
//                               <>
//                                 <div className="flex items-center gap-1">
//                                   <CalendarDays className="h-2.5 w-2.5 text-slate-500 flex-shrink-0" />
//                                   <span className="whitespace-nowrap">
//                                     {new Date(offer.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit'})}
//                                   </span>
//                                 </div>
//                                 {offer.end_date && (
//                                   <p className="text-slate-400 mt-0.5 whitespace-nowrap">
//                                     to {new Date(offer.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit'})}
//                                   </p>
//                                 )}
//                               </>
//                             ) : (
//                               <span className="text-gray-400">No dates</span>
//                             )}
//                           </div>
//                         </TableCell>
//                         <TableCell className="py-1.5 px-2">
//                           <Button
//                             size="sm"
//                             variant={offer.is_active ? "default" : "outline"}
//                             onClick={() => onToggleActive(offer.id, offer.is_active)}
//                             className={`
//                               h-5 text-[9px] px-1.5 font-medium w-14
//                               ${offer.is_active
//                                 ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
//                                 : "border-gray-300 hover:border-gray-400 text-gray-600"
//                             }
//                           `}>
//                             {offer.is_active ? "Active" : "Inactive"}
//                           </Button>
//                         </TableCell>
//                         <TableCell className="py-1.5 px-2">
                         
//                           <div className="flex items-center gap-0.5">
//                             {can('view_offers') && (

//                             <Button
//                               size="sm"
//                               variant="ghost"
//                               onClick={() => onPreview(offer)}
//                               className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
//                               title="Preview"
//                             >
//                               <Eye className="h-3 w-3" />
//                             </Button>
//                             )}
//                             {can('edit_offers') && (

//                             <Button
//                               size="sm"
//                               variant="ghost"
//                               onClick={() => onEdit(offer)}
//                               className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
//                               title="Edit"
//                             >
//                               <Edit className="h-3 w-3" />
//                             </Button>
//                             )}
//                             {can('delete_offers') && (
//                             <Button
//                               size="sm"
//                               variant="ghost"
//                               onClick={() => onDelete(offer.id)}
//                               className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
//                               title="Delete"
//                             >
//                               <Trash2 className="h-3 w-3" />
//                             </Button>
//                             )}
//                             {can('share_offers') && (

//                             <Button
//                               size="sm"
//                               variant="ghost"
//                               onClick={() => onShare(offer)}
//                               className="h-6 w-6 p-0 hover:bg-green-50 hover:text-green-600"
//                               title="Share"
//                             >
//                               <Share2 className="h-3 w-3" />
//                             </Button>
//                             )}
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
           
        
//         </div>

//       {/* Footer with Pagination */}
// <div className="border-t border-gray-200 bg-white px-3 py-1.5 sm:px-4 sm:py-2">
//   <div className="flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">

//     {/* Left side: Records info + Rows per page dropdown */}
//     <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] sm:text-xs text-gray-600">
//       <span>
//         Showing {Math.min((pagination.currentPage - 1) * pagination.limit + 1, pagination.totalItems)} –
//         {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of {pagination.totalItems}
//       </span>

//       <span className="text-gray-300">|</span>

//       <div className="flex items-center gap-1">
//         <span className="text-gray-500">Rows:</span>
//      <Select
//   value={pagination.limit === 999999 ? "All" : String(pagination.limit)}
//   onValueChange={(value) => {
//     if (value === "All") {
//       onItemsPerPageChange?.("All");
//     } else {
//       onItemsPerPageChange?.(Number(value));
//     }
//   }}
// >
//           <SelectTrigger className="h-7 w-16 text-xs border-gray-300">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="10">10</SelectItem>
//             <SelectItem value="25">25</SelectItem>
//             <SelectItem value="50">50</SelectItem>
//             <SelectItem value="100">100</SelectItem>
//             <SelectItem value="All">All</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//     </div>

//     {/* Right side: Page navigation */}
//     {pagination.totalPages > 1 && (
//       <div className="w-full sm:w-auto flex justify-center sm:justify-end">
//         <Pagination
//           currentPage={pagination.currentPage}
//           totalPages={pagination.totalPages}
//           onPageChange={onPageChange}
//           className="py-0 text-[11px] sm:text-xs"
//         />
//       </div>
//     )}
//   </div>
// </div>

//       </div>
//     </>
//   );
// };

// export const OffersTableSkeleton = () => (
//   <div className="space-y-4">
//     <div className="flex justify-between">
//       <Skeleton className="h-8 w-48" />
//       <Skeleton className="h-10 w-32" />
//     </div>
//     <Skeleton className="h-12 w-full" />
//     <Skeleton className="h-6 w-40" />
//     <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
//       <div className="overflow-x-auto">
//         <div className="max-h-[500px] overflow-y-auto">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 {Array.from({ length: 8 }).map((_, i) => (
//                   <TableHead key={i} className="py-2 px-2">
//                     <Skeleton className="h-3 w-16" />
//                   </TableHead>
//                 ))}
//               </TableRow>
//               <TableRow>
//                 {Array.from({ length: 8 }).map((_, i) => (
//                   <TableHead key={i} className="py-1.5 px-2">
//                     <Skeleton className="h-7 w-full" />
//                   </TableHead>
//                 ))}
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {Array.from({ length: 5 }).map((_, rowIndex) => (
//                 <TableRow key={rowIndex}>
//                   {Array.from({ length: 8 }).map((_, colIndex) => (
//                     <TableCell key={colIndex} className="py-1.5 px-2">
//                       {colIndex === 6 ? (
//                         <Skeleton className="h-5 w-14" />
//                       ) : colIndex === 7 ? (
//                         <div className="flex gap-0.5">
//                           <Skeleton className="h-6 w-6" />
//                           <Skeleton className="h-6 w-6" />
//                           <Skeleton className="h-6 w-6" />
//                           <Skeleton className="h-6 w-6" />
//                         </div>
//                       ) : (
//                         <Skeleton className="h-3 w-full" />
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </div>
//       <div className="border-t border-gray-200 px-4 py-2">
//         <div className="flex justify-between">
//           <Skeleton className="h-4 w-40" />
//           <Skeleton className="h-4 w-40" />
//         </div>
//       </div>
//     </div>
//   </div>
// );

// export default OffersTable;



// app/admin/offers/components/OffersTable.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Offer } from "@/lib/offerApi";
import { PropertyApiResponse } from "./OffersClientPage";
import {
  Building,
  Key,
  Ticket,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Share2,
  X,
  Filter,
  Clock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import MySwal from "@/app/utils/swal"; // ✅ added

interface OffersTableProps {
  offers: Offer[];
  loading: boolean;
  properties: PropertyApiResponse[];
  onEdit: (offer: Offer) => void;
  onDelete: (offerId: string) => void;
  onToggleActive: (offerId: string, currentStatus: boolean) => void;
  onPreview: (offer: Offer) => void;
  onShare: (offer: Offer) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange: (page: number) => void;
  onCreateNew: () => void;
  onItemsPerPageChange?: (limit: number | "All") => void;
  onBulkDelete?: (ids: string[]) => void; // new
}

interface ColumnFilters {
  code: string;
  title: string;
  property: string;
  discount: string;
  minStay: string;
  validity: string;
  status: string;
}

const OffersTable = ({
  offers,
  loading,
  properties,
  onEdit,
  onDelete,
  onToggleActive,
  onPreview,
  onShare,
  pagination,
  onItemsPerPageChange,
  onPageChange,
  onCreateNew,
  onBulkDelete,
}: OffersTableProps) => {
  const [filters, setFilters] = useState<ColumnFilters>({
    code: "",
    title: "",
    property: "",
    discount: "",
    minStay: "",
    validity: "",
    status: "",
  });

  const [filteredOffers, setFilteredOffers] = useState<Offer[]>(offers);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { can } = useAuth();

  useEffect(() => {
    const filtered = offers.filter((offer) => {
      const matchesCode = offer.code.toLowerCase().includes(filters.code.toLowerCase());
      const matchesTitle = 
        offer.title.toLowerCase().includes(filters.title.toLowerCase()) ||
        (offer.description?.toLowerCase() || "").includes(filters.title.toLowerCase());
      
      const propertyText = `${offer.property_name || ""} ${offer.room_number || ""} ${offer.sharing_type || ""}`.toLowerCase();
      const matchesProperty = propertyText.includes(filters.property.toLowerCase());

      const discountText = offer.discount_type === "percentage" 
        ? `${offer.discount_percent}% off`
        : `₹${offer.discount_value} off`;
      const matchesDiscount = discountText.toLowerCase().includes(filters.discount.toLowerCase());
      
      const matchesMinStay = offer.min_months.toString().includes(filters.minStay);
      
      const validityText = `${offer.start_date || ""} ${offer.end_date || ""}`.toLowerCase();
      const matchesValidity = validityText.includes(filters.validity.toLowerCase());
      
      const matchesStatus = filters.status === "all" || filters.status === "" || 
        (filters.status === "active" && offer.is_active) ||
        (filters.status === "inactive" && !offer.is_active);

      return matchesCode && matchesTitle && matchesProperty && 
             matchesDiscount && matchesMinStay && matchesValidity && matchesStatus;
    });
    setFilteredOffers(filtered);
    setSelectedIds(new Set());
  }, [offers, filters]);

  const handleFilterChange = (column: keyof ColumnFilters, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const clearFilters = () => {
    setFilters({
      code: "",
      title: "",
      property: "",
      discount: "",
      minStay: "",
      validity: "",
      status: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "" && v !== "all");

  const handleSelectAll = () => {
    if (selectedIds.size === filteredOffers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOffers.map(o => o.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  // ✅ Bulk delete with SweetAlert
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const result = await MySwal.fire({
      title: 'Delete Offers?',
      html: `You are about to delete <b>${selectedIds.size}</b> offer${selectedIds.size !== 1 ? 's' : ''}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, delete ${selectedIds.size} offer${selectedIds.size !== 1 ? 's' : ''}!`,
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 mx-1',
        cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 mx-1',
        actions: 'flex justify-center gap-2 mt-4',
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    if (onBulkDelete) {
      onBulkDelete(Array.from(selectedIds));
    } else {
      // fallback: delete one by one
      selectedIds.forEach(id => onDelete(id));
    }
    setSelectedIds(new Set());
  };

  const renderPropertyInfo = (offer: Offer) => {
    if (!offer.property_name) {
      return (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="text-gray-500 text-xs">General Offer</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1">
          <Building className="h-3 w-3 text-purple-500 flex-shrink-0" />
          <span className="font-medium text-xs truncate max-w-[100px]">{offer.property_name}</span>
        </div>
        {offer.room_number && (
          <div className="flex flex-wrap items-center gap-1 text-[10px] text-gray-600">
            <Key className="h-2 w-2 flex-shrink-0" />
            <span className="truncate max-w-[50px]">{offer.room_number}</span>
            {offer.sharing_type && (
              <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 capitalize">
                {offer.sharing_type}
              </Badge>
            )}
            {offer.rent_per_bed && (
              <span className="text-[9px] text-green-600 whitespace-nowrap">
                ₹{offer.rent_per_bed}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <OffersTableSkeleton />;
  }

  return (
    <>
      {/* ── Bulk actions bar (visitor‑log style) ── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 border border-[#E2E8F4] rounded-xl px-3 py-2 min-h-[44px] bg-white mb-2">
          <span className="font-bold text-[#1A2B6D] text-sm whitespace-nowrap">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-[#8892A4] hover:text-gray-600 px-2 py-1"
            >
              Clear
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg text-xs font-bold text-[#DC2626] hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete {selectedIds.size}
            </button>
          </div>
        </div>
      )}

      {/* ── Table Container with fixed height ── */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
        <div className="relative">
          {/* ✅ Fixed height — same as visitor log */}
         <div
  className={`overflow-auto rounded-lg transition-all duration-300 ${
    selectedIds.size > 0
      ? "h-[380px] md:h-[400px]"
      : "h-[420px] md:h-[450px]"
  }`}
>
            <table className="w-full min-w-[1000px] table-fixed border-collapse">
              <colgroup>
                <col style={{ width: "34px" }} />   {/* checkbox */}
                <col style={{ width: "80px" }} />   {/* Code */}
                <col style={{ width: "150px" }} />  {/* Offer Details */}
                <col style={{ width: "150px" }} />  {/* Property / Room */}
                <col style={{ width: "80px" }} />   {/* Discount */}
                <col style={{ width: "70px" }} />   {/* Min Stay */}
                <col style={{ width: "130px" }} />  {/* Validity */}
                <col style={{ width: "80px" }} />   {/* Status */}
                <col style={{ width: "120px" }} />  {/* Actions */}
              </colgroup>

              <thead className="sticky top-0 z-10">
                {/* Row 1: Column Titles */}
                <tr className="bg-gray-200 border-b border-gray-300">
                  <th className="py-0.5 px-1 text-center border-r border-gray-300 bg-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredOffers.length && filteredOffers.length > 0}
                      onChange={handleSelectAll}
                      className="w-3.5 h-3.5 cursor-pointer"
                    />
                  </th>
                  <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Code</span>
                  </th>
                  <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Offer Details</span>
                  </th>
                  <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Property / Room</span>
                  </th>
                  <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Discount</span>
                  </th>
                  <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Min Stay</span>
                  </th>
                  <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Validity</span>
                  </th>
                  <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Status</span>
                  </th>
                  <th className="py-0.5 px-1 text-left bg-gray-200">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Actions</span>
                  </th>
                </tr>

                {/* Row 2: Search Inputs */}
                <tr className="bg-white border-b border-gray-300">
                  <td className="p-0.5 border-r border-gray-200 text-center" />
                  <td className="p-0.5 border-r border-gray-200">
                    <Input
                      placeholder="Search code…"
                      className="h-5 text-[10px] border-gray-300 px-1 bg-white"
                      value={filters.code}
                      onChange={(e) => handleFilterChange("code", e.target.value)}
                    />
                  </td>
                  <td className="p-0.5 border-r border-gray-200">
                    <Input
                      placeholder="Search title…"
                      className="h-5 text-[10px] border-gray-300 px-1 bg-white"
                      value={filters.title}
                      onChange={(e) => handleFilterChange("title", e.target.value)}
                    />
                  </td>
                  <td className="p-0.5 border-r border-gray-200">
                    <Input
                      placeholder="Search property…"
                      className="h-5 text-[10px] border-gray-300 px-1 bg-white"
                      value={filters.property}
                      onChange={(e) => handleFilterChange("property", e.target.value)}
                    />
                  </td>
                  <td className="p-0.5 border-r border-gray-200">
                    <Input
                      placeholder="Search discount…"
                      className="h-5 text-[10px] border-gray-300 px-1 bg-white"
                      value={filters.discount}
                      onChange={(e) => handleFilterChange("discount", e.target.value)}
                    />
                  </td>
                  <td className="p-0.5 border-r border-gray-200">
                    <Input
                      placeholder="Min stay…"
                      className="h-5 text-[10px] border-gray-300 px-1 bg-white"
                      value={filters.minStay}
                      onChange={(e) => handleFilterChange("minStay", e.target.value)}
                    />
                  </td>
                  <td className="p-0.5 border-r border-gray-200">
                    <Input
                      placeholder="Search validity…"
                      className="h-5 text-[10px] border-gray-300 px-1 bg-white"
                      value={filters.validity}
                      onChange={(e) => handleFilterChange("validity", e.target.value)}
                    />
                  </td>
                  <td className="p-0.5 border-r border-gray-200">
                    <Select
                      value={filters.status}
                      onValueChange={(v) => handleFilterChange("status", v)}
                    >
                      <SelectTrigger className="h-5 text-[10px] border-gray-300 px-1 bg-white">
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
                {filteredOffers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-400 text-xs">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="h-8 w-8 text-gray-300" />
                        <p className="text-sm text-gray-500">No offers found</p>
                        {hasActiveFilters && (
                          <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOffers.map((offer) => (
                    <tr
                      key={offer.id}
                      className={`hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100 ${
                        selectedIds.has(offer.id) ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <td className="py-0.5 px-1 text-center border-r border-gray-100">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(offer.id)}
                          onChange={() => handleSelectOne(offer.id)}
                          className="w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>
                      <td className="py-0.5 px-1 border-r border-gray-100">
                        <div className="flex items-center gap-1">
                          <Ticket className="h-2.5 w-2.5 text-blue-500 flex-shrink-0" />
                          <span className="font-mono font-semibold text-blue-700 text-[10px]">
                            {offer.code}
                          </span>
                        </div>
                      </td>
                      <td className="py-0.5 px-1 border-r border-gray-100">
                        <div>
                          <p className="font-medium text-[10px] text-gray-800 truncate max-w-[120px]">
                            {offer.title}
                          </p>
                          <p className="text-[8px] text-slate-500 truncate max-w-[120px] mt-0.5">
                            {offer.description || offer.offer_type.replace('_', ' ')}
                          </p>
                        </div>
                      </td>
                      <td className="py-0.5 px-1 border-r border-gray-100">
                        {renderPropertyInfo(offer)}
                      </td>
                      <td className="py-0.5 px-1 border-r border-gray-100">
                        <Badge variant="secondary" className={`
                          text-[8px] px-1 py-0 h-3 font-medium whitespace-nowrap
                          ${offer.discount_type === "percentage"
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200"
                            : "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200"
                          }
                        `}>
                          {offer.discount_type === "percentage" ? (
                            <span>{offer.discount_percent}% OFF</span>
                          ) : (
                            <span>₹{offer.discount_value} OFF</span>
                          )}
                        </Badge>
                      </td>
                      <td className="py-0.5 px-1 border-r border-gray-100">
                        <div className="flex items-center gap-1">
                          <Clock className="h-2 w-2 text-gray-400 flex-shrink-0" />
                          <span className="text-[10px] whitespace-nowrap">
                            {offer.min_months} {offer.min_months === 1 ? "month" : "months"}
                          </span>
                        </div>
                      </td>
                      <td className="py-0.5 px-1 border-r border-gray-100">
                        <div className="text-[9px]">
                          {offer.start_date ? (
                            <>
                              <div className="flex items-center gap-1">
                                <CalendarDays className="h-2 w-2 text-slate-500 flex-shrink-0" />
                                <span className="whitespace-nowrap">
                                  {new Date(offer.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit'})}
                                </span>
                              </div>
                              {offer.end_date && (
                                <p className="text-slate-400 mt-0.5 whitespace-nowrap text-[8px]">
                                  to {new Date(offer.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit'})}
                                </p>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 text-[8px]">No dates</span>
                          )}
                        </div>
                      </td>
                      <td className="py-0.5 px-1 border-r border-gray-100">
                        <button
                          onClick={() => onToggleActive(offer.id, offer.is_active)}
                          className={`h-4 px-1.5 text-[8px] font-medium rounded border whitespace-nowrap ${
                            offer.is_active
                              ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {offer.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-0.5 px-1">
                        <div className="flex items-center gap-0.5">
                          {can('view_offers') && (
                            <button
                              onClick={() => onPreview(offer)}
                              className="h-5 w-5 rounded hover:bg-blue-100 flex items-center justify-center"
                              title="Preview"
                            >
                              <Eye className="h-2.5 w-2.5 text-blue-500" />
                            </button>
                          )}
                          {can('edit_offers') && (
                            <button
                              onClick={() => onEdit(offer)}
                              className="h-5 w-5 rounded hover:bg-amber-50 flex items-center justify-center"
                              title="Edit"
                            >
                              <Edit className="h-2.5 w-2.5 text-amber-600" />
                            </button>
                          )}
                          {can('delete_offers') && (
                            <button
                              onClick={() => onDelete(offer.id)}
                              className="h-5 w-5 rounded hover:bg-red-50 flex items-center justify-center"
                              title="Delete"
                            >
                              <Trash2 className="h-2.5 w-2.5 text-red-500" />
                            </button>
                          )}
                          {can('share_offers') && (
                            <button
                              onClick={() => onShare(offer)}
                              className="h-5 w-5 rounded hover:bg-green-50 flex items-center justify-center"
                              title="Share"
                            >
                              <Share2 className="h-2.5 w-2.5 text-green-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-3 py-1.5 rounded-b-lg">
            <div className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 whitespace-nowrap text-[10px]">
                  {pagination.totalItems} offers
                </span>
                <Select
                  value={pagination.limit === 999999 ? "All" : String(pagination.limit)}
                  onValueChange={(val) => {
                    onItemsPerPageChange?.(val === "All" ? "All" : Number(val));
                  }}
                >
                  <SelectTrigger className="h-5 w-14 text-[10px] border-gray-200 px-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="All">All</SelectItem>
                  </SelectContent>
                </Select>
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

export const OffersTableSkeleton = () => (
  <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
    <div className="relative">
<div className="overflow-auto h-[280px] md:h-[400px]">
        <table className="w-full min-w-[1000px] table-fixed border-collapse">
          <colgroup>
            <col style={{ width: "34px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "70px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "120px" }} />
          </colgroup>
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-200 border-b border-gray-300">
              {Array.from({ length: 9 }).map((_, i) => (
                <th key={i} className="py-0.5 px-1 border-r border-gray-300 bg-gray-200">
                  <Skeleton className="h-2.5 w-12" />
                </th>
              ))}
            </tr>
            <tr className="bg-white border-b border-gray-300">
              {Array.from({ length: 9 }).map((_, i) => (
                <td key={i} className="p-0.5 border-r border-gray-200">
                  <Skeleton className="h-5 w-full" />
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, row) => (
              <tr key={row} className="border-b border-gray-100">
                {Array.from({ length: 9 }).map((_, col) => (
                  <td key={col} className="py-0.5 px-1 border-r border-gray-100">
                    <Skeleton className="h-3 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default OffersTable;