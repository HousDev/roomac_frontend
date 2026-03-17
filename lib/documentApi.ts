// lib/documentApi.ts

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const BASE = "/api/documents";

export type DocumentStatus = "Created"|"Sent"|"Viewed"|"Signed"|"Completed"|"Expired"|"Cancelled";
export type Priority = "low"|"normal"|"high"|"urgent";

export interface Document {
  id: number; document_number: string; template_id: number|string;
  document_name: string; document_title: string|null; document_type: string|null;
  tenant_id: number|null; tenant_name: string; tenant_phone: string;
  tenant_email: string|null; aadhaar_number: string|null; pan_number: string|null;
  emergency_contact_name: string|null; emergency_phone: string|null;
  property_name: string|null; property_address: string|null;
  room_number: string|null; bed_number: string|null; move_in_date: string|null;
  rent_amount: number|null; security_deposit: number|null; payment_mode: string|null;
  company_name: string|null; company_address: string|null;
  html_content: string; data_json: Record<string,string>;
  status: DocumentStatus; created_by: string; signature_required: boolean;
  signature_data: string|null; signed_at: string|null; signed_by: string|null;
  priority: Priority; expiry_date: string|null; tags: string[]; notes: string|null;
  share_token: string|null; share_expires_at: string|null;
  history_log: any[]; created_at: string; updated_at: string;
}

export interface CreateDocumentPayload {
  template_id: number|string; document_name: string;
  tenant_id?: number|string|null; tenant_name: string; tenant_phone: string;
  tenant_email?: string|null; property_name?: string|null; room_number?: string|null;
  html_content: string; data_json?: Record<string,string>;
  status?: DocumentStatus; created_by?: string;
  signature_required?: boolean; priority?: Priority;
  expiry_date?: string|null; tags?: string[]; notes?: string|null;
}

export interface DocumentFilters {
  search?: string; status?: string; priority?: string;
  tenant_id?: number|string; from_date?: string; to_date?: string;
  // ── NEW: property + floor filters ──────────────────────────────────────────
  property_name?: string; floor?: number|string;
  // ── NEW: hide_expired — when "true" excludes docs where expiry_date < today ─
  hide_expired?: "true"|"false";
  page?: number; pageSize?: number;
}

export interface ApiResult<T = any> {
  success: boolean; message?: string; data?: T;
  total?: number; page?: number; pageSize?: number; totalPages?: number;
}

async function req<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res  = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data as T;
}

export const listDocuments = (f: DocumentFilters = {}) => {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") p.set(k, String(v)); });
  const qs = p.toString();
  return req<ApiResult<Document[]>>(`${BASE}${qs ? `?${qs}` : ""}`);
};

export const getDocument          = (id: number|string)      => req<ApiResult<Document>>(`${BASE}/${id}`);
export const createDocument       = (p: CreateDocumentPayload) => req<ApiResult<Document>>(BASE, { method:"POST", body:JSON.stringify(p) });
export const updateDocumentStatus = (id: number|string, status: DocumentStatus, extra?: any) =>
  req<ApiResult<Document>>(`${BASE}/${id}/status`, { method:"PATCH", body:JSON.stringify({ status, ...extra }) });
export const deleteDocument       = (id: number|string)      => req(`${BASE}/${id}`, { method:"DELETE" });
export const bulkDeleteDocuments  = (ids: Array<number|string>) => req(`${BASE}/bulk-delete`, { method:"POST", body:JSON.stringify({ ids }) });

// ── NEW: fetch tenants who have NOT yet got a doc with a given template_id ───
// Returns tenant IDs that already have a document for this template
export const getTenantsWithDocumentForTemplate = (templateId: number|string) =>
  req<ApiResult<Array<{ tenant_id: number }>>>(`${BASE}/tenants-with-template/${templateId}`);