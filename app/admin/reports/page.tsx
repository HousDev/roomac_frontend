"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  UserPlus,
  Bed,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Target,
  Zap,
  Heart,
  Briefcase,
  GraduationCap,
  Landmark,
  Store,
  Laptop
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from 'date-fns';
import { toast } from 'sonner';
import * as reportApi from '@/lib/reportApi';
import * as XLSX from 'xlsx';

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
  
  const [propertyDetails, setPropertyDetails] = useState<any[]>([]);
  const [roomDetails, setRoomDetails] = useState<any[]>([]);
  const [tenantDetails, setTenantDetails] = useState<any[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<any[]>([]);
  
  const [filters, setFilters] = useState<reportApi.ReportFilters>({
    reportType: 'revenue',
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    propertyId: 'all'
  });

  const reportSectionRef = useRef<HTMLDivElement>(null);
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
    loadPropertyDetails();
    loadRoomDetails();
    loadTenantDetails();
    loadPaymentDetails();
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

  const loadPropertyDetails = async () => {
    try {
      const response = await fetch(`/api/properties?pageSize=100`);
      const data = await response.json();
      if (data.success) {
        const propertiesData = data.data?.data || data.data || [];
        setPropertyDetails(propertiesData);
      }
    } catch (error) {
      console.error('Error loading property details:', error);
    }
  };

  const loadRoomDetails = async () => {
    try {
      const response = await fetch(`/api/rooms`);
      const data = await response.json();
      const rooms = Array.isArray(data) ? data : (data.data || []);
      setRoomDetails(rooms);
    } catch (error) {
      console.error('Error loading room details:', error);
    }
  };

  const loadTenantDetails = async () => {
    try {
      const response = await fetch(`/api/tenants?pageSize=1000`);
      const data = await response.json();
      const tenants = data.data || [];
      setTenantDetails(tenants);
    } catch (error) {
      console.error('Error loading tenant details:', error);
    }
  };

  const loadPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/payments`);
      const data = await response.json();
      const payments = data.data || [];
      setPaymentDetails(payments);
    } catch (error) {
      console.error('Error loading payment details:', error);
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
            totalTenants: 0,
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
      
      setTimeout(() => {
        reportSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (!reportData) {
      toast.error('No data to export');
      return;
    }

    try {
      let exportData: any[] = [];
      let worksheetName = '';
      let summaryData: any[] = [];

      switch (filters.reportType) {
        case 'revenue':
        case 'payments':
          worksheetName = 'Payments';
          exportData = reportData.payments?.map((payment: any) => ({
            'Payment #': payment.payment_number || payment.id,
            'Date': payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-IN') : '-',
            'Tenant Name': payment.tenant_name || 'N/A',
            'Property': payment.property_name || 'N/A',
            'Payment Type': payment.payment_type || '-',
            'Amount (₹)': payment.amount || 0,
            'Payment Method': payment.payment_method || '-',
            'Status': payment.status || 'unknown'
          })) || [];
          summaryData = [{
            'Metric': 'Total Revenue',
            'Value': `₹${(reportData.summary as any).totalRevenue?.toLocaleString('en-IN') || 0}`
          }, {
            'Metric': 'Total Payments',
            'Value': (reportData.summary as any).paymentCount || 0
          }];
          break;
        case 'tenants':
          worksheetName = 'Tenants';
          exportData = reportData.tenants?.map((tenant: any) => ({
            'Name': tenant.full_name || '-',
            'Email': tenant.email || '-',
            'Phone': tenant.phone || '-',
            'Gender': tenant.gender || 'N/A',
            'Occupation': tenant.occupation || 'N/A',
            'Status': tenant.is_active ? 'Active' : 'Inactive',
            'Property': tenant.property_name || 'N/A',
            'Created Date': tenant.created_at ? new Date(tenant.created_at).toLocaleDateString('en-IN') : '-'
          })) || [];
          const tenantSummary = reportData.summary as any;
          summaryData = [{
            'Metric': 'Total Tenants',
            'Value': tenantSummary.totalTenants || 0
          }, {
            'Metric': 'Active Tenants',
            'Value': tenantSummary.activeTenants || 0
          }];
          break;
        case 'occupancy':
          worksheetName = 'Rooms';
          exportData = reportData.rooms?.map((room: any) => ({
            'Property': room.property_name || 'N/A',
            'Room Number': room.room_number || '-',
            'Room Type': room.room_type || '-',
            'Status': room.status || 'unknown',
            'Occupied Beds': room.occupied_beds || 0,
            'Total Beds': room.total_bed || 0,
            'Available Beds': (room.total_bed || 0) - (room.occupied_beds || 0)
          })) || [];
          const occupancySummary = reportData.summary as any;
          summaryData = [{
            'Metric': 'Occupancy Rate',
            'Value': `${occupancySummary.occupancyRate || 0}%`
          }];
          break;
      }

      const wb = XLSX.utils.book_new();
      
      if (summaryData.length > 0) {
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      }
      
      if (exportData.length > 0) {
        const dataWs = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, dataWs, worksheetName);
      }
      
      const filename = `${filters.reportType}_report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success('Report exported successfully as Excel');
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
    if (!amount || isNaN(amount)) return '₹0';
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

  // Calculate metrics from loaded data
  const totalProperties = propertyDetails.length;
  const activeProperties = propertyDetails.filter((p: any) => p.is_active).length;
  const totalRooms = roomDetails.length;
  const occupiedRooms = roomDetails.filter((r: any) => r.occupied_beds > 0).length;
  const vacantRooms = totalRooms - occupiedRooms;
  const totalBeds = roomDetails.reduce((sum: number, r: any) => sum + (r.total_bed || 0), 0);
  const occupiedBeds = roomDetails.reduce((sum: number, r: any) => sum + (r.occupied_beds || 0), 0);
  const availableBeds = totalBeds - occupiedBeds;
  const bedOccupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
  const roomOccupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
  
  const totalTenants = tenantDetails.length;
  const activeTenants = tenantDetails.filter((t: any) => t.is_active).length;
  const coupleBookings = tenantDetails.filter((t: any) => t.is_couple_booking).length;
  
  const totalPaymentsAmount = paymentDetails.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const approvedPayments = paymentDetails.filter((p: any) => p.status === 'approved' || p.status === 'paid');
  const pendingPayments = paymentDetails.filter((p: any) => p.status === 'pending');
  const pendingAmount = pendingPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const collectionRate = totalPaymentsAmount > 0 ? (approvedPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / totalPaymentsAmount) * 100 : 0;

  // Gender distribution
  const maleTenants = tenantDetails.filter((t: any) => t.gender === 'Male').length;
  const femaleTenants = tenantDetails.filter((t: any) => t.gender === 'Female').length;

  // Occupation distribution
  const occupationCounts: Record<string, number> = {};
  tenantDetails.forEach((t: any) => {
    const occ = t.occupation_category || 'Other';
    occupationCounts[occ] = (occupationCounts[occ] || 0) + 1;
  });

  return (
    <div className="p-1 sm:p-4 md:p-4 space-y-3 sm:space-y-4 md:space-y-6 max-w-full overflow-x-hidden -mt-7">

      {/* Stats Cards Row - KEEP EXISTING UI */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
        <StatCard
          title="Total Properties"
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

      {/* Extended Stats Cards - KEEP EXISTING UI */}
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

      {/* Filters Card - KEEP EXISTING UI */}
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

        <TabsContent value="report" className="mt-3 sm:mt-4" ref={reportSectionRef}>
          {reportData && (
            <>
              {/* Report Actions */}
              <div className="flex justify-end gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <Button variant="outline" size="sm" onClick={exportToExcel} className="h-7 sm:h-8 text-xs">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Export Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="h-7 sm:h-8 text-xs">
                  <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Print
                </Button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <SummaryStatCard title="Revenue" value={formatCurrency(summaryStats.totalRevenue)} icon={<IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />} />
                <SummaryStatCard title="Payments" value={summaryStats.totalPayments.toString()} icon={<CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />} />
                <SummaryStatCard title="Tenants" value={summaryStats.totalTenants.toString()} icon={<Users className="h-3 w-3 sm:h-4 sm:w-4" />} />
                <SummaryStatCard title="Occupancy" value={`${summaryStats.occupancyRate.toFixed(1)}%`} icon={<Activity className="h-3 w-3 sm:h-4 sm:w-4" />} />
                <SummaryStatCard title="Collection" value={`${summaryStats.collectionRate.toFixed(1)}%`} icon={<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />} />
              </div>

              {/* Detailed Report - KEEP EXISTING */}
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

      {/* ===== ADDED DETAILED MODULE INSIGHTS SECTION - NEW ===== */}
      <div className="mt-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 px-1">📊 Module-wise Detailed Analysis</h2>
        
        {/* Property Module Insights */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 px-3 sm:px-6 bg-gradient-to-r from-blue-50 to-white">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Property Module Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{totalProperties}</p>
                <p className="text-xs text-gray-600">Total Properties</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{activeProperties}</p>
                <p className="text-xs text-gray-600">Active Properties</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-700">{totalProperties - activeProperties}</p>
                <p className="text-xs text-gray-600">Inactive Properties</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-700">{((activeProperties / totalProperties) * 100).toFixed(1)}%</p>
                <p className="text-xs text-gray-600">Property Occupancy Rate</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {activeProperties === totalProperties ? 
                '✅ All properties are active and operational' : 
                `⚠️ ${totalProperties - activeProperties} propert${totalProperties - activeProperties !== 1 ? 'ies are' : 'y is'} inactive`
              }
            </div>
          </CardContent>
        </Card>

        {/* Rooms Module Insights */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 px-3 sm:px-6 bg-gradient-to-r from-purple-50 to-white">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-purple-600" />
              Rooms Module Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-700">{totalRooms}</p>
                <p className="text-xs text-gray-600">Total Rooms</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{occupiedRooms}</p>
                <p className="text-xs text-gray-600">Occupied Rooms</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-700">{vacantRooms}</p>
                <p className="text-xs text-gray-600">Vacant Rooms</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-700">{totalRooms - occupiedRooms - vacantRooms}</p>
                <p className="text-xs text-gray-600">Maintenance Rooms</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-indigo-700">{roomOccupancyRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">Room Occupancy</p>
              </div>
            </div>
            <Progress value={roomOccupancyRate} className="h-2 mb-2" />
            <div className="text-xs text-gray-500">
              {roomOccupancyRate >= 80 ? '✅ Good room occupancy rate' : roomOccupancyRate >= 50 ? '⚠️ Room for improvement' : '❌ Low room occupancy - focus on marketing'}
            </div>
          </CardContent>
        </Card>

        {/* Beds Module Insights */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 px-3 sm:px-6 bg-gradient-to-r from-teal-50 to-white">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Bed className="h-4 w-4 text-teal-600" />
              Beds Module Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-teal-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-teal-700">{totalBeds}</p>
                <p className="text-xs text-gray-600">Total Beds</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{occupiedBeds}</p>
                <p className="text-xs text-gray-600">Occupied Beds</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-700">{availableBeds}</p>
                <p className="text-xs text-gray-600">Available Beds</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-indigo-700">{bedOccupancyRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">Bed Occupancy</p>
              </div>
            </div>
            <Progress value={bedOccupancyRate} className="h-2 mb-2" />
            <div className="text-xs text-gray-500">
              {bedOccupancyRate >= 85 ? '🎯 Excellent bed utilization' : bedOccupancyRate >= 60 ? '📈 Room for improvement' : '⚠️ Low bed occupancy - consider promotions'}
              {availableBeds > 0 && ` (${availableBeds} beds available for new tenants)`}
            </div>
          </CardContent>
        </Card>

        {/* Tenants Module Insights */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 px-3 sm:px-6 bg-gradient-to-r from-pink-50 to-white">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-pink-600" />
              Tenants Module Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
              <div className="bg-pink-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-pink-700">{totalTenants}</p>
                <p className="text-xs text-gray-600">Total Tenants</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{activeTenants}</p>
                <p className="text-xs text-gray-600">Active Tenants</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-700">{totalTenants - activeTenants}</p>
                <p className="text-xs text-gray-600">Inactive Tenants</p>
              </div>
              <div className="bg-rose-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-rose-700">{coupleBookings}</p>
                <p className="text-xs text-gray-600">Couple Bookings</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-indigo-700">{((activeTenants / totalTenants) * 100).toFixed(1)}%</p>
                <p className="text-xs text-gray-600">Active Rate</p>
              </div>
            </div>
            
            {/* Gender Distribution */}
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs font-semibold text-gray-700 mb-2">Gender Distribution:</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs">Male: {maleTenants}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                  <span className="text-xs">Female: {femaleTenants}</span>
                </div>
              </div>
            </div>

            {/* Occupation Distribution */}
            {Object.keys(occupationCounts).length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-semibold text-gray-700 mb-2">Occupation Distribution:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(occupationCounts).slice(0, 5).map(([occ, count]) => (
                    <Badge key={occ} variant="outline" className="text-[10px]">
                      {occ}: {count}
                    </Badge>
                  ))}
                  {Object.keys(occupationCounts).length > 5 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{Object.keys(occupationCounts).length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payments Module Insights */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 px-3 sm:px-6 bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-green-600" />
              Payments Module Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-700">{formatCurrency(totalPaymentsAmount)}</p>
                <p className="text-xs text-gray-600">Total Revenue</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-emerald-700">{paymentDetails.length}</p>
                <p className="text-xs text-gray-600">Total Transactions</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-yellow-700">{formatCurrency(pendingAmount)}</p>
                <p className="text-xs text-gray-600">Pending Amount</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-indigo-700">{collectionRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">Collection Rate</p>
              </div>
            </div>
            
            {/* Payment Status Breakdown */}
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs font-semibold text-gray-700 mb-2">Payment Status:</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Approved: {approvedPayments.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs">Pending: {pendingPayments.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs">Rejected: {paymentDetails.length - approvedPayments.length - pendingPayments.length}</span>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="mt-3 p-2 bg-amber-50 rounded-lg">
              <p className="text-[10px] text-amber-700">
                {pendingAmount > 100000 ? 
                  '⚠️ High pending amount - follow up on pending payments immediately' : 
                  pendingAmount > 0 ? 
                  '📋 Pending payments need attention' : 
                  '✅ No pending payments - great collection rate'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Recommendations */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-700" />
              Performance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-sm">Property Actions</span>
                </div>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    {activeProperties === totalProperties ? 
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                    }
                    {activeProperties}/{totalProperties} properties active
                  </li>
                  {totalProperties - activeProperties > 0 && (
                    <li className="text-blue-600 ml-5">🔧 Review inactive properties</li>
                  )}
                </ul>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Bed className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-sm">Bed Occupancy Actions</span>
                </div>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    {bedOccupancyRate >= 85 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : bedOccupancyRate >= 60 ? <AlertCircle className="h-3 w-3 text-yellow-500" /> : <AlertTriangle className="h-3 w-3 text-red-500" />}
                    {bedOccupancyRate.toFixed(0)}% bed occupancy rate
                  </li>
                  {availableBeds > 10 && (
                    <li className="text-blue-600 ml-5">🎯 Focus on marketing to fill {availableBeds} available beds</li>
                  )}
                </ul>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-sm">Financial Actions</span>
                </div>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    {collectionRate >= 90 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : collectionRate >= 70 ? <AlertCircle className="h-3 w-3 text-yellow-500" /> : <AlertTriangle className="h-3 w-3 text-red-500" />}
                    {collectionRate.toFixed(0)}% collection rate
                  </li>
                  {pendingAmount > 100000 && (
                    <li className="text-red-600 ml-5">⚠️ High pending amount - follow up on {pendingPayments.length} pending payments</li>
                  )}
                </ul>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold text-sm">Tenant Actions</span>
                </div>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    {coupleBookings > 0 ? <Heart className="h-3 w-3 text-pink-500" /> : <AlertCircle className="h-3 w-3 text-gray-400" />}
                    {coupleBookings} couple booking{coupleBookings !== 1 ? 's' : ''}
                  </li>
                  {totalTenants - activeTenants > 5 && (
                    <li className="text-yellow-600 ml-5">📞 Reach out to inactive tenants</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper Components - KEEP EXISTING ONES
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
    blue: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-600',
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
  const getBgColor = (title: string) => {
    switch(title) {
      case 'Revenue': return 'bg-emerald-50';
      case 'Payments': return 'bg-blue-50';
      case 'Tenants': return 'bg-purple-50';
      case 'Occupancy': return 'bg-orange-50';
      case 'Collection': return 'bg-indigo-50';
      default: return 'bg-gray-50';
    }
  };

  const getIconColor = (title: string) => {
    switch(title) {
      case 'Revenue': return 'text-emerald-600';
      case 'Payments': return 'text-blue-600';
      case 'Tenants': return 'text-purple-600';
      case 'Occupancy': return 'text-orange-600';
      case 'Collection': return 'text-indigo-600';
      default: return 'text-gray-600';
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
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Report Detail Components - KEEP EXISTING
function RevenueReportDetails({ data, formatCurrency }: any) {
  const summary = data.summary;
  
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
        <SummaryCard title="Rent Revenue" value={formatCurrency(summary.rentRevenue || 0)} subtitle={`${summary.rentCount || 0} payments`} bgColor="bg-rose-50" />
        <SummaryCard title="Deposit Revenue" value={formatCurrency(summary.depositRevenue || 0)} subtitle={`${summary.depositCount || 0} payments`} bgColor="bg-teal-50" />
        <SummaryCard title="Addon Revenue" value={formatCurrency(summary.addonRevenue || 0)} subtitle={`${summary.addonCount || 0} payments`} bgColor="bg-amber-50" />
        <SummaryCard title="Total Revenue" value={formatCurrency(summary.totalRevenue || 0)} subtitle={`${summary.paymentCount || 0} payments`} bgColor="bg-indigo-50" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left">Payment #</th>
              <th className="px-2 py-2 text-left">Date</th>
              <th className="px-2 py-2 text-left">Tenant</th>
              <th className="px-2 py-2 text-left">Type</th>
              <th className="px-2 py-2 text-left">Amount</th>
              <th className="px-2 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.payments?.slice(0, 10).map((payment: any) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-2 py-1.5">{payment.payment_number || payment.id}</td>
                <td className="px-2 py-1.5">{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}</td>
                <td className="px-2 py-1.5 font-medium">{payment.tenant_name || 'N/A'}</td>
                <td className="px-2 py-1.5"><Badge variant="outline" className="text-[10px]">{payment.payment_type || 'N/A'}</Badge></td>
                <td className="px-2 py-1.5 font-semibold">{formatCurrency(payment.amount || 0)}</td>
                <td className="px-2 py-1.5"><Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className="text-[10px]">{payment.status || 'N/A'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.payments?.length > 10 && <p className="text-center text-xs text-gray-500 mt-2">Showing 10 of {data.payments.length} payments</p>}
      </div>
    </div>
  );
}

function PaymentsReportDetails({ data, formatCurrency }: any) {
  const summary = data.summary;
  
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
        <SummaryCard title="Completed" value={summary.completedPayments?.toString() || '0'} subtitle={formatCurrency(summary.completedAmount || 0)} bgColor="bg-blue-50" />
        <SummaryCard title="Pending" value={summary.pendingPayments?.toString() || '0'} subtitle={formatCurrency(summary.pendingAmount || 0)} bgColor="bg-orange-50" />
        <SummaryCard title="Failed" value={summary.failedPayments?.toString() || '0'} subtitle={formatCurrency(summary.failedAmount || 0)} bgColor="bg-red-50" />
        <SummaryCard title="Collection Rate" value={`${((summary.completedAmount / (summary.totalAmount || 1)) * 100).toFixed(1)}%`} subtitle={`Total: ${formatCurrency(summary.totalAmount || 0)}`} bgColor="bg-green-50" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left">Payment #</th>
              <th className="px-2 py-2 text-left">Date</th>
              <th className="px-2 py-2 text-left">Tenant</th>
              <th className="px-2 py-2 text-left">Amount</th>
              <th className="px-2 py-2 text-left">Method</th>
              <th className="px-2 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.payments?.slice(0, 10).map((payment: any) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-2 py-1.5">{payment.payment_number || payment.id}</td>
                <td className="px-2 py-1.5">{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}</td>
                <td className="px-2 py-1.5 font-medium">{payment.tenant_name || 'N/A'}</td>
                <td className="px-2 py-1.5 font-semibold">{formatCurrency(payment.amount || 0)}</td>
                <td className="px-2 py-1.5">{payment.payment_method || 'N/A'}</td>
                <td className="px-2 py-1.5"><Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className="text-[10px]">{payment.status || 'N/A'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.payments?.length > 10 && <p className="text-center text-xs text-gray-500 mt-2">Showing 10 of {data.payments.length} payments</p>}
      </div>
    </div>
  );
}

function TenantsReportDetails({ data }: any) {
  const summary = data.summary;
  
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
        <SummaryCard title="Active Tenants" value={summary.activeTenants?.toString() || '0'} bgColor="bg-blue-50" />
        <SummaryCard title="Inactive" value={summary.inactiveTenants?.toString() || '0'} bgColor="bg-gray-50" />
        <SummaryCard title="With Bookings" value={summary.withActiveBookings?.toString() || '0'} bgColor="bg-green-50" />
        <SummaryCard title="New This Month" value={summary.newTenantsThisMonth?.toString() || '0'} bgColor="bg-purple-50" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left">Name</th>
              <th className="px-2 py-2 text-left">Phone</th>
              <th className="px-2 py-2 text-left">Gender</th>
              <th className="px-2 py-2 text-left">Occupation</th>
              <th className="px-2 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.tenants?.slice(0, 10).map((tenant: any) => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="px-2 py-1.5 font-medium">{tenant.full_name}</td>
                <td className="px-2 py-1.5">{tenant.phone || '-'}</td>
                <td className="px-2 py-1.5">{tenant.gender || 'N/A'}</td>
                <td className="px-2 py-1.5">{tenant.occupation || 'N/A'}</td>
                <td className="px-2 py-1.5"><Badge variant={tenant.is_active ? 'default' : 'secondary'} className="text-[10px]">{tenant.is_active ? 'Active' : 'Inactive'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.tenants?.length > 10 && <p className="text-center text-xs text-gray-500 mt-2">Showing 10 of {data.tenants.length} tenants</p>}
      </div>
    </div>
  );
}

function OccupancyReportDetails({ data, formatCurrency }: any) {
  const summary = data.summary;
  
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
        <SummaryCard title="Total Rooms" value={summary.totalRooms?.toString() || '0'} bgColor="bg-blue-50" />
        <SummaryCard title="Occupied" value={summary.occupiedRooms?.toString() || '0'} bgColor="bg-green-50" />
        <SummaryCard title="Vacant" value={summary.vacantRooms?.toString() || '0'} bgColor="bg-orange-50" />
        <SummaryCard title="Maintenance" value={summary.maintenanceRooms?.toString() || '0'} bgColor="bg-red-50" />
        <SummaryCard title="Occupancy Rate" value={`${summary.occupancyRate || 0}%`} bgColor="bg-purple-50" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left">Property</th>
              <th className="px-2 py-2 text-left">Room #</th>
              <th className="px-2 py-2 text-left">Type</th>
              <th className="px-2 py-2 text-left">Rent</th>
              <th className="px-2 py-2 text-left">Status</th>
              <th className="px-2 py-2 text-left">Occupancy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.rooms?.slice(0, 10).map((room: any) => (
              <tr key={room.id} className="hover:bg-gray-50">
                <td className="px-2 py-1.5">{room.property_name || 'N/A'}</td>
                <td className="px-2 py-1.5 font-medium">{room.room_number}</td>
                <td className="px-2 py-1.5">{room.room_type || 'Standard'}</td>
                <td className="px-2 py-1.5 font-semibold">{formatCurrency(room.rent_amount || 0)}</td>
                <td className="px-2 py-1.5"><Badge variant={room.status === 'occupied' ? 'default' : room.status === 'vacant' ? 'secondary' : 'destructive'} className="text-[10px]">{room.status || 'N/A'}</Badge></td>
                <td className="px-2 py-1.5">{room.occupied_beds || 0} / {room.total_bed || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.rooms?.length > 10 && <p className="text-center text-xs text-gray-500 mt-2">Showing 10 of {data.rooms.length} rooms</p>}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, subtitle, bgColor }: any) {
  return (
    <div className={`${bgColor} p-2 rounded-lg shadow-sm`}>
      <p className="text-[10px] text-gray-600 font-medium">{title}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-[8px] text-gray-500">{subtitle}</p>}
    </div>
  );
}