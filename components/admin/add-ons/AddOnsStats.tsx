import { Card, CardContent } from '@/components/ui/card';
import { IndianRupee } from 'lucide-react';

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

export default function AddOnsStats({ stats, formatCurrency }: AddOnsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Add-ons</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded">
              <span className="text-blue-600 font-semibold">All</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <h3 className="text-2xl font-bold">{stats.active}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded">
              <span className="text-green-600 font-semibold">Live</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <h3 className="text-2xl font-bold">{formatCurrency(stats.monthly_revenue)}</h3>
            </div>
            <IndianRupee className="h-6 w-6 text-gray-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Popular</p>
              <h3 className="text-2xl font-bold">{stats.popular}</h3>
            </div>
            <div className="p-2 bg-orange-100 rounded">
              <span className="text-orange-600 font-semibold">Hot</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}