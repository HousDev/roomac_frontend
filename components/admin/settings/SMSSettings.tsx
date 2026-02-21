// import { TabsContent } from '@/components/ui/tabs';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Button } from '@/components/ui/button';
// import { Switch } from '@/components/ui/switch';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { MessageSquare, Shield, TestTube, Eye, EyeOff } from 'lucide-react';

// interface SMSSettingsProps {
//   settings: Record<string, any>;
//   updateSetting: (key: string, value: any) => void;
//   showSecrets: Record<string, boolean>;
//   toggleSecretVisibility: (key: string) => void;
//   testConnection: (type: 'sms' | 'email' | 'payment') => void;
// }

// export default function SMSSettings({ 
//   settings, 
//   updateSetting, 
//   showSecrets, 
//   toggleSecretVisibility,
//   testConnection 
// }: SMSSettingsProps) {
//   return (
//     <TabsContent value="sms">
//       <Card className="border-0 shadow-xl overflow-hidden">
//         <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
//           <CardHeader className="p-0">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-green-100 rounded-lg">
//                 <MessageSquare className="h-6 w-6 text-green-600" />
//               </div>
//               <div>
//                 <CardTitle className="text-2xl text-slate-800">SMS Provider Settings (MSG91)</CardTitle>
//                 <CardDescription className="text-slate-600">Configure MSG91 SMS service for notifications and OTP</CardDescription>
//               </div>
//             </div>
//           </CardHeader>
//         </div>
//         <CardContent className="p-6 space-y-8">
//           <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-white rounded-2xl border border-green-200">
//             <div className="flex items-center gap-4">
//               <div className="p-3 bg-green-100 rounded-xl">
//                 <MessageSquare className="h-6 w-6 text-green-600" />
//               </div>
//               <div>
//                 <p className="font-semibold text-slate-800">Enable SMS Notifications</p>
//                 <p className="text-sm text-slate-600">Send SMS to tenants and admins for alerts and OTP</p>
//               </div>
//             </div>
//             <Switch
//               checked={settings.sms_enabled === 'true'}
//               onCheckedChange={(checked) => updateSetting('sms_enabled', checked ? 'true' : 'false')}
//               className="data-[state=checked]:bg-green-600"
//             />
//           </div>

//           <div className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="space-y-3">
//                 <Label className="text-slate-700 font-medium">SMS Provider</Label>
//                 <Select
//                   value={settings.sms_provider || 'MSG91'}
//                   onValueChange={(value) => updateSetting('sms_provider', value)}
//                 >
//                   <SelectTrigger className="h-11 border-slate-300 focus:ring-green-600">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="MSG91" className="flex items-center gap-2">
//                       <span>MSG91</span>
//                       <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">Recommended</Badge>
//                     </SelectItem>
//                     <SelectItem value="Gupshup">Gupshup</SelectItem>
//                     <SelectItem value="Textlocal">Textlocal</SelectItem>
//                     <SelectItem value="Kaleyra">Kaleyra</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-3">
//                 <Label className="text-slate-700 font-medium">Sender ID</Label>
//                 <Input
//                   value={settings.sms_sender_id || ''}
//                   onChange={(e) => updateSetting('sms_sender_id', e.target.value)}
//                   placeholder="ROOMAC"
//                   maxLength={6}
//                   className="h-11 border-slate-300 focus:border-green-600 focus:ring-green-600"
//                 />
//                 <p className="text-xs text-slate-500">6 characters max (must be approved by provider)</p>
//               </div>
//             </div>

//             <div className="space-y-3">
//               <Label className="text-slate-700 font-medium">MSG91 API Key</Label>
//               <div className="relative">
//                 <Input
//                   type={showSecrets.sms_api_key ? "text" : "password"}
//                   value={settings.sms_api_key || ''}
//                   onChange={(e) => updateSetting('sms_api_key', e.target.value)}
//                   placeholder="Enter your MSG91 authentication key"
//                   className="h-11 border-slate-300 focus:border-green-600 focus:ring-green-600 pr-12"
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
//                   onClick={() => toggleSecretVisibility('sms_api_key')}
//                 >
//                   {showSecrets.sms_api_key ? (
//                     <EyeOff className="h-4 w-4 text-slate-500" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-slate-500" />
//                   )}
//                 </Button>
//               </div>
//               <p className="text-xs text-slate-500">
//                 Get your API key from{' '}
//                 <a href="https://control.msg91.com/app/settings" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium">
//                   MSG91 Dashboard
//                 </a>
//               </p>
//             </div>

//             <div className="space-y-3">
//               <Label className="text-slate-700 font-medium">SMS Route</Label>
//               <Select
//                 value={settings.sms_route || 'transactional'}
//                 onValueChange={(value) => updateSetting('sms_route', value)}
//               >
//                 <SelectTrigger className="h-11 border-slate-300 focus:ring-green-600">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="transactional" className="flex items-center justify-between">
//                     <span>Transactional</span>
//                     <Badge className="bg-blue-100 text-blue-800">24x7 Delivery</Badge>
//                   </SelectItem>
//                   <SelectItem value="promotional" className="flex items-center justify-between">
//                     <span>Promotional</span>
//                     <Badge className="bg-amber-100 text-amber-800">9AM-9PM Only</Badge>
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
//             <div className="flex items-start gap-3">
//               <div className="p-2 bg-amber-100 rounded-lg mt-1">
//                 <Shield className="h-5 w-5 text-amber-600" />
//               </div>
//               <div>
//                 <p className="font-semibold text-amber-800">Important Notes</p>
//                 <ul className="mt-3 space-y-2">
//                   <li className="flex items-start gap-2 text-sm text-amber-700">
//                     <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></span>
//                     Sender ID must be approved by MSG91 before use
//                   </li>
//                   <li className="flex items-start gap-2 text-sm text-amber-700">
//                     <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></span>
//                     Transactional route for OTP and alerts (24x7 delivery)
//                   </li>
//                   <li className="flex items-start gap-2 text-sm text-amber-700">
//                     <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></span>
//                     Promotional route for marketing messages (9 AM - 9 PM only)
//                   </li>
//                   <li className="flex items-start gap-2 text-sm text-amber-700">
//                     <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></span>
//                     Test your configuration with a sample SMS after saving
//                   </li>
//                 </ul>
//               </div>
//             </div>
//             <div className="mt-4 flex justify-end">
//               <Button 
//                 variant="outline" 
//                 className="border-amber-300 text-amber-700 hover:bg-amber-50"
//                 onClick={() => testConnection('sms')}
//               >
//                 <TestTube className="h-4 w-4 mr-2" />
//                 Test SMS Connection
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </TabsContent>
//   );
// }


// import { useState } from 'react';
// import { TabsContent } from '@/components/ui/tabs';
// import { Card, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Button } from '@/components/ui/button';
// import { Switch } from '@/components/ui/switch';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { MessageSquare, Shield, TestTube, Eye, EyeOff, Settings2, X, Check, RefreshCw } from 'lucide-react';

// interface SMSSettingsProps {
//   settings: Record<string, any>;
//   updateSetting: (key: string, value: any) => void;
//   showSecrets: Record<string, boolean>;
//   toggleSecretVisibility: (key: string) => void;
//   testConnection: (type: 'sms' | 'email' | 'payment') => void;
//   onSave: (overrides?: Record<string, any>) => Promise<void>;
// }

// export default function SMSSettings({
//   settings,
//   updateSetting,
//   showSecrets,
//   toggleSecretVisibility,
//   testConnection,
//   onSave,
// }: SMSSettingsProps) {
//   const [modalOpen, setModalOpen] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [draft, setDraft] = useState<Record<string, any>>({});

//   const openModal = () => {
//     setDraft({ ...settings });
//     setModalOpen(true);
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//   };

//   const handleDraftChange = (key: string, value: any) => {
//     setDraft(prev => ({ ...prev, [key]: value }));
//   };

//   const handleModalSave = async () => {
//     setSaving(true);
//     try {
//       // ✅ Pass draft directly as overrides — bypasses React async state lag
//       // Parent merges { ...settings, ...draft } before calling API
//       await onSave(draft);
//       // Also sync draft into parent state for UI consistency
//       Object.entries(draft).forEach(([key, value]) => {
//         updateSetting(key, value);
//       });
//     } finally {
//       setSaving(false);
//       setModalOpen(false);
//     }
//   };

//   const isConnected = settings.sms_enabled === 'true';
//   const provider = settings.sms_provider || '—';
//   const apiKey = settings.sms_api_key || '';
//   const maskedKey = apiKey ? apiKey.slice(0, 8) + '...' : '—';
//   const senderId = settings.sms_sender_id || '—';
//   const route = settings.sms_route || '—';

//   return (
//     <TabsContent value="sms">
//       {/* ── Card View ─────────────────────────────────────────────────── */}
//       <Card className="border border-slate-200 shadow-md rounded-2xl overflow-hidden">
//         <CardContent className="p-6 space-y-5">

//           {/* Header */}
//           <div className="flex items-start justify-between">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-green-100 rounded-xl">
//                 <MessageSquare className="h-6 w-6 text-green-600" />
//               </div>
//               <div>
//                 <p className="font-bold text-slate-800 text-lg">SMS Integration</p>
//                 <p className="text-sm text-slate-500">{provider}</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               {isConnected && <Check className="h-4 w-4 text-green-500" />}
//               <Switch
//                 checked={isConnected}
//                 onCheckedChange={(checked) => updateSetting('sms_enabled', checked ? 'true' : 'false')}
//                 className="data-[state=checked]:bg-blue-600"
//               />
//             </div>
//           </div>

//           {/* Configured data */}
//           <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 space-y-2 text-sm">
//             <p className="font-semibold text-slate-600 mb-3">Configured:</p>
//             <div className="flex justify-between">
//               <span className="text-slate-500">Provider:</span>
//               <span className="font-medium text-slate-800">{provider}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-slate-500">API Key:</span>
//               <span className="font-medium text-slate-800">{maskedKey}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-slate-500">Sender ID:</span>
//               <span className="font-medium text-slate-800">{senderId}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-slate-500">Route:</span>
//               <span className="font-medium text-slate-800 capitalize">{route}</span>
//             </div>
//           </div>

//           {/* Info hint */}
//           <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700">
//             Configure SMS provider to send notifications.
//           </div>

//           {/* Configure button */}
//           <Button
//             onClick={openModal}
//             className="w-full bg-blue-800 hover:bg-slate-700 text-white rounded-xl h-11"
//           >
//             <Settings2 className="h-4 w-4 mr-2" />
//             Configure
//           </Button>

//           {/* Status */}
//           <div className="flex justify-between items-center text-sm">
//             <span className="text-slate-500">Status</span>
//             <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${isConnected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
//               {isConnected ? '● Connected' : '○ Disconnected'}
//             </span>
//           </div>
//         </CardContent>
//       </Card>

//       {/* ── Configure Modal ────────────────────────────────────────────── */}
//       {modalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

//             {/* Modal Header */}
//             <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-5 flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-white/20 rounded-lg">
//                   <MessageSquare className="h-5 w-5 text-white" />
//                 </div>
//                 <div>
//                   <p className="font-bold text-white text-lg">SMS Configuration</p>
//                   <p className="text-green-100 text-sm">Configure SMS integration settings</p>
//                 </div>
//               </div>
//               <button onClick={closeModal} className="text-white/70 hover:text-white transition-colors">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             {/* Modal Body */}
//             <div className="p-6 space-y-5">

//               {/* Provider + Sender ID */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label className="text-slate-700 font-medium flex items-center gap-1">
//                     SMS Provider <span className="text-red-500">*</span>
//                   </Label>
//                   <Select
//                     value={draft.sms_provider || 'MSG91'}
//                     onValueChange={(value) => handleDraftChange('sms_provider', value)}
//                   >
//                     <SelectTrigger className="h-11 border-slate-300 focus:ring-green-500">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="MSG91">
//                         MSG91 <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Recommended</Badge>
//                       </SelectItem>
//                       <SelectItem value="Gupshup">Gupshup</SelectItem>
//                       <SelectItem value="Textlocal">Textlocal</SelectItem>
//                       <SelectItem value="Kaleyra">Kaleyra</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-slate-700 font-medium flex items-center gap-1">
//                     Sender ID <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     value={draft.sms_sender_id || ''}
//                     onChange={(e) => handleDraftChange('sms_sender_id', e.target.value)}
//                     placeholder="ROOMAC"
//                     maxLength={6}
//                     className="h-11 border-slate-300 focus:border-green-500 focus:ring-green-500"
//                   />
//                   <p className="text-xs text-slate-400">6 characters max</p>
//                 </div>
//               </div>

//               {/* API Key */}
//               <div className="space-y-2">
//                 <Label className="text-slate-700 font-medium flex items-center gap-1">
//                   MSG91 API Key <span className="text-red-500">*</span>
//                 </Label>
//                 <div className="relative">
//                   <Input
//                     type={showSecrets.sms_api_key ? 'text' : 'password'}
//                     value={draft.sms_api_key || ''}
//                     onChange={(e) => handleDraftChange('sms_api_key', e.target.value)}
//                     placeholder="Enter your MSG91 authentication key"
//                     className="h-11 border-slate-300 focus:border-green-500 focus:ring-green-500 pr-12"
//                   />
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="icon"
//                     className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
//                     onClick={() => toggleSecretVisibility('sms_api_key')}
//                   >
//                     {showSecrets.sms_api_key
//                       ? <EyeOff className="h-4 w-4 text-slate-400" />
//                       : <Eye className="h-4 w-4 text-slate-400" />}
//                   </Button>
//                 </div>
//                 <p className="text-xs text-slate-400">
//                   Get your key from{' '}
//                   <a href="https://control.msg91.com/app/settings" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium">
//                     MSG91 Dashboard
//                   </a>
//                 </p>
//               </div>

//               {/* SMS Route */}
//               <div className="space-y-2">
//                 <Label className="text-slate-700 font-medium">SMS Route</Label>
//                 <Select
//                   value={draft.sms_route || 'transactional'}
//                   onValueChange={(value) => handleDraftChange('sms_route', value)}
//                 >
//                   <SelectTrigger className="h-11 border-slate-300 focus:ring-green-500">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="transactional">
//                       Transactional <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">24x7</Badge>
//                     </SelectItem>
//                     <SelectItem value="promotional">
//                       Promotional <Badge className="ml-2 bg-amber-100 text-amber-800 text-xs">9AM-9PM</Badge>
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Note */}
//               <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
//                 <Shield className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
//                 <p className="text-xs text-amber-700">
//                   Sender ID must be pre-approved by MSG91. Use Transactional route for OTP &amp; alerts (24x7), Promotional for marketing (9AM–9PM only).
//                 </p>
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="px-6 pb-6 flex items-center justify-between gap-3">
//               <Button
//                 variant="outline"
//                 className="border-slate-300 text-slate-600"
//                 onClick={() => testConnection('sms')}
//                 disabled={saving}
//               >
//                 <TestTube className="h-4 w-4 mr-2" />
//                 Test Connection
//               </Button>
//               <div className="flex gap-3">
//                 <Button variant="outline" onClick={closeModal} disabled={saving} className="border-slate-300">
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleModalSave}
//                   disabled={saving}
//                   className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-6"
//                 >
//                   {saving ? (
//                     <>
//                       <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
//                       Saving...
//                     </>
//                   ) : (
//                     'Save Configuration'
//                   )}
//                 </Button>
//               </div>
//             </div>

//           </div>
//         </div>
//       )}
//     </TabsContent>
//   );
// }



import { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Shield, Eye, EyeOff, Settings2, X, Check, RefreshCw } from 'lucide-react';

interface SMSSettingsProps {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => void;
  showSecrets: Record<string, boolean>;
  toggleSecretVisibility: (key: string) => void;
  testConnection: (type: 'sms' | 'email' | 'payment') => void;
  onSave: (overrides?: Record<string, any>) => Promise<void>;
}

export default function SMSSettings({
  settings,
  updateSetting,
  showSecrets,
  toggleSecretVisibility,
  testConnection,
  onSave,
}: SMSSettingsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, any>>({});

  const openModal = () => {
    setDraft({ ...settings });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleDraftChange = (key: string, value: any) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleModalSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      Object.entries(draft).forEach(([key, value]) => updateSetting(key, value));
    } finally {
      setSaving(false);
      setModalOpen(false);
    }
  };

  const isConnected = settings.sms_enabled === 'true';
  const provider = settings.sms_provider || '—';
  const apiKey = settings.sms_api_key || '';
  const maskedKey = apiKey ? apiKey.slice(0, 8) + '...' : '—';
  const senderId = settings.sms_sender_id || '—';
  const route = settings.sms_route || '—';

  return (
    <TabsContent value="sms">
      {/* ── Card View ── */}
 <Card className="border border-slate-200 shadow-md rounded-2xl overflow-hidden w-full md:w-[380px] h-auto md:h-[380px] flex flex-col">
  <CardContent className="p-5 flex-1 flex flex-col">
    {/* Header section - fixed */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-xl">
          <MessageSquare className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-bold text-slate-800">SMS Integration</p>
          <p className="text-xs text-slate-500">{provider}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isConnected && <Check className="h-4 w-4 text-green-500" />}
        <Switch
          checked={isConnected}
          onCheckedChange={(checked) => updateSetting('sms_enabled', checked ? 'true' : 'false')}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>
    </div>

    <p className="text-xs text-slate-500 mt-2">Send SMS messages through your provider.</p>

    {/* Scrollable middle section - no scroll on mobile */}
    <div className="flex-1 md:overflow-y-auto md:min-h-0 mt-3">
      <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 space-y-1.5 text-xs">
        <p className="font-semibold text-slate-500 uppercase tracking-wide text-[10px] mb-2">Configured</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <span className="text-slate-400">Provider</span>
          <span className="font-medium text-slate-700 text-right">{provider}</span>
          <span className="text-slate-400">Account SID</span>
          <span className="font-medium text-slate-700 text-right truncate">{maskedKey}</span>
          <span className="text-slate-400">From Number</span>
          <span className="font-medium text-slate-700 text-right truncate">{senderId}</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700 mt-3">
        Configure SMS provider to send notifications.
      </div>
    </div>

    {/* Bottom section - fixed */}
    <div className="mt-auto pt-3 border-t border-slate-100">
      <Button 
        onClick={openModal} 
        className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl h-10 text-sm"
      >
        <Settings2 className="h-4 w-4 mr-2" />Configure
      </Button>

      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-slate-400">Status</span>
        <span className={`px-2.5 py-1 rounded-full font-semibold border ${
          isConnected 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          {isConnected ? '● Connected' : '○ Disconnected'}
        </span>
      </div>
    </div>
  </CardContent>
</Card>

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">SMS Configuration</p>
                  <p className="text-green-100 text-[11px]">Configure SMS integration settings</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-white/70 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">

              {/* Provider + Sender ID */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600 font-medium">Provider <span className="text-red-500">*</span></Label>
                  <Select value={draft.sms_provider || 'MSG91'} onValueChange={(v) => handleDraftChange('sms_provider', v)}>
                    <SelectTrigger className="h-9 text-xs border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MSG91" className="text-xs">MSG91</SelectItem>
                      <SelectItem value="Gupshup" className="text-xs">Gupshup</SelectItem>
                      <SelectItem value="Textlocal" className="text-xs">Textlocal</SelectItem>
                      <SelectItem value="Kaleyra" className="text-xs">Kaleyra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600 font-medium">Sender ID <span className="text-red-500">*</span></Label>
                  <Input
                    value={draft.sms_sender_id || ''}
                    onChange={(e) => handleDraftChange('sms_sender_id', e.target.value)}
                    placeholder="ROOMAC"
                    maxLength={6}
                    className="h-9 text-xs border-slate-300"
                  />
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">MSG91 API Key <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showSecrets.sms_api_key ? 'text' : 'password'}
                    value={draft.sms_api_key || ''}
                    onChange={(e) => handleDraftChange('sms_api_key', e.target.value)}
                    placeholder="Enter authentication key"
                    className="h-9 text-xs border-slate-300 pr-9"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => toggleSecretVisibility('sms_api_key')}
                  >
                    {showSecrets.sms_api_key ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* SMS Route */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">SMS Route</Label>
                <Select value={draft.sms_route || 'transactional'} onValueChange={(v) => handleDraftChange('sms_route', v)}>
                  <SelectTrigger className="h-9 text-xs border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactional" className="text-xs">Transactional (24x7)</SelectItem>
                    <SelectItem value="promotional" className="text-xs">Promotional (9AM–9PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-700">Sender ID must be pre-approved by MSG91. Use Transactional route for OTP &amp; alerts.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 flex gap-2 justify-end border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={closeModal} disabled={saving} className="h-9 text-xs px-4 border-slate-300">
                Cancel
              </Button>
              <Button onClick={handleModalSave} disabled={saving} className="h-9 text-xs px-5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white">
                {saving ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</> : 'Save Configuration'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </TabsContent>
  );
}