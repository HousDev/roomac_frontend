// lib/partnershipApi.ts
import { request } from "@/lib/api";

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
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.search) queryParams.append('search', filters.search);

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