
// // components/tenant/profile/DocumentsTab.tsx
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
// import { 
//   User, FileText, MapPin, Shield, 
//   Download, Eye, Upload, Camera,
//   IdCard, Home, FileCheck, Clock,
//   CheckCircle2, AlertCircle, File,
//   FileImage, Loader2, RefreshCw
// } from 'lucide-react';
// import { format, parseISO } from 'date-fns';
// import { TenantProfile, AdditionalDocument } from '@/lib/tenantDetailsApi';
// import { tenantDetailsApi } from '@/lib/tenantDetailsApi';
// import { useEffect, useState } from 'react';

// interface DocumentsTabProps {
//   profile: TenantProfile;
//   onDocumentClick: (docData: any) => void;
//   getDocumentUrl: (url: string) => string;
//   isMobile?: boolean;
// }

// // Document Card Component for Additional Documents
// const DocumentCard = ({ 
//   doc, 
//   index, 
//   isMobile, 
//   onView, 
//   onDownload 
// }: { 
//   doc: AdditionalDocument; 
//   index: number; 
//   isMobile: boolean; 
//   onView: () => void; 
//   onDownload: () => void;
// }) => {
//   const filename = doc.filename || `Document ${index + 1}`;
//   const fileExtension = filename.split('.').pop()?.toLowerCase() || 'file';
//   const isPDF = fileExtension === 'pdf';
//   const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);

//   const getIcon = () => {
//     if (isPDF) return <FileText className="h-4 w-4 text-rose-500" />;
//     if (isImage) return <FileImage className="h-4 w-4 text-emerald-500" />;
//     return <File className="h-4 w-4 text-[#004aad]" />;
//   };

//   // Get document type from doc object or determine from filename
//   const getDocumentType = () => {
//     if (doc.document_type) return doc.document_type;
    
//     // Try to determine from filename
//     const lowerFilename = filename.toLowerCase();
//     if (lowerFilename.includes('aadhar') || lowerFilename.includes('aadhaar')) return 'Aadhar Card';
//     if (lowerFilename.includes('pan')) return 'PAN Card';
//     if (lowerFilename.includes('license') || lowerFilename.includes('driving')) return 'Driving License';
//     if (lowerFilename.includes('passport')) return 'Passport';
//     if (lowerFilename.includes('voter')) return 'Voter ID';
//     if (lowerFilename.includes('bill') || lowerFilename.includes('utility')) return 'Utility Bill';
//     if (lowerFilename.includes('rent') || lowerFilename.includes('agreement')) return 'Rental Agreement';
//     if (lowerFilename.includes('bank') || lowerFilename.includes('statement')) return 'Bank Statement';
    
//     return 'Additional Document';
//   };

//   return (
//     <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 group">
//       <div className="p-4">
//         <div className="flex items-start gap-3">
//           <div className="p-2.5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
//             {getIcon()}
//           </div>
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 mb-1">
//               <p className="text-sm font-semibold text-slate-800 truncate">{filename}</p>
//               {isPDF && (
//                 <Badge className="bg-rose-50 text-rose-600 border-none text-[8px] px-1.5 py-0">
//                   PDF
//                 </Badge>
//               )}
//             </div>
            
//             <Badge variant="outline" className="text-[10px] border-[#004aad]/20 text-[#004aad] bg-[#e6f0ff] px-2 py-0 mb-2">
//               {getDocumentType()}
//             </Badge>
            
//             {doc.uploaded_at && (
//               <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
//                 <Clock className="h-3 w-3" />
//                 <span>Uploaded: {format(parseISO(doc.uploaded_at), "dd MMM yyyy")}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 mt-4`}>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={onView}
//             className={`flex-1 border-slate-200 hover:border-[#004aad] hover:bg-[#e6f0ff]  hover:text-black transition-colors ${isMobile ? 'w-full' : ''}`}
//           >
//             <Eye className="h-3.5 w-3.5 mr-1.5 text-[#004aad]" />
//             View
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={onDownload}
//             className={`flex-1 border-slate-200 hover:border-[#ffc107] hover:bg-[#fff9e6] hover:text-black transition-colors ${isMobile ? 'w-full' : ''}`}
//           >
//             <Download className="h-3.5 w-3.5 mr-1.5 text-[#ffc107]" />
//             Download
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Status Badge Component
// const StatusBadge = ({ status }: { status: 'available' | 'required' | 'pending' }) => {
//   const config = {
//     available: {
//       bg: 'bg-green-50',
//       text: 'text-green-600',
//       border: 'border-green-200',
//       icon: CheckCircle2,
//       label: 'Available'
//     },
//     required: {
//       bg: 'bg-yellow-50',
//       text: 'text-yellow-600',
//       border: 'border-yellow-200',
//       icon: AlertCircle,
//       label: 'Required'
//     },
//     pending: {
//       bg: 'bg-blue-50',
//       text: 'text-blue-600',
//       border: 'border-blue-200',
//       icon: Clock,
//       label: 'Pending'
//     }
//   };

//   const { bg, text, border, icon: Icon, label } = config[status];

//   return (
//     <Badge className={`${bg} ${text} ${border} border text-[10px] px-2 py-0.5 font-medium`}>
//       <Icon className="h-3 w-3 mr-1" />
//       {label}
//     </Badge>
//   );
// };

// // Document Header Component
// const DocumentHeader = ({ icon: Icon, title, description, status }: { 
//   icon: any; 
//   title: string; 
//   description: string;
//   status?: 'available' | 'required' | 'pending';
// }) => (
//   <div className="flex items-start justify-between">
//     <div className="flex items-center gap-3">
//       <div className="p-2.5 bg-gradient-to-br from-[#e6f0ff] to-[#f0f5ff] rounded-xl">
//         <Icon className="h-4 w-4 text-[#004aad]" />
//       </div>
//       <div>
//         <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
//         <p className="text-xs text-slate-400 mt-0.5">{description}</p>
//       </div>
//     </div>
//     {status && <StatusBadge status={status} />}
//   </div>
// );

// export default function DocumentsTab({ 
//   profile, 
//   onDocumentClick, 
//   getDocumentUrl, 
//   isMobile = false 
// }: DocumentsTabProps) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [additionalDocs, setAdditionalDocs] = useState<AdditionalDocument[]>([]);
//   const [apiResponseRaw, setApiResponseRaw] = useState<any>(null);

//   // Fetch documents from API
//   const fetchDocuments = async (showRefresh = false) => {
//     if (showRefresh) {
//       setRefreshing(true);
//     } else {
//       setLoading(true);
//     }
//     setError(null);

//     try {
//       const response = await tenantDetailsApi.getDocuments();
//       // Handle the response based on your API structure
//       if (response?.success === true) {
//         // Case 1: { success: true, data: [...] }
//         if (Array.isArray(response.data)) {
//           setAdditionalDocs(response.data);
//         } 
//         // Case 2: { success: true, data: { additional_documents: [...] } }
//         else if (response.data?.additional_documents && Array.isArray(response.data.additional_documents)) {
//           setAdditionalDocs(response.data.additional_documents);
//         }
//         else {
//           setAdditionalDocs([]);
//         }
//       } 
//       // Case 3: Response is directly an array
//       else if (Array.isArray(response)) {
//         setAdditionalDocs(response);
//       }
//       // Case 4: Response has data property that's an array
//       else if (response?.data && Array.isArray(response.data)) {
//         setAdditionalDocs(response.data);
//       }
//       else {
//         // Fallback to profile data
//         if (profile.additional_documents && Array.isArray(profile.additional_documents)) {
//           setAdditionalDocs(profile.additional_documents);
//         } else {
//           setAdditionalDocs([]);
//         }
//       }
//     } catch (err) {
//       console.error('❌ Error fetching documents:', err);
//       setError('Failed to load documents. Please try again.');
      
//       // Fallback to profile data on error
//       if (profile.additional_documents && Array.isArray(profile.additional_documents)) {
//         setAdditionalDocs(profile.additional_documents);
//       } else {
//         setAdditionalDocs([]);
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Initial load
//   useEffect(() => {
//     fetchDocuments();
//   }, []);

//   // Also update when profile changes
//   useEffect(() => {
//     if (profile?.additional_documents && Array.isArray(profile.additional_documents)) {
//       setAdditionalDocs(profile.additional_documents);
//     }
//   }, [profile]);

//   const handleViewDocument = (url: string, title: string, filename: string) => {
//     const fullUrl = getDocumentUrl(url);
//     const extension = filename.split('.').pop()?.toLowerCase();
//     const isPDF = extension === 'pdf';
    
//     onDocumentClick({
//       open: true,
//       url: fullUrl,
//       title: title,
//       type: isPDF ? 'pdf' : 'image',
//       downloadName: filename
//     });
//   };

//   const handleDownloadDocument = (url: string, filename: string) => {
//     const fullUrl = getDocumentUrl(url);
//     const link = document.createElement('a');
//     link.href = fullUrl;
//     link.download = filename;
//     link.click();
//   };


//   // Loading state
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center py-16">
//         <div className="p-4 bg-[#e6f0ff] rounded-2xl mb-4">
//           <Loader2 className="h-8 w-8 animate-spin text-[#004aad]" />
//         </div>
//         <span className="text-sm font-medium text-slate-600">Loading your documents...</span>
//       </div>
//     );
//   }

//   return (
//     <div className={`space-y-4 ${isMobile ? 'pb-4' : 'pb-6'}`}>
      
     

//       {/* Debug Info - Remove in production */}
     

//       {/* ID Proof Card - Redesigned with theme colors */}
//       <Card className="border border-slate-200 shadow-sm overflow-hidden">
//         <CardHeader className={`${isMobile ? 'px-4 py-3' : 'px-6 pt-5'} bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20`}>
//           <div className="flex items-start justify-between">
//             <div className="flex items-center gap-3">
//               <div className="p-2.5 bg-gradient-to-br from-[#004aad] to-[#002a7a] rounded-xl shadow-md">
//                 <IdCard className="h-4 w-4 text-white" />
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-slate-800">Identity Proof</h3>
//                 <p className="text-xs text-slate-400 mt-0.5">Government issued ID document</p>
//               </div>
//             </div>
//             <StatusBadge status={profile.id_proof_url ? 'available' : 'required'} />
//           </div>
//         </CardHeader>
//         <CardContent className={`${isMobile ? 'px-4 py-4' : 'p-6'}`}>
//           {profile.id_proof_url ? (
//             <div className="space-y-4">
//               <div className="bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] rounded-xl p-4 border border-[#004aad]/20">
//                 <div className="flex items-start gap-3">
//                   <div className="p-2 bg-white rounded-lg shadow-sm">
//                     <FileText className="h-5 w-5 text-[#004aad]" />
//                   </div>
//                   <div className="flex-1">
//                     <p className="text-xs font-medium text-[#004aad] mb-1">Document Details</p>
//                     <p className="text-xs text-slate-600 break-all font-mono bg-white p-2 rounded-lg border border-slate-100">
//                       {profile.id_proof_url.split('/').pop()}
//                     </p>
//                     <div className="flex items-center gap-2 mt-3">
//                       <Badge className="bg-green-50 text-green-600 border-green-200 text-[10px]">
//                         <CheckCircle2 className="h-3 w-3 mr-1" />
//                         Verified
//                       </Badge>
//                       <Badge className="bg-[#e6f0ff] text-[#004aad] border-[#004aad]/20 text-[10px]">
//                         Government ID
//                       </Badge>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3`}>
//                 <Button
//                   variant="outline"
//                   size={isMobile ? "sm" : "default"}
//                   onClick={() => handleViewDocument(
//                     profile.id_proof_url,
//                     "ID Proof Document",
//                     `id-proof-${profile.full_name}.${profile.id_proof_url.split('.').pop()}`
//                   )}
//                   className="flex-1 border-[#004aad]/20 hover:border-[#004aad] hover:bg-[#e6f0ff] hover:text-black transition-colors"
//                 >
//                   <Eye className="mr-2 h-4 w-4 text-[#004aad]" />
//                   View Document
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size={isMobile ? "sm" : "default"}
//                   onClick={() => handleDownloadDocument(
//                     profile.id_proof_url,
//                     `id-proof-${profile.full_name}.${profile.id_proof_url.split('.').pop()}`
//                   )}
//                   className="flex-1 border-[#ffc107]/20 hover:border-[#ffc107] hover:bg-[#fff9e6] hover:text-black transition-colors"
//                 >
//                   <Download className="mr-2 h-4 w-4 text-[#ffc107]" />
//                   Download
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <div className="bg-gradient-to-br from-[#fff9e6] to-[#fff2cc] rounded-xl p-5 border border-[#ffc107]/20">
//               <div className="flex items-start gap-3">
//                 <div className="p-2 bg-white rounded-lg shadow-sm">
//                   <AlertCircle className="h-5 w-5 text-[#ffc107]" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm font-semibold text-[#004aad] mb-1">ID Proof Required</p>
//                   <p className="text-xs text-slate-600 mb-3">
//                     Please upload a government issued ID proof for verification
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {['Aadhar Card', 'PAN Card', 'Driving License', 'Passport'].map((doc) => (
//                       <Badge key={doc} className="bg-white text-[#004aad] border-[#004aad]/20 text-[8px] px-2 py-0">
//                         {doc}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Address Proof Card - Redesigned with theme colors */}
//       <Card className="border border-slate-200 shadow-sm overflow-hidden">
//         <CardHeader className={`${isMobile ? 'px-4 py-3' : 'px-6 pt-5'} bg-gradient-to-r from-[#fff9e6] to-[#fff2cc] border-b border-[#ffc107]/30`}>
//           <div className="flex items-start justify-between">
//             <div className="flex items-center gap-3">
//               <div className="p-2.5 bg-gradient-to-br from-[#ffc107] to-[#e6b002] rounded-xl shadow-md">
//                 <Home className="h-4 w-4 text-white" />
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-slate-800">Address Proof</h3>
//                 <p className="text-xs text-slate-400 mt-0.5">Document verifying your current address</p>
//               </div>
//             </div>
//             <StatusBadge status={profile.address_proof_url ? 'available' : 'required'} />
//           </div>
//         </CardHeader>
//         <CardContent className={`${isMobile ? 'px-4 py-4' : 'p-6'}`}>
//           {profile.address_proof_url ? (
//             <div className="space-y-4">
//               <div className="bg-gradient-to-r from-[#fff9e6] to-[#fff2cc] rounded-xl p-4 border border-[#ffc107]/20">
//                 <div className="flex items-start gap-3">
//                   <div className="p-2 bg-white rounded-lg shadow-sm">
//                     <MapPin className="h-5 w-5 text-[#ffc107]" />
//                   </div>
//                   <div className="flex-1">
//                     <p className="text-xs font-medium text-[#ffc107] mb-1">Document Details</p>
//                     <p className="text-xs text-slate-600 break-all font-mono bg-white p-2 rounded-lg border border-slate-100">
//                       {profile.address_proof_url.split('/').pop()}
//                     </p>
//                     <div className="flex items-center gap-2 mt-3">
//                       <Badge className="bg-green-50 text-green-600 border-green-200 text-[10px]">
//                         <CheckCircle2 className="h-3 w-3 mr-1" />
//                         Verified
//                       </Badge>
//                       <Badge className="bg-[#fff9e6] text-[#ffc107] border-[#ffc107]/20 text-[10px]">
//                         Address Proof
//                       </Badge>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3`}>
//                 <Button
//                   variant="outline"
//                   size={isMobile ? "sm" : "default"}
//                   onClick={() => handleViewDocument(
//                     profile.address_proof_url,
//                     "Address Proof Document",
//                     `address-proof-${profile.full_name}.${profile.address_proof_url.split('.').pop()}`
//                   )}
//                   className="flex-1 border-[#004aad]/20 hover:border-[#004aad] hover:bg-[#e6f0ff] hover:text-black transition-colors"
//                 >
//                   <Eye className="mr-2 h-4 w-4 text-[#004aad]" />
//                   View Document
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size={isMobile ? "sm" : "default"}
//                   onClick={() => handleDownloadDocument(
//                     profile.address_proof_url,
//                     `address-proof-${profile.full_name}.${profile.address_proof_url.split('.').pop()}`
//                   )}
//                   className="flex-1 border-[#ffc107]/20 hover:border-[#ffc107] hover:bg-[#fff9e6] hover:text-black transition-colors"
//                 >
//                   <Download className="mr-2 h-4 w-4 text-[#ffc107]" />
//                   Download
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <div className="bg-gradient-to-br from-[#fff9e6] to-[#fff2cc] rounded-xl p-5 border border-[#ffc107]/20">
//               <div className="flex items-start gap-3">
//                 <div className="p-2 bg-white rounded-lg shadow-sm">
//                   <AlertCircle className="h-5 w-5 text-[#ffc107]" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm font-semibold text-[#004aad] mb-1">Address Proof Required</p>
//                   <p className="text-xs text-slate-600 mb-3">
//                     Please upload a document that verifies your current address
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {['Utility Bill', 'Rental Agreement', 'Bank Statement', 'Aadhar Card'].map((doc) => (
//                       <Badge key={doc} className="bg-white text-[#004aad] border-[#004aad]/20 text-[8px] px-2 py-0">
//                         {doc}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Additional Documents Card - Redesigned with theme colors */}
//       <Card className="border border-slate-200 shadow-sm overflow-hidden">
//         <CardHeader className={`${isMobile ? 'px-4 py-3' : 'px-6 pt-5'} bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20`}>
//           <div className="flex items-start justify-between">
//             <div className="flex items-center gap-3">
//               <div className="p-2.5 bg-gradient-to-br from-[#004aad] to-[#002a7a] rounded-xl shadow-md">
//                 <FileCheck className="h-4 w-4 text-white" />
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-slate-800">Additional Documents</h3>
//                 <p className="text-xs text-slate-400 mt-0.5">Other supporting documents</p>
//               </div>
//             </div>
//             {additionalDocs.length > 0 ? (
//               <StatusBadge status="available" />
//             ) : (
//               <StatusBadge status="pending" />
//             )}
//           </div>
//         </CardHeader>
//         <CardContent className={`${isMobile ? 'px-4 py-4' : 'p-6'}`}>
//           {additionalDocs.length > 0 ? (
//             <div className="space-y-4">
//               <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
//                 {additionalDocs.map((doc, index) => (
//                   <DocumentCard
//                     key={index}
//                     doc={doc}
//                     index={index}
//                     isMobile={isMobile}
//                     onView={() => handleViewDocument(
//                       doc.url,
//                       doc.filename || `Document ${index + 1}`,
//                       doc.filename || `document-${index + 1}.${doc.url.split('.').pop()}`
//                     )}
//                     onDownload={() => handleDownloadDocument(
//                       doc.url,
//                       doc.filename || `document-${index + 1}.${doc.url.split('.').pop()}`
//                     )}
//                   />
//                 ))}
//               </div>
              
//               <div className="flex items-center justify-between pt-3 border-t border-slate-100">
//                 <p className="text-xs text-slate-400">
//                   Total {additionalDocs.length} document(s)
//                 </p>
//                 <Badge className="bg-[#e6f0ff] text-[#004aad] border-none text-[10px] px-2 py-0">
//                   <FileCheck className="h-3 w-3 mr-1" />
//                   All Uploaded
//                 </Badge>
//               </div>
//             </div>
//           ) : (
//             <div className="text-center py-8">
//               <div className="inline-flex p-4 bg-gradient-to-br from-[#e6f0ff] to-[#f0f5ff] rounded-full mb-4">
//                 <FileText className="h-8 w-8 text-[#004aad]" />
//               </div>
//               <p className="text-sm font-semibold text-slate-800 mb-1">No Additional Documents</p>
//               <p className="text-xs text-slate-400 max-w-sm mx-auto">
//                 You haven't uploaded any additional documents yet
//               </p>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Document Summary Card - Redesigned with theme colors */}
//       <Card className="bg-gradient-to-br from-[#e6f0ff] to-[#f0f5ff] border border-[#004aad]/20">
//         <CardContent className="p-4">
//           <div className="flex items-center justify-between mb-3">
//             <div className="flex items-center gap-2">
//               <FileCheck className="h-4 w-4 text-[#004aad]" />
//               <span className="text-xs font-medium text-[#004aad]">Document Summary</span>
//             </div>
//             <Badge className="bg-[#004aad] text-white border-none text-[10px] px-2 py-0.5">
//               {[
//                 profile.id_proof_url ? 1 : 0,
//                 profile.address_proof_url ? 1 : 0,
//                 additionalDocs.length
//               ].reduce((a, b) => a + b, 0)} Total
//             </Badge>
//           </div>
          
//           <div className="grid grid-cols-3 gap-2">
//             <div className="text-center">
//               <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1 ${profile.id_proof_url ? 'bg-[#004aad]' : 'bg-white'}`}>
//                 <IdCard className={`h-5 w-5 ${profile.id_proof_url ? 'text-white' : 'text-slate-400'}`} />
//               </div>
//               <p className="text-[9px] font-medium text-slate-600">ID Proof</p>
//               {profile.id_proof_url && (
//                 <p className="text-[7px] text-green-600">✓ Uploaded</p>
//               )}
//             </div>
//             <div className="text-center">
//               <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1 ${profile.address_proof_url ? 'bg-[#ffc107]' : 'bg-white'}`}>
//                 <Home className={`h-5 w-5 ${profile.address_proof_url ? 'text-white' : 'text-slate-400'}`} />
//               </div>
//               <p className="text-[9px] font-medium text-slate-600">Address</p>
//               {profile.address_proof_url && (
//                 <p className="text-[7px] text-green-600">✓ Uploaded</p>
//               )}
//             </div>
//             <div className="text-center">
//               <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1 ${additionalDocs.length > 0 ? 'bg-[#004aad]' : 'bg-white'}`}>
//                 <FileText className={`h-5 w-5 ${additionalDocs.length > 0 ? 'text-white' : 'text-slate-400'}`} />
//               </div>
//               <p className="text-[9px] font-medium text-slate-600">Additional</p>
//               {additionalDocs.length > 0 ? (
//                 <p className="text-[7px] text-green-600">{additionalDocs.length} file(s)</p>
//               ) : (
//                 <p className="text-[7px] text-slate-400">None</p>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


// // components/tenant/profile/DocumentsTab.tsx
// import { Card, CardContent, CardHeader } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from '@/components/ui/select';
// import {
//   FileText, MapPin, Download, Eye, Upload, Camera,
//   IdCard, Home, FileCheck, Clock, CheckCircle2, AlertCircle,
//   File, FileImage, Loader2, X, Plus, Heart,
//   ChevronDown,
//   ChevronUp,
// } from 'lucide-react';
// import { format, parseISO } from 'date-fns';
// import { TenantProfile, AdditionalDocument, tenantDetailsApi } from '@/lib/tenantDetailsApi';
// import { useEffect, useRef, useState } from 'react';
// import { toast } from 'sonner';

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface DocumentsTabProps {
//   profile: TenantProfile;
//   onDocumentClick: (docData: any) => void;
//   getDocumentUrl: (url: string) => string;
//   isMobile?: boolean;
//   onProfileRefresh?: () => void;
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// const StatusBadge = ({ status }: { status: 'available' | 'required' | 'pending' }) => {
//   const config = {
//     available: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', icon: CheckCircle2, label: 'Available' },
//     required:  { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', icon: AlertCircle, label: 'Required' },
//     pending:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200',   icon: Clock,       label: 'Pending'   },
//   };
//   const { bg, text, border, icon: Icon, label } = config[status];
//   return (
//     <Badge className={`${bg} ${text} ${border} border text-[10px] px-2 py-0.5 font-medium`}>
//       <Icon className="h-3 w-3 mr-1" />{label}
//     </Badge>
//   );
// };

// // ─── Upload section component (ALWAYS VISIBLE) ─────────────────────────────────

// function UploadSection({
//   isMobile,
//   onUploadSuccess,
//   profile,
//   getDocumentUrl,
//   onDocumentClick,
// }: {
//   isMobile: boolean;
//   onUploadSuccess: () => void;
//   profile: TenantProfile;
//   getDocumentUrl: (url: string) => string;
//   onDocumentClick: (docData: any) => void;
// }) {
//   const [uploading, setUploading] = useState(false);
  
//   // Form states with existing values from profile
//   const [idProofType, setIdProofType] = useState(profile.id_proof_type || '');
//   const [idProofNumber, setIdProofNumber] = useState(profile.id_proof_number || '');
//   const [addressProofType, setAddressProofType] = useState(profile.address_proof_type || '');
//   const [addressProofNumber, setAddressProofNumber] = useState(profile.address_proof_number || '');
  
//   // File states
//   const [idProofFile, setIdProofFile] = useState<File | null>(null);
//   const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
//   const [photoFile, setPhotoFile] = useState<File | null>(null);
//   const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
//   const [partnerOpen, setPartnerOpen] = useState(false);

//   // Partner documents state
//   const [partnerDocs, setPartnerDocs] = useState({
//     id_proof_type: (profile as any).partner_id_proof_type || '',
//     id_proof_number: (profile as any).partner_id_proof_number || '',
//     id_proof_file: null as File | null,
//     address_proof_type: (profile as any).partner_address_proof_type || '',
//     address_proof_number: (profile as any).partner_address_proof_number || '',
//     address_proof_file: null as File | null,
//     photo_file: null as File | null,
//   });

//   const idRef = useRef<HTMLInputElement>(null);
//   const addrRef = useRef<HTMLInputElement>(null);
//   const photoRef = useRef<HTMLInputElement>(null);
//   const addlRef = useRef<HTMLInputElement>(null);
//   const partnerIdRef = useRef<HTMLInputElement>(null);
//   const partnerAddrRef = useRef<HTMLInputElement>(null);
//   const partnerPhotoRef = useRef<HTMLInputElement>(null);

//   const SI = 'text-xs';
//   const F = 'h-8 text-xs border-slate-200 focus:border-[#004aad]';
//   const L = 'text-[9px] font-medium text-slate-500 uppercase tracking-wider mb-1 block';

//   const handleViewExistingFile = (url: string, title: string, filename: string) => {
//     const fullUrl = getDocumentUrl(url);
//     const ext = filename.split('.').pop()?.toLowerCase();
//     onDocumentClick({ open: true, url: fullUrl, title, type: ext === 'pdf' ? 'pdf' : 'image', downloadName: filename });
//   };

//   const handleUpload = async () => {
//     if (!idProofFile && !addressProofFile && !photoFile && additionalFiles.length === 0 &&
//         !partnerDocs.id_proof_file && !partnerDocs.address_proof_file && !partnerDocs.photo_file) {
//       toast.error('Please select at least one file to upload');
//       return;
//     }
//     setUploading(true);
//     try {
//       const fd = new FormData();
//       if (idProofFile) fd.append('id_proof_url', idProofFile);
//       if (addressProofFile) fd.append('address_proof_url', addressProofFile);
//       if (photoFile) fd.append('photo_url', photoFile);
//       if (idProofType) fd.append('id_proof_type', idProofType);
//       if (idProofNumber) fd.append('id_proof_number', idProofNumber);
//       if (addressProofType) fd.append('address_proof_type', addressProofType);
//       if (addressProofNumber) fd.append('address_proof_number', addressProofNumber);
//       additionalFiles.forEach(f => fd.append('additional_documents[]', f));
      
//       // Append partner documents
//       if (partnerDocs.id_proof_file) fd.append('partner_id_proof_url', partnerDocs.id_proof_file);
//       if (partnerDocs.address_proof_file) fd.append('partner_address_proof_url', partnerDocs.address_proof_file);
//       if (partnerDocs.photo_file) fd.append('partner_photo_url', partnerDocs.photo_file);
//       if (partnerDocs.id_proof_type) fd.append('partner_id_proof_type', partnerDocs.id_proof_type);
//       if (partnerDocs.id_proof_number) fd.append('partner_id_proof_number', partnerDocs.id_proof_number);
//       if (partnerDocs.address_proof_type) fd.append('partner_address_proof_type', partnerDocs.address_proof_type);
//       if (partnerDocs.address_proof_number) fd.append('partner_address_proof_number', partnerDocs.address_proof_number);

//       const res = await tenantDetailsApi.uploadDocuments(fd);
//       if (res.success) {
//         toast.success('Documents uploaded successfully');
//         setIdProofFile(null); setAddressProofFile(null); setPhotoFile(null);
//         setAdditionalFiles([]);
//         onUploadSuccess();
//       } else {
//         toast.error(res.message || 'Upload failed');
//       }
//     } catch (err: any) {
//       toast.error(err.message || 'Upload failed');
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <Card className="border border-[#004aad]/20 shadow-sm overflow-hidden">
//       <div className="w-full px-5 py-3 bg-gradient-to-r from-[#004aad] to-[#002a7a]">
//         <div className="flex items-center gap-2">
//           <Upload className="h-4 w-4 text-[#ffc107]" />
//           <span className="text-sm font-semibold text-white">Upload / Update Documents</span>
//         </div>
//       </div>

//       <CardContent className={`${isMobile ? 'p-4' : 'p-5'} space-y-5`}>
//         {/* ID Proof */}
//         <div className="p-3 bg-[#e6f0ff] rounded-xl border border-[#004aad]/20">
//           <p className="text-xs font-bold text-[#004aad] mb-3 flex items-center gap-1.5">
//             <IdCard className="h-3.5 w-3.5" />Identity Proof
//           </p>
          
//           {/* Show existing ID Proof document if exists */}
//           {profile.id_proof_url && (
//             <div className="mb-3 p-2 bg-white rounded-lg border border-[#004aad]/20">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <FileText className="h-4 w-4 text-[#004aad]" />
//                   <span className="text-xs text-slate-600 truncate max-w-[200px]">
//                     {profile.id_proof_url.split('/').pop()}
//                   </span>
//                 </div>
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="h-6 text-[10px] text-[#004aad]"
//                   onClick={() => handleViewExistingFile(
//                     profile.id_proof_url,
//                     "ID Proof Document",
//                     `id-proof.${profile.id_proof_url.split('.').pop()}`
//                   )}
//                 >
//                   <Eye className="h-3 w-3 mr-1" /> View
//                 </Button>
//               </div>
//             </div>
//           )}
          
//           <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-3`}>
//             <div>
//               <label className={L}>ID Proof Type</label>
//               <Select value={idProofType} onValueChange={setIdProofType}>
//                 <SelectTrigger className={F}>
//                   <SelectValue placeholder={profile.id_proof_type || "Select type"} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {['Aadhar Card','Passport','PAN Card','Driving Licence','Voter ID'].map(v => (
//                     <SelectItem key={v} value={v} className={SI}>{v}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               {profile.id_proof_type && !idProofType && (
//                 <p className="text-[10px] text-green-600 mt-1">Current: {profile.id_proof_type}</p>
//               )}
//             </div>
//             <div>
//               <label className={L}>
//                 {idProofType === 'Aadhar Card' ? 'Aadhar Number' :
//                  idProofType === 'PAN Card' ? 'PAN Number' :
//                  idProofType === 'Passport' ? 'Passport Number' : 'Document Number'}
//               </label>
//               <Input
//                 value={idProofNumber}
//                 placeholder={profile.id_proof_number || "Document number"}
//                 onChange={e => {
//                   let v = e.target.value;
//                   if (idProofType === 'Aadhar Card') v = v.replace(/\D/g,'').slice(0,12).replace(/(\d{4})(?=\d)/g,'$1 ');
//                   else if (idProofType === 'PAN Card') v = v.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10);
//                   else if (idProofType === 'Passport') v = v.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,9);
//                   setIdProofNumber(v);
//                 }}
//                 className={F}
//               />
//               {profile.id_proof_number && !idProofNumber && (
//                 <p className="text-[10px] text-green-600 mt-1">Current: {profile.id_proof_number}</p>
//               )}
//             </div>
//             <div>
//               <label className={L}>Upload New File (Optional)</label>
//               <div
//                 className="flex items-center gap-2 h-8 px-3 border border-dashed border-[#004aad]/40 rounded-md bg-white cursor-pointer hover:bg-[#e6f0ff] transition-colors"
//                 onClick={() => idRef.current?.click()}
//               >
//                 <Upload className="h-3.5 w-3.5 text-[#004aad]" />
//                 <span className="text-xs text-slate-500 truncate">
//                   {idProofFile ? idProofFile.name : 'Choose file to replace...'}
//                 </span>
//                 {idProofFile && (
//                   <button type="button" onClick={e => { e.stopPropagation(); setIdProofFile(null); }} className="ml-auto">
//                     <X className="h-3 w-3 text-red-400" />
//                   </button>
//                 )}
//               </div>
//               <input ref={idRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp"
//                 onChange={e => e.target.files?.[0] && setIdProofFile(e.target.files[0])} />
//             </div>
//           </div>
//         </div>

//         {/* Address Proof */}
//         <div className="p-3 bg-[#fff9e6] rounded-xl border border-[#ffc107]/30">
//           <p className="text-xs font-bold text-[#004aad] mb-3 flex items-center gap-1.5">
//             <Home className="h-3.5 w-3.5 text-[#ffc107]" />Address Proof
//           </p>
          
//           {/* Show existing Address Proof document if exists */}
//           {profile.address_proof_url && (
//             <div className="mb-3 p-2 bg-white rounded-lg border border-[#ffc107]/20">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <FileText className="h-4 w-4 text-[#ffc107]" />
//                   <span className="text-xs text-slate-600 truncate max-w-[200px]">
//                     {profile.address_proof_url.split('/').pop()}
//                   </span>
//                 </div>
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="h-6 text-[10px] text-[#ffc107]"
//                   onClick={() => handleViewExistingFile(
//                     profile.address_proof_url,
//                     "Address Proof Document",
//                     `address-proof.${profile.address_proof_url.split('.').pop()}`
//                   )}
//                 >
//                   <Eye className="h-3 w-3 mr-1" /> View
//                 </Button>
//               </div>
//             </div>
//           )}
          
//           <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-3`}>
//             <div>
//               <label className={L}>Address Proof Type</label>
//               <Select value={addressProofType} onValueChange={setAddressProofType}>
//                 <SelectTrigger className={F}>
//                   <SelectValue placeholder={profile.address_proof_type || "Select type"} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {['Aadhar Card','Utility Bill','Bank Statement','Passport','Rental Agreement','Voter ID'].map(v => (
//                     <SelectItem key={v} value={v} className={SI}>{v}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               {profile.address_proof_type && !addressProofType && (
//                 <p className="text-[10px] text-green-600 mt-1">Current: {profile.address_proof_type}</p>
//               )}
//             </div>
//             <div>
//               <label className={L}>Document Number</label>
//               <Input
//                 value={addressProofNumber}
//                 placeholder={profile.address_proof_number || "Document number"}
//                 onChange={e => {
//                   let v = e.target.value;
//                   if (addressProofType === 'Aadhar Card') v = v.replace(/\D/g,'').slice(0,12).replace(/(\d{4})(?=\d)/g,'$1 ');
//                   setAddressProofNumber(v);
//                 }}
//                 className={F}
//               />
//               {profile.address_proof_number && !addressProofNumber && (
//                 <p className="text-[10px] text-green-600 mt-1">Current: {profile.address_proof_number}</p>
//               )}
//             </div>
//             <div>
//               <label className={L}>Upload New File (Optional)</label>
//               <div
//                 className="flex items-center gap-2 h-8 px-3 border border-dashed border-[#ffc107]/50 rounded-md bg-white cursor-pointer hover:bg-[#fff9e6] transition-colors"
//                 onClick={() => addrRef.current?.click()}
//               >
//                 <Upload className="h-3.5 w-3.5 text-[#ffc107]" />
//                 <span className="text-xs text-slate-500 truncate">
//                   {addressProofFile ? addressProofFile.name : 'Choose file to replace...'}
//                 </span>
//                 {addressProofFile && (
//                   <button type="button" onClick={e => { e.stopPropagation(); setAddressProofFile(null); }} className="ml-auto">
//                     <X className="h-3 w-3 text-red-400" />
//                   </button>
//                 )}
//               </div>
//               <input ref={addrRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp"
//                 onChange={e => e.target.files?.[0] && setAddressProofFile(e.target.files[0])} />
//             </div>
//           </div>
//         </div>

//         {/* Photo */}
//         <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
//           <p className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-1.5">
//             <Camera className="h-3.5 w-3.5" />Photograph
//           </p>
          
//           {/* Show existing photo if exists */}
//           {profile.photo_url && (
//             <div className="mb-3 p-2 bg-white rounded-lg border border-slate-200">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <Camera className="h-4 w-4 text-slate-400" />
//                   <span className="text-xs text-slate-600 truncate max-w-[200px]">
//                     {profile.photo_url.split('/').pop()}
//                   </span>
//                 </div>
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="h-6 text-[10px]"
//                   onClick={() => handleViewExistingFile(
//                     profile.photo_url,
//                     "Profile Photo",
//                     `photo.${profile.photo_url.split('.').pop()}`
//                   )}
//                 >
//                   <Eye className="h-3 w-3 mr-1" /> View
//                 </Button>
//               </div>
//             </div>
//           )}
          
//           <div
//             className="flex items-center gap-2 h-8 px-3 border border-dashed border-slate-300 rounded-md bg-white cursor-pointer hover:bg-slate-50 transition-colors max-w-xs"
//             onClick={() => photoRef.current?.click()}
//           >
//             <Camera className="h-3.5 w-3.5 text-slate-400" />
//             <span className="text-xs text-slate-500 truncate">
//               {photoFile ? photoFile.name : 'Upload new photo...'}
//             </span>
//             {photoFile && (
//               <button type="button" onClick={e => { e.stopPropagation(); setPhotoFile(null); }} className="ml-auto">
//                 <X className="h-3 w-3 text-red-400" />
//               </button>
//             )}
//           </div>
//           <input ref={photoRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp"
//             onChange={e => e.target.files?.[0] && setPhotoFile(e.target.files[0])} />
//         </div>
//         {/* Partner Documents Section - Collapsible */}
// <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
//   <button
//     type="button"
//     onClick={() => setPartnerOpen(!partnerOpen)}
//     className="w-full flex items-center justify-between"
//   >
//     <div className="flex items-center gap-2">
//       <Heart className="h-4 w-4 text-rose-500" />
//       <span className="text-sm font-semibold text-rose-700">Partner Documents</span>
//       {(profile.partner_full_name || partnerDocs.id_proof_type || partnerDocs.address_proof_type) && (
//         <Badge className="bg-rose-200 text-rose-700 text-[9px] px-1.5">Added</Badge>
//       )}
//     </div>
//     {partnerOpen ? (
//       <ChevronUp className="h-4 w-4 text-rose-500" />
//     ) : (
//       <ChevronDown className="h-4 w-4 text-rose-500" />
//     )}
//   </button>
  
//   {partnerOpen && (
//     <div className="mt-3 space-y-3">
//       {profile.partner_full_name && (
//         <div className="text-xs text-rose-600 bg-rose-100 p-2 rounded-lg">
//           Partner: {profile.partner_full_name}
//         </div>
//       )}
      
//       {/* Partner ID Proof */}
//       <div>
//         <label className="text-[10px] font-medium text-rose-600 mb-1 block">Partner ID Proof Type</label>
//         <Select 
//           value={partnerDocs.id_proof_type} 
//           onValueChange={(v) => setPartnerDocs(p => ({ ...p, id_proof_type: v }))}
//         >
//           <SelectTrigger className="h-8 text-xs border-rose-200 focus:border-rose-400">
//             <SelectValue placeholder="Select type" />
//           </SelectTrigger>
//           <SelectContent>
//             {['Aadhar Card','Passport','PAN Card','Driving Licence','Voter ID'].map(v => (
//               <SelectItem key={v} value={v}>{v}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         {profile.partner_id_proof_type && !partnerDocs.id_proof_type && (
//           <p className="text-[10px] text-green-600 mt-1">Current: {profile.partner_id_proof_type}</p>
//         )}
        
//         {partnerDocs.id_proof_type && (
//           <div className="mt-2">
//             <label className="text-[10px] font-medium text-rose-600 mb-1 block">
//               {partnerDocs.id_proof_type === 'Aadhar Card' ? 'Aadhar Number' : 
//                partnerDocs.id_proof_type === 'PAN Card' ? 'PAN Number' : 'Document Number'}
//             </label>
//             <Input
//               value={partnerDocs.id_proof_number}
//               onChange={e => setPartnerDocs(p => ({ ...p, id_proof_number: e.target.value }))}
//               placeholder="Document number"
//               className="h-8 text-xs"
//             />
//             {profile.partner_id_proof_number && !partnerDocs.id_proof_number && (
//               <p className="text-[10px] text-green-600 mt-1">Current: {profile.partner_id_proof_number}</p>
//             )}
//           </div>
//         )}
        
//         <div className="mt-2">
//           <div
//             className="flex items-center gap-2 h-8 px-3 border border-dashed border-rose-300 rounded-md bg-white cursor-pointer hover:bg-rose-50"
//             onClick={() => partnerIdRef.current?.click()}
//           >
//             <Upload className="h-3.5 w-3.5 text-rose-500" />
//             <span className="text-xs text-slate-500 truncate">
//               {partnerDocs.id_proof_file ? partnerDocs.id_proof_file.name : 
//                (profile.partner_id_proof_url ? 'Change existing file' : 'Upload Partner ID Proof')}
//             </span>
//             {partnerDocs.id_proof_file && (
//               <button type="button" onClick={e => { e.stopPropagation(); setPartnerDocs(p => ({ ...p, id_proof_file: null })); }} className="ml-auto">
//                 <X className="h-3 w-3 text-red-400" />
//               </button>
//             )}
//           </div>
//           {profile.partner_id_proof_url && !partnerDocs.id_proof_file && (
//             <div className="flex items-center justify-between mt-1">
//               <p className="text-[10px] text-green-600">✓ Current file uploaded</p>
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 className="h-5 text-[9px] text-rose-500"
//                 onClick={() => handleViewExistingFile(
//                   profile.partner_id_proof_url!,
//                   "Partner ID Proof",
//                   `partner-id-proof.${profile.partner_id_proof_url!.split('.').pop()}`
//                 )}
//               >
//                 <Eye className="h-2.5 w-2.5 mr-0.5" /> View
//               </Button>
//             </div>
//           )}
//           <input ref={partnerIdRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
//             onChange={e => e.target.files?.[0] && setPartnerDocs(p => ({ ...p, id_proof_file: e.target.files![0] }))} />
//         </div>
//       </div>

//       {/* Partner Address Proof */}
//       <div>
//         <label className="text-[10px] font-medium text-rose-600 mb-1 block">Partner Address Proof Type</label>
//         <Select 
//           value={partnerDocs.address_proof_type} 
//           onValueChange={(v) => setPartnerDocs(p => ({ ...p, address_proof_type: v }))}
//         >
//           <SelectTrigger className="h-8 text-xs border-rose-200 focus:border-rose-400">
//             <SelectValue placeholder="Select type" />
//           </SelectTrigger>
//           <SelectContent>
//             {['Aadhar Card','Utility Bill','Bank Statement','Passport','Voter ID'].map(v => (
//               <SelectItem key={v} value={v}>{v}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         {profile.partner_address_proof_type && !partnerDocs.address_proof_type && (
//           <p className="text-[10px] text-green-600 mt-1">Current: {profile.partner_address_proof_type}</p>
//         )}
        
//         {partnerDocs.address_proof_type && (
//           <div className="mt-2">
//             <label className="text-[10px] font-medium text-rose-600 mb-1 block">Document Number</label>
//             <Input
//               value={partnerDocs.address_proof_number}
//               onChange={e => setPartnerDocs(p => ({ ...p, address_proof_number: e.target.value }))}
//               placeholder="Document number"
//               className="h-8 text-xs"
//             />
//             {profile.partner_address_proof_number && !partnerDocs.address_proof_number && (
//               <p className="text-[10px] text-green-600 mt-1">Current: {profile.partner_address_proof_number}</p>
//             )}
//           </div>
//         )}
        
//         <div className="mt-2">
//           <div
//             className="flex items-center gap-2 h-8 px-3 border border-dashed border-rose-300 rounded-md bg-white cursor-pointer hover:bg-rose-50"
//             onClick={() => partnerAddrRef.current?.click()}
//           >
//             <Upload className="h-3.5 w-3.5 text-rose-500" />
//             <span className="text-xs text-slate-500 truncate">
//               {partnerDocs.address_proof_file ? partnerDocs.address_proof_file.name : 
//                (profile.partner_address_proof_url ? 'Change existing file' : 'Upload Partner Address Proof')}
//             </span>
//             {partnerDocs.address_proof_file && (
//               <button type="button" onClick={e => { e.stopPropagation(); setPartnerDocs(p => ({ ...p, address_proof_file: null })); }} className="ml-auto">
//                 <X className="h-3 w-3 text-red-400" />
//               </button>
//             )}
//           </div>
//           {profile.partner_address_proof_url && !partnerDocs.address_proof_file && (
//             <div className="flex items-center justify-between mt-1">
//               <p className="text-[10px] text-green-600">✓ Current file uploaded</p>
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 className="h-5 text-[9px] text-rose-500"
//                 onClick={() => handleViewExistingFile(
//                   profile.partner_address_proof_url!,
//                   "Partner Address Proof",
//                   `partner-address-proof.${profile.partner_address_proof_url!.split('.').pop()}`
//                 )}
//               >
//                 <Eye className="h-2.5 w-2.5 mr-0.5" /> View
//               </Button>
//             </div>
//           )}
//           <input ref={partnerAddrRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
//             onChange={e => e.target.files?.[0] && setPartnerDocs(p => ({ ...p, address_proof_file: e.target.files![0] }))} />
//         </div>
//       </div>

//       {/* Partner Photo */}
//       <div>
//         <div
//           className="flex items-center gap-2 h-8 px-3 border border-dashed border-rose-300 rounded-md bg-white cursor-pointer hover:bg-rose-50"
//           onClick={() => partnerPhotoRef.current?.click()}
//         >
//           <Camera className="h-3.5 w-3.5 text-rose-500" />
//           <span className="text-xs text-slate-500 truncate">
//             {partnerDocs.photo_file ? partnerDocs.photo_file.name : 
//              (profile.partner_photo_url ? 'Change existing photo' : 'Upload Partner Photo')}
//           </span>
//           {partnerDocs.photo_file && (
//             <button type="button" onClick={e => { e.stopPropagation(); setPartnerDocs(p => ({ ...p, photo_file: null })); }} className="ml-auto">
//               <X className="h-3 w-3 text-red-400" />
//             </button>
//           )}
//         </div>
//         {profile.partner_photo_url && !partnerDocs.photo_file && (
//           <div className="flex items-center justify-between mt-1">
//             <p className="text-[10px] text-green-600">✓ Current photo uploaded</p>
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               className="h-5 text-[9px] text-rose-500"
//               onClick={() => handleViewExistingFile(
//                 profile.partner_photo_url!,
//                 "Partner Photo",
//                 `partner-photo.${profile.partner_photo_url!.split('.').pop()}`
//               )}
//             >
//               <Eye className="h-2.5 w-2.5 mr-0.5" /> View
//             </Button>
//           </div>
//         )}
//         <input ref={partnerPhotoRef} type="file" className="hidden" accept=".jpg,.jpeg,.png"
//           onChange={e => e.target.files?.[0] && setPartnerDocs(p => ({ ...p, photo_file: e.target.files![0] }))} />
//         <p className="text-[8px] text-rose-400 mt-1">Passport size photo (optional)</p>
//       </div>
//     </div>
//   )}
// </div>

//         {/* Additional Documents */}
//         <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
//           <div className="flex items-center justify-between mb-3">
//             <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
//               <FileCheck className="h-3.5 w-3.5" />Additional Documents
//             </p>
//             <Button
//               type="button"
//               variant="outline"
//               size="sm"
//               className="h-7 text-[10px] px-2 border-[#004aad]/20 text-[#004aad]"
//               onClick={() => addlRef.current?.click()}
//               disabled={additionalFiles.length >= 5}
//             >
//               <Plus className="h-3 w-3 mr-1" />Add File
//             </Button>
//             <input
//               ref={addlRef}
//               type="file"
//               className="hidden"
//               accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
//               multiple
//               onChange={e => {
//                 const files = Array.from(e.target.files || []) as File[];
//                 if (files.length + additionalFiles.length > 5) { toast.error('Max 5 additional files'); return; }
//                 setAdditionalFiles(p => [...p, ...files]);
//               }}
//             />
//           </div>
//           {additionalFiles.length > 0 ? (
//             <div className="space-y-1.5">
//               {additionalFiles.map((f, i) => (
//                 <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
//                   <div className="flex items-center gap-2">
//                     <FileText className="h-3.5 w-3.5 text-[#004aad]" />
//                     <div>
//                       <p className="text-xs font-medium text-slate-700">{f.name}</p>
//                       <p className="text-[9px] text-slate-400">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
//                     </div>
//                   </div>
//                   <button type="button" onClick={() => setAdditionalFiles(p => p.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600">
//                     <X className="h-3.5 w-3.5" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-[10px] text-slate-400">Company ID, college ID, reference letters, etc. Max 5 files.</p>
//           )}
//         </div>

//         {/* Submit */}
//         <Button
//           type="button"
//           onClick={handleUpload}
//           disabled={uploading}
//           className="w-full bg-gradient-to-r from-[#004aad] to-[#002a7a] hover:from-[#003a8c] hover:to-[#001e5a] text-white font-semibold"
//         >
//           {uploading ? (
//             <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading…</>
//           ) : (
//             <><Upload className="mr-2 h-4 w-4" />Update Documents</>
//           )}
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

// export default function DocumentsTab({
//   profile,
//   onDocumentClick,
//   getDocumentUrl,
//   isMobile = false,
//   onProfileRefresh,
// }: DocumentsTabProps) {
//   const [loading, setLoading] = useState(false);
//   const [additionalDocs, setAdditionalDocs] = useState<AdditionalDocument[]>([]);

//   const fetchDocuments = async () => {
//     setLoading(true);
//     try {
//       const response = await tenantDetailsApi.getDocuments();
//       if (response?.success === true) {
//         if (Array.isArray(response.data)) {
//           setAdditionalDocs(response.data);
//         } else if (response.data?.additional_documents && Array.isArray(response.data.additional_documents)) {
//           setAdditionalDocs(response.data.additional_documents);
//         } else {
//           setAdditionalDocs([]);
//         }
//       } else if (Array.isArray(response)) {
//         setAdditionalDocs(response);
//       } else if (profile.additional_documents && Array.isArray(profile.additional_documents)) {
//         setAdditionalDocs(profile.additional_documents);
//       } else {
//         setAdditionalDocs([]);
//       }
//     } catch {
//       if (profile.additional_documents && Array.isArray(profile.additional_documents)) {
//         setAdditionalDocs(profile.additional_documents);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchDocuments(); }, []);
//   useEffect(() => {
//     if (profile?.additional_documents && Array.isArray(profile.additional_documents)) {
//       setAdditionalDocs(profile.additional_documents);
//     }
//   }, [profile]);

//   const handleViewDocument = (url: string, title: string, filename: string) => {
//     const fullUrl = getDocumentUrl(url);
//     const ext = filename.split('.').pop()?.toLowerCase();
//     onDocumentClick({ open: true, url: fullUrl, title, type: ext === 'pdf' ? 'pdf' : 'image', downloadName: filename });
//   };

//   const handleDownloadDocument = (url: string, filename: string) => {
//     const link = document.createElement('a');
//     link.href = getDocumentUrl(url);
//     link.download = filename;
//     link.click();
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center py-16">
//         <div className="p-4 bg-[#e6f0ff] rounded-2xl mb-4">
//           <Loader2 className="h-8 w-8 animate-spin text-[#004aad]" />
//         </div>
//         <span className="text-sm font-medium text-slate-600">Loading your documents…</span>
//       </div>
//     );
//   }

//   return (
//     <div className={`space-y-4 ${isMobile ? 'pb-4' : 'pb-6'}`}>

//       {/* ── Upload Section ── */}
//       <UploadSection
//         isMobile={isMobile}
//         onUploadSuccess={() => {
//           fetchDocuments();
//           onProfileRefresh?.();
//         }}
//         profile={profile}
//         getDocumentUrl={getDocumentUrl}
//         onDocumentClick={onDocumentClick}
//       />

//       {/* ── Additional Documents Card ── */}
//       <Card className="border border-slate-200 shadow-sm overflow-hidden">
//         <CardHeader className={`${isMobile ? 'px-4 py-3' : 'px-6 pt-5'} bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20`}>
//           <div className="flex items-start justify-between">
//             <div className="flex items-center gap-3">
//               <div className="p-2.5 bg-gradient-to-br from-[#004aad] to-[#002a7a] rounded-xl shadow-md">
//                 <FileCheck className="h-4 w-4 text-white" />
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-slate-800">Additional Documents</h3>
//                 <p className="text-xs text-slate-400 mt-0.5">Other supporting documents</p>
//               </div>
//             </div>
//             <StatusBadge status={additionalDocs.length > 0 ? 'available' : 'pending'} />
//           </div>
//         </CardHeader>
//         <CardContent className={`${isMobile ? 'px-4 py-4' : 'p-6'}`}>
//           {additionalDocs.length > 0 ? (
//             <div className="space-y-4">
//               <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
//                 {additionalDocs.map((doc, i) => (
//                   <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
//                     <div className="p-4">
//                       <div className="flex items-start gap-3">
//                         <div className="p-2.5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
//                           <FileText className="h-4 w-4 text-[#004aad]" />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-semibold text-slate-800 truncate">{doc.filename || `Document ${i+1}`}</p>
//                           {doc.uploaded_at && (
//                             <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
//                               <Clock className="h-3 w-3" />
//                               <span>Uploaded: {format(parseISO(doc.uploaded_at), 'dd MMM yyyy')}</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                       <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 mt-4`}>
//                         <Button variant="outline" size="sm" onClick={() => handleViewDocument(doc.url, doc.filename || `Document ${i+1}`, doc.filename || `document-${i+1}`)} className="flex-1">
//                           <Eye className="h-3.5 w-3.5 mr-1.5 text-[#004aad]" />View
//                         </Button>
//                         <Button variant="outline" size="sm" onClick={() => handleDownloadDocument(doc.url, doc.filename || `document-${i+1}`)} className="flex-1">
//                           <Download className="h-3.5 w-3.5 mr-1.5 text-[#ffc107]" />Download
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div className="text-center py-8">
//               <div className="inline-flex p-4 bg-gradient-to-br from-[#e6f0ff] to-[#f0f5ff] rounded-full mb-4">
//                 <FileText className="h-8 w-8 text-[#004aad]" />
//               </div>
//               <p className="text-sm font-semibold text-slate-800 mb-1">No Additional Documents</p>
//               <p className="text-xs text-slate-400 max-w-sm mx-auto">Use the Upload section above to add documents</p>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* ── Summary ── */}
//       <Card className="bg-gradient-to-br from-[#e6f0ff] to-[#f0f5ff] border border-[#004aad]/20">
//         <CardContent className="p-4">
//           <div className="flex items-center justify-between mb-3">
//             <div className="flex items-center gap-2">
//               <FileCheck className="h-4 w-4 text-[#004aad]" />
//               <span className="text-xs font-medium text-[#004aad]">Document Summary</span>
//             </div>
//             <Badge className="bg-[#004aad] text-white border-none text-[10px] px-2 py-0.5">
//               {[profile.id_proof_url?1:0, profile.address_proof_url?1:0, additionalDocs.length].reduce((a,b)=>a+b,0)} Total
//             </Badge>
//           </div>
//           <div className="grid grid-cols-3 gap-2">
//             <div className="text-center">
//               <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1 ${profile.id_proof_url ? 'bg-[#004aad]' : 'bg-white'}`}>
//                 <IdCard className={`h-5 w-5 ${profile.id_proof_url ? 'text-white' : 'text-slate-400'}`} />
//               </div>
//               <p className="text-[9px] font-medium text-slate-600">ID Proof</p>
//               {profile.id_proof_url && <p className="text-[7px] text-green-600">✓ Uploaded</p>}
//               {profile.id_proof_type && <p className="text-[7px] text-slate-400">{profile.id_proof_type}</p>}
//             </div>
//             <div className="text-center">
//               <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1 ${profile.address_proof_url ? 'bg-[#ffc107]' : 'bg-white'}`}>
//                 <Home className={`h-5 w-5 ${profile.address_proof_url ? 'text-white' : 'text-slate-400'}`} />
//               </div>
//               <p className="text-[9px] font-medium text-slate-600">Address</p>
//               {profile.address_proof_url && <p className="text-[7px] text-green-600">✓ Uploaded</p>}
//               {profile.address_proof_type && <p className="text-[7px] text-slate-400">{profile.address_proof_type}</p>}
//             </div>
//             <div className="text-center">
//               <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1 ${additionalDocs.length > 0 ? 'bg-[#004aad]' : 'bg-white'}`}>
//                 <FileText className={`h-5 w-5 ${additionalDocs.length > 0 ? 'text-white' : 'text-slate-400'}`} />
//               </div>
//               <p className="text-[9px] font-medium text-slate-600">Additional</p>
//               {additionalDocs.length > 0 ? <p className="text-[7px] text-green-600">{additionalDocs.length} file(s)</p> : <p className="text-[7px] text-slate-400">None</p>}
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


// components/tenant/profile/DocumentsTab.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  FileText, MapPin, Download, Eye, Upload, Camera,
  IdCard, Home, FileCheck, Clock, CheckCircle2, AlertCircle,
  File, FileImage, Loader2, X, Plus, Heart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TenantProfile, AdditionalDocument, tenantDetailsApi } from '@/lib/tenantDetailsApi';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocumentsTabProps {
  profile: TenantProfile;
  onDocumentClick: (docData: any) => void;
  getDocumentUrl: (url: string) => string;
  isMobile?: boolean;
  onProfileRefresh?: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: 'available' | 'required' | 'pending' }) => {
  const config = {
    available: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', icon: CheckCircle2, label: 'Available' },
    required:  { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', icon: AlertCircle, label: 'Required' },
    pending:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200',   icon: Clock,       label: 'Pending'   },
  };
  const { bg, text, border, icon: Icon, label } = config[status];
  return (
    <Badge className={`${bg} ${text} ${border} border text-[10px] px-2 py-0.5 font-medium`}>
      <Icon className="h-3 w-3 mr-1" />{label}
    </Badge>
  );
};

// ─── Existing Document Preview Card Component ─────────────────────────────────

function ExistingDocumentPreview({
  fileName,
  fileUrl,
  docType,
  docNumber,
  onView,
  icon: Icon,
  iconColor = "text-[#004aad]",
  bgColor = "bg-[#e6f0ff]"
}: {
  fileName: string;
  fileUrl: string;
  docType?: string;
  docNumber?: string;
  onView: () => void;
  icon: any;
  iconColor?: string;
  bgColor?: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-3 mb-3 border`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          <span className="text-xs font-semibold text-slate-700">Current Document</span>
        </div>
        <Badge className="bg-green-50 text-green-600 border-green-200 text-[9px]">Uploaded</Badge>
      </div>
      
      <div className="bg-white rounded-lg p-3 border border-slate-200">
        <div className="flex items-center gap-3">
          {fileUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
            <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
              <img 
                src={fileUrl} 
                alt={fileName} 
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-lg bg-[#e6f0ff] flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#004aad]" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">{fileName}</p>
            {docType && (
              <p className="text-[10px] text-slate-500 mt-0.5">
                Type: {docType}
              </p>
            )}
            {docNumber && (
              <p className="text-[10px] text-slate-500">
                Number: {docNumber}
              </p>
            )}
          </div>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-[11px] text-[#004aad]"
            onClick={onView}
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> View
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Upload section component (ALWAYS VISIBLE) ─────────────────────────────────

function UploadSection({
  isMobile,
  onUploadSuccess,
  profile,
  getDocumentUrl,
  onDocumentClick,
}: {
  isMobile: boolean;
  onUploadSuccess: () => void;
  profile: TenantProfile;
  getDocumentUrl: (url: string) => string;
  onDocumentClick: (docData: any) => void;
}) {
  const [uploading, setUploading] = useState(false);
  
  // Form states with existing values from profile
  const [idProofType, setIdProofType] = useState(profile.id_proof_type || '');
  const [idProofNumber, setIdProofNumber] = useState(profile.id_proof_number || '');
  const [addressProofType, setAddressProofType] = useState(profile.address_proof_type || '');
  const [addressProofNumber, setAddressProofNumber] = useState(profile.address_proof_number || '');
  
  // File states
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [partnerOpen, setPartnerOpen] = useState(false);

  // Partner documents state
  const [partnerDocs, setPartnerDocs] = useState({
    id_proof_type: (profile as any).partner_id_proof_type || '',
    id_proof_number: (profile as any).partner_id_proof_number || '',
    id_proof_file: null as File | null,
    address_proof_type: (profile as any).partner_address_proof_type || '',
    address_proof_number: (profile as any).partner_address_proof_number || '',
    address_proof_file: null as File | null,
    photo_file: null as File | null,
  });

  const idRef = useRef<HTMLInputElement>(null);
  const addrRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const addlRef = useRef<HTMLInputElement>(null);
  const partnerIdRef = useRef<HTMLInputElement>(null);
  const partnerAddrRef = useRef<HTMLInputElement>(null);
  const partnerPhotoRef = useRef<HTMLInputElement>(null);

  const SI = 'text-xs';
  const F = 'h-8 text-xs border-slate-200 focus:border-[#004aad]';
  const L = 'text-[9px] font-medium text-slate-500 uppercase tracking-wider mb-1 block';

  const handleViewExistingFile = (url: string, title: string, filename: string) => {
    const fullUrl = getDocumentUrl(url);
    const ext = filename.split('.').pop()?.toLowerCase();
    onDocumentClick({ open: true, url: fullUrl, title, type: ext === 'pdf' ? 'pdf' : 'image', downloadName: filename });
  };

  const handleUpload = async () => {
    if (!idProofFile && !addressProofFile && !photoFile && additionalFiles.length === 0 &&
        !partnerDocs.id_proof_file && !partnerDocs.address_proof_file && !partnerDocs.photo_file) {
      toast.error('Please select at least one file to upload');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      if (idProofFile) fd.append('id_proof_url', idProofFile);
      if (addressProofFile) fd.append('address_proof_url', addressProofFile);
      if (photoFile) fd.append('photo_url', photoFile);
      if (idProofType) fd.append('id_proof_type', idProofType);
      if (idProofNumber) fd.append('id_proof_number', idProofNumber);
      if (addressProofType) fd.append('address_proof_type', addressProofType);
      if (addressProofNumber) fd.append('address_proof_number', addressProofNumber);
additionalFiles.forEach(f => fd.append('additional_documents', f));
      
      // Append partner documents
      if (partnerDocs.id_proof_file) fd.append('partner_id_proof_url', partnerDocs.id_proof_file);
      if (partnerDocs.address_proof_file) fd.append('partner_address_proof_url', partnerDocs.address_proof_file);
      if (partnerDocs.photo_file) fd.append('partner_photo_url', partnerDocs.photo_file);
      if (partnerDocs.id_proof_type) fd.append('partner_id_proof_type', partnerDocs.id_proof_type);
      if (partnerDocs.id_proof_number) fd.append('partner_id_proof_number', partnerDocs.id_proof_number);
      if (partnerDocs.address_proof_type) fd.append('partner_address_proof_type', partnerDocs.address_proof_type);
      if (partnerDocs.address_proof_number) fd.append('partner_address_proof_number', partnerDocs.address_proof_number);

      const res = await tenantDetailsApi.uploadDocuments(fd);
      if (res.success) {
        toast.success('Documents uploaded successfully');
        setIdProofFile(null); setAddressProofFile(null); setPhotoFile(null);
        setAdditionalFiles([]);
        onUploadSuccess();
      } else {
        toast.error(res.message || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border border-[#004aad]/20 shadow-sm overflow-hidden">
      <div className="w-full px-5 py-3 bg-gradient-to-r from-[#004aad] to-[#002a7a]">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-[#ffc107]" />
          <span className="text-sm font-semibold text-white">Upload / Update Documents</span>
        </div>
      </div>

      <CardContent className={`${isMobile ? 'p-4' : 'p-5'} space-y-5`}>
        {/* ID Proof */}
        <div className="p-3 bg-[#e6f0ff] rounded-xl border border-[#004aad]/20">
          <p className="text-xs font-bold text-[#004aad] mb-3 flex items-center gap-1.5">
            <IdCard className="h-3.5 w-3.5" />Identity Proof
          </p>
          
          {/* Show existing ID Proof document in card format */}
          {profile.id_proof_url && (
            <ExistingDocumentPreview
              fileName={profile.id_proof_url.split('/').pop() || 'ID Proof'}
              fileUrl={getDocumentUrl(profile.id_proof_url)}
              docType={profile.id_proof_type}
              docNumber={profile.id_proof_number}
              onView={() => handleViewExistingFile(
                profile.id_proof_url!,
                "ID Proof Document",
                `id-proof.${profile.id_proof_url!.split('.').pop()}`
              )}
              icon={IdCard}
              iconColor="text-[#004aad]"
              bgColor="bg-[#e6f0ff]"
            />
          )}
          
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-3`}>
            <div>
              <label className={L}>ID Proof Type</label>
              <Select value={idProofType} onValueChange={setIdProofType}>
                <SelectTrigger className={F}>
                  <SelectValue placeholder={profile.id_proof_type || "Select type"} />
                </SelectTrigger>
                <SelectContent>
                  {['Aadhar Card','Passport','PAN Card','Driving Licence','Voter ID'].map(v => (
                    <SelectItem key={v} value={v} className={SI}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {profile.id_proof_type && !idProofType && (
                <p className="text-[10px] text-green-600 mt-1">Current: {profile.id_proof_type}</p>
              )}
            </div>
            <div>
              <label className={L}>
                {idProofType === 'Aadhar Card' ? 'Aadhar Number' :
                 idProofType === 'PAN Card' ? 'PAN Number' :
                 idProofType === 'Passport' ? 'Passport Number' : 'Document Number'}
              </label>
              <Input
                value={idProofNumber}
                placeholder={profile.id_proof_number || "Document number"}
                onChange={e => {
                  let v = e.target.value;
                  if (idProofType === 'Aadhar Card') v = v.replace(/\D/g,'').slice(0,12).replace(/(\d{4})(?=\d)/g,'$1 ');
                  else if (idProofType === 'PAN Card') v = v.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10);
                  else if (idProofType === 'Passport') v = v.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,9);
                  setIdProofNumber(v);
                }}
                className={F}
              />
              {profile.id_proof_number && !idProofNumber && (
                <p className="text-[10px] text-green-600 mt-1">Current: {profile.id_proof_number}</p>
              )}
            </div>
            <div>
              <label className={L}>Upload New File (Optional)</label>
              <div
                className="flex items-center gap-2 h-8 px-3 border border-dashed border-[#004aad]/40 rounded-md bg-white cursor-pointer hover:bg-[#e6f0ff] transition-colors"
                onClick={() => idRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5 text-[#004aad]" />
                <span className="text-xs text-slate-500 truncate">
                  {idProofFile ? idProofFile.name : 'Choose file to replace...'}
                </span>
                {idProofFile && (
                  <button type="button" onClick={e => { e.stopPropagation(); setIdProofFile(null); }} className="ml-auto">
                    <X className="h-3 w-3 text-red-400" />
                  </button>
                )}
              </div>
              <input ref={idRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={e => e.target.files?.[0] && setIdProofFile(e.target.files[0])} />
            </div>
          </div>
        </div>

        {/* Address Proof */}
        <div className="p-3 bg-[#fff9e6] rounded-xl border border-[#ffc107]/30">
          <p className="text-xs font-bold text-[#004aad] mb-3 flex items-center gap-1.5">
            <Home className="h-3.5 w-3.5 text-[#ffc107]" />Address Proof
          </p>
          
          {/* Show existing Address Proof document in card format */}
          {profile.address_proof_url && (
            <ExistingDocumentPreview
              fileName={profile.address_proof_url.split('/').pop() || 'Address Proof'}
              fileUrl={getDocumentUrl(profile.address_proof_url)}
              docType={profile.address_proof_type}
              docNumber={profile.address_proof_number}
              onView={() => handleViewExistingFile(
                profile.address_proof_url!,
                "Address Proof Document",
                `address-proof.${profile.address_proof_url!.split('.').pop()}`
              )}
              icon={Home}
              iconColor="text-[#ffc107]"
              bgColor="bg-[#fff9e6]"
            />
          )}
          
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-3`}>
            <div>
              <label className={L}>Address Proof Type</label>
              <Select value={addressProofType} onValueChange={setAddressProofType}>
                <SelectTrigger className={F}>
                  <SelectValue placeholder={profile.address_proof_type || "Select type"} />
                </SelectTrigger>
                <SelectContent>
                  {['Aadhar Card','Utility Bill','Bank Statement','Passport','Rental Agreement','Voter ID'].map(v => (
                    <SelectItem key={v} value={v} className={SI}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {profile.address_proof_type && !addressProofType && (
                <p className="text-[10px] text-green-600 mt-1">Current: {profile.address_proof_type}</p>
              )}
            </div>
            <div>
              <label className={L}>Document Number</label>
              <Input
                value={addressProofNumber}
                placeholder={profile.address_proof_number || "Document number"}
                onChange={e => {
                  let v = e.target.value;
                  if (addressProofType === 'Aadhar Card') v = v.replace(/\D/g,'').slice(0,12).replace(/(\d{4})(?=\d)/g,'$1 ');
                  setAddressProofNumber(v);
                }}
                className={F}
              />
              {profile.address_proof_number && !addressProofNumber && (
                <p className="text-[10px] text-green-600 mt-1">Current: {profile.address_proof_number}</p>
              )}
            </div>
            <div>
              <label className={L}>Upload New File (Optional)</label>
              <div
                className="flex items-center gap-2 h-8 px-3 border border-dashed border-[#ffc107]/50 rounded-md bg-white cursor-pointer hover:bg-[#fff9e6] transition-colors"
                onClick={() => addrRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5 text-[#ffc107]" />
                <span className="text-xs text-slate-500 truncate">
                  {addressProofFile ? addressProofFile.name : 'Choose file to replace...'}
                </span>
                {addressProofFile && (
                  <button type="button" onClick={e => { e.stopPropagation(); setAddressProofFile(null); }} className="ml-auto">
                    <X className="h-3 w-3 text-red-400" />
                  </button>
                )}
              </div>
              <input ref={addrRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={e => e.target.files?.[0] && setAddressProofFile(e.target.files[0])} />
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5" />Photograph
          </p>
          
          {/* Show existing photo in card format */}
          {profile.photo_url && (
            <ExistingDocumentPreview
              fileName={profile.photo_url.split('/').pop() || 'Profile Photo'}
              fileUrl={getDocumentUrl(profile.photo_url)}
              onView={() => handleViewExistingFile(
                profile.photo_url!,
                "Profile Photo",
                `photo.${profile.photo_url!.split('.').pop()}`
              )}
              icon={Camera}
              iconColor="text-slate-500"
              bgColor="bg-slate-50"
            />
          )}
          
          <div
            className="flex items-center gap-2 h-8 px-3 border border-dashed border-slate-300 rounded-md bg-white cursor-pointer hover:bg-slate-50 transition-colors max-w-xs"
            onClick={() => photoRef.current?.click()}
          >
            <Camera className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 truncate">
              {photoFile ? photoFile.name : 'Upload new photo...'}
            </span>
            {photoFile && (
              <button type="button" onClick={e => { e.stopPropagation(); setPhotoFile(null); }} className="ml-auto">
                <X className="h-3 w-3 text-red-400" />
              </button>
            )}
          </div>
          <input ref={photoRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp"
            onChange={e => e.target.files?.[0] && setPhotoFile(e.target.files[0])} />
        </div>
        
        {/* Partner Documents Section - Collapsible */}
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
          <button
            type="button"
            onClick={() => setPartnerOpen(!partnerOpen)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="text-sm font-semibold text-rose-700">Partner Documents</span>
              {(profile.partner_full_name || partnerDocs.id_proof_type || partnerDocs.address_proof_type) && (
                <Badge className="bg-rose-200 text-rose-700 text-[9px] px-1.5">Added</Badge>
              )}
            </div>
            {partnerOpen ? (
              <ChevronUp className="h-4 w-4 text-rose-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-rose-500" />
            )}
          </button>
          
          {partnerOpen && (
            <div className="mt-3 space-y-3">
              {profile.partner_full_name && (
                <div className="text-xs text-rose-600 bg-rose-100 p-2 rounded-lg">
                  Partner: {profile.partner_full_name}
                </div>
              )}
              
              {/* Partner ID Proof */}
              <div>
                <label className="text-[10px] font-medium text-rose-600 mb-1 block">Partner ID Proof Type</label>
                <Select 
                  value={partnerDocs.id_proof_type} 
                  onValueChange={(v) => setPartnerDocs(p => ({ ...p, id_proof_type: v }))}
                >
                  <SelectTrigger className="h-8 text-xs border-rose-200 focus:border-rose-400">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Aadhar Card','Passport','PAN Card','Driving Licence','Voter ID'].map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(profile as any).partner_id_proof_type && !partnerDocs.id_proof_type && (
                  <p className="text-[10px] text-green-600 mt-1">Current: {(profile as any).partner_id_proof_type}</p>
                )}
                
                {partnerDocs.id_proof_type && (
                  <div className="mt-2">
                    <label className="text-[10px] font-medium text-rose-600 mb-1 block">
                      {partnerDocs.id_proof_type === 'Aadhar Card' ? 'Aadhar Number' : 
                       partnerDocs.id_proof_type === 'PAN Card' ? 'PAN Number' : 'Document Number'}
                    </label>
                    <Input
                      value={partnerDocs.id_proof_number}
                      onChange={e => setPartnerDocs(p => ({ ...p, id_proof_number: e.target.value }))}
                      placeholder="Document number"
                      className="h-8 text-xs"
                    />
                    {(profile as any).partner_id_proof_number && !partnerDocs.id_proof_number && (
                      <p className="text-[10px] text-green-600 mt-1">Current: {(profile as any).partner_id_proof_number}</p>
                    )}
                  </div>
                )}
                
                <div className="mt-2">
                  <div
                    className="flex items-center gap-2 h-8 px-3 border border-dashed border-rose-300 rounded-md bg-white cursor-pointer hover:bg-rose-50"
                    onClick={() => partnerIdRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-xs text-slate-500 truncate">
                      {partnerDocs.id_proof_file ? partnerDocs.id_proof_file.name : 
                       ((profile as any).partner_id_proof_url ? 'Change existing file' : 'Upload Partner ID Proof')}
                    </span>
                    {partnerDocs.id_proof_file && (
                      <button type="button" onClick={e => { e.stopPropagation(); setPartnerDocs(p => ({ ...p, id_proof_file: null })); }} className="ml-auto">
                        <X className="h-3 w-3 text-red-400" />
                      </button>
                    )}
                  </div>
{/* Show existing Partner ID Proof in card format */}
{(profile as any).partner_id_proof_url && (
  <ExistingDocumentPreview
    fileName={(profile as any).partner_id_proof_url.split('/').pop() || 'Partner ID Proof'}
    fileUrl={getDocumentUrl((profile as any).partner_id_proof_url)}
    docType={(profile as any).partner_id_proof_type}
    docNumber={(profile as any).partner_id_proof_number}
    onView={() => handleViewExistingFile(
      (profile as any).partner_id_proof_url,
      "Partner ID Proof",
      `partner-id-proof.${(profile as any).partner_id_proof_url.split('.').pop()}`
    )}
    icon={IdCard}
    iconColor="text-rose-500"
    bgColor="bg-rose-50"
  />
)}
                  <input ref={partnerIdRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => e.target.files?.[0] && setPartnerDocs(p => ({ ...p, id_proof_file: e.target.files![0] }))} />
                </div>
              </div>

              {/* Partner Address Proof */}
              <div>
                <label className="text-[10px] font-medium text-rose-600 mb-1 block">Partner Address Proof Type</label>
                <Select 
                  value={partnerDocs.address_proof_type} 
                  onValueChange={(v) => setPartnerDocs(p => ({ ...p, address_proof_type: v }))}
                >
                  <SelectTrigger className="h-8 text-xs border-rose-200 focus:border-rose-400">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Aadhar Card','Utility Bill','Bank Statement','Passport','Voter ID'].map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(profile as any).partner_address_proof_type && !partnerDocs.address_proof_type && (
                  <p className="text-[10px] text-green-600 mt-1">Current: {(profile as any).partner_address_proof_type}</p>
                )}
                
                {partnerDocs.address_proof_type && (
                  <div className="mt-2">
                    <label className="text-[10px] font-medium text-rose-600 mb-1 block">Document Number</label>
                    <Input
                      value={partnerDocs.address_proof_number}
                      onChange={e => setPartnerDocs(p => ({ ...p, address_proof_number: e.target.value }))}
                      placeholder="Document number"
                      className="h-8 text-xs"
                    />
                    {(profile as any).partner_address_proof_number && !partnerDocs.address_proof_number && (
                      <p className="text-[10px] text-green-600 mt-1">Current: {(profile as any).partner_address_proof_number}</p>
                    )}
                  </div>
                )}
                
                <div className="mt-2">
                  <div
                    className="flex items-center gap-2 h-8 px-3 border border-dashed border-rose-300 rounded-md bg-white cursor-pointer hover:bg-rose-50"
                    onClick={() => partnerAddrRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-xs text-slate-500 truncate">
                      {partnerDocs.address_proof_file ? partnerDocs.address_proof_file.name : 
                       ((profile as any).partner_address_proof_url ? 'Change existing file' : 'Upload Partner Address Proof')}
                    </span>
                    {partnerDocs.address_proof_file && (
                      <button type="button" onClick={e => { e.stopPropagation(); setPartnerDocs(p => ({ ...p, address_proof_file: null })); }} className="ml-auto">
                        <X className="h-3 w-3 text-red-400" />
                      </button>
                    )}
                  </div>
                  {(profile as any).partner_address_proof_url && (
  <ExistingDocumentPreview
    fileName={(profile as any).partner_address_proof_url.split('/').pop() || 'Partner Address Proof'}
    fileUrl={getDocumentUrl((profile as any).partner_address_proof_url)}
    docType={(profile as any).partner_address_proof_type}
    docNumber={(profile as any).partner_address_proof_number}
    onView={() => handleViewExistingFile(
      (profile as any).partner_address_proof_url,
      "Partner Address Proof",
      `partner-address-proof.${(profile as any).partner_address_proof_url.split('.').pop()}`
    )}
    icon={Home}
    iconColor="text-rose-500"
    bgColor="bg-rose-50"
  />
)}
                  <input ref={partnerAddrRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => e.target.files?.[0] && setPartnerDocs(p => ({ ...p, address_proof_file: e.target.files![0] }))} />
                </div>
              </div>

              {/* Partner Photo */}
              <div>
                <div
                  className="flex items-center gap-2 h-8 px-3 border border-dashed border-rose-300 rounded-md bg-white cursor-pointer hover:bg-rose-50"
                  onClick={() => partnerPhotoRef.current?.click()}
                >
                  <Camera className="h-3.5 w-3.5 text-rose-500" />
                  <span className="text-xs text-slate-500 truncate">
                    {partnerDocs.photo_file ? partnerDocs.photo_file.name : 
                     ((profile as any).partner_photo_url ? 'Change existing photo' : 'Upload Partner Photo')}
                  </span>
                  {partnerDocs.photo_file && (
                    <button type="button" onClick={e => { e.stopPropagation(); setPartnerDocs(p => ({ ...p, photo_file: null })); }} className="ml-auto">
                      <X className="h-3 w-3 text-red-400" />
                    </button>
                  )}
                </div>
              {/* Show existing Partner Photo in card format */}
{(profile as any).partner_photo_url && (
  <ExistingDocumentPreview
    fileName={(profile as any).partner_photo_url.split('/').pop() || 'Partner Photo'}
    fileUrl={getDocumentUrl((profile as any).partner_photo_url)}
    onView={() => handleViewExistingFile(
      (profile as any).partner_photo_url,
      "Partner Photo",
      `partner-photo.${(profile as any).partner_photo_url.split('.').pop()}`
    )}
    icon={Camera}
    iconColor="text-rose-500"
    bgColor="bg-rose-50"
  />
)}
                <input ref={partnerPhotoRef} type="file" className="hidden" accept=".jpg,.jpeg,.png"
                  onChange={e => e.target.files?.[0] && setPartnerDocs(p => ({ ...p, photo_file: e.target.files![0] }))} />
                <p className="text-[8px] text-rose-400 mt-1">Passport size photo (optional)</p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Documents */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5" />Additional Documents
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-[10px] px-2 border-[#004aad]/20 text-[#004aad]"
              onClick={() => addlRef.current?.click()}
              disabled={additionalFiles.length >= 5}
            >
              <Plus className="h-3 w-3 mr-1" />Add File
            </Button>
            <input
              ref={addlRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              multiple
              onChange={e => {
                const files = Array.from(e.target.files || []) as File[];
                if (files.length + additionalFiles.length > 5) { toast.error('Max 5 additional files'); return; }
                setAdditionalFiles(p => [...p, ...files]);
              }}
            />
          </div>
          {additionalFiles.length > 0 ? (
            <div className="space-y-1.5">
              {additionalFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-[#004aad]" />
                    <div>
                      <p className="text-xs font-medium text-slate-700">{f.name}</p>
                      <p className="text-[9px] text-slate-400">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setAdditionalFiles(p => p.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-slate-400">Company ID, college ID, reference letters, etc. Max 5 files.</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-gradient-to-r from-[#004aad] to-[#002a7a] hover:from-[#003a8c] hover:to-[#001e5a] text-white font-semibold"
        >
          {uploading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading…</>
          ) : (
            <><Upload className="mr-2 h-4 w-4" />Update Documents</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function DocumentsTab({
  profile,
  onDocumentClick,
  getDocumentUrl,
  isMobile = false,
  onProfileRefresh,
}: DocumentsTabProps) {
  const [loading, setLoading] = useState(false);
  const [additionalDocs, setAdditionalDocs] = useState<AdditionalDocument[]>([]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await tenantDetailsApi.getDocuments();
      if (response?.success === true) {
        if (Array.isArray(response.data)) {
          setAdditionalDocs(response.data);
        } else if (response.data?.additional_documents && Array.isArray(response.data.additional_documents)) {
          setAdditionalDocs(response.data.additional_documents);
        } else {
          setAdditionalDocs([]);
        }
      } else if (Array.isArray(response)) {
        setAdditionalDocs(response);
      } else if (profile.additional_documents && Array.isArray(profile.additional_documents)) {
        setAdditionalDocs(profile.additional_documents);
      } else {
        setAdditionalDocs([]);
      }
    } catch {
      if (profile.additional_documents && Array.isArray(profile.additional_documents)) {
        setAdditionalDocs(profile.additional_documents);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);
  useEffect(() => {
    if (profile?.additional_documents && Array.isArray(profile.additional_documents)) {
      setAdditionalDocs(profile.additional_documents);
    }
  }, [profile]);

  const handleViewDocument = (url: string, title: string, filename: string) => {
    const fullUrl = getDocumentUrl(url);
    const ext = filename.split('.').pop()?.toLowerCase();
    onDocumentClick({ open: true, url: fullUrl, title, type: ext === 'pdf' ? 'pdf' : 'image', downloadName: filename });
  };

  const handleDownloadDocument = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = getDocumentUrl(url);
    link.download = filename;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 bg-[#e6f0ff] rounded-2xl mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#004aad]" />
        </div>
        <span className="text-sm font-medium text-slate-600">Loading your documents…</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isMobile ? 'pb-4' : 'pb-6'}`}>

      {/* ── Upload Section ── */}
      <UploadSection
        isMobile={isMobile}
        onUploadSuccess={() => {
          fetchDocuments();
          onProfileRefresh?.();
        }}
        profile={profile}
        getDocumentUrl={getDocumentUrl}
        onDocumentClick={onDocumentClick}
      />

      {/* ── Additional Documents Card ── */}
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
            <StatusBadge status={additionalDocs.length > 0 ? 'available' : 'pending'} />
          </div>
        </CardHeader>
        <CardContent className={`${isMobile ? 'px-4 py-4' : 'p-6'}`}>
          {additionalDocs.length > 0 ? (
            <div className="space-y-4">
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
                {additionalDocs.map((doc, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
                          <FileText className="h-4 w-4 text-[#004aad]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{doc.filename || `Document ${i+1}`}</p>
                          {doc.uploaded_at && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                              <Clock className="h-3 w-3" />
                              <span>Uploaded: {format(parseISO(doc.uploaded_at), 'dd MMM yyyy')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 mt-4`}>
                        <Button variant="outline" size="sm" onClick={() => handleViewDocument(doc.url, doc.filename || `Document ${i+1}`, doc.filename || `document-${i+1}`)} className="flex-1">
                          <Eye className="h-3.5 w-3.5 mr-1.5 text-[#004aad]" />View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadDocument(doc.url, doc.filename || `document-${i+1}`)} className="flex-1">
                          <Download className="h-3.5 w-3.5 mr-1.5 text-[#ffc107]" />Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex p-4 bg-gradient-to-br from-[#e6f0ff] to-[#f0f5ff] rounded-full mb-4">
                <FileText className="h-8 w-8 text-[#004aad]" />
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">No Additional Documents</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Use the Upload section above to add documents</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Summary ── */}
      <Card className="bg-gradient-to-br from-[#e6f0ff] to-[#f0f5ff] border border-[#004aad]/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-[#004aad]" />
              <span className="text-xs font-medium text-[#004aad]">Document Summary</span>
            </div>
            <Badge className="bg-[#004aad] text-white border-none text-[10px] px-2 py-0.5">
              {[profile.id_proof_url?1:0, profile.address_proof_url?1:0, additionalDocs.length].reduce((a,b)=>a+b,0)} Total
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1 ${profile.id_proof_url ? 'bg-[#004aad]' : 'bg-white'}`}>
                <IdCard className={`h-5 w-5 ${profile.id_proof_url ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <p className="text-[9px] font-medium text-slate-600">ID Proof</p>
              {profile.id_proof_url && <p className="text-[7px] text-green-600">✓ Uploaded</p>}
              {profile.id_proof_type && <p className="text-[7px] text-slate-400">{profile.id_proof_type}</p>}
            </div>
            <div className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1 ${profile.address_proof_url ? 'bg-[#ffc107]' : 'bg-white'}`}>
                <Home className={`h-5 w-5 ${profile.address_proof_url ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <p className="text-[9px] font-medium text-slate-600">Address</p>
              {profile.address_proof_url && <p className="text-[7px] text-green-600">✓ Uploaded</p>}
              {profile.address_proof_type && <p className="text-[7px] text-slate-400">{profile.address_proof_type}</p>}
            </div>
            <div className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1 ${additionalDocs.length > 0 ? 'bg-[#004aad]' : 'bg-white'}`}>
                <FileText className={`h-5 w-5 ${additionalDocs.length > 0 ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <p className="text-[9px] font-medium text-slate-600">Additional</p>
              {additionalDocs.length > 0 ? <p className="text-[7px] text-green-600">{additionalDocs.length} file(s)</p> : <p className="text-[7px] text-slate-400">None</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}