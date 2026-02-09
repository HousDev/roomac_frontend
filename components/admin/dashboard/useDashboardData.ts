"use client";

import { useCallback } from 'react';
import { DashboardStats } from './types';

export function useDashboardData(
  setStats: (stats: DashboardStats) => void,
  setLoading: (loading: boolean) => void
) {
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [setStats, setLoading]);

  return { refreshData };
}