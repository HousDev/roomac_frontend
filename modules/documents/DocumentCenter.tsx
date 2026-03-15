// import { useState, useEffect } from 'react';
// import { FileText, Plus, LayoutGrid as Layout, FolderOpen, Share2, BarChart3, Clock } from 'lucide-react';
// // import { supabase } from '../../lib/supabase';

// interface DashboardStats {
//   totalTemplates: number;
//   totalDocuments: number;
//   pendingVerification: number;
//   completedDocuments: number;
//   recentActivity: number;
// }

// export function DocumentCenter() {
//   const [stats, setStats] = useState<DashboardStats>({
//     totalTemplates: 0,
//     totalDocuments: 0,
//     pendingVerification: 0,
//     completedDocuments: 0,
//     recentActivity: 0
//   });
//   const [loading, setLoading] = useState(true);
//   const [activeView, setActiveView] = useState<'dashboard' | 'templates' | 'documents'>('dashboard');

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const [templatesRes, documentsRes] = await Promise.all([
//         supabase.from('document_templates').select('id', { count: 'exact' }).eq('is_active', true),
//         supabase.from('documents').select('id, status, created_at', { count: 'exact' })
//       ]);

//       const documents = documentsRes.data || [];
//       const sevenDaysAgo = new Date();
//       sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//       setStats({
//         totalTemplates: templatesRes.count || 0,
//         totalDocuments: documentsRes.count || 0,
//         pendingVerification: documents.filter(d => d.status === 'Shared' || d.status === 'Viewed').length,
//         completedDocuments: documents.filter(d => d.status === 'Completed' || d.status === 'Verified').length,
//         recentActivity: documents.filter(d => new Date(d.created_at) > sevenDaysAgo).length
//       });
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const StatCard = ({ icon: Icon, label, value, color }: any) => (
//     <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:shadow-xl transition-shadow">
//       <div className="flex items-center gap-4">
//         <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
//           <Icon className="w-7 h-7 text-white" />
//         </div>
//         <div>
//           <p className="text-gray-600 text-sm font-semibold">{label}</p>
//           <p className="text-3xl font-black text-gray-900 mt-1">{loading ? '...' : value}</p>
//         </div>
//       </div>
//     </div>
//   );

//   const QuickActionCard = ({ icon: Icon, title, description, onClick, gradient }: any) => (
//     <button
//       onClick={onClick}
//       className={`w-full bg-gradient-to-r ${gradient} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left`}
//     >
//       <div className="flex items-start gap-4">
//         <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
//           <Icon className="w-6 h-6" />
//         </div>
//         <div>
//           <h3 className="text-xl font-black mb-1">{title}</h3>
//           <p className="text-sm text-white/90">{description}</p>
//         </div>
//       </div>
//     </button>
//   );

//   return (
//     <div className="flex flex-col h-full">
      

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
//         <StatCard
//           icon={Layout}
//           label="Active Templates"
//           value={stats.totalTemplates}
//           color="bg-gradient-to-r from-blue-600 to-cyan-600"
//         />
//         <StatCard
//           icon={FileText}
//           label="Total Documents"
//           value={stats.totalDocuments}
//           color="bg-gradient-to-r from-purple-600 to-pink-600"
//         />
//         <StatCard
//           icon={Clock}
//           label="Pending Verification"
//           value={stats.pendingVerification}
//           color="bg-gradient-to-r from-orange-500 to-red-500"
//         />
//         <StatCard
//           icon={BarChart3}
//           label="Completed"
//           value={stats.completedDocuments}
//           color="bg-gradient-to-r from-green-600 to-emerald-600"
//         />
//         <StatCard
//           icon={Share2}
//           label="Recent Activity (7d)"
//           value={stats.recentActivity}
//           color="bg-gradient-to-r from-indigo-600 to-blue-600"
//         />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//         <QuickActionCard
//           icon={Layout}
//           title="Manage Templates"
//           description="Create, edit, and organize document templates"
//           onClick={() => setActiveView('templates')}
//           gradient="from-blue-600 to-cyan-600"
//         />
//         <QuickActionCard
//           icon={Plus}
//           title="Create Document"
//           description="Generate new documents from templates"
//           onClick={() => setActiveView('documents')}
//           gradient="from-purple-600 to-pink-600"
//         />
//         <QuickActionCard
//           icon={FolderOpen}
//           title="View Documents"
//           description="Browse and manage all documents"
//           onClick={() => setActiveView('documents')}
//           gradient="from-green-600 to-emerald-600"
//         />
//       </div>

//       <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
//         <h2 className="text-xl font-black text-gray-900 mb-4">Available Document Types</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {[
//             'Occupancy / Leave & License Agreement',
//             'Tenant KYC Form',
//             'Tenant ID Proof Verification',
//             'Police Tenant Verification Form',
//             'Security Deposit Receipt',
//             'House Rules Acceptance Form',
//             'Move-In Inspection Form',
//             'Move-Out Inspection Form',
//             'Room / Property Inventory List',
//             'Tenant Undertaking / Declaration',
//             'Emergency Contact Details Form',
//             'Key / Access Card Handover Form',
//             'Visitor Policy Declaration',
//             'Rent Payment Terms & Policy',
//             'Roommate Replacement Form',
//             'Shared Occupancy Agreement',
//             'Couple Occupancy Declaration'
//           ].map((docType, idx) => (
//             <div
//               key={idx}
//               className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
//             >
//               <FileText className="w-5 h-5 text-blue-600" />
//               <span className="text-sm font-bold text-gray-700">{docType}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { 
  FileText, Plus, LayoutGrid as Layout, FolderOpen, 
  Share2, BarChart3, Clock, CheckCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listDocuments } from '../../lib/documentApi';
import { listTemplates, DocumentTemplate } from '../../lib/documentTemplateApi';

interface DashboardStats {
  totalTemplates: number;
  totalDocuments: number;
  pendingVerification: number;
  completedDocuments: number;
  recentActivity: number;
}

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
      // Fetch templates count
      const templatesRes = await listTemplates({ is_active: 'true' });
      
      // Fetch documents
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

  // Navigation handlers
  const handleManageTemplates = () => {
    navigate('/admin/document-center/templates');
  };

  const handleCreateDocument = () => {
    navigate('/admin/document-center/create');
  };

  const handleViewDocuments = () => {
    navigate('/admin/document-center/all');
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center bg-gradient-to-r ${color} shadow-md shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-gray-500 text-xs sm:text-sm font-semibold truncate">{label}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-0.5">
            {loading ? (
              <span className="inline-block w-12 h-6 sm:h-8 bg-gray-200 animate-pulse rounded"></span>
            ) : (
              value.toLocaleString()
            )}
          </p>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, title, description, onClick, gradient }: any) => (
    <button
      onClick={onClick}
      className={`w-full bg-gradient-to-r ${gradient} text-white rounded-xl p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-0.5 sm:mb-1 truncate">{title}</h3>
          <p className="text-xs sm:text-sm text-white/90 line-clamp-2">{description}</p>
        </div>
      </div>
    </button>
  );

  // Get template names, limit to 17 items (like your original list)
  const templateNames = templates
    .map(t => t.name)
    .filter(name => name) // Remove any empty names
    .slice(0, 17); // Limit to 17 items to match original layout

  // If we have fewer than 17 templates, add some default ones
  const displayNames = templateNames.length > 0 
    ? templateNames 
    : [
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
      ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-5 lg:mb-6">
        <StatCard
          icon={Layout}
          label="Templates"
          value={stats.totalTemplates}
          color="from-blue-600 to-cyan-600"
        />
        <StatCard
          icon={FileText}
          label="Documents"
          value={stats.totalDocuments}
          color="from-purple-600 to-pink-600"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pendingVerification}
          color="from-orange-500 to-red-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={stats.completedDocuments}
          color="from-green-600 to-emerald-600"
        />
        <StatCard
          icon={Share2}
          label="Recent (7d)"
          value={stats.recentActivity}
          color="from-indigo-600 to-blue-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-5 lg:mb-6">
        <QuickActionCard
          icon={Layout}
          title="Manage Templates"
          description="Create, edit, and organize document templates"
          onClick={handleManageTemplates}
          gradient="from-blue-600 to-cyan-600"
        />
        <QuickActionCard
          icon={Plus}
          title="Create Document"
          description="Generate new documents from templates"
          onClick={handleCreateDocument}
          gradient="from-purple-600 to-pink-600"
        />
        <QuickActionCard
          icon={FolderOpen}
          title="View Documents"
          description="Browse and manage all documents"
          onClick={handleViewDocuments}
          gradient="from-green-600 to-emerald-600"
        />
      </div>

      {/* Available Document Types - Now showing actual template names from API */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg border-2 border-gray-200">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
            Available Document Types
          </h2>
          <span className="text-xs sm:text-sm text-gray-500">
            {templateNames.length} templates
          </span>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {displayNames.map((docType, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors cursor-default"
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 line-clamp-2">
                  {docType}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}