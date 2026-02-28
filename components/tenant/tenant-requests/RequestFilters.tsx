// components/tenant/tenant-requests/RequestFilters.tsx
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RequestFiltersProps {
  filter: string;
  onFilterChange: (value: string) => void;
  counts: Record<string, number>;
}

export function RequestFilters({ filter, onFilterChange, counts }: RequestFiltersProps) {
  // Define all possible display statuses
  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  return (
<Tabs value={filter} onValueChange={onFilterChange} className="w-full overflow-x-auto">
<TabsList className="flex w-max md:w-full overflow-x-auto scrollbar-none justify-start md:justify-evenly">  {tabs.map((tab) => (
<TabsTrigger key={tab.value} value={tab.value} className="shrink-0 text-xs px-2">            {tab.label} ({counts[tab.value] || 0})
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}