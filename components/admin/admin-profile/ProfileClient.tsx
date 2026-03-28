// components/admin/admin-profile/ProfileClient.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
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
import { useAuth } from "@/context/authContext";

interface ProfileData {
  salutation: string;
  full_name: string;
  email: string;
  phone: string;
  phone_country_code?: string;
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

  const { user } = useAuth();

  const [profileData, setProfileData] = useState<ProfileData>({
    salutation: user?.salutation || '',
    full_name: user?.name || '',
    email: user?.email || localStorage.getItem("auth_email") || '',
    phone: user?.phone || '',
    phone_country_code: user?.phone_country_code || '+91',
    role: user?.role_name || localStorage.getItem("auth_role") || '',
    address: user?.current_address || '',
    bio: user?.bio || '',
    avatar_url: user?.photo_url || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotifications);

  useEffect(() => {
    setProfileData({
      salutation: user?.salutation || '',
      full_name: user?.name || '',
      email: user?.email || localStorage.getItem("auth_email") || '',
      phone: user?.phone || '',
      phone_country_code: user?.phone_country_code || '+91',
      role: user?.role_name || localStorage.getItem("auth_role") || '',
      address: user?.current_address || '',
      bio: user?.bio || '',
      avatar_url: user?.photo_url || '',
    });
  }, [user]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getProfile();

      if (result.success) {
        const pd = result.profile || result.data || {};
        const nd: any = result.notification_settings || result.settings || {};

        setProfileData(prev => ({
          ...prev,
          salutation: pd.salutation || '',
          full_name: pd.full_name || '',
          phone: pd.phone || '',
          phone_country_code: pd.phone_country_code || '+91',
          address: pd.address || '',
          bio: pd.bio || '',
          avatar_url: pd.avatar_url || '',
        }));

        if (nd) {
          setNotificationSettings({
            email_notifications: Boolean(nd.email_notifications),
            sms_notifications: Boolean(nd.sms_notifications),
            whatsapp_notifications: Boolean(nd.whatsapp_notifications),
            payment_alerts: Boolean(nd.payment_alerts),
            booking_alerts: Boolean(nd.booking_alerts),
            maintenance_alerts: Boolean(nd.maintenance_alerts),
          });
        }
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

  const handleProfileUpdate = useCallback(async () => {
    if (!profileData.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }

    const toastId = toast.loading("Updating profile...");

    try {
      setLoading(true);
      const updateData: ProfileUpdateData = {
        salutation: profileData.salutation,
        full_name: profileData.full_name,
        phone: profileData.phone,
        phone_country_code: profileData.phone_country_code,
        address: profileData.address,
        bio: profileData.bio,
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
      const result = await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

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

  const handleCancelProfileChanges = useCallback(() => {
    fetchProfile();
    toast.info("Changes discarded");
  }, [fetchProfile]);

  const handleResetNotifications = useCallback(() => {
    setNotificationSettings({
      email_notifications: true,
      sms_notifications: true,
      whatsapp_notifications: true,
      payment_alerts: true,
      booking_alerts: true,
      maintenance_alerts: false,
    });
    toast.info("Reset to default settings");
  }, []);

  const handleClearPasswordForm = useCallback(() => {
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    toast.info("Form cleared");
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-0 sm:p-0 lg:p-0">
      <div className="max-w-9xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

          <div className="w-full lg:w-64 lg:sticky lg:top-4 lg:self-start">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="flex-1 min-w-0">
            {loading && activeTab === "profile" ? (
              <div className="flex justify-center items-center h-48 sm:h-64">
                <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-b-2 border-blue-600" />
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