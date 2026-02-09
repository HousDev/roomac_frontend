"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { addOnsApi, type AddOn } from '@/lib/addOnsApi';
import AddOnsHeader from './AddOnsHeader';
import AddOnsStats from './AddOnsStats';
import AddOnsFilters from './AddOnsFilters';
import AddOnsGrid from './AddOnsGrid';
import { AddOnForm } from '@/components/admin/AddOnForm';
import { CATEGORY_LABELS } from './table-config';

interface AddOnsClientPageProps {
  initialAddOns: AddOn[];
  initialStats: any;
  initialFilter: string;
}

export default function AddOnsClientPage({
  initialAddOns,
  initialStats,
  initialFilter,
}: AddOnsClientPageProps) {
  const router = useRouter();
  
  // State management
  const [addOns, setAddOns] = useState<AddOn[]>(initialAddOns);
  const [filteredAddOns, setFilteredAddOns] = useState<AddOn[]>(initialAddOns);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [stats, setStats] = useState(initialStats);

  // Memoized calculations
  const statsData = useMemo(() => ({
    total: addOns.length,
    active: addOns.filter(a => a.is_active).length,
    popular: addOns.filter(a => a.is_popular).length,
    featured: addOns.filter(a => a.is_featured).length,
    monthly_revenue: addOns
      .filter(a => a.is_active && a.billing_type === 'monthly')
      .reduce((sum, a) => sum + (a.price || 0), 0),
  }), [addOns]);

  // Load data function with useCallback
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [addOnsData, statsData] = await Promise.all([
        addOnsApi.getAll(),
        addOnsApi.getStats(),
      ]);
      
      if (Array.isArray(addOnsData)) {
        setAddOns(addOnsData);
      } else {
        setAddOns([]);
      }
      
      if (statsData) {
        setStats(statsData);
      }
      
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load add-ons');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter add-ons when filter changes
  useEffect(() => {
    let filtered = [...addOns];
    
    if (activeFilter === 'active') {
      filtered = filtered.filter(a => a.is_active);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter(a => !a.is_active);
    } else if (activeFilter === 'popular') {
      filtered = filtered.filter(a => a.is_popular);
    } else if (activeFilter === 'featured') {
      filtered = filtered.filter(a => a.is_featured);
    } else if (activeFilter === 'monthly') {
      filtered = filtered.filter(a => a.billing_type === 'monthly');
    } else if (activeFilter === 'one_time') {
      filtered = filtered.filter(a => a.billing_type === 'one_time');
    } else if (activeFilter in CATEGORY_LABELS) {
      filtered = filtered.filter(a => a.category === activeFilter);
    }
    
    // Sort by sort_order
    filtered.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    
    setFilteredAddOns(filtered);
  }, [addOns, activeFilter]);

  // Update URL when filter changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeFilter && activeFilter !== 'all') {
      params.set('filter', activeFilter);
    }
    
    const queryString = params.toString();
    router.push(`/admin/add-ons${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [activeFilter, router]);

  // Handler functions with useCallback
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this add-on?')) return;
    
    try {
      await addOnsApi.delete(id);
      toast.success('Add-on deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete add-on');
    }
  }, [loadData]);

  const toggleAddOnStatus = useCallback(async (id: number) => {
    try {
      await addOnsApi.toggleStatus(id);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update add-on status');
    }
  }, [loadData]);

  const handleEdit = useCallback((addOn: AddOn) => {
    setEditingAddOn(addOn);
    setShowForm(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setShowForm(false);
    setEditingAddOn(null);
    loadData();
    toast.success('Add-on saved successfully!');
  }, [loadData]);

  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
  }, []);

  // Format currency helper
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Add-ons Management" description={''} />
      
      {/* Form Modal */}
      {showForm && (
        <AddOnForm
          addOn={editingAddOn}
          onClose={() => {
            setShowForm(false);
            setEditingAddOn(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      <div className="p-6">
        {/* Stats */}
        <AddOnsStats stats={statsData} formatCurrency={formatCurrency} />
        
        {/* Main Card */}
        <Card className="border">
          <CardHeader className="bg-white border-b">
            <AddOnsHeader
              loading={loading}
              onRefresh={loadData}
              onAddNew={() => setShowForm(true)}
              totalCount={addOns.length}
              filteredCount={filteredAddOns.length}
            />
          </CardHeader>
          
          {/* Filters */}
          <div className="px-6 pt-4">
            <AddOnsFilters
              addOns={addOns}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Content */}
          <CardContent className="p-6">
            <AddOnsGrid
              addOns={filteredAddOns}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={toggleAddOnStatus}
              onAddNew={() => setShowForm(true)}
              activeFilter={activeFilter}
              formatCurrency={formatCurrency}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}