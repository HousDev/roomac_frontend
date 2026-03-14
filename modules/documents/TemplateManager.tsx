// import { useState, useEffect } from 'react';
// import { Plus, Eye, CreditCard as Edit, Trash2, Save, X, Code, FileText, History, Copy, Tag, CheckCircle, XCircle } from 'lucide-react';
// // import { supabase } from '../../lib/supabase';
// import { DocumentTemplate } from '../../types/document';
// import { DataTable } from '../../components/common/DataTable';

// interface TemplateVersion {
//   id: string;
//   template_id: string;
//   version: number;
//   name: string;
//   category: string;
//   description?: string;
//   html_content: string;
//   variables: string[];
//   change_notes?: string;
//   created_by: string;
//   created_at: string;
// }

// export function TemplateManager() {
//   const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [showPreview, setShowPreview] = useState(false);
//   const [showVersionHistory, setShowVersionHistory] = useState(false);
//   const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
//   const [selectedTemplateForHistory, setSelectedTemplateForHistory] = useState<DocumentTemplate | null>(null);
//   const [versionHistory, setVersionHistory] = useState<TemplateVersion[]>([]);
//   const [previewContent, setPreviewContent] = useState('');
//   const [saving, setSaving] = useState(false);
//   const [changeNotes, setChangeNotes] = useState('');

//   const [formData, setFormData] = useState({
//     name: '',
//     category: '',
//     description: '',
//     html_content: '',
//     variables: [] as string[]
//   });

//   const categories = [
//     'Agreements',
//     'Rental Agreements',
//     'KYC Documents',
//     'Onboarding Documents',
//     'Financial Documents',
//     'Policy Documents',
//     'Exit Documents',
//     'Inspection Forms',
//     'Declarations',
//     'Other'
//   ];

//   const commonVariables = [
//     { name: 'date', label: 'Current Date', example: '2024-03-14' },
//     { name: 'document_number', label: 'Document Number', example: 'DOC-202403-0001' },
//     { name: 'tenant_name', label: 'Tenant Name', example: 'John Doe' },
//     { name: 'tenant_phone', label: 'Tenant Phone', example: '+91 9876543210' },
//     { name: 'tenant_email', label: 'Tenant Email', example: 'john@example.com' },
//     { name: 'property_name', label: 'Property Name', example: 'Green Heights PG' },
//     { name: 'room_number', label: 'Room Number', example: 'R-101' },
//     { name: 'bed_number', label: 'Bed Number', example: 'B-1' },
//     { name: 'move_in_date', label: 'Move-in Date', example: '2024-03-01' },
//     { name: 'rent_amount', label: 'Rent Amount', example: '8000' },
//     { name: 'security_deposit', label: 'Security Deposit', example: '16000' },
//     { name: 'company_name', label: 'Company Name', example: 'PG Management Co.' },
//     { name: 'company_address', label: 'Company Address', example: '123 Main St' },
//     { name: 'aadhaar_number', label: 'Aadhaar Number', example: 'XXXX-XXXX-1234' },
//     { name: 'pan_number', label: 'PAN Number', example: 'ABCDE1234F' },
//     { name: 'emergency_contact_name', label: 'Emergency Contact', example: 'Jane Doe' },
//     { name: 'emergency_phone', label: 'Emergency Phone', example: '+91 9876543211' },
//     { name: 'payment_mode', label: 'Payment Mode', example: 'UPI/Cash/Bank Transfer' }
//   ];

//   useEffect(() => {
//     fetchTemplates();
//   }, []);

//   const fetchTemplates = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('document_templates')
//         .select('*')
//         .order('created_at', { ascending: false });

//       if (error) throw error;
//       setTemplates(data || []);
//     } catch (error) {
//       console.error('Error fetching templates:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchVersionHistory = async (template: DocumentTemplate) => {
//     try {
//       const { data, error } = await supabase
//         .from('document_template_versions')
//         .select('*')
//         .eq('template_id', template.id)
//         .order('version', { ascending: false });

//       if (error) throw error;
//       setVersionHistory(data || []);
//       setSelectedTemplateForHistory(template);
//       setShowVersionHistory(true);
//     } catch (error) {
//       console.error('Error fetching version history:', error);
//       alert('Failed to load version history');
//     }
//   };

//   const handleAdd = () => {
//     setEditingTemplate(null);
//     setChangeNotes('');
//     setFormData({
//       name: '',
//       category: 'Agreements',
//       description: '',
//       html_content: '<div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">\n  <h1 style="text-align: center; color: #1e40af; margin-bottom: 30px;">{{document_name}}</h1>\n  <p style="margin: 20px 0;"><strong>Date:</strong> {{date}}</p>\n  <p style="margin: 20px 0;"><strong>Document Number:</strong> {{document_number}}</p>\n  \n  <h2 style="color: #1e40af; margin-top: 30px;">TENANT INFORMATION</h2>\n  <p><strong>Name:</strong> {{tenant_name}}</p>\n  <p><strong>Phone:</strong> {{tenant_phone}}</p>\n  <p><strong>Email:</strong> {{tenant_email}}</p>\n  \n  <div style="margin-top: 80px;">\n    <p>_____________________<br/><strong>Signature</strong></p>\n  </div>\n</div>',
//       variables: []
//     });
//     setShowModal(true);
//   };

//   const handleEdit = (template: DocumentTemplate) => {
//     setEditingTemplate(template);
//     setChangeNotes('');
//     setFormData({
//       name: template.name,
//       category: template.category,
//       description: template.description || '',
//       html_content: template.html_content,
//       variables: template.variables || []
//     });
//     setShowModal(true);
//   };

//   const handleDuplicate = (template: DocumentTemplate) => {
//     setEditingTemplate(null);
//     setChangeNotes('Duplicated from ' + template.name);
//     setFormData({
//       name: template.name + ' (Copy)',
//       category: template.category,
//       description: template.description || '',
//       html_content: template.html_content,
//       variables: template.variables || []
//     });
//     setShowModal(true);
//   };

//   const handlePreview = (template: DocumentTemplate) => {
//     let content = template.html_content;
//     template.variables.forEach((variable: string) => {
//       const commonVar = commonVariables.find(v => v.name === variable);
//       const sampleValue = commonVar ? commonVar.example : `[${variable}]`;
//       content = content.replace(new RegExp(`{{${variable}}}`, 'g'), sampleValue);
//     });
//     setPreviewContent(content);
//     setShowPreview(true);
//   };

//   const extractVariables = (html: string): string[] => {
//     const regex = /{{(\w+)}}/g;
//     const matches = html.matchAll(regex);
//     const variables = new Set<string>();
//     for (const match of matches) {
//       variables.add(match[1]);
//     }
//     return Array.from(variables);
//   };

//   const insertVariable = (variableName: string) => {
//     const variable = `{{${variableName}}}`;
//     setFormData({
//       ...formData,
//       html_content: formData.html_content + variable
//     });
//   };

//   const handleSave = async () => {
//     if (!formData.name.trim()) {
//       alert('Please enter a template name');
//       return;
//     }

//     if (!formData.html_content.trim()) {
//       alert('Please enter HTML content');
//       return;
//     }

//     try {
//       setSaving(true);
//       const variables = extractVariables(formData.html_content);

//       const templateData = {
//         name: formData.name,
//         category: formData.category,
//         description: formData.description,
//         html_content: formData.html_content,
//         variables: variables,
//         is_active: true,
//         last_modified_by: 'Admin'
//       };

//       if (editingTemplate) {
//         const { error } = await supabase
//           .from('document_templates')
//           .update(templateData)
//           .eq('id', editingTemplate.id);

//         if (error) throw error;
//         alert(`Template updated successfully!\nVersion ${editingTemplate.version + 1} created`);
//       } else {
//         const { error } = await supabase
//           .from('document_templates')
//           .insert([{
//             ...templateData,
//             created_by: 'Admin'
//           }]);

//         if (error) throw error;
//         alert('Template created successfully!');
//       }

//       await fetchTemplates();
//       setShowModal(false);
//       setChangeNotes('');
//     } catch (error) {
//       console.error('Error saving template:', error);
//       alert('Failed to save template: ' + (error as any).message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this template? This will also delete all version history.')) return;

//     try {
//       const { error } = await supabase
//         .from('document_templates')
//         .delete()
//         .eq('id', id);

//       if (error) throw error;
//       await fetchTemplates();
//       alert('Template deleted successfully');
//     } catch (error) {
//       console.error('Error deleting template:', error);
//       alert('Failed to delete template');
//     }
//   };

//   const handleBulkDelete = async (templates: DocumentTemplate[]) => {
//     if (!confirm(`Are you sure you want to delete ${templates.length} template(s)?`)) return;

//     try {
//       const ids = templates.map(t => t.id);
//       const { error } = await supabase
//         .from('document_templates')
//         .delete()
//         .in('id', ids);

//       if (error) throw error;
//       await fetchTemplates();
//       alert(`Successfully deleted ${templates.length} template(s)`);
//     } catch (error) {
//       console.error('Error deleting templates:', error);
//       alert('Failed to delete templates');
//     }
//   };

//   const handleBulkActivate = async (templates: DocumentTemplate[]) => {
//     try {
//       const ids = templates.map(t => t.id);
//       const { error } = await supabase
//         .from('document_templates')
//         .update({ is_active: true, updated_at: new Date().toISOString() })
//         .in('id', ids);

//       if (error) throw error;
//       await fetchTemplates();
//       alert(`Successfully activated ${templates.length} template(s)`);
//     } catch (error) {
//       console.error('Error activating templates:', error);
//       alert('Failed to activate templates');
//     }
//   };

//   const handleBulkDeactivate = async (templates: DocumentTemplate[]) => {
//     try {
//       const ids = templates.map(t => t.id);
//       const { error } = await supabase
//         .from('document_templates')
//         .update({ is_active: false, updated_at: new Date().toISOString() })
//         .in('id', ids);

//       if (error) throw error;
//       await fetchTemplates();
//       alert(`Successfully deactivated ${templates.length} template(s)`);
//     } catch (error) {
//       console.error('Error deactivating templates:', error);
//       alert('Failed to deactivate templates');
//     }
//   };

//   const restoreVersion = async (version: TemplateVersion) => {
//     if (!confirm(`Restore template to version ${version.version}? This will create a new version.`)) return;

//     try {
//       const { error } = await supabase
//         .from('document_templates')
//         .update({
//           name: version.name,
//           category: version.category,
//           description: version.description,
//           html_content: version.html_content,
//           variables: version.variables,
//           last_modified_by: 'Admin'
//         })
//         .eq('id', version.template_id);

//       if (error) throw error;

//       await fetchTemplates();
//       setShowVersionHistory(false);
//       alert(`Template restored to version ${version.version}`);
//     } catch (error) {
//       console.error('Error restoring version:', error);
//       alert('Failed to restore version');
//     }
//   };

//   const columns = [
//     {
//       key: 'name',
//       label: 'Template Name',
//       render: (row: DocumentTemplate) => (
//         <div>
//           <div className="font-bold text-gray-900">{row.name}</div>
//           <div className="text-sm text-gray-500">{row.category}</div>
//         </div>
//       )
//     },
//     {
//       key: 'description',
//       label: 'Description',
//       render: (row: DocumentTemplate) => (
//         <div className="text-sm text-gray-600 max-w-xs truncate">{row.description || 'No description'}</div>
//       )
//     },
//     {
//       key: 'variables',
//       label: 'Variables',
//       render: (row: DocumentTemplate) => (
//         <div className="flex items-center gap-1">
//           <Code className="w-4 h-4 text-blue-600" />
//           <span className="text-sm font-bold text-blue-600">{row.variables?.length || 0}</span>
//         </div>
//       )
//     },
//     {
//       key: 'version',
//       label: 'Version',
//       render: (row: DocumentTemplate) => (
//         <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-bold">v{row.version}</span>
//       )
//     },
//     {
//       key: 'updated_at',
//       label: 'Last Updated',
//       render: (row: DocumentTemplate) => (
//         <div className="text-sm text-gray-600">
//           {new Date(row.updated_at).toLocaleString('en-IN', {
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//           })}
//         </div>
//       )
//     },
//     {
//       key: 'is_active',
//       label: 'Status',
//       render: (row: DocumentTemplate) => (
//         <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//           row.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
//         }`}>
//           {row.is_active ? 'Active' : 'Inactive'}
//         </span>
//       )
//     },
//     {
//       key: 'actions',
//       label: 'Actions',
//       render: (row: DocumentTemplate) => (
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => handlePreview(row)}
//             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//             title="Preview"
//           >
//             <Eye className="w-4 h-4" />
//           </button>
//           <button
//             onClick={() => handleEdit(row)}
//             className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
//             title="Edit"
//           >
//             <Edit className="w-4 h-4" />
//           </button>
//           <button
//             onClick={() => handleDuplicate(row)}
//             className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
//             title="Duplicate"
//           >
//             <Copy className="w-4 h-4" />
//           </button>
//           <button
//             onClick={() => fetchVersionHistory(row)}
//             className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
//             title="Version History"
//           >
//             <History className="w-4 h-4" />
//           </button>
//           <button
//             onClick={() => handleDelete(row.id)}
//             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//             title="Delete"
//           >
//             <Trash2 className="w-4 h-4" />
//           </button>
//         </div>
//       )
//     }
//   ];

//   return (
//     <div className="flex flex-col h-full">
      

//       <DataTable
//         data={templates}
//         columns={columns}
//         onAdd={handleAdd}
//         onBulkDelete={handleBulkDelete}
//         bulkActions={[
//           {
//             label: 'Activate',
//             icon: <CheckCircle className="w-3 h-3" />,
//             onClick: handleBulkActivate,
//             variant: 'primary'
//           },
//           {
//             label: 'Deactivate',
//             icon: <XCircle className="w-3 h-3" />,
//             onClick: handleBulkDeactivate,
//             variant: 'secondary'
//           }
//         ]}
//         onExport={() => {}}
//         title="Document Templates"
//         addButtonText="Create Template"
//         rowKey="id"
//         loading={loading}
//       />

//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl">
//             <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 rounded-t-2xl z-10">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-black text-white">
//                     {editingTemplate ? `Edit Template (v${editingTemplate.version})` : 'Create New Template'}
//                   </h2>
//                   <p className="text-sm text-blue-100 mt-1">
//                     {editingTemplate ? 'Editing will create a new version automatically' : 'Design your document template with HTML'}
//                   </p>
//                 </div>
//                 <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
//                   <X className="w-6 h-6 text-white" />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6">
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 <div className="lg:col-span-2 space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-2">
//                         Template Name <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.name}
//                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                         className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
//                         placeholder="e.g., Occupancy Agreement"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
//                       <select
//                         value={formData.category}
//                         onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                         className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
//                       >
//                         {categories.map(cat => (
//                           <option key={cat} value={cat}>{cat}</option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
//                     <input
//                       type="text"
//                       value={formData.description}
//                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                       className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
//                       placeholder="Brief description of this template"
//                     />
//                   </div>

//                   {editingTemplate && (
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-2">
//                         Change Notes <span className="text-xs text-gray-500">(Optional - describe what changed)</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={changeNotes}
//                         onChange={(e) => setChangeNotes(e.target.value)}
//                         className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
//                         placeholder="e.g., Updated terms and conditions section"
//                       />
//                     </div>
//                   )}

//                   <div>
//                     <label className="block text-sm font-bold text-gray-700 mb-2">
//                       HTML Content <span className="text-red-500">*</span>
//                       <span className="ml-2 text-xs text-gray-500">Use double braces like tenant_name for variables</span>
//                     </label>
//                     <textarea
//                       value={formData.html_content}
//                       onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
//                       className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-mono text-sm"
//                       rows={25}
//                       placeholder="Enter HTML content with variables like {{tenant_name}}, {{date}}, etc."
//                     />
//                   </div>

//                   <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
//                     <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
//                       <Tag className="w-4 h-4" />
//                       Detected Variables ({extractVariables(formData.html_content).length})
//                     </h3>
//                     <div className="flex flex-wrap gap-2">
//                       {extractVariables(formData.html_content).map(variable => {
//                         const commonVar = commonVariables.find(v => v.name === variable);
//                         return (
//                           <span
//                             key={variable}
//                             className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold"
//                             title={commonVar ? `${commonVar.label} - Example: ${commonVar.example}` : variable}
//                           >
//                             {variable}
//                           </span>
//                         );
//                       })}
//                       {extractVariables(formData.html_content).length === 0 && (
//                         <span className="text-sm text-blue-700">No variables detected. Add variables using double braces.</span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 sticky top-24">
//                     <h3 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
//                       <Code className="w-4 h-4" />
//                       Available Variables
//                     </h3>
//                     <div className="space-y-2 max-h-[600px] overflow-y-auto">
//                       {commonVariables.map(variable => (
//                         <button
//                           key={variable.name}
//                           onClick={() => insertVariable(variable.name)}
//                           className="w-full text-left p-3 bg-white rounded-lg hover:bg-purple-100 transition-colors border border-purple-200 hover:border-purple-400"
//                         >
//                           <div className="font-bold text-sm text-gray-900">{variable.label}</div>
//                           <div className="text-xs text-purple-600 font-mono mt-1">{'{{' + variable.name + '}}'}</div>
//                           <div className="text-xs text-gray-500 mt-1">Ex: {variable.example}</div>
//                         </button>
//                       ))}
//                     </div>
//                     <p className="text-xs text-purple-700 mt-3">Click any variable to insert it into your template</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t-2 border-gray-200 flex justify-between items-center">
//               <div className="text-sm text-gray-600">
//                 {editingTemplate && (
//                   <span className="font-semibold">Current: v{editingTemplate.version} → New: v{editingTemplate.version + 1}</span>
//                 )}
//               </div>
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => {
//                     let content = formData.html_content;
//                     extractVariables(content).forEach(variable => {
//                       const commonVar = commonVariables.find(v => v.name === variable);
//                       const sampleValue = commonVar ? commonVar.example : `[${variable}]`;
//                       content = content.replace(new RegExp(`{{${variable}}}`, 'g'), sampleValue);
//                     });
//                     setPreviewContent(content);
//                     setShowPreview(true);
//                   }}
//                   className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
//                 >
//                   <Eye className="w-5 h-5" />
//                   Preview
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   disabled={saving}
//                   className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
//                 >
//                   {saving ? (
//                     <>Saving...</>
//                   ) : (
//                     <>
//                       <Save className="w-5 h-5" />
//                       {editingTemplate ? 'Update Template' : 'Create Template'}
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showPreview && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
//             <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-t-2xl z-10">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-2xl font-black text-white">Template Preview</h2>
//                 <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
//                   <X className="w-6 h-6 text-white" />
//                 </button>
//               </div>
//             </div>
//             <div className="p-6">
//               <div dangerouslySetInnerHTML={{ __html: previewContent }} />
//             </div>
//           </div>
//         </div>
//       )}

//       {showVersionHistory && selectedTemplateForHistory && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
//             <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 rounded-t-2xl z-10">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-black text-white">Version History</h2>
//                   <p className="text-sm text-orange-100">{selectedTemplateForHistory.name}</p>
//                 </div>
//                 <button onClick={() => setShowVersionHistory(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
//                   <X className="w-6 h-6 text-white" />
//                 </button>
//               </div>
//             </div>
//             <div className="p-6">
//               <div className="space-y-4">
//                 {versionHistory.map((version, idx) => (
//                   <div
//                     key={version.id}
//                     className={`p-4 rounded-lg border-2 ${
//                       idx === 0
//                         ? 'bg-green-50 border-green-300'
//                         : 'bg-gray-50 border-gray-300'
//                     }`}
//                   >
//                     <div className="flex items-start justify-between mb-3">
//                       <div>
//                         <div className="flex items-center gap-3">
//                           <span className={`px-3 py-1 rounded-full text-sm font-bold ${
//                             idx === 0
//                               ? 'bg-green-600 text-white'
//                               : 'bg-gray-600 text-white'
//                           }`}>
//                             Version {version.version}
//                           </span>
//                           {idx === 0 && (
//                             <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
//                               Current
//                             </span>
//                           )}
//                         </div>
//                         <p className="text-sm text-gray-600 mt-2">
//                           {new Date(version.created_at).toLocaleString('en-IN', {
//                             day: '2-digit',
//                             month: 'long',
//                             year: 'numeric',
//                             hour: '2-digit',
//                             minute: '2-digit'
//                           })}
//                         </p>
//                         <p className="text-sm text-gray-500 mt-1">By: {version.created_by}</p>
//                       </div>
//                       {idx !== 0 && (
//                         <button
//                           onClick={() => restoreVersion(version)}
//                           className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors text-sm"
//                         >
//                           Restore
//                         </button>
//                       )}
//                     </div>
//                     <div className="grid grid-cols-2 gap-3 text-sm">
//                       <div>
//                         <span className="font-bold text-gray-700">Name:</span> {version.name}
//                       </div>
//                       <div>
//                         <span className="font-bold text-gray-700">Category:</span> {version.category}
//                       </div>
//                       <div className="col-span-2">
//                         <span className="font-bold text-gray-700">Variables:</span>{' '}
//                         <span className="text-blue-600 font-mono text-xs">
//                           {version.variables.join(', ')}
//                         </span>
//                       </div>
//                       {version.change_notes && (
//                         <div className="col-span-2 mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
//                           <span className="font-bold text-gray-700">Notes:</span> {version.change_notes}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Plus, Eye, Pencil, Trash2, Save, X, Code, History, Copy,
  Tag, CheckCircle, XCircle, Filter, Download, RefreshCw,
  FileText, Upload, Image as ImageIcon, Loader2, Search,
  LayoutTemplate, Layers, User, ChevronDown, ChevronUp, Sparkles,
  Check, AlertCircle, Clock, Printer,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Swal from "sweetalert2";

// ── API lib ─────────────────────────────────────────────────────────────────
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  bulkDeleteTemplates,
  bulkUpdateTemplateStatus,
  restoreTemplateVersion,
  type DocumentTemplate,
  type VersionSnapshot,
} from "@/lib/documentTemplateApi";

// ─── Style tokens ───────────────────────────────────────────────────────────
const F = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L = "block text-[11px] font-semibold text-gray-500 mb-0.5";
const SI = "text-[11px] py-0.5";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Professional A4 Size Rental Agreement Template
const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: white;
      padding: 0;
      line-height: 1.5;
      color: #111827;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
    }
    
    .document-wrapper {
      max-width: 100%;
      background: white;
      box-shadow: none;
    }
    
    .document-content {
      padding: 2cm;
    }
    
    /* Header Styles */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 35px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .logo-container {
      max-width: 160px;
    }
    
    .logo-container img {
      max-height: 60px;
      width: auto;
      object-fit: contain;
    }
    
    .company-details {
      text-align: right;
    }
    
    .company-name {
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
    }
    
    .company-address {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.4;
    }
    
    /* Title Section */
    .title-section {
      text-align: center;
      margin-bottom: 35px;
    }
    
    .document-title {
      font-size: 26px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    
    .document-meta {
      display: flex;
      justify-content: center;
      gap: 30px;
      font-size: 13px;
      color: #4b5563;
      background: #f9fafb;
      padding: 10px 20px;
      border-radius: 40px;
      display: inline-flex;
      margin: 0 auto;
    }
    
    /* Section Styles */
    .section {
      margin-bottom: 30px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .section-header {
      background: #f8fafc;
      padding: 14px 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .section-header h2 {
      font-size: 15px;
      font-weight: 700;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .section-body {
      padding: 20px;
      background: white;
    }
    
    /* Grid Layouts */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
    }
    
    /* Field Styles */
    .field-group {
      margin-bottom: 16px;
    }
    
    .field-label {
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-bottom: 4px;
      display: block;
    }
    
    .field-value {
      font-size: 14px;
      color: #111827;
      font-weight: 500;
      padding: 8px 12px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      min-height: 38px;
    }
    
    /* Table Styles */
    .terms-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .terms-table td {
      padding: 12px;
      border: 1px solid #e5e7eb;
    }
    
    .terms-table td:first-child {
      background: #f9fafb;
      font-weight: 600;
      width: 40%;
    }
    
    /* Signature Section */
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
    }
    
    .signature-block {
      flex: 1;
      max-width: 250px;
    }
    
    .signature-line {
      width: 100%;
      height: 1px;
      background: #1f2937;
      margin: 8px 0 4px;
    }
    
    .signature-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    
    .signature-name {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin-top: 4px;
    }
    
    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px dashed #d1d5db;
      text-align: center;
      font-size: 10px;
      color: #9ca3af;
    }
    
    /* Highlight for important fields */
    .highlight {
      background: #fef3c7;
      border-color: #fbbf24;
    }
    
    /* Money values */
    .money-value {
      font-weight: 700;
      color: #059669;
    }
    
    /* Status badges */
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }
    
    .badge-success {
      background: #d1fae5;
      color: #065f46;
    }
    
    .badge-warning {
      background: #fed7aa;
      color: #92400e;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
        margin: 0;
      }
      .document-content {
        padding: 1.5cm;
      }
    }
  </style>
</head>
<body>
  <div class="document-wrapper">
    <div class="document-content">
      
      <!-- HEADER -->
      <div class="header">
        <div class="logo-container">
          {{logo_url}}
        </div>
        <div class="company-details">
          <div class="company-name">{{company_name}}</div>
          <div class="company-address">{{company_address}}</div>
        </div>
      </div>

      <!-- TITLE -->
      <div class="title-section">
        <h1 class="document-title">{{document_title}}</h1>
        <div class="document-meta">
          <span>{{document_type}} No: <strong>{{document_number}}</strong></span>
          <span>Date: <strong>{{date}}</strong></span>
        </div>
      </div>

      <!-- PARTIES SECTION -->
      <div class="section">
        <div class="section-header">
          <h2>🏢 PARTIES TO THE AGREEMENT</h2>
        </div>
        <div class="section-body">
          <p style="margin-bottom: 15px; font-size: 14px; color: #374151;">
            THIS AGREEMENT is made and entered into on this <strong>{{date}}</strong> by and between:
          </p>
          <div class="grid-2" style="margin-top: 20px;">
            <div class="field-group">
              <span class="field-label">LESSOR / PROVIDER</span>
              <div class="field-value">{{company_name}}<br>
              <span style="font-size: 12px; color: #6b7280;">Represented by: Authorized Signatory</span></div>
            </div>
            <div class="field-group">
              <span class="field-label">LESSEE / RECIPIENT</span>
              <div class="field-value">{{tenant_name}}<br>
              <span style="font-size: 12px; color: #6b7280;">S/o, D/o {{emergency_contact_name}}</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- PROPERTY DETAILS -->
      <div class="section">
        <div class="section-header">
          <h2>📍 PROPERTY DETAILS</h2>
        </div>
        <div class="section-body">
          <div class="grid-2">
            <div class="field-group">
              <span class="field-label">PROPERTY NAME</span>
              <div class="field-value">{{property_name}}</div>
            </div>
            <div class="field-group">
              <span class="field-label">ROOM / BED NUMBER</span>
              <div class="field-value">{{room_number}} / {{bed_number}}</div>
            </div>
            <div class="field-group">
              <span class="field-label">MOVE-IN DATE</span>
              <div class="field-value">{{move_in_date}}</div>
            </div>
            <div class="field-group">
              <span class="field-label">SECURITY DEPOSIT</span>
              <div class="field-value money-value">₹ {{security_deposit}}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TENANT INFORMATION -->
      <div class="section">
        <div class="section-header">
          <h2>👤 RECIPIENT INFORMATION</h2>
        </div>
        <div class="section-body">
          <div class="grid-3">
            <div class="field-group">
              <span class="field-label">FULL NAME</span>
              <div class="field-value">{{tenant_name}}</div>
            </div>
            <div class="field-group">
              <span class="field-label">PHONE NUMBER</span>
              <div class="field-value">{{tenant_phone}}</div>
            </div>
            <div class="field-group">
              <span class="field-label">EMAIL</span>
              <div class="field-value">{{tenant_email}}</div>
            </div>
            <div class="field-group">
              <span class="field-label">AADHAAR NUMBER</span>
              <div class="field-value">{{aadhaar_number}}</div>
            </div>
            <div class="field-group">
              <span class="field-label">PAN NUMBER</span>
              <div class="field-value">{{pan_number}}</div>
            </div>
            <div class="field-group">
              <span class="field-label">EMERGENCY CONTACT</span>
              <div class="field-value">{{emergency_contact_name}} ({{emergency_phone}})</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TERMS & CONDITIONS -->
      <div class="section">
        <div class="section-header">
          <h2>💰 TERMS & CONDITIONS</h2>
        </div>
        <div class="section-body">
          <table class="terms-table">
            <tr>
              <td>Monthly Rent / Fee</td>
              <td class="money-value">₹ {{rent_amount}}/-</td>
            </tr>
            <tr>
              <td>Security Deposit</td>
              <td class="money-value">₹ {{security_deposit}}/-</td>
            </tr>
            <tr>
              <td>Payment Mode</td>
              <td>{{payment_mode}}</td>
            </tr>
            <tr>
              <td>Due Date</td>
              <td>5th of Every Month</td>
            </tr>
          </table>
          
          <ol style="padding-left: 20px; font-size: 13px; color: #374151; line-height: 1.8; margin-top: 20px;">
            <li>The recipient shall pay the monthly amount on or before the 5th of every month.</li>
            <li>A late fee of ₹100 per day will be charged for delayed payments.</li>
            <li>The recipient shall not sublet/transfer the premises to any third party.</li>
            <li>The recipient shall maintain the premises in good condition.</li>
            <li>Notice period for vacating/termination is 30 days.</li>
            <li>The security deposit will be refunded within 15 days, subject to deductions for damages.</li>
          </ol>
        </div>
      </div>

      <!-- SIGNATURES -->
      <div class="signature-section">
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-label">RECIPIENT'S SIGNATURE</div>
          <div class="signature-name">{{tenant_name}}</div>
        </div>
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-label">PROVIDER'S SIGNATURE</div>
          <div class="signature-name">{{company_name}}</div>
        </div>
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-label">WITNESS</div>
          <div class="signature-name">_________________</div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <p>This is a computer-generated document and does not require a physical signature.</p>
        <p style="margin-top: 8px;">Document No: {{document_number}} | Generated on: {{date}}</p>
      </div>
      
    </div>
  </div>
</body>
</html>`;

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Agreements", "Rental Agreements", "KYC Documents",
  "Onboarding Documents", "Financial Documents", "Policy Documents",
  "Exit Documents", "Inspection Forms", "Declarations", "Other",
];

const COMMON_VARS = [
  { name: "date", label: "Current Date", example: "2024-03-14", category: "System" },
  { name: "document_number", label: "Document Number", example: "DOC-202403-0001", category: "System" },
  { name: "document_title", label: "Document Title", example: "RENTAL AGREEMENT", category: "System" },
  { name: "document_type", label: "Document Type", example: "Agreement", category: "System" },
  { name: "tenant_name", label: "Recipient Name", example: "Rahul Sharma", category: "Tenant" },
  { name: "tenant_phone", label: "Recipient Phone", example: "+91 98765 43210", category: "Tenant" },
  { name: "tenant_email", label: "Recipient Email", example: "rahul.sharma@email.com", category: "Tenant" },
  { name: "property_name", label: "Property Name", example: "Sunrise Executive PG", category: "Property" },
  { name: "room_number", label: "Room Number", example: "A-204", category: "Property" },
  { name: "bed_number", label: "Bed Number", example: "2", category: "Property" },
  { name: "move_in_date", label: "Move-in Date", example: "15 Mar 2024", category: "Property" },
  { name: "rent_amount", label: "Monthly Amount", example: "12,500", category: "Property" },
  { name: "security_deposit", label: "Security Deposit", example: "25,000", category: "Property" },
  { name: "company_name", label: "Company Name", example: "StayEasy Management Pvt Ltd", category: "Company" },
  { name: "company_address", label: "Company Address", example: "456, Brigade Road, Bangalore", category: "Company" },
  { name: "aadhaar_number", label: "Aadhaar Number", example: "XXXX-XXXX-1234", category: "Tenant" },
  { name: "pan_number", label: "PAN Number", example: "ABCDE1234F", category: "Tenant" },
  { name: "emergency_contact_name", label: "Emergency Contact", example: "Priya Sharma", category: "Tenant" },
  { name: "emergency_phone", label: "Emergency Phone", example: "+91 98765 43211", category: "Tenant" },
  { name: "payment_mode", label: "Payment Mode", example: "UPI / Bank Transfer", category: "Property" },
];

const VARIABLE_CATEGORIES = ["All", "System", "Tenant", "Property", "Company"];

// Document titles based on category
const getDocumentTitle = (category: string): string => {
  const titles: Record<string, string> = {
    "Agreements": "AGREEMENT",
    "Rental Agreements": "RENTAL AGREEMENT",
    "KYC Documents": "KYC DOCUMENT",
    "Onboarding Documents": "ONBOARDING FORM",
    "Financial Documents": "FINANCIAL DOCUMENT",
    "Policy Documents": "POLICY DOCUMENT",
    "Exit Documents": "EXIT FORM",
    "Inspection Forms": "INSPECTION FORM",
    "Declarations": "DECLARATION",
    "Other": "DOCUMENT",
  };
  return titles[category] || "DOCUMENT";
};

const getDocumentType = (category: string): string => {
  const types: Record<string, string> = {
    "Agreements": "Agreement",
    "Rental Agreements": "Agreement",
    "KYC Documents": "Form",
    "Onboarding Documents": "Form",
    "Financial Documents": "Statement",
    "Policy Documents": "Policy",
    "Exit Documents": "Form",
    "Inspection Forms": "Form",
    "Declarations": "Declaration",
    "Other": "Document",
  };
  return types[category] || "Document";
};

// ─── Sample Data for Preview ─────────────────────────────────────────────────
const SAMPLE_DATA = {
  date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
  document_number: `DOC-${Date.now().toString().slice(-6)}`,
  document_title: "RENTAL AGREEMENT",
  document_type: "Agreement",
  tenant_name: "Rahul Sharma",
  tenant_phone: "+91 98765 43210",
  tenant_email: "rahul.sharma@email.com",
  property_name: "Sunrise Executive PG",
  room_number: "A-204",
  bed_number: "2",
  move_in_date: "15 Mar 2024",
  rent_amount: "12,500",
  security_deposit: "25,000",
  company_name: "StayEasy Management Pvt Ltd",
  company_address: "456, Brigade Road, Bangalore - 560001",
  aadhaar_number: "XXXX-XXXX-1234",
  pan_number: "ABCDE1234F",
  emergency_contact_name: "Priya Sharma",
  emergency_phone: "+91 98765 43211",
  payment_mode: "UPI (Auto-debit)",
  logo_url: "",
};

const SH = ({
  icon, title, color = "text-blue-600",
}: { icon: React.ReactNode; title: string; color?: string }) => (
  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
    {icon}{title}
  </div>
);

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

const VariableCategory = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
      {title}
    </div>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
export function TemplateManager() {

  // ── Template state ─────────────────────────────────────────────────────────
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingTpl, setEditingTpl] = useState<DocumentTemplate | null>(null);
  const [historyTpl, setHistoryTpl] = useState<DocumentTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Sidebar / selection ────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // ── Logo ───────────────────────────────────────────────────────────────────
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const htmlEditorRef = useRef<HTMLTextAreaElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // ── Variable panel ─────────────────────────────────────────────────────────
  const [varSearch, setVarSearch] = useState("");
  const [varCategory, setVarCategory] = useState("All");

  // ── Filters ────────────────────────────────────────────────────────────────
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Column search ──────────────────────────────────────────────────────────
  const [col, setCol] = useState({
    name: "", category: "", description: "", version: "", status: "",
  });

  // ── Form ───────────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: "", category: "Rental Agreements", description: "", html_content: DEFAULT_HTML,
  });
  const [changeNotes, setChangeNotes] = useState("");

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: templates.length,
    active: templates.filter(t => t.is_active).length,
    inactive: templates.filter(t => !t.is_active).length,
    cats: new Set(templates.map(t => t.category)).size,
  }), [templates]);

  // Update HTML when category changes to set appropriate title
  useEffect(() => {
    if (showForm && !editingTpl) {
      const title = getDocumentTitle(form.category);
      const type = getDocumentType(form.category);
      
      // Update the HTML content with new title
      let updatedHtml = form.html_content;
      updatedHtml = updatedHtml.replace(
        /<h1 class="document-title">.*?<\/h1>/,
        `<h1 class="document-title">${title}</h1>`
      );
      updatedHtml = updatedHtml.replace(
        /<span>{{document_type}}/,
        `<span>{{document_type}}`
      );
      
      setForm(prev => ({ ...prev, html_content: updatedHtml }));
    }
  }, [form.category, showForm, editingTpl]);

  // ══════════════════════════════════════════════════════════════════════════
  // DATA LOADERS
  // ══════════════════════════════════════════════════════════════════════════

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listTemplates({
        category: catFilter !== "all" ? catFilter : undefined,
        is_active: statusFilter !== "all" ? statusFilter : undefined,
      });
      setTemplates(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, [catFilter, statusFilter]);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  // ══════════════════════════════════════════════════════════════════════════
  // DERIVED / FILTERED DATA
  // ══════════════════════════════════════════════════════════════════════════

  const filteredRows = useMemo(() =>
    templates.filter(t => {
      const nOk = !col.name || t.name.toLowerCase().includes(col.name.toLowerCase());
      const cOk = !col.category || t.category.toLowerCase().includes(col.category.toLowerCase());
      const dOk = !col.description || (t.description || "").toLowerCase().includes(col.description.toLowerCase());
      const vOk = !col.version || String(t.version).includes(col.version);
      const sOk = !col.status || (t.is_active ? "active" : "inactive").includes(col.status.toLowerCase());
      return nOk && cOk && dOk && vOk && sOk;
    }),
    [templates, col]);

  const filteredVars = COMMON_VARS.filter(v => {
    const matchesSearch = varSearch === "" ||
      v.label.toLowerCase().includes(varSearch.toLowerCase()) ||
      v.name.toLowerCase().includes(varSearch.toLowerCase());
    const matchesCategory = varCategory === "All" || v.category === varCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedVars = useMemo(() => {
    const groups: Record<string, typeof COMMON_VARS> = {};
    filteredVars.forEach(v => {
      if (!groups[v.category]) groups[v.category] = [];
      groups[v.category].push(v);
    });
    return groups;
  }, [filteredVars]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const allSelected = filteredRows.length > 0 && filteredRows.every(t => selectedIds.has(t.id));
  const someSelected = filteredRows.some(t => selectedIds.has(t.id));
  const selectedItems = filteredRows.filter(t => selectedIds.has(t.id));

  const toggleAll = () =>
    allSelected ? setSelectedIds(new Set()) : setSelectedIds(new Set(filteredRows.map(t => t.id)));

  const toggleOne = (id: string | number) => {
    const n = new Set(selectedIds);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelectedIds(n);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // LOGO HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // ══════════════════════════════════════════════════════════════════════════
  // VARIABLE HELPERS - Single click to toggle
  // ══════════════════════════════════════════════════════════════════════════

  
const toggleVariable = (name: string) => {
  const varTag = `{{${name}}}`;
  const textarea = htmlEditorRef.current;
  const currentContent = form.html_content;
  const varRegex = new RegExp(escapeRegExp(varTag), 'g');
  const isPresent = varRegex.test(currentContent);

  if (textarea) {
    if (isPresent) {
      // Remove variable
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Find the position of the variable tag near cursor
      const contentBeforeCursor = currentContent.substring(0, start);
      const contentAfterCursor = currentContent.substring(end);
      
      // Look for the variable tag in the vicinity of cursor
      const searchArea = contentBeforeCursor.slice(-200) + contentAfterCursor.slice(0, 200);
      const varIndexInSearch = searchArea.indexOf(varTag);
      
      let varIndex = -1;
      if (varIndexInSearch !== -1) {
        // Calculate actual position
        if (varIndexInSearch < 200) {
          // Found in before cursor area
          varIndex = Math.max(0, start - (200 - varIndexInSearch));
        } else {
          // Found in after cursor area
          varIndex = end + (varIndexInSearch - 200);
        }
      }
      
      if (varIndex !== -1 && varIndex >= 0 && varIndex < currentContent.length) {
        // Remove the variable at the found position
        const newHtml = 
          currentContent.substring(0, varIndex) + 
          currentContent.substring(varIndex + varTag.length);
        
        setForm(p => ({ ...p, html_content: newHtml }));
        toast.success(`Removed {{${name}}}`);
        
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(varIndex, varIndex);
        }, 10);
      } else {
        // Fallback: remove all instances
        const newHtml = currentContent.replace(varRegex, '');
        setForm(p => ({ ...p, html_content: newHtml }));
        toast.success(`Removed all {{${name}}} instances`);
      }
    } else {
      // Insert variable - find the appropriate location
      const cursorPos = textarea.selectionStart;
      const fullHtml = textarea.value;
      
      // Map variables to their correct locations
      const variableLocations: Record<string, { section: string, field: string, format?: string }> = {
        // System variables
        'date': { section: 'meta', field: 'Date' },
        'document_number': { section: 'meta', field: 'Document No' },
        'document_title': { section: 'title', field: 'document-title' },
        'document_type': { section: 'meta', field: 'document_type' },
        
        // Company variables
        'company_name': { section: 'company', field: 'PROVIDER' },
        'company_address': { section: 'company', field: 'PROVIDER' },
        'logo_url': { section: 'header', field: 'logo' },
        
        // Tenant variables
        'tenant_name': { section: 'tenant', field: 'FULL NAME' },
        'tenant_phone': { section: 'tenant', field: 'PHONE NUMBER' },
        'tenant_email': { section: 'tenant', field: 'EMAIL' },
        'aadhaar_number': { section: 'tenant', field: 'AADHAAR NUMBER' },
        'pan_number': { section: 'tenant', field: 'PAN NUMBER' },
        'emergency_contact_name': { section: 'tenant', field: 'EMERGENCY CONTACT' },
        'emergency_phone': { section: 'tenant', field: 'EMERGENCY CONTACT', format: '({value})' },
        
        // Property variables
        'property_name': { section: 'property', field: 'PROPERTY NAME' },
        'room_number': { section: 'property', field: 'ROOM / BED NUMBER' },
        'bed_number': { section: 'property', field: 'ROOM / BED NUMBER' },
        'move_in_date': { section: 'property', field: 'MOVE-IN DATE' },
        'security_deposit': { section: 'property', field: 'SECURITY DEPOSIT', format: '₹ {value}' },
        
        // Terms variables
        'rent_amount': { section: 'terms', field: 'Monthly Rent / Fee', format: '₹ {value}/-' },
        'payment_mode': { section: 'terms', field: 'Payment Mode' },
      };
      
      const location = variableLocations[name];
      let insertPosition = cursorPos;
      let foundLocation = false;
      
      if (location) {
        if (location.section === 'terms') {
          // Handle Terms & Conditions table
          const termsTable = fullHtml.match(/<table class="terms-table">[\s\S]*?<\/table>/);
          if (termsTable && termsTable[0]) {
            const tableStart = fullHtml.indexOf(termsTable[0]);
            const rows = termsTable[0].match(/<tr>[\s\S]*?<\/tr>/g) || [];
            
            for (let i = 0; i < rows.length; i++) {
              if (rows[i].includes(location.field)) {
                // Found the correct row
                const rowStart = tableStart + termsTable[0].indexOf(rows[i]);
                const tds = rows[i].match(/<td[^>]*>([\s\S]*?)<\/td>/g);
                
                if (tds && tds.length >= 2) {
                  // Insert in the second td (value column)
                  const secondTd = tds[1];
                  const tdPos = rowStart + rows[i].indexOf(secondTd);
                  const tdContentStart = tdPos + secondTd.indexOf('>') + 1;
                  
                  insertPosition = tdContentStart;
                  foundLocation = true;
                }
                break;
              }
            }
          }
        } else if (location.section === 'meta') {
          // Handle document meta section
          if (location.field === 'Date') {
            const dateSpan = fullHtml.match(/<span>Date: <strong>[^<]*<\/strong><\/span>/);
            if (dateSpan && dateSpan[0]) {
              const spanPos = fullHtml.indexOf(dateSpan[0]);
              const strongStart = spanPos + dateSpan[0].indexOf('<strong>') + '<strong>'.length;
              insertPosition = strongStart;
              foundLocation = true;
            }
          } else if (location.field === 'Document No') {
            const docNoSpan = fullHtml.match(/<span>{{document_type}} No: <strong>[^<]*<\/strong><\/span>/);
            if (docNoSpan && docNoSpan[0]) {
              const spanPos = fullHtml.indexOf(docNoSpan[0]);
              const strongStart = spanPos + docNoSpan[0].indexOf('<strong>') + '<strong>'.length;
              insertPosition = strongStart;
              foundLocation = true;
            }
          }
        } else if (location.section === 'title') {
          // Handle document title
          const titleMatch = fullHtml.match(/<h1 class="document-title">[^<]*<\/h1>/);
          if (titleMatch && titleMatch[0]) {
            const titlePos = fullHtml.indexOf(titleMatch[0]);
            const titleContentStart = titlePos + '<h1 class="document-title">'.length;
            insertPosition = titleContentStart;
            foundLocation = true;
          }
        } else if (location.section === 'header') {
          // Handle logo in header
          const logoContainer = fullHtml.match(/<div class="logo-container">[\s\S]*?<\/div>/);
          if (logoContainer && logoContainer[0]) {
            const containerPos = fullHtml.indexOf(logoContainer[0]);
            const containerContentStart = containerPos + '<div class="logo-container">'.length;
            insertPosition = containerContentStart;
            foundLocation = true;
          }
        } else {
          // Handle regular field-value divs
          const fieldDivRegex = new RegExp(`<div class="field-value">[\\s\\S]*?<\\/div>`, 'g');
          const fieldLabels = fullHtml.match(/<span class="field-label">(.*?)<\/span>/g) || [];
          
          for (let i = 0; i < fieldLabels.length; i++) {
            if (fieldLabels[i].includes(location.field)) {
              const labelPos = fullHtml.indexOf(fieldLabels[i]);
              const afterLabel = fullHtml.substring(labelPos + fieldLabels[i].length);
              const divMatch = afterLabel.match(fieldDivRegex);
              
              if (divMatch && divMatch[0]) {
                const divPos = labelPos + fieldLabels[i].length + afterLabel.indexOf(divMatch[0]);
                const divContentStart = divPos + '<div class="field-value">'.length;
                
                insertPosition = divContentStart;
                foundLocation = true;
                break;
              }
            }
          }
        }
      }
      
      // Special handling for specific variables
      if (name === 'emergency_phone' && !foundLocation) {
        const emergencyDiv = fullHtml.match(/<div class="field-value">[\s\S]*?{{emergency_contact_name}}[\s\S]*?<\/div>/);
        if (emergencyDiv && emergencyDiv[0]) {
          const divPos = fullHtml.indexOf(emergencyDiv[0]);
          const namePos = emergencyDiv[0].indexOf('{{emergency_contact_name}}');
          if (namePos !== -1) {
            insertPosition = divPos + namePos + '{{emergency_contact_name}}'.length + 1; // +1 for space
            foundLocation = true;
          }
        }
      }
      
      if (name === 'bed_number' && !foundLocation) {
        // Try to find room_number position first
        const roomField = fullHtml.match(/<div class="field-value">{{room_number}} \/ [^<]*<\/div>/);
        if (roomField && roomField[0]) {
          const fieldPos = fullHtml.indexOf(roomField[0]);
          const slashPos = roomField[0].indexOf('/') + 1;
          insertPosition = fieldPos + slashPos;
          foundLocation = true;
        }
      }
      
      if (name === 'security_deposit' && location?.section === 'property' && !foundLocation) {
        // Ensure security deposit is in property section
        const propertyLabels = fullHtml.match(/<span class="field-label">SECURITY DEPOSIT<\/span>/g);
        if (propertyLabels && propertyLabels[0]) {
          const labelPos = fullHtml.indexOf(propertyLabels[0]);
          const afterLabel = fullHtml.substring(labelPos + propertyLabels[0].length);
          const divMatch = afterLabel.match(/<div class="field-value[^>]*>/);
          
          if (divMatch && divMatch[0]) {
            const divPos = labelPos + propertyLabels[0].length + afterLabel.indexOf(divMatch[0]);
            const divContentStart = divPos + divMatch[0].length;
            insertPosition = divContentStart;
            foundLocation = true;
          }
        }
      }
      
      // Format the tag if needed
      let finalTag = varTag;
      if (location?.format) {
        finalTag = location.format.replace('{value}', varTag);
      }
      
      // If no specific location found, use cursor position
      if (!foundLocation) {
        insertPosition = cursorPos;
      }
      
      // Insert the variable
      const newHtml = 
        fullHtml.substring(0, insertPosition) + 
        finalTag + 
        fullHtml.substring(insertPosition);
      
      setForm(p => ({ ...p, html_content: newHtml }));
      
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = insertPosition + finalTag.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 10);
      
      toast.success(`Inserted ${finalTag}`);
    }
  } else {
    // Fallback when textarea ref not available
    if (isPresent) {
      // Remove all instances
      const newHtml = currentContent.replace(varRegex, '');
      setForm(p => ({ ...p, html_content: newHtml }));
      toast.success(`Removed all {{${name}}} instances`);
    } else {
      // Append to end (not ideal but fallback)
      setForm(p => ({ ...p, html_content: p.html_content + varTag }));
      toast.success(`Inserted {{${name}}}`);
    }
  }
};

// Helper function to escape regex special characters
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Update the extractVars function to be more reliable
const extractVars = (html?: string) => {
  if (!html) return [];
  try {
    const matches = html.match(/{{(\w+)}}/g);
    if (!matches) return [];
    // Remove duplicates by using Set
    const vars = [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
    return vars;
  } catch { 
    return []; 
  }
};

  // ══════════════════════════════════════════════════════════════════════════
  // OPEN FORM HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  const resetForm = () => {
    setChangeNotes("");
    setLogoFile(null);
    setLogoPreview("");
  };

 const openAdd = () => {
  setEditingTpl(null);
  resetForm();
  
  // Use DEFAULT_HTML which has all the {{variable}} placeholders
  const title = getDocumentTitle("Rental Agreements");
  
  // DEFAULT_HTML already has all the variables, just update the title
  let defaultHtml = DEFAULT_HTML;
  defaultHtml = defaultHtml.replace(
    /<h1 class="document-title">.*?<\/h1>/,
    `<h1 class="document-title">${title}</h1>`
  );
  
  setForm({ 
    name: "", 
    category: "Rental Agreements", 
    description: "", 
    html_content: defaultHtml  // This has {{tenant_name}}, {{date}}, etc.
  });
  setShowForm(true);
  
  setTimeout(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, 100);
};

  const openEdit = async (t: DocumentTemplate) => {
    resetForm();
    
    if (t.logo_url) {
      const fullUrl = t.logo_url.startsWith("http") 
        ? t.logo_url 
        : `${API_BASE}${t.logo_url}`;
      setLogoPreview(fullUrl);
    }
    
    if (t.html_content) {
      setEditingTpl(t);
      setForm({
        name: t.name,
        category: t.category,
        description: t.description || "",
        html_content: t.html_content
      });
      setShowForm(true);
    } else {
      try {
        const { getTemplate } = await import("@/lib/documentTemplateApi");
        const res = await getTemplate(t.id);
        const full = res.data || t;
        setEditingTpl(full);
        setLogoPreview(full.logo_url ? `${API_BASE}${full.logo_url}` : "");
        setForm({
          name: full.name,
          category: full.category,
          description: full.description || "",
          html_content: full.html_content || ""
        });
        setShowForm(true);
      } catch {
        setEditingTpl(t);
        setForm({
          name: t.name,
          category: t.category,
          description: t.description || "",
          html_content: t.html_content || ""
        });
        setShowForm(true);
      }
    }
  };

  const openDuplicate = async (t: DocumentTemplate) => {
    resetForm();
    setChangeNotes(`Duplicated from ${t.name}`);
    
    if (t.logo_url) {
      setLogoPreview(`${API_BASE}${t.logo_url}`);
    }
    
    let html = t.html_content;
    if (!html) {
      try {
        const { getTemplate } = await import("@/lib/documentTemplateApi");
        const res = await getTemplate(t.id);
        html = res.data?.html_content || "";
      } catch { html = ""; }
    }
    
    setEditingTpl(null);
    setForm({
      name: `${t.name} (Copy)`,
      category: t.category,
      description: t.description || "",
      html_content: html
    });
    setShowForm(true);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PREVIEW
  // ══════════════════════════════════════════════════════════════════════════

  const buildPreview = (html: string, logoSrc?: string): string => {
    if (!html) return "";
    
    // Clean HTML
    const doctypeIndex = html.indexOf("<!DOCTYPE");
    const htmlTagIndex = html.indexOf("<html");
    const startIndex = doctypeIndex !== -1 ? doctypeIndex : (htmlTagIndex !== -1 ? htmlTagIndex : 0);
    let c = startIndex > 0 ? html.substring(startIndex) : html;

    // Replace logo_url with actual logo
    if (logoSrc) {
      c = c.replace(
        /\{\{logo_url\}\}/g,
        `<img src="${logoSrc}" style="max-height:60px;max-width:160px;object-fit:contain;" />`
      );
    } else {
      c = c.replace(
        /\{\{logo_url\}\}/g,
        `<div style="font-size:12px;color:#666;padding:4px;border:1px dashed #ccc;border-radius:4px;">Company Logo</div>`
      );
    }

    // Replace all variables with sample data for preview
    Object.entries(SAMPLE_DATA).forEach(([k, v]) => {
      c = c.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v || "");
    });

    // Remove any remaining variables
    c = c.replace(/\{\{[\w_]+\}\}/g, "");

    return c;
  };

  const openPreviewForRow = async (t: DocumentTemplate) => {
    let html = t.html_content;
    if (!html) {
      try {
        const { getTemplate } = await import("@/lib/documentTemplateApi");
        const res = await getTemplate(t.id);
        html = res.data?.html_content || "";
      } catch { html = ""; }
    }
    
    const logo = t.logo_url 
      ? (t.logo_url.startsWith("http") ? t.logo_url : `${API_BASE}${t.logo_url}`)
      : "";
      
    setPreviewHtml(buildPreview(html, logo));
    setShowPreview(true);
  };

  const openPreview = (t: DocumentTemplate | null, overrideHtml?: string) => {
    const html = overrideHtml || t?.html_content || form.html_content;
    const logo = logoPreview || (t?.logo_url ? `${API_BASE}${t.logo_url}` : "");
    
    setPreviewHtml(buildPreview(html, logo));
    setShowPreview(true);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Preview</title>
            <style>
              @media print {
                body { margin: 0; padding: 0; }
              }
            </style>
          </head>
          <body>${previewHtml}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SAVE
  // ══════════════════════════════════════════════════════════════════════════

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Template name is required");
      if (nameInputRef.current) nameInputRef.current.focus();
      return;
    }
    if (!form.html_content.trim()) {
      toast.error("HTML content is required");
      if (htmlEditorRef.current) htmlEditorRef.current.focus();
      return;
    }

    setSaving(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category);
      formData.append('description', form.description || '');
      formData.append('html_content', form.html_content);
      formData.append('change_notes', changeNotes || '');
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      if (!logoPreview && editingTpl?.logo_url) {
        formData.append('remove_logo', 'true');
      }

      const payload = {
        name: form.name,
        category: form.category,
        description: form.description,
        html_content: form.html_content,
        change_notes: changeNotes,
        logo: logoFile || undefined,
        remove_logo: !logoPreview && !!editingTpl?.logo_url ? true : undefined,
      };

      if (editingTpl) {
        await updateTemplate(editingTpl.id, payload);
        toast.success(`Template updated to v${editingTpl.version + 1}`);
      } else {
        await createTemplate(payload);
        toast.success("Template created successfully");
      }

      setShowForm(false);
      setSelectedIds(new Set());
      await loadTemplates();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // DELETE / BULK ACTIONS
  // ══════════════════════════════════════════════════════════════════════════

  const handleDelete = async (id: string | number, name: string) => {
    const r = await Swal.fire({
      title: "Delete Template?",
      text: `"${name}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
      customClass: { popup: "rounded-xl shadow-2xl text-sm" },
    });
    if (!r.isConfirmed) return;
    
    try {
      await deleteTemplate(id);
      toast.success("Template deleted successfully");
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      await loadTemplates();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedItems.length) return;
    
    const r = await Swal.fire({
      title: `Delete ${selectedItems.length} template(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete all",
      customClass: { popup: "rounded-xl text-sm" },
    });
    if (!r.isConfirmed) return;
    
    try {
      await bulkDeleteTemplates(selectedItems.map(t => t.id));
      toast.success(`Deleted ${selectedItems.length} template(s)`);
      setSelectedIds(new Set());
      await loadTemplates();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleBulkStatus = async (active: boolean) => {
    if (!selectedItems.length) return;
    try {
      await bulkUpdateTemplateStatus(selectedItems.map(t => t.id), active);
      toast.success(`${active ? "Activated" : "Deactivated"} ${selectedItems.length} template(s)`);
      setSelectedIds(new Set());
      await loadTemplates();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RESTORE VERSION
  // ══════════════════════════════════════════════════════════════════════════

  const handleRestoreVersion = async (tplId: string | number, version: number) => {
    const r = await Swal.fire({
      title: `Restore v${version}?`,
      text: "A new version will be created.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Restore",
      customClass: { popup: "rounded-xl text-sm" },
    });
    if (!r.isConfirmed) return;
    
    try {
      await restoreTemplateVersion(tplId, version);
      toast.success(`Restored to v${version}`);
      setShowHistory(false);
      await loadTemplates();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = filteredRows.map(t => [
      t.name, t.category, t.description || "", t.version,
      t.is_active ? "Active" : "Inactive",
      (t.variables || []).join(";"),
    ]);
    const csv = [["Name", "Category", "Description", "Version", "Status", "Variables"], ...rows]
      .map(r => r.join(",")).join("\n");
    
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `templates_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const hasFilters = catFilter !== "all" || statusFilter !== "all";
  const filterCount = [catFilter !== "all", statusFilter !== "all"].filter(Boolean).length;
  const clearFilters = () => { setCatFilter("all"); setStatusFilter("all"); };
  const hasCol = Object.values(col).some(v => v !== "");
  const clearCol = () => setCol({ name: "", category: "", description: "", version: "", status: "" });

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-gray-50">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-10">
        <div className="pb-2 flex items-end justify-end gap-2 flex-wrap">

          {/* Bulk action bar */}
          {someSelected && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                {selectedItems.length} selected
              </span>
              <button onClick={() => handleBulkStatus(true)}
                className="inline-flex items-center gap-1 h-8 px-2 rounded-lg border border-green-200 bg-green-50 text-green-700 text-[11px] font-medium hover:bg-green-100 transition-colors">
                <CheckCircle className="h-3 w-3" /> Activate
              </button>
              <button onClick={() => handleBulkStatus(false)}
                className="inline-flex items-center gap-1 h-8 px-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-[11px] font-medium hover:bg-gray-100 transition-colors">
                <XCircle className="h-3 w-3" /> Deactivate
              </button>
              <button onClick={handleBulkDelete}
                className="inline-flex items-center gap-1 h-8 px-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors">
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          )}

          {/* Filter toggle */}
          <button onClick={() => setSidebarOpen(o => !o)}
            className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors
              ${sidebarOpen || hasFilters ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {filterCount > 0 && (
              <span className={`h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center
                ${sidebarOpen || hasFilters ? "bg-white text-blue-600" : "bg-blue-600 text-white"}`}>
                {filterCount}
              </span>
            )}
          </button>

          {/* Export */}
          <button onClick={handleExport}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium transition-colors">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Refresh */}
          <button onClick={loadTemplates} disabled={loading}
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Create */}
          <button onClick={openAdd}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm transition-colors">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Create Template</span>
          </button>
        </div>

        {/* Stat cards */}
        <div className="pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <StatCard title="Total"      value={stats.total}    icon={LayoutTemplate} color="bg-blue-600"   bg="bg-gradient-to-br from-blue-50 to-blue-100" />
            <StatCard title="Active"     value={stats.active}   icon={CheckCircle}    color="bg-green-600"  bg="bg-gradient-to-br from-green-50 to-green-100" />
            <StatCard title="Inactive"   value={stats.inactive} icon={XCircle}        color="bg-gray-500"   bg="bg-gradient-to-br from-gray-50 to-gray-100" />
            <StatCard title="Categories" value={stats.cats}     icon={Layers}         color="bg-indigo-600" bg="bg-gradient-to-br from-indigo-50 to-indigo-100" />
          </div>
        </div>
      </div>

      {/* ── TABLE ──────────────────────────────────────────────────────── */}
      <div className="relative">
        <Card className="border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
            <span className="text-sm font-semibold text-gray-700">
              Document Templates ({filteredRows.length})
            </span>
            {hasCol && (
              <button onClick={clearCol} className="text-[10px] text-blue-600 font-semibold">Clear Search</button>
            )}
          </div>

          <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 270px)" }}>
            <div className="min-w-[950px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-gray-50">
                  <TableRow>
                    <TableHead className="py-2 px-3 w-10">
                      <Checkbox checked={allSelected} onCheckedChange={toggleAll} className="h-3.5 w-3.5" />
                    </TableHead>
                    <TableHead className="py-2 px-3 text-xs">Template Name</TableHead>
                    <TableHead className="py-2 px-3 text-xs">Category</TableHead>
                    <TableHead className="py-2 px-3 text-xs">Description</TableHead>
                    <TableHead className="py-2 px-3 text-xs">Variables</TableHead>
                    <TableHead className="py-2 px-3 text-xs">Version</TableHead>
                    <TableHead className="py-2 px-3 text-xs">Status</TableHead>
                    <TableHead className="py-2 px-3 text-xs">Updated</TableHead>
                    <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
                  </TableRow>

                  {/* Column search row */}
                  <TableRow className="bg-gray-50/80">
                    <TableCell className="py-1 px-3" />
                    {[
                      { k: "name",        ph: "Search name…" },
                      { k: "category",    ph: "Category…" },
                      { k: "description", ph: "Desc…" },
                      { k: null,          ph: "" },
                      { k: "version",     ph: "Ver…" },
                      { k: "status",      ph: "active/inactive" },
                      { k: null,          ph: "" },
                      { k: null,          ph: "" },
                    ].map((c, i) => (
                      <TableCell key={i} className="py-1 px-2">
                        {c.k
                          ? <Input placeholder={c.ph}
                              value={col[c.k as keyof typeof col]}
                              onChange={e => setCol(p => ({ ...p, [c.k!]: e.target.value }))}
                              className="h-6 text-[10px]" />
                          : <div />}
                      </TableCell>
                    ))}
                    <TableCell />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Loading…</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <LayoutTemplate className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-500">No templates found</p>
                        <p className="text-xs text-gray-400 mt-1">Create one to get started</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredRows.map(t => (
                    <TableRow key={t.id} className={`hover:bg-gray-50 ${selectedIds.has(t.id) ? "bg-blue-50/40" : ""}`}>
                      <TableCell className="py-2 px-3">
                        <Checkbox checked={selectedIds.has(t.id)} onCheckedChange={() => toggleOne(t.id)} className="h-3.5 w-3.5" />
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {t.logo_url && (
                            <img 
                              src={t.logo_url.startsWith("http") ? t.logo_url : `${API_BASE}${t.logo_url}`}
                              alt="" 
                              className="h-5 w-5 rounded object-contain border border-gray-200"
                              onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                          )}
                          <span className="text-xs font-semibold text-gray-800">{t.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-2 py-0">
                          {t.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 px-3 text-xs text-gray-500 max-w-[160px] truncate">
                        {t.description || "—"}
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center gap-1">
                          <Code className="h-3 w-3 text-blue-500" />
                          <span className="text-[11px] font-bold text-blue-600">{t.variables?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold">
                          v{t.version}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <Badge className={`text-[10px] px-2 py-0 ${t.is_active
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                          {t.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 px-3 text-[10px] text-gray-500">
                        {new Date(t.updated_at).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <div className="flex justify-end gap-0.5">
                          {[
                            { icon: <Eye className="h-3 w-3" />,     fn: () => openPreviewForRow(t),                            cls: "hover:bg-blue-50 hover:text-blue-600",     title: "Preview" },
                            { icon: <Pencil className="h-3 w-3" />,  fn: () => openEdit(t),                                     cls: "hover:bg-green-50 hover:text-green-600",   title: "Edit" },
                            { icon: <Copy className="h-3 w-3" />,    fn: () => openDuplicate(t),                                cls: "hover:bg-purple-50 hover:text-purple-600", title: "Duplicate" },
                            { icon: <History className="h-3 w-3" />, fn: () => { setHistoryTpl(t); setShowHistory(true); },     cls: "hover:bg-orange-50 hover:text-orange-600", title: "History" },
                            { icon: <Trash2 className="h-3 w-3" />,  fn: () => handleDelete(t.id, t.name),                     cls: "hover:bg-red-50 hover:text-red-600",       title: "Delete" },
                          ].map((btn, i) => (
                            <button key={i} onClick={btn.fn} title={btn.title}
                              className={`p-1.5 rounded-md text-gray-400 transition-colors ${btn.cls}`}>
                              {btn.icon}
                            </button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>

        {/* ── FILTER SIDEBAR ─────────────────────────────────────────── */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]"
            onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`fixed top-0 right-0 h-full z-40 w-72 sm:w-80 bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>

          <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">Filters</span>
              {hasFilters && (
                <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">
                  {filterCount} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasFilters && (
                <button onClick={clearFilters} className="text-[10px] text-blue-200 hover:text-white font-semibold">
                  Clear all
                </button>
              )}
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Category */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <LayoutTemplate className="h-3 w-3 text-blue-500" /> Category
              </p>
              <div className="space-y-1">
                {["all", ...CATEGORIES].map(c => (
                  <label key={c}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                      ${catFilter === c ? "bg-blue-50 border border-blue-200 text-blue-700" : "hover:bg-gray-50 border border-transparent text-gray-700"}`}>
                    <input type="radio" name="cat" checked={catFilter === c} onChange={() => setCatFilter(c)} className="sr-only" />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${catFilter === c ? "bg-blue-500" : "bg-gray-300"}`} />
                    <span className="text-[12px] font-medium">{c === "all" ? "All Categories" : c}</span>
                    {catFilter === c && (
                      <svg className="ml-auto h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Status */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-green-500" /> Status
              </p>
              <div className="space-y-1">
                {[
                  { val: "all",   label: "All",      dot: "bg-gray-400" },
                  { val: "true",  label: "Active",   dot: "bg-green-500" },
                  { val: "false", label: "Inactive", dot: "bg-gray-400" },
                ].map(o => (
                  <label key={o.val}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                      ${statusFilter === o.val ? "bg-blue-50 border border-blue-200 text-blue-700" : "hover:bg-gray-50 border border-transparent text-gray-700"}`}>
                    <input type="radio" name="status" checked={statusFilter === o.val} onChange={() => setStatusFilter(o.val)} className="sr-only" />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${o.dot}`} />
                    <span className="text-[12px] font-medium">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
            <button onClick={clearFilters} disabled={!hasFilters}
              className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
              Clear All
            </button>
            <button onClick={() => setSidebarOpen(false)}
              className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold">
              Apply & Close
            </button>
          </div>
        </aside>
      </div>

      {/* ══ CREATE / EDIT MODAL ═════════════════════════════════════════════ */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onMouseDown={e => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div
            style={{
              width: "min(1200px, 95vw)",
              height: "min(90vh, 850px)",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#fff",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
            }}
          >

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  {editingTpl ? (
                    <>
                      <Pencil className="h-4 w-4" />
                      Edit Template: {editingTpl.name}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create New Template
                    </>
                  )}
                </h2>
                <p className="text-xs text-blue-100 mt-1">
                  {editingTpl 
                    ? `Current version: v${editingTpl.version} → New version: v${editingTpl.version + 1}`
                    : "Design your professional A4 document template"
                  }
                </p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body: Split Layout */}
            <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

              {/* LEFT: Main Form */}
              <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "20px" }} className="space-y-5">

                {/* Template Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <SH icon={<FileText className="h-3 w-3" />} title="Template Information" color="text-blue-700" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={L}>
                        <span className="text-red-400">*</span> Template Name
                      </label>
                      <Input 
                        ref={nameInputRef}
                        className={F} 
                        placeholder="e.g., Rental Agreement"
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                      />
                    </div>
                    <div>
                      <label className={L}>Category</label>
                      <Select 
                        value={form.category} 
                        onValueChange={v => setForm(p => ({ ...p, category: v }))}
                      >
                        <SelectTrigger className={F}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => (
                            <SelectItem key={c} value={c} className={SI}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <label className={L}>Description</label>
                      <Input 
                        className={F} 
                        placeholder="Brief description of this template"
                        value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))} 
                      />
                    </div>
                    {editingTpl && (
                      <div className="col-span-2">
                        <label className={L}>
                          Change Notes
                          <span className="text-gray-400 font-normal ml-2">(optional)</span>
                        </label>
                        <Input 
                          className={F} 
                          placeholder="What changed in this version?"
                          value={changeNotes}
                          onChange={e => setChangeNotes(e.target.value)} 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <SH icon={<ImageIcon className="h-3 w-3" />} title="Company Logo" color="text-purple-700" />
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {logoPreview ? (
                        <>
                          <img
                            src={logoPreview}
                            alt="Logo Preview"
                            className="h-16 w-24 object-contain border-2 border-purple-200 rounded-lg bg-white p-1 shadow-sm"
                          />
                          <button
                            onClick={removeLogo}
                            className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <div className="h-16 w-24 border-2 border-dashed border-purple-200 rounded-lg flex items-center justify-center bg-purple-50/50">
                          <ImageIcon className="h-6 w-6 text-purple-300" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-purple-200 text-xs font-medium text-purple-600 hover:bg-purple-50 cursor-pointer shadow-sm">
                        <Upload className="h-3.5 w-3.5" />
                        Upload Logo
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={onLogoChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, SVG up to 2 MB</p>
                    </div>
                  </div>
                </div>

                {/* HTML Editor */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <SH icon={<Code className="h-3 w-3" />} title="HTML Content (A4 Size)" color="text-green-700" />
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-2 py-0.5">
                      {extractVars(form.html_content).length} variables
                    </Badge>
                  </div>
                  <textarea
                    ref={htmlEditorRef}
                    name="html_content"
                    value={form.html_content}
                    onChange={e => setForm(p => ({ ...p, html_content: e.target.value }))}
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:border-green-400 focus:ring-1 focus:ring-green-200 bg-white font-mono text-[11px] resize-none transition-all"
                    rows={12}
                    placeholder="Enter HTML with {{variables}}... Click variables from right panel to insert them"
                  />
                </div>

                {/* Detected Variables */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                  <div className="flex items-center justify-between mb-2">
                    <SH icon={<Tag className="h-3 w-3" />} title="Variables in Template" color="text-amber-700" />
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                      {extractVars(form.html_content).length} found
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {extractVars(form.html_content).map(v => {
                      const cv = COMMON_VARS.find(c => c.name === v);
                      return (
                        <span
                          key={v}
                          title={cv ? `${cv.label} → ${cv.example}` : v}
                          className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-mono font-semibold border border-amber-200"
                        >
                          {v}
                        </span>
                      );
                    })}
                    {extractVars(form.html_content).length === 0 && (
                      <p className="text-xs text-amber-600">
                        No variables yet. Click variables from right panel to insert them.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Variables Panel */}
              <div style={{ width: "260px", minWidth: "260px", flexShrink: 0, display: "flex", flexDirection: "column", background: "linear-gradient(180deg,#f8f7ff 0%,#f3f0ff 100%)", borderLeft: "1px solid #e9e6ff" }}>

                {/* Panel Header */}
                <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid #e9e6ff", background: "#fff", flexShrink: 0 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-indigo-600 rounded-md">
                      <Sparkles size={14} className="text-white" />
                    </div>
                    <span className="text-xs font-bold text-gray-700">Available Variables</span>
                    <span className="ml-auto text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {filteredVars.length}
                    </span>
                  </div>
                  
                  {/* Search */}
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      placeholder="Search variables..."
                      className="w-full h-7 pl-7 pr-3 bg-white border border-indigo-200 rounded-md text-[10px] focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 outline-none"
                      value={varSearch}
                      onChange={e => setVarSearch(e.target.value)}
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex gap-1 overflow-x-auto pb-1">
                    {VARIABLE_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setVarCategory(cat)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap transition-all ${
                          varCategory === cat
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-600 border border-indigo-200 hover:bg-indigo-50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Variables List - Single click to toggle */}
                <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                  {Object.entries(groupedVars).map(([category, vars]) => (
                    <VariableCategory key={category} title={category}>
                      {vars.map(v => {
                        const isUsed = extractVars(form.html_content).includes(v.name);
                        return (
                          <button
                            key={v.name}
                            onClick={() => toggleVariable(v.name)}
                            className={`w-full text-left p-2 rounded-lg mb-1 transition-all group
                              ${isUsed
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 shadow-sm"
                                : "bg-white hover:bg-indigo-50 border border-transparent hover:border-indigo-200"
                              }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] font-semibold text-gray-700">
                                {v.label}
                              </span>
                              {isUsed && (
                                <Check size={10} className="text-green-600" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <code className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                                {'{{'}{v.name}{'}}'}
                              </code>
                              <span className="text-[8px] text-gray-400">
                                {v.example}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </VariableCategory>
                  ))}
                </div>

                {/* Footer Hint */}
                <div className="p-2 border-t border-indigo-100 bg-white/50 text-center">
                  <p className="text-[8px] text-gray-500">
                    Click variable to add/remove from template
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-5 py-3 bg-gray-50 flex items-center justify-between">
              <div className="text-[10px] text-gray-500">
                {editingTpl && (
                  <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                    Version {editingTpl.version} → {editingTpl.version + 1}
                  </span>
                )}
                <span className="ml-2 text-[9px] text-gray-400">A4 Size Ready</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="h-8 px-4 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => openPreview(editingTpl, form.html_content)}
                  className="h-8 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[11px] font-semibold flex items-center gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-8 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? (
                    <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>
                  ) : (
                    <><Save className="h-3.5 w-3.5" />{editingTpl ? "Update" : "Create"}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ PREVIEW MODAL with Print Option ═══════════════════════════════ */}
      {showPreview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onMouseDown={e => { if (e.target === e.currentTarget) setShowPreview(false); }}
        >
          <div style={{
            width: "min(900px, 95vw)",
            height: "min(90vh, 860px)",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 25px 60px -12px rgba(0,0,0,0.5)",
          }}>
            {/* Header */}
            <div style={{ background: "linear-gradient(to right, #7c3aed, #db2777)", color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="text-base font-semibold">Template Preview (A4 Size)</span>
                <Badge className="bg-white/20 text-white border-0 ml-2 text-[10px]">
                  Sample Data
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  title="Print"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    const w = window.open("", "_blank");
                    if (w) {
                      w.document.write(`
                        <html>
                          <head>
                            <title>Print Preview</title>
                            <style>
                              @media print {
                                body { margin: 0; padding: 0; }
                              }
                            </style>
                          </head>
                          <body>${previewHtml}</body>
                        </html>
                      `);
                      w.document.close();
                    }
                  }}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  title="Open in New Tab"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#f1f5f9", padding: "20px" }}>
              {previewHtml ? (
                <div style={{ backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", overflow: "hidden", maxWidth: "210mm", margin: "0 auto" }}>
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "#94a3b8", flexDirection: "column", gap: "8px" }}>
                  <Eye className="h-10 w-10" />
                  <p className="text-sm">No content to preview</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ flexShrink: 0, padding: "10px 16px", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                onClick={handlePrint}
                className="h-8 px-4 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="h-8 px-4 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ VERSION HISTORY MODAL ════════════════════════════════════════════ */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onMouseDown={e => { if (e.target === e.currentTarget) setShowHistory(false); }}
        >
          <div style={{ width: "min(800px,95vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)" }}>
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <History className="h-4 w-4" /> Version History
                </h2>
                {historyTpl && <p className="text-xs text-orange-100">{historyTpl.name}</p>}
              </div>
              <button onClick={() => setShowHistory(false)} className="p-1.5 rounded-full hover:bg-white/20">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div style={{ overflowY: "auto", flex: 1, padding: "16px" }} className="space-y-3">
              {historyTpl && (() => {
                const current: VersionSnapshot = {
                  version:      historyTpl.version,
                  name:         historyTpl.name,
                  category:     historyTpl.category,
                  description:  historyTpl.description,
                  html_content: historyTpl.html_content,
                  variables:    historyTpl.variables,
                  logo_url:     historyTpl.logo_url,
                  change_notes: historyTpl.change_notes,
                  modified_by:  historyTpl.last_modified_by || "Admin",
                  saved_at:     historyTpl.updated_at,
                };
                const all = [current, ...(historyTpl.version_history || []).slice().reverse()];

                return all.map((v, idx) => (
                  <div key={`${v.version}-${idx}`}
                    className={`p-3 rounded-lg border-2 ${idx === 0 ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${idx === 0 ? "bg-green-600 text-white" : "bg-gray-500 text-white"}`}>
                          v{v.version}
                        </span>
                        {idx === 0 && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">Current</span>}
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(v.saved_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-[11px] text-gray-400">by {v.modified_by}</span>
                      </div>
                      {idx !== 0 && (
                        <button onClick={() => handleRestoreVersion(historyTpl.id, v.version)}
                          className="h-7 px-3 bg-orange-600 text-white rounded-md text-[11px] font-bold hover:bg-orange-700 flex-shrink-0">
                          Restore
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><span className="font-semibold text-gray-600">Category:</span> {v.category}</div>
                      <div className="col-span-2">
                        <span className="font-semibold text-gray-600">Variables:</span>{" "}
                        <span className="text-blue-600 font-mono text-[10px]">{(v.variables || []).join(", ")}</span>
                      </div>
                      {v.change_notes && (
                        <div className="col-span-2 bg-blue-50 border border-blue-200 rounded p-2">
                          <span className="font-semibold text-gray-600">Notes:</span> {v.change_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}