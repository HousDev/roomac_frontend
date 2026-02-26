"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Camera, Trash2, Save, User as UserIcon } from 'lucide-react';
import { useRef } from 'react';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  bio: string;
  avatar_url: string;
}

interface ProfileTabProps {
  profileData: ProfileData;
  onProfileDataChange: (data: ProfileData) => void;
  onAvatarUpload: (file: File) => void;
  onAvatarRemove?: () => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  avatarUploading: boolean;
}

export default function ProfileTab({
  profileData,
  onProfileDataChange,
  onAvatarUpload,
  onAvatarRemove,
  onSave,
  onCancel,
  loading,
  avatarUploading
}: ProfileTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    onProfileDataChange({ ...profileData, [field]: value });
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarUpload(file);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    onProfileDataChange({ ...profileData, avatar_url: '' });
    if (onAvatarRemove) {
      onAvatarRemove();
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Determine role based on email if not provided
  const displayRole = profileData.role || 
    (profileData.email?.includes('admin') ? 'Super Admin' : 'Administrator');

  return (
    <Card className="overflow-hidden border-0 shadow-lg rounded-2xl">
      <CardContent className="space-y-6 p-4 sm:p-6 md:p-8">
        
        {/* Header with gradient background */}
        {/* <div className="relative -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 mb-4 px-4 sm:px-6 py-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            Profile Settings
          </h2>
          <p className="text-blue-100 text-sm sm:text-base mt-1">
            Manage your personal information and profile picture
          </p>
        </div> */}
        
        {/* Profile Picture Section - Enhanced responsive design */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 p-6 sm:p-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm hover:shadow-md transition-all duration-300">
          
          {/* Avatar with animated camera badge */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 shrink-0 group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 p-[3px] shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                <Avatar className="w-full h-full rounded-full">
                  <AvatarImage
                    src={profileData.avatar_url}
                    alt={profileData.full_name}
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback className="text-2xl sm:text-3xl md:text-4xl font-semibold bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 w-full h-full flex items-center justify-center rounded-full">
                    {profileData.full_name ? getInitials(profileData.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Camera badge with animation */}
            <button
              type="button"
              onClick={handleCameraClick}
              disabled={avatarUploading}
              aria-label="Upload profile photo"
              className="
                absolute -top-1 -right-1 sm:top-0 sm:right-0
                w-8 h-8 sm:w-9 sm:h-9
                bg-blue-600 hover:bg-blue-700 active:scale-90
                rounded-full
                flex items-center justify-center
                border-2 border-white
                shadow-lg
                transition-all duration-300
                disabled:opacity-60 disabled:cursor-not-allowed
                cursor-pointer
                z-10
                hover:rotate-12
              "
            >
              {avatarUploading ? (
                <svg
                  className="animate-spin h-4 w-4 sm:h-4.5 sm:w-4.5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <Camera className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-white" />
              )}
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Right side: name, role, buttons - Enhanced layout */}
          <div className="flex flex-1 flex-col items-center sm:items-start gap-4 w-full">
            
            {/* Name & Role */}
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
                {profileData.full_name || 'Your Name'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                  {displayRole}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-400">Active</span>
              </div>
            </div>

            {/* Action Buttons - Enhanced with better spacing */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-2">
              
              {/* Remove Photo Button */}
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={handleRemovePhoto}
                disabled={loading || avatarUploading || !profileData.avatar_url}
                className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 gap-2 w-full sm:w-auto px-6 py-2 rounded-xl transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove Photo</span>
              </Button>

              {/* Save Changes Button */}
              <Button
                type="button"
                size="default"
                onClick={onSave}
                disabled={loading || avatarUploading}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 gap-2 w-full sm:w-auto px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>

            </div>
          </div>
        </div>

        {/* Form Fields - Enhanced with better styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></Label>
            <Input
              value={profileData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              disabled={loading}
              placeholder="Enter your full name"
              className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Role</Label>
            <div className="relative">
              <Input 
                value={displayRole} 
                disabled 
                className="bg-slate-50 w-full rounded-xl border-slate-200 text-slate-600" 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Email <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-10 bg-slate-50 w-full rounded-xl border-slate-200 text-slate-600 font-mono"
                value={profileData.email}
                disabled
                placeholder="Email address"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Email cannot be changed
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-10 w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={loading}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-10 w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              value={profileData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={loading}
              placeholder="Enter your address"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Bio</Label>
          <Textarea
            rows={4}
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            disabled={loading}
            placeholder="Tell us about yourself..."
            className="w-full resize-none rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        {/* Footer with cancel button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl px-6"
          >
            Cancel
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}