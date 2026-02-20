// components/admin/masters/[itemId]/StatsCards.tsx
"use client";

import { Grid, Hash, CheckCircle } from "lucide-react";

interface MasterItem {
  id: number;
  name: string;
  tab_name?: string;
}

interface StatsCardsProps {
  masterItem: MasterItem;
  totalValues: number;
  activeValues: number;
}

export default function StatsCards({ masterItem, totalValues, activeValues }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <div className="bg-white rounded-xl shadow-sm p-4 border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Tab</p>
            <p className="text-lg font-semibold text-gray-800">
              {masterItem.tab_name || 'General'}
            </p>
          </div>
          <div className="p-2 bg-gray-100 rounded-lg">
            <Grid className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-4 border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Values</p>
            <p className="text-lg font-semibold text-gray-800">{totalValues}</p>
          </div>
          <div className="p-2 bg-gray-100 rounded-lg">
            <Hash className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-4 border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Active Values</p>
            <p className="text-lg font-semibold text-green-600">{activeValues}</p>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}