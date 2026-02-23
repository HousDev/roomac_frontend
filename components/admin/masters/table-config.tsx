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
  DoorOpen,
  Building,
  Key,
  Wrench,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Get icon for tab (static tabs)
export function getTabIcon(tabName: string) {
  const tabLower = tabName.toLowerCase();
  if (tabLower.includes('property') || tabLower.includes('properties')) {
    return <Building size={16} />;
  } else if (tabLower.includes('room') || tabLower.includes('rooms')) {
    return <DoorOpen size={16} />;
  } else if (tabLower.includes('common')) {
    return <FolderOpen size={16} />;
  } else if (tabLower.includes('tenant') || tabLower.includes('user')) {
    return <Users size={16} />;
  } else if (tabLower.includes('agreement') || tabLower.includes('contract')) {
    return <FileText size={16} />;
  } else if (tabLower.includes('payment') || tabLower.includes('finance')) {
    return <DollarSign size={16} />;
  } else if (tabLower.includes('system') || tabLower.includes('settings')) {
    return <Settings size={16} />;
  } else if (tabLower.includes('general')) {
    return <FolderOpen size={16} />;
  } else if (tabLower.includes('business') || tabLower.includes('work')) {
    return <Briefcase size={16} />;
  } else if (tabLower.includes('location') || tabLower.includes('city')) {
    return <Globe size={16} />;
  } else if (tabLower.includes('maintenance') || tabLower.includes('repair')) {
    return <Wrench size={16} />;
  }
  return <FolderOpen size={16} />;
}

// Get icon for item
export function getItemIcon(itemName: string) {
  const name = itemName.toLowerCase();
  if (name.includes('property') || name.includes('building') || name.includes('home')) {
    return <Building size={16} />;
  } else if (name.includes('room') || name.includes('bedroom') || name.includes('bathroom')) {
    return <DoorOpen size={16} />;
  } else if (name.includes('tenant') || name.includes('user') || name.includes('occupant')) {
    return <Users size={16} />;
  } else if (name.includes('agreement') || name.includes('contract') || name.includes('lease')) {
    return <FileText size={16} />;
  } else if (name.includes('payment') || name.includes('rent') || name.includes('deposit')) {
    return <CreditCard size={16} />;
  } else if (name.includes('code') || name.includes('key') || name.includes('access')) {
    return <Key size={16} />;
  } else if (name.includes('city') || name.includes('state') || name.includes('country')) {
    return <Globe size={16} />;
  } else if (name.includes('amenity') || name.includes('facility') || name.includes('feature')) {
    return <Package size={16} />;
  } else if (name.includes('period') || name.includes('time') || name.includes('duration')) {
    return <Clock size={16} />;
  } else if (name.includes('status') || name.includes('state')) {
    return <CheckCircle size={16} />;
  } else if (name.includes('type') || name.includes('category')) {
    return <Tag size={16} />;
  } else if (name.includes('maintenance') || name.includes('repair') || name.includes('issue')) {
    return <Wrench size={16} />;
  }
  return <Tag size={16} />;
}

// Get status badge color
export function getStatusBadge(isActive: boolean | number) {
  const active = typeof isActive === 'boolean' ? isActive : isActive === 1;
  return active 
    ? 'bg-green-100 text-green-700 border-green-200' 
    : 'bg-gray-100 text-gray-600 border-gray-200';
}

// Format date
export function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return "Invalid date";
  }
}

// Format datetime
export function formatDateTime(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return "Invalid date";
  }
}

// Column configurations for DataTable
export const itemColumns = [
  {
    accessorKey: "name",
    header: "Item Name",
    cell: (info: any) => (
      <div className="flex items-center gap-2">
        <span className="text-gray-500">{getItemIcon(info.getValue())}</span>
        <span className="font-medium">{info.getValue()}</span>
      </div>
    ),
  },
  {
    accessorKey: "tab_name",
    header: "Tab",
    cell: (info: any) => (
      <div className="flex items-center gap-1">
        <span className="text-gray-400">{getTabIcon(info.getValue())}</span>
        <span>{info.getValue()}</span>
      </div>
    ),
  },
  {
    accessorKey: "value_count",
    header: "Values",
    cell: (info: any) => (
      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
        {info.getValue() || 0}
      </span>
    ),
  },
  {
    accessorKey: "isactive",
    header: "Status",
    cell: (info: any) => (
      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusBadge(info.getValue())}`}>
        {info.getValue() === 1 ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: (info: any) => formatDate(info.getValue()),
  },
];

export const valueColumns = [
  {
    accessorKey: "name",
    header: "Value",
    cell: (info: any) => (
      <div className="flex items-center gap-2">
        <span className="text-gray-400">•</span>
        <span>{info.getValue()}</span>
      </div>
    ),
  },
  {
    accessorKey: "isactive",
    header: "Status",
    cell: (info: any) => (
      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusBadge(info.getValue())}`}>
        {info.getValue() === 1 ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: (info: any) => formatDate(info.getValue()),
  },
];