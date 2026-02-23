

// app/admin/offers/components/OffersFilters.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, Building } from "lucide-react";
import { PropertyApiResponse } from "./OffersClientPage";

interface OffersFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterProperty: string;
  setFilterProperty: (property: string) => void;
  itemsPerPage: string;
  setItemsPerPage: (value: string) => void;
  properties: PropertyApiResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const OffersFilters = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterProperty,
  setFilterProperty,
  itemsPerPage,
  setItemsPerPage,
  properties,
  pagination,
}: OffersFiltersProps) => {
  const startItem = (pagination.currentPage - 1) * pagination.limit + 1;
  const endItem = Math.min(
    pagination.currentPage * pagination.limit,
    pagination.totalItems
  );

  return (
    <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">

      {/* 🔹 TOP ROW — Search + Filters + Showing + Items */}
      <div className="flex flex-wrap items-center justify-between gap-3">

        {/* LEFT SECTION */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">

          {/* Search */}
          <div className="relative flex-1 min-w-[120px] lg:w-80">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>

          {/* Type Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9 text-sm w-[120px] lg:w-[160px]">
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="All Types" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="seasonal">Seasonal</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="early_booking">Early Booking</SelectItem>
            </SelectContent>
          </Select>

          {/* Property Filter */}
          <Select value={filterProperty} onValueChange={setFilterProperty}>
            <SelectTrigger className="h-9 text-sm w-[130px] lg:w-[180px]">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <SelectValue placeholder="All Properties" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="general">General Offers</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">

          {/* Showing text */}
          <div className="whitespace-nowrap">
            Showing <span className="font-semibold">{startItem}</span>-
            <span className="font-semibold">{endItem}</span> of{" "}
            <span className="font-semibold">{pagination.totalItems}</span>
          </div>

          {/* Items per page */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Label className="text-sm text-gray-600">
              Items:
            </Label>
            <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
              <SelectTrigger className="w-16 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Button */}
          {searchQuery && (
            <Button
              variant="ghost"
              onClick={() => setSearchQuery("")}
              className="h-8 text-sm px-2"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OffersFilters;
