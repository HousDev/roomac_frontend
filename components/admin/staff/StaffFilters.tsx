


// app/admin/staff/components/StaffFilters.tsx
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface StaffFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
}

const StaffFilters = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
}: StaffFiltersProps) => {
  return (
    <div className="flex flex-row gap-2 w-full sm:flex-row sm:w-auto">
      
      {/* Search Input */}
      <div className="relative flex-1 sm:w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, phone..."
          className="pl-10 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Role Filter */}
      <Select value={roleFilter} onValueChange={setRoleFilter}>
        <SelectTrigger className="w-28 sm:w-40">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="manager">Manager</SelectItem>
          <SelectItem value="caretaker">Caretaker</SelectItem>
          <SelectItem value="accountant">Accountant</SelectItem>
          <SelectItem value="security">Security</SelectItem>
          <SelectItem value="driver">Driver</SelectItem>
          <SelectItem value="cook">Cook</SelectItem>
          <SelectItem value="housekeeping">Housekeeping</SelectItem>
        </SelectContent>
      </Select>

    </div>
  );
};

export default StaffFilters;
