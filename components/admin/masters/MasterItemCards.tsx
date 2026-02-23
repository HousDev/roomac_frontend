// components/admin/masters/MasterItemCards.tsx
"use client";

import { Edit2, Trash2, Eye, Plus, ChevronRight, Tag } from "lucide-react";
import { getItemIcon, formatDate, getStatusBadge } from "./table-config";

interface MasterItem {
  id: number;
  name: string;
  tab_name: string;
  isactive: number;
  created_at: string;
  value_count: number;
}

interface MasterItemCardsProps {
  items: MasterItem[];
  loading: boolean;
  onEditItem: (item: MasterItem) => void;
  onDeleteItem: (id: number) => void;
  onViewValues: (id: number, name: string) => void;
  onNewItem: () => void;
}

export default function MasterItemCards({
  items,
  loading,
  onEditItem,
  onDeleteItem,
  onViewValues,
  onNewItem
}: MasterItemCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <div className="max-w-sm mx-auto">
          <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Tag className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">No items found in this tab</p>
          <button
            onClick={onNewItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Create First Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl border hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  item.isactive === 1 ? 'bg-blue-50' : 'bg-gray-50'
                }`}>
                  {getItemIcon(item.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(item.isactive)}`}>
                      {item.isactive === 1 ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span className="font-medium">{item.value_count}</span>
                <span>values</span>
              </div>
              
              {/* Always visible buttons - removed hover opacity */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onViewValues(item.id, item.name)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                  title="View Values"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => onEditItem(item)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit Item"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Item"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => onViewValues(item.id, item.name)}
                  className="p-1.5 text-gray-400 hover:text-gray-600"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}