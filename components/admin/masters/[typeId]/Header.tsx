"use client";

import { ChevronLeft, RefreshCw, Plus, Tag } from "lucide-react";

interface MasterType {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
}

interface HeaderProps {
  masterType: MasterType;
  loading: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onNewValue: () => void;
}

export default function Header({
  masterType,
  loading,
  onBack,
  onRefresh,
  onNewValue
}: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Tag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{masterType.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <code className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {masterType.code}
                </code>
                <span className={`px-2 py-1 text-xs rounded ${
                  masterType.is_active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {masterType.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="px-3 py-2 bg-white border rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            
            <button
              onClick={onNewValue}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              New Value
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}