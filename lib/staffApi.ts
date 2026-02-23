// lib/staffApi.ts
import { request } from "./api";

/* ================= TYPES ================= */
export interface StaffMember {
  id: number;
  salutation: string;
  name: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  is_whatsapp_same: boolean;
  role: string;
  salary: number;
  department: string;
  joining_date: string;
  blood_group: string;
  aadhar_number: string;
  pan_number: string;
  current_address: string;
  permanent_address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  bank_account_holder_name: string;
  bank_account_number: string;
  bank_name: string;
  bank_ifsc_code: string;
  upi_id: string;
  aadhar_document_url: string;
  pan_document_url: string;
  photo_url: string;
  is_active: boolean;
  employee_id: string;
  assigned_requests: number;
  created_at: string;
  updated_at: string;
}

export interface StaffFormData {
  // Personal Information
  salutation: string;
  name: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  is_whatsapp_same: boolean | number;
  blood_group: string;
  
  // KYC Details
  aadhar_number?: string;
  pan_number?: string;
  
  // Job Information
  role: string;
  employee_id?: string;
  salary: string | number;
  department?: string;
  joining_date: string;
  
  // Address Details
  current_address?: string;
  permanent_address?: string;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  
  // Bank Details
  bank_account_number?: string;
  bank_account_holder_name?: string;
  bank_name?: string;
  bank_ifsc_code?: string;
  upi_id?: string;
  
  // Document URLs (for display/update)
  aadhar_document_url?: string;
  pan_document_url?: string;
  photo_url?: string;
  
  // Status
  is_active?: boolean | number;
  
  // Files (for upload)
  aadhar_document?: File;
  pan_document?: File;
  photo?: File;
}

/* ================= API FUNCTIONS ================= */

/* ================= GET ALL STAFF ================= */
export const getAllStaff = async (): Promise<StaffMember[]> => {
  try {
    const response = await request("/api/staff", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (response.success) {
      return response.data || [];
    }
    
    console.warn("Unexpected response format from getAllStaff:", response);
    return [];
  } catch (error) {
    console.error("Error in getAllStaff:", error);
    throw new Error("Failed to fetch staff data");
  }
};

/* ================= ADD STAFF (with file upload) ================= */
export const addStaff = async (data: FormData): Promise<any> => {
  try {
    return await request("/api/staff", {
      method: "POST",
      body: data,
    }, true);
  } catch (error) {
    console.error("Error in addStaff:", error);
    throw error;
  }
};

/* ================= UPDATE STAFF (with file upload) ================= */
export const updateStaff = async (id: number, data: FormData): Promise<any> => {
  try {
    return await request(`/api/staff/${id}`, {
      method: "PUT",
      body: data,
    }, true);
  } catch (error) {
    console.error("Error in updateStaff:", error);
    throw error;
  }
};

/* ================= DELETE STAFF ================= */
export const deleteStaff = async (id: number): Promise<any> => {
  try {
    return await request(`/api/staff/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in deleteStaff:", error);
    throw error;
  }
};

/* ================= DELETE SPECIFIC DOCUMENT ================= */
export const deleteStaffDocument = async (id: number, documentType: string): Promise<any> => {
  try {
    return await request(`/api/staff/${id}/document`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documentType }),
    });
  } catch (error) {
    console.error("Error in deleteStaffDocument:", error);
    throw error;
  }
};

/* ================= Helper function to create FormData from object ================= */
export const createStaffFormData = (data: any): FormData => {
  const formData = new FormData();
  
  // Add all non-file fields
  const fields = [
    'salutation', 'name', 'email', 'phone', 'whatsapp_number', 'is_whatsapp_same',
    'blood_group', 'aadhar_number', 'pan_number', 'role', 'employee_id', 'salary',
    'department', 'joining_date', 'current_address', 'permanent_address',
    'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
    'bank_account_holder_name', 'bank_account_number', 'bank_name', 'bank_ifsc_code',
    'upi_id', 'aadhar_document_url', 'pan_document_url', 'photo_url', 'is_active'
  ];
  
  fields.forEach(field => {
    const value = data[field];
    if (value !== null && value !== undefined && value !== '') {
      formData.append(field, value.toString());
    }
  });
  
  // Handle file uploads
  if (data.aadhar_document instanceof File) {
    formData.append('aadhar_document', data.aadhar_document);
  }
  
  if (data.pan_document instanceof File) {
    formData.append('pan_document', data.pan_document);
  }
  
  if (data.photo instanceof File) {
    formData.append('photo', data.photo);
  }
  
  return formData;
};

/* ================= Toggle staff active status ================= */
export const toggleStaffActive = async (id: number, isActive: boolean): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('is_active', isActive.toString());
    
    return await request(`/api/staff/${id}`, {
      method: "PUT",
      body: formData,
    }, true);
  } catch (error) {
    console.error("Error in toggleStaffActive:", error);
    throw error;
  }
};