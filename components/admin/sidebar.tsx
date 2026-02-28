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
  ChevronDown,
  Sliders,
  Link2,
  Search,
  Package
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

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/admin') && currentPath !== '/admin') {
      localStorage.setItem('admin_last_path', currentPath);
    }
  }, []);

  return (
    <li key={reqItem.href}>
      <Link
        href={reqItem.href}
        className={`
          relative group flex items-center gap-2 w-[155px] px-2 py-1.5 pl-5 rounded-xl transition-all duration-200
          ${reqActive
            ? 'bg-[#F5C000]/20 text-[#F5C000]'
            : 'text-blue-100 hover:bg-white/10 hover:text-white'
          }
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {reqActive && (
          <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#F5C000]" />
        )}
        <div
          className={`
            h-4 w-4 rounded-md flex items-center justify-center transition-all p-0.5 flex-shrink-0
            ${reqActive
              ? 'bg-[#F5C000]/20 text-[#F5C000]'
              : 'bg-white/10 text-blue-200 group-hover:text-white'
            }
          `}
        >
          <ReqIcon className="h-2.5 w-2.5" />
        </div>
        <span className="text-xs font-normal tracking-wide whitespace-nowrap overflow-hidden text-ellipsis flex-1">
          {reqItem.label}
        </span>
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
        relative group flex items-center justify-center p-2 rounded-xl transition-all duration-200 cursor-pointer
        ${active
          ? 'bg-[#F5C000]/20 text-[#F5C000]'
          : 'text-blue-200 hover:bg-white/10 hover:text-white'
        }
      `}
      title={item.label}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-[#F5C000]" />
      )}
      <div
        className={`
          h-8 w-8 rounded-xl flex items-center justify-center transition-all
          ${active
            ? 'bg-[#F5C000]/20 text-[#F5C000]'
            : 'bg-white/10 text-blue-200 group-hover:bg-white/15 group-hover:text-white'
          }
        `}
      >
        <Icon className="h-4 w-4" />
      </div>
    </div>
  ) : (
    <Link
      href={item.href}
      onClick={(e) => handleIconClick(e, item.href)}
      className={`
        relative group flex items-center justify-center p-2 rounded-xl transition-all duration-200
        ${active
          ? 'bg-[#F5C000]/20 text-[#F5C000]'
          : 'text-blue-200 hover:bg-white/10 hover:text-white'
        }
      `}
      title={item.label}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-[#F5C000]" />
      )}
      <div
        className={`
          h-8 w-8 rounded-xl flex items-center justify-center transition-all
          ${active
            ? 'bg-[#F5C000]/20 text-[#F5C000]'
            : 'bg-white/10 text-blue-200 group-hover:bg-white/15 group-hover:text-white'
          }
        `}
      >
        <Icon className="h-4 w-4" />
      </div>
    </Link>
  );

  return (
    <div className="relative">
      {content}
      {showTooltip && !sidebarOpen && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
          <div className="bg-[#0A1F5C] border border-[#F5C000]/30 text-white text-xs px-3 py-2 rounded-md whitespace-nowrap">
            {item.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#0A1F5C]"></div>
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Auto-expand settings dropdown if on a settings page
  useEffect(() => {
    if (!pathname) return;
    
    const isSettingsPage = pathname.includes('/admin/settings') ||
                          pathname.includes('/admin/settings/integration') ||
                          pathname === '/admin/settings';
    if (isSettingsPage) {
      setSettingsOpen(true);
    }
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
    { href: '/admin/staff', label: 'Staffs', icon: UserCog },
    { href: '/admin/offers', label: 'Offers', icon: Tag },
    { href: '/admin/add-ons', label: 'Add-ons', icon: PlusCircle },
    { href: '/admin/inventory', label: 'Inventory Management', icon: Package },
    { href: '/admin/masters', label: 'Masters', icon: LayoutGrid },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/profile', label: 'Profile', icon: UserCircle },
  ];

  const requestItems = [
    { href: '/admin/complaints', label: 'Complaints', icon: AlertCircle },
    { href: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
    { href: '/admin/receipts', label: 'Receipts', icon: FileText },
    { href: '/admin/leave-requests', label: 'Leave Requests', icon: Calendar },
    { href: '/admin/vacate-requests', label: 'Vacate Requests', icon: AlertCircle },
    { href: '/admin/change-bed-requests', label: 'Change Bed Requests', icon: Users },
    { href: '/admin/account-deletion-requests', label: 'Account Deletion', icon: UserCircle },
  ];

  const settingsItems = [
    { href: '/admin/settings', label: 'General Settings', icon: Sliders },
    { href: '/admin/settings/integration', label: 'Integration', icon: Link2 },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    logout();
  };

  // Handle icon click in collapsed sidebar - expands the sidebar
  const handleIconClick = (e: React.MouseEvent, href: string) => {
    if (!sidebarOpen && setSidebarOpen) {
      e.preventDefault();
      setSidebarOpen(true);
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
    if (loading || !settings) return roomacLogo;
    const logoUrl = getSettingValue('logo_admin_sidebar');
    if (!logoUrl) return roomacLogo;
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) return logoUrl;
    if (logoUrl.startsWith('/')) return logoUrl;
    return `/${logoUrl}`;
  };

  // Get site name from settings
  const getSiteName = () => {
    if (loading || !settings) return "ROOMAC";
    return getSettingValue('site_name', 'ROOMAC');
  };

  // Filter all menu items based on search query
  const allSearchableItems = [
    ...mainMenuItems,
    ...requestItems,
    ...settingsItems,
  ];

  const filteredItems = searchQuery.trim()
    ? allSearchableItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Desktop sidebar toggle button
  const DesktopToggleButton = () => {
    if (!setSidebarOpen) return null;
    return (
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:flex absolute -right-3 top-7 z-10 w-6 h-6 bg-[#1B4FD8] border border-[#F5C000]/50 rounded-full items-center justify-center text-white hover:bg-[#F5C000] hover:text-[#0A1F5C] transition-all duration-200"
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
    const isSettingsActive = settingsItems.some(setting => isActive(setting.href));
    const isNotificationsItem = index === 9;
    const isSettingsItem = index === 15;

    if (!sidebarOpen) {
      if (isNotificationsItem) {
        return (
          <>
            <li key={item.href} className="flex justify-center">
              <CollapsedSidebarItem
                item={item}
                active={active}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                handleIconClick={handleIconClick}
              />
            </li>
            <li key="requests-collapsed" className="flex justify-center">
              <CollapsedSidebarItem
                item={{ href: '#', label: 'Requests', icon: AlertCircle }}
                active={isRequestActive}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                handleIconClick={handleIconClick}
                isRequestItem={true}
                onClick={() => {
                  if (setSidebarOpen) setSidebarOpen(true);
                  setRequestsOpen(!requestsOpen);
                }}
              />
            </li>
          </>
        );
      }

      if (isSettingsItem) {
        return (
          <li key="settings-collapsed" className="flex justify-center">
            <CollapsedSidebarItem
              item={{ href: '#', label: 'Settings', icon: Settings }}
              active={isSettingsActive}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              handleIconClick={handleIconClick}
              isSettingsItem={true}
              onClick={() => {
                if (setSidebarOpen) setSidebarOpen(true);
                setSettingsOpen(!settingsOpen);
              }}
            />
          </li>
        );
      }

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

    // Expanded view
    if (isNotificationsItem) {
      return (
        <li key="notifications-requests-group">
          <Link
            href={item.href}
            className={`
              relative group flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200
              ${active
                ? 'bg-[#F5C000]/15 text-[#F5C000]'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            {active && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-[#F5C000]" />
            )}
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0
              ${active ? 'bg-[#F5C000]/20 text-[#F5C000]' : 'bg-white/10 text-blue-200 group-hover:bg-white/15 group-hover:text-white'}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="font-normal tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-xs">
              {item.label}
            </span>
          </Link>

          <div className="mt-0.5">
            <button
              onClick={() => setRequestsOpen(!requestsOpen)}
              className={`
                relative group flex items-center justify-between w-full px-2.5 py-2 rounded-xl transition-all duration-200
                ${isRequestActive
                  ? 'bg-[#F5C000]/15 text-[#F5C000]'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {isRequestActive && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#F5C000]" />
              )}
              <div className="flex items-center gap-2.5">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0
                  ${isRequestActive ? 'bg-[#F5C000]/20 text-[#F5C000]' : 'bg-white/10 text-blue-200 group-hover:bg-white/15 group-hover:text-white'}`}>
                  <AlertCircle className="h-4 w-4" />
                </div>
                <span className="font-normal tracking-wide whitespace-nowrap text-xs">Requests</span>
              </div>
              {requestsOpen ? (
                <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-blue-300" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-blue-300" />
              )}
            </button>

            {requestsOpen && (
              <ul className="space-y-0.5 mt-0.5 ml-2">
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

    if (isSettingsItem) {
      return (
        <li key="settings-group">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`
              relative group flex items-center justify-between w-full px-2.5 py-2 rounded-xl transition-all duration-200
              ${isSettingsActive
                ? 'bg-[#F5C000]/15 text-[#F5C000]'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            {isSettingsActive && (
              <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#F5C000]" />
            )}
            <div className="flex items-center gap-2.5">
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0
                ${isSettingsActive ? 'bg-[#F5C000]/20 text-[#F5C000]' : 'bg-white/10 text-blue-200 group-hover:bg-white/15 group-hover:text-white'}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-normal tracking-wide whitespace-nowrap text-xs">{item.label}</span>
            </div>
            {settingsOpen ? (
              <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-blue-300" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-blue-300" />
            )}
          </button>

          {settingsOpen && (
            <ul className="space-y-0.5 mt-0.5 ml-2">
              {settingsItems.map((settingItem) => {
                const settingActive = isActive(settingItem.href);
                return (
                  <SubmenuItemWithTooltip 
                    key={settingItem.href}
                    reqItem={settingItem} 
                    reqActive={settingActive}
                    sidebarOpen={sidebarOpen}
                  />
                );
              })}
            </ul>
          )}
        </li>
      );
    }

    if (index < 9 || index > 9) {
      return (
        <li key={item.href}>
          <Link
            href={item.href}
            className={`
              relative group flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200
              ${active
                ? 'bg-[#F5C000]/15 text-[#F5C000]'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            {active && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-[#F5C000]" />
            )}
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0
              ${active ? 'bg-[#F5C000]/20 text-[#F5C000]' : 'bg-white/10 text-blue-200 group-hover:bg-white/15 group-hover:text-white'}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="font-normal tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-xs">
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
      {!mobileSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden text-white bg-[#1B4FD8] hover:bg-[#F5C000] hover:text-[#0A1F5C] backdrop-blur transition-all duration-200"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu />
        </Button>
      )}

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-screen z-40 flex flex-col
          transition-all duration-300 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${sidebarOpen ? 'w-48' : 'w-[60px]'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0A1F5C 0%, #0d2870 50%, #0A1F5C 100%)',
          borderRight: '1px solid rgba(27, 79, 216, 0.35)',
          boxShadow: '4px 0 28px rgba(10, 31, 92, 0.5)',
        }}
      >
        {/* Desktop toggle button */}
        <DesktopToggleButton />

        {/* ── Logo Area ── */}
        <div
          className={`
            flex items-center justify-center flex-shrink-0
            transition-all duration-300
            bg-blue-50
            ${sidebarOpen ? 'h-[68px] px-3' : 'h-[60px] px-2'}
          `}
          style={{
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center w-full h-full"
            aria-label="Go to Admin Dashboard"
          >
            <img
              src={getLogoUrl()}
              alt={getSiteName()}
              className={`
                w-auto object-contain transition-all duration-300
                ${sidebarOpen ? 'h-12 max-w-[160px]' : 'h-9 max-w-[44px]'}
              `}
              onError={(e) => {
                (e.target as HTMLImageElement).src = roomacLogo;
              }}
            />
          </Link>
        </div>

        {/* ── Search Bar (expanded) ── */}
        {sidebarOpen && (
          <div className="px-2.5 pt-2.5 pb-1 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-blue-300/70 pointer-events-none" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-7 py-1.5 text-xs rounded-xl outline-none transition-all duration-200 text-white placeholder-blue-300/50"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(27,79,216,0.45)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(245,192,0,0.5)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(27,79,216,0.45)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-300 hover:text-[#F5C000] transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchQuery && filteredItems.length > 0 && (
              <div
                className="mt-1.5 rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(10,31,92,0.97)',
                  border: '1px solid rgba(27,79,216,0.4)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}
              >
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSearchQuery('')}
                      className={`flex items-center gap-2.5 px-2.5 py-2 transition-all duration-150
                        ${active ? 'bg-[#F5C000]/15 text-[#F5C000]' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}
                    >
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0
                        ${active ? 'bg-[#F5C000]/20 text-[#F5C000]' : 'bg-white/10 text-blue-300'}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-normal">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {searchQuery && filteredItems.length === 0 && (
              <div
                className="mt-1.5 rounded-xl px-3 py-3 text-center"
                style={{ background: 'rgba(10,31,92,0.97)', border: '1px solid rgba(27,79,216,0.4)' }}
              >
                <p className="text-xs text-blue-300">No results found</p>
              </div>
            )}
          </div>
        )}

        {/* ── Search icon for collapsed state ── */}
        {!sidebarOpen && (
          <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen && setSidebarOpen(true)}
              className="h-8 w-8 rounded-xl flex items-center justify-center bg-white/10 text-blue-200 hover:bg-[#F5C000]/20 hover:text-[#F5C000] transition-all duration-200"
              title="Search menu"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Gold divider */}
        <div className="mx-2.5 my-1 h-px flex-shrink-0"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(245,192,0,0.25), transparent)' }} />

        {/* ── Navigation Menu ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-1
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-50">
          <ul className="space-y-0.5">
            {mainMenuItems.map((item, index) => renderMenuItem(item, index))}
          </ul>
        </nav>

        {/* Gold divider above footer */}
        <div className="mx-2.5 h-px flex-shrink-0"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(245,192,0,0.25), transparent)' }} />

        {/* ── Footer – Logout ── */}
        <div className="p-2.5 flex-shrink-0">
          {sidebarOpen ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold text-xs transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #F5C000 0%, #e6b400 100%)',
                color: '#0A1F5C',
                boxShadow: '0 4px 14px rgba(245,192,0,0.25)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(245,192,0,0.45)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(245,192,0,0.25)';
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-200"
                title="Logout"
                style={{ background: 'rgba(245,192,0,0.15)', color: '#F5C000' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#F5C000';
                  (e.currentTarget as HTMLButtonElement).style.color = '#0A1F5C';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,192,0,0.15)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#F5C000';
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}