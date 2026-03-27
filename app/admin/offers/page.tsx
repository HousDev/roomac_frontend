// // app/admin/offers/page.tsx (Server Component)
// import { useState, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import OffersClientPage from '@/components/admin/offers/OffersClientPage';
// import { Offer, offerApi } from '@/lib/offerApi';

// export default function OffersPage() {
//   const [searchParams] = useSearchParams();
//   const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
//   const limit = 10;
//   const initialParams = {
//     page,
//     limit,
//     search: searchParams.get('search') || '',
//     offer_type: searchParams.get('offer_type') || '',
//     property_id: searchParams.get('property_id') || '',
//     is_active: searchParams.get('is_active') === 'false' ? false : undefined,
//   };
//   const [initialOffers, setInitialOffers] = useState<Offer[]>([]);
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalItems: 0,
//     limit,
//     hasNextPage: false,
//     hasPrevPage: false,
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     offerApi.getPaginated(initialParams)
//       .then((response) => {
//         if (response.success) {
//           setInitialOffers(response.data);
//           setPagination(response.pagination);
//         }
//       })
//       .catch((err) => console.error('Error fetching initial offers:', err))
//       .finally(() => setLoading(false));
//   }, [page, searchParams.get('search'), searchParams.get('offer_type'), searchParams.get('property_id'), searchParams.get('is_active')]);

//   if (loading) return <div className="p-4">Loading...</div>;
//   const searchParamsObj = {
//     page: searchParams.get('page') ?? undefined,
//     search: searchParams.get('search') ?? undefined,
//     offer_type: searchParams.get('offer_type') ?? undefined,
//     property_id: searchParams.get('property_id') ?? undefined,
//     is_active: searchParams.get('is_active') ?? undefined,
//   };
//   return (
//     <OffersClientPage 
//       initialOffers={initialOffers}
//       initialPagination={pagination}
//       searchParams={searchParamsObj}
//     />
//   );
// }

// app/admin/offers/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import OffersClientPage from '@/components/admin/offers/OffersClientPage';
import PricingPlansClientPage from '@/components/admin/pricing-plan/PricingPlansClientPage';
import { Offer, offerApi } from '@/lib/offerApi';

export default function OffersPage() {
  const [searchParams] = useSearchParams();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>("offers");
  
  // EXISTING OFFERS LOGIC - UNCHANGED
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

  // Get initial tab from URL hash
  useEffect(() => {
    const getInitialTab = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "offers" || hash === "pricing") return hash;
      const saved = localStorage.getItem("adminOffersPricingActiveTab");
      if (saved === "offers" || saved === "pricing") return saved;
      return "offers";
    };
    setActiveTab(getInitialTab());
  }, []);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
    localStorage.setItem("adminOffersPricingActiveTab", tab);
  };

  // Handle hash change
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "offers" || hash === "pricing") {
        setActiveTab(hash);
        localStorage.setItem("adminOffersPricingActiveTab", hash);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // EXISTING OFFERS DATA FETCHING - UNCHANGED
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

  // EXISTING LOADING STATE - UNCHANGED
  if (loading) return <div className="p-4">Loading...</div>;
  
  const searchParamsObj = {
    page: searchParams.get('page') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    offer_type: searchParams.get('offer_type') ?? undefined,
    property_id: searchParams.get('property_id') ?? undefined,
    is_active: searchParams.get('is_active') ?? undefined,
  };

  // Tab definitions - without counts
  const TABS = [
    {
      key: "offers",
      label: "Offers",
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3L13 13M13 3L3 13" />
          <circle cx="8" cy="8" r="2.5" />
        </svg>
      ),
    },
    {
      key: "pricing",
      label: "Pricing Plans",
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2.5" y="4.5" width="11" height="7" rx="1" />
          <line x1="5.5" y1="8" x2="10.5" y2="8" />
          <line x1="8" y1="8" x2="8" y2="11.5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full px-0 sm:px-0">
      {/* Tabs */}
      <div
        className="flex gap-1.5 px-1 py-2.5 bg-white border-b border-gray-100 overflow-x-auto sticky top-20 z-10 mb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        {TABS.map(({ key, label, icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[13px]
                whitespace-nowrap flex-shrink-0 transition-all duration-150
                ${isActive
                  ? "bg-violet-50 text-violet-800 border-violet-200 font-medium"
                  : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-700 font-normal"
                }
              `}
            >
              {icon}
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pb-4">
        {activeTab === "offers" && (
          <OffersClientPage 
            initialOffers={initialOffers}
            initialPagination={pagination}
            searchParams={searchParamsObj}
          />
        )}
        {activeTab === "pricing" && (
          <PricingPlansClientPage />
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}