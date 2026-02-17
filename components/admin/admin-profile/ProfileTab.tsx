"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Camera, Trash2, Save } from 'lucide-react';
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

  // ✅ Fixed: Always clears avatar_url locally + calls parent if provided
  const handleRemovePhoto = () => {
    // Clear the avatar_url in profileData immediately
    onProfileDataChange({ ...profileData, avatar_url: '' });
    // Also call parent handler if provided (e.g. to delete from storage)
    if (onAvatarRemove) {
      onAvatarRemove();
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        

        {/* ── Profile Picture Section ── */}
        <div className="flex items-center gap-6 p-5 rounded-xl border border-slate-200 bg-slate-50">

          {/* Avatar with camera badge */}
          <div className="relative w-24 h-24 shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 p-[3px] shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                <Avatar className="w-full h-full rounded-full">
                  <AvatarImage
                    src={profileData.avatar_url}
                    alt={profileData.full_name}
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 w-full h-full flex items-center justify-center rounded-full">
                    {profileData.full_name ? getInitials(profileData.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Camera badge — top-right */}
            <button
              type="button"
              onClick={handleCameraClick}
              disabled={avatarUploading}
              aria-label="Upload profile photo"
              className="
                absolute top-0 right-0
                w-8 h-8
                bg-blue-600 hover:bg-blue-700 active:scale-95
                rounded-full
                flex items-center justify-center
                border-2 border-white
                shadow-lg
                transition-all duration-150
                disabled:opacity-60 disabled:cursor-not-allowed
                cursor-pointer
                z-10
              "
            >
              {avatarUploading ? (
                <svg
                  className="animate-spin h-3.5 w-3.5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <Camera className="h-3.5 w-3.5 text-white" />
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

          {/* Right side: name, role, buttons */}
          <div className="flex flex-1 items-center justify-between gap-4 flex-wrap">

            {/* Name & Role */}
            <div>
              <p className="text-base font-semibold text-slate-800 leading-tight">
                {profileData.full_name || 'Your Name'}
              </p>
              <p className="text-sm text-slate-400 mt-0.5">
                {profileData.role || 'Role'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">

              {/* ✅ Remove Photo — now uses handleRemovePhoto which always works */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemovePhoto}
                disabled={loading || avatarUploading || !profileData.avatar_url}
                className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove Photo
              </Button>

              {/* Save Changes */}
              <Button
                type="button"
                size="sm"
                onClick={onSave}
                disabled={loading || avatarUploading}
                className="bg-blue-600 hover:bg-blue-700 gap-1.5"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-3.5 w-3.5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </>
                )}
              </Button>

            </div>
          </div>
        </div>

        {/* ── Form Fields ── */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Full Name *</Label>
            <Input
              value={profileData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              disabled={loading}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <Label>Role</Label>
            <Input value={profileData.role} disabled className="bg-slate-50" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                className="pl-10 bg-slate-50"
                value={profileData.email}
                disabled
              />
            </div>
          </div>
          <div>
            <Label>Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                className="pl-10"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={loading}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        <div>
          <Label>Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              className="pl-10"
              value={profileData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={loading}
              placeholder="Enter your address"
            />
          </div>
        </div>

        <div>
          <Label>Bio</Label>
          <Textarea
            rows={4}
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            disabled={loading}
            placeholder="Tell us about yourself..."
          />
        </div>

      </CardContent>
    </Card>
  );
}