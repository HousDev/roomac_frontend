import { useState, useEffect } from 'react';
import { FileText, Eye, Share2, Trash2, Clock, CheckCircle, X, Printer, ArrowRight, AlertCircle, Send, Users } from 'lucide-react';
// import { supabase } from '../../lib/supabase';
import { Document, DocumentStatusHistory } from '../../types/document';
import { DataTable } from '../../components/common/DataTable';

import { Toast } from '../../components/common/Toast';
import { WorkflowProgressBar } from '@/components/common/WorkflowProgressBar';

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentHistory, setDocumentHistory] = useState<DocumentStatusHistory[]>([]);
  const [shareData, setShareData] = useState({
    method: 'Email',
    recipient_name: '',
    recipient_contact: '',
    verification_method: 'Email'
  });
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (doc: Document) => {
    setSelectedDocument(doc);
    setShowViewModal(true);
  };

  const handleViewHistory = async (doc: Document) => {
    setSelectedDocument(doc);
    try {
      const { data, error } = await supabase
        .from('document_status_history')
        .select('*')
        .eq('document_id', doc.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocumentHistory(data || []);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleShare = (doc: Document) => {
    setSelectedDocument(doc);
    setShareData({
      method: 'Email',
      recipient_name: doc.tenant_name,
      recipient_contact: doc.tenant_email || doc.tenant_phone,
      verification_method: 'Email'
    });
    setShowShareModal(true);
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const generateAccessToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleShareSubmit = async () => {
    if (!selectedDocument) return;

    try {
      setSharing(true);

      const otp = generateOTP();
      const accessToken = generateAccessToken();
      const shareLink = `${window.location.origin}/documents/view/${accessToken}`;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error: shareError } = await supabase
        .from('document_shares')
        .insert([{
          document_id: selectedDocument.id,
          share_method: shareData.method,
          recipient_name: shareData.recipient_name,
          recipient_contact: shareData.recipient_contact,
          share_link: shareLink,
          access_token: accessToken,
          otp_code: otp,
          otp_verified: false,
          verification_method: shareData.verification_method,
          expires_at: expiresAt.toISOString(),
          shared_by: 'Admin'
        }]);

      if (shareError) throw shareError;

      const { error: docError } = await supabase
        .from('documents')
        .update({ status: 'Shared' })
        .eq('id', selectedDocument.id);

      if (docError) throw docError;

      const { error: historyError } = await supabase
        .from('document_status_history')
        .insert([{
          document_id: selectedDocument.id,
          status: 'Shared',
          event_type: 'Shared',
          event_description: `Document shared via ${shareData.method} to ${shareData.recipient_name}`,
          performed_by: 'Admin',
          metadata: {
            method: shareData.method,
            recipient: shareData.recipient_contact
          }
        }]);

      if (historyError) throw historyError;

      alert(`Document shared successfully!\n\nShare Link: ${shareLink}\nOTP: ${otp}\n\nThe recipient will need to verify with OTP to access the document.`);

      await fetchDocuments();
      setShowShareModal(false);
    } catch (error) {
      console.error('Error sharing document:', error);
      alert('Failed to share document');
    } finally {
      setSharing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const doc = documents.find(d => d.id === id);

      const { error: historyError } = await supabase
        .from('document_status_history')
        .insert([{
          document_id: id,
          status: 'Deleted',
          event_type: 'Deleted',
          event_description: `Document "${doc?.document_name}" deleted`,
          performed_by: 'Admin',
          metadata: {}
        }]);

      if (historyError) throw historyError;

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const handleBulkDelete = async (docs: Document[]) => {
    if (!confirm(`Are you sure you want to delete ${docs.length} document(s)?`)) return;

    try {
      const ids = docs.map(d => d.id);
      const { error } = await supabase
        .from('documents')
        .delete()
        .in('id', ids);

      if (error) throw error;
      await fetchDocuments();
      alert(`Successfully deleted ${docs.length} document(s)`);
    } catch (error) {
      console.error('Error deleting documents:', error);
      alert('Failed to delete documents');
    }
  };

  const handleBulkStatusChange = async (docs: Document[], newStatus: string) => {
    try {
      const ids = docs.map(d => d.id);

      const nextActions: Record<string, string> = {
        'Created': 'Share with Tenant',
        'Shared': 'Wait for Tenant to View',
        'Viewed': 'Verify Tenant Identity',
        'Verified': 'Mark as Completed',
        'Completed': 'Archive Document'
      };

      const { error } = await supabase
        .from('documents')
        .update({
          status: newStatus,
          workflow_stage: newStatus.toLowerCase(),
          next_action: nextActions[newStatus] || 'Update Status',
          last_action_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', ids);

      if (error) throw error;

      for (const doc of docs) {
        await supabase
          .from('document_status_history')
          .insert([{
            document_id: doc.id,
            status: newStatus,
            event_type: 'Updated',
            event_description: `Status changed to ${newStatus} (Bulk Action)`,
            performed_by: 'Admin',
            metadata: { bulk_action: true }
          }]);
      }

      await fetchDocuments();
      alert(`Successfully updated ${docs.length} document(s) to ${newStatus}`);
    } catch (error) {
      console.error('Error updating documents:', error);
      alert('Failed to update documents');
    }
  };

  const handleProgressDocument = async (doc: Document) => {
    const statusFlow: Record<string, string> = {
      'Created': 'Shared',
      'Shared': 'Viewed',
      'Viewed': 'Verified',
      'Verified': 'Completed'
    };

    const nextStatus = statusFlow[doc.status];
    if (!nextStatus) {
      alert('Document is already at final status');
      return;
    }

    const stageDescriptions: Record<string, string> = {
      'Shared': 'Document has been shared with recipient',
      'Viewed': 'Recipient has viewed the document',
      'Verified': 'Recipient identity has been verified',
      'Completed': 'Document workflow completed'
    };

    try {
      const nextActions: Record<string, string> = {
        'Created': 'Share with Tenant',
        'Shared': 'Wait for Tenant to View',
        'Viewed': 'Verify Tenant Identity',
        'Verified': 'Mark as Completed',
        'Completed': 'Archive Document'
      };

      const { error: updateError } = await supabase
        .from('documents')
        .update({
          status: nextStatus,
          workflow_stage: nextStatus.toLowerCase(),
          next_action: nextActions[nextStatus] || 'Update Status',
          last_action_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', doc.id);

      if (updateError) throw updateError;

      const { error: historyError } = await supabase
        .from('document_status_history')
        .insert([{
          document_id: doc.id,
          status: nextStatus,
          event_type: 'Progressed',
          event_description: `Workflow advanced from ${doc.status} to ${nextStatus}`,
          performed_by: 'Admin',
          metadata: {
            previous_status: doc.status,
            new_status: nextStatus
          }
        }]);

      if (historyError) throw historyError;

      await fetchDocuments();

      setToast({
        message: `Workflow advanced to "${nextStatus}" stage. ${stageDescriptions[nextStatus]}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error progressing document:', error);
      setToast({
        message: 'Failed to progress document',
        type: 'error'
      });
    }
  };

  const handlePrint = (doc: Document) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(doc.html_content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Created': return 'bg-blue-100 text-blue-700';
      case 'Shared': return 'bg-purple-100 text-purple-700';
      case 'Viewed': return 'bg-yellow-100 text-yellow-700';
      case 'Verified': return 'bg-green-100 text-green-700';
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const columns = [
    {
      key: 'document_number',
      label: 'Document #',
      render: (row: Document) => (
        <span className="font-mono font-bold text-blue-600">{row.document_number}</span>
      )
    },
    {
      key: 'document_name',
      label: 'Document Name',
      render: (row: Document) => (
        <div className="min-w-[280px]">
          <div className="font-bold text-gray-900">{row.document_name}</div>
          <div className="text-sm text-gray-500 mb-2">{row.tenant_name}</div>
          <WorkflowProgressBar currentStatus={row.status} compact />
        </div>
      )
    },
    {
      key: 'property_name',
      label: 'Property',
      render: (row: Document) => (
        <div className="text-sm">
          <div className="font-semibold text-gray-700">{row.property_name || 'N/A'}</div>
          {row.room_number && (
            <div className="text-gray-500">Room: {row.room_number}</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Workflow Status',
      render: (row: Document) => (
        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(row.status)}`}>
            {row.status}
          </span>
          {row.next_action && (
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
              <AlertCircle className="w-3 h-3" />
              <span className="font-medium">{row.next_action}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (row: Document) => (
        <div className="text-sm text-gray-600">
          {new Date(row.created_at).toLocaleDateString('en-IN')}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: Document) => {
        const statusFlow: Record<string, string> = {
          'Created': 'Shared',
          'Shared': 'Viewed',
          'Viewed': 'Verified',
          'Verified': 'Completed'
        };
        const nextStage = statusFlow[row.status];

        return (
          <div className="flex items-center gap-2">
            {row.status !== 'Completed' && nextStage && (
              <button
                onClick={() => handleProgressDocument(row)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors group relative"
                title={`Advance to "${nextStage}" stage`}
              >
                <ArrowRight className="w-4 h-4" />
                <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Advance to {nextStage}
                </span>
              </button>
            )}
          <button
            onClick={() => handleView(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleShare(row)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleViewHistory(row)}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            title="History"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePrint(row)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            title="Print"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              All Documents
            </h1>
            <p className="text-gray-600 font-semibold mt-1">View, share, and manage documents</p>
          </div>
        </div>
      </div>

      <DataTable
        data={documents}
        columns={columns}
        onBulkDelete={handleBulkDelete}
        bulkActions={[
          {
            label: 'Mark as Shared',
            icon: <Send className="w-3 h-3" />,
            onClick: (docs) => handleBulkStatusChange(docs, 'Shared'),
            variant: 'primary'
          },
          {
            label: 'Mark as Viewed',
            icon: <Eye className="w-3 h-3" />,
            onClick: (docs) => handleBulkStatusChange(docs, 'Viewed'),
            variant: 'secondary'
          },
          {
            label: 'Mark as Verified',
            icon: <CheckCircle className="w-3 h-3" />,
            onClick: (docs) => handleBulkStatusChange(docs, 'Verified'),
            variant: 'primary'
          },
          {
            label: 'Mark as Completed',
            icon: <CheckCircle className="w-3 h-3" />,
            onClick: (docs) => handleBulkStatusChange(docs, 'Completed'),
            variant: 'primary'
          }
        ]}
        onExport={() => {}}
        title="Documents"
        rowKey="id"
        loading={loading}
      />

      {showViewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">{selectedDocument.document_name}</h2>
                  <p className="text-sm text-blue-100">{selectedDocument.document_number}</p>
                </div>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div dangerouslySetInnerHTML={{ __html: selectedDocument.html_content }} />
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">Document History</h2>
                  <p className="text-sm text-green-100">{selectedDocument.document_number}</p>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {documentHistory.map((history, idx) => (
                  <div key={history.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      {idx < documentHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-green-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900">{history.event_type}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(history.created_at).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{history.event_description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>By: {history.performed_by}</span>
                        {history.ip_address && <span>IP: {history.ip_address}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showShareModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white">Share Document</h2>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Share Method</label>
                <select
                  value={shareData.method}
                  onChange={(e) => setShareData({ ...shareData, method: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
                >
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Link">Link Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Recipient Name</label>
                <input
                  type="text"
                  value={shareData.recipient_name}
                  onChange={(e) => setShareData({ ...shareData, recipient_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
                  placeholder="Enter recipient name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {shareData.method === 'Email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input
                  type={shareData.method === 'Email' ? 'email' : 'tel'}
                  value={shareData.recipient_contact}
                  onChange={(e) => setShareData({ ...shareData, recipient_contact: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
                  placeholder={shareData.method === 'Email' ? 'email@example.com' : '+91 9876543210'}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Verification Method</label>
                <select
                  value={shareData.verification_method}
                  onChange={(e) => setShareData({ ...shareData, verification_method: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
                >
                  <option value="Email">Email OTP</option>
                  <option value="Mobile">Mobile OTP</option>
                  <option value="Aadhaar">Aadhaar Last 4 Digits</option>
                </select>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-900">
                  <strong>Note:</strong> The recipient will receive a secure link with an OTP. They must verify their identity to access the document.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t-2 border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShareSubmit}
                disabled={sharing}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {sharing ? (
                  <>Sharing...</>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    Share Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </div>
  );
}
