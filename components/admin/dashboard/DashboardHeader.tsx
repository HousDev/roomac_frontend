"use client";

import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { FilterState } from './types';

interface DashboardHeaderProps {
  filterState: FilterState;
  updateFilter: (updates: Partial<FilterState>) => void;
  openFinancialTrend: () => void;
  refreshData: () => Promise<void>;
}

export default function DashboardHeader({
  filterState,
  updateFilter,
  openFinancialTrend,
  refreshData
}: DashboardHeaderProps) {
  return (
    <Card className="border-0 shadow-lg mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
            <p className="text-sm text-slate-600">
              {filterState.selectedMonth}, {filterState.selectedYear === 'all' ? 'All Years' : filterState.selectedYear}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={openFinancialTrend}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              View Trends
            </button>
            
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}