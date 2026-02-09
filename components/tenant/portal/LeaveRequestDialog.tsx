'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveRequest: {
    requested_leave_date: string;
    reason: string;
  };
  setLeaveRequest: (request: any) => void;
  booking: any;
  onSubmit: () => void;
}

export default function LeaveRequestDialog({
  open,
  onOpenChange,
  leaveRequest,
  setLeaveRequest,
  booking,
  onSubmit
}: LeaveRequestDialogProps) {
  // Calculate lock-in violation days if applicable
  const calculateLockInInfo = () => {
    if (!booking?.lock_in_end_date || !leaveRequest.requested_leave_date) {
      return null;
    }

    const lockInEndDate = new Date(booking.lock_in_end_date);
    const requestedDate = new Date(leaveRequest.requested_leave_date);
    
    if (requestedDate >= lockInEndDate) {
      return {
        type: "completed",
        message: "Lock-in period completed. Full deposit will be refunded."
      };
    } else {
      const daysRemaining = Math.ceil((lockInEndDate.getTime() - requestedDate.getTime()) / (1000 * 3600 * 24));
      return {
        type: "violation",
        days: daysRemaining,
        message: `Lock-in period not completed. ${daysRemaining} days remaining. Deposit may be partially forfeited.`
      };
    }
  };

  const lockInInfo = calculateLockInInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start h-9 text-sm hover:bg-slate-50"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-sm">Submit Leave Request</DialogTitle>
              <p className="text-xs text-slate-500">Vacation or early termination</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Booking Info */}
          {booking && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-md bg-blue-100 flex items-center justify-center">
                    <AlertCircle className="h-3 w-3 text-blue-600" />
                  </div>
                  <p className="text-xs font-semibold text-blue-900">Current Booking</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Room #{booking?.rooms?.room_number || '302'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-blue-600">Check-in</p>
                  <p className="font-medium">
                    {booking?.check_in_date ? new Date(booking.check_in_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-blue-600">Lock-in Ends</p>
                  <p className="font-medium">
                    {booking?.lock_in_end_date ? new Date(booking.lock_in_end_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lock-in Warning */}
          {lockInInfo && (
            <div className={`p-3 rounded-lg border ${
              lockInInfo.type === "violation" 
                ? "bg-yellow-50 border-yellow-200" 
                : "bg-green-50 border-green-200"
            }`}>
              <div className="flex items-start gap-2">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 ${
                  lockInInfo.type === "violation" ? "bg-yellow-100" : "bg-green-100"
                }`}>
                  <AlertCircle className={`h-3 w-3 ${
                    lockInInfo.type === "violation" ? "text-yellow-600" : "text-green-600"
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${
                    lockInInfo.type === "violation" ? "text-yellow-900" : "text-green-900"
                  }`}>
                    {lockInInfo.type === "violation" ? "Lock-in Period Alert" : "Lock-in Completed"}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    lockInInfo.type === "violation" ? "text-yellow-800" : "text-green-800"
                  }`}>
                    {lockInInfo.message}
                  </p>
                  {lockInInfo.type === "violation" && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="destructive" className="text-[10px]">
                        {lockInInfo.days} days early
                      </Badge>
                      <span className="text-[10px] text-yellow-700">
                        Deposit penalty may apply
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Requested Leave Date */}
          <div>
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Requested Leave Date
            </Label>
            <Input
              type="date"
              value={leaveRequest.requested_leave_date}
              onChange={(e) => setLeaveRequest({ ...leaveRequest, requested_leave_date: e.target.value })}
              className="mt-1.5 h-9 text-sm"
              min={new Date().toISOString().split('T')[0]}
            />
            {leaveRequest.requested_leave_date && (
              <p className="text-[10px] text-slate-500 mt-1">
                Selected: {new Date(leaveRequest.requested_leave_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <Label className="text-xs font-medium">Reason for Leave</Label>
            <Textarea
              value={leaveRequest.reason}
              onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
              rows={4}
              className="mt-1.5 text-sm"
              placeholder="Please provide a detailed reason for your leave request..."
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Be specific about your reason. This helps with processing and deposit refunds.
            </p>
          </div>

          {/* Deposit Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs font-semibold text-slate-900 mb-1">Deposit Information</p>
            <ul className="text-[11px] text-slate-600 space-y-1">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                Deposit amount: ₹{booking?.deposit_amount || '30,000'}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                Refund processed within 7-14 working days
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                Deductions may apply for damages or early termination
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button 
              onClick={onSubmit} 
              className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm"
              disabled={!leaveRequest.requested_leave_date || !leaveRequest.reason.trim()}
            >
              Submit Leave Request
            </Button>
            <p className="text-[10px] text-slate-500 text-center mt-2">
              By submitting, you agree to the terms and conditions of your rental agreement.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}