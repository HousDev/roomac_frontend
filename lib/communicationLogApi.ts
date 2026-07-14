// src/lib/communicationLogApi.ts
import { request } from "@/lib/api";

export interface CommunicationLog {
  id: number;
  tenant_id: number | null;
  property_id: number | null;
  channel: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string | null;
  subject: string;
  template_name: string | null;
  communication_type: string;
  status: string;
  error_message: string | null;
  sent_by: number | null;
  sent_at: string | null;
  retries: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  tenant_name: string | null;
  property_name: string | null;
  content?: string;
}

export interface CommunicationLogFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  channel?: string;
  communicationType?: string;
  propertyId?: number | null;
  tenantId?: number | null;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedResponse {
  success: boolean;
  data: CommunicationLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface CommunicationLogDetail extends CommunicationLog {
  content: string;
  tenant_email?: string;
  tenant_phone?: string;
}

// Get all communication logs
export const getCommunicationLogs = async (filters: CommunicationLogFilters = {}): Promise<PaginatedResponse> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      params.append(key, String(value));
    }
  });
  
  const queryString = params.toString();
  const url = `/api/communication-logs/logs${queryString ? `?${queryString}` : ""}`;
  
  return request(url, { method: "GET" });
};

// Get statistics
export const getCommunicationStatistics = async (filters?: { dateFrom?: string; dateTo?: string }) => {
  const params = new URLSearchParams();
  
  if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters?.dateTo) params.append("dateTo", filters.dateTo);
  
  const queryString = params.toString();
  const url = `/api/communication-logs/logs/statistics${queryString ? `?${queryString}` : ""}`;
  
  return request(url, { method: "GET" });
};

// Get single log by ID
export const getCommunicationLogById = async (id: number) => {
  return request(`/api/communication-logs/logs/${id}`, { method: "GET" });
};

// Resend communication
export const resendCommunication = async (id: number) => {
  return request(`/api/communication-logs/logs/${id}/resend`, { method: "POST" });
};

// Delete log
export const deleteCommunicationLog = async (id: number, hardDelete = false) => {
  return request(`/api/communication-logs/logs/${id}?hardDelete=${hardDelete}`, { method: "DELETE" });
};

// Export CSV
export const exportCommunicationLogs = async (filters: CommunicationLogFilters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      params.append(key, String(value));
    }
  });
  
  const queryString = params.toString();
  const url = `/api/communication-logs/logs/export${queryString ? `?${queryString}` : ""}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  
  if (!response.ok) {
    throw new Error("Export failed");
  }
  
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `communication_logs_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
  
  return true;
};

// Get properties for filter
export const getProperties = async () => {
  return request("/api/communication-logs/logs/properties", { method: "GET" });
};