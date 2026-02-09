"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DoorOpen, Plus, Search, Filter, Bed, Users, Building2 } from 'lucide-react';
import { toast } from "sonner";
import { type RoomResponse } from '@/lib/roomsApi';

// Import optimized components
import RoomsFilters from './rooms-filters';
import RoomsGrid from './rooms-grid';
import RoomsPagination from './rooms-pagination';
import { RoomForm } from './room-form';
import { BedManagementDialog } from './bed-management-dialog';
import { PhotoGalleryModal } from './PhotoGalleryModal';
import { RoomDetailsDialog } from './RoomDetailsDialog';

// Types
interface RoomsClientProps {
  initialRooms: RoomResponse[];
  initialProperties: any[];
}

// Constants (moved from original component)
const ROOM_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'triple', label: 'Triple' },
  { value: 'other', label: 'Other' }
];

const GENDER_FILTERS = [
  { value: 'all', label: 'All Genders' },
  { value: 'male_only', label: 'Male Only' },
  { value: 'female_only', label: 'Female Only' },
  { value: 'couples', label: 'Couples' },
];

export default function RoomsClient({ initialRooms, initialProperties }: RoomsClientProps) {
  // State management with safe defaults
  const [rooms, setRooms] = useState<RoomResponse[]>(Array.isArray(initialRooms) ? initialRooms : []);
  const [properties, setProperties] = useState(Array.isArray(initialProperties) ? initialProperties : []);
  const [loading, setLoading] = useState(false);
  
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
  const itemsPerPage = 12;

  // Form state - RESTORED YOUR ORIGINAL FORM DATA STRUCTURE
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
    // Ensure rooms is always an array
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

  // Memoized filtered rooms with safe defaults
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
      
      // Search filter
      const matchesSearch = 
        !searchQuery ||
        roomNumberStr.toLowerCase().includes(searchLower) ||
        propertyName.includes(searchLower) ||
        propertyAddress.includes(searchLower) ||
        sharingType.toLowerCase().includes(searchLower);
      
      // Room type filter
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
      
      // Gender preference filter
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

  // Callbacks for event handlers
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Your original handleEdit function
  const handleEdit = useCallback((room: RoomResponse) => {
    console.log("=== START EDITING ===");
    console.log("Clicked room ID:", room.id);
    
    // Find the exact room from state to ensure correct data
    const roomToEdit = rooms.find(r => r.id === room.id);
    if (!roomToEdit) {
      console.error("Room not found in state!");
      toast.error("Room data not found. Please refresh the page.");
      return;
    }

    console.log("Found room to edit:", {
      id: roomToEdit.id,
      room_number: roomToEdit.room_number,
      is_active: roomToEdit.is_active
    });
    
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

    // Process existing photos properly
    const { processPhotoUrls } = require('@/lib/roomsApi');
    const existingPhotos = processPhotoUrls(room.photo_urls);

    // Get gender preferences correctly
    const genderPreferences = room.room_gender_preference 
      ? Array.isArray(room.room_gender_preference) 
        ? room.room_gender_preference.map(g => g.trim())
        : typeof room.room_gender_preference === 'string'
          ? room.room_gender_preference.split(',').map((g: string) => g.trim()).filter(Boolean)
          : []
      : [];

    // Process boolean fields
    const isActive = Boolean(roomToEdit.is_active);
    const allowCouples = Boolean(roomToEdit.allow_couples);
    const hasAttachedBathroom = Boolean(roomToEdit.has_attached_bathroom);
    const hasBalcony = Boolean(roomToEdit.has_balcony);
    const hasAC = Boolean(roomToEdit.has_ac);

    console.log("Setting form data for room:", {
      id: roomToEdit.id,
      room_number: roomToEdit.room_number,
      is_active: isActive,
      gender_preferences: genderPreferences
    });

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
    console.log("=== EDIT FORM OPENED ===");
  }, [rooms]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const { deleteRoom } = await import('@/lib/roomsApi');
      await deleteRoom(id);
      toast.success("Room deleted successfully!");
      setRooms(prev => prev.filter(room => room.id.toString() !== id));
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
    console.log("Resetting form...");
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

  // Your original handleSubmit function - WORKING VERSION
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
      
      // REQUIRED FIELDS - हमेशा भेजें
      formDataObj.append('property_id', formData.property_id);
      formDataObj.append('room_number', formData.room_number);
      formDataObj.append('sharing_type', formData.sharing_type);
      formDataObj.append('total_beds', formData.capacity.toString());
      formDataObj.append('rent_per_bed', formData.rent_per_bed.toString());
      formDataObj.append('floor', formData.floor || '0');
      
      // OPTIONAL BOOLEAN FIELDS - हमेशा भेजें
      formDataObj.append('has_attached_bathroom', formData.has_attached_bathroom.toString());
      formDataObj.append('has_balcony', formData.has_balcony.toString());
      formDataObj.append('has_ac', formData.has_ac.toString());
      formDataObj.append('allow_couples', formData.allow_couples.toString());
      formDataObj.append('is_active', formData.is_active.toString()); // ✅ FIXED
      
      // ARRAY FIELDS
      formDataObj.append('amenities', JSON.stringify(formData.amenities));
      formDataObj.append('room_gender_preference', formData.room_gender_preference.join(','));
      
      // DESCRIPTION & VIDEO LABEL
      formDataObj.append('description', formData.description || '');
      formDataObj.append('video_label', formData.video_label || '');
      
      // EXISTING DATA FOR EDIT MODE
      if (isEditMode && editingRoomId) {
        formDataObj.append('existing_photos', JSON.stringify(formData.existingPhotos));
        formDataObj.append('remove_photos', JSON.stringify(formData.photosToRemove));
        
        // Remove video only if explicitly requested
        const removeVideo = formData.photosToRemove.length > 0 ? 'true' : 'false';
        formDataObj.append('remove_video', removeVideo);
      }

      // PHOTO LABELS
      const photoLabels: { [key: string]: string } = {};
      formData.photos.forEach((file, index) => {
        photoLabels[index] = formData.photo_labels[index] || 'Room View';
      });
      formDataObj.append('photo_labels', JSON.stringify(photoLabels));

      // ADD FILES
      formData.photos.forEach(photo => {
        formDataObj.append('photos', photo);
      });

      if (formData.video) {
        formDataObj.append('video', formData.video);
      }

      console.log("📦 FormData entries:");
      for (let [key, value] of (formDataObj as any).entries()) {
        console.log(`${key}:`, value);
      }

      // API CALL
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
      
      // Refresh data
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
    
    // Add photos
    const { processPhotoUrls, getMediaUrl } = require('@/lib/roomsApi');
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
    
    // Add video
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
    <div className="space-y-6 ">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Rooms</p>
                <h3 className="text-2xl font-bold">{roomStats.totalRooms}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DoorOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Beds</p>
                <h3 className="text-2xl font-bold">{roomStats.totalBeds}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Bed className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Beds</p>
                <h3 className="text-2xl font-bold">{roomStats.availableBeds}</h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Occupancy Rate</p>
                <h3 className="text-2xl font-bold">{roomStats.occupancyRate}</h3>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Building2 className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="border shadow-sm h-20">
        <CardHeader className="bg-blue-500 border-b p-4 sticky top-20 z-30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Left side: Search */}
            <div className="flex items-center gap-3 flex-1">
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search rooms..."
                  className="pl-10 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Right side: Filter + Add New Room */}
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <RoomsFilters
                selectedRoomType={selectedRoomType}
                selectedGenderPref={selectedGenderPref}
                onRoomTypeChange={setSelectedRoomType}
                onGenderPrefChange={setSelectedGenderPref}
                roomTypes={ROOM_TYPES}
                genderFilters={GENDER_FILTERS}
              />
              
              <Button
                onClick={() => {
                  resetForm();
                  setRoomDialogOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 h-9 whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Room
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 ">
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