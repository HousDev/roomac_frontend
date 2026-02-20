// // app/(tenant)/settings/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Settings as IconSettings,
//   Bell as IconBell,
//   Shield as IconShield,
//   Key as IconKey,
//   LogOut as IconLogOut,
//   Check as IconCheck,
//   Info as IconInfo,
//   AlertTriangle,
//   Trash2,
// } from "lucide-react";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// import TenantHeader from "@/components/layout/tenantHeader";
// import {
//   tenantDetailsApi,
//   type TenantProfile,
// } from "@/lib/tenantDetailsApi";
// import { tenantSettingsApi } from "@/lib/tenantSettingsApi";

// export default function TenantSettingsPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const [tenant, setTenant] = useState<TenantProfile | null>(null);
//   const [deleteReason, setDeleteReason] = useState("");

//   const [passwordData, setPasswordData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const [notifications, setNotifications] = useState({
//     emailNotifications: true,
//     paymentReminders: true,
//     maintenanceUpdates: true,
//     generalAnnouncements: true,
//   });

//   useEffect(() => {
//     loadTenantData();
//     loadNotificationPrefs();
//   }, []);

//   // Load tenant data
//   const loadTenantData = async () => {
//     try {
//       setLoading(true);
//       const result = await tenantDetailsApi.loadProfile();
      
//       if (result.success && result.data) {
//         setTenant(result.data);
//       } else {
//         toast.error("Failed to load profile data");
//       }
//     } catch (error) {
//       console.error("Error loading tenant data:", error);
//       toast.error("Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load notification preferences
// // In page.tsx, update loadNotificationPrefs function:
// const loadNotificationPrefs = async () => {
//   try {
//     const token = localStorage.getItem("tenant_token");
//     if (!token) return;
    
//     const res = await fetch("/api/tenant-settings/notifications", {
//       headers: { Authorization: `Bearer ${token}` },
//     });
    
//     if (!res.ok) {
//       if (res.status === 404) {
//         console.log('Notification endpoint not found, using defaults');
//         // It's okay, use defaults
//         return;
//       }
//       console.warn('Failed to load notification prefs:', res.status);
//       return;
//     }
    
//     const text = await res.text();
//     let data;
//     try {
//       data = text ? JSON.parse(text) : null;
//     } catch (error) {
//       console.error('Failed to parse notification prefs:', error);
//       return;
//     }
    
//     if (data && data.success && data.data) {
//       setNotifications({
//         emailNotifications: !!data.data.emailNotifications,
//         paymentReminders: !!data.data.paymentReminders,
//         maintenanceUpdates: !!data.data.maintenanceUpdates,
//         generalAnnouncements: !!data.data.generalAnnouncements,
//       });
//     }
//   } catch (err) {
//     console.error("Failed to load notification prefs", err);
//   }
// };
//   // Change password
//   const handleChangePassword = async () => {
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
//   };

//   // Update notification preferences
//   const handleUpdateNotifications = async () => {
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
//   };

//   // Request account deletion
//   const handleRequestAccountDeletion = async () => {
//     if (!deleteReason.trim()) {
//       toast.error("Please provide a reason for deletion");
//       return;
//     }

//     const confirmed = confirm(
//       "Are you sure you want to request account deletion? This request will be sent to the property manager for approval."
//     );
//     if (!confirmed) return;

//     try {
//       setDeleteLoading(true);
//       const result = await tenantSettingsApi.requestAccountDeletion(deleteReason);

//       if (result.success) {
//         toast.success("Deletion request sent to property manager");
//         setDeleteReason("");
//       } else {
//         toast.error(result.message || "Failed to send deletion request");
//       }
//     } catch (error) {
//       console.error("Error requesting account deletion:", error);
//       toast.error("Failed to send deletion request");
//     } finally {
//       setDeleteLoading(false);
//     }
//   };

//   // Logout
//   const handleLogout = async () => {
//     try {
//       await tenantSettingsApi.logout();
//       localStorage.removeItem("tenant_token");
//       localStorage.removeItem("tenant_id");
//       localStorage.removeItem("tenant_logged_in");
//       toast.success("Logged out successfully");
//       router.push("/tenant/login");
//     } catch (error) {
//       console.error("Logout error:", error);
//       localStorage.removeItem("tenant_token");
//       localStorage.removeItem("tenant_id");
//       localStorage.removeItem("tenant_logged_in");
//       toast.success("Logged out");
//       router.push("/tenant/login");
//     }
//   };

//   // Cancel pending deletion request
//   const handleCancelDeletionRequest = async () => {
//     try {
//       setDeleteLoading(true);
//       const result = await tenantSettingsApi.cancelDeletionRequest();

//       if (result.success) {
//         toast.success("Deletion request cancelled");
//         // Refresh tenant data
//         loadTenantData();
//       } else {
//         toast.error(result.message || "Failed to cancel request");
//       }
//     } catch (error) {
//       console.error("Error cancelling deletion request:", error);
//       toast.error("Failed to cancel request");
//     } finally {
//       setDeleteLoading(false);
//     }
//   };

//   return (
//     <div>
//       <TenantHeader />
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
//         <div className="max-w-4xl mx-auto">
//           <div className="mb-8">
//             <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
//             <p className="text-gray-600">Manage your account preferences and security</p>
//           </div>

//           <Tabs defaultValue="general" className="space-y-6">
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="general">
//                 <IconSettings className="mr-2 h-4 w-4" />
//                 General
//               </TabsTrigger>
//               <TabsTrigger value="security">
//                 <IconShield className="mr-2 h-4 w-4" />
//                 Security
//               </TabsTrigger>
//               <TabsTrigger value="notifications">
//                 <IconBell className="mr-2 h-4 w-4" />
//                 Notifications
//               </TabsTrigger>
//             </TabsList>

//             {/* General Tab */}
//             <TabsContent value="general" className="space-y-6">
//               {/* Account Information */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Account Information</CardTitle>
//                   <CardDescription>Your basic account details</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div>
//                       <Label>Full Name</Label>
//                       <p className="mt-2 text-gray-700">{tenant?.full_name || "N/A"}</p>
//                     </div>
//                     <div>
//                       <Label>Email</Label>
//                       <p className="mt-2 text-gray-700">{tenant?.email || "N/A"}</p>
//                     </div>
//                     <div>
//                       <Label>Phone</Label>
//                       <p className="mt-2 text-gray-700">
//                         {tenant?.country_code} {tenant?.phone || "N/A"}
//                       </p>
//                     </div>
//                     <div>
//                       <Label>Status</Label>
//                       <p className="mt-2">
//                         <span
//                           className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
//                             tenant?.is_active
//                               ? "bg-green-100 text-green-800"
//                               : "bg-red-100 text-red-800"
//                           }`}
//                         >
//                           {tenant?.is_active ? "ACTIVE" : "INACTIVE"}
//                         </span>
//                       </p>
//                     </div>
//                     <div>
//                       <Label>Property</Label>
//                       <p className="mt-2 text-gray-700">{tenant?.property_name || "Not assigned"}</p>
//                     </div>
//                     <div>
//                       <Label>Room</Label>
//                       <p className="mt-2 text-gray-700">{tenant?.room_number || "Not assigned"}</p>
//                     </div>
//                   </div>

//                   <Alert>
//                     <IconInfo className="h-4 w-4" />
//                     <AlertDescription>
//                       To update your basic information, please visit your <strong>Profile</strong> page or contact your property manager.
//                     </AlertDescription>
//                   </Alert>
//                 </CardContent>
//               </Card>

//               {/* Deletion Request Section */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <AlertTriangle className="h-5 w-5 text-amber-600" />
//                     Account Deletion Request
//                   </CardTitle>
//                   <CardDescription>
//                     Request account deletion. This will be sent to property manager for approval.
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {tenant?.delete_reason ? (
//                     <div className="space-y-4">
//                       <Alert className="bg-amber-50 border-amber-200">
//                         <AlertTriangle className="h-4 w-4 text-amber-600" />
//                         <AlertDescription className="text-amber-800">
//                           <strong>Deletion Request Pending</strong>
//                           <p className="mt-1">
//                             Your account deletion request is pending approval from the property manager.
//                           </p>
//                           <div className="mt-2 p-3 bg-white rounded border">
//                             <p className="text-sm font-medium">Reason:</p>
//                             <p className="text-sm mt-1">{tenant.delete_reason}</p>
//                             <p className="text-xs text-gray-500 mt-2">
//                               Requested on: {new Date(tenant.deleted_at || "").toLocaleDateString()}
//                             </p>
//                           </div>
//                           <Button
//                             variant="outline"
//                             className="mt-3"
//                             onClick={handleCancelDeletionRequest}
//                             disabled={deleteLoading}
//                           >
//                             Cancel Request
//                           </Button>
//                         </AlertDescription>
//                       </Alert>
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       <Alert>
//                         <IconInfo className="h-4 w-4" />
//                         <AlertDescription>
//                           When you request account deletion, it will be sent to the property manager for review. 
//                           You will be notified once a decision is made. You can cancel the request anytime before approval.
//                         </AlertDescription>
//                       </Alert>

//                       <div>
//                         <Label htmlFor="deleteReason">Reason for deletion *</Label>
//                         <Textarea
//                           id="deleteReason"
//                           placeholder="Please provide a reason for account deletion..."
//                           value={deleteReason}
//                           onChange={(e) => setDeleteReason(e.target.value)}
//                           className="mt-2"
//                           rows={4}
//                         />
//                         <p className="text-sm text-gray-500 mt-1">
//                           This helps the property manager understand your request.
//                         </p>
//                       </div>

//                       <Alert variant="destructive">
//                         <Trash2 className="h-4 w-4" />
//                         <AlertDescription>
//                           <strong>Warning:</strong> Once approved by the property manager, your account will be deleted and cannot be recovered.
//                           All your data including bookings and payments will be permanently removed.
//                         </AlertDescription>
//                       </Alert>

//                       <Button
//                         variant="destructive"
//                         onClick={handleRequestAccountDeletion}
//                         disabled={deleteLoading || !deleteReason.trim()}
//                       >
//                         <Trash2 className="mr-2 h-4 w-4" />
//                         {deleteLoading ? "Submitting..." : "Request Account Deletion"}
//                       </Button>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>

//               {/* Account Actions */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Account Actions</CardTitle>
//                   <CardDescription>Manage your account</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="flex items-center justify-between p-4 border rounded-lg">
//                     <div>
//                       <h4 className="font-semibold">Logout</h4>
//                       <p className="text-sm text-gray-500">Sign out from your account</p>
//                     </div>
//                     <Button variant="outline" onClick={handleLogout}>
//                       <IconLogOut className="mr-2 h-4 w-4" />
//                       Logout
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Security Tab */}
//             <TabsContent value="security" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Change Password</CardTitle>
//                   <CardDescription>Update your account password</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div>
//                     <Label>Current Password</Label>
//                     <Input
//                       type="password"
//                       value={passwordData.currentPassword}
//                       onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
//                       placeholder="Enter current password"
//                     />
//                   </div>
//                   <div>
//                     <Label>New Password</Label>
//                     <Input
//                       type="password"
//                       value={passwordData.newPassword}
//                       onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
//                       placeholder="Enter new password"
//                     />
//                     <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
//                   </div>
//                   <div>
//                     <Label>Confirm New Password</Label>
//                     <Input
//                       type="password"
//                       value={passwordData.confirmPassword}
//                       onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
//                       placeholder="Confirm new password"
//                     />
//                   </div>
//                   <Button onClick={handleChangePassword} disabled={loading}>
//                     <IconKey className="mr-2 h-4 w-4" />
//                     Change Password
//                   </Button>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Two-Factor Authentication</CardTitle>
//                   <CardDescription>Add an extra layer of security to your account</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <Alert>
//                     <IconInfo className="h-4 w-4" />
//                     <AlertDescription>
//                       Two-factor authentication is currently not enabled. Contact your property manager to enable this feature.
//                     </AlertDescription>
//                   </Alert>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Active Sessions</CardTitle>
//                   <CardDescription>Manage your active login sessions</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between p-4 border rounded-lg">
//                       <div>
//                         <h4 className="font-semibold">Current Device</h4>
//                         <p className="text-sm text-gray-500">Last active: Just now</p>
//                       </div>
//                       <Badge>Active</Badge>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Notifications Tab */}
//             <TabsContent value="notifications" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Email Notifications</CardTitle>
//                   <CardDescription>Choose what emails you want to receive</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h4 className="font-semibold">Email Notifications</h4>
//                       <p className="text-sm text-gray-500">Receive notifications via email</p>
//                     </div>
//                     <Switch
//                       checked={notifications.emailNotifications}
//                       onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
//                     />
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h4 className="font-semibold">Payment Reminders</h4>
//                       <p className="text-sm text-gray-500">Get reminded about upcoming payments</p>
//                     </div>
//                     <Switch
//                       checked={notifications.paymentReminders}
//                       onCheckedChange={(checked) => setNotifications({ ...notifications, paymentReminders: checked })}
//                     />
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h4 className="font-semibold">Maintenance Updates</h4>
//                       <p className="text-sm text-gray-500">Notifications about maintenance work</p>
//                     </div>
//                     <Switch
//                       checked={notifications.maintenanceUpdates}
//                       onCheckedChange={(checked) => setNotifications({ ...notifications, maintenanceUpdates: checked })}
//                     />
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h4 className="font-semibold">General Announcements</h4>
//                       <p className="text-sm text-gray-500">Important updates and announcements</p>
//                     </div>
//                     <Switch
//                       checked={notifications.generalAnnouncements}
//                       onCheckedChange={(checked) => setNotifications({ ...notifications, generalAnnouncements: checked })}
//                     />
//                   </div>
//                 </CardContent>
//               </Card>

//               <Button onClick={handleUpdateNotifications} disabled={loading}>
//                 <IconCheck className="mr-2 h-4 w-4" />
//                 Save Notification Preferences
//               </Button>
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
// import TenantHeader from "@/components/layout/tenantHeader";
import SettingsClient from "@/components/tenant/settings/SettingsClient";
import { getTenantData, getNotificationPreferences } from "@/components/tenant/settings/actions";

export default function SettingsPage() {
  const [tenantData, setTenantData] = useState<Awaited<ReturnType<typeof getTenantData>> | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<Awaited<ReturnType<typeof getNotificationPreferences>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getTenantData(), getNotificationPreferences()]).then(([t, n]) => {
      setTenantData(t.status === "fulfilled" ? t.value : null);
      setNotificationPrefs(n.status === "fulfilled" ? n.value : null);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div>
        {/* <TenantHeader /> */}
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* <TenantHeader /> */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-9xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-gray-600">Manage your account preferences and security</p>
          </div>
          
          <SettingsClient 
              initialTenant={tenantData}
              initialNotifications={notificationPrefs}
            />
        </div>
      </div>
    </div>
  );
}