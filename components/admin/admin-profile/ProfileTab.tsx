

// components/admin/admin-profile/ProfileTab.tsx
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Camera, Trash2, Save, User as UserIcon, Loader2 } from 'lucide-react';
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
  avatarUploading,
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
    if (onAvatarRemove) onAvatarRemove();
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

  const displayRole =
    profileData.role ||
    (profileData.email?.includes('admin') ? 'Super Admin' : 'Administrator');

  const avatarSrc = profileData.avatar_url
    ? `${import.meta.env.VITE_API_URL}/uploads/staff-documents/${profileData.avatar_url}`
    : undefined;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .pt-wrap {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(15,23,42,.10), 0 2px 8px rgba(15,23,42,.06);
        }

        /* ── Banner ── */
        .pt-banner {
          background: linear-gradient(120deg, #0A1F5C 0%, #1740C0 50%, #2563EB 100%);
          padding: 28px 32px 68px;
          position: relative;
          overflow: hidden;
        }
        .pt-banner::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 22px 22px;
          pointer-events: none;
        }
        .pt-banner::after {
          content: '';
          position: absolute; bottom: -40px; left: 0; right: 0;
          height: 80px;
          background: #fff;
          border-radius: 40px 40px 0 0;
        }
        .pt-banner-inner { position: relative; z-index: 1; }
        .pt-banner-title {
          font-size: 19px; font-weight: 800; color: #fff;
          display: flex; align-items: center; gap: 8px;
        }
        .pt-banner-sub { font-size: 13px; color: rgba(255,255,255,.6); margin-top: 4px; }

        /* ── Avatar card ── */
        .pt-av-section { position: relative; z-index: 2; padding: 0 24px; margin-top: -46px; }
        .pt-av-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 22px 26px;
          display: flex;
          align-items: center;
          gap: 22px;
          box-shadow: 0 4px 20px rgba(15,23,42,.08);
          flex-wrap: wrap;
        }
        .pt-av-ring {
          width: 92px; height: 92px;
          border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #60A5FA, #1E4ED8);
          padding: 3px;
          box-shadow: 0 4px 18px rgba(30,78,216,.3);
          position: relative;
        }
        .pt-av-inner {
          width: 100%; height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #E0E7FF, #C7D2FE);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .pt-av-cam {
          position: absolute; bottom: 2px; right: 2px;
          width: 29px; height: 29px; border-radius: 50%;
          background: #2563EB;
          border: 2.5px solid #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(37,99,235,.4);
          transition: transform .2s, background .2s;
        }
        .pt-av-cam:hover { background: #1E4ED8; transform: rotate(12deg) scale(1.1); }
        .pt-av-cam:disabled { opacity: .6; cursor: not-allowed; transform: none; }

        .pt-av-name { font-size: 19px; font-weight: 800; color: #0F172A; line-height: 1.2; }
        .pt-av-meta { display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
        .pt-role-pill {
          font-size: 11.5px; font-weight: 600;
          padding: 4px 12px; border-radius: 99px;
          background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE;
        }
        .pt-active-dot { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: #94A3B8; }
        .pt-dot { width: 7px; height: 7px; border-radius: 50%; background: #059669; }

        .pt-av-btns { display: flex; align-items: center; gap: 10px; margin-top: 14px; flex-wrap: wrap; }

        /* ── Section label ── */
        .pt-sec-lbl {
          font-size: 10.5px; font-weight: 700; letter-spacing: .08em;
          text-transform: uppercase; color: #94A3B8;
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .pt-sec-lbl::after { content: ''; flex: 1; height: 1px; background: #E2E8F0; }

        /* ── Form ── */
        .pt-form { padding: 24px 24px 16px; }
        .pt-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
        .pt-g1 { margin-bottom: 18px; }

        .pt-field { display: flex; flex-direction: column; gap: 6px; }
        .pt-lbl { font-size: 12px; font-weight: 700; color: #475569; letter-spacing: .01em; }
        .pt-lbl-req { color: #DC2626; margin-left: 2px; }
        .pt-hint { font-size: 11px; color: #94A3B8; margin-top: 3px; }

        .pt-inp-wrap { position: relative; }
        .pt-inp-ico {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          pointer-events: none; color: #94A3B8;
          display: flex; align-items: center;
        }
        .pt-inp {
          width: 100%; padding: 10px 14px;
          border-radius: 12px; border: 1.5px solid #E2E8F0;
          background: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px; color: #0F172A; outline: none;
          transition: border-color .18s, box-shadow .18s;
          box-sizing: border-box;
        }
        .pt-inp:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
        .pt-inp.with-icon { padding-left: 40px; }
        .pt-inp.disabled-inp { background: #F8FAFC; color: #94A3B8; cursor: not-allowed; }
        .pt-inp-ta {
          width: 100%; padding: 11px 14px;
          border-radius: 12px; border: 1.5px solid #E2E8F0;
          background: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px; color: #0F172A; outline: none;
          resize: none; line-height: 1.6;
          transition: border-color .18s, box-shadow .18s;
          box-sizing: border-box;
        }
        .pt-inp-ta:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }

        /* ── Footer ── */
        .pt-footer {
          padding: 14px 24px 22px;
          border-top: 1px solid #F1F5F9;
          display: flex; justify-content: flex-end;
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .pt-banner {
            padding: 20px 18px 60px;
          }
          .pt-banner-title { font-size: 16px; }
          .pt-banner-sub { font-size: 12px; }

          .pt-av-section { padding: 0 12px; margin-top: -38px; }
          .pt-av-card {
            padding: 14px 14px;
            gap: 12px;
            border-radius: 16px;
            flex-direction: row;
            align-items: flex-start;
          }
          .pt-av-ring { width: 68px; height: 68px; }
          .pt-av-cam { width: 24px; height: 24px; bottom: 1px; right: 1px; }
          .pt-av-name { font-size: 15px; }
          .pt-role-pill { font-size: 10.5px; padding: 3px 9px; }
          .pt-active-dot { font-size: 10.5px; }
          .pt-av-btns { gap: 7px; margin-top: 10px; }
          .pt-av-btns .av-btn-text { display: none; }

          .pt-form { padding: 16px 12px 10px; }
          .pt-g2 { grid-template-columns: 1fr; gap: 12px; margin-bottom: 12px; }
          .pt-g1 { margin-bottom: 12px; }

          .pt-inp { font-size: 13px; padding: 9px 12px; border-radius: 10px; }
          .pt-inp.with-icon { padding-left: 36px; }
          .pt-inp-ta { font-size: 13px; padding: 9px 12px; border-radius: 10px; }
          .pt-lbl { font-size: 11.5px; }
          .pt-sec-lbl { font-size: 10px; }

          .pt-footer { padding: 10px 12px 16px; }
        }
      `}</style>

      <div className="pt-wrap">
        {/* ── Banner ── */}
        <div className="pt-banner">
          <div className="pt-banner-inner">
            <div className="pt-banner-title">
              <UserIcon className="h-5 w-5" style={{ color: 'rgba(255,255,255,.9)' }} />
              Profile Settings
            </div>
            <p className="pt-banner-sub">Manage your personal information and profile picture</p>
          </div>
        </div>

        {/* ── Avatar card ── */}
        <div className="pt-av-section">
          <div className="pt-av-card">
            {/* Ring + Avatar */}
            <div className="pt-av-ring">
              <div className="pt-av-inner">
                <Avatar className="w-full h-full rounded-full">
                  {avatarSrc && (
                    <AvatarImage
                      src={avatarSrc}
                      alt={profileData.full_name}
                      className="object-cover w-full h-full"
                    />
                  )}
                  <AvatarFallback
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      background: 'linear-gradient(135deg,#E0E7FF,#C7D2FE)',
                      color: '#4F46E5',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {getInitials(profileData.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <button
                type="button"
                className="pt-av-cam"
                onClick={handleCameraClick}
                disabled={avatarUploading}
                aria-label="Upload profile photo"
              >
                {avatarUploading ? (
                  <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5 text-white" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Name / role / buttons */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="pt-av-name">
                {profileData.full_name || 'Your Name'}
              </div>
              <div className="pt-av-meta">
                <span className="pt-role-pill">{displayRole}</span>
                <span className="pt-active-dot">
                  <span className="pt-dot" />
                  Active
                </span>
              </div>
              <div className="pt-av-btns">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemovePhoto}
                  disabled={loading || avatarUploading || !profileData.avatar_url}
                  style={{
                    color: '#DC2626',
                    borderColor: '#FECACA',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    gap: 7,
                    paddingLeft: 18,
                    paddingRight: 18,
                  }}
                  className="hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="av-btn-text">Remove Photo</span>
                </Button>

                <Button
                  type="button"
                  onClick={onSave}
                  disabled={loading || avatarUploading}
                  style={{
                    background: 'linear-gradient(135deg,#2563EB,#1E4ED8)',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    gap: 7,
                    paddingLeft: 18,
                    paddingRight: 18,
                    boxShadow: '0 4px 16px rgba(37,99,235,.28)',
                    border: 'none',
                  }}
                  className="hover:opacity-90 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                      <span className="av-btn-text">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span className="av-btn-text">Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="pt-form">
          <div className="pt-sec-lbl" style={{ marginTop: 24 }}>Personal Information</div>

          <div className="pt-g2">
            <div className="pt-field">
              <Label className="pt-lbl">
                Full Name <span className="pt-lbl-req">*</span>
              </Label>
              <input
                className="pt-inp"
                value={profileData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                disabled={loading}
                placeholder="Enter your full name"
              />
            </div>
            <div className="pt-field">
              <Label className="pt-lbl">Role</Label>
              <input
                className="pt-inp disabled-inp"
                value={displayRole}
                disabled
                readOnly
              />
            </div>
          </div>

          <div className="pt-g2">
            <div className="pt-field">
              <Label className="pt-lbl">
                Email <span className="pt-lbl-req">*</span>
              </Label>
              <div className="pt-inp-wrap">
                <span className="pt-inp-ico">
                  <Mail size={15} />
                </span>
                <input
                  className="pt-inp with-icon disabled-inp"
                  style={{ fontFamily: 'monospace' }}
                  value={profileData.email}
                  disabled
                  readOnly
                  placeholder="Email address"
                />
              </div>
              <p className="pt-hint">Email cannot be changed</p>
            </div>
            <div className="pt-field">
              <Label className="pt-lbl">Phone</Label>
              <div className="pt-inp-wrap">
                <span className="pt-inp-ico">
                  <Phone size={15} />
                </span>
                <input
                  className="pt-inp with-icon"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={loading}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          <div className="pt-g1 pt-field">
            <Label className="pt-lbl">Address</Label>
            <div className="pt-inp-wrap">
              <span className="pt-inp-ico">
                <MapPin size={15} />
              </span>
              <input
                className="pt-inp with-icon"
                value={profileData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={loading}
                placeholder="Enter your address"
              />
            </div>
          </div>

          <div className="pt-sec-lbl" style={{ marginTop: 8 }}>Bio</div>
          <div className="pt-g1 pt-field">
            <Label className="pt-lbl">Bio</Label>
            <textarea
              className="pt-inp-ta"
              rows={4}
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={loading}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="pt-footer">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            style={{
              color: '#475569',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              paddingLeft: 20,
              paddingRight: 20,
              border: '1.5px solid #E2E8F0',
            }}
            className="hover:bg-slate-50 hover:text-slate-800 transition-all duration-150"
          >
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}