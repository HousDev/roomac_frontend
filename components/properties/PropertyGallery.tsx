"use client";

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MapPin, Share2, Star, IndianRupee, CheckCircle2, Shield, Eye, Heart, MessageSquare,
  ChevronLeft, ChevronRight, X, Image as ImageIcon, FileText, Sparkles,
  Home, User, Users, Wind, Wifi, Building2, Bus, ShoppingCart, Utensils,
  Film, Tag, Percent, Clock, Gift, Zap, Check, Crown, Phone, Mail, Calendar,
  CreditCard, Filter, Search, CalendarDays, Bed, ShieldCheck, Dumbbell,
  Tv, Thermometer, Droplets, Volume2, Lock, Bell, Cloud, Sun, Moon,
  Battery, Radio, Router, Bath, Car, Building, AlertCircle, FileCheck,
  ThumbsUp, TrendingUp, Award, SlidersHorizontal, ArrowRight, ChevronDown,
  Maximize2, Coffee as CoffeeIcon, Bath as BathIcon, Coffee
} from 'lucide-react';
import BookingModal from './BookingModal';
import RoomFilters from './RoomFilters';
import RoomCard from './RoomCard';

const Icons = {
  Wifi, Wind, Utensils, Shield, Zap, Home, Building2, Bus, ShoppingCart, Heart, Film,
  Bath, Car, Building, Dumbbell, Coffee, Tv, Thermometer, Droplets, Volume2, Lock,
  Bell, Cloud, Sun, Moon, Battery, Radio, Router,
  tag: Tag, percent: Percent, clock: Clock, gift: Gift, transport: Bus, company: Building2,
  shopping: ShoppingCart, hospital: Heart, restaurant: Utensils, entertainment: Film
};

interface PropertyGalleryProps {
  propertyData: any;
  offers: any[];
}

const PropertyGallery = memo(function PropertyGallery({ propertyData, offers }: PropertyGalleryProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllRooms, setShowAllRooms] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState('long');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

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

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }, []);

  if (!propertyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Home className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mx-auto mb-4" />
          <p className="text-sm md:text-lg font-semibold text-gray-700">No property data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex flex-col gap-2 md:gap-3">
        <button
          onClick={handleShare}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-0.5 md:hover:-translate-y-1"
          title="Share Property"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-0.5 md:hover:-translate-y-1 animate-pulse"
          title="Book Now"
        >
          <CalendarDays className="w-5 h-5" />
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-[1800px] mx-auto px-3 py-2 md:px-4 md:py-3">
        {/* Sticky Back Button */}
        <div className="sticky top-20 md:top-[60px] z-50 md:bg-white backdrop-blur-sm rounded-lg md:rounded-none px-2 py-1 mb-2">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 md:gap-2 text-black font-semibold text-xs md:text-sm rounded transition-all group"
          >
            <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Properties</span>
          </button>
        </div>

        {/* Header */}
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

        {/* Main Layout */}
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

            {/* Available Rooms Section */}
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
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <button
                    onClick={() => setShowAllRooms(true)}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg md:rounded-xl font-bold hover:shadow-lg md:hover:shadow-xl transition-all text-xs md:text-sm"
                  >
                    View All Rooms
                  </button>
                </div>
              </div>

              <RoomFilters 
                rooms={propertyData.rooms || []}
                onShowAllRooms={() => setShowAllRooms(true)}
              />
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

          {/* Sidebar */}
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
                          <Crown className="w-2.5 h-2.5 md:w-3 md:h-3 inline mr-0.5" />{window.innerWidth >= 768 ? 'Most Popular' : 'Popular'}
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
                    <button
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
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 md:mt-6 pt-3 md:pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-600 font-semibold mb-1.5 md:mb-2">Looking for short stay?</p>
                  <button
                    onClick={() => {
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

      {/* All Rooms Modal */}
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
                    {propertyData.rooms?.length || 0} rooms found
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllRooms(false)}
                className="p-1 md:p-2 hover:bg-white/20 rounded md:rounded-lg transition-all"
              >
                <X className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </button>
            </div>
            <div className="p-3 md:p-6 overflow-y-auto flex-1">
              {propertyData.rooms?.length === 0 ? (
                <div className="text-center py-6 md:py-12">
                  <div className="w-14 h-14 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Search className="w-6 h-6 md:w-12 md:h-12 text-gray-400" />
                  </div>
                  <h3 className="text-sm md:text-xl font-bold text-gray-700 mb-1 md:mb-2">No rooms found</h3>
                  <p className="text-gray-500 mb-3 md:mb-4 text-xs md:text-base">No rooms available for this property</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-6">
                  {propertyData.rooms?.map((room: any) => (
                    <RoomCard 
                      key={room.id} 
                      room={room} 
                      onBook={() => {
                        setIsBookingModalOpen(true);
                        setShowAllRooms(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingType('long');
        }}
        bookingType={bookingType}
        setBookingType={setBookingType}
        propertyData={propertyData}
      />
    </div>
  );
});

export default PropertyGallery;