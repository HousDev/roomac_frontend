"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  Filter,
  X,
  Bath,
  Sun,
  Wind,
  Heart,
  IndianRupee,
  Users,
  Building2,
  RefreshCw
} from 'lucide-react';

interface SideFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilterChange: (filters: FilterState) => void;
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
  amenities: Array<{ value: string; label: string; count: number }>;
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

export default function SideFilter({ open, onOpenChange, onFilterChange }: SideFilterProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  
  // Local state for sliders - THIS IS THE KEY FIX
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
        setFilterData(result.data);
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

  const handleToggleArray = (key: 'property_ids' | 'room_types' | 'gender_preferences' | 'amenities', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleFilterChange(key, newArray);
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 relative">
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-6 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Rooms
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Search */}
              <div className="space-y-3">
                <Label>Search</Label>
                <Input
                  placeholder="Search rooms..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              {/* Properties */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Properties ({filters.property_ids.length})
                </Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filterData.properties.map(property => (
                    <div key={property.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`property-${property.id}`}
                        checked={filters.property_ids.includes(property.id.toString())}
                        onCheckedChange={() => 
                          handleToggleArray('property_ids', property.id.toString())
                        }
                      />
                      <Label
                        htmlFor={`property-${property.id}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        <div className="font-medium">{property.name}</div>
                        <div className="text-xs text-gray-500">{property.address}</div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {property.roomCount} rooms
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Types */}
              <div className="space-y-3">
                <Label>Room Types ({filters.room_types.length})</Label>
                <div className="space-y-2">
                  {filterData.roomTypes.map(type => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type.value}`}
                        checked={filters.room_types.includes(type.value)}
                        onCheckedChange={() => handleToggleArray('room_types', type.value)}
                      />
                      <Label
                        htmlFor={`type-${type.value}`}
                        className="flex-1 cursor-pointer text-sm flex items-center justify-between"
                      >
                        <span>{type.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {type.count}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Preferences */}
              <div className="space-y-3">
                <Label>Gender Preferences ({filters.gender_preferences.length})</Label>
                <div className="space-y-2">
                  {filterData.genderPreferences.map(gender => (
                    <div key={gender.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`gender-${gender.value}`}
                        checked={filters.gender_preferences.includes(gender.value)}
                        onCheckedChange={() => handleToggleArray('gender_preferences', gender.value)}
                      />
                      <Label
                        htmlFor={`gender-${gender.value}`}
                        className="flex-1 cursor-pointer text-sm flex items-center justify-between"
                      >
                        <span>{gender.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {gender.count}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rent Range - COMPLETELY FIXED */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Rent per Bed
                </Label>
                <div className="pt-4">
                  <Slider
                    min={0}
                    max={100000}
                    step={100}
                    value={localRentRange}
                    onValueChange={handleRentSliderChange}
                    onValueCommit={handleRentSliderCommit}
                    className="mb-4"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>₹{localRentRange[0].toLocaleString()}</span>
                    <span>₹{localRentRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Capacity Range - COMPLETELY FIXED */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Capacity (Beds)
                </Label>
                <div className="pt-4">
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={localCapacityRange}
                    onValueChange={handleCapacitySliderChange}
                    onValueCommit={handleCapacitySliderCommit}
                    className="mb-4"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>{localCapacityRange[0]} bed{localCapacityRange[0] !== 1 ? 's' : ''}</span>
                    <span>{localCapacityRange[1]} bed{localCapacityRange[1] !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <Label>Amenities ({filters.amenities.length})</Label>
                <div className="grid grid-cols-2 gap-2">
                  {filterData.amenities.slice(0, 10).map(amenity => (
                    <div key={amenity.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity.value}`}
                        checked={filters.amenities.includes(amenity.value)}
                        onCheckedChange={() => handleToggleArray('amenities', amenity.value)}
                        className="h-4 w-4"
                      />
                      <Label
                        htmlFor={`amenity-${amenity.value}`}
                        className="cursor-pointer text-xs flex items-center justify-between flex-1"
                      >
                        <span className="truncate">{amenity.label}</span>
                        <Badge variant="outline" className="ml-1 text-xs">
                          {amenity.count}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Boolean Filters */}
              <div className="space-y-3">
                <Label>Features</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={filters.has_attached_bathroom === true ? "default" : 
                            filters.has_attached_bathroom === false ? "destructive" : "outline"}
                    size="sm"
                    className="justify-start gap-2"
                    onClick={() => handleBooleanToggle('has_attached_bathroom')}
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

          <div className="p-6 border-t bg-gray-50">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={resetFilters}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" />
                Reset All
              </Button>
              <Button
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={loading}
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