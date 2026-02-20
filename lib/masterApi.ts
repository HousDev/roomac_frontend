// @/lib/masterApi.ts
import { request } from "@/lib/api";

// ========== TAB OPERATIONS ==========

// Get all tabs
export async function getMasterTabs() {
  return await request(`/api/masters/tabs`, {
    method: "GET",
  });
}

// Create a new tab
export async function createMasterTab(data: { tab_name: string; isactive?: number }) {
  return await request(`/api/masters/tabs`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

// Update a tab
export async function updateMasterTab(id: number, data: { tab_name: string; isactive?: number }) {
  return await request(`/api/masters/tabs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

// Delete a tab
export async function deleteMasterTab(id: number) {
  return await request(`/api/masters/tabs/${id}`, {
    method: "DELETE",
  });
}

// ========== MASTER ITEMS OPERATIONS ==========

// Get all master items
export async function getMasterItems() {
  return await request(`/api/masters/items`, {
    method: "GET",
  });
}

// Get master items by tab ID
export async function getMasterItemsByTab(tabId: number) {
  return await request(`/api/masters/items/tab/${tabId}`, {
    method: "GET",
  });
}

// Create a master item
export async function createMasterItem(data: { tab_id: number; name: string; isactive?: number }) {
  return await request(`/api/masters/items`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

// Update a master item
export async function updateMasterItem(id: number, data: { name: string; isactive?: number }) {
  return await request(`/api/masters/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

// Delete a master item
export async function deleteMasterItem(id: number) {
  return await request(`/api/masters/items/${id}`, {
    method: "DELETE",
  });
}

// ========== MASTER VALUES OPERATIONS ==========

// Get values by master item ID
export async function getMasterValues(itemId: number) {
  return await request(`/api/masters/values/${itemId}`, {
    method: "GET",
  });
}

// Create a master value
export async function createMasterValue(data: { master_item_id: number; name: string; isactive?: number }) {
  return await request(`/api/masters/values`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

// Update a master value
export async function updateMasterValue(id: number, data: { name: string; isactive?: number }) {
  return await request(`/api/masters/values/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

// Delete a master value
export async function deleteMasterValue(id: number) {
  return await request(`/api/masters/values/${id}`, {
    method: "DELETE",
  });
}

// ========== EXPORT FUNCTIONS ==========

// Export all master items
export async function exportMasterItems() {
  return await request(`/api/masters/export/items`, {
    method: "GET",
  });
}

// Export values for a specific master item
export async function exportMasterItemValues(itemId: number) {
  return await request(`/api/masters/export/values/${itemId}`, {
    method: "GET",
  });
}

export async function getAllMasters() {
  return await request(`/api/masters`, {
    method: "GET",
  });
}

/**
 * 2️⃣ Get master items by tab_id
 * Usage: dependent dropdowns (city by state, area by city)
 */
export async function getAdminMasterItemsByTab(tabId: number) {
  return await request(`/api/masters/items/tab/${tabId}`, {
    method: "GET",
  });
}

// export const getMasterValues = (tab: string, item: string) => {
//   return request(
//     `/api/masters/values?tab=${encodeURIComponent(tab)}&item=${encodeURIComponent(item)}`,
//     { method: "GET" }
//   );
// };

export const consumeMasters = (params?: {
  tab?: string;
  type?: string;
}) => {
  const query = new URLSearchParams();

  if (params?.tab) query.append("tab", params.tab);
  if (params?.type) query.append("type", params.type);

  return request(`/api/masters/consume?${query.toString()}`, {
    method: "GET",
  });
};