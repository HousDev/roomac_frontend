// lib/adminDeletionApi.ts
import { request, type ApiResult } from "@/lib/api";

export interface DeletionRequest {
  request_id: number;
  tenant_id: number;
  full_name: string;
  email: string;
  phone: string;
  country_code: string;
  reason: string;
  requested_at: string;
  property_name: string;
  room_number: number | null;
  bed_number: number | null;
  check_in_date: string;
  total_payments: number;
  total_bookings: number;
  tenant_since: string;
  room_display: string;
}

export interface DeletionStats {
  byStatus: Array<{
    status: string;
    count: number;
    first_request: string;
    last_request: string;
  }>;
  monthly: Array<{
    month: string;
    status: string;
    count: number;
  }>;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface PropertyOption {
  value: number;
  label: string;
  address?: string;
}

export const adminDeletionApi = {
  // Get pending deletion requests
  async getPendingRequests(): Promise<ApiResult<DeletionRequest[]>> {
    try {
      return await request<ApiResult<DeletionRequest[]>>(
        "/api/admin/deletion-requests/pending"
      );
    } catch (error: any) {
      console.error("Error fetching pending deletion requests:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch pending requests",
        data: [],
      };
    }
  },

  // Get all deletion requests with filters
  async getAllRequests(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResult<DeletionRequest[]>> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const query = params.toString() ? `?${params.toString()}` : "";
      return await request<ApiResult<DeletionRequest[]>>(
        `/api/admin/deletion-requests/all${query}`
      );
    } catch (error: any) {
      console.error("Error fetching all deletion requests:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch requests",
        data: [],
      };
    }
  },


  // Add bulk delete function
async bulkDeleteRequests(ids: number[]): Promise<ApiResult> {
  try {
    return await request<ApiResult>("/api/admin/deletion-requests/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  } catch (error: any) {
    console.error("Error bulk deleting deletion requests:", error);
    return {
      success: false,
      message: error.message || "Failed to delete requests",
    };
  }
},
  // Approve deletion request
  async approveRequest(
    requestId: number,
    reviewNotes?: string
  ): Promise<ApiResult> {
    try {
      return await request<ApiResult>("/api/admin/deletion-requests/approve", {
        method: "POST",
        body: JSON.stringify({ requestId, reviewNotes }),
      });
    } catch (error: any) {
      console.error("Error approving deletion request:", error);
      return {
        success: false,
        message: error.message || "Failed to approve request",
      };
    }
  },

  // Reject deletion request
  async rejectRequest(
    requestId: number,
    reviewNotes?: string
  ): Promise<ApiResult> {
    try {
      return await request<ApiResult>("/api/admin/deletion-requests/reject", {
        method: "POST",
        body: JSON.stringify({ requestId, reviewNotes }),
      });
    } catch (error: any) {
      console.error("Error rejecting deletion request:", error);
      return {
        success: false,
        message: error.message || "Failed to reject request",
      };
    }
  },

  // Get deletion statistics
  async getStats(): Promise<ApiResult<DeletionStats>> {
    try {
      return await request<ApiResult<DeletionStats>>(
        "/api/admin/deletion-requests/stats"
      );
    } catch (error: any) {
      console.error("Error fetching deletion stats:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch statistics",
        data: {
          byStatus: [],
          monthly: [],
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        },
      };
    }
  },
};