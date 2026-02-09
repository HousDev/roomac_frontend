// components/admin/tenant/tenant-filters.tsx
import { Input } from "@/components/ui/input";
import type { TenantFilters as TenantFiltersType } from "@/lib/tenantApi";

interface TenantFiltersProps {
  filters: TenantFiltersType;
  onFilterChange: (filters: TenantFiltersType) => void;
}

export function TenantFilters({ filters, onFilterChange }: TenantFiltersProps) {
  return (
    <div className="bg-slate-100 border-b">
      <div className="grid grid-cols-12 gap-2 px-6 py-3">
        {/* Name Column Header with Search */}
        <div className="col-span-2">
          <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Name
          </div>
          <Input
            placeholder="Search name..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="mt-2 h-8 text-sm"
          />
        </div>
        
        {/* Contact Column Header */}
        <div className="col-span-2">
          <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Contact
          </div>
          <Input
            placeholder="Search email/phone..."
            className="mt-2 h-8 text-sm"
            disabled
          />
        </div>
        
        {/* Occupation Column Header */}
        <div className="col-span-2">
          <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Occupation
          </div>
          <Input
            placeholder="Search occupation..."
            className="mt-2 h-8 text-sm"
            disabled
          />
        </div>
        
        {/* Property Column Header */}
        <div className="col-span-2">
          <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Property & Room
          </div>
          <Input
            placeholder="Search property..."
            className="mt-2 h-8 text-sm"
            disabled
          />
        </div>
        
        {/* Payments Column Header */}
        <div className="col-span-2">
          <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Payments
          </div>
          <Input
            placeholder="Search payments..."
            className="mt-2 h-8 text-sm"
            disabled
          />
        </div>
        
        {/* Status Column Header */}
        <div className="col-span-1">
          <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Status
          </div>
          <Input
            placeholder="Search status..."
            className="mt-2 h-8 text-sm"
            disabled
          />
        </div>
        
        {/* Actions Column */}
        <div className="col-span-1 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
          Actions
        </div>
      </div>
    </div>
  );
} 