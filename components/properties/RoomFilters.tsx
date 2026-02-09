"use client";

import { useState, useMemo, memo, useCallback } from 'react';
import { Filter } from 'lucide-react';

interface RoomFiltersProps {
  rooms: any[];
  onShowAllRooms: () => void;
}

const RoomFilters = memo(function RoomFilters({ rooms, onShowAllRooms }: RoomFiltersProps) {
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedSharing, setSelectedSharing] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedAmenities, setSelectedAmenities] = useState({ ac: false, wifi: false });
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (selectedFloor !== 'all' && room.floor !== Number(selectedFloor)) return false;
      if (selectedGender !== 'all' && room.gender !== selectedGender) return false;
      if (selectedSharing !== 'all' && room.sharingType !== Number(selectedSharing)) return false;
      if (priceRange === 'low' && room.price > 5000) return false;
      if (priceRange === 'mid' && (room.price <= 5000 || room.price > 7000)) return false;
      if (priceRange === 'high' && room.price <= 7000) return false;
      if (selectedAmenities.ac && !room.ac) return false;
      if (selectedAmenities.wifi && !room.wifi) return false;
      if (availabilityFilter === 'available' && room.status === 'occupied') return false;
      if (availabilityFilter === 'occupied' && room.status !== 'occupied') return false;
      if (availabilityFilter === 'partially' && room.status !== 'partially-available') return false;
      return true;
    });
  }, [rooms, selectedFloor, selectedGender, selectedSharing, priceRange, selectedAmenities, availabilityFilter]);

  const clearFilters = useCallback(() => {
    setSelectedFloor('all');
    setSelectedGender('all');
    setSelectedSharing('all');
    setPriceRange('all');
    setSelectedAmenities({ ac: false, wifi: false });
    setAvailabilityFilter('all');
  }, []);

  const hasActiveFilters = selectedFloor !== 'all' || selectedGender !== 'all' || selectedSharing !== 'all' ||
    priceRange !== 'all' || selectedAmenities.ac || selectedAmenities.wifi || availabilityFilter !== 'all';

  const roomTypeSummary = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    
    return rooms.map((room) => {
      const sharingType = parseInt(room.sharingType?.toString()) || 2;
      const availableCount = parseInt(room.available) || 0;
      const gender = (room.gender || '').toLowerCase();
      
      let boysRooms = 0;
      let girlsRooms = 0;
      let mixedRooms = 0;
      
      if (gender === 'male' || gender === 'm') {
        boysRooms = 1;
      } else if (gender === 'female' || gender === 'f') {
        girlsRooms = 1;
      } else {
        mixedRooms = 1;
      }
      
      const availableNow = (room.status === 'available' || room.status === 'partially-available') 
        ? availableCount 
        : 0;
      
      const price = parseInt(room.price) || 
        (sharingType === 1 ? 7000 : 
         sharingType === 2 ? 5000 : 
         sharingType === 3 ? 4000 : 3500);
      
      const hasAC = room.ac === true || room.ac === 'true';
      const hasWiFi = room.wifi === true || room.wifi === 'true';
      
      return {
        id: room.id,
        sharingType: sharingType,
        price: price,
        totalAvailable: availableCount,
        availableNow: availableNow,
        totalRooms: 1,
        hasAC: hasAC,
        hasWiFi: hasWiFi,
        boysRooms: boysRooms,
        girlsRooms: girlsRooms,
        mixedRooms: mixedRooms,
        roomNumber: room.roomNumber || room.name || `Room ${room.id}`,
        roomData: room
      };
    });
  }, [rooms]);

  if (rooms.length === 0) {
    return (
      <div className="text-center py-6 md:py-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg md:rounded-2xl border border-blue-100 md:border-2">
        <div className="w-10 h-10 md:w-16 md:h-16 text-blue-400 mx-auto mb-2 md:mb-4">
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-sm md:text-xl font-bold text-gray-700 mb-1 md:mb-2">No Rooms Available</h3>
        <p className="text-gray-600 mb-2 md:mb-4 text-xs md:text-base">
          There are currently no rooms available for this property.
        </p>
        <p className="text-[10px] md:text-sm text-gray-500">
          Please check back later or contact the property manager.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-3 md:mb-6 bg-white/50 rounded-lg md:rounded-xl p-2 md:p-4 border border-gray-100 md:border-2">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <h3 className="font-bold text-gray-900 text-xs md:text-base">Filter Rooms</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] md:text-xs text-blue-600 font-semibold hover:text-blue-700"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-3">
            <div>
              <label className="block text-[10px] md:text-xs font-semibold text-gray-700 mb-0.5 md:mb-1">Floor</label>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="w-full px-1.5 md:px-3 py-1 md:py-2 border border-gray-300 rounded md:rounded-lg text-xs md:text-sm"
              >
                <option value="all">All Floors</option>
                <option value="1">1st Floor</option>
                <option value="2">2nd Floor</option>
                <option value="3">3rd Floor</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] md:text-xs font-semibold text-gray-700 mb-0.5 md:mb-1">Gender</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full px-1.5 md:px-3 py-1 md:py-2 border border-gray-300 rounded md:rounded-lg text-xs md:text-sm"
              >
                <option value="all">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] md:text-xs font-semibold text-gray-700 mb-0.5 md:mb-1">Sharing</label>
              <select
                value={selectedSharing}
                onChange={(e) => setSelectedSharing(e.target.value)}
                className="w-full px-1.5 md:px-3 py-1 md:py-2 border border-gray-300 rounded md:rounded-lg text-xs md:text-sm"
              >
                <option value="all">All Types</option>
                <option value="1">1 Sharing</option>
                <option value="2">2 Sharing</option>
                <option value="3">3 Sharing</option>
                <option value="4">4 Sharing</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] md:text-xs font-semibold text-gray-700 mb-0.5 md:mb-1">Price</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-1.5 md:px-3 py-1 md:py-2 border border-gray-300 rounded md:rounded-lg text-xs md:text-sm"
              >
                <option value="all">All Prices</option>
                <option value="low">Under ₹5000</option>
                <option value="mid">₹5000-₹7000</option>
                <option value="high">Above ₹7000</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-6">
        {roomTypeSummary.slice(0, 3).map((summary: any) => (
          <div
            key={summary.id}
            className="bg-white rounded-lg md:rounded-xl p-3 md:p-5 border border-gray-200 md:border-2 hover:border-blue-300 hover:shadow-md md:hover:shadow-xl transition-all cursor-pointer group"
            onClick={onShowAllRooms}
          >
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-105 md:group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3.714l-.5 3.286" />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-sm md:text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {summary.sharingType} Sharing
                </h3>
                <p className="text-[10px] md:text-xs text-gray-500 font-semibold">
                  Room {summary.roomNumber}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2 mb-2 md:mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-gray-600 font-semibold">Available Beds</span>
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="text-sm md:text-base font-black text-blue-600">{summary.availableNow || 0}</span>
                  {summary.availableNow > 0 && (
                    <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 bg-green-100 text-green-700 rounded-full font-bold">
                      Available
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                {summary.hasAC && (
                  <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-100 text-blue-700 rounded-full font-semibold flex items-center gap-0.5 md:gap-1">
                    <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AC
                  </span>
                )}
                {summary.hasWiFi && (
                  <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 bg-purple-100 text-purple-700 rounded-full font-semibold flex items-center gap-0.5 md:gap-1">
                    <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                    WiFi
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 md:pt-4 border-t border-gray-200">
              <p className="text-lg md:text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                ₹{(summary.price || 5000).toLocaleString()}
                <span className="text-xs md:text-sm text-gray-500 font-normal">/month</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {roomTypeSummary.length > 3 && (
        <div className="text-center pt-2 md:pt-4 border-t border-gray-200">
          <button
            onClick={onShowAllRooms}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm md:text-base"
          >
            View {roomTypeSummary.length - 3} more room types →
          </button>
        </div>
      )}
    </>
  );
});

export default RoomFilters;