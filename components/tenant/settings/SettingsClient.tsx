"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  tenantDetailsApi,
  type TenantProfile,
} from "@/lib/tenantDetailsApi";
import { tenantSettingsApi, type NotificationPreferences } from "@/lib/tenantSettingsApi";
import SettingsTabs from "./SettingsTabs";
import AccountInformation from "./AccountInformation";
import DeletionRequestSection from "./DeletionRequestSection";
import SecuritySection from "./SecuritySection";
import NotificationsSection from "./NotificationsSection";
import AccountActions from "./AccountActions";

interface SettingsClientProps {
  initialTenant: TenantProfile | null;
  initialNotifications: NotificationPreferences | null;
}

export default function SettingsClient({ 
  initialTenant, 
  initialNotifications 
}: SettingsClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [tenant, setTenant] = useState<TenantProfile | null>(initialTenant);
  const [deleteReason, setDeleteReason] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>(
    initialNotifications || {
      emailNotifications: true,
      paymentReminders: true,
      maintenanceUpdates: true,
      generalAnnouncements: true,
    }
  );

  // Load tenant data with useCallback
  const loadTenantData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await tenantDetailsApi.loadProfile();
      
      if (result.success && result.data) {
        setTenant(result.data);
      } else {
        toast.error("Failed to load profile data");
      }
    } catch (error) {
      console.error("Error loading tenant data:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notification preferences with useCallback
  const loadNotificationPrefs = useCallback(async () => {
    try {
      const token = localStorage.getItem("tenant_token");
      if (!token) return;
      
      const res = await fetch("/api/tenant-settings/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        if (res.status === 404) {
          console.log('Notification endpoint not found, using defaults');
          return;
        }
        console.warn('Failed to load notification prefs:', res.status);
        return;
      }
      
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (error) {
        console.error('Failed to parse notification prefs:', error);
        return;
      }
      
      if (data && data.success && data.data) {
        setNotifications({
          emailNotifications: !!data.data.emailNotifications,
          paymentReminders: !!data.data.paymentReminders,
          maintenanceUpdates: !!data.data.maintenanceUpdates,
          generalAnnouncements: !!data.data.generalAnnouncements,
        });
      }
    } catch (err) {
      console.error("Failed to load notification prefs", err);
    }
  }, []);

  // Change password handler with useCallback
  const handleChangePassword = useCallback(async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      const result = await tenantSettingsApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        toast.success("Password changed successfully");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(result.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  }, [passwordData]);

  // Update notification preferences with useCallback
  const handleUpdateNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const result = await tenantSettingsApi.updateNotificationPreferences(notifications);

      if (result.success) {
        toast.success("Notification preferences updated");
      } else {
        toast.error(result.message || "Failed to update preferences");
      }
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast.error("Failed to update preferences");
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  // Request account deletion with useCallback
  const handleRequestAccountDeletion = useCallback(async () => {
    if (!deleteReason.trim()) {
      toast.error("Please provide a reason for deletion");
      return;
    }

    const confirmed = confirm(
      "Are you sure you want to request account deletion? This request will be sent to the property manager for approval."
    );
    if (!confirmed) return;

    try {
      setDeleteLoading(true);
      const result = await tenantSettingsApi.requestAccountDeletion(deleteReason);

      if (result.success) {
        toast.success("Deletion request sent to property manager");
        setDeleteReason("");
        // Refresh tenant data to show pending status
        loadTenantData();
      } else {
        toast.error(result.message || "Failed to send deletion request");
      }
    } catch (error) {
      console.error("Error requesting account deletion:", error);
      toast.error("Failed to send deletion request");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteReason, loadTenantData]);

  // Logout handler with useCallback
  const handleLogout = useCallback(async () => {
    try {
      await tenantSettingsApi.logout();
      localStorage.removeItem("tenant_token");
      localStorage.removeItem("tenant_id");
      localStorage.removeItem("tenant_logged_in");
      localStorage.clear()
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("tenant_token");
      localStorage.removeItem("tenant_id");
      localStorage.removeItem("tenant_logged_in");
      localStorage.clear()
      toast.success("Logged out");
      router.push("/login");
    }
  }, [router]);

  // Cancel deletion request with useCallback
  const handleCancelDeletionRequest = useCallback(async () => {
    try {
      setDeleteLoading(true);
      const result = await tenantSettingsApi.cancelDeletionRequest();

      if (result.success) {
        toast.success("Deletion request cancelled");
        // Refresh tenant data
        loadTenantData();
      } else {
        toast.error(result.message || "Failed to cancel request");
      }
    } catch (error) {
      console.error("Error cancelling deletion request:", error);
      toast.error("Failed to cancel request");
    } finally {
      setDeleteLoading(false);
    }
  }, [loadTenantData]);

  return (
    <SettingsTabs>
      <AccountInformation tenant={tenant} />
      <DeletionRequestSection
        tenant={tenant}
        deleteReason={deleteReason}
        deleteLoading={deleteLoading}
        onDeleteReasonChange={setDeleteReason}
        onRequestDeletion={handleRequestAccountDeletion}
        onCancelDeletion={handleCancelDeletionRequest}
      />
      <AccountActions onLogout={handleLogout} />
      <SecuritySection
        passwordData={passwordData}
        loading={loading}
        onPasswordDataChange={setPasswordData}
        onChangePassword={handleChangePassword}
      />
      <NotificationsSection
        notifications={notifications}
        loading={loading}
        onNotificationsChange={setNotifications}
        onUpdateNotifications={handleUpdateNotifications}
      />
    </SettingsTabs>
  );
}