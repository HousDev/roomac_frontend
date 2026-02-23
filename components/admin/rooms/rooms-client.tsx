

// component/rooms/rooms-client.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DoorOpen, Plus, Search, Bed, Users, Building2, RefreshCw, SlidersHorizontal, Download, Upload, Check, X, Trash2, BedDouble, Filter } from 'lucide-react';
import { toast } from "sonner";
import { type RoomResponse ,processPhotoUrls, getMediaUrl} from '@/lib/roomsApi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import optimized components
import RoomsGrid from './rooms-grid';
import RoomsPagination from './rooms-pagination';
import { RoomForm } from './room-form';
import { BedManagementDialog } from './bed-management-dialog';
import { PhotoGalleryModal } from './PhotoGalleryModal';
import { RoomDetailsDialog } from './RoomDetailsDialog';

// Import new components
import SideFilter from './side-filter';
import BulkActions from './bulk-actions'; // Keep this import

// Types
interface RoomsClientProps {
  initialRooms: RoomResponse[];
  initialProperties: any[];
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

export default function RoomsClient({ initialRooms, initialProperties }: RoomsClientProps) {
  // State management with safe defaults
  const [rooms, setRooms] = useState<RoomResponse[]>(Array.isArray(initialRooms) ? initialRooms : []);
  const [properties, setProperties] = useState(Array.isArray(initialProperties) ? initialProperties : []);
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
  const [selectedGalleryRoom, setSelectedGalleryRoom] = useState<RoomResponse | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [selectedGenderPref, setSelectedGenderPref] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>();
  const itemsPerPage = 12;

  // Form state
  const [formData, setFormData] = useState({
    property_id: '',
    room_number: '',
    sharing_type: '',
    capacity: 2,
    rent_per_bed: 0,
    floor: '',
    has_attached_bathroom: false,
    has_balcony: false,
    has_ac: false,
    amenities: [] as string[],
    photo_labels: {} as { [key: string]: string },
    photos: [] as File[],
    video: null as File | null,
    video_label: '',
    room_gender_preference: [] as string[],
    allow_couples: false,
    is_active: true,
    existingPhotos: [] as { url: string; label?: string }[],
    photosToRemove: [] as string[],
    isManualCapacity: false,
    customAmenityInput: '',
    description: '',
  });

  // Memoized room stats with safe defaults
  const roomStats = useMemo(() => {
    const safeRooms = Array.isArray(rooms) ? rooms : [];
    
    const totalBeds = safeRooms.reduce((sum, room) => sum + (room?.total_bed || 0), 0);
    const occupiedBeds = safeRooms.reduce((sum, room) => sum + (room?.occupied_beds || 0), 0);
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return {
      totalRooms: safeRooms.length,
      totalBeds,
      availableBeds,
      occupancyRate: `${occupancyRate}%`
    };
  }, [rooms]);

  // Fetch rooms with advanced filters
  const fetchFilteredRooms = useCallback(async (filters: FilterState) => {
    try {
      setLoading(true);
      
      const processedFilters = {
        ...filters,
        min_rent: Number(filters.min_rent),
        max_rent: Number(filters.max_rent),
        min_capacity: Number(filters.min_capacity),
        max_capacity: Number(filters.max_capacity),
        page: currentPage,
        limit: itemsPerPage
      };
      
      const response = await fetch('/api/rooms/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedFilters)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server responded with status ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setRooms(result.data);
        const totalPages = Math.ceil(result.pagination.total / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
        setSelectedRooms([]);
      } else {
        toast.error('Failed to load rooms: ' + (result.message || 'Unknown error'));
      }
    } catch (error:any) {
      console.error('Error fetching filtered rooms:', error);
      toast.error('Failed to load rooms: ' + (error.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  // Handle filter changes
  const handleFilterChange = useCallback((filters: FilterState) => {
    setAdvancedFilters(filters);
    setCurrentPage(1);
    fetchFilteredRooms(filters);
  }, [fetchFilteredRooms]);

  // Memoized filtered rooms
  const filteredRooms = useMemo(() => {
    const safeRooms = Array.isArray(rooms) ? rooms : [];
    
    return safeRooms.filter(room => {
      if (!room) return false;
      
      const searchLower = searchQuery.toLowerCase();
      const roomNumberStr = room.room_number ? room.room_number.toString() : '';
      const propertyName = (room.property_name || '').toLowerCase();
      const propertyAddress = (room.property_address || '').toLowerCase();
      const sharingType = room.sharing_type || '';
      const totalBeds = room.total_bed || 0;
      
      const matchesSearch = 
        !searchQuery ||
        roomNumberStr.toLowerCase().includes(searchLower) ||
        propertyName.includes(searchLower) ||
        propertyAddress.includes(searchLower) ||
        sharingType.toLowerCase().includes(searchLower);
      
      let matchesRoomType = false;
      if (selectedRoomType === 'all') {
        matchesRoomType = true;
      } else if (selectedRoomType === 'other') {
        const isExplicitlyOther = sharingType.toLowerCase() === 'other';
        const isCustomBedCount = ![1, 2, 3].includes(totalBeds);
        matchesRoomType = isExplicitlyOther || isCustomBedCount;
      } else {
        if (selectedRoomType === 'single') {
          matchesRoomType = (sharingType.toLowerCase() === 'single' && totalBeds === 1) || 
                           (sharingType.toLowerCase() !== 'other' && totalBeds === 1);
        } else if (selectedRoomType === 'double') {
          matchesRoomType = (sharingType.toLowerCase() === 'double' && totalBeds === 2) || 
                           (sharingType.toLowerCase() !== 'other' && totalBeds === 2);
        } else if (selectedRoomType === 'triple') {
          matchesRoomType = (sharingType.toLowerCase() === 'triple' && totalBeds === 3) || 
                           (sharingType.toLowerCase() !== 'other' && totalBeds === 3);
        }
      }
      
      let matchesGenderPref = true;
      if (selectedGenderPref !== 'all') {
        const roomPreferences : any  = room.room_gender_preference;
        if (Array.isArray(roomPreferences)) {
          matchesGenderPref = roomPreferences.some(pref => 
            pref.toLowerCase().includes(selectedGenderPref.replace('_only', ''))
          );
        } else if (typeof roomPreferences === 'string') {
          matchesGenderPref = roomPreferences.toLowerCase().includes(
            selectedGenderPref.replace('_only', '')
          );
        }
      }
      
      return matchesSearch && matchesRoomType && matchesGenderPref;
    });
  }, [rooms, searchQuery, selectedRoomType, selectedGenderPref]);

  // Memoized paginated rooms
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRooms.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRooms, currentPage]);

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  // Room selection handlers
  const handleRoomSelect = useCallback((roomId: string, selected: boolean) => {
    setSelectedRooms(prev => 
      selected 
        ? [...prev, roomId]
        : prev.filter(id => id !== roomId)
    );
  }, []);

  const handleSelectAll = useCallback((roomIds: string[]) => {
    setSelectedRooms(roomIds);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedRooms([]);
  }, []);

  // Handle bulk action completion - FROM YOUR ORIGINAL CODE
  const handleBulkActionComplete = useCallback((updatedRooms?: RoomResponse[]) => {
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
  }, [fetchFilteredRooms, advancedFilters]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      setLoading(true);
      const { listRooms } = await import('@/lib/roomsApi');
      const response:any = await listRooms();
      if (response && Array.isArray(response)) {
        setRooms(response);
      } else if (response?.data && Array.isArray(response.data)) {
        setRooms(response.data);
      }
      toast.success("Rooms refreshed successfully!");
    } catch (error) {
      console.error('Error refreshing rooms:', error);
      toast.error("Failed to refresh rooms");
    } finally {
      setLoading(false);
    }
  }, []);

  // Export handler
  const handleExport = useCallback(() => {
    try {
      const exportData = rooms.map(room => ({
        'Room Number': room.room_number,
        'Property': room.property_name,
        'Sharing Type': room.sharing_type,
        'Total Beds': room.total_bed,
        'Occupied Beds': room.occupied_beds,
        'Available Beds': (room.total_bed || 0) - (room.occupied_beds || 0),
        'Rent per Bed': room.rent_per_bed,
        'Floor': room.floor,
        'Gender Preference': Array.isArray(room.room_gender_preference) 
          ? room.room_gender_preference.join(', ') 
          : room.room_gender_preference || 'Any',
        'Allow Couples': room.allow_couples ? 'Yes' : 'No',
        'Attached Bathroom': room.has_attached_bathroom ? 'Yes' : 'No',
        'Balcony': room.has_balcony ? 'Yes' : 'No',
        'AC': room.has_ac ? 'Yes' : 'No',
        'Amenities': Array.isArray(room.amenities) ? room.amenities.join(', ') : '',
        'Status': room.is_active ? 'Active' : 'Inactive'
      }));

      const headers = Object.keys(exportData[0] || {}).join(',');
      const csvRows = exportData.map(row => Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(','));
      
      const csv = [headers, ...csvRows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rooms-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Exported ${exportData.length} rooms successfully!`);
    } catch (error) {
      console.error('Error exporting rooms:', error);
      toast.error("Failed to export rooms");
    }
  }, [rooms]);

  // Import handler
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      toast.info("Import functionality - implement based on your backend API");
    };
    
    input.click();
  }, []);

  // Callbacks for event handlers
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Your original handleEdit function
  const handleEdit = useCallback((room: RoomResponse) => {
   
    
    const roomToEdit = rooms.find(r => r.id === room.id);
    if (!roomToEdit) {
      console.error("Room not found in state!");
      toast.error("Room data not found. Please refresh the page.");
      return;
    }

    
    
    setIsEditMode(true);
    setEditingRoomId(room.id.toString());
    
    const capacity = room.total_bed || 2;
    const sharingType = room.sharing_type || '';
    
    const standardCapacities = [1, 2, 3];
    const isStandardCapacity = standardCapacities.includes(capacity);
    let actualSharingType = sharingType;
    
    if (sharingType === 'other' || !isStandardCapacity) {
      actualSharingType = 'other';
    }
    
    const defaultForSharingType = actualSharingType === 'single' ? 1 : 
                                 actualSharingType === 'double' ? 2 : 
                                 actualSharingType === 'triple' ? 3 : 2;
    
    const isAutoCapacity = defaultForSharingType === capacity && actualSharingType !== 'other';

    const existingPhotos = processPhotoUrls(room.photo_urls).filter(
      (photo: { url: string | null; label: any }) => photo.url !== null
    ) as { url: string; label?: string }[];

    const genderPreferences = room.room_gender_preference 
      ? Array.isArray(room.room_gender_preference) 
        ? room.room_gender_preference.map(g => g.trim())
        : typeof room.room_gender_preference === 'string'
          ? room.room_gender_preference.split(',').map((g: string) => g.trim()).filter(Boolean)
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
      capacity: capacity,
      rent_per_bed: room.rent_per_bed || 0,
      floor: room.floor ? room.floor.toString() : '',
      has_attached_bathroom: hasAttachedBathroom,
      has_balcony: hasBalcony,
      has_ac: hasAC,
      amenities: room.amenities || [],
      photo_labels: {},
      photos: [],
      video: null,
      video_label: room.video_label || '',
      room_gender_preference: genderPreferences,
      allow_couples: allowCouples,
      is_active: isActive,
      existingPhotos: existingPhotos,
      photosToRemove: [],
      isManualCapacity: !isAutoCapacity || actualSharingType === 'other',
      customAmenityInput: '',
      description: room.description || '',
    });
    
    setRoomDialogOpen(true);
  }, [rooms]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const { deleteRoom } = await import('@/lib/roomsApi');
      await deleteRoom(id);
      toast.success("Room deleted successfully!");
      setRooms(prev => prev.filter(room => room.id.toString() !== id));
      setSelectedRooms(prev => prev.filter(roomId => roomId !== id));
    } catch {
      toast.error("Failed to delete room!");
    }
  }, []);

  const handleViewDetails = useCallback((room: RoomResponse) => {
    setSelectedRoom(room);
    setDetailsDialogOpen(true);
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
      property_id: '',
      room_number: '',
      sharing_type: '',
      capacity: 2,
      rent_per_bed: 0,
      floor: '',
      has_attached_bathroom: false,
      has_balcony: false,
      has_ac: false,
      amenities: [],
      photo_labels: {},
      photos: [],
      video: null,
      video_label: '',
      room_gender_preference: [],
      allow_couples: false,
      is_active: true,
      existingPhotos: [],
      photosToRemove: [],
      isManualCapacity: false,
      customAmenityInput: '',
      description: '',
    });
    setIsEditMode(false);
    setEditingRoomId(null);
  }, []);

  // Your original handleSubmit function
  const handleSubmit = useCallback(async () => {
    console.log("🔄 Submitting form data:", {
      property_id: formData.property_id,
      room_number: formData.room_number,
      sharing_type: formData.sharing_type,
      rent_per_bed: formData.rent_per_bed
    });

    if (!formData.property_id || !formData.room_number || !formData.sharing_type || formData.rent_per_bed <= 0) {
      console.error("❌ Validation failed:", {
        property_id: formData.property_id,
        room_number: formData.room_number,
        sharing_type: formData.sharing_type,
        rent_per_bed: formData.rent_per_bed
      });
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const formDataObj = new FormData();
      
      formDataObj.append('property_id', formData.property_id);
      formDataObj.append('room_number', formData.room_number);
      formDataObj.append('sharing_type', formData.sharing_type);
      formDataObj.append('total_beds', formData.capacity.toString());
      formDataObj.append('rent_per_bed', formData.rent_per_bed.toString());
      formDataObj.append('floor', formData.floor || '0');
      
      formDataObj.append('has_attached_bathroom', formData.has_attached_bathroom.toString());
      formDataObj.append('has_balcony', formData.has_balcony.toString());
      formDataObj.append('has_ac', formData.has_ac.toString());
      formDataObj.append('allow_couples', formData.allow_couples.toString());
      formDataObj.append('is_active', formData.is_active.toString());
      
      formDataObj.append('amenities', JSON.stringify(formData.amenities));
      formDataObj.append('room_gender_preference', formData.room_gender_preference.join(','));
      
      formDataObj.append('description', formData.description || '');
      formDataObj.append('video_label', formData.video_label || '');
      
      if (isEditMode && editingRoomId) {
        formDataObj.append('existing_photos', JSON.stringify(formData.existingPhotos));
        formDataObj.append('remove_photos', JSON.stringify(formData.photosToRemove));
        
        const removeVideo = formData.photosToRemove.length > 0 ? 'true' : 'false';
        formDataObj.append('remove_video', removeVideo);
      }

      const photoLabels: { [key: string]: string } = {};
      formData.photos.forEach((file, index) => {
        photoLabels[index] = formData.photo_labels[index] || 'Room View';
      });
      formDataObj.append('photo_labels', JSON.stringify(photoLabels));

      formData.photos.forEach(photo => {
        formDataObj.append('photos', photo);
      });

      if (formData.video) {
        formDataObj.append('video', formData.video);
      }

      if (isEditMode && editingRoomId) {
        const { updateRoom } = await import('@/lib/roomsApi');
        await updateRoom(editingRoomId, formDataObj);
        toast.success("Room updated successfully!");
      } else {
        const { createRoom } = await import('@/lib/roomsApi');
        await createRoom(formDataObj);
        toast.success("Room created successfully!");
      }

      setRoomDialogOpen(false);
      resetForm();
      
      const { listRooms } = await import('@/lib/roomsApi');
      const response:any = await listRooms();
      if (response && Array.isArray(response)) {
        setRooms(response);
      } else if (response?.data && Array.isArray(response.data)) {
        setRooms(response.data);
      }
      
    } catch (err: any) {
      console.error('Error saving room:', err);
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
    
    const items: Array<{url: string, label?: string, type: 'photo' | 'video'}> = [];
    
    const processedPhotos = processPhotoUrls(selectedGalleryRoom.photo_urls);
    processedPhotos.forEach((photo: { url: any; label: any; }) => {
      if (photo.url) {
        items.push({ 
          url: photo.url, 
          label: photo.label || 'Room View', 
          type: 'photo' 
        });
      }
    });
    
    if (selectedGalleryRoom.video_url) {
      const videoUrl = getMediaUrl(selectedGalleryRoom.video_url, 'video');
      if (videoUrl) {
        items.push({ 
          url: videoUrl, 
          label: selectedGalleryRoom.video_label || 'Room Video Walkthrough', 
          type: 'video' 
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
          const { listRooms } = await import('@/lib/roomsApi');
          const response:any = await listRooms();
          if (response && Array.isArray(response)) {
            setRooms(response);
          } else if (response?.data && Array.isArray(response.data)) {
            setRooms(response.data);
          }
        } catch (error) {
          console.error('Error loading rooms:', error);
          toast.error("Failed to load rooms");
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [rooms.length]);

  return (
    <div className=" ">
      {/* Stats Overview */}
      <div className="sticky top-20 z-10 py-0 md:py-2 px-0 mb-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Total Rooms */}
            <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
              <div className="p-1 bg-blue-100 rounded-md">
                <DoorOpen className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div className="leading-tight">
                <p className="text-[9px] text-gray-500 font-medium">Total Rooms</p>
                <p className="text-xs md:text-lg font-bold text-gray-900">
                  {roomStats.totalRooms}
                </p>
              </div>
            </div>

            {/* Total Beds */}
            <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
              <div className="p-1 bg-green-100 rounded-md">
                <Bed className="h-3.5 w-3.5 text-green-600" />
              </div>
              <div className="leading-tight">
                <p className="text-[9px] text-gray-500 font-medium">Total Beds</p>
                <p className="text-xs md:text-lg font-bold text-gray-900">
                  {roomStats.totalBeds}
                </p>
              </div>
            </div>

            {/* Available Beds */}
            <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
              <div className="p-1 bg-purple-100 rounded-md">
                <Users className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <div className="leading-tight">
                <p className="text-[9px] text-gray-500 font-medium">Available Beds</p>
                <p className="text-xs md:text-lg font-bold text-gray-900">
                  {roomStats.availableBeds}
                </p>
              </div>
            </div>

            {/* Occupancy */}
            <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 h-[56px] md:h-auto flex items-center gap-2">
              <div className="p-1 bg-amber-100 rounded-md">
                <Building2 className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <div className="leading-tight">
                <p className="text-[9px] text-gray-500 font-medium">Occupancy Rate</p>
                <p className="text-xs md:text-lg font-bold text-gray-900">
                  {roomStats.occupancyRate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="max-h-[calc(100vh-230px)] md:max-h-[calc(100vh-210px)] overflow-y-auto relative">
        {/* Desktop Header - Hidden on mobile */}
        <CardHeader className="hidden md:block bg-gradient-to-r from-blue-600 via-blue-500 to-blue-500 text-white sticky top-0 z-50 -translate-y-1 pt-2 rounded-xl">
          <div className="py-2  px-0  ">
            <div className="flex flex-col space-y-3">
              {/* Top Row */}
              <div className="flex items-center justify-between ">
                {/* LEFT: Icon + Search */}
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md shadow-md ring-1 ring-white/30">
                    <BedDouble className="h-5 w-5" />
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200" />
                    <input
                      type="text"
                      placeholder="Search rooms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-[420px] pl-9 pr-3 py-1.5 text-sm rounded-lg
                               bg-white/20 text-white placeholder-blue-100
                               backdrop-blur-md border border-white/30
                               shadow-sm focus:outline-none focus:ring-1 focus:ring-white/50"
                    />
                  </div>
                </div>

                {/* RIGHT: Buttons */}
                <div className="flex items-center gap-2">
                  {/* Refresh (icon only) */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 bg-white/10 text-white hover:bg-white/20 border-white/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>

                  {/* Filter (icon only) */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="relative h-8 w-8 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={() => setFilterSidebarOpen(true)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>

                  {/* Bulk Actions - ORIGINAL COMPONENT WITH FULL FUNCTIONALITY */}
                  {selectedRooms.length > 0 && (
                    <BulkActions
                      selectedRooms={selectedRooms}
                      onActionComplete={handleBulkActionComplete}
                    />
                  )}

                  {/* Export Button */}
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-8 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>

                  {/* Import Button */}
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-8 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={handleImport}
                  >
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>

                  {/* Add New Room Button */}
                  <Button
                    className="bg-white text-blue-600 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 font-semibold border-2 border-white/50 px-3 py-1.5 text-sm flex items-center h-8"
                    onClick={() => {
                      resetForm();
                      setRoomDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Room
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Mobile Header - Only visible on mobile */}
        <CardHeader className="md:hidden bg-gradient-to-r from-blue-600 via-blue-500 to-blue-500  text-white sticky top-0 z-30 py-1.5 rounded-xl">
          <div className="px-2">
            {/* Top Compact Row */}
            <div className="flex items-center justify-between mb-1">
              {/* Left: Title + Bulk Actions */}
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded-md bg-white/20 backdrop-blur-md shadow-sm ring-1 ring-white/30">
                  <BedDouble className="h-3 w-3" />
                </div>
                <span className="text-sm font-semibold">Rooms</span>
                
                {/* Bulk Actions - ORIGINAL COMPONENT WITH FULL FUNCTIONALITY */}
                {selectedRooms.length > 0 && (
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
                  variant="ghost"
                  className="h-6 w-6 bg-white/10 text-white hover:bg-white/20 border-white/30 backdrop-blur-sm"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>

                {/* Filter Icon */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="relative h-6 w-6 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm"
                  onClick={() => setFilterSidebarOpen(true)}
                >
                  <Filter className="h-3 w-3" />
                </Button>

                {/* Export Icon */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm"
                  onClick={handleExport}
                >
                  <Download className="h-3 w-3" />
                </Button>

                {/* Import Icon */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm"
                  onClick={handleImport}
                >
                  <Upload className="h-3 w-3" />
                </Button>

                {/* Add Room Button */}
                <Button
                  size="sm"
                  className="h-6 bg-white text-blue-600 hover:bg-blue-50 font-semibold border border-white/50 px-2 text-xs flex items-center ml-1"
                  onClick={() => {
                    resetForm();
                    setRoomDialogOpen(true);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Compact Search Bar */}
            <div className="relative py-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-blue-200" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md
                         bg-white/20 text-white placeholder-blue-100
                         backdrop-blur-md border border-white/30
                         shadow-sm focus:outline-none focus:ring-1 focus:ring-white/50"
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
            <div className="text-center py-12">
              <DoorOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchQuery || selectedRoomType !== 'all' || selectedGenderPref !== 'all'
                  ? 'No rooms match your search criteria. Try adjusting your filters.'
                  : 'Get started by adding your first room.'}
              </p>
              {!searchQuery && selectedRoomType === 'all' && selectedGenderPref === 'all' && (
                <Button 
                  className="mt-4"
                  onClick={() => {
                    resetForm();
                    setRoomDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Room
                </Button>
              )}
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
              />

              {totalPages > 1 && (
                <RoomsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredRooms.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  className='bg-white px-6 sticky bottom-0 z-30'
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
  hideTrigger={true} // Add this prop to hide the floating button
/>

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
          onOpenChange={setBedDialogOpen}
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