// // lib/paymentRecordApi.ts
// import { request } from "@/lib/api";

// // Use the existing env variable
// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// export type PaymentRecord = {
//   id: string | number;
//   tenant_id: string | number;
//   booking_id?: string | number | null;
//   amount: number;
//   payment_date: string;
//   payment_mode: 'cash' | 'cheque' | 'online' | 'bank_transfer' | 'card';
//   transaction_id?: string | null;
//   status: 'pending' | 'completed' | 'failed' | 'refunded';
//   month?: string | null;
//   year?: number | null;
//   notes?: string | null;
//   created_at?: string;
//   updated_at?: string;
//   // Joined fields from your backend
//   tenant_name?: string;
//   tenant_email?: string;
//   tenant_phone?: string;
//   property_id?: number;
//   booking_type?: string;
// };

// export type Receipt = {
//   id: string | number;
//   receipt_number: string;
//   payment_id: string | number;
//   tenant_id: string | number;
//   amount: number;
//   payment_method?: string;
//   payment_date: string;
//   description?: string;
//   is_cancelled?: boolean;
//   created_at?: string;
//   tenants?: {
//     full_name: string;
//     email?: string;
//     phone?: string;
//   };
// };

// export type PaymentStats = {
//   total_transactions: number;
//   total_collected: number;
//   pending_amount: number;
//   online_payments: number;
//   cash_payments: number;
//   card_payments: number;
//   bank_transfers: number;
//   cheque_payments: number;
// };

// export type PaymentRecordFilters = {
//   status?: string;
//   payment_mode?: string;
//   booking_id?: string | number;
//   tenant_id?: string | number;
//   start_date?: string;
//   end_date?: string;
//   page?: number;
//   limit?: number;
// };

// export type DemandPaymentData = {
//   tenant_id: string | number;
//   payment_type: string;
//   amount: number;
//   due_date: string;
//   description?: string;
//   include_late_fee?: boolean;
//   late_fee_amount?: number;
//   send_email?: boolean;
//   send_sms?: boolean;
// };

// export type ApiResult<T = any> = {
//   success: boolean;
//   data?: T;
//   message?: string;
//   count?: number;
//   meta?: any;
// };

// // Helper function to handle fetch with token using the env variable
// async function fetchWithToken<T>(url: string, options: RequestInit = {}): Promise<T> {
//   const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  
//   const fullUrl = `${API_BASE}${url}`;
  
//   const response = await fetch(fullUrl, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
//       ...options.headers,
//     },
//   });

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}));
//     throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//   }

//   return response.json();
// }

// // Create a new payment record - MATCHING BACKEND: /api/payments
// export async function createPaymentRecord(paymentData: Partial<PaymentRecord>): Promise<ApiResult<PaymentRecord>> {
//   try {
//     console.log('Creating payment record:', paymentData);
    
//     // Your backend requires booking_id
//     if (!paymentData.booking_id) {
//       return {
//         success: false,
//         message: 'Booking ID is required',
//       };
//     }

//     const result = await fetchWithToken<ApiResult<PaymentRecord>>('/api/payments', {
//       method: 'POST',
//       body: JSON.stringify(paymentData),
//     });
//     return result;
//   } catch (error: any) {
//     console.error('Error creating payment record:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to create payment record',
//     };
//   }
// }

// // Get payment record by ID - MATCHING BACKEND: /api/payments/:id
// export async function getPaymentRecord(id: string | number): Promise<ApiResult<PaymentRecord>> {
//   try {
//     const result = await fetchWithToken<ApiResult<PaymentRecord>>(`/api/payments/${id}`, {
//       method: 'GET',
//     });
//     return result;
//   } catch (error: any) {
//     console.error('Error fetching payment record:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to fetch payment record',
//     };
//   }
// }

// // List all payment records with filters - MATCHING BACKEND: /api/payments
// export async function listPaymentRecords(filters: PaymentRecordFilters = {}): Promise<ApiResult<PaymentRecord[]>> {
//   const params = new URLSearchParams();
  
//   Object.entries(filters).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== '') {
//       params.append(key, value.toString());
//     }
//   });
  
//   const queryString = params.toString();
//   const path = `/api/payments${queryString ? `?${queryString}` : ''}`;
  
//   try {
//     console.log('Fetching payment records from:', path);
//     const result = await fetchWithToken<ApiResult<PaymentRecord[]>>(path, {
//       method: 'GET',
//     });
//     return result;
//   } catch (error: any) {
//     console.error('Error fetching payment records:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to fetch payment records',
//       data: [],
//     };
//   }
// }

// // Get payments by booking ID - MATCHING BACKEND: /api/payments/booking/:bookingId
// export async function getPaymentRecordsByBooking(bookingId: string | number): Promise<ApiResult<PaymentRecord[]>> {
//   try {
//     const result = await fetchWithToken<ApiResult<PaymentRecord[]>>(`/api/payments/booking/${bookingId}`, {
//       method: 'GET',
//     });
//     return result;
//   } catch (error: any) {
//     console.error('Error fetching booking payment records:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to fetch booking payment records',
//       data: [],
//     };
//   }
// }

// // Update payment record status - MATCHING BACKEND: /api/payments/:id/status
// export async function updatePaymentRecordStatus(
//   id: string | number, 
//   status: string, 
//   transaction_id?: string
// ): Promise<ApiResult> {
//   try {
//     const result = await fetchWithToken<ApiResult>(`/api/payments/${id}/status`, {
//       method: 'PATCH',
//       body: JSON.stringify({ status, transaction_id }),
//     });
//     return result;
//   } catch (error: any) {
//     console.error('Error updating payment record status:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to update payment record status',
//     };
//   }
// }

// // Get payment statistics - MATCHING BACKEND: /api/payments/stats
// export async function getPaymentStats(propertyId?: string | number): Promise<ApiResult<PaymentStats>> {
//   const path = propertyId 
//     ? `/api/payments/stats?propertyId=${propertyId}` 
//     : '/api/payments/stats';
  
//   try {
//     const result = await fetchWithToken<ApiResult<PaymentStats>>(path, {
//       method: 'GET',
//     });
//     return result;
//   } catch (error: any) {
//     console.error('Error fetching payment stats:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to fetch payment statistics',
//     };
//   }
// }

// // Get payments by tenant - Using findByTenant from your backend
// export async function getPaymentsByTenant(tenantId: string | number): Promise<ApiResult<PaymentRecord[]>> {
//   try {
//     // Your backend has findByTenant method but no direct endpoint
//     // Using getAll with tenant_id filter
//     const result = await listPaymentRecords({ tenant_id: tenantId });
//     return result;
//   } catch (error: any) {
//     console.error('Error fetching tenant payments:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to fetch tenant payments',
//       data: [],
//     };
//   }
// }

// // ============= RECEIPTS API =============
// // Note: You'll need to create these endpoints in your backend if they don't exist

// // Create a receipt
// export async function createReceipt(receiptData: Partial<Receipt>): Promise<ApiResult<Receipt>> {
//   try {
//     const result = await fetchWithToken<ApiResult<Receipt>>('/api/receipts', {
//       method: 'POST',
//       body: JSON.stringify(receiptData),
//     });
//     return result;
//   } catch (error: any) {
//     console.error('Error creating receipt:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to create receipt',
//     };
//   }
// }

// // List all receipts
// export async function listReceipts(filters: {
//   is_cancelled?: boolean;
//   tenant_id?: string | number;
//   payment_id?: string | number;
// } = {}): Promise<ApiResult<Receipt[]>> {
//   const params = new URLSearchParams();
  
//   Object.entries(filters).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== '') {
//       params.append(key, value.toString());
//     }
//   });
  
//   const queryString = params.toString();
//   const path = `/api/receipts${queryString ? `?${queryString}` : ''}`;
  
//   try {
//     const result = await fetchWithToken<ApiResult<Receipt[]>>(path, {
//       method: 'GET',
//     });
//     return result;
//   } catch (error: any) {
//     console.error('Error fetching receipts:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to fetch receipts',
//       data: [],
//     };
//   }
// }

// // Create a demand payment (custom endpoint - you'll need to add this to your backend)
// export async function createDemandPayment(data: DemandPaymentData): Promise<ApiResult> {
//   try {
//     // First create a pending payment
//     const paymentData = {
//       tenant_id: data.tenant_id,
//       booking_id: data.booking_id || null,
//       amount: data.amount,
//       payment_date: new Date().toISOString().split('T')[0],
//       payment_mode: 'pending',
//       status: 'pending',
//       notes: data.description,
//     };

//     const result = await createPaymentRecord(paymentData);
//     return result;
//   } catch (error: any) {
//     console.error('Error creating demand payment:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to create payment demand',
//     };
//   }
// }




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
    
    console.log('Fetching demands from:', url);
    const response = await request(url);
    
    console.log('Demands API response:', response);
    
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