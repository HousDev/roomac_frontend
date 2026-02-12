"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import roomacLogo from '@/app/src/assets/images/roomaclogo.webp';
import { useAuth } from "@/context/authContext";

import {
  Home, Building2, DoorOpen, Users, CreditCard, Tag, PlusCircle,
  Settings, Menu, X, LogOut, UserCircle, Mail, UserCog,
  AlertCircle, Calendar, FileText, Layout, BarChart3,
  LayoutGrid, Receipt, Wrench, ChevronRight, Bell,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { getSettings, SettingsData } from '@/lib/settingsApi';

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

// Separate component for submenu items with tooltip
function SubmenuItemWithTooltip({ reqItem, reqActive, sidebarOpen }: { 
  reqItem: any; 
  reqActive: boolean;
  sidebarOpen: boolean;
}) {
  const ReqIcon = reqItem.icon;
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <li key={reqItem.href}>
      <Link
        href={reqItem.href}
        className={`
          relative group flex items-center gap-3 px-3 py-2 pl-10 rounded-xl transition-all duration-200
          ${reqActive
            ? 'bg-white/20 text-yellow-300'
            : 'text-blue-100 hover:bg-white/15 hover:text-white'
          }
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {reqActive && (
          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-yellow-400" />
        )}
        <div
          className={`
            h-7 w-7 rounded-lg flex items-center justify-center transition-all p-1.5 flex-shrink-0
            ${reqActive
              ? 'bg-yellow-400 text-black shadow-md'
              : 'bg-white/20 text-white group-hover:bg-yellow-400 group-hover:text-black'
            }
          `}
        >
          <ReqIcon className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-medium tracking-wide whitespace-nowrap overflow-hidden text-ellipsis flex-1">
          {reqItem.label}
        </span>
        
        {/* Tooltip for long text */}
        {showTooltip && sidebarOpen && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md shadow-lg whitespace-nowrap">
              {reqItem.label}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900"></div>
            </div>
          </div>
        )}
      </Link>
    </li>
  );
}

// Separate component for collapsed sidebar items with tooltip
function CollapsedSidebarItem({ 
  item, 
  active, 
  sidebarOpen, 
  setSidebarOpen,
  handleIconClick,
  isRequestItem = false,
  onClick
}: { 
  item: any; 
  active: boolean; 
  sidebarOpen: boolean;
  setSidebarOpen?: (open: boolean) => void;
  handleIconClick: (e: React.MouseEvent, href: string) => void;
  isRequestItem?: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const content = onClick ? (
    <div
      onClick={onClick}
      className={`
        relative group flex items-center justify-center p-3 rounded-xl transition-all duration-200 cursor-pointer
        ${active
          ? 'bg-white/20 text-yellow-300'
          : 'text-blue-100 hover:bg-white/15 hover:text-white'
        }
      `}
      title={item.label}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-yellow-400" />
      )}
      <div
        className={`
          h-9 w-9 rounded-lg flex items-center justify-center transition-all
          ${active
            ? 'bg-yellow-400 text-black shadow-md'
            : 'bg-white/20 text-white group-hover:bg-yellow-400 group-hover:text-black'
          }
        `}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  ) : (
    <Link
      href={item.href}
      onClick={(e) => handleIconClick(e, item.href)}
      className={`
        relative group flex items-center justify-center p-3 rounded-xl transition-all duration-200
        ${active
          ? 'bg-white/20 text-yellow-300'
          : 'text-blue-100 hover:bg-white/15 hover:text-white'
        }
      `}
      title={item.label}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-yellow-400" />
      )}
      <div
        className={`
          h-9 w-9 rounded-lg flex items-center justify-center transition-all
          ${active
            ? 'bg-yellow-400 text-black shadow-md'
            : 'bg-white/20 text-white group-hover:bg-yellow-400 group-hover:text-black'
          }
        `}
      >
        <Icon className="h-5 w-5" />
      </div>
    </Link>
  );

  return (
    <div className="relative">
      {content}
      {showTooltip && !sidebarOpen && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md shadow-lg whitespace-nowrap">
            {item.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminSidebar({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const fetchedSettings = await getSettings();
        setSettings(fetchedSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setSettings(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle click outside for mobile sidebar
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setMobileSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileSidebarOpen]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Auto-expand requests dropdown if on a request page
  useEffect(() => {
    if (!pathname) return;
    
    const isRequestPage = pathname.includes('/admin/complaints') ||
                         pathname.includes('/admin/maintenance') ||
                         pathname.includes('/admin/receipts') ||
                         pathname.includes('/admin/leave-requests') ||
                         pathname.includes('/admin/vacate-requests') ||
                         pathname.includes('/admin/change-bed-requests') ||
                         pathname.includes('/admin/account-deletion-requests');
    if (isRequestPage) {
      setRequestsOpen(true);
    }
  }, [pathname]);

  const mainMenuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/properties', label: 'Properties', icon: Building2 },
    { href: '/admin/rooms', label: 'Rooms', icon: DoorOpen },
    { href: '/admin/tenants', label: 'Tenants', icon: Users },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin/document-center', label: 'Document Center', icon: FileText },
    { href: '/admin/templates', label: 'Templates', icon: Layout },
    { href: '/admin/enquiries', label: 'Enquiries', icon: Mail },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
    { href: '/admin/staff', label: 'Staff', icon: UserCog },
    { href: '/admin/offers', label: 'Offers', icon: Tag },
    { href: '/admin/add-ons', label: 'Add-ons', icon: PlusCircle },
    { href: '/admin/masters', label: 'Masters', icon: LayoutGrid },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/profile', label: 'Profile', icon: UserCircle },
  ];

  const requestItems = [
    { href: '/admin/complaints', label: 'Complaints', icon: AlertCircle },
    { href: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
    { href: '/admin/receipts', label: 'Receipts', icon: Receipt },
    { href: '/admin/leave-requests', label: 'Leave Requests', icon: Calendar },
    { href: '/admin/vacate-requests', label: 'Vacate Requests', icon: AlertCircle },
    { href: '/admin/change-bed-requests', label: 'Change Bed Requests', icon: Users },
    { href: '/admin/account-deletion-requests', label: 'Account Deletion', icon: UserCircle },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    logout();                    // ✅ AuthContext logout
    router.replace('/admin/login'); // ✅ hard redirect
  };


  // Handle icon click in collapsed sidebar - expands the sidebar
  const handleIconClick = (e: React.MouseEvent, href: string) => {
    if (!sidebarOpen && setSidebarOpen) {
      e.preventDefault();
      setSidebarOpen(true);
      // Navigate after a short delay to allow sidebar animation
      setTimeout(() => {
        router.push(href);
      }, 300);
    }
  };

  // Helper function to get setting value from settings object
  const getSettingValue = (key: string, defaultValue: string = ''): string => {
    if (loading || !settings || !settings[key]) {
      return defaultValue;
    }
    return settings[key].value || defaultValue;
  };

  // Get the logo URL from settings
  const getLogoUrl = () => {
    if (loading || !settings) {
      return roomacLogo;
    }
    
    const logoUrl = getSettingValue('logo_admin_sidebar');
    
    if (!logoUrl) {
      return roomacLogo;
    }
    
    // Check if the URL is already a full URL
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }
    
    // Check if it's a relative path starting with /
    if (logoUrl.startsWith('/')) {
      // For deployment, we need to use environment variables or relative URLs
      // Since your API and frontend are on the same domain in production
      // We can use the logoUrl as-is if it starts with /
      return logoUrl;
    }
    
    // If it's just a filename without a leading slash
    return `/${logoUrl}`;
  };

  // Get site name from settings
  const getSiteName = () => {
    if (loading || !settings) {
      return "ROOMAC";
    }
    return getSettingValue('site_name', 'ROOMAC');
  };

  // Desktop sidebar toggle button - only render if setSidebarOpen is provided
  const DesktopToggleButton = () => {
    if (!setSidebarOpen) return null;
    
    return (
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:flex absolute -right-3 top-6 z-10 w-6 h-6 mr-3 bg-gradient-to-b from-[#0b2a5b] via-[#11408c] to-[#1c5fd4] border border-white/20 rounded-full items-center justify-center text-white hover:bg-blue-700 transition-all duration-200 shadow-lg"
      >
        {sidebarOpen ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3 rotate-180" />
        )}
      </button>
    );
  };

  // Render menu items
  const renderMenuItem = (item: any, index: number) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    const isRequestActive = requestItems.some(req => isActive(req.href));

    // Check if this is the Notifications item (index 9)
    const isNotificationsItem = index === 9;

    if (!sidebarOpen) {
      // Collapsed view - only icons (CLICKING EXPANDS SIDEBAR)
      if (isNotificationsItem) {
        // Render both Notifications icon and Requests dropdown icon
        return (
          <>
            {/* Notifications icon */}
            <li key={item.href} className="flex justify-center">
              <CollapsedSidebarItem
                item={item}
                active={active}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                handleIconClick={handleIconClick}
              />
            </li>
            
            {/* Requests dropdown icon */}
            <li key="requests-collapsed" className="flex justify-center">
              <CollapsedSidebarItem
                item={{ href: '#', label: 'Requests', icon: AlertCircle }}
                active={isRequestActive}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                handleIconClick={handleIconClick}
                isRequestItem={true}
                onClick={() => {
                  if (setSidebarOpen) {
                    setSidebarOpen(true);
                  }
                  setRequestsOpen(!requestsOpen);
                }}
              />
            </li>
          </>
        );
      }

      // Regular collapsed menu items
      return (
        <li key={item.href} className="flex justify-center">
          <CollapsedSidebarItem
            item={item}
            active={active}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            handleIconClick={handleIconClick}
          />
        </li>
      );
    }

    // Expanded view - icons + labels
    if (isNotificationsItem) {
      return (
        <li key="notifications-requests-group">
          {/* Notifications item */}
          <Link
            href={item.href}
            className={`
              relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${active
                ? 'bg-white/20 text-yellow-300'
                : 'text-blue-100 hover:bg-white/15 hover:text-white'
              }
            `}
          >
            {active && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-yellow-400" />
            )}
            <div
              className={`
                h-9 w-9 rounded-lg flex items-center justify-center transition-all
                ${active
                  ? 'bg-yellow-400 text-black shadow-md'
                  : 'bg-white/20 text-white group-hover:bg-yellow-400 group-hover:text-black'
                }
              `}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="font-medium tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
              {item.label}
            </span>
          </Link>

          {/* Requests Dropdown - Fixed alignment */}
          <div className="mt-1">
            <button
              onClick={() => setRequestsOpen(!requestsOpen)}
              className={`
                relative group flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200
                ${isRequestActive
                  ? 'bg-white/20 text-yellow-300'
                  : 'text-blue-100 hover:bg-white/15 hover:text-white'
                }
              `}
            >
              {isRequestActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-yellow-400" />
              )}
              <div className="flex items-center gap-3">
                <div
                  className={`
                    h-9 w-9 rounded-lg flex items-center justify-center transition-all
                    ${isRequestActive
                      ? 'bg-yellow-400 text-black shadow-md'
                      : 'bg-white/20 text-white group-hover:bg-yellow-400 group-hover:text-black'
                    }
                  `}
                >
                  <AlertCircle className="h-5 w-5" />
                </div>
                <span className="font-medium tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                  Requests
                </span>
              </div>
              {requestsOpen ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}
            </button>

            {requestsOpen && (
              <ul className="space-y-1 mt-1 ml-2">
                {requestItems.map((reqItem) => {
                  const reqActive = isActive(reqItem.href);
                  return (
                    <SubmenuItemWithTooltip 
                      key={reqItem.href}
                      reqItem={reqItem} 
                      reqActive={reqActive}
                      sidebarOpen={sidebarOpen}
                    />
                  );
                })}
              </ul>
            )}
          </div>
        </li>
      );
    }

    // Regular expanded menu items (before Notifications)
    if (index < 9) {
      return (
        <li key={item.href}>
          <Link
            href={item.href}
            className={`
              relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${active
                ? 'bg-white/20 text-yellow-300'
                : 'text-blue-100 hover:bg-white/15 hover:text-white'
              }
            `}
          >
            {active && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-yellow-400" />
            )}
            <div
              className={`
                h-9 w-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0
                ${active
                  ? 'bg-yellow-400 text-black shadow-md'
                  : 'bg-white/20 text-white group-hover:bg-yellow-400 group-hover:text-black'
                }
              `}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="font-medium tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
              {item.label}
            </span>
          </Link>
        </li>
      );
    }

    // Items after Notifications (but skip Notifications index)
    if (index > 9) {
      return (
        <li key={item.href}>
          <Link
            href={item.href}
            className={`
              relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${active
                ? 'bg-white/20 text-yellow-300'
                : 'text-blue-100 hover:bg-white/15 hover:text-white'
              }
            `}
          >
            {active && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-yellow-400" />
            )}
            <div
              className={`
                h-9 w-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0
                ${active
                  ? 'bg-yellow-400 text-black shadow-md'
                  : 'bg-white/20 text-white group-hover:bg-yellow-400 group-hover:text-black'
                }
              `}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="font-medium tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
              {item.label}
            </span>
          </Link>
        </li>
      );
    }
    
    return null;
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden text-white bg-blue-800 backdrop-blur"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      >
        {mobileSidebarOpen ? <X /> : <Menu />}
      </Button>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-screen z-40 flex flex-col
          bg-gradient-to-b from-[#003A8F] to-[#0056D2]
          transition-all duration-300 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* Desktop toggle button */}
        <DesktopToggleButton />

        {/* Logo - Fixed for collapsed state */}
        <div className={`
          border-b border-white/15 bg-gradient-to-b from-blue-50 to-white
          transition-all duration-300
          flex items-center justify-center
          ${sidebarOpen ? 'h-16 px-6' : 'h-14 px-4'}
        `}>
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center w-full h-full"
            aria-label="Go to Admin Dashboard"
          >
            <div className={`
              flex items-center justify-center
              transition-all duration-300
              ${sidebarOpen ? 'h-10' : 'h-6'}
            `}>
              <img
                src={getLogoUrl()}
                alt={getSiteName()}
                className={`
                  h-full w-auto object-contain
                  transition-all duration-300 
                  ${sidebarOpen
                    ? 'max-w-[150px]'
                    : 'max-w-[70px]'
                  }
                `}
                onError={(e) => {
                  // Fallback to default logo if the fetched logo fails to load
                  (e.target as HTMLImageElement).src = roomacLogo;
                }}
              />
            </div>
          </Link>
        </div>

        {/* Menu - Scrollbar hidden */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-50">
          <ul className="space-y-1">
            {mainMenuItems.map((item, index) => renderMenuItem(item, index))}
          </ul>
        </nav>

        {/* Footer - Logout Button */}
        <div className="p-4 border-t border-white/15">
          {sidebarOpen ? (
            <Button
              onClick={handleLogout}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>

          ) : (
            <div className="flex justify-center">
              <CollapsedSidebarItem
                item={{ href: '#', label: 'Logout', icon: LogOut }}
                active={false}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                handleIconClick={handleIconClick}
                onClick={handleLogout}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}