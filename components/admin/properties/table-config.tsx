// components/admin/properties/table-config.tsx 
import React from "react";
import {
  Building2,
  Home,
  Bed,
  CalendarDays,
  Clock3,
  BadgeIndianRupee,
  Tag,
  MapPin,
  CheckCircle,
  XSquare,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Column, FilterConfig, BulkAction, ActionButton } from "@/components/admin/data-table";

// Reusable TagBadge component
export const TagBadge = ({ tag }: { tag: string }) => {
  const getTagColor = (tagName: string): string => {
    const lowerTag = tagName.toLowerCase();
    switch(lowerTag) {
      case 'featured':
        return 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200';
      case 'new listing':
      case 'new':
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200';
      case 'premium':
        return 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border border-gray-200';
    }
  };
  
  return (
    <Badge
      variant="outline"
      className={`${getTagColor(tag)} font-medium px-2 py-0.5 flex items-center gap-1 text-xs`}
    >
      <Tag className="h-2.5 w-2.5" />
      {tag}
    </Badge>
  );
};

// Columns configuration
export const columns: Column<any>[] = [
  {
    key: "name",
    label: "Property Name",
    sortable: true,
    render: (property: any) => (
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center border">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{property.name}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {property.area}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "capacity",
    label: "Capacity",
    render: (property: any) => (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{property.total_rooms} Rooms</span>
        </div>
        <div className="flex items-center gap-2">
          <Bed className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{property.total_beds} Beds</span>
        </div>
      </div>
    ),
  },
  {
    key: "pricing",
    label: "Pricing",
    render: (property: any) => (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <BadgeIndianRupee className="h-3 w-3 text-green-600" />
          <span className="font-semibold text-gray-900">
            ₹{property.starting_price?.toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Deposit: ₹{property.security_deposit?.toLocaleString()}
        </div>
      </div>
    ),
  },
  {
    key: "terms",
    label: "Terms & Periods",
    render: (property: any) => (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-3 w-3 text-blue-600" />
          <Badge variant="outline" className="text-xs">
            Lock-in: {property.lockin_period_months || 0}m
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-3 w-3 text-amber-600" />
          <Badge variant="outline" className="text-xs">
            Notice: {property.notice_period_days || 0}d
          </Badge>
        </div>
      </div>
    ),
  },
  {
    key: "is_active",
    label: "Status",
    sortable: true,
    render: (property: any) => {
      const isActive = Boolean(property.is_active);
      return (
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={`${isActive
              ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
              : "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border border-gray-200"
            } font-medium px-3 py-1.5`}
        >
          {isActive ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3" />
              Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <XSquare className="h-3 w-3" />
              Inactive
            </span>
          )}
        </Badge>
      );
    },
  },
  {
    key: "tags",
    label: "Tags",
    render: (property: any) => {
      const tags = Array.isArray(property.tags) 
        ? property.tags.filter((t: string) => t && t.trim() !== '')
        : [];
      
      return (
        <div className="flex flex-wrap gap-1 max-w-[200px] min-h-[40px]">
          {tags.length > 0 ? (
            tags.map((tag: string, index: number) => (
              <TagBadge key={`${property.id}-${index}-${tag}`} tag={tag} />
            ))
          ) : (
            <span className="text-sm text-gray-400 italic self-center">No tags</span>
          )}
        </div>
      );
    },
  },
];

// Filters configuration
export const filters: FilterConfig[] = [
  {
    key: "name",
    label: "Property Name",
    type: "text",
    icon: React.createElement(Building2, { className: "h-4 w-4" }),
    placeholder: "Search by name",
  },
  {
    key: "area",
    label: "Area",
    type: "text",
    icon: React.createElement(MapPin, { className: "h-4 w-4" }),
    placeholder: "Search by area",
  },
  {
    key: "is_active",
    label: "Status",
    type: "select",
    icon: React.createElement(CheckCircle, { className: "h-4 w-4" }),
    options: [
      { value: "all", label: "All" },
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
  {
    key: "lockin_period_months",
    label: "Lock-in Period",
    type: "select",
    icon: React.createElement(CalendarDays, { className: "h-4 w-4" }),
    options: [
      { value: "all", label: "All" },
      { value: "0", label: "No Lock-in" },
      { value: "6", label: "6 Months" },
      { value: "12", label: "1 Year" },
      { value: "24", label: "2 Years" },
    ],
  },
  {
    key: "tags",
    label: "Tags",
    type: "select",
    icon: React.createElement(Tag, { className: "h-4 w-4" }),
    options: [
      { value: "all", label: "All Tags" },
      { value: "featured", label: "Featured" },
      { value: "new listing", label: "New Listing" },
      { value: "premium", label: "Premium" },
    ],
  },
];

// Bulk actions configuration function
export const getBulkActions = (
  getIdsFromSelection: (selectedRows: any[]) => number[],
  handleBulkStatusChange: (ids: string[], isActive: boolean) => Promise<void>,
  handleBulkDelete: (ids: string[]) => Promise<void>,
  setTagsModalOpen: (open: boolean) => void,
  toast: any
): BulkAction[] => [
  {
    label: "Active Selected",
    icon: React.createElement(CheckCircle, { className: "h-4 w-4" }),
    action: (selectedRows: any) => {
      const ids = getIdsFromSelection(selectedRows);
      handleBulkStatusChange(ids.map(String), true);
    },
  },
  {
    label: "Deactive Selected",
    icon: React.createElement(XSquare, { className: "h-4 w-4" }),
    action: (selectedRows: any) => {
      const ids = getIdsFromSelection(selectedRows);
      handleBulkStatusChange(ids.map(String), false);
    },
  },
  {
    label: "Delete Selected",
    icon: React.createElement(Trash2, { className: "h-4 w-4" }),
    action: (selectedRows: any) => {
      const ids = getIdsFromSelection(selectedRows);
      handleBulkDelete(ids.map(String));
    },
    variant: "destructive",
    confirmMessage: "Are you sure you want to delete the selected properties?",
  },
  {
    label: "Manage Tags",
    icon: React.createElement(Tag, { className: "h-4 w-4" }),
    action: (selectedRows: any) => {
      if (selectedRows.length === 0) {
        toast.error("Please select properties first");
        return;
      }
      setTagsModalOpen(true);
    },
  },
];

// Action buttons configuration function
export const getActions = (
  handleEdit: (property: any) => void,
  handleDelete: (property: any) => void,
  router: any
): ActionButton<any>[] => [
  {
    label: "View Details",
    icon: React.createElement(Eye, { className: "h-4 w-4" }),
    action: (property: any) => router.push(`/admin/properties/${property.id}`),
    variant: "outline",
  },
  {
    label: "Edit",
    icon: React.createElement(Edit, { className: "h-4 w-4" }),
    action: handleEdit,
  },
  {
    label: "Delete",
    icon: React.createElement(Trash2, { className: "h-4 w-4" }),
    action: handleDelete,
    variant: "destructive",
  },
];