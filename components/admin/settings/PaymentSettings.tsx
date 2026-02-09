import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CreditCard, TestTube, Eye, EyeOff } from 'lucide-react';

interface PaymentSettingsProps {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => void;
  showSecrets: Record<string, boolean>;
  toggleSecretVisibility: (key: string) => void;
  testConnection: (type: 'sms' | 'email' | 'payment') => void;
}

export default function PaymentSettings({ 
  settings, 
  updateSetting, 
  showSecrets, 
  toggleSecretVisibility,
  testConnection 
}: PaymentSettingsProps) {
  return (
    <TabsContent value="payment">
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b">
          <CardHeader className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-800">Payment Gateway Settings</CardTitle>
                <CardDescription className="text-slate-600">Configure Razorpay for online payments</CardDescription>
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-6 space-y-8">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-50 to-white rounded-2xl border border-emerald-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Enable Razorpay</p>
                <p className="text-sm text-slate-600">Accept online payments via Razorpay gateway</p>
              </div>
            </div>
            <Switch
              checked={settings.razorpay_enabled === 'true'}
              onCheckedChange={(checked) => updateSetting('razorpay_enabled', checked ? 'true' : 'false')}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-slate-700 font-medium">Razorpay Key ID</Label>
              <div className="relative">
                <Input
                  type={showSecrets.razorpay_key_id ? "text" : "password"}
                  value={settings.razorpay_key_id || ''}
                  onChange={(e) => updateSetting('razorpay_key_id', e.target.value)}
                  placeholder="rzp_test_xxxxxxxxxxxxx"
                  className="h-11 border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => toggleSecretVisibility('razorpay_key_id')}
                >
                  {showSecrets.razorpay_key_id ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-700 font-medium">Razorpay Key Secret</Label>
              <div className="relative">
                <Input
                  type={showSecrets.razorpay_key_secret ? "text" : "password"}
                  value={settings.razorpay_key_secret || ''}
                  onChange={(e) => updateSetting('razorpay_key_secret', e.target.value)}
                  placeholder="Enter your Razorpay secret key"
                  className="h-11 border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => toggleSecretVisibility('razorpay_key_secret')}
                >
                  {showSecrets.razorpay_key_secret ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-700 font-medium">Webhook Secret</Label>
              <div className="relative">
                <Input
                  type={showSecrets.razorpay_webhook_secret ? "text" : "password"}
                  value={settings.razorpay_webhook_secret || ''}
                  onChange={(e) => updateSetting('razorpay_webhook_secret', e.target.value)}
                  placeholder="whsec_xxxxxxxxxxxxx"
                  className="h-11 border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => toggleSecretVisibility('razorpay_webhook_secret')}
                >
                  {showSecrets.razorpay_webhook_secret ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500">Used to verify webhook signatures</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-lime-50 to-emerald-50 border border-lime-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-lime-100 rounded-lg mt-1">
                <CreditCard className="h-5 w-5 text-lime-600" />
              </div>
              <div>
                <p className="font-semibold text-lime-800">Get Started with Razorpay</p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-2 text-sm text-lime-700">
                    <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mt-1.5"></span>
                    Sign up at razorpay.com and complete KYC
                  </li>
                  <li className="flex items-start gap-2 text-sm text-lime-700">
                    <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mt-1.5"></span>
                    Get API keys from Dashboard → Settings
                  </li>
                  <li className="flex items-start gap-2 text-sm text-lime-700">
                    <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mt-1.5"></span>
                    Use Test mode keys for testing (rzp_test_)
                  </li>
                  <li className="flex items-start gap-2 text-sm text-lime-700">
                    <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mt-1.5"></span>
                    Switch to Live keys after going live (rzp_live_)
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                className="border-lime-300 text-lime-700 hover:bg-lime-50"
                onClick={() => testConnection('payment')}
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Payment Connection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}