import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Bell } from 'lucide-react';
import { Notification } from '@/lib/notificationApi';
import { NotificationRedirectHandler } from './notification-utils';
import NotificationItem from './NotificationItem';

interface NotificationsListProps {
  notifications: Notification[];
  loading: boolean;
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (id: number) => void;
  redirectHandler: NotificationRedirectHandler;
}

export default function NotificationsList({
  notifications,
  loading,
  onNotificationClick,
  onMarkAsRead,
  redirectHandler,
}: NotificationsListProps) {
  if (loading && notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
        <p className="text-gray-600 mb-4">
          You'll see notifications here when tenants submit requests
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          redirectHandler={redirectHandler}
          onNotificationClick={onNotificationClick}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}