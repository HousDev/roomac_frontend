import { useState, useEffect } from 'react';
import { FileText, Eye, Save, X, ChevronLeft, ChevronRight, Clock, CheckCircle, Ligature as FileSignature, Share2, AlertCircle, Search, Filter } from 'lucide-react';
// import { supabase } from '../../lib/supabase';
import { DocumentTemplate } from '../../types/document';

export function DocumentCreate() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [documentSettings, setDocumentSettings] = useState({
    signatureRequired: false,
    priority: 'normal',
    expiryDate: '',
    tags: [] as string[],
    notes: ''
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
      setFilteredTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(search) ||
        t.category.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }

    setFilteredTemplates(filtered);
  };

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category))).sort()];

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    const initialData: Record<string, any> = {
      date: new Date().toISOString().split('T')[0],
      document_number: 'AUTO-GENERATED'
    };
    template.variables.forEach(variable => {
      if (!initialData[variable]) {
        initialData[variable] = '';
      }
    });
    setFormData(initialData);
    setStep(2);
  };

  const generatePreview = () => {
    if (!selectedTemplate) return;

    let html = selectedTemplate.html_content;
    Object.keys(formData).forEach(key => {
      const value = formData[key] || `[${key}]`;
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    setPreviewHtml(html);
    setShowPreview(true);
  };

  const handleSave = async () => {
    if (!formData.tenant_name || !formData.tenant_phone) {
      alert('Please fill in required fields: Tenant Name and Tenant Phone');
      return;
    }

    try {
      setSaving(true);

      let html = selectedTemplate!.html_content;
      Object.keys(formData).forEach(key => {
        const value = formData[key] || '';
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      const documentData = {
        template_id: selectedTemplate!.id,
        document_number: '',
        document_name: selectedTemplate!.name,
        tenant_name: formData.tenant_name || 'N/A',
        tenant_phone: formData.tenant_phone || 'N/A',
        tenant_email: formData.tenant_email,
        property_name: formData.property_name,
        room_number: formData.room_number,
        html_content: html,
        data_json: formData,
        status: 'Created',
        created_by: 'Admin',
        signature_required: documentSettings.signatureRequired,
        priority: documentSettings.priority,
        expiry_date: documentSettings.expiryDate || null,
        tags: documentSettings.tags,
        notes: documentSettings.notes
      };

      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert([documentData])
        .select()
        .single();

      if (docError) throw docError;

      const { error: historyError } = await supabase
        .from('document_status_history')
        .insert([{
          document_id: docData.id,
          status: 'Created',
          event_type: 'Created',
          event_description: `Document "${selectedTemplate!.name}" created`,
          performed_by: 'Admin',
          metadata: {
            template_name: selectedTemplate!.name,
            tenant_name: formData.tenant_name,
            signature_required: documentSettings.signatureRequired,
            priority: documentSettings.priority
          }
        }]);

      if (historyError) throw historyError;

      alert(`Document created successfully!\nDocument Number: ${docData.document_number}\n\nYou can now view, share, or track this document from the Document List.`);

      setStep(1);
      setSelectedTemplate(null);
      setFormData({});
      setDocumentSettings({
        signatureRequired: false,
        priority: 'normal',
        expiryDate: '',
        tags: [],
        notes: ''
      });
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Failed to create document: ' + (error as any).message);
    } finally {
      setSaving(false);
    }
  };

  const getFieldLabel = (variable: string): string => {
    return variable
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getFieldType = (variable: string): string => {
    if (variable.includes('date')) return 'date';
    if (variable.includes('email')) return 'email';
    if (variable.includes('phone')) return 'tel';
    if (variable.includes('amount') || variable.includes('deposit') || variable.includes('rent')) return 'number';
    return 'text';
  };

  const addTag = (tag: string) => {
    if (tag && !documentSettings.tags.includes(tag)) {
      setDocumentSettings({
        ...documentSettings,
        tags: [...documentSettings.tags, tag]
      });
    }
  };

  const removeTag = (tag: string) => {
    setDocumentSettings({
      ...documentSettings,
      tags: documentSettings.tags.filter(t => t !== tag)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Create Document
            </h1>
            <p className="text-gray-600 font-semibold mt-1">Generate documents from templates with complete tracking</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
              step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <span className="font-bold">Select Template</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
              step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <span className="font-bold">Fill Details</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
              step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
            <span className="font-bold">Settings & Save</span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
          <div className="mb-6">
            <h2 className="text-xl font-black text-gray-900 mb-4">Select a Template</h2>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates by name, category, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="relative min-w-[200px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredTemplates.length > 0 && (
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span className="font-medium">
                  Showing {filteredTemplates.length} of {templates.length} templates
                </span>
                {(searchTerm || selectedCategory !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                    }}
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">No templates available</p>
              <p className="text-gray-500 text-sm mt-2">Please create templates first from Template Manager</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">No templates found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="text-left p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-black text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-block px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">
                          {template.category}
                        </span>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          v{template.version}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && selectedTemplate && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900">Fill Document Details</h2>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold">
              {selectedTemplate.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {selectedTemplate.variables
              .filter(v => v !== 'document_number')
              .map(variable => (
              <div key={variable}>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {getFieldLabel(variable)}
                  {variable.includes('tenant') && (variable.includes('name') || variable.includes('phone')) ? (
                    <span className="text-red-500 ml-1">*</span>
                  ) : null}
                </label>
                <input
                  type={getFieldType(variable)}
                  value={formData[variable] || ''}
                  onChange={(e) => setFormData({ ...formData, [variable]: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
                  placeholder={`Enter ${getFieldLabel(variable).toLowerCase()}`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t-2 border-gray-200">
            <button
              onClick={() => {
                setStep(1);
                setSelectedTemplate(null);
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={generatePreview}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Preview
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && selectedTemplate && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900">Document Settings & Options</h2>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold">
              {selectedTemplate.name}
            </span>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <FileSignature className="w-5 h-5 text-blue-600" />
                  <label className="flex items-center gap-2 font-bold text-gray-900">
                    <input
                      type="checkbox"
                      checked={documentSettings.signatureRequired}
                      onChange={(e) => setDocumentSettings({ ...documentSettings, signatureRequired: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    Signature Required
                  </label>
                </div>
                <p className="text-sm text-gray-600 ml-8">Document requires tenant signature before completion</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  Priority Level
                </label>
                <select
                  value={documentSettings.priority}
                  onChange={(e) => setDocumentSettings({ ...documentSettings, priority: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={documentSettings.expiryDate}
                  onChange={(e) => setDocumentSettings({ ...documentSettings, expiryDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">Set an expiry date for time-sensitive documents</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-600" />
                  Tags (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
                    placeholder="Press Enter to add tag"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {documentSettings.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-purple-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Additional Notes (Optional)</label>
              <textarea
                value={documentSettings.notes}
                onChange={(e) => setDocumentSettings({ ...documentSettings, notes: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
                rows={3}
                placeholder="Add any additional notes or instructions"
              />
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-green-900 mb-2">Document Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="font-bold">Template:</span> {selectedTemplate.name}</div>
                    <div><span className="font-bold">Tenant:</span> {formData.tenant_name || 'N/A'}</div>
                    <div><span className="font-bold">Phone:</span> {formData.tenant_phone || 'N/A'}</div>
                    <div><span className="font-bold">Priority:</span> {documentSettings.priority.toUpperCase()}</div>
                    <div><span className="font-bold">Signature:</span> {documentSettings.signatureRequired ? 'Required' : 'Not Required'}</div>
                    <div><span className="font-bold">Expiry:</span> {documentSettings.expiryDate || 'No expiry'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t-2 border-gray-200 mt-6">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={generatePreview}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white">Document Preview</h2>
                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
