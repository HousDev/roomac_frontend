// components/admin/masters/Header.tsx
"use client";

import { RefreshCw, Plus, Shield, Search } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  onNewItem: () => void;
  loading: boolean;
  activeTab: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function Header({
  onRefresh,
  onNewItem,
  loading,
  activeTab,
  searchQuery,
  onSearchChange
}: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-8xl mx-auto p-4 md:p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Master Configuration</h1>
              <p className="text-gray-600 text-xs">Manage master data across all tabs</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 w-64"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            
            <button
              onClick={onNewItem}
              disabled={!activeTab}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              New Master Type 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}