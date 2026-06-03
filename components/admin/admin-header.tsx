// components/admin/admin-header.tsx
"use client";

import { Bell, LogOut, User, Home, Settings, Menu, Check, AlertCircle, Wrench, Calendar, Move, MessageSquare, Loader2, RefreshCw, ExternalLink, FileText, Mail, UserCog, DoorOpen, Headphones } from 'lucide-react';
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
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  Notification,
  getAdminNotifications,
  getAdminUnreadCount,
  markNotificationAsRead,
  markAllAdminNotificationsAsRead
} from '@/lib/notificationApi';
import { getAllRequestCounts, type RequestCounts } from '@/lib/adminRequestCountsApi';
import { getSupportTicketCounts } from '@/lib/supportTicketsApi';
import { NotificationRedirectHandler } from './notifications/notification-utils';
import { io, Socket } from 'socket.io-client';
import { forceUnlockAudio, initNotificationSound, playNotificationSound, preloadNotificationSound } from "../../app/utils/notificationSound";

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
  const [requestCounts, setRequestCounts] = useState<RequestCounts>({
    complaints: 0,
    maintenance: 0,
    receipts: 0,
    vacate: 0,
    change: 0,
    deletion: 0,
    notice: 0,
    total: 0
  });
  const [adminEmail, setAdminEmail] = useState('admin@roomac.com');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout, user } = useAuth();
  const [supportCount, setSupportCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  // Add custom CSS for pulsing border animation
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

      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  // Load all data
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadNotifications(),
        loadUnreadCount(),
        loadRequestCounts()
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
      const data = await getAdminNotifications(10);
      setNotifications(data);
    } catch (err: any) {
      console.error('Error loading notifications:', err);
    }
  }, []);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await getAdminUnreadCount();
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Error loading unread count:', err);
    }
  }, []);

  // Load request counts
  const loadRequestCounts = useCallback(async () => {
    try {
      const counts = await getAllRequestCounts();
      const supportData = await getSupportTicketCounts();
      setRequestCounts(counts);
      setSupportCount(supportData.total);
    } catch (err) {
      console.error('Error loading request counts:', err);
    }
  }, []);

  const backgroundRefresh = useCallback(async () => {
    try {
      const [data, count, counts, supportData] = await Promise.all([
        getAdminNotifications(10),
        getAdminUnreadCount(),
        getAllRequestCounts(),
        getSupportTicketCounts()
      ]);
      
      setNotifications(data);
      setUnreadCount(count);
      setRequestCounts(counts);
      setSupportCount(supportData.total);
    } catch (error) {
      console.error('Failed to background refresh:', error);
    }
  }, []);

  // Initialize notification sound
  useEffect(() => {
    preloadNotificationSound();
    
    const handleFirstInteraction = () => {
      initNotificationSound();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      console.log("🔊 Audio unlocked by user interaction");
    };
    
    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);
    
    const handleKeyPress = () => {
      initNotificationSound();
      window.removeEventListener("keydown", handleKeyPress);
    };
    window.addEventListener("keydown", handleKeyPress);
    
    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // Setup Socket.IO for real-time notifications
  useEffect(() => {
    loadAllData();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Create socket connection
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Admin Socket connected:', socket.id);
      socket.emit('join_admin');
      // Force unlock audio when socket connects
  forceUnlockAudio();
    });

    socket.on('new_notification', (data) => {
      console.log("🔔 New notification received for admin:", data);
      
      // Play sound immediately
      playNotificationSound();
      
      
      // Immediately update UI
      const newNotification: Notification = {
        id: Date.now(),
        recipient_id: 1,
        recipient_type: 'admin',
        title: data.title || 'New Request',
        message: data.message || 'A new request has been received',
        notification_type: data.type || data.notification_type || 'tenant_request',
        request_type: data.type,
        priority: data.priority || 'medium',
        is_read: false,
        created_at: new Date().toISOString(),
        tenant_name: data.tenant_name || null,
        related_entity_type: data.related_entity_type || 'tenant_request',
        related_entity_id: data.request_id || null,
        read_at: null
      };
      
      setNotifications(prev => [newNotification, ...prev].slice(0, 10));
      setUnreadCount(prev => prev + 1);
      
      // Refresh counts in background
      backgroundRefresh();
    });

    socket.on('request_counts_update', (data) => {
      console.log("📊 Request counts updated:", data);
      setRequestCounts(prev => ({ ...prev, ...data }));
      if (data.total && data.total > requestCounts.total) {
        playNotificationSound();
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Admin Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Fallback polling every 3 seconds
    const interval = setInterval(() => {
      backgroundRefresh();
    }, 3000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []); // Empty dependency array - run once on mount

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
      const success = await markNotificationAsRead(id);

      if (success) {
        setNotifications(prev => prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true } : notif
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));

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
      const success = await markAllAdminNotificationsAsRead();

      if (success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (err: any) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    const redirectHandler = new NotificationRedirectHandler();
    const redirectUrl = redirectHandler.getRedirectUrl(notification);
    
    router.push(redirectUrl);
    setDropdownOpen(false);
  };

  // Get notification icon
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
      case 'support_ticket':
        return <Headphones className="h-4 w-4 text-indigo-500" />;
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
    if (!type) return 'Request';
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Get admin initials
  const getInitials = () => {
    const name = localStorage.getItem("auth_role") === "admin"
      ? adminEmail.split("@")[0]
      : user?.name || "";

    const words = name.trim().split(" ");

    const firstInitial = words[0]?.charAt(0) || "";
    const lastInitial = words.length > 1 ? words[words.length - 1]?.charAt(0) : "";

    return `${firstInitial}${lastInitial}`.toUpperCase();
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

  // Get total pending requests count
  const totalPendingRequests = requestCounts.total + supportCount;

  return (
    <header className={`
      bg-white border-b border-slate-200
      fixed top-0 z-30
      transition-all duration-300
      ${sidebarOpen ? 'lg:ml-48' : 'lg:ml-[60px]'}
      left-0 right-0
    `}>
      <div className="px-4 md:px-6 py-3">
        <div className="flex items-center justify-between w-full">
          {/* Left Side - Title Section */}
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            {/* Mobile Menu Toggle Button */}
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

                {/* Mobile Title */}
                <div className="lg:hidden">
                  <h1 className="text-lg font-bold text-slate-900">
                    {title.length > 15 ? title.substring(0, 12) + '...' : title}
                  </h1>
                </div>
              </div>
            )}

            {/* Desktop Title */}
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

            {/* Mobile Subtitle */}
            <div className="lg:hidden ml-12">
              <h1 className="text-md font-bold text-slate-900">{title}</h1>
              {subtitle && (
                <p className="text-[10px] text-slate-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right Side - Action Buttons */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Visit Website Button */}
            <Link href="/" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2 px-3 py-2 text-white bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] hover:bg-blue-700 border-blue-600"
              >
                <Home className="h-4 w-4" />
                <span className="hidden lg:inline">Visit Website</span>
                <span className="lg:hidden">Website</span>
              </Button>
            </Link>

            {/* Mobile Visit Website Icon */}
            <Link href="/" target="_blank" className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Home className="h-5 w-5" />
              </Button>
            </Link>

            {/* Notifications Dropdown */}
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 hover:bg-slate-400"
                  onClick={() => !dropdownOpen && loadAllData()}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-[calc(100vw-2rem)] sm:w-96 max-w-[calc(100vw-2rem)] sm:max-w-none max-h-[80vh] overflow-y-auto shadow-xl border-slate-200 mx-4 sm:mx-0"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <DropdownMenuLabel className="flex justify-between items-center bg-slate-50 sticky top-0 z-10 px-3 py-2 sm:px-4">
                  <span className="font-semibold text-sm sm:text-base">Notifications ({notifications.length})</span>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs hover:bg-slate-200 hover:text-blue-600 px-2 sm:px-3"
                        onClick={handleMarkAllAsRead}
                        disabled={loading}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Mark all read</span>
                        <span className="sm:hidden">All read</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs hover:bg-slate-400 px-2 sm:px-3"
                      onClick={refreshNotifications}
                      disabled={refreshing || loading}
                    >
                      {refreshing ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      <span className="hidden sm:inline">Refresh</span>
                      <span className="sm:hidden">↻</span>
                    </Button>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Notifications Content */}
                {loading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">No notifications yet</p>
                    <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  <>
                    <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                      {notifications.map((notification) => {
                        return (
                          <div
                            key={notification.id}
                            className={`p-2 sm:p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                              notification.is_read
                                ? 'bg-white hover:bg-slate-50 border-slate-200'
                                : 'bg-blue-50 hover:bg-blue-100 border-blue-200 animate-pulse-border'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                                  notification.is_read ? 'bg-slate-100' : 'bg-blue-100'
                                }`}>
                                  {getNotificationIcon(notification)}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                                    <p className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-none">
                                      {notification.title}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] sm:text-xs flex-shrink-0 px-1.5 py-0 sm:px-2 ${getPriorityColor(notification.priority)}`}
                                    >
                                      {notification.priority}
                                    </Badge>
                                  </div>

                                  <p className="text-xs sm:text-sm text-slate-600 mb-2 line-clamp-2">
                                    {notification.message}
                                  </p>

                                  <div className="space-y-0.5 sm:space-y-1">
                                    {notification.tenant_name && (
                                      <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                                        <span className="font-medium">Tenant:</span> {notification.tenant_name}
                                      </p>
                                    )}

                                    {notification.entity_title && (
                                      <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                                        <span className="font-medium">Request:</span> {notification.entity_title}
                                      </p>
                                    )}

                                    {notification.request_type && (
                                      <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                                        <span className="font-medium">Type:</span> {getRequestTypeDisplay(notification.request_type)}
                                      </p>
                                    )}

                                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2 flex items-center gap-1">
                                      <span>{formatTimeAgo(notification.created_at)}</span>
                                      {!notification.is_read && (
                                        <span className="inline-block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 ml-2 animate-pulse"></span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-1">
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

                    <div className="p-2 border-t border-slate-200 bg-slate-50">
                      <Link href="/admin/notifications">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs sm:text-sm hover:bg-slate-200 hover:text-blue-600 py-1.5 sm:py-2"
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
                  className="flex items-center gap-1 h-auto p-1 md:p-2 hover:bg-slate-300"
                >
                  <Avatar className="h-6 w-6">
                    {/* <AvatarImage src={user ? process.env.NEXT_PUBLIC_API_URL + "/uploads/staff-documents/" + user.photo_url : profileImage} alt="Admin" /> */}


<AvatarImage
  src={
    user?.photo_url
      ? user.photo_url.startsWith('http')
        ? user.photo_url
        : user.photo_url.startsWith('/uploads/')
          ? `${import.meta.env.VITE_API_URL}${user.photo_url}`
          : `${import.meta.env.VITE_API_URL}/uploads/staff-documents/${user.photo_url}`
      : profileImage
      ? `${import.meta.env.VITE_API_URL}/uploads/staff-documents/${profileImage}`
      : ''
  }
  alt="Admin"
/>
                    {/* <AvatarImage
  src={
    user?.photo_url
      ? user.photo_url.startsWith('/uploads/')
        ? `${process.env.NEXT_PUBLIC_API_URL}${user.photo_url}`
        : `${process.env.NEXT_PUBLIC_API_URL}/uploads/avatars/${user.photo_url}`
      : profileImage
  }
  alt="Admin"
/> */}
                    <AvatarFallback className="bg-gradient-to-br from-[#004AAD] to-blue-500 text-white font-semibold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-none">{localStorage.getItem('auth_role') === "admin" ? user?.name ? user?.name : adminEmail.split('@')[0].charAt(0).toUpperCase() + adminEmail.split('@')[0].slice(1) : user?.name}</p>
                    <p className="text-xs text-slate-500">{localStorage.getItem('auth_role') ? localStorage.getItem('auth_role') : '--'}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-semibold">{localStorage.getItem('auth_role') === "admin" ? adminEmail.split('@')[0].charAt(0).toUpperCase() + adminEmail.split('@')[0].slice(1) : user?.name}</p>
                    <p className="text-xs text-slate-500 font-normal">{localStorage.getItem('auth_email') ? localStorage.getItem('auth_email') : '--'}</p>
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