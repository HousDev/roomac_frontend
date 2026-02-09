"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  DoorOpen, Plus, Edit, X, Upload, Image as ImageIcon,
  Wifi, Tv, Droplets, Wind, Bath, Bed, Users, Home, MapPin,
  Video, Maximize,
  Building, Layers, Shield, Coffee, Car, Dumbbell,
  TreePine, Waves, Sparkles, Sun, Thermometer, CheckCircle,
  Trash2, AlertCircle, Check, ArrowRight, Maximize2,
  Pencil, Eye, Phone, Mail, Calendar, UserCircle, Heart, UserRound, UsersRound, User, BadgeIndianRupee, Info
} from 'lucide-react';
import { toast } from "sonner";
import { PhotoGalleryModal } from '@/components/admin/rooms/PhotoGalleryModal';
import { getMediaUrl, processPhotoUrls } from '@/lib/roomsApi';

// Types
interface RoomFormData {
  property_id: string;
  room_number: string;
  sharing_type: string;
  capacity: number;
  rent_per_bed: number;
  floor: string;
  has_attached_bathroom: boolean;
  has_balcony: boolean;
  has_ac: boolean;
  amenities: string[];
  photo_labels: { [key: string]: string };
  photos: File[];
  video: File | null;
  video_label: string;
  room_gender_preference: string[];
  allow_couples: boolean;
  is_active: boolean;
  existingPhotos: { url: string; label?: string }[];
  existingVideo?: { url: string; label?: string };
  photosToRemove: string[];
  isManualCapacity: boolean;
  customAmenityInput: string;
  description: string;
}

interface RoomFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  formData: RoomFormData;
  setFormData: any;
  onSubmit: () => Promise<void>;
  properties: any[];
  rooms?: any[];
  editingRoomId?: any;
}

// Room type configuration
const roomTypeConfig: Record<string, { capacity: number, badgeColor: string, color: string }> = {
  'single': { capacity: 1, badgeColor: 'bg-blue-100 text-blue-800 border-blue-300', color: 'blue' },
  'double': { capacity: 2, badgeColor: 'bg-green-100 text-green-800 border-green-300', color: 'green' },
  'triple': { capacity: 3, badgeColor: 'bg-purple-100 text-purple-800 border-purple-300', color: 'purple' },
  'other': { capacity: 1, badgeColor: 'bg-gray-100 text-gray-800 border-gray-300', color: 'gray' }
};

const GENDER_PREFERENCES = [
  { 
    value: 'male_only', 
    label: 'Male Only', 
    icon: <User className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600'
  },
  { 
    value: 'female_only', 
    label: 'Female Only', 
    icon: <UserRound className="h-5 w-5" />,
    color: 'bg-pink-100 text-pink-800',
    iconColor: 'text-pink-600'
  },
  { 
    value: 'couples', 
    label: 'Couples', 
    icon: <UsersRound className="h-5 w-5" />,
    color: 'bg-red-100 text-red-800',
    iconColor: 'text-red-600'
  }
];

const AMENITIES_OPTIONS = [
  { id: 'wifi', label: 'WiFi', icon: <Wifi className="h-4 w-4" /> },
  { id: 'tv', label: 'TV', icon: <Tv className="h-4 w-4" /> },
  { id: 'ac', label: 'Air Conditioner', icon: <Wind className="h-4 w-4" /> },
  { id: 'geyser', label: 'Geyser', icon: <Droplets className="h-4 w-4" /> },
  { id: 'fridge', label: 'Refrigerator', icon: <Tv className="h-4 w-4" /> },
  { id: 'laundry', label: 'Laundry Service', icon: <Droplets className="h-4 w-4" /> },
  { id: 'cleaning', label: 'Cleaning Service', icon: <Home className="h-4 w-4" /> },
  { id: 'security', label: '24/7 Security', icon: <Shield className="h-4 w-4" /> },
  { id: 'parking', label: 'Parking', icon: <Car className="h-4 w-4" /> },
  { id: 'power', label: 'Power Backup', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'gym', label: 'Gym', icon: <Dumbbell className="h-4 w-4" /> },
  { id: 'cafeteria', label: 'Cafeteria', icon: <Coffee className="h-4 w-4" /> },
  { id: 'garden', label: 'Garden', icon: <TreePine className="h-4 w-4" /> },
  { id: 'swimming', label: 'Swimming Pool', icon: <Waves className="h-4 w-4" /> },
  { id: 'study', label: 'Study Table', icon: <Sun className="h-4 w-4" /> },
  { id: 'wardrobe', label: 'Wardrobe', icon: <DoorOpen className="h-4 w-4" /> },
  { id: 'curtains', label: 'Curtains', icon: <Bed className="h-4 w-4" /> },
  { id: 'heater', label: 'Room Heater', icon: <Thermometer className="h-4 w-4" /> },
  { id: 'fan', label: 'Ceiling Fan', icon: <Wind className="h-4 w-4" /> },
  { id: 'lamp', label: 'Study Lamp', icon: <Sun className="h-4 w-4" /> },
];

const labelIcons: Record<string, React.ReactNode> = {
  'Room View': <Home className="h-4 w-4" />,
  'Bed Area': <Bed className="h-4 w-4" />,
  'Bathroom': <Bath className="h-4 w-4" />,
  'Balcony': <Sun className="h-4 w-4" />,
  'Study Corner': <Users className="h-4 w-4" />,
  'Dining Area': <Coffee className="h-4 w-4" />,
  'Living Room': <Heart className="h-4 w-4" />,
  'Kitchen': <Coffee className="h-4 w-4" />,
  'AC': <Wind className="h-4 w-4" />,
  'WiFi': <Wifi className="h-4 w-4" />,
  'TV': <Tv className="h-4 w-4" />,
  'Video': <Video className="h-4 w-4" />,
};

const UploadButton = ({ 
  type, 
  onClick, 
  isDisabled,
  isProcessing
}: { 
  type: 'photo' | 'video', 
  onClick: () => void,
  isDisabled: boolean,
  isProcessing: boolean
}) => {
  return (
    <Button 
      variant="outline" 
      type="button" 
      onClick={onClick}
      disabled={isProcessing || isDisabled}
      className={type === 'video' ? "mt-2" : ""}
    >
      {type === 'photo' ? (
        <>
          <ImageIcon className="h-4 w-4 mr-2" />
          {isProcessing ? "Opening..." : "Browse Photos"}
        </>
      ) : (
        <>
          <Video className="h-4 w-4 mr-2" />
          {isProcessing ? "Opening..." : "Select Video File"}
        </>
      )}
    </Button>
  );
};

export function RoomForm({
  open,
  onOpenChange,
  isEditMode,
  formData,
  setFormData,
  onSubmit,
  properties,
  rooms = [],
  editingRoomId
}: RoomFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const amenityInputRef = useRef<HTMLInputElement>(null);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<Array<{url: string, label?: string, type: 'photo' | 'video'}>>([]);
  
  // States for existing video
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [videoToRemove, setVideoToRemove] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState(false);


  // Add timeout refs for cleanup
  const fileDialogTimeoutRef = useRef<NodeJS.Timeout>();
  const videoDialogTimeoutRef = useRef<NodeJS.Timeout>();



  // Load existing data when editing
  useEffect(() => {
    console.log("=== ROOM-FORM MOUNT/UPDATE ===");
    console.log("isEditMode:", isEditMode);
    console.log("editingRoomId:", editingRoomId);
    console.log("formData.room_number:", formData?.room_number);
    console.log("Available rooms:", rooms.map(r => ({ id: r.id, room_number: r.room_number })));

    if (isEditMode && open && rooms.length > 0) {
      
      // Find the correct room - you might need to pass the room ID differently
      const editingRoom = rooms.find(room => 
        room.id.toString() === editingRoomId.toString()
      );
      
      if (editingRoom) {
        console.log('Editing room data:', editingRoom);
        
        // Process existing photos
        const existingPhotos = processPhotoUrls(editingRoom.photo_urls);
        console.log('Processed photos:', existingPhotos);
        
        // Process existing video
        let existingVideo : any = null;
        if (editingRoom?.video_url && editingRoom.video_url !== 'null') {
          existingVideo = {
            url: getMediaUrl(editingRoom.video_url, 'video'),
            label: 'Room Video Walkthrough' // Default label for videos
          };
          console.log('Existing video loaded:', existingVideo);
        }
        
        // Get gender preferences correctly
        const genderPreferences = editingRoom.room_gender_preference 
          ? Array.isArray(editingRoom.room_gender_preference) 
            ? editingRoom.room_gender_preference.map((g:any) => g.trim())
            : typeof editingRoom.room_gender_preference === 'string'
              ? editingRoom.room_gender_preference.split(',').map((g:any) => g.trim()).filter(Boolean)
              : []
          : [];

        const capacity = editingRoom.total_bed || 2;
        const sharingType = editingRoom.sharing_type || '';
        
        const standardCapacities = [1, 2, 3];
        const isStandardCapacity = standardCapacities.includes(capacity);
        let actualSharingType = sharingType;
        
        if (sharingType === 'other' || !isStandardCapacity) {
          actualSharingType = 'other';
        }
        
        const defaultForSharingType = roomTypeConfig[actualSharingType]?.capacity || 2;
        const isAutoCapacity = defaultForSharingType === capacity && actualSharingType !== 'other';

        setExistingVideoUrl(existingVideo?.url || null);
        setVideoToRemove(false);

        // Boolean fields
      const isActive = Boolean(editingRoom.is_active);
      const allowCouples = Boolean(editingRoom.allow_couples);
      const hasAttachedBathroom = Boolean(editingRoom.has_attached_bathroom);
      const hasBalcony = Boolean(editingRoom.has_balcony);
      const hasAC = Boolean(editingRoom.has_ac);
        
        // Update form data
        setFormData((prev :any) => ({
          ...prev,
          property_id: editingRoom.property_id.toString(),
          room_number: editingRoom.room_number.toString(),
          sharing_type: actualSharingType,
          capacity: capacity,
          rent_per_bed: editingRoom.rent_per_bed || 0,
          floor: editingRoom.floor ? editingRoom.floor.toString() : '',
          has_attached_bathroom: hasAttachedBathroom,
        has_balcony: hasBalcony,
        has_ac: hasAC,
          amenities: editingRoom.amenities || [],
          video_label: '', // Clear video label field
          video: null, // Reset new video upload when editing
          room_gender_preference: genderPreferences,
          allow_couples: allowCouples,
          is_active: isActive,
          existingPhotos: existingPhotos,
          existingVideo: existingVideo, // Store video with its data
          photosToRemove: [],
          isManualCapacity: !isAutoCapacity || actualSharingType === 'other',
          description: editingRoom.description || '',
        }));
      }
    }
    
    // Reset video states when dialog closes
    if (!open) {
      setExistingVideoUrl(null);
      setVideoToRemove(false);
      setIsFileDialogOpen(false);
      setIsVideoDialogOpen(false);
    }
  }, [isEditMode, open, rooms, setFormData]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (fileDialogTimeoutRef.current) {
        clearTimeout(fileDialogTimeoutRef.current);
      }
      if (videoDialogTimeoutRef.current) {
        clearTimeout(videoDialogTimeoutRef.current);
      }
    };
  }, []);

  // Reset dialog states when main dialog closes
  useEffect(() => {
    if (!open) {
      setIsFileDialogOpen(false);
      setIsVideoDialogOpen(false);
    }
  }, [open]);


  // Add this useEffect to reset loading state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsCreating(false);
    }
  }, [open]);

  const handleSharingTypeChange = (value: string) => {
    const defaultCapacity = roomTypeConfig[value]?.capacity || 2;
    
    if (!formData.isManualCapacity || formData.capacity === defaultCapacity) {
      setFormData({
        ...formData,
        sharing_type: value,
        capacity: defaultCapacity
      });
    } else {
      setFormData({
        ...formData,
        sharing_type: value
      });
    }
  };

  const handleCapacityChange = (value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    const validValue = isNaN(numValue) ? 0 : numValue;
    
    const currentSharingType = formData.sharing_type;
    const defaultForCurrentType = roomTypeConfig[currentSharingType]?.capacity;
    
    setFormData({
      ...formData,
      capacity: validValue,
      isManualCapacity: !(currentSharingType && validValue === defaultForCurrentType && currentSharingType !== 'other')
    });
  };

  const handleFileClick = () => {
    if (isFileDialogOpen) return;
    
    setIsFileDialogOpen(true);
    
    // Clear any existing timeout
    if (fileDialogTimeoutRef.current) {
      clearTimeout(fileDialogTimeoutRef.current);
    }
    
    // Set a timeout to reset the state if dialog doesn't open
    fileDialogTimeoutRef.current = setTimeout(() => {
      setIsFileDialogOpen(false);
    }, 3000); // Reset after 3 seconds if nothing happens
    
    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear the timeout
    if (fileDialogTimeoutRef.current) {
      clearTimeout(fileDialogTimeoutRef.current);
    }
    
    setIsFileDialogOpen(false);
    
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length > 0) {
        setFormData({
          ...formData,
          photos: [...formData.photos, ...imageFiles]
        });
        toast.success(`Added ${imageFiles.length} photo(s)`);
      } else {
        toast.error("Please select only image files");
      }
    }
    
    // Ensure the input is cleared
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVideoClick = () => {
    if (isVideoDialogOpen) return;
    
    setIsVideoDialogOpen(true);
    
    // Clear any existing timeout
    if (videoDialogTimeoutRef.current) {
      clearTimeout(videoDialogTimeoutRef.current);
    }
    
    // Set a timeout to reset the state if dialog doesn't open
    videoDialogTimeoutRef.current = setTimeout(() => {
      setIsVideoDialogOpen(false);
    }, 3000); // Reset after 3 seconds if nothing happens
    
    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
        videoInputRef.current.click();
      }
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear the timeout
    if (videoDialogTimeoutRef.current) {
      clearTimeout(videoDialogTimeoutRef.current);
    }
    
    setIsVideoDialogOpen(false);
    
    if (e.target.files && e.target.files[0]) {
      const videoFile = e.target.files[0];
      
      if (videoFile.type.startsWith('video/')) {
        setFormData({
          ...formData,
          video: videoFile
        });
        // Clear existing video preview when uploading new one
        setExistingVideoUrl(null);
        toast.success("New video added successfully");
      } else {
        toast.error("Please select a video file");
      }
    }
    
    // Ensure the input is cleared
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  // Add click event listeners to detect dialog cancel
  useEffect(() => {
    const handleWindowClick = () => {
      // If dialog states are true but no file was selected, reset them
      if (isFileDialogOpen) {
        setTimeout(() => {
          setIsFileDialogOpen(false);
        }, 100);
      }
      if (isVideoDialogOpen) {
        setTimeout(() => {
          setIsVideoDialogOpen(false);
        }, 100);
      }
    };

    window.addEventListener('click', handleWindowClick);
    
    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, [isFileDialogOpen, isVideoDialogOpen]);

  // Add input event listeners to detect cancel
  useEffect(() => {
    const fileInput = fileInputRef.current;
    const videoInput = videoInputRef.current;

    const handleFileCancel = () => {
      setIsFileDialogOpen(false);
    };

    const handleVideoCancel = () => {
      setIsVideoDialogOpen(false);
    };

    if (fileInput) {
      fileInput.addEventListener('cancel', handleFileCancel);
    }
    if (videoInput) {
      videoInput.addEventListener('cancel', handleVideoCancel);
    }

    return () => {
      if (fileInput) {
        fileInput.removeEventListener('cancel', handleFileCancel);
      }
      if (videoInput) {
        videoInput.removeEventListener('cancel', handleVideoCancel);
      }
    };
  }, []);

  const removeNewFile = (index: number) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index),
      photo_labels: Object.fromEntries(
        Object.entries(formData.photo_labels).filter(([key]) => key !== index.toString())
      )
    });
  };

  const removeExistingPhoto = (photoUrl: string) => {
    setFormData({
      ...formData,
      existingPhotos: formData.existingPhotos.filter(p => p.url !== photoUrl),
      photosToRemove: [...formData.photosToRemove, photoUrl]
    });
    toast.success("Photo marked for removal");
  };

  const removeVideo = () => {
    setFormData({
      ...formData,
      video: null,
      video_label: ''
    });
    toast.success("New video removed");
  };

  const removeExistingVideo = () => {
    setVideoToRemove(true);
    setExistingVideoUrl(null);
    setFormData((prev : any) => ({
      ...prev,
      existingVideo: undefined
    }));
    toast.success("Existing video marked for removal");
  };

  const restoreExistingVideo = () => {
    setVideoToRemove(false);
    if (formData.existingVideo?.url) {
      setExistingVideoUrl(formData.existingVideo.url);
    }
    toast.success("Existing video restored");
  };

  const toggleGenderPreference = (value: string) => {
    setFormData({
      ...formData,
      room_gender_preference: formData.room_gender_preference.includes(value)
        ? formData.room_gender_preference.filter(v => v !== value)
        : [...formData.room_gender_preference, value]
    });
  };

  const toggleAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter(a => a !== amenity)
        : [...formData.amenities, amenity]
    });
  };

  const addCustomAmenity = () => {
    const amenity = formData.customAmenityInput.trim();
    
    if (!amenity) {
      toast.error("Please enter an amenity");
      return;
    }
    
    if (formData.amenities.includes(amenity)) {
      toast.error("This amenity already exists");
      return;
    }
    
    setFormData({
      ...formData,
      amenities: [...formData.amenities, amenity],
      customAmenityInput: ''
    });
    
    if (amenityInputRef.current) {
      amenityInputRef.current.focus();
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity)
    });
  };

  const handleAmenityKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomAmenity();
    }
  };

  const openExistingGallery = () => {
    const items: Array<{url: string, label?: string, type: 'photo' | 'video'}> = [];
    
    // Add existing photos
    formData.existingPhotos.forEach(photo => {
      if (photo.url && !formData.photosToRemove.includes(photo.url)) {
        items.push({
          url: photo.url,
          label: photo.label || 'Room Photo',
          type: 'photo'
        });
      }
    });
    
    // Add existing video if exists and not marked for removal
    if (existingVideoUrl && !videoToRemove && formData.existingVideo) {
      items.push({
        url: existingVideoUrl,
        label: formData.existingVideo.label || 'Room Video',
        type: 'video'
      });
    }
    
    // Add new photos
    formData.photos.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const label = formData.photo_labels[index] || 'New Photo';
      items.push({ url, label, type: 'photo' });
    });
    
    // Add new video if exists
    if (formData.video) {
      const url = URL.createObjectURL(formData.video);
      items.push({
        url,
        label: formData.video_label || 'New Video',
        type: 'video'
      });
    }
    
    setGalleryItems(items);
    setGalleryOpen(true);
  };

  // Prepare form data for submission
  const prepareFormData = () => {
    console.log('Form data being submitted:', {
      hasVideo: !!formData.video,
      videoLabel: formData.video_label,
      videoToRemove,
      existingVideo: formData.existingVideo
    });
    
    return {
      ...formData,
      videoToRemove: videoToRemove,
      // Include video label if new video is uploaded
      ...(formData.video && { video_label: formData.video_label })
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {isEditMode ? (
              <>
                <Edit className="h-6 w-6" />
                Edit Room
              </>
            ) : (
              <>
                <Plus className="h-6 w-6" />
                Add New Room
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update room details, photos, and preferences' : 'Fill in room details and upload photos/video'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4" />
              Room Details
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Photos & Labels
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Room Video
            </TabsTrigger>
            <TabsTrigger value="amenities" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Amenities
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>
          
          {/* Room Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 mb-1">
                  <Home className="h-4 w-4" />
                  Property *
                </Label>
                <Select
                  value={formData.property_id}
                  onValueChange={(v) => setFormData({ ...formData, property_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <div>
                            <div>{p.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{p.address}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 mb-1">
                  <DoorOpen className="h-4 w-4" />
                  Room Number *
                </Label>
                <Input
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  placeholder="e.g., 101, 202, G-01"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4" />
                  Room Type *
                </Label>
                <Select
                  value={formData.sharing_type}
                  onValueChange={handleSharingTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-blue-600" />
                        <div>
                          <div>Single Occupancy</div>
                          <div className="text-xs text-gray-500">1 bed per room</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="double">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <div>
                          <div>Double Occupancy</div>
                          <div className="text-xs text-gray-500">2 beds per room</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="triple">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <div>
                          <div>Triple Occupancy</div>
                          <div className="text-xs text-gray-500">3 beds per room</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        <div>
                          <div>Other (Custom)</div>
                          <div className="text-xs text-gray-500">Custom bed count</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 mb-1">
                  <Bed className="h-4 w-4" />
                  Number of Beds *
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formData.capacity}
                    onChange={(e) => handleCapacityChange(e.target.value)}
                    className="pr-10"
                    placeholder="Enter number of beds"
                  />
                  {!formData.isManualCapacity && formData.sharing_type && formData.sharing_type !== 'other' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                        Auto
                      </Badge>
                    </div>
                  )}
                </div>
                {!formData.isManualCapacity && formData.sharing_type && formData.sharing_type !== 'other' && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Auto-set to {roomTypeConfig[formData.sharing_type]?.capacity} beds for {formData.sharing_type} occupancy
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 mb-1">
                  <BadgeIndianRupee className="h-4 w-4" />
                  Rent Per Bed (₹) *
                </Label>
                <Input
                  type="text"
                  value={formData.rent_per_bed}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? 0 : parseFloat(value);
                    setFormData({
                      ...formData,
                      rent_per_bed: isNaN(numValue) ? 0 : numValue
                    });
                  }}
                  placeholder="Enter rent amount"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 mb-1">
                  <Layers className="h-4 w-4" />
                  Floor
                </Label>
                <Input
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="e.g., 1, 2, G"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="description" className="flex items-center gap-2 mb-1">
                <Edit className="h-4 w-4" />
                Room Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the room, its features, view, etc."
                rows={3}
                className="resize-none"
              />
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 mb-3">
      <ImageIcon className="h-4 w-4" />
      Room Photos with Labels
    </Label>
              
                  <input
      type="file"
      ref={fileInputRef}
      multiple
      accept="image/*"
      onChange={handleFileChange}
      className="hidden"
    />

              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-cyan-400 hover:bg-cyan-50 transition-colors cursor-pointer mb-6"
                // onClick={handleFileClick}
              >
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-lg font-medium text-gray-700 mb-2">Upload Room Photos</p>
                <p className="text-sm text-gray-600 mb-4">
                  Click to browse or drag & drop photos here
                </p>
                <UploadButton 
                  type="photo"
                  onClick={handleFileClick}
                  isDisabled={isFileDialogOpen}
                  isProcessing={isFileDialogOpen}
                />
                <p className="text-xs text-gray-500 mt-3">
                  Maximum 10 photos, 5MB each. Add labels to identify each image.
                </p>
              </div>

              {isEditMode && formData.existingPhotos.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Existing Photos ({formData.existingPhotos.length})
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openExistingGallery}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Gallery
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.existingPhotos.map((photo, index) => {
                      const isMarkedForRemoval = formData.photosToRemove.includes(photo.url);
                      return (
                        <div key={index} className="relative group">
                          <div 
                            className="aspect-square rounded-lg overflow-hidden border border-gray-300 bg-gray-100 cursor-pointer hover:ring-2 hover:ring-cyan-500 hover:border-cyan-500 transition-all"
                            onClick={openExistingGallery}
                          >
                            <img
                              src={photo.url}
                              alt={`${photo.label || 'Room photo'} ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2Ij5Sb29tIFBob3RvPC90ZXh0Pjwvc3ZnPg==';
                                console.log('Image failed to load, using fallback:', photo.url);
                              }}
                            />
                          </div>
                          <Button
                            size="sm"
                            variant={isMarkedForRemoval ? "outline" : "destructive"}
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full z-10"
                            onClick={() => isMarkedForRemoval ? 
                              setFormData({
                                ...formData,
                                photosToRemove: formData.photosToRemove.filter(url => url !== photo.url)
                              }) : 
                              removeExistingPhoto(photo.url)
                            }
                          >
                            {isMarkedForRemoval ? (
                              <Plus className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </Button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-xs text-white truncate">
                              {labelIcons[photo.label || 'Room View'] || <ImageIcon className="h-3 w-3 inline mr-1" />}
                              {photo.label || 'Room View'}
                            </p>
                          </div>
                          {isMarkedForRemoval && (
                            <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center rounded-lg">
                              <Badge variant="destructive" className="text-xs">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Marked for Removal
                              </Badge>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {formData.photos.length > 0 && (
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Upload className="h-4 w-4" />
                    New Photos ({formData.photos.length})
                  </Label>
                  <div className="space-y-4">
                    {formData.photos.map((file, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-gray-50">
                        <div className="md:w-40 md:h-40 w-full h-48 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <Label htmlFor={`photo-label-${index}`} className="flex items-center gap-2 mb-1">
                              <Edit className="h-4 w-4" />
                              Image Label
                            </Label>
                            <Input
                              id={`photo-label-${index}`}
                              value={formData.photo_labels[index] || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                photo_labels: {
                                  ...formData.photo_labels,
                                  [index]: e.target.value
                                }
                              })}
                              placeholder="e.g., Room View, Bathroom, Balcony, Bed Area, Study Corner, etc."
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Label helps tenants understand what this image shows
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              <p className="font-medium">{file.name}</p>
                              <p className="text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNewFile(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Video Tab */}
          <TabsContent value="video" className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Video className="h-4 w-4" />
                Room Video Walkthrough
              </Label>
              
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
              
              {/* 1. Existing Video Display */}
              {isEditMode && existingVideoUrl && !videoToRemove && (
                <div className="mb-6">
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3 relative group">
                    <video
                      // key={existingVideoUrl}
                      src={existingVideoUrl}
                      controls
                      className="w-full h-full"
                      onError={(e:any) => {
                        console.error('Video failed to load:', existingVideoUrl);
                        // Try alternative path
                        const correctedUrl = existingVideoUrl.replace('uploads/videos/', 'uploads/rooms/videos/');
                        e.target.src = correctedUrl;
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Video label overlay (like photos) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        {formData.existingVideo?.label || 'Room Video Walkthrough'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Current Video</p>
                      <p className="text-sm text-gray-600">
                        {formData.existingVideo?.label || 'Room Video Walkthrough'}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={removeExistingVideo}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove Video
                    </Button>
                  </div>
                </div>
              )}
              
              
              
              {/* 3. New Video Upload Area */}
              {formData.video ? (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        src={URL.createObjectURL(formData.video)}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                    <div className="absolute top-3 right-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={removeVideo}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  {/* Video label input (just like photos) */}
                  <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
                    <div>
                      <Label htmlFor="video-label-input" className="flex items-center gap-2 mb-1">
                        <Edit className="h-4 w-4" />
                        Video Label (Optional)
                      </Label>
                      <Input
                        id="video-label-input"
                        value={formData.video_label}
                        onChange={(e) => setFormData({ ...formData, video_label: e.target.value })}
                        placeholder="e.g., Room Walkthrough, Complete Tour, etc."
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Label helps identify what this video shows
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="font-medium">
                          <Video className="h-4 w-4 inline mr-2" />
                          New Video: {formData.video.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(formData.video.size / (1024 * 1024)).toFixed(2)} MB • {formData.video.type}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Show upload area when:
                // 1. Creating new room, OR
                // 2. Editing but no existing video, OR  
                // 3. Existing video is marked for removal
                (!isEditMode || !existingVideoUrl || videoToRemove) && (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-cyan-400 hover:bg-cyan-50 transition-colors cursor-pointer"
                    // onClick={handleVideoClick}
                  >
                    <Video className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {isEditMode && videoToRemove ? 'Upload Replacement Video' : 'Upload Room Video'}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Show a walkthrough of the room (recommended: 1-2 minutes)
                    </p>
                    <UploadButton 
                      type="video"
                      onClick={handleVideoClick}
                      isDisabled={isVideoDialogOpen}
                      isProcessing={isVideoDialogOpen}
                    />
                  </div>
                )
              )}
            </div>
          </TabsContent>

          {/* Amenities Tab */}
          <TabsContent value="amenities" className="space-y-4">
            <div className="space-y-6">
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4" />
                  Select Amenities
                </Label>
                <p className="text-sm text-gray-500 mb-4">Choose amenities available in this room</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <div
                      key={amenity.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.amenities.includes(amenity.label)
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleAmenity(amenity.label)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded ${
                          formData.amenities.includes(amenity.label)
                            ? 'bg-cyan-100 text-cyan-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {amenity.icon}
                        </div>
                        <span className="text-sm font-medium">{amenity.label}</span>
                      </div>
                      {formData.amenities.includes(amenity.label) && (
                        <div className="mt-2 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">Selected</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Custom Amenities
                </Label>
                <p className="text-sm text-gray-500">Add amenities not listed above</p>
                
                <div className="flex gap-2">
                  <Input
                    ref={amenityInputRef}
                    value={formData.customAmenityInput}
                    onChange={(e) => setFormData({ ...formData, customAmenityInput: e.target.value })}
                    onKeyPress={handleAmenityKeyPress}
                    placeholder="Enter amenity name (e.g., Study Table, Smart Lock, etc.)"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={addCustomAmenity}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                
                {formData.amenities.length > 0 && (
                  <div className="mt-4">
                    <Label className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Selected Amenities ({formData.amenities.length})
                    </Label>
                    <div className="flex flex-wrap gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      {formData.amenities.map((amenity, index) => {
                        const isPredefined = AMENITIES_OPTIONS.some(opt => opt.label === amenity);
                        const isCustom = !isPredefined;
                        
                        return (
                          <Badge 
                            key={index} 
                            variant="outline"
                            className={`flex items-center gap-1 py-1.5 px-3 ${
                              isCustom 
                                ? 'bg-purple-50 border-purple-200 text-purple-700' 
                                : 'bg-white border-gray-300 text-gray-700'
                            }`}
                          >
                            {isCustom ? (
                              <>
                                <Plus className="h-3 w-3" />
                                <span className="text-sm font-medium">Custom: </span>
                              </>
                            ) : (
                              AMENITIES_OPTIONS.find(opt => opt.label === amenity)?.icon
                            )}
                            <span className="text-sm">{amenity}</span>
                            <button
                              type="button"
                              onClick={() => removeAmenity(amenity)}
                              className="ml-1 text-gray-400 hover:text-red-500 focus:outline-none"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formData.amenities.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-lg font-medium text-gray-700 mb-2">No amenities selected yet</p>
                    <p className="text-sm text-gray-500">
                      Select amenities from above or add custom ones to enhance your room listing
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <Label className="flex items-center gap-2 mb-3">
                  <Home className="h-4 w-4" />
                  Basic Room Features
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${
                    formData.has_ac ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
                  }`}
                  onClick={() => setFormData({ ...formData, has_ac: !formData.has_ac })}>
                    <div className={`p-2 rounded-lg ${
                      formData.has_ac ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Wind className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="has_ac" className="cursor-pointer font-medium">
                        Air Conditioner
                      </Label>
                      <p className="text-xs text-gray-500">Room has AC</p>
                    </div>
                    <input
                      type="checkbox"
                      id="has_ac"
                      checked={formData.has_ac}
                      onChange={(e) => setFormData({ ...formData, has_ac: e.target.checked })}
                      className="h-5 w-5"
                    />
                  </div>

                  <div className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${
                    formData.has_balcony ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
                  }`}
                  onClick={() => setFormData({ ...formData, has_balcony: !formData.has_balcony })}>
                    <div className={`p-2 rounded-lg ${
                      formData.has_balcony ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Maximize className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="has_balcony" className="cursor-pointer font-medium">
                        Balcony
                      </Label>
                      <p className="text-xs text-gray-500">Room has balcony</p>
                    </div>
                    <input
                      type="checkbox"
                      id="has_balcony"
                      checked={formData.has_balcony}
                      onChange={(e) => setFormData({ ...formData, has_balcony: e.target.checked })}
                      className="h-5 w-5"
                    />
                  </div>

                  <div className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${
                    formData.has_attached_bathroom ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
                  }`}
                  onClick={() => setFormData({ ...formData, has_attached_bathroom: !formData.has_attached_bathroom })}>
                    <div className={`p-2 rounded-lg ${
                      formData.has_attached_bathroom ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Bath className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="has_bathroom" className="cursor-pointer font-medium">
                        Attached Bathroom
                      </Label>
                      <p className="text-xs text-gray-500">Private bathroom</p>
                    </div>
                    <input
                      type="checkbox"
                      id="has_bathroom"
                      checked={formData.has_attached_bathroom}
                      onChange={(e) => setFormData({ ...formData, has_attached_bathroom: e.target.checked })}
                      className="h-5 w-5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <div>
              <Label className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4" />
                Room Gender Preference (Select Multiple)
              </Label>
              <p className="text-sm text-gray-600 mb-6">
                Select who can book beds in this room. You can select multiple preferences.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {GENDER_PREFERENCES.map((pref) => (
                  <div
                    key={pref.value}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.room_gender_preference.includes(pref.value)
                        ? `${pref.color} border-${pref.color.split('bg-')[1].split('-')[0]}-300`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleGenderPreference(pref.value)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`p-3 rounded-full mb-3 ${formData.room_gender_preference.includes(pref.value) ? pref.color : 'bg-gray-100'}`}>
                        <div className={formData.room_gender_preference.includes(pref.value) ? pref.iconColor : 'text-gray-600'}>
                          {pref.icon}
                        </div>
                      </div>
                      <p className="font-semibold">{pref.label}</p>
                      <div className="mt-2">
                        {formData.room_gender_preference.includes(pref.value) ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            <Check className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {formData.room_gender_preference.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Preferences:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.room_gender_preference.map(pref => {
                      const prefConfig = GENDER_PREFERENCES.find(p => p.value === pref);
                      return (
                        <Badge key={pref} className={prefConfig?.color}>
                          {prefConfig?.icon}
                          <span className="ml-1">{prefConfig?.label}</span>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              formData.is_active ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {formData.is_active ? 'Room is Active' : 'Room is Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="is_active" className="text-sm cursor-pointer">
              Active Status
            </Label>
            <div className="relative">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="sr-only"
              />
              <div
                className={`block w-12 h-6 rounded-full cursor-pointer ${
                  formData.is_active ? 'bg-green-500' : 'bg-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              >
                <div
                  className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    formData.is_active ? 'transform translate-x-6' : ''
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* <DialogFooter className="gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} >
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              const preparedData = prepareFormData();
              console.log('Submitting form data:', preparedData);
              await onSubmit();
            }}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            {isEditMode ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Update Room
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </>
            )}
          </Button>
        </DialogFooter> */}

        
        <DialogFooter className="gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isCreating} // Disable cancel button when creating
          >
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              try {
                setIsCreating(true); // Set to true when starting creation
                
                const preparedData = prepareFormData();
                console.log('Submitting form data:', preparedData);
                
                await onSubmit();
                
                // If onSubmit succeeds without throwing an error
                toast.success(isEditMode ? "Room updated successfully!" : "Room created successfully!");
                // The state will be reset when dialog closes (via useEffect above)
                
              } catch (error) {
                // Handle any errors
                console.error('Error submitting form:', error);
                toast.error(error instanceof Error ? error.message : "Failed to create room. Please try again.");
                
                // Reset loading state on error
                setIsCreating(false);
              }
              // Note: If onSubmit doesn't throw errors on failure, you might need to
              // check its return value and handle accordingly
            }}
            disabled={isCreating} // Disable button when creating
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            {isCreating ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : isEditMode ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Update Room
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
      
      <PhotoGalleryModal
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        photos={galleryItems}
        roomNumber={formData.room_number}
      />
    </Dialog>
  );
}


// "use client";

// import { useState, useRef, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Separator } from '@/components/ui/separator';
// import {
//   DoorOpen, Plus, Edit, X, Upload, Image as ImageIcon,
//   Wifi, Tv, Droplets, Wind, Bath, Bed, Users, Home, MapPin,
//   Video, Maximize,
//   Building, Layers, Shield, Coffee, Car, Dumbbell,
//   TreePine, Waves, Sparkles, Sun, Thermometer, CheckCircle,
//   Trash2, AlertCircle, Check, ArrowRight, Maximize2,
//   Pencil, Eye, Phone, Mail, Calendar, UserCircle, Heart, UserRound, UsersRound, User, BadgeIndianRupee, Info
// } from 'lucide-react';
// import { toast } from "sonner";
// import { PhotoGalleryModal } from '@/components/admin/PhotoGalleryModal';
// import { getMediaUrl, processPhotoUrls } from '@/lib/roomsApi';

// // Types
// interface RoomFormData {
//   property_id: string;
//   room_number: string;
//   sharing_type: string;
//   capacity: number;
//   rent_per_bed: number;
//   floor: string;
//   has_attached_bathroom: boolean;
//   has_balcony: boolean;
//   has_ac: boolean;
//   amenities: string[];
//   photo_labels: { [key: string]: string };
//   photos: File[];
//   video: File | null;
//   video_label: string;
//   room_gender_preference: string[];
//   allow_couples: boolean;
//   is_active: boolean;
//   existingPhotos: { url: string; label?: string }[];
//   existingVideo?: { url: string; label?: string };
//   photosToRemove: string[];
//   isManualCapacity: boolean;
//   customAmenityInput: string;
//   description: string;
// }

// interface RoomFormProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   isEditMode: boolean;
//   formData: RoomFormData;
//   setFormData: (data: RoomFormData) => void;
//   onSubmit: () => Promise<void>;
//   properties: any[];
//   rooms?: any[];
//   editingRoomId?: string;
// }

// // Room type configuration
// const roomTypeConfig: Record<string, { capacity: number, badgeColor: string, color: string }> = {
//   'single': { capacity: 1, badgeColor: 'bg-blue-100 text-blue-800 border-blue-300', color: 'blue' },
//   'double': { capacity: 2, badgeColor: 'bg-green-100 text-green-800 border-green-300', color: 'green' },
//   'triple': { capacity: 3, badgeColor: 'bg-purple-100 text-purple-800 border-purple-300', color: 'purple' },
//   'other': { capacity: 1, badgeColor: 'bg-gray-100 text-gray-800 border-gray-300', color: 'gray' }
// };

// const GENDER_PREFERENCES = [
//   { 
//     value: 'male_only', 
//     label: 'Male Only', 
//     icon: <User className="h-5 w-5" />,
//     color: 'bg-blue-100 text-blue-800',
//     iconColor: 'text-blue-600'
//   },
//   { 
//     value: 'female_only', 
//     label: 'Female Only', 
//     icon: <UserRound className="h-5 w-5" />,
//     color: 'bg-pink-100 text-pink-800',
//     iconColor: 'text-pink-600'
//   },
//   { 
//     value: 'couples', 
//     label: 'Couples', 
//     icon: <UsersRound className="h-5 w-5" />,
//     color: 'bg-red-100 text-red-800',
//     iconColor: 'text-red-600'
//   }
// ];

// const AMENITIES_OPTIONS = [
//   { id: 'wifi', label: 'WiFi', icon: <Wifi className="h-4 w-4" /> },
//   { id: 'tv', label: 'TV', icon: <Tv className="h-4 w-4" /> },
//   { id: 'ac', label: 'Air Conditioner', icon: <Wind className="h-4 w-4" /> },
//   { id: 'geyser', label: 'Geyser', icon: <Droplets className="h-4 w-4" /> },
//   { id: 'fridge', label: 'Refrigerator', icon: <Tv className="h-4 w-4" /> },
//   { id: 'laundry', label: 'Laundry Service', icon: <Droplets className="h-4 w-4" /> },
//   { id: 'cleaning', label: 'Cleaning Service', icon: <Home className="h-4 w-4" /> },
//   { id: 'security', label: '24/7 Security', icon: <Shield className="h-4 w-4" /> },
//   { id: 'parking', label: 'Parking', icon: <Car className="h-4 w-4" /> },
//   { id: 'power', label: 'Power Backup', icon: <Sparkles className="h-4 w-4" /> },
//   { id: 'gym', label: 'Gym', icon: <Dumbbell className="h-4 w-4" /> },
//   { id: 'cafeteria', label: 'Cafeteria', icon: <Coffee className="h-4 w-4" /> },
//   { id: 'garden', label: 'Garden', icon: <TreePine className="h-4 w-4" /> },
//   { id: 'swimming', label: 'Swimming Pool', icon: <Waves className="h-4 w-4" /> },
//   { id: 'study', label: 'Study Table', icon: <Sun className="h-4 w-4" /> },
//   { id: 'wardrobe', label: 'Wardrobe', icon: <DoorOpen className="h-4 w-4" /> },
//   { id: 'curtains', label: 'Curtains', icon: <Bed className="h-4 w-4" /> },
//   { id: 'heater', label: 'Room Heater', icon: <Thermometer className="h-4 w-4" /> },
//   { id: 'fan', label: 'Ceiling Fan', icon: <Wind className="h-4 w-4" /> },
//   { id: 'lamp', label: 'Study Lamp', icon: <Sun className="h-4 w-4" /> },
// ];

// const labelIcons: Record<string, React.ReactNode> = {
//   'Room View': <Home className="h-4 w-4" />,
//   'Bed Area': <Bed className="h-4 w-4" />,
//   'Bathroom': <Bath className="h-4 w-4" />,
//   'Balcony': <Sun className="h-4 w-4" />,
//   'Study Corner': <Users className="h-4 w-4" />,
//   'Dining Area': <Coffee className="h-4 w-4" />,
//   'Living Room': <Heart className="h-4 w-4" />,
//   'Kitchen': <Coffee className="h-4 w-4" />,
//   'AC': <Wind className="h-4 w-4" />,
//   'WiFi': <Wifi className="h-4 w-4" />,
//   'TV': <Tv className="h-4 w-4" />,
//   'Video': <Video className="h-4 w-4" />,
// };

// const UploadButton = ({ 
//   type, 
//   onClick, 
//   isDisabled 
// }: { 
//   type: 'photo' | 'video', 
//   onClick: () => void,
//   isDisabled: boolean 
// }) => {
//   const [isProcessing, setIsProcessing] = useState(false);
  
//   const handleClick = () => {
//     if (isProcessing || isDisabled) return;
    
//     setIsProcessing(true);
//     onClick();
    
//     setTimeout(() => {
//       setIsProcessing(false);
//     }, 1000);
//   };
  
//   return (
//     <Button 
//       variant="outline" 
//       type="button" 
//       onClick={handleClick}
//       disabled={isProcessing || isDisabled}
//       className={type === 'video' ? "mt-2" : ""}
//     >
//       {type === 'photo' ? (
//         <>
//           <ImageIcon className="h-4 w-4 mr-2" />
//           Browse Photos
//         </>
//       ) : (
//         <>
//           <Video className="h-4 w-4 mr-2" />
//           Select Video File
//         </>
//       )}
//     </Button>
//   );
// };

// export function RoomForm({
//   open,
//   onOpenChange,
//   isEditMode,
//   formData,
//   setFormData,
//   onSubmit,
//   properties,
//   rooms = [],
//   editingRoomId
// }: RoomFormProps) {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const videoInputRef = useRef<HTMLInputElement>(null);
//   const amenityInputRef = useRef<HTMLInputElement>(null);
//   const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
//   const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
//   const [galleryOpen, setGalleryOpen] = useState(false);
//   const [galleryItems, setGalleryItems] = useState<Array<{url: string, label?: string, type: 'photo' | 'video'}>>([]);
  
//   // States for existing video
//   const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
//   const [videoToRemove, setVideoToRemove] = useState<boolean>(false);

//   // Load existing data when editing
//   useEffect(() => {
//     console.log("=== ROOM-FORM MOUNT/UPDATE ===");
//     console.log("isEditMode:", isEditMode);
//     console.log("editingRoomId:", editingRoomId);
//     console.log("formData.room_number:", formData?.room_number);
//     console.log("Available rooms:", rooms.map(r => ({ id: r.id, room_number: r.room_number })));

//     if (isEditMode && open && rooms.length > 0) {
      
//       // Find the correct room - you might need to pass the room ID differently
//       const editingRoom = rooms.find(room => 
//         room.id.toString() === editingRoomId.toString()
//       );
      
//       if (editingRoom) {
//         console.log('Editing room data:', editingRoom);
        
//         // Process existing photos
//         const existingPhotos = processPhotoUrls(editingRoom.photo_urls);
//         console.log('Processed photos:', existingPhotos);
        
//         // Process existing video
//         let existingVideo = null;
//         if (editingRoom?.video_url && editingRoom.video_url !== 'null') {
//           existingVideo = {
//             url: getMediaUrl(editingRoom.video_url, 'video'),
//             label: 'Room Video Walkthrough' // Default label for videos
//           };
//           console.log('Existing video loaded:', existingVideo);
//         }
        
//         // Get gender preferences correctly
//         const genderPreferences = editingRoom.room_gender_preference 
//           ? Array.isArray(editingRoom.room_gender_preference) 
//             ? editingRoom.room_gender_preference.map(g => g.trim())
//             : typeof editingRoom.room_gender_preference === 'string'
//               ? editingRoom.room_gender_preference.split(',').map(g => g.trim()).filter(Boolean)
//               : []
//           : [];

//         const capacity = editingRoom.total_bed || 2;
//         const sharingType = editingRoom.sharing_type || '';
        
//         const standardCapacities = [1, 2, 3];
//         const isStandardCapacity = standardCapacities.includes(capacity);
//         let actualSharingType = sharingType;
        
//         if (sharingType === 'other' || !isStandardCapacity) {
//           actualSharingType = 'other';
//         }
        
//         const defaultForSharingType = roomTypeConfig[actualSharingType]?.capacity || 2;
//         const isAutoCapacity = defaultForSharingType === capacity && actualSharingType !== 'other';

//         setExistingVideoUrl(existingVideo?.url || null);
//         setVideoToRemove(false);

//         // Boolean fields
//       const isActive = Boolean(editingRoom.is_active);
//       const allowCouples = Boolean(editingRoom.allow_couples);
//       const hasAttachedBathroom = Boolean(editingRoom.has_attached_bathroom);
//       const hasBalcony = Boolean(editingRoom.has_balcony);
//       const hasAC = Boolean(editingRoom.has_ac);
        
//         // Update form data
//         setFormData(prev => ({
//           ...prev,
//           property_id: editingRoom.property_id.toString(),
//           room_number: editingRoom.room_number.toString(),
//           sharing_type: actualSharingType,
//           capacity: capacity,
//           rent_per_bed: editingRoom.rent_per_bed || 0,
//           floor: editingRoom.floor ? editingRoom.floor.toString() : '',
//           has_attached_bathroom: hasAttachedBathroom,
//         has_balcony: hasBalcony,
//         has_ac: hasAC,
//           amenities: editingRoom.amenities || [],
//           video_label: '', // Clear video label field
//           video: null, // Reset new video upload when editing
//           room_gender_preference: genderPreferences,
//           allow_couples: allowCouples,
//           is_active: isActive,
//           existingPhotos: existingPhotos,
//           existingVideo: existingVideo, // Store video with its data
//           photosToRemove: [],
//           isManualCapacity: !isAutoCapacity || actualSharingType === 'other',
//           description: editingRoom.description || '',
//         }));
//       }
//     }
    
//     // Reset video states when dialog closes
//     if (!open) {
//       setExistingVideoUrl(null);
//       setVideoToRemove(false);
//     }
//   }, [isEditMode, open, rooms, setFormData]);

  

//   const handleSharingTypeChange = (value: string) => {
//     const defaultCapacity = roomTypeConfig[value]?.capacity || 2;
    
//     if (!formData.isManualCapacity || formData.capacity === defaultCapacity) {
//       setFormData({
//         ...formData,
//         sharing_type: value,
//         capacity: defaultCapacity
//       });
//     } else {
//       setFormData({
//         ...formData,
//         sharing_type: value
//       });
//     }
//   };

//   const handleCapacityChange = (value: string) => {
//     const numValue = value === '' ? 0 : parseInt(value, 10);
//     const validValue = isNaN(numValue) ? 0 : numValue;
    
//     const currentSharingType = formData.sharing_type;
//     const defaultForCurrentType = roomTypeConfig[currentSharingType]?.capacity;
    
//     setFormData({
//       ...formData,
//       capacity: validValue,
//       isManualCapacity: !(currentSharingType && validValue === defaultForCurrentType && currentSharingType !== 'other')
//     });
//   };

//   const handleFileClick = () => {
//     if (isFileDialogOpen) return;
//     setIsFileDialogOpen(true);
    
//     setTimeout(() => {
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//         fileInputRef.current.click();
//       }
//     }, 10);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setIsFileDialogOpen(false);
//     if (e.target.files) {
//       const files = Array.from(e.target.files);
//       const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
//       if (imageFiles.length > 0) {
//         setFormData({
//           ...formData,
//           photos: [...formData.photos, ...imageFiles]
//         });
//         toast.success(`Added ${imageFiles.length} photo(s)`);
//       } else {
//         toast.error("Please select only image files");
//       }
//     }
//   };

//   const handleVideoClick = () => {
//     if (isVideoDialogOpen) return;
//     setIsVideoDialogOpen(true);
    
//     setTimeout(() => {
//       if (videoInputRef.current) {
//         videoInputRef.current.value = '';
//         videoInputRef.current.click();
//       }
//     }, 10);
//   };

//   const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setIsVideoDialogOpen(false);
//     if (e.target.files && e.target.files[0]) {
//       const videoFile = e.target.files[0];
      
//       if (videoFile.type.startsWith('video/')) {
//         setFormData({
//           ...formData,
//           video: videoFile
//         });
//         // Clear existing video preview when uploading new one
//         setExistingVideoUrl(null);
//         toast.success("New video added successfully");
//       } else {
//         toast.error("Please select a video file");
//       }
//     }
//   };

//   const removeNewFile = (index: number) => {
//     setFormData({
//       ...formData,
//       photos: formData.photos.filter((_, i) => i !== index),
//       photo_labels: Object.fromEntries(
//         Object.entries(formData.photo_labels).filter(([key]) => key !== index.toString())
//       )
//     });
//   };

//   const removeExistingPhoto = (photoUrl: string) => {
//     setFormData({
//       ...formData,
//       existingPhotos: formData.existingPhotos.filter(p => p.url !== photoUrl),
//       photosToRemove: [...formData.photosToRemove, photoUrl]
//     });
//     toast.success("Photo marked for removal");
//   };

//   const removeVideo = () => {
//     setFormData({
//       ...formData,
//       video: null,
//       video_label: ''
//     });
//     toast.success("New video removed");
//   };

//   const removeExistingVideo = () => {
//     setVideoToRemove(true);
//     setExistingVideoUrl(null);
//     setFormData(prev => ({
//       ...prev,
//       existingVideo: undefined
//     }));
//     toast.success("Existing video marked for removal");
//   };

//   const restoreExistingVideo = () => {
//     setVideoToRemove(false);
//     if (formData.existingVideo?.url) {
//       setExistingVideoUrl(formData.existingVideo.url);
//     }
//     toast.success("Existing video restored");
//   };

//   const toggleGenderPreference = (value: string) => {
//     setFormData({
//       ...formData,
//       room_gender_preference: formData.room_gender_preference.includes(value)
//         ? formData.room_gender_preference.filter(v => v !== value)
//         : [...formData.room_gender_preference, value]
//     });
//   };

//   const toggleAmenity = (amenity: string) => {
//     setFormData({
//       ...formData,
//       amenities: formData.amenities.includes(amenity)
//         ? formData.amenities.filter(a => a !== amenity)
//         : [...formData.amenities, amenity]
//     });
//   };

//   const addCustomAmenity = () => {
//     const amenity = formData.customAmenityInput.trim();
    
//     if (!amenity) {
//       toast.error("Please enter an amenity");
//       return;
//     }
    
//     if (formData.amenities.includes(amenity)) {
//       toast.error("This amenity already exists");
//       return;
//     }
    
//     setFormData({
//       ...formData,
//       amenities: [...formData.amenities, amenity],
//       customAmenityInput: ''
//     });
    
//     if (amenityInputRef.current) {
//       amenityInputRef.current.focus();
//     }
//   };

//   const removeAmenity = (amenity: string) => {
//     setFormData({
//       ...formData,
//       amenities: formData.amenities.filter(a => a !== amenity)
//     });
//   };

//   const handleAmenityKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       addCustomAmenity();
//     }
//   };

//   const openExistingGallery = () => {
//     const items: Array<{url: string, label?: string, type: 'photo' | 'video'}> = [];
    
//     // Add existing photos
//     formData.existingPhotos.forEach(photo => {
//       if (photo.url && !formData.photosToRemove.includes(photo.url)) {
//         items.push({
//           url: photo.url,
//           label: photo.label || 'Room Photo',
//           type: 'photo'
//         });
//       }
//     });
    
//     // Add existing video if exists and not marked for removal
//     if (existingVideoUrl && !videoToRemove && formData.existingVideo) {
//       items.push({
//         url: existingVideoUrl,
//         label: formData.existingVideo.label || 'Room Video',
//         type: 'video'
//       });
//     }
    
//     // Add new photos
//     formData.photos.forEach((file, index) => {
//       const url = URL.createObjectURL(file);
//       const label = formData.photo_labels[index] || 'New Photo';
//       items.push({ url, label, type: 'photo' });
//     });
    
//     // Add new video if exists
//     if (formData.video) {
//       const url = URL.createObjectURL(formData.video);
//       items.push({
//         url,
//         label: formData.video_label || 'New Video',
//         type: 'video'
//       });
//     }
    
//     setGalleryItems(items);
//     setGalleryOpen(true);
//   };

//   // Prepare form data for submission
//   const prepareFormData = () => {
//     console.log('Form data being submitted:', {
//       hasVideo: !!formData.video,
//       videoLabel: formData.video_label,
//       videoToRemove,
//       existingVideo: formData.existingVideo
//     });
    
//     return {
//       ...formData,
//       videoToRemove: videoToRemove,
//       // Include video label if new video is uploaded
//       ...(formData.video && { video_label: formData.video_label })
//     };
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-2xl flex items-center gap-2">
//             {isEditMode ? (
//               <>
//                 <Edit className="h-6 w-6" />
//                 Edit Room
//               </>
//             ) : (
//               <>
//                 <Plus className="h-6 w-6" />
//                 Add New Room
//               </>
//             )}
//           </DialogTitle>
//           <DialogDescription>
//             {isEditMode ? 'Update room details, photos, and preferences' : 'Fill in room details and upload photos/video'}
//           </DialogDescription>
//         </DialogHeader>

//         <Tabs defaultValue="details" className="mt-4">
//           <TabsList className="grid w-full grid-cols-5">
//             <TabsTrigger value="details" className="flex items-center gap-2">
//               <DoorOpen className="h-4 w-4" />
//               Room Details
//             </TabsTrigger>
//             <TabsTrigger value="photos" className="flex items-center gap-2">
//               <ImageIcon className="h-4 w-4" />
//               Photos & Labels
//             </TabsTrigger>
//             <TabsTrigger value="video" className="flex items-center gap-2">
//               <Video className="h-4 w-4" />
//               Room Video
//             </TabsTrigger>
//             <TabsTrigger value="amenities" className="flex items-center gap-2">
//               <Sparkles className="h-4 w-4" />
//               Amenities
//             </TabsTrigger>
//             <TabsTrigger value="preferences" className="flex items-center gap-2">
//               <Users className="h-4 w-4" />
//               Preferences
//             </TabsTrigger>
//           </TabsList>
          
//           {/* Room Details Tab */}
//           <TabsContent value="details" className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <Label className="flex items-center gap-2 mb-1">
//                   <Home className="h-4 w-4" />
//                   Property *
//                 </Label>
//                 <Select
//                   value={formData.property_id}
//                   onValueChange={(v) => setFormData({ ...formData, property_id: v })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select property" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {properties.map((p) => (
//                       <SelectItem key={p.id} value={String(p.id)}>
//                         <div className="flex items-center gap-2">
//                           <Building className="h-4 w-4" />
//                           <div>
//                             <div>{p.name}</div>
//                             <div className="text-xs text-gray-500 truncate max-w-[200px]">{p.address}</div>
//                           </div>
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label className="flex items-center gap-2 mb-1">
//                   <DoorOpen className="h-4 w-4" />
//                   Room Number *
//                 </Label>
//                 <Input
//                   value={formData.room_number}
//                   onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
//                   placeholder="e.g., 101, 202, G-01"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label className="flex items-center gap-2 mb-1">
//                   <Users className="h-4 w-4" />
//                   Room Type *
//                 </Label>
//                 <Select
//                   value={formData.sharing_type}
//                   onValueChange={handleSharingTypeChange}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="single">
//                       <div className="flex items-center gap-2">
//                         <UserCircle className="h-4 w-4 text-blue-600" />
//                         <div>
//                           <div>Single Occupancy</div>
//                           <div className="text-xs text-gray-500">1 bed per room</div>
//                         </div>
//                       </div>
//                     </SelectItem>
//                     <SelectItem value="double">
//                       <div className="flex items-center gap-2">
//                         <Users className="h-4 w-4 text-green-600" />
//                         <div>
//                           <div>Double Occupancy</div>
//                           <div className="text-xs text-gray-500">2 beds per room</div>
//                         </div>
//                       </div>
//                     </SelectItem>
//                     <SelectItem value="triple">
//                       <div className="flex items-center gap-2">
//                         <Users className="h-4 w-4 text-purple-600" />
//                         <div>
//                           <div>Triple Occupancy</div>
//                           <div className="text-xs text-gray-500">3 beds per room</div>
//                         </div>
//                       </div>
//                     </SelectItem>
//                     <SelectItem value="other">
//                       <div className="flex items-center gap-2">
//                         <Users className="h-4 w-4 text-gray-600" />
//                         <div>
//                           <div>Other (Custom)</div>
//                           <div className="text-xs text-gray-500">Custom bed count</div>
//                         </div>
//                       </div>
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label className="flex items-center gap-2 mb-1">
//                   <Bed className="h-4 w-4" />
//                   Number of Beds *
//                 </Label>
//                 <div className="relative">
//                   <Input
//                     type="text"
//                     value={formData.capacity}
//                     onChange={(e) => handleCapacityChange(e.target.value)}
//                     className="pr-10"
//                     placeholder="Enter number of beds"
//                   />
//                   {!formData.isManualCapacity && formData.sharing_type && formData.sharing_type !== 'other' && (
//                     <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                       <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
//                         Auto
//                       </Badge>
//                     </div>
//                   )}
//                 </div>
//                 {!formData.isManualCapacity && formData.sharing_type && formData.sharing_type !== 'other' && (
//                   <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
//                     <CheckCircle className="h-3 w-3" />
//                     Auto-set to {roomTypeConfig[formData.sharing_type]?.capacity} beds for {formData.sharing_type} occupancy
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label className="flex items-center gap-2 mb-1">
//                   <BadgeIndianRupee className="h-4 w-4" />
//                   Rent Per Bed (₹) *
//                 </Label>
//                 <Input
//                   type="text"
//                   value={formData.rent_per_bed}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     const numValue = value === '' ? 0 : parseFloat(value);
//                     setFormData({
//                       ...formData,
//                       rent_per_bed: isNaN(numValue) ? 0 : numValue
//                     });
//                   }}
//                   placeholder="Enter rent amount"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label className="flex items-center gap-2 mb-1">
//                   <Layers className="h-4 w-4" />
//                   Floor
//                 </Label>
//                 <Input
//                   value={formData.floor}
//                   onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
//                   placeholder="e.g., 1, 2, G"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2 mt-4">
//               <Label htmlFor="description" className="flex items-center gap-2 mb-1">
//                 <Edit className="h-4 w-4" />
//                 Room Description
//               </Label>
//               <Textarea
//                 id="description"
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 placeholder="Describe the room, its features, view, etc."
//                 rows={3}
//                 className="resize-none"
//               />
//             </div>
//           </TabsContent>

//           {/* Photos Tab */}
//           <TabsContent value="photos" className="space-y-4">
//             <div>
//               <Label className="flex items-center gap-2 mb-3">
//                 <ImageIcon className="h-4 w-4" />
//                 Room Photos with Labels
//               </Label>
              
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 multiple
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 className="hidden"
//               />
              
//               <div 
//                 className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-cyan-400 hover:bg-cyan-50 transition-colors cursor-pointer mb-6"
//                 onClick={handleFileClick}
//               >
//                 <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
//                 <p className="text-lg font-medium text-gray-700 mb-2">Upload Room Photos</p>
//                 <p className="text-sm text-gray-600 mb-4">
//                   Click to browse or drag & drop photos here
//                 </p>
//                 <UploadButton 
//                   type="photo"
//                   onClick={handleFileClick}
//                   isDisabled={isFileDialogOpen}
//                 />
//                 <p className="text-xs text-gray-500 mt-3">
//                   Maximum 10 photos, 5MB each. Add labels to identify each image.
//                 </p>
//               </div>

//               {isEditMode && formData.existingPhotos.length > 0 && (
//                 <div className="mb-6">
//                   <div className="flex items-center justify-between mb-3">
//                     <Label className="flex items-center gap-2">
//                       <ImageIcon className="h-4 w-4" />
//                       Existing Photos ({formData.existingPhotos.length})
//                     </Label>
//                     <div className="flex gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={openExistingGallery}
//                       >
//                         <Eye className="h-3 w-3 mr-1" />
//                         View Gallery
//                       </Button>
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//                     {formData.existingPhotos.map((photo, index) => {
//                       const isMarkedForRemoval = formData.photosToRemove.includes(photo.url);
//                       return (
//                         <div key={index} className="relative group">
//                           <div 
//                             className="aspect-square rounded-lg overflow-hidden border border-gray-300 bg-gray-100 cursor-pointer hover:ring-2 hover:ring-cyan-500 hover:border-cyan-500 transition-all"
//                             onClick={openExistingGallery}
//                           >
//                             <img
//                               src={photo.url}
//                               alt={`${photo.label || 'Room photo'} ${index + 1}`}
//                               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                               onError={(e) => {
//                                 const target = e.target as HTMLImageElement;
//                                 target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2Ij5Sb29tIFBob3RvPC90ZXh0Pjwvc3ZnPg==';
//                                 console.log('Image failed to load, using fallback:', photo.url);
//                               }}
//                             />
//                           </div>
//                           <Button
//                             size="sm"
//                             variant={isMarkedForRemoval ? "outline" : "destructive"}
//                             className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full z-10"
//                             onClick={() => isMarkedForRemoval ? 
//                               setFormData({
//                                 ...formData,
//                                 photosToRemove: formData.photosToRemove.filter(url => url !== photo.url)
//                               }) : 
//                               removeExistingPhoto(photo.url)
//                             }
//                           >
//                             {isMarkedForRemoval ? (
//                               <Plus className="h-3 w-3" />
//                             ) : (
//                               <X className="h-3 w-3" />
//                             )}
//                           </Button>
//                           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
//                             <p className="text-xs text-white truncate">
//                               {labelIcons[photo.label || 'Room View'] || <ImageIcon className="h-3 w-3 inline mr-1" />}
//                               {photo.label || 'Room View'}
//                             </p>
//                           </div>
//                           {isMarkedForRemoval && (
//                             <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center rounded-lg">
//                               <Badge variant="destructive" className="text-xs">
//                                 <Trash2 className="h-3 w-3 mr-1" />
//                                 Marked for Removal
//                               </Badge>
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {formData.photos.length > 0 && (
//                 <div>
//                   <Label className="flex items-center gap-2 mb-3">
//                     <Upload className="h-4 w-4" />
//                     New Photos ({formData.photos.length})
//                   </Label>
//                   <div className="space-y-4">
//                     {formData.photos.map((file, index) => (
//                       <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-gray-50">
//                         <div className="md:w-40 md:h-40 w-full h-48 rounded-lg overflow-hidden flex-shrink-0">
//                           <img
//                             src={URL.createObjectURL(file)}
//                             alt={`Preview ${index + 1}`}
//                             className="w-full h-full object-cover"
//                           />
//                         </div>
//                         <div className="flex-1 space-y-3">
//                           <div>
//                             <Label htmlFor={`photo-label-${index}`} className="flex items-center gap-2 mb-1">
//                               <Edit className="h-4 w-4" />
//                               Image Label
//                             </Label>
//                             <Input
//                               id={`photo-label-${index}`}
//                               value={formData.photo_labels[index] || ''}
//                               onChange={(e) => setFormData({
//                                 ...formData,
//                                 photo_labels: {
//                                   ...formData.photo_labels,
//                                   [index]: e.target.value
//                                 }
//                               })}
//                               placeholder="e.g., Room View, Bathroom, Balcony, Bed Area, Study Corner, etc."
//                               className="mt-1"
//                             />
//                             <p className="text-xs text-gray-500 mt-1">
//                               Label helps tenants understand what this image shows
//                             </p>
//                           </div>
//                           <div className="flex items-center justify-between">
//                             <div className="text-sm text-gray-600">
//                               <p className="font-medium">{file.name}</p>
//                               <p className="text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
//                             </div>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => removeNewFile(index)}
//                               className="text-red-600 hover:text-red-700"
//                             >
//                               <Trash2 className="h-4 w-4 mr-1" />
//                               Remove
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </TabsContent>

//           {/* Video Tab */}
//           <TabsContent value="video" className="space-y-4">
//             <div>
//               <Label className="flex items-center gap-2 mb-3">
//                 <Video className="h-4 w-4" />
//                 Room Video Walkthrough
//               </Label>
              
//               <input
//                 type="file"
//                 ref={videoInputRef}
//                 accept="video/*"
//                 onChange={handleVideoChange}
//                 className="hidden"
//               />
              
//               {/* 1. Existing Video Display */}
//               {isEditMode && existingVideoUrl && !videoToRemove && (
//                 <div className="mb-6">
//                   <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3 relative group">
//                     <video
//                       key={existingVideoUrl}
//                       src={existingVideoUrl}
//                       controls
//                       className="w-full h-full"
//                       onError={(e) => {
//                         console.error('Video failed to load:', existingVideoUrl);
//                         // Try alternative path
//                         const correctedUrl = existingVideoUrl.replace('uploads/videos/', 'uploads/rooms/videos/');
//                         e.target.src = correctedUrl;
//                       }}
//                     >
//                       Your browser does not support the video tag.
//                     </video>
                    
//                     {/* Video label overlay (like photos) */}
//                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
//                       <p className="text-xs text-white flex items-center gap-1">
//                         <Video className="h-3 w-3" />
//                         {formData.existingVideo?.label || 'Room Video Walkthrough'}
//                       </p>
//                     </div>
//                   </div>
                  
//                   <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                     <div>
//                       <p className="font-medium">Current Video</p>
//                       <p className="text-sm text-gray-600">
//                         {formData.existingVideo?.label || 'Room Video Walkthrough'}
//                       </p>
//                     </div>
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       onClick={removeExistingVideo}
//                     >
//                       <Trash2 className="h-4 w-4 mr-1" />
//                       Remove Video
//                     </Button>
//                   </div>
//                 </div>
//               )}
              
//               {/* 2. Video Marked for Removal */}
//               {isEditMode && videoToRemove && (
//                 <div className="mb-6 p-4 border-2 border-dashed border-red-300 rounded-lg bg-red-50">
//                   <div className="text-center">
//                     <Trash2 className="h-12 w-12 mx-auto text-red-400 mb-3" />
//                     <p className="text-lg font-medium text-red-700 mb-2">
//                       Video Marked for Removal
//                     </p>
//                     <p className="text-sm text-red-600 mb-4">
//                       The existing video will be deleted when you save changes
//                     </p>
//                     <Button
//                       variant="outline"
//                       onClick={restoreExistingVideo}
//                       className="border-red-300 text-red-700 hover:bg-red-100"
//                     >
//                       <Check className="h-4 w-4 mr-2" />
//                       Restore Video
//                     </Button>
//                   </div>
//                 </div>
//               )}
              
//               {/* 3. New Video Upload Area */}
//               {formData.video ? (
//                 <div className="space-y-4">
//                   <div className="relative">
//                     <div className="aspect-video bg-black rounded-lg overflow-hidden">
//                       <video
//                         src={URL.createObjectURL(formData.video)}
//                         controls
//                         className="w-full h-full"
//                       />
//                     </div>
//                     <div className="absolute top-3 right-3">
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={removeVideo}
//                         className="bg-red-600 hover:bg-red-700"
//                       >
//                         <Trash2 className="h-4 w-4 mr-1" />
//                         Remove
//                       </Button>
//                     </div>
//                   </div>
                  
//                   {/* Video label input (just like photos) */}
//                   <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
//                     <div>
//                       <Label htmlFor="video-label-input" className="flex items-center gap-2 mb-1">
//                         <Edit className="h-4 w-4" />
//                         Video Label (Optional)
//                       </Label>
//                       <Input
//                         id="video-label-input"
//                         value={formData.video_label}
//                         onChange={(e) => setFormData({ ...formData, video_label: e.target.value })}
//                         placeholder="e.g., Room Walkthrough, Complete Tour, etc."
//                         className="mt-1"
//                       />
//                       <p className="text-xs text-gray-500 mt-1">
//                         Label helps identify what this video shows
//                       </p>
//                     </div>
                    
//                     <div className="flex items-center justify-between pt-2 border-t">
//                       <div>
//                         <p className="font-medium">
//                           <Video className="h-4 w-4 inline mr-2" />
//                           New Video: {formData.video.name}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           {(formData.video.size / (1024 * 1024)).toFixed(2)} MB • {formData.video.type}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 // Show upload area when:
//                 // 1. Creating new room, OR
//                 // 2. Editing but no existing video, OR  
//                 // 3. Existing video is marked for removal
//                 (!isEditMode || !existingVideoUrl || videoToRemove) && (
//                   <div 
//                     className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-cyan-400 hover:bg-cyan-50 transition-colors cursor-pointer"
//                     onClick={handleVideoClick}
//                   >
//                     <Video className="h-16 w-16 mx-auto text-gray-400 mb-4" />
//                     <p className="text-lg font-medium text-gray-700 mb-2">
//                       {isEditMode && videoToRemove ? 'Upload Replacement Video' : 'Upload Room Video'}
//                     </p>
//                     <p className="text-sm text-gray-600 mb-4">
//                       Show a walkthrough of the room (recommended: 1-2 minutes)
//                     </p>
//                     <UploadButton 
//                       type="video"
//                       onClick={handleVideoClick}
//                       isDisabled={isVideoDialogOpen}
//                     />
//                   </div>
//                 )
//               )}
//             </div>
//           </TabsContent>

//           {/* Amenities Tab */}
//           <TabsContent value="amenities" className="space-y-4">
//             <div className="space-y-6">
//               <div>
//                 <Label className="flex items-center gap-2 mb-3">
//                   <Sparkles className="h-4 w-4" />
//                   Select Amenities
//                 </Label>
//                 <p className="text-sm text-gray-500 mb-4">Choose amenities available in this room</p>
                
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
//                   {AMENITIES_OPTIONS.map((amenity) => (
//                     <div
//                       key={amenity.id}
//                       className={`p-3 border rounded-lg cursor-pointer transition-all ${
//                         formData.amenities.includes(amenity.label)
//                           ? 'border-cyan-500 bg-cyan-50'
//                           : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                       }`}
//                       onClick={() => toggleAmenity(amenity.label)}
//                     >
//                       <div className="flex items-center gap-2">
//                         <div className={`p-2 rounded ${
//                           formData.amenities.includes(amenity.label)
//                             ? 'bg-cyan-100 text-cyan-600'
//                             : 'bg-gray-100 text-gray-600'
//                         }`}>
//                           {amenity.icon}
//                         </div>
//                         <span className="text-sm font-medium">{amenity.label}</span>
//                       </div>
//                       {formData.amenities.includes(amenity.label) && (
//                         <div className="mt-2 flex items-center gap-1">
//                           <CheckCircle className="h-3 w-3 text-green-600" />
//                           <span className="text-xs text-green-600">Selected</span>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="space-y-3">
//                 <Label className="flex items-center gap-2">
//                   <Plus className="h-4 w-4" />
//                   Add Custom Amenities
//                 </Label>
//                 <p className="text-sm text-gray-500">Add amenities not listed above</p>
                
//                 <div className="flex gap-2">
//                   <Input
//                     ref={amenityInputRef}
//                     value={formData.customAmenityInput}
//                     onChange={(e) => setFormData({ ...formData, customAmenityInput: e.target.value })}
//                     onKeyPress={handleAmenityKeyPress}
//                     placeholder="Enter amenity name (e.g., Study Table, Smart Lock, etc.)"
//                     className="flex-1"
//                   />
//                   <Button 
//                     type="button" 
//                     onClick={addCustomAmenity}
//                     className="bg-cyan-600 hover:bg-cyan-700"
//                   >
//                     <Plus className="h-4 w-4 mr-1" />
//                     Add
//                   </Button>
//                 </div>
                
//                 {formData.amenities.length > 0 && (
//                   <div className="mt-4">
//                     <Label className="flex items-center gap-2 mb-3">
//                       <CheckCircle className="h-4 w-4 text-green-600" />
//                       Selected Amenities ({formData.amenities.length})
//                     </Label>
//                     <div className="flex flex-wrap gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
//                       {formData.amenities.map((amenity, index) => {
//                         const isPredefined = AMENITIES_OPTIONS.some(opt => opt.label === amenity);
//                         const isCustom = !isPredefined;
                        
//                         return (
//                           <Badge 
//                             key={index} 
//                             variant="outline"
//                             className={`flex items-center gap-1 py-1.5 px-3 ${
//                               isCustom 
//                                 ? 'bg-purple-50 border-purple-200 text-purple-700' 
//                                 : 'bg-white border-gray-300 text-gray-700'
//                             }`}
//                           >
//                             {isCustom ? (
//                               <>
//                                 <Plus className="h-3 w-3" />
//                                 <span className="text-sm font-medium">Custom: </span>
//                               </>
//                             ) : (
//                               AMENITIES_OPTIONS.find(opt => opt.label === amenity)?.icon
//                             )}
//                             <span className="text-sm">{amenity}</span>
//                             <button
//                               type="button"
//                               onClick={() => removeAmenity(amenity)}
//                               className="ml-1 text-gray-400 hover:text-red-500 focus:outline-none"
//                             >
//                               <X className="h-3 w-3" />
//                             </button>
//                           </Badge>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}

//                 {formData.amenities.length === 0 && (
//                   <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
//                     <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-3" />
//                     <p className="text-lg font-medium text-gray-700 mb-2">No amenities selected yet</p>
//                     <p className="text-sm text-gray-500">
//                       Select amenities from above or add custom ones to enhance your room listing
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="pt-4 border-t">
//                 <Label className="flex items-center gap-2 mb-3">
//                   <Home className="h-4 w-4" />
//                   Basic Room Features
//                 </Label>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${
//                     formData.has_ac ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
//                   }`}
//                   onClick={() => setFormData({ ...formData, has_ac: !formData.has_ac })}>
//                     <div className={`p-2 rounded-lg ${
//                       formData.has_ac ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'
//                     }`}>
//                       <Wind className="h-5 w-5" />
//                     </div>
//                     <div className="flex-1">
//                       <Label htmlFor="has_ac" className="cursor-pointer font-medium">
//                         Air Conditioner
//                       </Label>
//                       <p className="text-xs text-gray-500">Room has AC</p>
//                     </div>
//                     <input
//                       type="checkbox"
//                       id="has_ac"
//                       checked={formData.has_ac}
//                       onChange={(e) => setFormData({ ...formData, has_ac: e.target.checked })}
//                       className="h-5 w-5"
//                     />
//                   </div>

//                   <div className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${
//                     formData.has_balcony ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
//                   }`}
//                   onClick={() => setFormData({ ...formData, has_balcony: !formData.has_balcony })}>
//                     <div className={`p-2 rounded-lg ${
//                       formData.has_balcony ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'
//                     }`}>
//                       <Maximize className="h-5 w-5" />
//                     </div>
//                     <div className="flex-1">
//                       <Label htmlFor="has_balcony" className="cursor-pointer font-medium">
//                         Balcony
//                       </Label>
//                       <p className="text-xs text-gray-500">Room has balcony</p>
//                     </div>
//                     <input
//                       type="checkbox"
//                       id="has_balcony"
//                       checked={formData.has_balcony}
//                       onChange={(e) => setFormData({ ...formData, has_balcony: e.target.checked })}
//                       className="h-5 w-5"
//                     />
//                   </div>

//                   <div className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${
//                     formData.has_attached_bathroom ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
//                   }`}
//                   onClick={() => setFormData({ ...formData, has_attached_bathroom: !formData.has_attached_bathroom })}>
//                     <div className={`p-2 rounded-lg ${
//                       formData.has_attached_bathroom ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'
//                     }`}>
//                       <Bath className="h-5 w-5" />
//                     </div>
//                     <div className="flex-1">
//                       <Label htmlFor="has_bathroom" className="cursor-pointer font-medium">
//                         Attached Bathroom
//                       </Label>
//                       <p className="text-xs text-gray-500">Private bathroom</p>
//                     </div>
//                     <input
//                       type="checkbox"
//                       id="has_bathroom"
//                       checked={formData.has_attached_bathroom}
//                       onChange={(e) => setFormData({ ...formData, has_attached_bathroom: e.target.checked })}
//                       className="h-5 w-5"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </TabsContent>

//           {/* Preferences Tab */}
//           <TabsContent value="preferences" className="space-y-6">
//             <div>
//               <Label className="flex items-center gap-2 mb-4">
//                 <Users className="h-4 w-4" />
//                 Room Gender Preference (Select Multiple)
//               </Label>
//               <p className="text-sm text-gray-600 mb-6">
//                 Select who can book beds in this room. You can select multiple preferences.
//               </p>
              
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {GENDER_PREFERENCES.map((pref) => (
//                   <div
//                     key={pref.value}
//                     className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
//                       formData.room_gender_preference.includes(pref.value)
//                         ? `${pref.color} border-${pref.color.split('bg-')[1].split('-')[0]}-300`
//                         : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                     }`}
//                     onClick={() => toggleGenderPreference(pref.value)}
//                   >
//                     <div className="flex flex-col items-center text-center">
//                       <div className={`p-3 rounded-full mb-3 ${formData.room_gender_preference.includes(pref.value) ? pref.color : 'bg-gray-100'}`}>
//                         <div className={formData.room_gender_preference.includes(pref.value) ? pref.iconColor : 'text-gray-600'}>
//                           {pref.icon}
//                         </div>
//                       </div>
//                       <p className="font-semibold">{pref.label}</p>
//                       <div className="mt-2">
//                         {formData.room_gender_preference.includes(pref.value) ? (
//                           <Badge className="bg-green-100 text-green-800 border-green-300">
//                             <Check className="h-3 w-3 mr-1" />
//                             Selected
//                           </Badge>
//                         ) : null}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
              
//               {formData.room_gender_preference.length > 0 && (
//                 <div className="mt-4 p-3 bg-gray-50 rounded-lg">
//                   <p className="text-sm font-medium text-gray-700 mb-2">Selected Preferences:</p>
//                   <div className="flex flex-wrap gap-2">
//                     {formData.room_gender_preference.map(pref => {
//                       const prefConfig = GENDER_PREFERENCES.find(p => p.value === pref);
//                       return (
//                         <Badge key={pref} className={prefConfig?.color}>
//                           {prefConfig?.icon}
//                           <span className="ml-1">{prefConfig?.label}</span>
//                         </Badge>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </TabsContent>
//         </Tabs>

//         <Separator className="my-4" />

//         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//           <div className="flex items-center gap-2">
//             <div className={`w-3 h-3 rounded-full ${
//               formData.is_active ? 'bg-green-500' : 'bg-red-500'
//             }`} />
//             <span className="text-sm font-medium">
//               {formData.is_active ? 'Room is Active' : 'Room is Inactive'}
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Label htmlFor="is_active" className="text-sm cursor-pointer">
//               Active Status
//             </Label>
//             <div className="relative">
//               <input
//                 type="checkbox"
//                 id="is_active"
//                 checked={formData.is_active}
//                 onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
//                 className="sr-only"
//               />
//               <div
//                 className={`block w-12 h-6 rounded-full cursor-pointer ${
//                   formData.is_active ? 'bg-green-500' : 'bg-gray-300'
//                 }`}
//                 onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
//               >
//                 <div
//                   className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
//                     formData.is_active ? 'transform translate-x-6' : ''
//                   }`}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <DialogFooter className="gap-2 pt-4">
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button 
//             onClick={async () => {
//               const preparedData = prepareFormData();
//               console.log('Submitting form data:', preparedData);
//               await onSubmit();
//             }}
//             className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
//           >
//             {isEditMode ? (
//               <>
//                 <Edit className="h-4 w-4 mr-2" />
//                 Update Room
//               </>
//             ) : (
//               <>
//                 <Plus className="h-4 w-4 mr-2" />
//                 Create Room
//               </>
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
      
//       <PhotoGalleryModal
//         open={galleryOpen}
//         onOpenChange={setGalleryOpen}
//         photos={galleryItems}
//         roomNumber={formData.room_number}
//       />
//     </Dialog>
//   );
// }