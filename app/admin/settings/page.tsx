// "use client";

// import { AdminHeader } from '@/components/admin/admin-header';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Switch } from '@/components/ui/switch';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { Settings, Save, Building2, Palette, MessageSquare, Mail, CreditCard, Bell, Cog, Upload, RefreshCw, Eye, EyeOff, Globe, Calendar, FileText, Shield, Wrench, TestTube } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { toast } from 'sonner';
// import { getSettings, updateSettings, uploadFile, SettingsData } from '@/lib/settingsApi';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';

// export default function SettingsPage() {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [settings, setSettings] = useState<Record<string, any>>({});
//   const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
//   const [uploading, setUploading] = useState<Record<string, boolean>>({});
//   const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

//   useEffect(() => {
//     loadSettings();
//   }, []);

//   const loadSettings = async () => {
//     try {
//       const data = await getSettings();
//       setSettingsData(data);
      
//       // Convert to simple key-value object for form state
//       const settingsValues: Record<string, any> = {};
//       Object.entries(data).forEach(([key, settingData]) => {
//         settingsValues[key] = settingData.value;
//       });
//       setSettings(settingsValues);
      
//       toast.success('Settings loaded successfully');
//     } catch (error: any) {
//       console.error('Error loading settings:', error);
//       toast.error(error.message || 'Failed to load settings');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const result = await updateSettings(settings);
      
//       if (result.success) {
//         toast.success(result.message || 'Settings saved successfully', {
//           description: 'Your settings have been updated',
//         });
//         // Refresh settings after save
//         await loadSettings();
//       } else {
//         toast.error(result.message || 'Failed to save settings');
//       }
//     } catch (error: any) {
//       console.error('Error saving settings:', error);
//       toast.error(error.message || 'Failed to save settings');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const updateSetting = (key: string, value: any) => {
//     setSettings(prev => ({ ...prev, [key]: value }));
//   };

//   const handleFileUpload = async (key: string, file: File) => {
//     setUploading(prev => ({ ...prev, [key]: true }));
//     try {
//       const result = await uploadFile(file, 'logos', key);
      
//       if (result.success && result.url) {
//         updateSetting(key, result.url);
//         toast.success(result.message || 'Logo uploaded successfully', {
//           description: 'Image has been uploaded and saved',
//         });
//       } else {
//         toast.error(result.message || 'Upload failed');
//       }
//     } catch (error: any) {
//       console.error('Error uploading file:', error);
//       toast.error(error.message || 'Failed to upload logo');
//     } finally {
//       setUploading(prev => ({ ...prev, [key]: false }));
//     }
//   };

//   const triggerFileInput = (key: string) => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = 'image/*';
//     input.onchange = (e: any) => {
//       const file = e.target.files?.[0];
//       if (file) {
//         handleFileUpload(key, file);
//       }
//     };
//     input.click();
//   };

//   const toggleSecretVisibility = (key: string) => {
//     setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
//   };

//   const testConnection = async (type: 'sms' | 'email' | 'payment') => {
//     toast.info(`Testing ${type} connection...`);
//     // Implement test functionality here
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
//         <AdminHeader title="Settings" description="Manage your platform configuration" />
//         <div className="p-6">
//           <div className="max-w-6xl mx-auto">
//             <Card className="border-0 shadow-xl">
//               <CardContent className="flex items-center justify-center p-12">
//                 <div className="text-center">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004AAD] mx-auto mb-4"></div>
//                   <p className="text-slate-600">Loading settings...</p>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
//       <AdminHeader title="Settings" description="Manage your platform configuration" />

//       <div className="p-6">
//         <div className="max-w-6xl mx-auto">
//           <Tabs defaultValue="general" className="space-y-8">
//             <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
//               <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-1 bg-slate-100 rounded-xl">
//                 <TabsTrigger value="general" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
//                   <Building2 className="h-4 w-4 text-blue-600" />
//                   <span>General</span>
//                 </TabsTrigger>
//                 <TabsTrigger value="branding" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
//                   <Palette className="h-4 w-4 text-purple-600" />
//                   <span>Branding</span>
//                 </TabsTrigger>
//                 <TabsTrigger value="sms" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
//                   <MessageSquare className="h-4 w-4 text-green-600" />
//                   <span>SMS</span>
//                 </TabsTrigger>
//                 <TabsTrigger value="email" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
//                   <Mail className="h-4 w-4 text-blue-600" />
//                   <span>Email</span>
//                 </TabsTrigger>
//                 <TabsTrigger value="payment" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
//                   <CreditCard className="h-4 w-4 text-emerald-600" />
//                   <span>Payment</span>
//                 </TabsTrigger>
//                 <TabsTrigger value="notifications" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
//                   <Bell className="h-4 w-4 text-orange-600" />
//                   <span>Alerts</span>
//                 </TabsTrigger>
//                 <TabsTrigger value="advanced" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
//                   <Cog className="h-4 w-4 text-slate-600" />
//                   <span>Advanced</span>
//                 </TabsTrigger>
//               </TabsList>
//             </div>

//             <TabsContent value="general">
//               <Card className="border-0 shadow-xl overflow-hidden">
//                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
//                   <CardHeader className="p-0">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-blue-100 rounded-lg">
//                         <Building2 className="h-6 w-6 text-[#004AAD]" />
//                       </div>
//                       <div>
//                         <CardTitle className="text-2xl text-slate-800">General Settings</CardTitle>
//                         <CardDescription className="text-slate-600">Basic site information and contact details</CardDescription>
//                       </div>
//                     </div>
//                   </CardHeader>
//                 </div>
//                 <CardContent className="p-6 space-y-8">
//                   <div className="space-y-6">
//                     <div>
//                       <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                         <span className="w-2 h-2 bg-[#004AAD] rounded-full"></span>
//                         Site Information
//                       </h3>
//                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                         <div className="space-y-3">
//                           <Label className="text-slate-700 font-medium">Site Name</Label>
//                           <Input
//                             value={settings.site_name || ''}
//                             onChange={(e) => updateSetting('site_name', e.target.value)}
//                             placeholder="ROOMAC"
//                             className="h-11 border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
//                           />
//                         </div>
//                         <div className="space-y-3">
//                           <Label className="text-slate-700 font-medium">Site Tagline</Label>
//                           <Input
//                             value={settings.site_tagline || ''}
//                             onChange={(e) => updateSetting('site_tagline', e.target.value)}
//                             placeholder="Comfort, Care, and Quality Accommodation"
//                             className="h-11 border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     <Separator className="my-4" />

//                     <div>
//                       <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                         <span className="w-2 h-2 bg-[#004AAD] rounded-full"></span>
//                         Contact Details
//                       </h3>
//                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                         <div className="space-y-3">
//                           <Label className="text-slate-700 font-medium">Contact Email</Label>
//                           <Input
//                             type="email"
//                             value={settings.contact_email || ''}
//                             onChange={(e) => updateSetting('contact_email', e.target.value)}
//                             placeholder="info@roomac.com"
//                             className="h-11 border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
//                           />
//                         </div>
//                         <div className="space-y-3">
//                           <Label className="text-slate-700 font-medium">Contact Phone</Label>
//                           <Input
//                             value={settings.contact_phone || ''}
//                             onChange={(e) => updateSetting('contact_phone', e.target.value)}
//                             placeholder="+919876543210"
//                             className="h-11 border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
//                           />
//                         </div>
//                         <div className="space-y-3">
//                           <Label className="text-slate-700 font-medium">WhatsApp Number</Label>
//                           <Input
//                             value={settings.whatsapp_number || ''}
//                             onChange={(e) => updateSetting('whatsapp_number', e.target.value)}
//                             placeholder="919876543210"
//                             className="h-11 border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
//                           />
//                         </div>
//                         <div className="space-y-3">
//                           <Label className="text-slate-700 font-medium">Currency</Label>
//                           <Select
//                             value={settings.currency || 'INR'}
//                             onValueChange={(value) => updateSetting('currency', value)}
//                           >
//                             <SelectTrigger className="h-11 border-slate-300 focus:ring-[#004AAD]">
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="INR">INR (₹)</SelectItem>
//                               <SelectItem value="USD">USD ($)</SelectItem>
//                               <SelectItem value="EUR">EUR (€)</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>
//                         <div className="space-y-3 lg:col-span-2">
//                           <Label className="text-slate-700 font-medium">Contact Address</Label>
//                           <Textarea
//                             value={settings.contact_address || ''}
//                             onChange={(e) => updateSetting('contact_address', e.target.value)}
//                             placeholder="Hinjawadi, Pune, Maharashtra 411057"
//                             rows={3}
//                             className="border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     <Separator className="my-4" />

//                     <div>
//                       <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                         <span className="w-2 h-2 bg-[#004AAD] rounded-full"></span>
//                         Social Media Links
//                       </h3>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         <div className="space-y-3">
//                           <Label className="text-slate-700 font-medium">Facebook URL</Label>
//                           <Input
//                             value={settings.facebook_url || ''}
//                             onChange={(e) => updateSetting('facebook_url', e.target.value)}
//                             placeholder="https://facebook.com/roomac"
//                             className="h-11 border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
//                           />
//                         </div>
//                         <div className="space-y-3">
//                           <Label className="text-slate-700 font-medium">Instagram URL</Label>
//                           <Input
//                             value={settings.instagram_url || ''}
//                             onChange={(e) => updateSetting('instagram_url', e.target.value)}
//                             placeholder="https://instagram.com/roomac"
//                             className="h-11 border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
//                           />
//                         </div>
//                         <div className="space-y-3">
//                           <Label className="text-slate-700 font-medium">LinkedIn URL</Label>
//                           <Input
//                             value={settings.linkedin_url || ''}
//                             onChange={(e) => updateSetting('linkedin_url', e.target.value)}
//                             placeholder="https://linkedin.com/company/roomac"
//                             className="h-11 border-slate-300 focus:border-[#004AAD] focus:ring-[#004AAD]"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="branding">
//               <Card className="border-0 shadow-xl overflow-hidden">
//                 <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b">
//                   <CardHeader className="p-0">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-purple-100 rounded-lg">
//                         <Palette className="h-6 w-6 text-purple-600" />
//                       </div>
//                       <div>
//                         <CardTitle className="text-2xl text-slate-800">Branding & Logo Management</CardTitle>
//                         <CardDescription className="text-slate-600">Upload and manage logos for different sections of your website</CardDescription>
//                       </div>
//                     </div>
//                   </CardHeader>
//                 </div>
//                 <CardContent className="p-6 space-y-8">
//                   <div className="space-y-6">
//                     <div>
//                       <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
//                         <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
//                         Logo Management
//                       </h3>
//                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                         {[
//                           { key: 'logo_header', label: 'Header Logo', desc: 'Recommended: 200x60px', bg: 'bg-white' },
//                           { key: 'logo_footer', label: 'Footer Logo', desc: 'Recommended: 180x50px', bg: 'bg-slate-900' },
//                           { key: 'logo_admin_sidebar', label: 'Admin Sidebar Logo', desc: 'Recommended: 150x50px', bg: 'bg-[#004AAD]' },
//                           { key: 'favicon_url', label: 'Favicon', desc: 'Recommended: 32x32px', bg: 'bg-white' }
//                         ].map((item) => (
//                           <div key={item.key} className="space-y-4">
//                             <div>
//                               <Label className="text-slate-700 font-medium block mb-2">{item.label}</Label>
//                               <div className="flex gap-2">
//                                 <Input
//                                   value={settings[item.key] || ''}
//                                   onChange={(e) => updateSetting(item.key, e.target.value)}
//                                   placeholder={`https://example.com/${item.key.replace(/_/g, '-')}.png`}
//                                   className="h-11 border-slate-300 focus:border-purple-600 focus:ring-purple-600"
//                                 />
//                                 <Button
//                                   variant="outline"
//                                   size="icon"
//                                   onClick={() => triggerFileInput(item.key)}
//                                   disabled={uploading[item.key]}
//                                   className="h-11 w-11 border-slate-300 hover:border-purple-600 hover:bg-purple-50"
//                                 >
//                                   {uploading[item.key] ? (
//                                     <RefreshCw className="h-4 w-4 animate-spin" />
//                                   ) : (
//                                     <Upload className="h-4 w-4" />
//                                   )}
//                                 </Button>
//                               </div>
//                               <p className="text-xs text-slate-500 mt-2">{item.desc}</p>
//                             </div>
//                             {settings[item.key] && (
//                               <div className={`${item.bg} border border-slate-200 rounded-xl p-6 flex items-center justify-center h-32 transition-all duration-300 hover:shadow-md`}>
//                                 <img 
//                                   src={settings[item.key]} 
//                                   alt={item.label} 
//                                   className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105" 
//                                 />
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <Separator className="my-4" />

//                     <div>
//                       <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
//                         <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
//                         Brand Colors
//                       </h3>
//                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                         <div className="space-y-4">
//                           <Label className="text-slate-700 font-medium">Primary Color</Label>
//                           <div className="flex items-center gap-4">
//                             <div className="relative">
//                               <Input
//                                 type="color"
//                                 value={settings.primary_color || '#004AAD'}
//                                 onChange={(e) => updateSetting('primary_color', e.target.value)}
//                                 className="w-16 h-16 rounded-xl cursor-pointer border-0 shadow-sm"
//                               />
//                               <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-md border text-xs font-medium shadow-sm">
//                                 Primary
//                               </div>
//                             </div>
//                             <div className="flex-1">
//                               <Input
//                                 value={settings.primary_color || '#004AAD'}
//                                 onChange={(e) => updateSetting('primary_color', e.target.value)}
//                                 placeholder="#004AAD"
//                                 className="h-11 border-slate-300 focus:border-purple-600 focus:ring-purple-600"
//                               />
//                             </div>
//                           </div>
//                           <div className="flex gap-2 mt-4">
//                             <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.primary_color || '#004AAD' }}></div>
//                             <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.primary_color || '#004AAD', opacity: 0.8 }}></div>
//                             <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.primary_color || '#004AAD', opacity: 0.6 }}></div>
//                             <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.primary_color || '#004AAD', opacity: 0.4 }}></div>
//                           </div>
//                         </div>

//                         <div className="space-y-4">
//                           <Label className="text-slate-700 font-medium">Secondary Color</Label>
//                           <div className="flex items-center gap-4">
//                             <div className="relative">
//                               <Input
//                                 type="color"
//                                 value={settings.secondary_color || '#FFC107'}
//                                 onChange={(e) => updateSetting('secondary_color', e.target.value)}
//                                 className="w-16 h-16 rounded-xl cursor-pointer border-0 shadow-sm"
//                               />
//                               <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-md border text-xs font-medium shadow-sm">
//                                 Secondary
//                               </div>
//                             </div>
//                             <div className="flex-1">
//                               <Input
//                                 value={settings.secondary_color || '#FFC107'}
//                                 onChange={(e) => updateSetting('secondary_color', e.target.value)}
//                                 placeholder="#FFC107"
//                                 className="h-11 border-slate-300 focus:border-purple-600 focus:ring-purple-600"
//                               />
//                             </div>
//                           </div>
//                           <div className="flex gap-2 mt-4">
//                             <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.secondary_color || '#FFC107' }}></div>
//                             <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.secondary_color || '#FFC107', opacity: 0.8 }}></div>
//                             <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.secondary_color || '#FFC107', opacity: 0.6 }}></div>
//                             <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: settings.secondary_color || '#FFC107', opacity: 0.4 }}></div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="sms">
//               <Card className="border-0 shadow-xl overflow-hidden">
//                 <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
//                   <CardHeader className="p-0">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-green-100 rounded-lg">
//                         <MessageSquare className="h-6 w-6 text-green-600" />
//                       </div>
//                       <div>
//                         <CardTitle className="text-2xl text-slate-800">SMS Provider Settings (MSG91)</CardTitle>
//                         <CardDescription className="text-slate-600">Configure MSG91 SMS service for notifications and OTP</CardDescription>
//                       </div>
//                     </div>
//                   </CardHeader>
//                 </div>
//                 <CardContent className="p-6 space-y-8">
//                   <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-white rounded-2xl border border-green-200">
//                     <div className="flex items-center gap-4">
//                       <div className="p-3 bg-green-100 rounded-xl">
//                         <MessageSquare className="h-6 w-6 text-green-600" />
//                       </div>
//                       <div>
//                         <p className="font-semibold text-slate-800">Enable SMS Notifications</p>
//                         <p className="text-sm text-slate-600">Send SMS to tenants and admins for alerts and OTP</p>
//                       </div>
//                     </div>
//                     <Switch
//                       checked={settings.sms_enabled === 'true'}
//                       onCheckedChange={(checked) => updateSetting('sms_enabled', checked ? 'true' : 'false')}
//                       className="data-[state=checked]:bg-green-600"
//                     />
//                   </div>

//                   <div className="space-y-6">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium">SMS Provider</Label>
//                         <Select
//                           value={settings.sms_provider || 'MSG91'}
//                           onValueChange={(value) => updateSetting('sms_provider', value)}
//                         >
//                           <SelectTrigger className="h-11 border-slate-300 focus:ring-green-600">
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="MSG91" className="flex items-center gap-2">
//                               <span>MSG91</span>
//                               <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">Recommended</Badge>
//                             </SelectItem>
//                             <SelectItem value="Gupshup">Gupshup</SelectItem>
//                             <SelectItem value="Textlocal">Textlocal</SelectItem>
//                             <SelectItem value="Kaleyra">Kaleyra</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium">Sender ID</Label>
//                         <Input
//                           value={settings.sms_sender_id || ''}
//                           onChange={(e) => updateSetting('sms_sender_id', e.target.value)}
//                           placeholder="ROOMAC"
//                           maxLength={6}
//                           className="h-11 border-slate-300 focus:border-green-600 focus:ring-green-600"
//                         />
//                         <p className="text-xs text-slate-500">6 characters max (must be approved by provider)</p>
//                       </div>
//                     </div>

//                     <div className="space-y-3">
//                       <Label className="text-slate-700 font-medium">MSG91 API Key</Label>
//                       <div className="relative">
//                         <Input
//                           type={showSecrets.sms_api_key ? "text" : "password"}
//                           value={settings.sms_api_key || ''}
//                           onChange={(e) => updateSetting('sms_api_key', e.target.value)}
//                           placeholder="Enter your MSG91 authentication key"
//                           className="h-11 border-slate-300 focus:border-green-600 focus:ring-green-600 pr-12"
//                         />
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
//                           onClick={() => toggleSecretVisibility('sms_api_key')}
//                         >
//                           {showSecrets.sms_api_key ? (
//                             <EyeOff className="h-4 w-4 text-slate-500" />
//                           ) : (
//                             <Eye className="h-4 w-4 text-slate-500" />
//                           )}
//                         </Button>
//                       </div>
//                       <p className="text-xs text-slate-500">
//                         Get your API key from{' '}
//                         <a href="https://control.msg91.com/app/settings" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium">
//                           MSG91 Dashboard
//                         </a>
//                       </p>
//                     </div>

//                     <div className="space-y-3">
//                       <Label className="text-slate-700 font-medium">SMS Route</Label>
//                       <Select
//                         value={settings.sms_route || 'transactional'}
//                         onValueChange={(value) => updateSetting('sms_route', value)}
//                       >
//                         <SelectTrigger className="h-11 border-slate-300 focus:ring-green-600">
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="transactional" className="flex items-center justify-between">
//                             <span>Transactional</span>
//                             <Badge className="bg-blue-100 text-blue-800">24x7 Delivery</Badge>
//                           </SelectItem>
//                           <SelectItem value="promotional" className="flex items-center justify-between">
//                             <span>Promotional</span>
//                             <Badge className="bg-amber-100 text-amber-800">9AM-9PM Only</Badge>
//                           </SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
//                     <div className="flex items-start gap-3">
//                       <div className="p-2 bg-amber-100 rounded-lg mt-1">
//                         <Shield className="h-5 w-5 text-amber-600" />
//                       </div>
//                       <div>
//                         <p className="font-semibold text-amber-800">Important Notes</p>
//                         <ul className="mt-3 space-y-2">
//                           <li className="flex items-start gap-2 text-sm text-amber-700">
//                             <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></span>
//                             Sender ID must be approved by MSG91 before use
//                           </li>
//                           <li className="flex items-start gap-2 text-sm text-amber-700">
//                             <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></span>
//                             Transactional route for OTP and alerts (24x7 delivery)
//                           </li>
//                           <li className="flex items-start gap-2 text-sm text-amber-700">
//                             <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></span>
//                             Promotional route for marketing messages (9 AM - 9 PM only)
//                           </li>
//                           <li className="flex items-start gap-2 text-sm text-amber-700">
//                             <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></span>
//                             Test your configuration with a sample SMS after saving
//                           </li>
//                         </ul>
//                       </div>
//                     </div>
//                     <div className="mt-4 flex justify-end">
//                       <Button 
//                         variant="outline" 
//                         className="border-amber-300 text-amber-700 hover:bg-amber-50"
//                         onClick={() => testConnection('sms')}
//                       >
//                         <TestTube className="h-4 w-4 mr-2" />
//                         Test SMS Connection
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="email">
//               <Card className="border-0 shadow-xl overflow-hidden">
//                 <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b">
//                   <CardHeader className="p-0">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-blue-100 rounded-lg">
//                         <Mail className="h-6 w-6 text-blue-600" />
//                       </div>
//                       <div>
//                         <CardTitle className="text-2xl text-slate-800">Email SMTP Settings</CardTitle>
//                         <CardDescription className="text-slate-600">Configure SMTP server for sending emails</CardDescription>
//                       </div>
//                     </div>
//                   </CardHeader>
//                 </div>
//                 <CardContent className="p-6 space-y-8">
//                   <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-200">
//                     <div className="flex items-center gap-4">
//                       <div className="p-3 bg-blue-100 rounded-xl">
//                         <Mail className="h-6 w-6 text-blue-600" />
//                       </div>
//                       <div>
//                         <p className="font-semibold text-slate-800">Enable Email Notifications</p>
//                         <p className="text-sm text-slate-600">Send emails to tenants and admins for notifications</p>
//                       </div>
//                     </div>
//                     <Switch
//                       checked={settings.email_enabled === 'true'}
//                       onCheckedChange={(checked) => updateSetting('email_enabled', checked ? 'true' : 'false')}
//                       className="data-[state=checked]:bg-blue-600"
//                     />
//                   </div>

//                   <div className="space-y-6">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium">SMTP Host</Label>
//                         <Input
//                           value={settings.smtp_host || ''}
//                           onChange={(e) => updateSetting('smtp_host', e.target.value)}
//                           placeholder="smtp.gmail.com"
//                           className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
//                         />
//                       </div>

//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium">SMTP Port</Label>
//                         <Input
//                           type="number"
//                           value={settings.smtp_port || ''}
//                           onChange={(e) => updateSetting('smtp_port', e.target.value)}
//                           placeholder="587"
//                           className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
//                         />
//                       </div>

//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium">SMTP Username</Label>
//                           <Input
//                             value={settings.smtp_username || ''}
//                             onChange={(e) => updateSetting('smtp_username', e.target.value)}
//                             placeholder="your-email@gmail.com"
//                             className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
//                           />
//                       </div>

//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium">SMTP Password</Label>
//                         <div className="relative">
//                           <Input
//                             type={showSecrets.smtp_password ? "text" : "password"}
//                             value={settings.smtp_password || ''}
//                             onChange={(e) => updateSetting('smtp_password', e.target.value)}
//                             placeholder="App password or SMTP password"
//                             className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600 pr-12"
//                           />
//                           <Button
//                             type="button"
//                             variant="ghost"
//                             size="icon"
//                             className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
//                             onClick={() => toggleSecretVisibility('smtp_password')}
//                           >
//                             {showSecrets.smtp_password ? (
//                               <EyeOff className="h-4 w-4 text-slate-500" />
//                             ) : (
//                               <Eye className="h-4 w-4 text-slate-500" />
//                             )}
//                           </Button>
//                         </div>
//                       </div>

//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium">From Email</Label>
//                         <Input
//                           type="email"
//                           value={settings.smtp_from_email || ''}
//                           onChange={(e) => updateSetting('smtp_from_email', e.target.value)}
//                           placeholder="noreply@roomac.com"
//                           className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
//                         />
//                       </div>

//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium">From Name</Label>
//                         <Input
//                           value={settings.smtp_from_name || ''}
//                           onChange={(e) => updateSetting('smtp_from_name', e.target.value)}
//                           placeholder="ROOMAC"
//                           className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-6">
//                     <div className="flex items-start gap-3">
//                       <div className="p-2 bg-sky-100 rounded-lg mt-1">
//                         <Shield className="h-5 w-5 text-sky-600" />
//                       </div>
//                       <div>
//                         <p className="font-semibold text-sky-800">Gmail Configuration Guide</p>
//                         <ul className="mt-3 space-y-2">
//                           <li className="flex items-start gap-2 text-sm text-sky-700">
//                             <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-1.5"></span>
//                             Use App Password instead of regular password
//                           </li>
//                           <li className="flex items-start gap-2 text-sm text-sky-700">
//                             <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-1.5"></span>
//                             Enable 2-Step Verification in your Google Account
//                           </li>
//                           <li className="flex items-start gap-2 text-sm text-sky-700">
//                             <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-1.5"></span>
//                             Generate App Password at: myaccount.google.com/apppasswords
//                           </li>
//                           <li className="flex items-start gap-2 text-sm text-sky-700">
//                             <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-1.5"></span>
//                             Use Port 587 with TLS for secure connection
//                           </li>
//                         </ul>
//                       </div>
//                     </div>
//                     <div className="mt-4 flex justify-end">
//                       <Button 
//                         variant="outline" 
//                         className="border-sky-300 text-sky-700 hover:bg-sky-50"
//                         onClick={() => testConnection('email')}
//                       >
//                         <TestTube className="h-4 w-4 mr-2" />
//                         Test Email Connection
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="payment">
//               <Card className="border-0 shadow-xl overflow-hidden">
//                 <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b">
//                   <CardHeader className="p-0">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-emerald-100 rounded-lg">
//                         <CreditCard className="h-6 w-6 text-emerald-600" />
//                       </div>
//                       <div>
//                         <CardTitle className="text-2xl text-slate-800">Payment Gateway Settings</CardTitle>
//                         <CardDescription className="text-slate-600">Configure Razorpay for online payments</CardDescription>
//                       </div>
//                     </div>
//                   </CardHeader>
//                 </div>
//                 <CardContent className="p-6 space-y-8">
//                   <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-50 to-white rounded-2xl border border-emerald-200">
//                     <div className="flex items-center gap-4">
//                       <div className="p-3 bg-emerald-100 rounded-xl">
//                         <CreditCard className="h-6 w-6 text-emerald-600" />
//                       </div>
//                       <div>
//                         <p className="font-semibold text-slate-800">Enable Razorpay</p>
//                         <p className="text-sm text-slate-600">Accept online payments via Razorpay gateway</p>
//                       </div>
//                     </div>
//                     <Switch
//                       checked={settings.razorpay_enabled === 'true'}
//                       onCheckedChange={(checked) => updateSetting('razorpay_enabled', checked ? 'true' : 'false')}
//                       className="data-[state=checked]:bg-emerald-600"
//                     />
//                   </div>

//                   <div className="space-y-6">
//                     <div className="space-y-3">
//                       <Label className="text-slate-700 font-medium">Razorpay Key ID</Label>
//                       <div className="relative">
//                         <Input
//                           type={showSecrets.razorpay_key_id ? "text" : "password"}
//                           value={settings.razorpay_key_id || ''}
//                           onChange={(e) => updateSetting('razorpay_key_id', e.target.value)}
//                           placeholder="rzp_test_xxxxxxxxxxxxx"
//                           className="h-11 border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 pr-12"
//                         />
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
//                           onClick={() => toggleSecretVisibility('razorpay_key_id')}
//                         >
//                           {showSecrets.razorpay_key_id ? (
//                             <EyeOff className="h-4 w-4 text-slate-500" />
//                           ) : (
//                             <Eye className="h-4 w-4 text-slate-500" />
//                           )}
//                         </Button>
//                       </div>
//                     </div>

//                     <div className="space-y-3">
//                       <Label className="text-slate-700 font-medium">Razorpay Key Secret</Label>
//                       <div className="relative">
//                         <Input
//                           type={showSecrets.razorpay_key_secret ? "text" : "password"}
//                           value={settings.razorpay_key_secret || ''}
//                           onChange={(e) => updateSetting('razorpay_key_secret', e.target.value)}
//                           placeholder="Enter your Razorpay secret key"
//                           className="h-11 border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 pr-12"
//                         />
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
//                           onClick={() => toggleSecretVisibility('razorpay_key_secret')}
//                         >
//                           {showSecrets.razorpay_key_secret ? (
//                             <EyeOff className="h-4 w-4 text-slate-500" />
//                           ) : (
//                             <Eye className="h-4 w-4 text-slate-500" />
//                           )}
//                         </Button>
//                       </div>
//                     </div>

//                     <div className="space-y-3">
//                       <Label className="text-slate-700 font-medium">Webhook Secret</Label>
//                       <div className="relative">
//                         <Input
//                           type={showSecrets.razorpay_webhook_secret ? "text" : "password"}
//                           value={settings.razorpay_webhook_secret || ''}
//                           onChange={(e) => updateSetting('razorpay_webhook_secret', e.target.value)}
//                           placeholder="whsec_xxxxxxxxxxxxx"
//                           className="h-11 border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 pr-12"
//                         />
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
//                           onClick={() => toggleSecretVisibility('razorpay_webhook_secret')}
//                         >
//                           {showSecrets.razorpay_webhook_secret ? (
//                             <EyeOff className="h-4 w-4 text-slate-500" />
//                           ) : (
//                             <Eye className="h-4 w-4 text-slate-500" />
//                           )}
//                         </Button>
//                       </div>
//                       <p className="text-xs text-slate-500">Used to verify webhook signatures</p>
//                     </div>
//                   </div>

//                   <div className="bg-gradient-to-r from-lime-50 to-emerald-50 border border-lime-200 rounded-2xl p-6">
//                     <div className="flex items-start gap-3">
//                       <div className="p-2 bg-lime-100 rounded-lg mt-1">
//                         <CreditCard className="h-5 w-5 text-lime-600" />
//                       </div>
//                       <div>
//                         <p className="font-semibold text-lime-800">Get Started with Razorpay</p>
//                         <ul className="mt-3 space-y-2">
//                           <li className="flex items-start gap-2 text-sm text-lime-700">
//                             <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mt-1.5"></span>
//                             Sign up at razorpay.com and complete KYC
//                           </li>
//                           <li className="flex items-start gap-2 text-sm text-lime-700">
//                             <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mt-1.5"></span>
//                             Get API keys from Dashboard → Settings
//                           </li>
//                           <li className="flex items-start gap-2 text-sm text-lime-700">
//                             <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mt-1.5"></span>
//                             Use Test mode keys for testing (rzp_test_)
//                           </li>
//                           <li className="flex items-start gap-2 text-sm text-lime-700">
//                             <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mt-1.5"></span>
//                             Switch to Live keys after going live (rzp_live_)
//                           </li>
//                         </ul>
//                       </div>
//                     </div>
//                     <div className="mt-4 flex justify-end">
//                       <Button 
//                         variant="outline" 
//                         className="border-lime-300 text-lime-700 hover:bg-lime-50"
//                         onClick={() => testConnection('payment')}
//                       >
//                         <TestTube className="h-4 w-4 mr-2" />
//                         Test Payment Connection
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="notifications">
//               <Card className="border-0 shadow-xl overflow-hidden">
//                 <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b">
//                   <CardHeader className="p-0">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-orange-100 rounded-lg">
//                         <Bell className="h-6 w-6 text-orange-600" />
//                       </div>
//                       <div>
//                         <CardTitle className="text-2xl text-slate-800">Notification Preferences</CardTitle>
//                         <CardDescription className="text-slate-600">Configure which events trigger notifications</CardDescription>
//                       </div>
//                     </div>
//                   </CardHeader>
//                 </div>
//                 <CardContent className="p-6 space-y-8">
//                   <div className="space-y-4">
//                     {[
//                       { key: 'notify_new_booking', label: 'New Booking Notifications', desc: 'Get notified when new bookings are created' },
//                       { key: 'notify_payment_received', label: 'Payment Received Notifications', desc: 'Get notified when payments are received' },
//                       { key: 'notify_maintenance_request', label: 'Maintenance Request Notifications', desc: 'Get notified about maintenance requests' },
//                       { key: 'notify_complaint', label: 'Complaint Notifications', desc: 'Get notified about new complaints' }
//                     ].map((item) => (
//                       <div key={item.key} className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-300">
//                         <div className="flex items-start gap-4">
//                           <div className="p-2 bg-white border border-slate-200 rounded-lg">
//                             <Bell className="h-5 w-5 text-orange-600" />
//                           </div>
//                           <div>
//                             <p className="font-semibold text-slate-800">{item.label}</p>
//                             <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
//                           </div>
//                         </div>
//                         <Switch
//                           checked={settings[item.key] === 'true'}
//                           onCheckedChange={(checked) => updateSetting(item.key, checked ? 'true' : 'false')}
//                           className="data-[state=checked]:bg-orange-600"
//                         />
//                       </div>
//                     ))}
//                   </div>

//                   <Separator className="my-4" />

//                   <div>
//                     <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
//                       <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
//                       Admin Notification Contacts
//                     </h3>
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium">Admin Email</Label>
//                         <Input
//                           type="email"
//                           value={settings.admin_notification_email || ''}
//                           onChange={(e) => updateSetting('admin_notification_email', e.target.value)}
//                           placeholder="admin@roomac.com"
//                           className="h-11 border-slate-300 focus:border-orange-600 focus:ring-orange-600"
//                         />
//                       </div>
//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium">Admin Phone</Label>
//                         <Input
//                           value={settings.admin_notification_phone || ''}
//                           onChange={(e) => updateSetting('admin_notification_phone', e.target.value)}
//                           placeholder="+919876543210"
//                           className="h-11 border-slate-300 focus:border-orange-600 focus:ring-orange-600"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="advanced">
//               <Card className="border-0 shadow-xl overflow-hidden">
//                 <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b">
//                   <CardHeader className="p-0">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-slate-100 rounded-lg">
//                         <Cog className="h-6 w-6 text-slate-600" />
//                       </div>
//                       <div>
//                         <CardTitle className="text-2xl text-slate-800">Advanced Settings</CardTitle>
//                         <CardDescription className="text-slate-600">System preferences and analytics</CardDescription>
//                       </div>
//                     </div>
//                   </CardHeader>
//                 </div>
//                 <CardContent className="p-6 space-y-8">
//                   <div className="space-y-6">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium flex items-center gap-2">
//                           <Globe className="h-4 w-4 text-slate-500" />
//                           Timezone
//                         </Label>
//                         <Select
//                           value={settings.timezone || 'Asia/Kolkata'}
//                           onValueChange={(value) => updateSetting('timezone', value)}
//                         >
//                           <SelectTrigger className="h-11 border-slate-300 focus:ring-slate-600">
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
//                             <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
//                             <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
//                             <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium flex items-center gap-2">
//                           <Calendar className="h-4 w-4 text-slate-500" />
//                           Date Format
//                         </Label>
//                         <Select
//                           value={settings.date_format || 'DD/MM/YYYY'}
//                           onValueChange={(value) => updateSetting('date_format', value)}
//                         >
//                           <SelectTrigger className="h-11 border-slate-300 focus:ring-slate-600">
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
//                             <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
//                             <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium">Google Analytics ID</Label>
//                         <Input
//                           value={settings.google_analytics_id || ''}
//                           onChange={(e) => updateSetting('google_analytics_id', e.target.value)}
//                           placeholder="G-XXXXXXXXXX"
//                           className="h-11 border-slate-300 focus:border-slate-600 focus:ring-slate-600"
//                         />
//                       </div>

//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium">Facebook Pixel ID</Label>
//                         <Input
//                           value={settings.facebook_pixel_id || ''}
//                           onChange={(e) => updateSetting('facebook_pixel_id', e.target.value)}
//                           placeholder="XXXXXXXXXXXXXXX"
//                           className="h-11 border-slate-300 focus:border-slate-600 focus:ring-slate-600"
//                         />
//                       </div>

//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium flex items-center gap-2">
//                           <FileText className="h-4 w-4 text-slate-500" />
//                           Terms & Conditions URL
//                         </Label>
//                         <Input
//                           value={settings.terms_url || ''}
//                           onChange={(e) => updateSetting('terms_url', e.target.value)}
//                           placeholder="/terms"
//                           className="h-11 border-slate-300 focus:border-slate-600 focus:ring-slate-600"
//                         />
//                       </div>

//                       <div className="space-y-3">
//                         <Label className="text-slate-700 font-medium flex items-center gap-2">
//                           <Shield className="h-4 w-4 text-slate-500" />
//                           Privacy Policy URL
//                         </Label>
//                         <Input
//                           value={settings.privacy_url || ''}
//                           onChange={(e) => updateSetting('privacy_url', e.target.value)}
//                           placeholder="/privacy"
//                           className="h-11 border-slate-300 focus:border-slate-600 focus:ring-slate-600"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <Separator className="my-4" />

//                   <div className="space-y-2">
//                     <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${settings.maintenance_mode === 'true' 
//                       ? 'bg-red-50 border-red-200' 
//                       : 'bg-gray-50 border-gray-200'}`}
//                     >
//                       <div className="flex items-center gap-2">
//                         <div className={`p-1.5 rounded ${settings.maintenance_mode === 'true' 
//                           ? 'bg-red-100 text-red-600' 
//                           : 'bg-gray-100 text-gray-600'}`}
//                         >
//                           <Wrench className="h-3.5 w-3.5" />
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <span className="text-sm font-medium">
//                             Maintenance Mode
//                           </span>
//                           {settings.maintenance_mode === 'true' && (
//                             <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">Active</span>
//                           )}
//                         </div>
//                       </div>
//                       <Switch
//                         checked={settings.maintenance_mode === 'true'}
//                         onCheckedChange={(checked) => updateSetting('maintenance_mode', checked ? 'true' : 'false')}
//                         className={`scale-90 ${settings.maintenance_mode === 'true' 
//                           ? 'data-[state=checked]:bg-red-600' 
//                           : 'data-[state=checked]:bg-gray-600'}`}
//                       />
//                     </div>

//                     <div className={`overflow-hidden transition-all duration-300 ${settings.maintenance_mode === 'true' 
//                       ? 'max-h-20 opacity-100' 
//                       : 'max-h-0 opacity-0'}`}
//                     >
//                       <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-700">
//                         <div className="flex items-center gap-1.5">
//                           <Bell className="h-3 w-3 flex-shrink-0" />
//                           <span>Site is in maintenance. Public access is disabled. Turn off when done.</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>

//           <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//               <div>
//                 <p className="font-medium text-slate-800">Made changes to your settings?</p>
//                 <p className="text-sm text-slate-500">Don't forget to save your changes</p>
//               </div>
//               <div className="flex gap-3">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     const settingsValues: Record<string, any> = {};
//                     Object.entries(settingsData!).forEach(([key, settingData]) => {
//                       settingsValues[key] = settingData.value;
//                     });
//                     setSettings(settingsValues);
//                     toast.info('Changes reset to saved values');
//                   }}
//                   disabled={saving}
//                   className="border-slate-300 text-slate-700 hover:bg-blue-500 min-w-[120px]"
//                 >
//                   <RefreshCw className="h-4 w-4 mr-2" />
//                   Reset Changes
//                 </Button>
//                 <Button
//                   onClick={handleSave}
//                   disabled={saving}
//                   className="bg-gradient-to-r from-[#004AAD] to-[#0066CC] hover:from-[#003580] hover:to-[#004AAD] min-w-[140px] shadow-md"
//                 >
//                   {saving ? (
//                     <>
//                       <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
//                       Saving...
//                     </>
//                   ) : (
//                     <>
//                       <Save className="h-4 w-4 mr-2" />
//                       Save All Settings
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// app/admin/settings/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSettings, updateSettings, uploadFile, SettingsData } from '@/lib/settingsApi';
import SettingsLayout from '@/components/admin/settings/SettingsLayout';
import GeneralSettings from '@/components/admin/settings/GeneralSettings';
import BrandingSettings from '@/components/admin/settings/BrandingSettings';
import SMSSettings from '@/components/admin/settings/SMSSettings';
import EmailSettings from '@/components/admin/settings/EmailSettings';
import PaymentSettings from '@/components/admin/settings/PaymentSettings';
import NotificationSettings from '@/components/admin/settings/NotificationSettings';
import AdvancedSettings from '@/components/admin/settings/AdvancedSettings';
import SaveSettingsBar from '@/components/admin/settings/SaveSettingsBar';
import LoadingSkeleton from '@/components/admin/settings/LoadingSkeleton';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setSettingsData(data);
      
      const settingsValues: Record<string, any> = {};
      Object.entries(data).forEach(([key, settingData]) => {
        settingsValues[key] = settingData.value;
      });
      setSettings(settingsValues);
      
      toast.success('Settings loaded successfully');
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error(error.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateSettings(settings);
      
      if (result.success) {
        toast.success(result.message || 'Settings saved successfully', {
          description: 'Your settings have been updated',
        });
        await loadSettings();
      } else {
        toast.error(result.message || 'Failed to save settings');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (key: string, file: File) => {
    setUploading(prev => ({ ...prev, [key]: true }));
    try {
      const result = await uploadFile(file, 'logos', key);
      
      if (result.success && result.url) {
        updateSetting(key, result.url);
        toast.success(result.message || 'Logo uploaded successfully', {
          description: 'Image has been uploaded and saved',
        });
      } else {
        toast.error(result.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const testConnection = async (type: 'sms' | 'email' | 'payment') => {
    toast.info(`Testing ${type} connection...`);
    // Implement test functionality here
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <SettingsLayout title="Settings" description="Manage your platform configuration">
      <GeneralSettings 
        settings={settings}
        updateSetting={updateSetting}
      />
      
      <BrandingSettings 
        settings={settings}
        updateSetting={updateSetting}
        uploading={uploading}
        handleFileUpload={handleFileUpload}
      />
      
      <SMSSettings 
        settings={settings}
        updateSetting={updateSetting}
        showSecrets={showSecrets}
        toggleSecretVisibility={toggleSecretVisibility}
        testConnection={testConnection}
      />
      
      <EmailSettings 
        settings={settings}
        updateSetting={updateSetting}
        showSecrets={showSecrets}
        toggleSecretVisibility={toggleSecretVisibility}
        testConnection={testConnection}
      />
      
      <PaymentSettings 
        settings={settings}
        updateSetting={updateSetting}
        showSecrets={showSecrets}
        toggleSecretVisibility={toggleSecretVisibility}
        testConnection={testConnection}
      />
      
      <NotificationSettings 
        settings={settings}
        updateSetting={updateSetting}
      />
      
      <AdvancedSettings 
        settings={settings}
        updateSetting={updateSetting}
      />

      <SaveSettingsBar 
        saving={saving}
        onSave={handleSave}
        onReset={() => {
          const settingsValues: Record<string, any> = {};
          Object.entries(settingsData!).forEach(([key, settingData]) => {
            settingsValues[key] = settingData.value;
          });
          setSettings(settingsValues);
          toast.info('Changes reset to saved values');
        }}
      />
    </SettingsLayout>
  );
}