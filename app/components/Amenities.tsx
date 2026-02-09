import * as Icons from 'lucide-react';
import { Amenity } from '@/types/property';

interface AmenitiesProps {
  amenities: Amenity[];
}

export function Amenities({ amenities }: AmenitiesProps) {
  return (
    <div className="glass rounded-2xl p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-black gradient-text mb-2">Amenities & Facilities</h2>
        <p className="text-gray-700 font-semibold">Everything you need for a comfortable stay</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {amenities.map((amenity, index) => {
          const IconComponent = Icons[amenity.icon as keyof typeof Icons] as React.ElementType;

          return (
            <div
              key={index}
              className="glass rounded-xl p-4 hover-lift border-2 border-white/20 group relative"
              title={amenity.title}
            >
              <div className="flex flex-col items-center text-center gap-3">
               <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all relative">
  {IconComponent && <IconComponent className="w-7 h-7 text-white" />}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                    {amenity.title}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{amenity.title}</h3>
                  <p className="text-xs text-gray-600 font-medium">{amenity.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
