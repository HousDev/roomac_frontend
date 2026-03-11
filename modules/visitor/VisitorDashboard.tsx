import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, LogIn, LogOut, Clock, TrendingUp, Car, FileText, UserPlus, BarChart3, Loader2 } from 'lucide-react';

interface DashboardStats {
  totalVisitors: number;
  currentlyInside: number;
  checkedOutToday: number;
  totalToday: number;
  totalThisWeek: number;
  totalThisMonth: number;
  withVehicles: number;
  withDocuments: number;
  overdueVisitors: number;
  byPurpose: { [key: string]: number };
}

interface RecentVisitor {
  id: string;
  visitor_name: string;
  tenant_id: string;
  property_id: string;
  check_in_time: string;
  check_out_time: string | null;
  purpose: string;
}

// Static data
const staticVisitorLogs = [
  {
    id: '1',
    visitor_name: 'Amit Patel',
    tenant_id: 't1',
    property_id: 'p1',
    entry_time: '2026-03-11T09:30:00',
    exit_time: null,
    purpose: 'Friend Visit',
    vehicle_number: 'MH01AB1234',
    id_proof_type: 'Aadhar'
  },
  {
    id: '2',
    visitor_name: 'Priya Singh',
    tenant_id: 't2',
    property_id: 'p2',
    entry_time: '2026-03-11T10:15:00',
    exit_time: '2026-03-11T12:30:00',
    purpose: 'Family',
    vehicle_number: '',
    id_proof_type: 'Driving License'
  },
  {
    id: '3',
    visitor_name: 'Rahul Sharma',
    tenant_id: 't3',
    property_id: 'p3',
    entry_time: '2026-03-11T11:00:00',
    exit_time: null,
    purpose: 'Delivery',
    vehicle_number: 'MH02CD5678',
    id_proof_type: ''
  },
  {
    id: '4',
    visitor_name: 'Neha Gupta',
    tenant_id: 't4',
    property_id: 'p4',
    entry_time: '2026-03-11T08:45:00',
    exit_time: '2026-03-11T10:00:00',
    purpose: 'Interview',
    vehicle_number: '',
    id_proof_type: 'Passport'
  },
  {
    id: '5',
    visitor_name: 'Vikram Mehta',
    tenant_id: 't5',
    property_id: 'p5',
    entry_time: '2026-03-11T09:00:00',
    exit_time: '2026-03-11T11:15:00',
    purpose: 'Business Meeting',
    vehicle_number: 'MH03EF9012',
    id_proof_type: 'PAN Card'
  },
  {
    id: '6',
    visitor_name: 'Anjali Desai',
    tenant_id: 't1',
    property_id: 'p1',
    entry_time: '2026-03-10T14:30:00',
    exit_time: '2026-03-10T16:45:00',
    purpose: 'Friend Visit',
    vehicle_number: '',
    id_proof_type: 'Aadhar'
  },
  {
    id: '7',
    visitor_name: 'Suresh Reddy',
    tenant_id: 't2',
    property_id: 'p2',
    entry_time: '2026-03-10T15:20:00',
    exit_time: '2026-03-10T17:30:00',
    purpose: 'Maintenance',
    vehicle_number: 'MH04GH3456',
    id_proof_type: 'Driving License'
  },
  {
    id: '8',
    visitor_name: 'Kavita Singh',
    tenant_id: 't3',
    property_id: 'p3',
    entry_time: '2026-03-09T11:30:00',
    exit_time: '2026-03-09T13:45:00',
    purpose: 'Family',
    vehicle_number: '',
    id_proof_type: 'Aadhar'
  },
  {
    id: '9',
    visitor_name: 'Rajesh Kumar',
    tenant_id: 't4',
    property_id: 'p4',
    entry_time: '2026-03-09T10:00:00',
    exit_time: '2026-03-09T12:15:00',
    purpose: 'Interview',
    vehicle_number: 'MH05IJ7890',
    id_proof_type: 'Voter ID'
  },
  {
    id: '10',
    visitor_name: 'Deepa Nair',
    tenant_id: 't5',
    property_id: 'p5',
    entry_time: '2026-03-08T16:00:00',
    exit_time: '2026-03-08T18:30:00',
    purpose: 'Friend Visit',
    vehicle_number: '',
    id_proof_type: 'Driving License'
  },
  {
    id: '11',
    visitor_name: 'Arjun Mehta',
    tenant_id: 't1',
    property_id: 'p1',
    entry_time: '2026-03-08T09:15:00',
    exit_time: '2026-03-08T11:30:00',
    purpose: 'Business Meeting',
    vehicle_number: 'MH06KL1234',
    id_proof_type: 'PAN Card'
  },
  {
    id: '12',
    visitor_name: 'Pooja Sharma',
    tenant_id: 't2',
    property_id: 'p2',
    entry_time: '2026-03-07T13:00:00',
    exit_time: '2026-03-07T15:15:00',
    purpose: 'Family',
    vehicle_number: '',
    id_proof_type: 'Aadhar'
  },
  {
    id: '13',
    visitor_name: 'Sanjay Gupta',
    tenant_id: 't3',
    property_id: 'p3',
    entry_time: '2026-03-07T10:30:00',
    exit_time: '2026-03-07T12:45:00',
    purpose: 'Maintenance',
    vehicle_number: 'MH07MN5678',
    id_proof_type: 'Driving License'
  }
];

export function VisitorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVisitors: 0,
    currentlyInside: 0,
    checkedOutToday: 0,
    totalToday: 0,
    totalThisWeek: 0,
    totalThisMonth: 0,
    withVehicles: 0,
    withDocuments: 0,
    overdueVisitors: 0,
    byPurpose: {}
  });
  const [recentVisitors, setRecentVisitors] = useState<RecentVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const allLogs = staticVisitorLogs;
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const purposeCounts: { [key: string]: number } = {};
      allLogs.forEach((log: any) => {
        if (log.purpose) {
          purposeCounts[log.purpose] = (purposeCounts[log.purpose] || 0) + 1;
        }
      });

      // Map exit_time to check_out_time for compatibility
      const mappedLogs = allLogs.map((log: any) => ({
        id: log.id,
        visitor_name: log.visitor_name,
        tenant_id: log.tenant_id,
        property_id: log.property_id,
        check_in_time: log.entry_time,
        check_out_time: log.exit_time,
        purpose: log.purpose,
        vehicle_number: log.vehicle_number,
        id_proof_type: log.id_proof_type
      }));

      setStats({
        totalVisitors: allLogs.length,
        currentlyInside: allLogs.filter((l: any) => !l.exit_time).length,
        checkedOutToday: allLogs.filter((l: any) =>
          l.exit_time &&
          new Date(l.entry_time) >= today
        ).length,
        totalToday: allLogs.filter((l: any) => new Date(l.entry_time) >= today).length,
        totalThisWeek: allLogs.filter((l: any) => new Date(l.entry_time) >= weekAgo).length,
        totalThisMonth: allLogs.filter((l: any) => new Date(l.entry_time) >= monthAgo).length,
        withVehicles: allLogs.filter((l: any) => l.vehicle_number).length,
        withDocuments: allLogs.filter((l: any) => l.id_proof_type).length,
        overdueVisitors: 2, // Example value
        byPurpose: purposeCounts
      });

      // Get 5 most recent visitors
      const sorted = [...mappedLogs].sort((a, b) =>
        new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime()
      );
      setRecentVisitors(sorted.slice(0, 5));
    } catch (err: any) {
      console.error('Error loading visitor dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const topPurposes = Object.entries(stats.byPurpose)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

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
          Visitor Dashboard
        </h1>
        <p className="text-gray-600 font-semibold mt-1">Real-time visitor management and analytics</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/visitor/logs" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-gray-600">Total Visitors</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{stats.totalVisitors}</div>
          <div className="text-xs font-semibold text-gray-500 mt-2">{stats.totalToday} today</div>
        </Link>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
              <LogIn className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm font-bold text-gray-600">Currently Inside</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">{stats.currentlyInside}</div>
          <div className="text-xs font-semibold text-gray-500 mt-2">Active visitors</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm font-bold text-gray-600">This Week</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{stats.totalThisWeek}</div>
          <div className="text-xs font-semibold text-gray-500 mt-2">{stats.totalThisMonth} this month</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <LogOut className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm font-bold text-gray-600">Checked Out Today</div>
          <div className="text-3xl font-black text-blue-600 mt-1">{stats.checkedOutToday}</div>
          <div className="text-xs font-semibold text-gray-500 mt-2">Completed visits</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-600">Visitors with Vehicles</div>
              <div className="text-2xl font-black text-gray-900">{stats.withVehicles}</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-600">Document Verification</div>
              <div className="text-2xl font-black text-gray-900">{stats.withDocuments}</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.overdueVisitors > 0 ? 'bg-red-100' : 'bg-gray-100'
              }`}>
              <Clock className={`w-5 h-5 ${stats.overdueVisitors > 0 ? 'text-red-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-600">Overdue Visitors</div>
              <div className={`text-2xl font-black ${stats.overdueVisitors > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {stats.overdueVisitors}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top Visit Purposes
          </h2>
          <div className="space-y-3">
            {topPurposes.length > 0 ? (
              topPurposes.map(([purpose, count]) => {
                const percentage = ((count / stats.totalVisitors) * 100).toFixed(0);
                return (
                  <div key={purpose}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-700">{purpose}</span>
                      <span className="text-sm font-black text-gray-900">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 font-semibold">No data available</div>
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4">Recent Visitors</h2>
          <div className="space-y-3">
            {recentVisitors.length > 0 ? (
              recentVisitors.map((visitor) => {
                const status = visitor.check_out_time ? 'Checked-Out' : 'Inside';

                return (
                  <div key={visitor.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:shadow-md transition-all border-l-4 border-blue-500">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm font-bold text-gray-900">{visitor.visitor_name}</div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-black uppercase ${status === 'Inside' ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-gray-200 text-gray-700'
                            }`}>
                            {status}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-gray-600">
                          Purpose: {visitor.purpose}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-200">
                      <div>
                        <div className="text-xs text-gray-500 font-bold mb-0.5 flex items-center gap-1">
                          <LogIn className="w-3 h-3" />
                          Entry
                        </div>
                        <div className="text-xs font-bold text-gray-900">
                          {new Date(visitor.check_in_time).toLocaleTimeString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-bold mb-0.5 flex items-center gap-1">
                          <LogOut className="w-3 h-3" />
                          Exit
                        </div>
                        <div className="text-xs font-bold text-blue-600">
                          {visitor.check_out_time
                            ? new Date(visitor.check_out_time).toLocaleTimeString()
                            : 'Inside'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 font-semibold">No recent visitors</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/visitor/new-entry" className="glass rounded-xl p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm font-bold text-gray-700">New Entry</div>
          </div>
          <div className="text-xs font-semibold text-gray-600">Register a new visitor</div>
        </Link>

        <Link to="/visitor/logs" className="glass rounded-xl p-5 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-gray-700">View Logs</div>
          </div>
          <div className="text-xs font-semibold text-gray-600">All visitor records</div>
        </Link>

        <Link to="/visitor/restrictions" className="glass rounded-xl p-5 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-sm font-bold text-gray-700">Restrictions</div>
          </div>
          <div className="text-xs font-semibold text-gray-600">Manage blocked visitors</div>
        </Link>
      </div>
    </div>
  );
}