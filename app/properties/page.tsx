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
