// "use client";

// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Loader2, Shield, IndianRupee, Calendar } from "lucide-react";
// import { toast } from "sonner";
// import { processVacatedTenantRefund, processVacatedTenantPayment } from "@/lib/tenantApi";

// interface VacatedTenantPaymentModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   tenant: {
//     id: number;
//     full_name: string;
//   };
//   amount: number;
//   type: "refund" | "payment";
//   onSuccess: () => void;
// }

// export function VacatedTenantPaymentModal({
//   open,
//   onOpenChange,
//   tenant,
//   amount,
//   type,
//   onSuccess,
// }: VacatedTenantPaymentModalProps) {
//   const [loading, setLoading] = useState(false);
//   const [paymentMode, setPaymentMode] = useState<string>(type === "refund" ? "bank_transfer" : "online");
//   const [bankName, setBankName] = useState("");
//   const [transactionId, setTransactionId] = useState("");
//   const [remark, setRemark] = useState("");
//   const [transactionDate, setTransactionDate] = useState<string>(
//     new Date().toISOString().split("T")[0]
//   );

//   const handleSubmit = async () => {
//     setLoading(true);
//     try {
//       const data = {
//         amount: amount,
//         payment_mode: paymentMode,
//         bank_name: paymentMode === "bank_transfer" ? bankName : undefined,
//         transaction_id: transactionId || undefined,
//         payment_date: transactionDate,
//         remark: remark || undefined,
//       };

//       let response;
//       if (type === "refund") {
//         response = await processVacatedTenantRefund(tenant.id, data);
//       } else {
//         response = await processVacatedTenantPayment(tenant.id, data);
//       }

//       if (response.success) {
//         toast.success(
//           type === "refund"
//             ? `Refund of ₹${amount.toLocaleString()} processed successfully`
//             : `Payment of ₹${amount.toLocaleString()} recorded successfully`
//         );
//         onSuccess();
//         onOpenChange(false);
//         resetForm();
//       } else {
//         toast.error(response.message || "Failed to process");
//       }
//     } catch (error: any) {
//       console.error("Error:", error);
//       toast.error(error.message || "Failed to process");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setPaymentMode(type === "refund" ? "bank_transfer" : "online");
//     setBankName("");
//     setTransactionId("");
//     setTransactionDate(new Date().toISOString().split("T")[0]);
//     setRemark("");
//   };

//   const isRefund = type === "refund";

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             {isRefund ? (
//               <Shield className="h-5 w-5 text-green-600" />
//             ) : (
//               <IndianRupee className="h-5 w-5 text-orange-600" />
//             )}
//             {isRefund ? "Process Refund" : "Record Payment"}
//           </DialogTitle>
//           <DialogDescription>
//             {isRefund
//               ? `Process refund of ₹${amount.toLocaleString()} for ${tenant.full_name}`
//               : `Record payment of ₹${amount.toLocaleString()} from ${tenant.full_name}`}
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4 py-4">
//           {/* Amount Display */}
//           <div className="bg-gray-50 p-3 rounded-lg text-center">
//             <p className="text-sm text-gray-500 mb-1">Amount</p>
//             <p className="text-2xl font-bold text-green-600">₹{amount.toLocaleString()}</p>
//           </div>

//           {/* Transaction Date */}
//           <div className="space-y-2">
//             <Label className="text-sm font-medium flex items-center gap-2">
//               <Calendar className="h-4 w-4" />
//               Transaction Date *
//             </Label>
//             <Input
//               type="date"
//               value={transactionDate}
//               onChange={(e) => setTransactionDate(e.target.value)}
//               max={new Date().toISOString().split("T")[0]}
//               className="h-9"
//             />
//             <p className="text-xs text-gray-500">
//               Select the date when the {isRefund ? "refund was processed" : "payment was received"}
//             </p>
//           </div>

//           {/* Payment Mode */}
//           <div className="space-y-2">
//             <Label className="text-sm font-medium">Payment Mode *</Label>
//             <Select value={paymentMode} onValueChange={setPaymentMode}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select payment mode" />
//               </SelectTrigger>
//               <SelectContent>
//                 {isRefund ? (
//                   <>
//                     <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
//                     <SelectItem value="online">Online</SelectItem>
//                     <SelectItem value="cheque">Cheque</SelectItem>
//                     <SelectItem value="cash">Cash</SelectItem>
//                   </>
//                 ) : (
//                   <>
//                     <SelectItem value="online">Online</SelectItem>
//                     <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
//                     <SelectItem value="cash">Cash</SelectItem>
//                     <SelectItem value="cheque">Cheque</SelectItem>
//                   </>
//                 )}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Bank Name - Only for Bank Transfer */}
//           {paymentMode === "bank_transfer" && (
//             <div className="space-y-2">
//               <Label className="text-sm font-medium">Bank Name</Label>
//               <Input
//                 placeholder="Enter bank name"
//                 value={bankName}
//                 onChange={(e) => setBankName(e.target.value)}
//               />
//             </div>
//           )}

//           {/* Transaction ID */}
//           <div className="space-y-2">
//             <Label className="text-sm font-medium">Transaction ID (Optional)</Label>
//             <Input
//               placeholder="Enter transaction ID"
//               value={transactionId}
//               onChange={(e) => setTransactionId(e.target.value)}
//             />
//           </div>

//           {/* Remark */}
//           <div className="space-y-2">
//             <Label className="text-sm font-medium">Remark (Optional)</Label>
//             <Textarea
//               placeholder="Add any remarks"
//               rows={3}
//               value={remark}
//               onChange={(e) => setRemark(e.target.value)}
//             />
//           </div>
//         </div>

//         <DialogFooter className="bottom-0 sticky bg-white">
//           <Button
//             variant="outline"
//             onClick={() => {
//               resetForm();
//               onOpenChange(false);
//             }}
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleSubmit}
//             disabled={loading || (paymentMode === "bank_transfer" && !bankName)}
//             className={isRefund ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Processing...
//               </>
//             ) : (
//               isRefund ? "Process Refund" : "Record Payment"
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }


//components/admin/tenants/VacatedTenantPaymentModal.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import { Loader2, Shield, IndianRupee, Calendar, X } from "lucide-react";
import { toast } from "sonner";
import { processVacatedTenantRefund, processVacatedTenantPayment } from "@/lib/tenantApi";
import { getMasterItemsByTab, getMasterValues } from "@/lib/masterApi";

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
  vacateRecordId?: number | null;
}

export function VacatedTenantPaymentModal({
  open,
  onOpenChange,
  tenant,
  amount,
  type,
  onSuccess,
  vacateRecordId,
}: VacatedTenantPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>(type === "refund" ? "bank_transfer" : "online");
  const [bankName, setBankName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [remark, setRemark] = useState("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // ✅ Masters-based payment modes
  const [paymentModes, setPaymentModes] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingPaymentModes, setLoadingPaymentModes] = useState(false);

  // ✅ Masters-based bank names
  const [bankNames, setBankNames] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingBankNames, setLoadingBankNames] = useState(false);

  // ✅ Fetch both when dialog opens
  useEffect(() => {
    if (open) {
      fetchPaymentModes();
      fetchBankNames();
    }
  }, [open]);

  // ✅ Fetch Payment Method from Masters → Common
  const fetchPaymentModes = async () => {
    setLoadingPaymentModes(true);
    try {
      const tabRes = await getMasterItemsByTab("Common");
      const tabList = Array.isArray(tabRes.data) ? tabRes.data : [];
      const paymentMethodItem = tabList.find(
        (i: any) => i.name?.toLowerCase().replace(/\s+/g, "") === "paymentmethod"
      );
      if (paymentMethodItem) {
        const valRes = await getMasterValues(paymentMethodItem.id);
        const vals = Array.isArray(valRes.data) ? valRes.data : [];
        const modes = vals
          .filter((v: any) => v.isactive === 1)
          .map((v: any) => ({
            id: (v.name || v.value || "").toLowerCase().replace(/\s+/g, "_"),
            name: v.name || v.value || "",
          }));
        setPaymentModes(modes);
      }
    } catch (error) {
      console.error("Error fetching payment modes:", error);
    } finally {
      setLoadingPaymentModes(false);
    }
  };

  // ✅ Fetch Bank Names from Masters → Common → Bank Names
  const fetchBankNames = async () => {
    setLoadingBankNames(true);
    try {
      const tabRes = await getMasterItemsByTab("Common");
      const tabList = Array.isArray(tabRes.data) ? tabRes.data : [];
      const bankNamesItem = tabList.find(
        (i: any) => i.name?.toLowerCase().replace(/\s+/g, "") === "banknames"
      );
      if (bankNamesItem) {
        const valRes = await getMasterValues(bankNamesItem.id);
        const vals = Array.isArray(valRes.data) ? valRes.data : [];
        const banks = vals
          .filter((v: any) => v.isactive === 1)
          .map((v: any) => ({
            id: (v.name || v.value || "").toLowerCase().replace(/\s+/g, "_"),
            name: v.name || v.value || "",
          }));
        setBankNames(banks);
      }
    } catch (error) {
      console.error("Error fetching bank names:", error);
    } finally {
      setLoadingBankNames(false);
    }
  };

  // ✅ ALL original logic preserved
 const handleSubmit = async () => {
    const cleanTenantId = typeof tenant.id === "string" && tenant.id.includes("-")
    ? parseInt(tenant.id.split("-")[0], 10)
    : tenant.id;

  if (!Number.isFinite(Number(cleanTenantId))) {
    toast.error("Invalid tenant reference — please close and reopen this dialog.");
    return;
  }
    setLoading(true);
    try {
      const data = {
        amount: amount,
        payment_mode: paymentMode,
        bank_name: needsBankName ? bankName : undefined,
        transaction_id: transactionId || undefined,
        payment_date: transactionDate,
        remark: remark || undefined,
        ...(type === "refund" && vacateRecordId && { vacate_record_id: vacateRecordId }), 
      };

      let response;
      if (type === "refund") {
        response = await processVacatedTenantRefund(cleanTenantId, data); // ✅ Uses cleanTenantId
      } else {
        response = await processVacatedTenantPayment(cleanTenantId, data); // ✅ Uses cleanTenantId
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

  // ✅ Check if selected mode needs bank name — covers all variations
  const needsBankName =
    paymentMode === "bank_transfer" ||
    paymentMode === "bank transfer" ||
    paymentMode?.toLowerCase().includes("bank");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto p-0 gap-0">

        {/* Compact Header */}
        <div className={`px-4 py-3 rounded-t-lg ${isRefund ? "bg-gradient-to-r from-green-600 to-emerald-600" : "bg-gradient-to-r from-orange-500 to-red-500"}`}>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-sm font-bold text-white flex items-center gap-2">
                {isRefund ? <Shield className="h-3.5 w-3.5" /> : <IndianRupee className="h-3.5 w-3.5" />}
                {isRefund ? "Process Refund" : "Record Payment"}
              </DialogTitle>
              <DialogDescription className="text-white/80 text-[11px] mt-0.5">
                {isRefund
                  ? `Refund ₹${amount.toLocaleString()} → ${tenant.full_name}`
                  : `Payment ₹${amount.toLocaleString()} from ${tenant.full_name}`}
              </DialogDescription>
            </div>
            <button
              onClick={() => { resetForm(); onOpenChange(false); }}
              className="p-1 rounded-full hover:bg-white/20 transition text-white/80 hover:text-white ml-2 flex-shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">

          {/* Amount Display */}
          <div className={`rounded-lg p-2.5 text-center ${isRefund ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
            <p className="text-[10px] text-gray-500 mb-0.5">Amount</p>
            <p className={`text-xl font-bold ${isRefund ? "text-green-600" : "text-orange-600"}`}>
              ₹{amount.toLocaleString()}
            </p>
          </div>

          {/* Row 1: Date + Mode */}
          <div style={{ display: "flex", flexDirection: "row", gap: "8px", width: "100%" }}>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
              <Label className="text-[11px] font-medium text-gray-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date *
              </Label>
              <Input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="h-8 text-xs"
              />
            </div>

            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
              <Label className="text-[11px] font-medium text-gray-600">Mode *</Label>
              <Select value={paymentMode} onValueChange={(val) => { setPaymentMode(val); setBankName(""); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingPaymentModes ? (
                    <div className="px-2 py-2 text-xs text-gray-500 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                    </div>
                  ) : paymentModes.length > 0 ? (
                    paymentModes.map((mode) => (
                      <SelectItem key={mode.id} value={mode.id} className="text-xs">
                        {mode.name}
                      </SelectItem>
                    ))
                  ) : (
                    // ✅ Fallback — original static options preserved
                    isRefund ? (
                      <>
                        <SelectItem value="bank_transfer" className="text-xs">Bank Transfer</SelectItem>
                        <SelectItem value="online" className="text-xs">Online</SelectItem>
                        <SelectItem value="cheque" className="text-xs">Cheque</SelectItem>
                        <SelectItem value="cash" className="text-xs">Cash</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="online" className="text-xs">Online</SelectItem>
                        <SelectItem value="bank_transfer" className="text-xs">Bank Transfer</SelectItem>
                        <SelectItem value="cash" className="text-xs">Cash</SelectItem>
                        <SelectItem value="cheque" className="text-xs">Cheque</SelectItem>
                      </>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Bank Name + Transaction ID — only when Bank Transfer selected */}
          {needsBankName && (
            <div style={{ display: "flex", flexDirection: "row", gap: "8px", width: "100%" }}>
              {/* Bank Name from Masters */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                <Label className="text-[11px] font-medium text-gray-600">Bank Name *</Label>
                <Select value={bankName} onValueChange={setBankName}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select bank..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingBankNames ? (
                      <div className="px-2 py-2 text-xs text-gray-500 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                      </div>
                    ) : bankNames.length > 0 ? (
                      bankNames.map((bank) => (
                        <SelectItem key={bank.id} value={bank.name} className="text-xs">
                          {bank.name}
                        </SelectItem>
                      ))
                    ) : (
                      // ✅ Fallback — manual input if no masters data
                      <div className="p-2">
                        <Input
                          placeholder="Type bank name..."
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="h-7 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction ID */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                <Label className="text-[11px] font-medium text-gray-600">Transaction ID</Label>
                <Input
                  placeholder="Optional"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          )}

          {/* Transaction ID alone — when NOT bank transfer */}
          {!needsBankName && (
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600">Transaction ID (Optional)</Label>
              <Input
                placeholder="Enter transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}

          {/* Remark */}
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-gray-600">Remark (Optional)</Label>
            <Textarea
              placeholder="Add any remarks"
              rows={2}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="text-xs resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-gray-50 rounded-b-lg flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { resetForm(); onOpenChange(false); }}
            disabled={loading}
            className="h-7 text-xs px-3"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={loading || (needsBankName && !bankName)}
            className={`h-7 text-xs px-3 ${isRefund ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"} text-white`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                Processing...
              </>
            ) : (
              isRefund ? "Process Refund" : "Record Payment"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}