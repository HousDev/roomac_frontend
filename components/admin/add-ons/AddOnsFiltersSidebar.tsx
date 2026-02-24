"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  SlidersHorizontal,
  LayoutGrid, 
  CheckCircle2, 
  XCircle, 
  Star, 
  TrendingUp,
  Calendar,
  Clock,
  Sparkles,
  Coffee,
  Zap,
  Shield,
  Bike,
  Monitor,
  Package,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type AddOn } from '@/lib/addOnsApi';

interface AddOnsFiltersSidebarProps {
  addOns: AddOn[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FILTERS = [
  { id: 'all', label: 'All', icon: LayoutGrid, color: 'text-gray-600' },
  { id: 'active', label: 'Active', icon: CheckCircle2, color: 'text-green-600' },
  { id: 'inactive', label: 'Inactive', icon: XCircle, color: 'text-red-600' },
  { id: 'popular', label: 'Popular', icon: Star, color: 'text-yellow-600' },
  { id: 'featured', label: 'Featured', icon: TrendingUp, color: 'text-purple-600' },
  { id: 'monthly', label: 'Monthly', icon: Calendar, color: 'text-blue-600' },
  { id: 'one_time', label: 'One Time', icon: Clock, color: 'text-orange-600' },
];

const CATEGORY_FILTERS = [
  { id: 'lifestyle', label: 'Lifestyle', icon: Sparkles, color: 'text-purple-600' },
  { id: 'meal', label: 'Meal', icon: Coffee, color: 'text-orange-600' },
  { id: 'utility', label: 'Utility', icon: Zap, color: 'text-blue-600' },
  { id: 'security', label: 'Security', icon: Shield, color: 'text-green-600' },
  { id: 'mobility', label: 'Mobility', icon: Bike, color: 'text-red-600' },
  { id: 'productivity', label: 'Productivity', icon: Monitor, color: 'text-indigo-600' },
  { id: 'other', label: 'Other', icon: Package, color: 'text-gray-600' },
];

const getFilterCount = (addOns: AddOn[], filterId: string): number => {
  if (filterId === 'all') return addOns.length;
  if (filterId === 'active') return addOns.filter(a => a.is_active).length;
  if (filterId === 'inactive') return addOns.filter(a => !a.is_active).length;
  if (filterId === 'popular') return addOns.filter(a => a.is_popular).length;
  if (filterId === 'featured') return addOns.filter(a => a.is_featured).length;
  if (filterId === 'monthly') return addOns.filter(a => a.billing_type === 'monthly').length;
  if (filterId === 'one_time') return addOns.filter(a => a.billing_type === 'one_time').length;
  
  // Category filters
  return addOns.filter(a => a.category === filterId).length;
};

export default function AddOnsFiltersSidebar({
  addOns,
  activeFilter,
  onFilterChange,
}: AddOnsFiltersSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterSelect = (filterId: string) => {
    onFilterChange(filterId);
    setIsOpen(false);
  };

  const activeFiltersCount = activeFilter !== 'all' ? 1 : 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 h-9"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        <SheetHeader className="sticky top-0 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-6 py-4 border-b z-10">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-white">
              <SlidersHorizontal className="h-5 w-5" />
              Filter Add-ons
            </SheetTitle>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-white/80">
                Active filter: {activeFilter !== 'all' ? FILTERS.find(f => f.id === activeFilter)?.label || CATEGORY_FILTERS.find(c => c.id === activeFilter)?.label : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onFilterChange('all');
                  setIsOpen(false);
                }}
                className="text-xs h-7 text-white hover:text-white hover:bg-white/20"
              >
                Clear all
              </Button>
            </div>
          )}
        </SheetHeader>
        
        <div className="p-6 space-y-6">
          {/* Quick Filters */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Filters
            </h3>
            <div className="space-y-1">
              {FILTERS.map((filter) => {
                const Icon = filter.icon;
                const count = getFilterCount(addOns, filter.id);
                const isActive = activeFilter === filter.id;
                
                return (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterSelect(filter.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors",
                      isActive 
                        ? "bg-blue-50 text-blue-700 font-medium" 
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4", filter.color)} />
                      <span>{filter.label}</span>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      isActive 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Categories
            </h3>
            <div className="space-y-1">
              {CATEGORY_FILTERS.map((filter) => {
                const Icon = filter.icon;
                const count = getFilterCount(addOns, filter.id);
                const isActive = activeFilter === filter.id;
                
                return (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterSelect(filter.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors",
                      isActive 
                        ? "bg-blue-50 text-blue-700 font-medium" 
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4", filter.color)} />
                      <span>{filter.label}</span>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      isActive 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Add-ons</span>
              <span className="font-semibold">{addOns.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-green-600">{addOns.filter(a => a.is_active).length}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Categories</span>
              <span className="font-semibold">{new Set(addOns.map(a => a.category)).size}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}