// app/admin/offers/OffersClientPage.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
// import { AdminHeader } from "@/components/admin/admin-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Calendar,
  Percent,
  IndianRupee,
  Clock,
  Star,
  Shield,
  Award,
  Sparkles,
  Users,
  Megaphone,
  Ticket,
  BellRing,
  ShieldCheck,
  Trophy,
  Search,
  Filter,
  MapPin,
  Wifi,
  Tv,
  Coffee,
  Dumbbell,
  Scan,
  CreditCard,
  Home,
  Zap,
  CheckCircle,
  TrendingUp,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageSquare,
  Mail,
  Copy,
  RefreshCw,
  Building,
  Key,
  Bed,
  Bath,
  Snowflake,
  Sun,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { offerApi, Offer, Room, PaginationParams, PaginatedResponse } from "@/lib/offerApi";
import { toast } from "sonner";
import axios from "axios";
import { useRouter, useSearchParams } from "@/src/compat/next-navigation";
import { Skeleton } from "@/components/ui/skeleton";
import OffersTable from "./OffersTable";
import OffersFilters from "./OffersFilters";
import OfferForm from "./OfferForm";
import ShareModal from "./ShareModal";
import OfferPreview from "./OfferPreview";

// Types for initial props
interface OffersClientPageProps {
  initialOffers: Offer[];
  initialPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  searchParams: {
    page?: string;
    search?: string;
    offer_type?: string;
    property_id?: string;
    is_active?: string;
  };
}

export interface PropertyApiResponse {
  id: number;
  name: string;
  slug: string;
  city_id: string | null;
  area: string | null;
  address: string | null;
  total_rooms: number;
  total_beds: number;
  occupied_beds: number;
  starting_price: number;
  security_deposit: number;
  description: string | null;
  property_manager_name: string | null;
  property_manager_phone: string | null;
  amenities: string[];
  services: string[];
  photo_urls: string[];
  property_rules: string | null;
  is_active: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string | null;
}

interface FormData {
  code: string;
  title: string;
  description: string;
  offer_type: string;
  discount_type: string;
  discount_value: string;
  discount_percent: string;
  min_months: string;
  start_date: string;
  end_date: string;
  terms_and_conditions: string;
  is_active: boolean;
  display_order: string;
  bonus_title: string;
  bonus_description: string;
  bonus_valid_until: string;
  bonus_conditions: string;
  property_id: number | null;
  room_id: number | null;
}

interface BonusDetails {
  title: string;
  description: string;
  valid_until: string;
  conditions?: string;
}

// Environment utility - use this consistently
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

const getBaseUrl = () => {
  const apiUrl = getApiUrl();
  const baseUrl = apiUrl.replace('/api', '');
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

export default function OffersClientPage({
  initialOffers,
  initialPagination,
  searchParams: initialSearchParams,
}: OffersClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [properties, setProperties] = useState<PropertyApiResponse[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  
  // Preview and share states
  const [showPreview, setShowPreview] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedShareOffer, setSelectedShareOffer] = useState<Offer | null>(null);
  const [selectedShareProperty, setSelectedShareProperty] = useState<PropertyApiResponse | null>(null);
  const [previewData, setPreviewData] = useState<{
    offer: Offer;
    property: PropertyApiResponse | null;
    room: Room | null;
    bonusDetails: BonusDetails;
  } | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(initialSearchParams.search || "");
  const [filterType, setFilterType] = useState(initialSearchParams.offer_type || "all");
  const [filterProperty, setFilterProperty] = useState(initialSearchParams.property_id || "all");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    code: "",
    title: "",
    description: "",
    offer_type: "general",
    discount_type: "percentage",
    discount_value: "",
    discount_percent: "",
    min_months: "1",
    start_date: "",
    end_date: "",
    terms_and_conditions: "",
    is_active: true,
    display_order: "0",
    bonus_title: "",
    bonus_description: "",
    bonus_valid_until: "",
    bonus_conditions: "",
    property_id: null,
    room_id: null
  });

  // Pagination state
  const [pagination, setPagination] = useState(initialPagination);

  // Load properties on mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Load properties function - using environment variable
  const loadProperties = useCallback(async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await axios.get<{ success: boolean; data: PropertyApiResponse[] }>(`${apiUrl}/api/properties`);
      if (response.data.success && response.data.data) {
        const activeProperties = response.data.data.filter(p => 
          p.is_active && 
          p.id && 
          p.name && 
          p.name.trim() !== ""
        );
        setProperties(activeProperties);
      }
    } catch (err) {
      console.error("Error loading properties:", err);
      toast.error("Failed to load properties");
    }
  }, []);

  // Load offers with filters
  const loadOffers = useCallback(async (page = 1, useFilters = true) => {
    setLoading(true);
    
    // Build query params for URL
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (useFilters && searchQuery) params.set('search', searchQuery);
    if (useFilters && filterType !== 'all') params.set('offer_type', filterType);
    if (useFilters && filterProperty !== 'all') params.set('property_id', filterProperty);
    
    // Update URL with search params
    const queryString = params.toString();
    router.push(`/admin/offers${queryString ? `?${queryString}` : ''}`, { scroll: false });

    try {
      const apiParams: PaginationParams = {
        page,
        limit: parseInt(itemsPerPage),
      };

      if (useFilters) {
        if (searchQuery) apiParams.search = searchQuery;
        if (filterType !== "all") apiParams.offer_type = filterType;
        if (filterProperty !== "all") apiParams.property_id = filterProperty;
      }

      const response = await offerApi.getPaginated(apiParams);
      
      if (response.success) {
        setOffers(response.data);
        setPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          totalItems: response.pagination.totalItems,
          limit: response.pagination.limit,
          hasNextPage: response.pagination.hasNextPage,
          hasPrevPage: response.pagination.hasPrevPage
        });
      }
    } catch (err) {
      console.error("Error loading offers:", err);
      toast.error("Failed to load offers");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterType, filterProperty, itemsPerPage, router]);

  // Load rooms by property
  const loadRoomsByProperty = useCallback(async (propertyId: number) => {
    setLoadingRooms(true);
    try {
      const rooms = await offerApi.getRoomsByProperty(propertyId);
      setRooms(rooms);
    } catch (err) {
      console.error("Error loading rooms:", err);
      toast.error("Failed to load rooms");
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      code: "",
      title: "",
      description: "",
      offer_type: "general",
      discount_type: "percentage",
      discount_value: "",
      discount_percent: "",
      min_months: "1",
      start_date: "",
      end_date: "",
      terms_and_conditions: "",
      is_active: true,
      display_order: "0",
      bonus_title: "",
      bonus_description: "",
      bonus_valid_until: "",
      bonus_conditions: "",
      property_id: null,
      room_id: null
    });
    setRooms([]);
  }, []);

  // Generate offer code
  const handleGenerateCode = useCallback(async () => {
    setIsGeneratingCode(true);
    try {
      const result = await offerApi.generateOfferCode();
      if (result.code) {
        setFormData(prev => ({ ...prev, code: result.code }));
        toast.success("🎉 New offer code generated!");
      } else {
        // Fallback manual generation
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let generatedCode = '';
        for (let i = 0; i < 8; i++) {
          generatedCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setFormData(prev => ({ ...prev, code: generatedCode }));
        toast.warning("Using fallback code generation");
      }
    } catch (err) {
      console.error("Error generating code:", err);
      // Fallback to client-side generation
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let fallbackCode = '';
      for (let i = 0; i < 8; i++) {
        fallbackCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      setFormData(prev => ({ ...prev, code: fallbackCode }));
      toast.error("Server error, using client-side generation");
    } finally {
      setIsGeneratingCode(false);
    }
  }, []);

  // Handle property change
  const handlePropertyChange = useCallback((propertyId: number | null) => {
    if (propertyId) {
      loadRoomsByProperty(propertyId);
    } else {
      setRooms([]);
    }
  }, [loadRoomsByProperty]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    loadOffers(page, false);
  }, [loadOffers]);

  // Handle filter changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadOffers(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterType, filterProperty, itemsPerPage]);

  // Memoized existing offer codes
  const existingOfferCodes = useMemo(() => {
    return offers.map(offer => offer.code.toUpperCase());
  }, [offers]);

  // Handle add offer
  const handleAdd = useCallback(async () => {
    if (!formData.title || !formData.code) {
      toast.error("Please fill in offer title and code");
      return;
    }

    const uppercaseCode = formData.code.toUpperCase();
    if (existingOfferCodes.includes(uppercaseCode)) {
      toast.error("This offer code already exists");
      return;
    }

    // Validate discount values
    if (formData.discount_type === "percentage" && (!formData.discount_percent || parseFloat(formData.discount_percent) <= 0)) {
      toast.error("Please enter a valid discount percentage");
      return;
    }

    if (formData.discount_type === "fixed" && (!formData.discount_value || parseFloat(formData.discount_value) <= 0)) {
      toast.error("Please enter a valid discount amount");
      return;
    }

    try {
      const body = {
        code: uppercaseCode,
        title: formData.title,
        description: formData.description || null,
        offer_type: formData.offer_type,
        discount_type: formData.discount_type,
        discount_value:
          formData.discount_type === "fixed"
            ? parseFloat(formData.discount_value) || 0
            : 0,
        discount_percent:
          formData.discount_type === "percentage"
            ? parseFloat(formData.discount_percent) || 0
            : 0,
        min_months: parseInt(formData.min_months) || 1,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        terms_and_conditions: formData.terms_and_conditions || null,
        is_active: !!formData.is_active,
        display_order: parseInt(formData.display_order) || 0,
        bonus_title: formData.bonus_title || null,
        bonus_description: formData.bonus_description || null,
        bonus_valid_until: formData.bonus_valid_until || null,
        bonus_conditions: formData.bonus_conditions || null,
        property_id: formData.property_id || null,
        room_id: formData.room_id || null,
      };

      const result = await offerApi.create(body);
      toast.success("🎉 Offer created successfully!");
      setIsAddDialogOpen(false);
      resetForm();
      await loadOffers(pagination.currentPage);
    } catch (err: any) {
      console.error("Error creating offer:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to create offer");
    }
  }, [formData, existingOfferCodes, pagination.currentPage, resetForm, loadOffers]);

  // Handle edit offer
  const handleEdit = useCallback((offer: Offer) => {
    setSelectedOffer(offer);
    setFormData({
      code: offer.code || "",
      title: offer.title,
      description: offer.description || "",
      offer_type: offer.offer_type || "general",
      discount_type: offer.discount_type || "percentage",
      discount_value: (offer.discount_value ?? 0).toString(),
      discount_percent: (offer.discount_percent ?? 0).toString(),
      min_months: (offer.min_months ?? 1).toString(),
      start_date: offer.start_date ? offer.start_date.split('T')[0] : "",
      end_date: offer.end_date ? offer.end_date.split('T')[0] : "",
      terms_and_conditions: offer.terms_and_conditions || "",
      is_active: !!offer.is_active,
      display_order: (offer.display_order ?? 0).toString(),
      bonus_title: (offer as any).bonus_title || "",
      bonus_description: (offer as any).bonus_description || "",
      bonus_valid_until: (offer as any).bonus_valid_until ? (offer as any).bonus_valid_until.split('T')[0] : "",
      bonus_conditions: (offer as any).bonus_conditions || "",
      property_id: offer.property_id || null,
      room_id: offer.room_id || null
    });
    
    if (offer.property_id) {
      handlePropertyChange(offer.property_id);
    }
    
    setIsEditDialogOpen(true);
  }, [handlePropertyChange]);

  // Handle update offer
  const handleUpdate = useCallback(async () => {
    if (!selectedOffer) return;

    const uppercaseCode = formData.code.toUpperCase();
    if (uppercaseCode !== selectedOffer.code && existingOfferCodes.includes(uppercaseCode)) {
      toast.error("This offer code already exists");
      return;
    }

    if (formData.discount_type === "percentage" && (!formData.discount_percent || parseFloat(formData.discount_percent) <= 0)) {
      toast.error("Please enter a valid discount percentage");
      return;
    }

    if (formData.discount_type === "fixed" && (!formData.discount_value || parseFloat(formData.discount_value) <= 0)) {
      toast.error("Please enter a valid discount amount");
      return;
    }

    try {
      const body = {
        code: uppercaseCode,
        title: formData.title,
        description: formData.description || null,
        offer_type: formData.offer_type,
        discount_type: formData.discount_type,
        discount_value:
          formData.discount_type === "fixed"
            ? parseFloat(formData.discount_value) || 0
            : 0,
        discount_percent:
          formData.discount_type === "percentage"
            ? parseFloat(formData.discount_percent) || 0
            : 0,
        min_months: parseInt(formData.min_months) || 1,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        terms_and_conditions: formData.terms_and_conditions || null,
        is_active: !!formData.is_active,
        display_order: parseInt(formData.display_order) || 0,
        bonus_title: formData.bonus_title || null,
        bonus_description: formData.bonus_description || null,
        bonus_valid_until: formData.bonus_valid_until || null,
        bonus_conditions: formData.bonus_conditions || null,
        property_id: formData.property_id || null,
        room_id: formData.room_id || null,
        updated_at: new Date().toISOString(),
      };

      await offerApi.update(selectedOffer.id, body);
      toast.success("✅ Offer updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedOffer(null);
      resetForm();
      await loadOffers(pagination.currentPage);
    } catch (err: any) {
      console.error("❌ Error updating offer:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to update offer");
    }
  }, [selectedOffer, formData, existingOfferCodes, pagination.currentPage, resetForm, loadOffers]);

  // Handle delete offer
  const handleDelete = useCallback(async (offerId: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    
    try {
      await offerApi.remove(offerId);
      toast.success("🗑️ Offer deleted successfully!");
      
      if (offers.length === 1 && pagination.currentPage > 1) {
        await loadOffers(pagination.currentPage - 1);
      } else {
        await loadOffers(pagination.currentPage);
      }
    } catch (err: any) {
      console.error("Error deleting offer:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to delete offer");
    }
  }, [offers.length, pagination.currentPage, loadOffers]);

  // Toggle active status
  const toggleActive = useCallback(async (offerId: string, currentStatus: boolean) => {
    try {
      await offerApi.toggleActive(offerId, !currentStatus);
      toast.success(`✨ Offer ${!currentStatus ? "activated" : "deactivated"} successfully!`);
      await loadOffers(pagination.currentPage);
    } catch (err: any) {
      console.error("Error toggling offer active:", err);
      toast.error(err.response?.data?.message || "Failed to update offer status");
    }
  }, [pagination.currentPage, loadOffers]);

  // Handle preview
  const handlePreview = useCallback(async (offer: Offer) => {
    try {
      const fullOffer = await offerApi.getById(offer.id);
      
      let property = null;
      if (fullOffer.property_id) {
        try {
          const apiUrl = getApiUrl();
          const propResponse = await axios.get(`${apiUrl}/api/properties/${fullOffer.property_id}`);
          if (propResponse.data.success) {
            property = propResponse.data.data;
          }
        } catch (error) {
          console.error("Error fetching property details:", error);
        }
      }

      let room = null;
      if (fullOffer.room_id) {
        try {
          if (fullOffer.property_id) {
            const propertyRooms = await offerApi.getRoomsByProperty(fullOffer.property_id);
            room = propertyRooms.find(r => r.id === fullOffer.room_id) || null;
          }
        } catch (error) {
          console.error("Error fetching room details:", error);
        }
      }

      const bonusData = {
        title: (fullOffer as any).bonus_title || "",
        description: (fullOffer as any).bonus_description || "",
        valid_until: (fullOffer as any).bonus_valid_until || "",
        conditions: (fullOffer as any).bonus_conditions || ""
      };

      setPreviewData({
        offer: fullOffer,
        property,
        room,
        bonusDetails: bonusData
      });
      setShowPreview(true);
    } catch (err) {
      console.error("Error loading offer details:", err);
      toast.error("Failed to load offer preview");
    }
  }, []);

  // Handle share
  const handleShare = useCallback((offer: Offer) => {
    setSelectedShareOffer(offer);
    
    let property = null;
    if (offer.property_id) {
      const prop = properties.find(p => p.id === offer.property_id);
      if (prop) property = prop;
    }
    
    setSelectedShareProperty(property);
    setIsShareModalOpen(true);
  }, [properties]);

  return (
    <div className=" bg-slate-50 -mt-3 px-0 md:px-0">

      <div className="p-0">
        <Card className="border-0 shadow-xl bg-white sticky top-36 z-10 max-h-[650px]" >
     <CardHeader
  className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white rounded-t-lg p-3 sm:p-4"
>
  <div className="flex flex-col gap-3">
    
    {/* Top row with icon, search (mobile) and create button */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg">
          <Tag className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        
        {/* Mobile: Search bar - now in top row with create button */}
        <div className="relative md:hidden" style={{ width: 'calc(100vw - 180px)' }}>
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200" />
          <Input
            placeholder="Search offers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 h-8 text-xs bg-white/20 text-white placeholder:text-white border-white/30 focus:border-white/50"
          />
        </div>

        {/* Desktop: Search + Filters (visible on md and above) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-200" />
            <Input
              placeholder="Search offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 sm:pl-8 h-8 sm:h-9 text-xs sm:text-sm bg-white/20 text-white placeholder-blue-200 border-white/30 focus:border-white/50"
            />
          </div>

          {/* Type Filter */}
          <div className="relative min-w-[130px]">
            <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200 z-10" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="pl-7 h-8 sm:h-9 text-xs sm:text-sm bg-white/20 text-white border-white/30 focus:border-white/50">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="early_booking">Early Booking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Filter */}
          <div className="relative min-w-[150px]">
            <Building className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200 z-10" />
            <Select value={filterProperty} onValueChange={setFilterProperty}>
              <SelectTrigger className="pl-7 h-8 sm:h-9 text-xs sm:text-sm bg-white/20 text-white border-white/30 focus:border-white/50">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="general">General Offers</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear filters button when filters are applied */}
          {(filterType !== 'all' || filterProperty !== 'all' || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterType('all');
                setFilterProperty('all');
                setSearchQuery('');
              }}
              className="h-8 text-xs text-white hover:bg-white/20"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Create Offer Button */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
        <Button
  size="sm"
  className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-0 font-semibold h-8 sm:h-9 text-xs sm:text-sm whitespace-nowrap"
>
  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
  
  {/* Mobile */}
  <span className="md:hidden">Create</span>
  
  {/* Desktop */}
  <span className="hidden md:inline">Create New Offer</span>
</Button>
        </DialogTrigger>

        <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[95vh] sm:max-h-[96vh] overflow-hidden p-0 rounded-lg sm:rounded-xl">
          {/* Dialog content remains the same */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-sm sm:text-base font-semibold flex items-center gap-1 sm:gap-1.5">
                <Megaphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Create New Offer
              </h2>
              <p className="text-[9px] sm:text-[10px] text-blue-100">
                Fill in the details below to create an attractive promotional offer
              </p>
            </div>
            <DialogClose asChild>
              <button className="p-1 rounded-full hover:bg-white/20 transition">
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </DialogClose>
          </div>

          <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
            <OfferForm
              formData={formData}
              setFormData={setFormData}
              existingCodes={existingOfferCodes}
              properties={properties}
              rooms={rooms}
              loadingRooms={loadingRooms}
              onPropertyChange={handlePropertyChange}
              onGenerateCode={handleGenerateCode}
              isGeneratingCode={isGeneratingCode}
            />
          </div>

          <div className="flex justify-end gap-2 p-3 sm:p-4 pt-2 sm:pt-3 border-t bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
              className="h-7 sm:h-8 text-[10px] sm:text-xs px-3 sm:px-4"
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleAdd}
              className="h-7 sm:h-8 text-[10px] sm:text-xs px-3 sm:px-4 bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              Create Offer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    {/* Mobile: Filters Row (visible below md) */}
    <div className="flex md:hidden items-center gap-2">
      {/* Type Filter */}
      <div className="relative flex-1">
        <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200 z-10" />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="pl-7 h-8 text-xs bg-white/20 text-white border-white/30 focus:border-white/50 w-full">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="seasonal">Seasonal</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="early_booking">Early Booking</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Property Filter */}
      <div className="relative flex-1">
        <Building className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200 z-10" />
        <Select value={filterProperty} onValueChange={setFilterProperty}>
          <SelectTrigger className="pl-7 h-8 text-xs bg-white/20 text-white border-white/30 focus:border-white/50 w-full">
            <SelectValue placeholder="All Properties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            <SelectItem value="general">General Offers</SelectItem>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id.toString()}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear button on mobile - only show when filters active */}
      {(filterType !== 'all' || filterProperty !== 'all' || searchQuery) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFilterType('all');
            setFilterProperty('all');
            setSearchQuery('');
          }}
          className="h-8 text-xs text-white hover:bg-white/20 shrink-0"
        >
          Clear
        </Button>
      )}
    </div>
  </div>
</CardHeader>


          <CardContent className="p-6 ">

  {/* Hide only filters on mobile */}
  {/* <div className="hidden lg:block">
    <OffersFilters
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filterType={filterType}
      setFilterType={setFilterType}
      filterProperty={filterProperty}
      setFilterProperty={setFilterProperty}
      itemsPerPage={itemsPerPage}
      setItemsPerPage={setItemsPerPage}
      properties={properties}
      pagination={pagination}
    />
  </div> */}

  {/* Table will still show on all devices */}
 


            <OffersTable
              offers={offers}
              loading={loading}
              properties={properties}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={toggleActive}
              onPreview={handlePreview}
              onShare={handleShare}
              pagination={pagination}
              onPageChange={handlePageChange} onCreateNew={function (): void {
                throw new Error("Function not implemented.");
              } }            />
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Edit className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle>Edit Offer</DialogTitle>
                  <CardDescription>Update the offer details</CardDescription>
                </div>
              </div>
            </DialogHeader>
            <OfferForm
              formData={formData}
              setFormData={setFormData}
              existingCodes={existingOfferCodes}
              isEdit={true}
              currentCode={selectedOffer?.code || ""}
              properties={properties}
              rooms={rooms}
              loadingRooms={loadingRooms}
              onPropertyChange={handlePropertyChange}
              onGenerateCode={handleGenerateCode}
              isGeneratingCode={isGeneratingCode}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedOffer(null);
                  resetForm();
                }}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                Update Offer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedShareOffer(null);
          setSelectedShareProperty(null);
        }}
        offer={selectedShareOffer}
        property={selectedShareProperty}
      />

      {/* Offer Preview */}
      {previewData && (
        <OfferPreview
          previewData={previewData}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}