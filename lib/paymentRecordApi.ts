



// lib/paymentRecordApi.ts
import { request } from "@/lib/api";

export type Payment = {
  id: number;
  tenant_id: number;
  booking_id: number | null;
  amount: number;
  payment_date: string;
  payment_mode: 'cash' | 'cheque' | 'online' | 'bank_transfer' | 'card';
  bank_name?: string;
  transaction_id?: string;
  payment_proof?: string;
  proof_uploaded_at?: string;
  month: string;
  year: number;
  remark?: string;
  payment_type: 'rent' | 'security_deposit' | 'maintenance' | 'electricity' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  // Joined fields
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
  room_number?: string;
  property_name?: string;
  monthly_rent?: number;
  bed_number?: number;
  bed_type?: string;
};

export type Receipt = {
  id: number;
  amount: number;
  payment_date: string;
  payment_mode: string;
  bank_name?: string;
  transaction_id?: string;
  remark?: string;
  payment_proof?: string;
  month: string;
  year: number;
  created_at: string;
  tenant_name: string;
  tenant_phone?: string;
  tenant_email?: string;
  room_number?: string;
  property_name?: string;
  monthly_rent?: number;
  bed_number?: number;
  bed_type?: string;
};

export type PaymentStats = {
  total_collected: number;
  total_transactions: number;
  average_payment: number;
  online_payments: number;
  cash_payments: number;
  card_payments: number;
  bank_transfers: number;
  cheque_payments: number;
  current_month_collected: number;
  rent_collected: number;
  deposit_collected: number;
  maintenance_collected: number;
};

export type MonthRent = {
  month: string;
  month_key: string;
  year: number;
  month_num: number;
  base_rent: number;
  carried_forward: number;
  effective_rent: number;
  paid_amount: number;
  pending_amount: number;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  isCurrentMonth: boolean;
  isPastMonth: boolean;
  isFirstMonth?: boolean;
  payments: {
    id: number;
    amount: number;
    date: string;
    mode: string;
    bank_name?: string;
    transaction_id?: string;
    remark?: string;
  }[];
};

export interface SecurityDepositInfo {
  property_name: string;
  security_deposit: number;
  paid_amount: number;
  pending_amount: number;
  is_fully_paid: boolean;
  last_payment_date: string | null;
  payments: Array<{
    id: number;
    amount: number;
    payment_date: string;
    status: string;
  }>;
}

export type TenantRentSummary = {
  tenant: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  bed_assignment: {
    id: number;
    bed_number: number;
    bed_type: string;
    monthly_rent: number;
    is_couple: boolean;
    assignment_date: string;
    room: {
      id: number;
      room_number: string;
      floor: string;
      sharing_type: string;
      has_ac: boolean;
      has_attached_bathroom: boolean;
      has_balcony: boolean;
    };
    property: {
      id: number;
      name: string;
      address: string;
    };
  } | null;
  monthly_rent: number;
  current_month: {
    paid: number;
    pending: number;
    is_paid: boolean;
    is_partial: boolean;
  };
  overall: {
    total_paid: number;
    expected_total: number;
    total_pending: number;
  };
  payments: Payment[];
};

// In lib/paymentRecordApi.ts - Update the PaymentFormData type

export type PaymentFormData = {
  tenant: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  room_info: {
    room_id: number;
    room_number: string;
    bed_number: number;
    bed_type: string;
    property_id: number;
    property_name: string;
  };
  monthly_rent: number;
  check_in_date?: string;
  joining_date: string;
  joining_month: number;
  joining_year: number;
  total_months_since_joining: number;
  
  previous_month: {
    month: string;
    year: number;
    paid: number;
    pending: number;
    status?: string;
  };
  
  current_month: {
    month: string;
    year: number;
    paid: number;
    pending: number;
    status?: string;
  };
  
  month_wise_history: Array<{
    month: string;
    month_num: number;
    year: number;
    month_key: string;
    rent: number;
    paid: number;
    pending: number;
    isCurrentMonth: boolean;
    isPastMonth: boolean;
    status: string;
    payments?: Array<any>;
  }>;
  
    // Add this field - list of months with pending amounts
  unpaid_months: Array<{
    month: string;
    month_num: number;
    year: number;
    month_key: string;
    pending: number;
    display: string; // e.g., "January 2026 (₹2,000 pending)"
  }>;

  recent_months: Array<any>;
  total_paid: number;
  total_expected: number;
  total_pending: number;
  suggested_amount: number;
  payment_count: number;
  last_payment_date?: string;
  note?: string;
};

// Create a new payment
export async function createPayment(data: any): Promise<any> {
  try {
    const response = await request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

// Get all payments with filters
export async function getPayments(filters?: any): Promise<any> {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await request(`/api/payments${params ? `?${params}` : ''}`);
    return response;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
}

// Get payment by ID
export async function getPaymentById(id: number): Promise<any> {
  try {
    const response = await request(`/api/payments/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
}

// Get payments by tenant ID
export async function getPaymentsByTenant(tenantId: number): Promise<any> {
  try {
    const response = await request(`/api/payments/tenant/${tenantId}`);
    return response;
  } catch (error) {
    console.error('Error fetching tenant payments:', error);
    throw error;
  }
}

// Get tenant rent summary
export async function getTenantRentSummary(tenantId: number): Promise<any> {
  try {
    const response = await request(`/api/payments/tenant/${tenantId}/summary`);
    return response;
  } catch (error) {
    console.error('Error fetching tenant rent summary:', error);
    throw error;
  }
}

// Get month-wise rent history
export async function getMonthWiseRentHistory(tenantId: number): Promise<any> {
  try {
    const response = await request(`/api/payments/tenant/${tenantId}/history`);
    return response;
  } catch (error) {
    console.error('Error fetching rent history:', error);
    throw error;
  }
}

// Get payment form data
export async function getTenantPaymentFormData(tenantId: number): Promise<any> {
  try {
    const response = await request(`/api/payments/tenant/${tenantId}/payment-form`);
    return response;
  } catch (error) {
    console.error('Error fetching payment form data:', error);
    throw error;
  }
}

// Get payment stats
export async function getPaymentStats(propertyId?: number, tenantId?: number): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (tenantId) params.append('tenantId', tenantId.toString());
    
    const url = `/api/payments/stats${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await request(url);
    return response;
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    throw error;
  }
}

// Get all receipts
export async function getReceipts(filters?: { tenant_id?: number; start_date?: string; end_date?: string }): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const url = `/api/payments/receipts${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await request(url);
    return response;
  } catch (error) {
    console.error('Error fetching receipts:', error);
    throw error;
  }
}

// Get receipt by ID
export async function getReceiptById(id: number): Promise<any> {
  try {
    const response = await request(`/api/payments/receipts/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching receipt:', error);
    throw error;
  }
}

// Preview receipt (opens in new tab)
export function previewReceipt(id: number): void {
  window.open(`/api/payments/receipts/${id}/preview`, '_blank');
}

// Download receipt PDF
export function downloadReceipt(id: number): void {
  window.open(`/api/payments/receipts/${id}/download`, '_blank');
}

// Upload payment proof
export async function uploadPaymentProof(paymentId: number, file: File): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('proof', file);
    
    const response = await fetch(`/api/payments/${paymentId}/proof`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload proof');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    throw error;
  }
}

// Get payment proof
export async function getPaymentProof(paymentId: number): Promise<string | null> {
  try {
    const response = await fetch(`/api/payments/${paymentId}/proof`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.data?.proof_url || null;
  } catch (error) {
    console.error('Error fetching payment proof:', error);
    return null;
  }
}

// Get tenant's bed assignment
export async function getTenantBedAssignment(tenantId: number): Promise<any> {
  try {
    const response = await fetch(`/api/rooms/tenant-bed/${tenantId}`);
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching tenant bed assignment:', error);
    return null;
  }
}

// Add to paymentRecordApi.ts

export async function createDemandPayment(data: any): Promise<any> {
  try {
    const response = await request('/api/payments/demands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating demand payment:', error);
    throw error;
  }
}

export async function getDemands(filters?: any): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id.toString());
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    
    const queryString = params.toString();
    const url = `/api/payments/demands${queryString ? `?${queryString}` : ''}`;
    
    const response = await request(url);
    
    
    // Check if response exists and has data
    if (response && response.success) {
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0
      };
    } else {
      // If API returns success false but might have data
      return {
        success: false,
        data: response?.data || [],
        count: response?.count || 0,
        message: response?.message || 'Unknown error'
      };
    }
  } catch (error: any) {
    console.error('Error fetching demands:', error);
    // Return empty array on error
    return {
      success: false,
      data: [],
      count: 0,
      message: error.message || 'Failed to fetch demands'
    };
  }
}

export async function updateDemandStatus(id: number, status: string): Promise<any> {
  try {
    const response = await request(`/api/payments/demands/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response;
  } catch (error) {
    console.error('Error updating demand status:', error);
    throw error;
  }
}

// Add API functions for payment actions
export async function approvePayment(id: number, approvedBy?: number): Promise<any> {
  try {
    const response = await request(`/api/payments/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approved_by: approvedBy }),
    });
    return response;
  } catch (error) {
    console.error('Error approving payment:', error);
    throw error;
  }
}

export async function rejectPayment(id: number, reason: string, rejectedBy?: number): Promise<any> {
  try {
    const response = await request(`/api/payments/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ 
        rejection_reason: reason,
        rejected_by: rejectedBy 
      }),
    });
    return response;
  } catch (error) {
    console.error('Error rejecting payment:', error);
    throw error;
  }
}

export async function updatePayment(id: number, data: any): Promise<any> {
  try {
    const response = await request(`/api/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
}

export async function deletePayment(id: number): Promise<any> {
  try {
    const response = await request(`/api/payments/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
}

export async function getSecurityDepositInfo(tenantId: number): Promise<{ success: boolean; data: SecurityDepositInfo }> {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/api/payments/tenant/${tenantId}/security-deposit`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch security deposit info');
  }
  
  return response.json();
}