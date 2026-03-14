import { useState, useEffect } from 'react';
import { Plus, Eye, CreditCard as Edit, Trash2, Save, X, Code, FileText, History, Copy, Tag, CheckCircle, XCircle } from 'lucide-react';
// import { supabase } from '../../lib/supabase';
import { DocumentTemplate } from '../../types/document';
import { DataTable } from '../../components/common/DataTable';

interface TemplateVersion {
  id: string;
  template_id: string;
  version: number;
  name: string;
  category: string;
  description?: string;
  html_content: string;
  variables: string[];
  change_notes?: string;
  created_by: string;
  created_at: string;
}

export function TemplateManager() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedTemplateForHistory, setSelectedTemplateForHistory] = useState<DocumentTemplate | null>(null);
  const [versionHistory, setVersionHistory] = useState<TemplateVersion[]>([]);
  const [previewContent, setPreviewContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [changeNotes, setChangeNotes] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    html_content: '',
    variables: [] as string[]
  });

  const categories = [
    'Agreements',
    'Rental Agreements',
    'KYC Documents',
    'Onboarding Documents',
    'Financial Documents',
    'Policy Documents',
    'Exit Documents',
    'Inspection Forms',
    'Declarations',
    'Other'
  ];

  const commonVariables = [
    { name: 'date', label: 'Current Date', example: '2024-03-14' },
    { name: 'document_number', label: 'Document Number', example: 'DOC-202403-0001' },
    { name: 'tenant_name', label: 'Tenant Name', example: 'John Doe' },
    { name: 'tenant_phone', label: 'Tenant Phone', example: '+91 9876543210' },
    { name: 'tenant_email', label: 'Tenant Email', example: 'john@example.com' },
    { name: 'property_name', label: 'Property Name', example: 'Green Heights PG' },
    { name: 'room_number', label: 'Room Number', example: 'R-101' },
    { name: 'bed_number', label: 'Bed Number', example: 'B-1' },
    { name: 'move_in_date', label: 'Move-in Date', example: '2024-03-01' },
    { name: 'rent_amount', label: 'Rent Amount', example: '8000' },
    { name: 'security_deposit', label: 'Security Deposit', example: '16000' },
    { name: 'company_name', label: 'Company Name', example: 'PG Management Co.' },
    { name: 'company_address', label: 'Company Address', example: '123 Main St' },
    { name: 'aadhaar_number', label: 'Aadhaar Number', example: 'XXXX-XXXX-1234' },
    { name: 'pan_number', label: 'PAN Number', example: 'ABCDE1234F' },
    { name: 'emergency_contact_name', label: 'Emergency Contact', example: 'Jane Doe' },
    { name: 'emergency_phone', label: 'Emergency Phone', example: '+91 9876543211' },
    { name: 'payment_mode', label: 'Payment Mode', example: 'UPI/Cash/Bank Transfer' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersionHistory = async (template: DocumentTemplate) => {
    try {
      const { data, error } = await supabase
        .from('document_template_versions')
        .select('*')
        .eq('template_id', template.id)
        .order('version', { ascending: false });

      if (error) throw error;
      setVersionHistory(data || []);
      setSelectedTemplateForHistory(template);
      setShowVersionHistory(true);
    } catch (error) {
      console.error('Error fetching version history:', error);
      alert('Failed to load version history');
    }
  };

  const handleAdd = () => {
    setEditingTemplate(null);
    setChangeNotes('');
    setFormData({
      name: '',
      category: 'Agreements',
      description: '',
      html_content: '<div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">\n  <h1 style="text-align: center; color: #1e40af; margin-bottom: 30px;">{{document_name}}</h1>\n  <p style="margin: 20px 0;"><strong>Date:</strong> {{date}}</p>\n  <p style="margin: 20px 0;"><strong>Document Number:</strong> {{document_number}}</p>\n  \n  <h2 style="color: #1e40af; margin-top: 30px;">TENANT INFORMATION</h2>\n  <p><strong>Name:</strong> {{tenant_name}}</p>\n  <p><strong>Phone:</strong> {{tenant_phone}}</p>\n  <p><strong>Email:</strong> {{tenant_email}}</p>\n  \n  <div style="margin-top: 80px;">\n    <p>_____________________<br/><strong>Signature</strong></p>\n  </div>\n</div>',
      variables: []
    });
    setShowModal(true);
  };

  const handleEdit = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setChangeNotes('');
    setFormData({
      name: template.name,
      category: template.category,
      description: template.description || '',
      html_content: template.html_content,
      variables: template.variables || []
    });
    setShowModal(true);
  };

  const handleDuplicate = (template: DocumentTemplate) => {
    setEditingTemplate(null);
    setChangeNotes('Duplicated from ' + template.name);
    setFormData({
      name: template.name + ' (Copy)',
      category: template.category,
      description: template.description || '',
      html_content: template.html_content,
      variables: template.variables || []
    });
    setShowModal(true);
  };

  const handlePreview = (template: DocumentTemplate) => {
    let content = template.html_content;
    template.variables.forEach((variable: string) => {
      const commonVar = commonVariables.find(v => v.name === variable);
      const sampleValue = commonVar ? commonVar.example : `[${variable}]`;
      content = content.replace(new RegExp(`{{${variable}}}`, 'g'), sampleValue);
    });
    setPreviewContent(content);
    setShowPreview(true);
  };

  const extractVariables = (html: string): string[] => {
    const regex = /{{(\w+)}}/g;
    const matches = html.matchAll(regex);
    const variables = new Set<string>();
    for (const match of matches) {
      variables.add(match[1]);
    }
    return Array.from(variables);
  };

  const insertVariable = (variableName: string) => {
    const variable = `{{${variableName}}}`;
    setFormData({
      ...formData,
      html_content: formData.html_content + variable
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (!formData.html_content.trim()) {
      alert('Please enter HTML content');
      return;
    }

    try {
      setSaving(true);
      const variables = extractVariables(formData.html_content);

      const templateData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        html_content: formData.html_content,
        variables: variables,
        is_active: true,
        last_modified_by: 'Admin'
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('document_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        alert(`Template updated successfully!\nVersion ${editingTemplate.version + 1} created`);
      } else {
        const { error } = await supabase
          .from('document_templates')
          .insert([{
            ...templateData,
            created_by: 'Admin'
          }]);

        if (error) throw error;
        alert('Template created successfully!');
      }

      await fetchTemplates();
      setShowModal(false);
      setChangeNotes('');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template: ' + (error as any).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template? This will also delete all version history.')) return;

    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTemplates();
      alert('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const handleBulkDelete = async (templates: DocumentTemplate[]) => {
    if (!confirm(`Are you sure you want to delete ${templates.length} template(s)?`)) return;

    try {
      const ids = templates.map(t => t.id);
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .in('id', ids);

      if (error) throw error;
      await fetchTemplates();
      alert(`Successfully deleted ${templates.length} template(s)`);
    } catch (error) {
      console.error('Error deleting templates:', error);
      alert('Failed to delete templates');
    }
  };

  const handleBulkActivate = async (templates: DocumentTemplate[]) => {
    try {
      const ids = templates.map(t => t.id);
      const { error } = await supabase
        .from('document_templates')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;
      await fetchTemplates();
      alert(`Successfully activated ${templates.length} template(s)`);
    } catch (error) {
      console.error('Error activating templates:', error);
      alert('Failed to activate templates');
    }
  };

  const handleBulkDeactivate = async (templates: DocumentTemplate[]) => {
    try {
      const ids = templates.map(t => t.id);
      const { error } = await supabase
        .from('document_templates')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;
      await fetchTemplates();
      alert(`Successfully deactivated ${templates.length} template(s)`);
    } catch (error) {
      console.error('Error deactivating templates:', error);
      alert('Failed to deactivate templates');
    }
  };

  const restoreVersion = async (version: TemplateVersion) => {
    if (!confirm(`Restore template to version ${version.version}? This will create a new version.`)) return;

    try {
      const { error } = await supabase
        .from('document_templates')
        .update({
          name: version.name,
          category: version.category,
          description: version.description,
          html_content: version.html_content,
          variables: version.variables,
          last_modified_by: 'Admin'
        })
        .eq('id', version.template_id);

      if (error) throw error;

      await fetchTemplates();
      setShowVersionHistory(false);
      alert(`Template restored to version ${version.version}`);
    } catch (error) {
      console.error('Error restoring version:', error);
      alert('Failed to restore version');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Template Name',
      render: (row: DocumentTemplate) => (
        <div>
          <div className="font-bold text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.category}</div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (row: DocumentTemplate) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">{row.description || 'No description'}</div>
      )
    },
    {
      key: 'variables',
      label: 'Variables',
      render: (row: DocumentTemplate) => (
        <div className="flex items-center gap-1">
          <Code className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-blue-600">{row.variables?.length || 0}</span>
        </div>
      )
    },
    {
      key: 'version',
      label: 'Version',
      render: (row: DocumentTemplate) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-bold">v{row.version}</span>
      )
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      render: (row: DocumentTemplate) => (
        <div className="text-sm text-gray-600">
          {new Date(row.updated_at).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row: DocumentTemplate) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          row.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: DocumentTemplate) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePreview(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDuplicate(row)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => fetchVersionHistory(row)}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            title="Version History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Template Manager
            </h1>
            <p className="text-gray-600 font-semibold mt-1">Create and manage document templates with automatic versioning</p>
          </div>
        </div>
      </div>

      <DataTable
        data={templates}
        columns={columns}
        onAdd={handleAdd}
        onBulkDelete={handleBulkDelete}
        bulkActions={[
          {
            label: 'Activate',
            icon: <CheckCircle className="w-3 h-3" />,
            onClick: handleBulkActivate,
            variant: 'primary'
          },
          {
            label: 'Deactivate',
            icon: <XCircle className="w-3 h-3" />,
            onClick: handleBulkDeactivate,
            variant: 'secondary'
          }
        ]}
        onExport={() => {}}
        title="Document Templates"
        addButtonText="Create Template"
        rowKey="id"
        loading={loading}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    {editingTemplate ? `Edit Template (v${editingTemplate.version})` : 'Create New Template'}
                  </h2>
                  <p className="text-sm text-blue-100 mt-1">
                    {editingTemplate ? 'Editing will create a new version automatically' : 'Design your document template with HTML'}
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Template Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
                        placeholder="e.g., Occupancy Agreement"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
                      placeholder="Brief description of this template"
                    />
                  </div>

                  {editingTemplate && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Change Notes <span className="text-xs text-gray-500">(Optional - describe what changed)</span>
                      </label>
                      <input
                        type="text"
                        value={changeNotes}
                        onChange={(e) => setChangeNotes(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
                        placeholder="e.g., Updated terms and conditions section"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      HTML Content <span className="text-red-500">*</span>
                      <span className="ml-2 text-xs text-gray-500">Use double braces like tenant_name for variables</span>
                    </label>
                    <textarea
                      value={formData.html_content}
                      onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-mono text-sm"
                      rows={25}
                      placeholder="Enter HTML content with variables like {{tenant_name}}, {{date}}, etc."
                    />
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Detected Variables ({extractVariables(formData.html_content).length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {extractVariables(formData.html_content).map(variable => {
                        const commonVar = commonVariables.find(v => v.name === variable);
                        return (
                          <span
                            key={variable}
                            className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold"
                            title={commonVar ? `${commonVar.label} - Example: ${commonVar.example}` : variable}
                          >
                            {variable}
                          </span>
                        );
                      })}
                      {extractVariables(formData.html_content).length === 0 && (
                        <span className="text-sm text-blue-700">No variables detected. Add variables using double braces.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 sticky top-24">
                    <h3 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Available Variables
                    </h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {commonVariables.map(variable => (
                        <button
                          key={variable.name}
                          onClick={() => insertVariable(variable.name)}
                          className="w-full text-left p-3 bg-white rounded-lg hover:bg-purple-100 transition-colors border border-purple-200 hover:border-purple-400"
                        >
                          <div className="font-bold text-sm text-gray-900">{variable.label}</div>
                          <div className="text-xs text-purple-600 font-mono mt-1">{'{{' + variable.name + '}}'}</div>
                          <div className="text-xs text-gray-500 mt-1">Ex: {variable.example}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-purple-700 mt-3">Click any variable to insert it into your template</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t-2 border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {editingTemplate && (
                  <span className="font-semibold">Current: v{editingTemplate.version} → New: v{editingTemplate.version + 1}</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    let content = formData.html_content;
                    extractVariables(content).forEach(variable => {
                      const commonVar = commonVariables.find(v => v.name === variable);
                      const sampleValue = commonVar ? commonVar.example : `[${variable}]`;
                      content = content.replace(new RegExp(`{{${variable}}}`, 'g'), sampleValue);
                    });
                    setPreviewContent(content);
                    setShowPreview(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Preview
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingTemplate ? 'Update Template' : 'Create Template'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white">Template Preview</h2>
                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div dangerouslySetInnerHTML={{ __html: previewContent }} />
            </div>
          </div>
        </div>
      )}

      {showVersionHistory && selectedTemplateForHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">Version History</h2>
                  <p className="text-sm text-orange-100">{selectedTemplateForHistory.name}</p>
                </div>
                <button onClick={() => setShowVersionHistory(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {versionHistory.map((version, idx) => (
                  <div
                    key={version.id}
                    className={`p-4 rounded-lg border-2 ${
                      idx === 0
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            idx === 0
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-600 text-white'
                          }`}>
                            Version {version.version}
                          </span>
                          {idx === 0 && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {new Date(version.created_at).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">By: {version.created_by}</p>
                      </div>
                      {idx !== 0 && (
                        <button
                          onClick={() => restoreVersion(version)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors text-sm"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-bold text-gray-700">Name:</span> {version.name}
                      </div>
                      <div>
                        <span className="font-bold text-gray-700">Category:</span> {version.category}
                      </div>
                      <div className="col-span-2">
                        <span className="font-bold text-gray-700">Variables:</span>{' '}
                        <span className="text-blue-600 font-mono text-xs">
                          {version.variables.join(', ')}
                        </span>
                      </div>
                      {version.change_notes && (
                        <div className="col-span-2 mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                          <span className="font-bold text-gray-700">Notes:</span> {version.change_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
