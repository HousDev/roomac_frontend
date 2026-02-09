import { Phone, MessageCircle, User, Mail, Star, CheckCircle2 } from 'lucide-react';
import { PropertyManager as PropertyManagerType } from '@/types/property';

interface PropertyManagerProps {
  manager: PropertyManagerType;
}

export function PropertyManager({ manager }: PropertyManagerProps) {
  const handleCall = () => {
    window.location.href = `tel:${manager.phone}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${manager.phone}`, '_blank');
  };

  return (
   <div className="glass rounded-2xl overflow-hidden shadow-xl border-2 border-blue-100 hover:shadow-2xl transition-shadow">
  {/* Header */}
  <div className="relative bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-600 px-4 py-3 overflow-hidden">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -mr-10 -mt-10"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full -ml-8 -mb-8"></div>
    </div>
    
    <div className="relative flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow border border-white/30">
          <User className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-black text-white drop-shadow-sm">Property Manager</h3>
      </div>
      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full border border-white/30 shadow">
        <Star className="w-3 h-3 text-yellow-300 fill-yellow-300 drop-shadow" />
        <span className="text-xs font-black text-white">4.8</span>
      </div>
    </div>
  </div>

  <div className="p-4">
    {/* Manager Info */}
    <div className="flex items-center gap-3 mb-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-2.5 border border-gray-100">
      <div className="relative">
        <img
          src={manager.avatar}
          alt={manager.name}
          className="w-16 h-16 rounded-xl object-cover ring-2 ring-blue-300 shadow-md hover:ring-blue-400 transition-all"
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
        <div className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-black text-gray-900 text-base truncate">{manager.name}</p>
        <div className="flex items-center gap-1 mb-1">
          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
          <p className="text-xs text-gray-600 font-semibold">Verified Manager</p>
        </div>
        <p className="text-xs text-gray-500 flex items-center gap-1 font-semibold bg-white px-1.5 py-0.5 rounded-md inline-flex shadow-sm">
          <Phone className="w-3 h-3 text-blue-600" />
          {manager.phone}
        </p>
      </div>
    </div>

    {/* Quick Response */}
    <div className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 rounded-xl p-3 mb-3 border border-blue-200 shadow-sm overflow-hidden group">
      <div className="absolute top-0 right-0 w-12 h-12 bg-blue-200/30 rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-500"></div>
      <div className="relative flex items-center gap-2">
        <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-600 rounded-lg flex items-center justify-center shadow flex-shrink-0">
          <MessageCircle className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-[10px] text-blue-800 font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
            Quick Response
            <span className="w-0.5 h-0.5 bg-blue-600 rounded-full animate-pulse"></span>
          </p>
          <p className="text-xs text-gray-700 font-semibold">Usually replies within 5 minutes</p>
        </div>
      </div>
    </div>

    {/* Buttons */}
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={handleCall}
        className="group relative overflow-hidden flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold text-xs shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Phone className="w-4 h-4 relative group-hover:rotate-6 transition-transform" />
        <span className="relative">Call Now</span>
      </button>
      
      <button
        onClick={handleWhatsApp}
        className="group relative overflow-hidden flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-xs shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <MessageCircle className="w-4 h-4 relative group-hover:rotate-6 transition-transform" />
        <span className="relative">WhatsApp</span>
      </button>
    </div>
  </div>
</div>
  );
}
