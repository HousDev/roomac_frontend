import { useEffect, useState } from 'react';
import { Search, Download, LogIn, LogOut, Clock, CheckCircle, XCircle, Car, FileText } from 'lucide-react';
// import { supabase } from '../../lib/supabase';

interface VisitorLog {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  tenant_name: string;
  room_number: string;
  entry_time: string;
  tentative_exit_time: string | null;
  exit_time: string | null;
  purpose: string;
  approval_status: string;
  approval_otp: string | null;
  entry_status: string;
  vehicle_type: string | null;
  vehicle_number: string | null;
  document_type: string | null;
  notes: string;
  created_at: string;
}

export function VisitorLogs() {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('visitor_logs')
        .select('*')
        .order('entry_time', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (id: string) => {
    if (!confirm('Mark this visitor as checked out?')) return;

    try {
      const { error } = await supabase
        .from('visitor_logs')
        .update({
          exit_time: new Date().toISOString(),
          entry_status: 'Checked-Out'
        })
        .eq('id', id);

      if (error) throw error;
      loadLogs();
    } catch (error) {
      console.error('Error checking out visitor:', error);
      alert('Error checking out visitor');
    }
  };

  const exportToCSV = () => {
    const headers = ['Visitor', 'Phone', 'Tenant', 'Room', 'Purpose', 'Status', 'OTP', 'Entry Date', 'Entry Time', 'Expected Exit', 'Actual Exit', 'Vehicle'];
    const rows = filteredLogs.map(log => [
      log.visitor_name,
      log.visitor_phone,
      log.tenant_name,
      log.room_number,
      log.purpose,
      log.entry_status,
      log.approval_otp || 'N/A',
      new Date(log.entry_time).toLocaleDateString(),
      new Date(log.entry_time).toLocaleTimeString(),
      log.tentative_exit_time ? new Date(log.tentative_exit_time).toLocaleString() : 'Not specified',
      log.exit_time ? new Date(log.exit_time).toLocaleString() : 'Still Inside',
      log.vehicle_number || 'N/A'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitor-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.visitor_phone.includes(searchTerm) ||
      log.tenant_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || log.entry_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: logs.length,
    checkedIn: logs.filter(l => l.entry_status === 'Checked-In').length,
    checkedOut: logs.filter(l => l.entry_status === 'Checked-Out').length,
    withVehicle: logs.filter(l => l.vehicle_number).length
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-600 font-semibold">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Visitor Logs
          </h1>
          <p className="text-gray-600 font-semibold mt-1">Complete visitor entry and exit records</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="text-sm font-bold text-gray-600">Total Visitors</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-sm font-bold text-gray-600">Currently Inside</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">{stats.checkedIn}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-sm font-bold text-gray-600">Checked Out</div>
          <div className="text-3xl font-black text-blue-600 mt-1">{stats.checkedOut}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-sm font-bold text-gray-600">With Vehicle</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{stats.withVehicle}</div>
        </div>
      </div>

      <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search visitors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg font-semibold text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Status</option>
          <option value="Checked-In">Checked In</option>
          <option value="Checked-Out">Checked Out</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className="glass rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  log.entry_status === 'Checked-In' ? 'bg-emerald-100' :
                  log.entry_status === 'Checked-Out' ? 'bg-blue-100' :
                  'bg-amber-100'
                }`}>
                  {log.entry_status === 'Checked-In' ? (
                    <LogIn className="w-6 h-6 text-emerald-600" />
                  ) : log.entry_status === 'Checked-Out' ? (
                    <LogOut className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Clock className="w-6 h-6 text-amber-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{log.visitor_name}</h3>
                  <p className="text-sm font-semibold text-gray-600">{log.visitor_phone}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                log.entry_status === 'Checked-In' ? 'bg-emerald-100 text-emerald-700' :
                log.entry_status === 'Checked-Out' ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {log.entry_status}
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs font-bold text-gray-500">Visiting</div>
                <div className="text-sm font-bold text-gray-900">{log.tenant_name}</div>
                <div className="text-xs font-semibold text-gray-600">Room {log.room_number}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500">Purpose</div>
                <div className="text-sm font-bold text-gray-900">{log.purpose}</div>
              </div>
              {log.approval_otp && (
                <div>
                  <div className="text-xs font-bold text-gray-500">Tenant OTP</div>
                  <div className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
                    {log.approval_otp}
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                  <LogIn className="w-3 h-3" />
                  Entry Time
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {new Date(log.entry_time).toLocaleDateString()}
                </div>
                <div className="text-xs font-semibold text-gray-600">
                  {new Date(log.entry_time).toLocaleTimeString()}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Expected Exit
                </div>
                {log.tentative_exit_time ? (
                  <>
                    <div className="text-sm font-bold text-amber-600">
                      {new Date(log.tentative_exit_time).toLocaleDateString()}
                    </div>
                    <div className="text-xs font-semibold text-amber-600">
                      {new Date(log.tentative_exit_time).toLocaleTimeString()}
                    </div>
                  </>
                ) : (
                  <div className="text-sm font-semibold text-gray-400">Not specified</div>
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                  <LogOut className="w-3 h-3" />
                  Actual Exit
                </div>
                {log.exit_time ? (
                  <>
                    <div className="text-sm font-bold text-blue-600">
                      {new Date(log.exit_time).toLocaleDateString()}
                    </div>
                    <div className="text-xs font-semibold text-blue-600">
                      {new Date(log.exit_time).toLocaleTimeString()}
                    </div>
                  </>
                ) : (
                  <div className="text-sm font-bold text-emerald-600">Still Inside</div>
                )}
              </div>
            </div>

            {(log.vehicle_number || log.document_type) && (
              <div className="flex flex-wrap gap-3 mb-4">
                {log.vehicle_number && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                    <Car className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-bold text-gray-700">
                      {log.vehicle_type}: {log.vehicle_number}
                    </span>
                  </div>
                )}
                {log.document_type && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-bold text-gray-700">{log.document_type}</span>
                  </div>
                )}
              </div>
            )}

            {log.entry_status === 'Checked-In' && (
              <button
                onClick={() => handleCheckOut(log.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Check Out Visitor
              </button>
            )}

            {log.entry_status === 'Checked-Out' && (
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Visitor has left the premises
              </div>
            )}
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="glass rounded-xl p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Visitor Logs Found</h3>
            <p className="text-gray-600 font-semibold">Start by creating a new visitor entry</p>
          </div>
        )}
      </div>
    </div>
  );
}
