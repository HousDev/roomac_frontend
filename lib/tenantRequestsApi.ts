// lib/tenantRequestsApi.ts - UPDATED VERSION
import { request} from "./api";
import { getTenantToken } from "./tenantAuthApi";
import { tenantApiRequest } from "./tenantApiHelper"; 
import { getActiveMasterValuesByCode } from "./masterApi";

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
    | "leave"
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
  leave_data?: {
    leave_type: string;
    leave_start_date: string;
    leave_end_date: string;
    total_days: number;
    contact_address_during_leave?: string;
    emergency_contact_number?: string;
    room_locked?: boolean;
    keys_submitted?: boolean;
    created_at?: string;
  };
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

/* =========================================================
   GET MY TENANT REQUESTS - FIXED WITH MANUAL TOKEN PASSING
========================================================= */
// export const getMyTenantRequests = async (): Promise<TenantRequest[]> => {
//   try {
//     console.log('🔄 Getting tenant requests...');
    
//     // Get token from tenantAuthApi.ts
//     const token = getTenantToken();
//     console.log('🔑 Token status:', token ? 'Token exists' : 'No token found');
    
//     if (!token) {
//       console.error('❌ No authentication token found');
//       throw new Error("No authentication token found. Please login again.");
//     }

//     console.log('📡 Making request to /api/tenant-requests...');
    
//     // Pass token manually in headers
//     const res = await request<{
//       success: boolean;
//       data: TenantRequest[];
//     }>("/api/tenant-requests", {
//       method: "GET",
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     });

//     console.log('📊 Tenant requests response:', res);

//     if (!res.success || !Array.isArray(res.data)) {
//       console.warn('⚠️ No valid data in response:', res);
//       return [];
//     }

//     console.log(`✅ Found ${res.data.length} tenant requests`);
//     return res.data;
//   } catch (error: any) {
//     console.error('❌ Error getting tenant requests:', error);
    
//     // Check if it's a 401 error
//     if (error.message.includes('401') || error.message.includes('Unauthorized')) {
//       console.error('🔐 Authentication failed. Token might be invalid or expired.');
//       throw new Error('Authentication failed. Please login again.');
//     }
    
//     throw error;
//   }
// };

export const getMyTenantRequests = async (): Promise<TenantRequest[]> => {
  try {
    console.log('🔵 Getting tenant requests via tenantApiRequest...');
    
    const res = await tenantApiRequest<{
      success: boolean;
      data: TenantRequest[];
      message?: string;
    }>("/api/tenant-requests", {
      method: "GET",
    });

    console.log('📊 Tenant requests response:', {
      success: res.success,
      dataLength: res.data?.length || 0
    });

    if (!res.success) {
      console.error('❌ API returned failure:', res);
      throw new Error(res.message || "Failed to get tenant requests");
    }

    if (!Array.isArray(res.data)) {
      console.warn('⚠️ No valid data array in response:', res);
      return [];
    }

    console.log(`✅ Found ${res.data.length} tenant requests`);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error getting tenant requests:', error);
    throw error;
  }
};

/* =========================================================
   CREATE TENANT REQUEST - FIXED
========================================================= */
// export async function createTenantRequest(data: any) {
//   try {
//     console.log('🔄 Creating tenant request...', data);
    
//     // Get token from tenantAuthApi.ts
//     const token = getTenantToken();
    
//     if (!token) {
//       throw new Error("No authentication token found. Please login again.");
//     }
    
//     const res = await request<{
//       success: boolean;
//       message?: string;
//       data?: any;
//     }>("/api/tenant-requests", {
//       method: "POST",
//       headers: {
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify(data),
//     });

//     if (!res.success) {
//       console.error('❌ Create request failed:', res);
//       throw new Error(res.message || "Failed to create request");
//     }

//     console.log('✅ Request created successfully:', res);
//     return res;
//   } catch (error: any) {
//     console.error('❌ Error creating tenant request:', error);
    
//     // Handle specific error cases
//     if (error.message.includes('lock-in period penalty')) {
//       throw new Error('You must agree to the lock-in period penalty.');
//     } else if (error.message.includes('notice period penalty')) {
//       throw new Error('You must agree to the notice period penalty.');
//     }
    
//     throw error;
//   }
// }

// export const getMyTenantRequests = async (): Promise<TenantRequest[]> => {
//   try {
//     console.log('🔄 Getting tenant requests...');
    
//     const token = getTenantToken();
//     console.log('🔑 Token status:', token ? 'Token exists' : 'No token found');
    
//     if (!token) {
//       console.error('❌ No authentication token found');
//       throw new Error("No authentication token found. Please login again.");
//     }

//     console.log('📡 Making request to /api/tenant-requests...');
    
//     // Try with fetch directly to get the raw response
//     const response = await fetch('http://localhost:3001/api/tenant-requests', {
//       method: "GET",
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     // Get the raw text first
//     const text = await response.text();
//     console.log('📊 Raw response text (first 500 chars):', text.substring(0, 500));

//     try {
//       // Try to parse it as JSON
//       const res = JSON.parse(text);
      
//       console.log('📊 Tenant requests response:', {
//         success: res.success,
//         dataLength: res.data?.length || 0
//       });

//       if (!res.success) {
//         console.error('❌ API returned failure:', res);
//         throw new Error(res.message || "Failed to get tenant requests");
//       }

//       if (!Array.isArray(res.data)) {
//         console.warn('⚠️ No valid data array in response:', res);
//         return [];
//       }

//       console.log(`✅ Found ${res.data.length} tenant requests`);
      
//       // Log all vacate_bed requests for debugging
//       const vacateRequests = res.data.filter(r => r.request_type === 'vacate_bed');
//       console.log(`📋 Found ${vacateRequests.length} vacate_bed requests:`, vacateRequests);
      
//       return res.data;
      
//     } catch (parseError) {
//       console.error('❌ Error parsing JSON response:', parseError);
//       console.error('Raw response that failed to parse:', text);
//       throw new Error('Failed to parse server response');
//     }
    
//   } catch (error: any) {
//     console.error('❌ Error getting tenant requests:', error);
    
//     // Check if it's a 401 error
//     if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
//       console.error('🔐 Authentication failed. Token might be invalid or expired.');
//       throw new Error('Authentication failed. Please login again.');
//     }
    
//     throw error;
//   }
// };

// export async function createTenantRequest(data: any) {
//   try {
//     console.log('🔄 Creating tenant request...', data);
    
//     const token = getTenantToken();
    
//     if (!token) {
//       throw new Error("No authentication token found. Please login again.");
//     }
    
//     const res = await request<{
//       success: boolean;
//       message?: string;
//       code?: string;
//       data?: any;
//     }>("/api/tenant-requests", {
//       method: "POST",
//       headers: {
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify(data),
//     });

//     // Handle duplicate request error
//     if (res.code === 'DUPLICATE_VACATE_REQUEST') {
//       throw new Error(res.message || "You already have a pending vacate request.");
//     }

//     if (!res.success) {
//       console.error('❌ Create request failed:', res);
//       throw new Error(res.message || "Failed to create request");
//     }

//     console.log('✅ Request created successfully:', res);
//     return res;
//   } catch (error: any) {
//     console.error('❌ Error creating tenant request:', error);
    
//     // Handle specific error cases
//     if (error.message.includes('lock-in period penalty')) {
//       throw new Error('You must agree to the lock-in period penalty.');
//     } else if (error.message.includes('notice period penalty')) {
//       throw new Error('You must agree to the notice period penalty.');
//     } else if (error.message.includes('already have a pending')) {
//       throw error; // Pass through the duplicate request error
//     }
    
//     throw error;
//   }
// }

export async function createTenantRequest(data: any) {
  try {
    console.log('🔵 Creating tenant request via tenantApiRequest...', data);
    
    const res = await tenantApiRequest<{
      success: boolean;
      message?: string;
      code?: string;
      data?: any;
    }>("/api/tenant-requests", {
      method: "POST",
      body: JSON.stringify(data),
    });

    console.log('📊 Create request response:', res);

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

    console.log('✅ Request created successfully:', res);
    return res.data;
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

// Add to lib/tenantRequestsApi.ts
export const getMyVacateRequests = async (): Promise<TenantRequest[]> => {
  try {
    console.log('🔄 Getting vacate bed requests...');
    
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

    console.log(`✅ Found ${vacateRequests.length} vacate bed requests`);
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
  const adminToken = localStorage.getItem('admin_token');
  const genericToken = localStorage.getItem('token');
  const sessionAdminToken = sessionStorage.getItem('admin_token');
  const sessionGenericToken = sessionStorage.getItem('token');
  
  // Priority: admin_token > token > session_admin_token > session_token
  const token = adminToken || genericToken || sessionAdminToken || sessionGenericToken;
  
  if (!token) {
    console.error('❌ No authentication token found in storage');
    console.log('Available localStorage keys:', Object.keys(localStorage));
    console.log('Available sessionStorage keys:', Object.keys(sessionStorage));
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 100);
    }
    
    throw new Error('Admin authentication required. Please login.');
  }
  
  console.log('🔑 Token found:', token.substring(0, 20) + '...');
  
  // Log token details for debugging
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('📝 Token info:', {
        type: payload.type || 'unknown',
        email: payload.email || 'no email',
        exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'no expiration'
      });
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
    console.log('🔵 Fetching admin vacate requests...');
    
    const token = getAdminToken();
    
    const res = await request<AdminVacateRequestsResponse>("/api/admin/vacate-requests", {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Admin vacate requests response:', {
      success: res.success,
      dataLength: res.data?.length || 0
    });

    if (!res.success) {
      console.error('❌ API returned failure:', res);
      throw new Error("Failed to get vacate requests");
    }

    if (!Array.isArray(res.data)) {
      console.warn('⚠️ No valid data array in response:', res);
      return [];
    }

    console.log(`✅ Found ${res.data.length} vacate requests`);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error getting admin vacate requests:', error);
    
    // Check if it's an auth error
    if (error.message?.includes('401') || error.message?.includes('authentication')) {
      console.error('🔒 Authentication error - redirecting to login');
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
    
    throw error;
  }
};

// Update getPropertiesList function to use existing property routes:
export const getPropertiesList = async (): Promise<Property[]> => {
  try {
    console.log('🔵 Fetching properties list...');
    
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

    console.log('📊 Properties list response:', {
      success: res.success,
      dataLength: res.data?.length || 0
    });

    if (!res.success || !Array.isArray(res.data)) {
      console.warn('⚠️ No valid data in response:', res);
      return [];
    }

    console.log(`✅ Found ${res.data.length} properties`);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error getting properties list:', error);
    return [];
  }
};

export const getMasterValues = async (code: string): Promise<any[]> => {
  try {
    console.log(`🔵 Fetching master values for code: ${code}`);
    
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
      console.log(`✅ Found ${res.data.length} master values for ${code}`);
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
  
  console.log('🔍 Checking authentication status:');
  console.log('admin_token:', localStorage.getItem('admin_token'));
  console.log('token:', localStorage.getItem('token'));
  console.log('admin_email:', localStorage.getItem('admin_email'));
  console.log('admin_logged_in:', localStorage.getItem('admin_logged_in'));
  
  // Try to get token
  try {
    const token = localStorage.getItem('admin_token');
    if (token) {
      console.log('✅ Token found, length:', token.length);
      console.log('Token starts with:', token.substring(0, 20));
      
      // Try to decode JWT to check expiration
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('📝 Token payload:', {
          id: payload.adminId,
          email: payload.email,
          exp: payload.exp,
          expDate: payload.exp ? new Date(payload.exp * 1000) : 'No expiration',
          type: payload.type
        });
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
    console.log(`🔵 Updating vacate request ${requestId} status to ${payload.status}`);
    
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

    console.log('📊 Status update response:', res);

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
    console.log(`🔵 Sending notification to tenant ${data.user_id}`);
    
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
export const getTenantContractDetails = async (): Promise<{
  tenantDetails: any;
  lockinInfo: any;
  noticeInfo: any;
}> => {
  try {
    const res = await tenantApiRequest<{
      message: string;
      success: boolean;
      data: any;
    }>("/api/tenant-requests/contract-details", {
      method: "GET",
    });

    if (!res.success) {
      throw new Error(res.message || "Failed to get contract details");
    }

    return res.data;
  } catch (error: any) {
    console.error('❌ Error getting tenant contract details:', error);
    throw error;
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

// Get change bed reasons
export const getChangeBedReasons = async (): Promise<ChangeReason[]> => {
  try {
    const res = await tenantApiRequest<{
      success: boolean;
      data: ChangeReason[];
    }>("/api/tenant-requests/change-reasons", {
      method: "GET",
    });

    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    
    // Fallback reasons
    return [
      { id: 1, value: 'Need larger room', description: 'Need more space', display_order: 1, is_active: true, reason_code: 'LARGER_ROOM' },
      { id: 2, value: 'Need smaller room', description: 'Want to reduce rent', display_order: 2, is_active: true, reason_code: 'SMALLER_ROOM' },
      { id: 3, value: 'Roommate issues', description: 'Issues with current roommates', display_order: 3, is_active: true, reason_code: 'ROOMMATE_ISSUES' },
      { id: 4, value: 'Noise concerns', description: 'Too much noise in current room', display_order: 4, is_active: true, reason_code: 'NOISE_CONCERNS' },
      { id: 5, value: 'Medical reasons', description: 'Health-related requirements', display_order: 5, is_active: true, reason_code: 'MEDICAL' },
      { id: 6, value: 'Privacy concerns', description: 'Need more privacy', display_order: 6, is_active: true, reason_code: 'PRIVACY' },
      { id: 7, value: 'Change floor', description: 'Prefer different floor', display_order: 7, is_active: true, reason_code: 'CHANGE_FLOOR' },
      { id: 8, value: 'Other personal reasons', description: 'Other personal requirements', display_order: 8, is_active: true, reason_code: 'OTHER' }
    ];
  } catch (error) {
    console.error('❌ Error getting change bed reasons:', error);
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
            console.log('Available beds API response:', result); // Add logging
            
            if (result.success && Array.isArray(result.data)) {
                // Extract bed numbers from the objects
                const bedNumbers = result.data.map((bed: any) => {
                    // Check different possible property names
                    return bed.bed_number || bed.bedNumber || bed.number || bed.id;
                }).filter((bedNumber: any) => typeof bedNumber === 'number');
                
                console.log('Extracted bed numbers:', bedNumbers);
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

// Get leave types
export const getLeaveTypes = async (): Promise<LeaveType[]> => {
  try {
    const res = await tenantApiRequest<{
      success: boolean;
      data: LeaveType[];
    }>("/api/tenant-requests/leave-types", {
      method: "GET",
    });

    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    
    // Fallback leave types
    return [
      { id: 1, value: 'Personal Leave', description: 'For personal reasons', display_order: 1, is_active: true, type_code: 'PERSONAL' },
      { id: 2, value: 'Vacation', description: 'Annual vacation leave', display_order: 2, is_active: true, type_code: 'VACATION' },
      { id: 3, value: 'Emergency Leave', description: 'Family or personal emergency', display_order: 3, is_active: true, type_code: 'EMERGENCY' },
      { id: 4, value: 'Medical Leave', description: 'Health-related leave', display_order: 4, is_active: true, type_code: 'MEDICAL' },
      { id: 5, value: 'Family Reasons', description: 'Family functions or emergencies', display_order: 5, is_active: true, type_code: 'FAMILY' },
      { id: 6, value: 'Other', description: 'Other reasons not listed', display_order: 6, is_active: true, type_code: 'OTHER' }
    ];
  } catch (error) {
    console.error('❌ Error getting leave types:', error);
    return [];
  }
};

// lib/tenantRequestsApi.ts - CORRECTED
export const getComplaintCategories = async (): Promise<ComplaintCategory[]> => {
  try {
    console.log('🔍 Fetching complaint categories...');
    
    const response = await tenantApiRequest("/api/tenant-requests/complaint-categories", {
      method: "GET",
    });

    console.log('📊 Complaint categories response:', response);
    
    // Check if response is an object with data property
    if (response && typeof response === 'object') {
      if (response.success && Array.isArray(response.data)) {
        console.log(`✅ Found ${response.data.length} complaint categories`);
        return response.data;
      }
      // If backend returns array directly (not wrapped in success/data)
      else if (Array.isArray(response)) {
        console.log(`✅ Found ${response.length} complaint categories (direct array)`);
        return response;
      }
    }
    
    console.warn('⚠️ No complaint categories found in response');
    return [];
  } catch (error) {
    console.error('❌ Error getting complaint categories:', error);
    return [];
  }
};

// In lib/tenantRequestsApi.ts, add this function if it doesn't exist
export const getComplaintReasons = async (categoryId: number): Promise<ComplaintReason[]> => {
  try {
    console.log(`🔍 Fetching complaint reasons for category ID: ${categoryId}`);
    
    const response = await tenantApiRequest(`/api/tenant-requests/complaint-categories/${categoryId}/reasons`, {
      method: "GET",
    });

    console.log('📊 Complaint reasons response:', response);
    
    // Check if response is an object with data property
    if (response && typeof response === 'object') {
      if (response.success && Array.isArray(response.data)) {
        console.log(`✅ Found ${response.data.length} complaint reasons for category ${categoryId}`);
        return response.data;
      }
      // If backend returns array directly (not wrapped in success/data)
      else if (Array.isArray(response)) {
        console.log(`✅ Found ${response.length} complaint reasons for category ${categoryId} (direct array)`);
        return response;
      }
    }
    
    console.warn(`⚠️ No complaint reasons found for category ${categoryId}`);
    return [];
  } catch (error) {
    console.error(`❌ Error getting complaint reasons for category ${categoryId}:`, error);
    return [];
  }
};