"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  ChevronDown,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
} from "date-fns";
import { toast } from "sonner";
import * as reportApi from "@/lib/reportApi";
import * as XLSX from "xlsx";

  // Add pagination component
const ReportPagination = ({ total, page, pageSize, onPageChange, onPageSizeChange }: any) => {
  const totalPages = Math.ceil(total / pageSize);
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total}</span>
        <select 
          value={pageSize} 
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border rounded px-1 py-0.5 text-xs"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-7 px-2 text-xs"
        >
          Previous
        </Button>
        <span className="text-xs text-gray-600 px-2">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="h-7 px-2 text-xs"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [properties, setProperties] = useState<reportApi.PropertyOption[]>([]);
  const [tenantsList, setTenantsList] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] =
    useState<reportApi.PropertyOption | null>(null);
    const [reportPage, setReportPage] = useState(1);
const [reportPageSize, setReportPageSize] = useState(20);
const [reportTotalItems, setReportTotalItems] = useState(0);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [revenuePage, setRevenuePage] = useState(1);
const [revenuePageSize, setRevenuePageSize] = useState(20);

  const [dashboardStats, setDashboardStats] =
    useState<reportApi.DashboardStats>({
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
      maintenanceRequests: 0,
    });

  const [propertyDetails, setPropertyDetails] = useState<any[]>([]);
  const [roomDetails, setRoomDetails] = useState<any[]>([]);
  const [tenantDetails, setTenantDetails] = useState<any[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<any[]>([]);
  const [tenantPaymentReport, setTenantPaymentReport] = useState<any>(null);
  const [propertyPaymentReport, setPropertyPaymentReport] = useState<any>(null);
  const [tenantSearchOpen, setTenantSearchOpen] = useState(false);
  const [tenantSearchTerm, setTenantSearchTerm] = useState("");
  const [pgRevenueReport, setPgRevenueReport] = useState<any>(null);
  const [pgRevenuePeriodType, setPgRevenuePeriodType] = useState<
    "month_wise" | "year_wise"
  >("month_wise");
  const [pgRevenueYear, setPgRevenueYear] = useState(new Date().getFullYear());

  const [filters, setFilters] = useState<reportApi.ReportFilters>({
    reportType: "revenue",
    startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    propertyId: "all",
  });

  const reportSectionRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "year" | "custom"
  >("month");
  const [reportData, setReportData] = useState<reportApi.ReportData | null>(
    null,
  );
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    totalTenants: 0,
    occupancyRate: 0,
    collectionRate: 0,
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [occupancyReport, setOccupancyReport] = useState<any>(null);
  const [occupancyReportScope, setOccupancyReportScope] = useState<
    "all" | "property"
  >("all");
  const [occupancyReportType, setOccupancyReportType] = useState<
    "overall" | "non_vacant" | "vacant"
  >("overall");
  const [occupancyPeriodType, setOccupancyPeriodType] = useState<
    "month" | "year"
  >("month");
  const [occupancyYear, setOccupancyYear] = useState(new Date().getFullYear());

  // Load properties on mount
  useEffect(() => {
    loadProperties();
    loadTenantsList();
  }, []);

  // Load dashboard stats when filters change
useEffect(() => {
  if (dateRange !== "custom") {
    updateDateRangeAutomatically();
  }
  loadDashboardStats(); // Call this directly instead of the old one
  loadPropertyDetails();
  loadRoomDetails();
  loadTenantDetails();
  loadPaymentDetails();
}, [dateRange, filters.propertyId]);

  const loadProperties = async () => {
    try {
      const props = await reportApi.fetchProperties();
      setProperties(props);

      if (filters.propertyId && filters.propertyId !== "all") {
        const selected = props.find((p) => p.id === filters.propertyId);
        setSelectedProperty(selected || null);
      }
    } catch (err) {
      console.error("Error loading properties:", err);
      toast.error("Failed to load properties");
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
      console.error("Error loading tenants list:", err);
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
      console.error("Error loading property details:", error);
    }
  };

  const loadRoomDetails = async () => {
    try {
      const response = await fetch(`/api/rooms`);
      const data = await response.json();
      const rooms = Array.isArray(data) ? data : data.data || [];
      setRoomDetails(rooms);
    } catch (error) {
      console.error("Error loading room details:", error);
    }
  };

  const loadTenantDetails = async () => {
    try {
      const response = await fetch(`/api/tenants?pageSize=1000`);
      const data = await response.json();
      const tenants = data.data || [];
      setTenantDetails(tenants);
    } catch (error) {
      console.error("Error loading tenant details:", error);
    }
  };

  const loadPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/payments`);
      const data = await response.json();
      const payments = data.data || [];
      setPaymentDetails(payments);
    } catch (error) {
      console.error("Error loading payment details:", error);
    }
  };

const loadDashboardStats = async () => {
  try {
    setDashboardLoading(true);
    
    // Fetch all necessary data directly for accurate stats
    const [propertiesRes, roomsRes, tenantsRes, paymentsRes] = await Promise.all([
      fetch('/api/properties?pageSize=1000'),
      fetch('/api/rooms'),
      fetch('/api/tenants?pageSize=1000'),
      fetch('/api/payments')
    ]);
    
    const propertiesData = await propertiesRes.json();
    const roomsData = await roomsRes.json();
    const tenantsData = await tenantsRes.json();
    const paymentsData = await paymentsRes.json();
    
    // Get properties array
    const properties = propertiesData.success ? (propertiesData.data?.data || propertiesData.data || []) : [];
    
    // Get rooms array
    const rooms = Array.isArray(roomsData) ? roomsData : (roomsData.data || []);
    
    // Get tenants array
    const tenants = tenantsData.data || [];
    
    // Get payments array
    const payments = paymentsData.data || [];
    
    // Calculate Total Beds correctly
    let totalBeds = 0;
    let occupiedBeds = 0;
    let totalRooms = rooms.length;
    let activeRooms = rooms.filter(r => r.is_active === true).length;
    
    for (const room of rooms) {
      const roomTotalBeds = Number(room.total_bed) || 0;
      const roomOccupiedBeds = Number(room.occupied_beds) || 0;
      totalBeds += roomTotalBeds;
      occupiedBeds += roomOccupiedBeds;
    }
    
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
    
    // Calculate Total Properties
    const totalProperties = properties.length;
    const activeProperties = properties.filter(p => p.is_active === true).length;
    
    // Calculate Active Tenants (is_active = 1)
    const activeTenants = tenants.filter(t => t.is_active === 1 || t.is_active === true).length;
    
    // Calculate Monthly Revenue (current month, approved/paid payments only)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    let monthlyRevenue = 0;
    let totalCollected = 0;
    let pendingAmount = 0;
    
    for (const payment of payments) {
      const amount = Number(payment.amount) || 0;
      const isSuccessful = payment.status === 'approved' || payment.status === 'paid';
      const isPending = payment.status === 'pending';
      
      if (isSuccessful) {
        totalCollected += amount;
        
        // Check if payment is from current month
        const paymentDate = new Date(payment.payment_date);
        if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
          monthlyRevenue += amount;
        }
      }
      
      if (isPending) {
        pendingAmount += amount;
      }
    }
    
    // Calculate Collection Rate
    const totalPayments = payments.filter(p => p.status === 'approved' || p.status === 'paid').length;
    const totalTransactions = payments.length;
    const collectionRate = totalTransactions > 0 ? (totalPayments / totalTransactions) * 100 : 0;
    
    // Count pending payments
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    
    // Upcoming checkouts (next 7 days) - from vacate records or check-out dates
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingCheckouts = 0; // You can calculate from bookings or vacate requests
    
    // Maintenance requests (from tenant_requests table)
    let maintenanceRequests = 0;
    try {
      const requestsRes = await fetch('/api/admin/maintenance');
      const requestsData = await requestsRes.json();
      if (requestsData.success && requestsData.data) {
        maintenanceRequests = requestsData.data.filter((r: any) => r.status === 'pending').length;
      }
    } catch (err) {
      console.error('Error fetching maintenance requests:', err);
    }
    
    setDashboardStats({
      totalProperties,
      totalRooms,
      totalBeds,
      occupiedBeds,
      activeTenants,
      monthlyRevenue,
      revenueGrowth: 0,
      occupationGrowth: occupancyRate > 0 ? (occupancyRate - 70) : 0,
      occupancyRate: Math.round(occupancyRate),
      collectionRate: Math.round(collectionRate),
      pendingPayments,
      pendingAmount,
      upcomingCheckouts,
      maintenanceRequests
    });
    
  } catch (err) {
    console.error('Error loading dashboard stats:', err);
  } finally {
    setDashboardLoading(false);
  }
};

  const updateDateRangeAutomatically = () => {
    const today = new Date();
    let start = "";
    let end = "";

    switch (dateRange) {
      case "today":
        start = end = format(today, "yyyy-MM-dd");
        break;
      case "week":
        start = format(subDays(today, 7), "yyyy-MM-dd");
        end = format(today, "yyyy-MM-dd");
        break;
      case "month":
        start = format(startOfMonth(today), "yyyy-MM-dd");
        end = format(endOfMonth(today), "yyyy-MM-dd");
        break;
      case "year":
        start = format(startOfYear(today), "yyyy-MM-dd");
        end = format(endOfYear(today), "yyyy-MM-dd");
        break;
      default:
        return;
    }

    setFilters((prev) => ({ ...prev, startDate: start, endDate: end }));
  };

  const handlePropertyChange = (value: string) => {
    setFilters((prev) => ({ ...prev, propertyId: value }));
    const selected = properties.find((p) => p.id === value);
    setSelectedProperty(selected || null);
  };

  const handleTenantSelect = (tenant: any) => {
    setSelectedTenant(tenant);
    setTenantSearchOpen(false);
    setTenantSearchTerm("");
  };

  const generateTenantPaymentReport = async () => {
    if (!selectedTenant) {
      toast.error("Please select a tenant");
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
        setActiveTab("report");

        setTimeout(() => {
          reportSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      } else {
        toast.error(data.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating tenant payment report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  // In the generatePropertyPaymentReport function, update:
  const generatePropertyPaymentReport = async () => {
    if (!selectedProperty || filters.propertyId === "all") {
      toast.error("Please select a property");
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
        setActiveTab("report");

        setTimeout(() => {
          reportSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      } else {
        toast.error(data.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating property payment report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  // Add this function after generateReport or generatePropertyPaymentReport
  const generatePGRevenueReport = async () => {
    setLoading(true);
    setPgRevenueReport(null);
    setTenantPaymentReport(null);
    setPropertyPaymentReport(null);
    setReportData(null);

    try {
      // Determine if we need property-wise or all properties
      let reportType = "all_property";
      if (
        filters.reportType === "pg_revenue_property" ||
        (filters.propertyId && filters.propertyId !== "all")
      ) {
        reportType = "property_wise";
      }

      let url = `/api/reports/pg-revenue-report?reportType=${reportType}&periodType=${pgRevenuePeriodType}&year=${pgRevenueYear}`;

      if (
        reportType === "property_wise" &&
        filters.propertyId &&
        filters.propertyId !== "all"
      ) {
        url = `/api/reports/pg-revenue-report?reportType=property_wise&periodType=${pgRevenuePeriodType}&propertyId=${filters.propertyId}&year=${pgRevenueYear}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPgRevenueReport(data.data);
        setActiveTab("report");

        setTimeout(() => {
          reportSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      } else {
        toast.error(data.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating PG revenue report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

const generateOccupancyReport = async () => {
  setLoading(true);
  // Clear all other report states
  setOccupancyReport(null);
  setTenantPaymentReport(null);
  setPropertyPaymentReport(null);
  setReportData(null);
  setPgRevenueReport(null);

  try {
    let url = `/api/reports/occupancy-report?reportScope=${occupancyReportScope}&reportType=${occupancyReportType}&periodType=${occupancyPeriodType}&year=${occupancyYear}`;

    if (
      occupancyReportScope === "property" &&
      filters.propertyId &&
      filters.propertyId !== "all"
    ) {
      url += `&propertyId=${filters.propertyId}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      setOccupancyReport(data.data);
      setActiveTab("report");

      setTimeout(() => {
        reportSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } else {
      toast.error(data.message || "Failed to generate report");
    }
  } catch (error) {
    console.error("Error generating occupancy report:", error);
    toast.error("Failed to generate report");
  } finally {
    setLoading(false);
  }
};

const generateReport = async () => {
  setLoading(true);
  // Clear ALL report states FIRST
  setReportData(null);
  setTenantPaymentReport(null);
  setPropertyPaymentReport(null);
  setPgRevenueReport(null);
  setOccupancyReport(null); // Add this line to clear occupancy report

  try {
    let response;
    switch (filters.reportType) {
      case "revenue":
        response = await reportApi.generateRevenueReport(filters);
        setSummaryStats({
          totalRevenue: response.summary.totalRevenue,
          totalPayments: response.summary.paymentCount,
          totalTenants: 0,
          occupancyRate: 0,
          collectionRate: 100,
        });
        setReportData(response);
        break;
      case "payments":
        response = await reportApi.generatePaymentsReport(filters);
        const completed = (response.summary as reportApi.PaymentSummary)
          .completedPayments;
        const total = response.payments?.length || 1;
        setSummaryStats({
          totalRevenue: response.summary.totalAmount,
          totalPayments: response.payments?.length || 0,
          totalTenants: 0,
          occupancyRate: 0,
          collectionRate: (completed / total) * 100,
        });
        setReportData(response);
        break;
      case "tenants":
        response = await reportApi.generateTenantsReport(filters);
        const summary = response.summary as reportApi.TenantSummary;
        setSummaryStats({
          totalRevenue: 0,
          totalPayments: 0,
          totalTenants: summary.totalTenants,
          occupancyRate: summary.totalTenants
            ? (summary.withActiveBookings / summary.totalTenants) * 100
            : 0,
          collectionRate: 0,
        });
        setReportData(response);
        break;
      case "occupancy":
        await generateOccupancyReport();
        setLoading(false);
        return;
      case "tenant_payment":
        await generateTenantPaymentReport();
        setLoading(false);
        return;
      case "property_payment":
        await generatePropertyPaymentReport();
        setLoading(false);
        return;
      case "pg_revenue":
        await generatePGRevenueReport();
        setLoading(false);
        return;
      default:
        // Handle any other report types
        break;
    }

    setActiveTab("report");

    setTimeout(() => {
      reportSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  } catch (error) {
    console.error("Error generating report:", error);
    toast.error("Failed to generate report");
  } finally {
    setLoading(false);
  }
};

  const exportToExcel = async () => {
    if (tenantPaymentReport) {
      // Export tenant payment report
      const wb = XLSX.utils.book_new();

      // Tenant Info Sheet
      const tenantInfoData = [
        {
          "Tenant Name": tenantPaymentReport.tenant.name,
          Email: tenantPaymentReport.tenant.email,
          Phone: tenantPaymentReport.tenant.phone,
          Property: tenantPaymentReport.tenant.property_name,
          Room: tenantPaymentReport.tenant.room_number,
          Bed: tenantPaymentReport.tenant.bed_number,
          "Monthly Rent": tenantPaymentReport.tenant.monthly_rent,
          "Check-in Date": tenantPaymentReport.tenant.check_in_date,
          "Months Completed": tenantPaymentReport.tenant.months_since_joining,
        },
      ];
      const tenantInfoWs = XLSX.utils.json_to_sheet(tenantInfoData);
      XLSX.utils.book_append_sheet(wb, tenantInfoWs, "Tenant Info");

      // Summary Sheet
      const summaryData = [
        {
          Metric: "Expected Rent",
          Value: tenantPaymentReport.summary.expected_rent,
        },
        {
          Metric: "Paid Rent",
          Value: tenantPaymentReport.summary.paid_rent,
        },
        {
          Metric: "Pending Rent",
          Value: tenantPaymentReport.summary.pending_rent,
        },
        {
          Metric: "Collection Rate",
          Value: `${tenantPaymentReport.summary.collection_rate.toFixed(1)}%`,
        },
        {
          Metric: "Security Deposit Total",
          Value: tenantPaymentReport.summary.security_deposit_total,
        },
        {
          Metric: "Security Deposit Paid",
          Value: tenantPaymentReport.summary.security_deposit_paid,
        },
        {
          Metric: "Security Deposit Pending",
          Value: tenantPaymentReport.summary.security_deposit_pending,
        },
      ];
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      // Rent Payments Sheet
      if (tenantPaymentReport.rent_payments?.length > 0) {
        const rentData = tenantPaymentReport.rent_payments.map((p: any) => ({
          Date: new Date(p.payment_date).toLocaleDateString("en-IN"),
          Amount: p.amount,
          Mode: p.payment_mode,
          Month: p.month,
          Year: p.year,
          Status: p.status,
          "Transaction ID": p.transaction_id || "-",
        }));
        const rentWs = XLSX.utils.json_to_sheet(rentData);
        XLSX.utils.book_append_sheet(wb, rentWs, "Rent Payments");
      }

      // Month-wise Rent Sheet
      if (tenantPaymentReport.month_wise_rent?.length > 0) {
        const monthData = tenantPaymentReport.month_wise_rent.map((m: any) => ({
          Month: `${m.month} ${m.year}`,
          "Expected Rent": m.expected,
          "Paid Rent": m.paid,
          "Pending Rent": m.pending,
          Status: m.pending === 0 ? "Paid" : m.paid > 0 ? "Partial" : "Pending",
        }));
        const monthWs = XLSX.utils.json_to_sheet(monthData);
        XLSX.utils.book_append_sheet(wb, monthWs, "Month-wise Rent");
      }

      // Deposit Payments Sheet
      if (tenantPaymentReport.deposit_payments?.length > 0) {
        const depositData = tenantPaymentReport.deposit_payments.map(
          (p: any) => ({
            Date: new Date(p.payment_date).toLocaleDateString("en-IN"),
            Amount: p.amount,
            Mode: p.payment_mode,
            Status: p.status,
            "Transaction ID": p.transaction_id || "-",
          }),
        );
        const depositWs = XLSX.utils.json_to_sheet(depositData);
        XLSX.utils.book_append_sheet(
          wb,
          depositWs,
          "Security Deposit Payments",
        );
      }

      const filename = `tenant_payment_report_${tenantPaymentReport.tenant.name.replace(/\s/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      XLSX.writeFile(wb, filename);
    } else if (propertyPaymentReport) {
      // Export property payment report
      const wb = XLSX.utils.book_new();

      // Property Info Sheet
      const propertyInfoData = [
        {
          "Property Name": propertyPaymentReport.summary.property.name,
          Address: propertyPaymentReport.summary.property.address,
          "Total Rooms": propertyPaymentReport.summary.property.total_rooms,
          "Total Beds": propertyPaymentReport.summary.property.total_beds,
          "Occupied Beds": propertyPaymentReport.summary.property.occupied_beds,
          "Available Beds":
            propertyPaymentReport.summary.property.available_beds,
          "Occupancy Rate": `${propertyPaymentReport.summary.property.occupancy_rate.toFixed(1)}%`,
          "Total Tenants":
            propertyPaymentReport.summary.financial_summary.total_tenants,
          "Active Tenants":
            propertyPaymentReport.summary.financial_summary.active_tenants,
        },
      ];
      const propertyInfoWs = XLSX.utils.json_to_sheet(propertyInfoData);
      XLSX.utils.book_append_sheet(wb, propertyInfoWs, "Property Info");

      // Financial Summary Sheet
      const financialData = [
        {
          Metric: "Total Rent to be Collected",
          Value:
            propertyPaymentReport.summary.financial_summary
              .total_rent_to_be_collected,
        },
        {
          Metric: "Total Rent Collected",
          Value:
            propertyPaymentReport.summary.financial_summary
              .total_rent_collected,
        },
        {
          Metric: "Total Rent Pending",
          Value:
            propertyPaymentReport.summary.financial_summary.total_rent_pending,
        },
        {
          Metric: "Rent Collection Rate",
          Value: `${propertyPaymentReport.summary.financial_summary.total_rent_collection_rate.toFixed(1)}%`,
        },
        {
          Metric: "Total Security Deposit to be Collected",
          Value:
            propertyPaymentReport.summary.financial_summary
              .total_security_deposit_to_be_collected,
        },
        {
          Metric: "Total Security Deposit Collected",
          Value:
            propertyPaymentReport.summary.financial_summary
              .total_security_deposit_collected,
        },
        {
          Metric: "Total Security Deposit Pending",
          Value:
            propertyPaymentReport.summary.financial_summary
              .total_security_deposit_pending,
        },
      ];
      const financialWs = XLSX.utils.json_to_sheet(financialData);
      XLSX.utils.book_append_sheet(wb, financialWs, "Financial Summary");

      // Floor Stats Sheet
      if (propertyPaymentReport.summary.floor_stats?.length > 0) {
        const floorData = propertyPaymentReport.summary.floor_stats.map(
          (f: any) => ({
            Floor: f.floor,
            "Total Rooms": f.total_rooms,
            "Total Beds": f.total_beds,
            "Occupied Beds": f.occupied_beds,
            "Available Beds": f.available_beds,
          }),
        );
        const floorWs = XLSX.utils.json_to_sheet(floorData);
        XLSX.utils.book_append_sheet(wb, floorWs, "Floor-wise Stats");
      }

      // Tenant-wise Report Sheet
      if (propertyPaymentReport.summary.tenant_reports?.length > 0) {
        const tenantData = propertyPaymentReport.summary.tenant_reports.map(
          (t: any) => ({
            "Tenant Name": t.tenant_name,
            Phone: t.tenant_phone,
            Room: t.room_number,
            Bed: t.bed_number,
            "Monthly Rent": t.monthly_rent,
            "Months Completed": t.months_completed,
            "Expected Rent": t.expected_rent,
            "Paid Rent": t.paid_rent,
            "Pending Rent": t.pending_rent,
            "Collection Rate": `${t.rent_collection_rate.toFixed(1)}%`,
            "Security Deposit": t.security_deposit,
            "Deposit Paid": t.paid_deposit,
            "Deposit Pending": t.pending_deposit,
            Status: t.is_active ? "Active" : "Inactive",
          }),
        );
        const tenantWs = XLSX.utils.json_to_sheet(tenantData);
        XLSX.utils.book_append_sheet(wb, tenantWs, "Tenant-wise Report");
      }

      const filename = `property_payment_report_${propertyPaymentReport.summary.property.name.replace(/\s/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      XLSX.writeFile(wb, filename);
    } else if (pgRevenueReport) {
      const wb = XLSX.utils.book_new();

      // Overall Summary Sheet
      const overallData = [
        {
          Metric: "Total Revenue",
          Value: pgRevenueReport.overall_summary.total_revenue,
        },
        {
          Metric: "Total Expenses",
          Value: pgRevenueReport.overall_summary.total_expenses,
        },
        {
          Metric: "Net Profit/Loss",
          Value: pgRevenueReport.overall_summary.is_profit
            ? pgRevenueReport.overall_summary.net_profit
            : -pgRevenueReport.overall_summary.net_loss,
        },
        {
          Metric: "Total Properties",
          Value: pgRevenueReport.overall_summary.properties_count,
        },
        {
          Metric: "Total Periods",
          Value: pgRevenueReport.overall_summary.total_periods,
        },
        {
          Metric: "Average Revenue",
          Value: pgRevenueReport.overall_summary.avg_revenue,
        },
        {
          Metric: "Average Expenses",
          Value: pgRevenueReport.overall_summary.avg_expenses,
        },
      ];

      const overallWs = XLSX.utils.json_to_sheet(overallData);
      XLSX.utils.book_append_sheet(wb, overallWs, "Overall Summary");

      // Property-wise Sheets
      for (const property of pgRevenueReport.properties) {
        const propertyData = property.periods.map((p: any) => ({
          Period: p.period,
          "Revenue (₹)": p.revenue,
          "Expenses (₹)": p.expenses,
          "Profit/Loss (₹)": p.profit,
          Status: p.is_profit ? "Profit" : "Loss",
        }));

        // Add summary row
        propertyData.push({
          Period: "TOTAL",
          "Revenue (₹)": property.summary.total_revenue,
          "Expenses (₹)": property.summary.total_expenses,
          "Profit/Loss (₹)": property.summary.is_profit
            ? property.summary.net_profit
            : -property.summary.net_loss,
          Status: property.summary.is_profit ? "Profit" : "Loss",
        });

        propertyData.push({
          Period: "AVERAGE",
          "Revenue (₹)": property.summary.avg_revenue,
          "Expenses (₹)": property.summary.avg_expenses,
          "Profit/Loss (₹)":
            property.summary.avg_revenue - property.summary.avg_expenses,
          Status: "",
        });

        const ws = XLSX.utils.json_to_sheet(propertyData);
        XLSX.utils.book_append_sheet(
          wb,
          ws,
          property.property_name.substring(0, 31),
        );
      }

      const filename = `pg_revenue_report_${pgRevenueReport.report_type}_${pgRevenueReport.period_type}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      XLSX.writeFile(wb, filename);
    } else if (reportData) {
      // Existing export logic for other reports
      let exportData: any[] = [];
      let worksheetName = "";
      let summaryData: any[] = [];

      switch (filters.reportType) {
        case "revenue":
        case "payments":
          worksheetName = "Payments";
          exportData =
            reportData.payments?.map((payment: any) => ({
              "Payment #": payment.payment_number || payment.id,
              Date: payment.payment_date
                ? new Date(payment.payment_date).toLocaleDateString("en-IN")
                : "-",
              "Tenant Name": payment.tenant_name || "N/A",
              Property: payment.property_name || "N/A",
              "Payment Type": payment.payment_type || "-",
              "Amount (₹)": payment.amount || 0,
              "Payment Method": payment.payment_method || "-",
              Status: payment.status || "unknown",
            })) || [];
          summaryData = [
            {
              Metric: "Total Revenue",
              Value: `₹${(reportData.summary as any).totalRevenue?.toLocaleString("en-IN") || 0}`,
            },
            {
              Metric: "Total Payments",
              Value: (reportData.summary as any).paymentCount || 0,
            },
          ];
          break;
        case "tenants":
          worksheetName = "Tenants";
          exportData =
            reportData.tenants?.map((tenant: any) => ({
              Name: tenant.full_name || "-",
              Email: tenant.email || "-",
              Phone: tenant.phone || "-",
              Gender: tenant.gender || "N/A",
              Occupation: tenant.occupation || "N/A",
              Status: tenant.is_active ? "Active" : "Inactive",
              Property: tenant.property_name || "N/A",
              "Created Date": tenant.created_at
                ? new Date(tenant.created_at).toLocaleDateString("en-IN")
                : "-",
            })) || [];
          const tenantSummary = reportData.summary as any;
          summaryData = [
            {
              Metric: "Total Tenants",
              Value: tenantSummary.totalTenants || 0,
            },
            {
              Metric: "Active Tenants",
              Value: tenantSummary.activeTenants || 0,
            },
          ];
          break;
        case "occupancy":
          worksheetName = "Rooms";
          exportData =
            reportData.rooms?.map((room: any) => ({
              Property: room.property_name || "N/A",
              "Room Number": room.room_number || "-",
              "Room Type": room.room_type || "-",
              Status: room.status || "unknown",
              "Occupied Beds": room.occupied_beds || 0,
              "Total Beds": room.total_bed || 0,
              "Available Beds":
                (room.total_bed || 0) - (room.occupied_beds || 0),
            })) || [];
          const occupancySummary = reportData.summary as any;
          summaryData = [
            {
              Metric: "Occupancy Rate",
              Value: `${occupancySummary.occupancyRate || 0}%`,
            },
          ];
          break;
      }

      const wb = XLSX.utils.book_new();

      if (summaryData.length > 0) {
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
      }

      if (exportData.length > 0) {
        const dataWs = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, dataWs, worksheetName);
      }

      const filename = `${filters.reportType}_report_${format(new Date(), "yyyy-MM-dd_HH-mm")}.xlsx`;
      XLSX.writeFile(wb, filename);
    } else if (occupancyReport) {
      const wb = XLSX.utils.book_new();

      // Summary Sheet
      const summaryData = [
        {
          Metric: "Report Scope",
          Value:
            occupancyReport.report_scope === "all"
              ? "All Properties"
              : "Property Specific",
        },
        {
          Metric: "Report Type",
          Value:
            occupancyReport.report_type === "overall"
              ? "Overall (Total Tenants)"
              : occupancyReport.report_type === "non_vacant"
                ? "Non-Vacant Tenants"
                : "Vacant Tenants",
        },
        {
          Metric: "Period Type",
          Value:
            occupancyReport.period_type === "month"
              ? "Month Wise"
              : "Year Wise",
        },
        {
          Metric: "Year",
          Value: occupancyReport.year,
        },
        {
          Metric: "Total Properties",
          Value: occupancyReport.overall_summary.properties_count,
        },
        {
          Metric: "Total Periods",
          Value: occupancyReport.overall_summary.total_periods,
        },
        {
          Metric: "Current Tenants",
          Value:
            occupancyReport.overall_summary.overall_totals.total_non_vacant,
        },
        {
          Metric: "Vacated Tenants",
          Value: occupancyReport.overall_summary.overall_totals.total_vacant,
        },
        {
          Metric: "New Joins",
          Value: occupancyReport.overall_summary.overall_totals.total_new_joins,
        },
        {
          Metric: "New Vacates",
          Value:
            occupancyReport.overall_summary.overall_totals.total_new_vacates,
        },
      ];

      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      // Property-wise Sheets
      for (const property of occupancyReport.properties) {
        const propertyData = property.periods.map((p: any) => ({
          Period: p.period,
          "Total Tenants": p.total_tenants,
          "Non-Vacant Tenants": p.non_vacant_tenants,
          "Vacant Tenants": p.vacant_tenants,
          "New Joins": p.new_joins,
          "New Vacates": p.new_vacates,
        }));

        const ws = XLSX.utils.json_to_sheet(propertyData);
        XLSX.utils.book_append_sheet(
          wb,
          ws,
          property.property_name.substring(0, 31),
        );
      }

      const filename = `occupancy_report_${occupancyReport.report_scope}_${occupancyReport.report_type}_${occupancyReport.period_type}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      XLSX.writeFile(wb, filename);
    }
  };

  const handlePrint = () => {
    if (
      !reportData &&
      !tenantPaymentReport &&
      !propertyPaymentReport &&
      !pgRevenueReport
    ) {
      toast.error("No data to print");
      return;
    }
    window.print();
    toast.success("Opening print dialog...");
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPropertyDisplay = () => {
    if (filters.propertyId === "all") return "All Properties";
    return selectedProperty?.name || "Loading...";
  };

  // Filtered tenants for search
  const filteredTenants = tenantsList.filter(
    (tenant) =>
      tenant.full_name
        ?.toLowerCase()
        .includes(tenantSearchTerm.toLowerCase()) ||
      tenant.phone?.includes(tenantSearchTerm) ||
      tenant.email?.toLowerCase().includes(tenantSearchTerm.toLowerCase()),
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
          icon={
            <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 text-[#16a34a]" />
          }
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
    {/* Common Filters Row */}
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

    {/* PG Revenue Report Specific Filters - SEPARATE ROW */}
    {filters.reportType === 'pg_revenue' && (
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mt-3 pt-3 border-t border-gray-100">
        <div className="space-y-1 sm:space-y-2">
          <Label className="text-xs">Period Type</Label>
          <Select value={pgRevenuePeriodType} onValueChange={(value: any) => setPgRevenuePeriodType(value)}>
            <SelectTrigger className="h-8 sm:h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month_wise" className="text-xs">Month Wise</SelectItem>
              <SelectItem value="year_wise" className="text-xs">Year Wise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <Label className="text-xs">Year</Label>
          <Select value={pgRevenueYear.toString()} onValueChange={(value) => setPgRevenueYear(parseInt(value))}>
            <SelectTrigger className="h-8 sm:h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2022, 2023, 2024, 2025, 2026].map(y => (
                <SelectItem key={y} value={y.toString()} className="text-xs">{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <Label className="text-xs">Property (Optional)</Label>
          <Select value={filters.propertyId} onValueChange={handlePropertyChange}>
            <SelectTrigger className="h-8 sm:h-9 text-xs">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">🏢 All Properties</SelectItem>
              {properties.map(property => (
                <SelectItem key={property.id} value={property.id} className="text-xs">
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )}

    {/* Occupancy Report Specific Filters - SEPARATE ROW */}
    {filters.reportType === 'occupancy' && (
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mt-3 pt-3 border-t border-gray-100">
        <div className="space-y-1 sm:space-y-2">
          <Label className="text-xs">Report Scope</Label>
          <Select value={occupancyReportScope} onValueChange={(value: any) => setOccupancyReportScope(value)}>
            <SelectTrigger className="h-8 sm:h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Properties</SelectItem>
              <SelectItem value="property" className="text-xs">Specific Property</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <Label className="text-xs">Report Type</Label>
          <Select value={occupancyReportType} onValueChange={(value: any) => setOccupancyReportType(value)}>
            <SelectTrigger className="h-8 sm:h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall" className="text-xs">Overall (Total Tenants)</SelectItem>
              <SelectItem value="non_vacant" className="text-xs">Non-Vacant Tenants Only</SelectItem>
              <SelectItem value="vacant" className="text-xs">Vacant Tenants Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <Label className="text-xs">Period Type</Label>
          <Select value={occupancyPeriodType} onValueChange={(value: any) => setOccupancyPeriodType(value)}>
            <SelectTrigger className="h-8 sm:h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month" className="text-xs">Month Wise</SelectItem>
              <SelectItem value="year" className="text-xs">Year Wise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <Label className="text-xs">Year</Label>
          <Select value={occupancyYear.toString()} onValueChange={(value) => setOccupancyYear(parseInt(value))}>
            <SelectTrigger className="h-8 sm:h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2022, 2023, 2024, 2025, 2026].map(y => (
                <SelectItem key={y} value={y.toString()} className="text-xs">{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {occupancyReportScope === 'property' && (
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs">Select Property</Label>
            <Select value={filters.propertyId} onValueChange={handlePropertyChange}>
              <SelectTrigger className="h-8 sm:h-9 text-xs">
                <SelectValue placeholder="Choose property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map(property => (
                  <SelectItem key={property.id} value={property.id} className="text-xs">
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    )}

    {/* Active Filters Display */}
    <div className="mt-3 pt-2 border-t border-gray-100 flex flex-wrap gap-1 sm:gap-1.5">
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
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            Quick Actions
          </TabsTrigger>
          <TabsTrigger
            value="report"
            disabled={
              !reportData && !tenantPaymentReport && !propertyPaymentReport
            }
            className="text-xs sm:text-sm"
          >
            Generated Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-3 sm:mt-4">
  <Card className="border-0 shadow-sm">
    <CardHeader className="pb-2 px-3 sm:px-6">
      <CardTitle className="text-sm sm:text-base">
        Generate Reports Quickly
      </CardTitle>
    </CardHeader>
    <CardContent className="px-3 sm:px-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <QuickActionButton
          icon={<Building2 className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="PG Revenue"
          onClick={() => {
            setFilters({ ...filters, reportType: "pg_revenue" });
            generateReport();
          }}
          color="cyan"
        />
        <QuickActionButton
          icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="Tenants Report"
          onClick={() => {
            setFilters({ ...filters, reportType: "tenants" });
            generateReport();
          }}
          color="purple"
        />
        <QuickActionButton
          icon={<User className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="Tenant Payment"
          onClick={() => {
            setFilters({ ...filters, reportType: "tenant_payment" });
            generateReport();
          }}
          color="green"
        />
        
        
        <QuickActionButton
          icon={<Home className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="Occupancy Report"
          onClick={() => {
            setFilters({ ...filters, reportType: "occupancy" });
            generateReport();
          }}
          color="orange"
        />
        
        <QuickActionButton
          icon={<Building2 className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="Property Payment"
          onClick={() => {
            setFilters({ ...filters, reportType: "property_payment" });
            generateReport();
          }}
          color="cyan"
        />
        <QuickActionButton
          icon={<IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="Revenue Report"
          onClick={() => {
            setFilters({ ...filters, reportType: "revenue" });
            generateReport();
          }}
          color="blue"
        />
        
      </div>
    </CardContent>
  </Card>
</TabsContent>

        <TabsContent
          value="report"
          className="mt-3 sm:mt-4"
          ref={reportSectionRef}
        >
          {/* Tenant Payment Report */}
          {tenantPaymentReport && (
            <div className="space-y-4">
              {/* Report Actions */}
              <div className="flex justify-end gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToExcel}
                  className="h-7 sm:h-8 text-xs"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="h-7 sm:h-8 text-xs"
                >
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
                      <p className="text-sm font-semibold">
                        {tenantPaymentReport.tenant.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Phone / Email</p>
                      <p className="text-xs">
                        {tenantPaymentReport.tenant.phone} /{" "}
                        {tenantPaymentReport.tenant.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Property & Room
                      </p>
                      <p className="text-xs">
                        {tenantPaymentReport.tenant.property_name} - Room{" "}
                        {tenantPaymentReport.tenant.room_number}, Bed{" "}
                        {tenantPaymentReport.tenant.bed_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Monthly Rent</p>
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(
                          tenantPaymentReport.tenant.monthly_rent,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Check-in Date</p>
                      <p className="text-xs">
                        {tenantPaymentReport.tenant.check_in_date}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Months Completed
                      </p>
                      <p className="text-sm font-semibold">
                        {tenantPaymentReport.tenant.months_since_joining} months
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Security Deposit
                      </p>
                      <p className="text-xs">
                        Total:{" "}
                        {formatCurrency(
                          tenantPaymentReport.tenant.security_deposit,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Gender / Occupation
                      </p>
                      <p className="text-xs">
                        {tenantPaymentReport.tenant.gender} /{" "}
                        {tenantPaymentReport.tenant.occupation || "N/A"}
                      </p>
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
                      <p className="text-lg font-bold text-blue-700">
                        {formatCurrency(
                          tenantPaymentReport.summary.expected_rent,
                        )}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {tenantPaymentReport.tenant.months_since_joining} months
                        ×{" "}
                        {formatCurrency(
                          tenantPaymentReport.tenant.monthly_rent,
                        )}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">Paid Rent</p>
                      <p className="text-lg font-bold text-green-700">
                        {formatCurrency(tenantPaymentReport.summary.paid_rent)}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {tenantPaymentReport.rent_payments?.length || 0}{" "}
                        payments
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">Pending Rent</p>
                      <p className="text-lg font-bold text-yellow-700">
                        {formatCurrency(
                          tenantPaymentReport.summary.pending_rent,
                        )}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {tenantPaymentReport.summary.collection_rate.toFixed(1)}
                        % collected
                      </p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">
                        Collection Rate
                      </p>
                      <p className="text-2xl font-bold text-indigo-700">
                        {tenantPaymentReport.summary.collection_rate.toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>

                  {/* Month-wise Rent Table */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Month-wise Rent Details
                    </p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">Month</th>
                            <th className="px-3 py-2 text-right">
                              Expected Rent
                            </th>
                            <th className="px-3 py-2 text-right">Paid Rent</th>
                            <th className="px-3 py-2 text-right">
                              Pending Rent
                            </th>
                            <th className="px-3 py-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {tenantPaymentReport.month_wise_rent?.map(
                            (month: any, idx: number) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium">
                                  {month.month} {month.year}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {formatCurrency(month.expected)}
                                </td>
                                <td className="px-3 py-2 text-right text-green-600">
                                  {formatCurrency(month.paid)}
                                </td>
                                <td className="px-3 py-2 text-right text-yellow-600">
                                  {formatCurrency(month.pending)}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <Badge
                                    className={
                                      month.pending === 0
                                        ? "bg-green-100 text-green-700"
                                        : month.paid > 0
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-red-100 text-red-700"
                                    }
                                  >
                                    {month.pending === 0
                                      ? "Paid"
                                      : month.paid > 0
                                        ? "Partial"
                                        : "Pending"}
                                  </Badge>
                                </td>
                              </tr>
                            ),
                          )}
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
                      <p className="text-lg font-bold text-purple-700">
                        {formatCurrency(
                          tenantPaymentReport.summary.security_deposit_total,
                        )}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">Deposit Paid</p>
                      <p className="text-lg font-bold text-green-700">
                        {formatCurrency(
                          tenantPaymentReport.summary.security_deposit_paid,
                        )}
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">
                        Deposit Pending
                      </p>
                      <p className="text-lg font-bold text-yellow-700">
                        {formatCurrency(
                          tenantPaymentReport.summary.security_deposit_pending,
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Deposit Payments Table */}
                  {tenantPaymentReport.deposit_payments?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Deposit Payment History
                      </p>
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
                            {tenantPaymentReport.deposit_payments.map(
                              (payment: any) => (
                                <tr
                                  key={payment.id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-3 py-2">
                                    {new Date(
                                      payment.payment_date,
                                    ).toLocaleDateString("en-IN")}
                                  </td>
                                  <td className="px-3 py-2 text-right font-semibold">
                                    {formatCurrency(payment.amount)}
                                  </td>
                                  <td className="px-3 py-2 capitalize">
                                    {payment.payment_mode}
                                  </td>
                                  <td className="px-3 py-2">
                                    <Badge
                                      className={
                                        payment.status === "approved" ||
                                        payment.status === "paid"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-yellow-100 text-yellow-700"
                                      }
                                    >
                                      {payment.status === "approved" ||
                                      payment.status === "paid"
                                        ? "Paid"
                                        : payment.status}
                                    </Badge>
                                  </td>
                                </tr>
                              ),
                            )}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToExcel}
                  className="h-7 sm:h-8 text-xs"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="h-7 sm:h-8 text-xs"
                >
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
                      <p className="text-sm font-semibold">
                        {propertyPaymentReport.property?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Address</p>
                      <p className="text-xs">
                        {propertyPaymentReport.property?.address || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Total Rooms / Beds
                      </p>
                      <p className="text-sm">
                        {propertyPaymentReport.property?.total_rooms || 0} rooms
                        / {propertyPaymentReport.property?.total_beds || 0} beds
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Occupancy Rate
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        {propertyPaymentReport.property?.occupancy_rate?.toFixed(
                          1,
                        ) || 0}
                        %
                      </p>
                    </div>
                  </div>

                  {/* Floor-wise Statistics */}
                  {propertyPaymentReport.floor_stats?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Floor-wise Statistics
                      </p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left">Floor</th>
                              <th className="px-3 py-2 text-center">Rooms</th>
                              <th className="px-3 py-2 text-center">
                                Total Beds
                              </th>
                              <th className="px-3 py-2 text-center">
                                Occupied Beds
                              </th>
                              <th className="px-3 py-2 text-center">
                                Available Beds
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {propertyPaymentReport.floor_stats.map(
                              (floor: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 font-medium">
                                    Floor {floor.floor}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {floor.total_rooms}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {floor.total_beds}
                                  </td>
                                  <td className="px-3 py-2 text-center text-green-600">
                                    {floor.occupied_beds}
                                  </td>
                                  <td className="px-3 py-2 text-center text-yellow-600">
                                    {floor.available_beds}
                                  </td>
                                </tr>
                              ),
                            )}
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
                      <p className="text-[10px] text-gray-600">
                        Total Rent to Collect
                      </p>
                      <p className="text-lg font-bold text-blue-700">
                        {formatCurrency(
                          propertyPaymentReport.financial_summary
                            ?.total_rent_to_be_collected || 0,
                        )}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">
                        Rent Collected
                      </p>
                      <p className="text-lg font-bold text-green-700">
                        {formatCurrency(
                          propertyPaymentReport.financial_summary
                            ?.total_rent_collected || 0,
                        )}
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">Rent Pending</p>
                      <p className="text-lg font-bold text-yellow-700">
                        {formatCurrency(
                          propertyPaymentReport.financial_summary
                            ?.total_rent_pending || 0,
                        )}
                      </p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">
                        Collection Rate
                      </p>
                      <p className="text-2xl font-bold text-indigo-700">
                        {propertyPaymentReport.financial_summary?.total_rent_collection_rate?.toFixed(
                          1,
                        ) || 0}
                        %
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">
                        Security Deposit to Collect
                      </p>
                      <p className="text-lg font-bold text-purple-700">
                        {formatCurrency(
                          propertyPaymentReport.financial_summary
                            ?.total_security_deposit_to_be_collected || 0,
                        )}
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">
                        Deposit Collected
                      </p>
                      <p className="text-lg font-bold text-emerald-700">
                        {formatCurrency(
                          propertyPaymentReport.financial_summary
                            ?.total_security_deposit_collected || 0,
                        )}
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-gray-600">
                        Deposit Pending
                      </p>
                      <p className="text-lg font-bold text-amber-700">
                        {formatCurrency(
                          propertyPaymentReport.financial_summary
                            ?.total_security_deposit_pending || 0,
                        )}
                      </p>
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
                          <th className="px-3 py-2 text-center">
                            Monthly Rent
                          </th>
                          <th className="px-3 py-2 text-center">Months</th>
                          <th className="px-3 py-2 text-right">
                            Expected Rent
                          </th>
                          <th className="px-3 py-2 text-right">Paid Rent</th>
                          <th className="px-3 py-2 text-right">Pending Rent</th>
                          <th className="px-3 py-2 text-center">
                            Collection %
                          </th>
                          <th className="px-3 py-2 text-right">Deposit</th>
                          <th className="px-3 py-2 text-right">Deposit Paid</th>
                          <th className="px-3 py-2 text-right">
                            Deposit Pending
                          </th>
                          <th className="px-3 py-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {propertyPaymentReport.tenant_reports?.map(
                          (tenant: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium">
                                {tenant.tenant_name}
                              </td>
                              <td className="px-3 py-2 text-center">
                                R{tenant.room_number}/B{tenant.bed_number}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatCurrency(tenant.monthly_rent)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {tenant.months_completed}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {formatCurrency(tenant.expected_rent)}
                              </td>
                              <td className="px-3 py-2 text-right text-green-600">
                                {formatCurrency(tenant.paid_rent)}
                              </td>
                              <td className="px-3 py-2 text-right text-yellow-600">
                                {formatCurrency(tenant.pending_rent)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <div className="flex items-center gap-1">
                                  <Progress
                                    value={tenant.rent_collection_rate}
                                    className="h-1.5 w-12"
                                  />
                                  <span className="text-[10px]">
                                    {tenant.rent_collection_rate?.toFixed(0) ||
                                      0}
                                    %
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-right">
                                {formatCurrency(tenant.security_deposit)}
                              </td>
                              <td className="px-3 py-2 text-right text-green-600">
                                {formatCurrency(tenant.paid_deposit)}
                              </td>
                              <td className="px-3 py-2 text-right text-yellow-600">
                                {formatCurrency(tenant.pending_deposit)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <Badge
                                  className={
                                    tenant.is_active
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }
                                >
                                  {tenant.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-right text-xs text-gray-500">
                    Total Tenants:{" "}
                    {propertyPaymentReport.financial_summary?.total_tenants ||
                      0}{" "}
                    | Active:{" "}
                    {propertyPaymentReport.financial_summary?.active_tenants ||
                      0}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* PG Revenue Report */}
          {pgRevenueReport && (
            <div className="space-y-4">
              {/* Report Actions */}
              <div className="flex justify-end gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToExcel}
                  className="h-7 sm:h-8 text-xs"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="h-7 sm:h-8 text-xs"
                >
                  <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Print
                </Button>
              </div>

              {/* Report Header */}
              <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-4">
                  <div className="text-center">
                    <h2 className="text-lg font-bold text-gray-800">
                      PG Revenue Report
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {pgRevenueReport.report_type === "all_property"
                        ? "All Properties"
                        : "Property Wise"}{" "}
                      |
                      {pgRevenueReport.period_type === "month_wise"
                        ? "Month Wise"
                        : "Year Wise"}{" "}
                      | Year: {pgRevenueReport.year}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Generated on:{" "}
                      {new Date(pgRevenueReport.generated_at).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-600">Total Revenue</p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatCurrency(
                      pgRevenueReport.overall_summary.total_revenue,
                    )}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-600">Total Expenses</p>
                  <p className="text-lg font-bold text-red-700">
                    {formatCurrency(
                      pgRevenueReport.overall_summary.total_expenses,
                    )}
                  </p>
                </div>
                <div
                  className={`${pgRevenueReport.overall_summary.is_profit ? "bg-green-50" : "bg-amber-50"} rounded-lg p-3 text-center`}
                >
                  <p className="text-[10px] text-gray-600">
                    Net{" "}
                    {pgRevenueReport.overall_summary.is_profit
                      ? "Profit"
                      : "Loss"}
                  </p>
                  <p
                    className={`text-lg font-bold ${pgRevenueReport.overall_summary.is_profit ? "text-green-700" : "text-amber-700"}`}
                  >
                    {pgRevenueReport.overall_summary.is_profit
                      ? formatCurrency(
                          pgRevenueReport.overall_summary.net_profit,
                        )
                      : formatCurrency(
                          pgRevenueReport.overall_summary.net_loss,
                        )}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-600">Properties</p>
                  <p className="text-lg font-bold text-purple-700">
                    {pgRevenueReport.overall_summary.properties_count}
                  </p>
                </div>
              </div>

              {/* Property-wise Report Tables */}
              {pgRevenueReport.properties.map((property: any, idx: number) => (
                <Card key={idx} className="border-0 shadow-sm overflow-hidden">
                  <CardHeader className="pb-2 px-3 sm:px-6 bg-gradient-to-r from-gray-50 to-white">
                    <CardTitle className="text-sm sm:text-base flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span>{property.property_name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {property.summary.periods_count}{" "}
                          {pgRevenueReport.period_type === "month_wise"
                            ? "months"
                            : "years"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-green-600">
                          Revenue:{" "}
                          {formatCurrency(property.summary.total_revenue)}
                        </span>
                        <span className="text-red-600">
                          Expenses:{" "}
                          {formatCurrency(property.summary.total_expenses)}
                        </span>
                        <span
                          className={
                            property.summary.is_profit
                              ? "text-green-700 font-semibold"
                              : "text-amber-700 font-semibold"
                          }
                        >
                          {property.summary.is_profit ? "Profit" : "Loss"}:{" "}
                          {formatCurrency(
                            property.summary.is_profit
                              ? property.summary.net_profit
                              : property.summary.net_loss,
                          )}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pt-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">
                              {pgRevenueReport.period_type === "month_wise"
                                ? "Month"
                                : "Year"}
                            </th>
                            <th className="px-3 py-2 text-right">
                              Revenue (₹)
                            </th>
                            <th className="px-3 py-2 text-right">
                              Expenses (₹)
                            </th>
                            <th className="px-3 py-2 text-right">
                              Profit/Loss (₹)
                            </th>
                            <th className="px-3 py-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {property.periods.map((period: any, pIdx: number) => (
                            <tr key={pIdx} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium">
                                {period.period}
                              </td>
                              <td className="px-3 py-2 text-right text-green-600">
                                {formatCurrency(period.revenue)}
                              </td>
                              <td className="px-3 py-2 text-right text-red-600">
                                {formatCurrency(period.expenses)}
                              </td>
                              <td
                                className={`px-3 py-2 text-right font-semibold ${period.is_profit ? "text-green-700" : "text-amber-700"}`}
                              >
                                {period.is_profit
                                  ? formatCurrency(period.profit)
                                  : `-${formatCurrency(Math.abs(period.profit))}`}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <Badge
                                  className={
                                    period.is_profit
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }
                                >
                                  {period.is_profit ? "Profit" : "Loss"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-100">
                          <tr>
                            <td className="px-3 py-2 font-bold">Total</td>
                            <td className="px-3 py-2 text-right font-bold text-green-700">
                              {formatCurrency(property.summary.total_revenue)}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-red-700">
                              {formatCurrency(property.summary.total_expenses)}
                            </td>
                            <td
                              className={`px-3 py-2 text-right font-bold ${property.summary.is_profit ? "text-green-700" : "text-amber-700"}`}
                            >
                              {property.summary.is_profit
                                ? formatCurrency(property.summary.net_profit)
                                : `-${formatCurrency(property.summary.net_loss)}`}
                            </td>
                            <td className="px-3 py-2 text-center"></td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td
                              className="px-3 py-2 text-xs text-gray-500"
                              colSpan={5}
                            >
                              Average Revenue per{" "}
                              {pgRevenueReport.period_type === "month_wise"
                                ? "month"
                                : "year"}
                              : {formatCurrency(property.summary.avg_revenue)} |
                              Average Expenses:{" "}
                              {formatCurrency(property.summary.avg_expenses)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Overall Summary Footer */}
              <Card className="border-0 shadow-sm bg-gradient-to-r from-gray-100 to-white">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Total Properties
                      </p>
                      <p className="text-lg font-bold">
                        {pgRevenueReport.overall_summary.properties_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Total Periods</p>
                      <p className="text-lg font-bold">
                        {pgRevenueReport.overall_summary.total_periods}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Total Revenue</p>
                      <p className="text-lg font-bold text-green-700">
                        {formatCurrency(
                          pgRevenueReport.overall_summary.total_revenue,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Total Expenses
                      </p>
                      <p className="text-lg font-bold text-red-700">
                        {formatCurrency(
                          pgRevenueReport.overall_summary.total_expenses,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Net{" "}
                        {pgRevenueReport.overall_summary.is_profit
                          ? "Profit"
                          : "Loss"}
                      </p>
                      <p
                        className={`text-lg font-bold ${pgRevenueReport.overall_summary.is_profit ? "text-green-700" : "text-amber-700"}`}
                      >
                        {formatCurrency(
                          pgRevenueReport.overall_summary.is_profit
                            ? pgRevenueReport.overall_summary.net_profit
                            : pgRevenueReport.overall_summary.net_loss,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-200 text-center text-[10px] text-gray-500">
                    Average Revenue:{" "}
                    {formatCurrency(
                      pgRevenueReport.overall_summary.avg_revenue,
                    )}{" "}
                    | Average Expenses:{" "}
                    {formatCurrency(
                      pgRevenueReport.overall_summary.avg_expenses,
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {occupancyReport && (
            <div className="space-y-4">
              {/* Report Actions */}
              <div className="flex justify-end gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToExcel}
                  className="h-7 sm:h-8 text-xs"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="h-7 sm:h-8 text-xs"
                >
                  <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Print
                </Button>
              </div>

              {/* Report Header */}
              <Card className="border-0 shadow-sm bg-gradient-to-r from-teal-50 to-cyan-50">
                <CardContent className="p-4">
                  <div className="text-center">
                    <h2 className="text-lg font-bold text-gray-800">
                      Occupancy Report
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {occupancyReport.report_scope === "all"
                        ? "All Properties"
                        : "Property Wise"}{" "}
                      |
                      {occupancyReport.report_type === "overall"
                        ? "Overall"
                        : occupancyReport.report_type === "non_vacant"
                          ? "Non-Vacant Tenants"
                          : "Vacant Tenants"}{" "}
                      |
                      {occupancyReport.period_type === "month"
                        ? "Month Wise"
                        : "Year Wise"}{" "}
                      | Year: {occupancyReport.year}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Generated on:{" "}
                      {new Date(occupancyReport.generated_at).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-600">Total Properties</p>
                  <p className="text-lg font-bold text-blue-700">
                    {occupancyReport.overall_summary.properties_count}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-600">Current Tenants</p>
                  <p className="text-lg font-bold text-green-700">
                    {
                      occupancyReport.overall_summary.overall_totals
                        .total_non_vacant
                    }
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-600">Vacated Tenants</p>
                  <p className="text-lg font-bold text-yellow-700">
                    {
                      occupancyReport.overall_summary.overall_totals
                        .total_vacant
                    }
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-600">
                    New Joins ({occupancyReport.year})
                  </p>
                  <p className="text-lg font-bold text-purple-700">
                    {
                      occupancyReport.overall_summary.overall_totals
                        .total_new_joins
                    }
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-600">
                    New Vacates ({occupancyReport.year})
                  </p>
                  <p className="text-lg font-bold text-red-700">
                    {
                      occupancyReport.overall_summary.overall_totals
                        .total_new_vacates
                    }
                  </p>
                </div>
              </div>

              {/* Property-wise Report Tables */}
              {occupancyReport.properties.map((property: any, idx: number) => (
                <Card key={idx} className="border-0 shadow-sm overflow-hidden">
                  <CardHeader className="pb-2 px-3 sm:px-6 bg-gradient-to-r from-gray-50 to-white">
                    <CardTitle className="text-sm sm:text-base flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-teal-600" />
                        <span>{property.property_name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {property.summary.periods_count}{" "}
                          {occupancyReport.period_type === "month"
                            ? "months"
                            : "years"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-green-600">
                          Current: {property.summary.non_vacant_tenants}
                        </span>
                        <span className="text-yellow-600">
                          Vacated: {property.summary.vacant_tenants}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pt-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">
                              {occupancyReport.period_type === "month"
                                ? "Month"
                                : "Year"}
                            </th>
                            <th className="px-3 py-2 text-right">
                              {occupancyReport.report_type === "non_vacant"
                                ? "Non-Vacant Tenants"
                                : occupancyReport.report_type === "vacant"
                                  ? "Vacant Tenants"
                                  : "Total Tenants"}
                            </th>
                            <th className="px-3 py-2 text-right">
                              {occupancyReport.report_type === "vacant"
                                ? "New Vacates"
                                : "New Joins"}
                            </th>
                            <th className="px-3 py-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {property.periods.map((period: any, pIdx: number) => (
                            <tr key={pIdx} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium">
                                {period.period}
                              </td>
                              <td className="px-3 py-2 text-right font-semibold text-blue-600">
                                {period.display_total}
                              </td>
                              <td className="px-3 py-2 text-right text-green-600">
                                {period.display_new}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <Badge
                                  className={
                                    period.display_total > 0
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-500"
                                  }
                                >
                                  {period.display_total > 0
                                    ? "Active"
                                    : "No Tenants"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-100">
                          <tr>
                            <td className="px-3 py-2 font-bold">Max / Total</td>
                            <td className="px-3 py-2 text-right font-bold text-blue-700">
                              Max:{" "}
                              {occupancyReport.report_type === "non_vacant"
                                ? property.summary.non_vacant_tenants
                                : occupancyReport.report_type === "vacant"
                                  ? property.summary.vacant_tenants
                                  : property.summary.total_tenants}
                            </td>
                            <td className="px-3 py-2 text-right" />
                            <td className="px-3 py-2 text-center" />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Overall Summary Footer */}
              <Card className="border-0 shadow-sm bg-gradient-to-r from-gray-100 to-white">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Properties</p>
                      <p className="text-lg font-bold">
                        {occupancyReport.overall_summary.properties_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Periods</p>
                      <p className="text-lg font-bold">
                        {occupancyReport.overall_summary.total_periods}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Current Tenants
                      </p>
                      <p className="text-lg font-bold text-green-700">
                        {
                          occupancyReport.overall_summary.overall_totals
                            .total_non_vacant
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Vacated Tenants
                      </p>
                      <p className="text-lg font-bold text-yellow-700">
                        {
                          occupancyReport.overall_summary.overall_totals
                            .total_vacant
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">New Joins</p>
                      <p className="text-lg font-bold text-purple-700">
                        {
                          occupancyReport.overall_summary.overall_totals
                            .total_new_joins
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">New Vacates</p>
                      <p className="text-lg font-bold text-red-700">
                        {
                          occupancyReport.overall_summary.overall_totals
                            .total_new_vacates
                        }
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-200 text-center text-[10px] text-gray-500">
                    Report Type:{" "}
                    {occupancyReport.report_type === "overall"
                      ? "Overall (Total Tenants)"
                      : occupancyReport.report_type === "non_vacant"
                        ? "Non-Vacant Tenants Only"
                        : "Vacant Tenants Only"}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToExcel}
                  className="h-7 sm:h-8 text-xs"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="h-7 sm:h-8 text-xs"
                >
                  <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Print
                </Button>
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
                  {filters.reportType === "revenue" && reportData && (
  <RevenueReportDetails 
    data={reportData} 
    formatCurrency={formatCurrency}
    page={revenuePage}
    pageSize={revenuePageSize}
    onPageChange={setRevenuePage}
    onPageSizeChange={(size:any) => { setRevenuePageSize(size); setRevenuePage(1); }}
  />
)}
                  {filters.reportType === "payments" && (
                    <PaymentsReportDetails
                      data={reportData}
                      formatCurrency={formatCurrency}
                    />
                  )}
                  {filters.reportType === "tenants" && reportData && (
  <TenantsReportDetails 
    data={reportData} 
    formatCurrency={formatCurrency}
    page={reportPage}
    pageSize={reportPageSize}
    onPageChange={setReportPage}
    onPageSizeChange={(size:any) => { setReportPageSize(size); setReportPage(1); }}
  />
)}
                  {filters.reportType === "occupancy" && (
                    <OccupancyReportDetails
                      data={reportData}
                      formatCurrency={formatCurrency}
                    />
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
          <div className="p-1.5 sm:p-2 rounded-lg bg-gray-100">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExtendedStatCard({
  title,
  value,
  subtitle,
  icon,
  loading,
  color,
}: any) {
  const colors = {
    green: "from-green-50 to-emerald-50 text-green-600",
    yellow: "from-yellow-50 to-amber-50 text-yellow-600",
    blue: "from-blue-50 to-cyan-50 text-blue-600",
    red: "from-red-50 to-rose-50 text-red-600",
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
          <div className={`p-1 rounded-lg bg-white/50`}>{icon}</div>
          <div>
            <p className="text-[10px] sm:text-xs text-gray-600">{title}</p>
            <p className="text-xs sm:text-sm font-bold">{value}</p>
            {subtitle && (
              <p className="text-[8px] sm:text-[10px] text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ icon, label, onClick, color }: any) {
  const colors = {
    blue: "from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-600",
    purple: "from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-600",
    orange: "from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-600",
    green: "from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 text-green-600",
    cyan: "from-cyan-50 to-sky-100 hover:from-cyan-100 hover:to-sky-200 text-cyan-600",
  };

  return (
    <Button
      variant="ghost"
      className={`w-full h-auto py-3 sm:py-4 px-2 sm:px-3 flex flex-col items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br ${colors[color]} border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200`}
      onClick={onClick}
    >
      <div className="p-2 rounded-full bg-white/50">
        {icon}
      </div>
      <span className="text-[11px] sm:text-xs font-semibold text-center">{label}</span>
    </Button>
  );
}

function SummaryStatCard({ title, value, icon }: any) {
  const getBgColor = (title: string) => {
    switch (title) {
      case "Revenue":
        return "bg-emerald-50";
      case "Payments":
        return "bg-blue-50";
      case "Tenants":
        return "bg-purple-50";
      case "Occupancy":
        return "bg-orange-50";
      case "Collection":
        return "bg-indigo-50";
      default:
        return "bg-gray-50";
    }
  };

  const getIconColor = (title: string) => {
    switch (title) {
      case "Revenue":
        return "text-emerald-600";
      case "Payments":
        return "text-blue-600";
      case "Tenants":
        return "text-purple-600";
      case "Occupancy":
        return "text-orange-600";
      case "Collection":
        return "text-indigo-600";
      default:
        return "text-gray-600";
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
          <div
            className={`p-1.5 rounded-lg bg-white/70 ${getIconColor(title)}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Report Detail Components - KEEP EXISTING
function RevenueReportDetails({ data, formatCurrency, page, pageSize, onPageChange, onPageSizeChange }: any) {
  const summary = data.summary;
  const payments = data.payments || [];
  const totalPayments = payments.length;
  
  // Paginate payments
  const startIndex = (page - 1) * pageSize;
  const paginatedPayments = payments.slice(startIndex, startIndex + pageSize);
  
  const monthlyData = summary.monthlyBreakdown || [];
  const propertyData = summary.propertyBreakdown || [];
  
  return (
    <div className="space-y-4">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(summary.totalRevenue)}</p>
          <p className="text-[10px] text-gray-500">{summary.totalTransactions} transactions</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Rent Revenue</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(summary.revenueByType?.rent?.amount || 0)}</p>
          <p className="text-[10px] text-gray-500">{summary.revenueByType?.rent?.percentage?.toFixed(1) || 0}% of total</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Deposit Revenue</p>
          <p className="text-xl font-bold text-purple-700">{formatCurrency(summary.revenueByType?.security_deposit?.amount || 0)}</p>
          <p className="text-[10px] text-gray-500">{summary.revenueByType?.security_deposit?.percentage?.toFixed(1) || 0}% of total</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Avg Daily Revenue</p>
          <p className="text-xl font-bold text-amber-700">{formatCurrency(summary.averageDailyRevenue)}</p>
          <p className="text-[10px] text-gray-500">Over {summary.daysInRange} days</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Unique Tenants</p>
          <p className="text-2xl font-bold text-indigo-700">{summary.uniqueTenants}</p>
          <p className="text-[10px] text-gray-500">Avg: {formatCurrency(summary.averageTransactionValue)}/txn</p>
        </div>
      </div>
      
      {/* Revenue Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue by Type - Pie Chart Style */}
        <div className="border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Revenue by Type</h4>
          <div className="space-y-2">
            {Object.entries(summary.revenueByType || {}).map(([type, data]: [string, any]) => (
              data.amount > 0 && (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                    <span>{formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={data.percentage} className="h-1.5" />
                </div>
              )
            ))}
          </div>
        </div>
        
        {/* Revenue by Payment Mode */}
        <div className="border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Revenue by Payment Mode</h4>
          <div className="space-y-2">
            {Object.entries(summary.revenueByMode || {}).map(([mode, data]: [string, any]) => (
              data.amount > 0 && (
                <div key={mode}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize">{mode.replace('_', ' ')}</span>
                    <span>{formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={data.percentage} className="h-1.5" />
                </div>
              )
            ))}
          </div>
        </div>
      </div>
      
      {/* Monthly Breakdown Table */}
      {monthlyData.length > 0 && (
        <div className="border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Monthly Revenue Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left">Month</th>
                  <th className="px-2 py-1 text-right">Total Revenue</th>
                  <th className="px-2 py-1 text-right">Rent</th>
                  <th className="px-2 py-1 text-right">Deposit</th>
                  <th className="px-2 py-1 text-right">Maintenance</th>
                  <th className="px-2 py-1 text-center">Transactions</th>
                  <th className="px-2 py-1 text-center">Unique Tenants</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month: any) => (
                  <tr key={month.month_key} className="border-t">
                    <td className="px-2 py-1 font-medium">{month.month} {month.year}</td>
                    <td className="px-2 py-1 text-right font-semibold">{formatCurrency(month.total_amount)}</td>
                    <td className="px-2 py-1 text-right">{formatCurrency(month.rent_amount)}</td>
                    <td className="px-2 py-1 text-right">{formatCurrency(month.deposit_amount)}</td>
                    <td className="px-2 py-1 text-right">{formatCurrency(month.maintenance_amount)}</td>
                    <td className="px-2 py-1 text-center">{month.transaction_count}</td>
                    <td className="px-2 py-1 text-center">{month.unique_tenants}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td className="px-2 py-1 font-bold">TOTAL</td>
                  <td className="px-2 py-1 text-right font-bold">{formatCurrency(summary.totalRevenue)}</td>
                  <td className="px-2 py-1 text-right font-bold">{formatCurrency(summary.revenueByType?.rent?.amount || 0)}</td>
                  <td className="px-2 py-1 text-right font-bold">{formatCurrency(summary.revenueByType?.security_deposit?.amount || 0)}</td>
                  <td className="px-2 py-1 text-right font-bold">{formatCurrency(summary.revenueByType?.maintenance?.amount || 0)}</td>
                  <td className="px-2 py-1 text-center font-bold">{summary.totalTransactions}</td>
                  <td className="px-2 py-1 text-center font-bold">{summary.uniqueTenants}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
      
      {/* Property-wise Breakdown */}
      {propertyData.length > 0 && (
        <div className="border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Revenue by Property</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left">Property</th>
                  <th className="px-2 py-1 text-right">Total Revenue</th>
                  <th className="px-2 py-1 text-right">Rent</th>
                  <th className="px-2 py-1 text-right">Deposit</th>
                  <th className="px-2 py-1 text-center">Transactions</th>
                  <th className="px-2 py-1 text-center">Unique Tenants</th>
                </tr>
              </thead>
              <tbody>
                {propertyData.map((prop: any) => (
                  <tr key={prop.property_name} className="border-t">
                    <td className="px-2 py-1 font-medium">{prop.property_name}</td>
                    <td className="px-2 py-1 text-right font-semibold">{formatCurrency(prop.total_amount)}</td>
                    <td className="px-2 py-1 text-right">{formatCurrency(prop.rent_amount)}</td>
                    <td className="px-2 py-1 text-right">{formatCurrency(prop.deposit_amount)}</td>
                    <td className="px-2 py-1 text-center">{prop.transaction_count}</td>
                    <td className="px-2 py-1 text-center">{prop.unique_tenants}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Detailed Payments Table */}
      <div className="border rounded-lg overflow-hidden">
        <h4 className="text-xs font-semibold text-gray-700 p-3 bg-gray-50 border-b">Transaction Details</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left">Date</th>
                <th className="px-2 py-2 text-left">Tenant</th>
                <th className="px-2 py-2 text-left">Property</th>
                <th className="px-2 py-2 text-left">Type</th>
                <th className="px-2 py-2 text-right">Amount</th>
                <th className="px-2 py-2 text-left">Mode</th>
                <th className="px-2 py-2 text-left">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPayments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-2 py-1.5 whitespace-nowrap">{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td className="px-2 py-1.5">
                    <div className="font-medium">{payment.tenant_name || 'N/A'}</div>
                    <div className="text-[10px] text-gray-500">{payment.tenant_phone}</div>
                  </td>
                  <td className="px-2 py-1.5">{payment.property_name || 'N/A'} / Room {payment.room_number || 'N/A'}</td>
                  <td className="px-2 py-1.5">
                    <Badge variant="outline" className="text-[10px]">
                      {payment.payment_type === 'security_deposit' ? 'Security Deposit' : payment.payment_type || 'Other'}
                    </Badge>
                  </td>
                  <td className="px-2 py-1.5 text-right font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                  <td className="px-2 py-1.5 capitalize">{payment.payment_mode || 'N/A'}</td>
                  <td className="px-2 py-1.5 capitalize">{payment.source || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ReportPagination 
          total={totalPayments}
          page={page}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
}

function PaymentsReportDetails({ data, formatCurrency }: any) {
  const summary = data.summary;
  const payments = data.payments || [];
  
  const totalAmount = summary.totalAmount || 0;
  const approvedAmount = summary.statusBreakdown?.approved?.amount || 0;
  const pendingAmount = summary.statusBreakdown?.pending?.amount || 0;
  const rejectedAmount = summary.statusBreakdown?.rejected?.amount || 0;
  const collectionRate = summary.collectionRateByAmount || 0;
  
  const monthlyData = summary.monthlyBreakdown || [];
  const propertyData = summary.propertyBreakdown || [];
  
  return (
    <div className="space-y-4">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold text-blue-700">{summary.totalTransactions}</p>
          <p className="text-[10px] text-gray-500">Unique Tenants: {summary.uniqueTenants}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Collection Rate</p>
          <p className="text-2xl font-bold text-green-700">{collectionRate.toFixed(1)}%</p>
          <p className="text-[10px] text-gray-500">₹{approvedAmount.toLocaleString()} of ₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Avg Transaction</p>
          <p className="text-2xl font-bold text-amber-700">{formatCurrency(summary.averageTransactionValue)}</p>
          <p className="text-[10px] text-gray-500">Pending: ₹{pendingAmount.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Rent Collection</p>
          <p className="text-2xl font-bold text-purple-700">{summary.typeBreakdown?.rent?.percentage?.toFixed(1) || 0}%</p>
          <p className="text-[10px] text-gray-500">Deposit: {summary.typeBreakdown?.security_deposit?.percentage?.toFixed(1) || 0}%</p>
        </div>
      </div>
      
      {/* Status & Mode Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Status Distribution */}
        <div className="border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Payment Status</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Approved</span>
                <span>₹{approvedAmount.toLocaleString()} ({summary.statusBreakdown?.approved?.percentage?.toFixed(1) || 0}%)</span>
              </div>
              <Progress value={summary.statusBreakdown?.approved?.percentage || 0} className="h-1.5 bg-green-100" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Pending</span>
                <span>₹{pendingAmount.toLocaleString()} ({summary.statusBreakdown?.pending?.percentage?.toFixed(1) || 0}%)</span>
              </div>
              <Progress value={summary.statusBreakdown?.pending?.percentage || 0} className="h-1.5 bg-yellow-100" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Rejected</span>
                <span>₹{rejectedAmount.toLocaleString()} ({summary.statusBreakdown?.rejected?.percentage?.toFixed(1) || 0}%)</span>
              </div>
              <Progress value={summary.statusBreakdown?.rejected?.percentage || 0} className="h-1.5 bg-red-100" />
            </div>
          </div>
        </div>
        
        {/* Payment Mode Distribution */}
        <div className="border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Payment Mode</h4>
          <div className="space-y-2">
            {Object.entries(summary.modeBreakdown || {}).map(([mode, data]: [string, any]) => (
              data.count > 0 && (
                <div key={mode}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize">{mode.replace('_', ' ')}</span>
                    <span>{data.count} txns (₹{data.amount.toLocaleString()})</span>
                  </div>
                  <Progress value={data.percentage} className="h-1" />
                </div>
              )
            ))}
          </div>
        </div>
      </div>
      
      {/* Monthly Trend Chart Data */}
      {monthlyData.length > 0 && (
        <div className="border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Monthly Trend</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left">Month</th>
                  <th className="px-2 py-1 text-right">Amount</th>
                  <th className="px-2 py-1 text-center">Approved</th>
                  <th className="px-2 py-1 text-center">Pending</th>
                  <th className="px-2 py-1 text-center">Rejected</th>
                  <th className="px-2 py-1 text-center">Txns</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month: any) => (
                  <tr key={month.month_key} className="border-t">
                    <td className="px-2 py-1 font-medium">{month.month} {month.year}</td>
                    <td className="px-2 py-1 text-right">₹{month.total_amount.toLocaleString()}</td>
                    <td className="px-2 py-1 text-center text-green-600">{((month.approved_amount / month.total_amount) * 100).toFixed(0)}%</td>
                    <td className="px-2 py-1 text-center text-amber-600">{((month.pending_amount / month.total_amount) * 100).toFixed(0)}%</td>
                    <td className="px-2 py-1 text-center text-red-600">{((month.rejected_amount / month.total_amount) * 100).toFixed(0)}%</td>
                    <td className="px-2 py-1 text-center">{month.transaction_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Detailed Payments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-2 py-2 text-left">Date</th>
              <th className="px-2 py-2 text-left">Tenant</th>
              <th className="px-2 py-2 text-left">Property</th>
              <th className="px-2 py-2 text-left">Type</th>
              <th className="px-2 py-2 text-right">Amount</th>
              <th className="px-2 py-2 text-left">Mode</th>
              <th className="px-2 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.slice(0, 20).map((payment: any) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-2 py-1.5 whitespace-nowrap">{new Date(payment.payment_date).toLocaleDateString()}</td>
                <td className="px-2 py-1.5">
                  <div className="font-medium">{payment.tenant_name || 'N/A'}</div>
                  <div className="text-[10px] text-gray-500">{payment.tenant_phone}</div>
                </td>
                <td className="px-2 py-1.5">
                  {payment.property_name || 'N/A'}<br />
                  {payment.room_number && `Room ${payment.room_number}`}
                </td>
                <td className="px-2 py-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {payment.payment_type === 'security_deposit' ? 'Security Deposit' : payment.payment_type || 'Other'}
                  </Badge>
                </td>
                <td className="px-2 py-1.5 text-right font-semibold">{formatCurrency(payment.amount)}</td>
                <td className="px-2 py-1.5 capitalize">{payment.payment_mode || 'N/A'}</td>
                <td className="px-2 py-1.5">
                  <Badge className={
                    payment.status === 'approved' || payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    payment.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                  }>
                    {payment.status || 'N/A'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {payments.length > 20 && (
        <p className="text-center text-xs text-gray-500">Showing 20 of {payments.length} payments</p>
      )}
    </div>
  );
}

function TenantsReportDetails({ data, formatCurrency, page, pageSize, onPageChange, onPageSizeChange }: any) {
  const summary = data.summary;
  const tenants = data.tenants || [];
  const totalTenants = tenants.length;
  
  // Paginate tenants - FIXED: use the props passed in
  const startIndex = (page - 1) * pageSize;
  const paginatedTenants = tenants.slice(startIndex, startIndex + pageSize);
  
  // Calculate additional stats
  const totalExpectedRent = summary.financialSummary?.total_expected_rent || 0;
  const totalRentPaid = summary.financialSummary?.total_rent_paid || 0;
  const totalRentPending = summary.financialSummary?.total_rent_pending || 0;
  const collectionRate = summary.financialSummary?.overall_rent_collection_rate || 0;
  
  const depositTotal = summary.financialSummary?.total_security_deposit_to_collect || 0;
  const depositPaid = summary.financialSummary?.total_security_deposit_paid || 0;
  const depositPending = summary.financialSummary?.total_security_deposit_pending || 0;
  
  // Occupation breakdown for display
  const occupationEntries = Object.entries(summary.occupationBreakdown || {});
  
  return (
    <div className="space-y-4">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Total Tenants</p>
          <p className="text-2xl font-bold text-blue-700">{summary.totalTenants}</p>
          <p className="text-[10px] text-gray-500">Active: {summary.activeTenants} | Inactive: {summary.inactiveTenants}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Collection Rate</p>
          <p className="text-2xl font-bold text-green-700">{collectionRate}%</p>
          <p className="text-[10px] text-gray-500">₹{totalRentPaid.toLocaleString()} of ₹{totalExpectedRent.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Deposit Collection</p>
          <p className="text-2xl font-bold text-purple-700">{summary.financialSummary?.overall_deposit_collection_rate || 0}%</p>
          <p className="text-[10px] text-gray-500">₹{depositPaid.toLocaleString()} of ₹{depositTotal.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500">Portal Access</p>
          <p className="text-2xl font-bold text-amber-700">{summary.withPortalAccess}</p>
          <p className="text-[10px] text-gray-500">Bed Assigned: {summary.withBedAssignment}</p>
        </div>
      </div>
      
      {/* Demographics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Gender Distribution */}
        <div className="border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Gender Distribution</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Male</span>
              <span className="font-medium">{summary.maleCount} ({summary.genderDistribution?.male || 0}%)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Female</span>
              <span className="font-medium">{summary.femaleCount} ({summary.genderDistribution?.female || 0}%)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Other</span>
              <span className="font-medium">{summary.otherCount} ({summary.genderDistribution?.other || 0}%)</span>
            </div>
          </div>
        </div>
        
        {/* New Tenants */}
        <div className="border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">New Tenants</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>This Month</span>
              <span className="font-medium text-green-600">{summary.newTenantsThisMonth}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>This Year</span>
              <span className="font-medium text-blue-600">{summary.newTenantsThisYear}</span>
            </div>
          </div>
        </div>
        
        {/* Occupation Top Categories */}
        <div className="border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Top Occupations</h4>
          <div className="space-y-1">
            {occupationEntries.slice(0, 3).map(([name, count]) => (
              <div key={name} className="flex justify-between text-xs">
                <span className="truncate">{name}</span>
                <span className="font-medium">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tenant-wise Table */}
      <div className="overflow-x-auto mt-3">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-2 py-2 text-left">Tenant</th>
              <th className="px-2 py-2 text-left">Property/Room</th>
              <th className="px-2 py-2 text-center">Months</th>
              <th className="px-2 py-2 text-right">Monthly Rent</th>
              <th className="px-2 py-2 text-right">Expected</th>
              <th className="px-2 py-2 text-right">Paid</th>
              <th className="px-2 py-2 text-right">Pending</th>
              <th className="px-2 py-2 text-center">Collection %</th>
              <th className="px-2 py-2 text-right">Deposit</th>
              <th className="px-2 py-2 text-right">Deposit Paid</th>
              <th className="px-2 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedTenants.map((tenant: any) => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="px-2 py-1.5">
                  <div className="font-medium">{tenant.full_name}</div>
                  <div className="text-[10px] text-gray-500">{tenant.email || tenant.phone}</div>
                </td>
                <td className="px-2 py-1.5">
                  {tenant.property_name || 'N/A'}<br />
                  {tenant.room_number && `Room ${tenant.room_number}`}
                  {tenant.bed_number && ` / Bed ${tenant.bed_number}`}
                </td>
                <td className="px-2 py-1.5 text-center">{tenant.months_since_joining || 0}</td>
                <td className="px-2 py-1.5 text-right font-semibold">₹{tenant.monthly_rent?.toLocaleString() || 0}</td>
                <td className="px-2 py-1.5 text-right">₹{tenant.expected_rent?.toLocaleString() || 0}</td>
                <td className="px-2 py-1.5 text-right text-green-600">₹{tenant.total_rent_paid?.toLocaleString() || 0}</td>
                <td className="px-2 py-1.5 text-right text-amber-600">₹{tenant.pending_rent?.toLocaleString() || 0}</td>
                <td className="px-2 py-1.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Progress value={parseFloat(tenant.rent_collection_rate) || 0} className="h-1.5 w-12" />
                    <span className="text-[10px]">{tenant.rent_collection_rate || 0}%</span>
                  </div>
                </td>
                <td className="px-2 py-1.5 text-right">₹{tenant.security_deposit?.toLocaleString() || 0}</td>
                <td className="px-2 py-1.5 text-right text-green-600">₹{tenant.total_deposit_paid?.toLocaleString() || 0}</td>
                <td className="px-2 py-1.5 text-center">
                  <Badge className={tenant.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                    {tenant.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100">
            <tr>
              <td className="px-2 py-2 font-bold" colSpan={4}>TOTAL</td>
              <td className="px-2 py-2 text-right font-bold">₹{totalExpectedRent.toLocaleString()}</td>
              <td className="px-2 py-2 text-right font-bold text-green-700">₹{totalRentPaid.toLocaleString()}</td>
              <td className="px-2 py-2 text-right font-bold text-amber-700">₹{totalRentPending.toLocaleString()}</td>
              <td className="px-2 py-2 text-center font-bold">{collectionRate}%</td>
              <td className="px-2 py-2 text-right font-bold">₹{depositTotal.toLocaleString()}</td>
              <td className="px-2 py-2 text-right font-bold text-green-700">₹{depositPaid.toLocaleString()}</td>
              <td className="px-2 py-2 text-center"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* Add pagination - FIXED: now using props correctly */}
      <ReportPagination 
        total={totalTenants}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
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
          value={summary.totalRooms?.toString() || "0"}
          bgColor="bg-blue-50"
        />
        <SummaryCard
          title="Occupied"
          value={summary.occupiedRooms?.toString() || "0"}
          bgColor="bg-green-50"
        />
        <SummaryCard
          title="Vacant"
          value={summary.vacantRooms?.toString() || "0"}
          bgColor="bg-orange-50"
        />
        <SummaryCard
          title="Maintenance"
          value={summary.maintenanceRooms?.toString() || "0"}
          bgColor="bg-red-50"
        />
        <SummaryCard
          title="Occupancy Rate"
          value={`${summary.occupancyRate || 0}%`}
          bgColor="bg-purple-50"
        />
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
                <td className="px-2 py-1.5">{room.property_name || "N/A"}</td>
                <td className="px-2 py-1.5 font-medium">{room.room_number}</td>
                <td className="px-2 py-1.5">{room.room_type || "Standard"}</td>
                <td className="px-2 py-1.5 font-semibold">
                  {formatCurrency(room.rent_amount || 0)}
                </td>
                <td className="px-2 py-1.5">
                  <Badge
                    variant={
                      room.status === "occupied"
                        ? "default"
                        : room.status === "vacant"
                          ? "secondary"
                          : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {room.status || "N/A"}
                  </Badge>
                </td>
                <td className="px-2 py-1.5">
                  {room.occupied_beds || 0} / {room.total_bed || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.rooms?.length > 10 && (
          <p className="text-center text-xs text-gray-500 mt-2">
            Showing 10 of {data.rooms.length} rooms
          </p>
        )}
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
