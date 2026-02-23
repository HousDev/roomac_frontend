


// app/admin/offers/components/OffersTable.tsx
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Offer } from "@/lib/offerApi";
import { PropertyApiResponse } from "./OffersClientPage";
import {
  Building,
  Key,
  Ticket,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Share2,
  Search,
  X,
  Plus,
  Filter,
  Percent,
  Clock,
  CalendarDays,
  Power,
} from "lucide-react";
import Pagination from "./Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface OffersTableProps {
  offers: Offer[];
  loading: boolean;
  properties: PropertyApiResponse[];
  onEdit: (offer: Offer) => void;
  onDelete: (offerId: string) => void;
  onToggleActive: (offerId: string, currentStatus: boolean) => void;
  onPreview: (offer: Offer) => void;
  onShare: (offer: Offer) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange: (page: number) => void;
  onCreateNew: () => void;
}

interface ColumnFilters {
  code: string;
  title: string;
  property: string;
  discount: string;
  minStay: string;
  validity: string;
  status: string;
}

const OffersTable = ({
  offers,
  loading,
  properties,
  onEdit,
  onDelete,
  onToggleActive,
  onPreview,
  onShare,
  pagination,
  onPageChange,
  onCreateNew,
}: OffersTableProps) => {
  const [filters, setFilters] = useState<ColumnFilters>({
    code: "",
    title: "",
    property: "",
    discount: "",
    minStay: "",
    validity: "",
    status: "",
  });

  const [filteredOffers, setFilteredOffers] = useState<Offer[]>(offers);

  useEffect(() => {
    const filtered = offers.filter((offer) => {
      const matchesCode = offer.code.toLowerCase().includes(filters.code.toLowerCase());
      const matchesTitle = 
        offer.title.toLowerCase().includes(filters.title.toLowerCase()) ||
        (offer.description?.toLowerCase() || "").includes(filters.title.toLowerCase());
      
      const propertyText = `${offer.property_name || ""} ${offer.room_number || ""} ${offer.sharing_type || ""}`.toLowerCase();
      const matchesProperty = propertyText.includes(filters.property.toLowerCase());
      
      const discountText = offer.discount_type === "percentage" 
        ? `${offer.discount_percent}% off`
        : `₹${offer.discount_value} off`;
      const matchesDiscount = discountText.toLowerCase().includes(filters.discount.toLowerCase());
      
      const matchesMinStay = offer.min_months.toString().includes(filters.minStay);
      
      const validityText = `${offer.start_date || ""} ${offer.end_date || ""}`.toLowerCase();
      const matchesValidity = validityText.includes(filters.validity.toLowerCase());
      
      const matchesStatus = filters.status === "all" || filters.status === "" || 
        (filters.status === "active" && offer.is_active) ||
        (filters.status === "inactive" && !offer.is_active);

      return matchesCode && matchesTitle && matchesProperty && 
             matchesDiscount && matchesMinStay && matchesValidity && matchesStatus;
    });
    setFilteredOffers(filtered);
  }, [offers, filters]);

  const handleFilterChange = (column: keyof ColumnFilters, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const clearFilters = () => {
    setFilters({
      code: "",
      title: "",
      property: "",
      discount: "",
      minStay: "",
      validity: "",
      status: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "" && v !== "all");

  const renderPropertyInfo = (offer: Offer) => {
    if (!offer.property_name) {
      return (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="text-gray-500 text-xs">General Offer</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1">
          <Building className="h-3 w-3 text-purple-500 flex-shrink-0" />
          <span className="font-medium text-xs truncate max-w-[100px]">{offer.property_name}</span>
        </div>
        {offer.room_number && (
          <div className="flex flex-wrap items-center gap-1 text-[10px] text-gray-600">
            <Key className="h-2 w-2 flex-shrink-0" />
            <span className="truncate max-w-[50px]">{offer.room_number}</span>
            {offer.sharing_type && (
              <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 capitalize">
                {offer.sharing_type}
              </Badge>
            )}
            {offer.rent_per_bed && (
              <span className="text-[9px] text-green-600 whitespace-nowrap">
                ₹{offer.rent_per_bed}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <OffersTableSkeleton />;
  }

  return (
    <>
      {/* Header with Create Button */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Offer Management</h2>
          <p className="text-sm text-gray-500">Create and manage promotional offers for properties and rooms</p>
        </div>
        <Button onClick={onCreateNew} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Create New Offer
        </Button>
      </div> */}

      {/* Global Search and Filters */}
      {/* <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search offers by code, title, property, room, discount..."
              value={filters.title}
              onChange={(e) => handleFilterChange("title", e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={filters.status} onValueChange={(v) => handleFilterChange("status", v)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((prop) => (
                  <SelectItem key={prop.id} value={prop.id.toString()}>
                    {prop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="px-3">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div> */}

      {/* Results count */}
      {/* <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-600">
          Showing {filteredOffers.length} of {pagination.totalItems} offers
        </p>
      </div> */}

      {/* Table Container */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="max-h-[340px] md:max-h-[340px] overflow-y-auto">
              <Table className="min-w-full">
                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                  {/* Header Row */}
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[80px]">Code</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[150px]">Offer Details</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[150px]">Property / Room</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[80px]">Discount</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[70px]">Min Stay</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[130px]">Validity</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[80px]">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 py-2 px-2 whitespace-nowrap w-[120px]">Actions</TableHead>
                  </TableRow>
                  
                  {/* Filter Row - Exactly like the image with "Filter" in each column */}
                  <TableRow className="bg-gray-50/50 border-b border-gray-200">
                    <TableHead className="py-1.5 px-2">
                      <Input
                        placeholder="Filter"
                        value={filters.code}
                        onChange={(e) => handleFilterChange("code", e.target.value)}
                        className="h-7 text-xs border-gray-200"
                      />
                    </TableHead>
                    <TableHead className="py-1.5 px-2">
                      <Input
                        placeholder="Filter"
                        value={filters.title}
                        onChange={(e) => handleFilterChange("title", e.target.value)}
                        className="h-7 text-xs border-gray-200"
                      />
                    </TableHead>
                    <TableHead className="py-1.5 px-2">
                      <Input
                        placeholder="Filter"
                        value={filters.property}
                        onChange={(e) => handleFilterChange("property", e.target.value)}
                        className="h-7 text-xs border-gray-200"
                      />
                    </TableHead>
                    <TableHead className="py-1.5 px-2">
                      <Input
                        placeholder="Filter"
                        value={filters.discount}
                        onChange={(e) => handleFilterChange("discount", e.target.value)}
                        className="h-7 text-xs border-gray-200"
                      />
                    </TableHead>
                    <TableHead className="py-1.5 px-2">
                      <Input
                        placeholder="Filter"
                        value={filters.minStay}
                        onChange={(e) => handleFilterChange("minStay", e.target.value)}
                        className="h-7 text-xs border-gray-200"
                      />
                    </TableHead>
                    <TableHead className="py-1.5 px-2">
                      <Input
                        placeholder="Filter"
                        value={filters.validity}
                        onChange={(e) => handleFilterChange("validity", e.target.value)}
                        className="h-7 text-xs border-gray-200"
                      />
                    </TableHead>
                    <TableHead className="py-1.5 px-2">
                      <Select value={filters.status} onValueChange={(v) => handleFilterChange("status", v)}>
                        <SelectTrigger className="h-7 text-xs border-gray-200">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableHead>
                    <TableHead className="py-1.5 px-2">
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="h-7 w-full text-xs border border-gray-200"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {filteredOffers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Filter className="h-8 w-8 text-gray-300" />
                          <p className="text-sm text-gray-500">No offers found</p>
                          {hasActiveFilters && (
                            <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">
                              Clear Filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOffers.map((offer) => (
                      <TableRow key={offer.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                        <TableCell className="py-1.5 px-2">
                          <div className="flex items-center gap-1">
                            <Ticket className="h-3 w-3 text-blue-500 flex-shrink-0" />
                            <span className="font-mono font-semibold text-blue-700 text-xs">
                              {offer.code}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5 px-2">
                          <div>
                            <p className="font-medium text-xs text-gray-800 truncate max-w-[120px]">
                              {offer.title}
                            </p>
                            <p className="text-[9px] text-slate-500 truncate max-w-[120px] mt-0.5">
                              {offer.description || offer.offer_type.replace('_', ' ')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5 px-2">
                          {renderPropertyInfo(offer)}
                        </TableCell>
                        <TableCell className="py-1.5 px-2">
                          <Badge variant="secondary" className={`
                            text-[9px] px-1 py-0 h-4 font-medium whitespace-nowrap
                            ${offer.discount_type === "percentage"
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200"
                              : "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200"
                            }
                          `}>
                            {offer.discount_type === "percentage" ? (
                              <span>{offer.discount_percent}% OFF</span>
                            ) : (
                              <span>₹{offer.discount_value} OFF</span>
                            )}
                          </Badge>
                        </TableCell>
                       <TableCell className="py-1.5 px-2">
  <div className="flex items-center gap-1">
    <Clock className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
    <span className="text-xs whitespace-nowrap">
      {offer.min_months} {offer.min_months === 1 ? "month" : "months"}
    </span>
  </div>
</TableCell>

                        <TableCell className="py-1.5 px-2">
                          <div className="text-[9px]">
                            {offer.start_date ? (
                              <>
                                <div className="flex items-center gap-1">
                                  <CalendarDays className="h-2.5 w-2.5 text-slate-500 flex-shrink-0" />
                                  <span className="whitespace-nowrap">
                                    {new Date(offer.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit'})}
                                  </span>
                                </div>
                                {offer.end_date && (
                                  <p className="text-slate-400 mt-0.5 whitespace-nowrap">
                                    to {new Date(offer.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit'})}
                                  </p>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">No dates</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5 px-2">
                          <Button
                            size="sm"
                            variant={offer.is_active ? "default" : "outline"}
                            onClick={() => onToggleActive(offer.id, offer.is_active)}
                            className={`
                              h-5 text-[9px] px-1.5 font-medium w-14
                              ${offer.is_active
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
                                : "border-gray-300 hover:border-gray-400 text-gray-600"
                            }
                          `}>
                            {offer.is_active ? "Active" : "Inactive"}
                          </Button>
                        </TableCell>
                        <TableCell className="py-1.5 px-2">
                          <div className="flex items-center gap-0.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onPreview(offer)}
                              className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="Preview"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEdit(offer)}
                              className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDelete(offer.id)}
                              className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onShare(offer)}
                              className="h-6 w-6 p-0 hover:bg-green-50 hover:text-green-600"
                              title="Share"
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Footer with Pagination */}
      <div className="border-t border-gray-200 bg-white 
                px-3 py-1.5 sm:px-4 sm:py-2">

  <div className="flex flex-col sm:flex-row 
                  items-center justify-between 
                  gap-1 sm:gap-2">

    {/* 🔹 Top Info Row */}
    <div className="flex items-center justify-center sm:justify-start
                    gap-3 text-[11px] sm:text-xs text-gray-600 w-full sm:w-auto">

      <span>Items: {pagination.limit}</span>

      <span className="text-gray-300">|</span>

      <span>
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
    </div>

    {/* 🔹 Pagination */}
    {pagination.totalPages > 1 && (
      <div className="w-full sm:w-auto flex justify-center sm:justify-end">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          className="py-0 text-[11px] sm:text-xs"
        />
      </div>
    )}

  </div>
</div>

      </div>
    </>
  );
};

export const OffersTableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-6 w-40" />
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableHead key={i} className="py-2 px-2">
                    <Skeleton className="h-3 w-16" />
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableHead key={i} className="py-1.5 px-2">
                    <Skeleton className="h-7 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: 8 }).map((_, colIndex) => (
                    <TableCell key={colIndex} className="py-1.5 px-2">
                      {colIndex === 6 ? (
                        <Skeleton className="h-5 w-14" />
                      ) : colIndex === 7 ? (
                        <div className="flex gap-0.5">
                          <Skeleton className="h-6 w-6" />
                          <Skeleton className="h-6 w-6" />
                          <Skeleton className="h-6 w-6" />
                          <Skeleton className="h-6 w-6" />
                        </div>
                      ) : (
                        <Skeleton className="h-3 w-full" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  </div>
);

export default OffersTable;