import { useState, useEffect } from 'react';
import { 
  FileText, Plus, LayoutGrid as Layout, FolderOpen, 
  Share2, Clock, CheckCircle, TrendingUp, Package,
  IndianRupee, AlertCircle, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listDocuments } from '../../lib/documentApi';
import { listTemplates, DocumentTemplate } from '../../lib/documentTemplateApi';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalTemplates: number;
  totalDocuments: number;
  pendingVerification: number;
  completedDocuments: number;
  recentActivity: number;
}

// Stat Card - exactly like MaterialPurchase but with DocumentCenter colors
const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <Card className={`${bg} border-0 shadow-sm hover:shadow-md transition-shadow`}>
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
          <p className="text-sm sm:text-base font-bold text-slate-800 mt-0.5">
            {value}
          </p>
        </div>
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Quick Action Card - minimal like MaterialPurchase
const QuickActionCard = ({ icon: Icon, title, description, onClick, gradient }: any) => (
  <button
    onClick={onClick}
    className={`w-full bg-gradient-to-r ${gradient} rounded-lg p-4 hover:shadow-md transition-all hover:scale-[1.02] text-left`}
  >
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg bg-white/20`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white mb-0.5">{title}</h3>
        <p className="text-xs text-white/80 line-clamp-1">{description}</p>
      </div>
    </div>
  </button>
);

export function DocumentCenter() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalTemplates: 0,
    totalDocuments: 0,
    pendingVerification: 0,
    completedDocuments: 0,
    recentActivity: 0
  });
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchTemplates();
  }, []);

  const fetchStats = async () => {
    try {
      const templatesRes = await listTemplates({ is_active: 'true' });
      const documentsRes = await listDocuments({ pageSize: 1000 });

      const documents = documentsRes.data || [];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      setStats({
        totalTemplates: templatesRes.count || 0,
        totalDocuments: documentsRes.total || 0,
        pendingVerification: documents.filter(d => 
          d.status === 'Sent' || d.status === 'Viewed'
        ).length,
        completedDocuments: documents.filter(d => 
          d.status === 'Completed' || d.status === 'Signed'
        ).length,
        recentActivity: documents.filter(d => 
          new Date(d.created_at) > sevenDaysAgo
        ).length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await listTemplates();
      setTemplates(res.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageTemplates = () => navigate('/admin/document-center/templates');
  const handleCreateDocument = () => navigate('/admin/document-center/create');
  const handleViewDocuments = () => navigate('/admin/document-center/all');
  
  const handleTemplateClick = (templateId?: string, templateName?: string) => {
    if (templateId) {
      navigate(`/admin/document-center/create?templateId=${templateId}`);
    } else {
      navigate('/admin/document-center/create');
    }
  };

  const templateNames = templates
    .map(t => ({ id: t.id, name: t.name }))
    .filter(t => t.name)
    .slice(0, 17);

  const defaultTemplates = [
    { id: null, name: 'Occupancy / Leave & License Agreement' },
    { id: null, name: 'Tenant KYC Form' },
    { id: null, name: 'Tenant ID Proof Verification' },
    { id: null, name: 'Police Tenant Verification Form' },
    { id: null, name: 'Security Deposit Receipt' },
    { id: null, name: 'House Rules Acceptance Form' },
    { id: null, name: 'Move-In Inspection Form' },
    { id: null, name: 'Move-Out Inspection Form' },
    { id: null, name: 'Room / Property Inventory List' },
    { id: null, name: 'Tenant Undertaking / Declaration' },
    { id: null, name: 'Emergency Contact Details Form' },
    { id: null, name: 'Key / Access Card Handover Form' },
    { id: null, name: 'Visitor Policy Declaration' },
    { id: null, name: 'Rent Payment Terms & Policy' },
    { id: null, name: 'Roommate Replacement Form' },
    { id: null, name: 'Shared Occupancy Agreement' },
    { id: null, name: 'Couple Occupancy Declaration' }
  ];

  const displayTemplates = templateNames.length > 0 ? templateNames : defaultTemplates;

  return (
    <div className="bg-gray-50 min-h-screen p-0 sm:p-0 lg:p-0">
     

      {/* Stats Grid - exactly like MaterialPurchase */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-5 lg:mb-6">
        <StatCard
          title="Templates"
          value={stats.totalTemplates}
          icon={Layout}
          color="bg-blue-600"
          bg="bg-gradient-to-br from-blue-50 to-blue-100"
        />
        <StatCard
          title="Documents"
          value={stats.totalDocuments}
          icon={FileText}
          color="bg-purple-600"
          bg="bg-gradient-to-br from-purple-50 to-purple-100"
        />
        <StatCard
          title="Pending"
          value={stats.pendingVerification}
          icon={Clock}
          color="bg-orange-600"
          bg="bg-gradient-to-br from-orange-50 to-orange-100"
        />
        <StatCard
          title="Completed"
          value={stats.completedDocuments}
          icon={CheckCircle}
          color="bg-green-600"
          bg="bg-gradient-to-br from-green-50 to-green-100"
        />
        <StatCard
          title="Recent (7d)"
          value={stats.recentActivity}
          icon={TrendingUp}
          color="bg-indigo-600"
          bg="bg-gradient-to-br from-indigo-50 to-indigo-100"
        />
      </div>

      {/* Quick Actions - minimal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <QuickActionCard
          icon={Layout}
          title="Manage Templates"
          description="Create and edit document templates"
          onClick={handleManageTemplates}
          gradient="from-blue-600 to-blue-700"
        />
        <QuickActionCard
          icon={Plus}
          title="Create Document"
          description="Generate new documents"
          onClick={handleCreateDocument}
          gradient="from-purple-600 to-purple-700"
        />
        <QuickActionCard
          icon={FolderOpen}
          title="View Documents"
          description="Browse all documents"
          onClick={handleViewDocuments}
          gradient="from-green-600 to-green-800"
        />
      </div>

      {/* Document Types Section - compact like MaterialPurchase */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <h2 className="text-xs sm:text-sm font-semibold text-gray-700">
              Available Document Types
            </h2>
          </div>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {displayTemplates.length} templates
          </Badge>
        </div>

        <div className="p-2 sm:p-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-9 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {displayTemplates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTemplateClick(template.id, template.name)}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left w-full group"
                >
                  <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="text-xs text-gray-700 group-hover:text-gray-900 flex-1 line-clamp-1">
                    {template.name}
                  </span>
                  <Plus className="h-3 w-3 text-gray-400 group-hover:text-blue-600 shrink-0" />
                </button>
              ))}
            </div>
          )}
          
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Click template to create document
          </p>
        </div>
      </div>
    </div>
  );
}