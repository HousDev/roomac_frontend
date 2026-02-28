

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
  CreditCard,
  Receipt,
  Clock,
  CheckCircle,
  Activity,
  PieChart,
  TrendingUp as TrendUp,
  Wallet,
  DoorOpen,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from 'date-fns';
import { toast } from 'sonner';
import * as reportApi from '@/lib/reportApi';

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
    <div className="p-1 sm:p-4 md:p-4 space-y-3 sm:space-y-4 md:space-y-6 max-w-full overflow-x-hidden -mt-7 ">
      {/* Header with Brand Gradient */}
      {/* <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 mb-2 sm:mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">Reports & Analytics</h1>
            <p className="text-xs sm:text-sm text-blue-100">Generate comprehensive reports with custom filters</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardStats}
            disabled={dashboardLoading}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto"
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} />
            <span className="text-xs sm:text-sm">Refresh</span>
          </Button>
        </div>
      </div> */}

     
<div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
  <StatCard
    title=" Total Properties"
    value={dashboardStats.totalProperties}
    icon={<Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#0A1F5C]" />}
    loading={dashboardLoading}
  />
  <StatCard
    title="Total Rooms"
    value={dashboardStats.totalRooms}
    icon={<DoorOpen className="h-3 w-3 sm:h-4 sm:w-4 text-[#123A9A]" />}
    loading={dashboardLoading}
  />
  <StatCard
    title="Bed Occupancy"
    value={`${dashboardStats.occupiedBeds}/${dashboardStats.totalBeds}`}
    icon={<Home className="h-3 w-3 sm:h-4 sm:w-4 text-[#1E4ED8]" />}
    loading={dashboardLoading}
  />
  <StatCard
    title="Active Tenants"
    value={dashboardStats.activeTenants}
    icon={<Users className="h-3 w-3 sm:h-4 sm:w-4 text-[#2563eb]" />}
    loading={dashboardLoading}
  />
  <StatCard
    title="Monthly Revenue"
    value={formatCurrency(dashboardStats.monthlyRevenue)}
    icon={<IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 text-[#16a34a]" />}
    loading={dashboardLoading}
  />
  <StatCard
    title="Occupancy Rate"
    value={`${dashboardStats.occupancyRate?.toFixed(1) || 0}%`}
    icon={<Activity className="h-3 w-3 sm:h-4 sm:w-4 text-[#ea580c]" />}
    loading={dashboardLoading}
  />
</div>



      {/* Extended Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
        <ExtendedStatCard
          title="Collection Rate"
          value={`${dashboardStats.collectionRate?.toFixed(1) || 0}%`}
          icon={<TrendUp className="h-3 w-3 sm:h-4 sm:w-4" />}
          loading={dashboardLoading}
          color="green"
        />
        <ExtendedStatCard
          title="Pending"
          value={dashboardStats.pendingPayments || 0}
          subtitle={formatCurrency(dashboardStats.pendingAmount || 0)}
          icon={<Clock className="h-3 w-3 sm:h-4 sm:w-4" />}
          loading={dashboardLoading}
          color="yellow"
        />
        <ExtendedStatCard
          title="Checkouts"
          value={dashboardStats.upcomingCheckouts || 0}
          icon={<Users className="h-3 w-3 sm:h-4 sm:w-4" />}
          loading={dashboardLoading}
          color="blue"
        />
        <ExtendedStatCard
          title="Maintenance"
          value={dashboardStats.maintenanceRequests || 0}
          icon={<AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />}
          loading={dashboardLoading}
          color="red"
        />
      </div>

      {/* Filters Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A1F5C]" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3">
            {/* Report Type */}
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs">Report Type</Label>
              <Select
                value={filters.reportType}
                onValueChange={(value: any) => setFilters({ ...filters, reportType: value })}
              >
                <SelectTrigger className="h-8 sm:h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue" className="text-xs">📊 Revenue Report</SelectItem>
                  <SelectItem value="payments" className="text-xs">💰 Payments Report</SelectItem>
                  <SelectItem value="tenants" className="text-xs">👥 Tenants Report</SelectItem>
                  <SelectItem value="occupancy" className="text-xs">🏠 Occupancy Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs">Date Range</Label>
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger className="h-8 sm:h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today" className="text-xs">Today</SelectItem>
                  <SelectItem value="week" className="text-xs">Last 7 Days</SelectItem>
                  <SelectItem value="month" className="text-xs">This Month</SelectItem>
                  <SelectItem value="year" className="text-xs">This Year</SelectItem>
                  <SelectItem value="custom" className="text-xs">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setFilters({ ...filters, startDate: e.target.value });
                  setDateRange('custom');
                }}
                className="h-8 sm:h-9 text-xs"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs">End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setFilters({ ...filters, endDate: e.target.value });
                  setDateRange('custom');
                }}
                className="h-8 sm:h-9 text-xs"
              />
            </div>

            {/* Property */}
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs">Property</Label>
              <Select value={filters.propertyId} onValueChange={handlePropertyChange}>
                <SelectTrigger className="h-8 sm:h-9 text-xs">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">🏢 All Properties</SelectItem>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id} className="text-xs">
                      <span>{property.name}</span>
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
                className="w-full h-8 sm:h-9 text-xs bg-gradient-to-r from-[#0A1F5C] to-[#1E4ED8] hover:from-[#0A1F5C] hover:to-[#2563eb]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-1.5">
            <Badge variant="outline" className="px-2 py-0.5 text-[10px] sm:text-xs">
              <Calendar className="h-2.5 w-2.5 mr-1" />
              {filters.startDate} to {filters.endDate}
            </Badge>
            <Badge variant="outline" className="px-2 py-0.5 text-[10px] sm:text-xs">
              <Building2 className="h-2.5 w-2.5 mr-1" />
              {getPropertyDisplay()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex h-9">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Quick Actions</TabsTrigger>
          <TabsTrigger value="report" disabled={!reportData} className="text-xs sm:text-sm">
            Generated Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-3 sm:mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-base">Generate Reports Quickly</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <QuickActionButton
                  icon={<IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Revenue Report"
                  onClick={() => {
                    setFilters({ ...filters, reportType: 'revenue' });
                    generateReport();
                  }}
                  color="blue"
                />
                <QuickActionButton
                  icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Tenants Report"
                  onClick={() => {
                    setFilters({ ...filters, reportType: 'tenants' });
                    generateReport();
                  }}
                  color="purple"
                />
                <QuickActionButton
                  icon={<Home className="h-4 w-4 sm:h-5 sm:w-5" />}
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

        <TabsContent value="report" className="mt-3 sm:mt-4">
          {reportData && (
            <>
              {/* Report Actions */}
              <div className="flex justify-end gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <Button variant="outline" size="sm" onClick={exportToCSV} className="h-7 sm:h-8 text-xs">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="h-7 sm:h-8 text-xs">
                  <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Print
                </Button>
              </div>

              {/* Summary Stats - Compact Cards */}
             {/* Summary Stats - Compact Cards */}
<div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
  <SummaryStatCard
    title="Revenue"
    value={formatCurrency(summaryStats.totalRevenue)}
    icon={<IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />}  // Icon passed here
  />
  <SummaryStatCard
    title="Payments"
    value={summaryStats.totalPayments.toString()}
    icon={<IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />}  // Icon passed here
  />
  <SummaryStatCard
    title="Tenants"
    value={summaryStats.totalTenants.toString()}
    icon={<Users className="h-3 w-3 sm:h-4 sm:w-4" />}  // Icon passed here
  />
  <SummaryStatCard
    title="Occupancy"
    value={`${summaryStats.occupancyRate.toFixed(1)}%`}
    icon={<Activity className="h-3 w-3 sm:h-4 sm:w-4" />}  // Icon passed here
  />
  <SummaryStatCard
    title="Collection"
    value={`${summaryStats.collectionRate.toFixed(1)}%`}
    icon={<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />}  // Icon passed here
  />
</div>

              {/* Detailed Report */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 px-3 sm:px-6">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-[#0A1F5C]" />
                    Detailed Report Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 overflow-x-auto">
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
function StatCard({ title, value, icon, loading }: any) {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-2 sm:p-3">
          <div className="animate-pulse flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-2 w-12 bg-gray-200 rounded"></div>
              <div className="h-4 w-8 bg-gray-300 rounded"></div>
            </div>
            <div className="h-6 w-6 bg-gray-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">
              {title}
            </p>
            <p className="text-sm sm:text-base font-bold text-gray-900">
              {value}
            </p>
          </div>
          <div className="p-1.5 sm:p-2 rounded-lg bg-gray-100">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
function ExtendedStatCard({ title, value, subtitle, icon, loading, color }: any) {
  const colors = {
    green: 'from-green-50 to-emerald-50 text-green-600',
    yellow: 'from-yellow-50 to-amber-50 text-yellow-600',
    blue: 'from-blue-50 to-cyan-50 text-blue-600',
    red: 'from-red-50 to-rose-50 text-red-600',
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-2 sm:p-3">
          <div className="animate-pulse flex items-center gap-2">
            <div className="rounded-full bg-gray-200 h-6 w-6"></div>
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-0 shadow-sm bg-gradient-to-br ${colors[color]}`}>
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className={`p-1 rounded-lg bg-white/50`}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-gray-600">{title}</p>
            <p className="text-xs sm:text-sm font-bold">{value}</p>
            {subtitle && <p className="text-[8px] sm:text-[10px] text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ icon, label, onClick, color }: any) {
  const colors = {
    blue: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-600 ',
    purple: 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-600',
    orange: 'from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-600',
  };

  return (
    <Button
      variant="ghost"
      className={`w-full h-auto py-2 sm:py-3 px-2 sm:px-3 flex flex-col items-center justify-center gap-1 sm:gap-1.5 bg-gradient-to-br ${colors[color]} border-0`}
      onClick={onClick}
    >
      {icon}
      <span className="text-[10px] sm:text-xs font-medium">{label}</span>
    </Button>
  );
}

function SummaryStatCard({ title, value, icon }: any) {
  // Different light colors for each card type
  const getBgColor = (title: string) => {
    switch(title) {
      case 'Revenue':
        return 'bg-emerald-50';
      case 'Payments':
        return 'bg-blue-50';
      case 'Tenants':
        return 'bg-purple-50';
      case 'Occupancy':
        return 'bg-orange-50';
      case 'Collection':
        return 'bg-indigo-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getIconColor = (title: string) => {
    switch(title) {
      case 'Revenue':
        return 'text-emerald-600';
      case 'Payments':
        return 'text-blue-600';
      case 'Tenants':
        return 'text-purple-600';
      case 'Occupancy':
        return 'text-orange-600';
      case 'Collection':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className={`${getBgColor(title)} border-0 shadow-sm`}>
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-[10px] text-gray-600 font-medium uppercase tracking-wider">
              {title}
            </p>
            <p className="text-xs sm:text-sm font-bold text-gray-900">
              {value}
            </p>
          </div>
          <div className={`p-1.5 rounded-lg bg-white/70 ${getIconColor(title)}`}>
            {icon} {/* This is where the icon is rendered */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
// Report Detail Components (Keep existing implementations)
function RevenueReportDetails({ data, formatCurrency }: any) {
  const summary = data.summary;
  
  return (
    <div className="space-y-3 sm:space-y-4">
     <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
  <SummaryCard
    title="Rent Revenue"
    value={formatCurrency(summary.rentRevenue || 0)}
    subtitle={`${summary.rentCount || 0} payments`}
    bgColor="bg-rose-50"
    iconColor="text-rose-600"
    borderColor="border-l-4 border-rose-400"
  />
  <SummaryCard
    title="Deposit Revenue"
    value={formatCurrency(summary.depositRevenue || 0)}
    subtitle={`${summary.depositCount || 0} payments`}
    bgColor="bg-teal-50"
    iconColor="text-teal-600"
    borderColor="border-l-4 border-teal-400"
  />
  <SummaryCard
    title="Addon Revenue"
    value={formatCurrency(summary.addonRevenue || 0)}
    subtitle={`${summary.addonCount || 0} payments`}
    bgColor="bg-amber-50"
    iconColor="text-amber-600"
    borderColor="border-l-4 border-amber-400"
  />
  <SummaryCard
    title="Total Revenue"
    value={formatCurrency(summary.totalRevenue || 0)}
    subtitle={`${summary.paymentCount || 0} payments`}
    bgColor="bg-indigo-50"
    iconColor="text-indigo-600"
    borderColor="border-l-4 border-indigo-400"
  />
</div>

      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Payment #</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Date</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Tenant</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Type</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Amount</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.payments?.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">{payment.payment_number || payment.id}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">
                      {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium">{payment.tenant_name || 'N/A'}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">
                      <Badge variant="outline" className="text-[8px] sm:text-[10px] px-1 py-0">{payment.payment_type || 'N/A'}</Badge>
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold">{formatCurrency(payment.amount || 0)}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className="text-[8px] sm:text-[10px] px-1 py-0">
                        {payment.status || 'N/A'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsReportDetails({ data, formatCurrency }: any) {
  const summary = data.summary;
  
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
        <SummaryCard
          title="Completed"
          value={summary.completedPayments?.toString() || '0'}
          subtitle={formatCurrency(summary.completedAmount || 0)}
          bgColor="bg-blue-50"
        />
        <SummaryCard
          title="Pending"
          value={summary.pendingPayments?.toString() || '0'}
          subtitle={formatCurrency(summary.pendingAmount || 0)}
          bgColor="bg-orange-50"
        />
        <SummaryCard
          title="Failed"
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

      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Payment #</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Date</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Tenant</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Amount</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Method</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.payments?.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">{payment.payment_number || payment.id}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">
                      {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium">{payment.tenant_name || 'N/A'}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold">{formatCurrency(payment.amount || 0)}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">{payment.payment_method || 'N/A'}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className="text-[8px] sm:text-[10px] px-1 py-0">
                        {payment.status || 'N/A'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function TenantsReportDetails({ data }: any) {
  const summary = data.summary;
  
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
        <SummaryCard
          title="Active Tenants"
          value={summary.activeTenants?.toString() || '0'}
          bgColor="bg-blue-50"
        />
        <SummaryCard
          title="Inactive"
          value={summary.inactiveTenants?.toString() || '0'}
          bgColor="bg-gray-50"
        />
        <SummaryCard
          title="With Bookings"
          value={summary.withActiveBookings?.toString() || '0'}
          bgColor="bg-green-50"
        />
        <SummaryCard
          title="New This Month"
          value={summary.newTenantsThisMonth?.toString() || '0'}
          bgColor="bg-purple-50"
        />
      </div>

      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Name</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Phone</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Gender</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Occupation</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.tenants?.map((tenant: any) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium">{tenant.full_name}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">{tenant.phone || '-'}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">{tenant.gender || 'N/A'}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">{tenant.occupation || 'N/A'}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">
                      <Badge variant={tenant.is_active ? 'default' : 'secondary'} className="text-[8px] sm:text-[10px] px-1 py-0">
                        {tenant.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function OccupancyReportDetails({ data, formatCurrency }: any) {
  const summary = data.summary;
  
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
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

      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Property</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Room #</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Type</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Rent</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Status</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-semibold">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.rooms?.map((room: any) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">{room.property_name || 'N/A'}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium">{room.room_number}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">{room.room_type || 'Standard'}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold">{formatCurrency(room.rent_amount || 0)}</td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">
                      <Badge
                        variant={
                          room.status === 'occupied' ? 'default' :
                          room.status === 'vacant' ? 'secondary' : 
                          room.status === 'maintenance' ? 'destructive' : 'outline'
                        }
                        className="text-[8px] sm:text-[10px] px-1 py-0"
                      >
                        {room.status || 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">
                      {room.occupied_beds || 0} / {room.total_bed || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, subtitle, bgColor, iconColor, borderColor }: any) {
  // Get icon based on title
  const getIcon = () => {
    switch(title) {
      // Revenue report icons
      case 'Rent Revenue':
        return <Home className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      case 'Deposit Revenue':
        return <Wallet className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      case 'Addon Revenue':
        return <TrendUp className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      case 'Total Revenue':
        return <IndianRupee className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      
      // Payments report icons
      case 'Completed':
        return <CheckCircle className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      case 'Pending':
        return <Clock className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      case 'Failed':
        return <AlertCircle className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      case 'Collection Rate':
        return <TrendUp className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      
      // Tenants report icons
      case 'Active Tenants':
        return <Users className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      case 'Inactive':
        return <Users className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      case 'With Bookings':
        return <Home className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      case 'New This Month':
        return <UserPlus className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      
      // Occupancy report icons
      case 'Total Rooms':
        return <DoorOpen className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      case 'Occupied':
        return <Home className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      case 'Vacant':
        return <DoorOpen className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      case 'Maintenance':
        return <AlertCircle className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      case 'Occupancy Rate':
        return <Activity className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
      
      default:
        // Return a default icon or null
        return <FileText className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />;
    }
  };

  return (
    <div className={`${bgColor} ${borderColor} p-2 sm:p-3 rounded-lg shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] sm:text-xs text-gray-600 font-medium flex items-center gap-1">
            {getIcon()}
            {title}
          </p>
          <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-[8px] sm:text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}