"use client";

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useRouter } from '@/src/compat/next-navigation';
import {
  MapPin, Share2, Star, IndianRupee, CheckCircle2, Shield, Eye, Heart, MessageSquare,
  ChevronLeft, ChevronRight, X, Image as ImageIcon, FileText, Sparkles,
  Home, User, Users, Wind, Wifi, Building2, Bus, ShoppingCart, Utensils,
  Film, Tag, Percent, Clock, Gift, Zap, Check, Crown, Phone, Mail, Calendar,
  CreditCard, Filter, Search, CalendarDays, Bed, ShieldCheck, Dumbbell,
  Tv, Thermometer, Droplets, Volume2, Lock, Bell, Cloud, Sun, Moon,
  Battery, Radio, Router, Bath, Car, Building, AlertCircle, FileCheck,
  ThumbsUp, TrendingUp, Award, SlidersHorizontal, ArrowRight, ChevronDown,
  Maximize2, Coffee as CoffeeIcon, Bath as BathIcon, Coffee, Link2, CheckCircle
} from 'lucide-react';
import BookingModal from './BookingModal';

const Icons = {
  Wifi, Wind, Utensils, Shield, Zap, Home, Building2, Bus, ShoppingCart, Heart, Film,
  Bath, Car, Building, Dumbbell, Coffee, Tv, Thermometer, Droplets, Volume2, Lock,
  Bell, Cloud, Sun, Moon, Battery, Radio, Router,
  tag: Tag, percent: Percent, clock: Clock, gift: Gift, transport: Bus, company: Building2,
  shopping: ShoppingCart, hospital: Heart, restaurant: Utensils, entertainment: Film
};

interface PropertyDetailViewProps {
  propertyData: any;
  offers: any[];
}

const PropertyDetailView = memo(function PropertyDetailView({ propertyData, offers }: PropertyDetailViewProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllRooms, setShowAllRooms] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState('long');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedSharing, setSelectedSharing] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedAmenities, setSelectedAmenities] = useState({ ac: false, wifi: false });
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isClient, setIsClient] = useState(false);
  
  // New states for share modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
   const [preselectedRoomId, setPreselectedRoomId] = useState<number | undefined>(undefined); // ADD 

  // Set isClient to true when component mounts on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleShare = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  const copyShareLink = useCallback(() => {
    if (isClient) {
      navigator.clipboard.writeText(window.location.href);
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 3000);
    }
  }, [isClient]);

  const nextImage = useCallback(() => {
    if (!propertyData?.images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % propertyData.images.length);
  }, [propertyData?.images]);

  const prevImage = useCallback(() => {
    if (!propertyData?.images?.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + propertyData.images.length) % propertyData.images.length);
  }, [propertyData?.images]);

  useEffect(() => {
    if (!propertyData?.images?.length) return;
    
    const interval = setInterval(() => {
      nextImage();
    }, 5000);
    return () => clearInterval(interval);
  }, [propertyData?.images, nextImage]);

  const filteredRooms = useMemo(() => {
    if (!propertyData?.rooms) return [];
    
    return propertyData.rooms.filter((room: any) => {
      if (selectedFloor !== 'all' && room.floor !== Number(selectedFloor)) return false;
      if (selectedGender !== 'all' && room.gender !== selectedGender) return false;
      if (selectedSharing !== 'all' && room.sharingType !== Number(selectedSharing)) return false;
      if (priceRange === 'low' && room.price > 5000) return false;
      if (priceRange === 'mid' && (room.price <= 5000 || room.price > 7000)) return false;
      if (priceRange === 'high' && room.price <= 7000) return false;
      if (selectedAmenities.ac && !room.ac) return false;
      if (selectedAmenities.wifi && !room.wifi) return false;
      if (availabilityFilter === 'available' && room.status === 'occupied') return false;
      if (availabilityFilter === 'occupied' && room.status !== 'occupied') return false;
      if (availabilityFilter === 'partially' && room.status !== 'partially-available') return false;
      return true;
    });
  }, [propertyData, selectedFloor, selectedGender, selectedSharing, priceRange, selectedAmenities, availabilityFilter]);

  const roomTypeSummary = useMemo(() => {
    if (!propertyData?.rooms || propertyData.rooms.length === 0) {
      return [];
    }
    
    return propertyData.rooms.map((room: any) => {
      const sharingType = parseInt(room.sharingType?.toString()) || 2;
      const availableCount = parseInt(room.available) || 0;
      
      const gender = (room.gender || '').toLowerCase();
      let boysRooms = 0;
      let girlsRooms = 0;
      let mixedRooms = 0;
      
      if (gender === 'male' || gender === 'm') {
        boysRooms = 1;
      } else if (gender === 'female' || gender === 'f') {
        girlsRooms = 1;
      } else {
        mixedRooms = 1;
      }
      
      const availableNow = (room.status === 'available' || room.status === 'partially-available') 
        ? availableCount 
        : 0;
      
      const price = parseInt(room.price) || 
        (sharingType === 1 ? 7000 : 
         sharingType === 2 ? 5000 : 
         sharingType === 3 ? 4000 : 3500);
      
      const hasAC = room.ac === true || room.ac === 'true';
      const hasWiFi = room.wifi === true || room.wifi === 'true';
      
      return {
        id: room.id,
        sharingType: sharingType,
        price: price,
        totalAvailable: availableCount,
        availableNow: availableNow,
        totalRooms: 1,
        hasAC: hasAC,
        hasWiFi: hasWiFi,
        boysRooms: boysRooms,
        girlsRooms: girlsRooms,
        mixedRooms: mixedRooms,
        roomNumber: room.roomNumber || room.name || `Room ${room.id}`,
        roomData: room
      };
    });
  }, [propertyData]);

  const groupedRooms = useMemo(() => {
    const groups: any = {};
    filteredRooms.forEach((room: any) => {
      if (!groups[room.sharingType]) groups[room.sharingType] = [];
      groups[room.sharingType].push(room);
    });
    return groups;
  }, [filteredRooms]);

  const allCategories = useMemo(() => {
    if (!propertyData?.amenities) return ['all'];
    
    const categories = ['all'];
    propertyData.amenities.forEach((amenity: any) => {
      if (amenity.category && !categories.includes(amenity.category)) {
        categories.push(amenity.category);
      }
    });
    return categories;
  }, [propertyData]);

  const filteredAmenities = useMemo(() => {
    if (!propertyData?.amenities) return [];
    if (selectedCategory === 'all') return propertyData.amenities;
    return propertyData.amenities.filter((amenity: any) => amenity.category === selectedCategory);
  }, [propertyData, selectedCategory]);

  const clearFilters = useCallback(() => {
    setSelectedFloor('all');
    setSelectedGender('all');
    setSelectedSharing('all');
    setPriceRange('all');
    setSelectedAmenities({ ac: false, wifi: false });
    setAvailabilityFilter('all');
    setSelectedCategory('all');
  }, []);

  const hasActiveFilters = selectedFloor !== 'all' || selectedGender !== 'all' || selectedSharing !== 'all' ||
    priceRange !== 'all' || selectedAmenities.ac || selectedAmenities.wifi || availabilityFilter !== 'all';

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }, []);

  if (!propertyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Home className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mx-auto mb-4" />
          <p className="text-sm md:text-lg font-semibold text-gray-700">No property data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Floating Action Buttons - Responsive */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex flex-col gap-2 md:gap-3">
        <button
          onClick={handleShare}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-0.5 md:hover:-translate-y-1"
          title="Share Property"
        >
          <Share2 className="w-5 h-5" />
        </button>
        {/* <button
          onClick={() => setIsBookingModalOpen(true)}
          
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-0.5 md:hover:-translate-y-1 animate-pulse"
          title="Book Now"
        >
          <CalendarDays className="w-5 h-5" />
        </button> */}
        <button
  onClick={() => {
    setPreselectedRoomId(undefined); // Clear preselected room for general booking
    setIsBookingModalOpen(true);
  }}
  className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-0.5 md:hover:-translate-y-1 animate-pulse"
  title="Book Now"
>
  <CalendarDays className="w-5 h-5" />
</button>
      </div>

      {/* Share Modal - Like the image */}
     {isShareModalOpen && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Share Property</h3>
        <button
          onClick={() => setIsShareModalOpen(false)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Share Options */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-2">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Check out this property: ${propertyData.name} - ${propertyData.location}\n${isClient ? window.location.href : ''}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg transition-all group"
          >
            <div className="w-10 h-10 bg-[#25D366]/10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.08.57 4.03 1.56 5.71L2.2 21.44l3.96-1.31c1.63.89 3.49 1.4 5.47 1.4 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm.01 18.05c-1.7 0-3.36-.46-4.8-1.32l-.34-.2-2.55.84.85-2.48-.22-.35c-.86-1.44-1.32-3.1-1.32-4.8 0-4.63 3.77-8.4 8.4-8.4s8.4 3.77 8.4 8.4-3.77 8.4-8.4 8.4z"/>
                <path d="M16.23 13.44c-.23-.12-1.36-.67-1.57-.75-.21-.08-.37-.12-.52.12s-.6.75-.73.9c-.13.15-.27.17-.5.06-.23-.12-.97-.36-1.85-1.14-.68-.61-1.14-1.36-1.28-1.59-.13-.23-.01-.35.1-.46.1-.1.23-.27.34-.4.11-.14.15-.23.22-.38.07-.15.04-.29-.02-.4-.06-.12-.52-1.25-.71-1.71-.19-.46-.38-.38-.52-.39h-.44c-.15 0-.39.06-.6.28-.21.22-.8.78-.8 1.91s.82 2.22.94 2.37c.12.15 1.62 2.48 3.93 3.47.55.24.98.38 1.31.48.55.17 1.05.14 1.45.08.44-.06 1.36-.56 1.55-1.1.19-.54.19-1 .13-1.1-.06-.1-.23-.16-.47-.28z"/>
              </svg>
            </div>
            <span className="text-[10px] font-medium text-gray-600">WhatsApp</span>
          </a>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(isClient ? window.location.href : '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg transition-all group"
          >
            <div className="w-10 h-10 bg-[#4267B2]/10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-[#4267B2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
              </svg>
            </div>
            <span className="text-[10px] font-medium text-gray-600">Facebook</span>
          </a>

          {/* Twitter (X) */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this property: ${propertyData.name} - ${propertyData.location}`)}&url=${encodeURIComponent(isClient ? window.location.href : '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg transition-all group"
          >
            <div className="w-10 h-10 bg-black/10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <span className="text-[10px] font-medium text-gray-600">X</span>
          </a>

          {/* LinkedIn */}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(isClient ? window.location.href : '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg transition-all group"
          >
            <div className="w-10 h-10 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z"/>
              </svg>
            </div>
            <span className="text-[10px] font-medium text-gray-600">LinkedIn</span>
          </a>

          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(isClient ? window.location.href : '')}&text=${encodeURIComponent(`Check out this property: ${propertyData.name} - ${propertyData.location}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg transition-all group"
          >
            <div className="w-10 h-10 bg-[#26A5E4]/10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-[#26A5E4]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.04.01-.14-.06-.2s-.17-.04-.24-.02c-.1.02-1.77 1.13-4.99 3.3-.47.32-.9.48-1.28.47-.42-.01-1.23-.24-1.83-.44-.74-.24-1.32-.37-1.27-.78.03-.22.32-.44.9-.67 3.6-1.57 6.01-2.6 7.22-3.1 3.44-1.42 4.16-1.66 4.63-1.66.1 0 .33.02.48.13.13.09.16.21.17.29-.01.09.02.3 0 .46z"/>
              </svg>
            </div>
            <span className="text-[10px] font-medium text-gray-600">Telegram</span>
          </a>

          {/* Email */}
          <a
            href={`mailto:?subject=${encodeURIComponent(`Check out this property: ${propertyData.name}`)}&body=${encodeURIComponent(`I found this property and thought you might be interested:\n\n${propertyData.name}\n${propertyData.location}\nPrice: ₹${propertyData.startingPrice.toLocaleString()}/mo\n\n${isClient ? window.location.href : ''}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg transition-all group"
          >
            <div className="w-10 h-10 bg-[#EA4335]/10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-[#EA4335]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
            <span className="text-[10px] font-medium text-gray-600">Email</span>
          </a>

          {/* Copy Link */}
          <button
            onClick={copyShareLink}
            className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg transition-all group"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Link2 className="w-8 h-8 text-gray-600" />
            </div>
            <span className="text-[10px] font-medium text-gray-600">Copy</span>
          </button>
        </div>

        {/* Copy Link Message */}
        {showCopyMessage && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700 font-medium flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Link copied!
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
)}
      {/* Main Container */}
      <div className="max-w-[1800px] mx-auto px-3 py-2 md:px-4 md:py-3">
        {/* Sticky Back Button */}
        <div className="sticky top-20 md:top-[60px] z-50 md:bg-white backdrop-blur-sm rounded-lg md:rounded-none px-2 py-1 mb-2">
          <a
            href="/properties"
            className="inline-flex items-center gap-1 md:gap-2 text-black font-semibold text-xs md:text-sm rounded transition-all group"
          >
            <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Properties</span>
          </a>
        </div>

        {/* Header - Responsive */}
        <div className="mb-3 md:mb-2">
          <div className="bg-white rounded-xl p-3 md:p-4 shadow-lg md:shadow-xl relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
              {/* Left Section - Property Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
                  <h1 className="text-lg md:text-2xl font-black gradient-text truncate">
                    {propertyData.name}
                  </h1>
                  {propertyData.isFeatured && (
                    <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap">
                      <Star className="w-2 h-2 md:w-3 md:h-3 inline mr-0.5" />
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 md:gap-2 text-gray-600 mb-1">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-xs md:text-sm truncate">
                    {propertyData.location}
                  </span>
                </div>

                <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1 md:line-clamp-none">
                  {propertyData.address}
                </p>
              </div>

              {/* Stats - Responsive Grid */}
              <div className="grid grid-cols-3 md:flex md:items-center gap-1 md:gap-3 text-xs">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg px-2 py-1.5 md:px-3 md:py-2 border border-green-200">
                  <p className="font-bold text-green-700 text-[10px] md:text-xs">Available Beds</p>
                  <div className="flex items-baseline gap-0.5 md:gap-1">
                    <Bed className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                    <span className="font-black text-green-700 text-sm md:text-base">
                      {propertyData.totalBeds - propertyData.occupiedBeds}
                    </span>
                    <span className="text-gray-600 font-bold text-[10px] md:text-sm">
                      /{propertyData.totalBeds}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg px-2 py-1.5 md:px-3 md:py-2 border border-blue-200">
                  <p className="font-bold text-blue-700 text-[10px] md:text-xs">Starting From</p>
                  <div className="flex items-baseline gap-0.5 md:gap-1">
                    <IndianRupee className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                    <span className="font-black text-blue-600 text-sm md:text-base">
                      {propertyData.startingPrice.toLocaleString()}
                    </span>
                    <span className="text-gray-600 font-bold text-[10px] md:text-sm">/mo</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg px-2 py-1.5 md:px-3 md:py-2 border border-amber-200">
                  <p className="font-bold text-amber-700 text-[10px] md:text-xs">Rating</p>
                  <div className="flex items-baseline gap-0.5 md:gap-1">
                    <Star className="w-3 h-3 md:w-4 md:h-4 text-amber-600 fill-amber-600" />
                    <span className="font-black text-amber-700 text-sm md:text-base">
                      {propertyData.averageRating}
                    </span>
                    <span className="text-gray-600 font-bold text-[10px] md:text-sm">/5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout - Responsive Grid */}
        <div className="lg:grid lg:grid-cols-[1fr,400px] lg:gap-6 space-y-4 lg:space-y-0">
          {/* Main Content */}
          <div className="space-y-4 lg:space-y-6">
            {/* Image Gallery */}
            <div className="relative group">
              <div className="relative w-full h-[250px] md:h-[400px] lg:h-[500px] xl:h-[600px] rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl">
                <img
                  src={propertyData.images[currentImageIndex]}
                  alt="Property"
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Image Stats */}
                <div className="absolute top-3 md:top-6 left-3 md:left-6 flex gap-1.5 md:gap-3">
                  <div className="glass-dark px-2 py-1.5 md:px-4 md:py-3 rounded-lg md:rounded-xl backdrop-blur-md flex items-center gap-1 md:gap-2 shadow-lg">
                    <Eye className="w-3 h-3 md:w-5 md:h-5 text-white" />
                    <span className="font-black text-xs md:text-base text-white">{propertyData.activity.totalViews}</span>
                  </div>
                  <div className="glass-dark px-2 py-1.5 md:px-4 md:py-3 rounded-lg md:rounded-xl backdrop-blur-md flex items-center gap-1 md:gap-2 shadow-lg">
                    <Heart className="w-3 h-3 md:w-5 md:h-5 text-rose-400" />
                    <span className="font-black text-xs md:text-base text-white">{propertyData.activity.shortlistedBy}</span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <button onClick={prevImage} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 glass-dark p-2 md:p-4 rounded-lg md:rounded-2xl text-white transition-all hover:scale-105 md:hover:scale-110">
                  <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
                </button>
                <button onClick={nextImage} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 glass-dark p-2 md:p-4 rounded-lg md:rounded-2xl text-white transition-all hover:scale-105 md:hover:scale-110">
                  <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-3 md:bottom-6 left-3 md:left-6 glass-dark px-2 py-1.5 md:px-5 md:py-3 rounded-lg md:rounded-2xl text-white font-bold flex items-center gap-1 md:gap-2 text-xs md:text-base">
                  <ImageIcon className="w-3 h-3 md:w-5 md:h-5" />
                  {currentImageIndex + 1} / {propertyData.images.length}
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex gap-1.5 md:gap-3 mt-2 md:mt-4 overflow-x-auto pb-1 md:pb-2">
                {propertyData.images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg md:rounded-xl overflow-hidden border transition-all ${currentImageIndex === index
                        ? 'border-blue-600 scale-105 shadow-md md:shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-3 md:px-6 py-2 md:py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center">
                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <h2 className="text-sm md:text-xl font-black text-white">About This Property</h2>
                </div>
              </div>
              <div className="p-3 md:p-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg md:rounded-xl p-3 md:p-6 mb-3 md:mb-6 border border-blue-100 md:border-2">
                  <p className="text-gray-800 leading-relaxed font-medium text-xs md:text-base">
                    {propertyData.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                  {propertyData.highlights.map((highlight: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 md:gap-3 bg-white p-2 md:p-4 rounded-lg md:rounded-xl border border-gray-100 md:border-2 hover:border-blue-200 transition-all">
                      <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                      <span className="text-xs md:text-sm font-bold text-gray-800">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Available Rooms */}
            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg md:shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0 mb-3 md:mb-6">
                <div>
                  <h2 className="text-base md:text-2xl font-black gradient-text flex items-center">
                    <Home className="w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-2" />Available Rooms
                  </h2>
                  {propertyData?.rooms?.length === 0 && (
                    <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5 md:mt-1">
                      No rooms available at the moment
                    </p>
                  )}
                  <div className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">
                    Showing {Math.min(roomTypeSummary.length, 3)} of {roomTypeSummary.length} room types
                  </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-4 md:py-2 bg-white border border-gray-200 md:border-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm hover:border-blue-500 transition-all"
                  >
                    <Filter className="w-3 h-3 md:w-4 md:h-4" />
                    Filters
                  </button>
                  <button
                    onClick={() => setShowAllRooms(true)}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg md:rounded-xl font-bold hover:shadow-lg md:hover:shadow-xl transition-all text-xs md:text-sm"
                  >
                    View All Rooms
                  </button>
                </div>
              </div>

              {propertyData?.rooms?.length === 0 ? (
                <div className="text-center py-6 md:py-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg md:rounded-2xl border border-blue-100 md:border-2">
                  <Home className="w-10 h-10 md:w-16 md:h-16 text-blue-400 mx-auto mb-2 md:mb-4" />
                  <h3 className="text-sm md:text-xl font-bold text-gray-700 mb-1 md:mb-2">No Rooms Available</h3>
                  <p className="text-gray-600 mb-2 md:mb-4 text-xs md:text-base">
                    There are currently no rooms available for this property.
                  </p>
                  <p className="text-[10px] md:text-sm text-gray-500">
                    Please check back later or contact the property manager.
                  </p>
                </div>
              ) : (
                <>
                  {/* Filters Panel */}
                  {showFilters && (
                    <div className="mb-3 md:mb-6 bg-white/50 rounded-lg md:rounded-xl p-2 md:p-4 border border-gray-100 md:border-2">
                      <div className="flex items-center justify-between mb-2 md:mb-4">
                        <h3 className="font-bold text-gray-900 text-xs md:text-base">Filter Rooms</h3>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="text-[10px] md:text-xs text-blue-600 font-semibold hover:text-blue-700"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-3">
                        <div>
                          <label className="block text-[10px] md:text-xs font-semibold text-gray-700 mb-0.5 md:mb-1">Floor</label>
                          <select
                            value={selectedFloor}
                            onChange={(e) => setSelectedFloor(e.target.value)}
                            className="w-full px-1.5 md:px-3 py-1 md:py-2 border border-gray-300 rounded md:rounded-lg text-xs md:text-sm"
                          >
                            <option value="all">All Floors</option>
                            <option value="1">1st Floor</option>
                            <option value="2">2nd Floor</option>
                            <option value="3">3rd Floor</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] md:text-xs font-semibold text-gray-700 mb-0.5 md:mb-1">Gender</label>
                          <select
                            value={selectedGender}
                            onChange={(e) => setSelectedGender(e.target.value)}
                            className="w-full px-1.5 md:px-3 py-1 md:py-2 border border-gray-300 rounded md:rounded-lg text-xs md:text-sm"
                          >
                            <option value="all">All</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="mixed">Mixed</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] md:text-xs font-semibold text-gray-700 mb-0.5 md:mb-1">Sharing</label>
                          <select
                            value={selectedSharing}
                            onChange={(e) => setSelectedSharing(e.target.value)}
                            className="w-full px-1.5 md:px-3 py-1 md:py-2 border border-gray-300 rounded md:rounded-lg text-xs md:text-sm"
                          >
                            <option value="all">All Types</option>
                            <option value="1">1 Sharing</option>
                            <option value="2">2 Sharing</option>
                            <option value="3">3 Sharing</option>
                            <option value="4">4 Sharing</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] md:text-xs font-semibold text-gray-700 mb-0.5 md:mb-1">Price</label>
                          <select
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                            className="w-full px-1.5 md:px-3 py-1 md:py-2 border border-gray-300 rounded md:rounded-lg text-xs md:text-sm"
                          >
                            <option value="all">All Prices</option>
                            <option value="low">Under ₹5000</option>
                            <option value="mid">₹5000-₹7000</option>
                            <option value="high">Above ₹7000</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-6">
                    {roomTypeSummary.slice(0, 3).map((summary: any) => (
                      <div
                        key={summary.id}
                        className="bg-white rounded-lg md:rounded-xl p-3 md:p-5 border border-gray-200 md:border-2 hover:border-blue-300 hover:shadow-md md:hover:shadow-xl transition-all cursor-pointer group"
                        onClick={() => setShowAllRooms(true)}
                      >
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-105 md:group-hover:scale-110 transition-transform">
                            <Users className="w-4 h-4 md:w-6 md:h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm md:text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                              {summary.sharingType} Sharing
                            </h3>
                            <p className="text-[10px] md:text-xs text-gray-500 font-semibold">
                              Room {summary.roomNumber}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1.5 md:space-y-2 mb-2 md:mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs md:text-sm text-gray-600 font-semibold">Available Beds</span>
                            <div className="flex items-center gap-1 md:gap-2">
                              <span className="text-sm md:text-base font-black text-blue-600">{summary.availableNow || 0}</span>
                              {summary.availableNow > 0 && (
                                <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 bg-green-100 text-green-700 rounded-full font-bold">
                                  Available
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 md:gap-2">
                            {summary.hasAC && (
                              <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-100 text-blue-700 rounded-full font-semibold flex items-center gap-0.5 md:gap-1">
                                <Wind className="w-2.5 h-2.5 md:w-3 md:h-3" /> AC
                              </span>
                            )}
                            {summary.hasWiFi && (
                              <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 bg-purple-100 text-purple-700 rounded-full font-semibold flex items-center gap-0.5 md:gap-1">
                                <Wifi className="w-2.5 h-2.5 md:w-3 md:h-3" /> WiFi
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 md:pt-4 border-t border-gray-200">
                          <p className="text-lg md:text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            ₹{(summary.price || 5000).toLocaleString()}
                            <span className="text-xs md:text-sm text-gray-500 font-normal">/month</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* {roomTypeSummary.length > 3 && (
                    <div className="text-center pt-2 md:pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setShowAllRooms(true)}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm md:text-base"
                      >
                        View all {roomTypeSummary.length} room types →
                      </button>
                    </div>
                  )} */}
                </>
              )}
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg md:shadow-2xl">
              <h2 className="text-base md:text-2xl font-black gradient-text mb-3 md:mb-6">Amenities & Facilities</h2>

              <div className="flex gap-1 md:gap-2 mb-3 md:mb-6 overflow-x-auto pb-1 md:pb-2">
                {allCategories.map(cat => {
                  const isAll = cat === 'all';
                  const isActive = selectedCategory === cat;
                  
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 md:px-4 py-1 md:py-2 rounded md:rounded-lg font-semibold text-[10px] md:text-sm whitespace-nowrap capitalize ${isActive
                          ? isAll 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-600 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {isAll ? 'All Amenities' : cat}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                {filteredAmenities.map((amenity: any, i: number) => {
                  const IconComponent = (Icons as any)[amenity.icon];
                  return (
                    <div key={i} className="bg-white rounded-lg md:rounded-xl p-2 md:p-4 border border-gray-200 md:border-2 hover:border-violet-200 transition-all">
                      <div className="flex flex-col items-center text-center gap-1.5 md:gap-3">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg md:rounded-2xl flex items-center justify-center group-hover:scale-105 md:group-hover:scale-110 transition-transform">
                          <IconComponent className="w-5 h-5 md:w-8 md:h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-xs md:text-sm mb-0.5 md:mb-1">{amenity.title}</h3>
                          <p className="text-[10px] md:text-xs text-gray-600 font-medium">{amenity.description}</p>
                          <span className="text-[10px] md:text-xs text-blue-900 font-semibold mt-0.5 md:mt-1 inline-block">
                            {amenity.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAmenities.length === 0 && (
                <div className="text-center py-4 md:py-8">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                    <Home className="w-5 h-5 md:w-8 md:h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-semibold text-xs md:text-base">
                    No amenities found in the "{selectedCategory}" category
                  </p>
                </div>
              )}
            </div>

            {/* Location & Nearby */}
            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg md:shadow-2xl">
              <h2 className="text-base md:text-2xl font-black gradient-text flex items-center mb-2 md:mb-5">
                <MapPin className="w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-2" />Location & Nearby
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5 md:gap-3 mb-2 md:mb-5">
                {propertyData.nearbyPlaces.map((place: any, i: number) => {
                  const Icon = (Icons as any)[place.type];
                  return (
                    <div key={i} className="bg-white/60 rounded-lg md:rounded-xl p-2 md:p-3 border border-gray-200 hover:border-blue-300 transition-all">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg md:rounded-xl flex items-center justify-center">
                          <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm font-bold text-gray-900">{place.name}</p>
                          <p className="text-[10px] md:text-xs text-gray-600 font-semibold">{place.distance}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="relative w-full h-[200px] md:h-[300px] lg:h-[350px] rounded-lg md:rounded-2xl overflow-hidden border border-gray-200 md:border-2 mb-2 md:mb-4">
                <iframe
                  src={`https://www.google.com/maps?q=${propertyData.coordinates.lat},${propertyData.coordinates.lng}&z=15&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  title="Property Location"
                />
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${propertyData.coordinates.lat},${propertyData.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 md:py-3 rounded-lg md:rounded-xl transition-colors text-xs md:text-sm"
              >
                Get Directions
              </a>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg md:shadow-2xl">
              <h2 className="text-base md:text-2xl font-black gradient-text mb-3 md:mb-6">
                Guest Reviews
              </h2>

              <div className="flex flex-col md:grid md:grid-cols-[300px,1fr] gap-3 md:gap-6">
                {/* LEFT SUMMARY CARD */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg md:rounded-xl p-3 md:p-6 border border-blue-100 md:border-2">
                  <div className="text-center">
                    <div className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1 md:mb-2">
                      {propertyData.averageRating}
                    </div>

                    <div className="flex items-center justify-center gap-0.5 md:gap-1 mb-2 md:mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 md:w-6 md:h-6 ${
                            s <= propertyData.averageRating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs md:text-sm font-bold text-gray-700 mb-0.5 md:mb-1">
                      Excellent
                    </p>

                    <p className="text-[10px] md:text-xs text-gray-500 mb-3 md:mb-4">
                      {propertyData.totalReviews} reviews
                    </p>

                    {/* ⭐ REVIEW DISTRIBUTION LINES */}
                    <div className="space-y-1">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-[10px] md:text-xs font-bold text-gray-700 w-4">
                            {star}
                          </span>

                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />

                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: "70%" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT REVIEWS LIST */}
                <div className="space-y-3 md:space-y-4">
                  {propertyData.reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-100 md:border-2 hover:border-blue-100 transition-all"
                    >
                      <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl object-cover ring-1 md:ring-2 ring-gray-200"
                        />

                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-0 mb-1">
                            <div>
                              <p className="font-black text-gray-900 text-sm md:text-base">
                                {review.userName}
                              </p>

                              <p className="text-[10px] md:text-xs text-gray-600 font-semibold">
                                {review.roomType} • {review.stayDuration}
                                {review.verified && (
                                  <span className="ml-1 md:ml-2 text-green-600 font-bold">
                                    <ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3 inline mr-0.5 md:mr-1" />
                                    Verified
                                  </span>
                                )}
                              </p>
                            </div>

                            <div className="flex items-center gap-0.5 md:gap-1 bg-blue-50 px-2 py-1 md:px-3 md:py-1.5 rounded md:rounded-lg">
                              <Star className="w-3 h-3 md:w-4 md:h-4 text-blue-600 fill-blue-600" />
                              <span className="text-xs md:text-sm font-black text-blue-600">
                                {review.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs md:text-sm text-gray-700 font-medium md:font-semibold leading-relaxed mb-2 md:mb-3">
                        {review.comment}
                      </p>

                      <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-gray-100">
                        <span className="text-[10px] md:text-xs text-gray-500 font-semibold">
                          {formatDate(review.date)}
                        </span>

                        <button className="flex items-center gap-1 text-[10px] md:text-xs text-gray-600 hover:text-blue-600 font-bold">
                          <ThumbsUp className="w-3 h-3 md:w-4 md:h-4" />
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-center pt-1 md:pt-2">
                    <button className="flex items-center gap-1 md:gap-2 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg md:rounded-xl hover:shadow-lg transition-all hover:scale-105 text-xs md:text-sm">
                      Learn More
                      <ChevronRight className="w-3 h-3 md:w-4 md:h-4 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Responsive */}
          <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
            {/* Property Manager Card */}
            <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-2xl border border-blue-100 md:border-2">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <h3 className="text-xs md:text-sm font-black text-white">Property Manager</h3>
                </div>
                <div className="flex items-center gap-0.5 md:gap-1 bg-white/20 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                  <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-300 fill-yellow-300" />
                  <span className="text-xs font-black text-white">{propertyData.manager.rating}</span>
                </div>
              </div>
              <div className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <img
                    src={propertyData.manager.avatar}
                    alt={propertyData.manager.name}
                    className="w-14 h-14 md:w-20 md:h-20 rounded-lg md:rounded-xl object-cover ring-1 md:ring-2 ring-blue-200"
                  />
                  <div>
                    <p className="font-black text-gray-900 text-sm md:text-lg">{propertyData.manager.name}</p>
                    <p className="text-[10px] md:text-xs text-gray-600 font-semibold flex items-center gap-0.5 md:gap-1">
                      <ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-600" />
                      Verified Manager
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                  <a
                    href={`tel:${propertyData.manager.phone}`}
                    className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-700 hover:text-blue-600"
                  >
                    <Phone className="w-3 h-3 md:w-4 md:h-4" />
                    {propertyData.manager.phone}
                  </a>
                  <a
                    href={`mailto:${propertyData.manager.email}`}
                    className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-700 hover:text-blue-600"
                  >
                    <Mail className="w-3 h-3 md:w-4 md:h-4" />
                    {propertyData.manager.email}
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                  <a
                    href={`tel:${propertyData.manager.phone}`}
                    className="flex items-center justify-center gap-1 md:gap-1.5 px-2 py-1.5 md:px-3 md:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:shadow-lg transition-all"
                  >
                    <Phone className="w-3 h-3 md:w-4 md:h-4" />Call Now
                  </a>
                  <a
                    href={`https://wa.me/${propertyData.manager.phone.replace(/[^0-9]/g, "")}?text=Hi, I'm interested in ${encodeURIComponent(propertyData.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 md:gap-1.5 px-2 py-1.5 md:px-3 md:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:shadow-lg transition-all"
                  >
                    <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Offers */}
            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-lg md:shadow-2xl">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <h2 className="text-sm md:text-base font-black gradient-text flex items-center">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />Special Offers
                </h2>
              </div>
              
              {offers.length === 0 ? (
                <div className="text-center py-3 md:py-4">
                  <p className="text-xs md:text-sm text-gray-500 font-medium">No active offers at the moment</p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {offers.slice(0, 3).map((offer) => (
                    <div 
                      key={offer.id} 
                      className="relative bg-white/50 rounded-lg md:rounded-xl p-2 md:p-3 border border-gray-200 hover:border-amber-300 transition-all hover:shadow-sm"
                    >
                      {(offer.discount_value || offer.discount_percent) && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-bl-lg md:rounded-bl-xl font-bold text-[10px] md:text-xs">
                          {offer.discount_percent ? `${offer.discount_percent}% OFF` : `₹${offer.discount_value} OFF`}
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2 md:gap-3 pr-8 md:pr-10">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                          {offer.offer_type === 'discount' ? (
                            <Percent className="w-3 h-3 md:w-4 md:h-4 text-white" />
                          ) : offer.offer_type === 'cashback' ? (
                            <Gift className="w-3 h-3 md:w-4 md:h-4 text-white" />
                          ) : (
                            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-xs md:text-sm">{offer.title}</h3>
                          <p className="text-[10px] md:text-xs text-gray-600 font-medium">{offer.description}</p>
                          {offer.start_date && offer.end_date && (
                            <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">
                              Valid: {new Date(offer.start_date).toLocaleDateString()} - {new Date(offer.end_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {offers.length > 3 && (
                    <div className="pt-1 md:pt-2 text-center">
                      <button className="text-[10px] md:text-xs text-blue-600 font-semibold hover:text-blue-700">
                        View all {offers.length} offers →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pricing Plans */}
            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg md:shadow-2xl">
              <h2 className="text-base md:text-xl font-black gradient-text flex items-center mb-3 md:mb-5">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />Pricing Plans
              </h2>
              <div className="space-y-2 md:space-y-4">
                {propertyData.pricingPlans.map((plan: any) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-lg md:rounded-xl p-3 md:p-5 border ${plan.recommended
                        ? 'border-violet-400 shadow-md md:shadow-xl'
                        : 'border-gray-200 md:border-white/20 hover:border-gray-300'
                      }`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-1.5 -right-1.5 md:-top-3 md:-right-3">
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 md:px-4 py-0.5 md:py-1.5 rounded-full text-[10px] md:text-xs font-black shadow md:shadow-lg">
                          <Crown className="w-2.5 h-2.5 md:w-3 md:h-3 inline mr-0.5" />
                          <span className="hidden md:inline">Most Popular</span>
                          <span className="md:hidden">Popular</span>
                        </span>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-2 md:mb-4">
                      <div>
                        <h3 className="text-sm md:text-lg font-black text-gray-900">{plan.name}</h3>
                        <p className="text-[10px] md:text-sm text-gray-500 font-medium mt-0.5">All-inclusive</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl md:text-3xl font-black gradient-text">₹{plan.price.toLocaleString()}</p>
                        <p className="text-[10px] md:text-xs text-gray-600 font-semibold">
                          ~₹{plan.dailyRate}/day
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-1 md:space-y-2 mb-2 md:mb-5">
                      {plan.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5 md:gap-2">
                          <Check className="w-3 h-3 md:w-4 md:h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="text-xs md:text-sm text-gray-700 font-semibold">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {/* <button
                      onClick={() => {
                        setIsBookingModalOpen(true);
                        setBookingType('long');
                      }}
                      className={`w-full py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all hover:shadow ${plan.recommended
                          ? 'bg-gradient-to-r from-blue-600 to-blue-600 text-white'
                          : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white'
                        }`}
                    >
                      Select Plan
                    </button> */}
                    <button
  onClick={() => {
    setPreselectedRoomId(undefined); // Clear preselected room for plan selection
    setIsBookingModalOpen(true);
    setBookingType('long');
  }}
  className={`w-full py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all hover:shadow ${plan.recommended
      ? 'bg-gradient-to-r from-blue-600 to-blue-600 text-white'
      : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white'
    }`}
>
  Select Plan
</button>
                  </div>
                ))}
              </div>

              <div className="mt-3 md:mt-6 pt-3 md:pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-600 font-semibold mb-1.5 md:mb-2">Looking for short stay?</p>
                  {/* <button
                    onClick={() => {
                      setIsBookingModalOpen(true);
                      setBookingType('short');
                    }}
                    className="w-full py-2 md:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg md:rounded-xl font-bold hover:shadow-lg transition-all text-xs md:text-sm"
                  >
                    Book Short Stay @ ₹{propertyData.dailyRate}/day
                  </button> */}
                  <button
  onClick={() => {
    setPreselectedRoomId(undefined); // Clear preselected room for short stay
    setIsBookingModalOpen(true);
    setBookingType('short');
  }}
  className="w-full py-2 md:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg md:rounded-xl font-bold hover:shadow-lg transition-all text-xs md:text-sm"
>
  Book Short Stay @ ₹{propertyData.dailyRate}/day
</button>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-lg md:shadow-2xl">
              <h2 className="text-sm md:text-base font-black gradient-text mb-2 md:mb-3 flex items-center">
                <FileCheck className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />Terms & Conditions
              </h2>
              <div className="space-y-1.5 md:space-y-2 max-h-[200px] md:max-h-[300px] overflow-y-auto pr-1 md:pr-2">
                {propertyData.termsAndConditions.map((term: string, i: number) => (
                  <div key={i} className="flex items-start gap-1.5 md:gap-2 p-2 md:p-3 bg-white/50 rounded md:rounded-lg border border-gray-200">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">{term}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room View Modal - Responsive */}
      {showAllRooms && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-xl md:rounded-2xl w-full max-w-4xl md:max-w-7xl max-h-[90vh] overflow-hidden shadow-xl md:shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-3 md:px-6 py-2 md:py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-9 h-9 md:w-12 md:h-12 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center">
                  <Home className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-sm md:text-xl font-black text-white">All Available Rooms</h2>
                  <p className="text-[10px] md:text-xs text-white/80 font-semibold">
                    {filteredRooms.length} rooms found • {hasActiveFilters && 'Filters applied'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 md:gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-2 py-1 md:px-4 md:py-2 bg-white/20 text-white rounded md:rounded-lg text-xs md:text-sm font-semibold hover:bg-white/30 transition-all"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => setShowAllRooms(false)}
                  className="p-1 md:p-2 hover:bg-white/20 rounded md:rounded-lg transition-all"
                >
                  <X className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </button>
              </div>
            </div>
            <div className="p-3 md:p-6 overflow-y-auto flex-1">
              {filteredRooms.length === 0 ? (
                <div className="text-center py-6 md:py-12">
                  <div className="w-14 h-14 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Search className="w-6 h-6 md:w-12 md:h-12 text-gray-400" />
                  </div>
                  <h3 className="text-sm md:text-xl font-bold text-gray-700 mb-1 md:mb-2">No rooms found</h3>
                  <p className="text-gray-500 mb-3 md:mb-4 text-xs md:text-base">Try adjusting your filters to find more rooms</p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-1.5 md:px-6 md:py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-6">
                  {Object.entries(groupedRooms).map(([sharingType, sharingRooms]) => (
                    <div key={sharingType} className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 border border-blue-100 md:border-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-0 mb-3 md:mb-5 pb-2 md:pb-4 border-b border-gray-200">
                        <div>
                          <h3 className="font-black text-base md:text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            {sharingType} Sharing
                          </h3>
                          <p className="text-xs md:text-sm text-gray-600 font-semibold">
                            {(sharingRooms as any[]).length} rooms • {(sharingRooms as any[]).reduce((acc, r) => acc + r.available, 0)} beds available
                          </p>
                        </div>
                        <p className="text-lg md:text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          ₹{(sharingRooms as any[])[0].price.toLocaleString()}/mo
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                        {(sharingRooms as any[]).map((room) => (
                          <div
                            key={room.id}
                            className={`bg-white rounded-lg md:rounded-xl p-2.5 md:p-4 border transition-all hover:shadow ${room.status === 'available' || room.status === 'partially-available'
                                ? 'border-emerald-200 hover:border-emerald-400'
                                : 'border-orange-200 hover:border-orange-400'
                              }`}
                          >
                            <div className="flex items-center justify-between mb-2 md:mb-3">
                              <div>
                                <span className="text-xs md:text-sm font-black text-gray-900">{room.name}</span>
                                <p className="text-[10px] md:text-xs text-gray-500">Floor {room.floor}</p>
                              </div>
                              <span className={`text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1.5 rounded-full font-bold ${room.gender === 'male'
                                  ? 'bg-blue-100 text-blue-700'
                                  : room.gender === 'female'
                                  ? 'bg-pink-100 text-pink-700'
                                  : 'bg-purple-100 text-purple-700'
                                }`}>
                                {room.gender === 'male' ? '♂ Boys' : room.gender === 'female' ? '♀ Girls' : '👥 Mixed'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-4">
                              <div className="flex items-center gap-0.5 md:gap-1 text-xs md:text-sm text-gray-600">
                                <Users className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="font-semibold">
                                  {room.occupancy.male + room.occupancy.female}/{sharingType}
                                  {room.gender === 'mixed' && (
                                    <span className="text-[10px] md:text-xs text-gray-500 ml-0.5 md:ml-1">
                                      ({room.occupancy.male}♂ {room.occupancy.female}♀)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 ml-auto">
                                {room.ac && <Wind className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />}
                                {room.wifi && <Wifi className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />}
                                {room.hasAttachedBathroom && <Bath className="w-3 h-3 md:w-4 md:h-4 text-blue-600"  />}
                                {room.hasBalcony && <Home className="w-3 h-3 md:w-4 md:h-4 text-blue-600"/>}
                                {room.available > 0 && (
                                  <div className="text-[10px] md:text-xs font-bold text-emerald-600">
                                    {room.available} bed{room.available > 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-gray-200">
                              <span className={`text-xs md:text-sm font-bold ${room.status === 'available' || room.status === 'partially-available' ? 'text-emerald-600' : 'text-orange-600'
                                }`}>
                                {room.status === 'available' ? 'Available Now' : 
                                 room.status === 'partially-available' ? 'Partially Available' : 
                                 'Fully Occupied'}
                              </span>
                              <button
  onClick={() => {
    setPreselectedRoomId(room.id); // Set the selected room ID
    setIsBookingModalOpen(true);
    setShowAllRooms(false);
  }}
  className={`px-2.5 md:px-4 py-1 md:py-2 rounded md:rounded-lg text-xs md:text-sm font-bold ${
    room.status === 'available' || room.status === 'partially-available'
      ? 'bg-gradient-to-r from-emerald-600 to-teal-900 text-white hover:shadow md:hover:shadow-lg'
      : 'bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:shadow md:hover:shadow-lg'
  }`}
  disabled={room.status === 'occupied'}
>
  {room.status === 'available' || room.status === 'partially-available' ? 'Book Now' : 'Occupied'}
</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {/* Booking Modal */}
<BookingModal
  isOpen={isBookingModalOpen}
  onClose={() => {
    setIsBookingModalOpen(false);
    setBookingType('long');
    setPreselectedRoomId(undefined); // Clear preselected room when closing
  }}
  bookingType={bookingType}
  setBookingType={setBookingType}
  propertyData={propertyData}
  preselectedRoomId={preselectedRoomId} // Pass the preselected room ID
/>
    </div>
  );
});

export default PropertyDetailView;