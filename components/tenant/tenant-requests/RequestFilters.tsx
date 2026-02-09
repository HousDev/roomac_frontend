import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RequestFiltersProps {
  filter: string;
  onFilterChange: (value: string) => void;
  counts: Record<string, number>;
}

export function RequestFilters({ filter, onFilterChange, counts }: RequestFiltersProps) {
  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  return (
    <Tabs value={filter} onValueChange={onFilterChange}>
      <TabsList className="grid w-full grid-cols-5">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label} ({counts[tab.value] || 0})
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}