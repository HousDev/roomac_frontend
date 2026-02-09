"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from '@/src/compat/next-navigation';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Bell, Search, Loader2, CheckCircle,
  AlertCircle, AlertTriangle, Clock
} from 'lucide-react';
import {
  Notification,
  getAdminNotifications,
  getAdminUnreadCount,
  getAdminNotificationStats,
  markNotificationAsRead,
  markAllAdminNotificationsAsRead,
  testNotificationAPI
} from '@/lib/notificationApi';
import NotificationsStats from './NotificationsStats';
import NotificationsHeader from './NotificationsHeader';
import NotificationsList from './NotificationsList';
import { NotificationRedirectHandler } from './notification-utils';
import { useNotificationWebSocket } from './useNotificationWebSocket';

// This is the client component - NO metadata export here
interface NotificationsClientPageProps {
  initialNotifications: Notification[];
  initialStats: any;
  initialUnreadCount: number;
}

export default function NotificationsClientPage({
  initialNotifications,
  initialStats,
  initialUnreadCount,
}: NotificationsClientPageProps) {
  const router = useRouter();
  
  // State management
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [stats, setStats] = useState(() => ({
    ...initialStats,
    unread: initialUnreadCount
  }));

  // Initialize notification utilities
  const redirectHandler = useMemo(() => new NotificationRedirectHandler(), []);
  
  // WebSocket for real-time updates
  useNotificationWebSocket({
    onNewNotification: (notification) => {
      console.log('🔔 New real-time notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      setStats((prev: { [x: string]: number; total: number; unread: number; }) => ({
        ...prev,
        total: prev.total + 1,
        unread: prev.unread + 1,
        [notification.priority]: prev[notification.priority] + 1
      }));
      toast.info('New notification received!');
    },
    onNotificationRead: (notificationId) => {
      console.log('✅ Notification marked as read:', notificationId);
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
      setStats((prev: { unread: number; }) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
    }
  });

  // Load notifications with useCallback for memoization
  const loadNotifications = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      // Use Promise.all for parallel loading
      const [notificationsData, statsData, unreadData] = await Promise.all([
        getAdminNotifications(100),
        getAdminNotificationStats(),
        getAdminUnreadCount()
      ]);
      
      setNotifications(notificationsData);
      setStats((prev: any) => ({
        ...prev,
        ...statsData,
        unread: unreadData
      }));
      setLastRefresh(new Date());
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load notifications');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Mark notification as read
  const handleMarkAsRead = useCallback(async (id: number) => {
    try {
      const success = await markNotificationAsRead(id);
      if (success) {
        // Optimistic update
        setNotifications(prev => prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        ));
        setStats((prev: { unread: number; }) => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        }));
        toast.success('Marked as read');
      }
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  }, []);

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const success = await markAllAdminNotificationsAsRead();
      if (success) {
        // Optimistic update
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
        setStats((prev: any) => ({
          ...prev,
          unread: 0
        }));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  }, []);

  // Handle notification click with navigation
  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read if unread (optimistic update)
    if (!notification.is_read) {
      setNotifications(prev => prev.map(notif => 
        notif.id === notification.id ? { ...notif, is_read: true } : notif
      ));
      setStats((prev: { unread: number; }) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
      // Async mark as read
      markNotificationAsRead(notification.id).catch(console.error);
    }
    
    // Get redirect URL and navigate
    const redirectUrl = redirectHandler.getRedirectUrl(notification);
    router.push(redirectUrl);
  }, [router, redirectHandler]);

  // Test API endpoint
  const handleTestAPI = useCallback(async () => {
    toast.info('Testing API connections...');
    const results = await testNotificationAPI();
    const failed = results.filter(r => r.error || !r.ok);
    
    if (failed.length === 0) {
      toast.success('All API endpoints are working!');
    } else {
      toast.error(`${failed.length} API endpoints failed`);
    }
  }, []);

  // Memoized stats data
  const statsData = useMemo(() => stats, [stats]);

  // Memoized formatted last refresh
  const formattedLastRefresh = useMemo(() => {
    return new Date(lastRefresh).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [lastRefresh]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Notifications" description={''} />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <NotificationsStats stats={statsData} />

        {/* Main Card */}
        <Card>
          <CardHeader>
            <NotificationsHeader
                          loading={loading}
                          lastRefresh={formattedLastRefresh}
                          unreadCount={stats.unread}
                          onRefresh={() => loadNotifications(true)}
                          onMarkAllRead={handleMarkAllAsRead} onTestAPI={function (): void {
                              throw new Error('Function not implemented.');
                          } }            //   onTestAPI={handleTestAPI}
            />
          </CardHeader>
          
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Notifications List */}
            <NotificationsList
              notifications={notifications}
              loading={loading}
              onNotificationClick={handleNotificationClick}
              onMarkAsRead={handleMarkAsRead}
              redirectHandler={redirectHandler}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}