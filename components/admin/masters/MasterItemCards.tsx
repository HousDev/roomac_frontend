// components/admin/masters/MasterItemCards.tsx
"use client";

import { Edit2, Trash2, Eye, Plus } from "lucide-react";
import { getItemIcon, formatDate } from "./table-config";

interface MasterItem {
  id: number;
  name: string;
  isactive: number;
  created_at: string;
  value_count: number;
}

interface MasterItemCardsProps {
  items: MasterItem[];
  loading: boolean;
  onEditItem: (item: MasterItem) => void;
  onDeleteItem: (id: number) => void;
  onViewValues: (id: number) => void;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border p-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6 text-center">
        <p className="text-sm text-gray-500 mb-2">No items found</p>
        <button
          onClick={onNewItem}
          className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
        >
          <Plus size={14} className="inline mr-1" />
          Create Item
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg border hover:shadow-sm transition-shadow"
        >
          <div className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${
                  item.isactive === 1 ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                }`}>
                  {getItemIcon(item.name)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">{item.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>{item.value_count} values</span>
                    <span>•</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                item.isactive === 1 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {item.isactive === 1 ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex items-center gap-1 mt-2 pt-2 border-t">
              <button
                onClick={() => onViewValues(item.id)}
                className="flex-1 py-1 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 flex items-center justify-center gap-1"
              >
                <Eye size={12} />
                View
              </button>
              <button
                onClick={() => onEditItem(item)}
                className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={() => onDeleteItem(item.id)}
                className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Add New Card */}
      {/* <button
        onClick={onNewItem}
        className="bg-white rounded-lg border border-dashed border-gray-300 p-3 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-1"
      >
        <Plus size={18} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-600">New Item</span>
      </button> */}
    </div>
  );
}