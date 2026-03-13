import { request } from "@/lib/api";

export interface PurchaseItem {
  item_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface MaterialPurchase {
  id: string | number;
  purchase_date: string;
  vendor_name: string;
  vendor_phone?: string;
  invoice_number: string;
  property_id: string | number;
  property_name: string;
  property_full_name?: string;
  notes?: string;
  items: PurchaseItem[];
  purchase_items?: PurchaseItem[];
  items_summary?: string;
  total_amount: number;
  paid_amount?: number;
  balance_amount?: number;
  payment_status: 'Pending' | 'Partial' | 'Paid';
  payment_date?: string;
  payment_method?: string;
  paid_by?: string;
  payment_reference?: string;
  payment_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePurchasePayload {
  purchase_date: string;
  vendor_name: string;
  vendor_phone?: string;
  invoice_number: string;
  property_id: string | number;
  property_name: string;
  notes?: string;
  items: PurchaseItem[];
  items_summary?: string;
  total_amount: number;
  paid_amount?: number;
  payment_date?: string;
  payment_method?: string;
  paid_by?: string;
  payment_reference?: string;
  payment_notes?: string;
}

export interface AddPaymentPayload {
  payment_date: string;
  amount: number;
  payment_method: string;
  paid_by?: string;
  payment_reference?: string;
  payment_notes?: string;
}

export interface PurchasesResponse {
  success: boolean;
  count: number;
  data: MaterialPurchase[];
}

export interface SinglePurchaseResponse {
  success: boolean;
  data: MaterialPurchase;
}

export interface PurchaseStatsResponse {
  success: boolean;
  data: {
    total_purchases: number;
    total_amount: number;
    total_paid: number;
    total_balance: number;
    pending_count: number;
    partial_count: number;
    paid_count: number;
  };
}

export interface BulkDeleteResponse {
  success: boolean;
  message: string;
  affectedRows: number;
}

// Get all purchases with optional filters
export const getPurchases = async (filters?: {
  property_id?: string | number;
  payment_status?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}): Promise<PurchasesResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.property_id) queryParams.append("property_id", String(filters.property_id));
  if (filters?.payment_status) queryParams.append("payment_status", filters.payment_status);
  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.from_date) queryParams.append("from_date", filters.from_date);
  if (filters?.to_date) queryParams.append("to_date", filters.to_date);

  const url = `/api/material-purchases${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  return request<PurchasesResponse>(url, { method: "GET" });
};

// Get purchase by ID
export const getPurchaseById = async (id: string | number): Promise<SinglePurchaseResponse> => {
  return request<SinglePurchaseResponse>(`/api/material-purchases/${id}`, { method: "GET" });
};

// Create a new purchase
export const createPurchase = async (data: CreatePurchasePayload): Promise<SinglePurchaseResponse> => {
  return request<SinglePurchaseResponse>("/api/material-purchases", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Update a purchase
// Update a purchase
export const updatePurchase = async (id: string | number, data: Partial<CreatePurchasePayload>): Promise<any> => {
  return request(`/api/material-purchases/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// Add payment to a purchase
export const addPayment = async (id: string | number, data: AddPaymentPayload): Promise<any> => {
  return request(`/api/material-purchases/${id}/payments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Delete a purchase
export const deletePurchase = async (id: string | number): Promise<any> => {
  return request(`/api/material-purchases/${id}`, { method: "DELETE" });
};

// Bulk delete purchases
export const bulkDeletePurchases = async (ids: (string | number)[]): Promise<BulkDeleteResponse> => {
  return request<BulkDeleteResponse>("/api/material-purchases/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
};

// Get purchase statistics
export const getPurchaseStats = async (): Promise<PurchaseStatsResponse> => {
  return request<PurchaseStatsResponse>("/api/material-purchases/stats", { method: "GET" });
};

