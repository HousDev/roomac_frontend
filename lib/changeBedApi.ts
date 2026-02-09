import { request } from '@/lib/api';

/* =======================
   TYPES
======================= */

export interface ChangeReason {
  id: number;
  value: string;
}

export interface CurrentAssignment {
  check_in_date: string;
  assignment_id: number;
  room_id: number;
  bed_number: number;
  tenant_id: number;
  tenant_gender: string;
  room_number: string;
  sharing_type: string;
  total_bed: number;
  occupied_beds: number;
  rent_per_bed: number;
  current_occupants_gender: string[];
  room_gender_preference: string[];
  tenant_name: string;
  property_name: string;
  property_id: number;
  current_occupants: RoomOccupant[];
}

export interface RoomOccupant {
  tenant_id: number;
  full_name: string;
  gender: string;
  bed_number: number;
  assignment_id: number;
  is_available?: boolean;
}

export interface CompatibleRoom {
  id: number;
  room_number: string;
  sharing_type: string;
  total_bed: number;
  occupied_beds: number;
  available_beds: number;
  rent_per_bed: number;
  floor?: string;
  property_name: string;
  property_id: number;
  room_gender_preference: string[];
  occupants_gender: string;
  occupants_count: number;
  current_occupants: RoomOccupant[];
  available_beds_list: Array<{
    bed_number: number;
    assignment_id: number | null;
  }>;
  is_active: boolean;
}

export interface AvailableBed {
  bed_assignment_id: number | null;
  bed_number: number;
  is_available: boolean;
  room_id: number;
  tenant_id: number | null;
  tenant_name: string | null;
  tenant_gender: string | null;
  status: 'available' | 'occupied';
}

export interface BedsResponse {
  room_info: {
    id: number;
    room_number: string;
    total_bed: number;
    occupied_beds: number;
    rent_per_bed: number;
    sharing_type: string;
  };
  beds: AvailableBed[];
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
}

export interface RentDifference {
  old_room_id: number;
  old_room_number: string;
  old_rent: number;
  new_room_id: number;
  new_room_number: string;
  new_rent: number;
  difference: number;
  type: 'increase' | 'decrease' | 'same';
}

export interface ExecuteChangePayload {
  tenantId: number;
  currentAssignmentId: number;
  newRoomId: number;
  newBedNumber: number;
  changeReasonId?: number;
  shiftingDate?: string;
  notes?: string;
}

/* =======================
   API FUNCTIONS
======================= */

/* 1️⃣ CHANGE REASONS */
export const getChangeReasons = async (): Promise<ChangeReason[]> => {
  try {
    const response = await request<{ success: boolean; data: ChangeReason[] }>(
      '/api/change-bed/change-reasons'
    );
    return response.data || [];
  } catch (error) {
    console.error('Error fetching change reasons:', error);
    return [];
  }
};

/* 2️⃣ SHARING TYPES */
export const getSharingTypes = async (): Promise<string[]> => {
  try {
    const response = await request<{ success: boolean; data: string[] }>(
      '/api/change-bed/sharing-types'
    );
    return response.data || [];
  } catch (error) {
    console.error('Error fetching sharing types:', error);
    return ['single', 'double', 'triple'];
  }
};

/* 3️⃣ CURRENT ASSIGNMENT */
export const getCurrentAssignment = async (
  tenantId: number
): Promise<CurrentAssignment | null> => {
  try {
    const response = await request<{ success: boolean; data: CurrentAssignment }>(
      `/api/change-bed/current-assignment/${tenantId}`
    );
    return response.data || null;
  } catch (error) {
    console.error('Error fetching current assignment:', error);
    return null;
  }
};

/* 4️⃣ COMPATIBLE ROOMS */
export const getCompatibleRooms = async (params: {
  tenantId: number;
  sharingType?: string;
  propertyId?: number;
}): Promise<{
  current_assignment: CurrentAssignment | null;
  compatible_rooms: CompatibleRoom[];
  total_rooms_found: number;
} | null> => {
  try {
    const queryParams = new URLSearchParams({
      tenantId: params.tenantId.toString()
    });
    
    if (params.sharingType) queryParams.append('sharingType', params.sharingType);
    if (params.propertyId) queryParams.append('propertyId', params.propertyId.toString());
    
    const response = await request<{ 
      success: boolean; 
      data: {
        current_assignment: CurrentAssignment;
        compatible_rooms: CompatibleRoom[];
        total_rooms_found: number;
      } 
    }>(`/api/change-bed/compatible-rooms?${queryParams.toString()}`);
    
    return response.data || null;
  } catch (error) {
    console.error('Error fetching compatible rooms:', error);
    return null;
  }
};

/* 5️⃣ AVAILABLE BEDS */
export const getAvailableBeds = async (
  roomId: number
): Promise<BedsResponse | null> => {
  try {
    const response = await request<{ 
      success: boolean; 
      data: BedsResponse 
    }>(`/api/change-bed/available-beds?roomId=${roomId}`);
    
    return response.data || null;
  } catch (error) {
    console.error('Error fetching available beds:', error);
    return null;
  }
};

/* 6️⃣ RENT DIFFERENCE */
export const calculateRentDifference = async (
  oldRoomId: number,
  newRoomId: number
): Promise<RentDifference | null> => {
  try {
    const response = await request<{ success: boolean; data: RentDifference }>(
      `/api/change-bed/rent-difference?oldRoomId=${oldRoomId}&newRoomId=${newRoomId}`
    );
    
    return response.data || null;
  } catch (error) {
    console.error('Error calculating rent difference:', error);
    return null;
  }
};

/* 7️⃣ EXECUTE BED CHANGE */
export const executeBedChange = async (
  payload: ExecuteChangePayload
): Promise<{ success: boolean; data?: any; message: string }> => {
  try {
    const response = await request<{ success: boolean; data?: any; message: string }>(
      '/api/change-bed/execute-change',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
    
    return response;
  } catch (error: any) {
    console.error('Error executing bed change:', error);
    return {
      success: false,
      message: error.message || 'Failed to execute bed change'
    };
  }
};