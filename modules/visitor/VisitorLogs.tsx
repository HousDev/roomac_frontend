import { useEffect, useState } from 'react';
import { Users, Search, Download, CheckCircle, XCircle, Clock, AlertCircle, CheckSquare, Square, LogOut, UserPlus, X } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { NewVisitorEntry } from './NewVisitorEntry';

interface VisitorLog {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  tenant_name: string;
  property_name: string;
  room_number: string;
  entry_time: string;
  exit_time?: string;
  tentative_exit_time?: string;
  purpose: string;
  id_proof_type: string;
  id_proof_number: string;
  vehicle_number?: string;
  approval_status: string;
  security_guard_name: string;
  status: string;
  qr_code?: string;
  checked_out_by?: string;
  notes?: string;
  created_at: string;
}

type StatusFilter = 'all' | 'checked_in' | 'checked_out' | 'overstayed';

// Static data
const staticVisitorLogs: VisitorLog[] = [
  {
    id: '1',
    visitor_name: 'Amit Patel',
    visitor_phone: '9876543210',
    tenant_name: 'Rahul Sharma',
    property_name: 'Sunset Villa',
    room_number: '101',
    entry_time: '2026-03-11T09:30:00',
    tentative_exit_time: '2026-03-11T12:30:00',
    purpose: 'Friend Visit',
    id_proof_type: 'Aadhar',
    id_proof_number: '1234-5678-9012',
    vehicle_number: 'MH01AB1234',
    approval_status: 'Approved',
    security_guard_name: 'Sanjay Gupta',
    status: 'checked_in',
    qr_code: 'VIS-001-20260311',
    notes: '',
    created_at: '2026-03-11T09:30:00'
  },
  {
    id: '2',
    visitor_name: 'Priya Singh',
    visitor_phone: '8765432109',
    tenant_name: 'Priya Patel',
    property_name: 'Ocean View Apartment',
    room_number: '205',
    entry_time: '2026-03-11T10:15:00',
    exit_time: '2026-03-11T12:30:00',
    tentative_exit_time: '2026-03-11T13:00:00',
    purpose: 'Family',
    id_proof_type: 'Driving License',
    id_proof_number: 'DL-9876543210',
    vehicle_number: '',
    approval_status: 'Approved',
    security_guard_name: 'Anjali Desai',
    status: 'checked_out',
    qr_code: 'VIS-002-20260311',
    checked_out_by: 'Anjali Desai',
    notes: '',
    created_at: '2026-03-11T10:15:00'
  },
  {
    id: '3',
    visitor_name: 'Rahul Sharma',
    visitor_phone: '7654321098',
    tenant_name: 'Amit Kumar',
    property_name: 'Garden Heights',
    room_number: '302',
    entry_time: '2026-03-11T11:00:00',
    tentative_exit_time: '2026-03-11T14:00:00',
    purpose: 'Delivery',
    id_proof_type: 'Aadhar',
    id_proof_number: '5678-1234-9012',
    vehicle_number: 'MH02CD5678',
    approval_status: 'Approved',
    security_guard_name: 'Vikram Singh',
    status: 'checked_in',
    qr_code: 'VIS-003-20260311',
    notes: 'Food delivery',
    created_at: '2026-03-11T11:00:00'
  },
  {
    id: '4',
    visitor_name: 'Neha Gupta',
    visitor_phone: '6543210987',
    tenant_name: 'Neha Singh',
    property_name: 'Lakeview Residency',
    room_number: '415',
    entry_time: '2026-03-11T08:45:00',
    exit_time: '2026-03-11T10:00:00',
    tentative_exit_time: '2026-03-11T10:30:00',
    purpose: 'Interview',
    id_proof_type: 'Passport',
    id_proof_number: 'P12345678',
    vehicle_number: '',
    approval_status: 'Approved',
    security_guard_name: 'Rajesh Kumar',
    status: 'checked_out',
    qr_code: 'VIS-004-20260311',
    checked_out_by: 'Rajesh Kumar',
    notes: 'Job interview',
    created_at: '2026-03-11T08:45:00'
  },
  {
    id: '5',
    visitor_name: 'Vikram Mehta',
    visitor_phone: '5432109876',
    tenant_name: 'Vikram Mehta',
    property_name: 'Sunset Villa',
    room_number: '203',
    entry_time: '2026-03-11T09:00:00',
    exit_time: '2026-03-11T11:15:00',
    tentative_exit_time: '2026-03-11T12:00:00',
    purpose: 'Business Meeting',
    id_proof_type: 'PAN Card',
    id_proof_number: 'ABCDE1234F',
    vehicle_number: 'MH03EF9012',
    approval_status: 'Approved',
    security_guard_name: 'Sanjay Gupta',
    status: 'checked_out',
    qr_code: 'VIS-005-20260311',
    checked_out_by: 'Sanjay Gupta',
    notes: '',
    created_at: '2026-03-11T09:00:00'
  },
  {
    id: '6',
    visitor_name: 'Anjali Desai',
    visitor_phone: '4321098765',
    tenant_name: 'Rahul Sharma',
    property_name: 'Sunset Villa',
    room_number: '101',
    entry_time: '2026-03-10T14:30:00',
    exit_time: '2026-03-10T16:45:00',
    tentative_exit_time: '2026-03-10T17:00:00',
    purpose: 'Friend Visit',
    id_proof_type: 'Aadhar',
    id_proof_number: '9012-5678-1234',
    vehicle_number: '',
    approval_status: 'Approved',
    security_guard_name: 'Sanjay Gupta',
    status: 'checked_out',
    qr_code: 'VIS-006-20260310',
    checked_out_by: 'Sanjay Gupta',
    notes: '',
    created_at: '2026-03-10T14:30:00'
  },
  {
    id: '7',
    visitor_name: 'Suresh Reddy',
    visitor_phone: '3210987654',
    tenant_name: 'Priya Patel',
    property_name: 'Ocean View Apartment',
    room_number: '205',
    entry_time: '2026-03-10T15:20:00',
    exit_time: '2026-03-10T17:30:00',
    tentative_exit_time: '2026-03-10T18:00:00',
    purpose: 'Maintenance',
    id_proof_type: 'Driving License',
    id_proof_number: 'DL-1234567890',
    vehicle_number: 'MH04GH3456',
    approval_status: 'Approved',
    security_guard_name: 'Anjali Desai',
    status: 'checked_out',
    qr_code: 'VIS-007-20260310',
    checked_out_by: 'Anjali Desai',
    notes: 'AC repair',
    created_at: '2026-03-10T15:20:00'
  },
  {
    id: '8',
    visitor_name: 'Kavita Singh',
    visitor_phone: '2109876543',
    tenant_name: 'Amit Kumar',
    property_name: 'Garden Heights',
    room_number: '302',
    entry_time: '2026-03-10T09:30:00',
    tentative_exit_time: '2026-03-10T12:00:00',
    purpose: 'Family',
    id_proof_type: 'Aadhar',
    id_proof_number: '3456-7890-1234',
    vehicle_number: '',
    approval_status: 'Approved',
    security_guard_name: 'Vikram Singh',
    status: 'overstayed',
    qr_code: 'VIS-008-20260310',
    notes: 'Still inside after expected time',
    created_at: '2026-03-10T09:30:00'
  },
  {
    id: '9',
    visitor_name: 'Rajesh Kumar',
    visitor_phone: '1098765432',
    tenant_name: 'Neha Singh',
    property_name: 'Lakeview Residency',
    room_number: '415',
    entry_time: '2026-03-09T16:00:00',
    exit_time: '2026-03-09T18:30:00',
    tentative_exit_time: '2026-03-09T19:00:00',
    purpose: 'Friend Visit',
    id_proof_type: 'Voter ID',
    id_proof_number: 'VID1234567',
    vehicle_number: 'MH05IJ7890',
    approval_status: 'Approved',
    security_guard_name: 'Rajesh Kumar',
    status: 'checked_out',
    qr_code: 'VIS-009-20260309',
    checked_out_by: 'Rajesh Kumar',
    notes: '',
    created_at: '2026-03-09T16:00:00'
  },
  {
    id: '10',
    visitor_name: 'Deepa Nair',
    visitor_phone: '9876543210',
    tenant_name: 'Vikram Mehta',
    property_name: 'Sunset Villa',
    room_number: '203',
    entry_time: '2026-03-09T11:30:00',
    exit_time: '2026-03-09T13:45:00',
    tentative_exit_time: '2026-03-09T14:00:00',
    purpose: 'Business Meeting',
    id_proof_type: 'Driving License',
    id_proof_number: 'DL-0987654321',
    vehicle_number: '',
    approval_status: 'Approved',
    security_guard_name: 'Sanjay Gupta',
    status: 'checked_out',
    qr_code: 'VIS-010-20260309',
    checked_out_by: 'Sanjay Gupta',
    notes: '',
    created_at: '2026-03-09T11:30:00'
  },
  {
    id: '11',
    visitor_name: 'Arjun Mehta',
    visitor_phone: '8765432109',
    tenant_name: 'Rahul Sharma',
    property_name: 'Sunset Villa',
    room_number: '101',
    entry_time: '2026-03-08T09:15:00',
    exit_time: '2026-03-08T11:30:00',
    tentative_exit_time: '2026-03-08T12:00:00',
    purpose: 'Business Meeting',
    id_proof_type: 'PAN Card',
    id_proof_number: 'FGHIJ5678K',
    vehicle_number: 'MH06KL1234',
    approval_status: 'Approved',
    security_guard_name: 'Sanjay Gupta',
    status: 'checked_out',
    qr_code: 'VIS-011-20260308',
    checked_out_by: 'Sanjay Gupta',
    notes: '',
    created_at: '2026-03-08T09:15:00'
  },
  {
    id: '12',
    visitor_name: 'Pooja Sharma',
    visitor_phone: '7654321098',
    tenant_name: 'Priya Patel',
    property_name: 'Ocean View Apartment',
    room_number: '205',
    entry_time: '2026-03-08T13:00:00',
    exit_time: '2026-03-08T15:15:00',
    tentative_exit_time: '2026-03-08T16:00:00',
    purpose: 'Family',
    id_proof_type: 'Aadhar',
    id_proof_number: '7890-1234-5678',
    vehicle_number: '',
    approval_status: 'Approved',
    security_guard_name: 'Anjali Desai',
    status: 'checked_out',
    qr_code: 'VIS-012-20260308',
    checked_out_by: 'Anjali Desai',
    notes: '',
    created_at: '2026-03-08T13:00:00'
  }
];

export function VisitorLogs() {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [guardName, setGuardName] = useState('Security Guard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(checkOverstayed, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchTerm, logs, statusFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setLogs(staticVisitorLogs);
    } catch (error: any) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkOverstayed = () => {
    setLogs(prevLogs =>
      prevLogs.map(log => {
        if (
          log.status === 'checked_in' &&
          !log.exit_time &&
          log.tentative_exit_time &&
          new Date(log.tentative_exit_time) < new Date()
        ) {
          return { ...log, status: 'overstayed' };
        }
        return log;
      })
    );
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        log =>
          log.visitor_name?.toLowerCase().includes(term) ||
          log.visitor_phone?.includes(term) ||
          log.tenant_name?.toLowerCase().includes(term) ||
          log.property_name?.toLowerCase().includes(term) ||
          log.qr_code?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    setFilteredLogs(filtered);
  };

  const handleCheckOut = async (id: string) => {
    if (!guardName) {
      alert('Please enter guard name');
      return;
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const exitTime = new Date().toISOString();
      setLogs(prevLogs =>
        prevLogs.map(log =>
          log.id === id
            ? {
              ...log,
              exit_time: exitTime,
              status: 'checked_out',
              checked_out_by: guardName
            }
            : log
        )
      );
    } catch (error: any) {
      console.error('Error checking out:', error);
      alert('Failed to check out visitor');
    }
  };

  const handleBulkCheckOut = async () => {
    if (selectedLogs.size === 0) return;
    if (!guardName) {
      alert('Please enter guard name');
      return;
    }
    if (!confirm(`Check out ${selectedLogs.size} visitor(s)?`)) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const exitTime = new Date().toISOString();
      setLogs(prevLogs =>
        prevLogs.map(log =>
          selectedLogs.has(log.id) && log.status === 'checked_in'
            ? {
              ...log,
              exit_time: exitTime,
              status: 'checked_out',
              checked_out_by: guardName
            }
            : log
        )
      );
      setSelectedLogs(new Set());
    } catch (error: any) {
      console.error('Error bulk checking out:', error);
      alert('Failed to check out visitors');
    }
  };

  const handleBlockVisitor = async (log: VisitorLog) => {
    const reason = prompt('Enter reason for blocking this visitor:');
    if (!reason) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      alert(`Visitor ${log.visitor_name} blocked successfully with reason: ${reason}`);
    } catch (error: any) {
      console.error('Error blocking visitor:', error);
      alert('Failed to block visitor. They may already be blocked.');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Visitor Name',
      'Phone',
      'Tenant',
      'Property',
      'Room',
      'Entry Time',
      'Exit Time',
      'Status',
      'QR Code',
      'Purpose',
      'ID Proof'
    ];
    const rows = filteredLogs.map(log => [
      log.visitor_name,
      log.visitor_phone,
      log.tenant_name,
      log.property_name,
      log.room_number,
      new Date(log.entry_time).toLocaleString(),
      log.exit_time ? new Date(log.exit_time).toLocaleString() : 'N/A',
      log.status,
      log.qr_code || '',
      log.purpose,
      `${log.id_proof_type}: ${log.id_proof_number}`
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visitor_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleAddNewEntry = (newVisitor: any) => {
    const newLog: VisitorLog = {
      id: (logs.length + 1).toString(),
      visitor_name: newVisitor.visitor_name,
      visitor_phone: newVisitor.visitor_phone,
      tenant_name: newVisitor.tenant_name,
      property_name: newVisitor.property_name,
      room_number: newVisitor.room_number,
      entry_time: newVisitor.entry_time,
      tentative_exit_time: newVisitor.tentative_exit_time,
      purpose: newVisitor.purpose,
      id_proof_type: newVisitor.id_proof_type,
      id_proof_number: newVisitor.id_proof_number,
      vehicle_number: newVisitor.vehicle_number,
      approval_status: newVisitor.approval_status,
      security_guard_name: newVisitor.security_guard_name,
      status: 'checked_in',
      qr_code: newVisitor.qr_code,
      notes: newVisitor.notes,
      created_at: new Date().toISOString()
    };

    setLogs(prevLogs => [newLog, ...prevLogs]);
    setIsModalOpen(false);
  };

  const toggleSelectAll = () => {
    if (selectedLogs.size === filteredLogs.length) {
      setSelectedLogs(new Set());
    } else {
      setSelectedLogs(new Set(filteredLogs.map(log => log.id)));
    }
  };

  const toggleSelectLog = (id: string) => {
    const newSelected = new Set(selectedLogs);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLogs(newSelected);
  };

  const getStatusBadge = (log: VisitorLog) => {
    const statuses = {
      checked_in: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'CHECKED IN' },
      checked_out: { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'CHECKED OUT' },
      overstayed: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'OVERSTAYED' }
    };

    const status = statuses[log.status as keyof typeof statuses] || statuses.checked_in;
    const Icon = status.icon;

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded font-bold text-xs ${status.color}`}>
        <Icon className="w-3 h-3" />
        {status.label}
      </div>
    );
  };

  const checkedInCount = logs.filter(l => l.status === 'checked_in').length;
  const overstayedCount = logs.filter(l => l.status === 'overstayed').length;
  const checkedOutToday = logs.filter(l => {
    if (!l.exit_time) return false;
    const exitDate = new Date(l.exit_time).toDateString();
    return exitDate === new Date().toDateString();
  }).length;

  const columns = [
    {
      key: 'select',
      label: (
        <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-100 rounded">
          {selectedLogs.size === filteredLogs.length && filteredLogs.length > 0 ? (
            <CheckSquare className="w-4 h-4 text-blue-600" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>
      ),
      render: (log: VisitorLog) => (
        <button onClick={() => toggleSelectLog(log.id)} className="p-1 hover:bg-gray-100 rounded">
          {selectedLogs.has(log.id) ? (
            <CheckSquare className="w-4 h-4 text-blue-600" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>
      )
    },
    {
      key: 'visitor',
      label: 'Visitor',
      render: (log: VisitorLog) => (
        <div>
          <div className="font-bold text-gray-900">{log.visitor_name}</div>
          <div className="text-xs text-gray-500">{log.visitor_phone}</div>
          {log.qr_code && <div className="text-xs text-blue-600 font-mono">{log.qr_code}</div>}
        </div>
      )
    },
    {
      key: 'tenant',
      label: 'Meeting',
      render: (log: VisitorLog) => (
        <div>
          <div className="font-bold text-gray-900">{log.tenant_name}</div>
          <div className="text-xs text-gray-500">
            {log.property_name} - Room {log.room_number}
          </div>
        </div>
      )
    },
    {
      key: 'timing',
      label: 'Timing',
      render: (log: VisitorLog) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-700">In:</span>
            <span>{new Date(log.entry_time).toLocaleString()}</span>
          </div>
          {log.exit_time ? (
            <div className="flex items-center gap-1 text-gray-600">
              <span className="font-bold">Out:</span>
              <span>{new Date(log.exit_time).toLocaleString()}</span>
            </div>
          ) : log.tentative_exit_time ? (
            <div className="flex items-center gap-1 text-orange-600">
              <Clock className="w-3 h-3" />
              <span className="text-xs">Expected: {new Date(log.tentative_exit_time).toLocaleString()}</span>
            </div>
          ) : null}
        </div>
      )
    },
    {
      key: 'purpose',
      label: 'Purpose',
      render: (log: VisitorLog) => (
        <div>
          <div className="text-sm text-gray-900">{log.purpose}</div>
          {log.vehicle_number && (
            <div className="text-xs text-gray-500">Vehicle: {log.vehicle_number}</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (log: VisitorLog) => getStatusBadge(log)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (log: VisitorLog) => (
        <div className="flex gap-1">
          {log.status === 'checked_in' && (
            <button
              onClick={() => handleCheckOut(log.id)}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
              title="Check Out"
            >
              <LogOut className="w-3 h-3" />
              Check Out
            </button>
          )}
          <button
            onClick={() => handleBlockVisitor(log)}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
            title="Block Visitor"
          >
            Block
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Visitor Logs
          </h1>
          <p className="text-gray-600 font-semibold mt-1">Monitor visitor check-ins and check-outs</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
          >
            <UserPlus className="w-5 h-5" />
            New Visitor Entry
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-bold hover:border-blue-600 hover:text-blue-600 transition-all"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">New Visitor Entry</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <NewVisitorEntry onSuccess={handleAddNewEntry} />
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-5">
          <div className="text-sm font-bold text-gray-600">Total Visitors</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{logs.length}</div>
        </div>
        <div className="glass rounded-xl p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="text-sm font-bold text-green-700">Checked In</div>
          <div className="text-3xl font-black text-green-600 mt-1">{checkedInCount}</div>
        </div>
        <div className="glass rounded-xl p-5 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
          <div className="text-sm font-bold text-red-700">Overstayed</div>
          <div className="text-3xl font-black text-red-600 mt-1">{overstayedCount}</div>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="text-sm font-bold text-gray-600">Checked Out Today</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{checkedOutToday}</div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search visitor, phone, tenant, QR code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setStatusFilter('checked_in')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${statusFilter === 'checked_in'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Checked In ({checkedInCount})
            </button>
            <button
              onClick={() => setStatusFilter('overstayed')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${statusFilter === 'overstayed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Overstayed ({overstayedCount})
            </button>
            <button
              onClick={() => setStatusFilter('checked_out')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${statusFilter === 'checked_out'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Checked Out
            </button>
          </div>

          <input
            type="text"
            placeholder="Guard Name"
            value={guardName}
            onChange={e => setGuardName(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-bold focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {selectedLogs.size > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm font-bold text-blue-900">{selectedLogs.size} visitor(s) selected</span>
            <button
              onClick={handleBulkCheckOut}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Bulk Check Out
            </button>
          </div>
        )}

        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No visitor logs found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Visitor entries will appear here'}
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredLogs} />
        )}
      </div>
    </div>
  );
}