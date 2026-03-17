import { request } from "./api";

/* ================= TYPES ================= */

export type ReceiptRequest = {
  id: number;
  tenant_id: number;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  property_name: string | null;
  room_number: string | null;
  
  // Receipt specific fields
  receipt_request_id: number;
  receipt_type: 'rent' | 'security_deposit';
  receipt_month: string | null;
  receipt_year: number | null;
  month_key: string | null;
  receipt_amount: number | null;
  receipt_status: 'pending' | 'approved' | 'rejected';
  
  // Request fields
  request_type: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "approved" | "rejected" | "resolved" | "closed";
  admin_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

// Helper function to get admin token
function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token") || localStorage.getItem("token");
}

/* ================= API CALLS ================= */

export async function getAdminReceiptRequests(): Promise<ReceiptRequest[]> {
  try {
    const token = getAdminToken();
    if (!token) {
      console.error('No admin token found');
      return [];
    }

    console.log('📡 Fetching receipt requests...');
    
    const response = await request<{ success: boolean; data: ReceiptRequest[] }>(
      "/api/admin/receipts",
      {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('✅ Receipt API response:', response);
    
    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }
    
    console.error('API returned error or invalid format:', response);
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching receipt requests:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return [];
  }
}

export async function updateReceiptStatus(
  id: number,
  status: string,
  admin_notes?: string
): Promise<any> {
  const token = getAdminToken();
  if (!token) throw new Error("No admin token found");

  const body: any = { status };
  if (admin_notes) body.admin_notes = admin_notes;
  
  console.log(`📝 Updating receipt request ${id} status to ${status}`);
  
  try {
    const response = await request(`/api/admin/receipts/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    return response;
  } catch (error: any) {
    console.error('Error updating receipt status:', error);
    throw error;
  }
}

export async function bulkDeleteReceiptRequests(ids: number[]): Promise<any> {
  try {
    const token = getAdminToken();
    if (!token) throw new Error("No admin token found");
    
    console.log(`🗑️ Bulk deleting receipt requests:`, ids);
    
    const response = await request(`/api/admin/receipts/bulk-delete`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    
    return response;
  } catch (error: any) {
    console.error('❌ Error bulk deleting receipt requests:', error.message);
    throw error;
  }
}