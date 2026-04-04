// lib/handoverApi.ts
import { request } from "@/lib/api";

export interface HandoverItem {
  id?: string;
  handover_id?: string;
  item_name: string;
  category: string;
  quantity: number;
  condition_at_movein: string;
  asset_id?: string;
  notes?: string;
}

export interface TenantHandover {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email?: string;
  property_id: string;
  property_name: string;
  room_number: string;
  bed_number?: string;
  move_in_date: string;
  handover_date: string;
  inspector_name: string;
  security_deposit: number;
  rent_amount: number;
  notes?: string;
  status: string;
  item_count?: number;
  handover_items?: HandoverItem[];
  created_at?: string;
  updated_at?: string;
}

export interface HandoverPayload {
  tenant_id?: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email?: string;
  property_id: string;
  property_name: string;
  room_number: string;
  bed_number?: string;
  move_in_date: string;
  handover_date: string;
  inspector_name: string;
  security_deposit: number;
  rent_amount: number;
  notes?: string;
  status?: string;
  handover_items?: HandoverItem[];
}

export interface HandoverListResponse {
  success: boolean;
  count: number;
  data: TenantHandover[];
}

export interface HandoverSingleResponse {
  success: boolean;
  data: TenantHandover;
}

export interface HandoverStatsResponse {
  success: boolean;
  data: {
    total: number;
    active: number;
    confirmed: number;
    pending: number;
    completed: number;
    total_deposits: number;
    total_rent: number;
  };
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getHandovers = async (filters?: {
  property_id?: string;
  tenant_id?: string;
  status?: string;
  search?: string;
}): Promise<HandoverListResponse> => {
  const q = new URLSearchParams();
  if (filters?.property_id) q.append("property_id", filters.property_id);
  if (filters?.tenant_id)   q.append("tenant_id",   filters.tenant_id);
  if (filters?.status)      q.append("status",       filters.status);
  if (filters?.search)      q.append("search",       filters.search);
  const url = `/api/handovers${q.toString() ? `?${q}` : ""}`;
  return request<HandoverListResponse>(url, { method: "GET" });
};

export const getHandoverById = async (id: string): Promise<HandoverSingleResponse> =>
  request<HandoverSingleResponse>(`/api/handovers/${id}`, { method: "GET" });

export const createHandover = async (data: HandoverPayload): Promise<HandoverSingleResponse> =>
  request<HandoverSingleResponse>("/api/handovers", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateHandover = async (id: string, data: any): Promise<HandoverSingleResponse> =>
  request<HandoverSingleResponse>(`/api/handovers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteHandover = async (id: string): Promise<any> =>
  request(`/api/handovers/${id}`, { method: "DELETE" });

export const getHandoverStats = async (): Promise<HandoverStatsResponse> =>
  request<HandoverStatsResponse>("/api/handovers/stats", { method: "GET" });