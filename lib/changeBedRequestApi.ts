// lib/changeBedRequestApi.ts
import { request } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ==================== ADMIN FUNCTIONS ====================

// Admin change bed request types
export type AdminChangeBedRequest = {
  tenant_request_id: number;
  tenant_id: number;
  title: string;
  description: string;
  priority: string;
  tenant_request_status: string;
  created_at: string;
  id: number;
  current_property_id: number;
  current_room_id: number;
  current_bed_number: number;
  preferred_property_id: number;
  preferred_room_id: number;
  change_reason_id: number;
  shifting_date: string;
  notes?: string;
  assigned_bed_number?: number;
  rent_difference?: string;
  admin_notes?: string;
  request_status: string;
  updated_at: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email: string;
  current_property_name: string;
  current_room_number: number;
  current_rent: string;
  requested_property_name: string;
  requested_room_number: number;
  requested_rent: string;
  requested_total_beds: number;
  requested_occupied_beds: number;
  change_reason?: string;
  change_reason_code?: string;
};

export type ChangeBedStatusUpdate = {
  request_status: 'pending' | 'approved' | 'rejected' | 'processed';
  assigned_bed_number?: number;
  rent_difference?: number;
  admin_notes?: string;
  process_request?: boolean;
};

// Get admin token
const getAdminToken = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  
  const adminToken = localStorage.getItem('auth_token');
  const genericToken = localStorage.getItem('token');
  const sessionAdminToken = sessionStorage.getItem('auth_token');
  const sessionGenericToken = sessionStorage.getItem('token');
  
  const token = adminToken || genericToken || sessionAdminToken || sessionGenericToken;
  
  if (!token) {
    console.error('❌ No authentication token found');
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
    throw new Error('Admin authentication required. Please login.');
  }
  
  return token;
};

// Add bulk delete function
export const bulkDeleteChangeBedRequests = async (ids: number[]): Promise<{ success: boolean; message: string }> => {
  try {
    const token = getAdminToken();
    
    const res = await request<{
      success: boolean;
      message: string;
    }>(`/api/admin/change-bed-requests/bulk-delete`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    if (!res.success) {
      throw new Error(res.message || "Failed to delete requests");
    }

    return res;
  } catch (error: any) {
    console.error('❌ Error bulk deleting change bed requests:', error);
    throw error;
  }
};
// Get all change bed requests (Admin)
export const getAdminChangeBedRequests = async (
  params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }
): Promise<{
  data: AdminChangeBedRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  try {
    const token = getAdminToken();
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
    
    const queryString = queryParams.toString();
    const url = `/api/admin/change-bed-requests${queryString ? `?${queryString}` : ''}`;
    
    const res = await request<{
      success: boolean;
      data: AdminChangeBedRequest[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(url, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.success) {
      throw new Error("Failed to get change bed requests");
    }

    return res;
  } catch (error: any) {
    console.error('❌ Error getting admin change bed requests:', error);
    
    if (error.message?.includes('401') || error.message?.includes('authentication')) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    throw error;
  }
};

// Get single change bed request (Admin)
export const getAdminChangeBedRequestById = async (id: number): Promise<AdminChangeBedRequest> => {
  try {
    const token = getAdminToken();
    
    const res = await request<{
      success: boolean;
      data: AdminChangeBedRequest;
    }>(`/api/admin/change-bed-requests/${id}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.success) {
      throw new Error("Failed to get change bed request");
    }

    return res.data;
  } catch (error: any) {
    console.error('❌ Error getting change bed request:', error);
    throw error;
  }
};

// Update change bed request status (Admin)
export const updateChangeBedRequestStatus = async (
  id: number,
  data: ChangeBedStatusUpdate
): Promise<{ success: boolean; message: string }> => {
  try {
    const token = getAdminToken();
    
    const res = await request<{
      success: boolean;
      message: string;
    }>(`/api/admin/change-bed-requests/${id}/status`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.success) {
      throw new Error(res.message || "Failed to update status");
    }

    return res;
  } catch (error: any) {
    console.error('❌ Error updating change bed request status:', error);
    throw error;
  }
};

// Get change bed statistics (Admin)
export const getChangeBedStatistics = async (): Promise<any> => {
  try {
    const token = getAdminToken();
    
    const res = await request<{
      success: boolean;
      data: any;
    }>('/api/admin/change-bed-requests/stats/summary', {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.success) {
      throw new Error("Failed to get statistics");
    }

    return res.data;
  } catch (error: any) {
    console.error('❌ Error getting change bed statistics:', error);
    throw error;
  }
};