// lib/api.ts
const API_BASE_URL =
  // import.meta.env.VITE_API_URL || "http://localhost:3001";
  import.meta.env.VITE_API_URL || "https://roomac.in";

/* ================= TYPES ================= */

export type ApiResult<T = any> = {
  success: boolean;
  message?: string;
  token?: string;
  user?: T;
  data?: any;
  [key: string]: any;
};

export type User = {
  id: number;
  email: string;
};

/* ================= TOKEN HELPERS ================= */

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("admin_token", token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_email");
  localStorage.removeItem("admin_logged_in");
}


// Add tenant token functions
export function getTenantToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tenant_token");
}

export function clearTenantToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("tenant_token");
  localStorage.removeItem("tenant_id");
  localStorage.removeItem("tenant_logged_in");
}


/* ================= REQUEST HELPER ================= */
/**
 * ✅ JSON → Content-Type set
 * ✅ FormData → Content-Type NOT set
 */
export async function request<T = any>(
path: string, options: RequestInit = {}, p0?: boolean): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  console.log(url);
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Invalid JSON response from server");
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearAuthToken();
    }
    const err: any = new Error(data?.message || "API request failed");
    err.status = res.status;
    err.response = data;
    throw err;
  }

  return data as T;
}

/* ================= ADMIN LOGIN ================= */
/**
 * ✅ THIS WAS MISSING – NOW FIXED
 * POST /api/auth/login
 */
export async function loginAdmin(
  email: string,
  password: string
): Promise<ApiResult<User>> {
  const res = await request<ApiResult<User>>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // ✅ save token
  if (res?.token) {
    setAuthToken(res.token);
    if (res.user?.email) {
      localStorage.setItem("admin_email", res.user.email);
      localStorage.setItem("admin_logged_in", "true");
    }
  }

  return res;
}
