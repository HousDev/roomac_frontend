// lib/newsletterApi.ts
import { request } from "@/lib/api";

export interface NewsletterSubscriber {
    id: number;
    email: string;
    status: 'active' | 'unsubscribed';
    subscribed_at: string;
    ip_address: string | null;
    created_at: string;
}

export interface NewsletterStats {
    total: number;
    active_count: number;
    unsubscribed_count: number;
}

// Get all newsletter subscribers
export const getNewsletterSubscribers = async (filters?: {
    status?: string;
    search?: string;
}): Promise<{ success: boolean; count: number; results: NewsletterSubscriber[]; stats: NewsletterStats }> => {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.search) queryParams.append('search', filters.search);

    const url = `/api/newsletter/subscribers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return request(url, { method: "GET" });
};

// Get newsletter stats
export const getNewsletterStats = async (): Promise<{ success: boolean; data: NewsletterStats }> => {
    return request("/api/newsletter/stats", { method: "GET" });
};

// Delete newsletter subscriber
export const deleteNewsletterSubscriber = async (id: number): Promise<any> => {
    return request(`/api/newsletter/subscriber/${id}`, { method: "DELETE" });
};

// Bulk delete newsletter subscribers
export const bulkDeleteNewsletterSubscribers = async (ids: number[]): Promise<any> => {
    return request("/api/newsletter/subscribers/bulk-delete", {
        method: "POST",
        body: JSON.stringify({ ids }),
    });
};

// Subscribe to newsletter (public)
export const subscribeToNewsletter = async (email: string): Promise<any> => {
    return request("/api/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
};