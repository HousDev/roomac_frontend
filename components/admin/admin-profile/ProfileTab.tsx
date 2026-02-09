"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Upload } from 'lucide-react';
import AvatarUploader from './AvatarUploader';

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
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  avatarUploading: boolean;
}

export default function ProfileTab({
  profileData,
  onProfileDataChange,
  onAvatarUpload,
  onSave,
  onCancel,
  loading,
  avatarUploading
}: ProfileTabProps) {
  const handleInputChange = (field: keyof ProfileData, value: string) => {
    onProfileDataChange({ ...profileData, [field]: value });
  };

  return (
    <Card>
      <CardHeader className='bg-blue-50 mb-2'>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" /> Profile Information
        </CardTitle>
        <CardDescription>Update your personal information and public profile</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <AvatarUploader
          avatarUrl={profileData.avatar_url}
          fullName={profileData.full_name}
          onUpload={onAvatarUpload}
          uploading={avatarUploading}
        />

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

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave} 
            disabled={loading} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}