import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from './table-config';
import { AddOn } from '@/lib/addOnsApi';
import { useAuth } from '@/context/authContext';

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
  const { can } = useAuth();

  if (loading && addOns.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        <span className="ml-2 text-sm text-gray-500">Loading add-ons...</span>
      </div>
    );
  }

  if (addOns.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-gray-400 mb-3">
          {activeFilter === 'all'
            ? 'No add-ons found. Create your first add-on!'
            : `No add-ons match the "${activeFilter}" filter`}
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 text-xs" onClick={onAddNew}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Create New Add-on
          </Button>
          {activeFilter !== 'all' && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => window.location.href = '/admin/add-ons'}
            >
              Show All
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="mb-3 text-xs text-gray-500">Showing {addOns.length} add-ons</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {addOns.map((addOn) => (
          <Card key={addOn.id} className="border hover:shadow-md transition-shadow">
            <CardContent className="p-3">

              {/* Top row: badges + toggle */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex flex-wrap gap-1">
                  <Badge
                    className={`text-[10px] px-1.5 py-0 h-4 ${CATEGORY_COLORS[addOn.category] ?? 'bg-gray-100 text-gray-800'}`}
                  >
                    {CATEGORY_LABELS[addOn.category] ?? addOn.category}
                  </Badge>
                  {!!addOn.is_popular && (
                    <Badge className="text-[10px] px-1.5 py-0 h-4 bg-orange-100 text-orange-700">
                      Popular
                    </Badge>
                  )}
                  {!!addOn.is_featured && (
                    <Badge className="text-[10px] px-1.5 py-0 h-4 bg-purple-100 text-purple-700">
                      Featured
                    </Badge>
                  )}
                  {!addOn.is_active && (
                    <Badge className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 text-gray-600">
                      Inactive
                    </Badge>
                  )}
                </div>

                {/* Toggle — bigger icon */}
                <button
                  onClick={() => onToggleStatus(addOn.id)}
                  title={addOn.is_active ? 'Deactivate' : 'Activate'}
                  className="flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  {addOn.is_active ? (
                    <ToggleRight className="h-6 w-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-300" />
                  )}
                </button>
              </div>

              {/* Name */}
              <h3 className="font-semibold text-sm text-gray-900 leading-tight mb-1 truncate">
                {addOn.name}
              </h3>

              {/* Description */}
              <p className="text-[11px] text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                {addOn.description || 'No description provided'}
              </p>

              {/* Price */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(addOn.price || 0)}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-1">
                    /{addOn.billing_type === 'one_time' ? 'once' : addOn.billing_type || 'monthly'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">#{addOn.id}</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-[10px] text-gray-400">
                  Order: {addOn.sort_order || 0} · Max: {addOn.max_per_tenant || 1}
                </span>
                <div className="flex gap-1">
                    {can('edit_addons') && (

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(addOn)}
                    className="h-6 w-6 p-0"
                    title="Edit"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                    )}
                    {can('delete_addons') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(addOn.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                    )}
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}