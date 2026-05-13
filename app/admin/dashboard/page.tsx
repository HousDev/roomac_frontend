"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2, DoorOpen, Users, CreditCard, TrendingUp,
  MoreVertical, ChevronDown, X, BarChart3,
  TrendingDown, IndianRupee, Loader2, RefreshCw,
  Bed as BedIcon, ArrowUpRight, ArrowDownRight, Home,
  Zap, AlertCircle, CheckCircle2, Filter, Calendar,
  Check, IndianRupeeIcon, FileText, Receipt, DollarSign
} from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';
import { format } from 'date-fns';

import * as paymentApi from '@/lib/paymentRecordApi';
import { getExpenses, type Expense } from '@/lib/expenseApi';
import { listProperties } from '@/lib/propertyApi';
import { listRooms } from '@/lib/roomsApi';
import { listTenants } from '@/lib/tenantApi';

type DateRangeType = 'week' | 'month' | 'quarter' | 'year' | 'all';
type FinancialTab = 'all' | 'income' | 'expense' | 'profit';
type ChartType = 'area' | 'line' | 'bar';
type ComparisonMode = '1year' | '2year' | 'custom' | null;
type OverviewType = 'beds' | 'rooms' | 'property' | 'tenants' | 'expenses' | 'income';

interface MonthlyData {
  month: string;
  year: number;
  month_num: number;
  income: number;
  expense: number;
  profit: number;
}

interface ExpenseStats {
  total: number;
  fixed: number;
  variable: number;
  ratio: number;
}

interface IncomeStats {
  total: number;
  rental: number;
  other: number;
  ratio: number;
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl shadow-navy-900/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-[#0a1628] text-xs font-bold font-mono">
              {formatCurrency ? formatCurrency(entry.value) : entry.value}
            </span>
            <span className="text-slate-400 text-[10px]">{entry.name}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ── Stat Card Component ──────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, color, bgColor, trend, trendValue, loading }: any) => (
  <div className={`${bgColor} rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 stat-hover`}>
    <div className="flex items-start justify-between">
      <div className={`${color} p-2 rounded-lg shadow-sm flex-shrink-0`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full
          ${trend === 'up' ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
          {trendValue}%
        </div>
      )}
    </div>
    <div className="mt-3">
      {loading ? (
        <div className="shimmer h-7 w-4/5 mb-1" />
      ) : (
        <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
      )}
      <p className="text-[11px] sm:text-xs font-medium text-gray-500 mt-1">{title}</p>
    </div>
  </div>
);

// ── Financial Trend Modal ──────────────────────────────────────────────────────
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
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('1year');
  const [selectedYear1, setSelectedYear1] = useState<string>('');
  const [selectedYear2, setSelectedYear2] = useState<string>('');
  const [firstMonth, setFirstMonth] = useState<string>('');
  const [firstYear, setFirstYear] = useState<string>('');
  const [secondMonth, setSecondMonth] = useState<string>('');
  const [secondYear, setSecondYear] = useState<string>('');

  const availableYears = useMemo(() => [...new Set(data.map(d => d.year))].sort((a, b) => b - a), [data]);
  const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getFilteredData = useCallback(() => {
    let filtered = selectedYear === 'all' ? data : data.filter(d => d.year === selectedYear);
    
    if (comparisonMode === '2year' && selectedYear1 && selectedYear2) {
      const y1 = parseInt(selectedYear1);
      const y2 = parseInt(selectedYear2);
      filtered = data.filter(d => d.year === y1 || d.year === y2);
    } else if (comparisonMode === 'custom' && firstMonth && firstYear && secondMonth && secondYear) {
      const m1Index = allMonths.indexOf(firstMonth);
      const m2Index = allMonths.indexOf(secondMonth);
      filtered = data.filter(d => 
        (d.month_num === m1Index && d.year === parseInt(firstYear)) ||
        (d.month_num === m2Index && d.year === parseInt(secondYear))
      );
    }
    
    return filtered;
  }, [data, selectedYear, comparisonMode, selectedYear1, selectedYear2, firstMonth, firstYear, secondMonth, secondYear, allMonths]);

  const filteredData = getFilteredData();

  const chartData = useMemo(() => {
    if (activeTab === 'income') return filteredData.map(d => ({ month: `${d.month.substring(0, 3)} ${d.year}`, value: d.income }));
    if (activeTab === 'expense') return filteredData.map(d => ({ month: `${d.month.substring(0, 3)} ${d.year}`, value: d.expense }));
    if (activeTab === 'profit') return filteredData.map(d => ({ month: `${d.month.substring(0, 3)} ${d.year}`, value: d.profit }));
    return filteredData.map(d => ({ month: `${d.month.substring(0, 3)} ${d.year}`, income: d.income, expense: d.expense, profit: d.profit }));
  }, [filteredData, activeTab]);

  const totalIncome = filteredData.reduce((s, d) => s + d.income, 0);
  const totalExpense = filteredData.reduce((s, d) => s + d.expense, 0);
  const totalProfit = filteredData.reduce((s, d) => s + d.profit, 0);
  const avgIncome = filteredData.length ? Math.round(totalIncome / filteredData.length) : 0;
  const avgExpense = filteredData.length ? Math.round(totalExpense / filteredData.length) : 0;
  const avgProfit = filteredData.length ? Math.round(totalProfit / filteredData.length) : 0;

  const colors = { income: '#1e40af', expense: '#dc2626', profit: '#eab308' };
  const axisStyle = { fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' };
  const gridStyle = { stroke: '#f1f5f9', strokeDasharray: '4 4' };

  const renderChart = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-7 h-7 text-navy-700 animate-spin" style={{ color: '#1e3a5f' }} />
      </div>
    );
    if (!chartData.length) return (
      <div className="flex flex-col items-center justify-center h-full text-slate-300">
        <BarChart3 className="w-9 h-9 mb-2" />
        <p className="text-xs">No data available</p>
      </div>
    );

    const commonProps = { margin: { top: 10, right: 10, left: 0, bottom: 20 } };

    if (chartType === 'area') return (
      <AreaChart data={chartData} {...commonProps}>
        <defs>
          {(['income', 'expense', 'profit'] as const).map(k => (
            <linearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[k]} stopOpacity={0.18} />
              <stop offset="95%" stopColor={colors[k]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} {...gridStyle} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisStyle} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={formatCurrency} width={72} />
        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 10, fontSize: 10, color: '#64748b' }} />
        {activeTab === 'all' ? (
          <>
            <Area type="monotone" dataKey="income" stroke={colors.income} strokeWidth={2.5} fill="url(#grad_income)" name="Income" />
            <Area type="monotone" dataKey="expense" stroke={colors.expense} strokeWidth={2.5} fill="url(#grad_expense)" name="Expense" />
            <Area type="monotone" dataKey="profit" stroke={colors.profit} strokeWidth={2.5} fill="url(#grad_profit)" name="Profit" />
          </>
        ) : (
          <Area type="monotone" dataKey="value" stroke={colors[activeTab]} strokeWidth={2.5} fill={`url(#grad_${activeTab})`} name={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} />
        )}
      </AreaChart>
    );

    if (chartType === 'line') return (
      <LineChart data={chartData} {...commonProps}>
        <CartesianGrid vertical={false} {...gridStyle} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisStyle} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={formatCurrency} width={72} />
        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 10, fontSize: 10, color: '#64748b' }} />
        {activeTab === 'all' ? (
          <>
            <Line type="monotone" dataKey="income" stroke={colors.income} strokeWidth={2.5} dot={{ r: 3 }} name="Income" />
            <Line type="monotone" dataKey="expense" stroke={colors.expense} strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 3 }} name="Expense" />
            <Line type="monotone" dataKey="profit" stroke={colors.profit} strokeWidth={2.5} dot={{ r: 3 }} name="Profit" />
          </>
        ) : (
          <Line type="monotone" dataKey="value" stroke={colors[activeTab]} strokeWidth={2.5} dot={{ r: 3 }} name={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} />
        )}
      </LineChart>
    );

    return (
      <BarChart data={chartData} {...commonProps}>
        <CartesianGrid vertical={false} {...gridStyle} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisStyle} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={formatCurrency} width={72} />
        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 10, fontSize: 10, color: '#64748b' }} />
        {activeTab === 'all' ? (
          <>
            <Bar dataKey="income" fill={colors.income} name="Income" radius={[5, 5, 0, 0]} />
            <Bar dataKey="expense" fill={colors.expense} name="Expense" radius={[5, 5, 0, 0]} />
            <Bar dataKey="profit" fill={colors.profit} name="Profit" radius={[5, 5, 0, 0]} />
          </>
        ) : (
          <Bar dataKey="value" fill={colors[activeTab]} name={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} radius={[5, 5, 0, 0]} />
        )}
      </BarChart>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,22,40,0.55)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-3xl w-full max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#0f2462] via-[#0d3184] to-[#133ec0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(234,179,8,0.2)', border: '1.5px solid rgba(234,179,8,0.4)' }}>
              <BarChart3 className="w-4 h-4" style={{ color: '#eab308' }} />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold">Financial Trend Analysis</h2>
              <p className="text-slate-300 text-[10px]">{filteredData.length} months of data</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Filter className="w-3.5 h-3.5 text-slate-300" />
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <X className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50">
          {[
            { label: 'Total Income', val: totalIncome, avg: avgIncome, color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe', Icon: TrendingUp },
            { label: 'Total Expense', val: totalExpense, avg: avgExpense, color: '#dc2626', bg: '#fef2f2', border: '#fecaca', Icon: TrendingDown },
            { label: 'Net Profit', val: totalProfit, avg: avgProfit, color: '#854d0e', bg: '#fefce8', border: '#fef08a', Icon: IndianRupee },
          ].map(({ label, val, avg, color, bg, border, Icon }) => (
            <div key={label} className="rounded-2xl p-4" style={{ background: bg, border: `1.5px solid ${border}` }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-3 h-3" style={{ color }} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
              </div>
              <p className="font-bold text-2xl font-mono mb-1" style={{ color }}>{formatCurrency(val)}</p>
              <p className="text-[10px] text-slate-400">Avg/month: <strong className="font-mono text-slate-600">{formatCurrency(avg)}</strong></p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-xl p-1">
              {(['all', 'income', 'expense', 'profit'] as FinancialTab[]).map(tab => (
                <button key={tab} onClick={() => onTabChange(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === tab ? 'bg-white text-[#0a1628] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {(['area', 'line', 'bar'] as ChartType[]).map(type => (
                <button key={type} onClick={() => onChartTypeChange(type)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${chartType === type ? 'bg-white shadow-sm' : ''}`}>
                  {type === 'area' && <BarChart3 className="w-3.5 h-3.5" style={{ color: chartType === type ? '#1e3a5f' : '#94a3b8' }} />}
                  {type === 'line' && <TrendingUp className="w-3.5 h-3.5" style={{ color: chartType === type ? '#1e3a5f' : '#94a3b8' }} />}
                  {type === 'bar' && <BarChart3 className="w-3.5 h-3.5" style={{ color: chartType === type ? '#1e3a5f' : '#94a3b8' }} />}
                </button>
              ))}
            </div>
          </div>
          <select value={selectedYear} onChange={e => onYearChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-600 text-[11px] font-semibold outline-none cursor-pointer">
            <option value="all">All Years</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Chart */}
        <div className="flex-1 px-6 py-4 min-h-[300px]">
          <ResponsiveContainer width="100%" height={280}>{renderChart()}</ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ── Shimmer skeleton ───────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State for real data
  const [propertyStats, setPropertyStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [roomStats, setRoomStats] = useState({ total: 0, active: 0, inactive: 0, totalBeds: 0, occupiedBeds: 0 });
  const [tenantStats, setTenantStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState({
    total_collected: 0, total_transactions: 0, cash_payments: 0,
    online_payments: 0, bank_transfers: 0, card_payments: 0,
    cheque_payments: 0, current_month_collected: 0, rent_collected: 0,
    pending_amount: 0
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeType>('year');
  const [selectedOverview, setSelectedOverview] = useState<OverviewType>('beds');
  const [showOverviewMenu, setShowOverviewMenu] = useState(false);
  const [showFinancialTrend, setShowFinancialTrend] = useState(false);
  const [financialTab, setFinancialTab] = useState<FinancialTab>('all');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [financialYear, setFinancialYear] = useState<number | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDateCalendar, setShowDateCalendar] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [showMonthCalendar, setShowMonthCalendar] = useState(false);
  const [showYearCalendar, setShowYearCalendar] = useState(false);
  const [yearRange, setYearRange] = useState(2020);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('1year');
  const [animatedHeights, setAnimatedHeights] = useState<number[]>([]);

  const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const allAvailableYears = [2024, 2023, 2022, 2021, 2020];

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
    return `₹${amount.toLocaleString()}`;
  };

  const generateChartData = useCallback(async (payments: any[], expensesData: Expense[]) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthlyMap = new Map<string, MonthlyData>();
    let monthsToShow = 12;
    switch (dateRange) {
      case 'week': case 'month': monthsToShow = 1; break;
      case 'quarter': monthsToShow = 3; break;
      case 'year': monthsToShow = 12; break;
      case 'all': monthsToShow = 36; break;
    }
    for (let i = 0; i < monthsToShow; i++) {
      const date = new Date(); date.setMonth(date.getMonth() - i);
      const year = date.getFullYear(), monthNum = date.getMonth();
      monthlyMap.set(`${year}-${monthNum}`, { month: monthNames[monthNum], year, month_num: monthNum, income: 0, expense: 0, profit: 0 });
    }
    payments.filter(p => p.status === 'approved' || p.status === 'paid').forEach(p => {
      const d = new Date(p.payment_date), key = `${d.getFullYear()}-${d.getMonth()}`;
      const ex = monthlyMap.get(key); if (ex) { ex.income += Number(p.amount) || 0; monthlyMap.set(key, ex); }
    });
    expensesData.forEach(e => {
      const d = new Date(e.expense_date), key = `${d.getFullYear()}-${d.getMonth()}`;
      const ex = monthlyMap.get(key); if (ex) { ex.expense += Number(e.total_amount) || 0; monthlyMap.set(key, ex); }
    });
    monthlyMap.forEach(v => { v.profit = v.income - v.expense; });
    setMonthlyData(Array.from(monthlyMap.values()).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month_num - b.month_num));
  }, [dateRange]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Load properties
      const propertiesRes = await listProperties({ pageSize: 1000 });
      const propertiesData = propertiesRes.success ? (propertiesRes.data?.data || propertiesRes.data || []) : [];
      const totalProperties = propertiesData.length;
      const activeProperties = propertiesData.filter((p: any) => p.is_active === true).length;
      setPropertyStats({ total: totalProperties, active: activeProperties, inactive: totalProperties - activeProperties });

      // Load rooms
      const roomsRes = await listRooms();
      const roomsData = roomsRes.success ? (roomsRes.data || []) : [];
      const totalRooms = roomsData.length;
      const activeRooms = roomsData.filter((r: any) => r.is_active === true).length;
      const totalBeds = roomsData.reduce((s: number, r: any) => s + (Number(r.total_bed) || Number(r.total_beds) || 0), 0);
      const occupiedBeds = roomsData.reduce((s: number, r: any) => s + (Number(r.occupied_beds) || 0), 0);
      setRoomStats({ total: totalRooms, active: activeRooms, inactive: totalRooms - activeRooms, totalBeds, occupiedBeds });

      // Load tenants
      const tenantsRes = await listTenants({ pageSize: 1000 });
      const tenantsData = tenantsRes.success ? (tenantsRes.data || []) : [];
      const totalTenants = tenantsData.length;
      const activeTenants = tenantsData.filter((t: any) => t.is_active === true || t.status === 'active').length;
      setTenantStats({ total: totalTenants, active: activeTenants, inactive: totalTenants - activeTenants });

      // Load payments
      const paymentsRes = await paymentApi.getPayments();
      let pmts: any[] = [];
      if (paymentsRes.success && paymentsRes.data) {
        pmts = paymentsRes.data;
        setAllPayments(pmts);
        const ap = pmts.filter((p: any) => p.status === 'approved' || p.status === 'paid');
        const totalCollected = ap.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
        const cd = new Date();
        const cm = ap.filter((p: any) => { const d = new Date(p.payment_date); return d.getMonth() === cd.getMonth() && d.getFullYear() === cd.getFullYear(); });
        const pending = ap.filter((p: any) => p.status === 'pending').reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
        setPaymentStats({
          total_collected: totalCollected,
          total_transactions: ap.length,
          cash_payments: ap.filter((p: any) => p.payment_mode === 'cash').length,
          online_payments: ap.filter((p: any) => p.payment_mode === 'online').length,
          bank_transfers: ap.filter((p: any) => p.payment_mode === 'bank_transfer').length,
          card_payments: ap.filter((p: any) => p.payment_mode === 'card').length,
          cheque_payments: ap.filter((p: any) => p.payment_mode === 'cheque').length,
          current_month_collected: cm.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0),
          rent_collected: ap.filter((p: any) => p.payment_type === 'rent').reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0),
          pending_amount: pending
        });
      }

      // Load expenses
      const expData = await getExpenses();
      setExpenses(expData);
      setExpenseTotal(expData.reduce((s, e) => s + (Number(e.total_amount) || 0), 0));

      await generateChartData(pmts, expData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [generateChartData]);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (allPayments.length > 0 || expenses.length > 0) generateChartData(allPayments, expenses); }, [dateRange]);

  // Animate bar heights
  useEffect(() => {
    setAnimatedHeights([]);
    const chartData = monthlyData.slice(-6).map(d => ({ month: d.month.substring(0, 3), amount: d.income }));
    const timers = chartData.map((_, i) =>
      setTimeout(() => setAnimatedHeights(prev => prev.includes(i) ? prev : [...prev, i]), i * 150)
    );
    return () => timers.forEach(clearTimeout);
  }, [monthlyData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handleYearSelect = (year: number) => { setSelectedYear(year); setShowYearCalendar(false); };
  const handleMonthSelect = (month: string) => { setSelectedMonth(month); setShowMonthCalendar(false); };
  const handleDateSelect = (date: Date) => { setSelectedDate(date); setShowDateCalendar(false); };

  // Calculated values
  const occupancyPercent = roomStats.totalBeds > 0 ? Math.round((roomStats.occupiedBeds / roomStats.totalBeds) * 100) : 0;
  const propertyOccupancyPercent = propertyStats.total > 0 ? Math.round((propertyStats.active / propertyStats.total) * 100) : 0;
  const tenantOccupancyPercent = tenantStats.total > 0 ? Math.round((tenantStats.active / tenantStats.total) * 100) : 0;
  const netProfit = paymentStats.total_collected - expenseTotal;
  const profitMargin = paymentStats.total_collected > 0 ? (netProfit / paymentStats.total_collected) * 100 : 0;
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const mom = currentMonth && previousMonth && previousMonth.income > 0
    ? ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100 : 0;

  // Expense and Income stats for overview
  const expenseStats: ExpenseStats = {
    total: expenseTotal,
    fixed: Math.round(expenseTotal * 0.6),
    variable: Math.round(expenseTotal * 0.4),
    ratio: paymentStats.total_collected > 0 ? Math.round((expenseTotal / paymentStats.total_collected) * 100) : 0
  };

  const incomeStats: IncomeStats = {
    total: paymentStats.total_collected,
    rental: paymentStats.rent_collected,
    other: paymentStats.total_collected - paymentStats.rent_collected,
    ratio: paymentStats.total_collected > 0 ? Math.round((paymentStats.rent_collected / paymentStats.total_collected) * 100) : 0
  };

  const chartData = monthlyData.slice(-6).map(d => ({ month: d.month.substring(0, 3), amount: d.income }));
  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

  const paymentMethods = [
    { name: 'Cash', value: paymentStats.cash_payments, color: '#16a34a' },
    { name: 'Online', value: paymentStats.online_payments, color: '#1d4ed8' },
    { name: 'Bank Transfer', value: paymentStats.bank_transfers, color: '#0a1628' },
    { name: 'Card', value: paymentStats.card_payments, color: '#ca8a04' },
    { name: 'Cheque', value: paymentStats.cheque_payments, color: '#7c3aed' },
  ].filter(m => m.value > 0);

  const getOverviewData = () => {
    const configs: Record<OverviewType, any> = {
      beds: {
        title: 'Beds', percent: occupancyPercent, label: 'Occupied', color: '#1e3a5f',
        items: [
          { label: 'Total Beds', value: roomStats.totalBeds, color: '#1e40af', bg: '#eff6ff', icon: BedIcon },
          { label: 'Occupied', value: roomStats.occupiedBeds, color: '#15803d', bg: '#f0fdf4', icon: Users },
          { label: 'Available', value: roomStats.totalBeds - roomStats.occupiedBeds, color: '#b45309', bg: '#fefce8', icon: BedIcon }
        ]
      },
      rooms: {
        title: 'Rooms', percent: roomStats.total > 0 ? Math.round((roomStats.active / roomStats.total) * 100) : 0, label: 'Occupied', color: '#1e3a5f',
        items: [
          { label: 'Total Rooms', value: roomStats.total, color: '#1e40af', bg: '#eff6ff', icon: DoorOpen },
          { label: 'Occupied', value: roomStats.active, color: '#15803d', bg: '#f0fdf4', icon: Home },
          { label: 'Vacant', value: roomStats.inactive, color: '#b45309', bg: '#fefce8', icon: DoorOpen }
        ]
      },
      property: {
        title: 'Properties', percent: propertyOccupancyPercent, label: 'Active', color: '#1e3a5f',
        items: [
          { label: 'Total', value: propertyStats.total, color: '#1e40af', bg: '#eff6ff', icon: Building2 },
          { label: 'Active', value: propertyStats.active, color: '#15803d', bg: '#f0fdf4', icon: Building2 },
          { label: 'Inactive', value: propertyStats.inactive, color: '#dc2626', bg: '#fef2f2', icon: Building2 }
        ]
      },
      tenants: {
        title: 'Tenants', percent: tenantOccupancyPercent, label: 'Active', color: '#1e3a5f',
        items: [
          { label: 'Total', value: tenantStats.total, color: '#1e40af', bg: '#eff6ff', icon: Users },
          { label: 'Active', value: tenantStats.active, color: '#15803d', bg: '#f0fdf4', icon: Users },
          { label: 'Inactive', value: tenantStats.inactive, color: '#dc2626', bg: '#fef2f2', icon: Users }
        ]
      },
      expenses: {
        title: 'Expenses', percent: expenseStats.ratio, label: 'Ratio', color: '#dc2626',
        items: [
          { label: 'Total Expenses', value: formatCurrency(expenseStats.total), color: '#dc2626', bg: '#fef2f2', icon: TrendingDown },
          { label: 'Fixed Costs', value: formatCurrency(expenseStats.fixed), color: '#ea580c', bg: '#fff7ed', icon: FileText },
          { label: 'Variable Costs', value: formatCurrency(expenseStats.variable), color: '#9333ea', bg: '#faf5ff', icon: Receipt }
        ]
      },
      income: {
        title: 'Income', percent: incomeStats.ratio, label: 'Rental %', color: '#10b981',
        items: [
          { label: 'Total Income', value: formatCurrency(incomeStats.total), color: '#10b981', bg: '#f0fdf4', icon: TrendingUp },
          { label: 'Rental Income', value: formatCurrency(incomeStats.rental), color: '#1d4ed8', bg: '#eff6ff', icon: Users },
          { label: 'Other Income', value: formatCurrency(incomeStats.other), color: '#854d0e', bg: '#fefce8', icon: DollarSign }
        ]
      },
    };
    return configs[selectedOverview] || configs.beds;
  };
  const overviewData = getOverviewData();

  // Stat cards configuration
  const statCards = [
    { title: 'Total Properties', value: propertyStats.total, icon: Building2, color: 'bg-blue-600', bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100', trend: null, trendValue: null },
    { title: 'Total Rooms', value: roomStats.total, icon: DoorOpen, color: 'bg-purple-600', bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100', trend: null, trendValue: null },
    { title: 'Bed Occupancy', value: `${roomStats.occupiedBeds}/${roomStats.totalBeds}`, icon: BedIcon, color: 'bg-green-600', bgColor: 'bg-gradient-to-br from-green-50 to-green-100', trend: null, trendValue: null },
    { title: 'Active Tenants', value: tenantStats.active, icon: Users, color: 'bg-orange-600', bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100', trend: null, trendValue: null },
    { title: 'Monthly Revenue', value: formatCurrency(paymentStats.current_month_collected), icon: CreditCard, color: 'bg-indigo-600', bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100', trend: mom >= 0 ? 'up' : 'down', trendValue: Math.abs(mom).toFixed(1) },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Sora', sans-serif; }
        .dash-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes shimmerAnim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .fade-card { animation: fadeUp 0.4s ease both; }
        .fade-card:nth-child(1) { animation-delay: .04s; }
        .fade-card:nth-child(2) { animation-delay: .09s; }
        .fade-card:nth-child(3) { animation-delay: .14s; }
        .fade-card:nth-child(4) { animation-delay: .19s; }
        .fade-card:nth-child(5) { animation-delay: .24s; }
        .section-card { animation: scaleIn 0.45s ease both; }
        .shimmer {
          background: linear-gradient(90deg, #e8edf7 25%, #d4dced 50%, #e8edf7 75%);
          background-size: 200% 100%;
          animation: shimmerAnim 1.5s infinite;
          border-radius: 8px;
        }
        .stat-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(10,22,40,0.12) !important;
        }
        .bar-hover:hover .bar-fill {
          filter: brightness(1.08);
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      <div className="min-h-screen font-['Sora',sans-serif] relative" style={{ background: '#f0f4fb' }}>

        {/* Subtle grid pattern */}
        <div className="fixed inset-0 z-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(#c7d4e8 1px, transparent 1px), linear-gradient(90deg, #c7d4e8 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          opacity: 0.25
        }} />

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

        <div className="relative z-10 px-4 pt-4 pb-8">

          {/* Top Bar */}
          <div className="flex items-center justify-end mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value as DateRangeType)}
                className="bg-white border font-semibold text-xs rounded-xl px-4 py-2.5 pr-9 outline-none cursor-pointer"
                style={{ border: '1.5px solid #e2e8f0', color: '#1e3a5f', fontFamily: 'Sora, sans-serif' }}>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 text-xs font-semibold rounded-xl px-4 py-2.5 bg-white transition-all hover:shadow-md disabled:opacity-60"
                style={{ border: '1.5px solid #e2e8f0', color: '#1e3a5f' }}>
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} style={{ color: '#eab308' }} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {statCards.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                bgColor={stat.bgColor}
                trend={stat.trend}
                trendValue={stat.trendValue}
                loading={loading}
              />
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Occupancy Overview */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800">{overviewData.title}</CardTitle>
                    <p className="text-xs text-gray-500">Current overview</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowOverviewMenu(!showOverviewMenu)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    {showOverviewMenu && (
                      <div className="absolute right-0 top-10 w-36 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                        {(['beds', 'rooms', 'property', 'tenants', 'expenses', 'income'] as OverviewType[]).map(t => (
                          <button
                            key={t}
                            onClick={() => { setSelectedOverview(t); setShowOverviewMenu(false); }}
                            className={`w-full text-left px-3 py-2 text-xs font-medium capitalize transition-colors
                              ${selectedOverview === t ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-col items-center">
                  {/* Donut Chart */}
                  <div className="relative w-36 h-36 mb-6">
                    <svg viewBox="0 0 136 136" className="w-36 h-36">
                      <circle cx="68" cy="68" r="54" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                      <circle cx="68" cy="68" r="54" fill="none"
                        stroke={overviewData.color || '#1e3a5f'}
                        strokeWidth="12"
                        strokeDasharray={`${(overviewData.percent / 100) * 339.3} 339.3`}
                        strokeLinecap="round"
                        strokeDashoffset="84.8"
                        style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black dash-mono" style={{ color: '#0a1628' }}>{overviewData.percent}%</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold mt-0.5 text-gray-500">{overviewData.label}</span>
                    </div>
                  </div>

                  {/* Stats List */}
                  <div className="w-full space-y-3">
                    {overviewData.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl transition-all"
                        style={{ background: item.bg, border: `1.5px solid ${item.color}20` }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: `${item.color}18` }}>
                            <item.icon className="w-4 h-4" style={{ color: item.color }} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </div>
                        <span className="text-lg font-black dash-mono" style={{ color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rent Activity */}
            <Card className="border-0 shadow-lg lg:col-span-2 overflow-hidden">
              <CardHeader className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#0f2462] via-[#0d3184] to-[#133ec0]"
                >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(234,179,8,0.2)', border: '1.5px solid rgba(234,179,8,0.35)' }}>
                      <TrendingUp className="w-5 h-5" style={{ color: '#fbbf24' }} />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base font-bold">Rent Activity</CardTitle>
                      <p className="text-xs text-slate-300">Monthly income trend</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFinancialTrend(true)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                      <BarChart3 className="w-4 h-4 text-slate-200" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1e40af' }} />
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                    <IndianRupee className="w-12 h-12 mb-3" />
                    <p className="text-sm">No payment data available</p>
                  </div>
                ) : (
                  <>
                    {/* Summary */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-1 text-gray-500">This Month</p>
                        <p className="text-3xl font-black dash-mono" style={{ color: '#0a1628' }}>
                          {formatCurrency(currentMonth?.income || 0)}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold dash-mono border
                        ${mom >= 0 ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                        {mom >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {mom >= 0 ? '+' : ''}{mom.toFixed(1)}% vs last month
                      </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="relative h-48">
                      <div className="absolute left-0 top-0 h-40 flex flex-col justify-between text-xs text-gray-400">
                        {[1, 0.75, 0.5, 0.25, 0].map(r => (
                          <span key={r} className="dash-mono text-[10px]">{formatCurrency(maxAmount * r)}</span>
                        ))}
                      </div>
                      <div className="absolute bottom-5 left-16 right-0 h-40 flex items-end gap-3">
                        {chartData.map((item, idx) => {
                          const hPct = maxAmount > 0 ? Math.max((item.amount / maxAmount) * 95, 3) : 3;
                          const isLast = idx === chartData.length - 1;
                          const isAnim = animatedHeights.includes(idx);
                          return (
                            <div key={idx} className="bar-hover flex-1 flex flex-col items-center cursor-pointer">
                              <div
                                className="bar-fill w-full rounded-t-lg transition-all duration-500 relative"
                                style={{
                                  height: isAnim ? `${hPct}%` : '0%',
                                  minHeight: 4,
                                  background: isLast
                                    ? 'linear-gradient(180deg, #1e40af 0%, #3b82f6 100%)'
                                    : 'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%)',
                                  border: `1.5px solid ${isLast ? 'rgba(30,64,175,0.3)' : '#dbeafe'}`,
                                  boxShadow: isLast ? '0 4px 16px rgba(30,64,175,0.25)' : 'none',
                                  transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }}>
                                {isLast && (
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold dash-mono px-2 py-1 rounded-lg text-white"
                                    style={{ background: '#1e40af', boxShadow: '0 2px 8px rgba(30,64,175,0.3)' }}>
                                    {formatCurrency(item.amount)}
                                  </div>
                                )}
                              </div>
                              <span className={`text-[11px] mt-2 font-semibold ${isLast ? 'text-blue-700' : 'text-gray-500'}`}>
                                {item.month}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="flex mt-6 pt-4 border-t border-gray-100 gap-6">
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Monthly Avg</p>
                        <p className="text-base font-black dash-mono text-gray-800">
                          {chartData.length > 0 ? formatCurrency(Math.round(chartData.reduce((s, d) => s + d.amount, 0) / chartData.length)) : '₹0'}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Total Collected</p>
                        <p className="text-base font-black dash-mono text-blue-700">{formatCurrency(paymentStats.total_collected)}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Transactions</p>
                        <p className="text-base font-black dash-mono text-amber-700">{paymentStats.total_transactions}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#0f2462] via-[#0d3184] to-[#133ec0]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(234,179,8,0.2)', border: '1.5px solid rgba(234,179,8,0.35)' }}>
                      <CreditCard className="w-5 h-5" style={{ color: '#fbbf24' }} />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base font-bold">Payment Methods</CardTitle>
                      <p className="text-xs text-slate-300">Transaction breakdown</p>
                    </div>
                  </div>
                  <span className="dash-mono px-3 py-1 rounded-full text-[11px] font-bold"
                    style={{ background: 'rgba(234,179,8,0.15)', color: '#fbbf24', border: '1px solid rgba(234,179,8,0.25)' }}>
                    {paymentStats.total_transactions} txns
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1e40af' }} />
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                    <CreditCard className="w-12 h-12 mb-3" />
                    <p className="text-sm">No payment data available</p>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Donut Chart */}
                    <div className="w-40 h-40 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentMethods}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            dataKey="value"
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                            paddingAngle={2}>
                            {paymentMethods.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex-1">
                      {paymentMethods.map(m => {
                        const pct = paymentStats.total_transactions > 0
                          ? Math.round((m.value / paymentStats.total_transactions) * 100) : 0;
                        return (
                          <div key={m.name} className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                                <span className="text-sm font-medium text-gray-700">{m.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black dash-mono text-gray-800">{m.value}</span>
                                <span className="text-[11px] dash-mono text-gray-400">({pct}%)</span>
                              </div>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: m.color }} />
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-3 mt-1 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Total</span>
                        <span className="text-lg font-black dash-mono text-gray-800">{paymentStats.total_transactions}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="p-4 border-b border-gray-100"
                style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fffbeb 100%)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-[#0f2462] via-[#0d3184] to-[#133ec0]">
                      <IndianRupee className="w-5 h-5" style={{ color: '#eab308' }} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-gray-800">Financial Summary</CardTitle>
                      <p className="text-xs text-gray-500">Revenue & expenses</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold dash-mono
                    ${profitMargin >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}
                    style={{ border: `1px solid ${profitMargin >= 0 ? '#bbf7d0' : '#fecaca'}` }}>
                    {profitMargin.toFixed(1)}% margin
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  {[
                    {
                      label: 'Total Revenue', value: paymentStats.total_collected,
                      sub: `${paymentStats.total_transactions} transactions`,
                      color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe', iconBg: '#dbeafe', Icon: TrendingUp
                    },
                    {
                      label: 'Total Expenses', value: expenseTotal,
                      sub: `${expenses.length} expense records`,
                      color: '#dc2626', bg: '#fef2f2', border: '#fecaca', iconBg: '#fee2e2', Icon: TrendingDown
                    },
                    {
                      label: 'Net Profit', value: netProfit,
                      sub: `${profitMargin.toFixed(1)}% profit margin`,
                      color: netProfit >= 0 ? '#854d0e' : '#dc2626',
                      bg: netProfit >= 0 ? '#fefce8' : '#fef2f2',
                      border: netProfit >= 0 ? '#fde68a' : '#fecaca',
                      iconBg: netProfit >= 0 ? '#fef9c3' : '#fee2e2',
                      Icon: IndianRupee
                    },
                  ].map(({ label, value, sub, color, bg, border, iconBg, Icon }) => (
                    <div key={label}
                      className="flex items-center justify-between gap-3 rounded-xl p-3.5"
                      style={{ background: bg, border: `1.5px solid ${border}` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: iconBg }}>
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5 text-gray-600">{label}</p>
                          <p className="text-[11px] text-gray-500">{sub}</p>
                        </div>
                      </div>
                      {loading
                        ? <div className="shimmer w-20 h-6" />
                        : <span className="text-xl font-black dash-mono flex-shrink-0" style={{ color }}>{formatCurrency(value)}</span>
                      }
                    </div>
                  ))}

                  {/* Expense Ratio */}
                  <div className="p-4 rounded-xl mt-2" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Expense Ratio</span>
                      <span className="text-sm font-black dash-mono text-gray-800">
                        {paymentStats.total_collected > 0 ? Math.round((expenseTotal / paymentStats.total_collected) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-gray-200">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${paymentStats.total_collected > 0 ? Math.min((expenseTotal / paymentStats.total_collected) * 100, 100) : 0}%`,
                          background: 'linear-gradient(90deg, #eab308 0%, #dc2626 100%)'
                        }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[9px] font-semibold text-gray-400">Low risk</span>
                      <span className="text-[9px] font-semibold text-gray-400">High risk</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}