"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import {
  Building2, DoorOpen, Users, CreditCard, TrendingUp,
  MoreVertical, Filter, ChevronDown, Calendar, X, BarChart3,
  TrendingDown, IndianRupee, AlertCircle, Loader2, RefreshCw,
  Wallet, Banknote, Landmark, Receipt, CheckCircle2, Clock,
  Home, Bed as BedIcon, DollarSign, Sparkles, ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

import * as paymentApi from '@/lib/paymentRecordApi';
import { getExpenses, type Expense } from '@/lib/expenseApi';
import { listProperties } from '@/lib/propertyApi';
import { listRooms } from '@/lib/roomsApi';
import { listTenants } from '@/lib/tenantApi';

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

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e8edf5',
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: '0 8px 32px rgba(15,23,60,0.12)',
      }}>
        <p style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
            <span style={{ color: '#0f172a', fontSize: '12px', fontWeight: 700, fontFamily: 'DM Mono, monospace' }}>
              {formatCurrency ? formatCurrency(entry.value) : entry.value}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{entry.name}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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
  const availableYears = useMemo(() => [...new Set(data.map(d => d.year))].sort((a, b) => b - a), [data]);
  const filteredData = useMemo(() => selectedYear === 'all' ? data : data.filter(d => d.year === selectedYear), [data, selectedYear]);

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

  const colors = { income: '#0ea5e9', expense: '#f43f5e', profit: '#8b5cf6' };
  const axisStyle = { fill: '#94a3b8', fontSize: 10, fontFamily: 'DM Mono, monospace' };
  const gridStyle = { stroke: '#f1f5f9', strokeDasharray: '4 4' };

  const renderChart = () => {
    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Loader2 style={{ width: 28, height: 28, color: '#8b5cf6', animation: 'spin 1s linear infinite' }} /></div>;
    if (!chartData.length) return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1' }}><BarChart3 style={{ width: 36, height: 36, marginBottom: 8 }} /><p style={{ fontSize: 12, margin: 0 }}>No data</p></div>;

    const commonProps = { margin: { top: 10, right: 10, left: 0, bottom: 20 } };

    if (chartType === 'area') return (
      <AreaChart data={chartData} {...commonProps}>
        <defs>
          {(['income', 'expense', 'profit'] as const).map(k => (
            <linearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[k]} stopOpacity={0.15} />
              <stop offset="95%" stopColor={colors[k]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} {...gridStyle} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisStyle} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={formatCurrency} width={72} />
        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 10, fontSize: 10, fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#64748b' }} />
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
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 10, fontSize: 10, fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#64748b' }} />
        {activeTab === 'all' ? (
          <>
            <Line type="monotone" dataKey="income" stroke={colors.income} strokeWidth={2.5} dot={{ r: 3, fill: colors.income }} name="Income" />
            <Line type="monotone" dataKey="expense" stroke={colors.expense} strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 3, fill: colors.expense }} name="Expense" />
            <Line type="monotone" dataKey="profit" stroke={colors.profit} strokeWidth={2.5} dot={{ r: 3, fill: colors.profit }} name="Profit" />
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
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 10, fontSize: 10, fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#64748b' }} />
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: 940, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 40px 80px rgba(15,23,42,0.2), 0 0 0 1px rgba(15,23,42,0.06)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #fafbff 0%, #f8fafc 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
              <BarChart3 style={{ width: 16, height: 16, color: '#fff' }} />
            </div>
            <div>
              <h2 style={{ color: '#0f172a', fontSize: 14, fontWeight: 800, margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Financial Trend Analysis</h2>
              <p style={{ color: '#94a3b8', fontSize: 11, margin: 0 }}>{filteredData.length} months of data</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: '#f8fafc', border: '1px solid #e8edf5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: 14, height: 14, color: '#64748b' }} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, padding: '16px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbff' }}>
          {[
            { label: 'Total Income', val: totalIncome, avg: avgIncome, color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', Icon: TrendingUp },
            { label: 'Total Expense', val: totalExpense, avg: avgExpense, color: '#f43f5e', bg: '#fff1f2', border: '#fecdd3', Icon: TrendingDown },
            { label: 'Net Profit', val: totalProfit, avg: avgProfit, color: '#8b5cf6', bg: '#faf5ff', border: '#e9d5ff', Icon: IndianRupee },
          ].map(({ label, val, avg, color, bg, border, Icon }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Icon style={{ width: 13, height: 13, color }} />
                <span style={{ color: '#64748b', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{label}</span>
              </div>
              <p style={{ color, fontSize: 22, fontWeight: 800, margin: 0, fontFamily: 'DM Mono, monospace' }}>{formatCurrency(val)}</p>
              <p style={{ color: '#94a3b8', fontSize: 10, margin: '4px 0 0' }}>Avg/month: <strong style={{ color: '#64748b', fontFamily: 'DM Mono, monospace' }}>{formatCurrency(avg)}</strong></p>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3 }}>
              {(['all', 'income', 'expense', 'profit'] as FinancialTab[]).map(tab => (
                <button key={tab} onClick={() => onTabChange(tab)} style={{
                  padding: '5px 13px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11,
                  fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.18s',
                  background: activeTab === tab ? '#fff' : 'transparent',
                  color: activeTab === tab ? '#0f172a' : '#94a3b8',
                  boxShadow: activeTab === tab ? '0 1px 4px rgba(15,23,42,0.1)' : 'none'
                }}>{tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
              ))}
            </div>
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2 }}>
              {(['area', 'line', 'bar'] as ChartType[]).map(type => (
                <button key={type} onClick={() => onChartTypeChange(type)} style={{
                  width: 30, height: 30, borderRadius: 7, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s',
                  background: chartType === type ? '#fff' : 'transparent',
                  boxShadow: chartType === type ? '0 1px 4px rgba(15,23,42,0.1)' : 'none'
                }}>
                  {type === 'line' ? <TrendingUp style={{ width: 13, height: 13, color: chartType === type ? '#8b5cf6' : '#94a3b8' }} /> : <BarChart3 style={{ width: 13, height: 13, color: chartType === type ? '#8b5cf6' : '#94a3b8' }} />}
                </button>
              ))}
            </div>
          </div>
          <select value={selectedYear} onChange={e => onYearChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} style={{
            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, padding: '6px 12px',
            color: '#475569', fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif', cursor: 'pointer', outline: 'none'
          }}>
            <option value="all">All Years</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ flex: 1, padding: '16px 24px', minHeight: 300 }}>
          <ResponsiveContainer width="100%" height={280}>{renderChart()}</ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [propertyStats, setPropertyStats] = useState({ total: 0, active: 0 });
  const [roomStats, setRoomStats] = useState({ total: 0, active: 0, totalBeds: 0, occupiedBeds: 0 });
  const [tenantStats, setTenantStats] = useState({ total: 0, active: 0 });
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState({
    total_collected: 0, total_transactions: 0, cash_payments: 0,
    online_payments: 0, bank_transfers: 0, card_payments: 0,
    cheque_payments: 0, current_month_collected: 0, rent_collected: 0
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeType>('year');

  const [showFinancialTrend, setShowFinancialTrend] = useState(false);
  const [financialTab, setFinancialTab] = useState<FinancialTab>('all');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [financialYear, setFinancialYear] = useState<number | 'all'>('all');
  const [selectedOverview, setSelectedOverview] = useState<string>('beds');
  const [showOverviewMenu, setShowOverviewMenu] = useState(false);

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
      const propertiesRes = await listProperties({ pageSize: 1000 });
      const propertiesData = propertiesRes.success ? (propertiesRes.data?.data || propertiesRes.data || []) : [];
      setPropertyStats({ total: propertiesData.length, active: propertiesData.filter((p: any) => p.is_active === true).length });

      const roomsRes = await listRooms();
      const roomsData = roomsRes.success ? (roomsRes.data || []) : [];
      const totalBeds = roomsData.reduce((s: number, r: any) => s + (Number(r.total_bed) || Number(r.total_beds) || 0), 0);
      const occupiedBeds = roomsData.reduce((s: number, r: any) => s + (Number(r.occupied_beds) || 0), 0);
      setRoomStats({ total: roomsData.length, active: roomsData.filter((r: any) => r.is_active === true).length, totalBeds, occupiedBeds });

      const tenantsRes = await listTenants({ pageSize: 1000 });
      const tenantsData = tenantsRes.success ? (tenantsRes.data || []) : [];
      setTenantStats({ total: tenantsData.length, active: tenantsData.filter((t: any) => t.is_active === true || t.status === 'active').length });

      const paymentsRes = await paymentApi.getPayments();
      let pmts: any[] = [];
      if (paymentsRes.success && paymentsRes.data) {
        pmts = paymentsRes.data; setAllPayments(pmts);
        const ap = pmts.filter((p: any) => p.status === 'approved' || p.status === 'paid');
        const totalCollected = ap.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
        const cd = new Date();
        const cm = ap.filter((p: any) => { const d = new Date(p.payment_date); return d.getMonth() === cd.getMonth() && d.getFullYear() === cd.getFullYear(); });
        setPaymentStats({
          total_collected: totalCollected, total_transactions: ap.length,
          cash_payments: ap.filter((p: any) => p.payment_mode === 'cash').length,
          online_payments: ap.filter((p: any) => p.payment_mode === 'online').length,
          bank_transfers: ap.filter((p: any) => p.payment_mode === 'bank_transfer').length,
          card_payments: ap.filter((p: any) => p.payment_mode === 'card').length,
          cheque_payments: ap.filter((p: any) => p.payment_mode === 'cheque').length,
          current_month_collected: cm.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0),
          rent_collected: ap.filter((p: any) => p.payment_type === 'rent').reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
        });
      }
      const expData = await getExpenses(); setExpenses(expData);
      setExpenseTotal(expData.reduce((s, e) => s + (Number(e.total_amount) || 0), 0));
      await generateChartData(pmts, expData);
    } catch (error) {
      console.error(error); toast.error('Failed to load dashboard data');
    } finally { setLoading(false); }
  }, [generateChartData]);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (allPayments.length > 0 || expenses.length > 0) generateChartData(allPayments, expenses); }, [dateRange, allPayments, expenses]);

  const handleRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); toast.success('Dashboard refreshed'); };

  const occupancyPercent = roomStats.totalBeds > 0 ? Math.round((roomStats.occupiedBeds / roomStats.totalBeds) * 100) : 0;
  const propertyOccupancyPercent = propertyStats.total > 0 ? Math.round((propertyStats.active / propertyStats.total) * 100) : 0;
  const tenantOccupancyPercent = tenantStats.total > 0 ? Math.round((tenantStats.active / tenantStats.total) * 100) : 0;
  const netProfit = paymentStats.total_collected - expenseTotal;
  const profitMargin = paymentStats.total_collected > 0 ? (netProfit / paymentStats.total_collected) * 100 : 0;
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const mom = currentMonth && previousMonth && previousMonth.income > 0 ? ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100 : 0;

  const chartData = monthlyData.slice(-6).map(d => ({ month: d.month.substring(0, 3), amount: d.income }));
  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

  const paymentMethods = [
    { name: 'Cash', value: paymentStats.cash_payments, color: '#10b981' },
    { name: 'Online', value: paymentStats.online_payments, color: '#0ea5e9' },
    { name: 'Bank Transfer', value: paymentStats.bank_transfers, color: '#8b5cf6' },
    { name: 'Card', value: paymentStats.card_payments, color: '#f43f5e' },
    { name: 'Cheque', value: paymentStats.cheque_payments, color: '#f59e0b' },
  ].filter(m => m.value > 0);

  const getOverviewData = () => {
    const configs: Record<string, any> = {
      beds: { title: 'Beds', percent: occupancyPercent, label: 'Occupied', color: '#0ea5e9', items: [{ label: 'Total Beds', value: roomStats.totalBeds, color: '#0ea5e9', icon: BedIcon }, { label: 'Occupied', value: roomStats.occupiedBeds, color: '#10b981', icon: Users }, { label: 'Available', value: roomStats.totalBeds - roomStats.occupiedBeds, color: '#f59e0b', icon: BedIcon }] },
      rooms: { title: 'Rooms', percent: roomStats.total > 0 ? Math.round((roomStats.active / roomStats.total) * 100) : 0, label: 'Occupied', color: '#8b5cf6', items: [{ label: 'Total Rooms', value: roomStats.total, color: '#8b5cf6', icon: DoorOpen }, { label: 'Occupied', value: roomStats.active, color: '#10b981', icon: Home }, { label: 'Vacant', value: roomStats.total - roomStats.active, color: '#f59e0b', icon: DoorOpen }] },
      property: { title: 'Properties', percent: propertyOccupancyPercent, label: 'Active', color: '#f43f5e', items: [{ label: 'Total', value: propertyStats.total, color: '#f43f5e', icon: Building2 }, { label: 'Active', value: propertyStats.active, color: '#10b981', icon: Building2 }] },
      tenants: { title: 'Tenants', percent: tenantOccupancyPercent, label: 'Active', color: '#f59e0b', items: [{ label: 'Total', value: tenantStats.total, color: '#f59e0b', icon: Users }, { label: 'Active', value: tenantStats.active, color: '#10b981', icon: Users }, { label: 'Inactive', value: tenantStats.total - tenantStats.active, color: '#f43f5e', icon: Users }] },
    };
    return configs[selectedOverview] || configs.beds;
  };
  const overviewData = getOverviewData();

  const statCards = [
    { title: 'Properties', value: propertyStats.total, sub: `${propertyStats.active} active`, icon: Building2, grad: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', light: '#f0f9ff', accent: '#0ea5e9', shadow: 'rgba(14,165,233,0.22)', trend: 'up', tv: '12' },
    { title: 'Total Rooms', value: roomStats.total, sub: `${roomStats.active} occupied`, icon: DoorOpen, grad: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', light: '#faf5ff', accent: '#8b5cf6', shadow: 'rgba(139,92,246,0.22)', trend: 'up', tv: '8' },
    { title: 'Bed Occupancy', value: `${roomStats.occupiedBeds}/${roomStats.totalBeds}`, sub: `${occupancyPercent}% filled`, icon: BedIcon, grad: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', light: '#f0fdf4', accent: '#10b981', shadow: 'rgba(16,185,129,0.22)', trend: 'up', tv: '5' },
    { title: 'Active Tenants', value: tenantStats.active, sub: `of ${tenantStats.total} total`, icon: Users, grad: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', light: '#fffbeb', accent: '#f59e0b', shadow: 'rgba(245,158,11,0.22)', trend: 'up', tv: '3' },
    { title: 'Monthly Revenue', value: formatCurrency(paymentStats.current_month_collected), sub: 'vs last month', icon: IndianRupee, grad: mom >= 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', light: mom >= 0 ? '#f0fdf4' : '#fff1f2', accent: mom >= 0 ? '#10b981' : '#f43f5e', shadow: mom >= 0 ? 'rgba(16,185,129,0.22)' : 'rgba(244,63,94,0.22)', trend: mom >= 0 ? 'up' : 'down', tv: Math.abs(mom).toFixed(1) },
  ];

  const mono: React.CSSProperties = { fontFamily: '"DM Mono","Fira Code",monospace' };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        .sc { animation: fadeUp 0.45s ease both; }
        .sc:nth-child(1){animation-delay:.04s}.sc:nth-child(2){animation-delay:.08s}
        .sc:nth-child(3){animation-delay:.12s}.sc:nth-child(4){animation-delay:.16s}
        .sc:nth-child(5){animation-delay:.2s}
        .section-card { animation: scaleIn 0.5s ease both; }
        .hov { transition: box-shadow 0.2s ease, transform 0.2s ease; }
        .hov:hover { box-shadow: 0 16px 48px rgba(15,23,42,0.1) !important; transform: translateY(-2px); }
        .stat-card-hov { transition: all 0.2s ease; }
        .stat-card-hov:hover { transform: translateY(-3px); box-shadow: 0 16px 40px var(--card-shadow) !important; }
        .bar-wrap:hover .bar-inner { filter: brightness(1.06); }
        select { appearance:none; -webkit-appearance:none; }
        select option { background:#fff; color:#0f172a; }
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#f8fafc}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px}
        @media(max-width:1150px){.sg{grid-template-columns:repeat(3,1fr)!important}}
        @media(max-width:700px){.sg{grid-template-columns:repeat(2,1fr)!important}.mg{grid-template-columns:1fr!important}.bg{grid-template-columns:1fr!important}}
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f4f6fb', padding: '20px 24px 32px', fontFamily: 'Plus Jakarta Sans, sans-serif', position: 'relative' }}>

        {/* Subtle dot grid background */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'radial-gradient(#dde3ee 1.5px, transparent 1.5px)', backgroundSize: '30px 30px', opacity: 0.7, pointerEvents: 'none' }} />

        {/* Top rainbow stripe */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #0ea5e9 0%, #8b5cf6 40%, #10b981 70%, #f59e0b 100%)', zIndex: 200 }} />

        {showFinancialTrend && (
          <FinancialTrendChart data={monthlyData} activeTab={financialTab} chartType={chartType} selectedYear={financialYear}
            onTabChange={setFinancialTab} onChartTypeChange={setChartType} onYearChange={setFinancialYear}
            onClose={() => setShowFinancialTrend(false)} loading={loading} formatCurrency={formatCurrency} />
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── Top Bar ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px #d1fae5' }} />
                <span style={{ color: '#64748b', fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase' }}>Live</span>
              </div>
              <h1 style={{ color: '#0f172a', fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
                Admin Dashboard
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <select value={dateRange} onChange={e => setDateRange(e.target.value as DateRangeType)} style={{
                  background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12,
                  padding: '8px 36px 8px 14px', color: '#374151', fontSize: 12,
                  fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, cursor: 'pointer', outline: 'none',
                  boxShadow: '0 1px 6px rgba(15,23,42,0.06)'
                }}>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                  <option value="all">All Time</option>
                </select>
                <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
              <button onClick={handleRefresh} disabled={refreshing} style={{
                display: 'flex', alignItems: 'center', gap: 6, background: '#fff',
                border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '8px 16px',
                color: '#374151', fontSize: 12, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600,
                cursor: 'pointer', boxShadow: '0 1px 6px rgba(15,23,42,0.06)', transition: 'all 0.18s'
              }}>
                <RefreshCw style={{ width: 13, height: 13, color: '#8b5cf6', ...(refreshing ? { animation: 'spin 1s linear infinite' } : {}) }} />
                Refresh
              </button>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="sg" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 20 }}>
            {statCards.map((card, i) => (
              <div
                key={i}
                className="sc stat-card-hov"
                style={{
                  background: '#fff', borderRadius: 20, padding: '18px 16px',
                  boxShadow: `0 2px 14px ${card.shadow}`,
                  border: '1px solid rgba(255,255,255,0.9)',
                  overflow: 'hidden', position: 'relative',
                  '--card-shadow': card.shadow,
                } as any}
              >
                {/* Colored top accent + soft bg wash */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: card.grad, borderRadius: '20px 20px 0 0' }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 20px 0 80px', background: card.light, opacity: 0.7 }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: card.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 18px ${card.shadow}` }}>
                    <card.icon style={{ width: 19, height: 19, color: '#fff' }} />
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 3, padding: '3px 9px', borderRadius: 20,
                    fontSize: 10, fontWeight: 700,
                    background: card.trend === 'up' ? '#f0fdf4' : '#fff1f2',
                    color: card.trend === 'up' ? '#059669' : '#e11d48', ...mono
                  }}>
                    {card.trend === 'up' ? <ArrowUpRight style={{ width: 10, height: 10 }} /> : <ArrowDownRight style={{ width: 10, height: 10 }} />}
                    {card.tv}%
                  </div>
                </div>

                {loading
                  ? <div style={{ height: 26, width: '65%', borderRadius: 6, background: 'linear-gradient(90deg,#f1f5f9 25%,#e8edf5 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 4 }} />
                  : <p style={{ color: '#0f172a', fontSize: 23, fontWeight: 800, margin: '0 0 3px', letterSpacing: '-0.02em', ...mono }}>{card.value}</p>
                }
                <p style={{ color: '#374151', fontSize: 11, margin: '0 0 2px', fontWeight: 700 }}>{card.title}</p>
                <p style={{ color: '#94a3b8', fontSize: 10, margin: 0 }}>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Main Row ── */}
          <div className="mg" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 16 }}>

            {/* Rent Activity */}
            <div className="hov section-card" style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 14px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
              <div style={{ padding: '16px 22px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #fafcff 0%, #f8fafc 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(14,165,233,0.28)' }}>
                    <TrendingUp style={{ width: 15, height: 15, color: '#fff' }} />
                  </div>
                  <div>
                    <h3 style={{ color: '#0f172a', fontSize: 13, fontWeight: 800, margin: 0 }}>Rent Activity</h3>
                    <p style={{ color: '#94a3b8', fontSize: 10, margin: 0 }}>Monthly income trend</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, background: '#f0f9ff', color: '#0ea5e9', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{dateRange}</span>
                  <button onClick={() => setShowFinancialTrend(true)} style={{ width: 32, height: 32, borderRadius: 9, background: '#f8fafc', border: '1.5px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' }}>
                    <BarChart3 style={{ width: 14, height: 14, color: '#64748b' }} />
                  </button>
                </div>
              </div>

              <div style={{ padding: '20px 24px' }}>
                {loading ? (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 style={{ width: 30, height: 30, color: '#0ea5e9', animation: 'spin 1s linear infinite' }} /></div>
                ) : chartData.length === 0 ? (
                  <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}><IndianRupee style={{ width: 36, height: 36, marginBottom: 8 }} /><p style={{ fontSize: 12, margin: 0 }}>No payment data</p></div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                      <div>
                        <p style={{ color: '#94a3b8', fontSize: 9, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 700 }}>This Month</p>
                        <p style={{ color: '#0f172a', fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.03em', ...mono }}>{formatCurrency(currentMonth?.income || 0)}</p>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 24,
                        background: mom >= 0 ? '#f0fdf4' : '#fff1f2',
                        border: `1.5px solid ${mom >= 0 ? '#bbf7d0' : '#fecdd3'}`,
                        color: mom >= 0 ? '#059669' : '#e11d48', fontSize: 11, fontWeight: 700, ...mono
                      }}>
                        {mom >= 0 ? <ArrowUpRight style={{ width: 13, height: 13 }} /> : <ArrowDownRight style={{ width: 13, height: 13 }} />}
                        {mom >= 0 ? '+' : ''}{mom.toFixed(1)}% vs last month
                      </div>
                    </div>

                    {/* Custom bar chart */}
                    <div style={{ position: 'relative', height: 170 }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        {[1, 0.5, 0].map(r => <span key={r} style={{ color: '#cbd5e1', fontSize: 9, ...mono }}>{formatCurrency(maxAmount * r)}</span>)}
                      </div>
                      <div style={{ position: 'absolute', bottom: 22, left: 46, right: 0, height: 140, display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                        {chartData.map((item, idx) => {
                          const hPct = maxAmount > 0 ? Math.max((item.amount / maxAmount) * 95, 3) : 3;
                          const isLast = idx === chartData.length - 1;
                          return (
                            <div key={idx} className="bar-wrap" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
                              <div className="bar-inner" style={{
                                width: '100%', height: `${hPct}%`, minHeight: 4,
                                borderRadius: '8px 8px 3px 3px',
                                background: isLast
                                  ? 'linear-gradient(180deg, #0ea5e9 0%, #38bdf8 100%)'
                                  : 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%)',
                                transition: 'all 0.4s ease',
                                boxShadow: isLast ? '0 4px 18px rgba(14,165,233,0.3)' : 'none',
                                border: `1.5px solid ${isLast ? 'rgba(14,165,233,0.3)' : '#e0f2fe'}`,
                                position: 'relative'
                              }}>
                                {isLast && (
                                  <div style={{
                                    position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)',
                                    background: '#0ea5e9', color: '#fff', borderRadius: 7,
                                    padding: '3px 8px', fontSize: 9, fontWeight: 700, whiteSpace: 'nowrap', ...mono,
                                    boxShadow: '0 3px 10px rgba(14,165,233,0.3)'
                                  }}>{formatCurrency(item.amount)}</div>
                                )}
                              </div>
                              <span style={{ color: isLast ? '#0ea5e9' : '#94a3b8', fontSize: 10, marginTop: 7, fontWeight: isLast ? 700 : 500, transition: 'all 0.18s' }}>{item.month}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9', gap: 0 }}>
                      {[
                        { label: 'Monthly Avg', value: chartData.length > 0 ? formatCurrency(Math.round(chartData.reduce((s, d) => s + d.amount, 0) / chartData.length)) : '₹0', color: '#475569' },
                        { label: 'Total Collected', value: formatCurrency(paymentStats.total_collected), color: '#0ea5e9' },
                        { label: 'Transactions', value: `${paymentStats.total_transactions}`, color: '#8b5cf6' },
                      ].map(({ label, value, color }, i) => (
                        <div key={i} style={{ flex: 1, paddingLeft: i > 0 ? 18 : 0, borderLeft: i > 0 ? '1px solid #f1f5f9' : 'none', marginLeft: i > 0 ? 18 : 0 }}>
                          <p style={{ color: '#94a3b8', fontSize: 9, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{label}</p>
                          <p style={{ color, fontSize: 15, fontWeight: 800, margin: 0, ...mono }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Overview Donut */}
            <div className="hov section-card" style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 14px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #fafcff 0%, #f8fafc 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: `linear-gradient(135deg, ${overviewData.color}, ${overviewData.color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${overviewData.color}40` }}>
                    <BarChart3 style={{ width: 15, height: 15, color: '#fff' }} />
                  </div>
                  <div>
                    <h3 style={{ color: '#0f172a', fontSize: 13, fontWeight: 800, margin: 0 }}>{overviewData.title}</h3>
                    <p style={{ color: '#94a3b8', fontSize: 10, margin: 0 }}>Occupancy overview</p>
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowOverviewMenu(!showOverviewMenu)} style={{ width: 30, height: 30, borderRadius: 8, background: '#f8fafc', border: '1.5px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MoreVertical style={{ width: 13, height: 13, color: '#64748b' }} />
                  </button>
                  {showOverviewMenu && (
                    <div style={{ position: 'absolute', right: 0, top: 36, width: 128, background: '#fff', border: '1px solid #e8edf5', borderRadius: 12, overflow: 'hidden', zIndex: 20, boxShadow: '0 12px 32px rgba(15,23,42,0.12)' }}>
                      {['beds', 'rooms', 'property', 'tenants'].map(t => (
                        <button key={t} onClick={() => { setSelectedOverview(t); setShowOverviewMenu(false); }} style={{
                          width: '100%', textAlign: 'left', padding: '9px 12px', border: 'none', cursor: 'pointer',
                          background: selectedOverview === t ? '#f0fdf4' : '#fff',
                          color: selectedOverview === t ? '#059669' : '#475569',
                          fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif',
                          fontWeight: selectedOverview === t ? 700 : 500, textTransform: 'capitalize', transition: 'all 0.15s'
                        }}>{t}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: '20px 18px' }}>
                {/* SVG Donut */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ position: 'relative', width: 136, height: 136 }}>
                    <svg viewBox="0 0 136 136" style={{ width: 136, height: 136 }}>
                      <circle cx="68" cy="68" r="54" fill="none" stroke="#f1f5f9" strokeWidth="11" />
                      <circle cx="68" cy="68" r="54" fill="none"
                        stroke={overviewData.color}
                        strokeWidth="11"
                        strokeDasharray={`${(overviewData.percent / 100) * 339.3} 339.3`}
                        strokeLinecap="round"
                        strokeDashoffset="84.8"
                        style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${overviewData.color}60)` }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#0f172a', fontSize: 26, fontWeight: 800, lineHeight: 1, ...mono }}>{overviewData.percent}%</span>
                      <span style={{ color: '#94a3b8', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 4, fontWeight: 700 }}>{overviewData.label}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {overviewData.items.map((item: any, idx: number) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', borderRadius: 13,
                      background: `${item.color}08`,
                      border: `1.5px solid ${item.color}20`,
                      transition: 'all 0.18s'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <item.icon style={{ width: 13, height: 13, color: item.color }} />
                        </div>
                        <span style={{ color: '#475569', fontSize: 11, fontWeight: 600 }}>{item.label}</span>
                      </div>
                      <span style={{ color: item.color, fontSize: 17, fontWeight: 800, ...mono }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom Row ── */}
          <div className="bg" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Payment Methods */}
            <div className="hov section-card" style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 14px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
              <div style={{ padding: '16px 22px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #fafcff 0%, #f8fafc 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139,92,246,0.28)' }}>
                    <CreditCard style={{ width: 15, height: 15, color: '#fff' }} />
                  </div>
                  <div>
                    <h3 style={{ color: '#0f172a', fontSize: 13, fontWeight: 800, margin: 0 }}>Payment Methods</h3>
                    <p style={{ color: '#94a3b8', fontSize: 10, margin: 0 }}>Transaction breakdown</p>
                  </div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 20, background: '#faf5ff', color: '#8b5cf6', fontSize: 10, fontWeight: 700, ...mono }}>{paymentStats.total_transactions} txns</span>
              </div>

              <div style={{ padding: '20px 24px' }}>
                {loading ? (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 style={{ width: 30, height: 30, color: '#8b5cf6', animation: 'spin 1s linear infinite' }} /></div>
                ) : paymentMethods.length === 0 ? (
                  <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}><CreditCard style={{ width: 36, height: 36, marginBottom: 8 }} /><p style={{ fontSize: 12, margin: 0 }}>No data</p></div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ width: 155, height: 155, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={48} outerRadius={68} dataKey="value"
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} paddingAngle={2}>
                            {paymentMethods.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ flex: 1 }}>
                      {paymentMethods.map(m => {
                        const pct = paymentStats.total_transactions > 0 ? Math.round((m.value / paymentStats.total_transactions) * 100) : 0;
                        return (
                          <div key={m.name} style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 9, height: 9, borderRadius: '50%', background: m.color }} />
                                <span style={{ color: '#475569', fontSize: 11, fontWeight: 600 }}>{m.name}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ color: '#0f172a', fontSize: 12, fontWeight: 800, ...mono }}>{m.value}</span>
                                <span style={{ color: '#94a3b8', fontSize: 9, ...mono }}>({pct}%)</span>
                              </div>
                            </div>
                            <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: m.color, borderRadius: 99, transition: 'width 0.7s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                      <div style={{ paddingTop: 10, marginTop: 4, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Total</span>
                        <span style={{ color: '#8b5cf6', fontSize: 17, fontWeight: 800, ...mono }}>{paymentStats.total_transactions}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="hov section-card" style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 14px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
              <div style={{ padding: '16px 22px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #fafcff 0%, #f8fafc 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245,158,11,0.28)' }}>
                    <IndianRupee style={{ width: 15, height: 15, color: '#fff' }} />
                  </div>
                  <div>
                    <h3 style={{ color: '#0f172a', fontSize: 13, fontWeight: 800, margin: 0 }}>Financial Summary</h3>
                    <p style={{ color: '#94a3b8', fontSize: 10, margin: 0 }}>Revenue & expenses</p>
                  </div>
                </div>
                <div style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  background: profitMargin >= 0 ? '#f0fdf4' : '#fff1f2',
                  color: profitMargin >= 0 ? '#059669' : '#e11d48', ...mono
                }}>{profitMargin.toFixed(1)}% margin</div>
              </div>

              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Total Revenue', value: paymentStats.total_collected, sub: `${paymentStats.total_transactions} transactions`, color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', iconBg: '#e0f2fe', Icon: TrendingUp },
                  { label: 'Total Expenses', value: expenseTotal, sub: `${expenses.length} expense records`, color: '#f43f5e', bg: '#fff1f2', border: '#fecdd3', iconBg: '#ffe4e6', Icon: TrendingDown },
                  { label: 'Net Profit', value: netProfit, sub: `${profitMargin.toFixed(1)}% profit margin`, color: netProfit >= 0 ? '#8b5cf6' : '#f59e0b', bg: netProfit >= 0 ? '#faf5ff' : '#fffbeb', border: netProfit >= 0 ? '#e9d5ff' : '#fde68a', iconBg: netProfit >= 0 ? '#ede9fe' : '#fef3c7', Icon: IndianRupee },
                ].map(({ label, value, sub, color, bg, border, iconBg, Icon }) => (
                  <div key={label} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon style={{ width: 16, height: 16, color }} />
                      </div>
                      <div>
                        <p style={{ color: '#475569', fontSize: 10, margin: '0 0 2px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                        <p style={{ color: '#94a3b8', fontSize: 10, margin: 0 }}>{sub}</p>
                      </div>
                    </div>
                    {loading
                      ? <div style={{ width: 72, height: 24, borderRadius: 6, background: '#f1f5f9', animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%' }} />
                      : <span style={{ color, fontSize: 19, fontWeight: 800, ...mono, flexShrink: 0 }}>{formatCurrency(value)}</span>
                    }
                  </div>
                ))}

                {/* Expense Ratio */}
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 13, border: '1px solid #f1f5f9', marginTop: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Expense Ratio</span>
                    <span style={{ color: '#0f172a', fontSize: 11, fontWeight: 800, ...mono }}>
                      {paymentStats.total_collected > 0 ? Math.round((expenseTotal / paymentStats.total_collected) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{ height: 8, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${paymentStats.total_collected > 0 ? Math.min((expenseTotal / paymentStats.total_collected) * 100, 100) : 0}%`,
                      background: 'linear-gradient(90deg, #fbbf24, #f43f5e)',
                      borderRadius: 99, transition: 'width 0.8s ease'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ color: '#94a3b8', fontSize: 9, fontWeight: 600 }}>Low risk</span>
                    <span style={{ color: '#94a3b8', fontSize: 9, fontWeight: 600 }}>High risk</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}