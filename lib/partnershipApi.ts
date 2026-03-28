// lib/partnershipApi.ts

import { request } from "@/lib/api";

// Add Followup interface - make sure it's exported
export interface PartnershipFollowup {
    id: number;
    note: string;
    created_by: string;
    timestamp: string;
}

// Update PartnershipEnquiry interface
export interface PartnershipEnquiry {
    id: number;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    property_type: string;
    property_count: number;
    location: string;
    message: string;
    status: 'new' | 'contacted' | 'in_review' | 'approved' | 'rejected';
    remark: string;
    created_at: string;
    updated_at: string;
    followup_text?: string;
    followup_date?: string;
    followup_by?: string;
    followup_history?: PartnershipFollowup[];  // This references the exported interface
}

export interface PartnershipStats {
    total: number;
    new_count: number;
    contacted_count: number;
    in_review_count: number;
    approved_count: number;
    rejected_count: number;
}

// Get all partnership enquiries
export const getPartnershipEnquiries = async (filters?: {
    status?: string;
    search?: string;
}): Promise<{ success: boolean; count: number; results: PartnershipEnquiry[] }> => {
    const queryParams = new URLSearchParams();
    // Fix: Only add status if it's not 'all' or empty
    if (filters?.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
    }
    if (filters?.search) {
        queryParams.append('search', filters.search);
    }

    const url = `/api/partnership-enquiries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return request(url, { method: "GET" });
};

// Get single partnership enquiry by ID
export const getPartnershipEnquiryById = async (id: number): Promise<{ success: boolean; data: PartnershipEnquiry }> => {
    return request(`/api/partnership-enquiries/${id}`, { method: "GET" });
};

// Create new partnership enquiry
export const createPartnershipEnquiry = async (data: Partial<PartnershipEnquiry>): Promise<any> => {
    return request("/api/partnership-enquiries", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

// Update partnership enquiry
export const updatePartnershipEnquiry = async (id: number, data: Partial<PartnershipEnquiry>): Promise<any> => {
    return request(`/api/partnership-enquiries/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

// Delete partnership enquiry
export const deletePartnershipEnquiry = async (id: number): Promise<any> => {
    return request(`/api/partnership-enquiries/${id}`, { method: "DELETE" });
};

// Bulk delete partnership enquiries
export const bulkDeletePartnershipEnquiries = async (ids: number[]): Promise<any> => {
    return request("/api/partnership-enquiries/bulk-delete", {
        method: "POST",
        body: JSON.stringify({ ids }),
    });
};

// Get partnership stats
export const getPartnershipStats = async (): Promise<{ success: boolean; data: PartnershipStats }> => {
    return request("/api/partnership-enquiries/stats", { method: "GET" });
};

// Add followup to partnership enquiry
export const addPartnershipFollowup = async (id: number, data: { note: string; created_by?: string }): Promise<any> => {
    return request(`/api/partnership-enquiries/${id}/followup`, {
        method: "POST",
        body: JSON.stringify(data),
    });
};

// Get followup history
export const getPartnershipFollowupHistory = async (id: number): Promise<{ success: boolean; data: PartnershipFollowup[] }> => {
    return request(`/api/partnership-enquiries/${id}/followups`, { method: "GET" });
};

// Update partnership status (with optional followup note)
export const updatePartnershipStatus = async (id: number, status: string, followup_note?: string): Promise<any> => {
    return request(`/api/partnership-enquiries/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, followup_note }),
    });
};