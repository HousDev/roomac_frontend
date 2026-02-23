
// lib/tenantDetailsApi.ts 
import { ReactNode } from 'react';
import { getTenantToken, getTenantId } from './tenantAuthApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const API_BASE_PATH = '/api/tenant-details';

// Update the tenantRequest function in tenantDetailsApi.ts:
async function tenantRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const token = getTenantToken();
  const isFormData = options.body instanceof FormData;

 
  if (options.body) {
    console.log('📦 Request body:', options.body);
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }


  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    
    const text = await res.text();
    console.log('🔐 Response text:', text.substring(0, 500)); // Show first 500 chars
    
    let data: any = {};
    let errorMessage = `API request failed: ${res.status} ${res.statusText}`;

    try {
      if (text) {
        data = JSON.parse(text);
        if (data?.message) {
          errorMessage = data.message;
        }
        if (data?.error) {
          errorMessage = data.error;
        }
      }
    } catch {
      errorMessage = "Invalid JSON response from server";
    }

    if (!res.ok) {
      if (res.status === 401) {
        // Clear tenant tokens on 401
        localStorage.removeItem("tenant_token");
        localStorage.removeItem("tenant_id");
        localStorage.removeItem("tenant_logged_in");
        
        const err: any = new Error("Session expired. Please login again.");
        err.status = res.status;
        err.response = data || text;
        throw err;
      }
      
      if (res.status === 500) {
        console.error('❌ Server 500 error details:', data || text);
        const err: any = new Error(data?.message || data?.error || "Server error occurred. Please try again later.");
        err.status = res.status;
        err.response = data || text;
        err.details = data?.details || data?.stack || null;
        throw err;
      }
      
      const err: any = new Error(errorMessage);
      err.status = res.status;
      err.response = data || text;
      throw err;
    }

    return data as T;
  } catch (error) {
    console.error('Tenant API request error:', error);
    throw error;
  }
}

// Tenant Profile API
export const tenantDetailsApi = {
  async getProfile() {
    try {
      return await tenantRequest(`${API_BASE_PATH}/profile`);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async getProfileById(tenantId: string) {
    try {
      return await tenantRequest(`${API_BASE_PATH}/profile/${tenantId}`);
    } catch (error) {
      console.error('Error fetching profile by ID:', error);
      throw error;
    }
  },

  async updateProfile(updateData: any) {
    try {
      const token = getTenantToken();
      const tenantId = getTenantId();
      
      console.log('🔐 API - Token available:', !!token);
      console.log('👤 API - Tenant ID:', tenantId);
      console.log('📦 API - Update data:', updateData);
      
      return await tenantRequest(`${API_BASE_PATH}/profile`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async getDocuments() {
    try {
      return await tenantRequest(`${API_BASE_PATH}/documents`);
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  async testConnection() {
    try {
      return await tenantRequest(`${API_BASE_PATH}/test`);
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  },

  

  // Update the loadProfile function in tenantDetailsApi
// async loadProfile() {
//   try {
//     console.log('🚀 Starting profile load...');

//     const tenantId = getTenantId();
//     const token = getTenantToken();

//     console.log('🔑 Tenant ID:', tenantId);

//     if (!tenantId) {
//       throw new Error('No tenant ID found');
//     }

//     // Get profile data
//     let profileData;
//     try {
//       profileData = await this.getProfile();
//       console.log('✅ Profile loaded via authenticated endpoint');
//     } catch (authError) {
//       console.log('⚠️ Authenticated endpoint failed, trying ID-based endpoint...');
      
//       try {
//         profileData = await this.getProfileById(tenantId);
//       } catch (idError) {
//         console.error('❌ Both endpoints failed:', idError);
//         throw new Error('Failed to load profile');
//       }
//     }

//     // Get deletion request status
//     try {
//       const deletionStatus = await this.getDeletionStatus();
//       if (deletionStatus.success && deletionStatus.data) {
//         profileData.data.deletion_request = deletionStatus.data;
//       }
//     } catch (error) {
//       profileData.data.deletion_request = {
//         status: 'none'
//       };
//     }

//     return profileData;
//   } catch (error: any) {
//     console.error('❌ Failed to load profile:', error);
    
//     if (error.message?.includes('401') || error.message?.includes('Session expired')) {
//       // Clear tokens and redirect
//       localStorage.removeItem("tenant_token");
//       localStorage.removeItem("tenant_id");
//       localStorage.removeItem("tenant_logged_in");
      
//       // Show toast and redirect after delay
//       setTimeout(() => {
//         if (typeof window !== 'undefined') {
//           window.location.href = '/login';
//         }
//       }, 2000);
//     }
    
//     throw error;
//   }
// },
async loadProfile() {
  try {
    console.log('🚀 Starting profile load...');

    const tenantId = getTenantId();
    const token = getTenantToken();

    console.log('🔑 Tenant ID:', tenantId);
    console.log('🔐 Token exists:', !!token);

    if (!tenantId) {
      console.error('No tenant ID found');
      throw new Error('No tenant ID found');
    }

    if (!token) {
      console.error('No token found');
      throw new Error('No authentication token found');
    }

    // Get profile data
    let profileData;
    try {
      console.log('Attempting to fetch profile via authenticated endpoint...');
      profileData = await this.getProfile();
      console.log('✅ Profile loaded via authenticated endpoint:', profileData);
    } catch (authError) {
      console.log('⚠️ Authenticated endpoint failed, trying ID-based endpoint...', authError);
      
      try {
        profileData = await this.getProfileById(tenantId);
        console.log('✅ Profile loaded via ID-based endpoint:', profileData);
      } catch (idError) {
        console.error('❌ Both endpoints failed:', idError);
        throw new Error('Failed to load profile');
      }
    }

    // Ensure profileData has the expected structure
    if (!profileData) {
      throw new Error('No profile data received');
    }

    // Get deletion request status
    try {
      console.log('Fetching deletion status...');
      const deletionStatus = await this.getDeletionStatus();
      if (deletionStatus.success && deletionStatus.data) {
        profileData.data = profileData.data || {};
        profileData.data.deletion_request = deletionStatus.data;
        console.log('✅ Deletion status added to profile');
      }
    } catch (error) {
      console.warn('Could not fetch deletion status:', error);
      profileData.data = profileData.data || {};
      profileData.data.deletion_request = {
        status: 'none'
      };
    }

    return profileData;
  } catch (error: any) {
    console.error('❌ Failed to load profile:', error);
    
    if (error.message?.includes('401') || error.message?.includes('Session expired')) {
      // Clear tokens and redirect
      localStorage.removeItem("tenant_token");
      localStorage.removeItem("tenant_id");
      localStorage.removeItem("tenant_logged_in");
      
      // Show toast and redirect after delay
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }, 2000);
    }
    
    throw error;
  }
},
// Add this new method for deletion status
  async getDeletionStatus() {
    try {
      const token = getTenantToken();
      if (!token) {
        return { success: false, message: "Not authenticated" };
      }

      const response = await fetch(`${API_BASE_URL}/api/tenant-settings/deletion-status`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle response
      const text = await response.text();
      let data: any = {};
      
      try {
        if (text) {
          data = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('Failed to parse deletion status response:', parseError);
        return {
          success: false,
          message: "Invalid JSON response from server"
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: data?.message || `HTTP ${response.status}: Failed to get deletion status`
        };
      }

      return data;
    } catch (error: any) {
      console.error('Get deletion status error:', error);
      return {
        success: false,
        message: error.message || "Failed to get deletion status",
      };
    }
  },
};



// Types for additional documents
export interface AdditionalDocument {
  filename: string;
  url: string;
  uploaded_at?: string;
  document_type?: string;
}

// Tenant Profile interface
export interface TenantProfile {
  deleted_at: string;
  delete_reason: ReactNode;
  payments: any;
  // Personal Information
  id: number;
  full_name: string;
  salutation?: string;

  email: string;
  phone: string;
  country_code: string;
  date_of_birth: string;
  gender: string;
  occupation: string;
  occupation_category: string;
  exact_occupation: string;
  
  // Status
  is_active: boolean;
  portal_access_enabled: boolean;
  
  // Address
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  
  // Documents
  id_proof_url: string;
  address_proof_url: string;
  photo_url: string;
  
  // Additional Documents
  additional_documents?: AdditionalDocument[];
  
  // Preferences
  preferred_sharing: string;
  preferred_room_type: string;
  preferred_property_id: number | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Bed Assignment
  room_id: number | null;
  bed_number: number | null;
  tenant_gender: string | null;
  is_available: boolean | null;
  bed_assigned_at: string | null;
  
  // Room Details
  room_number: string | null;
  floor: string | null;
  room_type: string | null;
  rent_per_bed: number | null;
   // CONTRACT TERMS - ADD THESE
  check_in_date: string;
  lockin_period_months: number | null;
  lockin_penalty_amount: number | null;
  lockin_penalty_type: string | null;
  notice_period_days: number | null;
  notice_penalty_amount: number | null;
  notice_penalty_type: string | null;
  bed_id: number | null;
  monthly_rent: number | null;
  
  // Property Details
  property_id: number | null;
  property_name: string | null;
  property_address: string | null;
  property_city: string | null;
  property_state: string | null;
  property_manager_name: string | null;
  property_manager_phone: string | null;
  amenities: string | null;
  services: string | null;
  property_photos: string | null;
  property_rules: string | null;
  property_active: boolean | null;
  property_rating: number | null;
  
  // Aliases
  manager_name?: string;
  manager_phone?: string;

  // Add deletion status fields
  deletion_request?: {
    status: 'none' | 'pending' | 'approved' | 'rejected' | 'cancelled';
    reason?: string;
    requested_at?: string;
    reviewed_at?: string;
    reviewed_by?: string;
    review_notes?: string;
  };
}

// Form data interface
export interface TenantFormData {
  full_name: string;
  phone: string;
  country_code: string;
  date_of_birth: string;
  gender: string;
  occupation: string;
  occupation_category: string;
  exact_occupation: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  preferred_sharing: string;
  preferred_room_type: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  email:string
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}