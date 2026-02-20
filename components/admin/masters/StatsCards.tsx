// components/admin/masters/StatsCards.tsx
"use client";

import { Layout, Layers, CheckCircle } from "lucide-react";
import { getTabIcon } from "./table-config";

interface StatsCardsProps {
  activeTab: string;
  totalItems: number;
  activeItems: number;
}

export default function StatsCards({ activeTab, totalItems, activeItems }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Layout className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Current Tab</p>
          <div className="flex items-center gap-1">
            <span className="text-gray-400">{getTabIcon(activeTab)}</span>
            <p className="font-medium text-gray-800">{activeTab}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Layers className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Items</p>
          <p className="font-medium text-gray-800">{totalItems}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
        <div className="p-2 bg-green-50 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Active</p>
          <p className="font-medium text-green-600">{activeItems}</p>
        </div>
      </div>
    </div>
  );
}