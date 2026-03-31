// lib/tenantRequestsApi.ts - UPDATED VERSION
import { request} from "./api";
import { getTenantToken } from "./tenantAuthApi";
import { tenantApiRequest } from "./tenantApiHelper"; 
import { consumeMasters } from "./masterApi";

export type TenantRequest = {
  change_bed_data?: ChangeBedData;
  id: number;
  tenant_id: number;
  property_id: number | null;
  request_type:
    | "general"
    | "complaint"
    | "receipt"
    | "maintenance"
    // | "leave"
    | "vacate_bed"
    | "change_bed";
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status:
    | "pending"
    | "in_progress"
    | "resolved"
    | "closed"
    | "approved"
    | "rejected"
    | "completed";
  admin_notes: string | null;
  assigned_to: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  cost_breakdown: string | null;
  completion_date: string | null;
  resolved_by: number | null;
  escalated_at: string | null;
  escalated_by: number | null;
  escalated_to: number | null;
  resolution_details: string | null;
  vacate_data?: {
    primary_reason_id?: number;
    primary_reason?: string;  // Add this field
    secondary_reasons?: string[];
    overall_rating?: number;
    food_rating?: number;
    cleanliness_rating?: number;
    management_rating?: number;
    improvement_suggestions?: string;
    expected_vacate_date?: string;
    lockin_penalty_accepted?: boolean;
    notice_penalty_accepted?: boolean;
  };
  // leave_data?: {
  //   leave_type: string;
  //   leave_start_date: string;
  //   leave_end_date: string;
  //   total_days: number;
  //   contact_address_during_leave?: string;
  //   emergency_contact_number?: string;
  //   room_locked?: boolean;
  //   keys_submitted?: boolean;
  //   created_at?: string;
  // };
   maintenance_data?: {
    issue_category?: string;
    location?: string;
    preferred_visit_time?: string;
    access_permission?: boolean;
    resolved_at?: string;
  };
  complaint_data?: {
    category_master_type_id?: number;
    reason_master_value_id?: number;
    custom_reason?: string;
    complaint_category_name?: string;
    complaint_reason_name?: string;
  };
};

export type ChangeBedData = {
  preferred_property_id: number;
  preferred_room_id: number;
  change_reason_id: number;
  shifting_date: string;
  notes?: string;
  assigned_bed_number?: number;
  rent_difference?: number;
  admin_notes?: string;
  request_status?: string;
  preferred_room_number?: number;
  preferred_property_name?: string;
  change_reason?: string;
};

export type AdminVacateRequest = TenantRequest;

export type AdminVacateRequestsResponse = {
  success: boolean;
  data: AdminVacateRequest[];
  message?: string;
};

export type Property = {
  id: number;
  name: string;
  address: string;
  city: string;
  area: string;
  state: string;
  total_rooms: number;
  total_beds: number;
  occupied_beds: number;
  starting_price: number;
  is_active: boolean;
  available_rooms_count: number;
  total_rooms_count: number;
};

export type Room = {
  id: number;
  room_number: number;
  sharing_type: string;
  total_bed: number;
  floor: number;
  property_id: number;
  rent_per_bed: number;
  room_type: string;
  description: string;
  is_active: boolean;
  occupied_beds: number;
  available_beds: number;
  property_name: string;
  property_address: string;
  city: string;
  area: string;
  state: string;
};

export type ChangeReason = {
  id: number;
  value: string;
  description: string;
  display_order: number;
  is_active: boolean;
  reason_code: string;
};

export type CurrentRoomInfo = {
  tenant_id: number;
  tenant_name: string;
  email: string;
  phone: string;
  gender: string;
  check_in_date: string;
  has_assignment: boolean;
  property_id?: number;
  property_name?: string;
  property_address?: string;
  city?: string;
  area?: string;
  state?: string;
  room_id?: number;
  room_number?: number;
  bed_number?: number;
  rent_per_bed?: number;
  sharing_type?: string;
  total_bed?: number;
  occupied_beds?: number;
  available_beds?: number;
  floor?: number;
  bed_assignment_id?: number;
  assignment_date?: string;
  message?: string;
};

export type LeaveType = {
  id: number;
  value: string;
  description: string;
  display_order: number;
  is_active: boolean;
  type_code: string;
};

export type ComplaintCategory = {
  description: any;
  id: number;
  code: string;
  name: string;
  tab: string;
  is_active: number;
};

// In lib/tenantRequestsApi.ts
export type ComplaintReason = {
  description: any;
  id: number;
  value: string;
  master_type_id?: number;
  is_active?: number;
};


export const getMyTenantRequests = async (): Promise<TenantRequest[]> => {
  try {
    
    const res = await tenantApiRequest<{
      success: boolean;
      data: TenantRequest[];
      message?: string;
    }>("/api/tenant-requests", {
      method: "GET",
    });

    

    if (!res.success) {
      console.error('❌ API returned failure:', res);
      throw new Error(res.message || "Failed to get tenant requests");
    }

    if (!Array.isArray(res.data)) {
      console.warn('⚠️ No valid data array in response:', res);
      return [];
    }

    return res.data;
  } catch (error: any) {
    console.error('❌ Error getting tenant requests:', error);
    throw error;
  }
};


// Add this function with your other API functions (around line 250)
export const bulkDeleteVacateRequests = async (ids: number[]) => {
  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/vacate-requests/bulk-delete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = JSON.parse(responseText);
    return result;
  } catch (error) {
    console.error('Error bulk deleting vacate requests:', error);
    throw error;
  }
};

export async function createTenantRequest(data: any) {
  try {
    
    const res = await tenantApiRequest<{
      success: boolean;
      message?: string;
      code?: string;
      data?: any;
    }>("/api/tenant-requests", {
      method: "POST",
      body: JSON.stringify(data),
    });


    // Handle duplicate request error
    if (res.code === 'DUPLICATE_VACATE_REQUEST') {
      throw new Error(res.message || "You already have a pending vacate request.");
    }

    if (res.code === 'DUPLICATE_CHANGE_BED_REQUEST') {
      throw new Error(res.message || "You already have a pending change bed request.");
    }

    if (!res.success) {
      console.error('❌ Create request failed:', res);
      throw new Error(res.message || "Failed to create request");
    }

    return res;
  } catch (error: any) {
    console.error('❌ Error creating tenant request:', error);
    
    // Enhanced error handling
    if (error.message.includes('Invalid token type')) {
      throw new Error('Authentication error. Please login to tenant portal.');
    } else if (error.message.includes('lock-in period penalty')) {
      throw new Error('You must agree to the lock-in period penalty.');
    } else if (error.message.includes('notice period penalty')) {
      throw new Error('You must agree to the notice period penalty.');
    } else if (error.message.includes('already have a pending')) {
      throw error;
    } else if (error.message.includes('Authentication required')) {
      throw error;
    }
    else if (error.message.includes('Cannot request to move to current room')) {
      throw new Error('Cannot request to move to your current room.');
    } else if (error.message.includes('Selected room is fully occupied')) {
      throw new Error('The selected room is fully occupied. Please select another room.');
    }
    
    throw new Error(error.message || 'Failed to create request');
  }
}

// Get master values by tab
export const getMasterValuesByTab = async (tab: string): Promise<Record<string, any[]>> => {
  try {
    
    const res = await consumeMasters({ tab });
    
    
    if (res?.success && res.data) {
      // Group by type_name (which comes from master_items.name)
      const grouped: Record<string, any[]> = {};
      res.data.forEach((item: any) => {
        const type = item.type_name; // This should be 'Vacate Reason'
        if (!grouped[type]) {
          grouped[type] = [];
        }
        grouped[type].push({
          id: item.value_id,        // This is master_item_values.id
          value: item.value_name,    // This is master_item_values.name
          name: item.value_name,
          description: item.description || '',
          display_order: item.display_order || 0,
          is_active: item.is_active === 1 || item.is_active === true,
          master_item_id: item.master_item_id // Keep this for reference if needed
        });
      });
      
      return grouped;
    }
    
    return {};
  } catch (error) {
    console.error(`❌ Error getting master values for tab ${tab}:`, error);
    return {};
  }
};

// Get vacate reasons from Rooms tab
// Get vacate reasons from Rooms tab
export const getVacateReasonsFromMasters = async (): Promise<any[]> => {
  try {
    const masters = await getMasterValuesByTab('Rooms');
    
    
    // Look for the 'Vacate Reason' type in the masters object
    // The keys in masters are the type names from master_items
    const vacateReasons = masters['Vacate Reason'] || [];
    
    if (vacateReasons.length > 0) {
      console.log(`✅ Found ${vacateReasons.length} vacate reasons from masters:`, vacateReasons);
      return vacateReasons;
    }
    
    
    // Fallback reasons if not found
    return [
      { id: 57, value: 'Health issues', description: 'Health-related reasons' },
      { id: 58, value: 'Job relocation', description: 'Changing job or moving to new location' },
      { id: 59, value: 'Financial Issues', description: 'Budget constraints or financial difficulties' },
      { id: 60, value: 'Found Better Accommodation', description: 'Found better or cheaper accommodation' },
      { id: 61, value: 'Completing Studies', description: 'Education completed or leaving the city' },
      { id: 62, value: 'Family Reasons', description: 'Family commitments or issues' },
      { id: 63, value: 'Dissatisfied with Services', description: 'Not satisfied with the services provided' }
    ];
  } catch (error) {
    console.error('❌ Error getting vacate reasons from masters:', error);
    return [];
  }
};

// Add to lib/tenantRequestsApi.ts
export const getMyVacateRequests = async (): Promise<TenantRequest[]> => {
  try {
    
    const token = getTenantToken();
    
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    // First, get all requests
    const res = await request<{
      success: boolean;
      data: TenantRequest[];
    }>("/api/tenant-requests", {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.success || !Array.isArray(res.data)) {
      console.warn('⚠️ No valid data in response:', res);
      return [];
    }

    // Filter for vacate_bed requests
    const vacateRequests = res.data.filter(request => 
      request.request_type === 'vacate_bed'
    );

    return vacateRequests;
  } catch (error: any) {
    console.error('❌ Error getting vacate requests:', error);
    throw error;
  }
};

// ==================== ADMIN FUNCTIONS ====================

/**
 * Get admin authentication token - ENHANCED VERSION
 */
const getAdminToken = (): string => {
  if (typeof window === 'undefined') {
    console.error('❌ Cannot access localStorage on server');
    return '';
  }
  
  // Check multiple possible token storage locations
  const adminToken = localStorage.getItem('auth_token');
  const genericToken = localStorage.getItem('token');
  const sessionAdminToken = sessionStorage.getItem('auth_token');
  const sessionGenericToken = sessionStorage.getItem('token');
  
  // Priority: admin_token > token > session_admin_token > session_token
  const token = adminToken || genericToken || sessionAdminToken || sessionGenericToken;
  
  if (!token) {
    console.error('❌ No authentication token found in storage');
   
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
    
    throw new Error('Admin authentication required. Please login.');
  }
  
  
  // Log token details for debugging
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      
    }
  } catch (e) {
    console.log('⚠️ Token is not a JWT or cannot be decoded');
  }
  
  return token;
};

/**
 * Fetch all vacate requests for admin
 */
export const getAdminVacateRequests = async (): Promise<AdminVacateRequest[]> => {
  try {
    
    const token = getAdminToken();
    
    const res = await request<AdminVacateRequestsResponse>("/api/admin/vacate-requests", {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    

    if (!res.success) {
      console.error('❌ API returned failure:', res);
      throw new Error("Failed to get vacate requests");
    }

    if (!Array.isArray(res.data)) {
      console.warn('⚠️ No valid data array in response:', res);
      return [];
    }

    return res.data;
  } catch (error: any) {
    console.error('❌ Error getting admin vacate requests:', error);
    
    // Check if it's an auth error
    if (error.message?.includes('401') || error.message?.includes('authentication')) {
      console.error('🔒 Authentication error - redirecting to login');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    throw error;
  }
};

// Update getPropertiesList function to use existing property routes:
export const getPropertiesList = async (): Promise<Property[]> => {
  try {
    
    const token = getAdminToken();
    
    // Use the existing property route for simple list
    const res = await request<{ 
      success: boolean; 
      data: Property[]; 
      message?: string;
    }>("/api/admin/properties", {  // This should use your existing property route
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    

    if (!res.success || !Array.isArray(res.data)) {
      console.warn('⚠️ No valid data in response:', res);
      return [];
    }

    return res.data;
  } catch (error: any) {
    console.error('❌ Error getting properties list:', error);
    return [];
  }
};

export const getMasterValues = async (code: string): Promise<any[]> => {
  try {
    
    const token = getAdminToken();
    
    // Try the master values endpoint
    const res = await request<{ 
      success: boolean; 
      data: any[]; 
      message?: string;
    }>(`/api/master/active-values/code/${code}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    
    // If endpoint doesn't exist or returns error, return fallback data
    console.warn(`⚠️ Master values endpoint failed, using fallback for ${code}`);
    
    // Return fallback data based on code
    if (code === 'VACATE_REASON') {
      return [
        { id: 1, value: 'Relocation', description: 'Moving to new city/location' },
        { id: 2, value: 'Job Change', description: 'Change in employment' },
        { id: 3, value: 'Dissatisfaction', description: 'Not satisfied with services' },
        { id: 4, value: 'Personal Reasons', description: 'Personal/family reasons' },
        { id: 5, value: 'Financial Issues', description: 'Budget constraints' },
        { id: 6, value: 'Completed Studies', description: 'Education completed' }
      ];
    }
    
    return [];
  } catch (error: any) {
    console.error('❌ Error getting master values:', error);
    
    // Return empty array instead of throwing error
    return [];
  }
};

// Add to lib/tenantRequestsApi.ts or create a separate debug file
export const checkAuthStatus = () => {
  if (typeof window === 'undefined') {
    console.log('🖥️ Server-side rendering, no localStorage');
    return;
  }
  
  
  // Try to get token
  try {
    const token = localStorage.getItem('auth_token');
    if (token) {
      
      
      // Try to decode JWT to check expiration
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
      } catch (e) {
        console.log('⚠️ Could not decode token (might not be JWT)');
      }
    } else {
      console.log('❌ No admin_token found in localStorage');
    }
  } catch (error) {
    console.error('❌ Error checking auth status:', error);
  }
};

// Add these functions to lib/tenantRequestsApi.ts

/**
 * Update vacate request status (Admin)
 */
export const updateVacateRequestStatus = async (
  requestId: number, 
  payload: StatusUpdatePayload
): Promise<{ success: boolean; message?: string }> => {
  try {
    
    const token = getAdminToken();
    
    const res = await request<{ 
      success: boolean; 
      message?: string;
    }>(`/api/admin/vacate-requests/${requestId}/status`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });


    if (!res.success) {
      throw new Error(res.message || "Failed to update status");
    }

    return res;
  } catch (error: any) {
    console.error('❌ Error updating vacate request status:', error);
    throw error;
  }
};

/**
 * Send notification to tenant (Admin)
 */
export const sendTenantNotification = async (data: {
  user_id: number;
  user_type: string;
  title: string;
  message: string;
  type: string;
  data?: any;
}): Promise<{ success: boolean; message?: string }> => {
  try {
    
    const token = getAdminToken();
    
    const res = await request<{ 
      success: boolean; 
      message?: string;
    }>("/api/admin/notifications", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.success) {
      throw new Error(res.message || "Failed to send notification");
    }

    return res;
  } catch (error: any) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
};

// Add type definition for StatusUpdatePayload
export type StatusUpdatePayload = {
  status: 'under_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  admin_notes?: string;
  actual_vacate_date?: string;
  refund_amount?: number;
  penalty_waived?: boolean;
};


// Get tenant contract details
// Get tenant contract details
export const getTenantContractDetails = async (): Promise<{
  tenantDetails: any;
  lockinInfo: any;
  noticeInfo: any;
}> => {
  try {
    const res = await tenantApiRequest<{
      success: boolean;
      data: {
        tenantDetails: any;
        lockinInfo: any;
        noticeInfo: any;
      };
      message?: string;
    }>("/api/tenant-requests/contract-details", {
      method: "GET",
    });


    if (!res.success) {
      throw new Error(res.message || "Failed to get contract details");
    }

    // Return the data object directly - this matches what your component expects
    return res.data;
  } catch (error: any) {
    console.error('❌ Error getting tenant contract details:', error);
    // Return default values instead of throwing
    return {
      tenantDetails: null,
      lockinInfo: null,
      noticeInfo: null
    };
  }
};

// In your tenantRequestsApi.ts or wherever you have API functions

// Get current room info
export const getCurrentRoomInfo = async (): Promise<CurrentRoomInfo | null> => {
  try {
    const res = await tenantApiRequest<{
      message(arg0: string, message: any): unknown;
      success: boolean;
      data: CurrentRoomInfo;
    }>("/api/tenant-requests/current-room", {
      method: "GET",
    });

    if (!res.success) {
      console.warn('⚠️ Could not get current room info:', res.message);
      return null;
    }

    return res.data;
  } catch (error) {
    console.error('❌ Error getting current room info:', error);
    return null;
  }
};

// Get active properties
export const getActiveProperties = async (): Promise<Property[]> => {
  try {
    const res = await tenantApiRequest<{
      success: boolean;
      data: Property[];
    }>("/api/tenant-requests/properties/active", {
      method: "GET",
    });

    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }

    return res.data;
  } catch (error) {
    console.error('❌ Error getting active properties:', error);
    return [];
  }
};

// Get available rooms for a property
export const getAvailableRooms = async (propertyId: number): Promise<Room[]> => {
  try {
    const res = await tenantApiRequest<{
      success: boolean;
      data: Room[];
    }>(`/api/tenant-requests/properties/${propertyId}/available-rooms`, {
      method: "GET",
    });

    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }

    return res.data;
  } catch (error) {
    console.error(`❌ Error getting available rooms for property ${propertyId}:`, error);
    return [];
  }
};

// Get change bed reasons from Rooms tab
export const getChangeBedReasonsFromMasters = async (): Promise<any[]> => {
  try {
    const masters = await getMasterValuesByTab('Rooms');
    
    // Try different possible type names for change bed reasons
    const changeBedReasons = masters['Change Reason'] || 
                             masters['ChangeReason'] || 
                             masters['Change Bed'] || 
                             masters['Bed Change Reason'] || 
                             [];
    
    if (changeBedReasons.length > 0) {
      return changeBedReasons;
    }
    
    
    // Fallback change bed reasons
    return [
      { id: 1, value: 'Need larger room', description: 'Need more space', reason_code: 'LARGER_ROOM' },
      { id: 2, value: 'Need smaller room', description: 'Want to reduce rent', reason_code: 'SMALLER_ROOM' },
      { id: 3, value: 'Roommate issues', description: 'Issues with current roommates', reason_code: 'ROOMMATE_ISSUES' },
      { id: 4, value: 'Noise concerns', description: 'Too much noise in current room', reason_code: 'NOISE_CONCERNS' },
      { id: 5, value: 'Medical reasons', description: 'Health-related requirements', reason_code: 'MEDICAL' },
      { id: 6, value: 'Privacy concerns', description: 'Need more privacy', reason_code: 'PRIVACY' },
      { id: 7, value: 'Change floor', description: 'Prefer different floor', reason_code: 'CHANGE_FLOOR' },
      { id: 8, value: 'Better view', description: 'Want room with better view', reason_code: 'BETTER_VIEW' },
      { id: 9, value: 'Closer to amenities', description: 'Want to be closer to facilities', reason_code: 'CLOSER_AMENITIES' },
      { id: 10, value: 'Other personal reasons', description: 'Other personal requirements', reason_code: 'OTHER' }
    ];
  } catch (error) {
    console.error('❌ Error getting change bed reasons from masters:', error);
    return [];
  }
};

// In tenantRequestApi.ts - Update getAvailableBedsForRoom function
export const getAvailableBedsForRoom = async (roomId: number): Promise<number[]> => {
    try {
        const token = getTenantToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/available-beds`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.success && Array.isArray(result.data)) {
                // Extract bed numbers from the objects
                const bedNumbers = result.data.map((bed: any) => {
                    // Check different possible property names
                    return bed.bed_number || bed.bedNumber || bed.number || bed.id;
                }).filter((bedNumber: any) => typeof bedNumber === 'number');
                
                return bedNumbers;
            }
        }
        console.error(`Failed to get available beds for room ${roomId}:`, response.status);
        return [];
    } catch (error) {
        console.error('❌ Error getting available beds:', error);
        return [];
    }
};

// Get vacate reasons
export const getVacateReasons = async (): Promise<any[]> => {
  try {
    const res = await tenantApiRequest<{
      success: boolean;
      data: any[];
    }>("/api/tenant-requests/vacate-reasons", {
      method: "GET",
    });

    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    
    // Fallback reasons
    return [
      { id: 1, value: 'Job Change/Relocation', description: 'Changing job or moving to new location' },
      { id: 2, value: 'Personal Reasons', description: 'Personal or family-related reasons' },
      { id: 3, value: 'Financial Issues', description: 'Budget constraints or financial difficulties' },
      { id: 4, value: 'Found Better Accommodation', description: 'Found better or cheaper accommodation' },
      { id: 5, value: 'Completing Studies', description: 'Education completed or leaving the city' },
      { id: 6, value: 'Medical Reasons', description: 'Health-related issues' },
      { id: 7, value: 'Family Reasons', description: 'Family commitments or issues' },
      { id: 8, value: 'Dissatisfied with Services', description: 'Not satisfied with the services provided' }
    ];
  } catch (error) {
    console.error('❌ Error getting vacate reasons:', error);
    return [];
  }
};

// Get leave types from Requests tab
// export const getLeaveTypesFromMasters = async (): Promise<any[]> => {
//   try {
//     const masters = await getMasterValuesByTab('Requests');
    
//     // Try different possible type names for leave types
//     const leaveTypes = masters['Leave Type'] || 
//                        masters['LeaveType'] || 
//                        masters['Leave'] || 
//                        [];
    
//     if (leaveTypes.length > 0) {
//       return leaveTypes;
//     }
    
    
//     // Fallback leave types
//     return [
//       { id: 1, value: 'Personal Leave', description: 'For personal reasons', type_code: 'PERSONAL' },
//       { id: 2, value: 'Vacation', description: 'Annual vacation leave', type_code: 'VACATION' },
//       { id: 3, value: 'Emergency Leave', description: 'Family or personal emergency', type_code: 'EMERGENCY' },
//       { id: 4, value: 'Medical Leave', description: 'Health-related leave', type_code: 'MEDICAL' },
//       { id: 5, value: 'Family Reasons', description: 'Family functions or emergencies', type_code: 'FAMILY' },
//       { id: 6, value: 'Other', description: 'Other reasons not listed', type_code: 'OTHER' }
//     ];
//   } catch (error) {
//     console.error('❌ Error getting leave types from masters:', error);
//     return [];
//   }
// };





// Get maintenance categories from Requests tab
export const getMaintenanceCategoriesFromMasters = async (): Promise<any[]> => {
  try {
    const masters = await getMasterValuesByTab('Requests');
    
    // Try different possible type names for maintenance categories
    const maintenanceCategories = masters['Maintenance Category'] || 
                                  masters['MaintenanceCategory'] || 
                                  masters['Maintenance'] || 
                                  [];
    
    if (maintenanceCategories.length > 0) {
      return maintenanceCategories;
    }
    
    
    // Fallback maintenance categories
    return [
      { id: 1, value: 'Electrical', description: 'Issues with lights, fans, switches, etc.' },
      { id: 2, value: 'Plumbing', description: 'Leaking pipes, clogged drains, faucet issues' },
      { id: 3, value: 'Furniture', description: 'Broken bed, table, chair, wardrobe' },
      { id: 4, value: 'Appliances', description: 'AC, fridge, TV, geyser not working' },
      { id: 5, value: 'Structural', description: 'Wall cracks, paint, flooring issues' },
      { id: 6, value: 'Pest Control', description: 'Insects, rodents, pest infestation' },
      { id: 7, value: 'Internet/WiFi', description: 'Connectivity issues, slow speed' },
      { id: 8, value: 'Other', description: 'Other maintenance issues' }
    ];
  } catch (error) {
    console.error('❌ Error getting maintenance categories from masters:', error);
    return [];
  }
};



// lib/tenantRequestsApi.ts - CORRECTED
export const getComplaintCategories = async (): Promise<ComplaintCategory[]> => {
  try {
    // Call with both tab AND type — this returns ONLY Complaint Category values
    const res = await consumeMasters({ tab: 'Requests', type: 'Complaint Category' });
 
    console.log('🔍 consumeMasters Complaint Category response:', res);
 
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((item: any) => ({
        id:             item.value_id,
        code:           (item.value_name || '').toLowerCase().replace(/\s+/g, '_'),
        name:           item.value_name,
        tab:            item.tab_name,
        is_active:      item.isactive ?? item.is_active ?? 1,
        master_item_id: item.master_item_id,
        description:    item.description || null,
      }));
    }
 
    console.warn('⚠️ No complaint categories from API, using fallback');
    // Hardcoded fallback from your DB (master_item_values rows for item 38)
    return [
      { id: 104, code: 'food',  name: 'Food',  tab: 'Requests', is_active: 1, description: null },
      { id: 105, code: 'room',  name: 'Room',  tab: 'Requests', is_active: 1, description: null },
      { id: 107, code: 'other', name: 'Other', tab: 'Requests', is_active: 1, description: null },
      { id: 109, code: 'staff', name: 'Staff', tab: 'Requests', is_active: 1, description: null },
    ];
  } catch (error) {
    console.error('❌ getComplaintCategories error:', error);
    return [
      { id: 104, code: 'food',  name: 'Food',  tab: 'Requests', is_active: 1, description: null },
      { id: 105, code: 'room',  name: 'Room',  tab: 'Requests', is_active: 1, description: null },
      { id: 107, code: 'other', name: 'Other', tab: 'Requests', is_active: 1, description: null },
      { id: 109, code: 'staff', name: 'Staff', tab: 'Requests', is_active: 1, description: null },
    ];
  }
};

// In lib/tenantRequestsApi.ts, add this function if it doesn't exist
export const getComplaintReasons = async (categoryId: number): Promise<ComplaintReason[]> => {
  try {
    // Map category value_id → master type name for sub-reasons
    // From your DB:
    //   104 = Food  → "Food Reason"  (master item 49)
    //   105 = Room  → "Room Reason"  (master item 39)
    //   109 = Staff → "Staff Reason" (master item 50)
    //   107 = Other → no reasons → show custom input
    const REASON_TYPE: Record<number, string> = {
      104: 'Food Reason',
      105: 'Room Reason',
      109: 'Staff Reason',
    };
 
    const typeName = REASON_TYPE[categoryId];
    console.log(`🔍 getComplaintReasons called: categoryId=${categoryId}, typeName=${typeName}`);
 
    if (!typeName) {
      console.log('ℹ️ No reason type for this category (Other) — show custom input');
      return [];
    }
 
    const res = await consumeMasters({ tab: 'Requests', type: typeName });
    console.log(`🔍 consumeMasters ${typeName} response:`, res);
 
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((item: any) => ({
        id:             item.value_id,
        value:          item.value_name,
        description:    item.description || null,
        master_type_id: item.master_item_id,
        is_active:      item.isactive ?? item.is_active ?? 1,
      }));
    }
 
    console.warn(`⚠️ No reasons returned for ${typeName}`);
    return [];
  } catch (error) {
    console.error(`❌ getComplaintReasons error for categoryId=${categoryId}:`, error);
    return [];
  }
};
 

// Get maintenance locations from Requests tab
export const getMaintenanceLocationsFromMasters = async (): Promise<any[]> => {
  try {
    const masters = await getMasterValuesByTab('Requests');
    
    // Try different possible type names for maintenance locations
    const maintenanceLocations = masters['Maintenance Location'] || 
                                 masters['MaintenanceLocation'] || 
                                 masters['Location'] || 
                                 [];
    
    if (maintenanceLocations.length > 0) {
      return maintenanceLocations;
    }
    
    
    // Fallback maintenance locations
    return [
      { id: 1, value: 'Bedroom', description: 'Inside the bedroom' },
      { id: 2, value: 'Bathroom', description: 'Attached or common bathroom' },
      { id: 3, value: 'Balcony', description: 'Balcony area' },
      { id: 4, value: 'Common Area', description: 'Hallway, living room, common spaces' },
      { id: 5, value: 'Kitchen', description: 'Kitchen area (if applicable)' },
      { id: 6, value: 'Entrance', description: 'Main door, entrance area' },
      { id: 7, value: 'Window', description: 'Window, curtains, blinds' },
      { id: 8, value: 'Other', description: 'Other location' }
    ];
  } catch (error) {
    console.error('❌ Error getting maintenance locations from masters:', error);
    return [];
  }
};

// Get visit time preferences from Requests tab
export const getVisitTimesFromMasters = async (): Promise<any[]> => {
  try {
    const masters = await getMasterValuesByTab('Requests');
    
    // Try different possible type names for visit times
    const visitTimes = masters['Visit Time'] || 
                       masters['VisitTime'] || 
                       masters['Time Slot'] || 
                       masters['TimeSlot'] || 
                       [];
    
    if (visitTimes.length > 0) {
      return visitTimes;
    }
    
    
    // Fallback visit times
    return [
      { id: 1, value: 'Morning (9 AM - 12 PM)', description: 'Morning hours' },
      { id: 2, value: 'Afternoon (12 PM - 3 PM)', description: 'Afternoon hours' },
      { id: 3, value: 'Evening (3 PM - 6 PM)', description: 'Evening hours' },
      { id: 4, value: 'Anytime', description: 'Any time during working hours' }
    ];
  } catch (error) {
    console.error('❌ Error getting visit times from masters:', error);
    return [];
  }
};