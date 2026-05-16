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
  Laptop,
  User,
  Search,
  ChevronDown
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from 'date-fns';
import { toast } from 'sonner';
import * as reportApi from '@/lib/reportApi';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [properties, setProperties] = useState<reportApi.PropertyOption[]>([]);
  const [tenantsList, setTenantsList] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<reportApi.PropertyOption | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
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
  const [tenantPaymentReport, setTenantPaymentReport] = useState<any>(null);
  const [propertyPaymentReport, setPropertyPaymentReport] = useState<any>(null);
  const [tenantSearchOpen, setTenantSearchOpen] = useState(false);
  const [tenantSearchTerm, setTenantSearchTerm] = useState('');
  const [pgRevenueReport, setPgRevenueReport] = useState<any>(null);
const [pgRevenuePeriodType, setPgRevenuePeriodType] = useState<'month_wise' | 'year_wise'>('month_wise');
const [pgRevenueYear, setPgRevenueYear] = useState(new Date().getFullYear());
  
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
    loadTenantsList();
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

  const loadTenantsList = async () => {
    try {
      const response = await fetch(`/api/reports/tenants-list`);
      const data = await response.json();
      if (data.success) {
        setTenantsList(data.data);
      }
    } catch (err) {
      console.error('Error loading tenants list:', err);
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

  const handleTenantSelect = (tenant: any) => {
    setSelectedTenant(tenant);
    setTenantSearchOpen(false);
    setTenantSearchTerm('');
  };

  const generateTenantPaymentReport = async () => {
    if (!selectedTenant) {
      toast.error('Please select a tenant');
      return;
    }
    
    setLoading(true);
    try {
      const url = `/api/reports/tenant-payment-report?tenantId=${selectedTenant.id}&startDate=${filters.startDate}&endDate=${filters.endDate}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setTenantPaymentReport(data.data);
        setPropertyPaymentReport(null);
        setActiveTab('report');
        toast.success(`Payment report generated for ${selectedTenant.full_name}`);
        
        setTimeout(() => {
          reportSectionRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      } else {
        toast.error(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating tenant payment report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

// In the generatePropertyPaymentReport function, update:
const generatePropertyPaymentReport = async () => {
  if (!selectedProperty || filters.propertyId === 'all') {
    toast.error('Please select a property');
    return;
  }
  
  setLoading(true);
  try {
    const url = `/api/reports/property-payment-report?propertyId=${selectedProperty.id}&startDate=${filters.startDate}&endDate=${filters.endDate}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success) {
      // Store the data from data.data
      setPropertyPaymentReport(data.data);
      setTenantPaymentReport(null);
      setActiveTab('report');
      toast.success(`Payment report generated for ${selectedProperty.name}`);
      
      setTimeout(() => {
        reportSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    } else {
      toast.error(data.message || 'Failed to generate report');
    }
  } catch (error) {
    console.error('Error generating property payment report:', error);
    toast.error('Failed to generate report');
  } finally {
    setLoading(false);
  }
};

  const generateReport = async () => {
    setLoading(true);
    setReportData(null);
    setTenantPaymentReport(null);
    setPropertyPaymentReport(null);
    setPgRevenueReport(null);
    
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
        case 'tenant_payment':
          await generateTenantPaymentReport();
          setLoading(false);
          return;
        case 'property_payment':
          await generatePropertyPaymentReport();
          setLoading(false);
          return;
        case 'pg_revenue':
        await generatePGRevenueReport(); // Call the new function
        setLoading(false);
        return;
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
    if (tenantPaymentReport) {
      // Export tenant payment report
      const wb = XLSX.utils.book_new();
      
      // Tenant Info Sheet
      const tenantInfoData = [{
        'Tenant Name': tenantPaymentReport.tenant.name,
        'Email': tenantPaymentReport.tenant.email,
        'Phone': tenantPaymentReport.tenant.phone,
        'Property': tenantPaymentReport.tenant.property_name,
        'Room': tenantPaymentReport.tenant.room_number,
        'Bed': tenantPaymentReport.tenant.bed_number,
        'Monthly Rent': tenantPaymentReport.tenant.monthly_rent,
        'Check-in Date': tenantPaymentReport.tenant.check_in_date,
        'Months Completed': tenantPaymentReport.tenant.months_since_joining
      }];
      const tenantInfoWs = XLSX.utils.json_to_sheet(tenantInfoData);
      XLSX.utils.book_append_sheet(wb, tenantInfoWs, 'Tenant Info');
      
      // Summary Sheet
      const summaryData = [{
        'Metric': 'Expected Rent',
        'Value': tenantPaymentReport.summary.expected_rent
      }, {
        'Metric': 'Paid Rent',
        'Value': tenantPaymentReport.summary.paid_rent
      }, {
        'Metric': 'Pending Rent',
        'Value': tenantPaymentReport.summary.pending_rent
      }, {
        'Metric': 'Collection Rate',
        'Value': `${tenantPaymentReport.summary.collection_rate.toFixed(1)}%`
      }, {
        'Metric': 'Security Deposit Total',
        'Value': tenantPaymentReport.summary.security_deposit_total
      }, {
        'Metric': 'Security Deposit Paid',
        'Value': tenantPaymentReport.summary.security_deposit_paid
      }, {
        'Metric': 'Security Deposit Pending',
        'Value': tenantPaymentReport.summary.security_deposit_pending
      }];
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      
      // Rent Payments Sheet
      if (tenantPaymentReport.rent_payments?.length > 0) {
        const rentData = tenantPaymentReport.rent_payments.map((p: any) => ({
          'Date': new Date(p.payment_date).toLocaleDateString('en-IN'),
          'Amount': p.amount,
          'Mode': p.payment_mode,
          'Month': p.month,
          'Year': p.year,
          'Status': p.status,
          'Transaction ID': p.transaction_id || '-'
        }));
        const rentWs = XLSX.utils.json_to_sheet(rentData);
        XLSX.utils.book_append_sheet(wb, rentWs, 'Rent Payments');
      }
      
      // Month-wise Rent Sheet
      if (tenantPaymentReport.month_wise_rent?.length > 0) {
        const monthData = tenantPaymentReport.month_wise_rent.map((m: any) => ({
          'Month': `${m.month} ${m.year}`,
          'Expected Rent': m.expected,
          'Paid Rent': m.paid,
          'Pending Rent': m.pending,
          'Status': m.pending === 0 ? 'Paid' : m.paid > 0 ? 'Partial' : 'Pending'
        }));
        const monthWs = XLSX.utils.json_to_sheet(monthData);
        XLSX.utils.book_append_sheet(wb, monthWs, 'Month-wise Rent');
      }
      
      // Deposit Payments Sheet
      if (tenantPaymentReport.deposit_payments?.length > 0) {
        const depositData = tenantPaymentReport.deposit_payments.map((p: any) => ({
          'Date': new Date(p.payment_date).toLocaleDateString('en-IN'),
          'Amount': p.amount,
          'Mode': p.payment_mode,
          'Status': p.status,
          'Transaction ID': p.transaction_id || '-'
        }));
        const depositWs = XLSX.utils.json_to_sheet(depositData);
        XLSX.utils.book_append_sheet(wb, depositWs, 'Security Deposit Payments');
      }
      
      const filename = `tenant_payment_report_${tenantPaymentReport.tenant.name.replace(/\s/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success('Report exported successfully');
      
    } else if (propertyPaymentReport) {
      // Export property payment report
      const wb = XLSX.utils.book_new();
      
      // Property Info Sheet
      const propertyInfoData = [{
        'Property Name': propertyPaymentReport.summary.property.name,
        'Address': propertyPaymentReport.summary.property.address,
        'Total Rooms': propertyPaymentReport.summary.property.total_rooms,
        'Total Beds': propertyPaymentReport.summary.property.total_beds,
        'Occupied Beds': propertyPaymentReport.summary.property.occupied_beds,
        'Available Beds': propertyPaymentReport.summary.property.available_beds,
        'Occupancy Rate': `${propertyPaymentReport.summary.property.occupancy_rate.toFixed(1)}%`,
        'Total Tenants': propertyPaymentReport.summary.financial_summary.total_tenants,
        'Active Tenants': propertyPaymentReport.summary.financial_summary.active_tenants
      }];
      const propertyInfoWs = XLSX.utils.json_to_sheet(propertyInfoData);
      XLSX.utils.book_append_sheet(wb, propertyInfoWs, 'Property Info');
      
      // Financial Summary Sheet
      const financialData = [{
        'Metric': 'Total Rent to be Collected',
        'Value': propertyPaymentReport.summary.financial_summary.total_rent_to_be_collected
      }, {
        'Metric': 'Total Rent Collected',
        'Value': propertyPaymentReport.summary.financial_summary.total_rent_collected
      }, {
        'Metric': 'Total Rent Pending',
        'Value': propertyPaymentReport.summary.financial_summary.total_rent_pending
      }, {
        'Metric': 'Rent Collection Rate',
        'Value': `${propertyPaymentReport.summary.financial_summary.total_rent_collection_rate.toFixed(1)}%`
      }, {
        'Metric': 'Total Security Deposit to be Collected',
        'Value': propertyPaymentReport.summary.financial_summary.total_security_deposit_to_be_collected
      }, {
        'Metric': 'Total Security Deposit Collected',
        'Value': propertyPaymentReport.summary.financial_summary.total_security_deposit_collected
      }, {
        'Metric': 'Total Security Deposit Pending',
        'Value': propertyPaymentReport.summary.financial_summary.total_security_deposit_pending
      }];
      const financialWs = XLSX.utils.json_to_sheet(financialData);
      XLSX.utils.book_append_sheet(wb, financialWs, 'Financial Summary');
      
      // Floor Stats Sheet
      if (propertyPaymentReport.summary.floor_stats?.length > 0) {
        const floorData = propertyPaymentReport.summary.floor_stats.map((f: any) => ({
          'Floor': f.floor,
          'Total Rooms': f.total_rooms,
          'Total Beds': f.total_beds,
          'Occupied Beds': f.occupied_beds,
          'Available Beds': f.available_beds
        }));
        const floorWs = XLSX.utils.json_to_sheet(floorData);
        XLSX.utils.book_append_sheet(wb, floorWs, 'Floor-wise Stats');
      }
      
      // Tenant-wise Report Sheet
      if (propertyPaymentReport.summary.tenant_reports?.length > 0) {
        const tenantData = propertyPaymentReport.summary.tenant_reports.map((t: any) => ({
          'Tenant Name': t.tenant_name,
          'Phone': t.tenant_phone,
          'Room': t.room_number,
          'Bed': t.bed_number,
          'Monthly Rent': t.monthly_rent,
          'Months Completed': t.months_completed,
          'Expected Rent': t.expected_rent,
          'Paid Rent': t.paid_rent,
          'Pending Rent': t.pending_rent,
          'Collection Rate': `${t.rent_collection_rate.toFixed(1)}%`,
          'Security Deposit': t.security_deposit,
          'Deposit Paid': t.paid_deposit,
          'Deposit Pending': t.pending_deposit,
          'Status': t.is_active ? 'Active' : 'Inactive'
        }));
        const tenantWs = XLSX.utils.json_to_sheet(tenantData);
        XLSX.utils.book_append_sheet(wb, tenantWs, 'Tenant-wise Report');
      }
      
      const filename = `property_payment_report_${propertyPaymentReport.summary.property.name.replace(/\s/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success('Report exported successfully');
      
    } else if (reportData) {
      // Existing export logic for other reports
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
      toast.success('Report exported successfully');
    }
  };

  const handlePrint = () => {
    if (!reportData && !tenantPaymentReport && !propertyPaymentReport) {
      toast.error('No data to print');
      return;
    }
    window.print();
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

  // Filtered tenants for search
  const filteredTenants = tenantsList.filter(tenant =>
    tenant.full_name?.toLowerCase().includes(tenantSearchTerm.toLowerCase()) ||
    tenant.phone?.includes(tenantSearchTerm) ||
    tenant.email?.toLowerCase().includes(tenantSearchTerm.toLowerCase())
  );

  return (
    <div className="p-1 sm:p-4 md:p-4 space-y-3 sm:space-y-4 md:space-y-6 max-w-full overflow-x-hidden -mt-7">

      {/* Stats Cards Row */}
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
                  <SelectItem value="pg_revenue" className="text-xs">🏢 PG Revenue Report</SelectItem>
                  <SelectItem value="revenue" className="text-xs">📊 Revenue Report</SelectItem>
                  <SelectItem value="payments" className="text-xs">💰 Payments Report</SelectItem>
                  <SelectItem value="tenants" className="text-xs">👥 Tenants Report</SelectItem>
                  <SelectItem value="occupancy" className="text-xs">🏠 Occupancy Report</SelectItem>
                  <SelectItem value="tenant_payment" className="text-xs">👤 Tenant Payment Report</SelectItem>
                  <SelectItem value="property_payment" className="text-xs">🏢 Property Payment Report</SelectItem>
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

            {/* Property - Only show for property-specific reports */}
            {(filters.reportType === 'property_payment' || filters.reportType === 'occupancy') && (
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
            )}

            {/* Tenant Selection - Only for tenant payment report */}
            {filters.reportType === 'tenant_payment' && (
              <div className="space-y-1 sm:space-y-2 relative">
                <Label className="text-xs">Select Tenant</Label>
                <div className="relative">
                  <button
                    onClick={() => setTenantSearchOpen(!tenantSearchOpen)}
                    className="w-full h-8 sm:h-9 px-3 text-xs border rounded-md bg-white flex items-center justify-between hover:border-blue-400 transition-colors"
                  >
                    <span className={selectedTenant ? 'text-gray-900' : 'text-gray-400'}>
                      {selectedTenant ? selectedTenant.full_name : 'Search and select tenant...'}
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </button>
                  
                  {tenantSearchOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                      <div className="sticky top-0 bg-white p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search by name, phone or email..."
                            value={tenantSearchTerm}
                            onChange={(e) => setTenantSearchTerm(e.target.value)}
                            className="w-full pl-7 pr-2 py-1 text-xs border rounded-md focus:outline-none focus:border-blue-400"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="divide-y">
                        {filteredTenants.length === 0 ? (
                          <div className="p-3 text-center text-xs text-gray-500">No tenants found</div>
                        ) : (
                          filteredTenants.map(tenant => (
                            <div
                              key={tenant.id}
                              className="p-2 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handleTenantSelect(tenant)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium">{tenant.full_name}</p>
                                  <p className="text-[10px] text-gray-500">{tenant.phone}</p>
                                </div>
                                <Badge variant="outline" className="text-[9px]">
                                  {tenant.property_name || 'No Property'}
                                </Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selectedTenant && (
                  <div className="mt-1 text-[10px] text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Tenant selected: {selectedTenant.full_name} ({selectedTenant.property_name || 'No property'})
                  </div>
                )}
              </div>
            )}

            {/* Generate Button */}
            <div className="flex items-end">
              <Button 
                onClick={generateReport} 
                disabled={loading || (filters.reportType === 'tenant_payment' && !selectedTenant) || (filters.reportType === 'property_payment' && filters.propertyId === 'all')} 
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
            {(filters.reportType === 'property_payment' || filters.reportType === 'occupancy') && filters.propertyId !== 'all' && (
              <Badge variant="outline" className="px-2 py-0.5 text-[10px] sm:text-xs">
                <Building2 className="h-2.5 w-2.5 mr-1" />
                {getPropertyDisplay()}
              </Badge>
            )}
            {filters.reportType === 'tenant_payment' && selectedTenant && (
              <Badge variant="outline" className="px-2 py-0.5 text-[10px] sm:text-xs">
                <User className="h-2.5 w-2.5 mr-1" />
                {selectedTenant.full_name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex h-9">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Quick Actions</TabsTrigger>
          <TabsTrigger value="report" disabled={!reportData && !tenantPaymentReport && !propertyPaymentReport} className="text-xs sm:text-sm">
            Generated Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-3 sm:mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-base">Generate Reports Quickly</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
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
                <QuickActionButton
                  icon={<User className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Tenant Payment"
                  onClick={() => {
                    setFilters({ ...filters, reportType: 'tenant_payment' });
                    generateReport();
                  }}
                  color="green"
                />
                <QuickActionButton
                  icon={<Building2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Property Payment"
                  onClick={() => {
                    setFilters({ ...filters, reportType: 'property_payment' });
                    generateReport();
                  }}
                  color="cyan"
                />
                {/* ADD THIS NEW BUTTON */}
  <QuickActionButton
    icon={<Building2 className="h-4 w-4 sm:h-5 sm:w-5" />}
    label="PG Revenue"
    onClick={() => {
      setFilters({ ...filters, reportType: 'pg_revenue' });
      generateReport();
    }}
    color="cyan"
  />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="mt-3 sm:mt-4" ref={reportSectionRef}>
          {/* Tenant Payment Report */}
          {tenantPaymentReport && (
            <div className="space-y-4">
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

              {/* Tenant Information Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 px-3 sm:px-6 bg-gradient-to-r from-blue-50 to-white">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Tenant Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Tenant Name</p>
                      <p className="text-sm font-semibold">{tenantPaymentReport.tenant.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Phone / Email</p>
                      <p className="text-xs">{tenantPaymentReport.tenant.phone} / {tenantPaymentReport.tenant.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Property & Room</p>
                      <p className="text-xs">{tenantPaymentReport.tenant.property_name} - Room {tenantPaymentReport.tenant.room_number}, Bed {tenantPaymentReport.tenant.bed_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Monthly Rent</p>
                      <p className="text-sm font-semibold text-green-600">{formatCurrency(tenantPaymentReport.tenant.monthly_rent)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Check-in Date</p>
                      <p className="text-xs">{tenantPaymentReport.tenant.check_in_date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Months Completed</p>
                      <p className="text-sm font-semibold">{tenantPaymentReport.tenant.months_since_joining} months</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Security Deposit</p>
                      <p className="text-xs">Total: {formatCurrency(tenantPaymentReport.tenant.security_deposit)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Gender / Occupation</p>
                      <p className="text-xs">{tenantPaymentReport.tenant.gender} / {tenantPaymentReport.tenant.occupation || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rent Summary Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 px-3 sm:px-6 bg-gradient-to-r from-green-50 to-white">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    Rent Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">Expected Rent</p>
                      <p className="text-lg font-bold text-blue-700">{formatCurrency(tenantPaymentReport.summary.expected_rent)}</p>
                      <p className="text-[10px] text-gray-500">{tenantPaymentReport.tenant.months_since_joining} months × {formatCurrency(tenantPaymentReport.tenant.monthly_rent)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">Paid Rent</p>
                      <p className="text-lg font-bold text-green-700">{formatCurrency(tenantPaymentReport.summary.paid_rent)}</p>
                      <p className="text-[10px] text-gray-500">{tenantPaymentReport.rent_payments?.length || 0} payments</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">Pending Rent</p>
                      <p className="text-lg font-bold text-yellow-700">{formatCurrency(tenantPaymentReport.summary.pending_rent)}</p>
                      <p className="text-[10px] text-gray-500">{tenantPaymentReport.summary.collection_rate.toFixed(1)}% collected</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">Collection Rate</p>
                      <p className="text-2xl font-bold text-indigo-700">{tenantPaymentReport.summary.collection_rate.toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Month-wise Rent Table */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Month-wise Rent Details</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">Month</th>
                            <th className="px-3 py-2 text-right">Expected Rent</th>
                            <th className="px-3 py-2 text-right">Paid Rent</th>
                            <th className="px-3 py-2 text-right">Pending Rent</th>
                            <th className="px-3 py-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {tenantPaymentReport.month_wise_rent?.map((month: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium">{month.month} {month.year}</td>
                              <td className="px-3 py-2 text-right">{formatCurrency(month.expected)}</td>
                              <td className="px-3 py-2 text-right text-green-600">{formatCurrency(month.paid)}</td>
                              <td className="px-3 py-2 text-right text-yellow-600">{formatCurrency(month.pending)}</td>
                              <td className="px-3 py-2 text-center">
                                <Badge className={month.pending === 0 ? 'bg-green-100 text-green-700' : month.paid > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                                  {month.pending === 0 ? 'Paid' : month.paid > 0 ? 'Partial' : 'Pending'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Deposit Summary */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 px-3 sm:px-6 bg-gradient-to-r from-purple-50 to-white">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-purple-600" />
                    Security Deposit Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">Total Deposit</p>
                      <p className="text-lg font-bold text-purple-700">{formatCurrency(tenantPaymentReport.summary.security_deposit_total)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">Deposit Paid</p>
                      <p className="text-lg font-bold text-green-700">{formatCurrency(tenantPaymentReport.summary.security_deposit_paid)}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">Deposit Pending</p>
                      <p className="text-lg font-bold text-yellow-700">{formatCurrency(tenantPaymentReport.summary.security_deposit_pending)}</p>
                    </div>
                  </div>
                  
                  {/* Deposit Payments Table */}
                  {tenantPaymentReport.deposit_payments?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Deposit Payment History</p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left">Date</th>
                              <th className="px-3 py-2 text-right">Amount</th>
                              <th className="px-3 py-2 text-left">Mode</th>
                              <th className="px-3 py-2 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {tenantPaymentReport.deposit_payments.map((payment: any) => (
                              <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2">{new Date(payment.payment_date).toLocaleDateString('en-IN')}</td>
                                <td className="px-3 py-2 text-right font-semibold">{formatCurrency(payment.amount)}</td>
                                <td className="px-3 py-2 capitalize">{payment.payment_mode}</td>
                                <td className="px-3 py-2">
                                  <Badge className={payment.status === 'approved' || payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                    {payment.status === 'approved' || payment.status === 'paid' ? 'Paid' : payment.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

{/* Property Payment Report */}
{propertyPaymentReport && (
  <div className="space-y-4">
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

    {/* Property Information Card */}
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 px-3 sm:px-6 bg-gradient-to-r from-blue-50 to-white">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-600" />
          Property Information
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <p className="text-[10px] text-gray-500">Property Name</p>
            <p className="text-sm font-semibold">{propertyPaymentReport.property?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500">Address</p>
            <p className="text-xs">{propertyPaymentReport.property?.address || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500">Total Rooms / Beds</p>
            <p className="text-sm">{propertyPaymentReport.property?.total_rooms || 0} rooms / {propertyPaymentReport.property?.total_beds || 0} beds</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500">Occupancy Rate</p>
            <p className="text-sm font-semibold text-green-600">{propertyPaymentReport.property?.occupancy_rate?.toFixed(1) || 0}%</p>
          </div>
        </div>

        {/* Floor-wise Statistics */}
        {propertyPaymentReport.floor_stats?.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Floor-wise Statistics</p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Floor</th>
                    <th className="px-3 py-2 text-center">Rooms</th>
                    <th className="px-3 py-2 text-center">Total Beds</th>
                    <th className="px-3 py-2 text-center">Occupied Beds</th>
                    <th className="px-3 py-2 text-center">Available Beds</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {propertyPaymentReport.floor_stats.map((floor: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">Floor {floor.floor}</td>
                      <td className="px-3 py-2 text-center">{floor.total_rooms}</td>
                      <td className="px-3 py-2 text-center">{floor.total_beds}</td>
                      <td className="px-3 py-2 text-center text-green-600">{floor.occupied_beds}</td>
                      <td className="px-3 py-2 text-center text-yellow-600">{floor.available_beds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Financial Summary Card */}
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 px-3 sm:px-6 bg-gradient-to-r from-green-50 to-white">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-green-600" />
          Financial Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-600">Total Rent to Collect</p>
            <p className="text-lg font-bold text-blue-700">{formatCurrency(propertyPaymentReport.financial_summary?.total_rent_to_be_collected || 0)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-600">Rent Collected</p>
            <p className="text-lg font-bold text-green-700">{formatCurrency(propertyPaymentReport.financial_summary?.total_rent_collected || 0)}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-600">Rent Pending</p>
            <p className="text-lg font-bold text-yellow-700">{formatCurrency(propertyPaymentReport.financial_summary?.total_rent_pending || 0)}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-600">Collection Rate</p>
            <p className="text-2xl font-bold text-indigo-700">{propertyPaymentReport.financial_summary?.total_rent_collection_rate?.toFixed(1) || 0}%</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-600">Security Deposit to Collect</p>
            <p className="text-lg font-bold text-purple-700">{formatCurrency(propertyPaymentReport.financial_summary?.total_security_deposit_to_be_collected || 0)}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-600">Deposit Collected</p>
            <p className="text-lg font-bold text-emerald-700">{formatCurrency(propertyPaymentReport.financial_summary?.total_security_deposit_collected || 0)}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-600">Deposit Pending</p>
            <p className="text-lg font-bold text-amber-700">{formatCurrency(propertyPaymentReport.financial_summary?.total_security_deposit_pending || 0)}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Tenant-wise Payment Report Table */}
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 px-3 sm:px-6 bg-gradient-to-r from-orange-50 to-white">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <Users className="h-4 w-4 text-orange-600" />
          Tenant-wise Payment Report
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Tenant Name</th>
                <th className="px-3 py-2 text-center">Room/Bed</th>
                <th className="px-3 py-2 text-center">Monthly Rent</th>
                <th className="px-3 py-2 text-center">Months</th>
                <th className="px-3 py-2 text-right">Expected Rent</th>
                <th className="px-3 py-2 text-right">Paid Rent</th>
                <th className="px-3 py-2 text-right">Pending Rent</th>
                <th className="px-3 py-2 text-center">Collection %</th>
                <th className="px-3 py-2 text-right">Deposit</th>
                <th className="px-3 py-2 text-right">Deposit Paid</th>
                <th className="px-3 py-2 text-right">Deposit Pending</th>
                <th className="px-3 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {propertyPaymentReport.tenant_reports?.map((tenant: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{tenant.tenant_name}</td>
                  <td className="px-3 py-2 text-center">R{tenant.room_number}/B{tenant.bed_number}</td>
                  <td className="px-3 py-2 text-center">{formatCurrency(tenant.monthly_rent)}</td>
                  <td className="px-3 py-2 text-center">{tenant.months_completed}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(tenant.expected_rent)}</td>
                  <td className="px-3 py-2 text-right text-green-600">{formatCurrency(tenant.paid_rent)}</td>
                  <td className="px-3 py-2 text-right text-yellow-600">{formatCurrency(tenant.pending_rent)}</td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center gap-1">
                      <Progress value={tenant.rent_collection_rate} className="h-1.5 w-12" />
                      <span className="text-[10px]">{tenant.rent_collection_rate?.toFixed(0) || 0}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">{formatCurrency(tenant.security_deposit)}</td>
                  <td className="px-3 py-2 text-right text-green-600">{formatCurrency(tenant.paid_deposit)}</td>
                  <td className="px-3 py-2 text-right text-yellow-600">{formatCurrency(tenant.pending_deposit)}</td>
                  <td className="px-3 py-2 text-center">
                    <Badge className={tenant.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {tenant.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-right text-xs text-gray-500">
          Total Tenants: {propertyPaymentReport.financial_summary?.total_tenants || 0} | 
          Active: {propertyPaymentReport.financial_summary?.active_tenants || 0}
        </div>
      </CardContent>
    </Card>
  </div>
)}

          {/* Existing Report Data Display */}
          {reportData && !tenantPaymentReport && !propertyPaymentReport && (
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

// Helper Components (keep all existing helper components - StatCard, ExtendedStatCard, QuickActionButton, SummaryStatCard, and all Report Detail components)
// ... (include all the existing helper components from your original file)

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