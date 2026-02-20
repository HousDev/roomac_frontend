// lib/complaintsApi.ts
import { request } from "./api";

/* ================= TYPES ================= */

export type Complaint = {
  id: number;
  tenant_id: number;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  property_id: number | null;
  property_name: string | null;
  request_type: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "resolved" | "closed";
  admin_notes: string | null;
  assigned_to: number | null;
  staff_name: string | null;
  staff_role: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Complaint specific fields
  complaint_detail_id?: number;
  category_master_type_id?: number;
  reason_master_value_id?: number;
  custom_reason?: string;
  category_id?: number;
  category_code?: string;
  category_name?: string;
  reason_id?: number;
  reason_value?: string;
  complaint_reason?: string;
  complaint_category?: string;
  room_id?: number;
  room_number?: number;
  bed_number?: number;
  room_info?: string;
  
  // Additional fields for view
  complaint_details?: {
    category_master_type_id?: number;
    category_name?: string;
    reason_master_value_id?: number;
    reason_value?: string;
    custom_reason?: string;
    complaint_reason: string;
  };
  tenant_room_info?: {
    room_id?: number;
    room_number?: number;
    bed_number?: number;
    sharing_type?: string;
    rent_per_bed?: number;
  } | null;
};

export type StaffMember = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  is_active: boolean;
  created_at: string;
};

export type ComplaintCategory = {
  id: number;
  code: string;
  name: string;
  tab: string;
  is_active: number;
};

// Helper function to get admin token
function getAdminToken(): string {
  if (typeof window === "undefined") {
    console.error('Cannot access localStorage on server');
    return '';
  }
  
  const adminToken = localStorage.getItem("admin_token") || localStorage.getItem("token");
  
  if (!adminToken) {
    console.error('No admin token found');
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
    throw new Error('Admin authentication required. Please login.');
  }
  
  return adminToken;
}

/* ================= API CALLS ================= */

export async function getAdminComplaints(): Promise<Complaint[]> {
  try {
    const token = getAdminToken();

    console.log('📡 Fetching complaints from API...');
    
    const response = await request<{
      message(arg0: string, message: any): unknown; success: boolean; data: Complaint[] 
}>(
      "/api/admin/complaints",
      {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log(`✅ Complaints API response: ${response.data?.length || 0} complaints`);
    
    if (response.success && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('❌ API returned error:', response.message);
      return [];
    }
  } catch (error: any) {
    console.error('❌ Error fetching complaints:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return [];
  }
}

export async function getComplaintById(id: number): Promise<Complaint | null> {
  try {
    const token = getAdminToken();
    
    const response = await request<{
      message(arg0: string, message: any): unknown; success: boolean; data: Complaint 
}>(
      `/api/admin/complaints/${id}`,
      {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (response.success && response.data) {
      return response.data;
    } else {
      console.error('❌ Failed to get complaint details:', response.message);
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error fetching complaint details:', error.message);
    return null;
  }
}

export async function getActiveStaff(): Promise<StaffMember[]> {
  try {
    const token = getAdminToken();
    
    const response = await request<{
      message(arg0: string, message: any): unknown; success: boolean; data: StaffMember[] 
}>(
      "/api/admin/complaints/staff/active",
      {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (response.success && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('❌ Failed to get staff:', response.message);
      return [];
    }
  } catch (error: any) {
    console.error('❌ Error fetching staff:', error.message);
    return [];
  }
}

export async function getComplaintCategories(): Promise<ComplaintCategory[]> {
  try {
    const token = getAdminToken();
    
    const response = await request<{
      message(arg0: string, message: any): unknown; success: boolean; data: ComplaintCategory[] 
}>(
      "/api/admin/complaints/categories/all",
      {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (response.success && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('❌ Failed to get complaint categories:', response.message);
      return [];
    }
  } catch (error: any) {
    console.error('❌ Error fetching complaint categories:', error.message);
    return [];
  }
}

export async function updateComplaintStatus(
  id: number,
  status: string,
  admin_notes?: string
): Promise<any> {
  try {
    const token = getAdminToken();

    const body: any = { status };
    if (admin_notes) body.admin_notes = admin_notes;
    
    console.log(`📝 Updating complaint ${id} status to ${status}`);
    
    const response = await request(`/api/admin/complaints/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    return response;
  } catch (error: any) {
    console.error('❌ Error updating complaint status:', error.message);
    throw error;
  }
}

export async function assignComplaintStaff(
  id: number,
  staffId: number
): Promise<any> {
  try {
    const token = getAdminToken();

    console.log(`👥 Assigning staff ${staffId} to complaint ${id}`);
    
    const body: any = {
      assigned_to: staffId
    };
    
    const response = await request(`/api/admin/complaints/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    return response;
  } catch (error: any) {
    console.error('❌ Error assigning staff:', error.message);
    throw error;
  }
}

export async function resolveComplaint(
  id: number,
  admin_notes: string
): Promise<any> {
  try {
    const token = getAdminToken();

    console.log(`✅ Resolving complaint ${id}`);
    
    const response = await request(`/api/admin/complaints/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: "resolved",
        admin_notes,
      }),
    });
    
    return response;
  } catch (error: any) {
    console.error('❌ Error resolving complaint:', error.message);
    throw error;
  }
}