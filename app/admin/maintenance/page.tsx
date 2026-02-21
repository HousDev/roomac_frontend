// app/admin/maintenance/page.tsx - UPDATED
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/src/compat/next-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Eye, AlertCircle, Loader2, RefreshCw, Building, 
  Wrench, Home, User, Calendar, Clock, CheckCircle, 
  XCircle, AlertTriangle, MessageSquare, MoreVertical,
  UserPlus, Settings, Check, X
} from "lucide-react";
import {
  getAdminMaintenanceRequests,
  updateMaintenanceStatus,
  assignMaintenanceStaff,
  resolveMaintenance,
  getActiveStaff,
  type MaintenanceRequest
} from "@/lib/maintenanceApi";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function MaintenancePage() {
  const router = useRouter();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedActionRequest, setSelectedActionRequest] = useState<MaintenanceRequest | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (!token) {
      console.log("Token not ready yet");
      return;
    }
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAdminMaintenanceRequests();
      setRequests(data);
      console.log('Loaded maintenance requests:', data.length);
      
      // Load staff
      await loadStaff();
    } catch (err: any) {
      console.error('Error loading maintenance requests:', err);
      toast.error("Failed to load maintenance requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
      try {
        const staffData = await getActiveStaff();
        setStaff(staffData);
        console.log('Loaded staff:', staffData);
      } catch (error) {
        console.error('Error loading staff:', error);
        setStaff([]);
      }
    };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadRequests();
      toast.success("Data refreshed");
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      setUpdating(true);
      await updateMaintenanceStatus(id, status);
      toast.success(`Status updated to ${status}`);
      await loadRequests();
      setShowStatusDialog(false);
      setSelectedActionRequest(null);
      setNewStatus("");
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignStaff = async (requestId: number, staffId: string) => {
    if (staffId === "no_staff" || !staffId) return;

    try {
      setUpdating(true);

      if (staffId === "unassigned") {
        await assignMaintenanceStaff(requestId, 0);
        toast.success("Staff unassigned");
      } else {
        await assignMaintenanceStaff(requestId, Number(staffId));
        toast.success("Staff assigned");
      }

      await loadRequests();
      setShowAssignDialog(false);
      setSelectedActionRequest(null);
      setSelectedStaffId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to assign staff");
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedRequest || !resolutionNotes.trim()) {
      toast.error("Please provide resolution notes");
      return;
    }

    try {
      setUpdating(true);
      await resolveMaintenance(selectedRequest.id, resolutionNotes);
      toast.success("Maintenance request resolved");
      setShowDialog(false);
      setResolutionNotes("");
      await loadRequests();
    } catch (err: any) {
      console.error('Error resolving request:', err);
      toast.error(err.message || "Failed to resolve request");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: 'destructive', icon: Clock },
      in_progress: { variant: 'default', icon: AlertCircle },
      resolved: { variant: 'secondary', icon: CheckCircle },
      closed: { variant: 'outline', icon: XCircle }
    };

    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      low: { variant: 'outline', icon: CheckCircle },
      medium: { variant: 'secondary', icon: AlertCircle },
      high: { variant: 'default', icon: AlertTriangle },
      urgent: { variant: 'destructive', icon: AlertTriangle }
    };

    const config = priorityMap[priority] || priorityMap.medium;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  // Handle view details action
  const handleViewDetails = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowDialog(true);
  };

  // Handle assign staff action
  const handleOpenAssignStaff = (request: MaintenanceRequest) => {
    setSelectedActionRequest(request);
    setSelectedStaffId(request.assigned_to?.toString() || "unassigned");
    setShowAssignDialog(true);
  };

  // Handle update status action
  const handleOpenUpdateStatus = (request: MaintenanceRequest) => {
    setSelectedActionRequest(request);
    setNewStatus(request.status);
    setShowStatusDialog(true);
  };

  // Format status for display
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pending",
      in_progress: "In Progress",
      resolved: "Resolved",
      closed: "Closed"
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading maintenance requests...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Requests</h1>
          <p className="text-gray-600 mt-1">Track and manage property maintenance requests</p>
        </div>
        <Button 
          variant="outline" 
          onClick={refreshData}
          disabled={refreshing || updating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {requests.filter(r => r.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'resolved' || r.status === 'closed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>All Maintenance Requests</CardTitle>
          <p className="text-sm text-gray-500">
            Showing only maintenance requests (request_type = 'maintenance')
          </p>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance requests found</h3>
              <p className="text-gray-500 mb-4">No maintenance requests have been submitted yet.</p>
              <Button onClick={refreshData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">
                        #{request.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{request.tenant_name || "Unknown"}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">
                          {request.tenant_email || "No email"}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="font-medium truncate">{request.title}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {request.description.substring(0, 60)}...
                        </div>
                        {request.maintenance_data && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {request.maintenance_data.issue_category}
                            </Badge>
                            {request.maintenance_data.location && (
                              <span className="text-xs text-gray-500">
                                • {request.maintenance_data.location}
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="truncate max-w-[120px]">
                            {request.property_name || "Not specified"}
                          </span>
                        </div>
                        {request.room_number && (
                          <div className="text-xs text-gray-500 mt-1">
                            Room: {request.room_number}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(request.priority)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        {request.staff_name ? (
                          <div>
                            <div className="font-medium truncate max-w-[120px]">
                              {request.staff_name}
                            </div>
                            {request.staff_role && (
                              <div className="text-xs text-gray-500">
                                {request.staff_role}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                disabled={updating}
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(request)}
                                className="cursor-pointer"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenAssignStaff(request)}
                                className="cursor-pointer"
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Assign Staff
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenUpdateStatus(request)}
                                className="cursor-pointer"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Update Status
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
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance Request Details
            </DialogTitle>
            <DialogDescription>
              ID: #{selectedRequest?.id} • Created: {selectedRequest && new Date(selectedRequest.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Tenant Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-gray-500">Name</Label>
                        <p className="font-medium">{selectedRequest.tenant_name}</p>
                      </div>
                      {selectedRequest.tenant_email && (
                        <div>
                          <Label className="text-xs text-gray-500">Email</Label>
                          <p className="text-sm">{selectedRequest.tenant_email}</p>
                        </div>
                      )}
                      {selectedRequest.tenant_phone && (
                        <div>
                          <Label className="text-xs text-gray-500">Phone</Label>
                          <p className="text-sm">{selectedRequest.tenant_phone}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Property Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-gray-500">Property</Label>
                        <p className="font-medium">{selectedRequest.property_name || "Not specified"}</p>
                      </div>
                      {selectedRequest.room_number && (
                        <div>
                          <Label className="text-xs text-gray-500">Room Number</Label>
                          <p className="text-sm">{selectedRequest.room_number}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Request Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Request Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-gray-500">Title</Label>
                      <p className="font-medium">{selectedRequest.title}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Description</Label>
                      <div className="bg-gray-50 p-3 rounded-md mt-1">
                        <p className="whitespace-pre-wrap text-sm">{selectedRequest.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500">Priority</Label>
                        <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Status</Label>
                        <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Specific Details */}
              {selectedRequest?.maintenance_data && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Maintenance Specific Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Issue Category</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                              {selectedRequest.maintenance_data.issue_category ? 
                                selectedRequest.maintenance_data.issue_category.charAt(0).toUpperCase() + 
                                selectedRequest.maintenance_data.issue_category.slice(1) 
                                : 'Not specified'
                              }
                            </Badge>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500">Location</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Home className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {selectedRequest.maintenance_data.location ? 
                                selectedRequest.maintenance_data.location.split('_').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')
                                : 'Not specified'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Preferred Visit Time</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {selectedRequest.maintenance_data.preferred_visit_time ? 
                                selectedRequest.maintenance_data.preferred_visit_time === 'morning' ? 'Morning (9 AM - 12 PM)' :
                                selectedRequest.maintenance_data.preferred_visit_time === 'afternoon' ? 'Afternoon (12 PM - 4 PM)' :
                                selectedRequest.maintenance_data.preferred_visit_time === 'evening' ? 'Evening (4 PM - 7 PM)' :
                                selectedRequest.maintenance_data.preferred_visit_time === 'anytime' ? 'Anytime during office hours' :
                                selectedRequest.maintenance_data.preferred_visit_time
                                : 'No preference'
                              }
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500">Access Permission</Label>
                          <div className="mt-1">
                            {selectedRequest.maintenance_data.access_permission ? (
                              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                                <Check className="h-3 w-3 mr-1" />
                                Permission Granted
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">
                                <X className="h-3 w-3 mr-1" />
                                No Permission
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Assign Staff */}
                  <div>
                    <Label className="text-sm">Assign to Maintenance Staff</Label>
                    <Select
                      value={selectedRequest.assigned_to?.toString() || "unassigned"}
                      onValueChange={(value) =>
                        handleAssignStaff(selectedRequest.id, value)
                      }
                      disabled={updating}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select maintenance staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassign</SelectItem>
                        {staff.length > 0 ? (
                          staff.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.name} - {s.role}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_staff" disabled>
                            No staff available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Resolution Notes - Only show for pending/in_progress */}
                  {(selectedRequest.status === 'pending' || selectedRequest.status === 'in_progress') && (
                    <div>
                      <Label className="text-sm">Resolution Notes</Label>
                      <Textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Describe what was done to resolve this maintenance issue..."
                        rows={3}
                        className="mt-1"
                        disabled={updating}
                      />
                      <div className="flex gap-2 mt-3">
                        <Button 
                          onClick={handleResolve}
                          disabled={updating || !resolutionNotes.trim()}
                          className="flex-1"
                        >
                          {updating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Resolved
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            handleUpdateStatus(selectedRequest.id, 'closed');
                            setShowDialog(false);
                          }}
                          disabled={updating}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Close
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Admin Notes (if exists) */}
                  {selectedRequest.admin_notes && (
                    <div>
                      <Label className="text-sm text-gray-500">Admin Notes</Label>
                      <div className="bg-blue-50 p-3 rounded-md mt-1 border border-blue-100">
                        <p className="whitespace-pre-wrap text-sm">{selectedRequest.admin_notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Resolved At (if resolved) */}
                  {selectedRequest.resolved_at && (
                    <div>
                      <Label className="text-sm text-gray-500">Resolved At</Label>
                      <p className="text-sm">
                        {new Date(selectedRequest.resolved_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Staff Dialog */}
      <AlertDialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign Staff to Request #{selectedActionRequest?.id}</AlertDialogTitle>
            <AlertDialogDescription>
              Select a staff member to assign to this maintenance request. The status will be automatically set to "In Progress" when assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Request Details</Label>
              <div className="text-sm text-gray-600 mt-1">
                <p><span className="font-medium">Title:</span> {selectedActionRequest?.title}</p>
                <p><span className="font-medium">Tenant:</span> {selectedActionRequest?.tenant_name}</p>
                <p><span className="font-medium">Current Status:</span> {selectedActionRequest && formatStatus(selectedActionRequest.status)}</p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="staff-select" className="text-sm font-medium">Select Staff *</Label>
              <Select
                value={selectedStaffId}
                onValueChange={setSelectedStaffId}
                disabled={updating}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassign (Set to Pending)</SelectItem>
                  {staff.length > 0 ? (
                    staff.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{s.name}</span>
                          <span className="text-xs text-gray-500">{s.role}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no_staff" disabled>
                      No staff available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Choosing "Unassign" will remove current staff assignment and set status to Pending
              </p>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedActionRequest && handleAssignStaff(selectedActionRequest.id, selectedStaffId)}
              disabled={updating || !selectedStaffId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Staff
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Status Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Status for Request #{selectedActionRequest?.id}</AlertDialogTitle>
            <AlertDialogDescription>
              Change the current status of this maintenance request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Request Details</Label>
              <div className="text-sm text-gray-600 mt-1">
                <p><span className="font-medium">Title:</span> {selectedActionRequest?.title}</p>
                <p><span className="font-medium">Tenant:</span> {selectedActionRequest?.tenant_name}</p>
                <p><span className="font-medium">Current Status:</span> {selectedActionRequest && getStatusBadge(selectedActionRequest.status)}</p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="status-select" className="text-sm font-medium">Select New Status *</Label>
              <Select
                value={newStatus}
                onValueChange={setNewStatus}
                disabled={updating}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Pending</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>In Progress</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="resolved">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Resolved</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="closed">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      <span>Closed</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Changing status may trigger notifications to the tenant
              </p>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedActionRequest && handleUpdateStatus(selectedActionRequest.id, newStatus)}
              disabled={updating || !newStatus || newStatus === selectedActionRequest?.status}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Update Status
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}