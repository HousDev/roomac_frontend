// lib/documentApi.ts — frontend API lib

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const BASE     = "/api/documents";

export type DocumentStatus = "Created"|"Sent"|"Viewed"|"Signed"|"Completed"|"Expired"|"Cancelled";
export type Priority       = "low"|"normal"|"high"|"urgent";

export interface Document {
  id:                 number;
  document_number:    string;
  template_id:        number | string;
  document_name:      string;
  document_title:     string | null;
  document_type:      string | null;
  tenant_id:          number | null;
  tenant_name:        string;
  tenant_phone:       string;
  tenant_email:       string | null;
  aadhaar_number:     string | null;
  pan_number:         string | null;
  emergency_contact_name: string | null;
  emergency_phone:    string | null;
  property_name:      string | null;
  property_address:   string | null;
  room_number:        string | null;
  bed_number:         string | null;
  move_in_date:       string | null;
  rent_amount:        number | null;
  security_deposit:   number | null;
  payment_mode:       string | null;
  company_name:       string | null;
  company_address:    string | null;
  html_content:       string;
  data_json:          Record<string, string>;
  status:             DocumentStatus;
  created_by:         string;
  signature_required: boolean;
  signature_data:     string | null;
  signed_at:          string | null;
  signed_by:          string | null;
  priority:           Priority;
  expiry_date:        string | null;
  tags:               string[];
  notes:              string | null;
  share_token:        string | null;
  share_expires_at:   string | null;
  history_log:        any[];
  created_at:         string;
  updated_at:         string;
}

export interface DocumentFilters {
  search?:    string;
  status?:    DocumentStatus | string;
  priority?:  Priority | string;
  tenant_id?: number | string;
  from_date?: string;
  to_date?:   string;
  page?:      number;
  pageSize?:  number;
}

export interface ApiResult<T = any> {
  success:     boolean;
  message?:    string;
  data?:       T;
  total?:      number;
  page?:       number;
  pageSize?:   number;
  totalPages?: number;
}

// ─── Internal fetch ───────────────────────────────────────────────────────────
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

// ─── API functions ────────────────────────────────────────────────────────────

export const listDocuments = (f: DocumentFilters = {}): Promise<ApiResult<Document[]>> => {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  });
  const qs = p.toString();
  return req<ApiResult<Document[]>>(`${BASE}${qs ? `?${qs}` : ""}`);
};

export const getDocument = (id: number | string): Promise<ApiResult<Document>> =>
  req<ApiResult<Document>>(`${BASE}/${id}`);

export const createDocument = (payload: any): Promise<ApiResult<Document>> =>
  req<ApiResult<Document>>(BASE, { method: "POST", body: JSON.stringify(payload) });

export const updateDocumentStatus = (
  id: number | string,
  status: DocumentStatus,
  extra?: { signed_by?: string; signature_data?: string }
): Promise<ApiResult<Document>> =>
  req<ApiResult<Document>>(`${BASE}/${id}/status`, {
    method: "PATCH",
    body:   JSON.stringify({ status, ...extra }),
  });

export const generateShareLink = (
  id: number | string
): Promise<ApiResult<{ token: string; shareUrl: string; expires: string }>> =>
  req(`${BASE}/${id}/share`, { method: "POST", body: JSON.stringify({}) });

export const deleteDocument = (id: number | string): Promise<ApiResult> =>
  req(`${BASE}/${id}`, { method: "DELETE" });

export const bulkDeleteDocuments = (ids: Array<number | string>): Promise<ApiResult> =>
  req(`${BASE}/bulk-delete`, { method: "POST", body: JSON.stringify({ ids }) });