"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import React from 'react';
import {
  Bed, UserRound, UsersRound, ArrowRight, IndianRupee, AlertCircle, Check,
  CalendarIcon, RefreshCw, Home, ChevronLeft, Loader2, ChevronRight,
  MapPin, Info, Search, Building, Sparkles, UserCheck,
  ShieldCheck, ArrowUpRight, ArrowDownRight, Minus, Eye,
  Clock, MessageSquare, FileText, KeyRound, DoorOpen, Users,
  User, Hash, Tag, Building2, Circle
} from 'lucide-react';
import {
  getCurrentAssignment,
  getCompatibleRooms,
  getAvailableBeds,
  calculateRentDifference,
  executeBedChange,
  type ChangeReason,
  type CompatibleRoom,
  type AvailableBed,
  type RentDifference,
  type BedsResponse,
  type CurrentAssignment
} from '@/lib/changeBedApi';
import { consumeMasters } from "@/lib/masterApi";

interface ChangeBedWizardProps {
  tenantId: number;
  tenantName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface MasterValue {
  id: number;
  name: string;
  isactive: number;
}

type WizardStep = 
  | 'reason'
  | 'sharing'
  | 'room'
  | 'bed'
  | 'date'
  | 'rent'
  | 'confirm';

export function ChangeBedWizard({ tenantId, tenantName, open, onOpenChange, onSuccess }: ChangeBedWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('reason');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [selectedSharingType, setSelectedSharingType] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<CompatibleRoom | null>(null);
  const [selectedBed, setSelectedBed] = useState<AvailableBed | null>(null);
  const [shiftingDate, setShiftingDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [confirmRent, setConfirmRent] = useState(false);
  
  // Data states
  const [currentAssignment, setCurrentAssignment] = useState<CurrentAssignment | null>(null);
  const [compatibleRooms, setCompatibleRooms] = useState<CompatibleRoom[]>([]);
  const [availableBeds, setAvailableBeds] = useState<AvailableBed[]>([]);
  const [bedsResponse, setBedsResponse] = useState<BedsResponse | null>(null);
  const [rentDifference, setRentDifference] = useState<RentDifference | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Master data states
  const [roomsMasters, setRoomsMasters] = useState<Record<string, MasterValue[]>>({});
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [sharingTypes, setSharingTypes] = useState<any[]>([]);
  const [changeReasons, setChangeReasons] = useState<ChangeReason[]>([]);

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
        
        // Set sharing types from masters
        if (grouped["Sharing Type"] && grouped["Sharing Type"].length > 0) {
          const types = grouped["Sharing Type"].map(type => {
            const typeName = type.name.toLowerCase();
            let icon = <Users className="h-5 w-5" />;
            let color = "bg-purple-50";
            let borderColor = "border-purple-300";
            let textColor = "text-purple-700";
            
            if (typeName.includes('single')) {
              icon = <UserRound className="h-5 w-5" />;
              color = "bg-blue-50";
              borderColor = "border-blue-300";
              textColor = "text-blue-700";
            } else if (typeName.includes('double')) {
              icon = <UsersRound className="h-5 w-5" />;
              color = "bg-green-50";
              borderColor = "border-green-300";
              textColor = "text-green-700";
            } else if (typeName.includes('triple')) {
              icon = <Users className="h-5 w-5" />;
              color = "bg-purple-50";
              borderColor = "border-purple-300";
              textColor = "text-purple-700";
            }
            
            // Extract capacity from name
            let capacity = 2;
            if (typeName.includes('single')) capacity = 1;
            else if (typeName.includes('double')) capacity = 2;
            else if (typeName.includes('triple')) capacity = 3;
            
            return {
              value: typeName,
              label: type.name,
              icon: icon,
              description: `${capacity} person${capacity > 1 ? 's' : ''}`,
              color: color,
              borderColor: borderColor,
              textColor: textColor,
              hoverColor: `hover:${color.replace('50', '100')} hover:${borderColor.replace('300', '400')}`
            };
          });
          setSharingTypes(types);
        }

        // Set change reasons from masters
        if (grouped["Change Reason"] && grouped["Change Reason"].length > 0) {
          const reasons = grouped["Change Reason"].map(reason => ({
            id: reason.id,
            value: reason.name
          }));
          setChangeReasons(reasons);
        }
      }
    } catch (error) {
      console.error("Failed to fetch rooms masters:", error);
      toast.error("Failed to load master data");
    } finally {
      setLoadingMasters(false);
    }
  };

  // Initialize
  useEffect(() => {
    if (open) {
      resetForm();
      fetchRoomsMasters();
      loadCurrentAssignment();
    }
  }, [open, tenantId]);

  const resetForm = () => {
    setCurrentStep('reason');
    setSelectedReason('');
    setSelectedSharingType('');
    setSelectedRoom(null);
    setSelectedBed(null);
    setShiftingDate(new Date());
    setNotes('');
    setConfirmRent(false);
    setCurrentAssignment(null);
    setCompatibleRooms([]);
    setAvailableBeds([]);
    setBedsResponse(null);
    setRentDifference(null);
    setSearchQuery('');
    setErrorDetails(null);
  };

  const loadCurrentAssignment = async () => {
    setLoading(true);
    try {
      const assignment = await getCurrentAssignment(tenantId);
      if (assignment) {
        setCurrentAssignment(assignment);
      } else {
        toast.error('Tenant is not currently assigned to any bed');
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Failed to load current assignment:', error);
      toast.error('Failed to load current assignment');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Handle reason selection
  const handleReasonSelect = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason');
      return;
    }
    setCurrentStep('sharing');
  };

  // Step 2: Handle sharing type selection and load rooms
  const handleSharingTypeSelect = async () => {
    if (!selectedSharingType) {
      toast.error('Please select a sharing type');
      return;
    }
    
    setLoading(true);
    setErrorDetails(null);
    try {
      const result = await getCompatibleRooms({
        tenantId,
        sharingType: selectedSharingType || undefined
      });

      if (result) {
        setCompatibleRooms(result.compatible_rooms || []);
        if (result.current_assignment) {
          setCurrentAssignment(result.current_assignment);
        }
        
        if ((result.compatible_rooms || []).length > 0) {
          setCurrentStep('room');
        } else {
          toast.warning('No compatible rooms found');
          setCurrentStep('room');
        }
      } else {
        toast.error('Failed to load compatible rooms');
      }
    } catch (error: any) {
      console.error('Error loading compatible rooms:', error);
      toast.error(error.message || 'Failed to load compatible rooms');
      setCompatibleRooms([]);
      setCurrentStep('room');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle room selection and load beds
  const handleRoomSelect = async (room: CompatibleRoom) => {
    setSelectedRoom(room);
    setLoading(true);
    try {
      const result = await getAvailableBeds(room.id);
      if (result && result.beds) {
        setBedsResponse(result);
        // Filter only available beds for selection
        const available = result.beds.filter(bed => bed.status === 'available');
        setAvailableBeds(available);
        
        if (available.length > 0) {
          setCurrentStep('bed');
        } else {
          toast.error('No available beds in this room');
        }
      } else {
        toast.error('Failed to load bed information');
      }
    } catch (error: any) {
      console.error('Error loading available beds:', error);
      toast.error(error.message || 'Failed to load bed information');
    } finally {
      setLoading(false);
    }
  };

  const handleBedSelect = async (bed: AvailableBed) => {
    setSelectedBed(bed);
    
    // CRITICAL FIX: Only calculate rent if we have both room IDs
    if (currentAssignment && selectedRoom) {
      try {
        console.log('Calculating rent difference:', {
          oldRoomId: currentAssignment.room_id,
          newRoomId: selectedRoom.id
        });
        
        const rentDiff = await calculateRentDifference(
          currentAssignment.room_id,
          selectedRoom.id
        );
        
        console.log('Rent difference result:', rentDiff);
        setRentDifference(rentDiff);
        
        // If rent calculation succeeds, proceed to date selection
        setCurrentStep('date');
        
      } catch (error) {
        console.error('Error calculating rent difference:', error);
        toast.warning('Could not calculate rent difference. Proceeding anyway...');
        // Continue to date step even if rent calculation fails
        setCurrentStep('date');
      }
    } else {
      console.error('Missing room information for rent calculation');
      toast.warning('Please select a room first');
    }
  };

  // Step 5: Handle date selection
  const handleDateSelect = () => {
    setCurrentStep('rent');
  };

  // Step 6: Handle rent preview
  const handleRentPreviewContinue = () => {
    if (rentDifference?.type === 'increase' && !confirmRent) {
      toast.error('Please confirm the rent increase to proceed');
      return;
    }
    setCurrentStep('confirm');
  };

  // Final step: Execute change
  const handleExecuteChange = async () => {
    if (!currentAssignment || !selectedRoom || !selectedBed || !selectedReason) {
      toast.error('Missing required information');
      return;
    }

    setSubmitting(true);
    setErrorDetails(null);
    try {
      const result = await executeBedChange({
        tenantId,
        currentAssignmentId: currentAssignment.assignment_id,
        newRoomId: selectedRoom.id,
        newBedNumber: selectedBed.bed_number,
        changeReasonId: parseInt(selectedReason),
        shiftingDate: shiftingDate.toISOString().split('T')[0],
        notes
      });

      if (result.success) {
        toast.success('Bed changed successfully!');
        if (onSuccess) onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.message || 'Failed to execute bed change');
      }
    } catch (error: any) {
      console.error('Error executing bed change:', error);
      const errorMsg = error.message || 'Failed to execute bed change';
      toast.error(errorMsg);
      setErrorDetails(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter rooms based on search query
  const filteredRooms = Array.isArray(compatibleRooms) 
    ? searchQuery
      ? compatibleRooms.filter(room =>
          room?.room_number?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
          room?.property_name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : compatibleRooms
    : [];

  // Render room occupants details
  const renderRoomOccupants = (room: CompatibleRoom) => {
    // Use the ACTUAL count from backend
    const actualOccupantsCount = room.occupants_count || 0;
    const hasOccupants = actualOccupantsCount > 0 && 
                        room.current_occupants && 
                        room.current_occupants.length > 0;

    if (!hasOccupants) {
      return (
        <div className="flex items-center text-xs text-gray-500">
          <User className="h-3 w-3 mr-1" />
          No occupants
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center text-xs font-medium text-gray-700">
          <Users className="h-3 w-3 mr-1" />
          Current Occupants ({actualOccupantsCount})
        </div>
        <div className="space-y-1">
          {room.current_occupants.map((occupant, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs pl-2">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <span className="truncate max-w-[120px]">{occupant.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                  Bed {occupant.bed_number}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs px-1 py-0 h-5",
                    occupant.gender === 'Male' ? "bg-blue-50 text-blue-700 border-blue-200" :
                    occupant.gender === 'Female' ? "bg-pink-50 text-pink-700 border-pink-200" :
                    "bg-gray-50 text-gray-700 border-gray-200"
                  )}
                >
                  {occupant.gender}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render room gender preferences
  const renderRoomPreferences = (preferences: string[] = []) => {
    if (!preferences || preferences.length === 0) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100">
          Any
        </Badge>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {preferences.map((pref, idx) => {
          let colorClass = "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200";
          let label = String(pref);
          
          if (pref === 'male' || pref === 'Male') {
            colorClass = "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200";
          } else if (pref === 'female' || pref === 'Female') {
            colorClass = "bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200";
          } else if (pref === 'any' || pref === 'Any') {
            colorClass = "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200";
          } else if (pref === 'couples') {
            colorClass = "bg-green-100 text-green-800 border-green-300 hover:bg-green-200";
          }
          
          return (
            <Badge key={idx} variant="outline" className={`text-xs ${colorClass}`}>
              {label}
            </Badge>
          );
        })}
      </div>
    );
  };

  // Render room details for bed selection step
  const renderRoomDetails = () => {
    if (!selectedRoom) return null;

    return (
      <Card className="border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-800">Selected Room</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200">
              {selectedRoom.available_beds} bed{selectedRoom.available_beds !== 1 ? 's' : ''} available
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600 text-xs">Room Number</p>
                <p className="font-medium">Room {selectedRoom.room_number}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs">Sharing Type</p>
                <p className="font-medium capitalize">{selectedRoom.sharing_type}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs">Total Beds</p>
                <p className="font-medium">{selectedRoom.total_bed}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs">Monthly Rent</p>
                <p className="font-medium text-green-600 flex items-center">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  {selectedRoom.rent_per_bed}
                </p>
              </div>
            </div>
            
            {/* Gender Preferences */}
            <div className="pt-2 border-t border-blue-200">
              <div className="flex items-center gap-2 mb-2 text-xs font-medium text-gray-700">
                <Tag className="h-3 w-3" />
                <span>Gender Preferences:</span>
              </div>
              {renderRoomPreferences(selectedRoom.room_gender_preference)}
            </div>
            
            {/* Room Occupants */}
            {selectedRoom.occupants_count > 0 && (
              <div className="pt-2 border-t border-blue-200">
                <div className="flex items-center gap-2 mb-2 text-xs font-medium text-gray-700">
                  <Users className="h-3 w-3" />
                  <span>Currently Occupied by:</span>
                </div>
                <div className="space-y-1">
                  {selectedRoom.current_occupants?.map((occupant, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs pl-2">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                        <span>{occupant.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                          Bed {occupant.bed_number}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs px-1 py-0 h-5",
                            occupant.gender === 'Male' ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-pink-50 text-pink-700 border-pink-200"
                          )}
                        >
                          {occupant.gender}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStepContent = () => {
    if (loadingMasters && currentStep === 'reason') {
      return (
        <div className="py-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">Loading Masters...</h3>
          <p className="text-sm text-gray-500">Fetching change reasons and sharing types</p>
        </div>
      );
    }

    const stepComponents = {
      'reason': (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Why change bed?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Select the reason for {tenantName}'s bed change
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Change Reason <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger className="h-11 border-gray-300 focus:ring-blue-500 hover:border-gray-400">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {changeReasons.length > 0 ? (
                  changeReasons.map(reason => (
                    <SelectItem key={reason.id} value={reason.id.toString()} className="py-3 hover:bg-blue-50">
                      <div className="flex items-center gap-3">
                        <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                        <span>{reason.value}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">No change reasons found</div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),

      'sharing': (
        <div className="space-y-4">
          <div className="text-center mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-base font-bold text-gray-800">Sharing Type</h3>
            <p className="text-xs text-gray-500 mt-1">
              Select room sharing preference
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1.5 mb-1">
              <KeyRound className="h-3 w-3 text-green-500" />
              Sharing Type <span className="text-red-500">*</span>
            </Label>
            <RadioGroup 
              value={selectedSharingType} 
              onValueChange={setSelectedSharingType}
              className="grid grid-cols-2 gap-2"
            >
              {sharingTypes.map(type => (
                <div key={type.value}>
                  <RadioGroupItem 
                    value={type.value} 
                    id={`type-${type.value}`} 
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor={`type-${type.value}`}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-md border p-2.5 cursor-pointer transition-all duration-150 min-h-[70px]",
                      type.borderColor,
                      type.color,
                      type.hoverColor,
                      "peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-blue-200",
                      selectedSharingType === type.value && "border-blue-500 ring-1 ring-blue-200"
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className={cn("p-1 rounded", type.color)}>
                        <span className={type.textColor}>
                          {React.cloneElement(type.icon, { className: "h-3.5 w-3.5" })}
                        </span>
                      </div>
                      <span className={cn("text-xs font-medium", type.textColor)}>
                        {type.label}
                      </span>
                    </div>
                    {type.description && (
                      <span className={cn("text-[10px] mt-1", type.textColor.replace("700", "600"))}>
                        {type.description}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      ),

      'room': (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DoorOpen className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-md font-bold text-gray-800">Select New Room</h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose a compatible room with available beds
            </p>
          </div>
          
          {/* Current Room Preview */}
          {currentAssignment && (
            <Card className="border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-semibold text-blue-800">Current Assignment</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200">Occupied</Badge>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs">Room</p>
                      <p className="font-medium">Room {currentAssignment.room_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Bed</p>
                      <p className="font-medium">Bed {currentAssignment.bed_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Sharing</p>
                      <p className="font-medium capitalize">{currentAssignment.sharing_type}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Rent</p>
                      <p className="font-medium text-green-600 flex items-center">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {currentAssignment.rent_per_bed}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
                    <Badge variant="outline" className="bg-white text-blue-700 border-blue-300 hover:bg-blue-50">
                      {currentAssignment.tenant_gender}
                    </Badge>
                    <span className="text-xs text-gray-600">
                      {currentAssignment.property_name}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Search bar */}
          {filteredRooms.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms by number or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
              />
            </div>
          )}
          
          {/* Rooms List */}
          <div className="space-y-3">
            {loading ? (
              <div className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-gray-600">Finding compatible rooms...</p>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-700">No rooms available</h4>
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  {compatibleRooms.length === 0
                    ? 'No compatible rooms found for selected criteria'
                    : 'No rooms match your search'}
                </p>
                {compatibleRooms.length === 0 && (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('sharing')}
                      size="sm"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700"
                    >
                      Try Different Sharing Type
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
                {filteredRooms.map((room) => (
                  <Card
                    key={room.id}
                    className={cn(
                      "border cursor-pointer transition-all duration-200",
                      selectedRoom?.id === room.id
                        ? "border-blue-500 border-2 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    )}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <CardContent className="p-4">
                      {/* Room Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-800 text-md">Room {room.room_number}</h4>
                            <Badge variant="outline" className="bg-white capitalize hover:bg-gray-50">
                              {room.sharing_type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{room.property_name}</span>
                            {room.floor && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span>Floor {room.floor}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2">
                            <Badge className={cn(
                              "text-xs capitalize",
                              room.occupants_gender === 'empty' && "bg-green-100 text-green-800 border-green-300 hover:bg-green-200",
                              room.occupants_gender === 'male' && "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200",
                              room.occupants_gender === 'female' && "bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200",
                              room.occupants_gender === 'mixed' && "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
                            )}>
                              {room.occupants_gender === 'empty' ? 'Empty' : room.occupants_gender}
                            </Badge>
                            <span className="text-sm font-bold text-green-600 flex items-center">
                              <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
                              {room.rent_per_bed}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {room.available_beds} bed{room.available_beds !== 1 ? 's' : ''} available
                          </div>
                        </div>
                      </div>
                      
                      {/* Room Details */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="flex flex-col items-center p-2 bg-white rounded-md border border-gray-200 hover:bg-gray-50">
                          <Bed className="h-4 w-4 text-gray-500 mb-1" />
                          <span className="text-sm font-semibold">{room.available_beds}/{room.total_bed}</span>
                          <span className="text-xs text-gray-500">Available</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-white rounded-md border border-gray-200 hover:bg-gray-50">
                          <UsersRound className="h-4 w-4 text-gray-500 mb-1" />
                          <span className="text-sm font-semibold">{room.occupants_count}</span>
                          <span className="text-xs text-gray-500">Occupants</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-white rounded-md border border-gray-200 hover:bg-gray-50">
                          <Eye className="h-4 w-4 text-gray-500 mb-1" />
                          <span className={cn(
                            "text-sm font-semibold",
                            room.available_beds > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {room.available_beds > 0 ? 'Available' : 'Full'}
                          </span>
                          <span className="text-xs text-gray-500">Status</span>
                        </div>
                      </div>
                      
                      {/* Gender Preferences */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                          <Tag className="h-3 w-3" />
                          <span>Gender Preference:</span>
                        </div>
                        {renderRoomPreferences(room.room_gender_preference)}
                      </div>
                      
                      {/* Current Occupants */}
                      <div className="border-t border-gray-200 pt-3">
                        {renderRoomOccupants(room)}
                      </div>
                      
                      {/* Select Button */}
                      <div className="flex justify-end ">
                        <Button
                          size="sm"
                          variant={selectedRoom?.id === room.id ? "default" : "outline"}
                          className={cn(
                            "transition-all",
                            selectedRoom?.id === room.id 
                              ? "bg-blue-600 hover:bg-blue-700 text-white" 
                              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                          )}
                        >
                          {selectedRoom?.id === room.id ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Selected
                            </>
                          ) : (
                            'Select Room'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      ),

      'bed': (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bed className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-md font-bold text-gray-800">Select Bed</h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose an available bed in the selected room
            </p>
          </div>
          
          {/* Selected Room Details */}
          {renderRoomDetails()}
          
          {/* Available Beds */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Available Beds in Room {selectedRoom?.room_number}
              </span>
              <Badge variant="outline" className="text-xs bg-white hover:bg-gray-50">
                {availableBeds.length} available
              </Badge>
            </Label>
            
            {loading ? (
              <div className="py-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-gray-600">Loading available beds...</p>
              </div>
            ) : availableBeds.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <Bed className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-700">No beds available</h4>
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  This room has no available beds
                </p>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('room')}
                  size="sm"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                >
                  Choose Different Room
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {availableBeds.map(bed => (
                  <Button
                    key={bed.bed_number}
                    variant={selectedBed?.bed_number === bed.bed_number ? "default" : "outline"}
                    className={cn(
                      "h-auto py-4 flex-col relative overflow-hidden border transition-all",
                      selectedBed?.bed_number === bed.bed_number 
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                        : "border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                    )}
                    onClick={() => handleBedSelect(bed)}
                  >
                    {selectedBed?.bed_number === bed.bed_number && (
                      <div className="absolute top-0 right-0 w-4 h-4 bg-white rounded-bl-full flex items-center justify-center">
                        <Check className="h-2 w-2 text-blue-600" />
                      </div>
                    )}
                    <Bed className={cn(
                      "h-6 w-6 mb-2",
                      selectedBed?.bed_number === bed.bed_number ? "text-white" : "text-blue-600"
                    )} />
                    <span className="text-base font-bold">Bed {bed.bed_number}</span>
                    <span className="text-xs mt-1 opacity-80">Available</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      ),

      'date': (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="h-5 w-5 text-cyan-600" />
            </div>
            <h3 className="text-md font-bold text-gray-800">Shifting Date</h3>
            <p className="text-sm text-gray-600 mt-1">
              When will {tenantName} move to the new bed?
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Current Room */}
            <Card className="border-blue-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <h4 className="text-sm font-semibold text-blue-700">Current Assignment</h4>
                </div>
                {currentAssignment && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">{currentAssignment.room_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Bed:</span>
                      <span className="font-medium">{currentAssignment.bed_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rent:</span>
                      <span className="font-medium text-green-600 flex items-center">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {currentAssignment.rent_per_bed}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sharing:</span>
                      <span className="font-medium capitalize">{currentAssignment.sharing_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Check-in date:</span>
                      <span className="font-medium">
                        {currentAssignment.check_in_date 
                          ? format(new Date(currentAssignment.check_in_date), 'MMM dd, yyyy')
                          : 'Not set'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* New Room */}
            <Card className="border-green-200 hover:border-green-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <h4 className="text-sm font-semibold text-green-700">New Assignment</h4>
                </div>
                {selectedRoom && selectedBed && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">{selectedRoom.room_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Bed:</span>
                      <span className="font-medium">{selectedBed.bed_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rent:</span>
                      <span className="font-medium text-green-600 flex items-center">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {selectedRoom.rent_per_bed}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sharing:</span>
                      <span className="font-medium capitalize">{selectedRoom.sharing_type}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-500" />
              Shifting Date <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-11 justify-start text-left font-normal border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-700",
                    !shiftingDate && "text-gray-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-cyan-600" />
                  {shiftingDate ? format(shiftingDate, "MMM dd, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={shiftingDate}
                  onSelect={(date) => date && setShiftingDate(date)}
                  initialFocus
                  className="border-0"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ),

      'rent': (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <IndianRupee className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-md font-bold text-gray-800">Rent Change Preview</h3>
            <p className="text-sm text-gray-600 mt-1">
              Review the rent difference before proceeding
            </p>
          </div>
          
          {rentDifference && (
            <Card className={cn(
              "border-2 overflow-hidden",
              rentDifference.type === 'increase' && "border-amber-200 bg-amber-50",
              rentDifference.type === 'decrease' && "border-emerald-200 bg-emerald-50",
              rentDifference.type === 'same' && "border-blue-200 bg-blue-50"
            )}>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    {rentDifference.type === 'increase' && <ArrowUpRight className="h-7 w-7 text-amber-600 mr-2" />}
                    {rentDifference.type === 'decrease' && <ArrowDownRight className="h-7 w-7 text-emerald-600 mr-2" />}
                    {rentDifference.type === 'same' && <Minus className="h-7 w-7 text-blue-600 mr-2" />}
                    <div>
                      <h3 className={cn(
                        "text-xl font-bold",
                        rentDifference.type === 'increase' && "text-amber-600",
                        rentDifference.type === 'decrease' && "text-emerald-600",
                        rentDifference.type === 'same' && "text-blue-600"
                      )}>
                        {rentDifference.type === 'increase' ? '+' : rentDifference.type === 'decrease' ? '-' : ''}
                        <IndianRupee className="inline h-5 w-5 mr-0.5" />
                        {Math.abs(rentDifference.difference).toFixed(2)}
                      </h3>
                      <Badge className={cn(
                        "mt-2 text-xs py-1 px-2",
                        rentDifference.type === 'increase' && "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200",
                        rentDifference.type === 'decrease' && "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200",
                        rentDifference.type === 'same' && "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
                      )}>
                        {rentDifference.type === 'increase' && 'Rent Increase'}
                        {rentDifference.type === 'decrease' && 'Rent Decrease'}
                        {rentDifference.type === 'same' && 'No Change'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Room Numbers */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-xs text-gray-500 mb-1">From Room</p>
                      <p className="text-sm font-semibold">Room {rentDifference.old_room_number}</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-xs text-gray-500 mb-1">To Room</p>
                      <p className="text-sm font-semibold">Room {rentDifference.new_room_number}</p>
                    </div>
                  </div>
                  
                  {/* Rent Comparison */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-xs text-gray-500 mb-1">Current Rent</p>
                      <p className="text-lg font-bold flex items-center justify-center">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {rentDifference.old_rent.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-xs text-gray-500 mb-1">New Rent</p>
                      <p className="text-lg font-bold text-green-600 flex items-center justify-center">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {rentDifference.new_rent.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {rentDifference?.type === 'increase' && (
            <div className="flex items-start gap-2 p-3 border border-amber-200 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">Rent Increase Notice</p>
                <p className="text-xs text-amber-700 mt-1">
                  The new room has higher rent. Tenant approval is required.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="confirm-rent"
                    checked={confirmRent}
                    onChange={(e) => setConfirmRent(e.target.checked)}
                    className="h-4 w-4 text-amber-600 rounded border-amber-400 focus:ring-amber-500"
                  />
                  <label htmlFor="confirm-rent" className="text-xs text-amber-700 cursor-pointer">
                    Tenant has approved the rent increase
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {/* Summary Card */}
          <Card className="border-gray-300 hover:border-gray-400 transition-colors">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Change Summary</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Tenant</p>
                  <p className="font-medium">{tenantName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">New Room</p>
                  <p className="font-medium">Room {selectedRoom?.room_number}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">New Bed</p>
                  <p className="font-medium">Bed {selectedBed?.bed_number}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Shifting Date</p>
                  <p className="font-medium">{format(shiftingDate, 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),

      'confirm': (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-md font-bold text-gray-800">Confirm Changes</h3>
            <p className="text-sm text-gray-600 mt-1">
              Review all details before finalizing the change
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Current Assignment */}
            <Card className="border-blue-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <h4 className="text-sm font-semibold text-blue-700">Current Assignment</h4>
                </div>
                {currentAssignment && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">{currentAssignment.room_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bed:</span>
                      <span className="font-medium">{currentAssignment.bed_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rent:</span>
                      <span className="font-medium text-green-600 flex items-center">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {currentAssignment.rent_per_bed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{currentAssignment.sharing_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs hover:bg-blue-50",
                          currentAssignment.tenant_gender === 'Male' ? "bg-blue-50 text-blue-700 border-blue-300" :
                          "bg-pink-50 text-pink-700 border-pink-300"
                        )}
                      >
                        {currentAssignment.tenant_gender}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in date:</span>
                      <span className="font-medium">
                        {currentAssignment.check_in_date 
                          ? format(new Date(currentAssignment.check_in_date), 'MMM dd, yyyy')
                          : 'Not set'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* New Assignment */}
            <Card className="border-green-200 hover:border-green-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <h4 className="text-sm font-semibold text-green-700">New Assignment</h4>
                </div>
                {selectedRoom && selectedBed && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">{selectedRoom.room_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bed:</span>
                      <span className="font-medium">{selectedBed.bed_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rent:</span>
                      <span className="font-medium text-green-600 flex items-center">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {selectedRoom.rent_per_bed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{selectedRoom.sharing_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property:</span>
                      <span className="font-medium">{selectedRoom.property_name}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Details Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">
              <p className="text-gray-500 text-xs">Shifting Date</p>
              <p className="font-medium text-sm">{format(shiftingDate, 'MMM dd, yyyy')}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">
              <p className="text-gray-500 text-xs">Change Reason</p>
              <p className="font-medium text-sm truncate">
                {changeReasons.find(r => r.id.toString() === selectedReason)?.value || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">
              <p className="text-gray-500 text-xs">Rent Change</p>
              <p className={cn(
                "font-medium text-sm flex items-center",
                rentDifference?.type === 'increase' && "text-amber-600",
                rentDifference?.type === 'decrease' && "text-emerald-600",
                rentDifference?.type === 'same' && "text-blue-600"
              )}>
                {rentDifference?.type === 'increase' ? '+' : rentDifference?.type === 'decrease' ? '-' : ''}
                <IndianRupee className="h-3 w-3 mr-0.5" />
                {Math.abs(rentDifference?.difference || 0).toFixed(2)}
              </p>
            </div>
          </div>
          
          {/* Notes */}
          {notes && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">
              <p className="text-gray-500 text-xs mb-1">Additional Notes</p>
              <p className="text-sm text-gray-800">{notes}</p>
            </div>
          )}
          
          {/* Error Display */}
          {errorDetails && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 hover:bg-red-100 transition-colors">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">Error Details</p>
                  <p className="text-xs text-red-700">{errorDetails}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    };

    return stepComponents[currentStep] || null;
  };

  const renderStepActions = () => {
    const isNextDisabled = 
      (currentStep === 'reason' && !selectedReason) ||
      (currentStep === 'sharing' && selectedSharingType === '') ||
      (currentStep === 'room' && !selectedRoom) ||
      (currentStep === 'bed' && !selectedBed) ||
      (currentStep === 'rent' && rentDifference?.type === 'increase' && !confirmRent);

    return (
      <div className="flex justify-between pt-4 border-t border-gray-300">
        {currentStep === 'reason' ? (
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            size="sm"
            className="border-gray-400 hover:bg-gray-100 hover:border-gray-500"
          >
            Cancel
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => {
              // Go back to previous step
              if (currentStep === 'sharing') setCurrentStep('reason');
              else if (currentStep === 'room') setCurrentStep('sharing');
              else if (currentStep === 'bed') setCurrentStep('room');
              else if (currentStep === 'date') setCurrentStep('bed');
              else if (currentStep === 'rent') setCurrentStep('date');
              else if (currentStep === 'confirm') setCurrentStep('rent');
            }}
            disabled={loading || submitting}
            size="sm"
            className="border-gray-400 hover:bg-gray-100 hover:border-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            Back
          </Button>
        )}
        
        {currentStep === 'confirm' ? (
          <Button 
            onClick={handleExecuteChange} 
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
            size="sm"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="h-3 w-3 mr-1" />
                Confirm & Change
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={() => {
              if (currentStep === 'reason') handleReasonSelect();
              else if (currentStep === 'sharing') handleSharingTypeSelect();
              else if (currentStep === 'room' && selectedRoom) handleRoomSelect(selectedRoom);
              else if (currentStep === 'bed' && selectedBed) handleBedSelect(selectedBed);
              else if (currentStep === 'date') handleDateSelect();
              else if (currentStep === 'rent') handleRentPreviewContinue();
            }}
            disabled={isNextDisabled || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ArrowRight className="h-3 w-3 mr-1" />
                {currentStep === 'rent' ? 'Review' : 'Continue'}
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  const steps = [
    { key: 'reason', label: 'Reason', icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { key: 'sharing', label: 'Type', icon: <Users className="h-3.5 w-3.5" /> },
    { key: 'room', label: 'Room', icon: <DoorOpen className="h-3.5 w-3.5" /> },
    { key: 'bed', label: 'Bed', icon: <Bed className="h-3.5 w-3.5" /> },
    { key: 'date', label: 'Date', icon: <CalendarIcon className="h-3.5 w-3.5" /> },
    { key: 'rent', label: 'Rent', icon: <IndianRupee className="h-3.5 w-3.5" /> },
    { key: 'confirm', label: 'Confirm', icon: <ShieldCheck className="h-3.5 w-3.5" /> }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const progressValue = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-gray-300 shadow-xl p-0">
        {/* Header - ULTRA COMPACT */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <div>
                <DialogTitle className="text-base font-bold">
                  Change Bed
                </DialogTitle>
                <DialogDescription className="text-blue-100 text-xs">
                  {tenantName}
                </DialogDescription>
              </div>
            </div>
            <div className="text-xs bg-white/20 px-2 py-1 rounded">
              Step {currentStepIndex + 1}/{steps.length}
            </div>
          </div>
        </div>
        
        {/* Step Indicator - MINIMAL WITH ICONS */}
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between gap-0.5">
            {steps.map((step, index) => (
              <div key={step.key} className="flex-1 flex flex-col items-center relative">
                {/* Connection line between steps */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    "absolute top-3 left-1/2 w-full h-0.5 -translate-x-1/2",
                    currentStepIndex > index ? "bg-blue-500" : "bg-gray-300"
                  )} />
                )}
                
                {/* Step circle with icon */}
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 mb-1 relative",
                  currentStepIndex >= index
                    ? "bg-white border-blue-600 text-blue-600"
                    : "bg-white border-gray-300 text-gray-400"
                )}>
                  {currentStepIndex > index ? (
                    <Check className="h-3 w-3" />
                  ) : currentStepIndex === index ? (
                    <div className="text-blue-600">
                      {step.icon}
                    </div>
                  ) : (
                    <div className="text-gray-400 opacity-70">
                      {React.cloneElement(step.icon, { className: "h-3 w-3" })}
                    </div>
                  )}
                </div>
                
                {/* Step label */}
                <span className={cn(
                  "text-[10px] font-medium truncate w-full text-center",
                  currentStepIndex >= index
                    ? "text-blue-600 font-semibold"
                    : "text-gray-500"
                )}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          
          {/* Mini Progress Bar */}
          <div className="mt-2">
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingMasters && currentStep === 'reason' ? (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Loading master data...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                {renderStepContent()}
              </div>
              <div className="pt-3 border-t">
                {renderStepActions()}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}