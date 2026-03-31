import { useState, useEffect } from 'react';
import { 
  FileText, Plus, LayoutGrid as Layout, FolderOpen, 
  Share2, Clock, CheckCircle, TrendingUp, Package,
  IndianRupee, AlertCircle, Shield, FileCheck,
  FileSignature, FileSpreadsheet, FileBadge,
  FileSearch, FileKey, FileClock, Home,
  UserCheck, Key, ClipboardList, Users,
  CreditCard, Handshake, FileCog
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listDocuments } from '../../lib/documentApi';
import { listTemplates, DocumentTemplate } from '../../lib/documentTemplateApi';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/authContext';

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
    <CardContent className="p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">{title}</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 mt-1">
            {value}
          </p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${color} shadow-sm`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Quick Action Card - lighter colors with better contrast
const QuickActionCard = ({ icon: Icon, title, description, onClick, gradient, lightColor }: any) => (
  <button
    onClick={onClick}
    className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all hover:border-gray-300 hover:scale-[1.01] text-left group"
  >
    <div className="flex items-start gap-3">
      <div className={`p-2.5 rounded-xl ${lightColor} group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5 text-gray-700" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-0.5">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">{description}</p>
      </div>
      <div className="text-gray-400 group-hover:text-gray-600">
        <Plus className="h-4 w-4" />
      </div>
    </div>
  </button>
);

// Document Type Card - new card design for templates
const DocumentTypeCard = ({ template, onClick, icon: Icon }: any) => (
  <button
    onClick={() => onClick(template.id, template.name)}
    className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all hover:border-blue-200 hover:bg-blue-50/30 w-full text-left group"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
          {template.name}
        </p>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
          Click to create document
        </p>
      </div>
      <Plus className="h-4 w-4 text-gray-400 group-hover:text-blue-600 shrink-0" />
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
    const { can } = useAuth(); // ← ADD THIS


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

  // Map of template names to icons for visual variety
  const getTemplateIcon = (name: string) => {
    const iconMap: { [key: string]: any } = {
      'Occupancy': Home,
      'Leave': Home,
      'License': Home,
      'KYC': UserCheck,
      'ID Proof': FileBadge,
      'Police': Shield,
      'Security Deposit': CreditCard,
      'House Rules': FileCheck,
      'Move-In': ClipboardList,
      'Move-Out': ClipboardList,
      'Inventory': Package,
      'Undertaking': FileSignature,
      'Emergency': Clock,
      'Key': Key,
      'Visitor': Users,
      'Rent Payment': IndianRupee,
      'Roommate': Users,
      'Shared': Handshake,
      'Couple': Users
    };
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) return icon;
    }
    return FileText;
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
    

      {/* Stats Grid - responsive with better spacing */}
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

      {/* Quick Actions - lighter colors, responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {can("manage_document_templates") && (
          <QuickActionCard
            icon={Layout}
            title="Manage Templates"
            description="Create, edit and organize document templates"
            onClick={handleManageTemplates}
            lightColor="bg-blue-100 text-blue-700"
          />
        )}
        {can("create_documents") && (
          <QuickActionCard
            icon={Plus}
            title="Create Document"
            description="Generate new documents from templates"
            onClick={handleCreateDocument}
            lightColor="bg-purple-100 text-purple-700"
          />
        )}
        {can("view_documents") && (
          <QuickActionCard
            icon={FolderOpen}
            title="View Documents"
            description="Browse and manage all documents"
            onClick={handleViewDocuments}
            lightColor="bg-green-100 text-green-700"
          />
        )}
      </div>

      {/* Document Types Section - with card design */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-white">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <h2 className="text-sm sm:text-base font-semibold text-gray-800">
              Available Document Types
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700">
              {displayTemplates.length} templates
            </Badge>
            <button 
              onClick={handleCreateDocument}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              New
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayTemplates.map((template, idx) => (
                  <DocumentTypeCard
                    key={idx}
                    template={template}
                    onClick={handleTemplateClick}
                    icon={getTemplateIcon(template.name)}
                  />
                ))}
              </div>
              
              {displayTemplates.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-4">No templates available</p>
                  <button
                    onClick={handleManageTemplates}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Create Template
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Recently Used Section - optional */}
      {displayTemplates.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 border-b bg-white">
            <h2 className="text-sm sm:text-base font-semibold text-gray-800">
              Recently Used Templates
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {displayTemplates.slice(0, 5).map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTemplateClick(template.id, template.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-full text-xs text-gray-700 hover:text-blue-700 transition-colors"
                >
                  <FileText className="h-3 w-3" />
                  {template.name.length > 25 ? template.name.substring(0, 25) + '...' : template.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}