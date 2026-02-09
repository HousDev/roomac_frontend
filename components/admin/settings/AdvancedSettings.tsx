import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Cog, Globe, Calendar, FileText, Shield, Wrench, Bell } from 'lucide-react';

interface AdvancedSettingsProps {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => void;
}

export default function AdvancedSettings({ settings, updateSetting }: AdvancedSettingsProps) {
  return (
    <TabsContent value="advanced">
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b">
          <CardHeader className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Cog className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-800">Advanced Settings</CardTitle>
                <CardDescription className="text-slate-600">System preferences and analytics</CardDescription>
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-6 space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-slate-700 font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-500" />
                  Timezone
                </Label>
                <Select
                  value={settings.timezone || 'Asia/Kolkata'}
                  onValueChange={(value) => updateSetting('timezone', value)}
                >
                  <SelectTrigger className="h-11 border-slate-300 focus:ring-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  Date Format
                </Label>
                <Select
                  value={settings.date_format || 'DD/MM/YYYY'}
                  onValueChange={(value) => updateSetting('date_format', value)}
                >
                  <SelectTrigger className="h-11 border-slate-300 focus:ring-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">Google Analytics ID</Label>
                <Input
                  value={settings.google_analytics_id || ''}
                  onChange={(e) => updateSetting('google_analytics_id', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="h-11 border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">Facebook Pixel ID</Label>
                <Input
                  value={settings.facebook_pixel_id || ''}
                  onChange={(e) => updateSetting('facebook_pixel_id', e.target.value)}
                  placeholder="XXXXXXXXXXXXXXX"
                  className="h-11 border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  Terms & Conditions URL
                </Label>
                <Input
                  value={settings.terms_url || ''}
                  onChange={(e) => updateSetting('terms_url', e.target.value)}
                  placeholder="/terms"
                  className="h-11 border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-500" />
                  Privacy Policy URL
                </Label>
                <Input
                  value={settings.privacy_url || ''}
                  onChange={(e) => updateSetting('privacy_url', e.target.value)}
                  placeholder="/privacy"
                  className="h-11 border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${settings.maintenance_mode === 'true' 
              ? 'bg-red-50 border-red-200' 
              : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${settings.maintenance_mode === 'true' 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600'}`}
                >
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Maintenance Mode
                  </span>
                  {settings.maintenance_mode === 'true' && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">Active</span>
                  )}
                </div>
              </div>
              <Switch
                checked={settings.maintenance_mode === 'true'}
                onCheckedChange={(checked) => updateSetting('maintenance_mode', checked ? 'true' : 'false')}
                className={`scale-90 ${settings.maintenance_mode === 'true' 
                  ? 'data-[state=checked]:bg-red-600' 
                  : 'data-[state=checked]:bg-gray-600'}`}
              />
            </div>

            <div className={`overflow-hidden transition-all duration-300 ${settings.maintenance_mode === 'true' 
              ? 'max-h-20 opacity-100' 
              : 'max-h-0 opacity-0'}`}
            >
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-700">
                <div className="flex items-center gap-1.5">
                  <Bell className="h-3 w-3 flex-shrink-0" />
                  <span>Site is in maintenance. Public access is disabled. Turn off when done.</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}