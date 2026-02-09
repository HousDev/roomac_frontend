"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Filter } from 'lucide-react';

interface RoomsFiltersProps {
  selectedRoomType: string;
  selectedGenderPref: string;
  onRoomTypeChange: (value: string) => void;
  onGenderPrefChange: (value: string) => void;
  roomTypes: Array<{ value: string; label: string }>;
  genderFilters: Array<{ value: string; label: string }>;
}

export default function RoomsFilters({
  selectedRoomType,
  selectedGenderPref,
  onRoomTypeChange,
  onGenderPrefChange,
  roomTypes,
  genderFilters
}: RoomsFiltersProps) {
  const [open, setOpen] = useState(false);

  const handleClearFilters = () => {
    onRoomTypeChange('all');
    onGenderPrefChange('all');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 bg-white"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4" align="end" side="right">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Room Type</Label>
            <Select value={selectedRoomType} onValueChange={onRoomTypeChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Gender Preference</Label>
            <Select value={selectedGenderPref} onValueChange={onGenderPrefChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                {genderFilters.map(filter => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setOpen(false)}
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}