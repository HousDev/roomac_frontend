// lib/propertyApi.ts - Complete updated version
import { request } from "@/lib/api";

export type Property = {
  id: string;
  name: string;
  slug?: string;
  city_id?: string | null;
  state?: string | null;
  area?: string | null;
  address?: string | null;
  total_rooms?: number;
  total_beds?: number;
  occupied_beds?: number;
  starting_price?: number;
  security_deposit?: number;
  description?: string | null;
  property_manager_name?: string | null;
  property_manager_phone?: string | null;
  amenities?: string[];
  services?: string[];
  photo_urls?: string[];
  property_rules?: string | null;
  is_active?: boolean;
  rating?: number | null;
  created_at?: string;
  updated_at?: string | null;
  lockin_period_months?: number;
  lockin_penalty_amount?: number;
  lockin_penalty_type?: string;
  notice_period_days?: number;
  notice_penalty_amount?: number;
  notice_penalty_type?: string;
  terms_conditions?: string;
  additional_terms?: string;
  tags?: string[]; // Add this
};


export type ApiResult<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  meta?: any;
};

export type PropertyListResponse = {
  find(arg0: (property: any) => boolean): any;
  data: Property[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
};

export type ListOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  area?: string;
  state?: string;
  is_active?: boolean | null;
  tags?: string; // Add this
  _t ?: any;
};

/** GET /api/properties */
export async function listProperties(opts: ListOptions = {}) {
  const params = new URLSearchParams();

  if (opts.page) params.append("page", String(opts.page));
  if (opts.pageSize) params.append("pageSize", String(opts.pageSize));
  if (opts.search) params.append("search", opts.search);
  if (opts.area) params.append("area", opts.area);
  if (opts.state) params.append("state", opts.state);
  if (typeof opts.is_active === "boolean")
    params.append("is_active", opts.is_active ? "true" : "false");
  if (opts.tags) params.append("tags", opts.tags); // Add this

  const res = await request<ApiResult<PropertyListResponse>>(
    `/api/properties${params.toString() ? `?${params.toString()}` : ""}`,
    { method: "GET" }
  );

  return res;
}

/** GET /api/properties/:id */
export async function getProperty(id: string) {
  return await request<ApiResult<Property>>(`/api/properties/${id}`, {
    method: "GET",
  });
}

/** Build FormData for property operations */
function buildFormData(
  payload: Partial<Property>, 
  photoFiles?: File[] | null, 
  removedPhotos?: string[]
) {
  const fd = new FormData();


  // Add regular fields
  Object.entries(payload).forEach(([key, val]) => {
    if (val === undefined || val === null) return;

    // Handle special cases for arrays
    if (Array.isArray(val)) {
      val.forEach((v) => {
        // For tags, use "tags[]" format
        fd.append(key + "[]", String(v));
      });
    } else {
      fd.append(key, String(val));
    }
  });

  // Add removed photos if any
  if (removedPhotos && removedPhotos.length > 0) {
    removedPhotos.forEach((url) => {
      fd.append("removed_photos[]", url);
    });
  }

  // Add new photos
  if (photoFiles && photoFiles.length > 0) {
    photoFiles.forEach((file) => {
      fd.append("photos", file);
    });
  }

  return fd;
}

/** POST /api/properties */
export async function createProperty(
  payload: Partial<Property>,
  photoFiles?: File[] | null
) {
  const fd = buildFormData(payload, photoFiles);


  return await request<ApiResult<{ id: string }>>("/api/properties", {
    method: "POST",
    body: fd,
  });
}

/** PUT /api/properties/:id */
export async function updateProperty(
  id: string,
  payload: Partial<Property>,
  photoFiles?: File[] | null,
  removedPhotos?: string[]
) {
  const fd = buildFormData(payload, photoFiles, removedPhotos);


  return await request<ApiResult>(`/api/properties/${id}`, {
    method: "PUT",
    body: fd,
  });
}

/** DELETE /api/properties/:id */
export async function deleteProperty(id: string) {
  
  return await request<ApiResult>(`/api/properties/${id}`, {
    method: "DELETE",
  });
}

/** BULK DELETE /api/properties/bulk-delete */
export async function bulkDeleteProperties(ids: number[]) {
  
  return await request<ApiResult>("/api/properties/bulk-delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
    headers: { "Content-Type": "application/json" },
  });
}

/** BULK STATUS UPDATE /api/properties/bulk-status */
export async function bulkUpdateStatus(ids: number[], is_active: boolean) {
  
  try {
    const res = await request<ApiResult>("/api/properties/bulk-status", {
      method: "POST",
      body: JSON.stringify({ ids, is_active }),
      headers: { "Content-Type": "application/json" },
    });
    
    return res;
  } catch (err) {
    console.error("❌ Bulk status update error:", err);
    throw err;
  }
}

/** BULK TAGS UPDATE /api/properties/bulk-tags */
// lib/propertyApi.ts में

/** BULK TAGS UPDATE /api/properties/bulk-tags */
export async function bulkUpdateTags(ids: number[], tags: string[], operation: 'add' | 'remove' | 'set' = 'add') {
  try {
    console.log(`🏷️ Sending BULK TAGS UPDATE for ${ids.length} properties`);
    console.log(`📝 Tags: ${tags.join(', ')}, Operation: ${operation}`);
    
    const res = await request<ApiResult>("/api/properties/bulk-tags", {
      method: "POST",
      body: JSON.stringify({ 
        ids, 
        tags, 
        operation 
      }),
      headers: { 
        "Content-Type": "application/json" 
      },
    });
    
    console.log("📊 Bulk tags update response:", res);
    return res;
  } catch (error) {
    console.error('❌ Bulk tags update error:', error);
    throw error;
  }
}

/** DEBUG /api/properties/:id/debug */
export async function debugProperty(id: string) {
  
  return await request<ApiResult>(`/api/properties/${id}/debug`, {
    method: "GET",
  });
}


// Helper to get active properties for filters
export async function getPropertiesForFilter(): Promise<Array<{ id: number; name: string; address: string; city: string }>> {
  try {
    // Use your existing listProperties function
    const response = await listProperties({ is_active: true });
    
    if (response.success && response.data) {
      return response.data.data.map((property: any) => ({
        id: parseInt(property.id),
        name: property.name,
        address: property.address || '',
        city: property.city || ''
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching properties for filter:', error);
    return [];
  }
}