import { Card, CardContent } from '@/components/ui/card';
import { Package, CheckCircle, IndianRupee, Star } from 'lucide-react';

interface AddOnsStatsProps {
  stats: {
    total: number;
    active: number;
    popular: number;
    featured: number;
    monthly_revenue: number;
  };
  formatCurrency: (amount: number) => string;
}

// StatCard component for consistent styling
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color,
  bgColor 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string;
  bgColor: string;
}) => (
  <Card className="border-0 shadow-sm overflow-hidden">
    <CardContent className="p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-600 font-medium">{title}</p>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className={`p-2 sm:p-2.5 rounded-xl ${bgColor}`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AddOnsStats({ stats, formatCurrency }: AddOnsStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {/* Total Add-ons Card */}
      <StatCard
        title="Total"
        value={stats.total}
        icon={Package}
        color="text-blue-600"
        bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
      />

      {/* Active Card */}
      <StatCard
        title="Active"
        value={stats.active}
        icon={CheckCircle}
        color="text-green-600"
        bgColor="bg-gradient-to-br from-green-50 to-green-100"
      />

      {/* Monthly Revenue Card */}
      <StatCard
        title="Revenue"
        value={formatCurrency(stats.monthly_revenue)}
        icon={IndianRupee}
        color="text-purple-600"
        bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
      />

      {/* Popular Card */}
      <StatCard
        title="Popular"
        value={stats.popular}
        icon={Star}
        color="text-orange-600"
        bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
      />
    </div>
  );
}