// lib/adminRequestCountsApi.ts
import { request } from "./api";

export interface RequestCounts {
  complaints: number;
  maintenance: number;
  receipts: number;
  vacate: number;
  change: number;
  deletion: number;
  notice: number;
    support: number;       // ← NEW

  total: number;
}

// Fetch all request counts
export const getAllRequestCounts = async (): Promise<RequestCounts> => {
  try {
    const res = await request<{ success: boolean; data: RequestCounts }>(
      '/api/admin/request-counts/all',
      { method: 'GET' }
    );
    
    if (res.success && res.data) {
      return res.data;
    }
    
    return {
      complaints: 0,
      maintenance: 0,
      receipts: 0,
      vacate: 0,
      change: 0,
      deletion: 0,
      notice: 0,
      support: 0,
      total: 0
    };
  } catch (error) {
    console.error('Failed to fetch request counts:', error);
    return {
      complaints: 0,
      maintenance: 0,
      receipts: 0,
      vacate: 0,
      change: 0,
      deletion: 0,
      notice: 0,
      total: 0
    };
  }
};

// Individual fetch functions (if needed)
export const getComplaintsCount = async (): Promise<number> => {
  try {
    const res = await request<{ success: boolean; count: number }>(
      '/api/admin/request-counts/complaints',
      { method: 'GET' }
    );
    return res.success ? res.count : 0;
  } catch (error) {
    console.error('Failed to fetch complaints count:', error);
    return 0;
  }
};

export const getMaintenanceCount = async (): Promise<number> => {
  try {
    const res = await request<{ success: boolean; count: number }>(
      '/api/admin/request-counts/maintenance',
      { method: 'GET' }
    );
    return res.success ? res.count : 0;
  } catch (error) {
    console.error('Failed to fetch maintenance count:', error);
    return 0;
  }
};

export const getReceiptsCount = async (): Promise<number> => {
  try {
    const res = await request<{ success: boolean; count: number }>(
      '/api/admin/request-counts/receipts',
      { method: 'GET' }
    );
    return res.success ? res.count : 0;
  } catch (error) {
    console.error('Failed to fetch receipts count:', error);
    return 0;
  }
};

export const getVacateCount = async (): Promise<number> => {
  try {
    const res = await request<{ success: boolean; count: number }>(
      '/api/admin/request-counts/vacate',
      { method: 'GET' }
    );
    return res.success ? res.count : 0;
  } catch (error) {
    console.error('Failed to fetch vacate count:', error);
    return 0;
  }
};

export const getChangeCount = async (): Promise<number> => {
  try {
    const res = await request<{ success: boolean; count: number }>(
      '/api/admin/request-counts/change',
      { method: 'GET' }
    );
    return res.success ? res.count : 0;
  } catch (error) {
    console.error('Failed to fetch change bed count:', error);
    return 0;
  }
};

export const getDeletionCount = async (): Promise<number> => {
  try {
    const res = await request<{ success: boolean; count: number }>(
      '/api/admin/request-counts/deletion',
      { method: 'GET' }
    );
    return res.success ? res.count : 0;
  } catch (error) {
    console.error('Failed to fetch deletion count:', error);
    return 0;
  }
};

export const getNoticeCount = async (): Promise<number> => {
  try {
    const res = await request<{ success: boolean; count: number }>(
      '/api/admin/request-counts/notice',
      { method: 'GET' }
    );
    return res.success ? res.count : 0;
  } catch (error) {
    console.error('Failed to fetch notice count:', error);
    return 0;
  }
};

// Setup polling utility
export const setupRequestCountPolling = (
  callback: (counts: RequestCounts) => void,
  interval = 30000 // 30 seconds
) => {
  let isActive = true;
  
  const fetchAndUpdate = async () => {
    if (!isActive) return;
    const counts = await getAllRequestCounts();
    callback(counts);
  };

  // Initial fetch
  fetchAndUpdate();

  // Set up interval
  const intervalId = setInterval(fetchAndUpdate, interval);

  // Return cleanup function
  return () => {
    isActive = false;
    clearInterval(intervalId);
  };
};