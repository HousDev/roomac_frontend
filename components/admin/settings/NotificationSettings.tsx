import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell } from 'lucide-react';

interface NotificationSettingsProps {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => void;
}

export default function NotificationSettings({ settings, updateSetting }: NotificationSettingsProps) {
  return (
    <TabsContent value="notifications">
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-2 border-b">
          <CardHeader className="p-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-800">Notification Preferences</CardTitle>
                <CardDescription className="text-xs text-slate-600">Configure which events trigger notifications</CardDescription>
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            {[
              { key: 'notify_new_booking', label: 'New Booking Notifications', desc: 'Get notified when new bookings are created' },
              { key: 'notify_payment_received', label: 'Payment Received Notifications', desc: 'Get notified when payments are received' },
              { key: 'notify_maintenance_request', label: 'Maintenance Request Notifications', desc: 'Get notified about maintenance requests' },
              { key: 'notify_complaint', label: 'Complaint Notifications', desc: 'Get notified about new complaints' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/50 transition-all">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-white border border-slate-200 rounded-lg">
                    <Bell className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[item.key] === 'true'}
                  onCheckedChange={(checked) => updateSetting(item.key, checked ? 'true' : 'false')}
                  className="data-[state=checked]:bg-orange-600 scale-90"
                />
              </div>
            ))}
          </div>

          <Separator className="my-2" />

          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
              Admin Contacts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-700 font-medium">Admin Email</Label>
                <Input
                  type="email"
                  value={settings.admin_notification_email || ''}
                  onChange={(e) => updateSetting('admin_notification_email', e.target.value)}
                  placeholder="admin@roomac.com"
                  className="h-8 text-sm border-slate-300 focus:border-orange-600 focus:ring-orange-600"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-700 font-medium">Admin Phone</Label>
                <Input
                  value={settings.admin_notification_phone || ''}
                  onChange={(e) => updateSetting('admin_notification_phone', e.target.value)}
                  placeholder="+919876543210"
                  className="h-8 text-sm border-slate-300 focus:border-orange-600 focus:ring-orange-600"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}