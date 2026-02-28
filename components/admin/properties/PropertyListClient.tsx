

// components/admin/properties/PropertyListClient.tsx - FIXED VERSION
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "@/src/compat/next-navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/data-table";
import PropertyForm from "@/components/admin/properties/PropertyForm";
import { TagsBulkModal } from "@/components/admin/properties/TagsBulkModal";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Eye,
  Home,
  Bed,
  CheckCircle,
  XSquare,
  CalendarDays,
  Clock3,
  BadgeIndianRupee,
  Tag,
  X,
  Users,
  IndianRupee,
  RefreshCw,
  LayoutGrid,
  List,
  Check,
  Hotel,
  DoorOpen,
  TrendingUp,
} from "lucide-react";

import {
  listProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  bulkDeleteProperties,
  bulkUpdateStatus,
  bulkUpdateTags,
  getProperty,
} from "@/lib/propertyApi";

import PropertyHeader from "./PropertyHeader";
import PropertyFilters from "./PropertyFilters";
import { columns, filters, getBulkActions, getActions, TagBadge } from "./table-config";


// Add Unsplash fallback images array for properties
const UNSPLASH_PROPERTY_FALLBACKS = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&auto=format', // Modern building
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&auto=format', // Apartment building
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format', // Luxury apartment
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format', // Modern apartment
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&auto=format', // Building exterior
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&auto=format', // House
  'https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=500&auto=format', // Building with pool
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&auto=format', // Modern building
];

// Helper function to get random fallback
const getRandomPropertyFallback = () => {
  return UNSPLASH_PROPERTY_FALLBACKS[Math.floor(Math.random() * UNSPLASH_PROPERTY_FALLBACKS.length)];
};
// Your existing types remain the same
type Property = {
  id: string;
  name: string;
  city_id?: string;
  area: string;
  address: string;
  total_rooms: number;
  total_beds: number;
  occupied_beds?: number;
  starting_price: number;
  security_deposit: number;
  description?: string;
  property_manager_name: string;
  property_manager_phone: string;
  amenities: string[];
  services: string[];
  photo_urls: string[];
  property_rules?: string;
  is_active: boolean;
  lockin_period_months: number;
  lockin_penalty_amount: number;
  lockin_penalty_type: string;
  notice_period_days: number;
  notice_penalty_amount: number;
  notice_penalty_type: string;
  terms_conditions?: string;
  additional_terms?: string;
  tags: string[];
};

type PropertyFormData = {
  name: string;
  city_id: string;
  area: string;
  address: string;
  total_rooms: number;
  total_beds: number;
  occupied_beds: number;
  starting_price: number;
  security_deposit: number;
  description: string;
  property_manager_name: string;
  property_manager_phone: string;
  amenities: string[];
  services: string[];
  photo_urls: string[];
  property_rules: string;
  lockin_period_months: number;
  lockin_penalty_amount: number;
  lockin_penalty_type: string;
  notice_period_days: number;
  notice_penalty_amount: number;
  notice_penalty_type: string;
  terms_conditions: string;
  additional_terms: string;
  tags: string[];
};

interface PropertyListClientProps {
  initialProperties: Property[];
}

export default function PropertyListClient({ initialProperties }: PropertyListClientProps) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [tableKey, setTableKey] = useState(Date.now());
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(initialProperties);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  
  // Stats state
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    totalRooms: 0,
    totalBeds: 0,
    availableBeds: 0,
    occupancyRate: 0,
  });

  const loadTimestamp = useRef(Date.now());

  // Calculate stats from properties
  const calculateStats = useCallback((props: Property[]) => {
    const totalProperties = props.length;
    const activeProperties = props.filter(p => p.is_active).length;
    const totalRooms = props.reduce((sum, p) => sum + (p.total_rooms || 0), 0);
    const totalBeds = props.reduce((sum, p) => sum + (p.total_beds || 0), 0);
    const occupiedBeds = props.reduce((sum, p) => sum + (p.occupied_beds || 0), 0);
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    setStats({
      totalProperties,
      activeProperties,
      totalRooms,
      totalBeds,
      availableBeds,
      occupancyRate,
    });
  }, []);

  // Update stats when properties change
  useEffect(() => {
    calculateStats(properties);
  }, [properties, calculateStats]);

  // FIX: Use useCallback to prevent infinite re-renders
  const loadProperties = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const cacheBuster = forceRefresh ? Date.now() : loadTimestamp.current;
      const res = await listProperties({ 
        page: 1, 
        pageSize: 200,
        _t: cacheBuster
      });
      
      if (res && res.success) {
        const propertiesData = Array.isArray(res.data)
          ? res.data.map((p: any) => ({
              ...p,
              id: String(p.id || ''),
              name: p.name || '',
              area: p.area || '',
              property_manager_name: p.property_manager_name || '',
              description: p.description || '',
              address: p.address || '',
              total_rooms: Number(p.total_rooms) || 0,
              total_beds: Number(p.total_beds) || 0,
              occupied_beds: Number(p.occupied_beds) || 0,
              starting_price: Number(p.starting_price) || 0,
              security_deposit: Number(p.security_deposit) || 0,
              is_active: Boolean(p.is_active),
              lockin_period_months: p.lockin_period_months || 0,
              lockin_penalty_amount: p.lockin_penalty_amount || 0,
              lockin_penalty_type: p.lockin_penalty_type || "fixed",
              notice_period_days: p.notice_period_days || 0,
              notice_penalty_amount: p.notice_penalty_amount || 0,
              notice_penalty_type: p.notice_penalty_type || "fixed",
              terms_conditions: p.terms_conditions || "",
              additional_terms: p.additional_terms || "",
              amenities: Array.isArray(p.amenities) ? p.amenities : [],
              services: Array.isArray(p.services) ? p.services : [],
              photo_urls: Array.isArray(p.photo_urls) ? p.photo_urls : [],
              property_rules: p.property_rules || "",
              property_manager_phone: p.property_manager_phone || "",
              tags: Array.isArray(p.tags) 
                ? p.tags.filter((t: any) => t != null && t !== '' && typeof t === 'string')
                : (p.tags && typeof p.tags === 'string' && p.tags !== '' ? [p.tags] : []),
            }))
          : [];
        
        setProperties(propertiesData);
        loadTimestamp.current = Date.now();
      } else {
        toast.error(res?.message || "Failed to load properties");
      }
    } catch (err) {
      console.error("loadProperties error:", err);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, []);

  // FIX: Initialize with initialProperties only once
  useEffect(() => {
    if (initialProperties.length > 0) {
      setProperties(initialProperties);
      setFilteredProperties(initialProperties);
    }
  }, [initialProperties]);

  // FIX: Filter properties - prevent infinite loop
  useEffect(() => {
    let filtered = [...properties];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(property => {
        const name = property.name?.toLowerCase() || '';
        const area = property.area?.toLowerCase() || '';
        const manager = property.property_manager_name?.toLowerCase() || '';
        const description = property.description?.toLowerCase() || '';
        const tags = Array.isArray(property.tags) ? property.tags : [];
        
        return (
          name.includes(query) ||
          area.includes(query) ||
          manager.includes(query) ||
          description.includes(query) ||
          tags.some(tag => 
            tag && typeof tag === 'string' && tag.toLowerCase().includes(query)
          )
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(property => 
        statusFilter === "true" ? property.is_active : !property.is_active
      );
    }

    // Tag filter
    if (tagFilter !== "all") {
      filtered = filtered.filter(property => {
        const tags = Array.isArray(property.tags) ? property.tags : [];
        return tags.some(tag => 
          tag && typeof tag === 'string' && 
          tag.toLowerCase() === tagFilter.toLowerCase()
        );
      });
    }

    // Only update if changed
    if (JSON.stringify(filtered) !== JSON.stringify(filteredProperties)) {
      setFilteredProperties(filtered);
    }
  }, [properties, searchQuery, statusFilter, tagFilter]);

  // FIX: Update showBulkActions
  useEffect(() => {
    setShowBulkActions(selectedCardIds.length > 0);
  }, [selectedCardIds]);

  useEffect(() => {
    setShowBulkActions(selectedTableIds.length > 0);
  }, [selectedTableIds]);

const handleFormSubmit = useCallback(async (
  formData: PropertyFormData,
  photoFiles: File[],
  removedPhotos: string[]
) => {
  try {
    setFormSubmitting(true);
    
   

    if (!formData.name.trim()) {
      toast.error("Property name is required");
      return;
    }
    if (!formData.city_id.trim()) {
      toast.error("City is required");
      return;
    }
    if (!formData.area.trim()) {
      toast.error("Area is required");
      return;
    }

    const slug = formData.name.trim().toLowerCase().replace(/\s+/g, "-");
    const payload = {
      ...formData,
      slug,
      tags: formData.tags || [],
    };


    let res;
    if (editMode && selectedProperty) {
      
      // DEBUG: First check if property exists
      try {
        const checkRes = await getProperty(selectedProperty.id);
      } catch (checkError) {
        console.error("❌ Property check failed:", checkError);
      }
      
      res = await updateProperty(
        selectedProperty.id,
        payload,
        photoFiles.length > 0 ? photoFiles : undefined,
        removedPhotos.length > 0 ? removedPhotos : undefined
      );
      
    } else {
      res = await createProperty(
        payload,
        photoFiles.length > 0 ? photoFiles : undefined
      );
    }

    if (!res || !res.success) {
      console.error("❌ API Error:", res?.message);
      toast.error(res?.message || "Failed to save property");
      return;
    }

    toast.success(
      editMode ? "Property updated successfully" : "Property created successfully"
    );

    setDialogOpen(false);
    await loadProperties(true);
  } catch (err) {
    console.error("❌ Form submit error:", err);
    toast.error("Failed to save property");
  } finally {
    setFormSubmitting(false);
  }
}, [editMode, selectedProperty, loadProperties]);

  const handleEdit = useCallback((property: Property) => {
    setSelectedProperty(property);
    setEditMode(true);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (property: Property) => {
    if (confirm(`Are you sure you want to delete "${property.name}"?`)) {
      try {
        const res = await deleteProperty(property.id);
        if (!res?.success) {
          toast.error(res?.message || "Failed to delete property");
        } else {
          toast.success("Property deleted successfully");
          await loadProperties(true);
        }
      } catch (err) {
        console.error("handleDelete error:", err);
        toast.error("Failed to delete property");
      }
    }
  }, [loadProperties]);

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} selected properties?`)) return;

    try {
      setLoading(true);
      const numIds = ids.map(id => Number(id));
      const res = await bulkDeleteProperties(numIds);
      if (!res?.success) {
        toast.error(res?.message || "Failed to delete properties");
        return;
      }
      toast.success(`${ids.length} properties deleted`);
      
      setProperties(prev => prev.filter(p => !ids.includes(p.id)));
      setSelectedCardIds([]);
      setSelectedTableIds([]);
      setTableKey(Date.now());
    } catch (err) {
      console.error("handleBulkDelete error:", err);
      toast.error("Bulk delete failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBulkStatusChange = useCallback(async (ids: string[], isActive: boolean) => {
    if (!ids.length) {
      toast.error("Please select properties first");
      return;
    }

    try {
      const numIds = ids.map(id => Number(id));
      const res = await bulkUpdateStatus(numIds, isActive);
      if (!res?.success) {
        toast.error(res?.message || "Failed to update status");
        return;
      }

      toast.success(isActive ? "Properties activated" : "Properties deactivated");
      
      setProperties(prev => prev.map(p => 
        ids.includes(p.id) ? { ...p, is_active: isActive } : p
      ));
      
      setSelectedCardIds([]);
      setSelectedTableIds([]);
      setTableKey(Date.now());
    } catch (err) {
      console.error("handleBulkStatusChange error:", err);
      toast.error("Failed to update status");
    }
  }, []);

  const handleBulkTagsUpdate = useCallback(async (tags: string[], operation: 'add' | 'remove' | 'set') => {
    const ids = [...selectedCardIds, ...selectedTableIds].map(id => Number(id));
    
    if (!ids.length) {
      toast.error("Please select properties first");
      return;
    }

    try {
      const res = await bulkUpdateTags(ids, tags, operation);
      
      if (!res?.success) {
        toast.error(res?.message || "Failed to update tags");
        return;
      }

      const actionText = operation === 'add' ? 'added to' : operation === 'remove' ? 'removed from' : 'set for';
      toast.success(`Tags ${actionText} ${ids.length} properties`);
      
      setProperties(prev => prev.map(p => {
        if (!ids.includes(Number(p.id))) return p;
        
        const currentTags = Array.isArray(p.tags) ? p.tags : [];
        let newTags: string[];
        
        switch (operation) {
          case 'add':
            newTags = Array.from(new Set(currentTags.concat(tags)));
            break;
          case 'remove':
            const tagsToRemove = tags.map(t => t.toLowerCase().trim());
            newTags = currentTags.filter(tag => 
              tag && typeof tag === 'string' &&
              !tagsToRemove.includes(tag.toLowerCase().trim())
            );
            break;
          case 'set':
            newTags = [...tags];
            break;
          default:
            newTags = currentTags;
        }
        
        return { ...p, tags: newTags };
      }));
      
      setSelectedCardIds([]);
      setSelectedTableIds([]);
      setTableKey(Date.now());
      
      setTimeout(() => {
        loadProperties(true);
      }, 500);
      
    } catch (err) {
      console.error("handleBulkTagsUpdate error:", err);
      toast.error("Failed to update tags");
    }
  }, [selectedCardIds, selectedTableIds, loadProperties]);

  const handleSelectionChange = useCallback((selectedRows: any[]) => {
    setSelectedRows(selectedRows);
    const ids = selectedRows.map(row => String(row.id));
    setSelectedTableIds(ids);
  }, []);

  const handleCardSelect = useCallback((propertyId: string) => {
    setSelectedCardIds(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  }, []);

  const handleSelectAllCards = useCallback(() => {
    if (selectedCardIds.length === filteredProperties.length) {
      setSelectedCardIds([]);
    } else {
      setSelectedCardIds(filteredProperties.map(p => p.id));
    }
  }, [filteredProperties, selectedCardIds.length]);

  const getIdsFromSelection = useCallback((selectedRows: any[]): number[] => {
    if (!Array.isArray(selectedRows) || selectedRows.length === 0) return [];
    return selectedRows
      .map((item) => {
        if (item && typeof item === 'object' && item.id) return Number(item.id);
        if (item && (typeof item === 'string' || typeof item === 'number')) return Number(item);
        return null;
      })
      .filter((id): id is number => id !== null && !isNaN(id));
  }, []);

  const handleTableSelection = useCallback((selectedIds: string[]) => {
    setSelectedTableIds(selectedIds);
  }, []);

  const handleBulkAction = useCallback(async (action: any, selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      toast.error("No properties selected");
      return;
    }

    if (action.confirmMessage) {
      if (!confirm(action.confirmMessage)) return;
    }

    try {
      if (action.label === "Delete Selected") {
        await handleBulkDelete(selectedIds);
      } else if (action.label === "Active Selected") {
        await handleBulkStatusChange(selectedIds, true);
      } else if (action.label === "Deactive Selected") {
        await handleBulkStatusChange(selectedIds, false);
      } else if (action.label === "Manage Tags") {
        setTagsModalOpen(true);
      } else {
        action.action(selectedIds);
      }
      
      if (action.label !== "Manage Tags") {
        setSelectedCardIds([]);
        setSelectedTableIds([]);
        setIsBulkActionOpen(false);
      }
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error("Failed to perform bulk action");
    }
  }, [handleBulkDelete, handleBulkStatusChange]);

  const handleExportToExcel = useCallback(async () => {
    try {
      const headers = ["Name", "Area", "Rooms", "Beds", "Starting Price", "Status", "Tags"];
      const rows = filteredProperties.map(property => [
        property.name,
        property.area,
        property.total_rooms,
        property.total_beds,
        property.starting_price,
        property.is_active ? "Active" : "Inactive",
        Array.isArray(property.tags) ? property.tags.join(", ") : ""
      ]);
      
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `properties_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Properties exported successfully');
    } catch (err: any) {
      console.error('Export error:', err);
      toast.error(err.message || 'Failed to export data');
    }
  }, [filteredProperties]);

  const handleImport = useCallback(() => {
  // Create a file input element
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,.xlsx,.xls';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      toast.info(`Importing ${file.name}...`);
      // Add your actual import logic here
      console.log('Importing file:', file);
    }
  };
  input.click();
}, []);

  const handleFormReset = useCallback(() => {
    setEditMode(false);
    setSelectedProperty(null);
  }, []);

  // Extract unique tags for filter
  const uniqueTags = Array.from(
    new Set(
      properties
        .flatMap(p => p.tags || [])
        .filter(tag => tag && tag.trim() !== '' && typeof tag === 'string')
    )
  );

  // Stats Cards Component - Like second image, above header
  const StatsCards = () => (
<div className="sticky top-20 z-10 py-0 md:py-2 px-0  mb-4">
  <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2
">

      {/* Total Properties */}
      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
        <div className="p-1 bg-blue-100 rounded-md">
          <Building2 className="h-3.5 w-3.5 text-blue-600" />
        </div>
        <div className="leading-tight">
          <p className="text-[9px] text-gray-500 font-medium">Total Properties</p>
          <p className="text-xs md:text-lg font-bold text-gray-900">{stats.totalProperties}</p>
        </div>
      </div>

      {/* Active */}
      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
        <div className="p-1 bg-green-100 rounded-md">
          <Hotel className="h-3.5 w-3.5 text-green-600" />
        </div>
        <div className="leading-tight">
          <p className="text-[9px] text-gray-500 font-medium">Active</p>
          <p className="text-xs md:text-lg font-bold text-gray-900">{stats.activeProperties}</p>
        </div>
      </div>

      {/* Total Rooms */}
      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
        <div className="p-1 bg-purple-100 rounded-md">
          <DoorOpen className="h-3.5 w-3.5 text-purple-600" />
        </div>
        <div className="leading-tight">
          <p className="text-[9px] text-gray-500 font-medium">Total Rooms</p>
          <p className="text-xs md:text-lg font-bold text-gray-900">{stats.totalRooms}</p>
        </div>
      </div>

      {/* Total Beds */}
      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
        <div className="p-1 bg-orange-100 rounded-md">
          <Bed className="h-3.5 w-3.5 text-orange-600" />
        </div>
        <div className="leading-tight">
          <p className="text-[9px] text-gray-500 font-medium">Total Beds</p>
          <p className="text-xs md:text-lg font-bold text-gray-900">{stats.totalBeds}</p>
        </div>
      </div>

      {/* Available Beds */}
      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
        <div className="p-1 bg-teal-100 rounded-md">
          <Users className="h-3.5 w-3.5 text-teal-600" />
        </div>
        <div className="leading-tight">
          <p className="text-[9px] text-gray-500 font-medium">Available Beds</p>
          <p className="text-xs md:text-lg font-bold text-gray-900">{stats.availableBeds}</p>
        </div>
      </div>

      {/* Occupancy */}
      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
        <div className="p-1 bg-pink-100 rounded-md">
          <TrendingUp className="h-3.5 w-3.5 text-pink-600" />
        </div>
        <div className="leading-tight">
          <p className="text-[9px] text-gray-500 font-medium">Occupancy</p>
          <p className="text-xs md:text-lg font-bold text-gray-900">{stats.occupancyRate}%</p>
        </div>
      </div>

    </div>
  </div>
</div>




  );

  // FIX: PropertyCard as separate component to prevent re-renders
  const PropertyCard = useCallback(({ property }: { property: Property }) => {
    const isSelected = selectedCardIds.includes(property.id);
    
    return (
      <Card className={`  border transition-all duration-300 group relative
        ${isSelected 
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/20' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
        }`}>
        
        {/* Selection Checkbox */}
        {viewMode === 'card' && (
          <div className={`absolute top-3 left-3 z-10 transition-all duration-200
            ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'}`}>
            <div
              onClick={() => handleCardSelect(property.id)}
              className="h-5 w-5 border-2 border-white shadow-lg bg-white rounded flex items-center justify-center cursor-pointer"
            >
              {isSelected && <Check className="h-3 w-3 text-blue-600" />}
            </div>
          </div>
        )}

        <div className="relative">
          {/* Property Image/Placeholder */}
          <div className="h-40 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center relative overflow-hidden">
            {property.photo_urls && property.photo_urls.length > 0 ? (
              <img 
                src={`${import.meta.env.VITE_API_URL+property.photo_urls[0]}`} 
                alt={property.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="text-center">
                <Building2 className="h-12 w-12 text-blue-300 mx-auto" />
                <p className="text-xs text-blue-400 mt-1">No image</p>
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <div
                className={`font-medium px-3 py-1 text-xs shadow-sm rounded-md ${
                  property.is_active
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    : "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
                }`}
              >
                {property.is_active ? "Active" : "Inactive"}
              </div>
            </div>

            {/* Tags */}
            {property.tags && property.tags.length > 0 && (
              <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                {property.tags.slice(0, 2).map((tag, index) => (
                  <div
                    key={index}
                    className="font-medium px-2 py-0.5 flex items-center gap-1 text-xs border rounded-full bg-white/90"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Property Details */}
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Title and Location */}
              <div>
                <h3 className="font-semibold text-base text-gray-900 line-clamp-1">
                  {property.name}
                </h3>
                <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="line-clamp-1">{property.area}</span>
                </p>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-3 gap-1 pt-2 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600">
                    <Home className="h-3 w-3" />
                    <span className="font-semibold text-sm">{property.total_rooms}</span>
                  </div>
                  <p className="text-xs text-gray-500">Rooms</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-600">
                    <Bed className="h-3 w-3" />
                    <span className="font-semibold text-sm">{property.total_beds}</span>
                  </div>
                  <p className="text-xs text-gray-500">Beds</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-600">
                    <Users className="h-3 w-3" />
                    <span className="font-semibold text-sm">{property.occupied_beds || 0}</span>
                  </div>
                  <p className="text-xs text-gray-500">Occupied</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5 text-green-600" />
                    <span className="font-bold text-base text-gray-900">
                      ₹{property.starting_price?.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">/month</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Deposit: ₹{property.security_deposit?.toLocaleString()}
                </div>
              </div>

              {/* Terms Summary */}
              <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3 text-blue-500" />
                  <span>{property.lockin_period_months || 0}m lock-in</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock3 className="h-3 w-3 text-amber-500" />
                  <span>{property.notice_period_days || 0}d notice</span>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Card Footer with Actions */}
          <div className="px-4 pb-4 pt-2 border-t bg-gray-50/50">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => router.push(`/admin/properties/${property.id}`)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleEdit(property)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(property)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }, [selectedCardIds, viewMode, handleCardSelect, handleEdit, handleDelete, router]);

  // FIX: CardView component
  const CardView = useCallback(() => {
    if (loading && properties.length === 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-80 animate-pulse">
              <div className="h-40 bg-gray-200" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-8 bg-gray-200 rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredProperties.length === 0) {
      return (
        <div className="text-center py-16">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Properties Found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'all' || tagFilter !== 'all' 
              ? 'Try adjusting your filters or search query'
              : 'Get started by adding your first property'}
          </p>
          <Button
            onClick={() => {
              setEditMode(false);
              setSelectedProperty(null);
              setDialogOpen(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Property
          </Button>
        </div>
      );
    }

    return (
      <>
        {/* Bulk Actions Bar */}
   {showBulkActions && (
  <>
    {/* ================= MOBILE + TABLET ================= */}
    <div className="md:hidden  mb-3 
                    bg-gradient-to-r from-blue-500 to-cyan-500 
                    rounded-md px-2 py-2 shadow-md">

      <div className="flex flex-col gap-2">

        {/* Left */}
        <div className="flex items-center gap-2 text-white text-xs">
          <Check className="h-3 w-3" />
          <span className="font-medium leading-none">
            {selectedCardIds.length} selected
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-1">

          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs bg-white/20 text-white border-white/30"
            onClick={handleSelectAllCards}
          >
            {selectedCardIds.length === filteredProperties.length ? "All ✕" : "All"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs bg-white/20 text-white border-white/30"
            onClick={() => handleBulkStatusChange(selectedCardIds, true)}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            On
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs bg-white/20 text-white border-white/30"
            onClick={() => handleBulkStatusChange(selectedCardIds, false)}
          >
            <XSquare className="h-3 w-3 mr-1" />
            Off
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs bg-white/20 text-white border-white/30"
            onClick={() => setTagsModalOpen(true)}
          >
            <Tag className="h-3 w-3 mr-1" />
            Tags
          </Button>

          <Button
            size="sm"
            variant="destructive"
            className="h-7 px-2 text-xs"
            onClick={() => handleBulkDelete(selectedCardIds)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Del
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-white"
            onClick={() => setSelectedCardIds([])}
          >
            <X className="h-3 w-3" />
          </Button>

        </div>
      </div>
    </div>


    {/* ================= DESKTOP ================= */}
    <div className="hidden md:block  mb-4 
                    bg-gradient-to-r from-blue-500 to-cyan-500 
                    rounded-lg p-3 shadow-lg">

      <div className="flex items-center justify-between">

        {/* Left */}
        <div className="flex items-center gap-3 text-white">
          <div className="p-1 bg-white/20 rounded">
            <Check className="h-4 w-4" />
          </div>
          <span className="font-medium text-base">
            {selectedCardIds.length} property
            {selectedCardIds.length !== 1 ? "s" : ""} selected
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">

          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-white/20 text-white border-white/30"
            onClick={handleSelectAllCards}
          >
            {selectedCardIds.length === filteredProperties.length
              ? "Deselect All"
              : "Select All"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-white/20 text-white border-white/30"
            onClick={() => handleBulkStatusChange(selectedCardIds, true)}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Active
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-white/20 text-white border-white/30"
            onClick={() => handleBulkStatusChange(selectedCardIds, false)}
          >
            <XSquare className="h-4 w-4 mr-2" />
            Deactive
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-white/20 text-white border-white/30"
            onClick={() => setTagsModalOpen(true)}
          >
            <Tag className="h-4 w-4 mr-2" />
            Manage Tags
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => handleBulkDelete(selectedCardIds)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-white"
            onClick={() => setSelectedCardIds([])}
          >
            <X className="h-4 w-4" />
          </Button>

        </div>
      </div>
    </div>
  </>
)}


        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </>
    );
  }, [
    loading, 
    properties.length, 
    filteredProperties, 
    searchQuery, 
    statusFilter, 
    tagFilter, 
    showBulkActions, 
    selectedCardIds, 
    handleSelectAllCards, 
    handleBulkStatusChange, 
    handleBulkDelete,
    PropertyCard
  ]);

  return (
    <div>
      {/* Stats Cards - Above everything like second image */}
      <StatsCards />
      
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-xl  ">
        {/* Header Component */}
        <PropertyHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={() => loadProperties(true)}
          onFilterClick={() => setSidebarOpen(true)}
          onExport={handleExportToExcel}
            onImport={handleImport}

          onAddProperty={() => {
            handleFormReset();
            setDialogOpen(true);
          }}
          selectedTableIds={selectedTableIds}
          isBulkActionOpen={isBulkActionOpen}
          setIsBulkActionOpen={setIsBulkActionOpen}
          bulkActions={getBulkActions(getIdsFromSelection, handleBulkStatusChange, handleBulkDelete, setTagsModalOpen, toast)}
          handleBulkAction={handleBulkAction}
          statusFilter={statusFilter}
          tagFilter={tagFilter}
          onClearFilters={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setTagFilter('all');
          }}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Content */}
        <div className="max-h-[376px]  md:max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
          <CardContent className="p-4">
            <Tabs value={viewMode} className="w-full" onValueChange={(value) => setViewMode(value as "table" | "card")}>
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Card View
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Table View
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="table" className="mt-0">
                <DataTable
                  key={tableKey}
                  data={filteredProperties}
                  columns={columns}
                  bulkActions={getBulkActions(getIdsFromSelection, handleBulkStatusChange, handleBulkDelete, setTagsModalOpen, toast)}
                  onRefresh={() => loadProperties(true)}
                  filters={filters}
                  actions={getActions(handleEdit, handleDelete, router)}
                  loading={loading}
                  pageSize={10}
                  showSearch={false}
                  showFilters={false}
                  showRefresh={false}
                  showExport={false}
                  onSelectionChange={handleTableSelection}
                />
              </TabsContent>

              <TabsContent value="card" className="mt-0">
                <CardView />
              </TabsContent>
            </Tabs>
          </CardContent>
        </div>
      </Card>

      {/* Filters Sidebar */}
      <PropertyFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        tagFilter={tagFilter}
        onTagFilterChange={setTagFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        uniqueTags={uniqueTags}
        filteredPropertiesLength={filteredProperties.length}
        propertiesLength={properties.length}
        onApplyFilters={() => {}}
        onClearFilters={() => {
          setSearchQuery('');
          setStatusFilter('all');
          setTagFilter('all');
        }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Modals */}
      <TagsBulkModal
        open={tagsModalOpen}
        onOpenChange={setTagsModalOpen}
        selectedCount={selectedCardIds.length + selectedTableIds.length}
        selectedPropertyIds={[...selectedCardIds, ...selectedTableIds].map(id => Number(id))}
        onSubmit={handleBulkTagsUpdate}
      />

      <PropertyForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editMode={editMode}
        selectedProperty={selectedProperty}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        loading={formSubmitting}
      />
    </div>
  );
}