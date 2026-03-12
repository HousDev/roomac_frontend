import { request } from "@/lib/api";

export interface InspectionItem {
  id?: string;
  inspection_id?: string;
  handover_item_id: string;
  item_name: string;
  category: string;
  quantity: number;
  condition_at_movein: string;
  condition_at_moveout: string;
  penalty_amount: number;
  notes?: string;
}

export interface PenaltyRule {
  id: string;
  item_category: string;
  from_condition: string;
  to_condition: string;
  penalty_amount: number;
  description?: string;
}

export interface MoveOutInspection {
  id: string;
  handover_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email?: string;
  property_id?: number;
  property_name: string;
  room_number: string;
  bed_number?: string;
  move_in_date?: string;
  inspection_date: string;
  inspector_name: string;
  total_penalty: number;
  notes?: string;
  status: string;
  penalty_rules?: PenaltyRule[];
  inspection_items?: InspectionItem[];
  created_at?: string;
  updated_at?: string;
}

export interface InspectionPayload {
  handover_id: string;
  inspection_date: string;
  inspector_name: string;
  total_penalty?: number;
  notes?: string;
  status?: string;
  penalty_rules?: PenaltyRule[];
  inspection_items?: InspectionItem[];
}

export interface InspectionListResponse {
  success: boolean;
  count: number;
  data: MoveOutInspection[];
}

export interface InspectionSingleResponse {
  success: boolean;
  data: MoveOutInspection;
}

export interface InspectionStatsResponse {
  success: boolean;
  data: {
    total: number;
    completed: number;
    approved: number;
    pending: number;
    active: number;
    cancelled: number;
    total_penalties: number;
    avg_penalty: number;
    max_penalty: number;
    total_properties: number;
  };
}

export interface PenaltyRulesResponse {
  success: boolean;
  count: number;
  data: PenaltyRule[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getInspections = async (filters?: {
  property_id?: string;
  status?: string;
  tenant_name?: string;
  search?: string;
}): Promise<InspectionListResponse> => {
  const q = new URLSearchParams();
  if (filters?.property_id) q.append("property_id", filters.property_id);
  if (filters?.status) q.append("status", filters.status);
  if (filters?.tenant_name) q.append("tenant_name", filters.tenant_name);
  if (filters?.search) q.append("search", filters.search);
  const url = `/api/move-out-inspections${q.toString() ? `?${q}` : ""}`;
  return request<InspectionListResponse>(url, { method: "GET" });
};

export const getInspectionById = async (id: string): Promise<InspectionSingleResponse> =>
  request<InspectionSingleResponse>(`/api/move-out-inspections/${id}`, { method: "GET" });

export const getInspectionsByHandover = async (handoverId: string): Promise<InspectionListResponse> =>
  request<InspectionListResponse>(`/api/move-out-inspections/by-handover/${handoverId}`, { method: "GET" });

export const createInspection = async (data: InspectionPayload): Promise<InspectionSingleResponse> =>
  request<InspectionSingleResponse>("/api/move-out-inspections", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateInspection = async (id: string, data: Partial<InspectionPayload>): Promise<InspectionSingleResponse> =>
  request<InspectionSingleResponse>(`/api/move-out-inspections/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteInspection = async (id: string): Promise<any> =>
  request(`/api/move-out-inspections/${id}`, { method: "DELETE" });

export const bulkDeleteInspections = async (ids: string[]): Promise<any> =>
  request("/api/move-out-inspections/bulk-delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });

export const getInspectionStats = async (): Promise<InspectionStatsResponse> =>
  request<InspectionStatsResponse>("/api/move-out-inspections/stats", { method: "GET" });

export const getDefaultPenaltyRules = async (): Promise<PenaltyRulesResponse> =>
  request<PenaltyRulesResponse>("/api/move-out-inspections/penalty-rules/default", { method: "GET" });