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

  const Switch = ({ checked, onChange, disabled }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full 
        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${checked ? 'bg-blue-600' : 'bg-slate-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-blue-50 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" /> Notification Preferences
        </CardTitle>
        <CardDescription className="text-sm">
          Choose how you want to receive notifications
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-4 sm:p-6">
        {/* Main Notification Channels */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Notification Channels</h3>
          
          {/* Email Notifications */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-2 sm:gap-4">
            <div className="flex-1">
              <h4 className="font-medium text-sm sm:text-base">Email Notifications</h4>
              <p className="text-xs sm:text-sm text-slate-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={notificationSettings.email_notifications}
              onChange={(checked) => handleToggle('email_notifications', checked)}
              disabled={loading}
            />
          </div>

          {/* SMS Notifications */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-2 sm:gap-4">
            <div className="flex-1">
              <h4 className="font-medium text-sm sm:text-base">SMS Notifications</h4>
              <p className="text-xs sm:text-sm text-slate-500">Receive notifications via SMS</p>
            </div>
            <Switch
              checked={notificationSettings.sms_notifications}
              onChange={(checked) => handleToggle('sms_notifications', checked)}
              disabled={loading}
            />
          </div>

          {/* WhatsApp Notifications */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-2 sm:gap-4">
            <div className="flex-1">
              <h4 className="font-medium text-sm sm:text-base">WhatsApp Notifications</h4>
              <p className="text-xs sm:text-sm text-slate-500">Receive notifications via WhatsApp</p>
            </div>
            <Switch
              checked={notificationSettings.whatsapp_notifications}
              onChange={(checked) => handleToggle('whatsapp_notifications', checked)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Alert Types */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Alert Types</h3>
          <div className="space-y-4">
            {/* Payment Alerts */}
            <div className="flex items-center justify-between">
              <Label className="text-sm sm:text-base cursor-pointer">Payment Alerts</Label>
              <Switch
                checked={notificationSettings.payment_alerts}
                onChange={(checked) => handleToggle('payment_alerts', checked)}
                disabled={loading}
              />
            </div>

            {/* Booking Alerts */}
            <div className="flex items-center justify-between">
              <Label className="text-sm sm:text-base cursor-pointer">Booking Alerts</Label>
              <Switch
                checked={notificationSettings.booking_alerts}
                onChange={(checked) => handleToggle('booking_alerts', checked)}
                disabled={loading}
              />
            </div>

            {/* Maintenance Alerts */}
            <div className="flex items-center justify-between">
              <Label className="text-sm sm:text-base cursor-pointer">Maintenance Alerts</Label>
              <Switch
                checked={notificationSettings.maintenance_alerts}
                onChange={(checked) => handleToggle('maintenance_alerts', checked)}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons - Stack on mobile */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6">
          <Button 
            variant="outline" 
            onClick={onReset} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Reset Defaults
          </Button>
          <Button 
            onClick={onSave} 
            disabled={loading} 
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}