// components/admin/masters/HorizontalTabList.tsx
"use client";

import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { getTabIcon } from "./table-config";

interface Tab {
  id: number;
  name: string;
  item_count: number;
  is_active: number;
}

interface HorizontalTabListProps {
  tabs: Tab[];
  activeTab: Tab | null;
  loading: boolean;
  onTabClick: (tab: Tab) => void;
  onEditTab: (tab: Tab) => void;
  onDeleteTab: (tab: Tab) => void;
}

export default function HorizontalTabList({
  tabs,
  activeTab,
  loading,
  onTabClick,
  onEditTab,
  onDeleteTab
}: HorizontalTabListProps) {
  const [contextMenu, setContextMenu] = useState<{
    tab: Tab;
    x: number;
    y: number;
  } | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-1">
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center p-1 gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabClick(tab)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (activeTab?.id !== tab.id) {
                    setContextMenu({
                      tab,
                      x: e.clientX,
                      y: e.clientY
                    });
                  }
                }}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap
                  ${activeTab?.id === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className={activeTab?.id === tab.id ? 'text-white' : 'text-gray-500'}>
                  {getTabIcon(tab.name)}
                </span>
                <span>{tab.name}</span>
                <span className={`
                  text-xs px-1.5 rounded-full
                  ${activeTab?.id === tab.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                  }
                `}>
                  {tab.item_count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div 
            className="fixed z-50 bg-white rounded-lg shadow-lg border py-1 w-32"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                onEditTab(contextMenu.tab);
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit2 size={14} />
              Edit
            </button>
            <button
              onClick={() => {
                onDeleteTab(contextMenu.tab);
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </>
      )}
    </>
  );
}