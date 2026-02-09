"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield, Bell } from 'lucide-react';

interface SidebarProps {
  activeTab: "profile" | "security" | "notifications";
  onTabChange: (tab: "profile" | "security" | "notifications") => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="lg:w-64">
      <Card className="sticky top-5">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col">
            <button
              onClick={() => onTabChange("profile")}
              className={`flex items-center gap-3 px-6 py-3 text-left ${activeTab === "profile" ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'hover:bg-slate-50'}`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => onTabChange("security")}
              className={`flex items-center gap-3 px-6 py-3 text-left ${activeTab === "security" ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'hover:bg-slate-50'}`}
            >
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </button>
            <button
              onClick={() => onTabChange("notifications")}
              className={`flex items-center gap-3 px-6 py-3 text-left ${activeTab === "notifications" ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'hover:bg-slate-50'}`}
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}