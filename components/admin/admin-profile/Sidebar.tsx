// components/admin/admin-profile/Sidebar.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield, Bell } from 'lucide-react';

interface SidebarProps {
  activeTab: "profile" | "security" | "notifications";
  onTabChange: (tab: "profile" | "security" | "notifications") => void;
}

const TABS = [
  {
    key: "profile" as const,
    label: "Profile",
    icon: User,
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
    activeBg: "#EFF6FF",
    activeColor: "#1E4ED8",
    activeBorder: "#2563EB",
  },
  {
    key: "security" as const,
    label: "Security",
    icon: Shield,
    iconBg: "#EDE9FE",
    iconColor: "#7C3AED",
    activeBg: "#EDE9FE",
    activeColor: "#7C3AED",
    activeBorder: "#7C3AED",
  },
  {
    key: "notifications" as const,
    label: "Notifications",
    icon: Bell,
    iconBg: "#FFEDD5",
    iconColor: "#EA580C",
    activeBg: "#FFEDD5",
    activeColor: "#EA580C",
    activeBorder: "#EA580C",
  },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .sb-wrap {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(15,23,42,.08), 0 1px 4px rgba(15,23,42,.04);
          border: 1px solid #E2E8F0;
          width: 100%;
        }

        /* Header */
        .sb-header {
          padding: 20px 22px 16px;
          border-bottom: 1px solid #F1F5F9;
          position: relative;
        }
        .sb-header::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #0A1F5C, #1E4ED8, #60A5FA);
          border-radius: 20px 20px 0 0;
        }
        .sb-header-title {
          font-size: 16px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -.01em;
        }
        .sb-header-sub {
          font-size: 11.5px;
          color: #94A3B8;
          margin-top: 2px;
          font-weight: 500;
        }

        /* Nav list */
        .sb-nav {
          padding: 10px 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* Nav item */
        .sb-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 14px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all .18s ease;
          text-align: left;
          width: 100%;
          position: relative;
          border: 1.5px solid transparent;
        }
        .sb-item:hover:not(.sb-item-active) {
          background: #F8FAFC;
          border-color: #E2E8F0;
        }
        .sb-item-active {
          border-color: transparent;
        }

        /* Icon box */
        .sb-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all .18s;
        }
        .sb-icon svg {
          width: 16px;
          height: 16px;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* Label */
        .sb-label {
          font-size: 13.5px;
          font-weight: 600;
          transition: color .18s;
          flex: 1;
        }

        /* Active dot/arrow */
        .sb-arrow {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: all .18s;
        }

        /* ── Mobile: horizontal scroll ── */
        @media (max-width: 1023px) {
          .sb-wrap {
            border-radius: 16px;
          }
          .sb-header {
            padding: 14px 16px 12px;
          }
          .sb-nav {
            flex-direction: row;
            overflow-x: auto;
            padding: 10px 10px 10px;
            gap: 6px;
            scrollbar-width: none;
          }
          .sb-nav::-webkit-scrollbar { display: none; }
          .sb-item {
            flex-direction: column;
            align-items: center;
            gap: 6px;
            padding: 10px 16px;
            flex-shrink: 0;
            border-radius: 12px;
            white-space: nowrap;
          }
          .sb-label { font-size: 12px; }
          .sb-arrow { display: none; }
          .sb-icon { width: 32px; height: 32px; border-radius: 9px; }
        }
      `}</style>

      <div className="sb-wrap">
        {/* Header */}
        <div className="sb-header">
          <div className="sb-header-title">Settings</div>
          <div className="sb-header-sub">Manage your account</div>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`sb-item${isActive ? ' sb-item-active' : ''}`}
                style={
                  isActive
                    ? {
                      background: tab.activeBg,
                      boxShadow: `0 2px 12px ${tab.activeBorder}22`,
                      border: `1.5px solid ${tab.activeBorder}33`,
                    }
                    : {}
                }
              >
                {/* Icon */}
                <div
                  className="sb-icon"
                  style={{
                    background: isActive ? tab.iconBg : '#F8FAFC',
                    color: isActive ? tab.iconColor : '#94A3B8',
                  }}
                >
                  <Icon
                    style={{
                      width: 16,
                      height: 16,
                      stroke: isActive ? tab.iconColor : '#94A3B8',
                      fill: 'none',
                      strokeWidth: 2,
                    }}
                  />
                </div>

                {/* Label */}
                <span
                  className="sb-label"
                  style={{ color: isActive ? tab.activeColor : '#475569' }}
                >
                  {tab.label}
                </span>

                {/* Arrow dot */}
                <span
                  className="sb-arrow"
                  style={{
                    background: isActive ? tab.activeBorder : 'transparent',
                  }}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}