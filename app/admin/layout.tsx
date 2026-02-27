


"use client";

import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { usePathname } from '@/src/compat/next-navigation';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function AdminLayout() {
  const pathname = usePathname();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const isLoginPage = pathname === '/login' || pathname === '/admin';

  // Save current path when it changes
  useEffect(() => {
    if (pathname && !isLoginPage && pathname !== '/admin') {
      localStorage.setItem('admin_last_path', pathname);
    }
  }, [pathname, isLoginPage]);

  // Restore last path on mount (refresh ke time)
  useEffect(() => {
    const lastPath = localStorage.getItem('admin_last_path');
    const currentPath = pathname;
    
    // Agar current path root admin hai aur last path exist karta hai
    if (currentPath === '/admin' && lastPath && lastPath !== '/admin') {
      navigate(lastPath, { replace: true });
    }
    
    setIsLoading(false);
  }, [pathname, navigate]);

  // Get the current page title based on pathname
  const getPageTitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length < 2) return 'Dashboard';
    
    const page = pathSegments[1];
    return page
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Define subtitle for ALL pages
  const getPageSubtitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    // If at root or dashboard
    if (pathSegments.length < 2) {
      return 'Manage your ROOMAC platform';
    }
    
    const page = pathSegments[1];
    
    // Subtitles for ALL pages
    const pageSubtitles: Record<string, string> = {
      'dashboard': 'Manage rooms, beds, tenants, and operations in one place.',
      'properties': 'Manage all your property listings',
      'property': 'View and manage property details',
      'tenants': 'Manage tenant information and records',
      'tenant': 'View tenant details and history',
      'rooms': 'View and manage room availability',
      'room': 'Manage room details and settings',
      'bookings': 'Manage booking requests and reservations',
      'booking': 'View booking details and status',
      'payments': 'Track payments and invoices',
      'payment': 'View payment details and history',
      'reports': 'View analytics and reports',
      'report': 'Generate and view detailed reports',
      'settings': 'Configure platform settings and preferences',
      'profile': 'Manage your admin profile and account',
      'users': 'Manage user accounts and permissions',
      'user': 'View user details and settings',
      'notifications': 'Manage system notifications',
      'calendar': 'View booking calendar and schedule',
      'invoices': 'Generate and manage invoices',
      'maintenance': 'Manage maintenance requests',
      'analytics': 'View platform analytics and insights',
      'help': 'Get help and support',
      'docs': 'View documentation and guides',
    };
    
    // Default subtitle if page not found in list
    return pageSubtitles[page] || `Manage ${page} settings`;
  };

  // Agar login page hai to direct Outlet render karo
  if (isLoginPage) {
    return <><Outlet /></>;
  }

  // Loading state show karo jab tak restore ho raha hai
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header - Fixed position */}
        <AdminHeader 
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          sidebarOpen={sidebarOpen} 
          description={getPageSubtitle()}
        />
        
        {/* Main Content - Scrollable area with padding for fixed header */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'md:ml-48' : 'md:ml-[60px]'
        }`}>
          <div className="px-3 pt-24 pb-6 -z-20">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}