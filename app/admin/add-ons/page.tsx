

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AddOnsClientPage from '@/components/admin/add-ons/AddOnsClientPage';
import { addOnsApi } from '@/lib/addOnsApi';
import { AddOnsLoading } from '@/components/admin/add-ons/AddOnsLoading';

export const metadata: Metadata = {
  title: 'Add-ons Management',
  description: 'Manage additional services for tenants',
};

interface SearchParams {
  filter?: string;
}

export default function AddOnsPage() {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'all';
  const [initialAddOns, setInitialAddOns] = useState<any[]>([]);
  const [initialStats, setInitialStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([addOnsApi.getAll(), addOnsApi.getStats()])
      .then(([addOnsData, statsData]) => {
        setInitialAddOns(Array.isArray(addOnsData) ? addOnsData : []);
        setInitialStats(statsData);
      })
      .catch((err) => console.error('Error fetching initial data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AddOnsLoading />;
  return (
    <AddOnsClientPage 
      initialAddOns={initialAddOns}
      initialStats={initialStats}
      initialFilter={filter}
    />
  );
}