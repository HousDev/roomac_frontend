

// "use client";

// import { useState, useCallback, useEffect } from "react";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// import {
//   tenantDetailsApi,
//   type TenantProfile,
// } from "@/lib/tenantDetailsApi";
// import { tenantSettingsApi, type NotificationPreferences } from "@/lib/tenantSettingsApi";
// import SettingsTabs from "./SettingsTabs";
// import AccountInformation from "./AccountInformation";
// import DeletionRequestSection from "./DeletionRequestSection";
// import SecuritySection from "./SecuritySection";
// import NotificationsSection from "./NotificationsSection";
// import AccountActions from "./AccountActions";

// interface SettingsClientProps {
//   initialTenant: TenantProfile | null;
//   initialNotifications: NotificationPreferences | null;
// }

// export default function SettingsClient({ 
//   initialTenant, 
//   initialNotifications 
// }: SettingsClientProps) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const [isClientLoaded, setIsClientLoaded] = useState(false);
//   const [tenant, setTenant] = useState<TenantProfile | null>(initialTenant);
//   const [deleteReason, setDeleteReason] = useState("");

//   const [passwordData, setPasswordData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const [notifications, setNotifications] = useState<NotificationPreferences>(
//     initialNotifications || {
//       emailNotifications: true,
//       paymentReminders: true,
//       maintenanceUpdates: true,
//       generalAnnouncements: true,
//     }
//   );

//   // Load tenant data on client side if initialTenant is null
//   useEffect(() => {
//     const loadClientData = async () => {
//       try {
//         // Check if we have token in localStorage
//         const token = localStorage.getItem("tenant_token");
//         if (!token) {
//           console.log("No token found in localStorage");
//           // Don't redirect immediately, maybe user is not logged in
//           return;
//         }

//         // If initialTenant is null, try to load from API
//         if (!tenant) {
//           console.log("Loading tenant data on client side...");
//           setLoading(true);
          
//           try {
//             const result = await tenantDetailsApi.loadProfile();
            
//             if (result && result.success && result.data) {
//               console.log("Tenant data loaded successfully on client");
//               setTenant(result.data);
//             } else {
//               console.error("Failed to load tenant data:", result?.message || "Unknown error");
//               // Don't show toast error on initial load, just log it
//             }
//           } catch (apiError) {
//             console.error("API error loading tenant data:", apiError);
//           } finally {
//             setLoading(false);
//           }
//         }
//       } catch (error) {
//         console.error("Error in client data loading:", error);
//       } finally {
//         setIsClientLoaded(true);
//       }
//     };

//     loadClientData();
//   }, [tenant]);

//   // Also try to load if initialTenant was provided but may be incomplete
//   useEffect(() => {
//     // If we have initialTenant but it's missing important fields, try to refresh
//     if (initialTenant && !isClientLoaded) {
//       // Check if we have basic required fields
//       const hasBasicInfo = initialTenant.full_name && initialTenant.email;
      
//       if (!hasBasicInfo) {
//         console.log("Initial tenant data incomplete, refreshing...");
//         loadTenantData();
//       }
//     }
//   }, [initialTenant, isClientLoaded]);

//   // Load tenant data with useCallback
//   const loadTenantData = useCallback(async () => {
//     try {
//       setLoading(true);
//       console.log("Manually loading tenant data...");
//       const result = await tenantDetailsApi.loadProfile();
      
//       if (result && result.success && result.data) {
//         console.log("Tenant data refreshed successfully");
//         setTenant(result.data);
//         toast.success("Profile data refreshed");
//       } else {
//         console.error("Failed to load profile data:", result?.message);
//         toast.error(result?.message || "Failed to load profile data");
//       }
//     } catch (error) {
//       console.error("Error loading tenant data:", error);
//       toast.error("Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Load notification preferences with useCallback
//   const loadNotificationPrefs = useCallback(async () => {
//     try {
//       const token = localStorage.getItem("tenant_token");
//       if (!token) return;
      
//       const res = await fetch("/api/tenant-settings/notifications", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
      
//       if (!res.ok) {
//         if (res.status === 404) {
//           return;
//         }
//         console.warn('Failed to load notification prefs:', res.status);
//         return;
//       }
      
//       const text = await res.text();
//       let data;
//       try {
//         data = text ? JSON.parse(text) : null;
//       } catch (error) {
//         console.error('Failed to parse notification prefs:', error);
//         return;
//       }
      
//       if (data && data.success && data.data) {
//         setNotifications({
//           emailNotifications: !!data.data.emailNotifications,
//           paymentReminders: !!data.data.paymentReminders,
//           maintenanceUpdates: !!data.data.maintenanceUpdates,
//           generalAnnouncements: !!data.data.generalAnnouncements,
//         });
//       }
//     } catch (err) {
//       console.error("Failed to load notification prefs", err);
//     }
//   }, []);

//   // Load notification prefs on mount
//   useEffect(() => {
//     loadNotificationPrefs();
//   }, [loadNotificationPrefs]);

//   // Change password handler with useCallback
//   const handleChangePassword = useCallback(async () => {
//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       toast.error("New passwords do not match");
//       return;
//     }
//     if (passwordData.newPassword.length < 6) {
//       toast.error("Password must be at least 6 characters long");
//       return;
//     }

//     try {
//       setLoading(true);
//       const result = await tenantSettingsApi.changePassword(
//         passwordData.currentPassword,
//         passwordData.newPassword
//       );

//       if (result.success) {
//         toast.success("Password changed successfully");
//         setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
//       } else {
//         toast.error(result.message || "Failed to change password");
//       }
//     } catch (error) {
//       console.error("Error changing password:", error);
//       toast.error("An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   }, [passwordData]);

//   // Update notification preferences with useCallback
//   const handleUpdateNotifications = useCallback(async () => {
//     try {
//       setLoading(true);
//       const result = await tenantSettingsApi.updateNotificationPreferences(notifications);

//       if (result.success) {
//         toast.success("Notification preferences updated");
//       } else {
//         toast.error(result.message || "Failed to update preferences");
//       }
//     } catch (error) {
//       console.error("Error updating notifications:", error);
//       toast.error("Failed to update preferences");
//     } finally {
//       setLoading(false);
//     }
//   }, [notifications]);

//   // Request account deletion with useCallback
//   const handleRequestAccountDeletion = useCallback(async () => {
//     if (!deleteReason.trim()) {
//       toast.error("Please provide a reason for deletion");
//       return;
//     }

//     const confirmed = window.confirm(
//       "Are you sure you want to request account deletion? This request will be sent to the property manager for approval."
//     );
//     if (!confirmed) return;

//     try {
//       setDeleteLoading(true);
//       const result = await tenantSettingsApi.requestAccountDeletion(deleteReason);

//       if (result.success) {
//         toast.success("Deletion request sent to property manager");
//         setDeleteReason("");
//         // Refresh tenant data to show pending status
//         await loadTenantData();
//       } else {
//         toast.error(result.message || "Failed to send deletion request");
//       }
//     } catch (error) {
//       console.error("Error requesting account deletion:", error);
//       toast.error("Failed to send deletion request");
//     } finally {
//       setDeleteLoading(false);
//     }
//   }, [deleteReason, loadTenantData]);

//   // Logout handler with useCallback
//   const handleLogout = useCallback(async () => {
//     try {
//       await tenantSettingsApi.logout();
//       localStorage.removeItem("tenant_token");
//       localStorage.removeItem("tenant_id");
//       localStorage.removeItem("tenant_logged_in");
//       localStorage.clear();
//       toast.success("Logged out successfully");
//       router.push("/login");
//     } catch (error) {
//       console.error("Logout error:", error);
//       localStorage.removeItem("tenant_token");
//       localStorage.removeItem("tenant_id");
//       localStorage.removeItem("tenant_logged_in");
//       localStorage.clear();
//       toast.success("Logged out");
//       router.push("/login");
//     }
//   }, [router]);

//   // Cancel deletion request with useCallback
//   const handleCancelDeletionRequest = useCallback(async () => {
//     try {
//       setDeleteLoading(true);
//       const result = await tenantSettingsApi.cancelDeletionRequest();

//       if (result.success) {
//         toast.success("Deletion request cancelled");
//         // Refresh tenant data
//         await loadTenantData();
//       } else {
//         toast.error(result.message || "Failed to cancel request");
//       }
//     } catch (error) {
//       console.error("Error cancelling deletion request:", error);
//       toast.error("Failed to cancel request");
//     } finally {
//       setDeleteLoading(false);
//     }
//   }, [loadTenantData]);

//   // Show loading state while initializing
//   if (!isClientLoaded && !tenant) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading your account information...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <SettingsTabs>
//       <AccountInformation tenant={tenant} />
//       <DeletionRequestSection
//         tenant={tenant}
//         deleteReason={deleteReason}
//         deleteLoading={deleteLoading}
//         onDeleteReasonChange={setDeleteReason}
//         onRequestDeletion={handleRequestAccountDeletion}
//         onCancelDeletion={handleCancelDeletionRequest}
//       />
//       <AccountActions onLogout={handleLogout} />
//       <SecuritySection
//         passwordData={passwordData}
//         loading={loading}
//         onPasswordDataChange={setPasswordData}
//         onChangePassword={handleChangePassword}
//       />
//       <NotificationsSection
//         notifications={notifications}
//         loading={loading}
//         onNotificationsChange={setNotifications}
//         onUpdateNotifications={handleUpdateNotifications}
//       />
//     </SettingsTabs>
//   );
// }


"use client";

import { useState, useCallback, useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const [tenant, setTenant] = useState<TenantProfile | null>(initialTenant);
  const [deleteReason, setDeleteReason] = useState("");
  
  // State for deletion confirmation dialog
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

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

  // Load tenant data on client side if initialTenant is null
  useEffect(() => {
    const loadClientData = async () => {
      try {
        // Check if we have token in localStorage
        const token = localStorage.getItem("tenant_token");
        if (!token) {
          console.log("No token found in localStorage");
          // Don't redirect immediately, maybe user is not logged in
          return;
        }

        // If initialTenant is null, try to load from API
        if (!tenant) {
          console.log("Loading tenant data on client side...");
          setLoading(true);
          
          try {
            const result = await tenantDetailsApi.loadProfile();
            
            if (result && result.success && result.data) {
              console.log("Tenant data loaded successfully on client");
              setTenant(result.data);
            } else {
              console.error("Failed to load tenant data:", result?.message || "Unknown error");
              // Don't show toast error on initial load, just log it
            }
          } catch (apiError) {
            console.error("API error loading tenant data:", apiError);
          } finally {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error in client data loading:", error);
      } finally {
        setIsClientLoaded(true);
      }
    };

    loadClientData();
  }, [tenant]);

  // Also try to load if initialTenant was provided but may be incomplete
  useEffect(() => {
    // If we have initialTenant but it's missing important fields, try to refresh
    if (initialTenant && !isClientLoaded) {
      // Check if we have basic required fields
      const hasBasicInfo = initialTenant.full_name && initialTenant.email;
      
      if (!hasBasicInfo) {
        console.log("Initial tenant data incomplete, refreshing...");
        loadTenantData();
      }
    }
  }, [initialTenant, isClientLoaded]);

  // Load tenant data with useCallback
  const loadTenantData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Manually loading tenant data...");
      const result = await tenantDetailsApi.loadProfile();
      
      if (result && result.success && result.data) {
        console.log("Tenant data refreshed successfully");
        setTenant(result.data);
        toast.success("Profile data refreshed");
      } else {
        console.error("Failed to load profile data:", result?.message);
        toast.error(result?.message || "Failed to load profile data");
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

  // Load notification prefs on mount
  useEffect(() => {
    loadNotificationPrefs();
  }, [loadNotificationPrefs]);

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

  // Show deletion confirmation dialog
  const handleShowDeleteConfirmation = useCallback(() => {
    if (!deleteReason.trim()) {
      toast.error("Please provide a reason for deletion");
      return;
    }
    setShowDeleteConfirmation(true);
  }, [deleteReason]);

  // Request account deletion with useCallback
  const handleRequestAccountDeletion = useCallback(async () => {
    setShowDeleteConfirmation(false);
    
    try {
      setDeleteLoading(true);
      const result = await tenantSettingsApi.requestAccountDeletion(deleteReason);

      if (result.success) {
        toast.success("Deletion request sent to property manager");
        setDeleteReason("");
        // Refresh tenant data to show pending status
        await loadTenantData();
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
      localStorage.clear();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("tenant_token");
      localStorage.removeItem("tenant_id");
      localStorage.removeItem("tenant_logged_in");
      localStorage.clear();
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
        await loadTenantData();
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

  // Show loading state while initializing
  if (!isClientLoaded && !tenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your account information...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SettingsTabs>
        <AccountInformation tenant={tenant} />
        <DeletionRequestSection
          tenant={tenant}
          deleteReason={deleteReason}
          deleteLoading={deleteLoading}
          onDeleteReasonChange={setDeleteReason}
          onRequestDeletion={handleShowDeleteConfirmation}
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

      {/* Deletion Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-medium">This action will send a deletion request to your property manager for approval.</p>
              <p className="text-sm text-gray-500">
                Once approved, all your data will be permanently deleted including:
              </p>
              <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
                <li>Personal information</li>
                <li>Booking history</li>
                <li>Payment records</li>
                <li>Documents and uploaded files</li>
              </ul>
              <p className="text-sm font-medium text-amber-600 bg-amber-50 p-3 rounded-md mt-2">
                <span className="block font-semibold">⚠️ Important:</span>
                This request will be reviewed by your property manager. You will be notified once a decision is made.
                You can cancel this request anytime before it's approved.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRequestAccountDeletion}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending Request...
                </>
              ) : (
                "Yes, Send Deletion Request"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}