// app/admin/change-bed-requests/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from '@/src/compat/next-navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Download,
  BarChart3,
  Bed,
  Move,
  AlertCircle,
  Check,
  ArrowLeft,
  Edit,
  Save,
  FileText,
  ArrowUpDown,
  X,
  Settings,
  User,
  Phone,
  Mail,
  Building2,
  Calendar,
  DollarSign,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import {
  getAdminChangeBedRequests,
  updateChangeBedRequestStatus,
  getAdminChangeBedRequestById,
  getChangeBedStatistics,
  type AdminChangeBedRequest,
  type ChangeBedStatusUpdate
} from "@/lib/changeBedRequestApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from '@radix-ui/react-checkbox';

export default function AdminChangeBedRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<AdminChangeBedRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AdminChangeBedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [stats, setStats] = useState<any>(null);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  
  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdminChangeBedRequest | null>(null);
  
  // Column search filters
  const [searchFilters, setSearchFilters] = useState({
    id: '',
    tenant: '',
    current_room: '',
    requested_room: '',
    shifting_date: '',
    status: 'all',
    priority: 'all',
    created: ''
  });
  
  const [sortField, setSortField] = useState<keyof AdminChangeBedRequest>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Status update form
  const [statusForm, setStatusForm] = useState<ChangeBedStatusUpdate>({
    request_status: 'pending',
    assigned_bed_number: undefined,
    rent_difference: undefined,
    admin_notes: '',
    process_request: false
  });

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await getAdminChangeBedRequests(filters);
      console.log('📊 API Response:', response);
    console.log('📊 First request data:', response.data[0]);
      setRequests(response.data);
      setFilteredRequests(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Failed to load change bed requests:', error);
      toast.error('Failed to load change bed requests');
      setRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await getChangeBedStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  useEffect(() => {
    loadRequests();
    loadStatistics();
  }, [filters.status, filters.search, filters.sort_by, filters.sort_order]);

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadRequests();
      await loadStatistics();
      toast.success('Data refreshed');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Column filters
  useEffect(() => {
    let filtered = [...requests];

    if (searchFilters.id) {
      filtered = filtered.filter(r => r.tenant_request_id.toString().includes(searchFilters.id));
    }
    if (searchFilters.tenant) {
      const query = searchFilters.tenant.toLowerCase();
      filtered = filtered.filter(r => 
        r.tenant_name.toLowerCase().includes(query) ||
        r.tenant_phone.includes(query) ||
        r.tenant_email?.toLowerCase().includes(query)
      );
    }
    if (searchFilters.current_room) {
      const query = searchFilters.current_room.toLowerCase();
      filtered = filtered.filter(r => 
        r.current_property_name.toLowerCase().includes(query) ||
        `room ${r.current_room_number}`.includes(query) ||
        `bed ${r.current_bed_number}`.includes(query)
      );
    }
    if (searchFilters.requested_room) {
      const query = searchFilters.requested_room.toLowerCase();
      filtered = filtered.filter(r => 
        r.requested_property_name.toLowerCase().includes(query) ||
        `room ${r.requested_room_number}`.includes(query)
      );
    }
    if (searchFilters.shifting_date) {
      filtered = filtered.filter(r => 
        r.shifting_date && new Date(r.shifting_date).toISOString().split('T')[0] === searchFilters.shifting_date
      );
    }
    if (searchFilters.status !== 'all') {
      filtered = filtered.filter(r => r.request_status === searchFilters.status);
    }
    if (searchFilters.priority !== 'all') {
      filtered = filtered.filter(r => r.priority === searchFilters.priority);
    }
    if (searchFilters.created) {
      filtered = filtered.filter(r => 
        new Date(r.created_at).toISOString().split('T')[0] === searchFilters.created
      );
    }

    setFilteredRequests(filtered);
  }, [requests, searchFilters]);

  // Sorting
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedRequests.length / pagination.limit);
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const currentItems = sortedRequests.slice(startIndex, endIndex);

  const handleSort = (field: keyof AdminChangeBedRequest) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSearchChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPagination(prev => ({ ...prev, page }));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: 'outline', icon: Clock },
      approved: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle },
      processed: { variant: 'default', icon: Check }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 text-xs px-2 py-0.5">
        <Icon className="h-3 w-3" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
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
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      case 'processed': return <Check className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const viewRequestDetails = async (id: number) => {
    try {
      const request = await getAdminChangeBedRequestById(id);
      setSelectedRequest(request);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error('Failed to load request details:', error);
      toast.error('Failed to load request details');
    }
  };

  const openStatusUpdateDialog = (request: AdminChangeBedRequest) => {
    setSelectedRequest(request);
    setStatusForm({
      request_status: request.request_status as any,
      assigned_bed_number: request.assigned_bed_number,
      rent_difference: request.rent_difference ? parseFloat(request.rent_difference) : undefined,
      admin_notes: request.admin_notes || '',
      process_request: false
    });
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest) return;

    try {
      setUpdating(selectedRequest.id);
      
      // Calculate rent difference if not provided
      if (!statusForm.rent_difference && statusForm.request_status === 'approved') {
        const currentRent = parseFloat(selectedRequest.current_rent);
        const requestedRent = parseFloat(selectedRequest.requested_rent);
        const rentDiff = requestedRent - currentRent;
        setStatusForm(prev => ({ ...prev, rent_difference: rentDiff }));
      }

      await updateChangeBedRequestStatus(selectedRequest.id, statusForm);
      
      toast.success(`Request ${statusForm.request_status} successfully`);
      setStatusDialogOpen(false);
      loadRequests();
      loadStatistics();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading change bed requests...</p>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 ">
      
      {/* Stats Cards - Responsive Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-2 px-0 sticky top-20 z-10">
          {/* Total Requests */}
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-sm">
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                    Total
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-800">
                    {stats.total_requests}
                  </p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-600">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
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
                    {stats.pending}
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
                    {stats.approved}
                  </p>
                </div>
                <div className="p-1.5 rounded-lg bg-green-600">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processed */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm">
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                    Processed
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-800">
                    {stats.processed}
                  </p>
                </div>
                <div className="p-1.5 rounded-lg bg-blue-600">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions Bar */}
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3 px-0 gap-3 lg:gap-0 sticky top-36 z-10">
  
  {/* LEFT SECTION */}
  <div className="flex flex-col gap-2 w-full lg:flex-row lg:flex-wrap lg:items-center lg:w-auto">

    {/* Row 1 → Search + Status (Mobile Grid) */}
    <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:w-auto">
      
      {/* Search */}
      <div className="relative w-full lg:w-64 col-span-1">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search requests..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="pl-8 h-9 text-sm w-full"
        />
      </div>

      {/* Status */}
      <Select
        value={filters.status}
        onValueChange={(value) => handleFilterChange('status', value)}
      >
        <SelectTrigger className="w-full h-9 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="processed">Processed</SelectItem>
        </SelectContent>
      </Select>

    </div>

    {/* Row 2 → Created Date + Descending (Mobile Grid) */}
    <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:w-auto">

      {/* Sort By */}
      <Select
        value={filters.sort_by}
        onValueChange={(value) => handleFilterChange('sort_by', value)}
      >
        <SelectTrigger className="w-full h-9 text-sm">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">Created Date</SelectItem>
          <SelectItem value="shifting_date">Shifting Date</SelectItem>
          <SelectItem value="priority">Priority</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Order */}
      <Select
        value={filters.sort_order}
        onValueChange={(value) => handleFilterChange('sort_order', value)}
      >
        <SelectTrigger className="w-full h-9 text-sm">
          <SelectValue placeholder="Order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Descending</SelectItem>
          <SelectItem value="asc">Ascending</SelectItem>
        </SelectContent>
      </Select>

    </div>

  </div>

  {/* RIGHT SECTION (Already Grid for Mobile) */}
  <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center">

    <Button
      variant="outline"
      size="sm"
      onClick={refreshData}
      disabled={refreshing}
      className="h-9 w-full sm:w-auto"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
      Refresh
    </Button>

    <Button
      variant="outline"
      size="sm"
      className="h-9 w-full sm:w-auto"
    >
      <Download className="h-4 w-4 mr-2" />
      Export
    </Button>

  </div>
</div>

      {/* Main Table Card */}
      <Card className="shadow-lg border-0 overflow-hidden mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Change Bed Requests</CardTitle>
          <CardDescription className="text-xs">
            Showing {currentItems.length} of {sortedRequests.length} requests
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 m-4 rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-500 mb-4">
                {filters.search ? "No requests match your search." : "No change bed requests yet."}
              </p>
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          ) : (
            <div className="relative">
              {/* Scrollable Table */}
              <div className="overflow-y-auto max-h-[490px] md:max-h-[510px] rounded-b-lg">
                <Table className="w-full">
                  <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-white shadow-sm">
                    <TableRow className="hover:bg-transparent">
                      {/* ID Column */}
                      <TableHead className="w-[90px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('tenant_request_id')}>
                            <span className="font-semibold text-gray-700 text-xs">ID</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="ID..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.id}
                            onChange={(e) => handleSearchChange('id', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Tenant Column */}
                      <TableHead className="w-[180px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('tenant_name')}>
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
                      
                      {/* Current Room Column */}
                      <TableHead className="w-[180px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <span className="font-semibold text-gray-700 text-xs">Current Room</span>
                          <Input 
                            placeholder="Search..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.current_room}
                            onChange={(e) => handleSearchChange('current_room', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Requested Room Column */}
                      <TableHead className="w-[180px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <span className="font-semibold text-gray-700 text-xs">Requested Room</span>
                          <Input 
                            placeholder="Search..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.requested_room}
                            onChange={(e) => handleSearchChange('requested_room', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Shifting Date Column */}
                      <TableHead className="w-[130px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('shifting_date')}>
                            <span className="font-semibold text-gray-700 text-xs">Shifting</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="Date..." 
                            type="date"
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.shifting_date}
                            onChange={(e) => handleSearchChange('shifting_date', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Status Column */}
                      <TableHead className="w-[110px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('request_status')}>
                            <span className="font-semibold text-gray-700 text-xs">Status</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Select 
                            value={searchFilters.status} 
                            onValueChange={(value) => handleSearchChange('status', value)}
                          >
                            <SelectTrigger className="h-7 text-xs border-gray-200">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="processed">Processed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      
                      {/* Priority Column */}
                      <TableHead className="w-[90px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('priority')}>
                            <span className="font-semibold text-gray-700 text-xs">Priority</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Select 
                            value={searchFilters.priority} 
                            onValueChange={(value) => handleSearchChange('priority', value)}
                          >
                            <SelectTrigger className="h-7 text-xs border-gray-200">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      
                      {/* Created Date Column */}
                      <TableHead className="w-[110px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('created_at')}>
                            <span className="font-semibold text-gray-700 text-xs">Created</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="Date..." 
                            type="date"
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.created}
                            onChange={(e) => handleSearchChange('created', e.target.value)}
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
                    {currentItems.map((request, index) => (
                      <TableRow 
                        key={request.id} 
                        className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <TableCell className="font-mono text-xs font-medium text-blue-600 truncate">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            #{request.tenant_request_id}
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-1">
                              <User className="h-3 w-3 text-blue-600 flex-shrink-0" />
                              <span className="text-xs truncate">
                                {request.tenant_name}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                              <Phone className="h-2 w-2" />
                              {request.tenant_phone}
                            </div>
                            {request.tenant_email && (
                              <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                                <Mail className="h-2 w-2" />
                                {request.tenant_email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs truncate">
                                {request.current_property_name}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-500">
                              R{request.current_room_number} • B{request.current_bed_number}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              ₹{request.current_rent}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs truncate">
                                {request.requested_property_name}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-500">
                              R{request.requested_room_number}
                              {request.assigned_bed_number && ` • B${request.assigned_bed_number}`}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              ₹{request.requested_rent}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {request.requested_occupied_beds}/{request.requested_total_beds} occ
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          {request.shifting_date ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className="text-xs">
                                  {format(new Date(request.shifting_date), 'dd MMM')}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                {new Date(request.shifting_date) > new Date() ? 'Upcoming' : 'Past'}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Not specified</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {getStatusBadge(request.request_status)}
                        </TableCell>
                        
                        <TableCell>
                          {getPriorityBadge(request.priority)}
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-xs whitespace-nowrap">
                            {format(new Date(request.created_at), 'dd MMM')}
                          </div>
                          <div className="text-[10px] text-gray-500 whitespace-nowrap">
                            {format(new Date(request.created_at), 'hh:mm a')}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewRequestDetails(request.id)}
                              className="h-7 w-7 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openStatusUpdateDialog(request)}
                              className="h-7 px-2 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                            >
                              Update
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
                  <div className="text-xs text-gray-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, sortedRequests.length)} of {sortedRequests.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="h-8 text-xs"
                    >
                      <ChevronLeft className="h-3 w-3 mr-1" />
                      Previous
                    </Button>
                    <span className="text-xs text-gray-600">
                      Page {pagination.page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= totalPages}
                      className="h-8 text-xs"
                    >
                      Next
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <Move className="h-4 w-4" />
                Change Bed Request Details - #{selectedRequest?.tenant_request_id}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setDetailsDialogOpen(false)}
                className="h-7 w-7 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-50 text-xs">
              Request ID: #{selectedRequest?.tenant_request_id}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="p-4 sm:p-5 space-y-3">
              
              {/* Status & Priority */}
              <div className="flex flex-wrap gap-2 bg-gray-50 px-3 py-2 rounded-md text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Status:</span>
                  {getStatusBadge(selectedRequest.request_status)}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Priority:</span>
                  {getPriorityBadge(selectedRequest.priority)}
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
                      <p className="text-xs font-medium">{selectedRequest.tenant_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Phone</p>
                      <p className="text-xs flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {selectedRequest.tenant_phone}
                      </p>
                    </div>
                    {selectedRequest.tenant_email && (
                      <div className="col-span-2">
                        <p className="text-[10px] text-gray-500">Email</p>
                        <p className="text-xs flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {selectedRequest.tenant_email}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Current Room Details */}
              <Card>
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm">Current Room</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Property</p>
                      <p className="text-xs font-medium flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-gray-400" />
                        {selectedRequest.current_property_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Room / Bed</p>
                      <p className="text-xs">Room {selectedRequest.current_room_number} • Bed {selectedRequest.current_bed_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Current Rent</p>
                      <p className="text-xs font-medium flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        ₹{selectedRequest.current_rent}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requested Room Details */}
              <Card>
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm">Requested Room</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Property</p>
                      <p className="text-xs font-medium flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-gray-400" />
                        {selectedRequest.requested_property_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Room Number</p>
                      <p className="text-xs">{selectedRequest.requested_room_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Bed Status</p>
                      <p className="text-xs">{selectedRequest.requested_occupied_beds}/{selectedRequest.requested_total_beds} occupied</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Requested Rent</p>
                      <p className="text-xs font-medium flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        ₹{selectedRequest.requested_rent}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Rent Difference</p>
                      <p className={`text-xs font-medium ${
                        selectedRequest.rent_difference && parseFloat(selectedRequest.rent_difference) > 0 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {selectedRequest.rent_difference 
                          ? `₹${selectedRequest.rent_difference}`
                          : 'Not calculated'
                        }
                      </p>
                    </div>
                    {selectedRequest.assigned_bed_number && (
                      <div>
                        <p className="text-[10px] text-gray-500">Assigned Bed</p>
                        <p className="text-xs font-medium">Bed {selectedRequest.assigned_bed_number}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Request Details */}
              <Card>
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm">Request Details</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Change Reason</p>
                      <p className="text-xs">{selectedRequest.change_reason || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Shifting Date</p>
                      <p className="text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {selectedRequest.shifting_date 
                          ? format(new Date(selectedRequest.shifting_date), 'dd MMM yyyy')
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-gray-500">Notes</p>
                      <p className="text-xs bg-gray-50 p-2 rounded mt-1">
                        {selectedRequest.notes || 'No notes provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Tenant Request Status</p>
                      <Badge variant={selectedRequest.tenant_request_status === 'completed' ? 'default' : 'outline'} className="text-[10px] mt-1">
                        {selectedRequest.tenant_request_status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Notes */}
              {selectedRequest.admin_notes && (
                <Card>
                  <CardHeader className="px-4 py-2">
                    <CardTitle className="text-sm">Admin Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-xs bg-blue-50 p-2 rounded">{selectedRequest.admin_notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="px-4 py-3 border-t bg-gray-50 sticky bottom-0">
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)} size="sm" className="h-8 text-xs">
              Close
            </Button>
            {selectedRequest && (
              <Button
                onClick={() => {
                  setDetailsDialogOpen(false);
                  openStatusUpdateDialog(selectedRequest);
                }}
                size="sm"
                className="h-8 text-xs bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                <Settings className="h-3 w-3 mr-1" />
                Update Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      {/* Status Update Dialog - Add Admin Notes section */}
<Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
  <DialogContent className="max-w-md w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
    <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
      <div className="flex items-center justify-between">
        <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
          <Settings className="h-4 w-4" />
          Update Status
        </DialogTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setStatusDialogOpen(false)}
          className="h-7 w-7 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <DialogDescription className="text-blue-50 text-xs">
        Update status for request #{selectedRequest?.tenant_request_id}
      </DialogDescription>
    </DialogHeader>
    
    <div className="p-4 sm:p-5 space-y-4">
      <div>
        <Label htmlFor="status" className="text-xs">Status *</Label>
        <Select
          value={statusForm.request_status}
          onValueChange={(value: any) => setStatusForm((prev: any) => ({ 
            ...prev, 
            request_status: value 
          }))}
        >
          <SelectTrigger className="mt-1 h-9 text-xs">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs">Pending</span>
              </div>
            </SelectItem>
            <SelectItem value="approved">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5" />
                <span className="text-xs">Approved</span>
              </div>
            </SelectItem>
            <SelectItem value="rejected">
              <div className="flex items-center gap-2">
                <XCircle className="h-3.5 w-3.5" />
                <span className="text-xs">Rejected</span>
              </div>
            </SelectItem>
            <SelectItem value="processed">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5" />
                <span className="text-xs">Processed</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {statusForm.request_status === 'approved' && (
        <>
          <div>
            <Label htmlFor="assigned_bed_number" className="text-xs">Assigned Bed Number</Label>
            <Input
              id="assigned_bed_number"
              type="number"
              min="1"
              value={statusForm.assigned_bed_number || ''}
              onChange={(e) => setStatusForm((prev: any) => ({ 
                ...prev, 
                assigned_bed_number: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              placeholder="Enter bed number"
              className="mt-1 h-9 text-xs"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Available beds: {
                selectedRequest ? 
                  selectedRequest.requested_total_beds - selectedRequest.requested_occupied_beds 
                  : 'Loading...'
              }
            </p>
          </div>
          
          <div>
            <Label htmlFor="rent_difference" className="text-xs">Rent Difference (₹)</Label>
            <Input
              id="rent_difference"
              type="number"
              value={statusForm.rent_difference || ''}
              onChange={(e) => setStatusForm((prev: any) => ({ 
                ...prev, 
                rent_difference: e.target.value ? parseFloat(e.target.value) : undefined 
              }))}
              placeholder="Enter rent difference"
              className="mt-1 h-9 text-xs"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Current: ₹{selectedRequest?.current_rent} → Requested: ₹{selectedRequest?.requested_rent}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="process_request"
              checked={statusForm.process_request}
              onCheckedChange={(checked) => 
                setStatusForm((prev: any) => ({ 
                  ...prev, 
                  process_request: checked as boolean 
                }))
              }
            />
            <Label htmlFor="process_request" className="text-xs cursor-pointer">
              Process bed change immediately
            </Label>
          </div>
        </>
      )}
      
      {/* Admin Notes Section - ADD THIS */}
      <div>
        <Label htmlFor="admin_notes" className="text-xs flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          Admin Notes
        </Label>
        <Textarea
          id="admin_notes"
          value={statusForm.admin_notes}
          onChange={(e) => setStatusForm((prev: any) => ({ 
            ...prev, 
            admin_notes: e.target.value 
          }))}
          placeholder="Add notes about this status update (will be sent to tenant)"
          rows={3}
          className="mt-1 text-xs"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          These notes will be included in the notification sent to the tenant.
        </p>
      </div>
    </div>
    
    <DialogFooter className="px-4 py-3 border-t bg-gray-50">
      <Button
        variant="outline"
        onClick={() => setStatusDialogOpen(false)}
        disabled={updating !== null}
        size="sm"
        className="h-8 text-xs"
      >
        Cancel
      </Button>
      <Button
        onClick={handleStatusUpdate}
        disabled={updating !== null}
        size="sm"
        className="h-8 text-xs bg-gradient-to-r from-blue-500 to-cyan-500"
      >
        {updating ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Save className="h-3 w-3 mr-1" />
            Update
          </>
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}