// components/admin/rooms/RoomDetailsDialog.tsx
"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Eye, Pencil, Building, DoorOpen, Users, Bed, Bath, Wind,
  Sun, Heart, Image as ImageIcon, Video, MapPin,
  Home, Sparkles, CheckCircle, XCircle, UserRound, Globe,
  Calendar, Wifi, Tv, Droplets, Shield, Coffee,
  Car, Dumbbell, TreePine, Waves, Thermometer, UsersRound, PersonStanding,
  BadgeIndianRupee,
  X, Phone, Mail, Hash, UserPlus, Loader2, Armchair,
  Refrigerator, Fan, Lamp, Lock, Key, Utensils, 
  Mountain, Snowflake, Sunset, Warehouse, Factory,
  CookingPot, Gamepad, Music, Headphones, BookOpen,
  Cigarette, Wine, Cat, Dog, Speaker, HardHat,
  Briefcase, ShoppingBag, Bike, Bus, Train, Plane
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { request } from '@/lib/api';
import type { RoomResponse, BedAssignment } from '@/lib/roomsApi';
import { toast } from "sonner";

interface RoomDetailsDialogProps {
  room: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TenantDetails {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  is_active: boolean;
  portal_access_enabled: boolean;
  couple_id?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  occupation?: string;
  date_of_birth?: string;
  aadhar_number?: string;
  pan_number?: string;
}

// Enhanced amenities mapping with more icons and vibrant colors
const AMENITIES_WITH_COLORS = [
  // Basic Amenities
  { id: 'wifi', label: 'WiFi', icon: Wifi, bg: 'bg-blue-500', text: 'text-white' },
  { id: 'tv', label: 'TV', icon: Tv, bg: 'bg-purple-500', text: 'text-white' },
  { id: 'ac', label: 'AC', icon: Snowflake, bg: 'bg-cyan-500', text: 'text-white' },
  { id: 'fan', label: 'Fan', icon: Fan, bg: 'bg-sky-500', text: 'text-white' },
  { id: 'geyser', label: 'Geyser', icon: Thermometer, bg: 'bg-red-500', text: 'text-white' },
  { id: 'fridge', label: 'Refrigerator', icon: Refrigerator, bg: 'bg-slate-600', text: 'text-white' },
  
  // Furniture
  { id: 'bed', label: 'Bed', icon: Bed, bg: 'bg-amber-600', text: 'text-white' },
  { id: 'wardrobe', label: 'Wardrobe', icon: DoorOpen, bg: 'bg-stone-600', text: 'text-white' },
  { id: 'study table', label: 'Study Table', icon: BookOpen, bg: 'bg-emerald-600', text: 'text-white' },
  { id: 'chair', label: 'Chair', icon: Armchair, bg: 'bg-orange-500', text: 'text-white' },
  { id: 'lamp', label: 'Study Lamp', icon: Lamp, bg: 'bg-yellow-500', text: 'text-white' },
  { id: 'curtains', label: 'Curtains', icon: Sunset, bg: 'bg-indigo-500', text: 'text-white' },
  
  // Kitchen & Dining
  { id: 'kitchen', label: 'Kitchen', icon: CookingPot, bg: 'bg-orange-600', text: 'text-white' },
  { id: 'dining', label: 'Dining', icon: Utensils, bg: 'bg-amber-600', text: 'text-white' },
  { id: 'microwave', label: 'Microwave', icon: Coffee, bg: 'bg-stone-600', text: 'text-white' },
  
  // Services
  { id: 'cleaning', label: 'Cleaning', icon: Sparkles, bg: 'bg-teal-500', text: 'text-white' },
  { id: 'laundry', label: 'Laundry', icon: Droplets, bg: 'bg-blue-600', text: 'text-white' },
  { id: 'security', label: 'Security', icon: Shield, bg: 'bg-red-600', text: 'text-white' },
  { id: 'parking', label: 'Parking', icon: Car, bg: 'bg-gray-600', text: 'text-white' },
  { id: 'power backup', label: 'Power Backup', icon: Factory, bg: 'bg-yellow-600', text: 'text-white' },
  
  // Facilities
  { id: 'gym', label: 'Gym', icon: Dumbbell, bg: 'bg-lime-600', text: 'text-white' },
  { id: 'garden', label: 'Garden', icon: TreePine, bg: 'bg-green-600', text: 'text-white' },
  { id: 'terrace', label: 'Terrace', icon: Mountain, bg: 'bg-emerald-600', text: 'text-white' },
  { id: 'swimming pool', label: 'Swimming Pool', icon: Waves, bg: 'bg-blue-600', text: 'text-white' },
  
  // Entertainment
  { id: 'game zone', label: 'Game Zone', icon: Gamepad, bg: 'bg-violet-600', text: 'text-white' },
  { id: 'music room', label: 'Music Room', icon: Music, bg: 'bg-fuchsia-600', text: 'text-white' },
  { id: 'theatre', label: 'Home Theatre', icon: Headphones, bg: 'bg-rose-600', text: 'text-white' },
  
  // Others
  { id: 'balcony', label: 'Balcony', icon: Sun, bg: 'bg-amber-500', text: 'text-white' },
  { id: 'attached bathroom', label: 'Attached Bathroom', icon: Bath, bg: 'bg-cyan-600', text: 'text-white' },
  { id: 'smoking', label: 'Smoking Allowed', icon: Cigarette, bg: 'bg-stone-600', text: 'text-white' },
  { id: 'pet friendly', label: 'Pet Friendly', icon: Dog, bg: 'bg-amber-600', text: 'text-white' },
];

// Gender icon component with colors
const GenderIcon = ({ gender, size = "h-4 w-4" }: { gender: string; size?: string }) => {
  switch (gender?.toLowerCase()) {
    case 'male':
    case 'male_only':
      return <UserRound className={`${size} text-blue-600`} />;
    case 'female':
    case 'female_only':
      return <UserRound className={`${size} text-pink-600`} />;
    case 'couples':
    case 'couple':
      return <UsersRound className={`${size} text-red-600`} />;
    default:
      return <PersonStanding className={`${size} text-gray-600`} />;
  }
};

// Bed status badge with colors
const BedStatusBadge = ({ isAvailable, rent }: { isAvailable: boolean; rent?: number }) => {
  if (isAvailable) {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-2 py-0.5">
        <CheckCircle className="h-2.5 w-2.5 mr-1" />
        Available
        {rent && <span className="ml-1 font-bold">₹{rent}</span>}
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-2 py-0.5">
      <XCircle className="h-2.5 w-2.5 mr-1" />
      Occupied
    </Badge>
  );
};

export function RoomDetailsDialog({ room, open, onOpenChange }: RoomDetailsDialogProps) {
  const [tenants, setTenants] = useState<TenantDetails[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [errorTenants, setErrorTenants] = useState<string | null>(null);
  const [bedAssignments, setBedAssignments] = useState<BedAssignment[]>([]);

  // Process bed assignments with rent information
  useEffect(() => {
    if (room?.bed_assignments) {
      setBedAssignments(room.bed_assignments);
    }
  }, [room]);

  const YesNoIcon = ({ value }: { value: boolean }) => {
    return value ? (
      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
    ) : (
      <XCircle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
    );
  };

  // Handle gender preferences (array or string)
  const genderPreferences = Array.isArray(room.room_gender_preference) 
    ? room.room_gender_preference 
    : [room.room_gender_preference];

  // Get occupied beds with tenant details from bed_assignments
  const occupiedBeds = bedAssignments?.filter((bed: BedAssignment) => bed.tenant_id) || [];

  // Fetch all tenants when dialog opens
  const loadAllTenants = async () => {
    try {
      setLoadingTenants(true);
      setErrorTenants(null);
      
      const response: any = await request('/api/tenants?is_active=true&portal_access_enabled=true');
      
      let tenantsList: TenantDetails[] = [];
      
      if (Array.isArray(response)) {
        tenantsList = response;
      } else if (response.data && Array.isArray(response.data)) {
        tenantsList = response.data;
      }
      
      setTenants(tenantsList);
    } catch (error: any) {
      console.error('Error loading tenants:', error);
      setErrorTenants(error.message || 'Failed to load tenants');
      toast.error('Failed to load tenant details');
    } finally {
      setLoadingTenants(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadAllTenants();
    }
  }, [open]);

  // Helper to get tenant details by ID
  const getTenantDetails = (tenantId: number) => {
    return tenants.find(t => t.id === tenantId);
  };

  // Format date from bed_assignments.created_at
  const formatAssignmentDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // Calculate days since assignment from bed_assignments.created_at
  const getDaysSinceAssignment = (dateString: string) => {
    if (!dateString) return null;
    try {
      const assignmentDate = new Date(dateString);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - assignmentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  // Get amenity style with vibrant colors
  const getAmenityStyle = (amenityName: string) => {
    const lowerName = amenityName.toLowerCase();
    const found = AMENITIES_WITH_COLORS.find(a => 
      lowerName.includes(a.id) || a.label.toLowerCase() === lowerName
    );
    return found || {
      id: 'default',
      label: amenityName,
      icon: Sparkles,
      bg: 'bg-gradient-to-br from-gray-600 to-gray-700',
      text: 'text-white'
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-hidden p-0 border-0 flex flex-col">
        {/* Header with blue gradient - Updated as requested */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm sm:text-base md:text-lg lg:text-xl font-bold flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="truncate">Room {room.room_number}</span>
                <Badge 
                  variant={room.is_active ? "default" : "secondary"} 
                  className="ml-1 sm:ml-2 bg-white/20 text-white border-white/30 text-[10px] sm:text-xs"
                >
                  {room.is_active ? '● Active' : '○ Inactive'}
                </Badge>
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-white hover:bg-white/20 rounded-full"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-[10px] sm:text-sm text-white/90">
              <div className="flex items-center gap-1">
                <Building className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate max-w-[150px] xs:max-w-[200px] sm:max-w-[300px]">{room.property_name}</span>
              </div>
              <span className="hidden xs:inline text-white/50">•</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate max-w-[150px] xs:max-w-[200px] sm:max-w-[300px]">{room.property_address}</span>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-3 sm:px-4 py-3 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-3 sm:space-y-4">
            {/* Room Stats Cards - Responsive grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-blue-600 font-medium">Total Beds</p>
                      <p className="text-lg sm:text-2xl font-bold text-blue-700">{room.total_bed}</p>
                    </div>
                    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                      <Bed className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-green-600 font-medium">Available</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-700">{room.total_bed - room.occupied_beds}</p>
                    </div>
                    <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 bg-gradient-to-br from-purple-50 to-white border-purple-100">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-purple-600 font-medium">Rent/Bed</p>
                      <p className="text-base sm:text-xl font-bold text-purple-700">₹{room.rent_per_bed}</p>
                    </div>
                    <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                      <BadgeIndianRupee className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 bg-gradient-to-br from-amber-50 to-white border-amber-100">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-amber-600 font-medium">Occupied</p>
                      <p className="text-lg sm:text-2xl font-bold text-amber-700">{room.occupied_beds}</p>
                    </div>
                    <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Beds Grid */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="pb-2 px-3 sm:px-4 pt-2 sm:pt-3 bg-gradient-to-r from-gray-50 to-white">
                <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <Bed className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-700" />
                  <span>Bed Configuration ({room.total_bed} Beds Total)</span>
                  <Badge className="ml-auto sm:ml-2 bg-blue-100 text-blue-700 border-blue-200 text-[9px] sm:text-xs">
                    ₹{room.rent_per_bed}/bed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {Array.from({ length: room.total_bed }, (_, i) => i + 1).map((bedNumber) => {
                    const bedAssignment = bedAssignments.find(b => b.bed_number === bedNumber);
                    const isOccupied = !!bedAssignment?.tenant_id;
                    const tenantDetail = bedAssignment ? getTenantDetails(bedAssignment.tenant_id) : null;
                    
                    // Get rent from bed_assignment or use room's rent_per_bed
                    const bedRent = bedAssignment?.tenant_rent 
                      ? Number(bedAssignment.tenant_rent) 
                      : room.rent_per_bed;

                    return (
                      <div
                        key={bedNumber}
                        className={`
                          relative p-2 sm:p-3 rounded-xl border-2 transition-all hover:shadow-md
                          ${isOccupied 
                            ? 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200' 
                            : 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200'
                          }
                        `}
                      >
                        {/* Bed Number */}
                        <div className="absolute -top-2 -left-2">
                          <div className={`
                            w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white
                            ${isOccupied ? 'bg-red-500' : 'bg-green-500'}
                          `}>
                            {bedNumber}
                          </div>
                        </div>

                        {/* Bed Content */}
                        <div className="mt-1 sm:mt-2 text-center">
                          <Bed className={`
                            h-5 w-5 sm:h-8 sm:w-8 mx-auto mb-0.5 sm:mb-1
                            ${isOccupied ? 'text-red-500' : 'text-green-500'}
                          `} />
                          
                          {/* Rent Display */}
                          <div className="mt-0.5 sm:mt-1 font-bold text-xs sm:text-sm flex items-center justify-center gap-0.5">
                            <BadgeIndianRupee className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span className="text-[10px] sm:text-xs">{bedRent}</span>
                          </div>

                          {/* Status Badge */}
                          <BedStatusBadge isAvailable={!isOccupied} rent={bedRent} />

                          {/* Tenant Info if occupied */}
                          {isOccupied && tenantDetail && (
                            <div className="mt-1 sm:mt-2 text-[8px] sm:text-[10px] text-left border-t border-red-200 pt-1">
                              <p className="font-semibold truncate">{tenantDetail.full_name}</p>
                              <div className="flex items-center gap-1 text-gray-600">
                                <Calendar className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                                <span className="truncate">{formatAssignmentDate(bedAssignment.created_at)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Room Features and Gender Preferences - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card className="border-2 border-gray-200">
                <CardHeader className="pb-2 px-3 sm:px-4 pt-2 sm:pt-3 bg-gradient-to-r from-gray-50 to-white">
                  <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                    Room Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-1.5 sm:p-2 rounded-lg border flex items-center gap-1.5 sm:gap-2 ${room.has_ac ? 'bg-cyan-50 border-cyan-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className={`p-1 sm:p-1.5 rounded-lg ${room.has_ac ? 'bg-cyan-100' : 'bg-gray-200'}`}>
                        <Snowflake className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${room.has_ac ? 'text-cyan-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium">AC</p>
                        <p className="text-[8px] sm:text-[10px] text-gray-600">{room.has_ac ? 'Available' : 'No'}</p>
                      </div>
                    </div>

                    <div className={`p-1.5 sm:p-2 rounded-lg border flex items-center gap-1.5 sm:gap-2 ${room.has_balcony ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className={`p-1 sm:p-1.5 rounded-lg ${room.has_balcony ? 'bg-amber-100' : 'bg-gray-200'}`}>
                        <Sun className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${room.has_balcony ? 'text-amber-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium">Balcony</p>
                        <p className="text-[8px] sm:text-[10px] text-gray-600">{room.has_balcony ? 'Yes' : 'No'}</p>
                      </div>
                    </div>

                    <div className={`p-1.5 sm:p-2 rounded-lg border flex items-center gap-1.5 sm:gap-2 ${room.has_attached_bathroom ? 'bg-cyan-50 border-cyan-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className={`p-1 sm:p-1.5 rounded-lg ${room.has_attached_bathroom ? 'bg-cyan-100' : 'bg-gray-200'}`}>
                        <Bath className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${room.has_attached_bathroom ? 'text-cyan-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium">Bathroom</p>
                        <p className="text-[8px] sm:text-[10px] text-gray-600">{room.has_attached_bathroom ? 'Attached' : 'Shared'}</p>
                      </div>
                    </div>

                    <div className={`p-1.5 sm:p-2 rounded-lg border flex items-center gap-1.5 sm:gap-2 ${room.allow_couples ? 'bg-pink-50 border-pink-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className={`p-1 sm:p-1.5 rounded-lg ${room.allow_couples ? 'bg-pink-100' : 'bg-gray-200'}`}>
                        <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${room.allow_couples ? 'text-pink-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium">Couples</p>
                        <p className="text-[8px] sm:text-[10px] text-gray-600">{room.allow_couples ? 'Allowed' : 'Not Allowed'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gender Preferences */}
              <Card className="border-2 border-gray-200">
                <CardHeader className="pb-2 px-3 sm:px-4 pt-2 sm:pt-3 bg-gradient-to-r from-gray-50 to-white">
                  <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" />
                    Gender Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {genderPreferences.map((pref: any) => (
                      <Badge 
                        key={pref} 
                        className={`
                          text-[9px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 border-2 font-medium
                          ${pref === 'male_only' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            pref === 'female_only' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                            pref === 'couples' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }
                        `}
                      >
                        <GenderIcon gender={pref} size="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="ml-1">
                          {pref === 'male_only' ? 'Male Only' :
                           pref === 'female_only' ? 'Female Only' :
                           pref === 'couples' ? 'Couples' : pref}
                        </span>
                      </Badge>
                    ))}
                    {genderPreferences.length === 0 && (
                      <span className="text-xs sm:text-sm text-gray-500">No preferences</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Colorful Amenities Section - Updated to show only icon and text with vibrant colors */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="pb-2 px-3 sm:px-4 pt-2 sm:pt-3 bg-gradient-to-r from-gray-50 to-white">
                <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <DoorOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" />
                  Amenities & Facilities
                  {room.amenities && room.amenities.length > 0 && (
                    <Badge className="ml-auto sm:ml-2 bg-indigo-100 text-indigo-700 border-indigo-200 text-[9px] sm:text-xs">
                      {room.amenities.length} Items
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                {room.amenities && room.amenities.length > 0 ? (
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                    {room.amenities.map((amenity: any, index: number) => {
                      const style = getAmenityStyle(amenity);
                      const IconComponent = style.icon;
                      return (
                        <div 
                          key={index} 
                          className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                        >
                          <div className={`p-2 rounded-lg ${style.bg} shadow-md`}>
                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                            {amenity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                    <DoorOpen className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500">No amenities added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Occupants */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="pb-2 px-3 sm:px-4 pt-2 sm:pt-3 bg-gradient-to-r from-gray-50 to-white">
                <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <UsersRound className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" />
                  Current Occupants ({occupiedBeds.length}/{room.total_bed})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                {loadingTenants ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-indigo-600" />
                    <span className="ml-2 text-xs sm:text-sm text-gray-600">Loading tenants...</span>
                  </div>
                ) : errorTenants ? (
                  <div className="bg-red-50 p-3 sm:p-4 rounded-lg text-center border-2 border-red-200">
                    <p className="text-xs sm:text-sm text-red-600">{errorTenants}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2 h-7 sm:h-8 text-xs"
                      onClick={loadAllTenants}
                    >
                      Retry
                    </Button>
                  </div>
                ) : occupiedBeds.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {occupiedBeds.map((bed: BedAssignment, index: number) => {
                      const tenantDetail = getTenantDetails(bed.tenant_id);
                      const assignmentDate = bed.created_at;
                      const formattedDate = formatAssignmentDate(assignmentDate);
                      
                      return (
                        <div 
                          key={bed.id || index}
                          className="p-2 sm:p-3 rounded-xl border-2 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-2 mb-1 sm:mb-2">
                            <div className="p-1 sm:p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                              <Bed className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </div>
                            <span className="font-bold text-xs sm:text-sm">Bed #{bed.bed_number}</span>
                            <Badge variant="outline" className="ml-auto text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0 bg-white">
                              Occupied
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-1 sm:gap-2 mt-1 sm:mt-2 text-[10px] sm:text-xs">
                            <div>
                              <p className="font-semibold text-xs sm:text-sm">
                                {tenantDetail?.full_name || bed.tenant_name || 'Unknown'}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <GenderIcon gender={tenantDetail?.gender || bed.tenant_gender || 'other'} size="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span className="text-[9px] sm:text-xs capitalize">
                                  {tenantDetail?.gender || bed.tenant_gender || 'N/A'}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              {tenantDetail?.phone && (
                                <div className="flex items-center gap-1 text-[9px] sm:text-xs text-gray-600">
                                  <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                                  <span className="truncate">{tenantDetail.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 sm:mt-3 pt-1 sm:pt-2 border-t border-gray-200 grid grid-cols-2 gap-1 sm:gap-2 text-[8px] sm:text-xs">
                            <div className="bg-purple-50 p-1 sm:p-2 rounded-lg">
                              <p className="text-purple-600 text-[7px] sm:text-[10px] font-medium">Rent</p>
                              <p className="font-bold text-purple-700 flex items-center">
                                <BadgeIndianRupee className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5" />
                                {bed.tenant_rent || room.rent_per_bed}
                              </p>
                            </div>
                            <div className="bg-blue-50 p-1 sm:p-2 rounded-lg">
                              <p className="text-blue-600 text-[7px] sm:text-[10px] font-medium">Since</p>
                              <p className="font-semibold text-blue-700 flex items-center text-[8px] sm:text-xs">
                                <Calendar className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5" />
                                {formattedDate}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                    <UserRound className="h-6 w-6 sm:h-10 sm:w-10 mx-auto text-gray-400 mb-2" />
                    <span className="text-xs sm:text-sm text-gray-500">No occupants</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {room.description && (
              <Card className="border-2 border-gray-200">
                <CardHeader className="pb-2 px-3 sm:px-4 pt-2 sm:pt-3 bg-gradient-to-r from-gray-50 to-white">
                  <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {room.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Media Information */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="pb-2 px-3 sm:px-4 pt-2 sm:pt-3 bg-gradient-to-r from-gray-50 to-white">
                <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                  Media Gallery
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                        <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-blue-700">Photos</p>
                        <p className="text-xs sm:text-sm font-bold text-blue-800">{room.photo_urls?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  {room.video_url && (
                    <div className="p-2 sm:p-3 bg-red-50 rounded-xl border-2 border-red-200">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
                          <Video className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs font-medium text-red-700">Video</p>
                          <p className="text-[8px] sm:text-xs font-semibold text-red-800 truncate max-w-[80px] sm:max-w-[100px]">
                            {room.video_label || 'Tour'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-white border-t px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}