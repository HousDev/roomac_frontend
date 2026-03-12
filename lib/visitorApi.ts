// lib/visitorApi.ts
import { request } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VisitorLog {
  id: string;
  tenant_id?: string;
  tenant_name: string;
  tenant_phone?: string;
  tenant_email?: string;
  property_id?: string;
  property_name: string;
  room_number: string;
  visitor_name: string;
  visitor_phone: string;
  entry_time: string;
  exit_time?: string;
  tentative_exit_time?: string;
  purpose: string;
  id_proof_type: string;
  id_proof_number: string;
  vehicle_number?: string;
  approval_status: string;
  security_guard_name: string;
  status: 'checked_in' | 'checked_out' | 'overstayed';
  qr_code?: string;
  checked_out_by?: string;
  notes?: string;
  // ── Block fields (in visitor_logs directly) ──
  is_blocked: number;        // 0 = not blocked, 1 = blocked
  block_reason?: string;
  blocked_by?: string;
  blocked_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface VisitorPayload {
  tenant_id?: string;
  tenant_name: string;
  tenant_phone?: string;
  tenant_email?: string;
  property_id?: string;
  property_name: string;
  room_number: string;
  visitor_name: string;
  visitor_phone: string;
  entry_time?: string;
  tentative_exit_time?: string;
  purpose: string;
  id_proof_type: string;
  id_proof_number: string;
  vehicle_number?: string;
  approval_status?: string;
  security_guard_name: string;
  notes?: string;
}

export interface VisitorListResponse {
  success: boolean;
  count: number;
  data: VisitorLog[];
}

export interface VisitorSingleResponse {
  success: boolean;
  data: VisitorLog;
}

export interface VisitorStatsResponse {
  success: boolean;
  data: {
    total: number;
    checked_in: number;
    checked_out: number;
    overstayed: number;
    today_total: number;
    checked_out_today: number;
    total_blocked: number;   // new — count from visitor_logs.is_blocked
  };
}

export interface BlockedCheckResponse {
  success: boolean;
  is_blocked: boolean;
  data: {
    reason: string;
    blocked_by: string;
    blocked_date: string;
  } | null;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getVisitors = async (filters?: {
  property_id?: string;
  tenant_id?: string;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}): Promise<VisitorListResponse> => {
  const q = new URLSearchParams();
  if (filters?.property_id) q.append("property_id", filters.property_id);
  if (filters?.tenant_id)   q.append("tenant_id",   filters.tenant_id);
  if (filters?.status)      q.append("status",       filters.status);
  if (filters?.search)      q.append("search",       filters.search);
  if (filters?.date_from)   q.append("date_from",    filters.date_from);
  if (filters?.date_to)     q.append("date_to",      filters.date_to);
  return request<VisitorListResponse>(
    `/api/visitors${q.toString() ? `?${q}` : ""}`,
    { method: "GET" }
  );
};

export const getVisitorById = async (id: string): Promise<VisitorSingleResponse> =>
  request<VisitorSingleResponse>(`/api/visitors/${id}`, { method: "GET" });

export const createVisitor = async (data: VisitorPayload): Promise<VisitorSingleResponse> =>
  request<VisitorSingleResponse>("/api/visitors", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const checkOutVisitor = async (id: string, checked_out_by: string): Promise<any> =>
  request(`/api/visitors/${id}/checkout`, {
    method: "PUT",
    body: JSON.stringify({ checked_out_by }),
  });

export const bulkCheckOut = async (ids: string[], checked_out_by: string): Promise<any> =>
  request("/api/visitors/bulk-checkout", {
    method: "POST",
    body: JSON.stringify({ ids, checked_out_by }),
  });

export const updateVisitor = async (
  id: string,
  data: Partial<VisitorPayload>
): Promise<VisitorSingleResponse> =>
  request<VisitorSingleResponse>(`/api/visitors/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteVisitor = async (id: string): Promise<any> =>
  request(`/api/visitors/${id}`, { method: "DELETE" });

// ── Block — updates is_blocked=1 in visitor_logs for matching phone+id_proof ─
export const blockVisitor = async (data: {
  visitor_phone: string;
  id_proof_number: string;
  reason: string;
  blocked_by?: string;
}): Promise<any> =>
  request("/api/visitors/block", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ── Unblock — sets is_blocked=0 in visitor_logs ───────────────────────────
export const unblockVisitor = async (
  visitor_phone: string,
  id_proof_number: string
): Promise<any> =>
  request("/api/visitors/unblock", {
    method: "POST",
    body: JSON.stringify({ visitor_phone, id_proof_number }),
  });

// ── Check blocked — queries visitor_logs only, no separate table ──────────
export const checkBlockedStatus = async (
  visitor_phone: string,
  id_proof_number: string
): Promise<BlockedCheckResponse> => {
  const q = new URLSearchParams({ visitor_phone, id_proof_number });
  return request<BlockedCheckResponse>(
    `/api/visitors/check-blocked?${q}`,
    { method: "GET" }
  );
};

export const getVisitorStats = async (): Promise<VisitorStatsResponse> =>
  request<VisitorStatsResponse>("/api/visitors/stats", { method: "GET" });