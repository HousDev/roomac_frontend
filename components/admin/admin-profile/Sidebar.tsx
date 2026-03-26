
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield, Bell } from 'lucide-react';

interface SidebarProps {
  activeTab: "profile" | "security" | "notifications";
  onTabChange: (tab: "profile" | "security" | "notifications") => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "security" as const, label: "Security", icon: Shield },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .sb-wrap {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 100%;
          border-radius: 20px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 4px 24px rgba(15,23,42,.08), 0 1px 4px rgba(15,23,42,.05);
          border: 1px solid #E2E8F0;
        }

        /* Desktop header */
        .sb-header {
          padding: 20px 24px 14px;
          border-bottom: 1px solid #F1F5F9;
        }
        .sb-header-title {
          font-size: 15px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.01em;
        }

        /* Desktop nav */
        .sb-nav {
          padding: 8px 0 10px;
          display: flex;
          flex-direction: column;
        }

        .sb-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          color: #64748B;
          border-left: 3px solid transparent;
          transition: background .18s, color .18s, border-color .18s;
          width: 100%;
        }
        .sb-btn:hover {
          background: #F8FAFC;
          color: #334155;
        }
        .sb-btn.active {
          background: #EFF6FF;
          color: #2563EB;
          border-left-color: #2563EB;
        }

        .sb-btn-icon {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background .18s;
        }
        .sb-btn.active .sb-btn-icon {
          background: #DBEAFE;
        }
        .sb-btn:not(.active) .sb-btn-icon {
          background: #F1F5F9;
        }

        /* ── Mobile view ── */
        @media (max-width: 1023px) {
          .sb-wrap {
            border-radius: 16px;
          }

          .sb-header {
            display: none;
          }

          .sb-nav {
            flex-direction: row;
            padding: 6px;
            gap: 6px;
          }

          .sb-btn {
            flex: 1;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            padding: 10px 6px;
            border-left: none;
            border-bottom: 2.5px solid transparent;
            border-radius: 12px;
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 0.01em;
            min-width: 0;
          }
          .sb-btn:hover {
            background: #F8FAFC;
          }
          .sb-btn.active {
            background: #EFF6FF;
            color: #2563EB;
            border-left-color: transparent;
            border-bottom-color: #2563EB;
          }

          .sb-btn-icon {
            width: 34px;
            height: 34px;
            border-radius: 10px;
          }
          .sb-btn.active .sb-btn-icon {
            background: #DBEAFE;
          }
          .sb-btn:not(.active) .sb-btn-icon {
            background: #F1F5F9;
          }
        }
      `}</style>

      <div className="sb-wrap">
        <div className="sb-header">
          <div className="sb-header-title">Settings</div>
        </div>

        <div className="sb-nav">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`sb-btn${activeTab === id ? ' active' : ''}`}
            >
              <div className="sb-btn-icon">
                <Icon size={15} />
              </div>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}