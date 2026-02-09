import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock } from 'lucide-react';
import { Notification } from '@/lib/notificationApi';
import { NotificationRedirectHandler } from './notification-utils';
import { useMemo } from 'react';

interface NotificationItemProps {
  notification: Notification;
  redirectHandler: NotificationRedirectHandler;
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (id: number) => void;
}

export default function NotificationItem({
  notification,
  redirectHandler,
  onNotificationClick,
  onMarkAsRead,
}: NotificationItemProps) {
  // Memoize request type badge
  const requestTypeBadge = useMemo(() => 
    redirectHandler.getRequestTypeBadge(notification), 
    [notification, redirectHandler]
  );

  // Memoize priority color
  const priorityColor = useMemo(() => 
    redirectHandler.getPriorityColor(notification.priority), 
    [notification.priority]
  );

  // Memoize formatted date
  const formattedDateTime = useMemo(() => {
    try {
      return new Date(notification.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  }, [notification.created_at]);

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        notification.is_read
          ? 'bg-white hover:bg-gray-50 border-gray-200'
          : 'bg-blue-50 hover:bg-blue-100 border-blue-200'
      }`}
      onClick={() => onNotificationClick(notification)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gray-100">
              <Clock className="h-4 w-4 text-gray-600" />
            </div>
            <h3 className={`font-medium truncate ${
              notification.is_read ? 'text-gray-700' : 'text-gray-900'
            }`}>
              {notification.title}
            </h3>
            
            {/* Request Type Badge */}
            {requestTypeBadge && (
              <Badge className={requestTypeBadge.color}>
                {requestTypeBadge.label}
              </Badge>
            )}
            
            {/* Priority Badge */}
            <Badge 
              variant="outline" 
              className={`${priorityColor} text-xs`}
            >
              {notification.priority}
            </Badge>
            
            {/* New Badge */}
            {!notification.is_read && (
              <Badge className="bg-blue-500 text-white text-xs">
                New
              </Badge>
            )}
          </div>

          <p className={`text-sm mb-3 ${
            notification.is_read ? 'text-gray-600' : 'text-gray-700'
          }`}>
            {notification.message}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {notification.tenant_name && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Tenant: </span>
                <span>{notification.tenant_name}</span>
              </div>
            )}
            
            {notification.entity_title && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Request: </span>
                <span>{notification.entity_title}</span>
              </div>
            )}
            
            {notification.request_type && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Type: </span>
                <span>
                  {notification.request_type.replace('_', ' ')}
                </span>
              </div>
            )}
            
            <div className="ml-auto flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formattedDateTime}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {!notification.is_read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="h-8 px-2"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}