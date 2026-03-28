// // lib/adminProfileApi.ts
// import { request, ApiResult } from './api';

// export type Profile = {
//   id: number;
//   user_id: number;
//   full_name: string;
//   phone?: string;
//   address?: string;
//   bio?: string;
//   avatar_url?: string;
//   created_at: string;
//   updated_at: string;
// };

// export type ProfileUpdateData = {
//   full_name?: string;
//   phone?: string;
//   address?: string;
//   bio?: string;
// };

// export type PasswordChangeData = {
//   current_password: string;
//   new_password: string;
// };

// export type NotificationSettings = {
//   email_notifications: boolean;
//   sms_notifications: boolean;
//   whatsapp_notifications: boolean;
//   payment_alerts: boolean;
//   booking_alerts: boolean;
//   maintenance_alerts: boolean;
// };

// // lib/adminProfileApi.ts - Update types
// export type ProfileResponse = {
//   settings: NotificationSettings | undefined;
//   success: boolean;
//   profile?: Profile;
//   notification_settings?: NotificationSettings;
//   message?: string;
//   data?: any;
// };

// // Get current user's profile
// export async function getProfile(): Promise<ProfileResponse> {
//   try {
//     const result = await request<ProfileResponse>('/api/profile');
//     return result;
//   } catch (error) {
//     console.error('❌ getProfile API error:', error);
//     throw error;
//   }
// }

// // Update the other functions similarly
// export async function updateProfile(data: ProfileUpdateData): Promise<ProfileResponse> {
//   try {
//     const result = await request<ProfileResponse>('/api/profile', {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//     return result;
//   } catch (error) {
//     console.error('❌ updateProfile API error:', error);
//     throw error;
//   }
// }

// // Change password
// export async function changePassword(data: PasswordChangeData): Promise<ApiResult> {
//   try {
//     const result = await request<ApiResult>('/api/profile/password', {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//     return result;
//   } catch (error) {
//     console.error('❌ changePassword API error:', error);
//     throw error;
//   }
// }

// // Update notification settings
// export async function updateNotificationSettings(data: NotificationSettings): Promise<ApiResult> {
//   try {
//     const result = await request<ApiResult>('/api/profile/notifications', {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//     return result;
//   } catch (error) {
//     console.error('❌ updateNotificationSettings API error:', error);
//     throw error;
//   }
// }

// // Upload profile avatar
// export async function uploadAvatar(file: File): Promise<ApiResult<{ avatar_url: string }>> {
//   const formData = new FormData();
//   formData.append('avatar', file);
  
//   try {
//     const result = await request<ApiResult<{ avatar_url: string }>>('/api/profile/avatar', {
//       method: 'POST',
//       body: formData,
//     });
//     return result;
//   } catch (error) {
//     console.error('❌ uploadAvatar API error:', error);
//     throw error;
//   }
// }

// lib/adminProfileApi.ts
import { request, ApiResult } from './api';

export type Profile = {
  id: number;
  user_id: number;
  full_name: string;
  phone?: string;
  phone_country_code?: string; // ADD THIS
  address?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdateData = {
  full_name?: string;
  phone?: string;
  phone_country_code?: string; // ADD THIS
  address?: string;
  bio?: string;
};

export type PasswordChangeData = {
  current_password: string;
  new_password: string;
};

export type NotificationSettings = {
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  payment_alerts: boolean;
  booking_alerts: boolean;
  maintenance_alerts: boolean;
};

// lib/adminProfileApi.ts - Update types
export type ProfileResponse = {
  settings: NotificationSettings | undefined;
  success: boolean;
  profile?: Profile;
  notification_settings?: NotificationSettings;
  message?: string;
  data?: any;
};

// Get current user's profile
export async function getProfile(): Promise<ProfileResponse> {
  try {
    const result = await request<ProfileResponse>('/api/profile');
    return result;
  } catch (error) {
    console.error('❌ getProfile API error:', error);
    throw error;
  }
}

// Update the other functions similarly
export async function updateProfile(data: ProfileUpdateData): Promise<ProfileResponse> {
  try {
    const result = await request<ProfileResponse>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error('❌ updateProfile API error:', error);
    throw error;
  }
}

// Change password
export async function changePassword(data: PasswordChangeData): Promise<ApiResult> {
  try {
    const result = await request<ApiResult>('/api/profile/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error('❌ changePassword API error:', error);
    throw error;
  }
}

// Update notification settings
export async function updateNotificationSettings(data: NotificationSettings): Promise<ApiResult> {
  try {
    const result = await request<ApiResult>('/api/profile/notifications', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error('❌ updateNotificationSettings API error:', error);
    throw error;
  }
}

// Upload profile avatar
export async function uploadAvatar(file: File): Promise<ApiResult<{ avatar_url: string }>> {
  const formData = new FormData();
  formData.append('avatar', file);
  
  try {
    const result = await request<ApiResult<{ avatar_url: string }>>('/api/profile/avatar', {
      method: 'POST',
      body: formData,
    });
    return result;
  } catch (error) {
    console.error('❌ uploadAvatar API error:', error);
    throw error;
  }
}