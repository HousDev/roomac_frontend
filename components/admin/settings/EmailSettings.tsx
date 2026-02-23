
import { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Mail, Shield, Eye, EyeOff, Settings2, X, Check, RefreshCw } from 'lucide-react';

interface EmailSettingsProps {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => void;
  showSecrets: Record<string, boolean>;
  toggleSecretVisibility: (key: string) => void;
  testConnection: (type: 'sms' | 'email' | 'payment') => void;
  onSave: (overrides?: Record<string, any>) => Promise<void>;
}

export default function EmailSettings({
  settings,
  updateSetting,
  showSecrets,
  toggleSecretVisibility,
  testConnection,
  onSave,
}: EmailSettingsProps) {
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

  const isConnected = settings.email_enabled === 'true';
  const host = settings.smtp_host || '—';
  const port = settings.smtp_port || '—';
  const username = settings.smtp_username || '—';
  const fromEmail = settings.smtp_from_email || '—';

  return (
    <TabsContent value="email">
      {/* ── Card View ── */}
      <Card className="border border-slate-200 shadow-md rounded-2xl overflow-hidden w-full md:w-[380px] h-auto md:h-[380px] flex flex-col">
  <CardContent className="p-5 flex-1 flex flex-col">
    {/* Header section - fixed */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-xl">
          <Mail className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-bold text-slate-800">SMTP</p>
          <p className="text-xs text-slate-500">SMTP</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isConnected && <Check className="h-4 w-4 text-blue-500" />}
        <Switch
          checked={isConnected}
          onCheckedChange={(checked) => updateSetting('email_enabled', checked ? 'true' : 'false')}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>
    </div>

    <p className="text-xs text-slate-500 mt-2">Send and receive emails via SMTP.</p>

    {/* Scrollable middle section - no scroll on mobile */}
    <div className="flex-1 md:overflow-y-auto md:min-h-0 mt-3">
      <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 space-y-1.5 text-xs">
        <p className="font-semibold text-slate-500 uppercase tracking-wide text-[10px] mb-2">Configured</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <span className="text-slate-400">Host</span>
          <span className="font-medium text-slate-700 text-right truncate">{host}</span>
          <span className="text-slate-400">Port</span>
          <span className="font-medium text-slate-700 text-right">{port}</span>
          <span className="text-slate-400">Username</span>
          <span className="font-medium text-slate-700 text-right truncate">{username}</span>
          <span className="text-slate-400">From Email</span>
          <span className="font-medium text-slate-700 text-right truncate">{fromEmail}</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700 mt-3">
        Configure SMTP to enable email sending.
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
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">SMTP Configuration</p>
                  <p className="text-blue-100 text-[11px]">Configure email integration settings</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-white/70 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">

              {/* Enable toggle */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div>
                  <p className="font-semibold text-slate-800 text-xs">Enable Email Notifications</p>
                  <p className="text-[11px] text-slate-500">Send emails to tenants and admins</p>
                </div>
                <Switch
                  checked={draft.email_enabled === 'true'}
                  onCheckedChange={(checked) => handleDraftChange('email_enabled', checked ? 'true' : 'false')}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              {/* Host + Port */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600 font-medium">SMTP Host <span className="text-red-500">*</span></Label>
                  <Input
                    value={draft.smtp_host || ''}
                    onChange={(e) => handleDraftChange('smtp_host', e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="h-9 text-xs border-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600 font-medium">Port <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    value={draft.smtp_port || ''}
                    onChange={(e) => handleDraftChange('smtp_port', e.target.value)}
                    placeholder="587"
                    className="h-9 text-xs border-slate-300"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">Username / Email <span className="text-red-500">*</span></Label>
                <Input
                  value={draft.smtp_username || ''}
                  onChange={(e) => handleDraftChange('smtp_username', e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="h-9 text-xs border-slate-300"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showSecrets.smtp_password ? 'text' : 'password'}
                    value={draft.smtp_password || ''}
                    onChange={(e) => handleDraftChange('smtp_password', e.target.value)}
                    placeholder="App password or SMTP password"
                    className="h-9 text-xs border-slate-300 pr-9"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => toggleSecretVisibility('smtp_password')}
                  >
                    {showSecrets.smtp_password ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* From Name + From Email */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600 font-medium">From Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={draft.smtp_from_name || ''}
                    onChange={(e) => handleDraftChange('smtp_from_name', e.target.value)}
                    placeholder="ROOMAC"
                    className="h-9 text-xs border-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600 font-medium">From Email <span className="text-red-500">*</span></Label>
                  <Input
                    type="email"
                    value={draft.smtp_from_email || ''}
                    onChange={(e) => handleDraftChange('smtp_from_email', e.target.value)}
                    placeholder="noreply@roomac.com"
                    className="h-9 text-xs border-slate-300"
                  />
                </div>
              </div>

              {/* Gmail note */}
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5 flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-sky-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-sky-700">For Gmail, use an App Password. Enable 2-step verification in your Google Account settings.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 flex gap-2 justify-end border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={closeModal} disabled={saving} className="h-9 text-xs px-4 border-slate-300">
                Cancel
              </Button>
              <Button onClick={handleModalSave} disabled={saving} className="h-9 text-xs px-5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white">
                {saving ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</> : 'Save Configuration'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </TabsContent>
  );
}