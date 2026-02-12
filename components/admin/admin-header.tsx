"use client";

import { Bell, LogOut, User, Home, Settings, Menu, X, Check, AlertCircle, Wrench, Calendar, Move, MessageSquare, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from "@/context/authContext";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { 
  Notification, 
  getAdminNotifications, 
  getAdminUnreadCount, 
  markNotificationAsRead,
  markAllAdminNotificationsAsRead
} from '@/lib/notificationApi';

interface AdminHeaderProps {
  title: string;
  description: string;
  subtitle?: string;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
}

export function AdminHeader({
  title,
  description,
  subtitle,
  sidebarOpen = true,
  onSidebarToggle
}: any) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminEmail, setAdminEmail] = useState('admin@roomac.com');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount] = useState(0); // Added missing variable
  const { logout } = useAuth();

  // Add custom CSS for pulsing border animation - CLIENT-SIDE ONLY
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse-border {
          0%, 100% { border-color: #bfdbfe; }
          50% { border-color: #3b82f6; }
        }
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);

      // Cleanup on unmount
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  // Load all data - useCallback to memoize function
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadNotifications(),
        loadUnreadCount()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      console.log('📬 Loading notifications...');
      const data = await getAdminNotifications(10); // Get 10 latest
      setNotifications(data);
      console.log(`✅ Loaded ${data.length} notifications`);
    } catch (err: any) {
      console.error('Error loading notifications:', err);
      toast.error('Failed to load notifications');
    }
  }, []);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      console.log('🔔 Loading unread count...');
      const count = await getAdminUnreadCount();
      setUnreadCount(count);
      console.log(`✅ Unread count: ${count}`);
    } catch (err: any) {
      console.error('Error loading unread count:', err);
    }
  }, []);

  // Initial load and setup interval
  useEffect(() => {
    // Initial load
    loadAllData();

    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing notifications (30s interval)...');
      loadAllData();
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [loadAllData]);

  // Refresh button handler
  const refreshNotifications = async () => {
    setRefreshing(true);
    try {
      await loadAllData();
      toast.success('Notifications refreshed');
    } catch (error) {
      console.error('Error refreshing:', error);
      toast.error('Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      console.log(`✅ Marking notification ${id} as read`);
      const success = await markNotificationAsRead(id);

      if (success) {
        // Update local state immediately
        setNotifications(prev => prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true } : notif
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Reload unread count to ensure sync
        setTimeout(() => loadUnreadCount(), 500);
      }
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark as read');
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      console.log('✅ Marking all notifications as read');
      const success = await markAllAdminNotificationsAsRead();

      if (success) {
        // Update all notifications to read
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (err: any) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to mark all as read');
    }
  };

  // Handle notification click - ALWAYS redirects to /admin/notifications
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    // Always redirect to /admin/notifications page
    // Pass the notification ID as query parameter so the notifications page can highlight it if needed
    router.push(`/admin/notifications?highlight=${notification.id}`);
    setDropdownOpen(false);
  };

  // Get notification icon (kept for UI display purposes)
  const getNotificationIcon = (notification: Notification) => {
    const type = notification.notification_type || notification.request_type;

    switch (type) {
      case 'tenant_request':
      case 'complaint':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'vacate_request':
      case 'vacate_bed':
        return <Move className="h-4 w-4 text-orange-500" />;
      case 'change_bed':
        return <Move className="h-4 w-4 text-yellow-500" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-blue-500" />;
      case 'leave':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'receipt':
      case 'payment':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  // Get request type display name
  const getRequestTypeDisplay = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };


  // Get admin initials
  const getInitials = () => {
    return adminEmail.substring(0, 2).toUpperCase();
  };

  // Load profile from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('admin_email') || 'admin@roomac.com';
      const img = localStorage.getItem('admin_profile_image') || '';
      setAdminEmail(email);
      setProfileImage(img);
    }
  }, []);

  return (
    <header className={`
      bg-white border-b border-slate-200
      fixed top-0 z-30
      transition-all duration-300
      ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
      left-0 right-0
    `}>
      <div className="px-4 md:px-6 py-3">
        <div className="flex items-center justify-between w-full">
          {/* Left Side - Title Section */}
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            {/* Mobile Menu Toggle Button - Always show title next to it */}
            {onSidebarToggle && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9"
                  onClick={onSidebarToggle}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                {/* Show title on mobile ALWAYS */}
                <div className="lg:hidden">
                  <h1 className="text-lg font-bold text-slate-900">
                    {title.length > 15 ? title.substring(0, 12) + '...' : title}
                  </h1>
                </div>
              </div>
            )}

            {/* Desktop Title Section - Show full title on desktop */}
            <div className="hidden lg:block flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-slate-500 truncate">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Mobile Subtitle - Show on mobile when sidebar is closed */}
            <div className="lg:hidden ml-12">
          <h1 className="text-md font-bold text-slate-900 ">{title}</h1>
          {subtitle && (
            <p className="text-[10px] text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
          </div>

          {/* Right Side - Action Buttons */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Visit Website Button - Desktop */}
            <Link href="/" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2 px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 border-blue-600"
              >
                <Home className="h-4 w-4" />
                <span className="hidden lg:inline">Visit Website</span>
                <span className="lg:hidden">Website</span>
              </Button>
            </Link>

            {/* Mobile Visit Website Icon */}
            <Link href="/" target="_blank">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9"
              >
                <Home className="h-5 w-5" />
              </Button>
            </Link>

            {/* Notifications Dropdown */}
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 hover:bg-slate-100"
                  onClick={() => !dropdownOpen && loadAllData()} // Refresh when opening
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-96 max-h-[80vh] overflow-y-auto shadow-xl border-slate-200"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <DropdownMenuLabel className="flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                  <span className="font-semibold">Notifications ({notifications.length})</span>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs hover:bg-slate-200 hover:text-blue-600"
                        onClick={handleMarkAllAsRead}
                        disabled={loading}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs hover:bg-slate-400"
                      onClick={refreshNotifications}
                      disabled={refreshing || loading}
                    >
                      {refreshing ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Refresh
                    </Button>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Notifications Content */}
                {loading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Loading notifications...</p>
                    <p className="text-xs text-slate-400 mt-1">Auto-refreshes every 30 seconds</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">No notifications yet</p>
                    <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                      <p>Notifications will appear when:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Tenants submit requests</li>
                        <li>New payments are made</li>
                        <li>Maintenance requests are created</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Notifications List */}
                    <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                      {notifications.map((notification) => {
                        return (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${notification.is_read
                                ? 'bg-white hover:bg-slate-50 border-slate-200'
                                : 'bg-blue-50 hover:bg-blue-100 border-blue-200 animate-pulse-border'
                              }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              {/* Left: Icon and Content */}
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {/* Icon */}
                                <div className={`p-2 rounded-full flex-shrink-0 ${notification.is_read ? 'bg-slate-100' : 'bg-blue-100'
                                  }`}>
                                  {getNotificationIcon(notification)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  {/* Header */}
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium truncate">
                                      {notification.title}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs flex-shrink-0 ${getPriorityColor(notification.priority)}`}
                                    >
                                      {notification.priority}
                                    </Badge>
                                  </div>

                                  {/* Message */}
                                  <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                    {notification.message}
                                  </p>

                                  {/* Metadata */}
                                  <div className="space-y-1">
                                    {notification.tenant_name && (
                                      <p className="text-xs text-slate-500">
                                        <span className="font-medium">Tenant:</span> {notification.tenant_name}
                                      </p>
                                    )}

                                    {notification.entity_title && (
                                      <p className="text-xs text-slate-500">
                                        <span className="font-medium">Request:</span> {notification.entity_title}
                                      </p>
                                    )}

                                    {notification.request_type && (
                                      <p className="text-xs text-slate-500">
                                        <span className="font-medium">Type:</span> {getRequestTypeDisplay(notification.request_type)}
                                      </p>
                                    )}

                                    {/* Time */}
                                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                      <span>{formatTimeAgo(notification.created_at)}</span>
                                      {!notification.is_read && (
                                        <span className="inline-block h-2 w-2 rounded-full bg-blue-500 ml-2 animate-pulse"></span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Actions */}
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:bg-blue-300"
                                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* View All Link - Also redirects to /admin/notifications */}
                    <div className="p-2 border-t border-slate-200 bg-slate-50">
                      <Link href="/admin/notifications">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-sm hover:bg-slate-200 hover:text-blue-600"
                          onClick={() => setDropdownOpen(false)}
                        >
                          View all notifications
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 h-auto p-1 md:p-2 hover:bg-slate-100"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profileImage} alt="Admin" />
                    <AvatarFallback className="bg-gradient-to-br from-[#004AAD] to-blue-500 text-white font-semibold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-none">{adminEmail.split('@')[0]}</p>
                    <p className="text-xs text-slate-500">Administrator</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-semibold">{adminEmail.split('@')[0]}</p>
                    <p className="text-xs text-slate-500 font-normal">{adminEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}