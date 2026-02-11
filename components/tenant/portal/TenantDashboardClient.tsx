'use client';

import { useState, useCallback, memo, useEffect } from "react";
import { useRouter, usePathname } from "@/src/compat/next-navigation";
import { toast } from "sonner";
import TenantHeader from "./Header";
import TenantSidebar from "./Sidebar";
import DashboardContent from "./DashboardTab";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart3,
  CreditCard,
  AlertCircle,
  Bell,
  AlertTriangle,
  Calendar,
  TrendingUp,
  FileText,
  Receipt,
  Home,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Sun,
  Moon,
  Plus,
  Eye,
  Download,
  Clock,
  CheckCircle,
  FileCheck,
  FolderOpen,
  MessageSquare,
  User,
  HelpCircle,
  Zap,
  Wifi,
  Coffee,
  Shield,
  Users,
  ParkingCircle,
  Dumbbell,
  Tv,
  Microwave,
  Refrigerator,
  Armchair,
  Lamp,
  Fan,
  Bed,
  Thermometer,
} from "lucide-react";

interface TenantDashboardClientProps {
  initialData: {
    tenant: any;
    booking: any;
    payments: any[];
    complaints: any[];
    stats: any;
    notifications: any[];
    leaveRequests: any[];
  };
}

function TenantDashboardClient({ initialData }: TenantDashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [tenant, setTenant] = useState<any>(initialData.tenant);
  const [booking, setBooking] = useState<any>(initialData.booking);
  const [payments, setPayments] = useState<any[]>(initialData.payments);
  const [complaints, setComplaints] = useState<any[]>(initialData.complaints);
  const [notifications, setNotifications] = useState<any[]>(initialData.notifications);
  const [leaveRequests, setLeaveRequests] = useState<any[]>(initialData.leaveRequests);
  const [loading, setLoading] = useState(false);
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: "",
    category: "maintenance",
    priority: "medium",
  });
  const [leaveRequest, setLeaveRequest] = useState({
    requested_leave_date: "",
    reason: "",
  });
  const [stats, setStats] = useState(initialData.stats);

  // Professional metrics - EXACT SAME
  const [metrics] = useState([
    { 
      label: "Monthly Spending", 
      value: "₹45,000", 
      change: "+12%", 
      icon: TrendingUp, 
      color: "text-green-600", 
      bgColor: "bg-green-50",
      trend: "positive"
    },
    { 
      label: "Avg Response Time", 
      value: "4.2h", 
      change: "-18%", 
      icon: Clock, 
      color: "text-blue-600", 
      bgColor: "bg-blue-50",
      trend: "positive"
    },
    { 
      label: "Satisfaction Score", 
      value: "4.8/5", 
      change: "+2%", 
      icon: AlertTriangle, 
      color: "text-yellow-600", 
      bgColor: "bg-yellow-50",
      trend: "positive"
    },
    { 
      label: "Occupancy Rate", 
      value: "92%", 
      change: "+5%", 
      icon: TrendingUp, 
      color: "text-purple-600", 
      bgColor: "bg-purple-50",
      trend: "positive"
    },
  ]);

  // Complete PG amenities - EXACT SAME
  const pgAmenities = [
    { icon: <Wifi className="h-4 w-4" />, name: "High-Speed WiFi", available: true, status: "500 Mbps", uptime: "99.9%" },
    { icon: <Coffee className="h-4 w-4" />, name: "Daily Mess", available: true, status: "3 Meals", rating: "4.5/5" },
    { icon: <Shield className="h-4 w-4" />, name: "24/7 Security", available: true, status: "Guarded", cameras: "8" },
    { icon: <Users className="h-4 w-4" />, name: "Laundry Service", available: true, status: "Weekly", next: "Tomorrow" },
    { icon: <ParkingCircle className="h-4 w-4" />, name: "Parking", available: true, status: "Available", slots: "4/6" },
    { icon: <Dumbbell className="h-4 w-4" />, name: "Gym", available: true, status: "24/7 Access", equipment: "Full" },
    { icon: <Tv className="h-4 w-4" />, name: "TV Lounge", available: true, status: "HD TV", channels: "150+" },
    { icon: <Microwave className="h-4 w-4" />, name: "Kitchen", available: true, status: "Fully Equipped", type: "Common" },
  ];

  // Room amenities - EXACT SAME
  const roomAmenities = [
    { icon: <Bed className="h-4 w-4" />, name: "Bed", available: true, status: "Queen Size" },
    { icon: <Refrigerator className="h-4 w-4" />, name: "Refrigerator", available: true, status: "Personal" },
    { icon: <Armchair className="h-4 w-4" />, name: "Study Table", available: true, status: "With Chair" },
    { icon: <Lamp className="h-4 w-4" />, name: "LED Lights", available: true, status: "Dimmable" },
    { icon: <Fan className="h-4 w-4" />, name: "Ceiling Fan", available: true, status: "With Remote" },
    { icon: <Thermometer className="h-4 w-4" />, name: "AC", available: true, status: "1.5 Ton" },
  ];

  // Navigation items with routes - EXACT SAME
  const navigationItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: Home, 
      active: true, 
      badge: null,
      href: "/tenant/dashboard"
    },
    { 
      id: "payments", 
      label: "Payments", 
      icon: CreditCard, 
      badge: stats.pendingPayments > 0 ? `${stats.pendingPayments}` : null,
      tab: "payments"
    },
    { 
      id: "documents", 
      label: "Documents", 
      icon: FileCheck, 
      badge: null,
      href: "/tenant/documents"
    },
    { 
      id: "complaints", 
      label: "Complaints", 
      icon: AlertCircle, 
      badge: stats.openComplaints > 0 ? `${stats.openComplaints}` : null,
      tab: "complaints"
    },
    { 
      id: "my-documents", 
      label: "My Documents", 
      icon: FolderOpen, 
      badge: null,
      href: "/tenant/my-documents"
    },
    { 
      id: "requests", 
      label: "Requests", 
      icon: MessageSquare, 
      badge: null,
      href: "/tenant/requests"
    },
    { 
      id: "notifications", 
      label: "Notifications", 
      icon: Bell, 
      badge: stats.unreadNotifications > 0 ? `${stats.unreadNotifications}` : null,
      tab: "notifications"
    },
    { 
      id: "profile", 
      label: "Profile", 
      icon: User, 
      badge: null,
      href: "/tenant/profile"
    },
    { 
      id: "support", 
      label: "Support", 
      icon: HelpCircle, 
      badge: null,
      href: "/tenant/support"
    },
  ];

  // Recent activities - EXACT SAME
  const recentActivities = [
    { id: 1, type: "payment", title: "Rent Payment", description: "January 2024 rent", amount: "₹15,000", status: "completed", time: "2 hours ago", icon: CreditCard, color: "text-green-600", bgColor: "bg-green-50" },
    { id: 2, type: "complaint", title: "AC Repair", description: "Bedroom AC not cooling", status: "in_progress", time: "1 day ago", icon: AlertCircle, color: "text-orange-600", bgColor: "bg-orange-50" },
    { id: 3, type: "document", title: "Agreement Renewal", description: "Annual agreement signed", status: "completed", time: "3 days ago", icon: FileCheck, color: "text-blue-600", bgColor: "bg-blue-50" },
    { id: 4, type: "maintenance", title: "Room Cleaning", description: "Monthly deep cleaning", status: "scheduled", time: "5 days ago", icon: Settings, color: "text-yellow-600", bgColor: "bg-yellow-50" },
    { id: 5, type: "payment", title: "Maintenance Fee", description: "Monthly maintenance", amount: "₹1,500", status: "pending", time: "6 days ago", icon: CreditCard, color: "text-red-600", bgColor: "bg-red-50" },
  ];

  // Sample payments data - EXACT SAME
  const samplePayments = [
    { id: 1, payment_for: "Rent - January 2024", amount: 15000, payment_date: "2024-01-01", payment_status: "completed" },
    { id: 2, payment_for: "Maintenance - January 2024", amount: 1500, payment_date: "2024-01-05", payment_status: "completed" },
    { id: 3, payment_for: "Rent - February 2024", amount: 15000, payment_date: "2024-02-01", payment_status: "pending" },
    { id: 4, payment_for: "Electricity Bill - January", amount: 1200, payment_date: "2024-01-15", payment_status: "completed" },
    { id: 5, payment_for: "Security Deposit", amount: 30000, payment_date: "2023-12-01", payment_status: "completed" },
  ];

  // Sample complaints data - EXACT SAME
  const sampleComplaints = [
    { id: 1, title: "AC Not Working", description: "AC in bedroom is not cooling properly", category: "maintenance", priority: "high", status: "in_progress", created_at: "2024-01-20", resolution_notes: "Technician scheduled for tomorrow" },
    { id: 2, title: "Water Leakage", description: "Water leaking from bathroom ceiling", category: "plumbing", priority: "urgent", status: "resolved", created_at: "2024-01-15", resolution_notes: "Fixed by plumber on Jan 16" },
    { id: 3, title: "WiFi Issue", description: "Internet speed very slow in evening", category: "internet", priority: "medium", status: "open", created_at: "2024-01-25", resolution_notes: null },
  ];

  // -- Auth header helper - EXACT SAME
  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("tenant_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Handle authentication - EXACT SAME LOGIC
  useEffect(() => {
    const tenantId = typeof window !== "undefined" ? localStorage.getItem("tenant_id") : null;
    const tenantEmail = typeof window !== "undefined" ? localStorage.getItem("tenant_email") : null;
    
    if (!tenantId) {
      router.push("/tenant/login");
      return;
    }

    // Simulate loading tenant data
    setLoading(true);
    
    // Create mock tenant data
    const mockTenant = {
      id: tenantId,
      full_name: "John Doe",
      email: tenantEmail || "john.doe@example.com",
      phone: "+91 9876543210",
      portal_access_enabled: true,
    };

    const mockBooking = {
      id: "BOOK001",
      properties: { name: "ROOMAC PG" },
      rooms: { room_number: "302" },
      check_in_date: "2023-12-01",
      lock_in_end_date: "2024-06-01",
      property_id: "PROP001",
      room_id: "ROOM302",
    };

    setTimeout(() => {
      setTenant(mockTenant);
      setBooking(mockBooking);
      setPayments(samplePayments);
      setComplaints(sampleComplaints);
      setNotifications([]);
      setLeaveRequests([]);
      setLoading(false);
    }, 800);
  }, [router]);

  // Handlers - EXACT SAME LOGIC
  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tenant_token");
      localStorage.removeItem("tenant_id");
      localStorage.removeItem("tenant_email");
    }
    router.push("/tenant/login");
    toast.success("Logged out successfully");
  }, [router]);

  const handleSubmitComplaint = useCallback(async () => {
    if (!tenant || !booking) return;
    
    try {
      const newComplaintData = {
        id: Date.now(),
        ...newComplaint,
        tenant_id: tenant.id,
        property_id: booking.property_id,
        room_id: booking.room_id,
        status: "open",
        created_at: new Date().toISOString(),
      };

      setComplaints([newComplaintData, ...complaints]);
      setStats((prev: { openComplaints: number; }) => ({ ...prev, openComplaints: prev.openComplaints + 1 }));
      
      toast.success("Complaint submitted successfully");
      setShowComplaintDialog(false);
      setNewComplaint({ title: "", description: "", category: "maintenance", priority: "medium" });
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit complaint");
    }
  }, [tenant, booking, newComplaint, complaints]);

  const handleSubmitLeaveRequest = useCallback(async () => {
    if (!tenant || !booking) return;
    
    try {
      const lockInEndDate = booking.lock_in_end_date ? new Date(booking.lock_in_end_date) : null;
      const requestedDate = new Date(leaveRequest.requested_leave_date);
      const lockInCompleted = !lockInEndDate || requestedDate >= lockInEndDate;
      const lockInViolationDays = lockInEndDate && !lockInCompleted
        ? Math.ceil((lockInEndDate.getTime() - requestedDate.getTime()) / (1000 * 3600 * 24))
        : 0;

      const newLeaveRequest = {
        id: Date.now(),
        ...leaveRequest,
        tenant_id: tenant.id,
        booking_id: booking.id,
        property_id: booking.property_id,
        room_id: booking.room_id,
        lockInCompleted,
        lockInViolationDays,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      setLeaveRequests([newLeaveRequest, ...leaveRequests]);

      if (!lockInCompleted) {
        toast.error(
          `Lock-in period not completed. ${lockInViolationDays} days remaining. Your deposit may not be fully refunded.`,
          { duration: 8000 }
        );
      } else {
        toast.success("Leave request submitted successfully");
      }

      setShowLeaveDialog(false);
      setLeaveRequest({ requested_leave_date: "", reason: "" });
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit leave request");
    }
  }, [tenant, booking, leaveRequest, leaveRequests]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      console.log("Marking notification as read:", notificationId);
      if (stats.unreadNotifications > 0) {
        setStats((prev: { unreadNotifications: number; }) => ({ ...prev, unreadNotifications: prev.unreadNotifications - 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  }, [stats.unreadNotifications]);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      setStats((prev: any) => ({ ...prev, unreadNotifications: 0 }));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark notifications");
    }
  }, []);

  const handleViewAgreement = useCallback(() => {
    toast.info("Opening rental agreement...");
  }, []);

  const handleDownloadInvoice = useCallback(() => {
    toast.success("Invoice download started");
  }, []);

  // Function to handle navigation - EXACT SAME
  const handleNavigation = useCallback((item: any) => {
    if (item.href) {
      router.push(item.href);
    } else if (item.tab) {
      setActiveTab(item.tab);
    }
  }, [router]);

  // Check if item is active - EXACT SAME
  const isItemActive = useCallback((item: any) => {
    if (item.href) {
      return pathname === item.href;
    } else if (item.tab) {
      return activeTab === item.tab;
    }
    return false;
  }, [pathname, activeTab]);

  // Loading state - EXACT SAME
  // if (loading) return (
  //   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
  //     <div className="flex flex-col items-center">
  //       <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent"></div>
  //       <p className="mt-6 text-slate-700 font-medium">Loading your professional dashboard...</p>
  //       <p className="text-sm text-slate-500 mt-2">Please wait while we prepare everything</p>
  //     </div>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <TenantSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        booking={booking}
        stats={stats}
        navigationItems={navigationItems}
        handleNavigation={handleNavigation}
        isItemActive={isItemActive}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className={`
        transition-all duration-300
        ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
        min-h-screen
      `}>
        {/* Professional Header */}
        <TenantHeader
          tenantName={tenant?.full_name || "Guest"}
          tenantEmail={tenant?.email}
          notificationCount={stats.unreadNotifications}
          onLogout={handleLogout}
          onNotificationsClick={() => setActiveTab("notifications")}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content - Pass all data to DashboardContent */}
        <DashboardContent
          tenant={tenant}
          stats={stats}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          recentActivities={recentActivities}
          showComplaintDialog={showComplaintDialog}
          setShowComplaintDialog={setShowComplaintDialog}
          showLeaveDialog={showLeaveDialog}
          setShowLeaveDialog={setShowLeaveDialog}
          newComplaint={newComplaint}
          setNewComplaint={setNewComplaint}
          leaveRequests={leaveRequest}
          setLeaveRequest={setLeaveRequest}
          booking={booking}
          handleSubmitComplaint={handleSubmitComplaint}
          handleSubmitLeaveRequest={handleSubmitLeaveRequest}
          handleViewAgreement={handleViewAgreement}
          handleDownloadInvoice={handleDownloadInvoice}
          payments={payments}
          complaints={complaints}
          markNotificationRead={markNotificationRead}
          markAllNotificationsRead={markAllNotificationsRead}
          roomAmenities={roomAmenities}
        />
      </div>
    </div>
  );
}

export default memo(TenantDashboardClient);





