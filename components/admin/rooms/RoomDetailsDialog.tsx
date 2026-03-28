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

// Amenity definitions with soft pastel circle bg colors (like reference image)
const AMENITIES_WITH_COLORS = [
  { id: 'wifi', label: 'WiFi', icon: Wifi, circleBg: 'bg-blue-100', iconColor: 'text-blue-500' },
  { id: 'tv', label: 'TV', icon: Tv, circleBg: 'bg-purple-100', iconColor: 'text-purple-500' },
  { id: 'ac', label: 'AC', icon: Snowflake, circleBg: 'bg-cyan-100', iconColor: 'text-cyan-500' },
  { id: 'fan', label: 'Fan', icon: Fan, circleBg: 'bg-sky-100', iconColor: 'text-sky-500' },
  { id: 'geyser', label: 'Geyser', icon: Thermometer, circleBg: 'bg-red-100', iconColor: 'text-red-500' },
  { id: 'fridge', label: 'Refrigerator', icon: Refrigerator, circleBg: 'bg-slate-100', iconColor: 'text-slate-600' },
  { id: 'bed', label: 'Bed', icon: Bed, circleBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { id: 'wardrobe', label: 'Wardrobe', icon: DoorOpen, circleBg: 'bg-stone-100', iconColor: 'text-stone-600' },
  { id: 'study table', label: 'Study Table', icon: BookOpen, circleBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { id: 'chair', label: 'Chair', icon: Armchair, circleBg: 'bg-orange-100', iconColor: 'text-orange-500' },
  { id: 'lamp', label: 'Study Lamp', icon: Lamp, circleBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  { id: 'curtains', label: 'Curtains', icon: Sunset, circleBg: 'bg-indigo-100', iconColor: 'text-indigo-500' },
  { id: 'kitchen', label: 'Kitchen', icon: CookingPot, circleBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  { id: 'dining', label: 'Dining', icon: Utensils, circleBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { id: 'microwave', label: 'Microwave', icon: Coffee, circleBg: 'bg-stone-100', iconColor: 'text-stone-600' },
  { id: 'cleaning', label: 'Cleaning', icon: Sparkles, circleBg: 'bg-teal-100', iconColor: 'text-teal-500' },
  { id: 'laundry', label: 'Laundry', icon: Droplets, circleBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { id: 'security', label: 'Security', icon: Shield, circleBg: 'bg-red-100', iconColor: 'text-red-500' },
  { id: 'parking', label: 'Parking', icon: Car, circleBg: 'bg-green-100', iconColor: 'text-green-600' },
  { id: 'power backup', label: 'Power Backup', icon: Factory, circleBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  { id: 'gym', label: 'Gym', icon: Dumbbell, circleBg: 'bg-lime-100', iconColor: 'text-lime-600' },
  { id: 'garden', label: 'Garden', icon: TreePine, circleBg: 'bg-green-100', iconColor: 'text-green-600' },
  { id: 'terrace', label: 'Terrace', icon: Mountain, circleBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { id: 'swimming pool', label: 'Swimming Pool', icon: Waves, circleBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { id: 'game zone', label: 'Game Zone', icon: Gamepad, circleBg: 'bg-violet-100', iconColor: 'text-violet-600' },
  { id: 'music room', label: 'Music Room', icon: Music, circleBg: 'bg-fuchsia-100', iconColor: 'text-fuchsia-600' },
  { id: 'theatre', label: 'Home Theatre', icon: Headphones, circleBg: 'bg-rose-100', iconColor: 'text-rose-500' },
  { id: 'balcony', label: 'Balcony', icon: Sun, circleBg: 'bg-amber-100', iconColor: 'text-amber-500' },
  { id: 'attached bathroom', label: 'Attached Bathroom', icon: Bath, circleBg: 'bg-cyan-100', iconColor: 'text-cyan-600' },
  { id: 'smoking', label: 'Smoking Allowed', icon: Cigarette, circleBg: 'bg-stone-100', iconColor: 'text-stone-600' },
  { id: 'pet friendly', label: 'Pet Friendly', icon: Dog, circleBg: 'bg-amber-100', iconColor: 'text-amber-600' },
];

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

const BedStatusBadge = ({ isAvailable, rent }: { isAvailable: boolean; rent?: number }) => {
  if (isAvailable) {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 text-[9px] px-1.5 py-0">
        <CheckCircle className="h-2 w-2 mr-0.5" />
        Available
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-700 border-red-200 text-[9px] px-1.5 py-0">
      <XCircle className="h-2 w-2 mr-0.5" />
      Occupied
    </Badge>
  );
};

export function RoomDetailsDialog({ room, open, onOpenChange }: RoomDetailsDialogProps) {
  const [tenants, setTenants] = useState<TenantDetails[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [errorTenants, setErrorTenants] = useState<string | null>(null);
  const [bedAssignments, setBedAssignments] = useState<BedAssignment[]>([]);

  useEffect(() => {
    if (room?.bed_assignments) {
      setBedAssignments(room.bed_assignments);
    }
  }, [room]);

  const YesNoIcon = ({ value }: { value: boolean }) => {
    return value ? (
      <CheckCircle className="h-3 w-3 text-green-600" />
    ) : (
      <XCircle className="h-3 w-3 text-red-500" />
    );
  };

  const genderPreferences = Array.isArray(room.room_gender_preference) 
    ? room.room_gender_preference 
    : [room.room_gender_preference];

  const occupiedBeds = bedAssignments?.filter((bed: BedAssignment) => bed.tenant_id) || [];

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

  const getTenantDetails = (tenantId: number) => {
    return tenants.find(t => t.id === tenantId);
  };

  const formatAssignmentDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return 'N/A'; }
  };

  const getDaysSinceAssignment = (dateString: string) => {
    if (!dateString) return null;
    try {
      const assignmentDate = new Date(dateString);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - assignmentDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch { return null; }
  };

  const getAmenityStyle = (amenityName: string) => {
    const lowerName = amenityName.toLowerCase();
    const found = AMENITIES_WITH_COLORS.find(a =>
      lowerName.includes(a.id) || a.label.toLowerCase() === lowerName
    );
    return found || {
      id: 'default',
      label: amenityName,
      icon: Sparkles,
      circleBg: 'bg-gray-100',
      iconColor: 'text-gray-500'
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[calc(100vw-1.5rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-hidden p-0 border-0 flex flex-col rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 bg-white/20 rounded-lg flex-shrink-0">
                <Eye className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-bold leading-tight">Room {room.room_number}</span>
                  <Badge className="bg-white/20 text-white border-white/30 text-[9px] px-1.5 py-0 h-4">
                    {room.is_active ? '● Active' : '○ Inactive'}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30 text-[9px] px-1.5 py-0 h-4">
                    {room.sharing_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/80 mt-0.5">
                  <Building className="h-2.5 w-2.5 flex-shrink-0" />
                  <span className="truncate">{room.property_name}</span>
                  <span className="text-white/50">•</span>
                  <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                  <span className="truncate max-w-[140px]">{room.property_address}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 ml-2"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="px-2.5 py-2 overflow-y-auto flex-1 min-h-0 space-y-2">

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: 'Total Beds', value: room.total_bed, icon: Bed, bg: 'bg-blue-50', border: 'border-blue-100', textColor: 'text-blue-700', iconColor: 'text-blue-500' },
              { label: 'Available', value: room.total_bed - room.occupied_beds, icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-100', textColor: 'text-green-700', iconColor: 'text-green-500' },
              { label: 'Occupied', value: room.occupied_beds, icon: Users, bg: 'bg-amber-50', border: 'border-amber-100', textColor: 'text-amber-700', iconColor: 'text-amber-500' },
              { label: 'Rent/Bed', value: `₹${room.rent_per_bed}`, icon: BadgeIndianRupee, bg: 'bg-purple-50', border: 'border-purple-100', textColor: 'text-purple-700', iconColor: 'text-purple-500' },
            ].map(({ label, value, icon: Icon, bg, border, textColor, iconColor }) => (
              <div key={label} className={`${bg} border ${border} rounded-xl p-2`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-[7px] font-medium ${textColor} leading-tight`}>{label}</p>
<p className={`text-xs sm:text-xs font-bold ${textColor} leading-tight mt-0.5 truncate`}>{value}</p>          
        </div>
                  <Icon className={`h-3 w-3 ${iconColor} flex-shrink-0`} />
                </div>
              </div>
            ))}
          </div>

          {/* Beds Grid */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-2.5 py-1.5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <Bed className="h-3 w-3 text-gray-600" />
                <span className="text-[10px] font-semibold text-gray-700">Bed Configuration</span>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[9px] px-1.5 py-0">
                {room.total_bed} Beds • ₹{room.rent_per_bed}/bed
              </Badge>
            </div>
            <div className="p-2">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
                {Array.from({ length: room.total_bed }, (_, i) => i + 1).map((bedNumber) => {
                  const bedAssignment = bedAssignments.find(b => b.bed_number === bedNumber);
                  const isOccupied = !!bedAssignment?.tenant_id;
                  const tenantDetail = bedAssignment ? getTenantDetails(bedAssignment.tenant_id) : null;
                  const bedRent = bedAssignment?.tenant_rent ? Number(bedAssignment.tenant_rent) : room.rent_per_bed;

                  return (
                    <div
                      key={bedNumber}
                      className={`relative p-2 rounded-xl border text-center transition-all hover:shadow-sm
                        ${isOccupied ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
                    >
                      {/* Bed number pill */}
                      <div className={`absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white
                        ${isOccupied ? 'bg-red-500' : 'bg-green-500'}`}>
                        {bedNumber}
                      </div>
                      <Bed className={`h-4 w-4 mx-auto mb-0.5 ${isOccupied ? 'text-red-400' : 'text-green-500'}`} />
                      <div className="text-[9px] font-semibold flex items-center justify-center gap-0.5 mb-0.5">
                        <span>₹{bedRent}</span>
                      </div>
                      <BedStatusBadge isAvailable={!isOccupied} />
                      {isOccupied && tenantDetail && (
                        <div className="mt-1 text-[8px] text-left border-t border-red-200 pt-1">
                          <p className="font-semibold truncate text-gray-700">{tenantDetail.full_name}</p>
                          <p className="text-gray-500 truncate">{formatAssignmentDate(bedAssignment.created_at)}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Features + Gender row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Room Features */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-2.5 py-1.5 border-b border-gray-100 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-purple-500" />
                <span className="text-[10px] font-semibold text-gray-700">Room Features</span>
              </div>
              <div className="p-2 grid grid-cols-2 gap-1.5">
                {[
                  { key: 'has_ac', label: 'AC', sub: room.has_ac ? 'Available' : 'No', icon: Snowflake, activeColor: 'text-cyan-600', activeBg: 'bg-cyan-50 border-cyan-200' },
                  { key: 'has_balcony', label: 'Balcony', sub: room.has_balcony ? 'Yes' : 'No', icon: Sun, activeColor: 'text-amber-600', activeBg: 'bg-amber-50 border-amber-200' },
                  { key: 'has_attached_bathroom', label: 'Bathroom', sub: room.has_attached_bathroom ? 'Attached' : 'Shared', icon: Bath, activeColor: 'text-cyan-600', activeBg: 'bg-cyan-50 border-cyan-200' },
                  { key: 'allow_couples', label: 'Couples', sub: room.allow_couples ? 'Allowed' : 'No', icon: Heart, activeColor: 'text-pink-600', activeBg: 'bg-pink-50 border-pink-200' },
                ].map(({ key, label, sub, icon: Icon, activeColor, activeBg }) => {
                  const active = (room as any)[key];
                  return (
                    <div key={key} className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${active ? activeBg : 'bg-gray-50 border-gray-200'}`}>
                      <div className={`p-1 rounded-md ${active ? 'bg-white/70' : 'bg-gray-200'}`}>
                        <Icon className={`h-3 w-3 ${active ? activeColor : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="text-[9px] font-semibold text-gray-700 leading-tight">{label}</p>
                        <p className="text-[8px] text-gray-500 leading-tight">{sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gender Preferences */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-2.5 py-1.5 border-b border-gray-100 flex items-center gap-1.5">
                <Users className="h-3 w-3 text-indigo-500" />
                <span className="text-[10px] font-semibold text-gray-700">Gender Preferences</span>
              </div>
              <div className="p-2">
                <div className="flex flex-wrap gap-1.5">
                  {genderPreferences.map((pref: any) => (
                    <Badge
                      key={pref}
                      className={`text-[9px] px-2 py-1 border font-medium flex items-center gap-1
                        ${pref === 'male_only' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          pref === 'female_only' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                          pref === 'couples' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'}`}
                    >
                      <GenderIcon gender={pref} size="h-3 w-3" />
                      {pref === 'male_only' ? 'Male Only' :
                       pref === 'female_only' ? 'Female Only' :
                       pref === 'couples' ? 'Couples' : pref}
                    </Badge>
                  ))}
                  {genderPreferences.length === 0 && (
                    <span className="text-[10px] text-gray-400">No preferences set</span>
                  )}
                </div>

                {/* Floor & Type info */}
                <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 gap-1.5">
                  <div className="bg-slate-50 rounded-lg p-1.5">
                    <p className="text-[8px] text-slate-500 font-medium uppercase tracking-wide">Floor</p>
                    <p className="text-[10px] font-semibold text-slate-700">{room.floor || 'Ground'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-1.5">
                    <p className="text-[8px] text-slate-500 font-medium uppercase tracking-wide">Room Type</p>
                    <p className="text-[10px] font-semibold text-slate-700 capitalize">{room.room_type || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Amenities — circle icon + label style (like reference) ── */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-2.5 py-1.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <DoorOpen className="h-3 w-3 text-indigo-500" />
                  <span className="text-[10px] font-semibold text-gray-700">Amenities & Facilities</span>
                </div>
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[9px] px-1.5 py-0">
                  {room.amenities.length} items
                </Badge>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-x-2 gap-y-3">
                  {room.amenities.map((amenity: any, index: number) => {
                    const style = getAmenityStyle(amenity);
                    const IconComponent = style.icon;
                    return (
                      <div key={index} className="flex flex-col items-center gap-1.5 group">
                        {/* Circle icon — matches reference image */}
                        <div className={`w-11 h-11 rounded-full ${style.circleBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                          <IconComponent className={`h-5 w-5 ${style.iconColor}`} />
                        </div>
                        {/* Label */}
                        <span className="text-[9px] font-medium text-gray-600 text-center leading-tight line-clamp-2 w-full">
                          {amenity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Current Occupants */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-2.5 py-1.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <UsersRound className="h-3 w-3 text-indigo-500" />
                <span className="text-[10px] font-semibold text-gray-700">
                  Current Occupants ({occupiedBeds.length}/{room.total_bed})
                </span>
              </div>
            </div>
            <div className="p-2">
              {loadingTenants ? (
                <div className="flex items-center justify-center py-5">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  <span className="ml-2 text-xs text-gray-500">Loading...</span>
                </div>
              ) : errorTenants ? (
                <div className="bg-red-50 p-2.5 rounded-lg text-center border border-red-200">
                  <p className="text-xs text-red-600">{errorTenants}</p>
                  <Button variant="outline" size="sm" className="mt-1.5 h-6 text-[10px]" onClick={loadAllTenants}>
                    Retry
                  </Button>
                </div>
              ) : occupiedBeds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {occupiedBeds.map((bed: BedAssignment, index: number) => {
                    const tenantDetail = getTenantDetails(bed.tenant_id);
                    const formattedDate = formatAssignmentDate(bed.created_at);
                    return (
                      <div
                        key={bed.id || index}
                        className="p-2 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="p-1 rounded-md bg-indigo-100">
                            <Bed className="h-2.5 w-2.5 text-indigo-600" />
                          </div>
                          <span className="font-semibold text-[10px] text-gray-700">Bed {bed.bed_number}</span>
                          {Boolean(bed.is_couple) && (
                            <Badge className="ml-auto text-[8px] px-1 py-0 bg-red-50 text-red-600 border-red-200">Couple</Badge>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <p className="font-semibold text-xs text-gray-800 truncate">
                            {tenantDetail?.full_name || bed.tenant_name || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-1">
                            <GenderIcon gender={tenantDetail?.gender || bed.tenant_gender || 'other'} size="h-2.5 w-2.5" />
                            <span className="text-[9px] text-gray-500 capitalize">
                              {tenantDetail?.gender || bed.tenant_gender || 'N/A'}
                            </span>
                            {tenantDetail?.phone && (
                              <>
                                <span className="text-gray-300">•</span>
                                <Phone className="h-2.5 w-2.5 text-gray-400" />
                                <span className="text-[9px] text-gray-500">{tenantDetail.phone}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-0.5">
                            <BadgeIndianRupee className="h-2.5 w-2.5 text-purple-500" />
                            <span className="text-[9px] font-bold text-purple-700">{bed.tenant_rent || room.rent_per_bed}</span>
                            <span className="text-[8px] text-gray-400">/mo</span>
                          </div>
                          <div className="flex items-center gap-0.5 text-[9px] text-gray-500">
                            <Calendar className="h-2.5 w-2.5" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <UserRound className="h-6 w-6 mx-auto text-gray-300 mb-1" />
                  <span className="text-xs text-gray-400">No occupants currently</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {room.description && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-2.5 py-1.5 border-b border-gray-100 flex items-center gap-1.5">
                <Pencil className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] font-semibold text-gray-700">Description</span>
              </div>
              <div className="p-2.5">
                <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{room.description}</p>
              </div>
            </div>
          )}

          {/* Media */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-2.5 py-1.5 border-b border-gray-100 flex items-center gap-1.5">
              <ImageIcon className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] font-semibold text-gray-700">Media Gallery</span>
            </div>
            <div className="p-2">
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                  <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                  <div>
                    <p className="text-[9px] font-medium text-blue-700">Photos</p>
                    <p className="text-xs font-bold text-blue-800">{room.photo_urls?.length || 0}</p>
                  </div>
                </div>
                {room.video_url && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 rounded-lg border border-red-100">
                    <Video className="h-3.5 w-3.5 text-red-500" />
                    <div>
                      <p className="text-[9px] font-medium text-red-700">Video</p>
                      <p className="text-[9px] font-semibold text-red-800 truncate max-w-[80px]">
                        {room.video_label || 'Tour'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="border-t border-gray-100 bg-white px-3 py-2 flex-shrink-0 flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-7 text-[11px] px-4"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}