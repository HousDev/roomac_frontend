"use client";

import { useState, useEffect, useCallback } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import DashboardCharts from './DashboardCharts';
import FinancialTrendChart from './FinancialTrendChart';
import { DashboardStats as DashboardStatsType, FilterState, FinancialTab, ChartType } from './types';
import { useDashboardData } from './useDashboardData';

interface DashboardClientProps {
  initialData?: DashboardStatsType; // Make it optional
}

// Default stats to prevent undefined errors
const defaultStats: DashboardStatsType = {
  monthlyRevenue: 0,
  totalUsers: 0,
  activeUsers: 0,
  newUsers: 0,
  userGrowth: 0,
  revenueGrowth: 0,
  activeUsersGrowth: 0,
  newUsersGrowth: 0,
  totalProperties: 0,
  totalRooms: 0,
  totalBeds: 0,
  occupiedBeds: 0,
  totalTenants: 0,
  activeTenants: 0
};

export default function DashboardClient({ initialData }: DashboardClientProps) {
  // Use initialData if provided, otherwise use defaultStats
  const [stats, setStats] = useState<DashboardStatsType>(initialData || defaultStats);
  const [loading, setLoading] = useState(false);
  const [showFinancialTrend, setShowFinancialTrend] = useState(false);
  
  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    selectedYear: 'all',
    selectedMonth: 'January',
    selectedDate: null,
    comparisonMode: '1year',
    selectedYear1: '',
    selectedYear2: '',
    firstMonth: '',
    firstYear: '',
    secondMonth: '',
    secondYear: '',
    occupancyDateFilter: 'today',
    occupancySelectedDate: new Date(),
    financialTab: 'all',
    chartType: 'area',
    financialYear: 'all',
    financialMonth: 'January',
    selectedType: ''
  });

  // Use custom hook for data fetching
  const { refreshData } = useDashboardData(setStats, setLoading);

  // Update filter state
  const updateFilter = useCallback((updates: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...updates }));
  }, []);

  // Open financial trend modal
  const openFinancialTrend = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      financialYear: prev.selectedYear,
      financialMonth: prev.selectedMonth
    }));
    setShowFinancialTrend(true);
  }, []);

  // Close financial trend modal
  const closeFinancialTrend = useCallback(() => {
    setShowFinancialTrend(false);
  }, []);

  // Handle financial tab change
  const handleFinancialTabChange = useCallback((tab: FinancialTab) => {
    updateFilter({ financialTab: tab });
  }, [updateFilter]);

  // Handle chart type change
  const handleChartTypeChange = useCallback((type: ChartType) => {
    updateFilter({ chartType: type });
  }, [updateFilter]);

  // Handle financial year change
  const handleFinancialYearChange = useCallback((year: number | 'all') => {
    updateFilter({ financialYear: year });
  }, [updateFilter]);

  // Calculate financial summary - Add null check
  const financialSummary = {
    income: stats?.monthlyRevenue || 0,
    expense: Math.round((stats?.monthlyRevenue || 0) * 0.6),
    netProfit: Math.round((stats?.monthlyRevenue || 0) * 0.4)
  };

  return (
    <>
      {showFinancialTrend && (
        <FinancialTrendChart 
          summary={financialSummary}
          activeTab={filterState.financialTab}
          chartType={filterState.chartType}
          selectedYear={filterState.financialYear}
          selectedMonth={filterState.financialMonth}
          onTabChange={handleFinancialTabChange}
          onChartTypeChange={handleChartTypeChange}
          onYearChange={handleFinancialYearChange}
          onClose={closeFinancialTrend}
        />
      )}

      <DashboardHeader 
        filterState={filterState}
        updateFilter={updateFilter}
        openFinancialTrend={openFinancialTrend}
        refreshData={refreshData}
      />

      <div className="mb-6">
        <DashboardStats 
          stats={stats}
          filterState={filterState}
          updateFilter={updateFilter}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCharts 
          stats={stats}
          filterState={filterState}
          updateFilter={updateFilter}
          openFinancialTrend={openFinancialTrend}
        />
      </div>
    </>
  );
}