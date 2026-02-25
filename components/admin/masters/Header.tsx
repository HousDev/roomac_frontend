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
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          {/* Search Bar - Full width on mobile */}
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 sm:p-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={`sm:w-[18px] sm:h-[18px] ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={onNewItem}
              disabled={!activeTab}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              <Plus size={14} className="sm:w-[18px] sm:h-[18px]" />
              <span className="sm:hidden">New</span>
              <span className="hidden sm:inline">New Master Type</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}