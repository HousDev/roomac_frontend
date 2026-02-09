import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from './table-config';
import { AddOn } from '@/lib/addOnsApi';

interface AddOnsGridProps {
  addOns: AddOn[];
  loading: boolean;
  onEdit: (addOn: AddOn) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onAddNew: () => void;
  activeFilter: string;
  formatCurrency: (amount: number) => string;
}

export default function AddOnsGrid({
  addOns,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddNew,
  activeFilter,
  formatCurrency,
}: AddOnsGridProps) {
  if (loading && addOns.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading add-ons...</span>
      </div>
    );
  }

  if (addOns.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          {activeFilter === 'all'
            ? 'No add-ons found. Create your first add-on!'
            : `No add-ons match the "${activeFilter}" filter`
          }
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onAddNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Add-on
        </Button>
        {activeFilter !== 'all' && (
          <Button 
            variant="outline" 
            className="ml-2"
            onClick={() => window.location.href = '/admin/add-ons'}
          >
            Show All
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-sm text-gray-600">
        Showing {addOns.length} add-ons
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addOns.map((addOn) => (
          <Card key={addOn.id} className="border hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className={CATEGORY_COLORS[addOn.category] || 'bg-gray-100 text-gray-800'}>
                    {CATEGORY_LABELS[addOn.category] || addOn.category}
                  </Badge>
                  {addOn.is_popular && (
                    <Badge className="bg-orange-100 text-orange-800">Popular</Badge>
                  )}
                  {addOn.is_featured && (
                    <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
                  )}
                  {!addOn.is_active && (
                    <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleStatus(addOn.id)}
                  className="h-6 w-6 p-0"
                  title={addOn.is_active ? 'Deactivate' : 'Activate'}
                >
                  {addOn.is_active ? (
                    <ToggleRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{addOn.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {addOn.description || 'No description provided'}
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(addOn.price || 0)}
                  <span className="text-sm font-normal text-gray-600 ml-1">
                    /{addOn.billing_type === 'one_time' ? 'once' : addOn.billing_type || 'monthly'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {addOn.id}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-xs text-gray-500">
                  Order: {addOn.sort_order || 0} • Max: {addOn.max_per_tenant || 1}
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(addOn)}
                    className="h-7 px-2"
                    title="Edit"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(addOn.id)}
                    className="h-7 px-2 text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}