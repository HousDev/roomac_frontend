import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getProfile,
  updateProfile,
  changePassword,
  updateNotificationSettings,
  uploadAvatar,
  type ProfileUpdateData,
  type PasswordChangeData,
  type NotificationSettings,
  ProfileResponse,
} from '@/lib/adminProfileApi';

interface UseProfileReturn {
  loading: boolean;
  avatarUploading: boolean;
  // fetchProfile: () => Promise<void>;
  fetchProfile: () => Promise<ProfileResponse>;
  handleProfileUpdate: (data: ProfileUpdateData) => Promise<void>;
  handlePasswordChange: (data: PasswordChangeData) => Promise<void>;
  handleNotificationUpdate: (settings: NotificationSettings) => Promise<void>;
  handleAvatarUpload: (file: File) => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getProfile();
      
      if (result.success) {
        toast.success("Profile loaded successfully");
      } else {
        toast.error(result.message || "Failed to load profile");
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ fetchProfile error:', error);
      toast.error(error.message || "Failed to load profile");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleProfileUpdate = useCallback(async (data: ProfileUpdateData) => {
    if (!data.full_name?.trim()) {
      toast.error("Full name is required");
      return;
    }

    const toastId = toast.loading("Updating profile...");
    
    try {
      setLoading(true);
      const result = await updateProfile(data);
      
      if (result.success) {
        toast.dismiss(toastId);
        toast.success("Profile updated successfully");
      } else {
        toast.dismiss(toastId);
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to update profile");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePasswordChange = useCallback(async (data: PasswordChangeData) => {
    if (data.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const toastId = toast.loading("Changing password...");
    
    try {
      setLoading(true);
      const result = await changePassword(data);
      
      if (result.success) {
        toast.dismiss(toastId);
        toast.success("Password changed successfully");
      } else {
        toast.dismiss(toastId);
        toast.error(result.message || "Failed to change password");
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to change password");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleNotificationUpdate = useCallback(async (settings: NotificationSettings) => {
    const toastId = toast.loading("Updating notification preferences...");
    
    try {
      setLoading(true);
      const result = await updateNotificationSettings(settings);
      
      if (result.success) {
        toast.dismiss(toastId);
        toast.success("Notification preferences updated");
      } else {
        toast.dismiss(toastId);
        toast.error(result.message || "Failed to update notifications");
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to update notifications");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file (JPG, PNG, GIF)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    const toastId = toast.loading("Uploading profile picture...");
    
    try {
      setAvatarUploading(true);
      const result = await uploadAvatar(file);
      
      if (result.success && result.avatar_url) {
        toast.dismiss(toastId);
        toast.success("Profile picture updated");
        return result.avatar_url;
      } else {
        toast.dismiss(toastId);
        toast.error(result.message || "Failed to upload avatar");
        return null;
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to upload avatar");
      throw error;
    } finally {
      setAvatarUploading(false);
    }
  }, []);

  return {
    loading,
    avatarUploading,
    fetchProfile,
    handleProfileUpdate,
    handlePasswordChange,
    handleNotificationUpdate,
    handleAvatarUpload,
  };
}