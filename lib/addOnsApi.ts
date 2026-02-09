import { request } from './api';

// Types
export interface AddOn {
  id: number;
  uuid: string;
  name: string;
  description: string;
  price: number;
  billing_type: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  category: 'lifestyle' | 'meal' | 'utility' | 'security' | 'mobility' | 'productivity' | 'other';
  icon: string;
  is_popular: boolean;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  max_per_tenant: number;
  created_by_name?: string;
  total_subscribers?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAddOnData {
  name: string;
  description?: string;
  price: number;
  billing_type?: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  category?: 'lifestyle' | 'meal' | 'utility' | 'security' | 'mobility' | 'productivity' | 'other';
  icon?: string;
  is_popular?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  max_per_tenant?: number;
}

export interface UpdateAddOnData extends Partial<CreateAddOnData> {}

export interface AddOnFilters {
  category?: string;
  billing_type?: string;
  is_active?: boolean;
  is_popular?: boolean;
  is_featured?: boolean;
  order_by?: string;
  order_dir?: 'asc' | 'desc';
}

export interface AddOnStats {
  total: number;
  active: number;
  popular: number;
  featured: number;
  total_subscribers: number;
  monthly_revenue: number;
}

export interface Category {
  value: string;
  label: string;
  icon: string;
  color: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Add-on API functions - FIXED ENDPOINT PATHS
export const addOnsApi = {
  // Get all add-ons
  getAll: async (filters?: AddOnFilters): Promise<AddOn[]> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await request<ApiResponse<AddOn[]>>(`/api/admin/add-ons${query}`);
    return response.data || [];
  },

  // Get single add-on
  getById: async (id: number): Promise<AddOn | null> => {
    const response = await request<ApiResponse<AddOn>>(`/api/admin/add-ons/${id}`);
    return response.data || null;
  },

  // Create add-on
  create: async (data: CreateAddOnData): Promise<AddOn> => {
    const response = await request<ApiResponse<AddOn>>('/api/admin/add-ons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create add-on');
    }
    
    return response.data!;
  },

  // Update add-on
  update: async (id: number, data: UpdateAddOnData): Promise<AddOn> => {
    const response = await request<ApiResponse<AddOn>>(`/api/admin/add-ons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update add-on');
    }
    
    return response.data!;
  },

  // Delete add-on
  delete: async (id: number): Promise<void> => {
    const response = await request<ApiResponse>(`/api/admin/add-ons/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete add-on');
    }
  },

  // Toggle add-on status
  toggleStatus: async (id: number): Promise<AddOn> => {
    const response = await request<ApiResponse<AddOn>>(`/api/admin/add-ons/${id}/toggle-status`, {
      method: 'PATCH',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to toggle add-on status');
    }
    
    return response.data!;
  },

  // Get statistics - FIXED ENDPOINT
  getStats: async (): Promise<AddOnStats> => {
    try {
      const response = await request<ApiResponse<AddOnStats>>('/api/admin/add-ons/stats');
      return response.data || {
        total: 0,
        active: 0,
        popular: 0,
        featured: 0,
        total_subscribers: 0,
        monthly_revenue: 0,
      };
    } catch (error) {
      console.error('Failed to load stats:', error);
      return {
        total: 0,
        active: 0,
        popular: 0,
        featured: 0,
        total_subscribers: 0,
        monthly_revenue: 0,
      };
    }
  },

  // Get categories - FIXED ENDPOINT
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await request<ApiResponse<Category[]>>('/api/admin/add-ons/categories');
      return response.data || [];
    } catch (error) {
      console.error('Failed to load categories:', error);
      return [];
    }
  },
};