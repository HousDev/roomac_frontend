// lib/enquiryApi.ts
import { request } from "@/lib/api";

export interface Enquiry {
  occupation: string;
  id: string;
  property_id: string;
  property_name: string;
  property_full_name?: string;
  tenant_name: string;
  email: string;
  phone: string;
  preferred_move_in_date: string;
  budget_range: string;
  message: string;
  source: string;
  status: string;
  assigned_to?: string;
  assigned_staff_name?: string;
  assigned_staff_role?: string;
  followups?: Followup[];
  created_at?: string;
  updated_at?: string;
occupation_category?: string;
remark?: string;
}

export interface Followup {
  id: string;
  enquiry_id: string;
  note: string;
  created_by: string;
  timestamp: string;
}

export interface CreateEnquiryPayload {
  property_id: string;
  tenant_name: string;
  phone: string;
  email?: string;
  property_name?: string;
  preferred_move_in_date?: string;
  budget_range?: string;
  message?: string;
  source?: string;
  status?: string;
  occupation?: string;
occupation_category?: string;
remark?: string;
}

export interface UpdateEnquiryPayload {
  property_id?: string;
  tenant_name?: string;
  phone?: string;
  email?: string;
  property_name?: string;
  preferred_move_in_date?: string;
  budget_range?: string;
  message?: string;
  status?: string;
  assigned_to?: string;
  occupation?: string;
occupation_category?: string;
remark?: string;
}

export interface AddFollowupPayload {
  note: string;
  created_by?: string;
  status?: string;
}

export interface EnquiryResponse {
  success: boolean;
  count: number;
  results: Enquiry[];
}

export interface SingleEnquiryResponse {
  success: boolean;
  data: Enquiry;
}

export interface FollowupResponse {
  success: boolean;
  count: number;
  data: Followup[];
}

export interface StatsResponse {
  success: boolean;
  data: {
    total: number;
    new_count: number;
    contacted_count: number;
    interested_count: number;
    converted_count: number;
    closed_count: number;
  };
}

// Types for visits
export interface Visit {
  id: string;
  enquiry_id: string;
  scheduled_date: string;
  scheduled_time: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
  notes: string;
  reminder_sent: boolean;
  reminder_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  tenant_name?: string;
  phone?: string;
  property_name?: string;
}

export interface CreateVisitPayload {
  scheduled_date: string;
  scheduled_time?: string;
  notes?: string;
}

// Get all enquiries with optional filters
export const getEnquiries = async (filters?: {
  status?: string;
  assigned_to?: string;
  property_id?: string;
  search?: string;
}): Promise<EnquiryResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.assigned_to) queryParams.append('assigned_to', filters.assigned_to);
  if (filters?.property_id) queryParams.append('property_id', filters.property_id);
  if (filters?.search) queryParams.append('search', filters.search);

  const url = `/api/enquiries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return request<EnquiryResponse>(url, {
    method: "GET",
  });
};

// Get enquiry by ID
export const getEnquiryById = async (id: string): Promise<SingleEnquiryResponse> => {
  return request<SingleEnquiryResponse>(`/api/enquiries/${id}`, {
    method: "GET",
  });
};

// Create a new enquiry
export const createEnquiry = async (data: CreateEnquiryPayload): Promise<any> => {
  return request("/api/enquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Update an enquiry
export const updateEnquiry = async (id: string, data: UpdateEnquiryPayload): Promise<any> => {
  return request(`/api/enquiries/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// Delete an enquiry
export const deleteEnquiry = async (id: string): Promise<any> => {
  return request(`/api/enquiries/${id}`, {
    method: "DELETE",
  });
};

// Update enquiry status
export const updateEnquiryStatus = async (id: string, status: string): Promise<any> => {
  return updateEnquiry(id, { status });
};

// Assign staff to enquiry
export const assignStaffToEnquiry = async (id: string, staffId: string): Promise<any> => {
  return updateEnquiry(id, { assigned_to: staffId });
};

// Get followups for enquiry
export const getFollowups = async (id: string): Promise<FollowupResponse> => {
  return request<FollowupResponse>(`/api/enquiries/${id}/followups`, {
    method: "GET",
  });
};

// Add followup to enquiry
export const addFollowup = async (id: string, data: AddFollowupPayload): Promise<any> => {
  return request(`/api/enquiries/${id}/followups`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Get enquiry statistics
export const getEnquiryStats = async (): Promise<StatsResponse> => {
  return request<StatsResponse>('/api/enquiries/stats', {
    method: "GET",
  });
};


// lib/enquiryApi.ts - Update the visit API functions with correct paths


export const getUpcomingVisits = async (days: number = 7): Promise<{ success: boolean; data: Visit[] }> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/api/enquiries/visits/upcoming?days=${days}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch upcoming visits');
  }
  
  return response.json();
};

export const getTodayVisits = async (): Promise<{ success: boolean; data: Visit[] }> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/api/enquiries/visits/today`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch today\'s visits');
  }
  
  return response.json();
};


export const convertEnquiryToTenant = async (
  enquiryId: string, 
  options?: { action?: 'create_new' | 'update_existing'; tenantId?: number }
): Promise<{ 
  success: boolean; 
  message: string; 
  tenant_id?: number;
  requiresAction?: boolean;
  existingTenants?: Array<{
    id: number;
    full_name: string;
    email: string;
    phone: string;
    is_deleted: boolean;
  }>;
  enquiry?: any;
}> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  const response = await fetch(`${apiUrl}/api/enquiries/${enquiryId}/convert-to-tenant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options ? JSON.stringify(options) : undefined,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to convert enquiry to tenant');
  }
  
  return response.json();
};

// Make sure your visit API functions have the correct paths:
export const getVisits = async (enquiryId: string): Promise<{ success: boolean; data: Visit[] }> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/api/enquiries/enquiry/${enquiryId}/visits`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch visits');
  }
  
  return response.json();
};

export const scheduleVisit = async (enquiryId: string, visitData: CreateVisitPayload): Promise<{ success: boolean; data: Visit; message: string }> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/api/enquiries/enquiry/${enquiryId}/visits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(visitData),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to schedule visit');
  }
  
  return response.json();
};

export const updateVisitStatus = async (visitId: string, status: Visit['status'], notes?: string): Promise<{ success: boolean; message: string }> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/api/enquiries/visits/${visitId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, notes }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update visit status');
  }
  
  return response.json();
};

// Bulk delete enquiries
export const bulkDeleteEnquiries = async (ids: string[]): Promise<{ success: boolean; message: string; affectedRows: number }> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/api/enquiries/bulk-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete enquiries');
  }
  
  return response.json();
};