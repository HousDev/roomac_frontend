"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Shield, IndianRupee, Calendar } from "lucide-react";
import { toast } from "sonner";
import { processVacatedTenantRefund, processVacatedTenantPayment } from "@/lib/tenantApi";

interface VacatedTenantPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: {
    id: number;
    full_name: string;
  };
  amount: number;
  type: "refund" | "payment";
  onSuccess: () => void;
}

export function VacatedTenantPaymentModal({
  open,
  onOpenChange,
  tenant,
  amount,
  type,
  onSuccess,
}: VacatedTenantPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>(type === "refund" ? "bank_transfer" : "online");
  const [bankName, setBankName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [remark, setRemark] = useState("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = {
        amount: amount,
        payment_mode: paymentMode,
        bank_name: paymentMode === "bank_transfer" ? bankName : undefined,
        transaction_id: transactionId || undefined,
        payment_date: transactionDate,
        remark: remark || undefined,
      };

      let response;
      if (type === "refund") {
        response = await processVacatedTenantRefund(tenant.id, data);
      } else {
        response = await processVacatedTenantPayment(tenant.id, data);
      }

      if (response.success) {
        toast.success(
          type === "refund"
            ? `Refund of ₹${amount.toLocaleString()} processed successfully`
            : `Payment of ₹${amount.toLocaleString()} recorded successfully`
        );
        onSuccess();
        onOpenChange(false);
        resetForm();
      } else {
        toast.error(response.message || "Failed to process");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to process");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPaymentMode(type === "refund" ? "bank_transfer" : "online");
    setBankName("");
    setTransactionId("");
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setRemark("");
  };

  const isRefund = type === "refund";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isRefund ? (
              <Shield className="h-5 w-5 text-green-600" />
            ) : (
              <IndianRupee className="h-5 w-5 text-orange-600" />
            )}
            {isRefund ? "Process Refund" : "Record Payment"}
          </DialogTitle>
          <DialogDescription>
            {isRefund
              ? `Process refund of ₹${amount.toLocaleString()} for ${tenant.full_name}`
              : `Record payment of ₹${amount.toLocaleString()} from ${tenant.full_name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount Display */}
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-500 mb-1">Amount</p>
            <p className="text-2xl font-bold text-green-600">₹{amount.toLocaleString()}</p>
          </div>

          {/* Transaction Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Transaction Date *
            </Label>
            <Input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="h-9"
            />
            <p className="text-xs text-gray-500">
              Select the date when the {isRefund ? "refund was processed" : "payment was received"}
            </p>
          </div>

          {/* Payment Mode */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment Mode *</Label>
            <Select value={paymentMode} onValueChange={setPaymentMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                {isRefund ? (
                  <>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Bank Name - Only for Bank Transfer */}
          {paymentMode === "bank_transfer" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bank Name</Label>
              <Input
                placeholder="Enter bank name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
          )}

          {/* Transaction ID */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Transaction ID (Optional)</Label>
            <Input
              placeholder="Enter transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>

          {/* Remark */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Remark (Optional)</Label>
            <Textarea
              placeholder="Add any remarks"
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="bottom-0 sticky bg-white">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || (paymentMode === "bank_transfer" && !bankName)}
            className={isRefund ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              isRefund ? "Process Refund" : "Record Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}