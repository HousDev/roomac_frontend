// components/admin/masters/[itemId]/ValueList.tsx
"use client";

import { Search, Plus, Edit2, Trash2, Power } from "lucide-react";
import { formatDate } from "@/components/admin/masters/table-config";

interface MasterValue {
  id: number;
  name: string;
  isactive: number;
  created_at: string;
}

interface ValueListProps {
  values: MasterValue[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (filter: "all" | "active" | "inactive") => void;
  togglingValueId: number | null;
  onEditValue: (value: MasterValue) => void;
  onToggleStatus: (id: number, current: number) => void;
  onDeleteValue: (id: number) => void;
  onNewValue: () => void;
}

export default function ValueList({
  values,
  loading,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  togglingValueId,
  onEditValue,
  onToggleStatus,
  onDeleteValue,
  onNewValue
}: ValueListProps) {
  return (
    <div className="space-y-3">
      {/* Search Bar - Compact */}
      <div className="flex items-center gap-2 ">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search values..."
            className="w-full pl-7 pr-2 py-1.5 bg-white border rounded text-xs focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as any)}
          className="px-2 py-1.5 bg-white border rounded text-xs"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Values Table */}
      <div className="bg-white rounded border overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="inline-block h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500 mt-1">Loading...</p>
          </div>
        ) : values.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-xs text-gray-500 mb-2">No values found</p>
            <button
              onClick={onNewValue}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              <Plus size={12} className="inline mr-1" />
              Add Value
            </button>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Value</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Status</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Created</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {values.map((value) => (
                <tr key={value.id} className={`hover:bg-gray-50 ${value.isactive === 0 ? 'opacity-60' : ''}`}>
                  <td className="py-2 px-3 font-medium">{value.name}</td>
                  <td className="py-2 px-3">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-md ${
                      value.isactive === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${value.isactive === 1 ? 'bg-green-600' : 'bg-gray-500'}`} />
                      {value.isactive === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-500">{formatDate(value.created_at)}</td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onToggleStatus(value.id, value.isactive)}
                        disabled={togglingValueId === value.id}
                        className={`p-1 rounded hover:bg-gray-100 ${
                          value.isactive === 1 ? 'text-green-600' : 'text-gray-400'
                        }`}
                        title={value.isactive === 1 ? 'Deactivate' : 'Activate'}
                      >
                        {togglingValueId === value.id ? (
                          <div className="h-3 w-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Power size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => onEditValue(value)}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteValue(value.id)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>


    </div>
  );
}