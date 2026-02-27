// lib/leaveRequestApi.ts - Updated with correct endpoints
export interface LeaveRequest {
  id: number;
  tenant_id: number;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  property_id: number;
  property_name: string;
  room_number: number;
  bed_number: number;
  request_type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  admin_notes: string | null;
  assigned_to: number | null;
  assigned_to_name: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  leave_data?: {
    leave_type: string;
    leave_start_date: string;
    leave_end_date: string;
    total_days: number;
    contact_address_during_leave: string | null;
    emergency_contact_number: string | null;
    room_locked: boolean;
    keys_submitted: boolean;
    created_at: string;
  };
}

export interface LeaveStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  in_progress: number;
  cancelled: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface GetLeaveRequestsParams {
  status?: string;
  priority?: string;
  property_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UpdateLeaveRequestStatusData {
  status: string;
  admin_notes?: string;
  assigned_to?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Fetch leave requests with filters
export async function getLeaveRequests(params: GetLeaveRequestsParams = {}): Promise<PaginatedResponse<LeaveRequest>> {
  try {
    const token = localStorage.getItem('adminToken');
    
    // ✅ Check if token exists
    if (!token) {
      console.error('No admin token found');
      // You might want to redirect to login or show an error
      throw new Error('Authentication required. Please log in.');
    }
    
    const queryParams = new URLSearchParams();
    
    // Always filter by leave request type
    queryParams.append('request_type', 'leave');
    
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.priority && params.priority !== 'all') queryParams.append('priority', params.priority);
    if (params.property_id) queryParams.append('property_id', params.property_id.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    // ✅ CORRECTED ENDPOINT
    const url = `${API_BASE_URL}/api/admin/leave-requests?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Add this if using cookies/sessions
    });

    // Handle response errors
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      window.location.href = '/login'; // Redirect to login
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch leave requests:', errorText);
      throw new Error(`Failed to fetch leave requests: ${response.statusText}`);
    }

    const data = await response.json();
    return formatLeaveRequestsResponse(data);

  } catch (error) {
    console.error('API Error in getLeaveRequests:', error);
    throw error;
  }
}

// Add this function for bulk delete
export async function bulkDeleteLeaveRequests(ids: number[]): Promise<{ success: boolean; message: string }> {
  try {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }
    
    console.log(`🗑️ Bulk deleting leave requests:`, ids);
    
    const response = await fetch(`${API_BASE_URL}/api/admin/leave-requests/bulk-delete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete leave requests' }));
      throw new Error(errorData.message || `Failed to delete: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message || `Successfully deleted ${ids.length} leave requests`
    };

  } catch (error) {
    console.error('API Error in bulkDeleteLeaveRequests:', error);
    throw error;
  }
}

// Format response from backend
function formatLeaveRequestsResponse(data: any): PaginatedResponse<LeaveRequest> {
  // Handle different response formats
  if (data.success && Array.isArray(data.data)) {
    return {
      success: true,
      data: data.data.map(formatLeaveRequest),
      pagination: data.pagination || {
        total: data.data.length,
        page: 1,
        limit: data.data.length,
        pages: 1
      }
    };
  } else if (Array.isArray(data)) {
    return {
      success: true,
      data: data.map(formatLeaveRequest),
      pagination: {
        total: data.length,
        page: 1,
        limit: data.length,
        pages: 1
      }
    };
  } else {
    // If data is directly the array
    if (Array.isArray(data)) {
      return {
        success: true,
        data: data.map(formatLeaveRequest),
        pagination: {
          total: data.length,
          page: 1,
          limit: data.length,
          pages: 1
        }
      };
    }
    throw new Error('Invalid response format from server');
  }
}

// Format individual leave request
function formatLeaveRequest(item: any): LeaveRequest {
  return {
    id: item.id || 0,
    tenant_id: item.tenant_id || 0,
    tenant_name: item.tenant_name || item.tenant?.full_name || item.tenant_name || 'Unknown Tenant',
    tenant_email: item.tenant_email || item.tenant?.email || '',
    tenant_phone: item.tenant_phone || item.tenant?.phone || '',
    property_id: item.property_id || 0,
    property_name: item.property_name || item.property?.name || 'Unknown Property',
    room_number: item.room_number || item.room_id || 0,
    bed_number: item.bed_number || item.bed_id || 0,
    request_type: item.request_type || 'leave',
    title: item.title || 'Leave Request',
    description: item.description || '',
    priority: item.priority || 'medium',
    status: item.status || 'pending',
    admin_notes: item.admin_notes || null,
    assigned_to: item.assigned_to || null,
    assigned_to_name: item.assigned_to_name || item.assigned_staff?.name || null,
    resolved_at: item.resolved_at || null,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    leave_data: item.leave_data || item.leave_request_details ? {
      leave_type: item.leave_data?.leave_type || item.leave_request_details?.leave_type || 'Personal',
      leave_start_date: item.leave_data?.leave_start_date || item.leave_request_details?.leave_start_date || new Date().toISOString(),
      leave_end_date: item.leave_data?.leave_end_date || item.leave_request_details?.leave_end_date || new Date().toISOString(),
      total_days: item.leave_data?.total_days || item.leave_request_details?.total_days || 1,
      contact_address_during_leave: item.leave_data?.contact_address_during_leave || item.leave_request_details?.contact_address_during_leave || null,
      emergency_contact_number: item.leave_data?.emergency_contact_number || item.leave_request_details?.emergency_contact_number || null,
      room_locked: item.leave_data?.room_locked || item.leave_request_details?.room_locked || false,
      keys_submitted: item.leave_data?.keys_submitted || item.leave_request_details?.keys_submitted || false,
      created_at: item.leave_data?.created_at || item.leave_request_details?.created_at || new Date().toISOString()
    } : undefined
  };
}

// Get single leave request
export async function getLeaveRequestById(id: number): Promise<{ success: boolean; data: LeaveRequest }> {
  try {
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_BASE_URL}/api/admin/tenant-requests/${id}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Try alternative endpoint
      const altResponse = await fetch(`${API_BASE_URL}/api/tenant-requests/${id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!altResponse.ok) {
        throw new Error(`Failed to fetch leave request: ${altResponse.statusText}`);
      }

      const altData = await altResponse.json();
      return {
        success: true,
        data: formatLeaveRequest(altData.data || altData)
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: formatLeaveRequest(data.data || data)
    };

  } catch (error) {
    console.error('API Error in getLeaveRequestById:', error);
    throw error;
  }
}

// Update leave request status
export async function updateLeaveRequestStatus(id: number, data: UpdateLeaveRequestStatusData): Promise<{ success: boolean; message: string }> {
  try {
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_BASE_URL}/api/admin/tenant-requests/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Try alternative endpoint
      const altResponse = await fetch(`${API_BASE_URL}/api/tenant-requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!altResponse.ok) {
        const errorData = await altResponse.json().catch(() => ({ message: 'Failed to update status' }));
        throw new Error(errorData.message || `Failed to update status: ${altResponse.statusText}`);
      }

      const altResult = await altResponse.json();
      return {
        success: true,
        message: altResult.message || 'Status updated successfully'
      };
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message || 'Status updated successfully'
    };

  } catch (error) {
    console.error('API Error in updateLeaveRequestStatus:', error);
    throw error;
  }
}

// Get leave statistics - CORRECTED ENDPOINT
export async function getLeaveStatistics(): Promise<any> {
  try {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // ✅ CORRECTED ENDPOINT
    const response = await fetch(`${API_BASE_URL}/api/admin/leave-requests/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch statistics: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data || data
    };

  } catch (error) {
    console.error('API Error in getLeaveStatistics:', error);
    
    // Return default statistics on error
    const defaultStats: LeaveStatistics  = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      in_progress: 0,
      cancelled: 0,
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    return {
      success: true,
      message : error instanceof Error ? error.message : 'Failed to load statistics',
      data: defaultStats
    };
  }
}