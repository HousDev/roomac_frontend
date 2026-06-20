// lib/roomsApi.ts
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
  tenant_rent?: string | number; // Add this
  is_couple?: boolean; // Add this
  security_deposit?: string | number;
  expected_vacate_date?: string | null;
  vacate_status?: string | null;
  pre_assigned_tenant_id?: number | null;
  pre_assigned_rent?: number | null;
  pre_assigned_security_deposit?: number | null;
  pre_assigned_is_couple?: boolean;
}

export type RoomResponse = {
  success: RoomResponse;
  data: any;
  is_available: unknown;
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
  security_deposit?: number;
};

// Add bed assignment API
export interface AssignBedPayload {
  room_id: number;
  bed_number: number;
  tenant_id: number;
  tenant_gender: 'Male' | 'Female' | 'Other';
  tenant_rent?: number | null;
  is_couple?: boolean;
  partner_full_name?: string;
  partner_phone?: string;
  partner_email?: string;
  partner_gender?: string;
  partner_date_of_birth?: string;
  partner_address?: string;
  partner_occupation?: string;
  partner_organization?: string;
  partner_relationship?: string;
}

export interface UpdateBedAssignmentPayload {
  tenant_id?: number | null;
  tenant_gender?: string | null;
  is_available?: boolean;
  tenant_rent?: number | null;
  is_couple?: boolean;
  vacate_reason?: string;
  partner_full_name?: string;
  partner_phone?: string;
  partner_email?: string;
  security_deposit?: number | null; 
  partner_gender?: string;
  partner_date_of_birth?: string;
  partner_address?: string;
  partner_occupation?: string;
  partner_organization?: string;
  partner_relationship?: string;
}

export type BedPayload = {
  room_id: number;
  bed_number: string;
  bed_type: string;
  current_rent: number;
  status: string;
};

export interface ApiResult<T = any> {
  pagination: any;
  success: boolean;
  message: string;
  data?: T;
}

export interface BedAvailability {
  bed_assignment_id: number;
  bed_number: number;
  tenant_rent: number;
  security_deposit: number;
  bed_type: string;
  is_available: boolean;
  current_tenant: string | null;
  vacate_date: string | null;
  vacate_status: string | null;
  availability_status: 'available_now' | 'available_by_checkin' | 'available_after_checkin' | 'not_available';
  is_immediately_available: boolean;
}

export interface RoomAvailability {
  room_id: number;
  room_number: string;
  total_bed: number;
  rent_per_bed: number;
  sharing_type: string;
  room_gender_preference: string[];
  allow_couples: boolean;
  floor: number;
  has_ac: boolean;
  has_attached_bathroom: boolean;
  has_balcony: boolean;
  amenities: string[];
  property_id: number;
  property_name: string;
  beds: BedAvailability[];
}

export interface AvailabilityResponse {
  success: boolean;
  data: RoomAvailability[];
  summary: {
    total_beds: number;
    available_now: number;
    available_by_checkin: number;
    total_available: number;
    check_in_date: string;
  };
  has_enough_beds: boolean;
}

/**
 * Get room availability for a date range
 */
export const getAvailabilityForDateRange = async (params: {
  property_id: number;
  check_in_date?: string;
  number_of_beds?: number;
  gender?: string;
  room_type?: string;
}): Promise<AvailabilityResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.property_id) queryParams.append('property_id', String(params.property_id));
  if (params.check_in_date) queryParams.append('check_in_date', params.check_in_date);
  if (params.number_of_beds) queryParams.append('number_of_beds', String(params.number_of_beds));
  if (params.gender) queryParams.append('gender', params.gender);
  if (params.room_type) queryParams.append('room_type', params.room_type);
  
  const response = await request<AvailabilityResponse>(
    `/api/rooms/availability?${queryParams.toString()}`,
    { method: 'GET' }
  );
  
  return response;
};

/**
 * Get availability summary
 */
export const getAvailabilitySummary = async (params: {
  property_id?: number;
  start_date?: string;
  end_date?: string;
}) => {
  const queryParams = new URLSearchParams();
  
  if (params.property_id) queryParams.append('property_id', String(params.property_id));
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  
  const response = await request(
    `/api/rooms/availability-summary?${queryParams.toString()}`,
    { method: 'GET' }
  );
  
  return response;
};


export const preAssignTenant = async (
  bedAssignmentId: number,
  data: { tenant_id: number; rent?: number; security_deposit?: number; is_couple?: boolean }
) => {
  return request(`/api/rooms/bed-assignments/${bedAssignmentId}/pre-assign`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const cancelPreAssignment = async (bedAssignmentId: number) => {
  return request(`/api/rooms/bed-assignments/${bedAssignmentId}/pre-assign`, {
    method: 'DELETE',
  });
};


export const getBedAssignments = async (params?: { room_id?: number; bed_id?: number; is_available?: boolean }) => {
  const queryParams = new URLSearchParams();
  if (params?.room_id) queryParams.append('room_id', String(params.room_id));
  if (params?.bed_id) queryParams.append('bed_id', String(params.bed_id));
  if (params?.is_available !== undefined) queryParams.append('is_available', String(params.is_available));
  
  const url = `/api/rooms/bed-assignments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await request<ApiResult<any>>(url, { method: 'GET' });
  return response;
};

/* ---------- ROOMS ---------- */

// In roomsApi.ts
export const listRoomsByProperty = (propertyId: number) => {
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




// In lib/roomsApi.ts - Update assignBed function
export const assignBed = async (data: AssignBedPayload): Promise<ApiResult<any>> => {
  try {
    const result = await request<ApiResult<any>>("/api/rooms/assign-bed", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result;
  } catch (error: any) {
    console.error('❌ Assign bed error:', error);
    return {
      success: false,
      message: error.message || 'Failed to assign bed'
    };
  }
};



// In lib/roomsApi.ts - Update updateBedAssignment function
export const updateBedAssignment = async (bedId: string, data: UpdateBedAssignmentPayload): Promise<ApiResult<any>> => {
  try {
    const result = await request<ApiResult<any>>(`/api/rooms/bed-assignments/${bedId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return result;
  } catch (error: any) {
    console.error('❌ Update bed error:', error);
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
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
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

// Add these functions to your existing roomsApi.ts

// Bulk update rooms
export const bulkUpdateRooms = async (roomIds: string[], action: 'activate' | 'inactivate' | 'delete') => {
  return request<ApiResult<any>>("/api/rooms/bulk-update", {
    method: "POST",
    body: JSON.stringify({ room_ids: roomIds, action }),
  });
};

// Get filter data
export const getFilterData = async () => {
  return request<ApiResult<any>>("/api/rooms/filters/data", {
    method: "GET",
  });
};


export const getFilteredRooms = async (filters: any) => {
  // Use the request function which automatically adds the auth token
  return request<ApiResult<any>>("/api/rooms/filter", {
    method: "POST",
    body: JSON.stringify(filters),
  });
};



