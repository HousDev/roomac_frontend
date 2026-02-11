'use client';

import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Plus, Eye, Filter, Calendar, CreditCard as CreditCardIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentsTabProps {
  payments: any[];
  stats: any;
}

function PaymentsTab({ payments, stats }: PaymentsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.payment_for.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPending = payments.filter(p => p.payment_status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const totalCompleted = payments.filter(p => p.payment_status === "completed").reduce((sum, p) => sum + p.amount, 0);

  const handleExport = () => {
    toast.success("Exporting payment history...");
    // Implement export logic
  };

  const handleMakePayment = () => {
    toast.info("Redirecting to payment gateway...");
    // Implement payment logic
  };

  const handleViewDetails = (payment: any) => {
    toast.info(`Viewing details for: ${payment.payment_for}`);
    // Implement view details logic
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="text-xs">Completed</Badge>;
      case "pending":
        return <Badge variant="destructive" className="text-xs">Pending</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border border-slate-200/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Total Balance</p>
                <p className="text-xl font-bold text-slate-900">₹{(totalPending + totalCompleted).toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCardIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Pending</p>
                <p className="text-xl font-bold text-red-600">₹{totalPending.toLocaleString()}</p>
              </div>
              <Badge variant="destructive" className="text-xs">
                {stats.pendingPayments} Payments
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Completed</p>
                <p className="text-xl font-bold text-green-600">₹{totalCompleted.toLocaleString()}</p>
              </div>
              <Badge variant="default" className="text-xs">
                {payments.filter(p => p.payment_status === "completed").length} Payments
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="border border-slate-200/80">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Left: Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-32 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="h-9 w-36 text-sm">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="h-9 text-sm flex-1 sm:flex-none"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={handleMakePayment}
                className="h-9 text-sm bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Make Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="border border-slate-200/80 shadow-sm">
        <CardHeader className="px-4 py-3 border-b border-slate-100">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4" />
            Payment History
            <Badge variant="outline" className="text-xs">
              {filteredPayments.length} records
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <CreditCardIcon className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900">No payments found</p>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery ? "Try a different search term" : "No payment records available"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                        payment.payment_status === "completed" 
                          ? "bg-green-100" 
                          : "bg-red-100"
                      }`}>
                        <CreditCardIcon className={`h-4 w-4 ${
                          payment.payment_status === "completed" 
                            ? "text-green-600" 
                            : "text-red-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900">{payment.payment_for}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <p className="text-xs text-slate-600">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(payment.payment_date).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          {getStatusBadge(payment.payment_status)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 sm:mt-0 sm:pl-4">
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-700">₹{Number(payment.amount).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500">
                        {payment.payment_status === "pending" ? "Due" : "Paid"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(payment)}
                        className="h-8 w-8 hover:bg-slate-100"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-slate-100"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Payments Alert */}
      {stats.pendingPayments > 0 && (
        <Card className="border border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">Pending Payments Alert</p>
                  <p className="text-xs text-amber-800">
                    You have {stats.pendingPayments} pending payment(s) totaling ₹{totalPending.toLocaleString()}
                  </p>
                </div>
              </div>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-8 text-xs">
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default memo(PaymentsTab);


