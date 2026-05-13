// // components/home/OffersSlider.tsx
// "use client";

// import { useState, useEffect, useCallback } from 'react';
// import { ChevronLeft, ChevronRight, Copy, CheckCircle } from 'lucide-react';
// import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';
// import { generatePropertySlug } from '@/lib/slugUtils'; // Add this import

// interface OffersSliderProps {
//   offers: any[];
// }

// export default function OffersSlider({ offers }: OffersSliderProps) {
//     const router = useRouter(); // <-- THIS IS MISSING!
//   const [offersState, setOffersState] = useState(offers);
//   const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
//   const [isClaimPopupOpen, setIsClaimPopupOpen] = useState(false);
//   const [selectedOffer, setSelectedOffer] = useState<any>(null);
//   const [copiedCode, setCopiedCode] = useState(false);


//    // Function to handle redirect to property with offer
//   const handleClaimAndRedirect = (offer: any) => {
//     // Close the popup
//     setIsClaimPopupOpen(false);
    
//     // Check if offer has a property_id
//     if (!offer.property_id) {
//       toast.error("This offer is not linked to a specific property");
//       return;
//     }
    
//     // Store the offer code and details in localStorage
//     if (offer.code) {
//       const exactCode = offer.code.toString().trim();
//       localStorage.setItem('pendingOfferCode', exactCode);
//       localStorage.setItem('pendingOfferData', JSON.stringify({
//         code: exactCode,
//         discount_type: offer.discount_type,
//         discount_value: offer.discount_value,
//         discount_percent: offer.discount_percent,
//         title: offer.title,
//         description: offer.description,
//         minMonths: offer.min_months,
//         propertyId: offer.property_id,
//         roomId: offer.room_id,
//         bedNumber: offer.bed_number
//       }));
      
//     }

//      // Redirect to the property page with parameters to open the booking modal
//     if (offer.property_name) {
//       const slug = generatePropertySlug({
//         name: offer.property_name,
//         area: offer.location || '',
//         city: offer.city || '',
//         id: offer.property_id
//       });
//       // Add openBooking=true and offer parameter to the URL
//       router.push(`/properties/${slug}?offer=${offer.code}&openBooking=true`);
//     } else {
//       // Fallback: redirect with property ID
//       router.push(`/properties?property_id=${offer.property_id}&offer=${offer.code}&openBooking=true`);
//     }
//   };


//   // Filter only active offers
//   const activeOffers = offersState.filter(offer => {
//     const isActive = 
//       offer.is_active === true || 
//       offer.is_active === 1 || 
//       offer.is_active === 'true' || 
//       offer.is_active === '1' ||
//       offer.is_active === 'yes' ||
//       offer.is_active === 'active' ||
//       offer.is_active === undefined ||
//       offer.is_active === null;
    
//     return isActive;
//   });

//   const handleNextOfferSlide = useCallback(() => {
//     setCurrentOfferIndex((prev) => 
//       prev === Math.ceil(activeOffers.length / 1) - 1 ? 0 : prev + 1
//     );
//   }, [activeOffers.length]);

//   const handlePrevOfferSlide = useCallback(() => {
//     setCurrentOfferIndex((prev) => 
//       prev === 0 ? Math.ceil(activeOffers.length / 1) - 1 : prev - 1
//     );
//   }, [activeOffers.length]);

 
//   // Auto-play offers
//   useEffect(() => {
//     if (offersState.length === 0) return;
//     const interval = setInterval(() => {
//       handleNextOfferSlide();
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [offersState, currentOfferIndex, handleNextOfferSlide]);

//   // Copy offer code to clipboard
//   const copyOfferCode = (code: string) => {
//     navigator.clipboard.writeText(code);
//     setCopiedCode(true);
//     toast.success(`Offer code ${code} copied to clipboard!`);
//     setTimeout(() => setCopiedCode(false), 2000);
//   };

//   return (
//     <section className="py-8 px-3 relative overflow-hidden bg-gradient-to-br from-blue-50 to-white">
//       {/* SVG Background */}
//       <div className="absolute inset-0 z-0 overflow-hidden">
//         <div className="w-full h-full opacity-80">
//           <svg 
//             viewBox="0 0 1400 900" 
//             className="w-full h-full"
//             preserveAspectRatio="xMidYMid slice"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <defs>
//               <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" style={{stopColor: '#f8f9fa', stopOpacity: 1}} />
//                 <stop offset="50%" style={{stopColor: '#e8f4f8', stopOpacity: 1}} />
//                 <stop offset="100%" style={{stopColor: '#f0f7fa', stopOpacity: 1}} />
//               </linearGradient>
              
//               <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
//                 <stop offset="0%" style={{stopColor: '#2563eb', stopOpacity: 0.1}} />
//                 <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 0.15}} />
//               </linearGradient>
              
//               <radialGradient id="glowGrad" cx="50%" cy="50%">
//                 <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 0.8}} />
//                 <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 0.05}} />
//               </radialGradient>
//             </defs>
            
//             <rect width="1400" height="900" fill="url(#mainGrad)"/>
            
//             <circle cx="200" cy="150" r="180" fill="url(#glowGrad)" opacity="0.4"/>
//             <circle cx="1200" cy="200" r="200" fill="url(#glowGrad)" opacity="0.3"/>
//             <circle cx="700" cy="700" r="150" fill="url(#glowGrad)" opacity="0.35"/>
            
//             <path d="M 0,400 Q 200,350 400,400 T 800,400" stroke="#2563eb" strokeWidth="2" fill="none" opacity="0.15"/>
//             <path d="M 600,100 Q 800,150 1000,100 T 1400,100" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.15"/>
            
//             <g opacity="0.2">
//               <circle cx="150" cy="300" r="3" fill="#2563eb"/>
//               <circle cx="180" cy="320" r="3" fill="#2563eb"/>
//               <circle cx="210" cy="340" r="3" fill="#2563eb"/>
//               <circle cx="1250" cy="400" r="3" fill="#3b82f6"/>
//               <circle cx="1280" cy="420" r="3" fill="#3b82f6"/>
//               <circle cx="1310" cy="440" r="3" fill="#3b82f6"/>
//               <circle cx="100" cy="600" r="3" fill="#2563eb"/>
//               <circle cx="130" cy="620" r="3" fill="#2563eb"/>
//               <circle cx="160" cy="640" r="3" fill="#2563eb"/>
//             </g>
            
//             <rect x="50" y="50" width="120" height="120" fill="url(#accentGrad)" rx="10" opacity="0.5">
//               <animateTransform attributeName="transform" type="rotate" from="0 110 110" to="360 110 110" dur="30s" repeatCount="indefinite"/>
//             </rect>
            
//             <rect x="1200" y="650" width="150" height="150" fill="url(#accentGrad)" rx="10" opacity="0.4">
//               <animateTransform attributeName="transform" type="rotate" from="0 1275 725" to="-360 1275 725" dur="25s" repeatCount="indefinite"/>
//             </rect>
            
//             <g stroke="#2563eb" strokeWidth="0.5" opacity="0.08">
//               <line x1="0" y1="200" x2="1400" y2="200"/>
//               <line x1="0" y1="400" x2="1400" y2="400"/>
//               <line x1="0" y1="600" x2="1400" y2="600"/>
//               <line x1="300" y1="0" x2="300" y2="900"/>
//               <line x1="700" y1="0" x2="700" y2="900"/>
//               <line x1="1100" y1="0" x2="1100" y2="900"/>
//             </g>
            
//             <path d="M 0,0 Q 350,80 700,40 T 1400,0 L 1400,0 L 0,0 Z" fill="#2563eb" opacity="0.05"/>
//             <path d="M 0,900 Q 350,820 700,860 T 1400,900 L 1400,900 L 0,900 Z" fill="#3b82f6" opacity="0.05"/>
            
//             <g opacity="0.6">
//               <circle cx="400" cy="250" r="2" fill="#fbbf24">
//                 <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
//               </circle>
//               <circle cx="900" cy="180" r="2" fill="#fbbf24">
//                 <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite"/>
//               </circle>
//               <circle cx="1100" cy="550" r="2" fill="#fbbf24">
//                 <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
//               </circle>
//               <circle cx="250" cy="700" r="2" fill="#fbbf24">
//                 <animate attributeName="opacity" values="0.3;1;0.3" dur="2.2s" repeatCount="indefinite"/>
//               </circle>
//             </g>
            
//             <path d="M 1300,300 L 1350,250 L 1400,300 L 1350,350 Z" fill="#3b82f6" opacity="0.1">
//               <animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="4s" repeatCount="indefinite" additive="sum"/>
//             </path>
//             <path d="M 100,800 L 150,750 L 200,800 L 150,850 Z" fill="#2563eb" opacity="0.1">
//               <animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="3.5s" repeatCount="indefinite" additive="sum"/>
//             </path>
//           </svg>
//         </div>
//       </div>
      
//       {/* Content */}
//       <div className="relative z-10 max-w-6xl mx-auto">
//         <div className="mb-2">
//           <div className="">
//             <div className="flex flex-col items-center mb-4 md:mb-0">
//               <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
//                 <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>
//                 <span className="mx-2 sm:mx-4 text-xs sm:text-sm font-semibold text-blue-700 tracking-wider uppercase">
//                   Limited Time Offers
//                 </span>
//                 <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>
//               </div>
              
//               <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-center backdrop-blur-sm px-4 py-2 rounded-lg">
//                 <span className="text-grey-700">Special</span>
//                 <span className="text-blue-600 ml -2 sm:ml-3">Offers</span>
//               </h2>
//             </div>
            
//             {/* Navigation buttons */}
//             {activeOffers.length > 2 && (
//               <div className="flex gap-2 justify-end items-end">
//                 <button 
//                   onClick={() => handlePrevOfferSlide()}
//                   className="p-2 rounded-full bg-white border border-blue-500 hover:bg-slate-50 transition-colors shadow-lg"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                 </button>
//                 <button 
//                   onClick={() => handleNextOfferSlide()}
//                   className="p-2 rounded-full bg-white border border-blue-500 hover:bg-slate-50 transition-colors shadow-lg"
//                 >
//                   <ChevronRight className="h-4 w-4" />
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
        
//         {/* Slider Container */}
//         <div className="relative">
//           {(() => {
//             if (activeOffers.length === 0) {
//               return (
//                 <div className="w-full flex-shrink-0 px-2">
//                   <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200">
//                     <div className="text-4xl mb-4">🏠</div>
//                     <h3 className="text-xl font-bold text-blue-900 mb-2">No Active Offers Available</h3>
//                     <p className="text-blue-700">Check back soon for new special offers!</p>
//                   </div>
//                 </div>
//               );
//             }
            
//             // Create slides with 2 active offers each
//             const slides = [];
//             const totalSlides = Math.ceil(activeOffers.length / 2);
            
//             for (let slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
//               const startIndex = slideIndex * 2;
//               const endIndex = startIndex + 2;
//               const slideOffers = activeOffers.slice(startIndex, endIndex);
              
//               slides.push(
//                 <div key={slideIndex} className="w-full flex-shrink-0 px-2">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] md:gap-[80px]">
//                     {slideOffers.map((offer, index) => (
//                       <div
//                         key={offer.id || index}
//                         className="bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-blue-200 transition-transform transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
//                         onClick={() => {
//                           setSelectedOffer(offer);
//                           setIsClaimPopupOpen(true);
//                         }}
//                       >
//                         {/* TOP IMAGE */}
//                         <div className="relative w-full h-[120px] md:h-[220px]">
//                           <img
//                             src={offer.image || "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg"}
//                             alt="Interior"
//                             className="w-full h-full object-cover rounded-t-xl"
//                           />
//                           <div className="absolute top-2 left-2 px-2 py-1 rounded bg-white/80 backdrop-blur-sm">
//                             <p className="text-sm md:text-xl font-semibold text-blue-900">
//                               {offer.property_name || "SOUL SPACE STUDIO"}
//                             </p>
//                           </div>
//                         </div>

//                         {/* MOBILE VIEW */}
//                         <div className="md:hidden">
//                           <div className="p-3">
//                             <div className="flex justify-between items-start mb-3">
//                               <div>
//                                 <h2 className="text-lg font-black text-blue-900">
//                                   {offer.title || "3BHK"} Only For
//                                 </h2>
//                                 <div className="mt-1">
//                                   <p className="text-2xl font-extrabold text-yellow-500">
//                                     ₹{offer.discounted_price || offer.final_price || "8000"} /-
//                                   </p>
//                                   {offer.original_price || offer.actual_price ? (
//                                     <p className="text-xs text-blue-800/60 line-through">
//                                       Was ₹{offer.original_price || offer.actual_price}
//                                     </p>
//                                   ) : (
//                                     <p className="text-xs text-blue-800/60">
//                                       * Limited time pricing
//                                     </p>
//                                   )}
//                                 </div>
//                               </div>
//                               <div className="bg-yellow-400 text-blue-900 px-2 py-1.5 rounded text-[10px] min-w-[60px]">
//                                 <p className="uppercase font-semibold">Discount</p>
//                                 <div className="text-xl font-black">
//                                   {offer.discount_value != null && offer.discount_value > 0 ? (
//                                     <div className="text-lg">₹{Math.floor(Number(offer.discount_value))}</div>
//                                   ) : offer.discount_percentage || offer.discount_percent ? (
//                                     <div className="text-lg">{offer.discount_percentage || offer.discount_percent}%</div>
//                                   ) : (
//                                     <div className="text-lg">15%</div>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
                            
//                             <div className="mb-3">
//                               <h3 className="text-xs font-bold text-blue-900 mb-1">WHY CHOOSE US?</h3>
//                               <ul className="text-xs text-blue-800 space-y-0.5">
//                                 {(offer.features || [
//                                   "Fully Furnished Rooms with AC",
//                                   "High-Speed WiFi & Daily Housekeeping",
//                                   "Free Laundry & Home Cooked Meals"
//                                 ]).slice(0, 3).map((point, idx) => (
//                                   <li key={idx}>• {point.length > 40 ? point.substring(0, 40) + "..." : point}</li>
//                                 ))}
//                               </ul>
//                             </div>

//                             {(offer.start_date || offer.end_date || offer.valid_from || offer.valid_to) && (
//                               <div className="mb-3">
//                                 <div className="relative inline-block">
//                                   <div className="bg-yellow-400 text-blue-900 px-3 py-1.5 pr-6 rounded-sm shadow-md skew-x-[-10deg]">
//                                     <div className="skew-x-[10deg]">
//                                       <p className="text-[10px] font-extrabold uppercase leading-tight">LIMITED TIME</p>
//                                       <p className="text-[11px] font-bold">
//                                         Valid Till{" "}
//                                         {(() => {
//                                           const rawDate = offer.valid_to || offer.end_date;
//                                           if (!rawDate) return "N/A";
//                                           const d = new Date(rawDate);
//                                           return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
//                                         })()}
//                                       </p>
//                                     </div>
//                                   </div>
//                                   <span className="absolute top-0 right-0 h-full w-2 bg-yellow-600 skew-x-[-10deg]"></span>
//                                 </div>
//                               </div>
//                             )}

//                             <div className="mb-3">
//                               <p className="text-xs text-blue-800/60 mb-1">Package Includes</p>
//                               <div className="grid grid-cols-3 gap-1">
//                                 {(offer.gallery || [
//                                   "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
//                                   "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg",
//                                   "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
//                                 ]).map((img, idx) => (
//                                   <img key={idx} src={img} alt="Interior" className="h-10 w-full object-cover rounded border border-blue-100" />
//                                 ))}
//                               </div>
//                             </div>

//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setSelectedOffer(offer);
//                                 setIsClaimPopupOpen(true);
//                               }}
//                               className="w-full bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 rounded-md text-sm transition flex items-center justify-center gap-2"
//                             >
//                               <span>Claim Offer</span>
//                               <span className="text-lg">→</span>
//                             </button>
//                           </div>
//                         </div>

//                         {/* DESKTOP VIEW */}
//                         <div className="hidden md:block">
//                           <div className="p-3 md:p-4 grid md:grid-cols-2 gap-2 md:gap-3 items-stretch">
//                             <div className="flex flex-col justify-start space-y-1 md:space-y-1.5">
//                               <h2 className="text-xl md:text-2xl font-black text-blue-900 leading-snug">
//                                 {offer.title || "3BHK"} <br /> Only For
//                               </h2>
//                               <div className="mt-1">
//                                 <p className="text-2xl md:text-3xl font-extrabold text-yellow-500">
//                                   ₹{offer.discounted_price || offer.final_price || "8000"} /-
//                                 </p>
//                                 {offer.original_price || offer.actual_price ? (
//                                   <p className="text-[10px] text-blue-800/60 line-through">
//                                     Was ₹{offer.original_price || offer.actual_price}
//                                   </p>
//                                 ) : (
//                                   <p className="text-[10px] text-blue-800/60">* Limited time pricing</p>
//                                 )}
//                               </div>
//                               {offer.start_date || offer.end_date || offer.valid_from || offer.valid_to ? (
//                                 <div className="mt-2 md:mt-3">
//                                   <div className="relative inline-block">
//                                     <div className="bg-yellow-400 text-blue-900 px-4 md:px-5 py-1.5 md:py-2 pr-6 md:pr-8 rounded-sm shadow-md skew-x-[-10deg]">
//                                       <div className="skew-x-[10deg]">
//                                         <p className="text-[11px] md:text-[12px] font-extrabold uppercase leading-tight">LIMITED TIME OFFER</p>
//                                         <p className="text-[12px] md:text-[13px] font-bold">
//                                           Valid Till{" "}
//                                           {(() => {
//                                             const rawDate = offer.valid_to || offer.end_date;
//                                             if (!rawDate) return "N/A";
//                                             const d = new Date(rawDate);
//                                             return d.toLocaleDateString("en-GB", {
//                                               day: "2-digit",
//                                               month: "short",
//                                               year: "numeric",
//                                             });
//                                           })()}
//                                         </p>
//                                       </div>
//                                     </div>
//                                     <span className="absolute top-0 right-0 h-full w-2 md:w-3 bg-yellow-600 skew-x-[-10deg]"></span>
//                                   </div>
//                                 </div>
//                               ) : null}
//                             </div>

//                             <div className="bg-blue-50 rounded-lg p-2 md:p-3 border border-blue-100 flex flex-col justify-between">
//                               <div>
//                                 <h3 className="text-xs font-bold text-blue-900 mb-1.5 md:mb-2.5">WHY CHOOSE US?</h3>
//                                 <ul className="space-y-1 md:space-y-1.5 text-[10px] md:text-[11px] text-blue-800">
//                                   {(offer.features || [
//                                     "Fully Furnished Rooms with AC",
//                                     "High-Speed WiFi & Daily Housekeeping",
//                                     "Free Laundry & Home Cooked Meals"
//                                   ]).map((point, idx) => (
//                                     <li key={idx}>• {point}</li>
//                                   ))}
//                                 </ul>
//                               </div>
//                               <div className="mt-2 md:mt-3 self-end">
//                                 <div className="bg-yellow-400 text-blue-900 px-2 md:px-3 py-1 md:py-1.5 rounded text-[9px] md:text-[10px]">
//                                   <p className="uppercase font-semibold">Discount</p>
//                                   <div className="text-xl md:text-2xl font-black">
//                                     {offer.discount_value != null && offer.discount_value > 0 ? (
//                                       <div>₹{Math.floor(Number(offer.discount_value))} OFF /</div>
//                                     ) : offer.discount_percentage || offer.discount_percent ? (
//                                       <div>{offer.discount_percentage || offer.discount_percent}%</div>
//                                     ) : (
//                                       <div>15%</div>
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="px-3 md:px-4 pb-2 md:pb-3">
//                             <p className="text-[10px] text-blue-800/60 mb-1 md:mb-2">Package Includes</p>
//                             <div className="grid grid-cols-3 gap-1.5 md:gap-2.5">
//                               {(offer.gallery || [
//                                 "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
//                                 "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg",
//                                 "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
//                               ]).map((img, idx) => (
//                                 <img key={idx} src={img} alt="Interior" className="h-12 md:h-16 w-full object-cover rounded border border-blue-100" />
//                               ))}
//                             </div>
//                           </div>

//                           <div className="px-3 md:px-4 pb-3 md:pb-4">
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setSelectedOffer(offer);
//                                 setIsClaimPopupOpen(true);
//                               }}
//                               className="w-full bg-blue-700 hover:bg-blue-500 text-white font-bold py-1.5 md:py-2 rounded-md text-sm transition flex items-center justify-center gap-2"
//                             >
//                               <span>View Offer</span>
//                               <span className="text-lg">→</span>
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
                    
//                     {slideOffers.length === 1 && <div className="hidden md:block"></div>}
//                   </div>
//                 </div>
//               );
//             }
            
//             return slides;
//           })()}
//         </div>

//         {/* Dot Indicators */}
//         {activeOffers.length > 2 && (
//           <div className="flex justify-center gap-2 mt-6">
//             {Array.from({ length: Math.ceil(activeOffers.length / 2) }).map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => setCurrentOfferIndex(index)}
//                 className={`h-2 rounded-full transition-all duration-300 shadow-lg ${
//                   currentOfferIndex === index 
//                     ? 'w-6 bg-blue-600' 
//                     : 'w-2 bg-white border border-blue-300 hover:bg-blue-200'
//                 }`}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Claim Offer Popup Modal */}
//       {isClaimPopupOpen && selectedOffer && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 py-3">
//           <div className="bg-white border mt-10 border-slate-300 rounded-xl shadow-xl w-full max-w-3xl flex flex-col" style={{ maxHeight: '80vh' }}>
            
//             {/* Header */}
//             <div
//               className="px-4 py-2.5 flex-shrink-0 rounded-t-xl"
//               style={{ background: selectedOffer.mainColor || '#2563eb' }}
//             >
//               <div className="flex justify-between items-center gap-2">
//                 <div className="flex items-center gap-2">
//                   <span className="text-lg text-white">🎉</span>
//                   <div className="max-w-[200px] sm:max-w-none overflow-hidden">
//                     <h3 className="text-sm sm:text-base font-bold text-white truncate">
//                       {selectedOffer.title || "Special Offer"}
//                     </h3>
//                     <p className="text-white/90 text-[10px] truncate">
//                       {selectedOffer.property_name || "Limited Time Offer"}
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => setIsClaimPopupOpen(false)}
//                   className="text-white/90 hover:text-white text-base transition-colors flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20"
//                   aria-label="Close popup"
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>

//             {/* Main Content - Scrollable */}
//             <div className="flex-1 overflow-y-auto min-h-0">
              
//               {/* Offer Image */}
//               <div className="relative h-40 sm:h-48 flex-shrink-0">
//                 <img
//                   src={selectedOffer.image || "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg"}
//                   alt={selectedOffer.title || "Offer"}
//                   className="w-full h-full object-cover"
//                 />
//                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
//                   <div className="flex justify-between items-end">
//                     <div>
//                       <h2 className="text-lg sm:text-xl font-bold text-white">
//                         {selectedOffer.property_name || "SOUL SPACE STUDIO"}
//                       </h2>
//                       <p className="text-white/90 text-xs">{selectedOffer.location || "Premium Location"}</p>
//                     </div>
//                     <div className="bg-yellow-500 text-blue-900 px-2.5 py-1.5 rounded-lg">
//                       <div className="text-base sm:text-lg font-bold">
//                         {selectedOffer.discount_percentage ? `${selectedOffer.discount_percentage}% OFF` : 
//                          selectedOffer.discount_value ? `₹${selectedOffer.discount_value} OFF` : "SPECIAL OFFER"}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Offer Code Section - NEW */}
// {selectedOffer.code && (
//   <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
//     <div className="flex flex-col items-center">
//       <p className="text-xs font-semibold text-gray-600 mb-2">Use this offer code at checkout</p>
//       <div className="flex items-center gap-2 bg-white rounded-lg border border-blue-200 p-2 shadow-sm">
//         <span className="font-mono font-bold text-lg text-blue-700 tracking-wider">
//           {selectedOffer.code}
//         </span>
//         <button
//           onClick={() => {
//             // Close the popup
//             setIsClaimPopupOpen(false);
            
//             // Check if offer has a property_id
//             if (!selectedOffer.property_id) {
//               toast.error("This offer is not linked to a specific property");
//               return;
//             }
            
//             // Store the offer code and details in localStorage
//             if (selectedOffer.code) {
//               const exactCode = selectedOffer.code.toString().trim();
//               localStorage.setItem('pendingOfferCode', exactCode);
//               localStorage.setItem('pendingOfferData', JSON.stringify({
//                 code: exactCode,
//                 discount_type: selectedOffer.discount_type,
//                 discount_value: selectedOffer.discount_value,
//                 discount_percent: selectedOffer.discount_percent,
//                 title: selectedOffer.title,
//                 description: selectedOffer.description,
//                 minMonths: selectedOffer.min_months,
//                 propertyId: selectedOffer.property_id,
//                 roomId: selectedOffer.room_id,
//                 bedNumber: selectedOffer.bed_number
//               }));
              
//             }
            
//             // Redirect to the property page
//             if (selectedOffer.property_name) {
//               const slug = generatePropertySlug({
//                 name: selectedOffer.property_name,
//                 area: selectedOffer.location || '',
//                 city: selectedOffer.city || '',
//                 id: selectedOffer.property_id
//               });
//               router.push(`/properties/${slug}?offer=${selectedOffer.code}&openBooking=true`);
//             } else {
//               router.push(`/properties?property_id=${selectedOffer.property_id}&offer=${selectedOffer.code}&openBooking=true`);
//             }
//           }}
//           className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex-1 shadow-md"
//           title="Claim Offer"
//         >
//           Claim Offer
//         </button>
//       </div>
//       <p className="text-[10px] text-gray-500 mt-2">
//         Copy this code and apply at checkout
//       </p>
//     </div>
//   </div>
// )}

//               {/* Price Section */}
//               <div className="px-4 py-3 border-b">
//                 <div className="flex flex-wrap items-center gap-4">
//                   <div>
//                     <p className="text-xs text-gray-600">Discounted Price</p>
//                     <div className="flex items-baseline gap-1.5">
//                       <span className="text-2xl sm:text-3xl font-bold text-blue-700">
//                         ₹{selectedOffer.discounted_price || selectedOffer.final_price || "8000"}
//                       </span>
//                       <span className="text-xs text-gray-500">/month</span>
//                     </div>
//                   </div>
                  
//                   {selectedOffer.original_price && (
//                     <div>
//                       <p className="text-xs text-gray-600">Original Price</p>
//                       <div className="flex items-baseline gap-1.5">
//                         <span className="text-base line-through text-gray-500">
//                           ₹{selectedOffer.original_price}
//                         </span>
//                         <span className="text-xs text-green-600 font-semibold">
//                           Save ₹{(selectedOffer.original_price - (selectedOffer.discounted_price || selectedOffer.final_price || 8000)).toLocaleString()}
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                 </div>
                
//                 {/* Validity */}
//                 <div className="mt-3 p-2.5 bg-blue-50 rounded-lg">
//                   <div className="flex items-center gap-2">
//                     <span className="text-blue-600 text-sm">⏰</span>
//                     <div>
//                       <p className="text-xs font-semibold text-blue-800">Limited Time Offer</p>
//                       <p className="text-[10px] text-blue-700">
//                         Valid till: {(() => {
//                           const rawDate = selectedOffer.valid_to || selectedOffer.end_date;
//                           if (!rawDate) return "Not specified";
//                           const d = new Date(rawDate);
//                           return d.toLocaleDateString("en-GB", {
//                             day: "2-digit",
//                             month: "short",
//                             year: "numeric",
//                           });
//                         })()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Features */}
//               <div className="px-4 py-3 border-b">
//                 <h3 className="text-sm font-bold text-gray-800 mb-2">What's Included</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
//                   {(selectedOffer.features || [
//                     "Fully Furnished Rooms with AC",
//                     "High-Speed WiFi",
//                     "Daily Housekeeping",
//                     "Free Laundry Service",
//                     "Home Cooked Meals",
//                     "Security & CCTV"
//                   ]).map((feature, index) => (
//                     <div key={index} className="flex items-center gap-1.5">
//                       <span className="text-green-500 text-xs">✓</span>
//                       <span className="text-xs text-gray-700">{feature}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Gallery */}
//               {(selectedOffer.gallery || selectedOffer.images) && (
//                 <div className="px-4 py-3 border-b">
//                   <h3 className="text-sm font-bold text-gray-800 mb-2">Gallery</h3>
//                   <div className="grid grid-cols-3 gap-1.5">
//                     {(selectedOffer.gallery || selectedOffer.images || [
//                       "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
//                       "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg",
//                       "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg"
//                     ]).map((img, index) => (
//                       <img
//                         key={index}
//                         src={img}
//                         alt={`Gallery ${index + 1}`}
//                         className="h-20 w-full object-cover rounded-lg"
//                       />
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Description */}
//               <div className="px-4 py-3 border-b">
//                 <h3 className="text-sm font-bold text-gray-800 mb-2">Description</h3>
//                 <p className="text-xs text-gray-700 leading-relaxed">
//                   {selectedOffer.description || 
//                     "This exclusive offer includes premium amenities and services designed for comfortable living. The package is available for a limited time only. Don't miss this opportunity to experience luxury living at an affordable price."}
//                 </p>
//               </div>

//               {/* Terms & Conditions */}
//               <div className="px-4 py-3">
//                 <h3 className="text-sm font-bold text-gray-800 mb-2">Terms & Conditions</h3>
//                 <ul className="text-xs text-gray-600 space-y-1.5">
//                   <li className="flex items-start gap-1.5">
//                     <span className="text-gray-400">•</span>
//                     <span>Offer valid for new bookings only</span>
//                   </li>
//                   <li className="flex items-start gap-1.5">
//                     <span className="text-gray-400">•</span>
//                     <span>Minimum stay period: 3 months</span>
//                   </li>
//                   <li className="flex items-start gap-1.5">
//                     <span className="text-gray-400">•</span>
//                     <span>Security deposit applicable as per standard policy</span>
//                   </li>
//                   <li className="flex items-start gap-1.5">
//                     <span className="text-gray-400">•</span>
//                     <span>Offer cannot be combined with other promotions</span>
//                   </li>
//                   <li className="flex items-start gap-1.5">
//                     <span className="text-gray-400">•</span>
//                     <span>Subject to availability</span>
//                   </li>
//                 </ul>
//               </div>
//             </div>

//             {/* Footer with Action Buttons */}
//             <div className="flex-shrink-0 px-4 py-3 border-t bg-white rounded-b-xl">
//               <div className="flex flex-col sm:flex-row gap-2">
//                 <button
//                   onClick={() => setIsClaimPopupOpen(false)}
//                   className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex-1"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleClaimAndRedirect(selectedOffer)}
//                   className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex-1 shadow-md flex items-center justify-center gap-2"
//                 >
//                   <span>Claim Offer & Book Now</span>
//                   <span className="text-base">→</span>
//                 </button>
//               </div>
//               <p className="text-center text-[10px] text-gray-500 mt-2">
//                 By claiming, you agree to our terms and conditions
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }



"use client";

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Copy, CheckCircle, Sparkles, Clock, MapPin, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { generatePropertySlug } from '@/lib/slugUtils';

interface OffersSliderProps {
  offers: any[];
}

export default function OffersSlider({ offers }: OffersSliderProps) {
  const router = useRouter();
  const [offersState, setOffersState] = useState(offers);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [isClaimPopupOpen, setIsClaimPopupOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // LOGIC PRESERVED: Handle redirect to property with offer
  const handleClaimAndRedirect = (offer: any) => {
    setIsClaimPopupOpen(false);
    
    if (!offer.property_id) {
      toast.error("This offer is not linked to a specific property");
      return;
    }
    
    if (offer.code) {
      const exactCode = offer.code.toString().trim();
      localStorage.setItem('pendingOfferCode', exactCode);
      localStorage.setItem('pendingOfferData', JSON.stringify({
        code: exactCode,
        discount_type: offer.discount_type,
        discount_value: offer.discount_value,
        discount_percent: offer.discount_percent,
        title: offer.title,
        description: offer.description,
        minMonths: offer.min_months,
        propertyId: offer.property_id,
        roomId: offer.room_id,
        bedNumber: offer.bed_number
      }));
    }

    if (offer.property_name) {
      const slug = generatePropertySlug({
        name: offer.property_name,
        area: offer.location || '',
        city: offer.city || '',
        id: offer.property_id
      });
      router.push(`/properties/${slug}?offer=${offer.code}&openBooking=true`);
    } else {
      router.push(`/properties?property_id=${offer.property_id}&offer=${offer.code}&openBooking=true`);
    }
  };

  // LOGIC PRESERVED: Filter only active offers
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

  // LOGIC PRESERVED: Auto-play
  useEffect(() => {
    if (activeOffers.length <= 1) return;
    const interval = setInterval(() => {
      handleNextOfferSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [activeOffers.length, handleNextOfferSlide]);

  return (
    <section className="relative py-16 px-4 overflow-hidden bg-slate-50">
      {/* MODERN MESH BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>Exclusive Deals</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Premium Living, <span className="text-blue-600">Unbeatable Prices.</span>
            </h2>
            <p className="mt-4 text-slate-600 text-lg">Handpicked offers for your perfect stay.</p>
          </div>

          {activeOffers.length > 2 && (
            <div className="flex gap-3 justify-center">
              <button 
                onClick={handlePrevOfferSlide}
                className="group p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 transition-all hover:shadow-md active:scale-95"
              >
                <ChevronLeft className="h-5 w-5 text-slate-600 group-hover:text-blue-600" />
              </button>
              <button 
                onClick={handleNextOfferSlide}
                className="group p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 transition-all hover:shadow-md active:scale-95"
              >
                <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-600" />
              </button>
            </div>
          )}
        </div>

        {/* SLIDER CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeOffers.length === 0 ? (
            <div className="col-span-2 text-center py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-dashed border-slate-300">
               <div className="text-5xl mb-4 opacity-50">✨</div>
               <h3 className="text-2xl font-bold text-slate-800">Coming Soon!</h3>
               <p className="text-slate-500 mt-2">New exclusive offers are currently being prepared.</p>
            </div>
          ) : (
            activeOffers.slice(currentOfferIndex * 2, (currentOfferIndex * 2) + 2).map((offer, idx) => (
              <div
                key={offer.id || idx}
                onClick={() => { setSelectedOffer(offer); setIsClaimPopupOpen(true); }}
                className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-100"
              >
                {/* IMAGE AREA */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={offer.image || "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg"}
                    alt={offer.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  
                  {/* PRICE TAG (Floating) */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/50">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter leading-none mb-1">Starts at</p>
                    <p className="text-xl font-black text-blue-600 leading-none">
                      ₹{offer.discounted_price || offer.final_price || "8000"}
                    </p>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{offer.property_name || "Premium Studio"}</h3>
                    <div className="flex items-center text-white/80 text-sm gap-2">
                      <MapPin className="w-3 h-3" />
                      {offer.location || "Prime Location"}
                    </div>
                  </div>
                </div>

                {/* CONTENT AREA */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{offer.title || "Flash Sale"}</span>
                      <h4 className="text-xl font-bold text-slate-800 mt-1">Exclusive Monthly Discount</h4>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black">
                         {offer.discount_percentage ? `${offer.discount_percentage}% OFF` : `₹${offer.discount_value} OFF`}
                       </span>
                    </div>
                  </div>

                  {/* FEATURES PILLS */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {(offer.features || ["Furnished", "WiFi", "Meals"]).slice(0, 3).map((f: string, i: number) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-medium rounded-lg border border-slate-100">
                        <ShieldCheck className="w-3 h-3 text-green-500" /> {f}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-semibold">
                        Valid till: {offer.valid_to ? new Date(offer.valid_to).toLocaleDateString('en-IN', {day:'2-digit', month:'short'}) : 'End of Month'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-blue-600 group-hover:gap-4 transition-all">
                      View Deal <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION DOTS */}
        {activeOffers.length > 2 && (
          <div className="flex justify-center gap-3 mt-12">
            {Array.from({ length: Math.ceil(activeOffers.length / 2) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentOfferIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  currentOfferIndex === index 
                    ? 'w-12 bg-blue-600' 
                    : 'w-4 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODERN POPUP MODAL */}
      {isClaimPopupOpen && selectedOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsClaimPopupOpen(false)} />
          
          <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Modal Left: Image & Info */}
            <div className="w-full md:w-5/12 relative">
               <img 
                 src={selectedOffer.image || "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg"} 
                 className="w-full h-full object-cover min-h-[250px]"
                 alt="Offer" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent p-8 flex flex-col justify-end">
                  <div className="bg-yellow-400 text-blue-900 text-[10px] font-black uppercase px-2 py-1 rounded w-fit mb-2">Verified Offer</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedOffer.property_name}</h3>
                  <p className="text-white/80 text-sm">{selectedOffer.location}</p>
               </div>
               <button 
                onClick={() => setIsClaimPopupOpen(false)}
                className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors md:hidden"
               >
                 <ChevronLeft className="w-5 h-5" />
               </button>
            </div>

            {/* Modal Right: Details & Action */}
            <div className="w-full md:w-7/12 p-6 md:p-10 overflow-y-auto bg-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedOffer.title || "Special Deal"}</h2>
                  <p className="text-slate-500 mt-1">Limited time availability</p>
                </div>
                <button 
                  onClick={() => setIsClaimPopupOpen(false)}
                  className="hidden md:flex p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <ChevronRight className="w-6 h-6 rotate-90" />
                </button>
              </div>

              {/* BENTO GRID DETAILS */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-600 uppercase mb-1">Effective Rent</p>
                  <p className="text-2xl font-black text-slate-900">₹{selectedOffer.discounted_price || selectedOffer.final_price}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <p className="text-xs font-bold text-orange-600 uppercase mb-1">Total Saving</p>
                  <p className="text-2xl font-black text-slate-900">
                    {selectedOffer.discount_percentage ? `${selectedOffer.discount_percentage}%` : `₹${selectedOffer.discount_value}`}
                  </p>
                </div>
              </div>

              {/* OFFER CODE BOX */}
              {selectedOffer.code && (
                <div className="mb-8 p-6 bg-slate-900 rounded-3xl text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
                    <Zap className="w-20 h-20 text-white" />
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Copy Promo Code</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-3xl font-mono font-black text-white tracking-widest">{selectedOffer.code}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOffer.code);
                        setCopiedCode(true);
                        toast.success("Code Copied!");
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                    >
                      {copiedCode ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-white" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" /> Why this deal?
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                    {(selectedOffer.features || ["Furnished", "WiFi", "Daily Cleaning", "Security"]).map((f:string, i:number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                   <button 
                    onClick={() => setIsClaimPopupOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                   >
                     Maybe Later
                   </button>
                   <button 
                    onClick={() => handleClaimAndRedirect(selectedOffer)}
                    className="flex-[2] px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
                   >
                     Claim & Book Room <ArrowRight className="w-5 h-5" />
                   </button>
                </div>
                <p className="text-[10px] text-center text-slate-400 font-medium">* This offer is subject to availability and standard T&Cs.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}