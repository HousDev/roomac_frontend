import { useState, useEffect } from 'react';
import { FileText, Plus, LayoutGrid as Layout, FolderOpen, Share2, BarChart3, Clock } from 'lucide-react';
// import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalTemplates: number;
  totalDocuments: number;
  pendingVerification: number;
  completedDocuments: number;
  recentActivity: number;
}

export function DocumentCenter() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTemplates: 0,
    totalDocuments: 0,
    pendingVerification: 0,
    completedDocuments: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'templates' | 'documents'>('dashboard');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [templatesRes, documentsRes] = await Promise.all([
        supabase.from('document_templates').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('documents').select('id, status, created_at', { count: 'exact' })
      ]);

      const documents = documentsRes.data || [];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      setStats({
        totalTemplates: templatesRes.count || 0,
        totalDocuments: documentsRes.count || 0,
        pendingVerification: documents.filter(d => d.status === 'Shared' || d.status === 'Viewed').length,
        completedDocuments: documents.filter(d => d.status === 'Completed' || d.status === 'Verified').length,
        recentActivity: documents.filter(d => new Date(d.created_at) > sevenDaysAgo).length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="text-gray-600 text-sm font-semibold">{label}</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{loading ? '...' : value}</p>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, title, description, onClick, gradient }: any) => (
    <button
      onClick={onClick}
      className={`w-full bg-gradient-to-r ${gradient} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black mb-1">{title}</h3>
          <p className="text-sm text-white/90">{description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Document Center
            </h1>
            <p className="text-gray-600 font-semibold mt-1">
              Manage templates, create documents, and track sharing
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          icon={Layout}
          label="Active Templates"
          value={stats.totalTemplates}
          color="bg-gradient-to-r from-blue-600 to-cyan-600"
        />
        <StatCard
          icon={FileText}
          label="Total Documents"
          value={stats.totalDocuments}
          color="bg-gradient-to-r from-purple-600 to-pink-600"
        />
        <StatCard
          icon={Clock}
          label="Pending Verification"
          value={stats.pendingVerification}
          color="bg-gradient-to-r from-orange-500 to-red-500"
        />
        <StatCard
          icon={BarChart3}
          label="Completed"
          value={stats.completedDocuments}
          color="bg-gradient-to-r from-green-600 to-emerald-600"
        />
        <StatCard
          icon={Share2}
          label="Recent Activity (7d)"
          value={stats.recentActivity}
          color="bg-gradient-to-r from-indigo-600 to-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <QuickActionCard
          icon={Layout}
          title="Manage Templates"
          description="Create, edit, and organize document templates"
          onClick={() => setActiveView('templates')}
          gradient="from-blue-600 to-cyan-600"
        />
        <QuickActionCard
          icon={Plus}
          title="Create Document"
          description="Generate new documents from templates"
          onClick={() => setActiveView('documents')}
          gradient="from-purple-600 to-pink-600"
        />
        <QuickActionCard
          icon={FolderOpen}
          title="View Documents"
          description="Browse and manage all documents"
          onClick={() => setActiveView('documents')}
          gradient="from-green-600 to-emerald-600"
        />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
        <h2 className="text-xl font-black text-gray-900 mb-4">Available Document Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Occupancy / Leave & License Agreement',
            'Tenant KYC Form',
            'Tenant ID Proof Verification',
            'Police Tenant Verification Form',
            'Security Deposit Receipt',
            'House Rules Acceptance Form',
            'Move-In Inspection Form',
            'Move-Out Inspection Form',
            'Room / Property Inventory List',
            'Tenant Undertaking / Declaration',
            'Emergency Contact Details Form',
            'Key / Access Card Handover Form',
            'Visitor Policy Declaration',
            'Rent Payment Terms & Policy',
            'Roommate Replacement Form',
            'Shared Occupancy Agreement',
            'Couple Occupancy Declaration'
          ].map((docType, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
            >
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold text-gray-700">{docType}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
