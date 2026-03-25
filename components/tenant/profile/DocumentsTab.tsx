





// components/tenant/profile/DocumentsTab.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, FileText, MapPin, Shield, 
  Download, Eye, Upload, Camera,
  IdCard, Home, FileCheck, Clock,
  CheckCircle2, AlertCircle, File,
  FileImage, Loader2, RefreshCw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TenantProfile, AdditionalDocument } from '@/lib/tenantDetailsApi';
import { tenantDetailsApi } from '@/lib/tenantDetailsApi';
import { useEffect, useState } from 'react';

interface DocumentsTabProps {
  profile: TenantProfile;
  onDocumentClick: (docData: any) => void;
  getDocumentUrl: (url: string) => string;
  isMobile?: boolean;
}

// Document Card Component for Additional Documents
const DocumentCard = ({ 
  doc, 
  index, 
  isMobile, 
  onView, 
  onDownload 
}: { 
  doc: AdditionalDocument; 
  index: number; 
  isMobile: boolean; 
  onView: () => void; 
  onDownload: () => void;
}) => {
  const filename = doc.filename || `Document ${index + 1}`;
  const fileExtension = filename.split('.').pop()?.toLowerCase() || 'file';
  const isPDF = fileExtension === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);

  const getIcon = () => {
    if (isPDF) return <FileText className="h-4 w-4 text-rose-500" />;
    if (isImage) return <FileImage className="h-4 w-4 text-emerald-500" />;
    return <File className="h-4 w-4 text-[#004aad]" />;
  };

  // Get document type from doc object or determine from filename
  const getDocumentType = () => {
    if (doc.document_type) return doc.document_type;
    
    // Try to determine from filename
    const lowerFilename = filename.toLowerCase();
    if (lowerFilename.includes('aadhar') || lowerFilename.includes('aadhaar')) return 'Aadhar Card';
    if (lowerFilename.includes('pan')) return 'PAN Card';
    if (lowerFilename.includes('license') || lowerFilename.includes('driving')) return 'Driving License';
    if (lowerFilename.includes('passport')) return 'Passport';
    if (lowerFilename.includes('voter')) return 'Voter ID';
    if (lowerFilename.includes('bill') || lowerFilename.includes('utility')) return 'Utility Bill';
    if (lowerFilename.includes('rent') || lowerFilename.includes('agreement')) return 'Rental Agreement';
    if (lowerFilename.includes('bank') || lowerFilename.includes('statement')) return 'Bank Statement';
    
    return 'Additional Document';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 group">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-slate-800 truncate">{filename}</p>
              {isPDF && (
                <Badge className="bg-rose-50 text-rose-600 border-none text-[8px] px-1.5 py-0">
                  PDF
                </Badge>
              )}
            </div>
            
            <Badge variant="outline" className="text-[10px] border-[#004aad]/20 text-[#004aad] bg-[#e6f0ff] px-2 py-0 mb-2">
              {getDocumentType()}
            </Badge>
            
            {doc.uploaded_at && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Clock className="h-3 w-3" />
                <span>Uploaded: {format(parseISO(doc.uploaded_at), "dd MMM yyyy")}</span>
              </div>
            )}
          </div>
        </div>

        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 mt-4`}>
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className={`flex-1 border-slate-200 hover:border-[#004aad] hover:bg-[#e6f0ff]  hover:text-black transition-colors ${isMobile ? 'w-full' : ''}`}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5 text-[#004aad]" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className={`flex-1 border-slate-200 hover:border-[#ffc107] hover:bg-[#fff9e6] hover:text-black transition-colors ${isMobile ? 'w-full' : ''}`}
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-[#ffc107]" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: 'available' | 'required' | 'pending' }) => {
  const config = {
    available: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      icon: CheckCircle2,
      label: 'Available'
    },
    required: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      icon: AlertCircle,
      label: 'Required'
    },
    pending: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      icon: Clock,
      label: 'Pending'
    }
  };

  const { bg, text, border, icon: Icon, label } = config[status];

  return (
    <Badge className={`${bg} ${text} ${border} border text-[10px] px-2 py-0.5 font-medium`}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
};

// Document Header Component
const DocumentHeader = ({ icon: Icon, title, description, status }: { 
  icon: any; 
  title: string; 
  description: string;
  status?: 'available' | 'required' | 'pending';
}) => (
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-3">
      <div className="p-2.5 bg-gradient-to-br from-[#e6f0ff] to-[#f0f5ff] rounded-xl">
        <Icon className="h-4 w-4 text-[#004aad]" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
    {status && <StatusBadge status={status} />}
  </div>
);

export default function DocumentsTab({ 
  profile, 
  onDocumentClick, 
  getDocumentUrl, 
  isMobile = false 
}: DocumentsTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [additionalDocs, setAdditionalDocs] = useState<AdditionalDocument[]>([]);
  const [apiResponseRaw, setApiResponseRaw] = useState<any>(null);

  // Fetch documents from API
  const fetchDocuments = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await tenantDetailsApi.getDocuments();
      // Handle the response based on your API structure
      if (response?.success === true) {
        // Case 1: { success: true, data: [...] }
        if (Array.isArray(response.data)) {
          setAdditionalDocs(response.data);
        } 
        // Case 2: { success: true, data: { additional_documents: [...] } }
        else if (response.data?.additional_documents && Array.isArray(response.data.additional_documents)) {
          setAdditionalDocs(response.data.additional_documents);
        }
        else {
          setAdditionalDocs([]);
        }
      } 
      // Case 3: Response is directly an array
      else if (Array.isArray(response)) {
        setAdditionalDocs(response);
      }
      // Case 4: Response has data property that's an array
      else if (response?.data && Array.isArray(response.data)) {
        setAdditionalDocs(response.data);
      }
      else {
        // Fallback to profile data
        if (profile.additional_documents && Array.isArray(profile.additional_documents)) {
          setAdditionalDocs(profile.additional_documents);
        } else {
          setAdditionalDocs([]);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching documents:', err);
      setError('Failed to load documents. Please try again.');
      
      // Fallback to profile data on error
      if (profile.additional_documents && Array.isArray(profile.additional_documents)) {
        setAdditionalDocs(profile.additional_documents);
      } else {
        setAdditionalDocs([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Also update when profile changes
  useEffect(() => {
    if (profile?.additional_documents && Array.isArray(profile.additional_documents)) {
      setAdditionalDocs(profile.additional_documents);
    }
  }, [profile]);

  const handleViewDocument = (url: string, title: string, filename: string) => {
    const fullUrl = getDocumentUrl(url);
    const extension = filename.split('.').pop()?.toLowerCase();
    const isPDF = extension === 'pdf';
    
    onDocumentClick({
      open: true,
      url: fullUrl,
      title: title,
      type: isPDF ? 'pdf' : 'image',
      downloadName: filename
    });
  };

  const handleDownloadDocument = (url: string, filename: string) => {
    const fullUrl = getDocumentUrl(url);
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = filename;
    link.click();
  };


  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 bg-[#e6f0ff] rounded-2xl mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#004aad]" />
        </div>
        <span className="text-sm font-medium text-slate-600">Loading your documents...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isMobile ? 'pb-4' : 'pb-6'}`}>
      
     

      {/* Debug Info - Remove in production */}
     

      {/* ID Proof Card - Redesigned with theme colors */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className={`${isMobile ? 'px-4 py-3' : 'px-6 pt-5'} bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#004aad] to-[#002a7a] rounded-xl shadow-md">
                <IdCard className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Identity Proof</h3>
                <p className="text-xs text-slate-400 mt-0.5">Government issued ID document</p>
              </div>
            </div>
            <StatusBadge status={profile.id_proof_url ? 'available' : 'required'} />
          </div>
        </CardHeader>
        <CardContent className={`${isMobile ? 'px-4 py-4' : 'p-6'}`}>
          {profile.id_proof_url ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] rounded-xl p-4 border border-[#004aad]/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FileText className="h-5 w-5 text-[#004aad]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#004aad] mb-1">Document Details</p>
                    <p className="text-xs text-slate-600 break-all font-mono bg-white p-2 rounded-lg border border-slate-100">
                      {profile.id_proof_url.split('/').pop()}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className="bg-green-50 text-green-600 border-green-200 text-[10px]">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                      <Badge className="bg-[#e6f0ff] text-[#004aad] border-[#004aad]/20 text-[10px]">
                        Government ID
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3`}>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => handleViewDocument(
                    profile.id_proof_url,
                    "ID Proof Document",
                    `id-proof-${profile.full_name}.${profile.id_proof_url.split('.').pop()}`
                  )}
                  className="flex-1 border-[#004aad]/20 hover:border-[#004aad] hover:bg-[#e6f0ff] hover:text-black transition-colors"
                >
                  <Eye className="mr-2 h-4 w-4 text-[#004aad]" />
                  View Document
                </Button>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => handleDownloadDocument(
                    profile.id_proof_url,
                    `id-proof-${profile.full_name}.${profile.id_proof_url.split('.').pop()}`
                  )}
                  className="flex-1 border-[#ffc107]/20 hover:border-[#ffc107] hover:bg-[#fff9e6] hover:text-black transition-colors"
                >
                  <Download className="mr-2 h-4 w-4 text-[#ffc107]" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#fff9e6] to-[#fff2cc] rounded-xl p-5 border border-[#ffc107]/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <AlertCircle className="h-5 w-5 text-[#ffc107]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#004aad] mb-1">ID Proof Required</p>
                  <p className="text-xs text-slate-600 mb-3">
                    Please upload a government issued ID proof for verification
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Aadhar Card', 'PAN Card', 'Driving License', 'Passport'].map((doc) => (
                      <Badge key={doc} className="bg-white text-[#004aad] border-[#004aad]/20 text-[8px] px-2 py-0">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address Proof Card - Redesigned with theme colors */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className={`${isMobile ? 'px-4 py-3' : 'px-6 pt-5'} bg-gradient-to-r from-[#fff9e6] to-[#fff2cc] border-b border-[#ffc107]/30`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#ffc107] to-[#e6b002] rounded-xl shadow-md">
                <Home className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Address Proof</h3>
                <p className="text-xs text-slate-400 mt-0.5">Document verifying your current address</p>
              </div>
            </div>
            <StatusBadge status={profile.address_proof_url ? 'available' : 'required'} />
          </div>
        </CardHeader>
        <CardContent className={`${isMobile ? 'px-4 py-4' : 'p-6'}`}>
          {profile.address_proof_url ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#fff9e6] to-[#fff2cc] rounded-xl p-4 border border-[#ffc107]/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <MapPin className="h-5 w-5 text-[#ffc107]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#ffc107] mb-1">Document Details</p>
                    <p className="text-xs text-slate-600 break-all font-mono bg-white p-2 rounded-lg border border-slate-100">
                      {profile.address_proof_url.split('/').pop()}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className="bg-green-50 text-green-600 border-green-200 text-[10px]">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                      <Badge className="bg-[#fff9e6] text-[#ffc107] border-[#ffc107]/20 text-[10px]">
                        Address Proof
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3`}>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => handleViewDocument(
                    profile.address_proof_url,
                    "Address Proof Document",
                    `address-proof-${profile.full_name}.${profile.address_proof_url.split('.').pop()}`
                  )}
                  className="flex-1 border-[#004aad]/20 hover:border-[#004aad] hover:bg-[#e6f0ff] hover:text-black transition-colors"
                >
                  <Eye className="mr-2 h-4 w-4 text-[#004aad]" />
                  View Document
                </Button>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => handleDownloadDocument(
                    profile.address_proof_url,
                    `address-proof-${profile.full_name}.${profile.address_proof_url.split('.').pop()}`
                  )}
                  className="flex-1 border-[#ffc107]/20 hover:border-[#ffc107] hover:bg-[#fff9e6] hover:text-black transition-colors"
                >
                  <Download className="mr-2 h-4 w-4 text-[#ffc107]" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#fff9e6] to-[#fff2cc] rounded-xl p-5 border border-[#ffc107]/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <AlertCircle className="h-5 w-5 text-[#ffc107]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#004aad] mb-1">Address Proof Required</p>
                  <p className="text-xs text-slate-600 mb-3">
                    Please upload a document that verifies your current address
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Utility Bill', 'Rental Agreement', 'Bank Statement', 'Aadhar Card'].map((doc) => (
                      <Badge key={doc} className="bg-white text-[#004aad] border-[#004aad]/20 text-[8px] px-2 py-0">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Documents Card - Redesigned with theme colors */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className={`${isMobile ? 'px-4 py-3' : 'px-6 pt-5'} bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#004aad] to-[#002a7a] rounded-xl shadow-md">
                <FileCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Additional Documents</h3>
                <p className="text-xs text-slate-400 mt-0.5">Other supporting documents</p>
              </div>
            </div>
            {additionalDocs.length > 0 ? (
              <StatusBadge status="available" />
            ) : (
              <StatusBadge status="pending" />
            )}
          </div>
        </CardHeader>
        <CardContent className={`${isMobile ? 'px-4 py-4' : 'p-6'}`}>
          {additionalDocs.length > 0 ? (
            <div className="space-y-4">
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
                {additionalDocs.map((doc, index) => (
                  <DocumentCard
                    key={index}
                    doc={doc}
                    index={index}
                    isMobile={isMobile}
                    onView={() => handleViewDocument(
                      doc.url,
                      doc.filename || `Document ${index + 1}`,
                      doc.filename || `document-${index + 1}.${doc.url.split('.').pop()}`
                    )}
                    onDownload={() => handleDownloadDocument(
                      doc.url,
                      doc.filename || `document-${index + 1}.${doc.url.split('.').pop()}`
                    )}
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Total {additionalDocs.length} document(s)
                </p>
                <Badge className="bg-[#e6f0ff] text-[#004aad] border-none text-[10px] px-2 py-0">
                  <FileCheck className="h-3 w-3 mr-1" />
                  All Uploaded
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex p-4 bg-gradient-to-br from-[#e6f0ff] to-[#f0f5ff] rounded-full mb-4">
                <FileText className="h-8 w-8 text-[#004aad]" />
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">No Additional Documents</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven't uploaded any additional documents yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Summary Card - Redesigned with theme colors */}
      <Card className="bg-gradient-to-br from-[#e6f0ff] to-[#f0f5ff] border border-[#004aad]/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-[#004aad]" />
              <span className="text-xs font-medium text-[#004aad]">Document Summary</span>
            </div>
            <Badge className="bg-[#004aad] text-white border-none text-[10px] px-2 py-0.5">
              {[
                profile.id_proof_url ? 1 : 0,
                profile.address_proof_url ? 1 : 0,
                additionalDocs.length
              ].reduce((a, b) => a + b, 0)} Total
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1 ${profile.id_proof_url ? 'bg-[#004aad]' : 'bg-white'}`}>
                <IdCard className={`h-5 w-5 ${profile.id_proof_url ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <p className="text-[9px] font-medium text-slate-600">ID Proof</p>
              {profile.id_proof_url && (
                <p className="text-[7px] text-green-600">✓ Uploaded</p>
              )}
            </div>
            <div className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1 ${profile.address_proof_url ? 'bg-[#ffc107]' : 'bg-white'}`}>
                <Home className={`h-5 w-5 ${profile.address_proof_url ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <p className="text-[9px] font-medium text-slate-600">Address</p>
              {profile.address_proof_url && (
                <p className="text-[7px] text-green-600">✓ Uploaded</p>
              )}
            </div>
            <div className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1 ${additionalDocs.length > 0 ? 'bg-[#004aad]' : 'bg-white'}`}>
                <FileText className={`h-5 w-5 ${additionalDocs.length > 0 ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <p className="text-[9px] font-medium text-slate-600">Additional</p>
              {additionalDocs.length > 0 ? (
                <p className="text-[7px] text-green-600">{additionalDocs.length} file(s)</p>
              ) : (
                <p className="text-[7px] text-slate-400">None</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}