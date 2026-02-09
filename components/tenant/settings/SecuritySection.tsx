import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Key as IconKey, Info as IconInfo } from "lucide-react";

interface SecuritySectionProps {
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  loading: boolean;
  onPasswordDataChange: (data: any) => void;
  onChangePassword: () => Promise<void>;
}

export default function SecuritySection({
  passwordData,
  loading,
  onPasswordDataChange,
  onChangePassword,
}: SecuritySectionProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => onPasswordDataChange({ ...passwordData, currentPassword: e.target.value })}
              placeholder="Enter current password"
            />
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => onPasswordDataChange({ ...passwordData, newPassword: e.target.value })}
              placeholder="Enter new password"
            />
            <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => onPasswordDataChange({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
            />
          </div>
          <Button onClick={onChangePassword} disabled={loading}>
            <IconKey className="mr-2 h-4 w-4" />
            Change Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <IconInfo className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication is currently not enabled. Contact your property manager to enable this feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Current Device</h4>
                <p className="text-sm text-gray-500">Last active: Just now</p>
              </div>
              <Badge>Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}