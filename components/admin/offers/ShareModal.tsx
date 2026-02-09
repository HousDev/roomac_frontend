// app/admin/offers/components/ShareModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Offer } from "@/lib/offerApi";
import { PropertyApiResponse } from "./OffersClientPage";
import {
  Share2,
  Copy,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Ticket,
  Calendar,
  Clock,
  Building,
  Sparkles,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer | null;
  property?: PropertyApiResponse | null;
}

const getBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const baseUrl = apiUrl.replace('/api', '');
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const ShareModal = ({ isOpen, onClose, offer, property }: ShareModalProps) => {
  if (!isOpen || !offer) return null;

  const discountValue = offer.discount_type === "percentage"
    ? `${offer.discount_percent}%`
    : `₹${offer.discount_value}`;

  const getDaysLeft = () => {
    if (!offer.end_date) return "Soon";
    const end = new Date(offer.end_date);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return daysLeft > 0 ? `${daysLeft} days left` : "Expired";
  };

  const getOfferTypeColor = () => {
    switch (offer.offer_type) {
      case 'seasonal': return 'bg-orange-100 text-orange-800';
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'corporate': return 'bg-gray-100 text-gray-800';
      case 'referral': return 'bg-green-100 text-green-800';
      case 'early_booking': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="relative">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-white text-xl font-bold">
                    Share This Amazing Offer!
                  </DialogTitle>
                  <DialogDescription className="text-blue-100">
                    Spread the word and help others save money
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 -mt-6">
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-4 transform -translate-y-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge className={`${getOfferTypeColor()} font-semibold px-3 py-1 mb-2`}>
                    {offer.offer_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <h3 className="text-lg font-bold text-gray-900">{offer.title}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{offer.description}</p>
                  
                  {property && (
                    <div className="flex items-center gap-2 mt-2">
                      <Building className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-700 font-medium">{property.name}</span>
                      {property.area && (
                        <span className="text-xs text-gray-500">({property.area})</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {discountValue} OFF
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Special Discount</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">Validity</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {offer.start_date ? new Date(offer.start_date).toLocaleDateString() : 'Anytime'}
                    {offer.end_date && ` - ${new Date(offer.end_date).toLocaleDateString()}`}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-gray-700">Time Left</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{getDaysLeft()}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Your Offer Code</p>
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-purple-600" />
                      <code className="font-mono text-lg font-bold text-purple-700 bg-white px-3 py-1 rounded border border-purple-300">
                        {offer.code}
                      </code>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(offer.code);
                      toast.success("Code copied to clipboard!");
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Code
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Share via Social Media
              </h4>
              
              <div className="grid grid-cols-4 gap-2 mb-3">
                <Button
                  onClick={() => {
                    const url = `${getBaseUrl()}/offers/${offer.code}`;
                    const message = `🎉 Check out this amazing offer: ${offer.title}\n\nGet ${discountValue} off!\n\nUse code: ${offer.code}\n\n${url}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                    toast.success("Opening WhatsApp...");
                  }}
                  className="bg-[#25D366] hover:bg-[#22C35E] text-white h-auto py-3 flex flex-col gap-1 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs font-medium">WhatsApp</span>
                </Button>

                <Button
                  onClick={() => {
                    const url = `${getBaseUrl()}/offers/${offer.code}`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`${offer.title} - Get ${discountValue} off!`)}`, '_blank');
                    toast.success("Opening Facebook...");
                  }}
                  className="bg-[#1877F2] hover:bg-[#166FE5] text-white h-auto py-3 flex flex-col gap-1 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  <Facebook className="h-4 w-4" />
                  <span className="text-xs font-medium">Facebook</span>
                </Button>

                <Button
                  onClick={() => {
                    const url = `${getBaseUrl()}/offers/${offer.code}`;
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`🎁 Check out: ${offer.title} - Get ${discountValue} off! Use code: ${offer.code}`)}`, '_blank');
                    toast.success("Opening Twitter...");
                  }}
                  className="bg-[#1DA1F2] hover:bg-[#1A91DA] text-white h-auto py-3 flex flex-col gap-1 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  <Twitter className="h-4 w-4" />
                  <span className="text-xs font-medium">Twitter</span>
                </Button>

                <Button
                  onClick={() => {
                    const url = `${getBaseUrl()}/offers/${offer.code}`;
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                    toast.success("Opening LinkedIn...");
                  }}
                  className="bg-[#0A66C2] hover:bg-[#0959AC] text-white h-auto py-3 flex flex-col gap-1 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="text-xs font-medium">LinkedIn</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    const url = `${getBaseUrl()}/offers/${offer.code}`;
                    const subject = `🎁 Amazing Offer: ${offer.title}`;
                    const body = `Hi,\n\nI found this great offer for you:\n\n🏷️ ${offer.title}\n📝 ${offer.description || 'Special discount offer'}\n\n💰 Get ${discountValue} off!\n🎟️ Use code: ${offer.code}\n\nCheck it out: ${url}\n\nBest regards,\n`;
                    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white h-10 justify-start gap-3 rounded-lg px-3 shadow-md"
                >
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">Email</span>
                </Button>

                <Button
                  onClick={() => {
                    const url = `${getBaseUrl()}/offers/${offer.code}`;
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`🎁 Check out: ${offer.title} - Get ${discountValue} off! Use code: ${offer.code}`)}`, '_blank');
                    toast.success("Opening Telegram...");
                  }}
                  className="bg-[#0088CC] hover:bg-[#0077B5] text-white h-10 justify-start gap-2 rounded-lg px-3 shadow-md"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">Telegram</span>
                </Button>
              </div>

              <div className="mt-3">
                <Button
                  onClick={() => {
                    const url = `${getBaseUrl()}/offers/${offer.code}`;
                    navigator.clipboard.writeText(url);
                    toast.success("📋 Link copied to clipboard!");
                  }}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white w-full h-10 justify-center gap-3 rounded-lg shadow-md"
                >
                  <Copy className="h-4 w-4" />
                  <span className="font-medium">Copy Share Link</span>
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-1.5 rounded-lg shadow-sm">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Sharing is Caring! ❤️</p>
                    <p className="text-xs text-gray-600">Every share helps someone save money</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white border-green-300 text-green-700 shadow-sm">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified Offer
                </Badge>
              </div>
            </div>
          </div>

          <div className="absolute top-2 right-2 opacity-20">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="absolute bottom-2 left-2 opacity-20">
            <Share2 className="h-6 w-6 text-white" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;