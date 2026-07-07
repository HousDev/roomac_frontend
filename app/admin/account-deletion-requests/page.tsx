// app/admin/account-deletion-requests/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/src/compat/next-navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  User,
  Home,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MoreVertical,
  ChevronDown,
  Building,
  Loader2,
  ArrowUpDown,
  X,
  Settings,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { adminDeletionApi,bulkDeleteRequests, type DeletionRequest, type DeletionStats } from "@/lib/adminDeletionApi";
import { listProperties } from "@/lib/propertyApi";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/authContext";

type PropertyOption = {
  value: number;
  label: string;
  address?: string;
};

export default function AccountDeletionRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DeletionRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  // Add these state variables for bulk actions
const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set());
const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
const [bulkActionLoading, setBulkActionLoading] = useState(false);
const [statusFilter, setStatusFilter] = useState<string>("pending");
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
const { can } = useAuth();
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10);

  const [searchFilters, setSearchFilters] = useState({
    id: '',
    tenant: '',
    contact: '',
    room: '',
    reason: '',
    requested: '',
    tenant_since: ''
  });

  const [sortField, setSortField] = useState<keyof DeletionRequest>('requested_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Stats
  const [stats, setStats] = useState<DeletionStats>({
    byStatus: [],
    monthly: [],
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Load properties
  const loadProperties = async () => {
    try {
      const result = await listProperties({ is_active: true });
      if (result.success && result.data?.data) {
        const propertyOptions = result.data.data.map((property: any) => ({
          value: property.id,
          label: property.name,
          address: `${property.city}, ${property.state}`,
        }));
        setProperties(propertyOptions);
      }
    } catch (error) {
      console.error("Error loading properties:", error);
    }
  };

  // Load deletion requests
// Modify loadDeletionRequests to use the new endpoint
const loadDeletionRequests = async () => {
  try {
    setLoading(true);
    let result;
    
    if (statusFilter === "pending") {
      result = await adminDeletionApi.getPendingRequests();
    } else {
      result = await adminDeletionApi.getAllRequests(statusFilter);
    }
    
    if (result.success && result.data) {
      setRequests(result.data);
      setFilteredRequests(result.data);
    } else {
      toast.error(result.message || "Failed to load requests");
    }
  } catch (error: any) {
    console.error("Error loading deletion requests:", error);
  } finally {
    setLoading(false);
  }
};

// Add useEffect to reload when status filter changes
useEffect(() => {
  loadDeletionRequests();
}, [statusFilter]);

  // Load stats
  const loadStats = async () => {
    try {
      const result = await adminDeletionApi.getStats();
      if (result.success && result.data) {
        setStats(result.data);
        
        // Calculate summary stats from byStatus array
        const summary = result.data.byStatus.reduce(
          (acc: { [x: string]: any; }, item: { status: string | number; count: any; }) => {
            acc[item.status] = item.count;
            return acc;
          },
          { pending: 0, approved: 0, rejected: 0, cancelled: 0 }
        );
        
        setStats(prev => ({
          ...prev,
          pending: summary.pending,
          approved: summary.approved,
          rejected: summary.rejected,
        }));
      }
    } catch (error: any) {
      console.error("Error loading stats:", error);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadDeletionRequests();
      await loadStats();
      toast.success("Data refreshed");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProperties();
    loadDeletionRequests();
    loadStats();
  }, []);

  // Filter requests
  useEffect(() => {
    let filtered = requests;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.full_name.toLowerCase().includes(searchLower) ||
          request.email.toLowerCase().includes(searchLower) ||
          request.phone.toLowerCase().includes(searchLower) ||
          request.property_name?.toLowerCase().includes(searchLower) ||
          request.reason.toLowerCase().includes(searchLower)
      );
    }

    // Filter by property
    if (selectedProperty !== "all") {
      const propertyId = parseInt(selectedProperty);
      filtered = filtered.filter(
        (request) => {
          const property = properties.find(p => p.value === propertyId);
          return property ? request.property_name === property.label : false;
        }
      );
    }

    setFilteredRequests(filtered);
  }, [searchTerm, selectedProperty, requests, properties]);

  // Column filters
  const filteredWithColumns = filteredRequests.filter(request => {
    const matchesId = request.request_id.toString().includes(searchFilters.id);
    const matchesTenant = (request.full_name || '').toLowerCase().includes(searchFilters.tenant.toLowerCase()) ||
                         (request.email || '').toLowerCase().includes(searchFilters.tenant.toLowerCase());
    const matchesContact = `${request.country_code} ${request.phone}`.includes(searchFilters.contact);
    const matchesRoom = (request.room_display || '').toLowerCase().includes(searchFilters.room.toLowerCase()) ||
                       (request.property_name || '').toLowerCase().includes(searchFilters.room.toLowerCase());
    const matchesReason = (request.reason || '').toLowerCase().includes(searchFilters.reason.toLowerCase());
    const matchesRequested = !searchFilters.requested || 
                            new Date(request.requested_at).toISOString().split('T')[0] === searchFilters.requested;
    const matchesTenantSince = !searchFilters.tenant_since || 
                              new Date(request.tenant_since).toISOString().split('T')[0] === searchFilters.tenant_since;
    
    return matchesId && matchesTenant && matchesContact && matchesRoom && 
           matchesReason && matchesRequested && matchesTenantSince;
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

  const handleSort = (field: keyof DeletionRequest) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSearchChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  // Add handler for checkbox selection
const handleSelectAll = () => {
  if (selectedRequests.size === sortedRequests.length) {
    setSelectedRequests(new Set());
  } else {
    setSelectedRequests(new Set(sortedRequests.map(r => r.request_id)));
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
    const result = await adminDeletionApi.bulkDeleteRequests(Array.from(selectedRequests));
    if (result.success) {
      toast.success(`Successfully deleted ${selectedRequests.size} deletion requests`);
      setSelectedRequests(new Set());
      setShowBulkDeleteDialog(false);
      await loadDeletionRequests(); // Refresh the list
      await loadStats();
    } else {
      toast.error(result.message || "Failed to delete requests");
    }
  } catch (error: any) {
    console.error('Error deleting requests:', error);
    toast.error(error.message || "Failed to delete requests");
  } finally {
    setBulkActionLoading(false);
  }
};

  // Handle approve request
  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      const result = await adminDeletionApi.approveRequest(
        selectedRequest.request_id,
        reviewNotes || "Approved by admin"
      );

      if (result.success) {
        toast.success("Deletion request approved successfully");
        setApproveDialogOpen(false);
        setReviewNotes("");
        loadDeletionRequests();
        loadStats();
      } else {
        toast.error(result.message || "Failed to approve request");
      }
    } catch (error: any) {
      console.error("Error approving request:", error);
      // toast.error(error.message || "Failed to approve request");
    }
  };

  // Handle reject request
  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      const result = await adminDeletionApi.rejectRequest(
        selectedRequest.request_id,
        reviewNotes || "Rejected by admin"
      );

      if (result.success) {
        toast.success("Deletion request rejected successfully");
        setRejectDialogOpen(false);
        setReviewNotes("");
        loadDeletionRequests();
        loadStats();
      } else {
        toast.error(result.message || "Failed to reject request");
      }
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      // toast.error(error.message || "Failed to reject request");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Format short date
  const formatShortDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM');
    } catch {
      return "Invalid Date";
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'hh:mm a');
    } catch {
      return "";
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'outline' as const, icon: Clock, label: 'Pending' },
      approved: { variant: 'default' as const, icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejected' },
      cancelled: { variant: 'secondary' as const, icon: XCircle, label: 'Cancelled' }
    };

    const cfg = config[status as keyof typeof config] || config.pending;
    const Icon = cfg.icon;

    return (
      <Badge variant={cfg.variant} className="flex items-center gap-1 text-xs px-2 py-0.5">
        <Icon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center  gap-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading deletion requests...</p>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 ">
      
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-2  mt-5 px-0 sticky top-24 z-10">
        {/* Pending */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Pending
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {loading ? <Skeleton className="h-8 w-12" /> : stats.pending}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-yellow-600">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
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
                  {loading ? <Skeleton className="h-8 w-12" /> : stats.approved}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-green-600">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rejected */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Rejected
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {loading ? <Skeleton className="h-8 w-12" /> : stats.rejected}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-red-600">
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Total
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {loading ? <Skeleton className="h-8 w-12" /> : stats.total}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-blue-600">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

{/* Bulk Actions Bar */}
{selectedRequests.size > 0 && (
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
          <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
          Delete {selectedRequests.size}
        </Button>

      </div>

    </div>
  </div>
)}
     

      {/* Main Table Card */}
     <Card className="border rounded-lg shadow-sm overflow-hidden">
  <CardContent className="p-0">
    {filteredRequests.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 m-4 rounded-lg">
        <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
        <p className="text-gray-500 mb-4">
          {searchTerm || selectedProperty !== "all"
            ? "No requests match your search criteria"
            : "All deletion requests have been processed"}
        </p>
        {(searchTerm || selectedProperty !== "all") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedProperty("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>
    ) : (
      <div
        className={`flex flex-col rounded-md border border-gray-200 transition-all duration-300 ${
          selectedRequests.size > 0
            ? "h-[360px] md:h-[430px]"
            : "h-[420px] md:h-[470px]"
        }`}
      >
        <div className="overflow-auto flex-1 min-h-0">
          <table
            className="border-collapse text-[11px] font-sans"
            style={{ tableLayout: 'fixed', minWidth: '950px', width: '100%' }}
          >
            <colgroup>
              <col style={{ width: '34px' }} />   {/* checkbox – sticky left:0 */}
              <col style={{ width: '100px' }} />    {/* Actions – sticky left:34px */}
              <col style={{ width: '180px' }} />   {/* Tenant – sticky left:114px */}
              <col style={{ width: '110px' }} />   {/* Contact */}
              <col style={{ width: '170px' }} />   {/* Room/Property */}
              <col style={{ width: 'auto' }} />    {/* Reason (fill remaining) */}
              <col style={{ width: '130px' }} />   {/* Requested */}
              <col style={{ width: '130px' }} />   {/* Since */}
            </colgroup>

            <thead className="sticky top-0 z-10">
              {/* ── Header labels row ── */}
              <tr className="bg-gray-200 border-b border-gray-300">
                {/* Checkbox */}
                <th className="md:sticky md:left-0 z-[50] px-1.5 py-1.5 text-center border-r border-gray-300 bg-gray-200">
                  {can('delete_requests') && (
                    <input
                      type="checkbox"
                      checked={
                        selectedRequests.size === sortedRequests.length &&
                        sortedRequests.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-3.5 h-3.5 cursor-pointer"
                    />
                  )}
                </th>

                {/* Actions */}
                <th className="md:sticky md:left-[34px] z-[50] px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Actions</span>
                </th>

                {/* Tenant */}
                <th
                  className="md:sticky md:left-[114px] z-[50] px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('full_name')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Tenant</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>

                {/* Contact */}
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Contact</span>
                </th>

                {/* Room/Property */}
                <th
                  className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('property_name')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Room/Property</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>

                {/* Reason */}
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Reason</span>
                </th>

                {/* Requested */}
                <th
                  className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('requested_at')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Requested</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>

                {/* Since */}
                <th
                  className="px-1.5 py-1.5 text-left bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('tenant_since')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Since</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>
              </tr>

              {/* ── Search / filter row ── */}
              <tr className="bg-white border-b border-gray-300">
                <td className="md:sticky md:left-0 z-[50] p-1 border-r border-gray-200 bg-white" />
                <td className="md:sticky md:left-[34px] z-[50] p-1 border-r border-gray-200 bg-white" />
                <td className="md:sticky md:left-[114px] z-[50] p-1 border-r border-gray-200 bg-white">
                  <Input
                    placeholder="Search tenant…"
                    value={searchFilters.tenant}
                    onChange={(e) => handleSearchChange('tenant', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <Input
                    placeholder="Search contact…"
                    value={searchFilters.contact}
                    onChange={(e) => handleSearchChange('contact', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <Input
                    placeholder="Search room/property…"
                    value={searchFilters.room}
                    onChange={(e) => handleSearchChange('room', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <Input
                    placeholder="Search reason…"
                    value={searchFilters.reason}
                    onChange={(e) => handleSearchChange('reason', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <input
                    type="date"
                    value={searchFilters.requested}
                    onChange={(e) => handleSearchChange('requested', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="date"
                    value={searchFilters.tenant_since}
                    onChange={(e) => handleSearchChange('tenant_since', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
              </tr>
            </thead>

            <tbody>
              {sortedRequests
                .slice(
                  (currentPage - 1) *
                    (itemsPerPage === 'all'
                      ? sortedRequests.length
                      : Number(itemsPerPage)),
                  currentPage *
                    (itemsPerPage === 'all'
                      ? sortedRequests.length
                      : Number(itemsPerPage))
                )
                .map((request, index) => {
                  const rowBgClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40';
                  return (
                    <tr
                      key={request.request_id}
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
                              checked={selectedRequests.has(request.request_id)}
                              onChange={() => handleSelectRequest(request.request_id)}
                              aria-label={`Select request ${request.request_id}`}
                              className="w-3.5 h-3.5 cursor-pointer"
                            />
                          </div>
                        )}
                      </td>

                      {/* Actions – sticky */}
                      <td
                        className={`md:sticky md:left-[34px] z-[30] w-[80px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        <div className="flex items-center gap-0.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedRequest(request);
                              setViewDialogOpen(true);
                            }}
                            className="h-6 w-6 p-0 hover:bg-blue-100 flex-shrink-0"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-500" />
                          </Button>

                          {can('manage_account_deletion') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedRequest(request);
                                setApproveDialogOpen(true);
                              }}
                              className="h-6 w-6 p-0 hover:bg-green-100 flex-shrink-0"
                              title="Approve"
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                            </Button>
                          )}

                          {can('manage_account_deletion') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedRequest(request);
                                setRejectDialogOpen(true);
                              }}
                              className="h-6 w-6 p-0 hover:bg-red-100 flex-shrink-0"
                              title="Reject"
                            >
                              <XCircle className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </td>

                      {/* Tenant – sticky */}
                      <td
                        className={`md:sticky md:left-[114px] z-[30] w-[150px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        <div className="flex items-center gap-1">
                          <div className="bg-blue-100 p-0.5 rounded-full flex-shrink-0">
                            <User className="h-3 w-3 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-medium truncate">
                              {request.full_name}
                            </div>
                            <div className="text-[9px] text-gray-500 truncate flex items-center gap-0.5">
                              <Mail className="h-2 w-2 flex-shrink-0" />
                              {request.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td
                        className={`w-[110px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        <div className="flex items-center gap-0.5 text-[10px] text-gray-700">
                          <Phone className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">
                            {request.country_code} {request.phone}
                          </span>
                        </div>
                      </td>

                      {/* Room/Property */}
                      <td
                        className={`w-[170px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        <div className="flex items-center gap-1">
                          <Home className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-[10px] font-medium truncate">
                            {request.room_display}
                          </span>
                        </div>
                        <div className="text-[9px] text-gray-500 truncate mt-0.5">
                          {request.property_name}
                        </div>
                      </td>

                      {/* Reason */}
                      <td
                        className={`${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        <div className="text-[10px] text-gray-700 line-clamp-2">
                          {request.reason}
                        </div>
                      </td>

                      {/* Requested */}
                      <td
                        className={`w-[130px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        <div className="text-[10px] font-medium whitespace-nowrap">
                          {formatShortDate(request.requested_at)}
                        </div>
                        <div className="text-[9px] text-gray-500 whitespace-nowrap">
                          {formatTime(request.requested_at)}
                        </div>
                      </td>

                      {/* Since */}
                      <td
                        className={`w-[130px] ${rowBgClass} py-1.5 px-1`}
                      >
                        <div className="text-[10px] font-medium whitespace-nowrap">
                          {formatShortDate(request.tenant_since)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        {sortedRequests.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Show</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(val) => {
                  setItemsPerPage(val === 'all' ? 'all' : parseInt(val));
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
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <span>entries</span>
              <span className="ml-2">
                Showing{' '}
                {(currentPage - 1) *
                  (itemsPerPage === 'all'
                    ? sortedRequests.length
                    : Number(itemsPerPage)) +
                  1}
                –
                {Math.min(
                  currentPage *
                    (itemsPerPage === 'all'
                      ? sortedRequests.length
                      : Number(itemsPerPage)),
                  sortedRequests.length
                )}{' '}
                of {sortedRequests.length}
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
                    Math.ceil(
                      sortedRequests.length /
                        (itemsPerPage === 'all'
                          ? sortedRequests.length
                          : Number(itemsPerPage))
                    ),
                    5
                  ),
                },
                (_, i) => {
                  const totalPages = Math.ceil(
                    sortedRequests.length /
                      (itemsPerPage === 'all'
                        ? sortedRequests.length
                        : Number(itemsPerPage))
                  );
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
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={
                  currentPage >=
                  Math.ceil(
                    sortedRequests.length /
                      (itemsPerPage === 'all'
                        ? sortedRequests.length
                        : Number(itemsPerPage))
                  )
                }
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

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-2 py-1 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <User className="h-4 w-4" />
                Deletion Request Details - #{selectedRequest?.request_id}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewDialogOpen(false)}
                className="h-5 w-5 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-50 text-xs">
              Review all details before taking action
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="p-4 sm:p-5 space-y-3">
              
              {/* Status */}
              <div className="flex flex-wrap gap-2 bg-gray-50 px-3 py-2 rounded-md text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Status:</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              {/* Tenant Information */}
              <Card>
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm">Tenant Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Name</p>
                      <p className="text-xs font-medium">{selectedRequest.full_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Email</p>
                      <p className="text-xs flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {selectedRequest.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Phone</p>
                      <p className="text-xs flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {selectedRequest.country_code} {selectedRequest.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Tenant Since</p>
                      <p className="text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {formatDate(selectedRequest.tenant_since)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Room & Property Information */}
              <Card>
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm">Room & Property</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Property</p>
                      <p className="text-xs font-medium flex items-center gap-1">
                        <Building className="h-3 w-3 text-gray-400" />
                        {selectedRequest.property_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Room</p>
                      <p className="text-xs flex items-center gap-1">
                        <Home className="h-3 w-3 text-gray-400" />
                        {selectedRequest.room_display}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Check-in Date</p>
                      <p className="text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {formatDate(selectedRequest.check_in_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Total Bookings</p>
                      <p className="text-xs font-medium">{selectedRequest.total_bookings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deletion Reason */}
              <Card>
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm">Deletion Reason</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-700 whitespace-pre-line">{selectedRequest.reason}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm">Financial Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Total Payments</p>
                      <p className="text-xs font-medium flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        {formatCurrency(selectedRequest.total_payments)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Total Bookings</p>
                      <p className="text-xs font-medium">{selectedRequest.total_bookings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Request Information */}
              <Card>
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm">Request Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Request ID</p>
                      <p className="text-xs font-medium">#{selectedRequest.request_id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Tenant ID</p>
                      <p className="text-xs font-medium">#{selectedRequest.tenant_id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Requested On</p>
                      <p className="text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {formatDate(selectedRequest.requested_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="px-4 py-3 border-t bg-gray-50 sticky bottom-0">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)} size="sm" className="h-8 text-xs">
              Close
            </Button>
            {selectedRequest && (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setViewDialogOpen(false);
                    setRejectDialogOpen(true);
                  }}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  onClick={() => {
                    setViewDialogOpen(false);
                    setApproveDialogOpen(true);
                  }}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent className="max-w-md w-[95vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Account Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this account deletion request?
              This action will permanently delete the tenant's account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedRequest && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start">
                  <User className="h-4 w-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-900">
                      Tenant: {selectedRequest.full_name}
                    </p>
                    <p className="text-[10px] text-amber-700 mt-1">
                      This will delete their account from {selectedRequest.room_display}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Review Notes (Optional)
              </label>
              <Textarea
                placeholder="Add notes about why you're approving this request..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                className="text-xs"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                These notes will be visible to the tenant and in the audit log.
              </p>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReviewNotes("")} className="h-8 text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-8 text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Yes, Approve Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent className="max-w-md w-[95vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Account Deletion Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this account deletion request?
              The tenant's account will remain active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Explain why you're rejecting this request..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                className="text-xs"
                required
              />
              <p className="text-[10px] text-gray-500 mt-1">
                This reason will be sent to the tenant.
              </p>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReviewNotes("")} className="h-8 text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 h-8 text-xs"
              disabled={!reviewNotes.trim()}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Yes, Reject Request
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
        Are you sure you want to delete {selectedRequests.size} {selectedRequests.size === 1 ? 'deletion request' : 'deletion requests'}? 
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    
    <div className="bg-red-50 p-3 rounded-md my-2 max-h-40 overflow-y-auto">
      <p className="text-xs font-medium text-red-800 mb-2">Selected requests:</p>
      <ul className="text-xs text-red-700 space-y-1">
        {Array.from(selectedRequests).slice(0, 5).map(id => {
          const request = requests.find(r => r.request_id === id);
          return (
            <li key={id} className="flex items-center gap-2">
              <span className="font-mono">#{id}</span>
              <span className="truncate">- {request?.full_name || 'Unknown'}</span>
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