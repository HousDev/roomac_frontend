
"use client";

import { useEffect, useState, useMemo } from 'react';
import { listProperties } from "@/lib/propertyApi";
import HeroSection from '@/components/properties/HeroSection';
import PropertyCard from '@/components/properties/PropertyCard';
import { Loader2 } from 'lucide-react';

// Price range options for filtering - MUST MATCH HERO SECTION LABELS
const PRICE_OPTIONS = [
  { label: "Any Price", min: 0, max: Infinity },
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000 – ₹15,000", min: 10000, max: 15000 },
  { label: "₹15,000 – ₹25,000", min: 15000, max: 25000 },
  { label: "Above ₹25,000", min: 25000, max: Infinity },
];

export default function PropertiesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [properties, setProperties] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchArea, setSearchArea] = useState('');
  const [selectedCity, setSelectedCity] = useState('pune');
  const [selectedPriceKey, setSelectedPriceKey] = useState('Any Price');

  // ✅ FIX: Read URL params directly from window.location
  useEffect(() => {
    setIsMounted(true);
    
    // Get URL params from window location
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      const search = params.get('search');
      const city = params.get('city');
      const price = params.get('price');
      
      // Set states from URL params
      if (search) setSearchArea(decodeURIComponent(search));
      if (city && city !== 'pune') setSelectedCity(decodeURIComponent(city));
      if (price && price !== 'Any Price') setSelectedPriceKey(decodeURIComponent(price));
    }
  }, []); // Empty dependency array - sirf ek baar run hoga

  // Fetch properties
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    (async () => {
      try {
        const res = await listProperties({ page: 1, pageSize: 100 });
        if (cancelled) return;
        
        if (!res?.success || !Array.isArray(res.data)) {
          setProperties([]);
        } else {
          setProperties(res.data);
        }
        setError(null);
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading properties:", err);
          setError("Error loading properties. Please try again.");
          setProperties([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Filter properties based on search criteria
  const filteredProperties = useMemo(() => {
    if (!properties) return [];

    return properties.filter((property) => {
      // City filter
      const cityName = (property.city?.name || property.city_name || '').toLowerCase();
      if (selectedCity && selectedCity !== 'all' && !cityName.includes(selectedCity.toLowerCase())) {
        if (cityName) return false;
      }

      // Search area/locality filter
      if (searchArea.trim()) {
        const q = searchArea.toLowerCase();
        const addr = (property.address || property.location || property.area || '').toLowerCase();
        const name = (property.name || property.property_name || '').toLowerCase();
        if (!addr.includes(q) && !name.includes(q) && !cityName.includes(q)) return false;
      }

      // Price filter
      const price = property.starting_price || property.price || property.monthly_rent || property.rent || 0;
      
      const priceRange = PRICE_OPTIONS.find(p => p.label === selectedPriceKey) || PRICE_OPTIONS[0];
      
      // Check if price is within range
      if (price < priceRange.min || price > priceRange.max) {
        return false;
      }

      return true;
    });
  }, [properties, searchArea, selectedCity, selectedPriceKey]);

  // Get unique cities from properties for filter
  const cities = useMemo(() => {
    if (!properties) return [{ id: 'pune-id', name: 'Pune' }];
    
    const uniqueCities = new Map();
    properties.forEach((property: any) => {
      const cityName = property.city?.name || property.city_name;
      const cityId = property.city?.id || `city-${cityName}`;
      if (cityName && !uniqueCities.has(cityName)) {
        uniqueCities.set(cityName, { id: cityId, name: cityName });
      }
    });
    
    const cityList = Array.from(uniqueCities.values());
    const hasPune = cityList.some((c: any) => c.name.toLowerCase() === 'pune');
    
    return hasPune ? cityList : [{ id: 'pune-id', name: 'Pune' }, ...cityList];
  }, [properties]);

  // Get display text for active filters
  const getFilterDisplayText = () => {
    const parts = [];
    if (searchArea) parts.push(`"${searchArea}"`);
    if (selectedPriceKey !== 'Any Price') parts.push(selectedPriceKey);
    
    if (parts.length === 0) return '';
    return ` matching ${parts.join(' • ')}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">
        <HeroSection 
          isMounted={isMounted}
          cities={cities}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          searchArea={searchArea}
          setSearchArea={setSearchArea}
          selectedPriceKey={selectedPriceKey}
          setSelectedPriceKey={setSelectedPriceKey}
        />
        <div className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-16">
          <p className="text-center py-12 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">
      {/* Hero Section with Filters */}
      <HeroSection 
        isMounted={isMounted}
        cities={cities}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        searchArea={searchArea}
        setSearchArea={setSearchArea}
        selectedPriceKey={selectedPriceKey}
        setSelectedPriceKey={setSelectedPriceKey}
      />

      {/* Results Count */}
      {!loading && properties && (
        <div className="container mx-auto px-3 sm:px-4 py-4">
          <p className="text-sm text-gray-600">
            Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
            {getFilterDisplayText()}
          </p>
        </div>
      )}

      {/* Properties Grid */}
      <div className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No properties found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search criteria
              </p>
              <button
                onClick={() => {
                  setSearchArea('');
                  setSelectedCity('pune');
                  setSelectedPriceKey('Any Price');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}