
// components/tenant/layout/TenantLayout.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Image from "next/image";
import {
  Home, CreditCard, FileText, Bell,
  LogOut, User, Settings, FolderOpen,
  Menu, Sun, ChevronRight, ChevronLeft,
  HelpCircle, MessageSquare, X, AlertCircle,
  Calendar, CheckCircle, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logoutTenant, type TenantProfile } from "@/lib/tenantAuthApi";
import { tenantDetailsApi } from "@/lib/tenantDetailsApi";
import roomacLogo from "@/app/src/assets/images/roomaclogo.webp";
import { useAuth } from "@/context/authContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'complaint' | 'event' | 'document' | 'general';
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

// ─── Notification Popup Component ─────────────────────────────────────────────

function NotificationPopup({
  notifications,
  unreadCount,
  onMarkAllRead,
  onNotificationClick,
  onClose,
  onViewAll,
}: {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onNotificationClick: (notification: Notification) => void;
  onClose: () => void;
  onViewAll: () => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'complaint': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'event': return <Calendar className="h-4 w-4 text-green-600" />;
      case 'document': return <FileText className="h-4 w-4 text-purple-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div
      ref={popupRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50"
    >
      <div className="p-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-600" />
          <p className="font-semibold text-sm">Notifications</p>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0 h-5">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllRead}
            className="h-6 text-xs hover:bg-slate-100"
          >
            Mark all read
          </Button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${
                !notification.is_read ? 'bg-blue-50/50' : ''
              }`}
              onClick={() => onNotificationClick(notification)}
            >
              <div className="flex items-start gap-2.5">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  notification.is_read ? 'bg-slate-100' : 'bg-blue-100'
                }`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm text-slate-900 leading-tight">
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-1"></div>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-slate-500">
            No notifications
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-200">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 text-xs"
          onClick={onViewAll}
        >
          View all notifications
        </Button>
      </div>
    </div>
  );
}

// ─── Nav Items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard",     label: "Dashboard",    icon: Home,          path: "/tenant/portal" },
{ id: "payments", label: "Payments", icon: CreditCard, path: "/tenant/portal#payments" },
  { id: "documents",     label: "Documents",    icon: FileText,      path: "/tenant/documents" },
  { id: "my-documents",  label: "My Documents", icon: FolderOpen,    path: "/tenant/my-documents" },
  { id: "request",       label: "Request",      icon: HelpCircle,    path: "/tenant/requests" },
{ id: "notifications", label: "Notifications", icon: Bell, path: "/tenant/portal#notifications" },  { id: "profile",       label: "Profile",      icon: User,          path: "/tenant/profile" },
  { id: "settings",      label: "Settings",     icon: Settings,      path: "/tenant/settings" },
  { id: "support",       label: "Support",      icon: MessageSquare, path: "/tenant/support" },
];

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

function DesktopSidebar({
  collapsed, onToggle, activeId, onNavigate, notificationCount,
}: {
  collapsed: boolean;
  onToggle: () => void;
  activeId: string;
  onNavigate: (path: string) => void;
  notificationCount: number;
}) {
  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200
      shadow-lg transition-all duration-300
      ${collapsed ? "w-20" : "w-64"}
      hidden lg:flex flex-col
    `}>
      {/* Logo */}
      <div className="h-20 border-b border-slate-100 flex items-center px-4">
        {!collapsed ? (
          <div className="relative w-full flex items-center justify-between pl-5">
            <div className="h-16 w-36 relative">
              <img src={roomacLogo} alt="Roomac Logo" className="object-contain h-full w-full" />
            </div>
            <Button variant="ghost" size="icon" onClick={onToggle} className="h-9 w-9 hover:bg-slate-100">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full gap-3">
            <img src={roomacLogo} alt="Roomac Logo" className="h-10 w-10 object-contain" />
            <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 hover:bg-slate-100">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const badge = item.id === "notifications" ? notificationCount : 0;
            const isActive = activeId === item.id;
            return (
              <div key={item.id} className="relative group">
                <Button
                  variant="ghost"
                  onClick={() => onNavigate(item.path)}
                  className={`
                    w-full flex items-center rounded-lg transition-all duration-200
                    ${collapsed ? "h-11 justify-center px-0" : "h-11 justify-start px-3"}
                    ${isActive
                      ? "bg-[#0149ab] text-white hover:bg-[#0149ab]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                  {!collapsed && (
                    <>
                      <span className={`ml-3 text-sm font-medium flex-1 text-left ${isActive ? "text-white" : "text-slate-600"}`}>
                        {item.label}
                      </span>
                      {badge > 0 && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                          {badge > 9 ? "9+" : badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>

                {/* Collapsed tooltip */}
                {collapsed && (
                  <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 pointer-events-none">
                    {item.label}{badge > 0 ? ` (${badge})` : ""}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

// ─── Mobile Sidebar ───────────────────────────────────────────────────────────

function MobileSidebar({
  isOpen, onClose, activeId, onNavigate, onLogout, notificationCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeId: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  notificationCount: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("mousedown", handler);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      <div ref={ref} className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-2xl flex flex-col lg:hidden">
        {/* Logo */}
        <div className="h-20 border-b border-slate-100 flex items-center px-4">
          <div className="flex w-full items-center justify-between">
            <img src={roomacLogo} alt="Roomac Logo" className="h-12 w-32 object-contain" />
            <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const badge = item.id === "notifications" ? notificationCount : 0;
              const isActive = activeId === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => { onNavigate(item.path); onClose(); }}
                  className={`
                    w-full flex items-center justify-start rounded-lg h-11 px-3
                    ${isActive
                      ? "bg-[#0149ab] text-white hover:bg-[#0149ab]"
                      : "text-slate-600 hover:bg-slate-100"
                    }
                  `}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span className={`ml-3 text-sm font-medium flex-1 text-left ${isActive ? "text-white" : "text-slate-600"}`}>
                    {item.label}
                  </span>
                  {badge > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                      {badge > 9 ? "9+" : badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-200">
          <Button
            variant="ghost"
            onClick={() => { onLogout(); onClose(); }}
            className="w-full justify-start h-11 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="text-sm font-medium">Logout</span>
          </Button>
        </div>
      </div>
    </>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function TenantHeader({
  tenant, notificationCount, notifications, onMenuClick, onLogout, onNavigate,
  onMarkNotificationRead, onMarkAllRead,
}: {
  tenant: TenantProfile | null;
  notificationCount: number;
  notifications: Notification[];
  onMenuClick: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Handle click outside for both dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      onMarkNotificationRead(notification.id);
    }
    setNotificationsOpen(false);
    
    // Navigate based on notification type
    if (notification.type === 'payment') {
      onNavigate("/tenant/portal?tab=payments");
    } else if (notification.type === 'complaint') {
      onNavigate("/tenant/requests");
    } else if (notification.type === 'document') {
      onNavigate("/tenant/documents");
    } else {
      onNavigate("/tenant/notifications");
    }
  };

  const handleViewAll = () => {
    setNotificationsOpen(false);
    onNavigate("/tenant/notifications");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden hover:bg-slate-100" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Welcome back, <span className="text-[#0149ab]">{tenant?.full_name?.split(" ")[0] || "Tenant"}</span>
            </h1>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 text-slate-600">
            <Sun className="h-4 w-4 text-[#fec40a]" />
            <span className="text-sm">29°C</span>
          </div>

          {/* Bell with Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-slate-100"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Badge>
              )}
            </Button>

            {notificationsOpen && (
              <NotificationPopup
                notifications={notifications}
                unreadCount={notificationCount}
                onMarkAllRead={onMarkAllRead}
                onNotificationClick={handleNotificationClick}
                onClose={() => setNotificationsOpen(false)}
                onViewAll={handleViewAll}
              />
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <Button variant="ghost" className="h-8 w-8 rounded-full p-0" onClick={() => setProfileOpen(!profileOpen)}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={tenant?.photo_url} alt={tenant?.full_name} />
                <AvatarFallback className="bg-[#fec40a] text-black text-sm font-semibold">
                  {tenant?.full_name?.charAt(0) || "T"}
                </AvatarFallback>
              </Avatar>
            </Button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                <div className="p-3 border-b border-slate-200">
                  <p className="font-medium text-sm text-slate-900 truncate">{tenant?.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{tenant?.email}</p>
                </div>
                <div className="p-1">
                  <Button variant="ghost" className="w-full justify-start h-9 px-2 text-sm hover:bg-slate-100"
                    onClick={() => { onNavigate("/tenant/profile"); setProfileOpen(false); }}>
                    <User className="h-4 w-4 mr-2" /> Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-9 px-2 text-sm hover:bg-slate-100"
                    onClick={() => { onNavigate("/tenant/settings"); setProfileOpen(false); }}>
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </Button>
                </div>
                <div className="border-t border-slate-200 p-1">
                  <Button variant="ghost" className="w-full justify-start h-9 px-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => { onLogout(); setProfileOpen(false); }}>
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Mock Notifications ───────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Rent Payment Reminder',
    message: 'Your rent payment of ₹12,000 is due in 7 days',
    type: 'payment',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Complaint Update',
    message: 'Your maintenance request #123 is now in progress',
    type: 'complaint',
    is_read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Document Verified',
    message: 'Your Aadhar card has been verified successfully',
    type: 'document',
    is_read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '4',
    title: 'WiFi Maintenance',
    message: 'Scheduled maintenance on March 1st from 2-4 AM',
    type: 'event',
    is_read: false,
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

// ─── Main Layout Component ────────────────────────────────────────────────────

export default function TenantLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const { logout } = useAuth()

  // Load tenant profile
  useEffect(() => {
    tenantDetailsApi.loadProfile()
      .then((res: any) => { if (res?.success) setTenant(res.data); })
      .catch(() => {});
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Derive active nav item from current path
  const getActiveId = () => {
    const path = location.pathname;
    if (path.includes("/documents") && !path.includes("my-")) return "documents";
    if (path.includes("/my-documents"))  return "my-documents";
    if (path.includes("/profile"))       return "profile";
    if (path.includes("/settings"))      return "settings";
    if (path.includes("/requests"))      return "request";
    if (path.includes("/notifications")) return "notifications";
    if (path.includes("/support"))       return "support";
    if (path.includes("/portal")) {
      // Check for hash or query param
      if (location.hash === '#payments' || location.search.includes('tab=payments')) {
        return "payments";
      }
      return "dashboard";
    }
    return "dashboard";
  };

  const handleLogout = async () => {
    await logoutTenant();
    localStorage.clear()
    logout();
    navigate("/login");
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        activeId={getActiveId()}
        onNavigate={navigate}
        notificationCount={unreadCount}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeId={getActiveId()}
        onNavigate={navigate}
        onLogout={handleLogout}
        notificationCount={unreadCount}
      />

      {/* Content Area */}
      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"} min-h-screen flex flex-col`}>
        {/* Header */}
        <TenantHeader
          tenant={tenant}
          notificationCount={unreadCount}
          notifications={notifications}
          onMenuClick={() => setMobileOpen(true)}
          onLogout={handleLogout}
          onNavigate={navigate}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllRead}
        />

        {/* Page Content — Outlet renders the matched child route */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}