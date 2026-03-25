// components/admin/enquiries/components/EnquiriesFilters.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface EnquiriesFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

const EnquiriesFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}: EnquiriesFiltersProps) => {
  return (
    <div className="mb-6 flex flex-wrap gap-4">
     
    </div>
  );
};

export default EnquiriesFilters;