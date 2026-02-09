"use client";

import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  MapPin, 
  Users, 
  ChevronRight,
  Bed,
  Bath,
  Star
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface PropertyCardProps {
  property: any;
}

const PropertyCard = memo(function PropertyCard({ property }: any) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = property.photo_urls || [];
  const totalImages = images.length;

  const nextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % totalImages);
  }, [totalImages]);

  const prevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  const setImageIndex = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  }, []);

  const propertyTags = Array.isArray(property.tags) && property.tags.length > 0 
    ? property.tags 
    : ["featured", "new listing", "premium", "budget"];

  const getTagColor = useCallback((tagText: string) => {
    const lowerTag = tagText.toLowerCase();
    if (lowerTag.includes('new') || lowerTag.includes('latest')) {
      return 'bg-blue-500 text-white';
    } else if (lowerTag.includes('premium') || lowerTag.includes('luxury')) {
      return 'bg-yellow-500 text-black';
    } else if (lowerTag.includes('available') || lowerTag.includes('vacant')) {
      return 'bg-green-500 text-white';
    } else if (lowerTag.includes('discount') || lowerTag.includes('offer')) {
      return 'bg-red-500 text-white';
    } else if (lowerTag.includes('verified') || lowerTag.includes('trusted')) {
      return 'bg-purple-500 text-white';
    } else if (lowerTag.includes('furnished')) {
      return 'bg-indigo-500 text-white';
    } else if (lowerTag.includes('single')) {
      return 'bg-teal-500 text-white';
    } else if (lowerTag.includes('double') || lowerTag.includes('shared')) {
      return 'bg-orange-500 text-white';
    } else if (lowerTag.includes('ac') || lowerTag.includes('air conditioned')) {
      return 'bg-cyan-500 text-white';
    } else if (lowerTag.includes('food') || lowerTag.includes('meal')) {
      return 'bg-pink-500 text-white';
    } else {
      return 'bg-gray-700 text-white';
    }
  }, []);

  return (
    <Card
      key={property.id}
      className="shadow-lg sm:shadow-xl overflow-hidden group hover:shadow-[0_4px_0_0_rgba(250,204,21,1)] transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02]"
      onClick={() => {
        window.location.href = `/properties/${property.slug || property.id || "#"}`;
      }}
    >
      {/* IMAGE GALLERY */}
      <div className="h-48 sm:h-52 md:h-56 lg:h-60 bg-slate-200 relative overflow-hidden">
        {totalImages > 0 ? (
          <>
            {/* TAGS FROM API - TOP LEFT */}
            <div className="absolute top-2 left-2 z-10 flex gap-1 flex-wrap">
              {propertyTags.slice(0, 3).map((tag: string, index: number) => (
                <div
                  key={`${property.id}-tag-${index}`}
                  className={`text-xs font-bold px-2 py-1 rounded shadow-md ${getTagColor(tag)}`}
                >
                  {tag.length > 12 ? tag.substring(0, 12) + '...' : tag}
                </div>
              ))}
              
              {/* Show "+X more" if there are more tags */}
              {propertyTags.length > 3 && (
                <div className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                  +{propertyTags.length - 3}
                </div>
              )}
            </div>

            <img
              src={`${API_URL}${images[currentImageIndex]}`}
              alt={`${property.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* IMAGE DOTS INDICATOR */}
            {totalImages > 1 && (
              <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                {images.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={(e) => setImageIndex(index, e)}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${index === currentImageIndex
                      ? 'bg-white w-3 sm:w-4'
                      : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <Building2 className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-slate-400" />
          </div>
        )}
      </div>

      <CardContent className="p-4 sm:p-5 md:p-6 relative overflow-hidden group">
        {/* Animated wave background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-blue-100 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out scale-150 group-hover:scale-100 rotate-12 group-hover:rotate-0"></div>
        
        {/* Content with relative positioning to stay above background */}
        <div className="relative z-10">
          {/* Title and Price in same line */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0 mr-4">
              <h3 className="text-lg sm:text-xl font-bold transition-colors duration-300 group-hover:text-blue-700 line-clamp-1">
                {property.name || property.property_name || "Property Name"}
              </h3>
              
              {/* Location and Area in separate lines */}
              <div className="mt-2 space-y-1">
                {/* Location line */}
                {(property.location || property.address || property.city) && (
                  <p className="flex items-center gap-1 text-slate-600 text-sm sm:text-base">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                    <span className="truncate">
                      {property.location || property.address || property.city || ""}
                    </span>
                  </p>
                )}
              </div>
            </div>
            
            {/* Price next to title */}
            <div className="flex-shrink-0">
              <p className="text-2xl sm:text-2xl font-bold text-[#004AAD] group-hover:scale-110 transition-transform duration-300 whitespace-nowrap">
                ₹{property.starting_price || property.price || property.monthly_rent || property.rent || "0"}/-
              </p>
            </div>
          </div>

          {/* Rating section */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => {
                const ratingValue = property.rating || 4.2;
                return (
                  <svg
                    key={star}
                    className={`h-4 w-4 ${star <= ratingValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                );
              })}
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {property.rating ? property.rating.toFixed(1) : '4.2'}
            </span>
            <span className="text-xs text-slate-500">/5</span>
            <span className="text-xs text-slate-500 ml-2">
              ({property.review_count || 24} reviews)
            </span>
          </div>

          {/* Rooms and Beds section */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {property.total_rooms || property.rooms || property.room_count || "0"}
                </p>
                <p className="text-xs text-slate-500">Rooms</p>
              </div>
            </div>
            
            <div className="w-px h-8 bg-slate-200"></div>
            
            <div className="flex items-center gap-2">
              <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-100 group-hover:scale-110 transition-all duration-300">
                <Bed className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {property.total_beds || property.beds || property.bed_count || "0"}
                </p>
                <p className="text-xs text-slate-500">Beds</p>
              </div>
            </div>
          </div>
          
          {/* Amenities section */}
          {((Array.isArray(property.amenities) &&
            property.amenities.length > 0) ||
            (Array.isArray(property.services) &&
              property.services.length > 0)) && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {Array.isArray(property.amenities) &&
                  property.amenities.length > 0 &&
                  property.amenities.slice(0, 3).map(
                    (item: string, index: number) => {
                      const getColorClass = (amenity: string) => {
                        const amenityLower = amenity.toLowerCase();
                        if (amenityLower.includes('wifi') || amenityLower.includes('wi-fi')) {
                          return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:border-blue-200';
                        }
                        if (amenityLower.includes('ac') || amenityLower.includes('air')) {
                          return 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100 hover:border-cyan-200';
                        }
                        if (amenityLower.includes('food') || amenityLower.includes('meal')) {
                          return 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100 hover:border-orange-200';
                        }
                        if (amenityLower.includes('parking')) {
                          return 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200';
                        }
                        if (amenityLower.includes('housekeeping') || amenityLower.includes('cleaning')) {
                          return 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100 hover:border-purple-200';
                        }
                        if (amenityLower.includes('tv') || amenityLower.includes('television')) {
                          return 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100 hover:border-red-200';
                        }
                        if (amenityLower.includes('security') || amenityLower.includes('cctv')) {
                          return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200';
                        }
                        if (amenityLower.includes('water') || amenityLower.includes('hot water')) {
                          return 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100 hover:border-sky-200';
                        }
                        if (amenityLower.includes('laundry')) {
                          return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 hover:border-amber-200';
                        }
                        return 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100 hover:border-slate-200';
                      };
                      
                      const colorClasses = getColorClass(item);
                      
                      return (
                        <span
                          key={`amenity-${index}`}
                          className={`px-2 py-1 rounded-md border text-xs ${colorClasses} transition-all duration-300`}
                        >
                          {item}
                        </span>
                      );
                    }
                  )}

                {Array.isArray(property.services) &&
                  property.services.length > 0 &&
                  property.services.slice(0, 2).map(
                    (item: string, index: number) => (
                      <span
                        key={`service-${index}`}
                        className="px-2 py-1 rounded-md border text-xs bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-all duration-300"
                      >
                        {item}
                      </span>
                    )
                  )}

                {(property.amenities?.length > 3 || property.services?.length > 2) && (
                  <span className="px-2 py-1 rounded-md border text-xs bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-all duration-300">
                    +{Math.max(
                      (property.amenities?.length || 0) - 3,
                      (property.services?.length || 0) - 2,
                      0
                    )}
                  </span>
                )}
              </div>
            )}

          {/* Bottom action section */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            {/* Left side: Bathrooms and View button */}
            <div className="flex items-center gap-4">
              {/* Bathrooms if available */}
              {property.total_bathrooms && (
                <div className="flex items-center gap-2">
                  <div className="bg-purple-50 p-2 rounded-lg group-hover:bg-purple-100 group-hover:scale-110 transition-all duration-300">
                    <Bath className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {property.total_bathrooms || property.bathrooms || property.bathroom_count || "0"}
                    </p>
                    <p className="text-xs text-slate-500">Baths</p>
                  </div>
                </div>
              )}
              
              <Link href={`/properties/${property.slug || property.id}`}>
                <Button 
                  className="h-9 px-4 text-sm group-hover:shadow-md transition-all text-lg duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  View
                  <ChevronRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
            
            {/* Right side: WhatsApp, Call, and Heart icons */}
            <div className="flex items-center gap-2">
              <a 
                href={`https://wa.me/${property.whatsapp || '911234567890'}?text=Hi, I'm interested in ${property.name || property.property_name || "Property Name"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-all duration-300 hover:scale-110 flex items-center justify-center"
                title="WhatsApp"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 448 512" fill="currentColor">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                </svg>
              </a>
              
              <a 
                href={`tel:${property.phone || property.contact_number || '1234567890'}`}
                className="p-2 bg-blue-50 hover:bg-blue-100 rounded-md transition-all duration-300 hover:scale-110"
                title="Call"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>
              
              <button 
                className="p-2 bg-pink-50 hover:bg-pink-100 rounded-md transition-all duration-300 hover:scale-110 favorite-btn"
                title="Add to Favorites"
                onClick={(e) => {
                  e.stopPropagation();
                  const heartIcon :any = e.currentTarget.querySelector('svg');
                  heartIcon.classList.toggle('fill-red-500');
                }}
              >
                <svg 
                  className="h-5 w-5 text-red-500" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  fill="none"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default PropertyCard;