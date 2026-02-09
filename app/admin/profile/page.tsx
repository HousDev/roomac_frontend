// "use client";

// import { AdminHeader } from '@/components/admin/admin-header';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { User, Mail, Phone, MapPin, Building2, Shield, Key, Bell, Upload } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import { useToast } from '@/hooks/use-toast';

// export default function ProfilePage() {
//   const { toast } = useToast();
//   const [loading, setLoading] = useState(false);
//   const [profileData, setProfileData] = useState({
//     full_name: 'Admin User',
//     email: 'admin@roomac.com',
//     phone: '+919876543210',
//     role: 'Administrator',
//     address: 'Hinjawadi, Pune, Maharashtra',
//     bio: 'System administrator managing ROOMAC properties'
//   });

//   const [passwordData, setPasswordData] = useState({
//     current_password: '',
//     new_password: '',
//     confirm_password: ''
//   });

//   const [notificationSettings, setNotificationSettings] = useState({
//     email_notifications: true,
//     sms_notifications: true,
//     whatsapp_notifications: true,
//     payment_alerts: true,
//     booking_alerts: true,
//     maintenance_alerts: false
//   });

//   const handleProfileUpdate = async () => {
//     setLoading(true);
//     setTimeout(() => {
//       toast({
//         title: "Success",
//         description: "Profile updated successfully"
//       });
//       setLoading(false);
//     }, 1000);
//   };

//   const handlePasswordChange = async () => {
//     if (passwordData.new_password !== passwordData.confirm_password) {
//       toast({
//         title: "Error",
//         description: "Passwords do not match",
//         variant: "destructive"
//       });
//       return;
//     }

//     if (passwordData.new_password.length < 8) {
//       toast({
//         title: "Error",
//         description: "Password must be at least 8 characters",
//         variant: "destructive"
//       });
//       return;
//     }

//     setLoading(true);
//     setTimeout(() => {
//       toast({
//         title: "Success",
//         description: "Password changed successfully"
//       });
//       setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
//       setLoading(false);
//     }, 1000);
//   };

//   const handleNotificationUpdate = async () => {
//     setLoading(true);
//     setTimeout(() => {
//       toast({
//         title: "Success",
//         description: "Notification preferences updated"
//       });
//       setLoading(false);
//     }, 1000);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <AdminHeader title="Profile Settings" />

//       <div className="p-6">
//         <div className="max-w-4xl mx-auto">
//           <Tabs defaultValue="profile" className="space-y-6">
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="profile">Profile</TabsTrigger>
//               <TabsTrigger value="security">Security</TabsTrigger>
//               <TabsTrigger value="notifications">Notifications</TabsTrigger>
//             </TabsList>

//             <TabsContent value="profile">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <User className="h-5 w-5" />
//                     Profile Information
//                   </CardTitle>
//                   <CardDescription>Update your personal information and public profile</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <div className="flex items-center gap-6">
//                     <Avatar className="h-24 w-24">
//                       <AvatarImage src="" />
//                       <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">AU</AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <Button variant="outline" size="sm">
//                         <Upload className="h-4 w-4 mr-2" />
//                         Upload Photo
//                       </Button>
//                       <p className="text-sm text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB</p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <Label>Full Name *</Label>
//                       <Input
//                         value={profileData.full_name}
//                         onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
//                         placeholder="Enter full name"
//                       />
//                     </div>
//                     <div>
//                       <Label>Role</Label>
//                       <Input value={profileData.role} disabled className="bg-slate-50" />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <Label>Email *</Label>
//                       <div className="relative">
//                         <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                         <Input
//                           className="pl-10"
//                           value={profileData.email}
//                           onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
//                           placeholder="email@example.com"
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <Label>Phone *</Label>
//                       <div className="relative">
//                         <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                         <Input
//                           className="pl-10"
//                           value={profileData.phone}
//                           onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
//                           placeholder="+91 9876543210"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <Label>Address</Label>
//                     <div className="relative">
//                       <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                       <Input
//                         className="pl-10"
//                         value={profileData.address}
//                         onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
//                         placeholder="Enter address"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <Label>Bio</Label>
//                     <Textarea
//                       value={profileData.bio}
//                       onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
//                       placeholder="Tell us about yourself"
//                       rows={4}
//                     />
//                   </div>

//                   <div className="flex justify-end gap-3">
//                     <Button variant="outline">Cancel</Button>
//                     <Button onClick={handleProfileUpdate} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
//                       {loading ? 'Saving...' : 'Save Changes'}
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="security">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Shield className="h-5 w-5" />
//                     Security Settings
//                   </CardTitle>
//                   <CardDescription>Manage your password and security preferences</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <div className="space-y-4">
//                     <div>
//                       <Label>Current Password *</Label>
//                       <div className="relative">
//                         <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                         <Input
//                           type="password"
//                           className="pl-10"
//                           value={passwordData.current_password}
//                           onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
//                           placeholder="Enter current password"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <Label>New Password *</Label>
//                       <div className="relative">
//                         <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                         <Input
//                           type="password"
//                           className="pl-10"
//                           value={passwordData.new_password}
//                           onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
//                           placeholder="Enter new password"
//                         />
//                       </div>
//                       <p className="text-sm text-slate-500 mt-1">Must be at least 8 characters</p>
//                     </div>

//                     <div>
//                       <Label>Confirm New Password *</Label>
//                       <div className="relative">
//                         <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                         <Input
//                           type="password"
//                           className="pl-10"
//                           value={passwordData.confirm_password}
//                           onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
//                           placeholder="Confirm new password"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="border-t pt-6">
//                     <h3 className="font-semibold mb-3">Two-Factor Authentication</h3>
//                     <p className="text-sm text-slate-600 mb-4">
//                       Add an extra layer of security to your account by enabling two-factor authentication.
//                     </p>
//                     <Button variant="outline">
//                       Enable 2FA
//                     </Button>
//                   </div>

//                   <div className="flex justify-end gap-3">
//                     <Button variant="outline">Cancel</Button>
//                     <Button onClick={handlePasswordChange} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
//                       {loading ? 'Updating...' : 'Update Password'}
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="notifications">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Bell className="h-5 w-5" />
//                     Notification Preferences
//                   </CardTitle>
//                   <CardDescription>Choose how you want to receive notifications</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between p-4 border rounded-lg">
//                       <div>
//                         <h4 className="font-medium">Email Notifications</h4>
//                         <p className="text-sm text-slate-500">Receive notifications via email</p>
//                       </div>
//                       <input
//                         type="checkbox"
//                         checked={notificationSettings.email_notifications}
//                         onChange={(e) => setNotificationSettings({ ...notificationSettings, email_notifications: e.target.checked })}
//                         className="h-5 w-5"
//                       />
//                     </div>

//                     <div className="flex items-center justify-between p-4 border rounded-lg">
//                       <div>
//                         <h4 className="font-medium">SMS Notifications</h4>
//                         <p className="text-sm text-slate-500">Receive notifications via SMS</p>
//                       </div>
//                       <input
//                         type="checkbox"
//                         checked={notificationSettings.sms_notifications}
//                         onChange={(e) => setNotificationSettings({ ...notificationSettings, sms_notifications: e.target.checked })}
//                         className="h-5 w-5"
//                       />
//                     </div>

//                     <div className="flex items-center justify-between p-4 border rounded-lg">
//                       <div>
//                         <h4 className="font-medium">WhatsApp Notifications</h4>
//                         <p className="text-sm text-slate-500">Receive notifications via WhatsApp</p>
//                       </div>
//                       <input
//                         type="checkbox"
//                         checked={notificationSettings.whatsapp_notifications}
//                         onChange={(e) => setNotificationSettings({ ...notificationSettings, whatsapp_notifications: e.target.checked })}
//                         className="h-5 w-5"
//                       />
//                     </div>
//                   </div>

//                   <div className="border-t pt-6">
//                     <h3 className="font-semibold mb-4">Alert Types</h3>
//                     <div className="space-y-4">
//                       <div className="flex items-center justify-between">
//                         <Label>Payment Alerts</Label>
//                         <input
//                           type="checkbox"
//                           checked={notificationSettings.payment_alerts}
//                           onChange={(e) => setNotificationSettings({ ...notificationSettings, payment_alerts: e.target.checked })}
//                           className="h-5 w-5"
//                         />
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <Label>Booking Alerts</Label>
//                         <input
//                           type="checkbox"
//                           checked={notificationSettings.booking_alerts}
//                           onChange={(e) => setNotificationSettings({ ...notificationSettings, booking_alerts: e.target.checked })}
//                           className="h-5 w-5"
//                         />
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <Label>Maintenance Alerts</Label>
//                         <input
//                           type="checkbox"
//                           checked={notificationSettings.maintenance_alerts}
//                           onChange={(e) => setNotificationSettings({ ...notificationSettings, maintenance_alerts: e.target.checked })}
//                           className="h-5 w-5"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex justify-end gap-3">
//                     <Button variant="outline">Cancel</Button>
//                     <Button onClick={handleNotificationUpdate} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
//                       {loading ? 'Saving...' : 'Save Preferences'}
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
//     </div>
//   );
// }


// app/admin/profile/page.tsx
// "use client";

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { User, Mail, Phone, MapPin, Shield, Key, Bell, Upload, Loader2 } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import { toast } from 'sonner'; // Changed from use-toast to sonner
// import { 
//   getProfile, 
//   updateProfile, 
//   changePassword, 
//   updateNotificationSettings, 
//   uploadAvatar,
//   type ProfileUpdateData,
//   type PasswordChangeData,
//   type NotificationSettings as NotificationSettingsType
// } from '@/lib/adminProfileApi';

// export default function ProfilePage() {
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("profile");
//   const [avatarUploading, setAvatarUploading] = useState(false);

//   const [profileData, setProfileData] = useState({
//     full_name: '',
//     email: '',
//     phone: '',
//     role: 'Administrator',
//     address: '',
//     bio: '',
//     avatar_url: ''
//   });

//   const [passwordData, setPasswordData] = useState({
//     current_password: '',
//     new_password: '',
//     confirm_password: ''
//   });

//   const [notificationSettings, setNotificationSettings] = useState({
//     email_notifications: true,
//     sms_notifications: true,
//     whatsapp_notifications: true,
//     payment_alerts: true,
//     booking_alerts: true,
//     maintenance_alerts: false
//   });

//   // Fetch profile data on component mount
//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     console.log('🔄 fetchProfile called');
//     console.log('📦 localStorage email:', localStorage.getItem('admin_email'));
//     console.log('🔑 Token exists:', localStorage.getItem('admin_token') ? 'Yes' : 'No');
    
//     try {
//       setLoading(true);
//       const result = await getProfile();
//       console.log('📋 API Response:', result);
      
//       if (result.success) {
//         console.log('📦 Result profile:', result.profile);
//         console.log('📦 Result notification_settings:', result.notification_settings);
        
//         const profileData = result.profile || result.data || {};
//         const notificationData = result.notification_settings || result.settings || {};
        
//         console.log('📝 Extracted profile:', profileData);
//         console.log('📝 Extracted settings:', notificationData);
        
//         setProfileData({
//           full_name: profileData.full_name || '',
//           email: localStorage.getItem('admin_email') || '',
//           phone: profileData.phone || '',
//           role: 'Administrator',
//           address: profileData.address || '',
//           bio: profileData.bio || '',
//           avatar_url: profileData.avatar_url || ''
//         });
        
//         if (notificationData) {
//           setNotificationSettings({
//             email_notifications: Boolean(notificationData.email_notifications),
//             sms_notifications: Boolean(notificationData.sms_notifications),
//             whatsapp_notifications: Boolean(notificationData.whatsapp_notifications),
//             payment_alerts: Boolean(notificationData.payment_alerts),
//             booking_alerts: Boolean(notificationData.booking_alerts),
//             maintenance_alerts: Boolean(notificationData.maintenance_alerts)
//           });
//         }
        
//         toast.success("Profile loaded successfully");
//       } else {
//         console.error('❌ API returned success:false:', result.message);
//         toast.error(result.message || "Failed to load profile");
//       }
//     } catch (error: any) {
//       console.error('❌ fetchProfile error:', error);
//       console.error('❌ Error details:', error.message, error.status);
//       console.error('❌ Error response:', error.response);
      
//       toast.error(error.message || "Failed to load profile");
//     } finally {
//       setLoading(false);
//       console.log('🏁 fetchProfile completed');
//     }
//   };

//   const handleProfileUpdate = async () => {
//     console.log('🔄 handleProfileUpdate called');
//     console.log('📋 Profile data to update:', {
//       full_name: profileData.full_name,
//       phone: profileData.phone,
//       address: profileData.address,
//       bio: profileData.bio
//     });
    
//     // Show loading toast
//     const toastId = toast.loading("Updating profile...");
    
//     try {
//       setLoading(true);
//       const updateData: ProfileUpdateData = {
//         full_name: profileData.full_name,
//         phone: profileData.phone,
//         address: profileData.address,
//         bio: profileData.bio
//       };

//       console.log('📤 Sending update request...');
//       const result = await updateProfile(updateData);
//       console.log('📥 Update response:', result);
      
//       if (result.success) {
//         console.log('✅ Profile update successful');
//         toast.dismiss(toastId);
//         toast.success("Profile updated successfully");
//       } else {
//         console.error('❌ Profile update failed:', result.message);
//         toast.dismiss(toastId);
//         toast.error(result.message || "Failed to update profile");
//       }
//     } catch (error: any) {
//       console.error('❌ handleProfileUpdate error:', error);
//       console.error('❌ Error response:', error.response);
      
//       toast.dismiss(toastId);
//       toast.error(error.message || "Failed to update profile");
//     } finally {
//       setLoading(false);
//       console.log('🏁 handleProfileUpdate completed');
//     }
//   };

//   const handlePasswordChange = async () => {
//     if (passwordData.new_password !== passwordData.confirm_password) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     if (passwordData.new_password.length < 8) {
//       toast.error("Password must be at least 8 characters");
//       return;
//     }

//     // Show loading toast
//     const toastId = toast.loading("Changing password...");
    
//     try {
//       setLoading(true);
//       const passwordDataToSend: PasswordChangeData = {
//         current_password: passwordData.current_password,
//         new_password: passwordData.new_password
//       };

//       const result = await changePassword(passwordDataToSend);
      
//       if (result.success) {
//         toast.dismiss(toastId);
//         toast.success("Password changed successfully");
//         setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
//       } else {
//         toast.dismiss(toastId);
//         toast.error(result.message || "Failed to change password");
//       }
//     } catch (error: any) {
//       toast.dismiss(toastId);
//       toast.error(error.message || "Failed to change password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleNotificationUpdate = async () => {
//     // Show loading toast
//     const toastId = toast.loading("Updating notification preferences...");
    
//     try {
//       setLoading(true);
//       const result = await updateNotificationSettings(notificationSettings);
      
//       if (result.success) {
//         toast.dismiss(toastId);
//         toast.success("Notification preferences updated");
//       } else {
//         toast.dismiss(toastId);
//         toast.error(result.message || "Failed to update notifications");
//       }
//     } catch (error: any) {
//       toast.dismiss(toastId);
//       toast.error(error.message || "Failed to update notifications");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate file
//     if (!file.type.startsWith('image/')) {
//       toast.error("Please upload an image file (JPG, PNG, GIF)");
//       return;
//     }

//     if (file.size > 2 * 1024 * 1024) {
//       toast.error("File size must be less than 2MB");
//       return;
//     }

//     // Show loading toast
//     const toastId = toast.loading("Uploading profile picture...");
    
//     try {
//       setAvatarUploading(true);
//       const result = await uploadAvatar(file);
      
//       if (result.success && result.avatar_url) {
//         setProfileData(prev => ({ ...prev, avatar_url: result.avatar_url! }));
//         toast.dismiss(toastId);
//         toast.success("Profile picture updated");
//       } else {
//         toast.dismiss(toastId);
//         toast.error(result.message || "Failed to upload avatar");
//       }
//     } catch (error: any) {
//       toast.dismiss(toastId);
//       toast.error(error.message || "Failed to upload avatar");
//     } finally {
//       setAvatarUploading(false);
//     }
//   };

//   // Add form validation before saving
//   const validateProfileForm = () => {
//     if (!profileData.full_name.trim()) {
//       toast.error("Full name is required");
//       return false;
//     }
//     return true;
//   };

//   const handleSaveProfile = () => {
//     if (!validateProfileForm()) return;
//     handleProfileUpdate();
//   };

//   return (
//     <div className="min-h-screen bg-slate-100 p-1">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex flex-col lg:flex-row gap-6">
          
//           {/* LEFT SIDEBAR */}
//           <div className="lg:w-64">
//             <Card className="sticky top-5">
//               <CardHeader>
//                 <CardTitle>Settings</CardTitle>
//               </CardHeader>
//               <CardContent className="p-0">
//                 <div className="flex flex-col">
//                   <button
//                     onClick={() => setActiveTab("profile")}
//                     className={`flex items-center gap-3 px-6 py-3 text-left ${activeTab === "profile" ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'hover:bg-slate-50'}`}
//                   >
//                     <User className="h-4 w-4" />
//                     <span>Profile</span>
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("security")}
//                     className={`flex items-center gap-3 px-6 py-3 text-left ${activeTab === "security" ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'hover:bg-slate-50'}`}
//                   >
//                     <Shield className="h-4 w-4" />
//                     <span>Security</span>
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("notifications")}
//                     className={`flex items-center gap-3 px-6 py-3 text-left ${activeTab === "notifications" ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'hover:bg-slate-50'}`}
//                   >
//                     <Bell className="h-4 w-4" />
//                     <span>Notifications</span>
//                   </button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* RIGHT CONTENT AREA */}
//           <div className="flex-1">
//             {loading && activeTab === "profile" ? (
//               <div className="flex justify-center items-center h-64">
//                 <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//               </div>
//             ) : (
//               <>
//                 {/* PROFILE TAB CONTENT */}
//                 {activeTab === "profile" && (
//                   <Card>
//                     <CardHeader className='bg-blue-50 mb-2'>
//                       <CardTitle className="flex items-center gap-2">
//                         <User className="h-5 w-5" /> Profile Information
//                       </CardTitle>
//                       <CardDescription>Update your personal information and public profile</CardDescription>
//                     </CardHeader>

//                     <CardContent className="space-y-6">
//                       <div className="flex items-center gap-6">
//                         <Avatar className="h-24 w-24">
//                           <AvatarImage src={profileData.avatar_url} />
//                           <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
//                             {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : 'A'}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div>
//                           <input
//                             type="file"
//                             id="avatar-upload"
//                             className="hidden"
//                             accept="image/*"
//                             onChange={handleAvatarUpload}
//                             disabled={avatarUploading}
//                           />
//                           <label htmlFor="avatar-upload">
//                             <Button 
//                               variant="outline" 
//                               size="sm" 
//                               asChild
//                               disabled={avatarUploading}
//                             >
//                               <div className="cursor-pointer">
//                                 {avatarUploading ? (
//                                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                                 ) : (
//                                   <Upload className="h-4 w-4 mr-2" />
//                                 )}
//                                 Upload Photo
//                               </div>
//                             </Button>
//                           </label>
//                           <p className="text-sm text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB</p>
//                         </div>
//                       </div>

//                       <div className="grid md:grid-cols-2 gap-4">
//                         <div>
//                           <Label>Full Name *</Label>
//                           <Input 
//                             value={profileData.full_name} 
//                             onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })} 
//                             disabled={loading}
//                             placeholder="Enter your full name"
//                           />
//                         </div>
//                         <div>
//                           <Label>Role</Label>
//                           <Input value={profileData.role} disabled className="bg-slate-50" />
//                         </div>
//                       </div>

//                       <div className="grid md:grid-cols-2 gap-4">
//                         <div>
//                           <Label>Email *</Label>
//                           <div className="relative">
//                             <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                             <Input 
//                               className="pl-10 bg-slate-50" 
//                               value={profileData.email} 
//                               disabled
//                             />
//                           </div>
//                         </div>
//                         <div>
//                           <Label>Phone</Label>
//                           <div className="relative">
//                             <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                             <Input 
//                               className="pl-10" 
//                               value={profileData.phone} 
//                               onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
//                               disabled={loading}
//                               placeholder="Enter phone number"
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <div>
//                         <Label>Address</Label>
//                         <div className="relative">
//                           <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                           <Input 
//                             className="pl-10" 
//                             value={profileData.address} 
//                             onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
//                             disabled={loading}
//                             placeholder="Enter your address"
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <Label>Bio</Label>
//                         <Textarea 
//                           rows={4} 
//                           value={profileData.bio} 
//                           onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
//                           disabled={loading}
//                           placeholder="Tell us about yourself..."
//                         />
//                       </div>

//                       <div className="flex justify-end gap-3">
//                         <Button 
//                           variant="outline" 
//                           onClick={() => {
//                             fetchProfile();
//                             toast.info("Changes discarded");
//                           }} 
//                           disabled={loading}
//                         >
//                           Cancel
//                         </Button>
//                         <Button 
//                           onClick={handleSaveProfile} 
//                           disabled={loading} 
//                           className="bg-blue-600 hover:bg-blue-700"
//                         >
//                           {loading ? 'Saving...' : 'Save Changes'}
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 )}

//                 {/* SECURITY TAB CONTENT */}
//                 {activeTab === "security" && (
//                   <Card>
//                     <CardHeader className='bg-blue-50 mb-2'>
//                       <CardTitle className="flex items-center gap-2">
//                         <Shield className="h-5 w-5" /> Security Settings
//                       </CardTitle>
//                       <CardDescription>Manage your password and security preferences</CardDescription>
//                     </CardHeader>

//                     <CardContent className="space-y-6">
//                       <div className="space-y-4">
//                         <div>
//                           <Label>Current Password *</Label>
//                           <div className="relative">
//                             <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                             <Input 
//                               type="password" 
//                               className="pl-10" 
//                               value={passwordData.current_password}
//                               onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
//                               disabled={loading}
//                               placeholder="Enter current password"
//                             />
//                           </div>
//                         </div>

//                         <div>
//                           <Label>New Password *</Label>
//                           <div className="relative">
//                             <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                             <Input 
//                               type="password" 
//                               className="pl-10" 
//                               value={passwordData.new_password}
//                               onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
//                               disabled={loading}
//                               placeholder="Enter new password (min 8 characters)"
//                             />
//                           </div>
//                           <p className="text-sm text-slate-500 mt-1">Must be at least 8 characters</p>
//                         </div>

//                         <div>
//                           <Label>Confirm New Password *</Label>
//                           <div className="relative">
//                             <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                             <Input 
//                               type="password" 
//                               className="pl-10" 
//                               value={passwordData.confirm_password}
//                               onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
//                               disabled={loading}
//                               placeholder="Confirm new password"
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <div className="border-t pt-6">
//                         <h3 className="font-semibold mb-3">Two-Factor Authentication</h3>
//                         <p className="text-sm text-slate-600 mb-4">
//                           Add an extra layer of security to your account by enabling two-factor authentication.
//                         </p>
//                         <Button 
//                           variant="outline"
//                           onClick={() => toast.info("2FA feature coming soon!")}
//                         >
//                           Enable 2FA
//                         </Button>
//                       </div>

//                       <div className="flex justify-end gap-3">
//                         <Button 
//                           variant="outline" 
//                           onClick={() => {
//                             setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
//                             toast.info("Form cleared");
//                           }} 
//                           disabled={loading}
//                         >
//                           Clear
//                         </Button>
//                         <Button 
//                           onClick={handlePasswordChange} 
//                           disabled={loading} 
//                           className="bg-blue-600 hover:bg-blue-700"
//                         >
//                           {loading ? 'Updating...' : 'Update Password'}
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 )}

//                 {/* NOTIFICATIONS TAB CONTENT */}
//                 {activeTab === "notifications" && (
//                   <Card>
//                     <CardHeader className='bg-blue-50 mb-2'>
//                       <CardTitle className="flex items-center gap-2">
//                         <Bell className="h-5 w-5" /> Notification Preferences
//                       </CardTitle>
//                       <CardDescription>Choose how you want to receive notifications</CardDescription>
//                     </CardHeader>

//                     <CardContent className="space-y-6">
//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between p-4 border rounded-lg">
//                           <div>
//                             <h4 className="font-medium">Email Notifications</h4>
//                             <p className="text-sm text-slate-500">Receive notifications via email</p>
//                           </div>
//                           <input 
//                             type="checkbox" 
//                             checked={notificationSettings.email_notifications} 
//                             onChange={(e) => setNotificationSettings({...notificationSettings, email_notifications: e.target.checked})}
//                             disabled={loading}
//                             className="h-5 w-5 rounded"
//                           />
//                         </div>

//                         <div className="flex items-center justify-between p-4 border rounded-lg">
//                           <div>
//                             <h4 className="font-medium">SMS Notifications</h4>
//                             <p className="text-sm text-slate-500">Receive notifications via SMS</p>
//                           </div>
//                           <input 
//                             type="checkbox" 
//                             checked={notificationSettings.sms_notifications} 
//                             onChange={(e) => setNotificationSettings({...notificationSettings, sms_notifications: e.target.checked})}
//                             disabled={loading}
//                             className="h-5 w-5 rounded"
//                           />
//                         </div>

//                         <div className="flex items-center justify-between p-4 border rounded-lg">
//                           <div>
//                             <h4 className="font-medium">WhatsApp Notifications</h4>
//                             <p className="text-sm text-slate-500">Receive notifications via WhatsApp</p>
//                           </div>
//                           <input 
//                             type="checkbox" 
//                             checked={notificationSettings.whatsapp_notifications} 
//                             onChange={(e) => setNotificationSettings({...notificationSettings, whatsapp_notifications: e.target.checked})}
//                             disabled={loading}
//                             className="h-5 w-5 rounded"
//                           />
//                         </div>
//                       </div>

//                       <div className="border-t pt-6 space-y-4">
//                         <div className="flex items-center justify-between">
//                           <Label>Payment Alerts</Label>
//                           <input 
//                             type="checkbox" 
//                             checked={notificationSettings.payment_alerts} 
//                             onChange={(e) => setNotificationSettings({...notificationSettings, payment_alerts: e.target.checked})}
//                             disabled={loading}
//                             className="h-5 w-5 rounded"
//                           />
//                         </div>
//                         <div className="flex items-center justify-between">
//                           <Label>Booking Alerts</Label>
//                           <input 
//                             type="checkbox" 
//                             checked={notificationSettings.booking_alerts} 
//                             onChange={(e) => setNotificationSettings({...notificationSettings, booking_alerts: e.target.checked})}
//                             disabled={loading}
//                             className="h-5 w-5 rounded"
//                           />
//                         </div>
//                         <div className="flex items-center justify-between">
//                           <Label>Maintenance Alerts</Label>
//                           <input 
//                             type="checkbox" 
//                             checked={notificationSettings.maintenance_alerts} 
//                             onChange={(e) => setNotificationSettings({...notificationSettings, maintenance_alerts: e.target.checked})}
//                             disabled={loading}
//                             className="h-5 w-5 rounded"
//                           />
//                         </div>
//                       </div>

//                       <div className="flex justify-end gap-3">
//                         <Button 
//                           variant="outline" 
//                           onClick={() => {
//                             // Reset to default settings
//                             setNotificationSettings({
//                               email_notifications: true,
//                               sms_notifications: true,
//                               whatsapp_notifications: true,
//                               payment_alerts: true,
//                               booking_alerts: true,
//                               maintenance_alerts: false
//                             });
//                             toast.info("Reset to default settings");
//                           }} 
//                           disabled={loading}
//                         >
//                           Reset Defaults
//                         </Button>
//                         <Button 
//                           onClick={handleNotificationUpdate} 
//                           disabled={loading} 
//                           className="bg-blue-600 hover:bg-blue-700"
//                         >
//                           {loading ? 'Saving...' : 'Save Preferences'}
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { Suspense } from "react";
import ProfileClient from "@/components/admin/admin-profile/ProfileClient";
import Loading from "@/components/admin/admin-profile/loading";
import Error from "@/components/admin/admin-profile/error";

export default function ProfilePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileClient initialProfile={undefined} initialNotifications={{
        email_notifications: false,
        sms_notifications: false,
        whatsapp_notifications: false,
        payment_alerts: false,
        booking_alerts: false,
        maintenance_alerts: false
      }} />
    </Suspense>
  );
}