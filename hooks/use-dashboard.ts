import { useState, useEffect } from 'react';
// import { getDashboardStats, getRecentBookings, getRecentPayments } from '@/lib/api';
import { DashboardStats } from '@/types';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = useDashboardStats() as unknown as DashboardStats;
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: loadStats };
}

export function useRecentActivity() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const [bookingsData, paymentsData] = await Promise.all([
        getRecentBookings(5),
        getRecentPayments(5)
      ]);
      setBookings(bookingsData as any[]);
      setPayments(paymentsData as any[]);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { bookings, payments, loading, error, refetch: loadActivity };
}
function getRecentBookings(arg0: number): any {
  throw new Error('Function not implemented.');
}

function getRecentPayments(arg0: number): any {
  throw new Error('Function not implemented.');
}

