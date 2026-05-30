
import { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Eye, EyeOff, Settings2, X, Check, RefreshCw, Shield } from 'lucide-react';

interface PaymentSettingsProps {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => void;
  showSecrets: Record<string, boolean>;
  toggleSecretVisibility: (key: string) => void;
  testConnection?: (type: 'sms' | 'email' | 'payment') => void;
  onSave: (overrides?: Record<string, any>) => Promise<void>;
}
function PhonePeInlineCard({ settings, updateSetting, showSecrets, toggleSecretVisibility, onSave }: PaymentSettingsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, any>>({});

  const openModal = () => { setDraft({ ...settings }); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);
  const handleDraftChange = (key: string, value: any) => setDraft(prev => ({ ...prev, [key]: value }));
  const handleModalSave = async () => {
    setSaving(true);
    try { await onSave(draft); Object.entries(draft).forEach(([k, v]) => updateSetting(k, v)); }
    finally { setSaving(false); setModalOpen(false); }
  };

  const isConnected = settings.phonepe_enabled === 'true';
  const merchantId = settings.phonepe_merchant_id || '';
  const maskedMerchantId = merchantId ? merchantId.slice(0, 8) + '...' : '—';
  const saltIndex = settings.phonepe_salt_index || '—';

  return (
    <>
      <Card className="border border-slate-200 shadow-md rounded-2xl overflow-hidden w-full md:w-[380px] h-auto md:h-[380px] flex flex-col">
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl"><CreditCard className="h-5 w-5 text-purple-600" /></div>
              <div><p className="font-bold text-slate-800">PhonePe Gateway</p><p className="text-xs text-slate-500">PhonePe</p></div>
            </div>
            <div className="flex items-center gap-2">
              {isConnected && <Check className="h-4 w-4 text-purple-500" />}
              <Switch checked={isConnected}
                onCheckedChange={async (c) => {
                  const val = c ? 'true' : 'false';
                  updateSetting('phonepe_enabled', val);
                  await onSave({ ...settings, phonepe_enabled: val });
                }}
                className="data-[state=checked]:bg-purple-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Accept UPI payments via PhonePe gateway.</p>
          <div className="flex-1 md:overflow-y-auto md:min-h-0 mt-3">
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 text-xs">
              <p className="font-semibold text-slate-500 uppercase tracking-wide text-[10px] mb-2">Configured</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <span className="text-slate-400">Provider</span><span className="font-medium text-slate-700 text-right">PhonePe</span>
                <span className="text-slate-400">Merchant ID</span><span className="font-medium text-slate-700 text-right truncate">{maskedMerchantId}</span>
                <span className="text-slate-400">Salt Index</span><span className="font-medium text-slate-700 text-right">{saltIndex}</span>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 text-xs text-purple-700 mt-3">Configure PhonePe to accept UPI payments.</div>
          </div>
          <div className="mt-auto pt-3 border-t border-slate-100">
            <Button onClick={openModal} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl h-10 text-sm"><Settings2 className="h-4 w-4 mr-2" />Configure</Button>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-slate-400">Status</span>
              <span className={`px-2.5 py-1 rounded-full font-semibold border text-xs ${isConnected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{isConnected ? '● Connected' : '○ Disconnected'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-violet-500 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5"><div className="p-1.5 bg-white/20 rounded-lg"><CreditCard className="h-4 w-4 text-white" /></div><div><p className="font-bold text-white text-sm">PhonePe Configuration</p><p className="text-purple-100 text-[11px]">Configure PhonePe payment gateway</p></div></div>
              <button onClick={closeModal} className="text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                <div><p className="font-semibold text-slate-800 text-xs">Enable PhonePe</p><p className="text-[11px] text-slate-500">Accept UPI payments via PhonePe</p></div>
                <Switch checked={draft.phonepe_enabled === 'true'} onCheckedChange={(c) => handleDraftChange('phonepe_enabled', c ? 'true' : 'false')} className="data-[state=checked]:bg-purple-600" />
              </div>
              <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">Merchant ID <span className="text-red-500">*</span></Label>
                <Input value={draft.phonepe_merchant_id || ''} onChange={(e) => handleDraftChange('phonepe_merchant_id', e.target.value)} placeholder="YOUR_MERCHANT_ID" className="h-9 text-xs border-slate-300" />
              </div>
              <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">Salt Key <span className="text-red-500">*</span></Label>
                <div className="relative"><Input type={showSecrets.phonepe_salt_key ? 'text' : 'password'} value={draft.phonepe_salt_key || ''} onChange={(e) => handleDraftChange('phonepe_salt_key', e.target.value)} placeholder="Enter Salt Key" className="h-9 text-xs border-slate-300 pr-9" /><button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => toggleSecretVisibility('phonepe_salt_key')}>{showSecrets.phonepe_salt_key ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button></div>
              </div>
              <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">Salt Index <span className="text-red-500">*</span></Label>
                <Input value={draft.phonepe_salt_index || '1'} onChange={(e) => handleDraftChange('phonepe_salt_index', e.target.value)} placeholder="1" className="h-9 text-xs border-slate-300" />
                <p className="text-[11px] text-slate-400">Usually 1, check your PhonePe dashboard</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-purple-600 mt-0.5 shrink-0" />
                <div className="text-[11px] text-purple-700 space-y-0.5">
                  <p className="font-semibold text-purple-800">Get Started with PhonePe</p>
                  <p>• Sign up at phonepe.com/business</p>
                  <p>• Get credentials from Dashboard → API Keys</p>
                  <p>• Use UAT credentials for testing</p>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4 flex gap-2 justify-end border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={closeModal} disabled={saving} className="h-9 text-xs px-4 border-slate-300">Cancel</Button>
              <Button onClick={handleModalSave} disabled={saving} className="h-9 text-xs px-5 bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 text-white">{saving ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</> : 'Save Configuration'}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
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
          <div className="flex flex-wrap gap-6">

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
<PhonePeInlineCard
  settings={settings}
  updateSetting={updateSetting}
  showSecrets={showSecrets}
  toggleSecretVisibility={toggleSecretVisibility}
  onSave={onSave}
/>
        </div>


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