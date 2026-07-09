


// // app/admin/staff/components/StaffTable.tsx
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { StaffMember } from "@/lib/staffApi";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Mail, Phone, MessageSquare, MapPin, Calendar, Hash, User,
//   Building, Edit, Trash2, Eye, Search, FileText, ArrowUpDown, XCircle, AlertCircle, Loader2, X
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
//     onBulkDelete: (ids: number[]) => void;  // new

// }

// const StaffTable = ({
//   staff, loading, roleIcons, getRoleBadgeColor, formatSalary, formatDate,
//   onEdit, onDelete, onToggleActive, onViewDetails, onBulkDelete
// }: StaffTableProps) => {
//   // Added emailLocation and documents filters for complete column coverage
//   const [filters, setFilters] = useState({ 
//     name: "", 
//     role: "", 
//     contact: "", 
//     salary: "", 
//     status: "", 
//     joined: "",
//     emailLocation: "",    // NEW: filter for Email/Location column
//     documents: ""         // NEW: filter for Documents column
//   });
//   const [sortField, setSortField] = useState<keyof StaffMember>('name');
//   const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
//   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState<number>(10);

//   const handleFilterChange = (col: keyof typeof filters, value: string) => {
//     setFilters((prev) => ({ ...prev, [col]: value }));
//     setCurrentPage(1);
//   };

//   const handleSort = (field: keyof StaffMember) => {
//     if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
//     else { setSortField(field); setSortDir('asc'); }
//   };

//   // Helper: get document status string for filtering
//   const getDocumentStatusString = (member: StaffMember) => {
//     const docs = [];
//     if (member.aadhar_document_url) docs.push("aadhar");
//     if (member.pan_document_url) docs.push("pan");
//     if (member.photo_url) docs.push("photo");
//     return docs.join(" ");
//   };

//   const filteredStaff = staff.filter((member) => {
//     const formattedPhone = member.phone ? `${member.phone_country_code || "+91"}${member.phone}` : "";
//     const nameStr = `${member.salutation ?? ""} ${member.name} ${member.employee_id ?? ""} ${member.email} ${member.current_address ?? ""}`.toLowerCase();
//     const roleStr = (member.role_name || member.role?.toString() || "").toLowerCase();
//     const contactStr = `${formattedPhone} ${member.whatsapp_number ?? ""}`.toLowerCase();
//     const salaryStr = `${formatSalary(member.salary)} ${(member.department_name || member.department) ?? ""}`.toLowerCase();
//     const statusStr = (member.is_active ? "active" : "inactive").toLowerCase();
    
//     // NEW: Email/Location filter (searches email and address)
//     const emailLocationStr = `${member.email} ${member.current_address ?? ""}`.toLowerCase();
//     const matchesEmailLocation = emailLocationStr.includes(filters.emailLocation.toLowerCase());
    
//     // NEW: Documents filter (searches for "aadhar", "pan", "photo" keywords)
//     const documentsStr = getDocumentStatusString(member).toLowerCase();
//     const matchesDocuments = filters.documents === "" || documentsStr.includes(filters.documents.toLowerCase());
    
//     // Joined date filter (exact match on YYYY-MM-DD)
//     let matchesJoined = true;
//     if (filters.joined && member.joining_date) {
//       const memberDate = new Date(member.joining_date).toISOString().split('T')[0];
//       matchesJoined = memberDate === filters.joined;
//     } else if (filters.joined && !member.joining_date) {
//       matchesJoined = false;
//     }
    
//     return (
//       nameStr.includes(filters.name.toLowerCase()) &&
//       roleStr.includes(filters.role.toLowerCase()) &&
//       contactStr.includes(filters.contact.toLowerCase()) &&
//       salaryStr.includes(filters.salary.toLowerCase()) &&
//       statusStr.includes(filters.status.toLowerCase()) &&
//       matchesEmailLocation &&
//       matchesDocuments &&
//       matchesJoined
//     );
//   }).sort((a, b) => {
//     const av = a[sortField];
//     const bv = b[sortField];
//     if (av == null) return 1;
//     if (bv == null) return -1;
//     if (av < bv) return sortDir === 'asc' ? -1 : 1;
//     if (av > bv) return sortDir === 'asc' ? 1 : -1;
//     return 0;
//   });

//   const currentPageItems = itemsPerPage === 9999
//     ? filteredStaff
//     : filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   const handleSelectAll = () => {
//     if (selectedIds.size === currentPageItems.length) setSelectedIds(new Set());
//     else setSelectedIds(new Set(currentPageItems.map(m => m.id)));
//   };

//   const handleSelectOne = (id: number) => {
//     const next = new Set(selectedIds);
//     next.has(id) ? next.delete(id) : next.add(id);
//     setSelectedIds(next);
//   };

  
//   if (loading && staff.length === 0) return <StaffTableSkeleton />;

//   if (staff.length === 0) {
//     return (
//       <div className="text-center py-10 text-gray-500">
//         <div className="flex flex-col items-center justify-center">
//           <User className="h-14 w-14 text-gray-300 mb-3" />
//           <p className="text-base font-medium">No staff members found</p>
//           <p className="text-xs text-gray-400 mt-1">Add your first staff member using the button above</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="px-0">

//       {/* Bulk Action Bar */}
//       {selectedIds.size > 0 && (
// <div className="sticky left-0 z-10 mb-2 bg-white rounded-lg border border-red-200 shadow px-3 py-2 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Badge className="bg-red-100 text-red-700 text-xs h-7 px-3 flex items-center">
//               {selectedIds.size} selected
//             </Badge>
//             <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="h-7">
//               <X className="h-3 w-3 mr-1" /> Clear
//             </Button>
//           </div>
// <Button
//   variant="destructive"
//   size="sm"
//   onClick={async () => {
//     await onBulkDelete(Array.from(selectedIds));
//     setSelectedIds(new Set()); // Clear selection after deletion
//   }}
//   className="h-7 text-xs"
// >
//   <XCircle className="h-3 w-3 mr-1" /> Delete Selected
// </Button>
//         </div>
//       )}

//       <div className="rounded-md border">
//         <div className="relative">
//           {/* INCREASED MAX-HEIGHT for desktop view */}
//           <div className={`overflow-auto rounded-lg transition-all duration-300 ${
//             selectedIds.size > 0 ? 'max-h-[480px] md:max-h-[500px]' : 'max-h-[520px] md:max-h-[525px]'
//           }`}>
//            <table className="w-full min-w-[1400px] table-fixed border-collapse">

//   <thead className="sticky top-0 z-10">
//     <tr className="bg-white border-b-2 border-blue-200">

//       {/* Checkbox - 40px sticky */}
// <th className="md:sticky left-0 z-30 w-[40px] bg-white border-r border-gray-200 text-left">
//         <div className="py-2 flex justify-center">
//           <Checkbox
//             checked={selectedIds.size === currentPageItems.length && currentPageItems.length > 0}
//             onCheckedChange={handleSelectAll}
//           />
//         </div>
//       </th>

//       {/* Actions - WIDTH INCREASED to 160px, sticky left adjusted */}
// <th className="md:sticky left-[40px] z-30 w-[160px] bg-white border-r border-gray-200 text-left">
//         <div className="py-2 px-2">
//           <span className="font-semibold text-gray-700 text-xs">Actions</span>
//         </div>
//       </th> 

//       {/* Staff / ID - left position adjusted to 170px (40 + 130), width 200px */}
// <th className="md:sticky left-[200px] z-30 w-[200px] bg-white border-r border-gray-200 text-left">
//         <div className="space-y-1.5 py-2 px-2">
//           <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('name')}>
//             <span className="font-semibold text-gray-700 text-xs">Staff / ID</span>
//             <ArrowUpDown className="h-3 w-3 text-gray-400" />
//           </div>
//           <Input placeholder="Search name, email…" className="h-6 text-[11px] border-gray-200 px-1.5"
//             value={filters.name} onChange={(e) => handleFilterChange('name', e.target.value)} />
//         </div>
//       </th>

//       {/* Email & Location - with search bar (NEW) */}
//       <th className="md:sticky left-[400px] z-30 w-[180px] bg-white border-r border-gray-200 text-left">
//         <div className="space-y-1.5 py-2 px-2">
//           <span className="font-semibold text-gray-700 text-xs">Email / Location</span>
//           <Input placeholder="Search email or address…" className="h-6 text-[11px] border-gray-200 px-1.5"
//             value={filters.emailLocation} onChange={(e) => handleFilterChange('emailLocation', e.target.value)} />
//         </div>
//       </th>
//  {/* Contact */}
//       <th className="w-[150px] bg-white border-r border-gray-200 text-left">
//         <div className="space-y-1.5 py-2 px-2">
//           <span className="font-semibold text-gray-700 text-xs">Contact</span>
//           <Input placeholder="Search phone…" className="h-6 text-[11px] border-gray-200 px-1.5"
//             value={filters.contact} onChange={(e) => handleFilterChange('contact', e.target.value)} />
//         </div>
//       </th>
//       {/* Role */}
//       <th className="w-[140px] bg-white border-r border-gray-200 text-left">
//         <div className="space-y-1.5 py-2 px-2">
//           <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('role')}>
//             <span className="font-semibold text-gray-700 text-xs">Role</span>
//             <ArrowUpDown className="h-3 w-3 text-gray-400" />
//           </div>
//           <Input placeholder="Search role…" className="h-6 text-[11px] border-gray-200 px-1.5"
//             value={filters.role} onChange={(e) => handleFilterChange('role', e.target.value)} />
//         </div>
//       </th>

     

//       {/* Salary & Dept */}
//       <th className="w-[160px] bg-white border-r border-gray-200 text-left">
//         <div className="space-y-1.5 py-2 px-2">
//           <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('salary')}>
//             <span className="font-semibold text-gray-700 text-xs">Salary / Dept</span>
//             <ArrowUpDown className="h-3 w-3 text-gray-400" />
//           </div>
//           <Input placeholder="Search salary…" className="h-6 text-[11px] border-gray-200 px-1.5"
//             value={filters.salary} onChange={(e) => handleFilterChange('salary', e.target.value)} />
//         </div>
//       </th>

//       {/* Documents - with search bar (NEW) */}
//       <th className="w-[160px] bg-white border-r border-gray-200 text-left">
//         <div className="space-y-1.5 py-2 px-2">
//           <span className="font-semibold text-gray-700 text-xs">Documents</span>
//           <Input placeholder="aadhar/pan/photo…" className="h-6 text-[11px] border-gray-200 px-1.5"
//             value={filters.documents} onChange={(e) => handleFilterChange('documents', e.target.value)} />
//         </div>
//       </th>

//       {/* Joined */}
//       <th className="w-[120px] bg-white border-r border-gray-200 text-left">
//         <div className="space-y-1.5 py-2 px-2">
//           <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('joining_date')}>
//             <span className="font-semibold text-gray-700 text-xs">Joined</span>
//             <ArrowUpDown className="h-3 w-3 text-gray-400" />
//           </div>
//           <input
//             type="date"
//             style={{ fontSize: '10px', height: '24px', width: '100%', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '0 4px', colorScheme: 'light', cursor: 'pointer' }}
//             value={filters.joined}
//             onChange={(e) => handleFilterChange('joined', e.target.value)}
//           />
//         </div>
//       </th>

//       {/* Status */}
//       <th className="w-[90px] bg-white text-left">
//         <div className="space-y-1.5 py-2 px-2">
//           <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('is_active')}>
//             <span className="font-semibold text-gray-700 text-xs">Status</span>
//             <ArrowUpDown className="h-3 w-3 text-gray-400" />
//           </div>
//           <Input placeholder="active/inactive…" className="h-6 text-[11px] border-gray-200 px-1.5"
//             value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} />
//         </div>
//       </th>

//     </tr>
//   </thead>

//   <tbody>
//     {currentPageItems.length === 0 ? (
//       <tr>
//         <td colSpan={10} className="text-center py-8 text-gray-400 text-xs">
//           No results match your filters.
//         </td>
//       </tr>
//     ) : (
//       currentPageItems.map((member, index) => (
//         <tr
//           key={member.id}
//           className={`hover:bg-blue-100 transition-colors duration-150 border-b border-gray-100 ${
//             index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
//           }`}
//         >
//           {/* Checkbox */}
// <td className="md:sticky left-0 z-20 w-[40px] bg-inherit border-r border-gray-100 py-2 px-2">
//             <div className="flex justify-center">
//               <Checkbox
//                 checked={selectedIds.has(member.id)}
//                 onCheckedChange={() => handleSelectOne(member.id)}
//               />
//             </div>
//           </td>

//           {/* Actions - width increased to 130px */}
// <td className="md:sticky left-[40px] z-20 bg-inherit w-[160px] border-r border-gray-100 py-2 px-1">
//             <div className="flex items-center gap-0.5 flex-wrap">
//               <Button size="sm" variant="ghost" onClick={() => onViewDetails(member)}
//                 className="h-6 w-6 p-0 hover:bg-blue-100 flex-shrink-0" title="View Details">
//                 <Eye className="h-3 w-3 text-blue-500" />
//               </Button>
//               <Button size="sm" variant="outline" onClick={() => onEdit(member)}
//                 className="h-6 w-6 p-0 flex-shrink-0" title="Edit">
//                 <Edit className="h-3 w-3" />
//               </Button>
//               <Button size="sm" variant={member.is_active ? "outline" : "default"}
//                 onClick={() => onToggleActive(member.id, member.is_active)}
//                 className="h-5 px-1 text-[9px] whitespace-nowrap flex-shrink-0">
//                 {member.is_active ? "Deactivate" : "Activate"}
//               </Button>
//               <Button size="sm" variant="destructive" onClick={() => onDelete(member.id)}
//                 className="h-6 w-6 p-0 flex-shrink-0" title="Delete">
//                 <Trash2 className="h-3 w-3" />
//               </Button>
//             </div>
//           </td>

//           {/* Staff / ID - left position adjusted to 170px */}
// <td className="md:sticky left-[200px] z-20 bg-inherit w-[200px] border-r border-gray-100 py-2 px-2">
//   <div 
//     className="flex items-center gap-1.5 cursor-pointer" 
//     onClick={() => onViewDetails(member)}
//   >
//     {member.photo_url ? (
//       <img src={member.photo_url} alt={member.name}
//         className="h-7 w-7 rounded-full object-cover border flex-shrink-0" />
//     ) : (
//       <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
//         <span className="text-white font-semibold text-[9px]">
//           {member.name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
//         </span>
//       </div>
//     )}
//     <div className="min-w-0">
//       <div className="flex items-center gap-1 flex-wrap">
//         <span className="text-xs font-medium truncate leading-tight hover:underline">
//           {member.salutation ? `${member.salutation.charAt(0).toUpperCase() + member.salutation.slice(1)}. ` : ""}
//           {member.name}
//         </span>
//         {member.employee_id && (
//           <span className="text-[9px] text-gray-400 whitespace-nowrap">#{member.employee_id}</span>
//         )}
//       </div>
//     </div>
//   </div>
// </td>


//           {/* Email & Location */}
//           <td className={`hover:bg-blue-100 w-[180px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-r border-gray-100 py-2 px-2`}>
//             <div className="flex items-center gap-0.5 mb-0.5">
//               <Mail className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
//               <span className="text-[10px] text-gray-600 truncate">{member.email}</span>
//             </div>
//             {member.current_address && (
//               <div className="flex items-start gap-0.5">
//                 <MapPin className="h-2.5 w-2.5 text-gray-400 flex-shrink-0 mt-px" />
//                 <span className="text-[10px] text-gray-500 truncate">{member.current_address}</span>
//               </div>
//             )}
//           </td>
//  {/* Contact */}
//           <td className={`hover:bg-blue-100 w-[150px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-r border-gray-100 py-2 px-2`}>
//             <div className="flex items-center gap-0.5 mb-0.5">
//               <Phone className="h-2.5 w-2.5 text-gray-500 flex-shrink-0" />
//               <span className="text-[10px] truncate">
//                 {member.phone ? `${member.phone_country_code || "+91"}${member.phone}` : "—"}
//               </span>
//             </div>
//             {member.whatsapp_number && (
//               <div className="flex items-center gap-0.5">
//                 <MessageSquare className="h-2.5 w-2.5 text-green-500 flex-shrink-0" />
//                 <span className="text-[10px] truncate">{member.whatsapp_number}</span>
//               </div>
//             )}
//           </td>
//           {/* Role */}
//           <td className={`hover:bg-blue-100 w-[140px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-r border-gray-100 py-2 px-2`}>
//             <Badge variant="outline"
//               className={`${getRoleBadgeColor(member.role_name || member.role?.toString() || "")} flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-5 w-fit`}>
//               {roleIcons[member.role_name?.toLowerCase() || member.role?.toString().toLowerCase()] || <User className="h-2.5 w-2.5" />}
//               <span className="capitalize truncate">{member.role_name || member.role || "No Role"}</span>
//             </Badge>
//           </td>

         

//           {/* Salary & Dept */}
//           <td className={`hover:bg-blue-100 w-[160px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-r border-gray-100 py-2 px-2`}>
//             <div className="text-xs font-medium whitespace-nowrap">{formatSalary(member.salary)}</div>
//             <div className="flex items-center gap-1 mt-0.5 flex-wrap">
//               {(member.department_name || member.department) && (
//                 <div className="flex items-center gap-0.5">
//                   <Building className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
//                   <span className="text-[10px] text-gray-600 truncate">
//                     {member.department_name || member.department}
//                   </span>
//                 </div>
//               )}
//               {member.assigned_requests > 0 && (
//                 <span className="text-[9px] text-blue-600 whitespace-nowrap">{member.assigned_requests} reqs</span>
//               )}
//             </div>
//           </td>

//           {/* Documents */}
//           <td className={`hover:bg-blue-100 w-[160px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-r border-gray-100 py-2 px-2`}>
//             <div className="flex items-center gap-0.5 whitespace-nowrap">
//               {member.aadhar_document_url && (
//                 <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 whitespace-nowrap">Aadhar ✓</Badge>
//               )}
//               {member.pan_document_url && (
//                 <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 whitespace-nowrap">PAN ✓</Badge>
//               )}
//               {member.photo_url && (
//                 <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 whitespace-nowrap">Photo ✓</Badge>
//               )}
//               {!member.aadhar_document_url && !member.pan_document_url && !member.photo_url && (
//                 <span className="text-[10px] text-gray-400">—</span>
//               )}
//             </div>
//           </td>

//           {/* Joined Date */}
//           <td className={`hover:bg-blue-100 w-[120px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-r border-gray-100 py-2 px-2`}>
//             <div className="flex items-center gap-0.5">
//               <Calendar className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
//               <span className="text-[10px] text-gray-600 whitespace-nowrap">
//                 {member.joining_date ? new Date(member.joining_date).toLocaleDateString("en-GB") : "—"}
//               </span>
//             </div>
//           </td>

//           {/* Status */}
//           <td className={`hover:bg-blue-100 w-[90px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} py-2 px-2`}>
//             <Badge className={
//               member.is_active
//                 ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-[9px] px-1.5 py-0 h-4"
//                 : "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200 text-[9px] px-1.5 py-0 h-4"
//             }>
//               {member.is_active ? "Active" : "Inactive"}
//             </Badge>
//           </td>

//         </tr>
//       ))
//     )}
//   </tbody>
// </table>
//           </div>

//           {/* Pagination */}
//         <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-3 py-2 rounded-b-lg">
//   <div className="flex flex-row items-center justify-between gap-2 sm:flex-row sm:items-center sm:justify-between">
    
//     {/* Left Side */}
//     <div className="flex items-center gap-2 text-xs shrink-0">
//       <span className="text-gray-500 whitespace-nowrap">
//         {filteredStaff.length} staff
//       </span>

//       <div className="flex items-center gap-1">
//         <Select
//           value={String(itemsPerPage)}
//           onValueChange={(val) => {
//             setItemsPerPage(Number(val));
//             setCurrentPage(1);
//           }}
//         >
//           <SelectTrigger className="h-7 w-[58px] text-xs">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="10">10</SelectItem>
//             <SelectItem value="25">25</SelectItem>
//             <SelectItem value="50">50</SelectItem>
//             <SelectItem value="9999">All</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//     </div>

//     {/* Right Side */}
//     <div className="flex items-center gap-1 shrink-0">
//       <Button
//         variant="outline"
//         size="sm"
//         onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//         disabled={currentPage === 1}
//         className="h-7 px-2 text-[11px]"
//       >
//         Prev
//       </Button>

//       <span className="text-[11px] text-gray-600 px-1 whitespace-nowrap">
//         {itemsPerPage === 9999
//           ? "1/1"
//           : `${currentPage}/${Math.ceil(filteredStaff.length / itemsPerPage) || 1}`}
//       </span>

//       <Button
//         variant="outline"
//         size="sm"
//         onClick={() => setCurrentPage((p) => p + 1)}
//         disabled={
//           itemsPerPage === 9999 ||
//           currentPage >= Math.ceil(filteredStaff.length / itemsPerPage)
//         }
//         className="h-7 px-2 text-[11px]"
//       >
//         Next
//       </Button>
//     </div>
//   </div>
// </div>
//         </div>
//       </div>

//       {/* Bulk Delete Confirmation Dialog */}
//       {/* <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-red-600">
//               <AlertCircle className="h-5 w-5" />
//               Confirm Bulk Delete
//             </DialogTitle>
//             <DialogDescription>
//               Are you sure you want to delete {selectedIds.size} {selectedIds.size === 1 ? 'staff member' : 'staff members'}?
//               This action cannot be undone.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="bg-red-50 p-3 rounded-md my-2 max-h-40 overflow-y-auto">
//             <p className="text-xs font-medium text-red-800 mb-2">Selected members:</p>
//             <ul className="text-xs text-red-700 space-y-1">
//               {Array.from(selectedIds).slice(0, 5).map(id => {
//                 const member = staff.find(m => m.id === id);
//                 return (
//                   <li key={id} className="flex items-center gap-2">
//                     <span className="font-mono">#{id}</span>
//                     <span className="truncate">- {member?.name || 'Unknown'}</span>
//                   </li>
//                 );
//               })}
//               {selectedIds.size > 5 && (
//                 <li className="text-red-600 font-medium">...and {selectedIds.size - 5} more</li>
//               )}
//             </ul>
//           </div>

//           <DialogFooter className="flex gap-2 sm:gap-0">
//             <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)} disabled={bulkDeleteLoading}>
//               Cancel
//             </Button>
//             <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleteLoading}
//               className="bg-red-600 hover:bg-red-700">
//               {bulkDeleteLoading ? (
//                 <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</>
//               ) : (
//                 <><XCircle className="h-4 w-4 mr-2" />Delete {selectedIds.size} {selectedIds.size === 1 ? 'Member' : 'Members'}</>
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog> */}


      
//     </div>
//   );
// };

// export const StaffTableSkeleton = () => (
//   <div className="rounded-md border overflow-hidden">
//     <div className="max-h-[600px] overflow-auto">
//       <table className="w-full min-w-[1400px] table-fixed border-collapse">
//         <thead className="sticky top-0 z-10 bg-white border-b-2 border-blue-200">
//           <tr>
//             <th className="w-[40px] py-3 px-2"></th>
//             <th className="w-[130px] py-3 px-2 text-xs font-semibold text-gray-700">Actions</th>
//             <th className="w-[200px] py-3 px-2 text-xs font-semibold text-gray-700">Staff / ID</th>
//             <th className="w-[180px] py-3 px-2 text-xs font-semibold text-gray-700">Email / Location</th>
//             <th className="w-[140px] py-3 px-2 text-xs font-semibold text-gray-700">Role</th>
//             <th className="w-[150px] py-3 px-2 text-xs font-semibold text-gray-700">Contact</th>
//             <th className="w-[160px] py-3 px-2 text-xs font-semibold text-gray-700">Salary / Dept</th>
//             <th className="w-[130px] py-3 px-2 text-xs font-semibold text-gray-700">Documents</th>
//             <th className="w-[120px] py-3 px-2 text-xs font-semibold text-gray-700">Joined</th>
//             <th className="w-[90px] py-3 px-2 text-xs font-semibold text-gray-700">Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {Array.from({ length: 5 }).map((_, index) => (
//             <tr key={index} className="border-b border-gray-100">
//               <td className="py-2 px-2"><Skeleton className="h-4 w-4 mx-auto" /></td>
//               <td className="py-2 px-1"><div className="flex gap-0.5"><Skeleton className="h-6 w-6" /><Skeleton className="h-6 w-6" /></div></td>
//               <td className="py-2 px-2">
//                 <div className="flex items-center gap-1.5">
//                   <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
//                   <div className="space-y-1"><Skeleton className="h-3 w-24" /><Skeleton className="h-2.5 w-16" /></div>
//                 </div>
//               </td>
//               <td className="py-2 px-2"><div className="space-y-1"><Skeleton className="h-2.5 w-28" /><Skeleton className="h-2.5 w-20" /></div></td>
//               <td className="py-2 px-2"><Skeleton className="h-5 w-20" /></td>
//               <td className="py-2 px-2"><div className="space-y-1"><Skeleton className="h-2.5 w-20" /><Skeleton className="h-2.5 w-16" /></div></td>
//               <td className="py-2 px-2"><div className="space-y-1"><Skeleton className="h-3 w-14" /><Skeleton className="h-2.5 w-20" /></div></td>
//               <td className="py-2 px-2"><Skeleton className="h-4 w-14" /></td>
//               <td className="py-2 px-2"><Skeleton className="h-4 w-16" /></td>
//               <td className="py-2 px-2"><Skeleton className="h-4 w-14" /></td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// );

// export default StaffTable;



// app/admin/staff/components/StaffTable.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StaffMember } from "@/lib/staffApi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail, Phone, MessageSquare, MapPin, Calendar, User,
  Building, Edit, Trash2, Eye, ArrowUpDown, XCircle, X,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

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
  onBulkDelete: (ids: number[]) => void;
}

const StaffTable = ({
  staff,
  loading,
  roleIcons,
  getRoleBadgeColor,
  formatSalary,
  onEdit,
  onDelete,
  onToggleActive,
  onViewDetails,
  onBulkDelete,
}: StaffTableProps) => {
  const [filters, setFilters] = useState({
    name: "",
    role: "",
    contact: "",
    salary: "",
    status: "",
    joined: "",
    emailLocation: "",
    documents: "",
  });
  const [sortField, setSortField] = useState<keyof StaffMember>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const handleFilterChange = (col: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [col]: value }));
    setCurrentPage(1);
  };

  const handleSort = (field: keyof StaffMember) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const getDocumentStatusString = (member: StaffMember) => {
    const docs = [];
    if (member.aadhar_document_url) docs.push("aadhar");
    if (member.pan_document_url) docs.push("pan");
    if (member.photo_url) docs.push("photo");
    return docs.join(" ");
  };

  const filteredStaff = staff
    .filter((member) => {
      const formattedPhone = member.phone ? `${member.phone_country_code || "+91"}${member.phone}` : "";
      const nameStr =
        `${member.salutation ?? ""} ${member.name} ${member.employee_id ?? ""} ${member.email} ${member.current_address ?? ""}`.toLowerCase();
      const roleStr = (member.role_name || member.role?.toString() || "").toLowerCase();
      const contactStr = `${formattedPhone} ${member.whatsapp_number ?? ""}`.toLowerCase();
      const salaryStr = `${formatSalary(member.salary)} ${(member.department_name || member.department) ?? ""}`.toLowerCase();
      const statusStr = (member.is_active ? "active" : "inactive").toLowerCase();
      const emailLocationStr = `${member.email} ${member.current_address ?? ""}`.toLowerCase();
      const matchesEmailLocation = emailLocationStr.includes(filters.emailLocation.toLowerCase());
      const documentsStr = getDocumentStatusString(member).toLowerCase();
      const matchesDocuments = filters.documents === "" || documentsStr.includes(filters.documents.toLowerCase());
      let matchesJoined = true;
      if (filters.joined && member.joining_date) {
        const memberDate = new Date(member.joining_date).toISOString().split("T")[0];
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
    })
    .sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const currentPageItems =
    itemsPerPage === 9999
      ? filteredStaff
      : filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = () => {
    if (selectedIds.size === currentPageItems.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(currentPageItems.map((m) => m.id)));
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

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage) || 1;

  return (
    <div className="px-0">
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
              onClick={() => onBulkDelete(Array.from(selectedIds))}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg text-xs font-bold text-[#DC2626] hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete {selectedIds.size}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <div className="relative">
          {/* ── Table with compact max-height ── */}
          <div
            className={`overflow-auto rounded-lg transition-all duration-300 ${
              selectedIds.size > 0
                ? "h-[500px] md:h-[550px]"
                : "h-[540px] md:h-[550px]"
            }`}
          >
            <table className="w-full min-w-[1000px] table-fixed border-collapse">
              <thead className="sticky top-0 z-10">
                {/* ── Row 1: Column Titles ── */}
                <tr className="bg-gray-200 border-b border-gray-300">
                  <th className="md:sticky left-0 z-30 w-[26px] bg-gray-200 border-r border-gray-300 text-center py-0.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === currentPageItems.length && currentPageItems.length > 0}
                      onChange={handleSelectAll}
                      className="w-3.5 h-3.5 cursor-pointer"
                    />
                  </th>
                  <th className="md:sticky left-[30px] z-30 w-[120px] bg-gray-200 border-r border-gray-300 text-left py-0.5 px-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Actions</span>
                  </th>
                  <th className="md:sticky left-[150px] z-30 w-[180px] bg-gray-200 border-r border-gray-300 text-left py-0.5 px-1">
                    <div className="flex items-center gap-0.5 cursor-pointer" onClick={() => handleSort("name")}>
                      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Staff / ID</span>
                      <ArrowUpDown className="h-2.5 w-2.5 text-gray-400" />
                    </div>
                  </th>
                  <th className="w-[150px] bg-gray-200 border-r border-gray-300 text-left py-0.5 px-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Email / Location</span>
                  </th>
                  <th className="w-[100px] bg-gray-200 border-r border-gray-300 text-left py-0.5 px-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Contact</span>
                  </th>
                  <th className="w-[100px] bg-gray-200 border-r border-gray-300 text-left py-0.5 px-1">
                    <div className="flex items-center gap-0.5 cursor-pointer" onClick={() => handleSort("role")}>
                      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Role</span>
                      <ArrowUpDown className="h-2.5 w-2.5 text-gray-400" />
                    </div>
                  </th>
                  <th className="w-[110px] bg-gray-200 border-r border-gray-300 text-left py-0.5 px-1">
                    <div className="flex items-center gap-0.5 cursor-pointer" onClick={() => handleSort("salary")}>
                      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Salary / Dept</span>
                      <ArrowUpDown className="h-2.5 w-2.5 text-gray-400" />
                    </div>
                  </th>
                  <th className="w-[130px] bg-gray-200 border-r border-gray-300 text-left py-0.5 px-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Documents</span>
                  </th>
                  <th className="w-[110px] bg-gray-200 border-r border-gray-300 text-left py-0.5 px-1">
                    <div className="flex items-center gap-0.5 cursor-pointer" onClick={() => handleSort("joining_date")}>
                      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Joined</span>
                      <ArrowUpDown className="h-2.5 w-2.5 text-gray-400" />
                    </div>
                  </th>
                  <th className="w-[80px] bg-gray-200 text-left py-0.5 px-1">
                    <div className="flex items-center gap-0.5 cursor-pointer" onClick={() => handleSort("is_active")}>
                      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Status</span>
                      <ArrowUpDown className="h-2.5 w-2.5 text-gray-400" />
                    </div>
                  </th>
                </tr>

                {/* ── Row 2: Search Inputs ── */}
                <tr className="bg-white border-b border-gray-300">
                  <td className="md:sticky left-0 z-20 bg-white border-r border-gray-300 p-0.5 text-center" />
                  <td className="md:sticky left-[30px] z-20 bg-white border-r border-gray-300 p-0.5" />
                  <td className="md:sticky left-[150px] z-20 bg-white border-r border-gray-300 p-0.5">
                    <Input
                      placeholder="Search name, email…"
                      className="h-5 text-[10px] border-gray-300 px-1 bg-white w-full"
                      value={filters.name}
                      onChange={(e) => handleFilterChange("name", e.target.value)}
                    />
                  </td>
                  <td className="bg-white border-r border-gray-300 p-0.5">
                    <Input
                      placeholder="Search email or address…"
                      className="h-5 text-[10px] border-gray-300 px-1 bg-white w-full"
                      value={filters.emailLocation}
                      onChange={(e) => handleFilterChange("emailLocation", e.target.value)}
                    />
                  </td>
                  <td className="bg-white border-r border-gray-300 p-0.5">
                    <Input
                      placeholder="Search phone…"
                      className="h-5 text-[10px] border-gray-300 px-1 bg-white w-full"
                      value={filters.contact}
                      onChange={(e) => handleFilterChange("contact", e.target.value)}
                    />
                  </td>
                  <td className="bg-white border-r border-gray-300 p-0.5">
                    <Input
                      placeholder="Search role…"
                      className="h-5 text-[10px] border-gray-300 px-1 bg-white w-full"
                      value={filters.role}
                      onChange={(e) => handleFilterChange("role", e.target.value)}
                    />
                  </td>
                  <td className="bg-white border-r border-gray-300 p-0.5">
                    <Input
                      placeholder="Search salary…"
                      className="h-5 text-[10px] border-gray-300 px-1 bg-white w-full"
                      value={filters.salary}
                      onChange={(e) => handleFilterChange("salary", e.target.value)}
                    />
                  </td>
                  <td className="bg-white border-r border-gray-300 p-0.5">
                    <Input
                      placeholder="aadhar/pan/photo…"
                      className="h-5 text-[10px] border-gray-300 px-1 bg-white w-full"
                      value={filters.documents}
                      onChange={(e) => handleFilterChange("documents", e.target.value)}
                    />
                  </td>
                  <td className="bg-white border-r border-gray-300 p-0.5">
                    <input
                      type="date"
                      className="h-5 text-[10px] border-gray-300 px-1 bg-white rounded w-full"
                      value={filters.joined}
                      onChange={(e) => handleFilterChange("joined", e.target.value)}
                    />
                  </td>
                  <td className="bg-white p-0.5">
                    <Input
                      placeholder="active/inactive…"
                      className="h-5 text-[10px] border-gray-300 px-1 bg-white w-full"
                      value={filters.status}
                      onChange={(e) => handleFilterChange("status", e.target.value)}
                    />
                  </td>
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
                      className={`hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="md:sticky left-0 z-20 bg-inherit border-r border-gray-100 py-0.5 px-1 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(member.id)}
                          onChange={() => handleSelectOne(member.id)}
                          className="w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>

                      {/* Actions */}
                      <td className="md:sticky left-[30px] z-20 bg-inherit border-r border-gray-100 py-0.5 px-0.5">
                        <div className="flex items-center gap-0.5 flex-wrap">
                          <button
                            onClick={() => onViewDetails(member)}
                            className="h-5 w-5 rounded hover:bg-blue-100 flex items-center justify-center flex-shrink-0"
                            title="View Details"
                          >
                            <Eye className="h-2.5 w-2.5 text-blue-500" />
                          </button>
                          <button
                            onClick={() => onEdit(member)}
                            className="h-5 w-5 rounded hover:bg-amber-50 flex items-center justify-center flex-shrink-0"
                            title="Edit"
                          >
                            <Edit className="h-2.5 w-2.5 text-amber-600" />
                          </button>
                          <button
                            onClick={() => onToggleActive(member.id, member.is_active)}
                            className={`h-4 px-1 text-[8px] whitespace-nowrap flex-shrink-0 rounded border ${
                              member.is_active
                                ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                                : "border-green-200 text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {member.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => onDelete(member.id)}
                            className="h-5 w-5 rounded hover:bg-red-50 flex items-center justify-center flex-shrink-0"
                            title="Delete"
                          >
                            <Trash2 className="h-2.5 w-2.5 text-red-500" />
                          </button>
                        </div>
                      </td>

                      {/* Staff / ID */}
                      <td className="md:sticky left-[150px] z-20 bg-inherit border-r border-gray-100 py-0.5 px-1">
                        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => onViewDetails(member)}>
                          {member.photo_url ? (
                            <img src={member.photo_url} alt={member.name} className="h-6 w-6 rounded-full object-cover border flex-shrink-0" />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-semibold text-[8px]">
                                {member.name?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-0.5 flex-wrap">
                              <span className="text-[10px] font-medium truncate leading-tight hover:underline">
                                {member.salutation ? `${member.salutation.charAt(0).toUpperCase() + member.salutation.slice(1)}. ` : ""}
                                {member.name}
                              </span>
                              {member.employee_id && (
                                <span className="text-[8px] text-gray-400 whitespace-nowrap">#{member.employee_id}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Location */}
                      <td className="border-r border-gray-100 py-0.5 px-1">
                        <div className="flex items-center gap-0.5 mb-0.5">
                          <Mail className="h-2 w-2 text-gray-400 flex-shrink-0" />
                          <span className="text-[9px] text-gray-600 truncate">{member.email}</span>
                        </div>
                        {member.current_address && (
                          <div className="flex items-start gap-0.5">
                            <MapPin className="h-2 w-2 text-gray-400 flex-shrink-0 mt-px" />
                            <span className="text-[9px] text-gray-500 truncate">{member.current_address}</span>
                          </div>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="border-r border-gray-100 py-0.5 px-1">
                        <div className="flex items-center gap-0.5 mb-0.5">
                          <Phone className="h-2 w-2 text-gray-500 flex-shrink-0" />
                          <span className="text-[9px] truncate">
                            {member.phone ? `${member.phone_country_code || "+91"}${member.phone}` : "—"}
                          </span>
                        </div>
                        {member.whatsapp_number && (
                          <div className="flex items-center gap-0.5">
                            <FaWhatsapp className="h-2 w-2 text-green-500 flex-shrink-0" />
                            <span className="text-[9px] truncate">{member.whatsapp_number}</span>
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td className="border-r border-gray-100 py-0.5 px-1">
                        <Badge
                          variant="outline"
                          className={`${getRoleBadgeColor(
                            member.role_name || member.role?.toString() || ""
                          )} flex items-center gap-0.5 text-[8px] px-1 py-0 h-4 w-fit`}
                        >
                          {roleIcons[member.role_name?.toLowerCase() || member.role?.toString().toLowerCase()] || (
                            <User className="h-2 w-2" />
                          )}
                          <span className="capitalize truncate">{member.role_name || member.role || "No Role"}</span>
                        </Badge>
                      </td>

                      {/* Salary & Dept */}
                      <td className="border-r border-gray-100 py-0.5 px-1">
                        <div className="text-[10px] font-medium whitespace-nowrap">{formatSalary(member.salary)}</div>
                        <div className="flex items-center gap-0.5 mt-0.5 flex-wrap">
                          {(member.department_name || member.department) && (
                            <div className="flex items-center gap-0.5">
                              <Building className="h-2 w-2 text-gray-400 flex-shrink-0" />
                              <span className="text-[8px] text-gray-600 truncate">
                                {member.department_name || member.department}
                              </span>
                            </div>
                          )}
                          {member.assigned_requests > 0 && (
                            <span className="text-[8px] text-blue-600 whitespace-nowrap">{member.assigned_requests} reqs</span>
                          )}
                        </div>
                      </td>

                      {/* Documents */}
                      <td className="border-r border-gray-100 py-0.5 px-1">
                        <div className="flex items-center gap-0.5 whitespace-nowrap">
                          {member.aadhar_document_url && (
                            <Badge variant="outline" className="text-[8px] px-0.5 py-0 h-3 whitespace-nowrap">Aadhar ✓</Badge>
                          )}
                          {member.pan_document_url && (
                            <Badge variant="outline" className="text-[8px] px-0.5 py-0 h-3 whitespace-nowrap">PAN ✓</Badge>
                          )}
                          {member.photo_url && (
                            <Badge variant="outline" className="text-[8px] px-0.5 py-0 h-3 whitespace-nowrap">Photo ✓</Badge>
                          )}
                          {!member.aadhar_document_url && !member.pan_document_url && !member.photo_url && (
                            <span className="text-[9px] text-gray-400">—</span>
                          )}
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="border-r border-gray-100 py-0.5 px-1">
                        <div className="flex items-center gap-0.5">
                          <Calendar className="h-2 w-2 text-gray-400 flex-shrink-0" />
                          <span className="text-[9px] text-gray-600 whitespace-nowrap">
                            {member.joining_date ? new Date(member.joining_date).toLocaleDateString("en-GB") : "—"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-0.5 px-1">
                        <Badge
                          className={`${
                            member.is_active
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          } text-[8px] px-1 py-0 h-3`}
                        >
                          {member.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination (compact) ── */}
          <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-3 py-1.5 rounded-b-lg">
            <div className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 whitespace-nowrap text-[10px]">{filteredStaff.length} staff</span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(val) => {
                    setItemsPerPage(Number(val));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-5 w-14 text-[10px] border-gray-200 px-1">
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

              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-5 w-5 rounded border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-100"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <span className="text-[10px] text-gray-600 px-1 whitespace-nowrap">
                  {itemsPerPage === 9999 ? "1/1" : `${currentPage}/${totalPages}`}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={itemsPerPage === 9999 || currentPage >= totalPages}
                  className="h-5 w-5 rounded border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-100"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StaffTableSkeleton = () => (
  <div className="rounded-md border overflow-hidden">
    <div className="max-h-[400px] overflow-auto">
      <table className="w-full min-w-[1400px] table-fixed border-collapse">
        <thead className="sticky top-0 z-10 bg-gray-100 border-b-2 border-blue-200">
          <tr>
            <th className="w-[30px] py-1 px-1"></th>
            <th className="w-[130px] py-1 px-1 text-xs font-semibold text-gray-700">Actions</th>
            <th className="w-[180px] py-1 px-1 text-xs font-semibold text-gray-700">Staff / ID</th>
            <th className="w-[160px] py-1 px-1 text-xs font-semibold text-gray-700">Email / Location</th>
            <th className="w-[130px] py-1 px-1 text-xs font-semibold text-gray-700">Contact</th>
            <th className="w-[120px] py-1 px-1 text-xs font-semibold text-gray-700">Role</th>
            <th className="w-[150px] py-1 px-1 text-xs font-semibold text-gray-700">Salary / Dept</th>
            <th className="w-[140px] py-1 px-1 text-xs font-semibold text-gray-700">Documents</th>
            <th className="w-[110px] py-1 px-1 text-xs font-semibold text-gray-700">Joined</th>
            <th className="w-[80px] py-1 px-1 text-xs font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-1 px-1"><Skeleton className="h-3 w-3 mx-auto" /></td>
              <td className="py-1 px-0.5"><div className="flex gap-0.5"><Skeleton className="h-5 w-5" /><Skeleton className="h-5 w-5" /></div></td>
              <td className="py-1 px-1">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                  <div className="space-y-0.5"><Skeleton className="h-2.5 w-24" /><Skeleton className="h-2 w-16" /></div>
                </div>
              </td>
              <td className="py-1 px-1"><div className="space-y-0.5"><Skeleton className="h-2 w-28" /><Skeleton className="h-2 w-20" /></div></td>
              <td className="py-1 px-1"><div className="space-y-0.5"><Skeleton className="h-2 w-20" /><Skeleton className="h-2 w-16" /></div></td>
              <td className="py-1 px-1"><Skeleton className="h-4 w-16" /></td>
              <td className="py-1 px-1"><div className="space-y-0.5"><Skeleton className="h-2.5 w-14" /><Skeleton className="h-2 w-20" /></div></td>
              <td className="py-1 px-1"><Skeleton className="h-3 w-14" /></td>
              <td className="py-1 px-1"><Skeleton className="h-3 w-16" /></td>
              <td className="py-1 px-1"><Skeleton className="h-3 w-14" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default StaffTable;