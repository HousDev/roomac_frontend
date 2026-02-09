// components/admin/masters/MasterTypeList.tsx
"use client";

import { Search, Tag, RefreshCw, Plus, Edit2, Trash2, ChevronRight, Loader2, CheckCircle, XCircle, Folder } from "lucide-react";
import { getTypeIcon, formatDate } from "./table-config";

interface MasterType {
  id: number;
  code: string;
  name: string;
  tab: string | null;
  is_active: boolean;
  created_at: string;
  value_count: number;
}

interface MasterTypeListProps {
  activeTab: string;
  types: MasterType[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (filter: "all" | "active" | "inactive") => void;
  togglingTypeId: number | null;
  onEditType: (type: MasterType) => void;
  onToggleStatus: (id: number, current: boolean) => void;
  onDeleteType: (id: number) => void;
  onViewValues: (id: number) => void;
  onNewType: () => void;
  onRefresh: () => void;
}

export default function MasterTypeList({
  activeTab,
  types,
  loading,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  togglingTypeId,
  onEditType,
  onToggleStatus,
  onDeleteType,
  onViewValues,
  onNewType,
  onRefresh
}: MasterTypeListProps) {
  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {activeTab || "Select a Tab"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">Master types in this category</p>
        </div>
        
        {activeTab && (
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="px-3 py-2 bg-white border rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        )}
      </div>

      {activeTab && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={`Search types in ${activeTab}...`}
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

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                <p className="mt-2 text-sm text-gray-500">Loading master types...</p>
              </div>
            ) : types.length === 0 ? (
              <div className="p-8 text-center">
                <Tag className="h-12 w-12 mx-auto text-gray-300" />
                <h3 className="mt-2 text-lg font-semibold text-gray-800">No Master Types</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "No matching types found" 
                    : "No master types created in this tab yet"}
                </p>
                <button
                  onClick={onNewType}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm"
                >
                  <Plus size={16} className="inline mr-1" />
                  Create First Type
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {types.map((type) => (
                  <div
                    key={type.id}
                    className={`p-4 ${!type.is_active ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          type.is_active 
                            ? 'bg-purple-50 text-purple-600' 
                            : 'bg-gray-50 text-gray-400'
                        }`}>
                          {getTypeIcon(type.name)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-800 text-sm">
                              {type.name}
                            </h3>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-mono rounded">
                              {type.code}
                            </span>
                            {!type.is_active && (
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500">
                              {type.value_count} values
                            </span>
                            <span className="text-xs text-gray-400">
                              Created {formatDate(type.created_at)}
                            </span>
                            {type.tab && type.tab.trim() !== "" && (
                              <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                                Tab: {type.tab}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                      
<button
  onClick={() => onToggleStatus(type.id, type.is_active)}
  disabled={togglingTypeId === type.id}
  className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
    type.is_active
      ? "bg-green-100 text-green-700 hover:bg-green-200"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
  }`}
>
  {togglingTypeId === type.id ? (
    <Loader2 size={12} className="animate-spin" />
  ) : type.is_active ? (
    <>
      <CheckCircle size={12} />
      Active
    </>
  ) : (
    <>
      <XCircle size={12} />
      Inactive
    </>
  )}
</button>
                        
                        <button
                          onClick={() => onEditType(type)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        
                        <button
                          onClick={() => onDeleteType(type.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                        
                        <button
                          onClick={() => onViewValues(type.id)}
                          disabled={!type.is_active}
                          className={`p-1.5 rounded ${
                            type.is_active
                              ? "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          title="Manage Values"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!activeTab && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-8 text-center">
            <Folder className="h-12 w-12 mx-auto text-gray-300" />
            <h3 className="mt-2 text-lg font-semibold text-gray-800">Select a Tab</h3>
            <p className="text-gray-600 mb-4">Choose a category from the left to view or create master types</p>
            <button
              onClick={onNewType}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm"
            >
              <Plus size={16} className="inline mr-1" />
              Create New Type
            </button>
          </div>
        </div>
      )}
    </div>
  );
}