// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { toast } from "sonner";
// import {
//   Home,
//   DollarSign,
//   FileText,
//   Bell,
//   AlertCircle,
//   LogOut,
//   Calendar,
//   CheckCircle,
//   User,
//   Upload,
//   Download,
//   Settings,
//   MessageSquare,
//   FolderOpen,
// } from "lucide-react";

// export default function TenantPortalPageEnhanced() {
//   const router = useRouter();
//   const [tenant, setTenant] = useState<any>(null);
//   const [booking, setBooking] = useState<any>(null);
//   const [payments, setPayments] = useState<any[]>([]);
//   const [complaints, setComplaints] = useState<any[]>([]);
//   const [notifications, setNotifications] = useState<any[]>([]);
//   const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showComplaintDialog, setShowComplaintDialog] = useState(false);
//   const [showLeaveDialog, setShowLeaveDialog] = useState(false);
//   const [showDocumentDialog, setShowDocumentDialog] = useState(false);

//   const [newComplaint, setNewComplaint] = useState({
//     title: "",
//     description: "",
//     category: "maintenance",
//     priority: "medium",
//   });

//   const [leaveRequest, setLeaveRequest] = useState({
//     requested_leave_date: "",
//     reason: "",
//   });

//   const [stats, setStats] = useState({
//     totalPayments: 0,
//     pendingPayments: 0,
//     openComplaints: 0,
//     unreadNotifications: 0,
//   });

//   // -- Auth header helper
//   const getAuthHeaders = () => {
//     const token =
//       typeof window !== "undefined" ? localStorage.getItem("tenant_token") : null;
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   };

//   useEffect(() => {
//     const tenantId = typeof window !== "undefined" ? localStorage.getItem("tenant_id") : null;
//     if (!tenantId) {
//       router.push("/tenant/login");
//       return;
//     }
//     loadTenantData(tenantId);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [router]);

//   // -- Load all data via REST endpoints
//   const loadTenantData = async (tenantId: string) => {
//     setLoading(true);
//     try {
//       const headers = {
//         "Content-Type": "application/json",
//         ...getAuthHeaders(),
//       };

//       // 1) Tenant
//       const tenantRes = await fetch(`/api/tenants/${encodeURIComponent(tenantId)}`, {
//         headers,
//       });
//       if (!tenantRes.ok) {
//         const txt = await tenantRes.text();
//         console.error("Failed to fetch tenant:", txt);
//         // toast.error("Failed to load tenant data");
//         setLoading(false);
//         return;
//       }
//       const tenantData = await tenantRes.json();

//       if (!tenantData?.portal_access_enabled) {
//         toast.error("Portal access is disabled. Please contact admin.");
//         router.push("/tenant/login");
//         return;
//       }
//       setTenant(tenantData);

//       // update last_portal_login (best-effort)
//       fetch(`/api/tenants/${encodeURIComponent(tenantId)}`, {
//         method: "PATCH",
//         headers,
//         body: JSON.stringify({ last_portal_login: new Date().toISOString() }),
//       }).catch((e) => console.warn("Failed to update last_portal_login", e));

//       // parallel fetch: bookings, payments, complaints, notifications, leaveRequests
//       const [
//         bookingsRes,
//         paymentsRes,
//         complaintsRes,
//         notificationsRes,
//         leavesRes,
//       ] = await Promise.all([
//         fetch(`/api/bookings?tenantId=${encodeURIComponent(tenantId)}&limit=1&order=created_at.desc`, {
//           headers,
//         }),
//         fetch(`/api/payments?tenantId=${encodeURIComponent(tenantId)}&order=payment_date.desc`, { headers }),
//         fetch(`/api/complaints?tenantId=${encodeURIComponent(tenantId)}&order=created_at.desc`, { headers }),
//         fetch(`/api/notifications?recipientId=${encodeURIComponent(tenantId)}&recipientType=tenant&order=created_at.desc`, { headers }),
//         fetch(`/api/leave_requests?tenantId=${encodeURIComponent(tenantId)}&order=created_at.desc`, { headers }),
//       ]);

//       const bookingsData = bookingsRes.ok ? await bookingsRes.json() : [];
//       const paymentsData = paymentsRes.ok ? await paymentsRes.json() : [];
//       const complaintsData = complaintsRes.ok ? await complaintsRes.json() : [];
//       const notificationsData = notificationsRes.ok ? await notificationsRes.json() : [];
//       const leaveRequestsData = leavesRes.ok ? await leavesRes.json() : [];

//       if (Array.isArray(bookingsData) && bookingsData.length > 0) setBooking(bookingsData[0]);
//       else setBooking(null);

//       setPayments(Array.isArray(paymentsData) ? paymentsData : []);
//       setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
//       setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
//       setLeaveRequests(Array.isArray(leaveRequestsData) ? leaveRequestsData : []);

//       setStats({
//         totalPayments: Array.isArray(paymentsData) ? paymentsData.length : 0,
//         pendingPayments: Array.isArray(paymentsData) ? paymentsData.filter((p: any) => p.payment_status === "pending").length : 0,
//         openComplaints: Array.isArray(complaintsData) ? complaintsData.filter((c: any) => c.status === "open" || c.status === "in_progress").length : 0,
//         unreadNotifications: Array.isArray(notificationsData) ? notificationsData.filter((n: any) => !n.is_read).length : 0,
//       });
//     } catch (error) {
//       console.error("Failed to load data", error);
//       toast.error("Failed to load data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // -- Logout
//   const handleLogout = () => {
//     if (typeof window !== "undefined") {
//       localStorage.removeItem("tenant_token");
//       localStorage.removeItem("tenant_id");
//       localStorage.removeItem("tenant_email");
//     }
//     router.push("/tenant/login");
//   };

//   // -- Submit complaint
//   const handleSubmitComplaint = async () => {
//     if (!tenant || !booking) return;
//     try {
//       const headers = {
//         "Content-Type": "application/json",
//         ...getAuthHeaders(),
//       };
//       const body = {
//         ...newComplaint,
//         tenant_id: tenant.id,
//         property_id: booking.property_id,
//         room_id: booking.room_id,
//       };

//       const res = await fetch("/api/complaints", {
//         method: "POST",
//         headers,
//         body: JSON.stringify(body),
//       });

//       if (!res.ok) {
//         const txt = await res.text();
//         console.error("Failed to submit complaint:", txt);
//         throw new Error(txt || "Failed");
//       }

//       toast.success("Complaint submitted successfully");
//       setShowComplaintDialog(false);
//       setNewComplaint({ title: "", description: "", category: "maintenance", priority: "medium" });

//       // refresh
//       const tenantId = tenant.id;
//       await loadTenantData(tenantId);
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to submit complaint");
//     }
//   };

//   // -- Submit leave request
//   const handleSubmitLeaveRequest = async () => {
//     if (!tenant || !booking) return;
//     try {
//       const lockInEndDate = booking.lock_in_end_date ? new Date(booking.lock_in_end_date) : null;
//       const requestedDate = new Date(leaveRequest.requested_leave_date);
//       const lockInCompleted = !lockInEndDate || requestedDate >= lockInEndDate;
//       const lockInViolationDays = lockInEndDate && !lockInCompleted
//         ? Math.ceil((lockInEndDate.getTime() - requestedDate.getTime()) / (1000 * 3600 * 24))
//         : 0;

//       const headers = {
//         "Content-Type": "application/json",
//         ...getAuthHeaders(),
//       };

//       const body = {
//         ...leaveRequest,
//         tenant_id: tenant.id,
//         booking_id: booking.id,
//         property_id: booking.property_id,
//         room_id: booking.room_id,
//         lock_in_completed: lockInCompleted,
//         lock_in_violation_days: lockInViolationDays,
//       };

//       const res = await fetch("/api/leave_requests", {
//         method: "POST",
//         headers,
//         body: JSON.stringify(body),
//       });

//       if (!res.ok) {
//         const txt = await res.text();
//         console.error("Failed to create leave request:", txt);
//         throw new Error(txt || "Failed");
//       }

//       if (!lockInCompleted) {
//         toast.error(
//           `Lock-in period not completed. ${lockInViolationDays} days remaining. Your deposit may not be fully refunded.`,
//           { duration: 8000 }
//         );
//       } else {
//         toast.success("Leave request submitted successfully");
//       }

//       setShowLeaveDialog(false);
//       setLeaveRequest({ requested_leave_date: "", reason: "" });

//       // refresh
//       await loadTenantData(tenant.id);
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to submit leave request");
//     }
//   };

//   // -- Mark single notification read
//   const markNotificationRead = async (notificationId: string) => {
//     try {
//       const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
//       const res = await fetch(`/api/notifications/${encodeURIComponent(notificationId)}/mark-read`, {
//         method: "PATCH",
//         headers,
//         body: JSON.stringify({ read_at: new Date().toISOString() }),
//       });
//       if (!res.ok) {
//         const txt = await res.text();
//         console.error("Failed to mark notification read:", txt);
//       }
//       // refresh
//       if (tenant?.id) await loadTenantData(tenant.id);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // -- Mark all notifications read (calls a backend endpoint to mark all)
//   const markAllNotificationsRead = async () => {
//     if (!tenant?.id) return;
//     try {
//       const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
//       const res = await fetch(`/api/notifications/mark-all-read`, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({ recipient_id: tenant.id, recipient_type: "tenant", read_at: new Date().toISOString() }),
//       });

//       if (!res.ok) {
//         const txt = await res.text();
//         console.error("Failed to mark all notifications read:", txt);
//         toast.error("Failed to mark notifications");
//         return;
//       }

//       await loadTenantData(tenant.id);
//       toast.success("All notifications marked as read");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to mark notifications");
//     }
//   };

//   if (loading) return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//       <header className="bg-white border-b shadow-sm">
//         <div className="container mx-auto px-4 py-4 flex justify-between items-center">
//           <div className="flex items-center gap-3">
//             <Home className="h-7 w-7 text-blue-600" />
//             <div>
//               <h1 className="text-xl font-bold">Tenant Portal</h1>
//               <p className="text-xs text-slate-600">Welcome back!</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-4">
//             <span className="text-sm font-medium">{tenant?.full_name || tenant?.name || "-"}</span>
//             <Button variant="outline" size="sm" onClick={handleLogout}>
//               <LogOut className="h-4 w-4 mr-2" />
//               Logout
//             </Button>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-6">
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
//           <Button
//             variant="outline"
//             className="h-20 flex flex-col items-center justify-center gap-2"
//             onClick={() => router.push('/tenant/profile')}
//           >
//             <User className="h-6 w-6" />
//             <span className="font-semibold">My Profile</span>
//           </Button>
//           <Button
//             variant="outline"
//             className="h-20 flex flex-col items-center justify-center gap-2 bg-blue-50 border-blue-200"
//             onClick={() => router.push('/tenant/requests')}
//           >
//             <MessageSquare className="h-6 w-6 text-blue-600" />
//             <span className="font-semibold">My Requests</span>
//           </Button>
//           <Button
//             variant="outline"
//             className="h-20 flex flex-col items-center justify-center gap-2 bg-green-50 border-green-200"
//             onClick={() => router.push('/tenant/my-documents')}
//           >
//             <FolderOpen className="h-6 w-6 text-green-600" />
//             <span className="font-semibold">My Documents</span>
//           </Button>
//           <Button
//             variant="outline"
//             className="h-20 flex flex-col items-center justify-center gap-2"
//             onClick={() => router.push('/tenant/documents')}
//           >
//             <FileText className="h-6 w-6" />
//             <span className="font-semibold">Request Document</span>
//           </Button>
//           <Button
//             variant="outline"
//             className="h-20 flex flex-col items-center justify-center gap-2"
//             onClick={() => router.push('/tenant/settings')}
//           >
//             <Settings className="h-6 w-6" />
//             <span className="font-semibold">Settings</span>
//           </Button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           <Card className="border-l-4 border-l-blue-600">
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-600">
//                 <Home className="h-4 w-4" />
//                 Current Stay
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-lg font-bold">{booking?.properties?.name || "-"}</div>
//               <div className="text-sm text-slate-600">Room {booking?.rooms?.room_number || "-"}</div>
//             </CardContent>
//           </Card>

//           <Card className="border-l-4 border-l-green-600">
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-600">
//                 <DollarSign className="h-4 w-4" />
//                 Payments
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-lg font-bold">{stats.totalPayments}</div>
//               <div className="text-sm text-slate-600">{stats.pendingPayments} pending</div>
//             </CardContent>
//           </Card>

//           <Card className="border-l-4 border-l-orange-600">
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-600">
//                 <AlertCircle className="h-4 w-4" />
//                 Complaints
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-lg font-bold">{stats.openComplaints}</div>
//               <div className="text-sm text-slate-600">Active issues</div>
//             </CardContent>
//           </Card>

//           <Card className="border-l-4 border-l-purple-600">
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-600">
//                 <Bell className="h-4 w-4" />
//                 Notifications
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-lg font-bold">{stats.unreadNotifications}</div>
//               <div className="text-sm text-slate-600">Unread messages</div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
//           <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
//             <DialogTrigger asChild>
//               <Button className="w-full bg-blue-600 hover:bg-blue-700">
//                 <AlertCircle className="h-4 w-4 mr-2" />
//                 Raise Complaint
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Submit Complaint</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-4">
//                 <div>
//                   <Label>Title</Label>
//                   <Input
//                     value={newComplaint.title}
//                     onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <Label>Category</Label>
//                   <Select
//                     value={newComplaint.category}
//                     onValueChange={(value) => setNewComplaint({ ...newComplaint, category: value })}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="maintenance">Maintenance</SelectItem>
//                       <SelectItem value="cleanliness">Cleanliness</SelectItem>
//                       <SelectItem value="noise">Noise</SelectItem>
//                       <SelectItem value="security">Security</SelectItem>
//                       <SelectItem value="amenities">Amenities</SelectItem>
//                       <SelectItem value="billing">Billing</SelectItem>
//                       <SelectItem value="other">Other</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label>Priority</Label>
//                   <Select
//                     value={newComplaint.priority}
//                     onValueChange={(value) => setNewComplaint({ ...newComplaint, priority: value })}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="low">Low</SelectItem>
//                       <SelectItem value="medium">Medium</SelectItem>
//                       <SelectItem value="high">High</SelectItem>
//                       <SelectItem value="urgent">Urgent</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label>Description</Label>
//                   <Textarea
//                     value={newComplaint.description}
//                     onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
//                     rows={4}
//                   />
//                 </div>
//                 <Button onClick={handleSubmitComplaint} className="w-full">
//                   Submit Complaint
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>

//           <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
//             <DialogTrigger asChild>
//               <Button variant="outline" className="w-full">
//                 <Calendar className="h-4 w-4 mr-2" />
//                 Request Leave
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Submit Leave Request</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-4">
//                 {booking?.lock_in_end_date && (
//                   <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
//                     <p className="text-sm font-medium">Lock-in Period Info</p>
//                     <p className="text-sm">Ends on: {new Date(booking.lock_in_end_date).toLocaleDateString()}</p>
//                     <p className="text-xs text-yellow-700 mt-1">
//                       Leaving before this date may result in deposit forfeiture
//                     </p>
//                   </div>
//                 )}
//                 <div>
//                   <Label>Requested Leave Date</Label>
//                   <Input
//                     type="date"
//                     value={leaveRequest.requested_leave_date}
//                     onChange={(e) => setLeaveRequest({ ...leaveRequest, requested_leave_date: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <Label>Reason</Label>
//                   <Textarea
//                     value={leaveRequest.reason}
//                     onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
//                     rows={3}
//                   />
//                 </div>
//                 <Button onClick={handleSubmitLeaveRequest} className="w-full">
//                   Submit Request
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>

//           <Button variant="outline" className="w-full">
//             <FileText className="h-4 w-4 mr-2" />
//             View Agreement
//           </Button>
//         </div>

//         <Tabs defaultValue="payments" className="space-y-4">
//           <TabsList className="grid w-full grid-cols-4">
//             <TabsTrigger value="payments">Payments</TabsTrigger>
//             <TabsTrigger value="complaints">Complaints</TabsTrigger>
//             <TabsTrigger value="leave">Leave Requests</TabsTrigger>
//             <TabsTrigger value="notifications">Notifications</TabsTrigger>
//           </TabsList>

//           <TabsContent value="payments">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Payment History</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   {payments.length > 0 ? (
//                     payments.map((payment) => (
//                       <div key={payment.id} className="flex justify-between items-center border-b pb-3 last:border-0">
//                         <div>
//                           <p className="font-medium">{payment.payment_for}</p>
//                           <p className="text-sm text-slate-600">{new Date(payment.payment_date).toLocaleDateString()}</p>
//                         </div>
//                         <div className="text-right">
//                           <p className="font-bold text-lg">₹{Number(payment.amount).toLocaleString()}</p>
//                           <Badge variant={payment.payment_status === "completed" ? "default" : "destructive"}>
//                             {payment.payment_status}
//                           </Badge>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-center text-slate-500 py-8">No payment history</p>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="complaints">
//             <Card>
//               <CardHeader>
//                 <CardTitle>My Complaints</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {complaints.length > 0 ? (
//                     complaints.map((complaint) => (
//                       <div key={complaint.id} className="border rounded-lg p-4">
//                         <div className="flex justify-between items-start mb-2">
//                           <div>
//                             <p className="font-medium text-lg">{complaint.title}</p>
//                             <div className="flex gap-2 mt-2">
//                               <Badge variant="outline">{complaint.category}</Badge>
//                               <Badge variant="secondary">{complaint.priority}</Badge>
//                             </div>
//                           </div>
//                           <Badge
//                             variant={
//                               complaint.status === "resolved" ? "default" :
//                                 complaint.status === "in_progress" ? "secondary" : "destructive"
//                             }
//                           >
//                             {complaint.status}
//                           </Badge>
//                         </div>
//                         <p className="text-sm text-slate-600 mt-2">{complaint.description}</p>
//                         {complaint.resolution_notes && (
//                           <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
//                             <p className="text-sm font-medium text-green-900 flex items-center gap-2">
//                               <CheckCircle className="h-4 w-4" />
//                               Resolution
//                             </p>
//                             <p className="text-sm text-green-800 mt-1">{complaint.resolution_notes}</p>
//                           </div>
//                         )}
//                         <p className="text-xs text-slate-400 mt-2">Submitted on {new Date(complaint.created_at).toLocaleString()}</p>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-center text-slate-500 py-8">No complaints submitted</p>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="leave">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Leave Requests</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {leaveRequests.length > 0 ? (
//                     leaveRequests.map((request) => (
//                       <div key={request.id} className="border rounded-lg p-4">
//                         <div className="flex justify-between items-start mb-2">
//                           <div>
//                             <p className="font-medium">Leave Date: {new Date(request.requested_leave_date).toLocaleDateString()}</p>
//                             <p className="text-sm text-slate-600 mt-1">{request.reason}</p>
//                           </div>
//                           <Badge
//                             variant={
//                               request.status === "approved" ? "default" :
//                                 request.status === "rejected" ? "destructive" : "secondary"
//                             }
//                           >
//                             {request.status}
//                           </Badge>
//                         </div>
//                         {!request.lock_in_completed && (
//                           <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
//                             <p className="font-medium text-yellow-900">Lock-in violation: {request.lock_in_violation_days} days</p>
//                           </div>
//                         )}
//                         {request.approval_notes && (
//                           <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
//                             <p className="font-medium">Admin Notes:</p>
//                             <p className="text-slate-700">{request.approval_notes}</p>
//                           </div>
//                         )}
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-center text-slate-500 py-8">No leave requests</p>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="notifications">
//             <Card>
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <CardTitle>Notifications</CardTitle>
//                   {stats.unreadNotifications > 0 && (
//                     <Button size="sm" variant="outline" onClick={markAllNotificationsRead}>Mark All Read</Button>
//                   )}
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   {notifications.length > 0 ? (
//                     notifications.map((notification) => (
//                       <div
//                         key={notification.id}
//                         className={`p-4 rounded border ${notification.is_read ? "bg-white" : "bg-blue-50 border-blue-200"} cursor-pointer hover:shadow-sm transition-shadow`}
//                         onClick={() => !notification.is_read && markNotificationRead(notification.id)}
//                       >
//                         <div className="flex justify-between items-start">
//                           <div className="flex-1">
//                             <p className="font-medium">{notification.title}</p>
//                             <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
//                             <p className="text-xs text-slate-400 mt-2">{new Date(notification.created_at).toLocaleString()}</p>
//                           </div>
//                           {!notification.is_read && <Badge variant="default" className="ml-2">New</Badge>}
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-center text-slate-500 py-8">No notifications</p>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// }



// app/tenant/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import roomacLogo from '@/app/src/assets/images/roomaclogo.webp';
import { useRouter, usePathname } from "@/src/compat/next-navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Home,
  DollarSign,
  FileText,
  Bell,
  AlertCircle,
  LogOut,
  Calendar,
  CheckCircle,
  User,
  Upload,
  Download,
  Settings,
  MessageSquare,
  FolderOpen,
  Menu,
  X,
  Shield,
  Wifi,
  Users,
  Coffee,
  Building,
  Bed,
  Clock,
  CreditCard,
  FileCheck,
  HelpCircle,
  Phone,
  Mail,
  ChevronDown,
  Star,
  TrendingUp,
  BarChart3,
  Receipt,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Search,
  Sun,
  Moon,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Zap,
  Target,
  TrendingDown,
  Thermometer,
  Droplets,
  Wind,
  Battery,
  ShieldCheck,
  ClipboardCheck,
  Users2,
  ParkingCircle,
  Dumbbell,
  Tv,
  Microwave,
  Refrigerator,
  Armchair,
  Lamp,
  Fan,
} from "lucide-react";

// Tenant Header Component (with Notification Popup)
function TenantHeader({
  tenantName,
  tenantEmail = "tenant@example.com",
  notificationCount,
  onLogout,
  onNotificationsClick,
  sidebarCollapsed,
  onToggleSidebar,
}: {
  tenantName: string;
  tenantEmail?: string;
  notificationCount: number;
  onLogout: () => void;
  onNotificationsClick: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [notificationDetailsOpen, setNotificationDetailsOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "Rent Payment Reminder",
      message: "Your rent payment is due in 7 days",
      time: "2 hours ago",
      read: false,
      type: "payment",
      details: {
        amount: "₹15,000",
        dueDate: "2024-02-05",
        status: "pending",
        category: "rent",
        description: "Your monthly rent payment for February 2024 is due in 7 days. Please ensure payment is made by the due date to avoid late fees.",
        paymentMethod: "Online Banking",
        referenceNumber: "PAY-2024-001"
      },
      timestamp: "2024-01-25T09:00:00Z"
    },
    {
      id: 2,
      title: "Complaint Update",
      message: "Your maintenance request is now in progress",
      time: "1 day ago",
      read: false,
      type: "maintenance",
      details: {
        complaintId: "COMP001",
        status: "in_progress",
        assignedTo: "Maintenance Team",
        estimatedCompletion: "2024-01-28",
        complaintTitle: "AC Not Working",
        description: "AC in bedroom is not cooling properly",
        priority: "high",
        technician: "John Smith",
        contact: "+91 9876543210"
      },
      timestamp: "2024-01-24T14:30:00Z"
    },
    {
      id: 3,
      title: "Community Event",
      message: "Monthly dinner party this Friday at 7 PM",
      time: "3 days ago",
      read: true,
      type: "event",
      details: {
        date: "2024-01-26",
        time: "7:00 PM",
        venue: "Common Hall",
        rsvpRequired: true,
        description: "Join us for our monthly community dinner. Food and drinks will be provided. Please RSVP by Thursday.",
        organizer: "PG Management",
        contact: "Mr. Sharma - +91 9876543211"
      },
      timestamp: "2024-01-22T11:00:00Z"
    },
    {
      id: 4,
      title: "Document Ready",
      message: "Your rental agreement has been updated",
      time: "5 days ago",
      read: true,
      type: "document",
      details: {
        documentType: "Rental Agreement",
        version: "2.0",
        actionRequired: true,
        expiryDate: "2024-12-31",
        description: "Your rental agreement has been updated with new terms and conditions. Please review and acknowledge.",
        downloadLink: "/documents/agreement.pdf",
        size: "2.5 MB"
      },
      timestamp: "2024-01-20T16:45:00Z"
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    setNotificationDetailsOpen(true);
    setNotificationsOpen(false);
    
    // Mark as read
    if (!notification.read) {
      console.log("Marking notification as read:", notification.id);
    }
  };

  const markAllAsRead = () => {
    console.log("Marking all notifications as read");
    toast.success("All notifications marked as read");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case "maintenance":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "event":
        return <Calendar className="h-4 w-4 text-green-600" />;
      case "document":
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-blue-50 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">

            {/* ================= LEFT ================= */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onToggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="hidden lg:flex items-center gap-3">
                <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">PG</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Tenant Dashboard
                  </h2>
                  <p className="text-xs text-slate-500">
                    Premium Tenant Dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* ================= RIGHT ================= */}
            <div className="flex items-center gap-2 sm:gap-3">

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Search className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="hidden sm:inline-flex"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:inline-flex"
              >
                <HelpCircle className="h-6 w-6" />
              </Button>

              {/* ================= NOTIFICATIONS ================= */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                    >
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Badge>
                  )}
                </Button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                    {/* Notification Popup Header */}
                    <div className="p-3 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-blue-600" />
                          <p className="font-semibold text-sm">Notifications</p>
                          {notificationCount > 0 && (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0 h-5">
                              {notificationCount}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="h-6 text-xs hover:bg-slate-100"
                        >
                          Mark all read
                        </Button>
                      </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                              notification.read ? 'bg-slate-100' : 'bg-blue-100'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-sm text-slate-900 leading-tight">
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-1"></div>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-2">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* View All Button */}
                    <div className="p-3 border-t border-slate-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 text-xs"
                        onClick={onNotificationsClick}
                      >
                        View all notifications
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* ================= PROFILE ================= */}
              <div className="flex items-center gap-2">

                {/* PROFILE IMAGE (STATIC URL) */}
                <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="hidden sm:block">
                  <p className="text-xm font-medium text-slate-900">
                    {tenantName || "John Doe"}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Notification Details Dialog */}
      <Dialog open={notificationDetailsOpen} onOpenChange={setNotificationDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    selectedNotification.read ? 'bg-slate-100' : 'bg-blue-100'
                  }`}>
                    {getNotificationIcon(selectedNotification.type)}
                  </div>
                  <div>
                    <DialogTitle className="text-lg">{selectedNotification.title}</DialogTitle>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {new Date(selectedNotification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700">{selectedNotification.message}</p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Details</h4>
                  
                  {selectedNotification.type === "payment" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-slate-500">Amount</Label>
                          <p className="font-semibold text-green-600">{selectedNotification.details.amount}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Due Date</Label>
                          <p className="font-semibold">{selectedNotification.details.dueDate}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Description</Label>
                        <p className="text-sm text-slate-700 mt-1">{selectedNotification.details.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-slate-500">Payment Method</Label>
                          <p className="text-sm font-medium">{selectedNotification.details.paymentMethod}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Reference</Label>
                          <p className="text-sm font-medium font-mono">{selectedNotification.details.referenceNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedNotification.type === "maintenance" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-slate-500">Complaint ID</Label>
                          <p className="font-semibold">{selectedNotification.details.complaintId}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Status</Label>
                          <Badge 
                            variant={selectedNotification.details.status === "in_progress" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {selectedNotification.details.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Issue</Label>
                        <p className="text-sm font-semibold">{selectedNotification.details.complaintTitle}</p>
                        <p className="text-sm text-slate-600 mt-1">{selectedNotification.details.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-slate-500">Assigned To</Label>
                          <p className="text-sm font-medium">{selectedNotification.details.assignedTo}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Technician</Label>
                          <p className="text-sm font-medium">{selectedNotification.details.technician}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Contact</Label>
                        <p className="text-sm font-medium">{selectedNotification.details.contact}</p>
                      </div>
                    </div>
                  )}

                  {selectedNotification.type === "event" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-slate-500">Date</Label>
                          <p className="font-semibold">{selectedNotification.details.date}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Time</Label>
                          <p className="font-semibold">{selectedNotification.details.time}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Venue</Label>
                        <p className="text-sm font-medium">{selectedNotification.details.venue}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Description</Label>
                        <p className="text-sm text-slate-700 mt-1">{selectedNotification.details.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-slate-500">Organizer</Label>
                          <p className="text-sm font-medium">{selectedNotification.details.organizer}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">RSVP Required</Label>
                          <Badge variant={selectedNotification.details.rsvpRequired ? "default" : "outline"}>
                            {selectedNotification.details.rsvpRequired ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedNotification.type === "document" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-slate-500">Document Type</Label>
                          <p className="font-semibold">{selectedNotification.details.documentType}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Version</Label>
                          <p className="font-semibold">{selectedNotification.details.version}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Description</Label>
                        <p className="text-sm text-slate-700 mt-1">{selectedNotification.details.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-slate-500">Expiry Date</Label>
                          <p className="text-sm font-medium">{selectedNotification.details.expiryDate}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">File Size</Label>
                          <p className="text-sm font-medium">{selectedNotification.details.size}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Action Required</Label>
                        <Badge variant={selectedNotification.details.actionRequired ? "destructive" : "default"}>
                          {selectedNotification.details.actionRequired ? "Immediate Action" : "No Action Required"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setNotificationDetailsOpen(false)}
                >
                  Close
                </Button>
                {selectedNotification.type === "payment" && (
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                )}
                {selectedNotification.type === "document" && (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
                {selectedNotification.type === "event" && (
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    RSVP Now
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function TenantDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [tenant, setTenant] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: "",
    category: "maintenance",
    priority: "medium",
  });

  const [leaveRequest, setLeaveRequest] = useState({
    requested_leave_date: "",
    reason: "",
  });

  // Enhanced stats
  const [stats, setStats] = useState({
    totalPayments: 8,
    pendingPayments: 2,
    openComplaints: 1,
    unreadNotifications: 3,
    daysUntilRentDue: 7,
    rentAmount: 15000,
    occupancyDays: 45,
    depositAmount: 30000,
    nextDueDate: "2024-02-05",
    maintenanceScore: 8.5,
    cleanlinessScore: 9.0,
    communityScore: 8.7,
  });

  // Professional metrics
  const [metrics, setMetrics] = useState([
    { 
      label: "Monthly Spending", 
      value: "₹45,000", 
      change: "+12%", 
      icon: TrendingUp, 
      color: "text-green-600", 
      bgColor: "bg-green-50",
      trend: "positive"
    },
    { 
      label: "Avg Response Time", 
      value: "4.2h", 
      change: "-18%", 
      icon: Clock, 
      color: "text-blue-600", 
      bgColor: "bg-blue-50",
      trend: "positive"
    },
    { 
      label: "Satisfaction Score", 
      value: "4.8/5", 
      change: "+2%", 
      icon: Star, 
      color: "text-yellow-600", 
      bgColor: "bg-yellow-50",
      trend: "positive"
    },
    { 
      label: "Occupancy Rate", 
      value: "92%", 
      change: "+5%", 
      icon: TrendingUp, 
      color: "text-purple-600", 
      bgColor: "bg-purple-50",
      trend: "positive"
    },
  ]);

  // Complete PG amenities
  const pgAmenities = [
    { icon: <Wifi className="h-4 w-4" />, name: "High-Speed WiFi", available: true, status: "500 Mbps", uptime: "99.9%" },
    { icon: <Coffee className="h-4 w-4" />, name: "Daily Mess", available: true, status: "3 Meals", rating: "4.5/5" },
    { icon: <Shield className="h-4 w-4" />, name: "24/7 Security", available: true, status: "Guarded", cameras: "8" },
    { icon: <Users className="h-4 w-4" />, name: "Laundry Service", available: true, status: "Weekly", next: "Tomorrow" },
    { icon: <ParkingCircle className="h-4 w-4" />, name: "Parking", available: true, status: "Available", slots: "4/6" },
    { icon: <Dumbbell className="h-4 w-4" />, name: "Gym", available: true, status: "24/7 Access", equipment: "Full" },
    { icon: <Tv className="h-4 w-4" />, name: "TV Lounge", available: true, status: "HD TV", channels: "150+" },
    { icon: <Microwave className="h-4 w-4" />, name: "Kitchen", available: true, status: "Fully Equipped", type: "Common" },
  ];

  // Room amenities
  const roomAmenities = [
    { icon: <Bed className="h-4 w-4" />, name: "Bed", available: true, status: "Queen Size" },
    { icon: <Refrigerator className="h-4 w-4" />, name: "Refrigerator", available: true, status: "Personal" },
    { icon: <Armchair className="h-4 w-4" />, name: "Study Table", available: true, status: "With Chair" },
    { icon: <Lamp className="h-4 w-4" />, name: "LED Lights", available: true, status: "Dimmable" },
    { icon: <Fan className="h-4 w-4" />, name: "Ceiling Fan", available: true, status: "With Remote" },
    { icon: <Thermometer className="h-4 w-4" />, name: "AC", available: true, status: "1.5 Ton" },
  ];

  // Navigation items with routes
  const navigationItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: Home, 
      active: true, 
      badge: null,
      href: "/tenant/dashboard"
    },
    { 
      id: "payments", 
      label: "Payments", 
      icon: CreditCard, 
      badge: stats.pendingPayments > 0 ? `${stats.pendingPayments}` : null,
      tab: "payments"
    },
    { 
      id: "documents", 
      label: "Documents", 
      icon: FileCheck, 
      badge: null,
      href: "/tenant/documents"
    },
    { 
      id: "complaints", 
      label: "Complaints", 
      icon: AlertCircle, 
      badge: stats.openComplaints > 0 ? `${stats.openComplaints}` : null,
      tab: "complaints"
    },
    { 
      id: "my-documents", 
      label: "My Documents", 
      icon: FolderOpen, 
      badge: null,
      href: "/tenant/my-documents"
    },
    { 
      id: "requests", 
      label: "Requests", 
      icon: MessageSquare, 
      badge: null,
      href: "/tenant/requests"
    },
    { 
      id: "notifications", 
      label: "Notifications", 
      icon: Bell, 
      badge: stats.unreadNotifications > 0 ? `${stats.unreadNotifications}` : null,
      tab: "notifications"
    },
    { 
      id: "profile", 
      label: "Profile", 
      icon: User, 
      badge: null,
      href: "/tenant/profile"
    },
    { 
      id: "support", 
      label: "Support", 
      icon: HelpCircle, 
      badge: null,
      href: "/tenant/support"
    },
  ];

  const recentActivities = [
    { id: 1, type: "payment", title: "Rent Payment", description: "January 2024 rent", amount: "₹15,000", status: "completed", time: "2 hours ago", icon: CreditCard, color: "text-green-600", bgColor: "bg-green-50" },
    { id: 2, type: "complaint", title: "AC Repair", description: "Bedroom AC not cooling", status: "in_progress", time: "1 day ago", icon: AlertCircle, color: "text-orange-600", bgColor: "bg-orange-50" },
    { id: 3, type: "document", title: "Agreement Renewal", description: "Annual agreement signed", status: "completed", time: "3 days ago", icon: FileCheck, color: "text-blue-600", bgColor: "bg-blue-50" },
    { id: 4, type: "maintenance", title: "Room Cleaning", description: "Monthly deep cleaning", status: "scheduled", time: "5 days ago", icon: Settings, color: "text-yellow-600", bgColor: "bg-yellow-50" },
    { id: 5, type: "payment", title: "Maintenance Fee", description: "Monthly maintenance", amount: "₹1,500", status: "pending", time: "6 days ago", icon: CreditCard, color: "text-red-600", bgColor: "bg-red-50" },
  ];

  // Sample payments data
  const samplePayments = [
    { id: 1, payment_for: "Rent - January 2024", amount: 15000, payment_date: "2024-01-01", payment_status: "completed" },
    { id: 2, payment_for: "Maintenance - January 2024", amount: 1500, payment_date: "2024-01-05", payment_status: "completed" },
    { id: 3, payment_for: "Rent - February 2024", amount: 15000, payment_date: "2024-02-01", payment_status: "pending" },
    { id: 4, payment_for: "Electricity Bill - January", amount: 1200, payment_date: "2024-01-15", payment_status: "completed" },
    { id: 5, payment_for: "Security Deposit", amount: 30000, payment_date: "2023-12-01", payment_status: "completed" },
  ];

  // Sample complaints data
  const sampleComplaints = [
    { id: 1, title: "AC Not Working", description: "AC in bedroom is not cooling properly", category: "maintenance", priority: "high", status: "in_progress", created_at: "2024-01-20", resolution_notes: "Technician scheduled for tomorrow" },
    { id: 2, title: "Water Leakage", description: "Water leaking from bathroom ceiling", category: "plumbing", priority: "urgent", status: "resolved", created_at: "2024-01-15", resolution_notes: "Fixed by plumber on Jan 16" },
    { id: 3, title: "WiFi Issue", description: "Internet speed very slow in evening", category: "internet", priority: "medium", status: "open", created_at: "2024-01-25", resolution_notes: null },
  ];

  // -- Auth header helper
  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("tenant_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const storage = typeof window !== "undefined" ? window : null;
    const tenantIdFromStorage = storage ? localStorage.getItem("tenant_id") || sessionStorage.getItem("tenant_id") : null;
    const tenantToken = storage ? localStorage.getItem("tenant_token") || sessionStorage.getItem("tenant_token") : null;
    const tenantEmail = storage ? localStorage.getItem("tenant_email") || sessionStorage.getItem("tenant_email") : null;

    // No token and no tenant_id → not logged in, redirect and stop loading
    if (!tenantToken && !tenantIdFromStorage) {
      setLoading(false);
      router.push("/tenant/login");
      return;
    }

    // Use tenant_id from storage, or fallback to "me" when we have token (e.g. login didn't set tenant_id)
    const tenantId = tenantIdFromStorage || "me";
    if (!tenantIdFromStorage && storage) {
      try {
        localStorage.setItem("tenant_id", tenantId);
        sessionStorage.setItem("tenant_id", tenantId);
      } catch (_) {}
    }

    setLoading(true);

    const mockTenant = {
      id: tenantId,
      full_name: "John Doe",
      email: tenantEmail || "tenant@example.com",
      phone: "+91 9876543210",
      portal_access_enabled: true,
    };

    const mockBooking = {
      id: "BOOK001",
      properties: { name: "ROOMAC PG" },
      rooms: { room_number: "302" },
      check_in_date: "2023-12-01",
      lock_in_end_date: "2024-06-01",
      property_id: "PROP001",
      room_id: "ROOM302",
    };

    const timer = setTimeout(() => {
      setTenant(mockTenant);
      setBooking(mockBooking);
      setPayments(samplePayments);
      setComplaints(sampleComplaints);
      setNotifications([]);
      setLeaveRequests([]);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
    // Run only once on mount so the 800ms timer is not reset by router reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tenant_token");
      localStorage.removeItem("tenant_id");
      localStorage.removeItem("tenant_email");
      sessionStorage.removeItem("tenant_token");
      sessionStorage.removeItem("tenant_id");
      sessionStorage.removeItem("tenant_email");
    }
    router.push("/tenant/login");
    toast.success("Logged out successfully");
  };

  const handleSubmitComplaint = async () => {
    if (!tenant || !booking) return;
    
    try {
      // Simulate API call
      const newComplaintData = {
        id: Date.now(),
        ...newComplaint,
        tenant_id: tenant.id,
        property_id: booking.property_id,
        room_id: booking.room_id,
        status: "open",
        created_at: new Date().toISOString(),
      };

      setComplaints([newComplaintData, ...complaints]);
      setStats(prev => ({ ...prev, openComplaints: prev.openComplaints + 1 }));
      
      toast.success("Complaint submitted successfully");
      setShowComplaintDialog(false);
      setNewComplaint({ title: "", description: "", category: "maintenance", priority: "medium" });
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit complaint");
    }
  };

  const handleSubmitLeaveRequest = async () => {
    if (!tenant || !booking) return;
    
    try {
      const lockInEndDate = booking.lock_in_end_date ? new Date(booking.lock_in_end_date) : null;
      const requestedDate = new Date(leaveRequest.requested_leave_date);
      const lockInCompleted = !lockInEndDate || requestedDate >= lockInEndDate;
      const lockInViolationDays = lockInEndDate && !lockInCompleted
        ? Math.ceil((lockInEndDate.getTime() - requestedDate.getTime()) / (1000 * 3600 * 24))
        : 0;

      const newLeaveRequest = {
        id: Date.now(),
        ...leaveRequest,
        tenant_id: tenant.id,
        booking_id: booking.id,
        property_id: booking.property_id,
        room_id: booking.room_id,
        lockInCompleted,
        lockInViolationDays,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      setLeaveRequests([newLeaveRequest, ...leaveRequests]);

      if (!lockInCompleted) {
        toast.error(
          `Lock-in period not completed. ${lockInViolationDays} days remaining. Your deposit may not be fully refunded.`,
          { duration: 8000 }
        );
      } else {
        toast.success("Leave request submitted successfully");
      }

      setShowLeaveDialog(false);
      setLeaveRequest({ requested_leave_date: "", reason: "" });
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit leave request");
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      console.log("Marking notification as read:", notificationId);
      if (stats.unreadNotifications > 0) {
        setStats(prev => ({ ...prev, unreadNotifications: prev.unreadNotifications - 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      setStats(prev => ({ ...prev, unreadNotifications: 0 }));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark notifications");
    }
  };

  const handleViewAgreement = () => {
    toast.info("Opening rental agreement...");
    // Implement agreement viewing logic
  };

  const handleDownloadInvoice = () => {
    toast.success("Invoice download started");
    // Implement invoice download logic
  };

  // Function to handle navigation
  const handleNavigation = (item: any) => {
    if (item.href) {
      router.push(item.href);
    } else if (item.tab) {
      setActiveTab(item.tab);
    }
  };

  // Check if item is active
  const isItemActive = (item: any) => {
    if (item.href) {
      return pathname === item.href;
    } else if (item.tab) {
      return activeTab === item.tab;
    }
    return false;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-6 text-slate-700 font-medium">Loading your professional dashboard...</p>
        <p className="text-sm text-slate-500 mt-2">Please wait while we prepare everything</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          bg-blue-50 border-r border-slate-200
          shadow-xl transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          flex flex-col
        `}
      >
        {/* ================= HEADER WITH LOGO ================= */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-center">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between w-full px-4">
              <div className="flex items-center gap-3">
                <div className="h-25 w-25 mt-2 flex items-center justify-center">
                  <img 
                    src={roomacLogo.src}
                    alt="ROOMAC"
                    className="h-14 w-auto object-contain"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(true)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(false)}
                className="h-8 w-8 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <div key={item.id} className="relative group">
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation(item)}
                  className={`
                    w-full flex items-center rounded-xl transition-all
                    ${sidebarCollapsed ? 'h-11 justify-center' : 'h-11 justify-start px-3'}
                    ${isItemActive(item)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'text-slate-700'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />

                  {!sidebarCollapsed && (
                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                  )}

                  {/* Notification badge */}
                  {!sidebarCollapsed && item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Button>

                {/* Tooltip for collapsed sidebar */}
                {sidebarCollapsed && (
                  <span
                    className="
                      absolute left-16 top-1/2 -translate-y-1/2
                      bg-slate-900 text-white text-xs
                      px-2 py-1 rounded
                      opacity-0 group-hover:opacity-100
                      transition whitespace-nowrap z-50
                    "
                  >
                    {item.label}
                    {item.badge && (
                      <span className="ml-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* ================= PG DETAILS (OPEN ONLY) ================= */}
        {!sidebarCollapsed && (
          <div className="px-3 py-3 border-t border-slate-200">
            <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-sm">
              
              {/* Compact Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-700">My PG Details</h3>
                  <p className="text-[10px] text-slate-500">Residency</p>
                </div>
              </div>

              {/* Compact Details */}
              <div className="space-y-2.5">
                {/* PG Name - More Compact */}
                <div className="bg-blue-100 rounded-lg p-2.5 border border-slate-100">
                  <div className="text-[11px] text-slate-500 mb-0.5">PG Name</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    <span className="text-xs font-semibold text-slate-800">
                      {booking?.properties?.name || 'Roomac PG '}
                    </span>
                  </div>
                </div>

                {/* Room & Rent - More Compact */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-blue-100 rounded-lg p-2.5 border border-slate-100">
                    <div className="text-[11px] text-slate-500 mb-0.5">Room</div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      <span className="text-xs font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        #{booking?.rooms?.room_number || '302'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-2.5 border border-slate-100">
                    <div className="text-[11px] text-slate-500 mb-0.5">Monthly Rent</div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      <span className="text-xs font-bold text-emerald-700">
                        ₹{stats.rentAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compact Days Left Banner */}
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-center">
                    <div className="text-[11px] font-medium text-white mb-0.5">Next payment in</div>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-xl font-bold text-white">{stats.daysUntilRentDue}</span>
                      <div className="text-left">
                        <div className="text-[11px] font-semibold text-white">Days</div>
                        <div className="text-[9px] text-amber-100">Left</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= FOOTER ================= */}
        <div className="border-t border-slate-200 py-3 px-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              onClick={() => router.push('/tenant/settings')}
              className={`w-full rounded-xl transition-all ${
                sidebarCollapsed ? 'h-11 justify-center' : 'h-11 justify-start px-3'
              } text-slate-600 hover:bg-slate-100`}
            >
              <Settings className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">Settings</span>}
            </Button>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className={`w-full rounded-xl transition-all ${
                sidebarCollapsed ? 'h-11 justify-center' : 'h-11 justify-start px-3'
              } text-red-600 hover:bg-red-50`}
            >
              <LogOut className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`
        transition-all duration-300
        ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
        min-h-screen
      `}>
        {/* Professional Header */}
        <TenantHeader
          tenantName={tenant?.full_name || "Guest"}
          tenantEmail={tenant?.email}
          notificationCount={stats.unreadNotifications}
          onLogout={handleLogout}
          onNotificationsClick={() => setActiveTab("notifications")}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <main className="p-2 sm:p-4 md:p-5">
          {/* Welcome Section - More Compact */}
          <div className="mb-2 relative group">
            <div className="absolute inset-0 bg-slate-100/50 rounded-lg blur-xl group-hover:blur-2xl transition-all"></div>
            
            <div className="relative p-4 rounded-lg border border-slate-200/80 bg-white/80 backdrop-blur-sm  transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="text-3xl animate-wave">👋</span>
                    </div>
                    <div>
                      <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                        Hey, <span className="text-blue-600">{tenant?.full_name?.split(" ")[0] || "Tenant"}</span>
                      </h1>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Active session • Dashboard overview
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button size="sm" className="relative overflow-hidden bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all group">
                  <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></span>
                  <Download className="h-3.5 w-3.5 mr-1.5 relative z-10" />
                  <span className="relative z-10 text-sm font-medium">Export</span>
                </Button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes wave {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(15deg); }
              75% { transform: rotate(-15deg); }
            }
            .animate-wave {
              animation: wave 2.5s ease-in-out infinite;
              display: inline-block;
              transform-origin: 70% 70%;
            }
          `}</style>


          

          {/* Key Metrics Grid - More Compact and Attractive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {/* Rent Due Card */}
            <Card className="border border-blue-200/50 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">Rent Due</p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-lg font-bold text-slate-900">{stats.daysUntilRentDue}</p>
                        <span className="text-xs font-medium text-slate-500">days</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Amount</p>
                    <p className="text-base font-bold text-blue-700">₹{stats.rentAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Today</span>
                    <span className="font-medium">{stats.nextDueDate}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-1.5 transition-all duration-500" 
                      style={{ width: `${Math.min((stats.daysUntilRentDue / 30) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issues Card */}
            <Card className="border border-orange-200/50 bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">Open Issues</p>
                      <p className="text-lg font-bold text-slate-900">{stats.openComplaints}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Urgent</p>
                    <Badge variant="destructive" className="text-xs px-2 py-0.5">1</Badge>
                  </div>
                </div>
                <div className="mt-3 flex gap-1">
                  <div className="flex-1 bg-amber-100 rounded-lg p-1.5 text-center">
                    <p className="text-xs font-semibold text-amber-900">In Progress</p>
                    <p className="text-xs text-amber-700">1</p>
                  </div>
                  <div className="flex-1 bg-orange-100 rounded-lg p-1.5 text-center">
                    <p className="text-xs font-semibold text-orange-900">Pending</p>
                    <p className="text-xs text-orange-700">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payments Card */}
            <Card className="border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">Pending</p>
                      <p className="text-lg font-bold text-slate-900">{stats.pendingPayments}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Total</p>
                    <p className="text-base font-bold text-emerald-700">₹1,500</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 h-7 text-xs">
                    <CreditCard className="h-3 w-3 mr-1.5" />
                    Pay Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PG Performance Card */}
            <Card className="border border-purple-200/50 bg-gradient-to-br from-purple-50 to-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">PG Rating</p>
                      <p className="text-lg font-bold text-slate-900">4.8</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +0.5
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: "Clean", score: stats.cleanlinessScore, color: "bg-emerald-400" },
                    { label: "Maint", score: stats.maintenanceScore, color: "bg-blue-400" },
                    { label: "Commu", score: stats.communityScore, color: "bg-purple-400" },
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs font-bold text-slate-900">{item.score}</div>
                      <div className="text-[10px] text-slate-600">{item.label}</div>
                      <div className="h-1 rounded-full bg-slate-200 mt-1">
                        <div className={`h-1 rounded-full ${item.color}`} style={{ width: `${item.score * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Button 
              variant="outline" 
              className="h-11 justify-start border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
              onClick={() => setShowComplaintDialog(true)}
            >
              <div className="h-7 w-7 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-slate-700">Raise Complaint</p>
                <p className="text-[10px] text-slate-500">Report any issues</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-11 justify-start border-green-200 hover:border-green-400 hover:bg-green-50 transition-all"
              onClick={() => setShowLeaveDialog(true)}
            >
              <div className="h-7 w-7 rounded-md bg-green-100 flex items-center justify-center mr-3">
                <Calendar className="h-3.5 w-3.5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-slate-700">Request Leave</p>
                <p className="text-[10px] text-slate-500">Vacation or early leave</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-11 justify-start border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
              onClick={handleViewAgreement}
            >
              <div className="h-7 w-7 rounded-md bg-purple-100 flex items-center justify-center mr-3">
                <FileText className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-slate-700">View Agreement</p>
                <p className="text-[10px] text-slate-500">Rental contract</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-11 justify-start border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all"
              onClick={handleDownloadInvoice}
            >
              <div className="h-7 w-7 rounded-md bg-amber-100 flex items-center justify-center mr-3">
                <Receipt className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-slate-700">Download Invoice</p>
                <p className="text-[10px] text-slate-500">Payment receipts</p>
              </div>
            </Button>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 p-0.5 rounded-lg w-full overflow-x-auto shadow-sm">
              <TabsTrigger value="dashboard" className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all flex-1 text-sm py-2">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="payments" className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white transition-all flex-1 text-sm py-2">
                <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="complaints" className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white transition-all flex-1 text-sm py-2">
                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                Complaints
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white transition-all flex-1 text-sm py-2">
                <Bell className="h-3.5 w-3.5 mr-1.5" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {/* Left Column - Recent Activity - Ab 50% width */}
  <div>
    <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all h-full">
      <CardHeader className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <div className="h-5 w-5 rounded-md bg-blue-100 flex items-center justify-center">
              <Clock className="h-3 w-3 text-blue-600" />
            </div>
            Recent Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 text-xs px-2"
          >
            View All
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="px-4 py-3 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`${activity.bgColor} p-1.5 rounded-md shrink-0`}>
                  <activity.icon className={`h-3.5 w-3.5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{activity.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{activity.description}</p>
                      {activity.amount && (
                        <p className="text-sm font-semibold text-green-600 mt-1">{activity.amount}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        activity.status === "completed"
                          ? "default"
                          : activity.status === "in_progress"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px] px-2 py-0 h-5"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>

  {/* Right Column - Quick Actions & Amenities - Ab 50% width */}
  <div className="space-y-4">
    {/* Quick Actions */}
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Zap className="h-4 w-4 text-orange-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start h-9 text-sm border-blue-200 hover:border-blue-400 hover:bg-blue-50">
                <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                Raise Complaint
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="pb-2">
                <DialogTitle className="text-sm">Submit Complaint</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium">Title</Label>
                  <Input
                    value={newComplaint.title}
                    onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">Category</Label>
                    <Select value={newComplaint.category} onValueChange={(value) => setNewComplaint({ ...newComplaint, category: value })}>
                      <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="cleanliness">Cleanliness</SelectItem>
                        <SelectItem value="noise">Noise</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="amenities">Amenities</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Priority</Label>
                    <Select value={newComplaint.priority} onValueChange={(value) => setNewComplaint({ ...newComplaint, priority: value })}>
                      <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium">Description</Label>
                  <Textarea
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                    rows={3}
                    className="mt-1 text-sm"
                  />
                </div>
                <Button onClick={handleSubmitComplaint} className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm">
                  Submit Complaint
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start h-9 text-sm hover:bg-slate-50">
                <Calendar className="h-4 w-4 mr-2" />
                Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="pb-2">
                <DialogTitle className="text-sm">Submit Leave Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {booking?.lock_in_end_date && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs">
                    <p className="font-semibold text-yellow-900">Lock-in Period Info</p>
                    <p className="text-yellow-800">Ends: {new Date(booking.lock_in_end_date).toLocaleDateString()}</p>
                    <p className="text-[10px] text-yellow-700">Leaving early may forfeit deposit</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs font-medium">Requested Leave Date</Label>
                  <Input
                    type="date"
                    value={leaveRequest.requested_leave_date}
                    onChange={(e) => setLeaveRequest({ ...leaveRequest, requested_leave_date: e.target.value })}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Reason</Label>
                  <Textarea
                    value={leaveRequest.reason}
                    onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
                    rows={3}
                    className="mt-1 text-sm"
                  />
                </div>
                <Button onClick={handleSubmitLeaveRequest} className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm">
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>

    {/* Room Amenities */}
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Home className="h-4 w-4 text-blue-600" />
          Room Amenities
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-2">
          {roomAmenities.map((amenity, index) => (
            <div key={index} className="flex flex-col items-center p-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
              <div className="h-7 w-7 rounded-md bg-blue-50 flex items-center justify-center mb-1">
                {amenity.icon}
              </div>
              <p className="text-xs font-semibold text-slate-900 text-center">{amenity.name}</p>
              <p className="text-[10px] text-slate-500">{amenity.status}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
</div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              <Card className="border border-slate-200/80 shadow-sm">
                <CardHeader className="px-4 py-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle className="text-base font-semibold">Payment History</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="hover:bg-slate-50 h-8 text-xs">
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Export
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 text-xs">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Make Payment
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {samplePayments.map((payment) => (
                      <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-200/80 rounded-lg hover:shadow-sm hover:border-slate-300 transition-all bg-white">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-slate-900">{payment.payment_for}</p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {new Date(payment.payment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-2 sm:mt-0">
                          <p className="font-bold text-base text-green-700">₹{Number(payment.amount).toLocaleString()}</p>
                          <Badge variant={payment.payment_status === "completed" ? "default" : "destructive"} className="shrink-0 text-xs">
                            {payment.payment_status}
                          </Badge>
                          <Button variant="ghost" size="icon" className="hover:bg-slate-100 h-8 w-8">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Complaints Tab */}
            <TabsContent value="complaints" className="space-y-4">
              <Card className="border border-slate-200/80 shadow-sm">
                <CardHeader className="px-4 py-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle className="text-base font-semibold">My Complaints</CardTitle>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                      onClick={() => setShowComplaintDialog(true)}
                    >
                      <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                      New Complaint
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {complaints.map((complaint) => (
                      <div key={complaint.id} className="border border-slate-200/80 rounded-lg p-3 hover:shadow-sm hover:border-slate-300 transition-all bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                          <div>
                            <p className="font-semibold text-sm text-slate-900 leading-tight">{complaint.title}</p>
                            <div className="flex gap-1.5 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5">{complaint.category}</Badge>
                              <Badge variant={
                                complaint.priority === "urgent" ? "destructive" :
                                complaint.priority === "high" ? "default" : "secondary"
                              } className="text-[10px] px-2 py-0.5 h-5">
                                {complaint.priority}
                              </Badge>
                            </div>
                          </div>
                          <Badge
                            variant={
                              complaint.status === "resolved" ? "default" :
                              complaint.status === "in_progress" ? "secondary" : "destructive"
                            }
                            className="sm:self-start shrink-0 text-xs"
                          >
                            {complaint.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{complaint.description}</p>
                        {complaint.resolution_notes && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-xs font-semibold text-green-900 flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Resolution Notes
                            </p>
                            <p className="text-xs text-green-800 mt-0.5 leading-relaxed">{complaint.resolution_notes}</p>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 mt-3">
                          Submitted {new Date(complaint.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card className="border border-slate-200/80 shadow-sm">
                <CardHeader className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Notifications</CardTitle>
                    {stats.unreadNotifications > 0 && (
                      <Button size="sm" variant="outline" onClick={markAllNotificationsRead} className="hover:bg-slate-50 h-8 text-xs">
                        Mark All Read
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {[
                      { id: 1, title: "Rent Payment Reminder", message: "Your rent payment is due in 7 days", created_at: "2024-01-25T09:00:00Z", is_read: false },
                      { id: 2, title: "Complaint Update", message: "Your maintenance request is now in progress", created_at: "2024-01-24T14:30:00Z", is_read: false },
                      { id: 3, title: "Community Event", message: "Monthly dinner party this Friday at 7 PM", created_at: "2024-01-22T11:00:00Z", is_read: true },
                      { id: 4, title: "Document Ready", message: "Your rental agreement has been updated", created_at: "2024-01-20T16:45:00Z", is_read: true },
                    ].map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${
                          notification.is_read 
                            ? "bg-white border-slate-200/80 hover:border-slate-300" 
                            : "bg-blue-50 border-blue-200 hover:border-blue-300"
                        } cursor-pointer hover:shadow-sm transition-all`}
                        onClick={() => !notification.is_read && markNotificationRead(notification.id as any)}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-slate-900 leading-tight">{notification.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notification.message}</p>
                            <p className="text-[10px] text-slate-400 mt-2">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="shrink-0">
                              <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}





// app/tenant/portal/page.tsx
// import { Suspense } from "react";
// import TenantDashboardClient from "@/components/tenant/portal/TenantDashboardClient";
// import LoadingSpinner from "@/components/tenant/portal/loading-spinner";


// // This stays exactly the same as your original design
// const initialData = {
//   tenant: {
//     id: "TEN001",
//     full_name: "John Doe",
//     email: "john.doe@example.com",
//     phone: "+91 9876543210",
//     portal_access_enabled: true,
//   },
//   booking: {
//     id: "BOOK001",
//     properties: { name: "ROOMAC PG" },
//     rooms: { room_number: "302" },
//     check_in_date: "2023-12-01",
//     lock_in_end_date: "2024-06-01",
//     property_id: "PROP001",
//     room_id: "ROOM302",
//   },
//   payments: [
//     { id: 1, payment_for: "Rent - January 2024", amount: 15000, payment_date: "2024-01-01", payment_status: "completed" },
//     { id: 2, payment_for: "Maintenance - January 2024", amount: 1500, payment_date: "2024-01-05", payment_status: "completed" },
//     { id: 3, payment_for: "Rent - February 2024", amount: 15000, payment_date: "2024-02-01", payment_status: "pending" },
//     { id: 4, payment_for: "Electricity Bill - January", amount: 1200, payment_date: "2024-01-15", payment_status: "completed" },
//     { id: 5, payment_for: "Security Deposit", amount: 30000, payment_date: "2023-12-01", payment_status: "completed" },
//   ],
//   complaints: [
//     { id: 1, title: "AC Not Working", description: "AC in bedroom is not cooling properly", category: "maintenance", priority: "high", status: "in_progress", created_at: "2024-01-20", resolution_notes: "Technician scheduled for tomorrow" },
//     { id: 2, title: "Water Leakage", description: "Water leaking from bathroom ceiling", category: "plumbing", priority: "urgent", status: "resolved", created_at: "2024-01-15", resolution_notes: "Fixed by plumber on Jan 16" },
//     { id: 3, title: "WiFi Issue", description: "Internet speed very slow in evening", category: "internet", priority: "medium", status: "open", created_at: "2024-01-25", resolution_notes: null },
//   ],
//   stats: {
//     totalPayments: 8,
//     pendingPayments: 2,
//     openComplaints: 1,
//     unreadNotifications: 3,
//     daysUntilRentDue: 7,
//     rentAmount: 15000,
//     occupancyDays: 45,
//     depositAmount: 30000,
//     nextDueDate: "2024-02-05",
//     maintenanceScore: 8.5,
//     cleanlinessScore: 9.0,
//     communityScore: 8.7,
//   },
//   notifications: [],
//   leaveRequests: [],
// };

// export default function TenantPortalPage() {
//   return (
//     <Suspense fallback={<LoadingSpinner message="Loading your dashboard..." />}>
//       <TenantDashboardClient initialData={initialData} />
//     </Suspense>
//   );
// }




