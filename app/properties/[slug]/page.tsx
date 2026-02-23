
// app/properties/[slug].page.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listProperties, getProperty } from "@/lib/propertyApi";
import { listRoomsByProperty } from "@/lib/roomsApi";
import { offerApi } from "@/lib/offerApi";
import { transformPropertyData, transformRoomData } from '@/components/properties/propertyTransformers';
import PropertyDetailView from '@/components/properties/PropertyDetailView';

const loadingFallback = (
  <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-sm md:text-lg font-semibold text-gray-700">Loading property details...</p>
    </div>
  </div>
);

function PropertyDetailsContent({ slug }: { slug: string }) {
  const [content, setContent] = useState<React.ReactNode>(loadingFallback);

  useEffect(() => {
    let cancelled = false;

    async function load() {
  try {
    let propertyData: ReturnType<typeof transformPropertyData> | null = null;
    const numericId = parseInt(slug, 10);

    if (!isNaN(numericId)) {
      // This calls getProperty with the numeric ID ✅
      const numericResponse = await getProperty(String(numericId));
      if (!cancelled && numericResponse.success && numericResponse.data) {
        propertyData = transformPropertyData(numericResponse.data);
      }
    }

    if (!cancelled && !propertyData) {
      const allPropertiesResponse = await listProperties();
      if (allPropertiesResponse.success && allPropertiesResponse.data) {
        const list = Array.isArray((allPropertiesResponse.data as any))
          ? (allPropertiesResponse.data as any)
          : (allPropertiesResponse.data as any)?.data;
        const arr = Array.isArray(list) ? list : [];
        const foundProperty =
          arr.find((p: { slug?: string }) => p.slug === slug) ||
          arr.find(
            (p: { name?: string }) =>
              (p.name || '').toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
          );
        if (foundProperty) {
          // ✅ RE-FETCH BY ID to get manager_photo_url from JOIN
          const byIdResponse = await getProperty(String(foundProperty.id));
          const fullProperty = byIdResponse.success && byIdResponse.data 
            ? byIdResponse.data 
            : foundProperty;
          propertyData = transformPropertyData(fullProperty);
        }
      }
    }

    if (cancelled) return;
    if (!propertyData) {
      setContent(
        <div className="min-h-screen flex items-center justify-center p-4">
          <p className="text-gray-700">Property not found.</p>
        </div>
      );
      return;
    }

    const [roomsResponse, offersResponse] = await Promise.allSettled([
      listRoomsByProperty(Number(propertyData.id)),
      offerApi.getAll()
    ]);

    const rooms =
      roomsResponse.status === 'fulfilled' && roomsResponse.value.success
        ? (roomsResponse.value.data?.map(transformRoomData) || [])
        : [];
    const offers = offersResponse.status === 'fulfilled' ? offersResponse.value : [];

    if (cancelled) return;
    setContent(
      <PropertyDetailView
        propertyData={{ ...propertyData, rooms }}
        offers={offers}
      />
    );
  } catch (error) {
    console.error('Error loading property:', error);
    if (cancelled) return;
    const fallbackData = transformPropertyData({
      id: slug,
      name: slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      area: 'Location information',
      address: 'Address not available',
      description: 'Property details loading...',
      photo_urls: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
      ],
      total_beds: 0,
      occupied_beds: 0,
      starting_price: 0,
      security_deposit: 0,
      rating: null,
      property_manager_name: 'Manager not available',
      property_manager_phone: '',
      services: []
    });
    setContent(
      <PropertyDetailView
        propertyData={{ ...fallbackData, rooms: [] }}
        offers={[]}
      />
    );
  }
}

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return <>{content}</>;
}

export default function PropertyPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  if (!slug) return null;
  return <PropertyDetailsContent slug={slug} />;
}