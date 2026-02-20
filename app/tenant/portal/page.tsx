// // app/tenant/dashboard/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import roomacLogo from '@/app/src/assets/images/roomaclogo.webp';
// import { useRouter, usePathname } from "@/src/compat/next-navigation";
// import { useAuth } from "@/context/authContext";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
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
//   Menu,
//   X,
//   Shield,
//   Wifi,
//   Users,
//   Coffee,
//   Building,
//   Bed,
//   Clock,
//   CreditCard,
//   FileCheck,
//   HelpCircle,
//   Phone,
//   Mail,
//   ChevronDown,
//   Star,
//   TrendingUp,
//   BarChart3,
//   Receipt,
//   CalendarDays,
//   AlertTriangle,
//   CheckCircle2,
//   ChevronRight,
//   ChevronLeft,
//   Search,
//   Sun,
//   Moon,
//   Plus,
//   MoreVertical,
//   Eye,
//   Edit,
//   Trash2,
//   Zap,
//   Target,
//   TrendingDown,
//   Thermometer,
//   Droplets,
//   Wind,
//   Battery,
//   ShieldCheck,
//   ClipboardCheck,
//   Users2,
//   ParkingCircle,
//   Dumbbell,
//   Tv,
//   Microwave,
//   Refrigerator,
//   Armchair,
//   Lamp,
//   Fan,
// } from "lucide-react";

// // Tenant Header Component (with Notification Popup)
// function TenantHeader({
//   tenantName,
//   tenantEmail = "tenant@example.com",
//   notificationCount,
//   onLogout,
//   onNotificationsClick,
//   sidebarCollapsed,
//   onToggleSidebar,
// }: {
//   tenantName: string;
//   tenantEmail?: string;
//   notificationCount: number;
//   onLogout: () => void;
//   onNotificationsClick: () => void;
//   sidebarCollapsed?: boolean;
//   onToggleSidebar?: () => void;
// }) {
//   const [darkMode, setDarkMode] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [notificationsOpen, setNotificationsOpen] = useState(false);
//   const [selectedNotification, setSelectedNotification] = useState<any>(null);
//   const [notificationDetailsOpen, setNotificationDetailsOpen] = useState(false);
  
//   const notifications = [
//     {
//       id: 1,
//       title: "Rent Payment Reminder",
//       message: "Your rent payment is due in 7 days",
//       time: "2 hours ago",
//       read: false,
//       type: "payment",
//       details: {
//         amount: "₹15,000",
//         dueDate: "2024-02-05",
//         status: "pending",
//         category: "rent",
//         description: "Your monthly rent payment for February 2024 is due in 7 days. Please ensure payment is made by the due date to avoid late fees.",
//         paymentMethod: "Online Banking",
//         referenceNumber: "PAY-2024-001"
//       },
//       timestamp: "2024-01-25T09:00:00Z"
//     },
//     {
//       id: 2,
//       title: "Complaint Update",
//       message: "Your maintenance request is now in progress",
//       time: "1 day ago",
//       read: false,
//       type: "maintenance",
//       details: {
//         complaintId: "COMP001",
//         status: "in_progress",
//         assignedTo: "Maintenance Team",
//         estimatedCompletion: "2024-01-28",
//         complaintTitle: "AC Not Working",
//         description: "AC in bedroom is not cooling properly",
//         priority: "high",
//         technician: "John Smith",
//         contact: "+91 9876543210"
//       },
//       timestamp: "2024-01-24T14:30:00Z"
//     },
//     {
//       id: 3,
//       title: "Community Event",
//       message: "Monthly dinner party this Friday at 7 PM",
//       time: "3 days ago",
//       read: true,
//       type: "event",
//       details: {
//         date: "2024-01-26",
//         time: "7:00 PM",
//         venue: "Common Hall",
//         rsvpRequired: true,
//         description: "Join us for our monthly community dinner. Food and drinks will be provided. Please RSVP by Thursday.",
//         organizer: "PG Management",
//         contact: "Mr. Sharma - +91 9876543211"
//       },
//       timestamp: "2024-01-22T11:00:00Z"
//     },
//     {
//       id: 4,
//       title: "Document Ready",
//       message: "Your rental agreement has been updated",
//       time: "5 days ago",
//       read: true,
//       type: "document",
//       details: {
//         documentType: "Rental Agreement",
//         version: "2.0",
//         actionRequired: true,
//         expiryDate: "2024-12-31",
//         description: "Your rental agreement has been updated with new terms and conditions. Please review and acknowledge.",
//         downloadLink: "/documents/agreement.pdf",
//         size: "2.5 MB"
//       },
//       timestamp: "2024-01-20T16:45:00Z"
//     }
//   ];

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       console.log("Searching for:", searchQuery);
//     }
//   };

//   const handleNotificationClick = (notification: any) => {
//     setSelectedNotification(notification);
//     setNotificationDetailsOpen(true);
//     setNotificationsOpen(false);
    
//     // Mark as read
//     if (!notification.read) {
//       console.log("Marking notification as read:", notification.id);
//     }
//   };

//   const markAllAsRead = () => {
//     console.log("Marking all notifications as read");
//     toast.success("All notifications marked as read");
//   };

//   const getNotificationIcon = (type: string) => {
//     switch (type) {
//       case "payment":
//         return <CreditCard className="h-4 w-4 text-blue-600" />;
//       case "maintenance":
//         return <AlertCircle className="h-4 w-4 text-orange-600" />;
//       case "event":
//         return <Calendar className="h-4 w-4 text-green-600" />;
//       case "document":
//         return <FileText className="h-4 w-4 text-purple-600" />;
//       default:
//         return <Bell className="h-4 w-4 text-gray-600" />;
//     }
//   };

//   return (
//     <>
//       <header className="sticky top-0 z-40 bg-blue-50 backdrop-blur-md border-b border-slate-200 shadow-sm">
//         <div className="px-4 sm:px-6 lg:px-8 py-3">
//           <div className="flex items-center justify-between">

//             {/* ================= LEFT ================= */}
//             <div className="flex items-center gap-4">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="lg:hidden"
//                 onClick={onToggleSidebar}
//               >
//                 <Menu className="h-5 w-5" />
//               </Button>

//               <div className="hidden lg:flex items-center gap-3">
//                 <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
//                   <span className="text-white font-bold text-sm">PG</span>
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-slate-900">
//                     Tenant Dashboard
//                   </h2>
//                   <p className="text-xs text-slate-500">
//                     Premium Tenant Dashboard
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* ================= RIGHT ================= */}
//             <div className="flex items-center gap-2 sm:gap-3">

//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="md:hidden"
//               >
//                 <Search className="h-6 w-6" />
//               </Button>

//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => setDarkMode(!darkMode)}
//                 className="hidden sm:inline-flex"
//               >
//                 {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-4 w-4" />}
//               </Button>

//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="hidden sm:inline-flex"
//               >
//                 <HelpCircle className="h-6 w-6" />
//               </Button>

//               {/* ================= NOTIFICATIONS ================= */}
//               <div className="relative">
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => setNotificationsOpen(!notificationsOpen)}
//                 >
//                   <Bell className="h-5 w-5" />
//                   {notificationCount > 0 && (
//                     <Badge
//                       variant="destructive"
//                       className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
//                     >
//                       {notificationCount > 9 ? "9+" : notificationCount}
//                     </Badge>
//                   )}
//                 </Button>

//                 {notificationsOpen && (
//                   <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
//                     {/* Notification Popup Header */}
//                     <div className="p-3 border-b border-slate-200">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <Bell className="h-4 w-4 text-blue-600" />
//                           <p className="font-semibold text-sm">Notifications</p>
//                           {notificationCount > 0 && (
//                             <Badge variant="destructive" className="text-xs px-1.5 py-0 h-5">
//                               {notificationCount}
//                             </Badge>
//                           )}
//                         </div>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={markAllAsRead}
//                           className="h-6 text-xs hover:bg-slate-100"
//                         >
//                           Mark all read
//                         </Button>
//                       </div>
//                     </div>

//                     {/* Notification List */}
//                     <div className="max-h-96 overflow-y-auto">
//                       {notifications.map((notification) => (
//                         <div
//                           key={notification.id}
//                           className={`p-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${
//                             !notification.read ? 'bg-blue-50/50' : ''
//                           }`}
//                           onClick={() => handleNotificationClick(notification)}
//                         >
//                           <div className="flex items-start gap-2.5">
//                             <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
//                               notification.read ? 'bg-slate-100' : 'bg-blue-100'
//                             }`}>
//                               {getNotificationIcon(notification.type)}
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <div className="flex items-start justify-between gap-2">
//                                 <p className="font-medium text-sm text-slate-900 leading-tight">
//                                   {notification.title}
//                                 </p>
//                                 {!notification.read && (
//                                   <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-1"></div>
//                                 )}
//                               </div>
//                               <p className="text-xs text-slate-600 mt-1 leading-relaxed">
//                                 {notification.message}
//                               </p>
//                               <p className="text-[10px] text-slate-400 mt-2">
//                                 {notification.time}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     {/* View All Button */}
//                     <div className="p-3 border-t border-slate-200">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 text-xs"
//                         onClick={onNotificationsClick}
//                       >
//                         View all notifications
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* ================= PROFILE ================= */}
//               <div className="flex items-center gap-2">

//                 {/* PROFILE IMAGE (STATIC URL) */}
//                 <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 shadow-sm">
//                   <img
//                     src="https://randomuser.me/api/portraits/men/32.jpg"
//                     alt="Profile"
//                     className="h-full w-full object-cover"
//                   />
//                 </div>

//                 <div className="hidden sm:block">
//                   <p className="text-xm font-medium text-slate-900">
//                     {tenantName || "John Doe"}
//                   </p>
//                 </div>

//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={onLogout}
//                 >
//                   <LogOut className="h-4 w-4" />
//                 </Button>
//               </div>

//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Notification Details Dialog */}
//       <Dialog open={notificationDetailsOpen} onOpenChange={setNotificationDetailsOpen}>
//         <DialogContent className="sm:max-w-lg">
//           {selectedNotification && (
//             <>
//               <DialogHeader>
//                 <div className="flex items-center gap-3">
//                   <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
//                     selectedNotification.read ? 'bg-slate-100' : 'bg-blue-100'
//                   }`}>
//                     {getNotificationIcon(selectedNotification.type)}
//                   </div>
//                   <div>
//                     <DialogTitle className="text-lg">{selectedNotification.title}</DialogTitle>
//                     <p className="text-sm text-slate-500 mt-0.5">
//                       {new Date(selectedNotification.timestamp).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               </DialogHeader>

//               <div className="space-y-4">
//                 <div className="bg-slate-50 rounded-lg p-4">
//                   <p className="text-slate-700">{selectedNotification.message}</p>
//                 </div>

//                 <div className="border-t border-slate-200 pt-4">
//                   <h4 className="font-semibold text-slate-900 mb-3">Details</h4>
                  
//                   {selectedNotification.type === "payment" && (
//                     <div className="space-y-3">
//                       <div className="grid grid-cols-2 gap-3">
//                         <div>
//                           <Label className="text-xs text-slate-500">Amount</Label>
//                           <p className="font-semibold text-green-600">{selectedNotification.details.amount}</p>
//                         </div>
//                         <div>
//                           <Label className="text-xs text-slate-500">Due Date</Label>
//                           <p className="font-semibold">{selectedNotification.details.dueDate}</p>
//                         </div>
//                       </div>
//                       <div>
//                         <Label className="text-xs text-slate-500">Description</Label>
//                         <p className="text-sm text-slate-700 mt-1">{selectedNotification.details.description}</p>
//                       </div>
//                       <div className="grid grid-cols-2 gap-3">
//                         <div>
//                           <Label className="text-xs text-slate-500">Payment Method</Label>
//                           <p className="text-sm font-medium">{selectedNotification.details.paymentMethod}</p>
//                         </div>
//                         <div>
//                           <Label className="text-xs text-slate-500">Reference</Label>
//                           <p className="text-sm font-medium font-mono">{selectedNotification.details.referenceNumber}</p>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {selectedNotification.type === "maintenance" && (
//                     <div className="space-y-3">
//                       <div className="grid grid-cols-2 gap-3">
//                         <div>
//                           <Label className="text-xs text-slate-500">Complaint ID</Label>
//                           <p className="font-semibold">{selectedNotification.details.complaintId}</p>
//                         </div>
//                         <div>
//                           <Label className="text-xs text-slate-500">Status</Label>
//                           <Badge 
//                             variant={selectedNotification.details.status === "in_progress" ? "default" : "secondary"}
//                             className="capitalize"
//                           >
//                             {selectedNotification.details.status}
//                           </Badge>
//                         </div>
//                       </div>
//                       <div>
//                         <Label className="text-xs text-slate-500">Issue</Label>
//                         <p className="text-sm font-semibold">{selectedNotification.details.complaintTitle}</p>
//                         <p className="text-sm text-slate-600 mt-1">{selectedNotification.details.description}</p>
//                       </div>
//                       <div className="grid grid-cols-2 gap-3">
//                         <div>
//                           <Label className="text-xs text-slate-500">Assigned To</Label>
//                           <p className="text-sm font-medium">{selectedNotification.details.assignedTo}</p>
//                         </div>
//                         <div>
//                           <Label className="text-xs text-slate-500">Technician</Label>
//                           <p className="text-sm font-medium">{selectedNotification.details.technician}</p>
//                         </div>
//                       </div>
//                       <div>
//                         <Label className="text-xs text-slate-500">Contact</Label>
//                         <p className="text-sm font-medium">{selectedNotification.details.contact}</p>
//                       </div>
//                     </div>
//                   )}

//                   {selectedNotification.type === "event" && (
//                     <div className="space-y-3">
//                       <div className="grid grid-cols-2 gap-3">
//                         <div>
//                           <Label className="text-xs text-slate-500">Date</Label>
//                           <p className="font-semibold">{selectedNotification.details.date}</p>
//                         </div>
//                         <div>
//                           <Label className="text-xs text-slate-500">Time</Label>
//                           <p className="font-semibold">{selectedNotification.details.time}</p>
//                         </div>
//                       </div>
//                       <div>
//                         <Label className="text-xs text-slate-500">Venue</Label>
//                         <p className="text-sm font-medium">{selectedNotification.details.venue}</p>
//                       </div>
//                       <div>
//                         <Label className="text-xs text-slate-500">Description</Label>
//                         <p className="text-sm text-slate-700 mt-1">{selectedNotification.details.description}</p>
//                       </div>
//                       <div className="grid grid-cols-2 gap-3">
//                         <div>
//                           <Label className="text-xs text-slate-500">Organizer</Label>
//                           <p className="text-sm font-medium">{selectedNotification.details.organizer}</p>
//                         </div>
//                         <div>
//                           <Label className="text-xs text-slate-500">RSVP Required</Label>
//                           <Badge variant={selectedNotification.details.rsvpRequired ? "default" : "outline"}>
//                             {selectedNotification.details.rsvpRequired ? "Yes" : "No"}
//                           </Badge>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {selectedNotification.type === "document" && (
//                     <div className="space-y-3">
//                       <div className="grid grid-cols-2 gap-3">
//                         <div>
//                           <Label className="text-xs text-slate-500">Document Type</Label>
//                           <p className="font-semibold">{selectedNotification.details.documentType}</p>
//                         </div>
//                         <div>
//                           <Label className="text-xs text-slate-500">Version</Label>
//                           <p className="font-semibold">{selectedNotification.details.version}</p>
//                         </div>
//                       </div>
//                       <div>
//                         <Label className="text-xs text-slate-500">Description</Label>
//                         <p className="text-sm text-slate-700 mt-1">{selectedNotification.details.description}</p>
//                       </div>
//                       <div className="grid grid-cols-2 gap-3">
//                         <div>
//                           <Label className="text-xs text-slate-500">Expiry Date</Label>
//                           <p className="text-sm font-medium">{selectedNotification.details.expiryDate}</p>
//                         </div>
//                         <div>
//                           <Label className="text-xs text-slate-500">File Size</Label>
//                           <p className="text-sm font-medium">{selectedNotification.details.size}</p>
//                         </div>
//                       </div>
//                       <div>
//                         <Label className="text-xs text-slate-500">Action Required</Label>
//                         <Badge variant={selectedNotification.details.actionRequired ? "destructive" : "default"}>
//                           {selectedNotification.details.actionRequired ? "Immediate Action" : "No Action Required"}
//                         </Badge>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex gap-3 pt-4 border-t border-slate-200">
//                 <Button
//                   variant="outline"
//                   className="flex-1"
//                   onClick={() => setNotificationDetailsOpen(false)}
//                 >
//                   Close
//                 </Button>
//                 {selectedNotification.type === "payment" && (
//                   <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
//                     <CreditCard className="h-4 w-4 mr-2" />
//                     Pay Now
//                   </Button>
//                 )}
//                 {selectedNotification.type === "document" && (
//                   <Button className="flex-1 bg-green-600 hover:bg-green-700">
//                     <Download className="h-4 w-4 mr-2" />
//                     Download
//                   </Button>
//                 )}
//                 {selectedNotification.type === "event" && (
//                   <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
//                     <Calendar className="h-4 w-4 mr-2" />
//                     RSVP Now
//                   </Button>
//                 )}
//               </div>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

// export default function TenantDashboard() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [tenant, setTenant] = useState<any>(null);
//   const [booking, setBooking] = useState<any>(null);
//   const [payments, setPayments] = useState<any[]>([]);
//   const [complaints, setComplaints] = useState<any[]>([]);
//   const [notifications, setNotifications] = useState<any[]>([]);
//   const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showComplaintDialog, setShowComplaintDialog] = useState(false);
//   const [showLeaveDialog, setShowLeaveDialog] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const { logout } = useAuth();

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

//   // Enhanced stats
//   const [stats, setStats] = useState({
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
//   });

//   // Professional metrics
//   const [metrics, setMetrics] = useState([
//     { 
//       label: "Monthly Spending", 
//       value: "₹45,000", 
//       change: "+12%", 
//       icon: TrendingUp, 
//       color: "text-green-600", 
//       bgColor: "bg-green-50",
//       trend: "positive"
//     },
//     { 
//       label: "Avg Response Time", 
//       value: "4.2h", 
//       change: "-18%", 
//       icon: Clock, 
//       color: "text-blue-600", 
//       bgColor: "bg-blue-50",
//       trend: "positive"
//     },
//     { 
//       label: "Satisfaction Score", 
//       value: "4.8/5", 
//       change: "+2%", 
//       icon: Star, 
//       color: "text-yellow-600", 
//       bgColor: "bg-yellow-50",
//       trend: "positive"
//     },
//     { 
//       label: "Occupancy Rate", 
//       value: "92%", 
//       change: "+5%", 
//       icon: TrendingUp, 
//       color: "text-purple-600", 
//       bgColor: "bg-purple-50",
//       trend: "positive"
//     },
//   ]);

//   // Complete PG amenities
//   const pgAmenities = [
//     { icon: <Wifi className="h-4 w-4" />, name: "High-Speed WiFi", available: true, status: "500 Mbps", uptime: "99.9%" },
//     { icon: <Coffee className="h-4 w-4" />, name: "Daily Mess", available: true, status: "3 Meals", rating: "4.5/5" },
//     { icon: <Shield className="h-4 w-4" />, name: "24/7 Security", available: true, status: "Guarded", cameras: "8" },
//     { icon: <Users className="h-4 w-4" />, name: "Laundry Service", available: true, status: "Weekly", next: "Tomorrow" },
//     { icon: <ParkingCircle className="h-4 w-4" />, name: "Parking", available: true, status: "Available", slots: "4/6" },
//     { icon: <Dumbbell className="h-4 w-4" />, name: "Gym", available: true, status: "24/7 Access", equipment: "Full" },
//     { icon: <Tv className="h-4 w-4" />, name: "TV Lounge", available: true, status: "HD TV", channels: "150+" },
//     { icon: <Microwave className="h-4 w-4" />, name: "Kitchen", available: true, status: "Fully Equipped", type: "Common" },
//   ];

//   // Room amenities
//   const roomAmenities = [
//     { icon: <Bed className="h-4 w-4" />, name: "Bed", available: true, status: "Queen Size" },
//     { icon: <Refrigerator className="h-4 w-4" />, name: "Refrigerator", available: true, status: "Personal" },
//     { icon: <Armchair className="h-4 w-4" />, name: "Study Table", available: true, status: "With Chair" },
//     { icon: <Lamp className="h-4 w-4" />, name: "LED Lights", available: true, status: "Dimmable" },
//     { icon: <Fan className="h-4 w-4" />, name: "Ceiling Fan", available: true, status: "With Remote" },
//     { icon: <Thermometer className="h-4 w-4" />, name: "AC", available: true, status: "1.5 Ton" },
//   ];

//   // Navigation items with routes
//   const navigationItems = [
//     { 
//       id: "dashboard", 
//       label: "Dashboard", 
//       icon: Home, 
//       active: true, 
//       badge: null,
//       href: "/tenant/dashboard"
//     },
//     { 
//       id: "payments", 
//       label: "Payments", 
//       icon: CreditCard, 
//       badge: stats.pendingPayments > 0 ? `${stats.pendingPayments}` : null,
//       tab: "payments"
//     },
//     { 
//       id: "documents", 
//       label: "Documents", 
//       icon: FileCheck, 
//       badge: null,
//       href: "/tenant/documents"
//     },
//     { 
//       id: "complaints", 
//       label: "Complaints", 
//       icon: AlertCircle, 
//       badge: stats.openComplaints > 0 ? `${stats.openComplaints}` : null,
//       tab: "complaints"
//     },
//     { 
//       id: "my-documents", 
//       label: "My Documents", 
//       icon: FolderOpen, 
//       badge: null,
//       href: "/tenant/my-documents"
//     },
//     { 
//       id: "requests", 
//       label: "Requests", 
//       icon: MessageSquare, 
//       badge: null,
//       href: "/tenant/requests"
//     },
//     { 
//       id: "notifications", 
//       label: "Notifications", 
//       icon: Bell, 
//       badge: stats.unreadNotifications > 0 ? `${stats.unreadNotifications}` : null,
//       tab: "notifications"
//     },
//     { 
//       id: "profile", 
//       label: "Profile", 
//       icon: User, 
//       badge: null,
//       href: "/tenant/profile"
//     },
//     { 
//       id: "support", 
//       label: "Support", 
//       icon: HelpCircle, 
//       badge: null,
//       href: "/tenant/support"
//     },
//   ];

//   const recentActivities = [
//     { id: 1, type: "payment", title: "Rent Payment", description: "January 2024 rent", amount: "₹15,000", status: "completed", time: "2 hours ago", icon: CreditCard, color: "text-green-600", bgColor: "bg-green-50" },
//     { id: 2, type: "complaint", title: "AC Repair", description: "Bedroom AC not cooling", status: "in_progress", time: "1 day ago", icon: AlertCircle, color: "text-orange-600", bgColor: "bg-orange-50" },
//     { id: 3, type: "document", title: "Agreement Renewal", description: "Annual agreement signed", status: "completed", time: "3 days ago", icon: FileCheck, color: "text-blue-600", bgColor: "bg-blue-50" },
//     { id: 4, type: "maintenance", title: "Room Cleaning", description: "Monthly deep cleaning", status: "scheduled", time: "5 days ago", icon: Settings, color: "text-yellow-600", bgColor: "bg-yellow-50" },
//     { id: 5, type: "payment", title: "Maintenance Fee", description: "Monthly maintenance", amount: "₹1,500", status: "pending", time: "6 days ago", icon: CreditCard, color: "text-red-600", bgColor: "bg-red-50" },
//   ];

//   // Sample payments data
//   const samplePayments = [
//     { id: 1, payment_for: "Rent - January 2024", amount: 15000, payment_date: "2024-01-01", payment_status: "completed" },
//     { id: 2, payment_for: "Maintenance - January 2024", amount: 1500, payment_date: "2024-01-05", payment_status: "completed" },
//     { id: 3, payment_for: "Rent - February 2024", amount: 15000, payment_date: "2024-02-01", payment_status: "pending" },
//     { id: 4, payment_for: "Electricity Bill - January", amount: 1200, payment_date: "2024-01-15", payment_status: "completed" },
//     { id: 5, payment_for: "Security Deposit", amount: 30000, payment_date: "2023-12-01", payment_status: "completed" },
//   ];

//   // Sample complaints data
//   const sampleComplaints = [
//     { id: 1, title: "AC Not Working", description: "AC in bedroom is not cooling properly", category: "maintenance", priority: "high", status: "in_progress", created_at: "2024-01-20", resolution_notes: "Technician scheduled for tomorrow" },
//     { id: 2, title: "Water Leakage", description: "Water leaking from bathroom ceiling", category: "plumbing", priority: "urgent", status: "resolved", created_at: "2024-01-15", resolution_notes: "Fixed by plumber on Jan 16" },
//     { id: 3, title: "WiFi Issue", description: "Internet speed very slow in evening", category: "internet", priority: "medium", status: "open", created_at: "2024-01-25", resolution_notes: null },
//   ];

//   // -- Auth header helper
//   const getAuthHeaders = () => {
//     const token =
//       typeof window !== "undefined" ? localStorage.getItem("tenant_token") : null;
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   };

//   useEffect(() => {
//     const storage = typeof window !== "undefined" ? window : null;
//     const tenantIdFromStorage = storage ? localStorage.getItem("tenant_id") || sessionStorage.getItem("tenant_id") : null;
//     const tenantToken = storage ? localStorage.getItem("tenant_token") || sessionStorage.getItem("tenant_token") : null;
//     const tenantEmail = storage ? localStorage.getItem("tenant_email") || sessionStorage.getItem("tenant_email") : null;

//     // No token and no tenant_id → not logged in, redirect and stop loading
//     if (!tenantToken && !tenantIdFromStorage) {
//       setLoading(false);
//       router.push("/tenant/login");
//       return;
//     }

//     // Use tenant_id from storage, or fallback to "me" when we have token (e.g. login didn't set tenant_id)
//     const tenantId = tenantIdFromStorage || "me";
//     if (!tenantIdFromStorage && storage) {
//       try {
//         localStorage.setItem("tenant_id", tenantId);
//         sessionStorage.setItem("tenant_id", tenantId);
//       } catch (_) {}
//     }

//     setLoading(true);

//     const mockTenant = {
//       id: tenantId,
//       full_name: "John Doe",
//       email: tenantEmail || "tenant@example.com",
//       phone: "+91 9876543210",
//       portal_access_enabled: true,
//     };

//     const mockBooking = {
//       id: "BOOK001",
//       properties: { name: "ROOMAC PG" },
//       rooms: { room_number: "302" },
//       check_in_date: "2023-12-01",
//       lock_in_end_date: "2024-06-01",
//       property_id: "PROP001",
//       room_id: "ROOM302",
//     };

//     const timer = setTimeout(() => {
//       setTenant(mockTenant);
//       setBooking(mockBooking);
//       setPayments(samplePayments);
//       setComplaints(sampleComplaints);
//       setNotifications([]);
//       setLeaveRequests([]);
//       setLoading(false);
//     }, 800);

//     return () => clearTimeout(timer);
//     // Run only once on mount so the 800ms timer is not reset by router reference changes
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleTenantLogout = () => {
//     logout(); // 🔥 clears auth context + token
//     router.replace("/tenant/login"); // 🔥 replace is IMPORTANT
//   };


//   const handleSubmitComplaint = async () => {
//     if (!tenant || !booking) return;
    
//     try {
//       // Simulate API call
//       const newComplaintData = {
//         id: Date.now(),
//         ...newComplaint,
//         tenant_id: tenant.id,
//         property_id: booking.property_id,
//         room_id: booking.room_id,
//         status: "open",
//         created_at: new Date().toISOString(),
//       };

//       setComplaints([newComplaintData, ...complaints]);
//       setStats(prev => ({ ...prev, openComplaints: prev.openComplaints + 1 }));
      
//       toast.success("Complaint submitted successfully");
//       setShowComplaintDialog(false);
//       setNewComplaint({ title: "", description: "", category: "maintenance", priority: "medium" });
      
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to submit complaint");
//     }
//   };

//   const handleSubmitLeaveRequest = async () => {
//     if (!tenant || !booking) return;
    
//     try {
//       const lockInEndDate = booking.lock_in_end_date ? new Date(booking.lock_in_end_date) : null;
//       const requestedDate = new Date(leaveRequest.requested_leave_date);
//       const lockInCompleted = !lockInEndDate || requestedDate >= lockInEndDate;
//       const lockInViolationDays = lockInEndDate && !lockInCompleted
//         ? Math.ceil((lockInEndDate.getTime() - requestedDate.getTime()) / (1000 * 3600 * 24))
//         : 0;

//       const newLeaveRequest = {
//         id: Date.now(),
//         ...leaveRequest,
//         tenant_id: tenant.id,
//         booking_id: booking.id,
//         property_id: booking.property_id,
//         room_id: booking.room_id,
//         lockInCompleted,
//         lockInViolationDays,
//         status: "pending",
//         created_at: new Date().toISOString(),
//       };

//       setLeaveRequests([newLeaveRequest, ...leaveRequests]);

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
      
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to submit leave request");
//     }
//   };

//   const markNotificationRead = async (notificationId: string) => {
//     try {
//       console.log("Marking notification as read:", notificationId);
//       if (stats.unreadNotifications > 0) {
//         setStats(prev => ({ ...prev, unreadNotifications: prev.unreadNotifications - 1 }));
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const markAllNotificationsRead = async () => {
//     try {
//       setStats(prev => ({ ...prev, unreadNotifications: 0 }));
//       toast.success("All notifications marked as read");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to mark notifications");
//     }
//   };

//   const handleViewAgreement = () => {
//     toast.info("Opening rental agreement...");
//     // Implement agreement viewing logic
//   };

//   const handleDownloadInvoice = () => {
//     toast.success("Invoice download started");
//     // Implement invoice download logic
//   };

//   // Function to handle navigation
//   const handleNavigation = (item: any) => {
//     if (item.href) {
//       router.push(item.href);
//     } else if (item.tab) {
//       setActiveTab(item.tab);
//     }
//   };

//   // Check if item is active
//   const isItemActive = (item: any) => {
//     if (item.href) {
//       return pathname === item.href;
//     } else if (item.tab) {
//       return activeTab === item.tab;
//     }
//     return false;
//   };

//   if (loading) return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
//       <div className="flex flex-col items-center">
//         <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent"></div>
//         <p className="mt-6 text-slate-700 font-medium">Loading your professional dashboard...</p>
//         <p className="text-sm text-slate-500 mt-2">Please wait while we prepare everything</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
//       <aside
//         className={`
//           fixed inset-y-0 left-0 z-40
//           bg-blue-50 border-r border-slate-200
//           shadow-xl transition-all duration-300 ease-in-out
//           ${sidebarCollapsed ? 'w-20' : 'w-64'}
//           flex flex-col
//         `}
//       >
//         {/* ================= HEADER WITH LOGO ================= */}
//         <div className="h-16 border-b border-slate-200 flex items-center justify-center">
//           {!sidebarCollapsed ? (
//             <div className="flex items-center justify-between w-full px-4">
//               <div className="flex items-center gap-3">
//                 <div className="h-25 w-25 mt-2 flex items-center justify-center">
//                   <img 
//                     src={roomacLogo}
//                     alt="ROOMAC"
//                     className="h-14 w-auto object-contain"
//                   />
//                 </div>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => setSidebarCollapsed(true)}
//                 className="h-8 w-8"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </Button>
//             </div>
//           ) : (
//             <div className="flex flex-col items-center gap-3 py-2">
//               <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md">
//                 <span className="text-white font-bold text-lg">R</span>
//               </div>
              
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => setSidebarCollapsed(false)}
//                 className="h-8 w-8 rounded-lg"
//               >
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//             </div>
//           )}
//         </div>

//         {/* ================= NAVIGATION ================= */}
//         <nav className="flex-1 py-4 px-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//           <div className="space-y-1">
//             {navigationItems.map((item) => (
//               <div key={item.id} className="relative group">
//                 <Button
//                   variant="ghost"
//                   onClick={() => handleNavigation(item)}
//                   className={`
//                     w-full flex items-center rounded-xl transition-all
//                     ${sidebarCollapsed ? 'h-11 justify-center' : 'h-11 justify-start px-3'}
//                     ${isItemActive(item)
//                       ? 'bg-blue-600 text-white hover:bg-blue-700'
//                       : 'text-slate-700'
//                     }
//                   `}
//                 >
//                   <item.icon className="h-5 w-5" />

//                   {!sidebarCollapsed && (
//                     <span className="ml-3 text-sm font-medium">{item.label}</span>
//                   )}

//                   {/* Notification badge */}
//                   {!sidebarCollapsed && item.badge && (
//                     <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
//                       {item.badge}
//                     </span>
//                   )}
//                 </Button>

//                 {/* Tooltip for collapsed sidebar */}
//                 {sidebarCollapsed && (
//                   <span
//                     className="
//                       absolute left-16 top-1/2 -translate-y-1/2
//                       bg-slate-900 text-white text-xs
//                       px-2 py-1 rounded
//                       opacity-0 group-hover:opacity-100
//                       transition whitespace-nowrap z-50
//                     "
//                   >
//                     {item.label}
//                     {item.badge && (
//                       <span className="ml-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
//                         {item.badge}
//                       </span>
//                     )}
//                   </span>
//                 )}
//               </div>
//             ))}
//           </div>
//         </nav>

//         {/* ================= PG DETAILS (OPEN ONLY) ================= */}
//         {!sidebarCollapsed && (
//           <div className="px-3 py-3 border-t border-slate-200">
//             <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-sm">
              
//               {/* Compact Header */}
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm">
//                   <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="text-xs font-semibold text-slate-700">My PG Details</h3>
//                   <p className="text-[10px] text-slate-500">Residency</p>
//                 </div>
//               </div>

//               {/* Compact Details */}
//               <div className="space-y-2.5">
//                 {/* PG Name - More Compact */}
//                 <div className="bg-blue-100 rounded-lg p-2.5 border border-slate-100">
//                   <div className="text-[11px] text-slate-500 mb-0.5">PG Name</div>
//                   <div className="flex items-center gap-1.5">
//                     <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
//                     <span className="text-xs font-semibold text-slate-800">
//                       {booking?.properties?.name || 'Roomac PG '}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Room & Rent - More Compact */}
//                 <div className="grid grid-cols-2 gap-2.5">
//                   <div className="bg-blue-100 rounded-lg p-2.5 border border-slate-100">
//                     <div className="text-[11px] text-slate-500 mb-0.5">Room</div>
//                     <div className="flex items-center gap-1.5">
//                       <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
//                       <span className="text-xs font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
//                         #{booking?.rooms?.room_number || '302'}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="bg-blue-50 rounded-lg p-2.5 border border-slate-100">
//                     <div className="text-[11px] text-slate-500 mb-0.5">Monthly Rent</div>
//                     <div className="flex items-center gap-1.5">
//                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
//                       <span className="text-xs font-bold text-emerald-700">
//                         ₹{stats.rentAmount.toLocaleString()}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Compact Days Left Banner */}
//                 <div className="mt-3 pt-3 border-t border-amber-200">
//                   <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-center">
//                     <div className="text-[11px] font-medium text-white mb-0.5">Next payment in</div>
//                     <div className="flex items-center justify-center gap-1.5">
//                       <span className="text-xl font-bold text-white">{stats.daysUntilRentDue}</span>
//                       <div className="text-left">
//                         <div className="text-[11px] font-semibold text-white">Days</div>
//                         <div className="text-[9px] text-amber-100">Left</div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ================= FOOTER ================= */}
//         <div className="border-t border-slate-200 py-3 px-2">
//           <div className="space-y-1">
//             <Button
//               variant="ghost"
//               onClick={() => router.push('/tenant/settings')}
//               className={`w-full rounded-xl transition-all ${
//                 sidebarCollapsed ? 'h-11 justify-center' : 'h-11 justify-start px-3'
//               } text-slate-600 hover:bg-slate-100`}
//             >
//               <Settings className="h-5 w-5" />
//               {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">Settings</span>}
//             </Button>

//             <Button
//               variant="ghost"
//               onClick={handleTenantLogout}
//               className={`w-full rounded-xl transition-all ${sidebarCollapsed ? 'h-11 justify-center' : 'h-11 justify-start px-3'
//                 } text-red-600 hover:bg-red-50`}
//             >
//               <LogOut className="h-5 w-5" />
//               {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
//             </Button>

//           </div>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <div className={`
//         transition-all duration-300
//         ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
//         min-h-screen
//       `}>
//         {/* Professional Header */}
//         <TenantHeader
//           tenantName={tenant?.full_name || "Guest"}
//           tenantEmail={tenant?.email}
//           notificationCount={stats.unreadNotifications}
//           onLogout={handleTenantLogout}
//           onNotificationsClick={() => setActiveTab("notifications")}
//           sidebarCollapsed={sidebarCollapsed}
//           onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
//         />

//         {/* Main Content */}
//         <main className="p-2 sm:p-4 md:p-5">
//           {/* Welcome Section - More Compact */}
//           <div className="mb-2 relative group">
//             <div className="absolute inset-0 bg-slate-100/50 rounded-lg blur-xl group-hover:blur-2xl transition-all"></div>
            
//             <div className="relative p-4 rounded-lg border border-slate-200/80 bg-white/80 backdrop-blur-sm  transition-all">
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//                 <div className="space-y-1.5">
//                   <div className="flex items-center gap-2">
//                     <div className="relative">
//                       <span className="text-3xl animate-wave">👋</span>
//                     </div>
//                     <div>
//                       <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
//                         Hey, <span className="text-blue-600">{tenant?.full_name?.split(" ")[0] || "Tenant"}</span>
//                       </h1>
//                       <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
//                         <span className="relative flex h-2 w-2">
//                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
//                           <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
//                         </span>
//                         Active session • Dashboard overview
//                       </p>
//                     </div>
//                   </div>
//                 </div>
                
//                 <Button size="sm" className="relative overflow-hidden bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all group">
//                   <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></span>
//                   <Download className="h-3.5 w-3.5 mr-1.5 relative z-10" />
//                   <span className="relative z-10 text-sm font-medium">Export</span>
//                 </Button>
//               </div>
//             </div>
//           </div>

//           <style>{`
//             @keyframes wave {
//               0%, 100% { transform: rotate(0deg); }
//               25% { transform: rotate(15deg); }
//               75% { transform: rotate(-15deg); }
//             }
//             .animate-wave {
//               animation: wave 2.5s ease-in-out infinite;
//               display: inline-block;
//               transform-origin: 70% 70%;
//             }
//           `}</style>


          

//           {/* Key Metrics Grid - More Compact and Attractive */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
//             {/* Rent Due Card */}
//             <Card className="border border-blue-200/50 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-all">
//               <CardContent className="p-3">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
//                       <Calendar className="h-4 w-4 text-blue-600" />
//                     </div>
//                     <div>
//                       <p className="text-xs font-medium text-slate-600">Rent Due</p>
//                       <div className="flex items-baseline gap-1">
//                         <p className="text-lg font-bold text-slate-900">{stats.daysUntilRentDue}</p>
//                         <span className="text-xs font-medium text-slate-500">days</span>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-xs text-slate-500 mb-1">Amount</p>
//                     <p className="text-base font-bold text-blue-700">₹{stats.rentAmount.toLocaleString()}</p>
//                   </div>
//                 </div>
//                 <div className="mt-3">
//                   <div className="flex justify-between text-xs text-slate-500 mb-1">
//                     <span>Today</span>
//                     <span className="font-medium">{stats.nextDueDate}</span>
//                   </div>
//                   <div className="w-full bg-slate-100 rounded-full h-1.5">
//                     <div 
//                       className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-1.5 transition-all duration-500" 
//                       style={{ width: `${Math.min((stats.daysUntilRentDue / 30) * 100, 100)}%` }}
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Issues Card */}
//             <Card className="border border-orange-200/50 bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-all">
//               <CardContent className="p-3">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
//                       <AlertTriangle className="h-4 w-4 text-orange-600" />
//                     </div>
//                     <div>
//                       <p className="text-xs font-medium text-slate-600">Open Issues</p>
//                       <p className="text-lg font-bold text-slate-900">{stats.openComplaints}</p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-xs text-slate-500 mb-1">Urgent</p>
//                     <Badge variant="destructive" className="text-xs px-2 py-0.5">1</Badge>
//                   </div>
//                 </div>
//                 <div className="mt-3 flex gap-1">
//                   <div className="flex-1 bg-amber-100 rounded-lg p-1.5 text-center">
//                     <p className="text-xs font-semibold text-amber-900">In Progress</p>
//                     <p className="text-xs text-amber-700">1</p>
//                   </div>
//                   <div className="flex-1 bg-orange-100 rounded-lg p-1.5 text-center">
//                     <p className="text-xs font-semibold text-orange-900">Pending</p>
//                     <p className="text-xs text-orange-700">1</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Payments Card */}
//             <Card className="border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white shadow-sm hover:shadow-md transition-all">
//               <CardContent className="p-3">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
//                       <CreditCard className="h-4 w-4 text-emerald-600" />
//                     </div>
//                     <div>
//                       <p className="text-xs font-medium text-slate-600">Pending</p>
//                       <p className="text-lg font-bold text-slate-900">{stats.pendingPayments}</p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-xs text-slate-500 mb-1">Total</p>
//                     <p className="text-base font-bold text-emerald-700">₹1,500</p>
//                   </div>
//                 </div>
//                 <div className="mt-3">
//                   <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 h-7 text-xs">
//                     <CreditCard className="h-3 w-3 mr-1.5" />
//                     Pay Now
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* PG Performance Card */}
//             <Card className="border border-purple-200/50 bg-gradient-to-br from-purple-50 to-white shadow-sm hover:shadow-md transition-all">
//               <CardContent className="p-3">
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="flex items-center gap-2">
//                     <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
//                       <TrendingUp className="h-4 w-4 text-purple-600" />
//                     </div>
//                     <div>
//                       <p className="text-xs font-medium text-slate-600">PG Rating</p>
//                       <p className="text-lg font-bold text-slate-900">4.8</p>
//                     </div>
//                   </div>
//                   <Badge className="bg-green-500 hover:bg-green-600 text-xs">
//                     <TrendingUp className="h-3 w-3 mr-1" />
//                     +0.5
//                   </Badge>
//                 </div>
//                 <div className="grid grid-cols-3 gap-1">
//                   {[
//                     { label: "Clean", score: stats.cleanlinessScore, color: "bg-emerald-400" },
//                     { label: "Maint", score: stats.maintenanceScore, color: "bg-blue-400" },
//                     { label: "Commu", score: stats.communityScore, color: "bg-purple-400" },
//                   ].map((item, index) => (
//                     <div key={index} className="text-center">
//                       <div className="text-xs font-bold text-slate-900">{item.score}</div>
//                       <div className="text-[10px] text-slate-600">{item.label}</div>
//                       <div className="h-1 rounded-full bg-slate-200 mt-1">
//                         <div className={`h-1 rounded-full ${item.color}`} style={{ width: `${item.score * 10}%` }} />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Quick Actions Grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
//             <Button 
//               variant="outline" 
//               className="h-11 justify-start border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
//               onClick={() => setShowComplaintDialog(true)}
//             >
//               <div className="h-7 w-7 rounded-md bg-blue-100 flex items-center justify-center mr-3">
//                 <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
//               </div>
//               <div className="text-left">
//                 <p className="text-xs font-medium text-slate-700">Raise Complaint</p>
//                 <p className="text-[10px] text-slate-500">Report any issues</p>
//               </div>
//             </Button>

//             <Button 
//               variant="outline" 
//               className="h-11 justify-start border-green-200 hover:border-green-400 hover:bg-green-50 transition-all"
//               onClick={() => setShowLeaveDialog(true)}
//             >
//               <div className="h-7 w-7 rounded-md bg-green-100 flex items-center justify-center mr-3">
//                 <Calendar className="h-3.5 w-3.5 text-green-600" />
//               </div>
//               <div className="text-left">
//                 <p className="text-xs font-medium text-slate-700">Request Leave</p>
//                 <p className="text-[10px] text-slate-500">Vacation or early leave</p>
//               </div>
//             </Button>

//             <Button 
//               variant="outline" 
//               className="h-11 justify-start border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
//               onClick={handleViewAgreement}
//             >
//               <div className="h-7 w-7 rounded-md bg-purple-100 flex items-center justify-center mr-3">
//                 <FileText className="h-3.5 w-3.5 text-purple-600" />
//               </div>
//               <div className="text-left">
//                 <p className="text-xs font-medium text-slate-700">View Agreement</p>
//                 <p className="text-[10px] text-slate-500">Rental contract</p>
//               </div>
//             </Button>

//             <Button 
//               variant="outline" 
//               className="h-11 justify-start border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all"
//               onClick={handleDownloadInvoice}
//             >
//               <div className="h-7 w-7 rounded-md bg-amber-100 flex items-center justify-center mr-3">
//                 <Receipt className="h-3.5 w-3.5 text-amber-600" />
//               </div>
//               <div className="text-left">
//                 <p className="text-xs font-medium text-slate-700">Download Invoice</p>
//                 <p className="text-[10px] text-slate-500">Payment receipts</p>
//               </div>
//             </Button>
//           </div>

//           {/* Main Content Tabs */}
//           <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//             <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 p-0.5 rounded-lg w-full overflow-x-auto shadow-sm">
//               <TabsTrigger value="dashboard" className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all flex-1 text-sm py-2">
//                 <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
//                 Dashboard
//               </TabsTrigger>
//               <TabsTrigger value="payments" className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white transition-all flex-1 text-sm py-2">
//                 <CreditCard className="h-3.5 w-3.5 mr-1.5" />
//                 Payments
//               </TabsTrigger>
//               <TabsTrigger value="complaints" className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white transition-all flex-1 text-sm py-2">
//                 <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
//                 Complaints
//               </TabsTrigger>
//               <TabsTrigger value="notifications" className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white transition-all flex-1 text-sm py-2">
//                 <Bell className="h-3.5 w-3.5 mr-1.5" />
//                 Notifications
//               </TabsTrigger>
//             </TabsList>

//             {/* Dashboard Tab */}
//             <TabsContent value="dashboard" className="space-y-4">
//              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//   {/* Left Column - Recent Activity - Ab 50% width */}
//   <div>
//     <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all h-full">
//       <CardHeader className="border-b border-slate-100 px-4 py-3">
//         <div className="flex items-center justify-between">
//           <CardTitle className="flex items-center gap-2 text-sm font-semibold">
//             <div className="h-5 w-5 rounded-md bg-blue-100 flex items-center justify-center">
//               <Clock className="h-3 w-3 text-blue-600" />
//             </div>
//             Recent Activity
//           </CardTitle>
//           <Button
//             variant="ghost"
//             size="sm"
//             className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 text-xs px-2"
//           >
//             View All
//             <ChevronRight className="h-3 w-3 ml-1" />
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent className="p-0">
//         <div className="divide-y divide-slate-100">
//           {recentActivities.map((activity) => (
//             <div
//               key={activity.id}
//               className="px-4 py-3 hover:bg-slate-50/50 transition-colors"
//             >
//               <div className="flex items-start gap-3">
//                 <div className={`${activity.bgColor} p-1.5 rounded-md shrink-0`}>
//                   <activity.icon className={`h-3.5 w-3.5 ${activity.color}`} />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-start justify-between gap-2">
//                     <div>
//                       <p className="font-medium text-slate-900 text-sm">{activity.title}</p>
//                       <p className="text-xs text-slate-600 mt-0.5">{activity.description}</p>
//                       {activity.amount && (
//                         <p className="text-sm font-semibold text-green-600 mt-1">{activity.amount}</p>
//                       )}
//                     </div>
//                     <Badge
//                       variant={
//                         activity.status === "completed"
//                           ? "default"
//                           : activity.status === "in_progress"
//                           ? "secondary"
//                           : "outline"
//                       }
//                       className="text-[10px] px-2 py-0 h-5"
//                     >
//                       {activity.status}
//                     </Badge>
//                   </div>
//                   <p className="text-[10px] text-slate-400 mt-2">{activity.time}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   </div>

//   {/* Right Column - Quick Actions & Amenities - Ab 50% width */}
//   <div className="space-y-4">
//     {/* Quick Actions */}
//     <Card className="border-slate-200 shadow-sm">
//       <CardHeader className="pb-2">
//         <CardTitle className="flex items-center gap-2 text-sm font-semibold">
//           <Zap className="h-4 w-4 text-orange-600" />
//           Quick Actions
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="pt-0">
//         <div className="space-y-2">
//           <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
//             <DialogTrigger asChild>
//               <Button variant="outline" className="w-full justify-start h-9 text-sm border-blue-200 hover:border-blue-400 hover:bg-blue-50">
//                 <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
//                 Raise Complaint
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-md">
//               <DialogHeader className="pb-2">
//                 <DialogTitle className="text-sm">Submit Complaint</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-3">
//                 <div>
//                   <Label className="text-xs font-medium">Title</Label>
//                   <Input
//                     value={newComplaint.title}
//                     onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
//                     className="mt-1 h-9 text-sm"
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label className="text-xs font-medium">Category</Label>
//                     <Select value={newComplaint.category} onValueChange={(value) => setNewComplaint({ ...newComplaint, category: value })}>
//                       <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="maintenance">Maintenance</SelectItem>
//                         <SelectItem value="cleanliness">Cleanliness</SelectItem>
//                         <SelectItem value="noise">Noise</SelectItem>
//                         <SelectItem value="security">Security</SelectItem>
//                         <SelectItem value="amenities">Amenities</SelectItem>
//                         <SelectItem value="billing">Billing</SelectItem>
//                         <SelectItem value="other">Other</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label className="text-xs font-medium">Priority</Label>
//                     <Select value={newComplaint.priority} onValueChange={(value) => setNewComplaint({ ...newComplaint, priority: value })}>
//                       <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="low">Low</SelectItem>
//                         <SelectItem value="medium">Medium</SelectItem>
//                         <SelectItem value="high">High</SelectItem>
//                         <SelectItem value="urgent">Urgent</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div>
//                   <Label className="text-xs font-medium">Description</Label>
//                   <Textarea
//                     value={newComplaint.description}
//                     onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
//                     rows={3}
//                     className="mt-1 text-sm"
//                   />
//                 </div>
//                 <Button onClick={handleSubmitComplaint} className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm">
//                   Submit Complaint
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>

//           <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
//             <DialogTrigger asChild>
//               <Button variant="outline" className="w-full justify-start h-9 text-sm hover:bg-slate-50">
//                 <Calendar className="h-4 w-4 mr-2" />
//                 Request Leave
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-md">
//               <DialogHeader className="pb-2">
//                 <DialogTitle className="text-sm">Submit Leave Request</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-3">
//                 {booking?.lock_in_end_date && (
//                   <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs">
//                     <p className="font-semibold text-yellow-900">Lock-in Period Info</p>
//                     <p className="text-yellow-800">Ends: {new Date(booking.lock_in_end_date).toLocaleDateString()}</p>
//                     <p className="text-[10px] text-yellow-700">Leaving early may forfeit deposit</p>
//                   </div>
//                 )}
//                 <div>
//                   <Label className="text-xs font-medium">Requested Leave Date</Label>
//                   <Input
//                     type="date"
//                     value={leaveRequest.requested_leave_date}
//                     onChange={(e) => setLeaveRequest({ ...leaveRequest, requested_leave_date: e.target.value })}
//                     className="mt-1 h-9 text-sm"
//                   />
//                 </div>
//                 <div>
//                   <Label className="text-xs font-medium">Reason</Label>
//                   <Textarea
//                     value={leaveRequest.reason}
//                     onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
//                     rows={3}
//                     className="mt-1 text-sm"
//                   />
//                 </div>
//                 <Button onClick={handleSubmitLeaveRequest} className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm">
//                   Submit Request
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </CardContent>
//     </Card>

//     {/* Room Amenities */}
//     <Card className="border-slate-200 shadow-sm">
//       <CardHeader className="pb-2">
//         <CardTitle className="flex items-center gap-2 text-sm font-semibold">
//           <Home className="h-4 w-4 text-blue-600" />
//           Room Amenities
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="pt-0">
//         <div className="grid grid-cols-3 gap-2">
//           {roomAmenities.map((amenity, index) => (
//             <div key={index} className="flex flex-col items-center p-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
//               <div className="h-7 w-7 rounded-md bg-blue-50 flex items-center justify-center mb-1">
//                 {amenity.icon}
//               </div>
//               <p className="text-xs font-semibold text-slate-900 text-center">{amenity.name}</p>
//               <p className="text-[10px] text-slate-500">{amenity.status}</p>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   </div>
// </div>
//             </TabsContent>

//             {/* Payments Tab */}
//             <TabsContent value="payments" className="space-y-4">
//               <Card className="border border-slate-200/80 shadow-sm">
//                 <CardHeader className="px-4 py-3">
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                     <CardTitle className="text-base font-semibold">Payment History</CardTitle>
//                     <div className="flex items-center gap-2">
//                       <Button variant="outline" size="sm" className="hover:bg-slate-50 h-8 text-xs">
//                         <Download className="h-3.5 w-3.5 mr-1.5" />
//                         Export
//                       </Button>
//                       <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 text-xs">
//                         <Plus className="h-3.5 w-3.5 mr-1.5" />
//                         Make Payment
//                       </Button>
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="px-4 pb-4">
//                   <div className="space-y-3">
//                     {samplePayments.map((payment) => (
//                       <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-200/80 rounded-lg hover:shadow-sm hover:border-slate-300 transition-all bg-white">
//                         <div className="flex-1">
//                           <p className="font-semibold text-sm text-slate-900">{payment.payment_for}</p>
//                           <p className="text-xs text-slate-600 mt-0.5">
//                             {new Date(payment.payment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
//                           </p>
//                         </div>
//                         <div className="flex items-center gap-3 mt-2 sm:mt-0">
//                           <p className="font-bold text-base text-green-700">₹{Number(payment.amount).toLocaleString()}</p>
//                           <Badge variant={payment.payment_status === "completed" ? "default" : "destructive"} className="shrink-0 text-xs">
//                             {payment.payment_status}
//                           </Badge>
//                           <Button variant="ghost" size="icon" className="hover:bg-slate-100 h-8 w-8">
//                             <Eye className="h-3.5 w-3.5" />
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Complaints Tab */}
//             <TabsContent value="complaints" className="space-y-4">
//               <Card className="border border-slate-200/80 shadow-sm">
//                 <CardHeader className="px-4 py-3">
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                     <CardTitle className="text-base font-semibold">My Complaints</CardTitle>
//                     <Button 
//                       className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
//                       onClick={() => setShowComplaintDialog(true)}
//                     >
//                       <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
//                       New Complaint
//                     </Button>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="px-4 pb-4">
//                   <div className="space-y-3">
//                     {complaints.map((complaint) => (
//                       <div key={complaint.id} className="border border-slate-200/80 rounded-lg p-3 hover:shadow-sm hover:border-slate-300 transition-all bg-white">
//                         <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
//                           <div>
//                             <p className="font-semibold text-sm text-slate-900 leading-tight">{complaint.title}</p>
//                             <div className="flex gap-1.5 mt-1 flex-wrap">
//                               <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5">{complaint.category}</Badge>
//                               <Badge variant={
//                                 complaint.priority === "urgent" ? "destructive" :
//                                 complaint.priority === "high" ? "default" : "secondary"
//                               } className="text-[10px] px-2 py-0.5 h-5">
//                                 {complaint.priority}
//                               </Badge>
//                             </div>
//                           </div>
//                           <Badge
//                             variant={
//                               complaint.status === "resolved" ? "default" :
//                               complaint.status === "in_progress" ? "secondary" : "destructive"
//                             }
//                             className="sm:self-start shrink-0 text-xs"
//                           >
//                             {complaint.status}
//                           </Badge>
//                         </div>
//                         <p className="text-xs text-slate-600 leading-relaxed">{complaint.description}</p>
//                         {complaint.resolution_notes && (
//                           <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
//                             <p className="text-xs font-semibold text-green-900 flex items-center gap-1">
//                               <CheckCircle className="h-3.5 w-3.5" />
//                               Resolution Notes
//                             </p>
//                             <p className="text-xs text-green-800 mt-0.5 leading-relaxed">{complaint.resolution_notes}</p>
//                           </div>
//                         )}
//                         <p className="text-[10px] text-slate-400 mt-3">
//                           Submitted {new Date(complaint.created_at).toLocaleString()}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Notifications Tab */}
//             <TabsContent value="notifications" className="space-y-4">
//               <Card className="border border-slate-200/80 shadow-sm">
//                 <CardHeader className="px-4 py-3">
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-base font-semibold">Notifications</CardTitle>
//                     {stats.unreadNotifications > 0 && (
//                       <Button size="sm" variant="outline" onClick={markAllNotificationsRead} className="hover:bg-slate-50 h-8 text-xs">
//                         Mark All Read
//                       </Button>
//                     )}
//                   </div>
//                 </CardHeader>
//                 <CardContent className="px-4 pb-4">
//                   <div className="space-y-3">
//                     {[
//                       { id: 1, title: "Rent Payment Reminder", message: "Your rent payment is due in 7 days", created_at: "2024-01-25T09:00:00Z", is_read: false },
//                       { id: 2, title: "Complaint Update", message: "Your maintenance request is now in progress", created_at: "2024-01-24T14:30:00Z", is_read: false },
//                       { id: 3, title: "Community Event", message: "Monthly dinner party this Friday at 7 PM", created_at: "2024-01-22T11:00:00Z", is_read: true },
//                       { id: 4, title: "Document Ready", message: "Your rental agreement has been updated", created_at: "2024-01-20T16:45:00Z", is_read: true },
//                     ].map((notification) => (
//                       <div
//                         key={notification.id}
//                         className={`p-3 rounded-lg border ${
//                           notification.is_read 
//                             ? "bg-white border-slate-200/80 hover:border-slate-300" 
//                             : "bg-blue-50 border-blue-200 hover:border-blue-300"
//                         } cursor-pointer hover:shadow-sm transition-all`}
//                         onClick={() => !notification.is_read && markNotificationRead(notification.id as any)}
//                       >
//                         <div className="flex justify-between items-start gap-3">
//                           <div className="flex-1">
//                             <p className="font-semibold text-sm text-slate-900 leading-tight">{notification.title}</p>
//                             <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notification.message}</p>
//                             <p className="text-[10px] text-slate-400 mt-2">
//                               {new Date(notification.created_at).toLocaleString()}
//                             </p>
//                           </div>
//                           {!notification.is_read && (
//                             <div className="shrink-0">
//                               <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         </main>
//       </div>
//     </div>
//   );
// }





// // app/tenant/portal/page.tsx
// // import { Suspense } from "react";
// // import TenantDashboardClient from "@/components/tenant/portal/TenantDashboardClient";
// // import LoadingSpinner from "@/components/tenant/portal/loading-spinner";


// // // This stays exactly the same as your original design
// // const initialData = {
// //   tenant: {
// //     id: "TEN001",
// //     full_name: "John Doe",
// //     email: "john.doe@example.com",
// //     phone: "+91 9876543210",
// //     portal_access_enabled: true,
// //   },
// //   booking: {
// //     id: "BOOK001",
// //     properties: { name: "ROOMAC PG" },
// //     rooms: { room_number: "302" },
// //     check_in_date: "2023-12-01",
// //     lock_in_end_date: "2024-06-01",
// //     property_id: "PROP001",
// //     room_id: "ROOM302",
// //   },
// //   payments: [
// //     { id: 1, payment_for: "Rent - January 2024", amount: 15000, payment_date: "2024-01-01", payment_status: "completed" },
// //     { id: 2, payment_for: "Maintenance - January 2024", amount: 1500, payment_date: "2024-01-05", payment_status: "completed" },
// //     { id: 3, payment_for: "Rent - February 2024", amount: 15000, payment_date: "2024-02-01", payment_status: "pending" },
// //     { id: 4, payment_for: "Electricity Bill - January", amount: 1200, payment_date: "2024-01-15", payment_status: "completed" },
// //     { id: 5, payment_for: "Security Deposit", amount: 30000, payment_date: "2023-12-01", payment_status: "completed" },
// //   ],
// //   complaints: [
// //     { id: 1, title: "AC Not Working", description: "AC in bedroom is not cooling properly", category: "maintenance", priority: "high", status: "in_progress", created_at: "2024-01-20", resolution_notes: "Technician scheduled for tomorrow" },
// //     { id: 2, title: "Water Leakage", description: "Water leaking from bathroom ceiling", category: "plumbing", priority: "urgent", status: "resolved", created_at: "2024-01-15", resolution_notes: "Fixed by plumber on Jan 16" },
// //     { id: 3, title: "WiFi Issue", description: "Internet speed very slow in evening", category: "internet", priority: "medium", status: "open", created_at: "2024-01-25", resolution_notes: null },
// //   ],
// //   stats: {
// //     totalPayments: 8,
// //     pendingPayments: 2,
// //     openComplaints: 1,
// //     unreadNotifications: 3,
// //     daysUntilRentDue: 7,
// //     rentAmount: 15000,
// //     occupancyDays: 45,
// //     depositAmount: 30000,
// //     nextDueDate: "2024-02-05",
// //     maintenanceScore: 8.5,
// //     cleanlinessScore: 9.0,
// //     communityScore: 8.7,
// //   },
// //   notifications: [],
// //   leaveRequests: [],
// // };

// // export default function TenantPortalPage() {
// //   return (
// //     <Suspense fallback={<LoadingSpinner message="Loading your dashboard..." />}>
// //       <TenantDashboardClient initialData={initialData} />
// //     </Suspense>
// //   );
// // }





// // app/tenant/dashboard/page.tsx
// "use client";

// import { useEffect, useState, useCallback, useRef } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
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
//   Menu,
//   X,
//   Shield,
//   Wifi,
//   Users,
//   Coffee,
//   Building,
//   Bed,
//   Clock,
//   CreditCard,
//   FileCheck,
//   HelpCircle,
//   Phone,
//   Mail,
//   ChevronDown,
//   Star,
//   TrendingUp,
//   BarChart3,
//   Receipt,
//   CalendarDays,
//   AlertTriangle,
//   CheckCircle2,
//   ChevronRight,
//   ChevronLeft,
//   Search,
//   Sun,
//   Moon,
//   Plus,
//   MoreVertical,
//   Eye,
//   Edit,
//   Trash2,
//   Zap,
//   Target,
//   TrendingDown,
//   Thermometer,
//   Droplets,
//   Wind,
//   Battery,
//   ShieldCheck,
//   ClipboardCheck,
//   Users2,
//   ParkingCircle,
//   Dumbbell,
//   Tv,
//   Microwave,
//   Refrigerator,
//   Armchair,
//   Lamp,
//   Fan,
//   MapPin,
//   Briefcase,
//   Globe,
// } from "lucide-react";

// // Components
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { toast } from "sonner";

// // API Imports
// import {
//   getTenantProfile,
//   getTenantToken,
//   getTenantId,
//   logoutTenant,
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

// import { tenantSettingsApi } from "@/lib/tenantSettingsApi";

// // Assets
// import roomacLogo from "@/app/src/assets/images/roomaclogo.webp";

// // Types
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
//   maintenanceScore: number;
//   cleanlinessScore: number;
//   communityScore: number;
// }

// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   type: 'payment' | 'complaint' | 'event' | 'document' | 'general';
//   is_read: boolean;
//   created_at: string;
//   metadata?: any;
// }

// // Notification Popup Component
// function NotificationPopup({
//   notifications,
//   unreadCount,
//   onMarkAllRead,
//   onNotificationClick,
//   onClose,
//   onViewAll,
// }: {
//   notifications: Notification[];
//   unreadCount: number;
//   onMarkAllRead: () => void;
//   onNotificationClick: (notification: Notification) => void;
//   onClose: () => void;
//   onViewAll: () => void;
// }) {
//   const popupRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
//         onClose();
//       }
//     }

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [onClose]);

//   const getIcon = (type: string) => {
//     switch (type) {
//       case 'payment': return <CreditCard className="h-4 w-4 text-blue-600" />;
//       case 'complaint': return <AlertCircle className="h-4 w-4 text-orange-600" />;
//       case 'event': return <Calendar className="h-4 w-4 text-green-600" />;
//       case 'document': return <FileText className="h-4 w-4 text-purple-600" />;
//       default: return <Bell className="h-4 w-4 text-gray-600" />;
//     }
//   };

//   return (
//     <div
//       ref={popupRef}
//       className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50"
//     >
//       <div className="p-3 border-b border-slate-200 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <Bell className="h-4 w-4 text-blue-600" />
//           <p className="font-semibold text-sm">Notifications</p>
//           {unreadCount > 0 && (
//             <Badge variant="destructive" className="text-xs px-1.5 py-0 h-5">
//               {unreadCount}
//             </Badge>
//           )}
//         </div>
//         {unreadCount > 0 && (
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={onMarkAllRead}
//             className="h-6 text-xs hover:bg-slate-100"
//           >
//             Mark all read
//           </Button>
//         )}
//       </div>

//       <div className="max-h-96 overflow-y-auto">
//         {notifications.length > 0 ? (
//           notifications.slice(0, 5).map((notification) => (
//             <div
//               key={notification.id}
//               className={`p-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${
//                 !notification.is_read ? 'bg-blue-50/50' : ''
//               }`}
//               onClick={() => onNotificationClick(notification)}
//             >
//               <div className="flex items-start gap-2.5">
//                 <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
//                   notification.is_read ? 'bg-slate-100' : 'bg-blue-100'
//                 }`}>
//                   {getIcon(notification.type)}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-start justify-between gap-2">
//                     <p className="font-medium text-sm text-slate-900 leading-tight">
//                       {notification.title}
//                     </p>
//                     {!notification.is_read && (
//                       <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-1"></div>
//                     )}
//                   </div>
//                   <p className="text-xs text-slate-600 mt-1 leading-relaxed">
//                     {notification.message}
//                   </p>
//                   <p className="text-[10px] text-slate-400 mt-2">
//                     {new Date(notification.created_at).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="p-4 text-center text-sm text-slate-500">
//             No notifications
//           </div>
//         )}
//       </div>

//       <div className="p-3 border-t border-slate-200">
//         <Button
//           variant="ghost"
//           size="sm"
//           className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 text-xs"
//           onClick={onViewAll}
//         >
//           View all notifications
//         </Button>
//       </div>
//     </div>
//   );
// }

// // Profile Dropdown Component
// function ProfileDropdown({
//   tenant,
//   onLogout,
//   onSettings,
//   onProfile,
// }: {
//   tenant: TenantProfile | null;
//   onLogout: () => void;
//   onSettings: () => void;
//   onProfile: () => void;
// }) {
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setOpen(false);
//       }
//     }

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <Button
//         variant="ghost"
//         className="relative h-8 w-8 rounded-full"
//         onClick={() => setOpen(!open)}
//       >
//         <Avatar className="h-8 w-8">
//           <AvatarImage src={tenant?.photo_url} alt={tenant?.full_name} />
//           <AvatarFallback className="bg-blue-100 text-blue-600">
//             {tenant?.full_name?.charAt(0) || 'T'}
//           </AvatarFallback>
//         </Avatar>
//       </Button>

//       {open && (
//         <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
//           <div className="p-3 border-b border-slate-200">
//             <p className="font-medium text-sm text-slate-900">{tenant?.full_name}</p>
//             <p className="text-xs text-slate-500 truncate">{tenant?.email}</p>
//           </div>
          
//           <div className="p-1">
//             <Button
//               variant="ghost"
//               className="w-full justify-start h-9 px-2 text-sm"
//               onClick={() => {
//                 onProfile();
//                 setOpen(false);
//               }}
//             >
//               <User className="h-4 w-4 mr-2" />
//               Profile
//             </Button>
            
//             <Button
//               variant="ghost"
//               className="w-full justify-start h-9 px-2 text-sm"
//               onClick={() => {
//                 onSettings();
//                 setOpen(false);
//               }}
//             >
//               <Settings className="h-4 w-4 mr-2" />
//               Settings
//             </Button>
//           </div>

//           <div className="border-t border-slate-200 p-1">
//             <Button
//               variant="ghost"
//               className="w-full justify-start h-9 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
//               onClick={() => {
//                 onLogout();
//                 setOpen(false);
//               }}
//             >
//               <LogOut className="h-4 w-4 mr-2" />
//               Logout
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Minimal Sidebar Component
// function MinimalSidebar({
//   collapsed,
//   onToggle,
//   activeTab,
//   onNavigate,
//   tenantName,
//   notificationCount,
// }: {
//   collapsed: boolean;
//   onToggle: () => void;
//   activeTab: string;
//   onNavigate: (tab: string) => void;
//   tenantName: string;
//   notificationCount: number;
// }) {
//   const navigationItems = [
//     { id: "dashboard", label: "Dashboard", icon: Home },
//     { id: "payments", label: "Payments", icon: CreditCard },
//     { id: "documents", label: "Documents", icon: FileText },
//     { id: "my-documents", label: "My Documents", icon: FolderOpen },
//     { id: "notifications", label: "Notifications", icon: Bell, badge: notificationCount },
//     { id: "profile", label: "Profile", icon: User },
//     { id: "settings", label: "Settings", icon: Settings },
//   ];

//   return (
//     <aside
//       className={`
//         fixed inset-y-0 left-0 z-40
//         bg-white border-r border-slate-200
//         shadow-lg transition-all duration-300
//         ${collapsed ? 'w-20' : 'w-64'}
//         flex flex-col
//       `}
//     >
//       {/* Logo Section */}
//       <div className="h-16 border-b border-slate-100 flex items-center px-4">
//         {!collapsed ? (
//           <div className="flex items-center justify-between w-full">
//             <div className="flex items-center gap-2">
//               <div className="h-9 w-9 relative">
//                 <Image
//                   src={roomacLogo}
//                   alt="ROOMAC"
//                   width={40}
//                   height={42}
//                   className="object-contain"
//                 />
//               </div>
//             </div>
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={onToggle}
//               className="h-8 w-8 hover:bg-slate-100"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center w-full gap-2">
//             <div className="h-8 w-8 relative">
//               <Image
//                 src={roomacLogo}
//                 alt="ROOMAC"
//                 width={32}
//                 height={32}
//                 className="object-contain"
//               />
//             </div>
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={onToggle}
//               className="h-8 w-8 hover:bg-slate-100"
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         )}
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 py-4 px-2 overflow-y-auto">
//         <div className="space-y-1">
//           {navigationItems.map((item) => (
//             <div key={item.id} className="relative group">
//               <Button
//                 variant="ghost"
//                 onClick={() => onNavigate(item.id)}
//                 className={`
//                   w-full flex items-center rounded-lg transition-all
//                   ${collapsed ? 'h-10 justify-center' : 'h-10 justify-start px-3'}
//                   ${activeTab === item.id
//                     ? 'bg-blue-50 text-blue-600'
//                     : 'text-slate-600 hover:bg-slate-100'
//                   }
//                 `}
//               >
//                 <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-500'}`} />
                
//                 {!collapsed && (
//                   <>
//                     <span className="ml-3 text-sm">{item.label}</span>
//                     {item.badge ? (
//                       <Badge 
//                         variant="destructive" 
//                         className="ml-auto text-[10px] px-1.5 py-0 h-4 min-w-4"
//                       >
//                         {item.badge > 9 ? '9+' : item.badge}
//                       </Badge>
//                     ) : null}
//                   </>
//                 )}
//               </Button>

//               {/* Tooltip for collapsed mode */}
//               {collapsed && (
//                 <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
//                   {item.label}
//                   {item.badge ? ` (${item.badge})` : ''}
//                 </span>
//               )}
//             </div>
//           ))}
//         </div>
//       </nav>

//       {/* Weather Widget */}
//       {!collapsed && (
//         <div className="px-3 py-3 border-t border-slate-100">
//           <div className="flex items-center gap-2 text-slate-600">
//             <Sun className="h-4 w-4 text-yellow-500" />
//             <span className="text-sm">29°C Sunny</span>
//           </div>
//         </div>
//       )}
//     </aside>
//   );
// }

// // Header Component
// function DashboardHeader({
//   tenant,
//   notificationCount,
//   notifications,
//   onLogout,
//   onNotificationsClick,
//   onMarkNotificationRead,
//   onMarkAllRead,
//   sidebarCollapsed,
//   onToggleSidebar,
//   onProfileClick,
//   onSettingsClick,
// }: {
//   tenant: TenantProfile | null;
//   notificationCount: number;
//   notifications: Notification[];
//   onLogout: () => void;
//   onNotificationsClick: () => void;
//   onMarkNotificationRead: (id: string) => void;
//   onMarkAllRead: () => void;
//   sidebarCollapsed: boolean;
//   onToggleSidebar: () => void;
//   onProfileClick: () => void;
//   onSettingsClick: () => void;
// }) {
//   const [notificationsOpen, setNotificationsOpen] = useState(false);

//   const handleNotificationClick = (notification: Notification) => {
//     if (!notification.is_read) {
//       onMarkNotificationRead(notification.id);
//     }
//     setNotificationsOpen(false);
//     onNotificationsClick();
//   };

//   return (
//     <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
//       <div className="px-4 sm:px-6 py-3">
//         <div className="flex items-center justify-between">
//           {/* Left section */}
//           <div className="flex items-center gap-3">
//             <Button
//               variant="ghost"
//               size="icon"
//               className="lg:hidden hover:bg-slate-100"
//               onClick={onToggleSidebar}
//             >
//               <Menu className="h-5 w-5" />
//             </Button>
            
//             <div className="hidden lg:block">
//               <h1 className="text-lg font-semibold text-slate-900">
//                 Welcome back, <span className="text-blue-600">{tenant?.full_name?.split(' ')[0] || 'Tenant'}</span>
//               </h1>
//               <p className="text-xs text-slate-500">
//                 {new Date().toLocaleDateString('en-US', { 
//                   weekday: 'long', 
//                   year: 'numeric', 
//                   month: 'long', 
//                   day: 'numeric' 
//                 })}
//               </p>
//             </div>
//           </div>

//           {/* Right section */}
//           <div className="flex items-center gap-2 sm:gap-3">
//             {/* Weather - Hidden on mobile */}
//             <div className="hidden md:flex items-center gap-2 text-slate-600">
//               <Sun className="h-4 w-4 text-yellow-500" />
//               <span className="text-sm">29°C</span>
//             </div>

//             {/* Notifications */}
//             <div className="relative">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="relative hover:bg-slate-100"
//                 onClick={() => setNotificationsOpen(!notificationsOpen)}
//               >
//                 <Bell className="h-5 w-5" />
//                 {notificationCount > 0 && (
//                   <Badge
//                     variant="destructive"
//                     className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
//                   >
//                     {notificationCount > 9 ? '9+' : notificationCount}
//                   </Badge>
//                 )}
//               </Button>

//               {notificationsOpen && (
//                 <NotificationPopup
//                   notifications={notifications}
//                   unreadCount={notificationCount}
//                   onMarkAllRead={onMarkAllRead}
//                   onNotificationClick={handleNotificationClick}
//                   onClose={() => setNotificationsOpen(false)}
//                   onViewAll={() => {
//                     setNotificationsOpen(false);
//                     onNotificationsClick();
//                   }}
//                 />
//               )}
//             </div>

//             {/* Profile Dropdown */}
//             <ProfileDropdown
//               tenant={tenant}
//               onLogout={onLogout}
//               onSettings={onSettingsClick}
//               onProfile={onProfileClick}
//             />
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

// // PG Details Card Component
// function PGDetailsCard({ booking, stats }: { booking: any; stats: DashboardStats }) {
//   if (!booking) return null;

//   return (
//     <Card className="border border-blue-100 shadow-sm hover:shadow-md transition-all">
//       <CardHeader className="pb-2">
//         <CardTitle className="text-sm font-semibold flex items-center gap-2">
//           <Building className="h-4 w-4 text-blue-600" />
//           My PG Details
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-3">
//           {/* PG Name */}
//           <div className="p-3 bg-blue-50 rounded-lg">
//             <p className="text-xs text-slate-500">PG Name</p>
//             <p className="font-semibold text-slate-900">{booking.properties?.name || 'ROOMAC PG'}</p>
//           </div>

//           {/* Room & Rent */}
//           <div className="grid grid-cols-2 gap-2">
//             <div className="p-2 bg-slate-50 rounded-lg">
//               <p className="text-xs text-slate-500">Room</p>
//               <p className="font-semibold text-lg">#{booking.rooms?.room_number || '302'}</p>
//             </div>
//             <div className="p-2 bg-slate-50 rounded-lg">
//               <p className="text-xs text-slate-500">Monthly Rent</p>
//               <p className="font-semibold text-lg text-green-600">₹{stats.monthlyRent.toLocaleString()}</p>
//             </div>
//           </div>

//           {/* Next Payment Banner */}
//           <div className="mt-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-center">
//             <p className="text-xs text-white opacity-90">Next payment in</p>
//             <div className="flex items-center justify-center gap-1 mt-1">
//               <span className="text-2xl font-bold text-white">{stats.daysUntilRentDue}</span>
//               <span className="text-sm text-white">days</span>
//             </div>
//             <p className="text-xs text-blue-100 mt-1">Due: {new Date(stats.nextDueDate).toLocaleDateString()}</p>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // Main Dashboard Component
// export default function TenantDashboard() {
//   const router = useRouter();
  
//   // State
//   const [loading, setLoading] = useState(true);
//   const [loadingTimeout, setLoadingTimeout] = useState(false);
//   const [tenant, setTenant] = useState<TenantProfile | null>(null);
//   const [booking, setBooking] = useState<any>(null);
//   const [payments, setPayments] = useState<any[]>([]);
//   const [complaints, setComplaints] = useState<TenantRequest[]>([]);
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [requests, setRequests] = useState<TenantRequest[]>([]);
//   const [complaintCategories, setComplaintCategories] = useState<ComplaintCategory[]>([]);
//   const [complaintReasons, setComplaintReasons] = useState<ComplaintReason[]>([]);
//   const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  
//   // UI State
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [showComplaintDialog, setShowComplaintDialog] = useState(false);
//   const [showLeaveDialog, setShowLeaveDialog] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState<string>("");
  
//   // Form states
//   const [newComplaint, setNewComplaint] = useState({
//     title: "",
//     description: "",
//     category: "",
//     reason: "",
//     priority: "medium",
//   });
  
//   const [leaveRequest, setLeaveRequest] = useState({
//     leave_type: "",
//     leave_start_date: "",
//     leave_end_date: "",
//     reason: "",
//     contact_address: "",
//     emergency_contact: "",
//   });

//   // Stats
//   const [stats, setStats] = useState<DashboardStats>({
//     totalPaid: 0,
//     totalPending: 0,
//     pendingCount: 0,
//     openComplaints: 0,
//     unreadNotifications: 0,
//     daysUntilRentDue: 0,
//     monthlyRent: 0,
//     occupancyDays: 0,
//     nextDueDate: "",
//     urgentComplaints: 0,
//     inProgressComplaints: 0,
//     maintenanceScore: 8.5,
//     cleanlinessScore: 9.0,
//     communityScore: 8.7,
//   });

//   // Recent activities
//   const [recentActivities, setRecentActivities] = useState<any[]>([]);

//   // Loading timeout
//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       if (loading) {
//         setLoadingTimeout(true);
//         toast.error('Loading is taking too long. Please refresh the page.');
//       }
//     }, 15000); // 15 seconds timeout

//     return () => clearTimeout(timeoutId);
//   }, [loading]);

//   // Fetch all data - defined with useCallback but with stable dependencies
//   const fetchAllData = useCallback(async () => {
//     console.log('🚀 Fetching all tenant data...');
//     setLoading(true);
//     setLoadingTimeout(false);
    
//     try {
//       // Check authentication
//       const token = getTenantToken();
//       const tenantId = getTenantId();
      
//       if (!token || !tenantId) {
//         console.log('⚠️ No authentication found, redirecting to login...');
//         router.push('/tenant/login');
//         return;
//       }

//       console.log('🔑 Token found:', token.substring(0, 20) + '...');
//       console.log('👤 Tenant ID:', tenantId);

//       // Fetch profile and details in parallel
//       const [profileRes, requestsRes, categoriesRes, leaveTypesRes] = await Promise.allSettled([
//         tenantDetailsApi.loadProfile(),
//         getMyTenantRequests(),
//         getComplaintCategories(),
//         getLeaveTypes(),
//       ]);

//       // Process profile
//       if (profileRes.status === 'fulfilled') {
//         if (profileRes.value?.success) {
//           const profileData = profileRes.value.data;
//           setTenant(profileData);
//           console.log('✅ Profile loaded successfully');
          
//           // Extract booking info
//           if (profileData.bookings && profileData.bookings.length > 0) {
//             const activeBooking = profileData.bookings.find((b: any) => b.status === 'active');
//             if (activeBooking) {
//               setBooking(activeBooking);
//             }
//           }

//           // Extract payments
//           if (profileData.payments) {
//             setPayments(profileData.payments);
//           }
//         } else {
//           console.error('❌ Profile API returned error:', profileRes.value);
//           toast.error(profileRes.value?.message || 'Failed to load profile');
//         }
//       } else {
//         console.error('❌ Profile promise rejected:', profileRes.reason);
//         toast.error('Failed to connect to server for profile');
//       }

//       // Process requests
//       if (requestsRes.status === 'fulfilled') {
//         if (requestsRes.value && Array.isArray(requestsRes.value)) {
//           const requestsData = requestsRes.value;
//           setRequests(requestsData);
          
//           // Filter complaints
//           const complaintRequests = requestsData.filter((r: TenantRequest) => 
//             r.request_type === 'complaint' || r.request_type === 'maintenance'
//           );
//           setComplaints(complaintRequests);
//           console.log(`✅ Loaded ${complaintRequests.length} complaints`);
//         } else {
//           console.warn('⚠️ No requests data or invalid format');
//         }
//       } else {
//         console.error('❌ Requests promise rejected:', requestsRes.reason);
//       }

//       // Process complaint categories
//       if (categoriesRes.status === 'fulfilled') {
//         if (categoriesRes.value && Array.isArray(categoriesRes.value)) {
//           setComplaintCategories(categoriesRes.value);
//           console.log(`✅ Loaded ${categoriesRes.value.length} complaint categories`);
//         }
//       } else {
//         console.error('❌ Categories promise rejected:', categoriesRes.reason);
//       }

//       // Process leave types
//       if (leaveTypesRes.status === 'fulfilled') {
//         if (leaveTypesRes.value && Array.isArray(leaveTypesRes.value)) {
//           setLeaveTypes(leaveTypesRes.value);
//           console.log(`✅ Loaded ${leaveTypesRes.value.length} leave types`);
//         }
//       } else {
//         console.error('❌ Leave types promise rejected:', leaveTypesRes.reason);
//       }

//       // Create mock notifications for now (replace with actual API call)
//       const mockNotifications: Notification[] = [
//         {
//           id: '1',
//           title: 'Rent Payment Reminder',
//           message: 'Your rent payment is due in 7 days',
//           type: 'payment',
//           is_read: false,
//           created_at: new Date().toISOString(),
//         },
//         {
//           id: '2',
//           title: 'Complaint Update',
//           message: 'Your maintenance request is now in progress',
//           type: 'complaint',
//           is_read: false,
//           created_at: new Date(Date.now() - 86400000).toISOString(),
//         },
//       ];
//       setNotifications(mockNotifications);

//     } catch (error) {
//       console.error('❌ Error fetching dashboard data:', error);
//       toast.error('Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//       console.log('✅ Data fetching completed');
//     }
//   }, []); // Only router as dependency - THIS IS CRITICAL

//   // Initial fetch - run only once on mount
//   useEffect(() => {
//     console.log('🔄 Component mounted, fetching data...');
//     fetchAllData();
    
//     // Cleanup function
//     return () => {
//       console.log('🧹 Component unmounting...');
//     };
//   }, [fetchAllData]); // This is fine because fetchAllData is memoized with useCallback

//   // Calculate stats when data changes
//   useEffect(() => {
//     if (tenant && payments.length > 0) {
//       console.log('📊 Calculating stats with data...');
      
//       // Payment calculations
//       const totalPaid = payments
//         .filter(p => p.payment_status === 'completed')
//         .reduce((sum, p) => sum + p.amount, 0);
      
//       const totalPending = payments
//         .filter(p => p.payment_status === 'pending')
//         .reduce((sum, p) => sum + p.amount, 0);
      
//       const pendingCount = payments.filter(p => p.payment_status === 'pending').length;

//       // Complaint calculations
//       const openComplaints = complaints.filter(c => 
//         c.status === 'pending' || c.status === 'in_progress'
//       ).length;
      
//       const urgentComplaints = complaints.filter(c => 
//         c.priority === 'urgent' && c.status !== 'resolved'
//       ).length;
      
//       const inProgressComplaints = complaints.filter(c => 
//         c.status === 'in_progress'
//       ).length;

//       // Rent due date calculation
//       let daysUntilRentDue = 7; // Default
//       let nextDueDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
//       const monthlyRent = booking?.monthly_rent || 15000;

//       if (booking?.check_in_date) {
//         const checkInDate = new Date(booking.check_in_date);
//         const today = new Date();
//         const dueDay = checkInDate.getDate();
        
//         let nextDue = new Date(today.getFullYear(), today.getMonth(), dueDay);
//         if (today.getDate() > dueDay) {
//           nextDue = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
//         }
        
//         daysUntilRentDue = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 3600 * 24));
//         nextDueDate = nextDue.toISOString().split('T')[0];
//       }

//       // Occupancy days
//       const occupancyDays = booking?.check_in_date
//         ? Math.ceil((new Date().getTime() - new Date(booking.check_in_date).getTime()) / (1000 * 3600 * 24))
//         : 45;

//       setStats({
//         totalPaid,
//         totalPending,
//         pendingCount,
//         openComplaints,
//         unreadNotifications: notifications.filter(n => !n.is_read).length,
//         daysUntilRentDue,
//         monthlyRent,
//         occupancyDays,
//         nextDueDate,
//         urgentComplaints,
//         inProgressComplaints,
//         maintenanceScore: 8.5,
//         cleanlinessScore: 9.0,
//         communityScore: 8.7,
//       });

//       // Create recent activities
//       const activities = [
//         ...payments.slice(0, 2).map(p => ({
//           id: `p-${p.id}`,
//           type: "payment",
//           title: "Payment",
//           description: p.payment_for,
//           amount: `₹${p.amount.toLocaleString()}`,
//           status: p.payment_status,
//           time: new Date(p.payment_date).toLocaleDateString(),
//           icon: CreditCard,
//           color: p.payment_status === 'completed' ? 'text-green-600' : 'text-orange-600',
//           bgColor: p.payment_status === 'completed' ? 'bg-green-50' : 'bg-orange-50',
//         })),
//         ...complaints.slice(0, 2).map(c => ({
//           id: `c-${c.id}`,
//           type: "complaint",
//           title: c.title,
//           description: c.description?.substring(0, 50),
//           status: c.status,
//           time: new Date(c.created_at).toLocaleDateString(),
//           icon: AlertCircle,
//           color: c.status === 'resolved' ? 'text-green-600' : 'text-orange-600',
//           bgColor: c.status === 'resolved' ? 'bg-green-50' : 'bg-orange-50',
//         })),
//       ];

//       setRecentActivities(activities);
//       console.log('✅ Stats calculated successfully');
//     }
//   }, [tenant, payments, complaints, notifications, booking]);

//   // Load complaint reasons when category changes
//   useEffect(() => {
//     if (selectedCategory) {
//       console.log('🔍 Loading complaint reasons for category:', selectedCategory);
//       getComplaintReasons(parseInt(selectedCategory))
//         .then(reasons => {
//           setComplaintReasons(reasons);
//           console.log(`✅ Loaded ${reasons.length} complaint reasons`);
//         })
//         .catch(error => {
//           console.error('❌ Failed to load complaint reasons:', error);
//         });
//     }
//   }, [selectedCategory]);

//   const handleLogout = useCallback(async () => {
//     try {
//       await logoutTenant();
//       toast.success('Logged out successfully');
//       router.push('/tenant/login');
//     } catch (error) {
//       console.error('Logout error:', error);
//       router.push('/tenant/login');
//     }
//   }, [router]);

//   const handleSubmitComplaint = useCallback(async () => {
//     if (!newComplaint.title || !newComplaint.description || !newComplaint.category) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     try {
//       const complaintData = {
//         request_type: 'complaint',
//         title: newComplaint.title,
//         description: newComplaint.description,
//         priority: newComplaint.priority,
//         complaint_data: {
//           category_master_type_id: parseInt(newComplaint.category),
//           reason_master_value_id: newComplaint.reason ? parseInt(newComplaint.reason) : undefined,
//         },
//       };

//       await createTenantRequest(complaintData);
//       toast.success('Complaint submitted successfully');
//       setShowComplaintDialog(false);
//       setNewComplaint({ title: "", description: "", category: "", reason: "", priority: "medium" });
//       fetchAllData(); // Refresh data
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to submit complaint');
//     }
//   }, [newComplaint]);

//   const handleSubmitLeaveRequest = useCallback(async () => {
//     if (!leaveRequest.leave_type || !leaveRequest.leave_start_date || !leaveRequest.reason) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     try {
//       const leaveData = {
//         request_type: 'leave',
//         title: `Leave Request - ${leaveRequest.leave_type}`,
//         description: leaveRequest.reason,
//         priority: 'medium',
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
//       };

//       await createTenantRequest(leaveData);
//       toast.success('Leave request submitted successfully');
//       setShowLeaveDialog(false);
//       setLeaveRequest({
//         leave_type: "",
//         leave_start_date: "",
//         leave_end_date: "",
//         reason: "",
//         contact_address: "",
//         emergency_contact: "",
//       });
      
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to submit leave request');
//     }
//   }, [leaveRequest]);

//   const handleMarkNotificationRead = useCallback(async (id: string) => {
//     setNotifications(prev =>
//       prev.map(n => n.id === id ? { ...n, is_read: true } : n)
//     );
//     // Call API to mark as read
//   }, []);

//   const handleMarkAllRead = useCallback(async () => {
//     setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
//     toast.success('All notifications marked as read');
//     // Call API to mark all as read
//   }, []);

//   const handleNavigation = (tab: string) => {
//     setActiveTab(tab);
//     if (tab === 'documents' || tab === 'my-documents' || tab === 'profile' || tab === 'settings') {
//       router.push(`/tenant/${tab}`);
//     }
//   };

  

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
//         <div className="flex flex-col items-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
//           <p className="mt-4 text-slate-600">Loading your dashboard...</p>
//           {loadingTimeout && (
//             <div className="mt-4 text-center">
//               <p className="text-sm text-red-500 mb-2">
//                 Taking too long to load.
//               </p>
//               <Button 
//                 variant="outline" 
//                 size="sm"
//                 onClick={() => window.location.reload()}
//                 className="text-blue-600"
//               >
//                 Refresh Page
//               </Button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Sidebar */}
//       <MinimalSidebar
//         collapsed={sidebarCollapsed}
//         onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
//         activeTab={activeTab}
//         onNavigate={handleNavigation}
//         tenantName={tenant?.full_name?.split(' ')[0] || 'Tenant'}
//         notificationCount={stats.unreadNotifications}
//       />

//       {/* Main Content */}
//       <div className={`
//         transition-all duration-300
//         ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
//         min-h-screen
//       `}>
//         <DashboardHeader
//           tenant={tenant}
//           notificationCount={stats.unreadNotifications}
//           notifications={notifications}
//           onLogout={handleLogout}
//           onNotificationsClick={() => setActiveTab('notifications')}
//           onMarkNotificationRead={handleMarkNotificationRead}
//           onMarkAllRead={handleMarkAllRead}
//           sidebarCollapsed={sidebarCollapsed}
//           onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
//           onProfileClick={() => router.push('/tenant/profile')}
//           onSettingsClick={() => router.push('/tenant/settings')}
//         />

//         <main className="p-4 sm:p-6">
//           {/* Welcome Section */}
//           <div className="mb-6">
//             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                 <div>
//                   <h1 className="text-2xl font-bold mb-1">
//                     Hey, {tenant?.full_name?.split(' ')[0] || 'Tenant'}! 👋
//                   </h1>
//                   <p className="text-blue-100">
//                     {new Date().toLocaleDateString('en-US', { 
//                       weekday: 'long', 
//                       year: 'numeric', 
//                       month: 'long', 
//                       day: 'numeric' 
//                     })}
//                   </p>
//                 </div>
//                 <Button 
//                   variant="secondary" 
//                   className="bg-white/20 hover:bg-white/30 text-white border-0"
//                 >
//                   <Download className="h-4 w-4 mr-2" />
//                   Export Report
//                 </Button>
//               </div>
//             </div>
//           </div>

//           {/* Quick Stats Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//             <Card className="border-l-4 border-l-blue-500">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-slate-500">Monthly Rent</p>
//                     <p className="text-2xl font-bold text-slate-900">₹{stats.monthlyRent.toLocaleString()}</p>
//                     <p className="text-xs text-slate-500 mt-1">Due in {stats.daysUntilRentDue} days</p>
//                   </div>
//                   <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <CreditCard className="h-6 w-6 text-blue-600" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="border-l-4 border-l-orange-500">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-slate-500">Pending Dues</p>
//                     <p className="text-2xl font-bold text-slate-900">₹{stats.totalPending.toLocaleString()}</p>
//                     <p className="text-xs text-slate-500 mt-1">{stats.pendingCount} pending payments</p>
//                   </div>
//                   <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
//                     <AlertCircle className="h-6 w-6 text-orange-600" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="border-l-4 border-l-green-500">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-slate-500">Open Issues</p>
//                     <p className="text-2xl font-bold text-slate-900">{stats.openComplaints}</p>
//                     <p className="text-xs text-slate-500 mt-1">{stats.urgentComplaints} urgent</p>
//                   </div>
//                   <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
//                     <AlertTriangle className="h-6 w-6 text-green-600" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="border-l-4 border-l-purple-500">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-slate-500">Stay Duration</p>
//                     <p className="text-2xl font-bold text-slate-900">{stats.occupancyDays} days</p>
//                     <p className="text-xs text-slate-500 mt-1">Since {booking ? new Date(booking.check_in_date).toLocaleDateString() : 'N/A'}</p>
//                   </div>
//                   <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
//                     <Calendar className="h-6 w-6 text-purple-600" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Main Content Grid */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Left Column - Tabs */}
//             <div className="lg:col-span-2">
//               <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//                 <TabsList className="bg-white border border-slate-200 p-0.5 rounded-lg w-full overflow-x-auto">
//                   <TabsTrigger value="dashboard" className="rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all flex-1 text-sm py-2">
//                     Dashboard
//                   </TabsTrigger>
//                   <TabsTrigger value="payments" className="rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all flex-1 text-sm py-2">
//                     Payments
//                   </TabsTrigger>
//                   <TabsTrigger value="notifications" className="rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all flex-1 text-sm py-2">
//                     Notifications
//                     {stats.unreadNotifications > 0 && (
//                       <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0">
//                         {stats.unreadNotifications}
//                       </Badge>
//                     )}
//                   </TabsTrigger>
//                 </TabsList>

//                 {/* Dashboard Tab */}
//                 <TabsContent value="dashboard" className="space-y-4">
//                   {/* Quick Actions */}
//                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                     <Button
//                       variant="outline"
//                       className="h-auto py-3 flex-col gap-1 hover:bg-blue-50 hover:border-blue-200"
//                       onClick={() => setShowComplaintDialog(true)}
//                     >
//                       <AlertCircle className="h-5 w-5 text-blue-600" />
//                       <span className="text-xs">Raise Complaint</span>
//                     </Button>
                    
//                     <Button
//                       variant="outline"
//                       className="h-auto py-3 flex-col gap-1 hover:bg-green-50 hover:border-green-200"
//                       onClick={() => setShowLeaveDialog(true)}
//                     >
//                       <Calendar className="h-5 w-5 text-green-600" />
//                       <span className="text-xs">Request Leave</span>
//                     </Button>
                    
//                     <Button
//                       variant="outline"
//                       className="h-auto py-3 flex-col gap-1 hover:bg-purple-50 hover:border-purple-200"
//                       onClick={() => router.push('/tenant/documents')}
//                     >
//                       <FileText className="h-5 w-5 text-purple-600" />
//                       <span className="text-xs">Documents</span>
//                     </Button>
                    
//                     <Button
//                       variant="outline"
//                       className="h-auto py-3 flex-col gap-1 hover:bg-orange-50 hover:border-orange-200"
//                       onClick={() => setActiveTab('payments')}
//                     >
//                       <CreditCard className="h-5 w-5 text-orange-600" />
//                       <span className="text-xs">Make Payment</span>
//                     </Button>
//                   </div>

//                   {/* Recent Activity */}
//                   <Card>
//                     <CardHeader className="pb-2">
//                       <CardTitle className="text-sm font-semibold flex items-center gap-2">
//                         <Clock className="h-4 w-4 text-blue-600" />
//                         Recent Activity
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-3">
//                         {recentActivities.length > 0 ? (
//                           recentActivities.map((activity) => (
//                             <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
//                               <div className={`${activity.bgColor} p-2 rounded-md`}>
//                                 <activity.icon className={`h-4 w-4 ${activity.color}`} />
//                               </div>
//                               <div className="flex-1 min-w-0">
//                                 <p className="text-sm font-medium text-slate-900">{activity.title}</p>
//                                 <p className="text-xs text-slate-500">{activity.description}</p>
//                                 {activity.amount && (
//                                   <p className="text-xs font-semibold text-green-600 mt-1">{activity.amount}</p>
//                                 )}
//                               </div>
//                               <div className="text-right">
//                                 <Badge variant="outline" className="text-[10px]">
//                                   {activity.status}
//                                 </Badge>
//                                 <p className="text-[10px] text-slate-400 mt-1">{activity.time}</p>
//                               </div>
//                             </div>
//                           ))
//                         ) : (
//                           <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
//                         )}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 {/* Payments Tab */}
//                 <TabsContent value="payments">
//                   <Card>
//                     <CardHeader>
//                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                         <CardTitle className="text-base">Payment History</CardTitle>
//                         <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
//                           <CreditCard className="h-4 w-4 mr-2" />
//                           Make Payment
//                         </Button>
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-3">
//                         {payments.length > 0 ? (
//                           payments.map((payment) => (
//                             <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-all">
//                               <div>
//                                 <p className="font-medium text-slate-900">{payment.payment_for}</p>
//                                 <p className="text-xs text-slate-500 mt-1">
//                                   {new Date(payment.payment_date).toLocaleDateString()}
//                                 </p>
//                               </div>
//                               <div className="flex items-center gap-3 mt-2 sm:mt-0">
//                                 <p className="font-bold text-green-600">₹{payment.amount.toLocaleString()}</p>
//                                 <Badge variant={payment.payment_status === 'completed' ? 'default' : 'destructive'}>
//                                   {payment.payment_status}
//                                 </Badge>
//                               </div>
//                             </div>
//                           ))
//                         ) : (
//                           <p className="text-center text-slate-500 py-8">No payment history</p>
//                         )}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 {/* Notifications Tab */}
//                 <TabsContent value="notifications">
//                   <Card>
//                     <CardHeader>
//                       <div className="flex items-center justify-between">
//                         <CardTitle className="text-base">Notifications</CardTitle>
//                         {stats.unreadNotifications > 0 && (
//                           <Button size="sm" variant="outline" onClick={handleMarkAllRead}>
//                             Mark All Read
//                           </Button>
//                         )}
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-3">
//                         {notifications.length > 0 ? (
//                           notifications.map((notification) => (
//                             <div
//                               key={notification.id}
//                               className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${
//                                 notification.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'
//                               }`}
//                               onClick={() => !notification.is_read && handleMarkNotificationRead(notification.id)}
//                             >
//                               <div className="flex justify-between items-start gap-3">
//                                 <div className="flex-1">
//                                   <p className="font-medium text-sm">{notification.title}</p>
//                                   <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
//                                   <p className="text-[10px] text-slate-400 mt-2">
//                                     {new Date(notification.created_at).toLocaleString()}
//                                   </p>
//                                 </div>
//                                 {!notification.is_read && (
//                                   <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
//                                 )}
//                               </div>
//                             </div>
//                           ))
//                         ) : (
//                           <p className="text-center text-slate-500 py-8">No notifications</p>
//                         )}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>

//             {/* Right Column - PG Details */}
//             <div className="space-y-4">
//               <PGDetailsCard booking={booking} stats={stats} />
              
//               {/* Quick Info Cards */}
//               <Card>
//                 <CardHeader className="pb-2">
//                   <CardTitle className="text-sm font-semibold">Quick Info</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-2">
//                     <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
//                       <span className="text-xs text-slate-600">Total Paid</span>
//                       <span className="text-sm font-semibold text-green-600">₹{stats.totalPaid.toLocaleString()}</span>
//                     </div>
//                     <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
//                       <span className="text-xs text-slate-600">Open Complaints</span>
//                       <span className="text-sm font-semibold text-orange-600">{stats.openComplaints}</span>
//                     </div>
//                     <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
//                       <span className="text-xs text-slate-600">Check-in Date</span>
//                       <span className="text-sm font-semibold">
//                         {booking ? new Date(booking.check_in_date).toLocaleDateString() : 'N/A'}
//                       </span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* Complaint Dialog */}
//       <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Raise a Complaint</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <Label>Title *</Label>
//               <Input
//                 value={newComplaint.title}
//                 onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
//                 placeholder="Brief title of the issue"
//               />
//             </div>
            
//             <div>
//               <Label>Category *</Label>
//               <Select 
//                 value={newComplaint.category} 
//                 onValueChange={(value) => {
//                   setNewComplaint({ ...newComplaint, category: value, reason: "" });
//                   setSelectedCategory(value);
//                 }}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {complaintCategories.map((category) => (
//                     <SelectItem key={category.id} value={category.id.toString()}>
//                       {category.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {complaintReasons.length > 0 && (
//               <div>
//                 <Label>Reason</Label>
//                 <Select 
//                   value={newComplaint.reason} 
//                   onValueChange={(value) => setNewComplaint({ ...newComplaint, reason: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select reason (optional)" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {complaintReasons.map((reason) => (
//                       <SelectItem key={reason.id} value={reason.id.toString()}>
//                         {reason.value}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             )}

//             <div>
//               <Label>Priority</Label>
//               <Select 
//                 value={newComplaint.priority} 
//                 onValueChange={(value) => setNewComplaint({ ...newComplaint, priority: value })}
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="low">Low</SelectItem>
//                   <SelectItem value="medium">Medium</SelectItem>
//                   <SelectItem value="high">High</SelectItem>
//                   <SelectItem value="urgent">Urgent</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label>Description *</Label>
//               <Textarea
//                 value={newComplaint.description}
//                 onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
//                 rows={4}
//                 placeholder="Describe the issue in detail"
//               />
//             </div>

//             <Button onClick={handleSubmitComplaint} className="w-full">
//               Submit Complaint
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Leave Request Dialog */}
//       <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Request Leave</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             {booking?.lock_in_end_date && (
//               <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <p className="text-xs font-medium text-yellow-800">Lock-in Period Information</p>
//                 <p className="text-xs text-yellow-700 mt-1">
//                   Lock-in ends on {new Date(booking.lock_in_end_date).toLocaleDateString()}
//                 </p>
//               </div>
//             )}

//             <div>
//               <Label>Leave Type *</Label>
//               <Select 
//                 value={leaveRequest.leave_type} 
//                 onValueChange={(value) => setLeaveRequest({ ...leaveRequest, leave_type: value })}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select leave type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {leaveTypes.map((type) => (
//                     <SelectItem key={type.id} value={type.value}>
//                       {type.value}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <Label>Start Date *</Label>
//                 <Input
//                   type="date"
//                   min={new Date().toISOString().split('T')[0]}
//                   value={leaveRequest.leave_start_date}
//                   onChange={(e) => setLeaveRequest({ ...leaveRequest, leave_start_date: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <Label>End Date</Label>
//                 <Input
//                   type="date"
//                   min={leaveRequest.leave_start_date || new Date().toISOString().split('T')[0]}
//                   value={leaveRequest.leave_end_date}
//                   onChange={(e) => setLeaveRequest({ ...leaveRequest, leave_end_date: e.target.value })}
//                 />
//               </div>
//             </div>

//             <div>
//               <Label>Reason *</Label>
//               <Textarea
//                 value={leaveRequest.reason}
//                 onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
//                 rows={3}
//                 placeholder="Please provide reason for leave"
//               />
//             </div>

//             <div>
//               <Label>Contact Address (During Leave)</Label>
//               <Input
//                 value={leaveRequest.contact_address}
//                 onChange={(e) => setLeaveRequest({ ...leaveRequest, contact_address: e.target.value })}
//                 placeholder="Where can we reach you?"
//               />
//             </div>

//             <div>
//               <Label>Emergency Contact</Label>
//               <Input
//                 value={leaveRequest.emergency_contact}
//                 onChange={(e) => setLeaveRequest({ ...leaveRequest, emergency_contact: e.target.value })}
//                 placeholder="Emergency contact number"
//               />
//             </div>

//             <Button onClick={handleSubmitLeaveRequest} className="w-full">
//               Submit Request
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


// app/tenant/dashboard/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home,
  CreditCard,
  FileText,
  Bell,
  AlertCircle,
  LogOut,
  Calendar,
  CheckCircle,
  User,
  Download,
  Settings,
  FolderOpen,
  Menu,
  Sun,
  Moon,
  Building,
  Bed,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  IndianRupee,
  CalendarDays,
  AlertTriangle,
  Shield,
  Wifi,
  Coffee,
  Users,
  HomeIcon,
  DollarSign,
  FileText as FileTextIcon,
  Bell as BellIcon,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
} from "lucide-react";

// Components
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

// API Imports
import {
  getTenantToken,
  getTenantId,
  logoutTenant,
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

// Assets
import roomacLogo from "@/app/src/assets/images/roomaclogo.webp";
import { useAuth } from "@/context/authContext";

// Types
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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'complaint' | 'event' | 'document' | 'general';
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

// Notification Popup Component
function NotificationPopup({
  notifications,
  unreadCount,
  onMarkAllRead,
  onNotificationClick,
  onClose,
  onViewAll,
}: {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onNotificationClick: (notification: Notification) => void;
  onClose: () => void;
  onViewAll: () => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'complaint': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'event': return <Calendar className="h-4 w-4 text-green-600" />;
      case 'document': return <FileText className="h-4 w-4 text-purple-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div
      ref={popupRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50"
    >
      <div className="p-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-600" />
          <p className="font-semibold text-sm">Notifications</p>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0 h-5">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllRead}
            className="h-6 text-xs hover:bg-slate-100"
          >
            Mark all read
          </Button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${
                !notification.is_read ? 'bg-blue-50/50' : ''
              }`}
              onClick={() => onNotificationClick(notification)}
            >
              <div className="flex items-start gap-2.5">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  notification.is_read ? 'bg-slate-100' : 'bg-blue-100'
                }`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm text-slate-900 leading-tight">
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-1"></div>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-slate-500">
            No notifications
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-200">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 text-xs"
          onClick={onViewAll}
        >
          View all notifications
        </Button>
      </div>
    </div>
  );
}

// Profile Dropdown Component
function ProfileDropdown({
  tenant,
  onLogout,
  onSettings,
  onProfile,
}: {
  tenant: TenantProfile | null;
  onLogout: () => void;
  onSettings: () => void;
  onProfile: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="relative h-8 w-8 rounded-full"
        onClick={() => setOpen(!open)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={tenant?.photo_url} alt={tenant?.full_name} />
          <AvatarFallback className="bg-[#fec40a] text-black">
            {tenant?.full_name?.charAt(0) || 'T'}
          </AvatarFallback>
        </Avatar>
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
          <div className="p-3 border-b border-slate-200">
            <p className="font-medium text-sm text-slate-900">{tenant?.full_name}</p>
            <p className="text-xs text-slate-500 truncate">{tenant?.email}</p>
          </div>
          
          <div className="p-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-2 text-sm"
              onClick={() => {
                onProfile();
                setOpen(false);
              }}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-2 text-sm"
              onClick={() => {
                onSettings();
                setOpen(false);
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          <div className="border-t border-slate-200 p-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                onLogout();
                setOpen(false);
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal Sidebar Component
function MinimalSidebar({
  collapsed,
  onToggle,
  activeTab,
  onNavigate,
  tenantName,
  notificationCount,
}: {
  collapsed: boolean;
  onToggle: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  tenantName: string;
  notificationCount: number;
}) {
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "my-documents", label: "My Documents", icon: FolderOpen },
    { id: "notifications", label: "Notifications", icon: Bell, badge: notificationCount },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40
        bg-white border-r border-slate-200
        shadow-lg transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}
        flex flex-col
      `}
    >
      {/* Logo Section */}
      <div className="h-16 border-b border-slate-100 flex items-center px-4">
        {!collapsed ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 relative">
                <Image
                  src={roomacLogo}
                  alt="ROOMAC"
                  width={40}
                  height={42}
                  className="object-contain"
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full gap-2">
            <div className="h-8 w-8 relative">
              <Image
                src={roomacLogo}
                alt="ROOMAC"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 hover:bg-slate-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <div key={item.id} className="relative group">
              <Button
                variant="ghost"
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center rounded-lg transition-all
                  ${collapsed ? 'h-10 justify-center' : 'h-10 justify-start px-3'}
                  ${activeTab === item.id
                    ? 'bg-[#0149ab] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                  }
                `}
              >
                <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`} />
                
                {!collapsed && (
                  <>
                    <span className="ml-3 text-sm">{item.label}</span>
                    {item.badge ? (
                      <Badge 
                        variant="destructive" 
                        className="ml-auto text-[10px] px-1.5 py-0 h-4 min-w-4"
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </Badge>
                    ) : null}
                  </>
                )}
              </Button>

              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                  {item.label}
                  {item.badge ? ` (${item.badge})` : ''}
                </span>
              )}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}

// Header Component
function DashboardHeader({
  tenant,
  notificationCount,
  notifications,
  onLogout,
  onNotificationsClick,
  onMarkNotificationRead,
  onMarkAllRead,
  sidebarCollapsed,
  onToggleSidebar,
  onProfileClick,
  onSettingsClick,
}: {
  tenant: TenantProfile | null;
  notificationCount: number;
  notifications: Notification[];
  onLogout: () => void;
  onNotificationsClick: () => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllRead: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      onMarkNotificationRead(notification.id);
    }
    setNotificationsOpen(false);
    onNotificationsClick();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-slate-100"
              onClick={onToggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-slate-900">
                Welcome back, <span className="text-[#0149ab]">{tenant?.full_name?.split(' ')[0] || 'Tenant'}</span>
              </h1>
              <p className="text-xs text-slate-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Weather */}
            <div className="hidden md:flex items-center gap-2 text-slate-600">
              <Sun className="h-4 w-4 text-[#fec40a]" />
              <span className="text-sm">29°C Sunny</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-slate-100"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>

              {notificationsOpen && (
                <NotificationPopup
                  notifications={notifications}
                  unreadCount={notificationCount}
                  onMarkAllRead={onMarkAllRead}
                  onNotificationClick={handleNotificationClick}
                  onClose={() => setNotificationsOpen(false)}
                  onViewAll={() => {
                    setNotificationsOpen(false);
                    onNotificationsClick();
                  }}
                />
              )}
            </div>

            {/* Profile Dropdown */}
            <ProfileDropdown
              tenant={tenant}
              onLogout={onLogout}
              onSettings={onSettingsClick}
              onProfile={onProfileClick}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

// Format date helper
const formatDate = (date: string) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Main Dashboard Component
export default function TenantDashboard() {
  const router = useRouter();
  
  // State
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<TenantRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [requests, setRequests] = useState<TenantRequest[]>([]);
  const [complaintCategories, setComplaintCategories] = useState<ComplaintCategory[]>([]);
  const [complaintReasons, setComplaintReasons] = useState<ComplaintReason[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { logout } = useAuth()
  // Form states
  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: "",
    category: "",
    reason: "",
    priority: "medium",
  });
  
  const [leaveRequest, setLeaveRequest] = useState({
    leave_type: "",
    leave_start_date: "",
    leave_end_date: "",
    reason: "",
    contact_address: "",
    emergency_contact: "",
  });

  // Stats
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    pendingCount: 0,
    openComplaints: 0,
    unreadNotifications: 0,
    daysUntilRentDue: 7,
    monthlyRent: 0,
    occupancyDays: 0,
    nextDueDate: "",
    urgentComplaints: 0,
    inProgressComplaints: 0,
  });

  // Loading timeout
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
        toast.error('Loading is taking too long. Please refresh the page.');
      }
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    console.log('🚀 Fetching all tenant data...');
    setLoading(true);
    setLoadingTimeout(false);
    
    try {
      const token = getTenantToken();
      const tenantId = getTenantId();
      
      if (!token || !tenantId) {
        router.push('/login');
        return;
      }

      const [profileRes, requestsRes, categoriesRes, leaveTypesRes] = await Promise.allSettled([
        tenantDetailsApi.loadProfile(),
        getMyTenantRequests(),
        getComplaintCategories(),
        getLeaveTypes(),
      ]);

      // Process profile
      if (profileRes.status === 'fulfilled' && profileRes.value?.success) {
        const profileData = profileRes.value.data;
        setTenant(profileData);
        
        if (profileData.payments) {
          setPayments(profileData.payments);
        }

        // Calculate stats
        const totalPaid = profileData.payments?.filter((p: any) => p.status === 'completed')
          .reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
        
        const totalPending = profileData.payments?.filter((p: any) => p.status === 'pending')
          .reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
        
        const pendingCount = profileData.payments?.filter((p: any) => p.status === 'pending').length || 0;

        // Calculate days until rent due
        let daysUntilRentDue = 7;
        let nextDueDate = new Date(Date.now() + 7 * 86400000).toISOString();

        if (profileData.check_in_date) {
          const checkInDate = new Date(profileData.check_in_date);
          const today = new Date();
          const dueDay = checkInDate.getDate();
          
          let nextDue = new Date(today.getFullYear(), today.getMonth(), dueDay);
          if (today.getDate() > dueDay) {
            nextDue = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
          }
          
          daysUntilRentDue = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 3600 * 24));
          nextDueDate = nextDue.toISOString();
        }

        // Calculate occupancy days
        const occupancyDays = profileData.check_in_date
          ? Math.ceil((new Date().getTime() - new Date(profileData.check_in_date).getTime()) / (1000 * 3600 * 24))
          : 0;

        setStats({
          totalPaid,
          totalPending,
          pendingCount,
          openComplaints: 0,
          unreadNotifications: notifications.filter(n => !n.is_read).length,
          daysUntilRentDue,
          monthlyRent: profileData.monthly_rent || 0,
          occupancyDays,
          nextDueDate,
          urgentComplaints: 0,
          inProgressComplaints: 0,
        });
      }

      // Process requests
      if (requestsRes.status === 'fulfilled' && requestsRes.value) {
        const requestsData = requestsRes.value;
        setRequests(requestsData);
        
        const complaintRequests = requestsData.filter((r: TenantRequest) => 
          r.request_type === 'complaint' || r.request_type === 'maintenance'
        );
        setComplaints(complaintRequests);

        const urgentCount = complaintRequests.filter((c: TenantRequest) => 
          c.priority === 'urgent' && c.status !== 'resolved'
        ).length;
        
        const inProgressCount = complaintRequests.filter((c: TenantRequest) => 
          c.status === 'in_progress'
        ).length;

        setStats(prev => ({
          ...prev,
          openComplaints: complaintRequests.filter((c: TenantRequest) => 
            c.status === 'pending' || c.status === 'in_progress'
          ).length,
          urgentComplaints: urgentCount,
          inProgressComplaints: inProgressCount,
        }));
      }

      // Process categories
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value) {
        setComplaintCategories(categoriesRes.value);
      }

      // Process leave types
      if (leaveTypesRes.status === 'fulfilled' && leaveTypesRes.value) {
        setLeaveTypes(leaveTypesRes.value);
      }

      // Mock notifications
      setNotifications([
        {
          id: '1',
          title: 'Rent Payment Reminder',
          message: 'Your rent payment is due in 7 days',
          type: 'payment',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Complaint Update',
          message: 'Your maintenance request is now in progress',
          type: 'complaint',
          is_read: false,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Load complaint reasons
  useEffect(() => {
    if (selectedCategory) {
      getComplaintReasons(parseInt(selectedCategory))
        .then(setComplaintReasons)
        .catch(console.error);
    }
  }, [selectedCategory]);

  const handleLogout = useCallback(async () => {
    await logoutTenant();
    localStorage.clear()
    router.push('/login');
    logout()
  }, []);

  const handleSubmitComplaint = useCallback(async () => {
    if (!newComplaint.title || !newComplaint.description || !newComplaint.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createTenantRequest({
        request_type: 'complaint',
        title: newComplaint.title,
        description: newComplaint.description,
        priority: newComplaint.priority,
        complaint_data: {
          category_master_type_id: parseInt(newComplaint.category),
          reason_master_value_id: newComplaint.reason ? parseInt(newComplaint.reason) : undefined,
        },
      });
      
      toast.success('Complaint submitted successfully');
      setShowComplaintDialog(false);
      setNewComplaint({ title: "", description: "", category: "", reason: "", priority: "medium" });
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit complaint');
    }
  }, [newComplaint, fetchAllData]);

  const handleSubmitLeaveRequest = useCallback(async () => {
    if (!leaveRequest.leave_type || !leaveRequest.leave_start_date || !leaveRequest.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createTenantRequest({
        request_type: 'leave',
        title: `Leave Request - ${leaveRequest.leave_type}`,
        description: leaveRequest.reason,
        priority: 'medium',
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
      
      toast.success('Leave request submitted successfully');
      setShowLeaveDialog(false);
      setLeaveRequest({
        leave_type: "", leave_start_date: "", leave_end_date: "",
        reason: "", contact_address: "", emergency_contact: "",
      });
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit leave request');
    }
  }, [leaveRequest, fetchAllData]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success('All notifications marked as read');
  }, []);

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'documents' || tab === 'my-documents' || tab === 'profile' || tab === 'settings') {
      router.push(`/tenant/${tab}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0149ab] border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Loading your dashboard...</p>
          {loadingTimeout && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Refresh Page
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <MinimalSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTab={activeTab}
        onNavigate={handleNavigation}
        tenantName={tenant?.full_name?.split(' ')[0] || 'Tenant'}
        notificationCount={stats.unreadNotifications}
      />

      <div className={`
        transition-all duration-300
        ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
        min-h-screen
      `}>
        <DashboardHeader
          tenant={tenant}
          notificationCount={stats.unreadNotifications}
          notifications={notifications}
          onLogout={handleLogout}
          onNotificationsClick={() => setActiveTab('notifications')}
          onMarkNotificationRead={(id) => {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
          }}
          onMarkAllRead={handleMarkAllRead}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onProfileClick={() => router.push('/tenant/profile')}
          onSettingsClick={() => router.push('/tenant/settings')}
        />

        <main className="p-4 sm:p-6">
          {/* Welcome Banner - Blue Background */}
          <div className="mb-6 bg-[#0149ab] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  Hey, {tenant?.full_name?.split(' ')[0] || 'Rahul'}! 👋
                </h1>
                <p className="text-blue-100 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {tenant?.property_name || 'Roomac Heights'} · Room {tenant?.room_number || '204'} · Bed {tenant?.bed_number || '1'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards - Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border border-slate-200">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 mb-1">Monthly Rent</p>
                <p className="text-2xl font-bold text-slate-900">₹{stats.monthlyRent.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Due in {stats.daysUntilRentDue} days</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-slate-900">₹{stats.totalPaid.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">All time</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 mb-1">Days Staying</p>
                <p className="text-2xl font-bold text-slate-900">{stats.occupancyDays}</p>
                <p className="text-xs text-slate-500 mt-1">Since {formatDate(tenant?.check_in_date || '')}</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 mb-1">Room Type</p>
                <p className="text-2xl font-bold text-slate-900 capitalize">{tenant?.preferred_sharing || 'Double'}</p>
                <p className="text-xs text-slate-500 mt-1">Sharing</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid - 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-white border border-slate-200 p-0.5 rounded-lg w-full">
                  <TabsTrigger value="dashboard" className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white transition-all flex-1 text-sm py-2">
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white transition-all flex-1 text-sm py-2">
                    Payments
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white transition-all flex-1 text-sm py-2">
                    Notifications
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6">
                  {/* Recent Payments */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">Recent Payments</CardTitle>
                        <Button variant="ghost" size="sm" className="text-[#0149ab]">
                          View All
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {payments.length > 0 ? (
                        <div className="space-y-4">
                          {payments.slice(0, 3).map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-slate-900">{payment.description}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {formatDate(payment.payment_date)} · {payment.payment_method}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-slate-900">₹{payment.amount.toLocaleString()}</p>
                                <Badge variant="outline" className="mt-1 text-xs bg-green-50 text-green-700 border-green-200">
                                  {payment.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-slate-500 py-4">No payment history</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Amenities History - Placeholder for now */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold">Amenities History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                          <Wifi className="h-4 w-4 text-[#0149ab]" />
                          <span className="text-sm">WiFi - Last used: Today</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                          <Coffee className="h-4 w-4 text-[#0149ab]" />
                          <span className="text-sm">Laundry - Last used: 2 days ago</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Your Accommodation - Blue Background */}
              <Card className="bg-[#0149ab] text-white border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                    <Building className="h-5 w-5" />
                    Your Accommodation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-lg">{tenant?.property_name || 'Roomac Heights'}</p>
                    <p className="text-sm text-blue-100 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {tenant?.property_address || '45, Linking Road, Bandra'}, {tenant?.property_city || 'Mumbai'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-blue-200">ROOM NO.</p>
                      <p className="text-xl font-bold">{tenant?.room_number || '204'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-200">BED NO.</p>
                      <p className="text-xl font-bold">{tenant?.bed_number || '1'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-200">RENT/MONTH</p>
                      <p className="text-xl font-bold">₹{stats.monthlyRent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-200">FLOOR</p>
                      <p className="text-xl font-bold">Floor {tenant?.floor || '2'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1 hover:bg-blue-50 border-slate-200"
                  onClick={() => setShowComplaintDialog(true)}
                >
                  <AlertCircle className="h-5 w-5 text-[#0149ab]" />
                  <span className="text-xs">Raise Complaint</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1 hover:bg-green-50 border-slate-200"
                  onClick={() => setShowLeaveDialog(true)}
                >
                  <Calendar className="h-5 w-5 text-[#0149ab]" />
                  <span className="text-xs">Request Leave</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1 hover:bg-purple-50 border-slate-200"
                  onClick={() => router.push('/tenant/documents')}
                >
                  <FileText className="h-5 w-5 text-[#0149ab]" />
                  <span className="text-xs">Documents</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1 hover:bg-orange-50 border-slate-200"
                  onClick={() => setActiveTab('payments')}
                >
                  <CreditCard className="h-5 w-5 text-[#0149ab]" />
                  <span className="text-xs">Make Payment</span>
                </Button>
              </div>

              {/* Property Manager */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-[#0149ab]" />
                    Property Manager
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Name</span>
                      <span className="text-sm font-medium">{tenant?.property_manager_name || 'Anita Verma'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Phone</span>
                      <span className="text-sm font-medium text-[#0149ab]">{tenant?.property_manager_phone || '9123456789'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contract Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#0149ab]" />
                    Contract Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Check-in</span>
                      <span className="text-sm font-medium">{formatDate(tenant?.check_in_date || '2024-01-15')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Lock-in</span>
                      <span className="text-sm font-medium">{tenant?.lockin_period_months || '6'} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Notice</span>
                      <span className="text-sm font-medium">{tenant?.notice_period_days || '30'} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Amenities</span>
                      <span className="text-sm font-medium text-right">{tenant?.amenities || 'WiFi, AC, Laundry, Food'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Complaint Dialog */}
      <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Raise a Complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={newComplaint.title}
                onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                placeholder="Brief title of the issue"
              />
            </div>
            
            <div>
              <Label>Category *</Label>
              <Select 
                value={newComplaint.category} 
                onValueChange={(value) => {
                  setNewComplaint({ ...newComplaint, category: value, reason: "" });
                  setSelectedCategory(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {complaintCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {complaintReasons.length > 0 && (
              <div>
                <Label>Reason</Label>
                <Select 
                  value={newComplaint.reason} 
                  onValueChange={(value) => setNewComplaint({ ...newComplaint, reason: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {complaintReasons.map((reason) => (
                      <SelectItem key={reason.id} value={reason.id.toString()}>
                        {reason.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Priority</Label>
              <Select 
                value={newComplaint.priority} 
                onValueChange={(value) => setNewComplaint({ ...newComplaint, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={newComplaint.description}
                onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                rows={4}
                placeholder="Describe the issue in detail"
              />
            </div>

            <Button onClick={handleSubmitComplaint} className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90">
              Submit Complaint
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Request Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {tenant?.lockin_period_months && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs font-medium text-yellow-800">Lock-in Period Information</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Lock-in period: {tenant.lockin_period_months} months
                </p>
              </div>
            )}

            <div>
              <Label>Leave Type *</Label>
              <Select 
                value={leaveRequest.leave_type} 
                onValueChange={(value) => setLeaveRequest({ ...leaveRequest, leave_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.value}>
                      {type.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={leaveRequest.leave_start_date}
                  onChange={(e) => setLeaveRequest({ ...leaveRequest, leave_start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  min={leaveRequest.leave_start_date || new Date().toISOString().split('T')[0]}
                  value={leaveRequest.leave_end_date}
                  onChange={(e) => setLeaveRequest({ ...leaveRequest, leave_end_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Reason *</Label>
              <Textarea
                value={leaveRequest.reason}
                onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
                rows={3}
                placeholder="Please provide reason for leave"
              />
            </div>

            <div>
              <Label>Contact Address (During Leave)</Label>
              <Input
                value={leaveRequest.contact_address}
                onChange={(e) => setLeaveRequest({ ...leaveRequest, contact_address: e.target.value })}
                placeholder="Where can we reach you?"
              />
            </div>

            <div>
              <Label>Emergency Contact</Label>
              <Input
                value={leaveRequest.emergency_contact}
                onChange={(e) => setLeaveRequest({ ...leaveRequest, emergency_contact: e.target.value })}
                placeholder="Emergency contact number"
              />
            </div>

            <Button onClick={handleSubmitLeaveRequest} className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90">
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}