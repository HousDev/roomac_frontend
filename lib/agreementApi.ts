// lib/agreementApi.ts
import { request } from "@/lib/api";

// Types based on your model
export interface AgreementMaster {
  id: number;
  name: string;
  property_id: number;
  property_name?: string;
  sharing_type: "single" | "double" | "triple";
  lock_in_months: number;
  lock_in_penalty_amount: number;
  notice_period_days: number;
  notice_penalty_amount: number;
  damage_deduction_allowed: boolean;
  max_damage_deduction: number;
  handover_rules?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateAgreementData {
  name: string;
  property_id: number;
  sharing_type: "single" | "double" | "triple";
  lock_in_months: number;
  lock_in_penalty_amount: number;
  notice_period_days: number;
  notice_penalty_amount: number;
  damage_deduction_allowed: boolean;
  max_damage_deduction?: number;
  handover_rules?: string;
  is_active: boolean;
}

export interface UpdateAgreementData {
  name: string;
  lock_in_months: number;
  lock_in_penalty_amount: number;
  notice_period_days: number;
  notice_penalty_amount: number;
  damage_deduction_allowed: boolean;
  max_damage_deduction?: number;
  handover_rules?: string;
  is_active: boolean;
}

/* ================= AGREEMENT CRUD OPERATIONS ================= */

// Get all agreements with property names
export const getAgreements = () =>
  request<{ success: boolean; data: AgreementMaster[] }>("/api/agreements", {
    method: "GET",
  });

// Create agreement
export const createAgreement = (data: CreateAgreementData) =>
  request<{ success: boolean; message: string; agreement_id: number }>("/api/agreements", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Get agreement by ID
export const getAgreementById = (id: number) =>
  request<{ success: boolean; data: AgreementMaster }>(`/api/agreements/${id}`, {
    method: "GET",
  });

// Update agreement
export const updateAgreement = (id: number, data: UpdateAgreementData) =>
  request<{ success: boolean; message: string }>(`/api/agreements/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Delete agreement
export const deleteAgreement = (id: number) =>
  request<{ success: boolean; message: string }>(`/api/agreements/${id}`, {
    method: "DELETE",
  });

// Get agreement by property and sharing type (for bed assignment/vacate flow)
export const getAgreementByPropertySharing = (property_id: number, sharing_type: string) =>
  request<{ success: boolean; data: AgreementMaster }>(`/api/agreements/by-property-sharing/find?property_id=${property_id}&sharing_type=${sharing_type}`, {
    method: "GET",
  });

// Toggle agreement status (active/inactive)
export const toggleAgreementStatus = (id: number, is_active: boolean) =>
  request<{ success: boolean; message: string }>(`/api/agreements/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ is_active }),
  });

/* ================= PROPERTY OPERATIONS ================= */

// Property interface
export interface Property {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  total_floors?: number;
  is_active: boolean;
  created_at: string;
}

// Get all properties (for dropdowns)
export const getProperties = () =>
  request<{ success: boolean; data: Property[] }>("/api/properties", {
    method: "GET",
  });

// Get property by ID
export const getProperty = (id: number) =>
  request<{ success: boolean; data: Property }>(`/api/properties/${id}`, {
    method: "GET",
  });

/* ================= EXPORT OPERATIONS ================= */

// Export agreements to Excel/CSV
export const exportAgreements = (
  format: 'excel' | 'csv' = 'excel',
  filters?: {
    search?: string;
    status?: 'all' | 'active' | 'inactive';
    sharing_type?: 'all' | 'single' | 'double' | 'triple';
  }
) => {
  const params = new URLSearchParams();
  params.append('format', format);
  if (filters) {
    params.append('filters', JSON.stringify(filters));
  }
  
  return fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/agreements/export?${params}`, {
    method: 'GET',
    headers: {
      'Accept': format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        : 'text/csv',
    },
    credentials: 'include',
  });
};

// Export agreement details including rules
export const exportAgreementDetails = (id: number, format: 'excel' | 'pdf' = 'excel') => {
  const params = new URLSearchParams();
  params.append('format', format);
  
  return fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/agreements/${id}/export?${params}`, {
    method: 'GET',
    headers: {
      'Accept': format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        : 'application/pdf',
    },
    credentials: 'include',
  });
};

/* ================= UTILITY FUNCTIONS ================= */

// Format currency (for penalties)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Get sharing type display name
export const getSharingDisplayName = (type: string): string => {
  const mapping: Record<string, string> = {
    single: 'Single Sharing',
    double: 'Double Sharing',
    triple: 'Triple Sharing'
  };
  return mapping[type] || type;
};

// Get sharing type color
export const getSharingColor = (type: string): string => {
  const colors: Record<string, string> = {
    single: 'from-blue-500 to-cyan-400',
    double: 'from-purple-500 to-pink-400',
    triple: 'from-orange-500 to-amber-400'
  };
  return colors[type] || 'from-gray-500 to-gray-400';
};

// Calculate penalty for early termination
export const calculateEarlyTerminationPenalty = (
  agreement: AgreementMaster,
  monthsRemaining: number,
  noticeDaysGiven: number
): {
  lockInPenalty: number;
  noticePenalty: number;
  totalPenalty: number;
  isValidNotice: boolean;
} => {
  const isValidNotice = noticeDaysGiven >= agreement.notice_period_days;
  
  let lockInPenalty = 0;
  if (monthsRemaining > 0) {
    lockInPenalty = agreement.lock_in_penalty_amount;
  }
  
  let noticePenalty = 0;
  if (!isValidNotice) {
    noticePenalty = agreement.notice_penalty_amount;
  }
  
  return {
    lockInPenalty,
    noticePenalty,
    totalPenalty: lockInPenalty + noticePenalty,
    isValidNotice
  };
};

// Check if agreement is valid for new assignment
export const isAgreementValidForAssignment = (agreement: AgreementMaster): {
  isValid: boolean;
  message?: string;
} => {
  if (!agreement.is_active) {
    return {
      isValid: false,
      message: 'Agreement is inactive'
    };
  }
  
  if (agreement.lock_in_months <= 0) {
    return {
      isValid: false,
      message: 'Lock-in period must be greater than 0'
    };
  }
  
  if (agreement.lock_in_penalty_amount < 0) {
    return {
      isValid: false,
      message: 'Lock-in penalty cannot be negative'
    };
  }
  
  if (agreement.notice_period_days <= 0) {
    return {
      isValid: false,
      message: 'Notice period must be greater than 0 days'
    };
  }
  
  return { isValid: true };
};

// Get active agreements count by property
export const getActiveAgreementsByProperty = async (propertyId: number): Promise<number> => {
  try {
    const response = await getAgreements();
    if (response.success) {
      return response.data.filter(
        agreement => agreement.property_id === propertyId && agreement.is_active
      ).length;
    }
    return 0;
  } catch (error) {
    console.error('Error counting agreements:', error);
    return 0;
  }
};

// Get agreements summary statistics
export const getAgreementsSummary = async () => {
  try {
    const response = await getAgreements();
    if (!response.success) {
      throw new Error('Failed to fetch agreements');
    }
    
    const agreements = response.data;
    
    const summary = {
      total: agreements.length,
      active: agreements.filter(a => a.is_active).length,
      bySharingType: {
        single: agreements.filter(a => a.sharing_type === 'single').length,
        double: agreements.filter(a => a.sharing_type === 'double').length,
        triple: agreements.filter(a => a.sharing_type === 'triple').length
      },
      avgLockIn: agreements.length > 0 
        ? Math.round(agreements.reduce((sum, a) => sum + a.lock_in_months, 0) / agreements.length)
        : 0,
      avgNoticePeriod: agreements.length > 0
        ? Math.round(agreements.reduce((sum, a) => sum + a.notice_period_days, 0) / agreements.length)
        : 0,
      withDamageDeduction: agreements.filter(a => a.damage_deduction_allowed).length
    };
    
    return summary;
  } catch (error) {
    console.error('Error getting agreements summary:', error);
    return null;
  }
};

// Validate agreement data before submission
export const validateAgreementData = (data: CreateAgreementData | UpdateAgreementData): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Agreement name must be at least 2 characters');
  }
  
  if ('property_id' in data && (!data.property_id || data.property_id <= 0)) {
    errors.push('Property ID is required');
  }
  
  // if (!['single', 'double', 'triple'].includes(data.sharing_type)) {
  //   errors.push('Invalid sharing type');
  // }
  
  if (data.lock_in_months <= 0) {
    errors.push('Lock-in months must be greater than 0');
  }
  
  if (data.lock_in_penalty_amount < 0) {
    errors.push('Lock-in penalty cannot be negative');
  }
  
  if (data.notice_period_days <= 0) {
    errors.push('Notice period days must be greater than 0');
  }
  
  if (data.notice_penalty_amount < 0) {
    errors.push('Notice penalty cannot be negative');
  }
  
  if ('max_damage_deduction' in data && data.max_damage_deduction !== undefined) {
    if (data.max_damage_deduction < 0) {
      errors.push('Max damage deduction cannot be negative');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};