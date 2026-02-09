"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import {
  Download,
  Upload,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Home,
  FileText,
  Filter,
  BarChart3
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { toast } from 'sonner';

interface ReportFilters {
  reportType: 'revenue' | 'occupancy' | 'payments' | 'tenants' | 'expenses';
  dateRange: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate: string;
  endDate: string;
  propertyId: string;
}

const api = {
  properties: '/api/properties',
  payments: '/api/payments',
  tenants: '/api/tenants',
  rooms: '/api/rooms'
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'revenue',
    dateRange: 'month',
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    propertyId: 'all'
  });

  const [reportData, setReportData] = useState<any>(null);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    totalTenants: 0,
    occupancyRate: 0,
    collectionRate: 0
  });

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (filters.dateRange !== 'custom') updateDateRangeAutomatically();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateRange]);

  async function loadProperties() {
    try {
      const res = await fetch(api.properties);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading properties:', err);
      toast.error('Failed to load properties');
    }
  }

  const updateDateRangeAutomatically = () => {
    const today = new Date();
    let start = '';
    let end = '';

    switch (filters.dateRange) {
      case 'today':
        start = end = format(today, 'yyyy-MM-dd');
        break;
      case 'week':
        start = format(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        end = format(new Date(), 'yyyy-MM-dd');
        break;
      case 'month':
        start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        end = format(endOfMonth(new Date()), 'yyyy-MM-dd');
        break;
      case 'year':
        start = format(startOfYear(new Date()), 'yyyy-MM-dd');
        end = format(endOfYear(new Date()), 'yyyy-MM-dd');
        break;
      default:
        return;
    }

    setFilters(prev => ({ ...prev, startDate: start, endDate: end }));
  };

  const generateReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      switch (filters.reportType) {
        case 'revenue':
          await generateRevenueReport();
          break;
        case 'payments':
          await generatePaymentsReport();
          break;
        case 'tenants':
          await generateTenantsReport();
          break;
        case 'occupancy':
          await generateOccupancyReport();
          break;
        default:
          toast.error('Report type not implemented');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const paymentsUrl = (extraParams?: Record<string, string>) => {
    const params: Record<string, string> = {
      start: filters.startDate,
      end: filters.endDate
    };
    if (filters.propertyId && filters.propertyId !== 'all') params['propertyId'] = filters.propertyId;
    if (extraParams) Object.assign(params, extraParams);
    const qs = new URLSearchParams(params).toString();
    return `${api.payments}?${qs}`;
  };

  const generateRevenueReport = async () => {
    try {
      const url = paymentsUrl({ status: 'completed' });
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const totalRevenue = (data || []).reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);
      const rentPayments = (data || []).filter((p: any) => p.payment_type === 'rent');
      const depositPayments = (data || []).filter((p: any) => p.payment_type === 'deposit');
      const addonPayments = (data || []).filter((p: any) => p.payment_type === 'addon');

      setSummaryStats({
        totalRevenue,
        totalPayments: data?.length || 0,
        totalTenants: new Set((data || []).map((p: any) => p.tenant_id)).size,
        occupancyRate: 0,
        collectionRate: 100
      });

      setReportData({
        payments: data,
        summary: {
          totalRevenue,
          rentRevenue: rentPayments.reduce((s: number, p: any) => s + parseFloat(p.amount || 0), 0),
          depositRevenue: depositPayments.reduce((s: number, p: any) => s + parseFloat(p.amount || 0), 0),
          addonRevenue: addonPayments.reduce((s: number, p: any) => s + parseFloat(p.amount || 0), 0),
          paymentCount: data?.length || 0,
          rentCount: rentPayments.length,
          depositCount: depositPayments.length,
          addonCount: addonPayments.length
        }
      });

      toast.success('Revenue report generated successfully');
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const generatePaymentsReport = async () => {
    try {
      const url = paymentsUrl();
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const totalAmount = (data || []).reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);
      const completedPayments = (data || []).filter((p: any) => p.status === 'completed');
      const pendingPayments = (data || []).filter((p: any) => p.status === 'pending');

      setSummaryStats({
        totalRevenue: totalAmount,
        totalPayments: data?.length || 0,
        totalTenants: 0,
        occupancyRate: 0,
        collectionRate: ((completedPayments.length) / (data?.length || 1)) * 100
      });

      setReportData({
        payments: data,
        summary: {
          totalAmount,
          completedPayments: completedPayments.length,
          pendingPayments: pendingPayments.length,
          completedAmount: completedPayments.reduce((s: number, p: any) => s + parseFloat(p.amount || 0), 0),
          pendingAmount: pendingPayments.reduce((s: number, p: any) => s + parseFloat(p.amount || 0), 0)
        }
      });

      toast.success('Payments report generated successfully');
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const generateTenantsReport = async () => {
    try {
      const res = await fetch(api.tenants);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const activeTenants = (data || []).filter((t: any) => t.status === 'active');
      const inactiveTenants = (data || []).filter((t: any) => t.status === 'inactive');
      const tenantsWithActiveBookings = (data || []).filter((t: any) =>
        Array.isArray(t.bookings) && t.bookings.some((b: any) => b.status === 'active')
      );

      setSummaryStats({
        totalRevenue: 0,
        totalPayments: 0,
        totalTenants: data?.length || 0,
        occupancyRate: (tenantsWithActiveBookings.length / (data?.length || 1)) * 100,
        collectionRate: 0
      });

      setReportData({
        tenants: data,
        summary: {
          totalTenants: data?.length || 0,
          activeTenants: activeTenants.length,
          inactiveTenants: inactiveTenants.length,
          withActiveBookings: tenantsWithActiveBookings.length,
          maleCount: (data || []).filter((t: any) => t.gender === 'male').length || 0,
          femaleCount: (data || []).filter((t: any) => t.gender === 'female').length || 0
        }
      });

      toast.success('Tenants report generated successfully');
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const generateOccupancyReport = async () => {
    try {
      const url = `${api.rooms}?include=properties${filters.propertyId && filters.propertyId !== 'all' ? `&propertyId=${filters.propertyId}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const rooms = await res.json();

      const totalRooms = (rooms || []).length;
      const occupiedRooms = (rooms || []).filter((r: any) => r.status === 'occupied').length || 0;
      const vacantRooms = (rooms || []).filter((r: any) => r.status === 'vacant').length || 0;
      const maintenanceRooms = (rooms || []).filter((r: any) => r.status === 'maintenance').length || 0;
      const occupancyRate = totalRooms ? (occupiedRooms / totalRooms) * 100 : 0;

      setSummaryStats({
        totalRevenue: 0,
        totalPayments: 0,
        totalTenants: 0,
        occupancyRate,
        collectionRate: 0
      });

      setReportData({
        rooms,
        summary: {
          totalRooms,
          occupiedRooms,
          vacantRooms,
          maintenanceRooms,
          occupancyRate: occupancyRate.toFixed(2),
          potentialRevenue: (rooms || []).reduce((s: number, r: any) => s + parseFloat(r.rent_amount || 0), 0),
          actualRevenue: (rooms || []).filter((r: any) => r.status === 'occupied').reduce((s: number, r: any) => s + parseFloat(r.rent_amount || 0), 0)
        }
      });

      toast.success('Occupancy report generated successfully');
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const exportToCSV = () => {
    if (!reportData) {
      toast.error('No data to export');
      return;
    }

    let csvContent = '';
    const filename = `${filters.reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;

    switch (filters.reportType) {
      case 'revenue':
      case 'payments':
        csvContent = 'Payment Number,Date,Tenant,Amount,Type,Method,Status\n';
        (reportData.payments || []).forEach((payment: any) => {
          csvContent += `${payment.payment_number || ''},${payment.payment_date || ''},${payment.tenant?.name || payment.tenants?.name || 'N/A'},${payment.amount || 0},${payment.payment_type || ''},${payment.payment_method || ''},${payment.status || ''}\n`;
        });
        break;

      case 'tenants':
        csvContent = 'Name,Email,Phone,Gender,Occupation,Status\n';
        (reportData.tenants || []).forEach((tenant: any) => {
          csvContent += `${tenant.name || ''},${tenant.email || ''},${tenant.phone || ''},${tenant.gender || 'N/A'},${tenant.occupation || 'N/A'},${tenant.status || ''}\n`;
        });
        break;

      case 'occupancy':
        csvContent = 'Property,Room Number,Type,Rent,Status\n';
        (reportData.rooms || []).forEach((room: any) => {
          csvContent += `${room.properties?.name || 'N/A'},${room.room_number || ''},${room.room_type || ''},${room.rent_amount || 0},${room.status || ''}\n`;
        });
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    toast.success('Report exported successfully');
  };

  const printReport = () => {
    window.print();
    toast.success('Opening print dialog...');
  };

  return (
    <div className="p-2">
      <div className="mb-8">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
    {/* Card 1: Total Revenue */}
    <Card className="border border-blue-100 hover:shadow-sm transition-shadow duration-200 h-32">
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Total Revenue</span>
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-md">
            <DollarSign className="h-3 w-3 text-white" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900 mb-1">
            ₹248,560
          </div>
          <div className="flex items-center text-xs">
            <span className="text-green-600 font-medium flex items-center mr-1">
              <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
              12.5%
            </span>
            <span className="text-gray-500 text-xs">from last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
    
    {/* Card 2: Average Occupation */}
    <Card className="border border-purple-100 hover:shadow-sm transition-shadow duration-200 h-32">
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Avg Occupation</span>
          <div className="p-1.5 bg-gradient-to-r from-purple-500 to-red-500 rounded-md">
            <Users className="h-3 w-3 text-white" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900 mb-1">
            78.2%
          </div>
          <div className="flex items-center text-xs">
            <span className="text-green-600 font-medium flex items-center mr-1">
              <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
              5.3%
            </span>
            <span className="text-gray-500 text-xs">from last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
    
    {/* Card 3: Net Profit */}
    <Card className="border border-orange-100 hover:shadow-sm transition-shadow duration-200 h-32">
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Net Profit</span>
          <div className="p-1.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-md">
            <TrendingUp className="h-3 w-3 text-white" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900 mb-1">
            ₹85,430
          </div>
          <div className="flex items-center text-xs">
            <span className="text-green-600 font-medium flex items-center mr-1">
              <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
              8.7%
            </span>
            <span className="text-gray-500 text-xs">from last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</div>
     <div className="mb-6 flex items-center justify-between">
  {/* Left side: Title and description */}
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
    <p className="text-gray-600">Generate comprehensive reports with custom date ranges</p>
  </div>

  {/* Right side: Buttons */}
  <div className="flex items-center gap-3">
    {/* Download ZIP button */}
    <button className="flex items-center gap-2 px-1 py-2  text-blue-900 rounded-lg hover:bg-blue-200">
      <Download className="w-5 h-5" />
      {/* Download ZIP */}
    </button>

    {/* Upload button */}
    <button className="flex items-center gap-2 px-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
      <Upload className="w-5 h-5" />
      Upload
    </button>
  </div>
</div>
      
<Card className="p-4 md:p-6 mb-6">
  <CardHeader className="pb-4">
    <CardTitle className="flex items-center gap-2 text-gray-700 text-base font-medium">
      <Filter className="h-5 w-5" />
      Report Filters
    </CardTitle>
  </CardHeader>

  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 md:gap-4 items-end">
      
      {/* Report Type */}
      <div className="flex flex-col">
        <Label className="text-sm text-gray-600">Report Type</Label>
        <Select
          value={filters.reportType}
          onValueChange={(value: any) => setFilters({ ...filters, reportType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Revenue Report</SelectItem>
            <SelectItem value="payments">Payments Report</SelectItem>
            <SelectItem value="tenants">Tenants Report</SelectItem>
            <SelectItem value="occupancy">Occupancy Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="flex flex-col">
        <Label className="text-sm text-gray-600">Date Range</Label>
        <Select
          value={filters.dateRange}
          onValueChange={(value: any) => setFilters({ ...filters, dateRange: value })}
        >
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
      <div className="flex flex-col">
        <Label className="text-sm text-gray-600">Start Date</Label>
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value, dateRange: 'custom' })}
          className="h-10"
        />
      </div>

      {/* End Date */}
      <div className="flex flex-col">
        <Label className="text-sm text-gray-600">End Date</Label>
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value, dateRange: 'custom' })}
          className="h-10"
        />
      </div>

      {/* Property */}
      <div className="flex flex-col">
        <Label className="text-sm text-gray-600">Property</Label>
        <Select
          value={filters.propertyId}
          onValueChange={(value) => setFilters({ ...filters, propertyId: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map(property => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Generate Button */}
      <div className="flex items-center mt-2 md:mt-0">
        <Button onClick={generateReport} disabled={loading} className="bg-blue-600 hover:bg-blue-700 flex items-center">
          <BarChart3 className="h-4 w-4 mr-2" />
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>
      
    </div>
  </CardContent>
</Card>


      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{summaryStats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Payments</p>
                    <p className="text-2xl font-bold">{summaryStats.totalPayments}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tenants</p>
                    <p className="text-2xl font-bold">{summaryStats.totalTenants}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Occupancy Rate</p>
                    <p className="text-2xl font-bold">{summaryStats.occupancyRate.toFixed(1)}%</p>
                  </div>
                  <Home className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Collection Rate</p>
                    <p className="text-2xl font-bold">{summaryStats.collectionRate.toFixed(1)}%</p>
                  </div>
                  {summaryStats.collectionRate >= 90 ? (
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Report Data</CardTitle>
            </CardHeader>
            <CardContent>
              {filters.reportType === 'revenue' || filters.reportType === 'payments' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Rent Payments</p>
                      <p className="text-xl font-bold">₹{reportData.summary?.rentRevenue?.toLocaleString() || 0}</p>
                      <p className="text-sm text-gray-500">{reportData.summary?.rentCount || 0} payments</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Deposit Payments</p>
                      <p className="text-xl font-bold">₹{reportData.summary?.depositRevenue?.toLocaleString() || 0}</p>
                      <p className="text-sm text-gray-500">{reportData.summary?.depositCount || 0} payments</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Addon Payments</p>
                      <p className="text-xl font-bold">₹{reportData.summary?.addonRevenue?.toLocaleString() || 0}</p>
                      <p className="text-sm text-gray-500">{reportData.summary?.addonCount || 0} payments</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xl font-bold">₹{reportData.summary?.totalRevenue?.toLocaleString() || 0}</p>
                      <p className="text-sm text-gray-500">{reportData.summary?.paymentCount || 0} payments</p>
                    </div>
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
                        {reportData.payments?.map((payment: any) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{payment.payment_number}</td>
                            <td className="px-4 py-3 text-sm">{payment.payment_date ? format(new Date(payment.payment_date), 'dd MMM yyyy') : ''}</td>
                            <td className="px-4 py-3 text-sm">{payment.tenant?.name || payment.tenants?.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm">{payment.booking?.property_name || payment.booking?.properties?.name || payment.bookings?.properties?.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant="outline">{payment.payment_type}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold">₹{parseFloat(payment.amount || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm">{payment.payment_method}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                {payment.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : filters.reportType === 'tenants' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Active Tenants</p>
                      <p className="text-xl font-bold">{reportData.summary?.activeTenants || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Inactive Tenants</p>
                      <p className="text-xl font-bold">{reportData.summary?.inactiveTenants || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">With Active Bookings</p>
                      <p className="text-xl font-bold">{reportData.summary?.withActiveBookings || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Gender Split</p>
                      <p className="text-xl font-bold">
                        M: {reportData.summary?.maleCount || 0} / F: {reportData.summary?.femaleCount || 0}
                      </p>
                    </div>
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
                          <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.tenants?.map((tenant: any) => (
                          <tr key={tenant.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">{tenant.name}</td>
                            <td className="px-4 py-3 text-sm">{tenant.email}</td>
                            <td className="px-4 py-3 text-sm">{tenant.phone}</td>
                            <td className="px-4 py-3 text-sm">{tenant.gender || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm">{tenant.occupation || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                                {tenant.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : filters.reportType === 'occupancy' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Rooms</p>
                      <p className="text-xl font-bold">{reportData.summary?.totalRooms || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Occupied</p>
                      <p className="text-xl font-bold">{reportData.summary?.occupiedRooms || 0}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Vacant</p>
                      <p className="text-xl font-bold">{reportData.summary?.vacantRooms || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Occupancy Rate</p>
                      <p className="text-xl font-bold">{reportData.summary?.occupancyRate || 0}%</p>
                    </div>
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.rooms?.map((room: any) => (
                          <tr key={room.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{room.properties?.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium">{room.room_number}</td>
                            <td className="px-4 py-3 text-sm">{room.room_type}</td>
                            <td className="px-4 py-3 text-sm">{room.floor || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-semibold">₹{parseFloat(room.rent_amount || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge
                                variant={
                                  room.status === 'occupied' ? 'default' :
                                    room.status === 'vacant' ? 'secondary' :
                                      'destructive'
                                }
                              >
                                {room.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
