// // app/admin/staff/components/StaffTable.tsx
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { StaffMember } from "@/lib/staffApi";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Mail,
//   Phone,
//   MessageSquare,
//   MapPin,
//   Calendar,
//   Hash,
//   User,
//   Droplets,
//   Building,
//   Edit,
//   Trash2,
//   Eye,
//   Search,
//   FileText,
// } from "lucide-react";
// import { useState } from "react";

// interface StaffTableProps {
//   staff: StaffMember[];
//   loading: boolean;
//   roleIcons: Record<string, React.ReactNode>;
//   getRoleBadgeColor: (role: string) => string;
//   formatSalary: (salary: number) => string;
//   formatDate: (dateString: string) => string;
//   onEdit: (member: StaffMember) => void;
//   onDelete: (id: number) => void;
//   onToggleActive: (id: number, isActive: boolean) => void;
//   onViewDetails: (member: StaffMember) => void; 
// }

// const StaffTable = ({
//   staff,
//   loading,
//   roleIcons,
//   getRoleBadgeColor,
//   formatSalary,
//   formatDate,
//   onEdit,
//   onDelete,
//   onToggleActive,
//   onViewDetails
// }: StaffTableProps) => {
//   const [filters, setFilters] = useState({
//     name: "",
//     role: "",
//     contact: "",
//     salary: "",
//     status: "",
//   });

//   const handleFilterChange = (col: keyof typeof filters, value: string) => {
//     setFilters((prev) => ({ ...prev, [col]: value }));
//   };

//   // Helper function to format salutation
//   const formatSalutation = (salutation: string) => {
//     if (!salutation) return "";

//     const salutationMap: Record<string, string> = {
//       mr: "Mr.",
//       mrs: "Mrs.",
//       miss: "Miss",
//       dr: "Dr.",
//       prof: "Prof.",
//     };

//     return salutationMap[salutation.toLowerCase()] || salutation;
//   };

//  const filteredStaff = staff.filter((member) => {
//   const formattedPhone = member.phone 
//     ? `${member.phone_country_code || "+91"}${member.phone}`
//     : "";
    
//   const nameStr =
//     `${member.salutation ?? ""} ${member.name} ${member.employee_id ?? ""} ${member.email} ${member.current_address ?? ""}`.toLowerCase();
//   const roleStr = member.role.toLowerCase();
//   const contactStr =
//     `${formattedPhone} ${member.whatsapp_number ?? ""} ${member.blood_group ?? ""}`.toLowerCase();
//   const salaryStr =
//     `${formatSalary(member.salary)} ${member.department ?? ""}`.toLowerCase();
//   const statusStr = (member.is_active ? "active" : "inactive").toLowerCase();

//   return (
//     nameStr.includes(filters.name.toLowerCase()) &&
//     roleStr.includes(filters.role.toLowerCase()) &&
//     contactStr.includes(filters.contact.toLowerCase()) &&
//     salaryStr.includes(filters.salary.toLowerCase()) &&
//     statusStr.includes(filters.status.toLowerCase())
//   );
// });

//   if (loading && staff.length === 0) {
//     return <StaffTableSkeleton />;
//   }

//   if (staff.length === 0) {
//     return (
//       <div className="text-center py-10 text-gray-500">
//         <div className="flex flex-col items-center justify-center">
//           <User className="h-14 w-14 text-gray-300 mb-3" />
//           <p className="text-base font-medium">No staff members found</p>
//           <p className="text-xs text-gray-400 mt-1">
//             Add your first staff member using the button above
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="px-0 ">
//       <div className="rounded-md border  ">
//         <div className="max-h-[500px] md:max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 sticky top-60 z-10">
//           <Table className="relative text-xs ">
//             <TableHeader className="">
//               {/* Column Headers */}
//               <TableRow className="bg-white shadow-sm">
//                 <TableHead className="font-semibold whitespace-nowrap bg-white py-2 text-xs w-[200px] max-w-[200px] px-10">
//                   Staff Member
//                 </TableHead>
//                 <TableHead className="font-semibold whitespace-nowrap bg-white py-2 text-xs w-[90px] ">
//                   Role
//                 </TableHead>
//                 <TableHead className="font-semibold whitespace-nowrap bg-white py-2 text-xs ">
//                   Contact
//                 </TableHead>
//                 <TableHead className="font-semibold whitespace-nowrap bg-white py-2 text-xs ">
//                   Salary & Dept.
//                 </TableHead>
//                 <TableHead className="font-semibold whitespace-nowrap bg-white py-2 text-xs w-[80px] ">
//                   Status
//                 </TableHead>
//                 <TableHead className="font-semibold whitespace-nowrap text-right bg-white py-2 text-xs ">
//                   Actions
//                 </TableHead>
//               </TableRow>

//               {/* Search Filter Row */}
//               <TableRow className="bg-gray-50 border-b">
//                 <TableHead className="py-1 px-2 bg-gray-50 w-[200px] max-w-[200px]">
//                   <div className="relative">
//                     <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
//                     <Input
//                       value={filters.name}
//                       onChange={(e) =>
//                         handleFilterChange("name", e.target.value)
//                       }
//                       placeholder="Search name, email…"
//                       className="h-6 pl-5 pr-2 text-[10px] border-gray-200 bg-white rounded focus-visible:ring-1 focus-visible:ring-offset-0"
//                     />
//                   </div>
//                 </TableHead>
//                 <TableHead className="py-1 px-2 bg-gray-50 w-[90px]">
//                   <div className="relative">
//                     <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
//                     <Input
//                       value={filters.role}
//                       onChange={(e) =>
//                         handleFilterChange("role", e.target.value)
//                       }
//                       placeholder="Role…"
//                       className="h-6 pl-5 pr-2 text-[10px] border-gray-200 bg-white rounded focus-visible:ring-1 focus-visible:ring-offset-0"
//                     />
//                   </div>
//                 </TableHead>
//                 <TableHead className="py-1 px-2 bg-gray-50">
//                   <div className="relative">
//                     <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
//                     <Input
//                       value={filters.contact}
//                       onChange={(e) =>
//                         handleFilterChange("contact", e.target.value)
//                       }
//                       placeholder="Phone, WA…"
//                       className="h-6 pl-5 pr-2 text-[10px] border-gray-200 bg-white rounded focus-visible:ring-1 focus-visible:ring-offset-0"
//                     />
//                   </div>
//                 </TableHead>
//                 <TableHead className="py-1 px-2 bg-gray-50">
//                   <div className="relative">
//                     <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
//                     <Input
//                       value={filters.salary}
//                       onChange={(e) =>
//                         handleFilterChange("salary", e.target.value)
//                       }
//                       placeholder="Salary, dept…"
//                       className="h-6 pl-5 pr-2 text-[10px] border-gray-200 bg-white rounded focus-visible:ring-1 focus-visible:ring-offset-0"
//                     />
//                   </div>
//                 </TableHead>
//                 <TableHead className="py-1 px-2 bg-gray-50 w-[80px]">
//                   <div className="relative">
//                     <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
//                     <Input
//                       value={filters.status}
//                       onChange={(e) =>
//                         handleFilterChange("status", e.target.value)
//                       }
//                       placeholder="Status…"
//                       className="h-6 pl-5 pr-2 text-[10px] border-gray-200 bg-white rounded focus-visible:ring-1 focus-visible:ring-offset-0"
//                     />
//                   </div>
//                 </TableHead>
//                 <TableHead className="py-1 px-2 bg-gray-50" />
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {filteredStaff.length === 0 ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={6}
//                     className="text-center py-8 text-gray-400 text-xs"
//                   >
//                     No results match your filters.
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredStaff.map((member) => (
//                   <TableRow key={member.id} className="hover:bg-gray-50/50">
//                     {/* Staff Member */}
//                     <TableCell className="align-top py-1.5 px-10 w-[400px] max-w-[600px]">
//                       <div className="flex items-start gap-2 min-w-[160px] md:min-w-[190px]">
//                         {member.photo_url ? (
//                           <img
//                             src={member.photo_url}
//                             alt={member.name}
//                             className="h-8 w-8 rounded-full object-cover border flex-shrink-0"
//                           />
//                         ) : (
//                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center border flex-shrink-0">
//   <span className="text-white font-semibold text-[10px]">
//     {member.name
//       ?.split(" ")
//       .map(n => n[0])
//       .join("")
//       .substring(0, 2)
//       .toUpperCase()}
//   </span>
// </div>
//                         )}
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-1 flex-wrap">
//                             <span className="font-medium text-[11px] truncate leading-tight">
//                               {/* Format salutation: capitalize first letter */}
//                               {member.salutation
//                                 ? `${member.salutation.charAt(0).toUpperCase() + member.salutation.slice(1)}. `
//                                 : ""}
//                               {member.name}
//                             </span>
//                             {member.employee_id && (
//                               <Badge
//                                 variant="outline"
//                                 className="text-[9px] px-1 py-0 h-4 whitespace-nowrap"
//                               >
//                                 <Hash className="h-2.5 w-2.5 mr-0.5" />
//                                 {member.employee_id}
//                               </Badge>
//                             )}
//                           </div>
//                           <div className="flex items-center gap-1 mt-0.5">
//                             <Mail className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
//                             <span className="text-[10px] text-gray-600 truncate">
//                               {member.email}
//                             </span>
//                           </div>
//                           {member.current_address && (
//                             <div className="flex items-start gap-1 mt-0.5">
//                               <MapPin className="h-2.5 w-2.5 text-gray-400 mt-px flex-shrink-0" />
//                               <span className="text-[10px] text-gray-500 truncate">
//                                 {member.current_address}
//                               </span>
//                             </div>
//                           )}
//                           <div className="flex items-center gap-1 mt-0.5">
//   <Calendar className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
//   <span className="text-[10px] text-gray-500 whitespace-nowrap">
//     Joined: {member.joining_date ? new Date(member.joining_date).toLocaleDateString("en-GB") : "—"}
//   </span>
// </div>
//                         </div>
//                       </div>
//                     </TableCell>

//                     {/* // Update the Role cell to show role name instead of ID */}
//                     <TableCell className="py-1.5 px-2 w-[200px] max-w-[200px]">
//                       <div className="flex">
//                         <Badge
//                           variant="outline"
//                           className={`${getRoleBadgeColor(member.role_name || member.role?.toString() || "")} flex items-center gap-0.5 whitespace-nowrap text-[9px] px-6 py-0 h-5`}
//                         >
//                           {roleIcons[
//                             member.role_name?.toLowerCase() ||
//                               member.role?.toString().toLowerCase()
//                           ] || <User className="h-2.5 w-2.5" />}
//                           <span className="capitalize">
//                             {member.role_name || member.role || "No Role"}
//                           </span>
//                         </Badge>
//                       </div>
//                     </TableCell>

//                     {/* Contact */}
//                     {/* Contact */}
// <TableCell className="py-1.5 px-2 w-[100px] max-w-[200px]">
//   <div className="flex flex-col gap-0.5 min-w-[100px]">
//     <div className="flex items-center gap-1">
//       <Phone className="h-2.5 w-2.5 text-gray-500 flex-shrink-0" />
//       <span className="text-[10px] truncate">
//         {member.phone ? (
//           <>
//             {member.phone_country_code || "+91"}{member.phone}
//           </>
//         ) : "No phone"}
//       </span>
//     </div>
//    {member.whatsapp_number && (
//   <div className="flex items-center gap-1">
//     <MessageSquare className="h-2.5 w-2.5 text-green-500 flex-shrink-0" />
//     <span className="text-[10px] truncate">
//       {member.whatsapp_number === member.phone && member.phone_country_code 
//         ? `${member.phone_country_code}${member.whatsapp_number}`
//         : member.whatsapp_number}
//     </span>
//   </div>
// )}
//     {member.blood_group &&
//       member.blood_group !== "not_specified" && (
//         <div className="flex items-center gap-1">
//           <Droplets className="h-2.5 w-2.5 text-red-500 flex-shrink-0" />
//           <span className="text-[10px] whitespace-nowrap">
//             Blood: {member.blood_group.toUpperCase()}
//           </span>
//         </div>
//       )}
//   </div>
// </TableCell>

//                     {/* Salary & Department */}
//                     <TableCell className="align-center py-1.5 px-2 w-[200px] max-w-[200px]">
//                       <div className="flex flex-col gap-0.5 min-w-[110px]">
//                         <div className="font-medium text-[11px] whitespace-nowrap">
//                           {formatSalary(member.salary)}
//                         </div>
//                         {(member.department_name || member.department) && (
//                           <div className="flex items-center gap-1 text-[10px] text-gray-600">
//                             <Building className="h-2.5 w-2.5 flex-shrink-0" />
//                             <span className="truncate">
//                               {member.department_name || member.department}
//                             </span>
//                           </div>
//                         )}
//                         <div className="flex flex-wrap gap-0.5 mt-0.5">
//                           {member.aadhar_document_url && (
//                             <Badge
//                               variant="outline"
//                               className="text-[9px] px-1 py-0 h-4 whitespace-nowrap"
//                             >
//                               Aadhar ✓
//                             </Badge>
//                           )}
//                           {member.pan_document_url && (
//                             <Badge
//                               variant="outline"
//                               className="text-[9px] px-1 py-0 h-4 whitespace-nowrap"
//                             >
//                               PAN ✓
//                             </Badge>
//                           )}
//                           {member.photo_url && (
//                             <Badge
//                               variant="outline"
//                               className="text-[9px] px-1 py-0 h-4 whitespace-nowrap"
//                             >
//                               Photo ✓
//                             </Badge>
//                           )}
//                         </div>
//                       </div>
//                     </TableCell>

//                     {/* Status */}
//                     <TableCell className="py-1.5 px-2 w-[80px] align-center">
//                       <div className="flex flex-col items-center gap-0.5">
//                         <Badge
//                           className={
//                             member.is_active
//                               ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200 whitespace-nowrap text-[9px] px-1.5 py-0 h-4"
//                               : "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200 whitespace-nowrap text-[9px] px-1.5 py-0 h-4"
//                           }
//                         >
//                           {member.is_active ? "Active" : "Inactive"}
//                         </Badge>

//                         {member.assigned_requests > 0 && (
//                           <div className="text-[9px] text-blue-600 whitespace-nowrap text-center">
//                             {member.assigned_requests} req
//                             {member.assigned_requests !== 1 ? "s" : ""}
//                           </div>
//                         )}
//                       </div>
//                     </TableCell>

//                     {/* Actions */}
// <TableCell className="align-center py-1.5 px-2">
//   <div className="flex justify-end items-center gap-0.5 whitespace-nowrap">
//     <Button
//       size="sm"
//       variant="ghost"
//       onClick={() => onViewDetails(member)} // Add this handler
//       className="h-6 w-6 p-0 flex-shrink-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
//       title="View Details"
//     >
//       <Eye className="h-3 w-3" />
//     </Button>
//     {/* {member.aadhar_document_url && (
//       <Button
//         size="sm"
//         variant="ghost"
//         asChild
//         className="h-6 w-6 p-0 flex-shrink-0"
//         title="View Aadhar"
//       >
//         <a
//           href={member.aadhar_document_url}
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <FileText className="h-3 w-3" />
//         </a>
//       </Button>
//     )} */}
//     <Button
//       size="sm"
//       variant="outline"
//       onClick={() => onEdit(member)}
//       className="h-6 w-6 p-0 flex-shrink-0"
//       title="Edit"
//     >
//       <Edit className="h-3 w-3" />
//     </Button>
//     <Button
//       size="sm"
//       variant={member.is_active ? "outline" : "default"}
//       onClick={() => onToggleActive(member.id, member.is_active)}
//       className="h-6 px-1.5 text-[9px] whitespace-nowrap flex-shrink-0"
//     >
//       {member.is_active ? "Deactivate" : "Activate"}
//     </Button>
//     <Button
//       size="sm"
//       variant="destructive"
//       onClick={() => onDelete(member.id)}
//       className="h-6 w-6 p-0 flex-shrink-0"
//       title="Delete"
//     >
//       <Trash2 className="h-3 w-3" />
//     </Button>
//   </div>
// </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export const StaffTableSkeleton = () => (
//   <div className="rounded-md border overflow-hidden">
//     <div className="max-h-[600px] overflow-auto">
//       <Table>
//         <TableHeader className="sticky top-0 bg-white z-10">
//           <TableRow>
//             <TableHead className="font-semibold bg-white text-xs">
//               Staff Member
//             </TableHead>
//             <TableHead className="font-semibold bg-white text-xs w-[90px]">
//               Role
//             </TableHead>
//             <TableHead className="font-semibold bg-white text-xs">
//               Contact
//             </TableHead>
//             <TableHead className="font-semibold bg-white text-xs">
//               Salary & Dept.
//             </TableHead>
//             <TableHead className="font-semibold bg-white text-xs w-[80px]">
//               Status
//             </TableHead>
//             <TableHead className="font-semibold text-right bg-white text-xs">
//               Actions
//             </TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {Array.from({ length: 5 }).map((_, index) => (
//             <TableRow key={index}>
//               <TableCell className="py-1.5">
//                 <div className="flex items-start gap-2">
//                   <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
//                   <div className="space-y-1 flex-1">
//                     <Skeleton className="h-3 w-28" />
//                     <Skeleton className="h-2.5 w-20" />
//                     <Skeleton className="h-2.5 w-36" />
//                   </div>
//                 </div>
//               </TableCell>
//               <TableCell className="py-1.5">
//                 <Skeleton className="h-5 w-16" />
//               </TableCell>
//               <TableCell className="py-1.5">
//                 <div className="space-y-1">
//                   <Skeleton className="h-2.5 w-20" />
//                   <Skeleton className="h-2.5 w-16" />
//                 </div>
//               </TableCell>
//               <TableCell className="py-1.5">
//                 <div className="space-y-1">
//                   <Skeleton className="h-3 w-14" />
//                   <Skeleton className="h-2.5 w-20" />
//                 </div>
//               </TableCell>
//               <TableCell className="py-1.5">
//                 <Skeleton className="h-4 w-14" />
//               </TableCell>
//               <TableCell className="py-1.5">
//                 <div className="flex justify-end gap-1">
//                   <Skeleton className="h-6 w-6" />
//                   <Skeleton className="h-6 w-16" />
//                   <Skeleton className="h-6 w-6" />
//                 </div>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   </div>
// );

// export default StaffTable;



// app/admin/staff/components/StaffTable.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StaffMember } from "@/lib/staffApi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail, Phone, MessageSquare, MapPin, Calendar, Hash, User,
  Building, Edit, Trash2, Eye, Search, FileText, ArrowUpDown, XCircle, AlertCircle, Loader2, X
} from "lucide-react";
import { useState } from "react";

interface StaffTableProps {
  staff: StaffMember[];
  loading: boolean;
  roleIcons: Record<string, React.ReactNode>;
  getRoleBadgeColor: (role: string) => string;
  formatSalary: (salary: number) => string;
  formatDate: (dateString: string) => string;
  onEdit: (member: StaffMember) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
  onViewDetails: (member: StaffMember) => void;
    onBulkDelete: (ids: number[]) => void;  // new

}

const StaffTable = ({
  staff, loading, roleIcons, getRoleBadgeColor, formatSalary, formatDate,
  onEdit, onDelete, onToggleActive, onViewDetails, onBulkDelete
}: StaffTableProps) => {
  // Added emailLocation and documents filters for complete column coverage
  const [filters, setFilters] = useState({ 
    name: "", 
    role: "", 
    contact: "", 
    salary: "", 
    status: "", 
    joined: "",
    emailLocation: "",    // NEW: filter for Email/Location column
    documents: ""         // NEW: filter for Documents column
  });
  const [sortField, setSortField] = useState<keyof StaffMember>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const handleFilterChange = (col: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [col]: value }));
    setCurrentPage(1);
  };

  const handleSort = (field: keyof StaffMember) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  // Helper: get document status string for filtering
  const getDocumentStatusString = (member: StaffMember) => {
    const docs = [];
    if (member.aadhar_document_url) docs.push("aadhar");
    if (member.pan_document_url) docs.push("pan");
    if (member.photo_url) docs.push("photo");
    return docs.join(" ");
  };

  const filteredStaff = staff.filter((member) => {
    const formattedPhone = member.phone ? `${member.phone_country_code || "+91"}${member.phone}` : "";
    const nameStr = `${member.salutation ?? ""} ${member.name} ${member.employee_id ?? ""} ${member.email} ${member.current_address ?? ""}`.toLowerCase();
    const roleStr = (member.role_name || member.role?.toString() || "").toLowerCase();
    const contactStr = `${formattedPhone} ${member.whatsapp_number ?? ""}`.toLowerCase();
    const salaryStr = `${formatSalary(member.salary)} ${(member.department_name || member.department) ?? ""}`.toLowerCase();
    const statusStr = (member.is_active ? "active" : "inactive").toLowerCase();
    
    // NEW: Email/Location filter (searches email and address)
    const emailLocationStr = `${member.email} ${member.current_address ?? ""}`.toLowerCase();
    const matchesEmailLocation = emailLocationStr.includes(filters.emailLocation.toLowerCase());
    
    // NEW: Documents filter (searches for "aadhar", "pan", "photo" keywords)
    const documentsStr = getDocumentStatusString(member).toLowerCase();
    const matchesDocuments = filters.documents === "" || documentsStr.includes(filters.documents.toLowerCase());
    
    // Joined date filter (exact match on YYYY-MM-DD)
    let matchesJoined = true;
    if (filters.joined && member.joining_date) {
      const memberDate = new Date(member.joining_date).toISOString().split('T')[0];
      matchesJoined = memberDate === filters.joined;
    } else if (filters.joined && !member.joining_date) {
      matchesJoined = false;
    }
    
    return (
      nameStr.includes(filters.name.toLowerCase()) &&
      roleStr.includes(filters.role.toLowerCase()) &&
      contactStr.includes(filters.contact.toLowerCase()) &&
      salaryStr.includes(filters.salary.toLowerCase()) &&
      statusStr.includes(filters.status.toLowerCase()) &&
      matchesEmailLocation &&
      matchesDocuments &&
      matchesJoined
    );
  }).sort((a, b) => {
    const av = a[sortField];
    const bv = b[sortField];
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const currentPageItems = itemsPerPage === 9999
    ? filteredStaff
    : filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = () => {
    if (selectedIds.size === currentPageItems.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(currentPageItems.map(m => m.id)));
  };

  const handleSelectOne = (id: number) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  
  if (loading && staff.length === 0) return <StaffTableSkeleton />;

  if (staff.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <div className="flex flex-col items-center justify-center">
          <User className="h-14 w-14 text-gray-300 mb-3" />
          <p className="text-base font-medium">No staff members found</p>
          <p className="text-xs text-gray-400 mt-1">Add your first staff member using the button above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-0">

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
<div className="sticky left-0 z-10 mb-2 bg-white rounded-lg border border-red-200 shadow px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-700 text-xs h-7 px-3 flex items-center">
              {selectedIds.size} selected
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="h-7">
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          </div>
<Button
  variant="destructive"
  size="sm"
  onClick={async () => {
    await onBulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set()); // Clear selection after deletion
  }}
  className="h-7 text-xs"
>
  <XCircle className="h-3 w-3 mr-1" /> Delete Selected
</Button>
        </div>
      )}

      <div className="rounded-md border">
        <div className="relative">
          {/* INCREASED MAX-HEIGHT for desktop view */}
          <div className={`overflow-auto rounded-lg transition-all duration-300 ${
            selectedIds.size > 0 ? 'max-h-[480px] md:max-h-[500px]' : 'max-h-[520px] md:max-h-[525px]'
          }`}>
           <table className="w-full min-w-[1400px] table-fixed border-collapse">

  <thead className="sticky top-0 z-10">
    <tr className="bg-white border-b-2 border-blue-200">

      {/* Checkbox - 40px sticky */}
<th className="md:sticky left-0 z-30 w-[40px] bg-white border-r border-gray-200 text-left">
        <div className="py-2 flex justify-center">
          <Checkbox
            checked={selectedIds.size === currentPageItems.length && currentPageItems.length > 0}
            onCheckedChange={handleSelectAll}
          />
        </div>
      </th>

      {/* Actions - WIDTH INCREASED to 160px, sticky left adjusted */}
<th className="md:sticky left-[40px] z-30 w-[160px] bg-white border-r border-gray-200 text-left">
        <div className="py-2 px-2">
          <span className="font-semibold text-gray-700 text-xs">Actions</span>
        </div>
      </th> 

      {/* Staff / ID - left position adjusted to 170px (40 + 130), width 200px */}
<th className="md:sticky left-[200px] z-30 w-[200px] bg-white border-r border-gray-200 text-left">
        <div className="space-y-1.5 py-2 px-2">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('name')}>
            <span className="font-semibold text-gray-700 text-xs">Staff / ID</span>
            <ArrowUpDown className="h-3 w-3 text-gray-400" />
          </div>
          <Input placeholder="Search name, email…" className="h-6 text-[11px] border-gray-200 px-1.5"
            value={filters.name} onChange={(e) => handleFilterChange('name', e.target.value)} />
        </div>
      </th>

      {/* Email & Location - with search bar (NEW) */}
      <th className="md:sticky left-[400px] z-30 w-[180px] bg-white border-r border-gray-200 text-left">
        <div className="space-y-1.5 py-2 px-2">
          <span className="font-semibold text-gray-700 text-xs">Email / Location</span>
          <Input placeholder="Search email or address…" className="h-6 text-[11px] border-gray-200 px-1.5"
            value={filters.emailLocation} onChange={(e) => handleFilterChange('emailLocation', e.target.value)} />
        </div>
      </th>
 {/* Contact */}
      <th className="w-[150px] bg-white border-r border-gray-200 text-left">
        <div className="space-y-1.5 py-2 px-2">
          <span className="font-semibold text-gray-700 text-xs">Contact</span>
          <Input placeholder="Search phone…" className="h-6 text-[11px] border-gray-200 px-1.5"
            value={filters.contact} onChange={(e) => handleFilterChange('contact', e.target.value)} />
        </div>
      </th>
      {/* Role */}
      <th className="w-[140px] bg-white border-r border-gray-200 text-left">
        <div className="space-y-1.5 py-2 px-2">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('role')}>
            <span className="font-semibold text-gray-700 text-xs">Role</span>
            <ArrowUpDown className="h-3 w-3 text-gray-400" />
          </div>
          <Input placeholder="Search role…" className="h-6 text-[11px] border-gray-200 px-1.5"
            value={filters.role} onChange={(e) => handleFilterChange('role', e.target.value)} />
        </div>
      </th>

     

      {/* Salary & Dept */}
      <th className="w-[160px] bg-white border-r border-gray-200 text-left">
        <div className="space-y-1.5 py-2 px-2">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('salary')}>
            <span className="font-semibold text-gray-700 text-xs">Salary / Dept</span>
            <ArrowUpDown className="h-3 w-3 text-gray-400" />
          </div>
          <Input placeholder="Search salary…" className="h-6 text-[11px] border-gray-200 px-1.5"
            value={filters.salary} onChange={(e) => handleFilterChange('salary', e.target.value)} />
        </div>
      </th>

      {/* Documents - with search bar (NEW) */}
      <th className="w-[160px] bg-white border-r border-gray-200 text-left">
        <div className="space-y-1.5 py-2 px-2">
          <span className="font-semibold text-gray-700 text-xs">Documents</span>
          <Input placeholder="aadhar/pan/photo…" className="h-6 text-[11px] border-gray-200 px-1.5"
            value={filters.documents} onChange={(e) => handleFilterChange('documents', e.target.value)} />
        </div>
      </th>

      {/* Joined */}
      <th className="w-[120px] bg-white border-r border-gray-200 text-left">
        <div className="space-y-1.5 py-2 px-2">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('joining_date')}>
            <span className="font-semibold text-gray-700 text-xs">Joined</span>
            <ArrowUpDown className="h-3 w-3 text-gray-400" />
          </div>
          <input
            type="date"
            style={{ fontSize: '10px', height: '24px', width: '100%', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '0 4px', colorScheme: 'light', cursor: 'pointer' }}
            value={filters.joined}
            onChange={(e) => handleFilterChange('joined', e.target.value)}
          />
        </div>
      </th>

      {/* Status */}
      <th className="w-[90px] bg-white text-left">
        <div className="space-y-1.5 py-2 px-2">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('is_active')}>
            <span className="font-semibold text-gray-700 text-xs">Status</span>
            <ArrowUpDown className="h-3 w-3 text-gray-400" />
          </div>
          <Input placeholder="active/inactive…" className="h-6 text-[11px] border-gray-200 px-1.5"
            value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} />
        </div>
      </th>

    </tr>
  </thead>

  <tbody>
    {currentPageItems.length === 0 ? (
      <tr>
        <td colSpan={10} className="text-center py-8 text-gray-400 text-xs">
          No results match your filters.
        </td>
      </tr>
    ) : (
      currentPageItems.map((member, index) => (
        <tr
          key={member.id}
          className={`hover:bg-blue-100 transition-colors duration-150 border-b border-gray-100 ${
            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
          }`}
        >
          {/* Checkbox */}
<td className="md:sticky left-0 z-20 w-[40px] bg-inherit border-r border-gray-100 py-2 px-2">
            <div className="flex justify-center">
              <Checkbox
                checked={selectedIds.has(member.id)}
                onCheckedChange={() => handleSelectOne(member.id)}
              />
            </div>
          </td>

          {/* Actions - width increased to 130px */}
<td className="md:sticky left-[40px] z-20 bg-inherit w-[160px] border-r border-gray-100 py-2 px-1">
            <div className="flex items-center gap-0.5 flex-wrap">
              <Button size="sm" variant="ghost" onClick={() => onViewDetails(member)}
                className="h-6 w-6 p-0 hover:bg-blue-100 flex-shrink-0" title="View Details">
                <Eye className="h-3 w-3 text-blue-500" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => onEdit(member)}
                className="h-6 w-6 p-0 flex-shrink-0" title="Edit">
                <Edit className="h-3 w-3" />
              </Button>
              <Button size="sm" variant={member.is_active ? "outline" : "default"}
                onClick={() => onToggleActive(member.id, member.is_active)}
                className="h-5 px-1 text-[9px] whitespace-nowrap flex-shrink-0">
                {member.is_active ? "Deactivate" : "Activate"}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(member.id)}
                className="h-6 w-6 p-0 flex-shrink-0" title="Delete">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </td>

          {/* Staff / ID - left position adjusted to 170px */}
<td className="md:sticky left-[200px] z-20 bg-inherit w-[200px] border-r border-gray-100 py-2 px-2">
  <div 
    className="flex items-center gap-1.5 cursor-pointer" 
    onClick={() => onViewDetails(member)}
  >
    {member.photo_url ? (
      <img src={member.photo_url} alt={member.name}
        className="h-7 w-7 rounded-full object-cover border flex-shrink-0" />
    ) : (
      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-semibold text-[9px]">
          {member.name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
        </span>
      </div>
    )}
    <div className="min-w-0">
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs font-medium truncate leading-tight hover:underline">
          {member.salutation ? `${member.salutation.charAt(0).toUpperCase() + member.salutation.slice(1)}. ` : ""}
          {member.name}
        </span>
        {member.employee_id && (
          <span className="text-[9px] text-gray-400 whitespace-nowrap">#{member.employee_id}</span>
        )}
      </div>
    </div>
  </div>
</td>


          {/* Email & Location */}
          <td className={`hover:bg-blue-100 w-[180px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-r border-gray-100 py-2 px-2`}>
            <div className="flex items-center gap-0.5 mb-0.5">
              <Mail className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
              <span className="text-[10px] text-gray-600 truncate">{member.email}</span>
            </div>
            {member.current_address && (
              <div className="flex items-start gap-0.5">
                <MapPin className="h-2.5 w-2.5 text-gray-400 flex-shrink-0 mt-px" />
                <span className="text-[10px] text-gray-500 truncate">{member.current_address}</span>
              </div>
            )}
          </td>
 {/* Contact */}
          <td className={`hover:bg-blue-100 w-[150px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-r border-gray-100 py-2 px-2`}>
            <div className="flex items-center gap-0.5 mb-0.5">
              <Phone className="h-2.5 w-2.5 text-gray-500 flex-shrink-0" />
              <span className="text-[10px] truncate">
                {member.phone ? `${member.phone_country_code || "+91"}${member.phone}` : "—"}
              </span>
            </div>
            {member.whatsapp_number && (
              <div className="flex items-center gap-0.5">
                <MessageSquare className="h-2.5 w-2.5 text-green-500 flex-shrink-0" />
                <span className="text-[10px] truncate">{member.whatsapp_number}</span>
              </div>
            )}
          </td>
          {/* Role */}
          <td className={`hover:bg-blue-100 w-[140px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-r border-gray-100 py-2 px-2`}>
            <Badge variant="outline"
              className={`${getRoleBadgeColor(member.role_name || member.role?.toString() || "")} flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-5 w-fit`}>
              {roleIcons[member.role_name?.toLowerCase() || member.role?.toString().toLowerCase()] || <User className="h-2.5 w-2.5" />}
              <span className="capitalize truncate">{member.role_name || member.role || "No Role"}</span>
            </Badge>
          </td>

         

          {/* Salary & Dept */}
          <td className={`hover:bg-blue-100 w-[160px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-r border-gray-100 py-2 px-2`}>
            <div className="text-xs font-medium whitespace-nowrap">{formatSalary(member.salary)}</div>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              {(member.department_name || member.department) && (
                <div className="flex items-center gap-0.5">
                  <Building className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                  <span className="text-[10px] text-gray-600 truncate">
                    {member.department_name || member.department}
                  </span>
                </div>
              )}
              {member.assigned_requests > 0 && (
                <span className="text-[9px] text-blue-600 whitespace-nowrap">{member.assigned_requests} reqs</span>
              )}
            </div>
          </td>

          {/* Documents */}
          <td className={`hover:bg-blue-100 w-[160px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-r border-gray-100 py-2 px-2`}>
            <div className="flex items-center gap-0.5 whitespace-nowrap">
              {member.aadhar_document_url && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 whitespace-nowrap">Aadhar ✓</Badge>
              )}
              {member.pan_document_url && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 whitespace-nowrap">PAN ✓</Badge>
              )}
              {member.photo_url && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 whitespace-nowrap">Photo ✓</Badge>
              )}
              {!member.aadhar_document_url && !member.pan_document_url && !member.photo_url && (
                <span className="text-[10px] text-gray-400">—</span>
              )}
            </div>
          </td>

          {/* Joined Date */}
          <td className={`hover:bg-blue-100 w-[120px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-r border-gray-100 py-2 px-2`}>
            <div className="flex items-center gap-0.5">
              <Calendar className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
              <span className="text-[10px] text-gray-600 whitespace-nowrap">
                {member.joining_date ? new Date(member.joining_date).toLocaleDateString("en-GB") : "—"}
              </span>
            </div>
          </td>

          {/* Status */}
          <td className={`hover:bg-blue-100 w-[90px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} py-2 px-2`}>
            <Badge className={
              member.is_active
                ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-[9px] px-1.5 py-0 h-4"
                : "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200 text-[9px] px-1.5 py-0 h-4"
            }>
              {member.is_active ? "Active" : "Inactive"}
            </Badge>
          </td>

        </tr>
      ))
    )}
  </tbody>
</table>
          </div>

          {/* Pagination */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-3 py-2 rounded-b-lg">
  <div className="flex flex-row items-center justify-between gap-2 sm:flex-row sm:items-center sm:justify-between">
    
    {/* Left Side */}
    <div className="flex items-center gap-2 text-xs shrink-0">
      <span className="text-gray-500 whitespace-nowrap">
        {filteredStaff.length} staff
      </span>

      <div className="flex items-center gap-1">
        <Select
          value={String(itemsPerPage)}
          onValueChange={(val) => {
            setItemsPerPage(Number(val));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-7 w-[58px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="9999">All</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Right Side */}
    <div className="flex items-center gap-1 shrink-0">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="h-7 px-2 text-[11px]"
      >
        Prev
      </Button>

      <span className="text-[11px] text-gray-600 px-1 whitespace-nowrap">
        {itemsPerPage === 9999
          ? "1/1"
          : `${currentPage}/${Math.ceil(filteredStaff.length / itemsPerPage) || 1}`}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((p) => p + 1)}
        disabled={
          itemsPerPage === 9999 ||
          currentPage >= Math.ceil(filteredStaff.length / itemsPerPage)
        }
        className="h-7 px-2 text-[11px]"
      >
        Next
      </Button>
    </div>
  </div>
</div>
        </div>
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      {/* <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Bulk Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.size} {selectedIds.size === 1 ? 'staff member' : 'staff members'}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50 p-3 rounded-md my-2 max-h-40 overflow-y-auto">
            <p className="text-xs font-medium text-red-800 mb-2">Selected members:</p>
            <ul className="text-xs text-red-700 space-y-1">
              {Array.from(selectedIds).slice(0, 5).map(id => {
                const member = staff.find(m => m.id === id);
                return (
                  <li key={id} className="flex items-center gap-2">
                    <span className="font-mono">#{id}</span>
                    <span className="truncate">- {member?.name || 'Unknown'}</span>
                  </li>
                );
              })}
              {selectedIds.size > 5 && (
                <li className="text-red-600 font-medium">...and {selectedIds.size - 5} more</li>
              )}
            </ul>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)} disabled={bulkDeleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleteLoading}
              className="bg-red-600 hover:bg-red-700">
              {bulkDeleteLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</>
              ) : (
                <><XCircle className="h-4 w-4 mr-2" />Delete {selectedIds.size} {selectedIds.size === 1 ? 'Member' : 'Members'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}


      
    </div>
  );
};

export const StaffTableSkeleton = () => (
  <div className="rounded-md border overflow-hidden">
    <div className="max-h-[600px] overflow-auto">
      <table className="w-full min-w-[1400px] table-fixed border-collapse">
        <thead className="sticky top-0 z-10 bg-white border-b-2 border-blue-200">
          <tr>
            <th className="w-[40px] py-3 px-2"></th>
            <th className="w-[130px] py-3 px-2 text-xs font-semibold text-gray-700">Actions</th>
            <th className="w-[200px] py-3 px-2 text-xs font-semibold text-gray-700">Staff / ID</th>
            <th className="w-[180px] py-3 px-2 text-xs font-semibold text-gray-700">Email / Location</th>
            <th className="w-[140px] py-3 px-2 text-xs font-semibold text-gray-700">Role</th>
            <th className="w-[150px] py-3 px-2 text-xs font-semibold text-gray-700">Contact</th>
            <th className="w-[160px] py-3 px-2 text-xs font-semibold text-gray-700">Salary / Dept</th>
            <th className="w-[130px] py-3 px-2 text-xs font-semibold text-gray-700">Documents</th>
            <th className="w-[120px] py-3 px-2 text-xs font-semibold text-gray-700">Joined</th>
            <th className="w-[90px] py-3 px-2 text-xs font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-2 px-2"><Skeleton className="h-4 w-4 mx-auto" /></td>
              <td className="py-2 px-1"><div className="flex gap-0.5"><Skeleton className="h-6 w-6" /><Skeleton className="h-6 w-6" /></div></td>
              <td className="py-2 px-2">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
                  <div className="space-y-1"><Skeleton className="h-3 w-24" /><Skeleton className="h-2.5 w-16" /></div>
                </div>
              </td>
              <td className="py-2 px-2"><div className="space-y-1"><Skeleton className="h-2.5 w-28" /><Skeleton className="h-2.5 w-20" /></div></td>
              <td className="py-2 px-2"><Skeleton className="h-5 w-20" /></td>
              <td className="py-2 px-2"><div className="space-y-1"><Skeleton className="h-2.5 w-20" /><Skeleton className="h-2.5 w-16" /></div></td>
              <td className="py-2 px-2"><div className="space-y-1"><Skeleton className="h-3 w-14" /><Skeleton className="h-2.5 w-20" /></div></td>
              <td className="py-2 px-2"><Skeleton className="h-4 w-14" /></td>
              <td className="py-2 px-2"><Skeleton className="h-4 w-16" /></td>
              <td className="py-2 px-2"><Skeleton className="h-4 w-14" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default StaffTable;