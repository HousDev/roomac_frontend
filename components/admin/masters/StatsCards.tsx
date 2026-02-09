"use client";

import { Tag, CheckCircle, FolderOpen } from "lucide-react";
import { getTabIcon } from "./table-config";

interface StatsCardsProps {
  activeTab: string;
  totalTypes: number;
  activeTypes: number;
}

export default function StatsCards({ activeTab, totalTypes, activeTypes }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-md p-4 border border-blue-100 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-blue-100 rounded-lg">
                <div className="text-blue-600 text-xs">📋</div>
              </div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Current Tab</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-gray-600">
                {getTabIcon(activeTab)}
              </div>
              <p className="text-lg font-bold text-gray-800">{activeTab}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-md p-4 border border-purple-100 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-purple-100 rounded-lg">
                <div className="text-purple-600 text-xs">🏷️</div>
              </div>
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Master Types</p>
            </div>
            <p className="text-xl font-bold text-gray-800 mt-1">{totalTypes}</p>
          </div>
          <div className="p-2 bg-purple-100 rounded-xl">
            <Tag className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-md p-4 border border-emerald-100 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-emerald-100 rounded-lg">
                <div className="text-emerald-600 text-xs">✓</div>
              </div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Active Status</p>
            </div>
            <p className="text-xl font-bold text-emerald-600 mt-1">{activeTypes}</p>
          </div>
          <div className="p-2 bg-emerald-100 rounded-xl">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  );
}