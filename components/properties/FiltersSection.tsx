// "use client";

// import { useState, useCallback, memo, useEffect } from 'react';
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Slider } from "@/components/ui/slider";
// import { Filter, X, MapPin } from "lucide-react";

// interface FiltersSectionProps {
//   onFiltersChange?: (filters: any) => void;
// }

// const CITIES = [
//   { id: "pune", name: "Pune" },
// ];

// const FiltersSection = memo(function FiltersSection({ onFiltersChange }: FiltersSectionProps) {

//   // ✅ DEFAULT CITY = PUNE
//   const [selectedCity, setSelectedCity] = useState("pune");
//   const [searchArea, setSearchArea] = useState("");
//   const [selectedType, setSelectedType] = useState("");
//   const [budgetRange, setBudgetRange] = useState<[number, number]>([5000, 15000]);
//   const [showFilters, setShowFilters] = useState(false);

//   // notify parent on mount
//   useEffect(() => {
//     onFiltersChange?.({
//       city: "pune",
//       searchArea: "",
//       selectedType: "",
//       budgetRange: [5000, 15000],
//     });
//   }, [onFiltersChange]);

//   const handleCityChange = useCallback((value: string) => {
//     setSelectedCity(value);
//     onFiltersChange?.({ city: value, searchArea, selectedType, budgetRange });
//   }, [searchArea, selectedType, budgetRange, onFiltersChange]);

//   const handleSearchChange = useCallback((value: string) => {
//     setSearchArea(value);
//     onFiltersChange?.({ city: selectedCity, searchArea: value, selectedType, budgetRange });
//   }, [selectedCity, selectedType, budgetRange, onFiltersChange]);

//   const handleTypeChange = useCallback((value: string) => {
//     setSelectedType(value);
//     onFiltersChange?.({ city: selectedCity, searchArea, selectedType: value, budgetRange });
//   }, [selectedCity, searchArea, budgetRange, onFiltersChange]);

//   const handleBudgetChange = useCallback((value: [number, number]) => {
//     setBudgetRange(value);
//     onFiltersChange?.({ city: selectedCity, searchArea, selectedType, budgetRange: value });
//   }, [selectedCity, searchArea, selectedType, onFiltersChange]);

//   const clearFilters = useCallback(() => {
//     setSelectedCity("pune");
//     setSearchArea("");
//     setSelectedType("");
//     setBudgetRange([5000, 15000]);
//     onFiltersChange?.({
//       city: "pune",
//       searchArea: "",
//       selectedType: "",
//       budgetRange: [5000, 15000],
//     });
//   }, [onFiltersChange]);

//   const activeFiltersCount =
//     [searchArea, selectedType].filter(Boolean).length +
//     (budgetRange[0] !== 5000 || budgetRange[1] !== 15000 ? 1 : 0);

//   return (
//     <div className="container mx-auto px-3 sm:px-4 md:px-4 -mt-6 relative z-10 mb-10">
//       <Card className="shadow-3xl">
//         <CardContent className="p-4 sm:p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

//           {/* ✅ CITY DROPDOWN */}
//           <Select value={selectedCity} onValueChange={handleCityChange}>
//             <SelectTrigger className="h-10 sm:h-11 md:h-12 text-sm sm:text-base">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {CITIES.map(city => (
//                 <SelectItem key={city.id} value={city.id}>
//                   <div className="flex items-center gap-2">
//                     <MapPin className="h-4 w-4 text-blue-500" />
//                     {city.name}
//                   </div>
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           {/* SEARCH */}
//           <Input
//             placeholder="Search name or area"
//             value={searchArea}
//             onChange={(e) => handleSearchChange(e.target.value)}
//             className="h-10 sm:h-11 md:h-12 text-sm sm:text-base"
//           />

//           {/* TYPE */}
//           <Select value={selectedType} onValueChange={handleTypeChange}>
//             <SelectTrigger className="h-10 sm:h-11 md:h-12 text-sm sm:text-base">
//               <SelectValue placeholder="All Types" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="single">Single Sharing</SelectItem>
//               <SelectItem value="double">Double Sharing</SelectItem>
//             </SelectContent>
//           </Select>

//           {/* BUDGET */}
//           <div className="flex gap-2">
//             <Button
//               variant={showFilters ? "default" : "outline"}
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex-1 h-10 sm:h-11 md:h-12 gap-2"
//             >
//               <Filter className="h-4 w-4" />
//               Budget
//               {activeFiltersCount > 0 && (
//                 <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
//                   {activeFiltersCount}
//                 </Badge>
//               )}
//             </Button>

//             {activeFiltersCount > 0 && (
//               <Button variant="ghost" onClick={clearFilters} className="h-10 sm:h-11 md:h-12">
//                 <X className="h-4 w-4" />
//               </Button>
//             )}
//           </div>

//           {showFilters && (
//             <div className="col-span-full mt-3">
//               <p className="mb-2 text-sm">
//                 Budget ₹{budgetRange[0]} - ₹{budgetRange[1]}
//               </p>
//               <Slider
//                 value={budgetRange}
//                 onValueChange={handleBudgetChange}
//                 min={5000}
//                 max={15000}
//                 step={500}
//               />
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// });

// export default FiltersSection;
