// component/rooms/rooms-client.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DoorOpen,
  Plus,
  Search,
  Bed,
  Users,
  Building2,
  RefreshCw,
  Download,
  Upload,
  Check,
  X,
  Trash2,
  BedDouble,
  Filter,
  Clock,
  CheckCircle,
  Loader2,
  BedIcon,
  ChevronRight,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  type RoomResponse,
  processPhotoUrls,
  getMediaUrl,
  getFilteredRooms,
} from "@/lib/roomsApi";
import { format } from "date-fns";

// Import optimized components
import RoomsGrid from "./rooms-grid";
import RoomsPagination from "./rooms-pagination";
import { RoomForm } from "./room-form";
import { BedManagementDialog } from "./bed-management-dialog";
import { PhotoGalleryModal } from "./PhotoGalleryModal";
import { RoomDetailsDialog } from "./RoomDetailsDialog";
import { useAuth } from "@/context/authContext";

// Import new components
import SideFilter from "./side-filter";
import BulkActions from "./bulk-actions";
import RoomImportModal from "./room-import-modal";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { getAvailabilitySummary } from "@/lib/roomsApi";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';

// Types
interface RoomsClientProps {
  initialRooms: RoomResponse[];
  initialProperties: any[];
}

interface FilterState {
  availability_status: string;
  search: string;
  property_ids: string[];
  room_types: string[];
    sharing_types: string[];

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
  floors: number[];
  available_from_date: string;
  available_to_date: string;
}

// Safely normalize MySQL boolean-ish values (handles 0/1, "0"/"1", true/false, Buffer)
const toBool = (val: any): boolean => {
  if (val === null || val === undefined) return false;
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val === 1;
  if (typeof val === "string") return val === "1" || val.toLowerCase() === "true";
  if (Buffer.isBuffer?.(val)) return val[0] === 1;
  return Boolean(val);
};
export default function RoomsClient({
  initialRooms,
  initialProperties,
}: RoomsClientProps) {
  const router = useRouter();
  // State management with safe defaults
  const [rooms, setRooms] = useState<RoomResponse[]>(
    Array.isArray(initialRooms) ? initialRooms : [],
  );
  const [properties, setProperties] = useState(
    Array.isArray(initialProperties) ? initialProperties : [],
  );
  const [loading, setLoading] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  // Dialog states
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [bedDialogOpen, setBedDialogOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Editing state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
  const [selectedGalleryRoom, setSelectedGalleryRoom] =
    useState<RoomResponse | null>(null);
    

  // Availability state - using Sheet (sidebar) instead of popover
  const [availabilitySidebarOpen, setAvailabilitySidebarOpen] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilitySummary, setAvailabilitySummary] = useState<any>(null);
  const [upcomingVacates, setUpcomingVacates] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    properties.length > 0 ? properties[0]?.id : null
  );

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all");
  const [selectedGenderPref, setSelectedGenderPref] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>();
  const itemsPerPage = 12;
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const { can } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    property_id: "",
    room_number: "",
    sharing_type: "",
    room_type: "",
    capacity: 0,
    rent_per_bed: 0,
    floor: "",
    has_attached_bathroom: false,
    has_balcony: false,
    has_ac: false,
    amenities: [] as string[],
    photo_labels: {} as { [key: string]: string },
    photos: [] as File[],
    video: null as File | null,
    video_label: "",
    room_gender_preference: [] as string[],
    allow_couples: false,
    is_active: true,
    existingPhotos: [] as { url: string; label?: string }[],
    photosToRemove: [] as string[],
    isManualCapacity: false,
    customAmenityInput: "",
    description: "",
    beds_config: [],
  });

  // =====================
  // AVAILABILITY FUNCTIONS
  // =====================

  const loadAvailabilityData = useCallback(async () => {
    if (!selectedPropertyId) return;

    setAvailabilityLoading(true);
    try {
      const summaryResult = await getAvailabilitySummary({
        property_id: selectedPropertyId,
      });
      setAvailabilitySummary(summaryResult);

      const token =
        localStorage.getItem("auth_token") || localStorage.getItem("admin_token");
      if (!token) {
        setAvailabilityLoading(false);
        return;
      }

      const response = await fetch(
        `/api/admin/vacate-requests?property_id=${selectedPropertyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const today = new Date();
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const upcoming = result.data
          .filter((request: any) => {
            if (!request.expected_vacate_date) return false;
            const vacateDate = new Date(request.expected_vacate_date);
            return vacateDate > today && vacateDate <= thirtyDaysFromNow;
          })
          .map((request: any) => {
            const vacateDate = new Date(request.expected_vacate_date);
            const daysUntilVacate = Math.ceil(
              (vacateDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );
            return {
              bed_number: request.bed_number || "N/A",
              room_number: request.room_number || "N/A",
              current_tenant: request.tenant_name || "Unknown",
              vacate_date: request.expected_vacate_date,
              days_until_vacate: daysUntilVacate,
              vacate_status: request.vacate_status || request.status,
            };
          })
          .sort((a: any, b: any) => a.days_until_vacate - b.days_until_vacate);

        setUpcomingVacates(upcoming);
      }
    } catch (error) {
      console.error("Error loading availability:", error);
      toast.error("Failed to load availability data");
    } finally {
      setAvailabilityLoading(false);
    }
  }, [selectedPropertyId]);

  // Load data when sidebar opens
  useEffect(() => {
    if (availabilitySidebarOpen) {
      loadAvailabilityData();
    }
  }, [availabilitySidebarOpen, loadAvailabilityData]);

 // =====================
  // HANDLER FOR VIEW VACATE DETAILS
  // =====================
  
  const handleViewVacateDetails = useCallback((vacateRequest: any) => {
    // Navigate to vacate requests page with tenant name search filter
    router.push(`/admin/vacate-requests?search=${encodeURIComponent(vacateRequest.current_tenant)}`);
  }, [router]);

  // =====================
  // RENDER AVAILABILITY SIDEBAR CONTENT
  // =====================

  const renderAvailabilitySidebarContent = useMemo(() => {
    const totalAvailableNow =
      Number(availabilitySummary?.totals?.currently_available) || 0;
    const totalBeds = Number(availabilitySummary?.totals?.total) || 0;

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <SheetHeader className="p-4 border-b" style={{ background: 'linear-gradient(135deg, #004ab0 0%, #003d8c 100%)', color: 'white' }}>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5" style={{ color: '#f9bd07' }} />
              <span>Upcoming Availability</span>
              {upcomingVacates.length > 0 && (
                <Badge style={{ backgroundColor: '#f9bd07', color: '#000' }}>
                  {upcomingVacates.length} vacating
                </Badge>
              )}
            </SheetTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setAvailabilitySidebarOpen(false)} 
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-blue-200 mt-1">
            {properties.find((p) => p.id === selectedPropertyId)?.name || "Select a property"}
          </div>
        </SheetHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 p-3 border-b">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-green-700 mb-0.5">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xl font-bold">{totalAvailableNow}</span>
            </div>
            <p className="text-[10px] text-green-600 font-medium">Available Now</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-700 mb-0.5">
              <Clock className="h-4 w-4" />
              <span className="text-xl font-bold">{upcomingVacates.length}</span>
            </div>
            <p className="text-[10px] text-amber-600 font-medium">Vacating Soon</p>
          </div>
        </div>

        {/* Property selector */}
        <div className="p-3 border-b">
          <label className="text-xs font-medium text-gray-700 block mb-1">Select Property</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            value={selectedPropertyId || ''}
            onChange={(e) => {
              setSelectedPropertyId(Number(e.target.value));
              loadAvailabilityData();
            }}
          >
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>
        </div>

        {/* List of upcoming vacates */}
        <ScrollArea className="flex-1 p-3">
          {availabilityLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            </div>
          ) : upcomingVacates.length === 0 ? (
            <div className="text-center py-12">
              <BedIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No upcoming vacates</p>
              <p className="text-xs text-gray-400">No tenants are vacating in the next 30 days</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingVacates.map((bed, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg border border-gray-200 p-3 hover:border-amber-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <BedIcon className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">
                          Room {bed.room_number} • Bed {bed.bed_number}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <User className="h-3 w-3" />
                          <span>{bed.current_tenant}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                        {bed.days_until_vacate}d left
                      </Badge>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {bed.vacate_date ? format(new Date(bed.vacate_date), "dd MMM yyyy") : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">
                      Status: <span className="capitalize">{bed.vacate_status || 'Pending'}</span>
                    </span>
                    {/* ✅ UPDATED: View Details button with navigation */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[10px] text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => handleViewVacateDetails(bed)}
                    >
                      View Details <ChevronRight className="h-3 w-3 ml-0.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {availabilitySummary && (
          <div className="p-3 border-t bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Total beds: <span className="font-semibold">{totalBeds}</span></span>
              <span>{upcomingVacates.length} vacating in 30 days</span>
            </div>
          </div>
        )}
      </div>
    );
  }, [availabilitySummary, upcomingVacates, availabilityLoading, selectedPropertyId, properties, loadAvailabilityData, handleViewVacateDetails]);
  
  // Memoized room stats with safe defaults
  // const roomStats = useMemo(() => {
  //   const safeRooms = Array.isArray(rooms) ? rooms : [];

  //   const totalBeds = safeRooms.reduce(
  //     (sum, room) => sum + (room?.total_bed || 0),
  //     0,
  //   );
  //   const occupiedBeds = safeRooms.reduce(
  //     (sum, room) => sum + (room?.occupied_beds || 0),
  //     0,
  //   );
  //   const availableBeds = totalBeds - occupiedBeds;
  //   const occupancyRate =
  //     totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  //   return {
  //     totalRooms: safeRooms.length,
  //     totalBeds,
  //     availableBeds,
  //     occupancyRate: `${occupancyRate}%`,
  //   };
  // }, [rooms]);

  const handleImportClick = useCallback(() => {
    setShowImportModal(true);
  }, []);

  // Also add validation when property is selected in the form
  const validatePropertyRoomLimit = (propertyId: string) => {
    const selectedProperty = properties.find(
      (p) => String(p.id) === propertyId,
    );
    if (!selectedProperty) return { allowed: true, message: "" };

    const propertyTotalRooms = selectedProperty.total_rooms || 0;
    const existingRoomsForProperty = rooms.filter(
      (r) => String(r.property_id) === propertyId,
    ).length;

    if (existingRoomsForProperty >= propertyTotalRooms) {
      return {
        allowed: false,
        message: `This property has reached its maximum room limit (${propertyTotalRooms} rooms). Cannot add more rooms.`,
      };
    }

    return { allowed: true, message: "" };
  };

  // Add this function to calculate existing rooms for a property
  const getExistingRoomsCount = useCallback(
    (propertyId: string) => {
      return rooms.filter((r) => String(r.property_id) === propertyId).length;
    },
    [rooms],
  );

  // Add import file handler
  const handleImportFile = async (file: File) => {
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/rooms/import`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Successfully imported ${result.count} rooms`);
        setShowImportModal(false);
        await handleRefresh(); // Refresh the rooms list
      } else {
        throw new Error(result.message || "Import failed");
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import rooms");
    } finally {
      setImporting(false);
    }
  };


  const filteredRooms = useMemo(() => {
    const safeRooms = Array.isArray(rooms) ? rooms : [];

    return safeRooms.filter((room) => {
      if (!room) return false;

      // Property filter
     const propertyIds = advancedFilters?.property_ids ?? [];
if (propertyIds.length > 0) {
  if (!propertyIds.some((id) => String(id) === String(room.property_id))) {
    return false;
  }
}

      // Room type filter
      const roomTypes = Array.isArray(advancedFilters?.room_types)
        ? advancedFilters!.room_types
        : [];
      if (roomTypes.length > 0) {
        if (!roomTypes.includes(room.room_type) && !roomTypes.includes(room.sharing_type)) {
          return false;
        }
      }
        // Sharing type filter
      const sharingTypes = Array.isArray((advancedFilters as any)?.sharing_types)
        ? (advancedFilters as any).sharing_types
        : [];
      if (sharingTypes.length > 0) {
        if (!sharingTypes.includes(room.sharing_type)) {
          return false;
        }
      }

      // Gender preferences filter
      const genderPreferences = advancedFilters?.gender_preferences;
      if (Array.isArray(genderPreferences) && genderPreferences.length > 0) {
        const roomPrefs = Array.isArray(room.room_gender_preference)
          ? room.room_gender_preference
          : [];
        const hasMatch = genderPreferences.some((pref) =>
          roomPrefs.some((rp) => rp.toLowerCase() === pref.toLowerCase()),
        );
        if (!hasMatch) return false;
      }

      // Availability filter
   // Availability filter
// Availability filter
if (
  advancedFilters?.availability_status &&
  advancedFilters.availability_status !== "any"
) {
  const occupied = Number(room.occupied_beds) || 0;
  const total = Number(room.total_bed) || 0;
  const status = advancedFilters.availability_status;

  if (status === "available" && occupied >= total) {
    return false; // must have at least one free bed
  }
  if (status === "partial" && (occupied === 0 || occupied >= total)) {
    return false; // must be partially occupied
  }
  if (status === "full" && occupied !== 0) {
    return false; // must be completely empty
  }
}

      // Amenities filter
      const advAmenities = advancedFilters?.amenities ?? [];
      if (advAmenities.length > 0) {
        const roomAmenities = room.amenities || [];
        if (!advAmenities.every((a) => roomAmenities.includes(a))) return false;
      }

      // Floor filter
 if (advancedFilters?.floors && advancedFilters.floors.length > 0) {
        if (!advancedFilters.floors.map(String).includes(String(room.floor))) {
          return false;
        }
      }



      // Available From/To date range filter
if (advancedFilters?.available_from_date || advancedFilters?.available_to_date) {
  const rangeStart = advancedFilters.available_from_date
    ? new Date(advancedFilters.available_from_date)
    : new Date();
  rangeStart.setHours(0, 0, 0, 0);

  const rangeEnd = advancedFilters.available_to_date
    ? new Date(advancedFilters.available_to_date)
    : new Date(advancedFilters.available_from_date || advancedFilters.available_to_date);
  rangeEnd.setHours(23, 59, 59, 999);

  const beds = room.bed_assignments || [];
  const hasMatchingBed = beds.some((b: any) => {
    if (!b.available_from_date) return false;
    const d = new Date(b.available_from_date);
    return d >= rangeStart && d <= rangeEnd;
  });

  if (!hasMatchingBed) return false;
}



     // Boolean filters
// Boolean filters
if (
  advancedFilters?.has_attached_bathroom !== undefined &&
  advancedFilters.has_attached_bathroom !== null
) {
  if (toBool(room.has_attached_bathroom) !== toBool(advancedFilters.has_attached_bathroom))
    return false;
}
if (
  advancedFilters?.has_balcony !== undefined &&
  advancedFilters.has_balcony !== null
) {
  if (toBool(room.has_balcony) !== toBool(advancedFilters.has_balcony)) return false;
}
if (
  advancedFilters?.has_ac !== undefined &&
  advancedFilters.has_ac !== null
) {
  if (toBool(room.has_ac) !== toBool(advancedFilters.has_ac)) return false;
}
if (
  advancedFilters?.allow_couples !== undefined &&
  advancedFilters.allow_couples !== null &&
  advancedFilters.allow_couples === true
) {
  const roomPrefs = Array.isArray(room.room_gender_preference)
    ? room.room_gender_preference
    : [];
  const isCoupleRoom =
    toBool(room.allow_couples) ||
    roomPrefs.some((p) => String(p).toLowerCase().includes("couple"));
  if (!isCoupleRoom) return false;
}
      // Rent range
      if (
        advancedFilters?.min_rent !== undefined &&
        advancedFilters.min_rent > 0 &&
        room.rent_per_bed < advancedFilters.min_rent
      )
        return false;
      if (
        advancedFilters?.max_rent !== undefined &&
        advancedFilters.max_rent < 100000 &&
        room.rent_per_bed > advancedFilters.max_rent
      )
        return false;

      // ✅ UPDATED SEARCH - Now searches primary tenant name AND partner name
      const searchLower = searchQuery.toLowerCase();
      if (searchQuery) {
        const roomNumberStr = room.room_number?.toString() || "";
        const propertyName = (room.property_name || "").toLowerCase();
        const sharingType = (room.sharing_type || "").toLowerCase();

        // Check primary tenant names
        const matchesPrimaryTenant = (room.bed_assignments || []).some(
          (assignment: any) =>
            !assignment.is_available &&
            assignment.tenant_id &&
            assignment.tenant_name &&
            assignment.tenant_name.toLowerCase().includes(searchLower),
        );

        // ✅ Check partner names (NEW)
        const matchesPartnerTenant = (room.bed_assignments || []).some(
          (assignment: any) =>
            !assignment.is_available &&
            assignment.tenant_id &&
            assignment.partner_name &&
            assignment.partner_name.toLowerCase().includes(searchLower),
        );

        const matchesRoomSearch =
          roomNumberStr.toLowerCase().includes(searchLower) ||
          propertyName.includes(searchLower) ||
          sharingType.includes(searchLower);

        // Include partner search results
        if (
          !matchesRoomSearch &&
          !matchesPrimaryTenant &&
          !matchesPartnerTenant
        )
          return false;
      }

      // Local room type filter
      if (selectedRoomType !== "all") {
        const sharingType = room.sharing_type || "";
        const totalBeds = room.total_bed || 0;
        if (selectedRoomType === "single" && totalBeds !== 1) return false;
        if (selectedRoomType === "double" && totalBeds !== 2) return false;
        if (selectedRoomType === "triple" && totalBeds !== 3) return false;
      }

      return true;
    });
  }, [
    rooms,
    searchQuery,
    selectedRoomType,
    selectedGenderPref,
    advancedFilters,
  ]);


    // Memoized stats based on filtered rooms (auto-updates with filters)
  const filteredStats = useMemo(() => {
    const totalRooms = filteredRooms.length;
    const totalBeds = filteredRooms.reduce((sum, r) => sum + (r.total_bed || 0), 0);
    const occupiedBeds = filteredRooms.reduce((sum, r) => sum + (r.occupied_beds || 0), 0);
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    return { totalRooms, totalBeds, availableBeds, occupancyRate: `${occupancyRate}%` };
  }, [filteredRooms]);
  // Memoized paginated rooms
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRooms.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRooms, currentPage]);

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  // Room selection handlers
  const handleRoomSelect = useCallback((roomId: string, selected: boolean) => {
    setSelectedRooms((prev) =>
      selected ? [...prev, roomId] : prev.filter((id) => id !== roomId),
    );
  }, []);

  const handleSelectAll = useCallback((roomIds: string[]) => {
    setSelectedRooms(roomIds);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedRooms([]);
  }, []);

  const enrichRoomsWithTenantNames = useCallback(
    async (roomsData: RoomResponse[]) => {
      // If no rooms, return early
      if (!roomsData || roomsData.length === 0) {
        return roomsData;
      }

      const enrichedRooms = await Promise.all(
        roomsData.map(async (room) => {
          const bedAssignments = room.bed_assignments || [];

          const enrichedBeds = await Promise.all(
            bedAssignments.map(async (bed) => {
              if (bed.tenant_id && !bed.tenant_name) {
                try {
                  const token = localStorage.getItem("admin_token");
                  const response = await fetch(
                    `/api/tenants/${bed.tenant_id}`,
                    {
                      headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                      },
                    },
                  );
                  const result = await response.json();
                  if (result.success && result.data) {
                    const tenantData = result.data;

                    // ✅ Store both tenant name AND partner name for search
                    return {
                      ...bed,
                      tenant_name: tenantData.full_name,
                      partner_name: tenantData.partner_full_name || null,
                      is_couple_booking: tenantData.is_couple_booking || false,
                      partner_phone: tenantData.partner_phone || null,
                      partner_gender: tenantData.partner_gender || null,
                    };
                  }
                } catch (error) {
                  console.error(
                    `Error fetching tenant ${bed.tenant_id}:`,
                    error,
                  );
                }
              }
              return bed;
            }),
          );
          return { ...room, bed_assignments: enrichedBeds };
        }),
      );
      return enrichedRooms;
    },
    [],
  );


  const enrichRoomsWithAvailabilityInfo = useCallback(async (roomsData: RoomResponse[]) => {
  const propertyIds = [...new Set(roomsData.map(r => r.property_id))];
  const token = localStorage.getItem("auth_token") || localStorage.getItem("admin_token");

  const vacateByBedId: Record<number, any> = {};
  const noticeByBedId: Record<number, any> = {};
  const preAssignByBedId: Record<number, any> = {};

  await Promise.all(propertyIds.map(async (propId) => {
    // 1. Vacate requests
    try {
      const vacateRes = await fetch(`/api/admin/vacate-requests?property_id=${propId}&limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const vacateData = await vacateRes.json();
      if (vacateData.success && Array.isArray(vacateData.data)) {
        vacateData.data.forEach((req: any) => {
          const isCompleted = req.vacate_status === 'completed' || req.vacate_status === 'cancelled';
          if (!isCompleted && req.bed_id && req.expected_vacate_date) {
            if (!vacateByBedId[req.bed_id]) {
              vacateByBedId[req.bed_id] = {
                date: req.expected_vacate_date,
                status: req.vacate_status,
                tenantName: req.tenant_name,
              };
            }
          }
        });
      }
    } catch (e) { console.error(e); }

    // 2. Active notice periods (real endpoint from noticePeriodRequestRoutes.js)
    try {
      const noticeRes = await fetch(`/api/notice-period-requests/availability/active?property_id=${propId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const noticeData = await noticeRes.json();
      if (noticeData.success && Array.isArray(noticeData.data)) {
        noticeData.data.forEach((n: any) => {
          // Only use as availability signal if there isn't already an explicit vacate request for this bed
          if (n.bed_assignment_id && n.notice_period_date) {
  if (!noticeByBedId[n.bed_assignment_id]) {
    noticeByBedId[n.bed_assignment_id] = {
      date: n.notice_period_date,
      tenantName: n.tenant_name,
      noticeId: n.notice_id,
    };
  }
}
        });
      }
    } catch (e) { console.error("Error loading notice periods:", e); }

    // 3. Pre-assignments on beds
    try {
      const bedsRes = await fetch(`/api/rooms/bed-assignments?property_id=${propId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bedsData = await bedsRes.json();
      if (bedsData.success && Array.isArray(bedsData.data)) {
        bedsData.data.forEach((b: any) => {
          if (b.pre_assigned_tenant_id) {
            preAssignByBedId[b.id] = {
              tenantId: b.pre_assigned_tenant_id,
              rent: b.pre_assigned_rent,
              deposit: b.pre_assigned_security_deposit,
              isCouple: !!b.pre_assigned_is_couple,
            };
          }
        });
      }
    } catch (e) { console.error(e); }
  }));

return roomsData.map((room) => ({
  ...room,
  bed_assignments: (room.bed_assignments || []).map((bed: any) => {
    const vacate = vacateByBedId[bed.id];
    const notice = noticeByBedId[bed.id];
    // Earliest of the two dates, whichever exists
    const dates = [vacate?.date, notice?.date].filter(Boolean) as string[];
    const availableFromDate = dates.length
      ? dates.reduce((earliest, d) => (new Date(d) < new Date(earliest) ? d : earliest))
      : null;
    const availableFromSource = vacate && notice
      ? 'both'
      : vacate ? 'vacate_request' : notice ? 'notice_period' : null;

    return {
      ...bed,
      expected_vacate_date: vacate?.date || null,
      vacate_status: vacate?.status || null,
      notice_period_date: notice?.date || null,
      notice_id: notice?.noticeId || null,
      vacating_tenant_name: vacate?.tenantName || notice?.tenantName || null,
      available_from_date: availableFromDate,
      available_from_source: availableFromSource,
      pre_assigned_tenant_id: preAssignByBedId[bed.id]?.tenantId || null,
      pre_assigned_info: preAssignByBedId[bed.id] || null,
    };
  }),
}));
}, []);

  // Fetch rooms with advanced filters
  const fetchFilteredRooms = useCallback(
    async (filters: FilterState) => {
      try {
        setLoading(true);

        const processedFilters = {
          ...filters,
          availability_status: filters.availability_status || 'any', 
          min_rent: Number(filters.min_rent),
          max_rent: Number(filters.max_rent),
          min_capacity: Number(filters.min_capacity),
          max_capacity: Number(filters.max_capacity),
          page: currentPage,
         limit: 1000,
        };

        // ✅ Use the API function that includes auth token
        const result = await getFilteredRooms(processedFilters);

        if (result && result.success) {
          const roomsWithTenants = await enrichRoomsWithTenantNames(result.data);
        const roomsWithAvailability = await enrichRoomsWithAvailabilityInfo(roomsWithTenants);
        setRooms(roomsWithAvailability);
          const totalPages = Math.ceil(result.pagination?.total / itemsPerPage);
          if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
          }
          setSelectedRooms([]);
        } else {
          toast.error(
            "Failed to load rooms: " + (result?.message || "Unknown error"),
          );
        }
      } catch (error: any) {
        console.error("Error fetching filtered rooms:", error);
        toast.error(
          "Failed to load rooms: " + (error.message || "Network error"),
        );
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage, enrichRoomsWithTenantNames],
  );

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      setLoading(true);
      const { listRooms } = await import("@/lib/roomsApi");
      const response: any = await listRooms();
      let roomsData =
        response && Array.isArray(response)
          ? response
          : response?.data && Array.isArray(response.data)
            ? response.data
            : [];

      // Sort rooms numerically
      roomsData = roomsData.sort((a: RoomResponse, b: RoomResponse) => {
        const numA = parseInt(String(a.room_number).replace(/[^0-9]/g, ""), 10);
        const numB = parseInt(String(b.room_number).replace(/[^0-9]/g, ""), 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return String(a.room_number).localeCompare(
          String(b.room_number),
          undefined,
          { numeric: true },
        );
      });

      // ✅ Enrich rooms with tenant names
      const roomsWithTenants = await enrichRoomsWithTenantNames(roomsData);
const roomsWithAvailability = await enrichRoomsWithAvailabilityInfo(roomsWithTenants);
setRooms(roomsWithAvailability);    } catch (error) {
      console.error("Error refreshing rooms:", error);
      toast.error("Failed to refresh rooms");
    } finally {
      setLoading(false);
    }
  }, [enrichRoomsWithTenantNames]);

  // Handle bulk action completion - FROM YOUR ORIGINAL CODE
  const handleBulkActionComplete = useCallback(
    (updatedRooms?: RoomResponse[]) => {
      if (updatedRooms) {
        setRooms(updatedRooms);
      } else {
        if (advancedFilters) {
          fetchFilteredRooms(advancedFilters);
        } else {
          handleRefresh();
        }
      }
      setSelectedRooms([]);
    },
    [fetchFilteredRooms, advancedFilters],
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filters: FilterState) => {
      setAdvancedFilters(filters);
      setCurrentPage(1);
      fetchFilteredRooms(filters);
    },
    [fetchFilteredRooms],
  );

//   const handleFilterChange = useCallback(
//   (filters: FilterState) => {
//     setAdvancedFilters(filters);
//     setCurrentPage(1);
//   },
//   [],
// );

  // Inside your RoomsClient component, replace the handleExport function:

  const handleExport = useCallback(() => {
    try {
      // Prepare data for Excel
      const exportData = rooms.map((room) => ({
        "Room Number": room.room_number,
        Property: room.property_name,
        "Sharing Type": room.sharing_type,
        "Total Beds": room.total_bed,
        "Occupied Beds": room.occupied_beds,
        "Available Beds": (room.total_bed || 0) - (room.occupied_beds || 0),
        "Total Rent": room.rent_per_bed,
        Floor: room.floor,
        "Gender Preference": Array.isArray(room.room_gender_preference)
          ? room.room_gender_preference.join(", ")
          : room.room_gender_preference || "Any",
        "Allow Couples": room.allow_couples ? "Yes" : "No",
        "Attached Bathroom": room.has_attached_bathroom ? "Yes" : "No",
        Balcony: room.has_balcony ? "Yes" : "No",
        AC: room.has_ac ? "Yes" : "No",
        Amenities: Array.isArray(room.amenities)
          ? room.amenities.join(", ")
          : "",
        Status: room.is_active ? "Active" : "Inactive",
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns (optional but recommended)
      const colWidths = [];
      const headers = Object.keys(exportData[0] || {});
      headers.forEach((header) => {
        const maxLength = Math.max(
          header.length,
          ...exportData.map((row) => String(row[header] || "").length),
        );
        colWidths.push({ wch: Math.min(maxLength + 2, 50) }); // Cap at 50 chars
      });
      ws["!cols"] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rooms");

      // Generate Excel file
      const fileName = `rooms-export-${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(`Exported ${exportData.length} rooms successfully!`);
    } catch (error) {
      console.error("Error exporting rooms:", error);
      toast.error("Failed to export rooms");
    }
  }, [rooms]);

  // Import handler
  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx,.xls";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      toast.info("Import functionality - implement based on your backend API");
    };

    input.click();
  }, []);

  // Callbacks for event handlers
  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  // Your original handleEdit function
  const handleEdit = useCallback(
    (room: RoomResponse) => {
      const roomToEdit = rooms.find((r) => r.id === room.id);
      if (!roomToEdit) {
        toast.error("Room data not found. Please refresh the page.");
        return;
      }

      const bedConfig: any = room.bed_assignments.map((bed) => ({
        ...bed,
        bed_rent: bed.tenant_rent,
        bedNumber: bed.bed_number,
      }));

      setIsEditMode(true);
      setEditingRoomId(room.id.toString());
      const capacity = room.total_bed || 0;
      const sharingType = room.sharing_type || "";

      const standardCapacities = [1, 2, 3];
      const isStandardCapacity = standardCapacities.includes(capacity);
      let actualSharingType = sharingType;

      if (sharingType === "other" || !isStandardCapacity) {
        actualSharingType = "other";
      }

      const defaultForSharingType =
        actualSharingType === "single"
          ? 1
          : actualSharingType === "double"
            ? 2
            : actualSharingType === "triple"
              ? 3
              : 2;

      const isAutoCapacity =
        defaultForSharingType === capacity && actualSharingType !== "other";

      const existingPhotos = processPhotoUrls(room.photo_urls).filter(
        (photo: { url: string | null; label: any }) => photo.url !== null,
      ) as { url: string; label?: string }[];

      const genderPreferences = room.room_gender_preference
        ? Array.isArray(room.room_gender_preference)
          ? room.room_gender_preference.map((g) => g.trim())
          : typeof room.room_gender_preference === "string"
            ? room.room_gender_preference
                .split(",")
                .map((g: string) => g.trim())
                .filter(Boolean)
            : []
        : [];

      const isActive = Boolean(roomToEdit.is_active);
      const allowCouples = Boolean(roomToEdit.allow_couples);
      const hasAttachedBathroom = Boolean(roomToEdit.has_attached_bathroom);
      const hasBalcony = Boolean(roomToEdit.has_balcony);
      const hasAC = Boolean(roomToEdit.has_ac);

      setFormData({
        property_id: room.property_id.toString(),
        room_number: room.room_number.toString(),
        sharing_type: actualSharingType,
        room_type: room.room_type || "",
        capacity: capacity,
        rent_per_bed: room.rent_per_bed || 0,
        floor: room.floor ? room.floor.toString() : "",
        has_attached_bathroom: hasAttachedBathroom,
        has_balcony: hasBalcony,
        has_ac: hasAC,
        amenities: room.amenities || [],
        photo_labels: {},
        photos: [],
        video: null,
        video_label: room.video_label || "",
        room_gender_preference: genderPreferences,
        allow_couples: allowCouples,
        is_active: isActive,
        existingPhotos: existingPhotos,
        photosToRemove: [],
        isManualCapacity: !isAutoCapacity || actualSharingType === "other",
        customAmenityInput: "",
        description: room.description || "",
        beds_config: bedConfig || [],
      });

      setRoomDialogOpen(true);
    },
    [rooms],
  );

  const handleDelete = useCallback(async (id: string, roomName?: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${roomName || "this room"}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(0,0,0,0.4)`,
      customClass: {
        title: "text-lg font-bold",
        popup: "rounded-xl",
        confirmButton:
          "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg",
        cancelButton:
          "bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg",
      },
    });

    if (result.isConfirmed) {
      try {
        const { deleteRoom } = await import("@/lib/roomsApi");
        const res = await deleteRoom(id);

        if (!res?.success) {
          toast.error(res?.message || "Failed to delete room");
          return;
        }

        await Swal.fire({
          title: "Deleted!",
          text: "Room has been deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: "#fff",
          customClass: {
            popup: "rounded-xl",
            title: "text-lg font-bold text-green-600",
          },
        });

        setRooms((prev) => prev.filter((room) => room.id.toString() !== id));
        setSelectedRooms((prev) => prev.filter((roomId) => roomId !== id));
      } catch (err: any) {
        console.error("Room delete error:", err);
        toast.error(err?.response?.message || "Failed to delete room");
      }
    }
  }, []);

  const handleViewDetails = useCallback(async (room: RoomResponse) => {
    try {
      setLoading(true);
      const { getRoomById } = await import("@/lib/roomsApi");
      const response = await getRoomById(room.id.toString());

      // Handle the response correctly
      let roomData = null;
      if (response && response.success && response.data) {
        roomData = response.data;
      } else if (response && !response.success && response.data) {
        roomData = response.data;
      } else if (response && !response.data) {
        roomData = response;
      } else {
        roomData = room;
      }

      setSelectedRoom(roomData);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching fresh room data:", error);
      setSelectedRoom(room);
      setDetailsDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBedManagement = useCallback((room: RoomResponse) => {
    setSelectedRoom(room);
    setBedDialogOpen(true);
  }, []);

  const openGallery = useCallback((room: RoomResponse) => {
    setSelectedGalleryRoom(room);
    setGalleryOpen(true);
  }, []);

  // Your original resetForm function
  const resetForm = useCallback(() => {
    setFormData({
      property_id: "",
      room_number: "",
      sharing_type: "",
      room_type: "",
      capacity: 0,
      rent_per_bed: 0,
      floor: "",
      has_attached_bathroom: false,
      has_balcony: false,
      has_ac: false,
      amenities: [],
      photo_labels: {},
      photos: [],
      video: null,
      video_label: "",
      room_gender_preference: [],
      allow_couples: false,
      is_active: true,
      existingPhotos: [],
      photosToRemove: [],
      isManualCapacity: false,
      customAmenityInput: "",
      description: "",
      beds_config: [],
    });
    setIsEditMode(false);
    setEditingRoomId(null);
  }, []);

  // In rooms-client.tsx, update the Add New Room button click handler
  const handleAddRoomClick = useCallback(() => {
    resetForm();
    setRoomDialogOpen(true);
  }, [resetForm]);

  // Your original handleSubmit function
  const handleSubmit = useCallback(async () => {
    if (
      !formData.property_id ||
      !formData.room_number ||
      !formData.sharing_type ||
      formData.rent_per_bed <= 0
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const formDataObj = new FormData();

      formDataObj.append("property_id", formData.property_id);
      formDataObj.append("room_number", formData.room_number);
      formDataObj.append("sharing_type", formData.sharing_type);
      formDataObj.append("room_type", formData.room_type || "standard");
      formDataObj.append("total_beds", formData.capacity.toString());
      formDataObj.append("rent_per_bed", formData.rent_per_bed.toString());
      formDataObj.append("floor", formData.floor || "0");

      formDataObj.append(
        "has_attached_bathroom",
        formData.has_attached_bathroom.toString(),
      );
      formDataObj.append("has_balcony", formData.has_balcony.toString());
      formDataObj.append("has_ac", formData.has_ac.toString());
      formDataObj.append("allow_couples", formData.allow_couples.toString());
      formDataObj.append("is_active", formData.is_active.toString());

      formDataObj.append("amenities", JSON.stringify(formData.amenities));
      formDataObj.append(
        "room_gender_preference",
        formData.room_gender_preference.join(","),
      );

      formDataObj.append("description", formData.description || "");
      formDataObj.append("video_label", formData.video_label || "");

      formDataObj.append("beds_config", JSON.stringify(formData.beds_config));

      if (isEditMode && editingRoomId) {
        formDataObj.append(
          "existing_photos",
          JSON.stringify(formData.existingPhotos),
        );
        formDataObj.append(
          "remove_photos",
          JSON.stringify(formData.photosToRemove),
        );

        const removeVideo =
          formData.photosToRemove.length > 0 ? "true" : "false";
        formDataObj.append("remove_video", removeVideo);
      }

      const photoLabels: { [key: string]: string } = {};
      formData.photos.forEach((file, index) => {
        photoLabels[index] = formData.photo_labels[index] || "Room View";
      });
      formDataObj.append("photo_labels", JSON.stringify(photoLabels));

      formData.photos.forEach((photo) => {
        formDataObj.append("photos", photo);
      });

      if (formData.video) {
        formDataObj.append("video", formData.video);
      }

      if (isEditMode && editingRoomId) {
        const { updateRoom } = await import("@/lib/roomsApi");
        await updateRoom(editingRoomId, formDataObj);
      } else {
        const { createRoom } = await import("@/lib/roomsApi");
        await createRoom(formDataObj);
      }

      setRoomDialogOpen(false);
      resetForm();

      const { listRooms } = await import("@/lib/roomsApi");
      const response: any = await listRooms();
      let roomsData =
        response && Array.isArray(response)
          ? response
          : response?.data && Array.isArray(response.data)
            ? response.data
            : [];

      // Sort rooms numerically
      roomsData = roomsData.sort((a: RoomResponse, b: RoomResponse) => {
        const numA = parseInt(String(a.room_number).replace(/[^0-9]/g, ""), 10);
        const numB = parseInt(String(b.room_number).replace(/[^0-9]/g, ""), 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return String(a.room_number).localeCompare(
          String(b.room_number),
          undefined,
          { numeric: true },
        );
      });

      setRooms(roomsData);
    } catch (err: any) {
      console.error("Error saving room:", err);
      toast.error(err.message || "Failed to save room");
    }
  }, [isEditMode, editingRoomId, formData, resetForm]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRoomType, selectedGenderPref]);

  // Gallery items (memoized)
  const galleryItems = useMemo(() => {
    if (!selectedGalleryRoom) return [];

    const items: Array<{
      url: string;
      label?: string;
      type: "photo" | "video";
    }> = [];

    const processedPhotos = processPhotoUrls(selectedGalleryRoom.photo_urls);
    processedPhotos.forEach((photo: { url: any; label: any }) => {
      if (photo.url) {
        items.push({
          url: photo.url,
          label: photo.label || "Room View",
          type: "photo",
        });
      }
    });

    if (selectedGalleryRoom.video_url) {
      const videoUrl = getMediaUrl(selectedGalleryRoom.video_url, "video");
      if (videoUrl) {
        items.push({
          url: videoUrl,
          label: selectedGalleryRoom.video_label || "Room Video Walkthrough",
          type: "video",
        });
      }
    }

    return items;
  }, [selectedGalleryRoom]);

  // Load data on component mount if initialRooms is empty
  useEffect(() => {
    const loadData = async () => {
      if (rooms.length === 0) {
        try {
          setLoading(true);
          const { listRooms } = await import("@/lib/roomsApi");
          const response: any = await listRooms();
          let roomsData =
            response && Array.isArray(response)
              ? response
              : response?.data && Array.isArray(response.data)
                ? response.data
                : [];

          // Sort rooms numerically
          roomsData = roomsData.sort((a: RoomResponse, b: RoomResponse) => {
            const numA = parseInt(
              String(a.room_number).replace(/[^0-9]/g, ""),
              10,
            );
            const numB = parseInt(
              String(b.room_number).replace(/[^0-9]/g, ""),
              10,
            );
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            return String(a.room_number).localeCompare(
              String(b.room_number),
              undefined,
              { numeric: true },
            );
          });

          const roomsWithTenants = await enrichRoomsWithTenantNames(roomsData);
const roomsWithAvailability = await enrichRoomsWithAvailabilityInfo(roomsWithTenants);
setRooms(roomsWithAvailability);        } catch (error) {
          console.error("Error loading rooms:", error);
          toast.error("Failed to load rooms");
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [rooms.length, enrichRoomsWithTenantNames]);

  useEffect(() => {
    const enrichInitialRooms = async () => {
      if (
        rooms.length > 0 &&
        rooms[0]?.bed_assignments?.[0]?.tenant_name === undefined
      ) {
        const enrichedRooms = await enrichRoomsWithTenantNames(rooms);
        setRooms(enrichedRooms);
      }
    };
    enrichInitialRooms();
  }, [rooms.length]); // Run when rooms are first loaded

const handleSelectVacatingBed = useCallback(async (bedAssignmentId: number, roomId: number) => {
  console.log("🔍 [DEBUG] handleSelectVacatingBed called with:", { bedAssignmentId, roomId });
  
  setFilterSidebarOpen(false);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    // 🔥 ALWAYS fetch fresh room data directly
    console.log("🔍 [DEBUG] Fetching room data for ID:", roomId);
    const { getRoomById } = await import("@/lib/roomsApi");
    const response: any = await getRoomById(roomId.toString());
    console.log("🔍 [DEBUG] getRoomById response:", response);
    
    let roomData: any = null;
    
    // Handle both response formats
    if (response?.success && response?.data?.id) {
      roomData = response.data;
      console.log("🔍 [DEBUG] Extracted roomData from response.data:", roomData);
    } else if (response?.id) {
      roomData = response;
      console.log("🔍 [DEBUG] Using response directly as roomData:", roomData);
    } else {
      console.error("❌ [DEBUG] Could not load room data, response:", response);
      toast.error("Could not load room data");
      return;
    }
    
    console.log("🔍 [DEBUG] roomData structure:", {
      id: roomData?.id,
      property_id: roomData?.property_id,
      total_bed: roomData?.total_bed,
      room_number: roomData?.room_number,
      property_name: roomData?.property_name,
    });
    
    // ✅ Validate we have a valid room with all required properties
    if (roomData?.id && roomData?.total_bed !== undefined) {
      // 🔥 Ensure property_id exists - fetch from room data or from rooms list
      if (!roomData.property_id) {
        console.warn("⚠️ [DEBUG] roomData missing property_id, checking rooms list...");
        // Try to find in rooms list
        const foundInList = rooms.find((r) => r.id === roomId);
        console.log("🔍 [DEBUG] Found in rooms list:", foundInList);
        
        if (foundInList?.property_id) {
          roomData.property_id = foundInList.property_id;
          roomData.property_name = foundInList.property_name;
          roomData.property_address = foundInList.property_address;
          console.log("🔍 [DEBUG] ✅ Added property_id from rooms list:", roomData.property_id);
        } else {
          console.error("❌ [DEBUG] No property_id found in rooms list either");
          toast.error("Room property data is missing. Please refresh the page.");
          return;
        }
      }
      
      console.log("🔍 [DEBUG] ✅ Setting selectedRoom and opening dialog");
      setSelectedRoom(roomData);
      setBedDialogOpen(true);
    } else {
      console.error("❌ [DEBUG] Invalid room data:", roomData);
      toast.error("Invalid room data. Please refresh and try again.");
    }
  } catch (err) {
    console.error("❌ [DEBUG] Error loading room:", err);
    toast.error("Failed to load room data");
  }
}, [rooms]);

  return (
    <div className=" ">
      {/* Stats Overview */}
      <div className="sticky top-20 z-10 py-0 md:py-0  md:px-0 mb-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Total Rooms */}
            <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
              <div className="p-1 bg-blue-100 rounded-md">
                <DoorOpen className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div className="leading-tight">
                <p className="text-[9px] text-gray-500 font-medium">
                  Total Rooms
                </p>
                <p className="text-xs md:text-lg font-bold text-gray-900">
                  {filteredStats.totalRooms}
                </p>
              </div>
            </div>

            {/* Total Beds */}
            <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
              <div className="p-1 bg-green-100 rounded-md">
                <Bed className="h-3.5 w-3.5 text-green-600" />
              </div>
              <div className="leading-tight">
                <p className="text-[9px] text-gray-500 font-medium">
                  Total Beds
                </p>
                <p className="text-xs md:text-lg font-bold text-gray-900">
                  {filteredStats.totalBeds}
                </p>
              </div>
            </div>

            {/* Available Beds */}
            <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
              <div className="p-1 bg-purple-100 rounded-md">
                <Users className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <div className="leading-tight">
                <p className="text-[9px] text-gray-500 font-medium">
                  Available Beds
                </p>
                <p className="text-xs md:text-lg font-bold text-gray-900">
                  {filteredStats.availableBeds}
                </p>
              </div>
            </div>

            {/* Occupancy */}
            <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
              <div className="p-1 bg-amber-100 rounded-md">
                <Building2 className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <div className="leading-tight">
                <p className="text-[9px] text-gray-500 font-medium">
                  Occupancy Rate
                </p>
                <p className="text-xs md:text-lg font-bold text-gray-900">
                  {filteredStats.occupancyRate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* Main Content Card */}
      <Card className="max-h-[calc(100vh-250px)] md:max-h-[calc(100vh-180px)] overflow-y-auto relative">
        {/* Desktop Header - Hidden on mobile */}
       <CardHeader className="hidden md:block bg-gray-200 text-gray-700 sticky top-0 z-50 -translate-y-1 pt-2 pb-2 rounded-xl">
  <div className="py-2 px-0">
    <div className="flex flex-col space-y-3">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        {/* LEFT: Icon + Search */}
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="p-1.5 rounded-lg bg-white border border-gray-300 shadow-sm">
            <BedDouble className="h-5 w-5 text-gray-700" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />

            <input
              type="text"
              placeholder="Search by room number, property, or tenant name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[420px] pl-9 pr-3 py-1.5 text-sm rounded-lg
              bg-white text-gray-800 placeholder:text-gray-400
              border border-gray-300 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* RIGHT: Buttons */}
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 bg-white text-gray-700 hover:bg-gray-300 hover:text-gray-700 border border-gray-300 shadow-sm transition-all duration-200"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Filter */}
          <Button
            size="icon"
            variant="outline"
            className="relative h-8 w-8 bg-white text-gray-700 hover:bg-gray-300 hover:text-gray-700 border border-gray-300 shadow-sm transition-all duration-200"
            onClick={() => setFilterSidebarOpen(true)}
          >
            <Filter className="h-4 w-4" />
          </Button>

          {/* Bulk Actions - ORIGINAL COMPONENT WITH FULL FUNCTIONALITY */}
          {selectedRooms.length > 0 &&
            (can("edit_rooms") || can("delete_rooms")) && (
              <BulkActions
                selectedRooms={selectedRooms}
                onActionComplete={handleBulkActionComplete}
              />
            )}

          {/* Export */}
          {can("export_rooms") && (
            <Button
              variant="outline"
              className="flex items-center gap-2 h-8 bg-white text-gray-700 hover:bg-gray-300 hover:text-gray-700 border border-gray-300 shadow-sm transition-all duration-200"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}

          {/* Import */}
          {can("import_rooms") && (
            <Button
              variant="outline"
              className="flex items-center gap-2 h-8 bg-white text-gray-700 hover:bg-gray-300 hover:text-gray-700 border border-gray-300 shadow-sm transition-all duration-200"
              onClick={handleImportClick}
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
          )}

          {/* Add New Room */}
          {can("create_rooms") && (
            <Button
              className="h-8 bg-white text-blue-700 hover:bg-gray-300 hover:text-gray-700 border border-gray-300 shadow-sm transition-all duration-200 px-3 py-1.5 text-sm flex items-center font-medium"
              onClick={() => {
                resetForm();
                setRoomDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Room
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
</CardHeader>

        {/* Mobile Header - Only visible on mobile */}
       <CardHeader className="md:hidden bg-gray-200 text-gray-700 sticky top-0 z-30 py-1.5 px-0 rounded-xl">
  <div className="px-2">
    {/* Top Compact Row */}
    <div className="flex items-center justify-between mb-1">
      {/* Left: Title + Bulk Actions */}
      <div className="flex items-center gap-1.5">
        <div className="p-1 rounded-md bg-white border border-gray-300 shadow-sm">
          <BedDouble className="h-3 w-3 text-gray-700" />
        </div>

        <span className="text-sm font-semibold text-gray-700">Rooms</span>

        {/* Bulk Actions - ORIGINAL COMPONENT WITH FULL FUNCTIONALITY */}
        {selectedRooms.length > 0 &&
          (can("edit_rooms") || can("delete_rooms")) && (
            <BulkActions
              selectedRooms={selectedRooms}
              onActionComplete={handleBulkActionComplete}
            />
          )}
      </div>

      {/* Right: Action Icons + Add Button */}
      <div className="flex items-center gap-1">
        {/* Refresh Icon */}
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6 bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>

        {/* Filter Icon */}
        <Button
          size="icon"
          variant="outline"
          className="relative h-6 w-6 bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm"
          onClick={() => setFilterSidebarOpen(true)}
        >
          <Filter className="h-3 w-3" />
        </Button>

        {/* Export Icon */}
        {can("export_rooms") && (
          <Button
            size="icon"
            variant="outline"
            className="h-6 w-6 bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm"
            onClick={handleExport}
          >
            <Download className="h-3 w-3" />
          </Button>
        )}

        {/* Import Icon */}
        {can("import_rooms") && (
          <Button
            size="icon"
            variant="outline"
            className="h-6 w-6 bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm"
            onClick={handleImportClick}
          >
            <Upload className="h-3 w-3" />
          </Button>
        )}

        {/* Add Room Button */}
        {can("create_rooms") && (
          <Button
            size="sm"
            className="h-6 bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm px-2 text-xs flex items-center ml-1 font-medium"
            onClick={() => {
              resetForm();
              setRoomDialogOpen(true);
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        )}
      </div>
    </div>

    {/* Compact Search Bar */}
    <div className="relative py-1">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />

      <input
        type="text"
        placeholder="Search room, property, or tenant..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md
        bg-white text-gray-800 placeholder:text-gray-400
        border border-gray-300 shadow-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
</CardHeader>

        <CardContent className="p-6 pb-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-500">Loading rooms...</p>
            </div>
          ) : paginatedRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              {/* Ghost icon */}
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <DoorOpen className="h-8 w-8 text-gray-300" />
              </div>

              <h3 className="text-base font-semibold text-gray-800 mb-1">
                No Rooms Found
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mb-5">
                {advancedFilters?.property_ids?.length ||
                advancedFilters?.room_types?.length ||
                advancedFilters?.gender_preferences?.length ||
                advancedFilters?.availability_status !== "any" ||
                searchQuery ||
                selectedRoomType !== "all" ||
                selectedGenderPref !== "all"
                  ? "No rooms match your current filters. Try adjusting or clearing them."
                  : "Get started by adding your first room."}
              </p>

              <div className="flex items-center gap-2">
                {/* Clear Filters button — only show when filters are active */}
                {(advancedFilters?.property_ids?.length ||
                  advancedFilters?.room_types?.length ||
                  advancedFilters?.availability_status !== "any" ||
                  searchQuery ||
                  selectedRoomType !== "all" ||
                  selectedGenderPref !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-gray-600 border-gray-300"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedRoomType("all");
                      setSelectedGenderPref("all");
                      // reset advancedFilters by re-opening and resetting, or call handleFilterChange with defaults:
                      const DEFAULT_FILTERS = {
                        search: "",
                        property_ids: [],
                        room_types: [],
                        sharing_types: [],
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
availability_status: "" as const,
                      };
                      handleFilterChange(DEFAULT_FILTERS);
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear All Filters
                  </Button>
                )}

                {/* Add Room button — only when no filters and has permission */}
                {!searchQuery &&
                  selectedRoomType === "all" &&
                  selectedGenderPref === "all" &&
                  !advancedFilters?.property_ids?.length &&
                  can("create_rooms") && (
                    <Button
                      size="sm"
                      style={{ backgroundColor: "#004ab0" }}
                      className="text-white gap-1.5"
                      onClick={() => {
                        resetForm();
                        setRoomDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add First Room
                    </Button>
                  )}
              </div>
            </div>
          ) : (
            <>
              <RoomsGrid
                rooms={paginatedRooms}
                selectedRooms={selectedRooms}
                onRoomSelect={handleRoomSelect}
                onSelectAll={handleSelectAll}
                onClearSelection={handleClearSelection}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onBedManagement={handleBedManagement}
                onOpenGallery={openGallery}
                canEdit={can("edit_rooms")} // ← ADD
                canDelete={can("delete_rooms")} // ← ADD
                canManageBeds={can("manage_beds")} // ← ADD
              />

              {totalPages > 1 && (
                <RoomsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredRooms.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  className="bg-white px-6 sticky bottom-0 z-30"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Side Filter - Opens when filter icon is clicked */}
      {/* Side Filter - Opens when filter icon is clicked */}
      <SideFilter
        open={filterSidebarOpen}
        onOpenChange={setFilterSidebarOpen}
        onFilterChange={handleFilterChange}
        hideTrigger={true}
         rooms={rooms} 
         onSelectVacatingBed={handleSelectVacatingBed}     />

         {/* Availability Sidebar */}
      <Sheet open={availabilitySidebarOpen} onOpenChange={setAvailabilitySidebarOpen}>
        <SheetContent side="right" className="p-0 w-[90vw] sm:w-[400px] lg:max-w-md">
          {renderAvailabilitySidebarContent}
        </SheetContent>
      </Sheet>


      {/* Dialogs - Pass the correct props */}
      <RoomForm
        open={roomDialogOpen}
        onOpenChange={setRoomDialogOpen}
        isEditMode={isEditMode}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        properties={properties}
        rooms={rooms}
        editingRoomId={editingRoomId}
        getExistingRoomsCount={getExistingRoomsCount}
      />

      <RoomImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportFile}
        importing={importing}
      />

      {selectedRoom && (
        <RoomDetailsDialog
          room={selectedRoom}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}

      {selectedRoom && (
        <BedManagementDialog
          room={selectedRoom}
          open={bedDialogOpen}
          onOpenChange={(open) => {
            setBedDialogOpen(open);
            // When dialog closes, also refresh the room data
            if (!open && selectedRoom) {
              // Optionally refresh the specific room data
              handleRefresh();
            }
          }}
          onRefresh={handleRefresh} // Existing
          onRoomUpdate={(updatedRoom) => {
            // ✅ Update the selectedRoom state
            setSelectedRoom(updatedRoom);

            // ✅ Update the rooms list
            setRooms((prevRooms) =>
              prevRooms.map((room) =>
                room.id === updatedRoom.id ? updatedRoom : room,
              ),
            );
          }}
        />
      )}

      <PhotoGalleryModal
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        photos={galleryItems}
        roomNumber={selectedGalleryRoom?.room_number}
        propertyName={selectedGalleryRoom?.property_name}
      />
    </div>
  );

}
