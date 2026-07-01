// components/admin/rooms/side-filter.tsx - Updated with Available From filter

"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Filter, X, Bath, Sun, Wind, Heart, Building2, RefreshCw,
  DoorOpen, Users2, Wifi, Coffee, Car, Shield, Zap, Bed, Home, Layers, Check, Calendar, Clock,
  Loader2
} from 'lucide-react';
import { consumeMasters } from "@/lib/masterApi";
import { getActiveNoticePeriods } from "@/lib/noticePeriodApi";

// ---------- TYPES ----------
interface SimpleRoom {
  id: number;
  property_id: number;
  total_bed: number;
  occupied_beds: number;
  floor?: any;
}

interface SideFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilterChange: (filters: FilterState) => void;
  hideTrigger?: boolean;
  rooms?: SimpleRoom[];
  onSelectVacatingBed?: (bedAssignmentId: number, roomId: number) => void;
}

interface FilterState {
  search: string;
  property_ids: string[];
  room_types: string[];
  gender_preferences: string[];
  amenities: string[];
  floors: string[];
  has_attached_bathroom: boolean | undefined;
  has_balcony: boolean | undefined;
  has_ac: boolean | undefined;
  allow_couples: boolean | undefined;
  min_rent: number;
  max_rent: number;
  min_capacity: number;
  max_capacity: number;
  is_active: boolean;
  available_from_date: string;
  available_to_date: string;
availability_status?: 'any' | 'available' | 'partial' | 'full' | '';  }

interface VacatingSoonItem {
  bed_assignment_id: number;
  room_id: number;
  bed_number: number;
  room_number: string;
  tenant_name: string;
  vacate_date: string;
  vacate_status: string;
  source: 'vacate_request' | 'notice_period';
  notice_id?: number;
  title?: string;
}

interface FilterData {
  roomTypes: Array<{ value: string; label: string; count: number; totalBeds: number }>;
  genderPreferences: Array<{ value: string; label: string; count: number }>;
  properties: Array<{ id: string; name: string; address: string; roomCount: number }>;
  amenities: Array<{ value: string; label: string; count: number; icon?: any }>;
  masterRoomTypes: Array<{ id: number; name: string }>;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  property_ids: [],
  room_types: [],
  gender_preferences: [],
  amenities: [],
  floors: [],
  has_attached_bathroom: undefined,
  has_balcony: undefined,
  has_ac: undefined,
  allow_couples: undefined,
  min_rent: 0,
  max_rent: 100000,
  min_capacity: 1,
  max_capacity: 10,
  is_active: true,
availability_status: '',};

const colors = { primary: '#004ab0', secondary: '#f9bd07' };

export default function SideFilter({ 
  open, 
  onOpenChange, 
  onFilterChange, 
  hideTrigger = false, 
  rooms = [], 
  onSelectVacatingBed 
}: SideFilterProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterData, setFilterData] = useState<FilterData>({
    roomTypes: [], genderPreferences: [], properties: [], amenities: [], masterRoomTypes: []
  });
  const [masterRoomTypes, setMasterRoomTypes] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  
  // Available From filter state
  const [availableFromDate, setAvailableFromDate] = useState<string>("");
const [availableToDate, setAvailableToDate] = useState<string>("");
  const [vacatingSoonBeds, setVacatingSoonBeds] = useState<VacatingSoonItem[]>([]);  const [loadingVacating, setLoadingVacating] = useState(false);

  // Feature options
  const featureOptions = [
    { id: 'has_attached_bathroom', label: 'Attached Bathroom', icon: Bath },
    { id: 'has_balcony', label: 'Balcony', icon: Sun },
    { id: 'has_ac', label: 'AC', icon: Wind },
    { id: 'allow_couples', label: 'Couples Allowed', icon: Heart },
  ];

 const availableFloors = useMemo(() => {
    const floorsSet = new Set<string>();
    const propertyId = filters.property_ids[0];
    const targetRooms = propertyId
      ? rooms.filter(r => String(r.property_id) === propertyId)
      : rooms;
    targetRooms.forEach(room => {
      if (room.floor !== undefined && room.floor !== null) {
        floorsSet.add(String(room.floor));
      }
    });
    return Array.from(floorsSet).sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, ''), 10);
      const numB = parseInt(b.replace(/[^0-9]/g, ''), 10);
      return isNaN(numA) || isNaN(numB) ? a.localeCompare(b) : numA - numB;
    });
  }, [rooms]);

  // Rooms filtered by property only (for room type / sharing type counts)
const roomsFilteredByProperty = useMemo(() => {
  const propertyId = filters.property_ids[0];
  return propertyId ? rooms.filter(r => String(r.property_id) === propertyId) : rooms;
}, [rooms, filters.property_ids, (filters as any).sharing_types, filters.room_types]);

// Rooms filtered by property + sharing_type (for gender counts)
const roomsFilteredByPropertyAndSharing = useMemo(() => {
  const sharingTypes = (filters as any).sharing_types as string[] | undefined;
  if (!sharingTypes?.length) return roomsFilteredByProperty;
  return roomsFilteredByProperty.filter(r => sharingTypes.includes((r as any).sharing_type));
}, [roomsFilteredByProperty, filters]);

// Rooms filtered by property + sharing + room_type (for gender counts)
const roomsFilteredByPropertySharingAndRoomType = useMemo(() => {
  const roomTypes = filters.room_types;
  if (!roomTypes?.length) return roomsFilteredByPropertyAndSharing;
  return roomsFilteredByPropertyAndSharing.filter(r => 
    roomTypes.includes(r.room_type) || roomTypes.includes((r as any).sharing_type)
  );
}, [roomsFilteredByPropertyAndSharing, filters.room_types]);

const coupleRoomsCount = useMemo(() => {
  return roomsFilteredByPropertySharingAndRoomType.filter((r: any) => {
    const prefs = Array.isArray(r.room_gender_preference) ? r.room_gender_preference : [];
    return prefs.includes('couples') || prefs.includes('couple') || Boolean(r.allow_couples) === true;
  }).length;
}, [roomsFilteredByPropertySharingAndRoomType]);

  useEffect(() => {
    fetchFilterData();
    consumeMasters({ tab: 'Rooms' }).then(res => {
      if (res?.success && res.data) {
        const types = res.data.filter((item: any) => item.type_name === 'Room Type')
          .map((item: any) => ({ id: item.value_id, name: item.value_name }));
        setMasterRoomTypes(types);
      }
    }).catch(console.error);
  }, []);

  const fetchFilterData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rooms/filters/data');
      const result = await response.json();
      if (result.success) {
        const amenitiesWithIcons = result.data.amenities.map((a: any, idx: number) => ({
          ...a,
          icon: [Wifi, Coffee, Car, Shield, Zap, Users2, Home][idx % 7]
        }));
        setFilterData({ ...result.data, amenities: amenitiesWithIcons });
      }
    } catch (error) {
      console.error('Error fetching filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Availability counts
  const availabilityCounts = useMemo(() => {
  const propertyId = filters.property_ids[0];
  const targetRooms = propertyId
    ? rooms.filter(r => String(r.property_id) === propertyId)
    : rooms;

  let empty = 0;      // completely empty (occupied === 0)
  let partial = 0;    // partially occupied (0 < occupied < total)

  for (const room of targetRooms) {
    const occupied = Number(room.occupied_beds) || 0;
    const total = Number(room.total_bed) || 0;
    if (occupied === 0) {
      empty++;
    } else if (occupied < total) {
      partial++;
    }
  }

  return {
    available: empty + partial,  // any room with at least one free bed
    partial: partial,
    full: empty,                 // "Full" means completely empty (as per your requirement)
  };
}, [rooms, filters.property_ids]);


const totalRooms = useMemo(() => {
  const propertyId = filters.property_ids[0];
  const targetRooms = propertyId
    ? rooms.filter(r => String(r.property_id) === propertyId)
    : rooms;
  // Count rooms that have at least one empty bed
  return targetRooms.filter(room => room.occupied_beds < room.total_bed).length;
}, [rooms, filters.property_ids]);
  // Property summary
  const propertyStats = useMemo(() => {
    const propertyId = filters.property_ids[0];
    if (!propertyId) return null;
    const targetRooms = rooms.filter(r => String(r.property_id) === propertyId);
    const totalRooms = targetRooms.length;
    const totalBeds = targetRooms.reduce((sum, r) => sum + (r.total_bed || 0), 0);
    const occupiedBeds = targetRooms.reduce((sum, r) => sum + (r.occupied_beds || 0), 0);
    const availableBeds = totalBeds - occupiedBeds;
    return { totalRooms, totalBeds, availableBeds };
  }, [rooms, filters.property_ids]);

  // Filter handlers
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSelectChange = (key: 'property_ids' | 'room_types' | 'gender_preferences' | 'amenities' | 'floors', value: string) => {
    handleFilterChange(key, (!value || value === 'all') ? [] : [value]);
  };

  const handleFeatureToggle = (featureId: string) => {
    const key = featureId as keyof Pick<FilterState, 'has_attached_bathroom' | 'has_balcony' | 'has_ac' | 'allow_couples'>;
    const curr = filters[key];
    handleFilterChange(key, curr === undefined ? true : curr === true ? false : undefined);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
    setAvailableFromDate("");
    setVacatingSoonBeds([]);
    setAvailableToDate("");

  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.property_ids.length) count++;
    if (filters.room_types.length) count++;
        if ((filters as any).sharing_types?.length) count++;

    if (filters.gender_preferences.length) count++;
    if (filters.amenities.length) count++;
    if (filters.floors.length) count++;
    if (filters.has_attached_bathroom !== undefined) count++;
    if (filters.has_balcony !== undefined) count++;
    if (filters.has_ac !== undefined) count++;
    if (filters.allow_couples !== undefined) count++;
    if (filters.min_rent > 0 || filters.max_rent < 100000) count++;
if (filters.availability_status && filters.availability_status !== 'any') count++;
    if (availableFromDate) count++;
    return count;
  }, [filters, availableFromDate]);

  // ─── Load both vacate requests AND active notice-period requests ───────────
// ─── Load both vacate requests AND active notice-period requests, within a date range ───
const loadVacatingSoonBeds = async (fromDate: string, toDate: string) => {
  if (!fromDate && !toDate) {
    setVacatingSoonBeds([]);
    return;
  }
  setLoadingVacating(true);
  try {
    const propertyId = filters.property_ids[0];
    const token = localStorage.getItem("auth_token") || localStorage.getItem("admin_token");

    // ── Build the date range. If only "From" is given, treat it as a single-day
    // lookup (range end = same day). If only "To" is given, range starts from today. ──
    const rangeStart = fromDate ? new Date(fromDate) : new Date();
    rangeStart.setHours(0, 0, 0, 0);

    const rangeEnd = toDate ? new Date(toDate) : new Date(fromDate || toDate);
    rangeEnd.setHours(23, 59, 59, 999);

    const isInRange = (dateStr: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= rangeStart && d <= rangeEnd;
    };

    // ── 1. Vacate requests ───────────────────────────────────────────────
    const vacateParams = new URLSearchParams();
    if (propertyId) vacateParams.append('property_id', propertyId);
    vacateParams.append('limit', '100');

    const vacateResponse = await fetch(
      `/api/admin/vacate-requests?${vacateParams.toString()}`,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    const vacateResult = await vacateResponse.json();

    let fromVacateRequests: VacatingSoonItem[] = [];
    if (vacateResult.success && Array.isArray(vacateResult.data)) {
      fromVacateRequests = vacateResult.data
        .filter((req: any) => {
          if (!req.expected_vacate_date) return false;
          const skipStatuses = ['completed', 'cancelled', 'rejected'];
          if (skipStatuses.includes(req.vacate_status)) return false;
          if (req.is_available === true || req.is_available === 1) return false;
          return isInRange(req.expected_vacate_date);
        })
        .map((req: any) => ({
          bed_assignment_id: req.bed_id,
          room_id: req.room_id,
          bed_number: req.bed_number,
          room_number: req.room_number,
          tenant_name: req.tenant_name,
          vacate_date: req.expected_vacate_date,
          vacate_status: req.vacate_status,
          source: 'vacate_request' as const,
        }));
    }

    // ── 2. Active notice-period requests ─────────────────────────────────
    let fromNoticePeriods: VacatingSoonItem[] = [];
    try {
      const noticeResult = await getActiveNoticePeriods(propertyId);
      if (noticeResult.success && Array.isArray(noticeResult.data)) {
        fromNoticePeriods = noticeResult.data
          .filter((n) => isInRange(n.notice_period_date))
          .map((n) => ({
            bed_assignment_id: n.bed_assignment_id,
            room_id: n.room_id,
            bed_number: n.bed_number,
            room_number: n.room_number,
            tenant_name: n.tenant_name,
            vacate_date: n.notice_period_date,
            vacate_status: 'notice_pending',
            source: 'notice_period' as const,
          }));
      }
    } catch (noticeErr) {
      console.error("Error loading notice periods:", noticeErr);
    }

    // ── Merge, de-duplicating by bed_assignment_id ───────────────────────
    // If a bed already has an explicit vacate request, prefer that over the
    // notice-period entry (it's the more advanced/authoritative state).
    // ── Merge — show both vacate requests and notice periods, even for the same bed ──
const merged: VacatingSoonItem[] = [...fromVacateRequests, ...fromNoticePeriods];
merged.sort((a, b) => new Date(a.vacate_date).getTime() - new Date(b.vacate_date).getTime());


    console.log('🔍 Merged vacating/notice beds:', merged);
    setVacatingSoonBeds(merged);
  } catch (err) {
    console.error("Error loading vacating beds:", err);
  } finally {
    setLoadingVacating(false);
  }
};

useEffect(() => {
  loadVacatingSoonBeds(availableFromDate, availableToDate);
}, [availableFromDate, availableToDate, filters.property_ids]);

  // Active features for badge display
  const activeFeatures = featureOptions.filter(f => filters[f.id as keyof FilterState] === true);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative" style={{ borderColor: colors.primary, color: colors.primary }}>
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-[10px]" style={{ backgroundColor: colors.secondary }}>
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
      )}

      <SheetContent side="right" className="p-0 w-[90vw] sm:w-[400px] lg:max-w-md">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-4 border-b" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #003d8c 100%)`, color: 'white' }}>
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-white">
                <Filter className="h-5 w-5" style={{ color: colors.secondary }} />
                <span>Filter Rooms</span>
                {activeFilterCount > 0 && (
                  <Badge style={{ backgroundColor: colors.secondary, color: '#000' }}>{activeFilterCount} active</Badge>
                )}
              </SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-5">

             

              {/* 2-column grid for dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Property */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Property
                  </Label>
                  <Select value={filters.property_ids[0] || 'all'} onValueChange={(v) => handleSelectChange('property_ids', v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All Properties" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {filterData.properties.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          <div className="flex justify-between w-full items-center gap-2">
                            <span className="text-xs">{p.name}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5">{p.roomCount}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Room Type */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium flex items-center gap-1">
                    <DoorOpen className="h-3 w-3" /> Room Type
                  </Label>
                  <Select value={filters.room_types[0] || 'all'} onValueChange={(v) => handleSelectChange('room_types', v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
{(masterRoomTypes.length ? masterRoomTypes : filterData.roomTypes).map(type => {
  const label = typeof type === 'object' && 'name' in type ? type.name : (type as any).label;
  
  // Count from property-filtered rooms
  const dynamicCount = roomsFilteredByProperty.filter(
    r => r.room_type === label
  ).length;
  
  return (
    <SelectItem key={(type as any).id || label} value={label}>
      <div className="flex justify-between w-full items-center gap-2">
        <span className="text-xs">{label}</span>
        <Badge variant="outline" className="text-[10px] px-1.5">{dynamicCount}</Badge>
      </div>
    </SelectItem>
  );
})}
                    </SelectContent>
                  </Select>
                </div>
                 {/* Sharing Type */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium flex items-center gap-1">
                    <DoorOpen className="h-3 w-3" /> Sharing Type
                  </Label>
                   <Select value={filters.sharing_types?.[0] || 'all'} onValueChange={(v) => handleSelectChange('sharing_types' as any, v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                   {filterData.roomTypes.map(type => {
  // Count from property-filtered rooms
  const dynamicCount = roomsFilteredByProperty.filter(
    r => String((r as any).sharing_type) === String(type.value)
  ).length;
  
  return (
    <SelectItem key={type.value} value={type.value}>
      <div className="flex justify-between w-full items-center gap-2">
        <span className="text-xs capitalize">{type.label}</span>
        <Badge variant="outline" className="text-[10px] px-1.5">{dynamicCount}</Badge>
      </div>
    </SelectItem>
  );
})}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium flex items-center gap-1">
                    <Users2 className="h-3 w-3" /> Gender
                  </Label>
                  <Select value={filters.gender_preferences[0] || 'all'} onValueChange={(v) => handleSelectChange('gender_preferences', v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Any Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Gender</SelectItem>
{filterData.genderPreferences
  .filter(g => g.value !== 'couples' && g.value !== 'couple')
  .map(g => {
    const dynamicCount = roomsFilteredByPropertySharingAndRoomType.filter(r => {
      const prefs = Array.isArray(r.room_gender_preference) 
        ? r.room_gender_preference 
        : [];
      return prefs.includes(g.value);
    }).length;
    
    return (
      <SelectItem key={g.value} value={g.value}>
        <div className="flex justify-between w-full items-center gap-2">
          <span className="text-xs">{g.label}</span>
          <Badge variant="outline" className="text-[10px] px-1.5">{dynamicCount}</Badge>
        </div>
      </SelectItem>
    );
  })}
                    </SelectContent>
                  </Select>
                </div>

              {/* Availability */}
<div className="space-y-1">
  <Label className="text-[11px] font-medium flex items-center gap-1">
    <Bed className="h-3 w-3" /> Availability
  </Label>
<Select 
  value={filters.availability_status}
  onValueChange={(v) => handleFilterChange('availability_status', v)}
>
  <SelectTrigger className="h-8 text-xs">
    <SelectValue placeholder="Select Availability" />
  </SelectTrigger>
  <SelectContent>
    {/* "All" option – no count */}
    <SelectItem value="any">All Availability</SelectItem>
    {/* Specific options with counts */}
    <SelectItem value="available">
      Available ({availabilityCounts.available} rooms)
    </SelectItem>
    <SelectItem value="partial">
      Partial ({availabilityCounts.partial} rooms)
    </SelectItem>
    <SelectItem value="full">
      Full ({availabilityCounts.full} rooms)  {/* "Full" means completely empty */}
    </SelectItem>
  </SelectContent>
</Select>
</div>

                {/* Floor Filter */}
                {availableFloors.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium flex items-center gap-1">
                      <Layers className="h-3 w-3" /> Floor
                    </Label>
                    <Select
                      value={filters.floors.length === 1 ? String(filters.floors[0]) : 'all'}
                      onValueChange={(v) => handleSelectChange('floors', v)}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Any Floor" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Floor</SelectItem>
                        {availableFloors.map(floor => (
                          <SelectItem key={floor} value={String(floor)}>
                            <div className="flex justify-between w-full items-center gap-2">
                              <span className="text-xs">{floor}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5">
{rooms.filter(r => {
  const matchesFloor = String(r.floor) === String(floor);
  const propertyId = filters.property_ids[0];
  const matchesProperty = propertyId ? String(r.property_id) === propertyId : true;
  return matchesFloor && matchesProperty;
}).length} rooms                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Amenity */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium flex items-center gap-1">
                    <Wifi className="h-3 w-3" /> Amenity
                  </Label>
                  <Select value={filters.amenities[0] || 'all'} onValueChange={(v) => handleSelectChange('amenities', v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Any Amenity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Amenity</SelectItem>
                      {filterData.amenities.slice(0, 8).map(a => {
                        const Icon = a.icon || Wifi;
                        return (
                          <SelectItem key={a.value} value={a.value}>
                            <div className="flex items-center gap-2 justify-between w-full">
                              <div className="flex items-center gap-1">
                                <Icon className="h-3 w-3" />
                                <span className="text-xs">{a.label}</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] px-1.5">{a.count}</Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
      <div className="flex items-end h-full pb-1">
  <div className="flex items-center justify-between w-full h-8">
    <div className="flex items-center gap-1">
      <input
        type="checkbox"
        id="couple-booking"
        checked={filters.allow_couples === true}
        onChange={(e) =>
          handleFilterChange(
            "allow_couples",
            e.target.checked ? true : undefined
          )
        }
        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />

      <Label
        htmlFor="couple-booking"
        className="flex items-center gap-1 text-[11px] font-medium whitespace-nowrap cursor-pointer"
      >
        <Heart className="h-3 w-3" />
        Couple Room
      </Label>
    </div>

    <Badge
      variant="outline"
      className="ml-2 shrink-0 text-[9px] px-2.5 py-0 h-5"
    >
      {coupleRoomsCount} rooms
    </Badge>
  </div>
</div>
              </div>

              {/* ============================================ */}
              {/* AVAILABLE FROM DATE FILTER - NEW SECTION */}
              {/* ============================================ */}
<div className="border-t border-gray-200 pt-4 mt-2">
                <div className="space-y-3">
                  <Label className="text-[11px] font-medium flex items-center gap-1 text-amber-700">
                    <Calendar className="h-3.5 w-3.5" /> Available From (Date)
                  </Label>
                  <p className="text-[9px] text-gray-500 -mt-1">
                    Find beds that will be available on or before the selected date — includes confirmed vacate requests and pending notice periods
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
  <div>
    <Label className="text-[10px] text-gray-500 mb-1 block">From</Label>
<input
  type="date"
  value={availableFromDate}
  onChange={(e) => {
    setAvailableFromDate(e.target.value);
    handleFilterChange('available_from_date', e.target.value);
  }}
  min={new Date().toISOString().split("T")[0]}
  className="w-full border rounded-lg px-2 py-1.5 text-xs"
/>
  </div>
  <div>
    <Label className="text-[10px] text-gray-500 mb-1 block">To</Label>
<input
  type="date"
  value={availableToDate}
  onChange={(e) => {
    setAvailableToDate(e.target.value);
    handleFilterChange('available_to_date', e.target.value);
  }}
  min={availableFromDate || new Date().toISOString().split("T")[0]}
  className="w-full border rounded-lg px-2 py-1.5 text-xs"
/>
  </div>
</div>
{(availableFromDate || availableToDate) && (
  <Button variant="ghost" size="sm" className="h-7 text-[10px] text-gray-400" onClick={() => {
    setAvailableFromDate("");
    setAvailableToDate("");
    handleFilterChange('available_from_date', '');
    handleFilterChange('available_to_date', '');
  }}>
    <X className="h-3 w-3 mr-1" /> Clear range
  </Button>
)}

                  {/* Vacating Soon / Notice Pending Beds List */}
                  {(availableFromDate || availableToDate) && (
                    <div className="mt-2">
                      {loadingVacating ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                          <span className="ml-2 text-xs text-gray-500">Loading...</span>
                        </div>
                      ) : vacatingSoonBeds.length === 0 ? (
                        <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
    <Bed className="h-6 w-6 text-gray-300 mx-auto mb-1" />
    <p className="text-xs text-gray-500">
      No beds vacating {availableFromDate && availableToDate
        ? `between ${new Date(availableFromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} and ${new Date(availableToDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
        : `by ${new Date(availableFromDate || availableToDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
    </p>
  </div>
                      ) : (
                        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                          <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-500" />
                            {vacatingSoonBeds.length} bed(s) becoming available:
                          </p>
                          {vacatingSoonBeds.map((bed) => (
                            <button
                              key={`${bed.source}-${bed.bed_assignment_id}`}
                              onClick={() => {
                                onSelectVacatingBed?.(bed.bed_assignment_id, bed.room_id);
                                onOpenChange(false);
                              }}
                              className={`w-full text-left p-2 rounded-lg border ${
                                bed.source === 'notice_period'
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-amber-50 border-amber-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1 bg-white rounded border ${
                                    bed.source === 'notice_period' ? 'border-blue-200' : 'border-amber-200'
                                  }`}>
                                    {bed.source === 'notice_period' ? (
                                      <FileWarning className="h-3 w-3 text-blue-600" />
                                    ) : (
                                      <Bed className="h-3 w-3 text-amber-600" />
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-gray-800">
                                      Room {bed.room_number} • Bed {bed.bed_number}
                                    </span>
                                    <p className="text-[10px] text-gray-500 truncate max-w-[140px]">
                                      {bed.tenant_name}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  className={`text-[9px] border-0 flex-shrink-0 ${
                                    bed.source === 'notice_period'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {new Date(bed.vacate_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                </Badge>
                              </div>
                              <div className={`mt-1 text-[9px] ${
                                bed.source === 'notice_period' ? 'text-blue-600' : 'text-amber-600'
                              }`}>
                                {bed.source === 'notice_period'
                                  ? 'Notice period sent — click to manage this bed'
                                  : 'Click to manage this bed'}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-gray-50 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-1 h-8 text-xs"
              onClick={resetFilters}
              disabled={loading}
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              <RefreshCw className="h-3 w-3" /> Reset
            </Button>
            <Button
              className="flex-1 text-white h-8 text-xs"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              style={{ backgroundColor: colors.primary }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}