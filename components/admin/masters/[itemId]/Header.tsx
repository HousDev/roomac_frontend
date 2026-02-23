// components/admin/masters/[itemId]/Header.tsx
"use client";

import { ChevronLeft, RefreshCw, Plus, Layers, Download, Upload, FileDown } from "lucide-react";

interface MasterItem {
  id: number;
  name: string;
  isactive: number;
  tab_name?: string;
}

interface HeaderProps {
  masterItem: MasterItem;
  loading: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onNewValue: () => void;
  onExport: () => void;
  onImport: () => void;
}

export default function Header({
  masterItem,
  loading,
  onBack,
  onRefresh,
  onNewValue,
  onExport,
  onImport
}: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-8xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Layers className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{masterItem.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {masterItem.tab_name && (
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                    Tab: {masterItem.tab_name}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  masterItem.isactive === 1
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {masterItem.isactive === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Import Button */}
            <button
              onClick={onImport}
              className="px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-2 text-sm"
              title="Import from Excel"
            >
              <Upload size={16} />
              Import
            </button>

            {/* Export Button */}
            <button
              onClick={onExport}
              className="px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-2 text-sm"
              title="Export to Excel"
            >
              <FileDown size={16} />
              Export
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            
            <button
              onClick={onNewValue}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              New Master Value
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}