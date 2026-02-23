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