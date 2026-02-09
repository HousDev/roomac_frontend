"use client";

import { memo } from 'react';
import { Users, Wind, Wifi, Home, Bath } from 'lucide-react';

interface RoomCardProps {
  room: any;
  onBook: () => void;
}

const RoomCard = memo(function RoomCard({ room, onBook }: RoomCardProps) {
  const sharingType = parseInt(room.sharingType?.toString()) || 2;
  
  return (
    <div className={`bg-white rounded-lg md:rounded-xl p-2.5 md:p-4 border transition-all hover:shadow ${room.status === 'available' || room.status === 'partially-available'
        ? 'border-emerald-200 hover:border-emerald-400'
        : 'border-orange-200 hover:border-orange-400'
      }`}
    >
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div>
          <span className="text-xs md:text-sm font-black text-gray-900">{room.name}</span>
          <p className="text-[10px] md:text-xs text-gray-500">Floor {room.floor}</p>
        </div>
        <span className={`text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1.5 rounded-full font-bold ${room.gender === 'male'
            ? 'bg-blue-100 text-blue-700'
            : room.gender === 'female'
            ? 'bg-pink-100 text-pink-700'
            : 'bg-purple-100 text-purple-700'
          }`}>
          {room.gender === 'male' ? '♂ Boys' : room.gender === 'female' ? '♀ Girls' : '👥 Mixed'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-4">
        <div className="flex items-center gap-0.5 md:gap-1 text-xs md:text-sm text-gray-600">
          <Users className="w-3 h-3 md:w-4 md:h-4" />
          <span className="font-semibold">
            {room.occupancy.male + room.occupancy.female}/{sharingType}
            {room.gender === 'mixed' && (
              <span className="text-[10px] md:text-xs text-gray-500 ml-0.5 md:ml-1">
                ({room.occupancy.male}♂ {room.occupancy.female}♀)
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          {room.ac && <Wind className="w-3 h-3 md:w-4 md:h-4 text-blue-600"  />}
          {room.wifi && <Wifi className="w-3 h-3 md:w-4 md:h-4 text-blue-600"  />}
          {room.hasAttachedBathroom && <Bath className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />}
          {room.hasBalcony && <Home className="w-3 h-3 md:w-4 md:h-4 text-blue-600"  />}
          {room.available > 0 && (
            <div className="text-[10px] md:text-xs font-bold text-emerald-600">
              {room.available} bed{room.available > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-gray-200">
        <span className={`text-xs md:text-sm font-bold ${room.status === 'available' || room.status === 'partially-available' ? 'text-emerald-600' : 'text-orange-600'
          }`}>
          {room.status === 'available' ? 'Available Now' : 
            room.status === 'partially-available' ? 'Partially Available' : 
            'Fully Occupied'}
        </span>
        <button
          onClick={onBook}
          className={`px-2.5 md:px-4 py-1 md:py-2 rounded md:rounded-lg text-xs md:text-sm font-bold ${room.status === 'available' || room.status === 'partially-available'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow md:hover:shadow-lg'
              : 'bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:shadow md:hover:shadow-lg'
            }`}
          disabled={room.status === 'occupied'}
        >
          {room.status === 'available' || room.status === 'partially-available' ? 'Book Now' : 'Occupied'}
        </button>
      </div>
    </div>
  );
});

export default RoomCard;