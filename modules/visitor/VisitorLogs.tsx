// import { useEffect, useState } from 'react';
// import { Users, Search, Download, CheckCircle, XCircle, Clock, AlertCircle, CheckSquare, Square, LogOut, UserPlus, X } from 'lucide-react';
// import { DataTable } from '../../components/common/DataTable';
// import { NewVisitorEntry } from './NewVisitorEntry';

// interface VisitorLog {
//   id: string;
//   visitor_name: string;
//   visitor_phone: string;
//   tenant_name: string;
//   property_name: string;
//   room_number: string;
//   entry_time: string;
//   exit_time?: string;
//   tentative_exit_time?: string;
//   purpose: string;
//   id_proof_type: string;
//   id_proof_number: string;
//   vehicle_number?: string;
//   approval_status: string;
//   security_guard_name: string;
//   status: string;
//   qr_code?: string;
//   checked_out_by?: string;
//   notes?: string;
//   created_at: string;
// }

// type StatusFilter = 'all' | 'checked_in' | 'checked_out' | 'overstayed';

// // Static data
// const staticVisitorLogs: VisitorLog[] = [
//   {
//     id: '1',
//     visitor_name: 'Amit Patel',
//     visitor_phone: '9876543210',
//     tenant_name: 'Rahul Sharma',
//     property_name: 'Sunset Villa',
//     room_number: '101',
//     entry_time: '2026-03-11T09:30:00',
//     tentative_exit_time: '2026-03-11T12:30:00',
//     purpose: 'Friend Visit',
//     id_proof_type: 'Aadhar',
//     id_proof_number: '1234-5678-9012',
//     vehicle_number: 'MH01AB1234',
//     approval_status: 'Approved',
//     security_guard_name: 'Sanjay Gupta',
//     status: 'checked_in',
//     qr_code: 'VIS-001-20260311',
//     notes: '',
//     created_at: '2026-03-11T09:30:00'
//   },
//   {
//     id: '2',
//     visitor_name: 'Priya Singh',
//     visitor_phone: '8765432109',
//     tenant_name: 'Priya Patel',
//     property_name: 'Ocean View Apartment',
//     room_number: '205',
//     entry_time: '2026-03-11T10:15:00',
//     exit_time: '2026-03-11T12:30:00',
//     tentative_exit_time: '2026-03-11T13:00:00',
//     purpose: 'Family',
//     id_proof_type: 'Driving License',
//     id_proof_number: 'DL-9876543210',
//     vehicle_number: '',
//     approval_status: 'Approved',
//     security_guard_name: 'Anjali Desai',
//     status: 'checked_out',
//     qr_code: 'VIS-002-20260311',
//     checked_out_by: 'Anjali Desai',
//     notes: '',
//     created_at: '2026-03-11T10:15:00'
//   },
//   {
//     id: '3',
//     visitor_name: 'Rahul Sharma',
//     visitor_phone: '7654321098',
//     tenant_name: 'Amit Kumar',
//     property_name: 'Garden Heights',
//     room_number: '302',
//     entry_time: '2026-03-11T11:00:00',
//     tentative_exit_time: '2026-03-11T14:00:00',
//     purpose: 'Delivery',
//     id_proof_type: 'Aadhar',
//     id_proof_number: '5678-1234-9012',
//     vehicle_number: 'MH02CD5678',
//     approval_status: 'Approved',
//     security_guard_name: 'Vikram Singh',
//     status: 'checked_in',
//     qr_code: 'VIS-003-20260311',
//     notes: 'Food delivery',
//     created_at: '2026-03-11T11:00:00'
//   },
//   {
//     id: '4',
//     visitor_name: 'Neha Gupta',
//     visitor_phone: '6543210987',
//     tenant_name: 'Neha Singh',
//     property_name: 'Lakeview Residency',
//     room_number: '415',
//     entry_time: '2026-03-11T08:45:00',
//     exit_time: '2026-03-11T10:00:00',
//     tentative_exit_time: '2026-03-11T10:30:00',
//     purpose: 'Interview',
//     id_proof_type: 'Passport',
//     id_proof_number: 'P12345678',
//     vehicle_number: '',
//     approval_status: 'Approved',
//     security_guard_name: 'Rajesh Kumar',
//     status: 'checked_out',
//     qr_code: 'VIS-004-20260311',
//     checked_out_by: 'Rajesh Kumar',
//     notes: 'Job interview',
//     created_at: '2026-03-11T08:45:00'
//   },
//   {
//     id: '5',
//     visitor_name: 'Vikram Mehta',
//     visitor_phone: '5432109876',
//     tenant_name: 'Vikram Mehta',
//     property_name: 'Sunset Villa',
//     room_number: '203',
//     entry_time: '2026-03-11T09:00:00',
//     exit_time: '2026-03-11T11:15:00',
//     tentative_exit_time: '2026-03-11T12:00:00',
//     purpose: 'Business Meeting',
//     id_proof_type: 'PAN Card',
//     id_proof_number: 'ABCDE1234F',
//     vehicle_number: 'MH03EF9012',
//     approval_status: 'Approved',
//     security_guard_name: 'Sanjay Gupta',
//     status: 'checked_out',
//     qr_code: 'VIS-005-20260311',
//     checked_out_by: 'Sanjay Gupta',
//     notes: '',
//     created_at: '2026-03-11T09:00:00'
//   },
//   {
//     id: '6',
//     visitor_name: 'Anjali Desai',
//     visitor_phone: '4321098765',
//     tenant_name: 'Rahul Sharma',
//     property_name: 'Sunset Villa',
//     room_number: '101',
//     entry_time: '2026-03-10T14:30:00',
//     exit_time: '2026-03-10T16:45:00',
//     tentative_exit_time: '2026-03-10T17:00:00',
//     purpose: 'Friend Visit',
//     id_proof_type: 'Aadhar',
//     id_proof_number: '9012-5678-1234',
//     vehicle_number: '',
//     approval_status: 'Approved',
//     security_guard_name: 'Sanjay Gupta',
//     status: 'checked_out',
//     qr_code: 'VIS-006-20260310',
//     checked_out_by: 'Sanjay Gupta',
//     notes: '',
//     created_at: '2026-03-10T14:30:00'
//   },
//   {
//     id: '7',
//     visitor_name: 'Suresh Reddy',
//     visitor_phone: '3210987654',
//     tenant_name: 'Priya Patel',
//     property_name: 'Ocean View Apartment',
//     room_number: '205',
//     entry_time: '2026-03-10T15:20:00',
//     exit_time: '2026-03-10T17:30:00',
//     tentative_exit_time: '2026-03-10T18:00:00',
//     purpose: 'Maintenance',
//     id_proof_type: 'Driving License',
//     id_proof_number: 'DL-1234567890',
//     vehicle_number: 'MH04GH3456',
//     approval_status: 'Approved',
//     security_guard_name: 'Anjali Desai',
//     status: 'checked_out',
//     qr_code: 'VIS-007-20260310',
//     checked_out_by: 'Anjali Desai',
//     notes: 'AC repair',
//     created_at: '2026-03-10T15:20:00'
//   },
//   {
//     id: '8',
//     visitor_name: 'Kavita Singh',
//     visitor_phone: '2109876543',
//     tenant_name: 'Amit Kumar',
//     property_name: 'Garden Heights',
//     room_number: '302',
//     entry_time: '2026-03-10T09:30:00',
//     tentative_exit_time: '2026-03-10T12:00:00',
//     purpose: 'Family',
//     id_proof_type: 'Aadhar',
//     id_proof_number: '3456-7890-1234',
//     vehicle_number: '',
//     approval_status: 'Approved',
//     security_guard_name: 'Vikram Singh',
//     status: 'overstayed',
//     qr_code: 'VIS-008-20260310',
//     notes: 'Still inside after expected time',
//     created_at: '2026-03-10T09:30:00'
//   },
//   {
//     id: '9',
//     visitor_name: 'Rajesh Kumar',
//     visitor_phone: '1098765432',
//     tenant_name: 'Neha Singh',
//     property_name: 'Lakeview Residency',
//     room_number: '415',
//     entry_time: '2026-03-09T16:00:00',
//     exit_time: '2026-03-09T18:30:00',
//     tentative_exit_time: '2026-03-09T19:00:00',
//     purpose: 'Friend Visit',
//     id_proof_type: 'Voter ID',
//     id_proof_number: 'VID1234567',
//     vehicle_number: 'MH05IJ7890',
//     approval_status: 'Approved',
//     security_guard_name: 'Rajesh Kumar',
//     status: 'checked_out',
//     qr_code: 'VIS-009-20260309',
//     checked_out_by: 'Rajesh Kumar',
//     notes: '',
//     created_at: '2026-03-09T16:00:00'
//   },
//   {
//     id: '10',
//     visitor_name: 'Deepa Nair',
//     visitor_phone: '9876543210',
//     tenant_name: 'Vikram Mehta',
//     property_name: 'Sunset Villa',
//     room_number: '203',
//     entry_time: '2026-03-09T11:30:00',
//     exit_time: '2026-03-09T13:45:00',
//     tentative_exit_time: '2026-03-09T14:00:00',
//     purpose: 'Business Meeting',
//     id_proof_type: 'Driving License',
//     id_proof_number: 'DL-0987654321',
//     vehicle_number: '',
//     approval_status: 'Approved',
//     security_guard_name: 'Sanjay Gupta',
//     status: 'checked_out',
//     qr_code: 'VIS-010-20260309',
//     checked_out_by: 'Sanjay Gupta',
//     notes: '',
//     created_at: '2026-03-09T11:30:00'
//   },
//   {
//     id: '11',
//     visitor_name: 'Arjun Mehta',
//     visitor_phone: '8765432109',
//     tenant_name: 'Rahul Sharma',
//     property_name: 'Sunset Villa',
//     room_number: '101',
//     entry_time: '2026-03-08T09:15:00',
//     exit_time: '2026-03-08T11:30:00',
//     tentative_exit_time: '2026-03-08T12:00:00',
//     purpose: 'Business Meeting',
//     id_proof_type: 'PAN Card',
//     id_proof_number: 'FGHIJ5678K',
//     vehicle_number: 'MH06KL1234',
//     approval_status: 'Approved',
//     security_guard_name: 'Sanjay Gupta',
//     status: 'checked_out',
//     qr_code: 'VIS-011-20260308',
//     checked_out_by: 'Sanjay Gupta',
//     notes: '',
//     created_at: '2026-03-08T09:15:00'
//   },
//   {
//     id: '12',
//     visitor_name: 'Pooja Sharma',
//     visitor_phone: '7654321098',
//     tenant_name: 'Priya Patel',
//     property_name: 'Ocean View Apartment',
//     room_number: '205',
//     entry_time: '2026-03-08T13:00:00',
//     exit_time: '2026-03-08T15:15:00',
//     tentative_exit_time: '2026-03-08T16:00:00',
//     purpose: 'Family',
//     id_proof_type: 'Aadhar',
//     id_proof_number: '7890-1234-5678',
//     vehicle_number: '',
//     approval_status: 'Approved',
//     security_guard_name: 'Anjali Desai',
//     status: 'checked_out',
//     qr_code: 'VIS-012-20260308',
//     checked_out_by: 'Anjali Desai',
//     notes: '',
//     created_at: '2026-03-08T13:00:00'
//   }
// ];

// export function VisitorLogs() {
//   const [logs, setLogs] = useState<VisitorLog[]>([]);
//   const [filteredLogs, setFilteredLogs] = useState<VisitorLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
//   const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
//   const [guardName, setGuardName] = useState('Security Guard');
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     loadLogs();
//     const interval = setInterval(checkOverstayed, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     filterLogs();
//   }, [searchTerm, logs, statusFilter]);

//   const loadLogs = async () => {
//     try {
//       setLoading(true);
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 800));
//       setLogs(staticVisitorLogs);
//     } catch (error: any) {
//       console.error('Error loading logs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkOverstayed = () => {
//     setLogs(prevLogs =>
//       prevLogs.map(log => {
//         if (
//           log.status === 'checked_in' &&
//           !log.exit_time &&
//           log.tentative_exit_time &&
//           new Date(log.tentative_exit_time) < new Date()
//         ) {
//           return { ...log, status: 'overstayed' };
//         }
//         return log;
//       })
//     );
//   };

//   const filterLogs = () => {
//     let filtered = [...logs];

//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(
//         log =>
//           log.visitor_name?.toLowerCase().includes(term) ||
//           log.visitor_phone?.includes(term) ||
//           log.tenant_name?.toLowerCase().includes(term) ||
//           log.property_name?.toLowerCase().includes(term) ||
//           log.qr_code?.toLowerCase().includes(term)
//       );
//     }

//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(log => log.status === statusFilter);
//     }

//     setFilteredLogs(filtered);
//   };

//   const handleCheckOut = async (id: string) => {
//     if (!guardName) {
//       alert('Please enter guard name');
//       return;
//     }

//     try {
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 300));

//       const exitTime = new Date().toISOString();
//       setLogs(prevLogs =>
//         prevLogs.map(log =>
//           log.id === id
//             ? {
//               ...log,
//               exit_time: exitTime,
//               status: 'checked_out',
//               checked_out_by: guardName
//             }
//             : log
//         )
//       );
//     } catch (error: any) {
//       console.error('Error checking out:', error);
//       alert('Failed to check out visitor');
//     }
//   };

//   const handleBulkCheckOut = async () => {
//     if (selectedLogs.size === 0) return;
//     if (!guardName) {
//       alert('Please enter guard name');
//       return;
//     }
//     if (!confirm(`Check out ${selectedLogs.size} visitor(s)?`)) return;

//     try {
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 500));

//       const exitTime = new Date().toISOString();
//       setLogs(prevLogs =>
//         prevLogs.map(log =>
//           selectedLogs.has(log.id) && log.status === 'checked_in'
//             ? {
//               ...log,
//               exit_time: exitTime,
//               status: 'checked_out',
//               checked_out_by: guardName
//             }
//             : log
//         )
//       );
//       setSelectedLogs(new Set());
//     } catch (error: any) {
//       console.error('Error bulk checking out:', error);
//       alert('Failed to check out visitors');
//     }
//   };

//   const handleBlockVisitor = async (log: VisitorLog) => {
//     const reason = prompt('Enter reason for blocking this visitor:');
//     if (!reason) return;

//     try {
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 300));

//       alert(`Visitor ${log.visitor_name} blocked successfully with reason: ${reason}`);
//     } catch (error: any) {
//       console.error('Error blocking visitor:', error);
//       alert('Failed to block visitor. They may already be blocked.');
//     }
//   };

//   const handleExportCSV = () => {
//     const headers = [
//       'Visitor Name',
//       'Phone',
//       'Tenant',
//       'Property',
//       'Room',
//       'Entry Time',
//       'Exit Time',
//       'Status',
//       'QR Code',
//       'Purpose',
//       'ID Proof'
//     ];
//     const rows = filteredLogs.map(log => [
//       log.visitor_name,
//       log.visitor_phone,
//       log.tenant_name,
//       log.property_name,
//       log.room_number,
//       new Date(log.entry_time).toLocaleString(),
//       log.exit_time ? new Date(log.exit_time).toLocaleString() : 'N/A',
//       log.status,
//       log.qr_code || '',
//       log.purpose,
//       `${log.id_proof_type}: ${log.id_proof_number}`
//     ]);

//     const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `visitor_logs_${new Date().toISOString().split('T')[0]}.csv`;
//     link.click();
//   };

//   const handleAddNewEntry = (newVisitor: any) => {
//     const newLog: VisitorLog = {
//       id: (logs.length + 1).toString(),
//       visitor_name: newVisitor.visitor_name,
//       visitor_phone: newVisitor.visitor_phone,
//       tenant_name: newVisitor.tenant_name,
//       property_name: newVisitor.property_name,
//       room_number: newVisitor.room_number,
//       entry_time: newVisitor.entry_time,
//       tentative_exit_time: newVisitor.tentative_exit_time,
//       purpose: newVisitor.purpose,
//       id_proof_type: newVisitor.id_proof_type,
//       id_proof_number: newVisitor.id_proof_number,
//       vehicle_number: newVisitor.vehicle_number,
//       approval_status: newVisitor.approval_status,
//       security_guard_name: newVisitor.security_guard_name,
//       status: 'checked_in',
//       qr_code: newVisitor.qr_code,
//       notes: newVisitor.notes,
//       created_at: new Date().toISOString()
//     };

//     setLogs(prevLogs => [newLog, ...prevLogs]);
//     setIsModalOpen(false);
//   };

//   const toggleSelectAll = () => {
//     if (selectedLogs.size === filteredLogs.length) {
//       setSelectedLogs(new Set());
//     } else {
//       setSelectedLogs(new Set(filteredLogs.map(log => log.id)));
//     }
//   };

//   const toggleSelectLog = (id: string) => {
//     const newSelected = new Set(selectedLogs);
//     if (newSelected.has(id)) {
//       newSelected.delete(id);
//     } else {
//       newSelected.add(id);
//     }
//     setSelectedLogs(newSelected);
//   };

//   const getStatusBadge = (log: VisitorLog) => {
//     const statuses = {
//       checked_in: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'CHECKED IN' },
//       checked_out: { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'CHECKED OUT' },
//       overstayed: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'OVERSTAYED' }
//     };

//     const status = statuses[log.status as keyof typeof statuses] || statuses.checked_in;
//     const Icon = status.icon;

//     return (
//       <div className={`inline-flex items-center gap-1 px-2 py-1 rounded font-bold text-xs ${status.color}`}>
//         <Icon className="w-3 h-3" />
//         {status.label}
//       </div>
//     );
//   };

//   const checkedInCount = logs.filter(l => l.status === 'checked_in').length;
//   const overstayedCount = logs.filter(l => l.status === 'overstayed').length;
//   const checkedOutToday = logs.filter(l => {
//     if (!l.exit_time) return false;
//     const exitDate = new Date(l.exit_time).toDateString();
//     return exitDate === new Date().toDateString();
//   }).length;

//   const columns = [
//     {
//       key: 'select',
//       label: (
//         <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-100 rounded">
//           {selectedLogs.size === filteredLogs.length && filteredLogs.length > 0 ? (
//             <CheckSquare className="w-4 h-4 text-blue-600" />
//           ) : (
//             <Square className="w-4 h-4 text-gray-400" />
//           )}
//         </button>
//       ),
//       render: (log: VisitorLog) => (
//         <button onClick={() => toggleSelectLog(log.id)} className="p-1 hover:bg-gray-100 rounded">
//           {selectedLogs.has(log.id) ? (
//             <CheckSquare className="w-4 h-4 text-blue-600" />
//           ) : (
//             <Square className="w-4 h-4 text-gray-400" />
//           )}
//         </button>
//       )
//     },
//     {
//       key: 'visitor',
//       label: 'Visitor',
//       render: (log: VisitorLog) => (
//         <div>
//           <div className="font-bold text-gray-900">{log.visitor_name}</div>
//           <div className="text-xs text-gray-500">{log.visitor_phone}</div>
//           {log.qr_code && <div className="text-xs text-blue-600 font-mono">{log.qr_code}</div>}
//         </div>
//       )
//     },
//     {
//       key: 'tenant',
//       label: 'Meeting',
//       render: (log: VisitorLog) => (
//         <div>
//           <div className="font-bold text-gray-900">{log.tenant_name}</div>
//           <div className="text-xs text-gray-500">
//             {log.property_name} - Room {log.room_number}
//           </div>
//         </div>
//       )
//     },
//     {
//       key: 'timing',
//       label: 'Timing',
//       render: (log: VisitorLog) => (
//         <div className="text-sm">
//           <div className="flex items-center gap-1">
//             <span className="font-bold text-gray-700">In:</span>
//             <span>{new Date(log.entry_time).toLocaleString()}</span>
//           </div>
//           {log.exit_time ? (
//             <div className="flex items-center gap-1 text-gray-600">
//               <span className="font-bold">Out:</span>
//               <span>{new Date(log.exit_time).toLocaleString()}</span>
//             </div>
//           ) : log.tentative_exit_time ? (
//             <div className="flex items-center gap-1 text-orange-600">
//               <Clock className="w-3 h-3" />
//               <span className="text-xs">Expected: {new Date(log.tentative_exit_time).toLocaleString()}</span>
//             </div>
//           ) : null}
//         </div>
//       )
//     },
//     {
//       key: 'purpose',
//       label: 'Purpose',
//       render: (log: VisitorLog) => (
//         <div>
//           <div className="text-sm text-gray-900">{log.purpose}</div>
//           {log.vehicle_number && (
//             <div className="text-xs text-gray-500">Vehicle: {log.vehicle_number}</div>
//           )}
//         </div>
//       )
//     },
//     {
//       key: 'status',
//       label: 'Status',
//       render: (log: VisitorLog) => getStatusBadge(log)
//     },
//     {
//       key: 'actions',
//       label: 'Actions',
//       render: (log: VisitorLog) => (
//         <div className="flex gap-1">
//           {log.status === 'checked_in' && (
//             <button
//               onClick={() => handleCheckOut(log.id)}
//               className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
//               title="Check Out"
//             >
//               <LogOut className="w-3 h-3" />
//               Check Out
//             </button>
//           )}
//           <button
//             onClick={() => handleBlockVisitor(log)}
//             className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
//             title="Block Visitor"
//           >
//             Block
//           </button>
//         </div>
//       )
//     }
//   ];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
//             Visitor Logs
//           </h1>
//           <p className="text-gray-600 font-semibold mt-1">Monitor visitor check-ins and check-outs</p>
//         </div>
//         <div className="flex gap-3">
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
//           >
//             <UserPlus className="w-5 h-5" />
//             New Visitor Entry
//           </button>
//           <button
//             onClick={handleExportCSV}
//             className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-bold hover:border-blue-600 hover:text-blue-600 transition-all"
//           >
//             <Download className="w-5 h-5" />
//             Export
//           </button>
//         </div>
//       </div>

//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//               <h2 className="text-2xl font-bold text-gray-900">New Visitor Entry</h2>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <X className="w-6 h-6 text-gray-500" />
//               </button>
//             </div>
//             <div className="p-6">
//               <NewVisitorEntry onSuccess={handleAddNewEntry} />
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="grid md:grid-cols-4 gap-4">
//         <div className="glass rounded-xl p-5">
//           <div className="text-sm font-bold text-gray-600">Total Visitors</div>
//           <div className="text-3xl font-black text-gray-900 mt-1">{logs.length}</div>
//         </div>
//         <div className="glass rounded-xl p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
//           <div className="text-sm font-bold text-green-700">Checked In</div>
//           <div className="text-3xl font-black text-green-600 mt-1">{checkedInCount}</div>
//         </div>
//         <div className="glass rounded-xl p-5 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
//           <div className="text-sm font-bold text-red-700">Overstayed</div>
//           <div className="text-3xl font-black text-red-600 mt-1">{overstayedCount}</div>
//         </div>
//         <div className="glass rounded-xl p-5">
//           <div className="text-sm font-bold text-gray-600">Checked Out Today</div>
//           <div className="text-3xl font-black text-gray-900 mt-1">{checkedOutToday}</div>
//         </div>
//       </div>

//       <div className="glass rounded-xl p-6">
//         <div className="flex flex-wrap items-center gap-4 mb-4">
//           <div className="flex-1 min-w-[200px] relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type="text"
//               placeholder="Search visitor, phone, tenant, QR code..."
//               value={searchTerm}
//               onChange={e => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
//             />
//           </div>

//           <div className="flex gap-2">
//             <button
//               onClick={() => setStatusFilter('all')}
//               className={`px-4 py-2 rounded-lg font-bold transition-all ${statusFilter === 'all'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//             >
//               All ({logs.length})
//             </button>
//             <button
//               onClick={() => setStatusFilter('checked_in')}
//               className={`px-4 py-2 rounded-lg font-bold transition-all ${statusFilter === 'checked_in'
//                 ? 'bg-green-600 text-white'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//             >
//               Checked In ({checkedInCount})
//             </button>
//             <button
//               onClick={() => setStatusFilter('overstayed')}
//               className={`px-4 py-2 rounded-lg font-bold transition-all ${statusFilter === 'overstayed'
//                 ? 'bg-red-600 text-white'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//             >
//               Overstayed ({overstayedCount})
//             </button>
//             <button
//               onClick={() => setStatusFilter('checked_out')}
//               className={`px-4 py-2 rounded-lg font-bold transition-all ${statusFilter === 'checked_out'
//                 ? 'bg-gray-600 text-white'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//             >
//               Checked Out
//             </button>
//           </div>

//           <input
//             type="text"
//             placeholder="Guard Name"
//             value={guardName}
//             onChange={e => setGuardName(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg font-bold focus:ring-2 focus:ring-blue-600"
//           />
//         </div>

//         {selectedLogs.size > 0 && (
//           <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
//             <span className="text-sm font-bold text-blue-900">{selectedLogs.size} visitor(s) selected</span>
//             <button
//               onClick={handleBulkCheckOut}
//               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
//             >
//               <LogOut className="w-4 h-4" />
//               Bulk Check Out
//             </button>
//           </div>
//         )}

//         {filteredLogs.length === 0 ? (
//           <div className="text-center py-12">
//             <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <p className="text-gray-500 font-semibold">No visitor logs found</p>
//             <p className="text-gray-400 text-sm mt-1">
//               {searchTerm || statusFilter !== 'all'
//                 ? 'Try adjusting your filters'
//                 : 'Visitor entries will appear here'}
//             </p>
//           </div>
//         ) : (
//           <DataTable columns={columns} data={filteredLogs} />
//         )}
//       </div>
//     </div>
//   );
// }


// VisitorLogs.tsx — Fully functional, TenantHandover-style
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Users, Download, CheckCircle, XCircle, Clock, AlertCircle,
  CheckSquare, Square, LogOut, UserPlus, X, RefreshCw,
  Filter, Eye, Trash2, Ban, Search, FileText, Loader2,
  ShieldCheck, Building, ChevronDown,
} from 'lucide-react';
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Badge }   from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Swal from 'sweetalert2';

import {
  getVisitors, deleteVisitor, blockVisitor,
  checkOutVisitor, bulkCheckOut, getVisitorStats,
  VisitorLog,
} from "@/lib/visitorApi";
import { NewVisitorEntry } from "./NewVisitorEntry";

// ─── Style tokens (same as TenantHandover) ───────────────────────────────────
const SI = "text-[11px] py-0.5";

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <Card className={`${bg} border-0 shadow-sm`}>
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
          <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
        </div>
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

type StatusFilter = 'all' | 'checked_in' | 'checked_out' | 'overstayed';

const statusColor = (s: string) => {
  switch (s) {
    case 'checked_in':  return 'bg-green-100 text-green-700';
    case 'checked_out': return 'bg-gray-100 text-gray-700';
    case 'overstayed':  return 'bg-red-100 text-red-700';
    default:            return 'bg-gray-100 text-gray-700';
  }
};

const statusLabel = (s: string) => {
  switch (s) {
    case 'checked_in':  return 'CHECKED IN';
    case 'checked_out': return 'CHECKED OUT';
    case 'overstayed':  return 'OVERSTAYED';
    default:            return s.toUpperCase();
  }
};

const fmt = (d: string | null | undefined) => {
  if (!d) return 'N/A';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return 'N/A'; }
};

// ═══════════════════════════════════════════════════════════════════════════════
export function VisitorLogs() {
  const [logs, setLogs]           = useState<VisitorLog[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem]   = useState<VisitorLog | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guardName, setGuardName] = useState('Security Guard');

  // filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [colSearch, setColSearch] = useState({
    visitor_name: '', visitor_phone: '', tenant_name: '',
    property_name: '', room_number: '', status: '', entry_time: '',
  });

  // selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll]         = useState(false);

  // stats
  const [stats, setStats] = useState({ total: 0, checked_in: 0, checked_out: 0, overstayed: 0, checked_out_today: 0 });

  // ── Load ───────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== 'all')   filters.status      = statusFilter;
      if (propertyFilter !== 'all') filters.property_id = propertyFilter;

      const [visRes, stRes] = await Promise.all([
        getVisitors(filters),
        getVisitorStats(),
      ]);
      setLogs(visRes.data || []);
      setStats({
        total:            stRes.data.total          || 0,
        checked_in:       stRes.data.checked_in     || 0,
        checked_out:      stRes.data.checked_out    || 0,
        overstayed:       stRes.data.overstayed     || 0,
        checked_out_today: stRes.data.checked_out_today || 0,
      });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load visitor logs');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, propertyFilter]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Unique properties for filter ───────────────────────────────────────
  const uniqueProperties = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string }[] = [];
    logs.forEach(l => {
      const key = l.property_id || l.property_name;
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ id: l.property_id || l.property_name, name: l.property_name });
      }
    });
    return list;
  }, [logs]);

  // ── Column search filter ───────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return logs.filter(h => {
      const cs = colSearch;
      const vn = !cs.visitor_name  || h.visitor_name?.toLowerCase().includes(cs.visitor_name.toLowerCase());
      const vp = !cs.visitor_phone || h.visitor_phone?.includes(cs.visitor_phone);
      const tn = !cs.tenant_name   || h.tenant_name?.toLowerCase().includes(cs.tenant_name.toLowerCase());
      const pn = !cs.property_name || h.property_name?.toLowerCase().includes(cs.property_name.toLowerCase());
      const rn = !cs.room_number   || h.room_number?.toLowerCase().includes(cs.room_number.toLowerCase());
      const st = !cs.status        || h.status?.toLowerCase().includes(cs.status.toLowerCase());
      const et = !cs.entry_time    || fmt(h.entry_time).toLowerCase().includes(cs.entry_time.toLowerCase());
      return vn && vp && tn && pn && rn && st && et;
    });
  }, [logs, colSearch]);

  // ── Selection ──────────────────────────────────────────────────────────
  const toggleSelectAll = () => {
    if (selectAll) { setSelectedItems(new Set()); }
    else { setSelectedItems(new Set(filteredItems.map(i => i.id))); }
    setSelectAll(!selectAll);
  };
  const toggleSelectItem = (id: string) => {
    const ns = new Set(selectedItems);
    if (ns.has(id)) ns.delete(id); else ns.add(id);
    setSelectedItems(ns);
    setSelectAll(ns.size === filteredItems.length && filteredItems.length > 0);
  };

  // ── Check out ──────────────────────────────────────────────────────────
  const handleCheckOut = async (id: string) => {
    if (!guardName) { toast.error('Enter guard name'); return; }
    try {
      await checkOutVisitor(id, guardName);
      toast.success('Visitor checked out');
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Check out failed');
    }
  };

  // ── Bulk check out ─────────────────────────────────────────────────────
  const handleBulkCheckOut = async () => {
    if (selectedItems.size === 0) { toast.error('Select visitors first'); return; }
    if (!guardName) { toast.error('Enter guard name'); return; }

    const result = await Swal.fire({
      title: 'Bulk Check Out?',
      text: `Check out ${selectedItems.size} visitor(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, check out!',
      width: '360px',
      customClass: { popup: 'rounded-xl shadow-2xl' },
    });
    if (!result.isConfirmed) return;

    try {
      await bulkCheckOut(Array.from(selectedItems), guardName);
      toast.success(`${selectedItems.size} visitor(s) checked out`);
      setSelectedItems(new Set());
      setSelectAll(false);
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Bulk check out failed');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, name?: string) => {
    const result = await Swal.fire({
      title: 'Delete Record?',
      text: `Delete visitor log for "${name || id}"? This cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete!',
      width: '380px',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 mx-1',
        cancelButton:  'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 mx-1',
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;
    try {
      await deleteVisitor(id);
      toast.success('Visitor record deleted');
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  // ── Bulk delete ────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) { toast.error('Select records first'); return; }
    const result = await Swal.fire({
      title: 'Delete Selected?',
      text: `Delete ${selectedItems.size} visitor record(s)? This cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete all!',
      width: '400px',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 mx-1',
        cancelButton:  'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 mx-1',
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;
    try {
      for (const id of selectedItems) await deleteVisitor(id);
      toast.success(`${selectedItems.size} records deleted`);
      setSelectedItems(new Set()); setSelectAll(false);
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  // ── Block visitor ──────────────────────────────────────────────────────
  const handleBlock = async (log: VisitorLog) => {
    const { value: reason } = await Swal.fire({
      title: 'Block Visitor',
      input: 'textarea',
      inputLabel: `Reason for blocking ${log.visitor_name}`,
      inputPlaceholder: 'Enter reason…',
      showCancelButton: true,
      confirmButtonText: 'Block',
      confirmButtonColor: '#d33',
      width: '400px',
      customClass: { popup: 'rounded-xl shadow-2xl' },
    });
    if (!reason) return;
    try {
      await blockVisitor({
        visitor_name:    log.visitor_name,
        visitor_phone:   log.visitor_phone,
        id_proof_number: log.id_proof_number,
        reason,
        blocked_by:      guardName || 'Security',
      });
      toast.success(`${log.visitor_name} blocked successfully`);
    } catch (err: any) {
      toast.error(err?.message || 'Block failed');
    }
  };

  // ── Export CSV ─────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['Visitor','Phone','Tenant','Property','Room','Entry','Exit','Status','QR','Purpose','ID Proof','Vehicle','Guard'];
    const rows = filteredItems.map(l => [
      l.visitor_name, l.visitor_phone, l.tenant_name, l.property_name, l.room_number,
      fmt(l.entry_time), l.exit_time ? fmt(l.exit_time) : 'N/A',
      l.status, l.qr_code || '', l.purpose,
      `${l.id_proof_type}: ${l.id_proof_number}`,
      l.vehicle_number || '', l.security_guard_name,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `visitor_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const hasFilters   = statusFilter !== 'all' || propertyFilter !== 'all';
  const hasColSearch = Object.values(colSearch).some(v => v !== '');
  const activeCount  = [statusFilter !== 'all', propertyFilter !== 'all'].filter(Boolean).length;
  const clearFilters    = () => { setStatusFilter('all'); setPropertyFilter('all'); };
  const clearColSearch  = () => setColSearch({ visitor_name: '', visitor_phone: '', tenant_name: '', property_name: '', room_number: '', status: '', entry_time: '' });

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20">
        <div className="px-3 sm:px-5 pt-3 pb-2 flex items-end justify-end gap-2">
          <div className="flex items-end justify-end gap-1.5 flex-shrink-0">

            <button onClick={() => setSidebarOpen(o => !o)}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors
                ${sidebarOpen || hasFilters ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              <Filter className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Filters</span>
              {activeCount > 0 && (
                <span className={`h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center
                  ${sidebarOpen || hasFilters ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                  {activeCount}
                </span>
              )}
            </button>

            <button onClick={handleExport}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium transition-colors">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button onClick={loadAll} disabled={loading}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-[11px] font-semibold shadow-sm transition-colors">
              <UserPlus className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="xs:inline">New Visitor</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-3 sm:px-5 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            <StatCard title="Total Visitors"    value={stats.total}             icon={Users}        color="bg-blue-600"   bg="bg-gradient-to-br from-blue-50 to-blue-100" />
            <StatCard title="Checked In"        value={stats.checked_in}        icon={CheckCircle}  color="bg-green-600"  bg="bg-gradient-to-br from-green-50 to-green-100" />
            <StatCard title="Overstayed"        value={stats.overstayed}        icon={AlertCircle}  color="bg-red-600"    bg="bg-gradient-to-br from-red-50 to-red-100" />
            <StatCard title="Checked Out Today" value={stats.checked_out_today} icon={XCircle}      color="bg-gray-600"   bg="bg-gradient-to-br from-gray-50 to-gray-100" />
            <StatCard title="Total Checked Out" value={stats.checked_out}       icon={ShieldCheck}  color="bg-cyan-600"   bg="bg-gradient-to-br from-cyan-50 to-cyan-100" />
          </div>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div className="relative">
        <main className="p-3 sm:p-4">

          {/* Guard name + bulk actions bar */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Guard name for checkout…"
                value={guardName}
                onChange={e => setGuardName(e.target.value)}
                className="h-7 text-[11px] w-44 border-gray-200 bg-white"
              />
            </div>
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-lg">
                  {selectedItems.size} selected
                </span>
                <Button size="sm" onClick={handleBulkCheckOut}
                  className="h-7 text-[10px] px-2.5 bg-blue-600 hover:bg-blue-700 text-white gap-1">
                  <LogOut className="h-3 w-3" /> Bulk Check Out
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBulkDelete}
                  className="h-7 text-[10px] px-2.5 bg-red-600 hover:bg-red-700 gap-1">
                  <Trash2 className="h-3 w-3" /> Delete Selected
                </Button>
              </div>
            )}
          </div>

          <Card className="border rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
              <span className="text-sm font-semibold text-gray-700">
                All Visitor Logs ({filteredItems.length})
                {selectedItems.size > 0 && (
                  <span className="ml-2 text-blue-600 text-xs">({selectedItems.size} selected)</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {hasColSearch && (
                  <button onClick={clearColSearch} className="text-[10px] text-blue-600 font-semibold hover:underline">
                    Clear Search
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-auto max-h-[calc(100vh-320px)]">
              <div className="min-w-[1100px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50">
                    <TableRow>
                      <TableHead className="py-2 px-3 text-xs w-8">
                        <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200 rounded">
                          {selectAll
                            ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" />
                            : <Square className="h-3.5 w-3.5 text-gray-400" />}
                        </button>
                      </TableHead>
                      <TableHead className="py-2 px-3 text-xs">Visitor</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Phone</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Tenant</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Property</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Room</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Entry Time</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Exit / Expected</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Purpose</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Status</TableHead>
                      <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
                    </TableRow>

                    {/* Column search row */}
                    <TableRow className="bg-gray-50/80">
                      <TableCell className="py-1 px-2" />
                      {[
                        { key: 'visitor_name',  ph: 'Visitor…' },
                        { key: 'visitor_phone', ph: 'Phone…' },
                        { key: 'tenant_name',   ph: 'Tenant…' },
                        { key: 'property_name', ph: 'Property…' },
                        { key: 'room_number',   ph: 'Room…' },
                        { key: 'entry_time',    ph: 'Entry…' },
                        { key: null, ph: '' },
                        { key: null, ph: '' },
                        { key: 'status',        ph: 'Status…' },
                      ].map((col, idx) => (
                        <TableCell key={idx} className="py-1 px-2">
                          {col.key ? (
                            <Input
                              placeholder={col.ph}
                              value={colSearch[col.key as keyof typeof colSearch]}
                              onChange={e => setColSearch(p => ({ ...p, [col.key!]: e.target.value }))}
                              className="h-6 text-[10px]"
                            />
                          ) : <div />}
                        </TableCell>
                      ))}
                      <TableCell className="py-1 px-2" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Loading visitor logs…</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-12">
                          <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500">No visitor logs found</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.map(log => (
                      <TableRow key={log.id} className="hover:bg-gray-50">
                        <TableCell className="py-2 px-3">
                          <button onClick={() => toggleSelectItem(log.id)} className="p-1 hover:bg-gray-200 rounded">
                            {selectedItems.has(log.id)
                              ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" />
                              : <Square className="h-3.5 w-3.5 text-gray-400" />}
                          </button>
                        </TableCell>

                        <TableCell className="py-2 px-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{log.visitor_name}</p>
                            {log.qr_code && <p className="text-[9px] text-blue-600 font-mono mt-0.5">{log.qr_code}</p>}
                          </div>
                        </TableCell>

                        <TableCell className="py-2 px-3 text-xs text-gray-600">{log.visitor_phone}</TableCell>

                        <TableCell className="py-2 px-3 text-xs text-gray-700 font-medium">{log.tenant_name}</TableCell>

                        <TableCell className="py-2 px-3 text-xs text-gray-600 max-w-[130px] truncate">{log.property_name}</TableCell>

                        <TableCell className="py-2 px-3 text-xs text-gray-600">{log.room_number}</TableCell>

                        <TableCell className="py-2 px-3 text-xs text-gray-600">{fmt(log.entry_time)}</TableCell>

                        <TableCell className="py-2 px-3 text-xs">
                          {log.exit_time ? (
                            <span className="text-gray-600">{fmt(log.exit_time)}</span>
                          ) : log.tentative_exit_time ? (
                            <span className="text-orange-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {fmt(log.tentative_exit_time)}
                            </span>
                          ) : <span className="text-gray-400">—</span>}
                        </TableCell>

                        <TableCell className="py-2 px-3 text-xs text-gray-600">{log.purpose}</TableCell>

                        <TableCell className="py-2 px-3">
                          <Badge className={`text-[9px] px-1.5 font-bold ${statusColor(log.status)}`}>
                            {statusLabel(log.status)}
                          </Badge>
                        </TableCell>
<TableCell className="py-2 px-3">
  <div className="flex justify-end items-center gap-2 flex-nowrap">

    {/* View */}
    <Button
      size="sm"
      variant="ghost"
      className="h-8 px-2 flex items-center gap-1 text-blue-600 hover:bg-blue-500"
      onClick={() => setViewItem(log)}
      title="View"
    >
      <Eye className="h-4 w-4" />
      <span className="hidden md:inline text-xs font-medium"></span>
    </Button>

    {/* Check Out */}
    {(log.status === 'checked_in' || log.status === 'overstayed') && (
      <Button
        size="sm"
        variant="ghost"
        className="h-8 px-2 flex items-center gap-1 text-green-600 hover:bg-green-500 hover:text-green-900"
        onClick={() => handleCheckOut(log.id)}
        title="Check Out"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden md:inline text-xs font-medium">Check Out</span>
      </Button>
    )}

    {/* Block */}
    <Button
      size="sm"
      variant="ghost"
      className="h-8 px-2 flex items-center gap-1 text-orange-600 hover:bg-orange-500"
      onClick={() => handleBlock(log)}
      title="Block Visitor"
    >
      <Ban className="h-4 w-4" />
      <span className="hidden md:inline text-xs font-medium">Block</span>
    </Button>

    {/* Delete */}
    <Button
      size="sm"
      variant="ghost"
      className="h-8 px-2 flex items-center gap-1 text-red-600 hover:bg-red-600"
      onClick={() => handleDelete(log.id, log.visitor_name)}
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
      <span className="hidden md:inline text-xs font-medium"></span>
    </Button>

  </div>
</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </main>

        {/* ── FILTER DRAWER ──────────────────────────────────────────── */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`fixed top-0 right-0 h-full z-40 w-72 sm:w-80 bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="bg-gradient-to-r from-blue-700 to-cyan-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">Filters</span>
              {hasFilters && (
                <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">
                  {activeCount} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasFilters && (
                <button onClick={clearFilters} className="text-[10px] text-blue-200 hover:text-white font-semibold">
                  Clear all
                </button>
              )}
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Status filter */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-blue-500" /> Status
              </p>
              <div className="space-y-1">
                {(['all', 'checked_in', 'checked_out', 'overstayed'] as StatusFilter[]).map(s => (
                  <label key={s} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                    ${statusFilter === s ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
                    <input type="radio" name="status" value={s} checked={statusFilter === s}
                      onChange={() => setStatusFilter(s)} className="sr-only" />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusFilter === s ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <span className="text-[12px] font-medium">
                      {s === 'all' ? 'All Statuses' : statusLabel(s)}
                    </span>
                    {statusFilter === s && (
                      <span className="ml-auto">
                        <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Property filter */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Building className="h-3 w-3 text-indigo-500" /> Property
              </p>
              <div className="space-y-1">
                {[{ id: 'all', name: 'All Properties' }, ...uniqueProperties].map(p => (
                  <label key={p.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                    ${propertyFilter === p.id ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
                    <input type="radio" name="prop" value={p.id} checked={propertyFilter === p.id}
                      onChange={() => setPropertyFilter(p.id)} className="sr-only" />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${propertyFilter === p.id ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <span className="text-[12px] font-medium truncate">{p.name}</span>
                    {propertyFilter === p.id && (
                      <span className="ml-auto flex-shrink-0">
                        <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
            <button onClick={clearFilters} disabled={!hasFilters}
              className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
              Clear All
            </button>
            <button onClick={() => setSidebarOpen(false)}
              className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[11px] font-semibold hover:from-blue-700 hover:to-cyan-700">
              Apply & Close
            </button>
          </div>
        </aside>
      </div>

      {/* ══ NEW VISITOR MODAL ══════════════════════════════════════════════ */}
      <Dialog open={showModal} onOpenChange={v => { if (!v) setShowModal(false); }}>
  <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
    <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white px-4 py-2 flex items-center justify-between rounded-t-lg">
      <div>
        <h2 className="text-sm font-semibold">New Visitor Entry</h2>
        <p className="text-[9px] text-blue-100">Register a new visitor</p>
      </div>
      <DialogClose asChild>
        <button className="p-1 rounded-full hover:bg-white/20 transition"><X className="h-3.5 w-3.5" /></button>
      </DialogClose>
    </div>
    <div className="p-3 overflow-y-auto max-h-[calc(90vh-80px)]">
      <NewVisitorEntry
        onSuccess={data => {
          toast.success(`Visitor ${data?.visitor_name} registered!`);
          setShowModal(false);
          loadAll();
        }}
        onClose={() => setShowModal(false)}
      />
    </div>
  </DialogContent>
</Dialog>

      {/* ══ VIEW DETAIL MODAL ══════════════════════════════════════════════ */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={v => { if (!v) setViewItem(null); }}>
          <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-base font-semibold">Visitor Details</h2>
                <p className="text-xs text-blue-100">{viewItem.visitor_name} — {viewItem.property_name}</p>
              </div>
              <DialogClose asChild>
                <button className="p-1.5 rounded-full hover:bg-white/20 transition"><X className="h-4 w-4" /></button>
              </DialogClose>
            </div>

            <div className="p-4 overflow-y-auto max-h-[75vh] space-y-3">
              {/* Status badge */}
              <div className="flex items-center justify-between">
                <Badge className={`text-[10px] px-2 py-1 font-bold ${statusColor(viewItem.status)}`}>
                  {statusLabel(viewItem.status)}
                </Badge>
                {viewItem.qr_code && (
                  <span className="text-[10px] text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
                    {viewItem.qr_code}
                  </span>
                )}
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  ['Visitor Name',  viewItem.visitor_name],
                  ['Visitor Phone', viewItem.visitor_phone],
                  ['Tenant',        viewItem.tenant_name],
                  ['Tenant Phone',  viewItem.tenant_phone  || '—'],
                  ['Property',      viewItem.property_name],
                  ['Room',          viewItem.room_number],
                  ['Purpose',       viewItem.purpose],
                  ['ID Type',       viewItem.id_proof_type],
                  ['ID Number',     viewItem.id_proof_number],
                  ['Vehicle',       viewItem.vehicle_number || '—'],
                  ['Guard',         viewItem.security_guard_name],
                  ['Approval',      viewItem.approval_status],
                  ['Entry Time',    fmt(viewItem.entry_time)],
                  ['Exit Time',     viewItem.exit_time ? fmt(viewItem.exit_time) : '—'],
                  ['Expected Exit', viewItem.tentative_exit_time ? fmt(viewItem.tentative_exit_time) : '—'],
                  viewItem.checked_out_by ? ['Checked Out By', viewItem.checked_out_by] : null,
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label as string} className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-500 font-medium">{label}</p>
                    <p className="text-[11px] font-semibold text-gray-800 mt-0.5 break-words">{value as string}</p>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {viewItem.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-amber-800 mb-1">Notes</p>
                  <p className="text-[11px] text-amber-700">{viewItem.notes}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                {(viewItem.status === 'checked_in' || viewItem.status === 'overstayed') && (
                  <Button onClick={() => { handleCheckOut(viewItem.id); setViewItem(null); }}
                    className="flex-1 h-8 text-[11px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-1.5">
                    <LogOut className="h-3.5 w-3.5" /> Check Out Now
                  </Button>
                )}
                <Button variant="outline" onClick={() => { handleBlock(viewItem); setViewItem(null); }}
                  className="h-8 text-[11px] border-red-200 text-red-600 hover:bg-red-50 gap-1.5">
                  <Ban className="h-3.5 w-3.5" /> Block
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}