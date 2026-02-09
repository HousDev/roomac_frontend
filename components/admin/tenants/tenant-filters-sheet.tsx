// components/admin/tenants/tenant-filters-sheet.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import type { TenantFilters } from "@/lib/tenantApi";

interface TenantFiltersSheetProps {
  activeFiltersCount: number;
  onFilterChange: (filters: TenantFilters) => void;
  currentFilters?: TenantFilters;
}

export function TenantFiltersSheet({ 
  activeFiltersCount, 
  onFilterChange,
  currentFilters = {} 
}: TenantFiltersSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<TenantFilters>(currentFilters);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setLocalFilters(currentFilters);
    }
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onFilterChange({});
    setIsOpen(false);
  };

  const handleApplyFilters = () => {
    // Clean up empty string values
    // const cleanedFilters: TenantFilters = {};
    // Object.entries(localFilters).forEach(([key, value]) => {
    //   if (value !== "" && value !== undefined && value !== null) {
    //     cleanedFilters[key as keyof TenantFilters] = value;
    //   }
    // });
    const cleanedFilters: TenantFilters = {};

(Object.entries(localFilters) as [keyof TenantFilters, any][]).forEach(([key, value]) => {
  if (value !== "" && value !== undefined && value !== null) {
    cleanedFilters[key] = value;
  }
});

    
    onFilterChange(cleanedFilters);
    setIsOpen(false);
  };

  const handleSelectChange = (key: keyof TenantFilters, value: string) => {
    setLocalFilters(prev => ({ 
      ...prev, 
      [key]: value === "all" ? undefined : value 
    }));
  };

  const handleInputChange = (key: keyof TenantFilters, value: string) => {
    setLocalFilters(prev => ({ 
      ...prev, 
      [key]: value.trim() === "" ? undefined : value 
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 h-9"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Advanced Filters
            </SheetTitle>
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-slate-600">
                Active filters: {activeFiltersCount}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs h-7"
              >
                Clear all
              </Button>
            </div>
          )}
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Status & Access</h3>
            
            <div className="space-y-2">
              <Label className="text-xs">Account Status</Label>
              <Select
                value={String(localFilters.is_active) || "all"}
                onValueChange={(value) => handleSelectChange("is_active", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Portal Access</Label>
              <Select
                value={String(localFilters.portal_access_enabled) || "all"}
                onValueChange={(value) => handleSelectChange("portal_access_enabled", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Login Status</Label>
              <Select
                value={String(localFilters.has_credentials) || "all"}
                onValueChange={(value) => handleSelectChange("has_credentials", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Has Login</SelectItem>
                  <SelectItem value="false">No Login</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Personal Information</h3>
            
            <div className="space-y-2">
              <Label className="text-xs">Gender</Label>
              <Select
                value={localFilters.gender || "all"}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Occupation</Label>
              <Select
                value={localFilters.occupation_category || "all"}
                onValueChange={(value) => handleSelectChange("occupation_category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Location</h3>
            <div className="space-y-2">
              <Label className="text-xs">City</Label>
              <Input
                placeholder="Enter city"
                value={localFilters.city || ""}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">State</Label>
              <Input
                placeholder="Enter state"
                value={localFilters.state || ""}
                onChange={(e) => handleInputChange("state", e.target.value)}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Preferences</h3>
            <div className="space-y-2">
              <Label className="text-xs">Sharing Type</Label>
              <Select
                value={localFilters.preferred_sharing || "all"}
                onValueChange={(value) => handleSelectChange("preferred_sharing", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="triple">Triple</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="sticky bottom-0 pt-4 border-t mt-6">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="flex-1"
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