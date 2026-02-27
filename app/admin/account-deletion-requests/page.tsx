


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
  AlertCircle
} from "lucide-react";
import { adminDeletionApi,bulkDeleteRequests, type DeletionRequest, type DeletionStats } from "@/lib/adminDeletionApi";
import { listProperties } from "@/lib/propertyApi";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

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
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  // Column search filters
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
  const loadDeletionRequests = async () => {
    try {
      setLoading(true);
      const result = await adminDeletionApi.getPendingRequests();
      
      if (result.success && result.data) {
        setRequests(result.data);
        setFilteredRequests(result.data);
      } else {
        toast.error(result.message || "Failed to load requests");
      }
    } catch (error: any) {
      console.error("Error loading deletion requests:", error);
      // toast.error(error.message || "Failed to load deletion requests");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gradient-to-br from-blue-50 to-cyan-50">
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
  <div className="sticky top-36 z-10 mb-4 bg-white rounded-lg shadow-lg border border-blue-200 p-3 flex items-center justify-between animate-in slide-in-from-top-2">
    <div className="flex items-center gap-3">
      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
        {selectedRequests.size} {selectedRequests.size === 1 ? 'request' : 'requests'} selected
      </Badge>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setSelectedRequests(new Set())}
        className="text-gray-500 hover:text-gray-700"
      >
        <X className="h-4 w-4 mr-1" />
        Clear
      </Button>
    </div>
    <div className="flex gap-2">
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setShowBulkDeleteDialog(true)}
        className="bg-red-600 hover:bg-red-700"
      >
        <XCircle className="h-4 w-4 mr-1" />
        Delete Selected
      </Button>
    </div>
  </div>
)}
      {/* Actions Bar */}
      {/* <div className="flex items-center justify-between mb-3 px-0">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-40 h-9 text-sm">
              <Building className="h-3 w-3 mr-2 text-gray-400" />
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.value} value={property.value.toString()}>
                  <div className="flex flex-col">
                    <span className="text-xs">{property.label}</span>
                    {property.address && (
                      <span className="text-[10px] text-gray-500">{property.address}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing} className="h-9">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div> */}

      {/* Main Table Card */}
      <Card className="shadow-lg border-0 overflow-hidden mb-6 sticky top-48 z-10">
       
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
            <div className="relative">
              {/* Scrollable Table */}
              <div className="overflow-y-auto max-h-[490px] md:max-h-[510px] rounded-b-lg">
                <Table className="w-full">
                  <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-white shadow-sm">
                    <TableRow className="hover:bg-transparent">
                      {/* Checkbox Column */}
<TableHead className="w-[50px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
  <div className="py-2 flex justify-center">
    <Checkbox 
      checked={selectedRequests.size === sortedRequests.length && sortedRequests.length > 0}
      onCheckedChange={handleSelectAll}
      aria-label="Select all"
    />
  </div>
</TableHead>
                      {/* Tenant Column */}
                      <TableHead className="w-[200px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('full_name')}>
                            <span className="font-semibold text-gray-700 text-xs">Tenant</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="Search tenant..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.tenant}
                            onChange={(e) => handleSearchChange('tenant', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Contact Column */}
                      <TableHead className="w-[150px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <span className="font-semibold text-gray-700 text-xs">Contact</span>
                          <Input 
                            placeholder="Search contact..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.contact}
                            onChange={(e) => handleSearchChange('contact', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Room/Property Column */}
                      <TableHead className="w-[180px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('property_name')}>
                            <span className="font-semibold text-gray-700 text-xs">Room/Property</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="Search room..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.room}
                            onChange={(e) => handleSearchChange('room', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Reason Column */}
                      <TableHead className="w-[200px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <span className="font-semibold text-gray-700 text-xs">Reason</span>
                          <Input 
                            placeholder="Search reason..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.reason}
                            onChange={(e) => handleSearchChange('reason', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Requested Date Column */}
                      <TableHead className="w-[140px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('requested_at')}>
                            <span className="font-semibold text-gray-700 text-xs">Requested</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="Date..." 
                            type="date"
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.requested}
                            onChange={(e) => handleSearchChange('requested', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Tenant Since Column */}
                      <TableHead className="w-[140px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('tenant_since')}>
                            <span className="font-semibold text-gray-700 text-xs">Tenant Since</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="Date..." 
                            type="date"
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.tenant_since}
                            onChange={(e) => handleSearchChange('tenant_since', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Actions Column */}
                      <TableHead className="w-[100px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <span className="font-semibold text-gray-700 text-xs">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  
                  <TableBody>
                    {sortedRequests.map((request, index) => (
                      <TableRow 
                        key={request.request_id} 
                        className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        {/* Checkbox Cell */}
<TableCell className="w-[50px]">
  <div className="flex justify-center">
    <Checkbox 
      checked={selectedRequests.has(request.request_id)}
      onCheckedChange={() => handleSelectRequest(request.request_id)}
      aria-label={`Select request ${request.request_id}`}
    />
  </div>
</TableCell>
                        <TableCell className="truncate">
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-1">
                              <User className="h-3 w-3 text-blue-600 flex-shrink-0" />
                              <span className="text-xs truncate">
                                {request.full_name}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                              <Mail className="h-2 w-2" />
                              {request.email}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs">
                              {request.country_code} {request.phone}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Home className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs truncate">
                                {request.room_display}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              {request.property_name}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          <div className="text-xs line-clamp-2 max-w-[180px]">
                            {request.reason}
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          <div className="text-xs whitespace-nowrap">
                            {formatShortDate(request.requested_at)}
                          </div>
                          <div className="text-[10px] text-gray-500 whitespace-nowrap">
                            {formatTime(request.requested_at)}
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          <div className="text-xs whitespace-nowrap">
                            {formatShortDate(request.tenant_since)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request);
                                setViewDialogOpen(true);
                              }}
                              className="h-7 w-7 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600"
                                >
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs text-blue-600">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setApproveDialogOpen(true);
                                  }}
                                  className="cursor-pointer text-xs text-green-600"
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setRejectDialogOpen(true);
                                  }}
                                  className="cursor-pointer text-xs text-red-600"
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <User className="h-4 w-4" />
                Deletion Request Details - #{selectedRequest?.request_id}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewDialogOpen(false)}
                className="h-7 w-7 text-white hover:bg-white/20"
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