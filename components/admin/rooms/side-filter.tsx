
// "use client";

// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Slider } from '@/components/ui/slider';
// import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Filter,
//   X,
//   Bath,
//   Sun,
//   Wind,
//   Heart,
//   IndianRupee,
//   Users,
//   Building2,
//   RefreshCw,
//   ChevronDown,
//   Home,
//   Hotel,
//   DoorOpen,
//   Users2,
//   Wifi,
//   Coffee,
//   Car,
//   Shield,
//   Zap
// } from 'lucide-react';
// import { consumeMasters } from "@/lib/masterApi";

// interface SideFilterProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onFilterChange: (filters: FilterState) => void;
//   hideTrigger?: boolean;
// }

// interface FilterState {
//   search: string;
//   property_ids: string[];
//   room_types: string[];
//   gender_preferences: string[];
//   amenities: string[];
//   has_attached_bathroom: boolean | undefined;
//   has_balcony: boolean | undefined;
//   has_ac: boolean | undefined;
//   allow_couples: boolean | undefined;
//   min_rent: number;
//   max_rent: number;
//   min_capacity: number;
//   max_capacity: number;
//   is_active: boolean;
// availability_status: 'any' | 'available' | 'partial' | 'full';}

// interface FilterData {
// roomTypes: Array<{ value: string; label: string; count: number; totalBeds: number }>;  masterRoomTypes: Array<{ id: number; name: string }>;  // 👈 add this

//   genderPreferences: Array<{ value: string; label: string; count: number }>;
//   properties: Array<{ id: string; name: string; address: string; roomCount: number }>;
//   amenities: Array<{ value: string; label: string; count: number; icon?: any }>;
// }

// const DEFAULT_FILTERS: FilterState = {
//   search: '',
//   property_ids: [],
//   room_types: [],
//   gender_preferences: [],
//   amenities: [],
//   has_attached_bathroom: undefined,
//   has_balcony: undefined,
//   has_ac: undefined,
//   allow_couples: undefined,
//   min_rent: 0,
//   max_rent: 100000,
//   min_capacity: 1,
//   max_capacity: 10,
//   is_active: true,
// availability_status: 'any',
// };

// // Color scheme
// const colors = {
//   primary: '#004ab0',
//   secondary: '#f9bd07',
//   primaryLight: '#e6f0ff',
//   secondaryLight: '#fff4e0'
// };

// export default function SideFilter({ open, onOpenChange, onFilterChange, hideTrigger = false }: SideFilterProps) {
//   const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  
//   // Local state for sliders
//   const [localRentRange, setLocalRentRange] = useState([DEFAULT_FILTERS.min_rent, DEFAULT_FILTERS.max_rent]);
//   const [localCapacityRange, setLocalCapacityRange] = useState([DEFAULT_FILTERS.min_capacity, DEFAULT_FILTERS.max_capacity]);
  
//   const [filterData, setFilterData] = useState<FilterData>({
//     roomTypes: [],
//     genderPreferences: [],
//     properties: [],
//     amenities: [],
//     masterRoomTypes: []  // 👈 initialize this
//   });
//   const [loading, setLoading] = useState(false);
//   const [masterRoomTypes, setMasterRoomTypes] = useState<Array<{ id: number; name: string }>>([]);

//   // Fetch filter data
//   useEffect(() => {
//     fetchFilterData();
//   }, []);

//   // Sync local slider state with filters when they change externally
//   useEffect(() => {
//     setLocalRentRange([filters.min_rent, filters.max_rent]);
//   }, [filters.min_rent, filters.max_rent]);

//   useEffect(() => {
//     setLocalCapacityRange([filters.min_capacity, filters.max_capacity]);
//   }, [filters.min_capacity, filters.max_capacity]);

//   useEffect(() => {
//   consumeMasters({ tab: 'Rooms' })
//     .then(res => {
//       if (res?.success && res.data) {
//         const roomTypes = res.data
//           .filter((item: any) => item.type_name === 'Room Type')
//           .map((item: any) => ({ id: item.value_id, name: item.value_name }));
//         setMasterRoomTypes(roomTypes);
//       }
//     })
//     .catch(e => console.error('Failed to fetch room type masters:', e));
// }, []);

//   const fetchFilterData = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('/api/rooms/filters/data');
//       const result = await response.json();
      
//       if (result.success) {
//         // Add icons to amenities for better visual appeal
//         const amenitiesWithIcons = result.data.amenities.map((amenity: any, index: number) => {
//           const icons = [Wifi, Coffee, Car, Shield, Zap, Users, Home, Hotel, DoorOpen];
//           return {
//             ...amenity,
//             icon: icons[index % icons.length]
//           };
//         });
        
//         setFilterData({
//           ...result.data,
//           amenities: amenitiesWithIcons
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching filter data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFilterChange = (key: keyof FilterState, value: any) => {
//     // Ensure numeric values are properly formatted
//     let processedValue = value;
    
//     if (key === 'min_rent' || key === 'max_rent' || key === 'min_capacity' || key === 'max_capacity') {
//       processedValue = Number(value);
//     }
    
//     const newFilters = { ...filters, [key]: processedValue };
//     setFilters(newFilters);
//     onFilterChange(newFilters);
//   };

//   const handleSelectChange = (key: 'property_ids' | 'room_types' | 'gender_preferences' | 'amenities', value: string) => {
//     // For single select, we'll just set the array with the selected value
//     // If value is empty or 'all', set empty array
//     if (!value || value === 'all') {
//       handleFilterChange(key, []);
//     } else {
//       handleFilterChange(key, [value]);
//     }
//   };

//   const handleBooleanToggle = (key: 'has_attached_bathroom' | 'has_balcony' | 'has_ac' | 'allow_couples') => {
//     const currentValue = filters[key];
//     const newValue = currentValue === undefined ? true : currentValue === true ? false : undefined;
//     handleFilterChange(key, newValue);
//   };

//   // Handle rent slider change - updates local state only
//   const handleRentSliderChange = (values: number[]) => {
//     setLocalRentRange(values);
//   };

//   // Handle rent slider commit - updates actual filters
//   const handleRentSliderCommit = () => {
//     const [min, max] = localRentRange;
//     if (min <= max) {
//       // Only update if values actually changed
//       if (filters.min_rent !== min || filters.max_rent !== max) {
//         handleFilterChange('min_rent', min);
//         handleFilterChange('max_rent', max);
//       }
//     }
//   };

//   // Handle capacity slider change - updates local state only
//   const handleCapacitySliderChange = (values: number[]) => {
//     setLocalCapacityRange(values);
//   };

//   // Handle capacity slider commit - updates actual filters
//   const handleCapacitySliderCommit = () => {
//     const [min, max] = localCapacityRange;
//     if (min <= max) {
//       // Only update if values actually changed
//       if (filters.min_capacity !== min || filters.max_capacity !== max) {
//         handleFilterChange('min_capacity', min);
//         handleFilterChange('max_capacity', max);
//       }
//     }
//   };

//   const resetFilters = () => {
//     setFilters(DEFAULT_FILTERS);
//     setLocalRentRange([DEFAULT_FILTERS.min_rent, DEFAULT_FILTERS.max_rent]);
//     setLocalCapacityRange([DEFAULT_FILTERS.min_capacity, DEFAULT_FILTERS.max_capacity]);
//     onFilterChange(DEFAULT_FILTERS);
//   };

//   const getActiveFilterCount = () => {
//     let count = 0;
    
//     if (filters.search) count++;
//     if (filters.property_ids.length > 0) count++;
//     if (filters.room_types.length > 0) count++;
//     if (filters.gender_preferences.length > 0) count++;
//     if (filters.amenities.length > 0) count++;
//     if (filters.has_attached_bathroom !== undefined) count++;
//     if (filters.has_balcony !== undefined) count++;
//     if (filters.has_ac !== undefined) count++;
//     if (filters.allow_couples !== undefined) count++;
//     if (filters.min_rent > 0) count++;
//     if (filters.max_rent < 100000) count++;
//     if (filters.min_capacity > 1) count++;
//     if (filters.max_capacity < 10) count++;
// if (filters.availability_status !== 'any') count++;    
//     return count;
//   };

//   const activeFilterCount = getActiveFilterCount();

//   // Helper to get display label for selected values
//   const getSelectedDisplay = (key: 'property_ids' | 'room_types' | 'gender_preferences' | 'amenities') => {
//     const selected = filters[key];
//     if (selected.length === 0) return 'All';
    
//     if (key === 'property_ids') {
//       const property = filterData.properties.find(p => p.id.toString() === selected[0]);
//       return property?.name || 'Selected';
//     }
//     if (key === 'room_types') {
//       const type = filterData.roomTypes.find(t => t.value === selected[0]);
//       return type?.label || 'Selected';
//     }
//     if (key === 'gender_preferences') {
//       const gender = filterData.genderPreferences.find(g => g.value === selected[0]);
//       return gender?.label || 'Selected';
//     }
//     if (key === 'amenities') {
//       const amenity = filterData.amenities.find(a => a.value === selected[0]);
//       return amenity?.label || 'Selected';
//     }
//     return 'Selected';
//   };

//   return (
//     <Sheet open={open} onOpenChange={onOpenChange}>
//       {/* Only show the trigger button if hideTrigger is false */}
//       {!hideTrigger && (
//         <SheetTrigger asChild>
//           <Button 
//             variant="outline" 
//             size="icon" 
//             className="h-9 w-9 relative"
//             style={{ 
//               borderColor: colors.primary,
//               color: colors.primary 
//             }}
//           >
//             <Filter className="h-4 w-4" />
//             {activeFilterCount > 0 && (
//               <Badge 
//                 className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
//                 style={{ backgroundColor: colors.secondary, color: '#000' }}
//               >
//                 {activeFilterCount}
//               </Badge>
//             )}
//           </Button>
//         </SheetTrigger>
//       )}
      
//       {/*
//         RESPONSIVE WIDTH LOGIC:
//         - Mobile (default): w-[50vw]  → half the screen width
//         - Tablet (sm):      w-[50vw]  → still half screen
//         - Desktop (lg+):    w-full sm:max-w-md  → shadcn default full-width capped at md

//         We override SheetContent's default inline style with a className approach.
//         The key classes:
//           w-[50vw]        – half screen on mobile & tablet
//           min-w-[280px]   – never shrink below 280px on very small phones
//           sm:w-[380px]    – fixed comfortable width on small-tablet
//           lg:w-full       – revert to full width on large screens
//           lg:max-w-md     – cap at md on large screens (original desktop behavior)
//       */}
//       <SheetContent
//         side="right"
//         className="
//           p-0
//           w-[50vw]
//           min-w-[280px]
//           sm:w-[380px]
//           lg:w-full
//           lg:max-w-md
//         "
//       >
//         <div className="h-full flex flex-col">
//           <SheetHeader 
//             className="p-6 border-b"
//             style={{ 
//               background: `linear-gradient(135deg, ${colors.primary} 0%, #003d8c 100%)`,
//               color: 'white'
//             }}
//           >
//             <div className="flex items-center justify-between">
//               <SheetTitle className="flex items-center gap-2 text-white">
//                 <Filter className="h-5 w-5" style={{ color: colors.secondary }} />
//                 <span>Filter Rooms</span>
//                 {activeFilterCount > 0 && (
//                   <Badge 
//                     className="ml-2"
//                     style={{ backgroundColor: colors.secondary, color: '#000' }}
//                   >
//                     {activeFilterCount} active
//                   </Badge>
//                 )}
//               </SheetTitle>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => onOpenChange(false)}
//                 className="text-white hover:bg-white/20"
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             </div>
//           </SheetHeader>

//           <ScrollArea className="flex-1 p-6">
//             <div className="space-y-6">
//               {/* Properties Dropdown */}
//               <div className="space-y-2">
//                 <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.primary }}>
//                   <Building2 className="h-4 w-4" />
//                   Select Property
//                 </Label>
//                 <Select
//                   value={filters.property_ids[0] || 'all'}
//                   onValueChange={(value) => handleSelectChange('property_ids', value)}
//                 >
//                   <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-offset-0" 
//                     style={{ focusRing: colors.primary }}>
//                     <SelectValue placeholder="All Properties" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Properties</SelectItem>
//                     {filterData.properties.map(property => (
//                       <SelectItem key={property.id} value={property.id.toString()}>
//                         <div className="flex items-center justify-between w-full">
//                           <span>{property.name}</span>
//                           <Badge variant="outline" className="ml-2 text-xs">
//                             {property.roomCount}
//                           </Badge>
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Room Types Dropdown */}
// {/* Room Types Dropdown */}
// {/* Room Types Dropdown */}
// <div className="space-y-2">
//   <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.primary }}>
//     <DoorOpen className="h-4 w-4" />
//     Room Type
//   </Label>
//   <Select
//     value={filters.room_types[0] || 'all'}
//     onValueChange={(value) => handleSelectChange('room_types', value)}
//   >
//     <SelectTrigger className="w-full border-gray-300">
//       <SelectValue placeholder="All Room Types" />
//     </SelectTrigger>
//     <SelectContent>
//       <SelectItem value="all">All Room Types</SelectItem>
//       {masterRoomTypes.length > 0
//         ? masterRoomTypes.map(type => {
//             // match with filterData to get counts
//             const meta = filterData.roomTypes.find(
//               r => r.value.toLowerCase() === type.name.toLowerCase()
//             );
//             return (
//               <SelectItem key={type.id} value={type.name}>
//                 <div className="flex items-center justify-between w-full gap-3">
//                   <span>{type.name}</span>
//                   {meta && (
//                     <div className="flex items-center gap-1 ml-auto">
//                       <Badge variant="outline" className="text-[10px] px-1.5">
//                         {meta.count} rooms
//                       </Badge>
//                       <Badge
//                         className="text-[10px] px-1.5"
//                         style={{ backgroundColor: colors.primaryLight, color: colors.primary, border: 'none' }}
//                       >
//                         {meta.totalBeds} beds
//                       </Badge>
//                     </div>
//                   )}
//                 </div>
//               </SelectItem>
//             );
//           })
//         : filterData.roomTypes.map(type => (
//             <SelectItem key={type.value} value={type.value}>
//               <div className="flex items-center justify-between w-full gap-3">
//                 <span>{type.label}</span>
//                 <div className="flex items-center gap-1 ml-auto">
//                   <Badge variant="outline" className="text-[10px] px-1.5">
//                     {type.count} rooms
//                   </Badge>
//                   <Badge
//                     className="text-[10px] px-1.5"
//                     style={{ backgroundColor: colors.primaryLight, color: colors.primary, border: 'none' }}
//                   >
//                     {type.totalBeds} beds
//                   </Badge>
//                 </div>
//               </div>
//             </SelectItem>
//           ))
//       }
//     </SelectContent>
//   </Select>
// </div>

//               {/* Gender Preferences Dropdown */}
//               <div className="space-y-2">
//                 <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.primary }}>
//                   <Users2 className="h-4 w-4" />
//                   Gender Preference
//                 </Label>
//                 <Select
//                   value={filters.gender_preferences[0] || 'all'}
//                   onValueChange={(value) => handleSelectChange('gender_preferences', value)}
//                 >
//                   <SelectTrigger className="w-full border-gray-300">
//                     <SelectValue placeholder="Any Gender" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">Any Gender</SelectItem>
//                     {filterData.genderPreferences.map(gender => (
//                       <SelectItem key={gender.value} value={gender.value}>
//                         <div className="flex items-center justify-between w-full">
//                           <span>{gender.label}</span>
//                           <Badge variant="outline" className="ml-2 text-xs">
//                             {gender.count}
//                           </Badge>
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

           

             
//    {/* Availability Status Filter */}
// <div className="space-y-2">
//   <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.primary }}>
//     <DoorOpen className="h-4 w-4" />
//     Room Availability
//   </Label>
//   <Select
//     value={filters.availability_status || 'any'}
//     onValueChange={(value) => handleFilterChange('availability_status', value)}
//   >
//     <SelectTrigger className="w-full border-gray-300">
//       <SelectValue placeholder="Any Availability" />
//     </SelectTrigger>
//     <SelectContent>
//       {[
//         { value: 'any',       label: 'Any Availability',  sub: 'Show all rooms',         dot: '#6b7280' },
//         { value: 'available', label: 'Fully Available',   sub: 'All beds are empty',     dot: '#16a34a' },
//         { value: 'partial',   label: 'Partial Occupied',  sub: 'Some beds are empty',    dot: '#f59e0b' },
//         { value: 'full',      label: 'Fully Occupied',    sub: 'No beds available',      dot: '#ef4444' },
//       ].map(opt => (
//         <SelectItem key={opt.value} value={opt.value}>
//           <div className="flex items-center gap-2">
//             <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: opt.dot }} />
//             <div className="flex flex-col">
//               <span className="text-xs font-medium">{opt.label}</span>
//               <span className="text-[10px] text-gray-400">{opt.sub}</span>
//             </div>
//           </div>
//         </SelectItem>
//       ))}
//     </SelectContent>
//   </Select>
// </div>

//               {/* Amenities Dropdown */}
//               <div className="space-y-2">
//                 <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.primary }}>
//                   <Wifi className="h-4 w-4" />
//                   Popular Amenity
//                 </Label>
//                 <Select
//                   value={filters.amenities[0] || 'all'}
//                   onValueChange={(value) => handleSelectChange('amenities', value)}
//                 >
//                   <SelectTrigger className="w-full border-gray-300">
//                     <SelectValue placeholder="Any Amenity" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">Any Amenity</SelectItem>
//                     {filterData.amenities.slice(0, 10).map(amenity => {
//                       const Icon = amenity.icon || Wifi;
//                       return (
//                         <SelectItem key={amenity.value} value={amenity.value}>
//                           <div className="flex items-center gap-2">
//                             <Icon className="h-3.5 w-3.5" style={{ color: colors.primary }} />
//                             <span>{amenity.label}</span>
//                             <Badge variant="outline" className="ml-auto text-xs">
//                               {amenity.count}
//                             </Badge>
//                           </div>
//                         </SelectItem>
//                       );
//                     })}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Boolean Filters */}
//               <div className="space-y-3">
//                 <Label className="text-sm font-medium" style={{ color: colors.primary }}>Features</Label>
//                 <div className="grid grid-cols-2 gap-3">
//                   <Button
//                     variant={filters.has_attached_bathroom === true ? "default" : 
//                             filters.has_attached_bathroom === false ? "destructive" : "outline"}
//                     size="sm"
//                     className="justify-start gap-2"
//                     onClick={() => handleBooleanToggle('has_attached_bathroom')}
//                     style={
//                       filters.has_attached_bathroom === true 
//                         ? { backgroundColor: colors.primary, color: 'white' }
//                         : filters.has_attached_bathroom === false
//                         ? { backgroundColor: '#ef4444', color: 'white' }
//                         : { borderColor: colors.primary, color: colors.primary }
//                     }
//                   >
//                     <Bath className="h-4 w-4" />
//                     Bathroom
//                     {filters.has_attached_bathroom !== undefined && (
//                       <span className="ml-auto text-xs">
//                         {filters.has_attached_bathroom ? '✓' : '✗'}
//                       </span>
//                     )}
//                   </Button>

//                   <Button
//                     variant={filters.has_balcony === true ? "default" : 
//                             filters.has_balcony === false ? "destructive" : "outline"}
//                     size="sm"
//                     className="justify-start gap-2"
//                     onClick={() => handleBooleanToggle('has_balcony')}
//                     style={
//                       filters.has_balcony === true 
//                         ? { backgroundColor: colors.primary, color: 'white' }
//                         : filters.has_balcony === false
//                         ? { backgroundColor: '#ef4444', color: 'white' }
//                         : { borderColor: colors.primary, color: colors.primary }
//                     }
//                   >
//                     <Sun className="h-4 w-4" />
//                     Balcony
//                     {filters.has_balcony !== undefined && (
//                       <span className="ml-auto text-xs">
//                         {filters.has_balcony ? '✓' : '✗'}
//                       </span>
//                     )}
//                   </Button>

//                   <Button
//                     variant={filters.has_ac === true ? "default" : 
//                             filters.has_ac === false ? "destructive" : "outline"}
//                     size="sm"
//                     className="justify-start gap-2"
//                     onClick={() => handleBooleanToggle('has_ac')}
//                     style={
//                       filters.has_ac === true 
//                         ? { backgroundColor: colors.primary, color: 'white' }
//                         : filters.has_ac === false
//                         ? { backgroundColor: '#ef4444', color: 'white' }
//                         : { borderColor: colors.primary, color: colors.primary }
//                     }
//                   >
//                     <Wind className="h-4 w-4" />
//                     AC
//                     {filters.has_ac !== undefined && (
//                       <span className="ml-auto text-xs">
//                         {filters.has_ac ? '✓' : '✗'}
//                       </span>
//                     )}
//                   </Button>

//                   <Button
//                     variant={filters.allow_couples === true ? "default" : 
//                             filters.allow_couples === false ? "destructive" : "outline"}
//                     size="sm"
//                     className="justify-start gap-2"
//                     onClick={() => handleBooleanToggle('allow_couples')}
//                     style={
//                       filters.allow_couples === true 
//                         ? { backgroundColor: colors.primary, color: 'white' }
//                         : filters.allow_couples === false
//                         ? { backgroundColor: '#ef4444', color: 'white' }
//                         : { borderColor: colors.primary, color: colors.primary }
//                     }
//                   >
//                     <Heart className="h-4 w-4" />
//                     Couples
//                     {filters.allow_couples !== undefined && (
//                       <span className="ml-auto text-xs">
//                         {filters.allow_couples ? '✓' : '✗'}
//                       </span>
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </ScrollArea>

//           <div className="p-6 border-t" style={{ backgroundColor: '#f9fafb' }}>
//             <div className="flex gap-3">
//               <Button
//                 variant="outline"
//                 className="flex-1 gap-2"
//                 onClick={resetFilters}
//                 disabled={loading}
//                 style={{ borderColor: colors.primary, color: colors.primary }}
//               >
//                 <RefreshCw className="h-4 w-4" />
//                 Reset All
//               </Button>
//               <Button
//                 className="flex-1 text-white"
//                 onClick={() => onOpenChange(false)}
//                 disabled={loading}
//                 style={{ backgroundColor: colors.primary }}
//               >
//                 Apply Filters
//               </Button>
//             </div>
//           </div>
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// }

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
  DoorOpen, Users2, Wifi, Coffee, Car, Shield, Zap, Bed, Home, Layers, Check
} from 'lucide-react';
import { consumeMasters } from "@/lib/masterApi";

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
  availability_status: 'any' | 'available' | 'partial' | 'full';
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
  availability_status: 'any',
};

const colors = { primary: '#004ab0', secondary: '#f9bd07' };

export default function SideFilter({ open, onOpenChange, onFilterChange, hideTrigger = false, rooms = [] }: SideFilterProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterData, setFilterData] = useState<FilterData>({
    roomTypes: [], genderPreferences: [], properties: [], amenities: [], masterRoomTypes: []
  });
  const [masterRoomTypes, setMasterRoomTypes] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Feature options
  const featureOptions = [
    { id: 'has_attached_bathroom', label: 'Attached Bathroom', icon: Bath },
    { id: 'has_balcony', label: 'Balcony', icon: Sun },
    { id: 'has_ac', label: 'AC', icon: Wind },
    { id: 'allow_couples', label: 'Couples Allowed', icon: Heart },
  ];

  // ✅ FIX: floors as string[], handle "Floor 2" style values
  const availableFloors = useMemo(() => {
    const floorsSet = new Set<string>();
    rooms.forEach(room => {
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
    const counts = { available: 0, partial: 0, full: 0 };
    for (const room of targetRooms) {
      const occupied = room.occupied_beds || 0;
      const total = room.total_bed || 0;
      if (occupied === 0) counts.available++;
      else if (occupied >= total) counts.full++;
      else counts.partial++;
    }
    return counts;
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
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.property_ids.length) count++;
    if (filters.room_types.length) count++;
    if (filters.gender_preferences.length) count++;
    if (filters.amenities.length) count++;
    if (filters.floors.length) count++;
    if (filters.has_attached_bathroom !== undefined) count++;
    if (filters.has_balcony !== undefined) count++;
    if (filters.has_ac !== undefined) count++;
    if (filters.allow_couples !== undefined) count++;
    if (filters.min_rent > 0 || filters.max_rent < 100000) count++;
    if (filters.availability_status !== 'any') count++;
    return count;
  }, [filters]);

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

              {/* Property summary */}
              {propertyStats && (
                <div className="bg-blue-50 rounded-lg p-2 text-xs border border-blue-100">
                  <p className="font-semibold text-blue-800 mb-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Property Summary
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div><span className="text-[10px] text-gray-600">Rooms</span><p className="font-bold text-blue-700 text-sm">{propertyStats.totalRooms}</p></div>
                    <div><span className="text-[10px] text-gray-600">Total Beds</span><p className="font-bold text-blue-700 text-sm">{propertyStats.totalBeds}</p></div>
                    <div><span className="text-[10px] text-gray-600">Available Beds</span><p className="font-bold text-green-600 text-sm">{propertyStats.availableBeds}</p></div>
                  </div>
                </div>
              )}

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
                        return (
                          <SelectItem key={(type as any).id || label} value={label}>
                            <span className="text-xs">{label}</span>
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
                      {filterData.genderPreferences.map(g => (
                        <SelectItem key={g.value} value={g.value}>
                          <div className="flex justify-between w-full items-center gap-2">
                            <span className="text-xs">{g.label}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5">{g.count}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium flex items-center gap-1">
                    <Bed className="h-3 w-3" /> Availability
                  </Label>
                  <Select value={filters.availability_status} onValueChange={(v) => handleFilterChange('availability_status', v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Availability</SelectItem>
                      <SelectItem value="available">Available ({availabilityCounts.available} rooms)</SelectItem>
                      <SelectItem value="partial">Partial ({availabilityCounts.partial} rooms)</SelectItem>
                      <SelectItem value="full">Full ({availabilityCounts.full} rooms)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* ✅ Floor Filter - fixed string-based */}
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
                                {rooms.filter(r => String(r.floor) === String(floor)).length} rooms
                              </Badge>
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