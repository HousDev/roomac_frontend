// lib/tenantApiHelper.ts - NEW FILE
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Get tenant token from localStorage
 */
function getTenantToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tenant_token");
}

/**
 * Tenant-specific API request helper
 * This ONLY uses tenant tokens, never admin tokens
 */
export async function tenantApiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  
  const token = getTenantToken();
  console.log('tenant token retrieved for contract details:', token );
  
  if (!token) {
    console.error('❌ No tenant token found! User needs to login.');
    throw new Error('Authentication required. Please login to tenant portal.');
  }

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
 ;
  
  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    console.error('❌ Failed to parse JSON response:', error);
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    console.error('❌ Tenant API request failed:', {
      status: res.status,
      path: url,
      error: data.message
    });
    
    if (res.status === 401) {
      // Clear tenant token on unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("tenant_token");
        localStorage.removeItem("tenant_id");
        localStorage.removeItem("tenant_logged_in");
      }
      
      if (data.message?.includes('Invalid token type')) {
        throw new Error('Access denied. Please use tenant login portal.');
      }
      throw new Error('Session expired. Please login again.');
    }
    
    const err: any = new Error(data?.message || "API request failed");
    err.status = res.status;
    err.response = data;
    err.path = path;
    throw err;
  }

  console.log('✅ Tenant API request successful:', data.success ? 'Yes' : 'No');
  return data as T;
}