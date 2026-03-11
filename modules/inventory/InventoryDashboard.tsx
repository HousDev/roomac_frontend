import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, ClipboardCheck, AlertTriangle, TrendingUp, BarChart3, DollarSign, Activity, Loader2 } from 'lucide-react';

interface DashboardStats {
  totalAssets: number;
  allocatedAssets: number;
  inStockAssets: number;
  maintenanceAssets: number;
  damagedAssets: number;
  totalPurchases: number;
  purchasesThisMonth: number;
  totalPurchaseValue: number;
  activeHandovers: number;
  pendingInspections: number;
  pendingSettlements: number;
}

export function InventoryDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    allocatedAssets: 0,
    inStockAssets: 0,
    maintenanceAssets: 0,
    damagedAssets: 0,
    totalPurchases: 0,
    purchasesThisMonth: 0,
    totalPurchaseValue: 0,
    activeHandovers: 0,
    pendingInspections: 0,
    pendingSettlements: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call with static data
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Static data
      const assets = [
        { status: 'Allocated', condition: 'Good' },
        { status: 'Allocated', condition: 'Good' },
        { status: 'In Stock', condition: 'Good' },
        { status: 'In Stock', condition: 'Good' },
        { status: 'In Stock', condition: 'Good' },
        { status: 'Maintenance', condition: 'Maintenance' },
        { status: 'Maintenance', condition: 'Maintenance' },
        { status: 'In Stock', condition: 'Damaged' },
        { status: 'In Stock', condition: 'Good' },
        { status: 'Allocated', condition: 'Good' }
      ];

      const purchases = [
        { purchase_date: '2026-03-01', total_amount: 25000 },
        { purchase_date: '2026-03-05', total_amount: 15000 },
        { purchase_date: '2026-02-15', total_amount: 30000 },
        { purchase_date: '2026-02-20', total_amount: 12000 },
        { purchase_date: '2026-01-10', total_amount: 5000 }
      ];

      const handovers = [
        { status: 'Active' },
        { status: 'Pending' },
        { status: 'Completed' }
      ];

      const inspections = [
        { status: 'Pending' },
        { status: 'Completed' },
        { status: 'Pending' }
      ];

      const settlements = [
        { status: 'Pending' },
        { status: 'Completed' },
        { status: 'Pending' }
      ];

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      setStats({
        totalAssets: assets.length,
        allocatedAssets: assets.filter(a => a.status === 'Allocated').length,
        inStockAssets: assets.filter(a => a.status === 'In Stock').length,
        maintenanceAssets: assets.filter(a => a.status === 'Maintenance').length,
        damagedAssets: assets.filter(a => a.condition === 'Damaged').length,
        totalPurchases: purchases.length,
        purchasesThisMonth: purchases.filter(p => {
          const date = new Date(p.purchase_date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length,
        totalPurchaseValue: purchases.reduce((sum, p) => sum + Number(p.total_amount || 0), 0),
        activeHandovers: handovers.filter(h => h.status === 'Active' || h.status === 'Pending').length,
        pendingInspections: inspections.filter(i => i.status === 'Pending').length,
        pendingSettlements: settlements.filter(s => s.status === 'Pending').length
      });
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error: {error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Inventory Dashboard
        </h1>
        <p className="text-gray-600 font-semibold mt-1">Complete overview of inventory and assets</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/inventory/assets" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-gray-600">Total Assets</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{stats.totalAssets}</div>
          <div className="text-xs font-semibold text-gray-500 mt-2">Click to manage assets</div>
        </Link>

        <Link to="/inventory/assets" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-sm font-bold text-gray-600">Asset Status</div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <div className="text-xs font-bold text-gray-500">Allocated</div>
              <div className="text-lg font-black text-emerald-600">{stats.allocatedAssets}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500">In Stock</div>
              <div className="text-lg font-black text-blue-600">{stats.inStockAssets}</div>
            </div>
          </div>
        </Link>

        <Link to="/inventory/assets" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm font-bold text-gray-600">Needs Attention</div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <div className="text-xs font-bold text-gray-500">Maintenance</div>
              <div className="text-lg font-black text-amber-600">{stats.maintenanceAssets}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500">Damaged</div>
              <div className="text-lg font-black text-red-600">{stats.damagedAssets}</div>
            </div>
          </div>
        </Link>

        <Link to="/inventory/purchase" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-sm font-bold text-gray-600">Purchases</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{stats.totalPurchases}</div>
          <div className="text-xs font-semibold text-gray-500 mt-2">{stats.purchasesThisMonth} this month</div>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/inventory/handover" className="glass rounded-xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-600">Active Handovers</div>
              <div className="text-2xl font-black text-gray-900">{stats.activeHandovers}</div>
            </div>
          </div>
        </Link>

        <Link to="/inventory/inspection" className="glass rounded-xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-600">Pending Inspections</div>
              <div className="text-2xl font-black text-gray-900">{stats.pendingInspections}</div>
            </div>
          </div>
        </Link>

        <Link to="/inventory/settlements" className="glass rounded-xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-600">Pending Settlements</div>
              <div className="text-2xl font-black text-gray-900">{stats.pendingSettlements}</div>
            </div>
          </div>
        </Link>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-black text-gray-900 mb-4">Financial Overview</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div>
              <div className="text-sm font-bold text-gray-600">Total Purchase Value</div>
              <div className="text-2xl font-black text-gray-900">₹{stats.totalPurchaseValue.toLocaleString('en-IN')}</div>
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-xs font-bold text-gray-600">This Month</div>
              <div className="text-xl font-black text-blue-900">{stats.purchasesThisMonth}</div>
              <div className="text-xs text-gray-600">Purchases</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <div className="text-xs font-bold text-gray-600">Pending</div>
              <div className="text-xl font-black text-emerald-900">{stats.pendingSettlements}</div>
              <div className="text-xs text-gray-600">Settlements</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/inventory/assets" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all">
          <div className="text-sm font-bold text-gray-700">Manage Assets</div>
          <div className="text-xs font-semibold text-gray-600 mt-1">Track all property assets</div>
        </Link>
        <Link to="/inventory/purchase" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all">
          <div className="text-sm font-bold text-gray-700">Material Purchase</div>
          <div className="text-xs font-semibold text-gray-600 mt-1">Record new purchases</div>
        </Link>
        <Link to="/inventory/handover" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all">
          <div className="text-sm font-bold text-gray-700">Tenant Handover</div>
          <div className="text-xs font-semibold text-gray-600 mt-1">Move-in documentation</div>
        </Link>
        <Link to="/inventory/inspection" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all">
          <div className="text-sm font-bold text-gray-700">Move-Out Inspection</div>
          <div className="text-xs font-semibold text-gray-600 mt-1">Inspect & calculate penalties</div>
        </Link>
      </div>
    </div>
  );
}