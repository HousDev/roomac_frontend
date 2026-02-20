"use client";

import { useState } from "react";
import { Bug, ChevronDown, ChevronUp } from "lucide-react";

interface Tab {
  id: number;
  name: string;
  item_count: number;
  created_at: string;
  is_active: number;
}

interface MasterItem {
  id: number;
  tab_id: number;
  name: string;
  isactive: number;
  created_at: string;
  tab_name?: string;
  value_count: number;
}

interface DebugPanelProps {
  tabs: Tab[];
  activeTab: Tab | null;
  items: MasterItem[];
  filteredItems: MasterItem[];
  onRefresh: () => void;
}

export default function DebugPanel({ 
  tabs, 
  activeTab, 
  items, 
  filteredItems,
  onRefresh 
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700"
      >
        <Bug size={20} />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-96 bg-white border rounded-lg shadow-xl p-4 max-h-[80vh] overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">Debug Info</h3>
            <button
              onClick={onRefresh}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
            >
              Refresh
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="border-b pb-2">
              <p className="text-sm font-medium text-gray-700">Tabs ({tabs.length})</p>
              <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(tabs, null, 2)}
              </pre>
            </div>
            
            <div className="border-b pb-2">
              <p className="text-sm font-medium text-gray-700">Active Tab</p>
              <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(activeTab, null, 2)}
              </pre>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">
                Items ({items.length}) / Filtered ({filteredItems.length})
              </p>
              <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(items.slice(0, 5), null, 2)}
                {items.length > 5 && '\n...'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}