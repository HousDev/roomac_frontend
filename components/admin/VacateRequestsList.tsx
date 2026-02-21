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
} from 'lucide-react';
import { 
  getAdminVacateRequests, 
  updateVacateRequestStatus, 
  sendTenantNotification,
  getPropertiesList,
  getMasterValues,
  type AdminVacateRequest,
  type StatusUpdatePayload
} from '@/lib/tenantRequestsApi';
import { listProperties, Property } from '@/lib/propertyApi';
import router from 'next/router';

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
  const [selectedRequest, setSelectedRequest] = useState<VacateRequest | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [vacateReasons, setVacateReasons] = useState<VacateReason[]>([]);
  const [statusUpdateData, setStatusUpdateData] = useState<StatusUpdateData>({
    status: 'under_review',
    admin_notes: ''
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

    // Apply status filter
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

    // DEBUG: Check what tokens are available
    console.log('🔍 DEBUG - All localStorage items:');
    Object.keys(localStorage).forEach(key => {
      if (key.includes('token') || key.includes('admin')) {
        console.log(`${key}: ${localStorage.getItem(key)?.substring(0, 30)}...`);
      }
    });
    
    // Get token from all possible locations
    const adminToken = localStorage.getItem('auth_token');
    const genericToken = localStorage.getItem('token');
    const token = adminToken || genericToken;
    
    console.log('🔑 Selected token:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
    
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
    
    console.log('📤 Request headers being sent:', headers);
    console.log('📦 Request payload:', payload);
    console.log('🌐 Making request to:', `/api/admin/vacate-requests/${selectedRequest.vacate_request_id}/status`);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/vacate-requests/${selectedRequest.vacate_request_id}/status`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(payload),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Try to read response text
    const responseText = await response.text();
    console.log('📥 Response body:', responseText);
    
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

  // const sendNotificationToTenant = async (tenantId: number, status: string) => {
  //   try {
  //     const token = localStorage.getItem('admin_token');
  //     if (!token) return;

  //     const notificationData = {
  //       user_id: tenantId,
  //       user_type: 'tenant',
  //       title: `Vacate Request ${status.replace('_', ' ')}`,
  //       message: `Your vacate request has been ${status.replace('_', ' ')}`,
  //       type: 'vacate_request',
  //       data: { request_id: selectedRequest?.vacate_request_id }
  //     };

  //     await fetch('http://localhost:3001/api/notifications', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(notificationData),
  //     });
  //   } catch (error) {
  //     console.error('Error sending notification:', error);
  //   }
  // };

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
      <Badge variant={cfg.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800 hover:bg-green-100',
      medium: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      high: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      urgent: 'bg-red-100 text-red-800 hover:bg-red-100'
    };

    return (
      <Badge className={`${colors[priority] || colors.medium}`}>
        {priority.toUpperCase()}
      </Badge>
    );
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
    
    let lockinPenalty = 0;
    let noticePenalty = 0;

    // Calculate lock-in penalty
    if (request.lockin_period_months) {
      const lockinEndDate = new Date(checkInDate);
      lockinEndDate.setMonth(lockinEndDate.getMonth() + request.lockin_period_months);
      
      if (expectedDate < lockinEndDate) {
        lockinPenalty = request.lockin_penalty_amount || request.monthly_rent * 2;
      }
    }

    // Calculate notice period penalty
    if (request.notice_period_days) {
      const today = new Date();
      const daysDifference = Math.ceil((expectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference < request.notice_period_days) {
        const daysShort = request.notice_period_days - daysDifference;
        noticePenalty = request.notice_penalty_amount || (request.monthly_rent / 30) * daysShort;
      }
    }

    return {
      lockin_penalty: lockinPenalty,
      notice_penalty: noticePenalty,
      total_penalty: lockinPenalty + noticePenalty
    };
  };

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredRequests.slice(startIndex, endIndex);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading vacate requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vacate Requests</h1>
            <p className="text-gray-600 mt-1">Manage and process vacate requests from tenants</p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={fetchVacateRequests}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold mt-1">{requests.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold mt-1">
                    {requests.filter(r => r.vacate_status === 'pending').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold mt-1">
                    {requests.filter(r => r.vacate_status === 'under_review').length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold mt-1">
                    {requests.filter(r => r.vacate_status === 'approved').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>All Vacate Requests</CardTitle>
                <CardDescription>
                  Showing {filteredRequests.length} of {requests.length} requests
                </CardDescription>
              </div>
              
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tenant, property..."
                    className="pl-10 w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-priority">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
                <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({requests.filter(r => r.vacate_status === 'pending').length})</TabsTrigger>
                <TabsTrigger value="under_review">Review ({requests.filter(r => r.vacate_status === 'under_review').length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({requests.filter(r => r.vacate_status === 'approved').length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({requests.filter(r => r.vacate_status === 'rejected').length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({requests.filter(r => r.vacate_status === 'completed').length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Room/Bed</TableHead>
                        <TableHead>Expected Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <FileText className="h-12 w-12 text-gray-400 mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No vacate requests found</h3>
                              <p className="text-gray-600">
                                {searchTerm || filterStatus !== 'all' || priorityFilter !== 'all' || propertyFilter !== 'all'
                                  ? 'Try adjusting your filters'
                                  : 'No vacate requests have been submitted yet.'}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentItems.map((request) => {
                          const penalties = calculatePenalties(request);
                          
                          return (
                            <TableRow key={request.vacate_request_id}>
                              <TableCell className="font-medium">
                                #{request.vacate_request_id}
                                {/* {request.tenant_request_id && (
                                  <div className="text-xs text-gray-500">
                                    TR-{request.tenant_request_id}
                                  </div>
                                )} */}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{request.tenant_name}</p>
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Mail className="h-3 w-3" />
                                    <span>{request.tenant_email}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Phone className="h-3 w-3" />
                                    <span>{request.tenant_phone}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-gray-400" />
                                  <span>{request.property_name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Bed className="h-4 w-4 text-gray-400" />
                                  <span>Room {request.room_number} • Bed {request.bed_number}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>
                                    {request.expected_vacate_date 
                                      ? format(new Date(request.expected_vacate_date), 'dd MMM yyyy')
                                      : 'Not specified'}
                                  </span>
                                </div>
                                {penalties && penalties.total_penalty > 0 && (
                                  <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                                    <DollarSign className="h-3 w-3" />
                                    <span>Penalty: ₹{penalties.total_penalty.toFixed(2)}</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>{getStatusBadge(request.vacate_status)}</TableCell>
                              <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                              <TableCell>
                                {format(new Date(request.vacate_request_date), 'dd MMM yyyy')}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => openPreview(request)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openStatusUpdate(request)}>
                                      {request.vacate_status === 'pending' ? (
                                        <>
                                          <AlertCircle className="h-4 w-4 mr-2" />
                                          Start Review
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Update Status
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    {/* <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Contact Tenant
                                    </DropdownMenuItem> */}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {currentItems.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Vacate Request Details
                </DialogTitle>
                <DialogDescription>
                  Request ID: VR-{selectedRequest.vacate_request_id}
                  {selectedRequest.tenant_request_id && ` • Tenant Request ID: TR-${selectedRequest.tenant_request_id}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Tenant & Property Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        <h4 className="font-semibold">Tenant Information</h4>
                      </div>
                      <p className="text-sm font-medium">{selectedRequest.tenant_name}</p>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span>{selectedRequest.tenant_email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Phone className="h-3 w-3" />
                        <span>{selectedRequest.tenant_phone}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="h-4 w-4" />
                        <h4 className="font-semibold">Property Details</h4>
                      </div>
                      <p className="text-sm font-medium">{selectedRequest.property_name}</p>
                      <p className="text-sm text-gray-500">
                        Room {selectedRequest.room_number} • Bed {selectedRequest.bed_number}
                      </p>
                      {selectedRequest.check_in_date && (
                        <p className="text-sm mt-1">
                          Check-in: {format(new Date(selectedRequest.check_in_date), 'dd MMM yyyy')}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4" />
                        <h4 className="font-semibold">Vacate Details</h4>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Expected Vacate: {selectedRequest.expected_vacate_date 
                            ? format(new Date(selectedRequest.expected_vacate_date), 'dd MMM yyyy')
                            : 'Not specified'}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(selectedRequest.vacate_status)}
                          {selectedRequest.processed_at && (
                            <span className="text-xs text-gray-500">
                              {format(new Date(selectedRequest.processed_at), 'dd MMM yyyy')}
                            </span>
                          )}
                        </div>
                        {selectedRequest.vacate_admin_notes && (
                          <p className="text-xs text-gray-500 mt-2">
                            Admin Notes: {selectedRequest.vacate_admin_notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Reason and Ratings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vacate Reason & Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Primary Reason</h4>
                      <p className="text-gray-700">{selectedRequest.primary_reason}</p>
                    </div>

                    {selectedRequest.secondary_reasons && selectedRequest.secondary_reasons.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Other Reasons</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRequest.secondary_reasons.map((reason, idx) => (
                            <Badge key={idx} variant="outline">
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
                        <h4 className="font-semibold mb-3">Ratings</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: 'Overall', value: selectedRequest.overall_rating },
                            { label: 'Food', value: selectedRequest.food_rating },
                            { label: 'Cleanliness', value: selectedRequest.cleanliness_rating },
                            { label: 'Management', value: selectedRequest.management_rating },
                          ].map((rating) => (
                            rating.value !== null && (
                              <div key={rating.label} className="text-center p-3 border rounded-lg">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-semibold text-lg">{rating.value}/5</span>
                                </div>
                                <p className="text-sm text-gray-600">{rating.label}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRequest.improvement_suggestions && (
                      <div>
                        <h4 className="font-semibold mb-2">Improvement Suggestions</h4>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-line">
                            {selectedRequest.improvement_suggestions}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contract & Penalty Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contract & Penalty Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Lock-in Period */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Lock-in Period</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Period:</span>
                            <span className="font-medium">{selectedRequest.lockin_period_months || 0} months</span>
                          </div>
                          {selectedRequest.check_in_date && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Check-in:</span>
                              <span className="font-medium">
                                {format(new Date(selectedRequest.check_in_date), 'dd MMM yyyy')}
                              </span>
                            </div>
                          )}
                          {selectedRequest.lockin_penalty_amount && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Penalty:</span>
                              <span className="font-medium text-red-600">
                                {formatCurrency(selectedRequest.lockin_penalty_amount)} 
                                {selectedRequest.lockin_penalty_type && ` (${selectedRequest.lockin_penalty_type})`}
                              </span>
                            </div>
                          )}
                          <div className="pt-2 border-t">
                            <Badge variant={
                              selectedRequest.lockin_penalty_accepted ? 'default' : 'outline'
                            }>
                              {selectedRequest.lockin_penalty_accepted 
                                ? '✓ Penalty Accepted' 
                                : '✗ Penalty Not Accepted'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Notice Period */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Notice Period</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Period:</span>
                            <span className="font-medium">{selectedRequest.notice_period_days || 0} days</span>
                          </div>
                          {selectedRequest.notice_penalty_amount && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Penalty:</span>
                              <span className="font-medium text-red-600">
                                {formatCurrency(selectedRequest.notice_penalty_amount)}
                                {selectedRequest.notice_penalty_type && ` (${selectedRequest.notice_penalty_type})`}
                              </span>
                            </div>
                          )}
                          <div className="pt-2 border-t">
                            <Badge variant={
                              selectedRequest.notice_penalty_accepted ? 'default' : 'outline'
                            }>
                              {selectedRequest.notice_penalty_accepted 
                                ? '✓ Penalty Accepted' 
                                : '✗ Penalty Not Accepted'}
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
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h4 className="font-medium mb-3">Penalty Calculation</h4>
                          <div className="space-y-2">
                            {penalties.lockin_penalty > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Lock-in Penalty:</span>
                                <span className="font-medium text-red-600">₹{penalties.lockin_penalty.toFixed(2)}</span>
                              </div>
                            )}
                            {penalties.notice_penalty > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Notice Period Penalty:</span>
                                <span className="font-medium text-red-600">₹{penalties.notice_penalty.toFixed(2)}</span>
                              </div>
                            )}
                            {(penalties.lockin_penalty > 0 || penalties.notice_penalty > 0) && (
                              <div className="flex justify-between pt-2 border-t border-gray-200">
                                <span className="font-medium">Total Penalty:</span>
                                <span className="font-bold text-red-600">₹{penalties.total_penalty.toFixed(2)}</span>
                              </div>
                            )}
                            {penalties.total_penalty === 0 && (
                              <p className="text-green-600 font-medium">No penalties applicable</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Financial Info */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-3">Financial Details</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-blue-700">Monthly Rent</p>
                          <p className="font-semibold text-blue-800">
                            {formatCurrency(selectedRequest.monthly_rent)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Security Deposit</p>
                          <p className="font-semibold text-blue-800">
                            {formatCurrency(selectedRequest.security_deposit)}
                          </p>
                        </div>
                        {selectedRequest.refund_amount !== null && (
                          <div>
                            <p className="text-sm text-green-700">Refund Amount</p>
                            <p className="font-semibold text-green-600">
                              {formatCurrency(selectedRequest.refund_amount)}
                            </p>
                          </div>
                        )}
                        {selectedRequest.penalty_deduction !== null && (
                          <div>
                            <p className="text-sm text-red-700">Penalty Deduction</p>
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

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => openStatusUpdate(selectedRequest)}>
                  {selectedRequest.vacate_status === 'pending' ? 'Start Review' : 'Update Status'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Request Status</AlertDialogTitle>
            <AlertDialogDescription>
              Update the status of request #{selectedRequest?.vacate_request_id} for {selectedRequest?.tenant_name}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="status">New Status *</Label>
              <Select
                value={statusUpdateData.status}
                onValueChange={(value: any) => setStatusUpdateData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                  <SelectItem value="cancelled">Cancel</SelectItem>
                  <SelectItem value="completed">Mark as Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {statusUpdateData.status === 'completed' && (
              <>
                <div>
                  <Label htmlFor="actual_vacate_date">Actual Vacate Date</Label>
                  <Input
                    id="actual_vacate_date"
                    type="date"
                    value={statusUpdateData.actual_vacate_date || ''}
                    onChange={(e) => setStatusUpdateData(prev => ({ ...prev, actual_vacate_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="refund_amount">Refund Amount (₹)</Label>
                  <Input
                    id="refund_amount"
                    type="number"
                    placeholder="0.00"
                    value={statusUpdateData.refund_amount || ''}
                    onChange={(e) => setStatusUpdateData(prev => ({ ...prev, refund_amount: parseFloat(e.target.value) }))}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="admin_notes">Admin Notes</Label>
              <Textarea
                id="admin_notes"
                placeholder="Add notes about this status update..."
                value={statusUpdateData.admin_notes || ''}
                onChange={(e) => setStatusUpdateData(prev => ({ ...prev, admin_notes: e.target.value }))}
                rows={3}
              />
            </div>

            {selectedRequest && (() => {
              const penalties = calculatePenalties(selectedRequest);
              if (!penalties || penalties.total_penalty === 0) return null;
              
              return (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Total Penalty:</span>
                    <span className="font-bold text-red-600">₹{penalties.total_penalty.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="penalty_waived"
                      checked={statusUpdateData.penalty_waived || false}
                      onChange={(e) => setStatusUpdateData(prev => ({ ...prev, penalty_waived: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="penalty_waived" className="text-sm cursor-pointer">
                      Waive penalty for this request
                    </Label>
                  </div>
                </div>
              );
            })()}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
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
    </div>
  );
}


function sendNotificationToTenant(tenant_id: number, status: string) {
  throw new Error('Function not implemented.');
}

