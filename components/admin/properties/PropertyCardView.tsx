"use client";

import { useState } from "react";
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
  CheckCircle,
  XSquare,
  CalendarDays,
  Clock3,
  Tag as TagIcon,
  Users,
  IndianRupee,
  X,
  Check,
} from "lucide-react";
import { deleteProperty, Property } from "@/lib/propertyApi";
import PropertyForm from "@/components/admin/properties/PropertyForm";

// interface Property {
//   id: string;
//   name: string;
//   area?: string | null;
//   total_rooms: number;
//   total_beds: number;
//   occupied_beds?: number;
//   starting_price: number;
//   security_deposit: number;
//   description?: string;
//   property_manager_name: string;
//   is_active: boolean;
//   lockin_period_months: number;
//   notice_period_days: number;
//   photo_urls: string[];
//   tags: string[];
// }

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
    // Your existing form submit logic
    console.log("Form submitted", formData);
  };

  const handleFormReset = () => {
    setEditMode(false);
    setSelectedProperty(null);
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
        default:
          return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border border-gray-200';
      }
    };

    return (
      <Badge
        variant="outline"
        className={`${getTagColor(tag)} font-medium px-2 py-0.5 flex items-center gap-1 text-xs`}
      >
        <TagIcon className="h-2.5 w-2.5" />
        {tag}
      </Badge>
    );
  };

  const PropertyCard = ({ property }: { property: Property }) => {
    const isSelected = selectedCardIds.includes(property.id);

    return (
      <Card className={`h-full overflow-hidden border transition-all duration-300 group relative
        ${isSelected
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/20'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
        }`}>
        {/* Selection Checkbox */}
        <div className={`absolute top-3 left-3 z-10 transition-all duration-200
          ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'}`}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => handleCardSelect(property.id)}
            className="h-5 w-5 border-2 border-white shadow-lg bg-white"
          />
        </div>

        <div className="relative">
          {/* Property Image/Placeholder */}
          <div className="h-40 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center relative overflow-hidden">
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
            <div className="absolute top-3 right-3">
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

            {/* Tags */}
            {property.tags && property.tags.length > 0 && (
              <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                {property.tags.slice(0, 2).map((tag, index) => (
                  <TagBadge key={index} tag={tag} />
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
                <X className="h-3 w-3" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

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