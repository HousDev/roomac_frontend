// app/properties/[slug].page.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { listProperties, getProperty } from "@/lib/propertyApi";
import { listRoomsByProperty } from "@/lib/roomsApi";
import { offerApi } from "@/lib/offerApi";
import { transformPropertyData, transformRoomData } from '@/components/properties/propertyTransformers';
import PropertyDetailView from '@/components/properties/PropertyDetailView';
import { generatePropertySlug, extractIdFromSlug,getOrCreateTrackingId  } from '@/lib/slugUtils';

// Loading component with skeleton for better UX
const loadingFallback = (
  <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-sm md:text-lg font-semibold text-gray-700">Loading property details...</p>
    </div>
  </div>
);

// SEO Meta Tags Component
function SEOHeaders({ propertyData }: { propertyData: any }) {
  if (!propertyData) return null;

  // Use location field from your transformer
  const location = propertyData.location || 'Your City';
  
  const title = `${propertyData.name} - Student Housing in ${location} | Roomac.in`;
  const description = propertyData.description?.substring(0, 160) || 
    `Book ${propertyData.name} for student housing. Located in ${location} with ${propertyData.total_beds || 0} beds available. Starting at ₹${propertyData.starting_price}/month.`;
  
  // Generate canonical URL using SEO-friendly slug
  const seoSlug = generatePropertySlug({
    name: propertyData.name,
    location: propertyData.location,
    id: propertyData.id
  });
  const canonicalUrl = `https://www.roomac.in/properties/${seoSlug}`;
  
  const imageUrl = propertyData.photo_urls?.[0] || 'https://www.roomac.in/default-property.jpg';

  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": propertyData.name,
    "description": description,
    "image": imageUrl,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": propertyData.address || '',
      "addressLocality": propertyData.location || '',
      "addressCountry": "IN"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": propertyData.starting_price,
      "offerCount": propertyData.total_beds || 0,
      "availability": propertyData.occupied_beds < propertyData.total_beds ? 
        "https://schema.org/InStock" : "https://schema.org/LimitedAvailability"
    }
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      <meta name="keywords" content={`student housing, pg accommodation, ${propertyData.location}, ${propertyData.name}`} />
      <meta name="robots" content="index, follow" />
      
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}

function PropertyDetailsContent({ slug }: { slug: string }) {
  const [content, setContent] = useState<React.ReactNode>(loadingFallback);
  const [propertyData, setPropertyData] = useState<any>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trackingId = searchParams.get('tf');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let propertyData: ReturnType<typeof transformPropertyData> | null = null;
        
        // METHOD 1: Try to extract ID from the SEO-friendly slug
        const propertyId = extractIdFromSlug(slug);

        if (propertyId) {
          const response = await getProperty(propertyId);
          if (!cancelled && response.success && response.data) {
            propertyData = transformPropertyData(response.data);
          }
        }

        // METHOD 2: If that fails, try parsing as numeric ID
        if (!cancelled && !propertyData) {
          const numericId = parseInt(slug, 10);
          if (!isNaN(numericId)) {
            const response = await getProperty(String(numericId));
            if (!cancelled && response.success && response.data) {
              propertyData = transformPropertyData(response.data);
            }
          }
        }

        // METHOD 3: Try to find by name in the list
        if (!cancelled && !propertyData) {
          const allPropertiesResponse = await listProperties();
          if (allPropertiesResponse.success && allPropertiesResponse.data) {
            const list = Array.isArray((allPropertiesResponse.data as any))
              ? (allPropertiesResponse.data as any)
              : (allPropertiesResponse.data as any)?.data;
            const arr = Array.isArray(list) ? list : [];
            
            // Get the name part from slug (remove the ID from end)
            const slugParts = slug.split('-');
            slugParts.pop(); // Remove the ID part
            const searchName = slugParts.join(' ').toLowerCase();
            
            const foundProperty = arr.find((p: any) => 
              (p.name || '').toLowerCase().includes(searchName) ||
              (p.name || '').toLowerCase().replace(/\s+/g, '-') === slug
            );
            
            if (foundProperty) {
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
              <div className="text-center">
                <p className="text-gray-700 text-lg mb-4">Property not found.</p>
                <button 
                  onClick={() => navigate('/properties')}
                  className="px-6 py-2 bg-[#0249a8] text-white rounded-lg hover:bg-[#023a88] transition-colors"
                >
                  Browse Properties
                </button>
              </div>
            </div>
          );
          return;
        }

        setPropertyData(propertyData);

        // Generate the expected SEO-friendly slug
        const expectedSlug = generatePropertySlug({
          name: propertyData.name,
          area: propertyData.area,
          city: propertyData.city,
          id: propertyData.id
        });

        // Get or create tracking ID for this property
        const storedTrackingId = getOrCreateTrackingId(propertyData.id);

         // If current slug doesn't match expected slug, redirect with tracking
        if (slug !== expectedSlug && slug !== String(propertyData.id)) {
          navigate(`/properties/${expectedSlug}?tf=${storedTrackingId}`, { replace: true });
          return;
        }

        // Fetch rooms and offers
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
          <>
            <SEOHeaders propertyData={propertyData} />
            <PropertyDetailView
              propertyData={{ ...propertyData, rooms }}
              offers={offers}
              trackingId={trackingId || storedTrackingId}
            />
          </>
        );
      } catch (error) {
        console.error('Error loading property:', error);
        if (cancelled) return;
        
        // Extract name from slug for fallback
        const slugParts = slug.split('-');
        const id = slugParts.pop() || '';
        const nameFromSlug = slugParts.join(' ').replace(/\b\w/g, l => l.toUpperCase());
        
        const fallbackData = transformPropertyData({
          id: id || slug,
          name: nameFromSlug || 'Property',
          area: 'Location information',
          address: 'Address not available',
          description: 'Property details temporarily unavailable.',
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
        
        setPropertyData(fallbackData);
        setContent(
          <>
            <SEOHeaders propertyData={fallbackData} />
            <PropertyDetailView
              propertyData={{ ...fallbackData, rooms: [] }}
              offers={[]}
            />
          </>
        );
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  return <>{content}</>;
}

export default function PropertyPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  
  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-700 text-lg mb-4">Invalid property URL.</p>
          <button 
            onClick={() => window.location.href = '/properties'}
            className="px-6 py-2 bg-[#0249a8] text-white rounded-lg hover:bg-[#023a88] transition-colors"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }
  
  return <PropertyDetailsContent slug={slug} />;
}