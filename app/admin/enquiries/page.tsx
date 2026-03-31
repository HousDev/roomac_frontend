// app/admin/enquiries/page.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EnquiriesClientPage from '@/components/admin/enquiries/EnquiriesClientPage';
import PartnershipEnquiriesClientPage from '@/components/admin/partnership/PartnershipClientPage';
import NewsletterSubscribersClientPage from '@/components/admin/newsletter/NewsletterClientPage';
import { Enquiry, getEnquiries, getEnquiryStats } from '@/lib/enquiryApi';
import { getPartnershipEnquiries, getPartnershipStats, PartnershipEnquiry, PartnershipStats, createPartnershipEnquiry } from '@/lib/partnershipApi';
import { getNewsletterSubscribers, getNewsletterStats, NewsletterSubscriber, NewsletterStats, deleteNewsletterSubscriber, bulkDeleteNewsletterSubscribers } from '@/lib/newsletterApi';
import { Button } from "@/components/ui/button";
import { Plus, X, Mail, Download, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import PartnershipForm from '@/components/admin/partnership/PartnershipForm';
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { useAuth } from '@/context/authContext';

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
    const { can } = useAuth(); // ← ADD THIS

  // Partnership state
  const [partnershipEnquiries, setPartnershipEnquiries] = useState<PartnershipEnquiry[]>([]);
  const [partnershipStats, setPartnershipStats] = useState<PartnershipStats | null>(null);
  const [loadingPartnership, setLoadingPartnership] = useState(true);
  const [partnershipFilters, setPartnershipFilters] = useState({ status: 'all', search: '' });
  
  // Newsletter state
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [newsletterStats, setNewsletterStats] = useState<NewsletterStats | null>(null);
  const [loadingNewsletter, setLoadingNewsletter] = useState(true);
  const [newsletterFilters, setNewsletterFilters] = useState({ status: 'all', search: '' });
  
  // Add partnership dialog state
  const [showAddPartnershipDialog, setShowAddPartnershipDialog] = useState(false);
  const [addPartnershipLoading, setAddPartnershipLoading] = useState(false);
  const [newPartnershipData, setNewPartnershipData] = useState<Partial<PartnershipEnquiry>>({
    status: 'new'
  });

  // Get initial tab from URL hash
  useEffect(() => {
    const getInitialTab = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "enquiries" || hash === "partnership" || hash === "newsletter") return hash;
      const saved = localStorage.getItem("adminEnquiriesActiveTab");
      if (saved === "enquiries" || saved === "partnership" || saved === "newsletter") return saved;
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
      if (hash === "enquiries" || hash === "partnership" || hash === "newsletter") {
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

  // Fetch newsletter data
  useEffect(() => {
    if (activeTab === "newsletter") {
      Promise.all([
        getNewsletterSubscribers(newsletterFilters),
        getNewsletterStats()
      ])
        .then(([subscribersRes, statsRes]) => {
          if (subscribersRes.success) setNewsletterSubscribers(subscribersRes.results);
          if (statsRes.success) setNewsletterStats(statsRes.data);
        })
        .catch((err) => console.error('Error fetching newsletter subscribers:', err))
        .finally(() => setLoadingNewsletter(false));
    }
  }, [newsletterFilters, activeTab]);

  // Handle add partnership enquiry
  const handleAddPartnershipEnquiry = async () => {
    if (!newPartnershipData.company_name || !newPartnershipData.contact_person || !newPartnershipData.email || !newPartnershipData.phone) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setAddPartnershipLoading(true);
      const response = await createPartnershipEnquiry(newPartnershipData);
      if (response.success) {
        toast.success("Partnership enquiry added successfully");
        setShowAddPartnershipDialog(false);
        setNewPartnershipData({ status: 'new' });
        const enquiriesRes = await getPartnershipEnquiries(partnershipFilters);
        const statsRes = await getPartnershipStats();
        if (enquiriesRes.success) setPartnershipEnquiries(enquiriesRes.results);
        if (statsRes.success) setPartnershipStats(statsRes.data);
      } else {
        toast.error(response.message || "Failed to add enquiry");
      }
    } catch (error: any) {
      console.error('Error adding partnership enquiry:', error);
      toast.error(error.message || "Failed to add enquiry");
    } finally {
      setAddPartnershipLoading(false);
    }
  };

  // Export newsletter subscribers to Excel
  const handleExportNewsletter = () => {
    if (newsletterSubscribers.length === 0) {
      toast.error("No subscribers to export");
      return;
    }

    const exportData = newsletterSubscribers.map(sub => ({
      ID: sub.id,
      Email: sub.email,
      Status: sub.status,
      'Subscribed Date': new Date(sub.subscribed_at).toLocaleString(),
      'IP Address': sub.ip_address || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Newsletter Subscribers');
    XLSX.writeFile(wb, `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Export started");
  };

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
    {
      key: "newsletter",
      label: "Newsletter Subscribers",
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4L8 2L14 4L8 6L2 4Z" />
          <path d="M2 8L8 10L14 8" />
          <path d="M4 12L12 12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full px-0 sm:px-0">
      {/* Tabs with Add Button */}
      <div className="flex items-center justify-between sticky top-16 z-10 bg-white border-b border-gray-100">
        <div
          className="flex gap-1.5 px-1 overflow-x-auto flex-1"
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
        
        {/* Action Buttons based on active tab */}
{activeTab === "partnership" && can('create_partnership_enquiries') && (
          <Dialog open={showAddPartnershipDialog} onOpenChange={setShowAddPartnershipDialog}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-sm whitespace-nowrap py-1.5 px-3 mx-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Partnership Enquiry</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0 rounded-2xl">
              <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white px-4 py-3 md:px-6 md:py-4 flex items-center justify-between rounded-t-lg">
                <div>
                  <h2 className="text-base md:text-lg font-semibold">Add New Partnership Enquiry</h2>
                  <p className="text-xs md:text-sm text-violet-100">Fill in the details below to add a new partnership enquiry</p>
                </div>
                <DialogClose asChild>
                  <button className="p-1.5 md:p-2 rounded-full hover:bg-white/20 transition">
                    <X className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </DialogClose>
              </div>
              
              <div className="p-4 md:p-6 overflow-y-auto max-h-[75vh]">
                <PartnershipForm
                  formData={newPartnershipData}
                  setFormData={setNewPartnershipData}
                  onSubmit={handleAddPartnershipEnquiry}
                  isSubmitting={addPartnershipLoading}
                  submitLabel="Add Partnership Enquiry"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}

        {activeTab === "newsletter" && (
          <div className="flex gap-2 mx-2">
            <Button
              onClick={handleExportNewsletter}
              variant="outline"
              size="sm"
              className="text-sm whitespace-nowrap"
              disabled={newsletterSubscribers.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        )}
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

        {activeTab === "newsletter" && (
          loadingNewsletter ? (
            <div className="p-4">Loading newsletter subscribers...</div>
          ) : (
            <NewsletterSubscribersClientPage 
              initialSubscribers={newsletterSubscribers}
              initialStats={newsletterStats}
              onFiltersChange={setNewsletterFilters}
            />
          )
        )}
      </div>
    </div>
  );
}