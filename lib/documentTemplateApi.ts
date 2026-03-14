// lib/documentTemplateApi.ts

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const BASE_PATH = "/api/document-templates";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VersionSnapshot {
  version:      number;
  name:         string;
  category:     string;
  description?: string;
  html_content: string;
  variables:    string[];
  logo_url?:    string | null;
  change_notes?: string;
  modified_by:  string;
  saved_at:     string;
}

export interface DocumentTemplate {
  id:               string | number;
  name:             string;
  category:         string;
  description?:     string;
  html_content:     string;
  variables:        string[];
  version:          number;
  version_history:  VersionSnapshot[];
  is_active:        boolean;
  logo_url?:        string | null;
  change_notes?:    string;
  created_by?:      string;
  last_modified_by?: string;
  created_at:       string;
  updated_at:       string;
}

export interface TemplateFilters {
  category?:  string;
  is_active?: string | boolean;
  search?:    string;
}

export interface CreateTemplatePayload {
  name:          string;
  category?:     string;
  description?:  string;
  html_content:  string;
  change_notes?: string;
  logo?:         File | null;
}

export interface UpdateTemplatePayload extends Partial<CreateTemplatePayload> {
  is_active?:    boolean;
  remove_logo?:  boolean;
}

export interface ApiResult<T = any> {
  success:  boolean;
  message?: string;
  count?:   number;
  data?:    T;
}

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function req<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("admin_token")
    : null;

  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token)       headers["Authorization"] = `Bearer ${token}`;

  const res  = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: "include" });
  const data = await res.json();

  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data as ApiResult<T>;
}

// ─── Build FormData from payload ─────────────────────────────────────────────

function buildFormData(payload: CreateTemplatePayload | UpdateTemplatePayload): FormData {
  const fd = new FormData();

  if (payload.name         !== undefined) fd.append("name",         payload.name);
  if (payload.category     !== undefined) fd.append("category",     payload.category!);
  if (payload.description  !== undefined) fd.append("description",  payload.description!);
  if (payload.html_content !== undefined) fd.append("html_content", payload.html_content);
  if (payload.change_notes !== undefined) fd.append("change_notes", payload.change_notes!);

  if ((payload as UpdateTemplatePayload).is_active !== undefined)
    fd.append("is_active", String((payload as UpdateTemplatePayload).is_active));

  if ((payload as UpdateTemplatePayload).remove_logo)
    fd.append("remove_logo", "true");

  if (payload.logo) fd.append("logo", payload.logo);

  return fd;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /api/document-templates
 * Fetch all templates with optional filters
 */
export async function listTemplates(
  filters: TemplateFilters = {}
): Promise<ApiResult<DocumentTemplate[]>> {
  const params = new URLSearchParams();
  if (filters.category  !== undefined && filters.category  !== "all") params.set("category",  filters.category);
  if (filters.is_active !== undefined && filters.is_active !== "all") params.set("is_active", String(filters.is_active));
  if (filters.search)                                                  params.set("search",    filters.search);

  const qs = params.toString();
  return req<DocumentTemplate[]>(`${BASE_PATH}${qs ? `?${qs}` : ""}`);
}

/**
 * GET /api/document-templates/:id
 * Fetch single template by ID (includes version_history)
 */
export async function getTemplate(
  id: string | number
): Promise<ApiResult<DocumentTemplate>> {
  return req<DocumentTemplate>(`${BASE_PATH}/${id}`);
}

/**
 * POST /api/document-templates
 * Create a new template (multipart/form-data)
 */
export async function createTemplate(
  payload: CreateTemplatePayload
): Promise<ApiResult<DocumentTemplate>> {
  return req<DocumentTemplate>(BASE_PATH, {
    method: "POST",
    body:   buildFormData(payload),
  });
}

/**
 * PUT /api/document-templates/:id
 * Update existing template — auto-increments version on backend
 */
export async function updateTemplate(
  id:      string | number,
  payload: UpdateTemplatePayload
): Promise<ApiResult<DocumentTemplate>> {
  return req<DocumentTemplate>(`${BASE_PATH}/${id}`, {
    method: "PUT",
    body:   buildFormData(payload),
  });
}

/**
 * DELETE /api/document-templates/:id
 */
export async function deleteTemplate(
  id: string | number
): Promise<ApiResult> {
  return req(`${BASE_PATH}/${id}`, { method: "DELETE" });
}

/**
 * POST /api/document-templates/bulk-delete
 */
export async function bulkDeleteTemplates(
  ids: Array<string | number>
): Promise<ApiResult> {
  return req(`${BASE_PATH}/bulk-delete`, {
    method: "POST",
    body:   JSON.stringify({ ids }),
  });
}

/**
 * POST /api/document-templates/bulk-status
 */
export async function bulkUpdateTemplateStatus(
  ids:       Array<string | number>,
  is_active: boolean
): Promise<ApiResult> {
  return req(`${BASE_PATH}/bulk-status`, {
    method: "POST",
    body:   JSON.stringify({ ids, is_active }),
  });
}

/**
 * POST /api/document-templates/:id/restore/:version
 * Restore a past version — creates a new version on backend
 */
export async function restoreTemplateVersion(
  id:      string | number,
  version: number
): Promise<ApiResult<DocumentTemplate>> {
  return req<DocumentTemplate>(`${BASE_PATH}/${id}/restore/${version}`, {
    method: "POST",
  });
}