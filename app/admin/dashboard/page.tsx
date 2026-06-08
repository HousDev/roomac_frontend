// app/admin/dashboard/page.tsx - Updated with Payment Stats Section

"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { 
  Building2, DoorOpen, Users, TrendingUp, TrendingDown, 
  MoreVertical, Calendar, X, BarChart3, 
  CreditCard, IndianRupee, CheckCircle, 
  AlertCircle, Home, Bed, MessageSquare, PieChart,
  Clock, Receipt, Filter, 
  AreaChart as AreaChartIcon,
  ArrowRight, Shield, LineChart as LineChartIcon,
  Wallet, TrendingUp as TrendingUpIcon, Percent,
  ReceiptIndianRupee, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
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
import { getPayments, getDetailedPaymentStats } from '@/lib/paymentRecordApi';
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

// Helper: Get financial year (Apr 1 - Mar 31)
const getFinancialYear = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month >= 3) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

// Helper: Get start date of financial year
const getFinancialYearStart = (financialYear: string): Date => {
  const [startYear] = financialYear.split('-').map(Number);
  return new Date(startYear, 3, 1);
};

// Helper: Get end date of financial year
const getFinancialYearEnd = (financialYear: string): Date => {
  const [startYear] = financialYear.split('-').map(Number);
  return new Date(startYear + 1, 2, 31);
};

// Helper: Get all months in financial year
const getFinancialYearMonths = (financialYear: string): string[] => {
  const [startYear] = financialYear.split('-').map(Number);
  const months = [];
  for (let i = 3; i <= 11; i++) {
    months.push(new Date(startYear, i, 1).toLocaleString('default', { month: 'short' }));
  }
  for (let i = 0; i <= 2; i++) {
    months.push(new Date(startYear + 1, i, 1).toLocaleString('default', { month: 'short' }));
  }
  return months;
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, bgColor, onClick, link, subtitle }: any) => (
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
        {subtitle && <p className="text-[8px] text-gray-400 truncate">{subtitle}</p>}
      </div>
    </div>
  </div>
);

// Payment Stats Card Component (for detailed payment stats)
const PaymentStatCard = ({ title, value, subtitle }: any) => (
  <div className={`rounded-xl p-2 sm:p-3 shadow-sm border border-gray-100 bg-white`}>
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[9px] sm:text-[10px] font-medium text-gray-500 truncate">{title}</p>
        <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">{value}</p>
        {subtitle && <p className="text-[8px] text-gray-400 truncate">{subtitle}</p>}
      </div>
    </div>
  </div>
);

// Recent Payments Component
const RecentPaymentsTable = ({ payments, loading, onViewAll }: any) => {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    if (status === 'approved' || status === 'paid') {
      return <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0">Approved</Badge>;
    } else if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0">Pending</Badge>;
    } else if (status === 'rejected') {
      return <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0">Rejected</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0">{status}</Badge>;
  };

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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              payment.status === 'approved' || payment.status === 'paid' ? 'bg-green-100' :
              payment.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <IndianRupee className={`h-3.5 w-3.5 ${
                payment.status === 'approved' || payment.status === 'paid' ? 'text-green-600' :
                payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
              }`} />
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
            {getStatusBadge(payment.status)}
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
                {tenant.property_name && (
                  <span className="text-blue-600">• {tenant.property_name}</span>
                )}
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

// Financial Trend Modal Component
const FinancialTrendModal = ({ 
  open, 
  onClose, 
  payments, 
  expenses,
  monthlyData,
  availableFinancialYears
}: { 
  open: boolean; 
  onClose: () => void; 
  payments: any[]; 
  expenses: any[];
  monthlyData: any[];
  availableFinancialYears: string[];
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'revenue' | 'expenses' | 'profit'>('all');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(availableFinancialYears[0] || getFinancialYear(new Date()));
  
  const filteredMonthlyData = monthlyData.filter(d => d.financialYear === selectedFinancialYear);
  const sortedMonths = getFinancialYearMonths(selectedFinancialYear);
  const sortedData = sortedMonths.map(month => {
    const found = filteredMonthlyData.find(d => d.month === month);
    return found || { month, revenue: 0, expenses: 0, profit: 0 };
  });
  
  const getChartData = () => {
    if (activeTab === 'all') {
      return sortedData.map(d => ({
        month: d.month,
        revenue: d.revenue,
        expenses: d.expenses,
        profit: d.profit
      }));
    }
    if (activeTab === 'revenue') {
      return sortedData.map(d => ({ month: d.month, value: d.revenue }));
    }
    if (activeTab === 'expenses') {
      return sortedData.map(d => ({ month: d.month, value: d.expenses }));
    }
    return sortedData.map(d => ({ month: d.month, value: d.profit }));
  };
  
  const chartData = getChartData();
  const totalRevenue = sortedData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = sortedData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  
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
            <Bar dataKey="profit" fill="#3b82f6" radius={[4,4,0,0]} name="Profit" />
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
    
    const color = activeTab === 'revenue' ? '#10b981' : activeTab === 'expenses' ? '#ef4444' : '#3b82f6';
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
        <div className="p-3 sm:p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-800">Financial Trend Analysis</h2>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Revenue vs Expenses vs Profit</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
        </div>

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
            </div>
            <div className="bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-blue-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-600">Net Profit</p>
                  <p className="text-sm font-bold text-blue-600">{formatCurrency(totalProfit)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 flex-1 min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <select 
              value={selectedFinancialYear} 
              onChange={(e) => setSelectedFinancialYear(e.target.value)}
              className="text-xs border rounded-md px-2 py-1 bg-white"
            >
              {availableFinancialYears.map(year => (
                <option key={year} value={year}>FY {year}</option>
              ))}
            </select>
            
            <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-lg border border-gray-200">
              <button onClick={() => setActiveTab('all')} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>All</button>
              <button onClick={() => setActiveTab('revenue')} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${activeTab === 'revenue' ? 'bg-green-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>Revenue</button>
              <button onClick={() => setActiveTab('expenses')} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${activeTab === 'expenses' ? 'bg-red-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>Expenses</button>
              <button onClick={() => setActiveTab('profit')} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${activeTab === 'profit' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>Profit</button>
            </div>
            
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200">
              <button onClick={() => setChartType('area')} className={`p-1 rounded transition-all ${chartType === 'area' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}>
                <AreaChartIcon className="w-3 h-3" />
              </button>
              <button onClick={() => setChartType('bar')} className={`p-1 rounded transition-all ${chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}>
                <BarChart3 className="w-3 h-3" />
              </button>
              <button onClick={() => setChartType('line')} className={`p-1 rounded transition-all ${chartType === 'line' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}>
                <LineChartIcon className="w-3 h-3" />
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
  
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(getFinancialYear(new Date()));
  const [selectedOverview, setSelectedOverview] = useState('beds');
  const [showOverviewMenu, setShowOverviewMenu] = useState(false);
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('all');
  
  // NEW: Detailed payment stats state
  const [detailedPaymentStats, setDetailedPaymentStats] = useState({
    total_rent_collected: 0,
    total_deposit_collected: 0,
    net_deposit_collected: 0,
    total_refunded: 0,
    total_penalties_collected: 0,
    this_month_expected_rent: 0,
    this_month_received_rent: 0,
    this_month_pending_rent: 0,
    total_transactions: 0,
  });
  
  // Enhanced tenants with property and bed assignment info
  const [enrichedTenants, setEnrichedTenants] = useState<any[]>([]);
  
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
    totalRentCollected: 0,
    totalDepositCollected: 0,
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
  
  // Get unique properties with their IDs
  const propertyOptions = useMemo(() => {
    const uniqueProperties = new Map();
    properties.forEach(property => {
      if (property.name && property.id) {
        uniqueProperties.set(property.id.toString(), { name: property.name, id: property.id });
      }
    });
    
    enrichedTenants.forEach(tenant => {
      if (tenant.property_name && tenant.property_id && !uniqueProperties.has(tenant.property_id.toString())) {
        uniqueProperties.set(tenant.property_id.toString(), { name: tenant.property_name, id: tenant.property_id });
      }
    });
    
    return [{ name: 'All Properties', id: 'all' }, ...Array.from(uniqueProperties.values())];
  }, [properties, enrichedTenants]);
  
  // Fetch tenant bed assignments to enrich tenant data
  const enrichTenantsWithAssignments = useCallback(async (tenantsData: any[]) => {
    const enriched = [];
    
    for (const tenant of tenantsData) {
      try {
        const response = await fetch(`/api/rooms/tenant-bed/${tenant.id}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const assignment = result.data;
          enriched.push({
            ...tenant,
            property_id: assignment.property?.id,
            property_name: assignment.property?.name,
            room_id: assignment.room?.id,
            room_number: assignment.room?.room_number,
            bed_id: assignment.id,
            bed_number: assignment.bed_number,
            bed_type: assignment.bed_type,
            monthly_rent: assignment.tenant_rent,
            check_in_date: assignment.check_in_date
          });
        } else {
          enriched.push({
            ...tenant,
            property_id: null,
            property_name: null,
            room_number: null,
            bed_number: null
          });
        }
      } catch (error) {
        console.error(`Error fetching assignment for tenant ${tenant.id}:`, error);
        enriched.push({
          ...tenant,
          property_id: null,
          property_name: null,
          room_number: null,
          bed_number: null
        });
      }
    }
    
    return enriched;
  }, []);
  
  // Get available financial years
  const availableFinancialYears = useMemo(() => {
    const years = new Set<string>();
    payments.forEach(payment => {
      if (payment.payment_date) {
        years.add(getFinancialYear(new Date(payment.payment_date)));
      }
    });
    expenses.forEach(expense => {
      if (expense.expense_date) {
        years.add(getFinancialYear(new Date(expense.expense_date)));
      }
    });
    const currentYear = getFinancialYear(new Date());
    years.add(currentYear);
    years.add(`${parseInt(currentYear.split('-')[0]) - 1}-${parseInt(currentYear.split('-')[0])}`);
    years.add(`${parseInt(currentYear.split('-')[0]) - 2}-${parseInt(currentYear.split('-')[0]) - 1}`);
    return Array.from(years).sort().reverse();
  }, [payments, expenses]);

  // Generate monthly activity data
  const generateMonthlyData = useCallback(() => {
    const result: any[] = [];
    
    availableFinancialYears.forEach(financialYear => {
      const startDate = getFinancialYearStart(financialYear);
      const months = getFinancialYearMonths(financialYear);
      
      months.forEach((monthName, index) => {
        let revenue = 0;
        let expensesSum = 0;
        
        const monthDate = new Date(startDate);
        monthDate.setMonth(startDate.getMonth() + index);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        payments.forEach(payment => {
          if (payment.status === 'approved' || payment.status === 'paid') {
            const paymentDate = new Date(payment.payment_date);
            if (paymentDate >= monthStart && paymentDate <= monthEnd) {
              revenue += Number(payment.amount);
            }
          }
        });
        
        expenses.forEach(expense => {
          if (expense.status === 'Paid' || expense.status === 'Partial') {
            const expenseDate = new Date(expense.expense_date);
            if (expenseDate >= monthStart && expenseDate <= monthEnd) {
              expensesSum += Number(expense.total_paid || expense.total_amount || 0);
            }
          }
        });
        
        result.push({
          financialYear,
          month: monthName,
          revenue,
          expenses: expensesSum,
          profit: revenue - expensesSum
        });
      });
    });
    
    return result;
  }, [payments, expenses, availableFinancialYears]);

  const monthlyData = generateMonthlyData();
  
  // Filter current financial year data
  const currentYearData = monthlyData.filter(d => d.financialYear === selectedFinancialYear);
  const sortedMonths = getFinancialYearMonths(selectedFinancialYear);
  const sortedYearData = sortedMonths.map(month => {
    const found = currentYearData.find(d => d.month === month);
    return found || { month, revenue: 0, expenses: 0, profit: 0 };
  });
  
  const totalRevenue = sortedYearData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpensesSum = sortedYearData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalRevenue - totalExpensesSum;

  // NEW: Load detailed payment stats
  const loadDetailedPaymentStats = useCallback(async () => {
    try {
      const response = await getDetailedPaymentStats();
      if (response.success && response.data) {
        setDetailedPaymentStats({
          total_rent_collected: response.data.total_rent_collected || 0,
          total_deposit_collected: response.data.total_deposit_collected || 0,
          net_deposit_collected: response.data.net_deposit_collected || 0,
          total_refunded: response.data.total_refunded || 0,
          total_penalties_collected: response.data.total_penalties_collected || 0,
          this_month_expected_rent: response.data.this_month_expected_rent || 0,
          this_month_received_rent: response.data.this_month_received_rent || 0,
          this_month_pending_rent: response.data.this_month_pending_rent || 0,
          total_transactions: response.data.total_transactions || 0,
        });
      }
    } catch (error) {
      console.error('Error loading detailed payment stats:', error);
    }
  }, []);

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
      
      // Fetch rooms - FIX: Properly set active rooms
      const roomsRes = await listRooms();
      let roomsData: any[] = [];
      if (roomsRes && Array.isArray(roomsRes)) {
        roomsData = roomsRes;
      } else if (roomsRes?.data && Array.isArray(roomsRes.data)) {
        roomsData = roomsRes.data;
      }
      
      roomsData = roomsData.map(room => ({
        ...room,
        total_bed: room.total_bed || room.capacity || 0,
        occupied_beds: room.occupied_beds || room.current_tenants || 0,
        is_active: (room.occupied_beds && room.occupied_beds > 0) || 
                   (room.current_tenants && room.current_tenants > 0) ||
                   room.status === 'occupied' ||
                   room.status === 'active'
      }));
      
      setRooms(roomsData);
      
      // Fetch tenants
      const tenantsRes = await listTenants({ pageSize: 1000 });
      let tenantsData: any[] = [];
      if (tenantsRes.success) {
        tenantsData = tenantsRes.data || [];
      }
      
      // Enrich tenants with bed assignment data
      const enriched = await enrichTenantsWithAssignments(tenantsData);
      setEnrichedTenants(enriched);
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
      
      // Calculate stats from rooms
      const totalBeds = roomsData.reduce((sum, r) => sum + (Number(r.total_bed) || 0), 0);
      const occupiedBeds = roomsData.reduce((sum, r) => sum + (Number(r.occupied_beds) || 0), 0);
      const availableBeds = totalBeds - occupiedBeds;
      
      const totalRooms = roomsData.length;
      const activeRooms = roomsData.filter(r => r.is_active === true).length;
      
      const totalProperties = propertiesData.length;
      const activeProperties = propertiesData.filter(p => p.is_active === true || p.is_active === 1).length;
      
      const totalTenants = tenantsData.length;
      const activeTenants = tenantsData.filter(t => t.is_active === true || t.is_active === 1).length;
      
      const approvedPayments = paymentsData.filter(p => p.status === 'approved' || p.status === 'paid');
      const totalCollected = approvedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalRentCollected = approvedPayments
        .filter(p => p.payment_type === 'rent')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const totalDepositCollected = approvedPayments
        .filter(p => p.payment_type === 'security_deposit')
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
        totalRentCollected,
        totalDepositCollected,
        pendingAmount,
        totalExpenses: totalExpensesSumCalc,
        monthlyRevenue,
        monthlyExpenses,
        netProfit: monthlyRevenue - monthlyExpenses,
        totalTransactions: paymentsData.length
      });
      
      // Load detailed payment stats
      await loadDetailedPaymentStats();
      
      // Recent data
      const sortedPayments = [...paymentsData].sort((a, b) => 
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      );
      setRecentPayments(sortedPayments.slice(0, 5));
      
      const sortedTenants = [...enriched].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentTenants(sortedTenants.slice(0, 5));
      
      const sortedEnquiries = [...enquiriesData].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentEnquiries(sortedEnquiries.slice(0, 5));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [enrichTenantsWithAssignments, loadDetailedPaymentStats]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Payment mode distribution with Rent vs Deposit breakdown
  const paymentModeData = useMemo(() => {
    const modeMap: { [key: string]: { rent: number; deposit: number } } = {};
    
    payments.forEach(payment => {
      if (payment.status === 'approved' || payment.status === 'paid') {
        const mode = payment.payment_mode || 'other';
        const amount = Number(payment.amount);
        
        if (!modeMap[mode]) {
          modeMap[mode] = { rent: 0, deposit: 0 };
        }
        
        if (payment.payment_type === 'rent') {
          modeMap[mode].rent += amount;
        } else if (payment.payment_type === 'security_deposit') {
          modeMap[mode].deposit += amount;
        }
      }
    });
    
    return Object.entries(modeMap).map(([mode, amounts]) => ({
      name: mode.charAt(0).toUpperCase() + mode.slice(1).replace('_', ' '),
      rent: amounts.rent,
      deposit: amounts.deposit,
      total: amounts.rent + amounts.deposit
    })).filter(m => m.total > 0);
  }, [payments]);

  // Expense category distribution
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

  // Filter tenants by selected property for overview
  const filteredTenantsForOverview = useMemo(() => {
    if (selectedPropertyFilter === 'all') return enrichedTenants;
    return enrichedTenants.filter(tenant => tenant.property_id?.toString() === selectedPropertyFilter);
  }, [enrichedTenants, selectedPropertyFilter]);

  // Get overview stats based on selection and property filter
  const getOverviewStats = () => {
    // Filter rooms by selected property
    let filteredRooms = rooms;
    if (selectedPropertyFilter !== 'all') {
      filteredRooms = rooms.filter(r => r.property_id?.toString() === selectedPropertyFilter || r.property_id === parseInt(selectedPropertyFilter));
    }
    
    // Calculate bed stats
    const totalBedsFiltered = filteredRooms.reduce((sum, r) => sum + (Number(r.total_bed) || Number(r.capacity) || 0), 0);
    const occupiedBedsFiltered = filteredRooms.reduce((sum, r) => sum + (Number(r.occupied_beds) || Number(r.current_tenants) || 0), 0);
    const availableBedsFiltered = totalBedsFiltered - occupiedBedsFiltered;
    
    // Calculate room stats
    const totalRoomsFiltered = filteredRooms.length;
    const activeRoomsFiltered = filteredRooms.filter(room => {
      if (room.occupied_beds && room.occupied_beds > 0) return true;
      if (room.current_tenants && room.current_tenants > 0) return true;
      if (room.status === 'occupied' || room.status === 'active') return true;
      if (room.is_active === true || room.is_active === 1) return true;
      if (room.is_available === false) return true;
      if (room.beds && Array.isArray(room.beds)) {
        return room.beds.some((bed: any) => bed.is_occupied === true || bed.tenant_id !== null);
      }
      return false;
    }).length;
    
    const inactiveRoomsFiltered = totalRoomsFiltered - activeRoomsFiltered;
    
    // Filter properties
    let filteredProperties = properties;
    if (selectedPropertyFilter !== 'all') {
      filteredProperties = properties.filter(p => p.id?.toString() === selectedPropertyFilter || p.id === parseInt(selectedPropertyFilter));
    }
    
    const totalPropertiesFiltered = filteredProperties.length;
    const activePropertiesFiltered = filteredProperties.filter(p => p.is_active === true || p.is_active === 1).length;
    
    // Filter tenants
    let filteredTenantsForStats = filteredTenantsForOverview;
    if (selectedPropertyFilter !== 'all') {
      filteredTenantsForStats = enrichedTenants.filter(t => t.property_id?.toString() === selectedPropertyFilter || t.property_id === parseInt(selectedPropertyFilter));
    }
    
    const totalTenantsFiltered = filteredTenantsForStats.length;
    const activeTenantsFiltered = filteredTenantsForStats.filter(t => t.is_active === true || t.is_active === 1).length;
    
    switch (selectedOverview) {
      case 'rooms':
        return {
          percent: totalRoomsFiltered > 0 ? Math.round((activeRoomsFiltered / totalRoomsFiltered) * 100) : 0,
          label: 'Active Rooms',
          items: [
            { label: 'Active Rooms', value: activeRoomsFiltered, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Inactive Rooms', value: inactiveRoomsFiltered, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Total Rooms', value: totalRoomsFiltered, color: 'text-blue-600', bg: 'bg-blue-50' }
          ]
        };
      case 'properties':
        return {
          percent: totalPropertiesFiltered > 0 ? Math.round((activePropertiesFiltered / totalPropertiesFiltered) * 100) : 0,
          label: 'Active Properties',
          items: [
            { label: 'Active Properties', value: activePropertiesFiltered, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Inactive Properties', value: totalPropertiesFiltered - activePropertiesFiltered, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Total Properties', value: totalPropertiesFiltered, color: 'text-blue-600', bg: 'bg-blue-50' }
          ]
        };
      case 'tenants':
        return {
          percent: totalTenantsFiltered > 0 ? Math.round((activeTenantsFiltered / totalTenantsFiltered) * 100) : 0,
          label: 'Active Tenants',
          items: [
            { label: 'Active Tenants', value: activeTenantsFiltered, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Inactive Tenants', value: totalTenantsFiltered - activeTenantsFiltered, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Total Tenants', value: totalTenantsFiltered, color: 'text-blue-600', bg: 'bg-blue-50' }
          ]
        };
      default: // beds
        return {
          percent: totalBedsFiltered > 0 ? Math.round((occupiedBedsFiltered / totalBedsFiltered) * 100) : 0,
          label: 'Bed Occupancy',
          items: [
            { label: 'Occupied Beds', value: occupiedBedsFiltered, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Available Beds', value: availableBedsFiltered, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total Beds', value: totalBedsFiltered, color: 'text-purple-600', bg: 'bg-purple-50' }
          ]
        };
    }
  };

  const overviewStats = getOverviewStats();

  const statCards = [
    { title: 'Total Properties', value: loading ? '...' : stats.totalProperties, icon: Building2, color: 'bg-blue-600', bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100', link: '/admin/properties' },
    { title: 'Total Rooms', value: loading ? '...' : stats.totalRooms, icon: DoorOpen, color: 'bg-purple-600', bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100', link: '/admin/rooms' },
    { title: 'Total Beds', value: loading ? '...' : stats.totalBeds, icon: Bed, color: 'bg-teal-600', bgColor: 'bg-gradient-to-br from-teal-50 to-teal-100', link: '/admin/rooms' },
    { title: 'Occupied Beds', value: loading ? '...' : `${stats.occupiedBeds} / ${stats.totalBeds}`, icon: Home, color: 'bg-green-600', bgColor: 'bg-gradient-to-br from-green-50 to-green-100', link: '/admin/rooms' },
    { title: 'Active Tenants', value: loading ? '...' : stats.activeTenants, icon: Users, color: 'bg-orange-600', bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100', link: '/admin/tenants' },
    { title: 'Rent Collected', value: loading ? '...' : formatCurrency(stats.totalRentCollected), icon: IndianRupee, color: 'bg-blue-600', bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100', link: '/admin/payments' },
    { title: 'Deposit Collected', value: loading ? '...' : formatCurrency(stats.totalDepositCollected), icon: Shield, color: 'bg-green-600', bgColor: 'bg-gradient-to-br from-green-50 to-green-100', link: '/admin/payments' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <FinancialTrendModal 
        open={showFinancialModal}
        onClose={() => setShowFinancialModal(false)}
        payments={payments}
        expenses={expenses}
        monthlyData={monthlyData}
        availableFinancialYears={availableFinancialYears}
      />

      {/* Top Stats Row */}
      <div className="mb-4 sm:mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2 sticky top-16 z-10">
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

      {/* Overview and Revenue/Expenses Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="p-3 sm:p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base font-bold text-slate-700">Overview</CardTitle>
              <div className="flex items-center gap-2">
                <select
                  value={selectedPropertyFilter}
                  onChange={(e) => setSelectedPropertyFilter(e.target.value)}
                  className="text-xs border rounded-md px-2 py-1 bg-white"
                >
                  {propertyOptions.map(prop => (
                    <option key={prop.id} value={prop.id}>
                      {prop.name}
                    </option>
                  ))}
                </select>
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
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="flex flex-col items-center">
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

        <Card className="border-0 shadow-lg lg:col-span-2 overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base font-semibold text-gray-800">Revenue vs Expenses vs Profit</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-[10px] text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-[10px] text-gray-600">Expenses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] text-gray-600">Profit</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={selectedFinancialYear} 
                  onChange={(e) => setSelectedFinancialYear(e.target.value)}
                  className="text-xs border rounded-md px-2 py-1 bg-white"
                >
                  {availableFinancialYears.map(year => (
                    <option key={year} value={year}>FY {year}</option>
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
                  <BarChart data={sortedYearData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={formatCompactCurrency} width={60} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4,4,0,0]} name="Revenue" />
                    <Bar dataKey="expenses" fill="#ef4444" radius={[4,4,0,0]} name="Expenses" />
                    <Bar dataKey="profit" fill="#3b82f6" radius={[4,4,0,0]} name="Profit" />
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

      

      {/* Recent Activity Section */}
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
      </div>

      {/* NEW: Detailed Payment Stats Section */}
      <div className="mt-6 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-2">
          <PaymentStatCard
            title="Net Deposit"
            value={formatCurrency(detailedPaymentStats.net_deposit_collected)}
            icon={Shield}
            color="bg-green-600"
            bgColor="bg-gradient-to-br from-green-50 to-green-100"
            subtitle={`Collected: ${formatCurrency(detailedPaymentStats.total_deposit_collected)}`}
          />
          <PaymentStatCard
            title="Total Refunded"
            value={formatCurrency(detailedPaymentStats.total_refunded)}
            icon={ReceiptIndianRupee}
            color="bg-orange-600"
            bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
            subtitle="Deposit refunds"
          />
          <PaymentStatCard
            title="Penalties Collected"
            value={formatCurrency(detailedPaymentStats.total_penalties_collected)}
            icon={AlertCircle}
            color="bg-red-600"
            bgColor="bg-gradient-to-br from-red-50 to-red-100"
            subtitle="From vacated tenants"
          />
          <PaymentStatCard
            title="This Month Expected"
            value={formatCurrency(detailedPaymentStats.this_month_expected_rent)}
            icon={Calendar}
            color="bg-purple-600"
            bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
            subtitle={`${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`}
          />
          <PaymentStatCard
            title="This Month Received"
            value={formatCurrency(detailedPaymentStats.this_month_received_rent)}
            icon={CheckCircle2}
            color="bg-green-600"
            bgColor="bg-gradient-to-br from-green-50 to-green-100"
            subtitle="Received rent"
          />
          <PaymentStatCard
            title="This Month Pending"
            value={formatCurrency(detailedPaymentStats.this_month_pending_rent)}
            icon={Clock}
            color="bg-amber-600"
            bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
            subtitle="Pending rent"
          />
          
        </div>
      </div>

      {/* Payment Mode and Expense Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 mb-6">
        {paymentModeData.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-600" />
                Payment Mode Distribution (Rent vs Deposit)
              </CardTitle>
              <p className="text-[10px] text-gray-500 mt-1">Breakdown of payments by mode and type</p>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentModeData} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" tickFormatter={formatCompactCurrency} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="rent" fill="#10b981" name="Rent" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="deposit" fill="#8B5CF6" name="Security Deposit" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

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