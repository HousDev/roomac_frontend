
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
      className="h-8 pl-7 pr-7 rounded-md bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder:text-white text-[11px] font-medium w-full"
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