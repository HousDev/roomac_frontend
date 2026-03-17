// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import { Key as IconKey, Info as IconInfo } from "lucide-react";

// interface SecuritySectionProps {
//   passwordData: {
//     currentPassword: string;
//     newPassword: string;
//     confirmPassword: string;
//   };
//   loading: boolean;
//   onPasswordDataChange: (data: any) => void;
//   onChangePassword: () => Promise<void>;
// }

// export default function SecuritySection({
//   passwordData,
//   loading,
//   onPasswordDataChange,
//   onChangePassword,
// }: SecuritySectionProps) {
//   return (
//     <>
//       <Card>
//         <CardHeader>
//           <CardTitle>Change Password</CardTitle>
//           <CardDescription>Update your account password</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label>Current Password</Label>
//             <Input
//               type="password"
//               value={passwordData.currentPassword}
//               onChange={(e) => onPasswordDataChange({ ...passwordData, currentPassword: e.target.value })}
//               placeholder="Enter current password"
//             />
//           </div>
//           <div>
//             <Label>New Password</Label>
//             <Input
//               type="password"
//               value={passwordData.newPassword}
//               onChange={(e) => onPasswordDataChange({ ...passwordData, newPassword: e.target.value })}
//               placeholder="Enter new password"
//             />
//             <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
//           </div>
//           <div>
//             <Label>Confirm New Password</Label>
//             <Input
//               type="password"
//               value={passwordData.confirmPassword}
//               onChange={(e) => onPasswordDataChange({ ...passwordData, confirmPassword: e.target.value })}
//               placeholder="Confirm new password"
//             />
//           </div>
//           <Button onClick={onChangePassword} disabled={loading}>
//             <IconKey className="mr-2 h-4 w-4" />
//             Change Password
//           </Button>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Two-Factor Authentication</CardTitle>
//           <CardDescription>Add an extra layer of security to your account</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Alert>
//             <IconInfo className="h-4 w-4" />
//             <AlertDescription>
//               Two-factor authentication is currently not enabled. Contact your property manager to enable this feature.
//             </AlertDescription>
//           </Alert>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Active Sessions</CardTitle>
//           <CardDescription>Manage your active login sessions</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between p-4 border rounded-lg">
//               <div>
//                 <h4 className="font-semibold">Current Device</h4>
//                 <p className="text-sm text-gray-500">Last active: Just now</p>
//               </div>
//               <Badge>Active</Badge>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </>
//   );
// }

// components/tenant/profile/SecuritySection.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Key as IconKey, 
  Info as IconInfo, 
  Shield, 
  Smartphone, 
  Lock, 
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Globe,
  Monitor
} from "lucide-react";
import { useState } from "react";

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

// Password Input Component with visibility toggle
const PasswordInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  error,
  hint
}: { 
  label: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  placeholder: string;
  error?: string;
  hint?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600 flex items-center gap-1">
        <Lock className="h-3 w-3 text-[#004aad]" />
        {label}
      </Label>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`pr-10 border-slate-200 focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] transition-all ${
            error ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#004aad] transition-colors"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-slate-400 mt-1">{hint}</p>
      )}
    </div>
  );
};

// Session Card Component
const SessionCard = ({ 
  device, 
  location, 
  lastActive, 
  isCurrent = false 
}: { 
  device: string; 
  location: string; 
  lastActive: string; 
  isCurrent?: boolean;
}) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isCurrent ? 'bg-[#e6f0ff]' : 'bg-slate-50'}`}>
          <Monitor className={`h-4 w-4 ${isCurrent ? 'text-[#004aad]' : 'text-slate-400'}`} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-slate-800">{device}</h4>
            {isCurrent && (
              <Badge className="bg-[#004aad] text-white border-none text-[8px] px-1.5 py-0">
                Current
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Globe className="h-3 w-3" />
            <span>{location}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Last active: {lastActive}</p>
        </div>
      </div>
      {!isCurrent && (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50">
          <LogOut className="h-4 w-4" />
        </Button>
      )}
    </div>
  </div>
);

export default function SecuritySection({
  passwordData,
  loading,
  onPasswordDataChange,
  onChangePassword,
}: SecuritySectionProps) {
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: 'Not set', color: 'bg-slate-200' };
    if (password.length < 6) return { score: 1, label: 'Weak', color: 'bg-red-400' };
    if (password.length < 8) return { score: 2, label: 'Fair', color: 'bg-yellow-400' };
    if (password.length < 10) return { score: 3, label: 'Good', color: 'bg-[#004aad]' };
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  const validateForm = () => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleChangePassword = async () => {
    if (validateForm()) {
      await onChangePassword();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column - Change Password (2 columns wide) */}
      <div className="lg:col-span-2">
        <Card className="border border-slate-200 shadow-sm overflow-hidden h-full">
          <CardHeader className="pb-4 px-6 pt-5 bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#004aad] rounded-lg">
                <IconKey className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-800">Change Password</CardTitle>
                <CardDescription className="text-xs">Update your account password regularly for security</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              {/* Password Strength Indicator */}
              {passwordData.newPassword && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">Password Strength</span>
                    <Badge className={`${
                      passwordStrength.score === 1 ? 'bg-red-50 text-red-600' :
                      passwordStrength.score === 2 ? 'bg-yellow-50 text-yellow-600' :
                      passwordStrength.score === 3 ? 'bg-[#e6f0ff] text-[#004aad]' :
                      passwordStrength.score === 4 ? 'bg-green-50 text-green-600' :
                      'bg-slate-50 text-slate-400'
                    } border-none text-xs px-2 py-0.5`}>
                      {passwordStrength.label}
                    </Badge>
                  </div>
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength.score
                            ? passwordStrength.color
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <PasswordInput
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => onPasswordDataChange({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                error={passwordErrors.currentPassword}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PasswordInput
                  label="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) => onPasswordDataChange({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  error={passwordErrors.newPassword}
                  hint="Minimum 6 characters"
                />

                <PasswordInput
                  label="Confirm Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => onPasswordDataChange({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  error={passwordErrors.confirmPassword}
                />
              </div>

              <Button 
                onClick={handleChangePassword} 
                disabled={loading}
                className="w-full md:w-auto bg-gradient-to-r from-[#004aad] to-[#002a7a] hover:from-[#003a8d] hover:to-[#001a5a] text-white border-none shadow-lg hover:shadow-xl transition-all duration-200 px-8"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <IconKey className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>

              {/* Password Tips */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-800 mb-1">Password Tips:</p>
                    <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside">
                      <li>Use at least 6 characters</li>
                      <li>Mix uppercase and lowercase letters</li>
                      <li>Include numbers and special characters</li>
                      <li>Avoid common words or patterns</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Other Security Settings (1 column wide) */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Two-Factor Authentication Card */}
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 px-5 pt-4 bg-gradient-to-r from-[#fff9e6] to-[#fff2cc] border-b border-[#ffc107]/30">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#ffc107] rounded-lg">
                <Smartphone className="h-4 w-4 text-[#004aad]" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-800">Two-Factor Auth</CardTitle>
                <CardDescription className="text-[10px]">Extra security layer</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <Alert className="bg-amber-50 border-amber-200 p-3">
              <div className="flex items-start gap-2">
                <IconInfo className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <AlertDescription className="text-xs text-amber-700">
                  2FA is currently disabled. Contact property manager to enable this feature.
                </AlertDescription>
              </div>
            </Alert>
            
            <div className="mt-3 text-center">
              <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[8px]">
                <Shield className="h-2 w-2 mr-1" />
                Not Configured
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions Card */}
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 px-5 pt-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-500 rounded-lg">
                <Monitor className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-800">Active Sessions</CardTitle>
                <CardDescription className="text-[10px]">Manage your logins</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              <SessionCard
                device="Chrome on Windows"
                location="Mumbai, India"
                lastActive="Just now"
                isCurrent={true}
              />
              
              {/* Security Summary */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">Security Score</span>
                  <Badge className="bg-green-50 text-green-600 border-none text-[8px] px-1.5 py-0">
                    <CheckCircle2 className="h-2 w-2 mr-0.5" />
                    Good
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                    <div className="bg-green-500 w-3/4 h-1.5 rounded-full"></div>
                  </div>
                  <span>75%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Last security check: Today at 10:30 AM
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Tips Card */}
        <Card className="bg-gradient-to-br from-[#004aad]/5 to-[#ffc107]/5 border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-[#004aad]" />
              <h4 className="text-xs font-semibold text-slate-700">Security Recommendations</h4>
            </div>
            <ul className="space-y-2 text-[10px] text-slate-500">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Change password every 90 days</span>
              </li>
              <li className="flex items-start gap-1.5">
                <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>Enable 2FA when available</span>
              </li>
              <li className="flex items-start gap-1.5">
                <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>Log out from unused devices</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}