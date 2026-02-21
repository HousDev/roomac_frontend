// import { TabsContent } from '@/components/ui/tabs';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Button } from '@/components/ui/button';
// import { Switch } from '@/components/ui/switch';
// import { CreditCard, TestTube, Eye, EyeOff } from 'lucide-react';

// interface PaymentSettingsProps {
//   settings: Record<string, any>;
//   updateSetting: (key: string, value: any) => void;
//   showSecrets: Record<string, boolean>;
//   toggleSecretVisibility: (key: string) => void;
//   testConnection: (type: 'sms' | 'email' | 'payment') => void;
// }

// export default function PaymentSettings({ 
//   settings, 
//   updateSetting, 
//   showSecrets, 
//   toggleSecretVisibility,
//   testConnection 
// }: PaymentSettingsProps) {
//   return (
//     <TabsContent value="payment">
//       <Card className="border-0 shadow-xl overflow-hidden">
//         <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b">
//           <CardHeader className="p-0">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-emerald-100 rounded-lg">
//                 <CreditCard className="h-6 w-6 text-emerald-600" />
//               </div>
//               <div>
//                 <CardTitle className="text-2xl text-slate-800">Payment Gateway Settings</CardTitle>
//                 <CardDescription className="text-slate-600">Configure Razorpay for online payments</CardDescription>
//               </div>
//             </div>
//           </CardHeader>
//         </div>
//         <CardContent className="p-6 space-y-8">
//           <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-50 to-white rounded-2xl border border-emerald-200">
//             <div className="flex items-center gap-4">
//               <div className="p-3 bg-emerald-100 rounded-xl">
//                 <CreditCard className="h-6 w-6 text-emerald-600" />
//               </div>
//               <div>
//                 <p className="font-semibold text-slate-800">Enable Razorpay</p>
//                 <p className="text-sm text-slate-600">Accept online payments via Razorpay gateway</p>
//               </div>
//             </div>
//             <Switch
//               checked={settings.razorpay_enabled === 'true'}
//               onCheckedChange={(checked) => updateSetting('razorpay_enabled', checked ? 'true' : 'false')}
//               className="data-[state=checked]:bg-emerald-600"
//             />
//           </div>

//           <div className="space-y-6">
//             <div className="space-y-3">
//               <Label className="text-slate-700 font-medium">Razorpay Key ID</Label>
//               <div className="relative">
//                 <Input
//                   type={showSecrets.razorpay_key_id ? "text" : "password"}
//                   value={settings.razorpay_key_id || ''}
//                   onChange={(e) => updateSetting('razorpay_key_id', e.target.value)}
//                   placeholder="rzp_test_xxxxxxxxxxxxx"
//                   className="h-11 border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 pr-12"
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
//                   onClick={() => toggleSecretVisibility('razorpay_key_id')}
//                 >
//                   {showSecrets.razorpay_key_id ? (
//                     <EyeOff className="h-4 w-4 text-slate-500" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-slate-500" />
//                   )}
//                 </Button>
//               </div>
//             </div>

//             <div className="space-y-3">
//               <Label className="text-slate-700 font-medium">Razorpay Key Secret</Label>
//               <div className="relative">
//                 <Input
//                   type={showSecrets.razorpay_key_secret ? "text" : "password"}
//                   value={settings.razorpay_key_secret || ''}
//                   onChange={(e) => updateSetting('razorpay_key_secret', e.target.value)}
//                   placeholder="Enter your Razorpay secret key"
//                   className="h-11 border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 pr-12"
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
//                   onClick={() => toggleSecretVisibility('razorpay_key_secret')}
//                 >
//                   {showSecrets.razorpay_key_secret ? (
//                     <EyeOff className="h-4 w-4 text-slate-500" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-slate-500" />
//                   )}
//                 </Button>
//               </div>
//             </div>

//             <div className="space-y-3">
//               <Label className="text-slate-700 font-medium">Webhook Secret</Label>
//               <div className="relative">
//                 <Input
//                   type={showSecrets.razorpay_webhook_secret ? "text" : "password"}
//                   value={settings.razorpay_webhook_secret || ''}
//                   onChange={(e) => updateSetting('razorpay_webhook_secret', e.target.value)}
//                   placeholder="whsec_xxxxxxxxxxxxx"
//                   className="h-11 border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 pr-12"
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
//                   onClick={() => toggleSecretVisibility('razorpay_webhook_secret')}
//                 >
//                   {showSecrets.razorpay_webhook_secret ? (
//                     <EyeOff className="h-4 w-4 text-slate-500" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-slate-500" />
//                   )}
//                 </Button>
//               </div>
//               <p className="text-xs text-slate-500">Used to verify webhook signatures</p>
//             </div>
//           </div>

//           <div className="bg-gradient-to-r from-lime-50 to-emerald-50 border border-lime-200 rounded-2xl p-6">
//             <div className="flex items-start gap-3">
//               <div className="p-2 bg-lime-100 rounded-lg mt-1">
//                 <CreditCard className="h-5 w-5 text-lime-600" />
//               </div>
//               <div>
//                 <p className="font-semibold text-lime-800">Get Started with Razorpay</p>
//                 <ul className="mt-3 space-y-2">
//                   <li className="flex items-start gap-2 text-sm text-lime-700">
//                     <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mt-1.5"></span>
//                     Sign up at razorpay.com and complete KYC
//                   </li>
//                   <li className="flex items-start gap-2 text-sm text-lime-700">
//                     <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mt-1.5"></span>
//                     Get API keys from Dashboard → Settings
//                   </li>
//                   <li className="flex items-start gap-2 text-sm text-lime-700">
//                     <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mt-1.5"></span>
//                     Use Test mode keys for testing (rzp_test_)
//                   </li>
//                   <li className="flex items-start gap-2 text-sm text-lime-700">
//                     <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mt-1.5"></span>
//                     Switch to Live keys after going live (rzp_live_)
//                   </li>
//                 </ul>
//               </div>
//             </div>
//             <div className="mt-4 flex justify-end">
//               <Button 
//                 variant="outline" 
//                 className="border-lime-300 text-lime-700 hover:bg-lime-50"
//                 onClick={() => testConnection('payment')}
//               >
//                 <TestTube className="h-4 w-4 mr-2" />
//                 Test Payment Connection
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
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
import { CreditCard, Eye, EyeOff, Settings2, X, Check, RefreshCw } from 'lucide-react';

interface PaymentSettingsProps {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => void;
  showSecrets: Record<string, boolean>;
  toggleSecretVisibility: (key: string) => void;
  testConnection: (type: 'sms' | 'email' | 'payment') => void;
  onSave: (overrides?: Record<string, any>) => Promise<void>;
}

export default function PaymentSettings({
  settings,
  updateSetting,
  showSecrets,
  toggleSecretVisibility,
  testConnection,
  onSave,
}: PaymentSettingsProps) {
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

  const isConnected = settings.razorpay_enabled === 'true';
  const keyId = settings.razorpay_key_id || '';
  const maskedKeyId = keyId ? keyId.slice(0, 12) + '...' : '—';
  const webhookSecret = settings.razorpay_webhook_secret || '';
  const maskedWebhook = webhookSecret ? webhookSecret.slice(0, 10) + '...' : '—';
  const mode = keyId.startsWith('rzp_live') ? 'Live' : keyId ? 'Test' : '—';

  return (
    <TabsContent value="payment">
      {/* ── Card View ── */}
 <Card className="border border-slate-200 shadow-md rounded-2xl overflow-hidden w-full md:w-[380px] h-auto md:h-[380px] flex flex-col">
  <CardContent className="p-5 flex-1 flex flex-col">
    {/* Header section - fixed */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-xl">
          <CreditCard className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="font-bold text-slate-800">Payment Gateway</p>
          <p className="text-xs text-slate-500">Razorpay</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isConnected && <Check className="h-4 w-4 text-emerald-500" />}
        <Switch
          checked={isConnected}
          onCheckedChange={(checked) => updateSetting('razorpay_enabled', checked ? 'true' : 'false')}
          className="data-[state=checked]:bg-emerald-600"
        />
      </div>
    </div>

    <p className="text-xs text-slate-500 mt-2">Accept online payments via Razorpay gateway.</p>

    {/* Scrollable middle section - no scroll on mobile */}
    <div className="flex-1 md:overflow-y-auto md:min-h-0 mt-3">
      <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 space-y-1.5 text-xs">
        <p className="font-semibold text-slate-500 uppercase tracking-wide text-[10px] mb-2">Configured</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <span className="text-slate-400">Provider</span>
          <span className="font-medium text-slate-700 text-right">Razorpay</span>
          <span className="text-slate-400">Key ID</span>
          <span className="font-medium text-slate-700 text-right truncate">{maskedKeyId}</span>
          <span className="text-slate-400">Webhook</span>
          <span className="font-medium text-slate-700 text-right truncate">{maskedWebhook}</span>
          <span className="text-slate-400">Mode</span>
          <span className="font-medium text-slate-700 text-right">{mode}</span>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-xs text-emerald-700 mt-3">
        Configure Razorpay to accept online payments.
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
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Payment Configuration</p>
                  <p className="text-emerald-100 text-[11px]">Configure Razorpay payment gateway</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-white/70 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">

              {/* Enable toggle */}
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div>
                  <p className="font-semibold text-slate-800 text-xs">Enable Razorpay</p>
                  <p className="text-[11px] text-slate-500">Accept online payments via Razorpay</p>
                </div>
                <Switch
                  checked={draft.razorpay_enabled === 'true'}
                  onCheckedChange={(checked) => handleDraftChange('razorpay_enabled', checked ? 'true' : 'false')}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>

              {/* Key ID */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">Razorpay Key ID <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showSecrets.razorpay_key_id ? 'text' : 'password'}
                    value={draft.razorpay_key_id || ''}
                    onChange={(e) => handleDraftChange('razorpay_key_id', e.target.value)}
                    placeholder="rzp_test_xxxxxxxxxxxxx"
                    className="h-9 text-xs border-slate-300 pr-9"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => toggleSecretVisibility('razorpay_key_id')}
                  >
                    {showSecrets.razorpay_key_id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Key Secret */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">Razorpay Key Secret <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showSecrets.razorpay_key_secret ? 'text' : 'password'}
                    value={draft.razorpay_key_secret || ''}
                    onChange={(e) => handleDraftChange('razorpay_key_secret', e.target.value)}
                    placeholder="Enter your Razorpay secret key"
                    className="h-9 text-xs border-slate-300 pr-9"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => toggleSecretVisibility('razorpay_key_secret')}
                  >
                    {showSecrets.razorpay_key_secret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Webhook Secret */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">Webhook Secret</Label>
                <div className="relative">
                  <Input
                    type={showSecrets.razorpay_webhook_secret ? 'text' : 'password'}
                    value={draft.razorpay_webhook_secret || ''}
                    onChange={(e) => handleDraftChange('razorpay_webhook_secret', e.target.value)}
                    placeholder="whsec_xxxxxxxxxxxxx"
                    className="h-9 text-xs border-slate-300 pr-9"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => toggleSecretVisibility('razorpay_webhook_secret')}
                  >
                    {showSecrets.razorpay_webhook_secret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Used to verify webhook signatures</p>
              </div>

              {/* Razorpay guide */}
              <div className="bg-lime-50 border border-lime-200 rounded-lg p-2.5 flex items-start gap-2">
                <CreditCard className="h-3.5 w-3.5 text-lime-600 mt-0.5 shrink-0" />
                <div className="text-[11px] text-lime-700 space-y-0.5">
                  <p className="font-semibold text-lime-800">Get Started with Razorpay</p>
                  <p>• Sign up at razorpay.com and complete KYC</p>
                  <p>• Get API keys from Dashboard → Settings</p>
                  <p>• Use rzp_test_ for testing, rzp_live_ for production</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 flex gap-2 justify-end border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={closeModal} disabled={saving} className="h-9 text-xs px-4 border-slate-300">
                Cancel
              </Button>
              <Button onClick={handleModalSave} disabled={saving} className="h-9 text-xs px-5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white">
                {saving ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</> : 'Save Configuration'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </TabsContent>
  );
}