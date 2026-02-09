"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import Sidebar from "./Sidebar";
import ProfileTab from "./ProfileTab";
import SecurityTab from "./SecurityTab";
import NotificationsTab from "./NotificationsTab";
import {
  ProfileUpdateData,
  PasswordChangeData,
  NotificationSettings,
  getProfile,
  updateProfile,
  changePassword,
  updateNotificationSettings,
  uploadAvatar,
} from "@/lib/adminProfileApi";

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  bio: string;
  avatar_url: string;
}

interface ProfileClientProps {
  initialProfile: any;
  initialNotifications: NotificationSettings;
}

export default function ProfileClient({ initialProfile, initialNotifications }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  // State for profile data
  const [profileData, setProfileData] = useState<ProfileData>(() => {
    // Get email from localStorage on client side
    const email = typeof window !== 'undefined' ? localStorage.getItem('admin_email') || '' : '';
    return {
      ...initialProfile,
      email
    };
  });
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // State for notifications
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotifications);

  // Fetch fresh profile data
  const fetchProfile = useCallback(async () => {
    console.log('🔄 Fetching profile...');
    
    try {
      setLoading(true);
      const result = await getProfile();
      
      if (result.success) {
        const profileData = result.profile || result.data || {};
        const notificationData : any = result.notification_settings || result.settings || {};
        
        setProfileData(prev => ({
          ...prev,
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || ''
        }));
        
        if (notificationData) {
          setNotificationSettings({
            email_notifications: Boolean(notificationData.email_notifications),
            sms_notifications: Boolean(notificationData.sms_notifications),
            whatsapp_notifications: Boolean(notificationData.whatsapp_notifications),
            payment_alerts: Boolean(notificationData.payment_alerts),
            booking_alerts: Boolean(notificationData.booking_alerts),
            maintenance_alerts: Boolean(notificationData.maintenance_alerts)
          });
        }
        
        toast.success("Profile loaded successfully");
      } else {
        toast.error(result.message || "Failed to load profile");
      }
    } catch (error: any) {
      console.error('❌ fetchProfile error:', error);
      toast.error(error.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle profile update
  const handleProfileUpdate = useCallback(async () => {
    if (!profileData.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }

    const toastId = toast.loading("Updating profile...");
    
    try {
      setLoading(true);
      const updateData: ProfileUpdateData = {
        full_name: profileData.full_name,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio
      };

      const result = await updateProfile(updateData);
      
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
    } finally {
      setLoading(false);
    }
  }, [profileData]);

  // Handle password change
  const handlePasswordChange = useCallback(async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const toastId = toast.loading("Changing password...");
    
    try {
      setLoading(true);
      const passwordDataToSend: PasswordChangeData = {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      };

      const result = await changePassword(passwordDataToSend);
      
      if (result.success) {
        toast.dismiss(toastId);
        toast.success("Password changed successfully");
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        toast.dismiss(toastId);
        toast.error(result.message || "Failed to change password");
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }, [passwordData]);

  // Handle notification update
  const handleNotificationUpdate = useCallback(async () => {
    const toastId = toast.loading("Updating notification preferences...");
    
    try {
      setLoading(true);
      const result = await updateNotificationSettings(notificationSettings);
      
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
    } finally {
      setLoading(false);
    }
  }, [notificationSettings]);

  // Handle avatar upload
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
        setProfileData(prev => ({ ...prev, avatar_url: result.avatar_url! }));
        toast.dismiss(toastId);
        toast.success("Profile picture updated");
      } else {
        toast.dismiss(toastId);
        toast.error(result.message || "Failed to upload avatar");
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  }, []);

  // Handle cancel profile changes
  const handleCancelProfileChanges = useCallback(() => {
    fetchProfile();
    toast.info("Changes discarded");
  }, [fetchProfile]);

  // Handle reset notification settings
  const handleResetNotifications = useCallback(() => {
    setNotificationSettings({
      email_notifications: true,
      sms_notifications: true,
      whatsapp_notifications: true,
      payment_alerts: true,
      booking_alerts: true,
      maintenance_alerts: false
    });
    toast.info("Reset to default settings");
  }, []);

  // Handle clear password form
  const handleClearPasswordForm = useCallback(() => {
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    toast.info("Form cleared");
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-1">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="flex-1">
            {loading && activeTab === "profile" ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
              </div>
            ) : (
              <>
                {activeTab === "profile" && (
                  <ProfileTab
                    profileData={profileData}
                    onProfileDataChange={setProfileData}
                    onAvatarUpload={handleAvatarUpload}
                    onSave={handleProfileUpdate}
                    onCancel={handleCancelProfileChanges}
                    loading={loading}
                    avatarUploading={avatarUploading}
                  />
                )}

                {activeTab === "security" && (
                  <SecurityTab
                    passwordData={passwordData}
                    onPasswordDataChange={setPasswordData}
                    onChangePassword={handlePasswordChange}
                    onClear={handleClearPasswordForm}
                    loading={loading}
                  />
                )}

                {activeTab === "notifications" && (
                  <NotificationsTab
                    notificationSettings={notificationSettings}
                    onNotificationSettingsChange={setNotificationSettings}
                    onSave={handleNotificationUpdate}
                    onReset={handleResetNotifications}
                    loading={loading}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}