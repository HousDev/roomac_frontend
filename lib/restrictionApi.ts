// lib/restrictionApi.ts
import { request } from "@/lib/api";

export interface VisitorRestriction {
  id: string;
  property_id?: string;
  property_name: string;
  restriction_type: 'Time-Based' | 'Full Restriction' | 'Conditional';
  start_time?: string;
  end_time?: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RestrictionPayload {
  property_id?: string;
  property_name: string;
  restriction_type: string;
  start_time?: string;
  end_time?: string;
  description: string;
  is_active?: boolean;
}

export interface RestrictionListResponse {
  success: boolean;
  count: number;
  data: VisitorRestriction[];
}

export interface RestrictionSingleResponse {
  success: boolean;
  data: VisitorRestriction;
}

export interface RestrictionStatsResponse {
  success: boolean;
  data: {
    total: number;
    active: number;
    inactive: number;
    time_based: number;
    full_restriction: number;
    conditional: number;
  };
}

export const getRestrictions = async (filters?: {
  property_id?: string;
  is_active?: string;
  restriction_type?: string;
  search?: string;
}): Promise<RestrictionListResponse> => {
  const q = new URLSearchParams();
  if (filters?.property_id)      q.append("property_id",      filters.property_id);
  if (filters?.is_active)        q.append("is_active",        filters.is_active);
  if (filters?.restriction_type) q.append("restriction_type", filters.restriction_type);
  if (filters?.search)           q.append("search",           filters.search);
  return request<RestrictionListResponse>(
    `/api/visitor-restrictions${q.toString() ? `?${q}` : ""}`,
    { method: "GET" }
  );
};

export const getRestrictionById = async (id: string): Promise<RestrictionSingleResponse> =>
  request<RestrictionSingleResponse>(`/api/visitor-restrictions/${id}`, { method: "GET" });

export const createRestriction = async (data: RestrictionPayload): Promise<RestrictionSingleResponse> =>
  request<RestrictionSingleResponse>("/api/visitor-restrictions", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateRestriction = async (id: string, data: RestrictionPayload): Promise<RestrictionSingleResponse> =>
  request<RestrictionSingleResponse>(`/api/visitor-restrictions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const toggleRestrictionStatus = async (id: string): Promise<any> =>
  request(`/api/visitor-restrictions/${id}/toggle`, { method: "PATCH" });

export const deleteRestriction = async (id: string): Promise<any> =>
  request(`/api/visitor-restrictions/${id}`, { method: "DELETE" });

export const bulkDeleteRestrictions = async (ids: string[]): Promise<any> =>
  request("/api/visitor-restrictions/bulk-delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });

export const getRestrictionStats = async (): Promise<RestrictionStatsResponse> =>
  request<RestrictionStatsResponse>("/api/visitor-restrictions/stats", { method: "GET" });