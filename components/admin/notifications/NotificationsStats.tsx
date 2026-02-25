import { Card, CardContent } from '@/components/ui/card';
import { Mail, MessageCircle, Flame, Inbox } from 'lucide-react';

interface NotificationsStatsProps {
  stats: {
    total: number;
    unread: number;
    urgent: number;
    tenant_requests: number;
  };
  className?: string;
}

// Compact Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  value: number | string;
  icon: any;
  color: string;
  bgColor: string;
}) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <CardContent
        className={`
          p-2 sm:p-3   
          ${bgColor}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0">
            <p className="text-[10px] sm:text-xs text-gray-600 font-medium">
              {title}
            </p>

            <p className="text-sm sm:text-lg font-bold text-gray-800 leading-tight">
              {typeof value === 'number'
                ? value.toLocaleString()
                : value}
            </p>
          </div>

          <div
            className={`
              p-1.5 sm:p-2   
              rounded-full
              ${color}
              bg-opacity-20
            `}
          >
            <Icon
              className={`
                h-3 w-3
                sm:h-4 sm:w-4
                ${color.replace('bg-', 'text-')}
              `}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationsStats({
  stats,
  className = '',
}: NotificationsStatsProps) {
  return (
    <div
      className={`
        grid grid-cols-2
        sm:grid-cols-4
        gap-2
        mb-4 sm:mb-5 sm:-mt-8 md:mt-0
        ${className}
      `}
    >
      <StatCard
        title="Total"
        value={stats.total}
        icon={Inbox}
        color="bg-blue-600"
        bgColor="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"
      />
      <StatCard
        title="Unread"
        value={stats.unread}
        icon={MessageCircle}
        color="bg-amber-600"
        bgColor="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl"
      />
      <StatCard
        title="Urgent"
        value={stats.urgent}
        icon={Flame}
        color="bg-rose-600"
        bgColor="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl"
      />
      <StatCard
        title="Requests"
        value={stats.tenant_requests}
        icon={Mail}
        color="bg-emerald-600"
        bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl"
      />
    </div>
  );
}