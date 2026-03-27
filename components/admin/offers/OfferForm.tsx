// app/admin/offers/components/OfferForm.tsx

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Building,
  Ticket,
  Tag,
  Megaphone,
  BellRing,
  RefreshCw,
  Key,
  Sparkles,
  Bed,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  BedDouble,
  Calendar,
  Percent,
  IndianRupee,
  Gift,
  ClipboardList,
  Eye,
} from "lucide-react";
import { useState, useMemo } from "react";

// ============================================
// TYPES
// ============================================

interface Bed {
  bed_number: number;
  is_available: boolean;
  tenant_id: number | null;
  tenant_gender: string | null;
  tenant_rent: number | null;
  is_couple: boolean;
  bed_type: string | null;
}

interface Room {
  id: number;
  room_number: number;
  sharing_type: string;
  rent_per_bed: number;
  total_bed: number;
  occupied_beds: number;
  available_beds?: number;
  floor: number;
  has_attached_bathroom: boolean;
  has_balcony: boolean;
  has_ac: boolean;
  amenities: string[];
  room_type: string;
  is_active: boolean;
  bed_assignments?: Bed[];
  property_id?: number;
  property_name?: string;
  description?: string;
}

interface Property {
  id: number;
  name: string;
  address: string | null;
  total_beds?: number;
  total_rooms?: number;
  is_active?: boolean;
}

interface FormData {
  code: string;
  title: string;
  description: string;
  offer_type: string;
  discount_type: string;
  discount_value: string;
  discount_percent: string;
  min_months: string;
  start_date: string;
  end_date: string;
  terms_and_conditions: string;
  is_active: boolean;
  display_order: string;
  bonus_title: string;
  bonus_description: string;
  bonus_valid_until: string;
  bonus_conditions: string;
  property_id: number | null;
  room_id: number | null;
  bed_number: number | null;
}

interface OfferFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  existingCodes?: string[];
  isEdit?: boolean;
  currentCode?: string;
  properties?: Property[];
  rooms?: Room[];
  loadingRooms?: boolean;
  onPropertyChange?: (propertyId: number | null) => void;
  onGenerateCode?: () => void;
  isGeneratingCode?: boolean;
}

// ============================================
// STYLES (KEEP ORIGINAL)
// ============================================

const sec = "rounded-lg border p-2.5 space-y-2";
const lbl = "text-[10px] font-semibold text-gray-600 uppercase tracking-wide";
const inp = "h-7 text-[11px] border-gray-200 focus:border-blue-400";

// ============================================
// MAIN COMPONENT
// ============================================

const OfferForm = ({
  formData,
  setFormData,
  existingCodes = [],
  isEdit = false,
  currentCode = "",
  properties = [],
  rooms = [],
  loadingRooms = false,
  onPropertyChange,
  onGenerateCode,
  isGeneratingCode = false,
}: OfferFormProps) => {
  const [codeError, setCodeError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Find selected room when room_id changes
  useMemo(() => {
    if (formData.room_id && rooms.length > 0) {
      const room = rooms.find(r => r.id === formData.room_id);
      setSelectedRoom(room || null);
    } else {
      setSelectedRoom(null);
    }
  }, [formData.room_id, rooms]);

  // Validate offer code
  const validateCode = (code: string) => {
    const uppercaseCode = code.toUpperCase();
    if (!uppercaseCode) {
      setCodeError("Offer code is required");
      return false;
    }
    if (uppercaseCode.length < 3) {
      setCodeError("Code must be at least 3 characters");
      return false;
    }
    if (isEdit && uppercaseCode === currentCode) {
      setCodeError("");
      return true;
    }
    if (existingCodes.includes(uppercaseCode)) {
      setCodeError("This offer code already exists");
      return false;
    }
    setCodeError("");
    return true;
  };

  // Handle code change
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, code: value }));
    validateCode(value);
  };

  // Handle input change
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Handle select change
  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get room availability status
  const getRoomAvailabilityStatus = (room: Room) => {
    const availableBeds = room.available_beds !== undefined 
      ? room.available_beds 
      : room.total_bed - room.occupied_beds;
    
    if (availableBeds === 0) {
      return { text: "Fully Occupied", color: "bg-red-100 text-red-700", icon: XCircle };
    } else if (availableBeds === room.total_bed) {
      return { text: "Fully Available", color: "bg-green-100 text-green-700", icon: CheckCircle };
    } else {
      return { text: `${availableBeds} Bed(s) Available`, color: "bg-yellow-100 text-yellow-700", icon: AlertCircle };
    }
  };

  // Get bed availability status
  const getBedAvailabilityStatus = (bed: Bed) => {
    if (!bed.is_available) {
      return { text: "Occupied", color: "bg-red-100 text-red-700", icon: XCircle };
    }
    return { text: "Available", color: "bg-green-100 text-green-700", icon: CheckCircle };
  };

  return (
    <div className="space-y-3">

      {/* ── Property & Room ── */}
      <div className={`${sec} bg-purple-50 border-purple-200`}>
        <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wide flex items-center gap-1">
          <Building className="h-3 w-3" /> Property & Room
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <Label className={lbl}>Property (Optional)</Label>
            <Select
              value={formData.property_id?.toString() || "null"}
              onValueChange={(value) => {
                const propertyId = value && value !== "null" ? parseInt(value) : null;
                setFormData(prev => ({ 
                  ...prev, 
                  property_id: propertyId, 
                  room_id: null, 
                  bed_number: null 
                }));
                onPropertyChange?.(propertyId);
              }}
            >
              <SelectTrigger className={inp}>
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null" className="text-xs">All Properties</SelectItem>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
                    <div className="flex items-center justify-between w-full gap-2">
                      <span>{p.name}</span>
                      <Badge variant="outline" className="text-[9px] px-1.5">
                        {p.total_beds || 0} beds
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[9px] text-gray-500">Leave empty to apply offer to all properties</p>
          </div>

          {/* Room Selection */}
          {formData.property_id && (
            <div className="space-y-0.5">
              <Label className={lbl}>Room (Optional)</Label>
              {loadingRooms ? (
                <div className="flex items-center gap-1 h-7 text-[10px] text-gray-400">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Loading rooms...
                </div>
              ) : rooms.length === 0 ? (
                <div className="flex items-center gap-1 h-7 text-[10px] text-gray-400">
                  <Info className="h-3 w-3" /> No rooms available
                </div>
              ) : (
                <Select
                  value={formData.room_id?.toString() || "null"}
                  onValueChange={(value) => {
                    const roomId = value && value !== "null" ? parseInt(value) : null;
                    setFormData(prev => ({ ...prev, room_id: roomId, bed_number: null }));
                  }}
                >
                  <SelectTrigger className={inp}>
                    <SelectValue placeholder="All Rooms" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="null" className="text-xs">All Rooms</SelectItem>
                    {rooms.map(room => {
                      const availableBeds = room.available_beds !== undefined 
                        ? room.available_beds 
                        : room.total_bed - room.occupied_beds;
                      const status = getRoomAvailabilityStatus(room);
                      const StatusIcon = status.icon;
                      
                      return (
                        <SelectItem key={room.id} value={room.id.toString()} className="text-xs py-1.5">
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center gap-1.5">
                              <Key className="h-3 w-3 text-gray-500" />
                              <span className="font-medium">Room {room.room_number}</span>
                              <Badge variant="outline" className="text-[8px] px-1">
                                {room.sharing_type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-[9px] text-gray-500">
                                <Bed className="h-2.5 w-2.5 text-green-600" />
          
                                <span className="text-green-600">{availableBeds}</span>/
                                <span>{room.total_bed}</span>
                              </div>
                              
                              
                            </div>
                          </div>
                          
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              <p className="text-[9px] text-gray-500">Leave empty to apply offer to all rooms in selected property</p>
            </div>
          )}
        </div>

        {/* Room Summary when no beds data available */}
        {formData.room_id && selectedRoom && (!selectedRoom.bed_assignments || selectedRoom.bed_assignments.length === 0) && (
          <div className="mt-2 pt-2 border-t border-purple-200">
            <div className="flex items-center justify-between text-[10px] p-2 bg-white/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Bed className="h-3 w-3 text-gray-500" />
                <span>Total Beds: {selectedRoom.total_bed}</span>
                <span>Available: {(selectedRoom.available_beds !== undefined ? selectedRoom.available_beds : selectedRoom.total_bed - selectedRoom.occupied_beds)}</span>
                <span>Occupied: {selectedRoom.occupied_beds}</span>
              </div>
              {(selectedRoom.available_beds === 0 || selectedRoom.total_bed - selectedRoom.occupied_beds === 0) && (
                <Badge variant="outline" className="text-red-600 border-red-200 text-[8px]">
                  Fully Occupied
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Code + Type + Title ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* Offer Code */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between">
            <Label className={lbl + " flex items-center gap-0.5"}>
              <Ticket className="h-2.5 w-2.5" /> Code *
            </Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onGenerateCode}
              disabled={isGeneratingCode}
              className="h-5 text-[9px] px-1.5"
            >
              {isGeneratingCode ? <RefreshCw className="h-2.5 w-2.5 animate-spin" /> : "Generate"}
            </Button>
          </div>
          <div className="relative">
            <Ticket className="absolute left-2 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-gray-400" />
            <Input
              placeholder="NEWYEAR25"
              value={formData.code}
              onChange={handleCodeChange}
              className={`${inp} pl-6 ${codeError ? 'border-red-400' : ''}`}
            />
          </div>
          {codeError
            ? <p className="text-[9px] text-red-500">{codeError}</p>
            : <p className="text-[9px] text-gray-400">Min 3 chars</p>}
        </div>

        {/* Offer Type */}
        <div className="space-y-0.5">
          <Label className={lbl + " flex items-center gap-0.5"}>
            <Tag className="h-2.5 w-2.5" /> Type
          </Label>
          <Select value={formData.offer_type} onValueChange={handleSelectChange("offer_type")}>
            <SelectTrigger className={inp}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {["general","seasonal","student","corporate","referral","early_booking"].map(t => (
                <SelectItem key={t} value={t} className="text-xs capitalize">{t.replace("_"," ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-0.5 col-span-2 sm:col-span-1">
          <Label className={lbl + " flex items-center gap-0.5"}>
            <Megaphone className="h-2.5 w-2.5" /> Title *
          </Label>
          <div className="relative">
            <Megaphone className="absolute left-2 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-gray-400" />
            <Input
              placeholder="New Year Special"
              value={formData.title}
              onChange={handleInputChange("title")}
              className={`${inp} pl-6`}
            />
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      <div className="space-y-0.5">
        <Label className={lbl + " flex items-center gap-0.5"}>
          <BellRing className="h-2.5 w-2.5" /> Description
        </Label>
        <Textarea
          placeholder="Brief description to attract tenants"
          rows={2}
          value={formData.description}
          onChange={handleInputChange("description")}
          className="text-[11px] resize-none border-gray-200 focus:border-blue-400"
        />
      </div>

      {/* ── Discount Details ── */}
      <div className={`${sec} bg-blue-50 border-blue-200`}>
        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Discount Details</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="space-y-0.5">
            <Label className={lbl}>Type *</Label>
            <Select value={formData.discount_type} onValueChange={handleSelectChange("discount_type")}>
              <SelectTrigger className={inp}>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage" className="text-xs">Percentage</SelectItem>
                <SelectItem value="fixed" className="text-xs">Fixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.discount_type === "percentage" ? (
            <div className="space-y-0.5">
              <Label className={lbl}>Discount %</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="20"
                  value={formData.discount_percent}
                  onChange={handleInputChange("discount_percent")}
                  className={`${inp} pr-5`}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-400">%</span>
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              <Label className={lbl}>Amount ₹</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="5000"
                  value={formData.discount_value}
                  onChange={handleInputChange("discount_value")}
                  className={`${inp} pr-5`}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-400">₹</span>
              </div>
            </div>
          )}

          <div className="space-y-0.5">
            <Label className={lbl}>Min Stay</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="3"
                value={formData.min_months}
                onChange={handleInputChange("min_months")}
                className={`${inp} pr-10`}
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-gray-400">mo</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <Label className={lbl}>Valid From</Label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={handleInputChange("start_date")}
              className={inp}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="space-y-0.5">
            <Label className={lbl}>Valid Until</Label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={handleInputChange("end_date")}
              className={inp}
            />
          </div>
        </div>
      </div>

      {/* ── Bonus ── */}
      <div className={`${sec} bg-amber-50 border-amber-200`}>
        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Bonus (Optional)
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <Label className={lbl}>Title</Label>
            <Input
              placeholder="1 month FREE"
              value={formData.bonus_title}
              onChange={handleInputChange("bonus_title")}
              className={inp}
            />
          </div>
          <div className="space-y-0.5">
            <Label className={lbl}>Valid Until</Label>
            <Input
              type="date"
              value={formData.bonus_valid_until}
              onChange={handleInputChange("bonus_valid_until")}
              className={inp}
            />
          </div>
        </div>
        <div className="space-y-0.5">
          <Label className={lbl}>Description</Label>
          <Input
            placeholder="Book 12 months, get 1 month free!"
            value={formData.bonus_description}
            onChange={handleInputChange("bonus_description")}
            className={inp}
          />
        </div>
      </div>

      {/* ── Terms + Priority + Status ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
        <div className="space-y-0.5 sm:col-span-2">
          <Label className={lbl}>Terms & Conditions</Label>
          <Textarea
            placeholder="Enter terms and conditions..."
            rows={2}
            value={formData.terms_and_conditions}
            onChange={handleInputChange("terms_and_conditions")}
            className="text-[11px] resize-none border-gray-200 focus:border-blue-400"
          />
        </div>
        <div className="flex flex-row sm:flex-col gap-3 sm:gap-2">
          <div className="space-y-0.5 flex-1">
            <Label className={lbl}>Priority</Label>
            <Input
              type="text"
              placeholder="0"
              value={formData.display_order}
              onChange={handleInputChange("display_order")}
              className={inp}
            />
          </div>
          <div className="flex items-center justify-between gap-2 flex-1 sm:flex-none">
            <Label className={lbl}>Active</Label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              className="scale-90"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferForm;