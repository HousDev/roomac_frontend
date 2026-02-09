import { MapPin, Navigation, Building2, Bus, ShoppingCart, Heart, Utensils, Film } from 'lucide-react';
import { NearbyPlace } from '@/types/property';

interface LocationProps {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  nearbyPlaces?: NearbyPlace[];
}

const iconMap = {
  transport: Bus,
  company: Building2,
  shopping: ShoppingCart,
  hospital: Heart,
  restaurant: Utensils,
  entertainment: Film,
};

export function Location({ address, coordinates, nearbyPlaces = [] }: LocationProps) {
  const handleGetDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`,
      '_blank'
    );
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-2xl font-black gradient-text flex items-center mb-2">
          <MapPin className="w-6 h-6 mr-2" />
          Location & Nearby
        </h2>
        <p className="text-sm text-gray-700 font-bold">{address}</p>
      </div>

      {nearbyPlaces.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-black text-gray-900 mb-3">Nearby Places</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {nearbyPlaces.map((place, index) => {
              const Icon = iconMap[place.type];
              return (
                <div
                  key={index}
                  className="bg-white/60 rounded-lg p-2.5 border border-gray-200 hover:border-violet-300 transition-all"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{place.name}</p>
                      <p className="text-[10px] text-gray-600 font-semibold">{place.distance}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="relative w-full h-[300px] rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-lg">
        <iframe
          src={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`}
          className="w-full h-full border-0"
          loading="lazy"
          title="Property location"
        />
      </div>

      <button
        onClick={handleGetDirections}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        <Navigation className="w-5 h-5" />
        <span>Get Directions</span>
      </button>
    </div>
  );
}
