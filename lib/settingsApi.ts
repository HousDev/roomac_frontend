// lib/settingsApi.ts
import { request, ApiResult, getAuthToken } from './api';

export interface SettingData {
  id: number;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsData {
  [key: string]: SettingData;
}

// Get all settings
export const getSettings = async (): Promise<SettingsData> => {
  try {
    const response = await request<ApiResult<SettingsData>>('/api/settings');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch settings');
    }
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

// Update settings
export const updateSettings = async (settings: Record<string, any>): Promise<ApiResult> => {
  try {
    const response = await request<ApiResult>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings })
    });
    
    return response;
  } catch (error: any) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// Upload file
export const uploadFile = async (file: File, bucket: string = 'logos', path?: string): Promise<ApiResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    if (path) {
      formData.append('path', path);
    }

    const response = await request<ApiResult>('/api/settings/upload', {
      method: 'POST',
      body: formData
      // Note: Don't set Content-Type header for FormData - request() handles it
    });
    
    return response;
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Initialize default settings
export const initializeSettings = async (): Promise<ApiResult> => {
  try {
    const response = await request<ApiResult>('/api/settings/initialize', {
      method: 'POST'
    });
    
    return response;
  } catch (error: any) {
    console.error('Error initializing settings:', error);
    throw error;
  }
};

// Update single setting
export const updateSetting = async (key: string, value: any): Promise<ApiResult> => {
  try {
    const response = await request<ApiResult>(`/api/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value })
    });
    
    return response;
  } catch (error: any) {
    console.error(`Error updating setting ${key}:`, error);
    throw error;
  }
};

// Get setting value as string
export const getSettingValue = (settings: SettingsData, key: string, defaultValue: string = ''): string => {
  return settings[key]?.value || defaultValue;
};

// Get setting value as boolean
export const getSettingBoolean = (settings: SettingsData, key: string, defaultValue: boolean = false): boolean => {
  const value = settings[key]?.value;
  return value === 'true' || value === '1' || value === 'yes' || defaultValue;
};

// Get setting value as number
export const getSettingNumber = (settings: SettingsData, key: string, defaultValue: number = 0): number => {
  const value = settings[key]?.value;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};