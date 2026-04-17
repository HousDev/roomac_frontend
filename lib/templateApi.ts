// lib/templateApi.ts
// Matches the style of your existing maintenanceApi.ts

import { request } from "./api";

/* ================= TYPES ================= */

export type TemplateChannel = "sms" | "whatsapp" | "email";
export type TemplateCategory =
  | "otp" | "payment" | "verification" | "marketing"
  | "alert" | "reminder" | "welcome" | "notice";
export type TemplateStatus   = "pending" | "approved" | "rejected";
export type TemplatePriority = "normal" | "high" | "urgent";

export type MessageTemplate = {
  id: number;
  name: string;
  channel: TemplateChannel;
  category: TemplateCategory;
  sub_category: string | null; 
  content: string;
  subject: string | null;
  variables: string[];
  status: TemplateStatus;
  priority: TemplatePriority;
  auto_approve: 0 | 1;
  rejection_reason: string | null;
  usage_count: number;
  is_active: 0 | 1;
  created_by: number | null;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
  approved_by_name?: string;
};

export type CreateTemplatePayload = {
  name: string;
  channel: TemplateChannel;
  category: TemplateCategory;
   sub_category?: string; 
  content: string;
  subject?: string;
  variables?: string[];
  status?: TemplateStatus;
  priority?: TemplatePriority;
  auto_approve?: boolean;
};

export type TemplateStats = {
  channel: string;
  pending: number;
  approved: number;
  total: number;
};

/* ================= HELPERS ================= */

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token") || localStorage.getItem("token");
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

/* ================= API CALLS ================= */

// ── Get all templates
export async function getTemplates(filters?: {
  channel?: string;
  category?: string;
  sub_category?: string; 
  status?: string;
  search?: string;
  is_active?: string;
}): Promise<{ templates: MessageTemplate[]; stats: TemplateStats[] }> {
  try {
    const params = new URLSearchParams();
    if (filters?.channel && filters.channel !== "all") params.set("channel", filters.channel);
    if (filters?.category && filters.category !== "all") params.set("category", filters.category);
    if (filters?.sub_category && filters.sub_category !== "all") params.set("sub_category", filters.sub_category);  // ✅ Add this
    if (filters?.status && filters.status !== "all") params.set("status", filters.status);
    if (filters?.search) params.set("search", filters.search);
if (filters?.is_active !== undefined && filters.is_active !== "all") 
  params.set("is_active", filters.is_active);
    const url = `/api/admin/templates${params.toString() ? "?" + params.toString() : ""}`;
    const response = await request<{ success: boolean; data: MessageTemplate[]; stats: TemplateStats[] }>(
      url,
      { method: "GET", headers: authHeaders() }
    );

    return { templates: response.data || [], stats: response.stats || [] };
  } catch (error: any) {
    console.error("❌ Error fetching templates:", error.message);
    return { templates: [], stats: [] };
  }
}

// ── Get single template
export async function getTemplateById(id: number): Promise<MessageTemplate | null> {
  try {
    const response = await request<{ success: boolean; data: MessageTemplate }>(
      `/api/admin/templates/${id}`,
      { method: "GET", headers: authHeaders() }
    );
    return response.data || null;
  } catch (error: any) {
    console.error("❌ Error fetching template:", error.message);
    return null;
  }
}

// ── Create template
export async function createTemplate(payload: CreateTemplatePayload): Promise<MessageTemplate> {
  const response = await request<{ success: boolean; data: MessageTemplate }>(
    `/api/admin/templates`,
    { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) }
  );
  return response.data;
}

// ── Update template
export async function updateTemplate(id: number, payload: Partial<CreateTemplatePayload> & {
  status?: TemplateStatus;
  rejection_reason?: string;
}): Promise<MessageTemplate> {
  const response = await request<{ success: boolean; data: MessageTemplate }>(
    `/api/admin/templates/${id}`,
    { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) }
  );
  return response.data;
}

// ── Approve template
export async function approveTemplate(id: number): Promise<void> {
  await request(`/api/admin/templates/${id}/approve`, {
    method: "POST", headers: authHeaders(),
  });
}

// ── Reject template
export async function rejectTemplate(id: number, rejection_reason: string): Promise<void> {
  await request(`/api/admin/templates/${id}/reject`, {
    method: "POST", headers: authHeaders(),
    body: JSON.stringify({ rejection_reason }),
  });
}

// ── Duplicate template
export async function duplicateTemplate(id: number): Promise<MessageTemplate> {
  const response = await request<{ success: boolean; data: MessageTemplate }>(
    `/api/admin/templates/${id}/duplicate`,
    { method: "POST", headers: authHeaders() }
  );
  return response.data;
}

// ── Delete template (soft)
export async function deleteTemplate(id: number): Promise<void> {
  await request(`/api/admin/templates/${id}`, {
    method: "DELETE", headers: authHeaders(),
  });
}

// ── Bulk delete
export async function bulkDeleteTemplates(ids: number[]): Promise<void> {
  await request(`/api/admin/templates/bulk-delete`, {
    method: "POST", headers: authHeaders(),
    body: JSON.stringify({ ids }),
  });
}

// ── Get variables for a category
export async function getCategoryVariables(category: string): Promise<string[]> {
  try {
    const response = await request<{ success: boolean; data: string[] }>(
      `/api/admin/templates/variables/${category}`,
      { method: "GET", headers: authHeaders() }
    );
    return response.data || [];
  } catch {
    return [];
  }
}

// ── Toggle active/inactive
export async function toggleTemplateActive(id: number): Promise<{ is_active: 0 | 1 }> {
  const response = await request<{ success: boolean; is_active: 0 | 1 }>(
    `/api/admin/templates/${id}/toggle-active`,
    { method: "POST", headers: authHeaders() }
  );
  return response;
}