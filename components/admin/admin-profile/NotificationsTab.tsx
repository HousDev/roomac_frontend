// components/admin/admin-profile/NotificationsTab.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Bell, Mail, MessageSquare, Smartphone, CreditCard, CalendarCheck, Wrench, Loader2 } from 'lucide-react';

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  payment_alerts: boolean;
  booking_alerts: boolean;
  maintenance_alerts: boolean;
}

interface NotificationsTabProps {
  notificationSettings: NotificationSettings;
  onNotificationSettingsChange: (settings: NotificationSettings) => void;
  onSave: () => void;
  onReset: () => void;
  loading: boolean;
}

// ── Internal Toggle ──────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: 46,
        height: 26,
        borderRadius: 99,
        border: 'none',
        flexShrink: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked
          ? 'linear-gradient(135deg,#2563EB,#1E4ED8)'
          : '#E2E8F0',
        boxShadow: checked ? '0 2px 10px rgba(37,99,235,.35)' : 'none',
        transition: 'background .22s, box-shadow .22s',
        opacity: disabled ? 0.5 : 1,
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: checked ? 'calc(100% - 22px)' : 2,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(15,23,42,.18)',
          transition: 'left .22s cubic-bezier(.34,1.56,.64,1)',
        }}
      />
    </button>
  );
}

// ── Channel row ──────────────────────────────────────────────
function ChannelRow({
  icon,
  iconBg,
  iconColor,
  title,
  sub,
  checked,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 18px',
        borderRadius: 14,
        border: `1.5px solid ${checked ? '#BFDBFE' : '#E2E8F0'}`,
        background: checked ? '#F0F7FF' : '#fff',
        transition: 'border-color .2s, background .2s',
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 40, height: 40, borderRadius: 11, flexShrink: 0,
          background: iconBg, color: iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{sub}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ── Alert row ────────────────────────────────────────────────
function AlertRow({
  icon,
  iconBg,
  iconColor,
  title,
  checked,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: 12,
        background: checked ? '#F8FAFF' : 'transparent',
        transition: 'background .2s',
        marginBottom: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: iconBg, color: iconColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A' }}>{title}</span>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export default function NotificationsTab({
  notificationSettings,
  onNotificationSettingsChange,
  onSave,
  onReset,
  loading,
}: NotificationsTabProps) {
  const handleToggle = (field: keyof NotificationSettings, checked: boolean) => {
    onNotificationSettingsChange({ ...notificationSettings, [field]: checked });
  };

  const activeCount = Object.values(notificationSettings).filter(Boolean).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .nt-wrap {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(15,23,42,.10), 0 2px 8px rgba(15,23,42,.06);
          width: 100%;
        }
        .nt-banner {
          background: linear-gradient(120deg, #0A1F5C 0%, #1740C0 55%, #2563EB 100%);
          padding: 28px 32px 68px;
          position: relative; overflow: hidden;
        }
        .nt-banner::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 22px 22px; pointer-events: none;
        }
        .nt-banner::after {
          content: ''; position: absolute; bottom: -40px; left: 0; right: 0;
          height: 80px; background: #fff; border-radius: 40px 40px 0 0;
        }
        .nt-banner-in { position: relative; z-index: 1; }
        .nt-banner-title { font-size: 19px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px; }
        .nt-banner-sub { font-size: 13px; color: rgba(255,255,255,.6); margin-top: 4px; }
        .nt-banner-badge {
          position: absolute; right: 32px; top: 50%; transform: translateY(-60%); z-index: 1;
          width: 72px; height: 72px; border-radius: 20px;
          background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(0,0,0,.15);
        }
        .nt-active-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 99px;
          background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25);
          font-size: 11.5px; font-weight: 600; color: rgba(255,255,255,.85);
          margin-top: 10px;
        }
        .nt-body { padding: 20px 28px 8px; }
        .nt-sec-lbl {
          font-size: 10.5px; font-weight: 700; letter-spacing: .08em;
          text-transform: uppercase; color: #94A3B8;
          margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
        }
        .nt-sec-lbl::after { content: ''; flex: 1; height: 1px; background: #E2E8F0; }
        .nt-footer {
          padding: 14px 28px 24px;
          border-top: 1px solid #F1F5F9;
          display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
            .nt-banner {
    padding: 20px 18px 48px !important;
  }

    .nt-banner::after {
    bottom: -30px;
    height: 60px;
  }

  .nt-body .nt-sec-lbl:first-of-type {
    margin-top: 0 !important;
    margin-bottom: 12px !important;
  }
          .nt-banner-title { font-size: 16px; }
          .nt-banner-sub { font-size: 12px; }
          .nt-banner-badge { display: none; }
          .nt-active-pill { font-size: 11px; padding: 3px 10px; }

          .nt-body { padding: 16px 14px 8px; }
          .nt-sec-lbl { font-size: 10px; }

          /* Channel rows — compact on mobile */
          .nt-body .ch-row {
            padding: 11px 12px !important;
            border-radius: 12px !important;
            gap: 10px !important;
            margin-bottom: 8px !important;
          }
          .nt-body .ch-icon {
            width: 34px !important;
            height: 34px !important;
            border-radius: 9px !important;
          }
          .nt-body .ch-title { font-size: 13px !important; }
          .nt-body .ch-sub { font-size: 11px !important; }

          /* Alert rows — compact on mobile */
          .nt-body .al-row {
            padding: 10px 12px !important;
            border-radius: 10px !important;
            margin-bottom: 2px !important;
          }
          .nt-body .al-icon {
            width: 28px !important;
            height: 28px !important;
            border-radius: 8px !important;
          }
          .nt-body .al-title { font-size: 13px !important; }

          .nt-footer {
            padding: 10px 14px 18px;
            gap: 8px;
          }
          .nt-footer button {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>

      <div className="nt-wrap">
        {/* Banner */}
        <div className="nt-banner">
          <div className="nt-banner-in">
            <div className="nt-banner-title">
              Notification Preferences
            </div>
            <p className="nt-banner-sub">Choose how you want to receive notifications</p>
            <div className="nt-active-pill">
              <span
                style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: activeCount > 0 ? '#10B981' : '#94A3B8',
                  display: 'inline-block',
                }}
              />
              {activeCount} of {Object.keys(notificationSettings).length} enabled
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="nt-body">
          <div className="nt-sec-lbl" style={{ marginTop: -20 }}>Notification Channels</div>

          {/* Channel rows — add className hooks for mobile override */}
          {[
            {
              icon: <Mail size={17} />, iconBg: '#EFF6FF', iconColor: '#2563EB',
              title: 'Email Notifications', sub: 'Receive notifications via email',
              field: 'email_notifications' as keyof NotificationSettings,
            },
            {
              icon: <Smartphone size={17} />, iconBg: '#F0FDF4', iconColor: '#059669',
              title: 'SMS Notifications', sub: 'Receive notifications via SMS',
              field: 'sms_notifications' as keyof NotificationSettings,
            },
            {
              icon: <MessageSquare size={17} />, iconBg: '#F0FFF4', iconColor: '#16A34A',
              title: 'WhatsApp Notifications', sub: 'Receive notifications via WhatsApp',
              field: 'whatsapp_notifications' as keyof NotificationSettings,
            },
          ].map(({ icon, iconBg, iconColor, title, sub, field }) => (
            <div
              key={field}
              className="ch-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 18px',
                borderRadius: 14,
                border: `1.5px solid ${notificationSettings[field] ? '#BFDBFE' : '#E2E8F0'}`,
                background: notificationSettings[field] ? '#F0F7FF' : '#fff',
                transition: 'border-color .2s, background .2s',
                marginBottom: 10,
              }}
            >
              <div
                className="ch-icon"
                style={{
                  width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                  background: iconBg, color: iconColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ch-title" style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>{title}</div>
                <div className="ch-sub" style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{sub}</div>
              </div>
              <Toggle
                checked={notificationSettings[field]}
                onChange={(v) => handleToggle(field, v)}
                disabled={loading}
              />
            </div>
          ))}

          <div className="nt-sec-lbl" style={{ marginTop: 20 }}>Alert Types</div>

          {[
            {
              icon: <CreditCard size={15} />, iconBg: '#FEF3C7', iconColor: '#D97706',
              title: 'Payment Alerts', field: 'payment_alerts' as keyof NotificationSettings,
            },
            {
              icon: <CalendarCheck size={15} />, iconBg: '#EDE9FE', iconColor: '#7C3AED',
              title: 'Booking Alerts', field: 'booking_alerts' as keyof NotificationSettings,
            },
            {
              icon: <Wrench size={15} />, iconBg: '#FFEDD5', iconColor: '#EA580C',
              title: 'Maintenance Alerts', field: 'maintenance_alerts' as keyof NotificationSettings,
            },
          ].map(({ icon, iconBg, iconColor, title, field }) => (
            <div
              key={field}
              className="al-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 12,
                background: notificationSettings[field] ? '#F8FAFF' : 'transparent',
                transition: 'background .2s',
                marginBottom: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  className="al-icon"
                  style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: iconBg, color: iconColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {icon}
                </div>
                <span className="al-title" style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A' }}>{title}</span>
              </div>
              <Toggle
                checked={notificationSettings[field]}
                onChange={(v) => handleToggle(field, v)}
                disabled={loading}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="nt-footer">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={loading}
            style={{
              borderRadius: 12, fontSize: 13, fontWeight: 600,
              borderColor: '#E2E8F0', color: '#475569',
              paddingLeft: 20, paddingRight: 20,
            }}
            className="hover:bg-slate-50 transition-all"
          >
            Reset Defaults
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={loading}
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
              <><Loader2 size={15} className="animate-spin" /> Saving...</>
            ) : (
              <><Bell size={15} /> Save Preferences</>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}