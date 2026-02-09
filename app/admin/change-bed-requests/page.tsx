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
  FileText
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
  const [loading, setLoading] = useState(true);
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
      setRequests(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Failed to load change bed requests:', error);
      toast.error('Failed to load change bed requests');
      setRequests([]);
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
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page }));
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
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.toUpperCase()}
      </Badge>
    );
  };

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

  const refreshData = () => {
    loadRequests();
    loadStatistics();
    toast.success('Data refreshed');
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Change Bed Requests</h1>
              <p className="text-gray-600 mt-1">Manage and process tenant change bed requests</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Requests</p>
                    <p className="text-3xl font-bold">{stats.total_requests}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Approved</p>
                    <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Processed</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.processed}</p>
                  </div>
                  <Check className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by tenant name..."
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
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
              
              <div>
                <Label htmlFor="sort_by">Sort By</Label>
                <Select
                  value={filters.sort_by}
                  onValueChange={(value) => handleFilterChange('sort_by', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Created Date</SelectItem>
                    <SelectItem value="shifting_date">Shifting Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sort_order">Order</Label>
                <Select
                  value={filters.sort_order}
                  onValueChange={(value) => handleFilterChange('sort_order', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Change Bed Requests</CardTitle>
            <CardDescription>
              Showing {requests.length} of {pagination.total} requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Current Room</TableHead>
                    <TableHead>Requested Room</TableHead>
                    <TableHead>Shifting Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                        <p className="text-gray-600">
                          {filters.search ? "No requests match your search." : "No change bed requests yet."}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          #{request.tenant_request_id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.tenant_name}</p>
                            <p className="text-sm text-gray-500">{request.tenant_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.current_property_name}</p>
                            <p className="text-sm text-gray-500">
                              Room {request.current_room_number}, Bed {request.current_bed_number}
                            </p>
                            <p className="text-xs text-gray-500">₹{request.current_rent}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.requested_property_name}</p>
                            <p className="text-sm text-gray-500">
                              Room {request.requested_room_number}
                              {request.assigned_bed_number && `, Bed ${request.assigned_bed_number}`}
                            </p>
                            <p className="text-xs text-gray-500">₹{request.requested_rent}</p>
                            <p className="text-xs text-gray-500">
                              {request.requested_occupied_beds}/{request.requested_total_beds} occupied
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.shifting_date ? (
                            <div>
                              <p>{format(new Date(request.shifting_date), 'dd MMM yyyy')}</p>
                              <Badge variant="outline" className="mt-1">
                                {new Date(request.shifting_date) > new Date() ? 'Upcoming' : 'Past'}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-gray-500">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(request.request_status)}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(request.priority)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.created_at), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => viewRequestDetails(request.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openStatusUpdateDialog(request)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Update Status
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedRequest && (
              <>
                <DialogHeader>
                  <DialogTitle>Change Bed Request Details</DialogTitle>
                  <DialogDescription>
                    Request ID: #{selectedRequest.tenant_request_id}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Tenant Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Tenant Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <p className="font-medium">{selectedRequest.tenant_name}</p>
                      </div>
                      <div>
                        <Label>Contact</Label>
                        <p className="font-medium">{selectedRequest.tenant_phone}</p>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p className="font-medium">{selectedRequest.tenant_email}</p>
                      </div>
                      <div>
                        <Label>Request Priority</Label>
                        {getPriorityBadge(selectedRequest.priority)}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Current Room Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Current Room</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Property</Label>
                        <p className="font-medium">{selectedRequest.current_property_name}</p>
                      </div>
                      <div>
                        <Label>Room Number</Label>
                        <p className="font-medium">{selectedRequest.current_room_number}</p>
                      </div>
                      <div>
                        <Label>Bed Number</Label>
                        <p className="font-medium">{selectedRequest.current_bed_number}</p>
                      </div>
                      <div>
                        <Label>Current Rent</Label>
                        <p className="font-medium">₹{selectedRequest.current_rent}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Requested Room Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Requested Room</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Property</Label>
                        <p className="font-medium">{selectedRequest.requested_property_name}</p>
                      </div>
                      <div>
                        <Label>Room Number</Label>
                        <p className="font-medium">{selectedRequest.requested_room_number}</p>
                      </div>
                      <div>
                        <Label>Total Beds</Label>
                        <p className="font-medium">{selectedRequest.requested_total_beds}</p>
                      </div>
                      <div>
                        <Label>Occupied Beds</Label>
                        <p className="font-medium">{selectedRequest.requested_occupied_beds}</p>
                      </div>
                      <div>
                        <Label>Requested Rent</Label>
                        <p className="font-medium">₹{selectedRequest.requested_rent}</p>
                      </div>
                      <div>
                        <Label>Rent Difference</Label>
                        <p className={`font-medium ${
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
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Request Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Request Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Change Reason</Label>
                        <p className="font-medium">{selectedRequest.change_reason || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label>Shifting Date</Label>
                        <p className="font-medium">
                          {selectedRequest.shifting_date 
                            ? format(new Date(selectedRequest.shifting_date), 'dd MMM yyyy')
                            : 'Not specified'
                          }
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Label>Notes</Label>
                        <p className="font-medium">{selectedRequest.notes || 'No notes provided'}</p>
                      </div>
                      <div>
                        <Label>Request Status</Label>
                        <div className="mt-2">
                          {getStatusBadge(selectedRequest.request_status)}
                        </div>
                      </div>
                      <div>
                        <Label>Tenant Request Status</Label>
                        <div className="mt-2">
                          <Badge variant={selectedRequest.tenant_request_status === 'completed' ? 'default' : 'outline'}>
                            {selectedRequest.tenant_request_status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedRequest.admin_notes && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Admin Notes</h3>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedRequest.admin_notes}</p>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Request Status</DialogTitle>
              <DialogDescription>
                Update the status of request #{selectedRequest?.tenant_request_id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={statusForm.request_status}
                  onValueChange={(value: any) => setStatusForm((prev: any) => ({ 
                    ...prev, 
                    request_status: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {statusForm.request_status === 'approved' && (
                <>
                  <div>
                    <Label htmlFor="assigned_bed_number">Assigned Bed Number</Label>
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
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Available beds: {
                        selectedRequest ? 
                          selectedRequest.requested_total_beds - selectedRequest.requested_occupied_beds 
                          : 'Loading...'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="rent_difference">Rent Difference (₹)</Label>
                    <Input
                      id="rent_difference"
                      type="number"
                      value={statusForm.rent_difference || ''}
                      onChange={(e) => setStatusForm((prev: any) => ({ 
                        ...prev, 
                        rent_difference: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                      placeholder="Enter rent difference"
                    />
                    <p className="text-xs text-gray-500 mt-1">
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
                    <Label htmlFor="process_request" className="text-sm cursor-pointer">
                      Process bed change immediately
                    </Label>
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="admin_notes">Admin Notes</Label>
                <Textarea
                  id="admin_notes"
                  value={statusForm.admin_notes}
                  onChange={(e) => setStatusForm((prev: any) => ({ 
                    ...prev, 
                    admin_notes: e.target.value 
                  }))}
                  placeholder="Add notes about this status update..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStatusDialogOpen(false)}
                disabled={updating !== null}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={updating !== null}
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Status
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}