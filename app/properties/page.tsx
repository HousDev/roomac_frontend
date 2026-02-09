// "use client";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { ArrowRight } from 'lucide-react';
// import { motion } from 'framer-motion';
//                  import { Phone, MessageCircle } from 'lucide-react';
//                  import { BsWhatsapp } from 'react-icons/bs';
// import { Star, Calendar } from 'lucide-react';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Slider } from "@/components/ui/slider";

// import {
//   Building2,
//   MapPin,
//   Filter,
//   X,
//   Bed,
//   Users,
//   ChevronRight,
//   Sparkles,
//   ChevronLeft,
// } from "lucide-react";

// import Link from "next/link";
// import { useEffect, useState } from "react";

// // ✅ DIRECT BACKEND API
// import { listProperties } from "@/lib/propertyApi";

// const API_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// export default function PropertiesPage() {
//   const [properties, setProperties] = useState<any[]>([]);
//   const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});

//   const [selectedCity, setSelectedCity] = useState("");
//   const [searchArea, setSearchArea] = useState("");
//   const [selectedType, setSelectedType] = useState("");
//   const [budgetRange, setBudgetRange] = useState<[number, number]>([
//     5000, 15000,
//   ]);
//   const [showFilters, setShowFilters] = useState(false);

//   // ================= LOAD ALL PROPERTIES =================
//   useEffect(() => {
//     loadProperties();
//   }, []);

//   const loadProperties = async () => {
//     setLoading(true);
//     try {
//       const res = await listProperties({ page: 1, pageSize: 100 });
//       console.log(res,"this is from properties");
//       if (res?.success && Array.isArray(res.data)) {
//         setProperties(res.data);
//         setFilteredProperties(res.data);

//         // Initialize image indices for each property
//         const initialIndices: { [key: string]: number } = {};
//         res.data.forEach((property: any) => {
//           initialIndices[property.id] = 0;
//         });
//         setCurrentImageIndex(initialIndices);
//       } else {
//         setProperties([]);
//         setFilteredProperties([]);
//       }
//     } catch (err) {
//       console.error("loadProperties error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= IMAGE CAROUSEL FUNCTIONS =================
//   const nextImage = (propertyId: string, totalImages: number, e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setCurrentImageIndex(prev => ({
//       ...prev,
//       [propertyId]: (prev[propertyId] + 1) % totalImages
//     }));
//   };

//   const prevImage = (propertyId: string, totalImages: number, e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setCurrentImageIndex(prev => ({
//       ...prev,
//       [propertyId]: (prev[propertyId] - 1 + totalImages) % totalImages
//     }));
//   };

//   // ================= APPLY FILTERS =================
//   useEffect(() => {
//     let filtered = [...properties];

//     if (selectedCity) {
//       filtered = filtered.filter(
//         (p) =>
//           p.city &&
//           p.city.toLowerCase().includes(selectedCity.toLowerCase())
//       );
//     }

//     if (searchArea) {
//       filtered = filtered.filter(
//         (p) =>
//           p.name?.toLowerCase().includes(searchArea.toLowerCase()) ||
//           p.area?.toLowerCase().includes(searchArea.toLowerCase())
//       );
//     }

//     if (selectedType) {
//       filtered = filtered.filter((p) => {
//         const price = Number(p.starting_price || 0);
//         if (selectedType === "single") return price >= 10000;
//         if (selectedType === "double") return price < 10000;
//         return true;
//       });
//     }

//     filtered = filtered.filter((p) => {
//       const price = Number(p.starting_price || 0);
//       return price >= budgetRange[0] && price <= budgetRange[1];
//     });

//     setFilteredProperties(filtered);
//   }, [properties, selectedCity, searchArea, selectedType, budgetRange]);

//   const clearFilters = () => {
//     setSelectedCity("");
//     setSearchArea("");
//     setSelectedType("");
//     setBudgetRange([5000, 15000]);
//   };

//   const activeFiltersCount =
//     [selectedCity, searchArea, selectedType].filter(Boolean).length +
//     (budgetRange[0] !== 5000 || budgetRange[1] !== 15000 ? 1 : 0);

//   // ================= UI =================
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white ">
//       {/* HERO - RESPONSIVE UPDATES */}
// <section className="relative overflow-hidden bg-blue-100 h-auto min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[450px] py-8 md:py-12 lg:py-16">
  
//   <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDRBQUQiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
  

//   <div className="absolute -top-10 -right-10 sm:-top-20 sm:-right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-xl sm:blur-2xl md:blur-3xl opacity-20 sm:opacity-25 md:opacity-30" />
//   <div className="absolute -bottom-10 -left-10 sm:-bottom-20 sm:-left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full blur-xl sm:blur-2xl md:blur-3xl opacity-25 sm:opacity-30 md:opacity-40" />
//   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-gradient-to-r from-blue-50 to-white rounded-full blur-xl sm:blur-2xl md:blur-3xl opacity-20 sm:opacity-25 md:opacity-30" />

//   <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
//     <div className="max-w-4xl mx-auto text-center px-2 sm:px-4">
      
//       <div className="mb-4 sm:mb-5 md:mb-6">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//         >
// <Badge className="bg-white hover:to-[#093876] text-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2 border-0 text-xs sm:text-sm hover:text-white">            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
//             Premium Accommodations
//           </Badge>
//         </motion.div>
//       </div>
      
      
//       <div className="mb-4 sm:mb-5 md:mb-6">
//         <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-tight sm:leading-tight md:leading-tight">
        
//           <div className="block text-slate-900 mb-1 sm:mb-1.5 md:mb-2">
//             {"Find Your Perfect".split("").map((char, index) => (
//               <motion.span
//                 key={index}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{
//                   duration: 0.3,
//                   delay: index * 0.05,
//                 }}
//                 className="inline-block"
//               >
//                 {char}
//               </motion.span>
//             ))}
//           </div>
          
          
//           <div className="block">
//             {"Home".split("").map((char, index) => (
//               <motion.span
//                 key={index}
//                 initial={{ opacity: 0, scale: 0.5 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{
//                   duration: 0.4,
//                   delay: 1.5 + (index * 0.1),
//                   type: "spring",
//                   stiffness: 100
//                 }}
//                 className="inline-block text-blue-800"
//                 style={{
//                   backgroundClip: 'text',
//                   WebkitBackgroundClip: 'text',
//                 }}
//               >
//                 {char}
//               </motion.span>
//             ))}
//           </div>
//         </h1>
//       </div>
      
//       {/* Description with fade up animation */}
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 2, duration: 0.8 }}
//       >
//         <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-800 mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-3xl mx-auto px-2 sm:px-4">
//           Discover premium PG accommodations with modern amenities, flexible pricing, and unmatched comfort across multiple locations
//         </p>
//       </motion.div>
      
      
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 2.5, duration: 0.6 }}
//         className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0"
//       >
//         <Button className="bg-gradient-to-r from-[#004AAD] to-blue-600 hover:from-blue-600 hover:to-[#004AAD] text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 text-sm sm:text-base md:text-lg w-full sm:w-auto">
//           Explore Properties
//         </Button>
//        <Button
//   variant="outline"
//   className="border-2 border-[#004AAD] text-[#004AAD] hover:bg-teal-300 hover:text-black hover:border-blue-900 hover:shadow-lg px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 text-sm sm:text-base md:text-lg w-full sm:w-auto mt-2 sm:mt-0 transition-all duration-300 hover:animate-pulse"
// >
//   Learn More
// </Button>
//       </motion.div>
//     </div>
//   </div>
  
  
//   <motion.div
//     className="absolute top-1/4 left-1/4 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-cyan-400 rounded-full"
//     animate={{
//       y: [0, -10, 0],
      
//       scale: [1, 1.2, 1],
//     }}
//     transition={{
//       duration: 3,
//       repeat: Infinity,
//       ease: "easeInOut"
//     }}
//   />
//   <motion.div
//     className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-blue-400 rounded-full"
//     animate={{
//       y: [0, 8, 0],
//       scale: [1, 1.3, 1],
//     }}
//     transition={{
//       duration: 2.5,
//       repeat: Infinity,
//       ease: "easeInOut",
//       delay: 0.5
//     }}
//   />
//   <motion.div
//     className="absolute top-1/3 right-1/3 w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-[#004AAD] rounded-full"
//     animate={{
//       y: [0, -8, 0],
//       x: [0, 5, 0],
//     }}
//     transition={{
//       duration: 4,
//       repeat: Infinity,
//       ease: "easeInOut",
//       delay: 1
//     }}
//   />
//   <motion.div
//     className="absolute top-[10%] left-[10%] w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-cyan-400 rounded-full"
//     animate={{
//       y: [0, -20, 0],
//       scale: [1, 1.3, 1],
//     }}
//     transition={{
//       duration: 4,
//       repeat: Infinity,
//       ease: "easeInOut"
//     }}
//   />
  
// </section>

      
//     <div className="container mx-auto px-3 sm:px-4 md:px-4 -mt-6 sm:-mt-7 md:-mt-8 relative z-10 mb-8 sm:mb-10 md:mb-12">
//   <Card className="shadow-3xl animate-slide-in-left">
//     <CardContent className="p-4 sm:p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
    
//       <div className="animate-fade-in-up animation-delay-300">
//         <Input
//           placeholder="City"
//           value={selectedCity}
//           onChange={(e) => setSelectedCity(e.target.value)}
//           className="h-10 sm:h-11 md:h-12 text-sm sm:text-base transition-all duration-300 hover:scale-[1.01] hover:border-blue-300 focus:scale-[1.02]"
//         />
//       </div>

      
//       <div className="animate-fade-in-up animation-delay-400">
//         <Input
//           placeholder="Search name or area"
//           value={searchArea}
//           onChange={(e) => setSearchArea(e.target.value)}
//           className="h-10 sm:h-11 md:h-12 text-sm sm:text-base transition-all duration-300 hover:scale-[1.01] hover:border-blue-300 focus:scale-[1.02]"
//         />
//       </div>

//       <div className="animate-fade-in-up animation-delay-500">
//         <Select value={selectedType} onValueChange={setSelectedType}>
//           <SelectTrigger className="h-10 sm:h-11 md:h-12 text-sm sm:text-base transition-all duration-300 hover:scale-[1.01] hover:border-blue-300">
//             <SelectValue placeholder="All Types" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="single" className="text-sm sm:text-base">Single Sharing</SelectItem>
//             <SelectItem value="double" className="text-sm sm:text-base">Double Sharing</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="flex gap-2 animate-fade-in-up animation-delay-600">
//         <Button
//           variant={showFilters ? "default" : "outline"}
//           onClick={() => setShowFilters(!showFilters)}
//           className="gap-1 sm:gap-2 h-10 sm:h-11 md:h-12 flex-1 text-xs sm:text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95"
//         >
//           <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
//           Budget
//           {activeFiltersCount > 0 && (
//             <Badge className="ml-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-xs animate-bounce">
//               {activeFiltersCount}
//             </Badge>
//           )}
//         </Button>
//         {activeFiltersCount > 0 && (
//           <Button
//             variant="ghost"
//             onClick={clearFilters}
//             className="h-10 sm:h-11 md:h-12 transition-all duration-300 hover:scale-110 hover:bg-red-50 hover:text-red-500"
//           >
//             <X className="h-3 w-3 sm:h-4 sm:w-4" />
//           </Button>
//         )}
//       </div>

//       {showFilters && (
//         <div className="col-span-1 sm:col-span-2 md:col-span-4 mt-3 sm:mt-4 animate-fade-in-up animation-delay-200">
//           <p className="mb-2 text-xs sm:text-sm">
//             Budget ₹{budgetRange[0]} - ₹{budgetRange[1]}
//           </p>
//           <Slider
//             value={budgetRange}
//             onValueChange={(v) =>
//               setBudgetRange([v[0], v[1]])
//             }
//             min={5000}
//             max={15000}
//             step={500}
//             className="h-2 sm:h-3"
//           />
//         </div>
//       )}
//     </CardContent>
//   </Card>
// </div>
//       {/* LIST */}
//       <div className="container mx-auto px-3 sm:px-4 md:px-4 pb-12 sm:pb-16 md:pb-20">
//   {loading ? (
//     <p className="text-center py-12 sm:py-16 md:py-20 text-sm sm:text-base">Loading...</p>
//   ) : (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
//       {filteredProperties.map((property) => {
//         const currentIndex = currentImageIndex[property.id] || 0;
//         const images = property.photo_urls || [];
//         const totalImages = images.length;

//               return (
//                 <Card
//   key={property.id}
//   className="shadow-lg sm:shadow-xl overflow-hidden group hover:shadow-[0_4px_0_0_rgba(250,204,21,1)] transition-shadow duration-300"
// >
//   {/* IMAGE GALLERY */}
//   <div className="h-48 sm:h-52 md:h-56 lg:h-60 bg-slate-200 relative overflow-hidden">
//     {totalImages > 0 ? (
//       <>
//         <img
//           src={`${API_URL}${images[currentIndex]}`}
//           alt={`${property.name} - Image ${currentIndex + 1}`}
//           className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//         />
//         {/* IMAGE DOTS INDICATOR */}
//         {totalImages > 1 && (
//           <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
//             {images.map((_: any, index: number) => (
//               <button
//                 key={index}
//                 onClick={(e) => {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   setCurrentImageIndex(prev => ({
//                     ...prev,
//                     [property.id]: index
//                   }));
//                 }}
//                 className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${index === currentIndex
//                   ? 'bg-white w-3 sm:w-4'
//                   : 'bg-white/50 hover:bg-white/80'
//                   }`}
//               />
//             ))}
//           </div>
//         )}
//       </>
//     ) : (
//       <div className="h-full flex items-center justify-center">
//         <Building2 className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-slate-400" />
//       </div>
//     )}
//   </div>

//   <CardContent className="p-4 sm:p-5 md:p-6 relative overflow-hidden group">
//     {/* Animated wave background overlay */}
//     <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-blue-2100 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out scale-150 group-hover:scale-100 rotate-12 group-hover:rotate-0"></div>
    
//     {/* Content with relative positioning to stay above background */}
//     <div className="relative z-10">
//       <h3 className="text-lg sm:text-xl font-bold transition-colors duration-300 group-hover:text-blue-700">{property.name}</h3>
//       <p className="flex items-center gap-1 text-slate-600 mt-1 text-sm sm:text-base">
//         <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
//         {property.area}
//       </p>

//       <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
//         <div className="flex items-center gap-2">
//           <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
//             <Users className="h-4 w-4 text-blue-600" />
//           </div>
//           <div>
//             <p className="text-sm font-semibold text-slate-800">{property.total_rooms}</p>
//             <p className="text-xs text-slate-500">Rooms</p>
//           </div>
//         </div>
        
//         <div className="w-px h-6 bg-slate-200"></div>
        
//         <div className="flex items-center gap-2">
//           <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-100 group-hover:scale-110 transition-all duration-300">
//             <Bed className="h-4 w-4 text-green-600" />
//           </div>
//           <div>
//             <p className="text-sm font-semibold text-slate-800">{property.total_beds}</p>
//             <p className="text-xs text-slate-500">Beds</p>
//           </div>
//         </div>
//       </div>
      
//       {((Array.isArray(property.amenities) &&
//         property.amenities.length > 0) ||
//         (Array.isArray(property.services) &&
//           property.services.length > 0)) && (
//           <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
//             {Array.isArray(property.amenities) &&
//               property.amenities.length > 0 &&
//               property.amenities.slice(0, 3).map(
//                 (item: string, index: number) => {
//                   const getColorClass = (amenity: string) => {
//                     const amenityLower = amenity.toLowerCase();
//                     if (amenityLower.includes('wifi') || amenityLower.includes('wi-fi')) {
//                       return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:border-blue-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                     }
//                     if (amenityLower.includes('ac') || amenityLower.includes('air')) {
//                       return 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100 hover:border-cyan-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                     }
//                     if (amenityLower.includes('food') || amenityLower.includes('meal')) {
//                       return 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100 hover:border-orange-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                     }
//                     if (amenityLower.includes('parking')) {
//                       return 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                     }
//                     if (amenityLower.includes('housekeeping') || amenityLower.includes('cleaning')) {
//                       return 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100 hover:border-purple-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                     }
//                     if (amenityLower.includes('tv') || amenityLower.includes('television')) {
//                       return 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100 hover:border-red-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                     }
//                     if (amenityLower.includes('security') || amenityLower.includes('cctv')) {
//                       return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                     }
//                     if (amenityLower.includes('water') || amenityLower.includes('hot water')) {
//                       return 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100 hover:border-sky-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                     }
//                     if (amenityLower.includes('laundry')) {
//                       return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 hover:border-amber-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                     }
//                     return 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100 hover:border-slate-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                   };
                  
//                   {/* TAGS ADDED HERE - Image के ऊपर */}
//                   <div className="absolute top-3 left-3 flex flex-wrap gap-1">
//                     <div className="bg-yellow-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
//                       <span className="text-[10px]">✓</span>
//                       <span>Availability</span>
//                     </div>
//                     <div className="bg-green-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
//                       <span className="text-[10px]">🆕</span>
//                       <span>New Listing</span>
//                     </div>
//                     <div className="bg-purple-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
//                       <span className="text-[10px]">👑</span>
//                       <span>Premium</span>
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <div className="h-full flex items-center justify-center">
//                   <Building2 className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-slate-400" />
//                 </div>
//               )}
//             </div>

//             <CardContent className="p-4 sm:p-5 md:p-6 relative overflow-hidden group">
//               {/* Animated wave background overlay */}
//               <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-blue-2100 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out scale-150 group-hover:scale-100 rotate-12 group-hover:rotate-0"></div>
              
//               {/* Content with relative positioning to stay above background */}
//               <div className="relative z-10">
//                 <h3 className="text-lg sm:text-xl font-bold transition-colors duration-300 group-hover:text-blue-700">{property.name}</h3>
//                 {/* PRICE को यहाँ लाया है - location के नीचे */}
//                 <div className="flex justify-between items-center mt-1 mb-2">
//                   <p className="flex items-center gap-1 text-slate-600 text-sm sm:text-base">
//                     <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
//                     {property.area}
//                   </p>
//                   <p className="text-xl sm:text-2xl font-bold text-[#004AAD] group-hover:scale-110 transition-transform duration-300">
//                     ₹{property.starting_price}
//                   </p>
//                 </div>

//                 <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
//                   <div className="flex items-center gap-2">
//                     <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
//                       <Users className="h-4 w-4 text-blue-600" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-semibold text-slate-800">{property.total_rooms}</p>
//                       <p className="text-xs text-slate-500">Rooms</p>
//                     </div>
//                   </div>
                  
//                   <div className="w-px h-6 bg-slate-200"></div>
                  
//                   <div className="flex items-center gap-2">
//                     <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-100 group-hover:scale-110 transition-all duration-300">
//                       <Bed className="h-4 w-4 text-green-600" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-semibold text-slate-800">{property.total_beds}</p>
//                       <p className="text-xs text-slate-500">Beds</p>
//                     </div>
//                   </div>
//                 </div>
                
//                 {((Array.isArray(property.amenities) &&
//                   property.amenities.length > 0) ||
//                   (Array.isArray(property.services) &&
//                     property.services.length > 0)) && (
//                     <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
//                       {Array.isArray(property.amenities) &&
//                         property.amenities.length > 0 &&
//                         property.amenities.slice(0, 3).map(
//                           (item: string, index: number) => {
//                             const getColorClass = (amenity: string) => {
//                               const amenityLower = amenity.toLowerCase();
//                               if (amenityLower.includes('wifi') || amenityLower.includes('wi-fi')) {
//                                 return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:border-blue-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                               }
//                               if (amenityLower.includes('ac') || amenityLower.includes('air')) {
//                                 return 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100 hover:border-cyan-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                               }
//                               if (amenityLower.includes('food') || amenityLower.includes('meal')) {
//                                 return 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100 hover:border-orange-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                               }
//                               if (amenityLower.includes('parking')) {
//                                 return 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                               }
//                               if (amenityLower.includes('housekeeping') || amenityLower.includes('cleaning')) {
//                                 return 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100 hover:border-purple-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                               }
//                               if (amenityLower.includes('tv') || amenityLower.includes('television')) {
//                                 return 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100 hover:border-red-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                               }
//                               if (amenityLower.includes('security') || amenityLower.includes('cctv')) {
//                                 return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                               }
//                               if (amenityLower.includes('water') || amenityLower.includes('hot water')) {
//                                 return 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100 hover:border-sky-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                               }
//                               if (amenityLower.includes('laundry')) {
//                                 return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 hover:border-amber-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                               }
//                               return 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100 hover:border-slate-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1';
//                             };
                            
//                             const colorClasses = getColorClass(item);
                            
//                             return (
//                               <span
//                                 key={`amenity-${index}`}
//                                 className={`px-2 py-1 rounded-md border text-xs ${colorClasses} transition-all duration-300`}
//                               >
//                                 {item}
//                               </span>
//                             );
//                           }
//                         )}

//                       {Array.isArray(property.services) &&
//                         property.services.length > 0 &&
//                         property.services.slice(0, 2).map(
//                           (item: string, index: number) => (
//                             <span
//                               key={`service-${index}`}
//                               className="px-2 py-1 rounded-md border text-xs bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300"
//                             >
//                               {item}
//                             </span>
//                           )
//                         )}

//                       {(property.amenities?.length > 3 || property.services?.length > 2) && (
//                         <span className="px-2 py-1 rounded-md border text-xs bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:border-slate-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300">
//                           +{Math.max(
//                             (property.amenities?.length || 0) - 3,
//                             (property.services?.length || 0) - 2,
//                             0
//                           )}
//                         </span>
//                       )}
//                     </div>
//                   )}
//                   <div className="flex items-center justify-between mt-2 mb-3">
//   {/* Rating Stars */}
//   <div className="flex items-center gap-1.5">
//     <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md">
//       <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
//       <span className="ml-1 text-sm font-bold text-gray-800">
//         {property.rating || 4.5}
//       </span>
//     </div>
    
//     {/* Review count */}
//     <span className="text-xs text-gray-600">
//       ({property.review_count || 18} reviews)
//     </span>
//   </div>
  
//   {/* Date */}
//   <div className="flex items-center gap-1 text-gray-500 text-xs">
//     <Calendar className="h-3 w-3" />
//     <span>
//       {property.created_at 
//         ? new Date(property.created_at).toLocaleDateString('en-IN')
//         : '2025-11-20'
//       }
//     </span>
//   </div>
// </div>

//                 <div className="flex justify-between items-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
//                   {/* Price की जगह WhatsApp और Call icons */}


// <div className="flex gap-3">
//   {/* Call Button - Phone icon */}
//   <button 
//     onClick={() => window.location.href = `tel:${property.phone || '1234567890'}`}
//     className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 hover:scale-110 transition-all duration-300 flex items-center justify-center"
//     title="Call"
//   >
//     <Phone className="h-4 w-4" />
//   </button>
  
//   {/* WhatsApp Button - MessageCircle icon */}
//   <button 
//     onClick={() => window.open(`https://wa.me/${property.whatsapp || '911234567890'}?text=Hi, I'm interested in ${property.name}`, '_blank')}
//     className="bg-[#d5f8e6] text-white p-2 rounded-lg hover:bg-white hover:scale-110 transition-all duration-300 flex items-center justify-center"
//     title="WhatsApp"
//   >
//         <BsWhatsapp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
//   </button>
// </div>
//                   <Link href={`/properties/${property.slug}`}>
//                     <Button className="h-8 sm:h-9 md:h-10 px-3 sm:px-4 text-xs sm:text-sm group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
//                       View
//                       <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
//                     </Button>
//                   </Link>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         );
//       })}
//     </div>
//   )}
// </div>
//     </div>
//   );
// }


// // "use client";

// // import { useState } from 'react';
// // import { ImageGallery } from '../components/ImageGallery';
// // import { PropertyHeader } from '../components/PropertyHeader';
// // import { PropertyDescription } from '../components/PropertyDescription';
// // import { AvailableRooms } from '../components/AvailableRooms';
// // import { Amenities } from '../components/Amenities';
// // import { OffersSection } from '../components/OffersSection';
// // import { TermsConditions } from '../components/TermsConditions';
// // import { Location } from '../components/Location';
// // import { PropertyManager } from '../components/PropertyManager';
// // import { PricingPlans } from '../components/PricingPlans';
// // import { BookingModal } from '../components/BookingModal';
// // import { Reviews } from '../components/Reviews';
// // import { propertyData } from '../data/propertyData';

// // export default function PropertyPage() {
// //   const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

// //   const handleBookNow = () => {
// //     setIsBookingModalOpen(true);
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
// //       <div className="max-w-[1800px] mx-auto p-4 md:p-6">
// //         <div className="mb-6 animate-slideUp">
// //           <PropertyHeader
// //             name={propertyData.name}
// //             location={propertyData.location}
// //             tags={propertyData.tags}
// //             startingPrice={Math.min(...propertyData.rooms.map(r => r.price))}
// //             securityDeposit={propertyData.securityDeposit}
// //             offers={propertyData.offers}
// //           />
// //         </div>

// //         <div className="grid lg:grid-cols-[1fr,400px] gap-6">
// //           <div className="space-y-6 animate-fadeIn">
// //             <ImageGallery
// //               images={propertyData.images}
// //               propertyName={propertyData.name}
// //               stats={{
// //                 views: propertyData.activity.totalViews,
// //                 saved: propertyData.activity.shortlistedBy,
// //                 contacted: propertyData.activity.contactRequests.count
// //               }}
// //             />

// //             <PropertyDescription
// //               description={propertyData.description}
// //               highlights={propertyData.highlights}
// //             />

// //             <AvailableRooms
// //               rooms={propertyData.rooms}
// //               onBookRoom={handleBookNow}
// //               securityDeposit={propertyData.securityDeposit}
// //             />

// //             <Amenities amenities={propertyData.amenities} />

// //             <Location
// //               address={propertyData.address}
// //               coordinates={propertyData.coordinates}
// //               nearbyPlaces={propertyData.nearbyPlaces}
// //             />

// //             {propertyData.reviews && propertyData.averageRating && propertyData.totalReviews && (
// //               <Reviews
// //                 reviews={propertyData.reviews}
// //                 averageRating={propertyData.averageRating}
// //                 totalReviews={propertyData.totalReviews}
// //               />
// //             )}
// //           </div>

// //           <div className="lg:sticky lg:top-6 lg:self-start space-y-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
// //             <PropertyManager manager={propertyData.manager} />

// //             <OffersSection offers={propertyData.offers} />

// //             <PricingPlans plans={propertyData.pricingPlans} onSelectPlan={handleBookNow} />

// //             <TermsConditions terms={propertyData.termsAndConditions} />
// //           </div>
// //         </div>
// //       </div>

// //       <BookingModal
// //         isOpen={isBookingModalOpen}
// //         onClose={() => setIsBookingModalOpen(false)}
// //         rooms={propertyData.rooms}
// //         plans={propertyData.pricingPlans}
// //         securityDeposit={propertyData.securityDeposit}
// //         propertyName={propertyData.name}
// //       />
// //     </div>
// //   );
// // }
  















//  "use client";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { ArrowRight } from 'lucide-react';
// import { motion } from 'framer-motion';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Slider } from "@/components/ui/slider";

// import {
//   Building2,
//   MapPin,
//   Filter,
//   X,
//   Bed,
//   Users,
//   ChevronRight,
//   Sparkles,
//   Bath,
// } from "lucide-react";

// import Link from "next/link";
// import { useEffect, useState } from "react";

// // ✅ DIRECT BACKEND API
// import { listProperties } from "@/lib/propertyApi";

// const API_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// export default function PropertiesPage() {
//   const [properties, setProperties] = useState<any[]>([]);
//   const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});

//   const [selectedCity, setSelectedCity] = useState("");
//   const [searchArea, setSearchArea] = useState("");
//   const [selectedType, setSelectedType] = useState("");
//   const [budgetRange, setBudgetRange] = useState<[number, number]>([
//     5000, 15000,
//   ]);
//   const [showFilters, setShowFilters] = useState(false);

//   // ================= LOAD ALL PROPERTIES =================
//   useEffect(() => {
//     loadProperties();
//   }, []);

//   const loadProperties = async () => {
//     setLoading(true);
//     try {
//       const res = await listProperties({ page: 1, pageSize: 100 });
//       console.log(res, "this is from properties");
//       if (res?.success && Array.isArray(res.data)) {
//         setProperties(res.data);
//         setFilteredProperties(res.data);

//         // Initialize image indices for each property
//         const initialIndices: { [key: string]: number } = {};
//         res.data.forEach((property: any) => {
//           initialIndices[property.id] = 0;
//         });
//         setCurrentImageIndex(initialIndices);
//       } else {
//         setProperties([]);
//         setFilteredProperties([]);
//       }
//     } catch (err) {
//       console.error("loadProperties error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= IMAGE CAROUSEL FUNCTIONS =================
//   const nextImage = (propertyId: string, totalImages: number, e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setCurrentImageIndex(prev => ({
//       ...prev,
//       [propertyId]: (prev[propertyId] + 1) % totalImages
//     }));
//   };

//   const prevImage = (propertyId: string, totalImages: number, e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setCurrentImageIndex(prev => ({
//       ...prev,
//       [propertyId]: (prev[propertyId] - 1 + totalImages) % totalImages
//     }));
//   };

//   // ================= APPLY FILTERS =================
//   useEffect(() => {
//     let filtered = [...properties];

//     if (selectedCity) {
//       filtered = filtered.filter(
//         (p) =>
//           p.city &&
//           p.city.toLowerCase().includes(selectedCity.toLowerCase())
//       );
//     }

//     if (searchArea) {
//       filtered = filtered.filter(
//         (p) =>
//           p.name?.toLowerCase().includes(searchArea.toLowerCase()) ||
//           p.area?.toLowerCase().includes(searchArea.toLowerCase())
//       );
//     }

//     if (selectedType) {
//       filtered = filtered.filter((p) => {
//         const price = Number(p.starting_price || 0);
//         if (selectedType === "single") return price >= 10000;
//         if (selectedType === "double") return price < 10000;
//         return true;
//       });
//     }

//     filtered = filtered.filter((p) => {
//       const price = Number(p.starting_price || 0);
//       return price >= budgetRange[0] && price <= budgetRange[1];
//     });

//     setFilteredProperties(filtered);
//   }, [properties, selectedCity, searchArea, selectedType, budgetRange]);

//   const clearFilters = () => {
//     setSelectedCity("");
//     setSearchArea("");
//     setSelectedType("");
//     setBudgetRange([5000, 15000]);
//   };

//   const activeFiltersCount =
//     [selectedCity, searchArea, selectedType].filter(Boolean).length +
//     (budgetRange[0] !== 5000 || budgetRange[1] !== 15000 ? 1 : 0);

//   // ================= UI =================
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white ">
//       {/* HERO - RESPONSIVE UPDATES */}
//       <section className="relative overflow-hidden bg-blue-100 h-auto min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[450px] py-8 md:py-12 lg:py-16">
  
//         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDRBQUQiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
  

//         <div className="absolute -top-10 -right-10 sm:-top-20 sm:-right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-xl sm:blur-2xl md:blur-3xl opacity-20 sm:opacity-25 md:opacity-30" />
//         <div className="absolute -bottom-10 -left-10 sm:-bottom-20 sm:-left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full blur-xl sm:blur-2xl md:blur-3xl opacity-25 sm:opacity-30 md:opacity-40" />
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-gradient-to-r from-blue-50 to-white rounded-full blur-xl sm:blur-2xl md:blur-3xl opacity-20 sm:opacity-25 md:opacity-30" />

//         <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
//           <div className="max-w-4xl mx-auto text-center px-2 sm:px-4">
      
//             <div className="mb-4 sm:mb-5 md:mb-6">
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6 }}
//               >
//                 <Badge className="bg-white hover:to-[#093876] text-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2 border-0 text-xs sm:text-sm hover:text-white">
//                   <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
//                   Premium Accommodations
//                 </Badge>
//               </motion.div>
//             </div>
      
      
//             <div className="mb-4 sm:mb-5 md:mb-6">
//               <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-tight sm:leading-tight md:leading-tight">
        
//                 <div className="block text-slate-900 mb-1 sm:mb-1.5 md:mb-2">
//                   {"Find Your Perfect".split("").map((char, index) => (
//                     <motion.span
//                       key={index}
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{
//                         duration: 0.3,
//                         delay: index * 0.05,
//                       }}
//                       className="inline-block"
//                     >
//                       {char}
//                     </motion.span>
//                   ))}
//                 </div>
          
          
//                 <div className="block">
//                   {"Home".split("").map((char, index) => (
//                     <motion.span
//                       key={index}
//                       initial={{ opacity: 0, scale: 0.5 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{
//                         duration: 0.4,
//                         delay: 1.5 + (index * 0.1),
//                         type: "spring",
//                         stiffness: 100
//                       }}
//                       className="inline-block text-blue-800"
//                       style={{
//                         backgroundClip: 'text',
//                         WebkitBackgroundClip: 'text',
//                       }}
//                     >
//                       {char}
//                     </motion.span>
//                   ))}
//                 </div>
//               </h1>
//             </div>
      
//             {/* Description with fade up animation */}
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 2, duration: 0.8 }}
//             >
//               <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-800 mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-3xl mx-auto px-2 sm:px-4">
//                 Discover premium PG accommodations with modern amenities, flexible pricing, and unmatched comfort across multiple locations
//               </p>
//             </motion.div>
      
      
//             <motion.div
//               initial={{ opacity: 0, y: 40 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 2.5, duration: 0.6 }}
//               className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0"
//             >
//               <Button className="bg-gradient-to-r from-[#004AAD] to-blue-600 hover:from-blue-600 hover:to-[#004AAD] text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 text-sm sm:text-base md:text-lg w-full sm:w-auto">
//                 Explore Properties
//               </Button>
//               <Button
//                 variant="outline"
//                 className="border-2 border-[#004AAD] text-[#004AAD] hover:bg-teal-300 hover:text-black hover:border-blue-900 hover:shadow-lg px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 text-sm sm:text-base md:text-lg w-full sm:w-auto mt-2 sm:mt-0 transition-all duration-300 hover:animate-pulse"
//               >
//                 Learn More
//               </Button>
//             </motion.div>
//           </div>
//         </div>
  
  
//         <motion.div
//           className="absolute top-1/4 left-1/4 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-cyan-400 rounded-full"
//           animate={{
//             y: [0, -10, 0],
//             scale: [1, 1.2, 1],
//           }}
//           transition={{
//             duration: 3,
//             repeat: Infinity,
//             ease: "easeInOut"
//           }}
//         />
//         <motion.div
//           className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-blue-400 rounded-full"
//           animate={{
//             y: [0, 8, 0],
//             scale: [1, 1.3, 1],
//           }}
//           transition={{
//             duration: 2.5,
//             repeat: Infinity,
//             ease: "easeInOut",
//             delay: 0.5
//           }}
//         />
//         <motion.div
//           className="absolute top-1/3 right-1/3 w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-[#004AAD] rounded-full"
//           animate={{
//             y: [0, -8, 0],
//             x: [0, 5, 0],
//           }}
//           transition={{
//             duration: 4,
//             repeat: Infinity,
//             ease: "easeInOut",
//             delay: 1
//           }}
//         />
//         <motion.div
//           className="absolute top-[10%] left-[10%] w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-cyan-400 rounded-full"
//           animate={{
//             y: [0, -20, 0],
//             scale: [1, 1.3, 1],
//           }}
//           transition={{
//             duration: 4,
//             repeat: Infinity,
//             ease: "easeInOut"
//           }}
//         />
  
//       </section>

      
//       <div className="container mx-auto px-3 sm:px-4 md:px-4 -mt-6 sm:-mt-7 md:-mt-8 relative z-10 mb-8 sm:mb-10 md:mb-12">
//         <Card className="shadow-3xl animate-slide-in-left">
//           <CardContent className="p-4 sm:p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
    
//             <div className="animate-fade-in-up animation-delay-300">
//               <Input
//                 placeholder="City"
//                 value={selectedCity}
//                 onChange={(e) => setSelectedCity(e.target.value)}
//                 className="h-10 sm:h-11 md:h-12 text-sm sm:text-base transition-all duration-300 hover:scale-[1.01] hover:border-blue-300 focus:scale-[1.02]"
//               />
//             </div>

      
//             <div className="animate-fade-in-up animation-delay-400">
//               <Input
//                 placeholder="Search name or area"
//                 value={searchArea}
//                 onChange={(e) => setSearchArea(e.target.value)}
//                 className="h-10 sm:h-11 md:h-12 text-sm sm:text-base transition-all duration-300 hover:scale-[1.01] hover:border-blue-300 focus:scale-[1.02]"
//               />
//             </div>

//             <div className="animate-fade-in-up animation-delay-500">
//               <Select value={selectedType} onValueChange={setSelectedType}>
//                 <SelectTrigger className="h-10 sm:h-11 md:h-12 text-sm sm:text-base transition-all duration-300 hover:scale-[1.01] hover:border-blue-300">
//                   <SelectValue placeholder="All Types" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="single" className="text-sm sm:text-base">Single Sharing</SelectItem>
//                   <SelectItem value="double" className="text-sm sm:text-base">Double Sharing</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex gap-2 animate-fade-in-up animation-delay-600">
//               <Button
//                 variant={showFilters ? "default" : "outline"}
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="gap-1 sm:gap-2 h-10 sm:h-11 md:h-12 flex-1 text-xs sm:text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95"
//               >
//                 <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
//                 Budget
//                 {activeFiltersCount > 0 && (
//                   <Badge className="ml-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-xs animate-bounce">
//                     {activeFiltersCount}
//                   </Badge>
//                 )}
//               </Button>
//               {activeFiltersCount > 0 && (
//                 <Button
//                   variant="ghost"
//                   onClick={clearFilters}
//                   className="h-10 sm:h-11 md:h-12 transition-all duration-300 hover:scale-110 hover:bg-red-50 hover:text-red-500"
//                 >
//                   <X className="h-3 w-3 sm:h-4 sm:w-4" />
//                 </Button>
//               )}
//             </div>

//             {showFilters && (
//               <div className="col-span-1 sm:col-span-2 md:col-span-4 mt-3 sm:mt-4 animate-fade-in-up animation-delay-200">
//                 <p className="mb-2 text-xs sm:text-sm">
//                   Budget ₹{budgetRange[0]} - ₹{budgetRange[1]}
//                 </p>
//                 <Slider
//                   value={budgetRange}
//                   onValueChange={(v) =>
//                     setBudgetRange([v[0], v[1]])
//                   }
//                   min={5000}
//                   max={15000}
//                   step={500}
//                   className="h-2 sm:h-3"
//                 />
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
      
//       {/* PROPERTY LIST */}
//       <div className="container mx-auto px-3 sm:px-4 md:px-4 pb-12 sm:pb-16 md:pb-20">
//         {loading ? (
//           <p className="text-center py-12 sm:py-16 md:py-20 text-sm sm:text-base">Loading...</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
//             {filteredProperties.map((property) => {
//               const currentIndex = currentImageIndex[property.id] || 0;
//               const images = property.photo_urls || [];
//               const totalImages = images.length;

//               // Get tags from property or use defaults if not available
//               const propertyTags = Array.isArray(property.tags) && property.tags.length > 0 
//                 ? property.tags 
//                 : [  "featured", 
//           "new listing", 
//           "premium", 
//           "budget", 
//            ''];

//               // Function to determine tag color
//               const getTagColor = (tagText: string) => {
//                 const lowerTag = tagText.toLowerCase();
//                 if (lowerTag.includes('new') || lowerTag.includes('latest')) {
//                   return 'bg-blue-500 text-white';
//                 } else if (lowerTag.includes('premium') || lowerTag.includes('luxury')) {
//                   return 'bg-yellow-500 text-black';
//                 } else if (lowerTag.includes('available') || lowerTag.includes('vacant')) {
//                   return 'bg-green-500 text-white';
//                 } else if (lowerTag.includes('discount') || lowerTag.includes('offer')) {
//                   return 'bg-red-500 text-white';
//                 } else if (lowerTag.includes('verified') || lowerTag.includes('trusted')) {
//                   return 'bg-purple-500 text-white';
//                 } else if (lowerTag.includes('furnished')) {
//                   return 'bg-indigo-500 text-white';
//                 } else if (lowerTag.includes('single')) {
//                   return 'bg-teal-500 text-white';
//                 } else if (lowerTag.includes('double') || lowerTag.includes('shared')) {
//                   return 'bg-orange-500 text-white';
//                 } else if (lowerTag.includes('ac') || lowerTag.includes('air conditioned')) {
//                   return 'bg-cyan-500 text-white';
//                 } else if (lowerTag.includes('food') || lowerTag.includes('meal')) {
//                   return 'bg-pink-500 text-white';
//                 } else {
//                   return 'bg-gray-700 text-white';
//                 }
//               };

//               return (
//                 <Card
//                   key={property.id}
//                   className="shadow-lg sm:shadow-xl overflow-hidden group hover:shadow-[0_4px_0_0_rgba(250,204,21,1)] transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02]"
//                   onClick={() => {
//                     window.location.href = `/properties/${property.slug || property.id || "#"}`;
//                   }}
//                 >
//                   {/* IMAGE GALLERY */}
//                   <div className="h-48 sm:h-52 md:h-56 lg:h-60 bg-slate-200 relative overflow-hidden">
//                     {totalImages > 0 ? (
//                       <>
//                         {/* TAGS FROM API - TOP LEFT */}
//                         <div className="absolute top-2 left-2 z-10 flex gap-1 flex-wrap">
//                           {propertyTags.slice(0, 3).map((tag: string, index: number) => (
//                             <div
//                               key={`${property.id}-tag-${index}`}
//                               className={`text-xs font-bold px-2 py-1 rounded shadow-md ${getTagColor(tag)}`}
//                             >
//                               {tag.length > 12 ? tag.substring(0, 12) + '...' : tag}
//                             </div>
//                           ))}
                          
//                           {/* Show "+X more" if there are more tags */}
//                           {propertyTags.length > 3 && (
//                             <div className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
//                               +{propertyTags.length - 3}
//                             </div>
//                           )}
//                         </div>
        
//                         <img
//                           src={`${API_URL}${images[currentIndex]}`}
//                           alt={`${property.name} - Image ${currentIndex + 1}`}
//                           className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                         />
                        
//                         {/* IMAGE DOTS INDICATOR */}
//                         {totalImages > 1 && (
//                           <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
//                             {images.map((_: any, index: number) => (
//                               <button
//                                 key={index}
//                                 onClick={(e) => {
//                                   e.preventDefault();
//                                   e.stopPropagation();
//                                   setCurrentImageIndex(prev => ({
//                                     ...prev,
//                                     [property.id]: index
//                                   }));
//                                 }}
//                                 className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${index === currentIndex
//                                   ? 'bg-white w-3 sm:w-4'
//                                   : 'bg-white/50 hover:bg-white/80'
//                                   }`}
//                               />
//                             ))}
//                           </div>
//                         )}
//                       </>
//                     ) : (
//                       <div className="h-full flex items-center justify-center">
//                         <Building2 className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-slate-400" />
//                       </div>
//                     )}
//                   </div>

//                   <CardContent className="p-4 sm:p-5 md:p-6 relative overflow-hidden group">
//                     {/* Animated wave background overlay */}
//                     <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-blue-100 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out scale-150 group-hover:scale-100 rotate-12 group-hover:rotate-0"></div>
                    
//                     {/* Content with relative positioning to stay above background */}
//                     <div className="relative z-10">
//                       {/* Title and Price in same line */}
//                       <div className="flex justify-between items-start mb-3">
//                         <div className="flex-1 min-w-0 mr-4">
//                           <h3 className="text-lg sm:text-xl font-bold transition-colors duration-300 group-hover:text-blue-700 line-clamp-1">
//                             {property.name || property.property_name || "Property Name"}
//                           </h3>
                          
//                           {/* Location and Area in separate lines */}
//                           <div className="mt-2 space-y-1">
//                             {/* Location line */}
//                             {(property.location || property.address || property.city) && (
//                               <p className="flex items-center gap-1 text-slate-600 text-sm sm:text-base">
//                                 <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
//                                 <span className="truncate">
//                                   {property.location || property.address || property.city || ""}
//                                 </span>
//                               </p>
//                             )}
//                           </div>
//                         </div>
                        
//                         {/* Price next to title */}
//                         <div className="flex-shrink-0">
//                           <p className="text-2xl sm:text-2xl font-bold text-[#004AAD] group-hover:scale-110 transition-transform duration-300 whitespace-nowrap">
//                             ₹{property.starting_price || property.price || property.monthly_rent || property.rent || "0"}/-
//                           </p>
//                         </div>
//                       </div>

//                       {/* Rating section */}
//                       <div className="flex items-center gap-2 mb-3">
//                         <div className="flex">
//                           {[1, 2, 3, 4, 5].map((star) => {
//                             const ratingValue = property.rating || 4.2;
//                             return (
//                               <svg
//                                 key={star}
//                                 className={`h-4 w-4 ${star <= ratingValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
//                                 viewBox="0 0 20 20"
//                                 fill="currentColor"
//                               >
//                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                               </svg>
//                             );
//                           })}
//                         </div>
//                         <span className="text-sm font-semibold text-slate-700">
//                           {property.rating ? property.rating.toFixed(1) : '4.2'}
//                         </span>
//                         <span className="text-xs text-slate-500">/5</span>
//                         <span className="text-xs text-slate-500 ml-2">
//                           ({property.review_count || 24} reviews)
//                         </span>
//                       </div>

//                       {/* Rooms and Beds section */}
//                       <div className="flex items-center gap-4 mb-3">
//                         <div className="flex items-center gap-2">
//                           <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
//                             <Users className="h-4 w-4 text-blue-600" />
//                           </div>
//                           <div>
//                             <p className="text-sm font-semibold text-slate-800">
//                               {property.total_rooms || property.rooms || property.room_count || "0"}
//                             </p>
//                             <p className="text-xs text-slate-500">Rooms</p>
//                           </div>
//                         </div>
                        
//                         <div className="w-px h-8 bg-slate-200"></div>
                        
//                         <div className="flex items-center gap-2">
//                           <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-100 group-hover:scale-110 transition-all duration-300">
//                             <Bed className="h-4 w-4 text-green-600" />
//                           </div>
//                           <div>
//                             <p className="text-sm font-semibold text-slate-800">
//                               {property.total_beds || property.beds || property.bed_count || "0"}
//                             </p>
//                             <p className="text-xs text-slate-500">Beds</p>
//                           </div>
//                         </div>
//                       </div>
                      
//                       {/* Amenities section */}
//                       {((Array.isArray(property.amenities) &&
//                         property.amenities.length > 0) ||
//                         (Array.isArray(property.services) &&
//                           property.services.length > 0)) && (
//                           <div className="flex flex-wrap gap-1.5 mb-3">
//                             {Array.isArray(property.amenities) &&
//                               property.amenities.length > 0 &&
//                               property.amenities.slice(0, 3).map(
//                                 (item: string, index: number) => {
//                                   const getColorClass = (amenity: string) => {
//                                     const amenityLower = amenity.toLowerCase();
//                                     if (amenityLower.includes('wifi') || amenityLower.includes('wi-fi')) {
//                                       return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:border-blue-200';
//                                     }
//                                     if (amenityLower.includes('ac') || amenityLower.includes('air')) {
//                                       return 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100 hover:border-cyan-200';
//                                     }
//                                     if (amenityLower.includes('food') || amenityLower.includes('meal')) {
//                                       return 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100 hover:border-orange-200';
//                                     }
//                                     if (amenityLower.includes('parking')) {
//                                       return 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200';
//                                     }
//                                     if (amenityLower.includes('housekeeping') || amenityLower.includes('cleaning')) {
//                                       return 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100 hover:border-purple-200';
//                                     }
//                                     if (amenityLower.includes('tv') || amenityLower.includes('television')) {
//                                       return 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100 hover:border-red-200';
//                                     }
//                                     if (amenityLower.includes('security') || amenityLower.includes('cctv')) {
//                                       return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200';
//                                     }
//                                     if (amenityLower.includes('water') || amenityLower.includes('hot water')) {
//                                       return 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100 hover:border-sky-200';
//                                     }
//                                     if (amenityLower.includes('laundry')) {
//                                       return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 hover:border-amber-200';
//                                     }
//                                     return 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100 hover:border-slate-200';
//                                   };
                                  
//                                   const colorClasses = getColorClass(item);
                                  
//                                   return (
//                                     <span
//                                       key={`amenity-${index}`}
//                                       className={`px-2 py-1 rounded-md border text-xs ${colorClasses} transition-all duration-300`}
//                                     >
//                                       {item}
//                                     </span>
//                                   );
//                                 }
//                               )}

//                             {Array.isArray(property.services) &&
//                               property.services.length > 0 &&
//                               property.services.slice(0, 2).map(
//                                 (item: string, index: number) => (
//                                   <span
//                                     key={`service-${index}`}
//                                     className="px-2 py-1 rounded-md border text-xs bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-all duration-300"
//                                   >
//                                     {item}
//                                   </span>
//                                 )
//                               )}

//                             {(property.amenities?.length > 3 || property.services?.length > 2) && (
//                               <span className="px-2 py-1 rounded-md border text-xs bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-all duration-300">
//                                 +{Math.max(
//                                   (property.amenities?.length || 0) - 3,
//                                   (property.services?.length || 0) - 2,
//                                   0
//                                 )}
//                               </span>
//                             )}
//                           </div>
//                         )}

//                       {/* Bottom action section */}
//                       <div className="flex justify-between items-center pt-3 border-t border-slate-100">
//                         {/* Left side: Bathrooms and View button */}
//                         <div className="flex items-center gap-4">
//                           {/* Bathrooms if available */}
//                           {property.total_bathrooms && (
//                             <div className="flex items-center gap-2">
//                               <div className="bg-purple-50 p-2 rounded-lg group-hover:bg-purple-100 group-hover:scale-110 transition-all duration-300">
//                                 <Bath className="h-4 w-4 text-purple-600" />
//                               </div>
//                               <div>
//                                 <p className="text-sm font-semibold text-slate-800">
//                                   {property.total_bathrooms || property.bathrooms || property.bathroom_count || "0"}
//                                 </p>
//                                 <p className="text-xs text-slate-500">Baths</p>
//                               </div>
//                             </div>
//                           )}
                          
//                           <Link href={`/properties/${property.slug || property.id || "#"}`}>
//                             <Button 
//                               className="h-9 px-4 text-sm group-hover:shadow-md transition-all text-lg duration-300"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                               }}
//                             >
//                               View
//                               <ChevronRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
//                             </Button>
//                           </Link>
//                         </div>
                        
//                         {/* Right side: WhatsApp, Call, and Heart icons */}
//                         <div className="flex items-center gap-2">
//                           <a 
//                             href={`https://wa.me/${property.whatsapp || '911234567890'}?text=Hi, I'm interested in ${property.name || property.property_name || "Property Name"}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-all duration-300 hover:scale-110 flex items-center justify-center"
//                             title="WhatsApp"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 448 512" fill="currentColor">
//                               <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
//                             </svg>
//                           </a>
                          
//                           <a 
//                             href={`tel:${property.phone || property.contact_number || '1234567890'}`}
//                             className="p-2 bg-blue-50 hover:bg-blue-100 rounded-md transition-all duration-300 hover:scale-110"
//                             title="Call"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                             </svg>
//                           </a>
                          
//                           <button 
//                             className="p-2 bg-pink-50 hover:bg-pink-100 rounded-md transition-all duration-300 hover:scale-110 favorite-btn"
//                             title="Add to Favorites"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               const heartIcon = e.currentTarget.querySelector('svg');
//                               heartIcon.classList.toggle('fill-red-500');
//                             }}
//                           >
//                             <svg 
//                               className="h-5 w-5 text-red-500" 
//                               viewBox="0 0 24 24" 
//                               stroke="currentColor"
//                               fill="none"
//                             >
//                               <path 
//                                 strokeLinecap="round" 
//                                 strokeLinejoin="round" 
//                                 strokeWidth={2} 
//                                 d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
//                               />
//                             </svg>
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




// app/properties/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { listProperties } from "@/lib/propertyApi";
import HeroSection from '@/components/properties/HeroSection';
import FiltersSection from '@/components/properties/FiltersSection';
import PropertyCard from '@/components/properties/PropertyCard';

function PropertiesGrid() {
  const [properties, setProperties] = useState<{ id: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listProperties({ page: 1, pageSize: 100 });
        if (cancelled) return;
        if (!res?.success || !Array.isArray(res.data)) {
          setProperties([]);
          return;
        }
        setProperties(res.data);
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading properties:", err);
          setError("Error loading properties. Please try again.");
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-3 sm:px-4 md:px-4 pb-12 sm:pb-16 md:pb-20">
        <p className="text-center py-12 sm:py-16 md:py-20 text-sm sm:text-base">{error}</p>
      </div>
    );
  }
  if (properties === null) {
    return (
      <div className="container mx-auto px-3 sm:px-4 md:px-4 pb-12 sm:pb-16 md:pb-20">
        <p className="text-center py-12 sm:py-16 md:py-20 text-sm sm:text-base">Loading...</p>
      </div>
    );
  }
  if (properties.length === 0) {
    return (
      <div className="container mx-auto px-3 sm:px-4 md:px-4 pb-12 sm:pb-16 md:pb-20">
        <p className="text-center py-12 sm:py-16 md:py-20 text-sm sm:text-base">No properties found.</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-4 pb-12 sm:pb-16 md:pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white ">
      <HeroSection />
      <FiltersSection />
      <PropertiesGrid />
    </div>
  );
}
