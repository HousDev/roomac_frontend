import { Wifi, Wind, Home, Eye, Users, Clock, CheckCircle2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Room } from '@/types/property';
import { RoomViewModal } from './RoomViewModal';

interface AvailableRoomsProps {
  rooms: Room[];
  onBookRoom: (roomId: string) => void;
  securityDeposit?: number;
}

export function AvailableRooms({ rooms, onBookRoom, securityDeposit = 3000 }: AvailableRoomsProps) {
  const [showAllRooms, setShowAllRooms] = useState(false);

  const roomTypeSummary = useMemo(() => {
    const sharingTypes = Array.from(new Set(rooms.map(r => r.sharingType))).sort((a, b) => a - b);
    return sharingTypes.map(sharingType => {
      const sharingRooms = rooms.filter(r => r.sharingType === sharingType);
      const totalAvailable = sharingRooms.reduce((acc, r) => acc + r.available, 0);
      const availableNow = sharingRooms.filter(r => r.status === 'available').reduce((acc, r) => acc + r.available, 0);
      const availableSoon = sharingRooms.filter(r => r.status === 'available-soon').reduce((acc, r) => acc + r.available, 0);
      const totalRooms = sharingRooms.length;
      const hasAC = sharingRooms.some(r => r.ac);
      const hasWiFi = sharingRooms.some(r => r.wifi);
      const boysRooms = sharingRooms.filter(r => r.gender === 'male').length;
      const girlsRooms = sharingRooms.filter(r => r.gender === 'female').length;
      return {
        sharingType,
        price: sharingRooms[0].price,
        totalAvailable,
        availableNow,
        availableSoon,
        totalRooms,
        hasAC,
        hasWiFi,
        boysRooms,
        girlsRooms
      };
    });
  }, [rooms]);

  return (
    <>
      <div className="glass rounded-2xl p-6 shadow-xl">
        <div className="mb-6 ">
          <h2 className="text-2xl font-black gradient-text flex items-center mb-2">
            <Home className="w-6 h-6 mr-2" />
            Available Rooms
          </h2>
          <p className="text-gray-700 font-semibold text-sm">
            {rooms.reduce((acc, r) => acc + r.available, 0)} beds available across {rooms.length} rooms
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {roomTypeSummary.map((summary) => (
            <div
              key={summary.sharingType}
              className="glass rounded-xl p-5 border-2 border-white/20 hover-lift cursor-pointer group"
              onClick={() => setShowAllRooms(true)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">{summary.sharingType} Sharing</h3>
                    <p className="text-[10px] text-gray-600 font-semibold">{summary.totalRooms} rooms</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-semibold">Total Beds</span>
                  <span className="text-sm font-black text-blue-600">{summary.totalAvailable}</span>
                </div>

                {summary.availableNow > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span className="text-xs text-gray-600 font-semibold">Available Now</span>
                    </div>
                    <span className="text-sm font-black text-emerald-600">{summary.availableNow}</span>
                  </div>
                )}

                {summary.availableSoon > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-600" />
                      <span className="text-xs text-gray-600 font-semibold">Available Soon</span>
                    </div>
                    <span className="text-sm font-black text-orange-600">{summary.availableSoon}</span>
                  </div>
                )}

                {summary.boysRooms > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-semibold">Boys Rooms</span>
                    <span className="text-sm font-bold text-blue-600">{summary.boysRooms}</span>
                  </div>
                )}

                {summary.girlsRooms > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-semibold">Girls Rooms</span>
                    <span className="text-sm font-bold text-pink-600">{summary.girlsRooms}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                  {summary.hasWiFi && (
                    <div className="flex items-center gap-1 group/icon relative">
                      <Wifi className="w-4 h-4 text-blue-600" />
                      <span className="absolute left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover/icon:opacity-100 transition-opacity bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                        WiFi
                      </span>
                    </div>
                  )}
                  {summary.hasAC && (
                    <div className="flex items-center gap-1 group/icon relative">
                      <Wind className="w-4 h-4 text-blue-600" />
                      <span className="absolute left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover/icon:opacity-100 transition-opacity bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                        AC
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-0.5">Starting from</p>
                  <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">₹{summary.price.toLocaleString()}<span className="text-xs text-gray-500 font-semibold">/mo</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAllRooms(true)}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-xl font-bold text-base hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
        >
          <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
          View All {rooms.length} Rooms Details
        </button>
      </div>

      <RoomViewModal
        isOpen={showAllRooms}
        onClose={() => setShowAllRooms(false)}
        rooms={rooms}
        onBookRoom={onBookRoom}
        securityDeposit={securityDeposit}
      />
    </>
  );
}
