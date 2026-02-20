
// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   CreditCard,
//   FileText,
//   Bell,
//   AlertCircle,
//   Calendar,
//   Building,
//   MapPin,
//   Phone,
//   Mail,
//   ChevronRight,
//   Wifi,
//   Coffee,
//   Users,
//   User,
// } from "lucide-react";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
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
//   getTenantToken,
//   getTenantId,
//   type TenantProfile,
// } from "@/lib/tenantAuthApi";
// import { tenantDetailsApi } from "@/lib/tenantDetailsApi";
// import {
//   getMyTenantRequests,
//   createTenantRequest,
//   getComplaintCategories,
//   getComplaintReasons,
//   getLeaveTypes,
//   type TenantRequest,
//   type ComplaintCategory,
//   type ComplaintReason,
//   type LeaveType,
// } from "@/lib/tenantRequestsApi";

// // ─── Types ────────────────────────────────────────────────────────────────────
// // Assets
// import roomacLogo from "@/app/src/assets/images/roomaclogo.webp";
// import { useAuth } from "@/context/authContext";

// interface DashboardStats {
//   totalPaid: number;
//   totalPending: number;
//   pendingCount: number;
//   openComplaints: number;
//   unreadNotifications: number;
//   daysUntilRentDue: number;
//   monthlyRent: number;
//   occupancyDays: number;
//   nextDueDate: string;
//   urgentComplaints: number;
//   inProgressComplaints: number;
// }

// interface Payment {
//   id: string;
//   amount: number;
//   description: string;
//   payment_date: string;
//   payment_method: string;
//   status: "completed" | "pending" | "failed";
//   due_date?: string;
// }

// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   type: "payment" | "complaint" | "event" | "document" | "general";
//   is_read: boolean;
//   created_at: string;
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const formatDate = (date: string) => {
//   if (!date) return "—";
//   return new Date(date).toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const formatCurrency = (amount: number) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount);

// // ─── Mock data ────────────────────────────────────────────────────────────────

// const MOCK_PAYMENTS: Payment[] = [
//   {
//     id: "1",
//     amount: 12000,
//     description: "Monthly Rent - February 2026",
//     payment_date: "2026-02-05T10:30:00Z",
//     payment_method: "Credit Card",
//     status: "completed",
//     due_date: "2026-02-10",
//   },
//   {
//     id: "2",
//     amount: 12000,
//     description: "Monthly Rent - January 2026",
//     payment_date: "2026-01-05T09:15:00Z",
//     payment_method: "UPI",
//     status: "completed",
//     due_date: "2026-01-10",
//   },
//   {
//     id: "3",
//     amount: 5000,
//     description: "Maintenance Deposit",
//     payment_date: "2025-12-15T14:20:00Z",
//     payment_method: "Bank Transfer",
//     status: "completed",
//   },
// ];

// const MOCK_NOTIFICATIONS: Notification[] = [
//   {
//     id: "1",
//     title: "Rent Payment Reminder",
//     message: "Your rent payment of ₹12,000 is due in 7 days",
//     type: "payment",
//     is_read: false,
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "2",
//     title: "Complaint Update",
//     message: "Your maintenance request #123 is now in progress",
//     type: "complaint",
//     is_read: false,
//     created_at: new Date(Date.now() - 86400000).toISOString(),
//   },
//   {
//     id: "3",
//     title: "Document Verified",
//     message: "Your Aadhar card has been verified successfully",
//     type: "document",
//     is_read: true,
//     created_at: new Date(Date.now() - 172800000).toISOString(),
//   },
// ];

// // ─── Main Component ───────────────────────────────────────────────────────────

// export default function TenantPortalPage() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Active tab — hash se decide hoga (#payments, #notifications)
//   const getTabFromHash = () => {
//     const hash = location.hash.replace("#", "");
//     if (["dashboard", "payments", "notifications"].includes(hash)) return hash;
//     return "dashboard";
//   };

//   const [activeTab, setActiveTab] = useState(getTabFromHash());

//   // Hash change hone par tab update karo
//   useEffect(() => {
//     setActiveTab(getTabFromHash());
//   }, [location.hash]);

//   // Tab change hone par URL hash update karo
//   const handleTabChange = (tab: string) => {
//     setActiveTab(tab);
//     navigate(`/tenant/portal#${tab}`, { replace: true });
//   };

//   // Data state
//   const [loading, setLoading] = useState(true);
//   const [loadingTimeout, setLoadingTimeout] = useState(false);
//   const [tenant, setTenant] = useState<TenantProfile | null>(null);
//   const [payments, setPayments] = useState<Payment[]>([]);
//   const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
//   const [complaintCategories, setComplaintCategories] = useState<ComplaintCategory[]>([]);
//   const [complaintReasons, setComplaintReasons] = useState<ComplaintReason[]>([]);
//   const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState("");

//   // Dialogs
//   const [showComplaintDialog, setShowComplaintDialog] = useState(false);
//   const [showLeaveDialog, setShowLeaveDialog] = useState(false);
//   const [showPaymentDialog, setShowPaymentDialog] = useState(false);

//   // Stats
//   const [stats, setStats] = useState<DashboardStats>({
//     totalPaid: 24500,
//     totalPending: 12000,
//     pendingCount: 1,
//     openComplaints: 2,
//     unreadNotifications: 3,
//     daysUntilRentDue: 7,
//     monthlyRent: 12000,
//     occupancyDays: 245,
//     nextDueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
//     urgentComplaints: 1,
//     inProgressComplaints: 1,
//   });

//   // Forms
//   const [selectedCategory, setSelectedCategory] = useState<string>("");
//   const { logout } = useAuth()
//   // Form states
//   const [newComplaint, setNewComplaint] = useState({
//     title: "", description: "", category: "", reason: "", priority: "medium",
//   });
//   const [leaveRequest, setLeaveRequest] = useState({
//     leave_type: "", leave_start_date: "", leave_end_date: "",
//     reason: "", contact_address: "", emergency_contact: "",
//   });
//   const [newPayment, setNewPayment] = useState({
//     amount: "", description: "", payment_method: "card",
//   });

//   // Loading timeout
//   useEffect(() => {
//     const id = setTimeout(() => {
//       if (loading) {
//         setLoadingTimeout(true);
//         toast.error("Loading is taking too long. Please refresh.");
//       }
//     }, 15000);
//     return () => clearTimeout(id);
//   }, [loading]);

//   // Fetch data
//   const fetchAllData = useCallback(async () => {
//     setLoading(true);
//     setLoadingTimeout(false);
//     try {
//       const token = getTenantToken();
//       const tenantId = getTenantId();
//       if (!token || !tenantId) {
//         router.push('/login');
//         return;
//       }

//       const [profileRes, requestsRes, categoriesRes, leaveTypesRes] =
//         await Promise.allSettled([
//           tenantDetailsApi.loadProfile(),
//           getMyTenantRequests(),
//           getComplaintCategories(),
//           getLeaveTypes(),
//         ]);

//       if (profileRes.status === "fulfilled" && profileRes.value?.success) {
//         const d = profileRes.value.data;
//         setTenant(d);

//         const totalPaid = d.payments?.filter((p: any) => p.status === "completed")
//           .reduce((s: number, p: any) => s + p.amount, 0) ?? 24500;
//         const totalPending = d.payments?.filter((p: any) => p.status === "pending")
//           .reduce((s: number, p: any) => s + p.amount, 0) ?? 12000;
//         const pendingCount = d.payments?.filter((p: any) => p.status === "pending").length ?? 1;

//         let daysUntilRentDue = 7;
//         let nextDueDate = new Date(Date.now() + 7 * 86400000).toISOString();
//         if (d.check_in_date) {
//           const dueDay = new Date(d.check_in_date).getDate();
//           const today = new Date();
//           let nextDue = new Date(today.getFullYear(), today.getMonth(), dueDay);
//           if (today.getDate() > dueDay)
//             nextDue = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
//           daysUntilRentDue = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 3600 * 24));
//           nextDueDate = nextDue.toISOString();
//         }

//         const occupancyDays = d.check_in_date
//           ? Math.ceil((Date.now() - new Date(d.check_in_date).getTime()) / (1000 * 3600 * 24))
//           : 245;

//         setStats(prev => ({
//           ...prev,
//           totalPaid, totalPending, pendingCount,
//           daysUntilRentDue,
//           monthlyRent: d.monthly_rent ?? 12000,
//           occupancyDays, nextDueDate,
//         }));
//       }

//       if (requestsRes.status === "fulfilled" && requestsRes.value) {
//         const data: TenantRequest[] = requestsRes.value;
//         const c = data.filter(r => r.request_type === "complaint" || r.request_type === "maintenance");
//         setStats(prev => ({
//           ...prev,
//           openComplaints: c.filter(x => x.status === "pending" || x.status === "in_progress").length,
//           urgentComplaints: c.filter(x => x.priority === "urgent" && x.status !== "resolved").length,
//           inProgressComplaints: c.filter(x => x.status === "in_progress").length,
//         }));
//       }

//       if (categoriesRes.status === "fulfilled" && categoriesRes.value)
//         setComplaintCategories(categoriesRes.value);
//       if (leaveTypesRes.status === "fulfilled" && leaveTypesRes.value)
//         setLeaveTypes(leaveTypesRes.value);

//       setPayments(MOCK_PAYMENTS);
//     } catch {
//       toast.error("Failed to load dashboard data");
//       setPayments(MOCK_PAYMENTS);
//     } finally {
//       setLoading(false);
//     }
//   }, [navigate]);

//   useEffect(() => { fetchAllData(); }, [fetchAllData]);

//   useEffect(() => {
//     if (selectedCategory)
//       getComplaintReasons(parseInt(selectedCategory))
//         .then(setComplaintReasons)
//         .catch(console.error);
//   }, [selectedCategory]);

//   const handleLogout = useCallback(async () => {
//     await logoutTenant();
//     localStorage.clear()
//     router.push('/login');
//     logout()
//   }, []);

//   const handleSubmitComplaint = useCallback(async () => {
//     if (!newComplaint.title || !newComplaint.description || !newComplaint.category) {
//       toast.error("Please fill in all required fields");
//       return;
//     }
//     try {
//       await createTenantRequest({
//         request_type: "complaint",
//         title: newComplaint.title,
//         description: newComplaint.description,
//         priority: newComplaint.priority as any,
//         complaint_data: {
//           category_master_type_id: parseInt(newComplaint.category),
//           reason_master_value_id: newComplaint.reason ? parseInt(newComplaint.reason) : undefined,
//         },
//       });
//       toast.success("Complaint submitted successfully");
//       setShowComplaintDialog(false);
//       setNewComplaint({ title: "", description: "", category: "", reason: "", priority: "medium" });
//       fetchAllData();
//     } catch (e: any) {
//       toast.error(e.message || "Failed to submit complaint");
//     }
//   }, [newComplaint, fetchAllData]);

//   const handleSubmitLeaveRequest = useCallback(async () => {
//     if (!leaveRequest.leave_type || !leaveRequest.leave_start_date || !leaveRequest.reason) {
//       toast.error("Please fill in all required fields");
//       return;
//     }
//     try {
//       await createTenantRequest({
//         request_type: "leave",
//         title: `Leave Request - ${leaveRequest.leave_type}`,
//         description: leaveRequest.reason,
//         priority: "medium",
//         leave_data: {
//           leave_type: leaveRequest.leave_type,
//           leave_start_date: leaveRequest.leave_start_date,
//           leave_end_date: leaveRequest.leave_end_date || leaveRequest.leave_start_date,
//           total_days: leaveRequest.leave_end_date
//             ? Math.ceil((new Date(leaveRequest.leave_end_date).getTime() - new Date(leaveRequest.leave_start_date).getTime()) / (1000 * 3600 * 24)) + 1
//             : 1,
//           contact_address_during_leave: leaveRequest.contact_address,
//           emergency_contact_number: leaveRequest.emergency_contact,
//         },
//       });
//       toast.success("Leave request submitted successfully");
//       setShowLeaveDialog(false);
//       setLeaveRequest({ leave_type: "", leave_start_date: "", leave_end_date: "", reason: "", contact_address: "", emergency_contact: "" });
//       fetchAllData();
//     } catch (e: any) {
//       toast.error(e.message || "Failed to submit leave request");
//     }
//   }, [leaveRequest, fetchAllData]);

//   const handleSubmitPayment = useCallback(() => {
//     if (!newPayment.amount || !newPayment.description) {
//       toast.error("Please fill in all required fields");
//       return;
//     }
//     toast.success("Payment initiated successfully");
//     setShowPaymentDialog(false);
//     const record: Payment = {
//       id: Date.now().toString(),
//       amount: parseFloat(newPayment.amount),
//       description: newPayment.description,
//       payment_date: new Date().toISOString(),
//       payment_method: newPayment.payment_method === "card" ? "Credit Card" : "UPI",
//       status: "pending",
//     };
//     setPayments(prev => [record, ...prev]);
//     setNewPayment({ amount: "", description: "", payment_method: "card" });
//   }, [newPayment]);

//   const handleMarkAllRead = useCallback(() => {
//     setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
//     setStats(prev => ({ ...prev, unreadNotifications: 0 }));
//     toast.success("All notifications marked as read");
//   }, []);

//   // ─── Loading ───────────────────────────────────────────────────────────────

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
//         <div className="flex flex-col items-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0149ab] border-t-transparent" />
//           <p className="mt-4 text-slate-600">Loading your dashboard...</p>
//           {loadingTimeout && (
//             <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-4">
//               Refresh Page
//             </Button>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // ─── Render ────────────────────────────────────────────────────────────────

//   return (
//     <div className="p-4 sm:p-6">
//       {/* Welcome Banner */}
//       <div className="mb-6 bg-[#0149ab] rounded-xl p-4 sm:p-6 text-white">
//         <h1 className="text-xl sm:text-2xl font-bold mb-1">
//           Hey, {tenant?.full_name?.split(" ")[0] || "Rahul"}! 👋
//         </h1>
//         <p className="text-blue-100 text-sm sm:text-base flex items-center gap-2">
//           <Building className="h-4 w-4 shrink-0" />
//           <span className="truncate">
//             {tenant?.property_name || "Roomac Heights"} · Room{" "}
//             {tenant?.room_number || "204"} · Bed {tenant?.bed_number || "1"}
//           </span>
//         </p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
//         {[
//           { label: "Monthly Rent", value: formatCurrency(stats.monthlyRent), sub: `Due in ${stats.daysUntilRentDue} days` },
//           { label: "Total Paid", value: formatCurrency(stats.totalPaid), sub: "All time" },
//           { label: "Days Staying", value: stats.occupancyDays, sub: `Since ${formatDate(tenant?.check_in_date || "2024-01-15")}` },
//           { label: "Room Type", value: tenant?.preferred_sharing || "Double", sub: "Sharing", capitalize: true },
//         ].map((card) => (
//           <Card key={card.label} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
//             <CardContent className="p-4 sm:p-5">
//               <p className="text-xs sm:text-sm text-slate-500 mb-1">{card.label}</p>
//               <p className={`text-lg sm:text-2xl font-bold text-slate-900 ${card.capitalize ? "capitalize" : ""}`}>
//                 {card.value}
//               </p>
//               <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Action Buttons */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
//         <Button variant="outline"
//           className="h-auto py-3 sm:py-4 flex flex-col items-center gap-1 sm:gap-2 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0149ab] shadow-sm"
//           onClick={() => setShowComplaintDialog(true)}>
//           <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#0149ab]" />
//           <span className="text-xs sm:text-sm font-medium">Raise Complaint</span>
//         </Button>

//         <Button variant="outline"
//           className="h-auto py-3 sm:py-4 flex flex-col items-center gap-1 sm:gap-2 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0149ab] shadow-sm"
//           onClick={() => setShowLeaveDialog(true)}>
//           <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-[#0149ab]" />
//           <span className="text-xs sm:text-sm font-medium">Request Leave</span>
//         </Button>

//         <Button variant="outline"
//           className="h-auto py-3 sm:py-4 flex flex-col items-center gap-1 sm:gap-2 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0149ab] shadow-sm"
//           onClick={() => navigate("/tenant/documents")}>
//           <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-[#0149ab]" />
//           <span className="text-xs sm:text-sm font-medium">Documents</span>
//         </Button>

//         <Button
//           className="h-auto py-3 sm:py-4 flex flex-col items-center gap-1 sm:gap-2 bg-[#0149ab] hover:bg-[#0149ab]/90 text-white border-none shadow-sm"
//           onClick={() => {
//             handleTabChange("payments");
//             setShowPaymentDialog(true);
//           }}>
//           <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
//           <span className="text-xs sm:text-sm font-medium">Make Payment</span>
//         </Button>
//       </div>

//       {/* Main Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left — Tabs */}
//         <div className="lg:col-span-2 space-y-6">
//           <Tabs value={activeTab} onValueChange={handleTabChange}>
//             <TabsList className="bg-white border border-slate-200 p-1 rounded-lg w-full grid grid-cols-3">
//               <TabsTrigger value="dashboard"
//                 className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white data-[state=inactive]:text-slate-600 transition-all text-xs sm:text-sm py-2 sm:py-2.5">
//                 Dashboard
//               </TabsTrigger>
//               <TabsTrigger value="payments"
//                 className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white data-[state=inactive]:text-slate-600 transition-all text-xs sm:text-sm py-2 sm:py-2.5">
//                 Payments
//               </TabsTrigger>
//               <TabsTrigger value="notifications"
//                 className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white data-[state=inactive]:text-slate-600 transition-all text-xs sm:text-sm py-2 sm:py-2.5">
//                 <span className="flex items-center gap-1">
//                   Notifications
//                   {stats.unreadNotifications > 0 && (
//                     <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0 h-4">
//                       {stats.unreadNotifications}
//                     </Badge>
//                   )}
//                 </span>
//               </TabsTrigger>
//             </TabsList>

//             {/* ── Dashboard Tab ─────────────────────────────────────── */}
//             <TabsContent value="dashboard" className="space-y-6 mt-4">
//               <Card className="border border-slate-200 shadow-sm">
//                 <CardHeader className="pb-2 px-4 sm:px-6">
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-sm sm:text-base font-semibold">Recent Payments</CardTitle>
//                     <Button variant="ghost" size="sm"
//                       className="text-[#0149ab] hover:bg-blue-50 text-xs sm:text-sm"
//                       onClick={() => handleTabChange("payments")}>
//                       View All <ChevronRight className="h-3 w-3 ml-1" />
//                     </Button>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="px-4 sm:px-6">
//                   {payments.length > 0 ? (
//                     <div className="space-y-3">
//                       {payments.slice(0, 3).map((p) => (
//                         <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg gap-2">
//                           <div>
//                             <p className="font-medium text-sm text-slate-900">{p.description}</p>
//                             <p className="text-xs text-slate-500 mt-1">{formatDate(p.payment_date)} · {p.payment_method}</p>
//                           </div>
//                           <div className="flex items-center gap-3">
//                             <p className="font-bold text-sm text-slate-900">{formatCurrency(p.amount)}</p>
//                             <Badge variant="outline" className={`text-xs ${p.status === "completed" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
//                               {p.status}
//                             </Badge>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-center py-8">
//                       <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
//                       <p className="text-slate-500 text-sm">No payment history</p>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>

//               <Card className="border border-slate-200 shadow-sm">
//                 <CardHeader className="pb-2 px-4 sm:px-6">
//                   <CardTitle className="text-sm sm:text-base font-semibold">Amenities History</CardTitle>
//                 </CardHeader>
//                 <CardContent className="px-4 sm:px-6">
//                   <div className="space-y-2 sm:space-y-3">
//                     {[
//                       { icon: Wifi, label: "WiFi - Last used: Today" },
//                       { icon: Coffee, label: "Laundry - Last used: 2 days ago" },
//                       { icon: Users, label: "Gym - Last used: 5 days ago" },
//                     ].map(({ icon: Icon, label }) => (
//                       <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
//                         <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
//                         <span className="text-xs sm:text-sm font-medium">{label}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* ── Payments Tab ──────────────────────────────────────── */}
//             <TabsContent value="payments" className="space-y-6 mt-4">
//               <Button className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-10 sm:h-12" onClick={() => setShowPaymentDialog(true)}>
//                 <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
//                 Make a Payment
//               </Button>
//               <Card className="border border-slate-200 shadow-sm">
//                 <CardHeader className="px-4 sm:px-6">
//                   <CardTitle className="text-base sm:text-lg font-semibold">Payment History</CardTitle>
//                 </CardHeader>
//                 <CardContent className="px-4 sm:px-6">
//                   {payments.length > 0 ? (
//                     <div className="space-y-3 sm:space-y-4">
//                       {payments.map((p) => (
//                         <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg gap-2">
//                           <div>
//                             <p className="font-medium text-sm text-slate-900">{p.description}</p>
//                             <div className="flex flex-wrap items-center gap-2 mt-1">
//                               <span className="text-xs text-slate-500">{formatDate(p.payment_date)}</span>
//                               <span className="text-xs text-slate-400">•</span>
//                               <span className="text-xs text-slate-500">{p.payment_method}</span>
//                               {p.due_date && (<><span className="text-xs text-slate-400">•</span><span className="text-xs text-slate-500">Due: {formatDate(p.due_date)}</span></>)}
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-3">
//                             <p className="font-bold text-sm text-slate-900">{formatCurrency(p.amount)}</p>
//                             <Badge variant="outline" className={`text-xs ${p.status === "completed" ? "bg-green-50 text-green-700 border-green-200" : p.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"}`}>
//                               {p.status}
//                             </Badge>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-center py-8">
//                       <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
//                       <p className="text-slate-500 text-sm">No payment history</p>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* ── Notifications Tab ─────────────────────────────────── */}
//             <TabsContent value="notifications" className="space-y-6 mt-4">
//               <Card className="border border-slate-200 shadow-sm">
//                 <CardHeader className="px-4 sm:px-6">
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-base sm:text-lg font-semibold">All Notifications</CardTitle>
//                     {stats.unreadNotifications > 0 && (
//                       <Button variant="ghost" size="sm" className="text-[#0149ab] hover:bg-blue-50 text-xs sm:text-sm" onClick={handleMarkAllRead}>
//                         Mark all as read
//                       </Button>
//                     )}
//                   </div>
//                 </CardHeader>
//                 <CardContent className="px-4 sm:px-6">
//                   {notifications.length > 0 ? (
//                     <div className="space-y-3">
//                       {notifications.map((n) => (
//                         <div key={n.id} className={`p-4 rounded-lg border ${!n.is_read ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"}`}>
//                           <div className="flex items-start gap-3">
//                             <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${n.is_read ? "bg-slate-100" : "bg-blue-100"}`}>
//                               {n.type === "payment" && <CreditCard className="h-4 w-4 text-blue-600" />}
//                               {n.type === "complaint" && <AlertCircle className="h-4 w-4 text-orange-600" />}
//                               {n.type === "document" && <FileText className="h-4 w-4 text-purple-600" />}
//                               {(n.type === "general" || n.type === "event") && <Bell className="h-4 w-4 text-gray-600" />}
//                             </div>
//                             <div className="flex-1">
//                               <div className="flex items-start justify-between">
//                                 <p className="font-medium text-sm text-slate-900">{n.title}</p>
//                                 {!n.is_read && <div className="h-2 w-2 bg-blue-600 rounded-full mt-1" />}
//                               </div>
//                               <p className="text-sm text-slate-600 mt-1">{n.message}</p>
//                               <p className="text-xs text-slate-400 mt-2">
//                                 {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-center py-8">
//                       <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
//                       <p className="text-slate-500 text-sm">No notifications</p>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         </div>

//         {/* Right Column */}
//         <div className="space-y-6">
//           {/* Accommodation */}
//           <Card className="bg-[#0149ab] text-white border-none shadow-lg">
//             <CardHeader className="pb-2 px-4 sm:px-6">
//               <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2 text-white">
//                 <Building className="h-4 w-4 sm:h-5 sm:w-5" />
//                 Your Accommodation
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="px-4 sm:px-6 space-y-4">
//               <div>
//                 <p className="font-semibold text-base sm:text-xl">{tenant?.property_name || "Roomac Heights"}</p>
//                 <p className="text-xs sm:text-sm text-blue-100 flex items-center gap-1 mt-1">
//                   <MapPin className="h-3 w-3 shrink-0" />
//                   <span className="truncate">{tenant?.property_address || "45, Linking Road, Bandra"}, {tenant?.property_city || "Mumbai"}</span>
//                 </p>
//               </div>
//               <div className="grid grid-cols-2 gap-3 sm:gap-4">
//                 {[
//                   { label: "ROOM NO.", value: tenant?.room_number || "204" },
//                   { label: "BED NO.", value: tenant?.bed_number || "1" },
//                   { label: "RENT/MONTH", value: formatCurrency(stats.monthlyRent) },
//                   { label: "FLOOR", value: `Floor ${tenant?.floor || "3"}` },
//                 ].map(({ label, value }) => (
//                   <div key={label} className="bg-blue-600/20 rounded-lg p-2 sm:p-3">
//                     <p className="text-[10px] sm:text-xs text-blue-200">{label}</p>
//                     <p className="text-lg sm:text-2xl font-bold">{value}</p>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Contract Details */}
//           <Card className="border border-slate-200 shadow-sm">
//             <CardHeader className="pb-2 px-4 sm:px-6">
//               <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
//                 <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
//                 Contract Details
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="px-4 sm:px-6">
//               <div className="space-y-2 sm:space-y-3">
//                 {[
//                   { label: "Check-in", value: formatDate(tenant?.check_in_date || "2024-01-15") },
//                   { label: "Lock-in", value: `${tenant?.lockin_period_months || "6"} months` },
//                   { label: "Notice", value: `${tenant?.notice_period_days || "30"} days` },
//                   { label: "Amenities", value: tenant?.amenities || "WiFi, AC, Laundry, Food, Gym" },
//                 ].map(({ label, value }, i, arr) => (
//                   <div key={label} className={`flex justify-between py-2 ${i < arr.length - 1 ? "border-b border-slate-100" : ""}`}>
//                     <span className="text-xs sm:text-sm text-slate-500">{label}</span>
//                     <span className="text-xs sm:text-sm font-medium text-slate-900 text-right max-w-[60%]">{value}</span>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Property Manager */}
//           <Card className="border border-slate-200 shadow-sm">
//             <CardHeader className="pb-2 px-4 sm:px-6">
//               <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
//                 <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
//                 Property Manager
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="px-4 sm:px-6">
//               <div className="space-y-3">
//                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
//                   <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#0149ab]/10 flex items-center justify-center">
//                     <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm text-slate-900">{tenant?.property_manager_name || "Neha Sharma"}</p>
//                     <p className="text-xs text-slate-500">Property Manager</p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
//                   <div className="flex items-center gap-2 text-xs sm:text-sm">
//                     <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-[#0149ab] shrink-0" />
//                     <span className="truncate">{tenant?.property_manager_phone || "8765432190"}</span>
//                   </div>
//                   <div className="flex items-center gap-2 text-xs sm:text-sm">
//                     <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-[#0149ab] shrink-0" />
//                     <span className="truncate">manager@roomac.com</span>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* ── Complaint Dialog ────────────────────────────────────────────── */}
//       <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
//         <DialogContent className="sm:max-w-md w-[95%] mx-auto">
//           <DialogHeader><DialogTitle className="text-lg sm:text-xl">Raise a Complaint</DialogTitle></DialogHeader>
//           <div className="space-y-4 mt-4">
//             <div>
//               <Label className="text-xs sm:text-sm font-medium">Title *</Label>
//               <Input value={newComplaint.title} onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })} placeholder="Brief title of the issue" className="mt-1 text-sm" />
//             </div>
//             <div>
//               <Label className="text-xs sm:text-sm font-medium">Category *</Label>
//               <Select value={newComplaint.category} onValueChange={(v) => { setNewComplaint({ ...newComplaint, category: v, reason: "" }); setSelectedCategory(v); }}>
//                 <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
//                 <SelectContent>
//                   {complaintCategories.length > 0 ? complaintCategories.map((c) => (
//                     <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
//                   )) : (<><SelectItem value="1">Maintenance</SelectItem><SelectItem value="2">Cleaning</SelectItem><SelectItem value="3">Noise</SelectItem><SelectItem value="4">Security</SelectItem><SelectItem value="5">Other</SelectItem></>)}
//                 </SelectContent>
//               </Select>
//             </div>
//             {complaintReasons.length > 0 && (
//               <div>
//                 <Label className="text-xs sm:text-sm font-medium">Reason</Label>
//                 <Select value={newComplaint.reason} onValueChange={(v) => setNewComplaint({ ...newComplaint, reason: v })}>
//                   <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Select reason (optional)" /></SelectTrigger>
//                   <SelectContent>{complaintReasons.map((r) => <SelectItem key={r.id} value={r.id.toString()}>{r.value}</SelectItem>)}</SelectContent>
//                 </Select>
//               </div>
//             )}
//             <div>
//               <Label className="text-xs sm:text-sm font-medium">Priority</Label>
//               <Select value={newComplaint.priority} onValueChange={(v) => setNewComplaint({ ...newComplaint, priority: v })}>
//                 <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
//                 <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Label className="text-xs sm:text-sm font-medium">Description *</Label>
//               <Textarea value={newComplaint.description} onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })} rows={4} placeholder="Describe the issue in detail" className="mt-1 text-sm" />
//             </div>
//             <Button onClick={handleSubmitComplaint} className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-10 sm:h-11">Submit Complaint</Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* ── Leave Dialog ────────────────────────────────────────────────── */}
//       <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
//         <DialogContent className="sm:max-w-md w-[95%] mx-auto">
//           <DialogHeader><DialogTitle className="text-lg sm:text-xl">Request Leave</DialogTitle></DialogHeader>
//           <div className="space-y-4 mt-4">
//             {tenant?.lockin_period_months && (
//               <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <p className="text-xs font-medium text-yellow-800">Lock-in Period Information</p>
//                 <p className="text-xs text-yellow-700 mt-1">Lock-in: {tenant.lockin_period_months} months</p>
//               </div>
//             )}
//             <div>
//               <Label className="text-xs sm:text-sm font-medium">Leave Type *</Label>
//               <Select value={leaveRequest.leave_type} onValueChange={(v) => setLeaveRequest({ ...leaveRequest, leave_type: v })}>
//                 <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Select leave type" /></SelectTrigger>
//                 <SelectContent>
//                   {leaveTypes.length > 0 ? leaveTypes.map((t) => <SelectItem key={t.id} value={t.value}>{t.value}</SelectItem>)
//                     : (<><SelectItem value="vacation">Vacation</SelectItem><SelectItem value="sick">Sick Leave</SelectItem><SelectItem value="emergency">Emergency</SelectItem><SelectItem value="personal">Personal</SelectItem></>)}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <div>
//                 <Label className="text-xs sm:text-sm font-medium">Start Date *</Label>
//                 <Input type="date" min={new Date().toISOString().split("T")[0]} value={leaveRequest.leave_start_date} onChange={(e) => setLeaveRequest({ ...leaveRequest, leave_start_date: e.target.value })} className="mt-1 text-sm" />
//               </div>
//               <div>
//                 <Label className="text-xs sm:text-sm font-medium">End Date</Label>
//                 <Input type="date" min={leaveRequest.leave_start_date || new Date().toISOString().split("T")[0]} value={leaveRequest.leave_end_date} onChange={(e) => setLeaveRequest({ ...leaveRequest, leave_end_date: e.target.value })} className="mt-1 text-sm" />
//               </div>
//             </div>
//             <div>
//               <Label className="text-xs sm:text-sm font-medium">Reason *</Label>
//               <Textarea value={leaveRequest.reason} onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })} rows={3} placeholder="Please provide reason for leave" className="mt-1 text-sm" />
//             </div>
//             <div>
//               <Label className="text-xs sm:text-sm font-medium">Contact Address (During Leave)</Label>
//               <Input value={leaveRequest.contact_address} onChange={(e) => setLeaveRequest({ ...leaveRequest, contact_address: e.target.value })} placeholder="Where can we reach you?" className="mt-1 text-sm" />
//             </div>
//             <div>
//               <Label className="text-xs sm:text-sm font-medium">Emergency Contact</Label>
//               <Input value={leaveRequest.emergency_contact} onChange={(e) => setLeaveRequest({ ...leaveRequest, emergency_contact: e.target.value })} placeholder="Emergency contact number" className="mt-1 text-sm" />
//             </div>
//             <Button onClick={handleSubmitLeaveRequest} className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-10 sm:h-11">Submit Request</Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* ── Payment Dialog ───────────────────────────────────────────────── */}
//       <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
//         <DialogContent className="sm:max-w-md w-[95%] mx-auto">
//           <DialogHeader><DialogTitle className="text-lg sm:text-xl">Make a Payment</DialogTitle></DialogHeader>
//           <div className="space-y-4 mt-4">
//             <div>
//               <Label className="text-xs sm:text-sm font-medium">Amount (₹) *</Label>
//               <Input type="number" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} placeholder="Enter amount" className="mt-1 text-sm" />
//             </div>
//             <div>
//               <Label className="text-xs sm:text-sm font-medium">Description *</Label>
//               <Input value={newPayment.description} onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })} placeholder="e.g., Monthly Rent - March 2026" className="mt-1 text-sm" />
//             </div>
//             <div>
//               <Label className="text-xs sm:text-sm font-medium">Payment Method</Label>
//               <Select value={newPayment.payment_method} onValueChange={(v) => setNewPayment({ ...newPayment, payment_method: v })}>
//                 <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
//                 <SelectContent><SelectItem value="card">Credit/Debit Card</SelectItem><SelectItem value="upi">UPI</SelectItem><SelectItem value="netbanking">Net Banking</SelectItem></SelectContent>
//               </Select>
//             </div>
//             <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
//               <p className="text-xs text-blue-800"><span className="font-medium">Note:</span> A late fee of ₹100 per day will be charged after the due date.</p>
//             </div>
//             <Button onClick={handleSubmitPayment} className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-10 sm:h-11">Proceed to Payment</Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  FileText,
  Bell,
  AlertCircle,
  Calendar,
  Building,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Wifi,
  Coffee,
  Users,
  User,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  getTenantToken,
  getTenantId,
  type TenantProfile,
} from "@/lib/tenantAuthApi";
import { tenantDetailsApi } from "@/lib/tenantDetailsApi";
import {
  getMyTenantRequests,
  createTenantRequest,
  getComplaintCategories,
  getComplaintReasons,
  getLeaveTypes,
  type TenantRequest,
  type ComplaintCategory,
  type ComplaintReason,
  type LeaveType,
} from "@/lib/tenantRequestsApi";
import { logoutTenant } from "@/lib/tenantAuthApi";

// ─── Types ────────────────────────────────────────────────────────────────────
// Assets
import roomacLogo from "@/app/src/assets/images/roomaclogo.webp";
import { useAuth } from "@/context/authContext";

interface DashboardStats {
  totalPaid: number;
  totalPending: number;
  pendingCount: number;
  openComplaints: number;
  unreadNotifications: number;
  daysUntilRentDue: number;
  monthlyRent: number;
  occupancyDays: number;
  nextDueDate: string;
  urgentComplaints: number;
  inProgressComplaints: number;
}

interface Payment {
  id: string;
  amount: number;
  description: string;
  payment_date: string;
  payment_method: string;
  status: "completed" | "pending" | "failed";
  due_date?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "payment" | "complaint" | "event" | "document" | "general";
  is_read: boolean;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PAYMENTS: Payment[] = [
  {
    id: "1",
    amount: 12000,
    description: "Monthly Rent - February 2026",
    payment_date: "2026-02-05T10:30:00Z",
    payment_method: "Credit Card",
    status: "completed",
    due_date: "2026-02-10",
  },
  {
    id: "2",
    amount: 12000,
    description: "Monthly Rent - January 2026",
    payment_date: "2026-01-05T09:15:00Z",
    payment_method: "UPI",
    status: "completed",
    due_date: "2026-01-10",
  },
  {
    id: "3",
    amount: 5000,
    description: "Maintenance Deposit",
    payment_date: "2025-12-15T14:20:00Z",
    payment_method: "Bank Transfer",
    status: "completed",
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Rent Payment Reminder",
    message: "Your rent payment of ₹12,000 is due in 7 days",
    type: "payment",
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Complaint Update",
    message: "Your maintenance request #123 is now in progress",
    type: "complaint",
    is_read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    title: "Document Verified",
    message: "Your Aadhar card has been verified successfully",
    type: "document",
    is_read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TenantPortalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Active tab — hash se decide hoga (#payments, #notifications)
  const getTabFromHash = () => {
    const hash = location.hash.replace("#", "");
    if (["dashboard", "payments", "notifications"].includes(hash)) return hash;
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash());

  // Hash change hone par tab update karo
  useEffect(() => {
    setActiveTab(getTabFromHash());
  }, [location.hash]);

  // Tab change hone par URL hash update karo
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/tenant/portal#${tab}`, { replace: true });
  };

  // Data state
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [complaintCategories, setComplaintCategories] = useState<ComplaintCategory[]>([]);
  const [complaintReasons, setComplaintReasons] = useState<ComplaintReason[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Dialogs
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Stats
  const [stats, setStats] = useState<DashboardStats>({
    totalPaid: 24500,
    totalPending: 12000,
    pendingCount: 1,
    openComplaints: 2,
    unreadNotifications: 3,
    daysUntilRentDue: 7,
    monthlyRent: 12000,
    occupancyDays: 245,
    nextDueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    urgentComplaints: 1,
    inProgressComplaints: 1,
  });

  // Form states
  const [newComplaint, setNewComplaint] = useState({
    title: "", description: "", category: "", reason: "", priority: "medium",
  });
  const [leaveRequest, setLeaveRequest] = useState({
    leave_type: "", leave_start_date: "", leave_end_date: "",
    reason: "", contact_address: "", emergency_contact: "",
  });
  const [newPayment, setNewPayment] = useState({
    amount: "", description: "", payment_method: "card",
  });

  // Loading timeout
  useEffect(() => {
    const id = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
        toast.error("Loading is taking too long. Please refresh.");
      }
    }, 15000);
    return () => clearTimeout(id);
  }, [loading]);

  // Fetch data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setLoadingTimeout(false);
    try {
      const token = getTenantToken();
      const tenantId = getTenantId();
      if (!token || !tenantId) {
        navigate('/login');
        return;
      }

      const [profileRes, requestsRes, categoriesRes, leaveTypesRes] =
        await Promise.allSettled([
          tenantDetailsApi.loadProfile(),
          getMyTenantRequests(),
          getComplaintCategories(),
          getLeaveTypes(),
        ]);

      if (profileRes.status === "fulfilled" && profileRes.value?.success) {
        const d = profileRes.value.data;
        setTenant(d);

        const totalPaid = d.payments?.filter((p: any) => p.status === "completed")
          .reduce((s: number, p: any) => s + p.amount, 0) ?? 24500;
        const totalPending = d.payments?.filter((p: any) => p.status === "pending")
          .reduce((s: number, p: any) => s + p.amount, 0) ?? 12000;
        const pendingCount = d.payments?.filter((p: any) => p.status === "pending").length ?? 1;

        let daysUntilRentDue = 7;
        let nextDueDate = new Date(Date.now() + 7 * 86400000).toISOString();
        if (d.check_in_date) {
          const dueDay = new Date(d.check_in_date).getDate();
          const today = new Date();
          let nextDue = new Date(today.getFullYear(), today.getMonth(), dueDay);
          if (today.getDate() > dueDay)
            nextDue = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
          daysUntilRentDue = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 3600 * 24));
          nextDueDate = nextDue.toISOString();
        }

        const occupancyDays = d.check_in_date
          ? Math.ceil((Date.now() - new Date(d.check_in_date).getTime()) / (1000 * 3600 * 24))
          : 245;

        setStats(prev => ({
          ...prev,
          totalPaid, totalPending, pendingCount,
          daysUntilRentDue,
          monthlyRent: d.monthly_rent ?? 12000,
          occupancyDays, nextDueDate,
        }));
      }

      if (requestsRes.status === "fulfilled" && requestsRes.value) {
        const data: TenantRequest[] = requestsRes.value;
        const c = data.filter(r => r.request_type === "complaint" || r.request_type === "maintenance");
        setStats(prev => ({
          ...prev,
          openComplaints: c.filter(x => x.status === "pending" || x.status === "in_progress").length,
          urgentComplaints: c.filter(x => x.priority === "urgent" && x.status !== "resolved").length,
          inProgressComplaints: c.filter(x => x.status === "in_progress").length,
        }));
      }

      if (categoriesRes.status === "fulfilled" && categoriesRes.value)
        setComplaintCategories(categoriesRes.value);
      if (leaveTypesRes.status === "fulfilled" && leaveTypesRes.value)
        setLeaveTypes(leaveTypesRes.value);

      setPayments(MOCK_PAYMENTS);
    } catch {
      toast.error("Failed to load dashboard data");
      setPayments(MOCK_PAYMENTS);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  useEffect(() => {
    if (selectedCategory)
      getComplaintReasons(parseInt(selectedCategory))
        .then(setComplaintReasons)
        .catch(console.error);
  }, [selectedCategory]);

  const handleLogout = useCallback(async () => {
    await logoutTenant();
    localStorage.clear();
    navigate('/login');
    logout();
  }, [navigate, logout]);

  const handleSubmitComplaint = useCallback(async () => {
    if (!newComplaint.title || !newComplaint.description || !newComplaint.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createTenantRequest({
        request_type: "complaint",
        title: newComplaint.title,
        description: newComplaint.description,
        priority: newComplaint.priority as any,
        complaint_data: {
          category_master_type_id: parseInt(newComplaint.category),
          reason_master_value_id: newComplaint.reason ? parseInt(newComplaint.reason) : undefined,
        },
      });
      toast.success("Complaint submitted successfully");
      setShowComplaintDialog(false);
      setNewComplaint({ title: "", description: "", category: "", reason: "", priority: "medium" });
      fetchAllData();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit complaint");
    }
  }, [newComplaint, fetchAllData]);

  const handleSubmitLeaveRequest = useCallback(async () => {
    if (!leaveRequest.leave_type || !leaveRequest.leave_start_date || !leaveRequest.reason) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createTenantRequest({
        request_type: "leave",
        title: `Leave Request - ${leaveRequest.leave_type}`,
        description: leaveRequest.reason,
        priority: "medium",
        leave_data: {
          leave_type: leaveRequest.leave_type,
          leave_start_date: leaveRequest.leave_start_date,
          leave_end_date: leaveRequest.leave_end_date || leaveRequest.leave_start_date,
          total_days: leaveRequest.leave_end_date
            ? Math.ceil((new Date(leaveRequest.leave_end_date).getTime() - new Date(leaveRequest.leave_start_date).getTime()) / (1000 * 3600 * 24)) + 1
            : 1,
          contact_address_during_leave: leaveRequest.contact_address,
          emergency_contact_number: leaveRequest.emergency_contact,
        },
      });
      toast.success("Leave request submitted successfully");
      setShowLeaveDialog(false);
      setLeaveRequest({ leave_type: "", leave_start_date: "", leave_end_date: "", reason: "", contact_address: "", emergency_contact: "" });
      fetchAllData();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit leave request");
    }
  }, [leaveRequest, fetchAllData]);

  const handleSubmitPayment = useCallback(() => {
    if (!newPayment.amount || !newPayment.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Payment initiated successfully");
    setShowPaymentDialog(false);
    const record: Payment = {
      id: Date.now().toString(),
      amount: parseFloat(newPayment.amount),
      description: newPayment.description,
      payment_date: new Date().toISOString(),
      payment_method: newPayment.payment_method === "card" ? "Credit Card" : "UPI",
      status: "pending",
    };
    setPayments(prev => [record, ...prev]);
    setNewPayment({ amount: "", description: "", payment_method: "card" });
  }, [newPayment]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setStats(prev => ({ ...prev, unreadNotifications: 0 }));
    toast.success("All notifications marked as read");
  }, []);

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0149ab] border-t-transparent" />
          <p className="mt-4 text-slate-600">Loading your dashboard...</p>
          {loadingTimeout && (
            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-4">
              Refresh Page
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6">
      {/* Welcome Banner */}
      <div className="mb-6 bg-[#0149ab] rounded-xl p-4 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">
          Hey, {tenant?.full_name?.split(" ")[0] || "Rahul"}! 👋
        </h1>
        <p className="text-blue-100 text-sm sm:text-base flex items-center gap-2">
          <Building className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {tenant?.property_name || "Roomac Heights"} · Room{" "}
            {tenant?.room_number || "204"} · Bed {tenant?.bed_number || "1"}
          </span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Monthly Rent", value: formatCurrency(stats.monthlyRent), sub: `Due in ${stats.daysUntilRentDue} days` },
          { label: "Total Paid", value: formatCurrency(stats.totalPaid), sub: "All time" },
          { label: "Days Staying", value: stats.occupancyDays, sub: `Since ${formatDate(tenant?.check_in_date || "2024-01-15")}` },
          { label: "Room Type", value: tenant?.preferred_sharing || "Double", sub: "Sharing", capitalize: true },
        ].map((card) => (
          <Card key={card.label} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500 mb-1">{card.label}</p>
              <p className={`text-lg sm:text-2xl font-bold text-slate-900 ${card.capitalize ? "capitalize" : ""}`}>
                {card.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Button variant="outline"
          className="h-auto py-3 sm:py-4 flex flex-col items-center gap-1 sm:gap-2 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0149ab] shadow-sm"
          onClick={() => setShowComplaintDialog(true)}>
          <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#0149ab]" />
          <span className="text-xs sm:text-sm font-medium">Raise Complaint</span>
        </Button>

        <Button variant="outline"
          className="h-auto py-3 sm:py-4 flex flex-col items-center gap-1 sm:gap-2 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0149ab] shadow-sm"
          onClick={() => setShowLeaveDialog(true)}>
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-[#0149ab]" />
          <span className="text-xs sm:text-sm font-medium">Request Leave</span>
        </Button>

        <Button variant="outline"
          className="h-auto py-3 sm:py-4 flex flex-col items-center gap-1 sm:gap-2 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0149ab] shadow-sm"
          onClick={() => navigate("/tenant/documents")}>
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-[#0149ab]" />
          <span className="text-xs sm:text-sm font-medium">Documents</span>
        </Button>

        <Button
          className="h-auto py-3 sm:py-4 flex flex-col items-center gap-1 sm:gap-2 bg-[#0149ab] hover:bg-[#0149ab]/90 text-white border-none shadow-sm"
          onClick={() => {
            handleTabChange("payments");
            setShowPaymentDialog(true);
          }}>
          <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-xs sm:text-sm font-medium">Make Payment</span>
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="bg-white border border-slate-200 p-1 rounded-lg w-full grid grid-cols-3">
              <TabsTrigger value="dashboard"
                className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white data-[state=inactive]:text-slate-600 transition-all text-xs sm:text-sm py-2 sm:py-2.5">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="payments"
                className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white data-[state=inactive]:text-slate-600 transition-all text-xs sm:text-sm py-2 sm:py-2.5">
                Payments
              </TabsTrigger>
              <TabsTrigger value="notifications"
                className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white data-[state=inactive]:text-slate-600 transition-all text-xs sm:text-sm py-2 sm:py-2.5">
                <span className="flex items-center gap-1">
                  Notifications
                  {stats.unreadNotifications > 0 && (
                    <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                      {stats.unreadNotifications}
                    </Badge>
                  )}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* ── Dashboard Tab ─────────────────────────────────────── */}
            <TabsContent value="dashboard" className="space-y-6 mt-4">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm sm:text-base font-semibold">Recent Payments</CardTitle>
                    <Button variant="ghost" size="sm"
                      className="text-[#0149ab] hover:bg-blue-50 text-xs sm:text-sm"
                      onClick={() => handleTabChange("payments")}>
                      View All <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {payments.length > 0 ? (
                    <div className="space-y-3">
                      {payments.slice(0, 3).map((p) => (
                        <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg gap-2">
                          <div>
                            <p className="font-medium text-sm text-slate-900">{p.description}</p>
                            <p className="text-xs text-slate-500 mt-1">{formatDate(p.payment_date)} · {p.payment_method}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-sm text-slate-900">{formatCurrency(p.amount)}</p>
                            <Badge variant="outline" className={`text-xs ${p.status === "completed" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                              {p.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No payment history</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <CardTitle className="text-sm sm:text-base font-semibold">Amenities History</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="space-y-2 sm:space-y-3">
                    {[
                      { icon: Wifi, label: "WiFi - Last used: Today" },
                      { icon: Coffee, label: "Laundry - Last used: 2 days ago" },
                      { icon: Users, label: "Gym - Last used: 5 days ago" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
                        <span className="text-xs sm:text-sm font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Payments Tab ──────────────────────────────────────── */}
            <TabsContent value="payments" className="space-y-6 mt-4">
              <Button className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-10 sm:h-12" onClick={() => setShowPaymentDialog(true)}>
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Make a Payment
              </Button>
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-base sm:text-lg font-semibold">Payment History</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {payments.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {payments.map((p) => (
                        <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg gap-2">
                          <div>
                            <p className="font-medium text-sm text-slate-900">{p.description}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500">{formatDate(p.payment_date)}</span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-500">{p.payment_method}</span>
                              {p.due_date && (<><span className="text-xs text-slate-400">•</span><span className="text-xs text-slate-500">Due: {formatDate(p.due_date)}</span></>)}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-sm text-slate-900">{formatCurrency(p.amount)}</p>
                            <Badge variant="outline" className={`text-xs ${p.status === "completed" ? "bg-green-50 text-green-700 border-green-200" : p.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                              {p.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No payment history</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Notifications Tab ─────────────────────────────────── */}
            <TabsContent value="notifications" className="space-y-6 mt-4">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold">All Notifications</CardTitle>
                    {stats.unreadNotifications > 0 && (
                      <Button variant="ghost" size="sm" className="text-[#0149ab] hover:bg-blue-50 text-xs sm:text-sm" onClick={handleMarkAllRead}>
                        Mark all as read
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {notifications.length > 0 ? (
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-4 rounded-lg border ${!n.is_read ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"}`}>
                          <div className="flex items-start gap-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${n.is_read ? "bg-slate-100" : "bg-blue-100"}`}>
                              {n.type === "payment" && <CreditCard className="h-4 w-4 text-blue-600" />}
                              {n.type === "complaint" && <AlertCircle className="h-4 w-4 text-orange-600" />}
                              {n.type === "document" && <FileText className="h-4 w-4 text-purple-600" />}
                              {(n.type === "general" || n.type === "event") && <Bell className="h-4 w-4 text-gray-600" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <p className="font-medium text-sm text-slate-900">{n.title}</p>
                                {!n.is_read && <div className="h-2 w-2 bg-blue-600 rounded-full mt-1" />}
                              </div>
                              <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                              <p className="text-xs text-slate-400 mt-2">
                                {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No notifications</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Accommodation */}
          <Card className="bg-[#0149ab] text-white border-none shadow-lg">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2 text-white">
                <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                Your Accommodation
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 space-y-4">
              <div>
                <p className="font-semibold text-base sm:text-xl">{tenant?.property_name || "Roomac Heights"}</p>
                <p className="text-xs sm:text-sm text-blue-100 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{tenant?.property_address || "45, Linking Road, Bandra"}, {tenant?.property_city || "Mumbai"}</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: "ROOM NO.", value: tenant?.room_number || "204" },
                  { label: "BED NO.", value: tenant?.bed_number || "1" },
                  { label: "RENT/MONTH", value: formatCurrency(stats.monthlyRent) },
                  { label: "FLOOR", value: `Floor ${tenant?.floor || "3"}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-blue-600/20 rounded-lg p-2 sm:p-3">
                    <p className="text-[10px] sm:text-xs text-blue-200">{label}</p>
                    <p className="text-lg sm:text-2xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contract Details */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2 sm:space-y-3">
                {[
                  { label: "Check-in", value: formatDate(tenant?.check_in_date || "2024-01-15") },
                  { label: "Lock-in", value: `${tenant?.lockin_period_months || "6"} months` },
                  { label: "Notice", value: `${tenant?.notice_period_days || "30"} days` },
                  { label: "Amenities", value: tenant?.amenities || "WiFi, AC, Laundry, Food, Gym" },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} className={`flex justify-between py-2 ${i < arr.length - 1 ? "border-b border-slate-100" : ""}`}>
                    <span className="text-xs sm:text-sm text-slate-500">{label}</span>
                    <span className="text-xs sm:text-sm font-medium text-slate-900 text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Property Manager */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
                Property Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#0149ab]/10 flex items-center justify-center">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900">{tenant?.property_manager_name || "Neha Sharma"}</p>
                    <p className="text-xs text-slate-500">Property Manager</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-[#0149ab] shrink-0" />
                    <span className="truncate">{tenant?.property_manager_phone || "8765432190"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-[#0149ab] shrink-0" />
                    <span className="truncate">manager@roomac.com</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Complaint Dialog ────────────────────────────────────────────── */}
      <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
        <DialogContent className="sm:max-w-md w-[95%] mx-auto">
          <DialogHeader><DialogTitle className="text-lg sm:text-xl">Raise a Complaint</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs sm:text-sm font-medium">Title *</Label>
              <Input value={newComplaint.title} onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })} placeholder="Brief title of the issue" className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Category *</Label>
              <Select value={newComplaint.category} onValueChange={(v) => { setNewComplaint({ ...newComplaint, category: v, reason: "" }); setSelectedCategory(v); }}>
                <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {complaintCategories.length > 0 ? complaintCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  )) : (<><SelectItem value="1">Maintenance</SelectItem><SelectItem value="2">Cleaning</SelectItem><SelectItem value="3">Noise</SelectItem><SelectItem value="4">Security</SelectItem><SelectItem value="5">Other</SelectItem></>)}
                </SelectContent>
              </Select>
            </div>
            {complaintReasons.length > 0 && (
              <div>
                <Label className="text-xs sm:text-sm font-medium">Reason</Label>
                <Select value={newComplaint.reason} onValueChange={(v) => setNewComplaint({ ...newComplaint, reason: v })}>
                  <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Select reason (optional)" /></SelectTrigger>
                  <SelectContent>{complaintReasons.map((r) => <SelectItem key={r.id} value={r.id.toString()}>{r.value}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-xs sm:text-sm font-medium">Priority</Label>
              <Select value={newComplaint.priority} onValueChange={(v) => setNewComplaint({ ...newComplaint, priority: v })}>
                <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Description *</Label>
              <Textarea value={newComplaint.description} onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })} rows={4} placeholder="Describe the issue in detail" className="mt-1 text-sm" />
            </div>
            <Button onClick={handleSubmitComplaint} className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-10 sm:h-11">Submit Complaint</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Leave Dialog ────────────────────────────────────────────────── */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="sm:max-w-md w-[95%] mx-auto">
          <DialogHeader><DialogTitle className="text-lg sm:text-xl">Request Leave</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            {tenant?.lockin_period_months && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs font-medium text-yellow-800">Lock-in Period Information</p>
                <p className="text-xs text-yellow-700 mt-1">Lock-in: {tenant.lockin_period_months} months</p>
              </div>
            )}
            <div>
              <Label className="text-xs sm:text-sm font-medium">Leave Type *</Label>
              <Select value={leaveRequest.leave_type} onValueChange={(v) => setLeaveRequest({ ...leaveRequest, leave_type: v })}>
                <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Select leave type" /></SelectTrigger>
                <SelectContent>
                  {leaveTypes.length > 0 ? leaveTypes.map((t) => <SelectItem key={t.id} value={t.value}>{t.value}</SelectItem>)
                    : (<><SelectItem value="vacation">Vacation</SelectItem><SelectItem value="sick">Sick Leave</SelectItem><SelectItem value="emergency">Emergency</SelectItem><SelectItem value="personal">Personal</SelectItem></>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs sm:text-sm font-medium">Start Date *</Label>
                <Input type="date" min={new Date().toISOString().split("T")[0]} value={leaveRequest.leave_start_date} onChange={(e) => setLeaveRequest({ ...leaveRequest, leave_start_date: e.target.value })} className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium">End Date</Label>
                <Input type="date" min={leaveRequest.leave_start_date || new Date().toISOString().split("T")[0]} value={leaveRequest.leave_end_date} onChange={(e) => setLeaveRequest({ ...leaveRequest, leave_end_date: e.target.value })} className="mt-1 text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Reason *</Label>
              <Textarea value={leaveRequest.reason} onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })} rows={3} placeholder="Please provide reason for leave" className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Contact Address (During Leave)</Label>
              <Input value={leaveRequest.contact_address} onChange={(e) => setLeaveRequest({ ...leaveRequest, contact_address: e.target.value })} placeholder="Where can we reach you?" className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Emergency Contact</Label>
              <Input value={leaveRequest.emergency_contact} onChange={(e) => setLeaveRequest({ ...leaveRequest, emergency_contact: e.target.value })} placeholder="Emergency contact number" className="mt-1 text-sm" />
            </div>
            <Button onClick={handleSubmitLeaveRequest} className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-10 sm:h-11">Submit Request</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Payment Dialog ───────────────────────────────────────────────── */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md w-[95%] mx-auto">
          <DialogHeader><DialogTitle className="text-lg sm:text-xl">Make a Payment</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs sm:text-sm font-medium">Amount (₹) *</Label>
              <Input type="number" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} placeholder="Enter amount" className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Description *</Label>
              <Input value={newPayment.description} onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })} placeholder="e.g., Monthly Rent - March 2026" className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Payment Method</Label>
              <Select value={newPayment.payment_method} onValueChange={(v) => setNewPayment({ ...newPayment, payment_method: v })}>
                <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="card">Credit/Debit Card</SelectItem><SelectItem value="upi">UPI</SelectItem><SelectItem value="netbanking">Net Banking</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800"><span className="font-medium">Note:</span> A late fee of ₹100 per day will be charged after the due date.</p>
            </div>
            <Button onClick={handleSubmitPayment} className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-10 sm:h-11">Proceed to Payment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}