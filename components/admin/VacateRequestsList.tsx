// "use client";

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from '@/components/ui/tabs';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { toast } from 'sonner';
// import { format } from 'date-fns';
// import {
//   AlertCircle,
//   CheckCircle,
//   XCircle,
//   Clock,
//   Eye,
//   Filter,
//   Search,
//   Loader2,
//   IndianRupee,
//   Calendar,
//   User,
//   Home,
//   Bed,
//   Star,
//   Phone,
//   Mail,
//   FileText,
//   Download,
//   MoreVertical,
//   Building2,
//   DollarSign,
//   MessageSquare,
//   RefreshCw,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react';
// import { 
//   getAdminVacateRequests, 
//   updateVacateRequestStatus, 
//   sendTenantNotification,
//   getPropertiesList,
//   getMasterValues,
//   type AdminVacateRequest,
//   type StatusUpdatePayload
// } from '@/lib/tenantRequestsApi';
// import { listProperties, Property } from '@/lib/propertyApi';
// import router from 'next/router';

// interface VacateRequest {
//   vacate_request_id: number;
//   tenant_id: number;
//   tenant_name: string;
//   tenant_email: string;
//   tenant_phone: string;
//   property_id: number;
//   property_name: string;
//   room_id: number;
//   room_number: number;
//   bed_id: number;
//   bed_number: number;
//   primary_reason_id: number;
//   primary_reason: string;
//   secondary_reasons: string[];
//   overall_rating: number | null;
//   food_rating: number | null;
//   cleanliness_rating: number | null;
//   management_rating: number | null;
//   improvement_suggestions: string | null;
//   expected_vacate_date: string | null;
//   lockin_penalty_accepted: boolean;
//   notice_penalty_accepted: boolean;
//   vacate_status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
//   vacate_request_date: string;
//   vacate_updated_date: string;
//   vacate_admin_notes: string | null;
//   processed_by: number | null;
//   processed_at: string | null;
//   refund_amount: number | null;
//   penalty_deduction: number | null;
//   tenant_request_id: number | null;
//   title: string | null;
//   description: string | null;
//   priority: string | null;
//   request_status: string | null;
//   request_created: string | null;
//   lockin_period_months: number | null;
//   lockin_penalty_amount: number | null;
//   lockin_penalty_type: string | null;
//   notice_period_days: number | null;
//   notice_penalty_amount: number | null;
//   notice_penalty_type: string | null;
//   check_in_date: string | null;
//   monthly_rent: number | null;
//   security_deposit: number | null;
// }

// interface ApiResponse {
//   success: boolean;
//   data: VacateRequest[];
//   total: number;
// }


// interface VacateReason {
//   id: number;
//   value: string;
//   description?: string;
// }

// interface StatusUpdateData {
//   status: 'under_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';
//   admin_notes?: string;
//   actual_vacate_date?: string;
//   refund_amount?: number;
//   penalty_waived?: boolean;
// }

// export default function VacateRequestsList() {
//   const [requests, setRequests] = useState<VacateRequest[]>([]);
//   const [filteredRequests, setFilteredRequests] = useState<VacateRequest[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [selectedRequest, setSelectedRequest] = useState<VacateRequest | null>(null);
//   const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
//   const [isStatusDialogOpen, setIsStatusDialogOpen] = useState<boolean>(false);
//   const [filterStatus, setFilterStatus] = useState<string>('all');
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [priorityFilter, setPriorityFilter] = useState<string>('all');
//   const [propertyFilter, setPropertyFilter] = useState<string>('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [submitting, setSubmitting] = useState(false);
//   const [properties, setProperties] = useState<Property[]>([]);
//   const [activeTab, setActiveTab] = useState('all');
//   const [vacateReasons, setVacateReasons] = useState<VacateReason[]>([]);
//   const [statusUpdateData, setStatusUpdateData] = useState<StatusUpdateData>({
//     status: 'under_review',
//     admin_notes: ''
//   });

// // Fetch data using API functions
//   const fetchVacateRequests = useCallback(async () => {
//     try {
//       setLoading(true);
//       const data = await getAdminVacateRequests();
//       const vacateRequests = data as unknown as VacateRequest[];
//       setRequests(vacateRequests);
//       setFilteredRequests(vacateRequests);
//     } catch (error: any) {
//       console.error('Error fetching vacate requests:', error);
      
//       // Check if it's an authentication error
//       if (error.message?.includes('Authentication required') || 
//           error.message?.includes('401') ||
//           error.message?.includes('No token')) {
//         toast.error('Please login to continue');
//         router.push('/login');
//         return;
//       }
      
//       toast.error(error.message || 'Failed to load vacate requests');
//       setRequests([]);
//       setFilteredRequests([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [router]);


// const fetchPropertiesData = async () => {
//     try {
//       const response = await listProperties();
//       setProperties(Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []));
//     } catch (error) {
//       console.error('Error fetching properties:', error);
//       setProperties([]);
//     }
//   };

// useEffect(() => {
//     const initData = async () => {
//       try {
//         await Promise.all([
//           fetchVacateRequests(),
//           fetchPropertiesData(),
//           fetchVacateReasonsData()
//         ]);
//       } catch (error) {
//         console.error('Error initializing data:', error);
//       }
//     };
//     initData();
//   }, [fetchVacateRequests]);

//    const fetchVacateReasonsData = async () => {
//     try {
//       const data = await getMasterValues('VACATE_REASON');
//       setVacateReasons(data);
//     } catch (error) {
//       console.error('Error fetching vacate reasons:', error);
//       setVacateReasons([]);
//     }
//   };

//  // Filter requests
//   useEffect(() => {
//     let filtered = [...requests];

//     // Apply search filter
//     if (searchTerm) {
//       const query = searchTerm.toLowerCase();
//       filtered = filtered.filter(request =>
//         request.tenant_name?.toLowerCase().includes(query) ||
//         request.property_name?.toLowerCase().includes(query) ||
//         request.primary_reason?.toLowerCase().includes(query) ||
//         request.tenant_email?.toLowerCase().includes(query) ||
//         request.tenant_phone?.includes(query)
//       );
//     }

//     // Apply status filter
//     if (filterStatus !== 'all') {
//       filtered = filtered.filter(request => request.vacate_status === filterStatus);
//     }

//     // Apply priority filter
//     if (priorityFilter !== 'all' && priorityFilter !== 'all-priority') {
//       filtered = filtered.filter(request => request.priority === priorityFilter);
//     }

//     // Apply property filter
//     if (propertyFilter !== 'all') {
//       filtered = filtered.filter(request => request.property_id.toString() === propertyFilter);
//     }

//     setFilteredRequests(filtered);
//     setCurrentPage(1);
//   }, [requests, searchTerm, filterStatus, priorityFilter, propertyFilter]);


// const handleStatusUpdate = async () => {
//   if (!selectedRequest) return;

//   try {
//     setSubmitting(true);
    
//     const payload: StatusUpdatePayload = {
//       status: statusUpdateData.status,
//       admin_notes: statusUpdateData.admin_notes,
//       actual_vacate_date: statusUpdateData.actual_vacate_date,
//       refund_amount: statusUpdateData.refund_amount,
//       penalty_waived: statusUpdateData.penalty_waived,
//     };

    
//     // Get token from all possible locations
//     const adminToken = localStorage.getItem('auth_token');
//     const genericToken = localStorage.getItem('token');
//     const token = adminToken || genericToken;
    
    
//     if (!token) {
//       toast.error('No authentication token found. Please login again.');
//       localStorage.clear();
//       router.push('/login');
//       return;
//     }

//     // Create headers for debugging
//     const headers = {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     };
   
    
//     const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/vacate-requests/${selectedRequest.vacate_request_id}/status`, {
//       method: 'PUT',
//       headers: headers,
//       body: JSON.stringify(payload),
//     });

  
//     // Try to read response text
//     const responseText = await response.text();
    
//     if (!response.ok) {
//       let errorMessage = `HTTP ${response.status}`;
//       try {
//         const errorData = JSON.parse(responseText);
//         errorMessage = errorData.error || errorData.message || errorMessage;
//       } catch {
//         errorMessage = responseText || errorMessage;
//       }
      
//       throw new Error(errorMessage);
//     }

//     const result = JSON.parse(responseText);
    
//     if (!result.success) {
//       throw new Error(result.message || 'Failed to update status');
//     }
    
//     toast.success('Status updated successfully');
//     setIsStatusDialogOpen(false);
//     setIsPreviewOpen(false);
    
//     // Refresh the list
//     await fetchVacateRequests();
    
//     // Send notification to tenant
//     await sendNotificationToTenant(selectedRequest.tenant_id, statusUpdateData.status);
    
//   } catch (error: any) {
//     console.error('❌ Error updating status:', error);
    
//     // Check for specific error types
//     if (error.message?.includes('No token') || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
//       toast.error('Your session has expired. Please login again.');
//       localStorage.clear();
//       window.location.href = '/login';
//     } else {
//       toast.error(error.message || 'Failed to update status');
//     }
//   } finally {
//     setSubmitting(false);
//   }
// };

//   const getStatusBadge = (status: VacateRequest['vacate_status']) => {
//     const config = {
//       pending: { variant: 'outline' as const, icon: Clock, label: 'Pending' },
//       under_review: { variant: 'default' as const, icon: AlertCircle, label: 'Under Review' },
//       approved: { variant: 'default' as const, icon: CheckCircle, label: 'Approved' },
//       rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejected' },
//       completed: { variant: 'default' as const, icon: CheckCircle, label: 'Completed' },
//     };

//     const cfg = config[status] || config.pending;
//     const Icon = cfg.icon;

//     return (
//       <Badge variant={cfg.variant} className="flex items-center gap-1">
//         <Icon className="h-3 w-3" />
//         {cfg.label}
//       </Badge>
//     );
//   };

//   const getPriorityBadge = (priority: string | null) => {
//     if (!priority) return null;
    
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

//   const formatCurrency = (amount: number | null) => {
//     if (amount === null) return 'N/A';
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   const calculatePenalties = (request: VacateRequest) => {
//     if (!request.check_in_date || !request.expected_vacate_date || !request.monthly_rent) {
//       return null;
//     }

//     const expectedDate = new Date(request.expected_vacate_date);
//     const checkInDate = new Date(request.check_in_date);
    
//     let lockinPenalty = 0;
//     let noticePenalty = 0;

//     // Calculate lock-in penalty
//     if (request.lockin_period_months) {
//       const lockinEndDate = new Date(checkInDate);
//       lockinEndDate.setMonth(lockinEndDate.getMonth() + request.lockin_period_months);
      
//       if (expectedDate < lockinEndDate) {
//         lockinPenalty = request.lockin_penalty_amount || request.monthly_rent * 2;
//       }
//     }

//     // Calculate notice period penalty
//     if (request.notice_period_days) {
//       const today = new Date();
//       const daysDifference = Math.ceil((expectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
//       if (daysDifference < request.notice_period_days) {
//         const daysShort = request.notice_period_days - daysDifference;
//         noticePenalty = request.notice_penalty_amount || (request.monthly_rent / 30) * daysShort;
//       }
//     }

//     return {
//       lockin_penalty: lockinPenalty,
//       notice_penalty: noticePenalty,
//       total_penalty: lockinPenalty + noticePenalty
//     };
//   };

//   // Pagination
//   const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentItems = filteredRequests.slice(startIndex, endIndex);

//   // Export to CSV
//   const exportToCSV = () => {
//     const headers = ['ID', 'Tenant Name', 'Property', 'Room', 'Bed', 'Expected Vacate Date', 'Status', 'Priority', 'Created Date'];
//     const csvData = filteredRequests.map(request => [
//       request.vacate_request_id,
//       request.tenant_name,
//       request.property_name,
//       request.room_number,
//       request.bed_number,
//       request.expected_vacate_date ? format(new Date(request.expected_vacate_date), 'dd/MM/yyyy') : 'N/A',
//       request.vacate_status,
//       request.priority || 'N/A',
//       format(new Date(request.vacate_request_date), 'dd/MM/yyyy')
//     ]);

//     const csvContent = [
//       headers.join(','),
//       ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `vacate-requests-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   const openPreview = (request: VacateRequest) => {
//     setSelectedRequest(request);
//     setIsPreviewOpen(true);
//   };

//   const openStatusUpdate = (request: VacateRequest) => {
//     setSelectedRequest(request);
//     setStatusUpdateData({
//       status: request.vacate_status === 'pending' ? 'under_review' : request.vacate_status,
//       admin_notes: request.vacate_admin_notes || '',
//       refund_amount: request.refund_amount || undefined,
//       penalty_waived: false
//     });
//     setIsStatusDialogOpen(true);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading vacate requests...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">

//           <div className="flex items-center gap-2 mt-4 md:mt-0">
//             <Button variant="outline" onClick={exportToCSV}>
//               <Download className="h-4 w-4 mr-2" />
//               Export CSV
//             </Button>
//             <Button variant="outline" onClick={fetchVacateRequests}>
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Refresh
//             </Button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Requests</p>
//                   <p className="text-2xl font-bold mt-1">{requests.length}</p>
//                 </div>
//                 <div className="p-3 bg-blue-100 rounded-full">
//                   <FileText className="h-6 w-6 text-blue-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Pending</p>
//                   <p className="text-2xl font-bold mt-1">
//                     {requests.filter(r => r.vacate_status === 'pending').length}
//                   </p>
//                 </div>
//                 <div className="p-3 bg-yellow-100 rounded-full">
//                   <Clock className="h-6 w-6 text-yellow-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Under Review</p>
//                   <p className="text-2xl font-bold mt-1">
//                     {requests.filter(r => r.vacate_status === 'under_review').length}
//                   </p>
//                 </div>
//                 <div className="p-3 bg-orange-100 rounded-full">
//                   <AlertCircle className="h-6 w-6 text-orange-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Approved</p>
//                   <p className="text-2xl font-bold mt-1">
//                     {requests.filter(r => r.vacate_status === 'approved').length}
//                   </p>
//                 </div>
//                 <div className="p-3 bg-green-100 rounded-full">
//                   <CheckCircle className="h-6 w-6 text-green-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Main Content Card */}
//         <Card>
//           <CardHeader>
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//               <div>
//                 <CardTitle>All Vacate Requests</CardTitle>
//                 <CardDescription>
//                   Showing {filteredRequests.length} of {requests.length} requests
//                 </CardDescription>
//               </div>
              
//               {/* Filters */}
//               <div className="flex flex-col md:flex-row gap-3">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                   <Input
//                     placeholder="Search tenant, property..."
//                     className="pl-10 w-full md:w-64"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>
                
//                 <Select value={filterStatus} onValueChange={setFilterStatus}>
//                   <SelectTrigger className="w-full md:w-40">
//                     <Filter className="h-4 w-4 mr-2" />
//                     <SelectValue placeholder="Status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Status</SelectItem>
//                     <SelectItem value="pending">Pending</SelectItem>
//                     <SelectItem value="under_review">Under Review</SelectItem>
//                     <SelectItem value="approved">Approved</SelectItem>
//                     <SelectItem value="rejected">Rejected</SelectItem>
//                     <SelectItem value="completed">Completed</SelectItem>
//                   </SelectContent>
//                 </Select>
                
//                 <Select value={priorityFilter} onValueChange={setPriorityFilter}>
//                   <SelectTrigger className="w-full md:w-40">
//                     <SelectValue placeholder="Priority" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all-priority">All Priority</SelectItem>
//                     <SelectItem value="low">Low</SelectItem>
//                     <SelectItem value="medium">Medium</SelectItem>
//                     <SelectItem value="high">High</SelectItem>
//                     <SelectItem value="urgent">Urgent</SelectItem>
//                   </SelectContent>
//                 </Select>
                
//                 <Select value={propertyFilter} onValueChange={setPropertyFilter}>
//                   <SelectTrigger className="w-full md:w-40">
//                     <SelectValue placeholder="Property" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Properties</SelectItem>
//                     {properties.map(property => (
//                       <SelectItem key={property.id} value={property.id.toString()}>
//                         {property.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </CardHeader>
          
//           <CardContent>
//             <Tabs defaultValue="all" onValueChange={setActiveTab}>
//               <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
//                 <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
//                 <TabsTrigger value="pending">Pending ({requests.filter(r => r.vacate_status === 'pending').length})</TabsTrigger>
//                 <TabsTrigger value="under_review">Review ({requests.filter(r => r.vacate_status === 'under_review').length})</TabsTrigger>
//                 <TabsTrigger value="approved">Approved ({requests.filter(r => r.vacate_status === 'approved').length})</TabsTrigger>
//                 <TabsTrigger value="rejected">Rejected ({requests.filter(r => r.vacate_status === 'rejected').length})</TabsTrigger>
//                 <TabsTrigger value="completed">Completed ({requests.filter(r => r.vacate_status === 'completed').length})</TabsTrigger>
//               </TabsList>
              
//               <TabsContent value={activeTab} className="mt-6">
//                 <div className="rounded-md border">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>ID</TableHead>
//                         <TableHead>Tenant</TableHead>
//                         <TableHead>Property</TableHead>
//                         <TableHead>Room/Bed</TableHead>
//                         <TableHead>Expected Date</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead>Priority</TableHead>
//                         <TableHead>Created</TableHead>
//                         <TableHead className="text-right">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {currentItems.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={9} className="text-center py-12">
//                             <div className="flex flex-col items-center">
//                               <FileText className="h-12 w-12 text-gray-400 mb-4" />
//                               <h3 className="text-lg font-medium text-gray-900 mb-2">No vacate requests found</h3>
//                               <p className="text-gray-600">
//                                 {searchTerm || filterStatus !== 'all' || priorityFilter !== 'all' || propertyFilter !== 'all'
//                                   ? 'Try adjusting your filters'
//                                   : 'No vacate requests have been submitted yet.'}
//                               </p>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         currentItems.map((request) => {
//                           const penalties = calculatePenalties(request);
                          
//                           return (
//                             <TableRow key={request.vacate_request_id}>
//                               <TableCell className="font-medium">
//                                 #{request.vacate_request_id}
//                                 {/* {request.tenant_request_id && (
//                                   <div className="text-xs text-gray-500">
//                                     TR-{request.tenant_request_id}
//                                   </div>
//                                 )} */}
//                               </TableCell>
//                               <TableCell>
//                                 <div>
//                                   <p className="font-medium">{request.tenant_name}</p>
//                                   <div className="flex items-center gap-1 text-sm text-gray-500">
//                                     <Mail className="h-3 w-3" />
//                                     <span>{request.tenant_email}</span>
//                                   </div>
//                                   <div className="flex items-center gap-1 text-sm text-gray-500">
//                                     <Phone className="h-3 w-3" />
//                                     <span>{request.tenant_phone}</span>
//                                   </div>
//                                 </div>
//                               </TableCell>
//                               <TableCell>
//                                 <div className="flex items-center gap-2">
//                                   <Building2 className="h-4 w-4 text-gray-400" />
//                                   <span>{request.property_name}</span>
//                                 </div>
//                               </TableCell>
//                               <TableCell>
//                                 <div className="flex items-center gap-2">
//                                   <Bed className="h-4 w-4 text-gray-400" />
//                                   <span>Room {request.room_number} • Bed {request.bed_number}</span>
//                                 </div>
//                               </TableCell>
//                               <TableCell>
//                                 <div className="flex items-center gap-2">
//                                   <Calendar className="h-4 w-4 text-gray-400" />
//                                   <span>
//                                     {request.expected_vacate_date 
//                                       ? format(new Date(request.expected_vacate_date), 'dd MMM yyyy')
//                                       : 'Not specified'}
//                                   </span>
//                                 </div>
//                                 {penalties && penalties.total_penalty > 0 && (
//                                   <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
//                                     <DollarSign className="h-3 w-3" />
//                                     <span>Penalty: ₹{penalties.total_penalty.toFixed(2)}</span>
//                                   </div>
//                                 )}
//                               </TableCell>
//                               <TableCell>{getStatusBadge(request.vacate_status)}</TableCell>
//                               <TableCell>{getPriorityBadge(request.priority)}</TableCell>
//                               <TableCell>
//                                 {format(new Date(request.vacate_request_date), 'dd MMM yyyy')}
//                               </TableCell>
//                               <TableCell className="text-right">
//                                 <DropdownMenu>
//                                   <DropdownMenuTrigger asChild>
//                                     <Button variant="ghost" size="icon">
//                                       <MoreVertical className="h-4 w-4" />
//                                     </Button>
//                                   </DropdownMenuTrigger>
//                                   <DropdownMenuContent align="end">
//                                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                                     <DropdownMenuItem onClick={() => openPreview(request)}>
//                                       <Eye className="h-4 w-4 mr-2" />
//                                       View Details
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem onClick={() => openStatusUpdate(request)}>
//                                       {request.vacate_status === 'pending' ? (
//                                         <>
//                                           <AlertCircle className="h-4 w-4 mr-2" />
//                                           Start Review
//                                         </>
//                                       ) : (
//                                         <>
//                                           <CheckCircle className="h-4 w-4 mr-2" />
//                                           Update Status
//                                         </>
//                                       )}
//                                     </DropdownMenuItem>
//                                     {/* <DropdownMenuSeparator />
//                                     <DropdownMenuItem>
//                                       <MessageSquare className="h-4 w-4 mr-2" />
//                                       Contact Tenant
//                                     </DropdownMenuItem> */}
//                                   </DropdownMenuContent>
//                                 </DropdownMenu>
//                               </TableCell>
//                             </TableRow>
//                           );
//                         })
//                       )}
//                     </TableBody>
//                   </Table>
//                 </div>

//                 {/* Pagination */}
//                 {currentItems.length > 0 && (
//                   <div className="flex items-center justify-between mt-4">
//                     <div className="text-sm text-gray-600">
//                       Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                         disabled={currentPage === 1}
//                       >
//                         <ChevronLeft className="h-4 w-4" />
//                       </Button>
//                       <span className="text-sm">
//                         Page {currentPage} of {totalPages}
//                       </span>
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                         disabled={currentPage === totalPages}
//                       >
//                         <ChevronRight className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Preview Dialog */}
//       <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//           {selectedRequest && (
//             <>
//               <DialogHeader>
//                 <DialogTitle className="flex items-center gap-2">
//                   <FileText className="h-5 w-5" />
//                   Vacate Request Details
//                 </DialogTitle>
//                 <DialogDescription>
//                   Request ID: VR-{selectedRequest.vacate_request_id}
//                   {selectedRequest.tenant_request_id && ` • Tenant Request ID: TR-${selectedRequest.tenant_request_id}`}
//                 </DialogDescription>
//               </DialogHeader>

//               <div className="space-y-6">
//                 {/* Tenant & Property Info */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <Card>
//                     <CardContent className="pt-6">
//                       <div className="flex items-center gap-2 mb-2">
//                         <User className="h-4 w-4" />
//                         <h4 className="font-semibold">Tenant Information</h4>
//                       </div>
//                       <p className="text-sm font-medium">{selectedRequest.tenant_name}</p>
//                       <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
//                         <Mail className="h-3 w-3" />
//                         <span>{selectedRequest.tenant_email}</span>
//                       </div>
//                       <div className="flex items-center gap-1 text-sm text-gray-500">
//                         <Phone className="h-3 w-3" />
//                         <span>{selectedRequest.tenant_phone}</span>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   <Card>
//                     <CardContent className="pt-6">
//                       <div className="flex items-center gap-2 mb-2">
//                         <Home className="h-4 w-4" />
//                         <h4 className="font-semibold">Property Details</h4>
//                       </div>
//                       <p className="text-sm font-medium">{selectedRequest.property_name}</p>
//                       <p className="text-sm text-gray-500">
//                         Room {selectedRequest.room_number} • Bed {selectedRequest.bed_number}
//                       </p>
//                       {selectedRequest.check_in_date && (
//                         <p className="text-sm mt-1">
//                           Check-in: {format(new Date(selectedRequest.check_in_date), 'dd MMM yyyy')}
//                         </p>
//                       )}
//                     </CardContent>
//                   </Card>

//                   <Card>
//                     <CardContent className="pt-6">
//                       <div className="flex items-center gap-2 mb-2">
//                         <Calendar className="h-4 w-4" />
//                         <h4 className="font-semibold">Vacate Details</h4>
//                       </div>
//                       <div className="space-y-2">
//                         <p className="text-sm font-medium">
//                           Expected Vacate: {selectedRequest.expected_vacate_date 
//                             ? format(new Date(selectedRequest.expected_vacate_date), 'dd MMM yyyy')
//                             : 'Not specified'}
//                         </p>
//                         <div className="flex items-center gap-2">
//                           {getStatusBadge(selectedRequest.vacate_status)}
//                           {selectedRequest.processed_at && (
//                             <span className="text-xs text-gray-500">
//                               {format(new Date(selectedRequest.processed_at), 'dd MMM yyyy')}
//                             </span>
//                           )}
//                         </div>
//                         {selectedRequest.vacate_admin_notes && (
//                           <p className="text-xs text-gray-500 mt-2">
//                             Admin Notes: {selectedRequest.vacate_admin_notes}
//                           </p>
//                         )}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>

//                 {/* Reason and Ratings */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">Vacate Reason & Feedback</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div>
//                       <h4 className="font-semibold mb-2">Primary Reason</h4>
//                       <p className="text-gray-700">{selectedRequest.primary_reason}</p>
//                     </div>

//                     {selectedRequest.secondary_reasons && selectedRequest.secondary_reasons.length > 0 && (
//                       <div>
//                         <h4 className="font-semibold mb-2">Other Reasons</h4>
//                         <div className="flex flex-wrap gap-2">
//                           {selectedRequest.secondary_reasons.map((reason, idx) => (
//                             <Badge key={idx} variant="outline">
//                               {reason}
//                             </Badge>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {/* Ratings */}
//                     {(selectedRequest.overall_rating || selectedRequest.food_rating || 
//                       selectedRequest.cleanliness_rating || selectedRequest.management_rating) && (
//                       <div>
//                         <h4 className="font-semibold mb-3">Ratings</h4>
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                           {[
//                             { label: 'Overall', value: selectedRequest.overall_rating },
//                             { label: 'Food', value: selectedRequest.food_rating },
//                             { label: 'Cleanliness', value: selectedRequest.cleanliness_rating },
//                             { label: 'Management', value: selectedRequest.management_rating },
//                           ].map((rating) => (
//                             rating.value !== null && (
//                               <div key={rating.label} className="text-center p-3 border rounded-lg">
//                                 <div className="flex items-center justify-center gap-1 mb-1">
//                                   <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
//                                   <span className="font-semibold text-lg">{rating.value}/5</span>
//                                 </div>
//                                 <p className="text-sm text-gray-600">{rating.label}</p>
//                               </div>
//                             )
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {selectedRequest.improvement_suggestions && (
//                       <div>
//                         <h4 className="font-semibold mb-2">Improvement Suggestions</h4>
//                         <div className="p-3 bg-gray-50 rounded-lg">
//                           <p className="text-gray-700 whitespace-pre-line">
//                             {selectedRequest.improvement_suggestions}
//                           </p>
//                         </div>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>

//                 {/* Contract & Penalty Information */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">Contract & Penalty Information</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {/* Lock-in Period */}
//                       <div className="border rounded-lg p-4">
//                         <h4 className="font-semibold mb-3">Lock-in Period</h4>
//                         <div className="space-y-2">
//                           <div className="flex justify-between">
//                             <span className="text-sm text-gray-600">Period:</span>
//                             <span className="font-medium">{selectedRequest.lockin_period_months || 0} months</span>
//                           </div>
//                           {selectedRequest.check_in_date && (
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">Check-in:</span>
//                               <span className="font-medium">
//                                 {format(new Date(selectedRequest.check_in_date), 'dd MMM yyyy')}
//                               </span>
//                             </div>
//                           )}
//                           {selectedRequest.lockin_penalty_amount && (
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">Penalty:</span>
//                               <span className="font-medium text-red-600">
//                                 {formatCurrency(selectedRequest.lockin_penalty_amount)} 
//                                 {selectedRequest.lockin_penalty_type && ` (${selectedRequest.lockin_penalty_type})`}
//                               </span>
//                             </div>
//                           )}
//                           <div className="pt-2 border-t">
//                             <Badge variant={
//                               selectedRequest.lockin_penalty_accepted ? 'default' : 'outline'
//                             }>
//                               {selectedRequest.lockin_penalty_accepted 
//                                 ? '✓ Penalty Accepted' 
//                                 : '✗ Penalty Not Accepted'}
//                             </Badge>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Notice Period */}
//                       <div className="border rounded-lg p-4">
//                         <h4 className="font-semibold mb-3">Notice Period</h4>
//                         <div className="space-y-2">
//                           <div className="flex justify-between">
//                             <span className="text-sm text-gray-600">Period:</span>
//                             <span className="font-medium">{selectedRequest.notice_period_days || 0} days</span>
//                           </div>
//                           {selectedRequest.notice_penalty_amount && (
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">Penalty:</span>
//                               <span className="font-medium text-red-600">
//                                 {formatCurrency(selectedRequest.notice_penalty_amount)}
//                                 {selectedRequest.notice_penalty_type && ` (${selectedRequest.notice_penalty_type})`}
//                               </span>
//                             </div>
//                           )}
//                           <div className="pt-2 border-t">
//                             <Badge variant={
//                               selectedRequest.notice_penalty_accepted ? 'default' : 'outline'
//                             }>
//                               {selectedRequest.notice_penalty_accepted 
//                                 ? '✓ Penalty Accepted' 
//                                 : '✗ Penalty Not Accepted'}
//                             </Badge>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Penalty Calculation */}
//                     {(() => {
//                       const penalties = calculatePenalties(selectedRequest);
//                       if (!penalties) return null;
                      
//                       return (
//                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//                           <h4 className="font-medium mb-3">Penalty Calculation</h4>
//                           <div className="space-y-2">
//                             {penalties.lockin_penalty > 0 && (
//                               <div className="flex justify-between">
//                                 <span className="text-gray-600">Lock-in Penalty:</span>
//                                 <span className="font-medium text-red-600">₹{penalties.lockin_penalty.toFixed(2)}</span>
//                               </div>
//                             )}
//                             {penalties.notice_penalty > 0 && (
//                               <div className="flex justify-between">
//                                 <span className="text-gray-600">Notice Period Penalty:</span>
//                                 <span className="font-medium text-red-600">₹{penalties.notice_penalty.toFixed(2)}</span>
//                               </div>
//                             )}
//                             {(penalties.lockin_penalty > 0 || penalties.notice_penalty > 0) && (
//                               <div className="flex justify-between pt-2 border-t border-gray-200">
//                                 <span className="font-medium">Total Penalty:</span>
//                                 <span className="font-bold text-red-600">₹{penalties.total_penalty.toFixed(2)}</span>
//                               </div>
//                             )}
//                             {penalties.total_penalty === 0 && (
//                               <p className="text-green-600 font-medium">No penalties applicable</p>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })()}

//                     {/* Financial Info */}
//                     <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                       <h4 className="font-semibold text-blue-800 mb-3">Financial Details</h4>
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                         <div>
//                           <p className="text-sm text-blue-700">Monthly Rent</p>
//                           <p className="font-semibold text-blue-800">
//                             {formatCurrency(selectedRequest.monthly_rent)}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-blue-700">Security Deposit</p>
//                           <p className="font-semibold text-blue-800">
//                             {formatCurrency(selectedRequest.security_deposit)}
//                           </p>
//                         </div>
//                         {selectedRequest.refund_amount !== null && (
//                           <div>
//                             <p className="text-sm text-green-700">Refund Amount</p>
//                             <p className="font-semibold text-green-600">
//                               {formatCurrency(selectedRequest.refund_amount)}
//                             </p>
//                           </div>
//                         )}
//                         {selectedRequest.penalty_deduction !== null && (
//                           <div>
//                             <p className="text-sm text-red-700">Penalty Deduction</p>
//                             <p className="font-semibold text-red-600">
//                               {formatCurrency(selectedRequest.penalty_deduction)}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>

//               <DialogFooter>
//                 <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
//                   Close
//                 </Button>
//                 <Button onClick={() => openStatusUpdate(selectedRequest)}>
//                   {selectedRequest.vacate_status === 'pending' ? 'Start Review' : 'Update Status'}
//                 </Button>
//               </DialogFooter>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Status Update Dialog */}
//       <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Update Request Status</AlertDialogTitle>
//             <AlertDialogDescription>
//               Update the status of request #{selectedRequest?.vacate_request_id} for {selectedRequest?.tenant_name}
//             </AlertDialogDescription>
//           </AlertDialogHeader>

//           <div className="space-y-4 py-4">
//             <div>
//               <Label htmlFor="status">New Status *</Label>
//               <Select
//                 value={statusUpdateData.status}
//                 onValueChange={(value: any) => setStatusUpdateData(prev => ({ ...prev, status: value }))}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="under_review">Under Review</SelectItem>
//                   <SelectItem value="approved">Approve</SelectItem>
//                   <SelectItem value="rejected">Reject</SelectItem>
//                   <SelectItem value="cancelled">Cancel</SelectItem>
//                   <SelectItem value="completed">Mark as Completed</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {statusUpdateData.status === 'completed' && (
//               <>
//                 <div>
//                   <Label htmlFor="actual_vacate_date">Actual Vacate Date</Label>
//                   <Input
//                     id="actual_vacate_date"
//                     type="date"
//                     value={statusUpdateData.actual_vacate_date || ''}
//                     onChange={(e) => setStatusUpdateData(prev => ({ ...prev, actual_vacate_date: e.target.value }))}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="refund_amount">Refund Amount (₹)</Label>
//                   <Input
//                     id="refund_amount"
//                     type="number"
//                     placeholder="0.00"
//                     value={statusUpdateData.refund_amount || ''}
//                     onChange={(e) => setStatusUpdateData(prev => ({ ...prev, refund_amount: parseFloat(e.target.value) }))}
//                   />
//                 </div>
//               </>
//             )}

//             <div>
//               <Label htmlFor="admin_notes">Admin Notes</Label>
//               <Textarea
//                 id="admin_notes"
//                 placeholder="Add notes about this status update..."
//                 value={statusUpdateData.admin_notes || ''}
//                 onChange={(e) => setStatusUpdateData(prev => ({ ...prev, admin_notes: e.target.value }))}
//                 rows={3}
//               />
//             </div>

//             {selectedRequest && (() => {
//               const penalties = calculatePenalties(selectedRequest);
//               if (!penalties || penalties.total_penalty === 0) return null;
              
//               return (
//                 <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="font-medium">Total Penalty:</span>
//                     <span className="font-bold text-red-600">₹{penalties.total_penalty.toFixed(2)}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       id="penalty_waived"
//                       checked={statusUpdateData.penalty_waived || false}
//                       onChange={(e) => setStatusUpdateData(prev => ({ ...prev, penalty_waived: e.target.checked }))}
//                       className="rounded"
//                     />
//                     <Label htmlFor="penalty_waived" className="text-sm cursor-pointer">
//                       Waive penalty for this request
//                     </Label>
//                   </div>
//                 </div>
//               );
//             })()}
//           </div>

//           <AlertDialogFooter>
//             <AlertDialogCancel onClick={() => setIsStatusDialogOpen(false)}>
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleStatusUpdate}
//               disabled={submitting}
//               className="bg-blue-600 hover:bg-blue-700"
//             >
//               {submitting ? (
//                 <>
//                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   Updating...
//                 </>
//               ) : (
//                 'Update Status'
//               )}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }


// function sendNotificationToTenant(tenant_id: number, status: string) {
//   throw new Error('Function not implemented.');
// }


// components/admin/VacateRequestsList.tsx
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
  ArrowUpDown,
  X,
  Settings
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
  const [refreshing, setRefreshing] = useState<boolean>(false);
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
  const [sortField, setSortField] = useState<keyof VacateRequest>('vacate_request_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Column search filters
  const [searchFilters, setSearchFilters] = useState({
    id: '',
    tenant: '',
    property: '',
    room_bed: '',
    expected_date: '',
    status: 'all',
    priority: 'all',
    created: ''
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

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await fetchVacateRequests();
      await fetchPropertiesData();
      await fetchVacateReasonsData();
      toast.success("Data refreshed");
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

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

  // Filter requests based on active tab
  const getFilteredByTab = () => {
    if (activeTab === 'all') return filteredRequests;
    return filteredRequests.filter(r => r.vacate_status === activeTab);
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

    // Apply status filter (overall, not tab-specific)
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

  // Column filters
  const filteredWithColumns = getFilteredByTab().filter(request => {
    const matchesId = request.vacate_request_id.toString().includes(searchFilters.id);
    const matchesTenant = (request.tenant_name || '').toLowerCase().includes(searchFilters.tenant.toLowerCase());
    const matchesProperty = (request.property_name || '').toLowerCase().includes(searchFilters.property.toLowerCase());
    const matchesRoomBed = `Room ${request.room_number} Bed ${request.bed_number}`.toLowerCase().includes(searchFilters.room_bed.toLowerCase());
    const matchesExpectedDate = !searchFilters.expected_date || 
      (request.expected_vacate_date && new Date(request.expected_vacate_date).toISOString().split('T')[0] === searchFilters.expected_date);
    const matchesStatus = searchFilters.status === 'all' || request.vacate_status === searchFilters.status;
    const matchesPriority = searchFilters.priority === 'all' || request.priority === searchFilters.priority;
    const matchesCreated = !searchFilters.created || 
      new Date(request.vacate_request_date).toISOString().split('T')[0] === searchFilters.created;
    
    return matchesId && matchesTenant && matchesProperty && matchesRoomBed && 
           matchesExpectedDate && matchesStatus && matchesPriority && matchesCreated;
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
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedRequests.slice(startIndex, endIndex);

  const handleSort = (field: keyof VacateRequest) => {
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

      // Get token from all possible locations
      const adminToken = localStorage.getItem('auth_token');
      const genericToken = localStorage.getItem('token');
      const token = adminToken || genericToken;
      
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
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/vacate-requests/${selectedRequest.vacate_request_id}/status`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(payload),
      });

      // Try to read response text
      const responseText = await response.text();
      
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
      <Badge variant={cfg.variant} className="flex items-center gap-1 text-xs px-2 py-0.5">
        <Icon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    
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
      case 'under_review': return <AlertCircle className="h-3 w-3" />;
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
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

  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading vacate requests...</p>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 min-h-screen">
      
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 mb-2 px-0 sticky top-24 z-10">
        {/* Total Requests */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Total
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {requests.length}
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
                  {requests.filter(r => r.vacate_status === 'pending').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-yellow-600">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Under Review */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Review
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {requests.filter(r => r.vacate_status === 'under_review').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-orange-600">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
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
                  {requests.filter(r => r.vacate_status === 'approved').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-green-600">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Completed
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {requests.filter(r => r.vacate_status === 'completed').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-purple-600">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-3 px-0 sticky top-40 z-10">
        <div className="flex items-center gap-2">
         
          
          
          <Button variant="outline" size="sm" onClick={exportToCSV} className="h-9">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-lg border-0  mb-6 sticky top-52 z-10 ">
        <CardHeader className="pb-2">
<Tabs
  defaultValue="all"
  value={activeTab}
  onValueChange={setActiveTab}
  className="w-full overflow-hidden"
>
  <div className="w-full overflow-x-auto md:overflow-visible">
    <TabsList
      className="
        flex md:grid
        md:grid-cols-6
        gap-1
        w-max md:w-full
      "
    >
      <TabsTrigger value="all" className="text-xs sm:text-sm px-3 py-1.5 whitespace-nowrap">
        All ({requests.length})
      </TabsTrigger>

      <TabsTrigger value="pending" className="text-xs sm:text-sm px-3 py-1.5 whitespace-nowrap">
        Pending ({requests.filter(r => r.vacate_status === 'pending').length})
      </TabsTrigger>

      <TabsTrigger value="under_review" className="text-xs sm:text-sm px-3 py-1.5 whitespace-nowrap">
        Review ({requests.filter(r => r.vacate_status === 'under_review').length})
      </TabsTrigger>

      <TabsTrigger value="approved" className="text-xs sm:text-sm px-3 py-1.5 whitespace-nowrap">
        Approved ({requests.filter(r => r.vacate_status === 'approved').length})
      </TabsTrigger>

      <TabsTrigger value="rejected" className="text-xs sm:text-sm px-3 py-1.5 whitespace-nowrap">
        Rejected ({requests.filter(r => r.vacate_status === 'rejected').length})
      </TabsTrigger>

      <TabsTrigger value="completed" className="text-xs sm:text-sm px-3 py-1.5 whitespace-nowrap">
        Completed ({requests.filter(r => r.vacate_status === 'completed').length})
      </TabsTrigger>
    </TabsList>
  </div>
</Tabs>
        </CardHeader>
        
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 m-4 rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vacate requests found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterStatus !== 'all' || priorityFilter !== 'all' || propertyFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No vacate requests have been submitted yet.'}
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
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('vacate_request_id')}>
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
                      <TableHead className="w-[200px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
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
                      
                      {/* Property Column */}
                      <TableHead className="w-[150px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('property_name')}>
                            <span className="font-semibold text-gray-700 text-xs">Property</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="Search..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.property}
                            onChange={(e) => handleSearchChange('property', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Room/Bed Column */}
                      <TableHead className="w-[120px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <span className="font-semibold text-gray-700 text-xs">Room/Bed</span>
                          <Input 
                            placeholder="Search..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.room_bed}
                            onChange={(e) => handleSearchChange('room_bed', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Expected Date Column */}
                      <TableHead className="w-[130px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('expected_vacate_date')}>
                            <span className="font-semibold text-gray-700 text-xs">Exp. Date</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="Date..." 
                            type="date"
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.expected_date}
                            onChange={(e) => handleSearchChange('expected_date', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Status Column */}
                      <TableHead className="w-[110px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('vacate_status')}>
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
                              <SelectItem value="under_review">Review</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
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
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('vacate_request_date')}>
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
                    {currentItems.map((request, index) => {
                      const penalties = calculatePenalties(request);
                      
                      return (
                        <TableRow 
                          key={request.vacate_request_id} 
                          className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                          }`}
                        >
                          <TableCell className="font-mono text-xs font-medium text-blue-600 truncate">
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                              #{request.vacate_request_id}
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
                                <Mail className="h-2 w-2" />
                                {request.tenant_email}
                              </div>
                              <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                                <Phone className="h-2 w-2" />
                                {request.tenant_phone}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="truncate">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs truncate">
                                {request.property_name}
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="truncate">
                            <div className="flex items-center gap-1">
                              <Bed className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs truncate">
                                R{request.room_number} • B{request.bed_number}
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="truncate">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                <span className="text-xs truncate">
                                  {request.expected_vacate_date 
                                    ? format(new Date(request.expected_vacate_date), 'dd MMM')
                                    : 'N/A'}
                                </span>
                              </div>
                              {penalties && penalties.total_penalty > 0 && (
                                <div className="flex items-center gap-1 text-[10px] text-red-600">
                                  <DollarSign className="h-2 w-2" />
                                  <span>₹{penalties.total_penalty.toFixed(0)}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            {getStatusBadge(request.vacate_status)}
                          </TableCell>
                          
                          <TableCell>
                            {getPriorityBadge(request.priority)}
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-xs whitespace-nowrap">
                              {format(new Date(request.vacate_request_date), 'dd MMM')}
                            </div>
                            <div className="text-[10px] text-gray-500 whitespace-nowrap">
                              {format(new Date(request.vacate_request_date), 'hh:mm a')}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPreview(request)}
                                className="h-7 w-7 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => openStatusUpdate(request)}
                                className="h-7 px-2 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                              >
                                {request.vacate_status === 'pending' ? 'Review' : 'Update'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {currentItems.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
                  <div className="text-xs text-gray-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, sortedRequests.length)} of {sortedRequests.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-8 text-xs"
                    >
                      <ChevronLeft className="h-3 w-3 mr-1" />
                      Previous
                    </Button>
                    <span className="text-xs text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
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

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <FileText className="h-4 w-4" />
                Vacate Request Details - #{selectedRequest?.vacate_request_id}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsPreviewOpen(false)}
                className="h-7 w-7 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-50 text-xs">
              Request ID: VR-{selectedRequest?.vacate_request_id}
              {selectedRequest?.tenant_request_id && ` • Tenant Request ID: TR-${selectedRequest.tenant_request_id}`}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="p-4 sm:p-5 space-y-3">
              {/* Status & Priority */}
              <div className="flex flex-wrap gap-2 bg-gray-50 px-3 py-2 rounded-md text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Status:</span>
                  {getStatusBadge(selectedRequest.vacate_status)}
                </div>
                {selectedRequest.priority && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Priority:</span>
                    {getPriorityBadge(selectedRequest.priority)}
                  </div>
                )}
              </div>

              {/* Tenant & Property Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-3 w-3 text-blue-600" />
                      <h4 className="font-semibold text-xs">Tenant Information</h4>
                    </div>
                    <p className="text-xs font-medium">{selectedRequest.tenant_name}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                      <Mail className="h-2 w-2" />
                      <span className="truncate">{selectedRequest.tenant_email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <Phone className="h-2 w-2" />
                      <span>{selectedRequest.tenant_phone}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-3 w-3 text-blue-600" />
                      <h4 className="font-semibold text-xs">Property Details</h4>
                    </div>
                    <p className="text-xs font-medium">{selectedRequest.property_name}</p>
                    <p className="text-[10px] text-gray-500">
                      Room {selectedRequest.room_number} • Bed {selectedRequest.bed_number}
                    </p>
                    {selectedRequest.check_in_date && (
                      <p className="text-[10px] mt-1">
                        Check-in: {format(new Date(selectedRequest.check_in_date), 'dd MMM yyyy')}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-3 w-3 text-blue-600" />
                      <h4 className="font-semibold text-xs">Vacate Details</h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs">
                        Expected: {selectedRequest.expected_vacate_date 
                          ? format(new Date(selectedRequest.expected_vacate_date), 'dd MMM yyyy')
                          : 'Not specified'}
                      </p>
                      {selectedRequest.processed_at && (
                        <p className="text-[10px] text-gray-500">
                          Processed: {format(new Date(selectedRequest.processed_at), 'dd MMM yyyy')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reason and Ratings */}
              <Card>
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm">Vacate Reason & Feedback</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-xs mb-1">Primary Reason</h4>
                    <p className="text-xs text-gray-700">{selectedRequest.primary_reason}</p>
                  </div>

                  {selectedRequest.secondary_reasons && selectedRequest.secondary_reasons.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-xs mb-1">Other Reasons</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedRequest.secondary_reasons.map((reason, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] px-1 py-0">
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
                      <h4 className="font-semibold text-xs mb-2">Ratings</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { label: 'Overall', value: selectedRequest.overall_rating },
                          { label: 'Food', value: selectedRequest.food_rating },
                          { label: 'Cleanliness', value: selectedRequest.cleanliness_rating },
                          { label: 'Management', value: selectedRequest.management_rating },
                        ].map((rating) => (
                          rating.value !== null && (
                            <div key={rating.label} className="text-center p-2 border rounded-lg">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold text-xs">{rating.value}/5</span>
                              </div>
                              <p className="text-[10px] text-gray-600">{rating.label}</p>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRequest.improvement_suggestions && (
                    <div>
                      <h4 className="font-semibold text-xs mb-1">Improvement Suggestions</h4>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-700 whitespace-pre-line">
                          {selectedRequest.improvement_suggestions}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contract & Penalty Information */}
              <Card>
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm">Contract & Penalty Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Lock-in Period */}
                    <div className="border rounded-lg p-3">
                      <h4 className="font-semibold text-xs mb-2">Lock-in Period</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Period:</span>
                          <span className="font-medium">{selectedRequest.lockin_period_months || 0} months</span>
                        </div>
                        {selectedRequest.lockin_penalty_amount && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Penalty:</span>
                            <span className="font-medium text-red-600">
                              {formatCurrency(selectedRequest.lockin_penalty_amount)}
                            </span>
                          </div>
                        )}
                        <div className="pt-1 border-t mt-1">
                          <Badge variant={selectedRequest.lockin_penalty_accepted ? 'default' : 'outline'} className="text-[10px]">
                            {selectedRequest.lockin_penalty_accepted ? '✓ Penalty Accepted' : '✗ Penalty Not Accepted'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Notice Period */}
                    <div className="border rounded-lg p-3">
                      <h4 className="font-semibold text-xs mb-2">Notice Period</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Period:</span>
                          <span className="font-medium">{selectedRequest.notice_period_days || 0} days</span>
                        </div>
                        {selectedRequest.notice_penalty_amount && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Penalty:</span>
                            <span className="font-medium text-red-600">
                              {formatCurrency(selectedRequest.notice_penalty_amount)}
                            </span>
                          </div>
                        )}
                        <div className="pt-1 border-t mt-1">
                          <Badge variant={selectedRequest.notice_penalty_accepted ? 'default' : 'outline'} className="text-[10px]">
                            {selectedRequest.notice_penalty_accepted ? '✓ Penalty Accepted' : '✗ Penalty Not Accepted'}
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
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-xs mb-2">Penalty Calculation</h4>
                        <div className="space-y-1 text-xs">
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
                            <div className="flex justify-between pt-1 border-t border-gray-200">
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
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-xs text-blue-800 mb-2">Financial Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-[10px] text-blue-700">Monthly Rent</p>
                        <p className="font-semibold text-blue-800">
                          {formatCurrency(selectedRequest.monthly_rent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-blue-700">Security Deposit</p>
                        <p className="font-semibold text-blue-800">
                          {formatCurrency(selectedRequest.security_deposit)}
                        </p>
                      </div>
                      {selectedRequest.refund_amount !== null && (
                        <div>
                          <p className="text-[10px] text-green-700">Refund Amount</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(selectedRequest.refund_amount)}
                          </p>
                        </div>
                      )}
                      {selectedRequest.penalty_deduction !== null && (
                        <div>
                          <p className="text-[10px] text-red-700">Penalty Deduction</p>
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
          )}

          <DialogFooter className="px-4 py-3 border-t bg-gray-50 sticky bottom-0">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} size="sm" className="h-8 text-xs">
              Close
            </Button>
            {selectedRequest && (
              <Button
                onClick={() => {
                  setIsPreviewOpen(false);
                  openStatusUpdate(selectedRequest);
                }}
                size="sm"
                className="h-8 text-xs bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                <Settings className="h-3 w-3 mr-1" />
                {selectedRequest.vacate_status === 'pending' ? 'Start Review' : 'Update Status'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent className="max-w-2xl w-[95vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Update Request Status
            </AlertDialogTitle>
            <AlertDialogDescription>
              Update the status of request #{selectedRequest?.vacate_request_id} for {selectedRequest?.tenant_name}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="status" className="text-sm">New Status *</Label>
              <Select
                value={statusUpdateData.status}
                onValueChange={(value: any) => setStatusUpdateData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="mt-1">
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
                  <Label htmlFor="actual_vacate_date" className="text-sm">Actual Vacate Date</Label>
                  <Input
                    id="actual_vacate_date"
                    type="date"
                    value={statusUpdateData.actual_vacate_date || ''}
                    onChange={(e) => setStatusUpdateData(prev => ({ ...prev, actual_vacate_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="refund_amount" className="text-sm">Refund Amount (₹)</Label>
                  <Input
                    id="refund_amount"
                    type="number"
                    placeholder="0.00"
                    value={statusUpdateData.refund_amount || ''}
                    onChange={(e) => setStatusUpdateData(prev => ({ ...prev, refund_amount: parseFloat(e.target.value) }))}
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="admin_notes" className="text-sm">Admin Notes</Label>
              <Textarea
                id="admin_notes"
                placeholder="Add notes about this status update..."
                value={statusUpdateData.admin_notes || ''}
                onChange={(e) => setStatusUpdateData(prev => ({ ...prev, admin_notes: e.target.value }))}
                rows={3}
                className="mt-1"
              />
            </div>

            {selectedRequest && (() => {
              const penalties = calculatePenalties(selectedRequest);
              if (!penalties || penalties.total_penalty === 0) return null;
              
              return (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2 text-sm">
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
                    <Label htmlFor="penalty_waived" className="text-xs cursor-pointer">
                      Waive penalty for this request
                    </Label>
                  </div>
                </div>
              );
            })()}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsStatusDialogOpen(false)} disabled={submitting} className="h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              disabled={submitting}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 h-9"
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
  // Implementation here
  console.log('Sending notification to tenant', tenant_id, 'about status', status);
}