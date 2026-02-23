// components/admin/masters/HorizontalTabList.tsx
"use client";

import { getTabIcon } from "./table-config";
import { STATIC_TABS, type TabName } from "@/lib/masterApi";

interface HorizontalTabListProps {
  activeTab: string | null;
  onTabClick: (tabName: string) => void;
  itemCounts?: Record<string, number>;
}

export default function HorizontalTabList({
  activeTab,
  onTabClick,
  itemCounts = {}
}: HorizontalTabListProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center p-1 gap-1 min-w-max">
          {STATIC_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabClick(tab.name)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors
                ${activeTab === tab.name 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span className={activeTab === tab.name ? 'text-white' : 'text-gray-500'}>
                {getTabIcon(tab.name)}
              </span>
              <span>{tab.name}</span>
              {itemCounts[tab.name] > 0 && (
                <span className={`
                  text-xs px-1.5 rounded-full
                  ${activeTab === tab.name 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                  }
                `}>
                  {itemCounts[tab.name]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}