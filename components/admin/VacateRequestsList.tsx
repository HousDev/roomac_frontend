// components/admin/VacateRequestsList.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
  Search,
  Loader2,
  IndianRupee,
  Calendar,
  User,
  Home,
  Bed,
  Star,
  Phone,
  Mail,
  FileText,
  Download,
  MoreVertical,
  Building2,
  DollarSign,
  MessageSquare,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  Settings,
  IndianRupeeIcon,
  Trash2
} from 'lucide-react';
import { 
  getAdminVacateRequests, 
  updateVacateRequestStatus, 
  sendTenantNotification,
  getPropertiesList,
  bulkDeleteVacateRequests,
  getMasterValues,
  type AdminVacateRequest,
  type StatusUpdatePayload
} from '@/lib/tenantRequestsApi';
import { Checkbox } from "@/components/ui/checkbox";
import { listProperties, Property } from '@/lib/propertyApi';
import router from 'next/router';
import { useAuth } from '@/context/authContext';

interface VacateRequest {
  vacate_request_id: number;
  tenant_id: number;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  property_id: number;
  property_name: string;
  room_id: number;
  room_number: number;
  bed_id: number;
  bed_number: number;
  primary_reason_id: number;
  primary_reason: string;
  secondary_reasons: string[];
  overall_rating: number | null;
  food_rating: number | null;
  cleanliness_rating: number | null;
  management_rating: number | null;
  improvement_suggestions: string | null;
  expected_vacate_date: string | null;
  lockin_penalty_accepted: boolean;
  notice_penalty_accepted: boolean;
  vacate_status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  vacate_request_date: string;
  vacate_updated_date: string;
  vacate_admin_notes: string | null;
  processed_by: number | null;
  processed_at: string | null;
  refund_amount: number | null;
  penalty_deduction: number | null;
  tenant_request_id: number | null;
  title: string | null;
  description: string | null;
  priority: string | null;
  request_status: string | null;
  request_created: string | null;
  lockin_period_months: number | null;
  lockin_penalty_amount: number | null;
  lockin_penalty_type: string | null;
  notice_period_days: number | null;
  notice_penalty_amount: number | null;
  notice_penalty_type: string | null;
  check_in_date: string | null;
  monthly_rent: number | null;
  security_deposit: number | null;
}

interface ApiResponse {
  success: boolean;
  data: VacateRequest[];
  total: number;
}

interface VacateReason {
  id: number;
  value: string;
  description?: string;
}

interface StatusUpdateData {
  status: 'under_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  admin_notes?: string;
  actual_vacate_date?: string;
  refund_amount?: number;
  penalty_waived?: boolean;
}

export default function VacateRequestsList() {
  const [requests, setRequests] = useState<VacateRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VacateRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<VacateRequest | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [vacateReasons, setVacateReasons] = useState<VacateReason[]>([]);
  // Add these state variables for bulk actions
const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set());
const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState<StatusUpdateData>({
    status: 'under_review',
    admin_notes: ''
  });
  const [sortField, setSortField] = useState<keyof VacateRequest>('vacate_request_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
const { can } = useAuth();

  // Column search filters
  const [searchFilters, setSearchFilters] = useState({
    id: '',
    tenant: '',
    property: '',
    room_bed: '',
    expected_date: '',
    status: 'all',
    priority: 'all',
    created: ''
  });

  // Fetch data using API functions
  const fetchVacateRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminVacateRequests();
      const vacateRequests = data as unknown as VacateRequest[];
      setRequests(vacateRequests);
      setFilteredRequests(vacateRequests);
    } catch (error: any) {
      console.error('Error fetching vacate requests:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('Authentication required') || 
          error.message?.includes('401') ||
          error.message?.includes('No token')) {
        toast.error('Please login to continue');
        router.push('/login');
        return;
      }
      
      toast.error(error.message || 'Failed to load vacate requests');
      setRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await fetchVacateRequests();
      await fetchPropertiesData();
      await fetchVacateReasonsData();
      toast.success("Data refreshed");
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchPropertiesData = async () => {
    try {
      const response = await listProperties();
      setProperties(Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []));
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        await Promise.all([
          fetchVacateRequests(),
          fetchPropertiesData(),
          fetchVacateReasonsData()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    initData();
  }, [fetchVacateRequests]);

  
  const fetchVacateReasonsData = async () => {
    try {
      const data = await getMasterValues('VACATE_REASON');
      setVacateReasons(data);
    } catch (error) {
      console.error('Error fetching vacate reasons:', error);
      setVacateReasons([]);
    }
  };

  
  // Filter requests based on active tab
  const getFilteredByTab = () => {
    if (activeTab === 'all') return filteredRequests;
    return filteredRequests.filter(r => r.vacate_status === activeTab);
  };

  // Filter requests
  useEffect(() => {
    let filtered = [...requests];

    // Apply search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        request.tenant_name?.toLowerCase().includes(query) ||
        request.property_name?.toLowerCase().includes(query) ||
        request.primary_reason?.toLowerCase().includes(query) ||
        request.tenant_email?.toLowerCase().includes(query) ||
        request.tenant_phone?.includes(query)
      );
    }

    // Apply status filter (overall, not tab-specific)
    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.vacate_status === filterStatus);
    }

    // Apply priority filter
    if (priorityFilter !== 'all' && priorityFilter !== 'all-priority') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    // Apply property filter
    if (propertyFilter !== 'all') {
      filtered = filtered.filter(request => request.property_id.toString() === propertyFilter);
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [requests, searchTerm, filterStatus, priorityFilter, propertyFilter]);

  // Column filters
  const filteredWithColumns = getFilteredByTab().filter(request => {
    const matchesId = request.vacate_request_id.toString().includes(searchFilters.id);
    const matchesTenant = (request.tenant_name || '').toLowerCase().includes(searchFilters.tenant.toLowerCase());
    const matchesProperty = (request.property_name || '').toLowerCase().includes(searchFilters.property.toLowerCase());
    const matchesRoomBed = `Room ${request.room_number} Bed ${request.bed_number}`.toLowerCase().includes(searchFilters.room_bed.toLowerCase());
   
    const matchesStatus = searchFilters.status === 'all' || request.vacate_status === searchFilters.status;
    const matchesPriority = searchFilters.priority === 'all' || request.priority === searchFilters.priority;
    // Helper function to get local YYYY-MM-DD from a date string or Date object
const getLocalDateString = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const matchesExpectedDate = !searchFilters.expected_date || 
  (request.expected_vacate_date && getLocalDateString(request.expected_vacate_date) === searchFilters.expected_date);

const matchesCreated = !searchFilters.created || 
  getLocalDateString(request.vacate_request_date) === searchFilters.created;
      new Date(request.vacate_request_date).toISOString().split('T')[0] === searchFilters.created;
    
    return matchesId && matchesTenant && matchesProperty && matchesRoomBed && 
           matchesExpectedDate && matchesStatus && matchesPriority && matchesCreated;
  });

  // Sorting
  const sortedRequests = [...filteredWithColumns].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedRequests.slice(startIndex, endIndex);

  const handleSort = (field: keyof VacateRequest) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSearchChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  // Add handler for checkbox selection
const handleSelectAll = () => {
  if (selectedRequests.size === currentItems.length) {
    setSelectedRequests(new Set());
  } else {
    setSelectedRequests(new Set(currentItems.map(r => r.vacate_request_id)));
  }
};

const handleSelectRequest = (id: number) => {
  const newSelected = new Set(selectedRequests);
  if (newSelected.has(id)) {
    newSelected.delete(id);
  } else {
    newSelected.add(id);
  }
  setSelectedRequests(newSelected);
};

// Add bulk delete handler
const handleBulkDelete = async () => {
  if (selectedRequests.size === 0) return;
  
  try {
    setBulkActionLoading(true);
    const result = await bulkDeleteVacateRequests(Array.from(selectedRequests));
    if (result.success) {
      toast.success(`Successfully deleted ${selectedRequests.size} vacate requests`);
      setSelectedRequests(new Set());
      setShowBulkDeleteDialog(false);
      await fetchVacateRequests(); // Refresh the list
    } else {
      toast.error(result.message || "Failed to delete vacate requests");
    }
  } catch (error: any) {
    console.error('Error deleting vacate requests:', error);
    toast.error(error.message || "Failed to delete vacate requests");
  } finally {
    setBulkActionLoading(false);
  }
};

  const handleStatusUpdate = async () => {
    if (!selectedRequest) return;

    try {
      setSubmitting(true);
      
      const payload: StatusUpdatePayload = {
        status: statusUpdateData.status,
        admin_notes: statusUpdateData.admin_notes,
        actual_vacate_date: statusUpdateData.actual_vacate_date,
        refund_amount: statusUpdateData.refund_amount,
        penalty_waived: statusUpdateData.penalty_waived,
      };

      // Get token from all possible locations
      const adminToken = localStorage.getItem('auth_token');
      const genericToken = localStorage.getItem('token');
      const token = adminToken || genericToken;
      
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        localStorage.clear();
        router.push('/login');
        return;
      }

      // Create headers for debugging
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/vacate-requests/${selectedRequest.vacate_request_id}/status`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(payload),
      });

      // Try to read response text
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = JSON.parse(responseText);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update status');
      }
      
      toast.success('Status updated successfully');
      setIsStatusDialogOpen(false);
      setIsPreviewOpen(false);
      
      // Refresh the list
      await fetchVacateRequests();
      
      // Send notification to tenant
      await sendNotificationToTenant(selectedRequest.tenant_id, statusUpdateData.status);
      
    } catch (error: any) {
      console.error('❌ Error updating status:', error);
      
      // Check for specific error types
      if (error.message?.includes('No token') || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast.error('Your session has expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
      } else {
        toast.error(error.message || 'Failed to update status');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: VacateRequest['vacate_status']) => {
    const config = {
      pending: { variant: 'outline' as const, icon: Clock, label: 'Pending' },
      under_review: { variant: 'default' as const, icon: AlertCircle, label: 'Under Review' },
      approved: { variant: 'default' as const, icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejected' },
      completed: { variant: 'default' as const, icon: CheckCircle, label: 'Completed' },
    };

    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;

    return (
      <Badge variant={cfg.variant} className="flex items-center gap-1 text-xs px-2 py-0.5">
        <Icon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    
    const priorityMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      low: { variant: 'outline', icon: CheckCircle },
      medium: { variant: 'secondary', icon: AlertCircle },
      high: { variant: 'default', icon: AlertCircle },
      urgent: { variant: 'destructive', icon: AlertCircle }
    };

    const config = priorityMap[priority] || priorityMap.medium;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 text-xs px-2 py-0.5">
        <Icon className="h-3 w-3" />
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'under_review': return <AlertCircle className="h-3 w-3" />;
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

const calculatePenalties = (request: VacateRequest) => {
  if (!request.check_in_date || !request.expected_vacate_date || !request.monthly_rent) {
    return null;
  }

  const expectedDate = new Date(request.expected_vacate_date);
  const checkInDate = new Date(request.check_in_date);
  const currentDate = new Date();
  
  let lockinPenalty = 0;
  let noticePenalty = 0;
  let isLockinCompleted = false;
  let isNoticeCompleted = false;

  // Parse numeric values
  const monthlyRent = parseFloat(String(request.monthly_rent)) || 0;
  const securityDeposit = parseFloat(String(request.security_deposit)) || 0;
  const lockinRawAmount = parseFloat(String(request.lockin_penalty_amount)) || 0;
  const noticeRawAmount = parseFloat(String(request.notice_penalty_amount)) || 0;

  // ====================================================
  // LOCK-IN PERIOD CALCULATION
  // ====================================================
  if (request.lockin_period_months && request.lockin_period_months > 0) {
    const lockinEndDate = new Date(checkInDate);
    lockinEndDate.setMonth(checkInDate.getMonth() + request.lockin_period_months);
    
    // Check if lock-in is completed based on current date
    isLockinCompleted = currentDate >= lockinEndDate;
    
    // Lock-in penalty applies only if lock-in is NOT completed
    if (!isLockinCompleted) {
      // Calculate based on penalty type
      if (request.lockin_penalty_type === 'percentage' && securityDeposit > 0) {
        lockinPenalty = (securityDeposit * lockinRawAmount) / 100;
      } else {
        lockinPenalty = lockinRawAmount > 0 ? lockinRawAmount : monthlyRent * 2;
      }
    }
  }

  // ====================================================
  // NOTICE PERIOD CALCULATION
  // ====================================================
  if (request.notice_period_days && request.notice_period_days > 0) {
    // Calculate lock-in end date (needed for notice calculation)
    const lockinEndDate = new Date(checkInDate);
    lockinEndDate.setMonth(checkInDate.getMonth() + (request.lockin_period_months || 0));
    
    // Check if lock-in is completed first
    const isLockinCompletedForNotice = currentDate >= lockinEndDate;
    
    if (isLockinCompletedForNotice) {
      // Notice period starts from lock-in end date
      const noticeStartDate = lockinEndDate;
      const noticeEndDate = new Date(noticeStartDate);
      noticeEndDate.setDate(noticeStartDate.getDate() + request.notice_period_days);
      
      // Calculate days given (from lock-in end date to expected vacate date)
      const timeDiff = expectedDate.getTime() - noticeStartDate.getTime();
      const daysGiven = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // Check if notice is completed
      isNoticeCompleted = daysGiven >= request.notice_period_days;
      
      // Notice penalty applies only if notice is NOT completed
      if (!isNoticeCompleted) {
        if (request.notice_penalty_type === 'percentage' && securityDeposit > 0) {
          noticePenalty = (securityDeposit * noticeRawAmount) / 100;
        } else {
          noticePenalty = noticeRawAmount > 0 ? noticeRawAmount : (monthlyRent / 30) * request.notice_period_days;
        }
      }
    } else {
      // Lock-in NOT completed - show pending status
      isNoticeCompleted = false;
    }
  }

  console.log('📊 Admin Penalty Calculation:', {
    checkInDate: checkInDate.toISOString().split('T')[0],
    expectedDate: expectedDate.toISOString().split('T')[0],
    currentDate: currentDate.toISOString().split('T')[0],
    lockinPeriodMonths: request.lockin_period_months,
    isLockinCompleted,
    noticePeriodDays: request.notice_period_days,
    isNoticeCompleted,
    lockinPenalty,
    noticePenalty,
    totalPenalty: lockinPenalty + noticePenalty
  });

  return {
    lockin_penalty: lockinPenalty,
    notice_penalty: noticePenalty,
    total_penalty: lockinPenalty + noticePenalty,
    isLockinCompleted,
    isNoticeCompleted
  };
};

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Tenant Name', 'Property', 'Room', 'Bed', 'Expected Vacate Date', 'Status', 'Priority', 'Created Date'];
    const csvData = filteredRequests.map(request => [
      request.vacate_request_id,
      request.tenant_name,
      request.property_name,
      request.room_number,
      request.bed_number,
      request.expected_vacate_date ? format(new Date(request.expected_vacate_date), 'dd/MM/yyyy') : 'N/A',
      request.vacate_status,
      request.priority || 'N/A',
      format(new Date(request.vacate_request_date), 'dd/MM/yyyy')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vacate-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openPreview = (request: VacateRequest) => {
    setSelectedRequest(request);
    setIsPreviewOpen(true);
  };

  const openStatusUpdate = (request: VacateRequest) => {
    setSelectedRequest(request);
    setStatusUpdateData({
      status: request.vacate_status === 'pending' ? 'under_review' : request.vacate_status,
      admin_notes: request.vacate_admin_notes || '',
      refund_amount: request.refund_amount || undefined,
      penalty_waived: false
    });
    setIsStatusDialogOpen(true);
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center  gap-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading vacate requests...</p>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 ">
      
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 mb-2 px-0 sticky top-24 z-10">
        {/* Total Requests */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Total
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {requests.length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-600">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Pending
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {requests.filter(r => r.vacate_status === 'pending').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-yellow-600">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Under Review */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Review
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {requests.filter(r => r.vacate_status === 'under_review').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-orange-600">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approved */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Approved
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {requests.filter(r => r.vacate_status === 'approved').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-green-600">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Completed
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {requests.filter(r => r.vacate_status === 'completed').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-purple-600">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Bulk Actions Bar */}
{can('delete_requests') && selectedRequests.size > 0 && (
  <div className="px-1 pb-2">
    <div className="flex items-center justify-between gap-2 sm:gap-3 border border-[#E2E8F4] rounded-xl px-2 sm:px-3 py-2 min-h-[40px] sm:min-h-[44px] bg-white shadow-sm">

      {/* Selected Count */}
      <span className="font-bold text-[#1A2B6D] text-[11px] sm:text-sm whitespace-nowrap">
        {selectedRequests.size}{" "}
        {selectedRequests.size === 1 ? "request" : "requests"} selected
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2">

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedRequests(new Set())}
          className="h-7 px-2 text-[10px] sm:text-xs text-[#8892A4] hover:text-gray-600 hover:bg-transparent"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowBulkDeleteDialog(true)}
          className="h-7 sm:h-8 px-2 sm:px-3 bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] hover:bg-red-100 text-[10px] sm:text-xs font-bold shadow-none"
        >
          <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
          Delete {selectedRequests.size}
        </Button>

      </div>

    </div>
  </div>
)}

      

      {/* Main Table Card */}
    <Card className=" rounded-lg shadow-sm overflow-hidden">
  <CardContent className="p-0">
    {filteredRequests.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 m-4 rounded-lg">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No vacate requests found</h3>
        <p className="text-gray-500 mb-4">
          {searchTerm || filterStatus !== 'all' || priorityFilter !== 'all' || propertyFilter !== 'all'
            ? 'Try adjusting your filters'
            : 'No vacate requests have been submitted yet.'}
        </p>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    ) : (
      <div
        className={`flex flex-col rounded-md border border-gray-200 transition-all duration-300 ${
          selectedRequests.size > 0
            ? "h-[320px] md:h-[430px]"
            : "h-[380px] md:h-[470px]"
        }`}
      >
        <div className="overflow-auto flex-1 min-h-0">
          <table
            className="border-collapse text-[11px] font-sans"
            style={{ tableLayout: 'fixed', minWidth: '1300px', width: '100%' }}
          >
            <colgroup>
              <col style={{ width: '34px' }} />   {/* checkbox – sticky left:0 */}
              <col style={{ width: '70px' }} />    {/* ID – sticky left:34px */}
              <col style={{ width: '90px' }} />    {/* Actions – sticky left:104px */}
              <col style={{ width: '130px' }} />   {/* Tenant */}
              <col style={{ width: '120px' }} />   {/* Tenant Phone (NEW) */}
              <col style={{ width: '140px' }} />   {/* Property */}
              <col style={{ width: '110px' }} />   {/* Room/Bed */}
              <col style={{ width: '120px' }} />   {/* Exp. Date */}
              <col style={{ width: '110px' }} />   {/* Status */}
              <col style={{ width: '100px' }} />   {/* Priority */}
              <col style={{ width: '120px' }} />   {/* Created */}
            </colgroup>

            <thead className="sticky top-0 z-10">
              {/* ── Header labels row ── */}
              <tr className="bg-gray-200 border-b border-gray-300">
                {/* Checkbox – sticky */}
                <th className="md:sticky md:left-0 z-[50] px-1.5 py-1.5 text-center border-r border-gray-300 bg-gray-200">
                  {can('delete_requests') && (
                    <input
                      type="checkbox"
                      checked={
                        selectedRequests.size === currentItems.length &&
                        currentItems.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-3.5 h-3.5 cursor-pointer"
                    />
                  )}
                </th>

                {/* ID – sticky */}
                <th
                  className="md:sticky md:left-[34px] z-[50] px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('vacate_request_id')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">ID</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>

                {/* Actions – sticky */}
                <th className="md:sticky md:left-[104px] z-[50] px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Actions</span>
                </th>

                {/* Tenant */}
                <th
                  className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('tenant_name')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Tenant</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>

                {/* Tenant Phone (NEW) */}
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Phone</span>
                </th>

                {/* Property */}
                <th
                  className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('property_name')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Property</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>

                {/* Room/Bed */}
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Room/Bed</span>
                </th>

                {/* Exp. Date */}
                <th
                  className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('expected_vacate_date')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Exp. Date</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>

                {/* Status */}
                <th
                  className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('vacate_status')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Status</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>

                {/* Priority */}
                <th
                  className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Priority</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>

                {/* Created */}
                <th
                  className="px-1.5 py-1.5 text-left bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('vacate_request_date')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Created</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>
              </tr>

              {/* ── Search / filter row ── */}
              <tr className="bg-white border-b border-gray-300">
                <td className="md:sticky md:left-0 z-[50] p-1 border-r border-gray-200 bg-white" />
                <td className="md:sticky md:left-[34px] z-[50] p-1 border-r border-gray-200 bg-white">
                  <Input
                    placeholder="Search ID…"
                    value={searchFilters.id}
                    onChange={(e) => handleSearchChange('id', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="md:sticky md:left-[104px] z-[50] p-1 border-r border-gray-200 bg-white" />
                <td className="p-1 border-r border-gray-200">
                  <Input
                    placeholder="Search tenant…"
                    value={searchFilters.tenant}
                    onChange={(e) => handleSearchChange('tenant', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <div className="h-5" /> {/* no search for phone (optional) */}
                </td>
                <td className="p-1 border-r border-gray-200">
                  <Input
                    placeholder="Search property…"
                    value={searchFilters.property}
                    onChange={(e) => handleSearchChange('property', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <Input
                    placeholder="Search room/bed…"
                    value={searchFilters.room_bed}
                    onChange={(e) => handleSearchChange('room_bed', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <Input
                    type="date"
                    value={searchFilters.expected_date}
                    onChange={(e) => handleSearchChange('expected_date', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <Select
                    value={searchFilters.status}
                    onValueChange={(value) => handleSearchChange('status', value)}
                  >
                    <SelectTrigger className="w-full h-5 text-[10px] border-gray-300 px-1.5 py-0 bg-white rounded-md">
                      <SelectValue placeholder="All…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-1 border-r border-gray-200">
                  <Select
                    value={searchFilters.priority}
                    onValueChange={(value) => handleSearchChange('priority', value)}
                  >
                    <SelectTrigger className="w-full h-5 text-[10px] border-gray-300 px-1.5 py-0 bg-white rounded-md">
                      <SelectValue placeholder="All…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-1">
                  <Input
                    type="date"
                    value={searchFilters.created}
                    onChange={(e) => handleSearchChange('created', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((request, index) => {
                const penalties = calculatePenalties(request);
                const rowBgClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40';
                return (
                  <tr
                    key={request.vacate_request_id}
                    className={`hover:bg-blue-50/40 transition-colors duration-150 border-b border-gray-100 ${rowBgClass}`}
                  >
                    {/* Checkbox – sticky */}
                    <td
                      className={`md:sticky md:left-0 z-[30] w-[34px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                    >
                      {can('delete_requests') && (
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={selectedRequests.has(request.vacate_request_id)}
                            onChange={() => handleSelectRequest(request.vacate_request_id)}
                            aria-label={`Select request ${request.vacate_request_id}`}
                            className="w-3.5 h-3.5 cursor-pointer"
                          />
                        </div>
                      )}
                    </td>

                    {/* ID – sticky */}
                    <td
                      className={`md:sticky md:left-[34px] z-[30] w-[70px] font-mono text-[10px] font-medium text-blue-600 ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                        <span className="truncate">#{request.vacate_request_id}</span>
                      </div>
                    </td>

                    {/* Actions – sticky */}
                    <td
                      className={`md:sticky md:left-[104px] z-[30] w-[90px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                    >
                      <div className="flex items-center gap-0.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openPreview(request)}
                          className="h-6 w-6 p-0 hover:bg-blue-100 flex-shrink-0"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5 text-blue-500" />
                        </Button>
                        {can('manage_vacate_requests') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openStatusUpdate(request)}
                            className="h-6 w-6 p-0 hover:bg-purple-100 flex-shrink-0"
                            title={request.vacate_status === 'pending' ? 'Review' : 'Update Status'}
                          >
                            <Settings className="h-3.5 w-3.5 text-purple-500" />
                          </Button>
                        )}
                      </div>
                    </td>

                    {/* Tenant */}
                    <td
                      className={`w-[130px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                    >
                      <div className="flex items-center gap-1">
                        <div className="bg-blue-100 p-0.5 rounded-full flex-shrink-0">
                          <User className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-medium truncate">
                            {request.tenant_name}
                          </div>
                          <div className="text-[9px] text-gray-500 truncate flex items-center gap-0.5">
                            <Mail className="h-2 w-2 flex-shrink-0" />
                            {request.tenant_email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tenant Phone (NEW) */}
                    <td
                      className={`w-[120px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-gray-700">
                        <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{request.tenant_phone || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Property */}
                    <td
                      className={`w-[140px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                    >
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-[10px] truncate">{request.property_name}</span>
                      </div>
                    </td>

                    {/* Room/Bed */}
                    <td
                      className={`w-[110px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-gray-700">
                        <Bed className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span>R{request.room_number} • B{request.bed_number}</span>
                      </div>
                    </td>

                    {/* Exp. Date */}
                    <td
                      className={`w-[120px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                    >
                      <div className="text-[10px] font-medium whitespace-nowrap">
                        {request.expected_vacate_date
                          ? format(new Date(request.expected_vacate_date), 'dd MMM yyyy')
                          : 'N/A'}
                      </div>
                      {penalties && penalties.total_penalty > 0 && (
                        <div className="text-[9px] text-red-600 mt-0.5">
                          ₹{penalties.total_penalty.toFixed(0)}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td
                      className={`w-[110px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                    >
                      {getStatusBadge(request.vacate_status)}
                    </td>

                    {/* Priority */}
                    <td
                      className={`w-[100px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                    >
                      {getPriorityBadge(request.priority)}
                    </td>

                    {/* Created */}
                    <td
                      className={`w-[120px] ${rowBgClass} py-1.5 px-1`}
                    >
                      <div className="text-[10px] font-medium whitespace-nowrap">
                        {format(new Date(request.vacate_request_date), 'dd MMM yyyy')}
                      </div>
                      <div className="text-[9px] text-gray-500 whitespace-nowrap">
                        {format(new Date(request.vacate_request_date), 'hh:mm a')}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        {filteredRequests.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Show</span>
              <Select
                value={String(itemsPerPage)}
                onValueChange={(val) => {
                  setItemsPerPage(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-6 w-16 text-[10px] border-gray-200 px-1">
                  <SelectValue>{itemsPerPage}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="9999">All</SelectItem>
                </SelectContent>
              </Select>
              <span>entries</span>
              <span className="ml-2">
                Showing {startIndex + 1}–{Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-6 w-6 p-0"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>

              {Array.from(
                {
                  length: Math.min(
                    Math.ceil(filteredRequests.length / itemsPerPage),
                    5
                  ),
                },
                (_, i) => {
                  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-6 w-6 p-0 text-[10px] ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : ''
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )}
  </CardContent>
</Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 rounded-xl  max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] px-2 py-1 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <FileText className="h-4 w-4" />
                Vacate Request Details - #{selectedRequest?.vacate_request_id}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsPreviewOpen(false)}
                className="h-5 w-5 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-50 text-xs">
              Request ID: VR-{selectedRequest?.vacate_request_id}
              {selectedRequest?.tenant_request_id && ` • Tenant Request ID: TR-${selectedRequest.tenant_request_id}`}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="p-4 sm:p-5 space-y-3">
              {/* Status & Priority */}
              <div className="flex flex-wrap gap-2 bg-gray-50 px-3 py-2 rounded-md text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Status:</span>
                  {getStatusBadge(selectedRequest.vacate_status)}
                </div>
                {selectedRequest.priority && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Priority:</span>
                    {getPriorityBadge(selectedRequest.priority)}
                  </div>
                )}
              </div>

              {/* Tenant & Property Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-3 w-3 text-blue-600" />
                      <h4 className="font-semibold text-xs">Tenant Information</h4>
                    </div>
                    <p className="text-xs font-medium">{selectedRequest.tenant_name}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                      <Mail className="h-2 w-2" />
                      <span className="truncate">{selectedRequest.tenant_email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <Phone className="h-2 w-2" />
                      <span>{selectedRequest.tenant_phone}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-3 w-3 text-blue-600" />
                      <h4 className="font-semibold text-xs">Property Details</h4>
                    </div>
                    <p className="text-xs font-medium">{selectedRequest.property_name}</p>
                    <p className="text-[10px] text-gray-500">
                      Room {selectedRequest.room_number} • Bed {selectedRequest.bed_number}
                    </p>
                    {selectedRequest.check_in_date && (
                      <p className="text-[10px] mt-1">
                        Check-in: {format(new Date(selectedRequest.check_in_date), 'dd MMM yyyy')}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-3 w-3 text-blue-600" />
                      <h4 className="font-semibold text-xs">Vacate Details</h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs">
                        Expected: {selectedRequest.expected_vacate_date 
                          ? format(new Date(selectedRequest.expected_vacate_date), 'dd MMM yyyy')
                          : 'Not specified'}
                      </p>
                      {selectedRequest.processed_at && (
                        <p className="text-[10px] text-gray-500">
                          Processed: {format(new Date(selectedRequest.processed_at), 'dd MMM yyyy')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reason and Ratings */}
              <Card>
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm">Vacate Reason & Feedback</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-xs mb-1">Primary Reason</h4>
                    <p className="text-xs text-gray-700">{selectedRequest.primary_reason}</p>
                  </div>

                  {selectedRequest.secondary_reasons && selectedRequest.secondary_reasons.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-xs mb-1">Other Reasons</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedRequest.secondary_reasons.map((reason, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] px-1 py-0">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ratings */}
                  {(selectedRequest.overall_rating || selectedRequest.food_rating || 
                    selectedRequest.cleanliness_rating || selectedRequest.management_rating) && (
                    <div>
                      <h4 className="font-semibold text-xs mb-2">Ratings</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { label: 'Overall', value: selectedRequest.overall_rating },
                          { label: 'Food', value: selectedRequest.food_rating },
                          { label: 'Cleanliness', value: selectedRequest.cleanliness_rating },
                          { label: 'Management', value: selectedRequest.management_rating },
                        ].map((rating) => (
                          rating.value !== null && (
                            <div key={rating.label} className="text-center p-2 border rounded-lg">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold text-xs">{rating.value}/5</span>
                              </div>
                              <p className="text-[10px] text-gray-600">{rating.label}</p>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRequest.improvement_suggestions && (
                    <div>
                      <h4 className="font-semibold text-xs mb-1">Improvement Suggestions</h4>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-700 whitespace-pre-line">
                          {selectedRequest.improvement_suggestions}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

{/* Contract & Penalty Information */}
<Card>
  <CardHeader className="px-4 py-2">
    <CardTitle className="text-sm">Contract & Penalty Information</CardTitle>
  </CardHeader>
  <CardContent className="p-4 space-y-3">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Lock-in Period */}
      <div className="border rounded-lg p-3">
        <h4 className="font-semibold text-xs mb-2">Lock-in Period</h4>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Period:</span>
            <span className="font-medium">{selectedRequest.lockin_period_months || 0} months</span>
          </div>
          {selectedRequest.check_in_date && selectedRequest.lockin_period_months && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Status:</span>
              {(() => {
                const checkIn = new Date(selectedRequest.check_in_date);
                const lockinEnd = new Date(checkIn);
                lockinEnd.setMonth(checkIn.getMonth() + selectedRequest.lockin_period_months);
                const isCompleted = new Date() >= lockinEnd;
                return (
                  <Badge variant={isCompleted ? 'default' : 'destructive'} className="text-[10px]">
                    {isCompleted ? 'Completed' : 'Active'}
                  </Badge>
                );
              })()}
            </div>
          )}
          {selectedRequest.lockin_penalty_amount && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Penalty:</span>
              <span className="font-medium text-red-600">
                {(() => {
                  const securityDeposit = selectedRequest.security_deposit || 0;
                  const penaltyAmount = parseFloat(String(selectedRequest.lockin_penalty_amount)) || 0;
                  
                  if (selectedRequest.lockin_penalty_type === 'percentage' && securityDeposit > 0) {
                    const calculatedAmount = (securityDeposit * penaltyAmount) / 100;
                    return formatCurrency(calculatedAmount);
                  }
                  return formatCurrency(penaltyAmount);
                })()}
              </span>
            </div>
          )}
          <div className="pt-1 border-t mt-1">
            <Badge variant={selectedRequest.lockin_penalty_accepted ? 'default' : 'outline'} className="text-[10px]">
              {selectedRequest.lockin_penalty_accepted ? '✓ Penalty Accepted' : '✗ Penalty Not Accepted'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Notice Period */}
      <div className="border rounded-lg p-3">
        <h4 className="font-semibold text-xs mb-2">Notice Period</h4>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Period:</span>
            <span className="font-medium">{selectedRequest.notice_period_days || 0} days</span>
          </div>
          {selectedRequest.expected_vacate_date && selectedRequest.check_in_date && selectedRequest.lockin_period_months && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Status:</span>
              {(() => {
                const checkIn = new Date(selectedRequest.check_in_date);
                const lockinEnd = new Date(checkIn);
                lockinEnd.setMonth(checkIn.getMonth() + selectedRequest.lockin_period_months);
                const isLockinCompleted = new Date() >= lockinEnd;
                
                if (!isLockinCompleted) {
                  return <Badge variant="destructive" className="text-[10px]">Waiting for Lock-in</Badge>;
                }
                
                const noticeEnd = new Date(lockinEnd);
                noticeEnd.setDate(lockinEnd.getDate() + selectedRequest.notice_period_days);
                const expectedDate = new Date(selectedRequest.expected_vacate_date);
                const isNoticeCompleted = expectedDate >= noticeEnd;
                
                return (
                  <Badge variant={isNoticeCompleted ? 'default' : 'destructive'} className="text-[10px]">
                    {isNoticeCompleted ? 'Completed' : 'Pending'}
                  </Badge>
                );
              })()}
            </div>
          )}
          {selectedRequest.notice_penalty_amount && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Penalty:</span>
              <span className="font-medium text-red-600">
                {(() => {
                  const securityDeposit = selectedRequest.security_deposit || 0;
                  const penaltyAmount = parseFloat(String(selectedRequest.notice_penalty_amount)) || 0;
                  
                  if (selectedRequest.notice_penalty_type === 'percentage' && securityDeposit > 0) {
                    const calculatedAmount = (securityDeposit * penaltyAmount) / 100;
                    return formatCurrency(calculatedAmount);
                  }
                  return formatCurrency(penaltyAmount);
                })()}
              </span>
            </div>
          )}
          <div className="pt-1 border-t mt-1">
            <Badge variant={selectedRequest.notice_penalty_accepted ? 'default' : 'outline'} className="text-[10px]">
              {selectedRequest.notice_penalty_accepted ? '✓ Penalty Accepted' : '✗ Penalty Not Accepted'}
            </Badge>
          </div>
        </div>
      </div>
    </div>

    {/* Penalty Calculation */}
{(() => {
  const penalties = calculatePenalties(selectedRequest);
  if (!penalties) return null;
  
  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="font-medium text-xs mb-2">Penalty Calculation</h4>
      <div className="space-y-1 text-xs">
        {penalties.lockin_penalty > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Lock-in Penalty:</span>
            <span className="font-medium text-red-600">
              {formatCurrency(penalties.lockin_penalty)}
            </span>
          </div>
        )}
        {penalties.notice_penalty > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Notice Period Penalty:</span>
            <span className="font-medium text-red-600">
              {formatCurrency(penalties.notice_penalty)}
            </span>
          </div>
        )}
        {penalties.lockin_penalty === 0 && penalties.notice_penalty === 0 && (
          <p className="text-green-600 font-medium">✓ No penalties applicable</p>
        )}
        {(penalties.lockin_penalty > 0 || penalties.notice_penalty > 0) && (
          <div className="flex justify-between pt-1 mt-1 border-t">
            <span className="font-medium">Total Penalty:</span>
            <span className="font-bold text-red-600">
              {formatCurrency(penalties.lockin_penalty + penalties.notice_penalty)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
})()}

{/* Financial Details */}
<div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-3">
  <h4 className="font-semibold text-xs text-blue-800 mb-2">Financial Details</h4>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
    <div>
      <p className="text-[10px] text-blue-700">Monthly Rent</p>
      <p className="font-semibold text-blue-800">
        {formatCurrency(selectedRequest.monthly_rent)}
      </p>
    </div>
    <div>
      <p className="text-[10px] text-blue-700">Security Deposit</p>
      <p className="font-semibold text-blue-800">
        {formatCurrency(selectedRequest.security_deposit)}
      </p>
    </div>
    {selectedRequest.refund_amount !== null && (
      <div>
        <p className="text-[10px] text-green-700">Refund Amount</p>
        <p className="font-semibold text-green-600">
          {formatCurrency(selectedRequest.refund_amount)}
        </p>
      </div>
    )}
    {selectedRequest.penalty_deduction !== null && (
      <div>
        <p className="text-[10px] text-red-700">Penalty Deduction</p>
        <p className="font-semibold text-red-600">
          {formatCurrency(selectedRequest.penalty_deduction)}
        </p>
      </div>
    )}
  </div>
</div>
  </CardContent>
</Card>
            </div>
          )}

          <DialogFooter className="px-4 py-3 border-t bg-gray-50 sticky bottom-0">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} size="sm" className="h-8 text-xs">
              Close
            </Button>
            {selectedRequest && (
              <Button
                onClick={() => {
                  setIsPreviewOpen(false);
                  openStatusUpdate(selectedRequest);
                }}
                size="sm"
                className="h-7 text-xs bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white"
              >
                <Settings className="h-3 w-3 mr-1" />
                {selectedRequest.vacate_status === 'pending' ? 'Start Review' : 'Update Status'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <AlertDialog  open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent className="max-w-xl w-[95vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Update Request Status
            </AlertDialogTitle>
            <AlertDialogDescription>
              Update the status of request #{selectedRequest?.vacate_request_id} for {selectedRequest?.tenant_name}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="status" className="text-sm">New Status *</Label>
              <Select
                value={statusUpdateData.status}
                onValueChange={(value: any) => setStatusUpdateData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_review">Pending</SelectItem>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                  {/* <SelectItem value="cancelled">Cancel</SelectItem> */}
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* {statusUpdateData.status === 'completed' && (
              <>
                <div>
                  <Label htmlFor="actual_vacate_date" className="text-sm">Actual Vacate Date</Label>
                  <Input
                    id="actual_vacate_date"
                    type="date"
                    value={statusUpdateData.actual_vacate_date || ''}
                    onChange={(e) => setStatusUpdateData(prev => ({ ...prev, actual_vacate_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="refund_amount" className="text-sm">Refund Amount (₹)</Label>
                  <Input
                    id="refund_amount"
                    type="number"
                    placeholder="0.00"
                    value={statusUpdateData.refund_amount || ''}
                    onChange={(e) => setStatusUpdateData(prev => ({ ...prev, refund_amount: parseFloat(e.target.value) }))}
                    className="mt-1"
                  />
                </div>
              </>
            )} */}

            <div>
              <Label htmlFor="admin_notes" className="text-sm">Admin Notes</Label>
              <Textarea
                id="admin_notes"
                placeholder="Add notes about this status update..."
                value={statusUpdateData.admin_notes || ''}
                onChange={(e) => setStatusUpdateData(prev => ({ ...prev, admin_notes: e.target.value }))}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsStatusDialogOpen(false)} disabled={submitting} className="h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              disabled={submitting}
              className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white hover:from-blue-600 hover:to-cyan-600 h-9"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
<Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-5 w-5" />
        Confirm Bulk Delete
      </DialogTitle>
      <DialogDescription>
        Are you sure you want to delete {selectedRequests.size} {selectedRequests.size === 1 ? 'vacate request' : 'vacate requests'}? 
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    
    <div className="bg-red-50 p-3 rounded-md my-2 max-h-40 overflow-y-auto">
      <p className="text-xs font-medium text-red-800 mb-2">Selected requests:</p>
      <ul className="text-xs text-red-700 space-y-1">
        {Array.from(selectedRequests).slice(0, 5).map(id => {
          const request = requests.find(r => r.vacate_request_id === id);
          return (
            <li key={id} className="flex items-center gap-2">
              <span className="font-mono">#{id}</span>
              <span className="truncate">- {request?.tenant_name || 'Unknown'}</span>
            </li>
          );
        })}
        {selectedRequests.size > 5 && (
          <li className="text-red-600 font-medium">
            ...and {selectedRequests.size - 5} more
          </li>
        )}
      </ul>
    </div>
    
    <DialogFooter className="flex gap-2 sm:gap-0">
      <Button
        variant="outline"
        onClick={() => setShowBulkDeleteDialog(false)}
        disabled={bulkActionLoading}
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={handleBulkDelete}
        disabled={bulkActionLoading}
        className="bg-red-600 hover:bg-red-700"
      >
        {bulkActionLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 mr-2" />
            Delete {selectedRequests.size} {selectedRequests.size === 1 ? 'Request' : 'Requests'}
          </>
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}

function sendNotificationToTenant(tenant_id: number, status: string) {
  // Implementation here
}



