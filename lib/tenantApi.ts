// lib/tenantApi.ts - UPDATED VERSION
import { request } from "@/lib/api"; 

export type Tenant = {
  id: number | string;
  salutation?: string; // NEW FIELD
  full_name: string;
  email: string;
  phone?: string;
  country_code?: string;
  gender?: string;
  date_of_birth?: string;
  occupation_category?: string;
  exact_occupation?: string;
  occupation?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  preferred_sharing?: string;
  preferred_room_type?: string;
  preferred_property_id?: number;
  check_in_date?: string; 
  
  id_proof_url?: string;
  address_proof_url?: string;
  photo_url?: string;
  is_active?: boolean;
  portal_access_enabled?: boolean;
  // NEW FIELDS
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  additional_documents?: Array<{
    filename: string;
    url: string;
    uploaded_at?: string;
  }>;
  created_at?: string;
  updated_at?: string | null;
  has_credentials?: boolean;
  credential_email?: string | null;
   // New fields you added
  lockin_period_months?: number;
  lockin_penalty_amount?: number;
  lockin_penalty_type?: string;
  notice_period_days?: number;
  notice_penalty_amount?: number;
  notice_penalty_type?: string;
  property_id?: number; // This should be different from preferred_property_id
  bookings?: Array<{ 
    id: number | string; 
    status: string; 
    monthly_rent: number; 
    properties?: { 
      name: string;
      city?: string;
      state?: string;
    };
    room?: {
      room_number: number;
      room_type: string;
      sharing_type: string;
      floor: number;
    }
  }>;
  payments?: Array<{
    description: string;
    id: number | string;
    amount: number;
    payment_date: string;
    payment_method: string;
    payment_mode?: string; 
    transaction_id?: string;
    status: string;
    month?: string;
    year?: number;
    notes?: string;
    created_at: string;
  }>;
  current_assignment?: {
    id: number;
    room_id: number;
    bed_number: number;
    tenant_gender: string;
    is_available: boolean;
    room_number: string;
    property_name: string;
    property_id: number;
  };
  assigned_room_id?: number;
  assigned_bed_number?: number;
  assigned_room_number?: string;
  assigned_property_name?: string;
  assigned_property_id?: number;
  bed_is_available?: boolean;
};

// Add to Property type
export type Property = {
  id: number;
  name: string;
  city?: string;
  state?: string;
  address?: string;
  lockin_period_months: number;
  lockin_penalty_amount: number;
  lockin_penalty_type: string;
  notice_period_days: number;
  notice_penalty_amount: number;
  notice_penalty_type: string;
};

export type ApiResult<T = any> = {
  url: string;
  additional_documents(additional_documents: any): unknown;
  // additional_documents: any; 
  success: boolean; 
  data?: T; 
  message?: string; 
  meta?: any;
  file_urls?: {
    id_proof_url?: string;
    address_proof_url?: string;
    photo_url?: string;
  };
};

export type OptionType = {
  value: string | number;
  label: string;
  address?: string;
};

export type PreferredOptions = {
  sharingTypes: string[];
  roomTypes: string[];
  properties: OptionType[];
  genderOptions: string[];
  countryCodes: string[];
  occupations?: string[];
  cities?: string[];
  states?: string[];
};

export type LocationOptions = {
  cities: string[];
  states: string[];
};

// Update tenant without files (for simple updates)
// In tenantApi.ts - Add debugging
export async function updateTenantSimple(id: string | number, payload: Partial<Tenant>): Promise<ApiResult> {
  
  try {
    const result = await enhancedFetch<ApiResult>(`/api/tenants/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    return result;
  } catch (error: any) {
    console.error('❌ updateTenantSimple error:', error);
    throw error;
  }
}


// In tenantApi.ts - Fix enhancedFetch function
async function enhancedFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    if (process.env.NODE_ENV === 'development') {
     
    }
    
    // IMPORTANT: Don't set Content-Type for FormData
    const headers: HeadersInit = {};
    
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Add authorization token if available (SSR safe)
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('admin_token');
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Merge headers
    const mergedHeaders = {
      ...headers,
      ...options.headers,
    };
    
    // Use the request function which already includes API_BASE_URL
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${url}`, {
      ...options,
      headers: mergedHeaders,
      credentials: 'include',
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [enhancedFetch] Response status:', response.status, response.statusText);
    }
    
    // Check if response is HTML (404/error page)
    const contentType = response.headers.get('content-type');
    
    const responseText = await response.text();
    
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('❌ [enhancedFetch] Failed to parse JSON:', e);
      
      // If it's HTML, it's probably a 404/error page
      if (contentType?.includes('text/html')) {
        throw {
          status: response.status,
          message: `Server returned HTML (likely 404). Check if endpoint exists.`,
          response: responseText
        };
      }
      
      throw {
        status: response.status,
        message: 'Invalid JSON response from server',
        response: responseText
      };
    }
    
    if (!response.ok) {
      console.error('❌ [enhancedFetch] API error:', {
        status: response.status,
        data
      });
      throw {
        status: response.status,
        message: data.message || `HTTP ${response.status}`,
        response: data
      };
    }
    
    if (process.env.NODE_ENV === 'development') {
    }
    return data as T;
  } catch (error: any) {
    console.error('❌ [enhancedFetch] Error:', {
      url,
      error: error.message,
      status: error.status,
    });
    
    throw error;
  }
}

// List tenants with filters - SIMPLIFIED
export async function listTenants(filters: {
  search?: string;
  page?: number;
  pageSize?: number;
  gender?: string;
  occupation_category?: string;
  is_active?: string | boolean;
  portal_access_enabled?: string | boolean;
  has_credentials?: string | boolean;
  city?: string;
  state?: string;
  preferred_sharing?: string;
} = {}): Promise<any> {
  
  const params = new URLSearchParams();
  
  // Convert filters to query parameters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Handle boolean values
      if (typeof value === 'boolean') {
        params.append(key, value ? 'true' : 'false');
      } else {
        params.append(key, value.toString());
      }
    }
  });
  
  const queryString = params.toString();
  const path = `/api/tenants${queryString ? `?${queryString}` : ""}`;
  

  
  try {
    // Use enhancedFetch which internally uses `request` -> goes to localhost:3001
    const result = await enhancedFetch<ApiResult<Tenant[]>>(path, { method: "GET" });
    
    
    
    return result;
  } catch (error: any) {
    console.error('❌ Error fetching tenants:', error);
    
    // Return error structure
    return {
      success: false,
      message: error.message || 'Failed to fetch tenants',
      data: []
    };
  }
}

// ALTERNATIVE SIMPLE VERSION - Use directly without enhancedFetch
export async function listTenantsSimple(filters: any = {}): Promise<any> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  const queryString = params.toString();
  const path = `/api/tenants${queryString ? `?${queryString}` : ""}`;
  
  console.log('🚀 Direct API call to:', path);
  
  try {
    // Use the request function directly - it already goes to localhost:3001
    const result = await request<ApiResult<Tenant[]>>(path, { 
      method: "GET" 
    });
    
    return result;
  } catch (error: any) {
    console.error('API error:', error);
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
}

// Get single tenant by ID
export async function getTenant(id: string | number): Promise<ApiResult<Tenant>> {
  return enhancedFetch<ApiResult<Tenant>>(`/api/tenants/${id}`, { method: "GET" });
}

// Create tenant with FormData (for file uploads)
export async function createTenant(formData: FormData): Promise<ApiResult<{ id: number }>> {
  console.log('🔍 Creating tenant with FormData');
  console.log('🔍 FormData entries:');
  console.log('API tenant with ID:')

  Array.from(formData.entries()).forEach(([key, value]) => {
    console.log(`  ${key}:`, value);
  });
  return enhancedFetch<ApiResult<{ id: number }>>('/api/tenants', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it automatically with boundary
  });
}

// Alternative create tenant with JSON (without files)
export async function createTenantJson(tenantData: Partial<Tenant>): Promise<ApiResult<{ id: number }>> {
  
  return enhancedFetch<ApiResult<{ id: number }>>('/api/tenants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tenantData),
  });
}

// Update tenant with FormData (for file uploads)
export async function updateTenant(id: string | number, formData: FormData): Promise<ApiResult> {
  return enhancedFetch<ApiResult>(`/api/tenants/${id}`, {
    method: 'PUT',
    body: formData,
  });
}



// Delete tenant
export async function deleteTenant(id: string | number): Promise<ApiResult> {
  return enhancedFetch<ApiResult>(`/api/tenants/${id}`, { method: "DELETE" });
}

// Bulk operations
export async function bulkDeleteTenants(ids: Array<string | number>): Promise<ApiResult> {
  return enhancedFetch<ApiResult>(`/api/tenants/bulk-delete`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
}

export async function bulkUpdateTenantStatus(ids: Array<string | number>, is_active: boolean): Promise<ApiResult> {
  return enhancedFetch<ApiResult>(`/api/tenants/bulk-status`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids, is_active }),
  });
}

export async function bulkUpdateTenantPortalAccess(ids: Array<string | number>, portal_access_enabled: boolean): Promise<ApiResult> {
  return enhancedFetch<ApiResult>(`/api/tenants/bulk-portal-access`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids, portal_access_enabled }),
  });
}

// Credentials endpoints
export async function createCredential(tenant_id: number | string, email: string, password: string): Promise<ApiResult> {
  return enhancedFetch<ApiResult>(`/api/tenants/credentials`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tenant_id, email, password }),
  });
}

export async function resetCredential(tenantId: number | string, password: string): Promise<ApiResult> {
  return enhancedFetch<ApiResult>(`/api/tenants/credentials/${tenantId}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });
}

export async function getCredentialsByTenantIds(ids: Array<string | number>): Promise<ApiResult> {
  const q = ids.join(',');
  return enhancedFetch<ApiResult>(`/api/tenants/credentials/by-ids?ids=${encodeURIComponent(q)}`, { method: "GET" });
}

// Options endpoints
export async function getPreferredOptions(): Promise<ApiResult<PreferredOptions>> {
  return enhancedFetch<ApiResult<PreferredOptions>>(`/api/tenants/options/preferred`, { method: "GET" });
}

export async function getSharingTypes(): Promise<ApiResult<string[]>> {
  return enhancedFetch<ApiResult<string[]>>(`/api/tenants/options/sharing-types`, { method: "GET" });
}

export async function getRoomTypeOptions(): Promise<ApiResult<string[]>> {
  return enhancedFetch<ApiResult<string[]>>(`/api/tenants/options/room-types`, { method: "GET" });
}

export async function getPropertyOptions(): Promise<ApiResult<OptionType[]>> {
  return enhancedFetch<ApiResult<OptionType[]>>(`/api/tenants/options/properties`, { method: "GET" });
}

export async function getOccupationalCategories(): Promise<ApiResult<string[]>> {
  return enhancedFetch<ApiResult<string[]>>(`/api/tenants/options/occupations`, { method: "GET" });
}

export async function getLocationOptions(): Promise<ApiResult<LocationOptions>> {
  return enhancedFetch<ApiResult<LocationOptions>>(`/api/tenants/options/locations`, { method: "GET" });
}

// Room availability
export async function getAvailableRooms(gender: string, property_id?: number): Promise<ApiResult<any[]>> {
  const params = new URLSearchParams();
  params.append("gender", gender);
  if (property_id) params.append("property_id", property_id.toString());
  
  return enhancedFetch<ApiResult<any[]>>(`/api/tenants/rooms/available?${params.toString()}`, { method: "GET" });
}

// Properties
export async function getAllProperties(): Promise<ApiResult<any[]>> {
  console.log('Fetching all properties for tenants');
  return enhancedFetch<ApiResult<any[]>>(`/api/tenants/properties/all`, { method: "GET" });
}

// Upload document (for additional document uploads)
export async function uploadDocument(tenantId: string | number, type: string, file: File, formData: FormData | null): Promise<ApiResult> {
  return enhancedFetch<ApiResult>(`/api/tenants/${tenantId}/upload-document`, {
    method: 'POST',
    body: formData,
  });
}

// Export to Excel
export async function exportTenantsToExcel(filters: any = {}): Promise<{ success: boolean }> {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, value as string);
      }
    });

    // Use the request function instead of direct fetch
    const response = await request<Blob>(`/api/tenants/export/excel?${params.toString()}`, {
      method: 'GET',
    });

    // Handle the blob response
    const url = window.URL.createObjectURL(response);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `tenants_${date}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
  } catch (error: any) {
    console.error('Export error:', error);
    throw error;
  }
}

// Get room types (sharing types and room types)
export async function getRoomTypes(): Promise<any> {
  try {
    return await enhancedFetch<ApiResult<{ sharingTypes: string[]; roomTypes: string[] }>>('/api/tenants/rooms/types');
  } catch (error) {
    console.error('Error fetching room options:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error',
      data: { sharingTypes: [], roomTypes: [] } 
    };
  }
}

// Helper function to create FormData from tenant object
export function createTenantFormData(tenantData: Partial<Tenant>, files?: {
  id_proof_url?: File;
  address_proof_url?: File;
  photo_url?: File;
}): FormData {
  const formData = new FormData();
  
  // Add all text fields
  Object.entries(tenantData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Handle different types
      if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      } else if (typeof value === 'number') {
        formData.append(key, value.toString());
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString().split('T')[0]);
      } else if (typeof value === 'string' && value.trim() !== '') {
        formData.append(key, value);
      }
    }
  });
  
  // Add files if provided
  if (files) {
    if (files.id_proof_url) {
      formData.append('id_proof_url', files.id_proof_url);
    }
    if (files.address_proof_url) {
      formData.append('address_proof_url', files.address_proof_url);
    }
    if (files.photo_url) {
      formData.append('photo_url', files.photo_url);
    }
  }
  
  // Debug form data
  console.debug('FormData created:', {
    keys: Array.from(formData.keys()),
    hasIdProof: files?.id_proof_url ? true : false,
    hasAddressProof: files?.address_proof_url ? true : false,
    hasPhoto: files?.photo_url ? true : false,
  });
  
  return formData;
}

// Helper function to prepare tenant data for API
export function prepareTenantPayload(tenantData: Partial<Tenant>): Partial<Tenant> {
  const payload = { ...tenantData };
  
  // Remove empty strings
  Object.keys(payload).forEach(key => {
    if (payload[key as keyof Tenant] === '') {
      delete payload[key as keyof Tenant];
    }
  });
  
  // Handle specific fields
  if (payload.date_of_birth && payload.date_of_birth.includes('T')) {
    payload.date_of_birth = payload.date_of_birth.split('T')[0];
  }
  
  return payload;
}

// Validation functions
export function validateTenantData(data: Partial<Tenant>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.full_name?.trim()) {
    errors.push('Full name is required');
  }
  
  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.push('Email is invalid');
  }
  
  if (!data.phone?.trim()) {
    errors.push('Phone number is required');
  } else if (!/^[6-9]\d{9}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Phone number must be a valid 10-digit Indian number');
  }
  
  if (data.date_of_birth) {
    const dob = new Date(data.date_of_birth);
    if (isNaN(dob.getTime())) {
      errors.push('Date of birth is invalid');
    } else {
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 18) {
        errors.push('Tenant must be at least 18 years old');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Type for tenant list filters
export type TenantFilters = {
  search?: string;
  page?: number;
  pageSize?: number;
  gender?: string;
  occupation_category?: string;
  is_active?: boolean | string;
  portal_access_enabled?: boolean | string;
  has_credentials?: boolean | string;
  city?: string;
  state?: string;
  preferred_sharing?: string;
};

// Type for export filters
export type ExportFilters = {
  gender?: string;
  occupation_category?: string;
  city?: string;
  state?: string;
  is_active?: boolean | string;
  portal_access_enabled?: boolean | string;
};

// Utility to convert filters to query params
export function filtersToParams(filters: TenantFilters): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'boolean') {
        params.append(key, value ? 'true' : 'false');
      } else {
        params.append(key, value.toString());
      }
    }
  });
  
  return params.toString();
}

// Test API connection
export async function testApiConnection(): Promise<any> {
  try {
    return await enhancedFetch<ApiResult>('/api/tenants/diagnostic');
  } catch (error) {
    console.error('API connection test failed:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'API connection failed' 
    };
  }
}

// Diagnostic function to test tenant creation
export async function testCreateTenant(): Promise<any> {
  try {
    const testData = {
      full_name: 'Test Tenant',
      email: 'test@example.com',
      phone: '9876543210',
      country_code: '+91',
      gender: 'Male',
      is_active: true,
      portal_access_enabled: false
    };
    
    const formData = createTenantFormData(testData);
    
    console.log('Testing tenant creation with:', testData);
    const result = await createTenant(formData);
    console.log('Test result:', result);
    
    return result;
  } catch (error: any) {
    console.error('Test failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Pre-fill options cache
let optionsCache: PreferredOptions | null = null;

export async function getCachedOptions(): Promise<PreferredOptions> {
  if (!optionsCache) {
    try {
      const result = await getPreferredOptions();
      if (result.success && result.data) {
        optionsCache = result.data;
      } else {
        optionsCache = {
          sharingTypes: ['Single', 'Double', 'Triple', 'Quad'],
          roomTypes: ['AC', 'Non-AC', 'Deluxe', 'Premium'],
          properties: [],
          genderOptions: ['Male', 'Female', 'Other'],
          countryCodes: ['+91'],
          cities: [],
          states: []
        };
      }
    } catch (error) {
      console.error('Failed to fetch options:', error);
      optionsCache = {
        sharingTypes: ['Single', 'Double', 'Triple', 'Quad'],
        roomTypes: ['AC', 'Non-AC', 'Deluxe', 'Premium'],
        properties: [],
        genderOptions: ['Male', 'Female', 'Other'],
        countryCodes: ['+91'],
        cities: [],
        states: []
      };
    }
  }
  return optionsCache;
}

export function clearOptionsCache() {
  optionsCache = null;
}

// Default tenant data for forms
export const defaultTenantData: Partial<Tenant> = {
  country_code: '+91',
  is_active: true,
  portal_access_enabled: false,
  gender: '',
  occupation_category: '',
  preferred_sharing: '',
  preferred_room_type: '',
};

// Enhanced error handler for forms
export function handleApiError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// Add this to your tenantApi.ts or propertyApi.ts
export async function getPropertyById(id: number) {
  try {
    const res = await request<ApiResult<Property>>(`/api/properties/${id}`, {
      method: "GET",
    });
    return res;
  } catch (error) {
    console.error("Failed to fetch property", error);
    return { success: false, message: "Failed to fetch property details" };
  }
}

// Update this function in tenantApi.ts
export async function getPropertyDetails(id: number) {
  try {
    const res = await request<ApiResult<Property>>(`/api/tenants/property/${id}/details`);
    return res;
  } catch (error) {
    console.error("Failed to fetch property details", error);
    return { success: false, message: "Failed to fetch property details" };
  }
}

export async function listTenantsWithAssignments(filters: any = {}): Promise<ApiResult<Tenant[]>> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  const queryString = params.toString();
  const path = `/api/tenants/with-assignments${queryString ? `?${queryString}` : ""}`;
  
  return enhancedFetch<ApiResult<Tenant[]>>(path, { method: "GET" });
}


// Add this optimized function for tenant listing
export async function listTenantsOptimized(
  filters: TenantFilters,
  signal?: AbortSignal
): Promise<any> {
  const controller = new AbortController();
  const abortSignal = signal || controller.signal;
  
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'boolean') {
        params.append(key, value ? 'true' : 'false');
      } else {
        params.append(key, value.toString());
      }
    }
  });
  
  const queryString = params.toString();
  const path = `/api/tenants${queryString ? `?${queryString}` : ""}`;
  
  try {
    // Use the request function which already handles the base URL
    const data = await request<ApiResult<Tenant[]>>(path, {
      signal: abortSignal,
    });
    
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Request was aborted');
      return { success: false, message: 'Request aborted', data: [] };
    }
    
    console.error('Error fetching tenants:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to fetch tenants',
      data: [] 
    };
  }
}

// Add caching utility
const tenantCache = new Map<string, { data: Tenant[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getTenantsWithCache(
  filters: TenantFilters,
  forceRefresh = false
): Promise<any> {
  const cacheKey = JSON.stringify(filters);
  
  // Check cache
  if (!forceRefresh && tenantCache.has(cacheKey)) {
    const cached = tenantCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached tenants');
      return { success: true, data: cached.data };
    }
  }
  
  // Fetch fresh data
  const result = await listTenants(filters);
  
  if (result.success && result.data) {
    // Update cache
    tenantCache.set(cacheKey, {
      data: result.data,
      timestamp: Date.now()
    });
  }
  
  return result;
}

// Clear cache utility
export function clearTenantCache() {
  tenantCache.clear();
}