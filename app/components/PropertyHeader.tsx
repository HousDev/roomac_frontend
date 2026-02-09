import { MapPin, Share2, Star, IndianRupee, CheckCircle2, Shield } from 'lucide-react';
import { useState } from 'react';
import { Offer } from '@/types/property';

interface PropertyHeaderProps {
  name: string;
  location: string;
  tags: string[];
  startingPrice: number;
  securityDeposit: number;
  offers: Offer[];
}

export function PropertyHeader({ name, location, tags, startingPrice, securityDeposit, offers }: PropertyHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const topOffers = offers.slice(0, 2);

  return (
    <div className="glass rounded-xl p-2 shadow-xl bg-blue-100">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg md:text-xl font-black gradient-text truncate">
                {name}
              </h1>
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-0.5 rounded font-bold text-[10px] ${
                    tag === 'New Listing'
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
                      : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                  } shadow flex-shrink-0`}
                >
                  <Star className="w-2 h-2 inline mr-0.5" />
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin className="w-3 h-7 text-blue-600 flex-shrink-0" />
              <span className="font-semibold text-[16px] truncate">{location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-wrap md:flex-nowrap">
       <div className="flex items-center bg-gradient-to-br from-blue-100 to-cyan-50 rounded-lg px-4 py-3 border border-blue-200 shadow-sm">
  <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mr-3">Starting From</p>
  <div className="flex items-baseline gap-0.5">
    <IndianRupee className="w-4 h-4 text-blue-600" />
    <span className="text-xl font-black bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
      {startingPrice.toLocaleString()}
    </span>
    <span className="text-xs text-gray-500 font-medium ml-0.5">/mo</span>
  </div>
</div>
          <div className="flex items-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg px-4 py-3 border-2 border-emerald-200 relative overflow-hidden">
  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200/30 rounded-full -mr-8 -mt-8"></div>
  
  <div className="relative flex items-center gap-1.5 mr-4">
    <Shield className="w-4 h-3 text-emerald-600" />
    <div>
      <p className="text-[8px] text-emerald-700 font-bold uppercase tracking-wide">Security Deposit</p>
      <p className="text-[8px] text-emerald-600 font-semibold mt-0.5">Refundable</p>
    </div>
  </div>
  
  <div className="relative flex items-baseline gap-0.5">
    <IndianRupee className="w-3 h-3 text-emerald-600" />
    <span className="text-xl font-black text-emerald-700">{securityDeposit.toLocaleString()}</span>
  </div>
</div>
          {topOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-emerald-50 rounded-lg px-2 py-1.5 border border-emerald-200 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              <span className="text-[10px] font-bold text-emerald-800 whitespace-nowrap">
                {offer.title}
              </span>
            </div>
          ))}

          <button
            onClick={handleShare}
            className="p-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-lg font-bold shadow hover:shadow-lg transition-all flex-shrink-0"
            title={copied ? 'Copied!' : 'Share'}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
