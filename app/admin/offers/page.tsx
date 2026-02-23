// app/admin/offers/page.tsx (Server Component)
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import OffersClientPage from '@/components/admin/offers/OffersClientPage';
import { Offer, offerApi } from '@/lib/offerApi';

export default function OffersPage() {
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const limit = 10;
  const initialParams = {
    page,
    limit,
    search: searchParams.get('search') || '',
    offer_type: searchParams.get('offer_type') || '',
    property_id: searchParams.get('property_id') || '',
    is_active: searchParams.get('is_active') === 'false' ? false : undefined,
  };
  const [initialOffers, setInitialOffers] = useState<Offer[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    offerApi.getPaginated(initialParams)
      .then((response) => {
        if (response.success) {
          setInitialOffers(response.data);
          setPagination(response.pagination);
        }
      })
      .catch((err) => console.error('Error fetching initial offers:', err))
      .finally(() => setLoading(false));
  }, [page, searchParams.get('search'), searchParams.get('offer_type'), searchParams.get('property_id'), searchParams.get('is_active')]);

  if (loading) return <div className="p-4">Loading...</div>;
  const searchParamsObj = {
    page: searchParams.get('page') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    offer_type: searchParams.get('offer_type') ?? undefined,
    property_id: searchParams.get('property_id') ?? undefined,
    is_active: searchParams.get('is_active') ?? undefined,
  };
  return (
    <OffersClientPage 
      initialOffers={initialOffers}
      initialPagination={pagination}
      searchParams={searchParamsObj}
    />
  );
}