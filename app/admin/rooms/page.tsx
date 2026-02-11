// "use client";

// import { AdminHeader } from '@/components/admin/admin-header';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Label } from "@/components/ui/label";
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import {
//   DoorOpen, Plus, Pencil, Trash2, Eye, ChevronLeft, ChevronRight, 
//   Search, Filter, UserRound, Users, Home, MapPin,
//   Video, Globe, Heart, BadgeIndianRupee, Bed,
//   Building, CheckCircle, XCircle, Image as ImageIcon,
//   ArrowRight, Maximize2, Bath, Wind, Sun, Sparkles,
//   Wifi, Tv, Droplets, Shield, Coffee, Car, Dumbbell,
//   TreePine, Waves, Thermometer, UsersRound,
//   House, Edit2, User, ArrowUpRight, Check, X,
//   Building2, Hotel, SquareStack, UserPlus
// } from 'lucide-react';
// import { useEffect, useState, useMemo } from 'react';
// import {
//   listRooms,
//   createRoom,
//   updateRoom,
//   deleteRoom,
//   listActiveProperties,
//   type RoomResponse,
//   getMediaUrl,
//   processPhotoUrls,
//   getRoomById
// } from '@/lib/roomsApi';
// import { toast } from "sonner";
// import { RoomForm } from '@/components/admin/room-form';
// import { BedManagementDialog } from '@/components/admin/bed-management-dialog';
// import { PhotoGalleryModal } from '@/components/admin/PhotoGalleryModal';
// import { RoomDetailsDialog } from '@/components/admin/RoomDetailsDialog';

// // Room types for filter
// const ROOM_TYPES = [
//   { value: 'all', label: 'All Types' },
//   { value: 'single', label: 'Single' },
//   { value: 'double', label: 'Double' },
//   { value: 'triple', label: 'Triple' },
//   { value: 'other', label: 'Other' }
// ];

// // Gender filter options
// const GENDER_FILTERS = [
//   { value: 'all', label: 'All Genders' },
//   { value: 'male_only', label: 'Male Only' },
//   { value: 'female_only', label: 'Female Only' },
//   { value: 'couples', label: 'Couples' },
// ];

// // Gender icon component
// const GenderIcon = ({ gender, size = "h-4 w-4" }: { gender: string; size?: string }) => {
//   const normalizedGender = gender?.toLowerCase() || '';
  
//   if (normalizedGender.includes('male') || normalizedGender === 'male_only' || normalizedGender === 'm') {
//     return <User className={`${size} text-blue-600`} />;
//   } else if (normalizedGender.includes('female') || normalizedGender === 'female_only' || normalizedGender === 'f') {
//     return <UserRound className={`${size} text-pink-600`} />;
//   } else if (normalizedGender.includes('couple') || normalizedGender === 'couples') {
//     return <UsersRound className={`${size} text-red-600`} />;
//   } else {
//     return <User className={`${size} text-gray-600`} />;
//   }
// };

// export default function RoomsPage() {
//   // State for rooms data
//   const [rooms, setRooms] = useState<RoomResponse[]>([]);
//   const [properties, setProperties] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
  
//   // State for dialogs
//   const [roomDialogOpen, setRoomDialogOpen] = useState(false);
//   const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
//   const [bedDialogOpen, setBedDialogOpen] = useState(false);
  
//   // State for editing
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  
//   // State for selected room
//   const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
  
//   // Search and filter state
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
//   const [selectedGenderPref, setSelectedGenderPref] = useState<string>('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(12);

//   const [galleryOpen, setGalleryOpen] = useState(false);
//   const [galleryItems, setGalleryItems] = useState<Array<{url: string, label?: string, type: 'photo' | 'video'}>>([]);
//   const [selectedGalleryRoom, setSelectedGalleryRoom] = useState<RoomResponse | null>(null);

//   // Form state
//   const [formData, setFormData] = useState({
//     property_id: '',
//     room_number: '',
//     sharing_type: '',
//     capacity: 2,
//     rent_per_bed: 0,
//     floor: '',
//     has_attached_bathroom: false,
//     has_balcony: false,
//     has_ac: false,
//     amenities: [] as string[],
//     photo_labels: {} as { [key: string]: string },
//     photos: [] as File[],
//     video: null as File | null,
//     video_label: '',
//     room_gender_preference: [] as string[],
//     allow_couples: false,
//     is_active: true,
//     existingPhotos: [] as { url: string; label?: string }[],
//     photosToRemove: [] as string[],
//     isManualCapacity: false,
//     customAmenityInput: '',
//     description: '',
//   });

//   // Room type configuration
//   const roomTypeConfig: Record<string, { capacity: number, color: string }> = {
//     'single': { capacity: 1, color: 'bg-blue-500' },
//     'double': { capacity: 2, color: 'bg-green-500' },
//     'triple': { capacity: 3, color: 'bg-purple-500' },
//     'other': { capacity: 1, color: 'bg-gray-500' }
//   };

//   // Fetch data functions
//   const fetchAllProperties = async () => {
//     try {
//       const response = await listActiveProperties();
//       if (response.data && Array.isArray(response.data)) {
//         setProperties(response.data);
//       } else {
//         setProperties([]);
//       }
//     } catch {
//       setProperties([]);
//       toast.error("Failed to load properties");
//     }
//   };

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const response = await listRooms();
//       if (response.data && Array.isArray(response.data)) {
//         setRooms(response.data);
//       } else {
//         setRooms([]);
//       }
//     } catch (error) {
//       console.error('Error loading rooms:', error);
//       setRooms([]);
//       toast.error("Failed to load rooms");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load data on component mount
//   useEffect(() => {
//     fetchAllProperties();
//     loadData();
//   }, []);

//   // Form handlers
//   const resetForm = () => {
//     console.log("Resetting form...");
//     setFormData({
//       property_id: '',
//       room_number: '',
//       sharing_type: '',
//       capacity: 2,
//       rent_per_bed: 0,
//       floor: '',
//       has_attached_bathroom: false,
//       has_balcony: false,
//       has_ac: false,
//       amenities: [],
//       photo_labels: {},
//       photos: [],
//       video: null,
//       video_label: '',
//       room_gender_preference: [],
//       allow_couples: false,
//       is_active: true,
//       existingPhotos: [],
//       photosToRemove: [],
//       isManualCapacity: false,
//       customAmenityInput: '',
//       description: '',
//     });
//     setIsEditMode(false);
//     setEditingRoomId(null);
//   };

//   const handleEdit = (room: RoomResponse) => {
//    console.log("=== START EDITING ===");
//   console.log("Clicked room ID:", room.id);
//   console.log("All rooms in state:", rooms.map(r => ({ id: r.id, room_number: r.room_number })));
  
//   // Find the exact room from state to ensure correct data
//   const roomToEdit = rooms.find(r => r.id === room.id);
//   if (!roomToEdit) {
//     console.error("Room not found in state!");
//     toast.error("Room data not found. Please refresh the page.");
//     return;
//   }

//   console.log("Found room to edit:", {
//     id: roomToEdit.id,
//     room_number: roomToEdit.room_number,
//     is_active: roomToEdit.is_active
//   });
//     setIsEditMode(true);
//     setEditingRoomId(room.id.toString());
    
//     const capacity = room.total_bed || 2;
//     const sharingType = room.sharing_type || '';
    
//     const standardCapacities = [1, 2, 3];
//     const isStandardCapacity = standardCapacities.includes(capacity);
//     let actualSharingType = sharingType;
    
//     if (sharingType === 'other' || !isStandardCapacity) {
//       actualSharingType = 'other';
//     }
    
//     const defaultForSharingType = roomTypeConfig[actualSharingType]?.capacity || 2;
//     const isAutoCapacity = defaultForSharingType === capacity && actualSharingType !== 'other';

    
//     // Process existing photos properly
//     const existingPhotos = processPhotoUrls(room.photo_urls);

//     // Get gender preferences correctly
//     const genderPreferences = room.room_gender_preference 
//       ? Array.isArray(room.room_gender_preference) 
//         ? room.room_gender_preference.map(g => g.trim())
//         : typeof room.room_gender_preference === 'string'
//           ? room.room_gender_preference.split(',').map(g => g.trim()).filter(Boolean)
//           : []
//       : [];

//       // Process boolean fields
//   const isActive = Boolean(roomToEdit.is_active);
//   const allowCouples = Boolean(roomToEdit.allow_couples);
//   const hasAttachedBathroom = Boolean(roomToEdit.has_attached_bathroom);
//   const hasBalcony = Boolean(roomToEdit.has_balcony);
//   const hasAC = Boolean(roomToEdit.has_ac);

//   console.log("Setting form data for room:", {
//     id: roomToEdit.id,
//     room_number: roomToEdit.room_number,
//     is_active: isActive,
//     gender_preferences: genderPreferences
//   });


//     setFormData({
//       property_id: room.property_id.toString(),
//       room_number: room.room_number.toString(),
//       sharing_type: actualSharingType,
//       capacity: capacity,
//       rent_per_bed: room.rent_per_bed || 0,
//       floor: room.floor ? room.floor.toString() : '',
//       has_attached_bathroom: Boolean(room.has_attached_bathroom),
//       has_balcony: Boolean(room.has_balcony),
//       has_ac: Boolean(room.has_ac),
//       amenities: room.amenities || [],
//       photo_labels: {},
//       photos: [],
//       video: null,
//       video_label: room.video_label || '',
//       room_gender_preference: genderPreferences,
//       allow_couples: Boolean(room.allow_couples),
//       is_active: isActive,
//       existingPhotos: existingPhotos,
//       photosToRemove: [],
//       isManualCapacity: !isAutoCapacity || actualSharingType === 'other',
//       customAmenityInput: '',
//       description: room.description || '',
//     });
//     setRoomDialogOpen(true);
//      console.log("=== EDIT FORM OPENED ===");
//   };

//   // components/admin/room-form.tsx में handleSubmit function update करें
// const handleSubmit = async () => {
//   if (!formData.property_id || !formData.room_number || !formData.sharing_type || formData.rent_per_bed <= 0) {
//     toast.error("Please fill all required fields");
//     return;
//   }

//   try {
//     const formDataObj = new FormData();
    
//     // REQUIRED FIELDS - 
//     formDataObj.append('property_id', formData.property_id);
//     formDataObj.append('room_number', formData.room_number);
//     formDataObj.append('sharing_type', formData.sharing_type);
//     formDataObj.append('total_beds', formData.capacity.toString());
//     formDataObj.append('rent_per_bed', formData.rent_per_bed.toString());
//     formDataObj.append('floor', formData.floor || '0');
    
//     // OPTIONAL BOOLEAN FIELDS - 
//     formDataObj.append('has_attached_bathroom', formData.has_attached_bathroom.toString());
//     formDataObj.append('has_balcony', formData.has_balcony.toString());
//     formDataObj.append('has_ac', formData.has_ac.toString());
//     formDataObj.append('allow_couples', formData.allow_couples.toString());
//     formDataObj.append('is_active', formData.is_active.toString()); // ✅ FIXED
    
//     // ARRAY FIELDS
//     formDataObj.append('amenities', JSON.stringify(formData.amenities));
//     formDataObj.append('room_gender_preference', formData.room_gender_preference.join(','));
    
//     // DESCRIPTION & VIDEO LABEL
//     formDataObj.append('description', formData.description || '');
//     formDataObj.append('video_label', formData.video_label || '');
    
//     // EXISTING DATA FOR EDIT MODE
//     if (isEditMode && editingRoomId) {
//       formDataObj.append('existing_photos', JSON.stringify(formData.existingPhotos));
//       formDataObj.append('remove_photos', JSON.stringify(formData.photosToRemove));
      
//       // Remove video only if explicitly requested
//       const removeVideo = formData.photosToRemove.length > 0 ? 'true' : 'false';
//       formDataObj.append('remove_video', removeVideo);
//     }

//     // PHOTO LABELS
//     const photoLabels: { [key: string]: string } = {};
//     formData.photos.forEach((file, index) => {
//       photoLabels[index] = formData.photo_labels[index] || 'Room View';
//     });
//     formDataObj.append('photo_labels', JSON.stringify(photoLabels));

//     // ADD FILES
//     formData.photos.forEach(photo => {
//       formDataObj.append('photos', photo);
//     });

//     if (formData.video) {
//       formDataObj.append('video', formData.video);
//     }

//     // API CALL
//     if (isEditMode && editingRoomId) {
//       await updateRoom(editingRoomId, formDataObj);
//       toast.success("Room updated successfully!");
//     } else {
//       await createRoom(formDataObj);
//       toast.success("Room created successfully!");
//     }

//     setRoomDialogOpen(false);
//     resetForm();
//     await loadData();
//   } catch (err) {
//     console.error('Error saving room:', err);
//     toast.error("Failed to save room");
//   }
// };


//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this room?")) return;

//     try {
//       await deleteRoom(id);
//       toast.success("Room deleted successfully!");
//       await loadData();
//     } catch {
//       toast.error("Failed to delete room!");
//     }
//   };

//   const handleViewDetails = (room: RoomResponse) => {
//     setSelectedRoom(room);
//     setDetailsDialogOpen(true);
//   };

//   const handleBedManagement = (room: RoomResponse) => {
//     setSelectedRoom(room);
//     setBedDialogOpen(true);
//   };

//   // Gallery functions
//   const openGallery = (room: RoomResponse) => {
//     const items: Array<{url: string, label?: string, type: 'photo' | 'video'}> = [];
    
//     // Process photos
//     const processedPhotos = processPhotoUrls(room.photo_urls);
//     processedPhotos.forEach(photo => {
//       if (photo.url) {
//         items.push({ 
//           url: photo.url, 
//           label: photo.label || 'Room View', 
//           type: 'photo' 
//         });
//       }
//     });
    
//     // Process video
//     if (room.video_url) {
//       const videoUrl = getMediaUrl(room.video_url, 'video');
//       if (videoUrl) {
//         items.push({ 
//           url: videoUrl, 
//           label: room.video_label || 'Room Video Walkthrough', 
//           type: 'video' 
//         });
//       }
//     }
    
//     setGalleryItems(items);
//     setSelectedGalleryRoom(room);
//     setGalleryOpen(true);
//   };

//   // Filtering & pagination
//   const filteredRooms = useMemo(() => {
//     return rooms.filter(room => {
//       const searchLower = searchQuery.toLowerCase();
//       const roomNumberStr = room.room_number ? room.room_number.toString() : '';
//       const propertyName = (room.property_name || '').toLowerCase();
//       const propertyAddress = (room.property_address || '').toLowerCase();
//       const sharingType = room.sharing_type || '';
//       const totalBeds = room.total_bed || 0;
      
//       const matchesSearch = 
//         !searchQuery ||
//         roomNumberStr.toLowerCase().includes(searchLower) ||
//         propertyName.includes(searchLower) ||
//         propertyAddress.includes(searchLower) ||
//         sharingType.toLowerCase().includes(searchLower);
      
//       let matchesRoomType = false;
      
//       if (selectedRoomType === 'all') {
//         matchesRoomType = true;
//       } else if (selectedRoomType === 'other') {
//         const isExplicitlyOther = sharingType.toLowerCase() === 'other';
//         const isCustomBedCount = ![1, 2, 3].includes(totalBeds);
//         matchesRoomType = isExplicitlyOther || isCustomBedCount;
//       } else {
//         if (selectedRoomType === 'single') {
//           matchesRoomType = (sharingType.toLowerCase() === 'single' && totalBeds === 1) || 
//                            (sharingType.toLowerCase() !== 'other' && totalBeds === 1);
//         } else if (selectedRoomType === 'double') {
//           matchesRoomType = (sharingType.toLowerCase() === 'double' && totalBeds === 2) || 
//                            (sharingType.toLowerCase() !== 'other' && totalBeds === 2);
//         } else if (selectedRoomType === 'triple') {
//           matchesRoomType = (sharingType.toLowerCase() === 'triple' && totalBeds === 3) || 
//                            (sharingType.toLowerCase() !== 'other' && totalBeds === 3);
//         }
//       }
      
//       let matchesGenderPref = true;
//       if (selectedGenderPref !== 'all') {
//         const roomPreferences = room.room_gender_preference;
//         if (Array.isArray(roomPreferences)) {
//           matchesGenderPref = roomPreferences.some(pref => 
//             pref.toLowerCase().includes(selectedGenderPref.replace('_only', ''))
//           );
//         } else if (typeof roomPreferences === 'string') {
//           matchesGenderPref = roomPreferences.toLowerCase().includes(
//             selectedGenderPref.replace('_only', '')
//           );
//         }
//       }
      
//       return matchesSearch && matchesRoomType && matchesGenderPref;
//     });
//   }, [rooms, searchQuery, selectedRoomType, selectedGenderPref]);

//   // Pagination
//   const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedRooms = filteredRooms.slice(startIndex, startIndex + itemsPerPage);

//   const handlePageChange = (page: number) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

// // MODERN CARD DESIGN WITH IMPROVED LAYOUT
// const renderRoomCard = (room: RoomResponse) => {
//   const totalBeds = room.total_bed || 0;
//   const availableBeds = room.total_bed - room.occupied_beds;
//   const occupancyRate = totalBeds > 0 ? Math.round((room.occupied_beds / totalBeds) * 100) : 0;
  
//   const processedPhotos = processPhotoUrls(room.photo_urls);
//   const imageUrl = processedPhotos.length > 0 ? processedPhotos[0].url : '/placeholder-room.jpg';
  
//   const genderPreferences = Array.isArray(room.room_gender_preference) 
//     ? room.room_gender_preference 
//     : typeof room.room_gender_preference === 'string'
//       ? room.room_gender_preference.split(',').filter(Boolean)
//       : [];

//   const currentOccupants = room.bed_assignments?.filter(bed => bed.tenant_id) || [];

//   return (
//     <Card key={room.id} className="group relative border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
//       {/* IMAGE SECTION WITH OVERLAY */}
//       <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
//   <img
//     src={imageUrl}
//     alt={`Room ${room.room_number}`}
//     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//     onError={(e) => {
//       const target = e.target as HTMLImageElement;
//       target.src = '/placeholder-room.jpg';
//     }}
//   />
  
//   {/* TOP OVERLAY BADGES */}
//   <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
//     <Badge className="bg-white/95 backdrop-blur-sm text-gray-900 border-0 shadow-md font-semibold px-2 py-1 text-xs">
//       <DoorOpen className="h-3 w-3 mr-1" />
//       Room {room.room_number}
//     </Badge>
//     <Badge 
//       className={`${
//         availableBeds > 0 
//           ? 'bg-green-500 hover:bg-green-600' 
//           : 'bg-red-500 hover:bg-red-600'
//       } text-white border-0 shadow-md font-semibold px-2 py-1 text-xs`}
//     >
//       {availableBeds > 0 ? `${availableBeds} Available` : 'Full'}
//     </Badge>
//   </div>

//   {/* BOTTOM GRADIENT OVERLAY */}
//   <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
  
//   {/* PRICE TAG */}
//   <div className="absolute bottom-2 left-2">
//     <div className="bg-white/95 backdrop-blur-sm rounded-md px-2 py-1.5 shadow-md">
//       <div className="flex items-center gap-0.5">
//         <BadgeIndianRupee className="h-3.5 w-3.5 text-green-600" />
//         <span className="text-sm font-bold text-gray-900">₹{room.rent_per_bed}</span>
//         <span className="text-xs text-gray-600">/bed</span>
//       </div>
//     </div>
//   </div>

//   {/* GALLERY BUTTON */}
//   <Button
//     size="icon"
//     variant="secondary"
//     className="absolute bottom-2 right-2 h-8 w-8 bg-white/95 hover:bg-white shadow-md backdrop-blur-sm"
//     onClick={() => openGallery(room)}
//   >
//     <ImageIcon className="h-3.5 w-3.5" />
//   </Button>
// </div>

//       {/* CONTENT SECTION */}
//       <div className="p-5">
       
// <div className="mb-3">
//   <div className="flex items-start gap-1.5 mb-1">
//     <Building2 className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
//     <div className="flex-1 min-w-0">
//       <p className="font-semibold text-gray-900 text-xs truncate">{room.property_name}</p>
//       <p className="text-[10px] text-gray-500 truncate">{room.property_address}</p>
//     </div>
//   </div>
//   <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] text-gray-600">
//     <div className="flex items-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded">
//       <Building className="h-3 w-3" />
//       <span>F{room.floor || 'G'}</span>
//     </div>
//     {room.has_attached_bathroom && (
//       <div className="flex items-center gap-0.5 bg-blue-50 px-1.5 py-0.5 rounded">
//         <Bath className="h-3 w-3 text-blue-500" />
//         <span>Bath</span>
//       </div>
//     )}
//     {room.has_ac && (
//       <div className="flex items-center gap-0.5 bg-cyan-50 px-1.5 py-0.5 rounded">
//         <Wind className="h-3 w-3 text-cyan-500" />
//         <span>AC</span>
//       </div>
//     )}
//     {room.has_balcony && (
//       <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded">
//         <Sun className="h-3 w-3 text-amber-500" />
//         <span>Balcony</span>
//       </div>
//     )}
//   </div>
// </div>

//         {/* OCCUPANCY BAR - COMPACT */}
// <div className="mb-3">
//   <div className="flex items-center justify-between mb-1.5">
//     <span className="text-xs font-medium text-gray-600">Occupancy</span>
//     <span className="text-xs font-bold text-gray-800">{room.occupied_beds}/{totalBeds} ({occupancyRate}%)</span>
//   </div>
//   <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
//     <div 
//       className={`h-full transition-all duration-500 ${
//         occupancyRate === 100 ? 'bg-red-500' : 
//         occupancyRate >= 75 ? 'bg-amber-500' : 
//         'bg-green-500'
//       }`}
//       style={{ width: `${occupancyRate}%` }}
//     />
//   </div>
// </div>

       
// <div className="grid grid-cols-3 gap-1.5 mb-3">
//   <div className="text-center p-1.5 bg-blue-50 rounded-md border border-blue-100">
//     <Bed className="h-3.5 w-3.5 mx-auto mb-0.5 text-blue-600" />
//     <div className="text-sm font-semibold text-blue-700">{totalBeds}</div>
//     <div className="text-[10px] text-blue-600">Beds</div>
//   </div>
//   <div className="text-center p-1.5 bg-green-50 rounded-md border border-green-100">
//     <CheckCircle className="h-3.5 w-3.5 mx-auto mb-0.5 text-green-600" />
//     <div className="text-sm font-semibold text-green-700">{room.occupied_beds}</div>
//     <div className="text-[10px] text-green-600">Occupied</div>
//   </div>
//   <div className="text-center p-1.5 bg-amber-50 rounded-md border border-amber-100">
//     <UserPlus className="h-3.5 w-3.5 mx-auto mb-0.5 text-amber-600" />
//     <div className="text-sm font-semibold text-amber-700">{availableBeds}</div>
//     <div className="text-[10px] text-amber-600">Available</div>
//   </div>
// </div>

//         {/* GENDER PREFERENCES - COMPACT */}
// {genderPreferences.length > 0 && (
//   <div className="mb-3">
//     <div className="flex items-center gap-1.5 mb-1.5">
//       <Users className="h-3 w-3 text-gray-500" />
//       <span className="text-xs font-medium text-gray-600">Gender Preferences</span>
//     </div>
//     <div className="flex flex-wrap gap-1">
//       {genderPreferences.map((pref, index) => {
//         const prefLower = pref.toLowerCase();
//         const isMale = prefLower === 'male_only' || prefLower === 'male';
//         const isFemale = prefLower === 'female_only' || prefLower === 'female';
//         const isCouples = prefLower === 'couples';

//         return (
//           <span
//             key={index}
//             className="text-xs px-2 py-0.5 rounded font-medium"
//             style={{
//               backgroundColor: isMale ? '#dbeafe' : isFemale ? '#fce7f3' : isCouples ? '#fee2e2' : '#f3f4f6',
//               color: isMale ? '#1e40af' : isFemale ? '#be185d' : isCouples ? '#dc2626' : '#374151',
//             }}
//           >
//             {isMale ? '♂ Male' : isFemale ? '♀ Female' : isCouples ? '💑' : pref}
//           </span>
//         );
//       })}
//     </div>
//   </div>
// )}

//         {/* CURRENT OCCUPANTS */}
//         {/* CURRENT OCCUPANTS - COMPACT */}
// <div className="mb-3">
//   <div className="flex items-center justify-between mb-1.5">
//     <div className="flex items-center gap-1.5">
//       <UsersRound className="h-3 w-3 text-gray-500" />
//       <span className="text-xs font-medium text-gray-600">Occupants</span>
//     </div>
//     <span className="text-xs font-medium text-gray-500">
//       {currentOccupants.length}/{totalBeds}
//     </span>
//   </div>
//   {currentOccupants.length > 0 ? (
//     <div className="flex items-center gap-1.5">
//       {currentOccupants.slice(0, 6).map((bed, index) => {
//         const isCouple = bed.tenant_gender?.toLowerCase() === 'couple';
//         const isMale = bed.tenant_gender?.toLowerCase() === 'male';
//         const isFemale = bed.tenant_gender?.toLowerCase() === 'female';
        
//         return (
//           <div
//             key={bed.id}
//             className="relative group w-7 h-7 rounded-full flex items-center justify-center shadow-sm border transition-transform hover:scale-110"
//             style={{
//               background: isCouple ? 'linear-gradient(135deg, #fce7f3 0%, #dbeafe 100%)'
//                        : isMale ? 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)'
//                        : isFemale ? 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)'
//                        : 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)',
//               borderColor: isCouple ? '#c084fc' : isMale ? '#3b82f6' : isFemale ? '#db2777' : '#9ca3af',
//             }}
//             title={`Bed ${bed.bed_number}: ${bed.tenant_name || 'Occupied'}`}
//           >
//             <span className="text-xs">
//               {isCouple ? '👫' : isMale ? '👨' : isFemale ? '👩' : '👤'}
//             </span>
            
//             {/* Tiny bed number */}
//             <span className="absolute -bottom-1 -right-1 text-[8px] font-bold leading-none">
//               {bed.bed_number || index + 1}
//             </span>
//           </div>
//         );
//       })}
//       {currentOccupants.length > 6 && (
//         <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shadow-sm border border-gray-300">
//           <span className="text-[10px] font-bold text-gray-600">+{currentOccupants.length - 6}</span>
//         </div>
//       )}
//     </div>
//   ) : (
//     <div className="text-center py-2 bg-gray-50 rounded border border-dashed border-gray-300">
//       <div className="flex items-center justify-center gap-1.5">
//         <UserPlus className="h-3.5 w-3.5 text-gray-400" />
//         <span className="text-xs text-gray-500">Empty</span>
//       </div>
//     </div>
//   )}
// </div>
//       </div>

    
// <div className="px-3 pb-3">
//   <div className="flex gap-1.5">
//     <Button
//       variant="outline"
//       size="sm"
//       className="h-7 w-7 p-0 border-gray-300 hover:bg-gray-200 hover:text-black-300"
//       onClick={() => handleViewDetails(room)}
//       title="Details"
//     >
//       <Eye className="h-3.5 w-3.5" />
//     </Button>
    
//     <Button
//       variant="outline"
//       size="sm"
//       className="h-7 flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-900 text-xs"
//       onClick={() => handleBedManagement(room)}
//     >
//       <Bed className="h-3.5 w-3.5 mr-1" />
//       Manage
//     </Button>
    
//     <Button
//       variant="outline"
//       size="sm"
//       className="h-7 w-7 p-0 border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-900"
//       onClick={(e) => {
//         e.stopPropagation();
//         handleEdit(room);
//       }}
//       title="Edit"
//     >
//       <Edit2 className="h-3.5 w-3.5" />
//     </Button>
    
//     <Button
//       variant="outline"
//       size="sm"
//       className="h-7 w-7 p-0 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-900"
//       onClick={() => handleDelete(room.id.toString())}
//       title="Delete"
//     >
//       <Trash2 className="h-3.5 w-3.5" />
//     </Button>
//   </div>
// </div>
//     </Card>
//   );
// };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* <AdminHeader title="Rooms Management" /> */}

//       <div className="container mx-auto p-1 md:p-4">
//         {/* Header from first rooms page */}
//         <div className='sticky top-0 z-10 bg-white pb-4 pt-2 -mx-4 px-4 md:-mx-6 md:px-6 border-b shadow-sm mb-6'>
//           {/* STATS OVERVIEW - SIMPLE */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600 mb-1">Total Rooms</p>
//                     <h3 className="text-2xl font-bold">{rooms.length}</h3>
//                   </div>
//                   <div className="p-3 bg-blue-100 rounded-lg">
//                     <DoorOpen className="h-6 w-6 text-blue-600" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600 mb-1">Total Beds</p>
//                     <h3 className="text-2xl font-bold">
//                       {rooms.reduce((sum, room) => sum + (room.total_bed || 0), 0)}
//                     </h3>
//                   </div>
//                   <div className="p-3 bg-green-100 rounded-lg">
//                     <Bed className="h-6 w-6 text-green-600" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600 mb-1">Available Beds</p>
//                     <h3 className="text-2xl font-bold">
//                       {rooms.reduce((sum, room) => sum + ((room.total_bed || 0) - (room.occupied_beds || 0)), 0)}
//                     </h3>
//                   </div>
//                   <div className="p-3 bg-purple-100 rounded-lg">
//                     <UserPlus className="h-6 w-6 text-purple-600" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600 mb-1">Occupancy Rate</p>
//                     <h3 className="text-2xl font-bold">
//                       {rooms.length > 0 
//                         ? `${Math.round((rooms.reduce((sum, room) => sum + (room.occupied_beds || 0), 0) / 
//                            Math.max(1, rooms.reduce((sum, room) => sum + (room.total_bed || 0), 0))) * 100)}%`
//                         : '0%'}
//                     </h3>
//                   </div>
//                   <div className="p-3 bg-amber-100 rounded-lg">
//                     <Hotel className="h-6 w-6 text-amber-600" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* MAIN CONTENT */}
//           <Card className="border shadow-sm">
//             {/* Header design from first rooms page */}
//             {/* <CardHeader className="bg-blue-500 border-b sticky top-28 sm:top-20 z-50 p-4">
//               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              
//                 <div className="flex items-center gap-3 flex-1">
              
//                   <div className="relative flex-1 sm:w-64 md:w-80">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
//                     <Input
//                       placeholder="Search rooms..."
//                       className="pl-10 h-9"
//                       value={searchQuery}
//                       onChange={(e) => {
//                         setSearchQuery(e.target.value);
//                         setCurrentPage(1);
//                       }}
//                     />
//                   </div>
                  
                 
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <Button 
//                         variant="outline" 
//                         size="icon"
//                         className="h-9 w-9 border-gray-300"
//                       >
//                         <Filter className="h-4 w-4" />
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-80 p-4" align="end">
//                       <div className="space-y-4">
//                         <div className="space-y-2">
//                           <Label htmlFor="filter-room-type">Room Type</Label>
//                           <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
//                             <SelectTrigger className="h-9">
//                               <SelectValue placeholder="All Types" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="all">All Types</SelectItem>
//                               {ROOM_TYPES.map(type => (
//                                 <SelectItem key={type.value} value={type.value}>
//                                   {type.label}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         </div>
                        
//                         <div className="space-y-2">
//                           <Label htmlFor="filter-gender">Gender Preference</Label>
//                           <Select value={selectedGenderPref} onValueChange={setSelectedGenderPref}>
//                             <SelectTrigger className="h-9">
//                               <SelectValue placeholder="All Genders" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="all">All Genders</SelectItem>
//                               {GENDER_FILTERS.map(filter => (
//                                 <SelectItem key={filter.value} value={filter.value}>
//                                   {filter.label}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         </div>
                        
//                         <div className="flex justify-end gap-2 pt-2">
//                           <Button 
//                             variant="outline" 
//                             size="sm"
//                             onClick={() => {
//                               setSelectedRoomType("all");
//                               setSelectedGenderPref("all");
//                             }}
//                           >
//                             Clear Filters
//                           </Button>
//                         </div>
//                       </div>
//                     </PopoverContent>
//                   </Popover>
//                 </div>

//                 <Button 
//                   onClick={() => {
//                     resetForm();
//                     setRoomDialogOpen(true);
//                   }}
//                   className="bg-blue-600 hover:bg-blue-700 h-9 whitespace-nowrap w-full sm:w-auto mt-2 sm:mt-0"
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Add New Room
//                 </Button>
//               </div>
//             </CardHeader> */}
//             <CardHeader className="bg-blue-500 border-b sticky top-28 sm:top-20 z-50 p-4">
//   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

//     {/* LEFT SIDE: Search only */}
//     <div className="flex items-center gap-3 flex-1">
//       <div className="relative w-56">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
//         <Input
//           placeholder="Search rooms..."
//           className="pl-10 h-9"
//           value={searchQuery}
//           onChange={(e) => {
//             setSearchQuery(e.target.value);
//             setCurrentPage(1);
//           }}
//         />
//       </div>
//     </div>

//     {/* RIGHT SIDE: Filter + Add New Room */}
//     <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">

//     {/* FILTER BUTTON */}
// <Popover>
//   <PopoverTrigger asChild>
//     <Button
//       variant="outline"
//       size="icon"
//       className="h-9 w-9 bg-white"
//     >
//       <Filter className="h-4 w-4" />
//     </Button>
//   </PopoverTrigger>

//   {/* RIGHT SIDE OPEN */}
//   <PopoverContent
//     className="w-80 p-4"
//     align="end"
//     side="right"
//   >
//     <div className="space-y-4">

//       {/* Room Type */}
//       <div className="space-y-2">
//         <Label>Room Type</Label>
//         <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
//           <SelectTrigger className="h-9">
//             <SelectValue placeholder="All Types" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Types</SelectItem>
//             {ROOM_TYPES.map(type => (
//               <SelectItem key={type.value} value={type.value}>
//                 {type.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Gender */}
//       <div className="space-y-2">
//         <Label>Gender Preference</Label>
//         <Select value={selectedGenderPref} onValueChange={setSelectedGenderPref}>
//           <SelectTrigger className="h-9">
//             <SelectValue placeholder="All Genders" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Genders</SelectItem>
//             {GENDER_FILTERS.map(filter => (
//               <SelectItem key={filter.value} value={filter.value}>
//                 {filter.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* ACTION BUTTONS */}
//       <div className="flex justify-end gap-2 pt-3">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => {
//             setSelectedRoomType("all");
//             setSelectedGenderPref("all");
//           }}
//         >
//           Clear
//         </Button>

//         <Button
//           size="sm"
//           className="bg-blue-600 hover:bg-blue-700"
//           onClick={() => {
//             setCurrentPage(1); // optional
//           }}
//         >
//           Apply Filter
//         </Button>
//       </div>

//     </div>
//   </PopoverContent>
// </Popover>


//       {/* ADD NEW ROOM BUTTON */}
//       <Button
//         onClick={() => {
//           resetForm();
//           setRoomDialogOpen(true);
//         }}
//         className="bg-blue-600 hover:bg-blue-700 h-9 whitespace-nowrap"
//       >
//         <Plus className="h-4 w-4 mr-2" />
//         Add New Room
//       </Button>

//     </div>
//   </div>
// </CardHeader>

//             <CardContent className="p-6">
//               {loading ? (
//                 <div className="text-center py-12">
//                   <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                   <p className="mt-4 text-gray-500">Loading rooms...</p>
//                 </div>
//               ) : paginatedRooms.length === 0 ? (
//                 <div className="text-center py-12">
//                   <DoorOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
//                   <p className="text-gray-600 max-w-md mx-auto">
//                     {searchQuery || selectedRoomType !== 'all' || selectedGenderPref !== 'all'
//                       ? 'No rooms match your search criteria. Try adjusting your filters.'
//                       : 'Get started by adding your first room.'}
//                   </p>
//                   {!searchQuery && selectedRoomType === 'all' && selectedGenderPref === 'all' && (
//                     <Button 
//                       className="mt-4"
//                       onClick={() => {
//                         resetForm();
//                         setRoomDialogOpen(true);
//                       }}
//                     >
//                       <Plus className="h-4 w-4 mr-2" />
//                       Add First Room
//                     </Button>
//                   )}
//                 </div>
//               ) : (
//                 <>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                     {paginatedRooms.map(renderRoomCard)}
//                   </div>

//                   {/* PAGINATION */}
//                   {totalPages > 1 && (
//                     <div className="flex items-center justify-between border-t pt-6 mt-8">
//                       <div className="text-sm text-gray-600">
//                         Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRooms.length)} of {filteredRooms.length} rooms
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handlePageChange(currentPage - 1)}
//                           disabled={currentPage === 1}
//                         >
//                           <ChevronLeft className="h-4 w-4 mr-1" />
//                           Previous
//                         </Button>
//                         <div className="flex items-center gap-1">
//                           {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                             let pageNum;
//                             if (totalPages <= 5) pageNum = i + 1;
//                             else if (currentPage <= 3) pageNum = i + 1;
//                             else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
//                             else pageNum = currentPage - 2 + i;

//                             return (
//                               <Button
//                                 key={pageNum}
//                                 variant={currentPage === pageNum ? "default" : "outline"}
//                                 size="sm"
//                                 onClick={() => handlePageChange(pageNum)}
//                                 className="w-8 h-8"
//                               >
//                                 {pageNum}
//                               </Button>
//                             );
//                           })}
//                         </div>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handlePageChange(currentPage + 1)}
//                           disabled={currentPage === totalPages}
//                         >
//                           Next
//                           <ChevronRight className="h-4 w-4 ml-1" />
//                         </Button>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* DIALOGS */}
//       <RoomForm
//         open={roomDialogOpen}
//         onOpenChange={setRoomDialogOpen}
//         isEditMode={isEditMode}
//         formData={formData}
//         setFormData={setFormData}
//         onSubmit={handleSubmit}
//         properties={properties}
//         rooms={rooms}
//         editingRoomId={editingRoomId} 
//       />

//       {selectedRoom && (
//         <RoomDetailsDialog
//           room={selectedRoom}
//           open={detailsDialogOpen}
//           onOpenChange={setDetailsDialogOpen}
//         />
//       )}

//       {selectedRoom && (
//         <BedManagementDialog
//           room={selectedRoom}
//           open={bedDialogOpen}
//           onOpenChange={setBedDialogOpen}
//           onRefresh={loadData}
//         />
//       )}

//       <PhotoGalleryModal
//         open={galleryOpen}
//         onOpenChange={setGalleryOpen}
//         photos={galleryItems}
//         roomNumber={selectedGalleryRoom?.room_number}
//         propertyName={selectedGalleryRoom?.property_name}
//       />
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import RoomsClient from '@/components/admin/rooms/rooms-client';
import { listRooms, listActiveProperties } from '@/lib/roomsApi';
import { AdminHeader } from '@/components/admin/admin-header';

// Loading component
function RoomsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <AdminHeader title="Rooms Management" /> */}
      <div className="container mx-auto p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

async function fetchData() {
  try {
    // console.log('📦 Fetching rooms data...');
    
    // Fetch data with error handling
    const roomsPromise = listRooms();
    const propertiesPromise = listActiveProperties();
    
    const [roomsResult, propertiesResult] = await Promise.allSettled([ 
      roomsPromise,
      propertiesPromise
    ]);

    // console.log('📊 Rooms fetch status:', roomsResult.status);
    // console.log('📊 Properties fetch status:', propertiesResult.status);

    // Extract rooms data
    let roomsData = [];
    
    if (roomsResult.status === 'fulfilled') {
      const response = roomsResult.value as any;
      // console.log('🏠 Raw rooms response:', response);
      
      if (Array.isArray(response)) {
        roomsData = response;
      } else if (response && Array.isArray(response.data)) {
        roomsData = response.data;
      } else if (response && response.data && Array.isArray(response.data)) {
        roomsData = response.data;
      }
      console.log(`✅ Found ${roomsData.length} rooms`);
    } else {
      console.error('❌ Rooms fetch failed:', roomsResult.reason);
    }

    // Extract properties data
    let propertiesData = [];
    if (propertiesResult.status === 'fulfilled') {
      const response = propertiesResult.value;
      
      if (Array.isArray(response)) {
        propertiesData = response;
      } else if (response && Array.isArray(response.data)) {
        propertiesData = response.data;
      } else if (response && response.data && Array.isArray(response.data)) {
        propertiesData = response.data;
      }
      // console.log(`✅ Found ${propertiesData.length} properties`);
    } else {
      console.error('❌ Properties fetch failed:', propertiesResult.reason);
    }

    return {
      rooms: roomsData,
      properties: propertiesData
    };

  } catch (error) {
    console.error('🔥 Error in fetchData:', error);
    return {
      rooms: [],
      properties: []
    };
  }
}

export default function RoomsPage() {
  const [data, setData] = useState<{ rooms: any[]; properties: any[] }>({ rooms: [], properties: [] });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <RoomsLoading />;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-1 md:p-4">
        <RoomsClient initialRooms={data.rooms} initialProperties={data.properties} />
      </div>
    </div>
  );
}