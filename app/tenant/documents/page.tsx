// app/tenant/documents/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Eye,
  Download,
  Printer,
  Calendar,
  Building,
  User,
  Phone,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  Home,
  Hash,
  IndianRupee,
  BadgeCheck,
  X,
  Sparkles,
  Shield,
  PenLine,
  File,
  FileImage,
  FileSpreadsheet,
  FileText as FileTextIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  getTenantDocuments,
  getTenantDocument,
  viewTenantDocument,
  type Document,
  type DocumentStatus,
} from "@/lib/documentlistApi";

// ── Status Badge Component (Compact) ─────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: DocumentStatus }) => {
  const statusConfig: Record<DocumentStatus, { color: string; icon: any; label: string }> = {
    'Created': { color: 'bg-slate-100 text-slate-700', icon: FileText, label: 'Created' },
    'Sent': { color: 'bg-blue-100 text-blue-700', icon: FileText, label: 'Sent' },
    'Viewed': { color: 'bg-purple-100 text-purple-700', icon: Eye, label: 'Viewed' },
    'Signed': { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Signed' },
    'Completed': { color: 'bg-emerald-100 text-emerald-700', icon: BadgeCheck, label: 'Completed' },
    'Expired': { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Expired' },
    'Cancelled': { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'Cancelled' },
  };

  const config = statusConfig[status] || statusConfig.Created;
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} border-none flex items-center gap-0.5 px-1.5 py-0.5 text-[9px]`}>
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </Badge>
  );
};

// ── Priority Badge ─────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityColor = (p: string) => {
    switch (p) {
      case "urgent": return "bg-red-100 text-red-700 border-red-200";
      case "high":   return "bg-orange-100 text-orange-700 border-orange-200";
      case "normal": return "bg-blue-100 text-blue-700 border-blue-200";
      case "low":    return "bg-gray-100 text-gray-500 border-gray-200";
      default:       return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <Badge className={`text-[8px] px-1 py-0 border ${priorityColor(priority)}`}>
      {priority}
    </Badge>
  );
};

// ── Stat Card Component (Compact) ────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <Card className={`${bg} border-0 shadow-sm hover:shadow-md transition-shadow`}>
    <CardContent className="p-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] text-slate-600 font-medium">{title}</p>
          <p className="text-sm font-bold text-slate-800">{value}</p>
        </div>
        <div className={`p-1.5 rounded-lg ${color} shadow-lg`}>
          <Icon className="h-3 w-3 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ── Document Type Icon (Compact) ─────────────────────────────────────────────────────
const DocumentTypeIcon = ({ document }: { document: Document }) => {
  const title = (document.document_title || document.document_name || '').toLowerCase();
  const type = document.document_type?.toLowerCase() || '';
  
  if (title.includes('aadhaar') || title.includes('aadhar') || type.includes('aadhaar')) {
    return (
      <div className="w-full h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-t-lg flex items-center justify-center">
        <div className="text-center">
          <FileImage className="h-5 w-5 text-orange-600 mx-auto mb-0.5" />
          <p className="text-[6px] font-medium text-orange-700">AADHAAR</p>
        </div>
      </div>
    );
  }
  
  if (title.includes('pan') || type.includes('pan')) {
    return (
      <div className="w-full h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-t-lg flex items-center justify-center">
        <div className="text-center">
          <FileImage className="h-5 w-5 text-yellow-600 mx-auto mb-0.5" />
          <p className="text-[6px] font-medium text-yellow-700">PAN</p>
        </div>
      </div>
    );
  }
  
  if (title.includes('rent') || title.includes('receipt') || type.includes('receipt')) {
    return (
      <div className="w-full h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-t-lg flex items-center justify-center">
        <div className="text-center">
          <FileTextIcon className="h-5 w-5 text-green-600 mx-auto mb-0.5" />
          <p className="text-[6px] font-medium text-green-700">RENT</p>
        </div>
      </div>
    );
  }
  
  if (title.includes('agreement') || title.includes('contract') || type.includes('agreement')) {
    return (
      <div className="w-full h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-5 w-5 text-blue-600 mx-auto mb-0.5" />
          <p className="text-[6px] font-medium text-blue-700">AGREEMENT</p>
        </div>
      </div>
    );
  }
  
  if (title.includes('pdf') || document.html_content?.includes('pdf')) {
    return (
      <div className="w-full h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-t-lg flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-5 w-5 text-red-600 mx-auto mb-0.5" />
          <p className="text-[6px] font-medium text-red-700">PDF</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
      <div className="text-center">
        <File className="h-5 w-5 text-gray-600 mx-auto mb-0.5" />
        <p className="text-[6px] font-medium text-gray-700">DOC</p>
      </div>
    </div>
  );
};

// ── Document Card Component (Compact) ─────────────────────────────────────────────────
const DocumentCard = ({ 
  document, 
  onClick,
}: { 
  document: Document; 
  onClick: (doc: Document) => void;
}) => {
  const fmt = (d?: string | null) => {
    if (!d) return "N/A";
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return "N/A";
      return dt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
    } catch { return "N/A"; }
  };

  const getDescription = () => {
    if (document.document_type) {
      return `${document.document_type} document`;
    }
    if (document.data_json && Object.keys(document.data_json).length > 0) {
      const keys = Object.keys(document.data_json);
      return `Includes ${keys.slice(0, 2).join(', ')}${keys.length > 2 ? '...' : ''}`;
    }
    return "Document details available";
  };

  return (
    <div 
      className="rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all cursor-pointer overflow-hidden"
      onClick={() => onClick(document)}
    >
      {/* Thumbnail Preview - Compact */}
      <DocumentTypeIcon document={document} />
      
      {/* Content - Compact */}
      <div className="p-2">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-[11px] text-slate-800 line-clamp-1 flex-1">
            {document.document_title || document.document_name}
          </h3>
        </div>

        <p className="text-[9px] text-slate-500 mb-1.5 line-clamp-1">
          {document.notes || getDescription()}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[9px] text-slate-400">
            <Calendar className="h-2.5 w-2.5" />
            {fmt(document.created_at)}
          </div>
          <StatusBadge status={document.status} />
        </div>
      </div>
    </div>
  );
};

// ── Preview Dialog Component ───────────────────────────────────────────────
function PreviewDialog({ 
  document, 
  open, 
  onOpenChange,
}: { 
  document: Document | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [fullDocument, setFullDocument] = useState<Document | null>(document);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && document?.id) {
      fetchFullDocument(document.id);
    }
  }, [open, document?.id]);

  const fetchFullDocument = async (id: number) => {
    setLoading(true);
    try {
      const result = await getTenantDocument(id);
      if (result.success && result.data) {
        setFullDocument(result.data);
        
        if (result.data.status === 'Sent') {
          await viewTenantDocument(id);
          const refreshed = await getTenantDocument(id);
          if (refreshed.success && refreshed.data) {
            setFullDocument(refreshed.data);
          }
        }
      } else {
        toast.error(result.message || 'Failed to load document');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to load document details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!fullDocument?.html_content) {
      toast.error("No content to download");
      return;
    }
    
    const pw = window.open("", "_blank", "width=900,height=700");
    if (!pw) {
      toast.error("Popup blocked");
      return;
    }
    
    pw.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8"/>
          <title>${fullDocument.document_number}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            @media print {
              @page { size: A4; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          ${fullDocument.html_content}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    pw.document.close();
  };

  const handlePrint = () => {
    if (!fullDocument?.html_content) {
      toast.error("No content to print");
      return;
    }
    
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`
        <html>
          <head>
            <title>${fullDocument.document_name}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              @media print { @page { size: A4; margin: 10mm; } }
            </style>
          </head>
          <body>${fullDocument.html_content}</body>
        </html>
      `);
      w.document.close();
      w.focus();
      w.print();
    }
  };

  if (!fullDocument) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <div>
              <h2 className="text-sm font-semibold">{fullDocument.document_title || fullDocument.document_name}</h2>
              <p className="text-xs text-blue-100">{fullDocument.document_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </button>
            <DialogClose asChild>
              <button className="p-1.5 rounded-full hover:bg-white/20">
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>
        </div>

        {/* Document Info */}
        <div className="px-4 py-3 bg-gray-50 border-b">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-gray-400">Tenant</p>
              <p className="font-medium text-gray-800">{fullDocument.tenant_name}</p>
            </div>
            <div>
              <p className="text-gray-400">Phone</p>
              <p className="font-medium text-gray-800">{fullDocument.tenant_phone}</p>
            </div>
            {fullDocument.property_name && (
              <div>
                <p className="text-gray-400">Property</p>
                <p className="font-medium text-gray-800">{fullDocument.property_name}</p>
              </div>
            )}
            {fullDocument.room_number && (
              <div>
                <p className="text-gray-400">Room</p>
                <p className="font-medium text-gray-800">
                  {fullDocument.room_number}
                  {fullDocument.bed_number && ` • Bed ${fullDocument.bed_number}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Document Content */}
        <div className="overflow-y-auto p-4 bg-slate-50" style={{ maxHeight: "calc(90vh - 160px)" }}>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : fullDocument.html_content ? (
            <div 
              className="bg-white rounded-lg shadow p-6 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: fullDocument.html_content }} 
            />
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No document content available</p>
              <p className="text-xs text-gray-400 mt-1">The document content is empty or not generated yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function TenantDocumentsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {
        page: 1,
        pageSize: 100,
      };
      
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (search) filters.search = search;

      const response = await getTenantDocuments(filters);
      
      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        d.document_number?.toLowerCase().includes(searchLower) ||
        d.document_name?.toLowerCase().includes(searchLower) ||
        d.document_title?.toLowerCase().includes(searchLower) ||
        d.tenant_name?.toLowerCase().includes(searchLower) ||
        d.property_name?.toLowerCase().includes(searchLower)
      );
    });
  }, [documents, search]);

  const stats = useMemo(() => ({
    total: documents.length,
    signed: documents.filter(d => d.status === 'Signed' || d.status === 'Completed').length,
    pending: documents.filter(d => d.status === 'Sent' || d.status === 'Viewed').length,
  }), [documents]);

  const handleCardClick = (doc: Document) => {
    setSelectedDocument(doc);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/tenant/portal#dashboard')}
              className="h-8 w-8 text-slate-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">My Documents</h1>
              <p className="text-[10px] text-slate-500">View and download your documents</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDocuments}
            className="h-7 text-[10px]"
          >
            <Loader2 className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards - Compact */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard 
            title="Total"  
            value={stats.total}     
            icon={FileText}    
            color="bg-blue-600"    
            bg="bg-gradient-to-br from-blue-50 to-blue-100" 
          />
          <StatCard 
            title="Signed"          
            value={stats.signed}   
            icon={CheckCircle} 
            color="bg-green-600"   
            bg="bg-gradient-to-br from-green-50 to-green-100" 
          />
          <StatCard 
            title="Pending"         
            value={stats.pending}  
            icon={Clock}       
            color="bg-yellow-600"  
            bg="bg-gradient-to-br from-yellow-50 to-yellow-100" 
          />
        </div>

        {/* Search and Filter */}
        <Card className="border-slate-200">
          <CardContent className="p-2.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[110px] h-8 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Created">Created</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Viewed">Viewed</SelectItem>
                  <SelectItem value="Signed">Signed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid - More columns, compact cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredDocs.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-slate-800 mb-1">No documents found</h3>
              <p className="text-xs text-slate-500">
                {search || statusFilter !== 'all' 
                  ? 'No documents match your filters' 
                  : "You don't have any documents yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {filteredDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}

        {/* Preview Dialog */}
        <PreviewDialog
          document={selectedDocument}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      </div>
    </div>
  );
}