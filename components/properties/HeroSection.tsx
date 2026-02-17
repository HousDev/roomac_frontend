// "use client";

// import { motion } from 'framer-motion';
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Sparkles } from "lucide-react";

// export default function HeroSection() {
//   return (
//     <section className="relative overflow-hidden bg-blue-100 h-auto min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[450px] py-8 md:py-12 lg:py-16">
//       <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDRBQUQiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />

//       <div className="absolute -top-10 -right-10 sm:-top-20 sm:-right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-xl sm:blur-2xl md:blur-3xl opacity-20 sm:opacity-25 md:opacity-30" />
//       <div className="absolute -bottom-10 -left-10 sm:-bottom-20 sm:-left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full blur-xl sm:blur-2xl md:blur-3xl opacity-25 sm:opacity-30 md:opacity-40" />
//       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-gradient-to-r from-blue-50 to-white rounded-full blur-xl sm:blur-2xl md:blur-3xl opacity-20 sm:opacity-25 md:opacity-30" />

//       <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
//         <div className="max-w-4xl mx-auto text-center px-2 sm:px-4">
//           <div className="mb-4 sm:mb-5 md:mb-6">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6 }}
//             >
//               <Badge className="bg-white hover:to-[#093876] text-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2 border-0 text-xs sm:text-sm hover:text-white">
//                 <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
//                 Premium Accommodations
//               </Badge>
//             </motion.div>
//           </div>

//           <div className="mb-4 sm:mb-5 md:mb-6">
//             <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-tight sm:leading-tight md:leading-tight">
//               <div className="block text-slate-900 mb-1 sm:mb-1.5 md:mb-2">
//                 {"Find Your Perfect".split("").map((char, index) => (
//                   <motion.span
//                     key={index}
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{
//                       duration: 0.3,
//                       delay: index * 0.05,
//                     }}
//                     className="inline-block"
//                   >
//                     {char}
//                   </motion.span>
//                 ))}
//               </div>

//               <div className="block">
//                 {"Home".split("").map((char, index) => (
//                   <motion.span
//                     key={index}
//                     initial={{ opacity: 0, scale: 0.5 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{
//                       duration: 0.4,
//                       delay: 1.5 + (index * 0.1),
//                       type: "spring",
//                       stiffness: 100
//                     }}
//                     className="inline-block text-blue-800"
//                     style={{
//                       backgroundClip: 'text',
//                       WebkitBackgroundClip: 'text',
//                     }}
//                   >
//                     {char}
//                   </motion.span>
//                 ))}
//               </div>
//             </h1>
//           </div>

//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 2, duration: 0.8 }}
//           >
//             <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-800 mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-3xl mx-auto px-2 sm:px-4">
//               Discover premium PG accommodations with modern amenities, flexible pricing, and unmatched comfort across multiple locations
//             </p>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 40 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 2.5, duration: 0.6 }}
//             className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0"
//           >
//             <Button className="bg-gradient-to-r from-[#004AAD] to-blue-600 hover:from-blue-600 hover:to-[#004AAD] text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 text-sm sm:text-base md:text-lg w-full sm:w-auto">
//               Explore Properties
//             </Button>
//             <Button
//               variant="outline"
//               className="border-2 border-[#004AAD] text-[#004AAD] hover:bg-teal-300 hover:text-black hover:border-blue-900 hover:shadow-lg px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 text-sm sm:text-base md:text-lg w-full sm:w-auto mt-2 sm:mt-0 transition-all duration-300 hover:animate-pulse"
//             >
//               Learn 
//             </Button>
//           </motion.div>
//         </div>
//       </div>

//       <motion.div
//         className="absolute top-1/4 left-1/4 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-cyan-400 rounded-full"
//         animate={{
//           y: [0, -10, 0],
//           scale: [1, 1.2, 1],
//         }}
//         transition={{
//           duration: 3,
//           repeat: Infinity,
//           ease: "easeInOut"
//         }}
//       />
//       <motion.div
//         className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-blue-400 rounded-full"
//         animate={{
//           y: [0, 8, 0],
//           scale: [1, 1.3, 1],
//         }}
//         transition={{
//           duration: 2.5,
//           repeat: Infinity,
//           ease: "easeInOut",
//           delay: 0.5
//         }}
//       />
//       <motion.div
//         className="absolute top-1/3 right-1/3 w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-[#004AAD] rounded-full"
//         animate={{
//           y: [0, -8, 0],
//           x: [0, 5, 0],
//         }}
//         transition={{
//           duration: 4,
//           repeat: Infinity,
//           ease: "easeInOut",
//           delay: 1
//         }}
//       />
//       <motion.div
//         className="absolute top-[10%] left-[10%] w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-cyan-400 rounded-full"
//         animate={{
//           y: [0, -20, 0],
//           scale: [1, 1.3, 1],
//         }}
//         transition={{
//           duration: 4,
//           repeat: Infinity,
//           ease: "easeInOut"
//         }}
//       />
//     </section>
//   );
// }
// components/properties/HeroSection.tsx
// components/properties/HeroSection.tsx



// 'use client';

// import { useEffect, useState } from 'react';
// import { Badge } from '@/components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Input } from '@/components/ui/input';
// import { SlidersHorizontal, MapPin, Search, Wifi, IndianRupee, X, Sparkles } from 'lucide-react';

// // Add your constants here
// const AMENITY_OPTIONS = ['WiFi', 'AC', 'Laundry', 'Gym', 'Parking', 'Food', 'Security'];
// // In your HeroSection.tsx, update the PRICE_OPTIONS to match:
// const PRICE_OPTIONS = [
//   { label: "Any Price" },
//   { label: "Under ₹5,000" },
//   { label: "₹5,000 – ₹10,000" },
//   { label: "₹10,000 – ₹15,000" },
//   { label: "₹15,000 – ₹25,000" },
//   { label: "Above ₹25,000" },
// ];

// interface PropertyHeroSectionProps {
//   isMounted: boolean;
//   cities?: any[];
//   selectedCity: string;
//   setSelectedCity: (v: string) => void;
//   searchArea: string;
//   setSearchArea: (v: string) => void;
//   selectedAmenity: string;
//   setSelectedAmenity: (v: string) => void;
//   selectedPriceKey: string;
//   setSelectedPriceKey: (v: string) => void;
// }

// export default function PropertyHeroSection({
//   isMounted,
//   cities = [],
//   selectedCity,
//   setSelectedCity,
//   searchArea,
//   setSearchArea,
//   selectedAmenity,
//   setSelectedAmenity,
//   selectedPriceKey,
//   setSelectedPriceKey,
// }: PropertyHeroSectionProps) {
//   const [bgImage, setBgImage] = useState('');

//   useEffect(() => {
//     const images = [
//       'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074&auto=format&fit=crop',
//       'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
//       'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop',
//       'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop'
//     ];
    
//     const randomImage = images[Math.floor(Math.random() * images.length)];
//     setBgImage(randomImage);
//   }, []);

//   return (
//     <section className="relative overflow-hidden py-20">
//       {/* Background Image with Dark Overlay */}
//       <div 
//         className="absolute inset-0 bg-cover bg-center bg-no-repeat"
//         style={{
//           backgroundImage: `url('${bgImage}')`,
//           boxShadow: 'inset 0 0 0 1000px rgba(0,0,0,0.7)',
//           backgroundBlendMode: 'overlay'
//         }}
//       />
      
//       {/* Pattern Overlays */}
//       <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 z-10" />
      
//       {/* Decorative Gradient Blur Elements */}
//       <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl opacity-30 z-15" />
//       <div className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-cyan-300/20 to-blue-500/20 rounded-full blur-3xl opacity-30 z-15" />
//       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-r from-white/10 to-blue-300/10 rounded-full blur-3xl opacity-20 z-15" />

//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
//         <div className="max-w-4xl mx-auto">
          
//           {/* Header Content - More Compact */}
//           <div className="text-center mb-5">
//             {/* Badge */}
//             <div className="overflow-hidden mb-3">
//               <Badge 
//                 className="bg-white/15 backdrop-blur-md border-white/30 text-white hover:text-white hover:bg-white/25 hover:border-white/40 px-4 py-1.5 text-xs transition-all duration-300 hover:scale-105"
//               >
//                 <Sparkles className="h-3 w-3 mr-1.5" />
//                 Premium PG Accommodations
//               </Badge>
//             </div>
            
//             {/* Title - Smaller */}
//            <div className="overflow-hidden mb-2">
//               <h1 
//                 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight"
//               >
//                 <span className="text-white">Find Your  </span>
//                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">
//                   Perfect Space
//                 </span>
//               </h1>
//             </div>
            
//             {/* Description - Smaller */}
//             <div className="overflow-hidden mb-3">
//               <p 
//                 className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl mx-auto"
//               >
//                 Discover premium accommodations with modern amenities and flexible pricing
//               </p>
//             </div>
//           </div>

//           {/* Compact Filters Section */}
//           <div className="max-w-3xl mx-auto">
//             <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl shadow-black/30 px-3 py-3">
              
//               {/* Compact Header */}
//               <div className="flex items-center gap-1.5 mb-2">
//                 <SlidersHorizontal className="h-3.5 w-3.5 text-white/80" />
//                 <span className="text-white/80 text-[10px] font-semibold uppercase tracking-wide">
//                   Find Your Space
//                 </span>
//               </div>

//               {/* Compact Grid - 4 columns on desktop, 2 on mobile */}
//               <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                
//                 {/* City - Default Pune */}
//                 <div className="relative">
//                   <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
//                     <MapPin className="h-3 w-3 text-blue-300" />
//                   </div>
//                   <Select value={selectedCity || "pune"} onValueChange={setSelectedCity}>
//                     <SelectTrigger className="h-8 pl-7 pr-2 rounded-md bg-white/15 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:ring-1 focus:ring-white/40 focus:border-white/50 text-[11px] font-medium hover:bg-white/25 transition-all w-full [&>span]:text-white">
//                       <SelectValue>
//                         {selectedCity ? selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1) : 'Pune'}
//                       </SelectValue>
//                     </SelectTrigger>
//                     <SelectContent className="rounded-lg shadow-2xl border border-blue-100 bg-white">
//                       <SelectItem value="pune" className="cursor-pointer hover:bg-blue-50 text-[11px]">
//                         <div className="flex items-center gap-2">
//                           <MapPin className="h-3 w-3 text-blue-500" />
//                           Pune
//                         </div>
//                       </SelectItem>
//                       {cities && cities.length > 0 && cities.map((city: any) => (
//                         city.name.toLowerCase() !== 'pune' && (
//                           <SelectItem key={city.id} value={city.name.toLowerCase()} className="cursor-pointer hover:bg-blue-50 text-[11px]">
//                             <div className="flex items-center gap-2">
//                               <MapPin className="h-3 w-3 text-blue-500" />
//                               {city.name}
//                             </div>
//                           </SelectItem>
//                         )
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Locality - Compact */}
//                 <div className="relative">
//                   <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
//                     <Search className="h-3 w-3 text-blue-300" />
//                   </div>
//                   <Input
//                     placeholder="Search locality..."
//                     value={searchArea}
//                     onChange={(e) => setSearchArea(e.target.value)}
//                     className="h-8 pl-7 pr-7 rounded-md bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:ring-1 focus:ring-white/40 focus:border-white/50 text-[11px] font-medium hover:bg-white/25 transition-all w-full"
//                   />
//                   {searchArea && (
//                     <button 
//                       onClick={() => setSearchArea("")} 
//                       className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
//                     >
//                       <X className="h-3 w-3" />
//                     </button>
//                   )}
//                 </div>

//                 {/* Amenities - Compact */}
//                 <div className="relative">
//                   <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
//                     <Wifi className="h-3 w-3 text-blue-300" />
//                   </div>
//                   <Select value={selectedAmenity || "__all__"} onValueChange={(v) => setSelectedAmenity(v === "__all__" ? "" : v)}>
//                     <SelectTrigger className="h-8 pl-7 pr-2 rounded-md bg-white/15 backdrop-blur-sm border border-white/30 text-white focus:ring-1 focus:ring-white/40 focus:border-white/50 text-[11px] font-medium hover:bg-white/25 transition-all w-full [&>span]:text-white">
//                       <SelectValue placeholder="All Amenities" />
//                     </SelectTrigger>
//                     <SelectContent className="rounded-lg shadow-2xl border border-blue-100 bg-white">
//                       <SelectItem value="__all__" className="hover:bg-blue-50 text-[11px] text-slate-700">All Amenities</SelectItem>
//                       {AMENITY_OPTIONS.map((a) => (
//                         <SelectItem key={a} value={a} className="hover:bg-blue-50 text-[11px] text-slate-700">{a}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Price - Compact */}
//                 <div className="relative">
//                   <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
//                     <IndianRupee className="h-3 w-3 text-blue-300" />
//                   </div>
//                   <Select value={selectedPriceKey} onValueChange={setSelectedPriceKey}>
//                     <SelectTrigger className="h-8 pl-7 pr-2 rounded-md bg-white/15 backdrop-blur-sm border border-white/30 text-white focus:ring-1 focus:ring-white/40 focus:border-white/50 text-[11px] font-medium hover:bg-white/25 transition-all w-full [&>span]:text-white">
//                       <SelectValue placeholder="Any Price" />
//                     </SelectTrigger>
//                     <SelectContent className="rounded-lg shadow-2xl border border-blue-100 bg-white">
//                       {PRICE_OPTIONS.map((p) => (
//                         <SelectItem key={p.label} value={p.label} className="hover:bg-blue-50 text-[11px] text-slate-700">{p.label}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               {/* Active Filters - Compact */}
//               {(searchArea || selectedAmenity || selectedPriceKey !== "Any Price") && (
//                 <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-white/20">
//                   <span className="text-white/60 text-[9px] self-center">Active:</span>
//                   {searchArea && (
//                     <span className="inline-flex items-center gap-0.5 bg-blue-500/30 border border-blue-400/40 text-white text-[9px] px-1.5 py-0.5 rounded-full">
//                       "{searchArea}"
//                       <button onClick={() => setSearchArea("")}><X className="h-2 w-2" /></button>
//                     </span>
//                   )}
//                   {selectedAmenity && (
//                     <span className="inline-flex items-center gap-0.5 bg-emerald-500/30 border border-emerald-400/40 text-white text-[9px] px-1.5 py-0.5 rounded-full">
//                       {selectedAmenity}
//                       <button onClick={() => setSelectedAmenity("")}><X className="h-2 w-2" /></button>
//                     </span>
//                   )}
//                   {selectedPriceKey !== "Any Price" && (
//                     <span className="inline-flex items-center gap-0.5 bg-amber-500/30 border border-amber-400/40 text-white text-[9px] px-1.5 py-0.5 rounded-full">
//                       {selectedPriceKey}
//                       <button onClick={() => setSelectedPriceKey("Any Price")}><X className="h-2 w-2" /></button>
//                     </span>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal, MapPin, Search, IndianRupee, X, Sparkles } from 'lucide-react';

// Price options
const PRICE_OPTIONS = [
  { label: "Any Price" },
  { label: "Under ₹5,000" },
  { label: "₹5,000 – ₹10,000" },
  { label: "₹10,000 – ₹15,000" },
  { label: "₹15,000 – ₹25,000" },
  { label: "Above ₹25,000" },
];

interface PropertyHeroSectionProps {
  isMounted: boolean;
  cities?: any[];
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  searchArea: string;
  setSearchArea: (v: string) => void;
  selectedPriceKey: string;
  setSelectedPriceKey: (v: string) => void;
}

export default function PropertyHeroSection({
  isMounted,
  cities = [],
  selectedCity,
  setSelectedCity,
  searchArea,
  setSearchArea,
  selectedPriceKey,
  setSelectedPriceKey,
}: PropertyHeroSectionProps) {
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    const images = [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop'
    ];
    
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setBgImage(randomImage);
  }, []);

  return (
    <section className="relative overflow-hidden py-20">
      {/* Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${bgImage}')`,
          boxShadow: 'inset 0 0 0 1000px rgba(0,0,0,0.7)',
          backgroundBlendMode: 'overlay'
        }}
      />
      
      {/* Pattern Overlays */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 z-10" />
      
      {/* Decorative Gradient Blur Elements */}
      <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl opacity-30 z-15" />
      <div className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-cyan-300/20 to-blue-500/20 rounded-full blur-3xl opacity-30 z-15" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Content */}
          <div className="text-center mb-5">
            {/* Badge */}
            <div className="overflow-hidden mb-3">
              <Badge 
                className="bg-white/15 backdrop-blur-md border-white/30 text-white hover:text-white hover:bg-white/25 hover:border-white/40 px-4 py-1.5 text-xs transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                Premium PG Accommodations
              </Badge>
            </div>
            
            {/* Title */}
            <div className="overflow-hidden mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
                <span className="text-white">Find Your </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">
                  Perfect Space
                </span>
              </h1>
            </div>
            
            {/* Description */}
            <div className="overflow-hidden mb-3">
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl mx-auto">
                Discover premium accommodations with modern amenities and flexible pricing
              </p>
            </div>
          </div>

          {/* Filters Section - Updated layout */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl shadow-black/30 px-3 py-3">
              
              {/* Header */}
              <div className="flex items-center gap-1.5 mb-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-white/80" />
                <span className="text-white/80 text-[10px] font-semibold uppercase tracking-wide">
                  Find Your Space
                </span>
              </div>

              {/* Grid - Locality wider (col-span-2) */}
            {/* Grid - All 3 in One Row */}
<div className="grid grid-cols-3 gap-2">

  {/* City */}
  <div className="relative">
    <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
      <MapPin className="h-3 w-3 text-blue-300" />
    </div>
    <Select value={selectedCity || "pune"} onValueChange={setSelectedCity}>
      <SelectTrigger className="h-8 pl-7 pr-2 rounded-md bg-white/15 backdrop-blur-sm border border-white/30 text-white text-[11px] font-medium w-full [&>span]:text-white">
        <SelectValue>
          {selectedCity
            ? selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)
            : "Pune"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-lg shadow-2xl border border-blue-100 bg-white">
        <SelectItem value="pune" className="hover:bg-blue-50 text-[11px]">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-blue-500" />
            Pune
          </div>
        </SelectItem>
        {cities?.map(
          (city: any) =>
            city.name.toLowerCase() !== "pune" && (
              <SelectItem
                key={city.id}
                value={city.name.toLowerCase()}
                className="hover:bg-blue-50 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-blue-500" />
                  {city.name}
                </div>
              </SelectItem>
            )
        )}
      </SelectContent>
    </Select>
  </div>

  {/* Locality */}
  <div className="relative">
    <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
      <Search className="h-3 w-3 text-blue-300" />
    </div>
    <Input
      placeholder="Search by locality, area, or property name..."
      value={searchArea}
      onChange={(e) => setSearchArea(e.target.value)}
      className="h-8 pl-7 pr-7 rounded-md bg-white/10 backdrop-blur-sm border border-white/30 text-white text-[11px] font-medium w-full"
    />
  </div>

  {/* Price */}
  <div className="relative">
    <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
      <IndianRupee className="h-3 w-3 text-blue-300" />
    </div>
    <Select value={selectedPriceKey} onValueChange={setSelectedPriceKey}>
      <SelectTrigger className="h-8 pl-7 pr-2 rounded-md bg-white/15 backdrop-blur-sm border border-white/30 text-white text-[11px] font-medium w-full [&>span]:text-white">
        <SelectValue placeholder="Any Price" />
      </SelectTrigger>
      <SelectContent className="rounded-lg shadow-2xl border border-blue-100 bg-white">
        {PRICE_OPTIONS.map((p) => (
          <SelectItem
            key={p.label}
            value={p.label}
            className="hover:bg-blue-50 text-[11px] text-slate-700"
          >
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

</div>


              
              {/* Active Filters - Updated */}
              {(searchArea || selectedPriceKey !== "Any Price") && (
                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-white/20">
                  <span className="text-white/60 text-[9px] self-center">Active:</span>
                  {searchArea && (
                    <span className="inline-flex items-center gap-0.5 bg-blue-500/30 border border-blue-400/40 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                      "{searchArea}"
                      <button onClick={() => setSearchArea("")}><X className="h-2 w-2" /></button>
                    </span>
                  )}
                  {selectedPriceKey !== "Any Price" && (
                    <span className="inline-flex items-center gap-0.5 bg-amber-500/30 border border-amber-400/40 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                      {selectedPriceKey}
                      <button onClick={() => setSelectedPriceKey("Any Price")}><X className="h-2 w-2" /></button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}