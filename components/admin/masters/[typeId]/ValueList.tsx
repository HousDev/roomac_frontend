"use client";

import { Search, Tag, Hash, Plus, Edit2, Trash2, Loader2, Check, X } from "lucide-react";
import { formatDate } from "@/components/admin/masters/table-config";

interface MasterValue {
  id: number;
  value: string;
  is_active: boolean;
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
  onEditValue: any;
  onToggleStatus: (id: number, current: boolean) => void;
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
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search values..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as any)}
              className="px-3 py-2 bg-gray-50 border rounded-lg text-sm flex-1"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Values List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-sm text-gray-500">Loading values...</p>
          </div>
        ) : values.length === 0 ? (
          <div className="p-8 text-center">
            <Tag className="h-12 w-12 mx-auto text-gray-300" />
            <h3 className="mt-2 text-lg font-semibold text-gray-800">No Values Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "No matching values found" 
                : "No values created yet"}
            </p>
            <button
              onClick={onNewValue}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm"
            >
              <Plus size={16} className="inline mr-1" />
              Create First Value
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {values.map((value) => (
              <div
                key={value.id}
                className={`p-4 ${!value.is_active ? 'opacity-70' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      value.is_active 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-gray-50 text-gray-400'
                    }`}>
                      <Hash size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {value.value}
                        </h3>
                        {!value.is_active && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400">
                          Created {formatDate(value.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Value Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleStatus(value.id, value.is_active)}
                      disabled={togglingValueId === value.id}
                      className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                        value.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {togglingValueId === value.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : value.is_active ? (
                        <>
                          <Check size={12} />
                          Active
                        </>
                      ) : (
                        <>
                          <X size={12} />
                          Inactive
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => onEditValue(value)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    
                    <button
                      onClick={() => onDeleteValue(value.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}