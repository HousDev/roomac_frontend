// lib/staffApi.ts
import { request } from "./api";
import { consumeMasters, getAllMasters } from "./masterApi";

/* ================= TYPES ================= */
export interface StaffMember {
  id: number;
  salutation: string;
  name: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  is_whatsapp_same: boolean;
  role: string | number;
  salary: number;
  department: string | number;
  joining_date: string;
  blood_group: string;
  aadhar_number: string;
  phone_country_code?: string;
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
  role_name?: string;
  department_name?: string;
}

export interface StaffFormData {
  salutation: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  whatsapp_number: string;
  is_whatsapp_same: boolean | number;
  blood_group: string;
  aadhar_number?: string;
  pan_number?: string;
  role: string;
  employee_id?: string;
  salary: string | number;
  department?: string;
  phone_country_code?: string;
  joining_date: string;
  current_address?: string;
  permanent_address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  bank_account_number?: string;
  bank_account_holder_name?: string;
  bank_name?: string;
  bank_ifsc_code?: string;
  upi_id?: string;
  aadhar_document_url?: string;
  pan_document_url?: string;
  photo_url?: string;
  is_active?: boolean | number;
  aadhar_document?: File;
  pan_document?: File;
  photo?: File;
}

/* ================= API FUNCTIONS ================= */

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

export const updateStaff = async (id: number, data: FormData): Promise<any> => {
  try {
    const response = await request(`/api/staff/${id}`, {
      method: "PUT",
      body: data,
    }, true);
    
    return response; // Return the response which contains the updated staff data
  } catch (error) {
    console.error("Error in updateStaff:", error);
    throw error;
  }
};

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

export const deleteStaffDocument = async (id: number, documentType: string): Promise<any> => {
  try {
    const response = await request(`/api/staff/${id}/document`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documentType }),
    });
    
    // console.log("Delete document response:", response);
    
    // Ensure we're returning the data properly
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data
      };
    }
    
    return response;
  } catch (error) {
    console.error("Error in deleteStaffDocument:", error);
    throw error;
  }
};

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

export const createStaffFormData = (data: any): FormData => {
  const formData = new FormData();
  
  const fields = [
    'salutation', 'name', 'email', 'password', 'phone', 'phone_country_code','whatsapp_number', 'is_whatsapp_same',
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

// Fetch roles from masters
export async function fetchRoles() {
  try {
    const response = await consumeMasters({ tab: 'Roles', type: 'Role' });
    
    if (response?.success && Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        id: item.value_id,
        name: item.value_name,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
}

// Fetch departments from masters
export async function fetchDepartments() {
  try {
    const response = await consumeMasters({ tab: 'Departments', type: 'Department' });
    
    if (response?.success && Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        id: item.value_id,
        name: item.value_name,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}

// Export to Excel
import * as XLSX from 'xlsx';

export const exportStaffToExcel = (staff: StaffMember[], filename: string = 'staff-data.xlsx') => {
  try {
    // Transform data for export
    const exportData = staff.map(member => ({
      'Employee ID': member.employee_id || '-',
      'Name': `${member.salutation || ''} ${member.name}`.trim(),
      'Email': member.email,
      'Phone': member.phone,
      'WhatsApp': member.whatsapp_number || '-',
      'Role': member.role_name || member.role,
      'Department': member.department_name || member.department || '-',
      'Salary': member.salary || 0,
      'Blood Group': member.blood_group?.toUpperCase() || '-',
      'Joining Date': new Date(member.joining_date).toLocaleDateString('en-IN'),
      'Current Address': member.current_address || '-',
      'Permanent Address': member.permanent_address || '-',
      'Aadhar Number': member.aadhar_number || '-',
      'PAN Number': member.pan_number || '-',
      'Emergency Contact Name': member.emergency_contact_name || '-',
      'Emergency Contact Phone': member.emergency_contact_phone || '-',
      'Emergency Contact Relation': member.emergency_contact_relation || '-',
      'Bank Account Holder': member.bank_account_holder_name || '-',
      'Bank Account Number': member.bank_account_number || '-',
      'Bank Name': member.bank_name || '-',
      'Bank IFSC': member.bank_ifsc_code || '-',
      'UPI ID': member.upi_id || '-',
      'Status': member.is_active ? 'Active' : 'Inactive',
      'Assigned Requests': member.assigned_requests || 0,
      'Created At': new Date(member.created_at).toLocaleString(),
      'Updated At': new Date(member.updated_at).toLocaleString(),
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns
    const colWidths = [];
    for (let i = 0; i < Object.keys(exportData[0] || {}).length; i++) {
      colWidths.push({ wch: 20 });
    }
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Staff');

    // Save file
    XLSX.writeFile(wb, filename);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};


export const getStaffById = async (id: number): Promise<StaffMember> => {
  try {
    // Add a timestamp to prevent caching
    const response = await request(`/api/staff/${id}?t=${Date.now()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      },
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error("Failed to fetch staff data");
  } catch (error) {
    console.error("Error in getStaffById:", error);
    throw error;
  }
};