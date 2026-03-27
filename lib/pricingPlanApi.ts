// lib/pricingPlanApi.ts

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface PricingPlan {
  id: string;
  property_id: number | null;
  property_name?: string | null;
  name: string;
  duration: string;
  subtitle: string;
  total_price: number;
  per_day_price: number;
  is_popular: boolean;
  button_style: "dark" | "blue";
  features: string[];
  is_active: boolean;
  display_order: number;

  // Short stay fields
  is_short_stay: boolean;
  short_stay_label: string;
  short_stay_rate_per_day: number;

  created_at: string;
  updated_at: string | null;
}

export interface ShortStayBanner {
  id?: string;
  property_id?: number | null;
  label: string;
  rate_per_day: number;
  is_active: boolean;
}

export interface PricingPlanFormData {
  name: string;
  duration: string;
  subtitle: string;
  total_price: string;
  per_day_price: string;
  is_popular: boolean;
  button_style: "dark" | "blue";
  features: string[];
  is_active: boolean;
  display_order: string;
  property_id: number | null;
  is_short_stay: boolean;
  short_stay_label: string;
  short_stay_rate_per_day: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface PaginatedPricingResponse {
  success: boolean;
  data: PricingPlan[];
  pagination: PaginationMeta;
}

const request = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Network error" }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
};

export const pricingPlanApi = {
  getPaginated: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    property_id?: string;
    is_active?: boolean;
    type?: "regular" | "short_stay" | "all";
  }): Promise<PaginatedPricingResponse> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", params.page.toString());
    if (params.limit) q.set("limit", params.limit.toString());
    if (params.search) q.set("search", params.search);
    if (params.property_id) q.set("property_id", params.property_id);
    if (params.is_active !== undefined) q.set("is_active", params.is_active.toString());
    if (params.type) q.set("type", params.type);
    return request<PaginatedPricingResponse>(`/api/pricing-plans/paginated?${q.toString()}`);
  },

  getById: async (id: string): Promise<PricingPlan> => {
    const data = await request<{ success: boolean; data: PricingPlan }>(`/api/pricing-plans/${id}`);
    return data.data;
  },

  create: async (body: Partial<PricingPlan>): Promise<{ id: string }> => {
    return request("/api/pricing-plans", { method: "POST", body: JSON.stringify(body) });
  },

  update: async (id: string, body: Partial<PricingPlan>): Promise<void> => {
    await request(`/api/pricing-plans/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  },

  remove: async (id: string): Promise<void> => {
    await request(`/api/pricing-plans/${id}`, { method: "DELETE" });
  },

  toggleActive: async (id: string, isActive: boolean): Promise<void> => {
    await request(`/api/pricing-plans/${id}/toggle`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive }),
    });
  },

  // Short stay management
  // propertyId = undefined → fetch general (property_id IS NULL)
  // propertyId = "123"    → fetch property-specific
// FIXED
getShortStayBanner: async (propertyId?: string): Promise<ShortStayBanner | null> => {
  const q = propertyId ? `?property_id=${propertyId}` : "";
  const data = await request<{ success: boolean; data: ShortStayBanner | null }>(
    `/api/pricing-plans/short-stay-banner${q}`
  );
  return data.data || null;
},

  upsertShortStayBanner: async (body: Partial<ShortStayBanner>): Promise<void> => {
    await request("/api/pricing-plans/short-stay-banner", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};