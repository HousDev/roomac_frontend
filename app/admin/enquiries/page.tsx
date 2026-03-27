

// // app/admin/enquiries/page.tsx
// import { useState, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import EnquiriesClientPage from '@/components/admin/enquiries/EnquiriesClientPage';
// import { Enquiry, getEnquiries, getEnquiryStats } from '@/lib/enquiryApi';

// export default function EnquiriesPage() {
//   const [searchParams] = useSearchParams();
//   const status = searchParams.get('status') ?? '';
//   const search = searchParams.get('search') ?? '';
//   const [initialEnquiries, setInitialEnquiries] = useState<Enquiry[]>([]);
//   const [initialStats, setInitialStats] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     Promise.all([
//       getEnquiries({ status, search }),
//       getEnquiryStats()
//     ])
//       .then(([enquiriesRes, statsRes]) => {
//         if (enquiriesRes.success) setInitialEnquiries(enquiriesRes.results);
//         if (statsRes.success) setInitialStats(statsRes.data);
//       })
//       .catch((err) => console.error('Error fetching initial data:', err))
//       .finally(() => setLoading(false));
//   }, [status, search]);

//   if (loading) return <div className="p-4">Loading...</div>;
//   return (
//     <EnquiriesClientPage 
//       initialEnquiries={initialEnquiries}
//       initialStats={initialStats}
//       searchParams={{ status, search }}
//     />
//   );
// }

// app/admin/enquiries/page.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EnquiriesClientPage from '@/components/admin/enquiries/EnquiriesClientPage';
import PartnershipEnquiriesClientPage from '@/components/admin/partnership/PartnershipEnquiriesClientPage';
import { Enquiry, getEnquiries, getEnquiryStats } from '@/lib/enquiryApi';
import { getPartnershipEnquiries, getPartnershipStats, PartnershipEnquiry, PartnershipStats } from '@/lib/partnershipApi';

export default function EnquiriesPage() {
  const [searchParams] = useSearchParams();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>("enquiries");
  
  // Enquiry state
  const status = searchParams.get('status') ?? '';
  const search = searchParams.get('search') ?? '';
  const [initialEnquiries, setInitialEnquiries] = useState<Enquiry[]>([]);
  const [initialStats, setInitialStats] = useState<any>(null);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  
  // Partnership state
  const [partnershipEnquiries, setPartnershipEnquiries] = useState<PartnershipEnquiry[]>([]);
  const [partnershipStats, setPartnershipStats] = useState<PartnershipStats | null>(null);
  const [loadingPartnership, setLoadingPartnership] = useState(true);
  const [partnershipFilters, setPartnershipFilters] = useState({ status: 'all', search: '' });

  // Get initial tab from URL hash
  useEffect(() => {
    const getInitialTab = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "enquiries" || hash === "partnership") return hash;
      const saved = localStorage.getItem("adminEnquiriesActiveTab");
      if (saved === "enquiries" || saved === "partnership") return saved;
      return "enquiries";
    };
    setActiveTab(getInitialTab());
  }, []);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
    localStorage.setItem("adminEnquiriesActiveTab", tab);
  };

  // Handle hash change
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "enquiries" || hash === "partnership") {
        setActiveTab(hash);
        localStorage.setItem("adminEnquiriesActiveTab", hash);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Fetch enquiries data
  useEffect(() => {
    if (activeTab === "enquiries") {
      Promise.all([
        getEnquiries({ status, search }),
        getEnquiryStats()
      ])
        .then(([enquiriesRes, statsRes]) => {
          if (enquiriesRes.success) setInitialEnquiries(enquiriesRes.results);
          if (statsRes.success) setInitialStats(statsRes.data);
        })
        .catch((err) => console.error('Error fetching enquiries:', err))
        .finally(() => setLoadingEnquiries(false));
    }
  }, [status, search, activeTab]);

  // Fetch partnership data
  useEffect(() => {
    if (activeTab === "partnership") {
      Promise.all([
        getPartnershipEnquiries(partnershipFilters),
        getPartnershipStats()
      ])
        .then(([enquiriesRes, statsRes]) => {
          if (enquiriesRes.success) setPartnershipEnquiries(enquiriesRes.results);
          if (statsRes.success) setPartnershipStats(statsRes.data);
        })
        .catch((err) => console.error('Error fetching partnership enquiries:', err))
        .finally(() => setLoadingPartnership(false));
    }
  }, [partnershipFilters, activeTab]);

  // Tab definitions
  const TABS = [
    {
      key: "enquiries",
      label: "Enquiries",
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4L8 2L14 4L8 6L2 4Z" />
          <path d="M2 8L8 10L14 8" />
          <path d="M2 12L8 14L14 12" />
        </svg>
      ),
    },
    {
      key: "partnership",
      label: "Partnership Enquiries",
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 5L8 2L13 5L8 8L3 5Z" />
          <path d="M8 8V11" />
          <path d="M5 6L5 9" />
          <path d="M11 6L11 9" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full px-0 sm:px-0">
      {/* Tabs */}
      <div
        className="flex gap-1.5 px-1 mb-1 bg-white border-b border-gray-100 overflow-x-auto sticky top-16 z-10 mb-0"
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
        {activeTab === "enquiries" && (
          loadingEnquiries ? (
            <div className="p-4">Loading enquiries...</div>
          ) : (
            <EnquiriesClientPage 
              initialEnquiries={initialEnquiries}
              initialStats={initialStats}
              searchParams={{ status, search }}
            />
          )
        )}
        
        {activeTab === "partnership" && (
          loadingPartnership ? (
            <div className="p-4">Loading partnership enquiries...</div>
          ) : (
            <PartnershipEnquiriesClientPage 
              initialEnquiries={partnershipEnquiries}
              initialStats={partnershipStats}
              onFiltersChange={setPartnershipFilters}
            />
          )
        )}
      </div>
    </div>
  );
}