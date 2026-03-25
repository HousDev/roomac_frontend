// lib/noticePeriodApi.ts
import { request } from "./api";

export interface NoticePeriodRequest {
  id: number;
  tenant_id: number;
  tenant_name: string;
  tenant_email: string;
  title: string;
  description: string;
  notice_period_date: string;
  is_seen: number;
  created_at: string;
  property_name?: string;
  room_number?: string;
}

// Admin API functions
export const getAdminNoticePeriodRequests = async (
  page: number = 1,
  pageSize: number = 50,
  search?: string
): Promise<{ success: boolean; data: NoticePeriodRequest[]; meta?: { total: number; unseen: number } }> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());
    if (search) params.append("search", search);

    const res = await request<any>(
      `/api/notice-period-requests/admin?${params.toString()}`,
      {
        method: "GET",
      }
    );

    return res;
  } catch (error) {
    console.error("Failed to fetch notice period requests:", error);
    return { success: false, data: [] };
  }
};

export const createNoticePeriodRequest = async (data: {
  tenant_id: number;
  title: string;
  description?: string;
  notice_period_date: string;
}): Promise<{ success: boolean; message: string; request_id?: number }> => {
  try {
    const res = await request<any>("/api/notice-period-requests/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return res;
  } catch (error) {
    console.error("Failed to create notice period request:", error);
    return { success: false, message: "Failed to create request" };
  }
};

export const deleteNoticePeriodRequest = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await request<any>(`/api/notice-period-requests/admin/${id}`, {
      method: "DELETE",
    });

    return res;
  } catch (error) {
    console.error("Failed to delete notice period request:", error);
    return { success: false, message: "Failed to delete request" };
  }
};

export const getAdminUnseenCount = async (): Promise<number> => {
  try {
    const res = await request<{ success: boolean; unseen: number }>(
      "/api/notice-period-requests/admin/unseen/count",
      {
        method: "GET",
      }
    );
    return res.success ? res.unseen : 0;
  } catch (error) {
    console.error("Failed to get unseen count:", error);
    return 0;
  }
};

// Tenant API functions (for notification integration)
export const getTenantUnseenCount = async (): Promise<number> => {
  try {
    const res = await request<{ success: boolean; count: number }>(
      "/api/notice-period-requests/tenant/unseen",
      {
        method: "GET",
      }
    );
    return res.success ? res.count : 0;
  } catch (error) {
    console.error("Failed to get tenant unseen count:", error);
    return 0;
  }
};

// lib/noticePeriodApi.ts
export const markNoticePeriodAsSeen = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const token = localStorage.getItem('tenant_token');
    
    const response = await fetch(`${apiUrl}/api/notice-period-requests/tenant/${id}/seen`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || `HTTP ${response.status}` 
      };
    }
    
    return data;
  } catch (error) {
    console.error("Failed to mark request as seen:", error);
    return { success: false, message: "Failed to mark as seen" };
  }
};