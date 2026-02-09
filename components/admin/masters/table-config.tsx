// components/admin/masters/table-config.tsx
import {
  Home,
  Users,
  FileText,
  CreditCard,
  Settings,
  Briefcase,
  Globe,
  Package,
  FolderOpen,
  Tag,
  Clock,
  Code,
} from "lucide-react";

// Get icon for tab
export function getTabIcon(tabName: string) {
  const tabLower = tabName.toLowerCase();
  if (tabLower.includes('property') || tabLower.includes('term')) {
    return <Home size={16} />;
  } else if (tabLower.includes('tenant') || tabLower.includes('user')) {
    return <Users size={16} />;
  } else if (tabLower.includes('agreement') || tabLower.includes('contract')) {
    return <FileText size={16} />;
  } else if (tabLower.includes('payment') || tabLower.includes('finance')) {
    return <CreditCard size={16} />;
  } else if (tabLower.includes('system') || tabLower.includes('settings')) {
    return <Settings size={16} />;
  } else if (tabLower.includes('general')) {
    return <FolderOpen size={16} />;
  } else if (tabLower.includes('business') || tabLower.includes('work')) {
    return <Briefcase size={16} />;
  } else if (tabLower.includes('location') || tabLower.includes('city')) {
    return <Globe size={16} />;
  } else if (tabLower.includes('maintenance') || tabLower.includes('repair')) {
    return <Package size={16} />;
  }
  return <FolderOpen size={16} />;
}

// Get icon for type
export function getTypeIcon(typeName: string) {
  const name = typeName.toLowerCase();
  if (name.includes('property') || name.includes('building') || name.includes('home')) {
    return <Home size={16} />;
  } else if (name.includes('tenant') || name.includes('user')) {
    return <Users size={16} />;
  } else if (name.includes('agreement') || name.includes('contract')) {
    return <FileText size={16} />;
  } else if (name.includes('payment') || name.includes('rent')) {
    return <CreditCard size={16} />;
  } else if (name.includes('code') || name.includes('key')) {
    return <Code size={16} />;
  } else if (name.includes('city') || name.includes('state') || name.includes('country')) {
    return <Globe size={16} />;
  } else if (name.includes('amenity') || name.includes('facility')) {
    return <Package size={16} />;
  } else if (name.includes('period') || name.includes('time')) {
    return <Clock size={16} />;
  }
  return <Tag size={16} />;
}

// Format date
export function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return "Invalid date";
  }
}

// Column configurations for DataTable (if needed)
export const typeColumns = [
  {
    accessorKey: "name",
    header: "Type Name",
    cell: (info: any) => info.getValue(),
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: (info: any) => (
      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded">
        {info.getValue()}
      </span>
    ),
  },
  {
    accessorKey: "value_count",
    header: "Values",
    cell: (info: any) => info.getValue(),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: (info: any) => (
      <span className={`px-2 py-1 text-xs rounded ${
        info.getValue() 
          ? 'bg-green-100 text-green-700' 
          : 'bg-gray-100 text-gray-700'
      }`}>
        {info.getValue() ? 'Active' : 'Inactive'}
      </span>
    ),
  },
];

export const valueColumns = [
  {
    accessorKey: "value",
    header: "Value",
    cell: (info: any) => info.getValue(),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: (info: any) => (
      <span className={`px-2 py-1 text-xs rounded ${
        info.getValue() 
          ? 'bg-green-100 text-green-700' 
          : 'bg-gray-100 text-gray-700'
      }`}>
        {info.getValue() ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: (info: any) => formatDate(info.getValue()),
  },
];