"use client";

import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, DoorOpen, Users, CreditCard 
} from 'lucide-react';
import { DashboardStats as DashboardStatsType, FilterState } from './types';

interface DashboardStatsProps {
  stats: DashboardStatsType;
  filterState: FilterState;
  updateFilter: (updates: Partial<FilterState>) => void;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: Building2,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: DoorOpen,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Bed Occupancy',
      value: `${stats.occupiedBeds}/${stats.totalBeds}`,
      icon: Users,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Active Tenants',
      value: stats.activeTenants,
      icon: Users,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      icon: CreditCard,
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
          >
            <CardContent className="p-6">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-md mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm text-slate-600 mb-1">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {stat.value}
              </h3>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}