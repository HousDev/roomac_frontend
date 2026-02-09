import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check as IconCheck } from "lucide-react";
import type { NotificationPreferences } from "@/lib/tenantSettingsApi";

interface NotificationsSectionProps {
  notifications: NotificationPreferences;
  loading: boolean;
  onNotificationsChange: (notifications: NotificationPreferences) => void;
  onUpdateNotifications: () => Promise<void>;
}

export default function NotificationsSection({
  notifications,
  loading,
  onNotificationsChange,
  onUpdateNotifications,
}: NotificationsSectionProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Choose what emails you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => onNotificationsChange({ ...notifications, emailNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Payment Reminders</h4>
              <p className="text-sm text-gray-500">Get reminded about upcoming payments</p>
            </div>
            <Switch
              checked={notifications.paymentReminders}
              onCheckedChange={(checked) => onNotificationsChange({ ...notifications, paymentReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Maintenance Updates</h4>
              <p className="text-sm text-gray-500">Notifications about maintenance work</p>
            </div>
            <Switch
              checked={notifications.maintenanceUpdates}
              onCheckedChange={(checked) => onNotificationsChange({ ...notifications, maintenanceUpdates: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">General Announcements</h4>
              <p className="text-sm text-gray-500">Important updates and announcements</p>
            </div>
            <Switch
              checked={notifications.generalAnnouncements}
              onCheckedChange={(checked) => onNotificationsChange({ ...notifications, generalAnnouncements: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={onUpdateNotifications} disabled={loading}>
        <IconCheck className="mr-2 h-4 w-4" />
        Save Notification Preferences
      </Button>
    </>
  );
}