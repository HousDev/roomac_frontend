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
  FileText,
  X
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
  const [adminNotes, setAdminNotes] = useState("");
  
  // Add these state variables for search filters
  const [searchFilters, setSearchFilters] = useState({
    id: '',
    tenant: '',
    complaint: '',
    priority: 'all',
    status: 'all',
    date: ''
  });

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await getAdminComplaints();
      setComplaints(data);
      
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
    await updateComplaintStatus(id, status, adminNotes); // Pass admin notes
    toast.success(`Status updated to ${status}${adminNotes ? ' with notes' : ''}`);
    await loadComplaints();
    setShowStatusDialog(false);
    setAdminNotes(""); // Reset after update
    setNewStatus("");
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

  // Add handler functions for search inputs
  const handleSearchChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
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

  // Add this filtered complaints logic
  const filteredComplaints = sortedComplaints.filter(complaint => {
    const matchesId = complaint.id.toString().includes(searchFilters.id);
    const matchesTenant = (complaint.tenant_name || '').toLowerCase().includes(searchFilters.tenant.toLowerCase());
    const matchesComplaint = (complaint.title || '').toLowerCase().includes(searchFilters.complaint.toLowerCase()) ||
                            (complaint.complaint_reason || '').toLowerCase().includes(searchFilters.complaint.toLowerCase());
    const matchesPriority = searchFilters.priority === 'all' || complaint.priority === searchFilters.priority;
    const matchesStatus = searchFilters.status === 'all' || complaint.status === searchFilters.status;
    const matchesDate = !searchFilters.date || 
                        new Date(complaint.created_at).toISOString().split('T')[0] === searchFilters.date;
    
    return matchesId && matchesTenant && matchesComplaint && matchesPriority && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 ">
     

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-4 -mt-5 md:-mt-2 sticky top-20 z-10">

  {/* Total Complaints */}
  <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-sm">
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
            Total Complaints
          </p>
          <p className="text-sm sm:text-base font-bold text-slate-800">
            {complaints.length}
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
            {complaints.filter(c => c.status === 'pending').length}
          </p>
        </div>
        <div className="p-1.5 rounded-lg bg-yellow-600">
          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* In Progress */}
  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm">
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
            In Progress
          </p>
          <p className="text-sm sm:text-base font-bold text-slate-800">
            {complaints.filter(c => c.status === 'in_progress').length}
          </p>
        </div>
        <div className="p-1.5 rounded-lg bg-blue-600">
          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Resolved */}
  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
            Resolved
          </p>
          <p className="text-sm sm:text-base font-bold text-slate-800">
            {complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length}
          </p>
        </div>
        <div className="p-1.5 rounded-lg bg-green-600">
          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>

</div>

      <Card className="shadow-lg border-0  sticky top-44 z-10">
  <CardContent className="p-0">
    {complaints.length === 0 ? (
      <div className="text-center py-16 bg-gray-50 m-6 rounded-lg">
        <div className="bg-white p-8 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-sm">
          <AlertCircle className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
        <p className="text-gray-500 mb-4">No tenant complaints have been submitted yet.</p>
      </div>
    ) : (
      <div className="relative">
        {/* Sticky Header Table */}
        <div className="overflow-auto max-h-[480px] md:max-h-[550px] rounded-b-lg">
          <Table className="relative">
            <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-white shadow-sm">
              <TableRow className="hover:bg-transparent">
                {/* ID Column with Search */}
                <TableHead className="min-w-[100px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                  <div className="space-y-2 py-2">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('id')}>
                      <span className="font-semibold text-gray-700">ID</span>
                      <ArrowUpDown className="h-3 w-3 text-gray-500" />
                    </div>
                    <Input 
                      placeholder="Search ID..." 
                      className="h-8 text-xs border-gray-200 focus:border-blue-400"
                      value={searchFilters.id}
                      onChange={(e) => handleSearchChange('id', e.target.value)}
                    />
                  </div>
                </TableHead>
                
                {/* Tenant Column with Search */}
                <TableHead className="min-w-[200px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                  <div className="space-y-2 py-2">
                    <span className="font-semibold text-gray-700">Tenant</span>
                    <Input 
                      placeholder="Search tenant..." 
                      className="h-8 text-xs border-gray-200 focus:border-blue-400"
                      value={searchFilters.tenant}
                      onChange={(e) => handleSearchChange('tenant', e.target.value)}
                    />
                  </div>
                </TableHead>
                
                {/* Complaint Details Column with Search */}
                <TableHead className="min-w-[250px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                  <div className="space-y-2 py-2">
                    <span className="font-semibold text-gray-700">Complaint Details</span>
                    <Input 
                      placeholder="Search complaints..." 
                      className="h-8 text-xs border-gray-200 focus:border-blue-400"
                      value={searchFilters.complaint}
                      onChange={(e) => handleSearchChange('complaint', e.target.value)}
                    />
                  </div>
                </TableHead>
                
                {/* Priority Column with Select Filter */}
                <TableHead className="min-w-[120px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                  <div className="space-y-2 py-2">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('priority')}>
                      <span className="font-semibold text-gray-700">Priority</span>
                      <ArrowUpDown className="h-3 w-3 text-gray-500" />
                    </div>
                    <Select 
                      value={searchFilters.priority} 
                      onValueChange={(value) => handleSearchChange('priority', value)}
                    >
                      <SelectTrigger className="h-8 text-xs border-gray-200">
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableHead>
                
                {/* Status Column with Select Filter */}
                <TableHead className="min-w-[140px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                  <div className="space-y-2 py-2">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('status')}>
                      <span className="font-semibold text-gray-700">Status</span>
                      <ArrowUpDown className="h-3 w-3 text-gray-500" />
                    </div>
                    <Select 
                      value={searchFilters.status} 
                      onValueChange={(value) => handleSearchChange('status', value)}
                    >
                      <SelectTrigger className="h-8 text-xs border-gray-200">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableHead>
                
                {/* Date Column with Search */}
                <TableHead className="min-w-[150px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                  <div className="space-y-2 py-2">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('created_at')}>
                      <span className="font-semibold text-gray-700">Date</span>
                      <ArrowUpDown className="h-3 w-3 text-gray-500" />
                    </div>
                    <Input 
                      placeholder="Search date..." 
                      type="date"
                      className="h-8 text-xs border-gray-200 focus:border-blue-400"
                      value={searchFilters.date}
                      onChange={(e) => handleSearchChange('date', e.target.value)}
                    />
                  </div>
                </TableHead>
                
                {/* Actions Column - NOT STICKY */}
                <TableHead className="min-w-[100px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                  <span className="font-semibold text-gray-700">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {filteredComplaints.map((complaint, index) => (
                <TableRow 
                  key={complaint.id} 
                  className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  <TableCell className="font-mono text-sm font-medium text-blue-600">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      #{complaint.id}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1.5">
                      <div className="font-medium flex items-center gap-1.5">
                        <div className="bg-blue-100 p-1 rounded-full">
                          <User className="h-3 w-3 text-blue-600" />
                        </div>
                        <span className="truncate max-w-[150px]">
                          {complaint.tenant_name || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 ml-6">
                        <Building className="h-3 w-3" />
                        {complaint.property_name || "No property"}
                      </div>
                      {complaint.room_info && complaint.room_info !== 'Not assigned' && (
                        <div className="text-xs text-gray-400 ml-6">
                          🏠 {complaint.room_info}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-2">
                      <div className="font-medium text-sm line-clamp-1 text-gray-800">
                        {complaint.title}
                      </div>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {complaint.complaint_category && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs border-0 shadow-sm ${getCategoryColor(complaint.complaint_category)}`}
                          >
                            {complaint.complaint_category}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500 line-clamp-1">
                          {complaint.complaint_reason || "No reason specified"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="transform transition-transform hover:scale-105">
                      {getPriorityBadge(complaint.priority)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full shadow-sm border">
                      {getStatusIcon(complaint.status)}
                      {getStatusBadge(complaint.status)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {new Date(complaint.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(complaint.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Actions Column - NOT STICKY */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 border-blue-100 shadow-lg">
                        <DropdownMenuLabel className="text-blue-600">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleViewComplaint(complaint.id)}
                          className="cursor-pointer hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-2 text-blue-500" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowAssignDialog(true);
                          }}
                          className="cursor-pointer hover:bg-blue-50"
                        >
                          <UserPlus className="h-4 w-4 mr-2 text-green-500" />
                          Assign Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setNewStatus('');
                            setShowStatusDialog(true);
                          }}
                          className="cursor-pointer hover:bg-blue-50"
                        >
                          <FileText className="h-4 w-4 mr-2 text-purple-500" />
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
      </div>
    )}
  </CardContent>
</Card>

      {/* View Complaint Dialog - Compact with Grid */}
    <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
  <DialogContent className="max-w-3xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
    
    {/* Header - Compact */}
    <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
      <div className="flex items-center justify-between">
        <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
          <MessageSquare className="h-4 w-4" />
          Complaint Details - #{selectedComplaint?.id}
        </DialogTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowViewDialog(false)}
          className="h-7 w-7 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <DialogDescription className="text-blue-50 text-xs mt-1">
        Complete information about the complaint
      </DialogDescription>
    </DialogHeader>

    {selectedComplaint && (
      <div className="p-4 sm:p-5 space-y-3 max-h-[80vh] overflow-y-auto">

        {/* Status + Priority */}
        <div className="flex flex-wrap gap-2 bg-gray-50 px-3 py-2 rounded-md text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Status:</span>
            {getStatusBadge(selectedComplaint.status)}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Priority:</span>
            {getPriorityBadge(selectedComplaint.priority)}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Category:</span>
            <Badge 
              variant="outline" 
              className={`text-[10px] px-2 py-0 ${getCategoryColor(selectedComplaint.complaint_category)}`}
            >
              {selectedComplaint.complaint_category || 'General'}
            </Badge>
          </div>
        </div>

        {/* Tenant Info */}
        <div className="border rounded-md p-3">
          <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
            <User className="h-3 w-3" />
            Tenant Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Name</span>
              <p className="font-medium truncate">{selectedComplaint.tenant_name}</p>
            </div>

            <div>
              <span className="text-gray-500">Property</span>
              <p className="flex items-center gap-1 truncate">
                <Building className="h-3 w-3 text-gray-400" />
                {selectedComplaint.property_name || "Not specified"}
              </p>
            </div>

            <div>
              <span className="text-gray-500">Email</span>
              <p className="flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 text-gray-400" />
                {selectedComplaint.tenant_email || "N/A"}
              </p>
            </div>

            <div>
              <span className="text-gray-500">Phone</span>
              <p className="flex items-center gap-1 truncate">
                <Phone className="h-3 w-3 text-gray-400" />
                {selectedComplaint.tenant_phone || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Complaint Details */}
        <div className="border rounded-md p-3">
          <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
            <MessageSquare className="h-3 w-3" />
            Complaint Details
          </h4>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500">Title</span>
                <p className="font-medium truncate">{selectedComplaint.title}</p>
              </div>
              <div>
                <span className="text-gray-500">Created</span>
                <p>{new Date(selectedComplaint.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <span className="text-gray-500">Reason</span>
              <div className="bg-gray-50 p-2 rounded mt-1">
                {selectedComplaint.complaint_details?.complaint_reason || 
                 selectedComplaint.complaint_reason || 
                 "No reason specified"}
              </div>
            </div>

            <div>
              <span className="text-gray-500">Description</span>
              <div className="bg-gray-50 p-2 rounded mt-1 max-h-24 overflow-y-auto">
                {selectedComplaint.description}
              </div>
            </div>
          </div>
        </div>

        {/* Management */}
        <div className="border rounded-md p-3">
          <h4 className="text-xs font-semibold mb-2 text-blue-600">
            Management
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Assigned To</span>
              {selectedComplaint.staff_name ? (
                <p className="font-medium">{selectedComplaint.staff_name}</p>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-7 text-xs mt-1"
                  onClick={() => {
                    setShowViewDialog(false);
                    setSelectedComplaint(selectedComplaint);
                    setShowAssignDialog(true);
                  }}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Assign Staff
                </Button>
              )}
            </div>

            <div>
              <span className="text-gray-500">Status</span>
              <div className="flex items-center gap-1 mt-1">
                {getStatusIcon(selectedComplaint.status)}
                {getStatusBadge(selectedComplaint.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Resolution */}
        {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'closed' && (
          <div className="border rounded-md p-3">
            <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
              <CheckCircle className="h-3 w-3" />
              Resolution
            </h4>

            <div className="space-y-2">
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter resolution notes..."
                rows={2}
                className="text-xs min-h-[70px]"
              />

              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={handleResolve}
                  disabled={!resolutionNotes.trim()}
                  className="flex-1 h-8 text-xs bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolve
                </Button>

                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleUpdateStatus(selectedComplaint.id, 'closed');
                    setShowViewDialog(false);
                  }}
                  className="h-8 text-xs"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    )}
  </DialogContent>
</Dialog>

      {/* Assign Staff Dialog - Compact with Grid */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-2xl w-full p-0 gap-0">
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white">
                <UserPlus className="h-5 w-5" />
                Assign Staff
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowAssignDialog(false)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-50">
              Assign staff member to handle complaint #{selectedComplaint?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Complaint Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Complaint Information</h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Complaint ID</span>
                      <p className="font-medium text-sm">#{selectedComplaint.id}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Title</span>
                      <p className="text-sm">{selectedComplaint.title}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Tenant</span>
                      <p className="text-sm">{selectedComplaint.tenant_name}</p>
                    </div>
                  </div>
                </div>

                {/* Staff Selection */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Select Staff Member</h4>
                  <div className="space-y-3">
                    <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                      <SelectTrigger className="h-10">
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
                    
                    {/* Selected Staff Preview */}
                    {selectedStaffId && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-600 mb-1">Selected Staff:</p>
                        <p className="font-medium text-sm">
                          {staff.find(s => s.id.toString() === selectedStaffId)?.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignDialog(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignStaff}
                  disabled={!selectedStaffId}
                  className="px-6 bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  Assign Staff
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog - Compact with Grid */}
      {/* Update Status Dialog - Add Admin Notes */}
<Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
  <DialogContent className="max-w-2xl w-full p-0 gap-0">
    <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-t-lg">
      <div className="flex items-center justify-between">
        <DialogTitle className="flex items-center gap-2 text-white">
          <FileText className="h-5 w-5" />
          Update Status
        </DialogTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowStatusDialog(false)}
          className="h-8 w-8 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <DialogDescription className="text-blue-50">
        Update status for complaint #{selectedComplaint?.id}
      </DialogDescription>
    </DialogHeader>
    
    {selectedComplaint && (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Current Status</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedComplaint.status)}
                {getStatusBadge(selectedComplaint.status)}
              </div>
              <div className="mt-2 text-sm">
                <span className="text-xs text-gray-500">Last Updated:</span>
                <p className="font-medium">{new Date(selectedComplaint.updated_at || selectedComplaint.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* New Status Selection */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Select New Status</h4>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Choose new status" />
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
                    <Loader2 className="h-4 w-4" />
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

            {/* Status Preview */}
            {newStatus && (
              <div className="bg-blue-50 p-3 rounded-lg mt-2">
                <p className="text-xs text-blue-600 mb-1">New Status Preview:</p>
                <div className="flex items-center gap-2">
                  {newStatus === 'pending' && <Clock className="h-4 w-4" />}
                  {newStatus === 'in_progress' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {newStatus === 'resolved' && <CheckCircle className="h-4 w-4" />}
                  {newStatus === 'closed' && <XCircle className="h-4 w-4" />}
                  <span className="font-medium capitalize">{newStatus.replace('_', ' ')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Notes Section - NEW */}
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            Admin Notes
          </h4>
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add notes about this status update (optional but recommended)"
            rows={3}
            className="w-full text-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-500">
            These notes will be visible to the tenant and help them understand the status change.
          </p>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setShowStatusDialog(false);
              setAdminNotes("");
              setNewStatus("");
            }}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleUpdateStatus(selectedComplaint.id, newStatus)}
            disabled={!newStatus}
            className="px-6 bg-gradient-to-r from-blue-500 to-cyan-500"
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