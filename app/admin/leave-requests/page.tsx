// "use client";

// import { useState, useEffect } from 'react';
// import { toast } from 'sonner';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Search,
//   Filter,
//   Download,
//   Eye,
//   CheckCircle,
//   XCircle,
//   Clock,
//   AlertCircle,
//   Calendar,
//   User,
//   Home,
//   Phone,
//   Mail,
//   FileText,
//   ChevronLeft,
//   ChevronRight,
//   Check,
//   X,
//   Loader2,
//   RefreshCw // ADDED THIS IMPORT
// } from 'lucide-react';
// import { format } from 'date-fns';
// // import AdminHeader from '@/components/admin/admin-header';

// // Types
// interface LeaveRequest {
//   id: number;
//   tenant_id: number;
//   tenant_name: string;
//   tenant_email?: string;
//   tenant_phone?: string;
//   property_id: number;
//   property_name: string;
//   room_number?: number;
//   bed_number?: number;
//   request_type: 'leave';
//   title: string;
//   description: string;
//   priority: 'low' | 'medium' | 'high' | 'urgent';
//   status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed' | 'cancelled';
//   admin_notes: string | null;
//   assigned_to: number | null;
//   assigned_to_name?: string;
//   resolved_at: string | null;
//   created_at: string;
//   updated_at: string;
//   leave_data?: {
//     leave_type: string;
//     leave_start_date: string;
//     leave_end_date: string;
//     total_days: number;
//     contact_address_during_leave?: string;
//     emergency_contact_number?: string;
//     room_locked: boolean;
//     keys_submitted: boolean;
//     created_at: string;
//   };
// }

// interface UpdateLeaveStatusPayload {
//   status: 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
//   admin_notes?: string;
//   assigned_to?: number;
// }

// // API Base URL from environment variable
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// // API Functions
// const fetchLeaveRequests = async (filters = {}) => {
//   try {
//     const token = localStorage.getItem('auth_token');
    
//     // Build query string
//     const queryParams = new URLSearchParams();
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value) queryParams.append(key, String(value));
//     });

//     const response = await fetch(`${API_BASE_URL}/api/admin/leave-requests?${queryParams.toString()}`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching leave requests:', error);
//     throw error;
//   }
// };

// const updateLeaveStatus = async (requestId: number, payload: UpdateLeaveStatusPayload) => {
//   try {
//     const token = localStorage.getItem('auth_token');
    
//     const response = await fetch(`${API_BASE_URL}/api/admin/leave-requests/${requestId}/status`, {
//       method: 'PUT',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error updating leave status:', error);
//     throw error;
//   }
// };

// const fetchLeaveStatistics = async () => {
//   try {
//     const token = localStorage.getItem('auth_token');
    
//     const response = await fetch(`${API_BASE_URL}/api/admin/leave-requests/statistics`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching leave statistics:', error);
//     throw error;
//   }
// };

// export default function AdminLeaveRequestsPage() {
//   const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
//   const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [priorityFilter, setPriorityFilter] = useState<string>('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);
//   const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
//   const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
//   const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
//   const [updatingStatus, setUpdatingStatus] = useState(false);
//   const [statusUpdateData, setStatusUpdateData] = useState<UpdateLeaveStatusPayload>({
//     status: 'approved',
//     admin_notes: ''
//   });
//   const [statistics, setStatistics] = useState({
//     total: 0,
//     pending: 0,
//     approved: 0,
//     rejected: 0,
//     completed: 0,
//     in_progress: 0,
//     cancelled: 0
//   });

//   // Fetch leave requests
//   const loadLeaveRequests = async () => {
//     try {
//       setLoading(true);
      
//       const filters: any = {};
//       if (statusFilter !== 'all') filters.status = statusFilter;
//       if (priorityFilter !== 'all') filters.priority = priorityFilter;
//       if (searchQuery) filters.search = searchQuery;
//       filters.page = currentPage;
//       filters.limit = itemsPerPage;

//       const result = await fetchLeaveRequests(filters);
      
//       if (result.success) {
//         setLeaveRequests(result.data);
//         setFilteredRequests(result.data);
//         if (result.pagination) {
//           setTotalPages(result.pagination.pages);
//         }
//       } else {
//         toast.error(result.message || 'Failed to fetch leave requests');
//         // Fallback to mock data
//         setLeaveRequests(getMockLeaveRequests());
//         setFilteredRequests(getMockLeaveRequests());
//       }
//     } catch (error) {
//       console.error('Error fetching leave requests:', error);
//       toast.error('Failed to load leave requests');
//       // Fallback to mock data
//       setLeaveRequests(getMockLeaveRequests());
//       setFilteredRequests(getMockLeaveRequests());
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load statistics
//   const loadStatistics = async () => {
//     try {
//       const result = await fetchLeaveStatistics();
//       if (result.success) {
//         setStatistics(result.data);
//       }
//     } catch (error) {
//       console.error('Error loading statistics:', error);
//     }
//   };

//   // Update leave request status
//   const handleUpdateLeaveStatus = async (requestId: number) => {
//     try {
//       setUpdatingStatus(true);
      
//       const result = await updateLeaveStatus(requestId, statusUpdateData);
      
//       if (result.success) {
//         toast.success('Status updated successfully');
//         setIsStatusDialogOpen(false);
//         loadLeaveRequests(); // Refresh the list
//         loadStatistics(); // Refresh statistics
        
//         // Reset form
//         setStatusUpdateData({
//           status: 'approved',
//           admin_notes: ''
//         });
//       } else {
//         toast.error(result.message || 'Failed to update status');
//       }
//     } catch (error) {
//       console.error('Error updating leave status:', error);
//       toast.error('Failed to update status');
//     } finally {
//       setUpdatingStatus(false);
//     }
//   };

//   // Apply filters locally (for instant filtering)
//   useEffect(() => {
//     let filtered = [...leaveRequests];

//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       filtered = filtered.filter(request =>
//         request.tenant_name.toLowerCase().includes(query) ||
//         request.property_name.toLowerCase().includes(query) ||
//         request.title.toLowerCase().includes(query) ||
//         (request.leave_data?.leave_type?.toLowerCase() || '').includes(query)
//       );
//     }

//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(request => request.status === statusFilter);
//     }

//     if (priorityFilter !== 'all') {
//       filtered = filtered.filter(request => request.priority === priorityFilter);
//     }

//     setFilteredRequests(filtered);
//   }, [searchQuery, statusFilter, priorityFilter, leaveRequests]);

//   // Pagination handlers
//   const nextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const prevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   // View request details
//   const viewRequestDetails = (request: LeaveRequest) => {
//     setSelectedRequest(request);
//     setIsDetailDialogOpen(true);
//   };

//   // Open status update dialog
//   const openStatusUpdateDialog = (request: LeaveRequest) => {
//     setSelectedRequest(request);
//     setStatusUpdateData({
//       status: request.status === 'pending' ? 'approved' : request.status,
//       admin_notes: request.admin_notes || ''
//     });
//     setIsStatusDialogOpen(true);
//   };

//   // Get status badge
//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
//       pending: { variant: 'outline', icon: Clock },
//       in_progress: { variant: 'default', icon: AlertCircle },
//       approved: { variant: 'default', icon: CheckCircle },
//       rejected: { variant: 'destructive', icon: XCircle },
//       completed: { variant: 'default', icon: CheckCircle },
//       cancelled: { variant: 'secondary', icon: XCircle }
//     };

//     const config = variants[status] || variants.pending;
//     const Icon = config.icon;

//     return (
//       <Badge variant={config.variant} className="flex items-center gap-1">
//         <Icon className="h-3 w-3" />
//         {status.replace('_', ' ').toUpperCase()}
//       </Badge>
//     );
//   };

//   // Get priority badge
//   const getPriorityBadge = (priority: string) => {
//     const colors: Record<string, string> = {
//       low: 'bg-green-100 text-green-800 hover:bg-green-100',
//       medium: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
//       high: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
//       urgent: 'bg-red-100 text-red-800 hover:bg-red-100'
//     };

//     return (
//       <Badge className={`${colors[priority] || colors.medium}`}>
//         {priority.toUpperCase()}
//       </Badge>
//     );
//   };

//   // Initial load
//   useEffect(() => {
//     loadLeaveRequests();
//     loadStatistics();
//   }, [currentPage]);

//   // Refresh when filters change (debounced search)
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setCurrentPage(1);
//       loadLeaveRequests();
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [searchQuery, statusFilter, priorityFilter]);

//   if (loading && leaveRequests.length === 0) {
//     return (
//       <div className="flex flex-col min-h-screen">
//         {/* <AdminHeader /> */}
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
//             <p className="text-gray-600">Loading leave requests...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col min-h-screen">
//       {/* <AdminHeader /> */}
      
//       <div className="flex-1 p-6 bg-gray-50">
//         <div className="max-w-9xl mx-auto">
//           {/* Header */}
//           <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            
            
//             <div className="flex items-center gap-2 mt-4 md:mt-0">
          
//               <Button variant="outline">
//                 <Download className="h-4 w-4 mr-2" />
//                 Export
//               </Button>
//             </div>
//           </div>

//           {/* Statistics */}
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
//             <Card>
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-500">Total</p>
//                     <p className="text-2xl font-bold">{statistics.total}</p>
//                   </div>
//                   <div className="p-2 bg-blue-100 rounded-full">
//                     <FileText className="h-5 w-5 text-blue-600" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-500">Pending</p>
//                     <p className="text-2xl font-bold">{statistics.pending}</p>
//                   </div>
//                   <div className="p-2 bg-yellow-100 rounded-full">
//                     <Clock className="h-5 w-5 text-yellow-600" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-500">Approved</p>
//                     <p className="text-2xl font-bold">{statistics.approved}</p>
//                   </div>
//                   <div className="p-2 bg-green-100 rounded-full">
//                     <CheckCircle className="h-5 w-5 text-green-600" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-500">Rejected</p>
//                     <p className="text-2xl font-bold">{statistics.rejected}</p>
//                   </div>
//                   <div className="p-2 bg-red-100 rounded-full">
//                     <XCircle className="h-5 w-5 text-red-600" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-500">Completed</p>
//                     <p className="text-2xl font-bold">{statistics.completed}</p>
//                   </div>
//                   <div className="p-2 bg-purple-100 rounded-full">
//                     <Check className="h-5 w-5 text-purple-600" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

        
        

//           {/* Requests Table */}
//           <Card>
            
//             <CardContent>
//               {filteredRequests.length === 0 ? (
//                 <div className="text-center py-12">
//                   <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
//                   <p className="text-gray-600 mb-6">
//                     {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
//                       ? 'Try adjusting your filters'
//                       : 'No leave requests have been submitted yet'}
//                   </p>
//                   <Button 
//                     variant="outline"
//                     onClick={() => {
//                       setSearchQuery('');
//                       setStatusFilter('all');
//                       setPriorityFilter('all');
//                       setCurrentPage(1);
//                     }}
//                   >
//                     Clear Filters
//                   </Button>
//                 </div>
//               ) : (
//                 <>
//                   <div className="overflow-x-auto">
//                     <table className="w-full">
//                       <thead>
//                         <tr className="border-b">
//                           <th className="text-left py-3 px-4 font-medium">Tenant</th>
//                           <th className="text-left py-3 px-4 font-medium">Leave Details</th>
//                           <th className="text-left py-3 px-4 font-medium">Property</th>
//                           <th className="text-left py-3 px-4 font-medium">Priority</th>
//                           <th className="text-left py-3 px-4 font-medium">Status</th>
//                           <th className="text-left py-3 px-4 font-medium">Date</th>
//                           <th className="text-left py-3 px-4 font-medium">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {filteredRequests.map((request) => (
//                           <tr key={request.id} className="border-b hover:bg-gray-50">
//                             <td className="py-4 px-4">
//                               <div>
//                                 <p className="font-medium">{request.tenant_name}</p>
//                                 {request.tenant_phone && (
//                                   <p className="text-sm text-gray-500 flex items-center gap-1">
//                                     <Phone className="h-3 w-3" />
//                                     {request.tenant_phone}
//                                   </p>
//                                 )}
//                               </div>
//                             </td>
//                             <td className="py-4 px-4">
//                               <div>
//                                 <p className="font-medium">{request.title}</p>
//                                 <div className="flex items-center gap-2 text-sm text-gray-500">
//                                   <Calendar className="h-3 w-3" />
//                                   {request.leave_data ? (
//                                     <span>
//                                       {format(new Date(request.leave_data.leave_start_date), 'dd MMM')} - {format(new Date(request.leave_data.leave_end_date), 'dd MMM')}
//                                     </span>
//                                   ) : (
//                                     <span>No dates specified</span>
//                                   )}
//                                 </div>
//                                 {request.leave_data && (
//                                   <div className="text-xs text-gray-500 mt-1">
//                                     Type: {request.leave_data.leave_type} • {request.leave_data.total_days} days
//                                   </div>
//                                 )}
//                               </div>
//                             </td>
//                             <td className="py-4 px-4">
//                               <div className="flex items-center gap-2">
//                                 <Home className="h-4 w-4 text-gray-400" />
//                                 <span>{request.property_name}</span>
//                               </div>
//                               {(request.room_number || request.bed_number) && (
//                                 <div className="text-sm text-gray-500">
//                                   Room {request.room_number || 'N/A'}, Bed {request.bed_number || 'N/A'}
//                                 </div>
//                               )}
//                             </td>
//                             <td className="py-4 px-4">
//                               {getPriorityBadge(request.priority)}
//                             </td>
//                             <td className="py-4 px-4">
//                               {getStatusBadge(request.status)}
//                             </td>
//                             <td className="py-4 px-4">
//                               <div className="text-sm">
//                                 <p>{format(new Date(request.created_at), 'dd MMM yyyy')}</p>
//                                 <p className="text-gray-500">{format(new Date(request.created_at), 'hh:mm a')}</p>
//                               </div>
//                             </td>
//                             <td className="py-4 px-4">
//                               <div className="flex items-center gap-2">
//                                 <Button
//                                   size="sm"
//                                   variant="outline"
//                                   onClick={() => viewRequestDetails(request)}
//                                 >
//                                   <Eye className="h-4 w-4" />
//                                 </Button>
//                                 <Button
//                                   size="sm"
//                                   onClick={() => openStatusUpdateDialog(request)}
//                                 >
//                                   Update
//                                 </Button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>

//                   {/* Pagination */}
//                   {totalPages > 1 && (
//                     <div className="flex items-center justify-between mt-6">
//                       <div className="text-sm text-gray-500">
//                         Page {currentPage} of {totalPages}
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={prevPage}
//                           disabled={currentPage === 1}
//                         >
//                           <ChevronLeft className="h-4 w-4 mr-1" />
//                           Previous
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={nextPage}
//                           disabled={currentPage === totalPages}
//                         >
//                           Next
//                           <ChevronRight className="h-4 w-4 ml-1" />
//                         </Button>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Request Details Dialog */}
//       <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//           {selectedRequest && (
//             <>
//               <DialogHeader>
//                 <DialogTitle>Leave Request Details</DialogTitle>
//                 <DialogDescription>
//                   Request ID: {selectedRequest.id} • Submitted on {format(new Date(selectedRequest.created_at), 'dd MMM yyyy hh:mm a')}
//                 </DialogDescription>
//               </DialogHeader>

//               <div className="space-y-6">
//                 {/* Tenant Information */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">Tenant Information</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <div>
//                         <Label className="text-sm text-gray-500">Tenant Name</Label>
//                         <p className="font-medium">{selectedRequest.tenant_name}</p>
//                       </div>
//                       {selectedRequest.tenant_email && (
//                         <div>
//                           <Label className="text-sm text-gray-500">Email</Label>
//                           <p className="font-medium flex items-center gap-1">
//                             <Mail className="h-4 w-4" />
//                             {selectedRequest.tenant_email}
//                           </p>
//                         </div>
//                       )}
//                       {selectedRequest.tenant_phone && (
//                         <div>
//                           <Label className="text-sm text-gray-500">Phone</Label>
//                           <p className="font-medium flex items-center gap-1">
//                             <Phone className="h-4 w-4" />
//                             {selectedRequest.tenant_phone}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Leave Details */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">Leave Details</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     {selectedRequest.leave_data ? (
//                       <div className="space-y-4">
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                           <div>
//                             <Label className="text-sm text-gray-500">Leave Type</Label>
//                             <p className="font-medium">{selectedRequest.leave_data.leave_type}</p>
//                           </div>
//                           <div>
//                             <Label className="text-sm text-gray-500">Total Days</Label>
//                             <p className="font-medium">{selectedRequest.leave_data.total_days} days</p>
//                           </div>
//                           <div>
//                             <Label className="text-sm text-gray-500">Property</Label>
//                             <p className="font-medium">{selectedRequest.property_name}</p>
//                           </div>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <div>
//                             <Label className="text-sm text-gray-500">Leave Start Date</Label>
//                             <p className="font-medium">
//                               {format(new Date(selectedRequest.leave_data.leave_start_date), 'dd MMM yyyy')}
//                             </p>
//                           </div>
//                           <div>
//                             <Label className="text-sm text-gray-500">Leave End Date</Label>
//                             <p className="font-medium">
//                               {format(new Date(selectedRequest.leave_data.leave_end_date), 'dd MMM yyyy')}
//                             </p>
//                           </div>
//                         </div>

//                         {selectedRequest.leave_data.contact_address_during_leave && (
//                           <div>
//                             <Label className="text-sm text-gray-500">Contact Address During Leave</Label>
//                             <p className="font-medium">{selectedRequest.leave_data.contact_address_during_leave}</p>
//                           </div>
//                         )}

//                         {selectedRequest.leave_data.emergency_contact_number && (
//                           <div>
//                             <Label className="text-sm text-gray-500">Emergency Contact</Label>
//                             <p className="font-medium">{selectedRequest.leave_data.emergency_contact_number}</p>
//                           </div>
//                         )}

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <div className="flex items-center space-x-2">
//                             <div className={`p-1 rounded ${selectedRequest.leave_data.room_locked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
//                               {selectedRequest.leave_data.room_locked ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
//                             </div>
//                             <span>Room Locked: {selectedRequest.leave_data.room_locked ? 'Yes' : 'No'}</span>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <div className={`p-1 rounded ${selectedRequest.leave_data.keys_submitted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
//                               {selectedRequest.leave_data.keys_submitted ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
//                             </div>
//                             <span>Keys Submitted: {selectedRequest.leave_data.keys_submitted ? 'Yes' : 'No'}</span>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       <p className="text-gray-500">No leave details available</p>
//                     )}
//                   </CardContent>
//                 </Card>

//                 {/* Request Information */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">Request Information</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       <div>
//                         <Label className="text-sm text-gray-500">Title</Label>
//                         <p className="font-medium">{selectedRequest.title}</p>
//                       </div>
                      
//                       <div>
//                         <Label className="text-sm text-gray-500">Description</Label>
//                         <p className="font-medium">{selectedRequest.description}</p>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div>
//                           <Label className="text-sm text-gray-500">Priority</Label>
//                           <div className="mt-1">
//                             {getPriorityBadge(selectedRequest.priority)}
//                           </div>
//                         </div>
//                         <div>
//                           <Label className="text-sm text-gray-500">Status</Label>
//                           <div className="mt-1">
//                             {getStatusBadge(selectedRequest.status)}
//                           </div>
//                         </div>
//                         <div>
//                           <Label className="text-sm text-gray-500">Created At</Label>
//                           <p className="font-medium">
//                             {format(new Date(selectedRequest.created_at), 'dd MMM yyyy hh:mm a')}
//                           </p>
//                         </div>
//                       </div>

//                       {selectedRequest.admin_notes && (
//                         <div>
//                           <Label className="text-sm text-gray-500">Admin Notes</Label>
//                           <p className="font-medium p-3 bg-gray-50 rounded mt-1">
//                             {selectedRequest.admin_notes}
//                           </p>
//                         </div>
//                       )}

//                       {selectedRequest.resolved_at && (
//                         <div>
//                           <Label className="text-sm text-gray-500">Resolved At</Label>
//                           <p className="font-medium">
//                             {format(new Date(selectedRequest.resolved_at), 'dd MMM yyyy hh:mm a')}
//                           </p>
//                         </div>
//                       )}

//                       {selectedRequest.assigned_to_name && (
//                         <div>
//                           <Label className="text-sm text-gray-500">Assigned To</Label>
//                           <p className="font-medium">{selectedRequest.assigned_to_name}</p>
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>

//               <DialogFooter>
//                 <Button
//                   variant="outline"
//                   onClick={() => setIsDetailDialogOpen(false)}
//                 >
//                   Close
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     setIsDetailDialogOpen(false);
//                     openStatusUpdateDialog(selectedRequest);
//                   }}
//                 >
//                   Update Status
//                 </Button>
//               </DialogFooter>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Update Status Dialog */}
//       <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
//         <DialogContent>
//           {selectedRequest && (
//             <>
//               <DialogHeader>
//                 <DialogTitle>Update Leave Request Status</DialogTitle>
//                 <DialogDescription>
//                   Update status for request by {selectedRequest.tenant_name}
//                 </DialogDescription>
//               </DialogHeader>

//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="status">New Status</Label>
//                   <Select
//                     value={statusUpdateData.status}
//                     onValueChange={(value: any) => setStatusUpdateData(prev => ({ ...prev, status: value }))}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="approved">Approved</SelectItem>
//                       <SelectItem value="rejected">Rejected</SelectItem>
//                       <SelectItem value="in_progress">In Progress</SelectItem>
//                       <SelectItem value="completed">Completed</SelectItem>
//                       <SelectItem value="cancelled">Cancelled</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
//                   <Textarea
//                     id="admin_notes"
//                     value={statusUpdateData.admin_notes}
//                     onChange={(e) => setStatusUpdateData(prev => ({ ...prev, admin_notes: e.target.value }))}
//                     placeholder="Add notes about this status update..."
//                     rows={4}
//                   />
//                 </div>

//                 {/* <div className="bg-blue-50 p-4 rounded-lg">
//                   <p className="text-sm text-blue-800">
//                     <strong>Note:</strong> Updating the status will send a notification to the tenant.
//                   </p>
//                 </div> */}
//               </div>

//               <DialogFooter>
//                 <Button
//                   variant="outline"
//                   onClick={() => setIsStatusDialogOpen(false)}
//                   disabled={updatingStatus}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={() => handleUpdateLeaveStatus(selectedRequest.id)}
//                   disabled={updatingStatus}
//                 >
//                   {updatingStatus ? (
//                     <>
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                       Updating...
//                     </>
//                   ) : (
//                     'Update Status'
//                   )}
//                 </Button>
//               </DialogFooter>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// // Mock data for testing
// function getMockLeaveRequests(): LeaveRequest[] {
//   return [
//     {
//       id: 1,
//       tenant_id: 101,
//       tenant_name: 'Amit Sharma',
//       tenant_email: 'amit.sharma@example.com',
//       tenant_phone: '9876543210',
//       property_id: 1,
//       property_name: 'Sunrise PG',
//       room_number: 101,
//       bed_number: 2,
//       request_type: 'leave',
//       title: 'Medical Leave Request',
//       description: 'Need 7 days for knee surgery recovery',
//       priority: 'high',
//       status: 'pending',
//       admin_notes: null,
//       assigned_to: null,
//       resolved_at: null,
//       created_at: '2024-03-20T10:30:00.000Z',
//       updated_at: '2024-03-20T10:30:00.000Z',
//       leave_data: {
//         leave_type: 'Medical Leave',
//         leave_start_date: '2024-04-01',
//         leave_end_date: '2024-04-07',
//         total_days: 7,
//         contact_address_during_leave: 'City Hospital, Room 302',
//         emergency_contact_number: '9123456789',
//         room_locked: false,
//         keys_submitted: true,
//         created_at: '2024-03-20T10:30:00.000Z'
//       }
//     }
//   ];
// }


"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  RefreshCw,
  ArrowUpDown,
  MoreVertical,
  UserPlus,
  Building,
  Wrench,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API Functions
const fetchLeaveRequests = async (filters = {}) => {
  try {
    const token = localStorage.getItem('auth_token');
    
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
    const token = localStorage.getItem('auth_token');
    
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
    const token = localStorage.getItem('auth_token');
    
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
  const [refreshing, setRefreshing] = useState(false);
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
  const [sortField, setSortField] = useState<keyof LeaveRequest>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedActionRequest, setSelectedActionRequest] = useState<LeaveRequest | null>(null);

  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    id: '',
    tenant: '',
    title: '',
    property: '',
    priority: 'all',
    status: 'all',
    date: ''
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
        setLeaveRequests(getMockLeaveRequests());
        setFilteredRequests(getMockLeaveRequests());
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast.error('Failed to load leave requests');
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

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadLeaveRequests();
      await loadStatistics();
      toast.success("Data refreshed");
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
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
        loadLeaveRequests();
        loadStatistics();
        
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

  // Apply filters locally
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

  // Filter with column filters
  const filteredWithColumns = filteredRequests.filter(request => {
    const matchesId = request.id.toString().includes(searchFilters.id);
    const matchesTenant = (request.tenant_name || '').toLowerCase().includes(searchFilters.tenant.toLowerCase());
    const matchesTitle = (request.title || '').toLowerCase().includes(searchFilters.title.toLowerCase());
    const matchesProperty = (request.property_name || '').toLowerCase().includes(searchFilters.property.toLowerCase());
    const matchesPriority = searchFilters.priority === 'all' || request.priority === searchFilters.priority;
    const matchesStatus = searchFilters.status === 'all' || request.status === searchFilters.status;
    const matchesDate = !searchFilters.date || 
                       new Date(request.created_at).toISOString().split('T')[0] === searchFilters.date;
    
    return matchesId && matchesTenant && matchesTitle && matchesProperty && 
           matchesPriority && matchesStatus && matchesDate;
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

  // Pagination
  const paginatedRequests = sortedRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(sortedRequests.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handlers
  const handleSort = (field: keyof LeaveRequest) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSearchChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const viewRequestDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  const openStatusUpdateDialog = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setSelectedActionRequest(request);
    setStatusUpdateData({
      status: request.status === 'pending' ? 'approved' : request.status,
      admin_notes: request.admin_notes || ''
    });
    setIsStatusDialogOpen(true);
  };

  // Status badge
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
      <Badge variant={config.variant} className="flex items-center gap-1 text-xs px-2 py-0.5">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  // Priority badge
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
      case 'in_progress': return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  // Initial load
  useEffect(() => {
    loadLeaveRequests();
    loadStatistics();
  }, []);

  // Refresh when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadLeaveRequests();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, priorityFilter]);

  if (loading && leaveRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading leave requests...</p>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 min-h-screen">
      
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-2 px-0 sticky top-24 z-10">
        {/* Total Requests */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Total Requests
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {statistics.total || leaveRequests.length}
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
                  {statistics.pending}
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
                  {statistics.approved}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-green-600">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
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
                  {statistics.in_progress}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-blue-600">
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-end justify-end mb-3 px-0 sticky top-52 z-10 ">
       
        <div className="flex items-center gap-2 ">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing} className="h-9">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-lg border-0 overflow-hidden mb-6 sticky top-64 z-10">
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 m-4 rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No leave requests have been submitted yet'}
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
                      <TableHead className="w-[80px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('id')}>
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
                          <span className="font-semibold text-gray-700 text-xs">Tenant</span>
                          <Input 
                            placeholder="Search tenant..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.tenant}
                            onChange={(e) => handleSearchChange('tenant', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Leave Details Column */}
                      <TableHead className="w-[200px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <span className="font-semibold text-gray-700 text-xs">Leave Details</span>
                          <Input 
                            placeholder="Search title..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.title}
                            onChange={(e) => handleSearchChange('title', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Property Column */}
                      <TableHead className="w-[150px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <span className="font-semibold text-gray-700 text-xs">Property</span>
                          <Input 
                            placeholder="Search..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.property}
                            onChange={(e) => handleSearchChange('property', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Priority Column */}
                      <TableHead className="w-[110px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
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
                      
                      {/* Status Column */}
                      <TableHead className="w-[130px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('status')}>
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
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      
                      {/* Date Column */}
                      <TableHead className="w-[140px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('created_at')}>
                            <span className="font-semibold text-gray-700 text-xs">Date</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="Date..." 
                            type="date"
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.date}
                            onChange={(e) => handleSearchChange('date', e.target.value)}
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
                    {paginatedRequests.map((request, index) => (
                      <TableRow 
                        key={request.id} 
                        className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <TableCell className="font-mono text-xs font-medium text-blue-600 truncate">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            #{request.id}
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
                              {request.tenant_phone || "No phone"}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          <div className="space-y-1">
                            <div className="font-medium text-xs truncate">
                              {request.title}
                            </div>
                            {request.leave_data && (
                              <div className="flex items-center gap-1 flex-wrap">
                                <Badge variant="outline" className="text-[10px] px-1 py-0">
                                  {request.leave_data.leave_type}
                                </Badge>
                                <span className="text-[10px] text-gray-500">
                                  {request.leave_data.total_days} days
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs truncate">
                              {request.property_name}
                            </span>
                          </div>
                          {request.room_number && (
                            <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                              Room: {request.room_number}, Bed: {request.bed_number || 'N/A'}
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {getPriorityBadge(request.priority)}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getStatusBadge(request.status)}
                          </div>
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
      onClick={() => viewRequestDetails(request)}
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
              {Math.ceil(sortedRequests.length / itemsPerPage) > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
                  <div className="text-xs text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedRequests.length)} of {sortedRequests.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="h-8 text-xs"
                    >
                      <ChevronLeft className="h-3 w-3 mr-1" />
                      Previous
                    </Button>
                    <span className="text-xs text-gray-600">
                      Page {currentPage} of {Math.ceil(sortedRequests.length / itemsPerPage)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={currentPage === Math.ceil(sortedRequests.length / itemsPerPage)}
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
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <FileText className="h-4 w-4" />
                Leave Request Details - #{selectedRequest?.id}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsDetailDialogOpen(false)}
                className="h-7 w-7 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-50 text-xs">
              Submitted on {selectedRequest && format(new Date(selectedRequest.created_at), 'dd MMM yyyy hh:mm a')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="p-4 sm:p-5 space-y-3 max-h-[80vh] overflow-y-auto">
              
              {/* Status & Priority */}
              <div className="flex flex-wrap gap-2 bg-gray-50 px-3 py-2 rounded-md text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Status:</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Priority:</span>
                  {getPriorityBadge(selectedRequest.priority)}
                </div>
              </div>

              {/* Tenant Information */}
              <div className="border rounded-md p-3">
                <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
                  <User className="h-3 w-3" />
                  Tenant Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Name</span>
                    <p className="font-medium truncate">{selectedRequest.tenant_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email</span>
                    <p className="truncate flex items-center gap-1">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {selectedRequest.tenant_email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone</span>
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {selectedRequest.tenant_phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Property</span>
                    <p className="truncate flex items-center gap-1">
                      <Building className="h-3 w-3 text-gray-400" />
                      {selectedRequest.property_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="border rounded-md p-3">
                <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
                  <Calendar className="h-3 w-3" />
                  Leave Details
                </h4>
                {selectedRequest.leave_data ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Leave Type</span>
                        <p className="font-medium">{selectedRequest.leave_data.leave_type}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Days</span>
                        <p className="font-medium">{selectedRequest.leave_data.total_days} days</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Room/Bed</span>
                        <p className="font-medium">Room {selectedRequest.room_number || 'N/A'}, Bed {selectedRequest.bed_number || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Start Date</span>
                        <p className="font-medium">
                          {format(new Date(selectedRequest.leave_data.leave_start_date), 'dd MMM yyyy')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">End Date</span>
                        <p className="font-medium">
                          {format(new Date(selectedRequest.leave_data.leave_end_date), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>

                    {selectedRequest.leave_data.contact_address_during_leave && (
                      <div>
                        <span className="text-gray-500">Contact Address</span>
                        <p className="text-xs mt-1 bg-gray-50 p-2 rounded">
                          {selectedRequest.leave_data.contact_address_during_leave}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2 text-xs">
                        <div className={`p-1 rounded ${selectedRequest.leave_data.room_locked ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {selectedRequest.leave_data.room_locked ? 
                            <Check className="h-3 w-3 text-green-600" /> : 
                            <X className="h-3 w-3 text-gray-500" />
                          }
                        </div>
                        <span>Room Locked: {selectedRequest.leave_data.room_locked ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className={`p-1 rounded ${selectedRequest.leave_data.keys_submitted ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {selectedRequest.leave_data.keys_submitted ? 
                            <Check className="h-3 w-3 text-green-600" /> : 
                            <X className="h-3 w-3 text-gray-500" />
                          }
                        </div>
                        <span>Keys Submitted: {selectedRequest.leave_data.keys_submitted ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No leave details available</p>
                )}
              </div>

              {/* Request Information */}
              <div className="border rounded-md p-3">
                <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
                  <FileText className="h-3 w-3" />
                  Request Details
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-500">Title</span>
                    <p className="font-medium">{selectedRequest.title}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Description</span>
                    <div className="bg-gray-50 p-2 rounded mt-1 max-h-24 overflow-y-auto">
                      {selectedRequest.description}
                    </div>
                  </div>
                  {selectedRequest.admin_notes && (
                    <div>
                      <span className="text-gray-500">Admin Notes</span>
                      <div className="bg-blue-50 p-2 rounded mt-1">
                        {selectedRequest.admin_notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="px-4 py-3 border-t bg-gray-50">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)} size="sm" className="h-8 text-xs">
              Close
            </Button>
            <Button
              onClick={() => {
                setIsDetailDialogOpen(false);
                openStatusUpdateDialog(selectedRequest!);
              }}
              size="sm"
              className="h-8 text-xs bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              <Settings className="h-3 w-3 mr-1" />
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <Settings className="h-4 w-4" />
                Update Status
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsStatusDialogOpen(false)}
                className="h-7 w-7 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-50 text-xs">
              Update status for request by {selectedRequest?.tenant_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Status */}
                <div className="space-y-2">
                  <h4 className="font-medium text-xs text-gray-700">Current Status</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedRequest.status)}
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                </div>

                {/* New Status */}
                <div className="space-y-2">
                  <h4 className="font-medium text-xs text-gray-700">Select New Status</h4>
                  <Select
                    value={statusUpdateData.status}
                    onValueChange={(value: any) => setStatusUpdateData(prev => ({ ...prev, status: value }))}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
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
                      <SelectItem value="in_progress">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5" />
                          <span className="text-xs">In Progress</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span className="text-xs">Completed</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3.5 w-3.5" />
                          <span className="text-xs">Cancelled</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin Notes */}
                <div className="md:col-span-2">
                  <Label htmlFor="admin_notes" className="text-xs">Admin Notes (Optional)</Label>
                  <Textarea
                    id="admin_notes"
                    value={statusUpdateData.admin_notes}
                    onChange={(e) => setStatusUpdateData(prev => ({ ...prev, admin_notes: e.target.value }))}
                    placeholder="Add notes about this status update..."
                    rows={3}
                    className="text-xs mt-1"
                  />
                </div>
              </div>

              <DialogFooter className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsStatusDialogOpen(false)}
                  disabled={updatingStatus}
                  className="h-8 text-xs px-4"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateLeaveStatus(selectedRequest.id)}
                  disabled={updatingStatus}
                  className="h-8 text-xs px-4 bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  {updatingStatus ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Settings className="h-3 w-3 mr-1" />
                  )}
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
    },
    {
      id: 2,
      tenant_id: 102,
      tenant_name: 'Priya Patel',
      tenant_email: 'priya.patel@example.com',
      tenant_phone: '9876543211',
      property_id: 2,
      property_name: 'Green Valley Hostel',
      room_number: 205,
      bed_number: 1,
      request_type: 'leave',
      title: 'Family Function Leave',
      description: 'Need 3 days for sister wedding',
      priority: 'medium',
      status: 'approved',
      admin_notes: 'Approved. Please submit keys before leaving.',
      assigned_to: 5,
      assigned_to_name: 'Rajesh Kumar',
      resolved_at: null,
      created_at: '2024-03-19T14:20:00.000Z',
      updated_at: '2024-03-20T09:15:00.000Z',
      leave_data: {
        leave_type: 'Personal Leave',
        leave_start_date: '2024-04-05',
        leave_end_date: '2024-04-07',
        total_days: 3,
        contact_address_during_leave: 'Mumbai, Maharashtra',
        emergency_contact_number: '9988776655',
        room_locked: true,
        keys_submitted: false,
        created_at: '2024-03-19T14:20:00.000Z'
      }
    },
    {
      id: 3,
      tenant_id: 103,
      tenant_name: 'Rahul Verma',
      tenant_email: 'rahul.verma@example.com',
      tenant_phone: '9876543212',
      property_id: 1,
      property_name: 'Sunrise PG',
      room_number: 102,
      bed_number: 3,
      request_type: 'leave',
      title: 'Emergency Leave',
      description: 'Family emergency, need to go home immediately',
      priority: 'urgent',
      status: 'in_progress',
      admin_notes: 'Processing urgently',
      assigned_to: 3,
      assigned_to_name: 'Admin Staff',
      resolved_at: null,
      created_at: '2024-03-21T08:45:00.000Z',
      updated_at: '2024-03-21T09:30:00.000Z',
      leave_data: {
        leave_type: 'Emergency Leave',
        leave_start_date: '2024-03-22',
        leave_end_date: '2024-03-28',
        total_days: 7,
        contact_address_during_leave: 'Delhi',
        emergency_contact_number: '9876543212',
        room_locked: false,
        keys_submitted: false,
        created_at: '2024-03-21T08:45:00.000Z'
      }
    }
  ];
}