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

  const filteredStaff = staff.filter((member) => {
    const nameStr = `${member.salutation ?? ""} ${member.name} ${member.employee_id ?? ""} ${member.email} ${member.current_address ?? ""}`.toLowerCase();
    const roleStr = member.role.toLowerCase();
    const contactStr = `${member.phone ?? ""} ${member.whatsapp_number ?? ""} ${member.blood_group ?? ""}`.toLowerCase();
    const salaryStr = `${formatSalary(member.salary)} ${member.department ?? ""}`.toLowerCase();
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <User className="h-7 w-7 text-slate-300" />
        </div>
        <p className="text-sm font-semibold text-slate-700">No staff members yet</p>
        <p className="text-xs text-slate-400 mt-1">Add your first staff member using the button above</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        <div className="max-h-[560px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <Table className="text-xs w-full">
            <TableHeader>
              {/* Column Headers */}
              <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-600 bg-slate-50 py-2.5 px-3 text-[11px] uppercase tracking-wide sticky top-0 z-10 w-[220px]">
                  Staff Member
                </TableHead>
                <TableHead className="font-semibold text-slate-600 bg-slate-50 py-2.5 px-3 text-[11px] uppercase tracking-wide sticky top-0 z-10 text-center w-[120px]">
                  Role
                </TableHead>
                <TableHead className="font-semibold text-slate-600 bg-slate-50 py-2.5 px-3 text-[11px] uppercase tracking-wide sticky top-0 z-10 w-[160px]">
                  Contact
                </TableHead>
                <TableHead className="font-semibold text-slate-600 bg-slate-50 py-2.5 px-3 text-[11px] uppercase tracking-wide sticky top-0 z-10 w-[150px]">
                  Salary & Dept.
                </TableHead>
                <TableHead className="font-semibold text-slate-600 bg-slate-50 py-2.5 px-3 text-[11px] uppercase tracking-wide sticky top-0 z-10 text-center w-[90px]">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-slate-600 bg-slate-50 py-2.5 px-3 text-[11px] uppercase tracking-wide sticky top-0 z-10 text-right">
                  Actions
                </TableHead>
              </TableRow>

              {/* Search Filter Row */}
              <TableRow className="bg-white border-b border-slate-100 hover:bg-white sticky top-[41px] z-10">
                <TableHead className="py-1.5 px-3 bg-white w-[220px]">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                    <Input
                      value={filters.name}
                      onChange={(e) => handleFilterChange("name", e.target.value)}
                      placeholder="Name, email…"
                      className="h-7 pl-6 pr-2 text-[11px] border-slate-200 bg-slate-50 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:ring-offset-0 placeholder:text-slate-400"
                    />
                  </div>
                </TableHead>
                <TableHead className="py-1.5 px-3 bg-white w-[120px]">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                    <Input
                      value={filters.role}
                      onChange={(e) => handleFilterChange("role", e.target.value)}
                      placeholder="Role…"
                      className="h-7 pl-6 pr-2 text-[11px] border-slate-200 bg-slate-50 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:ring-offset-0 placeholder:text-slate-400"
                    />
                  </div>
                </TableHead>
                <TableHead className="py-1.5 px-3 bg-white w-[160px]">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                    <Input
                      value={filters.contact}
                      onChange={(e) => handleFilterChange("contact", e.target.value)}
                      placeholder="Phone, WA…"
                      className="h-7 pl-6 pr-2 text-[11px] border-slate-200 bg-slate-50 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:ring-offset-0 placeholder:text-slate-400"
                    />
                  </div>
                </TableHead>
                <TableHead className="py-1.5 px-3 bg-white w-[150px]">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                    <Input
                      value={filters.salary}
                      onChange={(e) => handleFilterChange("salary", e.target.value)}
                      placeholder="Salary, dept…"
                      className="h-7 pl-6 pr-2 text-[11px] border-slate-200 bg-slate-50 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:ring-offset-0 placeholder:text-slate-400"
                    />
                  </div>
                </TableHead>
                <TableHead className="py-1.5 px-3 bg-white w-[90px]">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                    <Input
                      value={filters.status}
                      onChange={(e) => handleFilterChange("status", e.target.value)}
                      placeholder="Status…"
                      className="h-7 pl-6 pr-2 text-[11px] border-slate-200 bg-slate-50 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:ring-offset-0 placeholder:text-slate-400"
                    />
                  </div>
                </TableHead>
                <TableHead className="py-1.5 px-3 bg-white" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                    No results match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((member, idx) => (
                  <TableRow
                    key={member.id}
                    className={`group transition-colors hover:bg-blue-50/40 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"} border-b border-slate-100 last:border-0`}
                  >
                    {/* Staff Member */}
                    <TableCell className="py-2 px-3 w-[220px]">
                      <div className="flex items-center gap-2.5">
                        {member.photo_url ? (
                          <img
                            src={member.photo_url}
                            alt={member.name}
                            className="h-8 w-8 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-200 flex-shrink-0">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-[11px] text-slate-800 truncate leading-tight">
                              {member.salutation ? `${member.salutation}. ` : ""}{member.name}
                            </span>
                            {member.employee_id && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] text-slate-500 bg-slate-100 rounded px-1 py-0.5 font-mono border border-slate-200">
                                <Hash className="h-2 w-2" />{member.employee_id}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Mail className="h-2.5 w-2.5 text-slate-400 flex-shrink-0" />
                            <span className="text-[10px] text-slate-500 truncate">{member.email}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {member.current_address && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-2.5 w-2.5 text-slate-400 flex-shrink-0" />
                                <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{member.current_address}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5 text-slate-400 flex-shrink-0" />
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {formatDate(member.joining_date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell className="py-2 px-3 w-[120px] text-center">
                      <div className="flex justify-center">
                        <Badge
                          variant="outline"
                          className={`${getRoleBadgeColor(member.role)} inline-flex items-center gap-1 whitespace-nowrap text-[10px] px-2.5 py-0.5 h-5 font-medium rounded-full border`}
                        >
                          {roleIcons[member.role] || <User className="h-2.5 w-2.5" />}
                          <span className="capitalize">{member.role}</span>
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell className="py-2 px-3 w-[160px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-2.5 w-2.5 text-slate-400 flex-shrink-0" />
                          <span className="text-[10px] text-slate-700 font-medium">{member.phone || "—"}</span>
                        </div>
                        {member.whatsapp_number && (
                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="h-2.5 w-2.5 text-emerald-500 flex-shrink-0" />
                            <span className="text-[10px] text-slate-600">{member.whatsapp_number}</span>
                          </div>
                        )}
                        {member.blood_group && member.blood_group !== "not_specified" && (
                          <div className="flex items-center gap-1.5">
                            <Droplets className="h-2.5 w-2.5 text-red-400 flex-shrink-0" />
                            <span className="text-[10px] text-slate-500 font-medium">{member.blood_group.toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Salary & Department */}
                    <TableCell className="py-2 px-3 w-[150px]">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[12px] text-slate-800 whitespace-nowrap">
                          {formatSalary(member.salary)}
                        </span>
                        {member.department && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Building className="h-2.5 w-2.5 flex-shrink-0" />
                            <span className="truncate">{member.department}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {member.aadhar_document_url && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded font-medium">
                              Aadhar ✓
                            </span>
                          )}
                          {member.pan_document_url && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-medium">
                              PAN ✓
                            </span>
                          )}
                          {member.photo_url && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded font-medium">
                              Photo ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-2 px-3 w-[90px] text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            member.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${member.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {member.is_active ? "Active" : "Inactive"}
                        </span>
                        {member.assigned_requests > 0 && (
                          <span className="text-[9px] text-blue-600 font-medium whitespace-nowrap">
                            {member.assigned_requests} req{member.assigned_requests !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-2 px-3 text-right">
                      <div className="flex justify-end items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        {member.aadhar_document_url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                            className="h-7 w-7 p-0 rounded-lg hover:bg-slate-100"
                            title="View Aadhar"
                          >
                            <a href={member.aadhar_document_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-3.5 w-3.5 text-slate-500" />
                            </a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(member)}
                          className="h-7 w-7 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onToggleActive(member.id, member.is_active)}
                          className={`h-7 px-2 text-[10px] font-semibold rounded-lg whitespace-nowrap ${
                            member.is_active
                              ? "hover:bg-amber-50 hover:text-amber-700 text-slate-500"
                              : "hover:bg-emerald-50 hover:text-emerald-700 text-slate-500"
                          }`}
                        >
                          {member.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(member.id)}
                          className="h-7 w-7 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer count */}
        {filteredStaff.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              Showing <span className="font-semibold text-slate-600">{filteredStaff.length}</span> of{" "}
              <span className="font-semibold text-slate-600">{staff.length}</span> staff members
            </span>
            {filteredStaff.length !== staff.length && (
              <button
                onClick={() => setFilters({ name: "", role: "", contact: "", salary: "", status: "" })}
                className="text-[10px] text-blue-500 hover:text-blue-700 font-medium transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const StaffTableSkeleton = () => (
  <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
    <div className="max-h-[560px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            {["Staff Member", "Role", "Contact", "Salary & Dept.", "Status", "Actions"].map((h) => (
              <TableHead key={h} className="font-semibold bg-slate-50 text-[11px] uppercase tracking-wide text-slate-600 py-2.5 px-3">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index} className="border-b border-slate-100 animate-pulse">
              <TableCell className="py-2 px-3">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2.5 w-20" />
                    <Skeleton className="h-2 w-32" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2 px-3 text-center">
                <div className="flex justify-center">
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </TableCell>
              <TableCell className="py-2 px-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </TableCell>
              <TableCell className="py-2 px-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </TableCell>
              <TableCell className="py-2 px-3 text-center">
                <div className="flex justify-center">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </TableCell>
              <TableCell className="py-2 px-3">
                <div className="flex justify-end gap-1">
                  <Skeleton className="h-7 w-7 rounded-lg" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                  <Skeleton className="h-7 w-20 rounded-lg" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
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