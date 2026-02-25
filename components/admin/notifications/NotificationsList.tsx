
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Bell, Search } from 'lucide-react';
import { Notification } from '@/lib/notificationApi';
import { NotificationRedirectHandler } from './notification-utils';
import NotificationItem from './NotificationItem';

interface NotificationsListProps {
  notifications: Notification[];
  loading: boolean;
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (id: number) => void;
  redirectHandler: NotificationRedirectHandler;
  searchQuery?: string;
}

export default function NotificationsList({
  notifications,
  loading,
  onNotificationClick,
  onMarkAsRead,
  redirectHandler,
  searchQuery = '',
}: NotificationsListProps) {
  if (loading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-sm sm:text-base text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
        {searchQuery ? (
          <>
            <Search className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-sm">
              No notifications match your search "{searchQuery}". Try different keywords.
            </p>
          </>
        ) : (
          <>
            <Bell className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-sm">
              You'll see notifications here when tenants submit requests
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          redirectHandler={redirectHandler}
          onNotificationClick={onNotificationClick}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
      
      {/* End of list indicator */}
      {notifications.length > 0 && (
        <div className="text-center py-4">
          <Badge variant="outline" className="text-xs text-gray-500 bg-gray-50">
            End of list • {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}
    </div>
  );
}