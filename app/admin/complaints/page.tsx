// app/admin/complaints/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/src/compat/next-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Building, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  Tag, 
  ArrowUpDown,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  FileText
} from "lucide-react";
import {
  getAdminComplaints,
  updateComplaintStatus,
  assignComplaintStaff,
  resolveComplaint,
  getActiveStaff,
  getComplaintById,
  getComplaintCategories,
  type Complaint,
  type StaffMember,
  type ComplaintCategory
} from "@/lib/complaintsApi";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortField, setSortField] = useState<keyof Complaint>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await getAdminComplaints();
      setComplaints(data);
      console.log('Loaded complaints:', data);
      
      // Load staff and categories
      await Promise.all([loadStaff(), loadCategories()]);
    } catch (err: any) {
      console.error('Error loading complaints:', err);
      toast.error("Failed to load complaints");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const staffData = await getActiveStaff();
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
      setStaff([]);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await getComplaintCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadComplaints();
      toast.success("Data refreshed");
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewComplaint = async (id: number) => {
    try {
      const complaint = await getComplaintById(id);
      if (complaint) {
        setSelectedComplaint(complaint);
        setShowViewDialog(true);
      } else {
        toast.error("Failed to load complaint details");
      }
    } catch (error) {
      console.error('Error loading complaint details:', error);
      toast.error("Failed to load complaint details");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateComplaintStatus(id, status);
      toast.success(`Status updated to ${status}`);
      await loadComplaints();
      setShowStatusDialog(false);
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedComplaint || !selectedStaffId) {
      toast.error("Please select a staff member");
      return;
    }

    try {
      const staffId = Number(selectedStaffId);
      const staffName = staff.find(s => s.id === staffId)?.name || 'Staff';
      
      await assignComplaintStaff(selectedComplaint.id, staffId);
      toast.success(`Assigned to ${staffName}`);
      setShowAssignDialog(false);
      setSelectedStaffId("");
      await loadComplaints();
    } catch (err: any) {
      console.error('Error assigning staff:', err);
      toast.error(err.message || "Failed to assign staff");
    }
  };

  const handleResolve = async () => {
    if (!selectedComplaint || !resolutionNotes.trim()) {
      toast.error("Please provide resolution notes");
      return;
    }

    try {
      await resolveComplaint(selectedComplaint.id, resolutionNotes);
      toast.success("Complaint resolved");
      setShowViewDialog(false);
      setResolutionNotes("");
      await loadComplaints();
    } catch (err: any) {
      console.error('Error resolving complaint:', err);
      toast.error(err.message || "Failed to resolve complaint");
    }
  };

  const handleSort = (field: keyof Complaint) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "destructive",
      in_progress: "default",
      resolved: "secondary",
      closed: "outline"
    };

    const badgeText = status === 'in_progress' ? 'In Progress' : 
                     status.charAt(0).toUpperCase() + status.slice(1);
    
    return (
      <Badge variant={statusMap[status] || "default"}>
        {badgeText}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "outline",
      medium: "secondary",
      high: "default",
      urgent: "destructive"
    };

    const badgeText = priority.charAt(0).toUpperCase() + priority.slice(1);
    
    return (
      <Badge variant={priorityMap[priority] || "default"}>
        {badgeText}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 mr-1" />;
      case 'in_progress': return <Loader2 className="h-4 w-4 mr-1 animate-spin" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'closed': return <XCircle className="h-4 w-4 mr-1" />;
      default: return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  const getCategoryColor = (categoryName?: string) => {
    switch (categoryName?.toLowerCase()) {
      case 'food': return 'bg-red-100 text-red-800 border-red-200';
      case 'room': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'staff': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'other': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Sort complaints
  const sortedComplaints = [...complaints].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Complaints Management</h1>
          <p className="text-gray-600 mt-1">View and manage tenant complaints</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaints.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {complaints.filter(c => c.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {complaints.filter(c => c.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <CardDescription>
            Showing {complaints.length} tenant complaints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
              <p className="text-gray-500 mb-4">No tenant complaints have been submitted yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('id')}>
                      <div className="flex items-center gap-1">
                        ID
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Complaint Details</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('priority')}>
                      <div className="flex items-center gap-1">
                        Priority
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">
                        Status
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                      <div className="flex items-center gap-1">
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedComplaints.map((complaint) => (
                    <TableRow key={complaint.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">
                        #{complaint.id}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {complaint.tenant_name || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {complaint.property_name || "No property"}
                          </div>
                          {complaint.room_info && complaint.room_info !== 'Not assigned' && (
                            <div className="text-xs text-gray-400">
                              {complaint.room_info}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="font-medium line-clamp-1">
                            {complaint.title}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {complaint.complaint_category && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getCategoryColor(complaint.complaint_category)}`}
                              >
                                {complaint.complaint_category}
                              </Badge>
                            )}
                            <div className="text-sm text-gray-600 line-clamp-1">
                              {complaint.complaint_reason || "No reason specified"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(complaint.priority)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(complaint.status)}
                          {getStatusBadge(complaint.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(complaint.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewComplaint(complaint.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowAssignDialog(true);
                            }}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign Staff
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedComplaint(complaint);
                              setNewStatus('');
                              setShowStatusDialog(true);
                            }}>
                              <FileText className="h-4 w-4 mr-2" />
                              Update Status
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
      </Card>

      {/* View Complaint Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Complaint Details - #{selectedComplaint?.id}
            </DialogTitle>
            <DialogDescription>
              Complete information about the complaint
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Status:</span>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Priority:</span>
                  {getPriorityBadge(selectedComplaint.priority)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Category:</span>
                  <Badge 
                    variant="outline" 
                    className={getCategoryColor(selectedComplaint.complaint_category)}
                  >
                    {selectedComplaint.complaint_category || 'General'}
                  </Badge>
                </div>
              </div>

              {/* Tenant Information Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Tenant Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Name</Label>
                      <p className="font-medium">{selectedComplaint.tenant_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Property</Label>
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4 text-gray-400" />
                        <p>{selectedComplaint.property_name || "Not specified"}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Email</Label>
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p>{selectedComplaint.tenant_email || "Not available"}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Phone</Label>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p>{selectedComplaint.tenant_phone || "Not available"}</p>
                      </div>
                    </div>
                  </div>
                  {selectedComplaint.tenant_room_info && (
                    <div className="mt-3 pt-3 border-t">
                      <Label className="text-sm text-gray-500">Current Accommodation</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <span className="text-sm">Room:</span>
                          <span className="ml-2 font-medium">#{selectedComplaint.tenant_room_info.room_number}</span>
                        </div>
                        <div>
                          <span className="text-sm">Bed:</span>
                          <span className="ml-2 font-medium">#{selectedComplaint.tenant_room_info.bed_number}</span>
                        </div>
                        <div>
                          <span className="text-sm">Sharing:</span>
                          <span className="ml-2 font-medium">{selectedComplaint.tenant_room_info.sharing_type}</span>
                        </div>
                        <div>
                          <span className="text-sm">Rent:</span>
                          <span className="ml-2 font-medium">₹{selectedComplaint.tenant_room_info.rent_per_bed}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Complaint Details Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Complaint Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">Title</Label>
                    <p className="font-medium text-lg">{selectedComplaint.title}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500">Category & Reason</Label>
                    <div className="space-y-2 mt-1">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{selectedComplaint.complaint_category || 'General'}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium">
                          {selectedComplaint.complaint_details?.complaint_reason || 
                           selectedComplaint.complaint_reason || 
                           "No reason specified"}
                        </p>
                        {selectedComplaint.custom_reason && (
                          <p className="text-sm text-gray-600 mt-1">
                            Custom reason provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500">Description</Label>
                    <div className="bg-gray-50 p-4 rounded-lg mt-1">
                      <p className="whitespace-pre-wrap">{selectedComplaint.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Management Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Assigned To</Label>
                      {selectedComplaint.staff_name ? (
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{selectedComplaint.staff_name}</p>
                            <p className="text-sm text-gray-500">{selectedComplaint.staff_role}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setShowViewDialog(false);
                              setSelectedComplaint(selectedComplaint);
                              setShowAssignDialog(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign Staff
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Created Date</Label>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p>{new Date(selectedComplaint.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {selectedComplaint.admin_notes && (
                    <div>
                      <Label className="text-sm text-gray-500">Admin Notes</Label>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-1">
                        <p className="whitespace-pre-wrap">{selectedComplaint.admin_notes}</p>
                      </div>
                    </div>
                  )}

                  {selectedComplaint.resolved_at && (
                    <div>
                      <Label className="text-sm text-gray-500">Resolved At</Label>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <p>{new Date(selectedComplaint.resolved_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resolution Section */}
              {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'closed' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Resolution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-gray-500">Resolution Notes *</Label>
                        <Textarea
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Enter detailed resolution notes..."
                          rows={4}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Provide detailed notes on how the complaint was resolved
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleResolve}
                          disabled={!resolutionNotes.trim()}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Resolved
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            handleUpdateStatus(selectedComplaint.id, 'closed');
                            setShowViewDialog(false);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Close Complaint
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assign Staff
            </DialogTitle>
            <DialogDescription>
              Assign a staff member to handle complaint #{selectedComplaint?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Staff Member</Label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.length === 0 ? (
                      <SelectItem value="" disabled>No staff available</SelectItem>
                    ) : (
                      staff.map((staffMember) => (
                        <SelectItem key={staffMember.id} value={staffMember.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{staffMember.name}</span>
                            <span className="text-xs text-gray-500">
                              {staffMember.role} • {staffMember.department}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAssignDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignStaff}
                  disabled={!selectedStaffId}
                >
                  Assign Staff
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Update Status
            </DialogTitle>
            <DialogDescription>
              Update status for complaint #{selectedComplaint?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="in_progress">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4" />
                        In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="resolved">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Resolved
                      </div>
                    </SelectItem>
                    <SelectItem value="closed">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Closed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowStatusDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedComplaint.id, newStatus)}
                  disabled={!newStatus}
                >
                  Update Status
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}