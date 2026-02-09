import { Button } from '@/components/ui/button';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, Wrench } from 'lucide-react';

interface NotificationsHeaderProps {
  loading: boolean;
  lastRefresh: string;
  unreadCount: number;
  onRefresh: () => void;
  onMarkAllRead: () => void;
  onTestAPI: () => void;
}

export default function NotificationsHeader({
  loading,
  lastRefresh,
  unreadCount,
  onRefresh,
  onMarkAllRead,
  onTestAPI,
}: NotificationsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <CardTitle>All Notifications</CardTitle>
        <CardDescription>
          Live notifications - auto-refreshes every 30 seconds
          <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
            Last refresh: {lastRefresh}
          </span>
        </CardDescription>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
        >
          <Loader2 className="h-4 w-4 mr-2" />
          Refresh Now
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>

      </div>
    </div>
  );
}