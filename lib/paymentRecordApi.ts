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
  booking_id: number;
  amount: number;
  payment_date: string;
  payment_mode: 'cash' | 'online' | 'bank_transfer' | 'cheque' | 'card';
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  month: string;
  year: number;
  due_date?: string;
  notes?: string;
  payment_type: 'rent' | 'security_deposit' | 'maintenance' | 'electricity' | 'other';
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
  receipt_number: string;
  payment_id: number;
  tenant_id: number;
  amount: number;
  payment_method?: string;
  payment_date: string;
  description?: string;
  is_cancelled: boolean;
  created_at: string;
  tenant?: {
    full_name: string;
    email: string;
    phone: string;
  };
};

export type PaymentStats = {
  total_collected: number;
  pending_amount: number;
  total_transactions: number;
  online_payments: number;
  cash_payments: number;
  card_payments: number;
  bank_transfers: number;
  cheque_payments: number;
  overdue_amount: number;
  overdue_count: number;
};

export type RentHistory = {
  month: string;
  month_key: string;
  year: number;
  month_num: number;
  rentAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  isCurrentMonth: boolean;
  isPastMonth: boolean;
  payments: {
    id: number;
    amount: number;
    status: string;
    date: string;
    mode: string;
  }[];
  lastPaymentDate: string | null;
};

export type TenantRentSummary = {
  tenant_id: number;
  tenant_name: string;
  room_id: number;
  room_number: string;
  bed_number: number;
  bed_type: string;
  monthly_rent: number;
  current_month_rent: number;
  paid_this_month: number;
  pending_this_month: number;
  previous_pending: number;
  total_paid: number;
  total_pending: number;
  last_payment_date: string | null;
  next_due_date: string | null;
  months: RentHistory[];
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

// Get tenant rent summary with month-wise history
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
export async function getMonthWiseRentHistory(tenantId: number, months: number = 6): Promise<any> {
  try {
    const response = await request(`/api/payments/tenant/${tenantId}/history?months=${months}`);
    return response;
  } catch (error) {
    console.error('Error fetching rent history:', error);
    throw error;
  }
}

// Update payment status
export async function updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<any> {
  try {
    const response = await request(`/api/payments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, transaction_id: transactionId }),
    });
    return response;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

// Get payment stats
export async function getPaymentStats(propertyId?: number): Promise<any> {
  try {
    const url = propertyId ? `/api/payments/stats?propertyId=${propertyId}` : '/api/payments/stats';
    const response = await request(url);
    return response;
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    throw error;
  }
}

// Get pending payments
export async function getPendingPayments(tenantId?: number, overdueOnly?: boolean): Promise<any> {
  try {
    let url = '/api/payments/pending';
    const params = new URLSearchParams();
    if (tenantId) params.append('tenant_id', tenantId.toString());
    if (overdueOnly) params.append('overdue_only', 'true');
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await request(url);
    return response;
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    throw error;
  }
}

// Get tenant's active booking with bed details
export async function getTenantActiveBooking(tenantId: number): Promise<any> {
  try {
    const response = await request(`/api/bookings?tenant_id=${tenantId}&status=active`);
    if (response.success && response.data && response.data.length > 0) {
      return response.data[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching tenant booking:', error);
    throw error;
  }
}

// Get tenant's bed assignment details
export async function getTenantBedAssignment(tenantId: number): Promise<any> {
  try {
    const response = await request(`/api/rooms/tenant-assignment/${tenantId}`);
    return response;
  } catch (error) {
    console.error('Error fetching tenant bed assignment:', error);
    throw error;
  }
}

// lib/paymentApi.ts - Add proof upload function

export async function uploadPaymentProof(paymentId: number, file: File): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('proof', file);
    
    const token = localStorage.getItem('admin_token');
    const response = await request(`/api/payments/${paymentId}/proof`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
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

export async function getPaymentProof(paymentId: number): Promise<string | null> {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await request(`/api/payments/${paymentId}/proof`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.proof_url || null;
  } catch (error) {
    console.error('Error fetching payment proof:', error);
    return null;
  }
}