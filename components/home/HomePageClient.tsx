
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from '@/src/compat/next-link';
import { 
  Phone, BedDouble, ChevronLeft, ChevronRight,
  Wifi, Utensils, Shield, Clock, Car, Zap, Building2, MapPin, Star, Search,
  ArrowRight, CheckCircle2, Heart, Sparkles, Home, Bath, SlidersHorizontal,
  X, IndianRupee
} from 'lucide-react';
import { BsWhatsapp } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import { Card as UICard, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ScrollAnimation from './ScrollAnimation';
import TestimonialsSlider from './TestimonialsSlider';
import OffersSlider from './OffersSlider';
import FloatingActions from './FloatingActions';
import CardScrollAnimation from './CardScrollAnimation';
import { Share2, Copy, Check } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaTelegramPlane } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
};

// ─── Amenity options for filter ───────────────────────────────────────────────
const AMENITY_OPTIONS = ["WiFi", "AC", "Meals", "Parking", "Security", "Laundry", "Power Backup", "Housekeeping"];

// ─── Price range options ──────────────────────────────────────────────────────
const PRICE_OPTIONS = [
  { label: "Any Price", min: 0, max: Infinity },
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000 – ₹15,000", min: 10000, max: 15000 },
  { label: "₹15,000 – ₹25,000", min: 15000, max: 25000 },
  { label: "Above ₹25,000", min: 25000, max: Infinity },
];

interface HomePageClientProps {
  initialCities: any[];
  initialProperties: any[];
  initialOffers: any[];
}

export default function HomePageClient({ initialCities, initialProperties, initialOffers }: HomePageClientProps) {
  const [isMounted, setIsMounted]       = useState(false);
  const [properties]                    = useState(initialProperties);
  const [offers]                        = useState(initialOffers);
  const [likedProperties, setLikedProperties] = useState<Set<number>>(new Set());

  // ── Filter state ──────────────────────────────────────────────────────────
  const [searchArea, setSearchArea]         = useState('');
  const [selectedCity, setSelectedCity]     = useState('pune');
  const [selectedAmenity, setSelectedAmenity] = useState('');
  const [selectedPriceKey, setSelectedPriceKey] = useState('Any Price');

  const [cities] = useState(() => {
    const hasPune = initialCities.some(c => c.name.toLowerCase().trim() === 'pune');
    return hasPune ? initialCities : [{ id: 'pune-id', name: 'Pune' }, ...initialCities];
  });

  useEffect(() => { setIsMounted(true); }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleWhatsAppClick = (phoneNumber: string, propertyName: string, location: string) => {
    const message = `Hi, I'm interested in ${propertyName} at ${location}. Can you share more details?`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };
  const handleCallClick = (phoneNumber: string) => { window.location.href = `tel:${phoneNumber}`; };
  const handleHeartClick = (propertyId: number, event: React.MouseEvent) => {
    event.preventDefault(); event.stopPropagation();
    setLikedProperties(prev => {
      const s = new Set(prev);
      s.has(propertyId) ? s.delete(propertyId) : s.add(propertyId);
      return s;
    });
  };

  // ── Client-side filtering ────────────
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const cityName = (property.city?.name || property.city_name || '').toLowerCase();
      if (selectedCity && selectedCity !== 'all' && !cityName.includes(selectedCity.toLowerCase())) {
        if (cityName) return false;
      }

      if (searchArea.trim()) {
        const q = searchArea.toLowerCase();
        const addr = (property.address || property.location || property.area || '').toLowerCase();
        const name = (property.name || property.property_name || '').toLowerCase();
        if (!addr.includes(q) && !name.includes(q) && !cityName.includes(q)) return false;
      }

      if (selectedAmenity) {
        let amenities: string[] = [];
        if (property.amenities && Array.isArray(property.amenities)) amenities = property.amenities;
        else if (property.features && Array.isArray(property.features)) amenities = property.features;
        else if (property.amenities_list && Array.isArray(property.amenities_list)) amenities = property.amenities_list;
        else {
          if (property.has_wifi) amenities.push("WiFi");
          if (property.has_meals) amenities.push("Meals");
          if (property.has_security) amenities.push("Security");
          if (property.has_parking) amenities.push("Parking");
          if (property.ac_available) amenities.push("AC");
          if (property.attached_bath) amenities.push("Bath");
          if (property.power_backup) amenities.push("Power Backup");
          if (property.housekeeping) amenities.push("Housekeeping");
        }
        const hasAmenity = amenities.some((a: string) =>
          String(a).toLowerCase().includes(selectedAmenity.toLowerCase())
        );
        if (!hasAmenity) return false;
      }

      const price = property.starting_price || property.price || property.monthly_rent || property.rent || 0;
      const priceRange = PRICE_OPTIONS.find(p => p.label === selectedPriceKey) || PRICE_OPTIONS[0];
      if (price < priceRange.min || price > priceRange.max) return false;

      return true;
    });
  }, [properties, searchArea, selectedCity, selectedAmenity, selectedPriceKey]);

  const features = [
    { icon: Wifi,    title: 'High-Speed WiFi',  desc: 'Blazing fast internet for work & entertainment' },
    { icon: Utensils,title: 'Healthy Meals',     desc: 'Nutritious breakfast, lunch & dinner' },
    { icon: Shield,  title: '24/7 Security',     desc: 'CCTV surveillance & biometric access' },
    { icon: Clock,   title: 'Housekeeping',      desc: 'Daily cleaning & laundry services' },
    { icon: Car,     title: 'Free Parking',      desc: 'Secure parking for bikes & cars' },
    { icon: Zap,     title: 'Power Backup',      desc: 'Uninterrupted electricity with DG' },
    { icon: Home,    title: 'Fully Furnished',   desc: 'Move-in ready with all amenities' },
    { icon: Heart,   title: 'Community',         desc: 'Events, networking & fun activities' },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      <HeroSection 
        isMounted={isMounted}
        cities={cities}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        searchArea={searchArea}
        setSearchArea={setSearchArea}
        selectedAmenity={selectedAmenity}
        setSelectedAmenity={setSelectedAmenity}
        selectedPriceKey={selectedPriceKey}
        setSelectedPriceKey={setSelectedPriceKey}
      />

      <PropertiesSection
        properties={filteredProperties}
        allCount={properties.length}
        loading={false}
        likedProperties={likedProperties}
        onWhatsAppClick={handleWhatsAppClick}
        onCallClick={handleCallClick}
        onHeartClick={handleHeartClick}
        hasActiveFilters={!!(searchArea || selectedAmenity || selectedPriceKey !== 'Any Price')}
      />

      <AboutUsSection />
      <FeaturesSection features={features} />
      <OffersSlider offers={offers} />
      <TestimonialsSlider />
      <FloatingActions />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HERO SECTION - BACKGROUND IMAGES CHANGE, TEXT CONTENT CHANGES WITH THEM
// ═════════════════════════════════════════════════════════════════════════════
const heroSlides = [
  {
    image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920",
    badge: "India's Premium Co-Living Platform",
    heading1: "Your Perfect",
    heading2: "Home Awaits",
    subtext: "Experience premium co-living spaces designed for comfort, community, and convenience.",
  },
  {
    image: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1920",
    badge: "Fully Furnished. Move-In Ready.",
    heading1: "Live Smarter,",
    heading2: "Live Together",
    subtext: "Modern co-living redefined — high-speed WiFi, curated meals, and a vibrant community.",
  },
  {
    image: "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1920",
    badge: "500+ Happy Residents",
    heading1: "Where Comfort ",
    heading2: "Meets Community",
    subtext: "Join hundreds of professionals and students who've found their perfect home with Roomac.",
  },
];

interface HeroSectionProps {
  isMounted: boolean;
  cities: any[];
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  searchArea: string;
  setSearchArea: (v: string) => void;
  selectedAmenity: string;
  setSelectedAmenity: (v: string) => void;
  selectedPriceKey: string;
  setSelectedPriceKey: (v: string) => void;
}

function HeroSection({ 
  isMounted,
  cities,
  selectedCity,
  setSelectedCity,
  searchArea,
  setSearchArea,
  selectedAmenity,
  setSelectedAmenity,
  selectedPriceKey,
  setSelectedPriceKey,
}: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(next, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const imageVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '8%' : '-8%', opacity: 0, scale: 1.08 }),
    center: { x: '0%', opacity: 1, scale: 1.05, transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] as any } },
    exit:   (dir: number) => ({ x: dir > 0 ? '-8%' : '8%', opacity: 0, scale: 1, transition: { duration: 0.8, ease: "easeIn" } }),
  };

  // Get current slide data
  const currentSlide = heroSlides[current];

  return (
    <section className="relative w-full h-screen min-h-[600px] max-h-[400px] md:max-h-[660px] overflow-hidden">

      {/* Background image slider - THIS CHANGES WITH ANIMATION */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0 w-full h-full"
          custom={direction}
          variants={imageVariants}
          initial="enter" animate="center" exit="exit"
        >
          <img src={currentSlide.image} alt="Co-living space" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Wave bottom - FIXED */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none -mb-1">
        <svg viewBox="0 0 1440 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none" style={{display: 'block'}}>
          <path d="M0,65 C240,5 480,85 720,45 C960,5 1200,75 1440,35 L1440,90 L0,90 Z" fill="white"/>
        </svg>
      </div>

      {/* FIXED CONTENT CONTAINER - TEXT CHANGES WITH SLIDE, SEARCH BAR STAYS FIXED */}
<div className="absolute inset-0 z-10 flex items-start justify-center px-4 pt-8">        <div className="w-full max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center">
            
            {/* Badge - CHANGES WITH SLIDE */}
            <motion.div 
              key={`badge-${current}`}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2, duration: 0.6 }} 
              className="mb-4 mt-0"
            >
              <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/30 text-white text-sm font-medium px-4 py-1 rounded-full">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                {currentSlide.badge}
              </span>
            </motion.div>

            {/* Heading - CHANGES WITH SLIDE */}
            <motion.h1
              key={`heading-${current}`}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.35, duration: 0.7 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4"
              style={{ fontFamily: "'Poppins', 'Sans Serif', serif" }}
            >
              <span className="text-white">{currentSlide.heading1} </span>
              {currentSlide.heading2 && (
                <span 
                  style={{ 
                    background: 'linear-gradient(90deg, #60a5fa, #93c5fd, #bfdbfe)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent', 
                    backgroundClip: 'text' 
                  }}
                >
                  {currentSlide.heading2}
                </span>
              )}
            </motion.h1>

            {/* Subtext - CHANGES WITH SLIDE */}
            <motion.p 
              key={`subtext-${current}`}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-white/90 text-base sm:text-lg md:text-xl leading-relaxed mb-5 max-w-2xl mx-auto"
            >
              {currentSlide.subtext}
            </motion.p>

            {/* Stats - FIXED (doesn't change) */}
          

            {/* CTAs - FIXED (doesn't change) */}
          <motion.div 
  initial={{ opacity: 0, y: 20 }} 
  animate={{ opacity: 1, y: 0 }} 
  transition={{ delay: 0.7, duration: 0.6 }} 
  className="flex flex-row sm:flex-row gap-2 sm:gap-3 justify-center mb-6"
>
  <Link href="/properties">
    <Button 
      size="lg"
      className="
      bg-[#0249a8] text-white border-0
      px-4 sm:px-7
      text-sm sm:text-base
      font-semibold
      shadow-lg shadow-blue-900/40
      transition-all duration-300 hover:scale-105
      gap-2
      h-10 sm:h-12
      whitespace-nowrap
      ">
      <Search className="h-4 w-4 sm:h-5 sm:w-5" /> Explore Properties
    </Button>
  </Link>

  <Link href="/contact">
    <Button 
      size="lg"
      variant="outline"
      className="
      bg-white/10 hover:bg-white/20 backdrop-blur-sm
      text-white border border-white/40 hover:border-white/70
      px-4 sm:px-7
      text-sm sm:text-base
      font-semibold
      transition-all duration-300 hover:scale-105
      h-10 sm:h-12
      whitespace-nowrap
      ">
      Talk to Expert
    </Button>
  </Link>
</motion.div>

            {/* SEARCH FILTER - FIXED (doesn't change) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="w-full max-w-4xl"
            >
              <FiltersSection
                isMounted={isMounted}
                cities={cities}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                searchArea={searchArea}
                setSearchArea={setSearchArea}
                selectedAmenity={selectedAmenity}
                setSelectedAmenity={setSelectedAmenity}
                selectedPriceKey={selectedPriceKey}
                setSelectedPriceKey={setSelectedPriceKey}
              />
            </motion.div>
              <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.6, duration: 0.6 }} 
              className="flex flex-wrap justify-center gap-6 mb-5 mt-6"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-400/30 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">500+ Residents</p>
                  <p className="text-xs text-white/70">Happy living</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">4.7 Rating</p>
                  <p className="text-xs text-white/70">Trusted service</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// FILTERS SECTION
// ═════════════════════════════════════════════════════════════════════════════
interface FiltersSectionProps {
  isMounted: boolean;
  cities: any[];
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  searchArea: string;
  setSearchArea: (v: string) => void;
  selectedAmenity: string;
  setSelectedAmenity: (v: string) => void;
  selectedPriceKey: string;
  setSelectedPriceKey: (v: string) => void;
}

function FiltersSection({
  isMounted,
  cities,
  selectedCity,
  setSelectedCity,
  searchArea,
  setSearchArea,
  selectedAmenity,
  setSelectedAmenity,
  selectedPriceKey,
  setSelectedPriceKey,
}: FiltersSectionProps) {
  return (
    <div className="w-full">
      <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-lg shadow-2xl shadow-black/30 px-2 py-2 sm:px-2.5 sm:py-2.5">
        
        <div className="flex items-center gap-1.5 mb-1.5">
          <SlidersHorizontal className="h-3 w-3 text-white/80" />
          <span className="text-white/80 text-[11px] font-semibold uppercase tracking-wide">
            Find Your Space
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
          
          {/* City */}
          <div className="relative">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="h-8 pl-7 rounded-md bg-white/15 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:ring-1 focus:ring-white/40 focus:border-white/50 text-[11px] font-medium hover:bg-white/25 transition-all w-full [&>span]:text-white">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent className="rounded-lg shadow-2xl border border-blue-100 bg-white">
                {cities.map((city: any) => (
                  <SelectItem key={city.id} value={city.name.toLowerCase()} className="cursor-pointer hover:bg-blue-50 text-[11px]">
                    <div className="flex items-center gap-2 text-white-500">
                      <MapPin className="h-3 w-3 text-blue-500" />
                      {city.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Locality */}
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <Search className="h-3 w-3 text-blue-300" />
            </div>
            <Input
              placeholder="Locality..."
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              className="h-8 pl-7 rounded-md bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:ring-1 focus:ring-white/40 focus:border-white/50 text-[11px] font-medium hover:bg-white/25 transition-all w-full"
            />
            {searchArea && (
              <button onClick={() => setSearchArea("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </div>

          {/* Amenities */}
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <Wifi className="h-3 w-3 text-blue-300" />
            </div>
            <Select value={selectedAmenity || "__all__"} onValueChange={(v) => setSelectedAmenity(v === "__all__" ? "" : v)}>
              <SelectTrigger className="h-8 pl-7 rounded-md bg-white/15 backdrop-blur-sm border border-white/30 text-white focus:ring-1 focus:ring-white/40 focus:border-white/50 text-[11px] font-medium hover:bg-white/25 transition-all w-full">
                <SelectValue placeholder="Amenities" />
              </SelectTrigger>
              <SelectContent className="rounded-lg shadow-2xl border border-blue-100 bg-white">
                <SelectItem value="__all__" className="hover:bg-blue-50 text-[11px] text-slate-700">All Amenities</SelectItem>
                {AMENITY_OPTIONS.map((a) => (
                  <SelectItem key={a} value={a} className="hover:bg-blue-50 text-[11px] text-slate-700">{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <IndianRupee className="h-3 w-3 text-blue-300" />
            </div>
            <Select value={selectedPriceKey} onValueChange={setSelectedPriceKey}>
              <SelectTrigger className="h-8 pl-7 rounded-md bg-white/15 backdrop-blur-sm border border-white/30 text-white focus:ring-1 focus:ring-white/40 focus:border-white/50 text-[11px] font-medium hover:bg-white/25 transition-all w-full">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent className="rounded-lg shadow-2xl border border-blue-100 bg-white">
                {PRICE_OPTIONS.map((p) => (
                  <SelectItem key={p.label} value={p.label} className="hover:bg-blue-50 text-[11px] text-slate-700">{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchArea || selectedAmenity || selectedPriceKey !== "Any Price") && (
          <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-white/20">
            <span className="text-white/60 text-[10px] self-center">Active:</span>
            {searchArea && (
              <span className="inline-flex items-center gap-1 bg-blue-500/30 border border-blue-400/40 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                "{searchArea}"
                <button onClick={() => setSearchArea("")}><X className="h-2 w-2" /></button>
              </span>
            )}
            {selectedAmenity && (
              <span className="inline-flex items-center gap-1 bg-emerald-500/30 border border-emerald-400/40 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {selectedAmenity}
                <button onClick={() => setSelectedAmenity("")}><X className="h-2 w-2" /></button>
              </span>
            )}
            {selectedPriceKey !== "Any Price" && (
              <span className="inline-flex items-center gap-1 bg-amber-500/30 border border-amber-400/40 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {selectedPriceKey}
                <button onClick={() => setSelectedPriceKey("Any Price")}><X className="h-2 w-2" /></button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PROPERTIES SECTION — Cards styled like Image 2 (Lucxorio-style)
// ═════════════════════════════════════════════════════════════════════════════
// Component to add in HomePageClient.tsx

// Updated PropertiesSection Component with Watermark and Enhanced Share Popup

interface PropertiesSectionProps {
  properties: any[];
  allCount: number;
  loading: boolean;
  likedProperties: Set<number>;
  hasActiveFilters: boolean;
  onWhatsAppClick: (phone: string, name: string, location: string) => void;
  onCallClick: (phone: string) => void;
  onHeartClick: (propertyId: number, event: React.MouseEvent) => void;
}

function PropertiesSection({ 
  properties, 
  allCount, 
  loading, 
  likedProperties, 
  hasActiveFilters, 
  onWhatsAppClick, 
  onCallClick, 
  onHeartClick 
}: PropertiesSectionProps) {
  const [sharePopup, setSharePopup] = useState<{ isOpen: boolean; property: any | null }>({ 
    isOpen: false, 
    property: null 
  });
  const [copied, setCopied] = useState(false);

  const handleShareClick = (e: React.MouseEvent, property: any) => {
    e.preventDefault();
    e.stopPropagation();
    setSharePopup({ isOpen: true, property });
  };

  const closeSharePopup = () => {
    setSharePopup({ isOpen: false, property: null });
    setCopied(false);
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/properties/${sharePopup.property?.slug || sharePopup.property?.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform: string) => {
    const shareUrl = `${window.location.origin}/properties/${sharePopup.property?.slug || sharePopup.property?.id}`;
    const propertyName = sharePopup.property?.name || sharePopup.property?.property_name || 'Premium Property';
    const shareText = `Check out this property: ${propertyName}`;

    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(propertyName)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-gradient-to-b from-slate-50 to-white px-2 sm:px-4">
      <div className="container mx-auto px-3 sm:px-4">

        {/* Header */}
        <ScrollAnimation>
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-[#0249a8] rounded-full" />
              <span className="mx-2 sm:mx-4 text-xs sm:text-sm font-semibold text-[#0249a8] tracking-wider uppercase">Premium Selections</span>
              <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-[#0249a8] rounded-full" />
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              <span className="text-slate-900">Discover Your Perfect </span>
              <span className="text-[#0249a8] ml-2 sm:ml-0">Living Space</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
              {hasActiveFilters
                ? `Showing ${properties.length} of ${allCount} properties matching your filters`
                : 'Handpicked properties with premium amenities and verified reviews'}
            </p>
          </div>
        </ScrollAnimation>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8 sm:mt-10">
          {properties.length > 0 ? (
            properties.map((property, index) => {
              // ── All data extraction logic ──────────────────────
              let propertyImages: string[] = [];
              if (property.photo_urls && Array.isArray(property.photo_urls)) propertyImages = property.photo_urls;
              else if (property.images && Array.isArray(property.images)) propertyImages = property.images;
              else if (property.photos && Array.isArray(property.photos)) propertyImages = property.photos;
              else if (property.image_urls && Array.isArray(property.image_urls)) propertyImages = property.image_urls;

              const propertyImage = propertyImages.length > 0
                ? propertyImages[0]
                : 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600';

              const propertyName    = property.name || property.property_name || 'Premium Property';
              const propertyAddress = property.address || property.location || property.area || 'Location details available';
              const cityName        = property.city?.name || property.city_name || '';
              const fullLocation    = cityName ? `${propertyAddress}, ${cityName}` : propertyAddress;
              const propertyPrice   = property.starting_price || property.price || property.monthly_rent || property.rent || 15000;

              const propertyTags: string[] = property.tags || property.property_tags || property.category_tags || property.labels || [];

              const getTagColor = (tag: string) => {
                const t = tag.toLowerCase();
                if (t.includes('male') || t.includes('boys') || t.includes('men')) return 'bg-gradient-to-r from-blue-600 to-blue-800 text-white';
                if (t.includes('female') || t.includes('girls') || t.includes('women')) return 'bg-gradient-to-r from-pink-600 to-rose-600 text-white';
                if (t.includes('couple') || t.includes('married')) return 'bg-gradient-to-r from-purple-600 to-purple-800 text-white';
                if (t.includes('family')) return 'bg-gradient-to-r from-green-600 to-green-800 text-white';
                if (t.includes('working') || t.includes('professional')) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
                if (t.includes('student')) return 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white';
                return 'bg-gradient-to-r from-slate-600 to-slate-800 text-white';
              };

              let amenities: string[] = [];
              if (property.amenities && Array.isArray(property.amenities)) amenities = property.amenities;
              else if (property.features && Array.isArray(property.features)) amenities = property.features;
              else if (property.amenities_list && Array.isArray(property.amenities_list)) amenities = property.amenities_list;
              else {
                if (property.has_wifi) amenities.push("WiFi");
                if (property.has_meals) amenities.push("Meals");
                if (property.has_security) amenities.push("Security");
                if (property.has_parking) amenities.push("Parking");
                if (property.ac_available) amenities.push("AC");
                if (property.attached_bath) amenities.push("Bath");
                if (property.power_backup) amenities.push("Power Backup");
                if (property.housekeeping) amenities.push("Housekeeping");
              }

              const displayAmenities = amenities.slice(0, 5);
              const totalBeds    = property.total_beds || property.beds_available || property.beds || 10;
              const propertyType = property.property_type || property.type || '';
              const totalRooms   = property.total_rooms || property.rooms || property.room_count || '';
              const rating       = property.rating || 4.5;
              // ─────────────────────────────────────────────────────────────

              return (
                <CardScrollAnimation key={property.id || index} index={index}>
                  <Link href={`/properties/${property.slug || property.id}`} className="group block h-full">
                    {/* ── CARD ── */}
                    <div className="relative overflow-hidden rounded-2xl bg-[#f0f5f5] shadow-md hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 h-[500px] flex flex-col">

                      {/* Image area */}
                      <div className="relative h-52 sm:h-56 md:h-60 overflow-hidden rounded-t-2xl flex-shrink-0">
                        <img
                          src={propertyImage}
                          alt={propertyName}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                          style={{ transform: 'scale(1.03)' }}
                          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                          onMouseOut={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                        />

                        {/* Watermark - Center Top (Like RealEstateVin) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[5] pointer-events-none">
  <div
    className="
    text-white/40
    text-sm sm:text-base md:text-lg lg:text-3xl
    font-semibold
    tracking-wide
    select-none
    whitespace-nowrap
    "
    style={{
      textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
      fontFamily: 'Poppins, sans-serif',
      letterSpacing: '0.05em'
    }}
  >
    Roomac.in
  </div>
</div>


                        {/* Rating pill — top left */}
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-slate-800">{rating}</span>
                        </div>

                        {/* Share & Heart — top right */}
                        <div className="absolute top-3 right-3 z-10 flex gap-2">
                          <button
                            onClick={(e) => handleShareClick(e, property)}
                            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                          >
                            <Share2 className="h-4 w-4 text-slate-600" />
                          </button>
                          <button
                            onClick={(e) => onHeartClick(property.id || index, e)}
                            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                          >
                            <Heart className={`h-4 w-4 ${likedProperties.has(property.id || index) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                          </button>
                        </div>

                        {/* Tags */}
                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 z-10">
                          {propertyTags.slice(0, 2).map((tag: string, ti: number) => (
                            <span key={ti} className={`px-2 py-0.5 rounded-full text-xs font-semibold shadow-md ${getTagColor(tag)}`}>
                              {tag}
                            </span>
                          ))}
                          {propertyTags.length === 0 && propertyType && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-white shadow-md capitalize">{propertyType}</span>
                          )}
                        </div>

                        {/* Amenity icons row — shown on hover */}
                        {/* {displayAmenities.length > 0 && (
                          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pb-10 flex justify-center gap-2 z-10">
                            {displayAmenities.map((a: any, ai: number) => {
                              const getIcon = (amenity: string) => {
                                const am = String(amenity).toLowerCase();
                                if (am.includes('wifi')) return <Wifi className="h-4 w-4" />;
                                if (am.includes('meal')) return <Utensils className="h-4 w-4" />;
                                if (am.includes('security')) return <Shield className="h-4 w-4" />;
                                if (am.includes('parking')) return <Car className="h-4 w-4" />;
                                if (am.includes('ac')) return <Zap className="h-4 w-4" />;
                                if (am.includes('bath')) return <Bath className="h-4 w-4" />;
                                if (am.includes('power')) return <Zap className="h-4 w-4" />;
                                if (am.includes('housekeeping')) return <Clock className="h-4 w-4" />;
                                return <CheckCircle2 className="h-4 w-4" />;
                              };
                              
                              return (
                                <div key={ai} title={String(a)} className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md text-slate-700">
                                  {getIcon(a)}
                                </div>
                              );
                            })}
                          </div>
                        )} */}
                      </div>

                      {/* Card body */}
                      <div className="p-4 sm:p-5 flex flex-col flex-grow">
                        
                        {/* Title + Price in Header Row */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-base sm:text-lg text-slate-800 group-hover:text-[#0249a8] transition-colors duration-300 line-clamp-1">
                              {propertyName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="h-0.5 w-8 bg-[#0249a8] rounded-full" />
                              <div className="h-0.5 w-2 bg-yellow-400 rounded-full" />
                            </div>
                          </div>
                          
                          <div className="text-right ml-3">
                            <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Starting from</p>
                            <p className="text-lg font-bold text-[#0249a8] whitespace-nowrap">
                              ₹{Number(propertyPrice).toLocaleString()}
                              <span className="text-sm text-slate-400 font-normal">/mo</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-1.5 mb-3">
                          <MapPin className="h-3.5 w-3.5 text-[#0249a8] flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{fullLocation}</span>
                        </div>

                        <div className="flex items-center gap-4 mb-3 text-slate-600 text-xs">
                          <div className="flex items-center gap-1.5">
                            <BedDouble className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-semibold text-slate-700">{totalBeds}</span>
                            <span className="text-slate-400">Beds</span>
                          </div>
                          {totalRooms && (
                            <div className="flex items-center gap-1.5">
                              <Home className="h-3.5 w-3.5 text-[#0249a8]" />
                              <span className="font-semibold text-slate-700">{totalRooms}</span>
                              <span className="text-slate-400">Rooms</span>
                            </div>
                          )}
                        </div>

                        {displayAmenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {displayAmenities.map((a: any, ai: number) => {
                              const colors = [
                                'bg-blue-50 text-blue-700 border-blue-200',
                                'bg-emerald-50 text-emerald-700 border-emerald-200',
                                'bg-amber-50 text-amber-700 border-amber-200',
                                'bg-purple-50 text-purple-700 border-purple-200',
                                'bg-cyan-50 text-cyan-700 border-cyan-200',
                              ];
                              return (
                                <span key={ai} className={`px-2 py-0.5 rounded-md border text-xs font-medium ${colors[ai % colors.length]}`}>
                                  {String(a)}
                                </span>
                              );
                            })}
                            {amenities.length > 5 && (
                              <span className="px-2 py-0.5 rounded-md border border-slate-200 text-xs text-slate-500 bg-slate-50">+{amenities.length - 5}</span>
                            )}
                          </div>
                        )}

                        <div className="border-t border-slate-200 mt-auto pt-3">
                          <div className="flex items-center gap-2">
                            <Link href={`/properties/${property.slug || property.id}`} className="flex-1">
                              <button className="w-full px-2 py-2.5 bg-[#0249a8] hover:bg-[#023a88] text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1">
                                <span>Details</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </Link>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWhatsAppClick(property.whatsapp || '9923953933', propertyName, fullLocation); }}
                              className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-medium transition-all hover:scale-105"
                              title="WhatsApp"
                            >
                              <BsWhatsapp className="h-4 w-4" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </button>
                            
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCallClick(property.phone || property.contact_number || '1234567890'); }}
                              className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-all hover:scale-105"
                              title="Call"
                            >
                              <Phone className="h-4 w-4" />
                              <span className="hidden sm:inline">Call</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CardScrollAnimation>
              );
            })
          ) : (
        <div className="col-span-full">
  <ScrollAnimation>
    <div className="flex justify-center items-center text-center py-16 w-full">
      <div className="max-w-md mx-auto flex flex-col items-center">
        <Building2 className="h-16 w-16 text-slate-300 mb-4" />

        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          {hasActiveFilters ? 'No properties match your filters' : 'No Properties Found'}
        </h3>

        <p className="text-slate-500 mb-4">
          {hasActiveFilters
            ? 'Try adjusting or clearing your search filters.'
            : "We couldn't find any properties at the moment."}
        </p>

        <Link href="/properties">
          <button className="px-6 py-3 bg-[#0249a8] text-white font-semibold rounded-full hover:shadow-md transition-all duration-300">
            Browse All Properties
          </button>
        </Link>
      </div>
    </div>
  </ScrollAnimation>
</div>


          )}
        </div>

        {/* View All */}
        <ScrollAnimation delay={0.3}>
          <div className="text-center mt-7 mb-2">
            <Link href="/properties">
              <button className="px-8 py-3.5 bg-[#0249a8] hover:bg-[#0249a8] text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-sm gap-2 inline-flex items-center">
                View All Properties <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </ScrollAnimation>
      </div>

      {/* Share Popup Modal - COMPACT WITH PROPERTY INFO */}
      {sharePopup.isOpen && sharePopup.property && (() => {
        const prop = sharePopup.property;
        let propImages: string[] = [];
        if (prop.photo_urls && Array.isArray(prop.photo_urls)) propImages = prop.photo_urls;
        else if (prop.images && Array.isArray(prop.images)) propImages = prop.images;
        else if (prop.photos && Array.isArray(prop.photos)) propImages = prop.photos;
        else if (prop.image_urls && Array.isArray(prop.image_urls)) propImages = prop.image_urls;
        
        const propImage = propImages.length > 0 ? propImages[0] : 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600';
        const propName = prop.name || prop.property_name || 'Premium Property';
        const propPrice = prop.starting_price || prop.price || prop.monthly_rent || prop.rent || 15000;
        const propBeds = prop.total_beds || prop.beds_available || prop.beds || 10;
        const propLocation = prop.address || prop.location || prop.area || 'Location';
        
        return (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeSharePopup}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Property Image */}
              <div className="relative h-40 bg-gradient-to-br from-[#0249a8] to-[#023a88]">
                <img src={propImage} alt={propName} className="w-full h-full object-cover opacity-30" />
                {/* <div className="absolute inset-0 bg-gradient-to-t from-[#0249a8] to-transparent" /> */}
                
                <button
                  onClick={closeSharePopup}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all z-10"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
                
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="flex items-center justify-center mb-2">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm">
                      <Share2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white text-center">Share</h3>
                  <p className="text-blue-100 text-xs text-center">Share this amazing property</p>
                </div>
              </div>

              {/* Property Info Card */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={propImage} alt={propName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-800 truncate">{propName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[#0249a8] font-bold text-sm">₹{Number(propPrice).toLocaleString()}/mo</p>
                      <span className="text-slate-400">•</span>
                      <p className="text-xs text-slate-500">{propBeds} Beds</p>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{propLocation}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Copy Link */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/properties/${prop.slug || prop.id}`}
                      className="flex-1 bg-transparent text-xs text-slate-600 outline-none truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0249a8] hover:bg-[#023a88] text-white rounded-md text-xs font-medium transition-all hover:scale-105 flex-shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Social Share Buttons - 3 columns */}
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleSocialShare('whatsapp')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-200 transition-all hover:scale-105 group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <BsWhatsapp className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleSocialShare('facebook')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-all hover:scale-105 group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <FaFacebookF className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">Facebook</span>
                  </button>

                  <button
                    onClick={() => handleSocialShare('twitter')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 border border-sky-200 transition-all hover:scale-105 group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <FaTwitter className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">Twitter</span>
                  </button>

                  <button
                    onClick={() => handleSocialShare('linkedin')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-300 transition-all hover:scale-105 group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-700 to-cyan-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <FaLinkedinIn className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">LinkedIn</span>
                  </button>

                  <button
                    onClick={() => handleSocialShare('telegram')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 border border-cyan-200 transition-all hover:scale-105 group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <FaTelegramPlane className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">Telegram</span>
                  </button>

                  <button
                    onClick={() => handleSocialShare('email')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-slate-200 transition-all hover:scale-105 group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-600 to-gray-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <MdEmail className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
// ═════════════════════════════════════════════════════════════════════════════
// ABOUT US SECTION - LUXURY STYLE WITH TABS
// ═════════════════════════════════════════════════════════════════════════════
function AboutUsSection() {
  const [activeTab, setActiveTab] = useState<'mission' | 'vision' | 'history'>('mission');

  const tabContent = {
    mission: {
      title: "Our Mission",
      description: "We believe in creating spaces that feel like home. Our properties are designed with modern amenities, safety features, and a vibrant community atmosphere that makes every resident feel welcome and valued.",
      features: [
        "Healthy Meals for Everyone",
        "The Best Parking Space",
        "Premium WiFi & Security",
        "Community Events",
        "Quality Room Service",
        "24/7 Services"
      ]
    },
    vision: {
      title: "Our Vision",
      description: "To become India's most trusted co-living platform, setting new standards in comfort, community, and convenience. We envision a future where finding the perfect home is seamless, and every resident experiences premium living at affordable prices.",
      features: [
        "Expand Across 50+ Cities",
        "Smart Home Integration",
        "Sustainable Living Spaces",
        "Enhanced Digital Experience",
        "Premium Lifestyle Services",
        "Community-First Approach"
      ]
    },
    history: {
      title: "Our History",
      description: "Founded in 2020, Roomac started with a simple vision: to revolutionize co-living in India. From our first property in Pune to now serving 500+ happy residents across multiple cities, we've grown by staying true to our core values of quality, community, and trust.",
      features: [
        "2020 - Founded in Pune",
        "2021 - 100+ Residents",
        "2022 - Multi-City Expansion",
        "2023 - 500+ Happy Residents",
        "2024 - Premium Properties",
        "2025 - Award-Winning Service"
      ]
    }
  };

  const categories = [
    {
      title: "Students",
      description: "Affordable PGs near colleges with food, WiFi & a safe environment.",
      image: "https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      title: "Working Professionals",
      description: "Premium stays near IT parks with power backup & housekeeping.",
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      title: "Couples",
      description: "Private & comfortable couple-friendly rooms with full privacy.",
      image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Corporate Stays",
      description: "Short & long-term stays for teams with complete support.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
    },
  ];

  const currentContent = tabContent[activeTab];

  return (
    <ScrollAnimation>
      <section className="bg-gradient-to-br from-slate-50 to-white py-6 sm:py-6 lg:py-5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* DESKTOP VIEW - Side by Side */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 xl:gap-16 items-center mb-16">
            
            {/* LEFT SIDE - Content */}
            <div>
              <div className="mb-3">
                <span className="text-xs font-semibold text-[#0249a8] tracking-widest uppercase">
                  About Roomac
                </span>
              </div>
              
              <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-6 leading-tight text-slate-900">
                We Provide Premium Living Spaces To All Visitors
              </h2>
              
              <p className="text-slate-600 text-sm xl:text-base leading-relaxed mb-8">
                At Roomac, luxury is more than just a word — it's a tradition. From exquisite 
                design to personalized service, every detail is thoughtfully curated to 
                create unforgettable living experiences.
              </p>

              {/* Tabs */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button 
                  onClick={() => setActiveTab('mission')}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 shadow-md ${
                    activeTab === 'mission' 
                      ? 'bg-[#0249a8] text-white' 
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Our Mission
                </button>
                <button 
                  onClick={() => setActiveTab('vision')}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 shadow-md ${
                    activeTab === 'vision' 
                      ? 'bg-[#0249a8] text-white' 
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Our Vision
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 shadow-md ${
                    activeTab === 'history' 
                      ? 'bg-[#0249a8] text-white' 
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Our History
                </button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {currentContent.description}
                  </p>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-8">
                    {currentContent.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#0249a8] mt-2 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* CTA Button */}
              <Link href="/about">
                <button className="px-8 py-3.5 bg-[#0249a8] hover:bg-[#023a88] text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center gap-2">
                  More About Us
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            {/* RIGHT SIDE - Two Images */}
            <div className="relative">
              <div className="relative h-[600px] xl:h-[650px]">
                
                {/* Top Right Image - Larger, Landscape */}
                <div className="absolute top-0 right-0 w-[90%] h-[48%] rounded-3xl overflow-hidden shadow-2xl z-10">
                  <img 
                    src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80" 
                    alt="Luxury Living Space" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Bottom Left Image - Smaller */}
                <div className="absolute bottom-0 left-0 w-[75%] h-[58%] rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg?auto=compress&cs=tinysrgb&w=900" 
                    alt="Premium Amenities" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-[#0249a8]/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-blue-400/5 rounded-full blur-2xl -z-10" />
              </div>
            </div>

          </div>

          {/* MOBILE/TABLET VIEW - Stacked */}
          <div className="lg:hidden mb-10">
            {/* Content First */}
            <div className="mb-8">
              <div className="mb-3">
                <span className="text-xs font-semibold text-[#0249a8] tracking-widest uppercase">
                  About Roomac
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight text-slate-900">
                We Provide Premium Living Spaces To All Visitors
              </h2>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                At Roomac, luxury is more than just a word — it's a tradition. From exquisite 
                design to personalized service, every detail is thoughtfully curated to 
                create unforgettable living experiences.
              </p>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                <button 
                  onClick={() => setActiveTab('mission')}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 shadow-md ${
                    activeTab === 'mission' 
                      ? 'bg-[#0249a8] text-white' 
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Our Mission
                </button>
                <button 
                  onClick={() => setActiveTab('vision')}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 shadow-md ${
                    activeTab === 'vision' 
                      ? 'bg-[#0249a8] text-white' 
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Our Vision
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 shadow-md ${
                    activeTab === 'history' 
                      ? 'bg-[#0249a8] text-white' 
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Our History
                </button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {currentContent.description}
                  </p>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {currentContent.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#0249a8] mt-2 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* CTA Button */}
              <Link href="/about">
                <button className="px-6 sm:px-8 py-3 sm:py-3.5 bg-[#0249a8] hover:bg-[#023a88] text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center gap-2 w-full sm:w-auto justify-center">
                  More About Us
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            {/* Images Below on Mobile */}
            <div className="relative h-[350px] sm:h-[450px] md:h-[500px]">
              {/* Top Right Image */}
              <div className="absolute top-0 right-0 w-[85%] sm:w-[90%] h-[48%] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl z-10">
                <img 
                  src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80" 
                  alt="Luxury Living Space" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bottom Left Image */}
              <div className="absolute bottom-0 left-0 w-[75%] sm:w-[75%] h-[58%] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg?auto=compress&cs=tinysrgb&w=900" 
                  alt="Premium Amenities" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* WHO IS ROOMAC FOR SECTION */}
<div className="mt-10 sm:mt-12 lg:mt-2">
  <div className="text-center mb-10 sm:mb-14">
    <div className="inline-flex items-center justify-center mb-4">
      <div className="h-1.5 w-8 sm:h-2 sm:w-10 bg-gradient-to-r from-[#0249a8] to-blue-400 rounded-full" />
      <span className="mx-3 sm:mx-4 text-xs sm:text-sm font-bold text-[#0249a8] tracking-widest uppercase">
        Perfect For Everyone
      </span>
      <div className="h-1.5 w-8 sm:h-2 sm:w-10 bg-gradient-to-l from-[#0249a8] to-blue-400 rounded-full" />
    </div>

    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
      <span className="text-slate-900">Find Your </span>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0249a8] to-blue-500">Perfect Space</span>
    </h2>

    <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
      Whether you're a student, professional, or looking for a couple-friendly stay, 
      we have the perfect home waiting for you
    </p>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
    {categories.map((category, index) => (
      <ScrollAnimation key={index} delay={index * 0.1}>
        <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl h-[280px] sm:h-[320px] lg:h-[360px] cursor-pointer transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
          {/* Image with Ken Burns Effect */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={category.image}
              alt={category.title}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            />
          </div>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0249a8]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Icon Circle - Appears on Hover */}
          <div className="absolute top-6 right-6 transform translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
              {index === 0 && <Building2 className="w-7 h-7 text-white" />}
              {index === 1 && <Zap className="w-7 h-7 text-white" />}
              {index === 2 && <Heart className="w-7 h-7 text-white" />}
              {index === 3 && <Home className="w-7 h-7 text-white" />}
            </div>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 transform transition-all duration-500 group-hover:translate-y-0">
            
            {/* Number Badge */}
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 mb-4 transform transition-all duration-500 group-hover:scale-110">
              <span className="text-white font-bold text-lg">{index + 1}</span>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 transform transition-all duration-500 group-hover:translate-x-1">
              {category.title}
            </h3>

            {/* Description */}
            <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-4 line-clamp-2 transform transition-all duration-500 group-hover:line-clamp-none">
              {category.description}
            </p>

            {/* Learn More Link - Slides in on Hover */}
            <div className="flex items-center gap-2 text-white font-semibold text-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
              <span>Explore Options</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>

          {/* Decorative Border on Hover */}
          <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-2xl sm:rounded-3xl transition-all duration-500" />
        </div>
      </ScrollAnimation>
    ))}
  </div>


  

  
</div>
        </div>
      </section>
    </ScrollAnimation>
  );
}

function FeaturesSection({ features }: { features: any[] }) {
  return (
    <ScrollAnimation>
      <section className="relative  sm:py-10 mt-4 mb-0 bg-white px-4 sm:px-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          {/* Header Section - Minimal with brand colors */}
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            {/* Yellow accent line */}
            <div className="w-12 h-0.5 bg-[#fdbc0a] rounded-full mb-4" />
            
            {/* Main Heading */}
           <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
  <span className="text-slate-900">Everything you need,</span>
  <br />
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0249a8] to-blue-500">
    all in one place
  </span>
</h2>

            
            {/* Description */}
            <p className="text-sm sm:text-base text-slate-500 font-light max-w-md">
              Premium amenities and services designed for your comfort
            </p>
          </div>
          
          {/* Features Grid - Clean Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {features.map((item, i) => (
              <ScrollAnimation key={i} delay={i * 0.05}>
                <FeatureCardMinimal {...item} index={i} />
              </ScrollAnimation>
            ))}
          </div>
          
          {/* Subtle view all link */}
          {/* <div className="flex justify-center mt-12">
            <Link href="/amenities" className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-[#0049b0] transition-colors duration-300 group">
              View all amenities
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div> */}
        </div>
      </section>
    </ScrollAnimation>
  );
}

// Minimal Feature Card Component with Brand Colors
function FeatureCardMinimal({ icon: Icon, title, desc, index }: any) {
  return (
    <div className="group h-full">
      <div className="flex flex-col items-center text-center p-5 sm:p-6 md:p-7 bg-white hover:bg-slate-50 rounded-xl transition-all duration-300 h-full">
        
        {/* Icon - Clean circle with brand blue */}
        <div className="relative mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-[#0049b0]/5 group-hover:bg-[#0049b0] flex items-center justify-center transition-all duration-300">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-[#0049b0] group-hover:text-white transition-all duration-300" strokeWidth={1.5} />
          </div>
          
          {/* Small yellow dot accent - appears on every 3rd card */}
          {index % 3 === 0 && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#fdbc0a] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-sm sm:text-base md:text-lg font-medium text-slate-800 mb-2 group-hover:text-[#0049b0] transition-colors duration-300">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {desc}
        </p>
        
        {/* Minimal hover indicator - yellow line */}
        <div className="w-8 h-0.5 bg-[#fdbc0a]/0 group-hover:bg-[#fdbc0a] rounded-full mt-4 transition-all duration-300" />
      </div>
    </div>
  );
}