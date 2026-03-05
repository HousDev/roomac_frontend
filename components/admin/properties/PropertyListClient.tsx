// components/admin/properties/PropertyListClient.tsx
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
  Tag,
  X,
  Users,
  LayoutGrid,
  List,
  Check,
  Hotel,
  DoorOpen,
  Loader2,
} from "lucide-react";

import {
  listProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  bulkDeleteProperties,
  bulkUpdateStatus,
  bulkUpdateTags,
  getPropertyOccupancyStats,
} from "@/lib/propertyApi";
import { consumeMasters } from "@/lib/masterApi";

import PropertyHeader from "./PropertyHeader";
import PropertyFilters from "./PropertyFilters";
import { getColumns, filters, getBulkActions, getActions } from "./table-config";
import PropertyImportModal from "./PropertyImportModal";

// Add Unsplash fallback images array for properties
const UNSPLASH_PROPERTY_FALLBACKS = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&auto=format',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&auto=format',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&auto=format',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&auto=format',
  'https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=500&auto=format',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&auto=format',
];

// Helper function to get random fallback
const getRandomPropertyFallback = () => {
  return UNSPLASH_PROPERTY_FALLBACKS[Math.floor(Math.random() * UNSPLASH_PROPERTY_FALLBACKS.length)];
};

// Types
type Property = {
  id: string;
  name: string;
  city_id?: string;
  state?: string;
  floor?: string;
  area: string;
  address: string;
  total_rooms: number;
  total_beds: number;
  occupied_beds: number;
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

interface MasterValue {
  id: number;
  name: string;
  isactive: number;
}

interface PropertyListClientProps {
  initialProperties: Property[];
}

export default function PropertyListClient({ initialProperties }: PropertyListClientProps) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [mastersLoading, setMastersLoading] = useState(true);
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
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [propertiesMasters, setPropertiesMasters] = useState<Record<string, MasterValue[]>>({});
  const [mastersLoaded, setMastersLoaded] = useState(false);
  
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

  // Fetch properties masters
  const fetchPropertiesMasters = async () => {
    setMastersLoading(true);
    try {
      console.log("📚 Fetching properties masters...");
      const res = await consumeMasters({ tab: "Properties" });
      console.log("📚 Masters response:", res);
      
      if (res?.success && res.data) {
        const grouped: Record<string, MasterValue[]> = {};
        res.data.forEach((item: any) => {
          const type = item.type_name;
          if (!grouped[type]) {
            grouped[type] = [];
          }
          grouped[type].push({
            id: item.value_id,
            name: item.value_name,
            isactive: 1,
          });
        });
        console.log("✅ Properties Masters loaded:", grouped);
        if (grouped["Tags"]) {
          console.log("🏷️ Tags in masters:", grouped["Tags"].map(t => ({ id: t.id, name: t.name })));
        }
        setPropertiesMasters(grouped);
        setMastersLoaded(true);
        return grouped;
      }
    } catch (error) {
      console.error("Failed to fetch properties masters:", error);
    } finally {
      setMastersLoading(false);
    }
    return null;
  };

  // Load properties function
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
          ? await Promise.all(res.data.map(async (p: any) => {
              // First check if the property already has occupied_beds from the list endpoint
              let occupiedBeds = p.occupied_beds || 0;
              
              // If not, fetch it separately
              if (occupiedBeds === 0 && p.total_beds > 0) {
                try {
                  const statsRes = await getPropertyOccupancyStats(p.id);
                  if (statsRes.success) {
                    occupiedBeds = statsRes.data.occupied_beds || 0;
                  }
                } catch (error) {
                  console.error(`Error fetching occupancy for property ${p.id}:`, error);
                }
              }
              
              // Parse tags - keep them as they come from API (could be IDs or names)
              let tags: string[] = [];
              if (Array.isArray(p.tags)) {
                tags = p.tags.filter((t: any) => t != null && t !== '');
              } else if (p.tags && typeof p.tags === 'string' && p.tags !== '') {
                try {
                  const parsed = JSON.parse(p.tags);
                  tags = Array.isArray(parsed) ? parsed : [p.tags];
                } catch {
                  tags = [p.tags];
                }
              }
              
              return {
                id: String(p.id || ''),
                name: p.name || '',
                area: p.area || '',
                address: p.address || '',
                state: p.state || '',
                floor: p.floor || '',
                city_id: p.city_id || '',
                total_rooms: Number(p.total_rooms) || 0,
                total_beds: Number(p.total_beds) || 0,
                occupied_beds: occupiedBeds,
                starting_price: Number(p.starting_price) || 0,
                security_deposit: Number(p.security_deposit) || 0,
                description: p.description || '',
                property_manager_name: p.property_manager_name || '',
                property_manager_phone: p.property_manager_phone || '',
                amenities: Array.isArray(p.amenities) ? p.amenities : [],
                services: Array.isArray(p.services) ? p.services : [],
                photo_urls: Array.isArray(p.photo_urls) ? p.photo_urls : [],
                property_rules: p.property_rules || '',
                is_active: Boolean(p.is_active),
                lockin_period_months: Number(p.lockin_period_months) || 0,
                lockin_penalty_amount: Number(p.lockin_penalty_amount) || 0,
                lockin_penalty_type: p.lockin_penalty_type || "fixed",
                notice_period_days: Number(p.notice_period_days) || 0,
                notice_penalty_amount: Number(p.notice_penalty_amount) || 0,
                notice_penalty_type: p.notice_penalty_type || "fixed",
                terms_conditions: p.terms_conditions || "",
                additional_terms: p.additional_terms || "",
                tags: tags,
              };
            }))
          : [];
        
        console.log("✅ Properties loaded with tags:", propertiesData.map(p => ({
          id: p.id,
          name: p.name,
          tags: p.tags
        })));
        
        setProperties(propertiesData);
        setFilteredProperties(propertiesData);
        
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

  // Initialize data - load masters and properties
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Load masters first
        await fetchPropertiesMasters();
        // Then load properties
        await loadProperties();
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []); // Run once on mount

  // Filter properties when search/filters change
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

    setFilteredProperties(filtered);
  }, [properties, searchQuery, statusFilter, tagFilter]);

  // Update showBulkActions
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
    console.log("selected", property);
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
      // Get tag names for export
      const getTagNamesForExport = (tags: any): string => {
        if (!tags || !Array.isArray(tags)) return "";
        
        if (!mastersLoaded || !propertiesMasters["Tags"]) {
          return tags.join(", ");
        }
        
        const tagNames = tags.map((id: string | number) => {
          const numId = Number(id);
          const matchingTag = propertiesMasters["Tags"].find(
            tag => tag.id === numId || tag.name === String(id)
          );
          return matchingTag ? matchingTag.name : String(id);
        }).filter(Boolean);
        
        return tagNames.join(", ");
      };

      const headers = ["Name", "Area", "Rooms", "Beds", "Occupied Beds", "Starting Price", "Status", "Tags"];
      const rows = filteredProperties.map(property => [
        property.name,
        property.area,
        property.total_rooms,
        property.total_beds,
        property.occupied_beds,
        property.starting_price,
        property.is_active ? "Active" : "Inactive",
        getTagNamesForExport(property.tags)
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
  }, [filteredProperties, propertiesMasters, mastersLoaded]);

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleImportFile = async (file: File) => {
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/properties/import`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Successfully imported ${result.count} properties`);
        setShowImportModal(false);
        await loadProperties(true);
      } else {
        throw new Error(result.message || 'Import failed');
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import properties');
    } finally {
      setImporting(false);
    }
  };

  const handleFormReset = useCallback(() => {
    setEditMode(false);
    setSelectedProperty(null);
  }, []);

  // Extract unique tags for filter - map IDs to names if masters are loaded
  const uniqueTags = Array.from(
    new Set(
      properties
        .flatMap(p => {
          if (!p.tags || !Array.isArray(p.tags)) return [];
          
          if (mastersLoaded && propertiesMasters["Tags"]) {
            // Map IDs to names for filter display
            return p.tags.map(id => {
              const numId = Number(id);
              const matchingTag = propertiesMasters["Tags"].find(
                tag => tag.id === numId || tag.name === String(id)
              );
              return matchingTag ? matchingTag.name : String(id);
            });
          }
          return p.tags;
        })
        .filter(tag => tag && tag.trim() !== '' && typeof tag === 'string')
    )
  );

  // Stats Cards Component
  const StatsCards = () => (
    <div className="sticky top-20 z-10 py-0 md:py-2 px-0 mb-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
            <div className="p-1 bg-blue-100 rounded-md">
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="leading-tight">
              <p className="text-[9px] text-gray-500 font-medium">Total Properties</p>
              <p className="text-xs md:text-lg font-bold text-gray-900">{stats.totalProperties}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
            <div className="p-1 bg-green-100 rounded-md">
              <Hotel className="h-3.5 w-3.5 text-green-600" />
            </div>
            <div className="leading-tight">
              <p className="text-[9px] text-gray-500 font-medium">Active</p>
              <p className="text-xs md:text-lg font-bold text-gray-900">{stats.activeProperties}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
            <div className="p-1 bg-purple-100 rounded-md">
              <DoorOpen className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <div className="leading-tight">
              <p className="text-[9px] text-gray-500 font-medium">Total Rooms</p>
              <p className="text-xs md:text-lg font-bold text-gray-900">{stats.totalRooms}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
            <div className="p-1 bg-orange-100 rounded-md">
              <Bed className="h-3.5 w-3.5 text-orange-600" />
            </div>
            <div className="leading-tight">
              <p className="text-[9px] text-gray-500 font-medium">Total Beds</p>
              <p className="text-xs md:text-lg font-bold text-gray-900">{stats.totalBeds}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
            <div className="p-1 bg-teal-100 rounded-md">
              <Users className="h-3.5 w-3.5 text-teal-600" />
            </div>
            <div className="leading-tight">
              <p className="text-[9px] text-gray-500 font-medium">Available Beds</p>
              <p className="text-xs md:text-lg font-bold text-gray-900">{stats.availableBeds}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // PropertyCard component
  const PropertyCard = useCallback(({ 
    property, 
    propertiesMasters,
    mastersLoaded 
  }: { 
    property: Property; 
    propertiesMasters: Record<string, MasterValue[]>;
    mastersLoaded: boolean;
  }) => {
    const isSelected = selectedCardIds.includes(property.id);
    
    // Function to get tag names from IDs
    const getTagNames = (tags: any): string[] => {
      if (!tags || !Array.isArray(tags)) return [];
      
      // If masters are not loaded yet, return empty array to hide tags
      if (!mastersLoaded || !propertiesMasters || !propertiesMasters["Tags"]) {
        console.log("⏳ Masters not loaded yet, hiding tags for", property.id);
        return [];
      }
      
      // Map IDs to names
      const mappedTags = tags.map(id => {
        const numId = Number(id);
        const matchingTag = propertiesMasters["Tags"].find(
          tag => tag.id === numId || tag.name === String(id)
        );
        return matchingTag ? matchingTag.name : null;
      }).filter(Boolean) as string[];
      
      console.log(`✅ Mapped tags for ${property.name}:`, mappedTags);
      return mappedTags;
    };

    const tagNames = getTagNames(property.tags);
    
    return (
      <div
        className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
          ${isSelected
            ? 'ring-2 ring-[#90b6e8] shadow-xl shadow-[#004AAD]/10'
            : 'ring-1 ring-gray-200 hover:ring-[#004AAD]/40 hover:shadow-xl hover:shadow-[#004AAD]/8 hover:-translate-y-0.5'
          }`}
      >
        {/* Selection checkbox */}
        {viewMode === 'card' && (
          <div
            className={`absolute top-3 left-3 z-20 transition-all duration-200
              ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'}`}
          >
            <div
              onClick={() => handleCardSelect(property.id)}
              className={`h-5 w-5 rounded-md shadow-md flex items-center justify-center cursor-pointer transition-colors duration-200
                ${isSelected ? 'bg-[#004AAD] border-2 border-[#004AAD]' : 'bg-white border-2 border-white'}`}
            >
              {isSelected && <Check className="h-3 w-3 text-white" />}
            </div>
          </div>
        )}

        {/* Image */}
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
          {property.photo_urls && property.photo_urls.length > 0 ? (
            <img
              src={`${import.meta.env.VITE_API_URL}${property.photo_urls[0]}`}
              alt={property.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getRandomPropertyFallback();
              }}
            />
          ) : (
            <img
              src={getRandomPropertyFallback()}
              alt={property.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}

          {/* Dark gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm
                ${property.is_active
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-500 text-white'
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${property.is_active ? 'bg-white' : 'bg-gray-300'}`} />
              {property.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Tags - showing names only when masters are loaded */}
          {tagNames.length > 0 && (
            <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1">
              {tagNames.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-gray-700 border border-white/60"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
              {tagNames.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-gray-700 border border-white/60">
                  +{tagNames.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Rest of the card */}
        <div className="px-4 py-2">
          {/* Name + Location */}
          <div className="mb-3">
            <h3 className="font-black text-gray-900 text-sm leading-snug line-clamp-1 group-hover:text-[#004AAD] transition-colors duration-200">
              {property.name}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-[#004AAD] flex-shrink-0" />
              <span className="line-clamp-1">{property.area}</span>
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
              <div className="w-6 h-6 rounded-lg bg-[#004AAD] flex items-center justify-center flex-shrink-0">
                <Home className="h-3 w-3 text-white" />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm leading-none">{property.total_rooms}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Rooms</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2">
              <div className="w-6 h-6 rounded-lg bg-[#FFC107] flex items-center justify-center flex-shrink-0">
                <Bed className="h-3 w-3 text-white" />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm leading-none">{property.total_beds}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Beds</p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between mb-3 pb-1 border-b border-gray-100">
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Starting from</p>
              <p className="font-black text-[#004AAD] text-lg leading-tight">
                ₹{property.starting_price?.toLocaleString()}
                <span className="text-xs font-normal text-gray-400 ml-1">/mo</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Deposit</p>
              <p className="font-semibold text-gray-700 text-sm">₹{property.security_deposit?.toLocaleString()}</p>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <CalendarDays className="h-3.5 w-3.5 text-[#004AAD]" />
              <span>{property.lockin_period_months || 0}m lock-in</span>
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock3 className="h-3.5 w-3.5 text-[#FFC107]" />
              <span>{property.notice_period_days || 0}d notice</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-gray-100">
            <button
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004AAD] hover:bg-[#004AAD]/8 px-2.5 py-1.5 rounded-lg transition-colors duration-200"
              onClick={() => router.push(`/admin/properties/${property.id}`)}
            >
              <Eye className="h-3.5 w-3.5" />
              View Details
            </button>
            <div className="flex items-center gap-1">
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#004AAD] hover:bg-[#004AAD]/8 transition-all duration-200"
                onClick={() => handleEdit(property)}
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                onClick={() => handleDelete(property)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [selectedCardIds, viewMode, handleCardSelect, handleEdit, handleDelete, router]);

  // CardView component
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

    if (!mastersLoaded) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading masters data...</p>
          </div>
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
            {/* Mobile */}
            <div className="md:hidden mb-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-md px-2 py-2 shadow-md">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white text-xs">
                  <Check className="h-3 w-3" />
                  <span className="font-medium leading-none">
                    {selectedCardIds.length} selected
                  </span>
                </div>
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

            {/* Desktop */}
            <div className="hidden md:block mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-1 bg-white/20 rounded">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-base">
                    {selectedCardIds.length} property
                    {selectedCardIds.length !== 1 ? "s" : ""} selected
                  </span>
                </div>
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
            <PropertyCard 
              key={property.id} 
              property={property} 
              propertiesMasters={propertiesMasters}
              mastersLoaded={mastersLoaded}
            />
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
    PropertyCard,
    propertiesMasters,
    mastersLoaded,
    setTagsModalOpen
  ]);

  return (
    <div>
      {/* Stats Cards */}
      <StatsCards />
      
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-xl">
        {/* Header Component */}
        <PropertyHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={() => loadProperties(true)}
          onFilterClick={() => setSidebarOpen(true)}
          onExport={handleExportToExcel}
          onImport={handleImportClick} 
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

        <PropertyImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportFile}
          importing={importing}
        />

        {/* Content */}
        <div className="max-h-[376px] md:max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
          <CardContent className="p-4">
            <Tabs value={viewMode} className="w-full" onValueChange={(value) => setViewMode(value as "table" | "card")}>
              <div className="flex justify-end">
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
              </div>
              
              <TabsContent value="table" className="mt-0">
  <DataTable
    key={tableKey}
    data={filteredProperties}
    columns={getColumns(propertiesMasters, mastersLoaded)}
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