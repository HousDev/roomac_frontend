"use client";

import { RefreshCw, FolderPlus, Plus, Shield } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  onNewTab: () => void;
  onNewType: () => void;
  loadingTabs: boolean;
  loadingTypes: boolean;
  activeTab: string;
}

export default function Header({
  onRefresh,
  onNewTab,
  onNewType,
  loadingTabs,
  loadingTypes,
  activeTab
}: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Master Configuration</h1>
              <p className="text-gray-600 text-sm">Manage system configuration by categories</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              disabled={loadingTabs || loadingTypes}
              className="px-3 py-2 bg-white border rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
            >
              <RefreshCw size={16} className={(loadingTabs || loadingTypes) ? 'animate-spin' : ''} />
              Refresh
            </button>
            
            <button
              onClick={onNewTab}
              className="px-3 py-2 bg-white border rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
            >
              <FolderPlus size={16} />
              New Tab
            </button>
            
            <button
              onClick={onNewType}
              disabled={!activeTab}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              New Type
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}