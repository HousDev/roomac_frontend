// lib/maintenanceApi.ts - Updated version
import { request } from "./api";
import { getAllStaff, type StaffMember } from "./staffApi";

/* ================= TYPES ================= */

export type MaintenanceRequest = {
  id: number;
  tenant_id: number;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  property_name: string | null;
  room_number: string | null;
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
  // Add maintenance_data
  maintenance_data?: {
    issue_category: string;
    location: string;
    preferred_visit_time: string;
    access_permission: boolean;
    resolved_at?: string;
  };
};

// Helper function to get admin token
function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token") || localStorage.getItem("token");
}

/* ================= API CALLS ================= */

export async function getAdminMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  try {
    const token = getAdminToken();
    if (!token) {
      console.error('No admin token found');
      return [];
    }

    console.log('📡 Fetching maintenance requests...');
    
    const response = await request<{ success: boolean; data: MaintenanceRequest[] }>(
      "/api/admin/maintenance",
      {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('✅ Maintenance API response:', response);
    
    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }
    
    console.error('API returned error or invalid format:', response);
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching maintenance requests:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
    
    return [];
  }
}

export async function getActiveStaff(): Promise<StaffMember[]> {
  try {
    const staff = await getAllStaff();
    return staff.filter(staff => staff.is_active);
  } catch (error) {
    console.error('Error fetching active staff:', error);
    return [];
  }
}

export async function updateMaintenanceStatus(
  id: number,
  status: string,
  admin_notes?: string
): Promise<any> {
  const token = getAdminToken();
  if (!token) throw new Error("No admin token found");

  const body: any = { status };
  if (admin_notes) body.admin_notes = admin_notes;
  
  console.log(`📝 Updating maintenance ${id} status to ${status}`);
  
  try {
    const response = await request(`/api/admin/maintenance/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    return response;
  } catch (error: any) {
    console.error('Error updating maintenance status:', error);
    throw error;
  }
}

export async function assignMaintenanceStaff(
  id: number,
  staffId: number
): Promise<any> {
  const token = getAdminToken();
  if (!token) throw new Error("No admin token found");

  console.log(`👥 Assigning staff ${staffId} to maintenance ${id}`);
  
  const body = {
    assigned_to: staffId === 0 ? null : staffId,
    status: staffId === 0 ? "pending" : "in_progress",
  };
  
  try {
    const response = await request(`/api/admin/maintenance/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    return response;
  } catch (error: any) {
    console.error('Error assigning staff:', error);
    throw error;
  }
}

export async function resolveMaintenance(
  id: number,
  admin_notes: string
): Promise<any> {
  const token = getAdminToken();
  if (!token) throw new Error("No admin token found");

  console.log(`✅ Resolving maintenance ${id}`);
  
  try {
    const response = await request(`/api/admin/maintenance/${id}`, {
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
    console.error('Error resolving maintenance:', error);
    throw error;
  }
}