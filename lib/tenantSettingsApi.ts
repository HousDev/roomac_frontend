// lib/tenantSettingsApi.ts
import { request, type ApiResult } from "@/lib/api";
import { getTenantToken } from "./tenantAuthApi";

export interface NotificationPreferences {
  emailNotifications: boolean;
  paymentReminders: boolean;
  maintenanceUpdates: boolean;
  generalAnnouncements: boolean;
}

export interface DeletionRequest {
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
  review_notes?: string;
}

export const tenantSettingsApi = {
  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResult> {
    try {
      const token = getTenantToken();
      if (!token) {
        return { success: false, message: "Not authenticated" };
      }

      return await request<ApiResult>("/api/tenant-settings/change-password", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error.message || "Failed to change password",
      };
    }
  },

  // Get notification preferences
  async getNotificationPreferences(): Promise<ApiResult<NotificationPreferences>> {
    try {
      const token = getTenantToken();
      if (!token) {
        return { success: false, message: "Not authenticated" };
      }

      return await request<ApiResult<NotificationPreferences>>("/api/tenant-settings/notifications", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error('Get notifications error:', error);
      return {
        success: false,
        message: error.message || "Failed to get notification preferences",
      };
    }
  },

  // Update notification preferences
  async updateNotificationPreferences(preferences: NotificationPreferences): Promise<ApiResult> {
    try {
      const token = getTenantToken();
      if (!token) {
        return { success: false, message: "Not authenticated" };
      }

      return await request<ApiResult>("/api/tenant-settings/notifications", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });
    } catch (error: any) {
      console.error('Update notifications error:', error);
      return {
        success: false,
        message: error.message || "Failed to update notification preferences",
      };
    }
  },

  // Request account deletion
  async requestAccountDeletion(reason: string): Promise<ApiResult> {
    try {
      const token = getTenantToken();
      if (!token) {
        return { success: false, message: "Not authenticated" };
      }

      return await request<ApiResult>("/api/tenant-settings/request-deletion", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
    } catch (error: any) {
      console.error('Request deletion error:', error);
      return {
        success: false,
        message: error.message || "Failed to request account deletion",
      };
    }
  },

  // Cancel deletion request
  async cancelDeletionRequest(): Promise<ApiResult> {
    try {
      const token = getTenantToken();
      if (!token) {
        return { success: false, message: "Not authenticated" };
      }

      return await request<ApiResult>("/api/tenant-settings/cancel-deletion", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error('Cancel deletion error:', error);
      return {
        success: false,
        message: error.message || "Failed to cancel deletion request",
      };
    }
  },

  // Get deletion request status
  async getDeletionStatus(): Promise<ApiResult<DeletionRequest>> {
    try {
      const token = getTenantToken();
      if (!token) {
        return { success: false, message: "Not authenticated" };
      }

      return await request<ApiResult<DeletionRequest>>("/api/tenant-settings/deletion-status", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error('Get deletion status error:', error);
      return {
        success: false,
        message: error.message || "Failed to get deletion status",
      };
    }
  },

  // Logout
  async logout(): Promise<ApiResult> {
    try {
      const token = getTenantToken();
      if (token) {
        await request<ApiResult>("/api/tenant-settings/logout", {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      return { success: true, message: "Logged out successfully" };
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: error.message || "Logout completed locally",
      };
    }
  },

  // Test connection
  async testConnection(): Promise<ApiResult> {
    try {
      return await request<ApiResult>("/api/tenant-settings/test");
    } catch (error: any) {
      console.error('Test connection error:', error);
      return {
        success: false,
        message: error.message || "Connection test failed",
      };
    }
  }
};