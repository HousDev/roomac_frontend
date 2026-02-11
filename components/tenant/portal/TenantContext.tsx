"use client";

import { createContext, useContext, ReactNode } from "react";
import { TenantProfile, Payment, Complaint, Notification, LeaveRequest, DashboardStats, Metric, RecentActivity } from "../types/tenant.types";

interface TenantContextType {
  tenant: TenantProfile | null;
  booking: any | null;
  payments: Payment[];
  complaints: Complaint[];
  notifications: Notification[];
  leaveRequests: LeaveRequest[];
  stats: DashboardStats;
  metrics: Metric[];
  recentActivities: RecentActivity[];
  pgAmenities: any[];
  roomAmenities: any[];
  navigationItems: any[];
  samplePayments: Payment[];
  sampleComplaints: Complaint[];
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ 
  children, 
  initialData 
}: { 
  children: ReactNode; 
  initialData: Partial<TenantContextType>;
}) {
  // Default values from your original component
  const defaultStats = {
    totalPayments: 8,
    pendingPayments: 2,
    openComplaints: 1,
    unreadNotifications: 3,
    daysUntilRentDue: 7,
    rentAmount: 15000,
    occupancyDays: 45,
    depositAmount: 30000,
    nextDueDate: "2024-02-05",
    maintenanceScore: 8.5,
    cleanlinessScore: 9.0,
    communityScore: 8.7,
  };

  const defaultMetrics = [
    { label: "Monthly Spending", value: "₹45,000", change: "+12%", icon: "TrendingUp", color: "text-green-600", bgColor: "bg-green-50", trend: "positive" },
    { label: "Avg Response Time", value: "4.2h", change: "-18%", icon: "Clock", color: "text-blue-600", bgColor: "bg-blue-50", trend: "positive" },
    { label: "Satisfaction Score", value: "4.8/5", change: "+2%", icon: "Star", color: "text-yellow-600", bgColor: "bg-yellow-50", trend: "positive" },
    { label: "Occupancy Rate", value: "92%", change: "+5%", icon: "TrendingUp", color: "text-purple-600", bgColor: "bg-purple-50", trend: "positive" },
  ];

  const defaultPgAmenities = [
    { icon: "Wifi", name: "High-Speed WiFi", available: true, status: "500 Mbps", uptime: "99.9%" },
    { icon: "Coffee", name: "Daily Mess", available: true, status: "3 Meals", rating: "4.5/5" },
    { icon: "Shield", name: "24/7 Security", available: true, status: "Guarded", cameras: "8" },
    { icon: "Users", name: "Laundry Service", available: true, status: "Weekly", next: "Tomorrow" },
    { icon: "ParkingCircle", name: "Parking", available: true, status: "Available", slots: "4/6" },
    { icon: "Dumbbell", name: "Gym", available: true, status: "24/7 Access", equipment: "Full" },
    { icon: "Tv", name: "TV Lounge", available: true, status: "HD TV", channels: "150+" },
    { icon: "Microwave", name: "Kitchen", available: true, status: "Fully Equipped", type: "Common" },
  ];

  const defaultRoomAmenities = [
    { icon: "Bed", name: "Bed", available: true, status: "Queen Size" },
    { icon: "Refrigerator", name: "Refrigerator", available: true, status: "Personal" },
    { icon: "Armchair", name: "Study Table", available: true, status: "With Chair" },
    { icon: "Lamp", name: "LED Lights", available: true, status: "Dimmable" },
    { icon: "Fan", name: "Ceiling Fan", available: true, status: "With Remote" },
    { icon: "Thermometer", name: "AC", available: true, status: "1.5 Ton" },
  ];

  const defaultNavigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "Home", active: true, badge: null, href: "/tenant/dashboard" },
    { id: "payments", label: "Payments", icon: "CreditCard", badge: "2", tab: "payments" },
    { id: "documents", label: "Documents", icon: "FileCheck", badge: null, href: "/tenant/documents" },
    { id: "complaints", label: "Complaints", icon: "AlertCircle", badge: "1", tab: "complaints" },
    { id: "my-documents", label: "My Documents", icon: "FolderOpen", badge: null, href: "/tenant/my-documents" },
    { id: "requests", label: "Requests", icon: "MessageSquare", badge: null, href: "/tenant/requests" },
    { id: "notifications", label: "Notifications", icon: "Bell", badge: "3", tab: "notifications" },
    { id: "profile", label: "Profile", icon: "User", badge: null, href: "/tenant/profile" },
    { id: "support", label: "Support", icon: "HelpCircle", badge: null, href: "/tenant/support" },
  ];

  const defaultRecentActivities = [
    { id: 1, type: "payment", title: "Rent Payment", description: "January 2024 rent", amount: "₹15,000", status: "completed", time: "2 hours ago", icon: "CreditCard", color: "text-green-600", bgColor: "bg-green-50" },
    { id: 2, type: "complaint", title: "AC Repair", description: "Bedroom AC not cooling", status: "in_progress", time: "1 day ago", icon: "AlertCircle", color: "text-orange-600", bgColor: "bg-orange-50" },
    { id: 3, type: "document", title: "Agreement Renewal", description: "Annual agreement signed", status: "completed", time: "3 days ago", icon: "FileCheck", color: "text-blue-600", bgColor: "bg-blue-50" },
    { id: 4, type: "maintenance", title: "Room Cleaning", description: "Monthly deep cleaning", status: "scheduled", time: "5 days ago", icon: "Settings", color: "text-yellow-600", bgColor: "bg-yellow-50" },
    { id: 5, type: "payment", title: "Maintenance Fee", description: "Monthly maintenance", amount: "₹1,500", status: "pending", time: "6 days ago", icon: "CreditCard", color: "text-red-600", bgColor: "bg-red-50" },
  ];

  const defaultSamplePayments = [
    { id: 1, payment_for: "Rent - January 2024", amount: 15000, payment_date: "2024-01-01", payment_status: "completed" },
    { id: 2, payment_for: "Maintenance - January 2024", amount: 1500, payment_date: "2024-01-05", payment_status: "completed" },
    { id: 3, payment_for: "Rent - February 2024", amount: 15000, payment_date: "2024-02-01", payment_status: "pending" },
    { id: 4, payment_for: "Electricity Bill - January", amount: 1200, payment_date: "2024-01-15", payment_status: "completed" },
    { id: 5, payment_for: "Security Deposit", amount: 30000, payment_date: "2023-12-01", payment_status: "completed" },
  ];

  const defaultSampleComplaints = [
    { id: 1, title: "AC Not Working", description: "AC in bedroom is not cooling properly", category: "maintenance", priority: "high", status: "in_progress", created_at: "2024-01-20", resolution_notes: "Technician scheduled for tomorrow" },
    { id: 2, title: "Water Leakage", description: "Water leaking from bathroom ceiling", category: "plumbing", priority: "urgent", status: "resolved", created_at: "2024-01-15", resolution_notes: "Fixed by plumber on Jan 16" },
    { id: 3, title: "WiFi Issue", description: "Internet speed very slow in evening", category: "internet", priority: "medium", status: "open", created_at: "2024-01-25", resolution_notes: null },
  ];

  const defaultBooking = {
    id: "BOOK001",
    properties: { name: "ROOMAC PG" },
    rooms: { room_number: "302" },
    check_in_date: "2023-12-01",
    lock_in_end_date: "2024-06-01",
    property_id: "PROP001",
    room_id: "ROOM302",
  };

  const value = {
    tenant: initialData.tenant || null,
    booking: defaultBooking,
    payments: defaultSamplePayments,
    complaints: defaultSampleComplaints,
    notifications: [],
    leaveRequests: [],
    stats: defaultStats,
    metrics: defaultMetrics,
    recentActivities: defaultRecentActivities,
    pgAmenities: defaultPgAmenities,
    roomAmenities: defaultRoomAmenities,
    navigationItems: defaultNavigationItems,
    samplePayments: defaultSamplePayments,
    sampleComplaints: defaultSampleComplaints,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenantContext must be used within a TenantProvider");
  }
  return context;
}