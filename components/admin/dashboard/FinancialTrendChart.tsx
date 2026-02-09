"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  Line,
  BarChart,
  Bar,
  LineChart
} from 'recharts';
import {
  X, Filter, Check, ChevronDown, TrendingUp, TrendingDown,
  DollarSign, RefreshCw, LineChart as LineChartIcon, BarChart3
} from 'lucide-react';
import { FinancialTab, ChartType, MonthlySummary } from './types';

interface FinancialTrendChartProps {
  summary: MonthlySummary;
  activeTab: FinancialTab;
  chartType: ChartType;
  selectedYear: number | 'all';
  selectedMonth: string;
  onTabChange: (tab: FinancialTab) => void;
  onChartTypeChange: (type: ChartType) => void;
  onYearChange: (year: number | 'all') => void;
  onClose: () => void;
}

export default function FinancialTrendChart({
  summary,
  activeTab,
  chartType,
  selectedYear,
  selectedMonth,
  onTabChange,
  onChartTypeChange,
  onYearChange,
  onClose
}: FinancialTrendChartProps) {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'1year' | '2year' | '2month'>('1year');
  const [selectedYear1, setSelectedYear1] = useState<string>('2024');
  const [selectedYear2, setSelectedYear2] = useState<string>('2023');
  const [firstMonth, setFirstMonth] = useState<string>('January');
  const [firstYear, setFirstYear] = useState<string>('2024');
  const [secondMonth, setSecondMonth] = useState<string>('June');
  const [secondYear, setSecondYear] = useState<string>('2024');
  const [filteredTrendData, setFilteredTrendData] = useState<any[]>([]);
  const [chartTitle, setChartTitle] = useState("Financial Trend Analysis");

  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const availableYears = [2022, 2023, 2024, 2025, 2026];

  // Get base trend data
  const getBaseTrendData = useCallback(() => {
    return [
      // 2024 Data
      { month: 'Jan', year: 2024, income: 382500, expense: 331500, profit: 51000 },
      { month: 'Feb', year: 2024, income: 420000, expense: 310000, profit: 110000 },
      { month: 'Mar', year: 2024, income: 480000, expense: 340000, profit: 140000 },
      { month: 'Apr', year: 2024, income: 450000, expense: 390000, profit: 60000 },
      { month: 'May', year: 2024, income: 520000, expense: 330000, profit: 190000 },
      { month: 'Jun', year: 2024, income: 580000, expense: 410000, profit: 170000 },
      
      // 2023 Data
      { month: 'Jan', year: 2023, income: 325125, expense: 281775, profit: 43350 },
      { month: 'Feb', year: 2023, income: 357000, expense: 263500, profit: 93500 },
      { month: 'Mar', year: 2023, income: 408000, expense: 289000, profit: 119000 },
      { month: 'Apr', year: 2023, income: 382500, expense: 331500, profit: 51000 },
      { month: 'May', year: 2023, income: 442000, expense: 280500, profit: 161500 },
      { month: 'Jun', year: 2023, income: 493000, expense: 348500, profit: 144500 },
      
      // 2022 Data
      { month: 'Jan', year: 2022, income: 267750, expense: 232050, profit: 35700 },
      { month: 'Feb', year: 2022, income: 294000, expense: 217000, profit: 77000 },
      { month: 'Mar', year: 2022, income: 336000, expense: 238000, profit: 98000 },
      { month: 'Apr', year: 2022, income: 315000, expense: 273000, profit: 42000 },
      { month: 'May', year: 2022, income: 364000, expense: 231000, profit: 133000 },
      { month: 'Jun', year: 2022, income: 406000, expense: 287000, profit: 119000 },
    ];
  }, []);

  // Get filtered data
  const getFilteredData = useCallback(() => {
    const baseData = getBaseTrendData();
    
    switch(comparisonMode) {
      case '1year':
        if (selectedYear === 'all') {
          return baseData;
        } else {
          return baseData.filter(item => item.year === selectedYear);
        }
        
      case '2year':
        const year1 = parseInt(selectedYear1 || "2024");
        const year2 = parseInt(selectedYear2 || "2023");
        return baseData.filter(item => item.year === year1 || item.year === year2);
        
      case '2month':
        const month1Abbr = firstMonth.substring(0, 3);
        const month2Abbr = secondMonth.substring(0, 3);
        
        const twoMonthData = baseData.filter(item => {
          const isMonth1 = item.month === month1Abbr && item.year === parseInt(firstYear || "2024");
          const isMonth2 = item.month === month2Abbr && item.year === parseInt(secondYear || "2024");
          return isMonth1 || isMonth2;
        });
        
        return twoMonthData.map(item => ({
          ...item,
          month: item.month === month1Abbr ? 
            `${firstMonth.substring(0, 3)} ${firstYear}` : 
            `${secondMonth.substring(0, 3)} ${secondYear}`
        }));
        
      default:
        return baseData.filter(item => item.year === (selectedYear === 'all' ? 2024 : selectedYear));
    }
  }, [comparisonMode, selectedYear, selectedYear1, selectedYear2, firstMonth, firstYear, secondMonth, secondYear, getBaseTrendData]);

  // Initialize filtered data
  useEffect(() => {
    const data = getFilteredData();
    setFilteredTrendData(data);
    const label = getComparisonLabel();
    setChartTitle(`Financial Trend Analysis - ${label}`);
  }, [getFilteredData]);

  // Get chart data
  const chartData = useMemo(() => {
    return filteredTrendData.map(item => {
      if (activeTab === 'income') return { 
        month: comparisonMode === '2month' ? item.month : `${item.month} ${item.year}`, 
        value: item.income, 
        label: 'Income',
        income: item.income,
        expense: item.expense,
        profit: item.profit,
        year: item.year
      };
      if (activeTab === 'expense') return { 
        month: comparisonMode === '2month' ? item.month : `${item.month} ${item.year}`, 
        value: item.expense, 
        label: 'Expense',
        income: item.income,
        expense: item.expense,
        profit: item.profit,
        year: item.year
      };
      if (activeTab === 'profit') return { 
        month: comparisonMode === '2month' ? item.month : `${item.month} ${item.year}`, 
        value: item.profit, 
        label: 'Profit',
        income: item.income,
        expense: item.expense,
        profit: item.profit,
        year: item.year
      };
      return { 
        ...item, 
        month: comparisonMode === '2month' ? item.month : `${item.month} ${item.year}`,
        income: item.income,
        expense: item.expense,
        profit: item.profit
      };
    });
  }, [filteredTrendData, activeTab, comparisonMode]);

  // Calculate stats
  const totalIncome = useMemo(() => chartData.reduce((sum, item) => sum + item.income, 0), [chartData]);
  const totalExpense = useMemo(() => chartData.reduce((sum, item) => sum + item.expense, 0), [chartData]);
  const totalProfit = useMemo(() => chartData.reduce((sum, item) => sum + item.profit, 0), [chartData]);
  const avgIncome = Math.round(totalIncome / (chartData.length || 1));
  const avgExpense = Math.round(totalExpense / (chartData.length || 1));
  const avgProfit = Math.round(totalProfit / (chartData.length || 1));

  // Get chart colors
  const getChartColors = useCallback(() => {
    switch(activeTab) {
      case 'income': return { stroke: '#10b981', gradient: 'url(#colorIncome)', name: 'Income' };
      case 'expense': return { stroke: '#f43f5e', gradient: 'url(#colorExpense)', name: 'Expense' };
      case 'profit': return { stroke: '#3b82f6', gradient: 'url(#colorProfit)', name: 'Profit' };
      default: return null;
    }
  }, [activeTab]);

  const chartColors = getChartColors();

  // Get comparison label
  const getComparisonLabel = useCallback(() => {
    switch(comparisonMode) {
      case '1year':
        return selectedYear === 'all' ? 'All Years' : `Year ${selectedYear}`;
      case '2year':
        return `Compare ${selectedYear1} vs ${selectedYear2}`;
      case '2month':
        return `${firstMonth.substring(0, 3)} ${firstYear} vs ${secondMonth.substring(0, 3)} ${secondYear}`;
      default:
        return 'All Years';
    }
  }, [comparisonMode, selectedYear, selectedYear1, selectedYear2, firstMonth, firstYear, secondMonth, secondYear]);

  // Apply filters
  const applyFilters = useCallback(() => {
    const newData = getFilteredData();
    setFilteredTrendData(newData);
    const label = getComparisonLabel();
    setChartTitle(`Financial Trend Analysis - ${label}`);
    setShowFilterPanel(false);
  }, [getFilteredData, getComparisonLabel]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setComparisonMode('1year');
    setSelectedYear1('2024');
    setSelectedYear2('2023');
    setFirstMonth('January');
    setFirstYear('2024');
    setSecondMonth('June');
    setSecondYear('2024');
    
    const defaultData = getBaseTrendData().filter(item => item.year === 2024);
    setFilteredTrendData(defaultData);
    setChartTitle("Financial Trend Analysis - Year 2024");
    onYearChange(2024);
  }, [getBaseTrendData, onYearChange]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
        {/* Main Content */}
        <div className={`transition-all duration-300 ${showFilterPanel ? 'w-3/4' : 'w-full'}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">{chartTitle}</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded mr-2">
                    {comparisonMode === '1year' ? 'Single Year' : comparisonMode === '2year' ? 'Compare Years' : 'Compare Months'}
                  </span>
                  <span className="text-green-600 font-bold">
                    {filteredTrendData.length} data points
                  </span>
                </p>
              </div>
              
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all group relative"
              >
                <Filter className="w-5 h-5 text-blue-600" />
                {showFilterPanel && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Stats Overview */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-green-100">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total Income</p>
                    <p className="text-lg font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-1 text-xs text-green-500">
                  <span>Avg: ₹{avgIncome.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-xl shadow-sm border border-red-100">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total Expense</p>
                    <p className="text-lg font-bold text-red-600">₹{totalExpense.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-1 text-xs text-red-500">
                  <span>Avg: ₹{avgExpense.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-100">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Net Profit</p>
                    <p className="text-lg font-bold text-blue-600">₹{totalProfit.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-1 text-xs text-blue-500">
                  <span>Avg: ₹{avgProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="p-4">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
                      dy={10}
                      angle={comparisonMode === '2month' ? -45 : (chartData.length > 6 ? -45 : 0)}
                      textAnchor={comparisonMode === '2month' ? 'end' : (chartData.length > 6 ? 'end' : 'middle')}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
                      tickFormatter={(value) => `₹${value/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                      }}
                      itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                      labelStyle={{ marginBottom: '6px', fontWeight: 700, color: '#1e293b' }}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle" 
                      wrapperStyle={{ paddingBottom: '20px', fontWeight: 600, fontSize: '11px' }} 
                    />
                    
                    {activeTab === 'all' ? (
                      <>
                        <Area 
                          type="monotone" 
                          dataKey="income" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorIncome)" 
                          name="Income"
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="expense" 
                          stroke="#f43f5e" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorExpense)" 
                          name="Expense"
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="profit" 
                          stroke="#3b82f6" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorProfit)" 
                          name="Profit"
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </>
                    ) : (
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={chartColors?.stroke}
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill={chartColors?.gradient}
                        name={chartColors?.name}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    )}
                  </AreaChart>
                ) : chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
                      dy={10}
                      angle={comparisonMode === '2month' ? -45 : (chartData.length > 6 ? -45 : 0)}
                      textAnchor={comparisonMode === '2month' ? 'end' : (chartData.length > 6 ? 'end' : 'middle')}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
                      tickFormatter={(value) => `₹${value/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle" 
                      wrapperStyle={{ paddingBottom: '20px', fontWeight: 600, fontSize: '11px' }} 
                    />
                    {activeTab === 'all' ? (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey="income" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                          dot={{ r: 4, strokeWidth: 2, stroke: '#10b981', fill: 'white' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          name="Income" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="expense" 
                          stroke="#f43f5e" 
                          strokeWidth={3} 
                          strokeDasharray="5 5"
                          dot={{ r: 4, strokeWidth: 2, stroke: '#f43f5e', fill: 'white' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          name="Expense" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="profit" 
                          stroke="#3b82f6" 
                          strokeWidth={3} 
                          dot={{ r: 4, strokeWidth: 2, stroke: '#3b82f6', fill: 'white' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          name="Profit" 
                        />
                      </>
                    ) : (
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={chartColors?.stroke}
                        strokeWidth={3} 
                        dot={{ r: 4, strokeWidth: 2, stroke: chartColors?.stroke, fill: 'white' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name={chartColors?.name}
                      />
                    )}
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
                      dy={10}
                      angle={comparisonMode === '2month' ? -45 : (chartData.length > 6 ? -45 : 0)}
                      textAnchor={comparisonMode === '2month' ? 'end' : (chartData.length > 6 ? 'end' : 'middle')}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
                      tickFormatter={(value) => `₹${value/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                    }}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle" 
                      wrapperStyle={{ paddingBottom: '20px', fontWeight: 600, fontSize: '11px' }} 
                    />
                    {activeTab === 'all' ? (
                      <>
                        <Bar 
                          dataKey="income" 
                          fill="#10b981" 
                          name="Income" 
                          radius={[6, 6, 0, 0]} 
                        />
                        <Bar 
                          dataKey="expense" 
                          fill="#f43f5e" 
                          name="Expense" 
                          radius={[6, 6, 0, 0]} 
                        />
                        <Bar 
                          dataKey="profit" 
                          fill="#3b82f6" 
                          name="Profit" 
                          radius={[6, 6, 0, 0]} 
                        />
                      </>
                    ) : (
                      <Bar 
                        dataKey="value" 
                        fill={chartColors?.stroke}
                        name={chartColors?.name}
                        radius={[6, 6, 0, 0]}
                      />
                    )}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Controls Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200">
                  <span className="text-xs font-medium text-gray-700 px-1.5">View:</span>
                  {(['all', 'income', 'expense', 'profit'] as FinancialTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => onTabChange(tab)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        activeTab === tab
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-lg border border-gray-200">
                  <span className="text-xs font-medium text-gray-700 px-1.5">Chart:</span>
                  {(['area', 'bar'] as ChartType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => onChartTypeChange(type)}
                      className={`p-1.5 rounded transition-all ${
                        chartType === type
                          ? 'bg-blue-100 text-blue-600'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {type === 'area' && <LineChartIcon className="w-3.5 h-3.5" />}
                      {type === 'bar' && <BarChart3 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-white p-1.5 rounded-lg border border-gray-200">
                  <select 
                    className="bg-transparent border-none outline-none text-xs font-medium text-gray-700"
                    value={selectedYear}
                    onChange={(e) => onYearChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  >
                    <option value="all">All Years</option>
                    {[2022, 2023, 2024, 2025, 2026].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={() => {
                    alert('Export feature coming soon!');
                  }}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
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
                    <h3 className="font-semibold text-gray-800 text-sm">Filter Trends</h3>
                    <p className="text-xs text-gray-500">Compare financial data</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Comparison Mode Selection */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Comparison Type</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setComparisonMode('1year')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      comparisonMode === '1year'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Single Year</span>
                      </div>
                      {comparisonMode === '1year' && <Check className="w-3.5 h-3.5 text-blue-500" />}
                    </div>
                  </button>

                  {/* 2 Year Comparison */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setComparisonMode(comparisonMode === '2year' ? '1year' : '2year')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        comparisonMode === '2year'
                          ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
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
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${comparisonMode === '2year' ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    
                    {comparisonMode === '2year' && (
                      <div className="p-3 bg-green-50/30 rounded-lg border border-green-100 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">Year 1</label>
                            <div className="relative">
                              <select
                                value={selectedYear1}
                                onChange={(e) => setSelectedYear1(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white appearance-none"
                              >
                                <option value="">Choose year</option>
                                {availableYears.map(year => (
                                  <option key={year} value={year}>{year}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">Year 2</label>
                            <div className="relative">
                              <select
                                value={selectedYear2}
                                onChange={(e) => setSelectedYear2(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white appearance-none"
                              >
                                <option value="">Choose year</option>
                                {availableYears.map(year => (
                                  <option key={year} value={year}>{year}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compare 2 Months */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setComparisonMode(comparisonMode === '2month' ? '1year' : '2month')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        comparisonMode === '2month'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm'
                          : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span>Compare Months</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${comparisonMode === '2month' ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    
                    {comparisonMode === '2month' && (
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
                                value={firstMonth}
                                onChange={(e) => setFirstMonth(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
                              >
                                <option value="">Select Month</option>
                                {allMonths.map(month => (
                                  <option key={`first-${month}`} value={month}>{month.substring(0, 3)}</option>
                                ))}
                              </select>
                              
                              <select
                                value={secondMonth}
                                onChange={(e) => setSecondMonth(e.target.value)}
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
                                value={firstYear}
                                onChange={(e) => setFirstYear(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
                              >
                                <option value="">Year</option>
                                {availableYears.map(year => (
                                  <option key={`first-${year}`} value={year}>{year}</option>
                                ))}
                              </select>
                              
                              <select
                                value={secondYear}
                                onChange={(e) => setSecondYear(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
                              >
                                <option value="">Year</option>
                                {availableYears.map(year => (
                                  <option key={`second-${year}`} value={year}>{year}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Actions</h4>
                <div className="space-y-2">
                  <button 
                    onClick={applyFilters}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Check className="w-4 h-4" />
                    Apply Filters
                  </button>
                  <button 
                    onClick={resetFilters}
                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 border border-gray-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset All
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-medium text-blue-800 mb-2">Active Filters</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Mode:</span>
                    <span className="text-xs font-medium text-blue-700 capitalize">
                      {comparisonMode === '1year' ? 'Single Year' : 
                       comparisonMode === '2year' ? 'Compare Years' : 
                       'Compare Months'}
                    </span>
                  </div>
                  {comparisonMode === '2year' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Year 1:</span>
                        <span className="text-xs font-medium text-blue-700">
                          {selectedYear1 || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Year 2:</span>
                        <span className="text-xs font-medium text-blue-700">
                          {selectedYear2 || 'Not selected'}
                        </span>
                      </div>
                    </>
                  )}
                  {comparisonMode === '2month' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Month 1:</span>
                        <span className="text-xs font-medium text-blue-700">
                          {firstMonth ? `${firstMonth.substring(0, 3)} ${firstYear}` : 'Not selected'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Month 2:</span>
                        <span className="text-xs font-medium text-blue-700">
                          {secondMonth ? `${secondMonth.substring(0, 3)} ${secondYear}` : 'Not selected'}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Current View:</span>
                    <span className="text-xs font-medium text-blue-700">
                      {getComparisonLabel()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Chart Type:</span>
                    <span className="text-xs font-medium text-blue-700 capitalize">
                      {chartType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Data Points:</span>
                    <span className="text-xs font-medium text-green-700">
                      {filteredTrendData.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}