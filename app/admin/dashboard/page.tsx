// app/admin/dashboard/page.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { 
  Building2, DoorOpen, Users, CreditCard, TrendingUp, 
  MoreVertical, Filter, ChevronDown, Calendar, X, BarChart3, 
  TrendingDown, IndianRupee, AlertCircle, Loader2, RefreshCw,
  Wallet, Banknote, Landmark, Receipt, CheckCircle2, Clock,
  Home, Bed as BedIcon, DollarSign
} from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

// Import APIs
import * as paymentApi from '@/lib/paymentRecordApi';
import { getExpenses, type Expense } from '@/lib/expenseApi';
import { listProperties } from '@/lib/propertyApi';
import { listRooms } from '@/lib/roomsApi';
import { listTenants } from '@/lib/tenantApi';

// Types
type DateRangeType = 'week' | 'month' | 'quarter' | 'year' | 'all';
type FinancialTab = 'all' | 'income' | 'expense' | 'profit';
type ChartType = 'area' | 'line' | 'bar';

interface MonthlyData {
  month: string;
  year: number;
  month_num: number;
  income: number;
  expense: number;
  profit: number;
}

// Badge component
const Badge = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium ${className}`}>
    {children}
  </span>
);

// Gradient Stat Card (matching your payment stats theme)
const GradientStatCard = ({ title, value, icon: Icon, color, bgColor, loading, trend, trendValue }: any) => (
  <div className={`${bgColor} rounded-xl p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100`}>
    <div className="flex items-center gap-2 sm:gap-3">
      <div className={`${color} p-1.5 sm:p-2 rounded-lg shadow-sm flex-shrink-0`}>
        <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">{title}</p>
          {trend && (
            <div className={`flex items-center gap-0.5 text-[9px] ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              <span>{trendValue}%</span>
            </div>
          )}
        </div>
        {loading ? (
          <div className="h-4 sm:h-5 w-16 bg-gray-200 rounded animate-pulse mt-0.5"></div>
        ) : (
          <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">{value}</p>
        )}
      </div>
    </div>
  </div>
);

// Financial Trend Chart Component
const FinancialTrendChart: React.FC<{
  data: MonthlyData[];
  activeTab: FinancialTab;
  chartType: ChartType;
  selectedYear: number | 'all';
  onTabChange: (tab: FinancialTab) => void;
  onChartTypeChange: (type: ChartType) => void;
  onYearChange: (year: number | 'all') => void;
  onClose: () => void;
  loading: boolean;
  formatCurrency: (amount: number) => string;
}> = ({ data, activeTab, chartType, selectedYear, onTabChange, onChartTypeChange, onYearChange, onClose, loading, formatCurrency }) => {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const availableYears = useMemo(() => [...new Set(data.map(d => d.year))].sort((a, b) => b - a), [data]);

  const filteredData = useMemo(() => {
    if (selectedYear === 'all') return data;
    return data.filter(d => d.year === selectedYear);
  }, [data, selectedYear]);

  const chartData = useMemo(() => {
    if (activeTab === 'income') {
      return filteredData.map(d => ({ month: `${d.month.substring(0,3)} ${d.year}`, value: d.income }));
    }
    if (activeTab === 'expense') {
      return filteredData.map(d => ({ month: `${d.month.substring(0,3)} ${d.year}`, value: d.expense }));
    }
    if (activeTab === 'profit') {
      return filteredData.map(d => ({ month: `${d.month.substring(0,3)} ${d.year}`, value: d.profit }));
    }
    return filteredData.map(d => ({ 
      month: `${d.month.substring(0,3)} ${d.year}`, 
      income: d.income, 
      expense: d.expense, 
      profit: d.profit 
    }));
  }, [filteredData, activeTab]);

  const totalIncome = filteredData.reduce((s, d) => s + d.income, 0);
  const totalExpense = filteredData.reduce((s, d) => s + d.expense, 0);
  const totalProfit = filteredData.reduce((s, d) => s + d.profit, 0);
  const avgIncome = filteredData.length ? Math.round(totalIncome / filteredData.length) : 0;
  const avgExpense = filteredData.length ? Math.round(totalExpense / filteredData.length) : 0;
  const avgProfit = filteredData.length ? Math.round(totalProfit / filteredData.length) : 0;

  const chartColors = {
    income: { stroke: '#10b981', gradient: 'url(#colorIncome)', name: 'Income' },
    expense: { stroke: '#f43f5e', gradient: 'url(#colorExpense)', name: 'Expense' },
    profit: { stroke: '#3b82f6', gradient: 'url(#colorProfit)', name: 'Profit' }
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <CreditCard className="w-12 h-12 mb-2" />
          <p className="text-sm">No payment data available</p>
        </div>
      );
    }

    const commonProps = { margin: { top: 10, right: 10, left: 0, bottom: 20 } };

    if (chartType === 'area') {
      return (
        <AreaChart data={chartData} {...commonProps}>
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
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}} tickFormatter={formatCurrency} width={70} />
          <Tooltip formatter={(v: number) => [formatCurrency(v), 'Amount']} />
          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom:'10px',fontSize:'10px'}} />
          {activeTab === 'all' ? (
            <>
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" name="Expense" />
              <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
            </>
          ) : (
            <Area type="monotone" dataKey="value" stroke={chartColors[activeTab].stroke} strokeWidth={2} fillOpacity={1} fill={chartColors[activeTab].gradient} name={chartColors[activeTab].name} />
          )}
        </AreaChart>
      );
    }

    if (chartType === 'line') {
      return (
        <LineChart data={chartData} {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}} tickFormatter={formatCurrency} width={70} />
          <Tooltip formatter={(v: number) => [formatCurrency(v), 'Amount']} />
          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom:'10px',fontSize:'10px'}} />
          {activeTab === 'all' ? (
            <>
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{r:3}} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" dot={{r:3}} name="Expense" />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} dot={{r:3}} name="Profit" />
            </>
          ) : (
            <Line type="monotone" dataKey="value" stroke={chartColors[activeTab].stroke} strokeWidth={2} dot={{r:3}} name={chartColors[activeTab].name} />
          )}
        </LineChart>
      );
    }

    return (
      <BarChart data={chartData} {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}} tickFormatter={formatCurrency} width={70} />
        <Tooltip formatter={(v: number) => [formatCurrency(v), 'Amount']} />
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom:'10px',fontSize:'10px'}} />
        {activeTab === 'all' ? (
          <>
            <Bar dataKey="income" fill="#10b981" name="Income" radius={[4,4,0,0]} />
            <Bar dataKey="expense" fill="#f43f5e" name="Expense" radius={[4,4,0,0]} />
            <Bar dataKey="profit" fill="#3b82f6" name="Profit" radius={[4,4,0,0]} />
          </>
        ) : (
          <Bar dataKey="value" fill={chartColors[activeTab].stroke} name={chartColors[activeTab].name} radius={[4,4,0,0]} />
        )}
      </BarChart>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-sm font-semibold">Financial Trend Analysis</h2>
              <p className="text-blue-100 text-xs mt-0.5">{filteredData.length} months of data</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="p-3 sm:p-4 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-green-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Income</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Avg: {formatCurrency(avgIncome)}</p>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-sm border border-red-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Expense</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Avg: {formatCurrency(avgExpense)}</p>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <IndianRupee className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Net Profit</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(totalProfit)}</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Avg: {formatCurrency(avgProfit)}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-3 border-b flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {(['all', 'income', 'expense', 'profit'] as FinancialTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {(['area', 'line', 'bar'] as ChartType[]).map(type => (
                <button
                  key={type}
                  onClick={() => onChartTypeChange(type)}
                  className={`p-1.5 rounded transition-all ${
                    chartType === type ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type === 'area' && <BarChart3 className="w-3.5 h-3.5" />}
                  {type === 'line' && <TrendingUp className="w-3.5 h-3.5" />}
                  {type === 'bar' && <BarChart3 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="text-xs border rounded-lg px-2 py-1 bg-white"
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Chart */}
        <div className="flex-1 p-4 min-h-[350px]">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Stats from APIs
  const [propertyStats, setPropertyStats] = useState({ total: 0, active: 0 });
  const [roomStats, setRoomStats] = useState({ total: 0, active: 0, totalBeds: 0, occupiedBeds: 0 });
  const [tenantStats, setTenantStats] = useState({ total: 0, active: 0 });
  
  // Payment Data
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState({
    total_collected: 0,
    total_transactions: 0,
    cash_payments: 0,
    online_payments: 0,
    bank_transfers: 0,
    card_payments: 0,
    cheque_payments: 0,
    current_month_collected: 0,
    rent_collected: 0
  });
  
  // Expense Data
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseTotal, setExpenseTotal] = useState(0);
  
  // Chart Data
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeType>('year');
  
  // Chart Filters
  const [showFinancialTrend, setShowFinancialTrend] = useState(false);
  const [financialTab, setFinancialTab] = useState<FinancialTab>('all');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [financialYear, setFinancialYear] = useState<number | 'all'>('all');
  
  // UI States
  const [selectedOverview, setSelectedOverview] = useState<string>('beds');
  const [showOverviewMenu, setShowOverviewMenu] = useState(false);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
    return `₹${amount.toLocaleString()}`;
  };

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load properties
      const propertiesRes = await listProperties({ pageSize: 1000 });
      const propertiesData = propertiesRes.success ? (propertiesRes.data?.data || propertiesRes.data || []) : [];
      setPropertyStats({
        total: propertiesData.length,
        active: propertiesData.filter((p: any) => p.is_active === true).length
      });

      // Load rooms
      const roomsRes = await listRooms();
      const roomsData = roomsRes.success ? (roomsRes.data || []) : [];
      const totalBeds = roomsData.reduce((sum: number, r: any) => sum + (Number(r.total_bed) || Number(r.total_beds) || 0), 0);
      const occupiedBeds = roomsData.reduce((sum: number, r: any) => sum + (Number(r.occupied_beds) || 0), 0);
      setRoomStats({
        total: roomsData.length,
        active: roomsData.filter((r: any) => r.is_active === true).length,
        totalBeds,
        occupiedBeds
      });

      // Load tenants
      const tenantsRes = await listTenants({ pageSize: 1000 });
      const tenantsData = tenantsRes.success ? (tenantsRes.data || []) : [];
      setTenantStats({
        total: tenantsData.length,
        active: tenantsData.filter((t: any) => t.is_active === true || t.status === 'active').length
      });

      // Load payments
      const paymentsRes = await paymentApi.getPayments();
      if (paymentsRes.success && paymentsRes.data) {
        const payments = paymentsRes.data;
        setAllPayments(payments);
        
        const approvedPayments = payments.filter((p: any) => p.status === 'approved' || p.status === 'paid');
        const totalCollected = approvedPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
        
        const currentDate = new Date();
        const currentMonthPayments = approvedPayments.filter((p: any) => {
          const paymentDate = new Date(p.payment_date);
          return paymentDate.getMonth() === currentDate.getMonth() && 
                 paymentDate.getFullYear() === currentDate.getFullYear();
        });
        const currentMonthCollected = currentMonthPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
        
        const rentPayments = approvedPayments.filter((p: any) => p.payment_type === 'rent');
        const rentCollected = rentPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
        
        setPaymentStats({
          total_collected: totalCollected,
          total_transactions: approvedPayments.length,
          cash_payments: approvedPayments.filter((p: any) => p.payment_mode === 'cash').length,
          online_payments: approvedPayments.filter((p: any) => p.payment_mode === 'online').length,
          bank_transfers: approvedPayments.filter((p: any) => p.payment_mode === 'bank_transfer').length,
          card_payments: approvedPayments.filter((p: any) => p.payment_mode === 'card').length,
          cheque_payments: approvedPayments.filter((p: any) => p.payment_mode === 'cheque').length,
          current_month_collected: currentMonthCollected,
          rent_collected: rentCollected
        });
      }

      // Load expenses
      const expensesData = await getExpenses();
      setExpenses(expensesData);
      const totalExpenseAmount = expensesData.reduce((sum, e) => sum + (Number(e.total_amount) || 0), 0);
      setExpenseTotal(totalExpenseAmount);

      // Generate chart data
      await generateChartData(paymentsRes.data || [], expensesData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate chart data based on date range
  const generateChartData = useCallback(async (payments: any[], expenses: Expense[]) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthlyMap = new Map<string, MonthlyData>();
    
    const currentDate = new Date();
    let monthsToShow = 12;
    
    switch (dateRange) {
      case 'week': monthsToShow = 1; break;
      case 'month': monthsToShow = 1; break;
      case 'quarter': monthsToShow = 3; break;
      case 'year': monthsToShow = 12; break;
      case 'all': monthsToShow = 36; break;
    }
    
    // Initialize months
    for (let i = 0; i < monthsToShow; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const monthNum = date.getMonth();
      const monthName = monthNames[monthNum];
      const key = `${year}-${monthNum}`;
      
      monthlyMap.set(key, {
        month: monthName,
        year,
        month_num: monthNum,
        income: 0,
        expense: 0,
        profit: 0
      });
    }
    
    // Add payments
    const approvedPayments = payments.filter(p => p.status === 'approved' || p.status === 'paid');
    approvedPayments.forEach(payment => {
      const amount = Number(payment.amount) || 0;
      const paymentDate = new Date(payment.payment_date);
      const year = paymentDate.getFullYear();
      const monthNum = paymentDate.getMonth();
      const key = `${year}-${monthNum}`;
      
      const existing = monthlyMap.get(key);
      if (existing) {
        existing.income += amount;
        monthlyMap.set(key, existing);
      }
    });
    
    // Add expenses
    expenses.forEach(expense => {
      const amount = Number(expense.total_amount) || 0;
      const expenseDate = new Date(expense.expense_date);
      const year = expenseDate.getFullYear();
      const monthNum = expenseDate.getMonth();
      const key = `${year}-${monthNum}`;
      
      const existing = monthlyMap.get(key);
      if (existing) {
        existing.expense += amount;
        monthlyMap.set(key, existing);
      }
    });
    
    // Calculate profit
    monthlyMap.forEach((value) => {
      value.profit = value.income - value.expense;
    });
    
    // Convert to array and sort
    const data = Array.from(monthlyMap.values());
    data.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month_num - b.month_num;
    });
    
    setMonthlyData(data);
  }, [dateRange]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (allPayments.length > 0 || expenses.length > 0) {
      generateChartData(allPayments, expenses);
    }
  }, [dateRange, allPayments, expenses]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  // Calculate metrics
  const occupancyPercent = roomStats.totalBeds > 0 ? Math.round((roomStats.occupiedBeds / roomStats.totalBeds) * 100) : 0;
  const propertyOccupancyPercent = propertyStats.total > 0 ? Math.round((propertyStats.active / propertyStats.total) * 100) : 0;
  const tenantOccupancyPercent = tenantStats.total > 0 ? Math.round((tenantStats.active / tenantStats.total) * 100) : 0;
  const netProfit = paymentStats.total_collected - expenseTotal;
  const profitMargin = paymentStats.total_collected > 0 ? (netProfit / paymentStats.total_collected) * 100 : 0;

  // Get overview data based on selection
  const getOverviewData = () => {
    switch (selectedOverview) {
      case 'rooms':
        return {
          title: 'Rooms Overview',
          items: [
            { label: 'Total Rooms', value: roomStats.total, color: 'bg-blue-600', bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100', icon: DoorOpen },
            { label: 'Occupied Rooms', value: roomStats.active, color: 'bg-green-600', bgColor: 'bg-gradient-to-br from-green-50 to-green-100', icon: Home },
            { label: 'Vacant Rooms', value: roomStats.total - roomStats.active, color: 'bg-amber-600', bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100', icon: DoorOpen }
          ],
          percent: roomStats.total > 0 ? Math.round((roomStats.active / roomStats.total) * 100) : 0,
          label: 'Room Occupancy'
        };
      case 'property':
        return {
          title: 'Properties Overview',
          items: [
            { label: 'Total Properties', value: propertyStats.total, color: 'bg-blue-600', bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100', icon: Building2 },
            { label: 'Active Properties', value: propertyStats.active, color: 'bg-green-600', bgColor: 'bg-gradient-to-br from-green-50 to-green-100', icon: Building2 }
          ],
          percent: propertyOccupancyPercent,
          label: 'Active Properties'
        };
      case 'tenants':
        return {
          title: 'Tenants Overview',
          items: [
            { label: 'Total Tenants', value: tenantStats.total, color: 'bg-blue-600', bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100', icon: Users },
            { label: 'Active Tenants', value: tenantStats.active, color: 'bg-green-600', bgColor: 'bg-gradient-to-br from-green-50 to-green-100', icon: Users },
            { label: 'Inactive Tenants', value: tenantStats.total - tenantStats.active, color: 'bg-amber-600', bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100', icon: Users }
          ],
          percent: tenantOccupancyPercent,
          label: 'Active Tenants'
        };
      case 'beds':
      default:
        return {
          title: 'Beds Overview',
          items: [
            { label: 'Total Beds', value: roomStats.totalBeds, color: 'bg-blue-600', bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100', icon: BedIcon },
            { label: 'Occupied Beds', value: roomStats.occupiedBeds, color: 'bg-green-600', bgColor: 'bg-gradient-to-br from-green-50 to-green-100', icon: Users },
            { label: 'Available Beds', value: roomStats.totalBeds - roomStats.occupiedBeds, color: 'bg-amber-600', bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100', icon: BedIcon }
          ],
          percent: occupancyPercent,
          label: 'Bed Occupancy'
        };
    }
  };

  const overviewData = getOverviewData();

  // Chart data for rent activity
  const chartData = monthlyData.slice(-6).map(d => ({
    month: d.month.substring(0, 3),
    amount: d.income
  }));

  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);
  
  // Calculate month over month growth
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const monthOverMonthGrowth = currentMonth && previousMonth && previousMonth.income > 0
    ? ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100
    : 0;

  // Payment methods for pie chart
  const paymentMethods = [
    { name: 'Cash', value: paymentStats.cash_payments, color: '#10B981', icon: Banknote },
    { name: 'Online', value: paymentStats.online_payments, color: '#3B82F6', icon: CreditCard },
    { name: 'Bank Transfer', value: paymentStats.bank_transfers, color: '#8B5CF6', icon: Landmark },
    { name: 'Card', value: paymentStats.card_payments, color: '#EF4444', icon: CreditCard },
    { name: 'Cheque', value: paymentStats.cheque_payments, color: '#F59E0B', icon: Receipt },
  ].filter(m => m.value > 0);

  const statCards = [
    { title: 'Total Properties', value: propertyStats.total, icon: Building2, color: 'bg-blue-600', bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100', trend: 'up', trendValue: '12' },
    { title: 'Total Rooms', value: roomStats.total, icon: DoorOpen, color: 'bg-purple-600', bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100', trend: 'up', trendValue: '8' },
    { title: 'Bed Occupancy', value: `${roomStats.occupiedBeds}/${roomStats.totalBeds}`, icon: BedIcon, color: 'bg-green-600', bgColor: 'bg-gradient-to-br from-green-50 to-green-100', trend: 'up', trendValue: '5' },
    { title: 'Active Tenants', value: tenantStats.active, icon: Users, color: 'bg-orange-600', bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100', trend: 'up', trendValue: '3' },
    { title: 'Monthly Revenue', value: formatCurrency(paymentStats.current_month_collected), icon: IndianRupee, color: 'bg-indigo-600', bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100', trend: monthOverMonthGrowth > 0 ? 'up' : 'down', trendValue: Math.abs(monthOverMonthGrowth).toFixed(1) },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {showFinancialTrend && (
        <FinancialTrendChart
          data={monthlyData}
          activeTab={financialTab}
          chartType={chartType}
          selectedYear={financialYear}
          onTabChange={setFinancialTab}
          onChartTypeChange={setChartType}
          onYearChange={setFinancialYear}
          onClose={() => setShowFinancialTrend(false)}
          loading={loading}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Header with Refresh and Date Filter */}
      <div className="flex justify-end items-center gap-3 mb-4">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as DateRangeType)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white shadow-sm"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Gradient Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 mb-6">
        {statCards.map((stat, index) => (
          <GradientStatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            bgColor={stat.bgColor}
            loading={loading}
            trend={stat.trend}
            trendValue={stat.trendValue}
          />
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* Rent Activity Chart */}
        <Card className="lg:col-span-2 border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#004aad] to-[#002a7a] px-4 py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-xs font-medium flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Rent Activity
              </h3>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30 text-[8px] px-1.5 py-0 h-4">
                  {dateRange}
                </Badge>
                <button
                  onClick={() => setShowFinancialTrend(true)}
                  className="text-white/70 hover:text-white text-[10px]"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-52">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-52 text-gray-400">
                <IndianRupee className="w-12 h-12 mb-2" />
                <p className="text-sm">No payment data available</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-gray-500">Amount (₹)</span>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${monthOverMonthGrowth >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} text-[10px] font-medium`}>
                    {monthOverMonthGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {monthOverMonthGrowth >= 0 ? '+' : ''}{monthOverMonthGrowth.toFixed(1)}% vs last month
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="relative h-44">
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 pr-2">
                    <span>{formatCurrency(maxAmount)}</span>
                    <span>{formatCurrency(maxAmount * 0.75)}</span>
                    <span>{formatCurrency(maxAmount * 0.5)}</span>
                    <span>{formatCurrency(maxAmount * 0.25)}</span>
                    <span>₹0</span>
                  </div>
                  
                  <div className="absolute bottom-0 left-10 right-2 h-36 flex items-end justify-between gap-1">
                    {chartData.map((item, index) => {
                      const heightPercent = maxAmount > 0 ? (item.amount / maxAmount) * 85 : 0;
                      return (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div className="relative w-full flex justify-center">
                            <div 
                              className="w-8 sm:w-10 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 hover:opacity-90 cursor-pointer group"
                              style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                            >
                              <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {formatCurrency(item.amount)}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium text-gray-600 mt-1">{item.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500">Current Month</p>
                    <p className="text-sm font-bold text-gray-800">{formatCurrency(currentMonth?.income || 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">Average Monthly</p>
                    <p className="text-sm font-bold text-gray-800">
                      {chartData.length > 0 
                        ? formatCurrency(chartData.reduce((sum, d) => sum + d.amount, 0) / chartData.length)
                        : '₹0'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Overview Card with Donut Chart */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#004aad] to-[#002a7a] px-4 py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-xs font-medium flex items-center gap-1">
                <BarChart3 className="h-3.5 w-3.5" />
                {overviewData.title}
              </h3>
              <div className="relative">
                <button
                  onClick={() => setShowOverviewMenu(!showOverviewMenu)}
                  className="text-white/70 hover:text-white"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
                {showOverviewMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border z-10 overflow-hidden">
                    {['beds', 'rooms', 'property', 'tenants'].map((type) => (
                      <button
                        key={type}
                        onClick={() => { setSelectedOverview(type); setShowOverviewMenu(false); }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 capitalize"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              {/* Donut Chart */}
              <div className="relative w-32 h-32 mb-4">
                <div className="absolute inset-0 rounded-full bg-gray-100"></div>
                <div className="absolute inset-0 rounded-full">
                  <div 
                    className="absolute inset-0 rounded-full transition-all duration-500"
                    style={{
                      background: `conic-gradient(#3B82F6 ${overviewData.percent * 3.6}deg, #E5E7EB 0deg)`
                    }}
                  />
                </div>
                <div className="absolute inset-3 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                  <span className="text-lg font-bold text-gray-800">{overviewData.percent}%</span>
                  <span className="text-[9px] text-gray-500 text-center px-1">{overviewData.label}</span>
                </div>
              </div>

              {/* Stats List */}
              <div className="w-full space-y-2">
                {overviewData.items.map((item, idx) => (
                  <div key={idx} className={`${item.bgColor} rounded-lg p-2 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <div className={`${item.color} p-1 rounded-md`}>
                        <item.icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Payment Methods */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#004aad] to-[#002a7a] px-4 py-2">
            <h3 className="text-white text-xs font-medium flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5" />
              Payment Methods
            </h3>
          </div>
          <CardContent className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <CreditCard className="w-12 h-12 mb-2" />
                <p className="text-sm">No payment data available</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethods}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        dataKey="value"
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} transactions`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {paymentMethods.map((method) => (
                    <div key={method.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: method.color }} />
                        <span className="text-xs text-gray-700">{method.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-gray-800">{method.value}</span>
                        <span className="text-[10px] text-gray-400 ml-1">
                          ({paymentStats.total_transactions > 0 ? Math.round((method.value / paymentStats.total_transactions) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">Total Transactions</span>
                      <span className="text-sm font-bold text-gray-800">{paymentStats.total_transactions}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#004aad] to-[#002a7a] px-4 py-2">
            <h3 className="text-white text-xs font-medium flex items-center gap-1">
              <IndianRupee className="h-3.5 w-3.5" />
              Financial Summary
            </h3>
          </div>
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Total Revenue */}
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">Total Revenue</span>
                  </div>
                  <span className="text-base font-bold text-gray-800">{formatCurrency(paymentStats.total_collected)}</span>
                </div>
                <div className="mt-1 text-right">
                  <span className="text-[10px] text-gray-400">{paymentStats.total_transactions} transactions</span>
                </div>
              </div>

              {/* Total Expenses */}
              <div className="bg-red-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-100 rounded-lg">
                      <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">Total Expenses</span>
                  </div>
                  <span className="text-base font-bold text-gray-800">{formatCurrency(expenseTotal)}</span>
                </div>
                <div className="mt-1 text-right">
                  <span className="text-[10px] text-gray-400">{expenses.length} expense records</span>
                </div>
              </div>

              {/* Net Profit */}
              <div className={`rounded-lg p-3 ${netProfit >= 0 ? 'bg-blue-50' : 'bg-amber-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${netProfit >= 0 ? 'bg-blue-100' : 'bg-amber-100'}`}>
                      <IndianRupee className={`w-3.5 h-3.5 ${netProfit >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">Net Profit</span>
                  </div>
                  <span className={`text-base font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                    {formatCurrency(netProfit)}
                  </span>
                </div>
                <div className="mt-1 text-right">
                  <span className="text-[10px] text-gray-400">Margin: {profitMargin.toFixed(1)}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Expense Ratio</span>
                  <span>{paymentStats.total_collected > 0 ? Math.round((expenseTotal / paymentStats.total_collected) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-red-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${paymentStats.total_collected > 0 ? (expenseTotal / paymentStats.total_collected) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}