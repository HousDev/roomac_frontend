// // @/lib/masterApi.ts
// import { request } from "@/lib/api";

// export const MASTER_CODES = {
//   LOCKIN_PERIOD: "LOCKIN_PERIOD",
//   NOTICE_PERIOD: "NOTICE_PERIOD",
//   PROPERTY_TYPE: "PROPERTY_TYPE",
//   AMENITIES: "AMENITIES",
//   SERVICES: "SERVICES",
//   TENANT_TYPE: "TENANT_TYPE",
//   ID_PROOF_TYPE: "ID_PROOF_TYPE",
//   OCCUPATION_TYPE: "OCCUPATION_TYPE",
//   AGREEMENT_STATUS: "AGREEMENT_STATUS",
//   PAYMENT_TYPE: "PAYMENT_TYPE",
//   MAINTENANCE_TYPE: "MAINTENANCE_TYPE",
//   MAINTENANCE_STATUS: "MAINTENANCE_STATUS",
//   CITY: "CITY",
//   STATE: "STATE",
//   COUNTRY: "COUNTRY",
//   VACATE_REASON: "VACATE_REASON",
//   VACATE_STATUS: "VACATE_STATUS",
//   CURRENCY: "CURRENCY",
//   TIMEZONE: "TIMEZONE",
//   LANGUAGE: "LANGUAGE",
//   TAGS: "TAGS", 
//   PROPERTY_TAGS: "PROPERTY_TAGS",
// } as const;

// // ========== TAB OPERATIONS ==========

// // // Get all distinct tabs from master_types table
// // export async function getMasterTabs() {
// //   return await request(`/api/masters/tabs`, {
// //     method: "GET",
// //   });
// // }

// // // Create a new tab (creates a new master_type with a special tab value)
// // export async function createMasterTab(data: { name: string; description?: string; is_active?: boolean }) {
// //   return await request(`/api/masters/tabs`, {
// //     method: "POST",
// //     body: JSON.stringify(data),
// //     headers: { "Content-Type": "application/json" },
// //   });
// // }

// // // Update a tab (updates all master_types with the old tab name)
// // export async function updateMasterTab(tabId: string | number, data: { name: string; description?: string; is_active?: boolean }) {
// //   return await request(`/api/masters/tabs/${tabId}`, {
// //     method: "PUT",
// //     body: JSON.stringify(data),
// //     headers: { "Content-Type": "application/json" },
// //   });
// // }

// // // Delete a tab (deletes all master_types with this tab, or moves them to General)
// // export async function deleteMasterTab(tabName: string) {
// //   return await request(`/api/masters/tabs/${tabName}`, {
// //     method: "DELETE",
// //   });
// // }

// // ========== TAB OPERATIONS ==========

// // Get all distinct tabs from master_types table
// export async function getMasterTabs() {
//   return await request(`/api/masters/tabs`, {
//     method: "GET",
//   });
// }

// // Create a new tab - This is the missing API call
// export async function createMasterTab(data: { name: string; is_active?: boolean }) {
//   return await request(`/api/masters/tabs`, {
//     method: "POST",
//     body: JSON.stringify(data),
//     headers: { "Content-Type": "application/json" },
//   });
// }

// // Update a tab
// export async function updateMasterTab(tabName: string, data: { name: string; is_active?: boolean }) {
//   return await request(`/api/masters/tabs/${tabName}`, {
//     method: "PUT",
//     body: JSON.stringify(data),
//     headers: { "Content-Type": "application/json" },
//   });
// }

// // Delete a tab
// export async function deleteMasterTab(tabName: string) {
//   return await request(`/api/masters/tabs/${tabName}`, {
//     method: "DELETE",
//   });
// }

// // Get master types by tab name
// export async function getMasterTypesByTab(tab: string) {
//   return await request(`/api/masters/types/tab/${tab}`, {
//     method: "GET",
//   });
// }

// // ========== MASTER TYPE OPERATIONS ==========

// export async function getMasterTypes() {
//   return await request(`/api/masters/types`, {
//     method: "GET",
//   });
// }

// export async function getMasterTypeById(id: string | number) {
//   return await request(`/api/masters/types/${id}`, {
//     method: "GET",
//   });
// }

// export async function getMasterTypeByCode(code: string) {
//   return await request(`/api/masters/types/code/${code}`, {
//     method: "GET",
//   });
// }

// export async function createMasterType(data: any) {
//   return await request(`/api/masters/types`, {
//     method: "POST",
//     body: JSON.stringify(data),
//     headers: { "Content-Type": "application/json" },
//   });
// }

// export async function updateMasterType(id: number, data: any) {
//   return await request(`/api/masters/types/${id}`, {
//     method: "PUT",
//     body: JSON.stringify(data),
//     headers: { "Content-Type": "application/json" },
//   });
// }

// export async function deleteMasterType(id: number) {
//   return await request(`/api/masters/types/${id}`, {
//     method: "DELETE",
//   });
// }

// export async function toggleMasterTypeStatus(id: number, is_active: boolean) {
//   return await request(`/api/masters/types/${id}/status`, {
//     method: "PATCH",
//     body: JSON.stringify({ is_active }),
//     headers: { "Content-Type": "application/json" },
//   });
// }

// // ========== MASTER VALUE OPERATIONS ==========

// export async function getMasterValues(typeId: string | number) {
//   return await request(`/api/masters/values/${typeId}`, {
//     method: "GET",
//   });
// }

// export async function getMasterValuesByTypeId(typeId: string | number) {
//   return await request(`/api/masters/values/${typeId}`, {
//     method: "GET",
//   });
// }

// export async function getMasterValuesByCode(code: string) {
//   return await request(`/api/masters/values/code/${code}`, {
//     method: "GET",
//   });
// }

// export async function getActiveMasterValuesByCode(code: string) {
//   return await request(`/api/masters/active-values/code/${code}`, {
//     method: "GET",
//   });
// }

// export async function createMasterValue(data: any) {
//   return await request(`/api/masters/values`, {
//     method: "POST",
//     body: JSON.stringify(data),
//     headers: { "Content-Type": "application/json" },
//   });
// }

// export async function updateMasterValue(id: number, data: any) {
//   return await request(`/api/masters/values/${id}`, {
//     method: "PUT",
//     body: JSON.stringify(data),
//     headers: { "Content-Type": "application/json" },
//   });
// }

// export async function deleteMasterValue(id: number) {
//   return await request(`/api/masters/values/${id}`, {
//     method: "DELETE",
//   });
// }

// export async function toggleMasterValueStatus(id: number, is_active: boolean) {
//   return await request(`/api/masters/values/${id}/status`, {
//     method: "PATCH",
//     body: JSON.stringify({ is_active }),
//     headers: { "Content-Type": "application/json" },
//   });
// }

// export async function exportMasterValues(typeId: string | number) {
//   return await request(`/api/masters/values/${typeId}/export`, {
//     method: "GET",
//   });
// }

// // ========== HELPER FUNCTIONS ==========

// export async function getLockinPeriodOptions() {
//   return getActiveMasterValuesByCode(MASTER_CODES.LOCKIN_PERIOD);
// }

// export async function getNoticePeriodOptions() {
//   return getActiveMasterValuesByCode(MASTER_CODES.NOTICE_PERIOD);
// }

// export async function getPropertyTypes() {
//   return getActiveMasterValuesByCode(MASTER_CODES.PROPERTY_TYPE);
// }

// export async function getAmenities() {
//   return getActiveMasterValuesByCode(MASTER_CODES.AMENITIES);
// }

// export async function getServices() {
//   return getActiveMasterValuesByCode(MASTER_CODES.SERVICES);
// }

// export function extractNumberFromDuration(durationString: string): number {
//   if (!durationString) return 0;
//   const match = durationString.match(/\d+/);
//   return match ? parseInt(match[0], 10) : 0;
// }

// export function parseDurationToDays(durationString: string): number {
//   if (!durationString) return 0;
  
//   const lower = durationString.toLowerCase();
//   const match = durationString.match(/\d+/);
//   if (!match) return 0;
  
//   const number = parseInt(match[0], 10);
  
//   if (lower.includes('month') || lower.includes('months')) {
//     return number * 30;
//   }
  
//   if (lower.includes('day') || lower.includes('days')) {
//     return number;
//   }
  
//   if (lower.includes('week') || lower.includes('weeks')) {
//     return number * 7;
//   }
  
//   if (lower.includes('year') || lower.includes('years')) {
//     return number * 365;
//   }
  
//   return number;
// }

// export function parseDurationToMonths(durationString: string): number {
//   if (!durationString) return 0;
  
//   const lower = durationString.toLowerCase();
//   const match = durationString.match(/\d+/);
//   if (!match) return 0;
  
//   const number = parseInt(match[0], 10);
  
//   if (lower.includes('month') || lower.includes('months')) {
//     return number;
//   }
  
//   if (lower.includes('day') || lower.includes('days')) {
//     return Math.floor(number / 30);
//   }
  
//   if (lower.includes('week') || lower.includes('weeks')) {
//     return Math.floor((number * 7) / 30);
//   }
  
//   if (lower.includes('year') || lower.includes('years')) {
//     return number * 12;
//   }
  
//   return number;
// }

// // Tags specific functions
// export async function getPropertyTags() {
//   return await getActiveMasterValuesByCode(MASTER_CODES.TAGS);
// }

// export async function getAllTags() {
//   try {
//     const response = await getActiveMasterValuesByCode(MASTER_CODES.TAGS);
//     if (response?.success && Array.isArray(response.data)) {
//       // Extract value field from master values
//       return response.data.map((item: any) => item.value).filter(Boolean);
//     }
//     return [];
//   } catch (error) {
//     console.error("Error fetching tags:", error);
//     return [];
//   }
// }

// export async function createTag(value: string) {
//   return await createMasterValue({
//     type_code: MASTER_CODES.TAGS,
//     value,
//     description: `Property tag: ${value}`,
//     display_order: 0,
//     is_active: true,
//     metadata: {
//       category: "property",
//       created_at: new Date().toISOString(),
//     },
//   });
// }

// export async function updateTag(id: number, data: { value: string; description?: string }) {
//   return await updateMasterValue(id, {
//     ...data,
//     type_code: MASTER_CODES.TAGS,
//   });
// }

// export async function deleteTag(id: number) {
//   return await deleteMasterValue(id);
// }

// export async function toggleTagStatus(id: number, is_active: boolean) {
//   return await toggleMasterValueStatus(id, is_active);
// }

// // Alias functions for backward compatibility
// export const createTab = createMasterTab;
// export const updateTab = updateMasterTab;
// export const deleteTab = deleteMasterTab;



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