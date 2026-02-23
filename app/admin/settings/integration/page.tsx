
"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { TabsContent } from '@/components/ui/tabs';
import { getSettings, updateSettings, SettingsData } from '@/lib/settingsApi';
import IntegrationLayout from '@/components/admin/settings/IntegrationLayout';
import SMSSettings from '@/components/admin/settings/SMSSettings';
import EmailSettings from '@/components/admin/settings/EmailSettings';
import PaymentSettings from '@/components/admin/settings/PaymentSettings';
import LoadingSkeleton from '@/components/admin/settings/LoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Mail, CreditCard, Shield, Eye, EyeOff, Settings2, X, Check, RefreshCw } from 'lucide-react';

// ─── Shared props type ────────────────────────────────────────────────────────
interface CardOnlyProps {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => void;
  showSecrets: Record<string, boolean>;
  toggleSecretVisibility: (key: string) => void;
  testConnection: (type: 'sms' | 'email' | 'payment') => void;
  onSave: (overrides?: Record<string, any>) => Promise<void>;
}

// ─── SMS Card (standalone, no TabsContent) ────────────────────────────────────
function SMSCardOnly({ settings, updateSetting, showSecrets, toggleSecretVisibility, onSave }: CardOnlyProps) {
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

  const isConnected = settings.sms_enabled === 'true';
  const provider = settings.sms_provider || '—';
  const maskedKey = settings.sms_api_key ? settings.sms_api_key.slice(0, 8) + '...' : '—';
  const senderId = settings.sms_sender_id || '—';

  return (
    <>
      <Card className="border border-slate-200 shadow-md rounded-2xl overflow-hidden w-full md:w-[380px] h-auto md:h-[380px] flex flex-col">
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl"><MessageSquare className="h-5 w-5 text-green-600" /></div>
              <div><p className="font-bold text-slate-800">SMS Integration</p><p className="text-xs text-slate-500">{provider}</p></div>
            </div>
            <div className="flex items-center gap-2">
              {isConnected && <Check className="h-4 w-4 text-green-500" />}
              <Switch checked={isConnected} onCheckedChange={(c) => updateSetting('sms_enabled', c ? 'true' : 'false')} className="data-[state=checked]:bg-blue-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Send SMS messages through your provider.</p>
          <div className="flex-1 md:overflow-y-auto md:min-h-0 mt-3">
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 text-xs">
              <p className="font-semibold text-slate-500 uppercase tracking-wide text-[10px] mb-2">Configured</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <span className="text-slate-400">Provider</span><span className="font-medium text-slate-700 text-right">{provider}</span>
                <span className="text-slate-400">Account SID</span><span className="font-medium text-slate-700 text-right truncate">{maskedKey}</span>
                <span className="text-slate-400">From Number</span><span className="font-medium text-slate-700 text-right truncate">{senderId}</span>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700 mt-3">Configure SMS provider to send notifications.</div>
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
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5"><div className="p-1.5 bg-white/20 rounded-lg"><MessageSquare className="h-4 w-4 text-white" /></div><div><p className="font-bold text-white text-sm">SMS Configuration</p><p className="text-green-100 text-[11px]">Configure SMS integration settings</p></div></div>
              <button onClick={closeModal} className="text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">Provider <span className="text-red-500">*</span></Label>
                  <Select value={draft.sms_provider || 'MSG91'} onValueChange={(v) => handleDraftChange('sms_provider', v)}><SelectTrigger className="h-9 text-xs border-slate-300"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MSG91" className="text-xs">MSG91</SelectItem><SelectItem value="Gupshup" className="text-xs">Gupshup</SelectItem><SelectItem value="Textlocal" className="text-xs">Textlocal</SelectItem><SelectItem value="Kaleyra" className="text-xs">Kaleyra</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">Sender ID <span className="text-red-500">*</span></Label><Input value={draft.sms_sender_id || ''} onChange={(e) => handleDraftChange('sms_sender_id', e.target.value)} placeholder="ROOMAC" maxLength={6} className="h-9 text-xs border-slate-300" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">MSG91 API Key <span className="text-red-500">*</span></Label>
                <div className="relative"><Input type={showSecrets.sms_api_key ? 'text' : 'password'} value={draft.sms_api_key || ''} onChange={(e) => handleDraftChange('sms_api_key', e.target.value)} placeholder="Enter authentication key" className="h-9 text-xs border-slate-300 pr-9" /><button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => toggleSecretVisibility('sms_api_key')}>{showSecrets.sms_api_key ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button></div>
              </div>
              <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">SMS Route</Label>
                <Select value={draft.sms_route || 'transactional'} onValueChange={(v) => handleDraftChange('sms_route', v)}><SelectTrigger className="h-9 text-xs border-slate-300"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="transactional" className="text-xs">Transactional (24x7)</SelectItem><SelectItem value="promotional" className="text-xs">Promotional (9AM–9PM)</SelectItem></SelectContent></Select>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2"><Shield className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" /><p className="text-[11px] text-amber-700">Sender ID must be pre-approved by MSG91. Use Transactional route for OTP &amp; alerts.</p></div>
            </div>
            <div className="px-4 pb-4 flex gap-2 justify-end border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={closeModal} disabled={saving} className="h-9 text-xs px-4 border-slate-300">Cancel</Button>
              <Button onClick={handleModalSave} disabled={saving} className="h-9 text-xs px-5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white">{saving ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</> : 'Save Configuration'}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Email Card (standalone, no TabsContent) ──────────────────────────────────
function EmailCardOnly({ settings, updateSetting, showSecrets, toggleSecretVisibility, onSave }: CardOnlyProps) {
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

  const isConnected = settings.email_enabled === 'true';
  const host = settings.smtp_host || '—';
  const port = settings.smtp_port || '—';
  const username = settings.smtp_username || '—';
  const fromEmail = settings.smtp_from_email || '—';

  return (
    <>
      <Card className="border border-slate-200 shadow-md rounded-2xl overflow-hidden w-full md:w-[380px] h-auto md:h-[380px] flex flex-col">
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl"><Mail className="h-5 w-5 text-blue-600" /></div>
              <div><p className="font-bold text-slate-800">SMTP</p><p className="text-xs text-slate-500">SMTP</p></div>
            </div>
            <div className="flex items-center gap-2">
              {isConnected && <Check className="h-4 w-4 text-blue-500" />}
              <Switch checked={isConnected} onCheckedChange={(c) => updateSetting('email_enabled', c ? 'true' : 'false')} className="data-[state=checked]:bg-blue-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Send and receive emails via SMTP.</p>
          <div className="flex-1 md:overflow-y-auto md:min-h-0 mt-3">
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 text-xs">
              <p className="font-semibold text-slate-500 uppercase tracking-wide text-[10px] mb-2">Configured</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <span className="text-slate-400">Host</span><span className="font-medium text-slate-700 text-right truncate">{host}</span>
                <span className="text-slate-400">Port</span><span className="font-medium text-slate-700 text-right">{port}</span>
                <span className="text-slate-400">Username</span><span className="font-medium text-slate-700 text-right truncate">{username}</span>
                <span className="text-slate-400">From Email</span><span className="font-medium text-slate-700 text-right truncate">{fromEmail}</span>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700 mt-3">Configure SMTP to enable email sending.</div>
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
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5"><div className="p-1.5 bg-white/20 rounded-lg"><Mail className="h-4 w-4 text-white" /></div><div><p className="font-bold text-white text-sm">SMTP Configuration</p><p className="text-blue-100 text-[11px]">Configure email integration settings</p></div></div>
              <button onClick={closeModal} className="text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100"><div><p className="font-semibold text-slate-800 text-xs">Enable Email Notifications</p><p className="text-[11px] text-slate-500">Send emails to tenants and admins</p></div><Switch checked={draft.email_enabled === 'true'} onCheckedChange={(c) => handleDraftChange('email_enabled', c ? 'true' : 'false')} className="data-[state=checked]:bg-blue-600" /></div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">SMTP Host <span className="text-red-500">*</span></Label><Input value={draft.smtp_host || ''} onChange={(e) => handleDraftChange('smtp_host', e.target.value)} placeholder="smtp.gmail.com" className="h-9 text-xs border-slate-300" /></div>
                <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">Port <span className="text-red-500">*</span></Label><Input type="number" value={draft.smtp_port || ''} onChange={(e) => handleDraftChange('smtp_port', e.target.value)} placeholder="587" className="h-9 text-xs border-slate-300" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">Username / Email <span className="text-red-500">*</span></Label><Input value={draft.smtp_username || ''} onChange={(e) => handleDraftChange('smtp_username', e.target.value)} placeholder="your-email@gmail.com" className="h-9 text-xs border-slate-300" /></div>
              <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">Password <span className="text-red-500">*</span></Label>
                <div className="relative"><Input type={showSecrets.smtp_password ? 'text' : 'password'} value={draft.smtp_password || ''} onChange={(e) => handleDraftChange('smtp_password', e.target.value)} placeholder="App password or SMTP password" className="h-9 text-xs border-slate-300 pr-9" /><button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => toggleSecretVisibility('smtp_password')}>{showSecrets.smtp_password ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button></div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">From Name <span className="text-red-500">*</span></Label><Input value={draft.smtp_from_name || ''} onChange={(e) => handleDraftChange('smtp_from_name', e.target.value)} placeholder="ROOMAC" className="h-9 text-xs border-slate-300" /></div>
                <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">From Email <span className="text-red-500">*</span></Label><Input type="email" value={draft.smtp_from_email || ''} onChange={(e) => handleDraftChange('smtp_from_email', e.target.value)} placeholder="noreply@roomac.com" className="h-9 text-xs border-slate-300" /></div>
              </div>
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5 flex items-start gap-2"><Shield className="h-3.5 w-3.5 text-sky-600 mt-0.5 shrink-0" /><p className="text-[11px] text-sky-700">For Gmail, use an App Password. Enable 2-step verification in your Google Account settings.</p></div>
            </div>
            <div className="px-4 pb-4 flex gap-2 justify-end border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={closeModal} disabled={saving} className="h-9 text-xs px-4 border-slate-300">Cancel</Button>
              <Button onClick={handleModalSave} disabled={saving} className="h-9 text-xs px-5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white">{saving ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</> : 'Save Configuration'}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Payment Card (standalone, no TabsContent) ────────────────────────────────
function PaymentCardOnly({ settings, updateSetting, showSecrets, toggleSecretVisibility, onSave }: CardOnlyProps) {
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

  const isConnected = settings.razorpay_enabled === 'true';
  const keyId = settings.razorpay_key_id || '';
  const maskedKeyId = keyId ? keyId.slice(0, 12) + '...' : '—';
  const maskedWebhook = settings.razorpay_webhook_secret ? settings.razorpay_webhook_secret.slice(0, 10) + '...' : '—';
  const mode = keyId.startsWith('rzp_live') ? 'Live' : keyId ? 'Test' : '—';

  return (
    <>
      <Card className="border border-slate-200 shadow-md rounded-2xl overflow-hidden w-full md:w-[380px] h-auto md:h-[380px] flex flex-col">
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl"><CreditCard className="h-5 w-5 text-emerald-600" /></div>
              <div><p className="font-bold text-slate-800">Payment Gateway</p><p className="text-xs text-slate-500">Razorpay</p></div>
            </div>
            <div className="flex items-center gap-2">
              {isConnected && <Check className="h-4 w-4 text-emerald-500" />}
              <Switch checked={isConnected} onCheckedChange={(c) => updateSetting('razorpay_enabled', c ? 'true' : 'false')} className="data-[state=checked]:bg-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Accept online payments via Razorpay gateway.</p>
          <div className="flex-1 md:overflow-y-auto md:min-h-0 mt-3">
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 text-xs">
              <p className="font-semibold text-slate-500 uppercase tracking-wide text-[10px] mb-2">Configured</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <span className="text-slate-400">Provider</span><span className="font-medium text-slate-700 text-right">Razorpay</span>
                <span className="text-slate-400">Key ID</span><span className="font-medium text-slate-700 text-right truncate">{maskedKeyId}</span>
                <span className="text-slate-400">Webhook</span><span className="font-medium text-slate-700 text-right truncate">{maskedWebhook}</span>
                <span className="text-slate-400">Mode</span><span className="font-medium text-slate-700 text-right">{mode}</span>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-xs text-emerald-700 mt-3">Configure Razorpay to accept online payments.</div>
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
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5"><div className="p-1.5 bg-white/20 rounded-lg"><CreditCard className="h-4 w-4 text-white" /></div><div><p className="font-bold text-white text-sm">Payment Configuration</p><p className="text-emerald-100 text-[11px]">Configure Razorpay payment gateway</p></div></div>
              <button onClick={closeModal} className="text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100"><div><p className="font-semibold text-slate-800 text-xs">Enable Razorpay</p><p className="text-[11px] text-slate-500">Accept online payments via Razorpay</p></div><Switch checked={draft.razorpay_enabled === 'true'} onCheckedChange={(c) => handleDraftChange('razorpay_enabled', c ? 'true' : 'false')} className="data-[state=checked]:bg-emerald-600" /></div>
              <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">Razorpay Key ID <span className="text-red-500">*</span></Label>
                <div className="relative"><Input type={showSecrets.razorpay_key_id ? 'text' : 'password'} value={draft.razorpay_key_id || ''} onChange={(e) => handleDraftChange('razorpay_key_id', e.target.value)} placeholder="rzp_test_xxxxxxxxxxxxx" className="h-9 text-xs border-slate-300 pr-9" /><button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => toggleSecretVisibility('razorpay_key_id')}>{showSecrets.razorpay_key_id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button></div>
              </div>
              <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">Razorpay Key Secret <span className="text-red-500">*</span></Label>
                <div className="relative"><Input type={showSecrets.razorpay_key_secret ? 'text' : 'password'} value={draft.razorpay_key_secret || ''} onChange={(e) => handleDraftChange('razorpay_key_secret', e.target.value)} placeholder="Enter your Razorpay secret key" className="h-9 text-xs border-slate-300 pr-9" /><button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => toggleSecretVisibility('razorpay_key_secret')}>{showSecrets.razorpay_key_secret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button></div>
              </div>
              <div className="space-y-1"><Label className="text-xs text-slate-600 font-medium">Webhook Secret</Label>
                <div className="relative"><Input type={showSecrets.razorpay_webhook_secret ? 'text' : 'password'} value={draft.razorpay_webhook_secret || ''} onChange={(e) => handleDraftChange('razorpay_webhook_secret', e.target.value)} placeholder="whsec_xxxxxxxxxxxxx" className="h-9 text-xs border-slate-300 pr-9" /><button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => toggleSecretVisibility('razorpay_webhook_secret')}>{showSecrets.razorpay_webhook_secret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button></div>
                <p className="text-[11px] text-slate-400">Used to verify webhook signatures</p>
              </div>
              <div className="bg-lime-50 border border-lime-200 rounded-lg p-2.5 flex items-start gap-2"><CreditCard className="h-3.5 w-3.5 text-lime-600 mt-0.5 shrink-0" /><div className="text-[11px] text-lime-700 space-y-0.5"><p className="font-semibold text-lime-800">Get Started with Razorpay</p><p>• Sign up at razorpay.com and complete KYC</p><p>• Get API keys from Dashboard → Settings</p><p>• Use rzp_test_ for testing, rzp_live_ for production</p></div></div>
            </div>
            <div className="px-4 pb-4 flex gap-2 justify-end border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={closeModal} disabled={saving} className="h-9 text-xs px-4 border-slate-300">Cancel</Button>
              <Button onClick={handleModalSave} disabled={saving} className="h-9 text-xs px-5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white">{saving ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</> : 'Save Configuration'}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IntegrationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setSettingsData(data);
      const settingsValues: Record<string, any> = {};
      Object.entries(data).forEach(([key, settingData]) => { settingsValues[key] = (settingData as any).value; });
      setSettings(settingsValues);
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error(error.message || 'Failed to load settings');
    } finally { setLoading(false); }
  };

  const handleSave = async (overrides?: Record<string, any>) => {
    setSaving(true);
    try {
      const dataToSave = overrides ? { ...settings, ...overrides } : settings;
      const result = await updateSettings(dataToSave);
      if (result.success) { toast.success(result.message || 'Settings saved successfully', { description: 'Integration settings have been updated' }); await loadSettings(); }
      else { toast.error(result.message || 'Failed to save settings'); }
    } catch (error: any) { console.error('Error saving settings:', error); toast.error(error.message || 'Failed to save settings'); }
    finally { setSaving(false); }
  };

  const updateSetting = (key: string, value: any) => setSettings(prev => ({ ...prev, [key]: value }));
  const toggleSecretVisibility = (key: string) => setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  const testConnection = async (type: 'sms' | 'email' | 'payment') => { toast.info(`Testing ${type} connection...`); };

  if (loading) return <LoadingSkeleton />;

  const sharedProps = { settings, updateSetting, showSecrets, toggleSecretVisibility, testConnection, onSave: handleSave };

  return (
    <IntegrationLayout title="Integration Settings" description="Configure SMS, Email, and Payment integrations">

      {/* ── ALL TAB: teeno cards ek saath ── */}
      <TabsContent value="all">
        <div className="flex flex-wrap gap-6">
          <SMSCardOnly {...sharedProps} />
          <EmailCardOnly {...sharedProps} />
          <PaymentCardOnly {...sharedProps} />
        </div>
      </TabsContent>

      {/* ── Individual Tabs (original components) ── */}
      <SMSSettings {...sharedProps} />
      <EmailSettings {...sharedProps} />
      <PaymentSettings {...sharedProps} />

    </IntegrationLayout>
  );
}