

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
      className={`
        p-2 sm:p-3 md:p-4 rounded-lg border cursor-pointer transition-all 
        ${notification.is_read
          ? 'bg-white hover:bg-gray-50 border-gray-200'
          : 'bg-blue-50/70 hover:bg-blue-100/70 border-blue-200'
        }
      `}
      onClick={() => onNotificationClick(notification)}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row - Badges */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-1.5">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {/* Icon */}
              <div className="p-1 sm:p-1.5 rounded-lg bg-gray-100 shrink-0">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-600" />
              </div>
              
              {/* Title - Truncated */}
              <h3 className={`
                text-xs sm:text-sm font-medium truncate max-w-[120px] xs:max-w-[150px] sm:max-w-[200px] md:max-w-[250px]
                ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}
              `}>
                {notification.title}
              </h3>
            </div>

            {/* Badges Container */}
            <div className="flex items-center gap-1 flex-wrap">
              {/* Request Type Badge */}
              {requestTypeBadge && (
                <Badge className={`${requestTypeBadge.color} text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 sm:py-0.5 h-auto`}>
                  {requestTypeBadge.label}
                </Badge>
              )}
              
              {/* Priority Badge */}
              <Badge 
                variant="outline" 
                className={`${priorityColor} text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 sm:py-0.5 h-auto`}
              >
                {notification.priority}
              </Badge>
              
              {/* New Badge */}
              {!notification.is_read && (
                <Badge className="bg-blue-500 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 sm:py-0.5 h-auto">
                  New
                </Badge>
              )}
            </div>
          </div>

          {/* Message */}
          <p className={`
            text-[10px] sm:text-xs mb-2 line-clamp-2
            ${notification.is_read ? 'text-gray-500' : 'text-gray-600'}
          `}>
            {notification.message}
          </p>

          {/* Metadata Grid - Compact on Mobile */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px] xs:text-[9px] sm:text-xs text-gray-500">
            {notification.tenant_name && (
              <div className="flex items-center gap-0.5 sm:gap-1 truncate">
                <span className="font-medium shrink-0">Tenant:</span>
                <span className="truncate">{notification.tenant_name}</span>
              </div>
            )}
            
            {notification.entity_title && (
              <div className="flex items-center gap-0.5 sm:gap-1 truncate">
                <span className="font-medium shrink-0">Request:</span>
                <span className="truncate">{notification.entity_title}</span>
              </div>
            )}
            
            {notification.request_type && (
              <div className="flex items-center gap-0.5 sm:gap-1 truncate">
                <span className="font-medium shrink-0">Type:</span>
                <span className="truncate capitalize">
                  {notification.request_type.replace(/_/g, ' ')}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
              <span className="truncate">{formattedDateTime}</span>
            </div>
          </div>
        </div>

        {/* Actions - Right Side */}
        <div className="flex items-center justify-end sm:justify-start sm:ml-2">
          {!notification.is_read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="h-6 w-6 sm:h-7 sm:w-7 p-0 shrink-0"
            >
              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}