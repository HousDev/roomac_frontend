'use client';

import { useState, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Bell,
  Sun,
  Moon,
  HelpCircle,
  LogOut,
  Search,
  Menu,
  CreditCard,
  AlertCircle,
  Calendar,
  FileText,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface TenantHeaderProps {
  tenantName: string;
  tenantEmail?: string;
  notificationCount: number;
  onLogout: () => void;
  onNotificationsClick: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

function TenantHeader({
  tenantName,
  notificationCount,
  onLogout,
  onNotificationsClick,
  sidebarCollapsed,
  onToggleSidebar,
}: TenantHeaderProps) {
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

      {/* Notification Details Dialog - EXACT SAME AS YOUR CODE */}
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

export default memo(TenantHeader);