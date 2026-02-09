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
} from "lucide-react";
import { adminDeletionApi, type DeletionRequest, type DeletionStats } from "@/lib/adminDeletionApi";
import { listProperties } from "@/lib/propertyApi";
import { Skeleton } from "@/components/ui/skeleton";

type PropertyOption = {
  value: number;
  label: string;
  address?: string;
};

export default function AccountDeletionRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DeletionRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

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

  useEffect(() => {
    loadProperties();
    loadDeletionRequests();
    loadStats();
  }, []);

  // Filter requests
  useEffect(() => {
    let filtered = requests;

    // Filter by search term
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Account Deletion Requests</h1>
                <p className="text-gray-600 mt-2">
                  Review and manage tenant account deletion requests
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadDeletionRequests();
                    loadStats();
                  }}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? <Skeleton className="h-8 w-12" /> : stats.pending}
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? <Skeleton className="h-8 w-12" /> : stats.approved}
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? <Skeleton className="h-8 w-12" /> : stats.rejected}
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Requests</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? <Skeleton className="h-8 w-12" /> : stats.total}
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Filter className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, email, phone, or reason..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-64">
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger>
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map((property) => (
                        <SelectItem key={property.value} value={property.value.toString()}>
                          <div className="flex flex-col">
                            <span>{property.label}</span>
                            {property.address && (
                              <span className="text-xs text-gray-500">{property.address}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Deletion Requests ({filteredRequests.length})</CardTitle>
              <CardDescription>
                Review tenant account deletion requests and take appropriate action
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No pending requests</h3>
                  <p className="text-gray-500 mt-2">
                    {searchTerm || selectedProperty !== "all"
                      ? "No requests match your search criteria"
                      : "All deletion requests have been processed"}
                  </p>
                  {(searchTerm || selectedProperty !== "all") && (
                    <Button
                      variant="outline"
                      className="mt-4"
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Room/Property</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Tenant Since</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.request_id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{request.full_name}</p>
                              <p className="text-sm text-gray-500">{request.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">
                                {request.country_code} {request.phone}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-2">
                                <Home className="h-3 w-3 text-gray-400" />
                                <span className="font-medium">{request.room_display}</span>
                              </div>
                              <p className="text-sm text-gray-500">{request.property_name}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="text-sm line-clamp-2">{request.reason}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">
                                {formatDate(request.requested_at)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {formatDate(request.tenant_since)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setViewDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setApproveDialogOpen(true);
                                  }}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve Request
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setRejectDialogOpen(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject Request
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            {filteredRequests.length > 0 && (
              <CardFooter className="border-t px-6 py-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    Showing <span className="font-medium">{filteredRequests.length}</span> of{" "}
                    <span className="font-medium">{requests.length}</span> requests
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Next
                    </Button>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deletion Request Details</DialogTitle>
            <DialogDescription>
              Review all details before taking action
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Tenant Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Tenant Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="font-medium">{selectedRequest.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="font-medium">{selectedRequest.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="font-medium">
                          {selectedRequest.country_code} {selectedRequest.phone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tenant Since:</span>
                        <span className="font-medium">
                          {formatDate(selectedRequest.tenant_since)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Room & Property Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Room & Property</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Property:</span>
                        <span className="font-medium">{selectedRequest.property_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Room:</span>
                        <span className="font-medium">{selectedRequest.room_display}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Check-in Date:</span>
                        <span className="font-medium">
                          {formatDate(selectedRequest.check_in_date)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Bookings:</span>
                        <span className="font-medium">{selectedRequest.total_bookings}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Deletion Reason */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Deletion Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">{selectedRequest.reason}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Financial Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Payments:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedRequest.total_payments)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Bookings:</span>
                      <span className="font-medium">{selectedRequest.total_bookings}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Request Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Request Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Request ID:</span>
                      <span className="font-medium">#{selectedRequest.request_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Requested On:</span>
                      <span className="font-medium">
                        {formatDate(selectedRequest.requested_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tenant ID:</span>
                      <span className="font-medium">#{selectedRequest.tenant_id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
            >
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => {
                  setViewDialogOpen(false);
                  setRejectDialogOpen(true);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setViewDialogOpen(false);
                  setApproveDialogOpen(true);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Account Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this account deletion request?
              This action will permanently delete the tenant's account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            {selectedRequest && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">
                      Tenant: {selectedRequest.full_name}
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      This will delete their account from {selectedRequest.room_display}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Notes (Optional)
              </label>
              <Textarea
                placeholder="Add notes about why you're approving this request..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                These notes will be visible to the tenant and in the audit log.
              </p>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReviewNotes("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Yes, Approve Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Account Deletion Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this account deletion request?
              The tenant's account will remain active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (Required)
              </label>
              <Textarea
                placeholder="Explain why you're rejecting this request..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be sent to the tenant.
              </p>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReviewNotes("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
              disabled={!reviewNotes.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Yes, Reject Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}