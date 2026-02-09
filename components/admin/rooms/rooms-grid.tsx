"use client";

import { JSXElementConstructor, Key, memo, ReactElement, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DoorOpen, Building2, Bath, Wind, Sun, Bed,
  CheckCircle, UserPlus, UsersRound, Eye,
  Edit2, Trash2, Image as ImageIcon, Users, User,
  UserRound, Building, Check, X,
  BadgeIndianRupee, ArrowUpRight, UserPlus as UserPlusIcon
} from 'lucide-react';
import type { RoomResponse } from '@/lib/roomsApi';
import { processPhotoUrls, getMediaUrl } from '@/lib/roomsApi';

// Gender icon component (from your original code)
const GenderIcon = ({ gender, size = "h-4 w-4" }: { gender: string; size?: string }) => {
  const normalizedGender = gender?.toLowerCase() || '';
  
  if (normalizedGender.includes('male') || normalizedGender === 'male_only' || normalizedGender === 'm') {
    return <User className={`${size} text-blue-600`} />;
  } else if (normalizedGender.includes('female') || normalizedGender === 'female_only' || normalizedGender === 'f') {
    return <UserRound className={`${size} text-pink-600`} />;
  } else if (normalizedGender.includes('couple') || normalizedGender === 'couples') {
    return <UsersRound className={`${size} text-red-600`} />;
  } else {
    return <User className={`${size} text-gray-600`} />;
  }
};

interface RoomsGridProps {
  rooms: RoomResponse[];

  onViewDetails: (room: RoomResponse) => void;
  onEdit: (room: RoomResponse) => void;
  onDelete: (id: string) => void;
  onBedManagement: (room: RoomResponse) => void;
  onOpenGallery: (room: RoomResponse) => void;
}


// Memoized room card component with YOUR original design
const RoomCard = memo(({ 
  room, 
  onViewDetails, 
  onEdit, 
  onDelete, 
  onBedManagement,
  onOpenGallery 
}: { 
  room: RoomResponse;
  onViewDetails: (room: RoomResponse) => void;
  onEdit: (room: RoomResponse) => void;
  onDelete: (id: string) => void;
  onBedManagement: (room: RoomResponse) => void;
  onOpenGallery: (room: RoomResponse) => void;
}) => {
  const totalBeds = room.total_bed || 0;
  const availableBeds = room.total_bed - room.occupied_beds;
  const occupancyRate = totalBeds > 0 ? Math.round((room.occupied_beds / totalBeds) * 100) : 0;

  console.log(processPhotoUrls)
  const processedPhotos = processPhotoUrls(room.photo_urls);
  console.log(processedPhotos[0])
  const imageUrl = processedPhotos.length > 0 ? processedPhotos[0].url : '/placeholder-room.jpg';
  console.log("image url ",imageUrl)
  
  const genderPreferences = Array.isArray(room.room_gender_preference) 
    ? room.room_gender_preference 
    : typeof room.room_gender_preference === 'string'
      ? room.room_gender_preference.split(',').filter(Boolean)
      : [];

  const currentOccupants = room.bed_assignments?.filter(bed => bed.tenant_id) || [];

  return (
    <Card key={room.id} className="group relative border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
      {/* IMAGE SECTION WITH OVERLAY - Your original design */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={imageUrl || " "}
          alt={`Room ${room.room_number}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-room.jpg';
          }}
        />
        
        {/* TOP OVERLAY BADGES */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <Badge className="bg-white/95 backdrop-blur-sm text-gray-900 border-0 shadow-md font-semibold px-2 py-1 text-xs">
            <DoorOpen className="h-3 w-3 mr-1" />
            Room {room.room_number}
          </Badge>
          <Badge 
            className={`${
              availableBeds > 0 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-red-500 hover:bg-red-600'
            } text-white border-0 shadow-md font-semibold px-2 py-1 text-xs`}
          >
            {availableBeds > 0 ? `${availableBeds} Available` : 'Full'}
          </Badge>
        </div>

        {/* BOTTOM GRADIENT OVERLAY */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* PRICE TAG */}
        <div className="absolute bottom-2 left-2">
          <div className="bg-white/95 backdrop-blur-sm rounded-md px-2 py-1.5 shadow-md">
            <div className="flex items-center gap-0.5">
              <BadgeIndianRupee className="h-3.5 w-3.5 text-green-600" />
              <span className="text-sm font-bold text-gray-900">₹{room.rent_per_bed}</span>
              <span className="text-xs text-gray-600">/bed</span>
            </div>
          </div>
        </div>

        {/* GALLERY BUTTON */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-2 right-2 h-8 w-8 bg-white/95 hover:bg-white shadow-md backdrop-blur-sm"
          onClick={() => onOpenGallery(room)}
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* CONTENT SECTION - Your original design */}
      <div className="p-5">
        {/* Property Info */}
        <div className="mb-3">
          <div className="flex items-start gap-1.5 mb-1">
            <Building2 className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-xs truncate">{room.property_name}</p>
              <p className="text-[10px] text-gray-500 truncate">{room.property_address}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] text-gray-600">
            <div className="flex items-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded">
              <Building className="h-3 w-3" />
              <span>F{room.floor || 'G'}</span>
            </div>
            {room.has_attached_bathroom && (
              <div className="flex items-center gap-0.5 bg-blue-50 px-1.5 py-0.5 rounded">
                <Bath className="h-3 w-3 text-blue-500" />
                <span>Bath</span>
              </div>
            )}
            {room.has_ac && (
              <div className="flex items-center gap-0.5 bg-cyan-50 px-1.5 py-0.5 rounded">
                <Wind className="h-3 w-3 text-cyan-500" />
                <span>AC</span>
              </div>
            )}
            {room.has_balcony && (
              <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded">
                <Sun className="h-3 w-3 text-amber-500" />
                <span>Balcony</span>
              </div>
            )}
          </div>
        </div>

        {/* OCCUPANCY BAR - COMPACT */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-600">Occupancy</span>
            <span className="text-xs font-bold text-gray-800">{room.occupied_beds}/{totalBeds} ({occupancyRate}%)</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                occupancyRate === 100 ? 'bg-red-500' : 
                occupancyRate >= 75 ? 'bg-amber-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        {/* BEDS STATS GRID */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <div className="text-center p-1.5 bg-blue-50 rounded-md border border-blue-100">
            <Bed className="h-3.5 w-3.5 mx-auto mb-0.5 text-blue-600" />
            <div className="text-sm font-semibold text-blue-700">{totalBeds}</div>
            <div className="text-[10px] text-blue-600">Beds</div>
          </div>
          <div className="text-center p-1.5 bg-green-50 rounded-md border border-green-100">
            <CheckCircle className="h-3.5 w-3.5 mx-auto mb-0.5 text-green-600" />
            <div className="text-sm font-semibold text-green-700">{room.occupied_beds}</div>
            <div className="text-[10px] text-green-600">Occupied</div>
          </div>
          <div className="text-center p-1.5 bg-amber-50 rounded-md border border-amber-100">
            <UserPlusIcon className="h-3.5 w-3.5 mx-auto mb-0.5 text-amber-600" />
            <div className="text-sm font-semibold text-amber-700">{availableBeds}</div>
            <div className="text-[10px] text-amber-600">Available</div>
          </div>
        </div>

        {/* GENDER PREFERENCES - COMPACT */}
        {genderPreferences.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Users className="h-3 w-3 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">Gender Preferences</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {genderPreferences.map((pref: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode>  , index: Key | null | undefined) => {
                const prefLower = String(pref).toLowerCase();
                const isMale = prefLower === 'male_only' || prefLower === 'male';
                const isFemale = prefLower === 'female_only' || prefLower === 'female';
                const isCouples = prefLower === 'couples';

                return (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 rounded font-medium"
                    style={{
                      backgroundColor: isMale ? '#dbeafe' : isFemale ? '#fce7f3' : isCouples ? '#fee2e2' : '#f3f4f6',
                      color: isMale ? '#1e40af' : isFemale ? '#be185d' : isCouples ? '#dc2626' : '#374151',
                    }}
                  >
                    {isMale ? '♂ Male' : isFemale ? '♀ Female' : isCouples ? '💑' : pref}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* CURRENT OCCUPANTS - COMPACT */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <UsersRound className="h-3 w-3 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">Occupants</span>
            </div>
            <span className="text-xs font-medium text-gray-500">
              {currentOccupants.length}/{totalBeds}
            </span>
          </div>
          {currentOccupants.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {currentOccupants.slice(0, 6).map((bed, index) => {
                const isCouple = bed.tenant_gender?.toLowerCase() === 'couple';
                const isMale = bed.tenant_gender?.toLowerCase() === 'male';
                const isFemale = bed.tenant_gender?.toLowerCase() === 'female';
                
                return (
                  <div
                    key={bed.id}
                    className="relative group w-7 h-7 rounded-full flex items-center justify-center shadow-sm border transition-transform hover:scale-110"
                    style={{
                      background: isCouple ? 'linear-gradient(135deg, #fce7f3 0%, #dbeafe 100%)'
                               : isMale ? 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)'
                               : isFemale ? 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)'
                               : 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)',
                      borderColor: isCouple ? '#c084fc' : isMale ? '#3b82f6' : isFemale ? '#db2777' : '#9ca3af',
                    }}
                    title={`Bed ${bed.bed_number}: ${bed.tenant_name || 'Occupied'}`}
                  >
                    <span className="text-xs">
                      {isCouple ? '👫' : isMale ? '👨' : isFemale ? '👩' : '👤'}
                    </span>
                    
                    {/* Tiny bed number */}
                    <span className="absolute -bottom-1 -right-1 text-[8px] font-bold leading-none">
                      {bed.bed_number || index + 1}
                    </span>
                  </div>
                );
              })}
              {currentOccupants.length > 6 && (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shadow-sm border border-gray-300">
                  <span className="text-[10px] font-bold text-gray-600">+{currentOccupants.length - 6}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2 bg-gray-50 rounded border border-dashed border-gray-300">
              <div className="flex items-center justify-center gap-1.5">
                <UserPlusIcon className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">Empty</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS - Your original design */}
      <div className="px-3 pb-3">
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 border-gray-300 hover:bg-gray-200 hover:text-black-300"
            onClick={() => onViewDetails(room)}
            title="Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-7 flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-900 text-xs"
            onClick={() => onBedManagement(room)}
          >
            <Bed className="h-3.5 w-3.5 mr-1" />
            Manage
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-900"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(room);
            }}
            title="Edit"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-900"
            onClick={() => onDelete(room.id.toString())}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
});

RoomCard.displayName = 'RoomCard';

export default function RoomsGrid({
  rooms,
  onViewDetails,
  onEdit,
  onDelete,
  onBedManagement,
  onOpenGallery
}: RoomsGridProps) {
  // Ensure rooms is always an array
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  
  if (safeRooms.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {safeRooms.map(room => (
        <RoomCard
          key={room.id}
          room={room}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onDelete={onDelete}
          onBedManagement={onBedManagement}
          onOpenGallery={onOpenGallery}
        />
      ))}
    </div>
  );
}