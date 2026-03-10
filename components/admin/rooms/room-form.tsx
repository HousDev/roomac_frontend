// components/admin/rooms/room-form.tsx
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
  Pencil, Eye, Phone, Mail, Calendar, UserCircle, Heart, UserRound, UsersRound, User, BadgeIndianRupee, Info, Loader2,
  Snowflake,
  BookOpen,
  Fan,
  Lamp,
  BedDouble,
  Wallet
} from 'lucide-react';
import { toast } from "sonner";
import { PhotoGalleryModal } from '@/components/admin/rooms/PhotoGalleryModal';
import { getMediaUrl, processPhotoUrls } from '@/lib/roomsApi';
import { consumeMasters } from "@/lib/masterApi";

// Types
interface BedConfig {
  bed_number: number;
  bed_type: string;
  bed_rent: number;
}

interface RoomFormData {
  property_id: string;
  room_number: string;
  sharing_type: string;
  capacity: number;
  rent_per_bed: number; // Keep the same field name
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
  room_type?: string;
  beds_config: BedConfig[];
}

interface RoomFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  formData: RoomFormData;
  setFormData: any;
  onSubmit: (data: FormData) => Promise<void>;
  properties: any[];
  rooms?: any[];
  editingRoomId?: any;
}

interface MasterValue {
  id: number;
  name: string;
  isactive: number;
}

// Sharing type to capacity mapping
const sharingTypeToCapacity: Record<string, number> = {
  'single': 1,
  'double': 2,
  'triple': 3,
  'other': 2
};

const GENDER_PREFERENCES = [
  { 
    value: 'male_only', 
    label: 'Male', 
    icon: <User className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600'
  },
  { 
    value: 'female_only', 
    label: 'Female', 
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
  { id: 'ac', label: 'Air Conditioner', icon: <Snowflake className="h-4 w-4" /> },
  { id: 'geyser', label: 'Geyser', icon: <Droplets className="h-4 w-4" /> },
  { id: 'fridge', label: 'Refrigerator', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'bed', label: 'Bed', icon: <Bed className="h-4 w-4" /> },
  { id: 'study', label: 'Study Table', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'wardrobe', label: 'Wardrobe', icon: <DoorOpen className="h-4 w-4" /> },
  { id: 'curtains', label: 'Curtains', icon: <Layers className="h-4 w-4" /> },
  { id: 'heater', label: 'Room Heater', icon: <Thermometer className="h-4 w-4" /> },
  { id: 'fan', label: 'Ceiling Fan', icon: <Fan className="h-4 w-4" /> },
  { id: 'lamp', label: 'Study Lamp', icon: <Lamp className="h-4 w-4" /> },
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
      className={`h-6 md:h-7 text-[10px] md:text-xs ${type === 'video' ? "mt-2" : ""}`}
    >
      {type === 'photo' ? (
        <>
          <ImageIcon className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
          {isProcessing ? "Opening..." : "Browse Photos"}
        </>
      ) : (
        <>
          <Video className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
          {isProcessing ? "Opening..." : "Select Video File"}
        </>
      )}
    </Button>
  );
};

// Helper function to calculate total rent from beds
const calculateTotalRentFromBeds = (bedsConfig: BedConfig[]): number => {
  return bedsConfig.reduce((sum, bed) => sum + (Number(bed.bed_rent) || 0), 0);
};

// Helper function to distribute rent equally
const distributeRentEqually = (totalRent: number, numberOfBeds: number): number[] => {
  if (numberOfBeds === 0) return [];
  const perBedRent = Math.floor(totalRent / numberOfBeds);
  const remainder = totalRent - (perBedRent * numberOfBeds);
  
  // Distribute remainder to first 'remainder' beds
  return Array.from({ length: numberOfBeds }, (_, i) => 
    i < remainder ? perBedRent + 1 : perBedRent
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
  const [currentTab, setCurrentTab] = useState('details');

  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [videoToRemove, setVideoToRemove] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [roomsMasters, setRoomsMasters] = useState<Record<string, MasterValue[]>>({});
  const [loadingMasters, setLoadingMasters] = useState(false);

  const fileDialogTimeoutRef = useRef<NodeJS.Timeout>();
  const videoDialogTimeoutRef = useRef<NodeJS.Timeout>();
  const hasInitializedRef = useRef(false);

  // Initialize beds_config if not present
  useEffect(() => {
    if (!formData.beds_config) {
      setFormData((prev: RoomFormData) => ({
        ...prev,
        beds_config: []
      }));
    }
  }, []);

  // Fetch rooms masters
  const fetchRoomsMasters = async () => {
    setLoadingMasters(true);
    try {
      const res = await consumeMasters({ tab: "Rooms" });
      if (res?.success && res.data) {
        const grouped: Record<string, MasterValue[]> = {};
        res.data.forEach((item: any) => {
          const type = item.type_name;
          if (!grouped[type]) {
            grouped[type] = [];
          }
          grouped[type].push({
            id: item.value_id,
            name: item.value_name,
            isactive: 1,
          });
        });
        setRoomsMasters(grouped);
      }
    } catch (error) {
      console.error("Failed to fetch rooms masters:", error);
    } finally {
      setLoadingMasters(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchRoomsMasters();
    }
  }, [open]);

  useEffect(() => {
    if (isEditMode && open && Object.keys(roomsMasters).length > 0 && formData) {
      if (formData.room_type && roomsMasters["Room Type"]) {
        const matchingRoomType = roomsMasters["Room Type"].find(
          type => type.name.toLowerCase() === formData.room_type?.toLowerCase()
        );
        if (matchingRoomType) {
          setFormData((prev: RoomFormData) => ({
            ...prev,
            room_type: matchingRoomType.name
          }));
        }
      }
      
      if (formData.floor && roomsMasters["Floor"]) {
        const matchingFloor = roomsMasters["Floor"].find(
          floor => floor.name.toLowerCase() === formData.floor?.toLowerCase()
        );
        if (matchingFloor) {
          setFormData((prev: RoomFormData) => ({
            ...prev,
            floor: matchingFloor.name
          }));
        }
      }
      
      if (formData.sharing_type && roomsMasters["Sharing Type"]) {
        const matchingSharingType = roomsMasters["Sharing Type"].find(
          type => type.name.toLowerCase() === formData.sharing_type?.toLowerCase()
        );
        if (matchingSharingType) {
          setFormData((prev: RoomFormData) => ({
            ...prev,
            sharing_type: matchingSharingType.name.toLowerCase()
          }));
        }
      }
    }
  }, [roomsMasters, isEditMode, open, formData, setFormData]);

  // Load editing room data
  useEffect(() => {
    if (isEditMode && open && rooms.length > 0 && !hasInitializedRef.current) {
      const editingRoom = rooms.find(room => 
        room.id.toString() === editingRoomId.toString()
      );
      
      if (editingRoom) {
        console.log('Editing room data:', editingRoom);
        const existingPhotos = processPhotoUrls(editingRoom.photo_urls);
        
        let existingVideo: any = null;
        if (editingRoom?.video_url && editingRoom.video_url !== 'null') {
          existingVideo = {
            url: getMediaUrl(editingRoom.video_url, 'video'),
            label: 'Room Video Walkthrough'
          };
        }
        
        const genderPreferences = editingRoom.room_gender_preference 
          ? Array.isArray(editingRoom.room_gender_preference) 
            ? editingRoom.room_gender_preference.map((g: any) => g.trim())
            : typeof editingRoom.room_gender_preference === 'string'
              ? editingRoom.room_gender_preference.split(',').map((g: any) => g.trim()).filter(Boolean)
              : []
          : [];

        const capacity = editingRoom.beds_config?.length ||
          editingRoom.bed_assignments?.length ||
          editingRoom.total_bed ||
          0;
        
        const sharingType = editingRoom.sharing_type || '';
        
        const defaultCapacity = sharingTypeToCapacity[sharingType] || 2;
        const isManualCapacity = sharingType === 'other' || capacity !== defaultCapacity;

        setExistingVideoUrl(existingVideo?.url || null);
        setVideoToRemove(false);

        const isActive = Boolean(editingRoom.is_active);
        const allowCouples = Boolean(editingRoom.allow_couples);
        const hasAttachedBathroom = Boolean(editingRoom.has_attached_bathroom);
        const hasBalcony = Boolean(editingRoom.has_balcony);
        const hasAC = Boolean(editingRoom.has_ac);
        
        // Get beds_config from the room data
        let bedsConfig = [];
        let totalRent = 0;
        
        if (editingRoom.beds_config && Array.isArray(editingRoom.beds_config)) {
          bedsConfig = editingRoom.beds_config;
          totalRent = calculateTotalRentFromBeds(bedsConfig);
          console.log('Using beds_config from room:', bedsConfig);
        } else if (editingRoom.bed_assignments && Array.isArray(editingRoom.bed_assignments)) {
          bedsConfig = editingRoom.bed_assignments.map((bed: any) => ({
            bed_number: bed.bed_number,
            bed_type: bed.bed_type || '',
            bed_rent: bed.tenant_rent || editingRoom.rent_per_bed
          }));
          totalRent = calculateTotalRentFromBeds(bedsConfig);
          console.log('Built beds_config from bed_assignments:', bedsConfig);
        } else {
          bedsConfig = Array.from({ length: capacity }, (_, i) => ({
            bed_number: i + 1,
            bed_type: '',
            bed_rent: editingRoom.rent_per_bed || 0
          }));
          totalRent = editingRoom.rent_per_bed * capacity || 0;
          console.log('Created empty beds_config:', bedsConfig);
        }
        
        setFormData((prev: any) => ({
          ...prev,
          property_id: editingRoom.property_id.toString(),
          room_number: editingRoom.room_number.toString(),
          sharing_type: sharingType,
          room_type: editingRoom.room_type || '',
          capacity: capacity,
          rent_per_bed: totalRent, // Store total rent in rent_per_bed
          floor: editingRoom.floor ? editingRoom.floor.toString() : '',
          has_attached_bathroom: hasAttachedBathroom,
          has_balcony: hasBalcony,
          has_ac: hasAC,
          amenities: editingRoom.amenities || [],
          video_label: '',
          video: null,
          room_gender_preference: genderPreferences,
          allow_couples: allowCouples,
          is_active: isActive,
          existingPhotos: existingPhotos,
          existingVideo: existingVideo,
          photosToRemove: [],
          isManualCapacity: isManualCapacity,
          description: editingRoom.description || '',
          beds_config: bedsConfig
        }));
        
        hasInitializedRef.current = true;
      }
    }
    
    if (!open) {
      setExistingVideoUrl(null);
      setVideoToRemove(false);
      setIsFileDialogOpen(false);
      setIsVideoDialogOpen(false);
      hasInitializedRef.current = false;
    }
  }, [isEditMode, open, rooms, editingRoomId, setFormData]);

  // Initialize bed configurations when capacity changes
  useEffect(() => {
    const currentBedsConfig = formData.beds_config || [];
    const currentBedsCount = currentBedsConfig.length;
    
    if (formData.capacity === currentBedsCount || formData.capacity <= 0) {
      return;
    }
    
    if (formData.capacity > currentBedsCount) {
      // Add new beds
      const newBeds = [];
      
      // Distribute current total rent among all beds
      const distributedRents = distributeRentEqually(
        formData.rent_per_bed || 0, 
        formData.capacity
      );
      
      for (let i = 0; i < formData.capacity; i++) {
        if (i < currentBedsConfig.length) {
          // Update existing bed with new rent
          currentBedsConfig[i].bed_rent = distributedRents[i];
        } else {
          // Add new bed
          newBeds.push({
            bed_number: i + 1,
            bed_type: '',
            bed_rent: distributedRents[i] || 0
          });
        }
      }
      
      setFormData((prev: RoomFormData) => ({
        ...prev,
        beds_config: [...currentBedsConfig.slice(0, formData.capacity), ...newBeds]
      }));
    } else if (formData.capacity < currentBedsCount) {
      // Remove beds and recalculate remaining rents
      const remainingBeds = currentBedsConfig.slice(0, formData.capacity);
      const newTotalRent = calculateTotalRentFromBeds(remainingBeds);
      
      setFormData((prev: RoomFormData) => ({
        ...prev,
        beds_config: remainingBeds,
        rent_per_bed: newTotalRent // Update total rent based on remaining beds
      }));
    }
  }, [formData.capacity]);

  // Sync total rent when bed rents change
  useEffect(() => {
    if (formData.beds_config && formData.beds_config.length > 0) {
      const totalFromBeds = calculateTotalRentFromBeds(formData.beds_config);
      if (totalFromBeds !== formData.rent_per_bed) {
        // Only update if difference is significant (more than 1 rupee)
        if (Math.abs(totalFromBeds - formData.rent_per_bed) > 1) {
          setFormData((prev: RoomFormData) => ({
            ...prev,
            rent_per_bed: totalFromBeds
          }));
        }
      }
    }
  }, [formData.beds_config]);

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

  useEffect(() => {
    if (!open) {
      setIsFileDialogOpen(false);
      setIsVideoDialogOpen(false);
      setIsCreating(false);
    }
  }, [open]);

  const handleSharingTypeChange = (value: string) => {
    const defaultCapacity = sharingTypeToCapacity[value] || 2;
    
    setFormData((prev: RoomFormData) => {
      let newCapacity = prev.capacity;
      let newIsManualCapacity = prev.isManualCapacity;
      
      if (value !== 'other') {
        if (prev.sharing_type === 'other' || prev.capacity !== defaultCapacity) {
          newCapacity = defaultCapacity;
          newIsManualCapacity = false;
        }
      } else {
        newIsManualCapacity = true;
      }
      
      // Redistribute rent based on new capacity
      const distributedRents = distributeRentEqually(prev.rent_per_bed || 0, newCapacity);
      
      // Update beds_config with new rents
      const updatedBedsConfig = Array.from({ length: newCapacity }, (_, i) => {
        if (i < prev.beds_config.length) {
          return {
            ...prev.beds_config[i],
            bed_rent: distributedRents[i] || prev.beds_config[i].bed_rent
          };
        } else {
          return {
            bed_number: i + 1,
            bed_type: '',
            bed_rent: distributedRents[i] || 0
          };
        }
      });
      
      return {
        ...prev,
        sharing_type: value,
        capacity: newCapacity,
        isManualCapacity: newIsManualCapacity,
        beds_config: updatedBedsConfig
      };
    });
  };

  const handleCapacityChange = (value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    const validValue = isNaN(numValue) ? 0 : numValue;
    
    setFormData((prev: RoomFormData) => {
      const currentSharingType = prev.sharing_type;
      const defaultForCurrentType = sharingTypeToCapacity[currentSharingType] || 2;
      
      const isManual = currentSharingType === 'other' || 
                       (currentSharingType && validValue !== defaultForCurrentType);
      
      return {
        ...prev,
        capacity: validValue,
        isManualCapacity: isManual
      };
    });
  };

  const handleFileClick = () => {
    if (isFileDialogOpen) return;
    
    setIsFileDialogOpen(true);
    
    if (fileDialogTimeoutRef.current) {
      clearTimeout(fileDialogTimeoutRef.current);
    }
    
    fileDialogTimeoutRef.current = setTimeout(() => {
      setIsFileDialogOpen(false);
    }, 3000);
    
    requestAnimationFrame(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVideoClick = () => {
    if (isVideoDialogOpen) return;
    
    setIsVideoDialogOpen(true);
    
    if (videoDialogTimeoutRef.current) {
      clearTimeout(videoDialogTimeoutRef.current);
    }
    
    videoDialogTimeoutRef.current = setTimeout(() => {
      setIsVideoDialogOpen(false);
    }, 3000);
    
    requestAnimationFrame(() => {
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
        videoInputRef.current.click();
      }
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setExistingVideoUrl(null);
        toast.success("New video added successfully");
      } else {
        toast.error("Please select a video file");
      }
    }
    
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const handleWindowClick = () => {
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
    setFormData((prev: any) => ({
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
    
    formData.existingPhotos.forEach(photo => {
      if (photo.url && !formData.photosToRemove.includes(photo.url)) {
        items.push({
          url: photo.url,
          label: photo.label || 'Room Photo',
          type: 'photo'
        });
      }
    });
    
    if (existingVideoUrl && !videoToRemove && formData.existingVideo) {
      items.push({
        url: existingVideoUrl,
        label: formData.existingVideo.label || 'Room Video',
        type: 'video'
      });
    }
    
    formData.photos.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const label = formData.photo_labels[index] || 'New Photo';
      items.push({ url, label, type: 'photo' });
    });
    
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

  const handleBedTypeChange = (bedNumber: number, value: string) => {
    setFormData((prev: RoomFormData) => ({
      ...prev,
      beds_config: (prev.beds_config || []).map(bed =>
        bed.bed_number === bedNumber ? { ...bed, bed_type: value } : bed
      )
    }));
  };

  const handleBedRentChange = (bedNumber: number, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    const newRent = isNaN(numValue) ? 0 : numValue;
    
    setFormData((prev: RoomFormData) => {
      // Update the specific bed
      const updatedBedsConfig = (prev.beds_config || []).map(bed =>
        bed.bed_number === bedNumber ? { ...bed, bed_rent: newRent } : bed
      );
      
      // Calculate new total rent
      const newTotalRent = calculateTotalRentFromBeds(updatedBedsConfig);
      
      return {
        ...prev,
        beds_config: updatedBedsConfig,
        rent_per_bed: newTotalRent // Auto-update total rent
      };
    });
  };

  const applyRoomRentToAllBeds = () => {
    if (!formData.beds_config || formData.beds_config.length === 0) return;
    
    const numberOfBeds = formData.beds_config.length;
    const distributedRents = distributeRentEqually(formData.rent_per_bed || 0, numberOfBeds);
    
    setFormData((prev: RoomFormData) => ({
      ...prev,
      beds_config: (prev.beds_config || []).map((bed, index) => ({
        ...bed,
        bed_rent: distributedRents[index]
      }))
    }));
    
    toast.success("Room rent distributed equally to all beds");
  };

  // Create FormData object for submission
  const createFormDataForSubmission = () => {
    const formDataObj = new FormData();
    
    // Add all text fields
    formDataObj.append('property_id', formData.property_id);
    formDataObj.append('room_number', formData.room_number);
    formDataObj.append('sharing_type', formData.sharing_type);
    formDataObj.append('room_type', formData.room_type || '');
    formDataObj.append('total_beds', formData.capacity.toString());
    
    // Keep rent_per_bed as total rent (for UI consistency)
    formDataObj.append('rent_per_bed', formData.rent_per_bed.toString());
    formDataObj.append('floor', formData.floor || '');
    formDataObj.append('has_attached_bathroom', formData.has_attached_bathroom ? 'true' : 'false');
    formDataObj.append('has_balcony', formData.has_balcony ? 'true' : 'false');
    formDataObj.append('has_ac', formData.has_ac ? 'true' : 'false');
    formDataObj.append('allow_couples', formData.allow_couples ? 'true' : 'false');
    formDataObj.append('is_active', formData.is_active ? 'true' : 'false');
    formDataObj.append('amenities', JSON.stringify(formData.amenities));
    formDataObj.append('room_gender_preference', formData.room_gender_preference.join(','));
    formDataObj.append('description', formData.description || '');
    formDataObj.append('video_label', formData.video_label || '');
    formDataObj.append('photo_labels', JSON.stringify(formData.photo_labels || {}));
    formDataObj.append('videoToRemove', videoToRemove ? 'true' : 'false');
    formDataObj.append('photosToRemove', JSON.stringify(formData.photosToRemove));
    
    // Add beds_config as JSON string
    const bedsConfigJson = JSON.stringify(formData.beds_config || []);
    console.log('Adding beds_config to FormData:', bedsConfigJson);
    formDataObj.append('beds_config', bedsConfigJson);
    
    // Add photos
    if (formData.photos && formData.photos.length > 0) {
      formData.photos.forEach((photo) => {
        formDataObj.append('photos', photo);
      });
    }
    
    // Add video
    if (formData.video) {
      formDataObj.append('video', formData.video);
    }
    
    // Log all FormData entries for debugging
    console.log('FormData entries:');
    for (let pair of formDataObj.entries()) {
      if (pair[0] === 'photos' || pair[0] === 'video') {
        console.log(pair[0], pair[1] instanceof File ? pair[1].name : pair[1]);
      } else {
        console.log(pair[0], pair[1]);
      }
    }
    
    return formDataObj;
  };

  const goToNextTab = () => {
    const tabs = ['details', 'beds', 'amenities', 'photos', 'video'];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    }
  };

  const goToPrevTab = () => {
    const tabs = ['details', 'beds', 'amenities', 'photos', 'video'];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1]);
    }
  };

  const handleFormSubmit = async () => {
    try {
      if (!formData.property_id) {
        toast.error("Please select a property");
        setCurrentTab('details');
        return;
      }

      if (!formData.room_number) {
        toast.error("Please enter a room number");
        setCurrentTab('details');
        return;
      }

      if (!formData.sharing_type) {
        toast.error("Please select sharing type");
        setCurrentTab('details');
        return;
      }

      if (!formData.rent_per_bed || formData.rent_per_bed <= 0) {
        toast.error("Please enter a valid total room rent");
        setCurrentTab('details');
        return;
      }

      const invalidBeds = (formData.beds_config || []).filter(bed => !bed.bed_type);
      if (invalidBeds.length > 0) {
        toast.error(`Please select bed type for bed numbers: ${invalidBeds.map(b => b.bed_number).join(', ')}`);
        setCurrentTab('beds');
        return;
      }

      const invalidRentBeds = (formData.beds_config || []).filter(bed => !bed.bed_rent || bed.bed_rent <= 0);
      if (invalidRentBeds.length > 0) {
        toast.error(`Please enter valid rent for bed numbers: ${invalidRentBeds.map(b => b.bed_number).join(', ')}`);
        setCurrentTab('beds');
        return;
      }

      if (rooms && rooms.length > 0) {
        const selectedPropertyId = String(formData.property_id).trim();
        const newRoomNumber = String(formData.room_number).trim();
        const currentRoomId = isEditMode ? String(editingRoomId).trim() : null;
        
        const isDuplicate = rooms.some(room => {
          const roomPropertyId = String(room.property_id).trim();
          const roomNumber = String(room.room_number).trim();
          const roomId = String(room.id).trim();
          
          const isSameProperty = roomPropertyId === selectedPropertyId;
          const isSameRoomNumber = roomNumber === newRoomNumber;
          const isCurrentRoom = isEditMode ? roomId === currentRoomId : false;
          
          return isSameProperty && isSameRoomNumber && !isCurrentRoom;
        });
        
        if (isDuplicate) {
          toast.error("Room number already exists for this property. Please choose a different number.");
          setCurrentTab('details');
          return;
        }
      }

      setIsCreating(true);
      
      // Create FormData object for submission
      const formDataObj = createFormDataForSubmission();
      
      // Pass to parent onSubmit
      await onSubmit(formDataObj);
      
      toast.success(isEditMode ? "Room updated successfully!" : "Room created successfully!");
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : "Failed to create room. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };


  return (
 <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-4xl lg:max-w-5xl h-[90vh] md:h-[90vh] overflow-hidden p-0 border-0 flex flex-col rounded-2xl">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 md:px-4 md:py-3 flex-shrink-0">
          <DialogHeader className="space-y-0.5 md:space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-sm md:text-base lg:text-lg font-bold flex items-center gap-2">
                  {isEditMode ? (
                    <>
                      <Edit className="h-4 w-4 md:h-5 md:w-5" />
                      Edit Room
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 md:h-5 md:w-5" />
                      Add New Room
                    </>
                  )}
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 md:h-7 md:w-7 text-white hover:bg-white/20 rounded-full"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-100 text-[10px] md:text-xs leading-tight">
              {isEditMode ? 'Update room details, bed configurations, photos, and preferences' : 'Fill in room details, configure beds, and upload photos/video'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs 
          value={currentTab} 
          onValueChange={setCurrentTab} 
          className="px-3 py-2 md:px-4 md:py-2.5 overflow-hidden flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid grid-cols-5 mb-2 md:mb-3 h-auto gap-0.5 md:gap-1 p-0.5 md:p-1 w-full flex-shrink-0">
            <TabsTrigger value="details" className="flex flex-col md:flex-row items-center gap-0.5 md:gap-1 text-[9px] md:text-xs py-1 md:py-1.5 px-0.5 md:px-2">
              <DoorOpen className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span className="text-[8px] md:text-xs leading-tight">Details</span>
            </TabsTrigger>
            <TabsTrigger value="beds" className="flex flex-col md:flex-row items-center gap-0.5 md:gap-1 text-[9px] md:text-xs py-1 md:py-1.5 px-0.5 md:px-2">
              <BedDouble className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span className="text-[8px] md:text-xs leading-tight">Beds</span>
            </TabsTrigger>
            <TabsTrigger value="amenities" className="flex flex-col md:flex-row items-center gap-0.5 md:gap-1 text-[9px] md:text-xs py-1 md:py-1.5 px-0.5 md:px-2">
              <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span className="text-[8px] md:text-xs leading-tight">Amenities</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex flex-col md:flex-row items-center gap-0.5 md:gap-1 text-[9px] md:text-xs py-1 md:py-1.5 px-0.5 md:px-2">
              <ImageIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span className="text-[8px] md:text-xs leading-tight">Photos</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex flex-col md:flex-row items-center gap-0.5 md:gap-1 text-[9px] md:text-xs py-1 md:py-1.5 px-0.5 md:px-2">
              <Video className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span className="text-[8px] md:text-xs leading-tight">Video</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-[400px] md:min-h-[500px] relative">
            {/* Room Details Tab */}
            <TabsContent value="details" className="absolute inset-0 overflow-y-auto p-1 h-[54vh]">
              <div className="space-y-2 md:space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-0.5">
                      <Home className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      Property *
                    </Label>
                    <Select
                      value={formData.property_id}
                      onValueChange={(v) => setFormData({ ...formData, property_id: v })}
                    >
                      <SelectTrigger className="h-7 md:h-8 text-[10px] md:text-xs">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            <div className="flex items-center gap-2">
                              <Building className="h-3 w-3 md:h-4 md:w-4" />
                              <div className="flex items-center gap-3">
                                <div className="text-[10px] md:text-xs">{p.name}</div> -
                                <div className="text-[9px] md:text-[10px] truncate max-w-[200px]">{p.address}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-0.5">
                      <Layers className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      Floor
                    </Label>
                    <Select
                      value={formData.floor}
                      onValueChange={(value) => setFormData({ ...formData, floor: value })}
                      disabled={loadingMasters}
                    >
                      <SelectTrigger className="h-7 md:h-8 text-[10px] md:text-xs">
                        <SelectValue placeholder={loadingMasters ? "Loading..." : "Select floor"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingMasters ? (
                          <div className="px-2 py-1.5 text-[10px] text-gray-500 flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading...
                          </div>
                        ) : roomsMasters["Floor"]?.length > 0 ? (
                          roomsMasters["Floor"].map((floor) => (
                            <SelectItem key={floor.id} value={floor.name}>
                              <div className="flex items-center gap-2">
                                <Layers className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="text-[10px] md:text-xs">{floor.name}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Ground">Ground Floor</SelectItem>
                            <SelectItem value="1">1st Floor</SelectItem>
                            <SelectItem value="2">2nd Floor</SelectItem>
                            <SelectItem value="3">3rd Floor</SelectItem>
                            <SelectItem value="4">4th Floor</SelectItem>
                            <SelectItem value="5">5th Floor</SelectItem>
                            <SelectItem value="6">6th Floor</SelectItem>
                            <SelectItem value="7">7th Floor</SelectItem>
                            <SelectItem value="8">8th Floor</SelectItem>
                            <SelectItem value="9">9th Floor</SelectItem>
                            <SelectItem value="10">10th Floor</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-0.5">
                      <Home className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      Room Type
                    </Label>
                    <Select
                      value={formData.room_type || ""}
                      onValueChange={(value) => {
                        setFormData({ 
                          ...formData, 
                          room_type: value
                        });
                      }}
                      disabled={loadingMasters}
                    >
                      <SelectTrigger className="h-7 md:h-8 text-[10px] md:text-xs">
                        <SelectValue placeholder={loadingMasters ? "Loading..." : "Select room type"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingMasters ? (
                          <div className="px-2 py-1.5 text-[10px] text-gray-500 flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading...
                          </div>
                        ) : roomsMasters["Room Type"]?.length > 0 ? (
                          roomsMasters["Room Type"].map((type) => (
                            <SelectItem key={type.id} value={type.name}>
                              <div className="flex items-center gap-2">
                                <Home className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="text-[10px] md:text-xs">{type.name}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="corner">
                              <div className="flex items-center gap-2">
                                <Home className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="text-[10px] md:text-xs">Corner Room</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="middle">
                              <div className="flex items-center gap-2">
                                <Home className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="text-[10px] md:text-xs">Middle Room</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="end">
                              <div className="flex items-center gap-2">
                                <Home className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="text-[10px] md:text-xs">End Room</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="standard">
                              <div className="flex items-center gap-2">
                                <Home className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="text-[10px] md:text-xs">Standard Room</span>
                              </div>
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-0.5">
                      <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      Sharing Type *
                    </Label>
                    <Select
                      value={formData.sharing_type}
                      onValueChange={handleSharingTypeChange}
                      disabled={loadingMasters}
                    >
                      <SelectTrigger className="h-7 md:h-8 text-[10px] md:text-xs">
                        <SelectValue placeholder={loadingMasters ? "Loading..." : "Select type"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingMasters ? (
                          <div className="px-2 py-1.5 text-[10px] text-gray-500 flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading...
                          </div>
                        ) : roomsMasters["Sharing Type"]?.length > 0 ? (
                          roomsMasters["Sharing Type"].map((type) => {
                            const typeName = type.name.toLowerCase();
                            return (
                              <SelectItem key={type.id} value={typeName}>
                                <div className="flex items-center gap-2">
                                  <Users className="h-3 w-3 md:h-4 md:w-4" />
                                  <span className="text-[10px] md:text-xs">{type.name}</span>
                                </div>
                              </SelectItem>
                            );
                          })
                        ) : (
                          <>
                            <SelectItem value="single">
                              <div className="flex items-center gap-2">
                                <UserCircle className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                                <div className="flex items-center gap-3">
                                  <div className="text-[10px] md:text-xs">Single Occupancy</div>
                                  <div className="text-[9px] md:text-[10px]">1 bed per room</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="double">
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                                <div className="flex items-center gap-2">
                                  <div className="text-[10px] md:text-xs">Double Occupancy</div>
                                  <div className="text-[9px] md:text-[10px]">2 beds per room</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="triple">
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                                <div className="flex items-center gap-2">
                                  <div className="text-[10px] md:text-xs">Triple Occupancy</div>
                                  <div className="text-[9px] md:text-[10px]">3 beds per room</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="other">
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
                                <div className="flex items-center gap-2">
                                  <div className="text-[10px] md:text-xs">Other (Custom)</div>
                                  <div className="text-[9px] md:text-[10px]">Custom bed count</div>
                                </div>
                              </div>
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-0.5">
                      <DoorOpen className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      Room Number *
                    </Label>
                    <div className="relative">
                      <Input
                        value={formData.room_number}
                        onChange={(e) => {
                          const newRoomNumber = e.target.value;
                          setFormData({ ...formData, room_number: newRoomNumber });
                        }}
                        placeholder="e.g., 101, 202, G-01"
                        className={`h-7 md:h-8 text-[10px] md:text-xs mt-0.5 ${
                          formData.room_number && 
                          formData.property_id &&
                          rooms && 
                          rooms.length > 0 && 
                          rooms.some(room => {
                            const roomPropertyId = String(room.property_id).trim();
                            const selectedPropertyId = String(formData.property_id).trim();
                            const roomNumber = String(room.room_number).trim();
                            const newRoomNumber = String(formData.room_number).trim();
                            const currentRoomId = isEditMode ? String(editingRoomId).trim() : null;
                            const roomId = String(room.id).trim();
                            
                            const isSameProperty = roomPropertyId === selectedPropertyId;
                            const isSameRoomNumber = roomNumber === newRoomNumber;
                            const isCurrentRoom = isEditMode ? roomId === currentRoomId : false;
                            
                            return isSameProperty && isSameRoomNumber && !isCurrentRoom;
                          }) ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      
                      {formData.room_number && 
                       formData.property_id &&
                       rooms && 
                       rooms.length > 0 && 
                       rooms.some(room => {
                        const roomPropertyId = String(room.property_id).trim();
                        const selectedPropertyId = String(formData.property_id).trim();
                        const roomNumber = String(room.room_number).trim();
                        const newRoomNumber = String(formData.room_number).trim();
                        const currentRoomId = isEditMode ? String(editingRoomId).trim() : null;
                        const roomId = String(room.id).trim();
                        
                        const isSameProperty = roomPropertyId === selectedPropertyId;
                        const isSameRoomNumber = roomNumber === newRoomNumber;
                        const isCurrentRoom = isEditMode ? roomId === currentRoomId : false;
                        
                        return isSameProperty && isSameRoomNumber && !isCurrentRoom;
                       }) && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    
                    {formData.room_number && 
                     formData.property_id &&
                     rooms && 
                     rooms.length > 0 && 
                     rooms.some(room => {
                      const roomPropertyId = String(room.property_id).trim();
                      const selectedPropertyId = String(formData.property_id).trim();
                      const roomNumber = String(room.room_number).trim();
                      const newRoomNumber = String(formData.room_number).trim();
                      const currentRoomId = isEditMode ? String(editingRoomId).trim() : null;
                      const roomId = String(room.id).trim();
                      
                      const isSameProperty = roomPropertyId === selectedPropertyId;
                      const isSameRoomNumber = roomNumber === newRoomNumber;
                      const isCurrentRoom = isEditMode ? roomId === currentRoomId : false;
                      
                      return isSameProperty && isSameRoomNumber && !isCurrentRoom;
                     }) && (
                      <p className="text-[9px] md:text-[10px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-2.5 w-2.5" />
                        Room number already exists for this property. Please choose a different number.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-0.5">
                      <Bed className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      Number of Beds *
                    </Label>
                    <Input
                      type="text"
                      value={formData.capacity}
                      onChange={(e) => handleCapacityChange(e.target.value)}
                      className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5"
                      placeholder="Enter number of beds"
                    />
                    {formData.isManualCapacity && formData.sharing_type === 'other' && (
                      <p className="text-[9px] md:text-[10px] text-amber-600 mt-0.5">
                        Manual capacity for custom sharing type
                      </p>
                    )}
                  </div>

                  {/* UPDATED: Rent field with total rent logic */}
                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-0.5">
                      <BadgeIndianRupee className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      Total Room Rent (₹) *
                    </Label>
                    <Input
                      type="text"
                      value={formData.rent_per_bed}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? '' : parseFloat(value);
                        const newTotalRent = isNaN(numValue as number) ? 0 : (numValue as number);
                        
                        setFormData((prev: RoomFormData) => {
                          // Distribute new total rent to all beds
                          const distributedRents = distributeRentEqually(
                            newTotalRent, 
                            prev.beds_config?.length || prev.capacity || 1
                          );
                          
                          // Update beds with new rents
                          const updatedBedsConfig = (prev.beds_config || []).map((bed, index) => ({
                            ...bed,
                            bed_rent: distributedRents[index] || bed.bed_rent
                          }));
                          
                          return {
                            ...prev,
                            rent_per_bed: newTotalRent,
                            beds_config: updatedBedsConfig
                          };
                        });
                      }}
                      placeholder="Enter total room rent"
                      className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5"
                    />
                    {formData.beds_config && formData.beds_config.length > 0 && (
                      <div className="mt-1 text-[9px] md:text-[10px] text-gray-500 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Average per bed: ₹{Math.round((formData.rent_per_bed || 0) / formData.beds_config.length)}
                      </div>
                    )}
                    {(formData.beds_config?.length || 0) > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={applyRoomRentToAllBeds}
                        className="mt-1 h-6 text-[9px] md:text-[10px] w-full"
                      >
                        <Wallet className="h-3 w-3 mr-1" />
                        Distribute equally to all beds
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-0.5">
                      <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      Gender Preferences (Select Multiple)
                    </Label>
                    
                    <div className="relative">
                      <Select>
                        <SelectTrigger className="h-7 md:h-8 text-[10px] md:text-xs">
                          <SelectValue placeholder="Select gender preferences">
                            {formData.room_gender_preference.length > 0 
                              ? `${formData.room_gender_preference.length} selected` 
                              : "Select gender preferences"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_PREFERENCES.map((pref) => (
                            <div
                              key={pref.value}
                              className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleGenderPreference(pref.value);
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={formData.room_gender_preference.includes(pref.value)}
                                onChange={() => toggleGenderPreference(pref.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-3.5 w-3.5 rounded border-gray-300 cursor-pointer"
                              />
                              <div className={`${pref.iconColor}`}>
                                {pref.icon}
                              </div>
                              <span className="text-[10px] md:text-xs">{pref.label}</span>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData.room_gender_preference.length > 0 && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <p className="text-[9px] md:text-[10px] font-medium text-gray-700 mb-1.5">Selected Preferences:</p>
                        <div className="flex flex-wrap gap-1 md:gap-1.5">
                          {formData.room_gender_preference.map(pref => {
                            const prefConfig = GENDER_PREFERENCES.find(p => p.value === pref);
                            return (
                              <Badge key={pref} className={`${prefConfig?.color} text-[8px] md:text-[9px] px-1.5 py-0.5 flex items-center gap-0.5`}>
                                {prefConfig?.icon}
                                <span>{prefConfig?.label}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGenderPreference(pref);
                                  }}
                                  className="ml-0.5 text-gray-400 hover:text-red-500"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 pb-8">
        <Label htmlFor="is_active" className="text-[10px] md:text-xs cursor-pointer">
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
            className={`block w-10 h-5 md:w-12 md:h-6 rounded-full cursor-pointer ${
              formData.is_active ? 'bg-green-500' : 'bg-gray-300'
            }`}
            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
          >
            <div
              className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 md:w-5 md:h-5 rounded-full transition-transform ${
                formData.is_active ? 'transform translate-x-5 md:translate-x-6' : ''
              }`}
            />
          </div>
        </div>
      </div>
                </div>

                <div className="space-y-1.5 md:space-y-2 mt-2 md:mt-3">
                  <Label htmlFor="description" className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-0.5">
                    <Edit className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    Room Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the room, its features, view, etc."
                    rows={5}
                    className="resize-none text-[10px] md:text-xs min-h-12 md:min-h-14 mt-0.5"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Beds Configuration Tab */}
            <TabsContent value="beds" className="absolute inset-0 overflow-y-auto p-1 h-[54vh]">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1">
                    <BedDouble className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    Configure Beds ({formData.beds_config?.length || 0} {(formData.beds_config?.length || 0) === 1 ? 'Bed' : 'Beds'})
                  </Label>
                  <Badge variant="outline" className="text-[9px] md:text-[10px]">
                    Total Rent: ₹{(formData.beds_config || []).reduce((sum, bed) => sum + Number(bed.bed_rent || 0), 0)}
                  </Badge>
                </div>
                
                <p className="text-[9px] md:text-[10px] text-gray-500">
                  Configure each bed individually - changing individual bed rent will automatically update the total room rent
                </p>

                {(!formData.beds_config || formData.beds_config.length === 0) ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Bed className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-xs font-medium text-gray-700">No beds configured</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Set the number of beds in the Details tab to configure beds
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {formData.beds_config.map((bed, index) => (
                      <div 
                        key={bed.bed_number} 
                        className={`border rounded-lg p-3 ${
                          !bed.bed_type ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded-full ${
                            !bed.bed_type ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            <Bed className={`h-3.5 w-3.5 ${
                              !bed.bed_type ? 'text-red-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <span className="text-xs font-medium">Bed #{bed.bed_number}</span>
                          {!bed.bed_type && (
                            <Badge variant="destructive" className="text-[8px] px-1 py-0">
                              Required
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <Label className="text-[9px] font-medium mb-1 block">
                              Bed Type *
                            </Label>
                            <Select
                              value={bed.bed_type}
                              onValueChange={(value) => handleBedTypeChange(bed.bed_number, value)}
                            >
                              <SelectTrigger className="h-7 text-[10px]">
                                <SelectValue placeholder="Select bed type" />
                              </SelectTrigger>
                              <SelectContent>
                                {loadingMasters ? (
                                  <div className="px-2 py-1.5 text-[10px] text-gray-500 flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Loading...
                                  </div>
                                ) : roomsMasters["Bed Type"]?.length > 0 ? (
                                  roomsMasters["Bed Type"].map((type) => (
                                    <SelectItem key={type.id} value={type.name}>
                                      <div className="flex items-center gap-2">
                                        <Bed className="h-3 w-3" />
                                        <span className="text-[10px]">{type.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))
                                ) : (
                                  <>
                                    <SelectItem value="single">Single Bed</SelectItem>
                                    <SelectItem value="double">Double Bed</SelectItem>
                                    <SelectItem value="queen">Queen Size</SelectItem>
                                    <SelectItem value="king">King Size</SelectItem>
                                    <SelectItem value="bunk">Bunk Bed</SelectItem>
                                    <SelectItem value="trundle">Trundle Bed</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-[9px] font-medium mb-1 block">
                              Bed Rent (₹) *
                            </Label>
                            <Input
                              type="text"
                              value={bed.bed_rent || ''}
                              onChange={(e) => handleBedRentChange(bed.bed_number, e.target.value)}
                              placeholder="Enter bed rent"
                              className="h-7 text-[10px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </TabsContent>


        {/* Photos Tab */}
        <TabsContent value="photos" className="absolute inset-0 overflow-y-auto p-1 h-[54vh]">
          <div className="space-y-2 md:space-y-3">
            <div>
              <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-2">
                <ImageIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
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
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center hover:border-cyan-400 hover:bg-cyan-50 transition-colors cursor-pointer mb-3 md:mb-4"
              >
                <Upload className="h-8 w-8 md:h-10 md:w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">Upload Room Photos</p>
                <p className="text-[10px] md:text-xs text-gray-600 mb-2 md:mb-3">
                  Click to browse or drag & drop photos here
                </p>
                <UploadButton 
                  type="photo"
                  onClick={handleFileClick}
                  isDisabled={isFileDialogOpen}
                  isProcessing={isFileDialogOpen}
                />
                <p className="text-[9px] md:text-[10px] text-gray-500 mt-2">
                  Maximum 10 photos, 5MB each. Add labels to identify each image.
                </p>
              </div>

              {isEditMode && formData.existingPhotos.length > 0 && (
                <div className="mb-3 md:mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1">
                      <ImageIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      Existing Photos ({formData.existingPhotos.length})
                    </Label>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openExistingGallery}
                        className="h-6 md:h-7 text-[10px] md:text-xs px-2"
                      >
                        <Eye className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                        View Gallery
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
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
                              }}
                            />
                          </div>
                          <Button
                            size="sm"
                            variant={isMarkedForRemoval ? "outline" : "destructive"}
                            className="absolute -top-1 -right-1 h-5 w-5 md:h-6 md:w-6 p-0 rounded-full z-10"
                            onClick={() => isMarkedForRemoval ? 
                              setFormData({
                                ...formData,
                                photosToRemove: formData.photosToRemove.filter(url => url !== photo.url)
                              }) : 
                              removeExistingPhoto(photo.url)
                            }
                          >
                            {isMarkedForRemoval ? (
                              <Plus className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            ) : (
                              <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            )}
                          </Button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                            <p className="text-[9px] md:text-[10px] text-white truncate">
                              {labelIcons[photo.label || 'Room View'] || <ImageIcon className="h-2.5 w-2.5 md:h-3 md:w-3 inline mr-0.5" />}
                              {photo.label || 'Room View'}
                            </p>
                          </div>
                          {isMarkedForRemoval && (
                            <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center rounded-lg">
                              <Badge variant="destructive" className="text-[9px] md:text-[10px] px-1.5 py-0.5">
                                <Trash2 className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5" />
                                Removing
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
                  <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-2">
                    <Upload className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    New Photos ({formData.photos.length})
                  </Label>
                  <div className="space-y-2 md:space-y-3">
                    {formData.photos.map((file, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-2 md:gap-3 p-2 md:p-3 border rounded-lg bg-gray-50">
                        <div className="md:w-32 md:h-32 w-full h-32 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-1.5 md:space-y-2">
                          <div>
                            <Label htmlFor={`photo-label-${index}`} className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-0.5">
                              <Edit className="h-2.5 w-2.5 md:h-3 md:w-3" />
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
                              placeholder="e.g., Room View, Bathroom, Balcony"
                              className="h-6 md:h-7 text-[10px] md:text-xs mt-0.5"
                            />
                            <p className="text-[9px] md:text-[10px] text-gray-500 mt-0.5">
                              Label helps tenants understand what this image shows
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-[10px] md:text-xs text-gray-600">
                              <p className="font-medium truncate max-w-[150px]">{file.name}</p>
                              <p className="text-[9px] md:text-[10px]">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNewFile(index)}
                              className="text-red-600 hover:text-red-700 h-6 md:h-7 text-[10px] md:text-xs px-2"
                            >
                              <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5 mr-0.5" />
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
          </div>
        </TabsContent>

        {/* Video Tab */}
        <TabsContent value="video" className="absolute inset-0 overflow-y-auto p-1 h-[54vh]">
          <div className="space-y-2 md:space-y-3">
            <div>
              <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-2">
                <Video className="h-3 w-3 md:h-3.5 md:w-3.5" />
                Room Video Walkthrough
              </Label>
              
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
              
              {isEditMode && existingVideoUrl && !videoToRemove && (
                <div className="mb-3 md:mb-4">
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-2 relative group">
                    <video
                      src={existingVideoUrl}
                      controls
                      className="w-full h-full"
                      onError={(e:any) => {
                        console.error('Video failed to load:', existingVideoUrl);
                        const correctedUrl = existingVideoUrl.replace('uploads/videos/', 'uploads/rooms/videos/');
                        e.target.src = correctedUrl;
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[9px] md:text-[10px] text-white flex items-center gap-0.5">
                        <Video className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        {formData.existingVideo?.label || 'Room Video Walkthrough'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 md:p-2.5 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-[10px] md:text-xs font-medium">Current Video</p>
                      <p className="text-[9px] md:text-[10px] text-gray-600">
                        {formData.existingVideo?.label || 'Room Video Walkthrough'}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={removeExistingVideo}
                      className="h-6 md:h-7 text-[10px] md:text-xs px-2"
                    >
                      <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5 mr-0.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
              
              {formData.video ? (
                <div className="space-y-2 md:space-y-3">
                  <div className="relative">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        src={URL.createObjectURL(formData.video)}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={removeVideo}
                        className="h-6 md:h-7 text-[10px] md:text-xs px-2 bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5 mr-0.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-2 md:p-3 border rounded-lg bg-gray-50 space-y-2">
                    <div>
                      <Label htmlFor="video-label-input" className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-0.5">
                        <Edit className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        Video Label (Optional)
                      </Label>
                      <Input
                        id="video-label-input"
                        value={formData.video_label}
                        onChange={(e) => setFormData({ ...formData, video_label: e.target.value })}
                        placeholder="e.g., Room Walkthrough, Complete Tour"
                        className="h-6 md:h-7 text-[10px] md:text-xs mt-0.5"
                      />
                      <p className="text-[9px] md:text-[10px] text-gray-500 mt-0.5">
                        Label helps identify what this video shows
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-1.5 border-t">
                      <div>
                        <p className="text-[10px] md:text-xs font-medium">
                          <Video className="h-3 w-3 md:h-3.5 md:w-3.5 inline mr-1" />
                          New Video: {formData.video.name}
                        </p>
                        <p className="text-[9px] md:text-[10px] text-gray-500">
                          {(formData.video.size / (1024 * 1024)).toFixed(2)} MB • {formData.video.type}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                (!isEditMode || !existingVideoUrl || videoToRemove) && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center hover:border-cyan-400 hover:bg-cyan-50 transition-colors cursor-pointer">
                    <Video className="h-10 w-10 md:h-12 md:w-12 mx-auto text-gray-400 mb-2 md:mb-3" />
                    <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">
                      {isEditMode && videoToRemove ? 'Upload Replacement Video' : 'Upload Room Video'}
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-600 mb-2 md:mb-3">
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
          </div>
        </TabsContent>

        {/* Amenities Tab */}
        <TabsContent value="amenities" className="absolute inset-0 overflow-y-auto p-1 h-[54vh]">
          <div className="space-y-2 md:space-y-3">
            <div className="space-y-3 md:space-y-4">
              <div>
                <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-2">
                  <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  Select Amenities
                </Label>
                <p className="text-[10px] md:text-xs text-gray-500 mb-2 md:mb-3">Choose amenities available in this room</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5 md:gap-2">
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <div
                      key={amenity.id}
                      className={`p-2 md:p-2.5 border rounded-lg cursor-pointer transition-all ${
                        formData.amenities.includes(amenity.label)
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleAmenity(amenity.label)}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={`rounded ${
                          formData.amenities.includes(amenity.label)
                            ? 'bg-cyan-100 text-cyan-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {amenity.icon}
                        </div>
                        <span className="text-[9px] md:text-[10px] font-medium">{amenity.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1">
                  <Plus className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  Add Custom Amenities
                </Label>
                <p className="text-[10px] md:text-xs text-gray-500 mb-1.5">Add amenities not listed above</p>
                
                <div className="flex gap-1.5">
                  <Input
                    ref={amenityInputRef}
                    value={formData.customAmenityInput}
                    onChange={(e) => setFormData({ ...formData, customAmenityInput: e.target.value })}
                    onKeyPress={handleAmenityKeyPress}
                    placeholder="Enter amenity name"
                    className="flex-1 h-6 md:h-7 text-[10px] md:text-xs"
                  />
                  <Button 
                    type="button" 
                    onClick={addCustomAmenity}
                    className="bg-cyan-600 hover:bg-cyan-700 h-6 md:h-7 text-[10px] md:text-xs px-2"
                  >
                    <Plus className="h-3 w-3 md:h-3.5 md:w-3.5 mr-0.5" />
                    Add
                  </Button>
                </div>
                
                {formData.amenities.length > 0 && (
                  <div className="mt-2 md:mt-3">
                    <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-1.5">
                      <CheckCircle className="h-3 w-3 md:h-3.5 md:w-3.5 text-green-600" />
                      Selected Amenities ({formData.amenities.length})
                    </Label>
                    <div className="flex flex-wrap gap-1 md:gap-1.5 p-2 md:p-3 border border-gray-200 rounded-lg bg-gray-50">
                      {formData.amenities.map((amenity, index) => {
                        const isPredefined = AMENITIES_OPTIONS.some(opt => opt.label === amenity);
                        const isCustom = !isPredefined;
                        
                        return (
                          <Badge 
                            key={index} 
                            variant="outline"
                            className={`flex items-center gap-0.5 py-0.5 px-1.5 md:py-1 md:px-2 text-[9px] md:text-[10px] ${
                              isCustom 
                                ? 'bg-purple-50 border-purple-200 text-purple-700' 
                                : 'bg-white border-gray-300 text-gray-700'
                            }`}
                          >
                            {isCustom ? (
                              <>
                                <Plus className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                <span className="font-medium">Custom: </span>
                              </>
                            ) : (
                              AMENITIES_OPTIONS.find(opt => opt.label === amenity)?.icon
                            )}
                            <span>{amenity}</span>
                            <button
                              type="button"
                              onClick={() => removeAmenity(amenity)}
                              className="ml-0.5 text-gray-400 hover:text-red-500 focus:outline-none"
                            >
                              <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formData.amenities.length === 0 && (
                  <div className="text-center py-4 md:py-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <Sparkles className="h-8 w-8 md:h-10 md:w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">No amenities selected yet</p>
                    <p className="text-[10px] md:text-xs text-gray-500">
                      Select amenities from above or add custom ones
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 md:pt-3 border-t">
                <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-2">
                  <Home className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  Basic Room Features
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                  <div className={`flex items-center gap-2 p-2 md:p-3 border rounded-lg cursor-pointer ${
                    formData.has_ac ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
                  }`}
                  onClick={() => setFormData({ ...formData, has_ac: !formData.has_ac })}>
                    <div className={`p-1.5 rounded-lg ${
                      formData.has_ac ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Wind className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="has_ac" className="cursor-pointer text-[10px] md:text-xs font-medium">
                        Air Conditioner
                      </Label>
                      <p className="text-[9px] md:text-[10px] text-gray-500">Room has AC</p>
                    </div>
                    <input
                      type="checkbox"
                      id="has_ac"
                      checked={formData.has_ac}
                      onChange={(e) => setFormData({ ...formData, has_ac: e.target.checked })}
                      className="h-4 w-4 md:h-5 md:w-5"
                    />
                  </div>

                  <div className={`flex items-center gap-2 p-2 md:p-3 border rounded-lg cursor-pointer ${
                    formData.has_balcony ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
                  }`}
                  onClick={() => setFormData({ ...formData, has_balcony: !formData.has_balcony })}>
                    <div className={`p-1.5 rounded-lg ${
                      formData.has_balcony ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Maximize className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="has_balcony" className="cursor-pointer text-[10px] md:text-xs font-medium">
                        Balcony
                      </Label>
                      <p className="text-[9px] md:text-[10px] text-gray-500">Room has balcony</p>
                    </div>
                    <input
                      type="checkbox"
                      id="has_balcony"
                      checked={formData.has_balcony}
                      onChange={(e) => setFormData({ ...formData, has_balcony: e.target.checked })}
                      className="h-4 w-4 md:h-5 md:w-5"
                    />
                  </div>

                  <div className={`flex items-center gap-2 p-2 md:p-3 border rounded-lg cursor-pointer ${
                    formData.has_attached_bathroom ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
                  }`}
                  onClick={() => setFormData({ ...formData, has_attached_bathroom: !formData.has_attached_bathroom })}>
                    <div className={`p-1.5 rounded-lg ${
                      formData.has_attached_bathroom ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Bath className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="has_bathroom" className="cursor-pointer text-[10px] md:text-xs font-medium">
                        Attached Bathroom
                      </Label>
                      <p className="text-[9px] md:text-[10px] text-gray-500">Private bathroom</p>
                    </div>
                    <input
                      type="checkbox"
                      id="has_bathroom"
                      checked={formData.has_attached_bathroom}
                      onChange={(e) => setFormData({ ...formData, has_attached_bathroom: e.target.checked })}
                      className="h-4 w-4 md:h-5 md:w-5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>

    <Separator className="my-2 md:my-3 flex-shrink-0" />

    {/* <div className="flex items-center justify-between p-2 md:p-2.5 mx-3 md:mx-4 bg-gray-50 rounded-lg flex-shrink-0">
      <div className="flex items-center gap-1.5">
        <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${
          formData.is_active ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-[10px] md:text-xs font-medium">
          {formData.is_active ? 'Room is Active' : 'Room is Inactive'}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Label htmlFor="is_active" className="text-[10px] md:text-xs cursor-pointer">
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
            className={`block w-10 h-5 md:w-12 md:h-6 rounded-full cursor-pointer ${
              formData.is_active ? 'bg-green-500' : 'bg-gray-300'
            }`}
            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
          >
            <div
              className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 md:w-5 md:h-5 rounded-full transition-transform ${
                formData.is_active ? 'transform translate-x-5 md:translate-x-6' : ''
              }`}
            />
          </div>
        </div>
      </div>
    </div> */}

    <DialogFooter className="w-full sticky bottom-0 bg-white border-t px-3 py-2 md:px-4 md:py-2.5 ">
      <div className="flex w-full gap-1.5 md:gap-2">
        <div className="flex w-full justify-between gap-1.5 md:gap-2">
          <Button 
            variant="outline" 
            onClick={goToPrevTab}
            disabled={currentTab === 'details' || isCreating}
            className="h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3"
          >
            <ArrowRight className="h-3 w-3 md:h-4 md:w-4 rotate-180 mr-1" />
            Previous
          </Button>

          <div>
            {currentTab !== 'video' ? (
              <Button 
                variant="outline" 
                onClick={goToNextTab}
                className="h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3 bg-cyan-200 hover:bg-cyan-700 border-cyan-200"
              >
                Next
                <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={handleFormSubmit}
                disabled={isCreating}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3"
              >
                {isCreating ? (
                  <>
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1 md:mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : isEditMode ? (
                  <>
                    <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Update Room
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Create Room
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
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