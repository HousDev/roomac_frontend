'use client';

import { JSX, JSXElementConstructor, Key, memo, ReactElement, ReactNode } from "react";
import Image from "@/src/compat/next-image";
import roomacLogo from '@/app/src/assets/images/roomaclogo.webp';
import { Button } from "@/components/ui/button";
import {
  Home,
  CreditCard,
  FileCheck,
  AlertCircle,
  FolderOpen,
  MessageSquare,
  Bell,
  User,
  HelpCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  booking: any;
  stats: any;
  navigationItems: any[];
  router: any;
  handleLogout: () => void;
  activeTab: string;
  pathname: string;
}

function Sidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  booking,
  stats,
  navigationItems,
  router,
  handleLogout,
  activeTab,
  pathname,
}: any) {
  const handleNavigation = (item: any) => {
    if (item.href) {
      router.push(item.href);
    } else if (item.tab) {
      // This would need to be handled by parent
      router.push(`/tenant/portal?tab=${item.tab}`);
    }
  };

  const isItemActive = (item: any) => {
    if (item.href) {
      return pathname === item.href;
    } else if (item.tab) {
      return activeTab === item.tab;
    }
    return false;
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40
        bg-blue-50 border-r border-slate-200
        shadow-xl transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        flex flex-col
      `}
    >
      {/* Header with Logo */}
      <div className="h-16 border-b border-slate-200 flex items-center justify-center">
        {!sidebarCollapsed ? (
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center gap-3">
              <div className="h-25 w-25 mt-2 flex items-center justify-center">
                <Image 
                  src={roomacLogo}
                  alt="ROOMAC"
                  className="h-14 w-auto object-contain"
                  priority
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(true)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(false)}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-1">
          {navigationItems.map((item: { id: Key | null | undefined; icon: any; label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined; badge: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined; }) => (
            <div key={item.id} className="relative group">
              <Button
                variant="ghost"
                onClick={() => handleNavigation(item)}
                className={`
                  w-full flex items-center rounded-xl transition-all
                  ${sidebarCollapsed ? 'h-11 justify-center' : 'h-11 justify-start px-3'}
                  ${isItemActive(item)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-slate-700'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />

                {!sidebarCollapsed && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}

                {!sidebarCollapsed && item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Button>

              {sidebarCollapsed && (
                <span
                  className="
                    absolute left-16 top-1/2 -translate-y-1/2
                    bg-slate-900 text-white text-xs
                    px-2 py-1 rounded
                    opacity-0 group-hover:opacity-100
                    transition whitespace-nowrap z-50
                  "
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* PG Details */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 border-t border-slate-200">
          <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-sm">
            {/* Compact Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm">
                <Home className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-700">My PG Details</h3>
                <p className="text-[10px] text-slate-500">Residency</p>
              </div>
            </div>

            {/* Compact Details */}
            <div className="space-y-2.5">
              {/* PG Name */}
              <div className="bg-blue-100 rounded-lg p-2.5 border border-slate-100">
                <div className="text-[11px] text-slate-500 mb-0.5">PG Name</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <span className="text-xs font-semibold text-slate-800">
                    {booking?.properties?.name || 'Roomac PG'}
                  </span>
                </div>
              </div>

              {/* Room & Rent */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-blue-100 rounded-lg p-2.5 border border-slate-100">
                  <div className="text-[11px] text-slate-500 mb-0.5">Room</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    <span className="text-xs font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      #{booking?.rooms?.room_number || '302'}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-2.5 border border-slate-100">
                  <div className="text-[11px] text-slate-500 mb-0.5">Monthly Rent</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    <span className="text-xs font-bold text-emerald-700">
                      ₹{stats.rentAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Days Left Banner */}
              <div className="mt-3 pt-3 border-t border-amber-200">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-center">
                  <div className="text-[11px] font-medium text-white mb-0.5">Next payment in</div>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xl font-bold text-white">{stats.daysUntilRentDue}</span>
                    <div className="text-left">
                      <div className="text-[11px] font-semibold text-white">Days</div>
                      <div className="text-[9px] text-amber-100">Left</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-slate-200 py-3 px-2">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => router.push('/tenant/settings')}
            className={`w-full rounded-xl transition-all ${
              sidebarCollapsed ? 'h-11 justify-center' : 'h-11 justify-start px-3'
            } text-slate-600 hover:bg-slate-100`}
          >
            <Settings className="h-5 w-5" />
            {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">Settings</span>}
          </Button>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full rounded-xl transition-all ${
              sidebarCollapsed ? 'h-11 justify-center' : 'h-11 justify-start px-3'
            } text-red-600 hover:bg-red-50`}
          >
            <LogOut className="h-5 w-5" />
            {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}

export default memo(Sidebar);