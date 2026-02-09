// components/admin/properties/PropertyCard.tsx - FIXED VERSION
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Home,
  Bed,
  Users,
  IndianRupee,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface PropertyCardProps {
  property: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (property: any) => void;
  onDelete: (property: any) => void;
  viewMode: "table" | "card";
}

export default function PropertyCard({
  property,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  viewMode,
}: PropertyCardProps) {
  const router = useRouter();
  
  // Use useCallback to prevent function recreation on every render
  const handleSelect = useCallback(() => {
    onSelect(property.id);
  }, [onSelect, property.id]);
  
  const handleEdit = useCallback(() => {
    onEdit(property);
  }, [onEdit, property]);
  
  const handleDelete = useCallback(() => {
    onDelete(property);
  }, [onDelete, property]);
  
  const handleView = useCallback(() => {
    router.push(`/admin/properties/${property.id}`);
  }, [router, property.id]);

  return (
    <Card className="h-full overflow-hidden border border-gray-200">
      <div className="relative">
        {/* Simple image placeholder */}
        <div className="h-40 bg-gray-100 flex items-center justify-center">
          <Building2 className="h-12 w-12 text-gray-400" />
        </div>

        {/* Simple Checkbox - NO conditional classes that change on every render */}
        {viewMode === 'card' && (
          <div className="absolute top-2 left-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelect}
              className="h-5 w-5 bg-white"
            />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <Badge variant={property.is_active ? "default" : "secondary"}>
            {property.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-base mb-1">{property.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{property.area}</p>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <Home className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <span className="text-sm">{property.total_rooms}</span>
          </div>
          <div className="text-center">
            <Bed className="h-4 w-4 mx-auto mb-1 text-purple-600" />
            <span className="text-sm">{property.total_beds}</span>
          </div>
          <div className="text-center">
            <IndianRupee className="h-4 w-4 mx-auto mb-1 text-green-600" />
            <span className="text-sm">₹{property.starting_price}</span>
          </div>
        </div>

        <div className="flex justify-between">
          <Button size="sm" variant="ghost" onClick={handleView}>
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={handleEdit}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}