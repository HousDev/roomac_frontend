// // app/admin/requests/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import ComplaintsPage from "../complaints/page";
// import MaintenancePage from "../maintenance/page";
// import ReceiptsPage from "../receipts/page";
// import VacateRequestsPage from "../vacate-requests/page";
// import AdminChangeBedRequestsPage from "../change-bed-requests/page";
// import AccountDeletionRequestsPage from "../account-deletion-requests/page";
// import NoticePeriodRequestsPage from "../notice-period-requests/page";
// import { getAllRequestCounts, type RequestCounts } from "@/lib/adminRequestCountsApi";

// const RequestsPage = () => {
//   // Get initial tab from URL hash or localStorage
//   const getInitialTab = () => {
//     if (typeof window !== 'undefined') {
//       const hash = window.location.hash.replace('#', '');
//       if (hash && ["complaint", "maintenance", "receipt", "vacate", "change", "deletion", "notice"].includes(hash)) {
//         return hash;
//       }
      
//       const savedTab = localStorage.getItem('adminRequestsActiveTab');
//       if (savedTab && ["complaint", "maintenance", "receipt", "vacate", "change", "deletion", "notice"].includes(savedTab)) {
//         return savedTab;
//       }
//     }
//     return "complaint";
//   };

//   const [activeTab, setActiveTab] = useState(getInitialTab());
//   const [requestCounts, setRequestCounts] = useState<RequestCounts>({
//     complaints: 0,
//     maintenance: 0,
//     receipts: 0,
//     vacate: 0,
//     change: 0,
//     deletion: 0,
//     notice: 0,
//     total: 0
//   });

//   // Update URL hash and localStorage when tab changes
//   const handleTabChange = (tab: string) => {
//     setActiveTab(tab);
//     window.location.hash = tab;
//     localStorage.setItem('adminRequestsActiveTab', tab);
//   };

//   // Fetch all request counts
//   useEffect(() => {
//     const fetchAllCounts = async () => {
//       try {
//         const counts = await getAllRequestCounts();
//         setRequestCounts(counts);
//       } catch (error) {
//         console.error('Failed to fetch request counts:', error);
//       }
//     };
    
//     fetchAllCounts();
    
//     // Refresh every 30 seconds
//     const interval = setInterval(fetchAllCounts, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   // Sync with hash changes
//   useEffect(() => {
//     const handleHashChange = () => {
//       const hash = window.location.hash.replace('#', '');
//       if (hash && ["complaint", "maintenance", "receipt", "vacate", "change", "deletion", "notice"].includes(hash)) {
//         setActiveTab(hash);
//         localStorage.setItem('adminRequestsActiveTab', hash);
//       }
//     };

//     window.addEventListener('hashchange', handleHashChange);
//     return () => window.removeEventListener('hashchange', handleHashChange);
//   }, []);

//   // Mobile responsive classes
//   const tabButtonClass = (tab: string) => `
//     px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap flex items-center gap-1 sm:gap-2
//     ${activeTab === tab
//       ? "border-blue-600 text-blue-600"
//       : "border-transparent text-gray-500 hover:text-gray-700"
//     }
//   `;

//   return (
//     <div className="w-full px-2 sm:px-4">
//       {/* Tabs - Mobile Responsive with Horizontal Scroll */}
//       <div className="flex gap-1 sm:gap-2 border-b mb-4 overflow-x-auto pb-1 sticky top-20 bg-white z-10 scrollbar-hide">
//         <button
//           onClick={() => handleTabChange("complaint")}
//           className={tabButtonClass("complaint")}
//         >
//           Complaints
//           {requestCounts.complaints > 0 && (
//             <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
//               {requestCounts.complaints > 9 ? '9+' : requestCounts.complaints}
//             </span>
//           )}
//         </button>

//         <button
//           onClick={() => handleTabChange("maintenance")}
//           className={tabButtonClass("maintenance")}
//         >
//           Maintenance
//           {requestCounts.maintenance > 0 && (
//             <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
//               {requestCounts.maintenance > 9 ? '9+' : requestCounts.maintenance}
//             </span>
//           )}
//         </button>
        
//         <button
//           onClick={() => handleTabChange("receipt")}
//           className={tabButtonClass("receipt")}
//         >
//           Receipts
//           {requestCounts.receipts > 0 && (
//             <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
//               {requestCounts.receipts > 9 ? '9+' : requestCounts.receipts}
//             </span>
//           )}
//         </button> 
        
//         <button
//           onClick={() => handleTabChange("vacate")}
//           className={tabButtonClass("vacate")}
//         >
//           Vacate
//           {requestCounts.vacate > 0 && (
//             <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
//               {requestCounts.vacate > 9 ? '9+' : requestCounts.vacate}
//             </span>
//           )}
//         </button>
        
//         <button
//           onClick={() => handleTabChange("change")}
//           className={tabButtonClass("change")}
//         >
//           Change Bed
//           {requestCounts.change > 0 && (
//             <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
//               {requestCounts.change > 9 ? '9+' : requestCounts.change}
//             </span>
//           )}
//         </button>

//         <button
//           onClick={() => handleTabChange("deletion")}
//           className={tabButtonClass("deletion")}
//         >
//           Deletion
//           {requestCounts.deletion > 0 && (
//             <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
//               {requestCounts.deletion > 9 ? '9+' : requestCounts.deletion}
//             </span>
//           )}
//         </button>

//         <button
//           onClick={() => handleTabChange("notice")}
//           className={tabButtonClass("notice")}
//         >
//           Notice Period
//           {requestCounts.notice > 0 && (
//             <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
//               {requestCounts.notice > 9 ? '9+' : requestCounts.notice}
//             </span>
//           )}
//         </button>
//       </div>

//       {/* Tab Content */}
//       <div className="pb-4">
//         {activeTab === "complaint" && <ComplaintsPage />}
//         {activeTab === "maintenance" && <MaintenancePage />}
//         {activeTab === "receipt" && <ReceiptsPage />}
//         {activeTab === "vacate" && <VacateRequestsPage />}
//         {activeTab === "change" && <AdminChangeBedRequestsPage />}
//         {activeTab === "deletion" && <AccountDeletionRequestsPage />}
//         {activeTab === "notice" && <NoticePeriodRequestsPage />}
//       </div>

//       {/* Add CSS for hiding scrollbar */}
//       <style >{`
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default RequestsPage;

// app/admin/requests/page.tsx
"use client";

import { useState, useEffect } from "react";
import ComplaintsPage from "../complaints/page";
import MaintenancePage from "../maintenance/page";
import ReceiptsPage from "../receipts/page";
import VacateRequestsPage from "../vacate-requests/page";
import AdminChangeBedRequestsPage from "../change-bed-requests/page";
import AccountDeletionRequestsPage from "../account-deletion-requests/page";
import NoticePeriodRequestsPage from "../notice-period-requests/page";
import { getAllRequestCounts, type RequestCounts } from "@/lib/adminRequestCountsApi";

const RequestsPage = () => {
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash && ["complaint", "maintenance", "receipt", "vacate", "change", "deletion", "notice"].includes(hash)) {
        return hash;
      }
      const savedTab = localStorage.getItem('adminRequestsActiveTab');
      if (savedTab && ["complaint", "maintenance", "receipt", "vacate", "change", "deletion", "notice"].includes(savedTab)) {
        return savedTab;
      }
    }
    return "complaint";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [requestCounts, setRequestCounts] = useState<RequestCounts>({
    complaints: 0,
    maintenance: 0,
    receipts: 0,
    vacate: 0,
    change: 0,
    deletion: 0,
    notice: 0,
    total: 0
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
    localStorage.setItem('adminRequestsActiveTab', tab);
  };

  useEffect(() => {
    const fetchAllCounts = async () => {
      try {
        const counts = await getAllRequestCounts();
        setRequestCounts(counts);
      } catch (error) {
        console.error('Failed to fetch request counts:', error);
      }
    };
    fetchAllCounts();
    const interval = setInterval(fetchAllCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ["complaint", "maintenance", "receipt", "vacate", "change", "deletion", "notice"].includes(hash)) {
        setActiveTab(hash);
        localStorage.setItem('adminRequestsActiveTab', hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const TABS = [
    {
      key: "complaint",
      label: "Complaints",
      count: requestCounts.complaints,
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6.5"/>
          <line x1="8" y1="5" x2="8" y2="8.5"/>
          <circle cx="8" cy="10.5" r="0.75" fill="currentColor" stroke="none"/>
        </svg>
      ),
    },
    {
      key: "maintenance",
      label: "Maintenance",
      count: requestCounts.maintenance,
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10.5 2.5L13.5 5.5 6 13 2.5 13.5 3 10z"/>
          <line x1="8.5" y1="4.5" x2="11.5" y2="7.5"/>
        </svg>
      ),
    },
    {
      key: "receipt",
      label: "Receipts",
      count: requestCounts.receipts,
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="2" width="10" height="12" rx="1.5"/>
          <line x1="5.5" y1="5.5" x2="10.5" y2="5.5"/>
          <line x1="5.5" y1="8" x2="10.5" y2="8"/>
          <line x1="5.5" y1="10.5" x2="8.5" y2="10.5"/>
        </svg>
      ),
    },
    {
      key: "vacate",
      label: "Vacate",
      count: requestCounts.vacate,
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 2H3.5A1 1 0 0 0 2.5 3v10a1 1 0 0 0 1 1H9"/>
          <path d="M11 10.5L13.5 8 11 5.5"/>
          <line x1="6.5" y1="8" x2="13.5" y2="8"/>
        </svg>
      ),
    },
    {
      key: "change",
      label: "Change Bed",
      count: requestCounts.change,
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2.5 5.5H11M11 5.5L8.5 3M11 5.5L8.5 8"/>
          <path d="M13.5 10.5H5M5 10.5L7.5 8M5 10.5L7.5 13"/>
        </svg>
      ),
    },
    {
      key: "deletion",
      label: "Deletion",
      count: requestCounts.deletion,
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="3,5 13,5"/>
          <path d="M6 5V3.5h4V5"/>
          <path d="M4.5 5l.7 8h5.6l.7-8"/>
          <line x1="6.5" y1="7.5" x2="6.5" y2="11"/>
          <line x1="9.5" y1="7.5" x2="9.5" y2="11"/>
        </svg>
      ),
    },
    {
      key: "notice",
      label: "Notice Period",
      count: requestCounts.notice,
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2.5" y="3" width="11" height="11" rx="1.5"/>
          <line x1="5.5" y1="2" x2="5.5" y2="4.5"/>
          <line x1="10.5" y1="2" x2="10.5" y2="4.5"/>
          <line x1="2.5" y1="7" x2="13.5" y2="7"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full px-0 sm:px-0">

      {/* ── Tabs ── */}
      <div
        className="flex gap-1.5 px-1 py-2.5 bg-white border-b border-gray-100 overflow-x-auto sticky top-20 z-10 mb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        {TABS.map(({ key, label, count, icon }) => {
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
              {count > 0 && (
                <span
                  className={`
                    inline-flex items-center justify-center min-w-[18px] h-[18px] px-1
                    rounded-full text-[11px] font-medium leading-none
                    ${isActive ? "bg-violet-500 text-white" : "bg-red-500 text-white"}
                  `}
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="pb-4">
        {activeTab === "complaint"  && <ComplaintsPage />}
        {activeTab === "maintenance" && <MaintenancePage />}
        {activeTab === "receipt"    && <ReceiptsPage />}
        {activeTab === "vacate"     && <VacateRequestsPage />}
        {activeTab === "change"     && <AdminChangeBedRequestsPage />}
        {activeTab === "deletion"   && <AccountDeletionRequestsPage />}
        {activeTab === "notice"     && <NoticePeriodRequestsPage />}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default RequestsPage;