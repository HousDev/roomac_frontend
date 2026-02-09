import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { FILTER_OPTIONS } from './table-config';
import { AddOn } from '@/lib/addOnsApi';

interface AddOnsFiltersProps {
  addOns: AddOn[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function AddOnsFilters({
  addOns,
  activeFilter,
  onFilterChange,
}: AddOnsFiltersProps) {
  // Calculate counts for each filter
  const filterCounts = FILTER_OPTIONS.reduce((acc, filter) => {
    if (filter.value === 'all') {
      acc[filter.value] = addOns.length;
    } else if (filter.value === 'active') {
      acc[filter.value] = addOns.filter(a => a.is_active).length;
    } else if (filter.value === 'inactive') {
      acc[filter.value] = addOns.filter(a => !a.is_active).length;
    } else if (filter.value === 'popular') {
      acc[filter.value] = addOns.filter(a => a.is_popular).length;
    } else if (filter.value === 'featured') {
      acc[filter.value] = addOns.filter(a => a.is_featured).length;
    } else if (filter.value === 'monthly') {
      acc[filter.value] = addOns.filter(a => a.billing_type === 'monthly').length;
    } else if (filter.value === 'one_time') {
      acc[filter.value] = addOns.filter(a => a.billing_type === 'one_time').length;
    } else {
      // Category filters
      acc[filter.value] = addOns.filter(a => a.category === filter.value).length;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="h-3 w-3 text-gray-500" />
      <span className="text-sm text-gray-600 mr-2">Filter:</span>
      {FILTER_OPTIONS.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label} ({filterCounts[filter.value] || 0})
        </Button>
      ))}
    </div>
  );
}