// app/admin/offers/components/OfferPreview.tsx
import { Offer, Room } from "@/lib/offerApi";
import { PropertyApiResponse } from "./OffersClientPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Percent,
  IndianRupee,
  Clock,
  Star,
  Shield,
  Award,
  Sparkles,
  Users,
  Building,
  Key,
  Bed,
  Bath,
  Snowflake,
  Sun,
  ShieldCheck,
  Wifi,
  Tv,
  Coffee,
  Dumbbell,
  Scan,
  CreditCard,
  Zap,
  X,
} from "lucide-react";

interface BonusDetails {
  title: string;
  description: string;
  valid_until: string;
  conditions?: string;
}

interface OfferPreviewProps {
  previewData: {
    offer: Offer;
    property: PropertyApiResponse | null;
    room: Room | null;
    bonusDetails: BonusDetails;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const OfferPreview = ({ previewData, isOpen, onClose }: OfferPreviewProps) => {
  if (!isOpen || !previewData) return null;

  const { offer, property, room, bonusDetails } = previewData;

  const discountValue = offer.discount_type === "percentage"
    ? `${offer.discount_percent}%`
    : `₹${offer.discount_value}`;

  const getDaysLeft = () => {
    if (!offer.end_date) return "No expiry";
    const end = new Date(offer.end_date);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return `${daysLeft} Days`;
  };

  const getOfferTypeIcon = () => {
    switch (offer.offer_type) {
      case 'seasonal': return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'student': return <Award className="h-5 w-5 text-blue-500" />;
      case 'corporate': return <Shield className="h-5 w-5 text-gray-600" />;
      case 'referral': return <Users className="h-5 w-5 text-green-500" />;
      case 'early_booking': return <Clock className="h-5 w-5 text-cyan-500" />;
      default: return <Star className="h-5 w-5 text-yellow-500" />;
    }
  };

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (offer.discount_type === "percentage" && offer.discount_percent) {
      return Math.round(originalPrice * (1 - (offer.discount_percent / 100)));
    } else if (offer.discount_type === "fixed" && offer.discount_value) {
      return Math.max(0, originalPrice - offer.discount_value);
    }
    return originalPrice;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl pt-2 pb-2">
        <button
          onClick={onClose}
          className="absolute -top-1 -right-1 z-50 bg-white hover:bg-gray-100 border border-gray-300 p-1 rounded-full shadow-lg transition-all hover:scale-110"
        >
          <X className="h-4 w-4 text-gray-700" />
        </button>

        <div className="bg-white rounded-lg overflow-hidden shadow-xl border border-gray-200 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/5 bg-gradient-to-br from-blue-600 to-cyan-600 p-4 text-white relative">
              <div className="absolute top-2 left-2 opacity-20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="absolute bottom-2 right-2 opacity-20">
                <Sparkles className="h-8 w-8" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-1 mb-3">
                  {getOfferTypeIcon()}
                  <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    {offer.offer_type.replace('_', ' ')}
                  </span>
                </div>

                <h1 className="text-xl font-black mb-2 leading-tight">
                  {offer.title}
                </h1>

                <p className="text-blue-100 text-xs mb-4">
                  {offer.description || "Limited Time Exclusive Offer"}
                </p>

                {property && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 mb-3 border border-white/20">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <div>
                        <p className="font-bold text-xs">{property.name}</p>
                        {property.area && (
                          <p className="text-xs text-blue-200">{property.area}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white/30">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Percent className="h-4 w-4" />
                      <span className="text-base font-bold">FLAT</span>
                    </div>
                    <div className="text-2xl font-black mb-1">{discountValue}</div>
                    <p className="text-sm font-semibold">DISCOUNT</p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-1 rounded">
                      <Scan className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">Scan to Apply</p>
                      <p className="text-xs text-blue-200">Code: {offer.code}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-3/5 p-4">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-1 rounded">
                    <IndianRupee className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Exclusive Deal</h2>
                    <p className="text-gray-600 text-xs">
                      {property ? `At ${property.name}` : "Premium PG accommodation"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-red-600">
                    <Clock className="h-3 w-3" />
                    <span className="font-bold text-sm">{getDaysLeft()}</span>
                  </div>
                </div>
              </div>

              {room && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-green-600" />
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm mb-1">
                          Room {room.room_number} - {room.sharing_type.charAt(0).toUpperCase() + room.sharing_type.slice(1)}
                        </h4>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-gray-800">
                            ₹{calculateDiscountedPrice(room.rent_per_bed).toLocaleString()}
                          </span>
                          <span className="text-gray-500 text-sm line-through">
                            ₹{room.rent_per_bed.toLocaleString()}
                          </span>
                          <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                            Save ₹{(room.rent_per_bed - calculateDiscountedPrice(room.rent_per_bed)).toLocaleString()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <Bed className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600">{room.total_bed} beds</span>
                          </div>
                          {room.has_attached_bathroom && (
                            <div className="flex items-center gap-1">
                              <Bath className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600">Attached Bath</span>
                            </div>
                          )}
                          {room.has_ac && (
                            <div className="flex items-center gap-1">
                              <Snowflake className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600">AC</span>
                            </div>
                          )}
                          {room.has_balcony && (
                            <div className="flex items-center gap-1">
                              <Sun className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600">Balcony</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {bonusDetails.title && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-600" />
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm mb-1">{bonusDetails.title}</h4>
                        <p className="text-gray-600 text-xs">{bonusDetails.description}</p>
                        {bonusDetails.valid_until && (
                          <p className="text-amber-600 text-xs font-medium mt-1">
                            Valid until: {new Date(bonusDetails.valid_until).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {bonusDetails.conditions && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-700 font-medium">Special Offers:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {bonusDetails.conditions.split(',').map((condition, index) => (
                          <Badge key={index} className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                            {condition.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {property && property.amenities && property.amenities.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Property Amenities
                  </h3>
                  <div className="grid grid-cols-2 gap-1">
                    {property.amenities.slice(0, 8).map((amenity, index) => {
                      const getIcon = () => {
                        if (amenity.toLowerCase().includes('wifi')) return <Wifi className="h-3 w-3 text-blue-600" />;
                        if (amenity.toLowerCase().includes('tv')) return <Tv className="h-3 w-3 text-blue-600" />;
                        if (amenity.toLowerCase().includes('breakfast') || amenity.toLowerCase().includes('food')) return <Coffee className="h-3 w-3 text-blue-600" />;
                        if (amenity.toLowerCase().includes('gym')) return <Dumbbell className="h-3 w-3 text-blue-600" />;
                        return <Star className="h-3 w-3 text-blue-600" />;
                      };
                      
                      return (
                        <div key={index} className="flex items-center gap-1 p-1 bg-gray-50 rounded text-xs">
                          {getIcon()}
                          <span className="font-medium">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-3">
                <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">Ready to Book?</h4>
                    <p className="text-gray-600 text-xs">Apply offer code at checkout</p>
                  </div>
                  <div className="flex gap-1">
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 py-1 text-xs h-7">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-2">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <div className="bg-gray-100 p-1 rounded">
                      <Shield className="h-3 w-3 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-xs">Terms</p>
                      <p className="text-gray-600 text-xs">Min. {offer.min_months} months stay</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Offer Code: <span className="font-bold">{offer.code}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferPreview;