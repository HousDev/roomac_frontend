import { Tag, Percent, Clock, Gift, Sparkles } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  icon: string;
  discount: string | null;
}

interface OffersSectionProps {
  offers: Offer[];
}

const Icons = {
  tag: Tag,
  percent: Percent,
  clock: Clock,
  gift: Gift,
};

export function OffersSection({ offers }: OffersSectionProps) {
  return (
    <div className="glass rounded-2xl p-4 shadow-xl">
      <h2 className="text-xl font-gery-700 gradient-text mb-3 font-bold flex items-center">
        <Sparkles className="w-4 h-4 mr-1.5" />
        Special Offers
      </h2>

      <div className="space-y-2">
        {offers.map((offer) => {
          const IconComponent = Icons[offer.icon as keyof typeof Icons];

          return (
            <div
              key={offer.id}
              className="relative bg-white/50 rounded-lg p-2.5 border border-gray-200 overflow-hidden"
            >
              {offer.discount && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-2 py-0.5 rounded-bl-lg font-bold text-[10px]">
                  {offer.discount}
                </div>
              )}

              <div className="flex items-start gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-700 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="font-bold text-gray-900 text-xs mb-0.5">{offer.title}</h3>
                  <p className="text-[10px] text-gray-600 font-medium line-clamp-1">{offer.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
