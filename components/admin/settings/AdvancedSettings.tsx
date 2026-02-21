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
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-5 py-2 border-b">
          <CardHeader className="p-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <Cog className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-800">Advanced Settings</CardTitle>
                <CardDescription className="text-xs text-slate-600">System preferences and analytics</CardDescription>
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-500" />
                  Timezone
                </Label>
                <Select
                  value={settings.timezone || 'Asia/Kolkata'}
                  onValueChange={(value) => updateSetting('timezone', value)}
                >
                  <SelectTrigger className="h-8 text-sm border-slate-300 focus:ring-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata" className="text-sm">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="Asia/Dubai" className="text-sm">Asia/Dubai (GST)</SelectItem>
                    <SelectItem value="America/New_York" className="text-sm">America/New_York (EST)</SelectItem>
                    <SelectItem value="Europe/London" className="text-sm">Europe/London (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  Date Format
                </Label>
                <Select
                  value={settings.date_format || 'DD/MM/YYYY'}
                  onValueChange={(value) => updateSetting('date_format', value)}
                >
                  <SelectTrigger className="h-8 text-sm border-slate-300 focus:ring-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY" className="text-sm">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY" className="text-sm">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD" className="text-sm">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-700 font-medium">Google Analytics ID</Label>
                <Input
                  value={settings.google_analytics_id || ''}
                  onChange={(e) => updateSetting('google_analytics_id', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="h-8 text-sm border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-700 font-medium">Facebook Pixel ID</Label>
                <Input
                  value={settings.facebook_pixel_id || ''}
                  onChange={(e) => updateSetting('facebook_pixel_id', e.target.value)}
                  placeholder="XXXXXXXXXXXXXXX"
                  className="h-8 text-sm border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                  Terms URL
                </Label>
                <Input
                  value={settings.terms_url || ''}
                  onChange={(e) => updateSetting('terms_url', e.target.value)}
                  placeholder="/terms"
                  className="h-8 text-sm border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-slate-500" />
                  Privacy URL
                </Label>
                <Input
                  value={settings.privacy_url || ''}
                  onChange={(e) => updateSetting('privacy_url', e.target.value)}
                  placeholder="/privacy"
                  className="h-8 text-sm border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                />
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          <div className="space-y-1.5">
            <div className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
              settings.maintenance_mode === 'true' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${
                  settings.maintenance_mode === 'true' 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium">Maintenance Mode</span>
                  {settings.maintenance_mode === 'true' && (
                    <span className="px-1 py-0.5 bg-red-100 text-red-700 text-[10px] rounded">Active</span>
                  )}
                </div>
              </div>
              <Switch
                checked={settings.maintenance_mode === 'true'}
                onCheckedChange={(checked) => updateSetting('maintenance_mode', checked ? 'true' : 'false')}
                className={`scale-75 ${
                  settings.maintenance_mode === 'true' 
                    ? 'data-[state=checked]:bg-red-600' 
                    : 'data-[state=checked]:bg-gray-600'
                }`}
              />
            </div>

            <div className={`overflow-hidden transition-all duration-300 ${
              settings.maintenance_mode === 'true' 
                ? 'max-h-20 opacity-100' 
                : 'max-h-0 opacity-0'
            }`}>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-1.5 text-[10px] text-yellow-700">
                <div className="flex items-center gap-1">
                  <Bell className="h-2.5 w-2.5 flex-shrink-0" />
                  <span>Site is in maintenance. Public access disabled. Turn off when done.</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}