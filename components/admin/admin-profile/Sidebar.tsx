"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield, Bell } from 'lucide-react';

interface SidebarProps {
  activeTab: "profile" | "security" | "notifications";
  onTabChange: (tab: "profile" | "security" | "notifications") => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <Card className="w-full lg:w-64 overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Settings</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Horizontal scroll on mobile, vertical on desktop */}
        <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible scrollbar-hide">
          <button
            onClick={() => onTabChange("profile")}
            className={`
              flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 
              whitespace-nowrap lg:whitespace-normal flex-1 lg:flex-none
              transition-all duration-200
              ${activeTab === "profile" 
                ? 'bg-blue-50 text-blue-600 border-b-2 lg:border-b-0 lg:border-l-4 border-blue-600' 
                : 'hover:bg-slate-50 border-transparent'
              }
            `}
          >
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Profile</span>
          </button>
          
          <button
            onClick={() => onTabChange("security")}
            className={`
              flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 
              whitespace-nowrap lg:whitespace-normal flex-1 lg:flex-none
              transition-all duration-200
              ${activeTab === "security" 
                ? 'bg-blue-50 text-blue-600 border-b-2 lg:border-b-0 lg:border-l-4 border-blue-600' 
                : 'hover:bg-slate-50 border-transparent'
              }
            `}
          >
            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Security</span>
          </button>
          
          <button
            onClick={() => onTabChange("notifications")}
            className={`
              flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 
              whitespace-nowrap lg:whitespace-normal flex-1 lg:flex-none
              transition-all duration-200
              ${activeTab === "notifications" 
                ? 'bg-blue-50 text-blue-600 border-b-2 lg:border-b-0 lg:border-l-4 border-blue-600' 
                : 'hover:bg-slate-50 border-transparent'
              }
            `}
          >
            <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Notifications</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}