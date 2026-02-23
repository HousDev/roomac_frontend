"use client";

import { Button } from "@/components/ui/button";
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
  AlertCircle,
  Calendar,
} from "lucide-react";
import { NewComplaint, LeaveRequestForm } from "./";

interface QuickActionsProps {
  showComplaintDialog: boolean;
  showLeaveDialog: boolean;
  onComplaintDialogChange: (open: boolean) => void;
  onLeaveDialogChange: (open: boolean) => void;
  newComplaint: NewComplaint;
  onNewComplaintChange: (complaint: NewComplaint) => void;
  leaveRequest: LeaveRequestForm;
  onLeaveRequestChange: (request: LeaveRequestForm) => void;
  onSubmitComplaint: () => void;
  onSubmitLeaveRequest: () => void;
  lockInEndDate?: string | null;
}

export default function QuickActions({
  showComplaintDialog,
  showLeaveDialog,
  onComplaintDialogChange,
  onLeaveDialogChange,
  newComplaint,
  onNewComplaintChange,
  leaveRequest,
  onLeaveRequestChange,
  onSubmitComplaint,
  onSubmitLeaveRequest,
  lockInEndDate,
}: QuickActionsProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Zap className="h-4 w-4 text-orange-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Complaint Dialog */}
          <Dialog open={showComplaintDialog} onOpenChange={onComplaintDialogChange}>
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
                    onChange={(e) => onNewComplaintChange({ ...newComplaint, title: e.target.value })}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">Category</Label>
                    <Select 
                      value={newComplaint.category} 
                      onValueChange={(value) => onNewComplaintChange({ ...newComplaint, category: value })}
                    >
                      <SelectTrigger className="mt-1 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
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
                    <Select 
                      value={newComplaint.priority} 
                      onValueChange={(value) => onNewComplaintChange({ ...newComplaint, priority: value })}
                    >
                      <SelectTrigger className="mt-1 h-9 text-sm">
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
                </div>
                <div>
                  <Label className="text-xs font-medium">Description</Label>
                  <Textarea
                    value={newComplaint.description}
                    onChange={(e) => onNewComplaintChange({ ...newComplaint, description: e.target.value })}
                    rows={3}
                    className="mt-1 text-sm"
                  />
                </div>
                <Button 
                  onClick={onSubmitComplaint} 
                  className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm"
                >
                  Submit Complaint
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Leave Request Dialog */}
          <Dialog open={showLeaveDialog} onOpenChange={onLeaveDialogChange}>
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
                {lockInEndDate && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs">
                    <p className="font-semibold text-yellow-900">Lock-in Period Info</p>
                    <p className="text-yellow-800">Ends: {new Date(lockInEndDate).toLocaleDateString()}</p>
                    <p className="text-[10px] text-yellow-700">Leaving early may forfeit deposit</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs font-medium">Requested Leave Date</Label>
                  <Input
                    type="date"
                    value={leaveRequest.requested_leave_date}
                    onChange={(e) => onLeaveRequestChange({ ...leaveRequest, requested_leave_date: e.target.value })}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Reason</Label>
                  <Textarea
                    value={leaveRequest.reason}
                    onChange={(e) => onLeaveRequestChange({ ...leaveRequest, reason: e.target.value })}
                    rows={3}
                    className="mt-1 text-sm"
                  />
                </div>
                <Button 
                  onClick={onSubmitLeaveRequest} 
                  className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm"
                >
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";