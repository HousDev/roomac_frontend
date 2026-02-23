


// components/admin/properties/PropertyDetailsClient.tsx - ENHANCED VERSION
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from '@/src/compat/next-navigation';
import {
    ArrowLeft,
    Building2,
    MapPin,
    Bed,
    DoorOpen,
    IndianRupee,
    Shield,
    User,
    Phone,
    Calendar,
    CheckCircle2,
    X,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Mail,
    Clock,
    Wifi,
    Utensils,
    Car,
    Home,
    Share2,
    Heart,
    Star,
    TrendingUp,
    AlertCircle,
    Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { getProperty } from '@/lib/propertyApi';

type Property = {
    id: string;
    name: string;
    city_id?: string | null;
    area: string;
    address: string;
    total_rooms: number;
    total_beds: number;
    occupied_beds?: number;
    starting_price: number;
    security_deposit: number;
    description?: string;
    property_manager_name: string;
    property_manager_phone: string;
    amenities: string[];
    services: string[];
    photo_urls: string[];
    property_rules?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string | null;
    lockin_period_months?: number;
    lockin_penalty_amount?: number;
    lockin_penalty_type?: string;
    notice_period_days?: number;
    notice_penalty_amount?: number;
    notice_penalty_type?: string;
    terms_conditions?: string;
    additional_terms?: string;
    tags?: string[];
};

interface PropertyDetailsClientProps {
    initialProperty: Property | null;
}

const PropertyDetailsClient = ({ initialProperty }: PropertyDetailsClientProps) => {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(initialProperty);
    const [loading, setLoading] = useState(!initialProperty);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [imageFullscreen, setImageFullscreen] = useState(false);

    const propertyId = params.id as string;

    useEffect(() => {
        if (!initialProperty && propertyId) {
            loadProperty();
        }
    }, [propertyId, initialProperty]);

    const loadProperty = async () => {
        setLoading(true);
        try {
            const res = await getProperty(propertyId);
            if (res && res.success && res.data) {
                const propertyData = {
                    ...res.data,
                    id: String(res.data.id || ''),
                    name: res.data.name || '',
                    area: res.data.area || '',
                    address: res.data.address || '',
                    total_rooms: Number(res.data.total_rooms) || 0,
                    total_beds: Number(res.data.total_beds) || 0,
                    occupied_beds: Number(res.data.occupied_beds) || 0,
                    starting_price: Number(res.data.starting_price) || 0,
                    security_deposit: Number(res.data.security_deposit) || 0,
                    description: res.data.description || '',
                    property_manager_name: res.data.property_manager_name || '',
                    property_manager_phone: res.data.property_manager_phone || '',
                    amenities: Array.isArray(res.data.amenities) ? res.data.amenities : [],
                    services: Array.isArray(res.data.services) ? res.data.services : [],
                    photo_urls: Array.isArray(res.data.photo_urls) ? res.data.photo_urls : [],
                    property_rules: res.data.property_rules || '',
                    is_active: Boolean(res.data.is_active),
                    lockin_period_months: res.data.lockin_period_months || 0,
                    lockin_penalty_amount: res.data.lockin_penalty_amount || 0,
                    lockin_penalty_type: res.data.lockin_penalty_type || "fixed",
                    notice_period_days: res.data.notice_period_days || 0,
                    notice_penalty_amount: res.data.notice_penalty_amount || 0,
                    notice_penalty_type: res.data.notice_penalty_type || "fixed",
                    terms_conditions: res.data.terms_conditions || "",
                    additional_terms: res.data.additional_terms || "",
                    tags: Array.isArray(res.data.tags)
                        ? res.data.tags.filter((t: any) => t != null && t !== '' && typeof t === 'string')
                        : [],
                };
                setProperty(propertyData);
            } else {
                toast.error(res?.message || "Failed to load property details");
                router.back();
            }
        } catch (err) {
            console.error("loadProperty error:", err);
            toast.error("Failed to load property details");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-6" />
                        <div className="absolute inset-0 blur-xl bg-blue-600/20 rounded-full" />
                    </div>
                    <p className="text-lg text-slate-700 font-medium">Loading property details...</p>
                    <p className="text-sm text-slate-500 mt-2">Please wait</p>
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-white rounded-3xl p-8 shadow-xl">
                        <div className="bg-red-50 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">Property Not Found</h2>
                        <p className="text-slate-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all mx-auto shadow-lg hover:shadow-xl"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Back to Properties
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const nextImage = () => {
        if (property.photo_urls.length > 0) {
            setCurrentImageIndex((prev) =>
                prev === property.photo_urls.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        if (property.photo_urls.length > 0) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? property.photo_urls.length - 1 : prev - 1
            );
        }
    };

    const occupiedBeds = property.occupied_beds || 0;
    const totalBeds = property.total_beds || 1;
    const occupancyPercentage = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
    const availableBeds = totalBeds - occupiedBeds;

    const currentPhotoUrl = property.photo_urls && property.photo_urls[currentImageIndex]
        ? `${import.meta.env.VITE_API_URL || ''}${property.photo_urls[currentImageIndex]}`
        : '';

    const getAmenityIcon = (amenity: string) => {
        const lower = amenity.toLowerCase();
        if (lower.includes('wifi')) return <Wifi className="h-5 w-5" />;
        if (lower.includes('food') || lower.includes('meal')) return <Utensils className="h-5 w-5" />;
        if (lower.includes('parking')) return <Car className="h-5 w-5" />;
        if (lower.includes('security')) return <Shield className="h-5 w-5" />;
        return <CheckCircle2 className="h-5 w-5" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
            {/* Sticky Header */}
            <div className="  sticky top-20 z-10 border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors group"
                        >
                            <div className="bg-slate-100 group-hover:bg-blue-50 rounded-full p-2 transition-colors">
                                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            </div>
                            <span className="font-semibold hidden sm:inline">Back to Properties</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className="bg-white hover:bg-red-50 rounded-full p-2.5 shadow-md transition-all hover:scale-110"
                            >
                                <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                            </button>
                            <button className="bg-white hover:bg-blue-50 rounded-full p-2.5 shadow-md transition-all hover:scale-110">
                                <Share2 className="h-5 w-5 text-slate-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Image Gallery - Compact */}
<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
  <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-200 to-slate-300">

    {property.photo_urls && property.photo_urls.length > 0 ? (
      <>
        <img
          src={currentPhotoUrl}
          alt={`${property.name} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://via.placeholder.com/1200x675/f1f5f9/475569?text=${encodeURIComponent(property.name)}`;
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Image Navigation */}
        {property.photo_urls.length > 1 && (
          <>
            {/* Left Arrow */}
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2
                         bg-white/90 hover:bg-white text-slate-800
                         p-1.5 md:p-3 rounded-full shadow-lg transition-all"
            >
              <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
            </button>

            {/* Right Arrow */}
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2
                         bg-white/90 hover:bg-white text-slate-800
                         p-1.5 md:p-3 rounded-full shadow-lg transition-all"
            >
              <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2
                            flex gap-1.5 md:gap-2
                            bg-black/30 backdrop-blur-sm
                            rounded-full px-2 md:px-4 py-1 md:py-2">
              {property.photo_urls.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`rounded-full transition-all
                    ${idx === currentImageIndex
                      ? 'w-5 md:w-8 h-1.5 md:h-2 bg-white'
                      : 'w-1.5 md:w-2 h-1.5 md:h-2 bg-white/50'}
                  `}
                />
              ))}
            </div>
          </>
        )}

        {/* Fullscreen Button */}
        {/* <button
          type="button"
          onClick={() => setImageFullscreen(true)}
          className="absolute top-2 md:top-4 left-2 md:left-4
                     bg-black/40 hover:bg-black/60
                     backdrop-blur-sm text-white
                     p-1.5 md:p-2.5 rounded-full transition-all"
        >
          <Maximize2 className="h-4 w-4 md:h-5 md:w-5" />
        </button> */}
      </>
    ) : (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <Building2 className="h-16 md:h-24 w-16 md:w-24 text-slate-400 mb-2 md:mb-4" />
        <p className="text-xs md:text-base text-slate-500 font-medium">
          No images available
        </p>
      </div>
    )}

    {/* Status Badge */}
    <div className="absolute top-2 md:top-4 right-2 md:right-4">
      <span
        className={`px-2 md:px-4 py-1 md:py-2
                    rounded-full text-[10px] md:text-sm
                    font-bold shadow-lg backdrop-blur-sm
                    ${property.is_active
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-slate-500/90 text-white'}`}
      >
        {property.is_active ? '● Active' : '● Inactive'}
      </span>
    </div>

    {/* Image Counter */}
    {property.photo_urls && property.photo_urls.length > 0 && (
      <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4
                      bg-black/40 backdrop-blur-sm text-white
                      px-2 md:px-3 py-1
                      rounded-full text-[10px] md:text-sm font-medium">
        {currentImageIndex + 1} / {property.photo_urls.length}
      </div>
    )}
  </div>
</div>


                        {/* Property Info Card - Compact */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                            {/* Header - Smaller */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-blue-100 rounded-xl p-2">
                                            <Building2 className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{property.name}</h1>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <MapPin className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium">{property.area}, {property.city_id || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tags - Smaller */}
                            {property.tags && property.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {property.tags.map((tag, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-full text-[10px] font-semibold border border-blue-200">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Description - Smaller */}
                            {property.description && (
                                <div className="mb-4 pb-4 border-b border-slate-200">
                                    <h3 className="text-sm font-bold text-slate-800 mb-2">About This Property</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{property.description}</p>
                                </div>
                            )}

                            {/* Stats Grid - Compact */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center hover:scale-105 transition-transform">
                                    <DoorOpen className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                                    <p className="text-xl font-bold text-slate-900">{property.total_rooms || 0}</p>
                                    <p className="text-[10px] text-slate-600 font-medium">Rooms</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center hover:scale-105 transition-transform">
                                    <Bed className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                                    <p className="text-xl font-bold text-slate-900">{property.total_beds || 0}</p>
                                    <p className="text-[10px] text-slate-600 font-medium">Total Beds</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-3 text-center hover:scale-105 transition-transform">
                                    <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
                                    <p className="text-xl font-bold text-slate-900">{availableBeds}</p>
                                    <p className="text-[10px] text-slate-600 font-medium">Available</p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-3 text-center hover:scale-105 transition-transform">
                                    <User className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                                    <p className="text-xl font-bold text-slate-900">{occupiedBeds}</p>
                                    <p className="text-[10px] text-slate-600 font-medium">Occupied</p>
                                </div>
                            </div>

                            {/* Occupancy Bar - Compact */}
                            <div className="mb-4 bg-slate-50 rounded-xl p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        <span className="text-xs font-bold text-slate-800">Occupancy</span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600">{occupancyPercentage.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 h-full rounded-full transition-all duration-700"
                                        style={{ width: `${occupancyPercentage}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                                    <span>{occupiedBeds} Occupied</span>
                                    <span>{availableBeds} Available</span>
                                </div>
                            </div>

                            {/* Amenities - Compact Grid */}
                            {property.amenities && property.amenities.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
                                        <Star className="h-4 w-4 text-amber-500" />
                                        Amenities
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {property.amenities.slice(0, 4).map((amenity, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-2 hover:shadow-sm transition-all"
                                            >
                                                <div className="text-blue-600 flex-shrink-0">
                                                    {getAmenityIcon(amenity)}
                                                </div>
                                                <span className="text-[11px] font-medium text-slate-700 truncate">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {property.amenities.length > 4 && (
                                        <p className="text-[10px] text-slate-500 mt-2">+{property.amenities.length - 4} more amenities</p>
                                    )}
                                </div>
                            )}

                            {/* Services - Moved to sidebar */}
                            
                            {/* Property Rules - Compact */}
                            {property.property_rules && (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl p-4">
                                    <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
                                        <Shield className="h-4 w-4 text-amber-600" />
                                        Property Rules
                                    </h3>
                                    <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">{property.property_rules}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Balanced Height */}
                    <div className="space-y-4">
                        {/* Pricing Card - Compact */}
                        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl shadow-xl p-5 text-white ">
                            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                                <IndianRupee className="h-5 w-5" />
                                Pricing Details
                            </h3>

                            <div className="space-y-3 mb-4">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                                    <p className="text-blue-100 text-[10px] mb-1 font-medium">Starting Price</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <IndianRupee className="h-5 w-5" />
                                        <span className="text-2xl font-bold">{property.starting_price.toLocaleString()}</span>
                                        <span className="text-blue-100 text-sm">/month</span>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                                    <p className="text-blue-100 text-[10px] mb-1 font-medium">Security Deposit</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <Shield className="h-4 w-4" />
                                        <span className="text-xl font-bold">₹{property.security_deposit.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 text-sm">
                                <Phone className="h-4 w-4" />
                                Contact Now
                            </button>
                        </div>

                        {/* Address Card - Moved to Sidebar */}
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <h3 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                Full Address
                            </h3>
                            <p className="text-xs text-slate-700 leading-relaxed">{property.address || 'No address provided.'}</p>
                        </div>

                        {/* Services Card - Moved to Sidebar */}
                        {property.services && property.services.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-4">
                                <h3 className="font-bold text-sm text-slate-900 mb-3">Services</h3>
                                <div className="space-y-1.5">
                                    {property.services.map((service, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                            <span>{service}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Manager Card - Compact */}
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <h3 className="font-bold text-sm text-slate-900 mb-3">Property Manager</h3>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-2">
                                        <User className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-medium">Name</p>
                                        <p className="font-bold text-xs text-slate-900">{property.property_manager_name || 'Not assigned'}</p>
                                    </div>
                                </div>

                                {property.property_manager_phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl p-2">
                                            <Phone className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-medium">Phone</p>
                                            <a
                                                href={`tel:${property.property_manager_phone}`}
                                                className="font-bold text-xs text-blue-600 hover:text-blue-700"
                                            >
                                                {property.property_manager_phone}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {property.property_manager_phone && (
                                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm">
                                    <Phone className="h-4 w-4" />
                                    Call Manager
                                </button>
                            )}
                        </div>

                        {/* Timeline Card - Compact */}
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-slate-600" />
                                Timeline
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-2 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div className="bg-blue-100 rounded-lg p-1.5 mt-0.5">
                                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-medium mb-0.5">Created</p>
                                        <p className="font-semibold text-xs text-slate-900">
                                            {property.created_at ? new Date(property.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {property.updated_at && (
                                    <div className="flex items-start gap-2">
                                        <div className="bg-green-100 rounded-lg p-1.5 mt-0.5">
                                            <Calendar className="h-3.5 w-3.5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-medium mb-0.5">Last Updated</p>
                                            <p className="font-semibold text-xs text-slate-900">
                                                {new Date(property.updated_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsClient;