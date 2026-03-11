// components/admin/rooms/room-form.tsx
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Wallet,
  Utensils,
  ShieldCheck,
  Zap,
  Package,
  Star,
  Music,
  Camera,
  Globe,
  Clock,
  Key,
  Shirt,
  Sofa,
  Monitor,
  Gamepad2,
  FlameKindling,
  WashingMachine,
  UtensilsCrossed,
  AirVent,
  ParkingCircle,
  Flower2,
  Baby,
  Bike,
  MoveVertical,
  Flame
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
  getExistingRoomsCount?: (propertyId: string) => number;
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

const getCustomAmenityIcon = (label: string): React.ReactNode => {
  const l = label.toLowerCase();
  if (l.includes('wash') || l.includes('laundry') || l.includes('machine')) return <WashingMachine className="h-3 w-3" />;
  if (l.includes('lift') || l.includes('elevator')) return <MoveVertical className="h-3 w-3" />;
  if (l.includes('microwave') || l.includes('oven') || l.includes('induction')) return <Flame className="h-3 w-3" />;
  if (l.includes('fan') || l.includes('exhaust')) return <Fan className="h-3 w-3" />;
  if (l.includes('fire') || l.includes('extinguish') || l.includes('safety') || l.includes('alarm') || l.includes('sprinkler')) return <ShieldCheck className="h-3 w-3" />;
  if (l.includes('park') || l.includes('car')) return <ParkingCircle className="h-3 w-3" />;
  if (l.includes('gym') || l.includes('fitness') || l.includes('dumbbell')) return <Dumbbell className="h-3 w-3" />;
  if (l.includes('kitchen') || l.includes('cook')) return <UtensilsCrossed className="h-3 w-3" />;
  if (l.includes('food') || l.includes('meal') || l.includes('dining')) return <Utensils className="h-3 w-3" />;
  if (l.includes('security') || l.includes('cctv') || l.includes('safe') || l.includes('guard')) return <ShieldCheck className="h-3 w-3" />;
  if (l.includes('power') || l.includes('backup') || l.includes('generator') || l.includes('electric')) return <Zap className="h-3 w-3" />;
  if (l.includes('sofa') || l.includes('lounge') || l.includes('sitting')) return <Sofa className="h-3 w-3" />;
  if (l.includes('bike') || l.includes('cycle')) return <Bike className="h-3 w-3" />;
  if (l.includes('garden') || l.includes('plant') || l.includes('flower')) return <Flower2 className="h-3 w-3" />;
  if (l.includes('music') || l.includes('speaker') || l.includes('audio')) return <Music className="h-3 w-3" />;
  if (l.includes('camera') || l.includes('photo')) return <Camera className="h-3 w-3" />;
  if (l.includes('monitor') || l.includes('screen') || l.includes('television')) return <Monitor className="h-3 w-3" />;
  if (l.includes('game') || l.includes('play')) return <Gamepad2 className="h-3 w-3" />;
  if (l.includes('key') || l.includes('lock') || l.includes('access')) return <Key className="h-3 w-3" />;
  if (l.includes('cloth') || l.includes('dress') || l.includes('shirt')) return <Shirt className="h-3 w-3" />;
  if (l.includes('internet') || l.includes('web') || l.includes('broadband')) return <Globe className="h-3 w-3" />;
  if (l.includes('clock') || l.includes('time') || l.includes('hour')) return <Clock className="h-3 w-3" />;
  if (l.includes('coffee') || l.includes('tea') || l.includes('cafe')) return <Coffee className="h-3 w-3" />;
  if (l.includes('baby') || l.includes('child') || l.includes('kid')) return <Baby className="h-3 w-3" />;
  if (l.includes('air') || l.includes('ventilat') || l.includes('cool')) return <AirVent className="h-3 w-3" />;
  if (l.includes('storage') || l.includes('box') || l.includes('locker')) return <Package className="h-3 w-3" />;
  if (l.includes('grill') || l.includes('barbecue') || l.includes('bbq')) return <FlameKindling className="h-3 w-3" />;
  if (l.includes('star') || l.includes('premium') || l.includes('luxury')) return <Star className="h-3 w-3" />;
  return <Sparkles className="h-3 w-3" />;
};

const UploadButton = ({
  type, onClick, isDisabled, isProcessing
}: {
  type: 'photo' | 'video'; onClick: () => void; isDisabled: boolean; isProcessing: boolean;
}) => (
  <Button variant="outline" type="button" onClick={onClick} disabled={isProcessing || isDisabled}
    className={`h-6 md:h-7 text-[10px] md:text-xs ${type === 'video' ? 'mt-2' : ''}`}>
    {type === 'photo'
      ? <><ImageIcon className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />{isProcessing ? 'Opening...' : 'Browse Photos'}</>
      : <><Video className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />{isProcessing ? 'Opening...' : 'Select Video File'}</>
    }
  </Button>
);

const calculateTotalRentFromBeds = (beds: BedConfig[]) =>
  beds.reduce((s, b) => s + (Number(b.bed_rent) || 0), 0);

const distributeRentEqually = (total: number, count: number): number[] => {
  if (count === 0) return [];
  const base = Math.floor(total / count);
  const rem = total - base * count;
  return Array.from({ length: count }, (_, i) => i < rem ? base + 1 : base);
};

const generateFloorOptions = (totalFloors: number | string | undefined | null): string[] => {
  const num = parseInt(String(totalFloors || '0'));
  if (!num || num <= 0) return [];
  return Array.from({ length: num }, (_, i) => String(i + 1));
};

const F = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-0.5">
    <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide block">
      {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

export function RoomForm({
  open,
  onOpenChange,
  isEditMode,
  formData,
  setFormData,
  onSubmit,
  properties,
  rooms = [],
  editingRoomId,
  getExistingRoomsCount
}: RoomFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const amenityInputRef = useRef<HTMLInputElement>(null);

  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<Array<{url:string;label?:string;type:'photo'|'video'}>>([]);
  const [currentTab, setCurrentTab] = useState('details');
  const [existingVideoUrl, setExistingVideoUrl] = useState<string|null>(null);
  const [videoToRemove, setVideoToRemove] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [roomsMasters, setRoomsMasters] = useState<Record<string, MasterValue[]>>({});
  const [loadingMasters, setLoadingMasters] = useState(false);

  // Room limit state
  const [roomLimitReached, setRoomLimitReached] = useState(false);

  // ─── KEY CHANGE: bedRentInputs — controlled string state per bed ─────────────
  const [bedRentInputs, setBedRentInputs] = useState<Record<number, string>>({});

  // Derived: sum of all bedRentInputs (updates instantly on every keystroke)
  const liveTotalRent = Object.values(bedRentInputs).reduce((s, v) => s + (parseFloat(v) || 0), 0);

  const fileDialogTimeoutRef = useRef<NodeJS.Timeout>();
  const videoDialogTimeoutRef = useRef<NodeJS.Timeout>();
  const hasInitializedRef = useRef(false);

  const selectedProperty = properties.find(p => String(p.id) === String(formData.property_id));
  const propertyFloorOptions = generateFloorOptions(selectedProperty?.floor);

  // Get original property ID for edit mode
  const originalPropertyId = useMemo(() => {
    if (!isEditMode || !editingRoomId || !rooms.length) return null;
    const room = rooms.find(r => r.id.toString() === editingRoomId.toString());
    return room?.property_id?.toString() || null;
  }, [isEditMode, editingRoomId, rooms]);

  // Check room limit when property changes
  useEffect(() => {
    if (formData.property_id && getExistingRoomsCount) {
      const propertyTotalRooms = selectedProperty?.total_rooms || 0;
      const existingCount = getExistingRoomsCount(String(formData.property_id));
      
      if (isEditMode) {
        // In edit mode, check if we're trying to change to a property that's at limit
        // But allow editing if it's the same property (the room already exists there)
        const isChangingProperty = originalPropertyId && originalPropertyId !== formData.property_id;
        
        if (propertyTotalRooms > 0 && existingCount >= propertyTotalRooms && isChangingProperty) {
          setRoomLimitReached(true);
          toast.error(`This property has reached its maximum room limit (${propertyTotalRooms} rooms). Cannot move room to this property.`);
        } else {
          setRoomLimitReached(false);
        }
      } else {
        // For new rooms, disable if property is at limit
        if (propertyTotalRooms > 0 && existingCount >= propertyTotalRooms) {
          setRoomLimitReached(true);
          toast.error(`This property has reached its maximum room limit (${propertyTotalRooms} rooms). Cannot add more rooms.`);
        } else {
          setRoomLimitReached(false);
        }
      }
    } else {
      setRoomLimitReached(false);
    }
  }, [formData.property_id, selectedProperty, isEditMode, getExistingRoomsCount, originalPropertyId]);

  // ─── Sync bedRentInputs from beds array ──────────────────────────────────────
  const syncBedRentInputs = useCallback((beds: BedConfig[]) => {
    const inputs: Record<number, string> = {};
    beds.forEach(b => {
      inputs[b.bed_number] = b.bed_rent === 0 ? '' : String(b.bed_rent);
    });
    setBedRentInputs(inputs);
  }, []);

  // ── Init beds_config ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!formData.beds_config) setFormData((p: RoomFormData) => ({ ...p, beds_config: [] }));
  }, []);

  // ── Fetch masters ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setLoadingMasters(true);
    consumeMasters({ tab: 'Rooms' })
      .then(res => {
        if (res?.success && res.data) {
          const grouped: Record<string, MasterValue[]> = {};
          res.data.forEach((item: any) => {
            const t = item.type_name;
            if (!grouped[t]) grouped[t] = [];
            grouped[t].push({ id: item.value_id, name: item.value_name, isactive: 1 });
          });
          setRoomsMasters(grouped);
        }
      })
      .catch(e => console.error('Failed to fetch rooms masters:', e))
      .finally(() => setLoadingMasters(false));
  }, [open]);

  // ── Match masters after load (edit mode) ─────────────────────────────────────
  useEffect(() => {
    if (!isEditMode || !open || !Object.keys(roomsMasters).length) return;
    setFormData((prev: RoomFormData) => {
      const next = { ...prev };
      if (prev.room_type && roomsMasters['Room Type']) {
        const m = roomsMasters['Room Type'].find(t => t.name.toLowerCase() === prev.room_type?.toLowerCase());
        if (m) next.room_type = m.name;
      }
      if (prev.floor && roomsMasters['Floor']) {
        const m = roomsMasters['Floor'].find(f => f.name.toLowerCase() === prev.floor?.toLowerCase());
        if (m) next.floor = m.name;
      }
      if (prev.sharing_type && roomsMasters['Sharing Type']) {
        const m = roomsMasters['Sharing Type'].find(t => t.name.toLowerCase() === prev.sharing_type?.toLowerCase());
        if (m) next.sharing_type = m.name.toLowerCase();
      }
      return next;
    });
  }, [roomsMasters, isEditMode, open]);

  // ── Load edit data ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode && open && rooms.length > 0 && !hasInitializedRef.current) {
      const editingRoom = rooms.find(r => r.id.toString() === editingRoomId.toString());
      if (!editingRoom) return;

      const existingPhotos = processPhotoUrls(editingRoom.photo_urls);
      let existingVideo: any = null;
      if (editingRoom?.video_url && editingRoom.video_url !== 'null') {
        existingVideo = { url: getMediaUrl(editingRoom.video_url, 'video'), label: 'Room Video Walkthrough' };
      }

      const genderPreferences = editingRoom.room_gender_preference
        ? Array.isArray(editingRoom.room_gender_preference)
          ? editingRoom.room_gender_preference.map((g: any) => g.trim())
          : typeof editingRoom.room_gender_preference === 'string'
            ? editingRoom.room_gender_preference.split(',').map((g: any) => g.trim()).filter(Boolean)
            : []
        : [];

      const capacity = editingRoom.beds_config?.length || editingRoom.bed_assignments?.length || editingRoom.total_bed || 0;
      const sharingType = editingRoom.sharing_type || '';
      const defCap = sharingTypeToCapacity[sharingType] || 2;
      const isManual = sharingType === 'other' || capacity !== defCap;

      setExistingVideoUrl(existingVideo?.url || null);
      setVideoToRemove(false);

      let bedsConfig: BedConfig[] = [];
      let totalRent = 0;

      if (editingRoom.beds_config?.length) {
        bedsConfig = editingRoom.beds_config.map((bed: any) => ({
          bed_number: bed.bed_number, bed_type: bed.bed_type || '', bed_rent: Number(bed.bed_rent) || 0,
        }));
        totalRent = calculateTotalRentFromBeds(bedsConfig);
      } else if (editingRoom.bed_assignments?.length) {
        bedsConfig = editingRoom.bed_assignments.map((bed: any) => ({
          bed_number: bed.bed_number, bed_type: bed.bed_type || '',
          bed_rent: Number(bed.tenant_rent) || Number(editingRoom.rent_per_bed) || 0,
        }));
        totalRent = calculateTotalRentFromBeds(bedsConfig);
      } else {
        bedsConfig = Array.from({ length: capacity }, (_, i) => ({
          bed_number: i + 1, bed_type: '', bed_rent: Number(editingRoom.rent_per_bed) || 0,
        }));
        totalRent = Number(editingRoom.rent_per_bed) * capacity || 0;
      }

      setFormData((prev: any) => ({
        ...prev,
        property_id: editingRoom.property_id.toString(),
        room_number: editingRoom.room_number.toString(),
        sharing_type: sharingType,
        room_type: editingRoom.room_type || '',
        capacity,
        rent_per_bed: totalRent,
        floor: editingRoom.floor ? editingRoom.floor.toString() : '',
        has_attached_bathroom: Boolean(editingRoom.has_attached_bathroom),
        has_balcony: Boolean(editingRoom.has_balcony),
        has_ac: Boolean(editingRoom.has_ac),
        amenities: editingRoom.amenities || [],
        video_label: '', video: null,
        room_gender_preference: genderPreferences,
        allow_couples: Boolean(editingRoom.allow_couples),
        is_active: Boolean(editingRoom.is_active),
        existingPhotos, existingVideo,
        photosToRemove: [],
        isManualCapacity: isManual,
        description: editingRoom.description || '',
        beds_config: bedsConfig,
      }));

      syncBedRentInputs(bedsConfig);
      hasInitializedRef.current = true;
    }

    if (!open) {
      setExistingVideoUrl(null);
      setVideoToRemove(false);
      setIsFileDialogOpen(false);
      setIsVideoDialogOpen(false);
      setBedRentInputs({});
      hasInitializedRef.current = false;
    }
  }, [isEditMode, open, rooms, editingRoomId, setFormData, syncBedRentInputs]);

  // ── Capacity change → redistribute + rebuild beds ────────────────────────────
  useEffect(() => {
    const current = formData.beds_config || [];
    if (formData.capacity === current.length || formData.capacity <= 0) return;

    const rents = distributeRentEqually(formData.rent_per_bed || 0, formData.capacity);
    let updatedBeds: BedConfig[];

    if (formData.capacity > current.length) {
      updatedBeds = Array.from({ length: formData.capacity }, (_, i) =>
        i < current.length ? { ...current[i], bed_rent: rents[i] } : { bed_number: i + 1, bed_type: '', bed_rent: rents[i] || 0 }
      );
    } else {
      updatedBeds = current.slice(0, formData.capacity).map((b, i) => ({ ...b, bed_rent: rents[i] }));
      const newTotal = calculateTotalRentFromBeds(updatedBeds);
      setFormData((p: RoomFormData) => ({ ...p, beds_config: updatedBeds, rent_per_bed: newTotal }));
      syncBedRentInputs(updatedBeds);
      return;
    }

    setFormData((p: RoomFormData) => ({ ...p, beds_config: updatedBeds }));
    syncBedRentInputs(updatedBeds);
  }, [formData.capacity]);

  // ── Cleanup ──────────────────────────────────────────────────────────────────
  useEffect(() => () => {
    if (fileDialogTimeoutRef.current) clearTimeout(fileDialogTimeoutRef.current);
    if (videoDialogTimeoutRef.current) clearTimeout(videoDialogTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (!open) { setIsFileDialogOpen(false); setIsVideoDialogOpen(false); setIsCreating(false); }
  }, [open]);

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  const handleSharingTypeChange = useCallback((value: string) => {
    const defaultCapacity = sharingTypeToCapacity[value] || 2;
    setFormData((prev: RoomFormData) => {
      let newCapacity = prev.capacity;
      let newIsManualCapacity = prev.isManualCapacity;
      if (value !== 'other') {
        if (prev.sharing_type === 'other' || prev.capacity !== defaultCapacity) {
          newCapacity = defaultCapacity; newIsManualCapacity = false;
        }
      } else {
        newIsManualCapacity = true;
      }
      const rents = distributeRentEqually(prev.rent_per_bed || 0, newCapacity);
      const updatedBeds: BedConfig[] = Array.from({ length: newCapacity }, (_, i) =>
        i < prev.beds_config.length
          ? { ...prev.beds_config[i], bed_rent: rents[i] }
          : { bed_number: i + 1, bed_type: '', bed_rent: rents[i] || 0 }
      );
      setTimeout(() => syncBedRentInputs(updatedBeds), 0);
      return { ...prev, sharing_type: value, capacity: newCapacity, isManualCapacity: newIsManualCapacity, beds_config: updatedBeds };
    });
  }, [setFormData, syncBedRentInputs]);

  const handleCapacityChange = useCallback((value: string) => {
    const num = value === '' ? 0 : parseInt(value, 10);
    const valid = isNaN(num) ? 0 : num;
    setFormData((prev: RoomFormData) => {
      const def = sharingTypeToCapacity[prev.sharing_type] || 2;
      const manual = prev.sharing_type === 'other' || (prev.sharing_type ? valid !== def : false);
      return { ...prev, capacity: valid, isManualCapacity: manual };
    });
  }, [setFormData]);

  // Total rent field change → distribute equally to all beds + sync inputs
  const handleTotalRentChange = useCallback((value: string) => {
    const newTotal = value === '' ? 0 : (parseFloat(value) || 0);
    setFormData((prev: RoomFormData) => {
      const count = prev.beds_config?.length || prev.capacity || 1;
      const rents = distributeRentEqually(newTotal, count);
      const updated = (prev.beds_config || []).map((b, i) => ({ ...b, bed_rent: rents[i] ?? b.bed_rent }));
      setTimeout(() => syncBedRentInputs(updated), 0);
      return { ...prev, rent_per_bed: newTotal, beds_config: updated };
    });
  }, [setFormData, syncBedRentInputs]);

  // ─── Bed rent: CONTROLLED input handlers ──────────────────────────────────────
  const handleBedRentChange = useCallback((bedNumber: number, value: string) => {
    setBedRentInputs(prev => ({ ...prev, [bedNumber]: value }));

    setFormData((p: RoomFormData) => {
      const updated:any = (p.beds_config || []).map(b =>
        b.bed_number === bedNumber ? { ...b, bed_rent: Number(value) } : b
      );
      const newTotal = calculateTotalRentFromBeds(updated);
      return { ...p, beds_config: updated, rent_per_bed: newTotal };
    });
    
  }, []);

  const handleBedRentBlur = useCallback((bedNumber: number) => {
    const raw = bedRentInputs[bedNumber] ?? '';
    const newRent = raw === '' ? 0 : (parseFloat(raw) || 0);
    const cleaned = newRent === 0 ? '' : String(newRent);

    setFormData((p: RoomFormData) => {
      const updated = (p.beds_config || []).map(b =>
        b.bed_number === bedNumber ? { ...b, bed_rent: newRent } : b
      );
      const newTotal = calculateTotalRentFromBeds(updated);
      return { ...p, beds_config: updated, rent_per_bed: newTotal };
    });
    setBedRentInputs(prev => ({ ...prev, [bedNumber]: cleaned }));
  }, [bedRentInputs, setFormData]);

  // ─── Distribute equally ───────────────────────────────────────────────────────
  const applyRoomRentToAllBeds = useCallback(() => {
    if (!formData.beds_config?.length) return;
    const rents = distributeRentEqually(formData.rent_per_bed || 0, formData.beds_config.length);
    const updated = formData.beds_config.map((b, i) => ({ ...b, bed_rent: rents[i] }));
    setFormData((p: RoomFormData) => ({ ...p, beds_config: updated }));
    syncBedRentInputs(updated);
    toast.success('Room rent distributed equally to all beds');
  }, [formData.beds_config, formData.rent_per_bed, setFormData, syncBedRentInputs]);

  // ── File handlers ────────────────────────────────────────────────────────────
  const handleFileClick = () => {
    if (isFileDialogOpen) return;
    setIsFileDialogOpen(true);
    if (fileDialogTimeoutRef.current) clearTimeout(fileDialogTimeoutRef.current);
    fileDialogTimeoutRef.current = setTimeout(() => setIsFileDialogOpen(false), 3000);
    requestAnimationFrame(() => { if (fileInputRef.current) { fileInputRef.current.value = ''; fileInputRef.current.click(); } });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (fileDialogTimeoutRef.current) clearTimeout(fileDialogTimeoutRef.current);
    setIsFileDialogOpen(false);
    if (e.target.files) {
      const images = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      if (images.length) {
        setFormData((p: RoomFormData) => ({ ...p, photos: [...p.photos, ...images] }));
        toast.success(`Added ${images.length} photo(s)`);
      } else toast.error('Please select only image files');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVideoClick = () => {
    if (isVideoDialogOpen) return;
    setIsVideoDialogOpen(true);
    if (videoDialogTimeoutRef.current) clearTimeout(videoDialogTimeoutRef.current);
    videoDialogTimeoutRef.current = setTimeout(() => setIsVideoDialogOpen(false), 3000);
    requestAnimationFrame(() => { if (videoInputRef.current) { videoInputRef.current.value = ''; videoInputRef.current.click(); } });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoDialogTimeoutRef.current) clearTimeout(videoDialogTimeoutRef.current);
    setIsVideoDialogOpen(false);
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      if (f.type.startsWith('video/')) {
        setFormData((p: RoomFormData) => ({ ...p, video: f }));
        setExistingVideoUrl(null);
        toast.success('New video added successfully');
      } else toast.error('Please select a video file');
    }
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  useEffect(() => {
    const h = () => {
      if (isFileDialogOpen) setTimeout(() => setIsFileDialogOpen(false), 100);
      if (isVideoDialogOpen) setTimeout(() => setIsVideoDialogOpen(false), 100);
    };
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, [isFileDialogOpen, isVideoDialogOpen]);

  useEffect(() => {
    const fi = fileInputRef.current, vi = videoInputRef.current;
    const fc = () => setIsFileDialogOpen(false), vc = () => setIsVideoDialogOpen(false);
    fi?.addEventListener('cancel', fc); vi?.addEventListener('cancel', vc);
    return () => { fi?.removeEventListener('cancel', fc); vi?.removeEventListener('cancel', vc); };
  }, []);

  const removeNewFile = (idx: number) => {
    setFormData((p: RoomFormData) => ({
      ...p,
      photos: p.photos.filter((_, i) => i !== idx),
      photo_labels: Object.fromEntries(Object.entries(p.photo_labels).filter(([k]) => k !== idx.toString())),
    }));
  };

  const removeExistingPhoto = (url: string) => {
    setFormData((p: RoomFormData) => ({
      ...p,
      existingPhotos: p.existingPhotos.filter(x => x.url !== url),
      photosToRemove: [...p.photosToRemove, url],
    }));
    toast.success('Photo marked for removal');
  };

  const removeVideo = () => {
    setFormData((p: RoomFormData) => ({ ...p, video: null, video_label: '' }));
    toast.success('New video removed');
  };

  const removeExistingVideo = () => {
    setVideoToRemove(true); setExistingVideoUrl(null);
    setFormData((p: any) => ({ ...p, existingVideo: undefined }));
    toast.success('Existing video marked for removal');
  };

  const toggleGenderPreference = (v: string) =>
    setFormData((p: RoomFormData) => ({
      ...p,
      room_gender_preference: p.room_gender_preference.includes(v)
        ? p.room_gender_preference.filter(x => x !== v)
        : [...p.room_gender_preference, v],
    }));

  const toggleAmenity = (a: string) =>
    setFormData((p: RoomFormData) => ({
      ...p,
      amenities: p.amenities.includes(a) ? p.amenities.filter(x => x !== a) : [...p.amenities, a],
    }));

  const removeAmenity = (a: string) =>
    setFormData((p: RoomFormData) => ({ ...p, amenities: p.amenities.filter(x => x !== a) }));

  const addCustomAmenity = () => {
    const a = formData.customAmenityInput.trim();
    if (!a) { toast.error('Please enter an amenity'); return; }
    if (formData.amenities.includes(a)) { toast.error('This amenity already exists'); return; }
    setFormData((p: RoomFormData) => ({ ...p, amenities: [...p.amenities, a], customAmenityInput: '' }));
    amenityInputRef.current?.focus();
  };

  const handleAmenityKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addCustomAmenity(); }
  };

  const openExistingGallery = () => {
    const items: Array<{url:string;label?:string;type:'photo'|'video'}> = [];
    formData.existingPhotos.forEach(p => {
      if (p.url && !formData.photosToRemove.includes(p.url))
        items.push({ url: p.url, label: p.label || 'Room Photo', type: 'photo' });
    });
    if (existingVideoUrl && !videoToRemove && formData.existingVideo)
      items.push({ url: existingVideoUrl, label: formData.existingVideo.label || 'Room Video', type: 'video' });
    formData.photos.forEach((f, i) => items.push({ url: URL.createObjectURL(f), label: formData.photo_labels[i] || 'New Photo', type: 'photo' }));
    if (formData.video) items.push({ url: URL.createObjectURL(formData.video), label: formData.video_label || 'New Video', type: 'video' });
    setGalleryItems(items); setGalleryOpen(true);
  };

  const handleBedTypeChange = useCallback((bedNumber: number, value: string) => {
    setFormData((p: RoomFormData) => ({
      ...p,
      beds_config: (p.beds_config || []).map(b =>
        b.bed_number === bedNumber ? { ...b, bed_type: value } : b
      ),
    }));
  }, []);

  const createFormDataForSubmission = () => {
    const fd = new FormData();
    fd.append('property_id', formData.property_id);
    fd.append('room_number', formData.room_number);
    fd.append('sharing_type', formData.sharing_type);
    fd.append('room_type', formData.room_type || '');
    fd.append('total_beds', formData.capacity.toString());
    fd.append('rent_per_bed', formData.rent_per_bed.toString());
    fd.append('floor', formData.floor || '');
    fd.append('has_attached_bathroom', formData.has_attached_bathroom ? 'true' : 'false');
    fd.append('has_balcony', formData.has_balcony ? 'true' : 'false');
    fd.append('has_ac', formData.has_ac ? 'true' : 'false');
    fd.append('allow_couples', formData.allow_couples ? 'true' : 'false');
    fd.append('is_active', formData.is_active ? 'true' : 'false');
    fd.append('amenities', JSON.stringify(formData.amenities));
    fd.append('room_gender_preference', formData.room_gender_preference.join(','));
    fd.append('description', formData.description || '');
    fd.append('video_label', formData.video_label || '');
    fd.append('photo_labels', JSON.stringify(formData.photo_labels || {}));
    fd.append('videoToRemove', videoToRemove ? 'true' : 'false');
    fd.append('photosToRemove', JSON.stringify(formData.photosToRemove));
    fd.append('beds_config', JSON.stringify(formData.beds_config || []));
    formData.photos?.forEach(p => fd.append('photos', p));
    if (formData.video) fd.append('video', formData.video);
    return fd;
  };

  const tabs = ['details', 'beds', 'amenities', 'photos', 'video'];
  const goToNextTab = () => { const i = tabs.indexOf(currentTab); if (i < tabs.length - 1) setCurrentTab(tabs[i + 1]); };
  const goToPrevTab = () => { const i = tabs.indexOf(currentTab); if (i > 0) setCurrentTab(tabs[i - 1]); };

  const handleFormSubmit = async () => {
    try {
      if (!formData.property_id) { toast.error('Please select a property'); setCurrentTab('details'); return; }
      if (!formData.room_number) { toast.error('Please enter a room number'); setCurrentTab('details'); return; }
      if (!formData.sharing_type) { toast.error('Please select sharing type'); setCurrentTab('details'); return; }
      if (!formData.rent_per_bed || formData.rent_per_bed <= 0) { toast.error('Please enter a valid total room rent'); setCurrentTab('details'); return; }

      const noBedType = (formData.beds_config || []).filter(b => !b.bed_type);
      if (noBedType.length) { toast.error(`Please select bed type for beds: ${noBedType.map(b => b.bed_number).join(', ')}`); setCurrentTab('beds'); return; }

      const noRent = (formData.beds_config || []).filter(b => !b.bed_rent || b.bed_rent <= 0);
      if (noRent.length) { toast.error(`Please enter valid rent for beds: ${noRent.map(b => b.bed_number).join(', ')}`); setCurrentTab('beds'); return; }

      if (rooms?.length) {
        const pid = String(formData.property_id).trim(), rno = String(formData.room_number).trim();
        const cid = isEditMode ? String(editingRoomId).trim() : null;
        const dup = rooms.some(r => String(r.property_id).trim() === pid && String(r.room_number).trim() === rno && !(isEditMode && String(r.id).trim() === cid));
        if (dup) { toast.error('Room number already exists for this property.'); setCurrentTab('details'); return; }
      }

      setIsCreating(true);
      await onSubmit(createFormDataForSubmission());
      toast.success(isEditMode ? 'Room updated successfully!' : 'Room created successfully!');
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const isDuplicateRoom = formData.room_number && formData.property_id && rooms?.some(r => {
    const sp = String(r.property_id).trim() === String(formData.property_id).trim();
    const sn = String(r.room_number).trim() === String(formData.room_number).trim();
    const sc = isEditMode ? String(r.id).trim() === String(editingRoomId).trim() : false;
    return sp && sn && !sc;
  });

  // Displayed total: use liveTotalRent when beds exist and have been touched,
  // else fall back to formData.rent_per_bed (set by edit load or total rent input)
  const displayedTotal = formData.beds_config?.length > 0
    ? (liveTotalRent > 0 ? liveTotalRent : (formData.rent_per_bed || 0))
    : (formData.rent_per_bed || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-4xl lg:max-w-5xl h-[70vh] overflow-hidden p-0 border-0 flex flex-col rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                {isEditMode ? <Edit className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {isEditMode ? 'Edit Room' : 'Add New Room'}
              </h2>
              <p className="text-blue-100 text-[10px] leading-tight">
                {isEditMode ? 'Update room details, beds, photos & preferences' : 'Fill in room details, configure beds, and upload media'}
              </p>
            </div>
            <button onClick={() => onOpenChange(false)} className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex flex-col overflow-hidden flex-1 min-h-0 px-3 py-2">

          {/* Tab bar */}
          <TabsList className="grid grid-cols-5 mb-2 h-8 p-0.5 bg-slate-100 rounded-lg flex-shrink-0">
            {[
              { value: 'details',   icon: DoorOpen,   label: 'Details'   },
              { value: 'beds',      icon: BedDouble,  label: 'Beds'      },
              { value: 'amenities', icon: Sparkles,   label: 'Amenities' },
              { value: 'photos',    icon: ImageIcon,  label: 'Photos'    },
              { value: 'video',     icon: Video,      label: 'Video'     },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger key={value} value={value}
                className="flex items-center gap-1 text-[10px] font-semibold h-7 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600">
                <Icon className="h-3 w-3 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 min-h-0 overflow-y-auto">

            {/* ══════════ TAB 1 — DETAILS ══════════ */}
            <TabsContent value="details" className="mt-0 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                {/* Left column */}
                <div className="space-y-2">
                  {/* Location card */}
                  <div className="border border-slate-100 rounded-lg p-2.5 bg-white shadow-sm">
                    <div className="flex items-center gap-1 mb-2 pb-1 border-b border-slate-50">
                      <Building className="h-3 w-3 text-blue-500 flex-shrink-0" />
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">Location</span>
                    </div>
                    <div className="space-y-1.5">
                      <F label="Property" required>
                        <Select 
                          value={formData.property_id}
                          onValueChange={v => setFormData((p: RoomFormData) => ({ ...p, property_id: v, floor: '' }))}
                          // Property selector is NOT disabled when limit reached - user should be able to select a different property
                        >
                          <SelectTrigger className="h-7 text-[10px] border-slate-200 bg-slate-50">
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                          <SelectContent>
                            {properties.map(p => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                <div className="flex items-center gap-1.5">
                                  <Building className="h-3 w-3 text-slate-400" />
                                  <span className="text-[10px] font-medium">{p.name}</span>
                                  {p.address && <span className="text-[9px] text-slate-400 truncate max-w-[120px]">— {p.address}</span>}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </F>

                      <div className="grid grid-cols-2 gap-1.5">
                        <F label="Floor">
                          <Select 
                            value={formData.floor}
                            onValueChange={v => setFormData((p: RoomFormData) => ({ ...p, floor: v }))}
                            disabled={!formData.property_id || roomLimitReached}
                          >
                            <SelectTrigger className="h-7 text-[10px] border-slate-200 bg-slate-50">
                              <SelectValue placeholder={!formData.property_id ? 'Select property first' : propertyFloorOptions.length === 0 ? 'No floors set' : 'Select floor'} />
                            </SelectTrigger>
                            <SelectContent>
                              {propertyFloorOptions.length > 0
                                ? propertyFloorOptions.map(f => (
                                    <SelectItem key={f} value={f}>
                                      <div className="flex items-center gap-1.5">
                                        <Layers className="h-3 w-3 text-slate-400" />
                                        <span className="text-[10px]">Floor {f}</span>
                                      </div>
                                    </SelectItem>
                                  ))
                                : <div className="px-2 py-2 text-[10px] text-slate-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3 text-amber-500" />
                                    {!formData.property_id ? 'Select a property first' : 'No floors configured'}
                                  </div>
                              }
                            </SelectContent>
                          </Select>
                        </F>

                        <F label="Room No." required>
                          <div className="relative">
                            <Input
                              value={formData.room_number}
                              onChange={e => { const v = e.target.value; setFormData((p: RoomFormData) => ({ ...p, room_number: v })); }}
                              placeholder="101, G-01…"
                              className={`h-7 text-[10px] border-slate-200 bg-slate-50 ${isDuplicateRoom ? 'border-red-400' : ''}`}
                              disabled={roomLimitReached}
                            />
                            {isDuplicateRoom && <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-red-500" />}
                          </div>
                          {isDuplicateRoom && (
                            <p className="text-[9px] text-red-500 mt-0.5 flex items-center gap-0.5">
                              <AlertCircle className="h-2.5 w-2.5" /> Room number already exists
                            </p>
                          )}
                        </F>
                      </div>
                    </div>
                  </div>

                  {/* Room Config card */}
                  <div className="border border-slate-100 rounded-lg p-2.5 bg-white shadow-sm">
                    <div className="flex items-center gap-1 mb-2 pb-1 border-b border-slate-50">
                      <Home className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">Room Config</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <F label="Sharing Type" required>
                        <Select 
                          value={formData.sharing_type} 
                          onValueChange={handleSharingTypeChange} 
                          disabled={loadingMasters || roomLimitReached}
                        >
                          <SelectTrigger className="h-7 text-[10px] border-slate-200 bg-slate-50">
                            <SelectValue placeholder={loadingMasters ? 'Loading…' : 'Select type'} />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingMasters
                              ? <div className="px-2 py-1.5 text-[10px] text-gray-500 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Loading...</div>
                              : roomsMasters['Sharing Type']?.length > 0
                                ? roomsMasters['Sharing Type'].map(t => <SelectItem key={t.id} value={t.name.toLowerCase()}><span className="text-[10px]">{t.name}</span></SelectItem>)
                                : <>
                                    <SelectItem value="single"><span className="text-[10px]">Single (1 bed)</span></SelectItem>
                                    <SelectItem value="double"><span className="text-[10px]">Double (2 beds)</span></SelectItem>
                                    <SelectItem value="triple"><span className="text-[10px]">Triple (3 beds)</span></SelectItem>
                                    <SelectItem value="other"><span className="text-[10px]">Other (Custom)</span></SelectItem>
                                  </>
                            }
                          </SelectContent>
                        </Select>
                      </F>

                      <F label="Room Type">
                        <Select 
                          value={formData.room_type || ''}
                          onValueChange={v => setFormData((p: RoomFormData) => ({ ...p, room_type: v }))}
                          disabled={loadingMasters || roomLimitReached}
                        >
                          <SelectTrigger className="h-7 text-[10px] border-slate-200 bg-slate-50">
                            <SelectValue placeholder={loadingMasters ? 'Loading…' : 'Select type'} />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingMasters
                              ? <div className="px-2 py-1.5 text-[10px] text-gray-500 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Loading...</div>
                              : roomsMasters['Room Type']?.length > 0
                                ? roomsMasters['Room Type'].map(t => <SelectItem key={t.id} value={t.name}><span className="text-[10px]">{t.name}</span></SelectItem>)
                                : <>
                                    <SelectItem value="corner"><span className="text-[10px]">Corner Room</span></SelectItem>
                                    <SelectItem value="middle"><span className="text-[10px]">Middle Room</span></SelectItem>
                                    <SelectItem value="standard"><span className="text-[10px]">Standard</span></SelectItem>
                                  </>
                            }
                          </SelectContent>
                        </Select>
                      </F>

                      <F label="No. of Beds" required>
                        <Input
                          type="text"
                          value={formData.capacity}
                          onChange={e => handleCapacityChange(e.target.value)}
                          className="h-7 text-[10px] border-slate-200 bg-slate-50"
                          placeholder="e.g. 2"
                          disabled={roomLimitReached}
                        />
                      </F>

                      <F label="Total Rent (₹)" required>
                        <Input
                          type="text"
                          value={displayedTotal || ''}
                          onChange={e => handleTotalRentChange(e.target.value)}
                          placeholder="Total room rent"
                          className="h-7 text-[10px] border-slate-200 bg-slate-50"
                          disabled={roomLimitReached}
                        />
                        {(formData.beds_config?.length || 0) > 0 && displayedTotal > 0 && (
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            ~₹{Math.round(displayedTotal / formData.beds_config.length)}/bed
                          </p>
                        )}
                      </F>
                    </div>

                    {isEditMode && (formData.beds_config?.length || 0) > 0 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={applyRoomRentToAllBeds}
                        className="mt-1.5 h-6 text-[9px] w-full border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-300"
                        disabled={roomLimitReached}
                      >
                        <Wallet className="h-3 w-3 mr-1" /> Distribute rent equally to all beds
                      </Button>
                    )}
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-2">
                  {/* Gender & Preferences */}
                  <div className="border border-slate-100 rounded-lg p-2.5 bg-white shadow-sm">
                    <div className="flex items-center gap-1 mb-2 pb-1 border-b border-slate-50">
                      <Users className="h-3 w-3 text-pink-500 flex-shrink-0" />
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">Occupancy Preferences</span>
                    </div>
                    <F label="Gender Preferences">
                      <div className="grid grid-cols-3 gap-1 mt-0.5">
                        {GENDER_PREFERENCES.map(pref => {
                          const sel = formData.room_gender_preference.includes(pref.value);
                          return (
                            <div 
                              key={pref.value} 
                              onClick={() => !roomLimitReached && toggleGenderPreference(pref.value)}
                              className={`flex flex-col items-center gap-0.5 p-1.5 border rounded-lg cursor-pointer transition-all ${roomLimitReached ? 'opacity-50 cursor-not-allowed' : ''} ${sel ? `${pref.color} border-2` : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                            >
                              <div className={sel ? pref.iconColor : 'text-slate-400'}>{pref.icon}</div>
                              <span className={`text-[9px] font-semibold ${sel ? '' : 'text-slate-500'}`}>{pref.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </F>
                    <div className="mt-2 flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-700">Active Status</p>
                        <p className="text-[9px] text-slate-400">{formData.is_active ? 'Room is visible & bookable' : 'Room is hidden'}</p>
                      </div>
                      <div 
                        onClick={() => !roomLimitReached && setFormData((p: RoomFormData) => ({ ...p, is_active: !p.is_active }))}
                        className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors ${roomLimitReached ? 'opacity-50 cursor-not-allowed' : ''} ${formData.is_active ? 'bg-green-500' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${formData.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="border border-slate-100 rounded-lg p-2.5 bg-white shadow-sm">
                    <div className="flex items-center gap-1 mb-2 pb-1 border-b border-slate-50">
                      <Edit className="h-3 w-3 text-slate-500 flex-shrink-0" />
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">Description</span>
                    </div>
                    <Textarea
                      value={formData.description}
                      onChange={e => { const v = e.target.value; setFormData((p: RoomFormData) => ({ ...p, description: v })); }}
                      placeholder="Describe the room, its features, view…"
                      rows={4}
                      className="resize-none text-[10px] min-h-[80px] border-slate-200 bg-slate-50 focus:bg-white placeholder:text-slate-400 rounded-md"
                      disabled={roomLimitReached}
                    />
                  </div>

                  
                </div>
              </div>
            </TabsContent>

            {/* ══════════ TAB 2 — BEDS ══════════ */}
            <TabsContent value="beds" className="mt-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BedDouble className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[11px] font-bold text-slate-700">Configure Beds ({formData.beds_config?.length || 0})</span>
                </div>
                <Badge variant="outline" className="text-[9px]">
                  Total: ₹{displayedTotal}
                </Badge>
              </div>
              <p className="text-[9px] text-gray-500">
                Individual bed rent updates total automatically as you type. Total rent field distributes equally to all beds.
              </p>

              {(!formData.beds_config || formData.beds_config.length === 0) ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                  <Bed className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-xs font-medium text-gray-600">No beds configured</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Set number of beds in the Details tab</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {formData.beds_config.map(bed => (
                    <div key={bed.bed_number}
                      className={`border rounded-xl p-2.5 ${!bed.bed_type ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-white shadow-sm'} ${roomLimitReached ? 'opacity-60' : ''}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className={`p-1 rounded-lg ${!bed.bed_type ? 'bg-red-100' : 'bg-blue-100'}`}>
                          <Bed className={`h-3 w-3 ${!bed.bed_type ? 'text-red-600' : 'text-blue-600'}`} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">Bed #{bed.bed_number}</span>
                        {!bed.bed_type && <Badge variant="destructive" className="text-[8px] px-1 py-0 ml-auto">Required</Badge>}
                      </div>
                      <div className="space-y-1.5">
                        {/* Bed Type */}
                        <div>
                          <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide block mb-0.5">Bed Type *</label>
                          <Select
                            value={bed.bed_type || ''}
                            onValueChange={v => handleBedTypeChange(bed.bed_number, v)}
                            key={`bed-type-${bed.bed_number}`}
                            disabled={roomLimitReached}
                          >
                            <SelectTrigger className="h-7 text-[10px] border-slate-200 bg-slate-50">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingMasters ? (
                                <div className="px-2 py-1.5 text-[10px] text-gray-500 flex items-center gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                                </div>
                              ) : roomsMasters['Bed Type']?.length > 0 ? (
                                roomsMasters['Bed Type'].map(t => (
                                  <SelectItem key={t.id} value={t.name}>
                                    <span className="text-[10px]">{t.name}</span>
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="single">Single Bed</SelectItem>
                                  <SelectItem value="double">Double Bed</SelectItem>
                                  <SelectItem value="queen">Queen Size</SelectItem>
                                  <SelectItem value="king">King Size</SelectItem>
                                  <SelectItem value="bunk">Bunk Bed</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Bed Rent */}
                        <div>
                          <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide block mb-0.5">Rent (₹) *</label>
                          <Input
                            type="text"
                            value={bedRentInputs[bed.bed_number] ?? (bed.bed_rent === 0 ? '' : String(bed.bed_rent))}
                            onChange={e =>{console.log(e.target.value); handleBedRentChange(bed.bed_number, e.target.value)}}
                            onBlur={() => handleBedRentBlur(bed.bed_number)}
                            placeholder="Bed rent"
                            className="h-7 text-[10px] border-slate-200 bg-slate-50"
                            disabled={roomLimitReached}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ══════════ TAB 3 — AMENITIES ══════════ */}
            <TabsContent value="amenities" className="mt-0 space-y-2 md:space-y-3">
              <div className="space-y-3 md:space-y-4">
                <div>
                  <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-2">
                    <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5" />Select Amenities
                  </Label>
                  <p className="text-[10px] md:text-xs text-gray-500 mb-2 md:mb-3">Choose amenities available in this room</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5 md:gap-2">
                    {AMENITIES_OPTIONS.map(amenity => (
                      <div key={amenity.id}
                        className={`p-2 md:p-2.5 border rounded-lg cursor-pointer transition-all ${roomLimitReached ? 'opacity-50 cursor-not-allowed' : ''} ${formData.amenities.includes(amenity.label) ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                        onClick={() => !roomLimitReached && toggleAmenity(amenity.label)}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className={`rounded ${formData.amenities.includes(amenity.label) ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'}`}>
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
                    <Plus className="h-3 w-3 md:h-3.5 md:w-3.5" />Add Custom Amenities
                  </Label>
                  <div className="flex gap-1.5">
                    <Input
                      ref={amenityInputRef}
                      value={formData.customAmenityInput}
                      onChange={e => { const v = e.target.value; setFormData((p: RoomFormData) => ({ ...p, customAmenityInput: v })); }}
                      onKeyPress={handleAmenityKeyPress}
                      placeholder="Enter amenity name"
                      className="flex-1 h-6 md:h-7 text-[10px] md:text-xs"
                      disabled={roomLimitReached}
                    />
                    <Button 
                      type="button" 
                      onClick={addCustomAmenity} 
                      className="bg-cyan-600 hover:bg-cyan-700 h-6 md:h-7 text-[10px] md:text-xs px-2"
                      disabled={roomLimitReached}
                    >
                      <Plus className="h-3 w-3 md:h-3.5 md:w-3.5 mr-0.5" /> Add
                    </Button>
                  </div>

                  {formData.amenities.length > 0 ? (
                    <div className="mt-2 md:mt-3">
                      <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-1.5">
                        <CheckCircle className="h-3 w-3 md:h-3.5 md:w-3.5 text-green-600" />Selected ({formData.amenities.length})
                      </Label>
                      <div className="flex flex-wrap gap-1 md:gap-1.5 p-2 md:p-3 border border-gray-200 rounded-lg bg-gray-50">
                        {formData.amenities.map((amenity, idx) => {
                          const pre = AMENITIES_OPTIONS.find(o => o.label === amenity);
                          return (
                            <Badge key={idx} variant="outline"
                              className={`flex items-center gap-0.5 py-0.5 px-1.5 text-[9px] md:text-[10px] ${!pre ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-300 text-gray-700'}`}>
                              {pre ? pre.icon : getCustomAmenityIcon(amenity)}
                              <span>{amenity}</span>
                              <button type="button" onClick={() => !roomLimitReached && removeAmenity(amenity)} className="ml-0.5 text-gray-400 hover:text-red-500">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <Sparkles className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-xs font-medium text-gray-700 mb-1">No amenities selected yet</p>
                      <p className="text-[10px] text-gray-500">Select from above or add custom ones</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-2">
                    <Home className="h-3 w-3 md:h-3.5 md:w-3.5" />Basic Room Features
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                    {[
                      { key: 'has_ac',               label: 'Air Conditioner',  sub: 'Room has AC',      icon: Wind,    color: 'border-cyan-500 bg-cyan-50' },
                      { key: 'has_balcony',           label: 'Balcony',          sub: 'Room has balcony', icon: Maximize,color: 'border-cyan-500 bg-cyan-50' },
                      { key: 'has_attached_bathroom', label: 'Attached Bathroom',sub: 'Private bathroom', icon: Bath,    color: 'border-cyan-500 bg-cyan-50' },
                    ].map(({ key, label, sub, icon: Icon, color }) => (
                      <div key={key}
                        className={`flex items-center gap-2 p-2 md:p-3 border rounded-lg cursor-pointer ${roomLimitReached ? 'opacity-50 cursor-not-allowed' : ''} ${(formData as any)[key] ? color : 'border-gray-200'}`}
                        onClick={() => !roomLimitReached && setFormData((p: RoomFormData) => ({ ...p, [key]: !(p as any)[key] }))}>
                        <div className={`p-1.5 rounded-lg ${(formData as any)[key] ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'}`}>
                          <Icon className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="flex-1">
                          <Label className="cursor-pointer text-[10px] md:text-xs font-medium">{label}</Label>
                          <p className="text-[9px] md:text-[10px] text-gray-500">{sub}</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={(formData as any)[key]}
                          onChange={e => { const c = e.target.checked; setFormData((p: RoomFormData) => ({ ...p, [key]: c })); }}
                          className="h-4 w-4 md:h-5 md:w-5"
                          disabled={roomLimitReached}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ══════════ TAB 4 — PHOTOS ══════════ */}
            <TabsContent value="photos" className="mt-0 space-y-2 md:space-y-3">
              <div>
                <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-2">
                  <ImageIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />Room Photos with Labels
                </Label>
                <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center hover:border-cyan-400 hover:bg-cyan-50 transition-colors cursor-pointer mb-3 md:mb-4">
                  <Upload className="h-8 w-8 md:h-10 md:w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">Upload Room Photos</p>
                  <p className="text-[10px] md:text-xs text-gray-600 mb-2 md:mb-3">Click to browse or drag & drop</p>
                  <UploadButton 
                    type="photo" 
                    onClick={handleFileClick} 
                    isDisabled={isFileDialogOpen || roomLimitReached} 
                    isProcessing={isFileDialogOpen} 
                  />
                  <p className="text-[9px] md:text-[10px] text-gray-500 mt-2">Max 10 photos, 5MB each.</p>
                </div>

                {isEditMode && formData.existingPhotos.length > 0 && (
                  <div className="mb-3 md:mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1">
                        <ImageIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />Existing Photos ({formData.existingPhotos.length})
                      </Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={openExistingGallery} 
                        className="h-6 md:h-7 text-[10px] md:text-xs px-2"
                        disabled={roomLimitReached}
                      >
                        <Eye className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />View Gallery
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                      {formData.existingPhotos.map((photo, idx) => {
                        const marked = formData.photosToRemove.includes(photo.url);
                        return (
                          <div key={idx} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border border-gray-300 bg-gray-100 cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all" onClick={openExistingGallery}>
                              <img src={photo.url} alt={`Room photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2Ij5Sb29tIFBob3RvPC90ZXh0Pjwvc3ZnPg=='; }} />
                            </div>
                            <Button 
                              size="sm" 
                              variant={marked ? 'outline' : 'destructive'}
                              className="absolute -top-1 -right-1 h-5 w-5 md:h-6 md:w-6 p-0 rounded-full z-10"
                              onClick={() => marked
                                ? setFormData((p: RoomFormData) => ({ ...p, photosToRemove: p.photosToRemove.filter(u => u !== photo.url) }))
                                : removeExistingPhoto(photo.url)
                              }
                              disabled={roomLimitReached}
                            >
                              {marked ? <Plus className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                            </Button>
                            {marked && (
                              <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center rounded-lg">
                                <Badge variant="destructive" className="text-[9px] px-1.5 py-0.5">
                                  <Trash2 className="h-2.5 w-2.5 mr-0.5" />Removing
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
                      <Upload className="h-3 w-3 md:h-3.5 md:w-3.5" />New Photos ({formData.photos.length})
                    </Label>
                    <div className="space-y-2 md:space-y-3">
                      {formData.photos.map((file, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-2 md:gap-3 p-2 md:p-3 border rounded-lg bg-gray-50">
                          <div className="md:w-32 md:h-32 w-full h-32 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <div>
                              <Label htmlFor={`photo-label-${idx}`} className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-0.5">
                                <Edit className="h-2.5 w-2.5" />Image Label
                              </Label>
                              <Input id={`photo-label-${idx}`}
                                value={formData.photo_labels[idx] || ''}
                                onChange={e => { const v = e.target.value; setFormData((p: RoomFormData) => ({ ...p, photo_labels: { ...p.photo_labels, [idx]: v } })); }}
                                placeholder="e.g., Room View, Bathroom"
                                className="h-6 md:h-7 text-[10px] md:text-xs"
                                disabled={roomLimitReached}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-[10px] text-gray-600">
                                <p className="font-medium truncate max-w-[150px]">{file.name}</p>
                                <p className="text-[9px]">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeNewFile(idx)} 
                                className="text-red-600 hover:text-red-700 h-6 text-[10px] px-2"
                                disabled={roomLimitReached}
                              >
                                <Trash2 className="h-3 w-3 mr-0.5" />Remove
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

            {/* ══════════ TAB 5 — VIDEO ══════════ */}
            <TabsContent value="video" className="mt-0 space-y-2 md:space-y-3">
              <div>
                <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-2">
                  <Video className="h-3 w-3 md:h-3.5 md:w-3.5" />Room Video Walkthrough
                </Label>
                <input type="file" ref={videoInputRef} accept="video/*" onChange={handleVideoChange} className="hidden" />

                {isEditMode && existingVideoUrl && !videoToRemove && (
                  <div className="mb-3 md:mb-4">
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-2 relative group">
                      <video src={existingVideoUrl} controls className="w-full h-full"
                        onError={(e: any) => { e.target.src = existingVideoUrl.replace('uploads/videos/', 'uploads/rooms/videos/'); }}>
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="flex justify-between items-center p-2 md:p-2.5 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-[10px] md:text-xs font-medium">Current Video</p>
                        <p className="text-[9px] md:text-[10px] text-gray-600">{formData.existingVideo?.label || 'Room Video Walkthrough'}</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={removeExistingVideo} 
                        className="h-6 md:h-7 text-[10px] md:text-xs px-2"
                        disabled={roomLimitReached}
                      >
                        <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5 mr-0.5" />Remove
                      </Button>
                    </div>
                  </div>
                )}

                {formData.video ? (
                  <div className="space-y-2 md:space-y-3">
                    <div className="relative">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <video src={URL.createObjectURL(formData.video)} controls className="w-full h-full" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={removeVideo} 
                          className="h-6 md:h-7 text-[10px] md:text-xs px-2 bg-red-600 hover:bg-red-700"
                          disabled={roomLimitReached}
                        >
                          <Trash2 className="h-3 w-3 mr-0.5" />Remove
                        </Button>
                      </div>
                    </div>
                    <div className="p-2 md:p-3 border rounded-lg bg-gray-50 space-y-2">
                      <div>
                        <Label htmlFor="video-label-input" className="text-[10px] md:text-xs font-medium flex items-center gap-1 mb-0.5">
                          <Edit className="h-2.5 w-2.5" />Video Label (Optional)
                        </Label>
                        <Input id="video-label-input" value={formData.video_label}
                          onChange={e => { const v = e.target.value; setFormData((p: RoomFormData) => ({ ...p, video_label: v })); }}
                          placeholder="e.g., Room Walkthrough" className="h-6 md:h-7 text-[10px] md:text-xs"
                          disabled={roomLimitReached}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t">
                        <div>
                          <p className="text-[10px] md:text-xs font-medium">
                            <Video className="h-3 w-3 inline mr-1" />New Video: {formData.video.name}
                          </p>
                          <p className="text-[9px] md:text-[10px] text-gray-500">{(formData.video.size / (1024 * 1024)).toFixed(2)} MB • {formData.video.type}</p>
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
                      <p className="text-[10px] md:text-xs text-gray-600 mb-2 md:mb-3">Show a walkthrough of the room</p>
                      <UploadButton 
                        type="video" 
                        onClick={handleVideoClick} 
                        isDisabled={isVideoDialogOpen || roomLimitReached} 
                        isProcessing={isVideoDialogOpen} 
                      />
                    </div>
                  )
                )}
              </div>
            </TabsContent>

          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-white pt-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToPrevTab} 
                  disabled={currentTab === 'details' || isCreating || roomLimitReached} 
                  className="h-7 text-[11px] px-2.5"
                >
                  ← Prev
                </Button>
                <div className="flex items-center gap-1">
                  {tabs.map(t => (
                    <button key={t} onClick={() => setCurrentTab(t)}
                      className={`rounded-full transition-all ${currentTab === t ? 'w-5 h-1.5 bg-blue-600' : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'}`} />
                  ))}
                </div>
                {currentTab !== 'video' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={goToNextTab} 
                    className="h-7 text-[11px] px-2.5"
                    disabled={roomLimitReached}
                  >
                    Next →
                  </Button>
                )}
              </div>
              <div className="flex gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onOpenChange(false)} 
                  disabled={isCreating} 
                  className="h-7 text-[11px] px-3"
                >
                  Cancel
                </Button>
                {currentTab === 'video' && (
                  <Button 
                    onClick={handleFormSubmit} 
                    disabled={isCreating || roomLimitReached} 
                    size="sm"
                    className="h-7 text-[11px] px-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90"
                  >
                    {isCreating
                      ? <span className="flex items-center gap-1"><div className="h-2.5 w-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</span>
                      : isEditMode ? <><Edit className="h-3 w-3 mr-1" />Update Room</> : <><Plus className="h-3 w-3 mr-1" />Create Room</>
                    }
                  </Button>
                )}
              </div>
            </div>
          </div>

        </Tabs>
      </DialogContent>

      <PhotoGalleryModal open={galleryOpen} onOpenChange={setGalleryOpen} photos={galleryItems} roomNumber={formData.room_number} />
    </Dialog>
  );
}

export default RoomForm;