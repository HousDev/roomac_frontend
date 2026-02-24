import { request } from "@/lib/api";
import * as XLSX from 'xlsx';

// ========== STATIC TABS ==========
export const STATIC_TABS = [
  { id: 'common', name: 'Common', icon: 'FolderOpen' },
  { id: 'properties', name: 'Properties', icon: 'Home' },
  { id: 'rooms', name: 'Rooms', icon: 'Door' },
  { id: 'requests', name: 'Requests', icon: 'MessageSquare' },
] as const;

export type TabName = typeof STATIC_TABS[number]['name'];

// ========== MASTER ITEMS OPERATIONS ==========

// Get all master items with value counts
export async function getMasterItems() {
  try {
    const response = await request(`/api/masters/items`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("API Error - getMasterItems:", error);
    throw error;
  }
}

// Get master items by tab name
export async function getMasterItemsByTab(tabName: string) {
  try {
    const response = await request(`/api/masters/items/tab/${encodeURIComponent(tabName)}`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("API Error - getMasterItemsByTab:", error);
    throw error;
  }
}

// Create a master item
export async function createMasterItem(data: { tab_name: string; name: string; isactive?: number }) {
  try {
    const response = await request(`/api/masters/items`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return response;
  } catch (error) {
    console.error("API Error - createMasterItem:", error);
    throw error;
  }
}

// Update a master item
export async function updateMasterItem(id: number, data: { name: string; isactive?: number; tab_name?: string }) {
  try {
    const response = await request(`/api/masters/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return response;
  } catch (error) {
    console.error("API Error - updateMasterItem:", error);
    throw error;
  }
}

// Delete a master item
export async function deleteMasterItem(id: number) {
  try {
    const response = await request(`/api/masters/items/${id}`, {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("API Error - deleteMasterItem:", error);
    throw error;
  }
}

// Toggle item status
export async function toggleItemStatus(id: number, isactive: number) {
  try {
    const response = await request(`/api/masters/items/${id}/toggle`, {
      method: "PATCH",
      body: JSON.stringify({ isactive }),
      headers: { "Content-Type": "application/json" },
    });
    return response;
  } catch (error) {
    console.error("API Error - toggleItemStatus:", error);
    throw error;
  }
}

// ========== MASTER VALUES OPERATIONS ==========

// Get values by master item ID
export async function getMasterValues(itemId: number) {
  try {
    const response = await request(`/api/masters/values/${itemId}`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("API Error - getMasterValues:", error);
    throw error;
  }
}

// Create a master value
export async function createMasterValue(data: { master_item_id: number; name: string; isactive?: number }) {
  try {
    const response = await request(`/api/masters/values`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return response;
  } catch (error) {
    console.error("API Error - createMasterValue:", error);
    throw error;
  }
}

// Update a master value
export async function updateMasterValue(id: number, data: { name: string; isactive?: number }) {
  try {
    const response = await request(`/api/masters/values/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return response;
  } catch (error) {
    console.error("API Error - updateMasterValue:", error);
    throw error;
  }
}

// Delete a master value
export async function deleteMasterValue(id: number) {
  try {
    const response = await request(`/api/masters/values/${id}`, {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("API Error - deleteMasterValue:", error);
    throw error;
  }
}

// Toggle value status
export async function toggleValueStatus(id: number, isactive: number) {
  try {
    const response = await request(`/api/masters/values/${id}/toggle`, {
      method: "PATCH",
      body: JSON.stringify({ isactive }),
      headers: { "Content-Type": "application/json" },
    });
    return response;
  } catch (error) {
    console.error("API Error - toggleValueStatus:", error);
    throw error;
  }
}

// ========== CONSUME API OPERATIONS ==========
// These are for frontend forms and dropdowns

// Get all masters in nested structure
// Returns: { "Properties": { "Property Types": [...values], "Amenities": [...] }, "Rooms": {...} }
export async function getAllMasters() {
  try {
    const response = await request(`/api/masters/consume/all`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("API Error - getAllMasters:", error);
    throw error;
  }
}

// Get active items by tab name (for dropdowns)
// Returns: [{ id: 1, name: "Property Types" }, ...]
export async function getActiveItemsByTab(tabName: string) {
  try {
    const response = await request(`/api/masters/consume/items/${encodeURIComponent(tabName)}`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("API Error - getActiveItemsByTab:", error);
    throw error;
  }
}

// Get active values by item ID (for dropdowns)
// Returns: [{ id: 1, name: "Studio", isactive: 1 }, ...]
export async function getActiveValuesByItemId(itemId: number) {
  try {
    const response = await request(`/api/masters/consume/values/${itemId}`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("API Error - getActiveValuesByItemId:", error);
    throw error;
  }
}

// Flexible consume API with query params
// Usage: consumeMasters({ tab: "Properties", type: "Property Types" })
// Returns: [{ value_id: 1, value_name: "Studio", ... }]
export async function consumeMasters(params?: { tab?: string; type?: string }) {
  try {
    const query = new URLSearchParams();
    if (params?.tab) query.append("tab", params.tab);
    if (params?.type) query.append("type", params.type);

    const response = await request(`/api/masters/consume?${query.toString()}`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("API Error - consumeMasters:", error);
    throw error;
  }
}

// ========== UTILITY OPERATIONS ==========

// Get distinct tab names from database
export async function getDistinctTabs() {
  try {
    const response = await request(`/api/masters/tabs`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("API Error - getDistinctTabs:", error);
    throw error;
  }
}

// Search items across all tabs
export async function searchMasterItems(query: string) {
  try {
    const response = await request(`/api/masters/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("API Error - searchMasterItems:", error);
    throw error;
  }
}

// ========== EXPORT OPERATIONS ==========

// Export all master items
export async function exportMasterItems() {
  try {
    const response = await request(`/api/masters/export/items`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("API Error - exportMasterItems:", error);
    throw error;
  }
}

// Export values for a specific master item
export async function exportMasterItemValues(itemId: number) {
  try {
    const response = await request(`/api/masters/export/values/${itemId}`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("API Error - exportMasterItemValues:", error);
    throw error;
  }
}

// Export values to Excel
export async function exportValuesToExcel(itemId: number, itemName: string) {
  try {
    const response = await exportMasterItemValues(itemId);
    if (response?.success && Array.isArray(response.data)) {
      // Format data for Excel
      const excelData = response.data.map((item: any) => ({
        'ID': item.value_id,
        'Value Name': item.value_name,
        'Status': item.value_status === 1 ? 'Active' : 'Inactive',
        'Created': new Date(item.created_at).toLocaleString(),
        'Item Name': item.item_name,
        'Tab': item.tab_name
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Values');
      
      // Download Excel file
      const filename = `${itemName.toLowerCase().replace(/\s+/g, '_')}_values.xlsx`;
      XLSX.writeFile(wb, filename);
      
      return true;
    } else {
      throw new Error("No data to export");
    }
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}

// Export master items to Excel
export async function exportItemsToExcel() {
  try {
    const response = await exportMasterItems();
    if (response?.success && Array.isArray(response.data)) {
      // Format data for Excel
      const excelData = response.data.map((item: any) => ({
        'Item ID': item.item_id,
        'Item Name': item.item_name,
        'Tab': item.tab_name,
        'Status': item.item_status === 1 ? 'Active' : 'Inactive',
        'Value Count': item.value_count,
        'Created': new Date(item.created_at).toLocaleString()
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Master Items');
      
      // Download Excel file
      XLSX.writeFile(wb, 'master_items_export.xlsx');
      
      return true;
    } else {
      throw new Error("No data to export");
    }
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}

// ========== IMPORT FROM EXCEL ==========

// Parse Excel file and import values
export async function importValuesFromExcel(file: File, masterItemId: number): Promise<{ success: boolean; created: number; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        const created: any[] = [];
        const errors: string[] = [];
        
        for (const row of jsonData) {
          try {
            // Expect columns: Name, Status (optional)
            const name = (row as any)['Name'] || (row as any)['Value Name'] || (row as any)['name'];
            const status = (row as any)['Status'] || (row as any)['status'] || 'Active';
            
            if (!name) {
              errors.push(`Missing name in row: ${JSON.stringify(row)}`);
              continue;
            }
            
            const isactive = status.toString().toLowerCase() === 'active' ? 1 : 0;
            
            const response = await createMasterValue({
              master_item_id: masterItemId,
              name: name.toString().trim(),
              isactive
            });
            
            if (response?.success) {
              created.push(response.data);
            } else {
              errors.push(`Failed to create "${name}": ${response?.error || 'Unknown error'}`);
            }
          } catch (error: any) {
            errors.push(`Error processing row: ${error.message}`);
          }
        }
        
        resolve({
          success: true,
          created: created.length,
          errors
        });
      } catch (error: any) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// ========== BULK ACTIONS ==========

// Bulk update values status
export async function bulkUpdateValuesStatus(valueIds: number[], isactive: number) {
  try {
    // Since we don't have a bulk update endpoint, we'll do multiple updates
    const results = await Promise.allSettled(
      valueIds.map(id => 
        updateMasterValue(id, {
          isactive,
          name: ""
        })
      )
    );
    
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return {
      success: true,
      succeeded,
      failed,
      errors: results
        .filter(r => r.status === 'rejected')
        .map(r => (r as PromiseRejectedResult).reason)
    };
  } catch (error) {
    console.error("Bulk update failed:", error);
    throw error;
  }
}

// Bulk delete values
export async function bulkDeleteValues(valueIds: number[]) {
  try {
    // Since we don't have a bulk delete endpoint, we'll do multiple deletes
    const results = await Promise.allSettled(
      valueIds.map(id => deleteMasterValue(id))
    );
    
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return {
      success: true,
      succeeded,
      failed,
      errors: results
        .filter(r => r.status === 'rejected')
        .map(r => (r as PromiseRejectedResult).reason)
    };
  } catch (error) {
    console.error("Bulk delete failed:", error);
    throw error;
  }
}

// ========== BATCH OPERATIONS ==========

// Bulk create items (using backend endpoint)
export async function bulkCreateItems(items: Array<{ tab_name: string; name: string; isactive?: number }>) {
  try {
    const response = await request(`/api/masters/items/bulk`, {
      method: "POST",
      body: JSON.stringify({ items }),
      headers: { "Content-Type": "application/json" },
    });
    return response;
  } catch (error) {
    console.error("API Error - bulkCreateItems:", error);
    throw error;
  }
}

// Bulk create values (using backend endpoint)
export async function bulkCreateValues(master_item_id: number, values: Array<{ name: string; isactive?: number }>) {
  try {
    const response = await request(`/api/masters/values/bulk`, {
      method: "POST",
      body: JSON.stringify({ master_item_id, values }),
      headers: { "Content-Type": "application/json" },
    });
    return response;
  } catch (error) {
    console.error("API Error - bulkCreateValues:", error);
    throw error;
  }
}