// components/admin/masters/TabList.tsx
"use client";

import { Search, FolderOpen, MoreVertical, Edit2, Trash2, Loader2 } from "lucide-react";
import { getTabIcon, formatDate } from "./table-config";

interface Tab {
  id?: number;
  name: string;
  type_count: number;
  created_at: string;
  is_active: number;
}

interface TabListProps {
  tabs: Tab[];
  activeTab: string;
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onTabClick: (tabName: string) => void;
  showTabMenu: string | null;
  onTabMenuClick: (tabName: string | null) => void;
  onEditTab: (tab: Tab) => void;
  onDeleteTab: (tab: Tab) => void;
}

export default function TabList({
  tabs,
  activeTab,
  loading,
  searchTerm,
  onSearchChange,
  onTabClick,
  showTabMenu,
  onTabMenuClick,
  onEditTab,
  onDeleteTab
}: TabListProps) {
  return (
    <div className="lg:col-span-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Categories (Tabs)</h2>
        <span className="text-sm text-gray-500">
          {tabs.length} of {tabs.length}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search tabs..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-sm text-gray-500">Loading tabs...</p>
          </div>
        ) : tabs.length === 0 ? (
          <div className="p-8 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500">No tabs found</p>
          </div>
        ) : (
          <div className="divide-y">
            {tabs.map((tab) => (
              <div
                key={tab.name}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 relative ${
                  activeTab === tab.name 
                    ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                    : ''
                }`}
                onClick={() => onTabClick(tab.name)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    activeTab === tab.name 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getTabIcon(tab.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {tab.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {tab.type_count || 0}
                        </span>
                        {tab.name !== "General" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTabMenuClick(showTabMenu === tab.name ? null : tab.name);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <MoreVertical size={14} className="text-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Created {formatDate(tab.created_at)}
                    </p>
                  </div>
                </div>
                
                {showTabMenu === tab.name && tab.name !== "General" && (
                  <div className="absolute right-2 top-10 z-10 bg-white border rounded-lg shadow-lg py-1 w-32">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTab(tab);
                        onTabMenuClick(null);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Edit2 size={14} />
                      Edit Tab
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTab(tab);
                        onTabMenuClick(null);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete Tab
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}