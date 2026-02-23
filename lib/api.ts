
/* ================= ENV / BASE URL ================= */

// Auto detect local or server
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

// Change domain if needed
const API_BASE_URL = isLocalhost
  ? "http://localhost:3001"
  : "https://roomac.in";

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

// Admin Token
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("admin_email");
  localStorage.removeItem("admin_logged_in");
}

// Tenant Token
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
 * ✅ Auto token attach
 * ✅ 401 → auto logout
 */
export async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  console.log("API →", url);

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

/* ================= ADMIN AUTH ================= */

/**
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

  if (res?.token) {
    setAuthToken(res.token);
    if (res.user?.email) {
      localStorage.setItem("admin_email", res.user.email);
      localStorage.setItem("admin_logged_in", "true");
    }
  }

  return res;
}

/* ================= COMMON HELPERS ================= */

// GET
export const apiGet = <T = any>(url: string) =>
  request<T>(url, { method: "GET" });

// POST
export const apiPost = <T = any>(url: string, body: any) =>
  request<T>(url, {
    method: "POST",
    body: JSON.stringify(body),
  });

// PUT
export const apiPut = <T = any>(url: string, body: any) =>
  request<T>(url, {
    method: "PUT",
    body: JSON.stringify(body),
  });

// DELETE
export const apiDelete = <T = any>(url: string) =>
  request<T>(url, { method: "DELETE" });
