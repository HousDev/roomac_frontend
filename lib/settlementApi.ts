// lib/settlementApi.ts
import { request } from "@/lib/api";

export interface Settlement {
  id: string;
  handover_id?: string;
  tenant_id?: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email?: string;
  property_name: string;
  room_number: string;
  bed_number?: string;
  settlement_date: string;
  move_out_date?: string;
  security_deposit: number;
  penalties: number;
  penalty_discount: number;
  outstanding_rent: number;
  other_deductions: number;
  total_deductions: number;   // computed by server
  refund_amount: number;      // computed by server
  payment_method: string;
  payment_reference?: string;
  notes?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface SettlementPayload {
  handover_id?: string;
  tenant_id?: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email?: string;
  property_name: string;
  room_number: string;
  bed_number?: string;
  settlement_date: string;
  move_out_date?: string;
  security_deposit: number;
  penalties: number;
  penalty_discount: number;
  outstanding_rent: number;
  other_deductions: number;
  // DO NOT send total_deductions / refund_amount — server computes these
  payment_method: string;
  payment_reference?: string;
  notes?: string;
  status: string;
}

export interface SettlementListResponse   { success: boolean; count: number; data: Settlement[]; }
export interface SettlementSingleResponse { success: boolean; data: Settlement; }
export interface SettlementStatsResponse  {
  success: boolean;
  data: {
    total: number; pending: number; processing: number;
    paid: number; completed: number; cancelled: number;
    total_refunds: number; total_deposits: number; total_deductions: number;
  };
}

export const getSettlements = (filters?: {
  status?: string; search?: string;
}): Promise<SettlementListResponse> => {
  const q = new URLSearchParams();
  if (filters?.status) q.append("status", filters.status);
  if (filters?.search) q.append("search", filters.search);
  return request<SettlementListResponse>(`/api/settlements${q.toString() ? `?${q}` : ""}`, { method: "GET" });
};

export const getSettlementById = (id: string): Promise<SettlementSingleResponse> =>
  request<SettlementSingleResponse>(`/api/settlements/${id}`, { method: "GET" });

export const createSettlement = (data: SettlementPayload): Promise<SettlementSingleResponse> =>
  request<SettlementSingleResponse>("/api/settlements", { method: "POST", body: JSON.stringify(data) });

export const updateSettlement = (id: string, data: Partial<SettlementPayload>): Promise<SettlementSingleResponse> =>
  request<SettlementSingleResponse>(`/api/settlements/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteSettlement = (id: string): Promise<any> =>
  request(`/api/settlements/${id}`, { method: "DELETE" });

export const getSettlementStats = (): Promise<SettlementStatsResponse> =>
  request<SettlementStatsResponse>("/api/settlements/stats", { method: "GET" });