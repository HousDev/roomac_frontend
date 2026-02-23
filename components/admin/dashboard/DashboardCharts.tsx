"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  MoreVertical, 
  Filter, 
  ChevronDown, 
  Calendar, 
  X,
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Users,
  TrendingDown,
  FileText,
  Receipt,
  DollarSign,
  Check
} from 'lucide-react';
// Import LineChart from a different path to avoid the duplicate export issue
// import { LineChart as LineChartIcon } from 'lucide-react/dist/esm/icons/chart-line';
import { LineChart as LineChartIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardStats as DashboardStatsType, FilterState } from './types';

interface DashboardChartsProps {
  stats: DashboardStatsType;
  filterState: FilterState;
  updateFilter: (updates: Partial<FilterState>) => void;
  openFinancialTrend: () => void;
}

export default function DashboardCharts({
  stats,
  filterState,
  updateFilter,
  openFinancialTrend
}: DashboardChartsProps) {
  const [showFilter, setShowFilter] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [animatedHeights, setAnimatedHeights] = useState<number[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showComparisonDropdown, setShowComparisonDropdown] = useState(false);

  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const allAvailableYears = [2024, 2023, 2022, 2021, 2020];

  // Tent stats
  const tentStats = {
    active: 15,
    inactive: 5,
    total: 20
  };
  
  const tentOccupancyPercent = Math.round((tentStats.active / tentStats.total) * 100);
  
  // Room stats
  const roomStats = {
    active: 25,
    inactive: 10,
    total: 35
  };
  
  const roomOccupancyPercent = Math.round((roomStats.active / roomStats.total) * 100);
  
  // Property stats
  const propertyStats = {
    active: 8,
    inactive: 2,
    total: 10
  };
  
  const propertyOccupancyPercent = Math.round((propertyStats.active / propertyStats.total) * 100);
  
  // Expense stats
  const expenseStats = {
    total: Math.round(stats.monthlyRevenue * 0.6),
    fixed: Math.round(stats.monthlyRevenue * 0.3),
    variable: Math.round(stats.monthlyRevenue * 0.3),
    ratio: 70
  };
  
  // Income stats
  const incomeStats = {
    total: stats.monthlyRevenue,
    rental: Math.round(stats.monthlyRevenue * 0.85),
    other: Math.round(stats.monthlyRevenue * 0.15),
    ratio: 85
  };

  // Occupancy percent
  const occupancyPercent = stats.totalBeds > 0 ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;

  // Rent activity data
  const rentActivityData = useMemo(() => [
    { month: 'Jan', amount: 45000000 },
    { month: 'Feb', amount: 52000000 },
    { month: 'Mar', amount: 48000000 },
    { month: 'Apr', amount: 61000000 },
    { month: 'May', amount: 55000000 },
    { month: 'Jun', amount: 68000000 },
  ], []);

  // Comparison data
  const comparisonData = useMemo(() => {
    const currentYearData = rentActivityData;
    const previousYearData = [
      { month: 'Jan', amount: 38000000 },
      { month: 'Feb', amount: 42000000 },
      { month: 'Mar', amount: 45000000 },
      { month: 'Apr', amount: 52000000 },
      { month: 'May', amount: 48000000 },
      { month: 'Jun', amount: 60000000 },
    ];

    switch (filterState.comparisonMode) {
      case '2year':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            { data: currentYearData, label: `${typeof filterState.selectedYear === 'number' ? filterState.selectedYear : new Date().getFullYear()}`, color: 'from-blue-600 to-blue-400' },
            { data: previousYearData, label: `${(typeof filterState.selectedYear === 'number' ? filterState.selectedYear : new Date().getFullYear()) - 1}`, color: 'from-green-600 to-green-400' }
          ],
          isComparison: true
        };
      case 'custom':
        return {
          labels: ['Jan', 'Jun'],
          datasets: [
            { data: [{ month: 'Jan', amount: 35000000 }, { month: 'Jun', amount: 62000000 }], label: '2024', color: 'from-purple-600 to-purple-400' }
          ],
          isComparison: false
        };
      default:
        return {
          labels: currentYearData.map(d => d.month),
          datasets: [
            { data: currentYearData, label: filterState.selectedYear === 'all' ? 'All Years' : `${filterState.selectedYear}`, color: 'from-blue-600 to-blue-400' }
          ],
          isComparison: false
        };
    }
  }, [filterState.comparisonMode, filterState.selectedYear, rentActivityData]);

  const allAmounts = useMemo(() => 
    comparisonData.datasets.flatMap(dataset => 
      dataset.data.map(d => d.amount)
    ), [comparisonData]
  );

  const maxAmount = allAmounts.length > 0 ? Math.max(...allAmounts) : 1;

  // Animation effect
  useEffect(() => {
    setAnimatedHeights([]);
    const timers = rentActivityData.map((_, index) => {
      return setTimeout(() => {
        setAnimatedHeights(prev => {
          if (!prev.includes(index)) {
            return [...prev, index];
          }
          return prev;
        });
      }, index * 150);
    });
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [rentActivityData]);

  // Filter functions
  const applyRentActivityFilters = useCallback(() => {
    setShowFilterPanel(false);
    setShowComparisonDropdown(false);
  }, [filterState]);

  const resetAllRentFilters = useCallback(() => {
    updateFilter({
      selectedMonth: 'January',
      selectedYear: 'all',
      selectedDate: null,
      comparisonMode: '1year',
      selectedYear1: '',
      selectedYear2: '',
      firstMonth: '',
      firstYear: '',
      secondMonth: '',
      secondYear: ''
    });
    console.log('All filters reset');
  }, [updateFilter]);

  return (
    <>
      {/* Occupancy Overview Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-700">
              {filterState.selectedType === 'tents' ? 'Tents Overview' : 
               filterState.selectedType === 'rooms' ? 'Rooms Overview' : 
               filterState.selectedType === 'property' ? 'Property Overview' : 
               filterState.selectedType === 'expenses' ? 'Expenses Overview' :
               filterState.selectedType === 'income' ? 'Income Overview' :
               'Occupancy Overview'}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowFilter(!showFilter);
                    if (showTypeMenu) setShowTypeMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
                >
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="whitespace-nowrap">
                    {filterState.selectedMonth.substring(0, 3)} , {filterState.selectedYear === 'all' ? 'All Years' : filterState.selectedYear}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-blue-700 transition-transform duration-200 ${showFilter ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Filter Dropdown */}
                {showFilter && (
                  <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-30">
                    <div className="p-2 border-b border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-800">
                        Filter Dates
                      </h4>
                    </div>

                    <div className="p-2 space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <select
                            value={filterState.selectedMonth}
                            onChange={(e) => updateFilter({ selectedMonth: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
                          >
                            {allMonths.map(month => (
                              <option key={month} value={month}>{month.substring(0, 3)}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex-1 relative">
                          <select
                            value={filterState.selectedYear}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateFilter({ 
                                selectedYear: value === 'all' ? 'all' : parseInt(value)
                              });
                            }}
                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white appearance-none"
                          >
                            <option value="all">All Years</option>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-700">
                            <ChevronDown className="w-3 h-3" />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const today = new Date();
                            updateFilter({
                              selectedMonth: allMonths[today.getMonth()],
                              selectedYear: today.getFullYear()
                            });
                            setShowFilter(false);
                          }}
                          className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Today
                        </button>
                        
                        <button
                          onClick={() => {
                            updateFilter({
                              selectedMonth: 'January',
                              selectedYear: 'all'
                            });
                          }}
                          className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Reset
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowFilter(false);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Type Selector */}
              <div className="flex items-center gap-2">
                {filterState.selectedType && (
                  <button
                    onClick={() => updateFilter({ selectedType: '' })}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 border border-grey-300 rounded-lg text-white transition-colors shadow-sm text-xs font-medium"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                  </button>
                )}
                
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowTypeMenu(!showTypeMenu);
                      if (showFilter) setShowFilter(false);
                    }}
                    className="flex items-center justify-center w-8 h-8 bg-blue-700 border border-gray-300 rounded-lg text-white hover:bg-blue-500 transition-colors shadow-sm"
                  >
                    <MoreVertical className="w-5 h-4" />
                  </button>
                  
                  {/* Type Menu Dropdown */}
                  {showTypeMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                      <div className="p-2.5">
                        <div className="grid grid-cols-3 gap-1.5">
                          {/* Tents */}
                          <button 
                            className="w-full p-1.5 text-gray-800 hover:bg-blue-50 rounded-lg transition-all duration-150 flex flex-col items-center gap-1 group"
                            onClick={() => {
                              updateFilter({ selectedType: 'tents' });
                              setShowTypeMenu(false);
                            }}
                          >
                            <div className="w-7 h-7 flex items-center justify-center bg-blue-100 rounded-full group-hover:scale-110 transition-transform duration-200">
                              <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                              </svg>
                            </div>
                            <span className="text-[10px] font-semibold text-gray-800">Tents</span>
                          </button>
                          
                          {/* Rooms */}
                          <button 
                            className="w-full p-1.5 text-gray-800 hover:bg-emerald-50 rounded-lg transition-all duration-150 flex flex-col items-center gap-1 group"
                            onClick={() => {
                              updateFilter({ selectedType: 'rooms' });
                              setShowTypeMenu(false);
                            }}
                          >
                            <div className="w-7 h-7 flex items-center justify-center bg-emerald-100 rounded-full group-hover:scale-110 transition-transform duration-200">
                              <svg className="w-3.5 h-3.5 text-emerald-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                              </svg>
                            </div>
                            <span className="text-[10px] font-semibold text-gray-800">Rooms</span>
                          </button>
                          
                          {/* Property */}
                          <button 
                            className="w-full p-1.5 text-gray-800 hover:bg-violet-50 rounded-lg transition-all duration-150 flex flex-col items-center gap-1 group"
                            onClick={() => {
                              updateFilter({ selectedType: 'property' });
                              setShowTypeMenu(false);
                            }}
                          >
                            <div className="w-7 h-7 flex items-center justify-center bg-violet-100 rounded-full group-hover:scale-110 transition-transform duration-200">
                              <svg className="w-3.5 h-3.5 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                              </svg>
                            </div>
                            <span className="text-[10px] font-semibold text-gray-800">Property</span>
                          </button>
                          
                          {/* Expenses */}
                          <button 
                            className="w-full p-1.5 text-gray-800 hover:bg-amber-50 rounded-lg transition-all duration-150 flex flex-col items-center gap-1 group"
                            onClick={() => {
                              updateFilter({ selectedType: 'expenses' });
                              setShowTypeMenu(false);
                            }}
                          >
                            <div className="w-7 h-7 flex items-center justify-center bg-amber-100 rounded-full group-hover:scale-110 transition-transform duration-200">
                              <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                              </svg>
                            </div>
                            <span className="text-[10px] font-semibold text-gray-800">Expenses</span>
                          </button>
                          
                          {/* Income */}
                          <button 
                            className="w-full p-1.5 text-gray-800 hover:bg-green-50 rounded-lg transition-all duration-150 flex flex-col items-center gap-1 group"
                            onClick={() => {
                              updateFilter({ selectedType: 'income' });
                              setShowTypeMenu(false);
                            }}
                          >
                            <div className="w-7 h-7 flex items-center justify-center bg-green-100 rounded-full group-hover:scale-110 transition-transform duration-200">
                              <svg className="w-3.5 h-3.5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            </div>
                            <span className="text-[10px] font-semibold text-gray-800">Income</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col items-center">
              {/* Chart Image based on selected type */}
              <div className="relative w-40 h-40 mb-6">
                {filterState.selectedType === 'tents' ? (
                  // Tents Chart
                  <>
                    <div className="absolute inset-0 rounded-full bg-green-300"></div>
                    <div className="absolute inset-0 rounded-full">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(
                            #10B981 ${tentOccupancyPercent * 3.6}deg,
                            transparent 0deg
                          )`
                        }}
                      />
                    </div>
                    <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center ">
                      <span className="text-3xl font-bold text-slate-800">
                        {tentOccupancyPercent}%
                      </span>
                      <span className="text-sm text-gray-500 mt-1">Occupied Tents</span>
                    </div>
                  </>
                ) : filterState.selectedType === 'rooms' ? (
                  // Rooms Chart
                  <>
                    <div className="absolute inset-0 rounded-full bg-purple-300"></div>
                    <div className="absolute inset-0 rounded-full">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(
                            #8B5CF6 ${roomOccupancyPercent * 3.6}deg,
                            transparent 0deg
                          )`
                        }}
                      />
                    </div>
                    <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-slate-800">
                        {roomOccupancyPercent}%
                      </span>
                      <span className="text-sm text-gray-500 mt-1 ml-4">Occupied Rooms</span>
                    </div>
                  </>
                ) : filterState.selectedType === 'property' ? (
                  // Property Chart
                  <>
                    <div className="absolute inset-0 rounded-full bg-red-300"></div>
                    <div className="absolute inset-0 rounded-full">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(
                            #EF4444 ${propertyOccupancyPercent * 3.6}deg,
                            transparent 0deg
                          )`
                        }}
                      />
                    </div>
                    <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-slate-800">
                        {propertyOccupancyPercent}%
                      </span>
                      <span className="text-sm text-gray-500 ml-4">Occupied Property</span>
                    </div>
                  </>
                ) : filterState.selectedType === 'expenses' ? (
                  // Expenses Chart
                  <>
                    <div className="absolute inset-0 rounded-full bg-orange-300"></div>
                    <div className="absolute inset-0 rounded-full">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(
                            #EF4444 ${expenseStats.ratio * 3.6}deg,
                            transparent 0deg
                          )`
                        }}
                      />
                    </div>
                    <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-slate-800">
                        {expenseStats.ratio}%
                      </span>
                      <span className="text-sm text-gray-500 mt-1">Expenses Ratio</span>
                    </div>
                  </>
                ) : filterState.selectedType === 'income' ? (
                  // Income Chart
                  <>
                    <div className="absolute inset-0 rounded-full bg-green-300"></div>
                    <div className="absolute inset-0 rounded-full">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(
                            #10B981 ${incomeStats.ratio * 3.6}deg,
                            transparent 0deg
                          )`
                        }}
                      />
                    </div>
                    <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-slate-800">
                        {incomeStats.ratio}%
                      </span>
                      <span className="text-sm text-gray-500 mt-1">Income Ratio</span>
                    </div>
                  </>
                ) : (
                  // Default Beds Chart
                  <>
                    <div className="absolute inset-0 rounded-full bg-yellow-300"></div>
                    <div className="absolute inset-0 rounded-full">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(
                            #3B82F6 ${occupancyPercent * 3.6}deg,
                            transparent 0deg
                          )`
                        }}
                      />
                    </div>
                    <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-slate-800">
                        {occupancyPercent}%
                      </span>
                      <span className="text-sm text-gray-500 mt-1">Occupied</span>
                    </div>
                  </>
                )}
              </div>

              {/* Active/Inactive Status Section */}
              {filterState.selectedType === 'tents' ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Active Tents</p>
                        <p className="text-xs text-gray-500">Currently occupied</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-green-600">{tentStats.active}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Inactive Tents</p>
                        <p className="text-xs text-gray-500">Vacant or closed</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-red-600">{tentStats.inactive}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Tents</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{tentStats.total}</p>
                  </div>
                </div>
              ) : filterState.selectedType === 'rooms' ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Active Rooms</p>
                        <p className="text-xs text-gray-500">Currently occupied</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-purple-600">{roomStats.active}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Inactive Rooms</p>
                        <p className="text-xs text-gray-500">Vacant or closed</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-orange-600">{roomStats.inactive}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Rooms</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{roomStats.total}</p>
                  </div>
                </div>
              ) : filterState.selectedType === 'property' ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Active Properties</p>
                        <p className="text-xs text-gray-500">Currently occupied</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-red-600">{propertyStats.active}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Inactive Properties</p>
                        <p className="text-xs text-gray-500">Vacant or closed</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-blue-600">{propertyStats.inactive}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Properties</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{propertyStats.total}</p>
                  </div>
                </div>
              ) : filterState.selectedType === 'expenses' ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Monthly Expenses</p>
                        <p className="text-xs text-gray-500">Total spent this month</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-red-600">₹{expenseStats.total.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Fixed Costs</p>
                        <p className="text-xs text-gray-500">Rent, utilities, etc.</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-orange-600">₹{expenseStats.fixed.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Variable Costs</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gray-800">₹{expenseStats.variable.toLocaleString()}</p>
                  </div>
                </div>
              ) : filterState.selectedType === 'income' ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Monthly Income</p>
                        <p className="text-xs text-gray-500">Total earned this month</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-green-600">₹{incomeStats.total.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Rental Income</p>
                        <p className="text-xs text-gray-500">From tenants</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-blue-600">₹{incomeStats.rental.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Other Income</p>
                        <p className="text-xs text-gray-500">Services, fees, etc.</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-purple-600">₹{incomeStats.other.toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                // Default Beds view
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Occupied Beds</p>
                        <p className="text-xs text-gray-500">Currently in use</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-blue-600">{stats.occupiedBeds}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Available Beds</p>
                        <p className="text-xs text-gray-500">Ready for occupancy</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-yellow-600">
                      {Math.max(0, stats.totalBeds - stats.occupiedBeds)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Beds</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{stats.totalBeds}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      
      {/* Rent Activity Card */}
      <Card className="border-0 shadow-lg lg:col-span-2 relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setShowComparisonDropdown(!showComparisonDropdown)}
                  className="p-2 hover:bg-blue-50 rounded-lg"
                >
                  <MoreVertical className="w-5 h-5 text-blue-600" />
                </button>
                
                {showComparisonDropdown && (
                  <div className="absolute left-0 top-10 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">Compare Data</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Select comparison type</p>
                        </div>
                        <button
                          onClick={() => setShowComparisonDropdown(false)}
                          className="p-1 hover:bg-gray-100 rounded-lg"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={openFinancialTrend}
                          className="flex-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-700 rounded-lg text-xs font-medium border border-blue-200 flex items-center justify-center gap-1.5"
                        >
                          <LineChartIcon className="w-3.5 h-3.5" />
                          <span>Trends</span>
                        </button>
                        
                        <button
                          onClick={resetAllRentFilters}
                          className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium border border-gray-300 flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-3 space-y-3 max-h-[320px] overflow-y-auto">
                      {/* 1 Year View */}
                      <button
                        onClick={() => {
                          updateFilter({ comparisonMode: '1year' });
                          setShowComparisonDropdown(false);
                          setTimeout(() => {
                            applyRentActivityFilters();
                          }, 100);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          filterState.comparisonMode === '1year'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span>Single Year</span>
                          </div>
                          {filterState.comparisonMode === '1year' && <Check className="w-3.5 h-3.5 text-blue-500" />}
                        </div>
                      </button>

                      {/* 2 Year Comparison */}
                      <div className="space-y-2">
                        <button
                          onClick={() => updateFilter({ comparisonMode: filterState.comparisonMode === '2year' ? '1year' : '2year' })}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                            filterState.comparisonMode === '2year'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              </div>
                              <span>Compare Years</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filterState.comparisonMode === '2year' ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        
                        {filterState.comparisonMode === '2year' && (
                          <div className="p-3 bg-green-50/30 rounded-lg border border-green-100 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Year 1</label>
                                <div className="relative">
                                  <select
                                    value={filterState.selectedYear1 || ""}
                                    onChange={(e) => updateFilter({ selectedYear1: e.target.value })}
                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white appearance-none"
                                  >
                                    <option value="">Choose year</option>
                                    {allAvailableYears.map(year => (
                                      <option key={year} value={year}>{year}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Year 2</label>
                                <div className="relative">
                                  <select
                                    value={filterState.selectedYear2 || ""}
                                    onChange={(e) => updateFilter({ selectedYear2: e.target.value })}
                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white appearance-none"
                                  >
                                    <option value="">Choose year</option>
                                    {allAvailableYears.map(year => (
                                      <option key={year} value={year}>{year}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => {
                                if (filterState.selectedYear1 && filterState.selectedYear2) {
                                  applyRentActivityFilters();
                                }
                              }}
                              className="w-full px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                              disabled={!filterState.selectedYear1 || !filterState.selectedYear2}
                            >
                              Apply Filter
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Compare 2 Months */}
                      <div className="space-y-2">
                        <button
                          onClick={() => updateFilter({ comparisonMode: filterState.comparisonMode === 'custom' ? '1year' : 'custom' })}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                            filterState.comparisonMode === 'custom'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                              <span>Compare Months</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filterState.comparisonMode === 'custom' ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        
                        {filterState.comparisonMode === 'custom' && (
                          <div className="bg-purple-50/30 rounded-lg border border-purple-100">
                            <div className="p-3 space-y-3">
                              {/* Month Selection Form */}
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-700">
                                  <div>Month 1</div>
                                  <div>Month 2</div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <select
                                    value={filterState.firstMonth || ""}
                                    onChange={(e) => updateFilter({ firstMonth: e.target.value })}
                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
                                  >
                                    <option value="">Select Month</option>
                                    {allMonths.map(month => (
                                      <option key={`first-${month}`} value={month}>{month.substring(0, 3)}</option>
                                    ))}
                                  </select>
                                  
                                  <select
                                    value={filterState.secondMonth || ""}
                                    onChange={(e) => updateFilter({ secondMonth: e.target.value })}
                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
                                  >
                                    <option value="">Select Month</option>
                                    {allMonths.map(month => (
                                      <option key={`second-${month}`} value={month}>{month.substring(0, 3)}</option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <select
                                    value={filterState.firstYear || ""}
                                    onChange={(e) => updateFilter({ firstYear: e.target.value })}
                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
                                  >
                                    <option value="">Year</option>
                                    {allAvailableYears.map(year => (
                                      <option key={`first-${year}`} value={year}>{year}</option>
                                    ))}
                                  </select>
                                  
                                  <select
                                    value={filterState.secondYear || ""}
                                    onChange={(e) => updateFilter({ secondYear: e.target.value })}
                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
                                  >
                                    <option value="">Year</option>
                                    {allAvailableYears.map(year => (
                                      <option key={`second-${year}`} value={year}>{year}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => {
                                    updateFilter({
                                      firstMonth: '',
                                      firstYear: '',
                                      secondMonth: '',
                                      secondYear: ''
                                    });
                                  }}
                                  className="flex-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium"
                                >
                                  Clear
                                </button>
                                
                                <button
                                  onClick={() => {
                                    const today = new Date();
                                    const currentMonth = allMonths[today.getMonth()];
                                    const currentYear = today.getFullYear().toString();
                                    
                                    updateFilter({
                                      firstMonth: currentMonth,
                                      firstYear: currentYear
                                    });
                                    
                                    const prevMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
                                    const prevMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
                                    updateFilter({
                                      secondMonth: allMonths[prevMonth],
                                      secondYear: prevMonthYear.toString()
                                    });
                                    
                                    setTimeout(() => {
                                      applyRentActivityFilters();
                                    }, 100);
                                  }}
                                  className="flex-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium"
                                >
                                  Recent
                                </button>
                                
                                <button
                                  onClick={() => {
                                    if (filterState.firstMonth && filterState.firstYear && filterState.secondMonth && filterState.secondYear) {
                                      applyRentActivityFilters();
                                    }
                                  }}
                                  className="flex-1 px-2 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  disabled={!filterState.firstMonth || !filterState.firstYear || !filterState.secondMonth || !filterState.secondYear}
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Rent Activity Over Time
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Showing:</span>
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {filterState.comparisonMode === '1year' && (filterState.selectedYear === 'all' ? 'All Years' : `${filterState.selectedYear}`)}
                      {filterState.comparisonMode === '2year' && `${filterState.selectedYear1 || 'Year 1'} vs ${filterState.selectedYear2 || 'Year 2'}`}
                      {filterState.comparisonMode === 'custom' && `${filterState.firstMonth ? filterState.firstMonth.substring(0, 3) : '___'} ${filterState.firstYear || ''} vs ${filterState.secondMonth ? filterState.secondMonth.substring(0, 3) : '___'} ${filterState.secondYear || ''}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors group relative"
            >
              <Filter className="w-5 h-5 text-blue-600" />
              {showFilterPanel && (
                <div className="absolute -top-2 -right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </button>
          </div>
        </CardHeader>
        
        <div className="flex relative">
          <div className={`transition-all duration-300 ${showFilterPanel ? 'w-3/4 pr-4' : 'w-full'}`}>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Amount (₹)</span>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">+12.5%</span>
                  </div>
                </div>

                {filterState.comparisonMode === '2year' && (
                  <div className="flex items-center gap-4">
                    {comparisonData.datasets.map((dataset, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          idx === 0 ? 'bg-blue-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-xs font-medium text-gray-700">{dataset.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative h-52">
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="border-t border-gray-200"></div>
                    ))}
                  </div>

                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                    <span className="font-medium">₹{maxAmount.toLocaleString()}</span>
                    <span>₹{Math.round(maxAmount * 0.75).toLocaleString()}</span>
                    <span>₹{Math.round(maxAmount * 0.5).toLocaleString()}</span>
                    <span>₹{Math.round(maxAmount * 0.25).toLocaleString()}</span>
                    <span className="font-medium">₹0</span>
                  </div>

                  <div className="absolute bottom-0 left-10 right-2 h-44 flex items-end justify-between">
                    {comparisonData.labels.map((label, index) => {
                      if (filterState.comparisonMode === '2year') {
                        const dataset1 = comparisonData.datasets[0];
                        const dataset2 = comparisonData.datasets[1];
                        const item1 = dataset1.data[index];
                        const item2 = dataset2.data[index];
                        const height1 = (item1.amount / maxAmount) * 85;
                        const height2 = (item2.amount / maxAmount) * 85;
                        const isAnimated = animatedHeights.includes(index);
                        
                        return (
                          <div key={index} className="flex flex-col items-center flex-1 mx-1">
                            <div className="relative h-44 w-full flex items-end justify-center">
                              <div className="flex items-end justify-center w-full gap-1">
                                <div 
                                  className="w-6 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg relative "
                                  style={{ 
                                    height: isAnimated ? `${height1}%` : '0%',
                                    minHeight: isAnimated ? '20px' : '0px',
                                    transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), min-height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                  }}
                                >
                                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    <div className="font-semibold">₹{item1.amount.toLocaleString()}</div>
                                    <div className="text-gray-300 text-xs">{dataset1.label}</div>
                                  </div>
                                </div>
                                
                                <div 
                                  className="w-6 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg relative group hover:opacity-90 "
                                  style={{ 
                                    height: isAnimated ? `${height2}%` : '0%',
                                    minHeight: isAnimated ? '20px' : '0px',
                                    transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), min-height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                  }}
                                >
                                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    <div className="font-semibold">₹{item2.amount.toLocaleString()}</div>
                                    <div className="text-gray-300 text-xs">{dataset2.label}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <span className="text-sm font-medium text-gray-700 mt-2">
                              {label}
                            </span>
                          </div>
                        );
                      }
                      
                      const dataset = comparisonData.datasets[0];
                      const item = dataset.data[index];
                      const height = (item.amount / maxAmount) * 85;
                      const isAnimated = animatedHeights.includes(index);
                      
                      return (
                        <div key={index} className="flex flex-col items-center flex-1 mx-1">
                          <div className="relative h-44 w-full flex items-end justify-center">
                            <div 
                              className={`w-14 bg-gradient-to-t ${dataset.color} rounded-t-lg relative group hover:opacity-90 hover:shadow-lg`}
                              style={{ 
                                height: isAnimated ? `${height}%` : '0%',
                                minHeight: isAnimated ? '20px' : '0px',
                                transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), min-height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                              }}
                            >
                              <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                                  <div className="font-semibold">₹{item.amount.toLocaleString()}</div>
                                  <div className="text-gray-300 text-xs">{item.month}</div>
                              </div>
                            </div>
                          </div>
                          
                          <span className="text-sm font-medium text-gray-700 mt-2">
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <span className="text-sm font-medium text-gray-700">Months</span>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        {filterState.comparisonMode === '1year' ? (filterState.selectedYear === 'all' ? 'All Years' : 'Current Year') : 
                        filterState.comparisonMode === '2year' ? 'Current Year' : 'Custom Range'}
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        ₹{comparisonData.datasets[0]?.data[comparisonData.datasets[0].data.length - 1]?.amount?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Average</p>
                      <p className="text-lg font-bold text-gray-800">
                        {comparisonData.datasets.map((dataset, idx) => {
                          const avg = dataset.data.length > 0 
                            ? Math.round(dataset.data.reduce((sum, d) => sum + d.amount, 0) / dataset.data.length)
                            : 0;
                          return (
                            <div key={idx} className={idx > 0 ? 'mt-1' : ''}>
                              ₹{avg.toLocaleString()} {comparisonData.datasets.length > 1 && `(${dataset.label})`}
                            </div>
                          );
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>

          {/* Filter Panel */}
          <div 
            className={`absolute right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
              showFilterPanel ? 'w-1/4 translate-x-0' : 'w-0 translate-x-full'
            }`}
          >
            <div className="h-full overflow-y-auto p-4">
              <div className="mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Filter className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">Filter Analytics</h3>
                      <p className="text-xs text-gray-500">Customize your view</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Actions</h4>
                <div className="space-y-2">
                  <button 
                    onClick={applyRentActivityFilters}
                    className="w-full px-1 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                  <button 
                    onClick={resetAllRentFilters}
                    className="w-full px-1 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors"
                  >
                    Reset All
                  </button>
                </div>
              </div>

              <div className="mt-4 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-medium text-blue-800 mb-1">Active Filters</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Year:</span>
                    <span className="text-xs font-medium text-blue-700">
                      {filterState.selectedYear === 'all' ? 'All Years' : filterState.selectedYear}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Month:</span>
                    <span className="text-xs font-medium text-blue-700">{filterState.selectedMonth}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Mode:</span>
                    <span className="text-xs font-medium text-blue-700">{filterState.comparisonMode}</span>
                  </div>
                  {filterState.comparisonMode === '2year' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Year 1:</span>
                        <span className="text-xs font-medium text-blue-700">{filterState.selectedYear1 || 'Not selected'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Year 2:</span>
                        <span className="text-xs font-medium text-blue-700">{filterState.selectedYear2 || 'Not selected'}</span>
                      </div>
                    </>
                  )}
                  {filterState.comparisonMode === 'custom' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Month 1:</span>
                        <span className="text-xs font-medium text-blue-700">{filterState.firstMonth ? `${filterState.firstMonth.substring(0, 3)} ${filterState.firstYear}` : 'Not selected'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Month 2:</span>
                        <span className="text-xs font-medium text-blue-700">{filterState.secondMonth ? `${filterState.secondMonth.substring(0, 3)} ${filterState.secondYear}` : 'Not selected'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}