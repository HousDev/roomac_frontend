import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, CheckCheck, TestTube, Search, X } from 'lucide-react';

interface NotificationsHeaderProps {
  loading: boolean;
  lastRefresh: string;
  unreadCount: number;
  searchQuery: string;
  onRefresh: () => void;
  onMarkAllRead: () => void;
  onTestAPI: () => void;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export default function NotificationsHeader({
  loading,
  lastRefresh,
  unreadCount,
  searchQuery,
  onRefresh,
  onMarkAllRead,
  onTestAPI,
  onSearchChange,
  onClearSearch,
}: NotificationsHeaderProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Title Section - Uncomment if you want title */}
      {/* <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-xs sm:text-sm text-gray-500">Manage system notifications</p>
      </div> */}

      {/* Live notifications text - Mobile Only */}
      <div className="sm:hidden">
        <h2 className="text-sm font-semibold text-gray-800">All Notifications</h2>
        <p className="text-xs text-gray-500">
          Live notifications - auto-refreshes every 30 seconds
        </p>
        <p className="text-xs text-gray-400">Last refresh: {lastRefresh}</p>
      </div>

      {/* Desktop View - Original Layout */}
      <div className="hidden sm:flex sm:flex-col sm:gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">All Notifications</h2>
            <p className="text-sm text-gray-500">
              Live notifications - auto-refreshes every 30 seconds
              <span className="ml-1 text-gray-400">Last refresh: {lastRefresh}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="text-sm h-9"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              className="text-sm h-9"
            >
              <CheckCheck className="h-4 w-4 mr-1.5" />
              Mark All
            </Button>
          </div>
        </div>

        {/* Desktop Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notifications by message, type, tenant, property..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 py-2 text-sm"
            disabled={loading}
          />
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile View - Search + Buttons in One Row */}
      <div className="sm:hidden space-y-2">
        {/* Search and Buttons Row */}
        <div className="flex items-center gap-1.5">
          {/* Search Input - Takes remaining space */}
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-7 pr-6 py-1.5 h-8 text-xs w-full"
              disabled={loading}
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Buttons - Fixed width */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 px-2 text-xs shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="h-8 px-2 text-xs shrink-0"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Last refresh info - Small text below */}
        <p className="text-[10px] text-gray-400 text-right">
          Last refresh: {lastRefresh}
        </p>

        {/* Search results count - Mobile */}
        {searchQuery && (
          <p className="text-[10px] text-blue-600 px-1">
            Searching: "{searchQuery}"
          </p>
        )}
      </div>

      {/* Search results count - Desktop (shown in main component) */}
    </div>
  );
}