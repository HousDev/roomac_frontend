// components/admin/admin-profile/SecurityTab.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Key, Eye, EyeOff, Loader2, CheckCircle2, XCircle, Lock } from 'lucide-react';
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
  loading,
}: SecurityTabProps) {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordError, setPasswordError] = useState<string>('');
  const [touched, setTouched] = useState({
    new_password: false,
    confirm_password: false,
  });

  const handleInputChange = (field: keyof PasswordData, value: string) => {
    onPasswordDataChange({ ...passwordData, [field]: value });
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

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

  const isNewPasswordValidMessage =
    touched.new_password && passwordData.new_password.length < 8
      ? 'Password must be at least 8 characters'
      : '';

  const passwordsMatch =
    !passwordError &&
    touched.confirm_password &&
    passwordData.new_password &&
    passwordData.confirm_password &&
    passwordData.new_password === passwordData.confirm_password;

  // Strength calculation
  const getStrength = (pw: string) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = getStrength(passwordData.new_password);
  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', '#DC2626', '#EA580C', '#D97706', '#059669', '#0891B2'][strength];

  const handleClear = () => {
    onClear();
    setTouched({ new_password: false, confirm_password: false });
    setPasswordError('');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .st-wrap {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(15,23,42,.10), 0 2px 8px rgba(15,23,42,.06);
          width: 100%;
        }

        /* Banner */
        .st-banner {
          background: linear-gradient(120deg, #0A1F5C 0%, #1740C0 55%, #2563EB 100%);
          padding: 28px 32px 68px;
          position: relative; overflow: hidden;
        }
        .st-banner::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 22px 22px; pointer-events: none;
        }
        .st-banner::after {
          content: ''; position: absolute; bottom: -40px; left: 0; right: 0;
          height: 80px; background: #fff; border-radius: 40px 40px 0 0;
        }
        .st-banner-in { position: relative; z-index: 1; }
        .st-banner-title { font-size: 19px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px; }
        .st-banner-sub { font-size: 13px; color: rgba(255,255,255,.6); margin-top: 4px; }

        /* Icon badge */
        .st-banner-badge {
          position: absolute; right: 32px; top: 50%; transform: translateY(-60%); z-index: 1;
          width: 72px; height: 72px; border-radius: 20px;
          background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(0,0,0,.15);
        }

        /* Form body */
        .st-form { padding: 20px 28px 8px; }

        /* Section label */
        .st-sec-lbl {
          font-size: 10.5px; font-weight: 700; letter-spacing: .08em;
          text-transform: uppercase; color: #94A3B8;
          margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
        }
        .st-sec-lbl::after { content: ''; flex: 1; height: 1px; background: #E2E8F0; }

        /* Field */
        .st-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .st-lbl { font-size: 12px; font-weight: 700; color: #475569; }
        .st-lbl-req { color: #DC2626; margin-left: 2px; }

        /* Input wrapper */
        .st-inp-wrap { position: relative; }
        .st-inp-left {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          pointer-events: none; color: #94A3B8; display: flex; align-items: center;
        }
        .st-inp-right {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: transparent; border: none; cursor: pointer; color: #94A3B8;
          display: flex; align-items: center; transition: color .15s; padding: 0;
        }
        .st-inp-right:hover { color: #475569; }

        .st-inp {
          width: 100%; padding: 10px 40px 10px 40px;
          border-radius: 12px; border: 1.5px solid #E2E8F0;
          background: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px; color: #0F172A; outline: none;
          transition: border-color .18s, box-shadow .18s;
        }
        .st-inp:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
        .st-inp.err { border-color: #DC2626; }
        .st-inp.err:focus { box-shadow: 0 0 0 3px rgba(220,38,38,.12); }
        .st-inp:disabled { background: #F8FAFC; color: #94A3B8; cursor: not-allowed; }

        /* Hints */
        .st-hint { font-size: 11.5px; color: #94A3B8; display: flex; align-items: center; gap: 5px; margin-top: 4px; }
        .st-hint.err { color: #DC2626; }
        .st-hint.ok  { color: #059669; }

        /* Strength bar */
        .st-strength { margin-top: 8px; }
        .st-sbar { display: flex; gap: 4px; margin-bottom: 5px; }
        .st-sbarseg {
          flex: 1; height: 4px; border-radius: 99px;
          background: #E2E8F0; transition: background .3s;
        }
        .st-slbl { font-size: 11px; font-weight: 600; }

        /* 2FA card */
        .st-2fa {
          background: linear-gradient(135deg, #F0F4FF, #EEF2FF);
          border: 1px solid #C7D2FE;
          border-radius: 16px;
          padding: 20px 22px;
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 20px;
        }
        .st-2fa-icon {
          width: 46px; height: 46px; flex-shrink: 0;
          border-radius: 13px; background: #EDE9FE; border: 1px solid #C4B5FD;
          display: flex; align-items: center; justify-content: center;
        }
        .st-2fa-title { font-size: 14px; font-weight: 700; color: #0F172A; }
        .st-2fa-sub { font-size: 12px; color: #64748B; margin-top: 3px; }

        /* Footer */
        .st-footer {
          padding: 14px 28px 24px;
          border-top: 1px solid #F1F5F9;
          display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;
        }
      `}</style>

      <div className="st-wrap">
        {/* Banner */}
        <div className="st-banner">
          <div className="st-banner-in">
            <div className="st-banner-title">
              <Shield size={18} style={{ color: 'rgba(255,255,255,.9)' }} />
              Security Settings
            </div>
            <p className="st-banner-sub">Manage your password and security preferences</p>
          </div>
          
        </div>

        {/* Form */}
        <div className="st-form">
          <div className="st-sec-lbl" style={{ marginTop: -20 }}>Change Password</div>

          {/* Current Password */}
          <div className="st-field">
            <label className="st-lbl">Current Password <span className="st-lbl-req">*</span></label>
            <div className="st-inp-wrap">
              <span className="st-inp-left"><Key size={15} /></span>
              <input
                className="st-inp"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.current_password}
                onChange={(e) => handleInputChange('current_password', e.target.value)}
                disabled={loading}
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="st-inp-right"
                onClick={() => togglePasswordVisibility('current')}
                tabIndex={-1}
              >
                {showPasswords.current ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="st-field">
            <label className="st-lbl">New Password <span className="st-lbl-req">*</span></label>
            <div className="st-inp-wrap">
              <span className="st-inp-left"><Key size={15} /></span>
              <input
                className={`st-inp${touched.new_password && passwordData.new_password.length < 8 ? ' err' : ''}`}
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={(e) => handleInputChange('new_password', e.target.value)}
                onBlur={() => handleBlur('new_password')}
                disabled={loading}
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                className="st-inp-right"
                onClick={() => togglePasswordVisibility('new')}
                tabIndex={-1}
              >
                {showPasswords.new ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Strength bar */}
            {passwordData.new_password.length > 0 && (
              <div className="st-strength">
                <div className="st-sbar">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="st-sbarseg"
                      style={{ background: i <= strength ? strengthColor : '#E2E8F0' }}
                    />
                  ))}
                </div>
                <span className="st-slbl" style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}

            <p className={`st-hint${touched.new_password && passwordData.new_password.length < 8 ? ' err' : ''}`}>
              Must be at least 8 characters
              {passwordData.new_password.length > 0 && (
                <span>({passwordData.new_password.length}/8)</span>
              )}
            </p>
            {isNewPasswordValidMessage && (
              <p className="st-hint err">
                <XCircle size={13} /> {isNewPasswordValidMessage}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="st-field">
            <label className="st-lbl">Confirm New Password <span className="st-lbl-req">*</span></label>
            <div className="st-inp-wrap">
              <span className="st-inp-left"><Key size={15} /></span>
              <input
                className={`st-inp${passwordError ? ' err' : ''}`}
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirm_password}
                onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                onBlur={() => handleBlur('confirm_password')}
                disabled={loading}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="st-inp-right"
                onClick={() => togglePasswordVisibility('confirm')}
                tabIndex={-1}
              >
                {showPasswords.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {passwordError && (
              <p className="st-hint err">
                <XCircle size={13} /> {passwordError}
              </p>
            )}
            {passwordsMatch && (
              <p className="st-hint ok">
                <CheckCircle2 size={13} /> Passwords match
              </p>
            )}
          </div>

          {/* 2FA */}
          <div className="st-sec-lbl" style={{ marginTop: 8 }}>Two-Factor Authentication</div>
          <div className="st-2fa">
            <div className="st-2fa-icon">
              <Shield size={20} color="#7C3AED" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="st-2fa-title">Two-Factor Authentication</div>
              <div className="st-2fa-sub">Add an extra layer of security to your account.</div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => alert('2FA feature coming soon!')}
              disabled={loading}
              style={{
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                borderColor: '#C4B5FD',
                color: '#7C3AED',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              className="hover:bg-purple-50 transition-all"
            >
              Enable 2FA
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="st-footer">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={loading}
            style={{
              borderRadius: 12, fontSize: 13, fontWeight: 600,
              borderColor: '#E2E8F0', color: '#475569',
              paddingLeft: 20, paddingRight: 20,
            }}
            className="hover:bg-slate-50 transition-all"
          >
            Clear
          </Button>
          <Button
            type="button"
            onClick={onChangePassword}
            disabled={
              loading ||
              !!passwordError ||
              (touched.new_password && passwordData.new_password.length < 8)
            }
            style={{
              background: 'linear-gradient(135deg,#2563EB,#1E4ED8)',
              borderRadius: 12, fontSize: 13, fontWeight: 600,
              paddingLeft: 20, paddingRight: 20,
              boxShadow: '0 4px 16px rgba(37,99,235,.28)',
              border: 'none', gap: 7, display: 'flex', alignItems: 'center',
            }}
            className="hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Updating...</>
            ) : (
              <><Shield size={15} /> Update Password</>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}