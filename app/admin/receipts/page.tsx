// // app/admin/receipts/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Eye, Receipt, Download, CheckCircle, RefreshCw, FileText } from "lucide-react";
// import { toast } from "sonner";
// import { 
//   getRequestsByType, 
//   updateRequestStatus,
//   getTenantRequestStats,
//   formatDate,
//   getStatusColor,
//   type TenantRequest 
// } from "@/lib/tenantRequestsApi";

// export default function ReceiptsPage() {
//   const [requests, setRequests] = useState<TenantRequest[]>([]);
//   const [selectedRequest, setSelectedRequest] = useState<TenantRequest | null>(null);
//   const [showDialog, setShowDialog] = useState(false);
//   const [receiptDetails, setReceiptDetails] = useState({
//     amount: "",
//     receiptNumber: "",
//     notes: "",
//     type: "rent" // rent, deposit, maintenance, etc.
//   });
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [stats, setStats] = useState({
//     total: 0,
//     pending: 0,
//     generated: 0,
//     issued: 0
//   });

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const [requestsData, statsData] = await Promise.all([
//         getRequestsByType('receipt'),
//         getTenantRequestStats()
//       ]);
      
//       setRequests(requestsData);
//       setStats({
//         total: statsData.receipts || 0,
//         pending: statsData.pending || 0,
//         generated: statsData.resolved || 0,
//         issued: statsData.closed || 0
//       });
//     } catch (error: any) {
//       console.error("Error loading receipt requests:", error);
//       toast.error(error.message || "Failed to load receipt requests");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handleRefresh = () => {
//     setRefreshing(true);
//     loadData();
//   };

//   const handleGenerateReceipt = async () => {
//     if (!selectedRequest) return;

//     if (!receiptDetails.amount || !receiptDetails.receiptNumber) {
//       toast.error("Please fill in amount and receipt number");
//       return;
//     }

//     try {
//       await updateRequestStatus(selectedRequest.id, 'resolved', 
//         `Receipt generated: ${receiptDetails.type.toUpperCase()} - ${receiptDetails.receiptNumber} - ₹${receiptDetails.amount}`
//       );
      
//       toast.success("Receipt generated successfully");
//       setShowDialog(false);
//       setReceiptDetails({
//         amount: "",
//         receiptNumber: "",
//         notes: "",
//         type: "rent"
//       });
//       loadData();
//     } catch (error: any) {
//       toast.error(error.message || "Failed to generate receipt");
//     }
//   };

//   const handleMarkAsIssued = async (requestId: number) => {
//     try {
//       await updateRequestStatus(requestId, 'closed', 'Receipt physically issued to tenant');
//       toast.success("Receipt marked as issued");
//       loadData();
//     } catch (error: any) {
//       toast.error(error.message || "Failed to update receipt status");
//     }
//   };

//   const handleDownloadReceipt = (requestId: number) => {
//     // Implement receipt download
//     toast.success("Downloading receipt...");
//   };

//   if (loading) {
//     return (
//       <div className="p-6 flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading receipt requests...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
//           <div>
//             <h1 className="text-3xl font-bold">Receipt Requests</h1>
//             <p className="text-gray-600">Manage rent, deposit, and other receipt requests</p>
//           </div>
          
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               onClick={handleRefresh}
//               disabled={refreshing}
//             >
//               <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
//               {refreshing ? 'Refreshing...' : 'Refresh'}
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.total}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium">Pending</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-yellow-600">
//               {stats.pending}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium">Generated</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">
//               {stats.generated}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium">Issued</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-blue-600">
//               {stats.issued}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>All Receipt Requests</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Tenant</TableHead>
//                 <TableHead>Request Type</TableHead>
//                 <TableHead>Property</TableHead>
//                 <TableHead>Description</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Created</TableHead>
//                 <TableHead>Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {requests.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={7} className="text-center py-8 text-slate-500">
//                     No receipt requests found
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 requests.map((request) => (
//                   <TableRow key={request.id}>
//                     <TableCell className="font-medium">
//                       {request.tenant_name || `Tenant #${request.tenant_id}`}
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant="outline" className="border-blue-300">
//                         {request.title || 'Receipt Request'}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>{request.property_name || 'N/A'}</TableCell>
//                     <TableCell className="max-w-xs truncate">
//                       {request.description}
//                     </TableCell>
//                     <TableCell>
//                       <Badge className={getStatusColor(request.status)}>
//                         {request.status.toUpperCase()}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>{formatDate(request.created_at)}</TableCell>
//                     <TableCell>
//                       <div className="flex gap-2">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => {
//                             setSelectedRequest(request);
//                             setShowDialog(true);
//                           }}
//                         >
//                           <Eye className="h-4 w-4" />
//                         </Button>
//                         {request.status === 'resolved' && (
//                           <>
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => handleDownloadReceipt(request.id)}
//                             >
//                               <Download className="h-4 w-4" />
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => handleMarkAsIssued(request.id)}
//                             >
//                               <CheckCircle className="h-4 w-4" />
//                             </Button>
//                           </>
//                         )}
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       <Dialog open={showDialog} onOpenChange={setShowDialog}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Generate Receipt</DialogTitle>
//           </DialogHeader>
//           {selectedRequest && (
//             <div className="space-y-4">
//               <div>
//                 <Label>Tenant</Label>
//                 <p className="font-medium">
//                   {selectedRequest.tenant_name || `Tenant #${selectedRequest.tenant_id}`}
//                 </p>
//               </div>
              
//               <div>
//                 <Label>Receipt Type</Label>
//                 <Select
//                   value={receiptDetails.type}
//                   onValueChange={(value) => setReceiptDetails({...receiptDetails, type: value})}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="rent">Rent Payment</SelectItem>
//                     <SelectItem value="deposit">Security Deposit</SelectItem>
//                     <SelectItem value="maintenance">Maintenance Fee</SelectItem>
//                     <SelectItem value="utility">Utility Bill</SelectItem>
//                     <SelectItem value="other">Other</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label>Amount (₹)</Label>
//                 <Input
//                   type="number"
//                   value={receiptDetails.amount}
//                   onChange={(e) => setReceiptDetails({...receiptDetails, amount: e.target.value})}
//                   placeholder="Enter amount"
//                 />
//               </div>

//               <div>
//                 <Label>Receipt Number</Label>
//                 <Input
//                   value={receiptDetails.receiptNumber}
//                   onChange={(e) => setReceiptDetails({...receiptDetails, receiptNumber: e.target.value})}
//                   placeholder="e.g., REC-2024-001"
//                 />
//               </div>

//               <div>
//                 <Label>Notes</Label>
//                 <Textarea
//                   value={receiptDetails.notes}
//                   onChange={(e) => setReceiptDetails({...receiptDetails, notes: e.target.value})}
//                   placeholder="Additional notes..."
//                   rows={3}
//                 />
//               </div>

//               <div className="flex gap-2">
//                 <Button onClick={handleGenerateReceipt} className="flex-1">
//                   <FileText className="h-4 w-4 mr-2" />
//                   Generate Receipt
//                 </Button>
//                 <Button variant="outline" onClick={() => setShowDialog(false)}>
//                   Cancel
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


// app/admin/receipts/page.tsx
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
  Home, User, Calendar, Clock, CheckCircle, 
  XCircle, FileText, Receipt, IndianRupee,
  Download, Mail, Printer, CreditCard, Wallet
} from "lucide-react";
import {
  getAdminReceiptRequests,
  updateReceiptStatus,
  assignReceiptStaff,
  generateReceipt,
  getAccountingStaff,
  type ReceiptRequest,
  type ReceiptDetails
} from "@/lib/receiptApi";
import { toast } from "sonner";

export default function ReceiptsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ReceiptRequest[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ReceiptRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Receipt generation form
  const [receiptDetails, setReceiptDetails] = useState<ReceiptDetails>({
    receipt_number: `RCPT-${Date.now().toString().slice(-6)}`,
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: "bank_transfer",
    payment_for: "Monthly Rent",
    notes: ""
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAdminReceiptRequests();
      setRequests(data);
      console.log('Loaded receipt requests:', data.length);
      
      await loadStaff();
    } catch (err: any) {
      console.error('Error loading receipt requests:', err);
      toast.error("Failed to load receipt requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const staffData = await getAccountingStaff();
      setStaff(staffData);
      console.log('Loaded accounting staff:', staffData.length);
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
      await updateReceiptStatus(id, status);
      toast.success(`Status updated to ${status}`);
      await loadRequests();
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignStaff = async (requestId: number, staffId: string) => {
    try {
      setUpdating(true);
      if (staffId === "unassigned") {
        await assignReceiptStaff(requestId, 0);
        toast.success("Staff unassigned");
      } else {
        await assignReceiptStaff(requestId, Number(staffId));
        toast.success("Staff assigned");
      }
      await loadRequests();
    } catch (err: any) {
      console.error('Error assigning staff:', err);
      toast.error(err.message || "Failed to assign staff");
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateReceipt = async () => {
    if (!selectedRequest) {
      toast.error("No request selected");
      return;
    }

    if (!receiptDetails.amount || receiptDetails.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setUpdating(true);
      const response = await generateReceipt(selectedRequest.id, receiptDetails);
      
      if (response.success) {
        toast.success("Receipt generated successfully");
        setShowGenerateDialog(false);
        await loadRequests();
        
        // Reset form
        setReceiptDetails({
          receipt_number: `RCPT-${Date.now().toString().slice(-6)}`,
          amount: 0,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: "bank_transfer",
          payment_for: "Monthly Rent",
          notes: ""
        });
      } else {
        toast.error(response.message || "Failed to generate receipt");
      }
    } catch (err: any) {
      console.error('Error generating receipt:', err);
      toast.error(err.message || "Failed to generate receipt");
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
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800 hover:bg-green-100',
      medium: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      high: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      urgent: 'bg-red-100 text-red-800 hover:bg-red-100'
    };

    return (
      <Badge className={`${colors[priority] || colors.medium}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading receipt requests...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Receipt Requests</h1>
          <p className="text-gray-600 mt-1">Manage tenant receipt requests and generate receipts</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={refreshing || updating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Total Requests
            </CardTitle>
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
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
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
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Receipt Requests
          </CardTitle>
          <p className="text-sm text-gray-500">
            Showing only receipt requests (request_type = 'receipt')
          </p>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No receipt requests found</h3>
              <p className="text-gray-500 mb-4">No receipt requests have been submitted yet.</p>
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
                    <TableHead>Request</TableHead>
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
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDialog(true);
                            }}
                            disabled={updating}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={request.status || "pending"}
                            onValueChange={(value) => handleUpdateStatus(request.id, value)}
                            disabled={updating}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
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

      {/* View Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Receipt Request Details
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
                    <FileText className="h-4 w-4" />
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

              {/* Admin Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Assign Staff */}
                  <div>
                    <Label className="text-sm">Assign to Accounting Staff</Label>
                    <Select
                      value={selectedRequest.assigned_to?.toString() || "unassigned"}
                      onValueChange={(value) => handleAssignStaff(selectedRequest.id, value)}
                      disabled={updating}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select accounting staff" />
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
                          <SelectItem value="" disabled>No accounting staff available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Generate Receipt Button - Only for pending/in_progress */}
                  {(selectedRequest.status === 'pending' || selectedRequest.status === 'in_progress') && (
                    <div className="pt-4 border-t">
                      <Button 
                        onClick={() => {
                          setShowDialog(false);
                          setShowGenerateDialog(true);
                        }}
                        className="w-full"
                        disabled={updating}
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        Generate Receipt
                      </Button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Generate and send receipt to tenant
                      </p>
                    </div>
                  )}

                  {/* Admin Notes (if exists) */}
                  {selectedRequest.admin_notes && (
                    <div className="pt-4 border-t">
                      <Label className="text-sm text-gray-500">Admin Notes</Label>
                      <div className="bg-blue-50 p-3 rounded-md mt-1 border border-blue-100">
                        <p className="whitespace-pre-wrap text-sm">{selectedRequest.admin_notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Resolved At (if resolved) */}
                  {selectedRequest.resolved_at && (
                    <div className="pt-4 border-t">
                      <Label className="text-sm text-gray-500">Completed At</Label>
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

      {/* Generate Receipt Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Generate Receipt
            </DialogTitle>
            <DialogDescription>
              Create receipt for {selectedRequest?.tenant_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="receipt_number">Receipt Number</Label>
                <Input
                  id="receipt_number"
                  value={receiptDetails.receipt_number}
                  onChange={(e) => setReceiptDetails({...receiptDetails, receipt_number: e.target.value})}
                  disabled={updating}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={receiptDetails.amount}
                  onChange={(e) => setReceiptDetails({...receiptDetails, amount: parseFloat(e.target.value) || 0})}
                  disabled={updating}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="payment_date">Payment Date</Label>
              <Input
                id="payment_date"
                type="date"
                value={receiptDetails.payment_date}
                onChange={(e) => setReceiptDetails({...receiptDetails, payment_date: e.target.value})}
                disabled={updating}
              />
            </div>

            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={receiptDetails.payment_method}
                onValueChange={(value) => setReceiptDetails({...receiptDetails, payment_method: value})}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_for">Payment For</Label>
              <Select
                value={receiptDetails.payment_for}
                onValueChange={(value) => setReceiptDetails({...receiptDetails, payment_for: value})}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly Rent">Monthly Rent</SelectItem>
                  <SelectItem value="Security Deposit">Security Deposit</SelectItem>
                  <SelectItem value="Maintenance Charges">Maintenance Charges</SelectItem>
                  <SelectItem value="Electricity Bill">Electricity Bill</SelectItem>
                  <SelectItem value="Water Bill">Water Bill</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={receiptDetails.notes}
                onChange={(e) => setReceiptDetails({...receiptDetails, notes: e.target.value})}
                placeholder="Additional notes about this payment..."
                rows={3}
                disabled={updating}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleGenerateReceipt}
                disabled={updating || !receiptDetails.amount}
                className="flex-1"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4 mr-2" />
                    Generate Receipt
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowGenerateDialog(false)}
                disabled={updating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}