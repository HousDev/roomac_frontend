// components/home/OffersSlider.tsx
"use client";

import { useState, useEffect, useCallback, Key, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// import ScrollAnimation from './ScrollAnimation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface OffersSliderProps {
  offers: any[];
}

export default function OffersSlider({ offers }: OffersSliderProps) {
  const [offersState, setOffersState] = useState(offers);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [isClaimPopupOpen, setIsClaimPopupOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  // Filter only active offers
  const activeOffers = offersState.filter(offer => {
    const isActive = 
      offer.is_active === true || 
      offer.is_active === 1 || 
      offer.is_active === 'true' || 
      offer.is_active === '1' ||
      offer.is_active === 'yes' ||
      offer.is_active === 'active' ||
      offer.is_active === undefined ||
      offer.is_active === null;
    
    return isActive;
  });

  const handleNextOfferSlide = useCallback(() => {
    setCurrentOfferIndex((prev) => 
      prev === Math.ceil(activeOffers.length / 1) - 1 ? 0 : prev + 1
    );
  }, [activeOffers.length]);

  const handlePrevOfferSlide = useCallback(() => {
    setCurrentOfferIndex((prev) => 
      prev === 0 ? Math.ceil(activeOffers.length / 1) - 1 : prev - 1
    );
  }, [activeOffers.length]);

  // Auto-play offers
  useEffect(() => {
    if (offersState.length === 0) return;
    const interval = setInterval(() => {
      handleNextOfferSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [offersState, currentOfferIndex, handleNextOfferSlide]);

  return (
    // <ScrollAnimation>
      <section className="py-8 px-3 relative overflow-hidden bg-gradient-to-br from-blue-50 to-white">
        {/* SVG Background - FIXED */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="w-full h-full opacity-80">
            <svg 
              viewBox="0 0 1400 900" 
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#f8f9fa', stopOpacity: 1}} />
                  <stop offset="50%" style={{stopColor: '#e8f4f8', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#f0f7fa', stopOpacity: 1}} />
                </linearGradient>
                
                <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor: '#2563eb', stopOpacity: 0.1}} />
                  <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 0.15}} />
                </linearGradient>
                
                <radialGradient id="glowGrad" cx="50%" cy="50%">
                  <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 0.8}} />
                  <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 0.05}} />
                </radialGradient>
              </defs>
              
              <rect width="1400" height="900" fill="url(#mainGrad)"/>
              
              <circle cx="200" cy="150" r="180" fill="url(#glowGrad)" opacity="0.4"/>
              <circle cx="1200" cy="200" r="200" fill="url(#glowGrad)" opacity="0.3"/>
              <circle cx="700" cy="700" r="150" fill="url(#glowGrad)" opacity="0.35"/>
              
              <path d="M 0,400 Q 200,350 400,400 T 800,400" stroke="#2563eb" strokeWidth="2" fill="none" opacity="0.15"/>
              <path d="M 600,100 Q 800,150 1000,100 T 1400,100" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.15"/>
              
              <g opacity="0.2">
                <circle cx="150" cy="300" r="3" fill="#2563eb"/>
                <circle cx="180" cy="320" r="3" fill="#2563eb"/>
                <circle cx="210" cy="340" r="3" fill="#2563eb"/>
                <circle cx="1250" cy="400" r="3" fill="#3b82f6"/>
                <circle cx="1280" cy="420" r="3" fill="#3b82f6"/>
                <circle cx="1310" cy="440" r="3" fill="#3b82f6"/>
                <circle cx="100" cy="600" r="3" fill="#2563eb"/>
                <circle cx="130" cy="620" r="3" fill="#2563eb"/>
                <circle cx="160" cy="640" r="3" fill="#2563eb"/>
              </g>
              
              <rect x="50" y="50" width="120" height="120" fill="url(#accentGrad)" rx="10" opacity="0.5">
                <animateTransform attributeName="transform" type="rotate" from="0 110 110" to="360 110 110" dur="30s" repeatCount="indefinite"/>
              </rect>
              
              <rect x="1200" y="650" width="150" height="150" fill="url(#accentGrad)" rx="10" opacity="0.4">
                <animateTransform attributeName="transform" type="rotate" from="0 1275 725" to="-360 1275 725" dur="25s" repeatCount="indefinite"/>
              </rect>
              
              <g stroke="#2563eb" strokeWidth="0.5" opacity="0.08">
                <line x1="0" y1="200" x2="1400" y2="200"/>
                <line x1="0" y1="400" x2="1400" y2="400"/>
                <line x1="0" y1="600" x2="1400" y2="600"/>
                <line x1="300" y1="0" x2="300" y2="900"/>
                <line x1="700" y1="0" x2="700" y2="900"/>
                <line x1="1100" y1="0" x2="1100" y2="900"/>
              </g>
              
              <path d="M 0,0 Q 350,80 700,40 T 1400,0 L 1400,0 L 0,0 Z" fill="#2563eb" opacity="0.05"/>
              
              <path d="M 0,900 Q 350,820 700,860 T 1400,900 L 1400,900 L 0,900 Z" fill="#3b82f6" opacity="0.05"/>
              
              <g opacity="0.6">
                <circle cx="400" cy="250" r="2" fill="#fbbf24">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="900" cy="180" r="2" fill="#fbbf24">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="1100" cy="550" r="2" fill="#fbbf24">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle cx="250" cy="700" r="2" fill="#fbbf24">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="2.2s" repeatCount="indefinite"/>
                </circle>
              </g>
              
              <path d="M 1300,300 L 1350,250 L 1400,300 L 1350,350 Z" fill="#3b82f6" opacity="0.1">
                <animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="4s" repeatCount="indefinite" additive="sum"/>
              </path>
              
              <path d="M 100,800 L 150,750 L 200,800 L 150,850 Z" fill="#2563eb" opacity="0.1">
                <animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="3.5s" repeatCount="indefinite" additive="sum"/>
              </path>
            </svg>
          </div>
        </div>
        
        {/* Content - FIXED with better visibility */}
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="mb-2">
            <div className="">
              <div className="flex flex-col items-center mb-4 md:mb-0">
                <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
                  <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>
                  <span className="mx-2 sm:mx-4 text-xs sm:text-sm font-semibold text-blue-700 tracking-wider uppercase">
                    Limited Time Offers
                  </span>
                  <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>
                </div>
                
                <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-center backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-grey-700">Special</span>
                  <span className="text-blue-600 ml-2 sm:ml-3">Offers</span>
                </h2>
              </div>
              
              {/* Navigation buttons based on ACTIVE offers only */}
              {(() => {
                return activeOffers.length > 2 ? (
                  <div className="flex gap-2 justify-end items-end">
                    <button 
                      onClick={() => handlePrevOfferSlide()}
                      className="p-2 rounded-full bg-white border border-blue-500 hover:bg-slate-50 transition-colors shadow-lg"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleNextOfferSlide()}
                      className="p-2 rounded-full bg-white border border-blue-500 hover:bg-slate-50 transition-colors shadow-lg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
          
          {/* Slider Container - Shows 2 cards at a time */}
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentOfferIndex * 100}%)` }}
            >
              {(() => {
                // If no active offers, show message
                if (activeOffers.length === 0) {
                  return (
                    <div className="w-full flex-shrink-0 px-2">
                      <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200">
                        <div className="text-4xl mb-4">🏠</div>
                        <h3 className="text-xl font-bold text-blue-900 mb-2">No Active Offers Available</h3>
                        <p className="text-blue-700">Check back soon for new special offers!</p>
                      </div>
                    </div>
                  );
                }
                
                // Create slides with 2 active offers each
                const slides = [];
                const totalSlides = Math.ceil(activeOffers.length / 2);
                
                for (let slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
                  const startIndex = slideIndex * 2;
                  const endIndex = startIndex + 2;
                  const slideOffers = activeOffers.slice(startIndex, endIndex);
                  
                  slides.push(
                    <div key={slideIndex} className="w-full flex-shrink-0 px-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] md:gap-[80px]">
                        {slideOffers.map((offer, index) => (
                          <div
                            key={offer.id || index}
                            className="bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-blue-200 transition-transform transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                            onClick={() => {
                              setSelectedOffer(offer);
                              setIsClaimPopupOpen(true);
                            }}
                          >
                            {/* ===== TOP IMAGE ===== */}
                            <div className="relative w-full h-[220px]">
                              <img
                                src={offer.image || "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg"}
                                alt="Interior"
                                className="w-full h-full object-cover rounded-t-xl"
                              />

                              {/* BRAND OVERLAY */}
                              <div className="absolute top-3 left-3 px-3 py-1.5 rounded bg-white/80 backdrop-blur-sm">
                                <p className="text-xl font-semibold text-blue-900">
                                  {offer.property_name || "SOUL SPACE STUDIO"}
                                </p>
                              </div>
                            </div>

                            {/* ===== CONTENT SECTION ===== */}
                            <div className="p-4 grid md:grid-cols-2 gap-3 items-stretch">
                              {/* LEFT SIDE: Title & Price */}
                              <div className="flex flex-col justify-start space-y-1.5">
                                <h2 className="text-2xl font-black text-blue-900 leading-snug">
                                  {offer.title || "3BHK"} <br /> Only For
                                </h2>

                                {/* DYNAMIC PRICE DISPLAY */}
                                <div className="mt-1">
                                  <p className="text-3xl font-extrabold text-yellow-500">
                                    ₹{offer.discounted_price || offer.final_price || "8000"} /-
                                  </p>
                                  
                                  {offer.original_price || offer.actual_price ? (
                                    <p className="text-[10px] text-blue-800/60 line-through">
                                      Was ₹{offer.original_price || offer.actual_price}
                                    </p>
                                  ) : (
                                    <p className="text-[10px] text-blue-800/60">
                                      * Limited time pricing
                                    </p>
                                  )}
                                </div>
                                
                                {offer.start_date || offer.end_date || offer.valid_from || offer.valid_to ? (
                                  <div className="mt-3">
                                    <div className="relative inline-block">
                                      <div className="bg-yellow-400 text-blue-900 px-5 py-2 pr-8 rounded-sm shadow-md skew-x-[-10deg]">
                                        <div className="skew-x-[10deg]">
                                          <p className="text-[12px] font-extrabold uppercase leading-tight">
                                            LIMITED TIME OFFER
                                          </p>
                                          <p className="text-[13px] font-bold">
                                            Valid Till{" "}
                                            {(() => {
                                              const rawDate = offer.valid_to || offer.end_date;
                                              if (!rawDate) return "N/A";
                                              const d = new Date(rawDate);
                                              return d.toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                              });
                                            })()}
                                          </p>
                                        </div>
                                      </div>
                                      <span className="absolute top-0 right-0 h-full w-3 bg-yellow-600 skew-x-[-10deg]"></span>
                                    </div>
                                  </div>
                                ) : null}
                              </div>

                              {/* RIGHT SIDE: Features & Discount */}
                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 flex flex-col justify-between">
                                <div>
                                  <h3 className="text-xs font-bold text-blue-900 mb-2.5">
                                    WHY CHOOSE US?
                                  </h3>
                                  <ul className="space-y-1.5 text-[11px] text-blue-800">
                                    {(offer.features || [
                                     "Fully Furnished Rooms with AC",
                                     "High-Speed WiFi & Daily Housekeeping",
                                     "Free Laundry & Home Cooked Meals"
                                    ]).map((point: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal  | null | undefined, idx: Key | null | undefined) => (
                                      <li key={idx}>• {point}</li>
                                    ))}
                                  </ul>
                                </div>

                                {/* DYNAMIC DISCOUNT BADGE */}
                                <div className="mt-3 self-end">
                                  <div className="bg-yellow-400 text-blue-900 px-3 py-1.5 rounded text-[10px]">
                                    <p className="uppercase font-semibold">Discount</p>
                                    <div className="text-2xl font-black">
                                      {offer.discount_value != null && offer.discount_value > 0 ? (
                                        <div>₹{Math.floor(Number(offer.discount_value))} OFF /</div>
                                      ) : offer.discount_percentage || offer.discount_percent ? (
                                        <div>{offer.discount_percentage || offer.discount_percent}%</div>
                                      ) : (
                                        <div>15%</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* ===== PACKAGE IMAGES ===== */}
                            <div className="px-4 pb-3">
                              <p className="text-[10px] text-blue-800/60 mb-2">
                                Package Includes
                              </p>
                              <div className="grid grid-cols-3 gap-2.5">
                                {(offer.gallery || [
                                  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
                                  "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg",
                                  "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
                                ]).map((img: string | undefined, idx: Key | null | undefined) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt="Interior"
                                    className="h-16 w-full object-cover rounded border border-blue-100"
                                  />
                                ))}
                              </div>
                            </div>

                            {/* ===== CTA BUTTON ===== */}
                            <div className="px-4 pb-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOffer(offer);
                                  setIsClaimPopupOpen(true);
                                }}
                                className="w-full bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 rounded-md text-sm transition flex items-center justify-center gap-2"
                              >
                                <span>Claim Offer</span>
                                <span className="text-lg">→</span>
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {/* If only 1 offer in last slide, show only one card (no empty div) */}
                        {slideOffers.length === 1 && (
                          <div className="hidden md:block"></div>
                        )}
                      </div>
                    </div>
                  );
                }
                
                return slides;
              })()}
            </div>

            {/* Dot Indicators - Only show if more than 2 ACTIVE offers */}
            {(() => {
              if (activeOffers.length > 2) {
                return (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: Math.ceil(activeOffers.length / 2) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentOfferIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 shadow-lg ${
                          currentOfferIndex === index 
                            ? 'w-6 bg-blue-600' 
                            : 'w-2 bg-white border border-blue-300 hover:bg-blue-200'
                        }`}
                      />
                    ))}
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* ✅ COMPLETE CLAIM OFFER POPUP MODAL - Added Missing Parts */}
          {isClaimPopupOpen && selectedOffer && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
              <div className="bg-white border border-slate-300 rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div
                  className="px-4 sm:px-5 py-3 sticky top-0 z-20 flex-shrink-0"
                  style={{ background: selectedOffer.mainColor || '#2563eb' }}
                >
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl text-white">🎉</span>
                      <div className="max-w-[200px] sm:max-w-none overflow-hidden">
                        <h3 className="text-base sm:text-lg font-bold text-white truncate">
                          {selectedOffer.title || "Special Offer"}
                        </h3>
                        <p className="text-white/90 text-[10px] sm:text-xs truncate">
                          {selectedOffer.property_name || "Limited Time Offer"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsClaimPopupOpen(false)}
                      className="text-white/90 hover:text-white text-lg sm:text-xl transition-colors flex-shrink-0"
                      aria-label="Close popup"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Main Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  {/* Offer Image */}
                  <div className="relative h-48 sm:h-56">
                    <img
                      src={selectedOffer.image || "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg"}
                      alt={selectedOffer.title || "Offer"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-white">
                            {selectedOffer.property_name || "SOUL SPACE STUDIO"}
                          </h2>
                          <p className="text-white/90 text-sm">{selectedOffer.location || "Premium Location"}</p>
                        </div>
                        <div className="bg-yellow-500 text-blue-900 px-3 py-2 rounded-lg">
                          <div className="text-lg sm:text-xl font-bold">
                            {selectedOffer.discount_percentage ? `${selectedOffer.discount_percentage}% OFF` : 
                             selectedOffer.discount_value ? `₹${selectedOffer.discount_value} OFF` : "SPECIAL OFFER"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="p-4 sm:p-5 border-b">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Discounted Price</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl sm:text-4xl font-bold text-blue-700">
                            ₹{selectedOffer.discounted_price || selectedOffer.final_price || "8000"}
                          </span>
                          <span className="text-sm text-gray-500">/month</span>
                        </div>
                      </div>
                      
                      {selectedOffer.original_price && (
                        <div>
                          <p className="text-sm text-gray-600">Original Price</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl line-through text-gray-500">
                              ₹{selectedOffer.original_price}
                            </span>
                            <span className="text-sm text-green-600 font-semibold">
                              Save ₹{(selectedOffer.original_price - (selectedOffer.discounted_price || selectedOffer.final_price || 8000)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Validity */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">⏰</span>
                        <div>
                          <p className="text-sm font-semibold text-blue-800">Limited Time Offer</p>
                          <p className="text-xs text-blue-700">
                            Valid till: {(() => {
                              const rawDate = selectedOffer.valid_to || selectedOffer.end_date;
                              if (!rawDate) return "Not specified";
                              const d = new Date(rawDate);
                              return d.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              });
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-4 sm:p-5 border-b">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">What's Included</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(selectedOffer.features || [
                        "Fully Furnished Rooms with AC",
                        "High-Speed WiFi",
                        "Daily Housekeeping",
                        "Free Laundry Service",
                        "Home Cooked Meals",
                        "Security & CCTV"
                      ]).map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gallery */}
                  {(selectedOffer.gallery || selectedOffer.images) && (
                    <div className="p-4 sm:p-5 border-b">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">Gallery</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {(selectedOffer.gallery || selectedOffer.images || [
                          "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
                          "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg",
                          "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg"
                        ]).map((img: string, index: number) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Gallery ${index + 1}`}
                            className="h-24 w-full object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="p-4 sm:p-5 border-b">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Description</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedOffer.description || 
                        "This exclusive offer includes premium amenities and services designed for comfortable living. The package is available for a limited time only. Don't miss this opportunity to experience luxury living at an affordable price."}
                    </p>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="p-4 sm:p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Terms & Conditions</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>Offer valid for new bookings only</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>Minimum stay period: 3 months</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>Security deposit applicable as per standard policy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>Offer cannot be combined with other promotions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>Subject to availability</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Footer with Action Buttons */}
                <div className="sticky bottom-0 z-20 p-4 sm:p-5 border-t bg-white">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setIsClaimPopupOpen(false)}
                      className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // Handle claim action here
                        alert(`Claiming offer: ${selectedOffer.title || "Special Offer"}`);
                        setIsClaimPopupOpen(false);
                      }}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex-1 shadow-md"
                    >
                      Claim Now
                    </button>
                    <button
                      onClick={() => {
                        // Handle contact action
                        alert("Contacting property manager...");
                      }}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex-1 shadow-md"
                    >
                      Contact Property
                    </button>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-3">
                    By claiming, you agree to our terms and conditions
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    // </ScrollAnimation>
  );
}