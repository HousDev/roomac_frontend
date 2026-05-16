"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { 
  Building2, DoorOpen, Users, TrendingUp, TrendingDown, 
  MoreVertical, ChevronDown, Calendar, X, BarChart3, 
  ChevronLeft, ChevronRight, CreditCard, IndianRupee, CheckCircle, 
  AlertCircle, Home, Bed, Phone, Mail, MessageSquare, PieChart,
  Clock, Receipt, DollarSign, Filter, RefreshCw,
  AreaChart as AreaChartIcon,
  ArrowRight
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, BarChart, Bar, LineChart, Line,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { useRouter } from 'next/navigation';

// API Imports
import { listProperties } from '@/lib/propertyApi';
import { listRooms } from '@/lib/roomsApi';
import { listTenants } from '@/lib/tenantApi';
import { getPayments } from '@/lib/paymentRecordApi';
import { getEnquiries } from '@/lib/enquiryApi';
import { getExpenses } from '@/lib/expenseApi';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Format currency in INR
const formatCurrency = (amount: number) => {
  if (!amount || amount === 0) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format compact currency (for chart axes)
const formatCompactCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, bgColor, onClick, link }: any) => (
  <div 
    className={`${bgColor} rounded-xl p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
    onClick={() => onClick && onClick(link)}
  >
    <div className="flex items-center gap-2 sm:gap-3">
      <div className={`${color} p-1.5 sm:p-2 rounded-lg shadow-sm flex-shrink-0`}>
        <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">{title}</p>
        <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  </div>
);

// Recent Payments Component
const RecentPaymentsTable = ({ payments, loading, onViewAll }: any) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-3 w-20" /></div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCard className="h-10 w-10 mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">No recent payments</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {payments.slice(0, 5).map((payment: any) => (
        <div 
          key={payment.id} 
          className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg cursor-pointer"
          onClick={() => router.push('/admin/payments')}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <IndianRupee className="h-3.5 w-3.5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{payment.tenant_name || 'Unknown'}</p>
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <span>{format(new Date(payment.payment_date), 'dd MMM yyyy')}</span>
                <span className="capitalize">{payment.payment_mode}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-gray-800">{formatCurrency(payment.amount)}</p>
            <Badge className={`${payment.status === 'approved' || payment.status === 'paid' ? 'bg-green-100 text-green-700' : payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'} text-[10px] px-1.5 py-0`}>
              {payment.status === 'approved' || payment.status === 'paid' ? 'Approved' : payment.status === 'pending' ? 'Pending' : 'Rejected'}
            </Badge>
          </div>
        </div>
      ))}
      <div className="pt-2 text-center">
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs text-blue-600">
          View All Payments <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};

// Recent Tenants Component
const RecentTenantsTable = ({ tenants, loading, onViewAll }: any) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-3 w-24" /></div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!tenants || tenants.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">No recent tenants</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tenants.slice(0, 5).map((tenant: any) => (
        <div 
          key={tenant.id} 
          className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg cursor-pointer"
          onClick={() => router.push(`/admin/tenants/${tenant.id}`)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-600">{tenant.full_name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{tenant.full_name}</p>
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <span>{tenant.phone || 'No phone'}</span>
              </div>
            </div>
          </div>
          <Badge className={tenant.is_active ? "bg-green-100 text-green-700 text-[10px]" : "bg-gray-100 text-gray-500 text-[10px]"}>
            {tenant.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      ))}
      <div className="pt-2 text-center">
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs text-blue-600">
          View All Tenants <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};

// Recent Enquiries Component
const RecentEnquiriesTable = ({ enquiries, loading, onViewAll }: any) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-3 w-20" /></div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!enquiries || enquiries.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-10 w-10 mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">No recent enquiries</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {enquiries.slice(0, 5).map((enquiry: any) => (
        <div 
          key={enquiry.id} 
          className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg cursor-pointer"
          onClick={() => router.push('/admin/enquiries')}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{enquiry.tenant_name}</p>
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <span>{enquiry.phone || 'No phone'}</span>
                <span>• {format(new Date(enquiry.created_at), 'dd MMM')}</span>
              </div>
            </div>
          </div>
          <Badge className={`${enquiry.status === 'new' ? 'bg-blue-100 text-blue-700' : enquiry.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' : enquiry.status === 'interested' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} text-[10px] px-1.5 py-0`}>
            {enquiry.status}
          </Badge>
        </div>
      ))}
      <div className="pt-2 text-center">
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs text-blue-600">
          View All Enquiries <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};

// Recent Expenses Component
const RecentExpensesTable = ({ expenses, loading, onViewAll }: any) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-3 w-20" /></div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="h-10 w-10 mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">No recent expenses</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {expenses.slice(0, 5).map((expense: any) => (
        <div 
          key={expense.id} 
          className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg cursor-pointer"
          onClick={() => router.push('/admin/expenses')}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Receipt className="h-3.5 w-3.5 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{expense.category_name || expense.vendor_name || 'Expense'}</p>
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <span>{format(new Date(expense.expense_date), 'dd MMM yyyy')}</span>
                <span className="capitalize">{expense.payment_mode || 'Cash'}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-red-600">{formatCurrency(expense.total_amount || expense.amount || 0)}</p>
            <Badge className={`${expense.status === 'Paid' ? 'bg-green-100 text-green-700' : expense.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'} text-[10px] px-1.5 py-0`}>
              {expense.status || 'Unpaid'}
            </Badge>
          </div>
        </div>
      ))}
      <div className="pt-2 text-center">
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs text-blue-600">
          View All Expenses <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};

// Financial Trend Modal Component
const FinancialTrendModal = ({ 
  open, 
  onClose, 
  payments, 
  expenses,
  monthlyData 
}: { 
  open: boolean; 
  onClose: () => void; 
  payments: any[]; 
  expenses: any[];
  monthlyData: any[];
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'revenue' | 'expenses' | 'profit'>('all');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2, currentYear - 3].filter(y => y >= 2020);
  
  // Filter data by year
  const filteredMonthlyData = monthlyData.filter(d => d.year === selectedYear);
  
  const revenueData = filteredMonthlyData.map(d => ({ month: d.month, value: d.revenue, label: 'Revenue' }));
  const expensesData = filteredMonthlyData.map(d => ({ month: d.month, value: d.expenses, label: 'Expenses' }));
  const profitData = filteredMonthlyData.map(d => ({ month: d.month, value: d.profit, label: 'Profit' }));
  
  const getChartData = () => {
    if (activeTab === 'all') {
      return filteredMonthlyData.map(d => ({
        month: d.month,
        revenue: d.revenue,
        expenses: d.expenses,
        profit: d.profit
      }));
    }
    if (activeTab === 'revenue') return revenueData;
    if (activeTab === 'expenses') return expensesData;
    return profitData;
  };
  
  const chartData = getChartData();
  const totalRevenue = filteredMonthlyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = filteredMonthlyData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const avgRevenue = totalRevenue / (filteredMonthlyData.length || 1);
  const avgExpenses = totalExpenses / (filteredMonthlyData.length || 1);
  const avgProfit = totalProfit / (filteredMonthlyData.length || 1);
  
  const getChartColor = () => {
    if (activeTab === 'revenue') return '#10b981';
    if (activeTab === 'expenses') return '#ef4444';
    if (activeTab === 'profit') return '#3b82f6';
    return undefined;
  };
  
  const renderChart = () => {
    if (activeTab === 'all') {
      if (chartType === 'bar') {
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={formatCompactCurrency} width={60} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="revenue" fill="#10b981" radius={[4,4,0,0]} name="Revenue" />
            <Bar dataKey="expenses" fill="#ef4444" radius={[4,4,0,0]} name="Expenses" />
          </BarChart>
        );
      } else if (chartType === 'line') {
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={formatCompactCurrency} width={60} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Expenses" />
            <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Profit" />
          </LineChart>
        );
      }
      return (
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={formatCompactCurrency} width={60} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
          <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
          <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
        </AreaChart>
      );
    }
    
    const color = getChartColor();
    if (chartType === 'bar') {
      return (
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={formatCompactCurrency} width={60} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Bar dataKey="value" fill={color} radius={[4,4,0,0]} name={activeTab === 'revenue' ? 'Revenue' : activeTab === 'expenses' ? 'Expenses' : 'Profit'} />
        </BarChart>
      );
    } else if (chartType === 'line') {
      return (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={formatCompactCurrency} width={60} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} name={activeTab === 'revenue' ? 'Revenue' : activeTab === 'expenses' ? 'Expenses' : 'Profit'} />
        </LineChart>
      );
    }
    return (
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={formatCompactCurrency} width={60} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" name={activeTab === 'revenue' ? 'Revenue' : activeTab === 'expenses' ? 'Expenses' : 'Profit'} />
      </AreaChart>
    );
  };
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-800">Financial Trend Analysis</h2>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Revenue vs Expenses vs Profit</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
        </div>

        {/* Stats Summary */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-green-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-600">Total Revenue</p>
                  <p className="text-sm font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
              <div className="mt-1 text-[10px] text-gray-500">Avg: {formatCurrency(avgRevenue)}</div>
            </div>
            <div className="bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-red-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-600">Total Expenses</p>
                  <p className="text-sm font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
              <div className="mt-1 text-[10px] text-gray-500">Avg: {formatCurrency(avgExpenses)}</div>
            </div>
            <div className="bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-blue-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-600">Net Profit</p>
                  <p className="text-sm font-bold text-blue-600">{formatCurrency(totalProfit)}</p>
                </div>
              </div>
              <div className="mt-1 text-[10px] text-gray-500">Avg: {formatCurrency(avgProfit)}</div>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="p-3 sm:p-4 flex-1 min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            {/* Year Filter */}
            <div className="flex items-center gap-2">
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="text-xs border rounded-md px-2 py-1 bg-white"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            {/* Tab Controls */}
            <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-lg border border-gray-200">
              <button 
                onClick={() => setActiveTab('all')} 
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveTab('revenue')} 
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${activeTab === 'revenue' ? 'bg-green-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                Revenue
              </button>
              <button 
                onClick={() => setActiveTab('expenses')} 
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${activeTab === 'expenses' ? 'bg-red-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                Expenses
              </button>
              <button 
                onClick={() => setActiveTab('profit')} 
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${activeTab === 'profit' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                Profit
              </button>
            </div>
            
            {/* Chart Type Controls */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200">
              <button 
                onClick={() => setChartType('area')} 
                className={`p-1 rounded transition-all ${chartType === 'area' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <AreaChartIcon className="w-3 h-3" />
              </button>
              <button 
                onClick={() => setChartType('bar')} 
                className={`p-1 rounded transition-all ${chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <BarChart3 className="w-3 h-3" />
              </button>
              <button 
                onClick={() => setChartType('line')} 
                className={`p-1 rounded transition-all ${chartType === 'line' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <LineChart className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="h-80 w-full">
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
  const router = useRouter();
  
  // State
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [selectedOverview, setSelectedOverview] = useState('beds');
  const [showOverviewMenu, setShowOverviewMenu] = useState(false);
  
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    totalRooms: 0,
    activeRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    totalTenants: 0,
    activeTenants: 0,
    totalCollected: 0,
    pendingAmount: 0,
    totalExpenses: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    netProfit: 0,
    totalTransactions: 0
  });
  
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentTenants, setRecentTenants] = useState<any[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  
  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2, currentYear - 3].filter(y => y >= 2020);

  // Generate monthly activity data (for chart and modal)
  const generateMonthlyData = useCallback(() => {
    const result: any[] = [];
    
    for (let year of availableYears) {
      for (let monthIndex = 0; monthIndex < allMonths.length; monthIndex++) {
        const monthName = allMonths[monthIndex];
        let revenue = 0;
        let expensesSum = 0;
        
        payments.forEach(payment => {
          if (payment.status === 'approved' || payment.status === 'paid') {
            const paymentDate = new Date(payment.payment_date);
            if (paymentDate.getFullYear() === year && paymentDate.getMonth() === monthIndex) {
              revenue += Number(payment.amount);
            }
          }
        });
        
        expenses.forEach(expense => {
          if (expense.status === 'Paid' || expense.status === 'Partial') {
            const expenseDate = new Date(expense.expense_date);
            if (expenseDate.getFullYear() === year && expenseDate.getMonth() === monthIndex) {
              expensesSum += Number(expense.total_paid || expense.total_amount || 0);
            }
          }
        });
        
        result.push({
          year,
          month: monthName,
          revenue,
          expenses: expensesSum,
          profit: revenue - expensesSum
        });
      }
    }
    
    return result;
  }, [payments, expenses, availableYears]);

  const monthlyData = generateMonthlyData();
  
  // Filter current year data for main chart
  const currentYearData = monthlyData.filter(d => d.year === filterYear);
  
  const totalRevenue = currentYearData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpensesSum = currentYearData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalRevenue - totalExpensesSum;
  
  const maxRevenue = Math.max(...currentYearData.map(d => d.revenue), 1);
  const maxExpense = Math.max(...currentYearData.map(d => d.expenses), 1);
  const maxValue = Math.max(maxRevenue, maxExpense, 1);

  // Load all data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch properties
      const propertiesRes = await listProperties({ pageSize: 1000 });
      let propertiesData: any[] = [];
      if (propertiesRes.success) {
        propertiesData = propertiesRes.data?.data || propertiesRes.data || [];
      }
      setProperties(propertiesData);
      
      // Fetch rooms
      const roomsRes = await listRooms();
      let roomsData: any[] = [];
      if (roomsRes && Array.isArray(roomsRes)) {
        roomsData = roomsRes;
      } else if (roomsRes?.data && Array.isArray(roomsRes.data)) {
        roomsData = roomsRes.data;
      }
      setRooms(roomsData);
      
      // Fetch tenants
      const tenantsRes = await listTenants({ pageSize: 1000 });
      let tenantsData: any[] = [];
      if (tenantsRes.success) {
        tenantsData = tenantsRes.data || [];
      }
      setTenants(tenantsData);
      
      // Fetch payments
      const paymentsRes = await getPayments({});
      let paymentsData: any[] = [];
      if (paymentsRes.success) {
        paymentsData = paymentsRes.data || [];
      }
      setPayments(paymentsData);
      
      // Fetch expenses
      const expensesRes = await getExpenses({});
      let expensesData: any[] = [];
      if (expensesRes && Array.isArray(expensesRes)) {
        expensesData = expensesRes;
      } else if (expensesRes?.data && Array.isArray(expensesRes.data)) {
        expensesData = expensesRes.data;
      }
      setExpenses(expensesData);
      
      // Fetch enquiries
      const enquiriesRes = await getEnquiries({});
      let enquiriesData: any[] = [];
      if (enquiriesRes.success) {
        enquiriesData = enquiriesRes.results || [];
      }
      setEnquiries(enquiriesData);
      
      // Calculate stats from rooms (more accurate for beds)
      const totalBeds = roomsData.reduce((sum, r) => sum + (Number(r.total_bed) || 0), 0);
      const occupiedBeds = roomsData.reduce((sum, r) => sum + (Number(r.occupied_beds) || 0), 0);
      const availableBeds = totalBeds - occupiedBeds;
      
      const totalRooms = roomsData.length;
      const activeRooms = roomsData.filter(r => r.is_active === true).length;
      
      const totalProperties = propertiesData.length;
      const activeProperties = propertiesData.filter(p => p.is_active === true).length;
      
      const totalTenants = tenantsData.length;
      const activeTenants = tenantsData.filter(t => t.is_active === true).length;
      
      const totalCollected = paymentsData
        .filter(p => p.status === 'approved' || p.status === 'paid')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const pendingAmount = paymentsData
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      
      const totalExpensesSumCalc = expensesData
        .filter(e => e.status === 'Paid' || e.status === 'Partial')
        .reduce((sum, e) => sum + Number(e.total_paid || e.total_amount || 0), 0);
      
      const currentDate = new Date();
      const currentMonthIndex = currentDate.getMonth();
      const currentYearNum = currentDate.getFullYear();
      
      const monthlyRevenue = paymentsData
        .filter(p => {
          const paymentDate = new Date(p.payment_date);
          return (p.status === 'approved' || p.status === 'paid') &&
                 paymentDate.getMonth() === currentMonthIndex &&
                 paymentDate.getFullYear() === currentYearNum;
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);
      
      const monthlyExpenses = expensesData
        .filter(e => {
          const expenseDate = new Date(e.expense_date);
          return (e.status === 'Paid' || e.status === 'Partial') &&
                 expenseDate.getMonth() === currentMonthIndex &&
                 expenseDate.getFullYear() === currentYearNum;
        })
        .reduce((sum, e) => sum + Number(e.total_paid || e.total_amount || 0), 0);
      
      setStats({
        totalProperties,
        activeProperties,
        totalRooms,
        activeRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        totalTenants,
        activeTenants,
        totalCollected,
        pendingAmount,
        totalExpenses: totalExpensesSumCalc,
        monthlyRevenue,
        monthlyExpenses,
        netProfit: monthlyRevenue - monthlyExpenses,
        totalTransactions: paymentsData.length
      });
      
      // Recent data
      const sortedPayments = [...paymentsData].sort((a, b) => 
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      );
      setRecentPayments(sortedPayments.slice(0, 5));
      
      const sortedTenants = [...tenantsData].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentTenants(sortedTenants.slice(0, 5));
      
      const sortedEnquiries = [...enquiriesData].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentEnquiries(sortedEnquiries.slice(0, 5));
      
      const sortedExpenses = [...expensesData].sort((a, b) => 
        new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
      );
      setRecentExpenses(sortedExpenses.slice(0, 5));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Generate payment mode distribution
  const paymentModeData = [
    { name: 'Online', value: payments.filter(p => (p.status === 'approved' || p.status === 'paid') && p.payment_mode === 'online').reduce((sum, p) => sum + Number(p.amount), 0) },
    { name: 'Cash', value: payments.filter(p => (p.status === 'approved' || p.status === 'paid') && p.payment_mode === 'cash').reduce((sum, p) => sum + Number(p.amount), 0) },
    { name: 'Bank Transfer', value: payments.filter(p => (p.status === 'approved' || p.status === 'paid') && p.payment_mode === 'bank_transfer').reduce((sum, p) => sum + Number(p.amount), 0) },
    { name: 'Cheque', value: payments.filter(p => (p.status === 'approved' || p.status === 'paid') && p.payment_mode === 'cheque').reduce((sum, p) => sum + Number(p.amount), 0) },
    { name: 'Card', value: payments.filter(p => (p.status === 'approved' || p.status === 'paid') && p.payment_mode === 'card').reduce((sum, p) => sum + Number(p.amount), 0) },
  ].filter(m => m.value > 0);

  // Generate expense category distribution
  const expenseCategoryData = expenses
    .filter(e => e.status === 'Paid' || e.status === 'Partial')
    .reduce((acc: any, e) => {
      const category = e.category_name || 'Other';
      const amount = Number(e.total_paid || e.total_amount || 0);
      if (!acc[category]) acc[category] = 0;
      acc[category] += amount;
      return acc;
    }, {});
  
  const expenseChartData = Object.entries(expenseCategoryData).map(([name, value]) => ({ name, value }));

  // Get overview stats based on selection
  const getOverviewStats = () => {
    switch (selectedOverview) {
      case 'rooms':
        return {
          percent: stats.totalRooms > 0 ? Math.round((stats.activeRooms / stats.totalRooms) * 100) : 0,
          label: 'Active Rooms',
          items: [
            { label: 'Active Rooms', value: stats.activeRooms, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Inactive Rooms', value: stats.totalRooms - stats.activeRooms, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Total Rooms', value: stats.totalRooms, color: 'text-blue-600', bg: 'bg-blue-50' }
          ]
        };
      case 'properties':
        return {
          percent: stats.totalProperties > 0 ? Math.round((stats.activeProperties / stats.totalProperties) * 100) : 0,
          label: 'Active Properties',
          items: [
            { label: 'Active Properties', value: stats.activeProperties, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Inactive Properties', value: stats.totalProperties - stats.activeProperties, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Total Properties', value: stats.totalProperties, color: 'text-blue-600', bg: 'bg-blue-50' }
          ]
        };
      case 'tenants':
        return {
          percent: stats.totalTenants > 0 ? Math.round((stats.activeTenants / stats.totalTenants) * 100) : 0,
          label: 'Active Tenants',
          items: [
            { label: 'Active Tenants', value: stats.activeTenants, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Inactive Tenants', value: stats.totalTenants - stats.activeTenants, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Total Tenants', value: stats.totalTenants, color: 'text-blue-600', bg: 'bg-blue-50' }
          ]
        };
      default: // beds
        return {
          percent: stats.totalBeds > 0 ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0,
          label: 'Bed Occupancy',
          items: [
            { label: 'Occupied Beds', value: stats.occupiedBeds, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Available Beds', value: stats.availableBeds, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total Beds', value: stats.totalBeds, color: 'text-purple-600', bg: 'bg-purple-50' }
          ]
        };
    }
  };

  const overviewStats = getOverviewStats();

  // Stat Cards
  const statCards = [
    { title: 'Total Properties', value: loading ? '...' : stats.totalProperties, icon: Building2, color: 'bg-blue-600', bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100', link: '/admin/properties' },
    { title: 'Total Rooms', value: loading ? '...' : stats.totalRooms, icon: DoorOpen, color: 'bg-purple-600', bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100', link: '/admin/rooms' },
    { title: 'Total Beds', value: loading ? '...' : stats.totalBeds, icon: Bed, color: 'bg-teal-600', bgColor: 'bg-gradient-to-br from-teal-50 to-teal-100', link: '/admin/rooms' },
    { title: 'Occupied Beds', value: loading ? '...' : `${stats.occupiedBeds} / ${stats.totalBeds}`, icon: Home, color: 'bg-green-600', bgColor: 'bg-gradient-to-br from-green-50 to-green-100', link: '/admin/rooms' },
    { title: 'Active Tenants', value: loading ? '...' : stats.activeTenants, icon: Users, color: 'bg-orange-600', bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100', link: '/admin/tenants' },
    { title: 'Total Collected', value: loading ? '...' : formatCurrency(stats.totalCollected), icon: CreditCard, color: 'bg-indigo-600', bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100', link: '/admin/payments' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Financial Trend Modal */}
      <FinancialTrendModal 
        open={showFinancialModal}
        onClose={() => setShowFinancialModal(false)}
        payments={payments}
        expenses={expenses}
        monthlyData={monthlyData}
      />

      {/* Stat Cards */}
      <div className="mb-4 sm:mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2 sticky top-16 z-10">
          {statCards.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
              onClick={() => router.push(stat.link)}
            />
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* Overview Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-700">Overview</CardTitle>
              <div className="relative">
                <button 
                  onClick={() => setShowOverviewMenu(!showOverviewMenu)} 
                  className="w-7 h-7 bg-blue-700 rounded-lg text-white hover:bg-blue-500 flex items-center justify-center"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showOverviewMenu && (
                  <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                    <div className="p-2">
                      <button className="w-full p-2 text-left text-sm hover:bg-gray-100 rounded-lg" onClick={() => { setSelectedOverview('beds'); setShowOverviewMenu(false); }}>Beds</button>
                      <button className="w-full p-2 text-left text-sm hover:bg-gray-100 rounded-lg" onClick={() => { setSelectedOverview('rooms'); setShowOverviewMenu(false); }}>Rooms</button>
                      <button className="w-full p-2 text-left text-sm hover:bg-gray-100 rounded-lg" onClick={() => { setSelectedOverview('properties'); setShowOverviewMenu(false); }}>Properties</button>
                      <button className="w-full p-2 text-left text-sm hover:bg-gray-100 rounded-lg" onClick={() => { setSelectedOverview('tenants'); setShowOverviewMenu(false); }}>Tenants</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="flex flex-col items-center">
              {/* Donut chart */}
              <div className="relative w-32 h-32 mb-4">
                <div className="absolute inset-0 rounded-full bg-gray-200"></div>
                <div className="absolute inset-0 rounded-full">
                  <div className="absolute inset-0 rounded-full" style={{background:`conic-gradient(#3B82F6 ${overviewStats.percent * 3.6}deg, transparent 0deg)`}}/>
                </div>
                <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-slate-800">{overviewStats.percent}%</span>
                  <span className="text-[10px] text-gray-500 text-center px-1">{overviewStats.label}</span>
                </div>
              </div>

              {/* Stats list */}
              <div className="w-full space-y-2">
                {overviewStats.items.map((item, idx) => (
                  <div key={idx} className={`flex justify-between p-2 ${item.bg} rounded-xl`}>
                    <span className="text-xs text-gray-700">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue vs Expenses Chart */}
        <Card className="border-0 shadow-lg lg:col-span-2 overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base font-semibold text-gray-800">Revenue vs Expenses</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-[10px] text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-[10px] text-gray-600">Expenses</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={filterYear} 
                  onChange={(e) => setFilterYear(parseInt(e.target.value))}
                  className="text-xs border rounded-md px-2 py-1 bg-white"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setShowFinancialModal(true)} 
                  className="p-1.5 hover:bg-blue-50 rounded-lg"
                  title="View Detailed Financial Trends"
                >
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentYearData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={formatCompactCurrency} width={60} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4,4,0,0]} name="Revenue" />
                    <Bar dataKey="expenses" fill="#ef4444" radius={[4,4,0,0]} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500">Total Revenue</p>
                  <p className="text-sm font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500">Total Expenses</p>
                  <p className="text-sm font-bold text-red-600">{formatCurrency(totalExpensesSum)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500">Net Profit</p>
                  <p className={`text-sm font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(totalProfit)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Four Column Layout for Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="p-3 sm:p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                Recent Payments
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/payments')} className="text-xs text-blue-600">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <RecentPaymentsTable payments={recentPayments} loading={loading} onViewAll={() => router.push('/admin/payments')} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="p-3 sm:p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Recent Tenants
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/tenants')} className="text-xs text-blue-600">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <RecentTenantsTable tenants={recentTenants} loading={loading} onViewAll={() => router.push('/admin/tenants')} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="p-3 sm:p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                Recent Enquiries
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/enquiries')} className="text-xs text-blue-600">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <RecentEnquiriesTable enquiries={recentEnquiries} loading={loading} onViewAll={() => router.push('/admin/enquiries')} />
          </CardContent>
        </Card>

        {/* <Card className="border-0 shadow-lg">
          <CardHeader className="p-3 sm:p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-red-600" />
                Recent Expenses
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/expenses')} className="text-xs text-blue-600">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <RecentExpensesTable expenses={recentExpenses} loading={loading} onViewAll={() => router.push('/admin/expenses')} />
          </CardContent>
        </Card> */}
      </div>

      {/* Financial Summary Bar */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500">Total Collected</p>
              <p className="text-base font-bold text-green-600">{formatCurrency(stats.totalCollected)}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500">Pending Amount</p>
              <p className="text-base font-bold text-amber-600">{formatCurrency(stats.pendingAmount)}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500">Monthly Revenue</p>
              <p className="text-base font-bold text-blue-600">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500">Monthly Expenses</p>
              <p className="text-base font-bold text-red-600">{formatCurrency(stats.monthlyExpenses)}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 mb-6">
        {/* Payment Mode Distribution */}
        {paymentModeData.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-600" />
                Payment Mode Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={paymentModeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentModeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expense Category Distribution */}
        {expenseChartData.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-orange-600" />
                Expense by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={expenseChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      
    </div>
  );
}