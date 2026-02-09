"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Key } from 'lucide-react';

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface SecurityTabProps {
  passwordData: PasswordData;
  onPasswordDataChange: (data: PasswordData) => void;
  onChangePassword: () => void;
  onClear: () => void;
  loading: boolean;
}

export default function SecurityTab({
  passwordData,
  onPasswordDataChange,
  onChangePassword,
  onClear,
  loading
}: SecurityTabProps) {
  const handleInputChange = (field: keyof PasswordData, value: string) => {
    onPasswordDataChange({ ...passwordData, [field]: value });
  };

  return (
    <Card>
      <CardHeader className='bg-blue-50 mb-2'>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" /> Security Settings
        </CardTitle>
        <CardDescription>Manage your password and security preferences</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Current Password *</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                type="password" 
                className="pl-10" 
                value={passwordData.current_password}
                onChange={(e) => handleInputChange('current_password', e.target.value)}
                disabled={loading}
                placeholder="Enter current password"
              />
            </div>
          </div>

          <div>
            <Label>New Password *</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                type="password" 
                className="pl-10" 
                value={passwordData.new_password}
                onChange={(e) => handleInputChange('new_password', e.target.value)}
                disabled={loading}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">Must be at least 8 characters</p>
          </div>

          <div>
            <Label>Confirm New Password *</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                type="password" 
                className="pl-10" 
                value={passwordData.confirm_password}
                onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                disabled={loading}
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-3">Two-Factor Authentication</h3>
          <p className="text-sm text-slate-600 mb-4">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>
          <Button 
            variant="outline"
            onClick={() => alert("2FA feature coming soon!")}
            disabled={loading}
          >
            Enable 2FA
          </Button>
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClear} 
            disabled={loading}
          >
            Clear
          </Button>
          <Button 
            onClick={onChangePassword} 
            disabled={loading} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}