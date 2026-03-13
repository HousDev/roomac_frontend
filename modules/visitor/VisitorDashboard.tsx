// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Users, LogIn, LogOut, Clock, TrendingUp, Car, FileText, UserPlus, BarChart3, Loader2 } from 'lucide-react';

// interface DashboardStats {
//   totalVisitors: number;
//   currentlyInside: number;
//   checkedOutToday: number;
//   totalToday: number;
//   totalThisWeek: number;
//   totalThisMonth: number;
//   withVehicles: number;
//   withDocuments: number;
//   overdueVisitors: number;
//   byPurpose: { [key: string]: number };
// }

// interface RecentVisitor {
//   id: string;
//   visitor_name: string;
//   tenant_id: string;
//   property_id: string;
//   check_in_time: string;
//   check_out_time: string | null;
//   purpose: string;
// }

// // Static data
// const staticVisitorLogs = [
//   {
//     id: '1',
//     visitor_name: 'Amit Patel',
//     tenant_id: 't1',
//     property_id: 'p1',
//     entry_time: '2026-03-11T09:30:00',
//     exit_time: null,
//     purpose: 'Friend Visit',
//     vehicle_number: 'MH01AB1234',
//     id_proof_type: 'Aadhar'
//   },
//   {
//     id: '2',
//     visitor_name: 'Priya Singh',
//     tenant_id: 't2',
//     property_id: 'p2',
//     entry_time: '2026-03-11T10:15:00',
//     exit_time: '2026-03-11T12:30:00',
//     purpose: 'Family',
//     vehicle_number: '',
//     id_proof_type: 'Driving License'
//   },
//   {
//     id: '3',
//     visitor_name: 'Rahul Sharma',
//     tenant_id: 't3',
//     property_id: 'p3',
//     entry_time: '2026-03-11T11:00:00',
//     exit_time: null,
//     purpose: 'Delivery',
//     vehicle_number: 'MH02CD5678',
//     id_proof_type: ''
//   },
//   {
//     id: '4',
//     visitor_name: 'Neha Gupta',
//     tenant_id: 't4',
//     property_id: 'p4',
//     entry_time: '2026-03-11T08:45:00',
//     exit_time: '2026-03-11T10:00:00',
//     purpose: 'Interview',
//     vehicle_number: '',
//     id_proof_type: 'Passport'
//   },
//   {
//     id: '5',
//     visitor_name: 'Vikram Mehta',
//     tenant_id: 't5',
//     property_id: 'p5',
//     entry_time: '2026-03-11T09:00:00',
//     exit_time: '2026-03-11T11:15:00',
//     purpose: 'Business Meeting',
//     vehicle_number: 'MH03EF9012',
//     id_proof_type: 'PAN Card'
//   },
//   {
//     id: '6',
//     visitor_name: 'Anjali Desai',
//     tenant_id: 't1',
//     property_id: 'p1',
//     entry_time: '2026-03-10T14:30:00',
//     exit_time: '2026-03-10T16:45:00',
//     purpose: 'Friend Visit',
//     vehicle_number: '',
//     id_proof_type: 'Aadhar'
//   },
//   {
//     id: '7',
//     visitor_name: 'Suresh Reddy',
//     tenant_id: 't2',
//     property_id: 'p2',
//     entry_time: '2026-03-10T15:20:00',
//     exit_time: '2026-03-10T17:30:00',
//     purpose: 'Maintenance',
//     vehicle_number: 'MH04GH3456',
//     id_proof_type: 'Driving License'
//   },
//   {
//     id: '8',
//     visitor_name: 'Kavita Singh',
//     tenant_id: 't3',
//     property_id: 'p3',
//     entry_time: '2026-03-09T11:30:00',
//     exit_time: '2026-03-09T13:45:00',
//     purpose: 'Family',
//     vehicle_number: '',
//     id_proof_type: 'Aadhar'
//   },
//   {
//     id: '9',
//     visitor_name: 'Rajesh Kumar',
//     tenant_id: 't4',
//     property_id: 'p4',
//     entry_time: '2026-03-09T10:00:00',
//     exit_time: '2026-03-09T12:15:00',
//     purpose: 'Interview',
//     vehicle_number: 'MH05IJ7890',
//     id_proof_type: 'Voter ID'
//   },
//   {
//     id: '10',
//     visitor_name: 'Deepa Nair',
//     tenant_id: 't5',
//     property_id: 'p5',
//     entry_time: '2026-03-08T16:00:00',
//     exit_time: '2026-03-08T18:30:00',
//     purpose: 'Friend Visit',
//     vehicle_number: '',
//     id_proof_type: 'Driving License'
//   },
//   {
//     id: '11',
//     visitor_name: 'Arjun Mehta',
//     tenant_id: 't1',
//     property_id: 'p1',
//     entry_time: '2026-03-08T09:15:00',
//     exit_time: '2026-03-08T11:30:00',
//     purpose: 'Business Meeting',
//     vehicle_number: 'MH06KL1234',
//     id_proof_type: 'PAN Card'
//   },
//   {
//     id: '12',
//     visitor_name: 'Pooja Sharma',
//     tenant_id: 't2',
//     property_id: 'p2',
//     entry_time: '2026-03-07T13:00:00',
//     exit_time: '2026-03-07T15:15:00',
//     purpose: 'Family',
//     vehicle_number: '',
//     id_proof_type: 'Aadhar'
//   },
//   {
//     id: '13',
//     visitor_name: 'Sanjay Gupta',
//     tenant_id: 't3',
//     property_id: 'p3',
//     entry_time: '2026-03-07T10:30:00',
//     exit_time: '2026-03-07T12:45:00',
//     purpose: 'Maintenance',
//     vehicle_number: 'MH07MN5678',
//     id_proof_type: 'Driving License'
//   }
// ];

// export function VisitorDashboard() {
//   const [stats, setStats] = useState<DashboardStats>({
//     totalVisitors: 0,
//     currentlyInside: 0,
//     checkedOutToday: 0,
//     totalToday: 0,
//     totalThisWeek: 0,
//     totalThisMonth: 0,
//     withVehicles: 0,
//     withDocuments: 0,
//     overdueVisitors: 0,
//     byPurpose: {}
//   });
//   const [recentVisitors, setRecentVisitors] = useState<RecentVisitor[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   const loadDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       const allLogs = staticVisitorLogs;
//       const now = new Date();
//       const today = new Date(now.setHours(0, 0, 0, 0));
//       const weekAgo = new Date(today);
//       weekAgo.setDate(weekAgo.getDate() - 7);
//       const monthAgo = new Date(today);
//       monthAgo.setMonth(monthAgo.getMonth() - 1);

//       const purposeCounts: { [key: string]: number } = {};
//       allLogs.forEach((log: any) => {
//         if (log.purpose) {
//           purposeCounts[log.purpose] = (purposeCounts[log.purpose] || 0) + 1;
//         }
//       });

//       // Map exit_time to check_out_time for compatibility
//       const mappedLogs = allLogs.map((log: any) => ({
//         id: log.id,
//         visitor_name: log.visitor_name,
//         tenant_id: log.tenant_id,
//         property_id: log.property_id,
//         check_in_time: log.entry_time,
//         check_out_time: log.exit_time,
//         purpose: log.purpose,
//         vehicle_number: log.vehicle_number,
//         id_proof_type: log.id_proof_type
//       }));

//       setStats({
//         totalVisitors: allLogs.length,
//         currentlyInside: allLogs.filter((l: any) => !l.exit_time).length,
//         checkedOutToday: allLogs.filter((l: any) =>
//           l.exit_time &&
//           new Date(l.entry_time) >= today
//         ).length,
//         totalToday: allLogs.filter((l: any) => new Date(l.entry_time) >= today).length,
//         totalThisWeek: allLogs.filter((l: any) => new Date(l.entry_time) >= weekAgo).length,
//         totalThisMonth: allLogs.filter((l: any) => new Date(l.entry_time) >= monthAgo).length,
//         withVehicles: allLogs.filter((l: any) => l.vehicle_number).length,
//         withDocuments: allLogs.filter((l: any) => l.id_proof_type).length,
//         overdueVisitors: 2, // Example value
//         byPurpose: purposeCounts
//       });

//       // Get 5 most recent visitors
//       const sorted = [...mappedLogs].sort((a, b) =>
//         new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime()
//       );
//       setRecentVisitors(sorted.slice(0, 5));
//     } catch (err: any) {
//       console.error('Error loading visitor dashboard:', err);
//       setError(err.message || 'Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const topPurposes = Object.entries(stats.byPurpose)
//     .sort(([, a], [, b]) => b - a)
//     .slice(0, 5);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <p className="text-red-600 font-semibold mb-2">Error: {error}</p>
//           <button
//             onClick={loadDashboardData}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
//           Visitor Dashboard
//         </h1>
//         <p className="text-gray-600 font-semibold mt-1">Real-time visitor management and analytics</p>
//       </div>

//       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Link to="/visitor/logs" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
//           <div className="flex items-center justify-between mb-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//               <Users className="w-6 h-6 text-white" />
//             </div>
//             <TrendingUp className="w-5 h-5 text-emerald-600" />
//           </div>
//           <div className="text-sm font-bold text-gray-600">Total Visitors</div>
//           <div className="text-3xl font-black text-gray-900 mt-1">{stats.totalVisitors}</div>
//           <div className="text-xs font-semibold text-gray-500 mt-2">{stats.totalToday} today</div>
//         </Link>

//         <div className="glass rounded-xl p-6">
//           <div className="flex items-center justify-between mb-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
//               <LogIn className="w-6 h-6 text-white" />
//             </div>
//           </div>
//           <div className="text-sm font-bold text-gray-600">Currently Inside</div>
//           <div className="text-3xl font-black text-emerald-600 mt-1">{stats.currentlyInside}</div>
//           <div className="text-xs font-semibold text-gray-500 mt-2">Active visitors</div>
//         </div>

//         <div className="glass rounded-xl p-6">
//           <div className="flex items-center justify-between mb-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
//               <Clock className="w-6 h-6 text-white" />
//             </div>
//           </div>
//           <div className="text-sm font-bold text-gray-600">This Week</div>
//           <div className="text-3xl font-black text-gray-900 mt-1">{stats.totalThisWeek}</div>
//           <div className="text-xs font-semibold text-gray-500 mt-2">{stats.totalThisMonth} this month</div>
//         </div>

//         <div className="glass rounded-xl p-6">
//           <div className="flex items-center justify-between mb-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
//               <LogOut className="w-6 h-6 text-white" />
//             </div>
//           </div>
//           <div className="text-sm font-bold text-gray-600">Checked Out Today</div>
//           <div className="text-3xl font-black text-blue-600 mt-1">{stats.checkedOutToday}</div>
//           <div className="text-xs font-semibold text-gray-500 mt-2">Completed visits</div>
//         </div>
//       </div>

//       <div className="grid md:grid-cols-3 gap-4">
//         <div className="glass rounded-xl p-5">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//               <Car className="w-5 h-5 text-blue-600" />
//             </div>
//             <div>
//               <div className="text-sm font-bold text-gray-600">Visitors with Vehicles</div>
//               <div className="text-2xl font-black text-gray-900">{stats.withVehicles}</div>
//             </div>
//           </div>
//         </div>

//         <div className="glass rounded-xl p-5">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
//               <FileText className="w-5 h-5 text-emerald-600" />
//             </div>
//             <div>
//               <div className="text-sm font-bold text-gray-600">Document Verification</div>
//               <div className="text-2xl font-black text-gray-900">{stats.withDocuments}</div>
//             </div>
//           </div>
//         </div>

//         <div className="glass rounded-xl p-5">
//           <div className="flex items-center gap-3">
//             <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.overdueVisitors > 0 ? 'bg-red-100' : 'bg-gray-100'
//               }`}>
//               <Clock className={`w-5 h-5 ${stats.overdueVisitors > 0 ? 'text-red-600' : 'text-gray-600'}`} />
//             </div>
//             <div>
//               <div className="text-sm font-bold text-gray-600">Overdue Visitors</div>
//               <div className={`text-2xl font-black ${stats.overdueVisitors > 0 ? 'text-red-600' : 'text-gray-900'}`}>
//                 {stats.overdueVisitors}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-6">
//         <div className="glass rounded-xl p-6">
//           <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
//             <BarChart3 className="w-5 h-5" />
//             Top Visit Purposes
//           </h2>
//           <div className="space-y-3">
//             {topPurposes.length > 0 ? (
//               topPurposes.map(([purpose, count]) => {
//                 const percentage = ((count / stats.totalVisitors) * 100).toFixed(0);
//                 return (
//                   <div key={purpose}>
//                     <div className="flex items-center justify-between mb-1">
//                       <span className="text-sm font-bold text-gray-700">{purpose}</span>
//                       <span className="text-sm font-black text-gray-900">{count} ({percentage}%)</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div
//                         className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all"
//                         style={{ width: `${percentage}%` }}
//                       />
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="text-center py-8 text-gray-500 font-semibold">No data available</div>
//             )}
//           </div>
//         </div>

//         <div className="glass rounded-xl p-6">
//           <h2 className="text-xl font-black text-gray-900 mb-4">Recent Visitors</h2>
//           <div className="space-y-3">
//             {recentVisitors.length > 0 ? (
//               recentVisitors.map((visitor) => {
//                 const status = visitor.check_out_time ? 'Checked-Out' : 'Inside';

//                 return (
//                   <div key={visitor.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:shadow-md transition-all border-l-4 border-blue-500">
//                     <div className="flex items-start justify-between mb-2">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <div className="text-sm font-bold text-gray-900">{visitor.visitor_name}</div>
//                           <span className={`px-2 py-0.5 rounded-full text-xs font-black uppercase ${status === 'Inside' ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-gray-200 text-gray-700'
//                             }`}>
//                             {status}
//                           </span>
//                         </div>
//                         <div className="text-xs font-bold text-gray-600">
//                           Purpose: {visitor.purpose}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-200">
//                       <div>
//                         <div className="text-xs text-gray-500 font-bold mb-0.5 flex items-center gap-1">
//                           <LogIn className="w-3 h-3" />
//                           Entry
//                         </div>
//                         <div className="text-xs font-bold text-gray-900">
//                           {new Date(visitor.check_in_time).toLocaleTimeString()}
//                         </div>
//                       </div>
//                       <div>
//                         <div className="text-xs text-gray-500 font-bold mb-0.5 flex items-center gap-1">
//                           <LogOut className="w-3 h-3" />
//                           Exit
//                         </div>
//                         <div className="text-xs font-bold text-blue-600">
//                           {visitor.check_out_time
//                             ? new Date(visitor.check_out_time).toLocaleTimeString()
//                             : 'Inside'}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="text-center py-8 text-gray-500 font-semibold">No recent visitors</div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//         <Link to="/visitor/new-entry" className="glass rounded-xl p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all group">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
//               <UserPlus className="w-5 h-5 text-blue-600" />
//             </div>
//             <div className="text-sm font-bold text-gray-700">New Entry</div>
//           </div>
//           <div className="text-xs font-semibold text-gray-600">Register a new visitor</div>
//         </Link>

//         <Link to="/visitor/logs" className="glass rounded-xl p-5 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all group">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
//               <Users className="w-5 h-5 text-emerald-600" />
//             </div>
//             <div className="text-sm font-bold text-gray-700">View Logs</div>
//           </div>
//           <div className="text-xs font-semibold text-gray-600">All visitor records</div>
//         </Link>

//         <Link to="/visitor/restrictions" className="glass rounded-xl p-5 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all group">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
//               <FileText className="w-5 h-5 text-red-600" />
//             </div>
//             <div className="text-sm font-bold text-gray-700">Restrictions</div>
//           </div>
//           <div className="text-xs font-semibold text-gray-600">Manage blocked visitors</div>
//         </Link>
//       </div>
//     </div>
//   );
// }

// modules/visitor/VisitorDashboard.tsx
import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, LogIn, LogOut, Clock, Car,
  FileText, UserPlus, BarChart3, Loader2, Activity,
  Calendar, AlertCircle, ArrowUpRight, ArrowDownRight,
  Users2, Target, Zap, Eye, EyeOff, ChevronRight,
  TrendingUp, Shield, Menu, X, RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getVisitorStats, getVisitors } from "@/lib/visitorApi";
import { toast } from "sonner";

// ============== useMediaQuery Hook ==============
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
}

// ============== Types ==============
interface VisitorLog {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  tenant_name: string;
  property_name: string;
  room_number: string;
  entry_time: string;
  exit_time: string | null;
  purpose: string;
  vehicle_number?: string;
  id_proof_number?: string;
  status: string;
}

interface DashboardStats {
  totalVisitors: number;
  currentlyInside: number;
  checkedOutToday: number;
  totalToday: number;
  withVehicles: number;
  withDocuments: number;
  overdueVisitors: number;
  byPurpose: { [key: string]: number };
  peakHour: string;
  avgStay: number;
}

// ============== Animated Counter ==============
const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const startValue = count;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (value - startValue) * easeOutQuart;
      
      setCount(Math.floor(currentValue));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
};

// ============== Metric Card with Fixed Height ==============
const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color,
  delay = 0,
  onClick
}: any) => {
  const colors: any = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
    },
    green: {
      gradient: 'from-green-500 to-emerald-600',
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="cursor-pointer h-full"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm h-full">
        <CardContent className="p-4 sm:p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${colors[color].gradient} text-white shadow-lg`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            {trend !== undefined && (
              <Badge 
                variant="outline" 
                className={`${
                  trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                } border-0 text-xs font-medium`}
              >
                {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {Math.abs(trend)}%
              </Badge>
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              <AnimatedCounter value={value} />
            </p>
          </div>
          
          {trend && (
            <p className="text-xs text-gray-400 mt-2">vs last month</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============== Purpose List ==============
const PurposeList = ({ data }: { data: { [key: string]: number } }) => {
  const purposes = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxValue = Math.max(...Object.values(data), 1);

  if (purposes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <Target className="w-12 h-12 mb-2 opacity-30" />
        <p className="text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {purposes.map(([purpose, count], idx) => (
        <motion.div
          key={purpose}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="space-y-1"
        >
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="font-medium text-gray-700 truncate max-w-[120px] sm:max-w-none">
              {purpose}
            </span>
            <span className="text-gray-900 font-semibold ml-2">{count}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(count / maxValue) * 100}%` }}
              transition={{ delay: idx * 0.1 + 0.2, duration: 0.6 }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============== Visitor Card ==============
const VisitorCard = ({ visitor, compact = false, onClick }: { visitor: VisitorLog; compact?: boolean; onClick?: () => void }) => {
  const isInside = !visitor.exit_time;
  
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClick}
        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{visitor.visitor_name}</p>
          <p className="text-xs text-gray-500 truncate">{visitor.property_name}</p>
        </div>
        <Badge className={isInside ? 'bg-green-100 text-green-700 ml-2' : 'bg-gray-100 text-gray-700 ml-2'}>
          {isInside ? 'In' : 'Out'}
        </Badge>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="border rounded-xl p-4 hover:shadow-md transition-all bg-white cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{visitor.visitor_name}</h3>
            <Badge className={isInside ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
              {isInside ? 'Inside' : 'Checked Out'}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {visitor.property_name} • Room {visitor.room_number}
          </p>
        </div>
        <p className="text-xs text-gray-500 whitespace-nowrap">{visitor.purpose}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3 mt-2">
        <div className="flex items-center gap-1">
          <LogIn className="w-3 h-3 text-gray-400" />
          <span className="text-gray-600">
            {new Date(visitor.entry_time).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <LogOut className="w-3 h-3 text-gray-400" />
          <span className="text-gray-600">
            {visitor.exit_time 
              ? new Date(visitor.exit_time).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              : '—'
            }
          </span>
        </div>
      </div>
      
      {visitor.vehicle_number && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1 bg-gray-50 p-1.5 rounded">
          <Car className="w-3 h-3" /> {visitor.vehicle_number}
        </div>
      )}
    </motion.div>
  );
};

// ============== Quick Action with Redirect ==============
const QuickAction = ({ to, icon: Icon, title, description, color }: any) => (
  <Link to={to} className="block h-full">
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`h-full rounded-xl p-4 bg-gradient-to-r ${color} text-white shadow-lg hover:shadow-xl transition-all cursor-pointer`}
    >
      <div className="flex items-center gap-3 h-full">
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
          <p className="text-xs text-white/80 hidden sm:block">{description}</p>
        </div>
        <ChevronRight className="w-4 h-4 opacity-70" />
      </div>
    </motion.div>
  </Link>
);

// ============== Mobile Header ==============
const MobileHeader = ({ 
  showStats, 
  setShowStats, 
  lastUpdated,
  onRefresh,
  isRefreshing,
  navigate
}: any) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="lg:hidden mb-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-blue-600 text-white text-xs">
              <Zap className="w-3 h-3 mr-1" /> LIVE
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Visitor Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 w-9"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            className="h-9 w-9"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2 overflow-hidden"
          >
            <Button
              variant="outline"
              onClick={() => setShowStats(!showStats)}
              className="w-full justify-start gap-2"
            >
              {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </Button>
            
            <Button
              onClick={() => {
                setMenuOpen(false);
                navigate('/admin/visitors/new-entry');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <UserPlus className="w-4 h-4" />
              New Entry
            </Button>

            <Button
              onClick={() => {
                setMenuOpen(false);
                navigate('/admin/visitors/logs');
              }}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <FileText className="w-4 h-4" />
              View Logs
            </Button>

            <Button
              onClick={() => {
                setMenuOpen(false);
                navigate('/admin/visitors/restrictions');
              }}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Shield className="w-4 h-4" />
              Restrictions
            </Button>

            <p className="text-xs text-gray-400 text-center pt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============== Desktop Header ==============
const DesktopHeader = ({ showStats, setShowStats, lastUpdated, onRefresh, isRefreshing, navigate }: any) => (
  <div className="hidden lg:flex items-center justify-between mb-3 -mt-20 ">
    <div>
      <div className="flex items-center gap-2 mb-1">
        {/* <Badge className="bg-blue-600 text-white">
          <Zap className="w-3 h-3 mr-1" /> LIVE DASHBOARD
        </Badge> */}
        <Badge variant="outline">
          Updated {lastUpdated.toLocaleTimeString()}
        </Badge>
      </div>
      {/* <h1 className="text-3xl font-bold text-gray-900">Visitor Dashboard</h1>
      <p className="text-gray-500 flex items-center gap-1 mt-1">
        <Activity className="w-4 h-4" />
        Real-time visitor analytics and management
      </p> */}
    </div>

    <div className="flex items-center gap-3 -mt-20">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowStats(!showStats)}
        className="gap-2"
      >
        {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        {showStats ? 'Hide Stats' : 'Show Stats'}
      </Button>
      
      
    </div>
  </div>
);

// ============== Main Component ==============
export function VisitorDashboard() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  
  const [stats, setStats] = useState<DashboardStats>({
    totalVisitors: 0,
    currentlyInside: 0,
    checkedOutToday: 0,
    totalToday: 0,
    withVehicles: 0,
    withDocuments: 0,
    overdueVisitors: 0,
    byPurpose: {},
    peakHour: '10:00 AM',
    avgStay: 0
  });
  
  const [recentVisitors, setRecentVisitors] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    try {
      const [statsRes, visitorsRes] = await Promise.all([
        getVisitorStats(),
        getVisitors({ limit: 10 })
      ]);

      const visitors = visitorsRes?.data || [];
      
      // Calculate stats
      const purposeCounts: { [key: string]: number } = {};
      visitors.forEach((v: VisitorLog) => {
        if (v.purpose) {
          purposeCounts[v.purpose] = (purposeCounts[v.purpose] || 0) + 1;
        }
      });

      const today = new Date().toDateString();
      const checkedOutToday = visitors.filter(v => 
        v.exit_time && new Date(v.exit_time).toDateString() === today
      ).length;

      const totalToday = visitors.filter(v => 
        new Date(v.entry_time).toDateString() === today
      ).length;

      // Calculate average stay
      const checkedOut = visitors.filter(v => v.exit_time);
      const avgStay = checkedOut.length > 0
        ? checkedOut.reduce((acc, v) => {
            const entry = new Date(v.entry_time).getTime();
            const exit = new Date(v.exit_time!).getTime();
            return acc + (exit - entry) / (1000 * 60);
          }, 0) / checkedOut.length
        : 0;

      setStats({
        totalVisitors: visitors.length,
        currentlyInside: visitors.filter(v => !v.exit_time).length,
        checkedOutToday,
        totalToday,
        withVehicles: visitors.filter(v => v.vehicle_number).length,
        withDocuments: visitors.filter(v => v.id_proof_number).length,
        overdueVisitors: statsRes?.data?.overstayed || 0,
        byPurpose: purposeCounts,
        peakHour: '10:00 AM',
        avgStay: Math.round(avgStay)
      });

      // Sort by entry time (most recent first)
      const sorted = [...visitors].sort((a, b) => 
        new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime()
      );
      setRecentVisitors(sorted.slice(0, isMobile ? 3 : 5));
      setLastUpdated(new Date());

    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isMobile]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadData]);

  const handleRefresh = () => {
    loadData(false);
    toast.success('Dashboard refreshed');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-gray-500"
          >
            Loading dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  const activeCount = stats.currentlyInside;

  return (
    <div className="min-h-screen bg-gray-50 pb-6 -mt-5">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-2 py-4 sm:py-6">
        
        {/* Mobile Header */}
        <MobileHeader 
          showStats={showStats}
          setShowStats={setShowStats}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          navigate={navigate}
        />

        {/* Desktop Header */}
        <DesktopHeader 
          showStats={showStats}
          setShowStats={setShowStats}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          navigate={navigate}
        />

        {/* Live Activity Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs sm:text-sm font-medium">Live Activity</span>
                </div>
                <div className="flex flex-wrap gap-3 sm:gap-6">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate('/admin/visitors/logs')}
                  >
                    <Users className="w-4 h-4 opacity-80" />
                    <span className="text-sm sm:text-base font-semibold">{activeCount} Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 opacity-80" />
                    <span className="text-sm sm:text-base font-semibold">Peak: {stats.peakHour}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 opacity-80" />
                    <span className="text-sm sm:text-base font-semibold">Avg Stay: {stats.avgStay} min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid - All cards have same height */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 sm:mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 auto-rows-fr">
                <div className="h-full">
                  <MetricCard
                    title="Total Visitors"
                    value={stats.totalVisitors}
                    icon={Users}
                    trend={12}
                    color="blue"
                    delay={0.1}
                    onClick={() => navigate('/admin/visitors/logs')}
                  />
                </div>
                <div className="h-full">
                  <MetricCard
                    title="Currently Inside"
                    value={stats.currentlyInside}
                    icon={LogIn}
                    trend={5}
                    color="green"
                    delay={0.2}
                  />
                </div>
                <div className="h-full">
                  <MetricCard
                    title="Checked Out Today"
                    value={stats.checkedOutToday}
                    icon={LogOut}
                    trend={8}
                    color="purple"
                    delay={0.3}
                    onClick={() => navigate('/admin/visitors/logs')}
                  />
                </div>
                <div className="h-full">
                  <MetricCard
                    title="Today's Total"
                    value={stats.totalToday}
                    icon={Calendar}
                    color="orange"
                    delay={0.4}
                    onClick={() => navigate('/admin/visitors/logs')}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Left Column - Purposes & Quick Stats */}
          <div className="space-y-4 sm:space-y-6">
            {/* Purposes Card */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Visit Purposes
                </h2>
                <PurposeList data={stats.byPurpose} />
              </CardContent>
            </Card>

            {/* Quick Stats Card - Mobile Grid */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <Card 
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/admin/visitors/logs')}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Car className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Vehicles</p>
                      <p className="text-sm font-bold">{stats.withVehicles}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/admin/visitors/logs')}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <FileText className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Documents</p>
                      <p className="text-sm font-bold">{stats.withDocuments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/admin/visitors/restrictions')}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-100 rounded-lg">
                      <AlertCircle className="w-3 h-3 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Overdue</p>
                      <p className="text-sm font-bold">{stats.overdueVisitors}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Clock className="w-3 h-3 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Avg Stay</p>
                      <p className="text-sm font-bold">{stats.avgStay}m</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Card - Desktop */}
            <Card className="hidden sm:block border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => navigate('/admin/visitors/logs')}
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Car className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Visitors with Vehicles</p>
                      <p className="text-xl font-bold">{stats.withVehicles}</p>
                    </div>
                  </div>
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => navigate('/admin/visitors/logs')}
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Document Verification</p>
                      <p className="text-xl font-bold">{stats.withDocuments}</p>
                    </div>
                  </div>
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => navigate('/admin/visitors/restrictions')}
                  >
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Overdue Visitors</p>
                      <p className="text-xl font-bold text-red-600">{stats.overdueVisitors}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Average Stay</p>
                      <p className="text-xl font-bold">{stats.avgStay} mins</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle & Right Column - Recent Visitors (spans 2 columns on desktop) */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <Users2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    Recent Visitors
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 text-xs sm:text-sm"
                    onClick={() => navigate('/admin/visitors/logs')}
                  >
                    View All <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar" style={{ maxHeight: '520px' }}>
                  {recentVisitors.length > 0 ? (
                    recentVisitors.map(visitor => (
                      <VisitorCard 
                        key={visitor.id} 
                        visitor={visitor} 
                        compact={isMobile}
                        onClick={() => navigate('/admin/visitors/logs')}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <Users2 className="w-12 h-12 mb-2 opacity-30" />
                      <p className="text-sm">No recent visitors</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions for Mobile */}
                {isMobile && (
                  <div className="mt-4 space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => navigate('/admin/visitors/logs')}
                    >
                      <FileText className="w-4 h-4" />
                      View All Logs
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => navigate('/admin/visitors/restrictions')}
                    >
                      <Shield className="w-4 h-4" />
                      Manage Restrictions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions - Desktop - All with proper redirects */}
        {!isMobile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <QuickAction
              to="/admin/visitors/logs"
              icon={FileText}
              title="View All Logs"
              description="Complete visitor history and records"
              color="from-blue-600 to-blue-700"
            />
            <QuickAction
              to="/admin/visitors/restrictions"
              icon={Shield}
              title="Restrictions"
              description="Manage blocked visitors and rules"
              color="from-purple-600 to-purple-700"
            />
            <QuickAction
              to="/admin/visitors/logs"
              icon={UserPlus}
              title="Quick Entry"
              description="Register new visitor instantly"
              color="from-green-600 to-green-800"
            />
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Data refreshes automatically every 30 seconds • Last updated: {lastUpdated.toLocaleString()}</p>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}