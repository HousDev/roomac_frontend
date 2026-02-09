import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Hash, AlertTriangle, Home, Loader2 } from 'lucide-react';
import type { 
  CurrentRoomInfo, 
  Property as ApiProperty, 
  Room as ApiRoom, 
  ChangeReason 
} from '@/lib/tenantRequestsApi';

interface ChangeBedFormProps {
  step: number;
  setStep: (step: number) => void;
  currentRoom: CurrentRoomInfo | null;
  changeReasons: ChangeReason[];
  properties: ApiProperty[];
  selectedPropertyId: number | null;
  setSelectedPropertyId: (id: number | null) => void;
  availableRooms: ApiRoom[];
  selectedRoomId: number | null;
  setSelectedRoomId: (id: number | null) => void;
  availableBeds: number[];
  selectedBedNumber: number | null;
  setSelectedBedNumber: (number: number | null) => void;
  onPropertySelect: (propertyId: number) => Promise<void>;
  onRoomSelect: (roomId: number) => Promise<void>;
  onBedSelect: (bedNumber: number) => void;
  onReasonSelect: (reasonId: number) => void;
  onDateChange: (date: string) => void;
  onNotesChange: (notes: string) => void;
  formData: any;
}

export function ChangeBedForm({
  step,
  setStep,
  currentRoom,
  changeReasons,
  properties,
  selectedPropertyId,
  setSelectedPropertyId,
  availableRooms,
  selectedRoomId,
  setSelectedRoomId,
  availableBeds,
  selectedBedNumber,
  setSelectedBedNumber,
  onPropertySelect,
  onRoomSelect,
  onBedSelect,
  onReasonSelect,
  onDateChange,
  onNotesChange,
  formData
}: ChangeBedFormProps) {
  switch (step) {
    case 1:
      return <Step1 {...{
        currentRoom,
        changeReasons,
        onReasonSelect,
        setStep,
        formData
      }} />;
    case 2:
      return <Step2 {...{
        properties,
        selectedPropertyId,
        onPropertySelect,
        setStep,
      }} />;
    case 3:
      return <Step3 {...{
        availableRooms,
        selectedRoomId,
        onRoomSelect,
        availableBeds,
        selectedBedNumber,
        onBedSelect,
        setStep,
        setSelectedRoomId,
        setSelectedBedNumber
      }} />;
    case 4:
      return <Step4 {...{
        currentRoom,
        changeReasons,
        properties,
        selectedPropertyId,
        availableRooms,
        selectedRoomId,
        selectedBedNumber,
        onDateChange,
        onNotesChange,
        formData,
        setStep
      }} />;
    default:
      return null;
  }
}

function Step1({ 
  currentRoom, 
  changeReasons, 
  onReasonSelect, 
  setStep, 
  formData 
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Step 1: Current Room & Reason</h3>
        
        {currentRoom ? (
          currentRoom.has_assignment ? (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Home className="h-6 w-6 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Your Current Room</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="font-medium">Property:</span> {currentRoom.property_name}</div>
                <div><span className="font-medium">Room:</span> {currentRoom.room_number}</div>
                <div><span className="font-medium">Bed:</span> {currentRoom.bed_number}</div>
                <div><span className="font-medium">Rent:</span> ₹{currentRoom.rent_per_bed}/month</div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <div>
                  <h4 className="font-semibold text-yellow-800">No Current Assignment</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You are not currently assigned to any bed. You can still request a new bed assignment.
                  </p>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />
              <div>
                <h4 className="font-semibold text-gray-800">Loading room information...</h4>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="change_reason" className="text-base">Why do you want to change your bed? *</Label>
            <Select
              value={formData.changeBedData?.change_reason_id?.toString() || ''}
              onValueChange={(value) => onReasonSelect(parseInt(value))}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select a reason for change" />
              </SelectTrigger>
              <SelectContent>
                {changeReasons.map((reason: ChangeReason) => (
                  <SelectItem key={reason.id} value={reason.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{reason.value}</span>
                      {reason.description && (
                        <span className="text-xs text-gray-500">{reason.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => setStep(2)}
              disabled={!formData.changeBedData?.change_reason_id}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next: Select Property
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step2({ 
  properties, 
  selectedPropertyId, 
  onPropertySelect, 
  setStep 
}: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Step 2: Select New Property</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep(1)}
          className="text-blue-600"
        >
          ← Back
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="property" className="text-base">Select Property *</Label>
          <Select
            value={selectedPropertyId?.toString() || ''}
            onValueChange={(value) => onPropertySelect(parseInt(value))}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Choose a property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property: ApiProperty) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  <div className="flex flex-col">
                    <span className="font-medium">{property.name}</span>
                    <span className="text-xs text-gray-500">
                      {property.city} • {property.available_rooms_count} rooms available
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedPropertyId && (
          <div className="flex justify-end">
            <Button 
              onClick={() => setStep(3)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next: Select Room
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step3({
  availableRooms,
  selectedRoomId,
  onRoomSelect,
  availableBeds,
  selectedBedNumber,
  onBedSelect,
  setStep,
  setSelectedRoomId,
  setSelectedBedNumber
}: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Step 3: Select New Room</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setStep(2);
            setSelectedRoomId(null);
            setSelectedBedNumber(null);
          }}
          className="text-blue-600"
        >
          ← Back
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="room" className="text-base">Select Room *</Label>
          <Select
            value={selectedRoomId?.toString() || ''}
            onValueChange={(value) => onRoomSelect(parseInt(value))}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Choose a room" />
            </SelectTrigger>
            <SelectContent>
              {availableRooms.map((room: ApiRoom) => (
                <SelectItem key={room.id} value={room.id.toString()}>
                  <div className="flex flex-col">
                    <span className="font-medium">Room {room.room_number}</span>
                    <span className="text-xs text-gray-500">
                      {room.sharing_type} sharing • ₹{room.rent_per_bed}/bed • 
                      {room.available_beds} bed{room.available_beds !== 1 ? 's' : ''} available
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedRoomId && availableBeds.length > 0 && (
          <div>
            <Label className="text-base">Select Bed Number *</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {availableBeds.map((bedNumber: number) => {
                const bedNum = Number(bedNumber);
                if (isNaN(bedNum)) return null;
                
                return (
                  <Button
                    key={bedNum}
                    type="button"
                    variant={selectedBedNumber === bedNum ? "default" : "outline"}
                    className={`h-12 ${selectedBedNumber === bedNum ? 'bg-blue-600' : ''}`}
                    onClick={() => onBedSelect(bedNum)}
                  >
                    <Hash className="h-4 w-4 mr-2" />
                    Bed {bedNum}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
        
        {selectedRoomId && selectedBedNumber && (
          <div className="flex justify-end">
            <Button 
              onClick={() => setStep(4)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next: Final Details
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step4({
  currentRoom,
  changeReasons,
  properties,
  selectedPropertyId,
  availableRooms,
  selectedRoomId,
  selectedBedNumber,
  onDateChange,
  onNotesChange,
  formData,
  setStep
}: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Step 4: Final Details</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep(3)}
          className="text-blue-600"
        >
          ← Back
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Request Summary</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="font-medium">Current Room:</span> {currentRoom?.room_number ? `Room ${currentRoom.room_number}, Bed ${currentRoom.bed_number}` : 'Not assigned'}</div>
            <div><span className="font-medium">Reason:</span> {changeReasons.find((r: ChangeReason) => r.id === formData.changeBedData?.change_reason_id)?.value}</div>
            <div><span className="font-medium">New Property:</span> {properties.find((p: ApiProperty) => p.id === selectedPropertyId)?.name}</div>
            <div><span className="font-medium">New Room:</span> {availableRooms.find((r: ApiRoom) => r.id === selectedRoomId)?.room_number}</div>
            <div><span className="font-medium">New Bed:</span> {selectedBedNumber}</div>
            <div><span className="font-medium">New Rent:</span> ₹{availableRooms.find((r: ApiRoom) => r.id === selectedRoomId)?.rent_per_bed}/month</div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="shifting_date" className="text-base">Preferred Shifting Date *</Label>
          <Input
            id="shifting_date"
            type="date"
            value={formData.changeBedData?.shifting_date || ''}
            onChange={(e) => onDateChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="h-12"
          />
          <p className="text-xs text-gray-500 mt-1">
            Select when you would like to move to the new room
          </p>
        </div>
      </div>
    </div>
  );
}