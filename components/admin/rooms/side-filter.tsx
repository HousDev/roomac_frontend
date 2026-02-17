// "use client";

// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Checkbox } from '@/components/ui/checkbox';
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
//   Filter,
//   X,
//   Bath,
//   Sun,
//   Wind,
//   Heart,
//   IndianRupee,
//   Users,
//   Building2,
//   RefreshCw
// } from 'lucide-react';

// interface SideFilterProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onFilterChange: (filters: FilterState) => void;
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
// }

// interface FilterData {
//   roomTypes: Array<{ value: string; label: string; count: number }>;
//   genderPreferences: Array<{ value: string; label: string; count: number }>;
//   properties: Array<{ id: string; name: string; address: string; roomCount: number }>;
//   amenities: Array<{ value: string; label: string; count: number }>;
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
//   is_active: true
// };

// export default function SideFilter({ open, onOpenChange, onFilterChange }: SideFilterProps) {
//   const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  
//   // Local state for sliders - THIS IS THE KEY FIX
//   const [localRentRange, setLocalRentRange] = useState([DEFAULT_FILTERS.min_rent, DEFAULT_FILTERS.max_rent]);
//   const [localCapacityRange, setLocalCapacityRange] = useState([DEFAULT_FILTERS.min_capacity, DEFAULT_FILTERS.max_capacity]);
  
//   const [filterData, setFilterData] = useState<FilterData>({
//     roomTypes: [],
//     genderPreferences: [],
//     properties: [],
//     amenities: []
//   });
//   const [loading, setLoading] = useState(false);

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

//   const fetchFilterData = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('/api/rooms/filters/data');
//       const result = await response.json();
      
//       if (result.success) {
//         setFilterData(result.data);
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

//   const handleToggleArray = (key: 'property_ids' | 'room_types' | 'gender_preferences' | 'amenities', value: string) => {
//     const currentArray = filters[key];
//     const newArray = currentArray.includes(value)
//       ? currentArray.filter(item => item !== value)
//       : [...currentArray, value];
    
//     handleFilterChange(key, newArray);
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
    
//     return count;
//   };

//   const activeFilterCount = getActiveFilterCount();

//   return (
//     <Sheet open={open} onOpenChange={onOpenChange}>
//       <SheetTrigger asChild>
//         <Button variant="outline" size="icon" className="h-9 w-9 relative">
//           <Filter className="h-4 w-4" />
//           {activeFilterCount > 0 && (
//             <Badge 
//               className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
//               variant="destructive"
//             >
//               {activeFilterCount}
//             </Badge>
//           )}
//         </Button>
//       </SheetTrigger>
      
//       <SheetContent side="right" className="w-full sm:max-w-md p-0">
//         <div className="h-full flex flex-col">
//           <SheetHeader className="p-6 border-b">
//             <div className="flex items-center justify-between">
//               <SheetTitle className="flex items-center gap-2">
//                 <Filter className="h-5 w-5" />
//                 Filter Rooms
//               </SheetTitle>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => onOpenChange(false)}
//               >
//               </Button>
//             </div>
//           </SheetHeader>

//           <ScrollArea className="flex-1 p-6">
//             <div className="space-y-6">
//               {/* Search */}
//               <div className="space-y-3">
//                 <Label>Search</Label>
//                 <Input
//                   placeholder="Search rooms..."
//                   value={filters.search}
//                   onChange={(e) => handleFilterChange('search', e.target.value)}
//                 />
//               </div>

//               {/* Properties */}
//               <div className="space-y-3">
//                 <Label className="flex items-center gap-2">
//                   <Building2 className="h-4 w-4" />
//                   Properties ({filters.property_ids.length})
//                 </Label>
//                 <div className="space-y-2 max-h-40 overflow-y-auto">
//                   {filterData.properties.map(property => (
//                     <div key={property.id} className="flex items-center space-x-2">
//                       <Checkbox
//                         id={`property-${property.id}`}
//                         checked={filters.property_ids.includes(property.id.toString())}
//                         onCheckedChange={() => 
//                           handleToggleArray('property_ids', property.id.toString())
//                         }
//                       />
//                       <Label
//                         htmlFor={`property-${property.id}`}
//                         className="flex-1 cursor-pointer text-sm"
//                       >
//                         <div className="font-medium">{property.name}</div>
//                         <div className="text-xs text-gray-500">{property.address}</div>
//                         <Badge variant="outline" className="mt-1 text-xs">
//                           {property.roomCount} rooms
//                         </Badge>
//                       </Label>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Room Types */}
//               <div className="space-y-3">
//                 <Label>Room Types ({filters.room_types.length})</Label>
//                 <div className="space-y-2">
//                   {filterData.roomTypes.map(type => (
//                     <div key={type.value} className="flex items-center space-x-2">
//                       <Checkbox
//                         id={`type-${type.value}`}
//                         checked={filters.room_types.includes(type.value)}
//                         onCheckedChange={() => handleToggleArray('room_types', type.value)}
//                       />
//                       <Label
//                         htmlFor={`type-${type.value}`}
//                         className="flex-1 cursor-pointer text-sm flex items-center justify-between"
//                       >
//                         <span>{type.label}</span>
//                         <Badge variant="secondary" className="text-xs">
//                           {type.count}
//                         </Badge>
//                       </Label>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Gender Preferences */}
//               <div className="space-y-3">
//                 <Label>Gender Preferences ({filters.gender_preferences.length})</Label>
//                 <div className="space-y-2">
//                   {filterData.genderPreferences.map(gender => (
//                     <div key={gender.value} className="flex items-center space-x-2">
//                       <Checkbox
//                         id={`gender-${gender.value}`}
//                         checked={filters.gender_preferences.includes(gender.value)}
//                         onCheckedChange={() => handleToggleArray('gender_preferences', gender.value)}
//                       />
//                       <Label
//                         htmlFor={`gender-${gender.value}`}
//                         className="flex-1 cursor-pointer text-sm flex items-center justify-between"
//                       >
//                         <span>{gender.label}</span>
//                         <Badge variant="secondary" className="text-xs">
//                           {gender.count}
//                         </Badge>
//                       </Label>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Rent Range - COMPLETELY FIXED */}
//               <div className="space-y-3">
//                 <Label className="flex items-center gap-2">
//                   <IndianRupee className="h-4 w-4" />
//                   Rent per Bed
//                 </Label>
//                 <div className="pt-4">
//                   <Slider
//                     min={0}
//                     max={100000}
//                     step={100}
//                     value={localRentRange}
//                     onValueChange={handleRentSliderChange}
//                     onValueCommit={handleRentSliderCommit}
//                     className="mb-4"
//                   />
//                   <div className="flex items-center justify-between text-sm">
//                     <span>₹{localRentRange[0].toLocaleString()}</span>
//                     <span>₹{localRentRange[1].toLocaleString()}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Capacity Range - COMPLETELY FIXED */}
//               <div className="space-y-3">
//                 <Label className="flex items-center gap-2">
//                   <Users className="h-4 w-4" />
//                   Capacity (Beds)
//                 </Label>
//                 <div className="pt-4">
//                   <Slider
//                     min={1}
//                     max={10}
//                     step={1}
//                     value={localCapacityRange}
//                     onValueChange={handleCapacitySliderChange}
//                     onValueCommit={handleCapacitySliderCommit}
//                     className="mb-4"
//                   />
//                   <div className="flex items-center justify-between text-sm">
//                     <span>{localCapacityRange[0]} bed{localCapacityRange[0] !== 1 ? 's' : ''}</span>
//                     <span>{localCapacityRange[1]} bed{localCapacityRange[1] !== 1 ? 's' : ''}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Amenities */}
//               <div className="space-y-3">
//                 <Label>Amenities ({filters.amenities.length})</Label>
//                 <div className="grid grid-cols-2 gap-2">
//                   {filterData.amenities.slice(0, 10).map(amenity => (
//                     <div key={amenity.value} className="flex items-center space-x-2">
//                       <Checkbox
//                         id={`amenity-${amenity.value}`}
//                         checked={filters.amenities.includes(amenity.value)}
//                         onCheckedChange={() => handleToggleArray('amenities', amenity.value)}
//                         className="h-4 w-4"
//                       />
//                       <Label
//                         htmlFor={`amenity-${amenity.value}`}
//                         className="cursor-pointer text-xs flex items-center justify-between flex-1"
//                       >
//                         <span className="truncate">{amenity.label}</span>
//                         <Badge variant="outline" className="ml-1 text-xs">
//                           {amenity.count}
//                         </Badge>
//                       </Label>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Boolean Filters */}
//               <div className="space-y-3">
//                 <Label>Features</Label>
//                 <div className="grid grid-cols-2 gap-3">
//                   <Button
//                     variant={filters.has_attached_bathroom === true ? "default" : 
//                             filters.has_attached_bathroom === false ? "destructive" : "outline"}
//                     size="sm"
//                     className="justify-start gap-2"
//                     onClick={() => handleBooleanToggle('has_attached_bathroom')}
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

//           <div className="p-6 border-t bg-gray-50">
//             <div className="flex gap-3">
//               <Button
//                 variant="outline"
//                 className="flex-1 gap-2"
//                 onClick={resetFilters}
//                 disabled={loading}
//               >
//                 <RefreshCw className="h-4 w-4" />
//                 Reset All
//               </Button>
//               <Button
//                 className="flex-1"
//                 onClick={() => onOpenChange(false)}
//                 disabled={loading}
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

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  X,
  Bath,
  Sun,
  Wind,
  Heart,
  IndianRupee,
  Users,
  Building2,
  RefreshCw,
  ChevronDown,
  Home,
  Hotel,
  DoorOpen,
  Users2,
  Wifi,
  Coffee,
  Car,
  Shield,
  Zap
} from 'lucide-react';

interface SideFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilterChange: (filters: FilterState) => void;
  hideTrigger?: boolean;
}

interface FilterState {
  search: string;
  property_ids: string[];
  room_types: string[];
  gender_preferences: string[];
  amenities: string[];
  has_attached_bathroom: boolean | undefined;
  has_balcony: boolean | undefined;
  has_ac: boolean | undefined;
  allow_couples: boolean | undefined;
  min_rent: number;
  max_rent: number;
  min_capacity: number;
  max_capacity: number;
  is_active: boolean;
}

interface FilterData {
  roomTypes: Array<{ value: string; label: string; count: number }>;
  genderPreferences: Array<{ value: string; label: string; count: number }>;
  properties: Array<{ id: string; name: string; address: string; roomCount: number }>;
  amenities: Array<{ value: string; label: string; count: number; icon?: any }>;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  property_ids: [],
  room_types: [],
  gender_preferences: [],
  amenities: [],
  has_attached_bathroom: undefined,
  has_balcony: undefined,
  has_ac: undefined,
  allow_couples: undefined,
  min_rent: 0,
  max_rent: 100000,
  min_capacity: 1,
  max_capacity: 10,
  is_active: true
};

// Color scheme
const colors = {
  primary: '#004ab0',
  secondary: '#f9bd07',
  primaryLight: '#e6f0ff',
  secondaryLight: '#fff4e0'
};

export default function SideFilter({ open, onOpenChange, onFilterChange, hideTrigger = false }: SideFilterProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  
  // Local state for sliders
  const [localRentRange, setLocalRentRange] = useState([DEFAULT_FILTERS.min_rent, DEFAULT_FILTERS.max_rent]);
  const [localCapacityRange, setLocalCapacityRange] = useState([DEFAULT_FILTERS.min_capacity, DEFAULT_FILTERS.max_capacity]);
  
  const [filterData, setFilterData] = useState<FilterData>({
    roomTypes: [],
    genderPreferences: [],
    properties: [],
    amenities: []
  });
  const [loading, setLoading] = useState(false);

  // Fetch filter data
  useEffect(() => {
    fetchFilterData();
  }, []);

  // Sync local slider state with filters when they change externally
  useEffect(() => {
    setLocalRentRange([filters.min_rent, filters.max_rent]);
  }, [filters.min_rent, filters.max_rent]);

  useEffect(() => {
    setLocalCapacityRange([filters.min_capacity, filters.max_capacity]);
  }, [filters.min_capacity, filters.max_capacity]);

  const fetchFilterData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rooms/filters/data');
      const result = await response.json();
      
      if (result.success) {
        // Add icons to amenities for better visual appeal
        const amenitiesWithIcons = result.data.amenities.map((amenity: any, index: number) => {
          const icons = [Wifi, Coffee, Car, Shield, Zap, Users, Home, Hotel, DoorOpen];
          return {
            ...amenity,
            icon: icons[index % icons.length]
          };
        });
        
        setFilterData({
          ...result.data,
          amenities: amenitiesWithIcons
        });
      }
    } catch (error) {
      console.error('Error fetching filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    // Ensure numeric values are properly formatted
    let processedValue = value;
    
    if (key === 'min_rent' || key === 'max_rent' || key === 'min_capacity' || key === 'max_capacity') {
      processedValue = Number(value);
    }
    
    const newFilters = { ...filters, [key]: processedValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSelectChange = (key: 'property_ids' | 'room_types' | 'gender_preferences' | 'amenities', value: string) => {
    // For single select, we'll just set the array with the selected value
    // If value is empty or 'all', set empty array
    if (!value || value === 'all') {
      handleFilterChange(key, []);
    } else {
      handleFilterChange(key, [value]);
    }
  };

  const handleBooleanToggle = (key: 'has_attached_bathroom' | 'has_balcony' | 'has_ac' | 'allow_couples') => {
    const currentValue = filters[key];
    const newValue = currentValue === undefined ? true : currentValue === true ? false : undefined;
    handleFilterChange(key, newValue);
  };

  // Handle rent slider change - updates local state only
  const handleRentSliderChange = (values: number[]) => {
    setLocalRentRange(values);
  };

  // Handle rent slider commit - updates actual filters
  const handleRentSliderCommit = () => {
    const [min, max] = localRentRange;
    if (min <= max) {
      // Only update if values actually changed
      if (filters.min_rent !== min || filters.max_rent !== max) {
        handleFilterChange('min_rent', min);
        handleFilterChange('max_rent', max);
      }
    }
  };

  // Handle capacity slider change - updates local state only
  const handleCapacitySliderChange = (values: number[]) => {
    setLocalCapacityRange(values);
  };

  // Handle capacity slider commit - updates actual filters
  const handleCapacitySliderCommit = () => {
    const [min, max] = localCapacityRange;
    if (min <= max) {
      // Only update if values actually changed
      if (filters.min_capacity !== min || filters.max_capacity !== max) {
        handleFilterChange('min_capacity', min);
        handleFilterChange('max_capacity', max);
      }
    }
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setLocalRentRange([DEFAULT_FILTERS.min_rent, DEFAULT_FILTERS.max_rent]);
    setLocalCapacityRange([DEFAULT_FILTERS.min_capacity, DEFAULT_FILTERS.max_capacity]);
    onFilterChange(DEFAULT_FILTERS);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    
    if (filters.search) count++;
    if (filters.property_ids.length > 0) count++;
    if (filters.room_types.length > 0) count++;
    if (filters.gender_preferences.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.has_attached_bathroom !== undefined) count++;
    if (filters.has_balcony !== undefined) count++;
    if (filters.has_ac !== undefined) count++;
    if (filters.allow_couples !== undefined) count++;
    if (filters.min_rent > 0) count++;
    if (filters.max_rent < 100000) count++;
    if (filters.min_capacity > 1) count++;
    if (filters.max_capacity < 10) count++;
    
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Helper to get display label for selected values
  const getSelectedDisplay = (key: 'property_ids' | 'room_types' | 'gender_preferences' | 'amenities') => {
    const selected = filters[key];
    if (selected.length === 0) return 'All';
    
    if (key === 'property_ids') {
      const property = filterData.properties.find(p => p.id.toString() === selected[0]);
      return property?.name || 'Selected';
    }
    if (key === 'room_types') {
      const type = filterData.roomTypes.find(t => t.value === selected[0]);
      return type?.label || 'Selected';
    }
    if (key === 'gender_preferences') {
      const gender = filterData.genderPreferences.find(g => g.value === selected[0]);
      return gender?.label || 'Selected';
    }
    if (key === 'amenities') {
      const amenity = filterData.amenities.find(a => a.value === selected[0]);
      return amenity?.label || 'Selected';
    }
    return 'Selected';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Only show the trigger button if hideTrigger is false */}
      {!hideTrigger && (
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9 relative"
            style={{ 
              borderColor: colors.primary,
              color: colors.primary 
            }}
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                style={{ backgroundColor: colors.secondary, color: '#000' }}
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
      )}
      
      {/*
        RESPONSIVE WIDTH LOGIC:
        - Mobile (default): w-[50vw]  → half the screen width
        - Tablet (sm):      w-[50vw]  → still half screen
        - Desktop (lg+):    w-full sm:max-w-md  → shadcn default full-width capped at md

        We override SheetContent's default inline style with a className approach.
        The key classes:
          w-[50vw]        – half screen on mobile & tablet
          min-w-[280px]   – never shrink below 280px on very small phones
          sm:w-[380px]    – fixed comfortable width on small-tablet
          lg:w-full       – revert to full width on large screens
          lg:max-w-md     – cap at md on large screens (original desktop behavior)
      */}
      <SheetContent
        side="right"
        className="
          p-0
          w-[50vw]
          min-w-[280px]
          sm:w-[380px]
          lg:w-full
          lg:max-w-md
        "
      >
        <div className="h-full flex flex-col">
          <SheetHeader 
            className="p-6 border-b"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary} 0%, #003d8c 100%)`,
              color: 'white'
            }}
          >
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-white">
                <Filter className="h-5 w-5" style={{ color: colors.secondary }} />
                <span>Filter Rooms</span>
                {activeFilterCount > 0 && (
                  <Badge 
                    className="ml-2"
                    style={{ backgroundColor: colors.secondary, color: '#000' }}
                  >
                    {activeFilterCount} active
                  </Badge>
                )}
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Properties Dropdown */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.primary }}>
                  <Building2 className="h-4 w-4" />
                  Select Property
                </Label>
                <Select
                  value={filters.property_ids[0] || 'all'}
                  onValueChange={(value) => handleSelectChange('property_ids', value)}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-offset-0" 
                    style={{ focusRing: colors.primary }}>
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {filterData.properties.map(property => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{property.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {property.roomCount}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Room Types Dropdown */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.primary }}>
                  <DoorOpen className="h-4 w-4" />
                  Room Type
                </Label>
                <Select
                  value={filters.room_types[0] || 'all'}
                  onValueChange={(value) => handleSelectChange('room_types', value)}
                >
                  <SelectTrigger className="w-full border-gray-300">
                    <SelectValue placeholder="All Room Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Room Types</SelectItem>
                    {filterData.roomTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{type.label}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {type.count}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gender Preferences Dropdown */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.primary }}>
                  <Users2 className="h-4 w-4" />
                  Gender Preference
                </Label>
                <Select
                  value={filters.gender_preferences[0] || 'all'}
                  onValueChange={(value) => handleSelectChange('gender_preferences', value)}
                >
                  <SelectTrigger className="w-full border-gray-300">
                    <SelectValue placeholder="Any Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Gender</SelectItem>
                    {filterData.genderPreferences.map(gender => (
                      <SelectItem key={gender.value} value={gender.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{gender.label}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {gender.count}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rent Range */}
              <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: colors.primaryLight }}>
                <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.primary }}>
                  <IndianRupee className="h-4 w-4" />
                  Rent per Bed
                </Label>
                <div className="pt-2">
                  <Slider
                    min={0}
                    max={100000}
                    step={100}
                    value={localRentRange}
                    onValueChange={handleRentSliderChange}
                    onValueCommit={handleRentSliderCommit}
                    className="mb-4"
                    style={{ 
                      '--slider-track-bg': '#e0e0e0',
                      '--slider-range-bg': colors.primary,
                      '--slider-thumb-bg': colors.secondary
                    } as any}
                  />
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="px-3 py-1 bg-white rounded-full shadow-sm">₹{localRentRange[0].toLocaleString()}</span>
                    <ChevronDown className="h-4 w-4 rotate-270" style={{ color: colors.primary }} />
                    <span className="px-3 py-1 bg-white rounded-full shadow-sm">₹{localRentRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Capacity Range */}
              <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: colors.secondaryLight }}>
                <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.primary }}>
                  <Users className="h-4 w-4" />
                  Capacity (Beds)
                </Label>
                <div className="pt-2">
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={localCapacityRange}
                    onValueChange={handleCapacitySliderChange}
                    onValueCommit={handleCapacitySliderCommit}
                    className="mb-4"
                    style={{ 
                      '--slider-track-bg': '#e0e0e0',
                      '--slider-range-bg': colors.primary,
                      '--slider-thumb-bg': colors.secondary
                    } as any}
                  />
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="px-3 py-1 bg-white rounded-full shadow-sm">
                      {localCapacityRange[0]} bed{localCapacityRange[0] !== 1 ? 's' : ''}
                    </span>
                    <ChevronDown className="h-4 w-4 rotate-270" style={{ color: colors.primary }} />
                    <span className="px-3 py-1 bg-white rounded-full shadow-sm">
                      {localCapacityRange[1]} bed{localCapacityRange[1] !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amenities Dropdown */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.primary }}>
                  <Wifi className="h-4 w-4" />
                  Popular Amenity
                </Label>
                <Select
                  value={filters.amenities[0] || 'all'}
                  onValueChange={(value) => handleSelectChange('amenities', value)}
                >
                  <SelectTrigger className="w-full border-gray-300">
                    <SelectValue placeholder="Any Amenity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Amenity</SelectItem>
                    {filterData.amenities.slice(0, 10).map(amenity => {
                      const Icon = amenity.icon || Wifi;
                      return (
                        <SelectItem key={amenity.value} value={amenity.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5" style={{ color: colors.primary }} />
                            <span>{amenity.label}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {amenity.count}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Boolean Filters */}
              <div className="space-y-3">
                <Label className="text-sm font-medium" style={{ color: colors.primary }}>Features</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={filters.has_attached_bathroom === true ? "default" : 
                            filters.has_attached_bathroom === false ? "destructive" : "outline"}
                    size="sm"
                    className="justify-start gap-2"
                    onClick={() => handleBooleanToggle('has_attached_bathroom')}
                    style={
                      filters.has_attached_bathroom === true 
                        ? { backgroundColor: colors.primary, color: 'white' }
                        : filters.has_attached_bathroom === false
                        ? { backgroundColor: '#ef4444', color: 'white' }
                        : { borderColor: colors.primary, color: colors.primary }
                    }
                  >
                    <Bath className="h-4 w-4" />
                    Bathroom
                    {filters.has_attached_bathroom !== undefined && (
                      <span className="ml-auto text-xs">
                        {filters.has_attached_bathroom ? '✓' : '✗'}
                      </span>
                    )}
                  </Button>

                  <Button
                    variant={filters.has_balcony === true ? "default" : 
                            filters.has_balcony === false ? "destructive" : "outline"}
                    size="sm"
                    className="justify-start gap-2"
                    onClick={() => handleBooleanToggle('has_balcony')}
                    style={
                      filters.has_balcony === true 
                        ? { backgroundColor: colors.primary, color: 'white' }
                        : filters.has_balcony === false
                        ? { backgroundColor: '#ef4444', color: 'white' }
                        : { borderColor: colors.primary, color: colors.primary }
                    }
                  >
                    <Sun className="h-4 w-4" />
                    Balcony
                    {filters.has_balcony !== undefined && (
                      <span className="ml-auto text-xs">
                        {filters.has_balcony ? '✓' : '✗'}
                      </span>
                    )}
                  </Button>

                  <Button
                    variant={filters.has_ac === true ? "default" : 
                            filters.has_ac === false ? "destructive" : "outline"}
                    size="sm"
                    className="justify-start gap-2"
                    onClick={() => handleBooleanToggle('has_ac')}
                    style={
                      filters.has_ac === true 
                        ? { backgroundColor: colors.primary, color: 'white' }
                        : filters.has_ac === false
                        ? { backgroundColor: '#ef4444', color: 'white' }
                        : { borderColor: colors.primary, color: colors.primary }
                    }
                  >
                    <Wind className="h-4 w-4" />
                    AC
                    {filters.has_ac !== undefined && (
                      <span className="ml-auto text-xs">
                        {filters.has_ac ? '✓' : '✗'}
                      </span>
                    )}
                  </Button>

                  <Button
                    variant={filters.allow_couples === true ? "default" : 
                            filters.allow_couples === false ? "destructive" : "outline"}
                    size="sm"
                    className="justify-start gap-2"
                    onClick={() => handleBooleanToggle('allow_couples')}
                    style={
                      filters.allow_couples === true 
                        ? { backgroundColor: colors.primary, color: 'white' }
                        : filters.allow_couples === false
                        ? { backgroundColor: '#ef4444', color: 'white' }
                        : { borderColor: colors.primary, color: colors.primary }
                    }
                  >
                    <Heart className="h-4 w-4" />
                    Couples
                    {filters.allow_couples !== undefined && (
                      <span className="ml-auto text-xs">
                        {filters.allow_couples ? '✓' : '✗'}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 border-t" style={{ backgroundColor: '#f9fafb' }}>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={resetFilters}
                disabled={loading}
                style={{ borderColor: colors.primary, color: colors.primary }}
              >
                <RefreshCw className="h-4 w-4" />
                Reset All
              </Button>
              <Button
                className="flex-1 text-white"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                style={{ backgroundColor: colors.primary }}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}