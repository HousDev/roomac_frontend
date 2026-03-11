// lib/inventoryApi.ts
import { request } from "@/lib/api";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  item_name: string;
  category_id: string;
  category_name?: string;
  property_id: string;
  property_full_name?: string;
  quantity: number;
  unit_price: number;
  min_stock_level: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateInventoryPayload {
  item_name: string;
  category_id: string;
  property_id: string;
  quantity: number;
  unit_price: number;
  min_stock_level?: number;
  notes?: string;
}

export interface UpdateInventoryPayload {
  item_name?: string;
  category_id?: string;
  property_id?: string;
  quantity?: number;
  unit_price?: number;
  min_stock_level?: number;
  notes?: string;
}

export interface InventoryResponse {
  success: boolean;
  count: number;
  data: InventoryItem[];
}

export interface SingleInventoryResponse {
  success: boolean;
  data: InventoryItem;
}

export interface InventoryStatsResponse {
  success: boolean;
  data: {
    total_items: number;
    total_quantity: number;
    total_value: number;
    low_stock_count: number;
    out_of_stock_count: number;
  };
}

export interface BulkDeleteResponse {
  success: boolean;
  message: string;
  affectedRows: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

// Get all inventory items with optional filters
export const getInventory = async (filters?: {
  property_id?: string;
  category_id?: string;
  stock_status?: "low_stock" | "out_of_stock";
  search?: string;
}): Promise<InventoryResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.property_id)  queryParams.append("property_id",  filters.property_id);
  if (filters?.category_id)  queryParams.append("category_id",  filters.category_id);
  if (filters?.stock_status) queryParams.append("stock_status", filters.stock_status);
  if (filters?.search)       queryParams.append("search",       filters.search);

  const url = `/api/inventory${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  return request<InventoryResponse>(url, { method: "GET" });
};

// Get inventory item by ID
export const getInventoryById = async (id: string): Promise<SingleInventoryResponse> => {
  return request<SingleInventoryResponse>(`/api/inventory/${id}`, { method: "GET" });
};

// Create a new inventory item
export const createInventory = async (data: CreateInventoryPayload): Promise<SingleInventoryResponse> => {
  return request<SingleInventoryResponse>("/api/inventory", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Update an inventory item
export const updateInventory = async (id: string, data: UpdateInventoryPayload): Promise<any> => {
  return request(`/api/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// Delete an inventory item
export const deleteInventory = async (id: string): Promise<any> => {
  return request(`/api/inventory/${id}`, { method: "DELETE" });
};

// Bulk delete inventory items
export const bulkDeleteInventory = async (ids: string[]): Promise<BulkDeleteResponse> => {
  return request<BulkDeleteResponse>("/api/inventory/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
};

// Get inventory statistics
export const getInventoryStats = async (): Promise<InventoryStatsResponse> => {
  return request<InventoryStatsResponse>("/api/inventory/stats", { method: "GET" });
};