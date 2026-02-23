// components/tenant/tenant-header.tsx
"use client";

import { Bell, LogOut, User, ChevronDown, Menu, Search, Sun, Moon, Settings, HelpCircle, MessageSquare, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TenantHeaderProps {
  tenantName: string;
  tenantEmail?: string;
  notificationCount: number;
  onLogout: () => void;
  onNotificationsClick: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function TenantHeader({
  tenantName,
  tenantEmail = "tenant@example.com",
  notificationCount,
  onLogout,
  onNotificationsClick,
  sidebarCollapsed,
  onToggleSidebar,
}: TenantHeaderProps) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Sample notifications
  const notifications = [
    {
      id: 1,
      title: "Rent Payment Reminder",
      message: "Your rent payment is due in 7 days",
      time: "2 hours ago",
      read: false,
      type: "payment"
    },
    {
      id: 2,
      title: "Complaint Update",
      message: "Your maintenance request is now in progress",
      time: "1 day ago",
      read: false,
      type: "maintenance"
    },
    {
      id: 3,
      title: "Community Event",
      message: "Monthly dinner party this Friday at 7 PM",
      time: "3 days ago",
      read: true,
      type: "event"
    },
    {
      id: 4,
      title: "Document Ready",
      message: "Your rental agreement has been updated",
      time: "5 days ago",
      read: true,
      type: "document"
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
    }
  };

  const markNotificationAsRead = (id: number) => {
    // Implement notification read logic
  };

  const markAllAsRead = () => {
    // Implement mark all as read logic
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo & Navigation */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-slate-100"
              onClick={onToggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo/Brand */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">PG</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">PGStay Pro</h2>
                <p className="text-xs text-slate-500">Premium Tenant Dashboard</p>
              </div>
            </div>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search payments, documents, help..."
                  className="pl-10 w-64 lg:w-80 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Right Section - User Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-slate-100"
              onClick={() => console.log("Open mobile search")}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="hidden sm:inline-flex hover:bg-slate-100"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Help/Support */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex hover:bg-slate-100"
              onClick={() => router.push('/tenant/support')}
              title="Get Help"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* Notifications Dropdown */}
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs min-w-0 animate-pulse"
                      variant="destructive"
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 sm:w-96 shadow-xl border-slate-200">
                <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
                  <span className="font-semibold text-slate-900">Notifications</span>
                  {notificationCount > 0 && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-auto px-2 py-1 text-blue-600 hover:text-blue-700"
                      onClick={markAllAsRead}
                    >
                      Mark all read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`flex flex-col items-start p-4 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 ${!notification.read ? 'bg-blue-50/50' : ''}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex w-full items-start gap-3">
                          <div className={`
                            h-8 w-8 rounded-full flex items-center justify-center mt-1
                            ${notification.type === 'payment' ? 'bg-blue-100 text-blue-600' :
                              notification.type === 'maintenance' ? 'bg-orange-100 text-orange-600' :
                              notification.type === 'event' ? 'bg-green-100 text-green-600' :
                              'bg-purple-100 text-purple-600'}
                          `}>
                            {notification.type === 'payment' && <Bell className="h-4 w-4" />}
                            {notification.type === 'maintenance' && <Settings className="h-4 w-4" />}
                            {notification.type === 'event' && <MessageSquare className="h-4 w-4" />}
                            {notification.type === 'document' && <Shield className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="font-medium text-slate-900 text-sm">{notification.title}</p>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-blue-500 ml-2 flex-shrink-0"></div>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-slate-400 mt-2">{notification.time}</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <Bell className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-600">No notifications</p>
                      <p className="text-sm text-slate-400 mt-1">You're all caught up!</p>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center text-blue-600 hover:text-blue-700"
                    onClick={onNotificationsClick}
                  >
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hover:bg-slate-100 px-2 sm:px-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                    <span className="text-white font-medium text-sm">
                      {tenantName?.charAt(0)?.toUpperCase() || "T"}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">
                      {tenantName || "Tenant"}
                    </p>
                    <p className="text-xs text-slate-500 truncate max-w-[120px]">
                      {tenantEmail}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 hidden sm:block text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-xl border-slate-200">
                <DropdownMenuLabel className="px-4 py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{tenantName}</p>
                    <p className="text-xs text-slate-500 truncate">{tenantEmail}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="h-5 px-2 text-xs" variant="outline">Premium</Badge>
                      <Badge className="h-5 px-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Active
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="px-4 py-2.5 cursor-pointer hover:bg-slate-50"
                  onClick={() => router.push('/tenant/profile')}
                >
                  <User className="h-4 w-4 mr-2 text-slate-500" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="px-4 py-2.5 cursor-pointer hover:bg-slate-50"
                  onClick={() => router.push('/tenant/settings')}
                >
                  <Settings className="h-4 w-4 mr-2 text-slate-500" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="px-4 py-2.5 cursor-pointer hover:bg-slate-50"
                  onClick={() => router.push('/tenant/privacy')}
                >
                  <Shield className="h-4 w-4 mr-2 text-slate-500" />
                  <span>Privacy & Security</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar (Visible only when active) */}
        <div className="md:hidden mt-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>
    </header>
  );
}