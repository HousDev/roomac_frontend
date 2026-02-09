import { request } from "@/lib/api";

export interface Enquiry {
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
