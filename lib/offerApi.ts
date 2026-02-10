// lib/offerApi.ts

import { ReactNode } from 'react';

export interface Room {
  id: number;
  room_number: number;
  sharing_type: 'single' | 'double' | 'triple';
  rent_per_bed: number;
  total_bed: number;
  occupied_beds: number;
  floor: number;
  has_attached_bathroom: boolean;
  has_balcony: boolean;
  has_ac: boolean;
  amenities: string[];
  room_type: string;
  is_active: boolean;
}

export interface Property {
  id: number;
  name: string;
  city_id: string | null;
  area: string | null;
  address: string | null;
  photo_urls: string[];
  amenities: string[];
  starting_price: number;
  security_deposit: number;
  description: string | null;
}

export interface Offer {
  min_stay: ReactNode;
  valid_from: ReactNode;
  valid_to: ReactNode;
  mainColor: string;
  badgeBg: string;
  badgeBorder: string;
  badge: string;
  iconBg: string;
  iconText: string;
  icon: string;
  buttonColor: string;
  id: string;
  code: string;
  title: string;
  description: string | null;
  offer_type: string;
  discount_type: string;
  discount_value: number | null;
  discount_percent: number | null;
  min_months: number;
  start_date: string | null;
  end_date: string | null;
  terms_and_conditions: string | null;
  is_active: boolean;
  display_order: number;
  property_id: number | null;
  room_id: number | null;
  property_name: string | null;
  room_number: number | null;
  sharing_type: string | null;
  rent_per_bed: number | null;
  total_bed: number | null;
  occupied_beds: number | null;
  floor: number | null;
  has_attached_bathroom: boolean | null;
  has_balcony: boolean | null;
  has_ac: boolean | null;
  room_amenities: string[] | null;
  room_active: boolean | null;
  property_amenities: string[] | null;
  photo_urls: string[] | null;
  starting_price: number | null;
  security_deposit: number | null;
  bonus_title: string | null;
  bonus_description: string | null;
  bonus_valid_until: string | null;
  bonus_conditions: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  offer_type?: string;
  property_id?: string;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001';

// Simple fetch wrapper
const request = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

export const offerApi = {
  getAll: async (): Promise<Offer[]> => {
    try {
      const data = await request<Offer[]>("/api/offers");
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error("Failed to fetch offers:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<Offer> => {
    return await request<Offer>(`/api/offers/${id}`);
  },

  create: async (data: Partial<Offer>): Promise<{ id: string; code: string; message: string }> => {
    return await request("/api/offers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Offer>): Promise<{ message: string }> => {
    return await request(`/api/offers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  remove: async (id: string): Promise<{ message: string }> => {
    return await request(`/api/offers/${id}`, {
      method: "DELETE",
    });
  },

  toggleActive: async (id: string, isActive: boolean): Promise<{ message: string }> => {
    return await request(`/api/offers/${id}/toggle`, {
      method: "PATCH",
      body: JSON.stringify({
        is_active: isActive,
      }),
    });
  },

  getRoomsByProperty: async (propertyId: number): Promise<Room[]> => {
    return await request<Room[]>(`/api/offers/property/${propertyId}/rooms`);
  },

  generateOfferCode: async (): Promise<{ code: string; success: boolean }> => {
    try {
      const response = await request<{ code: string; success: boolean }>("/api/offers/generate-code");
      return response;
    } catch (error: any) {
      console.error("Failed to generate offer code:", error);
      // Return a fallback code
      const fallbackCode = 'OFF' + Date.now().toString().slice(-8);
      return { code: fallbackCode, success: false };
    }
  },

  // Get offers with pagination
  getPaginated: async (params: PaginationParams): Promise<PaginatedResponse<Offer>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.offer_type) queryParams.append('offer_type', params.offer_type);
    if (params.property_id) queryParams.append('property_id', params.property_id);
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    
    return await request<PaginatedResponse<Offer>>(`/api/offers/paginated?${queryParams.toString()}`);
  },
};