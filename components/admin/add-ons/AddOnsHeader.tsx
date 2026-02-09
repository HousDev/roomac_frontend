import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw } from 'lucide-react';

interface AddOnsHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onAddNew: () => void;
  totalCount: number;
  filteredCount: number;
}

export default function AddOnsHeader({
  loading,
  onRefresh,
  onAddNew,
  totalCount,
  filteredCount,
}: AddOnsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <CardTitle className="text-xl">Add-ons Management</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Showing {filteredCount} of {totalCount} add-ons
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={onRefresh}
          disabled={loading}
          size="sm"
        >
          <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onAddNew}
          size="sm"
        >
          <Plus className="h-3 w-3 mr-2" />
          New Add-on
        </Button>
      </div>
    </div>
  );
}