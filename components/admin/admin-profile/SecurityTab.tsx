"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Key, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [passwordError, setPasswordError] = useState<string>('');
  const [touched, setTouched] = useState({
    new_password: false,
    confirm_password: false
  });

  const handleInputChange = (field: keyof PasswordData, value: string) => {
    onPasswordDataChange({ ...passwordData, [field]: value });
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validate passwords
  useEffect(() => {
    if (touched.confirm_password && passwordData.new_password && passwordData.confirm_password) {
      if (passwordData.new_password !== passwordData.confirm_password) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  }, [passwordData.new_password, passwordData.confirm_password, touched.confirm_password]);

  // Check if new password meets minimum requirements
  const isNewPasswordValid = passwordData.new_password.length >= 8 || !touched.new_password;
  const isNewPasswordValidMessage = touched.new_password && passwordData.new_password.length < 8 
    ? 'Password must be at least 8 characters' 
    : '';

  const handleClear = () => {
    onClear();
    setTouched({
      new_password: false,
      confirm_password: false
    });
    setPasswordError('');
  };

  return (
    <Card className="overflow-hidden w-full max-w-5xl mx-auto">
      <CardHeader className="bg-blue-50 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5" /> Security Settings
        </CardTitle>
        <CardDescription className="text-sm">
          Manage your password and security preferences
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Password *</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
              <Input 
                type={showPasswords.current ? "text" : "password"}
                className="pl-10 pr-10 w-full" 
                value={passwordData.current_password}
                onChange={(e) => handleInputChange('current_password', e.target.value)}
                disabled={loading}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPasswords.current ? 
                  <EyeOff className="h-4 w-4" /> : 
                  <Eye className="h-4 w-4" />
                }
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">New Password *</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
              <Input 
                type={showPasswords.new ? "text" : "password"}
                className={`pl-10 pr-10 w-full ${
                  touched.new_password && passwordData.new_password.length < 8 
                    ? 'border-red-500 focus:ring-red-500' 
                    : ''
                }`}
                value={passwordData.new_password}
                onChange={(e) => handleInputChange('new_password', e.target.value)}
                onBlur={() => handleBlur('new_password')}
                disabled={loading}
                placeholder="Enter new password (min 8 characters)"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPasswords.new ? 
                  <EyeOff className="h-4 w-4" /> : 
                  <Eye className="h-4 w-4" />
                }
              </button>
            </div>
            
            {/* Password length hint */}
            <p className={`text-xs sm:text-sm mt-1 ${
              touched.new_password && passwordData.new_password.length < 8 
                ? 'text-red-500' 
                : 'text-slate-500'
            }`}>
              Must be at least 8 characters
              {passwordData.new_password.length > 0 && (
                <span className="ml-1">
                  ({passwordData.new_password.length}/8)
                </span>
              )}
            </p>
            
            {/* Password length error */}
            {isNewPasswordValidMessage && (
              <p className="text-xs sm:text-sm text-red-500 mt-1">
                {isNewPasswordValidMessage}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Confirm New Password *</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
              <Input 
                type={showPasswords.confirm ? "text" : "password"}
                className={`pl-10 pr-10 w-full ${
                  passwordError ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                value={passwordData.confirm_password}
                onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                onBlur={() => handleBlur('confirm_password')}
                disabled={loading}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPasswords.confirm ? 
                  <EyeOff className="h-4 w-4" /> : 
                  <Eye className="h-4 w-4" />
                }
              </button>
            </div>
            
            {/* Password mismatch error */}
            {passwordError && (
              <p className="text-xs sm:text-sm text-red-500 mt-1 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                {passwordError}
              </p>
            )}
            
            {/* Success message when passwords match */}
            {!passwordError && 
             touched.confirm_password && 
             passwordData.new_password && 
             passwordData.confirm_password && 
             passwordData.new_password === passwordData.confirm_password && (
              <p className="text-xs sm:text-sm text-green-500 mt-1 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-green-500"></span>
                Passwords match
              </p>
            )}
          </div>
        </div>

        {/* Two-Factor Authentication Section */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-base sm:text-lg mb-2">
            Two-Factor Authentication
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mb-4">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>
          <Button 
            variant="outline"
            onClick={() => alert("2FA feature coming soon!")}
            disabled={loading}
            className="w-full sm:w-auto touch-manipulation"
          >
            Enable 2FA
          </Button>
        </div>

        {/* Action Buttons - Stack on mobile */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={handleClear} 
            disabled={loading}
            className="w-full sm:w-auto min-h-[44px] touch-manipulation"
          >
            Clear
          </Button>
          <Button 
            onClick={onChangePassword} 
            disabled={loading || !!passwordError || (touched.new_password && passwordData.new_password.length < 8)} 
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto min-h-[44px] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}