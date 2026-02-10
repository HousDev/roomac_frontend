// lib/adminApi.ts

const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:3001";

export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

// Get admin token from localStorage
function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

// Make authenticated admin request
async function makeAdminRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAdminToken();
  
  if (!token) {
    throw new Error('Admin authentication required. Please login.');
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
      }
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }

    return data as T;
  } catch (error: any) {
    console.error(`Admin API Error (${endpoint}):`, error);
    throw error;
  }
}

// Admin Dashboard APIs

export async function getAdminDashboardStats(): Promise<any> {
  try {
    const [leaveStats, tenantStats] = await Promise.all([
      makeAdminRequest<ApiResponse>('/api/leave-requests/stats/summary'),
      makeAdminRequest<ApiResponse>('/api/tenant_requests/stats/summary')
    ]);
    
    return {
      leave_requests: leaveStats.data || {},
      tenant_requests: tenantStats.data || {}
    };
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

export async function getStaffList(): Promise<any[]> {
  try {
    const response = await makeAdminRequest<ApiResponse<any[]>>('/api/staff?active=true');
    return response.data || [];
  } catch (error: any) {
    console.error('Error fetching staff list:', error);
    return [];
  }
}

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    case 'closed': return 'bg-gray-100 text-gray-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'low': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'urgent': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}