// import { getTenantToken, getTenantId } from './tenantAuthApi';

// const API_BASE_URL = 'http://localhost:3001/api/tenant-details';

// // Common headers
// const getHeaders = () => {
//   const token = getTenantToken();
//   return {
//     'Content-Type': 'application/json',
//     ...(token ? { 'Authorization': `Bearer ${token}` } : {})
//   };
// };

// // Handle API errors
// const handleResponse = async (response: Response) => {
//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}));
//     throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//   }
//   return response.json();
// };

// // Tenant Profile API
// export const tenantDetailsApi = {
//   // Get profile (authenticated)
//   async getProfile() {
//     try {
//       const response = await fetch(`${API_BASE_URL}/profile`, {
//         method: 'GET',
//         headers: getHeaders()
//       });
//       return await handleResponse(response);
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//       throw error;
//     }
//   },

//   // Get profile by ID (for admin or fallback)
//   async getProfileById(tenantId: string) {
//     try {
//       const response = await fetch(`${API_BASE_URL}/profile/${tenantId}`, {
//         method: 'GET',
//         headers: getHeaders()
//       });
//       return await handleResponse(response);
//     } catch (error) {
//       console.error('Error fetching profile by ID:', error);
//       throw error;
//     }
//   },

//   // Update profile
//   async updateProfile(updateData: any) {
//     try {
//       const response = await fetch(`${API_BASE_URL}/profile`, {
//         method: 'PATCH',
//         headers: getHeaders(),
//         body: JSON.stringify(updateData)
//       });
//       console.log('Update profile response status:', response.status);
      
//       return await handleResponse(response);
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       throw error;
//     }
//   },

//   // Get documents
//   async getDocuments() {
//     try {
//       const response = await fetch(`${API_BASE_URL}/documents`, {
//         method: 'GET',
//         headers: getHeaders()
//       });
//       return await handleResponse(response);
//     } catch (error) {
//       console.error('Error fetching documents:', error);
//       throw error;
//     }
//   },

//   // Test API connection
//   async testConnection() {
//     try {
//       const response = await fetch(`${API_BASE_URL}/test`, {
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' }
//       });
//       return await handleResponse(response);
//     } catch (error) {
//       console.error('Error testing connection:', error);
//       throw error;
//     }
//   },

//   // Smart profile loader (tries authenticated, falls back to ID)
//   async loadProfile() {
//     try {
//       // Test connection first
//       await this.testConnection();
//       console.log('✅ Backend connection successful');

//       const tenantId = getTenantId();
//       const token = getTenantToken();

//       if (!tenantId || !token) {
//         throw new Error('Not authenticated');
//       }

//       // First try authenticated endpoint
//       try {
//         console.log('🔍 Trying authenticated profile endpoint...');
//         const result = await this.getProfile();
//         console.log('✅ Profile loaded via authenticated endpoint');
//         return result;
//       } catch (authError) {
//         console.log('⚠️ Authenticated endpoint failed, trying ID-based endpoint...');
        
//         // Fallback to ID-based endpoint
//         const result = await this.getProfileById(tenantId);
//         console.log('✅ Profile loaded via ID-based endpoint');
//         return result;
//       }
//     } catch (error) {
//       console.error('❌ Failed to load profile:', error);
//       throw error;
//     }
//   }
// };

// export interface TenantProfile {
//   name: string;
//   // Personal Information
//   id: number;
//   full_name: string;
//   email: string;
//   phone: string;
//   country_code: string;
//   date_of_birth: string;
//   gender: 'Male' | 'Female' | 'Other' | string;
//   occupation: string;
//   occupation_category: 'Service' | 'Business' | 'Student' | 'Other' | string;
//   exact_occupation: string;
  
//   // Status flags
//   is_active: boolean;
//   portal_access_enabled: boolean;
  
//   // Address Information
//   address: string;
//   city: string;
//   state: string;
//   pincode: string;
  
//   // Documents
//   id_proof_url: string;
//   address_proof_url: string;
//   photo_url: string;
  
//   // Preferences
//   preferred_sharing: 'single' | 'double' | 'triple' | string;
//   preferred_room_type: string;
//   preferred_property_id: number | null;
  
//   // Timestamps
//   created_at: string;
//   updated_at: string;
  
//   // Bed Assignment Details
//   room_id: number | null;
//   bed_number: number | null;
//   tenant_gender: string | null;
//   bed_is_available: boolean | null;
//   bed_assigned_at: string | null;
  
//   // Room Details
//   room_number: string | null;
//   floor: string | null;
//   room_type: string | null;
//   rent_per_bed: number | null;
  
//   // Property Details
//   property_name: string | null;
//   property_address: string | null;
//   manager_name: string | null;
//   manager_phone: string | null;
//   manager_email: string | null;
// }

// // For form data
// export interface TenantFormData {
//   full_name: string;
//   phone: string;
//   country_code: string;
//   date_of_birth: string;
//   gender: string;
//   occupation: string;
//   occupation_category: string;
//   exact_occupation: string;
//   address: string;
//   city: string;
//   state: string;
//   pincode: string;
//   preferred_sharing: string;
//   preferred_room_type: string;
// }

// export interface ApiResponse<T = any> {
//   success: boolean;
//   message?: string;
//   data?: T;
// }

// lib/tenantDetailsApi.ts
// import { getTenantToken, getTenantId } from './tenantAuthApi';
// import { request } from '@/lib/api'; // Import from shared api.ts

// const API_BASE_PATH = '/api/tenant-details';

// // Tenant Profile API
// export const tenantDetailsApi = {
//   // Get profile (authenticated)
//   async getProfile() {
//     try {
//       return await request(`${API_BASE_PATH}/profile`);
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//       throw error;
//     }
//   },

//   // Get profile by ID (for admin or fallback)
//   async getProfileById(tenantId: string) {
//     try {
//       return await request(`${API_BASE_PATH}/profile/${tenantId}`);
//     } catch (error) {
//       console.error('Error fetching profile by ID:', error);
//       throw error;
//     }
//   },

//   // Update profile
//   async updateProfile(updateData: any) {
//     try {
//       return await request(`${API_BASE_PATH}/profile`, {
//         method: 'PATCH',
//         body: JSON.stringify(updateData)
//       });
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       throw error;
//     }
//   },

//   // Get documents
//   async getDocuments() {
//     try {
//       return await request(`${API_BASE_PATH}/documents`);
//     } catch (error) {
//       console.error('Error fetching documents:', error);
//       throw error;
//     }
//   },

//   // Test API connection
//   async testConnection() {
//     try {
//       return await request(`${API_BASE_PATH}/test`);
//     } catch (error) {
//       console.error('Error testing connection:', error);
//       throw error;
//     }
//   },

//   // Smart profile loader (tries authenticated, falls back to ID)
//   async loadProfile() {
//     try {
//       // Test connection first
//       await this.testConnection();
//       console.log('✅ Backend connection successful');

//       const tenantId = getTenantId();
//       const token = getTenantToken();

//       if (!tenantId || !token) {
//         throw new Error('Not authenticated');
//       }

//       // First try authenticated endpoint
//       try {
//         console.log('🔍 Trying authenticated profile endpoint...');
//         const result = await this.getProfile();
//         console.log('✅ Profile loaded via authenticated endpoint');
//         return result;
//       } catch (authError) {
//         console.log('⚠️ Authenticated endpoint failed, trying ID-based endpoint...');
        
//         // Fallback to ID-based endpoint
//         const result = await this.getProfileById(tenantId);
//         console.log('✅ Profile loaded via ID-based endpoint');
//         return result;
//       }
//     } catch (error) {
//       console.error('❌ Failed to load profile:', error);
//       throw error;
//     }
//   }
// };



// // Extended Tenant Profile interface with ALL fields
// export interface TenantProfile {
//   // Personal Information
//   id: number;
//   full_name: string;
//   email: string;
//   phone: string;
//   country_code: string;
//   date_of_birth: string;
//   gender: 'Male' | 'Female' | 'Other' | string;
//   occupation: string;
//   occupation_category: 'Service' | 'Business' | 'Student' | 'Other' | string;
//   exact_occupation: string;
  
//   // Status flags
//   is_active: boolean;
//   portal_access_enabled: boolean;
//   has_credentials?: boolean;
  
//   // Address Information
//   address: string;
//   city: string;
//   state: string;
//   pincode: string;
  
//   // Emergency Contact Information (NEW)
//   emergency_contact_name?: string;
//   emergency_contact_phone?: string;
//   emergency_contact_relation?: string;
  
//   // Documents
//   id_proof_url: string;
//   address_proof_url: string;
//   photo_url: string;
  
//   // Additional Documents (NEW)
//   additional_documents?: Array<{
//     filename: string;
//     url: string;
//     uploaded_at?: string;
//   }>;
  
//   // Preferences
//   preferred_sharing: 'single' | 'double' | 'triple' | string;
//   preferred_room_type: string;
//   preferred_property_id: number | null;
  
//   // Timestamps
//   created_at: string;
//   updated_at: string;
  
//   // Bed Assignment Details
//   room_id: number | null;
//   bed_number: number | null;
//   tenant_gender: string | null;
//   bed_is_available: boolean | null;
//   bed_assigned_at: string | null;
  
//   // Room Details
//   room_number: string | null;
//   floor: string | null;
//   room_type: string | null;
//   sharing_type: string | null;
//   rent_per_bed: number | null;
  
//   // Property Details
//   property_id: number | null;
//   property_name: string | null;
//   property_address: string | null;
//   property_city: string | null;
//   property_state: string | null;
  
//   // Property Manager Details (NEW)
//   manager_name?: string;
//   manager_phone?: string;
//   manager_email?: string;
  
//   // Bookings
//   bookings?: Array<{
//     id: number;
//     status: string;
//     monthly_rent: number;
//     start_date: string;
//     end_date: string;
//   }>;
  
//   // Payments
//   payments?: Array<{
//     id: number;
//     amount: number;
//     status: string;
//     payment_date: string;
//     description: string;
//   }>;
// }

// // Extended form data interface
// export interface TenantFormData {
//   full_name: string;
//   phone: string;
//   country_code: string;
//   date_of_birth: string;
//   gender: string;
//   occupation: string;
//   occupation_category: string;
//   exact_occupation: string;
//   address: string;
//   city: string;
//   state: string;
//   pincode: string;
//   preferred_sharing: string;
//   preferred_room_type: string;
//   // Emergency Contact Fields (NEW)
//   emergency_contact_name?: string;
//   emergency_contact_phone?: string;
//   emergency_contact_relation?: string;
// }

// export interface ApiResponse<T = any> {
//   success: boolean;
//   message?: string;
//   data?: T;
// }
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

  console.log('🔐 Tenant API Request to:', path);
  console.log('🔐 Tenant token available:', !!token);
  console.log('🔐 Request method:', options.method || 'GET');
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

  console.log('🔐 Headers:', headers);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    console.log('🔐 Response status:', res.status);
    
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
async loadProfile() {
  try {
    console.log('🚀 Starting profile load...');

    const tenantId = getTenantId();
    const token = getTenantToken();

    console.log('🔑 Tenant ID:', tenantId);

    if (!tenantId) {
      throw new Error('No tenant ID found');
    }

    // Get profile data
    let profileData;
    try {
      console.log('🔍 Trying authenticated profile endpoint...');
      profileData = await this.getProfile();
      console.log('✅ Profile loaded via authenticated endpoint');
    } catch (authError) {
      console.log('⚠️ Authenticated endpoint failed, trying ID-based endpoint...');
      
      try {
        profileData = await this.getProfileById(tenantId);
        console.log('✅ Profile loaded via ID-based endpoint');
      } catch (idError) {
        console.error('❌ Both endpoints failed:', idError);
        throw new Error('Failed to load profile');
      }
    }

    // Get deletion request status
    try {
      const deletionStatus = await this.getDeletionStatus();
      if (deletionStatus.success && deletionStatus.data) {
        profileData.data.deletion_request = deletionStatus.data;
      }
    } catch (error) {
      console.log('⚠️ Failed to fetch deletion status:', error);
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