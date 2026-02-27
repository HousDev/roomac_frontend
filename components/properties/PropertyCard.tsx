



// components/properties/PropertyCard.tsx
"use client";

import { useState, useCallback, memo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  MapPin, 
  Users, 
  ChevronRight,
  Bed,
  Bath,
  Star,
  Wifi,
  Utensils,
  Shield,
  Car,
  Zap,
  Clock,
  Home,
  Heart,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Share2,
  Copy,
  Check,
  X
} from "lucide-react";
import { BsWhatsapp } from 'react-icons/bs';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaTelegramPlane } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { getOrCreateTrackingId } from '@/lib/slugUtils';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Fallback images array
const FALLBACK_IMAGES = [
  "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1428348/pexels-photo-1428348.jpeg?auto=compress&cs=tinysrgb&w=600"
];

// Brand colors
const BRAND_BLUE = "#0249a8";
const BRAND_YELLOW = "#fdbc0a";

interface PropertyCardProps {
  property: any;
  likedProperties?: Set<number>;
  onWhatsAppClick?: (phone: string, name: string, location: string) => void;
  onCallClick?: (phone: string) => void;
  onHeartClick?: (propertyId: number, event: React.MouseEvent) => void;
  
}

const PropertyCard = memo(function PropertyCard({ 
  property, 
  likedProperties = new Set(),
  onWhatsAppClick,
  onCallClick,
  onHeartClick
}: PropertyCardProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [fallbackIndex] = useState(() => Math.floor(Math.random() * FALLBACK_IMAGES.length));
  const [sharePopup, setSharePopup] = useState<{
    id: any;
    slug: any;
    seoSlug: any; isOpen: boolean; property: any | null 
}>({ 
    isOpen: false, 
    property: null 
  });
  const [copied, setCopied] = useState(false);
  
  // Extract property data with fallbacks
  const propertyId = property.id || Math.random();
  const propertyName = property.name || property.property_name || 'Premium Property';
  const propertyAddress = property.address || property.location || property.area || 'Location details available';
  const cityName = property.city?.name || property.city_name || '';
  const fullLocation = cityName ? `${propertyAddress}, ${cityName}` : propertyAddress;
  const propertyPrice = property.starting_price || property.price || property.monthly_rent || property.rent || 15000;
  const rating = property.rating || 4.5;
  const reviewCount = property.review_count || 24;
  
  // Extract images with fallback
  const propertyImages = (() => {
    if (property.photo_urls && Array.isArray(property.photo_urls)) return property.photo_urls;
    if (property.images && Array.isArray(property.images)) return property.images;
    if (property.photos && Array.isArray(property.photos)) return property.photos;
    if (property.image_urls && Array.isArray(property.image_urls)) return property.image_urls;
    return [];
  })();
  
  const totalImages = propertyImages.length;
  const currentImage = !imageError && totalImages > 0 
    ? `${API_URL}${propertyImages[currentImageIndex]}` 
    : FALLBACK_IMAGES[fallbackIndex];


// Then extract tags with a more comprehensive approach:
const propertyTags = (() => {
  // Try multiple paths to find tags
  const possibleTagSources = [
    property.transformedData?.tags,
    property.tags,
    property.property_tags,
    property.category_tags,
    property.labels,
    property.tag_list
  ];
  
  for (const source of possibleTagSources) {
    if (source && Array.isArray(source) && source.length > 0) {
      return source;
    }
  }
  
  // Also check if tags are in the transformedData but with different property name
  if (property.transformedData) {
    // Check all keys in transformedData that might contain tags
    const possibleKeys = ['tags', 'propertyTags', 'property_tags', 'categories', 'labels'];
    for (const key of possibleKeys) {
      if (property.transformedData[key] && Array.isArray(property.transformedData[key]) && property.transformedData[key].length > 0) {
        return property.transformedData[key];
      }
    }
  }
  
  return [];
})();


  // Extract amenities
  const amenities = (() => {
    let amens: string[] = [];
    if (property.amenities && Array.isArray(property.amenities)) amens = property.amenities;
    else if (property.features && Array.isArray(property.features)) amens = property.features;
    else if (property.amenities_list && Array.isArray(property.amenities_list)) amens = property.amenities_list;
    else {
      if (property.has_wifi) amens.push("WiFi");
      if (property.has_meals) amens.push("Meals");
      if (property.has_security) amens.push("Security");
      if (property.has_parking) amens.push("Parking");
      if (property.ac_available) amens.push("AC");
      if (property.attached_bath) amens.push("Bath");
      if (property.power_backup) amens.push("Power Backup");
      if (property.housekeeping) amens.push("Housekeeping");
    }
    return amens;
  })();

  const displayAmenities = amenities.slice(0, 5);
  
  // Extract beds and rooms
  const totalBeds = property.total_beds || property.beds_available || property.beds || property.bed_count || 10;
  const totalRooms = property.total_rooms || property.rooms || property.room_count || '';
  const totalBathrooms = property.total_bathrooms || property.bathrooms || property.bathroom_count || '';
  
  // Get property type
  const propertyType = property.property_type || property.type || '';

  // Handle card click - navigate to details page
const handleCardClick = useCallback((e: React.MouseEvent) => {
  const target = e.target as HTMLElement;
  const isInteractive = target.closest('button') || target.closest('a');
  
  if (!isInteractive) {
    window.scrollTo(0, 0);
    
    // Generate or get tracking ID for this property
    const trackingId = getOrCreateTrackingId(property.id);
    
    // Use seoSlug if available
    const slug = property.seoSlug || property.slug || property.id;
    
    // Navigate with tracking parameter
    router.push(`/properties/${slug}?tf=${trackingId}`);
  }
}, [router, property.seoSlug, property.slug, property.id]);

// Update the Details button click handler
const handleDetailsClick = useCallback((e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  window.scrollTo(0, 0);
  
  const trackingId = getOrCreateTrackingId(property.id);
  const slug = property.seoSlug || property.slug || property.id;
  
  router.push(`/properties/${slug}?tf=${trackingId}`);
}, [router, property.seoSlug, property.slug, property.id]);

  // Image navigation handlers - with stopPropagation to prevent card click
  const nextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (totalImages > 0) {
      setCurrentImageIndex(prev => (prev + 1) % totalImages);
      setImageError(false);
    }
  }, [totalImages]);

  const prevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (totalImages > 0) {
      setCurrentImageIndex(prev => (prev - 1 + totalImages) % totalImages);
      setImageError(false);
    }
  }, [totalImages]);

  const setImageIndex = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Get tag color based on tag text
  const getTagColor = useCallback((tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('male') || t.includes('boys') || t.includes('men')) return 'bg-gradient-to-r from-blue-600 to-blue-800 text-white';
    if (t.includes('female') || t.includes('girls') || t.includes('women')) return 'bg-gradient-to-r from-pink-600 to-rose-600 text-white';
    if (t.includes('couple') || t.includes('married')) return 'bg-gradient-to-r from-purple-600 to-purple-800 text-white';
    if (t.includes('family')) return 'bg-gradient-to-r from-green-600 to-green-800 text-white';
    if (t.includes('working') || t.includes('professional')) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
    if (t.includes('student')) return 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white';
    if (t.includes('new') || t.includes('latest')) return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    if (t.includes('premium') || t.includes('luxury')) return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black';
    if (t.includes('discount') || t.includes('offer')) return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
    if (t.includes('verified')) return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white';
    return 'bg-gradient-to-r from-slate-600 to-slate-800 text-white';
  }, []);

  // Get icon based on amenity
  const getAmenityIcon = useCallback((amenity: string) => {
    const am = String(amenity).toLowerCase();
    if (am.includes('wifi') || am.includes('wi-fi')) return <Wifi className="h-4 w-4" />;
    if (am.includes('meal') || am.includes('food')) return <Utensils className="h-4 w-4" />;
    if (am.includes('security') || am.includes('cctv')) return <Shield className="h-4 w-4" />;
    if (am.includes('parking')) return <Car className="h-4 w-4" />;
    if (am.includes('ac') || am.includes('air')) return <Zap className="h-4 w-4" />;
    if (am.includes('bath')) return <Bath className="h-4 w-4" />;
    if (am.includes('power') || am.includes('backup')) return <Zap className="h-4 w-4" />;
    if (am.includes('housekeeping') || am.includes('cleaning')) return <Clock className="h-4 w-4" />;
    if (am.includes('furnished')) return <Home className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  }, []);

  // Get amenity tag color
  const getAmenityColor = useCallback((index: number) => {
    const colors = [
      'bg-blue-50 text-blue-700 border-blue-200',
      'bg-emerald-50 text-emerald-700 border-emerald-200',
      'bg-amber-50 text-amber-700 border-amber-200',
      'bg-purple-50 text-purple-700 border-purple-200',
      'bg-cyan-50 text-cyan-700 border-cyan-200',
      'bg-pink-50 text-pink-700 border-pink-200',
      'bg-indigo-50 text-indigo-700 border-indigo-200',
      'bg-rose-50 text-rose-700 border-rose-200',
    ];
    return colors[index % colors.length];
  }, []);

  // Handle heart click
  const handleHeartClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onHeartClick) {
      onHeartClick(propertyId, e);
    }
  }, [onHeartClick, propertyId]);

  // Handle WhatsApp click
  const handleWhatsAppClick = useCallback((e?: React.MouseEvent) => {
  e?.preventDefault();
  e?.stopPropagation();

  const phone = "9923953933"; 

  const message = `Hi, I'm interested in ${propertyName} located at ${fullLocation}`;
  
  const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}, [propertyName, fullLocation]);


  // Handle call click
  const handleCallClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCallClick) {
      onCallClick(property.phone || property.contact_number || '9923953933');
    }
  }, [onCallClick, property.phone, property.contact_number]);

  // Handle share click
// In PropertyCard.tsx, update the share functionality
const handleShareClick = useCallback((e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  
  const trackingId = getOrCreateTrackingId(property.id);
  const slug = property.seoSlug || property.slug || property.id;
  const shareUrl = `${window.location.origin}/properties/${slug}?tf=${trackingId}`;
  
  setSharePopup({ isOpen: true, property, shareUrl });
}, [property]);

// In the share popup, use the shareUrl with tracking

  // Close share popup
  const closeSharePopup = useCallback(() => {
    setSharePopup({ isOpen: false, property: null });
    setCopied(false);
  }, []);

  // Handle copy link
  const handleCopyLink = useCallback(() => {
    // In the share popup, update the share URL
const shareUrl = `${window.location.origin}/properties/${sharePopup.seoSlug || sharePopup.slug || sharePopup.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sharePopup.property]);

  // Handle social share
  const handleSocialShare = useCallback((platform: string) => {
    const shareUrl = `${window.location.origin}/properties/${sharePopup.property?.slug || sharePopup.property?.id}`;
    const propertyName = sharePopup.property?.name || sharePopup.property?.property_name || 'Premium Property';
    const shareText = `Check out this property: ${propertyName}`;

    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(propertyName)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  }, [sharePopup.property]);

  // Reset image error when property changes
  useEffect(() => {
    setImageError(false);
    setCurrentImageIndex(0);
  }, [property.id]);

  const isLiked = likedProperties.has(propertyId);

  return (
    <>
      <div 
        className="group block h-full cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative overflow-hidden rounded-2xl bg-[#f0f5f5] shadow-md hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 h-[500px] flex flex-col">
          
          {/* Image area */}
          <div className="relative h-52 sm:h-56 md:h-60 overflow-hidden rounded-t-2xl flex-shrink-0">
            <img
              src={currentImage}
              alt={propertyName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              style={{ transform: 'scale(1.03)' }}
              onError={handleImageError}
            />
            
            {/* Watermark - Center (Like RealEstateVin) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[5] pointer-events-none">
              <div
                className="text-white/40 text-sm sm:text-base md:text-lg lg:text-3xl font-semibold tracking-wide select-none whitespace-nowrap"
                style={{
                  textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                  fontFamily: 'Poppins, sans-serif',
                  letterSpacing: '0.05em'
                }}
              >
                Roomac.in
              </div>
            </div>
            
            {/* Image navigation arrows - only show if multiple images and no error */}
            {totalImages > 1 && !imageError && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Rating pill — top left */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-slate-800">{rating}</span>
            </div>

            {/* Share & Heart — top right */}
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <button
                onClick={handleShareClick}
                className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all"
              >
                <Share2 className="h-4 w-4 text-slate-600" />
              </button>
              <button
                onClick={handleHeartClick}
                className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
              </button>
            </div>

            {/* Tags */}
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 z-10">
              {propertyTags.slice(0, 2).map((tag: string, ti: number) => (
                <span key={ti} className={`px-2 py-0.5 rounded-full text-xs font-semibold shadow-md ${getTagColor(tag)}`}>
                  {tag.length > 12 ? tag.substring(0, 12) + '...' : tag}
                </span>
              ))}
              {propertyTags.length === 0 && propertyType && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-white shadow-md capitalize">
                  {propertyType}
                </span>
              )}
            </div>

            {/* Image dots indicator */}
            {totalImages > 1 && !imageError && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
                {propertyImages.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={(e) => setImageIndex(index, e)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-white w-3'
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Fallback indicator */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
                <Building2 className="h-12 w-12 text-slate-400" />
              </div>
            )}

          *
          </div>

          {/* Card body */}
          <div className="p-4 sm:p-5 flex flex-col flex-grow">
            
            {/* Title + Price in Header Row */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 mr-3">
                <h3 className="font-bold text-base sm:text-lg text-slate-800 group-hover:text-[#0249a8] transition-colors duration-300 line-clamp-1">
                  {propertyName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-0.5 w-8 bg-[#0249a8] rounded-full" />
                  <div className="h-0.5 w-2 bg-[#fdbc0a] rounded-full" />
                </div>
              </div>
              
              {/* Price on the right */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Starting from</p>
                <p className="text-lg font-bold text-[#0249a8] whitespace-nowrap">
                  ₹{Number(propertyPrice).toLocaleString()}
                  <span className="text-sm text-slate-400 font-normal">/mo</span>
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-1.5 mb-3">
              <MapPin className="h-3.5 w-3.5 text-[#0249a8] flex-shrink-0 mt-0.5" />
              <span className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {fullLocation}
              </span>
            </div>

            {/* Beds, Rooms, Baths row */}
            <div className="flex items-center gap-4 mb-3 text-slate-600 text-xs">
              <div className="flex items-center gap-1.5">
                <Bed className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-semibold text-slate-700">{totalBeds}</span>
                <span className="text-slate-400">Beds</span>
              </div>
              
              {totalRooms && (
                <div className="flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5 text-[#0249a8]" />
                  <span className="font-semibold text-slate-700">{totalRooms}</span>
                  <span className="text-slate-400">Rooms</span>
                </div>
              )}
              
              {totalBathrooms && (
                <div className="flex items-center gap-1.5">
                  <Bath className="h-3.5 w-3.5 text-purple-500" />
                  <span className="font-semibold text-slate-700">{totalBathrooms}</span>
                  <span className="text-slate-400">Baths</span>
                </div>
              )}
            </div>

            {/* Amenity tags */}
            {displayAmenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {displayAmenities.map((a: any, ai: number) => (
                  <span 
                    key={ai} 
                    className={`px-2 py-0.5 rounded-md border text-xs font-medium ${getAmenityColor(ai)}`}
                  >
                    {String(a)}
                  </span>
                ))}
                {amenities.length > 5 && (
                  <span className="px-2 py-0.5 rounded-md border border-slate-200 text-xs text-slate-500 bg-slate-50">
                    +{amenities.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* Divider and Actions */}
            <div className="border-t border-slate-200 mt-auto pt-3">
              {/* WhatsApp, Call, View Details - ALL IN ONE LINE */}
              <div className="flex items-center gap-2">
                {/* Update the Details button */}
<button
  onClick={handleDetailsClick}
  className="flex-1 px-2 py-2.5 bg-[#0249a8] hover:bg-[#023a88] text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1"
>
  <span>Details</span>
  <ArrowRight className="h-3 w-3" />
</button>
                <button
                  onClick={handleWhatsAppClick}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  title="WhatsApp"
                >
                  <BsWhatsapp className="h-4 w-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
                
                <button
                  onClick={handleCallClick}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  title="Call"
                >
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">Call</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Popup Modal */}
      {sharePopup.isOpen && sharePopup.property && (() => {
        const prop = sharePopup.property;
        let propImages: string[] = [];
        if (prop.photo_urls && Array.isArray(prop.photo_urls)) propImages = prop.photo_urls;
        else if (prop.images && Array.isArray(prop.images)) propImages = prop.images;
        else if (prop.photos && Array.isArray(prop.photos)) propImages = prop.photos;
        else if (prop.image_urls && Array.isArray(prop.image_urls)) propImages = prop.image_urls;
        
        const propImage = propImages.length > 0 ? propImages[0] : 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600';
        const propName = prop.name || prop.property_name || 'Premium Property';
        const propPrice = prop.starting_price || prop.price || prop.monthly_rent || prop.rent || 15000;
        const propBeds = prop.total_beds || prop.beds_available || prop.beds || 10;
        const propLocation = prop.address || prop.location || prop.area || 'Location';
        
        return (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeSharePopup}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Property Image */}
              <div className="relative h-40 bg-gradient-to-br from-[#0249a8] to-[#023a88]">
                <img src={propImage} alt={propName} className="w-full h-full object-cover opacity-30" />
                
                <button
                  onClick={closeSharePopup}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all z-10"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
                
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="flex items-center justify-center mb-2">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm">
                      <Share2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white text-center">Share</h3>
                  <p className="text-blue-100 text-xs text-center">Share this amazing property</p>
                </div>
              </div>

              {/* Property Info Card */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={propImage} alt={propName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-800 truncate">{propName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[#0249a8] font-bold text-sm">₹{Number(propPrice).toLocaleString()}/mo</p>
                      <span className="text-slate-400">•</span>
                      <p className="text-xs text-slate-500">{propBeds} Beds</p>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{propLocation}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Copy Link */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/properties/${prop.slug || prop.id}`}
                      className="flex-1 bg-transparent text-xs text-slate-600 outline-none truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0249a8] hover:bg-[#023a88] text-white rounded-md text-xs font-medium transition-all hover:scale-105 flex-shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Social Share Buttons - 3 columns */}
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => {handleWhatsAppClick()}}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-200 transition-all hover:scale-105 group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <BsWhatsapp className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleSocialShare('facebook')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-all hover:scale-105 group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <FaFacebookF className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">Facebook</span>
                  </button>

                  <button
                    onClick={() => handleSocialShare('twitter')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 border border-sky-200 transition-all hover:scale-105 group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <FaTwitter className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">Twitter</span>
                  </button>

                  <button
                    onClick={() => handleSocialShare('linkedin')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-300 transition-all hover:scale-105 group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-700 to-cyan-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <FaLinkedinIn className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">LinkedIn</span>
                  </button>

                  <button
                    onClick={() => handleSocialShare('telegram')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 border border-cyan-200 transition-all hover:scale-105 group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <FaTelegramPlane className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">Telegram</span>
                  </button>

                  <button
                    onClick={() => handleSocialShare('email')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-slate-200 transition-all hover:scale-105 group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-600 to-gray-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <MdEmail className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
});

// Loading Skeleton Component
export const PropertyCardSkeleton = memo(function PropertyCardSkeleton() {
  return (
    <div className="h-[500px] rounded-2xl bg-[#f0f5f5] shadow-md overflow-hidden animate-pulse">
      <div className="h-52 sm:h-56 md:h-60 bg-slate-300" />
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-300 rounded" />
            <div className="h-3 w-24 bg-slate-300 rounded" />
          </div>
          <div className="h-7 w-20 bg-slate-300 rounded" />
        </div>
        <div className="h-3 w-full bg-slate-300 rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-slate-300 rounded-full" />
          <div className="h-6 w-16 bg-slate-300 rounded-full" />
          <div className="h-6 w-16 bg-slate-300 rounded-full" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-slate-300 rounded" />
          <div className="h-4 w-20 bg-slate-300 rounded" />
        </div>
        <div className="border-t border-slate-200 pt-3">
          <div className="flex gap-2">
            <div className="h-9 flex-1 bg-slate-300 rounded-lg" />
            <div className="h-9 flex-1 bg-slate-300 rounded-lg" />
            <div className="h-9 flex-1 bg-slate-300 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
});

// Error State Component
export const PropertyCardError = memo(function PropertyCardError({ 
  onRetry 
}: { 
  onRetry?: () => void 
}) {
  return (
    <div className="h-[500px] rounded-2xl bg-white shadow-md flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        Failed to Load Property
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        There was an error loading this property.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#0249a8] hover:bg-[#023a88] text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
});

// Empty State Component
export const PropertyCardEmpty = memo(function PropertyCardEmpty({
  hasFilters = false,
  onClearFilters
}: {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}) {
  return (
    <div className="col-span-full text-center py-16">
      <div className="max-w-md mx-auto">
        <Building2 className="h-16 w-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          {hasFilters ? 'No properties match your filters' : 'No Properties Found'}
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          {hasFilters 
            ? 'Try adjusting or clearing your search filters.' 
            : "We couldn't find any properties at the moment."}
        </p>
        {hasFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-6 py-3 bg-[#0249a8] hover:bg-[#023a88] text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
});

export default PropertyCard;