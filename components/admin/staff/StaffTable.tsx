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
import { Input } from "@/components/ui/input";
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
  Search,
  FileText,
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
  onViewDetails
}: StaffTableProps) => {
  const [filters, setFilters] = useState({
    name: "",
    role: "",
    contact: "",
    salary: "",
    status: "",
  });

  const handleFilterChange = (col: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [col]: value }));
  };

  // Helper function to format salutation
  const formatSalutation = (salutation: string) => {
    if (!salutation) return "";

    const salutationMap: Record<string, string> = {
      mr: "Mr.",
      mrs: "Mrs.",
      miss: "Miss",
      dr: "Dr.",
      prof: "Prof.",
    };

    return salutationMap[salutation.toLowerCase()] || salutation;
  };

  const filteredStaff = staff.filter((member) => {
    const nameStr =
      `${member.salutation ?? ""} ${member.name} ${member.employee_id ?? ""} ${member.email} ${member.current_address ?? ""}`.toLowerCase();
    const roleStr = member.role.toLowerCase();
    const contactStr =
      `${member.phone ?? ""} ${member.whatsapp_number ?? ""} ${member.blood_group ?? ""}`.toLowerCase();
    const salaryStr =
      `${formatSalary(member.salary)} ${member.department ?? ""}`.toLowerCase();
    const statusStr = (member.is_active ? "active" : "inactive").toLowerCase();

    return (
      nameStr.includes(filters.name.toLowerCase()) &&
      roleStr.includes(filters.role.toLowerCase()) &&
      contactStr.includes(filters.contact.toLowerCase()) &&
      salaryStr.includes(filters.salary.toLowerCase()) &&
      statusStr.includes(filters.status.toLowerCase())
    );
  });

  if (loading && staff.length === 0) {
    return <StaffTableSkeleton />;
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <div className="flex flex-col items-center justify-center">
          <User className="h-14 w-14 text-gray-300 mb-3" />
          <p className="text-base font-medium">No staff members found</p>
          <p className="text-xs text-gray-400 mt-1">
            Add your first staff member using the button above
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-0 ">
      <div className="rounded-md border  ">
        <div className="max-h-[500px] md:max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 sticky top-60 z-10">
          <Table className="relative text-xs ">
            <TableHeader className="">
              {/* Column Headers */}
              <TableRow className="bg-white shadow-sm">
                <TableHead className="font-semibold whitespace-nowrap bg-white py-2 text-xs w-[200px] max-w-[200px] px-10">
                  Staff Member
                </TableHead>
                <TableHead className="font-semibold whitespace-nowrap bg-white py-2 text-xs w-[90px] ">
                  Role
                </TableHead>
                <TableHead className="font-semibold whitespace-nowrap bg-white py-2 text-xs ">
                  Contact
                </TableHead>
                <TableHead className="font-semibold whitespace-nowrap bg-white py-2 text-xs ">
                  Salary & Dept.
                </TableHead>
                <TableHead className="font-semibold whitespace-nowrap bg-white py-2 text-xs w-[80px] ">
                  Status
                </TableHead>
                <TableHead className="font-semibold whitespace-nowrap text-right bg-white py-2 text-xs ">
                  Actions
                </TableHead>
              </TableRow>

              {/* Search Filter Row */}
              <TableRow className="bg-gray-50 border-b">
                <TableHead className="py-1 px-2 bg-gray-50 w-[200px] max-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      value={filters.name}
                      onChange={(e) =>
                        handleFilterChange("name", e.target.value)
                      }
                      placeholder="Search name, email…"
                      className="h-6 pl-5 pr-2 text-[10px] border-gray-200 bg-white rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                    />
                  </div>
                </TableHead>
                <TableHead className="py-1 px-2 bg-gray-50 w-[90px]">
                  <div className="relative">
                    <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      value={filters.role}
                      onChange={(e) =>
                        handleFilterChange("role", e.target.value)
                      }
                      placeholder="Role…"
                      className="h-6 pl-5 pr-2 text-[10px] border-gray-200 bg-white rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                    />
                  </div>
                </TableHead>
                <TableHead className="py-1 px-2 bg-gray-50">
                  <div className="relative">
                    <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      value={filters.contact}
                      onChange={(e) =>
                        handleFilterChange("contact", e.target.value)
                      }
                      placeholder="Phone, WA…"
                      className="h-6 pl-5 pr-2 text-[10px] border-gray-200 bg-white rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                    />
                  </div>
                </TableHead>
                <TableHead className="py-1 px-2 bg-gray-50">
                  <div className="relative">
                    <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      value={filters.salary}
                      onChange={(e) =>
                        handleFilterChange("salary", e.target.value)
                      }
                      placeholder="Salary, dept…"
                      className="h-6 pl-5 pr-2 text-[10px] border-gray-200 bg-white rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                    />
                  </div>
                </TableHead>
                <TableHead className="py-1 px-2 bg-gray-50 w-[80px]">
                  <div className="relative">
                    <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      placeholder="Status…"
                      className="h-6 pl-5 pr-2 text-[10px] border-gray-200 bg-white rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                    />
                  </div>
                </TableHead>
                <TableHead className="py-1 px-2 bg-gray-50" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-400 text-xs"
                  >
                    No results match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((member) => (
                  <TableRow key={member.id} className="hover:bg-gray-50/50">
                    {/* Staff Member */}
                    <TableCell className="align-top py-1.5 px-10 w-[400px] max-w-[600px]">
                      <div className="flex items-start gap-2 min-w-[160px] md:min-w-[190px]">
                        {member.photo_url ? (
                          <img
                            src={member.photo_url}
                            alt={member.name}
                            className="h-8 w-8 rounded-full object-cover border flex-shrink-0"
                          />
                        ) : (
                         <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center border flex-shrink-0">
  <span className="text-white font-semibold text-[10px]">
    {member.name
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()}
  </span>
</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="font-medium text-[11px] truncate leading-tight">
                              {/* Format salutation: capitalize first letter */}
                              {member.salutation
                                ? `${member.salutation.charAt(0).toUpperCase() + member.salutation.slice(1)}. `
                                : ""}
                              {member.name}
                            </span>
                            {member.employee_id && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 py-0 h-4 whitespace-nowrap"
                              >
                                <Hash className="h-2.5 w-2.5 mr-0.5" />
                                {member.employee_id}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Mail className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                            <span className="text-[10px] text-gray-600 truncate">
                              {member.email}
                            </span>
                          </div>
                          {member.current_address && (
                            <div className="flex items-start gap-1 mt-0.5">
                              <MapPin className="h-2.5 w-2.5 text-gray-400 mt-px flex-shrink-0" />
                              <span className="text-[10px] text-gray-500 truncate">
                                {member.current_address}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-0.5">
                            <Calendar className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">
                              Joined: {formatDate(member.joining_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* // Update the Role cell to show role name instead of ID */}
                    <TableCell className="py-1.5 px-2 w-[200px] max-w-[200px]">
                      <div className="flex">
                        <Badge
                          variant="outline"
                          className={`${getRoleBadgeColor(member.role_name || member.role?.toString() || "")} flex items-center gap-0.5 whitespace-nowrap text-[9px] px-6 py-0 h-5`}
                        >
                          {roleIcons[
                            member.role_name?.toLowerCase() ||
                              member.role?.toString().toLowerCase()
                          ] || <User className="h-2.5 w-2.5" />}
                          <span className="capitalize">
                            {member.role_name || member.role || "No Role"}
                          </span>
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell className="flex py-1.5 px-2 w-[100px] max-w-[200px]">
                      <div className="flex flex-col gap-0.5 min-w-[100px]">
                        <div className="flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5 text-gray-500 flex-shrink-0" />
                          <span className="text-[10px] truncate">
                            {member.phone || "No phone"}
                          </span>
                        </div>
                        {member.whatsapp_number && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-2.5 w-2.5 text-green-500 flex-shrink-0" />
                            <span className="text-[10px] truncate">
                              {member.whatsapp_number}
                            </span>
                          </div>
                        )}
                        {member.blood_group &&
                          member.blood_group !== "not_specified" && (
                            <div className="flex items-center gap-1">
                              <Droplets className="h-2.5 w-2.5 text-red-500 flex-shrink-0" />
                              <span className="text-[10px] whitespace-nowrap">
                                Blood: {member.blood_group.toUpperCase()}
                              </span>
                            </div>
                          )}
                      </div>
                    </TableCell>

                    {/* Salary & Department */}
                    <TableCell className="align-center py-1.5 px-2 w-[200px] max-w-[200px]">
                      <div className="flex flex-col gap-0.5 min-w-[110px]">
                        <div className="font-medium text-[11px] whitespace-nowrap">
                          {formatSalary(member.salary)}
                        </div>
                        {(member.department_name || member.department) && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-600">
                            <Building className="h-2.5 w-2.5 flex-shrink-0" />
                            <span className="truncate">
                              {member.department_name || member.department}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-0.5 mt-0.5">
                          {member.aadhar_document_url && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 h-4 whitespace-nowrap"
                            >
                              Aadhar ✓
                            </Badge>
                          )}
                          {member.pan_document_url && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 h-4 whitespace-nowrap"
                            >
                              PAN ✓
                            </Badge>
                          )}
                          {member.photo_url && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 h-4 whitespace-nowrap"
                            >
                              Photo ✓
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-1.5 px-2 w-[80px] align-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <Badge
                          className={
                            member.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200 whitespace-nowrap text-[9px] px-1.5 py-0 h-4"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200 whitespace-nowrap text-[9px] px-1.5 py-0 h-4"
                          }
                        >
                          {member.is_active ? "Active" : "Inactive"}
                        </Badge>

                        {member.assigned_requests > 0 && (
                          <div className="text-[9px] text-blue-600 whitespace-nowrap text-center">
                            {member.assigned_requests} req
                            {member.assigned_requests !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
<TableCell className="align-center py-1.5 px-2">
  <div className="flex justify-end items-center gap-0.5 whitespace-nowrap">
    <Button
      size="sm"
      variant="ghost"
      onClick={() => onViewDetails(member)} // Add this handler
      className="h-6 w-6 p-0 flex-shrink-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
      title="View Details"
    >
      <Eye className="h-3 w-3" />
    </Button>
    {/* {member.aadhar_document_url && (
      <Button
        size="sm"
        variant="ghost"
        asChild
        className="h-6 w-6 p-0 flex-shrink-0"
        title="View Aadhar"
      >
        <a
          href={member.aadhar_document_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FileText className="h-3 w-3" />
        </a>
      </Button>
    )} */}
    <Button
      size="sm"
      variant="outline"
      onClick={() => onEdit(member)}
      className="h-6 w-6 p-0 flex-shrink-0"
      title="Edit"
    >
      <Edit className="h-3 w-3" />
    </Button>
    <Button
      size="sm"
      variant={member.is_active ? "outline" : "default"}
      onClick={() => onToggleActive(member.id, member.is_active)}
      className="h-6 px-1.5 text-[9px] whitespace-nowrap flex-shrink-0"
    >
      {member.is_active ? "Deactivate" : "Activate"}
    </Button>
    <Button
      size="sm"
      variant="destructive"
      onClick={() => onDelete(member.id)}
      className="h-6 w-6 p-0 flex-shrink-0"
      title="Delete"
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  </div>
</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
            <TableHead className="font-semibold bg-white text-xs">
              Staff Member
            </TableHead>
            <TableHead className="font-semibold bg-white text-xs w-[90px]">
              Role
            </TableHead>
            <TableHead className="font-semibold bg-white text-xs">
              Contact
            </TableHead>
            <TableHead className="font-semibold bg-white text-xs">
              Salary & Dept.
            </TableHead>
            <TableHead className="font-semibold bg-white text-xs w-[80px]">
              Status
            </TableHead>
            <TableHead className="font-semibold text-right bg-white text-xs">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="py-1.5">
                <div className="flex items-start gap-2">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2.5 w-20" />
                    <Skeleton className="h-2.5 w-36" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-1.5">
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell className="py-1.5">
                <div className="space-y-1">
                  <Skeleton className="h-2.5 w-20" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </TableCell>
              <TableCell className="py-1.5">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </TableCell>
              <TableCell className="py-1.5">
                <Skeleton className="h-4 w-14" />
              </TableCell>
              <TableCell className="py-1.5">
                <div className="flex justify-end gap-1">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-6" />
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
