// app/tenant/notifications/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CreditCard,
  AlertCircle,
  Wrench,
  Users,
  Move,
  MapPin,
  UserX,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  RefreshCw,
  CheckCheck,
  Filter,
  Inbox
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  getTenantNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "@/lib/tenantNotificationsApi";
import { markNoticePeriodAsSeen } from "@/lib/noticePeriodApi";

// Notification Icon Mapper
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "payment": return <CreditCard className="h-4 w-4 text-blue-600" />;
    case "complaint": return <AlertCircle className="h-4 w-4 text-orange-600" />;
    case "maintenance": return <Wrench className="h-4 w-4 text-purple-600" />;
    case "leave": return <Users className="h-4 w-4 text-green-600" />;
    case "change bed": return <Move className="h-4 w-4 text-teal-600" />;
    case "vacate bed": return <MapPin className="h-4 w-4 text-red-600" />;
    case "account deletion": return <UserX className="h-4 w-4 text-gray-600" />;
    case "document": return <FileText className="h-4 w-4 text-purple-600" />;
    case "event": return <Calendar className="h-4 w-4 text-green-600" />;
      case "notice_period": return <Bell className="h-4 w-4 text-amber-600" />;
    default: return <Bell className="h-4 w-4 text-gray-600" />;
  }
};

// Status Badge Component
const StatusBadge = ({ status }: { status: 'read' | 'unread' }) => {
  return status === 'unread' ? (
    <div className="h-2 w-2 bg-blue-600 rounded-full" />
  ) : null;
};

// Notification Item Component
const NotificationItem = ({ 
  notification, 
  noitceAsSeen,
  onMarkRead,
  formatDateTime 
}: { 
  notification: Notification; 
  onMarkRead: (id: number) => void;
  formatDateTime: (date: string) => string;
  noitceAsSeen : any;
}) => {
  const type = notification.notification_type || notification.type || 'general';
  
  return (
    <div 
      className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
        !notification.is_read 
          ? "bg-blue-50/50 border-blue-200 hover:bg-blue-50" 
          : "bg-white border-slate-200 hover:border-slate-300"
      }`}
      onClick={() => {onMarkRead(notification.id), noitceAsSeen(notification)} }
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          notification.is_read ? "bg-slate-100" : "bg-blue-100"
        }`}>
          {getNotificationIcon(type)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm text-slate-800">
                  {notification.title}
                </h3>
                {!notification.is_read && (
                  <Badge className="bg-blue-600 text-white text-[8px] px-1.5 py-0 h-4">
                    NEW
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-600 mb-2">{notification.message}</p>
              
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(notification.created_at)}
                </span>
                
                {notification.related_entity_type && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {notification.related_entity_type}
                    </Badge>
                  </>
                )}
                
                {notification.priority && notification.priority !== 'normal' && (
                  <>
                    <span>•</span>
                    <Badge className={
                      notification.priority === 'urgent' ? 'bg-red-100 text-red-700 border-red-200' :
                      notification.priority === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                      'bg-blue-100 text-blue-700 border-blue-200'
                    }>
                      {notification.priority}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            {notification.type === "notice_period" && notification.is_read && (
              <div className="bg-blue-600 rounded-full px-2 py-1 text-white text-[10px] font-medium">
                seen
              </div>
            )}
            {notification.type === "notice_period"&& !notification.is_read && (
              <div className="bg-blue-800 rounded-full px-2 py-1 text-white text-[10px] font-medium">
                unseen
              </div>
            )}
            <StatusBadge status={notification.is_read ? 'read' : 'unread'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TenantNotificationsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

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

  const fetchNotifications = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const [notifs, count] = await Promise.all([
        getTenantNotifications(100),
        getUnreadNotificationCount()
      ]);
      
      const formattedNotifs = notifs.map(n => ({
        ...n,
        type: n.notification_type || n.type || 'general'
      }));
      
      setNotifications(formattedNotifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const handleMarkAsRead = useCallback(async (id: number) => {
    try {
      const notification = notifications.find(n => n.id === id);
      if (notification?.is_read) return;

      await markNotificationAsRead(id);
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [notifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const marked = await markAllNotificationsAsRead();
      if (marked > 0) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast.success(`${marked} notifications marked as read`);
      } else {
        toast.info('No unread notifications');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  }, []);

// app/tenant/notifications/page.tsx - COMPLETE REPLACEMENT for handleNotificationClick

const handleNotificationClick = useCallback(async (notification: Notification) => {
  
  // First mark the notification as read
  await handleMarkAsRead(notification.id);

  // Check if this is a notice period notification
  const type = notification.notification_type || notification.type;

  const isNoticePeriod = type === "notice_period" || 
                         notification.related_entity_type === "notice_period" ||
                         (notification.title && notification.title.includes("Notice Period"));


  // CRITICAL: For notice period notifications, mark as seen in the database
  if (isNoticePeriod && notification.related_entity_id) {
    try {
      const result = await markNoticePeriodAsSeen(notification.related_entity_id);

      
      if (result.success) {
        toast.success('Notice period marked as seen');
        
        // Force refresh the notifications list to update UI
        setTimeout(() => {
          fetchNotifications(true);
        }, 500);
      } else {
        toast.error(result.message || 'Failed to mark as seen');
      }
    } catch (error) {
      console.error('❌ Failed to mark notice period as seen:', error);
      toast.error('Failed to mark notice period as seen');
    }
  }

  // Navigate based on notification type
  if (type === "complaint" || type === "maintenance") {
    navigate("/tenant/requests");
  } else if (type === "leave") {
    navigate("/tenant/requests");
  } else if (type === "change bed" || type === "vacate bed") {
    navigate("/tenant/requests");
  } else if (type === "account deletion") {
    navigate("/tenant/profile");
  } else if (type === "payment") {
    navigate("/tenant/payments");
  } else if (type === "document") {
    navigate("/tenant/documents");
  } else if (type === "notice_period") {
    // Stay on notifications page - already refreshed above
  }
}, [handleMarkAsRead, navigate, fetchNotifications]);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.is_read) return false;
    if (filter === 'read' && !notification.is_read) return false;
    
    const type = notification.notification_type || notification.type || 'general';
    if (typeFilter !== 'all' && type !== typeFilter) return false;
    
    return true;
  });

  // Get unique notification types for filter
  const notificationTypes = ['all', ...new Set(
    notifications.map(n => n.notification_type || n.type || 'general')
  )];

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-20 rounded-xl" />
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      {/* <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/tenant/portal#dashboard')}
            className="h-8 w-8 text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Notifications</h1>
            <p className="text-xs text-slate-500">Stay updated with your latest activities</p>
          </div>
          <Badge className="ml-auto bg-[#e6f0ff] text-[#004aad] border-none">
            {unreadCount} Unread
          </Badge>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Action Bar */}
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#004aad]" />
                <span className="text-sm font-medium text-slate-700">
                  {filteredNotifications.length} Notifications
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleMarkAllAsRead}
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => fetchNotifications(true)}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
                  <Inbox className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">No notifications</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {notifications.length === 0
                    ? "You don't have any notifications yet. When you get notifications, they'll appear here."
                    : "No notifications match your current filters."}
                </p>
                {filter !== 'all' && (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-4 text-[#004aad]"
                    onClick={() => setFilter('all')}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkAsRead}
                    noitceAsSeen={handleNotificationClick}
                    formatDateTime={formatDateTime}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Footer */}
        {notifications.length > 0 && (
          <Card className="bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-[#004aad]/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-slate-600">Total: {notifications.length}</span>
                  <span className="text-slate-600">Unread: {unreadCount}</span>
                  <span className="text-slate-600">Read: {notifications.length - unreadCount}</span>
                </div>
                <Badge className="bg-[#004aad] text-white border-none text-[10px]">
                  Last updated: {new Date().toLocaleTimeString()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}