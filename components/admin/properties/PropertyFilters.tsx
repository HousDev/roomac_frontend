// components/admin/properties/PropertyFilters.tsx
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  SlidersHorizontal,
  CheckCircle,
  Tag,
  MapPin,
  Users,
  Bed,
  Filter,
  RotateCcw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PropertyFilterState {
  status: string;       // "all" | "true" | "false"
  tag: string;          // "all" | tag name (lowercase)
  manager: string;      // "all" | manager name
  location: string;     // "all" | area name
  availability: string; // "all" | "available" | "partial" | "full"
}

export const DEFAULT_PROPERTY_FILTERS: PropertyFilterState = {
  status: "all",
  tag: "all",
  manager: "all",
  location: "all",
  availability: "all",
};

interface PropertyFiltersProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  filters: PropertyFilterState;
  onFiltersChange: (filters: PropertyFilterState) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  filteredPropertiesLength: number;
  propertiesLength: number;
  uniqueTags: string[];
  properties: Array<{
    id: string;
    area?: string;
    property_manager_name?: string;
    total_beds?: number;
    occupied_beds?: number;
    is_active?: boolean;
  }>;
  rooms?: Array<{
    id: number;
    property_id: number;
    total_bed: number;
    occupied_beds: number;
  }>;
}

const colors = { primary: "#004ab0", secondary: "#f9bd07" };

function FLabel({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <Label className="text-[11px] font-semibold text-gray-600 flex items-center gap-1.5 mb-1.5">
      <Icon className="h-3.5 w-3.5" style={{ color: colors.primary }} />
      {children}
    </Label>
  );
}

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: colors.primary }}
    >
      {label}
      <button type="button" onClick={onRemove} className="hover:opacity-70">
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

export default function PropertyFilters({
  sidebarOpen,
  setSidebarOpen,
  filters,
  onFiltersChange,
  onClearFilters,
  onApplyFilters,
  filteredPropertiesLength,
  propertiesLength,
  uniqueTags,
  properties,
  rooms,
}: PropertyFiltersProps) {

  const set = (key: keyof PropertyFilterState, val: string) =>
    onFiltersChange({ ...filters, [key]: val });

  const uniqueManagers = useMemo(() => {
    const s = new Set<string>();
    properties.forEach((p) => {
      if (p.property_manager_name?.trim()) s.add(p.property_manager_name.trim());
    });
    return Array.from(s).sort();
  }, [properties]);

  const uniqueLocations = useMemo(() => {
    const s = new Set<string>();
    properties.forEach((p) => {
      if (p.area?.trim()) s.add(p.area.trim());
    });
    return Array.from(s).sort();
  }, [properties]);

  // Availability based on occupied_beds vs total_beds
 // Replace the entire availCounts useMemo block
const availCounts = useMemo(() => {
  const counts = { available: 0, partial: 0, full: 0, total: 0, availableBeds: 0 };

  if (rooms && rooms.length > 0) {
    // Group rooms by property_id
    const propertyMap = new Map<number, { total: number; occupied: number }>();
    for (const room of rooms) {
      const propId = room.property_id;
      if (!propertyMap.has(propId)) {
        propertyMap.set(propId, { total: 0, occupied: 0 });
      }
      const prop = propertyMap.get(propId)!;
      prop.total += room.total_bed || 0;
      prop.occupied += room.occupied_beds || 0;
    }

    for (const { total, occupied } of propertyMap.values()) {
      counts.total++;
      if (occupied === 0) {
        counts.available++;
        counts.availableBeds += total;
      } else if (total > 0 && occupied >= total) {
        counts.full++;
      } else if (occupied > 0 && occupied < total) {
        counts.partial++;
        counts.availableBeds += (total - occupied);
      } else {
        // fallback
        counts.available++;
        counts.availableBeds += total;
      }
    }
  } else {
    // Fallback to property-based calculation (original logic)
    for (const p of properties) {
      const occ = p.occupied_beds || 0;
      const tot = p.total_beds || 0;
      counts.total++;
      if (occ === 0) {
        counts.available++;
        counts.availableBeds += tot;
      } else if (tot > 0 && occ >= tot) {
        counts.full++;
      } else if (occ > 0 && occ < tot) {
        counts.partial++;
        counts.availableBeds += (tot - occ);
      } else {
        counts.available++;
        counts.availableBeds += tot;
      }
    }
  }

  return counts;
}, [rooms, properties]);

  const activeCount = useMemo(
    () => Object.values(filters).filter((v) => v !== "all").length,
    [filters]
  );

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
  className={`fixed top-0 right-0 h-full z-40 flex flex-col bg-white shadow-2xl
    transition-transform duration-300 ease-in-out
    w-[75%] sm:w-[340px]
    ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
>
        {/* Header */}
        <div
          className="flex-shrink-0 px-2 py-2 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #002f7a 100%)` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-[13px] leading-tight">Filter Properties</h2>
              <p className="text-[10px] text-blue-200 leading-tight mt-0.5">
                {filteredPropertiesLength} of {propertiesLength} shown
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: colors.secondary, color: "#000" }}
              >
                {activeCount} active
              </span>
            )}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Active pills */}
        {activeCount > 0 && (
          <div className="flex-shrink-0 px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex flex-wrap gap-1.5">
            {filters.status !== "all" && (
              <Pill
                label={filters.status === "true" ? "Active" : "Inactive"}
                onRemove={() => set("status", "all")}
              />
            )}
            {filters.availability !== "all" && (
              <Pill
                label={`Avail: ${filters.availability}`}
                onRemove={() => set("availability", "all")}
              />
            )}
            {filters.location !== "all" && (
              <Pill label={`Area: ${filters.location}`} onRemove={() => set("location", "all")} />
            )}
            {filters.tag !== "all" && (
              <Pill label={`Tag: ${filters.tag}`} onRemove={() => set("tag", "all")} />
            )}
            {filters.manager !== "all" && (
              <Pill label={`Mgr: ${filters.manager}`} onRemove={() => set("manager", "all")} />
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-5">

          {/* Status */}
          <div>
            <FLabel icon={CheckCircle}>Status</FLabel>
            <Select value={filters.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="h-9 text-[12px] border-gray-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">All Status</SelectItem>
                <SelectItem value="true" className="text-[12px]">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Active
                  </span>
                </SelectItem>
                <SelectItem value="false" className="text-[12px]">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                    Inactive
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Availability */}
          <div>
            <FLabel icon={Bed}>Availability</FLabel>
            <Select value={filters.availability} onValueChange={(v) => set("availability", v)}>
              <SelectTrigger className="h-9 text-[12px] border-gray-200">
                <SelectValue placeholder="Any Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">
                  Any Availability ({availCounts.total})
                </SelectItem>
               <SelectItem value="available" className="text-[12px]">
  <span className="flex items-center justify-between w-full gap-3">
    <span className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
      Available
    </span>
    <span className="text-[10px] text-gray-400">{availCounts.available} props · {availCounts.availableBeds} beds free</span>
  </span>
</SelectItem>
<SelectItem value="partial" className="text-[12px]">
  <span className="flex items-center justify-between w-full gap-3">
    <span className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
      Partial Available
    </span>
    <span className="text-[10px] text-gray-400">{availCounts.partial} props</span>
  </span>
</SelectItem>
<SelectItem value="full" className="text-[12px]">
  <span className="flex items-center justify-between w-full gap-3">
    <span className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
      Fully Occupied
    </span>
    <span className="text-[10px] text-gray-400">{availCounts.full} props</span>
  </span>
</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          {uniqueLocations.length > 0 && (
            <div>
              <FLabel icon={MapPin}>Location / Area</FLabel>
              <Select value={filters.location} onValueChange={(v) => set("location", v)}>
                <SelectTrigger className="h-9 text-[12px] border-gray-200">
                  <SelectValue placeholder="Any Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[12px]">Any Location</SelectItem>
                  {uniqueLocations.map((loc) => (
                    <SelectItem key={loc} value={loc} className="text-[12px]">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {loc}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tags */}
          {uniqueTags.length > 0 && (
            <div>
              <FLabel icon={Tag}>Tag</FLabel>
              <Select value={filters.tag} onValueChange={(v) => set("tag", v)}>
                <SelectTrigger className="h-9 text-[12px] border-gray-200">
                  <SelectValue placeholder="Any Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[12px]">Any Tag</SelectItem>
                  {uniqueTags.map((tag) => (
                    <SelectItem key={tag} value={tag.toLowerCase()} className="text-[12px]">
                      <span className="flex items-center gap-2">
                        <Tag className="h-3 w-3 text-gray-400" />
                        {tag}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Manager */}
          {uniqueManagers.length > 0 && (
            <div>
              <FLabel icon={Users}>Manager</FLabel>
              <Select value={filters.manager} onValueChange={(v) => set("manager", v)}>
                <SelectTrigger className="h-9 text-[12px] border-gray-200">
                  <SelectValue placeholder="Any Manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[12px]">Any Manager</SelectItem>
                  {uniqueManagers.map((mgr) => (
                    <SelectItem key={mgr} value={mgr} className="text-[12px]">
                      <span className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-gray-400" />
                        {mgr}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="text-[11px] text-gray-500 mb-2.5 text-center">
            Showing{" "}
            <span className="font-bold" style={{ color: colors.primary }}>
              {filteredPropertiesLength}
            </span>{" "}
            of <span className="font-bold">{propertiesLength}</span> properties
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-9 text-[12px] gap-1.5"
              style={{ borderColor: colors.primary, color: colors.primary }}
              onClick={onClearFilters}
              disabled={activeCount === 0}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button
              type="button"
              className="flex-1 h-9 text-[12px] text-white gap-1.5"
              style={{ backgroundColor: colors.primary }}
              onClick={() => {
                onApplyFilters();
                setSidebarOpen(false);
              }}
            >
              <Filter className="h-3.5 w-3.5" />
              Apply
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}