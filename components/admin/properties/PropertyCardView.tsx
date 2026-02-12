// components/admin/properties/PropertyCardView.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/src/compat/next-navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Edit,
  Trash2,
  MapPin,
  Eye,
  Home,
  Bed,
  CalendarDays,
  Clock3,
  Tag as TagIcon,
  Users,
  IndianRupee,
  X,
  Check,
  PlusCircle,
} from "lucide-react";
import { deleteProperty, Property } from "@/lib/propertyApi";
import PropertyForm from "@/components/admin/properties/PropertyForm";

interface PropertyCardViewProps {
  properties: Property[];
}

export default function PropertyCardView({ properties }: PropertyCardViewProps) {
  const router = useRouter();
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // ============ DEBUGGING ============
  console.log('🚀 PropertyCardView rendered');
  console.log('📦 Properties received:', properties);
  console.log('🔢 Number of properties:', properties?.length);
  
  if (properties && properties.length > 0) {
    console.log('🏠 First property:', properties[0]);
    console.log('🏷️ First property tags:', properties[0].tags);
    console.log('📋 First property tags type:', typeof properties[0].tags);
    console.log('🔍 Is tags an array?', Array.isArray(properties[0].tags));
    console.log('📊 First property tags length:', properties[0].tags?.length);
    console.log('🔬 First property tags JSON:', JSON.stringify(properties[0].tags));
  }
  
  // Log all unique tag values across all properties
  const allTags = properties?.flatMap(p => {
    if (Array.isArray(p.tags)) {
      return p.tags;
    } else if (typeof p.tags === 'string') {
      return [p.tags];
    }
    return [];
  }) || [];
  
  console.log('🏷️ All tags across properties:', [...new Set(allTags)]);
  // ============ END DEBUGGING ============

  const handleCardSelect = (propertyId: string) => {
    setSelectedCardIds(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSelectAllCards = () => {
    if (selectedCardIds.length === properties.length) {
      setSelectedCardIds([]);
    } else {
      setSelectedCardIds(properties.map(p => p.id));
    }
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (property: Property) => {
    if (confirm(`Are you sure you want to delete "${property.name}"?`)) {
      try {
        const res = await deleteProperty(property.id);
        if (!res?.success) {
          toast.error(res?.message || "Failed to delete property");
        } else {
          toast.success("Property deleted successfully");
          router.refresh();
        }
      } catch (err) {
        console.error("handleDelete error:", err);
        toast.error("Failed to delete property");
      }
    }
  };

  const handleFormSubmit = async (formData: any, photoFiles: File[], removedPhotos: string[]) => {
    console.log("Form submitted", formData);
  };

  const handleFormReset = () => {
    setEditMode(false);
    setSelectedProperty(null);
  };

  // Universal tag extractor - handles all possible tag formats
  const extractTags = (property: Property): string[] => {
    if (!property) return [];
    
    console.log(`🔍 Extracting tags for property: ${property.name}`, property.tags);
    
    // Case 1: tags is already an array of strings
    if (Array.isArray(property.tags)) {
      // Check if it's an array of objects with name/title property
      if (property.tags.length > 0 && typeof property.tags[0] === 'object') {
        const extracted = property.tags.map((t: any) => {
          return t.name || t.title || t.value || t.label || JSON.stringify(t);
        });
        console.log(`📦 Extracted object tags:`, extracted);
        return extracted.filter(Boolean);
      }
      // It's already an array of strings
      console.log(`📦 Array of strings tags:`, property.tags);
      return property.tags.filter(t => t && t.trim() !== '');
    }
    
    // Case 2: tags is a string (comma-separated or JSON)
    if (typeof property.tags === 'string') {
      const tagString = property.tags.trim();
      
      // Try to parse as JSON
      if (tagString.startsWith('[') && tagString.endsWith(']')) {
        try {
          const parsed = JSON.parse(tagString);
          if (Array.isArray(parsed)) {
            const extracted = parsed.map(t => {
              if (typeof t === 'string') return t;
              if (typeof t === 'object') return t.name || t.title || t.value || JSON.stringify(t);
              return String(t);
            });
            console.log(`📦 Parsed JSON tags:`, extracted);
            return extracted.filter(Boolean);
          }
        } catch (e) {
          console.log('Failed to parse JSON tags:', e);
        }
      }
      
      // Split by comma
      if (tagString.includes(',')) {
        const split = tagString.split(',').map(t => t.trim()).filter(Boolean);
        console.log(`📦 Comma-separated tags:`, split);
        return split;
      }
      
      // Single tag
      if (tagString) {
        console.log(`📦 Single tag:`, [tagString]);
        return [tagString];
      }
    }
    
    // Case 3: property has tag_list or property_tags
    if ((property as any).tag_list && Array.isArray((property as any).tag_list)) {
      console.log(`📦 Using tag_list:`, (property as any).tag_list);
      return (property as any).tag_list.filter(Boolean);
    }
    
    if ((property as any).property_tags && Array.isArray((property as any).property_tags)) {
      console.log(`📦 Using property_tags:`, (property as any).property_tags);
      return (property as any).property_tags.filter(Boolean);
    }
    
    console.log(`📦 No tags found for:`, property.name);
    return [];
  };

  const TagBadge = ({ tag }: { tag: string }) => {
    const getTagColor = (tagName: string) => {
      const lowerTag = tagName.toLowerCase();
      switch (lowerTag) {
        case 'featured':
          return 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200';
        case 'new listing':
        case 'new':
          return 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200';
        case 'premium':
          return 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200';
        case 'luxury':
          return 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border border-rose-200';
        case 'budget':
          return 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200';
        case 'student friendly':
          return 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200';
        default:
          return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border border-gray-200';
      }
    };

    return (
      <Badge
        variant="outline"
        className={`${getTagColor(tag)} font-medium px-2 py-0.5 flex items-center gap-1 text-xs whitespace-nowrap`}
      >
        <TagIcon className="h-2.5 w-2.5 flex-shrink-0" />
        <span className="truncate max-w-[100px]">{tag}</span>
      </Badge>
    );
  };

  const PropertyCard = ({ property }: { property: Property }) => {
    const isSelected = selectedCardIds.includes(property.id);
    
    // Extract tags using our universal extractor
    const tags = extractTags(property);
    
    console.log(`🏷️ Final tags for ${property.name}:`, tags);

    const maxVisibleTags = 3;
    const visibleTags = tags.slice(0, maxVisibleTags);
    const remainingTagsCount = tags.length - maxVisibleTags;

    return (
      <Card className={`h-full overflow-hidden border transition-all duration-300 group relative flex flex-col
        ${isSelected
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/20'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
        }`}>
        
        {/* Selection Checkbox */}
        <div className={`absolute top-3 left-3 z-20 transition-all duration-200
          ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'}`}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => handleCardSelect(property.id)}
            className="h-5 w-5 border-2 border-white shadow-lg bg-white"
          />
        </div>

        {/* Property Image/Placeholder */}
        <div className="h-40 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center relative overflow-hidden flex-shrink-0">
          {property.photo_urls && property.photo_urls.length > 0 ? (
            <img
              src={property.photo_urls[0]}
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
          <div className="absolute top-3 right-3 z-20">
            <Badge
              variant={property.is_active ? "default" : "secondary"}
              className={`${property.is_active
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                : "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
                } font-medium px-3 py-1 text-xs shadow-sm`}
            >
              {property.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* DEBUG: Show tag count on image */}
          <div className="absolute bottom-2 left-2 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            Tags: {tags.length}
          </div>
        </div>

        {/* Property Details */}
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="space-y-3 flex-grow">
            {/* Title and Location */}
            <div>
              <h3 className="font-semibold text-base text-gray-900 line-clamp-1">
                {property.name}
              </h3>
              <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="line-clamp-1">{property.area || 'Location not specified'}</span>
              </p>
            </div>

            {/* TAGS SECTION - WITH HIGH VISIBILITY */}
            <div className="pt-2">
              <div className="flex items-center gap-1 mb-2">
                <TagIcon className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-gray-700">Tags ({tags.length})</span>
              </div>
              
              {/* Tags Container - Always visible */}
              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-gray-50 rounded-md border border-gray-200">
                {tags.length > 0 ? (
                  <>
                    {/* Visible Tags */}
                    {visibleTags.map((tag, index) => (
                      <TagBadge key={`${property.id}-tag-${index}`} tag={tag} />
                    ))}
                    
                    {/* Remaining Tags Counter */}
                    {remainingTagsCount > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-700 border-blue-300 font-medium px-2.5 py-1 flex items-center gap-1 text-xs cursor-pointer hover:bg-blue-200 transition-colors z-30"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info(
                            <div className="py-2">
                              <p className="font-medium mb-2 text-sm">All tags for {property.name}:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {tags.map((tag, idx) => (
                                  <TagBadge key={`toast-${idx}`} tag={tag} />
                                ))}
                              </div>
                            </div>,
                            { duration: 5000 }
                          );
                        }}
                      >
                        <PlusCircle className="h-3 w-3" />
                        +{remainingTagsCount} more
                      </Badge>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic w-full text-center py-1">
                    No tags added
                  </p>
                )}
              </div>
            </div>

            {/* Property Stats */}
            <div className="grid grid-cols-3 gap-1 pt-3 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600">
                  <Home className="h-3.5 w-3.5" />
                  <span className="font-semibold text-sm">{property.total_rooms || 0}</span>
                </div>
                <p className="text-xs text-gray-500">Rooms</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-purple-600">
                  <Bed className="h-3.5 w-3.5" />
                  <span className="font-semibold text-sm">{property.total_beds || 0}</span>
                </div>
                <p className="text-xs text-gray-500">Beds</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-600">
                  <Users className="h-3.5 w-3.5" />
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
                    ₹{property.starting_price?.toLocaleString() || 0}
                  </span>
                </div>
                <span className="text-xs text-gray-500">/month</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Deposit: ₹{property.security_deposit?.toLocaleString() || 0}
              </div>
            </div>

            {/* Terms Summary */}
            <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                <span>{property.lockin_period_months || 0}m lock-in</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5 text-amber-500" />
                <span>{property.notice_period_days || 0}d notice</span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Card Footer with Actions */}
        <div className="px-4 pb-4 pt-2 border-t bg-gray-50/50 mt-auto">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => router.push(`/admin/properties/${property.id}`)}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              View Details
            </Button>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleEdit(property)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDelete(property)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedCardIds.length > 0 && (
        <div className="sticky top-0 z-40 mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="p-1 bg-white/20 rounded">
                <Check className="h-4 w-4" />
              </div>
              <span className="font-medium">
                {selectedCardIds.length} property{selectedCardIds.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-white/20 text-white hover:bg-white/30 border-white/30"
                onClick={handleSelectAllCards}
              >
                {selectedCardIds.length === properties.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-white/20 text-white hover:bg-white/30 border-white/30"
                onClick={() => setSelectedCardIds([])}
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No properties found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      <PropertyForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editMode={editMode}
        selectedProperty={selectedProperty}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        loading={formSubmitting}
      />
    </>
  );
}