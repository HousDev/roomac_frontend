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

// ============== Metric Card ==============
const MetricCard = ({ title, value, icon: Icon, trend, color, delay = 0, onClick }: any) => {
  const colors: any = {
    blue:   { gradient: 'from-blue-500 to-blue-600' },
    green:  { gradient: 'from-green-500 to-emerald-600' },
    purple: { gradient: 'from-purple-500 to-purple-600' },
    orange: { gradient: 'from-orange-500 to-orange-600' },
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
                className={`${trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} border-0 text-xs font-medium`}
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
          {trend && <p className="text-xs text-gray-400 mt-2">vs last month</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============== Purpose List ==============
const PurposeList = ({ data }: { data: { [key: string]: number } }) => {
  const purposes = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 5);
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
            <span className="font-medium text-gray-700 truncate max-w-[120px] sm:max-w-none">{purpose}</span>
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
            {new Date(visitor.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <LogOut className="w-3 h-3 text-gray-400" />
          <span className="text-gray-600">
            {visitor.exit_time
              ? new Date(visitor.exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '—'}
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

// ============== Quick Action ==============
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
const MobileHeader = ({ showStats, setShowStats, lastUpdated, onRefresh, isRefreshing, navigate }: any) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="lg:hidden mb-4 -mt-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-blue-600 text-white text-xs">
              <Zap className="w-3 h-3 mr-1" /> LIVE
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isRefreshing} className="h-9 w-9">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="h-9 w-9">
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
            <Button variant="outline" onClick={() => setShowStats(!showStats)} className="w-full justify-start gap-2">
              {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </Button>
            <Button onClick={() => { setMenuOpen(false); navigate('/admin/visitors/new-entry'); }} className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
              <UserPlus className="w-4 h-4" /> New Entry
            </Button>
            <Button onClick={() => { setMenuOpen(false); navigate('/admin/visitors/logs'); }} variant="outline" className="w-full justify-start gap-2">
              <FileText className="w-4 h-4" /> View Logs
            </Button>
            <Button onClick={() => { setMenuOpen(false); navigate('/admin/visitors/restrictions'); }} variant="outline" className="w-full justify-start gap-2">
              <Shield className="w-4 h-4" /> Restrictions
            </Button>
            <p className="text-xs text-gray-400 text-center pt-2">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============== Desktop Header ==============
const DesktopHeader = ({ showStats, setShowStats, lastUpdated, onRefresh, isRefreshing }: any) => (
  <div className="hidden lg:flex items-center justify-between mb-4 -mt-8">
    <div>
      <Badge variant="outline" className="mb-1">
        Updated {lastUpdated.toLocaleTimeString()}
      </Badge>
    </div>
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing} className="gap-2">
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)} className="gap-2">
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
    avgStay: 0,
  });

  const [recentVisitors, setRecentVisitors] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setIsRefreshing(true);

    try {
      const [statsRes, visitorsRes] = await Promise.all([
        getVisitorStats(),
        getVisitors({ limit: 10 }),
      ]);

      const visitors = visitorsRes?.data || [];

      const purposeCounts: { [key: string]: number } = {};
      visitors.forEach((v: VisitorLog) => {
        if (v.purpose) purposeCounts[v.purpose] = (purposeCounts[v.purpose] || 0) + 1;
      });

      const today = new Date().toDateString();
      const checkedOutToday = visitors.filter(v => v.exit_time && new Date(v.exit_time).toDateString() === today).length;
      const totalToday = visitors.filter(v => new Date(v.entry_time).toDateString() === today).length;

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
        avgStay: Math.round(avgStay),
      });

      const sorted = [...visitors].sort((a, b) => new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime());
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
    const interval = setInterval(() => loadData(false), 30000);
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
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4" />
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="text-gray-500">
            Loading dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  const activeCount = stats.currentlyInside;

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="max-w-8xl mx-auto px-0 sm:px-0 lg:px-0 py-4 sm:py-6">

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
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/admin/visitors/logs')}>
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

        {/* Stats Grid */}
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
                  <MetricCard title="Total Visitors" value={stats.totalVisitors} icon={Users} trend={12} color="blue" delay={0.1} onClick={() => navigate('/admin/visitors/logs')} />
                </div>
                <div className="h-full">
                  <MetricCard title="Currently Inside" value={stats.currentlyInside} icon={LogIn} trend={5} color="green" delay={0.2} />
                </div>
                <div className="h-full">
                  <MetricCard title="Checked Out Today" value={stats.checkedOutToday} icon={LogOut} trend={8} color="purple" delay={0.3} onClick={() => navigate('/admin/visitors/logs')} />
                </div>
                <div className="h-full">
                  <MetricCard title="Today's Total" value={stats.totalToday} icon={Calendar} color="orange" delay={0.4} onClick={() => navigate('/admin/visitors/logs')} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Purposes */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Visit Purposes
                </h2>
                <PurposeList data={stats.byPurpose} />
              </CardContent>
            </Card>

            {/* Quick Stats - Mobile */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/visitors/logs')}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg"><Car className="w-3 h-3 text-blue-600" /></div>
                    <div><p className="text-xs text-gray-500">Vehicles</p><p className="text-sm font-bold">{stats.withVehicles}</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/visitors/logs')}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg"><FileText className="w-3 h-3 text-green-600" /></div>
                    <div><p className="text-xs text-gray-500">Documents</p><p className="text-sm font-bold">{stats.withDocuments}</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/visitors/restrictions')}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-100 rounded-lg"><AlertCircle className="w-3 h-3 text-red-600" /></div>
                    <div><p className="text-xs text-gray-500">Overdue</p><p className="text-sm font-bold">{stats.overdueVisitors}</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg"><Clock className="w-3 h-3 text-purple-600" /></div>
                    <div><p className="text-xs text-gray-500">Avg Stay</p><p className="text-sm font-bold">{stats.avgStay}m</p></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats - Desktop */}
            <Card className="hidden sm:block border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => navigate('/admin/visitors/logs')}>
                    <div className="p-2 bg-blue-100 rounded-lg"><Car className="w-4 h-4 text-blue-600" /></div>
                    <div className="flex-1"><p className="text-sm text-gray-500">Visitors with Vehicles</p><p className="text-xl font-bold">{stats.withVehicles}</p></div>
                  </div>
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => navigate('/admin/visitors/logs')}>
                    <div className="p-2 bg-green-100 rounded-lg"><FileText className="w-4 h-4 text-green-600" /></div>
                    <div className="flex-1"><p className="text-sm text-gray-500">Document Verification</p><p className="text-xl font-bold">{stats.withDocuments}</p></div>
                  </div>
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => navigate('/admin/visitors/restrictions')}>
                    <div className="p-2 bg-red-100 rounded-lg"><AlertCircle className="w-4 h-4 text-red-600" /></div>
                    <div className="flex-1"><p className="text-sm text-gray-500">Overdue Visitors</p><p className="text-xl font-bold text-red-600">{stats.overdueVisitors}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg"><Clock className="w-4 h-4 text-purple-600" /></div>
                    <div className="flex-1"><p className="text-sm text-gray-500">Average Stay</p><p className="text-xl font-bold">{stats.avgStay} mins</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Recent Visitors (spans 2 cols) */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <Users2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    Recent Visitors
                  </h2>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm" onClick={() => navigate('/admin/visitors/logs')}>
                    View All <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar" style={{ maxHeight: '520px' }}>
                  {recentVisitors.length > 0 ? (
                    recentVisitors.map(visitor => (
                      <VisitorCard key={visitor.id} visitor={visitor} compact={isMobile} onClick={() => navigate('/admin/visitors/logs')} />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <Users2 className="w-12 h-12 mb-2 opacity-30" />
                      <p className="text-sm">No recent visitors</p>
                    </div>
                  )}
                </div>

                {isMobile && (
                  <div className="mt-4 space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/admin/visitors/logs')}>
                      <FileText className="w-4 h-4" /> View All Logs
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/admin/visitors/restrictions')}>
                      <Shield className="w-4 h-4" /> Manage Restrictions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions - Desktop */}
        {!isMobile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <QuickAction to="/admin/visitors/logs" icon={FileText} title="View All Logs" description="Complete visitor history and records" color="from-blue-600 to-blue-700" />
            <QuickAction to="/admin/visitors/restrictions" icon={Shield} title="Restrictions" description="Manage blocked visitors and rules" color="from-purple-600 to-purple-700" />
            <QuickAction to="/admin/visitors/logs" icon={UserPlus} title="Quick Entry" description="Register new visitor instantly" color="from-green-600 to-green-800" />
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Data refreshes automatically every 30 seconds • Last updated: {lastUpdated.toLocaleString()}</p>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
  );
}