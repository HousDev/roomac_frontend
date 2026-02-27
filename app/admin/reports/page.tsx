"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Users,
  Home,
  FileText,
  Filter,
  BarChart3,
  Loader2,
  Building2,
  Calendar,
  RefreshCw,
  DoorOpen,
  CreditCard
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from 'date-fns';
import { toast } from 'sonner';
import * as reportApi from '@/lib/reportApi';
import DashboardStats from '@/components/admin/dashboard/DashboardStats'; // Import your existing dashboard stats component

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [properties, setProperties] = useState<reportApi.PropertyOption[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<reportApi.PropertyOption | null>(null);
  const [dashboardStats, setDashboardStats] = useState<reportApi.DashboardStats>({
    totalProperties: 0,
    totalRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    activeTenants: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    occupationGrowth: 0,
    occupancyRate: 0,
    collectionRate: 0,
    pendingPayments: 0,
    pendingAmount: 0,
    upcomingCheckouts: 0,
    maintenanceRequests: 0
  });
  
  const [filters, setFilters] = useState<reportApi.ReportFilters>({
    reportType: 'revenue',
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    propertyId: 'all'
  });

  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [reportData, setReportData] = useState<reportApi.ReportData | null>(null);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    totalTenants: 0,
    occupancyRate: 0,
    collectionRate: 0
  });

  const [activeTab, setActiveTab] = useState('overview');

  // Load properties on mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Load dashboard stats when filters change
  useEffect(() => {
    if (dateRange !== 'custom') {
      updateDateRangeAutomatically();
    }
    loadDashboardStats();
  }, [dateRange, filters.propertyId]);

  const loadProperties = async () => {
    try {
      const props = await reportApi.fetchProperties();
      setProperties(props);
      
      if (filters.propertyId && filters.propertyId !== 'all') {
        const selected = props.find(p => p.id === filters.propertyId);
        setSelectedProperty(selected || null);
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      toast.error('Failed to load properties');
    }
  };

  const loadDashboardStats = async () => {
    try {
      setDashboardLoading(true);
      const stats = await reportApi.getDashboardStats({
        startDate: filters.startDate,
        endDate: filters.endDate,
        propertyId: filters.propertyId
      });
      setDashboardStats(stats);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const updateDateRangeAutomatically = () => {
    const today = new Date();
    let start = '';
    let end = '';

    switch (dateRange) {
      case 'today':
        start = end = format(today, 'yyyy-MM-dd');
        break;
      case 'week':
        start = format(subDays(today, 7), 'yyyy-MM-dd');
        end = format(today, 'yyyy-MM-dd');
        break;
      case 'month':
        start = format(startOfMonth(today), 'yyyy-MM-dd');
        end = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'year':
        start = format(startOfYear(today), 'yyyy-MM-dd');
        end = format(endOfYear(today), 'yyyy-MM-dd');
        break;
      default:
        return;
    }

    setFilters(prev => ({ ...prev, startDate: start, endDate: end }));
  };

  const handlePropertyChange = (value: string) => {
    setFilters(prev => ({ ...prev, propertyId: value }));
    const selected = properties.find(p => p.id === value);
    setSelectedProperty(selected || null);
  };

  const generateReport = async () => {
    setLoading(true);
    setReportData(null);
    
    try {
      let response;
      switch (filters.reportType) {
        case 'revenue':
          response = await reportApi.generateRevenueReport(filters);
          setSummaryStats({
            totalRevenue: response.summary.totalRevenue,
            totalPayments: response.summary.paymentCount,
            totalTenants: new Set(response.payments?.map((p: any) => p.tenant_id)).size,
            occupancyRate: 0,
            collectionRate: 100
          });
          break;
          
        case 'payments':
          response = await reportApi.generatePaymentsReport(filters);
          const completed = (response.summary as reportApi.PaymentSummary).completedPayments;
          const total = response.payments?.length || 1;
          setSummaryStats({
            totalRevenue: response.summary.totalAmount,
            totalPayments: response.payments?.length || 0,
            totalTenants: 0,
            occupancyRate: 0,
            collectionRate: (completed / total) * 100
          });
          break;
          
        case 'tenants':
          response = await reportApi.generateTenantsReport(filters);
          const summary = response.summary as reportApi.TenantSummary;
          setSummaryStats({
            totalRevenue: 0,
            totalPayments: 0,
            totalTenants: summary.totalTenants,
            occupancyRate: summary.totalTenants ? (summary.withActiveBookings / summary.totalTenants) * 100 : 0,
            collectionRate: 0
          });
          break;
          
        case 'occupancy':
          response = await reportApi.generateOccupancyReport(filters);
          setSummaryStats({
            totalRevenue: 0,
            totalPayments: 0,
            totalTenants: 0,
            occupancyRate: parseFloat((response.summary as reportApi.OccupancySummary).occupancyRate),
            collectionRate: 0
          });
          break;
      }
      
      setReportData(response);
      setActiveTab('report');
      toast.success(`${filters.reportType} report generated successfully`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    if (!reportData) {
      toast.error('No data to export');
      return;
    }

    try {
      const blob = await reportApi.exportReportToCSV(filters.reportType, reportData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filters.reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const handlePrint = () => {
    if (!reportData) {
      toast.error('No data to print');
      return;
    }
    
    const propertyName = selectedProperty?.name;
    reportApi.printReport(filters.reportType, reportData, filters, propertyName);
    toast.success('Opening print dialog...');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPropertyDisplay = () => {
    if (filters.propertyId === 'all') return 'All Properties';
    return selectedProperty?.name || 'Loading...';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports with custom filters</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadDashboardStats}
          disabled={dashboardLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select
                value={filters.reportType}
                onValueChange={(value: any) => setFilters({ ...filters, reportType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">📊 Revenue Report</SelectItem>
                  <SelectItem value="payments">💰 Payments Report</SelectItem>
                  <SelectItem value="tenants">👥 Tenants Report</SelectItem>
                  <SelectItem value="occupancy">🏠 Occupancy Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setFilters({ ...filters, startDate: e.target.value });
                  setDateRange('custom');
                }}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setFilters({ ...filters, endDate: e.target.value });
                  setDateRange('custom');
                }}
              />
            </div>

            {/* Property */}
            <div className="space-y-2">
              <Label>Property</Label>
              <Select value={filters.propertyId} onValueChange={handlePropertyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🏢 All Properties</SelectItem>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{property.name}</span>
                        {property.city && <span className="text-xs text-gray-500">({property.city})</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <Button 
                onClick={generateReport} 
                disabled={loading} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Calendar className="h-3 w-3 mr-1" />
              {filters.startDate} to {filters.endDate}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Building2 className="h-3 w-3 mr-1" />
              {getPropertyDisplay()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Stats - Using your existing component */}
      <DashboardStats 
        stats={{
          totalProperties: dashboardStats.totalProperties,
          totalRooms: dashboardStats.totalRooms,
          totalBeds: dashboardStats.totalBeds,
          occupiedBeds: dashboardStats.occupiedBeds,
          activeTenants: dashboardStats.activeTenants,
          monthlyRevenue: dashboardStats.monthlyRevenue
        }}
        filterState={{}} // Pass your filter state if needed
        updateFilter={() => {}} // Pass your update function if needed
      />

      {/* Extended Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ExtendedStatCard
          title="Collection Rate"
          value={`${dashboardStats.collectionRate?.toFixed(1) || 0}%`}
          icon={<CreditCard className="h-5 w-5 text-green-500" />}
          loading={dashboardLoading}
        />
        <ExtendedStatCard
          title="Pending Payments"
          value={dashboardStats.pendingPayments || 0}
          subtitle={formatCurrency(dashboardStats.pendingAmount || 0)}
          icon={<FileText className="h-5 w-5 text-orange-500" />}
          loading={dashboardLoading}
        />
        <ExtendedStatCard
          title="Upcoming Checkouts"
          value={dashboardStats.upcomingCheckouts || 0}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          loading={dashboardLoading}
        />
        <ExtendedStatCard
          title="Maintenance"
          value={dashboardStats.maintenanceRequests || 0}
          icon={<Home className="h-5 w-5 text-red-500" />}
          loading={dashboardLoading}
        />
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Quick Actions</TabsTrigger>
          <TabsTrigger value="report" disabled={!reportData}>Generated Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports Quickly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickActionButton
                  icon={<IndianRupee className="h-6 w-6" />}
                  label="Revenue Report"
                  onClick={() => {
                    setFilters({ ...filters, reportType: 'revenue' });
                    generateReport();
                  }}
                  color="blue"
                />
                <QuickActionButton
                  icon={<Users className="h-6 w-6" />}
                  label="Tenants Report"
                  onClick={() => {
                    setFilters({ ...filters, reportType: 'tenants' });
                    generateReport();
                  }}
                  color="purple"
                />
                <QuickActionButton
                  icon={<Home className="h-6 w-6" />}
                  label="Occupancy Report"
                  onClick={() => {
                    setFilters({ ...filters, reportType: 'occupancy' });
                    generateReport();
                  }}
                  color="orange"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="mt-4">
          {reportData && (
            <>
              {/* Report Actions */}
              <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(summaryStats.totalRevenue)}
                  icon={<IndianRupee className="h-8 w-8 text-green-400" />}
                />
                <StatCard
                  title="Total Payments"
                  value={summaryStats.totalPayments.toString()}
                  icon={<FileText className="h-8 w-8 text-blue-400" />}
                />
                <StatCard
                  title="Total Tenants"
                  value={summaryStats.totalTenants.toString()}
                  icon={<Users className="h-8 w-8 text-purple-400" />}
                />
                <StatCard
                  title="Occupancy Rate"
                  value={`${summaryStats.occupancyRate.toFixed(1)}%`}
                  icon={<Home className="h-8 w-8 text-orange-400" />}
                />
                <StatCard
                  title="Collection Rate"
                  value={`${summaryStats.collectionRate.toFixed(1)}%`}
                  icon={summaryStats.collectionRate >= 90 ? 
                    <TrendingUp className="h-8 w-8 text-green-400" /> : 
                    <TrendingDown className="h-8 w-8 text-red-400" />
                  }
                />
              </div>

              {/* Detailed Report */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Report Data</CardTitle>
                </CardHeader>
                <CardContent>
                  {filters.reportType === 'revenue' && (
                    <RevenueReportDetails data={reportData} formatCurrency={formatCurrency} />
                  )}
                  {filters.reportType === 'payments' && (
                    <PaymentsReportDetails data={reportData} formatCurrency={formatCurrency} />
                  )}
                  {filters.reportType === 'tenants' && (
                    <TenantsReportDetails data={reportData} />
                  )}
                  {filters.reportType === 'occupancy' && (
                    <OccupancyReportDetails data={reportData} formatCurrency={formatCurrency} />
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
function ExtendedStatCard({ title, value, subtitle, icon, loading }: any) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center space-x-3">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ icon, label, onClick, color }: any) {
  const colors = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-600',
    orange: 'bg-orange-50 hover:bg-orange-100 text-orange-600',
  };

  return (
    <Button
      variant="ghost"
      className={`h-24 flex flex-col items-center justify-center gap-2 ${colors[color]}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

// Report Detail Components
function RevenueReportDetails({ data, formatCurrency }: any) {
  const summary = data.summary;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Rent Revenue"
          value={formatCurrency(summary.rentRevenue || 0)}
          subtitle={`${summary.rentCount || 0} payments`}
          bgColor="bg-blue-50"
        />
        <SummaryCard
          title="Deposit Revenue"
          value={formatCurrency(summary.depositRevenue || 0)}
          subtitle={`${summary.depositCount || 0} payments`}
          bgColor="bg-green-50"
        />
        <SummaryCard
          title="Addon Revenue"
          value={formatCurrency(summary.addonRevenue || 0)}
          subtitle={`${summary.addonCount || 0} payments`}
          bgColor="bg-purple-50"
        />
        <SummaryCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue || 0)}
          subtitle={`${summary.paymentCount || 0} payments`}
          bgColor="bg-orange-50"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Payment #</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Tenant</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Property</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.payments?.map((payment: any) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{payment.payment_number || payment.id}</td>
                <td className="px-4 py-3 text-sm">
                  {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3 text-sm font-medium">{payment.tenant_name || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">{payment.property_name || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant="outline">{payment.payment_type || 'N/A'}</Badge>
                </td>
                <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(payment.amount || 0)}</td>
                <td className="px-4 py-3 text-sm">{payment.payment_method || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                    {payment.status || 'N/A'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsReportDetails({ data, formatCurrency }: any) {
  const summary = data.summary;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Completed Payments"
          value={summary.completedPayments?.toString() || '0'}
          subtitle={formatCurrency(summary.completedAmount || 0)}
          bgColor="bg-blue-50"
        />
        <SummaryCard
          title="Pending Payments"
          value={summary.pendingPayments?.toString() || '0'}
          subtitle={formatCurrency(summary.pendingAmount || 0)}
          bgColor="bg-orange-50"
        />
        <SummaryCard
          title="Failed Payments"
          value={summary.failedPayments?.toString() || '0'}
          subtitle={formatCurrency(summary.failedAmount || 0)}
          bgColor="bg-red-50"
        />
        <SummaryCard
          title="Collection Rate"
          value={`${((summary.completedAmount / (summary.totalAmount || 1)) * 100).toFixed(1)}%`}
          subtitle={`Total: ${formatCurrency(summary.totalAmount || 0)}`}
          bgColor="bg-green-50"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Payment #</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Tenant</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Transaction ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.payments?.map((payment: any) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{payment.payment_number || payment.id}</td>
                <td className="px-4 py-3 text-sm">
                  {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3 text-sm font-medium">{payment.tenant_name || 'N/A'}</td>
                <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(payment.amount || 0)}</td>
                <td className="px-4 py-3 text-sm">{payment.payment_method || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">{payment.transaction_id || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                    {payment.status || 'N/A'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TenantsReportDetails({ data }: any) {
  const summary = data.summary;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Active Tenants"
          value={summary.activeTenants?.toString() || '0'}
          bgColor="bg-blue-50"
        />
        <SummaryCard
          title="Inactive Tenants"
          value={summary.inactiveTenants?.toString() || '0'}
          bgColor="bg-gray-50"
        />
        <SummaryCard
          title="With Active Bookings"
          value={summary.withActiveBookings?.toString() || '0'}
          bgColor="bg-green-50"
        />
        <SummaryCard
          title="New This Month"
          value={summary.newTenantsThisMonth?.toString() || '0'}
          bgColor="bg-purple-50"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Gender</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Occupation</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">City</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.tenants?.map((tenant: any) => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{tenant.full_name}</td>
                <td className="px-4 py-3 text-sm">{tenant.email || '-'}</td>
                <td className="px-4 py-3 text-sm">{tenant.phone || '-'}</td>
                <td className="px-4 py-3 text-sm">{tenant.gender || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">{tenant.occupation || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">{tenant.city || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                    {tenant.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OccupancyReportDetails({ data, formatCurrency }: any) {
  const summary = data.summary;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Rooms"
          value={summary.totalRooms?.toString() || '0'}
          bgColor="bg-blue-50"
        />
        <SummaryCard
          title="Occupied"
          value={summary.occupiedRooms?.toString() || '0'}
          bgColor="bg-green-50"
        />
        <SummaryCard
          title="Vacant"
          value={summary.vacantRooms?.toString() || '0'}
          bgColor="bg-orange-50"
        />
        <SummaryCard
          title="Maintenance"
          value={summary.maintenanceRooms?.toString() || '0'}
          bgColor="bg-red-50"
        />
        <SummaryCard
          title="Occupancy Rate"
          value={`${summary.occupancyRate || 0}%`}
          bgColor="bg-purple-50"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Property</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Room #</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Floor</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Rent</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Occupancy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.rooms?.map((room: any) => (
              <tr key={room.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{room.property_name || 'N/A'}</td>
                <td className="px-4 py-3 text-sm font-medium">{room.room_number}</td>
                <td className="px-4 py-3 text-sm">{room.room_type || 'Standard'}</td>
                <td className="px-4 py-3 text-sm">{room.floor || 'N/A'}</td>
                <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(room.rent_amount || 0)}</td>
                <td className="px-4 py-3 text-sm">
                  <Badge
                    variant={
                      room.status === 'occupied' ? 'default' :
                      room.status === 'vacant' ? 'secondary' : 
                      room.status === 'maintenance' ? 'destructive' : 'outline'
                    }
                  >
                    {room.status || 'N/A'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm">
                  {room.occupied_beds || 0} / {room.total_bed || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, subtitle, bgColor }: any) {
  return (
    <div className={`${bgColor} p-4 rounded-lg`}>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-xl font-bold">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}