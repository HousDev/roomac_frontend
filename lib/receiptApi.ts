// lib/receiptApi.ts
import { request } from "./api";
import { StaffMember, getAllStaff } from "./staffApi";

/* ================= TYPES ================= */

export type ReceiptRequest = {
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
};

export type ReceiptDetails = {
  receipt_number: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  payment_for: string;
  notes?: string;
};

// Helper function to get admin token
function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token") || localStorage.getItem("token");
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

export async function getAccountingStaff(): Promise<StaffMember[]> {
  try {
    const allStaff = await getAllStaff();
    console.log('Total staff fetched:', allStaff.length);
    
    // Filter for accounting/finance staff
    const accountingStaff = allStaff.filter(staff => {
      const role = staff.role?.toLowerCase() || '';
      const department = staff.department?.toLowerCase() || '';
      return staff.is_active && (
        role.includes('accountant') || 
        role.includes('finance') ||
        role.includes('accounts') ||
        department.includes('account') ||
        department.includes('finance') ||
        department.includes('billing')
      );
    });
    
    console.log('Accounting staff filtered:', accountingStaff.length);
    return accountingStaff;
  } catch (error) {
    console.error('Error fetching accounting staff:', error);
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

export async function assignReceiptStaff(
  id: number,
  staffId: number
): Promise<any> {
  const token = getAdminToken();
  if (!token) throw new Error("No admin token found");

  console.log(`👥 Assigning staff ${staffId} to receipt request ${id}`);
  
  const body = {
    assigned_to: staffId === 0 ? null : staffId,
    status: staffId === 0 ? "pending" : "in_progress",
  };
  
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
    console.error('Error assigning staff:', error);
    throw error;
  }
}

export async function generateReceipt(
  id: number,
  receiptDetails: ReceiptDetails
): Promise<any> {
  const token = getAdminToken();
  if (!token) throw new Error("No admin token found");

  console.log(`🧾 Generating receipt for request ${id}`);
  
  try {
    const response = await request(`/api/admin/receipts/${id}/generate`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receipt_details: `Receipt #${receiptDetails.receipt_number} for ${receiptDetails.amount} paid via ${receiptDetails.payment_method} on ${receiptDetails.payment_date} for ${receiptDetails.payment_for}. ${receiptDetails.notes || ''}`
      }),
    });
    
    return response;
  } catch (error: any) {
    console.error('Error generating receipt:', error);
    throw error;
  }
}