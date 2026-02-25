// "use client";

// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { useRouter } from '@/src/compat/next-navigation';
// // import { AdminHeader } from '@/components/admin/admin-header';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { toast } from 'sonner';
// import { 
//   Bell, Search, Loader2, CheckCircle,
//   AlertCircle, AlertTriangle, Clock
// } from 'lucide-react';
// import {
//   Notification,
//   getAdminNotifications,
//   getAdminUnreadCount,
//   getAdminNotificationStats,
//   markNotificationAsRead,
//   markAllAdminNotificationsAsRead,
//   testNotificationAPI
// } from '@/lib/notificationApi';
// import NotificationsStats from './NotificationsStats';
// import NotificationsHeader from './NotificationsHeader';
// import NotificationsList from './NotificationsList';
// import { NotificationRedirectHandler } from './notification-utils';
// import { useNotificationWebSocket } from './useNotificationWebSocket';

// // This is the client component - NO metadata export here
// interface NotificationsClientPageProps {
//   initialNotifications: Notification[];
//   initialStats: any;
//   initialUnreadCount: number;
// }

// export default function NotificationsClientPage({
//   initialNotifications,
//   initialStats,
//   initialUnreadCount,
// }: NotificationsClientPageProps) {
//   const router = useRouter();
  
//   // State management
//   const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
//   const [loading, setLoading] = useState(false);
//   const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
//   const [stats, setStats] = useState(() => ({
//     ...initialStats,
//     unread: initialUnreadCount
//   }));

//   // Initialize notification utilities
//   const redirectHandler = useMemo(() => new NotificationRedirectHandler(), []);
  
//   // WebSocket for real-time updates
//   useNotificationWebSocket({
//     onNewNotification: (notification) => {
//       setNotifications(prev => [notification, ...prev]);
//       setStats((prev: { [x: string]: number; total: number; unread: number; }) => ({
//         ...prev,
//         total: prev.total + 1,
//         unread: prev.unread + 1,
//         [notification.priority]: prev[notification.priority] + 1
//       }));
//       toast.info('New notification received!');
//     },
//     onNotificationRead: (notificationId) => {
//       setNotifications(prev => prev.map(notif => 
//         notif.id === notificationId ? { ...notif, is_read: true } : notif
//       ));
//       setStats((prev: { unread: number; }) => ({
//         ...prev,
//         unread: Math.max(0, prev.unread - 1)
//       }));
//     }
//   });

//   // Load notifications with useCallback for memoization
//   const loadNotifications = useCallback(async (showLoading = true) => {
//     try {
//       if (showLoading) setLoading(true);
      
//       // Use Promise.all for parallel loading
//       const [notificationsData, statsData, unreadData] = await Promise.all([
//         getAdminNotifications(100),
//         getAdminNotificationStats(),
//         getAdminUnreadCount()
//       ]);
      
//       setNotifications(notificationsData);
//       setStats((prev: any) => ({
//         ...prev,
//         ...statsData,
//         unread: unreadData
//       }));
//       setLastRefresh(new Date());
      
//     } catch (error) {
//       console.error('Error loading data:', error);
//       toast.error('Failed to load notifications');
//     } finally {
//       if (showLoading) setLoading(false);
//     }
//   }, []);

//   // Mark notification as read
//   const handleMarkAsRead = useCallback(async (id: number) => {
//     try {
//       const success = await markNotificationAsRead(id);
//       if (success) {
//         // Optimistic update
//         setNotifications(prev => prev.map(notif => 
//           notif.id === id ? { ...notif, is_read: true } : notif
//         ));
//         setStats((prev: { unread: number; }) => ({
//           ...prev,
//           unread: Math.max(0, prev.unread - 1)
//         }));
//         toast.success('Marked as read');
//       }
//     } catch (error) {
//       toast.error('Failed to mark as read');
//     }
//   }, []);

//   // Mark all notifications as read
//   const handleMarkAllAsRead = useCallback(async () => {
//     try {
//       const success = await markAllAdminNotificationsAsRead();
//       if (success) {
//         // Optimistic update
//         setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
//         setStats((prev: any) => ({
//           ...prev,
//           unread: 0
//         }));
//         toast.success('All notifications marked as read');
//       }
//     } catch (error) {
//       toast.error('Failed to mark all as read');
//     }
//   }, []);

//   // Handle notification click with navigation
//   const handleNotificationClick = useCallback((notification: Notification) => {
//     // Mark as read if unread (optimistic update)
//     if (!notification.is_read) {
//       setNotifications(prev => prev.map(notif => 
//         notif.id === notification.id ? { ...notif, is_read: true } : notif
//       ));
//       setStats((prev: { unread: number; }) => ({
//         ...prev,
//         unread: Math.max(0, prev.unread - 1)
//       }));
//       // Async mark as read
//       markNotificationAsRead(notification.id).catch(console.error);
//     }
    
//     // Get redirect URL and navigate
//     const redirectUrl = redirectHandler.getRedirectUrl(notification);
//     router.push(redirectUrl);
//   }, [router, redirectHandler]);

//   // Test API endpoint
//   const handleTestAPI = useCallback(async () => {
//     toast.info('Testing API connections...');
//     const results = await testNotificationAPI();
//     const failed = results.filter(r => r.error || !r.ok);
    
//     if (failed.length === 0) {
//       toast.success('All API endpoints are working!');
//     } else {
//       toast.error(`${failed.length} API endpoints failed`);
//     }
//   }, []);

//   // Memoized stats data
//   const statsData = useMemo(() => stats, [stats]);

//   // Memoized formatted last refresh
//   const formattedLastRefresh = useMemo(() => {
//     return new Date(lastRefresh).toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit'
//     });
//   }, [lastRefresh]);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* <AdminHeader title="Notifications" description={''} /> */}
      
//       <div className="max-w-7xl mx-auto p-0">
//         {/* Stats Cards */}
//         <NotificationsStats stats={statsData} />

//         {/* Main Card */}
//         <Card>
//           <CardHeader>
//             <NotificationsHeader
//                           loading={loading}
//                           lastRefresh={formattedLastRefresh}
//                           unreadCount={stats.unread}
//                           onRefresh={() => loadNotifications(true)}
//                           onMarkAllRead={handleMarkAllAsRead} onTestAPI={function (): void {
//                               throw new Error('Function not implemented.');
//                           } }            //   onTestAPI={handleTestAPI}
//             />
//           </CardHeader>
          
//           <CardContent>
//             {/* Search */}
//             <div className="mb-6">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input
//                   placeholder="Search notifications..."
//                   className="pl-10"
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             {/* Notifications List */}
//             <NotificationsList
//               notifications={notifications}
//               loading={loading}
//               onNotificationClick={handleNotificationClick}
//               onMarkAsRead={handleMarkAsRead}
//               redirectHandler={redirectHandler}
//             />
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from '@/src/compat/next-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Bell, Search, Loader2, CheckCircle,
  AlertCircle, AlertTriangle, Clock, X
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
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
      setNotifications(prev => [notification, ...prev]);
      setStats((prev: any) => ({
        ...prev,
        total: prev.total + 1,
        unread: prev.unread + 1,
        [notification.priority]: prev[notification.priority] + 1
      }));
      toast.info('New notification received!');
    },
    onNotificationRead: (notificationId) => {
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
      setStats((prev: { unread: number; }) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
    }
  });

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNotifications(notifications);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = notifications.filter(notif => 
        notif.message?.toLowerCase().includes(query) ||
        notif.type?.toLowerCase().includes(query) ||
        notif.priority?.toLowerCase().includes(query) ||
        notif.data?.tenant_name?.toLowerCase().includes(query) ||
        notif.data?.property_name?.toLowerCase().includes(query) ||
        notif.data?.room_number?.toLowerCase().includes(query) ||
        notif.title?.toLowerCase().includes(query)
      );
      setFilteredNotifications(filtered);
    }
  }, [searchQuery, notifications]);

  // Load notifications
  const loadNotifications = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const [notificationsData, statsData, unreadData] = await Promise.all([
        getAdminNotifications(100),
        getAdminNotificationStats(),
        getAdminUnreadCount()
      ]);
      
      setNotifications(notificationsData);
      setFilteredNotifications(notificationsData);
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

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const success = await markAllAdminNotificationsAsRead();
      if (success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
        setFilteredNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
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

  // Handle notification click
  const handleNotificationClick = useCallback((notification: Notification) => {
    if (!notification.is_read) {
      setNotifications(prev => prev.map(notif => 
        notif.id === notification.id ? { ...notif, is_read: true } : notif
      ));
      setFilteredNotifications(prev => prev.map(notif => 
        notif.id === notification.id ? { ...notif, is_read: true } : notif
      ));
      setStats((prev: { unread: number; }) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
      markNotificationAsRead(notification.id).catch(console.error);
    }
    
    const redirectUrl = redirectHandler.getRedirectUrl(notification);
    router.push(redirectUrl);
  }, [router, redirectHandler]);

  // Test API
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

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const statsData = useMemo(() => stats, [stats]);
  const formattedLastRefresh = useMemo(() => {
    return new Date(lastRefresh).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [lastRefresh]);

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto p-2 sm:p-3 lg:p-2">
        {/* Stats Cards */}
        <NotificationsStats stats={statsData} className='sticky top-20 z-10' />

        {/* Main Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-0 px-4 sm:px-2">
            <NotificationsHeader
              loading={loading}
              lastRefresh={formattedLastRefresh}
              unreadCount={stats.unread}
              searchQuery={searchQuery}
              onRefresh={() => loadNotifications(true)}
              onMarkAllRead={handleMarkAllAsRead}
              onTestAPI={handleTestAPI}
              onSearchChange={setSearchQuery}
              onClearSearch={clearSearch}
            />
          </CardHeader>
          
          <CardContent className="p-3 sm:p-6">
            {/* Search results count - shown when searching */}
            {searchQuery && (
              <div className="mb-3 px-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Found {filteredNotifications.length} result{filteredNotifications.length !== 1 ? 's' : ''} for "{searchQuery}"
                </Badge>
              </div>
            )}

            {/* Notifications List with Scroll */}
            <div className={`
              ${filteredNotifications.length > 0 
                ? 'max-h-[calc(100vh-410px)] sm:max-h-[calc(100vh-450px)] lg:max-h-[calc(100vh-400px)]' 
                : ''}
              overflow-y-auto pr-1 -mr-1
              [&::-webkit-scrollbar]:w-2
              [&::-webkit-scrollbar-track]:bg-gray-100
              [&::-webkit-scrollbar-track]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-gray-300
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:hover:bg-gray-400
            `}>
              <NotificationsList
                notifications={filteredNotifications}
                loading={loading}
                onNotificationClick={handleNotificationClick}
                onMarkAsRead={handleMarkAsRead}
                redirectHandler={redirectHandler}
                searchQuery={searchQuery}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}