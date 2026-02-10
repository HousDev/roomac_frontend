"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Home,
  Phone,
  Mail,
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
  RefreshCw // ADDED THIS IMPORT
} from 'lucide-react';
import { format } from 'date-fns';
// import AdminHeader from '@/components/admin/admin-header';

// Types
interface LeaveRequest {
  id: number;
  tenant_id: number;
  tenant_name: string;
  tenant_email?: string;
  tenant_phone?: string;
  property_id: number;
  property_name: string;
  room_number?: number;
  bed_number?: number;
  request_type: 'leave';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  admin_notes: string | null;
  assigned_to: number | null;
  assigned_to_name?: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  leave_data?: {
    leave_type: string;
    leave_start_date: string;
    leave_end_date: string;
    total_days: number;
    contact_address_during_leave?: string;
    emergency_contact_number?: string;
    room_locked: boolean;
    keys_submitted: boolean;
    created_at: string;
  };
}

interface UpdateLeaveStatusPayload {
  status: 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  admin_notes?: string;
  assigned_to?: number;
}

// API Base URL from environment variable
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';

// API Functions
const fetchLeaveRequests = async (filters = {}) => {
  try {
    const token = localStorage.getItem('admin_token');
    
    // Build query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });

    const response = await fetch(`${API_BASE_URL}/api/admin/leave-requests?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    throw error;
  }
};

const updateLeaveStatus = async (requestId: number, payload: UpdateLeaveStatusPayload) => {
  try {
    const token = localStorage.getItem('admin_token');
    
    const response = await fetch(`${API_BASE_URL}/api/admin/leave-requests/${requestId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating leave status:', error);
    throw error;
  }
};

const fetchLeaveStatistics = async () => {
  try {
    const token = localStorage.getItem('admin_token');
    
    const response = await fetch(`${API_BASE_URL}/api/admin/leave-requests/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching leave statistics:', error);
    throw error;
  }
};

export default function AdminLeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState<UpdateLeaveStatusPayload>({
    status: 'approved',
    admin_notes: ''
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    in_progress: 0,
    cancelled: 0
  });

  // Fetch leave requests
  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      if (searchQuery) filters.search = searchQuery;
      filters.page = currentPage;
      filters.limit = itemsPerPage;

      const result = await fetchLeaveRequests(filters);
      
      if (result.success) {
        setLeaveRequests(result.data);
        setFilteredRequests(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.pages);
        }
      } else {
        toast.error(result.message || 'Failed to fetch leave requests');
        // Fallback to mock data
        setLeaveRequests(getMockLeaveRequests());
        setFilteredRequests(getMockLeaveRequests());
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast.error('Failed to load leave requests');
      // Fallback to mock data
      setLeaveRequests(getMockLeaveRequests());
      setFilteredRequests(getMockLeaveRequests());
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const result = await fetchLeaveStatistics();
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  // Update leave request status
  const handleUpdateLeaveStatus = async (requestId: number) => {
    try {
      setUpdatingStatus(true);
      
      const result = await updateLeaveStatus(requestId, statusUpdateData);
      
      if (result.success) {
        toast.success('Status updated successfully');
        setIsStatusDialogOpen(false);
        loadLeaveRequests(); // Refresh the list
        loadStatistics(); // Refresh statistics
        
        // Reset form
        setStatusUpdateData({
          status: 'approved',
          admin_notes: ''
        });
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating leave status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Apply filters locally (for instant filtering)
  useEffect(() => {
    let filtered = [...leaveRequests];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request =>
        request.tenant_name.toLowerCase().includes(query) ||
        request.property_name.toLowerCase().includes(query) ||
        request.title.toLowerCase().includes(query) ||
        (request.leave_data?.leave_type?.toLowerCase() || '').includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    setFilteredRequests(filtered);
  }, [searchQuery, statusFilter, priorityFilter, leaveRequests]);

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // View request details
  const viewRequestDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  // Open status update dialog
  const openStatusUpdateDialog = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setStatusUpdateData({
      status: request.status === 'pending' ? 'approved' : request.status,
      admin_notes: request.admin_notes || ''
    });
    setIsStatusDialogOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: 'outline', icon: Clock },
      in_progress: { variant: 'default', icon: AlertCircle },
      approved: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle },
      completed: { variant: 'default', icon: CheckCircle },
      cancelled: { variant: 'secondary', icon: XCircle }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
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

  // Initial load
  useEffect(() => {
    loadLeaveRequests();
    loadStatistics();
  }, [currentPage]);

  // Refresh when filters change (debounced search)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadLeaveRequests();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, priorityFilter]);

  if (loading && leaveRequests.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* <AdminHeader /> */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading leave requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* <AdminHeader /> */}
      
      <div className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leave Requests Management</h1>
              <p className="text-gray-600 mt-1">
                Manage and process tenant leave applications
              </p>
            </div>
            
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Button variant="outline" onClick={() => {
                setCurrentPage(1);
                loadLeaveRequests();
                loadStatistics();
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold">{statistics.total}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold">{statistics.pending}</p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Approved</p>
                    <p className="text-2xl font-bold">{statistics.approved}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold">{statistics.rejected}</p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-full">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold">{statistics.completed}</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Check className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by tenant, property, or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                      setCurrentPage(1);
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests ({filteredRequests.length})</CardTitle>
              <CardDescription>
                Page {currentPage} of {totalPages} • Showing {filteredRequests.length} requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'No leave requests have been submitted yet'}
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                      setCurrentPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Tenant</th>
                          <th className="text-left py-3 px-4 font-medium">Leave Details</th>
                          <th className="text-left py-3 px-4 font-medium">Property</th>
                          <th className="text-left py-3 px-4 font-medium">Priority</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((request) => (
                          <tr key={request.id} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium">{request.tenant_name}</p>
                                {request.tenant_phone && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {request.tenant_phone}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium">{request.title}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  {request.leave_data ? (
                                    <span>
                                      {format(new Date(request.leave_data.leave_start_date), 'dd MMM')} - {format(new Date(request.leave_data.leave_end_date), 'dd MMM')}
                                    </span>
                                  ) : (
                                    <span>No dates specified</span>
                                  )}
                                </div>
                                {request.leave_data && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Type: {request.leave_data.leave_type} • {request.leave_data.total_days} days
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Home className="h-4 w-4 text-gray-400" />
                                <span>{request.property_name}</span>
                              </div>
                              {(request.room_number || request.bed_number) && (
                                <div className="text-sm text-gray-500">
                                  Room {request.room_number || 'N/A'}, Bed {request.bed_number || 'N/A'}
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {getPriorityBadge(request.priority)}
                            </td>
                            <td className="py-4 px-4">
                              {getStatusBadge(request.status)}
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                <p>{format(new Date(request.created_at), 'dd MMM yyyy')}</p>
                                <p className="text-gray-500">{format(new Date(request.created_at), 'hh:mm a')}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => viewRequestDetails(request)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => openStatusUpdateDialog(request)}
                                >
                                  Update
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={prevPage}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Request Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Leave Request Details</DialogTitle>
                <DialogDescription>
                  Request ID: {selectedRequest.id} • Submitted on {format(new Date(selectedRequest.created_at), 'dd MMM yyyy hh:mm a')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Tenant Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tenant Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">Tenant Name</Label>
                        <p className="font-medium">{selectedRequest.tenant_name}</p>
                      </div>
                      {selectedRequest.tenant_email && (
                        <div>
                          <Label className="text-sm text-gray-500">Email</Label>
                          <p className="font-medium flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {selectedRequest.tenant_email}
                          </p>
                        </div>
                      )}
                      {selectedRequest.tenant_phone && (
                        <div>
                          <Label className="text-sm text-gray-500">Phone</Label>
                          <p className="font-medium flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {selectedRequest.tenant_phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Leave Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Leave Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRequest.leave_data ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm text-gray-500">Leave Type</Label>
                            <p className="font-medium">{selectedRequest.leave_data.leave_type}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Total Days</Label>
                            <p className="font-medium">{selectedRequest.leave_data.total_days} days</p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Property</Label>
                            <p className="font-medium">{selectedRequest.property_name}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-gray-500">Leave Start Date</Label>
                            <p className="font-medium">
                              {format(new Date(selectedRequest.leave_data.leave_start_date), 'dd MMM yyyy')}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Leave End Date</Label>
                            <p className="font-medium">
                              {format(new Date(selectedRequest.leave_data.leave_end_date), 'dd MMM yyyy')}
                            </p>
                          </div>
                        </div>

                        {selectedRequest.leave_data.contact_address_during_leave && (
                          <div>
                            <Label className="text-sm text-gray-500">Contact Address During Leave</Label>
                            <p className="font-medium">{selectedRequest.leave_data.contact_address_during_leave}</p>
                          </div>
                        )}

                        {selectedRequest.leave_data.emergency_contact_number && (
                          <div>
                            <Label className="text-sm text-gray-500">Emergency Contact</Label>
                            <p className="font-medium">{selectedRequest.leave_data.emergency_contact_number}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1 rounded ${selectedRequest.leave_data.room_locked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {selectedRequest.leave_data.room_locked ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            </div>
                            <span>Room Locked: {selectedRequest.leave_data.room_locked ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`p-1 rounded ${selectedRequest.leave_data.keys_submitted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {selectedRequest.leave_data.keys_submitted ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            </div>
                            <span>Keys Submitted: {selectedRequest.leave_data.keys_submitted ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No leave details available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Request Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Request Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-500">Title</Label>
                        <p className="font-medium">{selectedRequest.title}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-500">Description</Label>
                        <p className="font-medium">{selectedRequest.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm text-gray-500">Priority</Label>
                          <div className="mt-1">
                            {getPriorityBadge(selectedRequest.priority)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Status</Label>
                          <div className="mt-1">
                            {getStatusBadge(selectedRequest.status)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Created At</Label>
                          <p className="font-medium">
                            {format(new Date(selectedRequest.created_at), 'dd MMM yyyy hh:mm a')}
                          </p>
                        </div>
                      </div>

                      {selectedRequest.admin_notes && (
                        <div>
                          <Label className="text-sm text-gray-500">Admin Notes</Label>
                          <p className="font-medium p-3 bg-gray-50 rounded mt-1">
                            {selectedRequest.admin_notes}
                          </p>
                        </div>
                      )}

                      {selectedRequest.resolved_at && (
                        <div>
                          <Label className="text-sm text-gray-500">Resolved At</Label>
                          <p className="font-medium">
                            {format(new Date(selectedRequest.resolved_at), 'dd MMM yyyy hh:mm a')}
                          </p>
                        </div>
                      )}

                      {selectedRequest.assigned_to_name && (
                        <div>
                          <Label className="text-sm text-gray-500">Assigned To</Label>
                          <p className="font-medium">{selectedRequest.assigned_to_name}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    openStatusUpdateDialog(selectedRequest);
                  }}
                >
                  Update Status
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Update Leave Request Status</DialogTitle>
                <DialogDescription>
                  Update status for request by {selectedRequest.tenant_name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">New Status</Label>
                  <Select
                    value={statusUpdateData.status}
                    onValueChange={(value: any) => setStatusUpdateData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="admin_notes"
                    value={statusUpdateData.admin_notes}
                    onChange={(e) => setStatusUpdateData(prev => ({ ...prev, admin_notes: e.target.value }))}
                    placeholder="Add notes about this status update..."
                    rows={4}
                  />
                </div>

                {/* <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Updating the status will send a notification to the tenant.
                  </p>
                </div> */}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsStatusDialogOpen(false)}
                  disabled={updatingStatus}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateLeaveStatus(selectedRequest.id)}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Mock data for testing
function getMockLeaveRequests(): LeaveRequest[] {
  return [
    {
      id: 1,
      tenant_id: 101,
      tenant_name: 'Amit Sharma',
      tenant_email: 'amit.sharma@example.com',
      tenant_phone: '9876543210',
      property_id: 1,
      property_name: 'Sunrise PG',
      room_number: 101,
      bed_number: 2,
      request_type: 'leave',
      title: 'Medical Leave Request',
      description: 'Need 7 days for knee surgery recovery',
      priority: 'high',
      status: 'pending',
      admin_notes: null,
      assigned_to: null,
      resolved_at: null,
      created_at: '2024-03-20T10:30:00.000Z',
      updated_at: '2024-03-20T10:30:00.000Z',
      leave_data: {
        leave_type: 'Medical Leave',
        leave_start_date: '2024-04-01',
        leave_end_date: '2024-04-07',
        total_days: 7,
        contact_address_during_leave: 'City Hospital, Room 302',
        emergency_contact_number: '9123456789',
        room_locked: false,
        keys_submitted: true,
        created_at: '2024-03-20T10:30:00.000Z'
      }
    }
  ];
}