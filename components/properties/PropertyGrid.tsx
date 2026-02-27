// components/properties/PropertyGrid.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import PropertyCard from './PropertyCard';
import { generatePropertySlug } from '@/lib/slugUtils';
import { transformPropertyData } from './propertyTransformers';

interface PropertyGridProps {
  initialProperties: any;
}

export default function PropertyGrid({ initialProperties }: PropertyGridProps) {
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});

  const [selectedCity, setSelectedCity] = useState("");
  const [searchArea, setSearchArea] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [budgetRange, setBudgetRange] = useState<[number, number]>([5000, 15000]);

useEffect(() => {
  if (initialProperties?.success && Array.isArray(initialProperties.data)) {
    // Transform each property first
    const transformedProperties = initialProperties.data.map((property: any) => {
      const transformed = transformPropertyData(property);
      
      console.log('Property ID:', property.id, 'Original tags:', property.tags);
      console.log('Property ID:', property.id, 'Transformed tags:', transformed.tags);
      
      return {
        ...property,
        transformedData: transformed, // Store transformed data
        seoSlug: generatePropertySlug({
          name: transformed.name,
          area: transformed.area,
          city: transformed.city,
          id: property.id
        })
      };
    });
    
    console.log('All properties with transformed data:', transformedProperties);
    setProperties(transformedProperties);
    setFilteredProperties(transformedProperties);
    
    const initialIndices: { [key: string]: number } = {};
    transformedProperties.forEach((property: any) => {
      initialIndices[property.id] = 0;
    });
    setCurrentImageIndex(initialIndices);
  }
  setLoading(false);
}, [initialProperties]);


  // Filter properties
  useEffect(() => {
    const filtered = properties.filter((property) => {
      // City filter
      if (selectedCity && property.city) {
        if (!property.city.toLowerCase().includes(selectedCity.toLowerCase())) {
          return false;
        }
      }

      // Search area filter
      if (searchArea) {
        const searchLower = searchArea.toLowerCase();
        const nameMatch = property.name?.toLowerCase().includes(searchLower);
        const areaMatch = property.area?.toLowerCase().includes(searchLower);
        if (!nameMatch && !areaMatch) {
          return false;
        }
      }

      // Type filter
      if (selectedType) {
        const price = Number(property.starting_price || 0);
        if (selectedType === "single" && price < 10000) return false;
        if (selectedType === "double" && price >= 10000) return false;
      }

      // Budget filter
      const price = Number(property.starting_price || 0);
      if (price < budgetRange[0] || price > budgetRange[1]) {
        return false;
      }

      return true;
    });

    setFilteredProperties(filtered);
  }, [properties, selectedCity, searchArea, selectedType, budgetRange]);

  const handleNextImage = useCallback((propertyId: string, totalImages: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] + 1) % totalImages
    }));
  }, []);

  const handlePrevImage = useCallback((propertyId: string, totalImages: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] - 1 + totalImages) % totalImages
    }));
  }, []);

  const handleImageIndexChange = useCallback((propertyId: string, index: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [propertyId]: index
    }));
  }, []);

  const handleFiltersChange = useCallback((filters: any) => {
    setSelectedCity(filters.selectedCity);
    setSearchArea(filters.searchArea);
    setSelectedType(filters.selectedType);
    setBudgetRange(filters.budgetRange);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-lg p-4 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No properties found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {filteredProperties.map((property:any) => (
            <PropertyCard
              key={property.id}
              property={property}
              currentImageIndex={currentImageIndex[property.id] || 0}
              onNextImage={handleNextImage}
              onPrevImage={handlePrevImage}
              onImageIndexChange={handleImageIndexChange}
            />
          ))}
        </div>
      )}
    </>
  );
}