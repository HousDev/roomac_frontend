'use client';

import { useState, memo, useCallback } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Calendar,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  Zap,
  Clock,
  AlertCircle,
  FileText,
  Receipt,
  CheckCircle,
  Home,
  Download,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import ComplaintDialog from "./ComplaintDialog";
import LeaveRequestDialog from "./LeaveRequestDialog";

interface DashboardTabProps {
  stats: any;
  recentActivities: any[];
  booking: any;
  showComplaintDialog: boolean;
  setShowComplaintDialog: (show: boolean) => void;
  showLeaveDialog: boolean;
  setShowLeaveDialog: (show: boolean) => void;
  complaints: any[];
  setComplaints: (complaints: any[]) => void;
  setStats: (stats: any) => void;
  tenant: any;
  leaveRequests: any[];
  setLeaveRequests: (requests: any[]) => void;
  // Add these two
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

function DashboardTab({
  stats,
  recentActivities,
  booking,
  showComplaintDialog,
  setShowComplaintDialog,
  showLeaveDialog,
  setShowLeaveDialog,
  complaints,
  setComplaints,
  setStats,
  tenant,
  leaveRequests,
  setLeaveRequests,
}: any) {
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

  const metrics = [
    { 
      label: "Monthly Spending", 
      value: "₹45,000", 
      change: "+12%", 
      icon: TrendingUp, 
      color: "text-green-600", 
      bgColor: "bg-green-50",
      trend: "positive"
    },
  ];

  const pgAmenities = [
    { icon: <Home className="h-4 w-4" />, name: "High-Speed WiFi", available: true, status: "500 Mbps", uptime: "99.9%" },
  ];

  const roomAmenities = [
    { icon: <Home className="h-4 w-4" />, name: "Bed", available: true, status: "Queen Size" },
    // ... other room amenities
  ];

  const handleSubmitComplaint = useCallback(() => {
    if (!tenant || !booking) return;
    
    try {
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
      setStats((prev: any) => ({ ...prev, openComplaints: prev.openComplaints + 1 }));
      
      toast.success("Complaint submitted successfully");
      setShowComplaintDialog(false);
      setNewComplaint({ title: "", description: "", category: "maintenance", priority: "medium" });
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit complaint");
    }
  }, [tenant, booking, newComplaint, complaints, setComplaints, setStats, setShowComplaintDialog]);

  const handleSubmitLeaveRequest = useCallback(() => {
    if (!tenant || !booking) return;
    
    try {
      const lockInEndDate = booking.lock_in_end_date ? new Date(booking.lock_in_end_date) : null;
      const requestedDate = new Date(leaveRequest.requested_leave_date);
      const lockInCompleted = !lockInEndDate || requestedDate >= lockInEndDate ;
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
  }, [tenant, booking, leaveRequest, leaveRequests, setLeaveRequests, setShowLeaveDialog]);

  const handleViewAgreement = useCallback(() => {
    toast.info("Opening rental agreement...");
  }, []);

  const handleDownloadInvoice = useCallback(() => {
    toast.success("Invoice download started");
  }, []);

  return (
    <>
      {/* Key Metrics Grid */}
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

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Recent Activity */}
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
                {recentActivities.map((activity:any) => (
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

        {/* Right Column - Quick Actions & Amenities */}
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
                <ComplaintDialog
                  open={showComplaintDialog}
                  onOpenChange={setShowComplaintDialog}
                  newComplaint={newComplaint}
                  setNewComplaint={setNewComplaint}
                  onSubmit={handleSubmitComplaint}
                />

                <LeaveRequestDialog
                  open={showLeaveDialog}
                  onOpenChange={setShowLeaveDialog}
                  leaveRequest={leaveRequest}
                  setLeaveRequest={setLeaveRequest}
                  booking={booking}
                  onSubmit={handleSubmitLeaveRequest}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <ComplaintDialog
        open={showComplaintDialog}
        onOpenChange={setShowComplaintDialog}
        newComplaint={newComplaint}
        setNewComplaint={setNewComplaint}
        onSubmit={handleSubmitComplaint}
      />

      <LeaveRequestDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        leaveRequest={leaveRequest}
        setLeaveRequest={setLeaveRequest}
        booking={booking}
        onSubmit={handleSubmitLeaveRequest}
      />
    </>
  );
}

export default memo(DashboardTab);