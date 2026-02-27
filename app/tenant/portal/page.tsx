// app/tenant/portal/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  FileText,
  Bell,
  AlertCircle,
  Calendar,
  Building,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Wifi,
  Coffee,
  Users,
  User,
  UserX,
  Wrench,
  RefreshCw,
  Move,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import {
  getTenantToken,
  getTenantId,
  type TenantProfile,
  logoutTenant,
} from "@/lib/tenantAuthApi";
import { tenantDetailsApi } from "@/lib/tenantDetailsApi";
import {
  getMyTenantRequests,
  createTenantRequest,
   getComplaintCategories,
   getComplaintReasons,
  getLeaveTypesFromMasters,
  type TenantRequest,
  type ComplaintCategory,
  type ComplaintReason,
  type LeaveType,
} from "@/lib/tenantRequestsApi";
import {
  getTenantNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "@/lib/tenantNotificationsApi";

// ─── Types ────────────────────────────────────────────────────────────────────
// Assets
import roomacLogo from "@/app/src/assets/images/roomaclogo.webp";
import { useAuth } from "@/context/authContext";
import router from "@/src/compat/next-router";
import { getProperty } from "@/lib/propertyApi";

interface DashboardStats {
  totalPaid: number;
  totalPending: number;
  pendingCount: number;
  openComplaints: number;
  unreadNotifications: number;
  daysUntilRentDue: number;
  monthlyRent: number;
  occupancyDays: number;
  nextDueDate: string;
  urgentComplaints: number;
  inProgressComplaints: number;
}

interface Payment {
  id: string;
  amount: number;
  description: string;
  payment_date: string;
  payment_method: string;
  status: "completed" | "pending" | "failed";
  due_date?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PAYMENTS: Payment[] = [
  {
    id: "1",
    amount: 12000,
    description: "Monthly Rent - February 2026",
    payment_date: "2026-02-05T10:30:00Z",
    payment_method: "Credit Card",
    status: "completed",
    due_date: "2026-02-10",
  },
  {
    id: "2",
    amount: 12000,
    description: "Monthly Rent - January 2026",
    payment_date: "2026-01-05T09:15:00Z",
    payment_method: "UPI",
    status: "completed",
    due_date: "2026-01-10",
  },
  {
    id: "3",
    amount: 5000,
    description: "Maintenance Deposit",
    payment_date: "2025-12-15T14:20:00Z",
    payment_method: "Bank Transfer",
    status: "completed",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TenantPortalPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Active tab — hash se decide hoga (#payments, #notifications)
  const getTabFromHash = () => {
    const hash = location.hash.replace("#", "");
    if (["dashboard", "payments", "notifications"].includes(hash)) return hash;
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash());

  // Hash change hone par tab update karo
  useEffect(() => {
    setActiveTab(getTabFromHash());
  }, [location.hash]);

  // Tab change hone par URL hash update karo
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/tenant/portal#${tab}`, { replace: true });
  };

  // Data state
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [complaintCategories, setComplaintCategories] = useState<ComplaintCategory[]>([]);
  const [complaintReasons, setComplaintReasons] = useState<ComplaintReason[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Dialogs
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Stats
  const [stats, setStats] = useState<DashboardStats>({
    totalPaid: 24500,
    totalPending: 12000,
    pendingCount: 1,
    openComplaints: 2,
    unreadNotifications: 0,
    daysUntilRentDue: 7,
    monthlyRent: 12000,
    occupancyDays: 245,
    nextDueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    urgentComplaints: 1,
    inProgressComplaints: 1,
  });

  // Forms
  const { logout } = useAuth()
  // Form states
  const [newComplaint, setNewComplaint] = useState({
    title: "", description: "", category: "", reason: "", priority: "medium",
  });
  const [leaveRequest, setLeaveRequest] = useState({
    leave_type: "", leave_start_date: "", leave_end_date: "",
    reason: "", contact_address: "", emergency_contact: "",
  });
  const [newPayment, setNewPayment] = useState({
    amount: "", description: "", payment_method: "card",
  });

  // Loading timeout
  useEffect(() => {
    const id = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
        toast.error("Loading is taking too long. Please refresh.");
      }
    }, 15000);
    return () => clearTimeout(id);
  }, [loading]);

  // Fetch notifications
// Fetch notifications
const fetchNotifications = useCallback(async (showLoading = false) => {
  try {
    if (showLoading) setLoadingNotifications(true);
    const [notifs, count] = await Promise.all([
      getTenantNotifications(50), // Fetch up to 50 notifications
      getUnreadNotificationCount()
    ]);
    
    // Format notifications to match component expectations - INCLUDE ALL TYPES
    const formattedNotifs = notifs.map(n => ({
      ...n,
      type: n.notification_type as "payment" | "complaint" | "maintenance" | "leave" | "change bed" | "vacate bed" | "account deletion" | "event" | "document" | "general"
    }));
    
    console.log('📋 Fetched notifications:', formattedNotifs); // Add debug log
    setNotifications(formattedNotifs);
    setUnreadCount(count);
    setStats(prev => ({ ...prev, unreadNotifications: count }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    if (showLoading) setLoadingNotifications(false);
  }
}, []);

  // Fetch data
// Fetch data
// In app/tenant/portal/page.tsx, update the fetchAllData function:

const fetchAllData = useCallback(async () => {
  setLoading(true);
  setLoadingTimeout(false);
  try {
    const token = getTenantToken();
    const tenantId = getTenantId();
    if (!token || !tenantId) {
      router.push('/login');
      return;
    }

    const [profileRes, requestsRes, categoriesRes, leaveTypesRes] =
      await Promise.allSettled([
        tenantDetailsApi.loadProfile(),
        getMyTenantRequests(),
        getComplaintCategories(),
        getLeaveTypesFromMasters(),
      ]);

    if (profileRes.status === "fulfilled" && profileRes.value?.success) {
      const d = profileRes.value.data;
      setTenant(d);

      // If the tenant has a property_id, fetch the property details to get manager info
      if (d.property_id) {
        try {
          const propertyRes = await getProperty(d.property_id);
          if (propertyRes.success && propertyRes.data) {
            // Update tenant with property manager info from property
            setTenant(prev => ({
              ...prev!,
              property_manager_name: propertyRes.data.property_manager_name,
              property_manager_phone: propertyRes.data.property_manager_phone,
              property_manager_email: propertyRes.data.property_manager_email,
              // If the staff has salutation, we might need to fetch staff details separately
              // For now, we'll just use the name as is
            }));
          }
        } catch (error) {
          console.error('Error fetching property details:', error);
        }
      }

      const totalPaid = d.payments?.filter((p: any) => p.status === "completed")
        .reduce((s: number, p: any) => s + p.amount, 0) ?? 24500;
      const totalPending = d.payments?.filter((p: any) => p.status === "pending")
        .reduce((s: number, p: any) => s + p.amount, 0) ?? 12000;
      const pendingCount = d.payments?.filter((p: any) => p.status === "pending").length ?? 1;

      let daysUntilRentDue = 7;
      let nextDueDate = new Date(Date.now() + 7 * 86400000).toISOString();
      if (d.check_in_date) {
        const dueDay = new Date(d.check_in_date).getDate();
        const today = new Date();
        let nextDue = new Date(today.getFullYear(), today.getMonth(), dueDay);
        if (today.getDate() > dueDay)
          nextDue = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
        daysUntilRentDue = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 3600 * 24));
        nextDueDate = nextDue.toISOString();
      }

      const occupancyDays = d.check_in_date
        ? Math.ceil((Date.now() - new Date(d.check_in_date).getTime()) / (1000 * 3600 * 24))
        : 245;

      setStats(prev => ({
        ...prev,
        totalPaid, totalPending, pendingCount,
        daysUntilRentDue,
        monthlyRent: d.monthly_rent ?? 12000,
        occupancyDays, nextDueDate,
      }));
    }

    if (requestsRes.status === "fulfilled" && requestsRes.value) {
      const data: TenantRequest[] = requestsRes.value;
      const c = data.filter(r => r.request_type === "complaint" || r.request_type === "maintenance");
      setStats(prev => ({
        ...prev,
        openComplaints: c.filter(x => x.status === "pending" || x.status === "in_progress").length,
        urgentComplaints: c.filter(x => x.priority === "urgent" && x.status !== "resolved").length,
        inProgressComplaints: c.filter(x => x.status === "in_progress").length,
      }));
    }

    if (categoriesRes.status === "fulfilled" && categoriesRes.value)
      setComplaintCategories(categoriesRes.value);
    if (leaveTypesRes.status === "fulfilled" && leaveTypesRes.value)
      setLeaveTypes(leaveTypesRes.value);

    // Fetch notifications separately
    fetchNotifications(false);
    
    setPayments(MOCK_PAYMENTS);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    toast.error("Failed to load dashboard data");
    setPayments(MOCK_PAYMENTS);
  } finally {
    setLoading(false);
  }
}, [navigate, fetchNotifications]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // Set up polling for real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Load notifications when tab changes to notifications
  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications(true);
    }
  }, [activeTab, fetchNotifications]);

  useEffect(() => {
    if (selectedCategory)
      getComplaintReasons(parseInt(selectedCategory))
        .then(setComplaintReasons)
        .catch(console.error);
  }, [selectedCategory]);

  const handleLogout = useCallback(async () => {
    await logoutTenant();
    localStorage.clear()
    router.push('/login');
    logout()
  }, []);

  const handleSubmitComplaint = useCallback(async () => {
    if (!newComplaint.title || !newComplaint.description || !newComplaint.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createTenantRequest({
        request_type: "complaint",
        title: newComplaint.title,
        description: newComplaint.description,
        priority: newComplaint.priority as any,
        complaint_data: {
          category_master_type_id: parseInt(newComplaint.category),
          reason_master_value_id: newComplaint.reason ? parseInt(newComplaint.reason) : undefined,
        },
      });
      toast.success("Complaint submitted successfully");
      setShowComplaintDialog(false);
      setNewComplaint({ title: "", description: "", category: "", reason: "", priority: "medium" });
      fetchAllData();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit complaint");
    }
  }, [newComplaint, fetchAllData]);

  const handleSubmitLeaveRequest = useCallback(async () => {
    if (!leaveRequest.leave_type || !leaveRequest.leave_start_date || !leaveRequest.reason) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createTenantRequest({
        request_type: "leave",
        title: `Leave Request - ${leaveRequest.leave_type}`,
        description: leaveRequest.reason,
        priority: "medium",
        leave_data: {
          leave_type: leaveRequest.leave_type,
          leave_start_date: leaveRequest.leave_start_date,
          leave_end_date: leaveRequest.leave_end_date || leaveRequest.leave_start_date,
          total_days: leaveRequest.leave_end_date
            ? Math.ceil((new Date(leaveRequest.leave_end_date).getTime() - new Date(leaveRequest.leave_start_date).getTime()) / (1000 * 3600 * 24)) + 1
            : 1,
          contact_address_during_leave: leaveRequest.contact_address,
          emergency_contact_number: leaveRequest.emergency_contact,
        },
      });
      toast.success("Leave request submitted successfully");
      setShowLeaveDialog(false);
      setLeaveRequest({ leave_type: "", leave_start_date: "", leave_end_date: "", reason: "", contact_address: "", emergency_contact: "" });
      fetchAllData();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit leave request");
    }
  }, [leaveRequest, fetchAllData]);

  const handleSubmitPayment = useCallback(() => {
    if (!newPayment.amount || !newPayment.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Payment initiated successfully");
    setShowPaymentDialog(false);
    const record: Payment = {
      id: Date.now().toString(),
      amount: parseFloat(newPayment.amount),
      description: newPayment.description,
      payment_date: new Date().toISOString(),
      payment_method: newPayment.payment_method === "card" ? "Credit Card" : "UPI",
      status: "pending",
    };
    setPayments(prev => [record, ...prev]);
    setNewPayment({ amount: "", description: "", payment_method: "card" });
  }, [newPayment]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      const marked = await markAllNotificationsAsRead();
      if (marked > 0) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        setStats(prev => ({ ...prev, unreadNotifications: 0 }));
        toast.success(`${marked} notifications marked as read`);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error("Failed to mark notifications as read");
    }
  }, []);

  const handleNotificationClick = useCallback(async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        setStats(prev => ({ ...prev, unreadNotifications: Math.max(0, prev.unreadNotifications - 1) }));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on notification type
    const type = notification.notification_type || notification.type;
    if (type === "complaint") {
    navigate("/tenant/requests");
  } else if (type === "maintenance") { // Add this
    navigate("/tenant/requests");
  } else if (type === "leave") {
    navigate("/tenant/requests");
  } else if (type === "change bed") {
    navigate("/tenant/requests");
  } else if (type === "vacate bed") {
    navigate("/tenant/requests");
  } else if(type === "account deletion") {
    navigate("/tenant/profile");
  } else if (type === "payment") {
    handleTabChange("payments");
  } else if (type === "document") {
    navigate("/tenant/documents");
  }
  }, [navigate]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment": return <CreditCard className="h-4 w-4 text-blue-600" />;
      case "complaint": return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "maintenance": return <Wrench className="h-4 w-4 text-purple-600" />;
      case "leave": return <Users className="h-4 w-4 text-green-600" />;
      case "change_bed": return <Move className="h-4 w-4 text-teal-600" />;
      case "vacate bed": return <MapPin className="h-4 w-4 text-red-600" />;
      case "account deletion": return <UserX className="h-4 w-4 text-gray-600" />;
      case "document": return <FileText className="h-4 w-4 text-purple-600" />;
      case "event": return <Calendar className="h-4 w-4 text-green-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0149ab] border-t-transparent" />
          <p className="mt-4 text-slate-600">Loading your dashboard...</p>
          {loadingTimeout && (
            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-4">
              Refresh Page
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6">
      {/* Welcome Banner */}
    {/* Welcome Banner - Compact & Moved Up */}
{/* Welcome Banner - Compact & Moved Up */}
<div className="mb-4 bg-white border border-slate-200 rounded-lg p-3 text-slate-900 shadow-sm">
  <h1 className="text-xl font-semibold text-slate-900">
    Welcome back,{" "}
    <span className="text-[#0149ab]">
      {tenant?.salutation
        ? `${tenant.salutation} ${tenant?.full_name?.split(" ")[0]}`
        : tenant?.full_name?.split(" ")[0] || "Tenant"}!👋
    </span>
  </h1>
  <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5 mt-0.5">
    <Building className="h-3.5 w-3.5 shrink-0 text-slate-400" />
    <span className="truncate">
      {tenant?.property_name || "Roomac Heights"} · Room {tenant?.room_number || "204"} · Bed {tenant?.bed_number || "1"}
    </span>
  </p>
</div>

     
      {/* ── Stats Cards ── */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

  {/* Rent Due Card — Blue */}
  <Card className="border border-blue-200/50 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-all">
    <CardContent className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600">Rent Due</p>
            <div className="flex items-baseline gap-1">
              <p className="text-lg font-bold text-slate-900">{stats.daysUntilRentDue}</p>
              <span className="text-xs font-medium text-slate-500">days</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Amount</p>
          <p className="text-base font-bold text-blue-700">
            ₹{stats.monthlyRent.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Today</span>
          <span className="font-medium">
            {new Date(stats.nextDueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-1.5 transition-all duration-500"
            style={{ width: `${Math.min((stats.daysUntilRentDue / 30) * 100, 100)}%` }}
          />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Open Issues Card — Amber/Orange */}
  <Card className="border border-orange-200/50 bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-all">
    <CardContent className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600">Open Issues</p>
            <p className="text-lg font-bold text-slate-900">{stats.openComplaints}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Urgent</p>
          <Badge variant="destructive" className="text-xs px-2 py-0.5">
            {stats.urgentComplaints}
          </Badge>
        </div>
      </div>
      <div className="mt-3 flex gap-1">
        <div className="flex-1 bg-amber-100 rounded-lg p-1.5 text-center">
          <p className="text-xs font-semibold text-amber-900">In Progress</p>
          <p className="text-xs text-amber-700">{stats.inProgressComplaints}</p>
        </div>
        <div className="flex-1 bg-orange-100 rounded-lg p-1.5 text-center">
          <p className="text-xs font-semibold text-orange-900">Pending</p>
          <p className="text-xs text-orange-700">
            {stats.openComplaints - stats.inProgressComplaints}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Pending Payments Card — Emerald */}
  <Card className="border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white shadow-sm hover:shadow-md transition-all">
    <CardContent className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600">Pending</p>
            <p className="text-lg font-bold text-slate-900">{stats.pendingCount}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Total</p>
          <p className="text-base font-bold text-emerald-700">
            {formatCurrency(stats.totalPending)}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <Button
          size="sm"
          className="w-full bg-emerald-600 hover:bg-emerald-700 h-7 text-xs"
          onClick={() => { handleTabChange("payments"); setShowPaymentDialog(true); }}
        >
          <CreditCard className="h-3 w-3 mr-1.5" />
          Pay Now
        </Button>
      </div>
    </CardContent>
  </Card>

  {/* Notifications Card — Purple */}
  <Card className="border border-purple-200/50 bg-gradient-to-br from-purple-50 to-white shadow-sm hover:shadow-md transition-all">
    <CardContent className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
            <Bell className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600">Notifications</p>
            <p className="text-lg font-bold text-slate-900">{stats.unreadNotifications}</p>
          </div>
        </div>
        {stats.unreadNotifications > 0 && (
          <Badge className="bg-purple-500 hover:bg-purple-600 text-xs">New</Badge>
        )}
      </div>
      <div className="mt-3">
        <Button
          size="sm"
          variant="outline"
          className="w-full h-7 text-xs border-purple-200 hover:bg-purple-50"
          onClick={() => handleTabChange("notifications")}
        >
          View All
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </CardContent>
  </Card>

</div>


      {/* Action Buttons - Small height and width as requested */}
<div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
  <Button
    variant="outline"
    className="h-auto py-2 px-1 flex flex-col items-center justify-center gap-0.5 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0149ab] shadow-sm rounded-lg"
    onClick={() => setShowComplaintDialog(true)}
  >
    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
    <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">Raise Complaint</span>
    <span className="text-[8px] sm:text-[10px] text-slate-400 text-center leading-tight hidden sm:block">Report any issues</span>
  </Button>

  <Button
    variant="outline"
    className="h-auto py-2 px-1 flex flex-col items-center justify-center gap-0.5 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0149ab] shadow-sm rounded-lg"
    onClick={() => setShowLeaveDialog(true)}
  >
    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
    <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">Request Leave</span>
    <span className="text-[8px] sm:text-[10px] text-slate-400 text-center leading-tight hidden sm:block">Vacation or early leave</span>
  </Button>

  <Button
    variant="outline"
    className="h-auto py-2 px-1 flex flex-col items-center justify-center gap-0.5 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0149ab] shadow-sm rounded-lg"
    onClick={() => navigate("/tenant/documents")}
  >
    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
    <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">View Agreement</span>
    <span className="text-[8px] sm:text-[10px] text-slate-400 text-center leading-tight hidden sm:block">Rental contract</span>
  </Button>

  <Button
    variant="outline"
    className="h-auto py-2 px-1 flex flex-col items-center justify-center gap-0.5 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0149ab] shadow-sm rounded-lg"
    onClick={() => {
      handleTabChange("payments");
      setShowPaymentDialog(true);
    }}
  >
    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
    <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">Download Invoice</span>
    <span className="text-[8px] sm:text-[10px] text-slate-400 text-center leading-tight hidden sm:block">Payment receipts</span>
  </Button>
</div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="bg-white border border-slate-200 p-1 rounded-lg w-full grid grid-cols-3">
              <TabsTrigger value="dashboard"
                className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white data-[state=inactive]:text-slate-600 transition-all text-xs sm:text-sm py-2 sm:py-2.5">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="payments"
                className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white data-[state=inactive]:text-slate-600 transition-all text-xs sm:text-sm py-2 sm:py-2.5">
                Payments
              </TabsTrigger>
              <TabsTrigger value="notifications"
                className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white data-[state=inactive]:text-slate-600 transition-all text-xs sm:text-sm py-2 sm:py-2.5">
                <span className="flex items-center gap-1">
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* ── Dashboard Tab ─────────────────────────────────────── */}
            <TabsContent value="dashboard" className="space-y-6 mt-4">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm sm:text-base font-semibold">Recent Payments</CardTitle>
                    <Button variant="ghost" size="sm"
                      className="text-[#0149ab] hover:bg-blue-50 text-xs sm:text-sm"
                      onClick={() => handleTabChange("payments")}>
                      View All <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {payments.length > 0 ? (
                    <div className="space-y-3">
                      {payments.slice(0, 3).map((p) => (
                        <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg gap-2">
                          <div>
                            <p className="font-medium text-sm text-slate-900">{p.description}</p>
                            <p className="text-xs text-slate-500 mt-1">{formatDate(p.payment_date)} · {p.payment_method}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-sm text-slate-900">{formatCurrency(p.amount)}</p>
                            <Badge variant="outline" className={`text-xs ${p.status === "completed" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                              {p.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No payment history</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <CardTitle className="text-sm sm:text-base font-semibold">Amenities History</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="space-y-2 sm:space-y-3">
                    {[
                      { icon: Wifi, label: "WiFi - Last used: Today" },
                      { icon: Coffee, label: "Laundry - Last used: 2 days ago" },
                      { icon: Users, label: "Gym - Last used: 5 days ago" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
                        <span className="text-xs sm:text-sm font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Payments Tab ──────────────────────────────────────── */}
            <TabsContent value="payments" className="space-y-6 mt-4">
              <Button className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-10 sm:h-12" onClick={() => setShowPaymentDialog(true)}>
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Make a Payment
              </Button>
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-base sm:text-lg font-semibold">Payment History</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {payments.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {payments.map((p) => (
                        <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg gap-2">
                          <div>
                            <p className="font-medium text-sm text-slate-900">{p.description}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500">{formatDate(p.payment_date)}</span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-500">{p.payment_method}</span>
                              {p.due_date && (<><span className="text-xs text-slate-400">•</span><span className="text-xs text-slate-500">Due: {formatDate(p.due_date)}</span></>)}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-sm text-slate-900">{formatCurrency(p.amount)}</p>
                            <Badge variant="outline" className={`text-xs ${p.status === "completed" ? "bg-green-50 text-green-700 border-green-200" : p.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                              {p.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No payment history</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Notifications Tab ─────────────────────────────────── */}
            <TabsContent value="notifications" className="space-y-6 mt-4">
              <Card className="border border-slate-200 shadow-sm">
                {/* In the notifications tab header */}
<CardHeader className="px-4 sm:px-6">
  <div className="flex items-center justify-between">
    <CardTitle className="text-base sm:text-lg font-semibold">All Notifications</CardTitle>
    <div className="flex items-center gap-2">
      {unreadCount > 0 && (
        <Button variant="ghost" size="sm" className="text-[#0149ab] hover:bg-blue-50 text-xs sm:text-sm" onClick={handleMarkAllRead}>
          Mark all as read
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={() => fetchNotifications(true)} className="text-xs">
        <RefreshCw className="h-3 w-3 mr-1" />
        Refresh
      </Button>
    </div>
  </div>
</CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {loadingNotifications ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0149ab] border-t-transparent" />
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                            !n.is_read ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"
                          }`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                              n.is_read ? "bg-slate-100" : "bg-blue-100"
                            }`}>
                              {getNotificationIcon(n.notification_type || n.type || 'general')}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <p className="font-medium text-sm text-slate-900">{n.title}</p>
                                {!n.is_read && <div className="h-2 w-2 bg-blue-600 rounded-full mt-1" />}
                              </div>
                              <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-slate-400">
                                  {formatDateTime(n.created_at)}
                                </p>
                                {n.related_entity_type === 'complaint' && (
                                  <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200">
                                    Complaint #{n.related_entity_id}
                                  </Badge>
                                )}
                                {n.related_entity_type === 'maintenance' && (
  <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
    Maintenance #{n.related_entity_id}
  </Badge>
)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No notifications</p>
                      <p className="text-xs text-slate-400 mt-1">
                        When you have notifications, they'll appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
        
          {/* Contract Details */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2 sm:space-y-3">
                {[
                  { label: "Check-in", value: formatDate(tenant?.check_in_date || "2024-01-15") },
                  { label: "Lock-in", value: `${tenant?.lockin_period_months || "6"} months` },
                  { label: "Notice", value: `${tenant?.notice_period_days || "30"} days` },
                  { label: "Amenities", value: tenant?.amenities || "WiFi, AC, Laundry, Food, Gym" },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} className={`flex justify-between py-2 ${i < arr.length - 1 ? "border-b border-slate-100" : ""}`}>
                    <span className="text-xs sm:text-sm text-slate-500">{label}</span>
                    <span className="text-xs sm:text-sm font-medium text-slate-900 text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

{/* Property Manager */}
<Card className="border border-slate-200 shadow-sm">
  <CardHeader className="pb-2 px-4 sm:px-6">
    <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
      <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
      Property Manager
    </CardTitle>
  </CardHeader>
  <CardContent className="px-4 sm:px-6">
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#0149ab]/10 flex items-center justify-center">
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
        </div>
        
        <div>
          <p className="font-medium text-sm text-slate-900">
            {tenant?.property_manager_name || "Neha Sharma"}
          </p>
          <p className="text-xs text-slate-500">
            {tenant?.property_manager_role || "Property Manager"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-[#0149ab] shrink-0" />
          <span className="truncate">{tenant?.property_manager_phone || "8765432190"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-[#0149ab] shrink-0" />
          <span className="truncate">
            {tenant?.property_manager_email || "manager@roomac.com"}
          </span>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
        </div>
      </div>

      {/* ── Complaint Dialog ────────────────────────────────────────────── */}
      <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
        <DialogContent className="sm:max-w-md w-[95%] mx-auto">
          <DialogHeader><DialogTitle className="text-lg sm:text-xl">Raise a Complaint</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs sm:text-sm font-medium">Title *</Label>
              <Input value={newComplaint.title} onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })} placeholder="Brief title of the issue" className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Category *</Label>
              <Select value={newComplaint.category} onValueChange={(v) => { setNewComplaint({ ...newComplaint, category: v, reason: "" }); setSelectedCategory(v); }}>
                <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {complaintCategories.length > 0 ? complaintCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  )) : (<><SelectItem value="1">Maintenance</SelectItem><SelectItem value="2">Cleaning</SelectItem><SelectItem value="3">Noise</SelectItem><SelectItem value="4">Security</SelectItem><SelectItem value="5">Other</SelectItem></>)}
                </SelectContent>
              </Select>
            </div>
            {complaintReasons.length > 0 && (
              <div>
                <Label className="text-xs sm:text-sm font-medium">Reason</Label>
                <Select value={newComplaint.reason} onValueChange={(v) => setNewComplaint({ ...newComplaint, reason: v })}>
                  <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Select reason (optional)" /></SelectTrigger>
                  <SelectContent>{complaintReasons.map((r) => <SelectItem key={r.id} value={r.id.toString()}>{r.value}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-xs sm:text-sm font-medium">Priority</Label>
              <Select value={newComplaint.priority} onValueChange={(v) => setNewComplaint({ ...newComplaint, priority: v })}>
                <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Description *</Label>
              <Textarea value={newComplaint.description} onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })} rows={4} placeholder="Describe the issue in detail" className="mt-1 text-sm" />
            </div>
            <Button onClick={handleSubmitComplaint} className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-10 sm:h-11">Submit Complaint</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Leave Dialog ────────────────────────────────────────────────── */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="sm:max-w-md w-[95%] mx-auto">
          <DialogHeader><DialogTitle className="text-lg sm:text-xl">Request Leave</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            {tenant?.lockin_period_months && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs font-medium text-yellow-800">Lock-in Period Information</p>
                <p className="text-xs text-yellow-700 mt-1">Lock-in: {tenant.lockin_period_months} months</p>
              </div>
            )}
            <div>
              <Label className="text-xs sm:text-sm font-medium">Leave Type *</Label>
              <Select value={leaveRequest.leave_type} onValueChange={(v) => setLeaveRequest({ ...leaveRequest, leave_type: v })}>
                <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Select leave type" /></SelectTrigger>
                <SelectContent>
                  {leaveTypes.length > 0 ? leaveTypes.map((t) => <SelectItem key={t.id} value={t.value}>{t.value}</SelectItem>)
                    : (<><SelectItem value="vacation">Vacation</SelectItem><SelectItem value="sick">Sick Leave</SelectItem><SelectItem value="emergency">Emergency</SelectItem><SelectItem value="personal">Personal</SelectItem></>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs sm:text-sm font-medium">Start Date *</Label>
                <Input type="date" min={new Date().toISOString().split("T")[0]} value={leaveRequest.leave_start_date} onChange={(e) => setLeaveRequest({ ...leaveRequest, leave_start_date: e.target.value })} className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium">End Date</Label>
                <Input type="date" min={leaveRequest.leave_start_date || new Date().toISOString().split("T")[0]} value={leaveRequest.leave_end_date} onChange={(e) => setLeaveRequest({ ...leaveRequest, leave_end_date: e.target.value })} className="mt-1 text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Reason *</Label>
              <Textarea value={leaveRequest.reason} onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })} rows={3} placeholder="Please provide reason for leave" className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Contact Address (During Leave)</Label>
              <Input value={leaveRequest.contact_address} onChange={(e) => setLeaveRequest({ ...leaveRequest, contact_address: e.target.value })} placeholder="Where can we reach you?" className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Emergency Contact</Label>
              <Input value={leaveRequest.emergency_contact} onChange={(e) => setLeaveRequest({ ...leaveRequest, emergency_contact: e.target.value })} placeholder="Emergency contact number" className="mt-1 text-sm" />
            </div>
            <Button onClick={handleSubmitLeaveRequest} className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-10 sm:h-11">Submit Request</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Payment Dialog ───────────────────────────────────────────────── */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md w-[95%] mx-auto">
          <DialogHeader><DialogTitle className="text-lg sm:text-xl">Make a Payment</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs sm:text-sm font-medium">Amount (₹) *</Label>
              <Input type="number" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} placeholder="Enter amount" className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Description *</Label>
              <Input value={newPayment.description} onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })} placeholder="e.g., Monthly Rent - March 2026" className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Payment Method</Label>
              <Select value={newPayment.payment_method} onValueChange={(v) => setNewPayment({ ...newPayment, payment_method: v })}>
                <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="card">Credit/Debit Card</SelectItem><SelectItem value="upi">UPI</SelectItem><SelectItem value="netbanking">Net Banking</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800"><span className="font-medium">Note:</span> A late fee of ₹100 per day will be charged after the due date.</p>
            </div>
            <Button onClick={handleSubmitPayment} className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-10 sm:h-11">Proceed to Payment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}