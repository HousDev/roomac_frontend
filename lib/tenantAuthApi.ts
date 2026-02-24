

// lib/tenantAuthApi.ts
import { request, type ApiResult } from "@/lib/api";

/* ================= TYPES ================= */

export type TenantLoginResponse = {
  success: boolean;
  token?: string;
  tenant_id?: string | number;
  tenant?: any;
  error?: string;
  otp?: string;
  message?: string;
};

export type TenantProfile = {
  salutation?: string;
  id: number | string;
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
  photo_url?: string;
  is_active?: boolean;
  portal_access_enabled?: boolean;
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
    id: number | string;
    amount: number;
    payment_date: string;
    payment_method: string;
    status: string;
    created_at: string;
  }>;
  property_name?: string;
  room_number?: string;
  bed_number?: string;
  check_in_date?: string;
  amenities?:any[];
  property_manager_name?: string;
  property_manager_phone?: string;
  notice_period_days ?: any;
  lockin_period_months ?: any;
  property_city?: any;
  rent_per_bed?: any;
  floor?: any;
};

/* ================= TOKEN HELPERS ================= */

export function getTenantToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tenant_token");
}

export function setTenantToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("tenant_token", token);
}

export function setTenantId(id: string | number) {
  if (typeof window === "undefined") return;
  localStorage.setItem("tenant_id", id.toString());
}

export function getTenantId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tenant_id");
}

export function clearTenantToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("tenant_token");
  localStorage.removeItem("tenant_id");
  localStorage.removeItem("tenant_logged_in");
}

export function isTenantLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("tenant_token");
}

/* ================= AUTHENTICATION ================= */

/**
 * Login tenant with email and password
 * POST /api/tenant-auth/login
 */
export async function loginTenant(
  email: string,
  password: string
): Promise<TenantLoginResponse> {
  try {
    console.log('🔍 Attempting tenant login for:', email);
    
    const res = await request<TenantLoginResponse>("/api/tenant-auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    console.log('🔍 Login response:', res);

    if (res.success && res.token) {
      setTenantToken(res.token);
      if (res.tenant_id) {
        setTenantId(res.tenant_id);
        localStorage.setItem("tenant_logged_in", "true");
      }
    }

    return res;
  } catch (error: any) {
    console.error('❌ Tenant login error:', error);
    return {
      success: false,
      error: error.message || "Login failed. Please try again.",
    };
  }
}

/**
 * Send OTP to tenant's email
 * POST /api/tenant-auth/send-otp
 */
export async function sendTenantOTP(
  email: string
): Promise<TenantLoginResponse> {
  try {
    console.log('🔍 Sending OTP to:', email);
    
    const res = await request<TenantLoginResponse>("/api/tenant-auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    console.log('🔍 Send OTP response:', res);
    return res;
  } catch (error: any) {
    console.error('❌ Send OTP error:', error);
    return {
      success: false,
      error: error.message || "Failed to send OTP. Please try again.",
    };
  }
}

/**
 * Verify OTP for tenant login
 * POST /api/tenant-auth/verify-otp
 */
export const verifyTenantOTP = async (
  email: string,
  otp: string
): Promise<TenantLoginResponse> => {
  try {
    console.log('🔍 Verifying OTP for:', email);

    const res = await request<TenantLoginResponse>(
      "/api/tenant-auth/verify-otp",
      {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      }
    );

    console.log('🔍 Verify OTP response:', res);

    if (res.success && res.token) {
      setTenantToken(res.token);
      if (res.tenant_id) {
        setTenantId(res.tenant_id);
        localStorage.setItem("tenant_logged_in", "true");
      }
    }

    return res;
  } catch (error: any) {
    console.error('❌ Verify OTP error:', error);
    return {
      success: false,
      error: error.message || "OTP verification failed. Please try again.",
    };
  }
};


/* ================= TENANT PROFILE ================= */

/**
 * Get current tenant profile
 * GET /api/tenant-auth/profile
 */
export async function getTenantProfile(): Promise<ApiResult<TenantProfile>> {
  const token = getTenantToken();
  
  if (!token) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  try {
    const res = await request<ApiResult<TenantProfile>>("/api/tenant-auth/profile", {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return res;
  } catch (error: any) {
    console.error('❌ Get profile error:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch profile",
    };
  }
}

/**
 * Get tenant profile by ID (for admin use)
 * GET /api/tenants/:id
 */
export async function getTenantById(id: string | number): Promise<ApiResult<TenantProfile>> {
  try {
    return await request<ApiResult<TenantProfile>>(`/api/tenants/${id}`, {
      method: "GET",
    });
  } catch (error: any) {
    console.error('❌ Get tenant by ID error:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch tenant",
    };
  }
}

/* ================= PASSWORD MANAGEMENT ================= */

/**
 * Change tenant password
 * POST /api/tenant-auth/change-password
 */
export async function changeTenantPassword(
  currentPassword: string,
  newPassword: string
): Promise<ApiResult> {
  const token = getTenantToken();
  
  if (!token) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  try {
    return await request<ApiResult>("/api/tenant-auth/change-password", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  } catch (error: any) {
    console.error('❌ Change password error:', error);
    return {
      success: false,
      message: error.message || "Failed to change password",
    };
  }
}

/**
 * Reset password request (forgot password)
 * POST /api/tenant-auth/reset-password-request
 */
export async function requestPasswordReset(
  email: string
): Promise<ApiResult> {
  try {
    return await request<ApiResult>("/api/tenant-auth/reset-password-request", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  } catch (error: any) {
    console.error('❌ Reset password request error:', error);
    return {
      success: false,
      message: error.message || "Failed to request password reset",
    };
  }
}

/**
 * Reset password with token
 * POST /api/tenant-auth/reset-password
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ApiResult> {
  try {
    return await request<ApiResult>("/api/tenant-auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  } catch (error: any) {
    console.error('❌ Reset password error:', error);
    return {
      success: false,
      message: error.message || "Failed to reset password",
    };
  }
}

/* ================= SESSION MANAGEMENT ================= */

/**
 * Logout tenant
 * POST /api/tenant-auth/logout
 */
export async function logoutTenant(): Promise<ApiResult> {
  const token = getTenantToken();
  
  try {
    if (token) {
      await request<ApiResult>("/api/tenant-auth/logout", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    
    clearTenantToken();
    return { success: true, message: "Logged out successfully" };
  } catch (error: any) {
    console.error('❌ Logout error:', error);
    clearTenantToken(); // Clear token even if logout request fails
    return {
      success: false,
      message: error.message || "Logout completed locally",
    };
  }
}

/**
 * Check tenant authentication status
 * GET /api/tenant-auth/check
 */
export async function checkTenantAuth(): Promise<ApiResult> {
  const token = getTenantToken();
  
  if (!token) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  try {
    return await request<ApiResult>("/api/tenant-auth/check", {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error('❌ Check auth error:', error);
    return {
      success: false,
      message: error.message || "Failed to check authentication",
    };
  }
}

/* ================= TEST UTILITIES ================= */

/**
 * Test function to verify API connection
 */
export async function testTenantAuthApi(): Promise<ApiResult> {
  try {
    return await request<ApiResult>("/api/tenant-auth/test");
  } catch (error: any) {
    console.error('❌ Test API error:', error);
    return {
      success: false,
      message: error.message || "API connection failed",
    };
  }
}

/**
 * Test login with default credentials
 */
export async function testTenantLogin(): Promise<TenantLoginResponse> {
  return await loginTenant("test@example.com", "password123");
}

/* ================= HOOKS HELPERS ================= */

/**
 * Initialize tenant authentication - call this on app startup
 */
export function initializeTenantAuth(): boolean {
  const token = getTenantToken();
  const tenantId = getTenantId();
  
  if (token && tenantId) {
    console.log('✅ Tenant authentication initialized');
    return true;
  }
  
  console.log('⚠️ No tenant authentication found');
  return false;
}

/**
 * Get authentication headers for manual fetch calls
 */
export function getTenantAuthHeaders(): Record<string, string> {
  const token = getTenantToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Create authenticated fetch function for tenant
 */
export function tenantFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const fullUrl = `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${url}`;
  const headers = getTenantAuthHeaders();
  
  return fetch(fullUrl, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });
}

/**
 * Get tenant dashboard profile
 */
export async function getTenantDashboardProfile(): Promise<ApiResult<TenantProfile>> {
  try {
    const token = getTenantToken();
    if (!token) {
      return {
        success: false,
        message: "No token found"
      };
    }

    return await request<ApiResult<TenantProfile>>('/api/tenant-details/profile', {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error('Error fetching tenant profile:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch profile"
    };
  }
}