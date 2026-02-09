import { Zap, Shield, Sparkles, ArrowRight, Check } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  icon: string;
  discount: string | null;
}

interface PricingCardProps {
  price: number;
  securityDeposit: number;
  offers: Offer[];
  onBookNow: () => void;
}

export function PricingCard({ price, securityDeposit, offers, onBookNow }: PricingCardProps) {
  return (
    <div className="glass rounded-2xl p-5 shadow-xl border-2 border-white/20">
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" />
        Best Deal
      </div>

      <div className="text-center mb-5 pt-3">
        <p className="text-xs text-gray-600 font-semibold mb-1">Starting from</p>
        <p className="text-4xl font-black gradient-text mb-1">₹{price.toLocaleString()}</p>
        <p className="text-sm text-gray-600 font-medium">/month</p>
      </div>

      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 mb-4 border border-violet-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-gray-700 font-bold">Security</p>
          </div>
          <p className="text-2xl font-black gradient-text">₹{securityDeposit.toLocaleString()}</p>
        </div>
      </div>

      {offers.length > 0 && (
        <div className="space-y-2 mb-4">
          {offers.slice(0, 2).map((offer) => (
            <div
              key={offer.id}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-gray-800 text-xs">{offer.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onBookNow}
        className="group relative w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-xl font-black text-base shadow-xl hover:shadow-2xl transition-all hover:scale-105 overflow-hidden mb-3"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative flex items-center justify-center gap-2">
          <Zap className="w-5 h-5" />
          <span>Book Now</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>

      <p className="text-xs text-gray-600 text-center font-semibold">
        Instant confirmation
      </p>
    </div>
  );
}
