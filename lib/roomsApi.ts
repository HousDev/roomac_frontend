// import { request } from "@/lib/api";

// /* ---------- TYPES ---------- */
// export type RoomPayload = {
//   property_id: number;
//   room_number: string;
//   sharing_type: string;
//   room_type?: string;
//   total_beds: number;
//   occupied_beds?: number;
//   floor?: number;
//   rent_per_bed: number;
//   has_attached_bathroom?: boolean;
//   has_balcony?: boolean;
//   has_ac?: boolean;
//   amenities?: string[];
//   photo_urls?: { url: string; label?: string }[];
//   is_active?: boolean;
//   video_url?: string | null;
//   video_label?: string;
//   room_gender_preference?: string[];
//   allow_couples?: boolean;
//   description?: string;
// };

// export interface BedAssignment {
//   id: number;
//   room_id: number;
//   bed_number: number;
//   tenant_id: number | null;
//   tenant_gender: string | null;
//   is_available: boolean;
//   created_at: string;
//   updated_at: string;
// }

// export type RoomResponse = {
//   id: number;
//   property_id: number;
//   property_name: string;
//   property_address: string;
//   property_city_id: string;
//   room_number: string;
//   sharing_type: string;
//   room_type: string;
//   total_bed: number;
//   occupied_beds: number;
//   floor: number;
//   rent_per_bed: number;
//   has_attached_bathroom: boolean;
//   has_balcony: boolean;
//   has_ac: boolean;
//   amenities: string[];
//   photo_urls: { url: string; label?: string }[];
//   video_url: string | null;
//   video_label?: string;
//   room_gender_preference: string[];
//   current_occupants_gender: string[];
//   current_genders: string[];
//   allow_couples: boolean;
//   is_active: boolean;
//   description: string;
//   current_occupants_count: number;
//   bed_assignments: BedAssignment[];
//   // created_at?: string;
//   // updated_at?: string;
// };

// // Add bed assignment API
// export interface AssignBedPayload {
//   room_id: number;
//   bed_number: number;
//   tenant_id: number;
//   tenant_gender: 'Male' | 'Female' | 'Other';
// }

// export interface UpdateBedAssignmentPayload {
//   tenant_id?: number | null;
//   tenant_gender?: string | null;
//   is_available?: boolean;
// }

// export type BedPayload = {
//   room_id: number;
//   bed_number: string;
//   bed_type: string;
//   current_rent: number;
//   status: string;
// };
// export interface ApiResult<T = any> {
//   success: boolean;
//   message: string;
//   data?: T;
// };
// /* ---------- ROOMS ---------- */
// export const listRooms = () => {
//   return request<RoomResponse[]>("/api/rooms", {
//     method: "GET",
//   });
// };

// export const getRoomById = (id: string) => {
//   return request<RoomResponse>(`/api/rooms/${id}`, {
//     method: "GET",
//   });
// };

// // Create room with form data for file upload
// export const createRoom = (formData: FormData) => {
//   return request<{ id: number; photo_urls: string[]; video_url?: string }>("/api/rooms", {
//     method: "POST",
//     body: formData,
//   });
// };

// // Update room with form data
// export const updateRoom = (id: string, formData: FormData) => {
//   return request<{ photo_urls: string[]; video_url?: string }>(`/api/rooms/${id}`, {
//     method: "PUT",
//     body: formData,
//   });
// };

// export const deleteRoom = (id: string) => {
//   return request(`/api/rooms/${id}`, {
//     method: "DELETE",
//   });
// };

// /* ---------- PHOTO MANAGEMENT ---------- */
// export const uploadRoomPhotos = (id: string, formData: FormData) => {
//   return request<{ photo_urls: string[] }>(`/api/rooms/${id}/photos`, {
//     method: "POST",
//     body: formData,
//   });
// };

// export const deleteRoomPhotos = (id: string, photos: string[]) => {
//   return request(`/api/rooms/${id}/photos`, {
//     method: "DELETE",
//     body: JSON.stringify({ photos }),
//   });
// };

// /* ---------- PROPERTIES ---------- */
// export const listActiveProperties = () => {
//   return request("/api/properties?is_active=true", {
//     method: "GET",
//   });
// };

// /* ---------- BEDS ---------- */
// export const createBed = (data: BedPayload) => {
//   return request("/api/bed", {
//     method: "POST",
//     body: JSON.stringify(data),
//   });
// };

// export const assignBed = (data: AssignBedPayload) => {
//   return request("/api/rooms/assign-bed", {
//     method: "POST",
//     body: JSON.stringify(data),
//   });
// };

// export const getAvailableBeds = (roomId: string, tenantGender?: string) => {
//   const url = tenantGender 
//     ? `/api/rooms/${roomId}/available-beds?gender=${tenantGender}`
//     : `/api/rooms/${roomId}/available-beds`;
  
//   return request<BedAssignment[]>(url, {
//     method: "GET",
//   });
// };

// export const updateBedAssignment = (bedId: string, data: UpdateBedAssignmentPayload) => {
//   return request(`/api/rooms/bed-assignments/${bedId}`, {
//     method: "PUT",
//     body: JSON.stringify(data),
//   });
// };

// export const assignBed = async (data: AssignBedPayload): Promise<ApiResult<any>> => {
//   console.log('🛏️ assignBed called with data:', data);
  
//   try {
//     // Get the correct token key
//     const token = localStorage.getItem('admin_token');
//     console.log('🔑 Token exists:', !!token);
    
//     const response = await fetch('/api/rooms/assign-bed', {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}` // Use the correct token
//       },
//       body: JSON.stringify(data),
//     });
    
//     console.log('📡 Response status:', response.status);
    
//     // Check if response is JSON
//     const contentType = response.headers.get('content-type');
//     if (!contentType || !contentType.includes('application/json')) {
//       const text = await response.text();
//       console.error('❌ Non-JSON response:', text.substring(0, 200));
//       throw new Error('Server returned non-JSON response');
//     }
    
//     const result = await response.json();
//     console.log('📊 Response data:', result);
    
//     if (!response.ok) {
//       throw new Error(result.message || `HTTP ${response.status}: Failed to assign bed`);
//     }
    
//     return result;
//   } catch (error: any) {
//     console.error('❌ assignBed error:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to assign bed'
//     };
//   }
// };

// export const updateBedAssignment = async (bedId: string, data: UpdateBedAssignmentPayload): Promise<ApiResult<any>> => {
//   try {
//     const token = localStorage.getItem('admin_token'); // Use correct token key
    
//     const response = await fetch(`/api/rooms/bed-assignments/${bedId}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`
//       },
//       body: JSON.stringify(data),
//     });
    
//     const result = await response.json();
    
//     if (!response.ok) {
//       throw new Error(result.message || 'Failed to update bed assignment');
//     }
    
//     return result;
//   } catch (error: any) {
//     console.error('updateBedAssignment error:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to update bed assignment'
//     };
//   }
// };

// export const getAvailableBeds = async (roomId: string, gender?: string): Promise<ApiResult<BedAssignment[]>> => {
//   try {
//     const token = localStorage.getItem('admin_token'); // Use correct token key
    
//     let url = `/api/rooms/${roomId}/available-beds`;
//     if (gender) {
//       url += `?gender=${gender}`;
//     }
    
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`
//       },
//     });
    
//     const result = await response.json();
    
//     if (!response.ok) {
//       throw new Error(result.message || 'Failed to get available beds');
//     }
    
//     return result;
//   } catch (error: any) {
//     console.error('getAvailableBeds error:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to get available beds',
//       data: []
//     };
//   }
// };


import { request } from "@/lib/api";

/* ---------- TYPES ---------- */
export type RoomPayload = {
  property_id: number;
  room_number: string;
  sharing_type: string;
  room_type?: string;
  total_beds: number;
  occupied_beds?: number;
  floor?: number;
  rent_per_bed: number;
  has_attached_bathroom?: boolean;
  has_balcony?: boolean;
  has_ac?: boolean;
  amenities?: string[];
  photo_urls?: { url: string; label?: string }[];
  is_active?: boolean;
  video_url?: string | null;
  video_label?: string;
  room_gender_preference?: string[];
  allow_couples?: boolean;
  description?: string;
};

export interface BedAssignment {
  id: number;
  room_id: number;
  bed_number: number;
  tenant_id: any;
  tenant_gender: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
}

export type RoomResponse = {
  id: number;
  property_id: number;
  property_name: string;
  property_address: string;
  property_city_id: string;
  room_number: string;
  sharing_type: string;
  room_type: string;
  total_bed: number;
  occupied_beds: number;
  floor: number;
  rent_per_bed: number;
  has_attached_bathroom: boolean;
  has_balcony: boolean;
  has_ac: boolean;
  amenities: string[];
  photo_urls: { url: string; label?: string }[];
  video_url: string | null;
  video_label?: string;
  room_gender_preference: any;
  current_occupants_gender: string[];
  current_genders: string[];
  allow_couples: boolean;
  is_active: boolean;
  description: string;
  current_occupants_count: number;
  bed_assignments: BedAssignment[];
};

// Add bed assignment API
export interface AssignBedPayload {
  room_id: number;
  bed_number: number;
  tenant_id: number;
  tenant_gender: 'Male' | 'Female' | 'Other';
}

export interface UpdateBedAssignmentPayload {
  tenant_id?: number | null;
  tenant_gender?: string | null;
  is_available?: boolean;
}

export type BedPayload = {
  room_id: number;
  bed_number: string;
  bed_type: string;
  current_rent: number;
  status: string;
};

export interface ApiResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/* ---------- ROOMS ---------- */

// In roomsApi.ts
export const listRoomsByProperty = (propertyId: number) => {
  console.log(`🌐 Fetching rooms for property ID: ${propertyId}`);
  return request<ApiResult<RoomResponse[]>>(`/api/rooms/property/${propertyId}`, {
    method: "GET",
  });
};


export const listRooms = () => {
  return request<RoomResponse[]>("/api/rooms", {
    method: "GET",
  });
};

export const getRoomById = (id: string) => {
  return request<RoomResponse>(`/api/rooms/${id}`, {
    method: "GET",
  });
};

// Create room with form data for file upload
export const createRoom = (formData: FormData) => {
  return request<{ id: number; photo_urls: string[]; video_url?: string }>("/api/rooms", {
    method: "POST",
    body: formData,
  });
};

// Update room with form data
export const updateRoom = (id: string, formData: FormData) => {
  return request<{ photo_urls: string[]; video_url?: string }>(`/api/rooms/${id}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteRoom = (id: string) => {
  return request(`/api/rooms/${id}`, {
    method: "DELETE",
  });
};

/* ---------- PHOTO MANAGEMENT ---------- */
export const uploadRoomPhotos = (id: string, formData: FormData) => {
  return request<{ photo_urls: string[] }>(`/api/rooms/${id}/photos`, {
    method: "POST",
    body: formData,
  });
};

export const deleteRoomPhotos = (id: string, photos: string[]) => {
  return request(`/api/rooms/${id}/photos`, {
    method: "DELETE",
    body: JSON.stringify({ photos }),
  });
};

/* ---------- PROPERTIES ---------- */
export const listActiveProperties = () => {
  return request("/api/properties?is_active=true", {
    method: "GET",
  });
};


/* ---------- BED ASSIGNMENT FUNCTIONS ---------- */
export const assignBed = async (data: AssignBedPayload): Promise<ApiResult<any>> => {
  try {
    const result = await request<ApiResult<any>>("/api/rooms/assign-bed", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to assign bed'
    };
  }
};

export const updateBedAssignment = async (bedId: string, data: UpdateBedAssignmentPayload): Promise<ApiResult<any>> => {
  try {
    const result = await request<ApiResult<any>>(`/api/rooms/bed-assignments/${bedId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update bed assignment'
    };
  }
};

export const vacateBed = async (bedId: string, reason: string): Promise<ApiResult<any>> => {
  try {
    const result = await request<ApiResult<any>>(`/api/rooms/bed-assignments/${bedId}/vacate`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to vacate bed'
    };
  }
};

export const getAvailableBeds = async (roomId: string, gender?: string): Promise<ApiResult<BedAssignment[]>> => {
  try {
    let url = `/api/rooms/${roomId}/available-beds`;
    if (gender) {
      url += `?gender=${gender}`;
    }
    
    const result = await request<ApiResult<BedAssignment[]>>(url, {
      method: "GET",
    });
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to get available beds',
      data: []
    };
  }
};

export const getRoomBedAssignments = async (roomId: string): Promise<ApiResult<BedAssignment[]>> => {
  try {
    const result = await request<ApiResult<BedAssignment[]>>(`/api/rooms/${roomId}/bed-assignments`, {
      method: "GET",
    });
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to get room bed assignments',
      data: []
    };
  }
};



export function getMediaUrl(url: string, type = 'photo') {
  if (!url || url === 'null' || url === 'undefined') return null;
  
  // If it's already a full URL
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  
  // Use the correct base URL (from your photo URLs)
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  
  // Remove leading slash if present
  if (url.startsWith('/')) {
    url = url.substring(1);
  }
  
  if (type === 'video') {
    // Videos are in /uploads/rooms/videos folder
    // Check if it's already in the correct path
    if (url.includes('uploads/rooms/videos/')) {
      return `${baseUrl}/${url}`;
    } else if (url.includes('uploads/')) {
      // Already has uploads prefix but wrong folder
      return `${baseUrl}/${url.replace('uploads/', 'uploads/rooms/videos/')}`;
    } else {
      // Just filename, add full path
      return `${baseUrl}/uploads/rooms/videos/${url}`;
    }
  }
  
  // For photos - check your existing photos use /uploads/rooms/
  if (url.includes('uploads/rooms/')) {
    return `${baseUrl}/${url}`;
  } else if (url.includes('uploads/')) {
    return `${baseUrl}/${url}`;
  } else {
    return `${baseUrl}/uploads/rooms/${url}`;
  }

}

export const processPhotoUrls = (photoUrls: any)=> {
  if (!photoUrls) return [];
  
  if (Array.isArray(photoUrls)) {
    return photoUrls.map(photo => {
      if (typeof photo === 'string') {
        return { 
          url: getMediaUrl(photo, 'photo'),
          label: 'Room View'
        };
      } else if (photo && typeof photo === 'object') {
        return { 
          url: getMediaUrl(photo.url || '', 'photo'),
          label: photo.label || 'Room View'
        };
      }
      return { url: '', label: 'Room View' };
    }).filter(photo => photo.url);
  }
  
  return [];
};

