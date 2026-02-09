// "use client";

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   Bell, Check, Filter, Search, AlertCircle, 
//   Loader2, CheckCircle, AlertTriangle, Info, Clock,
//   Wrench, Receipt, Calendar, Users, FileText, Home
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { AdminHeader } from '@/components/admin/admin-header';
// import {
//   Notification,
//   getAdminNotifications,
//   getAdminUnreadCount,
//   getAdminNotificationStats,
//   markNotificationAsRead,
//   markAllAdminNotificationsAsRead,
//   testNotificationAPI
// } from '@/lib/notificationApi';
// import { toast } from 'sonner';
// import { format } from 'date-fns';

// export default function NotificationsPage() {
//   const router = useRouter();
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
//   const [stats, setStats] = useState({
//     total: 0,
//     unread: 0,
//     urgent: 0,
//     high: 0,
//     medium: 0,
//     low: 0,
//     tenant_requests: 0,
//     vacate_requests: 0
//   });

//   const intervalRef = useRef<NodeJS.Timeout | null>(null);

//   // Load notifications with auto-refresh
//   const loadNotifications = useCallback(async (showLoading = true) => {
//     try {
//       if (showLoading) setLoading(true);
//       console.log('🔄 Loading notifications...');
      
//       const [notificationsData, statsData, unreadData] = await Promise.all([
//         getAdminNotifications(100),
//         getAdminNotificationStats(),
//         getAdminUnreadCount()
//       ]);
      
//       setNotifications(notificationsData);
//       setStats(prev => ({
//         ...prev,
//         ...statsData,
//         unread: unreadData
//       }));
//       setLastRefresh(new Date());
      
//       console.log(`✅ Loaded ${notificationsData.length} notifications`);
      
//     } catch (error) {
//       console.error('Error loading data:', error);
//       toast.error('Failed to load notifications');
//     } finally {
//       if (showLoading) setLoading(false);
//     }
//   }, []);

//   // Auto-refresh effect
//   useEffect(() => {
//     // Initial load
//     loadNotifications(true);
    
//     // Set up auto-refresh every 30 seconds
//     intervalRef.current = setInterval(() => {
//       console.log('⏰ Auto-refreshing notifications...');
//       loadNotifications(false); // Silent refresh
//     }, 30000); // 30 seconds
    
//     // Cleanup interval on unmount
//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, [loadNotifications]);

//   const handleMarkAsRead = async (id: number) => {
//     try {
//       const success = await markNotificationAsRead(id);
//       if (success) {
//         setNotifications(prev => prev.map(notif => 
//           notif.id === id ? { ...notif, is_read: true } : notif
//         ));
//         toast.success('Marked as read');
//         // Refresh stats after marking as read
//         setTimeout(() => loadNotifications(false), 500);
//       }
//     } catch (error) {
//       toast.error('Failed to mark as read');
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     try {
//       const success = await markAllAdminNotificationsAsRead();
//       if (success) {
//         setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
//         toast.success('All notifications marked as read');
//         // Refresh stats after marking all as read
//         setTimeout(() => loadNotifications(false), 500);
//       }
//     } catch (error) {
//       toast.error('Failed to mark all as read');
//     }
//   };

//   // Function to determine redirect URL based on notification data
//   const getNotificationRedirectUrl = (notification: Notification): string => {
//     const { related_entity_type, related_entity_id, request_type } = notification;
    
//     // If we have related_entity_type and related_entity_id
//     if (related_entity_id) {
//       // First check request_type (from tenant request)
//       switch (request_type) {
//         case 'complaint':
//           return `/admin/complaints/${related_entity_id}`;
//         case 'maintenance':
//           return `/admin/maintenance/${related_entity_id}`;
//         case 'receipt':
//           return `/admin/receipts/${related_entity_id}`;
//         case 'leave':
//           return `/admin/leave-requests/${related_entity_id}`;
//         case 'vacate_bed':
//           return `/admin/vacate-requests/${related_entity_id}`;
//         case 'change_bed':
//           return `/admin/change-bed-requests/${related_entity_id}`;
//         default:
//           // Check related_entity_type as fallback
//           switch (related_entity_type?.toLowerCase()) {
//             case 'complaint':
//             case 'complaints':
//               return `/admin/complaints/${related_entity_id}`;
//             case 'maintenance':
//             case 'maintenance_request':
//               return `/admin/maintenance/${related_entity_id}`;
//             case 'receipt':
//               return `/admin/receipts/${related_entity_id}`;
//             case 'leave_request':
//             case 'leave_requests':
//               return `/admin/leave-requests/${related_entity_id}`;
//             case 'vacate_request':
//             case 'vacate_requests':
//               return `/admin/vacate-requests/${related_entity_id}`;
//             case 'change_bed_request':
//             case 'change_bed_requests':
//               return `/admin/change-bed-requests/${related_entity_id}`;
//             default:
//               return determineRedirectFromContent(notification);
//           }
//       }
//     }
    
//     // If no entity ID, try to determine from content
//     return determineRedirectFromContent(notification);
//   };

//   // Helper function to determine redirect from notification content
//   const determineRedirectFromContent = (notification: Notification): string => {
//     const lowerTitle = notification.title.toLowerCase();
//     const lowerMessage = notification.message.toLowerCase();
    
//     // Check for keywords in title and message
//     if (lowerTitle.includes('complaint') || lowerMessage.includes('complaint')) {
//       return '/admin/complaints';
//     }
//     if (lowerTitle.includes('maintenance') || lowerMessage.includes('maintenance')) {
//       return '/admin/maintenance';
//     }
//     if (lowerTitle.includes('receipt') || lowerMessage.includes('receipt')) {
//       return '/admin/receipts';
//     }
//     if (lowerTitle.includes('leave request') || lowerMessage.includes('leave request')) {
//       return '/admin/leave-requests';
//     }
//     if (lowerTitle.includes('vacate') || lowerMessage.includes('vacate')) {
//       return '/admin/vacate-requests';
//     }
//     if (lowerTitle.includes('change bed') || lowerMessage.includes('change bed')) {
//       return '/admin/change-bed-requests';
//     }
    
//     return '/admin/complaints'; // Default fallback
//   };

//   const handleNotificationClick = (notification: Notification) => {
//     // Mark as read if unread
//     if (!notification.is_read) {
//       handleMarkAsRead(notification.id);
//     }
    
//     // Get redirect URL
//     const redirectUrl = getNotificationRedirectUrl(notification);
    
//     // Navigate to the URL
//     router.push(redirectUrl);
//   };

//   // Get icon for notification type
//   const getNotificationIcon = (notification: Notification) => {
//     const { request_type, title, message } = notification;
//     const lowerTitle = title.toLowerCase();
//     const lowerMessage = message.toLowerCase();
    
//     // Check request_type first
//     switch (request_type) {
//       case 'complaint':
//         return AlertCircle;
//       case 'maintenance':
//         return Wrench;
//       case 'receipt':
//         return Receipt;
//       case 'leave':
//         return Calendar;
//       case 'vacate_bed':
//         return AlertCircle;
//       case 'change_bed':
//         return Users;
//       default:
//         // Fallback to content analysis
//         if (lowerTitle.includes('complaint') || lowerMessage.includes('complaint')) {
//           return AlertCircle;
//         }
//         if (lowerTitle.includes('maintenance') || lowerMessage.includes('maintenance')) {
//           return Wrench;
//         }
//         if (lowerTitle.includes('receipt') || lowerMessage.includes('receipt')) {
//           return Receipt;
//         }
//         if (lowerTitle.includes('leave request') || lowerMessage.includes('leave request')) {
//           return Calendar;
//         }
//         if (lowerTitle.includes('vacate') || lowerMessage.includes('vacate')) {
//           return AlertCircle;
//         }
//         if (lowerTitle.includes('change bed') || lowerMessage.includes('change bed')) {
//           return Users;
//         }
        
//         return Bell; // Default icon
//     }
//   };

//   const formatDateTime = (dateString: string) => {
//     try {
//       return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
//     } catch (error) {
//       return 'Invalid date';
//     }
//   };

//   const formatLastRefresh = () => {
//     return format(new Date(lastRefresh), 'hh:mm:ss a');
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'urgent':
//         return 'bg-red-100 text-red-800 border-red-200';
//       case 'high':
//         return 'bg-orange-100 text-orange-800 border-orange-200';
//       case 'medium':
//         return 'bg-blue-100 text-blue-800 border-blue-200';
//       case 'low':
//         return 'bg-green-100 text-green-800 border-green-200';
//       default:
//         return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   const getRequestTypeBadge = (notification: Notification) => {
//     const { request_type, title, message } = notification;
//     const lowerTitle = title.toLowerCase();
//     const lowerMessage = message.toLowerCase();
    
//     // Check request_type first
//     switch (request_type) {
//       case 'complaint':
//         return { label: 'Complaint', color: 'bg-red-500 text-white' };
//       case 'maintenance':
//         return { label: 'Maintenance', color: 'bg-orange-500 text-white' };
//       case 'receipt':
//         return { label: 'Receipt', color: 'bg-green-500 text-white' };
//       case 'leave':
//         return { label: 'Leave Request', color: 'bg-blue-500 text-white' };
//       case 'vacate_bed':
//         return { label: 'Vacate Request', color: 'bg-purple-500 text-white' };
//       case 'change_bed':
//         return { label: 'Change Bed', color: 'bg-cyan-500 text-white' };
//       default:
//         // Fallback to content analysis
//         if (lowerTitle.includes('complaint') || lowerMessage.includes('complaint')) {
//           return { label: 'Complaint', color: 'bg-red-500 text-white' };
//         }
//         if (lowerTitle.includes('maintenance') || lowerMessage.includes('maintenance')) {
//           return { label: 'Maintenance', color: 'bg-orange-500 text-white' };
//         }
//         if (lowerTitle.includes('receipt') || lowerMessage.includes('receipt')) {
//           return { label: 'Receipt', color: 'bg-green-500 text-white' };
//         }
//         if (lowerTitle.includes('leave request') || lowerMessage.includes('leave request')) {
//           return { label: 'Leave Request', color: 'bg-blue-500 text-white' };
//         }
//         if (lowerTitle.includes('vacate') || lowerMessage.includes('vacate')) {
//           return { label: 'Vacate Request', color: 'bg-purple-500 text-white' };
//         }
//         if (lowerTitle.includes('change bed') || lowerMessage.includes('change bed')) {
//           return { label: 'Change Bed', color: 'bg-cyan-500 text-white' };
//         }
        
//         return null;
//     }
//   };

//   const handleTestAPI = async () => {
//     toast.info('Testing API connections...');
//     const results = await testNotificationAPI();
//     const failed = results.filter(r => r.error || !r.ok);
    
//     if (failed.length === 0) {
//       toast.success('All API endpoints are working!');
//     } else {
//       toast.error(`${failed.length} API endpoints failed`);
//       console.log('Failed API tests:', failed);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <AdminHeader title="Notifications" />
      
//       <div className="max-w-7xl mx-auto p-6">

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Total</p>
//                   <p className="text-2xl font-bold">{stats.total}</p>
//                 </div>
//                 <div className="p-3 bg-blue-100 rounded-full">
//                   <Bell className="h-6 w-6 text-blue-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Unread</p>
//                   <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
//                 </div>
//                 <div className="p-3 bg-red-100 rounded-full">
//                   <AlertCircle className="h-6 w-6 text-red-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Urgent</p>
//                   <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
//                 </div>
//                 <div className="p-3 bg-red-100 rounded-full">
//                   <AlertTriangle className="h-6 w-6 text-red-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Requests</p>
//                   <p className="text-2xl font-bold text-green-600">{stats.tenant_requests}</p>
//                 </div>
//                 <div className="p-3 bg-green-100 rounded-full">
//                   <AlertCircle className="h-6 w-6 text-green-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <Card>
//           <CardHeader>
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//               <div>
//                 <CardTitle>All Notifications</CardTitle>
//                 <CardDescription>
//                   Live notifications - auto-refreshes every 30 seconds
//                   <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
//                     Last refresh: {formatLastRefresh()}
//                   </span>
//                 </CardDescription>
//               </div>
              
//               <div className="flex items-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => loadNotifications(true)}
//                 >
//                   <Loader2 className="h-4 w-4 mr-2" />
//                   Refresh Now
//                 </Button>
                
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={handleMarkAllAsRead}
//                   disabled={stats.unread === 0}
//                 >
//                   <CheckCircle className="h-4 w-4 mr-2" />
//                   Mark All Read
//                 </Button>
//               </div>
//             </div>
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
//             {loading && notifications.length === 0 ? (
//               <div className="text-center py-12">
//                 <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
//                 <p className="text-gray-600">Loading notifications...</p>
//                 <p className="text-sm text-gray-400 mt-2">
//                   Auto-refresh is enabled (30 seconds)
//                 </p>
//               </div>
//             ) : notifications.length === 0 ? (
//               <div className="text-center py-12">
//                 <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
//                 <p className="text-gray-600 mb-4">
//                   You'll see notifications here when tenants submit requests
//                 </p>
//                 <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   <span>Auto-refreshing every 30 seconds...</span>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {notifications.map((notification) => {
//                   const RequestIcon = getNotificationIcon(notification);
//                   const requestTypeBadge = getRequestTypeBadge(notification);
                  
//                   return (
//                     <div
//                       key={notification.id}
//                       className={`p-4 rounded-lg border cursor-pointer transition-all ${
//                         notification.is_read
//                           ? 'bg-white hover:bg-gray-50 border-gray-200'
//                           : 'bg-blue-50 hover:bg-blue-100 border-blue-200'
//                       }`}
//                       onClick={() => handleNotificationClick(notification)}
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-2 mb-2">
//                             <div className="p-2 rounded-lg bg-gray-100">
//                               <RequestIcon className="h-4 w-4 text-gray-600" />
//                             </div>
//                             <h3 className={`font-medium truncate ${
//                               notification.is_read ? 'text-gray-700' : 'text-gray-900'
//                             }`}>
//                               {notification.title}
//                             </h3>
                            
//                             {/* Request Type Badge */}
//                             {requestTypeBadge && (
//                               <Badge className={requestTypeBadge.color}>
//                                 {requestTypeBadge.label}
//                               </Badge>
//                             )}
                            
//                             {/* Priority Badge */}
//                             <Badge 
//                               variant="outline" 
//                               className={`${getPriorityColor(notification.priority)} text-xs`}
//                             >
//                               {notification.priority}
//                             </Badge>
                            
//                             {/* New Badge */}
//                             {!notification.is_read && (
//                               <Badge className="bg-blue-500 text-white text-xs">
//                                 New
//                               </Badge>
//                             )}
//                           </div>

//                           <p className={`text-sm mb-3 ${
//                             notification.is_read ? 'text-gray-600' : 'text-gray-700'
//                           }`}>
//                             {notification.message}
//                           </p>

//                           {/* Metadata */}
//                           <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
//                             {notification.tenant_name && (
//                               <div className="flex items-center gap-1">
//                                 <span className="font-medium">Tenant: </span>
//                                 <span>{notification.tenant_name}</span>
//                               </div>
//                             )}
                            
//                             {notification.entity_title && (
//                               <div className="flex items-center gap-1">
//                                 <span className="font-medium">Request: </span>
//                                 <span>{notification.entity_title}</span>
//                               </div>
//                             )}
                            
//                             {notification.request_type && (
//                               <div className="flex items-center gap-1">
//                                 <span className="font-medium">Type: </span>
//                                 <span>
//                                   {notification.request_type.replace('_', ' ')}
//                                 </span>
//                               </div>
//                             )}
                            
//                             <div className="ml-auto flex items-center gap-1">
//                               <Clock className="h-3 w-3" />
//                               <span>{formatDateTime(notification.created_at)}</span>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Actions */}
//                         <div className="flex items-center gap-2 ml-4">
//                           {!notification.is_read && (
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleMarkAsRead(notification.id);
//                               }}
//                               className="h-8 px-2"
//                             >
//                               <Check className="h-4 w-4" />
//                             </Button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}

//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import NotificationsClientPage from '@/components/admin/notifications/NotificationsClientPage';
import { getAdminNotifications, getAdminNotificationStats, getAdminUnreadCount, Notification } from '@/lib/notificationApi';
import { NotificationsLoading } from '@/components/admin/notifications/NotificationsLoading';

export default function NotificationsPage() {
  const [initialNotifications, setInitialNotifications] = useState<Notification[]>([]);
  const [initialStats, setInitialStats] = useState<any>(null);
  const [initialUnreadCount, setInitialUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminNotifications(50),
      getAdminNotificationStats(),
      getAdminUnreadCount()
    ])
      .then(([notificationsData, statsData, unreadData]) => {
        setInitialNotifications(Array.isArray(notificationsData) ? notificationsData : []);
        setInitialStats(statsData);
        setInitialUnreadCount(unreadData);
      })
      .catch((err) => console.error('Error fetching initial data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <NotificationsLoading />;
  return (
    <NotificationsClientPage 
      initialNotifications={initialNotifications}
      initialStats={initialStats}
      initialUnreadCount={initialUnreadCount}
    />
  );
}