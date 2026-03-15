// // import { useState, useEffect } from 'react';
// // import { FileText, Eye, Share2, Trash2, Clock, CheckCircle, X, Printer, ArrowRight, AlertCircle, Send, Users } from 'lucide-react';
// // // import { supabase } from '../../lib/supabase';
// // import { Document, DocumentStatusHistory } from '../../types/document';
// // import { DataTable } from '../../components/common/DataTable';

// // import { Toast } from '../../components/common/Toast';
// // import { WorkflowProgressBar } from '@/components/common/WorkflowProgressBar';

// // export function DocumentList() {
// //   const [documents, setDocuments] = useState<Document[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [showViewModal, setShowViewModal] = useState(false);
// //   const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
// //   const [showHistoryModal, setShowHistoryModal] = useState(false);
// //   const [showShareModal, setShowShareModal] = useState(false);
// //   const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
// //   const [documentHistory, setDocumentHistory] = useState<DocumentStatusHistory[]>([]);
// //   const [shareData, setShareData] = useState({
// //     method: 'Email',
// //     recipient_name: '',
// //     recipient_contact: '',
// //     verification_method: 'Email'
// //   });
// //   const [sharing, setSharing] = useState(false);

// //   useEffect(() => {
// //     fetchDocuments();
// //   }, []);

// //   const fetchDocuments = async () => {
// //     try {
// //       const { data, error } = await supabase
// //         .from('documents')
// //         .select('*')
// //         .order('created_at', { ascending: false });

// //       if (error) throw error;
// //       setDocuments(data || []);
// //     } catch (error) {
// //       console.error('Error fetching documents:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleView = (doc: Document) => {
// //     setSelectedDocument(doc);
// //     setShowViewModal(true);
// //   };

// //   const handleViewHistory = async (doc: Document) => {
// //     setSelectedDocument(doc);
// //     try {
// //       const { data, error } = await supabase
// //         .from('document_status_history')
// //         .select('*')
// //         .eq('document_id', doc.id)
// //         .order('created_at', { ascending: false });

// //       if (error) throw error;
// //       setDocumentHistory(data || []);
// //       setShowHistoryModal(true);
// //     } catch (error) {
// //       console.error('Error fetching history:', error);
// //     }
// //   };

// //   const handleShare = (doc: Document) => {
// //     setSelectedDocument(doc);
// //     setShareData({
// //       method: 'Email',
// //       recipient_name: doc.tenant_name,
// //       recipient_contact: doc.tenant_email || doc.tenant_phone,
// //       verification_method: 'Email'
// //     });
// //     setShowShareModal(true);
// //   };

// //   const generateOTP = () => {
// //     return Math.floor(100000 + Math.random() * 900000).toString();
// //   };

// //   const generateAccessToken = () => {
// //     return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
// //   };

// //   const handleShareSubmit = async () => {
// //     if (!selectedDocument) return;

// //     try {
// //       setSharing(true);

// //       const otp = generateOTP();
// //       const accessToken = generateAccessToken();
// //       const shareLink = `${window.location.origin}/documents/view/${accessToken}`;

// //       const expiresAt = new Date();
// //       expiresAt.setDate(expiresAt.getDate() + 30);

// //       const { error: shareError } = await supabase
// //         .from('document_shares')
// //         .insert([{
// //           document_id: selectedDocument.id,
// //           share_method: shareData.method,
// //           recipient_name: shareData.recipient_name,
// //           recipient_contact: shareData.recipient_contact,
// //           share_link: shareLink,
// //           access_token: accessToken,
// //           otp_code: otp,
// //           otp_verified: false,
// //           verification_method: shareData.verification_method,
// //           expires_at: expiresAt.toISOString(),
// //           shared_by: 'Admin'
// //         }]);

// //       if (shareError) throw shareError;

// //       const { error: docError } = await supabase
// //         .from('documents')
// //         .update({ status: 'Shared' })
// //         .eq('id', selectedDocument.id);

// //       if (docError) throw docError;

// //       const { error: historyError } = await supabase
// //         .from('document_status_history')
// //         .insert([{
// //           document_id: selectedDocument.id,
// //           status: 'Shared',
// //           event_type: 'Shared',
// //           event_description: `Document shared via ${shareData.method} to ${shareData.recipient_name}`,
// //           performed_by: 'Admin',
// //           metadata: {
// //             method: shareData.method,
// //             recipient: shareData.recipient_contact
// //           }
// //         }]);

// //       if (historyError) throw historyError;

// //       alert(`Document shared successfully!\n\nShare Link: ${shareLink}\nOTP: ${otp}\n\nThe recipient will need to verify with OTP to access the document.`);

// //       await fetchDocuments();
// //       setShowShareModal(false);
// //     } catch (error) {
// //       console.error('Error sharing document:', error);
// //       alert('Failed to share document');
// //     } finally {
// //       setSharing(false);
// //     }
// //   };

// //   const handleDelete = async (id: string) => {
// //     if (!confirm('Are you sure you want to delete this document?')) return;

// //     try {
// //       const doc = documents.find(d => d.id === id);

// //       const { error: historyError } = await supabase
// //         .from('document_status_history')
// //         .insert([{
// //           document_id: id,
// //           status: 'Deleted',
// //           event_type: 'Deleted',
// //           event_description: `Document "${doc?.document_name}" deleted`,
// //           performed_by: 'Admin',
// //           metadata: {}
// //         }]);

// //       if (historyError) throw historyError;

// //       const { error } = await supabase
// //         .from('documents')
// //         .delete()
// //         .eq('id', id);

// //       if (error) throw error;

// //       await fetchDocuments();
// //     } catch (error) {
// //       console.error('Error deleting document:', error);
// //       alert('Failed to delete document');
// //     }
// //   };

// //   const handleBulkDelete = async (docs: Document[]) => {
// //     if (!confirm(`Are you sure you want to delete ${docs.length} document(s)?`)) return;

// //     try {
// //       const ids = docs.map(d => d.id);
// //       const { error } = await supabase
// //         .from('documents')
// //         .delete()
// //         .in('id', ids);

// //       if (error) throw error;
// //       await fetchDocuments();
// //       alert(`Successfully deleted ${docs.length} document(s)`);
// //     } catch (error) {
// //       console.error('Error deleting documents:', error);
// //       alert('Failed to delete documents');
// //     }
// //   };

// //   const handleBulkStatusChange = async (docs: Document[], newStatus: string) => {
// //     try {
// //       const ids = docs.map(d => d.id);

// //       const nextActions: Record<string, string> = {
// //         'Created': 'Share with Tenant',
// //         'Shared': 'Wait for Tenant to View',
// //         'Viewed': 'Verify Tenant Identity',
// //         'Verified': 'Mark as Completed',
// //         'Completed': 'Archive Document'
// //       };

// //       const { error } = await supabase
// //         .from('documents')
// //         .update({
// //           status: newStatus,
// //           workflow_stage: newStatus.toLowerCase(),
// //           next_action: nextActions[newStatus] || 'Update Status',
// //           last_action_at: new Date().toISOString(),
// //           updated_at: new Date().toISOString()
// //         })
// //         .in('id', ids);

// //       if (error) throw error;

// //       for (const doc of docs) {
// //         await supabase
// //           .from('document_status_history')
// //           .insert([{
// //             document_id: doc.id,
// //             status: newStatus,
// //             event_type: 'Updated',
// //             event_description: `Status changed to ${newStatus} (Bulk Action)`,
// //             performed_by: 'Admin',
// //             metadata: { bulk_action: true }
// //           }]);
// //       }

// //       await fetchDocuments();
// //       alert(`Successfully updated ${docs.length} document(s) to ${newStatus}`);
// //     } catch (error) {
// //       console.error('Error updating documents:', error);
// //       alert('Failed to update documents');
// //     }
// //   };

// //   const handleProgressDocument = async (doc: Document) => {
// //     const statusFlow: Record<string, string> = {
// //       'Created': 'Shared',
// //       'Shared': 'Viewed',
// //       'Viewed': 'Verified',
// //       'Verified': 'Completed'
// //     };

// //     const nextStatus = statusFlow[doc.status];
// //     if (!nextStatus) {
// //       alert('Document is already at final status');
// //       return;
// //     }

// //     const stageDescriptions: Record<string, string> = {
// //       'Shared': 'Document has been shared with recipient',
// //       'Viewed': 'Recipient has viewed the document',
// //       'Verified': 'Recipient identity has been verified',
// //       'Completed': 'Document workflow completed'
// //     };

// //     try {
// //       const nextActions: Record<string, string> = {
// //         'Created': 'Share with Tenant',
// //         'Shared': 'Wait for Tenant to View',
// //         'Viewed': 'Verify Tenant Identity',
// //         'Verified': 'Mark as Completed',
// //         'Completed': 'Archive Document'
// //       };

// //       const { error: updateError } = await supabase
// //         .from('documents')
// //         .update({
// //           status: nextStatus,
// //           workflow_stage: nextStatus.toLowerCase(),
// //           next_action: nextActions[nextStatus] || 'Update Status',
// //           last_action_at: new Date().toISOString(),
// //           updated_at: new Date().toISOString()
// //         })
// //         .eq('id', doc.id);

// //       if (updateError) throw updateError;

// //       const { error: historyError } = await supabase
// //         .from('document_status_history')
// //         .insert([{
// //           document_id: doc.id,
// //           status: nextStatus,
// //           event_type: 'Progressed',
// //           event_description: `Workflow advanced from ${doc.status} to ${nextStatus}`,
// //           performed_by: 'Admin',
// //           metadata: {
// //             previous_status: doc.status,
// //             new_status: nextStatus
// //           }
// //         }]);

// //       if (historyError) throw historyError;

// //       await fetchDocuments();

// //       setToast({
// //         message: `Workflow advanced to "${nextStatus}" stage. ${stageDescriptions[nextStatus]}`,
// //         type: 'success'
// //       });
// //     } catch (error) {
// //       console.error('Error progressing document:', error);
// //       setToast({
// //         message: 'Failed to progress document',
// //         type: 'error'
// //       });
// //     }
// //   };

// //   const handlePrint = (doc: Document) => {
// //     const printWindow = window.open('', '_blank');
// //     if (printWindow) {
// //       printWindow.document.write(doc.html_content);
// //       printWindow.document.close();
// //       printWindow.print();
// //     }
// //   };

// //   const getStatusBadgeClass = (status: string) => {
// //     switch (status) {
// //       case 'Created': return 'bg-blue-100 text-blue-700';
// //       case 'Shared': return 'bg-purple-100 text-purple-700';
// //       case 'Viewed': return 'bg-yellow-100 text-yellow-700';
// //       case 'Verified': return 'bg-green-100 text-green-700';
// //       case 'Completed': return 'bg-emerald-100 text-emerald-700';
// //       default: return 'bg-gray-100 text-gray-700';
// //     }
// //   };

// //   const columns = [
// //     {
// //       key: 'document_number',
// //       label: 'Document #',
// //       render: (row: Document) => (
// //         <span className="font-mono font-bold text-blue-600">{row.document_number}</span>
// //       )
// //     },
// //     {
// //       key: 'document_name',
// //       label: 'Document Name',
// //       render: (row: Document) => (
// //         <div className="min-w-[280px]">
// //           <div className="font-bold text-gray-900">{row.document_name}</div>
// //           <div className="text-sm text-gray-500 mb-2">{row.tenant_name}</div>
// //           <WorkflowProgressBar currentStatus={row.status} compact />
// //         </div>
// //       )
// //     },
// //     {
// //       key: 'property_name',
// //       label: 'Property',
// //       render: (row: Document) => (
// //         <div className="text-sm">
// //           <div className="font-semibold text-gray-700">{row.property_name || 'N/A'}</div>
// //           {row.room_number && (
// //             <div className="text-gray-500">Room: {row.room_number}</div>
// //           )}
// //         </div>
// //       )
// //     },
// //     {
// //       key: 'status',
// //       label: 'Workflow Status',
// //       render: (row: Document) => (
// //         <div>
// //           <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(row.status)}`}>
// //             {row.status}
// //           </span>
// //           {row.next_action && (
// //             <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
// //               <AlertCircle className="w-3 h-3" />
// //               <span className="font-medium">{row.next_action}</span>
// //             </div>
// //           )}
// //         </div>
// //       )
// //     },
// //     {
// //       key: 'created_at',
// //       label: 'Created',
// //       render: (row: Document) => (
// //         <div className="text-sm text-gray-600">
// //           {new Date(row.created_at).toLocaleDateString('en-IN')}
// //         </div>
// //       )
// //     },
// //     {
// //       key: 'actions',
// //       label: 'Actions',
// //       render: (row: Document) => {
// //         const statusFlow: Record<string, string> = {
// //           'Created': 'Shared',
// //           'Shared': 'Viewed',
// //           'Viewed': 'Verified',
// //           'Verified': 'Completed'
// //         };
// //         const nextStage = statusFlow[row.status];

// //         return (
// //           <div className="flex items-center gap-2">
// //             {row.status !== 'Completed' && nextStage && (
// //               <button
// //                 onClick={() => handleProgressDocument(row)}
// //                 className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors group relative"
// //                 title={`Advance to "${nextStage}" stage`}
// //               >
// //                 <ArrowRight className="w-4 h-4" />
// //                 <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
// //                   Advance to {nextStage}
// //                 </span>
// //               </button>
// //             )}
// //           <button
// //             onClick={() => handleView(row)}
// //             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
// //             title="View"
// //           >
// //             <Eye className="w-4 h-4" />
// //           </button>
// //           <button
// //             onClick={() => handleShare(row)}
// //             className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
// //             title="Share"
// //           >
// //             <Share2 className="w-4 h-4" />
// //           </button>
// //           <button
// //             onClick={() => handleViewHistory(row)}
// //             className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
// //             title="History"
// //           >
// //             <Clock className="w-4 h-4" />
// //           </button>
// //           <button
// //             onClick={() => handlePrint(row)}
// //             className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
// //             title="Print"
// //           >
// //             <Printer className="w-4 h-4" />
// //           </button>
// //           <button
// //             onClick={() => handleDelete(row.id)}
// //             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
// //             title="Delete"
// //           >
// //             <Trash2 className="w-4 h-4" />
// //           </button>
// //         </div>
// //         );
// //       }
// //     }
// //   ];

// //   return (
// //     <div className="flex flex-col h-full">
// //       <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-sm">
// //         <div className="flex items-center gap-3">
// //           <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
// //             <FileText className="w-8 h-8 text-white" />
// //           </div>
// //           <div>
// //             <h1 className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
// //               All Documents
// //             </h1>
// //             <p className="text-gray-600 font-semibold mt-1">View, share, and manage documents</p>
// //           </div>
// //         </div>
// //       </div>

// //       <DataTable
// //         data={documents}
// //         columns={columns}
// //         onBulkDelete={handleBulkDelete}
// //         bulkActions={[
// //           {
// //             label: 'Mark as Shared',
// //             icon: <Send className="w-3 h-3" />,
// //             onClick: (docs) => handleBulkStatusChange(docs, 'Shared'),
// //             variant: 'primary'
// //           },
// //           {
// //             label: 'Mark as Viewed',
// //             icon: <Eye className="w-3 h-3" />,
// //             onClick: (docs) => handleBulkStatusChange(docs, 'Viewed'),
// //             variant: 'secondary'
// //           },
// //           {
// //             label: 'Mark as Verified',
// //             icon: <CheckCircle className="w-3 h-3" />,
// //             onClick: (docs) => handleBulkStatusChange(docs, 'Verified'),
// //             variant: 'primary'
// //           },
// //           {
// //             label: 'Mark as Completed',
// //             icon: <CheckCircle className="w-3 h-3" />,
// //             onClick: (docs) => handleBulkStatusChange(docs, 'Completed'),
// //             variant: 'primary'
// //           }
// //         ]}
// //         onExport={() => {}}
// //         title="Documents"
// //         rowKey="id"
// //         loading={loading}
// //       />

// //       {showViewModal && selectedDocument && (
// //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
// //           <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
// //             <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 rounded-t-2xl z-10">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <h2 className="text-2xl font-black text-white">{selectedDocument.document_name}</h2>
// //                   <p className="text-sm text-blue-100">{selectedDocument.document_number}</p>
// //                 </div>
// //                 <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
// //                   <X className="w-6 h-6 text-white" />
// //                 </button>
// //               </div>
// //             </div>
// //             <div className="p-6">
// //               <div dangerouslySetInnerHTML={{ __html: selectedDocument.html_content }} />
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {showHistoryModal && selectedDocument && (
// //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
// //           <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
// //             <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl z-10">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <h2 className="text-2xl font-black text-white">Document History</h2>
// //                   <p className="text-sm text-green-100">{selectedDocument.document_number}</p>
// //                 </div>
// //                 <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
// //                   <X className="w-6 h-6 text-white" />
// //                 </button>
// //               </div>
// //             </div>
// //             <div className="p-6">
// //               <div className="space-y-4">
// //                 {documentHistory.map((history, idx) => (
// //                   <div key={history.id} className="flex gap-4">
// //                     <div className="flex flex-col items-center">
// //                       <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
// //                         <CheckCircle className="w-5 h-5 text-green-600" />
// //                       </div>
// //                       {idx < documentHistory.length - 1 && (
// //                         <div className="w-0.5 h-full bg-green-200 mt-2" />
// //                       )}
// //                     </div>
// //                     <div className="flex-1 pb-6">
// //                       <div className="flex items-center justify-between mb-1">
// //                         <span className="font-bold text-gray-900">{history.event_type}</span>
// //                         <span className="text-sm text-gray-500">
// //                           {new Date(history.created_at).toLocaleString('en-IN')}
// //                         </span>
// //                       </div>
// //                       <p className="text-sm text-gray-600 mb-2">{history.event_description}</p>
// //                       <div className="flex items-center gap-4 text-xs text-gray-500">
// //                         <span>By: {history.performed_by}</span>
// //                         {history.ip_address && <span>IP: {history.ip_address}</span>}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {showShareModal && selectedDocument && (
// //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
// //           <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
// //             <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-t-2xl">
// //               <div className="flex items-center justify-between">
// //                 <h2 className="text-2xl font-black text-white">Share Document</h2>
// //                 <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
// //                   <X className="w-6 h-6 text-white" />
// //                 </button>
// //               </div>
// //             </div>
// //             <div className="p-6 space-y-6">
// //               <div>
// //                 <label className="block text-sm font-bold text-gray-700 mb-2">Share Method</label>
// //                 <select
// //                   value={shareData.method}
// //                   onChange={(e) => setShareData({ ...shareData, method: e.target.value })}
// //                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
// //                 >
// //                   <option value="Email">Email</option>
// //                   <option value="SMS">SMS</option>
// //                   <option value="WhatsApp">WhatsApp</option>
// //                   <option value="Link">Link Only</option>
// //                 </select>
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-bold text-gray-700 mb-2">Recipient Name</label>
// //                 <input
// //                   type="text"
// //                   value={shareData.recipient_name}
// //                   onChange={(e) => setShareData({ ...shareData, recipient_name: e.target.value })}
// //                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
// //                   placeholder="Enter recipient name"
// //                 />
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-bold text-gray-700 mb-2">
// //                   {shareData.method === 'Email' ? 'Email Address' : 'Phone Number'}
// //                 </label>
// //                 <input
// //                   type={shareData.method === 'Email' ? 'email' : 'tel'}
// //                   value={shareData.recipient_contact}
// //                   onChange={(e) => setShareData({ ...shareData, recipient_contact: e.target.value })}
// //                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
// //                   placeholder={shareData.method === 'Email' ? 'email@example.com' : '+91 9876543210'}
// //                 />
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-bold text-gray-700 mb-2">Verification Method</label>
// //                 <select
// //                   value={shareData.verification_method}
// //                   onChange={(e) => setShareData({ ...shareData, verification_method: e.target.value })}
// //                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
// //                 >
// //                   <option value="Email">Email OTP</option>
// //                   <option value="Mobile">Mobile OTP</option>
// //                   <option value="Aadhaar">Aadhaar Last 4 Digits</option>
// //                 </select>
// //               </div>

// //               <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
// //                 <p className="text-sm text-purple-900">
// //                   <strong>Note:</strong> The recipient will receive a secure link with an OTP. They must verify their identity to access the document.
// //                 </p>
// //               </div>
// //             </div>

// //             <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t-2 border-gray-200 flex justify-end gap-3">
// //               <button
// //                 onClick={() => setShowShareModal(false)}
// //                 className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={handleShareSubmit}
// //                 disabled={sharing}
// //                 className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
// //               >
// //                 {sharing ? (
// //                   <>Sharing...</>
// //                 ) : (
// //                   <>
// //                     <Share2 className="w-5 h-5" />
// //                     Share Document
// //                   </>
// //                 )}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {toast && (
// //         <Toast
// //           message={toast.message}
// //           type={toast.type}
// //           onClose={() => setToast(null)}
// //           duration={4000}
// //         />
// //       )}
// //     </div>
// //   );
// // }
// // DocumentList.tsx
// // Theme  : exact match with TenantHandover (blue/indigo, compact density)
// // Data   : uses documentApi.ts → /api/documents
// // Table  : one table with all columns — document#, name, tenant, property, status, priority, date, actions
// // Actions: View, Print, Download, Share (WhatsApp/Email), Delete, Status advance

// import { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   FileText, Eye, Share2, Trash2, Clock, CheckCircle, X,
//   Printer, ArrowRight, AlertCircle, RefreshCw, Filter,
//   Download, Send, Phone, Mail, MessageCircle, Shield,
//   Loader2, Search, Building2, User, Square, CheckSquare,
//   ChevronRight, IndianRupee, Tag,
// } from "lucide-react";
// import { Button }   from "@/components/ui/button";
// import { Input }    from "@/components/ui/input";
// import { Badge }    from "@/components/ui/badge";
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
// } from "@/components/ui/table";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Dialog, DialogContent, DialogClose,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import Swal from "sweetalert2";

// import {
//   listDocuments, deleteDocument, updateDocumentStatus,
//   bulkDeleteDocuments, generateShareLink,
//   type Document as Doc, type DocumentStatus,
// } from "@/lib/documentApi";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// // ─── Style tokens (same as TenantHandover) ────────────────────────────────────
// const F  = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
// const L  = "block text-[11px] font-semibold text-gray-500 mb-0.5";
// const SI = "text-[11px] py-0.5";

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const fmt = (d?: string | null) => {
//   if (!d) return "N/A";
//   try { const dt = new Date(d); return isNaN(dt.getTime()) ? "N/A" : dt.toLocaleDateString("en-IN"); }
//   catch { return "N/A"; }
// };

// const statusColor = (s: string) => {
//   switch (s) {
//     case "Created":   return "bg-blue-100 text-blue-700";
//     case "Sent":      return "bg-purple-100 text-purple-700";
//     case "Viewed":    return "bg-yellow-100 text-yellow-700";
//     case "Signed":    return "bg-green-100 text-green-700";
//     case "Completed": return "bg-emerald-100 text-emerald-700";
//     case "Expired":   return "bg-red-100 text-red-700";
//     case "Cancelled": return "bg-gray-100 text-gray-500";
//     default:          return "bg-gray-100 text-gray-700";
//   }
// };

// const priorityColor = (p: string) => {
//   switch (p) {
//     case "urgent": return "bg-red-100 text-red-700";
//     case "high":   return "bg-orange-100 text-orange-700";
//     case "normal": return "bg-blue-100 text-blue-700";
//     case "low":    return "bg-gray-100 text-gray-500";
//     default:       return "bg-gray-100 text-gray-600";
//   }
// };

// const STATUS_FLOW: Record<string, DocumentStatus> = {
//   Created: "Sent",
//   Sent:    "Viewed",
//   Viewed:  "Signed",
//   Signed:  "Completed",
// };

// const ALL_STATUSES: DocumentStatus[] = ["Created","Sent","Viewed","Signed","Completed","Expired","Cancelled"];

// const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
//   <Card className={`${bg} border-0 shadow-sm`}>
//     <CardContent className="p-2 sm:p-3">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
//           <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
//         </div>
//         <div className={`p-1.5 rounded-lg ${color}`}>
//           <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
//         </div>
//       </div>
//     </CardContent>
//   </Card>
// );

// // ════════════════════════════════════════════════════════════════════════════
// export function DocumentList() {
//   const [docs,         setDocs]         = useState<Doc[]>([]);
//   const [loading,      setLoading]      = useState(true);
//   const [sidebarOpen,  setSidebarOpen]  = useState(false);
//   const [viewDoc,      setViewDoc]      = useState<Doc | null>(null);
//   const [shareDoc,     setShareDoc]     = useState<Doc | null>(null);
//   const [sharing,      setSharing]      = useState(false);
//   const [showSharePopup, setShowSharePopup] = useState(false);

//   // Filters
//   const [statusFilter,   setStatusFilter]   = useState("all");
//   const [priorityFilter, setPriorityFilter] = useState("all");

//   // Column search
//   const [col, setCol] = useState({
//     document_number: "", tenant_name: "", property_name: "", status: "",
//   });

//   // Selection
//   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
//   const [selectAll,   setSelectAll]   = useState(false);

//   // Stats
//   const stats = useMemo(() => ({
//     total:     docs.length,
//     created:   docs.filter(d => d.status === "Created").length,
//     signed:    docs.filter(d => d.status === "Signed").length,
//     completed: docs.filter(d => d.status === "Completed").length,
//   }), [docs]);

//   // ── Load ────────────────────────────────────────────────────────────────────
//   const loadDocs = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await listDocuments({
//         status:   statusFilter   !== "all" ? statusFilter   as DocumentStatus : undefined,
//         priority: priorityFilter !== "all" ? priorityFilter as any            : undefined,
//         pageSize: 100,
//       });
//       setDocs(res.data || []);
//     } catch (e: any) { toast.error(e.message || "Failed to load documents"); }
//     finally { setLoading(false); }
//   }, [statusFilter, priorityFilter]);

//   useEffect(() => { loadDocs(); }, [loadDocs]);

//   // ── Filtered rows ───────────────────────────────────────────────────────────
//   const filteredRows = useMemo(() =>
//     docs.filter(d => {
//       const nOk = !col.document_number || d.document_number?.toLowerCase().includes(col.document_number.toLowerCase());
//       const tOk = !col.tenant_name     || d.tenant_name?.toLowerCase().includes(col.tenant_name.toLowerCase());
//       const pOk = !col.property_name   || (d.property_name||"").toLowerCase().includes(col.property_name.toLowerCase());
//       const sOk = !col.status          || d.status?.toLowerCase().includes(col.status.toLowerCase());
//       return nOk && tOk && pOk && sOk;
//     }), [docs, col]);

//   // ── Selection ───────────────────────────────────────────────────────────────
//   const toggleAll = () => {
//     if (selectAll) { setSelectedIds(new Set()); setSelectAll(false); }
//     else           { setSelectedIds(new Set(filteredRows.map(d => d.id))); setSelectAll(true); }
//   };
//   const toggleOne = (id: number) => {
//     const n = new Set(selectedIds);
//     n.has(id) ? n.delete(id) : n.add(id);
//     setSelectedIds(n);
//     setSelectAll(n.size === filteredRows.length && filteredRows.length > 0);
//   };
//   const selectedItems = filteredRows.filter(d => selectedIds.has(d.id));

//   // ── Delete ──────────────────────────────────────────────────────────────────
//   const handleDelete = async (id: number, name: string) => {
//     const r = await Swal.fire({
//       title: "Delete Document?",
//       text:  `"${name}" will be permanently removed.`,
//       icon: "warning", showCancelButton: true,
//       confirmButtonColor: "#d33", confirmButtonText: "Yes, delete",
//       customClass: { popup: "rounded-xl shadow-2xl text-sm" },
//     });
//     if (!r.isConfirmed) return;
//     try {
//       await deleteDocument(id);
//       toast.success("Document deleted");
//       setSelectedIds(p => { const n = new Set(p); n.delete(id); return n; });
//       await loadDocs();
//     } catch (e: any) { toast.error(e.message); }
//   };

//   const handleBulkDelete = async () => {
//     if (!selectedItems.length) return;
//     const r = await Swal.fire({
//       title: `Delete ${selectedItems.length} document(s)?`,
//       icon: "warning", showCancelButton: true,
//       confirmButtonColor: "#d33", confirmButtonText: "Delete all",
//       customClass: { popup: "rounded-xl text-sm" },
//     });
//     if (!r.isConfirmed) return;
//     try {
//       await bulkDeleteDocuments(selectedItems.map(d => d.id));
//       toast.success(`Deleted ${selectedItems.length} document(s)`);
//       setSelectedIds(new Set()); setSelectAll(false);
//       await loadDocs();
//     } catch (e: any) { toast.error(e.message); }
//   };

//   // ── Status advance ──────────────────────────────────────────────────────────
//   const handleAdvanceStatus = async (doc: Doc) => {
//     const next = STATUS_FLOW[doc.status];
//     if (!next) { toast.info("Already at final status"); return; }
//     try {
//       await updateDocumentStatus(doc.id, next);
//       toast.success(`Status advanced to ${next}`);
//       await loadDocs();
//     } catch (e: any) { toast.error(e.message); }
//   };

//   // ── Print ───────────────────────────────────────────────────────────────────
//   const handlePrint = (doc: Doc) => {
//     const w = window.open("", "_blank");
//     if (w) {
//       w.document.write(`<html><head><title>${doc.document_name}</title></head><body>${doc.html_content}</body></html>`);
//       w.document.close(); w.focus(); w.print();
//     }
//   };

//   // ── Download HTML ───────────────────────────────────────────────────────────
//   const handleDownload = (doc: Doc) => {
//     const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${doc.document_name}</title></head><body>${doc.html_content}</body></html>`;
//     const blob  = new Blob([html], { type: "text/html;charset=utf-8" });
//     const url   = URL.createObjectURL(blob);
//     const a     = document.createElement("a");
//     a.href      = url;
//     a.download  = `${doc.document_number}_${doc.tenant_name?.replace(/\s+/g,"_")}.html`;
//     a.click();
//     URL.revokeObjectURL(url);
//     toast.success("Downloaded — open file and Ctrl+P to save as PDF");
//   };

//   // ── Share WhatsApp ──────────────────────────────────────────────────────────
//   const handleShareWhatsApp = (doc: Doc) => {
//     const phone = (doc.tenant_phone || "").replace(/\D/g,"");
//     if (!phone) { toast.error("No phone number"); return; }
//     const msg = encodeURIComponent(
//       `📄 *${doc.document_name}*\n\n` +
//       `*Document No:* ${doc.document_number}\n` +
//       `*Tenant:* ${doc.tenant_name}\n` +
//       `*Property:* ${doc.property_name || "N/A"}\n` +
//       `*Room:* ${doc.room_number || "N/A"}\n` +
//       `*Status:* ${doc.status}\n` +
//       `*Date:* ${fmt(doc.created_at)}`
//     );
//     window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
//     setShowSharePopup(false); setShareDoc(null);
//   };

//   // ── Share Email ─────────────────────────────────────────────────────────────
//   const handleShareEmail = (doc: Doc) => {
//     if (!doc.tenant_email) { toast.error("No email address"); return; }
//     const subject = encodeURIComponent(`Document: ${doc.document_name} — ${doc.document_number}`);
//     const body    = encodeURIComponent(
//       `Dear ${doc.tenant_name},\n\nPlease find your document details below:\n\n` +
//       `Document No: ${doc.document_number}\nProperty: ${doc.property_name || "N/A"}\n` +
//       `Room: ${doc.room_number || "N/A"}\nStatus: ${doc.status}\n\nRegards`
//     );
//     window.open(`mailto:${doc.tenant_email}?subject=${subject}&body=${body}`, "_blank");
//     setShowSharePopup(false); setShareDoc(null);
//   };

//   // ── Export CSV ──────────────────────────────────────────────────────────────
//   const handleExport = () => {
//     const rows = filteredRows.map(d => [
//       d.document_number, d.document_name, d.tenant_name, d.tenant_phone,
//       d.property_name||"", d.room_number||"", d.status, d.priority, fmt(d.created_at),
//     ]);
//     const csv = [["Doc#","Name","Tenant","Phone","Property","Room","Status","Priority","Date"], ...rows]
//       .map(r => r.join(",")).join("\n");
//     const a   = document.createElement("a");
//     a.href    = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
//     a.download= `documents_${new Date().toISOString().split("T")[0]}.csv`;
//     a.click();
//   };

//   const hasFilters    = statusFilter !== "all" || priorityFilter !== "all";
//   const filterCount   = [statusFilter!=="all", priorityFilter!=="all"].filter(Boolean).length;
//   const clearFilters  = () => { setStatusFilter("all"); setPriorityFilter("all"); };
//   const hasColSearch  = Object.values(col).some(v => v !== "");
//   const clearColSearch= () => setCol({ document_number:"", tenant_name:"", property_name:"", status:"" });

//   // ════════════════════════════════════════════════════════════════════════════
//   return (
//     <div className="bg-gray-50 min-h-full">

//       {/* ── STICKY HEADER ── */}
//       <div className="sticky top-20 z-10">
//         <div className="pb-2 flex items-end justify-end gap-2 flex-wrap">

//           {/* Bulk actions */}
//           {selectedItems.length > 0 && (
//             <div className="flex items-center gap-1.5">
//               <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
//                 {selectedItems.length} selected
//               </span>
//               <Button size="sm" variant="destructive" className="h-7 text-[10px] px-2 bg-red-600 hover:bg-red-700" onClick={handleBulkDelete}>
//                 <Trash2 className="h-3 w-3 mr-1" />Delete Selected
//               </Button>
//             </div>
//           )}

//           <button onClick={() => setSidebarOpen(o => !o)}
//             className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors
//               ${sidebarOpen||hasFilters ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
//             <Filter className="h-3.5 w-3.5" />
//             <span className="hidden sm:inline">Filters</span>
//             {filterCount > 0 && (
//               <span className={`h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center ${sidebarOpen||hasFilters ? "bg-white text-blue-600" : "bg-blue-600 text-white"}`}>{filterCount}</span>
//             )}
//           </button>

//           <button onClick={handleExport}
//             className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium">
//             <Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Export</span>
//           </button>

//           <button onClick={loadDocs} disabled={loading}
//             className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
//             <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
//           </button>
//         </div>

//         {/* Stats */}
//         <div className="pb-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
//           <StatCard title="Total Documents" value={stats.total}     icon={FileText}     color="bg-blue-600"    bg="bg-gradient-to-br from-blue-50 to-blue-100" />
//           <StatCard title="Created"         value={stats.created}   icon={AlertCircle}  color="bg-indigo-600"  bg="bg-gradient-to-br from-indigo-50 to-indigo-100" />
//           <StatCard title="Signed"          value={stats.signed}    icon={CheckCircle}  color="bg-green-600"   bg="bg-gradient-to-br from-green-50 to-green-100" />
//           <StatCard title="Completed"       value={stats.completed} icon={Shield}       color="bg-emerald-600" bg="bg-gradient-to-br from-emerald-50 to-emerald-100" />
//         </div>
//       </div>

//       {/* ── TABLE ── */}
//       <div className="relative">
//         <Card className="border rounded-lg shadow-sm">
//           <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
//             <span className="text-sm font-semibold text-gray-700">
//               All Documents ({filteredRows.length})
//               {selectedIds.size > 0 && <span className="ml-2 text-blue-600 text-xs">({selectedIds.size} selected)</span>}
//             </span>
//             {hasColSearch && (
//               <button onClick={clearColSearch} className="text-[10px] text-blue-600 font-semibold">Clear Search</button>
//             )}
//           </div>

//           <div className="overflow-auto" style={{ maxHeight:"calc(100vh - 280px)" }}>
//             <div className="min-w-[1100px]">
//               <Table>
//                 <TableHeader className="sticky top-0 z-10 bg-gray-50">
//                   <TableRow>
//                     <TableHead className="py-2 px-3 w-8">
//                       <button onClick={toggleAll} className="p-1 hover:bg-gray-200 rounded">
//                         {selectAll ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" /> : <Square className="h-3.5 w-3.5 text-gray-400" />}
//                       </button>
//                     </TableHead>
//                     <TableHead className="py-2 px-3 text-xs">Doc #</TableHead>
//                     <TableHead className="py-2 px-3 text-xs">Document Name</TableHead>
//                     <TableHead className="py-2 px-3 text-xs">Tenant</TableHead>
//                     <TableHead className="py-2 px-3 text-xs">Property / Room</TableHead>
//                     <TableHead className="py-2 px-3 text-xs">Status</TableHead>
//                     <TableHead className="py-2 px-3 text-xs">Priority</TableHead>
//                     <TableHead className="py-2 px-3 text-xs">Date</TableHead>
//                     <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
//                   </TableRow>

//                   {/* Column search */}
//                   <TableRow className="bg-gray-50/80">
//                     <TableCell className="py-1 px-3" />
//                     {[
//                       { k:"document_number", ph:"Doc#…" },
//                       { k:null, ph:"" },
//                       { k:"tenant_name",   ph:"Tenant…" },
//                       { k:"property_name", ph:"Property…" },
//                       { k:"status",        ph:"Status…" },
//                       { k:null, ph:"" },
//                       { k:null, ph:"" },
//                       { k:null, ph:"" },
//                     ].map((c, i) => (
//                       <TableCell key={i} className="py-1 px-2">
//                         {c.k ? (
//                           <Input placeholder={c.ph} value={col[c.k as keyof typeof col]}
//                             onChange={e => setCol(p => ({ ...p, [c.k!]: e.target.value }))}
//                             className="h-6 text-[10px]" />
//                         ) : <div />}
//                       </TableCell>
//                     ))}
//                     <TableCell />
//                   </TableRow>
//                 </TableHeader>

//                 <TableBody>
//                   {loading ? (
//                     <TableRow><TableCell colSpan={9} className="text-center py-12">
//                       <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
//                       <p className="text-xs text-gray-500">Loading documents…</p>
//                     </TableCell></TableRow>
//                   ) : filteredRows.length === 0 ? (
//                     <TableRow><TableCell colSpan={9} className="text-center py-12">
//                       <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
//                       <p className="text-sm font-medium text-gray-500">No documents found</p>
//                       <p className="text-xs text-gray-400 mt-1">Create a document from Document Create</p>
//                     </TableCell></TableRow>
//                   ) : filteredRows.map(d => (
//                     <TableRow key={d.id} className={`hover:bg-gray-50 ${selectedIds.has(d.id) ? "bg-blue-50/40" : ""}`}>
//                       <TableCell className="py-2 px-3">
//                         <button onClick={() => toggleOne(d.id)} className="p-1 hover:bg-gray-200 rounded">
//                           {selectedIds.has(d.id) ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" /> : <Square className="h-3.5 w-3.5 text-gray-400" />}
//                         </button>
//                       </TableCell>
//                       <TableCell className="py-2 px-3">
//                         <span className="font-mono text-[11px] font-bold text-blue-600">{d.document_number}</span>
//                       </TableCell>
//                       <TableCell className="py-2 px-3">
//                         <p className="text-[11px] font-semibold text-gray-800 max-w-[160px] truncate">{d.document_name}</p>
//                         {d.signature_required && (
//                           <Badge className="bg-purple-50 text-purple-600 border border-purple-200 text-[9px] px-1.5 py-0 mt-0.5">Signature Req.</Badge>
//                         )}
//                       </TableCell>
//                       <TableCell className="py-2 px-3">
//                         <p className="text-[11px] font-semibold text-gray-800">{d.tenant_name}</p>
//                         {d.tenant_phone && <p className="text-[10px] text-gray-500 flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{d.tenant_phone}</p>}
//                       </TableCell>
//                       <TableCell className="py-2 px-3">
//                         <p className="text-[11px] text-gray-700 max-w-[120px] truncate">{d.property_name || "—"}</p>
//                         {d.room_number && <p className="text-[10px] text-gray-500">Room: {d.room_number}</p>}
//                       </TableCell>
//                       <TableCell className="py-2 px-3">
//                         <Badge className={`text-[9px] px-1.5 py-0 ${statusColor(d.status)}`}>{d.status}</Badge>
//                         {STATUS_FLOW[d.status] && (
//                           <p className="text-[9px] text-gray-400 mt-0.5 flex items-center gap-0.5">
//                             <ArrowRight className="h-2.5 w-2.5" />{STATUS_FLOW[d.status]}
//                           </p>
//                         )}
//                       </TableCell>
//                       <TableCell className="py-2 px-3">
//                         <Badge className={`text-[9px] px-1.5 py-0 ${priorityColor(d.priority)}`}>{d.priority}</Badge>
//                       </TableCell>
//                       <TableCell className="py-2 px-3 text-[10px] text-gray-500">{fmt(d.created_at)}</TableCell>
//                       <TableCell className="py-2 px-3">
//                         <div className="flex justify-end gap-0.5">
//                           {/* View */}
//                           <button onClick={() => setViewDoc(d)} title="View"
//                             className="p-1.5 rounded-md text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
//                             <Eye className="h-3.5 w-3.5" />
//                           </button>
//                           {/* Advance status */}
//                           {STATUS_FLOW[d.status] && (
//                             <button onClick={() => handleAdvanceStatus(d)} title={`Advance to ${STATUS_FLOW[d.status]}`}
//                               className="p-1.5 rounded-md text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors">
//                               <ArrowRight className="h-3.5 w-3.5" />
//                             </button>
//                           )}
//                           {/* Share popup */}
//                           <div className="relative">
//                             <button onClick={() => { setShareDoc(d); setShowSharePopup(p => shareDoc?.id === d.id ? !p : true); }} title="Share"
//                               className="p-1.5 rounded-md text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors">
//                               <Share2 className="h-3.5 w-3.5" />
//                             </button>
//                             {showSharePopup && shareDoc?.id === d.id && (
//                               <div className="absolute bottom-full right-0 mb-1.5 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-44">
//                                 <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
//                                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Share via</p>
//                                 </div>
//                                 <button onClick={() => handleShareWhatsApp(d)}
//                                   className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-green-50 transition-colors text-left">
//                                   <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
//                                     <MessageCircle className="h-3 w-3 text-white" />
//                                   </div>
//                                   <div>
//                                     <p className="text-[11px] font-semibold text-gray-800">WhatsApp</p>
//                                     <p className="text-[9px] text-gray-400">{d.tenant_phone || "No phone"}</p>
//                                   </div>
//                                 </button>
//                                 <button onClick={() => handleShareEmail(d)}
//                                   className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 transition-colors text-left border-t border-gray-100">
//                                   <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
//                                     <Mail className="h-3 w-3 text-white" />
//                                   </div>
//                                   <div>
//                                     <p className="text-[11px] font-semibold text-gray-800">Email</p>
//                                     <p className="text-[9px] text-gray-400 truncate max-w-[80px]">{d.tenant_email || "No email"}</p>
//                                   </div>
//                                 </button>
//                               </div>
//                             )}
//                           </div>
//                           {/* Print */}
//                           <button onClick={() => handlePrint(d)} title="Print"
//                             className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
//                             <Printer className="h-3.5 w-3.5" />
//                           </button>
//                           {/* Download */}
//                           <button onClick={() => handleDownload(d)} title="Download"
//                             className="p-1.5 rounded-md text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
//                             <Download className="h-3.5 w-3.5" />
//                           </button>
//                           {/* Delete */}
//                           <button onClick={() => handleDelete(d.id, d.document_name)} title="Delete"
//                             className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
//                             <Trash2 className="h-3.5 w-3.5" />
//                           </button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           </div>
//         </Card>

//         {/* ── FILTER SIDEBAR ── */}
//         {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />}
//         <aside className={`fixed top-0 right-0 h-full z-40 w-72 sm:w-80 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
//           <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
//             <div className="flex items-center gap-2">
//               <Filter className="h-4 w-4 text-white" />
//               <span className="text-sm font-semibold text-white">Filters</span>
//               {hasFilters && <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">{filterCount} active</span>}
//             </div>
//             <div className="flex items-center gap-2">
//               {hasFilters && <button onClick={clearFilters} className="text-[10px] text-blue-200 hover:text-white font-semibold">Clear all</button>}
//               <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white"><X className="h-4 w-4" /></button>
//             </div>
//           </div>

//           <div className="flex-1 overflow-y-auto p-4 space-y-5">
//             {/* Status filter */}
//             <div>
//               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Status</p>
//               <div className="space-y-1">
//                 {["all", ...ALL_STATUSES].map(s => (
//                   <label key={s} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${statusFilter===s ? "bg-blue-50 border border-blue-200 text-blue-700" : "hover:bg-gray-50 border border-transparent text-gray-700"}`}>
//                     <input type="radio" name="status" checked={statusFilter===s} onChange={() => setStatusFilter(s)} className="sr-only" />
//                     <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusFilter===s ? "bg-blue-500" : "bg-gray-300"}`} />
//                     <span className="text-[12px] font-medium">{s === "all" ? "All Statuses" : s}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//             <div className="border-t border-gray-100" />
//             {/* Priority filter */}
//             <div>
//               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Priority</p>
//               <div className="space-y-1">
//                 {["all","low","normal","high","urgent"].map(p => (
//                   <label key={p} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${priorityFilter===p ? "bg-blue-50 border border-blue-200 text-blue-700" : "hover:bg-gray-50 border border-transparent text-gray-700"}`}>
//                     <input type="radio" name="priority" checked={priorityFilter===p} onChange={() => setPriorityFilter(p)} className="sr-only" />
//                     <span className={`h-2 w-2 rounded-full flex-shrink-0 ${priorityFilter===p ? "bg-blue-500" : "bg-gray-300"}`} />
//                     <span className="text-[12px] font-medium capitalize">{p === "all" ? "All Priorities" : p}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
//             <button onClick={clearFilters} disabled={!hasFilters} className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40">Clear All</button>
//             <button onClick={() => setSidebarOpen(false)} className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold">Apply & Close</button>
//           </div>
//         </aside>
//       </div>

//       {/* ══ VIEW MODAL ══ */}
//       {viewDoc && (
//         <Dialog open={!!viewDoc} onOpenChange={v => { if (!v) { setViewDoc(null); setShowSharePopup(false); } }}>
//           <DialogContent className="max-w-4xl w-[95vw] max-h-[92vh] overflow-hidden p-0">
//             <div className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg flex-shrink-0">
//               <div>
//                 <h2 className="text-base font-semibold">{viewDoc.document_name}</h2>
//                 <p className="text-xs text-blue-100">{viewDoc.document_number} · {viewDoc.tenant_name}</p>
//               </div>
//               <div className="flex items-center gap-2">
//                 {/* Status badge */}
//                 <Badge className={`text-[10px] px-2 py-0.5 ${statusColor(viewDoc.status)}`}>{viewDoc.status}</Badge>
//                 {/* Advance */}
//                 {STATUS_FLOW[viewDoc.status] && (
//                   <button onClick={() => handleAdvanceStatus(viewDoc)}
//                     className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[10px] font-medium">
//                     <ArrowRight className="h-3 w-3" />{STATUS_FLOW[viewDoc.status]}
//                   </button>
//                 )}
//                 {/* Share */}
//                 <div className="relative">
//                   <button onClick={() => setShowSharePopup(p => !p)}
//                     className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[10px] font-medium">
//                     <Share2 className="h-3 w-3" />Share
//                   </button>
//                   {showSharePopup && (
//                     <div className="absolute top-full right-0 mt-1.5 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-48">
//                       <div className="px-3 py-1.5 bg-gray-50 border-b"><p className="text-[10px] font-bold text-gray-500 uppercase">Share via</p></div>
//                       <button onClick={() => handleShareWhatsApp(viewDoc)} className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-green-50 text-left">
//                         <div className="h-7 w-7 rounded-full bg-green-500 flex items-center justify-center"><MessageCircle className="h-3.5 w-3.5 text-white" /></div>
//                         <div><p className="text-[11px] font-semibold text-gray-800">WhatsApp</p><p className="text-[9px] text-gray-400">{viewDoc.tenant_phone||"No phone"}</p></div>
//                       </button>
//                       <button onClick={() => handleShareEmail(viewDoc)} className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-blue-50 text-left border-t border-gray-100">
//                         <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center"><Mail className="h-3.5 w-3.5 text-white" /></div>
//                         <div><p className="text-[11px] font-semibold text-gray-800">Email</p><p className="text-[9px] text-gray-400">{viewDoc.tenant_email||"No email"}</p></div>
//                       </button>
//                     </div>
//                   )}
//                 </div>
//                 {/* Print */}
//                 <button onClick={() => handlePrint(viewDoc)} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><Printer className="h-4 w-4" /></button>
//                 {/* Download */}
//                 <button onClick={() => handleDownload(viewDoc)} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><Download className="h-4 w-4" /></button>
//                 <DialogClose asChild>
//                   <button className="p-1.5 rounded-full hover:bg-white/20"><X className="h-4 w-4 text-white" /></button>
//                 </DialogClose>
//               </div>
//             </div>

//             {/* Doc info bar */}
//             <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2.5 bg-gray-50 border-b text-[11px]">
//               {[
//                 ["Tenant",   viewDoc.tenant_name],
//                 ["Phone",    viewDoc.tenant_phone || "—"],
//                 ["Property", viewDoc.property_name || "—"],
//                 ["Room",     viewDoc.room_number   || "—"],
//               ].map(([k,v]) => (
//                 <div key={k}>
//                   <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{k}</span>
//                   <p className="font-semibold text-gray-800 truncate">{v}</p>
//                 </div>
//               ))}
//             </div>

//             <div className="flex-1 overflow-y-auto p-4 bg-slate-100" style={{ maxHeight:"calc(92vh - 160px)" }}>
//               <div className="bg-white rounded-lg shadow max-w-[210mm] mx-auto">
//                 <div dangerouslySetInnerHTML={{ __html: viewDoc.html_content }} />
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* Close share popup on outside click */}
//       {showSharePopup && (
//         <div className="fixed inset-0 z-40" onClick={() => setShowSharePopup(false)} />
//       )}
//     </div>
//   );
// }


// DocumentList.tsx
// Theme  : exact match with TenantHandover (blue/indigo, compact density)
// Data   : uses documentApi.ts → /api/documents
// Table  : one table with all columns — document#, name, tenant, property, status, priority, date, actions
// Actions: View, Print, Download, Share (WhatsApp/Email), Delete, Status advance

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText, Eye, Share2, Trash2, Clock, CheckCircle, X,
  Printer, ArrowRight, AlertCircle, RefreshCw, Filter,
  Download, Send, Phone, Mail, MessageCircle, Shield,
  Loader2, Search, Building2, User, Square, CheckSquare,
  ChevronRight, IndianRupee, Tag,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Badge }    from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Swal from "sweetalert2";

import {
  listDocuments, getDocument, deleteDocument, updateDocumentStatus,
  bulkDeleteDocuments, generateShareLink,
  type Document as Doc, type DocumentStatus,
} from "@/lib/documentListApi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─── Style tokens (same as TenantHandover) ────────────────────────────────────
const F  = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L  = "block text-[11px] font-semibold text-gray-500 mb-0.5";
const SI = "text-[11px] py-0.5";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d?: string | null) => {
  if (!d) return "N/A";
  try { const dt = new Date(d); return isNaN(dt.getTime()) ? "N/A" : dt.toLocaleDateString("en-IN"); }
  catch { return "N/A"; }
};

const statusColor = (s: string) => {
  switch (s) {
    case "Created":   return "bg-blue-100 text-blue-700";
    case "Sent":      return "bg-purple-100 text-purple-700";
    case "Viewed":    return "bg-yellow-100 text-yellow-700";
    case "Signed":    return "bg-green-100 text-green-700";
    case "Completed": return "bg-emerald-100 text-emerald-700";
    case "Expired":   return "bg-red-100 text-red-700";
    case "Cancelled": return "bg-gray-100 text-gray-500";
    default:          return "bg-gray-100 text-gray-700";
  }
};

const priorityColor = (p: string) => {
  switch (p) {
    case "urgent": return "bg-red-100 text-red-700";
    case "high":   return "bg-orange-100 text-orange-700";
    case "normal": return "bg-blue-100 text-blue-700";
    case "low":    return "bg-gray-100 text-gray-500";
    default:       return "bg-gray-100 text-gray-600";
  }
};

const STATUS_FLOW: Record<string, DocumentStatus> = {
  Created: "Sent",
  Sent:    "Viewed",
  Viewed:  "Signed",
  Signed:  "Completed",
};

const ALL_STATUSES: DocumentStatus[] = ["Created","Sent","Viewed","Signed","Completed","Expired","Cancelled"];

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

// ════════════════════════════════════════════════════════════════════════════
export function DocumentList() {
  const [docs,         setDocs]         = useState<Doc[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [viewDoc,      setViewDoc]      = useState<Doc | null>(null);
  const [loadingView,  setLoadingView]  = useState(false);
  const [shareDoc,     setShareDoc]     = useState<Doc | null>(null);
  const [sharing,      setSharing]      = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);

  // Filters
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Column search
  const [col, setCol] = useState({
    document_number: "", tenant_name: "", property_name: "", status: "",
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectAll,   setSelectAll]   = useState(false);

  // Stats
  const stats = useMemo(() => ({
    total:     docs.length,
    created:   docs.filter(d => d.status === "Created").length,
    signed:    docs.filter(d => d.status === "Signed").length,
    completed: docs.filter(d => d.status === "Completed").length,
  }), [docs]);

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listDocuments({
        status:   statusFilter   !== "all" ? statusFilter   as DocumentStatus : undefined,
        priority: priorityFilter !== "all" ? priorityFilter as any            : undefined,
        pageSize: 100,
      });
      setDocs(res.data || []);
    } catch (e: any) { toast.error(e.message || "Failed to load documents"); }
    finally { setLoading(false); }
  }, [statusFilter, priorityFilter]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  // ── Filtered rows ───────────────────────────────────────────────────────────
  const filteredRows = useMemo(() =>
    docs.filter(d => {
      const nOk = !col.document_number || d.document_number?.toLowerCase().includes(col.document_number.toLowerCase());
      const tOk = !col.tenant_name     || d.tenant_name?.toLowerCase().includes(col.tenant_name.toLowerCase());
      const pOk = !col.property_name   || (d.property_name||"").toLowerCase().includes(col.property_name.toLowerCase());
      const sOk = !col.status          || d.status?.toLowerCase().includes(col.status.toLowerCase());
      return nOk && tOk && pOk && sOk;
    }), [docs, col]);

  // ── Selection ───────────────────────────────────────────────────────────────
  const toggleAll = () => {
    if (selectAll) { setSelectedIds(new Set()); setSelectAll(false); }
    else           { setSelectedIds(new Set(filteredRows.map(d => d.id))); setSelectAll(true); }
  };
  const toggleOne = (id: number) => {
    const n = new Set(selectedIds);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelectedIds(n);
    setSelectAll(n.size === filteredRows.length && filteredRows.length > 0);
  };
  const selectedItems = filteredRows.filter(d => selectedIds.has(d.id));

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number, name: string) => {
    const r = await Swal.fire({
      title: "Delete Document?",
      text:  `"${name}" will be permanently removed.`,
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#d33", confirmButtonText: "Yes, delete",
      customClass: { popup: "rounded-xl shadow-2xl text-sm" },
    });
    if (!r.isConfirmed) return;
    try {
      await deleteDocument(id);
      toast.success("Document deleted");
      setSelectedIds(p => { const n = new Set(p); n.delete(id); return n; });
      await loadDocs();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleBulkDelete = async () => {
    if (!selectedItems.length) return;
    const r = await Swal.fire({
      title: `Delete ${selectedItems.length} document(s)?`,
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#d33", confirmButtonText: "Delete all",
      customClass: { popup: "rounded-xl text-sm" },
    });
    if (!r.isConfirmed) return;
    try {
      await bulkDeleteDocuments(selectedItems.map(d => d.id));
      toast.success(`Deleted ${selectedItems.length} document(s)`);
      setSelectedIds(new Set()); setSelectAll(false);
      await loadDocs();
    } catch (e: any) { toast.error(e.message); }
  };

  // ── Status advance ──────────────────────────────────────────────────────────
  const handleAdvanceStatus = async (doc: Doc) => {
    const next = STATUS_FLOW[doc.status];
    if (!next) { toast.info("Already at final status"); return; }
    try {
      await updateDocumentStatus(doc.id, next);
      toast.success(`Status advanced to ${next}`);
      await loadDocs();
    } catch (e: any) { toast.error(e.message); }
  };

  // ── Print ───────────────────────────────────────────────────────────────────
  const handlePrint = (doc: Doc) => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<html><head><title>${doc.document_name}</title></head><body>${doc.html_content}</body></html>`);
      w.document.close(); w.focus(); w.print();
    }
  };

  // ── Download: exact saved template HTML → print dialog → Save as PDF ─────────
  const handleDownload = (doc: Doc) => {
    if (!doc.html_content) { toast.error("No content available"); return; }

    const printWin = window.open("", "_blank", "width=900,height=700");
    if (!printWin) { toast.error("Popup blocked — allow popups and try again"); return; }

    printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${doc.document_number} — ${doc.tenant_name}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    @media print {
      body { margin: 0; }
      @page { size: A4; margin: 10mm; }
    }
  </style>
</head>
<body>
${doc.html_content}
<script>
  window.onload = function() {
    setTimeout(function() {
      window.print();
      window.onafterprint = function() { window.close(); };
    }, 400);
  };
</script>
</body>
</html>`);
    printWin.document.close();
    toast.success("Print dialog opened — select 'Save as PDF'");
  };

  // ── Share WhatsApp ──────────────────────────────────────────────────────────
  const handleShareWhatsApp = (doc: Doc) => {
    const phone = (doc.tenant_phone || "").replace(/\D/g,"");
    if (!phone) { toast.error("No phone number"); return; }
    const msg = encodeURIComponent(
      `📄 *${doc.document_name}*\n\n` +
      `*Document No:* ${doc.document_number}\n` +
      `*Tenant:* ${doc.tenant_name}\n` +
      `*Property:* ${doc.property_name || "N/A"}\n` +
      `*Room:* ${doc.room_number || "N/A"}\n` +
      `*Status:* ${doc.status}\n` +
      `*Date:* ${fmt(doc.created_at)}`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    setShowSharePopup(false); setShareDoc(null);
  };

  // ── Share Email ─────────────────────────────────────────────────────────────
  const handleShareEmail = (doc: Doc) => {
    if (!doc.tenant_email) { toast.error("No email address"); return; }
    const subject = encodeURIComponent(`Document: ${doc.document_name} — ${doc.document_number}`);
    const body    = encodeURIComponent(
      `Dear ${doc.tenant_name},\n\nPlease find your document details below:\n\n` +
      `Document No: ${doc.document_number}\nProperty: ${doc.property_name || "N/A"}\n` +
      `Room: ${doc.room_number || "N/A"}\nStatus: ${doc.status}\n\nRegards`
    );
    window.open(`mailto:${doc.tenant_email}?subject=${subject}&body=${body}`, "_blank");
    setShowSharePopup(false); setShareDoc(null);
  };

  // ── Export CSV ──────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = filteredRows.map(d => [
      d.document_number, d.document_name, d.tenant_name, d.tenant_phone,
      d.property_name||"", d.room_number||"", d.status, d.priority, fmt(d.created_at),
    ]);
    const csv = [["Doc#","Name","Tenant","Phone","Property","Room","Status","Priority","Date"], ...rows]
      .map(r => r.join(",")).join("\n");
    const a   = document.createElement("a");
    a.href    = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
    a.download= `documents_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const hasFilters    = statusFilter !== "all" || priorityFilter !== "all";
  const filterCount   = [statusFilter!=="all", priorityFilter!=="all"].filter(Boolean).length;
  const clearFilters  = () => { setStatusFilter("all"); setPriorityFilter("all"); };
  const hasColSearch  = Object.values(col).some(v => v !== "");
  const clearColSearch= () => setCol({ document_number:"", tenant_name:"", property_name:"", status:"" });

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-gray-50 min-h-full">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-20 z-10">
        <div className="pb-2 flex items-end justify-end gap-2 flex-wrap">

          {/* Bulk actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                {selectedItems.length} selected
              </span>
              <Button size="sm" variant="destructive" className="h-7 text-[10px] px-2 bg-red-600 hover:bg-red-700" onClick={handleBulkDelete}>
                <Trash2 className="h-3 w-3 mr-1" />Delete Selected
              </Button>
            </div>
          )}

          <button onClick={() => setSidebarOpen(o => !o)}
            className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors
              ${sidebarOpen||hasFilters ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {filterCount > 0 && (
              <span className={`h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center ${sidebarOpen||hasFilters ? "bg-white text-blue-600" : "bg-blue-600 text-white"}`}>{filterCount}</span>
            )}
          </button>

          <button onClick={handleExport}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium">
            <Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Export</span>
          </button>

          <button onClick={loadDocs} disabled={loading}
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="pb-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <StatCard title="Total Documents" value={stats.total}     icon={FileText}     color="bg-blue-600"    bg="bg-gradient-to-br from-blue-50 to-blue-100" />
          <StatCard title="Created"         value={stats.created}   icon={AlertCircle}  color="bg-indigo-600"  bg="bg-gradient-to-br from-indigo-50 to-indigo-100" />
          <StatCard title="Signed"          value={stats.signed}    icon={CheckCircle}  color="bg-green-600"   bg="bg-gradient-to-br from-green-50 to-green-100" />
          <StatCard title="Completed"       value={stats.completed} icon={Shield}       color="bg-emerald-600" bg="bg-gradient-to-br from-emerald-50 to-emerald-100" />
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="relative">
        <Card className="border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
            <span className="text-sm font-semibold text-gray-700">
              All Documents ({filteredRows.length})
              {selectedIds.size > 0 && <span className="ml-2 text-blue-600 text-xs">({selectedIds.size} selected)</span>}
            </span>
            {hasColSearch && (
              <button onClick={clearColSearch} className="text-[10px] text-blue-600 font-semibold">Clear Search</button>
            )}
          </div>

          <div className="overflow-auto" style={{ maxHeight:"calc(100vh - 280px)" }}>
            <div className="min-w-[1100px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-gray-50">
                  <TableRow>
                    <TableHead className="py-2 px-3 w-8">
                      <button onClick={toggleAll} className="p-1 hover:bg-gray-200 rounded">
                        {selectAll ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" /> : <Square className="h-3.5 w-3.5 text-gray-400" />}
                      </button>
                    </TableHead>
                    <TableHead className="py-2 px-3 text-xs">Doc #</TableHead>
                    <TableHead className="py-2 px-3 text-xs">Document Name</TableHead>
                    <TableHead className="py-2 px-3 text-xs">Tenant</TableHead>
                    <TableHead className="py-2 px-3 text-xs">Property / Room</TableHead>
                    <TableHead className="py-2 px-3 text-xs">Status</TableHead>
                    <TableHead className="py-2 px-3 text-xs">Priority</TableHead>
                    <TableHead className="py-2 px-3 text-xs">Date</TableHead>
                    <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
                  </TableRow>

                  {/* Column search */}
                  <TableRow className="bg-gray-50/80">
                    <TableCell className="py-1 px-3" />
                    {[
                      { k:"document_number", ph:"Doc#…" },
                      { k:null, ph:"" },
                      { k:"tenant_name",   ph:"Tenant…" },
                      { k:"property_name", ph:"Property…" },
                      { k:"status",        ph:"Status…" },
                      { k:null, ph:"" },
                      { k:null, ph:"" },
                      { k:null, ph:"" },
                    ].map((c, i) => (
                      <TableCell key={i} className="py-1 px-2">
                        {c.k ? (
                          <Input placeholder={c.ph} value={col[c.k as keyof typeof col]}
                            onChange={e => setCol(p => ({ ...p, [c.k!]: e.target.value }))}
                            className="h-6 text-[10px]" />
                        ) : <div />}
                      </TableCell>
                    ))}
                    <TableCell />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={9} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Loading documents…</p>
                    </TableCell></TableRow>
                  ) : filteredRows.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center py-12">
                      <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-500">No documents found</p>
                      <p className="text-xs text-gray-400 mt-1">Create a document from Document Create</p>
                    </TableCell></TableRow>
                  ) : filteredRows.map(d => (
                    <TableRow key={d.id} className={`hover:bg-gray-50 ${selectedIds.has(d.id) ? "bg-blue-50/40" : ""}`}>
                      <TableCell className="py-2 px-3">
                        <button onClick={() => toggleOne(d.id)} className="p-1 hover:bg-gray-200 rounded">
                          {selectedIds.has(d.id) ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" /> : <Square className="h-3.5 w-3.5 text-gray-400" />}
                        </button>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <span className="font-mono text-[11px] font-bold text-blue-600">{d.document_number}</span>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <p className="text-[11px] font-semibold text-gray-800 max-w-[160px] truncate">{d.document_name}</p>
                        {d.signature_required && (
                          <Badge className="bg-purple-50 text-purple-600 border border-purple-200 text-[9px] px-1.5 py-0 mt-0.5">Signature Req.</Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <p className="text-[11px] font-semibold text-gray-800">{d.tenant_name}</p>
                        {d.tenant_phone && <p className="text-[10px] text-gray-500 flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{d.tenant_phone}</p>}
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <p className="text-[11px] text-gray-700 max-w-[120px] truncate">{d.property_name || "—"}</p>
                        {d.room_number && <p className="text-[10px] text-gray-500">Room: {d.room_number}</p>}
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <Badge className={`text-[9px] px-1.5 py-0 ${statusColor(d.status)}`}>{d.status}</Badge>
                        {STATUS_FLOW[d.status] && (
                          <p className="text-[9px] text-gray-400 mt-0.5 flex items-center gap-0.5">
                            <ArrowRight className="h-2.5 w-2.5" />{STATUS_FLOW[d.status]}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <Badge className={`text-[9px] px-1.5 py-0 ${priorityColor(d.priority)}`}>{d.priority}</Badge>
                      </TableCell>
                      <TableCell className="py-2 px-3 text-[10px] text-gray-500">{fmt(d.created_at)}</TableCell>
                      <TableCell className="py-2 px-3">
                        <div className="flex justify-end gap-0.5">
                          {/* View */}
                          <button onClick={async () => {
                            setLoadingView(true);
                            try {
                              const r = await getDocument(d.id);
                              setViewDoc(r.data || d);
                            } catch { setViewDoc(d); }
                            finally { setLoadingView(false); }
                          }} title="View"
                            className="p-1.5 rounded-md text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            {loadingView ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          {/* Advance status */}
                          {STATUS_FLOW[d.status] && (
                            <button onClick={() => handleAdvanceStatus(d)} title={`Advance to ${STATUS_FLOW[d.status]}`}
                              className="p-1.5 rounded-md text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors">
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {/* Share popup */}
                          <div className="relative">
                            <button onClick={() => { setShareDoc(d); setShowSharePopup(p => shareDoc?.id === d.id ? !p : true); }} title="Share"
                              className="p-1.5 rounded-md text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                              <Share2 className="h-3.5 w-3.5" />
                            </button>
                            {showSharePopup && shareDoc?.id === d.id && (
                              <div className="absolute bottom-full right-0 mb-1.5 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-44">
                                <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Share via</p>
                                </div>
                                <button onClick={() => handleShareWhatsApp(d)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-green-50 transition-colors text-left">
                                  <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                    <MessageCircle className="h-3 w-3 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-semibold text-gray-800">WhatsApp</p>
                                    <p className="text-[9px] text-gray-400">{d.tenant_phone || "No phone"}</p>
                                  </div>
                                </button>
                                <button onClick={() => handleShareEmail(d)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 transition-colors text-left border-t border-gray-100">
                                  <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                    <Mail className="h-3 w-3 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-semibold text-gray-800">Email</p>
                                    <p className="text-[9px] text-gray-400 truncate max-w-[80px]">{d.tenant_email || "No email"}</p>
                                  </div>
                                </button>
                              </div>
                            )}
                          </div>
                          {/* Print */}
                          <button onClick={() => handlePrint(d)} title="Print"
                            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                          {/* Download */}
                          <button onClick={() => handleDownload(d)} title="Download"
                            className="p-1.5 rounded-md text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          {/* Delete */}
                          <button onClick={() => handleDelete(d.id, d.document_name)} title="Delete"
                            className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>

        {/* ── FILTER SIDEBAR ── */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />}
        <aside className={`fixed top-0 right-0 h-full z-40 w-72 sm:w-80 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">Filters</span>
              {hasFilters && <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">{filterCount} active</span>}
            </div>
            <div className="flex items-center gap-2">
              {hasFilters && <button onClick={clearFilters} className="text-[10px] text-blue-200 hover:text-white font-semibold">Clear all</button>}
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white"><X className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Status filter */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Status</p>
              <div className="space-y-1">
                {["all", ...ALL_STATUSES].map(s => (
                  <label key={s} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${statusFilter===s ? "bg-blue-50 border border-blue-200 text-blue-700" : "hover:bg-gray-50 border border-transparent text-gray-700"}`}>
                    <input type="radio" name="status" checked={statusFilter===s} onChange={() => setStatusFilter(s)} className="sr-only" />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusFilter===s ? "bg-blue-500" : "bg-gray-300"}`} />
                    <span className="text-[12px] font-medium">{s === "all" ? "All Statuses" : s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-100" />
            {/* Priority filter */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Priority</p>
              <div className="space-y-1">
                {["all","low","normal","high","urgent"].map(p => (
                  <label key={p} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${priorityFilter===p ? "bg-blue-50 border border-blue-200 text-blue-700" : "hover:bg-gray-50 border border-transparent text-gray-700"}`}>
                    <input type="radio" name="priority" checked={priorityFilter===p} onChange={() => setPriorityFilter(p)} className="sr-only" />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${priorityFilter===p ? "bg-blue-500" : "bg-gray-300"}`} />
                    <span className="text-[12px] font-medium capitalize">{p === "all" ? "All Priorities" : p}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
            <button onClick={clearFilters} disabled={!hasFilters} className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40">Clear All</button>
            <button onClick={() => setSidebarOpen(false)} className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold">Apply & Close</button>
          </div>
        </aside>
      </div>

      {/* ══ VIEW MODAL ══ */}
      {viewDoc && (
        <Dialog open={!!viewDoc} onOpenChange={v => { if (!v) { setViewDoc(null); setShowSharePopup(false); } }}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[92vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold">{viewDoc.document_name}</h2>
                <p className="text-xs text-blue-100">{viewDoc.document_number} · {viewDoc.tenant_name}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Status badge */}
                <Badge className={`text-[10px] px-2 py-0.5 ${statusColor(viewDoc.status)}`}>{viewDoc.status}</Badge>
                {/* Advance */}
                {STATUS_FLOW[viewDoc.status] && (
                  <button onClick={() => handleAdvanceStatus(viewDoc)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[10px] font-medium">
                    <ArrowRight className="h-3 w-3" />{STATUS_FLOW[viewDoc.status]}
                  </button>
                )}
                {/* Share */}
                <div className="relative">
                  <button onClick={() => setShowSharePopup(p => !p)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[10px] font-medium">
                    <Share2 className="h-3 w-3" />Share
                  </button>
                  {showSharePopup && (
                    <div className="absolute top-full right-0 mt-1.5 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-48">
                      <div className="px-3 py-1.5 bg-gray-50 border-b"><p className="text-[10px] font-bold text-gray-500 uppercase">Share via</p></div>
                      <button onClick={() => handleShareWhatsApp(viewDoc)} className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-green-50 text-left">
                        <div className="h-7 w-7 rounded-full bg-green-500 flex items-center justify-center"><MessageCircle className="h-3.5 w-3.5 text-white" /></div>
                        <div><p className="text-[11px] font-semibold text-gray-800">WhatsApp</p><p className="text-[9px] text-gray-400">{viewDoc.tenant_phone||"No phone"}</p></div>
                      </button>
                      <button onClick={() => handleShareEmail(viewDoc)} className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-blue-50 text-left border-t border-gray-100">
                        <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center"><Mail className="h-3.5 w-3.5 text-white" /></div>
                        <div><p className="text-[11px] font-semibold text-gray-800">Email</p><p className="text-[9px] text-gray-400">{viewDoc.tenant_email||"No email"}</p></div>
                      </button>
                    </div>
                  )}
                </div>
                {/* Print */}
                <button onClick={() => handlePrint(viewDoc)} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><Printer className="h-4 w-4" /></button>
                {/* Download */}
                <button onClick={() => handleDownload(viewDoc)} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><Download className="h-4 w-4" /></button>
                <DialogClose asChild>
                  <button className="p-1.5 rounded-full hover:bg-white/20"><X className="h-4 w-4 text-white" /></button>
                </DialogClose>
              </div>
            </div>

            {/* Doc info bar */}
            <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2.5 bg-gray-50 border-b text-[11px]">
              {[
                ["Tenant",   viewDoc.tenant_name],
                ["Phone",    viewDoc.tenant_phone || "—"],
                ["Property", viewDoc.property_name || "—"],
                ["Room",     viewDoc.room_number   || "—"],
              ].map(([k,v]) => (
                <div key={k}>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{k}</span>
                  <p className="font-semibold text-gray-800 truncate">{v}</p>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-100" style={{ maxHeight:"calc(92vh - 160px)" }}>
              <div className="bg-white rounded-lg shadow max-w-[210mm] mx-auto p-2">
                {viewDoc.html_content
                  ? <div dangerouslySetInnerHTML={{ __html: viewDoc.html_content }} />
                  : <div className="text-center py-16 text-gray-400">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm font-medium">No document content available</p>
                      <p className="text-xs mt-1">The document may not have been saved with HTML content</p>
                    </div>
                }
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Close share popup on outside click */}
      {showSharePopup && (
        <div className="fixed inset-0 z-40" onClick={() => setShowSharePopup(false)} />
      )}
    </div>
  );
}