// components/ui/breadcrumb.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHomeIcon?: boolean;
  className?: string;
  homePath?: string;
  customLabels?: Record<string, string>;
  dynamicLabels?: {
    [key: string]: (params: any) => string;
  };
  backgroundImage?: string;
  backgroundOverlay?: boolean;
  overlayOpacity?: string;
}

const defaultCustomLabels: Record<string, string> = {
  'admin': 'Admin',
  'dashboard': 'Dashboard',
  'properties': 'Properties',
  'rooms': 'Rooms',
  'tenants': 'Tenants',
  'payments': 'Payments',
  'reports': 'Reports',
  'document-center': 'Document Center',
  'templates': 'Templates',
  'enquiries': 'Enquiries',
  'notifications': 'Notifications',
  'staff': 'Staff',
  'offers': 'Offers',
  'add-ons': 'Add-Ons',
  'masters': 'Masters',
  'settings': 'Settings',
  'profile': 'Profile',
  'complaints': 'Complaints',
  'maintenance': 'Maintenance',
  'receipts': 'Receipts',
  'leave-requests': 'Leave Requests',
  'vacate-requests': 'Vacate Requests',
  'change-bed-requests': 'Change Bed Requests',
  'account-deletion-requests': 'Account Deletion',
  'login': 'Login',
  'portal': 'Portal',
  'documents': 'Documents',
  'my-documents': 'My Documents',
  'requests': 'Requests',
  'support': 'Support',
  'about': 'About Us',
  'contact': 'Contact',
  'how-it-works': 'How It Works',
  'partner': 'Partner',
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items: propItems,
  showHomeIcon = true,
  className = '',
  homePath = '/',
  customLabels = {},
  dynamicLabels = {},
  backgroundImage,
  backgroundOverlay = true,
  overlayOpacity = 'bg-black/40',
}) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const allCustomLabels = { ...defaultCustomLabels, ...customLabels };

  const generateItems = (): BreadcrumbItem[] => {
    if (propItems) return propItems;

    const items: BreadcrumbItem[] = [];
    let currentPath = '';

    if (showHomeIcon) {
      items.push({
        label: 'Home',
        path: homePath,
        isCurrent: pathnames.length === 0,
      });
    }

    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      let label = segment;
      let isDynamic = false;

      if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) || 
          segment.match(/^[0-9]+$/)) {
        isDynamic = true;
        
        const parentSegment = pathnames[index - 1];
        if (parentSegment && dynamicLabels[parentSegment]) {
          label = dynamicLabels[parentSegment]({ id: segment, type: parentSegment });
        } else {
          label = `Details`;
        }
      }

      if (!isDynamic && allCustomLabels[segment]) {
        label = allCustomLabels[segment];
      }

      if (!isDynamic && !allCustomLabels[segment]) {
        label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      const isLast = index === pathnames.length - 1;

      items.push({
        label,
        path: currentPath,
        isCurrent: isLast,
      });
    });

    return items;
  };

  const breadcrumbItems = generateItems();

  const backgroundStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } : {};

  return (
    <div 
      className="relative w-full py-4 px-6 rounded-lg overflow-hidden"
      style={backgroundStyle}
    >
      {backgroundImage && backgroundOverlay && (
        <div className={`absolute inset-0 ${overlayOpacity}`} />
      )}
      
      <nav 
        aria-label="Breadcrumb" 
        className={`relative z-10 flex items-center text-sm ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1.5">
          {breadcrumbItems.map((item, index) => (
            <li key={item.path} className="flex items-center">
              {index === 0 && item.label === 'Home' && showHomeIcon ? (
                <Link
                  to={item.path}
                  className="flex items-center text-gray-500 hover:text-[#bd081c] transition-colors"
                  aria-label="Home"
                >
                  <Home className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  {index > 0 && (
                    <ChevronRight className={`w-4 h-4 mx-1 ${
                      backgroundImage ? 'text-white/70' : 'text-gray-400'
                    }`} />
                  )}
                  {item.isCurrent ? (
                    <span className={`font-semibold px-2.5 py-1.5 rounded-full text-sm ${
                      backgroundImage 
                        ? 'text-white bg-[#bd081c]/30 backdrop-blur-sm' 
                        : 'text-gray-900 bg-[#bd081c]/10'
                    }`}>
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.path}
                      className={`px-1.5 py-1 transition-colors ${
                        backgroundImage
                          ? 'text-white/90 hover:text-white hover:underline'
                          : 'text-gray-600 hover:text-[#bd081c] hover:underline'
                      } underline-offset-2`}
                    >
                      {item.label}
                    </Link>
                  )}
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};