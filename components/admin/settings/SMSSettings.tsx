import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Shield, TestTube, Eye, EyeOff } from 'lucide-react';

interface SMSSettingsProps {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => void;
  showSecrets: Record<string, boolean>;
  toggleSecretVisibility: (key: string) => void;
  testConnection: (type: 'sms' | 'email' | 'payment') => void;
}

export default function SMSSettings({ 
  settings, 
  updateSetting, 
  showSecrets, 
  toggleSecretVisibility,
  testConnection 
}: SMSSettingsProps) {
  return (
    <TabsContent value="sms">
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
          <CardHeader className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-800">SMS Provider Settings (MSG91)</CardTitle>
                <CardDescription className="text-slate-600">Configure MSG91 SMS service for notifications and OTP</CardDescription>
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-6 space-y-8">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-white rounded-2xl border border-green-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Enable SMS Notifications</p>
                <p className="text-sm text-slate-600">Send SMS to tenants and admins for alerts and OTP</p>
              </div>
            </div>
            <Switch
              checked={settings.sms_enabled === 'true'}
              onCheckedChange={(checked) => updateSetting('sms_enabled', checked ? 'true' : 'false')}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">SMS Provider</Label>
                <Select
                  value={settings.sms_provider || 'MSG91'}
                  onValueChange={(value) => updateSetting('sms_provider', value)}
                >
                  <SelectTrigger className="h-11 border-slate-300 focus:ring-green-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MSG91" className="flex items-center gap-2">
                      <span>MSG91</span>
                      <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">Recommended</Badge>
                    </SelectItem>
                    <SelectItem value="Gupshup">Gupshup</SelectItem>
                    <SelectItem value="Textlocal">Textlocal</SelectItem>
                    <SelectItem value="Kaleyra">Kaleyra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">Sender ID</Label>
                <Input
                  value={settings.sms_sender_id || ''}
                  onChange={(e) => updateSetting('sms_sender_id', e.target.value)}
                  placeholder="ROOMAC"
                  maxLength={6}
                  className="h-11 border-slate-300 focus:border-green-600 focus:ring-green-600"
                />
                <p className="text-xs text-slate-500">6 characters max (must be approved by provider)</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-700 font-medium">MSG91 API Key</Label>
              <div className="relative">
                <Input
                  type={showSecrets.sms_api_key ? "text" : "password"}
                  value={settings.sms_api_key || ''}
                  onChange={(e) => updateSetting('sms_api_key', e.target.value)}
                  placeholder="Enter your MSG91 authentication key"
                  className="h-11 border-slate-300 focus:border-green-600 focus:ring-green-600 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => toggleSecretVisibility('sms_api_key')}
                >
                  {showSecrets.sms_api_key ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Get your API key from{' '}
                <a href="https://control.msg91.com/app/settings" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium">
                  MSG91 Dashboard
                </a>
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-700 font-medium">SMS Route</Label>
              <Select
                value={settings.sms_route || 'transactional'}
                onValueChange={(value) => updateSetting('sms_route', value)}
              >
                <SelectTrigger className="h-11 border-slate-300 focus:ring-green-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transactional" className="flex items-center justify-between">
                    <span>Transactional</span>
                    <Badge className="bg-blue-100 text-blue-800">24x7 Delivery</Badge>
                  </SelectItem>
                  <SelectItem value="promotional" className="flex items-center justify-between">
                    <span>Promotional</span>
                    <Badge className="bg-amber-100 text-amber-800">9AM-9PM Only</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg mt-1">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-800">Important Notes</p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></span>
                    Sender ID must be approved by MSG91 before use
                  </li>
                  <li className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></span>
                    Transactional route for OTP and alerts (24x7 delivery)
                  </li>
                  <li className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></span>
                    Promotional route for marketing messages (9 AM - 9 PM only)
                  </li>
                  <li className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></span>
                    Test your configuration with a sample SMS after saving
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => testConnection('sms')}
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test SMS Connection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}