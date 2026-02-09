"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  payment_alerts: boolean;
  booking_alerts: boolean;
  maintenance_alerts: boolean;
}

interface NotificationsTabProps {
  notificationSettings: NotificationSettings;
  onNotificationSettingsChange: (settings: NotificationSettings) => void;
  onSave: () => void;
  onReset: () => void;
  loading: boolean;
}

export default function NotificationsTab({
  notificationSettings,
  onNotificationSettingsChange,
  onSave,
  onReset,
  loading
}: NotificationsTabProps) {
  const handleToggle = (field: keyof NotificationSettings, checked: boolean) => {
    onNotificationSettingsChange({ ...notificationSettings, [field]: checked });
  };

  return (
    <Card>
      <CardHeader className='bg-blue-50 mb-2'>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" /> Notification Preferences
        </CardTitle>
        <CardDescription>Choose how you want to receive notifications</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-slate-500">Receive notifications via email</p>
            </div>
            <input 
              type="checkbox" 
              checked={notificationSettings.email_notifications} 
              onChange={(e) => handleToggle('email_notifications', e.target.checked)}
              disabled={loading}
              className="h-5 w-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">SMS Notifications</h4>
              <p className="text-sm text-slate-500">Receive notifications via SMS</p>
            </div>
            <input 
              type="checkbox" 
              checked={notificationSettings.sms_notifications} 
              onChange={(e) => handleToggle('sms_notifications', e.target.checked)}
              disabled={loading}
              className="h-5 w-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">WhatsApp Notifications</h4>
              <p className="text-sm text-slate-500">Receive notifications via WhatsApp</p>
            </div>
            <input 
              type="checkbox" 
              checked={notificationSettings.whatsapp_notifications} 
              onChange={(e) => handleToggle('whatsapp_notifications', e.target.checked)}
              disabled={loading}
              className="h-5 w-5 rounded"
            />
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label>Payment Alerts</Label>
            <input 
              type="checkbox" 
              checked={notificationSettings.payment_alerts} 
              onChange={(e) => handleToggle('payment_alerts', e.target.checked)}
              disabled={loading}
              className="h-5 w-5 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Booking Alerts</Label>
            <input 
              type="checkbox" 
              checked={notificationSettings.booking_alerts} 
              onChange={(e) => handleToggle('booking_alerts', e.target.checked)}
              disabled={loading}
              className="h-5 w-5 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Maintenance Alerts</Label>
            <input 
              type="checkbox" 
              checked={notificationSettings.maintenance_alerts} 
              onChange={(e) => handleToggle('maintenance_alerts', e.target.checked)}
              disabled={loading}
              className="h-5 w-5 rounded"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onReset} 
            disabled={loading}
          >
            Reset Defaults
          </Button>
          <Button 
            onClick={onSave} 
            disabled={loading} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}