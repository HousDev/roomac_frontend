import { Suspense, useEffect, useState } from 'react';
import HomePageClient from '@/components/home/HomePageClient';
import { fetchCities, fetchProperties, fetchOffers } from '@/components/home/api-server';

function HomeLoading() {
  return (
    <div className="flex flex-col overflow-hidden">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-200 to-blue-50 animate-pulse">
        <div className="container mx-auto px-4 py-20">
          <div className="h-96 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

function HomePageWithData() {
  const [data, setData] = useState<{
    cities: unknown[];
    properties: unknown[];
    offers: unknown[];
  } | null>(null);
  useEffect(() => {
    Promise.allSettled([fetchCities(), fetchProperties(), fetchOffers()]).then(([cities, properties, offers]) => {
      setData({
        cities: cities.status === 'fulfilled' ? cities.value : [],
        properties: properties.status === 'fulfilled' ? properties.value : [],
        offers: offers.status === 'fulfilled' ? offers.value : [],
      });
    });
  }, []);
  if (!data) return <HomeLoading />;
  return (
    <HomePageClient
      initialCities={data.cities}
      initialProperties={data.properties}
      initialOffers={data.offers}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomePageWithData />
    </Suspense>
  );
}
