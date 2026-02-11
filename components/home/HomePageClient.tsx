// components/home/HomePageClient.tsx
"use client";

import { useState, useEffect, useCallback, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react';
import { motion } from 'framer-motion';
import Link from '@/src/compat/next-link';
import { 
  Phone, MessageSquare, BedDouble, ArrowUp, ChevronLeft, ChevronRight,
  Wifi, Utensils, Shield, Clock, Car, Zap, Building2, MapPin, Star, Search,
  ArrowRight, CheckCircle2, TrendingUp, Award, Heart, Sparkles, Home, Bath
} from 'lucide-react';
import { BsWhatsapp } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import { Card as UICard, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ScrollAnimation from './ScrollAnimation';
import PropertyCard from './PropertyCard';
import TestimonialsSlider from './TestimonialsSlider';
import OffersSlider from './OffersSlider';
import FloatingActions from './FloatingActions';
import CardScrollAnimation from './CardScrollAnimation';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1, ease: "easeOut" as const }
  }
};

interface HomePageClientProps {
  initialCities: any[];
  initialProperties: any[];
  initialOffers: any[];
}

export default function HomePageClient({ 
  initialCities, 
  initialProperties, 
  initialOffers 
}: HomePageClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [properties] = useState(initialProperties);
  const [offers] = useState(initialOffers);
  const [searchArea, setSearchArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [likedProperties, setLikedProperties] = useState<Set<number>>(new Set());

   // Always include Pune in cities list (static)
 // Ensure Pune is always in the cities list
  const [cities] = useState(() => {
    const hasPune = initialCities.some(city => 
      city.name.toLowerCase().trim() === 'pune'
    );
    
    if (!hasPune) {
      return [
        { id: 'pune-id', name: 'Pune' },
        ...initialCities
      ];
    }
    
    return initialCities;
  });

   // Set Pune as default city
  const [selectedCity, setSelectedCity] = useState('pune'); // Always 'pune' as value

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleWhatsAppClick = (phoneNumber: string, propertyName: string, location: string) => {
    const message = `Hi, I'm interested in ${propertyName} at ${location}. Can you share more details?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCallClick = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleHeartClick = (propertyId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setLikedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
        // Optional: Show unlike toast
        console.log(`Removed property ${propertyId} from favorites`);
      } else {
        newSet.add(propertyId);
        // Optional: Show like toast
        console.log(`Added property ${propertyId} to favorites`);
      }
      return newSet;
    });
  };

  const features = [
    { icon: Wifi, title: 'High-Speed WiFi', desc: 'Blazing fast internet for work & entertainment' },
    { icon: Utensils, title: 'Healthy Meals', desc: 'Nutritious breakfast, lunch & dinner' },
    { icon: Shield, title: '24/7 Security', desc: 'CCTV surveillance & biometric access' },
    { icon: Clock, title: 'Housekeeping', desc: 'Daily cleaning & laundry services' },
    { icon: Car, title: 'Free Parking', desc: 'Secure parking for bikes & cars' },
    { icon: Zap, title: 'Power Backup', desc: 'Uninterrupted electricity with DG' },
    { icon: Home, title: 'Fully Furnished', desc: 'Move-in ready with all amenities' },
    { icon: Heart, title: 'Community', desc: 'Events, networking & fun activities' },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <HeroSection isMounted={isMounted} />

      {/* Filters Section */}
      <FiltersSection 
        isMounted={isMounted}
        cities={cities}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        searchArea={searchArea}
        setSearchArea={setSearchArea}
      />

      {/* Properties Section - EXACT DESIGN FROM ORIGINAL */}
      <PropertiesSection 
        properties={properties} 
        loading={loading} 
        likedProperties={likedProperties}
        onWhatsAppClick={handleWhatsAppClick}
        onCallClick={handleCallClick}
        onHeartClick={handleHeartClick}
      />

      {/* Who Is For Section */}
      <WhoIsForSection />

      {/* Features Section */}
      <FeaturesSection features={features} />

      {/* Offers Section */}
      <OffersSlider offers={offers} />

      {/* Testimonials Section */}
      <TestimonialsSlider />

      {/* Floating Actions */}
      <FloatingActions />
    </div>
  );
}

// Hero Section Component
function HeroSection({ isMounted }: { isMounted: boolean }) {
  return (
    <section className="relative  sm:min-h-[90vh] flex items-center bg-gradient-to-br from-slate-50 via-blue-200 to-blue-50 overflow-hidden px-2 pb-7 sm:px-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDRBQUQiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
      
      {/* Animated Dots - Mobile me hide kardiya kuch dots */}
      <div className="absolute inset-0 overflow-hidden">
        {[
          { position: 'top-10 left-10', color: 'yellow-400', delay: 0, mobileHide: false },
          { position: 'top-12 right-15', color: 'cyan-400', delay: 0.3, mobileHide: true },
          { position: 'top-1/2 left-20', color: 'blue-400', delay: 0.6, mobileHide: true },
          { position: 'top-1/2 right-25', color: 'primary', delay: 0.9, mobileHide: true },
          { position: 'bottom-20 left-15', color: 'yellow-400/70', delay: 1.2, mobileHide: false },
          { position: 'bottom-15 right-20', color: 'cyan-300', delay: 1.5, mobileHide: true },
          { position: 'top-1/3 left-1/2', color: 'blue-400/70', delay: 0.4, mobileHide: true },
          { position: 'bottom-1/3 left-1/2', color: 'primary/70', delay: 1.8, mobileHide: true },
        ].map((dot, index) => (
          <motion.div
            key={index}
            className={`absolute ${dot.position} w-2 h-2 bg-${dot.color} rounded-full ${dot.mobileHide ? 'hidden md:block' : ''}`}
            animate={{
              y: [0, dot.position.includes('top') ? -10 : 10, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + index * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: dot.delay
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Mobile: Single column, Desktop: Two columns */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-8 md:gap-12 items-center">
            
            {/* Left Content Column */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={isMounted ? "visible" : "hidden"}
              className="px-2 sm:px-0 order-2 lg:order-1" // Mobile me neeche, Desktop me pehle
            >
              <motion.div variants={fadeInUp}>
                <Badge className="mb-4 sm:mb-6 bg-white shadow-lg backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border border-blue-200 text-blue-600 transform hover:border-y-indigo-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white transition-all duration-300 inline-flex">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-blue-600" />                    
                  India's Premium Co-Living Platform
                </Badge>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                  <span className="block text-slate-900">Your Perfect</span>
                  <span className="block bg-gradient-to-r from-primary via-blue-900 to-cyan-800 bg-clip-text text-transparent">
                    Home Awaits
                  </span>
                </h1>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <p className="text-base sm:text-lg md:text-xl text-black mb-6 sm:mb-8 leading-relaxed">
                  Experience premium co-living spaces designed for comfort, community, and convenience. Find your ideal room in minutes.
                </p>
              </motion.div>

              {/* Stats - Mobile me single column, Desktop me side by side */}
              <motion.div variants={staggerContainer} className="flex flex-col md:flex-row md:flex-wrap gap-4 sm:gap-6 mb-6 sm:mb-8">
                <motion.div variants={fadeInUp} className="flex items-center gap-2 sm:gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base text-black">500+ Happy Residents</p>
                    <p className="text-xs sm:text-sm text-slate-500">Living their best life</p>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-center gap-2 sm:gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base text-black">4.7 Average Rating</p>
                    <p className="text-xs sm:text-sm text-slate-500">Trusted by residents</p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4 pb-10">
                <Link href="/properties" className="flex-1">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-primary w-full text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base h-12 sm:h-14 gap-2">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                    Explore Properties
                  </Button>
                </Link>
                <Link href="/contact" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full border-2 border-slate-800 hover:border-slate-900 text-black h-12 sm:h-14 hover:shadow-lg transition-all duration-300 ">
                    Talk to Expert
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right side image grid - Mobile me upar, Desktop me right side */}
            <div className="order-1 lg:order-2 mb-6 lg:mb-0 w-full">
              <ImageGrid isMounted={isMounted} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
// ImageGrid Component
function ImageGrid({ isMounted }: { isMounted: boolean }) {
// Replace the fourDirectionVariants object in the ImageGrid component:

const fourDirectionVariants = {
  left: {
    hidden: { opacity: 0, x: -100, scale: 0.9 },
    visible: { 
      opacity: 1, x: 0, scale: 1,
      transition: { type: "spring" as const, stiffness: 80, damping: 15, duration: 0.6, delay: 0.2 }
    }
  },
  right: {
    hidden: { opacity: 0, x: 100, scale: 0.9 },
    visible: { 
      opacity: 1, x: 0, scale: 1,
      transition: { type: "spring" as const, stiffness: 80, damping: 15, duration: 0.6, delay: 0.3 }
    }
  },
  top: {
    hidden: { opacity: 0, y: -100, scale: 0.9 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { type: "spring" as const, stiffness: 80, damping: 15, duration: 0.6, delay: 0.4 }
    }
  },
  bottom: {
    hidden: { opacity: 0, y: 100, scale: 0.9 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { type: "spring" as const, stiffness: 80, damping: 15, duration: 0.6, delay: 0.5 }
    }
  }
};

  const images = [
    { src: "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg", alt: "Modern living room", variant: "left", className: "h-48" },
    { src: "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg", alt: "Cozy bedroom", variant: "right", className: "h-32" },
    { src: "https://images.pexels.com/photos/1428348/pexels-photo-1428348.jpeg", alt: "Community space", variant: "top", className: "h-32" },
    { src: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg", alt: "Comfortable workspace", variant: "bottom", className: "h-48" },
  ];

  return (
    <motion.div className="relative lg:block hidden" initial="hidden" animate={isMounted ? "visible" : "hidden"} variants={staggerContainer}>
      <div className="relative">
        {/* Animated background circles */}
        <AnimatedCircles />
        
        {/* Image grid */}
        <div className="relative grid grid-cols-2 gap-4">
          <div className="space-y-4">
            {images.slice(0, 2).map((img, index) => (
              <motion.div key={index} variants={fourDirectionVariants[img.variant as keyof typeof fourDirectionVariants]} initial="hidden" animate={isMounted ? "visible" : "hidden"}>
                <div className={`shadow-2xl border-0 overflow-hidden rounded-xl border border-slate-200 bg-white ${index === 0 ? 'transform hover:scale-105 transition-transform' : ''}`}>
                  <div className={`${img.className} bg-gradient-to-br from-blue-100 to-blue-300 relative overflow-hidden`}>
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="space-y-4 pt-12">
            {images.slice(2, 4).map((img, index) => (
              <motion.div key={index + 2} variants={fourDirectionVariants[img.variant as keyof typeof fourDirectionVariants]} initial="hidden" animate={isMounted ? "visible" : "hidden"}>
                <div className={`shadow-2xl border-0 overflow-hidden rounded-xl border border-slate-200 bg-white ${index === 1 ? 'transform hover:scale-105 transition-transform' : ''}`}>
                  <div className={`${img.className} bg-gradient-to-br from-cyan-100 to-blue-100 relative overflow-hidden`}>
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AnimatedCircles() {
  return (
    <>
      <motion.div className="absolute -top-9 -left-6 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-30"
        animate={{ scale: [1, 1.1, 1], x: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      <motion.div className="absolute -top-6 -right-6 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-30"
        animate={{ scale: [1, 1.2, 1], y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2.7 }}
      />
      <motion.div className="absolute -bottom-6 left-10 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-30"
        animate={{ scale: [1, 1.15, 1], x: [0, -10, 0], y: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </>
  );
}

// Filters Section Component
interface FiltersSectionProps {
  isMounted: boolean;
  cities: any[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  searchArea: string;
  setSearchArea: (area: string) => void;
}

function FiltersSection({ 
  isMounted, 
  cities, 
  selectedCity, 
  setSelectedCity, 
  searchArea, 
  setSearchArea 
}: FiltersSectionProps) {
   // Get display value for SelectValue - STATIC
  const getSelectedCityDisplay = () => {
    // Always show Pune as selected
    return "Pune";
  };
  return (
    <motion.section 
      className="py-6 sm:py-8 bg-white -mt-8 sm:-mt-12 md:-mt-16 relative border-collapse z-20 px-2 sm:px-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <motion.div variants={fadeInUp} initial="hidden" animate={isMounted ? "visible" : "hidden"} transition={{ delay: 1.6 }}>
          <UICard className="border rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-sm hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 mx-1">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                <motion.div variants={fadeInUp} transition={{ delay: 1.7 }} className="md:col-span-1">
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="h-11 sm:h-12 rounded-lg sm:rounded-xl bg-white border-2 border-blue-200/70 text-slate-700 hover:border-blue-400  focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-sm text-sm sm:text-base">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg sm:rounded-xl shadow-xl border border-blue-100 bg-white">
                      {cities.map((city: any) => (
                        <SelectItem key={city.id} value={city.name.toLowerCase()} className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 transition-colors text-sm sm:text-base">
                          <div className="flex items-center gap-2 text-black">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary " />
                            {city.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ delay: 1.8 }} className="md:col-span-1">
                  <Input
                    placeholder="Search by locality..."
                    value={searchArea}
                    onChange={(e) => setSearchArea(e.target.value)}
                    className="h-11 sm:h-12 rounded-lg sm:rounded-xl bg-white border-2 border-blue-200/70 text-slate-700 hover:border-blue-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-sm text-sm sm:text-base"
                  />
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ delay: 1.9 }} className="md:col-span-1">
                  <Select>
                    <SelectTrigger className="h-11 sm:h-12 rounded-lg sm:rounded-xl bg-white border-2 border-blue-200/70 text-slate-700 hover:border-blue-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-sm text-sm sm:text-base">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg sm:rounded-xl shadow-xl border border-blue-100 bg-white">
                      <SelectItem value="pg" className="hover:bg-blue-50 text-sm sm:text-base">
                        <div className="flex items-center gap-2">
                          <Home className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                          PG Accommodation
                        </div>
                      </SelectItem>
                      <SelectItem value="coliving" className="hover:bg-blue-50 text-sm sm:text-base">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                          Co-Living Space
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ delay: 2.0 }} className="w-full md:col-span-1">
                  <Link href="/properties" className="w-full">
                    <Button className="w-full h-11 sm:h-12 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold gap-2 bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0">
                      <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                      Search Properties
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </CardContent>
          </UICard>
        </motion.div>
      </div>
    </motion.section>
  );
}

// Properties Section Component - EXACT DESIGN FROM ORIGINAL WITH WORKING ICONS
interface PropertiesSectionProps {
  properties: any[];
  loading: boolean;
  likedProperties: Set<number>;
  onWhatsAppClick: (phone: string, name: string, location: string) => void;
  onCallClick: (phone: string) => void;
  onHeartClick: (propertyId: number, event: React.MouseEvent) => void;
}

function PropertiesSection({ 
  properties, 
  loading, 
  likedProperties,
  onWhatsAppClick,
  onCallClick,
  onHeartClick
}: PropertiesSectionProps) {
  return (
    <div className="py-12 sm:py-16 bg-gradient-to-b from-blue-50 to-white px-2 sm:px-4">
      <div className="container mx-auto px-3 sm:px-4">
        
        {/* Section Header */}
        <ScrollAnimation>
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>
              <span className="mx-2 sm:mx-4 text-xs sm:text-sm font-semibold text-blue-600 tracking-wider uppercase">
                Premium Selections
              </span>
              <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              <span className="text-slate-900">Featured</span>
              <span className="text-blue-600 ml-2 sm:ml-3">Properties</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-2">
              Handpicked properties with premium amenities and verified reviews
            </p>
          </div>
        </ScrollAnimation>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-2 sm:ml-3 text-sm sm:text-slate-600">Loading properties...</span>
          </div>
        )}

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12">
          {properties.length > 0 ? (
            properties.map((property, index) => {
              // Extract property images - EXACT LOGIC FROM ORIGINAL
              let propertyImages = [];
              
              if (property.photo_urls && Array.isArray(property.photo_urls)) {
                propertyImages = property.photo_urls;
              } else if (property.images && Array.isArray(property.images)) {
                propertyImages = property.images;
              } else if (property.photos && Array.isArray(property.photos)) {
                propertyImages = property.photos;
              } else if (property.image_urls && Array.isArray(property.image_urls)) {
                propertyImages = property.image_urls;
              }
              
              const propertyImage = propertyImages.length > 0 
                ? propertyImages[0] 
                : 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600';
              
              // Property details - EXACT LOGIC FROM ORIGINAL
              const propertyName = property.name || property.property_name || 'Premium Property';
              const propertyAddress = property.address || property.location || property.area || 'Location details available';
              const cityName = property.city?.name || property.city_name || '';
              const fullLocation = cityName ? `${propertyAddress}, ${cityName}` : propertyAddress;
              const propertyPrice = property.starting_price || property.price || property.monthly_rent || property.rent || 15000;
              
              // Extract tags from backend - EXACT LOGIC FROM ORIGINAL
              const propertyTags = property.tags || 
                                  property.property_tags || 
                                  property.category_tags || 
                                  property.labels || 
                                  [];
              
              // Function to get color based on tag type - EXACT LOGIC FROM ORIGINAL
              const getTagColor = (tag: string) => {
                const tagLower = tag.toLowerCase();
                
                // Male related tags
                if (tagLower.includes('male') || tagLower.includes('boys') || tagLower.includes('men')) {
                  return 'bg-gradient-to-r from-blue-600 to-blue-800 text-white';
                }
                
                // Female related tags
                if (tagLower.includes('female') || tagLower.includes('girls') || tagLower.includes('women')) {
                  return 'bg-gradient-to-r from-pink-600 to-rose-600 text-white';
                }
                
                // Couples related tags
                if (tagLower.includes('couple') || tagLower.includes('married')) {
                  return 'bg-gradient-to-r from-purple-600 to-purple-800 text-white';
                }
                
                // Family related tags
                if (tagLower.includes('family')) {
                  return 'bg-gradient-to-r from-green-600 to-green-800 text-white';
                }
                
                // Working professionals
                if (tagLower.includes('working') || tagLower.includes('professional')) {
                  return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
                }
                
                // Students
                if (tagLower.includes('student')) {
                  return 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white';
                }
                
                // Default
                return 'bg-gradient-to-r from-slate-600 to-slate-800 text-white';
              };
              
              // Extract amenities - EXACT LOGIC FROM ORIGINAL
              let amenities = [];
              
              if (property.amenities && Array.isArray(property.amenities)) {
                amenities = property.amenities;
              } else if (property.features && Array.isArray(property.features)) {
                amenities = property.features;
              } else if (property.amenities_list && Array.isArray(property.amenities_list)) {
                amenities = property.amenities_list;
              } else {
                const individualAmenities = [];
                if (property.has_wifi) individualAmenities.push("WiFi");
                if (property.has_meals) individualAmenities.push("Meals");
                if (property.has_security) individualAmenities.push("Security");
                if (property.has_parking) individualAmenities.push("Parking");
                if (property.ac_available) individualAmenities.push("AC");
                if (property.attached_bath) individualAmenities.push("Bath");
                if (property.power_backup) individualAmenities.push("Power");
                if (property.housekeeping) individualAmenities.push("Cleaning");
                amenities = individualAmenities;
              }
              
              const displayAmenities = amenities.slice(0, 6);
              const totalBeds = property.total_beds || property.beds_available || property.beds || 10;
              const occupiedBeds = property.occupied_beds || property.booked_beds || 0;
              const availableBeds = totalBeds - occupiedBeds;
              const propertyType = property.property_type || property.type || '';
              
              return (
                <CardScrollAnimation key={property.id || index} index={index}>
                  <Link href={`/properties/${property.slug || property.id}`} className="group">
                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 h-full">
                      
                      {/* Property Image */}
                      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden ">
                        <img
                          src={propertyImage}
                          alt={propertyName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        {/* DYNAMIC TAGS FROM BACKEND */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                          {propertyTags.slice(0, 3).map((tag: string, tagIndex: number) => (
                            <div 
                              key={tagIndex}
                              className={`px-2 py-1 rounded-md shadow-md ${getTagColor(tag)}`}
                            >
                              <span className="text-xs font-semibold uppercase whitespace-nowrap">
                                {tag}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        {/* If no tags but has property type, show that */}
                        {propertyTags.length === 0 && propertyType && (
                          <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-lg shadow-md z-10">
                            <span className="text-xs font-semibold capitalize">
                              {propertyType}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Property Content */}
                      <div className="p-4 sm:p-4 flex flex-col flex-grow">
                        
                        {/* Title and Price */}
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1 pr-2">
                            {propertyName}
                          </h3>
                          <div className="flex-shrink-0">
                            <p className="text-lg sm:text-xl font-bold text-blue-700">
                              ₹{propertyPrice.toLocaleString()}
                              <span className="text-xl text-slate-500 ml-1">/-</span>
                            </p>
                          </div>
                        </div>
                        
                        {/* Location */}
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-slate-600 line-clamp-1">{fullLocation}</span>
                        </div>
                        
                        {/* Amenities Section */}
                        {displayAmenities.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1.5">
                              {displayAmenities.map((amenity:any, idx:any) => {
                                const colorSets = [
                                  'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:scale-105 hover:-translate-y-0.5',
                                  'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:scale-105 hover:-translate-y-0.5',
                                  'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:scale-105 hover:-translate-y-0.5',
                                  'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:scale-105 hover:-translate-y-0.5',
                                  'bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 hover:scale-105 hover:-translate-y-0.5',
                                  'bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 hover:scale-105 hover:-translate-y-0.5'
                                ];
                                const colorClass = colorSets[idx % colorSets.length];
                                
                                return (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md transition-all duration-300 cursor-pointer ${colorClass}`}
                                  >
                                    {String(amenity)}
                                  </span>
                                );
                              })}
                              {amenities.length > 6 && (
                                <span className="inline-flex items-center px-2 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-md border border-slate-200">
                                  +{amenities.length - 6}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Rating */}
                        <div className="flex items-center justify-between mb-2 pt-2 border-t border-slate-100">
                          <div className="flex flex-col gap-1">
                            {/* Bed and Room in one line */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <BedDouble className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-bold text-slate-800">{totalBeds}</span>
                                <span className="text-xs text-slate-500 ml-0.5">Beds</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Home className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm font-bold text-slate-800">{property.rooms || 1}</span>
                                <span className="text-xs text-slate-500 ml-0.5">Rooms</span>
                              </div>
                            </div>
                            
                            {/* Area */}
                            {property.area && (
                              <div className="flex items-center gap-1 mt-1">
                                <svg className="h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M3 6l9-4 9 4-9 4-9-4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M3 6v12l9 4 9-4V6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M12 22V10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="text-sm  text-slate-500">{property.area}</span>
                                <span className="text-xs text-slate-500 ml-0.5">sqft</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Rating Box */}
                          <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <div>
                              <span className="text-sm font-bold text-slate-800 ml-0.5">{property.rating || 4.5}</span>
                              <span className="text-xs text-slate-500 ml-0.5">/5</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons - UPDATED WITH WORKING ICONS */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <button className="flex items-center justify-center gap-1.5 px-3 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-md hover:shadow-sm transition-all duration-300 text-xm">
                            View Details
                            <ArrowRight className="h-5 w-4" />
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {/* WhatsApp Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const phone = property.whatsapp || '911234567890';
                                onWhatsAppClick(phone, propertyName, fullLocation);
                              }}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-all duration-300 hover:scale-110 cursor-pointer"
                              title="WhatsApp"
                            >
                              <BsWhatsapp className="h-6 w-6 text-emerald-500" />
                            </button>
                            
                            {/* Call Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const phone = property.phone || property.contact_number || '1234567890';
                                onCallClick(phone);
                              }}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-all duration-300 hover:scale-110 cursor-pointer"
                              title="Call"
                            >
                              <Phone className="h-5 w-5 text-blue-500" />
                            </button>
                            
                            {/* Heart/Like Button */}
                            <button
                              onClick={(e) => onHeartClick(property.id || index, e)}
                              className="p-1.5 bg-pink-50 hover:bg-pink-100 rounded-md transition-all duration-300 hover:scale-110 cursor-pointer"
                              title="Save to favorites"
                            >
                              <Heart 
                                className={`h-6 w-6 ${
                                  likedProperties.has(property.id || index) 
                                    ? 'fill-red-500 text-red-500' 
                                    : 'text-red-500'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom Gradient Border */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    </div>
                  </Link>
                </CardScrollAnimation>
              );
            })
          ) : !loading && (
            <ScrollAnimation>
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto">
                  <Building2 className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No Properties Found</h3>
                  <p className="text-slate-500 mb-4">We couldn't find any properties at the moment.</p>
                  <Link href="/properties">
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg hover:shadow-md transition-all duration-300">
                      Browse All Properties
                    </button>
                  </Link>
                </div>
              </div>
            </ScrollAnimation>
          )}
        </div>

        {/* View All Button */}
        <ScrollAnimation delay={0.3}>
          <div className="text-center mt-8 ">
            <Link href="/properties">
              <button className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 text-sm gap-2 inline-flex items-center">
                View All Properties
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}

// Who Is For Section Component
function WhoIsForSection() {
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

  return (
    <ScrollAnimation>
      <section className="bg-white -mt-5 ">
        <div className="max-w-7xl mx-auto px-2">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>
              <span className="mx-2 sm:mx-4 text-xs sm:text-sm font-semibold text-blue-700 tracking-wider uppercase">
                PERFECT FOR EVERYONE
              </span>
              <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 text-center">
              <span className="text-slate-800">Who Is </span>
              <span className="text-blue-600 ml-2">Roomac For?</span>
            </h2>

            <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
              Flexible, fully-furnished PG & co-living spaces designed for every lifestyle
            </p>
          </div>

        <div className="grid grid-cols-1 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 -mt-6">
  {categories.map((category, index) => (
    <div
      key={index}
      className="relative overflow-hidden rounded-xl sm:rounded-2xl
                 h-[180px] sm:h-[200px] md:h-[220px] lg:h-[240px]
                 group"
    >
      {/* Image */}
      <img
        src={category.image}
        alt={category.title}
        className="absolute inset-0 w-full h-full object-cover
                   transition-transform duration-500
                   lg:group-hover:scale-105"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

      {/* Text */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
        <h3 className="text-base sm:text-lg font-semibold leading-tight">
          {category.title}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-white/90 line-clamp-2">
          {category.description}
        </p>
      </div>
    </div>
  ))}
</div>

        </div>
      </section>
    </ScrollAnimation>
  );
}

// Features Section Component
function FeaturesSection({ features }: { features: any[] }) {
  return (
    <ScrollAnimation>
      <section className="relative py-4 sm:py-8 md:py-10 bg-white px-2 sm:px-4 ">
        <div className="container mx-auto px-3 sm:px-4">
          <ScrollAnimation>
            <div className="flex flex-col items-center mt-4">
              <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
                <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>
                <span className="mx-2 sm:mx-4 text-xs sm:text-sm font-semibold text-blue-700 tracking-wider uppercase">
                  Why Choose ROOMAC
                </span>
                <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 text-center">
                <span className="text-slate-800">Everything You Need,</span>
                <span className="text-blue-600 ml-2">All in One Place</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl mb-5 mx-auto px-2 font-sans">
                Premium amenities and services designed for your comfort
              </p>
            </div>
          </ScrollAnimation>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-8">
            {features.map((item, i) => (
              <ScrollAnimation key={i} delay={i * 0.1}>
                <FeatureCard {...item} index={i} />
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>
    </ScrollAnimation>
  );
}

function FeatureCard({ icon: Icon, title, desc, index }: any) {
  const animations = [
    'group-hover:animate-pulse',
    'group-hover:rotate-12 group-hover:-rotate-12',
    'group-hover:scale-110',
    'group-hover:rotate-[360deg]',
    'group-hover:translate-x-1 group-hover:-translate-x-1',
    'group-hover:animate-bounce',
    'group-hover:scale-105',
    'group-hover:animate-pulse'
  ];

  const animationClass = animations[index % animations.length];

  return (
    <div className="group cursor-pointer flex flex-col items-center">
      <div className="relative mb-3 sm:mb-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-15 w-15 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full bg-blue-300 opacity-0 group-hover:opacity-20 group-hover:scale-125 transition-all duration-700"></div>
        </div>
        
        <div className="relative h-15 w-15 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-blue-500 flex items-center justify-center transition-all duration-500 shadow-sm group-hover:shadow-xl overflow-hidden p-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 group-hover:translate-x-full transition-all duration-700 -translate-x-full"></div>
          
          <Icon className={`h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-600 group-hover:text-white transition-all duration-500 ${animationClass}`} strokeWidth={2} />
        </div>
      </div>
      
      <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 mb-1 text-center group-hover:text-blue-600 transition-colors duration-300">
        {title}
      </h3>
      
      <p className="text-xs sm:text-sm text-slate-600 text-center px-2 leading-tight">
        {desc}
      </p>
    </div>
  );
}