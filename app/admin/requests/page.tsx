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
  // Get initial tab from URL hash or localStorage
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

  // Update URL hash and localStorage when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
    localStorage.setItem('adminRequestsActiveTab', tab);
  };

  // Fetch all request counts
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
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAllCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync with hash changes
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

  // Mobile responsive classes
  const tabButtonClass = (tab: string) => `
    px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap flex items-center gap-1 sm:gap-2
    ${activeTab === tab
      ? "border-blue-600 text-blue-600"
      : "border-transparent text-gray-500 hover:text-gray-700"
    }
  `;

  return (
    <div className="w-full px-2 sm:px-4">
      {/* Tabs - Mobile Responsive with Horizontal Scroll */}
      <div className="flex gap-1 sm:gap-2 border-b mb-4 overflow-x-auto pb-1 sticky top-20 bg-white z-10 scrollbar-hide">
        <button
          onClick={() => handleTabChange("complaint")}
          className={tabButtonClass("complaint")}
        >
          Complaints
          {requestCounts.complaints > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {requestCounts.complaints > 9 ? '9+' : requestCounts.complaints}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange("maintenance")}
          className={tabButtonClass("maintenance")}
        >
          Maintenance
          {requestCounts.maintenance > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {requestCounts.maintenance > 9 ? '9+' : requestCounts.maintenance}
            </span>
          )}
        </button>
        
        <button
          onClick={() => handleTabChange("receipt")}
          className={tabButtonClass("receipt")}
        >
          Receipts
          {requestCounts.receipts > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {requestCounts.receipts > 9 ? '9+' : requestCounts.receipts}
            </span>
          )}
        </button> 
        
        <button
          onClick={() => handleTabChange("vacate")}
          className={tabButtonClass("vacate")}
        >
          Vacate
          {requestCounts.vacate > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {requestCounts.vacate > 9 ? '9+' : requestCounts.vacate}
            </span>
          )}
        </button>
        
        <button
          onClick={() => handleTabChange("change")}
          className={tabButtonClass("change")}
        >
          Change Bed
          {requestCounts.change > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {requestCounts.change > 9 ? '9+' : requestCounts.change}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange("deletion")}
          className={tabButtonClass("deletion")}
        >
          Deletion
          {requestCounts.deletion > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {requestCounts.deletion > 9 ? '9+' : requestCounts.deletion}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange("notice")}
          className={tabButtonClass("notice")}
        >
          Notice Period
          {requestCounts.notice > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {requestCounts.notice > 9 ? '9+' : requestCounts.notice}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="pb-4">
        {activeTab === "complaint" && <ComplaintsPage />}
        {activeTab === "maintenance" && <MaintenancePage />}
        {activeTab === "receipt" && <ReceiptsPage />}
        {activeTab === "vacate" && <VacateRequestsPage />}
        {activeTab === "change" && <AdminChangeBedRequestsPage />}
        {activeTab === "deletion" && <AccountDeletionRequestsPage />}
        {activeTab === "notice" && <NoticePeriodRequestsPage />}
      </div>

      {/* Add CSS for hiding scrollbar */}
      <style >{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default RequestsPage;