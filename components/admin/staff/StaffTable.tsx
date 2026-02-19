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
// } from "lucide-react";

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
// }: StaffTableProps) => {
//   if (loading && staff.length === 0) {
//     return <StaffTableSkeleton />;
//   }

//   if (staff.length === 0) {
//     return (
//       <div className="text-center py-12 text-gray-500">
//         <div className="flex flex-col items-center justify-center">
//           <User className="h-16 w-16 text-gray-300 mb-4" />
//           <p className="text-lg font-medium">No staff members found</p>
//           <p className="text-sm text-gray-500 mt-1">
//             Add your first staff member using the button above
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-md border overflow-hidden">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead className="font-semibold">Staff Member</TableHead>
//             <TableHead className="font-semibold">Role</TableHead>
//             <TableHead className="font-semibold">Contact</TableHead>
//             <TableHead className="font-semibold">Salary & Department</TableHead>
//             <TableHead className="font-semibold">Status</TableHead>
//             <TableHead className="font-semibold text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {staff.map((member) => (
//             <TableRow key={member.id} className="hover:bg-gray-50/50">
//               <TableCell>
//                 <div className="flex items-start gap-3">
//                   {member.photo_url ? (
//                     <img
//                       src={member.photo_url}
//                       alt={member.name}
//                       className="h-12 w-12 rounded-full object-cover border"
//                     />
//                   ) : (
//                     <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center border">
//                       <User className="h-6 w-6 text-gray-400" />
//                     </div>
//                   )}
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2">
//                       <span className="font-medium">
//                         {member.salutation ? `${member.salutation}. ` : ""}{member.name}
//                       </span>
//                       {member.employee_id && (
//                         <Badge variant="outline" className="text-xs">
//                           <Hash className="h-3 w-3 mr-1" />
//                           {member.employee_id}
//                         </Badge>
//                       )}
//                     </div>
//                     <div className="flex items-center gap-2 mt-1">
//                       <Mail className="h-3 w-3 text-gray-400" />
//                       <span className="text-sm text-gray-600 truncate max-w-[200px]">
//                         {member.email}
//                       </span>
//                     </div>
//                     {member.current_address && (
//                       <div className="flex items-start gap-1 mt-1">
//                         <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
//                         <span className="text-xs text-gray-500 truncate max-w-[200px]">
//                           {member.current_address}
//                         </span>
//                       </div>
//                     )}
//                     <div className="flex items-center gap-2 mt-1">
//                       <Calendar className="h-3 w-3 text-gray-400" />
//                       <span className="text-xs text-gray-500">
//                         Joined: {formatDate(member.joining_date)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </TableCell>
//               <TableCell>
//                 <Badge
//                   variant="outline"
//                   className={`${getRoleBadgeColor(member.role)} flex items-center gap-1`}
//                 >
//                   {roleIcons[member.role] || <User className="h-3 w-3" />}
//                   <span className="capitalize">{member.role}</span>
//                 </Badge>
//               </TableCell>
//               <TableCell>
//                 <div className="flex flex-col gap-1">
//                   <div className="flex items-center gap-2">
//                     <Phone className="h-3 w-3 text-gray-500" />
//                     <span className="text-sm">{member.phone || "No phone"}</span>
//                   </div>
//                   {member.whatsapp_number && (
//                     <div className="flex items-center gap-2">
//                       <MessageSquare className="h-3 w-3 text-green-500" />
//                       <span className="text-sm">{member.whatsapp_number}</span>
//                     </div>
//                   )}
//                   {member.blood_group && member.blood_group !== "not_specified" && (
//                     <div className="flex items-center gap-2">
//                       <Droplets className="h-3 w-3 text-red-500" />
//                       <span className="text-xs">Blood: {member.blood_group.toUpperCase()}</span>
//                     </div>
//                   )}
//                 </div>
//               </TableCell>
//               <TableCell>
//                 <div className="flex flex-col gap-2">
//                   <div className="font-medium">{formatSalary(member.salary)}</div>
//                   {member.department && (
//                     <div className="flex items-center gap-1 text-sm text-gray-600">
//                       <Building className="h-3 w-3" />
//                       {member.department}
//                     </div>
//                   )}
//                   {/* Document indicators */}
//                   <div className="flex flex-wrap gap-1 mt-1">
//                     {member.aadhar_document_url && (
//                       <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
//                         Aadhar ✓
//                       </Badge>
//                     )}
//                     {member.pan_document_url && (
//                       <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
//                         PAN ✓
//                       </Badge>
//                     )}
//                     {member.photo_url && (
//                       <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
//                         Photo ✓
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
//               </TableCell>
//               <TableCell>
//                 <div className="flex flex-col gap-1">
//                   <Badge
//                     className={
//                       member.is_active
//                         ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
//                         : "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200"
//                     }
//                   >
//                     {member.is_active ? "Active" : "Inactive"}
//                   </Badge>
//                   {member.assigned_requests > 0 && (
//                     <div className="text-xs text-blue-600">
//                       {member.assigned_requests} assigned request{member.assigned_requests !== 1 ? 's' : ''}
//                     </div>
//                   )}
//                 </div>
//               </TableCell>
//               <TableCell>
//                 <div className="flex justify-end gap-2">
//                   {/* Document View Buttons */}
//                   {member.aadhar_document_url && (
//                     <Button
//                       size="sm"
//                       variant="ghost"
//                       asChild
//                       className="h-8 w-8 p-0"
//                       title="View Aadhar"
//                     >
//                       <a
//                         href={member.aadhar_document_url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         <Eye className="h-3.5 w-3.5" />
//                       </a>
//                     </Button>
//                   )}
                  
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => onEdit(member)}
//                     className="h-8 w-8 p-0"
//                     title="Edit"
//                   >
//                     <Edit className="h-3.5 w-3.5" />
//                   </Button>
                  
//                   <Button
//                     size="sm"
//                     variant={member.is_active ? "outline" : "default"}
//                     onClick={() => onToggleActive(member.id, member.is_active)}
//                     className="h-8 px-3 text-xs"
//                   >
//                     {member.is_active ? "Deactivate" : "Activate"}
//                   </Button>
                  
//                   <Button
//                     size="sm"
//                     variant="destructive"
//                     onClick={() => onDelete(member.id)}
//                     className="h-8 w-8 p-0"
//                     title="Delete"
//                   >
//                     <Trash2 className="h-3.5 w-3.5" />
//                   </Button>
//                 </div>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };

// export const StaffTableSkeleton = () => (
//   <div className="rounded-md border overflow-hidden">
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead className="font-semibold">Staff Member</TableHead>
//           <TableHead className="font-semibold">Role</TableHead>
//           <TableHead className="font-semibold">Contact</TableHead>
//           <TableHead className="font-semibold">Salary & Department</TableHead>
//           <TableHead className="font-semibold">Status</TableHead>
//           <TableHead className="font-semibold text-right">Actions</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {Array.from({ length: 5 }).map((_, index) => (
//           <TableRow key={index}>
//             <TableCell>
//               <div className="flex items-start gap-3">
//                 <Skeleton className="h-12 w-12 rounded-full" />
//                 <div className="space-y-2 flex-1">
//                   <Skeleton className="h-4 w-32" />
//                   <Skeleton className="h-3 w-24" />
//                   <Skeleton className="h-3 w-40" />
//                 </div>
//               </div>
//             </TableCell>
//             <TableCell>
//               <Skeleton className="h-6 w-20" />
//             </TableCell>
//             <TableCell>
//               <div className="space-y-1">
//                 <Skeleton className="h-4 w-24" />
//                 <Skeleton className="h-3 w-20" />
//               </div>
//             </TableCell>
//             <TableCell>
//               <div className="space-y-1">
//                 <Skeleton className="h-4 w-16" />
//                 <Skeleton className="h-3 w-24" />
//               </div>
//             </TableCell>
//             <TableCell>
//               <Skeleton className="h-6 w-16" />
//             </TableCell>
//             <TableCell>
//               <div className="flex justify-end gap-2">
//                 <Skeleton className="h-8 w-8" />
//                 <Skeleton className="h-8 w-20" />
//                 <Skeleton className="h-8 w-8" />
//               </div>
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   </div>
// );

// export default StaffTable;




// app/admin/staff/components/StaffTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StaffMember } from "@/lib/staffApi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  Hash,
  User,
  Droplets,
  Building,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

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
}

const StaffTable = ({
  staff,
  loading,
  roleIcons,
  getRoleBadgeColor,
  formatSalary,
  formatDate,
  onEdit,
  onDelete,
  onToggleActive,
}: StaffTableProps) => {
  if (loading && staff.length === 0) {
    return <StaffTableSkeleton />;
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="flex flex-col items-center justify-center">
          <User className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-lg font-medium">No staff members found</p>
          <p className="text-sm text-gray-500 mt-1">
            Add your first staff member using the button above
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=" px-0 md:px-0">
      {/* Scrollable table container with max height */}
      <div className="rounded-md border overflow-hidden px-0 md:px-0">
        <div className="max-h-[430px] md:max-h-[520px] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <Table className="relative">
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow>
                <TableHead className="font-semibold whitespace-nowrap bg-white">Staff Member</TableHead>
                <TableHead className="font-semibold whitespace-nowrap bg-white">Role</TableHead>
                <TableHead className="font-semibold whitespace-nowrap bg-white">Contact</TableHead>
                <TableHead className="font-semibold whitespace-nowrap bg-white">Salary & Department</TableHead>
                <TableHead className="font-semibold whitespace-nowrap bg-white">Status</TableHead>
                <TableHead className="font-semibold whitespace-nowrap text-right bg-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id} className="hover:bg-gray-50/50">
                  <TableCell className="align-top">
                    <div className="flex items-start gap-3 min-w-[250px] md:min-w-[300px]">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="h-12 w-12 rounded-full object-cover border flex-shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center border flex-shrink-0">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">
                            {member.salutation ? `${member.salutation}. ` : ""}{member.name}
                          </span>
                          {member.employee_id && (
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              <Hash className="h-3 w-3 mr-1" />
                              {member.employee_id}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 truncate">
                            {member.email}
                          </span>
                        </div>
                        {member.current_address && (
                          <div className="flex items-start gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-500 truncate">
                              {member.current_address}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            Joined: {formatDate(member.joining_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge
                      variant="outline"
                      className={`${getRoleBadgeColor(member.role)} flex items-center gap-1 whitespace-nowrap`}
                    >
                      {roleIcons[member.role] || <User className="h-3 w-3" />}
                      <span className="capitalize">{member.role}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-col gap-1 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        <span className="text-sm truncate">{member.phone || "No phone"}</span>
                      </div>
                      {member.whatsapp_number && (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span className="text-sm truncate">{member.whatsapp_number}</span>
                        </div>
                      )}
                      {member.blood_group && member.blood_group !== "not_specified" && (
                        <div className="flex items-center gap-2">
                          <Droplets className="h-3 w-3 text-red-500 flex-shrink-0" />
                          <span className="text-xs whitespace-nowrap">Blood: {member.blood_group.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <div className="font-medium whitespace-nowrap">{formatSalary(member.salary)}</div>
                      {member.department && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Building className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{member.department}</span>
                        </div>
                      )}
                      {/* Document indicators */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.aadhar_document_url && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 whitespace-nowrap">
                            Aadhar ✓
                          </Badge>
                        )}
                        {member.pan_document_url && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 whitespace-nowrap">
                            PAN ✓
                          </Badge>
                        )}
                        {member.photo_url && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 whitespace-nowrap">
                            Photo ✓
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-col gap-1 min-w-[80px]">
                      <Badge
                        className={
                          member.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200 whitespace-nowrap"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200 whitespace-nowrap"
                        }
                      >
                        {member.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {member.assigned_requests > 0 && (
                        <div className="text-xs text-blue-600 whitespace-nowrap">
                          {member.assigned_requests} request{member.assigned_requests !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
  <div className="flex justify-end items-center gap-1 whitespace-nowrap">
    
    {member.aadhar_document_url && (
      <Button
        size="sm"
        variant="ghost"
        asChild
        className="h-8 w-8 p-0 flex-shrink-0"
        title="View Aadhar"
      >
        <a
          href={member.aadhar_document_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Eye className="h-3.5 w-3.5" />
        </a>
      </Button>
    )}

    <Button
      size="sm"
      variant="outline"
      onClick={() => onEdit(member)}
      className="h-8 w-8 p-0 flex-shrink-0"
      title="Edit"
    >
      <Edit className="h-3.5 w-3.5" />
    </Button>

    <Button
      size="sm"
      variant={member.is_active ? "outline" : "default"}
      onClick={() => onToggleActive(member.id, member.is_active)}
      className="h-8 px-2 text-xs whitespace-nowrap flex-shrink-0"
    >
      {member.is_active ? "Deactivate" : "Activate"}
    </Button>

    <Button
      size="sm"
      variant="destructive"
      onClick={() => onDelete(member.id)}
      className="h-8 w-8 p-0 flex-shrink-0"
      title="Delete"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>

  </div>
</TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Scroll indicator for mobile */}
      <div className="md:hidden mt-2 text-xs text-gray-500 text-center">
        Scroll horizontally to see more →
      </div>
    </div>
  );
};

export const StaffTableSkeleton = () => (
  <div className="rounded-md border overflow-hidden">
    <div className="max-h-[600px] overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10">
          <TableRow>
            <TableHead className="font-semibold bg-white">Staff Member</TableHead>
            <TableHead className="font-semibold bg-white">Role</TableHead>
            <TableHead className="font-semibold bg-white">Contact</TableHead>
            <TableHead className="font-semibold bg-white">Salary & Department</TableHead>
            <TableHead className="font-semibold bg-white">Status</TableHead>
            <TableHead className="font-semibold text-right bg-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-start gap-3">
                  <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16" />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default StaffTable;