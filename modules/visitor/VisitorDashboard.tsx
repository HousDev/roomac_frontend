import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, LogIn, LogOut, Clock, TrendingUp, Car, FileText, UserPlus, BarChart3 } from 'lucide-react';
// import { supabase } from '../../lib/supabase';

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
  tenant_name: string;
  room_number: string;
  entry_time: string;
  tentative_exit_time: string | null;
  exit_time: string | null;
  purpose: string;
  approval_otp: string | null;
  entry_status: string;
}

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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: logs, error } = await supabase
        .from('visitor_logs')
        .select('*')
        .order('entry_time', { ascending: false });

      if (error) throw error;

      const allLogs = logs || [];
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const purposeCounts: { [key: string]: number } = {};
      allLogs.forEach(log => {
        if (log.purpose) {
          purposeCounts[log.purpose] = (purposeCounts[log.purpose] || 0) + 1;
        }
      });

      const currentTime = new Date();
      const overdueCount = allLogs.filter(l =>
        l.entry_status === 'Checked-In' &&
        l.tentative_exit_time &&
        new Date(l.tentative_exit_time) < currentTime
      ).length;

      setStats({
        totalVisitors: allLogs.length,
        currentlyInside: allLogs.filter(l => l.entry_status === 'Checked-In').length,
        checkedOutToday: allLogs.filter(l =>
          l.entry_status === 'Checked-Out' &&
          new Date(l.entry_time) >= today
        ).length,
        totalToday: allLogs.filter(l => new Date(l.entry_time) >= today).length,
        totalThisWeek: allLogs.filter(l => new Date(l.entry_time) >= weekAgo).length,
        totalThisMonth: allLogs.filter(l => new Date(l.entry_time) >= monthAgo).length,
        withVehicles: allLogs.filter(l => l.vehicle_number).length,
        withDocuments: allLogs.filter(l => l.document_type).length,
        overdueVisitors: overdueCount,
        byPurpose: purposeCounts
      });

      setRecentVisitors(allLogs.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const topPurposes = Object.entries(stats.byPurpose)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-600 font-semibold">Loading dashboard...</div></div>;
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
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              stats.overdueVisitors > 0 ? 'bg-red-100' : 'bg-gray-100'
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
              recentVisitors.map((visitor) => (
                <div key={visitor.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-blue-500">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-gray-900">{visitor.visitor_name}</div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          visitor.entry_status === 'Checked-In' ? 'bg-emerald-100 text-emerald-700' :
                          visitor.entry_status === 'Checked-Out' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {visitor.entry_status}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-gray-600">
                        {visitor.tenant_name} • Room {visitor.room_number} • {visitor.purpose}
                      </div>
                    </div>
                    {visitor.approval_otp && (
                      <div className="text-xs">
                        <div className="text-gray-500 font-bold">OTP</div>
                        <div className="text-emerald-600 font-black bg-emerald-50 px-2 py-1 rounded">
                          {visitor.approval_otp}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500 font-bold mb-0.5 flex items-center gap-1">
                        <LogIn className="w-3 h-3" />
                        Entry
                      </div>
                      <div className="text-xs font-bold text-gray-900">
                        {new Date(visitor.entry_time).toLocaleTimeString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-bold mb-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expected
                      </div>
                      <div className="text-xs font-bold text-amber-600">
                        {visitor.tentative_exit_time
                          ? new Date(visitor.tentative_exit_time).toLocaleTimeString()
                          : 'Not set'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-bold mb-0.5 flex items-center gap-1">
                        <LogOut className="w-3 h-3" />
                        Exit
                      </div>
                      <div className="text-xs font-bold text-blue-600">
                        {visitor.exit_time
                          ? new Date(visitor.exit_time).toLocaleTimeString()
                          : 'Inside'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
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
