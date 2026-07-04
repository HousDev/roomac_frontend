// modules/inventory/InventoryDashboard.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingCart,
  Handshake,
  ClipboardCheck,
  IndianRupee,
  AlertCircle,
  Clock,
  FileText,
  Shield,
  Gavel,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

// API imports
import { getInventory, getInventoryStats } from "@/lib/assestsApi";
import { getPurchases, getPurchaseStats } from "@/lib/materialPurchaseApi";
import { getHandovers, getHandoverStats } from "@/lib/handoverApi";
import { getInspections, getInspectionStats } from "@/lib/moveOutInspectionApi";
import { getSettlementStats } from "@/lib/settlementApi";

// ─── Helpers ──────────────────────────────────────────────────────────────

const n = (v: any) => (isNaN(Number(v)) ? 0 : Number(v));

const formatCurrency = (amount: number) => {
  if (!amount || amount === 0) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
};

// ─── Stat Card (compact) ─────────────────────────────────────────────────

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  onClick,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  bgColor: string;
  onClick?: () => void;
  subtitle?: string;
}) => (
  <div
    className={`${bgColor} rounded-xl p-2.5 shadow-sm hover:shadow transition-all duration-300 border border-gray-100 ${
      onClick ? "cursor-pointer hover:scale-105" : ""
    }`}
    onClick={onClick}
  >
    <div className="flex items-center gap-2.5">
      <div className={`${color} p-1.5 rounded-lg shadow-sm flex-shrink-0`}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-gray-600 truncate">{title}</p>
        <p className="text-sm font-bold text-gray-800 truncate">{value}</p>
        {subtitle && (
          <p className="text-[9px] text-gray-400 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

// ─── Recent Table Component ──────────────────────────────────────────────

const RecentTable = ({
  title,
  icon: Icon,
  data,
  loading,
  renderRow,
  viewAllPath,
  navigate,
}: {
  title: string;
  icon: any;
  data: any[];
  loading: boolean;
  renderRow: (item: any, index: number) => React.ReactNode;
  viewAllPath: string;
  navigate: (path: string) => void;
}) => {
  if (loading) {
    return (
      <Card className="border-0 shadow">
        <CardHeader className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Icon className="h-4 w-4 text-blue-600" />
              {title}
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-blue-600" disabled>
              Loading...
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow">
        <CardHeader className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Icon className="h-4 w-4 text-blue-600" />
              {title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(viewAllPath)}
              className="text-xs text-blue-600"
            >
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="text-center py-8">
            <Package className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No recent {title.toLowerCase()}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow">
      <CardHeader className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Icon className="h-4 w-4 text-blue-600" />
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(viewAllPath)}
            className="text-xs text-blue-600"
          >
            View All <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-1">
          {data.slice(0, 5).map((item, idx) => renderRow(item, idx))}
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

export function InventoryDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState(new Date());

  // Stats
  const [invStats, setInvStats] = useState<any>({});
  const [purStats, setPurStats] = useState<any>({});
  const [handStats, setHandStats] = useState<any>({});
  const [inspStats, setInspStats] = useState<any>({});
  const [settStats, setSettStats] = useState<any>({});

  // Stock counts (computed manually for consistency with Assets filter)
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  // Recent data
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [recentHandovers, setRecentHandovers] = useState<any[]>([]);
  const [recentInspections, setRecentInspections] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch inventory items to compute low/out of stock (same logic as Assets filter)
      const inventoryRes = await getInventory({ limit: 999999 });
      const items = inventoryRes.data || [];
      const low = items.filter(i => i.quantity > 0 && i.quantity <= i.min_stock_level).length;
      const out = items.filter(i => i.quantity === 0).length;
      setLowStockCount(low);
      setOutOfStockCount(out);

      // 2. Fetch stats from APIs
      const [invR, purR, handR, inspR, settR] = await Promise.allSettled([
        getInventoryStats(),
        getPurchaseStats(),
        getHandoverStats(),
        getInspectionStats(),
        getSettlementStats(),
      ]);

      setInvStats(invR.status === "fulfilled" ? invR.value.data : {});
      setPurStats(purR.status === "fulfilled" ? purR.value.data : {});
      setHandStats(handR.status === "fulfilled" ? handR.value.data : {});
      setInspStats(inspR.status === "fulfilled" ? inspR.value.data : {});
      setSettStats(settR.status === "fulfilled" ? settR.value.data : {});

      // 3. Recent data
      const [purRes, handRes, inspRes] = await Promise.all([
        getPurchases({ limit: 5, page: 1 }),
        getHandovers({ limit: 5 }),
        getInspections({ limit: 5 }),
      ]);

      setRecentPurchases(purRes.data || []);
      setRecentHandovers(handRes.data || []);
      setRecentInspections(inspRes.data || []);

      setRefreshedAt(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ─── Render recent rows ──────────────────────────────────────────────────

  const renderPurchaseRow = (purchase: any, idx: number) => {
    const statusColor =
      purchase.payment_status === "Paid"
        ? "bg-green-100 text-green-700"
        : purchase.payment_status === "Partial"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";
    return (
      <div
        key={purchase.id || idx}
        className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg cursor-pointer"
        onClick={() => router.push("/admin/inventory/purchase")}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">
              {purchase.invoice_number}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <span>{purchase.vendor_name}</span>
              <span>•</span>
              <span>{format(new Date(purchase.purchase_date), "dd MMM")}</span>
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-gray-800">
            {formatCurrency(purchase.total_amount)}
          </p>
          <Badge className={`${statusColor} text-[9px] px-1.5 py-0`}>
            {purchase.payment_status}
          </Badge>
        </div>
      </div>
    );
  };

  const renderHandoverRow = (handover: any, idx: number) => {
    const statusColor =
      handover.status === "Active"
        ? "bg-blue-100 text-blue-700"
        : handover.status === "Confirmed"
        ? "bg-green-100 text-green-700"
        : handover.status === "Completed"
        ? "bg-gray-100 text-gray-700"
        : "bg-yellow-100 text-yellow-700";
    return (
      <div
        key={handover.id || idx}
        className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg cursor-pointer"
        onClick={() => router.push("/admin/inventory/handover")}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Handshake className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">
              {handover.tenant_name}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <span>{handover.property_name}</span>
              <span>•</span>
              <span>{handover.room_number}</span>
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <Badge className={`${statusColor} text-[9px] px-1.5 py-0`}>
            {handover.status}
          </Badge>
          <p className="text-xs text-gray-500 mt-0.5">
            {format(new Date(handover.handover_date), "dd MMM")}
          </p>
        </div>
      </div>
    );
  };

  const renderInspectionRow = (inspection: any, idx: number) => {
    const statusColor =
      inspection.status === "Approved"
        ? "bg-green-100 text-green-700"
        : inspection.status === "Completed"
        ? "bg-blue-100 text-blue-700"
        : inspection.status === "Pending"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";
    return (
      <div
        key={inspection.id || idx}
        className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg cursor-pointer"
        onClick={() => router.push("/admin/inventory/inspection")}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <ClipboardCheck className="h-3.5 w-3.5 text-orange-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">
              {inspection.tenant_name}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <span>{inspection.property_name}</span>
              <span>•</span>
              <span>{inspection.inspector_name}</span>
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-gray-800">
            {formatCurrency(inspection.total_penalty)}
          </p>
          <Badge className={`${statusColor} text-[9px] px-1.5 py-0`}>
            {inspection.status}
          </Badge>
        </div>
      </div>
    );
  };

  // ── Loading state ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadData} className="bg-blue-600 hover:bg-blue-700">
          Retry
        </Button>
      </div>
    );
  }

  // ─── Derived values ────────────────────────────────────────────────────

  const totalAssets = n(invStats.total_items);
  const totalValue = n(invStats.total_value);
  const totalPurchases = n(purStats.total_purchases);
  const totalPurchaseAmount = n(purStats.total_amount);
  const totalHandovers = n(handStats.total);
  const activeHandovers = n(handStats.active);
  const totalInspections = n(inspStats.total);
  const completedInspections = n(inspStats.completed);
  const totalPenalties = n(inspStats.total_penalties);
  const totalSettlements = n(settStats.total);
  const paidSettlements = n(settStats.paid_count) + n(settStats.completed_count);
  const totalRefunds = n(settStats.total_refunds);
  const totalDeposits = n(handStats.total_deposits);
  const pendingInspections = n(inspStats.pending);

  const BASE = "/admin/inventory";

  // ─── Main Render ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 p-2 md:p-2">
    

      {/* ── Alerts (single row, responsive) ── */}
      {(lowStockCount > 0 || outOfStockCount > 0 || pendingInspections > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {outOfStockCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-xs md:text-sm text-red-700 font-medium flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              {outOfStockCount} item{outOfStockCount > 1 ? "s" : ""} out of stock
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5 text-xs md:text-sm text-yellow-700 font-medium flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              {lowStockCount} item{lowStockCount > 1 ? "s" : ""} low on stock
            </div>
          )}
          {pendingInspections > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-xs md:text-sm text-blue-700 font-medium flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {pendingInspections} inspection{pendingInspections > 1 ? "s" : ""} pending review
            </div>
          )}
        </div>
      )}

      {/* ── Stats Row 1 (compact) ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mb-4">
        <StatCard
          title="Total Assets"
          value={totalAssets}
          icon={Package}
          color="bg-blue-600"
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          subtitle={`Value ${formatCurrency(totalValue)}`}
        />
        <StatCard
          title="Purchase Amount"
          value={formatCurrency(totalPurchaseAmount)}
          icon={ShoppingCart}
          color="bg-indigo-600"
          bgColor="bg-gradient-to-br from-indigo-50 to-indigo-100"
          subtitle={`${totalPurchases} purchases`}
        />
        <StatCard
          title="Total Handovers"
          value={totalHandovers}
          icon={Handshake}
          color="bg-purple-600"
          bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
          subtitle={`${activeHandovers} active`}
        />
        <StatCard
          title="Inspections"
          value={totalInspections}
          icon={ClipboardCheck}
          color="bg-orange-600"
          bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
          subtitle={`${completedInspections} completed`}
        />
         <StatCard
          title="Settlements"
          value={totalSettlements}
          icon={FileText}
          color="bg-teal-600"
          bgColor="bg-gradient-to-br from-teal-50 to-teal-100"
          subtitle={`${paidSettlements} paid`}
        />
      </div>


      {/* ── Recent Activity ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RecentTable
          title="Recent Purchases"
          icon={ShoppingCart}
          data={recentPurchases}
          loading={loading}
          renderRow={renderPurchaseRow}
          viewAllPath={`${BASE}/purchase`}
          navigate={router.push}
        />

        <RecentTable
          title="Recent Handovers"
          icon={Handshake}
          data={recentHandovers}
          loading={loading}
          renderRow={renderHandoverRow}
          viewAllPath={`${BASE}/handover`}
          navigate={router.push}
        />

        <RecentTable
          title="Recent Inspections"
          icon={ClipboardCheck}
          data={recentInspections}
          loading={loading}
          renderRow={renderInspectionRow}
          viewAllPath={`${BASE}/inspection`}
          navigate={router.push}
        />
      </div>

      {/* ── Quick Navigation ── */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
          Quick Access
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Assets", icon: Package, path: `${BASE}/assets`, desc: "Manage all assets" },
            { label: "Purchase", icon: ShoppingCart, path: `${BASE}/purchase`, desc: "Record purchases" },
            { label: "Handover", icon: Handshake, path: `${BASE}/handover`, desc: "Tenant move-in" },
            { label: "Inspection", icon: ClipboardCheck, path: `${BASE}/inspection`, desc: "Move-out checks" },
            { label: "Settlements", icon: FileText, path: `${BASE}/settlements`, desc: "Deposit refunds" },
            { label: "Penalty Rules", icon: Gavel, path: `${BASE}/penalty-rules`, desc: "Configure penalties" },
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => router.push(item.path)}
              className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center text-center"
            >
              <item.icon className="h-5 w-5 text-blue-600 mb-1.5" />
              <span className="text-xs font-semibold text-gray-800">{item.label}</span>
              <span className="text-[10px] text-gray-500">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}