import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Mail, Shield, TestTube, Eye, EyeOff } from 'lucide-react';

interface EmailSettingsProps {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => void;
  showSecrets: Record<string, boolean>;
  toggleSecretVisibility: (key: string) => void;
  testConnection: (type: 'sms' | 'email' | 'payment') => void;
}

export default function EmailSettings({ 
  settings, 
  updateSetting, 
  showSecrets, 
  toggleSecretVisibility,
  testConnection 
}: EmailSettingsProps) {
  return (
    <TabsContent value="email">
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b">
          <CardHeader className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-800">Email SMTP Settings</CardTitle>
                <CardDescription className="text-slate-600">Configure SMTP server for sending emails</CardDescription>
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-6 space-y-8">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Enable Email Notifications</p>
                <p className="text-sm text-slate-600">Send emails to tenants and admins for notifications</p>
              </div>
            </div>
            <Switch
              checked={settings.email_enabled === 'true'}
              onCheckedChange={(checked) => updateSetting('email_enabled', checked ? 'true' : 'false')}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">SMTP Host</Label>
                <Input
                  value={settings.smtp_host || ''}
                  onChange={(e) => updateSetting('smtp_host', e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">SMTP Port</Label>
                <Input
                  type="number"
                  value={settings.smtp_port || ''}
                  onChange={(e) => updateSetting('smtp_port', e.target.value)}
                  placeholder="587"
                  className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">SMTP Username</Label>
                  <Input
                    value={settings.smtp_username || ''}
                    onChange={(e) => updateSetting('smtp_username', e.target.value)}
                    placeholder="your-email@gmail.com"
                    className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                  />
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">SMTP Password</Label>
                <div className="relative">
                  <Input
                    type={showSecrets.smtp_password ? "text" : "password"}
                    value={settings.smtp_password || ''}
                    onChange={(e) => updateSetting('smtp_password', e.target.value)}
                    placeholder="App password or SMTP password"
                    className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => toggleSecretVisibility('smtp_password')}
                  >
                    {showSecrets.smtp_password ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">From Email</Label>
                <Input
                  type="email"
                  value={settings.smtp_from_email || ''}
                  onChange={(e) => updateSetting('smtp_from_email', e.target.value)}
                  placeholder="noreply@roomac.com"
                  className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">From Name</Label>
                <Input
                  value={settings.smtp_from_name || ''}
                  onChange={(e) => updateSetting('smtp_from_name', e.target.value)}
                  placeholder="ROOMAC"
                  className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-sky-100 rounded-lg mt-1">
                <Shield className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="font-semibold text-sky-800">Gmail Configuration Guide</p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-2 text-sm text-sky-700">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-1.5"></span>
                    Use App Password instead of regular password
                  </li>
                  <li className="flex items-start gap-2 text-sm text-sky-700">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-1.5"></span>
                    Enable 2-Step Verification in your Google Account
                  </li>
                  <li className="flex items-start gap-2 text-sm text-sky-700">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-1.5"></span>
                    Generate App Password at: myaccount.google.com/apppasswords
                  </li>
                  <li className="flex items-start gap-2 text-sm text-sky-700">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-1.5"></span>
                    Use Port 587 with TLS for secure connection
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                className="border-sky-300 text-sky-700 hover:bg-sky-50"
                onClick={() => testConnection('email')}
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Email Connection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}