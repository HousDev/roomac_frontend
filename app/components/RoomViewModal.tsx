import { X, Wifi, Wind, User, Home, SlidersHorizontal, Calendar, Share2, Clock } from 'lucide-react';
import { Room } from '@/types/property';
import { useState, useMemo } from 'react';

interface RoomViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  onBookRoom: (roomId: string) => void;
  securityDeposit?: number;
}

export function RoomViewModal({ isOpen, onClose, rooms, onBookRoom, securityDeposit = 3000 }: RoomViewModalProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'all'>('all');
  const [selectedSharing, setSelectedSharing] = useState<number | 'all'>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [selectedAmenities, setSelectedAmenities] = useState<{ ac: boolean; wifi: boolean }>({ ac: false, wifi: false });
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'available-soon'>('all');

  if (!isOpen) return null;

  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b);
  const sharingTypes = Array.from(new Set(rooms.map(r => r.sharingType))).sort((a, b) => a - b);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (selectedFloor !== 'all' && room.floor !== selectedFloor) return false;
      if (selectedGender !== 'all' && room.gender !== selectedGender) return false;
      if (selectedSharing !== 'all' && room.sharingType !== selectedSharing) return false;
      if (priceRange === 'low' && room.price > 5000) return false;
      if (priceRange === 'mid' && (room.price <= 5000 || room.price > 7000)) return false;
      if (priceRange === 'high' && room.price <= 7000) return false;
      if (selectedAmenities.ac && !room.ac) return false;
      if (selectedAmenities.wifi && !room.wifi) return false;
      if (availabilityFilter !== 'all' && room.status !== availabilityFilter) return false;
      return true;
    });
  }, [rooms, selectedFloor, selectedGender, selectedSharing, priceRange, selectedAmenities, availabilityFilter]);

  const groupedRooms = useMemo(() => {
    const groups: { [key: number]: Room[] } = {};
    filteredRooms.forEach(room => {
      if (!groups[room.sharingType]) groups[room.sharingType] = [];
      groups[room.sharingType].push(room);
    });
    return groups;
  }, [filteredRooms]);

  const handleShare = (room: Room) => {
    const message = `Check out ${room.name} - ${room.sharingType} Sharing at ₹${room.price.toLocaleString()}/month\n\nFloor: ${room.floor}\nAmenities: ${room.ac ? 'AC, ' : ''}${room.wifi ? 'WiFi' : ''}\nSecurity Deposit: ₹${securityDeposit.toLocaleString()}\n\n${room.status === 'available-soon' ? `Available from: ${formatDate(room.vacateDate!)}\n` : 'Available Now!\n'}Book your room today!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const clearFilters = () => {
    setSelectedFloor('all');
    setSelectedGender('all');
    setSelectedSharing('all');
    setPriceRange('all');
    setSelectedAmenities({ ac: false, wifi: false });
    setAvailabilityFilter('all');
  };

  const hasActiveFilters = selectedFloor !== 'all' || selectedGender !== 'all' || selectedSharing !== 'all' ||
    priceRange !== 'all' || selectedAmenities.ac || selectedAmenities.wifi || availabilityFilter !== 'all';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">All Available Rooms</h2>
              <p className="text-xs text-white/80 font-semibold">{filteredRooms.length} rooms found</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                showFilters ? 'bg-white text-blue-600' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="border-b border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-sm text-gray-900">Filter Rooms</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Floor</label>
                  <select
                    value={selectedFloor}
                    onChange={(e) => setSelectedFloor(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border-2 border-gray-200 text-xs font-semibold focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="all">All Floors</option>
                    {floors.map(floor => (
                      <option key={floor} value={floor}>Floor {floor}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Gender</label>
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-lg border-2 border-gray-200 text-xs font-semibold focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="all">All</option>
                    <option value="male">Boys</option>
                    <option value="female">Girls</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Room Type</label>
                  <select
                    value={selectedSharing}
                    onChange={(e) => setSelectedSharing(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border-2 border-gray-200 text-xs font-semibold focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="all">All Types</option>
                    {sharingTypes.map(type => (
                      <option key={type} value={type}>{type} Sharing</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Price Range</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-lg border-2 border-gray-200 text-xs font-semibold focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="all">All Prices</option>
                    <option value="low">Below ₹5,000</option>
                    <option value="mid">₹5,000 - ₹7,000</option>
                    <option value="high">Above ₹7,000</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Availability</label>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-lg border-2 border-gray-200 text-xs font-semibold focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available Now</option>
                    <option value="available-soon">Available Soon</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Amenities</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedAmenities(prev => ({ ...prev, ac: !prev.ac }))}
                      className={`flex-1 px-2 py-1.5 rounded-lg border-2 text-xs font-bold transition-all ${
                        selectedAmenities.ac
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <Wind className="w-3 h-3 mx-auto" />
                    </button>
                    <button
                      onClick={() => setSelectedAmenities(prev => ({ ...prev, wifi: !prev.wifi }))}
                      className={`flex-1 px-2 py-1.5 rounded-lg border-2 text-xs font-bold transition-all ${
                        selectedAmenities.wifi
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <Wifi className="w-3 h-3 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">₹</span>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Security Deposit (Refundable)</p>
                <p className="text-lg font-black text-emerald-700">₹{securityDeposit.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wide">One-time Payment</p>
              <p className="text-xs text-gray-500 font-semibold">Refunded within 30 days</p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-bold text-lg mb-2">No rooms match your filters</p>
              <p className="text-gray-500 text-sm font-semibold mb-4">Try adjusting your filter criteria</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedRooms).map(([sharingType, sharingRooms]) => {
                const totalAvailable = sharingRooms.reduce((acc, r) => acc + r.available, 0);
                const availableNow = sharingRooms.filter(r => r.status === 'available').reduce((acc, r) => acc + r.available, 0);
                const availableSoon = sharingRooms.filter(r => r.status === 'available-soon').reduce((acc, r) => acc + r.available, 0);

                return (
                  <div key={sharingType} className="glass rounded-xl p-5 border-2 border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                      <div>
                        <h3 className="font-black text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {sharingType} Sharing
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-600 font-semibold">
                            {totalAvailable} total beds
                          </p>
                          {availableNow > 0 && (
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                              {availableNow} now
                            </span>
                          )}
                          {availableSoon > 0 && (
                            <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-bold">
                              {availableSoon} soon
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          ₹{sharingRooms[0].price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 font-semibold">/month</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sharingRooms.map((room) => (
                        <div
                          key={room.id}
                          className={`bg-white rounded-xl p-4 border-2 transition-all hover:shadow-md relative overflow-hidden ${
                            room.status === 'available'
                              ? 'border-emerald-200 hover:border-emerald-400'
                              : 'border-orange-200 hover:border-orange-400'
                          }`}
                        >
                          {room.status === 'available-soon' && (
                            <div className="absolute top-0 right-0 bg-gradient-to-bl from-orange-500 to-orange-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-lg flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              SOON
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-black text-gray-900">{room.name}</span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                              room.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                            }`}>
                              {room.gender === 'male' ? '♂ Boys' : '♀ Girls'}
                            </span>
                          </div>

                          {room.status === 'available-soon' && room.vacateDate && (
                            <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-orange-600" />
                                <div>
                                  <p className="text-[10px] text-orange-600 font-bold uppercase">Available From</p>
                                  <p className="text-xs text-orange-700 font-black">{formatDate(room.vacateDate)}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-1 mb-3 flex-wrap">
                            <div className="flex items-center gap-1 text-xs text-gray-600 group/icon relative">
                              <User className="w-3 h-3" />
                              <span className="font-semibold">
                                {room.gender === 'male' ? room.occupancy.male : room.occupancy.female}/{sharingType}
                              </span>
                              <span className="absolute left-0 -top-7 opacity-0 group-hover/icon:opacity-100 transition-opacity bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap pointer-events-none z-20">
                                Occupancy
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-600 font-semibold">Floor {room.floor}</span>
                            {room.ac && (
                              <div className="group/icon relative ml-1">
                                <Wind className="w-3.5 h-3.5 text-blue-600" />
                                <span className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover/icon:opacity-100 transition-opacity bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap pointer-events-none z-20">
                                  AC Available
                                </span>
                              </div>
                            )}
                            {room.wifi && (
                              <div className="group/icon relative">
                                <Wifi className="w-3.5 h-3.5 text-blue-600" />
                                <span className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover/icon:opacity-100 transition-opacity bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap pointer-events-none z-20">
                                  WiFi Available
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-200">
                            <span className={`text-xs font-black ${
                              room.status === 'available' ? 'text-emerald-600' : 'text-orange-600'
                            }`}>
                              {room.available} bed(s)
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleShare(room)}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all group/share"
                                title="Share on WhatsApp"
                              >
                                <Share2 className="w-3.5 h-3.5 text-gray-600 group-hover/share:text-green-600" />
                              </button>
                              <button
                                onClick={() => {
                                  onBookRoom(room.id);
                                  onClose();
                                }}
                                className={`text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-sm hover:shadow-md ${
                                  room.status === 'available'
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                                    : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white'
                                }`}
                              >
                                {room.status === 'available' ? 'Book Now' : 'Reserve'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
