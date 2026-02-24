// components/tenant/layout/TenantLayout.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Home, CreditCard, FileText, Bell,
  LogOut, User, Settings, FolderOpen,
  Menu, Sun, ChevronRight, ChevronLeft,
  HelpCircle, MessageSquare, X, AlertCircle,
  Calendar, Building, MapPin, Loader2,
  UserX,
  Users,
  Wrench,
  RefreshCw,
  Move
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logoutTenant, type TenantProfile } from "@/lib/tenantAuthApi";
import { tenantDetailsApi } from "@/lib/tenantDetailsApi";
import {
  getTenantNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification
} from "@/lib/tenantNotificationsApi";
import roomacLogo from "@/app/src/assets/images/roomaclogo.webp";
import { useAuth } from "@/context/authContext";

// ─── Types ────────────────────────────────────────────────────────────────────

// Update Notification type to match API
interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  related_entity_type: string;
  related_entity_id: number;
  is_read: boolean;
  read_at: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  type?: string; // For backward compatibility
  metadata?: any;
}

// ─── Notification Popup ───────────────────────────────────────────────────────

function NotificationPopup({
  notifications,
  unreadCount,
  onMarkAllRead,
  onNotificationClick,
  onClose,
  onViewAll,
  loading = false,
}: {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onNotificationClick: (n: Notification) => void;
  onClose: () => void;
  onViewAll: () => void;
  loading?: boolean;
}) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case "payment":   return <CreditCard className="h-4 w-4 text-blue-600" />;
      case "complaint": return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "maintenance": return <Wrench className="h-4 w-4 text-purple-600" />;
        case "leave": return <Users className="h-4 w-4 text-green-600" />;
        case "change_bed": return <Move className="h-4 w-4 text-teal-600" />;
        case "vacate bed": return <MapPin className="h-4 w-4 text-red-600" />;
        case "account deletion": return <UserX className="h-4 w-4 text-gray-600" />;
      case "event":     return <Calendar className="h-4 w-4 text-green-600" />;
      case "document":  return <FileText className="h-4 w-4 text-purple-600" />;
      default:          return <Bell className="h-4 w-4 text-gray-600" />;
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
          <Button variant="ghost" size="sm" onClick={onMarkAllRead} className="h-6 text-xs hover:bg-slate-100">
            Mark all read
          </Button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.slice(0, 5).map((n) => {
            const notificationType = n.type || n.notification_type || 'general';
            return (
              <div
                key={n.id}
                className={`p-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${!n.is_read ? "bg-blue-50/50" : ""}`}
                onClick={() => onNotificationClick(n)}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${n.is_read ? "bg-slate-100" : "bg-blue-100"}`}>
                    {getIcon(notificationType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm text-slate-900 leading-tight">{n.title}</p>
                      {!n.is_read && <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-1 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-sm text-slate-500">No notifications</div>
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
  { id: "dashboard",     label: "Dashboard",     icon: Home,          path: "/tenant/portal" },
  { id: "payments",      label: "Payments",       icon: CreditCard,    path: "/tenant/portal#payments" },
  { id: "documents",     label: "Documents",      icon: FileText,      path: "/tenant/documents" },
  { id: "my-documents",  label: "My Documents",   icon: FolderOpen,    path: "/tenant/my-documents" },
  { id: "request",       label: "Request",        icon: HelpCircle,    path: "/tenant/requests" },
  { id: "notifications", label: "Notifications",  icon: Bell,          path: "/tenant/portal/#notifications" },
  { id: "profile",       label: "Profile",        icon: User,          path: "/tenant/profile" },
  { id: "settings",      label: "Settings",       icon: Settings,      path: "/tenant/settings" },
  { id: "support",       label: "Support",        icon: MessageSquare, path: "/tenant/support" },
];

// ─── Sidebar Accommodation + Next Payment Card (combined) ────────────────────

function SidebarAccommodationCard({ tenant }: { tenant: TenantProfile | null }) {
  const daysLeft = 7;
  const dueDate = new Date(Date.now() + daysLeft * 86400000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="mx-3 mb-4">
      <div
        className="rounded-xl p-3 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0149ab 0%, #0284c7 60%, #06b6d4 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10" />
        <div className="absolute -bottom-3 -left-3 h-14 w-14 rounded-full bg-white/10" />

        {/* Header */}
        <div className="flex items-center gap-1.5 mb-0.5 relative z-10">
          <Building className="h-3 w-3 text-blue-100" />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-100">
            Your Accommodation
          </p>
        </div>
        <p className="font-bold text-sm text-white truncate relative z-10">
          {tenant?.property_name || "Roomac PG"}
        </p>
        <p className="text-[10px] text-blue-100 truncate relative z-10 mb-2.5 flex items-center gap-1">
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          {tenant?.property_city || "Pune"}
        </p>

        {/* Room details grid */}
        <div className="grid grid-cols-2 gap-1.5 relative z-10">
          {[
            { label: "ROOM NO.",   value: tenant?.room_number || "—" },
            { label: "BED NO.",    value: tenant?.bed_number  || "1" },
            { label: "RENT/MONTH", value: `₹${(tenant?.rent_per_bed || 12000).toLocaleString("en-IN")}` },
            { label: "FLOOR",      value: tenant?.floor ? `Floor ${tenant.floor}` : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/15 rounded-lg px-2 py-1.5 backdrop-blur-sm">
              <p className="text-[8px] font-semibold text-blue-100 uppercase leading-none tracking-wide">{label}</p>
              <p className="text-xs font-bold text-white mt-0.5 leading-tight truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Next Payment mini section ── */}
        <div className="mt-2.5 relative z-10 rounded-lg overflow-hidden"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          <div className="px-2.5 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-blue-100 mb-1">
              Next Payment
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-white leading-none">
                  ₹{(tenant?.rent_per_bed || 12000).toLocaleString("en-IN")}
                </p>
                <p className="text-[9px] text-blue-200 mt-0.5">Monthly Rent</p>
              </div>
              <div className="flex gap-1.5">
                <div className="bg-white/20 rounded-md px-2 py-1 text-center backdrop-blur-sm">
                  <p className="text-[7px] text-blue-100 uppercase leading-none">Due in</p>
                  <p className="text-[11px] font-black text-white leading-tight">{daysLeft} Days</p>
                </div>
                <div className="bg-white/20 rounded-md px-2 py-1 text-center backdrop-blur-sm">
                  <p className="text-[7px] text-blue-100 uppercase leading-none">Date</p>
                  <p className="text-[11px] font-black text-white leading-tight">{dueDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

function DesktopSidebar({
  collapsed,
  onToggle,
  activeId,
  onNavigate,
  notificationCount,
  tenant,
}: {
  collapsed: boolean;
  onToggle: () => void;
  activeId: string;
  onNavigate: (path: string) => void;
  notificationCount: number;
  tenant: TenantProfile | null;
}) {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200
        shadow-lg transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
        hidden lg:flex flex-col
      `}
    >
      {/* Logo */}
      <div className="h-20 border-b border-slate-100 flex items-center px-4 shrink-0">
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
      <nav className="flex-1 py-1 px-2 overflow-y-auto">
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

      {/* Accommodation + Next Payment — only when expanded */}
      {!collapsed && <SidebarAccommodationCard tenant={tenant} />}
    </aside>
  );
}

// ─── Mobile Sidebar ───────────────────────────────────────────────────────────

function MobileSidebar({
  isOpen,
  onClose,
  activeId,
  onNavigate,
  onLogout,
  notificationCount,
  tenant,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeId: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  notificationCount: number;
  tenant: TenantProfile | null;
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
      <div
        ref={ref}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-2xl flex flex-col lg:hidden"
      >
        {/* Logo */}
        <div className="h-20 border-b border-slate-100 flex items-center px-4 shrink-0">
          <div className="flex w-full items-center justify-between">
            <img src={roomacLogo} alt="Roomac Logo" className="h-12 w-32 object-contain" />
            <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
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

        {/* Accommodation + Next Payment on mobile */}
        <SidebarAccommodationCard tenant={tenant} />

        {/* Logout */}
        <div className="p-3 border-t border-slate-200 shrink-0">
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
  tenant,
  notificationCount,
  notifications,
  onMenuClick,
  onLogout,
  onNavigate,
  onMarkNotificationRead,
  onMarkAllRead,
  loadingNotifications = false,
}: {
  tenant: TenantProfile | null;
  notificationCount: number;
  notifications: Notification[];
  onMenuClick: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllRead: () => void;
  loadingNotifications?: boolean;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node))
        setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotificationClick = (n: Notification) => {
    if (!n.is_read) onMarkNotificationRead(n.id);
    setNotificationsOpen(false);
    
    const notificationType = n.type || n.notification_type || 'general';
    
    if (notificationType === "payment")        onNavigate("/tenant/portal#payments");
    else if (notificationType === "complaint") onNavigate("/tenant/requests");
    else if (notificationType === "document")  onNavigate("/tenant/documents");
    else                                        onNavigate("/tenant/portal/#notifications");
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
            <h1 className="text-2xl font-bold text-slate-900">
            Tenant Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bell */}
          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-slate-500"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                >
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
                onViewAll={() => {
                  setNotificationsOpen(false);
                  onNavigate("/tenant/portal/#notifications");
                }}
                loading={loadingNotifications}
              />
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <Button
              variant="ghost"
              className="h-8 w-8 rounded-full p-0"
              onClick={() => setProfileOpen(!profileOpen)}
            >
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
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-9 px-2 text-sm hover:bg-slate-100 hover:text-black"
                    onClick={() => { onNavigate("/tenant/profile"); setProfileOpen(false); }}
                  >
                    <User className="h-4 w-4 mr-2" /> Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-9 px-2 text-sm hover:bg-slate-100 hover:text-black"
                    onClick={() => { onNavigate("/tenant/settings"); setProfileOpen(false); }}
                  >
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </Button>
                </div>
                <div className="border-t border-slate-200 p-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-9 px-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-600"
                    onClick={() => { onLogout(); setProfileOpen(false); }}
                  >
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

// ─── Main Layout ──────────────────────────────────────────────────────────────

export default function TenantLayout() {
  
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname + location.hash;

    // Don't store login pages
    if (currentPath !== "/login" && currentPath !== "/tenant") {
      localStorage.setItem("lastVisitedPath", currentPath);
    }
  }, [location.pathname, location.hash]);

  // Load profile
  useEffect(() => {
    tenantDetailsApi
      .loadProfile()
      .then((res: any) => {
        if (res?.success) {
          setTenant(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Load notifications
  const loadNotifications = async (showLoading = true) => {
    try {
      if (showLoading) setLoadingNotifications(true);
      const [notifs, count] = await Promise.all([
        getTenantNotifications(10),
        getUnreadNotificationCount()
      ]);
      
      // Transform API notifications to match component format
      const formattedNotifs = notifs.map(n => ({
        ...n,
        type: n.notification_type // Add type for backward compatibility
      }));
      
      setNotifications(formattedNotifs);
      setNotificationCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      if (showLoading) setLoadingNotifications(false);
      setInitialLoadDone(true);
    }
  };

  // Load notifications on mount
  useEffect(() => {
    loadNotifications(true);
    
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      loadNotifications(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Load notifications when notification popup opens
  const handleNotificationsOpen = () => {
    if (!initialLoadDone) {
      loadNotifications(true);
    }
  };

  const getActiveId = () => {
    const path = location.pathname;
    const hash = location.hash;
    if (path.includes("/my-documents"))  return "my-documents";
    if (path.includes("/documents"))     return "documents";
    if (path.includes("/profile"))       return "profile";
    if (path.includes("/settings"))      return "settings";
    if (path.includes("/requests"))      return "request";
    if (path.includes("/notifications")) return "notifications";
    if (path.includes("/support"))       return "support";
    if (path.includes("/portal")) {
      if (hash === "#payments")      return "payments";
      if (hash === "#notifications") return "notifications";
      return "dashboard";
    }
    return "dashboard";
  };

  const handleLogout = async () => {
    await logoutTenant();
    localStorage.clear();
    logout();
    navigate("/login");
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => 
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setNotificationCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const marked = await markAllNotificationsAsRead();
      if (marked > 0) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setNotificationCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        activeId={getActiveId()}
        onNavigate={navigate}
        notificationCount={notificationCount}
        tenant={tenant}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeId={getActiveId()}
        onNavigate={navigate}
        onLogout={handleLogout}
        notificationCount={notificationCount}
        tenant={tenant}
      />

      {/* Content */}
      <div
        className={`transition-all duration-300 ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        } min-h-screen flex flex-col`}
      >
        <TenantHeader
          tenant={tenant}
          notificationCount={notificationCount}
          notifications={notifications}
          onMenuClick={() => {
            setMobileOpen(true);
            handleNotificationsOpen();
          }}
          onLogout={handleLogout}
          onNavigate={navigate}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllRead}
          loadingNotifications={loadingNotifications}
        />

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}